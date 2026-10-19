// Content model v2 (SPEC I.content · C19 · C20 · V26).
//
// Pure TypeScript with no runtime imports, shared by src/data/studio.ts (the app),
// scripts/generate-meta.mjs (Node loads this .ts file directly, so erasable syntax only:
// no enums, namespaces or parameter properties) and src/data/content.test.ts.
// buildContent() turns the raw content/*.json documents into the derived model;
// validateContent() lists every rule the documents break.

/* ---------- raw documents: content/*.json with studio.json "schema": 2 ---------- */

export interface Media {
  still?: string
  video?: { mp4: string }
  /** CSS object-position for crops, e.g. "50% 30%" */
  focus?: string
}

export interface RawWork {
  title: string
  client: string
  /** service ids (SPEC C19); the first one is the primary practice */
  practices: string[]
  year: string
  note: string
  media?: Media
  /** overrides the title-derived slug (SPEC C20) */
  slug?: string
  /** former slugs that keep resolving as redirects (SPEC C20) */
  aliases?: string[]
  place?: string
  date?: string
  products?: string
  body?: string | string[]
  collab?: { label: string; name: string }
  credits?: Array<{ name: string; role: string; handle?: string }>
  youtube?: string[]
  gallery?: string[]
  logo?: string
  wide?: boolean
  /** display label; defaults to the label of practices[0] */
  format?: string
}

export interface ServiceMode {
  n: string
  label: string
  body: string
}

export interface RawService {
  /** practice key that works[].practices reference */
  id: string
  label: string
  /** display title; "\n" marks the line break */
  title: string
  desc: string
  img: string
  lead: string
  modes: ServiceMode[]
  included: string
  cta: string
  slug?: string
  aliases?: string[]
  reels?: string[]
  still?: string
}

export interface PersonSocials {
  instagram?: string
  linkedin?: string
  web?: string
  email?: string
}

export interface RawPerson {
  name: string
  role: string
  photo?: string
  bio?: string
  socials?: PersonSocials
}

export interface PartnerLogo {
  name: string
  logo: string
  /** internal path (project page) or external site — only set links render as anchors */
  url?: string
}

export interface Row {
  n: string
  label: string
  body: string
}

export interface HeroClip {
  /** work slug */
  work: string
  clip: string
  poster: string
  /** caption override, e.g. "Motel X — Vinte Anos"; defaults to the work title */
  title?: string
  kind?: string
  place?: string
}

/** a home "featured work" band; every field but `work` overrides what the work provides */
export interface FeaturedBand {
  /** work slug */
  work: string
  /** two-line band title ("\n" = line break); defaults to the work title */
  title?: string
  /** category line; defaults to the primary service title */
  label?: string
  poster?: string
  clip?: string
  focus?: string
}

/** the band after the featured ones that opens /work */
export interface AllWorkBand {
  title: string
  label: string
  client: string
  year: string
  poster: string
  clip?: string
  focus?: string
}

export interface Contact {
  email: string
  studio: string
  instagram: string
  instagramUrl: string
  linkedin: string
  linkedinUrl: string
  map?: { image?: string; url: string }
}

export interface Closer {
  label: string
  title: string
  cta: string
}

/** paragraph copy; `**…**` marks bold. Headlines and UI labels stay in page code, as in v1. */
export interface Copy {
  home: { who: string; marquee: string }
  closer: Closer
  footer: { blurb: string }
  about: { lead: string }
  contact: { lead: string }
  portfolio: { lead: string; closer: Closer }
}

export interface Footer {
  address: string
  socials: Array<{ label: string; url: string }>
}

export interface RawStudio {
  schema: 2
  name: string
  suffix: string
  tag: string
  logoUrl: string
  contact: Contact
  heroClips: HeroClip[]
  featured: FeaturedBand[]
  allWork: AllWorkBand
  /** home process dial */
  process: Row[]
  /** about page rows */
  practice: Row[]
  copy: Copy
  footer: Footer
  budgetRanges: string[]
  rnaStudioUrl: string
  trustedBy: PartnerLogo[]
  partners: PartnerLogo[]
}

export const PILLARS = ['content', 'interactive'] as const
export type Pillar = (typeof PILLARS)[number]

export interface RawContent {
  works: RawWork[]
  services: Record<Pillar, RawService[]>
  people: RawPerson[]
  studio: RawStudio
  /** content/redirects.json: removed or moved routes, old path → live path (SPEC C20) */
  redirects?: Record<string, string>
}

/* ---------- derived model ---------- */

export interface Work extends RawWork {
  id: string
  /** NC·0NN ref code, position-based: newest (first) = highest */
  code: string
  slug: string
  format: string
}

export interface Service extends RawService {
  pillar: Pillar
  /** 01, 02, … within the pillar, in JSON order */
  n: string
  slug: string
  /** works whose practices include this service, in JSON order (SPEC C19) */
  works: Work[]
}

export interface Person extends RawPerson {
  slug: string
}

