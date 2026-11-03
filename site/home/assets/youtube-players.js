// Click-to-load YouTube players shared by project films and the animation selector.
const youtubePlayers=(()=>{
 const players=new Map()
 function command(frame,func,args=[]){frame.contentWindow?.postMessage(JSON.stringify({event:'command',func,args}),'https://www.youtube-nocookie.com')}
 function pauseAll(except){players.forEach((frame,screen)=>{if(screen!==except)command(frame,'pauseVideo')})}
 function remove(screen){players.get(screen)?.remove();players.delete(screen);screen.classList.remove('has-youtube')}
 function mount(screen,id,title,at){
  document.querySelectorAll('video').forEach(video=>video.pause());pauseAll(screen)
  const existing=players.get(screen)
  if(existing){if(at!==undefined)command(existing,'seekTo',[at,true]);command(existing,'playVideo');return existing}
  const frame=document.createElement('iframe')
  frame.title=title;frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin'
  frame.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&enablejsapi=1&rel=0&origin=${encodeURIComponent(location.origin)}${at!==undefined?'&start='+Math.floor(at):''}`
  screen.querySelectorAll(':scope > img,:scope > video,:scope > button').forEach(el=>{el.hidden=true})
  screen.classList.add('has-youtube');screen.append(frame);players.set(screen,frame)
  return frame
 }
 document.querySelectorAll('[data-youtube-play]').forEach(button=>button.addEventListener('click',()=>{
  const screen=button.closest('[data-youtube]');mount(screen,screen.dataset.youtube,screen.dataset.youtubeTitle||button.getAttribute('aria-label'))
 }))
 document.addEventListener('play',()=>pauseAll(),true)
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAll()})
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting){const frame=players.get(entry.target);if(frame)command(frame,'pauseVideo')}}),{threshold:.01})
 document.querySelectorAll('[data-youtube],#featured-screen').forEach(screen=>observer.observe(screen))
 return {mount,remove,pauseAll}
})()
