import { Link, useParams } from 'react-router-dom'
import { ServiceReel } from '../components/service/ServiceReel'
import { Pill } from '../components/ui/Pill'
import { Rich } from '../components/ui/Rich'
import { describe, servicePath, type Service } from '../data/content'
import { CONTENT } from '../data/studio'
import { useHead } from '../hooks/useHead'
import { trackCta } from '../lib/analytics'
import { NotFound } from './NotFound'
import styles from './ServiceDetail.module.css'

/** /services/:slug — unknown slugs fall through to redirects, then 404. */
export function ServiceDetail() {
  const { slug } = useParams()
  const { services } = CONTENT
  const i = services.findIndex((s) => servicePath(s) === `/services/${slug}`)
  if (i < 0) return <NotFound />
  return <ServicePage key={services[i].slug} service={services[i]} index={i} />
}

/** v2 service detail (prototype ServiceDetail) */
function ServicePage({ service: s, index: i }: { service: Service; index: number }) {
  const { services } = CONTENT
  useHead(`${s.label} · Service`, describe.service(s), s.still ?? s.img)
  const next = services[(i + 1) % services.length]
  const nextTitle = next.title.replace(/\n/g, ' ')
  const clientStudy = s.id === 'custom' ? s.works.find(work => work.slug === 'oddsgate') : undefined
  const selectedWork = s.works.filter(work => work !== clientStudy)

  return (
    <div className="v2">
      <nav className={`site-section-links ${styles.breadcrumb}`} aria-label="Service context"><Link to="/services">← Services</Link><a href={`${import.meta.env.BASE_URL}${s.pillar === 'content' ? 'productions/' : 'experiences/'}`}>{s.pillar === 'content' ? 'Productions' : 'Experiences'} ↗</a></nav>
      <div className="site-page-heading"><h1><Rich text={s.title} /></h1><p>{s.lead}</p></div>
      <section className={styles.detail}>
        <div className={styles.left}>
          <ServiceReel reels={s.reels ?? []} poster={s.still ?? s.img} />
          {clientStudy && <p className={styles.mediaCredit}>MOODSCAPE at NFC Summit · Unicorn Factory, Lisbon</p>}
          <Pill to="/contact" onClick={() => trackCta('bring_to_event', { service: s.label })}>
            → {s.cta}
          </Pill>
        </div>

        <div className={styles.right}>
          {clientStudy && (
            <section className={styles.clientStudy}>
              <p className={styles.mediaCredit}>Client case study · SBC Summit, Lisbon</p>
              <h2 className={styles.sectionTitle}>{clientStudy.title}</h2>
              <p>We turned a conference booth into a projection room where each visitor’s headset reading helped choose a journey into 2050.</p>
              <Link className="text-link" to={`/work/${clientStudy.slug}/`}>See the installation on site ↗</Link>
            </section>
          )}
          <h2 className={styles.sectionTitle}>Ways to use it</h2>
          <div className={styles.modes}>
            {s.modes.map((m) => (
              <div key={m.n} className={styles.mrow}>
                <div>
                  <h3 className={styles.t}>{m.label}</h3>
                  <div className={styles.d}>{m.body}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>What's included</h2>
          <p className={styles.incl}>{s.included}</p>

          {/* derived from works[].practices (SPEC C19); a service without work hides the block (V26) */}
          {selectedWork.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Selected work</h2>
              <div className={styles.works}>
                {selectedWork.slice(0, 6).map((w) => (
                  <Link key={w.slug} to={`/work/${w.slug}`} className={styles.wrow}>
                    <span className={styles.ttl}>{w.title}</span>
                    <span className={styles.ar} aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </div>
              {selectedWork.length > 6 && <details className={styles.moreWorks}><summary>More projects</summary>{selectedWork.slice(6).map(w => <Link key={w.slug} to={`/work/${w.slug}`} className={styles.wrow}><span className={styles.ttl}>{w.title}</span><span className={styles.ar} aria-hidden="true">↗</span></Link>)}</details>}
            </>
          )}
        </div>
      </section>

      <section className={styles.next}>
        <div className={styles.nextLab}>/ next service</div>
        <Link className={styles.row} to={servicePath(next)}>
          <h2>{nextTitle}</h2>
          <div className={styles.go}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </Link>
        <Pill to={servicePath(next)}>Next — {nextTitle} →</Pill>
      </section>
    </div>
  )
}