export interface Content {
  works: Work[]
  services: Service[]
  pillars: Record<Pillar, Service[]>
  people: Person[]
  studio: RawStudio
  heroClips: Array<HeroClip & { item: Work }>
  featured: Array<FeaturedBand & { item: Work }>
  /** aliases ∪ redirects.json, old path → live path */
  redirects: Record<string, string>
  stats: { makers: number; pillars: number; projects: number }
}

/** schema switch: v2 content declares "schema": 2 in studio.json */
export const isV2 = (studio: unknown): boolean => (studio as { schema?: unknown } | null)?.schema === 2

/** URL rule shared with v1 (SPEC C11/C20): renaming a title changes its URL */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const pad2 = (n: number) => String(n).padStart(2, '0')
const workSlug = (w: RawWork) => w.slug ?? slugify(w.title)
const serviceSlug = (s: RawService) => s.slug ?? slugify(s.label)

interface Redirect {
  from: string
  to: string
  origin: string
}

function redirectList(raw: RawContent): Redirect[] {
  const out: Redirect[] = []
  ;(raw.works ?? []).forEach((w, i) => {
    for (const a of w.aliases ?? []) out.push({ from: `/work/${a}`, to: `/work/${workSlug(w)}`, origin: `works[${i}] alias "${a}"` })
  })
  for (const pillar of PILLARS) {
    ;(raw.services?.[pillar] ?? []).forEach((s, i) => {
      for (const a of s.aliases ?? []) out.push({ from: `/services/${a}`, to: `/services/${serviceSlug(s)}`, origin: `services.${pillar}[${i}] alias "${a}"` })
    })
  }
  for (const [from, to] of Object.entries(raw.redirects ?? {})) out.push({ from, to, origin: `redirects.json "${from}"` })
  return out
}

/** every path the site serves (SPEC I.routes) */
export function liveRoutes(raw: RawContent): Set<string> {
  return new Set([
    '/', '/work', '/services', '/about', '/contact',
    ...(raw.works ?? []).map((w) => `/work/${workSlug(w)}`),
    ...PILLARS.flatMap((p) => (raw.services?.[p] ?? []).map((s) => `/services/${serviceSlug(s)}`)),
    ...(raw.people ?? []).map((p) => `/makers/${slugify(p.name)}`),
  ])
}

