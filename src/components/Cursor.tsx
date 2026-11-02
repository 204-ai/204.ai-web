import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import styles from './Cursor.module.css'

const HOT = 'a,button,input,textarea,select,label,[role="button"],[data-cursor="hot"]'
const IDLE_MS = 2000

/**
 * Prototype CursorDot: a dot glued to the pointer and a ring that eases after it,
 * shown over interactive elements. Only for precise pointers with motion allowed
 * (SPEC V8, V24); the easing loop stops 2s after the pointer rests.
 */
export function Cursor() {
  const fine = useMediaQuery('(pointer: fine)')
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  const [hot, setHot] = useState(false)

  useEffect(() => {
    if (!enabled) return
    document.body.classList.add('cursor-none')
    let x = 0
    let y = 0
    let rx = 0
    let ry = 0
    let raf = 0
    let lastMove = 0
    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`
      const settled = Math.abs(x - rx) < 0.1 && Math.abs(y - ry) < 0.1
      raf = settled && performance.now() - lastMove > IDLE_MS ? 0 : requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      lastMove = performance.now()
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`
      setOn(true)
      setHot(Boolean((e.target as Element | null)?.closest?.(HOT)))
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onLeave = () => setOn(false)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
      document.body.classList.remove('cursor-none')
    }
  }, [enabled])

  if (!enabled) return null
  const state = `${on ? ` ${styles.on}` : ''}${hot ? ` ${styles.hot}` : ''}`
  return (
    <>
      <div ref={ring} className={`${styles.ring}${state}`} aria-hidden="true" />
      <div ref={dot} className={`${styles.dot}${state}`} aria-hidden="true" />
    </>
  )
}
