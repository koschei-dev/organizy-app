# Website

The site lives in `web/`: Vite, React, Tailwind CSS and Motion. It deploys to GitHub Pages through
`.github/workflows/pages.yml` on every push to `main` that changes `web/`.

```bash
cd web
npm install
npm run dev       # http://localhost:5173/organizy-app/
npm run build     # type-checks, then writes web/dist
```

## The demo

`web/src/demo/` is Organizy's window rebuilt in React from the app's screenshots: Organize, Rules,
History and Settings. It runs the app's real default rules (`web/src/engine.ts`, ported from
`RuleEngine.swift` and `DefaultRules`) on the app's sample folder (`web/src/sample-files.json`, extracted
from `scripts/make-ai-test-folder.sh`). Rules alone sort 15 of 21 sample files correctly and rules plus
AI 20 of 21, the same as the app's own comparison. With Local AI on, the demo uses the answers the model
gave on that folder; there is no model in the browser.

If the default rules or the sample folder change in the app, update `engine.ts` and `sample-files.json`.

## Motion

Components from [SmoothUI](https://smoothui.dev) (MIT) are vendored in `web/src/smoothui/`: Mask Reveal Up,
Scroll Reveal Paragraph, Button Copy (adapted), Fluid Hover Highlight and its spring presets.
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

## Hero and flow motion

- `web/src/Backdrop.tsx`: the hero's accent glow (drifts, leans toward the pointer) over a faint grid of rounded tiles. Decorative, hidden from assistive tech.
- The hero wordmark settles back (smaller, lighter) as you scroll past, using `useScroll`.
- `web/src/Flow.tsx`, "Files in. Folders out.": five files flow along dotted paths into the app, the plan appears, then after a confirm the files flow into folders. One geometry drives both the horizontal (desktop) and vertical (phone) layouts, and the dots ride the drawn paths with `getPointAtLength`. The loop only runs while the section is in view; with reduced motion it shows the finished state.
