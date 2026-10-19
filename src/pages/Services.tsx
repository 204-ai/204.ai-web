import { ChatCloser } from '../components/ui/ChatCloser'
import { ServiceTile } from '../components/ui/ServiceTile'
import { describe, type Pillar } from '../data/content'
import { v2 } from '../data/studio'
import { useHead } from '../hooks/useHead'
import styles from './Services.module.css'

// UI labels stay in page code (SPEC I.content)
const PILLAR_LINES: Array<[Pillar, string]> = [
  ['content', 'cinematic work: campaigns, film & image'],
  ['interactive', 'installations, mirrors & responsive environments'],
]

/** v2 services index (prototype ServicesPage): two pillar grids of service tiles. */
export function Services() {
  useHead('Services', describe.services(v2()))
  const { pillars, studio } = v2()
  return (
    <div className="v2">
      <section className={styles.page}>
        <h1>
          Two pillars.
          <br />
          One room.
        </h1>
        {PILLAR_LINES.map(([pillar, line]) => (
          <div key={pillar} className={styles.pillar}>
            <h2 className={styles.pillarLab}>
              <span className={styles.pl}>.{pillar}</span> <span className={styles.pd}>— {line}</span>
            </h2>
            <div className={styles.grid}>
              {pillars[pillar].map((s) => (
                <ServiceTile key={s.id} service={s} className={styles.tile} />
              ))}
            </div>
          </div>
        ))}
      </section>
      <ChatCloser copy={studio.copy.closer} />
    </div>
  )
}
