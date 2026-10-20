import { describe as suite, expect, it } from 'vitest'
import { describe, excerpt, plainText } from './content'
import { CONTENT } from './studio'

suite('share text helpers (SPEC V10, I.seo)', () => {
  it('plainText drops **bold** markers and folds line breaks', () => {
    expect(plainText('We read **everything**\nand  reply')).toBe('We read everything and reply')
  })
  it('excerpt keeps short text and cuts long text at a word boundary', () => {
    expect(excerpt('Short line.')).toBe('Short line.')
    const long = 'word '.repeat(60)
    const cut = excerpt(long, 40)
    expect(cut.length).toBeLessThanOrEqual(40)
    expect(cut.endsWith('word…')).toBe(true)
    expect(excerpt('alpha beta, gamma delta epsilon', 18)).toBe('alpha beta…')
    // one unbroken token longer than the limit is cut hard, never to an empty or longer string
    const token = 'x'.repeat(200)
    expect(excerpt(token, 40)).toBe(`${'x'.repeat(39)}…`)
  })
  it('every route type yields a non-empty description from content', () => {
    const c = CONTENT
    for (const d of [describe.home(c), describe.work(c), describe.services(c), describe.about(c), describe.contact(c)]) expect(d.length).toBeGreaterThan(40)
    for (const w of c.works) expect(describe.case(w).length).toBeGreaterThan(0)
    for (const s of c.services) expect(describe.service(s)).toBe(excerpt(s.lead))
    for (const p of c.people) expect(describe.maker(p)).toContain(p.role)
    expect(describe.about(c)).toContain('six makers')
  })
  it('case text prefers the first body paragraph over the one-line note', () => {
    const w = { ...CONTENT.works[0], body: ['First paragraph here.', 'Second.'], note: 'Note' }
    expect(describe.case(w)).toBe('First paragraph here.')
    expect(describe.case({ ...w, body: undefined })).toBe('Note')
  })
})
