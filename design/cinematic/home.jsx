/* ============================================================
   HOME — v4: unified site (no mode split)
   hero video rotator w/ progress · service loop · creative
   process (WIP) · our works (hover expand) · client loops
   ============================================================ */

const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

/* hero rotator — short clips w/ place · event · year caption */
const HERO_CLIPS = [
  { id:'alanwatts', title:'Alan Watts', year:'2025 – ongoing', kind:'Archival Restoration', place:'Alan Watts Foundation',
    src:'assets/feat-alanwatts.mp4', poster:'assets/feat-alanwatts.png' },
  { id:'motelx', title:'Motel X — Vinte Anos', year:'2026', kind:'Magic Photo Booth', place:'Lisbon',
    src:'assets/feat-motelx.mp4', poster:'assets/feat-motelx.jpg' },
  { id:'standv', title:'Standvirtual — Back to the Future', year:'2026', kind:'Branded Campaign', place:'Lisbon',
    src:'assets/hero-standv.mp4', poster:'assets/w-standv.png' },
  { id:'delulu', title:'Delulu — Sofie Heyman', year:'2026', kind:'Artist Collaboration', place:'Lisbon',
    src:assetUrl('reelDelulu','assets/reel-delulu.mp4'), poster:'assets/w-delulu.jpg' },
  { id:'ciurlionis', title:'M. K. Čiurlionis — Trail of Angels', year:'2026', kind:'Animation & Film', place:'Lithuania',
    src:'assets/feat-ciurlionis.mp4', poster:'assets/feat-ciurlionis.png' },
  { id:'yardep', title:'Yard Episode', year:'2024', kind:'Mapping & Live Visuals', place:'Lisbon',
    src:'assets/sd-vfx-2.mp4', poster:'assets/yrd-thumb.jpg' },
];

const SERVICES = [
  { id:'artistic',  side:'.content',     filter:'Artistic',  title:'Animation\n& Film',      desc:'Character animation,\nmusic videos & stylised film',   img:assetUrl('svcAnimation','assets/svc-animation.png') },
  { id:'branded',   side:'.content',     filter:'Branded',   title:'Branded\nCampaigns',     desc:'Ad spots, brand films\n& social content',              img:assetUrl('svcBranded','assets/svc-branded.png') },
  { id:'fashion',   side:'.content',     filter:'Fashion',   title:'Virtual\nOutfitting',    desc:'Virtual photoshoots, product\n& e-commerce imagery',      img:assetUrl('svcFashion','assets/svc-fashion.png') },
  { id:'archival',  side:'.content',     filter:'Archival',  title:'Archival\nPreservation', desc:'Restoration & enhancement\nof historical media',       img:assetUrl('svcArchival2','assets/svc-archival2.png') },
  { id:'immersive', side:'.content',     filter:'Immersive', title:'VFX &\nMapping',         desc:'Cinematic VFX,\nenvironment & multi-screen',        img:assetUrl('svcVfx','assets/svc-vfx.png') },
  { id:'mirror',    side:'.interactive', filter:'Immersive', title:'Magic\nMirror',          desc:'Live portrait transformation\nfor events & venues',    img:assetUrl('svcMirror','assets/svc-mirror.png') },
  { id:'booth',     side:'.interactive', filter:'Immersive', title:'AI\nPhoto Booth',        desc:'Live capture, on-brand\ngeneration, instant print',     img:assetUrl('svcBooth','assets/svc-booth.png') },
  { id:'augart',    side:'.interactive', filter:'Immersive', title:'Augmented\nArt',         desc:'Paintings and objects\nthat move when you look',        img:assetUrl('svcAugart','assets/svc-augart.png') },
  { id:'visuals',   side:'.interactive', filter:'Immersive', title:'Live\nVisuals',   desc:'VJing and live visuals for stages,\nperformances & immersive spaces',    img:assetUrl('svcVisuals','assets/svc-visuals.png') },
  { id:'custom',    side:'.interactive', filter:'Immersive', title:'Custom\nContent',        desc:'Bespoke builds shaped\naround your room and brief',     img:assetUrl('svcCustom','assets/svc-custom.png') },
];

/* our works — expand on hover, click → case page */
const FEATURED = [
  { id:'ciurlionis', title:'M. K. Čiurlionis\nTrail of Angels', cat:'Animation\n& Film', client:'M. K. Čiurlionis', year:'2026', img:'assets/feat-ciurlionis.png', pos:'50% 30%', clip:'assets/feat-ciurlionis.mp4' },
  { id:'motelx', title:'Motel X\nVinte Anos', cat:'Magic Photo\nBooth', client:'MOTELX', year:'2026', img:'assets/feat-motelx.jpg', clip:'assets/feat-motelx.mp4' },
  { id:'alanwatts', title:'Alan\nWatts', cat:'Archival\nRestoration', client:'Alan Watts Foundation', year:'2025 – ongoing', img:'assets/feat-alanwatts.png', pos:'50% 30%', clip:'assets/feat-alanwatts.mp4' },,
  { id:'thorneshade', title:'Other\nProjects', cat:'Selected\nwork', client:'Various', year:'2024–26', img:'assets/yrd-thumb.jpg', clip:'assets/feat-other.mp4', all:true },
];

