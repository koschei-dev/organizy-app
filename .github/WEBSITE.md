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

`web/src/demo/` is a scripted screen recording of Organizy, drawn in React from the app's screenshots. Nothing in
it is clickable. A cursor lassoes eight files on a desktop, drops them on the window, changes one destination to a
new Recipes folder and teaches it, moves the files, then a week later drops a similar file that goes to Recipes.

- `script.ts`: the files, the timeline (`K`, in seconds), the window geometry and the cursor path. Everything on
  screen is derived from one time value, so the timeline is the only thing to edit when the story changes.
- `AppWindow.tsx`: the Organize screen at a fixed 820 × 560, scaled as one piece.
- `Player.tsx`: turns time into state, the stage, the camera, the desktop.
- `Reel.tsx`: the section's player. It loops while on screen, has a pause button, and on screens under 720px
  wide a camera follows the action (`PHONE_SHOTS`) so the app stays readable. Reduced motion shows the last frame.

Reasons shown in the demo follow the app's wording (`RuleEngine.swift`, `Learning.swift`). If the app's default
folders or reason strings change, update `script.ts` and the Reasons card in `App.tsx`.

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

## Hero motion

- `web/src/Backdrop.tsx`: the hero's accent glow (drifts, leans toward the pointer) over a faint grid of rounded tiles. Decorative, hidden from assistive tech.
- The hero wordmark settles back (smaller, lighter) as you scroll past, using `useScroll`.
