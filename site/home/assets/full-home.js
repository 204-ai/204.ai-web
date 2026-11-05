// The full-page preview reuses the same curated hero films as the main local website.
;(async()=>{
 const clips=await fetch('assets/full-home-hero.json').then(r=>{if(!r.ok)throw Error('Hero unavailable');return r.json()})
 const stage=document.querySelector('.full-hero-stage'),poster=document.querySelector('#home-hero-poster'),video=document.querySelector('#home-hero-video')
 const small=matchMedia('(max-width:900px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)')
 let index=0,timer=0,visible=stage.getBoundingClientRect().bottom>0,fallback=false,userPaused=false,userRequested=false
 function stopTimer(){clearTimeout(timer);timer=0}
 function canAnimate(){return !fallback&&(userRequested||(!small.matches&&!reduced.matches&&!navigator.connection?.saveData))}
 function schedule(){
  stopTimer()
  if(userPaused||!visible||document.hidden||reduced.matches||canAnimate())return
  timer=setTimeout(()=>select(index+1),6000)
 }
 function playback(){
  stopTimer()
  if(userPaused||!visible||document.hidden){video.pause();stopTimer();return}
  if(canAnimate()){
   if(video.getAttribute('src')!==clips[index].video){video.src=clips[index].video;video.load()}
   const requested=index
   video.play().catch(()=>{if(requested!==index||!visible||document.hidden)return;fallback=true;video.hidden=true;schedule()})
  }else{video.pause();video.hidden=true;schedule()}
 }
 function select(next){
  stopTimer();video.pause();video.hidden=true;index=(next+clips.length)%clips.length
  const clip=clips[index]
  poster.src=clip.poster;document.querySelector('#home-hero-title').textContent=clip.title;document.querySelector('#home-hero-meta').textContent=clip.meta;document.querySelector('#home-hero-link').href=clip.url
  document.querySelector('#home-hero-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(clips.length).padStart(2,'0')}`
  playback()
 }
 document.querySelector('#home-hero-prev').addEventListener('click',()=>select(index-1))
 document.querySelector('#home-hero-next').addEventListener('click',()=>select(index+1))
 const sound=stage.querySelector('.hero-audio-toggle')
 sound.addEventListener('click',()=>{
  video.muted=!video.muted
  sound.setAttribute('aria-pressed',String(!video.muted))
  sound.title=video.muted?'Turn sound on':'Turn sound off'
  if(!video.muted&&video.paused){userPaused=false;userRequested=true;fallback=false;playback()}
 })
 function toggleFilm(){
  if(video.paused){userPaused=false;userRequested=true;fallback=false;playback()}
  else{userPaused=true;video.pause();stopTimer()}
 }
 stage.addEventListener('click',event=>{
  if(event.target.closest('a,button,input,select,textarea'))return
  toggleFilm()
 })
 document.addEventListener('keydown',event=>{
  if(!visible||event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return
  const target=event.target
  if(target instanceof Element){
   if(target.closest('input,textarea,select,video,audio,[contenteditable]:not([contenteditable="false"]),[role="slider"],[role="textbox"]'))return
   if(target.closest('button,a,[role="button"]')&&!stage.contains(target))return
  }
  event.preventDefault()
  select(index+(event.key==='ArrowRight'?1:-1))
 })
 video.addEventListener('playing',()=>{video.hidden=false})
 video.addEventListener('ended',()=>select(index+1))
 video.addEventListener('error',()=>{fallback=true;video.hidden=true;schedule()})
 document.addEventListener('play',event=>{if(event.target instanceof HTMLVideoElement)document.querySelectorAll('video').forEach(other=>{if(other!==event.target)other.pause()})},true)
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;playback()},{threshold:.01}).observe(stage)
 document.addEventListener('visibilitychange',playback)
 for(const media of [small,reduced])media.addEventListener('change',()=>{video.pause();video.removeAttribute('src');video.load();video.hidden=true;playback()})
 playback()
})().catch(()=>{})

;(() => {
 const title = document.querySelector('.full-hero-title')
 const words = [...title.querySelectorAll('.hero-material')]
 const motion = matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
 const light = title.querySelector('[data-material="light"]')
 const vibration = document.createElement('span')
 vibration.className = 'hero-light-vibration'
 vibration.setAttribute('aria-hidden', 'true')
 const shifts = [-.04, .07, -.09, .06, -.07, .04]
 shifts.forEach((shift, index) => {
  const band = document.createElement('span')
  band.dataset.label = light.textContent
  band.style.clipPath = `inset(${index / shifts.length * 100}% 0 ${(shifts.length - index - 1) / shifts.length * 100}% 0)`
  band.style.setProperty('--light-shift', `${shift}em`)
  band.style.animationDelay = `${-index * 22}ms`
  vibration.append(band)
 })
 light.append(vibration)
 const intro = [...words, ...words]
 const glitchDuration = 450
 const minRandomGap = 600
 const maxRandomGap = 3000 - glitchDuration
 let visible = false
 let fontsReady = false
 let introIndex = 0
 let timer
 let lastWord
 function schedule() {
  clearTimeout(timer)
  lastWord?.classList.remove('is-glitching')
  if (!fontsReady || !visible || !motion.matches || document.hidden) return
  // The title reveal lasts up to 1550 ms after it enters view.
  let delay = minRandomGap + Math.random() * (maxRandomGap - minRandomGap)
  if (introIndex < intro.length) delay = introIndex === 0 ? 1600 : 260
  timer = setTimeout(() => {
   if (introIndex < intro.length) {
    lastWord = intro[introIndex++]
   } else {
    const choices = words.filter(word => word !== lastWord)
    lastWord = choices[Math.floor(Math.random() * choices.length)]
   }
   lastWord.classList.add('is-glitching')
   timer = setTimeout(schedule, glitchDuration)
  }, delay)
 }
 new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting
  schedule()
 }).observe(title)
 motion.addEventListener('change', schedule)
 document.addEventListener('visibilitychange', schedule)
 document.fonts.ready.then(() => {
  fontsReady = true
  schedule()
 })
})()
