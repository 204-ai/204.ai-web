const frameList=(name,ext)=>Array.from({length:12},(_,i)=>`assets/${name}-frame-${String(i+1).padStart(2,'0')}.${ext}`)
const pieces={
  dream:{title:'What If You Could Dream Any Dream You Wanted?',poster:'assets/dream-slide-poster.webp',playable:true,duration:124.905,frames:frameList('dream','webp'),wave:'assets/dream-wave.webp',status:'2026 · 2:05 · Animated short',credit:'Jas Black, 204 production, AWO words',description:"What if you could dream any dream you wanted? An animated world built around Alan Watts' recorded voice.",youtubeId:'M585jPAbVKw',youtube:'https://www.youtube.com/watch?v=M585jPAbVKw'},
  satori:{title:'Satori',poster:'assets/satori.jpg',status:'2026 · Selected film still',credit:'Alan Watts animation series',description:'A different visual world from the Alan Watts animation series. Selected frame from Satori.'},
  confucius:{title:'Confucius',poster:'assets/confucius-poster.webp',video:'assets/confucius-web.mp4',duration:65.279,frames:frameList('confucius','webp'),wave:'assets/confucius-wave.webp',status:'Animated short · 1:05 · Archive preview',credit:'Alan Watts animation series · 204 × Jas Black',description:'Confucius at the river, animated over Alan Watts’ recorded voice.'},
  maybe:{title:'The Great Maybe',poster:'assets/maybe.jpg',playable:true,duration:99,frames:frameList('maybe','jpg'),wave:'assets/maybe-wave.webp',status:'2026 · 1:39 · Animated short',credit:'Jas Black, 204 production, AWO words',description:"The story of the farmer, animated over Alan Watts' recorded voice. Another way into the archive, with a character and visual language of its own.",youtubeId:'BFemz-ur0_0',youtube:'https://www.youtube.com/watch?v=BFemz-ur0_0'}
}
const $=s=>document.querySelector(s)
const video=$('#featured-video'),poster=$('#featured-poster'),play=$('#featured-play'),still=$('#still-note')
const timeline=$('#film-timeline'),frames=$('#timeline-frames'),seekBar=$('#timeline-seek')
let selected='dream'
let loadedPiece=null
let pendingSeek=null
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`
function videoSurface(button,clip,title){
  const screen=button.closest('.screen'),icon=document.createElement('span')
  icon.className='video-toggle-icon';icon.setAttribute('aria-hidden','true');button.replaceChildren(icon)
  button.classList.add('video-surface-toggle');button.type='button'
  const sync=()=>{
    const playing=!clip.paused
    icon.textContent=playing?'Ⅱ':'▶'
    button.classList.toggle('is-playing',playing)
    screen.classList.toggle('has-video',!clip.hidden)
    button.setAttribute('aria-label',`${playing?'Pause':'Play'} ${title()}`)
  }
  for(const event of ['play','pause','ended','emptied'])clip.addEventListener(event,sync)
  sync();return sync
}
function updateTime(){
  const piece=pieces[selected]
  if(!piece.video||piece.youtubeId)return
  const t=loadedPiece===selected?video.currentTime:0,duration=piece.duration
  timeline.style.setProperty('--progress',Math.min(1,t/duration))
  seekBar.value=String(t)
  seekBar.setAttribute('aria-valuetext',`${fmt(t)} of ${fmt(Math.round(duration))}`)
  $('#timeline-time').textContent=`${fmt(t)} / ${fmt(Math.round(duration))}`
  const current=Math.min(11,Math.floor(t/duration*12))
  ;[...frames.children].forEach((li,i)=>{li.className=i===current?'on':i<current?'past':''})
}
function drawTimeline(){
  const piece=pieces[selected]
  timeline.hidden=!piece.video&&!piece.youtubeId
  frames.replaceChildren()
  if(!piece.video&&!piece.youtubeId)return
  timeline.classList.toggle('youtube-timeline',Boolean(piece.youtubeId))
  timeline.querySelector('.timeline-caption>span').textContent=piece.youtubeId?'Preview frames · Select to jump':'Recorded talk, AWO archive'
  if(piece.youtubeId)$('#timeline-time').textContent=fmt(Math.round(piece.duration))+' · YouTube'
  seekBar.max=String(piece.duration)
  $('#timeline-wave').src=piece.wave
  piece.frames.forEach((src,i)=>{
    const li=document.createElement('li'),button=document.createElement('button'),image=document.createElement('img'),time=document.createElement('span')
    const at=i*piece.duration/12
    button.type='button';button.setAttribute('aria-label',`Jump to ${fmt(at)}`)
    image.src=src;image.alt='';image.draggable=false
    time.className='tl-time';time.textContent=fmt(at)
    button.append(image,time);button.addEventListener('click',()=>startFilm(at));li.append(button);frames.append(li)
  })
  updateTime()
}
async function startFilm(at){
  const pieceId=selected
  const piece=pieces[selected]
  if(!piece.video&&!piece.youtubeId)return
  if(piece.youtubeId){youtubePlayers.mount($('#featured-screen'),piece.youtubeId,piece.title,at);return}
  document.querySelectorAll('video').forEach(v=>{if(v!==video)v.pause()})
  video.muted=false
  if(loadedPiece!==selected){loadedPiece=selected;pendingSeek=null;video.src=piece.video;video.load()}
  video.hidden=false;poster.hidden=true;syncFeatured()
  if(at!==undefined){
    const target=Math.max(0,Math.min(piece.duration-.1,at))
    if(video.readyState>=1)video.currentTime=target
    else pendingSeek=target
  }
  try{await video.play()}catch(error){if(error.name==='AbortError')return;if(selected===pieceId&&loadedPiece===pieceId){video.hidden=true;poster.hidden=false;play.hidden=false;syncFeatured()}}
  updateTime()
}
document.querySelectorAll('[data-piece]').forEach(button=>button.addEventListener('click',()=>{
  youtubePlayers.remove($('#featured-screen'))
  video.pause();video.hidden=true;video.removeAttribute('src');video.load();loadedPiece=null;pendingSeek=null;selected=button.dataset.piece
  const piece=pieces[selected]
  poster.hidden=false;poster.src=piece.poster;poster.alt='A frame from '+piece.title
  video.setAttribute('aria-label',piece.title)
  play.hidden=!piece.video&&!piece.youtubeId;still.hidden=Boolean(piece.video||piece.youtubeId)
  $('#featured-title').textContent=piece.title;$('#featured-status').textContent=piece.status
  $('#featured-credit').textContent=piece.credit;$('#featured-description').textContent=piece.description
  $('#featured-youtube').hidden=!piece.youtube
  if(piece.youtube)$('#featured-youtube').href=piece.youtube
  document.querySelectorAll('[data-piece]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))
  drawTimeline()
  syncFeatured()
}))
const syncFeatured=videoSurface(play,video,()=>pieces[selected].title)
play.addEventListener('click',()=>video.paused?startFilm():video.pause())
seekBar.addEventListener('input',()=>startFilm(Number(seekBar.value)))
video.addEventListener('timeupdate',updateTime)
video.addEventListener('seeked',updateTime)
video.addEventListener('loadedmetadata',()=>{
  if(loadedPiece===selected&&pendingSeek!==null){video.currentTime=pendingSeek;pendingSeek=null;updateTime()}
})
document.querySelectorAll('[data-play]').forEach(button=>{
  const screen=button.closest('.screen'),clip=screen.querySelector('video')
  const title=clip.getAttribute('aria-label')||button.textContent.replace('▶','').trim().replace(/^Play (the )?/,'')
  const sync=videoSurface(button,clip,()=>clip.getAttribute('aria-label')||title)
  button.addEventListener('click',()=>{
    if(!clip.paused){clip.pause();return}
    document.querySelectorAll('video').forEach(v=>{if(v!==clip)v.pause()})
    if(clip.dataset.src&&!clip.getAttribute('src'))clip.src=clip.dataset.src
    clip.hidden=false;screen.querySelector('img').hidden=true;sync()
    clip.play().catch(error=>{if(error.name==='AbortError')return;clip.hidden=true;screen.querySelector('img').hidden=false;sync()})
  })
})
document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause())})
drawTimeline()
