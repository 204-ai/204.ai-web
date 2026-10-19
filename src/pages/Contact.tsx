import { useRef, useState, type FormEvent } from 'react'
import { Pill } from '../components/ui/Pill'
import { Rich } from '../components/ui/Rich'
import { SecLab } from '../components/ui/SecLab'
import { describe } from '../data/content'
import { v2 } from '../data/studio'
import { useHead } from '../hooks/useHead'
import { trackLead, trackMapLoad } from '../lib/analytics'
import styles from './Contact.module.css'

// Brief intake (SPEC C15, I.brief): POST JSON to the `brief` function when configured,
// else the visitor's mail client, as before.
const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT as string | undefined

// reCAPTCHA Enterprise (invisible, score-based): the script loads on the first focus inside
// the form, never on page load (SPEC V4). Unset = no captcha.
const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined

// click-to-load map (SPEC V4): no tiles until asked
const OSM_EMBED =
  'https://www.openstreetmap.org/export/embed.html?bbox=-9.1494%2C38.7236%2C-9.1374%2C38.7296&layer=mapnik&marker=38.7266%2C-9.1434'

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        ready: (cb: () => void) => void
        execute: (key: string, opts: { action: string }) => Promise<string>
      }
    }
  }
}

type FieldKey = 'name' | 'org' | 'email'
const FIELDS: Array<[FieldKey, string, string, string, boolean]> = [
  ['name', 'name', 'text', 'name', false],
  ['org', 'organisation', 'text', 'organization', false],
  ['email', 'email — so we can get back to you', 'email', 'email', true],
]

