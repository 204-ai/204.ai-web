import { Link } from 'react-router-dom'
import type { PartnerLogo } from '../../data/content'
import { imgDims } from '../../lib/dims'
import styles from './TrustedBy.module.css'
import '../../../site/home/assets/trust-motion.css'
import alanWattsLogo from '../../../site/home/assets/alan-watts-org-signature.webp'

/** A complete, static view of the documented relationships, ordered by editorial prominence. */
export function TrustedBy({ items }: { items: PartnerLogo[] }) {
  const ordered = (['lead', 'featured', 'more'] as const).flatMap((tier) => items.filter((item) => item.tier === tier))
  return (
    <section className={styles.wall} id="trusted-by" aria-labelledby="trusted-by-title">
      <div className={styles.heading}>
        <h2 id="trusted-by-title">Trusted by</h2>
        <p>Clients, artists and collaborators</p>
      </div>
      <ul className="trust-row">
        {ordered.map((item) => {
          const alanWatts = item.name === 'Alan Watts Organization'
          const logo = alanWatts ? alanWattsLogo : item.logo
          const dimensions = alanWatts ? {width: 596, height: 189} : imgDims(logo)
          const alt = item.note ? `${item.name} · ${item.note}` : item.name
          const content = <span className="trust-mark"><img src={logo} {...dimensions} alt={alt} loading="lazy" decoding="async" /></span>
          return (
            <li key={item.name} data-partner={item.name} data-tier={item.tier}>
              {item.url?.startsWith('/') ? <Link to={item.url}>{content}</Link> : item.url ? <a href={item.url} target="_blank" rel="noreferrer">{content}</a> : <span>{content}</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
