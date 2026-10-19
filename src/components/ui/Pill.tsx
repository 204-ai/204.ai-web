import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './Pill.module.css'

interface PillProps {
  children: ReactNode
  solid?: boolean
  wide?: boolean
  sm?: boolean
  /** internal route (react-router Link) */
  to?: string
  /** external or mailto link */
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  /** toggle buttons (filters): rendered as aria-pressed (SPEC V25) */
  pressed?: boolean
  className?: string
}

/** Prototype .btn-pill: mono uppercase pill; outline by default, `solid` inverts. */
export function Pill({ children, solid, wide, sm, to, href, onClick, type = 'button', pressed, className }: PillProps) {
  const cls = [styles.pill, solid && styles.solid, wide && styles.wide, sm && styles.sm, className].filter(Boolean).join(' ')
  if (to) return <Link className={cls} to={to} onClick={onClick}>{children}</Link>
  if (href) {
    const external = /^https?:/.test(href)
    return <a className={cls} href={href} onClick={onClick} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}</a>
  }
  return (
    <button className={cls} type={type} onClick={onClick} aria-pressed={pressed}>
      {children}
    </button>
  )
}
