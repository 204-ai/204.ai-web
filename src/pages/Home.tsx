import { ChatCloser } from '../components/ui/ChatCloser'
import { LogoLoop } from '../components/ui/LogoLoop'
import { Marquee } from '../components/ui/Marquee'
import { Pill } from '../components/ui/Pill'
import { Rich } from '../components/ui/Rich'
import { CreativeProcess } from '../components/home/CreativeProcess'
import { FeaturedBands } from '../components/home/FeaturedBands'
import { HeroRotator } from '../components/home/HeroRotator'
import { ServiceLoop } from '../components/home/ServiceLoop'
import { describe } from '../data/content'
import { CONTENT } from '../data/studio'
import { useHead } from '../hooks/useHead'
import { trackCta } from '../lib/analytics'
import styles from './Home.module.css'

/** v2 home (prototype ContentHome): hero, marquee, who, services, featured work, process, logos, closer. */
export function Home() {
  const { studio } = CONTENT
  useHead('', describe.home(CONTENT))
  return (
    <div className="v2">
      <HeroRotator />
      <Marquee text={studio.copy.home.marquee} />
      <section className={styles.who}>
        <div className={styles.lab}>Who is {studio.name}?</div>
        <p data-organism-obstacle data-organism-padding="24">
          <Rich text={studio.copy.home.who} />
        </p>
        <Pill to="/contact" onClick={() => trackCta('work_with_us')}>Work with us</Pill>
      </section>
      <ServiceLoop />
      <FeaturedBands />
      <CreativeProcess />
      <section
        className={styles.logoLoops}
        data-organism-obstacle
        data-organism-padding="14"
        data-organism-weight="0.6"
        data-organism-allow-tendrils="true"
      >
        <LogoLoop title="Trusted by" items={studio.trustedBy} />
        <LogoLoop title="Partners" items={studio.partners} fixed />
      </section>
      <ChatCloser copy={studio.copy.closer} />
    </div>
  )
}
