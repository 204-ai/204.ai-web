// prototype maker.jsx icons (IcoIG / IcoIN / IcoML) plus a plain link glyph for `web`
export type Network = 'instagram' | 'linkedin' | 'email' | 'web'

export function SocialIcon({ network }: { network: Network }) {
  switch (network) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4.5 9h3v10.5h-3zM6 4a1.75 1.75 0 110 3.5A1.75 1.75 0 016 4zM10 9h2.9v1.5c.6-1 1.7-1.8 3.4-1.8 2.4 0 3.7 1.5 3.7 4.4v6.4h-3v-5.8c0-1.5-.6-2.3-1.8-2.3-1.3 0-2.2.9-2.2 2.5v5.6h-3z" />
        </svg>
      )
    case 'email':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3.5 6.5 12 13l8.5-6.5" />
        </svg>
      )
    case 'web':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
      )
  }
}
