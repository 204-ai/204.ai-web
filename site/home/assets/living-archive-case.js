const picturePanels = document.querySelectorAll('.living-picture-accordion details')
const pictureVisibility = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) entry.target.querySelector('video').pause()
  }
})

for (const panel of picturePanels) {
  const video = panel.querySelector('video')
  panel.addEventListener('toggle', () => {
    if (!panel.open) video.pause()
  })
  pictureVisibility.observe(panel.querySelector('.living-picture-screen'))
}
