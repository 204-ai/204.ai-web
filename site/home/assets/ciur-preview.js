const card = document.querySelector('.ciur-preview .featured-card')

if (card) {
  const clip = card.querySelector('[data-ciur-motion]')
  const motion = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 701px) and (prefers-reduced-motion: no-preference)')

  function stop() {
    clip.pause()
    clip.classList.remove('is-playing')
  }

  function play() {
    if (!motion.matches || document.hidden) return
    if (!clip.hasAttribute('src')) clip.src = clip.dataset.src
    clip.play().catch(() => {})
  }

  card.addEventListener('pointerenter', play)
  card.addEventListener('pointerleave', stop)
  clip.addEventListener('playing', () => {
    if (!clip.paused) clip.classList.add('is-playing')
  })
  motion.addEventListener('change', stop)
  document.addEventListener('visibilitychange', stop)
}

// The Productions panel is an in-view preview, separate from the homepage card.
const productionClip = document.querySelector('.production-ciurlionis-image [data-ciur-motion]')
if (productionClip) {
  const motion = matchMedia('(min-width: 701px) and (prefers-reduced-motion: no-preference)')
  let inView = false
  function syncProductionClip() {
    if (!inView || !motion.matches || document.hidden) {
      productionClip.pause()
      return
    }
    if (productionClip.ended) return
    if (!productionClip.hasAttribute('src')) productionClip.src = productionClip.dataset.src
    productionClip.play().catch(() => {})
  }
  productionClip.addEventListener('playing', () => productionClip.classList.add('is-playing'), {once: true})
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    syncProductionClip()
  }, {threshold: .25}).observe(productionClip)
  motion.addEventListener('change', syncProductionClip)
  document.addEventListener('visibilitychange', syncProductionClip)
}
