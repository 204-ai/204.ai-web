// media-lib (SPEC C21 · I.media · V15 · V22 · V27 · V30)
//
// Shared helpers for scripts/media-pipeline.mjs (local mode), scripts/media-audit.mjs and
// scripts/media-lib.test.mjs. Side-effect free: nothing runs on import. Keep CDN-specific
// code out of this file — the SPEC V4 grep allows it only in media-pipeline.mjs.

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join, relative } from 'node:path'

export const KB = 1024
export const MB = 1024 * KB

/* SPEC V15 — the single source of every media budget number. media-lib.test.mjs parses
   the V15 line in SPEC.md and fails when these drift from it. */
export const BUDGET = Object.freeze({
  totalBytes: 160 * MB, // all of public/media
  videoBytes: 10 * MB, // any video
  imageBytes: 2 * MB, // any image file
  galleryBaseBytes: 300 * KB, // gallery base rendition (1600w)
  renderedImageBytes: 500 * KB, // any webp a page renders
  ogJpgBytes: 600 * KB, // -p-800.jpg share card (WhatsApp limit; generate-meta gates it too)
})

export const RASTER_EXT = /\.(png|jpe?g|webp|avif|gif)$/i
export const VIDEO_EXT = /\.(mp4|webm|mov)$/i

// Part of every output name: bumping it re-encodes all local-mode media under new names (V27).
export const PIPELINE_VERSION = 'v2.1'
const JPG_BG = '#0a0a0a' // SPEC C17 ink-95 page bg: alpha flattens onto it for jpg share cards
const Q_STEP = 5
const Q_FLOOR = 50

/* SPEC C21 role rendition sets. Every raster role writes a base `<name>.webp` at the role's
   max width — the path content references — plus the smaller renditions. Logo: base 320 +
   p-320 + p-160 (C21 names p-320 explicitly; the Nav and logo loops request it). Maker: base 800 + p-800 jpg (og card for /makers/:slug) + p-320 + p-160. Sizes
   bound the width, except `box` jobs, which bound the long edge: galleries show images at
   their natural aspect, and a 1600w portrait carries 2.25–2.8× a landscape's pixels (SPEC
   B26). Videos autoplay muted everywhere on the site (SPEC V24), so their audio is stripped. */
export const ROLES = Object.freeze({
  still: {
    kind: 'raster',
    base: { width: 1920, q: 80, cap: BUDGET.renderedImageBytes },
    renditions: [
      { suffix: '-p-800', width: 800, format: 'webp', q: 78 },
      { suffix: '-p-800', width: 800, format: 'jpg', q: 80 },
      { suffix: '-p-500', width: 500, format: 'webp', q: 78 },
      { suffix: '-p-320', width: 320, format: 'webp', q: 76 },
      { suffix: '-p-160', width: 160, format: 'webp', q: 75 },
    ],
  },
  gallery: {
    kind: 'raster',
    base: { width: 1600, q: 75, cap: BUDGET.galleryBaseBytes, box: true },
    renditions: [{ suffix: '-p-800', width: 800, format: 'webp', q: 78, box: true }],
  },
  maker: {
    kind: 'raster',
    base: { width: 800, q: 78 },
    renditions: [
      { suffix: '-p-800', width: 800, format: 'jpg', q: 80 },
      { suffix: '-p-320', width: 320, format: 'webp', q: 76 },
      { suffix: '-p-160', width: 160, format: 'webp', q: 75 },
    ],
  },
  logo: {
    kind: 'raster',
    base: { width: 320, q: 80 },
    renditions: [
      { suffix: '-p-320', width: 320, format: 'webp', q: 80 },
      { suffix: '-p-160', width: 160, format: 'webp', q: 75 },
    ],
  },
  // 1080p CRF23 only when the source is ≥1080 tall (videoRungs); the rest steps down to the cap
  hero: { kind: 'video', ladder: [[1080, 23], [720, 26], [720, 28], [540, 30]], audio: false },
  clip: { kind: 'video', ladder: [[720, 26], [720, 28], [540, 30]], audio: false },
})

// A file referenced under several roles gets the first of these: each covers the ones after
// it (maker before gallery: maker routes need the -p-800.jpg og card, galleries do not).
const PRECEDENCE = ['hero', 'clip', 'still', 'maker', 'gallery', 'logo']
export const pickRole = (roles) => PRECEDENCE.find((r) => roles.includes(r))

