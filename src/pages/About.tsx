import { Link } from 'react-router-dom'
import { Rich } from '../components/ui/Rich'
import { SecLab } from '../components/ui/SecLab'
import { describe } from '../data/content'
import { CONTENT } from '../data/studio'
import { useHead } from '../hooks/useHead'
import { imgDims } from '../lib/dims'
import { rendition } from '../lib/media'
import styles from './About.module.css'

const pad2 = (n: number) => String(n).padStart(2, '0')
const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

/** v2 about (prototype About): colophon with derived stats and practice rows, makers roster, RnA card. */
export function About() {
  const { people, stats, studio } = CONTENT
  useHead('About', describe.about(CONTENT))
  // stats are derived, never typed (SPEC C22)
  const figures: Array<[number, string]> = [
    [stats.makers, 'makers in the room'],
    [stats.pillars, 'main pillars'],
    [stats.projects, 'projects shipped'],
  ]
  return (
    <div className="v2">
      <section className={styles.colophon}>
        <div className={styles.left}>
          <SecLab className={styles.lab}>§ 04 / colophon</SecLab>
          <h1 className={styles.head}>
            We build
            <br />
            <em>worlds,</em>
            <br />
            <span className={styles.dim}>
              on
              <br />
              purpose.
            </span>
          </h1>
          <p className={styles.lead}>
            <Rich text={studio.copy.about.lead} />
          </p>
          <div className={styles.stats}>
            {figures.map(([n, cap]) => (
              <div key={cap}>
                <div className={styles.fig}>{pad2(n)}</div>
                <div className={styles.cap}>{cap}</div>
              </div>
            ))}
          </div>
          <SecLab className={styles.lab}>/ worldbuilding in practice</SecLab>
          <div className={styles.practice}>
            {studio.practice.map((p) => (
              <div key={p.n} className={styles.prow}>
                <div className={styles.n}>{p.n}</div>
                <div>
                  <div className={styles.t}>{p.label}</div>
                  <div className={styles.d}>{p.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          <SecLab className={styles.lab}>/ the makers</SecLab>
          <div className={styles.makers}>
            {people.map((p, i) => (
              <Link key={p.slug} to={`/makers/${p.slug}`} className={styles.maker}>
                <div className={styles.mn}>{pad2(i + 1)}</div>
                <div className={styles.shot}>
                  {p.photo ? (
                    // eager: six 62px portraits (B9: lazy tiny imgs could skip their first paint);
                    // the 320 rendition keeps some of the scanlines baked into the portraits
                    <img src={rendition(p.photo, 320)} {...imgDims(p.photo)} alt="" decoding="async" />
                  ) : (
                    initials(p.name)
                  )}
                </div>
                <div className={styles.name}>{p.name}</div>
                <div className={styles.role}>{p.role}</div>
                <div className={styles.ar} aria-hidden="true">
                  →
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.rna}>
            <div className={styles.rnaLab}>/ rna studio — our lab in lisbon</div>
            <p>
              A hybrid studio and cultural platform where ideas are developed, tested and exhibited — workshops,
              installations and collaborative projects. Write to{' '}
              <a href={`mailto:${studio.contact.email}`}>{studio.contact.email}</a>
            </p>
            <a className={styles.link} href={studio.rnaStudioUrl} target="_blank" rel="noreferrer">
              → {new URL(studio.rnaStudioUrl).hostname.replace(/^www\./, '')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
