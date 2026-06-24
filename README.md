# easyblend

Claim `easyblend.xyz/yourname`, drop in a pool of Spotify **Blend** invite links, and
share one link. Each visitor is redirected to a fresh invite — links are **single-use**:
once handed out, an invite is removed from the pool. When the pool runs dry, the owner
gets an email to refill it.

Built with **Next.js (App Router)** + **libSQL/Turso** (SQLite-compatible) + **Resend**
(email). The same code runs locally against a SQLite file and in production against Turso.

## How it works

- `/` → create a page (pick a username, add your email, paste links).
- `GET /:username` → renders an "Opening a fresh blend…" screen. The actual invite is
  popped **client-side** via `POST /api/pages/:username/next`, so SEO/link-preview bots
  that fetch the URL don't burn real invites. The pop is atomic (`DELETE … RETURNING`), so
  the same invite can never go to two people.
- When the **last** invite is claimed, the owner is emailed once to refill. Refilling via
  the manage page re-arms that notification.
- `/manage?u=…&token=…` → edit email + remaining links. The secret token is returned once
  at creation — it's the only way to edit, so save it.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

With no env vars set it uses a local `blendbox.db` SQLite file and just logs the refill
email instead of sending it — no accounts needed to develop.

1. Open http://localhost:3000, pick a username + email, paste a few links, create.
2. Copy the **private manage link** shown (you need it to edit later).
3. Visit `http://localhost:3000/<username>` — each visit consumes one invite; when empty
   you'll see "All blends claimed."

## Deploy to Vercel (easyblend.xyz)

SQLite files don't persist on Vercel's serverless filesystem, so production uses
[Turso](https://turso.tech) (free tier is plenty):

```bash
# Install the Turso CLI, then:
turso db create easyblend
turso db show easyblend --url           # -> TURSO_DATABASE_URL  (libsql://…)
turso db tokens create easyblend        # -> TURSO_AUTH_TOKEN
```

For email, create a [Resend](https://resend.com) account and an API key. In Vercel →
Project → **Settings → Environment Variables**, add:

| Key                   | Value                                   | Required |
| --------------------- | --------------------------------------- | -------- |
| `TURSO_DATABASE_URL`  | `libsql://easyblend-….turso.io`         | yes      |
| `TURSO_AUTH_TOKEN`    | the token from above                    | yes      |
| `RESEND_API_KEY`      | `re_…` from Resend                      | for email|
| `EMAIL_FROM`          | e.g. `easyblend <noreply@yourdomain>`   | for email|

> Without `RESEND_API_KEY` the app still works — it just skips (and logs) the refill
> email. Resend's default `onboarding@resend.dev` sender only delivers to your own
> account email; verify a domain in Resend to email anyone.

Then:

```bash
npm i -g vercel
vercel            # first deploy
vercel --prod     # production
```

Finally, add `easyblend.xyz` as a domain in the Vercel project and point your DNS at
Vercel. Schema tables are created automatically on first request.

## Notes / possible next steps

- **No auth** — usernames are first-come, first-served, guarded by the secret manage
  token. Add real accounts if you want recoverable ownership.
- **Single-use links** — an invite is deleted the moment it's served. A "running low"
  warning email (e.g. at 2 remaining) would be an easy add alongside the empty notice.
- Validation accepts any `http(s)://` or `spotify:` link, not only Spotify domains —
  tighten `normalizeLinks` in `lib/util.js` if you want to hard-restrict to Spotify.
