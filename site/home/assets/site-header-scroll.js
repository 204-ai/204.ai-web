;(() => {
  const topZone = 40
  const idleDelay = 700
  const root = document.documentElement
  let idleTimer

  function updateHeader() {
    root.classList.toggle('site-nav-compact', window.scrollY > topZone)
    root.classList.remove('site-nav-idle')
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => root.classList.add('site-nav-idle'), idleDelay)
  }

  updateHeader()
  window.addEventListener('scroll', updateHeader, { passive: true })
  window.addEventListener('pageshow', updateHeader)
})()
