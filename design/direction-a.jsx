// direction-a.jsx — "NIGHT SHIFT"
// Cinematic noir, full-bleed hero, condensed display type.
// 5 pages: HOME / WORK / SERVICES / ABOUT / CONTACT

function DirectionA({ width = 1280, height = 820 }) {
  const [page, setPage] = React.useState("home");
  const [modeTab, setModeTab] = React.useState("content"); // .Content / .Interactive
  const [cat, setCat] = React.useState("all");
  const [hovered, setHovered] = React.useState(null);
  const [cursor, setCursor] = React.useState({ x: width/2, y: height/2, inside: false });

  const stageRef = React.useRef(null);
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const sx = r.width / width;
      const sy = r.height / height;
      setCursor({ x: (e.clientX - r.left) / sx, y: (e.clientY - r.top) / sy, inside: true });
    };
    const leave = () => setCursor((c) => ({ ...c, inside: false }));
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, [width, height]);

  const bg = "#0a0a0a";
  const fg = "#ececec";
  const dim = "rgba(236,236,236,0.55)";
  const hairline = "rgba(236,236,236,0.14)";
  const accent = "#c9442b";

  const display = { fontFamily: "'Archivo Black', Impact, sans-serif", letterSpacing: -0.02, lineHeight: 0.88 };
  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  const filtered = cat === "all" ? WORKS : WORKS.filter(w => w.cat === cat);

  return (
    <div ref={stageRef} data-screen-label={`A · ${page}`} style={{
      position: "relative", width, height, background: bg, color: fg,
      fontFamily: "'Space Grotesk', sans-serif", overflow: "hidden", cursor: "none",
    }}>
      {/* grain */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06, mixBlendMode: "overlay",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.8'/%3E%3C/svg%3E\")",
      }}/>

      {/* nav */}
      <NavA page={page} setPage={setPage}
        fg={fg} dim={dim} hairline={hairline} accent={accent} mono={mono} />

      {/* pages */}
      <div style={{ position: "absolute", inset: "58px 0 0 0" }}>
        {page === "home" && <PageHome setPage={setPage}
          fg={fg} dim={dim} hairline={hairline} accent={accent} display={display} mono={mono} width={width} height={height} />}
        {page === "work" && <PageWork works={filtered} cat={cat} setCat={setCat}
          hovered={hovered} setHovered={setHovered}
          fg={fg} dim={dim} hairline={hairline} accent={accent} display={display} mono={mono} />}
        {page === "services" && <PageServices fg={fg} dim={dim} hairline={hairline} accent={accent} display={display} mono={mono} />}
        {page === "about" && <PageAbout fg={fg} dim={dim} hairline={hairline} accent={accent} display={display} mono={mono} />}
        {page === "contact" && <PageContact fg={fg} dim={dim} hairline={hairline} accent={accent} display={display} mono={mono} />}
      </div>

      {/* custom cursor */}
      {cursor.inside && (
        <div style={{
          position: "absolute", left: cursor.x, top: cursor.y, pointerEvents: "none",
          transform: "translate(-50%,-50%)", zIndex: 50, mixBlendMode: "difference",
        }}>
          <div style={{
            width: hovered ? 56 : 12, height: hovered ? 56 : 12, borderRadius: 99,
            background: hovered ? "transparent" : fg,
            border: hovered ? `1px solid ${fg}` : "none",
            transition: "width .18s, height .18s",
            display: "flex", alignItems: "center", justifyContent: "center",
            ...mono, fontSize: 9, color: fg, letterSpacing: 1,
          }}>
            {hovered ? "VIEW" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── nav ──────────────────────────────────────────────────────
function NavA({ page, setPage, fg, dim, hairline, accent, mono }) {
  const items = [
    { id: "home", label: "Index" },
    { id: "work", label: "Work" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 58, zIndex: 20,
      display: "flex", alignItems: "center", padding: "0 28px",
      borderBottom: `1px solid ${hairline}`, background: "rgba(10,10,10,0.72)", backdropFilter: "blur(8px)",
    }}>
      {/* logo */}
      <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          border: `1.5px solid ${fg}`, padding: "3px 7px 2px",
          fontFamily: "'Archivo Black', sans-serif", fontSize: 18, letterSpacing: 0.5, lineHeight: 1,
        }}>204</div>
        <div style={{ ...mono, fontSize: 9, color: dim, letterSpacing: 2, lineHeight: 1 }}>
          NO-<br/>CONTENT
        </div>
      </div>

      {/* main nav */}
      <div style={{ display: "flex", gap: 0, marginLeft: 24 }}>
        {items.map(it => {
          const active = page === it.id;
          return (
            <button key={it.id} onClick={() => setPage(it.id)} style={{
              background: "transparent", border: "none", cursor: "pointer", color: fg,
              ...mono, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
              padding: "8px 14px", position: "relative",
            }}>
              <span style={{ color: active ? fg : dim, transition: "color .15s" }}>{it.label}</span>
              {active && <span style={{
                position: "absolute", left: 14, right: 14, bottom: 2, height: 2, background: accent,
              }}/>}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* right-side status */}
      <button onClick={() => setPage("contact")} style={{
        marginLeft: 20, paddingLeft: 20, border: "none", borderLeft: `1px solid ${hairline}`,
        background: "transparent", cursor: "pointer",
        ...mono, fontSize: 10, color: dim, letterSpacing: 0.5, lineHeight: 1.3, textAlign: "right",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
          <span style={{ color: accent }}>● BOOKING Q3 / 26</span>
        </div>
        <div style={{ color: fg, marginTop: 2 }}>WORK WITH US →</div>
      </button>
    </div>
  );
}

// ─── home ─────────────────────────────────────────────────────
function PageHome({ modeTab, setPage, fg, dim, hairline, accent, display, mono, width, height }) {
  const [activeFrame, setActiveFrame] = React.useState(0);
  const frames = [
    { code: "NC·001", title: "Halide Parallax", client: "Mekano Ltd.", scene: "cathedral" },
    { code: "NC·005", title: "The Hollow Hour", client: "Mubi / Aperture", scene: "desert" },
    { code: "NC·003", title: "Slow Burn", client: "Atlas Coffee Co.", scene: "interior" },
    { code: "NC·007", title: "Undercurrent", client: "Pier 14 Gallery", scene: "water" },
  ];
  const current = frames[activeFrame];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      {/* hero media — single cinematic still, locked 16:9 with capped height */}
      <div style={{ position: "relative", height: 440, margin: "14px 28px 0", overflow: "hidden", background: "#0f0f0f", borderRadius: 2, display: "grid", gridTemplateColumns: "auto 1fr", gap: 0 }}>
        {/* main still — fixed 16:9, sized off the row height (440 × 16/9 ≈ 782) */}
        <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16 / 9", height: "100%", width: "auto" }}>
          <CinematicStill scene={current.scene} accent={accent}/>
          {/* caption overlays */}
          <div style={{ position: "absolute", left: 24, top: 20, ...mono, fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: 2, lineHeight: 1.5 }}>
            <div style={{ color: accent }}>● NOW PLAYING</div>
            <div style={{ marginTop: 2 }}>CH.0{activeFrame+1} / {current.title.toUpperCase()}</div>
            <div style={{ opacity: 0.6 }}>{current.client.toUpperCase()}</div>
          </div>
          <div style={{ position: "absolute", right: 24, top: 20, ...mono, fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: 2, textAlign: "right", lineHeight: 1.5 }}>
            <div>{current.code}</div>
            <div style={{ opacity: 0.6 }}>35MM · 2.39:1</div>
          </div>
          {/* big play button centered */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: 72, height: 72, borderRadius: 99, border: `1.5px solid rgba(255,255,255,0.85)`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(3px)" }}>
              <div style={{ width: 0, height: 0, borderLeft: "16px solid #fff", borderTop: "11px solid transparent", borderBottom: "11px solid transparent", marginLeft: 4 }}/>
            </div>
          </div>
          {/* footer bar — runtime + subtle progress */}
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", ...mono, fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: 1 }}>
            <span>01:28 / 04:28</span>
            <span style={{ opacity: 0.6 }}>REEL 2025 · PART {activeFrame+1} OF {frames.length}</span>
          </div>
        </div>

        {/* right rail: thumbnail stack */}
        <div style={{ borderLeft: `1px solid rgba(255,255,255,0.08)`, background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px 8px", ...mono, fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: 2, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
            / CHAPTERS
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {frames.map((f, i) => {
              const active = i === activeFrame;
              return (
                <div key={f.code} onClick={() => setActiveFrame(i)} style={{
                  flex: 1, padding: "12px 18px", cursor: "pointer", position: "relative",
                  borderBottom: i < frames.length-1 ? `1px solid rgba(255,255,255,0.06)` : "none",
                  background: active ? "rgba(255,255,255,0.04)" : "transparent",
                  display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, alignItems: "center",
                }}>
                  <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", borderRadius: 1 }}>
                    <CinematicStill scene={f.scene} accent={accent} mini/>
                    {active && <div style={{ position: "absolute", inset: 0, border: `1.5px solid ${accent}` }}/>}
                  </div>
                  <div>
                    <div style={{ ...mono, fontSize: 9, color: active ? accent : "rgba(255,255,255,0.45)", letterSpacing: 1.5, marginBottom: 4 }}>
                      CH.0{i+1} · {f.code}
                    </div>
                    <div style={{ ...display, fontSize: 16, color: active ? fg : dim, textTransform: "uppercase", lineHeight: 1.05, marginBottom: 3 }}>
                      {f.title}
                    </div>
                    <div style={{ ...mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
                      {f.client.toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* big type strap */}
      <div style={{ padding: "22px 28px 0", position: "relative" }}>
        <div style={{ ...display, fontSize: 92, color: fg, textTransform: "uppercase" }}>
          A STUDIO<span style={{ color: dim }}>—</span>FOR<br/>
          WORK THAT <span style={{ color: accent }}>LASTS</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, alignItems: "flex-end" }}>
          <div style={{ ...mono, fontSize: 11, color: dim, letterSpacing: 1, maxWidth: 380, lineHeight: 1.6 }}>
            204 · NO-CONTENT is a five-person practice working in film, motion,
            identity and reading. Based in Lisbon, operating everywhere there's
            a signal.
          </div>
          <button onClick={() => setPage("work")} style={{
            background: "transparent", border: `1px solid ${fg}`, color: fg, cursor: "pointer",
            ...mono, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            padding: "14px 22px",
          }}>→ Selected Work</button>
        </div>
      </div>
    </div>
  );
}

// CinematicStill — a single SVG "film still" evoking a scene via geometry
// and a graded color palette, not photography. Scene kinds: cathedral / desert /
// interior / water. `mini` tightens noise + skips the slow drift animation.
// `playing` adds a Ken-Burns drift on the silhouette and animates the grain so
// the still reads as a frame from a moving clip rather than a flat image.
function CinematicStill({ scene, accent, mini = false, playing = false }) {
  const [t, setT] = React.useState(0);
  const animated = !mini || playing;
  React.useEffect(() => {
    if (!animated) return;
    let raf; const start = performance.now();
    const tick = (now) => { setT((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);
  const drift = Math.sin(t * 0.3) * 8;
  // Ken-Burns: slow zoom + parallax pan for hover-playing stills
  const kbScale = playing ? 1 + (Math.sin(t * 0.18) + 1) * 0.04 : 1;   // 1.00 → 1.08
  const kbX = playing ? Math.sin(t * 0.13) * 14 : 0;
  const kbY = playing ? Math.cos(t * 0.11) * 8 : 0;
  // Grain jitter — re-position the bg every frame so it reads as live noise
  const grainX = playing ? (t * 30) % 140 : 0;
  const grainY = playing ? (t * 23) % 140 : 0;

  const scenes = {
    cathedral: {
      // warm amber backlight + tall silhouettes (columns / archways)
      bg: "linear-gradient(180deg, #1a0f08 0%, #3d1f0a 30%, #8a4a1a 65%, #c97a2a 88%, #e8a555 100%)",
      silhouette: (
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* arches */}
          <g fill="#08050a" opacity="0.92">
            <path d="M0,600 L0,340 Q80,180 160,340 L160,600 Z"/>
            <path d="M200,600 L200,380 Q260,240 320,380 L320,600 Z"/>
            <path d="M360,600 L360,300 Q440,120 520,300 L520,600 Z"/>
            <path d="M560,600 L560,360 Q620,220 680,360 L680,600 Z"/>
            <path d="M720,600 L720,340 Q800,190 880,340 L880,600 Z"/>
            <path d="M920,600 L920,400 Q970,300 1020,400 L1020,600 Z"/>
          </g>
          {/* distant figure */}
          <g fill="#08050a" opacity="0.95">
            <ellipse cx="500" cy="530" rx="18" ry="8"/>
            <path d="M486,530 L486,480 Q500,465 514,480 L514,530 Z"/>
          </g>
          {/* floor line */}
          <line x1="0" y1="555" x2="1000" y2="555" stroke="#08050a" strokeWidth="2" opacity="0.7"/>
          {/* light shafts */}
          <g opacity="0.18">
            <path d="M440,80 L380,600 L420,600 L480,80 Z" fill="#fff"/>
            <path d="M560,80 L620,600 L580,600 L520,80 Z" fill="#fff"/>
          </g>
        </svg>
      ),
    },
    desert: {
      // late afternoon, horizon, lone form
      bg: "linear-gradient(180deg, #2b1a3a 0%, #6e3a4a 28%, #c9644a 55%, #e59870 75%, #f5b98a 92%, #d9966a 100%)",
      silhouette: (
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* distant dunes */}
          <path d="M0,420 Q250,380 500,410 T1000,400 L1000,600 L0,600 Z" fill="#4a2840" opacity="0.85"/>
          <path d="M0,470 Q200,440 420,470 T800,465 T1000,475 L1000,600 L0,600 Z" fill="#2a1828" opacity="0.9"/>
          <path d="M0,530 Q300,505 600,525 T1000,520 L1000,600 L0,600 Z" fill="#120b14"/>
          {/* sun disc */}
          <circle cx="640" cy="360" r="46" fill="#ffe0b8" opacity="0.85"/>
          <circle cx="640" cy="360" r="70" fill="#ffe0b8" opacity="0.15"/>
          {/* lone standing figure */}
          <g fill="#080408">
            <circle cx="320" cy="488" r="6"/>
            <path d="M314,494 L314,530 L326,530 L326,494 Z"/>
          </g>
        </svg>
      ),
    },
    interior: {
      // warm lamplit room, window light, wainscoting
      bg: "linear-gradient(135deg, #0f0a06 0%, #1f150a 40%, #4a2e12 75%, #7a4a1a 100%)",
      silhouette: (
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* window cast light */}
          <path d="M420,120 L580,120 L640,600 L360,600 Z" fill="#f5c878" opacity="0.18"/>
          <rect x="420" y="120" width="160" height="220" fill="#f5c878" opacity="0.25"/>
          <line x1="500" y1="120" x2="500" y2="340" stroke="#0a0706" strokeWidth="4"/>
          <line x1="420" y1="230" x2="580" y2="230" stroke="#0a0706" strokeWidth="4"/>
          {/* table silhouette */}
          <rect x="100" y="440" width="360" height="10" fill="#0a0706"/>
          <rect x="120" y="450" width="8" height="150" fill="#0a0706"/>
          <rect x="432" y="450" width="8" height="150" fill="#0a0706"/>
          {/* lamp */}
          <circle cx="280" cy="400" r="22" fill="#f5c878" opacity="0.9"/>
          <circle cx="280" cy="400" r="50" fill="#f5c878" opacity="0.18"/>
          <rect x="276" y="420" width="8" height="20" fill="#0a0706"/>
          {/* wainscoting */}
          <line x1="0" y1="520" x2="1000" y2="520" stroke="#0a0706" strokeWidth="1" opacity="0.6"/>
        </svg>
      ),
    },
    water: {
      // blue-green underwater, light caustics
      bg: "linear-gradient(180deg, #04141a 0%, #0a2a3a 35%, #124a5a 65%, #2a7a8a 100%)",
      silhouette: (
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {/* caustic light streaks */}
          <g opacity="0.28" style={{ transform: `translateX(${drift}px)` }}>
            <path d="M100,0 L80,200 L140,200 L160,0 Z" fill="#9fe5ef"/>
            <path d="M340,0 L310,250 L370,250 L400,0 Z" fill="#9fe5ef"/>
            <path d="M600,0 L580,220 L640,220 L660,0 Z" fill="#9fe5ef"/>
            <path d="M820,0 L790,260 L860,260 L890,0 Z" fill="#9fe5ef"/>
          </g>
          {/* surface ripple */}
          <path d="M0,80 Q250,60 500,80 T1000,80" stroke="#9fe5ef" strokeWidth="1" fill="none" opacity="0.4"/>
          <path d="M0,110 Q250,90 500,110 T1000,110" stroke="#9fe5ef" strokeWidth="1" fill="none" opacity="0.25"/>
          {/* seabed */}
          <path d="M0,510 Q250,490 500,505 T1000,500 L1000,600 L0,600 Z" fill="#041018" opacity="0.95"/>
          {/* diving figure silhouette */}
          <g fill="#041018" opacity="0.9">
            <ellipse cx="560" cy="340" rx="10" ry="6"/>
            <path d="M554,346 Q556,390 540,420 Q552,424 562,418 Q570,390 566,346 Z"/>
            <path d="M550,350 L510,365 L514,372 L552,358 Z"/>
          </g>
        </svg>
      ),
    },
  };
  const s = scenes[scene] || scenes.cathedral;
  return (
    <div style={{ position: "absolute", inset: 0, background: s.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${kbScale}) translate(${kbX}px, ${kbY}px)`, transformOrigin: "center", willChange: "transform" }}>
        {s.silhouette}
      </div>
      {/* letterbox bars for cinematic feel */}
      {!mini && <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 28, background: "#000" }}/>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 28, background: "#000" }}/>
      </>}
      {/* grain — offset shifts every frame when playing for live noise */}
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: mini ? 0.15 : 0.22,
        backgroundPosition: `${grainX}px ${grainY}px`,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.85'/%3E%3C/svg%3E\")" }}/>
      {/* subtle vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }}/>
    </div>
  );
}

// Hero reel: a "film strip" of placeholder frames that slowly pans.
function HeroReel({ mono, accent, dim, fg, modeTab }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf; const start = performance.now();
    const tick = (now) => { setT((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const offset = (t * 18) % 260;
  if (modeTab === "interactive") {
    // interactive view: a terminal-y grid of tiles
    return (
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gap: 1, background: "#222" }}>
        {Array.from({length: 24}).map((_, i) => (
          <div key={i} style={{
            background: i === 8 ? accent : `oklch(${0.14 + (i%5)*0.02} 0.02 ${220 + i*6})`,
            position: "relative", overflow: "hidden",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.5)",
            padding: 10, letterSpacing: 1,
          }}>
            {`NC·${String(i+1).padStart(3,"0")}`}
            {i === 8 && <div style={{position:"absolute", bottom: 10, left: 10, color: "#fff", fontWeight: 500}}>HOVER</div>}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", transform: `translateX(-${offset}px)` }}>
        {[...WORKS, ...WORKS].map((w, i) => (
          <div key={i} style={{ width: 260, height: "100%", flexShrink: 0, position: "relative", borderRight: `1px solid rgba(255,255,255,0.06)` }}>
            <PlaceholderCard code={w.code} title={w.title} seed={i} dark />
          </div>
        ))}
      </div>
      {/* vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)" }}/>
    </div>
  );
}

// Hover preview card for the work ledger — gives a "playing" feel via the
// CinematicStill Ken-Burns mode plus a ticking timecode/progress bar.
function HoverPreview({ w, fg, dim, accent, display, mono }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => { setT((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [w.id]);
  // Parse runtime mm:ss; fallback to a fake 30s for items without one
  const parts = (w.runtime || "").split(":").map(n => parseInt(n, 10));
  const total = parts.length === 2 && !isNaN(parts[0]) ? parts[0] * 60 + parts[1] : 30;
  const elapsed = Math.min(t, total);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(Math.floor(elapsed % 60)).padStart(2, "0");
  const pct = (elapsed / total) * 100;
  const hasRuntime = w.runtime && w.runtime !== "—";

  return (
    <div style={{
      position: "absolute", right: 8, top: -8, width: 320, zIndex: 12,
      boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
      pointerEvents: "none", background: "#0f0f0f",
    }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
        <CinematicStill scene={w.scene} accent={accent} playing/>
        {/* live badge */}
        <div style={{ position: "absolute", left: 10, top: 10, ...mono, fontSize: 9, letterSpacing: 1.5, color: accent, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: accent, animation: "ncPulse 1.2s ease-in-out infinite" }}/>
          AUTOPLAY
        </div>
        {/* timecode bottom-right */}
        {hasRuntime && (
          <div style={{ position: "absolute", right: 10, bottom: 10, ...mono, fontSize: 9, letterSpacing: 1, color: "rgba(255,255,255,0.8)" }}>
            {mm}:{ss} / {w.runtime}
          </div>
        )}
        {/* progress bar */}
        {hasRuntime && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "rgba(255,255,255,0.15)" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: accent, transition: "width .1s linear" }}/>
          </div>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 9, color: dim, letterSpacing: 1.5, marginBottom: 6 }}>
          <span>{w.code} · {w.cat.toUpperCase()}</span>
          <span style={{ color: accent }}>VIEW →</span>
        </div>
        <div style={{ ...display, fontSize: 16, color: fg, textTransform: "uppercase", lineHeight: 1.05, marginBottom: 6 }}>
          {w.title}
        </div>
        <div style={{ fontSize: 11, color: dim, lineHeight: 1.45 }}>{w.note}</div>
      </div>
      <style>{"@keyframes ncPulse{0%,100%{opacity:.4}50%{opacity:1}}"}</style>
    </div>
  );
}

// ─── work ─────────────────────────────────────────────────────
function PageWork({ works, cat, setCat, hovered, setHovered, fg, dim, hairline, accent, display, mono }) {
  return (
    <div style={{ position: "absolute", inset: 0, padding: "32px 28px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 8 }}>§ 02 / SELECTED WORK</div>
          <div style={{ ...display, fontSize: 72, color: fg, textTransform: "uppercase" }}>
            Ledger <span style={{ color: dim }}>·</span> {String(works.length).padStart(2,"0")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              background: cat === c ? fg : "transparent", color: cat === c ? "#0a0a0a" : dim,
              border: `1px solid ${cat === c ? fg : hairline}`,
              ...mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
              padding: "6px 12px", cursor: "pointer",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* table-style list */}
      <div style={{ borderTop: `1px solid ${hairline}`, position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px 80px 60px", padding: "8px 4px", ...mono, fontSize: 9, letterSpacing: 1.5, color: dim, textTransform: "uppercase", borderBottom: `1px solid ${hairline}` }}>
          <div>ref</div><div>project</div><div>client</div><div>category</div><div>year</div><div>rt</div>
        </div>
        {works.map(w => {
          const isHover = hovered === w.id;
          return (
            <div key={w.id}
              onMouseEnter={() => setHovered(w.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px 80px 60px",
                padding: "18px 4px", borderBottom: `1px solid ${hairline}`,
                alignItems: "center", position: "relative",
                transition: "background .12s",
              }}>
              {/* row background still — fades L→R, sits behind columns */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
                WebkitMaskImage: "linear-gradient(to right, #000 0%, #000 28%, rgba(0,0,0,0.55) 48%, transparent 72%)",
                maskImage: "linear-gradient(to right, #000 0%, #000 28%, rgba(0,0,0,0.55) 48%, transparent 72%)",
                opacity: isHover ? 0.82 : 0.32,
                transition: "opacity .25s",
              }}>
                <div style={{ position: "absolute", inset: 0, transform: isHover ? "scale(1.04)" : "scale(1)", transition: "transform .4s ease" }}>
                  <CinematicStill scene={w.scene} accent={accent} mini/>
                </div>
              </div>

              <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 1, position: "relative" }}>{w.code}</div>
              <div style={{ ...display, fontSize: 28, color: isHover ? accent : fg, textTransform: "uppercase", transition: "color .12s", position: "relative",
                textShadow: isHover ? "0 1px 12px rgba(0,0,0,0.6)" : "none" }}>
                {w.title}
              </div>
              <div style={{ fontSize: 13, color: fg, position: "relative" }}>{w.client}</div>
              <div style={{ ...mono, fontSize: 10, color: dim, textTransform: "uppercase", letterSpacing: 1, position: "relative" }}>{w.cat}</div>
              <div style={{ ...mono, fontSize: 10, color: dim, position: "relative" }}>{w.year}</div>
              <div style={{ ...mono, fontSize: 10, color: dim, textAlign: "right", position: "relative" }}>{w.runtime}</div>

              {/* hover preview card — autoplaying scene + ticking timecode */}
              {isHover && (
                <HoverPreview w={w} fg={fg} dim={dim} accent={accent} display={display} mono={mono}/>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── services ─────────────────────────────────────────────────
function ServiceCard({ s, i, fg, dim, accent, display, mono }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "#0a0a0a", padding: "32px 28px", position: "relative", minHeight: 240, overflow: "hidden", cursor: "pointer" }}
    >
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        WebkitMaskImage: "linear-gradient(to left, #000 0%, rgba(0,0,0,0.7) 35%, transparent 75%)",
        maskImage: "linear-gradient(to left, #000 0%, rgba(0,0,0,0.7) 35%, transparent 75%)",
        opacity: hover ? 0.55 : 0.26,
        transition: "opacity .3s",
      }}>
        <div style={{ position: "absolute", inset: 0, transform: hover ? "scale(1.03)" : "scale(1)", transition: "transform .5s ease" }}>
          <CinematicStill scene={s.scene} accent={accent} mini/>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: accent, letterSpacing: 2 }}>{s.n}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: dim, letterSpacing: 1.5 }}>/ {i < SERVICES.length-1 ? "NEXT →" : "— END"}</div>
        </div>
        <div style={{ ...display, fontSize: 52, color: fg, textTransform: "uppercase", marginBottom: 20, textShadow: hover ? "0 1px 14px rgba(0,0,0,0.7)" : "none", transition: "text-shadow .25s" }}>{s.label}</div>
        <div style={{ fontSize: 14, color: dim, lineHeight: 1.55, maxWidth: 420 }}>{s.body}</div>
      </div>
    </div>
  );
}

function PageServices({ fg, dim, hairline, accent, display, mono }) {
  return (
    <div style={{ position: "absolute", inset: 0, padding: "32px 28px", overflow: "auto" }}>
      <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 8 }}>§ 03 / WHAT WE DO</div>
      <div style={{ ...display, fontSize: 88, color: fg, textTransform: "uppercase", marginBottom: 44, maxWidth: "80%" }}>
        Four practices. <span style={{ color: dim }}>One</span> room.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: hairline }}>
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.n} s={s} i={i} fg={fg} dim={dim} accent={accent} display={display} mono={mono}/>
        ))}
      </div>

      <div style={{ marginTop: 40, padding: "24px 0", borderTop: `1px solid ${hairline}`, borderBottom: `1px solid ${hairline}`, display: "flex", justifyContent: "space-between", ...mono, fontSize: 11, color: dim, letterSpacing: 1 }}>
        <span>RATES ON REQUEST</span>
        <span>NDA · IF YOU NEED ONE, WE HAVE ONE</span>
        <span>TAKING BRIEFS Q3 / 26 →</span>
      </div>
    </div>
  );
}

// ─── about ────────────────────────────────────────────────────
function PageAbout({ fg, dim, hairline, accent, display, mono }) {
  return (
    <div style={{ position: "absolute", inset: 0, padding: "32px 28px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40 }}>
      <div>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 8 }}>§ 04 / COLOPHON</div>
        <div style={{ ...display, fontSize: 84, color: fg, textTransform: "uppercase", lineHeight: 0.9 }}>
          We make <span style={{ color: accent }}>less</span>,<br/>
          <span style={{ color: dim }}>on purpose.</span>
        </div>
        <div style={{ fontSize: 15, color: fg, lineHeight: 1.6, marginTop: 32, maxWidth: 520, fontFamily: "'Instrument Serif', serif" }}>
          Named after HTTP 204 — a response that returns nothing. A joke about
          studios that deliver exactly that, and a promise that we won't.
          We work slowly, in small numbers, on long projects.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 48, maxWidth: 560 }}>
          {[
            ["People on payroll", "05"],
            ["Briefs per year", "≤ 12"],
            ["Years in practice", "09"],
          ].map(([k,v]) => (
            <div key={k}>
              <div style={{ ...display, fontSize: 44, color: fg }}>{v}</div>
              <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 1.5, marginTop: 6 }}>{k.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderLeft: `1px solid ${hairline}`, paddingLeft: 32 }}>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 16 }}>/ THE ROOM</div>
        {[
          ["A. Valverde", "Director"],
          ["M. Koba", "Motion lead"],
          ["J. Lindgren", "Type & print"],
          ["R. Osei", "Interaction"],
          ["F. Marín", "Studio ops"],
        ].map(([n, r], i) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${hairline}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <div style={{ ...mono, fontSize: 10, color: dim }}>{String(i+1).padStart(2,"0")}</div>
              <div style={{ fontSize: 16, color: fg, fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}>{n}</div>
            </div>
            <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 1.5, textTransform: "uppercase" }}>{r}</div>
          </div>
        ))}
        <div style={{ marginTop: 32, padding: 20, background: "rgba(201,68,43,0.08)", border: `1px solid rgba(201,68,43,0.35)` }}>
          <div style={{ ...mono, fontSize: 10, color: accent, letterSpacing: 2, marginBottom: 10 }}>/ NOW HIRING</div>
          <div style={{ fontSize: 14, color: fg, lineHeight: 1.5 }}>
            Mid-weight motion designer, part-time, Lisbon or remote CET.
            Films and resumes to <span style={{ color: accent }}>room@204.nc</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── contact ──────────────────────────────────────────────────
function PageContact({ fg, dim, hairline, accent, display, mono }) {
  const [brief, setBrief] = React.useState({ name: "", org: "", budget: "", scope: "" });
  const [sent, setSent] = React.useState(false);

  return (
    <div style={{ position: "absolute", inset: 0, padding: "32px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
      <div>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 8 }}>§ 05 / WRITE TO US</div>
        <div style={{ ...display, fontSize: 100, color: fg, textTransform: "uppercase", lineHeight: 0.88 }}>
          Send a <span style={{ color: accent }}>brief</span>,<br/>
          not a <span style={{ color: dim }}>form.</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 14, color: fg, lineHeight: 1.7, fontFamily: "'Instrument Serif', serif", maxWidth: 440 }}>
          The fastest way to start a conversation is a three-line email:
          who you are, what you're making, and when you need it by. We read
          everything and reply within two working days.
        </div>

        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px 20px", ...mono, fontSize: 12 }}>
          <div style={{ color: dim, letterSpacing: 1 }}>EMAIL</div>
          <div style={{ color: fg }}>room@204.nc</div>
          <div style={{ color: dim, letterSpacing: 1 }}>STUDIO</div>
          <div style={{ color: fg }}>Rua da Rosa 204, Lisboa 1200-385</div>
          <div style={{ color: dim, letterSpacing: 1 }}>INSTAGRAM</div>
          <div style={{ color: fg }}>@204.nocontent</div>
          <div style={{ color: dim, letterSpacing: 1 }}>ARE.NA</div>
          <div style={{ color: fg }}>are.na/204-nocontent</div>
        </div>
      </div>

      <div style={{ border: `1px solid ${hairline}`, padding: 28, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 20 }}>/ BRIEF INTAKE · v02</div>
        {sent ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div style={{ ...mono, fontSize: 11, color: accent, letterSpacing: 2, marginBottom: 12 }}>● RECEIVED</div>
            <div style={{ ...display, fontSize: 40, color: fg, textTransform: "uppercase", marginBottom: 14 }}>
              Thank you.
            </div>
            <div style={{ fontSize: 13, color: dim }}>We'll read it today and reply by {new Date(Date.now()+2*86400000).toDateString().slice(4)}.</div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            {[
              ["name", "Name"],
              ["org", "Organisation"],
            ].map(([k, l]) => (
              <label key={k} style={{ display: "block", marginBottom: 16 }}>
                <div style={{ ...mono, fontSize: 9, color: dim, letterSpacing: 2, marginBottom: 6 }}>{l.toUpperCase()}</div>
                <input value={brief[k]} onChange={(e) => setBrief({...brief, [k]: e.target.value})}
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${hairline}`,
                    color: fg, fontSize: 15, padding: "8px 0", outline: "none", fontFamily: "inherit" }}/>
              </label>
            ))}
            <label style={{ display: "block", marginBottom: 16 }}>
              <div style={{ ...mono, fontSize: 9, color: dim, letterSpacing: 2, marginBottom: 8 }}>BUDGET RANGE</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["< 25k", "25–75k", "75–200k", "200k+", "trade"].map(b => (
                  <button type="button" key={b} onClick={() => setBrief({...brief, budget: b})}
                    style={{ background: brief.budget === b ? fg : "transparent", color: brief.budget === b ? "#0a0a0a" : dim,
                      border: `1px solid ${brief.budget === b ? fg : hairline}`, ...mono, fontSize: 10, letterSpacing: 1,
                      padding: "6px 12px", cursor: "pointer" }}>{b}</button>
                ))}
              </div>
            </label>
            <label style={{ display: "block", marginBottom: 20 }}>
              <div style={{ ...mono, fontSize: 9, color: dim, letterSpacing: 2, marginBottom: 6 }}>THE THREE LINES</div>
              <textarea value={brief.scope} onChange={(e) => setBrief({...brief, scope: e.target.value})} rows={5}
                placeholder="who you are · what you're making · when you need it"
                style={{ width: "100%", background: "transparent", border: `1px solid ${hairline}`, color: fg, fontSize: 13,
                  padding: 12, outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box" }}/>
            </label>
            <button type="submit" style={{
              width: "100%", background: accent, color: "#0a0a0a", border: "none",
              ...mono, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              padding: "14px 0", cursor: "pointer",
            }}>→ Send Brief</button>
          </form>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { DirectionA });
