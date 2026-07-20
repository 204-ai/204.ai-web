import { useState } from 'react'
import { CinematicStill } from '../components/CinematicStill'
import { useHead } from '../hooks/useHead'
import { SERVICES, type Service } from '../data/studio'
import styles from './Services.module.css'

export function Services() {
  useHead(
    'Services — 204 · NO-CONTENT',
    'Direction, motion & film, identity, interaction. Four practices, one room. Rates on request.',
  )

  return (
    <div className={styles.root}>
      <div className="t-label" style={{ marginBottom: 8 }}>§ 03 / WHAT WE DO</div>
      <h1 className={`t-display ${styles.title}`}>
        Four practices. <span style={{ color: 'var(--dim)' }}>One</span> room.
      </h1>

      <div className={styles.grid}>
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.n} s={s} last={i === SERVICES.length - 1} />
        ))}
      </div>

      <div className={`t-mono ${styles.footer}`}>
        <span>RATES ON REQUEST</span>
        <span>NDA · IF YOU NEED ONE, WE HAVE ONE</span>
        <span>TAKING BRIEFS Q3 / 26 →</span>
      </div>
    </div>
  )
}

function ServiceCard({ s, last }: { s: Service; last: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <div className={styles.card} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className={styles.cardBg} style={{ opacity: hover ? 0.55 : 0.26 }}>
        <div className={styles.cardBgInner} style={{ transform: hover ? 'scale(1.03)' : 'scale(1)' }}>
          <CinematicStill scene={s.scene} mini />
        </div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHead}>
          <span className={`t-mono ${styles.cardNum}`}>{s.n}</span>
          <span className={`t-mono ${styles.cardNext}`}>/ {last ? '— END' : 'NEXT →'}</span>
        </div>
        <h2 className={`t-display ${styles.cardLabel}`} style={{ textShadow: hover ? '0 1px 14px rgba(0,0,0,0.7)' : 'none' }}>
          {s.label}
        </h2>
        <p className={styles.cardBody}>{s.body}</p>
      </div>
    </div>
  )
}
