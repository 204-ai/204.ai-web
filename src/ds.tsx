// Dev-only gallery of the v2 primitives (SPEC T53) at /ds.html under `npm run dev`.
// ds.html is not a vite build input, so this never ships; fidelity checks compare it
// against the prototype served from design/cinematic.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/fonts'
import './styles/global.css'
import { ChatCloser } from './components/ui/ChatCloser'
import { CineCard, CineGrid } from './components/ui/CineCard'
import { Footer } from './components/ui/Footer'
import { LogoLoop } from './components/ui/LogoLoop'
import { Marquee } from './components/ui/Marquee'
import { Pill } from './components/ui/Pill'
import { SecLab } from './components/ui/SecLab'
import { TitleCard } from './components/ui/TitleCard'
import { v2 } from './data/studio'

const c = v2()
const cards = ['motel-x', 'stand-virtual', 'm-k-ciurlionis-trail-of-angels'].map((s) => c.works.find((w) => w.slug === s)!)

export function Gallery() {
  return (
    <div className="v2">
      <section data-ds="pill" style={{ padding: 48, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pill>Work with us</Pill>
        <Pill solid>Start your project</Pill>
        <Pill sm>All work</Pill>
        <div style={{ width: 400 }}>
          <Pill wide solid>→ send brief</Pill>
        </div>
      </section>
      <section data-ds="marquee">
        <Marquee text={c.studio.copy.home.marquee} />
      </section>
      <section data-ds="seclab" style={{ padding: 48 }}>
        <SecLab>§ 05 / write to us</SecLab>
      </section>
      <section data-ds="titlecard">
        <TitleCard chapter="01. // chapter" name="The frames" tail={'tight crops\nhard contrast'} />
      </section>
      <section data-ds="cinegrid" style={{ padding: '40px var(--side-pad) 120px' }}>
        <CineGrid>
          {cards.map((w) => (
            <CineCard key={w.slug} to={`/work/${w.slug}`} title={w.title} metaTl={`${w.year} · ${w.format.toLowerCase()}`} metaTr="dir. 204" sub={w.note} img={w.media?.still} />
          ))}
        </CineGrid>
      </section>
      <section data-ds="logos" style={{ padding: '96px 0', display: 'flex', flexDirection: 'column', gap: 64 }}>
        <LogoLoop title="Trusted by" items={c.studio.trustedBy} />
        <LogoLoop title="Partners" items={c.studio.partners} fixed />
      </section>
      <section data-ds="closer">
        <ChatCloser copy={c.studio.copy.closer} />
      </section>
      <section data-ds="closer-portfolio">
        <ChatCloser copy={c.studio.copy.portfolio.closer} />
      </section>
      <section data-ds="footer">
        <Footer />
      </section>
      <div className="grain-overlay" />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Gallery />
    </BrowserRouter>
  </StrictMode>,
)
