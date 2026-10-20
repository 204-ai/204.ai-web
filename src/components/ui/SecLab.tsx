import type { ReactNode } from 'react'
import styles from './SecLab.module.css'

/** Prototype .sec-lab: mono section label ("§ 05 / write to us"); spacing belongs to the page. */
export function SecLab({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `${styles.lab} ${className}` : styles.lab}>{children}</div>
}
