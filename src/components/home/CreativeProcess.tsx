import { useEffect, useState } from 'react'
import { v2 } from '../../data/studio'
import { useDocumentHidden } from '../../hooks/useDocumentHidden'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { trackCta } from '../../lib/analytics'
import { Pill } from '../ui/Pill'
import styles from './CreativeProcess.module.css'

const STEP_MS = 4200
const R = 42

/**
 * Prototype creative-process dial: four nodes on a ring, the arc and core follow the
 * active step. Advances every 4.2s unless hovered or focused, reduced motion is on, or
 * the tab is hidden (SPEC V7, V24); nodes are buttons.
 */
export function CreativeProcess() {
  const steps = v2().studio.process
  const reduced = usePrefersReducedMotion()
  const hidden = useDocumentHidden()
  const [act, setAct] = useState(0)
  const [paused, setPaused] = useState(false)
  const step = steps[act]
  const turn = 360 / steps.length

  useEffect(() => {
    if (paused || reduced || hidden) return
    const id = window.setInterval(() => setAct((i) => (i + 1) % steps.length), STEP_MS)
    return () => window.clearInterval(id)
  }, [paused, reduced, hidden, steps.length])

  return (
    <section className={styles.process}>
      <div className={styles.head}>
        <h2>
          Creative
          <br />
          <em>process</em>
        </h2>
        <div className={styles.lab}>{'// how we work'}</div>
      </div>
      <div
        className={styles.stage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
        }}
      >
        <div className={styles.dial}>
          <svg className={styles.rings} viewBox="0 0 100 100" aria-hidden="true">
            <circle className={styles.ring} cx="50" cy="50" r={R} />
            <circle className={`${styles.ring} ${styles.faint}`} cx="50" cy="50" r={R - 11} />
            <circle
              className={styles.arc}
              cx="50"
              cy="50"
              r={R}
              strokeDasharray={`${(2 * Math.PI * R) / steps.length} ${2 * Math.PI * R}`}
              style={{ transform: `rotate(${-90 + act * turn}deg)` }}
            />
          </svg>
          {steps.map((s, n) => {
            const a = ((-90 + n * turn) * Math.PI) / 180
            return (
              <button
                key={s.n}
                type="button"
                className={`${styles.node} ${styles[`q${n}`] ?? ''}${n === act ? ` ${styles.on}` : ''}`}
                style={{ left: `${50 + R * Math.cos(a)}%`, top: `${50 + R * Math.sin(a)}%` }}
                aria-label={`${s.n} ${s.label}`}
                aria-pressed={n === act}
                onClick={() => setAct(n)}
              >
                <span className={styles.dot} />
                <span className={styles.cap} aria-hidden="true">
                  {s.n} {s.label}
                </span>
              </button>
            )
          })}
          <div className={styles.core}>
            <div className={styles.idx}>{step.n}</div>
            <div className={styles.ttl}>{step.label}</div>
            <div className={styles.dsc}>{step.body}</div>
          </div>
        </div>
      </div>
      <div className={styles.foot}>
        <div className={styles.tick}>
          {`// ${String(act + 1).padStart(2, '0')} of ${String(steps.length).padStart(2, '0')} — hover to pause, click a node`}
        </div>
        <Pill to="/contact" onClick={() => trackCta('home_process_contact')}>Ready to start? Work with us →</Pill>
      </div>
    </section>
  )
}
