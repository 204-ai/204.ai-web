// Editorial headings use the Living Archive's scattered ink reveal.
;(() => {
  const motion = matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 701px)')
  const catalog = document.querySelector('#root')
  const headings = 'main h1, main h2:not(.label), main h3[data-ascii-title], main .featured-panel-head h3, main .section-head h3, main .story-copy h3, main .experience-title h3, main .dome-heading h3, main .sentient-discover h3'
  const seen = new WeakSet()
  const maskObserver = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      target.classList.toggle('ascii-mask-in-view', isIntersecting)
    }
  })

  function inkLetters(heading) {
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT)
    const nodes = []
    while (walker.nextNode()) {
      const node = walker.currentNode
      if (node.textContent.trim() && !node.parentElement.closest('[aria-hidden="true"]')) nodes.push(node)
    }
    const letterCount = nodes.reduce((total, node) => total + Array.from(node.textContent.replace(/\s/g, '')).length, 0)
    if (!letterCount) return

    const order = Array.from({length:letterCount}, (_, index) => index)
    let seed = 7
    for (let index = order.length - 1; index > 0; index--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      const other = seed % (index + 1)
      ;[order[index], order[other]] = [order[other], order[index]]
    }

    const interval = 400 / Math.max(1, letterCount - 1)
    if (!heading.hasAttribute('aria-label')) heading.setAttribute('aria-label', heading.innerText.trim().replace(/\s+/g, ' '))
    let index = 0
    for (const node of nodes) {
      const fragment = document.createDocumentFragment()
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part || /^\s+$/.test(part)) {
          fragment.append(part)
          continue
        }
        const word = document.createElement('span')
        word.className = 'ink-word'
        word.setAttribute('aria-hidden', 'true')
        for (const character of part) {
          const letter = document.createElement('span')
          letter.style.setProperty('--ink-delay', `${order[index++] * interval}ms`)
          letter.textContent = character
          word.append(letter)
        }
        fragment.append(word)
      }
      node.replaceWith(fragment)
    }
  }

  const observer = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue
      observer.unobserve(target)
      if (!motion.matches) continue
      // Leave React-owned text nodes alone so client-side route changes can update them.
      if (catalog) target.classList.add('ink-heading')
      else if (!target.querySelector('a:not([data-ink-link]), button, input, svg, [role="img"]')) inkLetters(target)
    }
  }, {threshold:.18})

  function watchHeadings() {
    for (const heading of document.querySelectorAll(headings)) {
      if (seen.has(heading)) continue
      seen.add(heading)
      observer.observe(heading)
      if (!heading.matches('[data-ascii-title]') && !heading.querySelector('[data-ascii-title]') && heading.textContent.trim()) {
        heading.classList.add('ink-ascii-reveal')
        maskObserver.observe(heading)
      }
    }
  }

  document.querySelectorAll('[data-ascii-title]').forEach(title => maskObserver.observe(title))
  watchHeadings()
  if (catalog) new MutationObserver(watchHeadings).observe(catalog, {childList:true, subtree:true})
})()
