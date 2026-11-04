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
