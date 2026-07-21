import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'

// Route-level code splitting: the entry chunk carries only the shell + Home;
// every other page loads its own small chunk on navigation.
const Work = lazy(() => import('./pages/Work').then((m) => ({ default: m.Work })))
const WorkDetail = lazy(() => import('./pages/WorkDetail').then((m) => ({ default: m.WorkDetail })))
const Services = lazy(() => import('./pages/Services').then((m) => ({ default: m.Services })))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail').then((m) => ({ default: m.ServiceDetail })))
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })))
const MakerDetail = lazy(() => import('./pages/MakerDetail').then((m) => ({ default: m.MakerDetail })))
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

export default function App() {
  // warm the route chunks once the shell is idle: splitting keeps first
  // paint lean, but an unfetched chunk blanks the body on the first nav
  // click (§B12) — after this, navigation is instant
  useEffect(() => {
    const warm = () => {
      import('./pages/Work')
      import('./pages/WorkDetail')
      import('./pages/Services')
      import('./pages/ServiceDetail')
      import('./pages/About')
      import('./pages/MakerDetail')
      import('./pages/Contact')
    }
    const hasRic = typeof window.requestIdleCallback === 'function'
    const id = hasRic ? window.requestIdleCallback(warm, { timeout: 3000 }) : window.setTimeout(warm, 1500)
    return () => (hasRic ? window.cancelIdleCallback(id) : window.clearTimeout(id))
  }, [])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={wrap(<Work />)} />
        <Route path="/work/:slug" element={wrap(<WorkDetail />)} />
        <Route path="/services" element={wrap(<Services />)} />
        <Route path="/services/:slug" element={wrap(<ServiceDetail />)} />
        <Route path="/about" element={wrap(<About />)} />
        <Route path="/makers/:slug" element={wrap(<MakerDetail />)} />
        <Route path="/contact" element={wrap(<Contact />)} />
        <Route path="*" element={wrap(<NotFound />)} />
      </Route>
    </Routes>
  )
}

function wrap(el: React.ReactNode) {
  return <Suspense fallback={null}>{el}</Suspense>
}
