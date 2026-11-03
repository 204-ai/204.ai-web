// The full-page preview reuses the same curated hero films as the main local website.
;(async()=>{
 const clips=await fetch('assets/full-home-hero.json').then(r=>{if(!r.ok)throw Error('Hero unavailable');return r.json()})
 const stage=document.querySelector('.full-hero-stage'),poster=document.querySelector('#home-hero-poster'),video=document.querySelector('#home-hero-video')
 const small=matchMedia('(max-width:900px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)')
 let index=0,timer=0,visible=stage.getBoundingClientRect().bottom>0,fallback=false,userPaused=false,userRequested=false
 const toggle=document.querySelector('#home-hero-toggle')
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
 function toggleFilm(){
  if(video.paused){userPaused=false;userRequested=true;fallback=false;playback()}
  else{userPaused=true;video.pause();stopTimer()}
 }
 function syncToggle(){
  toggle.textContent=video.paused?'▶':'Ⅱ'
  toggle.setAttribute('aria-label',`${video.paused?'Play':'Pause'} hero film`)
 }
 toggle.addEventListener('click',toggleFilm)
 stage.addEventListener('click',event=>{
  if(event.target.closest('a,button,input,select,textarea'))return
  toggleFilm()
 })
 for(const event of ['play','pause','ended'])video.addEventListener(event,syncToggle)
 syncToggle()
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
