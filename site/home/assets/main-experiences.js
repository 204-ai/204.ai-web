;(()=>{
 const pieces={
  overview:{video:'assets/mirror/overview.mp4',poster:'assets/mirror/overview-poster.webp',title:'Magic Mirror portfolio',description:'Portfolio reel · 1:13 · Narrated showcase',captions:'assets/mirror/overview.vtt'},
  fluxrt:{video:'assets/mirror/fluxrt-prompt-reel.mp4',poster:'assets/mirror/fluxrt-prompt-poster.webp',title:'FluxRT in motion',description:'Live prompt changes and dance capture · 13 sec'},
  identity:{video:'/media/sd-mirror-1-dc2a2b.mp4',poster:'assets/mirror/identity-poster.webp',title:'Magic Mirror transformation',description:'Recorded installation demo · 12 sec'},
  living:{video:'assets/mirror/living.mp4',poster:'assets/mirror/living-poster.webp',title:'Living Paintings — The Scream',description:'Recorded installation demo · 9 sec'},
  spaces:{video:'/media/sd-mirror-3-14cec0.mp4',poster:'assets/mirror/spaces-poster.webp',title:'Magic Mirror — responsive spaces',description:'Recorded installation demo · 8 sec'},
  brain:{video:'assets/mirror/brain.mp4',poster:'assets/mirror/brain-poster.webp',title:'Brain Mirror',description:'Recorded demonstration · With MuLabs · 3 sec'}
 }
 const video=document.querySelector('#magic-mirror-video')
 const screen=document.querySelector('#mirror-player')
 const poster=screen.querySelector('img')
 const button=document.querySelector('#mirror-play')
 const playlist=[...document.querySelectorAll('[data-mirror-piece]')]
 const still=matchMedia('(prefers-reduced-motion: reduce)')
 const sync=videoSurface(button,video,()=>video.getAttribute('aria-label'))
 let selected=0
 let inView=false
 let wantsPlayback

 function playCurrent(){
  const allowed=wantsPlayback??(!still.matches&&!navigator.connection?.saveData)
  if(!inView||document.hidden||!allowed){
   video.pause()
   return
  }
  const src=video.dataset.src
  if(!video.getAttribute('src'))video.src=src
  video.play().catch(error=>{
   if(error.name==='AbortError'||src!==video.getAttribute('src'))return
   video.hidden=true
   poster.hidden=false
   sync()
  })
 }

 function select(index){
  selected=index
  const tab=playlist[index]
  const piece=pieces[tab.dataset.mirrorPiece]
  video.pause()
  video.hidden=true
  video.removeAttribute('src')
  video.load()
  video.dataset.src=piece.video
  video.setAttribute('aria-label',piece.title)
  poster.src=piece.poster
  poster.alt=piece.title+' — showcase poster'
  poster.hidden=false
  video.querySelectorAll('track').forEach(track=>track.remove())
  if(piece.captions){
   const track=document.createElement('track')
   track.kind='captions'
   track.src=piece.captions
   track.srclang='en'
   track.label='English'
   video.append(track)
  }
  document.querySelector('#mirror-piece-label').textContent=piece.title
  document.querySelector('#mirror-piece-description').textContent=piece.description
  playlist.forEach(item=>item.setAttribute('aria-pressed',String(item===tab)))
  sync()
  playCurrent()
 }

 playlist.forEach((tab,index)=>tab.addEventListener('click',()=>{
  wantsPlayback=true
  if(index===selected)playCurrent()
  else select(index)
 }))
 button.addEventListener('click',()=>{
  wantsPlayback=video.paused
  playCurrent()
 })
 video.addEventListener('playing',()=>{
  video.hidden=false
  poster.hidden=true
  sync()
 })
 video.addEventListener('ended',()=>select((selected+1)%playlist.length))
 new IntersectionObserver(([entry])=>{
  inView=entry.intersectionRatio>=.25
  playCurrent()
 },{threshold:.25}).observe(screen)
 still.addEventListener('change',()=>{
  wantsPlayback=undefined
  playCurrent()
 })
 document.addEventListener('visibilitychange',playCurrent)
 for(const clip of document.querySelectorAll('.main-experience .screen video:not(#magic-mirror-video)'))new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)clip.pause()},{threshold:.01}).observe(clip.closest('.screen'))
})()

