for (const carousel of document.querySelectorAll('.archive-slides')) {
  const slides = [...carousel.querySelectorAll('[data-slide-title]')]
  const controls = carousel.querySelector('.archive-slide-controls')
  const status = carousel.querySelector('.archive-slide-status')
  let active = 0

  for (const button of controls.querySelectorAll('[data-slide-step]')) {
    button.addEventListener('click', () => {
      slides[active].hidden = true
      active = (active + Number(button.dataset.slideStep) + slides.length) % slides.length
      slides[active].hidden = false
      status.textContent = `${slides[active].dataset.slideTitle} · ${active + 1} / ${slides.length}`
    })
  }
  controls.hidden = false
}