// width-bound by default; a `box` job bounds the long edge (SPEC B26)
const fitTo = (job) => (job.box
  ? { width: job.width, height: job.width, fit: 'inside', withoutEnlargement: true }
  : { width: job.width, withoutEnlargement: true })
const exceeds = (job, w, h) => (job.box ? Math.max(w, h) : w) > job.width

export const capFor = (job) => job.cap ?? (job.format === 'jpg' ? BUDGET.ogJpgBytes : BUDGET.renderedImageBytes)

export function videoRungs(role, sourceHeight) {
  const { ladder } = ROLES[role]
  const fit = ladder.filter(([h]) => h <= sourceHeight)
  return fit.length ? fit : [ladder[ladder.length - 1]]
}

/* ---------------- caps (V15) ---------------- */

export async function encodeWithCap(encode, q0, cap) {
  for (let q = q0; q >= Q_FLOOR; q -= Q_STEP) {
    const buf = await encode(q)
    if (buf.length <= cap) return { buf, q }
  }
  throw new Error(`over cap ${cap}B even at q${Q_FLOOR}`)
}

export async function pickVideoRung(rungs, encode, cap) {
  const tried = []
  for (const [height, crf] of rungs) {
    const bytes = await encode(height, crf)
    if (bytes <= cap) return { height, crf, bytes }
    tried.push(`${height}p/crf${crf}=${(bytes / MB).toFixed(1)}MB`)
  }
  throw new Error(`encode ladder exhausted (cap ${(cap / MB).toFixed(0)}MB): ${tried.join(', ')}`)
}

/* ---------------- naming (V27) ---------------- */

const sha1 = (s) => createHash('sha1').update(s).digest('hex')
export const sha1File = (file) => createHash('sha1').update(readFileSync(file)).digest('hex')

export function mediaSlug(file) {
  const name = basename(file, extname(file))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return name || 'asset'
}

const signatures = {}
const roleSignature = (role) => (signatures[role] ??= sha1(JSON.stringify(ROLES[role]) + JPG_BG + PIPELINE_VERSION))

// <slug>-<6 hex of sha1(source bytes + role params)>: same input → same name, new bytes or
// params → new name, so a file already in public/media is never rewritten (V14 immutable).
export const outputBase = (file, sourceSha1, role) =>
  `${mediaSlug(file)}-${sha1(`${sourceSha1}|${role}|${roleSignature(role)}`).slice(0, 6)}`

export function planFiles(base, role) {
  const spec = ROLES[role]
  if (spec.kind === 'video') return [{ name: `${base}.mp4` }]
  return [
    { name: `${base}.webp`, job: { ...spec.base, format: 'webp' } },
    ...spec.renditions.map((r) => ({ name: `${base}${r.suffix}.${r.format}`, job: r })),
  ]
}

/* ---------------- refs + roles (C21) ---------------- */

export const LOCAL_REF = /^assets\/(.+)$/

// last object key on the JSON path → role; heroClips[].clip is the one hero video slot
const KEY_ROLES = {
  still: 'still', poster: 'still', img: 'still', image: 'still',
  gallery: 'gallery',
  photo: 'maker',
  logo: 'logo', logoUrl: 'logo',
  clip: 'clip', mp4: 'clip', reels: 'clip',
}

export function inferRole(path) {
  const keys = path.filter((p) => typeof p === 'string')
  const role = KEY_ROLES[keys[keys.length - 1]] ?? null
  return role === 'clip' && keys.includes('heroClips') ? 'hero' : role
}

function assertKind(file, role, where) {
  const ok = ROLES[role].kind === 'video' ? VIDEO_EXT.test(file) : RASTER_EXT.test(file)
  if (!ok) throw new Error(`${where}: ${file} has the wrong extension for role "${role}"`)
}

function addRef(refs, file, role) {
  if (!refs.has(file)) refs.set(file, new Set())
  refs.get(file).add(role)
}