;(()=>{
 const steps=document.querySelector('.booth-steps')
 const stage=steps.querySelector('.booth-pose')
 const video=stage.querySelector('video')
 const toggle=stage.querySelector('.booth-pose-toggle')
 const flash=stage.querySelector('.booth-capture-flash')
 const strips=[...steps.querySelectorAll('.booth-wheel-strip')]
 const stops=strips.map(()=>0)
 const result=steps.querySelector('.booth-result')
 const printStage=steps.querySelector('.booth-print')
 const photo=printStage.querySelector('img')
 const printHead=printStage.querySelector('.booth-print-head')
 const motion=matchMedia('(prefers-reduced-motion: reduce)')
 const desktopMotion=matchMedia('(min-width: 701px) and (prefers-reduced-motion: no-preference)')
 const align=steps.querySelector('.booth-align-pad')
 const face=align.querySelector('.booth-align-face')
 const target=align.querySelector('.booth-align-target')
 const printLever=steps.querySelector('.booth-print-trigger')
 let holdTimer
 let mouseAligned=false
 let printCount=0
 let inView=false
 let userPlay
 let captured=false
 let capturing=false

 function playPose(){
  if(!video.getAttribute('src'))video.src=video.dataset.src
  video.play().catch(()=>{})
 }

 function syncPlayback(){
  if(document.hidden){video.pause();return}
  if(captured||capturing)return
  if(!inView||!(userPlay??desktopMotion.matches)){video.pause();return}
  playPose()
 }

 function updateButton(){
  toggle.setAttribute('aria-label',video.paused?'Play the pose loop':'Pause the pose loop')
  toggle.firstElementChild.textContent=video.paused?'▶':'Ⅱ'
 }

 function spinReels(){
  printCount=0
  const portraits=strips.map((strip,index)=>{
   const step=Math.random()<.5?1:2
   const stop=(stops[index]+step)%strip.children.length
   stops[index]=stop
   strip.style.setProperty('--booth-stop',stop)
   return strip.children[stop].alt
  })
  result.textContent=portraits.join(', ')+'.'
 }

 function startCapture(){
  capturing=true
  if(desktopMotion.matches)playPose()
 }

 async function finishCapture(){
  if(desktopMotion.matches)await new Promise(resolve=>setTimeout(resolve,180))
  captured=true
  capturing=false
  video.pause()
  toggle.hidden=true
  if(!motion.matches)await flash.animate(
   [{opacity:.88},{opacity:0}],{duration:240,easing:'ease-out'}
  ).finished
  spinReels()
 }

 function stopPrint(){
  for(const element of [photo,printHead])element.getAnimations().forEach(animation=>animation.cancel())
 }

 const originalPrint={src:photo.src,alt:photo.alt}

 async function printPhoto(){
  const wheel=(printCount-1)%strips.length
  const portrait=printCount ? strips[wheel].children[stops[wheel]] : originalPrint
  const next=new Image()
  next.src=portrait.src
  try{await next.decode()}catch{return}
  printCount++
  stopPrint()
  photo.src=next.src
  photo.alt=portrait.alt
  printStage.classList.toggle('is-portrait',portrait!==originalPrint)
  if(!desktopMotion.matches)return
  const timing={duration:1200,easing:'steps(32, end)'}
  photo.animate([{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0)'}],timing)
  printHead.style.setProperty('--print-travel',printStage.querySelector('.booth-print-surface').offsetHeight+'px')
  printHead.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(var(--print-travel, 0px))',opacity:1}],timing)
 }

 function cancelHold(){
  clearTimeout(holdTimer)
  holdTimer=undefined
  align.classList.remove('is-aligning')
 }

 async function capture(){
  if(capturing)return
  cancelHold()
  align.classList.add('is-aligned')
  startCapture()
  try{await finishCapture()}finally{align.classList.remove('is-aligned')}
 }

 function startHold(){
  if(holdTimer!==undefined||capturing)return
  align.classList.add('is-aligning')
  holdTimer=setTimeout(capture,1000)
 }

 align.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse')return
  const bounds=align.getBoundingClientRect()
  face.style.transform=`translate(${event.clientX-bounds.left}px,${event.clientY-bounds.top}px) translate(-50%,-50%)`
  const ring=target.getBoundingClientRect()
  const aligned=Math.hypot(event.clientX-ring.left-ring.width/2,event.clientY-ring.top-ring.height/2)<=ring.width*.31
  if(aligned&&!mouseAligned)startHold()
  if(!aligned)cancelHold()
  mouseAligned=aligned
 })
 align.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse')return
  align.setPointerCapture(event.pointerId)
  startHold()
 })
 align.addEventListener('pointerleave',()=>{
  mouseAligned=false
  cancelHold()
 })
 for(const event of ['pointerup','pointercancel','blur'])align.addEventListener(event,cancelHold)
 align.addEventListener('click',event=>{if(event.detail===0)capture()})

 function connectLever(button,action){
  const arm=button.querySelector('.booth-lever-arm')
  button.disabled=false
  button.addEventListener('click',async()=>{
   if(button.getAttribute('aria-disabled')==='true')return
   button.setAttribute('aria-disabled','true')
   let pull,release
   try {
    if(!motion.matches){
     pull=arm.animate([{transform:'rotate(0deg)'},{transform:'rotate(85deg)'}],{
      duration:170,easing:'cubic-bezier(.55,.085,.68,.53)',fill:'forwards'
     })
     await pull.finished
    }
    await action()
    if(pull&&!motion.matches){
     release=arm.animate([
      {transform:'rotate(85deg)'},{transform:'rotate(-8.5deg)',offset:.6},{transform:'rotate(0deg)'}
     ],{duration:420,delay:60,easing:'ease-out',fill:'both'})
     pull.cancel()
     await release.finished
    }
   } finally {
    pull?.cancel()
    release?.cancel()
    button.removeAttribute('aria-disabled')
   }
  })
 }

 toggle.hidden=false
 toggle.addEventListener('click',()=>{
  userPlay=video.paused
  syncPlayback()
 })
 video.addEventListener('playing',()=>{
  video.hidden=false
  updateButton()
 })
 video.addEventListener('pause',updateButton)
 video.addEventListener('error',()=>{
  video.hidden=true
  toggle.hidden=true
 })
 new IntersectionObserver(([entry])=>{
  inView=entry.isIntersecting
  syncPlayback()
 },{threshold:.2,rootMargin:'72px 0px'}).observe(stage)
 motion.addEventListener('change',()=>{
  if(motion.matches)stopPrint()
  if(captured||capturing)return
  userPlay=undefined
  if(motion.matches)video.hidden=true
  syncPlayback()
 })
 document.addEventListener('visibilitychange',syncPlayback)
 connectLever(printLever,printPhoto)
})()

;(()=>{
 const guide=document.querySelector('#mirror-guide')
 const control=guide.querySelector('.mirror-guide-motion')
 const reduced=matchMedia('(prefers-reduced-motion: reduce), (max-width: 700px)')
 let visible=false
 let paused=false

 function syncMotion(){
  control.hidden=reduced.matches
  control.textContent=paused?'Resume animations':'Pause animations'
  guide.classList.toggle('is-animating',visible&&!paused&&!reduced.matches&&!document.hidden)
 }

 new IntersectionObserver(([entry])=>{
  visible=entry.isIntersecting
  syncMotion()
 }).observe(guide)
 control.addEventListener('click',()=>{
  paused=!paused
  syncMotion()
 })
 reduced.addEventListener('change',syncMotion)
 document.addEventListener('visibilitychange',syncMotion)
 syncMotion()
})()
