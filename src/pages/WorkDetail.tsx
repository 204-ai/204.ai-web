import { useCallback, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CaseGallery } from '../components/case/CaseGallery'
import { VideoLightbox } from '../components/case/VideoLightbox'
import { ChatCloser } from '../components/ui/ChatCloser'
import { CineCard, CineGrid } from '../components/ui/CineCard'
import { Pill } from '../components/ui/Pill'
import { Rich } from '../components/ui/Rich'
import { TitleCard } from '../components/ui/TitleCard'
import type { Work } from '../data/content'
import { v2 } from '../data/studio'
import { useAmbientVideo, usePauseWhenHidden } from '../hooks/useAmbientVideo'
import { useHead } from '../hooks/useHead'
import { trackVideoOpen } from '../lib/analytics'
import { imgDims } from '../lib/dims'
import { rendition } from '../lib/media'
import { NotFound } from './NotFound'
import styles from './WorkDetail.module.css'

const DOT = ' \u00a0·\u00a0 ' // prototype: `{year} &nbsp;·&nbsp; {kind}`

/** /work/:slug — unknown slugs fall through to redirects, then 404 (NotFound owns the head then). */
export function WorkDetail() {
  const { slug } = useParams()
  const { works } = v2()
  const i = works.findIndex((w) => w.slug === slug)
  if (i < 0) return <NotFound />
  // keyed: a new case starts with a closed lightbox and a fresh clip
  return <CasePage key={works[i].slug} work={works[i]} index={i} />
}

/** v2 case page (prototype CasePage) */
function CasePage({ work: w, index: i }: { work: Work; index: number }) {
  const { works, studio } = v2()
  useHead(`${w.title} · Work`, w.note, w.media?.still)
  const [reel, setReel] = useState<string | null>(null)
  const closeReel = useCallback(() => setReel(null), [])
  const ambient = useAmbientVideo()
  const clipRef = useRef<HTMLVideoElement>(null)
  const clip = ambient ? w.media?.video?.mp4 : undefined
  usePauseWhenHidden(clipRef, Boolean(clip))

  const still = w.media?.still
  const [yt, ...moreReels] = w.youtube ?? []
  const body = Array.isArray(w.body) ? w.body : w.body ? [w.body] : [w.note]
  const open = (id: string) => {
    setReel(id)
    trackVideoOpen(w.slug, id)
  }
  const next = [works[(i + 1) % works.length], works[(i + 2) % works.length]].filter((x) => x && x !== w)

  return (
    <div className="v2">
      <section className={styles.hero}>
        {still && (
          <img
            className={styles.bg}
            src={rendition(still, 800)}
            srcSet={`${rendition(still, 800)} 800w, ${still} 1920w`}
            sizes="100vw"
            {...imgDims(still)}
            alt=""
            fetchPriority="high"
            style={w.media?.focus ? { objectPosition: w.media.focus } : undefined}
          />
        )}
        {clip && (
          <video
            key={clip}
            ref={clipRef}
            className={styles.clip}
            src={clip}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={w.media?.focus ? { objectPosition: w.media.focus } : undefined}
          />
        )}
        <div className={styles.scrim} />
        {yt && (
          <button type="button" className={styles.play} onClick={() => open(yt)} aria-label={`Play ${w.title} with sound`}>
            <span className={styles.circ}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
        <div className={styles.metas}>
          <div className={styles.metaTl}>
            {w.year}
            {DOT}
            {w.format}
            {yt && (
              <>
                {DOT}click to play with sound
              </>
            )}
          </div>
          <div className={styles.metaTr}>{`// ${w.note}`}</div>
        </div>
        <h1 className={styles.title}>{w.title}</h1>
      </section>

      <section className={styles.meta}>
        <div className={styles.left}>
          <div className={styles.row}>
            <span className={styles.lab}>Client</span>
            <span className={styles.val}>
              {w.logo && (
                <img
                  className={styles.logo}
                  src={rendition(w.logo, 320)}
                  {...imgDims(w.logo)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              {w.client}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.lab}>Format</span>
            <span className={styles.val}>
              {w.format}
              {!w.date && ` · ${w.year}`}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.lab}>Direction</span>
            <span className={styles.val}>
              {studio.name} · {studio.suffix}
            </span>
          </div>
          {w.products && (
            <div className={styles.row}>
              <span className={styles.lab}>Products used</span>
              <span className={styles.val}>{w.products}</span>
            </div>
          )}
          {w.date && (
            <div className={styles.row}>
              <span className={styles.lab}>Date</span>
              <span className={styles.val}>{w.date}</span>
            </div>
          )}
          {w.place && (
            <div className={styles.row}>
              <span className={styles.lab}>Place</span>
              <span className={styles.val}>{w.place}</span>
            </div>
          )}
        </div>
        <div className={styles.body}>
          {body.map((p, k) => (
            <p key={k}>
              <Rich text={p} />
            </p>
          ))}
          {moreReels.length > 0 && (
            <div className={styles.reels}>
              {moreReels.map((id, k) => (
                <Pill key={id} sm onClick={() => open(id)}>
                  Play reel {String(k + 2).padStart(2, '0')}
                </Pill>
              ))}
            </div>
          )}
          {w.credits && w.credits.length > 0 && (
            <div className={styles.credits}>
              <div className={styles.creditsLab}>Artists involved</div>
              {w.credits.map((c) => (
                <div key={c.name} className={styles.crow}>
                  <span className={styles.n}>{c.name}</span>
                  <span className={styles.r}>{c.role}</span>
                  {c.handle && <span className={styles.h}>{c.handle}</span>}
                </div>
              ))}
            </div>
          )}
          {w.collab && (
            <div className={styles.collab}>
              <span className={styles.collabLab}>{w.collab.label}</span>
              <span className={styles.who}>{w.collab.name}</span>
            </div>
          )}
        </div>
      </section>

      {w.gallery && w.gallery.length > 0 && (
        <>
          <TitleCard chapter="01. // chapter" name="The frames" tail={'tight crops\nhard contrast'} />
          <CaseGallery srcs={w.gallery} />
        </>
      )}

      <TitleCard chapter="03. // chapter" name="Up next" tail={'continue the reel\nor skip back'} />
      <section className={styles.next}>
        <CineGrid>
          {next.map((n) => (
            <CineCard
              key={n.slug}
              to={`/work/${n.slug}`}
              title={n.title}
              metaTl={`${n.year} · ${n.format.toLowerCase()}`}
              metaTr={`dir. ${studio.name}`}
              sub={n.note}
              img={n.media?.still}
            />
          ))}
        </CineGrid>
        <div className={styles.back}>
          <Pill to="/work">Back to all work</Pill>
        </div>
      </section>

      <ChatCloser copy={studio.copy.closer} />

      {reel && <VideoLightbox youtubeId={reel} title={w.title} meta={`${w.year} · ${w.format}`} onClose={closeReel} />}
    </div>
  )
}
