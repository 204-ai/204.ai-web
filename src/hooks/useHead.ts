import { useEffect } from 'react'

const OG_DEFAULT_IMAGE =
  'https://cdn.prod.website-files.com/64ba5b3b418a540ade9f6e31/65b7a18446d60bb65c1641e7_204white.png'

/* WhatsApp-safe og:image — mirror of scripts/generate-meta.mjs ogImage():
   use the -p-800 rendition for path-style CDN URLs (full-res can exceed
   WhatsApp's ~600KB preview cap); %2F posters + never-resized small
   sources stay as-is. Keep both in sync. */
const NO_RENDITION = ['67489265485a73607410fa99_winesfromanother.png']
function ogImage(img?: string): string | undefined {
  if (img && img.startsWith('data:')) return undefined // inline placeholders can't be share cards
  if (!img || img.includes('%2F')) return img
  if (NO_RENDITION.some((f) => img.includes(f))) return img
  return img.replace(/(\.(?:png|jpe?g|webp))$/i, '-p-800$1')
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

const BRAND = '204 · NO-CONTENT'
const HOME_TITLE = `${BRAND} — Creative technology studio`

// SPEC V10 / I.seo: every route sets unique title + description; og/twitter
// tags follow so shares carry the right card. (Static per-route HTML for
// non-JS scrapers is generated at build time by scripts/generate-meta.mjs.)
// Pass the bare page name — the brand suffix is appended HERE, in one place
// (empty string = home, which leads with the brand instead).
export function useHead(pageTitle: string, description: string, rawImage?: string) {
  const title = pageTitle ? `${pageTitle} — ${BRAND}` : HOME_TITLE
  const image = ogImage(rawImage)
  useEffect(() => {
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:image', image ?? OG_DEFAULT_IMAGE)
    setMeta('property', 'og:url', window.location.href)
    setMeta('property', 'og:type', 'website')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', image ?? OG_DEFAULT_IMAGE)
  }, [title, description, image])
}
