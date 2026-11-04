const gallery = document.querySelector('.studio-artworks')
const stage = gallery.querySelector('.studio-artworks-stage')
const grid = gallery.querySelector('.studio-artworks-grid')
const toggle = gallery.querySelector('.studio-artworks-toggle')
const label = toggle.querySelector('[data-gallery-label]')
let hovered = false
let pinned = location.hash === '#studio-artworks-grid'

function update() {
  const open = hovered || pinned || grid.contains(document.activeElement)
  gallery.classList.toggle('is-open', open)
  toggle.setAttribute('aria-expanded', String(open))
  label.textContent = open ? 'Show studio photo' : 'Browse artworks'
  grid.inert = !open
}

function close() {
  pinned = false
  hovered = false
  toggle.focus({ preventScroll: true })
  update()
}

stage.addEventListener('pointerenter', event => {
  if (event.pointerType !== 'mouse') return
  hovered = true
  update()
})
stage.addEventListener('pointerleave', () => {
  hovered = false
  update()
})
toggle.addEventListener('click', () => {
  if (gallery.classList.contains('is-open')) close()
  else {
    pinned = true
    update()
  }
})
grid.addEventListener('focusout', () => queueMicrotask(update))
gallery.addEventListener('keydown', event => {
  if (event.key === 'Escape' && gallery.classList.contains('is-open')) {
    event.preventDefault()
    close()
  }
})

gallery.classList.add('is-enhanced')
toggle.hidden = false
update()
