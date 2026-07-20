# 204 · NO-CONTENT — studio site

Production site for the 204 · NO-CONTENT creative studio, implementing
Direction A "Night Shift" (cinematic noir) from the design prototype in
[`design/`](design/DESIGN.md).

Stack: Vite + React 19 + TypeScript, react-router SPA, CSS Modules,
self-hosted fonts via @fontsource. No backend — fully static.

## Develop

```bash
npm install
npm run dev        # dev server
```

## Build & verify

```bash
npm run build      # typecheck + production build → dist/
npm run lint       # eslint
npm run preview    # serve dist/ locally

# responsive/overflow + per-route title probe (needs Chrome installed,
# and `npm run preview` running on :4573)
npm run preview -- --port 4573 &
node scripts/v6-check.mjs
```

## Deploy

`dist/` is the deployable artifact. SPA fallback is preconfigured:

- **Cloudflare Pages / Netlify** — `public/_redirects` (`/* /index.html 200`)
- **Vercel** — `vercel.json` rewrite

Build command `npm run build`, output directory `dist`.

## Layout

- `src/data/studio.ts` — all content (works, services, people, copy)
- `src/components/` — CinematicStill (SVG scene placeholders), Nav, Cursor, Layout
- `src/pages/` — Home, Work, Services, About, Contact, NotFound
- `src/styles/global.css` — design tokens (`:root` CSS vars) + reset
- `design/` — imported claude.ai/design prototype, reference only, never bundled
- `SPEC.md` — project spec (goals, invariants, task ledger)

The `CinematicStill` scenes are intentional placeholders — swap for real
`<video>`/`<img>` footage when available (see `design/DESIGN.md`).
