/* ============================================================
   MAKER — individual maker page (prev/next roster nav)
   ============================================================ */
const IcoIG = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>);
const IcoIN = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 9h3v10.5h-3zM6 4a1.75 1.75 0 110 3.5A1.75 1.75 0 016 4zM10 9h2.9v1.5c.6-1 1.7-1.8 3.4-1.8 2.4 0 3.7 1.5 3.7 4.4v6.4h-3v-5.8c0-1.5-.6-2.3-1.8-2.3-1.3 0-2.2.9-2.2 2.5v5.6h-3z"/></svg>);
const IcoML = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/></svg>);

function MakerPage({ onNav, makerId }) {
  const roster = window.MAKERS || [];
  const i = Math.max(0, roster.findIndex(m => m.id === makerId));
  const m = roster[i] || roster[0];
  if (!m) return null;
  const prev = roster[(i - 1 + roster.length) % roster.length];
  const next = roster[(i + 1) % roster.length];

  return (
    <div className="page-fade">
      <section className="mk-page">
        <a className="sd-back" onClick={() => onNav('about')}>← about</a>
        <div className="sec-lab">/ the makers — {m.n}</div>
        <h1 className="mk-name">{m.name}</h1>
        <div className="mk-role">{m.role}</div>

        <div className="mk-body">
          <div className="mk-shot" style={m.img ? { backgroundImage:`url(${m.img})` } : {}}></div>
          <div className="mk-side">
            <div className="sec-lab">/ reach out</div>
            <div className="mk-links">
              {m.ig && <a href={m.ig} target="_blank" rel="noreferrer"><span className="ic"><IcoIG /></span>instagram</a>}
              {m.li && <a href={m.li} target="_blank" rel="noreferrer"><span className="ic"><IcoIN /></span>linkedin</a>}
              {m.mail && <a href={`mailto:${m.mail}`}><span className="ic"><IcoML /></span>email</a>}
            </div>
            {m.bio && <p className="mk-bio">{m.bio}</p>}
            <div className="mk-cta"><Pill onClick={() => onNav('contact')}>→ Work with us</Pill></div>
          </div>
        </div>

        <div className="mk-nav">
          <div className="side" onClick={() => onNav('maker', { maker: prev.id })}>
            <div className="lab">← prev</div>
            <div className="nm">{prev.name}</div>
          </div>
          <div className="side r" onClick={() => onNav('maker', { maker: next.id })}>
            <div className="lab">next →</div>
            <div className="nm">{next.name}</div>
          </div>
        </div>
      </section>

      <Footer onNav={onNav} />
    </div>
  );
}

window.MakerPage = MakerPage;
