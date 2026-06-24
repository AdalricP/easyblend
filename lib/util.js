// Usernames that can't be claimed because they'd collide with real routes.
export const RESERVED = new Set([
  "api", "manage", "create", "edit", "about", "terms", "privacy", "login",
  "signup", "admin", "blendbox", "_next", "favicon.ico", "robots.txt",
  "sitemap.xml", "static", "assets", "public",
]);

export const isValidHandle = (h) => /^[a-zA-Z0-9_.-]{2,30}$/.test(h);

export const isValidEmail = (e) =>
  typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()) && e.length <= 254;

// Hosts we accept. Blend invites are spotify.link; playlists/tracks live on
// open.spotify.com. Anything ending in .spotify.com is also allowed.
const SPOTIFY_HOSTS = new Set([
  "spotify.link",
  "open.spotify.com",
  "play.spotify.com",
  "www.spotify.com",
  "spotify.com",
]);

export function isSpotifyUrl(raw) {
  const s = (raw || "").trim();
  if (!s) return false;
  if (/^spotify:/i.test(s)) return true; // spotify:playlist:… URIs
  let u;
  try {
    u = new URL(s);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  return SPOTIFY_HOSTS.has(host) || host.endsWith(".spotify.com");
}

// Splits a textarea/array into Spotify { valid } and everything-else { invalid },
// trimming blanks and de-duping. Shared by the API (enforcement) and the form
// (live feedback) so both judge links identically.
export const MAX_LINKS_INPUT = 60000; // chars — DoS guard on the raw payload

export function parseLinks(raw) {
  let str = Array.isArray(raw) ? raw.join("\n") : String(raw || "");
  if (str.length > MAX_LINKS_INPUT) str = str.slice(0, MAX_LINKS_INPUT);
  const arr = str.split(/\r?\n/);
  const seen = new Set();
  const valid = [];
  const invalid = [];
  let scanned = 0;
  for (let s of arr) {
    if (++scanned > 1000) break; // bound the work regardless of input shape
    s = (s || "").trim();
    if (!s) continue;
    if (!isSpotifyUrl(s)) {
      if (invalid.length < 50) invalid.push(s);
      continue;
    }
    if (seen.has(s)) continue;
    seen.add(s);
    valid.push(s);
    if (valid.length >= 200) break;
  }
  return { valid, invalid };
}
