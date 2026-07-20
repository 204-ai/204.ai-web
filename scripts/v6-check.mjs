import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:4573'
const ROUTES = ['/', '/work', '/services', '/about', '/contact']
const WIDTHS = [360, 768, 1280, 1920]

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
const page = await browser.newPage()

let fail = 0
for (const w of WIDTHS) {
  await page.setViewport({ width: w, height: 900 })
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: 'networkidle0' })
    const res = await page.evaluate(() => {
      const de = document.documentElement
      const overflowEls = []
      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect()
        if (rect.right > window.innerWidth + 1 && rect.width > 4) {
          const cs = getComputedStyle(el)
          // ignore elements inside horizontal scroll containers
          let p = el.parentElement, scrollable = false
          while (p) {
            const pcs = getComputedStyle(p)
            if (pcs.overflowX === 'auto' || pcs.overflowX === 'scroll' || pcs.overflowX === 'hidden') { scrollable = true; break }
            p = p.parentElement
          }
          if (!scrollable) overflowEls.push(`${el.tagName}.${String(el.className).slice(0, 40)} right=${Math.round(rect.right)}`)
        }
        void csUnused(el)
      }
      function csUnused() {}
      return {
        title: document.title,
        scrollW: de.scrollWidth,
        innerW: window.innerWidth,
        h1: (() => {
          const h = document.querySelector('h1')
          return h ? Math.round(parseFloat(getComputedStyle(h).fontSize)) : null
        })(),
        overflowEls: overflowEls.slice(0, 5),
      }
    })
    const over = res.scrollW > res.innerW
    if (over) fail++
    console.log(
      `${w}px ${r.padEnd(10)} scrollW=${res.scrollW}/${res.innerW} h1=${res.h1}px ${over ? 'OVERFLOW' : 'ok'} | ${res.title.slice(0, 40)}`,
    )
    if (res.overflowEls.length) console.log('   spill:', res.overflowEls.join(' | '))
  }
}
await browser.close()
console.log(fail ? `FAIL ${fail}` : 'V6_PASS')
