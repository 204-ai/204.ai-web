// SPEC T48 verification contract: v2 content model (I.content), closed taxonomy (V26),
// URL stability (C20), derived pillars/related work (C19), and the v1 transition view.
import { describe, expect, it } from 'vitest'
import { fromV1Json, toV1, type V1Raw } from './compat'
import { buildContent, isV2, slugify, validateContent, type RawContent, type RawService } from './content'

const svc = (id: string, label: string): RawService => ({
  id, label, title: label, desc: `${label} desc`, img: `/media/${id}.webp`, lead: `${label} lead`,
  modes: [{ n: '01', label: 'Mode', body: 'Body' }], included: 'Included', cta: 'Start',
})
const fixture = (): RawContent => ({
  works: [
    { title: 'Motel X', client: 'MOTELX', practices: ['booth'], year: '2026', note: 'Photo booth', media: { still: '/media/mx.webp' } },
    { title: 'Delulu', client: 'Sofie Heyman', practices: ['booth', 'mirror', 'visuals'], year: '2026', note: 'Collab', body: ['p1', 'p2'] },
    { title: 'M. K. Čiurlionis — Trail of Angels', slug: 'ciurlionis', aliases: ['trail-of-angels'], client: 'Estate', practices: ['artistic'], year: '2026', note: 'Film', format: 'Animation' },
  ],
  services: {
    content: [svc('branded', 'Branded Campaigns'), svc('artistic', 'Animation & Film')],
    interactive: [svc('mirror', 'Magic Mirror'), svc('booth', 'Magic Photo Booth'), svc('visuals', 'Live Visuals')],
  },
  people: [{ name: 'Cecilia Hübinette', role: 'Art Director' }],
  studio: {
    schema: 2, name: '204', suffix: 'NO-CONTENT', tag: 'Studio', logoUrl: '/media/logo.webp',
    contact: { email: 'hello@204.ai', studio: 'RnA Studio', instagram: '@x', instagramUrl: 'https://instagram.com/x', linkedin: 'x', linkedinUrl: 'https://linkedin.com/x' },
    heroClips: [{ work: 'motel-x', clip: '/media/mx.mp4', poster: '/media/mx.webp', title: 'Motel X — Vinte Anos', kind: 'Magic Photo Booth' }],
    featured: [{ work: 'ciurlionis', title: 'Čiurlionis\nTrail of Angels', label: 'Animation\n& Film', poster: '/media/feat.webp' }, { work: 'motel-x' }],
    allWork: { title: 'Other\nProjects', label: 'Selected\nwork', client: 'Various', year: '2024–26', poster: '/media/all.webp', clip: '/media/all.mp4' },
    process: [{ n: '01', label: 'Discover', body: 'Goals' }],
    practice: [{ n: '01', label: 'Experience design', body: 'Audience' }],
    copy: {
      home: { who: 'Who', marquee: 'A · B' }, closer: { label: 'Chat', title: 'Story', cta: 'Start' },
      footer: { blurb: 'Blurb' }, about: { lead: 'Lead' }, contact: { lead: 'Lead' },
      portfolio: { lead: 'Lead', closer: { label: 'Card', title: 'Mind?', cta: 'Start' } },
    },
    footer: { address: 'Lisboa', socials: [{ label: 'Instagram', url: 'https://instagram.com/x' }] },
    budgetRanges: ['< 25k'], rnaStudioUrl: 'https://rna.example', trustedBy: [], partners: [],
  },
  redirects: { '/work/bioxyz-coin-launch': '/work/delulu' },
})

describe('buildContent (I.content, C19, C20)', () => {
  const c = buildContent(fixture())
  it('derives ids, codes (newest = highest), slugs with override, and the format default', () => {
    expect(c.works.map((w) => [w.id, w.code, w.slug])).toEqual([
      ['w01', 'NC·003', 'motel-x'], ['w02', 'NC·002', 'delulu'], ['w03', 'NC·001', 'ciurlionis'],
    ])
    expect(c.works.map((w) => w.format)).toEqual(['Magic Photo Booth', 'Magic Photo Booth', 'Animation'])
  })
  it('numbers services per pillar in JSON order and derives related work from practices', () => {
    expect(c.services.map((s) => `${s.pillar}:${s.n}:${s.slug}`)).toEqual([
      'content:01:branded-campaigns', 'content:02:animation-film',
      'interactive:01:magic-mirror', 'interactive:02:magic-photo-booth', 'interactive:03:live-visuals',
    ])
    const related = (id: string) => c.services.find((s) => s.id === id)!.works.map((w) => w.slug)
    expect(related('booth')).toEqual(['motel-x', 'delulu'])
    expect(related('branded')).toEqual([])
    expect(c.pillars.interactive.map((s) => s.id)).toEqual(['mirror', 'booth', 'visuals'])
  })
  it('resolves hero clips and featured work, folds aliases into redirects, derives stats', () => {
    expect(c.heroClips.map((h) => h.item.slug)).toEqual(['motel-x'])
    expect(c.featured.map((f) => [f.item.slug, f.title ?? null])).toEqual([['ciurlionis', 'Čiurlionis\nTrail of Angels'], ['motel-x', null]])
    expect(c.heroClips[0].title).toBe('Motel X — Vinte Anos')
    expect(c.redirects).toEqual({ '/work/trail-of-angels': '/work/ciurlionis', '/work/bioxyz-coin-launch': '/work/delulu' })
    expect(c.stats).toEqual({ makers: 1, pillars: 2, projects: 3 })
  })
  it('slugify keeps the v1 URL rule', () => {
    expect(slugify('M. K. Čiurlionis — Trail of Angels')).toBe('m-k-ciurlionis-trail-of-angels')
    expect(slugify('1N: EEG Mirror')).toBe('1n-eeg-mirror')
    expect(slugify('Zuzalu × Grimes')).toBe('zuzalu-grimes')
  })
})

