import type { CSSProperties } from 'react'
import { CONTENT } from '../../data/studio'
import { trackCta } from '../../lib/analytics'
import { Pill } from '../ui/Pill'
import { ServiceTile } from '../ui/ServiceTile'
import styles from './ServiceLoop.module.css'

/** Prototype service loop: every service as a tile in one endless row (paused on hover/focus). */
export function ServiceLoop() {
  const { services } = CONTENT
  const row = [...services, ...services]
  return (
    <section className={styles.loop} id="services">
      <div className={styles.head}>
        <div className={styles.lab}>{'// what we do'}</div>
        <h2>Services</h2>
      </div>
      <div className={styles.wrap}>
        <div className={styles.track} style={{ '--n': services.length } as CSSProperties}>
          {row.map((s, k) => (
            <ServiceTile key={k} service={s} side className={styles.loopTile} decorative={k >= services.length} />
          ))}
        </div>
      </div>
      <div className={styles.foot}>
        <Pill to="/services" onClick={() => trackCta('home_services')}>See all our services</Pill>
      </div>
    </section>
  )
}
