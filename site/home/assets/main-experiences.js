;(()=>{
 const pieces={
  overview:{video:'assets/mirror/overview.mp4',poster:'assets/mirror/overview-poster.webp',title:'Magic Mirror portfolio',description:'Portfolio reel · 1:13 · Narrated showcase',captions:'assets/mirror/overview.vtt'},
  identity:{video:'/media/sd-mirror-1-dc2a2b.mp4',poster:'assets/mirror/identity-poster.webp',title:'Magic Mirror transformation',description:'Recorded installation demo · 12-second loop',loop:true},
  living:{video:'assets/mirror/living.mp4',poster:'assets/mirror/living-poster.webp',title:'Living Paintings — The Scream',description:'Recorded installation demo · 9-second loop',loop:true},
  spaces:{video:'/media/sd-mirror-3-14cec0.mp4',poster:'assets/mirror/spaces-poster.webp',title:'Magic Mirror — responsive spaces',description:'Recorded installation demo · 8-second loop',loop:true},
  brain:{video:'assets/mirror/brain.mp4',poster:'assets/mirror/brain-poster.webp',title:'Brain Mirror',description:'Recorded demonstration · With MuLabs · 3-second loop',loop:true}
 }
 const video=document.querySelector('#magic-mirror-video'),screen=document.querySelector('#mirror-player'),poster=screen.querySelector('img'),button=screen.querySelector('[data-play]')
 let current='overview'
 document.querySelectorAll('[data-mirror-piece]').forEach(tab=>tab.addEventListener('click',()=>{
  if(tab.dataset.mirrorPiece===current)return
  current=tab.dataset.mirrorPiece
  const piece=pieces[current]
  video.pause();video.hidden=true;video.removeAttribute('src');video.dataset.src=piece.video;video.loop=Boolean(piece.loop);video.muted=false
  video.setAttribute('aria-label',piece.title)
  poster.src=piece.poster;poster.alt=piece.title+' — showcase poster';poster.hidden=false;button.hidden=false
  video.querySelectorAll('track').forEach(track=>track.remove())
  if(piece.captions){const track=document.createElement('track');track.kind='captions';track.src=piece.captions;track.srclang='en';track.label='English';video.append(track)}
  document.querySelector('#mirror-piece-label').textContent=piece.title
  document.querySelector('#mirror-piece-description').textContent=piece.description
  document.querySelectorAll('[data-mirror-piece]').forEach(item=>item.setAttribute('aria-pressed',String(item===tab)))
  video.load()
 }))
 for(const clip of document.querySelectorAll('.main-experience video'))new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)clip.pause()},{threshold:.01}).observe(clip.closest('.screen'))
})()
