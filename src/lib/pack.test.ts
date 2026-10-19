import { describe, expect, it } from 'vitest'
import { packColumns } from './pack'

describe('packColumns (case gallery masonry)', () => {
  const r = (x: number) => x
  it('places every item exactly once and keeps source order per column', () => {
    const items = [0.5, 1.8, 0.6, 0.7, 1.5, 0.55, 0.66]
    const cols = packColumns(items.map((v, i) => ({ v, i })), (x) => x.v, 3)
    expect(cols.flat().map((x) => x.i).sort()).toEqual(items.map((_, i) => i))
    for (const col of cols) expect(col.map((x) => x.i)).toEqual([...col.map((x) => x.i)].sort((a, b) => a - b))
  })
  it('balances column heights better than round-robin', () => {
    const items = [1.8, 0.5, 0.5, 1.78, 0.5, 0.5, 0.56, 0.56, 0.56]
    const h = (cols: number[][]) => cols.map((c) => c.reduce((s, v) => s + v, 0))
    const packed = h(packColumns(items, r, 3))
    const robin = h([0, 1, 2].map((c) => items.filter((_, i) => i % 3 === c)))
    const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs)
    expect(spread(packed)).toBeLessThan(spread(robin))
  })
  it('uses at most as many columns as items, and one column on request', () => {
    expect(packColumns([1, 2], r, 3)).toHaveLength(2)
    expect(packColumns([1, 2, 3, 4], r, 1)).toEqual([[1, 2, 3, 4]])
    expect(packColumns([], r, 3)).toEqual([[]])
  })
})
