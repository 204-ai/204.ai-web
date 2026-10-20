import { useEffect, useRef, useState } from 'react'
import { useAmbientVideo, usePauseWhenHidden } from '../../hooks/useAmbientVideo'
import { imgDims } from '../../lib/dims'
import { rendition } from '../../lib/media'
import styles from './ServiceReel.module.css'

/**
 * Prototype SdHeroReel: the service's reels play in turn with one progress bar each; the
 * poster sits underneath (LCP) and is all that phones, reduced motion and Save-Data get
 * (SPEC V24, V29 parity). One keyed <video> (B5), paused in a hidden tab.
 */
export function ServiceReel({ reels, poster }: { reels: string[]; poster: string }) {
  const ambient = useAmbientVideo()
  const [i, setI] = useState(0)
  const [pct, setPct] = useState(0)
  const [failed, setFailed] = useState(0)
  const video = useRef<HTMLVideoElement>(null)
  const play = ambient && reels.length > 0 && failed < reels.length
  usePauseWhenHidden(video, play)
  useEffect(() => setPct(0), [i])
  const next = () => setI((n) => (n + 1) % reels.length)

  return (
    <div className={styles.hero}>
      <img
        className={styles.media}
        src={rendition(poster, 800)}
        srcSet={`${rendition(poster, 800)} 800w, ${poster} 1920w`}
        sizes="(max-width: 1040px) 100vw, 50vw"
        {...imgDims(poster)}
        alt=""
        fetchPriority="high"
      />
      {play && (
        <video
          key={reels[i]}
          ref={video}
          className={styles.media}
          src={reels[i]}
          autoPlay
          muted
          playsInline
          preload="auto"
          loop={reels.length === 1}
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
      {play && (
        <div className={styles.bars}>
          {reels.map((src, k) => (
            <button
              key={src}
              type="button"
              className={k === i ? `${styles.b} ${styles.on}` : styles.b}
              aria-label={`Reel ${k + 1} of ${reels.length}`}
              aria-current={k === i ? 'true' : undefined}
              onClick={() => setI(k)}
            >
              <span className={styles.track}>
                <span className={styles.fill} style={{ transform: `scaleX(${k === i ? pct / 100 : k < i ? 1 : 0})` }} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
