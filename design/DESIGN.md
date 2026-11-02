# 204 · NO-CONTENT — design reference (imported from claude.ai/design "204 test")

Two side-by-side design directions for a creative-studio portfolio site, built as
interactive HTML/React prototypes on a pannable design canvas.

**This folder is reference material only — not the production site.**

**v2 (2026-10-19):** `design/cinematic/` holds the "Cinematic" redesign that replaces
Direction A for the v2 build. See the v2 section at the end; everything before it documents v1.

**History:** Direction A "Night Shift" was the production design of v1 (SPEC T1–T45). The app
dropped its components, type helpers, entrance choreography and token aliases in T65; its
prototype files stay in this folder as history. The organism lab and game pages keep the
Night Shift faces (Archivo Black, JetBrains Mono).
Source: https://claude.ai/design/p/de92b4be-ded4-4e8e-8519-4d42e0325ace

## Running the prototype locally
No build step. It's plain HTML + Babel-in-browser JSX. Serve the folder and open `index.html`:

```bash
npx serve .        # or: python3 -m http.server
```

Open the printed URL. (Opening `index.html` via `file://` will fail because the
browser blocks loading the `.jsx` files — always serve over http.)

## File map
- `index.html` — entry point. Loads React 18 + Babel standalone, then the scripts below.
- `design-canvas.jsx` — starter component: the pan/zoom canvas that hosts both directions
  as side-by-side "artboards". Do not edit unless changing canvas behavior.
- `shared.jsx` — shared data + tokens: `STUDIO`, `WORKS`, `CATEGORIES`, `SERVICES`,
  and the `PlaceholderCard` helper. Each work/service carries a `scene` key
  (`cathedral` | `desert` | `interior` | `water`).
- `direction-a.jsx` — **Direction A "Night Shift"** — cinematic noir. The primary /
  preferred direction. Full-bleed 16:9 hero player with a chapter rail, custom cursor,
  5 pages (home/work/services/about/contact), ledger table with per-row scene
  backgrounds + autoplaying hover preview cards, service cards with scene backgrounds.
- `direction-b.jsx` — **Direction B "Archive"** — editorial / Swiss grid, serif+mono.
- `app.jsx` — mounts both directions into the canvas and wires the Tweaks panel (accent color).

## Architecture notes
- Each `<script type="text/babel">` is its own scope. Shared components are published to
  `window` via `Object.assign(window, {...})` at the end of each file.
- Style objects are locally named (e.g. no bare `const styles`) to avoid collisions.
- `CinematicStill` (in `direction-a.jsx`) fakes film footage with graded gradients +
  SVG silhouettes + animated grain. Pass `playing` for Ken-Burns drift (used in hover
  cards), `mini` for the low-noise thumbnail variant. **Replace with real `<video>`/`<img>`
  when actual footage is available.**

## Fidelity
High-fidelity. Final colors, type, spacing, and interactions are intentional.
Direction A is the chosen direction; Direction B is kept for comparison.

## Design tokens (Direction A)
- Background `#0a0a0a`, foreground `#ececec`, dim `rgba(236,236,236,0.55)`,
  hairline `rgba(236,236,236,0.14)`, accent `#c9442b` (tweakable).
- Type: Archivo Black (display), Space Grotesk (body), JetBrains Mono (labels),
  Instrument Serif (accents/quotes).

## Real content scrape (2026-07-20)
`design/scrape/extracted.json` = text/meta/asset snapshot of the live Webflow site
(204-no-content.webflow.io, both pillars + subpages). Source of truth for real copy,
projects, team, contact + hotlinked media in `src/data/studio.ts` (SPEC §C10).

## v2 — Cinematic (`design/cinematic/`)

The "Cinematic" redesign is the chosen direction for v2 (SPEC §G, C16). It supersedes
Direction A "Night Shift" above, which stays in this folder as v1 history. The same rules
apply as for the rest of this folder: read-only reference, never imported by app code, and
outside every tsconfig, eslint and vite input (SPEC C5, V9). Porting rules live in SPEC.md
(C16–C22, V21–V30, T46–T65).

### Source
- claude.ai/design standalone export. `index.html` still carries the exporter's
  `__resources` asset shim and `__bundler_thumbnail` template. The export holds no
  project URL.
- Files dated 2026-09-23. Dropped into the repo root as `204-site/` on 2026-10-19 and
  moved here by SPEC T46, byte-identical (sha1-checked). `204-site/` is gitignored, so a
  re-drop can never be committed (SPEC V22).
- Page title "204 — Cinematic Prototype", footer label "Site v2 — Cinematic".
  `README.txt` is the export's own readme, kept verbatim.

### Assets and running it
The 463 originals (232 jpg, 207 png, 22 mp4, 1 gif, 1 avif; 1.36 GiB, 1,456,581,636 bytes) live in the
gitignored `media-src/cinematic/` folder, which is the media pipeline's source (SPEC C21,
T47). They are not in git. `design/cinematic/assets` is a gitignored local symlink to that
folder, so the prototype serves with its media:

```bash
ln -s ../../media-src/cinematic design/cinematic/assets   # once per checkout, if missing
python3 -m http.server 4599 --directory design/cinematic
```

`npx serve --symlinks design/cinematic` also works. Without `--symlinks`, serve answers 404
for everything under `assets/`, because serve-handler disables symlinks by default. Without
`media-src/cinematic/` the pages render with no media. The page loads React 18.3.1 (dev
build) and Babel standalone from unpkg, and its fonts from Google Fonts, at runtime. That is
prototype-only: production bundles and self-hosts everything (SPEC V1, C18).

