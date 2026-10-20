// SPEC V21: every URL of the v1 site (content @ 5fceafb) still resolves in v2, either as a
// live route or as an alias / content/redirects.json entry that lands on one (C20, V28).
//   node scripts/url-check.mjs                         static diff of the two route sets
//   node scripts/url-check.mjs --base http://localhost:4573
//                                                      also fetch every v1 URL from a running
//                                                      `npm run preview` (stub → live page)
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildContent, liveRoutes, slugify } from '../src/data/content.ts'

const V1 = '5fceafb' // last v1 content commit (SPEC C20)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const v1doc = (f) => JSON.parse(execFileSync('git', ['show', `${V1}:content/${f}`], { cwd: root, encoding: 'utf8' }))
const v2doc = (f) => JSON.parse(readFileSync(join(root, 'content', f), 'utf8'))

// v1 route set: the v1 generate-meta derivations (slugs from titles / labels / names)
const v1services = v1doc('services.json')
const v1 = [
  '/', '/work', '/services', '/about', '/contact',
  ...v1doc('works.json').map((w) => `/work/${slugify(w.title)}`),
  ...[...v1services.content, ...v1services.interactive].map((s) => `/services/${slugify(s.label)}`),
  ...v1doc('people.json').map((p) => `/makers/${slugify(p.name)}`),
]

const raw = {
  works: v2doc('works.json'),
  services: v2doc('services.json'),
  people: v2doc('people.json'),
  studio: v2doc('studio.json'),
  redirects: existsSync(join(root, 'content', 'redirects.json')) ? v2doc('redirects.json') : {},
}
const live = liveRoutes(raw)
const { redirects } = buildContent(raw)

const kept = v1.filter((p) => live.has(p))
const moved = v1.filter((p) => !live.has(p) && redirects[p])
const lost = v1.filter((p) => !live.has(p) && !redirects[p])
const dangling = Object.entries(redirects).filter(([, to]) => !live.has(to))
console.log(`url-check: v1 ${v1.length} routes → ${kept.length} live, ${moved.length} redirected, ${lost.length} lost`)
for (const p of moved) console.log(`  ${p} → ${redirects[p]}`)
for (const p of lost) console.error(`  LOST ${p}`)
for (const [from, to] of dangling) console.error(`  DANGLING ${from} → ${to}`)
let failed = lost.length + dangling.length

const at = process.argv.indexOf('--base')
if (at > 0) {
  const base = process.argv[at + 1].replace(/\/$/, '')
  for (const p of v1) {
    const url = `${base}${p === '/' ? '/' : `${p}/`}`
    const res = await fetch(url)
    const html = await res.text()
    if (!res.ok) {
      console.error(`  HTTP ${res.status} ${url}`)
      failed++
      continue
    }
    if (redirects[p]) {
      const to = html.match(/http-equiv="refresh" content="0; url=([^"]+)"/)?.[1]
      const want = redirects[p] === '/' ? '/' : `${redirects[p]}/`
      const landed = to && (await fetch(new URL(to, `${base}/`))).ok // refresh URL is base-prefixed
      if (!to || !to.endsWith(want) || !landed) {
        console.error(`  BAD STUB ${p}: refresh=${to} want …${want}`)
        failed++
      }
    }
  }
  console.log(`url-check: fetched ${v1.length} v1 URLs from ${base}`)
}
console.log(failed ? `URL_CHECK_FAIL ${failed}` : 'URL_CHECK_PASS')
process.exit(failed ? 1 : 0)
