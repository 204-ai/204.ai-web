import { Link } from 'react-router-dom'
import { CONTENT } from '../../data/studio'
import { trackSocialClick } from '../../lib/analytics'
import { Rich } from './Rich'
import styles from './Footer.module.css'

/** Prototype footer: brand + blurb, studio links, RnA address, socials, legal line. */
export function Footer() {
  const { studio } = CONTENT
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <img src={studio.logoUrl} alt={studio.name} />
          <p>{studio.copy.footer.blurb}</p>
        </div>
        <div className={styles.col}>
          <h6>Studio</h6>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/work">Our Work</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className={styles.col}>
          <h6>Visit</h6>
          <a className={styles.studio} href={studio.rnaStudioUrl} target="_blank" rel="noreferrer">RNA Studio</a>
          <span className={styles.address}>
            <Rich text={studio.footer.address} />
          </span>
        </div>
        <div className={styles.col}>
          <h6>Socials</h6>
          {studio.footer.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" onClick={() => trackSocialClick(s.label.toLowerCase())}>
              {s.label}
            </a>
          ))}
        </div>
      </div>
      <div className={styles.bot}>
        <div>© {studio.name} / {new Date().getFullYear()} — All rights reserved</div>
        <div>{'// part of RNA Studio'}</div>
        <div>Site v2 — Cinematic</div>
      </div>
    </footer>
  )
}
