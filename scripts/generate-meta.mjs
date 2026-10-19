// Post-build: bake per-route <title>/description/OG/Twitter meta into static
// HTML copies (dist/<route>/index.html) so social scrapers — which don't run
// JS — get the right card for every share. Bonus: real files mean GH Pages
// serves deep links with HTTP 200 instead of the 404 fallback.
// Also emits sitemap.xml + a robots.txt Sitemap line when SITE_URL is set.
//
// Reads content/*.json directly (same source the app loads through
// src/data/studio.ts) — content edits automatically flow into the sitemap
// and per-route share meta on the next build. Derivations come from
// src/data/content.ts, which Node imports as TypeScript (type stripping,
// Node ≥22.18), so slugs and validation match the app exactly.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildContent, describe, isV2, validateContent } from '../src/data/content.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const content = (f) => JSON.parse(readFileSync(join(root, 'content', f), 'utf8'))

const docs = {
  works: content('works.json'),
  services: content('services.json'),
  people: content('people.json'),
  studio: content('studio.json'),
  redirects: existsSync(join(root, 'content', 'redirects.json')) ? content('redirects.json') : {},
}
if (!isV2(docs.studio)) {
  console.error('generate-meta: FAIL content/studio.json is not "schema": 2 (v1 content is retired on this branch)')
  process.exit(1)
}
// SPEC V26/C20: broken content fails `npm run build` here (postbuild)
const problems = validateContent(docs)
if (problems.length) {
  console.error(`generate-meta: FAIL content/*.json (SPEC V26/C20):\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
const c = buildContent(docs)
const dist = join(root, 'dist')
// e.g. https://204-ai.github.io/204.ai-web — no trailing slash
const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/$/, '')
// deploy base path, mirrors vite.config.ts (SPEC V16 dual deploy)
const BASE = process.env.VITE_BASE ?? '/'
// site-root /media/... path → base-prefixed relative URL (for preloads)
const assetUrl = (p) => (p && p.startsWith('/media/') ? BASE + p.slice(1) : p)
// …→ absolute URL for share cards (SITE_URL already carries the base path)
const absUrl = (p) => (p && p.startsWith('/') && SITE_URL ? SITE_URL + p : p)

/* title rule mirrors src/hooks/useHead.ts — bare page names in, brand out */
const BRAND = '204 · NO-CONTENT'
const HOME_TITLE = `${BRAND} — Creative technology studio`
const t = (page) => (page ? `${page} — ${BRAND}` : HOME_TITLE)

const DEFAULT_IMAGE = '/media/204white-p-800.jpg'

/* WhatsApp drops og:images over ~600KB and scrapers reject webp — serve the
   pipeline's -p-800 jpg rendition (mirror of src/hooks/useHead.ts ogImage,
   keep both in sync). */
function ogImage(u) {
  if (!u || u.startsWith('data:')) return undefined // inline placeholders can't be share cards
  return u.replace(/\.(?:png|jpe?g|webp|avif)$/i, '-p-800.jpg')
}

// LCP preloads mirror each page's hero <img> srcset/sizes exactly, or the preload stops
// matching the picked source and double-downloads (or 404s on a rendition the role lacks)
const r800 = (u) => u.replace(/\.webp$/, '-p-800.webp')
const stillPreload = (u, sizes) => u && { href: u, srcset: `${assetUrl(r800(u))} 800w, ${assetUrl(u)} 1920w`, sizes }
const makerPreload = (u) => u && { href: u, srcset: `${assetUrl(u.replace(/\.webp$/, '-p-320.webp'))} 320w, ${assetUrl(u)} 800w`, sizes: '(max-width: 900px) 100vw, 420px' }

/** @type {Array<{path: string, title: string, desc: string, image?: string, preload?: {href: string, srcset: string, sizes: string}}>} */
const routes = [
  // descriptions: one helper per route type, shared with the pages (describe, src/data/content.ts)
  { path: '/', title: t(''), desc: describe.home(c), preload: stillPreload(c.heroClips[0]?.poster, '100vw') }, // HeroRotator
  { path: '/work', title: t('Work'), desc: describe.work(c) },
  { path: '/services', title: t('Services'), desc: describe.services(c) },
  { path: '/about', title: t('About'), desc: describe.about(c) },
  { path: '/contact', title: t('Contact'), desc: describe.contact(c) },
  ...c.works.map((w) => ({
    path: `/work/${w.slug}`,
    title: t(`${w.title} · Work`),
    desc: describe.case(w),
    image: ogImage(w.media?.still),
    preload: stillPreload(w.media?.still, '100vw'), // WorkDetail hero
  })),
  ...c.services.map((s) => ({
    path: `/services/${s.slug}`,
    title: t(`${s.label} · Service`),
    desc: describe.service(s),
    image: ogImage(s.still ?? s.img),
    preload: stillPreload(s.still ?? s.img, '(max-width: 1040px) 100vw, 50vw'), // ServiceReel poster
  })),
  ...c.people.map((p) => ({
    path: `/makers/${p.slug}`,
    title: t(`${p.name} · Maker`),
    desc: describe.maker(p),
    image: ogImage(p.photo),
    preload: p.photo && !p.photo.startsWith('data:') ? makerPreload(p.photo) : undefined, // MakerDetail portrait
  })),
]

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

let base = readFileSync(join(dist, 'index.html'), 'utf8')

/* Inline the stylesheet: at ~16KB transfer the whole file IS the critical
   CSS — removes the render-blocking request without any FOUC/layout risk.
   Also preload the primary latin font files so they load in parallel with
   the HTML instead of chaining behind CSS discovery. */
import { readdirSync } from 'node:fs'
const cssLink = base.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/)
if (cssLink) {
  const cssHref = cssLink[1]
  const cssFile = join(dist, cssHref.replace(/^.*\/assets\//, 'assets/'))
  const css = readFileSync(cssFile, 'utf8')
  base = base.replace(cssLink[0], `<style>${css}</style>`)
  const assetBase = cssHref.replace(/assets\/[^/]+$/, 'assets/')
  const fonts = readdirSync(join(dist, 'assets')).filter(
    (f) =>
      f.endsWith('.woff2') &&
      /^(anton-sc-latin-400-normal|poppins-latin-300-normal|cutive-mono-latin-400-normal)/.test(f), // SPEC C18 primary faces
  )
  const preloads = fonts
    .map((f) => `    <link rel="preload" as="font" type="font/woff2" crossorigin href="${assetBase}${f}" />`)
    .join('\n')
  base = base.replace('</title>', `</title>\n${preloads}`)
  console.log(`generate-meta: inlined ${Math.round(css.length / 1024)}KB CSS, preloaded ${fonts.length} fonts`)
}

function metaFor(r) {
  const image = absUrl(r.image ?? DEFAULT_IMAGE)
  const url = SITE_URL ? `${SITE_URL}${r.path}` : ''
  return (
    `<title>${esc(r.title)}</title>\n` +
    `    <meta name="description" content="${esc(r.desc)}" />\n` +
    `    <meta property="og:title" content="${esc(r.title)}" />\n` +
    `    <meta property="og:description" content="${esc(r.desc)}" />\n` +
    `    <meta property="og:type" content="website" />\n` +
    `    <meta property="og:image" content="${esc(image)}" />\n` +
    (url ? `    <meta property="og:url" content="${esc(url)}" />\n    <link rel="canonical" href="${esc(url)}" />\n` : '') +
    `    <meta name="twitter:card" content="summary_large_image" />\n` +
    `    <meta name="twitter:title" content="${esc(r.title)}" />\n` +
    `    <meta name="twitter:description" content="${esc(r.desc)}" />\n` +
    `    <meta name="twitter:image" content="${esc(image)}" />` +
    // LCP: hero media downloads in parallel with the JS bundle instead of
    // being discovered after React mounts
    (r.preload
      ? `\n    <link rel="preload" as="image" href="${esc(assetUrl(r.preload.href))}" imagesrcset="${esc(r.preload.srcset)}" imagesizes="${esc(r.preload.sizes)}" fetchpriority="high" />`
      : '')
  )
}

// strip the meta block the template carries, then inject the per-route one
function render(r) {
  let html = base
  html = html.replace(/<title>[\s\S]*?<\/title>/, '@@META@@')
  html = html.replace(/\n\s*<meta name="description"[^>]*\/>/, '')
  html = html.replace(/\n\s*<meta property="og:[^>]*\/>/g, '')
  html = html.replace(/\n\s*<meta name="twitter:[^>]*\/>/g, '')
  html = html.replace('@@META@@', metaFor(r))
  return html
}

let count = 0
for (const r of routes) {
  const target = r.path === '/' ? join(dist, 'index.html') : join(dist, r.path.slice(1), 'index.html')
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, render(r))
  count++
}

// 404 fallback keeps the home meta
writeFileSync(join(dist, '404.html'), render(routes[0]))

/* Retired URLs (SPEC C20, V28): every alias and content/redirects.json entry gets
   - a static stub for GH Pages: instant meta refresh + canonical to the live page, noindex
   - a 301 in firebase.json hosting.redirects (generated here, committed; Firebase applies
     redirects before static files and rewrites)
   Neither enters the sitemap. */
const redirects = Object.entries(c.redirects).sort(([a], [b]) => a.localeCompare(b))
// base-prefixed with a trailing slash: the real file on GH Pages, no extra 301 hop
const livePath = (p) => (p === '/' ? BASE : `${BASE}${p.slice(1)}/`)
for (const [from, to] of redirects) {
  const target = join(dist, from.slice(1), 'index.html')
  // validateContent already rejects this; checked against the route list so reruns over
  // the same dist (stubs already written) stay idempotent
  if (routes.some((r) => r.path === from)) {
    console.error(`generate-meta: FAIL redirect ${from} would overwrite a live page (SPEC C20)`)
    process.exit(1)
  }
  const href = livePath(to)
  const canonical = SITE_URL ? `${SITE_URL}${to}` : href
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(
    target,
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Moved — ${esc(BRAND)}</title>
<meta name="robots" content="noindex" />
<link rel="canonical" href="${esc(canonical)}" />
<meta http-equiv="refresh" content="0; url=${esc(href)}" />
<script>location.replace(${JSON.stringify(href)} + location.search + location.hash)</script>
</head>
<body><p>This page moved to <a href="${esc(href)}">${esc(href)}</a>.</p></body>
</html>
`,
  )
}
const fbPath = join(root, 'firebase.json')
const fb = JSON.parse(readFileSync(fbPath, 'utf8'))
const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const wanted = redirects.map(([from, to]) => ({ regex: `^${reEscape(from)}/?$`, destination: to, type: 301 }))
if (JSON.stringify(fb.hosting.redirects ?? []) !== JSON.stringify(wanted)) {
  if (process.env.CI) {
    console.error('generate-meta: FAIL firebase.json hosting.redirects is stale — run `npm run build` locally and commit firebase.json (SPEC V28)')
    process.exit(1)
  }
  const { public: pub, ignore, redirects: _old, rewrites, ...rest } = fb.hosting
  fb.hosting = { public: pub, ignore, redirects: wanted, rewrites, ...rest }
  writeFileSync(fbPath, JSON.stringify(fb, null, 2) + '\n')
  console.log(`generate-meta: updated firebase.json hosting.redirects (${wanted.length}) — commit it`)
}
console.log(`generate-meta: ${redirects.length} redirect stubs + firebase.json 301s (SPEC V28)`)

