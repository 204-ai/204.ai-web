import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { CONTENT } from '../data/studio'
import styles from './Nav.module.css'

const LINKS = [
  { to: '#productions', label: 'Productions', section: true },
  { to: '#experiences', label: 'Experiences', section: true },
  { to: '#technology', label: 'Technology', section: true },
  { to: '/services', label: 'Services', section: false },
  { to: '/about', label: 'About', section: false },
  { to: '/contact', label: 'Let’s talk ↗', section: false },
]
const linkClass = ({ isActive }: { isActive: boolean }) => isActive ? `${styles.link} ${styles.active}` : styles.link

/** The two creative pillars stay visible across project and service pages. */
export function Nav() {
  const { studio } = CONTENT
  const { pathname, search, hash } = useLocation()
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuToggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { setMenuOpen(false) }, [pathname, search, hash])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuToggle.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])
  const links = () => LINKS.map(link => link.section
    ? <a key={link.to} href={`${import.meta.env.BASE_URL}${link.to}`} className={styles.link}>{link.label}</a>
    : <NavLink key={link.to} to={link.to} end className={linkClass}>{link.label}</NavLink>)
  return <header className={solid || menuOpen ? `${styles.nav} ${styles.solid}` : styles.nav} data-organism-obstacle data-organism-padding="12" data-organism-weight="2">
    <div className={styles.inner}>
      <a href={import.meta.env.BASE_URL} aria-label={`${studio.name} ${studio.suffix} — home`}><img className={styles.logo} src={studio.logoUrl} alt={studio.name} /></a>
      <nav className={styles.right} aria-label="Main">{links()}</nav>
      <nav className={styles.pillarLinks} aria-label="Primary"><a href={`${import.meta.env.BASE_URL}#productions`}>Productions</a><a href={`${import.meta.env.BASE_URL}#experiences`}>Experiences</a></nav>
      <button ref={menuToggle} type="button" className={styles.menuToggle} aria-expanded={menuOpen} aria-controls="nav-mobile" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? 'Close' : 'Menu'}</button>
    </div>
    <nav id="nav-mobile" className={menuOpen ? `${styles.panel} ${styles.panelOpen}` : styles.panel} aria-label="Main (mobile)" hidden={!menuOpen}>{links()}</nav>
  </header>
}
