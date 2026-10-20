// SPEC V10 + I.seo parity: the static route HTML that generate-meta writes (what scrapers
// read) and the head the app sets at runtime (useHead) must agree on every route.
//   npm run build && npm run preview -- --port 4573 &
//   node scripts/meta-parity.mjs [http://localhost:4573]
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const base = (process.argv[2] ?? 'http://localhost:4573').replace(/\/$/, '')
const unesc = (s) => s.replaceAll('&lt;', '<').replaceAll('&quot;', '"').replaceAll('&amp;', '&')

const pages = []
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) {
      if (f !== 'assets' && f !== 'media') walk(p)
    } else if (f === 'index.html') {
      const html = readFileSync(p, 'utf8')
      if (html.includes('http-equiv="refresh"')) continue // alias stub (SPEC V28), not a page
      const route = '/' + relative(dist, dirname(p)).split('\\').join('/')
      pages.push({
        route: route === '/' ? '/' : route,
        title: unesc(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''),
        desc: unesc(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''),
      })
    }
  }
}
walk(dist)

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const page = await browser.newPage()
const titles = new Set()
let bad = 0
for (const s of pages) {
  await page.goto(`${base}${s.route === '/' ? '/' : `${s.route}/`}`, { waitUntil: 'networkidle2' })
  await page.waitForFunction((t) => document.title === t, { timeout: 4000 }, s.title).catch(() => {})
  const live = await page.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name="description"]')?.content ?? '' }))
  titles.add(s.title)
  if (live.title !== s.title || live.desc !== s.desc) {
    bad++
    console.error(`MISMATCH ${s.route}\n  static  ${s.title} | ${s.desc}\n  runtime ${live.title} | ${live.desc}`)
  }
  if (!s.desc) {
    bad++
    console.error(`EMPTY description ${s.route}`)
  }
}
await browser.close()
if (titles.size !== pages.length) {
  bad++
  console.error(`duplicate titles: ${pages.length - titles.size}`)
}
console.log(`meta-parity: ${pages.length} routes, ${titles.size} unique titles`)
console.log(bad ? `META_PARITY_FAIL ${bad}` : 'META_PARITY_PASS')
process.exit(bad ? 1 : 0)