/** Every "assets/<file>" string in the content docs ({ name: parsed JSON }) → Map<file, Set<role>>. */
export function collectLocalRefs(docs) {
  const refs = new Map()
  const walk = (node, path, doc) => {
    if (typeof node === 'string') {
      const m = node.match(LOCAL_REF)
      if (!m) return
      const where = `${doc} ${path.join('.')}`
      const role = inferRole(path)
      if (!role) throw new Error(`${where}: no media role for "${node}" — map its key in KEY_ROLES`)
      assertKind(m[1], role, where)
      addRef(refs, m[1], role)
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, [...path, i], doc))
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, [...path, k], doc)
    }
  }
  for (const [doc, json] of Object.entries(docs)) walk(json, [], doc)
  return refs
}

/** "<role> <file>" lines (# comments) → Map<file, Set<role>>. */
export function parseList(text, source = 'list') {
  const refs = new Map()
  text.split('\n').forEach((line, i) => {
    const s = line.replace(/#.*/, '').trim()
    if (!s) return
    const [role, file, extra] = s.split(/\s+/)
    if (!ROLES[role] || !file || extra) {
      throw new Error(`${source}:${i + 1}: expected "<role> <file>" with role ∈ ${Object.keys(ROLES).join('|')}`)
    }
    assertKind(file, role, `${source}:${i + 1}`)
    addRef(refs, file, role)
  })
  return refs
}

export function resolveRoles(refs) {
  return new Map([...refs].sort(([a], [b]) => (a < b ? -1 : 1)).map(([file, roles]) => [file, pickRole([...roles])]))
}

/* ---------------- manifest (V22 / V30) ---------------- */

// Tracked scripts/media-manifest.json: source path → { sha1, role, path, w, h, files }.
// Local entries only: CDN URL keys stay in the gitignored v1 manifest (SPEC V4 grep).
export function readManifest(file) {
  if (!existsSync(file)) return { version: 2, local: {} }
  return { version: 2, local: JSON.parse(readFileSync(file, 'utf8')).local ?? {} }
}

export function writeManifest(file, manifest) {
  const local = Object.fromEntries(Object.keys(manifest.local).sort().map((k) => [k, manifest.local[k]]))
  writeFileSync(file, JSON.stringify({ version: 2, local }, null, 1) + '\n')
}

/* ---------------- encode ---------------- */

function writeAtomic(file, buf) {
  const tmp = `${file}.tmp-${process.pid}`
  writeFileSync(tmp, buf)
  renameSync(tmp, file)
}

export function probeVideo(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file])
  const [w, h] = out.toString().trim().split(',').map(Number)
  return { w, h }
}

function encodeVideo(src, out, height, crf, audio) {
  execFileSync('ffmpeg', [
    '-y', '-v', 'error', '-i', src,
    '-vf', `scale=-2:'min(${height},ih)'`,
    '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    out,
  ], { stdio: ['ignore', 'ignore', 'inherit'] })
  return statSync(out).size
}

async function pool(items, n, fn) {
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker))
}

/**
 * Encode the referenced originals ({ roles: Map<file, role> } under fromDir) into stagingDir,
 * then move each output into outDir unless it is already there (outDir null = estimate).
 * Identical sources (same sha1) share one output set. Per-job failures land in res.errors.
 */
