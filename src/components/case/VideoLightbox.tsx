import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './VideoLightbox.module.css'

interface VideoLightboxProps {
  youtubeId: string
  title: string
  /** top-right line, e.g. "2026 · Magic Photo Booth" */
  meta: string
  onClose: () => void
}

/**
 * Prototype case lightbox: the YouTube player mounts only after the click that opens it
 * (SPEC V4), privacy-enhanced domain as in v1. Esc, the backdrop and "close" dismiss it;
 * focus moves into the dialog, the page behind is inert, and focus returns to the opener.
 */
export function VideoLightbox({ youtubeId, title, meta, onClose }: VideoLightboxProps) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    // a real modal: the app behind (the dialog is portalled outside #root) takes no focus
    // and leaves the accessibility tree until the dialog closes
    const app = document.getElementById('root')
    app?.setAttribute('inert', '')
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      app?.removeAttribute('inert')
      opener?.focus()
    }
  }, [onClose])

  return createPortal(
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`${title}: video`} onClick={onClose}>
      <div className={styles.frame} onClick={(e) => e.stopPropagation()}>
        <iframe
          className={styles.media}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
        <div className={styles.metaTl}>
          <span className={styles.ndot} />
          <span>{'// playing — sound on'}</span>
        </div>
        <div className={styles.metaTr}>{meta}</div>
        <button ref={close} type="button" className={styles.close} onClick={onClose}>
          <span>close</span>
          <span className={styles.x} aria-hidden="true">
            ×
          </span>
        </button>
      </div>
    </div>,
    document.body,
  )
}
