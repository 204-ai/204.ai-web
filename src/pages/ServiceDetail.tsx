import { Link, useParams } from 'react-router-dom'
import { ServiceReel } from '../components/service/ServiceReel'
import { Pill } from '../components/ui/Pill'
import { Rich } from '../components/ui/Rich'
import { SecLab } from '../components/ui/SecLab'
import { describe, type Service } from '../data/content'
import { CONTENT } from '../data/studio'
import { useHead } from '../hooks/useHead'
import { trackCta } from '../lib/analytics'
import { NotFound } from './NotFound'
import styles from './ServiceDetail.module.css'

/** /services/:slug — unknown slugs fall through to redirects, then 404. */
export function ServiceDetail() {
  const { slug } = useParams()
  const { services } = CONTENT
  const i = services.findIndex((s) => s.slug === slug)
  if (i < 0) return <NotFound />
  return <ServicePage key={services[i].slug} service={services[i]} index={i} />
}

/** v2 service detail (prototype ServiceDetail) */
function ServicePage({ service: s, index: i }: { service: Service; index: number }) {
  const { services } = CONTENT
  useHead(`${s.label} · Service`, describe.service(s), s.still ?? s.img)
  const next = services[(i + 1) % services.length]
  const nextTitle = next.title.replace(/\n/g, ' ')

  return (
    <div className="v2">
      <section className={styles.detail}>
        <div className={styles.left}>
          <Link className={styles.back} to="/services">
            ← services
          </Link>
          <SecLab className={styles.lab}>
            / .{s.pillar} — {s.n}
          </SecLab>
          <h1 className={styles.title}>
            <Rich text={s.title} />
          </h1>
          <ServiceReel reels={s.reels ?? []} poster={s.still ?? s.img} />
          <p className={styles.lead}>{s.lead}</p>
          <Pill to="/contact" onClick={() => trackCta('bring_to_event', { service: s.label })}>
            → {s.cta}
          </Pill>
        </div>

        <div className={styles.right}>
          <SecLab className={styles.lab}>/ modes in this practice</SecLab>
          <div className={styles.modes}>
            {s.modes.map((m) => (
              <div key={m.n} className={styles.mrow}>
                <div className={styles.n}>{m.n}</div>
                <div>
                  <div className={styles.t}>{m.label}</div>
                  <div className={styles.d}>{m.body}</div>
                </div>
              </div>
            ))}
          </div>

          <SecLab className={styles.lab}>/ what's included</SecLab>
          <p className={styles.incl}>{s.included}</p>

          {/* derived from works[].practices (SPEC C19); a service without work hides the block (V26) */}
          {s.works.length > 0 && (
            <>
              <SecLab className={styles.lab}>/ selected work in this practice</SecLab>
              <div className={styles.works}>
                {s.works.map((w) => (
                  <Link key={w.slug} to={`/work/${w.slug}`} className={styles.wrow}>
                    <span className={styles.code}>{w.code}</span>
                    <span className={styles.ttl}>{w.title}</span>
                    <span className={styles.ar} aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className={styles.next}>
        <div className={styles.nextLab}>/ next service</div>
        <Link className={styles.row} to={`/services/${next.slug}`}>
          <h2>{nextTitle}</h2>
          <div className={styles.go}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </Link>
        <Pill to={`/services/${next.slug}`}>Next — {nextTitle} →</Pill>
      </section>
    </div>
  )
}
