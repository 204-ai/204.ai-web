import { Link } from 'react-router-dom'
import type { PartnerLogo } from '../../data/content'
import styles from './LogoLoop.module.css'

/**
 * Prototype logo loop: an endless drift of white logos (paused on hover or focus);
 * `fixed` wraps the row in place instead. The second copy that closes the loop is
 * hidden from assistive tech and the tab order.
 */
export function LogoLoop({ title, items, fixed = false }: { title: string; items: PartnerLogo[]; fixed?: boolean }) {
  const row = fixed ? items : [...items, ...items]
  return (
    <div className={styles.loop}>
      <div className={styles.lab}>{title}</div>
      <div className={fixed ? `${styles.wrap} ${styles.fixed}` : styles.wrap}>
        <div className={styles.track}>
          {row.map((it, i) => {
            const copy = i >= items.length
            const img = <img src={it.logo} alt={copy ? '' : it.name} loading="lazy" decoding="async" />
            const tab = copy ? -1 : undefined
            return (
              <div key={i} className={styles.slot} aria-hidden={copy || undefined}>
                {!it.url ? img : it.url.startsWith('/') ? (
                  <Link to={it.url} tabIndex={tab}>{img}</Link>
                ) : (
                  <a href={it.url} target="_blank" rel="noreferrer" tabIndex={tab}>{img}</a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
