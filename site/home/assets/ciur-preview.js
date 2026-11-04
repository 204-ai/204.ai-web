const preview = document.querySelector('.ciur-preview')

if (preview) {
  const frames = [...preview.querySelectorAll('[data-caption]')]
  const controls = preview.querySelector('.ciur-preview-controls')
  const caption = preview.querySelector('.ciur-preview-caption')
  let current = 0

  for (const button of controls.querySelectorAll('[data-ciur-preview-step]')) {
    button.addEventListener('click', () => {
      frames[current].hidden = true
      current = (current + Number(button.dataset.ciurPreviewStep) + frames.length) % frames.length
      frames[current].hidden = false
      caption.textContent = `${frames[current].dataset.caption} · ${current + 1} / ${frames.length}`
    })
  }
  controls.hidden = false
}

const clip = document.querySelector('[data-ciur-motion]')

if (clip) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let visible = false

  function syncPlayback() {
    if (!visible || document.hidden || reduced.matches) {
      clip.pause()
      return
    }
    if (clip.ended) return
    if (!clip.hasAttribute('src')) clip.src = clip.dataset.src
    clip.play().catch(() => {})
  }

  clip.addEventListener('playing', () => clip.classList.add('is-playing'), {once: true})
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    syncPlayback()
  }, {threshold: 0.25}).observe(clip)
  reduced.addEventListener('change', syncPlayback)
  document.addEventListener('visibilitychange', syncPlayback)
}
