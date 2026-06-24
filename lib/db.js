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
           id           INTEGER PRIMARY KEY AUTOINCREMENT,
           username_key TEXT    UNIQUE NOT NULL,
           handle       TEXT    NOT NULL,
           display_name TEXT    NOT NULL DEFAULT '',
           edit_token   TEXT    NOT NULL,
           cursor       INTEGER NOT NULL DEFAULT 0,
           visits       INTEGER NOT NULL DEFAULT 0,
           created_at   INTEGER NOT NULL,
           updated_at   INTEGER NOT NULL
         )`,
        `CREATE TABLE IF NOT EXISTS links (
           id       INTEGER PRIMARY KEY AUTOINCREMENT,
           page_id  INTEGER NOT NULL,
           url      TEXT    NOT NULL,
           position INTEGER NOT NULL
         )`,
        `CREATE INDEX IF NOT EXISTS idx_links_page ON links(page_id)`,
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

export async function createPage({ handle, displayName, editToken, links }) {
  await ensureSchema();
  const now = Date.now();
  const res = await client.execute({
    sql: `INSERT INTO pages (username_key, handle, display_name, edit_token, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [handle.toLowerCase(), handle, displayName, editToken, now, now],
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

export async function updatePage(pageId, { displayName, links }) {
  await ensureSchema();
  await client.batch(
    [
      {
        sql: "UPDATE pages SET display_name = ?, updated_at = ?, cursor = 0 WHERE id = ?",
        args: [displayName, Date.now(), pageId],
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

// Picks the next link in rotation and advances the cursor so the next
// visitor gets a fresh one. Loops back to the start when the pool runs out.
export async function nextLinkForVisit(page) {
  if (!page.links || page.links.length === 0) return null;
  const idx = Number(page.cursor) % page.links.length;
  const url = page.links[idx].url;
  await client.execute({
    sql: "UPDATE pages SET cursor = cursor + 1, visits = visits + 1 WHERE id = ?",
    args: [page.id],
  });
  return url;
}