/** v2 contact (prototype Contact): lead, contact rows, map, brief intake wired to the brief function. */
export function Contact() {
  useHead('Contact', describe.contact(v2()))
  const { studio } = v2()
  const c = studio.contact
  const mapUrl = c.map?.url
  const [brief, setBrief] = useState({ name: '', org: '', email: '', budget: '', scope: '' })
  const [trap, setTrap] = useState('') // honeypot: humans never see the field
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const captchaRequested = useRef(false)

  const loadCaptcha = () => {
    if (!RECAPTCHA_KEY || captchaRequested.current) return
    captchaRequested.current = true
    const s = document.createElement('script')
    s.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_KEY}`
    s.async = true
    document.head.appendChild(s)
  }

  const captchaToken = async (): Promise<string> => {
    const g = window.grecaptcha?.enterprise
    if (!RECAPTCHA_KEY || !g) return '' // key unset or script blocked: the server decides
    await new Promise<void>((r) => g.ready(r))
    return g.execute(RECAPTCHA_KEY, { action: 'brief' })
  }

  const briefMailto = () => {
    const subject = `Brief — ${brief.org || brief.name || 'new project'}`
    const head = [
      `Name: ${brief.name}`,
      brief.org && `Organisation: ${brief.org}`,
      `Reply to: ${brief.email}`,
      brief.budget && `Budget: ${brief.budget}`,
    ].filter(Boolean)
    const body = [head.join('\n'), brief.scope].filter(Boolean).join('\n\n')
    return `mailto:${c.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (state === 'sending') return
    if (!FORM_ENDPOINT) {
      trackLead(brief.budget)
      window.location.href = briefMailto()
      setState('sent')
      return
    }
    setState('sending')
    try {
      const token = await captchaToken()
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...brief, website: trap, token }),
        signal: AbortSignal.timeout(12000),
      })
      if (!res.ok) throw new Error(`brief endpoint ${res.status}`)
      trackLead(brief.budget)
      setState('sent')
    } catch {
      setState('error')
    }
  }

  const replyBy = new Date(Date.now() + 2 * 86400000).toDateString().slice(4)
  const rows: Array<[string, string, string]> = [
    ['email', c.email, `mailto:${c.email}`],
    ['studio', c.studio, mapUrl ?? ''],
    ['instagram', c.instagram, c.instagramUrl],
    ['linkedin', c.linkedin, c.linkedinUrl],
  ]

  return (
    <div className="v2">
      <section className={styles.contact}>
        <div className={styles.left}>
          <SecLab className={styles.lab}>§ 05 / write to us</SecLab>
          <h1 className={styles.head}>
            Send a
            <br />
            <em>brief.</em>
          </h1>
          <p className={styles.lead}>
            <Rich text={studio.copy.contact.lead} />
          </p>
          <div className={styles.rows}>
            {rows.map(([k, v, href]) => (
              <div key={k} className={styles.row}>
                <span className={styles.k}>{k}</span>
                {href ? (
                  <a className={styles.v} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {v}
                  </a>
                ) : (
                  <span className={styles.v}>{v}</span>
                )}
              </div>
            ))}
          </div>
          <SecLab className={styles.findLab}>/ find us</SecLab>
          <MapBox url={mapUrl} image={c.map?.image} />
        </div>

        <div className={styles.right}>
          <div className={styles.intake}>
            <SecLab className={styles.intakeLab}>/ brief intake · v02</SecLab>
            {state === 'sent' ? (
              <div className={styles.sent} role="status">
                <div className={styles.sentHead}>
                  Thank <em>you.</em>
                </div>
                <p className={styles.sentNote}>
                  We'll read it today and reply to {brief.email || 'you'} by {replyBy}.
                </p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={submit} onFocus={loadCaptcha}>
                {/* honeypot: off-canvas; bots that fill it get dropped server-side (SPEC V20) */}
                <input
                  type="text"
                  name="website"
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                  className={styles.trap}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                {FIELDS.map(([k, label, type, auto, required]) => (
                  <label key={k} className={styles.fld}>
                    <span>{label}</span>
                    <input
                      type={type}
                      name={k}
                      value={brief[k]}
                      onChange={(e) => setBrief({ ...brief, [k]: e.target.value })}
                      autoComplete={auto}
                      required={required}
                    />
                  </label>
                ))}
                <fieldset className={styles.fld}>
                  <legend>budget range</legend>
                  <div className={styles.chips}>
                    {studio.budgetRanges.map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={brief.budget === b ? `${styles.chip} ${styles.on}` : styles.chip}
                        aria-pressed={brief.budget === b}
                        onClick={() => setBrief({ ...brief, budget: brief.budget === b ? '' : b })}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className={styles.fld}>
                  <span>the three lines</span>
                  <textarea
                    name="scope"
                    rows={6}
                    placeholder="who you are · what you're making · when you need it"
                    value={brief.scope}
                    onChange={(e) => setBrief({ ...brief, scope: e.target.value })}
                  />
                </label>
                {state === 'error' && (
                  <div className={styles.error} role="alert">
                    ✕ couldn't send — try again or <a href={briefMailto()}>email us directly</a>
                  </div>
                )}
                <Pill wide solid type="submit" disabled={state === 'sending'}>
                  {state === 'sending' ? '● sending…' : '→ send brief'}
                </Pill>
                {RECAPTCHA_KEY && (
                  // required attribution: the floating badge is hidden, so the notice is inline (C15)
                  <div className={styles.fine}>
                    protected by recaptcha ·{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
                      privacy
                    </a>{' '}
                    ·{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">
                      terms
                    </a>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * Prototype .c-map frame. With a static image in studio.json it is the prototype's image
 * link; without one, the OpenStreetMap embed loads on click (SPEC V4, C22 map call).
 */
function MapBox({ url, image }: { url?: string; image?: string }) {
  const [loaded, setLoaded] = useState(false)
  const label = url && (
    <a className={styles.lbl} href={url} target="_blank" rel="noreferrer">
      open in google maps · lisboa
    </a>
  )
  if (image)
    return (
      <a className={styles.map} href={url} target="_blank" rel="noreferrer">
        <img className={styles.mapimg} src={image} alt="RnA Studio on the map" loading="lazy" />
        <span className={styles.lbl}>open in google maps · lisboa</span>
      </a>
    )
  return (
    <div className={styles.map}>
      {loaded ? (
        <iframe className={styles.mapimg} src={OSM_EMBED} title="RnA Studio on the map" />
      ) : (
        <button
          type="button"
          className={styles.load}
          onClick={() => {
            trackMapLoad()
            setLoaded(true)
          }}
        >
          <span className={styles.pin} aria-hidden="true">
            ⌖
          </span>
          <span className={styles.loadLab}>load map · openstreetmap</span>
        </button>
      )}
      {label}
    </div>
  )
}
