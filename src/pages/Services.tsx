import { Link } from 'react-router-dom'
import { describe, type Pillar } from '../data/content'
import { CONTENT } from '../data/studio'
import { useHead } from '../hooks/useHead'
import { imgDims } from '../lib/dims'
import styles from './Services.module.css'

const FAMILIES: { pillar: Pillar; title: string; line: string; image: string; route: string }[] = [
  { pillar: 'content', title: 'For Productions', line: 'From an archival voice to an original film. Creative direction, moving images and visual worlds, made for the screen.', image: '/media/feat-alanwatts-c79fdb.webp', route: 'productions/' },
  { pillar: 'interactive', title: 'For Experiences', line: 'From a single portrait to a room full of possibilities. Interactive installations and immersive worlds, built around people.', image: '/media/svc-mirror-b06889.webp', route: 'experiences/' },
]

export function Services() {
  useHead('Services', describe.services(CONTENT))
  const base = import.meta.env.BASE_URL
  return <div className="v2">
    <div className="site-page-heading"><h1>Services.</h1><p>Creative direction, production and interaction. Find what your project needs, then explore the work behind it.</p></div>
    <nav className="site-section-links" aria-label="On this page"><a href="#content-services">For Productions</a><a href="#interactive-services">For Experiences</a></nav>
    <div className={styles.page}>
      {FAMILIES.map(family => {
        const image = base + family.image.slice(1)
        return <section key={family.pillar} id={`${family.pillar}-services`} className={styles.family}>
          <div className={styles.intro}>
            <a href={base + family.route}><img src={image} {...imgDims(family.image)} alt="" loading="lazy" /></a>
            <h2>{family.title}</h2><p>{family.line}</p><a className={styles.chapterLink} href={base + family.route}>Explore {family.pillar === 'content' ? 'Productions' : 'Experiences'} ↗</a>
          </div>
          <div className={styles.list}>{CONTENT.pillars[family.pillar].map(service => <Link className={styles.service} key={service.id} to={`/services/${service.slug}`}><div><h3>{service.label}</h3><p>{service.desc.replace(/\n/g, ' ')}</p></div><span aria-hidden="true">↗</span></Link>)}</div>
        </section>
      })}
      <section className={styles.closer}><h2>Let’s shape your project.</h2><Link to="/contact">Start a collaboration ↗</Link></section>
    </div>
  </div>
}
