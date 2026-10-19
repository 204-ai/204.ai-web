import dims from 'virtual:media-dims'

/**
 * width/height attributes for a self-hosted image (SPEC V30): the intrinsic size of the
 * base file, which every rendition shares the ratio of. Unknown paths get none.
 */
export function imgDims(url?: string): { width?: number; height?: number } {
  const d = url ? dims[url] : undefined
  return d ? { width: d[0], height: d[1] } : {}
}
