# Workout Log

Mobile-first, offline-first workout logging PWA. Pick a day, fill in weights/reps, save.
History browses past sessions by date or by exercise with a progression chart.

## Run locally

```
python -m http.server 8000
```

Open `http://localhost:8000` on your phone (same wifi) or in Chrome DevTools device mode.

## Connect Supabase (optional — app works fully offline without this)

Get both values from your Supabase project dashboard → **Settings → API**:
- `SUPABASE_URL` — "Project URL"
- `SUPABASE_ANON_KEY` — "Project API keys" → `anon` `public` key

1. In the Supabase SQL editor, run `supabase/schema.sql` once (creates the `sessions` table).
2. **Local testing:** copy `.env.example` to `.env` and fill in the two values, then run:
   ```
   npm run build
   ```
   This regenerates `config.js` from `.env`. Re-run it any time `.env` changes.
3. **Production (Cloudflare Pages):** set the same two variables in the Pages project's
   environment variables (see below) — the build runs automatically on every push, no local
   step needed.
4. Reload the app. Every save now also syncs to Supabase in the background — saves never wait
   on the network, they write to `localStorage` instantly and sync when possible.

## Deploy to Cloudflare Pages (auto-deploys on every push to GitHub)

In the Cloudflare Pages project settings:

| Setting | Value |
|---|---|
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `/` (repo root) |
| Root directory | `/` |

**Environment variables** (Settings → Environment variables, set for both *Production* and
*Preview*):

| Variable | Value |
|---|---|
| `SUPABASE_URL` | from Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | from Supabase → Settings → API → anon public key |

Once this is set, every `git push` to the connected branch triggers a new build — `npm run
build` regenerates `config.js` from those environment variables, then Cloudflare deploys the
static site. No manual redeploy step.

## Install as an app

Open the deployed Cloudflare Pages URL (or the local dev URL) in Chrome/Safari on your phone →
"Add to Home Screen". It launches fullscreen and works with no connection.

## Editing the plan

All days, exercises, set counts, and rep targets live in `js/plan.js`. Edit that file if your program changes — nothing else needs to change.
