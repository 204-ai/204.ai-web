import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChatCloser } from '../components/ui/ChatCloser'
import { Marquee } from '../components/ui/Marquee'
import { Pill } from '../components/ui/Pill'
import { Rich } from '../components/ui/Rich'
import { WorkCard } from '../components/work/WorkCard'
import { v2 } from '../data/studio'
import { useHead } from '../hooks/useHead'
import { trackWorkFilter } from '../lib/analytics'
import { matchesFilter, parseWorkFilter, workFilterSearch } from '../lib/workFilter'
import styles from './Work.module.css'

/** v2 portfolio (prototype Portfolio): multi-select practice filter in the URL, letterbox grid, closer. */
export function Work() {
  useHead('Work', 'Selected work: interactive installations, immersive mapping, branded and artistic AI film by 204.')
  const { works, services, studio } = v2()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const sel = useMemo(() => parseWorkFilter(params, services), [params, services])
  // JSON order is the authority (SPEC C19): no runtime year sort
  const list = works.filter((w) => matchesFilter(w.practices, sel))
  const labelOf = (id: string) => services.find((s) => s.id === id)?.label ?? id

  const select = (next: string[], tracked: string) => {
    navigate({ search: workFilterSearch(next, services) }, { replace: true })
    trackWorkFilter(tracked)
  }
  const toggle = (id: string) => select(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id], id)

  return (
    <div className="v2">
      <section className={styles.head}>
        <h1 className="r-up">
          Our
          <br />
          portfolio.
        </h1>
        <div className={`${styles.meta} r-up d-1`}>
          <div className={`${styles.text} ${styles.hint}`}>{'// filter by practice — tap one or more below'}</div>
          <div className={`${styles.text} ${styles.lead}`}>
            <Rich text={studio.copy.portfolio.lead} />
          </div>
          <div className={styles.filters} role="group" aria-label="Filter by practice">
            <Pill sm solid={sel.length === 0} pressed={sel.length === 0} className={sel.length ? styles.off : undefined} onClick={() => select([], 'all')}>
              All work
            </Pill>
            {services.map((s) => {
              const on = sel.includes(s.id)
              return (
                <Pill key={s.id} sm solid={on} pressed={on} className={on ? undefined : styles.off} onClick={() => toggle(s.id)}>
                  {s.label}
                </Pill>
              )
            })}
          </div>
        </div>
      </section>

      <Marquee text={`Selected work · ${sel.length ? sel.map(labelOf).join(' · ') : 'all practices'}`} />

      <section className={styles.grid} aria-label={`${list.length} projects`}>
        {list.map((w, i) => (
          <WorkCard key={w.slug} work={w} index={i} labelOf={labelOf} />
        ))}
      </section>

      <ChatCloser copy={studio.copy.portfolio.closer} />
    </div>
  )
}
