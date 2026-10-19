// SPEC V6: no horizontal overflow at 360 / 768 / 1280 / 1920 on every route (T63), and no
// element spilling past the viewport unless a clipping container below <body> holds it
// (html, body and <main> never count: clipping there would only mask a spill).
//   npm run build && npm run preview -- --port 4573 &
//   node scripts/v6-check.mjs            every route in dist (alias stubs skipped)
//   node scripts/v6-check.mjs --quick    the five top-level pages
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:4573'
const WIDTHS = [360, 768, 1280, 1920]
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const routes = []
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) {
      if (f !== 'assets' && f !== 'media') walk(p)
    } else if (f === 'index.html' && !readFileSync(p, 'utf8').includes('http-equiv="refresh"')) {
      const r = '/' + relative(dist, dirname(p)).split('\\').join('/')
      routes.push(r === '/' ? '/' : r)
    }
  }
}
if (process.argv.includes('--quick')) routes.push('/', '/work', '/services', '/about', '/contact')
else walk(dist)
routes.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
const page = await browser.newPage()
let fail = 0
for (const w of WIDTHS) {
  await page.setViewport({ width: w, height: 900 })
  for (const r of routes) {
    await page.goto(BASE + (r === '/' ? '/' : `${r}/`), { waitUntil: 'domcontentloaded', timeout: 60000 })
    await new Promise((res) => setTimeout(res, 500))
    const res = await page.evaluate(() => {
      const de = document.documentElement
      const clipped = (el) => {
        // page-level wrappers never count: <main> clips for the entrance animations (B-scrollbar
        // flash), which would hide any spill exactly like body/html would
        for (let a = el.parentElement; a && a !== document.body && a !== de && a.tagName !== 'MAIN'; a = a.parentElement) {
          const x = getComputedStyle(a).overflowX
          if (x === 'hidden' || x === 'clip' || x === 'auto' || x === 'scroll') return true
        }
        return false
      }
      const fixed = (el) => {
        for (let a = el; a; a = a.parentElement) if (getComputedStyle(a).position === 'fixed') return true
        return false
      }
      const spill = []
      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect()
        // fixed layers (grain, nav, lightbox) sit on the viewport and cannot create scroll
        if (rect.right > window.innerWidth + 1 && rect.width > 4 && !fixed(el) && !clipped(el)) spill.push(`${el.tagName}.${String(el.className).slice(0, 40)} right=${Math.round(rect.right)}`)
      }
      const h = document.querySelector('h1')
      return { title: document.title, scrollW: de.scrollWidth, innerW: window.innerWidth, h1: h ? Math.round(parseFloat(getComputedStyle(h).fontSize)) : null, spill: spill.slice(0, 5), spills: spill.length }
    })
    const bad = res.scrollW > res.innerW || res.spills > 0
    if (bad) fail++
    if (bad || routes.length <= 5) console.log(`${w}px ${r.padEnd(34)} scrollW=${res.scrollW}/${res.innerW} h1=${res.h1}px ${bad ? 'OVERFLOW' : 'ok'} | ${res.title.slice(0, 40)}`)
    if (res.spill.length) console.log('   spill:', res.spill.join(' | '))
  }
}
await browser.close()
console.log(`v6-check: ${routes.length} routes × ${WIDTHS.length} widths`)
console.log(fail ? `FAIL ${fail}` : 'V6_PASS')
process.exit(fail ? 1 : 0)
