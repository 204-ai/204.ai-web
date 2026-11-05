const textures = document.querySelectorAll('[data-ascii], [data-ascii-motion], [data-studio-art]')
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      target.classList.toggle('ascii-in-view', isIntersecting)
    }
  })
  textures.forEach(texture => observer.observe(texture))
}
