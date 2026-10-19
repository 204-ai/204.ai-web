# 204 · NO-CONTENT — site guide for agents

Production site for the 204 creative technology studio (Lisbon). React 19 +
Vite + TS SPA in the "Cinematic" design (SPEC C16–C18). Every push to `main`
deploys Firebase Hosting (primary, canonical: https://studio204-web.web.app)
and GitHub Pages (secondary: https://204-ai.github.io/204.ai-web/) from
`.github/workflows/deploy.yml`.

`SPEC.md` is the project spec — goals (§G), constraints (§C), invariants (§V),
task ledger (§T), bug log (§B). Read it before structural changes; log new
invariant-worthy bugs in §B.

## Content edits (the common job — no code changes needed)

ALL copy/data lives in `content/*.json` (SPEC I.content; `"schema": 2` in
studio.json). `src/data/studio.ts` loads it and `src/data/content.ts` derives
the model; components never read JSON directly.

- `content/works.json` — project catalog, NEWEST FIRST: title, client,
  practices (service ids, first = primary), year, note, media {still,
  video{mp4}, focus}; optional slug, aliases, place, date, products, body
  (string or paragraph list), collab {label, name}, credits [{name, role,
  handle}], youtube, gallery, logo, wide, format.
- `content/services.json` — `content` and `interactive` pillars; per service:
  id, label, title ("\n" = line break), desc, img, lead, modes [{n, label,
  body}], included, cta; optional slug, aliases, reels, still.
- `content/people.json` — makers: name, role, optional photo/bio/socials
  {instagram, linkedin, web, email} — only set links render.
- `content/studio.json` — name/suffix/tag, logoUrl, contact (+ map {url,
  image?}), heroClips [{work, clip, poster, title?, kind?, place?}], featured
  bands [{work, …overrides}], the allWork band, process (home dial), practice
  (about rows), copy (paragraphs only, `**…**` = bold; headlines and UI labels
  stay in page code), footer {address, socials}, budgetRanges, rnaStudioUrl,
  trustedBy, partners.
- `content/redirects.json` (optional) — `{"/old/path": "/live/path"}` for
  removed pages.

DERIVED — never write these by hand: ids, NC ref codes (position-based,
newest = highest), slugs (title, or `slug`), service numbers per pillar,
format (label of the first practice), related work per service, stats,
redirects (aliases ∪ redirects.json), per-route share meta, sitemap, the
firebase.json 301s. The build fails with a precise message when a practice is
not a service id, a hero clip or featured slug does not resolve, a slug
repeats, or an alias or redirect shadows a live page or points nowhere
(SPEC V26, C20).

Recipes:
- New project → prepend it with `practices`; it appears under each listed
  service, and the codes renumber (expected and fine).
- Feature it on the home hero → add a `heroClips` entry (work slug, clip,
  poster); the featured bands are `featured`.
- Retitle a live project → add its old slug to `aliases`, so the old URL keeps
  working (then commit the regenerated firebase.json).
- Remove a project → add `"/work/<old-slug>": "/work"` to `redirects.json`.
- New maker → append to people.json (photo optional — initials fallback).
- New media → reference `assets/<file>` (originals live in the gitignored
  `media-src/cinematic/`), run `node scripts/media-pipeline.mjs --from
  media-src/cinematic`, then the same with `--rewrite`;
  `node scripts/media-audit.mjs` must pass afterwards.
- Facts only: content comes from the studio's real material. Never invent
  clients, dates or claims. Unknown = "—".

## Verify before pushing

```bash
npm run build   # tsc + vite + generate-meta (50+ static routes, must exit 0)
npm run lint
node scripts/media-audit.mjs     # V22/V15: no orphans, no missing, caps
npm run preview -- --port 4573 &
node scripts/v6-check.mjs        # V6: every route at 4 widths, no overflow or spill (--quick: 5 pages)
node scripts/a11y-check.mjs      # V24/V25: reduced motion, hidden-tab video, keyboard focus
node scripts/player-probe.mjs    # hero player behavior (needs local Chrome)
node scripts/meta-parity.mjs     # V10: static route meta = runtime useHead, all routes
node scripts/url-check.mjs --base http://localhost:4573   # V21: every v1 URL resolves
```

For layout/CSS work, screenshot-verify with puppeteer-core + system Chrome
(pattern used throughout: launch headless, measure getBoundingClientRect,
screenshot). Keep the home fold: hero + strap + CTA above 1080p fold.

## Conventions & landmines

- Design system: Cinematic tokens (SPEC C17) once in `src/styles/global.css`
  `:root`, never re-hardcode hex (SPEC V2). Type (C18): Anton SC
  display (letter-spacing 0), Poppins body, Cutive Mono labels, latin +
  latin-ext faces in `src/styles/fonts.css`. Sizes use `calc(N * var(--px))`:
  exact up to the 1440px comparison width, capped at 1.5×. v2 primitives live
  in `src/components/ui/` (Pill, Marquee, TitleCard, CineCard, LogoLoop,
  ChatCloser, Footer, SecLab, Rich); `npm run dev` → `/ds.html` renders them
  for fidelity checks against the prototype. The organism lab/game keep their
  own Archivo Black + JetBrains Mono.
- Shell: `src/components/Layout.tsx` renders the Nav, Footer, cursor and grain
  around every page; pages own their top spacing under the fixed nav (heroes
  sit beneath it) and fade in like the prototype. Wrap page roots in
  `className="v2"` for the prototype reset.
- `design/` = imported claude.ai/design prototype + Webflow scrape snapshot
  (`design/scrape/extracted.json`). Read-only reference; never imported by
  app code (SPEC V9).
- Media is SELF-HOSTED in `public/media/` (SPEC V4) through
  `scripts/media-pipeline.mjs` (role renditions -p-800/-p-500/-p-320/-p-160,
  byte-stable names, V27); pages pick them with `rendition()` in srcsets.
  Images carry intrinsic `width`/`height` (SPEC V30): `imgDims(url)` from
  `src/lib/dims.ts` reads `virtual:media-dims`, which `vite.config.ts` derives
  from `scripts/media-manifest.json` at build time (nothing to regenerate).
- Animations: transform/opacity only, gated behind
  `prefers-reduced-motion: no-preference`. Entrances are the prototype's
  reveals (`r-up` / `r-in` / `r-scale` with `d-1`…`d-6` delays) plus the page
  fade. Infinite motion (loops, hero rotator, process dial, clips, cursor) is
  static under reduced motion and pauses in a hidden tab (V24; `a11y-check`).
  Loops use `overflow: clip`, never hidden. `<main>` has `overflow: clip` —
  transformed entrances must not grow the scrollable area (§B: scrollbar
  flash); `v6-check` therefore ignores it when looking for spills.
- Ref-callback gotcha: callbacks feeding player state must be identity-stable
  (memoized) — React 19 reruns ref cleanup on identity change (§B5).
  `<video>` needs `key={src}` to actually switch footage; mp4 before webm
  (Webflow webm reports Infinity duration).
- Titles: pages pass bare names; `useHead` + `scripts/generate-meta.mjs`
  apply the single brand rule (detail pages add `· Work/Service/Maker`).
  Keep BOTH in sync. Descriptions come from the `describe` helpers in
  `src/data/content.ts`, used by the pages and generate-meta alike;
  `scripts/meta-parity.mjs` proves the two agree.
- Retired URLs: aliases and `content/redirects.json` become GH Pages stub
  pages and Firebase 301s. `npm run build` regenerates `firebase.json`
  `hosting.redirects`; commit it (CI fails the build when it is stale). Slugs, codes and content validation are not mirrored:
  generate-meta imports `src/data/content.ts` (Node type stripping).
- Analytics: GA4 `G-E2HCBBXBVP` (same property as the old Webflow site).
  Track via `src/lib/analytics.ts` only; keep event names stable.
- GH Pages: deep links are real files (generate-meta) → 301 to trailing
  slash → 200. `VITE_BASE`/`SITE_URL` env drive base path + canonical/sitemap;
  when the real domain lands, update both in the deploy workflow.

## Don'ts

- Don't edit `SPEC.md` §T/§B casually — status flips and bug rows only, with
  the work they describe.
- Don't add runtime third-party requests beyond the documented exceptions
  (CDN media, GA4, click-to-load youtube/OSM).
- Don't break URLs: slugs derive from titles — renaming a title changes its
  URL. If a live title must change, discuss redirects first.
