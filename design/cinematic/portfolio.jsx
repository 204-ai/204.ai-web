/* ============================================================
   PORTFOLIO GRID — content side
   ============================================================ */
const { useState: useStateP } = React;

const FILTERS = [
  { id:'branded',   label:'Branded Campaigns' },
  { id:'fashion',   label:'Virtual Outfitting' },
  { id:'archival',  label:'Archival Preservation' },
  { id:'immersive', label:'VFX & Mapping' },
  { id:'artistic',  label:'Animation & Film' },
  { id:'mirror',    label:'Magic Mirror' },
  { id:'booth',     label:'Magic Photo Booth' },
  { id:'augart',    label:'Augmented Art' },
  { id:'visuals',   label:'Live Visuals' },
  { id:'custom',    label:'Custom Content' },
];
// nav dropdown values → sets of service ids
const CONTENT_IDS = ['branded','fashion','archival','immersive','artistic'];
const INTERACTIVE_IDS = ['mirror','booth','augart','visuals','custom'];
const LEGACY = { Branded:'branded', Fashion:'fashion', Archival:'archival', Immersive:'immersive', Artistic:'artistic' };
const resolveFilter = (f) =>
  f === '.content' ? CONTENT_IDS :
  f === '.interactive' ? INTERACTIVE_IDS :
  LEGACY[f] ? [LEGACY[f]] : [];

