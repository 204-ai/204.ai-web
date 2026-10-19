import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { trackPageView } from '../lib/analytics'
import { Cursor } from './Cursor'
import { Nav } from './Nav'
import { Footer } from './ui/Footer'

// Pages rebuilt in the v2 design (T55–T60 add theirs): they own their top spacing
// under the fixed nav and fade in like the prototype. Every other route is still a
// Night Shift page: padded below the nav, with its own entrance. T65 removes this.
const V2_PAGES: RegExp[] = [/^\/$/, /^\/work\/?$/]

export function Layout() {
  const { pathname, state } = useLocation()
  const v2Page = V2_PAGES.some((r) => r.test(pathname))
  // pager links pass { pager: 'prev' | 'next' } — those get a fast directional slide
  const pager = (state as { pager?: 'prev' | 'next' } | null)?.pager
  const enterClass = v2Page ? 'page-fade' : pager === 'prev' ? 'page-pager-prev' : pager === 'next' ? 'page-pager-next' : 'page-enter'

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
      <main style={{ paddingTop: v2Page ? 0 : 'var(--chrome-h)', overflow: 'clip', position: 'relative', zIndex: 1 }}>
        <div className={v2Page ? enterClass : `shell ${enterClass}`} key={pathname}>
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
