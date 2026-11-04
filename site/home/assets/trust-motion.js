const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

function animatePartner(target, previousTarget) {
  if (reducedMotion.matches) return
  const partner = target.closest('#trusted-by [data-partner]')
  if (!partner || (previousTarget instanceof Node && partner.contains(previousTarget))) return
  partner.querySelector('.trust-mark img')?.classList.add('is-gesturing')
}

document.addEventListener('pointerover', event => {
  if (event.pointerType === 'mouse' || (event.pointerType === 'pen' && !event.buttons)) {
    animatePartner(event.target, event.relatedTarget)
  }
})

document.addEventListener('focusin', event => {
  if (event.target.matches(':focus-visible')) animatePartner(event.target, event.relatedTarget)
})

function endGesture(event) {
  if (event.animationName === 'trust-logo-gesture') event.target.classList.remove('is-gesturing')
}

document.addEventListener('animationend', endGesture)
document.addEventListener('animationcancel', endGesture)
