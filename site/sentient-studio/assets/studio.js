{
  const $=s=>document.querySelector(s)
  const loops={sense:{poster:'presentation/media/tracking.jpg',video:'presentation/media/tracking.mp4',title:'It notices you.',description:'Depth cameras turn movement into positions and events on a live floorplan. A pull of the photobooth lever becomes another signal the room can answer.',credit:'Live floorplan · 204.ai · October 2026 · Silent recording'},think:{poster:'presentation/media/depth.jpg',video:'presentation/media/depth.mp4',title:'Movement becomes a signal.',description:'Depth information describes where a person is in the space. Real-time AI engines use these inputs to shape the images the room produces.',credit:'Depth point cloud · 204.ai · October 2026 · Silent recording'},react:{poster:'presentation/media/canvas.jpg',video:'presentation/media/canvas.mp4',title:'The room answers in light.',description:'A shared canvas is split into slices. Each projector, mirror and art frame plays the part assigned to it.',credit:'Shared canvas · 204.ai · October 2026 · Silent recording'}}
  const rooms={mirror:{poster:'presentation/media/mirror.jpg',video:'presentation/media/mirror.mp4',kind:'Live transformation',title:'Magic Mirror',description:'Stand in front of it and see your movement transformed into a new visual character, live.',credit:'204.ai · October 2025 · Silent recording'},bigwall:{poster:'presentation/media/big-wall-gypsy-blood.jpg',alt:'An audience watches Gypsy Blood projected on the Big Wall at RnA Studio',kind:'Large projection',title:'Big Wall',description:'The main room’s long wall gives films and visuals room to fill the space. Here it hosts a screening of Francesco Tomba’s documentary Gypsy Blood.',credit:'Gypsy Blood · Screening at RnA Studio, Lisbon'},gallery:{poster:'presentation/media/room-gallery.jpg',kind:'A distributed gallery',title:'Art gallery',description:'Eight networked art frames can change together with the show, turning individual works into one environment.',credit:'Photo: RnA Studio, Lisbon'},cinema:{poster:'presentation/media/room-mainwall.jpg',alt:'A seated audience faces a large projection during a screening',kind:'A place to watch together',title:'Cinema',description:'A space for screenings and talks, and a possible final chapter in a story that moves through the studio.',credit:'Photo: RnA Studio, Lisbon'},book:{poster:'presentation/media/magic-photo-book.jpg',video:'presentation/media/magic-photo-book.mp4',videoTitle:'the Magic Photo Booth reel',alt:'A portrait countdown appears on a projected open book',kind:'A physical input',title:'Photo Booth & Book',description:'Take a portrait, see it appear inside a projected open book, and pick up a printed copy. This excerpt shows the booth in use at the MiniMax Creator Talk.',credit:'Magic Photo Booth reel · RnA Studio, Lisbon · 9 sec'},immersive:{poster:'presentation/media/tbilisi-timewall.jpg',video:'presentation/media/tbilisi-timewall.mp4',alt:'The Tbilisi skyline beside a visitor interacting with the projection at RnA Studio',kind:'Responsive projection',title:'Immersive Room',description:'In Tbilisi Timewall, Vincent Naples turns a city time-lapse into a projection that responds to visitors’ movements. The clip pairs the original time-lapse with a view from inside the room.',credit:'Tbilisi Timewall · Vincent Naples (DRMBT) · Recorded at RnA Studio, Lisbon · 8 sec',videoTitle:'Tbilisi Timewall'}}
  let loop=loops.sense,room=rooms.gallery
  const loopVideo=$('#loop-video'),roomVideo=$('#room-video')
  const roomPlayer=$('#room-player'),roomDetail=roomPlayer.closest('.room-detail')
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)')
  const sideBySide=matchMedia('(min-width: 1100px)')
  let roomInView=false,roomAutoplayPending=false

  function maybeAutoplayRoom(){
    if(!roomAutoplayPending||!roomInView||document.hidden||reducedMotion.matches)return
    roomAutoplayPending=false
    play(roomVideo,$('#room-poster'),$('#room-play'),room.video)
  }

  new IntersectionObserver(([entry])=>{
    roomInView=entry.intersectionRatio>=.35
    maybeAutoplayRoom()
  },{threshold:.35}).observe(roomPlayer)
  document.addEventListener('visibilitychange',maybeAutoplayRoom)
  reducedMotion.addEventListener('change',maybeAutoplayRoom)
  function reset(video,poster,button,src){video.pause();video.removeAttribute('src');video.load();video.hidden=true;poster.hidden=false;poster.src=src;button.hidden=false}
  async function play(video,poster,button,src){if(!video.getAttribute('src'))video.src=src;document.querySelectorAll('video[controls]').forEach(v=>{if(v!==video)v.pause()});video.hidden=false;poster.hidden=true;try{await video.play();if(video.getAttribute('src')===src)button.hidden=true}catch(error){if(error.name==='AbortError'||video.getAttribute('src')!==src)return;video.hidden=true;poster.hidden=false;button.hidden=false;button.textContent='Try playing again'}}
  document.querySelectorAll('[data-loop]').forEach(b=>b.addEventListener('click',()=>{loop=loops[b.dataset.loop];reset(loopVideo,$('#loop-poster'),$('#loop-play'),loop.poster);$('#loop-title').textContent=loop.title;$('#loop-description').textContent=loop.description;$('#loop-credit').textContent=loop.credit;$('#loop-poster').alt=loop.title;document.querySelectorAll('[data-loop]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}))
  $('#loop-play').addEventListener('click',()=>play(loopVideo,$('#loop-poster'),$('#loop-play'),loop.video))
  function showRoom(key){room=rooms[key];reset(roomVideo,$('#room-poster'),$('#room-play'),room.poster);$('#room-play').hidden=!room.video;$('#room-play').textContent=room.videoTitle?'▶ Play '+room.videoTitle:'▶ Play room clip';roomVideo.setAttribute('aria-label',room.videoTitle||room.title+' room clip');$('#room-kind').textContent=room.kind;$('#room-title').textContent=room.title;$('#room-description').textContent=room.description;$('#room-credit').textContent=room.credit;$('#room-poster').alt=room.alt||room.title+' at RnA Studio';$('#plan-selection').textContent='Selected: '+room.title;document.querySelectorAll('[data-room]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.room===key)));roomAutoplayPending=key==='mirror'&&!reducedMotion.matches;maybeAutoplayRoom()}
  document.querySelectorAll('[data-room]').forEach(button=>button.addEventListener('click',event=>{
    showRoom(button.dataset.room)
    if(sideBySide.matches)return
    if(event.detail===0)roomDetail.focus({preventScroll:true})
    roomDetail.scrollIntoView({block:'start',behavior:reducedMotion.matches?'instant':'smooth'})
  }))
  $('#room-play').addEventListener('click',()=>{
    roomAutoplayPending=false
    play(roomVideo,$('#room-poster'),$('#room-play'),room.video)
  })
  document.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',()=>{const parent=b.closest('.player');play(parent.querySelector('video'),parent.querySelector('img'),b,parent.querySelector('video').dataset.video)}))
  const io=new IntersectionObserver(entries=>{for(const e of entries)if(!e.isIntersecting)e.target.pause()},{threshold:.01});document.querySelectorAll('video[controls]').forEach(v=>io.observe(v))
  document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video[controls]').forEach(v=>v.pause())})
  const views={gallery:{src:'assets/gallery-view.jpg',alt:'A wide view of the gallery, with illuminated art frames and a green ceiling',caption:'01 / The gallery · Photo: RnA Studio, Lisbon · Animation: 204.ai',room:'gallery'},space:{src:'assets/space-view.jpg',alt:'Delulu guests gather beside illuminated artworks at RnA Studio, between a blue gallery and a warmly lit main room',caption:'02 / Delulu at RnA Studio, Lisbon · Photo: Ana Viotti',room:'bigwall'},immersive:{src:'assets/immersive-view.jpg',alt:'Visitors watch an underwater world projected across the curved wall at RnA Studio',caption:'03 / Immersive room · Sea Secrets at RnA Studio, Lisbon',room:'immersive'}}
  let currentView=views.gallery
  const lightbox=$('#space-lightbox')
  const galleryAnimation=$('#gallery-animation')
  let galleryInView=false
  function updateGalleryAnimation() {
    const show=currentView===views.gallery&&!reducedMotion.matches
    galleryAnimation.hidden=!show
    if(!show||!galleryInView||document.hidden||lightbox.open){
      galleryAnimation.pause()
      return
    }
    if(!galleryAnimation.hasAttribute('src'))galleryAnimation.src=galleryAnimation.dataset.src
    galleryAnimation.play().catch(()=>{})
  }
  new IntersectionObserver(([entry])=>{
    galleryInView=entry.intersectionRatio>=.15
    updateGalleryAnimation()
  },{threshold:.15}).observe($('#gallery-enlarge'))
  reducedMotion.addEventListener('change',updateGalleryAnimation)
  document.addEventListener('visibilitychange',updateGalleryAnimation)
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{currentView=views[b.dataset.view];updateGalleryAnimation();$('#hero-photo').src=currentView.src;$('#hero-photo').alt=currentView.alt;$('#hero-photo-caption').textContent=currentView.caption;$('#gallery-enlarge').setAttribute('aria-label','Enlarge '+rooms[currentView.room].title+' view');$('#gallery-explore').textContent='Explore '+rooms[currentView.room].title+' on the floorplan ↓';document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));showRoom(currentView.room)}))
  $('#gallery-enlarge').addEventListener('click',()=>{$('#space-lightbox-photo').src=currentView.src;$('#space-lightbox-photo').alt=currentView.alt;$('#space-lightbox-caption').textContent=currentView.caption;lightbox.showModal();updateGalleryAnimation()})
  lightbox.addEventListener('close',updateGalleryAnimation)
  $('#close-space-photo').addEventListener('click',()=>lightbox.close())
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()})
  $('#gallery-explore').addEventListener('click',()=>showRoom(currentView.room))
}
