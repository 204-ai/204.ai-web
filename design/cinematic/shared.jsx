/* ============================================================
   204 PROTOTYPE — SHARED COMPONENTS
   Nav, Footer, Marquee, TitleCard, Pill button, etc.
   Exported to window so other JSX files can use them.
   ============================================================ */

const { useState, useEffect, useRef } = React;

/* asset URL helper — uses inlined blob in the bundled standalone build,
   falls back to the relative path in the live dev version */
function assetUrl(id, path){ return (window.__resources && window.__resources[id]) || path; }
window.assetUrl = assetUrl;

/* ---------- NAV ---------- */
function Nav({ page, onNav }) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { id: 'home',      label: 'Home' },
    { id: 'services',  label: 'Services' },
    { id: 'portfolio', label: 'Our Work', drop: true },
    { id: 'about',     label: 'About' },
    { id: 'contact',   label: 'Contact' },
  ];

  return (
    <nav className={"nav" + (solid ? " solid" : "")}>
      <div className="left">
        <img
          className="logo"
          src={assetUrl('logo204white','assets/204_white.png')}
          alt="204"
          onClick={() => onNav('home')}
        />
      </div>
      <div className="right">
        {links.map(l => (
          l.drop === true ? (
            <div key={l.id} className="has-drop">
              <a
                className={page === l.id ? 'active' : ''}
                onClick={() => onNav(l.id)}
              >{l.label} ▾</a>
              <div className="dropdown">
                <div className="item" onClick={() => onNav('portfolio', { filter: 'all' })}><span>All Work</span><span className="ar">→</span></div>
                <div className="item" onClick={() => onNav('portfolio', { filter: '.content' })}><span>.content</span><span className="ar">→</span></div>
                <div className="item" onClick={() => onNav('portfolio', { filter: '.interactive' })}><span>.interactive</span><span className="ar">→</span></div>
              </div>
            </div>
          ) : (
            <a
              key={l.id}
              className={page === l.id ? 'active' : ''}
              onClick={() => onNav(l.id)}
            >{l.label}</a>
          )
        ))}
      </div>
    </nav>
  );
}

/* ---------- CUSTOM CURSOR ---------- */
function CursorDot() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [hot, setHot] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    document.body.classList.add('cursor-none');
    let rx = 0, ry = 0, x = 0, y = 0, raf;
    const SEL = 'a,button,input,textarea,select,label,.svc-tile,.band,.cinecard,.chip,.btn-pill,.hero2-dots button,.item,.maker,.logo-loop .slot';
    const onMove = (e) => {
      x = e.clientX; y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      setVisible(true);
      const t = e.target;
      setHot(!!(t && t.closest && t.closest(SEL)));
    };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      document.body.classList.remove('cursor-none');
    };
  }, []);

  const cls = (hot ? ' hot' : '') + (visible ? ' on' : '');
  return (
    <>
      <div ref={ring} className={"cursor-ring" + cls}></div>
      <div ref={dot} className={"cursor-dot" + cls}></div>
    </>
  );
}

