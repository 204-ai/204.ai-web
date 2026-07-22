// Rasterizes collected obstacles into a low-res RGBA mask (handoff §9).
// Channels: R hard occupancy, G comfort occupancy, B weight (0..1 = w/4)
// + tendril-permission high bit. Canvas draws top-left; CanvasTexture
// uploads with flipY so GPU sampling lives in bottom-left obstacle-uv
// space. The mask stays a FIXED square (fieldWidth²) across resizes —
// texel anisotropy is compensated in the SDF's distance metric, which
// keeps GPU texture allocations and shader node references stable.

import * as THREE from 'three/webgpu'
import type { CollectedObstacle } from './DomObstacleCollector'
import type { Viewport } from './ObstacleCoordinates'

export class ObstacleMask {
  /* tinted ink bitmaps rendered from CPU glyph grids, cached per grid+style */
  private inkCache = new WeakMap<Float32Array, Map<string, HTMLCanvasElement>>()

  private tintedInk(grid: NonNullable<import('../math/sdf').SimRect['textGrid']>, style: string): HTMLCanvasElement | null {
    let byStyle = this.inkCache.get(grid.data)
    if (!byStyle) {
      byStyle = new Map()
      this.inkCache.set(grid.data, byStyle)
    }
    const hit = byStyle.get(style)
    if (hit) return hit
    const cv = document.createElement('canvas')
    cv.width = grid.gw
    cv.height = grid.gh
    const c2 = cv.getContext('2d')
    if (!c2) return null
    const img = c2.createImageData(grid.gw, grid.gh)
    // parse rgb()/rgba() style
    const m = style.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    const rr = m ? +m[1] : 255
    const gg = m ? +m[2] : 255
    const bb = m ? +m[3] : 255
    for (let i = 0; i < grid.gw * grid.gh; i++) {
      if (grid.data[i] < 0) {
        img.data[i * 4] = rr
        img.data[i * 4 + 1] = gg
        img.data[i * 4 + 2] = bb
        img.data[i * 4 + 3] = 255
      }
    }
    c2.putImageData(img, 0, 0)
    byStyle.set(style, cv)
    return cv
  }

  readonly texture: THREE.CanvasTexture
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  width: number
  height: number

  constructor(fieldWidth: number) {
    this.canvas = document.createElement('canvas')
    this.width = fieldWidth
    this.height = fieldWidth
    this.canvas.width = this.width
    this.canvas.height = this.height
    const ctx = this.canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) throw new Error('organism: 2d context unavailable for obstacle mask')
    this.ctx = ctx
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.flipY = true
    this.texture.magFilter = THREE.LinearFilter
    this.texture.minFilter = THREE.LinearFilter
    this.texture.generateMipmaps = false
  }

  /**
   * Draw obstacles. comfortClearanceSim widens the comfort band around each
   * hard region (uniform → the SDF derives comfort as hard − clearance, C14).
   */
  rasterize(obstacles: CollectedObstacle[], viewport: Viewport, comfortClearanceSim: number) {
    const { ctx, width, height } = this
    ctx.clearRect(0, 0, width, height)
    // sim units → mask px: sim y span 1 ↔ height px
    const s = height
    const aspect = viewport.width / Math.max(viewport.height, 1)
    const toMask = (sx: number, sy: number) => [(sx / aspect) * width, (1 - sy) * height] as const

    // comfort (G) first, hard (R) over it; weight → B, tendril → A.
    // Painter order with 'lighter' keeps channels independent.
    ctx.globalCompositeOperation = 'lighter'
    const fillShape = (o: CollectedObstacle, pad: number, style: string) => {
      const rect = o.rect
      ctx.fillStyle = style
      if (rect.textGrid) {
        // SINGLE SOURCE OF TRUTH: render from the CPU ink grid — a second
        // font rasterization drifted (line-box vs glyph-box) and ghosted
        // the SDF behind the text
        const tinted = this.tintedInk(rect.textGrid, style)
        if (tinted) {
          const [x0, y0] = toMask(rect.cx - rect.hw, rect.cy + rect.hh)
          const [x1, y1] = toMask(rect.cx + rect.hw, rect.cy - rect.hh)
          const scale = (y1 - y0) / (rect.hh * 2) // mask px per sim unit
          const padPx = Math.max(0, pad * scale)
          ctx.imageSmoothingEnabled = false
          // dilate by padding: draw at ring offsets
          const offs: Array<[number, number]> = [[0, 0]]
          if (padPx > 0.4) for (let k = 0; k < 8; k++) offs.push([Math.cos((k / 8) * Math.PI * 2) * padPx, Math.sin((k / 8) * Math.PI * 2) * padPx])
          for (const [ox, oy] of offs) ctx.drawImage(tinted, x0 + ox, y0 + oy, x1 - x0, y1 - y0)
        }
        return
      }
      if (rect.circle) {
        const [ccx, ccy] = toMask(rect.cx, rect.cy)
        const [ex] = toMask(rect.cx + rect.hw + pad, rect.cy)
        const [, ey] = toMask(rect.cx, rect.cy - rect.hh - pad)
        ctx.beginPath()
        ctx.ellipse(ccx, ccy, Math.abs(ex - ccx), Math.abs(ey - ccy), 0, 0, Math.PI * 2)
        ctx.fill()
      } else {
        const [x0, y0] = toMask(rect.cx - rect.hw - pad, rect.cy + rect.hh + pad)
        const [x1, y1] = toMask(rect.cx + rect.hw + pad, rect.cy - rect.hh - pad)
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
      }
    }
    for (const o of obstacles) {
      fillShape(o, o.paddingSim + comfortClearanceSim, 'rgb(0, 255, 0)')
      const weight = Math.round(Math.min(o.rect.weight / 4, 1) * 255)
      // hard channel at TRUE geometry (pad 0): the render cut plane must sit
      // on the visible edge — padding in R read as a phantom "glass fence"
      // standoff (user 2026-07-22); solver/nav keep padded analytic copies
      fillShape(o, 0, `rgba(255, 0, ${weight}, 1)`)
      if (o.rect.allowTendrils) fillShape(o, o.paddingSim, 'rgba(0, 0, 128, 1)')
    }
    ctx.globalCompositeOperation = 'source-over'
    void s
    this.texture.needsUpdate = true
  }

  dispose() {
    this.texture.dispose()
  }
}
