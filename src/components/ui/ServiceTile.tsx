import { Link } from 'react-router-dom'
import type { Service } from '../../data/content'
import { rendition } from '../../lib/media'
import { Rich } from './Rich'
import styles from './ServiceTile.module.css'

interface ServiceTileProps {
  service: Service
  /** pillar chip in the corner (home loop) */
  side?: boolean
  /** sizing from the page (loop: fixed 290×420; services grid: fluid) */
  className?: string
  /** loop duplicates: hidden from assistive tech and the tab order */
  decorative?: boolean
}

/** Prototype .svc-tile: rounded image tile with title, description and corner arrow. */
export function ServiceTile({ service: s, side, className, decorative }: ServiceTileProps) {
  return (
    <Link
      to={`/services/${s.slug}`}
      className={className ? `${styles.tile} ${className}` : styles.tile}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
    >
      {/* no width/height: the tile is a fixed CSS box (cover), so they add no layout
          information, and the dims map would land in the entry chunk with the home page */}
      <img className={styles.img} src={rendition(s.img, 800)} alt="" loading="lazy" decoding="async" />
      <div className={styles.scrim} />
      {side && <div className={styles.side}>.{s.pillar}</div>}
      <div className={styles.body}>
        <div className={styles.title}>
          <Rich text={s.title} />
        </div>
        <div className={styles.desc}>
          <Rich text={s.desc} />
        </div>
      </div>
      <div className={styles.arrow}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 17 L17 7 M9 7 H17 V15" />
        </svg>
      </div>
    </Link>
  )
}
