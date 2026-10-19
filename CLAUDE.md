# 204 · NO-CONTENT — site guide for agents

Production site for the 204 creative technology studio (Lisbon). React 19 +
Vite + TS SPA, deployed to GitHub Pages on every push to `main` (workflow in
`.github/workflows/deploy.yml`). Live: https://204-ai.github.io/204.ai-web/

`SPEC.md` is the project spec — goals (§G), constraints (§C), invariants (§V),
task ledger (§T), bug log (§B). Read it before structural changes; log new
invariant-worthy bugs in §B.

## Content edits (the common job — no code changes needed)

ALL copy/data lives in `content/*.json`. `src/data/studio.ts` is only the
typed schema + derivation layer on top; components never read JSON directly.
On branch `v2-cinematic`, `content/*.json` is v2 since T52: see "v2 content
schema" below. The field list right here describes v1, as on `main`.

- `content/works.json` — project catalog, NEWEST FIRST. Fields per entry:
  title, client, cat (`interactive|mapping|branded|artistic`), year, runtime,
  note (one-liner), scene (`cathedral|desert|interior|water` — placeholder art
  fallback), optional: media {still, video{webm,mp4}}, body (longform),
  youtube [ids], gallery [urls].
- `content/services.json` — pillars `content` + `interactive`; per service:
  n, label, scene, body, optional still/video/intro/modes/features/relatedCat.
- `content/people.json` — makers: name, role, optional photo/bio/socials
  {instagram, linkedin, web, email} — only set links render.
- `content/studio.json` — site settings: name/tag, contact, logoUrl,
  heroChapters (work SLUGS, reel order), workCategories (filter order),
  budgetRanges, practice rows, pillarsCount.

DERIVED — never write these by hand: ids, NC ref codes (position-based,
newest = highest), slugs (from title), ledger count, category filters, about
stats, per-route share meta, sitemap. Add/edit JSON → everything follows on
build.

Recipes:
- New project → prepend (or insert chronologically) in works.json. Codes
  renumber automatically; that is expected and fine.
- Feature it on the home reel → add its slug to studio.json heroChapters.
- New maker → append to people.json (photo optional — initials fallback).
- Facts only: content comes from the studio's real material. Never invent
  clients, dates or claims. Unknown = "—".

### v2 content schema (branch `v2-cinematic`, SPEC I.content)

`"schema": 2` in `content/studio.json` switches the loader: `src/data/content.ts`
builds the v2 model (exported as `CONTENT`), and the Night Shift pages keep
reading the old exports through `src/data/compat.ts` until T53–T60 replace
them. Since T52 the live `content/*.json` is v2 and its media paths point at
pipeline outputs in `public/media/`. To add media, reference `assets/<file>`
(originals live in the gitignored `media-src/cinematic/`), then run
`node scripts/media-pipeline.mjs --from media-src/cinematic` and the same with
`--rewrite`; `node scripts/media-audit.mjs` must pass afterwards.

- `works.json`: title, client, practices (service ids, first = primary), year,
  note, media {still, video{mp4}, focus}; optional slug, aliases, place, date,
  products, body (string or paragraph list), collab {label, name}, credits
  [{name, role, handle}], youtube, gallery, logo, wide, format.
- `services.json`: `content` and `interactive` pillars; per service id, label,
  title ("\n" = line break), desc, img, lead, modes [{n, label, body}],
  included, cta; optional slug, aliases, reels, still.
- `people.json`: unchanged.
- `studio.json`: the v1 settings minus heroChapters, workCategories and
  pillarsCount, plus schema 2, heroClips [{work, clip, poster, title, kind,
  place}], featured bands [{work, title, label, poster, clip, focus}] (all but
  `work` optional, defaulting to the work), the allWork band, process (home
  dial), copy (paragraphs only, `**…**` = bold; headlines and UI labels stay in
  page code), footer {address, socials}, contact.map {url, image}.
- `redirects.json` (optional): `{"/old/path": "/live/path"}` for removed pages.

