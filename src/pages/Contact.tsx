import { useState, type FormEvent } from 'react'
import { ICONS, type IconName } from '../components/icons'
import { useHead } from '../hooks/useHead'
import { trackLead, trackMapLoad } from '../lib/analytics'
import { BUDGET_RANGES, CONTACT } from '../data/studio'
import styles from './Contact.module.css'

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=R.+Ferreira+Lapa+12A,+1150-157+Lisboa'

const INFO: Array<[IconName, string, string, string?]> = [
  ['email', 'EMAIL', CONTACT.email, `mailto:${CONTACT.email}`],
  ['studio', 'STUDIO', CONTACT.studio, MAPS_URL],
  ['instagram', 'INSTAGRAM', CONTACT.instagram, CONTACT.instagramUrl],
  ['linkedin', 'LINKEDIN', CONTACT.linkedin, CONTACT.linkedinUrl],
]

export function Contact() {
  useHead(
    'Contact',
    'Send a brief, not a form. Three lines: who you are, what you’re making, when you need it by.',
  )
  const [brief, setBrief] = useState({ name: '', org: '', email: '', budget: '', scope: '' })
  const [sent, setSent] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    trackLead(brief.budget)
    // no backend (SPEC C8) — deliver the brief via the visitor's mail client
    const subject = `Brief — ${brief.name || 'new project'}`
    const body = [
      `Name: ${brief.name}`,
      brief.org && `Organisation: ${brief.org}`,
      `Reply to: ${brief.email}`,
      brief.budget && `Budget: ${brief.budget}`,
      '',
      brief.scope,
    ]
      .filter(Boolean)
      .join('\n')
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const replyBy = new Date(Date.now() + 2 * 86400000).toDateString().slice(4)

  return (
    <div className={styles.root}>
      <div>
        <div className="t-label" style={{ marginBottom: 8 }}>§ 05 / WRITE TO US</div>
        <h1 className={`t-display ${styles.title}`}>
          Send a <span style={{ color: 'var(--accent)' }}>brief</span>,
          <br />
          not a <span style={{ color: 'var(--dim)' }}>form.</span>
        </h1>
        <p className={`t-serif ${styles.body}`}>
          The fastest way to start a conversation is a three-line email: who you are, what you're making, and when you
          need it by. We read everything and reply within two working days.
        </p>

        <dl className={`t-mono ${styles.info} anim-fade`}>
          {INFO.map(([icon, k, v, href]) => (
            <div key={k} className={styles.infoRow}>
              <dt className={styles.infoKey}>
                <span className={styles.infoIcon}>{ICONS[icon]}</span>
                {k}
              </dt>
              <dd className={styles.infoValue}>
                {href ? (
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {v}
                  </a>
                ) : (
                  v
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className={styles.findUs}>
          <div className="t-label" style={{ marginBottom: 12 }}>/ FIND US</div>
          <MapEmbed />
        </div>
      </div>

      <div className={`${styles.panel} anim-fade`}>
        <div className="t-label" style={{ marginBottom: 20 }}>/ BRIEF INTAKE · v02</div>
        {sent ? (
          <div className={styles.sent}>
            <div className={`t-mono ${styles.sentBadge}`}>● RECEIVED</div>
            <div className={`t-display ${styles.sentTitle}`}>Thank you.</div>
            <div className={styles.sentNote}>
              We'll read it today and reply to {brief.email || 'you'} by {replyBy}.
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            {(
              [
                ['name', 'Name', 'text', 'name', false],
                ['org', 'Organisation', 'text', 'organization', false],
                ['email', 'Email — so we can get back to you', 'email', 'email', true],
              ] as const
            ).map(([k, l, type, auto, required]) => (
              <label key={k} className={styles.field}>
                <span className={`t-mono ${styles.fieldLabel}`}>{l.toUpperCase()}</span>
                <input
                  value={brief[k]}
                  onChange={(e) => setBrief({ ...brief, [k]: e.target.value })}
                  className={styles.input}
                  type={type}
                  autoComplete={auto}
                  required={required}
                />
              </label>
            ))}
            <fieldset className={styles.field} style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
              <legend className={`t-mono ${styles.fieldLabel}`} style={{ padding: 0 }}>
                BUDGET RANGE
              </legend>
              <div className={styles.chips}>
                {BUDGET_RANGES.map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setBrief({ ...brief, budget: b })}
                    className={`t-mono ${styles.chip} ${brief.budget === b ? styles.chipActive : ''}`}
                    aria-pressed={brief.budget === b}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className={styles.field}>
              <span className={`t-mono ${styles.fieldLabel}`}>THE THREE LINES</span>
              <textarea
                value={brief.scope}
                onChange={(e) => setBrief({ ...brief, scope: e.target.value })}
                rows={5}
                placeholder="who you are · what you're making · when you need it"
                className={styles.textarea}
              />
            </label>
            <button type="submit" className={`t-mono ${styles.submit}`}>
              → Send Brief
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// Click-to-load — no third-party tiles until asked (SPEC V4), dark-filtered
// into the palette; the Google Maps link rides on the map as an overlay chip.
function MapEmbed() {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={styles.map}>
      {loaded ? (
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=-9.1494%2C38.7236%2C-9.1374%2C38.7296&layer=mapnik&marker=38.7266%2C-9.1434"
          title="RnA Studio on the map"
        />
      ) : (
        <button
          onClick={() => {
            trackMapLoad()
            setLoaded(true)
          }}
          className={styles.mapButton}
        >
          <span className={styles.mapCross} aria-hidden="true">
            ⌖
          </span>
          <span className={`t-mono ${styles.mapLabel}`}>LOAD MAP · OPENSTREETMAP</span>
        </button>
      )}
      <a href={MAPS_URL} target="_blank" rel="noreferrer" className={`t-mono ${styles.mapsChip}`}>
        → OPEN IN GOOGLE MAPS
      </a>
    </div>
  )
}
