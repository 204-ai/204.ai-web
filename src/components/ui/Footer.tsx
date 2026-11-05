import { CONTENT } from '../../data/studio'
import { siteFooter } from '../../lib/site-shell'
import { trackSocialClick } from '../../lib/analytics'

export function Footer() {
  return <div className="site-chrome" onClick={event => {
    const link = (event.target as Element).closest<HTMLElement>('[data-social]')
    if (link?.dataset.social) trackSocialClick(link.dataset.social)
  }} dangerouslySetInnerHTML={{ __html: siteFooter(import.meta.env.BASE_URL, CONTENT.studio) }} />
}
