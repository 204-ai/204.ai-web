// SPEC T47 verification contract for scripts/media-lib.mjs:
//   V15 budget constants + caps · C21 role sets · V27 content-addressed, byte-stable
//   names · V30 intrinsic dims · V22 media audit
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  BUDGET, KB, MB, ROLES, auditMedia, collectLocalRefs, encodeWithCap, inferRole, mediaBase,
  outputBase, parseList, pickVideoRung, processLocal, resolveRoles, videoRungs,
} from './media-lib.mjs'

const v15 = readFileSync(new URL('../SPEC.md', import.meta.url), 'utf8').split('\n').find((l) => l.startsWith('- V15:')) ?? ''
const num = (re) => Number(v15.match(re)?.[1])

describe('V15 budget', () => {
  it('constants equal the numbers written in SPEC V15', () => {
    expect(v15).not.toBe('')
    expect(BUDGET.totalBytes).toBe(num(/public\/media total ≤ (\d+)MB/) * MB)
    expect(BUDGET.videoBytes).toBe(num(/∀ video ≤ (\d+)MB/) * MB)
    expect(BUDGET.imageBytes).toBe(num(/∀ img file ≤ (\d+)MB/) * MB)
    expect(BUDGET.galleryBaseBytes).toBe(num(/gallery \d+ long-edge q\d+ ≤ (\d+)KB/) * KB)
    expect(BUDGET.renderedImageBytes).toBe(num(/∀ site-rendered img ≤ (\d+)KB/) * KB)
    expect(BUDGET.ogJpgBytes).toBe(num(/∀ og jpg ≤ (\d+)KB/) * KB)
    expect(ROLES.gallery.base.width).toBe(num(/gallery (\d+) long-edge q\d+/))
    expect(ROLES.gallery.base.q).toBe(num(/gallery \d+ long-edge q(\d+)/))
  })
  it('image quality ladder steps down until the output fits its cap', async () => {
    const fake = async (q) => Buffer.alloc(q * 10)
    expect((await encodeWithCap(fake, 80, 700)).q).toBe(70)
    await expect(encodeWithCap(fake, 80, 100)).rejects.toThrow(/cap/)
  })
  it('video ladder takes the first rung under the cap', async () => {
    const sizes = { '1080/23': 12 * MB, '720/26': 4 * MB }
    const enc = async (h, crf) => sizes[`${h}/${crf}`] ?? MB
    expect(await pickVideoRung([[1080, 23], [720, 26]], enc, BUDGET.videoBytes)).toMatchObject({ height: 720, crf: 26 })
    await expect(pickVideoRung([[1080, 23]], enc, BUDGET.videoBytes)).rejects.toThrow(/ladder/)
  })
})

