/// <reference types="vite/client" />

declare module 'virtual:media-dims' {
  /** /media/… image path → [width, height] from scripts/media-manifest.json (SPEC V30) */
  const dims: Record<string, [number, number]>
  export default dims
}
