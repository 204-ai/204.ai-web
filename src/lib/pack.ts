/**
 * Masonry columns (prototype CaseGallery): place items tallest-first into the shortest
 * column (LPT), so one late portrait cannot blow out a column, then restore source order
 * inside each column. `ratio` = height / width; ratios come from the media manifest
 * (SPEC V30), never from loading the images.
 */
export function packColumns<T>(items: T[], ratio: (item: T) => number, columns: number): T[][] {
  const n = Math.max(1, Math.min(columns, items.length))
  const cols: number[][] = Array.from({ length: n }, () => [])
  const heights = new Array<number>(n).fill(0)
  items
    .map((item, i) => ({ i, r: ratio(item) + 0.02 }))
    .sort((a, b) => b.r - a.r || a.i - b.i)
    .forEach(({ i, r }) => {
      const c = heights.indexOf(Math.min(...heights))
      cols[c].push(i)
      heights[c] += r
    })
  return cols.map((col) => col.sort((a, b) => a - b).map((i) => items[i]))
}
