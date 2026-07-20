// direction-b.jsx — "ARCHIVE"
// Light, editorial, Swiss-ish grid. Serif+mono duet. A quieter take.
// Same 5 pages: home / work / services / about / contact

function DirectionB({ width = 1280, height = 820 }) {
  const [page, setPage] = React.useState("home");
  const [cat, setCat] = React.useState("all");
  const [hovered, setHovered] = React.useState(null);

  const bg = "#f3f1ec";
  const ink = "#141414";
  const paper = "#faf8f3";
  const rule = "rgba(20,20,20,0.14)";
  const dim = "rgba(20,20,20,0.55)";
  const accent = "#c9442b";

  const serif = { fontFamily: "'Instrument Serif', serif" };
  const mono = { fontFamily: "'JetBrains Mono', monospace" };
  const sans = { fontFamily: "'Space Grotesk', sans-serif" };

  const filtered = cat === "all" ? WORKS : WORKS.filter(w => w.cat === cat);

  return (
    <div data-screen-label={`B · ${page}`} style={{
      position: "relative", width, height, background: bg, color: ink,
      ...sans, overflow: "hidden",
    }}>
      {/* paper tone overlay */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.35,
        backgroundImage: "radial-gradient(ellipse at 20% 10%, rgba(0,0,0,0.04), transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(0,0,0,0.03), transparent 60%)"}}/>

      <NavB page={page} setPage={setPage} ink={ink} dim={dim} rule={rule} accent={accent} mono={mono} serif={serif} />

      <div style={{ position: "absolute", top: 72, left: 0, right: 0, bottom: 0 }}>
        {page === "home" && <HomeB setPage={setPage} ink={ink} dim={dim} rule={rule} accent={accent} paper={paper} mono={mono} serif={serif} />}
        {page === "work" && <WorkB works={filtered} cat={cat} setCat={setCat} hovered={hovered} setHovered={setHovered} ink={ink} dim={dim} rule={rule} accent={accent} mono={mono} serif={serif} />}
        {page === "services" && <ServicesB ink={ink} dim={dim} rule={rule} accent={accent} paper={paper} mono={mono} serif={serif} />}
        {page === "about" && <AboutB ink={ink} dim={dim} rule={rule} accent={accent} paper={paper} mono={mono} serif={serif} />}
        {page === "contact" && <ContactB ink={ink} dim={dim} rule={rule} accent={accent} paper={paper} mono={mono} serif={serif} />}
      </div>
    </div>
  );
}

function NavB({ page, setPage, ink, dim, rule, accent, mono, serif }) {
  const items = [
    { id: "home", n: "00", label: "Index" },
    { id: "work", n: "01", label: "Work" },
    { id: "services", n: "02", label: "Services" },
    { id: "about", n: "03", label: "About" },
    { id: "contact", n: "04", label: "Contact" },
  ];
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 72, zIndex: 20,
      display: "grid", gridTemplateColumns: "240px 1fr 240px",
      alignItems: "center", padding: "0 36px",
      borderBottom: `1px solid ${rule}`,
    }}>
      <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ ...serif, fontSize: 36, lineHeight: 1, fontStyle: "italic" }}>204</div>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2 }}>/ NO-CONTENT</div>
      </div>

      {/* center numbered nav */}
      <div style={{ display: "flex", justifyContent: "center", gap: 0 }}>
        {items.map(it => {
          const active = page === it.id;
          return (
            <button key={it.id} onClick={() => setPage(it.id)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: "8px 18px", position: "relative", display: "flex", alignItems: "baseline", gap: 6,
            }}>
              <span style={{ ...mono, fontSize: 9, color: dim, letterSpacing: 1 }}>§{it.n}</span>
              <span style={{ ...serif, fontSize: 20, color: ink, fontStyle: active ? "italic" : "normal" }}>
                {it.label}
              </span>
              {active && <span style={{ position: "absolute", left: 18, right: 18, bottom: 2, height: 1, background: accent }}/>}
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: "right", ...mono, fontSize: 10, color: dim, letterSpacing: 1, lineHeight: 1.4 }}>
        <div>ISSUE Nº 09 · SPRING '26</div>
        <div>LISBOA <span style={{ color: accent }}>●</span> BOOKING Q3</div>
      </div>
    </div>
  );
}

