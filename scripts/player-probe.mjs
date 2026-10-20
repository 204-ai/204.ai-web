// Home hero rotator probe (SPEC V24, V29, B5). Run against the preview build:
//   npm run build && npm run preview -- --port 4573 &
//   node scripts/player-probe.mjs [screenshot.png]
// Prints one PASS/FAIL line per check and exits 1 if any check fails.
import puppeteer from 'puppeteer-core'

const URL = 'http://localhost:4573/'
const HERO = 'section[aria-label$="showreel"]'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
})

let failed = 0
function check(name, ok, info = '') {
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? `  (${info})` : ''}`)
}

async function open({ width = 1914, height = 915, reduced = false, saveData = false } = {}) {
  const pg = await b.newPage()
  await pg.setViewport({ width, height, deviceScaleFactor: 1 })
  if (reduced) await pg.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await pg.evaluateOnNewDocument(
    (saveData, HERO) => {
      if (saveData) Object.defineProperty(navigator, 'connection', { value: { saveData: true } })
      // flip document.hidden the way a background tab does
      let hidden = false
      Object.defineProperty(document, 'hidden', { get: () => hidden })
      Object.defineProperty(document, 'visibilityState', { get: () => (hidden ? 'hidden' : 'visible') })
      window.__setHidden = (h) => {
        hidden = h
        document.dispatchEvent(new Event('visibilitychange'))
      }
      // the most <video> elements the hero ever held at once
      window.__maxVideos = 0
      new MutationObserver(() => {
        const hero = document.querySelector(HERO)
        if (hero) window.__maxVideos = Math.max(window.__maxVideos, hero.querySelectorAll('video').length)
      }).observe(document, { subtree: true, childList: true })
    },
    saveData,
    HERO,
  )
  await pg.goto(URL, { waitUntil: 'networkidle2' })
  await pg.waitForSelector(`${HERO} button`)
  return pg
}

const state = (pg) =>
  pg.evaluate((HERO) => {
    const hero = document.querySelector(HERO)
    const v = hero.querySelector('video')
    const fill = hero.querySelector('[class*=_progress_] span')
    return {
      videos: hero.querySelectorAll('video').length,
      src: v?.getAttribute('src') ?? null,
      playing: Boolean(v && !v.paused),
      on: [...hero.querySelectorAll('button')].findIndex((d) => d.getAttribute('aria-current') === 'true'),
      progress: fill ? Number(new DOMMatrix(getComputedStyle(fill).transform).a.toFixed(3)) : null,
      poster: Boolean(hero.querySelector('img')),
    }
  }, HERO)
const setHidden = (pg, h) => pg.evaluate((h) => window.__setHidden(h), h)
const maxVideos = (pg) => pg.evaluate(() => window.__maxVideos)

// desktop: one keyed <video>, progress, dots, 'ended', hidden tab
{
  const pg = await open()
  await sleep(2500)
  let s = await state(pg)
  console.log('initial:', JSON.stringify(s))
  check('one <video>, playing, progress moving', s.videos === 1 && s.playing && s.progress > 0)
  await setHidden(pg, true)
  await sleep(400)
  check('hidden tab pauses the video (V24)', !(await state(pg)).playing)
  await setHidden(pg, false)
  await sleep(800)
  check('visible tab resumes the video', (await state(pg)).playing)
  const before = s
  await pg.click(`${HERO} button:nth-of-type(3)`)
  await sleep(800)
  s = await state(pg)
  check('dot switches footage via keyed <video> (B5)', s.on === 2 && s.src !== before.src && s.videos === 1, `${before.src} → ${s.src}`)
  await pg.evaluate((HERO) => document.querySelector(`${HERO} video`).dispatchEvent(new Event('ended')), HERO)
  await sleep(500)
  const after = await state(pg)
  check("'ended' advances to the next clip", after.on === 3 && after.src !== s.src)
  check('never more than one <video> (V29)', (await maxVideos(pg)) === 1)
  if (process.argv[2]) await pg.screenshot({ path: process.argv[2] })
  await pg.close()
}

// V29: phones, reduced motion and Save-Data get posters, never a <video>
for (const [name, opts, advances] of [
  ['≤900px', { width: 390, height: 844 }, true],
  ['reduced motion', { reduced: true }, false],
  ['Save-Data', { saveData: true }, true],
]) {
  const pg = await open(opts)
  const a = await state(pg)
  await sleep(6800)
  const z = await state(pg)
  check(`${name}: poster, no <video>`, a.poster && (await maxVideos(pg)) === 0)
  check(`${name}: ${advances ? 'still-timer advances (V29)' : 'static frame (V7)'}`, advances ? z.on === 1 : z.on === 0)
  await pg.close()
}

await b.close()
console.log(failed ? `PLAYER_PROBE_FAIL ${failed}` : 'PLAYER_PROBE_PASS')
process.exit(failed ? 1 : 0)