export async function processLocal({ sharp, fromDir, roles, stagingDir, outDir = null, root, concurrency = 4, log = () => {} }) {
  mkdirSync(stagingDir, { recursive: true })
  if (outDir) mkdirSync(outDir, { recursive: true })
  const files = [...roles.keys()].sort()
  const missing = files.filter((f) => !existsSync(join(fromDir, f)))
  if (missing.length) throw new Error(`missing in ${relative(root, fromDir)}: ${missing.join(', ')}`)

  const groups = new Map()
  for (const f of files) {
    const h = sha1File(join(fromDir, f))
    groups.set(h, [...(groups.get(h) ?? []), f])
  }
  const jobs = [...groups].map(([sha, group]) => {
    const role = pickRole(group.map((f) => roles.get(f)))
    return { sha, files: group, lead: group[0], role, base: outputBase(group[0], sha, role) }
  })

  const res = { entries: {}, encoded: [], promoted: [], errors: [], byRole: {}, totalBytes: 0 }
  const locate = (name) =>
    outDir && existsSync(join(outDir, name)) ? join(outDir, name)
      : existsSync(join(stagingDir, name)) ? join(stagingDir, name)
        : null

  const finish = (job, w, h) => {
    const sizes = {}
    for (const { name } of planFiles(job.base, job.role)) {
      let at = locate(name)
      if (outDir && at !== join(outDir, name)) {
        renameSync(at, join(outDir, name)) // promote; files already in outDir are never touched (V27)
        res.promoted.push(name)
        at = join(outDir, name)
      }
      sizes[name] = statSync(at).size
    }
    const ext = ROLES[job.role].kind === 'video' ? 'mp4' : 'webp'
    const entry = { sha1: job.sha, role: job.role, path: `/media/${job.base}.${ext}`, w, h, files: sizes }
    const leadKey = relative(root, join(fromDir, job.lead))
    for (const f of job.files) {
      const key = relative(root, join(fromDir, f))
      res.entries[key] = key === leadKey ? entry : { ...entry, dupOf: leadKey }
    }
    const bytes = Object.values(sizes).reduce((s, b) => s + b, 0)
    const t = (res.byRole[job.role] ??= { sources: 0, files: 0, bytes: 0 })
    t.sources += job.files.length
    t.files += Object.keys(sizes).length
    t.bytes += bytes
    res.totalBytes += bytes
  }

  const raster = async (job) => {
    const plan = planFiles(job.base, job.role)
    const todo = plan.filter((p) => !locate(p.name))
    if (!todo.length) {
      const m = await sharp(locate(plan[0].name)).metadata()
      return finish(job, m.width, m.height)
    }
    // decode + orient + downscale once; every rendition derives from this raw base
    const { data, info } = await sharp(join(fromDir, job.lead))
      .rotate()
      .resize(fitTo(ROLES[job.role].base))
      .toColourspace('srgb')
      .raw()
      .toBuffer({ resolveWithObject: true })
    const raw = { raw: { width: info.width, height: info.height, channels: info.channels } }
    for (const { name, job: j } of todo) {
      const { buf } = await encodeWithCap(async (q) => {
        let img = sharp(data, raw)
        if (exceeds(j, info.width, info.height)) img = img.resize(fitTo(j))
        return j.format === 'jpg'
          ? img.flatten({ background: JPG_BG }).jpeg({ quality: q, mozjpeg: true }).toBuffer()
          : img.webp({ quality: q }).toBuffer()
      }, j.q, Math.min(capFor(j), BUDGET.imageBytes))
      writeAtomic(join(stagingDir, name), buf)
      res.encoded.push(name)
    }
    finish(job, info.width, info.height)
  }

  const video = async (job) => {
    const [{ name }] = planFiles(job.base, job.role)
    if (!locate(name)) {
      const src = join(fromDir, job.lead)
      const tmp = join(stagingDir, `${job.base}.tmp-${process.pid}.mp4`)
      try {
        const encode = async (height, crf) => encodeVideo(src, tmp, height, crf, ROLES[job.role].audio)
        await pickVideoRung(videoRungs(job.role, probeVideo(src).h), encode, BUDGET.videoBytes)
        renameSync(tmp, join(stagingDir, name))
        res.encoded.push(name)
      } finally {
        rmSync(tmp, { force: true })
      }
    }
    const { w, h } = probeVideo(locate(name))
    finish(job, w, h)
  }

  const guard = (fn) => async (job) => {
    try {
      await fn(job)
    } catch (e) {
      res.errors.push({ file: job.lead, role: job.role, error: e.message })
    }
  }
  const rasters = jobs.filter((j) => ROLES[j.role].kind === 'raster')
  const videos = jobs.filter((j) => ROLES[j.role].kind === 'video')
  let done = 0
  await pool(rasters, concurrency, async (job) => {
    await guard(raster)(job)
    if (++done % 25 === 0 || done === rasters.length) log(`raster ${done}/${rasters.length}`)
  })
  for (const [i, job] of videos.entries()) {
    await guard(video)(job)
    log(`video ${i + 1}/${videos.length} ${job.lead}`)
  }
  return res
}

