import { useCallback, useEffect, useRef, useState } from 'react'
import { CONTENT } from '../../data/studio'
import { useAmbientVideo, usePauseWhenHidden } from '../../hooks/useAmbientVideo'
import { useDocumentHidden } from '../../hooks/useDocumentHidden'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { trackChapterSelect } from '../../lib/analytics'
import { rendition } from '../../lib/media'
import styles from './HeroRotator.module.css'

const STILL_MS = 6000 // prototype offline mode: 25 ticks × 240ms per poster

/**
 * Prototype hero rotator: one clip at a time with caption, dots and progress.
 * Phones, reduced motion and Save-Data get posters instead of video (SPEC V29); posters
 * advance on a timer except under reduced motion (V7). Video and timers pause while
 * the tab is hidden (V24). The <video> is keyed by its source (B5).
 */
export function HeroRotator() {
  const { heroClips, studio } = CONTENT
  // phones, reduced motion and Save-Data get posters: the shared ambient-video policy
  const ambient = useAmbientVideo()
  const reduced = usePrefersReducedMotion()
  const hidden = useDocumentHidden()
  const [i, setI] = useState(0)
  const [pct, setPct] = useState(0)
  // consecutive clip failures; once every clip has failed (offline, blocked media) the
  // rotator falls back to posters instead of cycling through failing requests forever
  const [failed, setFailed] = useState(0)
  const stills = !ambient || failed >= heroClips.length
  const video = useRef<HTMLVideoElement>(null)
  const clip = heroClips[i]
  const elapsed = useRef(0)
  const next = useCallback(() => setI((n) => (n + 1) % heroClips.length), [heroClips.length])

  useEffect(() => {
    elapsed.current = 0
    setPct(0)
  }, [i])

  // still-timer: keeps its elapsed time across a hidden tab instead of restarting
  useEffect(() => {
    if (!stills || reduced || hidden) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      elapsed.current += now - last
      last = now
      const p = Math.min(100, (elapsed.current / STILL_MS) * 100)
      setPct(p)
      if (p >= 100) next()
    }, 240)
    return () => window.clearInterval(id)
  }, [stills, reduced, hidden, i, next])

  // hidden tab pauses the clip, visible again resumes it (each new keyed clip autoplays)
  usePauseWhenHidden(video, !stills)

  const poster = clip.poster
  return (
    <section
      className={styles.hero}
      aria-label={`${studio.name} showreel`}
      data-organism-obstacle
      data-organism-padding="20"
    >
      <div className={styles.head}>
        <h1>
          We build <em>worlds,</em>
          <br />
          on screen and in the room
        </h1>
      </div>
      <div className={styles.stage}>
        <img
          key={poster}
          className={styles.hv}
          src={rendition(poster, 800)}
          srcSet={`${rendition(poster, 800)} 800w, ${poster} 1920w`}
          sizes="100vw"
          alt=""
          fetchPriority={i === 0 ? 'high' : undefined}
          decoding="async"
        />
        {!stills && (
          <video
            key={clip.clip}
            ref={video}
            className={styles.hv}
            src={clip.clip}
            autoPlay
            muted
            playsInline
            preload="auto"
            onTimeUpdate={(e) => {
              const v = e.currentTarget
              if (v.duration) setPct((v.currentTime / v.duration) * 100)
            }}
            onPlaying={() => setFailed(0)}
            onEnded={next}
            onError={() => {
              setFailed((f) => f + 1)
              next()
            }}
          />
        )}
        <div className={styles.scrim} />
        <div className={styles.caption}>
          <span className={styles.t}>{clip.title ?? clip.item.title}</span>
          <span className={styles.s}>
            || {[clip.item.year, clip.kind, clip.place].filter(Boolean).join(' · ')}
          </span>
        </div>
        <div className={styles.dots}>
          {heroClips.map((c, n) => (
            <button
              key={c.item.slug}
              type="button"
              className={n === i ? styles.on : undefined}
              aria-label={c.title ?? c.item.title}
              aria-current={n === i ? 'true' : undefined}
              onClick={() => {
                setI(n)
                trackChapterSelect(c.item.title)
              }}
            />
          ))}
        </div>
        {!reduced && (
          <div className={styles.progress} aria-hidden="true">
            <span style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
        )}
      </div>
    </section>
  )
}
