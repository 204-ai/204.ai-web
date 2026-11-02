// media-pipeline (SPEC C12 · C21 · I.media · V15 · V22 · V27) — local-only, rerun-safe.
//
// v2 local mode — originals on disk (the prototype drop in media-src/cinematic/):
//   node scripts/media-pipeline.mjs --from media-src/cinematic             encode, move into public/media/, update the manifest
//   node scripts/media-pipeline.mjs --from media-src/cinematic --estimate  encode into media-src/.staging/ only; print per-role totals
//   node scripts/media-pipeline.mjs --from media-src/cinematic --rewrite   rewrite content "assets/<file>" refs to /media/ paths
//   add --list <file> to read "<role> <file>" lines instead of scanning content/*.json
//
// Refs are the "assets/<file>" strings in content/*.json; the JSON key picks the role
// (still/poster/img/image → still, gallery → gallery, photo → maker, logo/logoUrl → logo,
// heroClips[].clip → hero, clip/mp4/reels → clip). Unreferenced originals are never encoded.
// Role rendition sets, budget caps and naming live in scripts/media-lib.mjs. Output names
// are content-addressed (<slug>-<sha1(bytes + role params):6>.<ext>), so a file already in
// public/media is never rewritten (V27; /media/** is cached immutable for a year, V14).
// Encodes land in media-src/.staging/ first, which doubles as the --estimate cache. The
// tracked manifest scripts/media-manifest.json maps each source path to its outputs, dims
// and bytes. Totals and orphans: node scripts/media-audit.mjs.
//
// v1 URL mode — the original Webflow import (SPEC C12):
//   node scripts/media-pipeline.mjs            fetch originals + optimize into public/media/
//   node scripts/media-pipeline.mjs --rewrite  rewrite content/*.json refs via the URL manifest
// Scans content/*.json, index.html, src/, scripts/ for cdn.prod.website-files.com URLs.
// Originals and the URL manifest stay in media-src/ (gitignored): the manifest keys are CDN
// URLs, which the SPEC V4 grep keeps out of tracked files. Per raster: <name>.webp (≤1920w)
// + -p-160/-p-320/-p-500/-p-800 webp + -p-800.jpg (og/share). Per video: one H.264 mp4 on
// an encode ladder down to the V15 video cap; webm maps to its mp4 twin (SPEC B5).

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import {
  BUDGET, LOCAL_REF, MB, collectLocalRefs, formatReport, parseList, processLocal, readManifest, resolveRoles, writeManifest,
} from './media-lib.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC_DIR = join(ROOT, 'media-src')
const OUT_DIR = join(ROOT, 'public', 'media')
const MANIFEST = join(SRC_DIR, 'media-manifest.json') // v1 URL manifest, gitignored (see header)
const LOCAL_MANIFEST = join(ROOT, 'scripts', 'media-manifest.json') // v2, tracked (SPEC V22)
const STAGING = join(SRC_DIR, '.staging')

const RASTER = /\.(png|jpe?g|webp|avif|gif)$/i
const VIDEO = /\.(mp4|webm|mov)$/i

/* ---------------- collect URLs ---------------- */

function* walkFiles(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* walkFiles(p)
    else if (/\.(json|ts|tsx|html|mjs)$/.test(e.name)) yield p
  }
}