/* ---------- MARQUEE ---------- */
function Marquee({ text = 'Behind the Magic', fill = false }) {
  const items = Array.from({ length: 10 });
  return (
    <div className="marquee">
      <div className="track">
        {items.map((_, i) => (
          <React.Fragment key={i}>
            <span className={"word" + (fill && i % 2 === 0 ? ' fill' : '')}>{text}</span>
            <span className="dot">•</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------- TITLE CARD (chapter break) ---------- */
function TitleCard({ chapter, name, tail }) {
  return (
    <div className="titlecard">
      <div className="chap r-up">{chapter}</div>
      <div className="name r-up d-1">{name}</div>
      <div className="tail r-up d-2">{tail}</div>
    </div>
  );
}

/* ---------- PILL BUTTON ---------- */
function Pill({ children, solid = false, wide = false, sm = false, onClick }) {
  const cls = ['btn-pill', solid && 'solid', wide && 'wide', sm && 'sm'].filter(Boolean).join(' ');
  return <button className={cls} onClick={onClick}>{children}</button>;
}

/* ---------- CINEMA CARD ---------- */
function CineCard({ title, metaTl, metaTr, sub, bg, img, titlePoppins = false, onClick }) {
  return (
    <a className="cinecard" onClick={onClick}>
      <div className="img" style={img ? { backgroundImage:`url(${img})`, backgroundSize:'cover', backgroundPosition:'center', backgroundColor:'#000' } : { background: bg }}></div>
      <div className="scrim"></div>
      {metaTl && <div className="meta-tl">{metaTl}</div>}
      {metaTr && <div className="meta-tr">{metaTr}</div>}
      <div className={"title" + (titlePoppins ? ' poppins' : '')}>{title}</div>
      <div className="sub">
        <span>{sub}</span>
        <span className="arrow">
          <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </div>
    </a>
  );
}

/* ---------- CREDITS BLOCK ---------- */
function CreditsBlock() {
  return (
    <div className="credits">
      <div className="lab">// in the credits</div>
      <div className="cols">
        <div className="col">
          <div className="hd">Clients</div>
          <ul>
            <li><span>Stand Virtual</span><span className="yr">'26</span></li>
            <li><span>YARD</span><span className="yr">'26</span></li>
            <li><span>Hulaween Festival</span><span className="yr">'25</span></li>
            <li><span>Lisbon Insiders</span><span className="yr">'25</span></li>
            <li><span>Alan Watts</span><span className="yr">'25</span></li>
            <li><span>KBC</span><span className="yr">'25</span></li>
            <li><span>Portugal Tech Week</span><span className="yr">'25</span></li>
            <li><span>Studio 54b</span><span className="yr">'24</span></li>
            <li><span>Texas Eclipse</span><span className="yr">'24</span></li>
            <li><span>Viva el Gonzo</span><span className="yr">'24</span></li>
          </ul>
        </div>
        <div className="col">
          <div className="hd">Formats</div>
          <ul>
            <li><span>Branded Campaigns</span></li>
            <li><span>Immersive Mapping</span></li>
            <li><span>Artistic Film</span></li>
            <li><span>Music Videos</span></li>
            <li><span>Live Visuals</span></li>
            <li><span>Magic Photo Booth</span></li>
            <li><span>Archival Restoration</span></li>
            <li><span>Brand Identity</span></li>
            <li><span>Title Sequences</span></li>
          </ul>
        </div>
        <div className="col">
          <div className="hd">Distribution</div>
          <ul>
            <li><span>Screenix</span></li>
            <li><span>Taste Labs</span></li>
            <li><span>Institute for Tomorrow</span></li>
            <li><span>NFC</span></li>
          </ul>
          <div className="hd" style={{marginTop:32}}>Festivals</div>
          <ul>
            <li><span>Hulaween</span></li>
            <li><span>Texas Eclipse</span></li>
            <li><span>Vagabond</span></li>
            <li><span>Wines From Another World</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- FOOTER ---------- */
function Footer({ onNav }) {
  return (
    <footer className="footer">
      <div className="top">
        <div className="brand">
          <img src={assetUrl('logo204white','assets/204_white.png')} alt="204" />
          <p>A creative studio fusing human intention with AI-driven expression. Cinematic content & immersive worlds, built in Lisbon.</p>
        </div>
        <div className="col">
          <h6>Studio</h6>
          <a onClick={() => onNav('home')}>Home</a>
          <a onClick={() => onNav('services')}>Services</a>
          <a onClick={() => onNav('portfolio')}>Our Work</a>
          <a onClick={() => onNav('about')}>About</a>
          <a onClick={() => onNav('contact')}>Contact</a>
        </div>
        <div className="col">
          <h6>Visit</h6>
          <a onClick={() => window.open('https://www.rna-studio.com/', '_blank')} style={{fontFamily:'var(--font-body)',fontWeight:500,fontSize:14}}>RNA Studio</a>
          <a style={{fontFamily:'var(--font-mono)',fontSize:12,opacity:.6,lineHeight:1.55}}>R. Ferreira Lapa 12A<br/>1150-157 Lisboa<br/>Portugal</a>
        </div>
        <div className="col">
          <h6>Socials</h6>
          <a>Instagram</a>
          <a>LinkedIn</a>
          <a>Vimeo</a>
        </div>
      </div>
      <div className="bot">
        <div>© 204 / 2026 — All rights reserved</div>
        <div>// part of RNA Studio</div>
        <div>Site v2 — Cinematic</div>
      </div>
    </footer>
  );
}

/* expose to other files */
Object.assign(window, { Nav, Marquee, TitleCard, Pill, CineCard, CreditsBlock, Footer, CursorDot });
