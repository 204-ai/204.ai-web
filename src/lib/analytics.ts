// GA4 wrapper — same property as the current Webflow site (G-E2HCBBXBVP),
// so reporting stays continuous across the switch. gtag is loaded in
// index.html; everything here no-ops if it's absent (blocked, dev, etc).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export const GA_ID = 'G-E2HCBBXBVP'

function gtag(...args: unknown[]) {
  window.gtag?.(...args)
}

/* SPA page_view — fired on every route change by Layout */
export function trackPageView(path: string, title: string) {
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  })
}

/* Named interactions. Keep event/param names stable — GA4 reports key on them.
   v2 surfaces (SPEC T62):
   - select_chapter {project}      home hero dots (work title, as v1)
   - filter_work {category, selection}  /work practice pills (multi-select)
   - video_open {project, video_id}     case lightbox (work title, as v1)
   - cta_click {cta, …}            pills into /contact, the closer, the all-work band
   - social_click {network, person?}   maker links, contact rows, footer socials
   - map_load / map_click {where}  contact map (OSM on click / Google Maps links)
   - generate_lead {budget, form}  brief intake
   reel_play_toggle had its surface in the v1 hero player only. */
export function trackCta(cta: string, extra?: Record<string, string>) {
  gtag('event', 'cta_click', { cta, ...extra })
}

export function trackChapterSelect(project: string) {
  gtag('event', 'select_chapter', { project })
}

export function trackPlayToggle(state: 'play' | 'pause', project: string) {
  gtag('event', 'reel_play_toggle', { state, project })
}

export function trackVideoOpen(project: string, videoId: string) {
  gtag('event', 'video_open', { project, video_id: videoId })
}

export function trackMapLoad() {
  gtag('event', 'map_load')
}

export function trackSocialClick(network: string, person?: string) {
  gtag('event', 'social_click', { network, ...(person ? { person } : {}) })
}

/* GA4 recommended event for form submissions */
export function trackLead(budget: string) {
  gtag('event', 'generate_lead', { budget: budget || 'unspecified', form: 'brief_intake' })
}

/** `category` = the practice toggled (or 'all'); `selection` = what is selected afterwards */
export function trackWorkFilter(category: string, selection?: string[]) {
  gtag('event', 'filter_work', { category, ...(selection ? { selection: selection.join(',') || 'all' } : {}) })
}

export function trackMapClick(where: string) {
  gtag('event', 'map_click', { where })
}
