/** Shared chrome for the editorial pages and the React project/service catalog. */
export const SITE_NAV = [
  { path: 'productions/', label: 'Productions' },
  { path: 'experiences/', label: 'Experiences' },
  { path: 'services/', label: 'Art & Tech' },
  { path: 'about/', label: 'About' },
]
const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const SECTION_LINKS = {
  productions: [
    ['productions/#alan-watts', 'Alan Watts'],
    ['productions/#dimination', 'Dimination'],
    ['productions/#working-title', 'Working Title'],
    ['productions/#ciurlionis', 'Čiurlionis'],
  ],
  experiences: [
    ['experiences/#magic-mirror', 'Magic Mirror'],
    ['experiences/#magic-booth', 'Magic Booth'],
    ['sentient-studio/', 'Sentient Studio'],
    ['experiences/#dome-and-360', 'Dome & 360°'],
  ],
  services: [
    ['services/#studio-artworks', 'Studio Artworks'],
    ['services/#technology', 'Technology & Workflows'],
    ['services/#services', 'Services'],
  ],
} as const

interface HeaderContent {
  logoUrl: string
  contact: { instagramUrl: string; linkedinUrl: string }
}

const SOCIAL_ICONS = {
  Instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1"/>',
  X: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
  LinkedIn: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  GitHub: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
} as const

function headerSocials(contact: HeaderContent['contact']) {
  const links = [
    ['Instagram', contact.instagramUrl],
    ['X', 'https://x.com/204_ai'],
    ['LinkedIn', contact.linkedinUrl],
    ['GitHub', 'https://github.com/204-ai'],
  ] as const
  const icons = links.map(([label, url]) =>
    `<a href="${escape(url)}" aria-label="204 on ${label}" title="${label}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">${SOCIAL_ICONS[label]}</svg></a>`,
  ).join('')
  return `<div class="site-nav-socials" role="group" aria-label="Social links">${icons}</div>`
}

export function siteHeader(base: string, studio: HeaderContent, path = '') {
  const socials = headerSocials(studio.contact)
  const root = path.replace(/^\//, '').split('/')[0]
  const section = root === 'sentient-studio' ? 'experiences' : root === 'technology' ? 'services' : root
  const children = Object.hasOwn(SECTION_LINKS, section) ? SECTION_LINKS[section as keyof typeof SECTION_LINKS] : undefined
  const sublinks = children?.map(([href, label]) => `<a href="${base}${href}">${escape(label)}</a>`).join('')
  const primaryLink = (link: typeof SITE_NAV[number]) =>
    `<a href="${base}${link.path}"${section === link.path.slice(0, -1) ? ' aria-current="page"' : ''}>${escape(link.label)}</a>`
  const desktopLinks = SITE_NAV.map(link => {
    const anchor = primaryLink(link)
    if (!sublinks || section !== link.path.slice(0, -1)) return anchor
    return `<div class="site-nav-section">${anchor}<div class="site-subnav" role="group" aria-label="In this section">${sublinks}</div></div>`
  }).join('')
  const mobileSubnav = sublinks ? `<nav class="site-subnav site-subnav-mobile" aria-label="In this section">${sublinks}</nav>` : ''
  return `<header class="site-header"><div class="site-header-inner"><a class="site-brand" href="${base}" aria-label="204 home"><img src="${escape(studio.logoUrl)}" width="320" height="189" alt="204 No Content"></a><nav class="site-desktop-nav" aria-label="Main">${desktopLinks}<a class="site-contact-link" href="${base}contact/">Let’s talk ↗</a>${socials}</nav><details class="site-menu"><summary>Menu</summary><nav aria-label="Main menu">${SITE_NAV.map(primaryLink).join('')}<a href="${base}contact/">Let’s talk ↗</a>${socials}</nav></details></div>${mobileSubnav}</header>`
}

interface FooterContent {
  logoUrl: string
  copy: { footer: { blurb: string } }
  rnaStudioUrl: string
  footer: { address: string; socials: { label: string; url: string }[] }
}
export function siteFooter(base: string, studio: FooterContent) {
  const links = [...SITE_NAV, { path: 'work/', label: 'All work' }].map(link => `<a href="${base}${link.path}">${escape(link.label)}</a>`).join('')
  return `<footer class="site-footer"><div class="site-footer-top"><div class="site-footer-brand"><img src="${escape(studio.logoUrl)}" width="320" height="189" alt="204 No Content" loading="lazy"><p>${escape(studio.copy.footer.blurb)}</p></div><div><h2>Explore</h2>${links}</div><div><h2>Visit</h2><a href="${escape(studio.rnaStudioUrl)}" target="_blank" rel="noreferrer">RnA Studio ↗</a><p>${escape(studio.footer.address).replaceAll('\n', '<br>')}</p><a href="${base}sentient-studio/">Explore Sentient Studio ↗</a></div><div><h2>Get in touch</h2><a href="mailto:hello@204.ai">hello@204.ai</a>${studio.footer.socials.map(link => `<a data-social="${escape(link.label.toLowerCase())}" href="${escape(link.url)}" target="_blank" rel="noreferrer">${escape(link.label)}</a>`).join('')}</div></div><div class="site-footer-bottom"><span>© 204.ai · A brand of Dao Llama Labs AG, Zug, Switzerland · ${new Date().getFullYear()}</span><span>In collaboration with RnA Studio, Lisbon</span></div></footer>`
}
