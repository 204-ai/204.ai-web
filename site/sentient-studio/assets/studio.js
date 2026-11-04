{
  const $=s=>document.querySelector(s)
  const reels={
    sense:{
      theme:'studio',poster:'assets/sense-reel.webp',video:'assets/sense-reel.mp4',
      title:'Read the room.',description:'See floorplan tracking, the depth camera, audio and the lever pull at the same time. The reel shows five seconds in a grid, then five seconds side by side.',
      credit:'RnA Studio · Floorplan, depth, audio and lever',alt:'Four views showing the RnA Studio floorplan, depth camera, audio waveform and lever'
    },
    dream:{
      theme:'animation',poster:'assets/dream-reel.webp',video:'assets/dream-reel.mp4',
      title:'Three paths from input to image.',
      description:'FluxRT uses FLUX.2 Klein to restyle live video as prompts change. StreamDiffusion transforms the camera feed and returns it to the mirror over WebRTC. The Magic Photo Booth sends a portrait and style prompt to Qwen Image Edit in ComfyUI.',
      credit:'FluxRT · SD-WebRTC · Magic Photo Booth',alt:'Two people restyled as an oil painting in the FluxRT reel'
    },
    evolve:{
      theme:'storm',poster:'assets/evolve-reel.webp',video:'assets/evolve-reel.mp4',
      title:'One storm, two views.',description:'Follow the lightning sequence from the shared canvas to Studio World, where the view moves from the immersive room entrance into the gallery.',
      credit:'RnA Studio shared canvas and Studio World · Contains lightning flashes',
      alt:'The shared-canvas monitor showing the lightning sequence routed to studio feeds',flashes:true
    }
  }
  const rooms={mirror:{poster:'presentation/media/mirror.jpg',video:'presentation/media/mirror.mp4',kind:'Live transformation',title:'Magic Mirror',description:'Stand in front of it and see your movement transformed into a new visual character, live.',credit:'204.ai · October 2025 · Silent recording'},bigwall:{poster:'presentation/media/big-wall-gypsy-blood.jpg',alt:'An audience watches Gypsy Blood projected on the Big Wall at RnA Studio',kind:'Large projection',title:'Big Wall',description:'The main room’s long wall gives films and visuals room to fill the space. Here it hosts a screening of Francesco Tomba’s documentary Gypsy Blood.',credit:'Gypsy Blood · Screening at RnA Studio, Lisbon'},gallery:{poster:'presentation/media/room-gallery.jpg',kind:'A distributed gallery',title:'Art gallery',description:'Eight networked art frames can change together with the show, turning individual works into one environment.',credit:'Photo: RnA Studio, Lisbon'},cinema:{poster:'presentation/media/room-mainwall.jpg',alt:'A seated audience faces a large projection during a screening',kind:'A place to watch together',title:'Cinema',description:'A space for screenings and talks, and a possible final chapter in a story that moves through the studio.',credit:'Photo: RnA Studio, Lisbon'},book:{poster:'presentation/media/magic-photo-book.jpg',video:'presentation/media/magic-photo-book.mp4',videoTitle:'the Magic Photo Booth reel',alt:'A portrait countdown appears on a projected open book',kind:'A physical input',title:'Photo Booth & Book',description:'Take a portrait, see it appear inside a projected open book, and pick up a printed copy. This excerpt shows the booth in use at the MiniMax Creator Talk.',credit:'Magic Photo Booth reel · RnA Studio, Lisbon · 9 sec'},immersive:{poster:'presentation/media/tbilisi-timewall.jpg',video:'presentation/media/tbilisi-timewall.mp4',alt:'The Tbilisi skyline beside a visitor interacting with the projection at RnA Studio',kind:'Responsive projection',title:'Immersive Room',description:'In Tbilisi Timewall, Vincent Naples turns a city time-lapse into a projection that responds to visitors’ movements. The clip pairs the original time-lapse with a view from inside the room.',credit:'Tbilisi Timewall · Vincent Naples (DRMBT) · Recorded at RnA Studio, Lisbon · 8 sec',videoTitle:'Tbilisi Timewall'}}
  let room=rooms.gallery
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
  const loopReel=$('.loop-reel')
  const loopPoster=$('#loop-poster')
  const loopPlay=$('#loop-play')
  const stageButtons=[...document.querySelectorAll('[data-loop]')]
  let stage='sense'

  function selectStage(key,autoplay){
    stage=key
    const reel=reels[key]
    const label=key[0].toUpperCase()+key.slice(1)
    $('#loop').dataset.ascii=reel.theme
    loopReel.setAttribute('aria-label',label+' reel')
    stageButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.loop===key)))
    reset(loopVideo,loopPoster,loopPlay,reel.poster)
    loopPoster.alt=reel.alt
    loopVideo.setAttribute('aria-label',label+' reel')
    loopPlay.textContent='▶ Play '+label+(reel.flashes?' · Contains flashes':'')
    $('#loop-title').textContent=reel.title
    $('#loop-description').textContent=reel.description
    $('#loop-credit').textContent=reel.credit
    if(autoplay&&!reducedMotion.matches&&!reel.flashes)play(loopVideo,loopPoster,loopPlay,reel.video)
  }

  stageButtons.forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.loop!==stage)selectStage(button.dataset.loop,true)
  }))
  $('.loop-tabs').addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return
    const step=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0
    const index=stageButtons.indexOf(event.target)
    if(!step||index<0)return
    event.preventDefault()
    const next=stageButtons[(index+step+stageButtons.length)%stageButtons.length]
    next.click()
    next.focus()
  })
  loopPlay.addEventListener('click',()=>play(loopVideo,loopPoster,loopPlay,reels[stage].video))

  const roomBrowser=$('.rooms-browser')
  const roomButtons=[...roomBrowser.querySelectorAll('[data-room]')]
  const roomKeys=Object.keys(rooms)
  const roomCycle=$('#room-cycle')
  const roomSelection=$('#plan-selection')
  const roomCopy=$('.room-copy')
  let tourPaused=false,mapVisible=false,tourHovered=false,tourFocused=false,tourTimer

  function scheduleRoomTour(){
    clearTimeout(tourTimer)
    const enabled=!tourPaused&&!reducedMotion.matches
    roomCycle.hidden=reducedMotion.matches
    roomCycle.textContent=tourPaused?'Play room tour':'Pause room tour'
    roomSelection.setAttribute('aria-live',enabled?'off':'polite')
    roomCopy.setAttribute('aria-live',enabled?'off':'polite')
    if(!enabled||!mapVisible||document.hidden||tourHovered||tourFocused)return
    tourTimer=setTimeout(()=>{
      const next=(roomKeys.indexOf(currentRoom)+1)%roomKeys.length
      showRoom(roomKeys[next],false)
      scheduleRoomTour()
    },6000)
  }

  function pauseRoomTour(){
    tourPaused=true
    scheduleRoomTour()
  }

  let currentRoom='gallery'
  function showRoom(key,autoplay=true){
    currentRoom=key
    room=rooms[key]
    const poster=$('#room-poster'),playButton=$('#room-play')
    reset(roomVideo,poster,playButton,room.poster)
    playButton.hidden=!room.video
    playButton.textContent=room.videoTitle?'▶ Play '+room.videoTitle:'▶ Play room clip'
    roomVideo.setAttribute('aria-label',room.videoTitle||room.title+' room clip')
    $('#room-kind').textContent=room.kind
    $('#room-title').textContent=room.title
    $('#room-description').textContent=room.description
    $('#room-credit').textContent=room.credit
    poster.alt=room.alt||room.title+' at RnA Studio'
    roomSelection.textContent='Selected: '+room.title
    roomButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.room===key)))
    roomAutoplayPending=autoplay&&key==='mirror'&&!reducedMotion.matches
    maybeAutoplayRoom()
  }

  roomCycle.addEventListener('click',()=>{
    tourPaused=!tourPaused
    scheduleRoomTour()
  })
  new IntersectionObserver(([entry])=>{
    mapVisible=entry.intersectionRatio>=.35
    scheduleRoomTour()
  },{threshold:.35}).observe($('.floorplan-map'))
  for(const area of [$('.floorplan-map'),$('.room-tabs'),roomDetail]){
    area.addEventListener('pointerenter',event=>{
      if(event.pointerType!=='mouse')return
      tourHovered=true
      scheduleRoomTour()
    })
    area.addEventListener('pointerleave',event=>{
      if(event.pointerType!=='mouse')return
      tourHovered=false
      scheduleRoomTour()
    })
  }
  roomBrowser.addEventListener('focusin',event=>{
    tourFocused=event.target!==roomCycle
    scheduleRoomTour()
  })
  roomBrowser.addEventListener('focusout',event=>{
    tourFocused=roomBrowser.contains(event.relatedTarget)&&event.relatedTarget!==roomCycle
    scheduleRoomTour()
  })
  document.addEventListener('visibilitychange',scheduleRoomTour)
  reducedMotion.addEventListener('change',scheduleRoomTour)
  scheduleRoomTour()

  roomButtons.forEach(button=>button.addEventListener('click',event=>{
    pauseRoomTour()
    showRoom(button.dataset.room)
    if(sideBySide.matches)return
    if(event.detail===0)roomDetail.focus({preventScroll:true})
    roomDetail.scrollIntoView({block:'start',behavior:reducedMotion.matches?'instant':'smooth'})
  }))
  $('#room-play').addEventListener('click',()=>{
    pauseRoomTour()
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
  $('#gallery-explore').addEventListener('click',()=>{
    pauseRoomTour()
    showRoom(currentView.room)
  })
}