describe('validateContent (V26, C20)', () => {
  const broken = (edit: (r: RawContent) => void) => {
    const r = fixture()
    edit(r)
    return validateContent(r).join('\n')
  }
  it('passes the clean fixture', () => expect(validateContent(fixture())).toEqual([]))
  it('rejects a practice that is not a service id', () => {
    expect(broken((r) => { r.works[0].practices = ['boooth'] })).toMatch(/"boooth" is not a service id/)
  })
  it('rejects hero clips and featured entries that do not resolve to a work', () => {
    const msg = broken((r) => { r.studio.heroClips[0].work = 'nope'; r.studio.featured.push({ work: 'ghost' }) })
    expect(msg).toMatch(/heroClips\[0\].*"nope"/)
    expect(msg).toMatch(/featured\[2\].*"ghost"/)
  })
  it('rejects duplicate slugs, aliases that shadow live routes, and dangling redirects', () => {
    expect(broken((r) => { r.works[1].title = 'Motel X' })).toMatch(/duplicate work slug "motel-x"/)
    expect(broken((r) => { r.works[2].aliases = ['delulu'] })).toMatch(/\/work\/delulu shadows a live route/)
    expect(broken((r) => { r.redirects = { '/work/old': '/work/missing' } })).toMatch(/\/work\/old → \/work\/missing: target is not a live route/)
    expect(broken((r) => { r.works[0].slug = 'Bad Slug' })).toMatch(/slug "Bad Slug"/)
  })
  it('requires the all-work band with its strings (I.content, T51)', () => {
    expect(broken((r) => { (r.studio as { allWork?: unknown }).allWork = undefined })).toMatch(/allWork must be an object/)
    expect(broken((r) => { r.studio.allWork.poster = '' })).toMatch(/allWork: poster must be a non-empty string/)
  })
  it('rejects missing required fields and a wrong schema marker', () => {
    const msg = broken((r) => {
      r.works[0].practices = []
      ;(r.services.content[0] as Partial<RawService>).desc = undefined
      ;(r.studio as { schema: number }).schema = 1
    })
    expect(msg).toMatch(/works\[0\].*practices/)
    expect(msg).toMatch(/services\.content\[0\].*desc/)
    expect(msg).toMatch(/schema must be 2/)
  })
})

describe('validateContent partial mode (staged content/v2, T49–T51)', () => {
  const only = (r: RawContent, keep: Array<keyof RawContent>) =>
    Object.fromEntries(keep.map((k) => [k, r[k]])) as unknown as RawContent
  it('checks the documents that exist and skips checks that need missing ones', () => {
    const works = only(fixture(), ['works', 'redirects'])
    expect(validateContent(works, { partial: true })).toEqual([])
    expect(validateContent(works).join('\n')).toMatch(/services\.json|studio\.json/)
  })
  it('still catches broken documents that are present', () => {
    const r = only(fixture(), ['works', 'redirects'])
    r.works[1].title = 'Motel X'
    expect(validateContent(r, { partial: true }).join('\n')).toMatch(/duplicate work slug "motel-x"/)
    const r2 = only(fixture(), ['works'])
    r2.redirects = { '/work/delulu': '/work' }
    expect(validateContent(r2, { partial: true }).join('\n')).toMatch(/shadows a live route/)
  })
})

describe('v1 transition view (compat)', () => {
  it('projects v2 content onto the v1 page shape', () => {
    const v = toV1(buildContent(fixture()))
    expect(v.works.map((w) => [w.code, w.slug, w.cat, w.runtime, w.practice])).toEqual([
      ['NC·003', 'motel-x', 'interactive', '—', 'magic-photo-booth'],
      ['NC·002', 'delulu', 'interactive', '—', 'magic-photo-booth'],
      ['NC·001', 'ciurlionis', 'artistic', '—', 'animation-film'],
    ])
    expect(v.works[1].body).toBe('p1\n\np2')
    expect(v.servicesAll.map((s) => [s.n, s.relatedCat])).toEqual([
      ['01', 'branded'], ['02', 'artistic'], ['03', 'interactive'], ['04', 'interactive'], ['05', 'interactive'],
    ])
    expect(v.heroChapters).toMatchObject([{ slug: 'motel-x', media: { still: '/media/mx.webp', video: { mp4: '/media/mx.mp4' } } }])
    expect(v.categories).toEqual(['all', 'interactive', 'artistic'])
    expect(v.stats).toEqual([['Makers in the room', '01'], ['Main pillars', '02'], ['Projects shipped', '3']])
  })
  it('reads empty v2 lists as absent, the way v1 pages hide empty sections', () => {
    const raw = fixture()
    raw.services.content[0].modes = []
    raw.works[0].gallery = []
    const v = toV1(buildContent(raw))
    expect([v.servicesAll[0].modes, v.works[0].gallery]).toEqual([undefined, undefined])
  })
})

