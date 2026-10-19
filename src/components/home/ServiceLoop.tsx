import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { v2 } from '../../data/studio'
import { trackCta } from '../../lib/analytics'
import { rendition } from '../../lib/media'
import { Pill } from '../ui/Pill'
import { Rich } from '../ui/Rich'
import styles from './ServiceLoop.module.css'

/** Prototype service loop: every service as a tile in one endless row (paused on hover/focus). */
export function ServiceLoop() {
  const { services } = v2()
  const row = [...services, ...services]
  return (
    <section className={styles.loop} id="services">
      <div className={styles.head}>
        <div className={styles.lab}>{'// what we do'}</div>
        <h2>Services</h2>
      </div>
      <div className={styles.wrap}>
        <div className={styles.track} style={{ '--n': services.length } as CSSProperties}>
          {row.map((s, k) => {
            const copy = k >= services.length
            return (
              <Link
                key={k}
                to={`/services/${s.slug}`}
                className={styles.tile}
                aria-hidden={copy || undefined}
                tabIndex={copy ? -1 : undefined}
              >
                <img className={styles.img} src={rendition(s.img, 800)} alt="" loading="lazy" decoding="async" />
                <div className={styles.scrim} />
                <div className={styles.side}>.{s.pillar}</div>
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
          })}
        </div>
      </div>
      <div className={styles.foot}>
        <Pill to="/services" onClick={() => trackCta('home_services')}>See all our services</Pill>
      </div>
    </section>
  )
}
