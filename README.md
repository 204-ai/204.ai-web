# 204 · NO-CONTENT — studio site

Production site for the 204 · NO-CONTENT creative technology studio in Lisbon,
in the "Cinematic" design ported from the Site v2 prototype in
[`design/cinematic/`](design/DESIGN.md).

Stack: Vite + React 19 + TypeScript, react-router SPA, CSS Modules, fonts
self-hosted via @fontsource (Anton SC, Poppins, Cutive Mono), media
self-hosted in `public/media/`. The site is static; the contact form posts to
a Firebase Cloud Function when one is configured (`functions/`).

## Develop

```bash
npm install
npm run dev        # dev server; /ds.html renders the design primitives
```

## Build & verify

```bash
npm run build      # typecheck + production build → dist/, then generate-meta
npm run lint       # eslint
npm test           # vitest (content model, media pipeline, helpers)
node scripts/media-audit.mjs     # media: nothing orphaned, missing or over budget

# browser checks need Chrome installed and the preview on :4573
npm run preview -- --port 4573 &
node scripts/v6-check.mjs        # no horizontal overflow, every route, 4 widths
node scripts/a11y-check.mjs      # reduced motion, hidden-tab pause, keyboard focus
node scripts/meta-parity.mjs     # static share meta = runtime head, every route
node scripts/url-check.mjs --base http://localhost:4573   # every v1 URL resolves
node scripts/player-probe.mjs    # home hero rotator
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`:

- **Firebase Hosting** (primary, canonical) — https://studio204-web.web.app.
  `firebase.json` carries the cache headers and the 301s for retired URLs;
  `npm run build` regenerates the redirect list, so commit it after content
  changes that add aliases or redirects.
- **GitHub Pages** (secondary) — https://204-ai.github.io/204.ai-web/, built
  with `VITE_BASE=/204.ai-web/`. Retired URLs get small stub pages there.

## Editing content (no code required)

All copy and data live in **`content/*.json`**: works, services, people and
studio settings, plus an optional `redirects.json` for removed pages. Ref
codes, URLs, related work, stats, share meta, the sitemap and the redirects
all derive from those files at build time, and the build fails with a precise
message when the content breaks a rule (an unknown practice, a duplicate slug,
a redirect pointing nowhere). `CLAUDE.md` lists every field and the common
recipes.

## Layout

- `content/*.json` — all content
- `src/data/` — loader (`studio.ts`) and the content model and validation
  (`content.ts`)
- `src/pages/` — Home, Work, WorkDetail, Services, ServiceDetail, About,
  MakerDetail, Contact, NotFound
- `src/components/` — the shell (Nav, Cursor, Layout), design primitives in
  `ui/`, and page sections in `home/`, `work/`, `case/`, `service/`
- `src/styles/` — design tokens (`:root` in `global.css`) and the generated
  font faces
- `scripts/` — media pipeline, share-meta generation and the verification
  scripts above
- `design/` — the imported prototypes (Cinematic, and the earlier Night
  Shift), reference only, never bundled
- `SPEC.md` — project spec: goals, constraints, invariants, task ledger, bug log
