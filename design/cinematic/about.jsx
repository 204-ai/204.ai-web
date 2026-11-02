/* ============================================================
   ABOUT — colophon layout (two columns, makers roster)
   ============================================================ */
const MAKERS = [
  { id:'dimitri', n:'01', name:'Dimitri De Jonghe',  role:'Creative Technologist & Founder', init:'DD', img:'assets/mk-dimitri.png', ig:'https://www.instagram.com/dimitridejonghe/', li:'https://www.linkedin.com/in/dimitridejonghe/', mail:'dimi@204.ai' },
  { id:'cintia',  n:'02', name:'Cintia Aguiar Pinto', role:'Creative Director & Founder',    init:'CA', img:'assets/mk-cintia.png',  ig:'https://www.instagram.com/cin_tiia_/', li:'https://www.linkedin.com/in/cintiaaguiarp/', mail:'cintia@204.ai' },
  { id:'cecilia', n:'03', name:'Cecilia Hübinette',   role:'Art Director & Co-Founder',      init:'CH', img:'assets/mk-cecilia.png', li:'https://www.linkedin.com/in/cecilia-hubinette-4734291a2/', mail:'cecilia@204.ai' },
  { id:'dan',     n:'04', name:'Dan Brown',           role:'AI Arts Director & Artist',      init:'DB', img:'assets/mk-dan.png',     li:'https://www.linkedin.com/in/dan-joseph-brown/', mail:'dan@204.ai' },
  { id:'laura',   n:'05', name:'Laura Coimbra',       role:'Marketing',                      init:'LC', img:'assets/mk-laura.png',   li:'https://www.linkedin.com/in/laurasgcoimbra/', mail:'laura@204.ai' },
  { id:'florian', n:'06', name:'Florian Hinze',       role:'Creative Engineer',              init:'FH', img:'assets/mk-florian.png', ig:'https://www.instagram.com/floflup/', li:'https://www.linkedin.com/in/florian-hinze/' },
];
window.MAKERS = MAKERS;

const PRACTICE = [
  { n:'01.', t:'Experience design',    d:'We understand your audience, objectives, and environment.' },
  { n:'02.', t:'System development',   d:'We define the experience mode, visual identity, and technical setup.' },
  { n:'03.', t:'Technical production', d:'We develop the AI models, interaction logic, and visual worlds.' },
  { n:'04.', t:'Strategic consulting', d:'We deploy, calibrate, and ensure seamless on-site performance.' },
];

function About({ onNav }) {
  return (
    <div className="page-fade">
      <section className="colophon">
        {/* LEFT */}
        <div className="col-left">
          <div className="sec-lab">§ 04 / colophon</div>
          <h1 className="colo-head">
            We build<br/>
            <em>worlds,</em><br/>
            <span className="dim">on<br/>purpose.</span>
          </h1>
          <p className="colo-lead">
            Named after HTTP 204 — a response that returns nothing. A joke about studios that deliver exactly
            that, and a promise that we won't. 204 is a creative technology studio working at the intersection of
            AI, motion, identity and live environments — translating <b>human ideas</b> into responsive worlds.
          </p>
          <div className="colo-stats">
            <div className="stat"><div className="fig">06</div><div className="cap">makers in the room</div></div>
            <div className="stat"><div className="fig">02</div><div className="cap">main pillars</div></div>
            <div className="stat"><div className="fig">31</div><div className="cap">projects shipped</div></div>
          </div>
          <div className="sec-lab practice-lab">/ worldbuilding in practice</div>
          <div className="practice">
            {PRACTICE.map(p => (
              <div key={p.n} className="prow2">
                <div className="n">{p.n}</div>
                <div className="txt">
                  <div className="t">{p.t}</div>
                  <div className="d">{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-right">
          <div className="sec-lab">/ the makers</div>
          <div className="makers">
            {MAKERS.map(m => (
              <div key={m.n} className="maker clickable" onClick={() => onNav('maker', { maker: m.id })}>
                <div className="n">{m.n}</div>
                <div className="shot" style={m.img ? { backgroundImage:`url(${m.img})` } : {}}>{m.img ? '' : m.init}</div>
                <div className="name">{m.name}</div>
                <div className="role">{m.role}</div>
                <div className="ar">→</div>
              </div>
            ))}
          </div>

          <div className="rna-card">
            <div className="lab">/ rna studio — our lab in lisbon</div>
            <p>
              A hybrid studio and cultural platform where ideas are developed, tested and exhibited —
              workshops, installations and collaborative projects. Write to <a href="mailto:hello@rna-studio.pt">hello@rna-studio.pt</a>
            </p>
            <a className="link" href="https://www.rna-studio.com/" target="_blank" rel="noreferrer">→ rna-studio.com</a>
          </div>
        </div>
      </section>

      <Footer onNav={onNav} />
    </div>
  );
}

window.About = About;
