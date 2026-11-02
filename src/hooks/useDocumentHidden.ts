import { useSyncExternalStore } from 'react'

function subscribe(cb: () => void) {
  document.addEventListener('visibilitychange', cb)
  return () => document.removeEventListener('visibilitychange', cb)
}

// SPEC V24: JS timers, rAF loops and video pause while the tab is hidden.
export function useDocumentHidden(): boolean {
  return useSyncExternalStore(subscribe, () => document.hidden)
}