if (SITE_URL) {
  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    routes.map((r) => `  <url><loc>${esc(`${SITE_URL}${r.path}`)}</loc></url>`).join('\n') +
    '\n</urlset>\n'
  writeFileSync(join(dist, 'sitemap.xml'), sitemap)
  const robotsPath = join(dist, 'robots.txt')
  const robots = readFileSync(robotsPath, 'utf8')
  if (!robots.includes('Sitemap:')) writeFileSync(robotsPath, robots.trimEnd() + `\nSitemap: ${SITE_URL}/sitemap.xml\n`)
}

console.log(`generate-meta: ${count} routes${SITE_URL ? ' + sitemap.xml' : ' (no SITE_URL — sitemap skipped)'}`)

/* WhatsApp drops og:images over ~600KB. Gate every unique image at build
   time so new content can't silently ship a preview that blanks there.
   Images are self-hosted now — stat the dist file directly; a missing
   rendition or oversize image fails the build. */
import { statSync } from 'node:fs'
const OG_IMAGE_LIMIT = 600 * 1024
const unique = [...new Set(routes.map((r) => r.image ?? DEFAULT_IMAGE))]
let failed = false
for (const u of unique) {
  try {
    const size = statSync(join(dist, u.replace(/^\//, ''))).size
    if (size > OG_IMAGE_LIMIT) {
      console.error(`generate-meta: FAIL og:image ${Math.round(size / 1024)}KB > 600KB (WhatsApp drops it): ${u}`)
      failed = true
    }
  } catch {
    console.error(`generate-meta: FAIL og:image missing from dist: ${u}`)
    failed = true
  }
}
console.log(`generate-meta: og:image size gate — ${unique.length} images checked`)
if (failed) process.exit(1)
