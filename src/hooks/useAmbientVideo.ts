import { useEffect, type RefObject } from 'react'
import { useDocumentHidden } from './useDocumentHidden'
import { useMediaQuery } from './useMediaQuery'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Policy for decorative looping video (case hero clip, service reels): phones, reduced
 * motion and Save-Data get the still instead, as the home rotator does (SPEC V24, V29).
 */
export function useAmbientVideo(): boolean {
  const small = useMediaQuery('(max-width: 900px)')
  const reduced = usePrefersReducedMotion()
  const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
  return !(small || reduced || saveData)
}

/** pauses a <video> while the tab is hidden and resumes it after (SPEC V24) */
export function usePauseWhenHidden(video: RefObject<HTMLVideoElement | null>, active = true) {
  const hidden = useDocumentHidden()
  useEffect(() => {
    const v = video.current
    if (!v || !active) return
    v.muted = true
    if (hidden) v.pause()
    else v.play().catch(() => {})
  }, [hidden, active, video])
}
