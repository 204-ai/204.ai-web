import dims from 'virtual:media-dims'
import { rendition } from './media'

/**
 * width/height attributes for a self-hosted image (SPEC V30): the intrinsic size of the
 * base file, which every rendition shares the ratio of. Unknown paths get none.
 */
export function imgDims(url?: string): { width?: number; height?: number } {
  const d = url ? dims[url] : undefined
  return d ? { width: d[0], height: d[1] } : {}
}

/** height / width of a known image, else a 3:2 guess */
export function imgRatio(url: string): number {
  const d = dims[url]
  return d ? d[1] / d[0] : 0.66
}

/**
 * srcset for a gallery image: the pipeline fits gallery files in a long-edge box (B26), so
 * a portrait -p-800 is narrower than 800px; descriptors use the real widths.
 */
export function boxSrcSet(url: string): string | undefined {
  const d = dims[url]
  if (!d) return undefined
  const [w, h] = d
  const long = Math.max(w, h)
  const w800 = long > 800 ? Math.round((w * 800) / long) : w
  return w800 < w ? `${rendition(url, 800)} ${w800}w, ${url} ${w}w` : `${url} ${w}w`
}
