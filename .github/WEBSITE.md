# Website

The site lives in `web/`: Vite, React, Tailwind CSS and Motion. It deploys to GitHub Pages through
`.github/workflows/pages.yml` on every push to `main` that changes `web/`.

```bash
cd web
npm install
npm run dev       # http://localhost:5173/organizy-app/
npm run build     # type-checks, then writes web/dist
```

## The film

The hero is a short motion film, drawn in React and Motion (`web/src/film/`). Nothing in it is a video file.

- `Film.tsx`: the engine. One clock drives every scene; each scene gets its own local time from 0, so it can be
  paused and chapters can be jumped to. Scenes draw on a fixed canvas (1280 × 720, or 720 × 960 on screens under
  720px) that is scaled to fit. Each scene can enter with a cut, fade, wipe, push, zoom or iris. Reduced motion
  shows a still frame. The film is silent.
- `intros.tsx`: the logo intro ("Messy" snaps into "Sorted.", then the wordmark).
- `DraftTwo.tsx` and `two/`: the kinetic-type scenes. `two/kit.tsx` holds the type and motion pieces.
- `SiteFilm.tsx`: the short cut (default, about 28 s) and the full film (about 77 s), with a toggle.

Review the film with `npx vite build -c vite.film.config.ts`, then serve `web/dist-film/`:
`film-drafts.html?t=12` freezes both cuts at 12 s, and `film-capture.html?cut=full` renders one cut full-bleed
with no controls, for recording to a video.

How it works and the details are still on the page, as text, inside "Prefer to read?" (a `<details>` element), so
screen readers and search engines get the whole story.

## Motion

Components from [SmoothUI](https://smoothui.dev) (MIT) are vendored in `web/src/smoothui/`: Mask Reveal Up,
Scroll Reveal Paragraph, Button Copy (adapted) and spring presets.
Everything respects the visitor's reduced-motion setting.

## Security headers

`web/index.html` sets a Content-Security-Policy: scripts only from the site itself; network requests only to
Supabase (reviews) and the GitHub API (latest release). Styles allow `'unsafe-inline'` because Motion
sets some styles at runtime; scripts do not.

## Reviews

Reviews are stored in Supabase (free tier). Until `web/src/config.ts` has a URL and key, the form shows
"Reviews open with the first release".

1. Create a project at supabase.com.
2. **SQL Editor → New query**, paste `supabase/reviews.sql`, run it.
3. **Project Settings → API**: copy the Project URL and the `anon` public key into `web/src/config.ts`.
4. To publish a review: **Table Editor → reviews**, set `approved` to `true`. Reviews start hidden.

The anon key is public by design. The SQL limits it to inserting name, rating and body (always unapproved) and
reading approved reviews. It can't read the queue, approve, edit or delete.

## Fonts

Bodoni Moda and Jost, self-hosted subsets in `web/public/fonts/` (SIL Open Font License).

## Hero backdrop

`web/src/Backdrop.tsx`: the hero's accent glow (drifts, leans toward the pointer) over a faint grid of rounded tiles. Decorative, hidden from assistive tech.
