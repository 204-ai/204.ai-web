import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { v2 } from '../data/studio'
import styles from './Nav.module.css'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/work', label: 'Our Work', drop: true },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]
// nav dropdown presets → /work?pillar= (SPEC I.routes)
const WORK_MENU = [
  { to: '/work', label: 'All Work' },
  { to: '/work?pillar=content', label: '.content' },
  { to: '/work?pillar=interactive', label: '.interactive' },
]

const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)

/**
 * Prototype nav: fixed, gradient until 60px of scroll, then solid. "Our Work" opens its
 * menu on hover (precise pointers), on focus, or via its ▾ toggle for touch and
 * keyboard (SPEC V25); Escape closes it. Phones get a Menu panel instead of the row.
 */
export function Nav() {
  const { studio } = v2()
  const { pathname, search } = useLocation()
  const [solid, setSolid] = useState(false)
  const [workOpen, setWorkOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const workToggle = useRef<HTMLButtonElement>(null)
  const menuToggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // any navigation closes both menus
  useEffect(() => {
    setWorkOpen(false)
    setMenuOpen(false)
  }, [pathname, search])

  useEffect(() => {
    if (!workOpen && !menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (workOpen) workToggle.current?.focus()
      if (menuOpen) menuToggle.current?.focus()
      setWorkOpen(false)
      setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [workOpen, menuOpen])

  return (
    <header
      className={solid || menuOpen ? `${styles.nav} ${styles.solid}` : styles.nav}
      data-organism-obstacle
      data-organism-padding="12"
      data-organism-weight="2"
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/" aria-label={`${studio.name} ${studio.suffix} — home`}>
            <img className={styles.logo} src={studio.logoUrl} alt={studio.name} />
          </Link>
        </div>
        <nav className={styles.right} aria-label="Main">
          {LINKS.map((l) =>
            l.drop ? (
              <div
                key={l.to}
                className={workOpen ? `${styles.hasDrop} ${styles.open}` : styles.hasDrop}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setWorkOpen(false)
                }}
              >
                <NavLink to={l.to} end className={linkClass}>{l.label}</NavLink>
                <button
                  ref={workToggle}
                  type="button"
                  className={styles.toggle}
                  aria-expanded={workOpen}
                  aria-controls="nav-work-menu"
                  aria-label={`${l.label} menu`}
                  onClick={() => setWorkOpen((o) => !o)}
                >
                  ▾
                </button>
                <div id="nav-work-menu" className={styles.dropdown}>
                  {WORK_MENU.map((m) => (
                    <Link key={m.to} className={styles.item} to={m.to}>
                      <span>{m.label}</span>
                      <span className={styles.ar}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={l.to} to={l.to} end className={linkClass}>{l.label}</NavLink>
            ),
          )}
        </nav>
        <button
          ref={menuToggle}
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="nav-mobile"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>
      <nav id="nav-mobile" className={menuOpen ? `${styles.panel} ${styles.panelOpen}` : styles.panel} aria-label="Main (mobile)" hidden={!menuOpen}>
        {LINKS.map((l) => (
          <div key={l.to} className={styles.panelGroup}>
            <NavLink to={l.to} end className={linkClass}>{l.label}</NavLink>
            {l.drop &&
              WORK_MENU.slice(1).map((m) => (
                <Link key={m.to} className={styles.panelSub} to={m.to}>{m.label}</Link>
              ))}
          </div>
        ))}
      </nav>
    </header>
  )
}
