import { useEffect } from 'react'

// SPEC V10 / I.seo: every route sets a unique title + meta description.
export function useHead(title: string, description: string) {
  useEffect(() => {
    document.title = title
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }, [title, description])
}
