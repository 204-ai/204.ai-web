import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { trackPageView } from '../lib/analytics'
import { Cursor } from './Cursor'
import { Nav } from './Nav'
import { Footer } from './ui/Footer'

export function Layout() {
  const { pathname } = useLocation()

  // Route change: reset scroll (SPA keeps scroll position by default).
  useEffect(() => {
    window.scrollTo(0, 0)
    // rAF: let useHead set the route title before it's reported
    const raf = requestAnimationFrame(() => trackPageView(window.location.pathname, document.title))
    return () => cancelAnimationFrame(raf)
  }, [pathname])

  // The prototype cuts to black and fades the next page in; here the new page
  // mounts at once and fades in (no blocking overlay, SPEC B12).
  return (
    <>
      {/* organism disabled on the site until the lab version is approved
          (user 2026-07-21) — iterate in organism-lab.html */}
      <div className="v2">
        <Nav />
      </div>
      {/* content sits above the organism canvas (SPEC V17) */}
      {/* pages own their top spacing under the fixed nav (heroes sit beneath it); <main> clips
          the entrance transforms so they never grow the scroll area */}
      <main style={{ overflow: 'clip', position: 'relative', zIndex: 1 }}>
        <div className="page-fade" key={pathname}>
          <Outlet />
        </div>
      </main>
      <div className="v2">
        <Footer />
      </div>
      <Cursor />
      <div className="grain-overlay" aria-hidden="true" />
    </>
  )
}
