// SPEC V7/V24/V25 (T63), against `npm run preview -- --port 4573`:
//  motion   every route under prefers-reduced-motion: no infinite animation running, no <video>
//           mounted; with motion allowed, a hidden tab pauses every <video> (CSS keyframes exempt)
//  keyboard Tab through each page type: every stop shows a 2px focus ring (or the form fields'
//           signal edge), lands in view, is not clipped away by a loop or mask, and hidden loop
//           duplicates never take focus
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4573'
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const PAGE_TYPES = ['/', '/work', '/work/motel-x', '/services', '/services/magic-mirror', '/about', '/makers/dimitri-de-jonghe', '/contact']
const url = (r) => `${BASE}${r === '/' ? '/' : `${r}/`}`
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const routes = []
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) {
      if (f !== 'assets' && f !== 'media') walk(p)
    } else if (f === 'index.html' && !readFileSync(p, 'utf8').includes('http-equiv="refresh"')) {
      const r = '/' + relative(dist, dirname(p)).split('\\').join('/')
      routes.push(r === '/' ? '/' : r)
    }
  }
}
walk(dist)

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const bad = []

// motion
const reduced = await browser.newPage()
await reduced.setViewport({ width: 1440, height: 900 })
await reduced.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
const live = await browser.newPage()
await live.setViewport({ width: 1440, height: 900 })
await live.evaluateOnNewDocument(() => {
  let h = false
  Object.defineProperty(document, 'hidden', { get: () => h })
  window.__hide = () => {
    h = true
    document.dispatchEvent(new Event('visibilitychange'))
  }
})
let videoRoutes = 0
for (const r of routes) {
  await reduced.goto(url(r), { waitUntil: 'networkidle2' })
  await reduced.mouse.move(700, 450) // the cursor ring only runs after pointer movement
  await wait(400)
  const rm = await reduced.evaluate(() => ({
    infinite: document
      .getAnimations()
      .filter((a) => a.effect?.getTiming().iterations === Infinity && a.playState === 'running')
      .map((a) => a.animationName ?? a.constructor.name),
    videos: document.querySelectorAll('video').length,
  }))
  if (rm.infinite.length || rm.videos) bad.push(`motion ${r} (reduced): ${JSON.stringify(rm)}`)
  await live.goto(url(r), { waitUntil: 'networkidle2' })
  await wait(1200)
  if (await live.evaluate(() => document.querySelectorAll('video').length)) {
    videoRoutes++
    await live.evaluate(() => window.__hide())
    await wait(400)
    const playing = await live.evaluate(() => [...document.querySelectorAll('video')].filter((v) => !v.paused).length)
    if (playing) bad.push(`motion ${r} (hidden tab): ${playing} video(s) still playing`)
  }
}

// keyboard
const kb = await browser.newPage()
await kb.setViewport({ width: 1440, height: 900 })
let stops = 0
for (const p of PAGE_TYPES) {
  await kb.goto(url(p), { waitUntil: 'networkidle2' })
  const seen = new Set()
  for (let i = 0; i < 160; i++) {
    await kb.keyboard.press('Tab')
    await wait(50)
    const f = await kb.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      let vis = { l: Math.max(r.left, 0), t: Math.max(r.top, 0), r: Math.min(r.right, innerWidth), b: Math.min(r.bottom, innerHeight) }
      for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const o = getComputedStyle(a)
        const clips = (v) => ['hidden', 'clip', 'auto', 'scroll'].includes(v)
        if (clips(o.overflowX) || clips(o.overflowY)) {
          const ar = a.getBoundingClientRect()
          vis = { l: Math.max(vis.l, ar.left), t: Math.max(vis.t, ar.top), r: Math.min(vis.r, ar.right), b: Math.min(vis.b, ar.bottom) }
        }
      }
      const area = Math.max(0, vis.r - vis.l) * Math.max(0, vis.b - vis.t)
      const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('href') || el.name || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40)
      return {
        key: `${el.tagName}|${label}|${el.getAttribute('href') ?? ''}`,
        label,
        ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || (cs.boxShadow !== 'none' && /rgb\(90, 166, 255\)/.test(cs.boxShadow + cs.borderBottomColor)),
        visible: r.width * r.height > 0 ? area / (r.width * r.height) : 0,
        hiddenDup: Boolean(el.closest('[aria-hidden="true"]')),
      }
    })
    if (!f || seen.has(f.key)) break
    seen.add(f.key)
    stops++
    if (!f.ring || f.visible < 0.5 || f.hiddenDup) bad.push(`keyboard ${p} "${f.label}": ring=${f.ring} visible=${f.visible.toFixed(2)} hiddenDup=${f.hiddenDup}`)
  }
}
await browser.close()
console.log(`a11y-check: motion on ${routes.length} routes (${videoRoutes} with video), keyboard ${stops} stops on ${PAGE_TYPES.length} page types`)
console.log(bad.length ? 'A11Y_CHECK_FAIL\n' + bad.slice(0, 30).join('\n') : 'A11Y_CHECK_PASS')
process.exit(bad.length ? 1 : 0)
