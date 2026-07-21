// Social link row — renders only the links that are set on the person.

import { ICONS } from './icons'
import type { PersonSocials } from '../data/studio'
import { trackSocialClick } from '../lib/analytics'
import styles from './SocialLinks.module.css'

const LABELS: Record<keyof PersonSocials, string> = {
  instagram: 'INSTAGRAM',
  linkedin: 'LINKEDIN',
  web: 'WEB',
  email: 'EMAIL',
}

export function SocialLinks({ socials, compact = false, person }: { socials?: PersonSocials; compact?: boolean; person?: string }) {
  if (!socials) return null
  const entries = (Object.keys(LABELS) as Array<keyof PersonSocials>)
    .filter((k) => socials[k])
    .map((k) => ({
      key: k,
      href: k === 'email' ? `mailto:${socials[k]}` : socials[k]!,
      label: LABELS[k],
    }))
  if (entries.length === 0) return null

  return (
    <div className={compact ? styles.compact : styles.list}>
      {entries.map((e) => (
        <a
          key={e.key}
          href={e.href}
          target={e.href.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className={styles.item}
          aria-label={e.label}
          onClick={(ev) => {
            ev.stopPropagation()
            trackSocialClick(e.key, person)
          }}
        >
          <span className={styles.icon}>{ICONS[e.key]}</span>
          {!compact && <span className={`t-mono ${styles.label}`}>{e.label}</span>}
        </a>
      ))}
    </div>
  )
}
