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

function CursorDot({ label }: { label: string | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    document.body.classList.add('custom-cursor')
    const move = (e: MouseEvent) => {
      const el = ref.current
      if (el) el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      setVisible(true)
    }
    const leave = () => setVisible(false)
    window.addEventListener('mousemove', move)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      document.body.classList.remove('custom-cursor')
      window.removeEventListener('mousemove', move)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <div ref={ref} className={styles.root} style={{ opacity: visible ? 1 : 0 }} aria-hidden="true">
      <div className={`${styles.dot} ${label ? styles.expanded : ''}`}>{label ?? ''}</div>
    </div>
  )
}