export function buildContent(raw: RawContent): Content {
  const services: Service[] = PILLARS.flatMap((pillar) =>
    raw.services[pillar].map((s, i) => ({ ...s, pillar, n: pad2(i + 1), slug: serviceSlug(s), works: [] as Work[] })),
  )
  const byId = new Map(services.map((s) => [s.id, s]))
  const works: Work[] = raw.works.map((w, i) => ({
    ...w,
    id: `w${pad2(i + 1)}`,
    code: `NC·${String(raw.works.length - i).padStart(3, '0')}`,
    slug: workSlug(w),
    format: w.format ?? byId.get(w.practices[0])?.label ?? '',
  }))
  for (const w of works) for (const id of w.practices) byId.get(id)?.works.push(w)
  const bySlug = new Map(works.map((w) => [w.slug, w]))
  const people = raw.people.map((p) => ({ ...p, slug: slugify(p.name) }))
  return {
    works,
    services,
    pillars: {
      content: services.filter((s) => s.pillar === 'content'),
      interactive: services.filter((s) => s.pillar === 'interactive'),
    },
    people,
    studio: raw.studio,
    heroClips: raw.studio.heroClips.flatMap((h) => {
      const item = bySlug.get(h.work)
      return item ? [{ ...h, item }] : []
    }),
    featured: raw.studio.featured.flatMap((f) => {
      const item = bySlug.get(f.work)
      return item ? [{ ...f, item }] : []
    }),
    redirects: Object.fromEntries(redirectList(raw).map((r) => [r.from, r.to])),
    stats: { makers: people.length, pillars: PILLARS.filter((p) => raw.services[p].length > 0).length, projects: works.length },
  }
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type Doc = 'works' | 'services' | 'people' | 'studio'
const SECTIONS: Array<[string, Doc]> = [['/work/', 'works'], ['/services/', 'services'], ['/makers/', 'people']]
const sectionOf = (path: string) => SECTIONS.find(([prefix]) => path.startsWith(prefix))?.[1]

/**
 * Every rule the raw documents break (SPEC V26 closed taxonomy, C20 URL stability).
 * `partial` (staged content/v2 while T49–T51 port it): documents that are absent are
 * skipped, and so is every check that needs one of them; present documents are checked
 * in full.
 */
export function validateContent(raw: RawContent, { partial = false }: { partial?: boolean } = {}): string[] {
  const out: string[] = []
  const at = (where: string, msg: string) => out.push(`${where}: ${msg}`)
  const isStr = (v: unknown) => typeof v === 'string' && v.trim() !== ''
  const named = (v: unknown) => (isStr(v) ? ` "${v}"` : '')
  const need = (obj: unknown, where: string, strings: string[], arrays: string[] = []) => {
    const o = (obj ?? {}) as Record<string, unknown>
    for (const k of strings) if (!isStr(o[k])) at(where, `${k} must be a non-empty string`)
    for (const k of arrays) if (!Array.isArray(o[k])) at(where, `${k} must be an array`)
  }
  const present: Record<Doc, boolean> = {
    works: raw.works !== undefined, services: raw.services !== undefined,
    people: raw.people !== undefined, studio: raw.studio !== undefined,
  }
  const want = (doc: Doc) => !partial || present[doc]

  const st = (raw.studio ?? {}) as unknown as Record<string, unknown>
  if (want('studio')) {
    if (st.schema !== 2) at('studio.json', 'schema must be 2')
    need(st, 'studio.json', ['name', 'suffix', 'tag', 'logoUrl', 'rnaStudioUrl'], ['heroClips', 'featured', 'process', 'practice', 'budgetRanges', 'trustedBy', 'partners'])
    for (const k of ['contact', 'copy', 'footer', 'allWork']) if (!st[k] || typeof st[k] !== 'object') at('studio.json', `${k} must be an object`)
    if (st.allWork && typeof st.allWork === 'object') need(st.allWork, 'studio.allWork', ['title', 'label', 'client', 'year', 'poster'])
  }

  const ids = new Set<string>()
  const serviceSlugs = new Set<string>()
  if (want('services')) {
    for (const pillar of PILLARS) {
      const list = raw.services?.[pillar]
      if (!Array.isArray(list)) {
        at('services.json', `${pillar} must be an array`)
        continue
      }
      list.forEach((s, i) => {
        const where = `services.${pillar}[${i}]${named(s?.label)}`
        need(s, where, ['id', 'label', 'title', 'desc', 'img', 'lead', 'included', 'cta'], ['modes'])
        if (isStr(s.id)) {
          if (ids.has(s.id)) at(where, `duplicate service id "${s.id}"`)
          ids.add(s.id)
        }
        if (s.slug !== undefined && !SLUG.test(s.slug)) at(where, `slug "${s.slug}" must be lowercase-kebab`)
        else if (isStr(s.label)) {
          const slug = serviceSlug(s)
          if (serviceSlugs.has(slug)) at(where, `duplicate service slug "${slug}"`)
          serviceSlugs.add(slug)
        }
      })
    }
  }

  const workSlugs = new Set<string>()
  if (want('works')) {
    if (!Array.isArray(raw.works)) at('works.json', 'must be an array')
    for (const [i, w] of (Array.isArray(raw.works) ? raw.works : []).entries()) {
      const where = `works[${i}]${named(w?.title)}`
      need(w, where, ['title', 'client', 'year', 'note'])
      if (!Array.isArray(w.practices) || w.practices.length === 0) at(where, 'practices must be a non-empty array of service ids')
      else if (want('services')) for (const p of w.practices) if (!ids.has(p)) at(where, `practice "${p}" is not a service id (SPEC V26)`)
      if (w.slug !== undefined && !SLUG.test(w.slug)) at(where, `slug "${w.slug}" must be lowercase-kebab`)
      else if (isStr(w.title)) {
        const slug = workSlug(w)
        if (workSlugs.has(slug)) at(where, `duplicate work slug "${slug}"`)
        workSlugs.add(slug)
      }
    }
  }

  if (want('people')) {
    if (!Array.isArray(raw.people)) at('people.json', 'must be an array')
    for (const [i, p] of (Array.isArray(raw.people) ? raw.people : []).entries()) need(p, `people[${i}]${named(p?.name)}`, ['name', 'role'])
  }

  if (want('studio') && want('works')) {
    for (const [i, h] of (Array.isArray(st.heroClips) ? (st.heroClips as HeroClip[]) : []).entries()) {
      if (!workSlugs.has(h?.work)) at(`studio.heroClips[${i}]`, `work "${h?.work}" is not a work slug (SPEC V26)`)
      need(h, `studio.heroClips[${i}]`, ['clip', 'poster'])
    }
    for (const [i, f] of (Array.isArray(st.featured) ? (st.featured as FeaturedBand[]) : []).entries()) {
      if (!workSlugs.has(f?.work)) at(`studio.featured[${i}]`, `"${f?.work}" is not a work slug (SPEC V26)`)
    }
  }

  // aliases and redirects never shadow a live route and always land on one (SPEC C20);
  // they need sound documents, so they run once everything above passes
  if (out.length) return out
  const live = liveRoutes(raw)
  const known = (path: string) => !partial || !sectionOf(path) || present[sectionOf(path)!]
  const seen = new Map<string, string>()
  for (const r of redirectList(raw)) {
    if (!r.from.startsWith('/') || !r.to.startsWith('/')) at(r.origin, 'paths must start with "/"')
    if (known(r.from) && live.has(r.from)) at(r.origin, `${r.from} shadows a live route (SPEC C20)`)
    if (known(r.to) && !live.has(r.to)) at(r.origin, `${r.from} → ${r.to}: target is not a live route (SPEC C20)`)
    if (seen.has(r.from)) at(r.origin, `${r.from} is already redirected by ${seen.get(r.from)}`)
    seen.set(r.from, r.origin)
  }
  return out
}
