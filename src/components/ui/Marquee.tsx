import { Fragment } from 'react'
import styles from './Marquee.module.css'

/** Prototype marquee: outlined display words drifting left; the copy is decorative, read once by screen readers. */
export function Marquee({ text, fill = false }: { text: string; fill?: boolean }) {
  return (
    <div className={styles.marquee}>
      <span className="sr-only">{text}</span>
      <div className={styles.track} aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <Fragment key={i}>
            <span className={fill && i % 2 === 0 ? `${styles.word} ${styles.fill}` : styles.word}>{text}</span>
            <span className={styles.dot}>•</span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
