# BlendBox

Claim `blendbox.xyz/yourname`, drop in a pool of Spotify **Blend** invite links, and
share one link. Every visitor to your page is redirected to a **fresh** blend invite —
the app rotates through your pool round-robin so each person gets the next one.

Built with **Next.js (App Router)** + **libSQL/Turso** (SQLite-compatible). The same
code runs locally against a SQLite file and in production against Turso.

## How it works

- `GET /:username` → looks up the page, picks `links[cursor % links.length]`, increments
  the cursor (so the next visitor gets a fresh link), and shows a brief "Opening your
  blend…" screen that redirects to Spotify.
- `/` → create a page (pick a username, paste links).
- `/manage?u=…&token=…` → edit a page. The secret token is returned once at creation —
  it's the only way to edit, so save it.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

With no env vars set it uses a local `blendbox.db` SQLite file — no accounts needed.

1. Open http://localhost:3000, pick a username, paste a few links, create.
2. Copy the **private manage link** shown (you need it to edit later).
3. Visit `http://localhost:3000/<username>` repeatedly — you'll cycle through your links.

## Deploy to Vercel (blendbox.xyz)

SQLite files don't persist on Vercel's serverless filesystem, so production uses
[Turso](https://turso.tech) (free tier is plenty):

```bash
# Install the Turso CLI, then:
turso db create blendbox
turso db show blendbox --url           # -> TURSO_DATABASE_URL  (libsql://…)
turso db tokens create blendbox        # -> TURSO_AUTH_TOKEN
```

In Vercel → Project → **Settings → Environment Variables**, add:

| Key                   | Value                         |
| --------------------- | ----------------------------- |
| `TURSO_DATABASE_URL`  | `libsql://blendbox-….turso.io`|
| `TURSO_AUTH_TOKEN`    | the token from above          |

Then:

```bash
npm i -g vercel
vercel            # first deploy
vercel --prod     # production
```

Finally, add `blendbox.xyz` as a domain in the Vercel project and point your DNS at
Vercel. Schema tables are created automatically on first request.

## Notes / possible next steps

- **No auth** — usernames are first-come, first-served, guarded by the secret manage
  token. Add real accounts if you want recoverable ownership.
- **Rotation loops** when the pool is exhausted (visitor N+1 wraps to link 1). If Spotify
  blend invites are single-use for you, just keep the pool topped up via the manage page.
- Validation accepts any `http(s)://` or `spotify:` link, not only Spotify domains —
  tighten `normalizeLinks` in `lib/util.js` if you want to hard-restrict to Spotify.