describe('C21 roles', () => {
  const set = (role) => [`base ${ROLES[role].base.width}`, ...ROLES[role].renditions.map((r) => `${r.width} ${r.format}`)]
  it('still: base 1920 + p-800 webp/jpg + p-500/320/160', () => {
    expect(set('still')).toEqual(['base 1920', '800 webp', '800 jpg', '500 webp', '320 webp', '160 webp'])
  })
  it('gallery: base 1600 + p-800 webp, both bounded by the long edge (B26)', () => {
    expect(set('gallery')).toEqual(['base 1600', '800 webp'])
    expect([ROLES.gallery.base.box, ROLES.gallery.renditions[0].box]).toEqual([true, true])
  })
  it('maker: base 800 + p-800 jpg og card + p-320/160', () => expect(set('maker')).toEqual(['base 800', '800 jpg', '320 webp', '160 webp']))
  it('logo: base 320 + p-160', () => expect(set('logo')).toEqual(['base 320', '160 webp']))
  it('video: hero 1080p CRF23 only from a ≥1080 source; clips start at 720p CRF26', () => {
    expect(videoRungs('hero', 1080)[0]).toEqual([1080, 23])
    expect(videoRungs('hero', 720)[0]).toEqual([720, 26])
    expect(videoRungs('clip', 2160)[0]).toEqual([720, 26])
    expect(videoRungs('clip', 480)).toEqual([[540, 30]])
  })
  it('content key paths map to roles', () => {
    expect(inferRole([0, 'media', 'still'])).toBe('still')
    expect(inferRole([3, 'gallery', 5])).toBe('gallery')
    expect(inferRole([1, 'photo'])).toBe('maker')
    expect(inferRole(['trustedBy', 2, 'logo'])).toBe('logo')
    expect(inferRole(['heroClips', 0, 'clip'])).toBe('hero')
    expect(inferRole(['heroClips', 0, 'poster'])).toBe('still')
    expect(inferRole([0, 'media', 'video', 'mp4'])).toBe('clip')
    expect(inferRole(['interactive', 0, 'reels', 1])).toBe('clip')
    expect(inferRole([0, 'note'])).toBeNull()
  })
  it('collects assets/ refs; a shared file takes the superset role', () => {
    const refs = collectLocalRefs({
      'works.json': [{ media: { still: 'assets/a.jpg', video: { mp4: 'assets/a.mp4' } }, gallery: ['assets/b.jpg', 'assets/a.jpg'], note: 'plain text' }],
      'studio.json': { heroClips: [{ clip: 'assets/h.mp4', poster: 'assets/a.jpg' }], trustedBy: [{ logo: 'assets/l.png' }] },
      'people.json': [{ photo: 'assets/p.png' }],
    })
    expect(Object.fromEntries(resolveRoles(refs))).toEqual({ 'a.jpg': 'still', 'a.mp4': 'clip', 'b.jpg': 'gallery', 'h.mp4': 'hero', 'l.png': 'logo', 'p.png': 'maker' })
    expect(() => collectLocalRefs({ 'x.json': { foo: 'assets/x.jpg' } })).toThrow(/role/)
    expect(() => collectLocalRefs({ 'x.json': { gallery: ['assets/x.mp4'] } })).toThrow(/extension/)
  })
  it('parses an explicit "<role> <file>" list', () => {
    const refs = parseList('# prototype refs\nstill a.jpg\n\ngallery b.jpg\nclip c.mp4\n')
    expect(Object.fromEntries(resolveRoles(refs))).toEqual({ 'a.jpg': 'still', 'b.jpg': 'gallery', 'c.mp4': 'clip' })
    expect(() => parseList('poster a.jpg')).toThrow(/role/)
  })
})

describe('V27 names', () => {
  it('are content-addressed: deterministic, and change with source bytes or role', () => {
    const a = outputBase('Li 05.JPG', 'aaa', 'gallery')
    expect(a).toMatch(/^li-05-[0-9a-f]{6}$/)
    expect(outputBase('Li 05.JPG', 'aaa', 'gallery')).toBe(a)
    expect(outputBase('Li 05.JPG', 'bbb', 'gallery')).not.toBe(a)
    expect(outputBase('Li 05.JPG', 'aaa', 'still')).not.toBe(a)
  })
})

/* integration: real sharp (+ ffmpeg when installed) on generated fixtures in tmp dirs */
const hasFfmpeg = (() => {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true } catch { return false }
})()
const snapshot = (dir) => Object.fromEntries(readdirSync(dir).sort().map((f) => {
  const s = statSync(join(dir, f)); return [f, `${s.size}:${s.mtimeMs}`]
}))

