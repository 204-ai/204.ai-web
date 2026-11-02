import { beforeEach, describe, expect, it, vi } from 'vitest'

// analytics.ts calls window.gtag at call time; a stub window is enough (node environment)
const gtag = vi.fn()
;(globalThis as unknown as { window: { gtag: typeof gtag } }).window = { gtag }
const ga = await import('./analytics')

describe('GA4 events keep their names and params (SPEC T62)', () => {
  beforeEach(() => gtag.mockClear())
  it('maps each helper to its event', () => {
    ga.trackCta('closer', { page: '/work' })
    ga.trackChapterSelect('Motel X')
    ga.trackVideoOpen('Motel X', 'abc')
    ga.trackSocialClick('instagram', 'Ada')
    ga.trackSocialClick('linkedin')
    ga.trackMapLoad()
    ga.trackMapClick('map_label')
    ga.trackLead('')
    ga.trackWorkFilter('mirror', ['branded', 'mirror'])
    ga.trackWorkFilter('all', [])
    ga.trackWorkFilter('legacy')
    expect(gtag.mock.calls).toEqual([
      ['event', 'cta_click', { cta: 'closer', page: '/work' }],
      ['event', 'select_chapter', { project: 'Motel X' }],
      ['event', 'video_open', { project: 'Motel X', video_id: 'abc' }],
      ['event', 'social_click', { network: 'instagram', person: 'Ada' }],
      ['event', 'social_click', { network: 'linkedin' }],
      ['event', 'map_load'],
      ['event', 'map_click', { where: 'map_label' }],
      ['event', 'generate_lead', { budget: 'unspecified', form: 'brief_intake' }],
      ['event', 'filter_work', { category: 'mirror', selection: 'branded,mirror' }],
      ['event', 'filter_work', { category: 'all', selection: 'all' }],
      ['event', 'filter_work', { category: 'legacy' }],
    ])
  })
})
