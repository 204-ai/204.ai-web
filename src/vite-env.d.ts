/// <reference types="vite/client" />

declare module 'virtual:media-dims' {
  /** base-prefixed media image path (as content paths are) → [width, height] (SPEC V30) */
  const dims: Record<string, [number, number]>
  export default dims
}