describe('processLocal on fixtures', () => {
  let root, from, staging, out, firstShotPath
  const run = (roles, outDir = out) => processLocal({ sharp, fromDir: from, roles: new Map(Object.entries(roles)), stagingDir: staging, outDir, root })
  const ALL = { 'shot.jpg': 'still', 'logo.png': 'logo', 'dup-a.jpg': 'gallery', 'dup-b.jpg': 'gallery' }

  beforeAll(async () => {
    root = mkdtempSync(join(tmpdir(), 'media-lib-'))
    from = join(root, 'media-src', 'proto'); staging = join(root, 'media-src', '.staging'); out = join(root, 'public', 'media')
    mkdirSync(from, { recursive: true })
    const smooth = (mean) => sharp({ create: { width: 240, height: 160, channels: 3, noise: { type: 'gaussian', mean, sigma: 60 } } })
      .resize(2400, 1600).jpeg({ quality: 90 }).toBuffer()
    writeFileSync(join(from, 'shot.jpg'), await smooth(128))
    const dup = await smooth(100)
    writeFileSync(join(from, 'dup-a.jpg'), dup)
    writeFileSync(join(from, 'dup-b.jpg'), dup)
    writeFileSync(join(from, 'tall.jpg'), await sharp({ create: { width: 160, height: 240, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 60 } } })
      .resize(1600, 2400).jpeg({ quality: 90 }).toBuffer())
    writeFileSync(join(from, 'logo.png'), await sharp({ create: { width: 600, height: 200, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0.5 } } }).png().toBuffer())
  })
  afterAll(() => rmSync(root, { recursive: true, force: true }))

  it('writes each role set with base dims (V30); identical sources share one set', async () => {
    const res = await run(ALL)
    expect(res.errors).toEqual([])
    const shot = res.entries['media-src/proto/shot.jpg']
    firstShotPath = shot.path
    expect(shot.path).toMatch(/^\/media\/shot-[0-9a-f]{6}\.webp$/)
    expect(Object.keys(shot.files)).toHaveLength(6)
    expect([shot.w, shot.h]).toEqual([1920, 1280])
    const meta = await sharp(join(out, basename(shot.path))).metadata()
    expect([meta.width, meta.height]).toEqual([shot.w, shot.h])
    for (const [f, bytes] of Object.entries(shot.files)) {
      expect(bytes).toBeLessThanOrEqual(f.endsWith('.jpg') ? BUDGET.ogJpgBytes : BUDGET.renderedImageBytes)
    }
    const logo = res.entries['media-src/proto/logo.png']
    expect(logo.w).toBe(320)
    expect(Math.abs(logo.h - 320 / 3)).toBeLessThan(1)
    expect((await sharp(join(out, basename(logo.path))).metadata()).hasAlpha).toBe(true)
    const a = res.entries['media-src/proto/dup-a.jpg']
    const b = res.entries['media-src/proto/dup-b.jpg']
    expect(b.path).toBe(a.path)
    expect(b.dupOf).toBe('media-src/proto/dup-a.jpg')
    expect(readdirSync(out).filter((f) => f.startsWith('dup-'))).toHaveLength(2)
    expect(a.files[basename(a.path)]).toBeLessThanOrEqual(BUDGET.galleryBaseBytes)
  }, 60_000)

  it('a second run encodes and moves nothing; bytes and mtimes unchanged (V27)', async () => {
    const before = snapshot(out)
    const res = await run(ALL)
    expect(res.encoded).toEqual([])
    expect(res.promoted).toEqual([])
    expect(snapshot(out)).toEqual(before)
  }, 60_000)

  it('a role change yields a new name and leaves the old files untouched (V27)', async () => {
    const before = snapshot(out)
    const res = await run({ 'shot.jpg': 'gallery' })
    expect(res.entries['media-src/proto/shot.jpg'].path).not.toBe(firstShotPath)
    const after = snapshot(out)
    for (const [f, sig] of Object.entries(before)) expect(after[f]).toBe(sig)
  }, 60_000)

  it('estimate mode (no outDir) stages outputs and never touches public/media', async () => {
    const before = snapshot(out)
    const res = await run({ 'shot.jpg': 'maker' }, null)
    const e = res.entries['media-src/proto/shot.jpg']
    expect(existsSync(join(staging, basename(e.path)))).toBe(true)
    expect(res.byRole.maker.bytes).toBeGreaterThan(0)
    expect(snapshot(out)).toEqual(before)
  }, 60_000)

  it('a portrait gallery source is bounded by its long edge (B26)', async () => {
    const res = await run({ 'tall.jpg': 'gallery' })
    expect(res.errors).toEqual([])
    const e = res.entries['media-src/proto/tall.jpg']
    expect([e.w, e.h]).toEqual([1067, 1600])
    const p800 = await sharp(join(out, basename(e.path).replace(/\.webp$/, '-p-800.webp'))).metadata()
    expect([p800.width, p800.height]).toEqual([Math.round((e.w * 800) / e.h), 800]) // derived from the 1067×1600 base
  }, 60_000)

  it.skipIf(!hasFfmpeg)('clip: ≤720p, audio stripped, under the video cap', async () => {
    execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc=size=1920x1080:rate=25:duration=1.5',
      '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1.5', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', join(from, 'v.mp4')])
    const res = await run({ 'v.mp4': 'clip' })
    expect(res.errors).toEqual([])
    const e = res.entries['media-src/proto/v.mp4']
    expect([e.w, e.h]).toEqual([1280, 720])
    expect(e.files[basename(e.path)]).toBeLessThanOrEqual(BUDGET.videoBytes)
    const audio = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_type',
      '-of', 'csv=p=0', join(out, basename(e.path))]).toString().trim()
    expect(audio).toBe('')
  }, 120_000)
})