function collectUrls() {
  const files = [
    join(ROOT, 'index.html'),
    ...walkFiles(join(ROOT, 'content')),
    ...walkFiles(join(ROOT, 'src')),
    ...walkFiles(join(ROOT, 'scripts')),
  ]
  const urls = new Set()
  for (const f of files) {
    if (f === MANIFEST) continue
    const text = readFileSync(f, 'utf8')
    for (const m of text.matchAll(/https:\/\/cdn\.prod\.website-files\.com\/[^"'\s`]+/g)) {
      urls.add(m[0])
    }
  }
  // post-rewrite the repo carries no CDN urls — reruns (e.g. new rendition
  // sizes) source the url list from the previous manifest instead
  if (existsSync(MANIFEST)) {
    for (const u of Object.keys(JSON.parse(readFileSync(MANIFEST, 'utf8')))) urls.add(u)
  }
  return [...urls]
}

/* ---------------- naming ---------------- */

function slugFor(url) {
  let name = decodeURIComponent(url.split(/%2F|\//i).pop())
  const ext = extname(name).toLowerCase()
  name = name.slice(0, -ext.length)
  // strip chained webflow hex ids + poster frame suffix
  name = name.replace(/^([0-9a-f]{24}_)+/i, '').replace(/\.\d{7,}$/, '')
  name = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  if (!name) name = 'asset'
  return { name, ext }
}

/* ---------------- fetch ---------------- */

async function fetchOriginal(url, file) {
  if (existsSync(file) && statSync(file).size > 0) return false
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${res.status} ${url}`)
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  return true
}

/* ---------------- optimize ---------------- */

async function processRaster(sharp, src, outBase) {
  const BG = '#0a0a0a' // §C4 bg token — alpha flattens onto it for jpg share cards
  const out = {}
  const jobs = [
    [`${outBase}.webp`, (s) => s.resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80 }), 'path'],
    [`${outBase}-p-160.webp`, (s) => s.resize({ width: 160, withoutEnlargement: true }).webp({ quality: 75 }), null],
    [`${outBase}-p-320.webp`, (s) => s.resize({ width: 320, withoutEnlargement: true }).webp({ quality: 76 }), null],
    [`${outBase}-p-500.webp`, (s) => s.resize({ width: 500, withoutEnlargement: true }).webp({ quality: 78 }), null],
    [`${outBase}-p-800.webp`, (s) => s.resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 }), null],
    [`${outBase}-p-800.jpg`, (s) => s.resize({ width: 800, withoutEnlargement: true }).flatten({ background: BG }).jpeg({ quality: 80, mozjpeg: true }), 'jpg800'],
  ]
  for (const [file, build, key] of jobs) {
    if (!existsSync(file)) await build(sharp(src).rotate()).toFile(file)
    if (key) out[key] = `/media/${basename(file)}`
  }
  return out
}

function hasAudio(src) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', src]).toString()
  return out.trim().length > 0
}

// encode ladder (§B6): quality first — 1080p/CRF23 unless that lands over
// the V15 video cap, then step down.
const VIDEO_LADDER = [
  [1080, 23],
  [720, 26],
  [720, 28],
  [540, 30],
]
const VIDEO_CAP = BUDGET.videoBytes // SPEC V15, single source in media-lib.mjs

function processVideo(src, outFile) {
  if (existsSync(outFile) && statSync(outFile).size <= VIDEO_CAP) return
  const audio = hasAudio(src) ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']
  for (const [height, crf] of VIDEO_LADDER) {
    execFileSync('ffmpeg', [
      '-y', '-i', src,
      '-vf', `scale=-2:'min(${height},ih)'`,
      '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      ...audio,
      outFile,
    ], { stdio: ['ignore', 'ignore', 'inherit'] })
    const size = statSync(outFile).size
    if (size <= VIDEO_CAP) return
    console.warn(`${basename(outFile)} ${(size / 1048576).toFixed(1)}MB @ ${height}p crf${crf} — stepping down`)
  }
  throw new Error(`encode ladder exhausted: ${basename(outFile)}`)
}

/* ---------------- main: fetch + optimize ---------------- */

async function build() {
  const { default: sharp } = await import('sharp')
  mkdirSync(SRC_DIR, { recursive: true })
  mkdirSync(OUT_DIR, { recursive: true })
  const before = new Set(readdirSync(OUT_DIR))

  const urls = collectUrls()
  console.log(`found ${urls.length} CDN urls`)

  // assign collision-free output names
  const taken = new Map() // name.ext -> url
  const entries = []
  for (const url of urls) {
    const { name, ext } = slugFor(url)
    let final = name
    const keyOf = (n) => `${n}${ext}`
    if (taken.has(keyOf(final)) ) {
      final = `${name}-${createHash('sha1').update(url).digest('hex').slice(0, 6)}`
    }
    taken.set(keyOf(final), url)
    entries.push({ url, name: final, ext })
  }

  // webm twins → their mp4 sibling output (same webflow asset id prefix)
  const mp4ByBase = new Map()
  for (const e of entries) {
    if (e.ext === '.mp4') mp4ByBase.set(e.name.replace(/[-_]?mp4$/, ''), e)
  }

  // merge onto prior manifest — a rerun must never clobber existing mappings
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
  let fetched = 0
  for (const e of entries) {
    const srcFile = join(SRC_DIR, `${e.name}${e.ext}`)
    if (e.ext === '.webm') {
      const twin = mp4ByBase.get(e.name.replace(/[-_]?webm$/, ''))
      if (twin) {
        manifest[e.url] = { path: `/media/${twin.name.replace(/[-_]?mp4$/, '')}.mp4`, drop: 'webm→mp4 twin' }
        continue
      }
    }
    if (await fetchOriginal(e.url, srcFile)) fetched++

    if (RASTER.test(e.ext)) {
      const extra = await processRaster(sharp, srcFile, join(OUT_DIR, e.name))
      manifest[e.url] = { path: `/media/${e.name}.webp`, ...extra }
    } else if (VIDEO.test(e.ext)) {
      const clean = e.name.replace(/[-_]?mp4$/, '')
      processVideo(srcFile, join(OUT_DIR, `${clean}.mp4`))
      manifest[e.url] = { path: `/media/${clean}.mp4` }
    } else {
      console.warn(`skip (unknown type): ${e.url}`)
    }
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n')
  console.log(`fetched ${fetched} new originals → ${SRC_DIR}`)

  /* size report + V15 per-file gate on this run's new outputs (totals: media-audit.mjs) */
  const files = readdirSync(OUT_DIR).map((f) => ({ f, size: statSync(join(OUT_DIR, f)).size }))
  const total = files.reduce((s, x) => s + x.size, 0)
  const srcTotal = readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((e) => e.isFile())
    .reduce((s, e) => s + statSync(join(SRC_DIR, e.name)).size, 0)
  files.sort((a, b) => b.size - a.size)
  console.log('\nlargest outputs:')
  for (const { f, size } of files.slice(0, 10)) console.log(`  ${(size / 1048576).toFixed(2).padStart(7)} MB  ${f}`)
  console.log(`\noriginals ${(srcTotal / 1048576).toFixed(1)} MB → optimized ${(total / 1048576).toFixed(1)} MB (${files.length} files)`)

  const fresh = files.filter((x) => !before.has(x.f))
  const overVid = fresh.filter((x) => VIDEO.test(x.f) && x.size > BUDGET.videoBytes)
  const overImg = fresh.filter((x) => !VIDEO.test(x.f) && x.size > BUDGET.imageBytes)
  if (overVid.length) throw new Error(`V15 breach: new videos > ${BUDGET.videoBytes / MB}MB: ${overVid.map((x) => x.f).join(', ')}`)
  if (overImg.length) throw new Error(`V15 breach: new imgs > ${BUDGET.imageBytes / MB}MB: ${overImg.map((x) => x.f).join(', ')}`)
  console.log(`V15 per-file caps OK for ${fresh.length} new outputs — totals + orphans: node scripts/media-audit.mjs`)
}

/* ---------------- rewrite content JSONs ---------------- */

function rewrite() {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  const dir = join(ROOT, 'content')
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const p = join(dir, f)
    const data = JSON.parse(readFileSync(p, 'utf8'))
    let hits = 0
    const walk = (node) => {
      if (Array.isArray(node)) return node.map(walk)
      if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) node[k] = walk(node[k])
        // video pairs collapse to mp4-only (webm dropped, SPEC C12/B5)
        if (node.video && typeof node.video === 'object' && node.video.webm) {
          delete node.video.webm
          hits++
        }
        return node
      }
      if (typeof node === 'string' && manifest[node]) {
        hits++
        return manifest[node].path
      }
      return node
    }
    const out = walk(data)
    if (hits) {
      writeFileSync(p, JSON.stringify(out, null, 2) + '\n')
      console.log(`${f}: ${hits} refs rewritten`)
    }
  }
}

/* ---------------- v2 local mode (SPEC C21 / T47) ---------------- */

function readContentDocs() {
  const dir = join(ROOT, 'content')
  return Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .map((f) => [f, JSON.parse(readFileSync(join(dir, f), 'utf8'))]),
  )
}

async function localMode({ from, list, estimate, rewrite: rewriteRefs, concurrency }) {
  const fromDir = resolve(ROOT, from)
  if (!existsSync(fromDir)) throw new Error(`--from ${from}: no such directory`)
  if (rewriteRefs) return rewriteLocal(fromDir)
  const refs = list ? parseList(readFileSync(resolve(list), 'utf8'), list) : collectLocalRefs(readContentDocs())
  const roles = resolveRoles(refs)
  if (!roles.size) return console.log(`no "assets/<file>" refs in ${list ?? 'content/*.json'} — nothing to do`)
  console.log(`${roles.size} referenced originals in ${relative(ROOT, fromDir)}${estimate ? ' (estimate: outputs stay in media-src/.staging)' : ''}`)
  const { default: sharp } = await import('sharp')
  const t0 = Date.now()
  const res = await processLocal({
    sharp, fromDir, roles, stagingDir: STAGING, outDir: estimate ? null : OUT_DIR, root: ROOT,
    concurrency: Number(concurrency), log: (m) => console.log(`  ${m}`),
  })
  console.log(formatReport(res, { estimate, seconds: (Date.now() - t0) / 1000 }))
  if (!estimate && Object.keys(res.entries).length) {
    const manifest = readManifest(LOCAL_MANIFEST)
    Object.assign(manifest.local, res.entries) // merge, never clobber (SPEC B11)
    writeManifest(LOCAL_MANIFEST, manifest)
    console.log(`manifest: ${relative(ROOT, LOCAL_MANIFEST)} (${Object.keys(manifest.local).length} entries)`)
  }
  if (res.errors.length || res.totalBytes > BUDGET.totalBytes) process.exitCode = 1
}

function rewriteLocal(fromDir) {
  const { local } = readManifest(LOCAL_MANIFEST)
  const dir = join(ROOT, 'content')
  const unresolved = []
  const updates = []
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    let hits = 0
    const walk = (node) => {
      if (Array.isArray(node)) return node.map(walk)
      if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v)]))
      const m = typeof node === 'string' ? node.match(LOCAL_REF) : null
      if (!m) return node
      const entry = local[relative(ROOT, join(fromDir, m[1]))]
      if (!entry) {
        unresolved.push(`${f}: ${node}`)
        return node
      }
      hits++
      return entry.path
    }
    const out = walk(JSON.parse(readFileSync(join(dir, f), 'utf8')))
    if (hits) updates.push({ f, out, hits })
  }
  // all-or-nothing: no content file changes while any ref still lacks an output
  if (unresolved.length) throw new Error(`no manifest entry (run --from ${relative(ROOT, fromDir)} first):\n  ${unresolved.join('\n  ')}`)
  for (const { f, out, hits } of updates) {
    writeFileSync(join(dir, f), JSON.stringify(out, null, 2) + '\n')
    console.log(`${f}: ${hits} refs rewritten`)
  }
  if (!updates.length) console.log('no "assets/<file>" refs left in content/*.json')
}

/* ---------------- main ---------------- */

const { values: args } = parseArgs({
  options: {
    from: { type: 'string' },
    list: { type: 'string' },
    estimate: { type: 'boolean', default: false },
    rewrite: { type: 'boolean', default: false },
    concurrency: { type: 'string', default: '4' },
  },
})
if (args.from) await localMode(args)
else if (args.list || args.estimate) throw new Error('--list and --estimate need --from <dir>')
else if (args.rewrite) rewrite()
else await build()
