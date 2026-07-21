// Custom dot cursor (Direction A). Active only on precise pointers (SPEC V8):
// touch devices keep the native cursor and never mount this component.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './Cursor.module.css'

interface CursorApi {
  setLabel: (label: string | null) => void
}

const CursorContext = createContext<CursorApi>({ setLabel: () => {} })

// eslint-disable-next-line react-refresh/only-export-components
export function useCursor() {
  return useContext(CursorContext)
}

function useIsFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(pointer: fine)')
    setFine(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return fine
}

export function CursorProvider({ children }: { children: ReactNode }) {
  const fine = useIsFinePointer()
  const [label, setLabel] = useState<string | null>(null)
  const api = useRef<CursorApi>({ setLabel: (l) => setLabel(l) })
  const setLabelStable = useCallback((l: string | null) => api.current.setLabel(l), [])

  return (
    <CursorContext.Provider value={{ setLabel: setLabelStable }}>
      {children}
      {fine && <CursorDot label={label} />}
    </CursorContext.Provider>
  )
}

type CursorMode = { kind: 'default' | 'ring' | 'label' | 'text'; label?: string }

const INTERACTIVE = 'a, button, [role="button"], select, summary, [data-cursor]'

function CursorDot({ label }: { label: string | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<CursorMode>({ kind: 'default' })

  useEffect(() => {
    document.body.classList.add('custom-cursor')
    const move = (e: MouseEvent) => {
      const el = ref.current
      if (el) el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      setVisible(true)
    }
    const leave = () => setVisible(false)
    // one global reaction for every interactive surface — labelled when the
    // element (or an ancestor) carries data-cursor, plain ring otherwise
    const over = (e: MouseEvent) => {
      const t = e.target as Element | null
      if (!t || !(t instanceof Element)) return
      if (t.closest('input, textarea')) {
        setMode({ kind: 'text' })
        return
      }
      const hit = t.closest(INTERACTIVE)
      if (!hit) {
        setMode({ kind: 'default' })
        return
      }
      const labelled = t.closest('[data-cursor]')
      // a plain link nested inside a labelled surface keeps its own ring
      if (labelled && (labelled === hit || labelled.contains(hit) === false || hit.contains(labelled))) {
        const dc = labelled.getAttribute('data-cursor') ?? ''
        setMode(dc ? { kind: 'label', label: dc } : { kind: 'ring' })
        return
      }
      if (labelled && hit.matches('a, button') && labelled !== hit) {
        setMode({ kind: 'ring' })
        return
      }
      const dc = labelled?.getAttribute('data-cursor')
      setMode(dc ? { kind: 'label', label: dc } : { kind: 'ring' })
    }
    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      document.body.classList.remove('custom-cursor')
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [])

  // context label (legacy API) wins over the auto mode
  const effective: CursorMode = label ? { kind: 'label', label } : mode
  const cls =
    effective.kind === 'label'
      ? styles.expanded
      : effective.kind === 'ring'
        ? styles.ring
        : effective.kind === 'text'
          ? styles.text
          : ''

  return (
    <div ref={ref} className={styles.root} style={{ opacity: visible ? 1 : 0 }} aria-hidden="true">
      <div className={`${styles.dot} ${cls}`}>{effective.kind === 'label' ? effective.label : ''}</div>
    </div>
  )
}
