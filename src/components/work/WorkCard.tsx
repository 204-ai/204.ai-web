import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Work } from '../../data/content'
import { imgDims } from '../../lib/dims'
import { rendition } from '../../lib/media'
import styles from './WorkCard.module.css'

interface WorkCardProps {
  work: Work
  /** position in the visible grid, shown as "// 01" */
  index: number
  /** practice id → display label */
  labelOf: (id: string) => string
}

/** Prototype .portfolio-grid .cinecard: 21:9 letterbox (32:9 when `wide`), corner meta, title row. */
export function WorkCard({ work, index, labelOf }: WorkCardProps) {
  const still = work.media?.still
  const cls = [styles.card, work.wide && styles.wide, 'r-up'].filter(Boolean).join(' ')
  return (
    <Link to={`/work/${work.slug}`} className={cls} style={{ animationDelay: `${0.05 * (index % 6)}s` } as CSSProperties}>
      {still ? (
        <img
          className={styles.img}
          src={rendition(still, 800)}
          srcSet={`${rendition(still, 500)} 500w, ${rendition(still, 800)} 800w, ${still} 1920w`}
          sizes={work.wide ? '100vw' : '(max-width: 1080px) 100vw, 50vw'}
          {...imgDims(still)}
          alt=""
          loading="lazy"
          decoding="async"
          style={work.media?.focus ? { objectPosition: work.media.focus } : undefined}
        />
      ) : (
        <div className={styles.img} />
      )}
      <div className={styles.scrim} />
      <div className={styles.metaTl}>
        {work.year} · {work.practices.map((p) => labelOf(p).toLowerCase()).join(' · ')}
      </div>
      <div className={styles.metaTr}>{`// ${String(index + 1).padStart(2, '0')}`}</div>
      <div className={styles.foot}>
        <div className={styles.title}>{work.title}</div>
        <div className={styles.sub}>
          <span className={styles.arrow}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
