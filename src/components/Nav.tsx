import { NavLink, Link } from 'react-router-dom'
import styles from './Nav.module.css'

const ITEMS = [
  { to: '/', label: 'Index' },
  { to: '/work', label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Nav() {
  return (
    <header className={styles.root}>
      <Link to="/" className={styles.logo} aria-label="204 · NO-CONTENT — home">
        <span className={styles.logoBox}>204</span>
        <span className={styles.logoSuffix}>
          NO-
          <br />
          CONTENT
        </span>
      </Link>

      <nav className={styles.nav} aria-label="Main">
        {ITEMS.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'} className={styles.link}>
            {({ isActive }) => (
              <>
                <span className={isActive ? styles.linkActive : styles.linkLabel}>{it.label}</span>
                {isActive && <span className={styles.underline} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Link to="/contact" className={styles.status}>
        <span className={styles.statusBooking}>● BOOKING Q3 / 26</span>
        <span className={styles.statusCta}>WORK WITH US →</span>
      </Link>
    </header>
  )
}
