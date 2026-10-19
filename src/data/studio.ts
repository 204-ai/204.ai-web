// Typed loader over content/*.json — ALL copy, projects, services, people and
// site settings live there (SPEC §C11). Components import from here and never
// touch the JSON directly, so a headless CMS can replace the JSON source
// without touching the app.
//
// Schema switch (SPEC T48): content/studio.json with "schema": 2 loads the v2
// model from ./content (I.content), exported as CONTENT for the v2 pages; the
// v1 pages keep reading the exports below through the ./compat view until
// T53–T60 replace them. Without the marker, the original v1 loader runs.
// scripts/generate-meta.mjs imports the same ./content module, so slugs,
// codes and validation cannot drift between the app and the build.

import worksRaw from '../../content/works.json' with { type: 'json' }
import servicesRaw from '../../content/services.json' with { type: 'json' }
import peopleRaw from '../../content/people.json' with { type: 'json' }
import studioRaw from '../../content/studio.json' with { type: 'json' }
import { fromV1Json, toV1, type V1Raw, type V1View } from './compat'
import { buildContent, isV2, validateContent, type Content, type RawContent } from './content'

export type { Category, HeroChapter, Person, Scene, Service, Work, WorkMedia } from './compat'
export type { PartnerLogo, PersonSocials } from './content'
export type CategoryFilter = string

// content JSON stores media as site-root paths (/media/...); prefix Vite's
// base once here so the GH Pages subpath build keeps working (SPEC V16)
const BASE = import.meta.env.BASE_URL
const rebase = <T,>(json: T): T =>
  BASE === '/' ? json : (JSON.parse(JSON.stringify(json).replaceAll('"/media/', `"${BASE}media/`)) as T)

const raw = { works: rebase(worksRaw), services: rebase(servicesRaw), people: rebase(peopleRaw), studio: rebase(studioRaw) }
const schemaV2 = isV2(raw.studio)

// broken v2 content fails loudly in dev; production builds fail in generate-meta (SPEC V26)
if (schemaV2 && import.meta.env.DEV) {
  const problems = validateContent(raw as unknown as RawContent)
  if (problems.length) throw new Error(`content/*.json breaks SPEC V26/C20:\n  ${problems.join('\n  ')}`)
}

/** v2 model for the v2 pages — null until the v2 content cutover ("schema": 2) */
export const CONTENT: Content | null = schemaV2 ? buildContent(raw as unknown as RawContent) : null

/** the v2 model, for v2 components (they only render once content is v2) */
export function v2(): Content {
  if (!CONTENT) throw new Error('v2 components need v2 content: content/studio.json "schema": 2')
  return CONTENT
}

const view: V1View = CONTENT ? toV1(CONTENT) : fromV1Json(raw as unknown as V1Raw)

export const WORKS = view.works
export const SERVICES_CONTENT = view.servicesContent
export const SERVICES_INTERACTIVE = view.servicesInteractive
export const SERVICES_ALL = view.servicesAll
export const PEOPLE = view.people
export const STUDIO = view.studio
export const CONTACT = view.contact
export const LOGO_URL = view.logoUrl
export const CATEGORIES = view.categories
/* hero reel = works referenced by slug in content/studio.json */
export const HERO_CHAPTERS = view.heroChapters
export const PRACTICE = view.practice
export const BUDGET_RANGES = view.budgetRanges
export const TRUSTED_BY = view.trustedBy
export const PARTNERS = view.partners
export const RNA_STUDIO_URL = view.rnaStudioUrl
/* stats derive from the content — adding a project or maker updates them */
export const STATS = view.stats