// ─── home B ───────────────────────────────────────────────────
function HomeB({ setPage, ink, dim, rule, accent, paper, mono, serif }) {
  const [idx, setIdx] = React.useState(0);
  const feat = WORKS[idx];
  React.useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % 4), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1.1fr", padding: "32px 36px" }}>
      {/* left: editorial masthead */}
      <div style={{ padding: "12px 32px 0 0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 10, color: dim, letterSpacing: 1.5, marginBottom: 24 }}>
            <span>VOL. 09 / SPRING MMXXVI</span>
            <span>204 · NO-CONTENT</span>
          </div>
          <div style={{ ...serif, fontSize: 126, lineHeight: 0.92, letterSpacing: -2, color: ink }}>
            Slow<br/>
            <em style={{ color: accent }}>studio</em>,<br/>
            long<br/>
            signal.
          </div>
          <div style={{ marginTop: 28, fontSize: 15, color: ink, lineHeight: 1.6, maxWidth: 420, columnCount: 2, columnGap: 24 }}>
            204 is a five-person practice in Lisbon. We make marks, motion
            and reading tools for people who intend their output to survive
            a quarter, at minimum. No logos per hour. No content by the yard.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          <button onClick={() => setPage("work")} style={{
            background: ink, color: paper, border: "none", padding: "14px 22px", cursor: "pointer",
            ...mono, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
          }}>Read the ledger →</button>
          <button onClick={() => setPage("contact")} style={{
            background: "transparent", color: ink, border: `1px solid ${ink}`, padding: "14px 22px", cursor: "pointer",
            ...mono, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
          }}>Send a brief</button>
        </div>
      </div>

      {/* right: featured column */}
      <div style={{ borderLeft: `1px solid ${rule}`, paddingLeft: 32, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 10, color: dim, letterSpacing: 1.5, marginBottom: 20 }}>
          <span>/ FEATURED · NO. {String(idx+1).padStart(2,"0")} OF 04</span>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({length: 4}).map((_,i) => (
              <span key={i} style={{ width: 18, height: 2, background: i === idx ? accent : rule }}/>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", marginBottom: 20, overflow: "hidden" }}>
          <PlaceholderCard code={feat.code} title={feat.title} seed={idx} dark={false}/>
        </div>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 1.5, marginBottom: 10 }}>
          {feat.code} · {feat.cat.toUpperCase()} · {feat.year}
        </div>
        <div style={{ ...serif, fontSize: 52, lineHeight: 1, color: ink }}>
          {feat.title}
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: dim, fontStyle: "italic", ...serif }}>
          for {feat.client}
        </div>
        <div style={{ marginTop: 18, fontSize: 14, color: ink, lineHeight: 1.55, maxWidth: 520 }}>
          {feat.note}
        </div>
      </div>
    </div>
  );
}