const TRUSTED = [
  { name:'Lisbon Insiders', logo:assetUrl('logoLisbon','assets/logo-lisbon.png') },
  { name:'NFC', logo:assetUrl('logoNfc','assets/logo-nfc.png') },
  { name:'Wines From Another World', logo:assetUrl('logoWines','assets/logo-wines.png') },
  { name:'YARD', logo:assetUrl('logoYard','assets/logo-yard.png') },
  { name:'Alan Watts', logo:assetUrl('logoAlanwatts','assets/logo-alanwatts.png') },
  { name:'Hulaween', logo:assetUrl('logoHulaween','assets/logo-hulaween.png') },
  { name:'Vagabond', logo:assetUrl('logoVagabond','assets/logo-vagabond.png') },
  { name:'Rare Effect', logo:assetUrl('logoRareeffect','assets/logo-rareeffect.png') },
  { name:'Portugal Tech Week', logo:assetUrl('logoTechweek','assets/logo-techweek.png') },
  { name:'Studio 54b', logo:assetUrl('logoStudio54b','assets/logo-studio54b.png') },
  { name:'BioXYZ', logo:assetUrl('logoBioxyz','assets/logo-bioxyz.png') },
  { name:'Quincy Jones', logo:assetUrl('logoQuincy','assets/logo-quincy.png') },
  { name:'Obscura', logo:assetUrl('logoObscura','assets/logo-obscura.png') },
  { name:'Barbara Veiga', logo:assetUrl('logoBarbara','assets/logo-barbara.png') },
  { name:'MOTELX', logo:'assets/logo-motelx.png' },
  { name:'Oddsgate', logo:'assets/logo-oddsgate.png' },
  { name:'Standvirtual', logo:'assets/logo-standv-w.png' },
  { name:'Synesthesia', logo:'assets/logo-synesthesia.png' },
  { name:'Tkeshii', logo:'assets/logo-tkeshii.png' },
  { name:'Texas Eclipse', logo:'assets/logo-eclipse.avif' },
];
const PARTNERS = [
  { name:'Screenix', logo:'assets/logo-screenix.png' },
  { name:'Taste Labs', logo:'assets/logo-taste.png' },
  { name:'Institute for Tomorrow', logo:'assets/logo-tmrw.png' },
];

/* ---------- HERO ROTATOR ---------- */
function HeroRotator() {
  const [i, setI] = useStateH(0);
  const [pct, setPct] = useStateH(0);
  const vidRef = useRefH(null);
  const clip = HERO_CLIPS[i];

  const offline = !!window.__OFFLINE_BUILD;
  const next = () => setI((n) => (n + 1) % HERO_CLIPS.length);

  useEffectH(() => {
    if (!offline) return;
    setPct(0);
    let t = 0;
    const id = setInterval(() => { t += 4; setPct(p => Math.min(100, p + 4)); if (t >= 100) { t = 0; next(); } }, 240);
    return () => clearInterval(id);
  }, [i, offline]);

  useEffectH(() => {
    if (offline) return;
    setPct(0);
    const v = vidRef.current;
    if (!v) return;
    v.muted = true; v.volume = 0;
    if (!v.currentSrc.endsWith(clip.src)) { v.src = clip.src; v.load(); }
    const start = () => { v.muted = true; v.play().catch(() => {}); };
    start();
    v.addEventListener('canplay', start);
    return () => { v.removeEventListener('canplay', start); };
  }, [i]);

  return (
    <section className="hero2">
      <div className="hero2-head">
        <h1>We build <em>worlds,</em><br/>on screen and in the room</h1>
      </div>
      <div className="hero2-stage">
        {offline ? (
          <img className="hv" src={clip.poster} alt={clip.title} />
        ) : (
        <video
          ref={vidRef}
          className="hv"
          autoPlay muted playsInline preload="auto"
          onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) setPct((v.currentTime / v.duration) * 100); }}
          onEnded={next}
          onError={next}
        ></video>
        )}
        <div className="hero2-scrim"></div>
        <div className="hero2-caption">
          <span className="t">{clip.title}</span>
          <span className="s">|| {clip.year} · {clip.kind} · {clip.place}</span>
        </div>
        <div className="hero2-dots">
          {HERO_CLIPS.map((c, n) => (
            <button key={c.id} className={n === i ? 'on' : ''} onClick={() => setI(n)} aria-label={c.title}></button>
          ))}
        </div>
        <div className="hero2-progress"><span style={{width:pct + '%'}}></span></div>
      </div>
    </section>
  );
}

