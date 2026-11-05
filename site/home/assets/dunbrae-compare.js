{
  const frame = document.querySelector('#dunbrae-compare')
  const pull = document.querySelector('#dunbrae-pull')
  const mask = document.querySelector('#dunbrae-peel-mask')
  const curl = document.querySelector('#dunbrae-peel-curl')
  const video = document.querySelector('#dunbrae-result-video')
  const play = document.querySelector('#dunbrae-play')
  const back = document.querySelector('#dunbrae-back')
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  let progress = 0
  let drag = null
  let dragged = false
  let animation = 0

  function draw(value) {
    progress = Math.min(1, Math.max(0, value))
    const edge = 99 - 109 * progress
    const bend = 3 + 6 * Math.sin(Math.PI * progress)
    const top = edge + bend * .35
    const middle = edge - bend
    const bottom = edge + bend * .7
    const upper = `C ${edge - bend * .3} 18 ${middle - bend * .2} 36 ${middle} 51`
    const lower = `C ${middle + bend * .1} 67 ${edge + bend * .1} 85 ${bottom} 100`
    mask.setAttribute('d', `M 0 0 H ${top} ${upper} ${lower} H 0 Z`)
    curl.setAttribute('d', `M ${top} 0 ${upper} ${lower} C ${edge + bend * 2} 82 ${edge + bend * 2.3} 61 ${edge + bend * 1.4} 45 Q ${edge + bend * .9} 17 ${top} 0 Z`)
    frame.style.setProperty('--peel-tab', `clamp(26px, ${middle + bend * 1.18}%, 100% - 26px)`)
    frame.classList.toggle('is-peeling', progress > .025)
    back.hidden = progress === 0
  }

  function reset() {
    cancelAnimationFrame(animation)
    animation = 0
    drag = null
    frame.classList.remove('is-open')
    video.pause()
    if (video.readyState > 0) video.currentTime = 0
    video.hidden = true
    play.hidden = true
    play.textContent = 'Play clip'
    draw(0)
  }

  function playClip() {
    for (const other of document.querySelectorAll('video')) {
      if (other !== video) other.pause()
    }
    if (!video.hasAttribute('src')) video.src = video.dataset.src
    if (video.ended) video.currentTime = 0
    video.play().catch(() => {
      if (frame.classList.contains('is-open')) play.textContent = 'Play clip'
    })
  }

  function finish() {
    const restoreFocus = document.activeElement === pull
    draw(1)
    frame.classList.add('is-open')
    play.textContent = 'Play clip'
    play.hidden = false
    if (restoreFocus) play.focus({preventScroll:true})
    playClip()
  }

  function open() {
    if (animation || frame.classList.contains('is-open')) return
    if (reducedMotion.matches) {
      finish()
      return
    }
    const start = performance.now()
    const from = progress
    const duration = Math.max(100, (1 - from) * 360)
    function step(now) {
      const t = Math.min(1, (now - start) / duration)
      draw(from + (1 - from) * (1 - (1 - t) ** 2))
      animation = t < 1 ? requestAnimationFrame(step) : 0
      if (t === 1) finish()
    }
    animation = requestAnimationFrame(step)
  }

  pull.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || animation) return
    drag = {id:event.pointerId, x:event.clientX, start:progress, travel:Math.max(1, frame.clientWidth - 52)}
    dragged = false
    pull.setPointerCapture(event.pointerId)
  })
  pull.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return
    const distance = drag.x - event.clientX
    if (Math.abs(distance) > 5) dragged = true
    if (dragged) draw(drag.start + distance / drag.travel)
  })
  pull.addEventListener('pointerup', event => {
    if (drag?.id !== event.pointerId) return
    drag = null
    if (dragged && progress >= .94) open()
  })
  pull.addEventListener('lostpointercapture', () => { drag = null })
  pull.addEventListener('click', event => {
    if (!dragged || event.detail === 0) open()
  })

  function toggleClip() {
    if (video.paused) playClip()
    else video.pause()
  }
  play.addEventListener('click', toggleClip)
  video.addEventListener('click', toggleClip)
  video.addEventListener('playing', () => {
    if (!frame.classList.contains('is-open')) return
    video.hidden = false
    play.textContent = 'Pause clip'
  })
  video.addEventListener('pause', () => { play.textContent = video.ended ? 'Replay clip' : 'Play clip' })
  video.addEventListener('ended', () => { play.textContent = 'Replay clip' })
  back.addEventListener('click', () => {
    reset()
    pull.focus({preventScroll:true})
  })
  frame.addEventListener('reset-peel', reset)
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) video.pause()
  }).observe(frame)
  draw(0)
}
