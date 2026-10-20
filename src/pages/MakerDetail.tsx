import { Link, useParams } from 'react-router-dom'
import { Pill } from '../components/ui/Pill'
import { SecLab } from '../components/ui/SecLab'
import { SocialIcon, type Network } from '../components/ui/SocialIcon'
import { describe, type Person } from '../data/content'
import { CONTENT } from '../data/studio'
import { useHead } from '../hooks/useHead'
import { trackCta, trackSocialClick } from '../lib/analytics'
import { imgDims } from '../lib/dims'
import { rendition } from '../lib/media'
import { NotFound } from './NotFound'
import styles from './MakerDetail.module.css'

/** /makers/:slug — unknown slugs fall through to redirects, then 404. */
export function MakerDetail() {
  const { slug } = useParams()
  const { people } = CONTENT
  const i = people.findIndex((p) => p.slug === slug)
  if (i < 0) return <NotFound />
  return <MakerPage key={people[i].slug} person={people[i]} index={i} />
}

const NETWORKS: Network[] = ['instagram', 'linkedin', 'email', 'web']

/** v2 maker page (prototype MakerPage): portrait, reach-out links (only set ones render), prev/next. */
function MakerPage({ person: p, index: i }: { person: Person; index: number }) {
  const { people } = CONTENT
  useHead(`${p.name} · Maker`, describe.maker(p), p.photo)
  const prev = people[(i - 1 + people.length) % people.length]
  const next = people[(i + 1) % people.length]
  const links = NETWORKS.flatMap((n) => {
    const v = p.socials?.[n]
    return v ? [{ n, href: n === 'email' ? `mailto:${v}` : v }] : []
  })

  return (
    <div className="v2">
      <section className={styles.page}>
        <Link className={styles.back} to="/about">
          ← about
        </Link>
        <SecLab>/ the makers — {String(i + 1).padStart(2, '0')}</SecLab>
        <h1 className={styles.name}>{p.name}</h1>
        <div className={styles.role}>{p.role}</div>

        <div className={styles.body}>
          <div className={styles.shot}>
            {p.photo && (
              <img
                src={p.photo}
                srcSet={`${rendition(p.photo, 320)} 320w, ${p.photo} 800w`}
                sizes="(max-width: 900px) 100vw, 420px"
                {...imgDims(p.photo)}
                alt={p.name}
                fetchPriority="high"
              />
            )}
          </div>
          <div className={styles.side}>
            <SecLab className={styles.sideLab}>/ reach out</SecLab>
            {links.length > 0 && (
              <div className={styles.links}>
                {links.map((l) => (
                  <a
                    key={l.n}
                    href={l.href}
                    target={l.n === 'email' ? undefined : '_blank'}
                    rel={l.n === 'email' ? undefined : 'noreferrer'}
                    onClick={() => trackSocialClick(l.n, p.name)}
                  >
                    <span className={styles.ic}>
                      <SocialIcon network={l.n} />
                    </span>
                    {l.n}
                  </a>
                ))}
              </div>
            )}
            {p.bio && <p className={styles.bio}>{p.bio}</p>}
            <div className={styles.cta}>
              <Pill to="/contact" onClick={() => trackCta('maker_work_with_us', { maker: p.name })}>
                → Work with us
              </Pill>
            </div>
          </div>
        </div>

        <nav className={styles.nav} aria-label="More makers">
          <Link className={styles.navSide} to={`/makers/${prev.slug}`}>
            <div className={styles.navLab}>← prev</div>
            <div className={styles.nm}>{prev.name}</div>
          </Link>
          <Link className={`${styles.navSide} ${styles.r}`} to={`/makers/${next.slug}`}>
            <div className={styles.navLab}>next →</div>
            <div className={styles.nm}>{next.name}</div>
          </Link>
        </nav>
      </section>
    </div>
  )
}