// ─── work B ──────────────────────────────────────────────────
function WorkB({ works, cat, setCat, hovered, setHovered, ink, dim, rule, accent, mono, serif }) {
  return (
    <div style={{ position: "absolute", inset: 0, padding: "32px 36px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 6 }}>§ 01 / THE LEDGER</div>
          <div style={{ ...serif, fontSize: 76, lineHeight: 1, color: ink }}>
            Everything,<br/><em>every year.</em>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, background: "rgba(0,0,0,0.04)", padding: 3 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              background: cat === c ? ink : "transparent", color: cat === c ? "#f3f1ec" : dim,
              border: "none", ...mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
              padding: "6px 12px", cursor: "pointer",
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 20 }}>
        {works.map((w, i) => {
          const isHover = hovered === w.id;
          return (
            <div key={w.id}
              onMouseEnter={() => setHovered(w.id)} onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer", transition: "transform .25s", transform: isHover ? "translateY(-4px)" : "none" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden",
                boxShadow: isHover ? "0 14px 30px rgba(0,0,0,0.15)" : "0 1px 2px rgba(0,0,0,0.06)",
                transition: "box-shadow .2s",
              }}>
                <PlaceholderCard code={w.code} title={w.title} seed={i} dark={i % 2 === 0}/>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, ...mono, fontSize: 9, color: dim, letterSpacing: 1.5 }}>
                <span>{w.code}</span><span>{w.cat.toUpperCase()} · {w.year}</span>
              </div>
              <div style={{ ...serif, fontSize: 26, lineHeight: 1.1, color: isHover ? accent : ink, transition: "color .15s", marginTop: 6 }}>
                {w.title}
              </div>
              <div style={{ ...serif, fontStyle: "italic", fontSize: 14, color: dim, marginTop: 2 }}>
                for {w.client}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── services B ──────────────────────────────────────────────
function ServicesB({ ink, dim, rule, accent, paper, mono, serif }) {
  const [open, setOpen] = React.useState("01");
  return (
    <div style={{ position: "absolute", inset: 0, padding: "32px 36px", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 36 }}>
      <div>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 6 }}>§ 02 / CAPABILITIES</div>
        <div style={{ ...serif, fontSize: 84, lineHeight: 0.95, color: ink }}>
          Four<br/>practices,<br/><em>one room.</em>
        </div>
        <div style={{ marginTop: 28, fontSize: 15, color: ink, lineHeight: 1.6, maxWidth: 440 }}>
          We run four overlapping practices under one roof. Every project
          is owned by a single person and reviewed by the rest of the room
          on Fridays.
        </div>

        <div style={{ marginTop: 36 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, ...mono, fontSize: 10, color: dim, letterSpacing: 1.5, padding: "6px 0", borderBottom: `1px solid ${rule}` }}>
            <span>§</span><span>PRACTICE</span><span>LEAD</span>
          </div>
          {[
            ["01", "Direction", "Valverde"],
            ["02", "Motion & Film", "Koba"],
            ["03", "Identity", "Lindgren"],
            ["04", "Interaction", "Osei"],
          ].map(([n, l, p]) => (
            <div key={n} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, padding: "14px 0", borderBottom: `1px solid ${rule}`, alignItems: "baseline" }}>
              <span style={{ ...mono, fontSize: 11, color: dim }}>{n}</span>
              <span style={{ ...serif, fontSize: 24, color: ink }}>{l}</span>
              <span style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 1 }}>{p.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: paper, border: `1px solid ${rule}`, padding: 28 }}>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 16 }}>/ READ MORE</div>
        {SERVICES.map(s => {
          const isOpen = open === s.n;
          return (
            <div key={s.n} onClick={() => setOpen(isOpen ? null : s.n)}
              style={{ borderBottom: `1px solid ${rule}`, padding: "18px 0", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                  <span style={{ ...mono, fontSize: 11, color: accent, letterSpacing: 1 }}>{s.n}</span>
                  <span style={{ ...serif, fontSize: 32, fontStyle: isOpen ? "italic" : "normal", color: ink }}>
                    {s.label}
                  </span>
                </div>
                <span style={{ ...mono, fontSize: 14, color: dim }}>{isOpen ? "−" : "+"}</span>
              </div>
              {isOpen && (
                <div style={{ fontSize: 14, color: ink, lineHeight: 1.65, marginTop: 14, maxWidth: 500 }}>
                  {s.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── about B ─────────────────────────────────────────────────
function AboutB({ ink, dim, rule, accent, paper, mono, serif }) {
  return (
    <div style={{ position: "absolute", inset: 0, padding: "32px 36px", display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 40 }}>
      <div>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 6 }}>§ 03 / COLOPHON</div>
        <div style={{ ...serif, fontSize: 90, lineHeight: 0.95, color: ink }}>
          We make<br/><em style={{ color: accent }}>less</em>, on<br/>purpose.
        </div>
        <div style={{ marginTop: 28, fontSize: 16, lineHeight: 1.65, color: ink, maxWidth: 520, ...serif }}>
          Named after HTTP <span style={{ color: accent }}>204</span> — a
          response that returns nothing. A joke about studios that deliver
          exactly that. And a promise that we won't.
          <br/><br/>
          We work slowly, in small numbers, on long projects. If you need a
          deck by Friday, we probably aren't the room. If you need a mark
          that will still feel right at the end of the decade, we might be.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, marginTop: 48, maxWidth: 560 }}>
          {[
            ["On payroll", "05"],
            ["Briefs / yr", "≤ 12"],
            ["Years open", "09"],
          ].map(([k,v]) => (
            <div key={k} style={{ borderTop: `1px solid ${ink}`, paddingTop: 10 }}>
              <div style={{ ...serif, fontSize: 56, lineHeight: 1, color: ink }}>{v}</div>
              <div style={{ ...mono, fontSize: 9, color: dim, letterSpacing: 1.5, marginTop: 6 }}>{k.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 16 }}>/ THE ROOM · V</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: rule }}>
          {[
            ["A. Valverde", "Director", "VAL"],
            ["M. Koba", "Motion lead", "KOB"],
            ["J. Lindgren", "Type & print", "LIN"],
            ["R. Osei", "Interaction", "OSE"],
          ].map(([n, r, ini]) => (
            <div key={n} style={{ background: paper, padding: "22px 20px", minHeight: 140 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: ink, color: paper, display: "flex", alignItems: "center", justifyContent: "center",
                ...mono, fontSize: 11, letterSpacing: 1 }}>{ini}</div>
              <div style={{ ...serif, fontSize: 20, color: ink, marginTop: 14, fontStyle: "italic" }}>{n}</div>
              <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 1.5, marginTop: 2, textTransform: "uppercase" }}>{r}</div>
            </div>
          ))}
          <div style={{ background: accent, color: "#faf8f3", padding: "22px 20px", minHeight: 140, gridColumn: "span 2" }}>
            <div style={{ ...mono, fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>/ ONE CHAIR OPEN</div>
            <div style={{ ...serif, fontSize: 24, fontStyle: "italic", lineHeight: 1.2 }}>
              Mid-weight motion designer,<br/>part-time, Lisbon or CET.
            </div>
            <div style={{ ...mono, fontSize: 11, marginTop: 14, letterSpacing: 1 }}>→ room@204.nc</div>
          </div>
        </div>

        <div style={{ marginTop: 24, ...mono, fontSize: 10, color: dim, letterSpacing: 1.5, lineHeight: 1.6 }}>
          <div style={{ borderTop: `1px solid ${rule}`, paddingTop: 12 }}>COLOPHON</div>
          <div style={{ marginTop: 6, color: ink }}>
            Set in Instrument Serif, Space Grotesk & JetBrains Mono.<br/>
            Printed on Munken Pure 120gsm. Bound by Guerra, Porto.<br/>
            Runs of 400; no more are planned.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── contact B ───────────────────────────────────────────────
function ContactB({ ink, dim, rule, accent, paper, mono, serif }) {
  const [brief, setBrief] = React.useState({ name: "", org: "", budget: "", scope: "" });
  const [sent, setSent] = React.useState(false);
  return (
    <div style={{ position: "absolute", inset: 0, padding: "32px 36px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48 }}>
      <div>
        <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 6 }}>§ 04 / CORRESPONDENCE</div>
        <div style={{ ...serif, fontSize: 104, lineHeight: 0.9, color: ink }}>
          Write us<br/>a <em style={{ color: accent }}>letter</em>.
        </div>
        <div style={{ marginTop: 28, fontSize: 16, lineHeight: 1.7, color: ink, maxWidth: 500, ...serif }}>
          Three lines is enough. <em>Who you are, what you're making,
          when you need it by.</em> Anything longer is welcome; anything
          shorter is also welcome.
        </div>

        <div style={{ marginTop: 40, borderTop: `1px solid ${ink}`, paddingTop: 20 }}>
          {[
            ["Email", "room@204.nc"],
            ["Studio", "Rua da Rosa 204, Lisboa"],
            ["Are.na", "are.na/204-nocontent"],
            ["Instagram", "@204.nocontent"],
          ].map(([k,v]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "140px 1fr", padding: "12px 0", borderBottom: `1px solid ${rule}`, alignItems: "baseline" }}>
              <div style={{ ...mono, fontSize: 10, color: dim, letterSpacing: 1.5, textTransform: "uppercase" }}>{k}</div>
              <div style={{ ...serif, fontSize: 20, color: ink }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: paper, border: `1px solid ${rule}`, padding: 32, alignSelf: "start" }}>
        <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 10, color: dim, letterSpacing: 2, marginBottom: 20 }}>
          <span>/ BRIEF · FORM-204B</span><span>PAGE 01 / 01</span>
        </div>
        {sent ? (
          <div style={{ padding: "40px 0" }}>
            <div style={{ ...mono, fontSize: 10, color: accent, letterSpacing: 2, marginBottom: 12 }}>● RECEIVED</div>
            <div style={{ ...serif, fontSize: 48, color: ink, lineHeight: 1, marginBottom: 14 }}>
              Thank you,<br/><em>{brief.name || "friend"}.</em>
            </div>
            <div style={{ fontSize: 14, color: dim }}>We'll reply within two working days, usually faster.</div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            {[["name", "Your name"], ["org", "Organisation (optional)"]].map(([k,l]) => (
              <label key={k} style={{ display: "block", marginBottom: 18 }}>
                <div style={{ ...mono, fontSize: 9, color: dim, letterSpacing: 2, marginBottom: 6 }}>{l.toUpperCase()}</div>
                <input value={brief[k]} onChange={(e) => setBrief({...brief, [k]: e.target.value})}
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${ink}`,
                    color: ink, fontSize: 18, padding: "6px 0", outline: "none", ...serif, fontStyle: "italic" }}/>
              </label>
            ))}
            <div style={{ marginBottom: 18 }}>
              <div style={{ ...mono, fontSize: 9, color: dim, letterSpacing: 2, marginBottom: 8 }}>BUDGET RANGE</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["< 25k", "25–75k", "75–200k", "200k+", "trade"].map(b => (
                  <button type="button" key={b} onClick={() => setBrief({...brief, budget: b})}
                    style={{ background: brief.budget === b ? ink : "transparent", color: brief.budget === b ? paper : ink,
                      border: `1px solid ${ink}`, ...mono, fontSize: 10, letterSpacing: 1,
                      padding: "6px 12px", cursor: "pointer" }}>{b}</button>
                ))}
              </div>
            </div>
            <label style={{ display: "block", marginBottom: 22 }}>
              <div style={{ ...mono, fontSize: 9, color: dim, letterSpacing: 2, marginBottom: 6 }}>YOUR THREE LINES</div>
              <textarea value={brief.scope} onChange={(e) => setBrief({...brief, scope: e.target.value})} rows={5}
                placeholder="who · what · when"
                style={{ width: "100%", background: "transparent", border: `1px solid ${rule}`, color: ink, fontSize: 14,
                  padding: 12, outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }}/>
            </label>
            <button type="submit" style={{
              background: ink, color: paper, border: "none", width: "100%",
              ...mono, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
              padding: "14px 0", cursor: "pointer",
            }}>Post it →</button>
          </form>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { DirectionB });
