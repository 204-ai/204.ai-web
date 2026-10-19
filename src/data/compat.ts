// v1 view — SPEC T48 transition shim; T65 deletes this file.
//
// The Night Shift pages read the v1 shape below. fromV1Json() is the original v1 loader,
// moved here unchanged. toV1() projects the v2 model onto the same shape, so those pages
// keep rendering after the v2 content cutover until T53–T60 replace them.

import type { Contact, Content, PartnerLogo, PersonSocials, Row } from './content'
import { slugify } from './content'

export type Scene = 'cathedral' | 'desert' | 'interior' | 'water'

export type Category = 'branded' | 'artistic' | 'mapping' | 'interactive'

export interface WorkMedia {
  still?: string
  video?: { mp4: string }
}

interface RawWorkV1 {
  title: string
  client: string
  cat: Category
  year: string
  runtime: string
  note: string
  scene: Scene
  media?: WorkMedia
  body?: string
  youtube?: string[]
  gallery?: string[]
  /* optional service slug override; defaults to the first service whose
     relatedCat matches the work's category */
  practice?: string
}

export interface Work extends RawWorkV1 {
  id: string
  code: string
  slug: string
}

interface RawServiceV1 {
  n: string
  label: string
  scene: Scene
  body: string
  still?: string
  video?: { mp4: string }
  intro?: string
  modes?: Array<{ n: string; label: string; body: string }>
  features?: Array<{ label: string; body: string }>
  relatedCat?: Category
}

export interface Service extends RawServiceV1 {
  slug: string
}

interface RawPersonV1 {
  name: string
  role: string
  photo?: string
  bio?: string
  socials?: PersonSocials
}

export interface Person extends RawPersonV1 {
  slug: string
}

export interface HeroChapter {
  code: string
  slug: string
  title: string
  client: string
  cat: Category
  scene: Scene
  media?: WorkMedia
}

/** content/*.json in the v1 shape (no "schema": 2) */
export interface V1Raw {
  works: RawWorkV1[]
  services: { content: RawServiceV1[]; interactive: RawServiceV1[] }
  people: RawPersonV1[]
  studio: {
    name: string
    suffix: string
    tag: string
    logoUrl: string
    contact: Contact
    heroChapters: string[]
    workCategories: string[]
    budgetRanges: string[]
    practice: Row[]
    pillarsCount: string
    rnaStudioUrl: string
    trustedBy: PartnerLogo[]
    partners: PartnerLogo[]
  }
}

export interface V1View {
  works: Work[]
  categories: string[]
  heroChapters: HeroChapter[]
  servicesContent: Service[]
  servicesInteractive: Service[]
  servicesAll: Service[]
  people: Person[]
  studio: { readonly name: string; readonly suffix: string; readonly tag: string }
  contact: Contact
  logoUrl: string
  practice: Row[]
  budgetRanges: string[]
  trustedBy: PartnerLogo[]
  partners: PartnerLogo[]
  rnaStudioUrl: string
  stats: Array<[string, string]>
}

const pad2 = (n: number) => String(n).padStart(2, '0')
// v1 pages hide a section when its field is absent; an empty v2 array must read the same
const some = <T,>(list: T[] | undefined): T[] | undefined => (list?.length ? list : undefined)

/** The original v1 loader: newest-first works, position-based NC codes, title slugs. */
export function fromV1Json(raw: V1Raw): V1View {
  const works: Work[] = raw.works.map((w, i) => ({
    ...w,
    id: `w${pad2(i + 1)}`,
    code: `NC·${String(raw.works.length - i).padStart(3, '0')}`,
    slug: slugify(w.title),
  }))
  const servicesContent = raw.services.content.map((s) => ({ ...s, slug: slugify(s.label) }))
  const servicesInteractive = raw.services.interactive.map((s) => ({ ...s, slug: slugify(s.label) }))
  const people = raw.people.map((p) => ({ ...p, slug: slugify(p.name) }))
  const st = raw.studio
  return {
    works,
    categories: ['all', ...st.workCategories],
    heroChapters: st.heroChapters
      .map((slug) => works.find((w) => w.slug === slug))
      .filter((w): w is Work => Boolean(w))
      .map((w) => ({ code: w.code, slug: w.slug, title: w.title, client: w.client, cat: w.cat, scene: w.scene, media: w.media })),
    servicesContent,
    servicesInteractive,
    servicesAll: [...servicesContent, ...servicesInteractive],
    people,
    studio: { name: st.name, suffix: st.suffix, tag: st.tag },
    contact: st.contact,
    logoUrl: st.logoUrl,
    practice: st.practice,
    budgetRanges: st.budgetRanges,
    trustedBy: st.trustedBy,
    partners: st.partners,
    rnaStudioUrl: st.rnaStudioUrl,
    stats: [
      ['Makers in the room', pad2(people.length)],
      ['Main pillars', st.pillarsCount],
      ['Projects shipped', String(works.length)],
    ],
  }
}

