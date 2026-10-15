# Website setup

The site lives in `site/` (plain HTML, CSS and JS, no build step) and deploys to GitHub Pages through
`.github/workflows/pages.yml` on every push to `main` that changes it.

One-time setup:
1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Push to `main`, or run the "Deploy website" workflow by hand. The site appears at
   `https://giancarloguzmann-commits.github.io/organizy-app/`.

Preview locally: `python3 -m http.server -d site 8000`, then open http://localhost:8000.

The page sets a Content-Security-Policy in a `<meta>` tag: scripts and styles only from the site itself (plus Google
Fonts), network requests only to Supabase. Keep scripts in `app.js`; inline `<script>` and `style=""` attributes are blocked.

## Reviews

Reviews are stored in Supabase (free tier). Until `site/config.js` has a URL and key, the form shows "opening soon".

1. Create a project at supabase.com.
2. **SQL Editor → New query**, paste `supabase/reviews.sql`, run it.
3. **Project Settings → API**: copy the Project URL and the `anon` public key into `site/config.js`.
4. To publish a review: **Table Editor → reviews**, set `approved` to `true`. Reviews start hidden.

The anon key is public by design. The SQL limits it to inserting name, rating and body (always unapproved) and
reading approved reviews. It can't read the queue, approve, edit or delete. Links are rejected by the database and
the form, and the form has a honeypot field and a 10-minute per-browser cooldown. For heavier spam, add Cloudflare
Turnstile verified in a Supabase Edge Function.
