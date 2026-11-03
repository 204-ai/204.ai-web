import { Link } from 'react-router-dom'
import type { PartnerLogo } from '../../data/content'
import { imgDims } from '../../lib/dims'
import styles from './TrustedBy.module.css'

/** A complete, static view of the documented relationships, ordered by editorial prominence. */
export function TrustedBy({ items }: { items: PartnerLogo[] }) {
  return (
    <section className={styles.wall} id="trusted-by" aria-labelledby="trusted-by-title">
      <div className={styles.heading}>
        <h2 id="trusted-by-title">Trusted by</h2>
        <p>Clients, artists and collaborators</p>
      </div>
      {(['lead', 'featured', 'more'] as const).map((tier) => (
        <ul className={`${styles.row} ${styles[tier]}`} key={tier}>
          {items.filter((item) => item.tier === tier).map((item) => {
            const content = <><span className={styles.mark}><img src={item.logo} {...imgDims(item.logo)} alt="" loading="lazy" decoding="async" /></span><span className={styles.name}>{item.name}{item.note && <span className={styles.note}>{item.note}</span>}</span></>
            return (
              <li key={item.name}>
                {item.url?.startsWith('/') ? <Link to={item.url}>{content}</Link> : item.url ? <a href={item.url} target="_blank" rel="noreferrer">{content}</a> : <span>{content}</span>}
              </li>
            )
          })}
        </ul>
      ))}
    </section>
  )
}
