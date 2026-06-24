// Usernames that can't be claimed because they'd collide with real routes.
export const RESERVED = new Set([
  "api", "manage", "create", "edit", "about", "terms", "privacy", "login",
  "signup", "admin", "blendbox", "_next", "favicon.ico", "robots.txt",
  "sitemap.xml", "static", "assets", "public",
]);

export const isValidHandle = (h) => /^[a-zA-Z0-9_.-]{2,30}$/.test(h);

// Accepts an array or a newline-separated string; keeps only valid-looking
// links (http(s):// or spotify:) and trims/dedupes, capped at 200.
export function normalizeLinks(raw) {
  const arr = Array.isArray(raw) ? raw : String(raw || "").split(/\r?\n/);
  const seen = new Set();
  const out = [];
  for (let s of arr) {
    s = (s || "").trim();
    if (!s || seen.has(s)) continue;
    if (!/^https?:\/\//i.test(s) && !/^spotify:/i.test(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= 200) break;
  }
  return out;
}
