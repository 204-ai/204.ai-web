const frameList=(name,ext)=>Array.from({length:12},(_,i)=>`assets/${name}-frame-${String(i+1).padStart(2,'0')}.${ext}`)
const pieces={
  dream:{title:'What If You Could Dream Any Dream You Wanted?',poster:'assets/dream-slide-poster.webp',duration:124.905,waveform:'assets/dream-wave.webp',frames:frameList('dream','webp'),status:'2026 · 2:05 · Animated short',credit:'Jas Black, 204 production, AWO words',description:"What if you could dream any dream you wanted? An animated world built around Alan Watts' recorded voice.",youtubeId:'M585jPAbVKw',youtube:'https://www.youtube.com/watch?v=M585jPAbVKw'},
  satori:{
    title:'Satori',status:'Selected artwork · YouTube release pending',credit:'Alan Watts animation series',
    description:'Four frames from Satori, from the forest clearing to the woodcutter.',
    stills:[
      ['assets/satori-still-1.webp','A blue and orange creature peers out of a forest clearing'],
      ['assets/satori-still-2.webp','A woodcutter faces the creature among blue leaves'],
      ['assets/satori-still-3.webp','Close-up of the creature’s orange face'],
      ['assets/satori-still-4.webp','The woodcutter lifts his axe beside a stack of logs'],
    ],
  },
  confucius:{
    title:'Confucius',status:'Selected artwork · YouTube release pending',credit:'Alan Watts animation series · 204 × Jas Black',
    description:'Four frames from the animated story of Confucius at the river.',
    stills:[
      ['assets/confucius-still-1.webp','Confucius strokes his beard beside a river'],
      ['assets/confucius-still-2.webp','Travelers cross a field below mountains and a winding river'],
      ['assets/confucius-still-3.webp','A man floats on his back in shallow water'],
      ['assets/confucius-still-4.webp','Two men speak at the riverbank'],
    ],
  },
  maybe:{title:'The Great Maybe',poster:'assets/maybe.jpg',duration:99,waveform:'assets/maybe-wave.webp',frames:frameList('maybe','jpg'),status:'2026 · 1:39 · Animated short',credit:'Jas Black, 204 production, AWO words',description:"The story of the farmer, animated over Alan Watts' recorded voice. Another way into the archive, with a character and visual language of its own.",youtubeId:'BFemz-ur0_0',youtube:'https://www.youtube.com/watch?v=BFemz-ur0_0'}
}
const $ = selector => document.querySelector(selector)
const screen = $('#featured-screen')
const poster = $('#featured-poster')
const play = $('#featured-play')
const stillControls = $('#film-stills-controls')
const timeline = $('#film-timeline')
const frames = $('#timeline-frames')
const waveform = $('#film-waveform')
const seek = $('#film-waveform-seek')
const youtube = $('#featured-youtube')
const buttons = document.querySelectorAll('[data-piece]')
let selected = pieces.dream
let stillIndex = 0

const fmt = time => Math.floor(time / 60) + ':' + String(Math.floor(time % 60)).padStart(2, '0')

function showStill(index) {
  const stills = selected.stills
  stillIndex = (index + stills.length) % stills.length
  const [src, description] = stills[stillIndex]
  poster.src = src
  poster.alt = description
  $('#film-still-count').textContent = (stillIndex + 1) + ' / ' + stills.length
}

function startFilm(at) {
  youtubePlayers.mount(screen, selected.youtubeId, selected.title, at)
}

function drawTimeline() {
  timeline.hidden = !selected.youtubeId
  frames.replaceChildren()
  if (!selected.youtubeId) return

  waveform.src = selected.waveform
  seek.max = String(Math.floor(selected.duration))
  seek.value = '0'
  seek.setAttribute('aria-valuetext', '0:00')
  $('#timeline-time').textContent = fmt(Math.round(selected.duration)) + ' · YouTube'
  selected.frames.forEach((src, index) => {
    const at = index * selected.duration / selected.frames.length
    const item = document.createElement('li')
    const button = document.createElement('button')
    const image = document.createElement('img')
    const time = document.createElement('span')
    button.type = 'button'
    button.setAttribute('aria-label', 'Jump to ' + fmt(at))
    image.src = src
    image.alt = ''
    image.draggable = false
    time.className = 'tl-time'
    time.textContent = fmt(at)
    button.append(image, time)
    button.addEventListener('click', () => startFilm(at))
    item.append(button)
    frames.append(item)
  })
}

buttons.forEach(button => button.addEventListener('click', () => {
  youtubePlayers.remove(screen)
  selected = pieces[button.dataset.piece]
  const hasFilm = Boolean(selected.youtubeId)
  poster.hidden = false
  play.hidden = !hasFilm
  youtube.hidden = !hasFilm
  stillControls.hidden = hasFilm
  if (hasFilm) {
    poster.src = selected.poster
    poster.alt = 'A frame from ' + selected.title
    play.setAttribute('aria-label', 'Play ' + selected.title)
    youtube.href = selected.youtube
  } else {
    showStill(0)
  }
  $('#featured-title').textContent = selected.title
  $('#featured-status').textContent = selected.status
  $('#featured-credit').textContent = selected.credit
  $('#featured-description').textContent = selected.description
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)))
  drawTimeline()
}))

$('#film-still-prev').addEventListener('click', () => showStill(stillIndex - 1))
$('#film-still-next').addEventListener('click', () => showStill(stillIndex + 1))
stillControls.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  showStill(stillIndex + (event.key === 'ArrowRight' ? 1 : -1))
})
seek.addEventListener('input', () => seek.setAttribute('aria-valuetext', fmt(Number(seek.value))))
seek.addEventListener('change', () => startFilm(Number(seek.value)))
play.addEventListener('click', () => startFilm())
drawTimeline()
