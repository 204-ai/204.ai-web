// CinematicStill — a single SVG "film still" evoking a scene via geometry
// and a graded color palette, not photography (ported from design/direction-a.jsx).
// `mini` tightens noise + skips the slow drift animation. `playing` adds a
// Ken-Burns drift on the silhouette and animates the grain so the still reads
// as a frame from a moving clip. Placeholder until real footage exists.
// Scene gradients/fills are intentional art values, not UI tokens (SPEC V2 exception).

import { useEffect, useState, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import type { Scene } from '../data/studio'

interface CinematicStillProps {
  scene: Scene
  mini?: boolean
  playing?: boolean
}

const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.85'/%3E%3C/svg%3E\")"

export function CinematicStill({ scene, mini = false, playing = false }: CinematicStillProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [t, setT] = useState(0)
  const animated = (!mini || playing) && !reducedMotion

  useEffect(() => {
    if (!animated) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      setT((now - start) / 1000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [animated])

  const drift = Math.sin(t * 0.3) * 8
  // Ken-Burns: slow zoom + parallax pan for hover-playing stills
  const playingLive = playing && !reducedMotion
  const kbScale = playingLive ? 1 + (Math.sin(t * 0.18) + 1) * 0.04 : 1 // 1.00 → 1.08
  const kbX = playingLive ? Math.sin(t * 0.13) * 14 : 0
  const kbY = playingLive ? Math.cos(t * 0.11) * 8 : 0
  // Grain jitter — re-position the bg every frame so it reads as live noise
  const grainX = playingLive ? (t * 30) % 140 : 0
  const grainY = playingLive ? (t * 23) % 140 : 0

  const scenes: Record<Scene, { bg: string; silhouette: ReactNode }> = {
    cathedral: {
      // warm amber backlight + tall silhouettes (columns / archways)
      bg: 'linear-gradient(180deg, #1a0f08 0%, #3d1f0a 30%, #8a4a1a 65%, #c97a2a 88%, #e8a555 100%)',
      silhouette: (
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* arches */}
          <g fill="#08050a" opacity="0.92">
            <path d="M0,600 L0,340 Q80,180 160,340 L160,600 Z" />
            <path d="M200,600 L200,380 Q260,240 320,380 L320,600 Z" />
            <path d="M360,600 L360,300 Q440,120 520,300 L520,600 Z" />
            <path d="M560,600 L560,360 Q620,220 680,360 L680,600 Z" />
            <path d="M720,600 L720,340 Q800,190 880,340 L880,600 Z" />
            <path d="M920,600 L920,400 Q970,300 1020,400 L1020,600 Z" />
          </g>
          {/* distant figure */}
          <g fill="#08050a" opacity="0.95">
            <ellipse cx="500" cy="530" rx="18" ry="8" />
            <path d="M486,530 L486,480 Q500,465 514,480 L514,530 Z" />
          </g>
          {/* floor line */}
          <line x1="0" y1="555" x2="1000" y2="555" stroke="#08050a" strokeWidth="2" opacity="0.7" />
          {/* light shafts */}
          <g opacity="0.18">
            <path d="M440,80 L380,600 L420,600 L480,80 Z" fill="#fff" />
            <path d="M560,80 L620,600 L580,600 L520,80 Z" fill="#fff" />
          </g>
        </svg>
      ),
    },
    desert: {
      // late afternoon, horizon, lone form
      bg: 'linear-gradient(180deg, #2b1a3a 0%, #6e3a4a 28%, #c9644a 55%, #e59870 75%, #f5b98a 92%, #d9966a 100%)',
      silhouette: (
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* distant dunes */}
          <path d="M0,420 Q250,380 500,410 T1000,400 L1000,600 L0,600 Z" fill="#4a2840" opacity="0.85" />
          <path d="M0,470 Q200,440 420,470 T800,465 T1000,475 L1000,600 L0,600 Z" fill="#2a1828" opacity="0.9" />
          <path d="M0,530 Q300,505 600,525 T1000,520 L1000,600 L0,600 Z" fill="#120b14" />
          {/* sun disc */}
          <circle cx="640" cy="360" r="46" fill="#ffe0b8" opacity="0.85" />
          <circle cx="640" cy="360" r="70" fill="#ffe0b8" opacity="0.15" />
          {/* lone standing figure */}
          <g fill="#080408">
            <circle cx="320" cy="488" r="6" />
            <path d="M314,494 L314,530 L326,530 L326,494 Z" />
          </g>
        </svg>
      ),
    },
    interior: {
      // warm lamplit room, window light, wainscoting
      bg: 'linear-gradient(135deg, #0f0a06 0%, #1f150a 40%, #4a2e12 75%, #7a4a1a 100%)',
      silhouette: (
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* window cast light */}
          <path d="M420,120 L580,120 L640,600 L360,600 Z" fill="#f5c878" opacity="0.18" />
          <rect x="420" y="120" width="160" height="220" fill="#f5c878" opacity="0.25" />
          <line x1="500" y1="120" x2="500" y2="340" stroke="#0a0706" strokeWidth="4" />
          <line x1="420" y1="230" x2="580" y2="230" stroke="#0a0706" strokeWidth="4" />
          {/* table silhouette */}
          <rect x="100" y="440" width="360" height="10" fill="#0a0706" />
          <rect x="120" y="450" width="8" height="150" fill="#0a0706" />
          <rect x="432" y="450" width="8" height="150" fill="#0a0706" />
          {/* lamp */}
          <circle cx="280" cy="400" r="22" fill="#f5c878" opacity="0.9" />
          <circle cx="280" cy="400" r="50" fill="#f5c878" opacity="0.18" />
          <rect x="276" y="420" width="8" height="20" fill="#0a0706" />
          {/* wainscoting */}
          <line x1="0" y1="520" x2="1000" y2="520" stroke="#0a0706" strokeWidth="1" opacity="0.6" />
        </svg>
      ),
    },
    water: {
      // blue-green underwater, light caustics
      bg: 'linear-gradient(180deg, #04141a 0%, #0a2a3a 35%, #124a5a 65%, #2a7a8a 100%)',
      silhouette: (
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* caustic light streaks */}
          <g opacity="0.28" style={{ transform: `translateX(${drift}px)` }}>
            <path d="M100,0 L80,200 L140,200 L160,0 Z" fill="#9fe5ef" />
            <path d="M340,0 L310,250 L370,250 L400,0 Z" fill="#9fe5ef" />
            <path d="M600,0 L580,220 L640,220 L660,0 Z" fill="#9fe5ef" />
            <path d="M820,0 L790,260 L860,260 L890,0 Z" fill="#9fe5ef" />
          </g>
          {/* surface ripple */}
          <path d="M0,80 Q250,60 500,80 T1000,80" stroke="#9fe5ef" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M0,110 Q250,90 500,110 T1000,110" stroke="#9fe5ef" strokeWidth="1" fill="none" opacity="0.25" />
          {/* seabed */}
          <path d="M0,510 Q250,490 500,505 T1000,500 L1000,600 L0,600 Z" fill="#041018" opacity="0.95" />
          {/* diving figure silhouette */}
          <g fill="#041018" opacity="0.9">
            <ellipse cx="560" cy="340" rx="10" ry="6" />
            <path d="M554,346 Q556,390 540,420 Q552,424 562,418 Q570,390 566,346 Z" />
            <path d="M550,350 L510,365 L514,372 L552,358 Z" />
          </g>
        </svg>
      ),
    },
  }

  const s = scenes[scene]
  return (
    <div style={{ position: 'absolute', inset: 0, background: s.bg, overflow: 'hidden' }} aria-hidden="true">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${kbScale}) translate(${kbX}px, ${kbY}px)`,
          transformOrigin: 'center',
          willChange: playingLive ? 'transform' : undefined,
        }}
      >
        {s.silhouette}
      </div>
      {/* letterbox bars for cinematic feel */}
      {!mini && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 28, background: '#000' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 28, background: '#000' }} />
        </>
      )}
      {/* grain — offset shifts every frame when playing for live noise */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          mixBlendMode: 'overlay',
          opacity: mini ? 0.15 : 0.22,
          backgroundPosition: `${grainX}px ${grainY}px`,
          backgroundImage: GRAIN_URL,
        }}
      />
      {/* subtle vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }} />
    </div>
  )
}
