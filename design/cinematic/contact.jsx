/* ============================================================
   CONTACT — brief intake
   ============================================================ */
const { useState: useStateC } = React;

const BUDGETS = ['< 25k', '25–75k', '75–200k', '200k+', 'trade'];

function Contact({ onNav }) {
  const [budget, setBudget] = useStateC(null);
  const [sent, setSent] = useStateC(false);
  const [f, setF] = useStateC({ name:'', org:'', email:'', brief:'' });
  const upd = (k) => (e) => setF(p => ({ ...p, [k]: e.target.value }));
  const send = () => {
    const body = [
      'Name: ' + f.name,
      'Organisation: ' + f.org,
      'Email: ' + f.email,
      'Budget: ' + (budget || '—'),
      '',
      f.brief,
    ].join('\n');
    window.location.href = 'mailto:hello@204.ai?subject=' +
      encodeURIComponent('New brief — ' + (f.org || f.name || 'via 204.ai')) +
      '&body=' + encodeURIComponent(body);
    setSent(true);
  };

  return (
    <div className="page-fade">
      <section className="contact2">
        <div className="c-left">
          <div className="sec-lab">§ 05 / write to us</div>
          <h1 className="c-head">
            Send a<br/><em>brief.</em>
          </h1>
          <p className="c-lead">
            The fastest way to start a conversation is a three-line email: who you are, what you're
            making, and when you need it by. <b>We read everything</b> and reply within two working days.
          </p>
          <div className="c-rows">
            <div className="row"><span className="k">email</span><a className="v" href="mailto:hello@204.ai">hello@204.ai</a></div>
            <div className="row"><span className="k">studio</span><a className="v" href="https://maps.app.goo.gl/j5V4zL4ehRgYzgnL9" target="_blank" rel="noreferrer">RnA Studio — R. Ferreira Lapa 12A, 1150-157 Lisboa, Portugal</a></div>
            <div className="row"><span className="k">instagram</span><a className="v" href="https://www.instagram.com/204nocontent.ai/" target="_blank" rel="noreferrer">@204nocontent.ai</a></div>
            <div className="row"><span className="k">linkedin</span><a className="v" href="https://www.linkedin.com/company/204-no-content/" target="_blank" rel="noreferrer">204-no-content</a></div>
          </div>
          <div className="sec-lab find">/ find us</div>
          <a className="c-map" href="https://maps.app.goo.gl/j5V4zL4ehRgYzgnL9" target="_blank" rel="noreferrer">
            <img className="mapimg" src="assets/rna-map.png" alt="RnA Studio — R. Ferreira Lapa 12A, Lisboa" />
            <span className="lbl">open in google maps · lisboa</span>
          </a>
        </div>

        <div className="c-right">
          <div className="intake">
            <div className="sec-lab">/ brief intake · v02</div>
            <label className="fld"><span>name</span><input type="text" value={f.name} onChange={upd('name')} /></label>
            <label className="fld"><span>organisation</span><input type="text" value={f.org} onChange={upd('org')} /></label>
            <label className="fld"><span>email — so we can get back to you</span><input type="email" value={f.email} onChange={upd('email')} /></label>
            <div className="fld">
              <span>budget range</span>
              <div className="chips">
                {BUDGETS.map(b => (
                  <button key={b} type="button" className={"chip" + (budget === b ? ' on' : '')} onClick={() => setBudget(b)}>{b}</button>
                ))}
              </div>
            </div>
            <label className="fld"><span>the three lines</span>
              <textarea rows="6" placeholder="who you are · what you're making · when you need it" value={f.brief} onChange={upd('brief')}></textarea>
            </label>
            <Pill wide solid onClick={send}>{sent ? '✓ brief sent to hello@204.ai' : '→ send brief'}</Pill>
            <div className="fine">protected by recaptcha · <a href="#">privacy</a> · <a href="#">terms</a></div>
          </div>
        </div>
      </section>

      <Footer onNav={onNav} />
    </div>
  );
}

window.Contact = Contact;