### File map
Load order follows `index.html`. Each file publishes its components on `window`.
- `index.html` — entry. Exporter asset shim, Google Fonts (Anton SC, Cutive Mono,
  Poppins 200–700), unpkg React 18.3.1 dev + Babel 7.29.0, then the jsx files.
- `shared.jsx` — Nav (turns solid after 60px of scroll; hover dropdown All / .content /
  .interactive), CursorDot (ring + dot on rAF), Marquee, TitleCard, Pill, CineCard,
  CreditsBlock, Footer, `assetUrl()`.
- `home.jsx` — `HERO_CLIPS` (6, rotator with progress bar and dots), `SERVICES`
  (10, the practice taxonomy, `window.SERVICES`), `FEATURED` (3 work bands plus an
  "Other projects" band), `PROCESS_STEPS` (4, dial that auto-advances every 4.2 s),
  `TRUSTED` (20 logos), `PARTNERS` (3), service loop, logo loops, chat closer.
- `services.jsx` — two pillar grids (`.content`, `.interactive`) from `window.SERVICES`.
- `service-detail.jsx` — `SERVICE_DETAIL` (10 entries: idx, pillar, title, lead,
  modes, included, works, cta), `SD_REELS` (reel lists for 6 practices), reel rotator
  with progress bars, next-service pager.
- `about.jsx` — `MAKERS` (6, with socials and emails), `PRACTICE` (4),
  colophon, RnA Studio card.
- `maker.jsx` — maker page with portrait, social icons and prev/next.
- `portfolio.jsx` — `FILTERS` (10 practices), `WORKS` (37, `window.WORKS`),
  multi-select filter, card grid sorted by year at runtime.
- `case.jsx` — `CASE_DETAIL` (37 entries: longform, date, place, products, collab,
  credits, galleries), `CaseGallery` (masonry), `CLIENT_LOGOS` (20), case page with a
  YouTube lightbox.
- `contact.jsx` — `BUDGETS` (5), contact rows, static map image, mailto brief form.
- `app.jsx` — state router (a `page` string, no URLs), 380 ms black fade between pages,
  grain overlay, cursor.
- `styles.css` — every token and component (1554 lines).

### Tokens (`styles.css` `:root`, mirrored in SPEC C17/C18)
- paper `#EFEFEF`, ink `#151515`, ink-95 `#0a0a0a` (page background), ink-90 `#1a1a1a`,
  ink-85 `#222`, ink-70 `#3a3a3a`, ink-50 `#9d9d9d`, ink-30 `#c6c6c6`, ink-10 `#e6e6e6`.
- signal `#5AA6FF`, signal-dim `rgba(90,166,255,0.16)`. Chrome height 64px, side padding 48px.
- Display Anton SC, body Poppins (weights used: 300, 400, 700, plus three 500/600 rules;
  200 is loaded but unused), mono Cutive Mono.

### Dead code and leftovers (do not port, SPEC C22)
Checked by grep and script on 2026-10-19.
- `CreativeProcessV1` in home.jsx is defined but never rendered ("kept for reference").
- `CreditsBlock` in shared.jsx is defined and exported but never rendered.
- The four `window.__OFFLINE_BUILD` branches and the `__resources` / `assetUrl()` shim are
  exporter artifacts.
- `FEATURED` in home.jsx has a stray array hole (`},,`).
- Each of the 37 `WORKS` entries carries both `svc` (single) and `svcs` (list). `svcs` is
  the real field.
- `CASE_DETAIL.standv` declares `gallery` twice. The second wins, so the `sv-f1…f9` frames
  never show.
- A comment in case.jsx points to a `VideoLightbox` component in home.jsx that does not
  exist. The lightbox is inline.
- The contact fine print links privacy and terms to `href="#"`.
- The About stats are hardcoded as 06 / 02 / 31.
- `app.jsx` adds `mode-content` to `<body>`, but no CSS uses it.
- CSS: 122 of 360 class names have no reference in the jsx (the dial's `q0`–`q3`
  are built dynamically and excluded). Most belong to earlier prototype rounds: `imm-*`
  (immersive mode), `door*` and `land` (landing door), `reel-*`, `about-*`, `contact-*`,
  `hero` / `hero-*` / `yt-*` (replaced by `hero2`), `process-list` / `process-step`
  (replaced by `process2`), `method*`, `proof`, `quote*`, `statement*`, `wwu`, `rna` /
  `rna-lab`, `mode-immersive` and `mode-toggle`. Port only selectors the jsx uses.
- Assets: 58 of the 463 files are never referenced. They are `w-*` ×11, `svc-*` ×8
  (seven jpg twins plus `svc-archival.png`), `playground-*` ×6, `cinema-*` ×6, `work-*` ×5,
  `booth-*` ×5, `reel-*` ×4, `paint-*` ×4, three logos (`logo-gonzo`, `logo-standv`,
  `logo-white3x`), `hero.mp4`, `feat-other.png`, `tx-dome.jpg`, `zeb-thumb.jpg`,
  `204_Black.png` and `204-nocontent.png`. The pipeline skips them (SPEC C21).
  `reel-zeb.mp4` is byte-identical to the referenced `sd-fashion-1.mp4`.
