import { createClient } from "@libsql/client";

// Local dev: falls back to a SQLite file (zero setup).
// Production (Vercel): set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
const url = process.env.TURSO_DATABASE_URL || "file:blendbox.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(authToken ? { url, authToken } : { url });

let ready;
function ensureSchema() {
  if (!ready) {
    ready = client.batch(
      [
        `CREATE TABLE IF NOT EXISTS pages (
           id             INTEGER PRIMARY KEY AUTOINCREMENT,
           username_key   TEXT    UNIQUE NOT NULL,
           handle         TEXT    NOT NULL,
           email          TEXT    NOT NULL DEFAULT '',
           edit_token     TEXT    NOT NULL,
           visits         INTEGER NOT NULL DEFAULT 0,
           notified_empty INTEGER NOT NULL DEFAULT 0,
           created_at     INTEGER NOT NULL,
           updated_at     INTEGER NOT NULL
         )`,
        `CREATE TABLE IF NOT EXISTS links (
           id       INTEGER PRIMARY KEY AUTOINCREMENT,
           page_id  INTEGER NOT NULL,
           url      TEXT    NOT NULL,
           position INTEGER NOT NULL
         )`,
        `CREATE INDEX IF NOT EXISTS idx_links_page ON links(page_id)`,
        `CREATE TABLE IF NOT EXISTS rate_limits (
           k          TEXT    PRIMARY KEY,
           count      INTEGER NOT NULL,
           expires_at INTEGER NOT NULL
         )`,
        `CREATE INDEX IF NOT EXISTS idx_rl_expires ON rate_limits(expires_at)`,
      ],
      "write"
    );
  }
  return ready;
}

export async function getPageByUsername(handle) {
  await ensureSchema();
  const r = await client.execute({
    sql: "SELECT * FROM pages WHERE username_key = ?",
    args: [String(handle).toLowerCase()],
  });
  const page = r.rows[0];
  if (!page) return null;
  const lr = await client.execute({
    sql: "SELECT * FROM links WHERE page_id = ? ORDER BY position ASC",
    args: [page.id],
  });
  page.links = lr.rows;
  return page;
}

// ── Spots cap ──────────────────────────────────────────────────────────────
export function maxSpots() {
  const n = parseInt(process.env.MAX_SPOTS || "", 10);
  return Number.isFinite(n) && n > 0 ? n : 100;
}

export async function countPages() {
  await ensureSchema();
  const r = await client.execute("SELECT COUNT(*) AS c FROM pages");
  return Number(r.rows[0].c);
}

// ── Account recovery ─────────────────────────────────────────────────────────
export async function getPagesByEmail(email) {
  await ensureSchema();
  const r = await client.execute({
    sql: "SELECT handle, edit_token FROM pages WHERE lower(email) = lower(?) ORDER BY created_at ASC",
    args: [String(email).trim()],
  });
  return r.rows;
}

export async function createPage({ handle, email, editToken, links }) {
  await ensureSchema();
  const now = Date.now();
  const res = await client.execute({
    sql: `INSERT INTO pages (username_key, handle, email, edit_token, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [handle.toLowerCase(), handle, email, editToken, now, now],
  });
  const pageId = Number(res.lastInsertRowid);
  if (links.length) {
    await client.batch(
      links.map((url, i) => ({
        sql: "INSERT INTO links (page_id, url, position) VALUES (?, ?, ?)",
        args: [pageId, url, i],
      })),
      "write"
    );
  }
  return pageId;
}

// Replaces the link pool and email. Refilling clears the "empty" notification
// flag so the owner gets warned again the next time it runs dry.
export async function updatePage(pageId, { email, links }) {
  await ensureSchema();
  await client.batch(
    [
      {
        sql: "UPDATE pages SET email = ?, updated_at = ?, notified_empty = 0 WHERE id = ?",
        args: [email, Date.now(), pageId],
      },
      { sql: "DELETE FROM links WHERE page_id = ?", args: [pageId] },
      ...links.map((url, i) => ({
        sql: "INSERT INTO links (page_id, url, position) VALUES (?, ?, ?)",
        args: [pageId, url, i],
      })),
    ],
    "write"
  );
}

// Single-use: atomically pops (deletes) the next link and returns it, so the
// same invite can never be handed to two visitors. Returns { url, remaining }.
// url is null when the pool is already empty.
export async function consumeLink(pageId) {
  await ensureSchema();
  const popped = await client.execute({
    sql: `DELETE FROM links
            WHERE id = (SELECT id FROM links WHERE page_id = ? ORDER BY position ASC LIMIT 1)
          RETURNING url`,
    args: [pageId],
  });
  const row = popped.rows[0];
  if (!row) return { url: null, remaining: 0 };

  const cnt = await client.execute({
    sql: "SELECT COUNT(*) AS c FROM links WHERE page_id = ?",
    args: [pageId],
  });
  await client.execute({
    sql: "UPDATE pages SET visits = visits + 1 WHERE id = ?",
    args: [pageId],
  });
  return { url: row.url, remaining: Number(cnt.rows[0].c) };
}

export async function markNotified(pageId) {
  await ensureSchema();
  await client.execute({
    sql: "UPDATE pages SET notified_empty = 1 WHERE id = ?",
    args: [pageId],
  });
}

// Fixed-window per-IP rate limiter backed by Turso, so it holds across
// serverless instances. Fails OPEN (allows) on any DB error — this is
// anti-abuse, not auth, so availability wins.
export async function rateLimit({ bucket, ip, limit, windowSec }) {
  try {
    await ensureSchema();
    const now = Date.now();
    const windowId = Math.floor(now / (windowSec * 1000));
    const k = `${bucket}:${ip}:${windowId}`;
    const expires = (windowId + 1) * windowSec * 1000;
    const res = await client.execute({
      sql: `INSERT INTO rate_limits (k, count, expires_at) VALUES (?, 1, ?)
            ON CONFLICT(k) DO UPDATE SET count = count + 1
            RETURNING count`,
      args: [k, expires],
    });
    const count = Number(res.rows[0].count);
    // Occasionally sweep expired counters so the table stays tiny.
    if (Math.random() < 0.02) {
      await client.execute({
        sql: "DELETE FROM rate_limits WHERE expires_at < ?",
        args: [now],
      });
    }
    return { allowed: count <= limit, resetSec: Math.ceil((expires - now) / 1000) };
  } catch (e) {
    console.error("[ratelimit] failed open:", e?.message || e);
    return { allowed: true, resetSec: windowSec };
  }
}
