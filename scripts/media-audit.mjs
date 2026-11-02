// media-audit (SPEC V22 · V15) — read-only check of public/media/.
//
//   node scripts/media-audit.mjs            report; exit 1 on any finding
//   node scripts/media-audit.mjs --orphans  print orphan paths only (e.g. | xargs git rm)
//
// Referenced = every media/<file> literal in content/*.json, src/, index.html and
// scripts/generate-meta.mjs; a rendition (-p-<w>) is claimed by its base file. Findings:
// orphans (on disk, unreferenced), missing (referenced, not on disk), V15 per-file caps and
// the V15 total. Gallery base caps use the roles in scripts/media-manifest.json.

import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BUDGET, KB, MB, auditMedia, readManifest } from './media-lib.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const res = auditMedia({ root: ROOT, manifest: readManifest(join(ROOT, 'scripts', 'media-manifest.json')) })

if (process.argv.includes('--orphans')) {
  for (const f of res.orphans) console.log(`public/media/${f}`)
} else {
  const size = (b) => (b >= MB ? `${(b / MB).toFixed(1)} MB` : `${Math.round(b / KB)} KB`)
  const list = (title, items) => {
    console.log(`${title}: ${items.length}`)
    for (const i of items.slice(0, 40)) console.log(`  ${i}`)
    if (items.length > 40) console.log(`  … ${items.length - 40} more`)
  }
  console.log(`public/media: ${res.files} files, ${size(res.totalBytes)} (V15 total ≤ ${size(BUDGET.totalBytes)}: ${res.totalOver ? 'OVER' : 'ok'})`)
  console.log(`referenced paths: ${res.refs.length}`)
  list('missing (referenced, not on disk)', res.missing)
  list('orphans (on disk, unreferenced)', res.orphans)
  list('over a V15 cap', res.over.map((o) => `${o.file} ${size(o.bytes)} > ${o.rule} ${size(o.cap)}`))
  const findings = res.missing.length + res.orphans.length + res.over.length + (res.totalOver ? 1 : 0)
  console.log(findings ? 'MEDIA_AUDIT_FAIL' : 'MEDIA_AUDIT_PASS')
  process.exitCode = findings ? 1 : 0
}
