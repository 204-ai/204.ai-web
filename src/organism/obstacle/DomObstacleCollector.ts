// Collects opt-in DOM obstacles (SPEC I.organism, handoff §6/§8).
// Only elements carrying data-organism-obstacle participate. Layout reads
// happen exclusively when the dirty flag is set — never per render frame
// on a static page (V19).

import { viewportPxToSimulation, type Viewport } from './ObstacleCoordinates'
import type { SimRect } from '../math/sdf'

/* rasterize an element's glyphs into a signed-distance grid (sim units).
   Two-pass chamfer transform over the ink bitmap. */
function buildTextGrid(el: HTMLElement, rectPx: DOMRect, viewportH: number): SimRect['textGrid'] {
  const gw = Math.min(128, Math.max(24, Math.round(rectPx.width / 4)))
  const gh = Math.min(96, Math.max(16, Math.round(rectPx.height / 4)))
  const cv = document.createElement('canvas')
  cv.width = gw
  cv.height = gh
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  if (!ctx) return undefined
  const cs = getComputedStyle(el)
  ctx.scale(gw / rectPx.width, gh / rectPx.height)
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff'
  ctx.fillText(el.textContent ?? '', 0, rectPx.height * 0.8)
  const img = ctx.getImageData(0, 0, gw, gh).data
  const INF = 1e9
  const dOut = new Float32Array(gw * gh)
  const dIn = new Float32Array(gw * gh)
  for (let i = 0; i < gw * gh; i++) {
    const ink = img[i * 4 + 3] > 100
    dOut[i] = ink ? 0 : INF
    dIn[i] = ink ? INF : 0
  }
  const chamfer = (d: Float32Array) => {
    for (let y = 0; y < gh; y++)
      for (let x = 0; x < gw; x++) {
        const i = y * gw + x
        if (x > 0) d[i] = Math.min(d[i], d[i - 1] + 1)
        if (y > 0) d[i] = Math.min(d[i], d[i - gw] + 1)
        if (x > 0 && y > 0) d[i] = Math.min(d[i], d[i - gw - 1] + 1.414)
        if (x < gw - 1 && y > 0) d[i] = Math.min(d[i], d[i - gw + 1] + 1.414)
      }
    for (let y = gh - 1; y >= 0; y--)
      for (let x = gw - 1; x >= 0; x--) {
        const i = y * gw + x
        if (x < gw - 1) d[i] = Math.min(d[i], d[i + 1] + 1)
        if (y < gh - 1) d[i] = Math.min(d[i], d[i + gw] + 1)
        if (x < gw - 1 && y < gh - 1) d[i] = Math.min(d[i], d[i + gw + 1] + 1.414)
        if (x > 0 && y < gh - 1) d[i] = Math.min(d[i], d[i + gw - 1] + 1.414)
      }
  }
  chamfer(dOut)
  chamfer(dIn)
  // cells → sim units (cell width in sim = elWidth/vh/gw)
  const cellSim = rectPx.width / viewportH / gw
  const data = new Float32Array(gw * gh)
  for (let i = 0; i < gw * gh; i++) data[i] = (dOut[i] > 0 ? dOut[i] : -dIn[i]) * cellSim
  return { gw, gh, data }
}

export type CollectedObstacle = {
  rect: SimRect
  /* extra protected spacing, sim units (from data-organism-padding, CSS px) */
  paddingSim: number
  /* glyph colliders: what to draw into the GPU mask */
  text?: { content: string; fontPx: number; family: string; weight: string }
}

export class DomObstacleCollector {
  private dirty = true
  private observers: ResizeObserver
  private mutationObserver: MutationObserver | null = null
  private scrollScheduled = false
  private onInvalidateCallbacks: Array<() => void> = []
  private elements: HTMLElement[] = []

  private periodicId: number

  constructor(private root: Document = document, observeMutations = false) {
    this.observers = new ResizeObserver(() => this.invalidate())
    window.addEventListener('resize', this.invalidate, { passive: true })
    window.addEventListener('scroll', this.onScroll, { passive: true })
    // safety net: transforms/animations move elements without resizing them
    // — a low-frequency revalidation catches drift (a handful of rect reads
    // every few seconds, far from per-frame — V19)
    this.periodicId = window.setInterval(this.invalidate, 2500)
    if (observeMutations) {
      this.mutationObserver = new MutationObserver(() => this.invalidate())
      this.mutationObserver.observe(this.root.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['data-organism-obstacle', 'data-organism-hidden'],
      })
    }
    this.rescan()
  }

  /** Re-query the document for obstacle elements (route changes etc.). */
  rescan = () => {
    this.observers.disconnect()
    this.elements = Array.from(this.root.querySelectorAll<HTMLElement>('[data-organism-obstacle]'))
    for (const el of this.elements) this.observers.observe(el)
    this.invalidate()
  }

  invalidate = () => {
    this.dirty = true
    for (const cb of this.onInvalidateCallbacks) cb()
  }

  onInvalidate(cb: () => void) {
    this.onInvalidateCallbacks.push(cb)
  }

  private onScroll = () => {
    // throttle to one invalidation per frame (handoff §8)
    if (this.scrollScheduled) return
    this.scrollScheduled = true
    requestAnimationFrame(() => {
      this.scrollScheduled = false
      this.invalidate()
    })
  }

  get isDirty() {
    return this.dirty
  }

  /** Reads layout. Only call when dirty (beforeFrame pattern). */
  collect(viewport: Viewport): CollectedObstacle[] {
    this.dirty = false
    const out: CollectedObstacle[] = []
    const h = Math.max(viewport.height, 1)
    for (const el of this.elements) {
      if (el.dataset.organismHidden === 'true') continue
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) continue
      if (r.bottom < 0 || r.top > viewport.height || r.right < 0 || r.left > viewport.width) continue
      const paddingPx = Number(el.dataset.organismPadding ?? '16')
      const weight = Number(el.dataset.organismWeight ?? '1')
      const allowTendrils = el.dataset.organismAllowTendrils === 'true'
      const circle = el.dataset.organismShape === 'circle'
      const isText = el.dataset.organismShape === 'text'
      const textGrid = isText ? buildTextGrid(el, r, h) : undefined
      // convert DOM rect (top-left) to sim-space center + half extents
      const a = viewportPxToSimulation(r.left, r.top, viewport)
      const b = viewportPxToSimulation(r.right, r.bottom, viewport)
      const cs2 = isText ? getComputedStyle(el) : null
      out.push({
        text: isText ? { content: el.textContent ?? '', fontPx: parseFloat(cs2!.fontSize), family: cs2!.fontFamily, weight: cs2!.fontWeight } : undefined,
        rect: {
          cx: (a.x + b.x) / 2,
          cy: (a.y + b.y) / 2,
          hw: Math.abs(b.x - a.x) / 2,
          hh: Math.abs(a.y - b.y) / 2,
          weight: Number.isFinite(weight) ? weight : 1,
          allowTendrils,
          circle,
          textGrid,
        },
        paddingSim: (Number.isFinite(paddingPx) ? paddingPx : 16) / h,
      })
    }
    return out
  }

  dispose() {
    window.clearInterval(this.periodicId)
    this.observers.disconnect()
    this.mutationObserver?.disconnect()
    window.removeEventListener('resize', this.invalidate)
    window.removeEventListener('scroll', this.onScroll)
    this.onInvalidateCallbacks.length = 0
  }
}
