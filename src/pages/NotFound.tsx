import { Navigate, useLocation } from 'react-router-dom'
import { Pill } from '../components/ui/Pill'
import { v2 } from '../data/studio'
import { useHead } from '../hooks/useHead'
import styles from './NotFound.module.css'

/**
 * Unknown routes: a retired slug or removed page redirects to its live path first
 * (aliases ∪ redirects.json, SPEC C20/V3), everything else is a v2 404.
 */
export function NotFound() {
  const { pathname } = useLocation()
  const target = v2().redirects[pathname.replace(/\/+$/, '') || '/']
  useHead(target ? '' : '404', 'Page not found. Which is on-brand, but not on purpose this time.')
  if (target) return <Navigate to={target} replace />
  return (
    <div className={`v2 ${styles.root}`}>
      <div className={styles.lab}>{'// 404 — not found'}</div>
      <h1 className={styles.title}>
        Nothing
        <br />
        <em>here.</em>
      </h1>
      <p className={styles.text}>We're named after a response that returns nothing, but this one is a genuine miss.</p>
      <Pill to="/">Back to home</Pill>
    </div>
  )
}
