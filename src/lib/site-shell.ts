/** Shared chrome for the editorial pages and the React project/service catalog. */
export const SITE_NAV = [
  { path: 'productions/', label: 'Productions' },
  { path: 'experiences/', label: 'Experiences' },
  { path: 'services/', label: 'Art & Tech' },
  { path: 'about/', label: 'About' },
]
const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

export function siteHeader(base: string, logo: string, path = '') {
  const links = SITE_NAV.map(link => `<a href="${base}${link.path}"${path.replace(/^\//, '').startsWith(link.path.replace(/\/$/, '')) ? ' aria-current="page"' : ''}>${escape(link.label)}</a>`).join('')
  return `<header class="site-header"><div class="site-header-inner"><a class="site-brand" href="${base}" aria-label="204 home"><img src="${escape(logo)}" width="320" height="189" alt="204 No Content"></a><nav class="site-desktop-nav" aria-label="Main">${links}<a class="site-contact-link" href="${base}contact/">Let’s talk ↗</a></nav><details class="site-menu"><summary>Menu</summary><nav aria-label="Main menu">${links}<a href="${base}contact/">Let’s talk ↗</a></nav></details></div></header>`
}

interface FooterContent {
  logoUrl: string
  copy: { footer: { blurb: string } }
  rnaStudioUrl: string
  footer: { address: string; socials: { label: string; url: string }[] }
}
export function siteFooter(base: string, studio: FooterContent) {
  const links = [...SITE_NAV, { path: 'work/', label: 'All work' }].map(link => `<a href="${base}${link.path}">${escape(link.label)}</a>`).join('')
  return `<footer class="site-footer"><div class="site-footer-top"><div class="site-footer-brand"><img src="${escape(studio.logoUrl)}" width="320" height="189" alt="204 No Content" loading="lazy"><p>${escape(studio.copy.footer.blurb)}</p></div><div><h2>Explore</h2>${links}</div><div><h2>Visit</h2><a href="${escape(studio.rnaStudioUrl)}" target="_blank" rel="noreferrer">RnA Studio ↗</a><p>${escape(studio.footer.address).replaceAll('\n', '<br>')}</p><a href="${base}sentient-studio/">Explore Sentient Studio ↗</a></div><div><h2>Get in touch</h2><a href="mailto:hello@204.ai">hello@204.ai</a>${studio.footer.socials.map(link => `<a data-social="${escape(link.label.toLowerCase())}" href="${escape(link.url)}" target="_blank" rel="noreferrer">${escape(link.label)}</a>`).join('')}</div></div><div class="site-footer-bottom"><span>© 204.ai · A brand of Dao Llama Labs AG, Zug, Switzerland · ${new Date().getFullYear()}</span><span>Studio at RnA Studio, Lisbon</span></div></footer>`
}
