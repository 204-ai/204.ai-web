/* ============================================================
   APP — single unified site router (home / services / work /
   about / contact). No landing door, no mode split.
   ============================================================ */
const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [page, setPage] = useStateApp('home');
  const [transitioning, setTransitioning] = useStateApp(false);
  const [portfolioFilter, setPortfolioFilter] = useStateApp('All');
  const [workId, setWorkId] = useStateApp('rubr');
  const [serviceId, setServiceId] = useStateApp('branded');
  const [makerId, setMakerId] = useStateApp('dimitri');

  useEffectApp(() => { document.body.classList.add('mode-content'); }, []);

  const navigate = (target, opts) => {
    // Services is its own page now
    if (target === page && !opts) return;
    if (opts && opts.filter) setPortfolioFilter(opts.filter);
    if (opts && opts.work) setWorkId(opts.work);
    if (opts && opts.service) setServiceId(opts.service);
    if (opts && opts.maker) setMakerId(opts.maker);
    setTransitioning(true);
    setTimeout(() => {
      setPage(target);
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(() => setTransitioning(false), 60);
    }, 380);
  };

  return (
    <div className="page-wrap">
      <Nav page={page} onNav={navigate} />

      {!transitioning && (
        <>
          {page === 'home' && <ContentHome onNav={navigate} />}
          {page === 'services' && <ServicesPage onNav={navigate} />}
          {page === 'service' && <ServiceDetail onNav={navigate} serviceId={serviceId} />}
          {page === 'portfolio' && <Portfolio onNav={navigate} initialFilter={portfolioFilter} />}
          {page === 'case' && <CasePage onNav={navigate} workId={workId} />}
          {page === 'about' && <About onNav={navigate} mode="content" />}
          {page === 'maker' && <MakerPage onNav={navigate} makerId={makerId} />}
          {page === 'contact' && <Contact onNav={navigate} />}
        </>
      )}

      <div style={{
        position:'fixed',inset:0,background:'#050505',pointerEvents:'none',zIndex:9000,
        opacity: transitioning ? 1 : 0, transition:'opacity .35s ease',
      }}></div>

      <div className="grain"></div>
      <CursorDot />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
