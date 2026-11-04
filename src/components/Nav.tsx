import { useLocation } from 'react-router-dom'
import { CONTENT } from '../data/studio'
import { siteHeader } from '../lib/site-shell'

export function Nav() {
  const { pathname } = useLocation()
  return <div className="site-chrome" onKeyDown={event => {
    if (event.key !== 'Escape') return
    const menu = event.currentTarget.querySelector<HTMLDetailsElement>('.site-menu[open]')
    if (menu) { menu.open = false; menu.querySelector('summary')?.focus() }
  }} dangerouslySetInnerHTML={{ __html: siteHeader(import.meta.env.BASE_URL, CONTENT.studio.logoUrl, pathname) }} />
}