/* live + staged content, loaded the way the app loads it (Vite JSON imports) */
type Docs = Record<'works' | 'services' | 'people' | 'studio' | 'redirects', unknown>
const docsOf = (files: Record<string, unknown>, dir: string): Docs => {
  const get = (f: string) => files[`../../${dir}/${f}`]
  return { works: get('works.json'), services: get('services.json'), people: get('people.json'), studio: get('studio.json'), redirects: get('redirects.json') ?? {} }
}
const live = docsOf(import.meta.glob('../../content/*.json', { eager: true, import: 'default' }), 'content')
const stagedFiles = import.meta.glob('../../content/v2/*.json', { eager: true, import: 'default' })
const staged = Object.keys(stagedFiles).length > 0 ? docsOf(stagedFiles, 'content/v2') : null
const liveWorks = live.works as unknown[]
const stagedComplete = Boolean(staged?.works && staged.services && staged.people && staged.studio)
const SPEC = Object.values(import.meta.glob('../../SPEC.md', { eager: true, query: '?raw', import: 'default' }))[0] as string

describe('live content', () => {
  it.skipIf(!isV2(live.studio))('v2: passes validateContent (V26, C20)', () => {
    expect(validateContent(live as unknown as RawContent)).toEqual([])
  })
  it.skipIf(isV2(live.studio))('v1: the legacy loader still derives every route', () => {
    const v = fromV1Json(live as unknown as V1Raw)
    expect(v.works).toHaveLength(liveWorks.length)
    expect(v.works[0].code).toBe(`NC·${String(liveWorks.length).padStart(3, '0')}`)
    expect(new Set(v.works.map((w) => w.slug)).size).toBe(liveWorks.length)
  })
  it.skipIf(!staged)('staged content/v2 passes validateContent (partial until all four files are staged)', () => {
    expect(validateContent(staged as unknown as RawContent, { partial: !stagedComplete })).toEqual([])
  })
  it.skipIf(!staged?.works || Boolean(staged?.services))('staged works use only the SPEC C19 practice ids', () => {
    const c19 = SPEC.split('\n').find((l) => l.startsWith('- C19:')) ?? ''
    const m = c19.match(/content: ([a-z ]+) \| interactive: ([a-z ]+)\)/)
    const ids = new Set(`${m?.[1]} ${m?.[2]}`.trim().split(/\s+/))
    expect(ids.size).toBe(10)
    const unknown = (staged!.works as Array<{ title: string; practices: string[] }>).flatMap((w) => w.practices.filter((p) => !ids.has(p)).map((p) => `${w.title}: ${p}`))
    expect(unknown).toEqual([])
  })
  it.skipIf(!staged?.works || isV2(live.studio))('every live v1 work URL resolves in the staged works (SPEC V21, C20)', () => {
    const works = staged!.works as Array<{ title: string; slug?: string; aliases?: string[] }>
    const redirects = (staged!.redirects ?? {}) as Record<string, string>
    const reachable = new Set([...works.map((w) => w.slug ?? slugify(w.title)), ...works.flatMap((w) => w.aliases ?? []), ...Object.keys(redirects).map((k) => k.replace(/^\/work\//, ''))])
    const lost = (live.works as Array<{ title: string }>).map((w) => slugify(w.title)).filter((s) => !reachable.has(s))
    expect(lost).toEqual([])
  })
  it.skipIf(!staged?.services || isV2(live.studio))('every live v1 service URL resolves in the staged services (SPEC V21, C20)', () => {
    type Svc = { label: string; slug?: string; aliases?: string[] }
    const s = staged!.services as Record<'content' | 'interactive', Svc[]>
    const all = [...s.content, ...s.interactive]
    const redirects = (staged!.redirects ?? {}) as Record<string, string>
    const reachable = new Set([
      ...all.map((x) => x.slug ?? slugify(x.label)), ...all.flatMap((x) => x.aliases ?? []),
      ...Object.keys(redirects).filter((k) => k.startsWith('/services/')).map((k) => k.slice('/services/'.length)),
    ])
    const v1 = live.services as Record<'content' | 'interactive', Array<{ label: string }>>
    const lost = [...v1.content, ...v1.interactive].map((x) => slugify(x.label)).filter((x) => !reachable.has(x))
    expect(lost).toEqual([])
  })
})
