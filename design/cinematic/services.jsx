/* ============================================================
   SERVICES PAGE — two pillars, one room
   ============================================================ */
function ServiceCard({ s, onNav }) {
  return (
    <div className="svc-tile" onClick={() => onNav('service', { service: s.id })}>
      <div className="img" style={{backgroundImage:`url(${s.img})`}}></div>
      <div className="scrim"></div>
      <div className="body">
        <div className="title">{s.title.split('\n').map((l,j,a)=><React.Fragment key={j}>{l}{j<a.length-1&&<br/>}</React.Fragment>)}</div>
        <div className="desc">{s.desc.split('\n').map((l,j,a)=><React.Fragment key={j}>{l}{j<a.length-1&&<br/>}</React.Fragment>)}</div>
      </div>
      <div className="arrow"><svg viewBox="0 0 24 24"><path d="M7 17 L17 7 M9 7 H17 V15"/></svg></div>
    </div>
  );
}

function ServicesPage({ onNav }) {
  const list = window.SERVICES || [];
  const content = list.filter(s => s.side === '.content');
  const interactive = list.filter(s => s.side === '.interactive');
  return (
    <div className="page-fade">
      <section className="svc-page">
        <h1>Two pillars.<br/>One room.</h1>
        <div className="svc-pillar">
          <div className="pillar-lab"><span className="pl">.content</span> <span className="pd">— cinematic work: campaigns, film &amp; image</span></div>
          <div className="svc-grid">
            {content.map(s => <ServiceCard key={s.id} s={s} onNav={onNav} />)}
          </div>
        </div>
        <div className="svc-pillar">
          <div className="pillar-lab"><span className="pl">.interactive</span> <span className="pd">— installations, mirrors &amp; responsive environments</span></div>
          <div className="svc-grid">
            {interactive.map(s => <ServiceCard key={s.id} s={s} onNav={onNav} />)}
          </div>
        </div>
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
          <div className="lab">// let's chat</div>
          <h2>Let's bring your<br/>story to life</h2>
          <Pill solid onClick={() => onNav('contact')}>Start your project</Pill>
        </div>
      </section>

      <Footer onNav={onNav} />
    </div>
  );
}

window.ServicesPage = ServicesPage;