Derived, never hand-written: ids, NC codes, slugs (title, or `slug`), service
numbers per pillar, format (label of the first practice), related work per
service, stats, redirects (aliases plus redirects.json). The build fails with
a precise message when a practice is not a service id, a hero clip or featured
slug does not resolve, a slug repeats, or an alias or redirect shadows a live
page or points nowhere (SPEC V26, C20).

v2 recipes:
- New project → prepend it with `practices`; it appears under each listed
  service automatically.
- Retitle a live project → add its old slug to `aliases`, so the old URL
  keeps working.
- Remove a project → add `"/work/<old-slug>": "/work"` to `redirects.json`.

## Verify before pushing

```bash
npm run build   # tsc + vite + generate-meta (50+ static routes, must exit 0)
npm run lint
node scripts/media-audit.mjs     # V22/V15: no orphans, no missing, caps
npm run preview -- --port 4573 &
node scripts/v6-check.mjs        # overflow + per-route titles at 4 widths
node scripts/player-probe.mjs    # hero player behavior (needs local Chrome)
```

For layout/CSS work, screenshot-verify with puppeteer-core + system Chrome
(pattern used throughout: launch headless, measure getBoundingClientRect,
screenshot). Keep the home fold: hero + strap + CTA above 1080p fold.

## Conventions & landmines

- Design system (branch `v2-cinematic`): Cinematic tokens (SPEC C17) once in
  `src/styles/global.css` `:root`, never re-hardcode hex (SPEC V2); the old
  Night Shift token names are aliases there until T65. Type (C18): Anton SC
  display (letter-spacing 0), Poppins body, Cutive Mono labels, latin +
  latin-ext faces in `src/styles/fonts.css`. Sizes use `calc(N * var(--px))`:
  exact up to the 1440px comparison width, capped at 1.5×. v2 primitives live
  in `src/components/ui/` (Pill, Marquee, TitleCard, CineCard, LogoLoop,
  ChatCloser, Footer, SecLab, Rich); `npm run dev` → `/ds.html` renders them
  for fidelity checks against the prototype. The organism lab/game keep their
  own Archivo Black + JetBrains Mono.
- Shell (T54): `src/components/Layout.tsx` renders the v2 Nav, Footer, cursor
  and grain around every page. When a page is rebuilt in v2, add its route to
  `V2_PAGES` there: that drops the Night Shift top padding (v2 heroes sit under
  the fixed nav) and swaps the entrance for the prototype's page fade. Wrap v2
  page roots in `className="v2"` for the prototype reset.
- `design/` = imported claude.ai/design prototype + Webflow scrape snapshot
  (`design/scrape/extracted.json`). Read-only reference; never imported by
  app code (SPEC V9).
- Media is SELF-HOSTED in `public/media/` (SPEC V4; migrated via
  `scripts/media-pipeline.mjs` — rerun-safe if new Webflow URLs appear in
  content). Non-hero stills use `-p-800` renditions with onError fallback.
  v2 images carry intrinsic `width`/`height` (SPEC V30): `imgDims(url)` from
  `src/lib/dims.ts` reads `virtual:media-dims`, which `vite.config.ts` derives
  from `scripts/media-manifest.json` at build time (nothing to regenerate).
- Animations: transform/opacity only, gated behind
  `prefers-reduced-motion: no-preference`. Entrance choreography: h1 is the
  only riser; media fades w/ scale-settle; secondary fades late; pagers wipe
  directionally. `<main>` has `overflow: clip` — transformed entrances must
  not grow the scrollable area (§B: scrollbar flash).
- Ref-callback gotcha: callbacks feeding player state must be identity-stable
  (memoized) — React 19 reruns ref cleanup on identity change (§B5).
  `<video>` needs `key={src}` to actually switch footage; mp4 before webm
  (Webflow webm reports Infinity duration).
- Titles: pages pass bare names; `useHead` + `scripts/generate-meta.mjs`
  apply the single brand rule (detail pages add `· Work/Service/Maker`).
  Keep BOTH in sync. Slugs, codes and content validation are not mirrored:
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
