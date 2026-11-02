/* ============================================================
   SERVICE DETAIL — one template, per-service copy
   (placeholder copy — swap per service when the real text lands)
   ============================================================ */
const SERVICE_DETAIL = {
  branded: {
    idx:'01', pillar:'.content', title:'Branded work &\ncampaigns',
    lead:'Visual assets and narratives that express brand identity with clarity and impact — from single spots to sustained campaigns, produced with human direction, AI speed.',
    modes:[
      { n:'01', t:'Ad spots', d:'Short-form brand films built for a single moment or launch' },
      { n:'02', t:'Campaign systems', d:'A visual language extended across multiple cuts, cities, or platforms' },
      { n:'03', t:'Product & fashion imagery', d:'Styled and directed by our team' },
    ],
    included:'Concept & creative direction · scriptwriting & storyboarding · AI-assisted production · full brand asset delivery',
    works:[['NC·010','rubr'],['NC·009','venom'],['NC·006','thorneshade'],['NC·002','breastcancer']],
    cta:'Bring this to your brand',
  },
  fashion: {
    idx:'02', pillar:'.content', title:'Virtual\noutfitting',
    lead:"Fashion and product photography, styled and directed by our team — your brand's own studio, without the studio.",
    modes:[
      { n:'01', t:'Lookbooks & campaigns', d:'Full seasonal sets shot virtually from garment references' },
      { n:'02', t:'Product-only catalogue shoots', d:'Consistent angles and lighting across a full catalogue' },
      { n:'03', t:'Virtual try-on styling', d:'Garments styled and fitted on model or customer' },
    ],
    included:'Art direction & styling · model/character consistency across shoots · monthly or seasonal delivery · full usage rights',
    works:[['NC·0XX','zeb']],
    cta:'Style your next drop',
  },
  archival: {
    idx:'03', pillar:'.content', title:'Archival\npreservation',
    lead:'Restoration and enhancement of archival photos or footage through advanced AI methods — handled with the same care as the original.',
    modes:[
      { n:'01', t:'Photo restoration', d:'Damage, fading and loss recovered without inventing history' },
      { n:'02', t:'Footage restoration & upscaling', d:'Resolution, frame rate and stability rebuilt for modern screens' },
      { n:'03', t:'Colourisation', d:'Period-accurate colour brought to black-and-white material' },
    ],
    included:'Damage & quality assessment · frame-by-frame restoration · format delivery for print or screen · archival-safe handling',
    works:[['NC·0XX','alanwatts']],
    cta:'Restore your archive',
  },
  immersive: {
    idx:'04', pillar:'.content', title:'VFX &\nmapping',
    lead:'High-end visuals and mapping for any environment, theme, or surface — built to scale with the space, not just fill it.',
    modes:[
      { n:'01', t:'Building & facade mapping', d:'Content built to the geometry of the surface it lands on' },
      { n:'02', t:'Stage & set VFX', d:'Live and in-camera visuals for stages and sets' },
      { n:'03', t:'Environmental theming', d:'A single visual world extended across a whole venue' },
    ],
    included:'On-site technical scouting · custom visual content · projection/mapping hardware coordination · show programming',
    works:[['NC·0XX','eclipse'],['NC·0XX','yardep'],['NC·0XX','yard']],
    cta:'Map your space',
  },
  artistic: {
    idx:'05', pillar:'.content', title:'Animation\n& film',
    lead:'Character, motion, or abstract animation built to convey story, emotion, or concept — from a single scene to a full narrative.',
    modes:[
      { n:'01', t:'Character animation', d:'Consistent characters carried across scenes' },
      { n:'02', t:'Music videos', d:'Performance and narrative cuts built around the track' },
      { n:'03', t:'Narrative short films', d:'Original stories, written and boarded before a frame exists' },
    ],
    included:'Concept & storyboarding · style development · full animation production · sound design coordination',
    works:[['NC·0XX','popularfaces'],['NC·0XX','ciurlionis'],['NC·0XX','clarissa']],
    cta:'Animate your story',
  },
  mirror: {
    idx:'01', pillar:'.interactive', title:'Magic\nmirror',
    lead:'A real-time interactive system that transforms and places your audience at the center of the experience. Touch prompting, custom-trained styles, custom frames — controlled from the Mirror app.',
    modes:[
      { n:'01', t:'Identity transformation', d:'Guests become alternate versions of themselves in real time' },
      { n:'02', t:'Living art', d:'Participants step inside and animate iconic or branded artworks' },
      { n:'03', t:'Environment control', d:'Movement influences the surrounding visual environment' },
      { n:'04', t:'Game mode', d:'Interactive challenges layered into immersive worlds' },
      { n:'05', t:'Neurofeedback', d:'Brain activity drives responsive live visuals' },
    ],
    included:'Touch prompting · custom-trained styles (LoRA) · custom frames · Mirror app control',
    works:[['NC·0XX','hulaween'],['NC·0XX','sensoria'],['NC·0XX','tkeshii'],['NC·0XX','kbc'],['NC·0XX','synesthesia'],['NC·0XX','vibra']],
    cta:'Bring this to your event',
  },
  booth: {
    idx:'02', pillar:'.interactive', title:'Magic photo\nbooth',
    lead:'Instant branded portraits, directed by our visual system — print or digital, no app needed.',
    modes:[
      { n:'01', t:'Custom visual worlds & characters', d:'A look built for the campaign, not a filter pack' },
      { n:'02', t:'Branded booth & interface design', d:'The physical booth and its screen carry your identity' },
      { n:'03', t:'Print & digital formats', d:'Take-home prints alongside social-ready exports' },
    ],
    included:'Campaign-aligned prompts · take-home branded souvenir · on-site operator · no app required for guests',
    works:[['NC·0XX','delulu'],['NC·0XX','standv'],['NC·0XX','motelx']],
    cta:'Bring this to your event',
  },
  augart: {
    idx:'03', pillar:'.interactive', title:'Augmented\nart',
    lead:'Living paintings and augmented artworks for museums, galleries and artist collaborations.',
    modes:[
      { n:'01', t:'Paintings', d:'Existing works animated in register with the canvas' },
      { n:'02', t:'Large-scale murals', d:'Whole walls brought into motion' },
      { n:'03', t:'Natural landscapes', d:'Projected environments across natural surfaces' },
      { n:'04', t:'Sculptural forms', d:'Objects and sculpture mapped in place' },
    ],
    included:'Projection mapping · custom animation per artwork · site/artwork survey · gallery-safe installation',
    works:[['NC·0XX','mazarine'],['NC·0XX','wines'],['NC·0XX','vibra']],
    cta:'Bring your artwork to life',
  },
  visuals: {
    idx:'04', pillar:'.interactive', title:'Live\nvisuals',
    lead:'VJing and live visuals for stages, performances, and immersive spaces — built and operated by our team.',
    modes:[
      { n:'01', t:'Stage visuals', d:'Sets performed live alongside the act' },
      { n:'02', t:'Architectural mapping', d:'Content built to the geometry of the building' },
      { n:'03', t:'Landscape projections', d:'Large-scale outdoor and natural-surface work' },
      { n:'04', t:'Dome environments', d:'Full-surround content for domes and planetariums' },
      { n:'05', t:'Interactive systems', d:'Visuals that react to bodies, gestures and sound' },
    ],
    included:'Live operation (VJ) · audio/motion-reactive systems · custom visual content · on-site technical setup',
    works:[['NC·0XX','yardep'],['NC·0XX','sensoria']],
    cta:'Bring this to your stage',
  },
  custom: {
    idx:'05', pillar:'.interactive', title:'Custom\ncontent',
    lead:'Bespoke builds shaped around your room and brief — when the idea does not fit any of the boxes above, we build the box.',
    modes:[
      { n:'01', t:'Prototypes', d:'Fast, real builds to test an idea in the room' },
      { n:'02', t:'One-off installs', d:'Single-venue pieces designed end to end' },
      { n:'03', t:'Tours & rollouts', d:'One concept, packaged to travel' },
    ],
    included:'Discovery & feasibility · concept design · build & testing · install, training and support',
    works:[['NC·021','oddsgate'],['NC·019','standv']],
    cta:'Tell us what you need',
  },
};
window.SERVICE_DETAIL = SERVICE_DETAIL;

