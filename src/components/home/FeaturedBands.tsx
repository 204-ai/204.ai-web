import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONTENT } from '../../data/studio'
import { useDocumentHidden } from '../../hooks/useDocumentHidden'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { trackCta } from '../../lib/analytics'
import { rendition } from '../../lib/media'
import { Pill } from '../ui/Pill'
import { Rich } from '../ui/Rich'
import styles from './FeaturedBands.module.css'

interface BandProps {
  to: string
  onClick?: () => void
  title: string
  poster?: string
  clip?: string
  focus?: string
  meta?: Array<[string, string]>
}

/** Prototype featured band: greyscale strip that grows, colours and plays its clip on hover or focus. */
function Band({ to, onClick, title, poster, clip, focus, meta }: BandProps) {
  const [hot, setHot] = useState(false)
  const reduced = usePrefersReducedMotion()
  const hidden = useDocumentHidden() // a tab switch may never send mouseleave (SPEC V24)
  return (
    <Link
      to={to}
      onClick={onClick}
      className={hot ? `${styles.band} ${styles.hot}` : styles.band}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
    >
      {poster && (
        <img
          className={styles.img}
          src={rendition(poster, 800)}
          srcSet={`${rendition(poster, 800)} 800w, ${poster} 1920w`}
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          style={focus ? { objectPosition: focus } : undefined}
        />
      )}
      {hot && clip && !reduced && !hidden && (
        <video
          key={clip}
          className={styles.clip}
          src={clip}
          autoPlay
          muted
          loop
          playsInline
          style={focus ? { objectPosition: focus } : undefined}
        />
      )}
      <div className={styles.scrim} />
      <div className={styles.ttl}>
        <Rich text={title} />
      </div>
      {meta ? (
        <div className={styles.meta}>
          {meta.map(([k, v]) => (
            <div key={k} className={styles.cell}>
              <span className={styles.k}>{k}</span>
              <span className={styles.v}>{v}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.go}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 17 L17 7 M9 7 H17 V15" />
          </svg>
        </div>
      )}
    </Link>
  )
}

/** Prototype "Featured work": three case bands and the band into /work. */
export function FeaturedBands() {
  const { featured, services, studio } = CONTENT
  const { allWork } = studio
  const serviceTitle = (id: string) => services.find((s) => s.id === id)?.title ?? ''
  return (
    <section className={styles.works}>
      <div className={styles.head}>
        <h2>
          Featured
          <br />
          work
        </h2>
        <div className={styles.metaHint}>{'// hover for a preview · click for the full case'}</div>
      </div>
      <div className={styles.bands}>
        {featured.map((f) => (
          <Band
            key={f.item.slug}
            to={`/work/${f.item.slug}`}
            title={f.title ?? f.item.title}
            poster={f.poster ?? f.item.media?.still}
            clip={f.clip ?? f.item.media?.video?.mp4}
            focus={f.focus ?? f.item.media?.focus}
            meta={[
              ['Category', f.label ?? serviceTitle(f.item.practices[0])],
              ['Client', f.item.client],
              ['Year', f.item.year],
            ]}
          />
        ))}
        {/* v1's home "explore work" CTA lives on as this band */}
        <Band
          to="/work"
          onClick={() => trackCta('explore_work')}
          title={allWork.title}
          poster={allWork.poster}
          clip={allWork.clip}
          focus={allWork.focus}
        />
      </div>
      <div className={styles.foot}>
        {/* the prototype's pill says "Start your project" but opened the portfolio; it goes to the brief */}
        <Pill to="/contact" onClick={() => trackCta('home_featured_start')}>Start your project</Pill>
      </div>
    </section>
  )
}