window.SERVICES = SERVICES;

/* ---------- SERVICE LOOP (home — single endless row) ---------- */
function ServiceLoop({ onNav }) {
  const row = [...SERVICES, ...SERVICES];
  return (
    <section className="svc-loop" id="services">
      <div className="svc-loop-head home">
        <div className="lab">// what we do</div>
        <h2>Services</h2>
      </div>
      <div className="svc-track-wrap">
        <div className="svc-track home">
          {row.map((s, i) => (
            <div key={s.id + i} className="svc-tile" onClick={() => onNav('service', { service: s.id })}>
              <div className="img" style={{backgroundImage:`url(${s.img})`}}></div>
              <div className="scrim"></div>
              <div className="side">{s.side}</div>
              <div className="body">
                <div className="title">{s.title.split('\n').map((l,j,a)=><React.Fragment key={j}>{l}{j<a.length-1&&<br/>}</React.Fragment>)}</div>
                <div className="desc">{s.desc.split('\n').map((l,j,a)=><React.Fragment key={j}>{l}{j<a.length-1&&<br/>}</React.Fragment>)}</div>
              </div>
              <div className="arrow"><svg viewBox="0 0 24 24"><path d="M7 17 L17 7 M9 7 H17 V15"/></svg></div>
            </div>
          ))}
        </div>
      </div>
      <div className="svc-loop-foot"><Pill onClick={() => onNav('services')}>See all our services</Pill></div>
    </section>
  );
}

/* ---------- CREATIVE PROCESS — VERSION 1 (rows; kept for reference) ---------- */
function CreativeProcessV1({ onNav }) {
  const steps = [
    { n:'01', t:'Discover', d:'We learn your goals, tone, and audience.' },
    { n:'02', t:'Direct',   d:'Human vision leads; AI assists wherever it helps.' },
    { n:'03', t:'Build',    d:'We shoot, generate, or construct — on screen or in the room.' },
    { n:'04', t:'Deliver',  d:'Shipped, installed, and refined as your story keeps evolving.' },
  ];
  return (
    <section className="process">
      <div className="process-head">
        <h2>Creative<br/>process</h2>
        <div className="note">// work in progress — structure placeholder</div>
      </div>
      <div className="process-rows">
        {steps.map(s => (
          <div key={s.n} className="prow">
            <div className="n">{s.n}</div>
            <div className="t">{s.t}</div>
            <div className="d">{s.d}</div>
          </div>
        ))}
      </div>
      <div className="process-foot"><Pill onClick={() => onNav('contact')}>Ready to start? Work with us →</Pill></div>
    </section>
  );
}

/* ---------- CREATIVE PROCESS — VERSION 2 (circular dial) ---------- */
const PROCESS_STEPS = [
  { n:'01', t:'Discover', d:'We learn your goals, tone, and audience.' },
  { n:'02', t:'Direct',   d:'Human vision leads; AI assists wherever it helps.' },
  { n:'03', t:'Build',    d:'We shoot, generate, or construct — on screen or in the room.' },
  { n:'04', t:'Deliver',  d:'Shipped, installed, and refined as your story keeps evolving.' },
];

function CreativeProcess({ onNav }) {
  const [act, setAct] = useStateH(0);
  const [auto, setAuto] = useStateH(true);
  useEffectH(() => {
    if (!auto) return;
    const id = setInterval(() => setAct(i => (i + 1) % PROCESS_STEPS.length), 4200);
    return () => clearInterval(id);
  }, [auto]);
  const step = PROCESS_STEPS[act];
  const R = 42;

  return (
    <section className="process2">
      <div className="p2-head">
        <h2>Creative<br/><em>process</em></h2>
        <div className="lab">// how we work</div>
      </div>

      <div className="p2-stage" onMouseEnter={() => setAuto(false)} onMouseLeave={() => setAuto(true)}>
        <div className="dial">
          <svg className="rings" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="ring" cx="50" cy="50" r={R} />
            <circle className="ring faint" cx="50" cy="50" r={R - 11} />
            <circle
              className="arc"
              cx="50" cy="50" r={R}
              strokeDasharray={`${(2 * Math.PI * R) / PROCESS_STEPS.length} ${2 * Math.PI * R}`}
              style={{ transform:`rotate(${-90 + act * (360 / PROCESS_STEPS.length)}deg)` }}
            />
          </svg>

          {PROCESS_STEPS.map((s, i) => {
            const a = (-90 + i * (360 / PROCESS_STEPS.length)) * Math.PI / 180;
            return (
              <button
                key={s.n}
                type="button"
                className={"node q" + i + (i === act ? ' on' : '')}
                style={{ left:`${50 + R * Math.cos(a)}%`, top:`${50 + R * Math.sin(a)}%` }}
                onClick={() => setAct(i)}
              >
                <span className="dot"></span>
                <span className="cap">{s.n} {s.t}</span>
              </button>
            );
          })}

          <div className="core">
            <div className="idx">{step.n}</div>
            <div className="ttl">{step.t}</div>
            <div className="dsc">{step.d}</div>
          </div>
        </div>
      </div>

      <div className="p2-foot">
        <div className="tick">// {String(act + 1).padStart(2,'0')} of 04 — hover to pause, click a node</div>
        <Pill onClick={() => onNav('contact')}>Ready to start? Work with us →</Pill>
      </div>
    </section>
  );
}

