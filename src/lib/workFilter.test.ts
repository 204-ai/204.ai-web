import { describe, expect, it } from 'vitest'
import { v2 } from '../data/studio'
import { matchesFilter, parseWorkFilter, workFilterSearch } from './workFilter'

const CONTENT = v2()
const services = CONTENT.services
const q = (s: string) => new URLSearchParams(s)

describe('work filter URL state (SPEC I.routes, V26)', () => {
  it('reads ?p= as a multi-select in services.json order', () => {
    expect(parseWorkFilter(q('p=mirror,branded'), services)).toEqual(['branded', 'mirror'])
  })
  it('drops unknown practice ids (closed taxonomy)', () => {
    expect(parseWorkFilter(q('p=mirror,nope,,branded-work-campaigns'), services)).toEqual(['mirror'])
  })
  it('expands ?pillar= presets to the pillar services', () => {
    expect(parseWorkFilter(q('pillar=interactive'), services)).toEqual(CONTENT.pillars.interactive.map((s) => s.id))
    expect(parseWorkFilter(q('pillar=content'), services)).toEqual(CONTENT.pillars.content.map((s) => s.id))
  })
  it('lets ?p= win over ?pillar= and treats an unknown pillar as all work', () => {
    expect(parseWorkFilter(q('pillar=content&p=booth'), services)).toEqual(['booth'])
    expect(parseWorkFilter(q('pillar=nope'), services)).toEqual([])
    expect(parseWorkFilter(q(''), services)).toEqual([])
  })
  it('writes a canonical ?p= and clears it for all work', () => {
    expect(workFilterSearch(['mirror', 'branded'], services)).toBe('?p=branded,mirror')
    expect(workFilterSearch([], services)).toBe('')
  })
  it('matches any shared practice; every practice has work to show', () => {
    expect(matchesFilter(['booth', 'mirror'], ['mirror'])).toBe(true)
    expect(matchesFilter(['booth'], ['mirror'])).toBe(false)
    expect(matchesFilter(['booth'], [])).toBe(true)
    for (const s of services) expect(CONTENT.works.some((w) => matchesFilter(w.practices, [s.id])), s.id).toBe(true)
  })
})
