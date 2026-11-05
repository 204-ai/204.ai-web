document.querySelectorAll('[data-chapter-reel]').forEach(hero => {
  const video = hero.querySelector('video')
  const toggle = hero.querySelector('.chapter-reel-toggle')
  const sound = hero.querySelector('.hero-audio-toggle')
  const still = matchMedia('(prefers-reduced-motion: reduce)')
  const small = matchMedia('(max-width: 620px)')
  let inView = false
  let preference = null

  function sync() {
    const playing = !video.paused
    hero.classList.toggle('reel-playing', playing)
    toggle.textContent = playing ? 'Ⅱ' : '▶'
    toggle.setAttribute('aria-label', playing ? 'Pause background reel' : 'Play background reel')
  }

  function update() {
    const autoplay = !small.matches && !still.matches && !navigator.connection?.saveData
    if (document.hidden || !inView || !(preference ?? autoplay)) {
      video.pause()
      return
    }
    if (!video.hasAttribute('src')) video.src = video.dataset.reelSrc
    video.play().catch(sync)
  }

  toggle.addEventListener('click', () => {
    preference = video.paused
    update()
  })
  sound.addEventListener('click', () => {
    video.muted = !video.muted
    sound.setAttribute('aria-pressed', String(!video.muted))
    sound.title = video.muted ? 'Turn sound on' : 'Turn sound off'
    if (!video.muted && video.paused) {
      preference = true
      update()
    }
  })
  for (const event of ['playing', 'pause', 'error']) video.addEventListener(event, sync)
  document.addEventListener('visibilitychange', update)
  for (const media of [still, small]) media.addEventListener('change', update)
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    update()
  }, {threshold: 0.15}).observe(hero)
})

const reel = document.querySelector('#production-overview')
document.querySelectorAll('a[href="#production-overview"]').forEach(link => {
  link.addEventListener('click', () => { reel.open = true })
})