/* ---------- OUR WORKS (meta always on · hover expands, colors, previews) ---------- */
function WorkBand({ w, onNav }) {
  const [hot, setHot] = useStateH(false);
  return (
    <div
      className={"band" + (hot ? ' hot' : '')}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onClick={() => w.all ? onNav('portfolio') : onNav('case', { work: w.id })}
    >
      <div className="img" style={{backgroundImage:`url(${w.img})`,backgroundPosition:w.pos || '50% 50%'}}></div>
      {hot && w.clip && (
        <video className="clip" src={w.clip} autoPlay muted loop playsInline
          ref={(v) => { if (v) { v.muted = true; v.volume = 0; v.play().catch(()=>{}); } }}></video>
      )}
      <div className="scrim"></div>
      <div className="ttl">{w.title.split('\n').map((l,j,a)=><React.Fragment key={j}>{l}{j<a.length-1&&<br/>}</React.Fragment>)}</div>
      {w.all ? (
        <div className="go"><svg viewBox="0 0 24 24"><path d="M7 17 L17 7 M9 7 H17 V15"/></svg></div>
      ) : (
        <div className="band-meta">
          <div className="cell"><span className="k">Category</span><span className="v">{w.cat}</span></div>
          <div className="cell"><span className="k">Client</span><span className="v">{w.client}</span></div>
          <div className="cell"><span className="k">Year</span><span className="v">{w.year}</span></div>
        </div>
      )}
    </div>
  );
}

function OurWorks({ onNav }) {
  return (
    <section className="works">
      <div className="works-head">
        <h2>Featured<br/>work</h2>
        <div className="meta">// hover for a preview · click for the full case</div>
      </div>
      <div className="work-bands">
        {FEATURED.map(w => <WorkBand key={w.id} w={w} onNav={onNav} />)}
      </div>
      <div className="works-foot"><Pill onClick={() => onNav('portfolio')}>Start your project</Pill></div>
    </section>
  );
}

/* ---------- LOGO LOOP (endless) ---------- */
function LogoLoop({ title, items, static: isStatic }) {
  const row = isStatic ? items : [...items, ...items];
  return (
    <div className="logo-loop">
      <div className="lab">{title}</div>
      <div className={"loop-wrap" + (isStatic ? ' static' : '')}>
        <div className="loop-track">
          {row.map((it, i) => (
            <div key={it.name + i} className={"slot" + (it.logo ? ' has-logo' : '')}>
              {it.logo ? <img src={it.logo} alt={it.name} /> : it.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- CHAT CLOSER ---------- */
function ChatCloser({ onNav }) {
  return (
    <section className="chat-closer">
      <div className="bg" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, r) => (
          <div key={r} className="line">
            {Array.from({ length: 8 }).map((_, c) => <span key={c}>Let's chat</span>)}
          </div>
        ))}
      </div>
      <div className="fg">
        <div className="lab">// let's chat</div>
        <h2>Let's bring your<br/>story to life</h2>
        <Pill solid onClick={() => onNav('contact')}>Start your project</Pill>
      </div>
    </section>
  );
}

/* ---------- HOME ---------- */
function ContentHome({ onNav }) {
  return (
    <div className="page-fade">
      <HeroRotator />
      <Marquee text="Digital Content · Archival Animation · Magic Mirror · Virtual Outfitting" />

      <section className="who">
        <div className="lab">Who is 204?</div>
        <p>204 is a Lisbon-based creative studio. Every world starts with <b>human direction</b> — then becomes a film, a campaign, or something you interact with.</p>
        <Pill onClick={() => onNav('contact')}>Work with us</Pill>
      </section>

      <ServiceLoop onNav={onNav} />
      <OurWorks onNav={onNav} />
      <CreativeProcess onNav={onNav} />

      <section className="logo-loops">
        <LogoLoop title="Trusted by" items={TRUSTED} />
        <LogoLoop title="Partners" items={PARTNERS} static />
      </section>

      <ChatCloser onNav={onNav} />
      <Footer onNav={onNav} />
    </div>
  );
}

window.ContentHome = ContentHome;
window.ChatCloser = ChatCloser;