export function formatReport(res, { estimate = false, seconds } = {}) {
  const mb = (b) => `${(b / MB).toFixed(1).padStart(6)} MB`
  const lines = [
    '',
    `${estimate ? 'estimate' : 'run'}: ${res.encoded.length} encoded, ${res.promoted.length} moved into public/media${seconds ? `, ${seconds.toFixed(0)}s` : ''}`,
    '  role     sources  files      bytes',
  ]
  for (const role of Object.keys(ROLES)) {
    const t = res.byRole[role]
    if (t) lines.push(`  ${role.padEnd(8)} ${String(t.sources).padStart(7)} ${String(t.files).padStart(6)}  ${mb(t.bytes)}`)
  }
  const ok = res.totalBytes <= BUDGET.totalBytes
  lines.push(`  total (this ref set)    ${mb(res.totalBytes)}  V15 total ≤ ${(BUDGET.totalBytes / MB).toFixed(0)} MB: ${ok ? 'OK' : 'OVER'}`)
  const largest = Object.values(res.entries)
    .filter((e) => !e.dupOf)
    .flatMap((e) => Object.entries(e.files))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  if (largest.length) lines.push('  largest outputs:', ...largest.map(([f, b]) => `    ${mb(b)}  ${f}`))
  if (res.errors.length) lines.push(`  ERRORS (${res.errors.length}):`, ...res.errors.map((e) => `    ${e.file} [${e.role}]: ${e.error}`))
  return lines.join('\n')
}

/* ---------------- audit (V22 / V15) ---------------- */

const MEDIA_REF = /(?:^|[^A-Za-z0-9_-])\/?media\/([A-Za-z0-9._-]+\.(?:webp|jpe?g|png|gif|avif|svg|mp4|webm))/g
const TEXT_FILE = /\.(json|ts|tsx|js|jsx|mjs|css|html)$/
// test fixtures never ship, so their media paths are not references
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/
export const AUDIT_SCAN = ['content', 'src', 'index.html', 'scripts/generate-meta.mjs']

function* walkText(path) {
  if (!existsSync(path)) return
  if (statSync(path).isFile()) {
    yield path
    return
  }
  for (const e of readdirSync(path, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue
    const p = join(path, e.name)
    if (e.isDirectory()) yield* walkText(p)
    else if (TEXT_FILE.test(e.name) && !TEST_FILE.test(e.name)) yield p
  }
}

// a rendition (<base>-p-<w>.<ext>) is claimed by a reference to its base
export const mediaBase = (name) => name.replace(/\.[a-z0-9]+$/i, '').replace(/-p-\d+$/, '')

export function auditMedia({ root, outDir = join(root, 'public', 'media'), scan = AUDIT_SCAN, manifest = { local: {} } }) {
  const refs = new Set()
  for (const s of scan) for (const f of walkText(join(root, s))) for (const m of readFileSync(f, 'utf8').matchAll(MEDIA_REF)) refs.add(m[1])
  const sizes = {}
  if (existsSync(outDir)) for (const f of readdirSync(outDir)) if (!f.startsWith('.')) sizes[f] = statSync(join(outDir, f)).size
  const bases = new Set([...refs].map(mediaBase))
  const galleryBases = new Set(Object.values(manifest.local ?? {}).filter((e) => e.role === 'gallery').map((e) => basename(e.path)))
  const over = []
  const check = (file, bytes, rule, cap) => {
    if (bytes > cap) over.push({ file, bytes, rule, cap })
  }
  for (const [f, b] of Object.entries(sizes).sort(([x], [y]) => (x < y ? -1 : 1))) {
    if (VIDEO_EXT.test(f)) check(f, b, 'video', BUDGET.videoBytes)
    else if (RASTER_EXT.test(f)) {
      check(f, b, 'image', BUDGET.imageBytes)
      if (/\.webp$/i.test(f)) {
        if (galleryBases.has(f)) check(f, b, 'gallery base', BUDGET.galleryBaseBytes)
        else check(f, b, 'rendered webp', BUDGET.renderedImageBytes)
      }
      if (/-p-800\.jpg$/i.test(f)) check(f, b, 'og jpg', BUDGET.ogJpgBytes)
    }
  }
  const totalBytes = Object.values(sizes).reduce((s, b) => s + b, 0)
  return {
    refs: [...refs].sort(),
    files: Object.keys(sizes).length,
    totalBytes,
    missing: [...refs].filter((r) => !(r in sizes)).sort(),
    orphans: Object.keys(sizes).filter((f) => !bases.has(mediaBase(f))).sort(),
    over,
    totalOver: totalBytes > BUDGET.totalBytes,
  }
}