describe('V22 media audit', () => {
  const fixture = (files, docs, manifest) => {
    const root = mkdtempSync(join(tmpdir(), 'media-audit-'))
    for (const [rel, text] of Object.entries(docs)) {
      mkdirSync(join(root, rel, '..'), { recursive: true }); writeFileSync(join(root, rel), text)
    }
    mkdirSync(join(root, 'public', 'media'), { recursive: true })
    for (const [f, n] of Object.entries(files)) writeFileSync(join(root, 'public', 'media', f), Buffer.alloc(n))
    try { return auditMedia({ root, scan: ['content', 'src'], manifest }) } finally { rmSync(root, { recursive: true, force: true }) }
  }
  const docs = {
    'content/works.json': JSON.stringify([{ media: { still: '/media/a-abc123.webp' } }, { media: { video: { mp4: '/media/big.mp4' } } }, { gallery: ['/media/g.webp'] }]),
    'src/x.ts': 'const og = `${base}media/logo-p-800.jpg`',
  }

  it('flags orphans, missing refs and cap breaches; renditions are claimed by their base', () => {
    const r = fixture(
      { 'a-abc123.webp': 10, 'a-abc123-p-800.webp': 10, 'logo.webp': 10, 'logo-p-800.jpg': 10, 'stray.webp': 10, 'big.mp4': BUDGET.videoBytes + 1 },
      { ...docs, 'content/extra.json': '{"still":"/media/gone.webp"}' },
      { local: {} },
    )
    expect(r.orphans).toEqual(['stray.webp'])
    expect(r.missing).toEqual(['g.webp', 'gone.webp'])
    expect(r.over.map((o) => o.file)).toEqual(['big.mp4'])
    expect(mediaBase('a-abc123-p-800.webp')).toBe('a-abc123')
  })

  it('applies the gallery base cap from manifest roles, and passes a clean tree', () => {
    const files = { 'a-abc123.webp': 10, 'logo.webp': 10, 'logo-p-800.jpg': 10, 'big.mp4': 10 }
    const manifest = { local: { 'media-src/p/g.jpg': { role: 'gallery', path: '/media/g.webp' } } }
    const over = fixture({ ...files, 'g.webp': BUDGET.galleryBaseBytes + 1 }, docs, manifest)
    expect(over.over).toMatchObject([{ file: 'g.webp', rule: 'gallery base' }])
    const clean = fixture({ ...files, 'g.webp': 10 }, docs, manifest)
    expect([clean.orphans, clean.missing, clean.over, clean.totalOver]).toEqual([[], [], [], false])
  })
})
