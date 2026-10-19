// Typed loader over content/*.json — ALL copy, projects, services, people and
// site settings live there (SPEC §C11). Components import from here and never
// touch the JSON directly, so a headless CMS can replace the JSON source
// without touching the app. Derivations and validation live in ./content,
// which scripts/generate-meta.mjs imports too, so slugs, codes and checks
// cannot drift between the app and the build.

import worksRaw from '../../content/works.json' with { type: 'json' }
import servicesRaw from '../../content/services.json' with { type: 'json' }
import peopleRaw from '../../content/people.json' with { type: 'json' }
import studioRaw from '../../content/studio.json' with { type: 'json' }
import { buildContent, isV2, validateContent, type Content, type RawContent } from './content'

// content JSON stores media as site-root paths (/media/...); prefix Vite's
// base once here so the GH Pages subpath build keeps working (SPEC V16)
const BASE = import.meta.env.BASE_URL
const rebase = <T,>(json: T): T =>
  BASE === '/' ? json : (JSON.parse(JSON.stringify(json).replaceAll('"/media/', `"${BASE}media/`)) as T)

// optional content/redirects.json: removed pages → live paths (SPEC C20); route paths, not media
const redirectsRaw =
  Object.values(import.meta.glob<Record<string, string>>('../../content/redirects.json', { eager: true, import: 'default' }))[0] ?? {}

const raw = {
  works: rebase(worksRaw),
  services: rebase(servicesRaw),
  people: rebase(peopleRaw),
  studio: rebase(studioRaw),
  redirects: redirectsRaw,
}
if (!isV2(raw.studio)) throw new Error('content/studio.json must declare "schema": 2 (SPEC I.content)')

// broken content fails loudly in dev; production builds fail in generate-meta (SPEC V26)
if (import.meta.env.DEV) {
  const problems = validateContent(raw as unknown as RawContent)
  if (problems.length) throw new Error(`content/*.json breaks SPEC V26/C20:\n  ${problems.join('\n  ')}`)
}

/** the content model (SPEC I.content) */
export const CONTENT: Content = buildContent(raw as unknown as RawContent)

/** the content model, for components */
export function v2(): Content {
  return CONTENT
}
