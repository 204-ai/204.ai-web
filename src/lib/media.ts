// Webflow CDN rendition helper — the CDN keeps resized copies ("-p-500",
// "-p-800") for path-style assets. %2F-encoded poster URLs have none.
// Callers pair this with an onError fallback to the original file.
export function rendition(url: string, width: 500 | 800): string {
  if (!url || url.includes('%2F') || url.startsWith('data:')) return url
  return url.replace(/(\.(?:png|jpe?g|webp|avif))$/i, `-p-${width}$1`)
}