const SCENES: Scene[] = ['cathedral', 'desert', 'interior', 'water']
// placeholder art for items without media, stable per slug
const sceneFor = (slug: string): Scene => SCENES[[...slug].reduce((h, ch) => h + ch.charCodeAt(0), 0) % SCENES.length]
// v1 had four categories; for the transition the v2 practices map onto them
const V1_CATEGORY: Record<string, Category> = { branded: 'branded', fashion: 'branded', archival: 'artistic', artistic: 'artistic', immersive: 'mapping' }
const CATEGORY_ORDER: Category[] = ['interactive', 'mapping', 'branded', 'artistic']

/** The v2 model in the v1 page shape. */
export function toV1(c: Content): V1View {
  const service = new Map(c.services.map((s) => [s.id, s]))
  const catOf = (id: string): Category => V1_CATEGORY[id] ?? (service.get(id)?.pillar === 'interactive' ? 'interactive' : 'branded')
  const works: Work[] = c.works.map((w) => ({
    title: w.title,
    client: w.client,
    cat: catOf(w.practices[0]),
    year: w.year,
    runtime: '—',
    note: w.note,
    scene: sceneFor(w.slug),
    media: w.media ? { still: w.media.still, video: w.media.video } : undefined,
    body: Array.isArray(w.body) ? w.body.join('\n\n') : w.body,
    youtube: some(w.youtube),
    gallery: some(w.gallery),
    practice: service.get(w.practices[0])?.slug,
    id: w.id,
    code: w.code,
    slug: w.slug,
  }))
  const servicesAll: Service[] = c.services.map((s, i) => ({
    n: pad2(i + 1),
    label: s.label,
    scene: sceneFor(s.slug),
    body: s.desc,
    still: s.still ?? s.img,
    video: s.reels?.[0] ? { mp4: s.reels[0] } : undefined,
    intro: s.lead,
    modes: some(s.modes),
    relatedCat: catOf(s.id),
    slug: s.slug,
  }))
  const bySlug = new Map(works.map((w) => [w.slug, w]))
  return {
    works,
    categories: ['all', ...CATEGORY_ORDER.filter((cat) => works.some((w) => w.cat === cat))],
    heroChapters: c.heroClips.map((h) => {
      const w = bySlug.get(h.item.slug)!
      return { code: w.code, slug: w.slug, title: w.title, client: w.client, cat: w.cat, scene: w.scene, media: { still: h.poster, video: { mp4: h.clip } } }
    }),
    servicesContent: servicesAll.filter((_, i) => c.services[i].pillar === 'content'),
    servicesInteractive: servicesAll.filter((_, i) => c.services[i].pillar === 'interactive'),
    servicesAll,
    people: c.people,
    studio: { name: c.studio.name, suffix: c.studio.suffix, tag: c.studio.tag },
    contact: c.studio.contact,
    logoUrl: c.studio.logoUrl,
    practice: c.studio.practice,
    budgetRanges: c.studio.budgetRanges,
    trustedBy: c.studio.trustedBy,
    partners: c.studio.partners,
    rnaStudioUrl: c.studio.rnaStudioUrl,
    stats: [
      ['Makers in the room', pad2(c.stats.makers)],
      ['Main pillars', pad2(c.stats.pillars)],
      ['Projects shipped', String(c.stats.projects)],
    ],
  }
}