const WORKS = [
  { id:'ciurlionis', svcs:["artistic"], svc:'artistic', kind:'Artistic', img:'assets/w-ciurlionis.png', title:"M. K. Čiurlionis — Trail of Angels", year:'2026', desc:"Dream Worlds — animation", size:'wide', yt:'oy18Wv0HLQI', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'motelx', svcs:["booth"], svc:'booth', kind:'Immersive', img:'assets/w-motelx.jpg', clip:'assets/feat-motelx.mp4', yt:'ft8MAHOdR2U', title:"Motel X", year:'2026', desc:"Magic Photo Booth", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'standv', svcs:["booth","branded"], svc:'booth', kind:'Immersive', img:'assets/w-standv.png', clip:'assets/hero-standv.mp4', title:"Stand Virtual", year:'2026', desc:"Magic Photo Booth & branded campaign", yt:'S-ZSEsWukmU', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'alanwatts', svcs:["archival"], svc:'archival', kind:'Archival', img:'assets/feat-alanwatts.png', pos:'50% 30%', clip:'assets/feat-alanwatts.mp4', yt:'M585jPAbVKw', title:"Alan Watts", year:'2025 – ongoing', desc:"Archival restoration", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'delulu', pos:'center 22%', svcs:["booth","visuals","augart","mirror"], svc:'booth', kind:'Immersive', img:'assets/w-delulu.jpg', title:"Delulu", year:'2026', desc:"Sofie Heyman — photobooth, mirror & augmented art", size:'wide', yt:'afgaSuKahdQ', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'tkeshii', svcs:["mirror","visuals"], svc:'mirror', kind:'Immersive', img:'assets/w-tkeshii.png', title:"Tkeshii", year:'2025', desc:"Liminal Lens \u2014 live band visuals", yt:'GUBqvaLPYC8', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'techweek', svcs:["mirror","augart","custom"], svc:'mirror', kind:'Immersive', img:'assets/w-techweek.png', title:"Portugal Tech Week", year:'2023', desc:"Content, magic mirror & augmented art", yt:'g4ajBUJtYRg', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'surrender', svcs:["mirror","branded"], svc:'mirror', kind:'Immersive', img:'assets/stn-thumb.png', title:"Surrender to Nature", year:'2025', desc:"Magic mirror & content", yt:'bLpDzI_2-_E', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'rareeffect', svcs:["augart","mirror"], svc:'augart', kind:'Artistic', img:'assets/w-rareeffect.jpg', title:"Rare Effect", year:'2023', desc:"Augmented art & magic mirror", yt:'sDOwyfIroWQ', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'vagabond', svcs:["mirror"], svc:'mirror', kind:'Immersive', img:'assets/w-vagabond.png', title:"Vagabond", year:'2024', desc:"Magic touch \u2014 plant installation", yt:'VVwLu2xbatY', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'mazarine', svcs:["augart"], svc:'augart', kind:'Artistic', img:'assets/w-mazarine.png', title:"Mazarine", year:'2023', desc:"Augmented art — Aurèce Vettier", yt:'IplS0KR4ERs', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'oddsgate', svcs:["custom"], svc:'custom', kind:'Immersive', img:'assets/w-oddsgate.png', title:"Oddsgate", year:'2024', desc:"Custom content installation", yt:'6fQRxHev1CA', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'yardep', svcs:["immersive","visuals"], svc:'immersive', kind:'Immersive', img:'assets/yrd-thumb.jpg', title:"Yard Episode", year:'2024', desc:"Mapping & live visuals", yt:'047k81V54mo', size:'wide', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'yard', svcs:["immersive","visuals"], svc:'immersive', kind:'Immersive', img:'assets/yxs-02.jpg', title:"Yard × Scenarios", year:'2024', desc:"Mapping & live visuals", yt:'2XyokYLtg58', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'wines', svcs:["augart"], svc:'augart', kind:'Artistic', img:'assets/win-01.jpg', title:"Wines From Another World", year:'2023', desc:"Augmented art", yt:'QO9h-y_I2PY', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'burst', svcs:["mirror","augart"], svc:'mirror', kind:'Immersive', img:'assets/w-burst.png', title:"Burst_", year:'2025', desc:"The Burst_ Book — Linz Museum", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'kbc', svcs:["mirror","booth"], svc:'mirror', kind:'Immersive', img:'assets/kbc-thumb.png', title:"KBC", year:'2025', desc:"Magic mirror & Magic Photo Booth", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'nfc', svcs:["mirror","custom"], svc:'mirror', kind:'Immersive', img:'assets/nfc-thumb.jpg', title:"NFC", year:'2026', desc:"MOODSCAPE — immersive environment", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'zeb', svcs:["fashion"], svc:'fashion', kind:'Fashion', img:'assets/zeb-thumb2.jpg', pos:'50% 30%', clip:'assets/sd-fashion-1.mp4', title:"Zeb", year:'2026', desc:"Virtual outfitting — ongoing", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'studio54b', svcs:["mirror"], svc:'mirror', kind:'Immersive', img:'assets/s54-02.jpg', yt:'ogMaeCnbhFw', title:"Studio 54B", year:'2024', desc:"Magic mirror", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'vibra', svcs:["mirror","augart"], svc:'mirror', kind:'Immersive', img:'assets/vib-thumb.jpg', title:"Vibra", year:'2024', desc:"Magic mirror & augmented art", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'lisboninsiders', svcs:["visuals","augart"], svc:'visuals', kind:'Immersive', img:'assets/li-thumb.png', yt:'dM1ZIEyZqSo', title:"Lisbon Insiders", year:'2023', desc:"Visuals, mapping & augmented art", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'synesthesia', svcs:["mirror","visuals","augart"], svc:'mirror', kind:'Immersive', img:'assets/w-synesthesia.png', yt:'E6_eQs-4GYQ', title:"Synesthesia", year:'2024', desc:"Magic mirror, visuals & installations", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'sensoria', svcs:["mirror","visuals"], svc:'mirror', kind:'Immersive', img:'assets/w-sensoria.png', yt:'rBPc1U5YHnM', title:"Sensoria", year:'2025', desc:"Magic mirror, live visuals & mapping", size:'wide', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'hulaween', svcs:["mirror"], svc:'mirror', kind:'Immersive', img:'assets/hul-01.jpg', title:"Hulaween", year:'2024', desc:"Spirit Mirror", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'eclipse', svcs:["visuals"], svc:'visuals', kind:'Immersive', img:'assets/tx-02.jpg', title:"Texas Eclipse", year:'2023', desc:"Dome visuals — Android Jones", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'breastcancer', svcs:["artistic"], svc:'artistic', kind:'Artistic', img:'assets/w-breastcancer.png', title:"Breast Cancer Awareness", year:'2024', desc:"Awareness animation", yt:'w0aIaXheewk', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'talentinlimbo', svcs:["artistic"], svc:'artistic', kind:'Artistic', img:'assets/w-talentinlimbo.png', title:"Talent in Limbo", year:'2025', desc:"Animation", yt:'oMizuOOh-RY', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'popularfaces', svcs:["artistic"], svc:'artistic', kind:'Artistic', img:'assets/w-popularfaces.png', title:"Popular Faces", year:'2024', desc:"Animation", yt:'LTEb1dN-Gjc', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'showerthoughts', svcs:["artistic"], svc:'artistic', kind:'Artistic', img:'assets/w-showerthoughts.png', title:"Shower Thoughts", year:'2024', desc:"Animation", yt:'A-6-wMJMJgQ', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'remember', svcs:["artistic"], svc:'artistic', kind:'Artistic', img:'assets/w-remember.png', title:"Remember", year:'2024', desc:"Animation", yt:'4v44mdTBREE', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'clarissa', svcs:["artistic"], svc:'artistic', kind:'Artistic', img:'assets/cla-thumb.png', pos:'50% 32%', title:"Clarissa", year:'2026', desc:"Animation", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'eegmirror', svcs:["mirror"], svc:'mirror', kind:'Immersive', img:'assets/eeg-01.jpg', title:"1N — EEG Mirror", year:'2026', desc:"Neurofeedback mirror", bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'thorneshade', svcs:["artistic"], svc:'artistic', kind:'Artistic', img:'assets/w-thorneshade.png', title:"Thorneshade", year:'2025', desc:"Character short film", yt:'7hSz2VXEsic', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'venom', svcs:["branded"], svc:'branded', kind:'Branded', img:'assets/w-venom.png', title:"Venom", year:'2024', desc:"Branded — perfume spot", yt:'l8mZr3Th5dI', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'rubr', svcs:["branded"], svc:'branded', kind:'Branded', img:'assets/rub-04.png', title:"Rubr", year:'2025', desc:"Branded campaign", yt:'kLC9BqOVwOU', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
  { id:'bioxyz', svcs:["branded"], svc:'branded', kind:'Branded', img:'assets/w-bioxyz.png', title:"BioXYZ", year:'2024', desc:"Branded campaign", yt:'yRWp7PHtjIo', bg:'linear-gradient(135deg,#1e1e1e,#070707)' },
];

window.WORKS = WORKS;

function Portfolio({ onNav, initialFilter = 'All' }) {
  const [sel, setSel] = useStateP(() => resolveFilter(initialFilter));
  React.useEffect(() => { setSel(resolveFilter(initialFilter)); }, [initialFilter]);

  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const base = sel.length === 0 ? WORKS : WORKS.filter(w => (w.svcs || [w.svc]).some(s => sel.includes(s)));
  const yr = (w) => /ongoing/i.test(w.year) ? 2026 : (parseInt(w.year) || 0);
  const list = base.map((w, k) => [w, k]).sort((a, b) => yr(b[0]) - yr(a[0]) || a[1] - b[1]).map(x => x[0]);
  const labelOf = (id) => (FILTERS.find(f => f.id === id) || {}).label || id;

  return (
    <div className="page-fade">
      <section className="portfolio-head">
        <h1 className="r-up">Our<br/>portfolio.</h1>
        <div className="meta r-up d-1">
          <div className="filter-hint">// filter by practice — tap one or more below</div>
          <div style={{marginTop:8}}>Reels, campaigns, films, mapping and installations<br/>shot, generated and shaped in Lisbon.</div>
          <div className="filters">
            <button
              className={"btn-pill sm" + (sel.length === 0 ? ' solid' : '')}
              style={sel.length ? { color:'var(--paper)', borderColor:'rgba(255,255,255,0.4)' } : {}}
              onClick={() => setSel([])}
            >All work</button>
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={"btn-pill sm" + (sel.includes(f.id) ? ' solid' : '')}
                style={!sel.includes(f.id) ? { color:'var(--paper)', borderColor:'rgba(255,255,255,0.4)' } : {}}
                onClick={() => toggle(f.id)}
              >{f.label}</button>
            ))}
          </div>
        </div>
      </section>

      <Marquee text={"Selected work · " + (sel.length ? sel.map(labelOf).join(' · ') : 'all practices')} />

      <section className="portfolio-grid" style={{paddingTop:48}}>
        {list.map((w, i) => (
          <div key={w.id} className={"cinecard r-up" + (w.size === 'wide' ? ' wide' : '')} style={{animationDelay: `${0.05 * (i % 6)}s`}} onClick={() => onNav('case', { work: w.id })}>
            <div className="img" style={{ backgroundImage:`url(${w.img})`, backgroundSize:'cover', backgroundPosition:w.pos || 'center', backgroundColor:'#000' }}></div>
            <div className="scrim"></div>
            <div className="meta-tl">{w.year} · {(w.svcs || [w.svc]).map(s => labelOf(s).toLowerCase()).join(" · ")}</div>
            <div className="meta-tr">// {String(i + 1).padStart(2, '0')}</div>
            <div className="foot">
              <div className="title">{w.title}</div>
              <div className="sub">
                <span className="arrow">
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="chat-closer">
        <div className="bg" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, r) => (
            <div key={r} className="line">
              {Array.from({ length: 8 }).map((_, c) => <span key={c}>Let's chat</span>)}
            </div>
          ))}
        </div>
        <div className="fg">
          <div className="lab">// closing card</div>
          <h2>Got something<br/>in mind?</h2>
          <Pill solid onClick={() => onNav('contact')}>Start a project</Pill>
        </div>
      </section>

      <Footer onNav={onNav} />
    </div>
  );
}

window.Portfolio = Portfolio;
