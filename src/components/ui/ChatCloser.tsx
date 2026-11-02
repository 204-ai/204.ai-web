import { useLocation } from 'react-router-dom'
import type { Closer } from '../../data/content'
import { trackCta } from '../../lib/analytics'
import { Pill } from './Pill'
import { Rich } from './Rich'
import styles from './ChatCloser.module.css'

/** Prototype closing card: faint "Let's chat" wall behind a centred call to action. */
export function ChatCloser({ copy, to = '/contact' }: { copy: Closer; to?: string }) {
  const { pathname } = useLocation()
  return (
    <section className={styles.closer}>
      <div className={styles.bg} aria-hidden="true">
        {Array.from({ length: 7 }, (_, r) => (
          <div key={r} className={styles.line}>
            {Array.from({ length: 8 }, (_, c) => (
              <span key={c}>Let&apos;s chat</span>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.fg}>
        <div className={styles.lab}>{copy.label}</div>
        <h2 className={styles.title}>
          <Rich text={copy.title} />
        </h2>
        <Pill solid to={to} onClick={() => trackCta('closer', { page: pathname })}>
          {copy.cta}
        </Pill>
      </div>
    </section>
  )
}