const SD_REELS = {
  immersive: ['assets/sd-vfx-1.mp4','assets/sd-vfx-2.mp4'],
  mirror: ['assets/sd-mirror-1.mp4','assets/sd-mirror-2.mp4','assets/sd-mirror-3.mp4','assets/sd-mirror-4.mp4','assets/sd-mirror-5.mp4'],
  booth: ['assets/sd-booth-1.mp4'],
  augart: ['assets/sd-augart-1.mp4'],
  custom: ['assets/sd-custom-1.mp4'],
  fashion: ['assets/sd-fashion-1.mp4'],
};

function SdHeroReel({ srcs, poster }) {
  const [i, setI] = React.useState(0);
  const [pct, setPct] = React.useState(0);
  const ref = React.useRef(null);
  const offline = !!window.__OFFLINE_BUILD;
  const next = () => setI(n => (n + 1) % srcs.length);
  React.useEffect(() => {
    if (offline) return;
    setPct(0);
    const v = ref.current;
    if (!v) return;
    v.src = srcs[i];
    v.load();
    const play = v.play();
    if (play && play.catch) play.catch(() => {});
  }, [i, offline]);
  if (offline) return <div className="sd-hero" style={poster ? { backgroundImage:`url(${poster})` } : {}}></div>;
  return (
    <div className="sd-hero sd-hero-reel">
      <video
        ref={ref}
        autoPlay muted loop={false} playsInline preload="auto"
        onTimeUpdate={e => { const v = e.currentTarget; if (v.duration) setPct((v.currentTime / v.duration) * 100); }}
        onEnded={next}
        onError={next}
      ></video>
      <div className="sd-bars">
        {srcs.map((_, k) => (
          <button key={k} type="button" className={"b" + (k === i ? ' on' : '')} onClick={() => setI(k)}>
            <span style={{ width: k === i ? pct + '%' : (k < i ? '100%' : '0%') }}></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ServiceDetail({ onNav, serviceId }) {
  const d = SERVICE_DETAIL[serviceId] || SERVICE_DETAIL.branded;
  const svc = (window.SERVICES || []).find(s => s.id === serviceId) || {};
  const works = window.WORKS || [];
  const order = (window.SERVICES || []).map(s => s.id);
  const nextId = order.length ? order[(Math.max(0, order.indexOf(serviceId)) + 1) % order.length] : 'fashion';
  const nextTitle = ((SERVICE_DETAIL[nextId] || {}).title || nextId).replace('\n', ' ');

  return (
    <div className="page-fade">
      <section className="svc-detail">
        <div className="sd-left">
          <a className="sd-back" onClick={() => onNav('services')}>← services</a>
          <div className="sec-lab">/ {d.pillar} — {d.idx}</div>
          <h1 className="sd-title">
            {d.title.split('\n').map((l,j,a)=><React.Fragment key={j}>{l}{j<a.length-1&&<br/>}</React.Fragment>)}
          </h1>
          {SD_REELS[serviceId]
            ? <SdHeroReel srcs={SD_REELS[serviceId]} poster={svc.img} />
            : <div className="sd-hero" style={svc.img ? {backgroundImage:`url(${svc.img})`} : {}}></div>}
          <p className="sd-lead">{d.lead}</p>
          <Pill onClick={() => onNav('contact')}>→ {d.cta}</Pill>
        </div>

        <div className="sd-right">
          <div className="sec-lab">/ modes in this practice</div>
          <div className="sd-modes">
            {d.modes.map(m => (
              <div key={m.n} className="mrow">
                <div className="n">{m.n}</div>
                <div className="txt"><div className="t">{m.t}</div><div className="d">{m.d}</div></div>
              </div>
            ))}
          </div>

          <div className="sec-lab">/ what's included</div>
          <p className="sd-incl">{d.included}</p>

          <div className="sec-lab">/ selected work in this practice</div>
          <div className="sd-works">
            {d.works.map(([code, id]) => {
              const w = works.find(x => x.id === id);
              return (
                <div key={code + id} className="wrow" onClick={() => onNav('case', { work: id })}>
                  <span className="code">{code}</span>
                  <span className="ttl">{w ? w.title : id}</span>
                  <span className="ar">→</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sd-next">
        <div className="lab">/ next service</div>
        <div className="row" onClick={() => onNav('service', { service: nextId })}>
          <h2>{nextTitle}</h2>
          <div className="go"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
        </div>
        <Pill onClick={() => onNav('service', { service: nextId })}>Next — {nextTitle.replace(/\n/g,' ')} →</Pill>
      </section>

      <Footer onNav={onNav} />
    </div>
  );
}

window.ServiceDetail = ServiceDetail;
