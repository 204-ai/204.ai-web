// /work practice filter state lives in the URL (SPEC I.routes): `?p=<id>[,<id>…]` selects
// practices, `?pillar=content|interactive` is the nav dropdown preset. Unknown ids are
// dropped (taxonomy is closed, SPEC V26) and the selection keeps services.json order.

interface FilterService {
  id: string
  pillar: string
}

export function parseWorkFilter(params: URLSearchParams, services: FilterService[]): string[] {
  const p = params.get('p')
  if (p !== null) {
    const want = new Set(p.split(',').map((s) => s.trim()))
    return services.filter((s) => want.has(s.id)).map((s) => s.id)
  }
  const pillar = params.get('pillar')
  return pillar ? services.filter((s) => s.pillar === pillar).map((s) => s.id) : []
}

/** search string for a selection, commas kept literal (`?p=branded,mirror`); empty = all work */
export function workFilterSearch(sel: string[], services: FilterService[]): string {
  const ids = services.map((s) => s.id).filter((id) => sel.includes(id))
  return ids.length ? `?p=${ids.join(',')}` : ''
}

/** a work matches when it shares any selected practice; no selection = everything */
export const matchesFilter = (practices: string[], sel: string[]): boolean =>
  sel.length === 0 || practices.some((p) => sel.includes(p))
