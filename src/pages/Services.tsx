import { ChatCloser } from '../components/ui/ChatCloser'
import { ServiceTile } from '../components/ui/ServiceTile'
import { describe, type Pillar } from '../data/content'
import { CONTENT } from '../data/studio'
import { useHead } from '../hooks/useHead'
import styles from './Services.module.css'

// UI labels stay in page code (SPEC I.content)
const PILLAR_LINES: Array<[Pillar, string, string]> = [
  ['content', 'Productions', 'campaigns, film, imagery & projection content'],
  ['interactive', 'Experiences', 'mirrors, portraits & responsive environments'],
]

/** v2 services index (prototype ServicesPage): two pillar grids of service tiles. */
export function Services() {
  useHead('Services', describe.services(CONTENT))
  const { pillars, studio } = CONTENT
  return (
    <div className="v2">
      <section className={styles.page}>
        <h1>
          Productions &
          <br />
          Experiences.
        </h1>
        {PILLAR_LINES.map(([pillar, title, line]) => (
          <section key={pillar} className={styles.pillar} aria-labelledby={`${pillar}-title`}>
            <div className={styles.pillarLab}>
              <h2 id={`${pillar}-title`} className={styles.pl}>{title}</h2>
              <span className={styles.pd}>{line}</span>
            </div>
            <div className={styles.grid}>
              {pillars[pillar].map((s) => (
                <ServiceTile key={s.id} service={s} className={styles.tile} />
              ))}
            </div>
          </section>
        ))}
      </section>
      <ChatCloser copy={studio.copy.closer} />
    </div>
  )
}
