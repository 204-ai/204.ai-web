// WTA-Web supplies the studio opener and development pilots. Load only the
// selected film after a play action, using the shared whole-surface controls.
{
  const films={
    opener:{src:'assets/wta-opener.mp4',poster:'assets/wta-opener-poster.webp',title:'Welcome to Working Title Animation',description:'A journey through the studio’s animated worlds.',caption:'Studio opener · 41 seconds · Original sound'},
    whatnot:{src:'assets/wta-whatnot-pilot.mp4',poster:'assets/wta-whatnot-poster.webp',title:'Whatnot',description:'The pilot’s snowboard scene, from the holiday feature in progress.',caption:'Development pilot · 2:10 · Original sound'},
    clarissa:{src:'assets/wta-clarissa-pilot.mp4',poster:'assets/wta-clarissa-poster.webp',title:'Clarissa',description:'The pilot episode in a portrait reel cut. The full frame is preserved.',caption:'Development pilot · 1:01 · Original sound'},
    process:{src:'assets/clarissa-process.mp4',poster:'assets/clarissa-process-poster.webp',title:'How Clarissa is made',description:'Original scripts and visual references alongside narrated production examples.',caption:'Narrated process reel · 39 seconds'}
  }
  const screen=document.querySelector('#wta-screen'),clip=screen.querySelector('video'),poster=screen.querySelector('img'),play=screen.querySelector('[data-play]')
  document.querySelectorAll('[data-wta-piece]').forEach(button=>button.addEventListener('click',()=>{
    if(button.getAttribute('aria-pressed')==='true')return
    const film=films[button.dataset.wtaPiece]
    clip.pause();clip.hidden=true;clip.removeAttribute('src')
    clip.dataset.src=film.src;clip.setAttribute('aria-label',film.title);clip.load()
    poster.hidden=false;poster.src=film.poster;poster.alt='A frame from '+film.title
    document.querySelector('#wta-film-title').textContent=film.title
    document.querySelector('#wta-film-description').textContent=film.description
    document.querySelector('#wta-film-caption').textContent=film.caption
    document.querySelectorAll('[data-wta-piece]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))
    screen.classList.remove('has-video');play.classList.remove('is-playing')
    play.setAttribute('aria-label','Play '+film.title)
  }))
}
