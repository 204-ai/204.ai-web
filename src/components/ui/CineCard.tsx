import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { imgDims } from '../../lib/dims'
import { rendition } from '../../lib/media'
import styles from './CineCard.module.css'

interface CineCardProps {
  title: string
  to: string
  img?: string
  metaTl?: string
  metaTr?: string
  sub?: string
  poppins?: boolean
}

/** Prototype .cinegrid .cinecard: 16:10 image card with corner meta, display title and arrow. */
export function CineCard({ title, to, img, metaTl, metaTr, sub, poppins }: CineCardProps) {
  return (
    <Link className={styles.card} to={to}>
      {img ? (
        <img
          className={styles.img}
          src={rendition(img, 800)}
          srcSet={`${rendition(img, 500)} 500w, ${rendition(img, 800)} 800w, ${img} 1920w`}
          sizes="(max-width: 1080px) 100vw, 50vw"
          {...imgDims(img)}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={styles.img} />
      )}
      <div className={styles.scrim} />
      {metaTl && <div className={styles.metaTl}>{metaTl}</div>}
      {metaTr && <div className={styles.metaTr}>{metaTr}</div>}
      <div className={poppins ? `${styles.title} ${styles.poppins}` : styles.title}>{title}</div>
      <div className={styles.sub}>
        <span>{sub}</span>
        <span className={styles.arrow}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

export function CineGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>
}
