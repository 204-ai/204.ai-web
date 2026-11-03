{
  const $=s=>document.querySelector(s)
  const film=$('#texas-film'),stage=$('#texas-stage'),video=$('#texas-video'),poster=$('#texas-poster')
  const start=$('#texas-start'),play=$('#texas-play'),sound=$('#texas-sound'),seek=$('#texas-seek'),frame=$('#texas-frame'),fit=$('#texas-fit'),fullscreen=$('#texas-fullscreen'),hint=$('#texas-pan-hint')
  const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`
  const recordings={
    drum:{video:'assets/texas-drum-refined.mp4',poster:'assets/texas-drum-refined-poster.jpg',viewScale:.82,width:1080,height:1920,duration:13.861,title:'Inside the drum.',label:'Texas Eclipse / Live dome projection',description:'Footage filmed from inside a drum, projected around the dome alongside the dancers. Move the frame between the projection overhead and the performance below.',alt:'Drum imagery projected overhead inside the Texas Eclipse dome',note:'Live event recording · 14 seconds · Sound on · Original portrait framing available with Full frame.'},
    android:{video:'assets/texas-android-stabilized.mp4',poster:'assets/texas-android-poster.jpg',width:920,height:1216,duration:11.399,title:'Testing the dome.',label:'Texas Eclipse / Android Jones',description:'Android Jones visuals during a projection test inside the dome. A steadier, tighter view of the overhead imagery, with less empty floor below.',alt:'Android Jones visuals during a projection test inside the Texas Eclipse dome',note:'Projection test · 11 seconds · Stabilized and cropped · Full frame shows the complete processed image.'}
  }
  let selected=recordings.drum
  let loaded=false,fullFrame=false,overflow=0,drag=null,moved=false
  function moveFrame(value){
    const p=Math.max(0,Math.min(100,Number(value)))
    frame.value=String(p);stage.style.setProperty('--frame-y',`${p}%`)
    frame.setAttribute('aria-valuetext',`${Math.round(p)}% down the original frame`)
  }
  function updateFraming(){
    const scale=matchMedia('(max-width:620px)').matches?1:(selected.viewScale??1)
    film.style.setProperty('--view-width',`${scale*100}%`)
    overflow=stage.clientWidth*scale*selected.height/selected.width-stage.clientHeight
    const pannable=!fullFrame&&overflow>2
    stage.classList.toggle('is-pannable',pannable);frame.disabled=!pannable;hint.hidden=!pannable
  }
  async function playRecording(){
    if(!video.paused){video.pause();return}
    const requested=selected
    if(!loaded){video.src=selected.video;video.load();loaded=true}
    document.querySelectorAll('video').forEach(v=>{if(v!==video)v.pause()})
    video.hidden=false;poster.hidden=true
    try{await video.play()}catch{if(selected===requested){video.hidden=true;poster.hidden=false;start.hidden=false;start.textContent='▶ Try playing again'}}
  }
  start.addEventListener('click',playRecording);play.addEventListener('click',playRecording)
  video.addEventListener('play',()=>{start.hidden=true;play.textContent='Pause'})
  video.addEventListener('pause',()=>{play.textContent=video.ended?'Replay':'Play'})
  video.addEventListener('ended',()=>{play.textContent='Replay'})
  video.addEventListener('timeupdate',()=>{seek.value=String(video.currentTime);$('#texas-time').textContent=`${fmt(video.currentTime)} / ${fmt(Math.round(selected.duration))}`})
  video.addEventListener('loadedmetadata',()=>{seek.max=String(video.duration);seek.disabled=false})
  seek.addEventListener('input',()=>{if(loaded&&video.readyState>=1)video.currentTime=Number(seek.value)})
  sound.addEventListener('click',()=>{video.muted=!video.muted;sound.textContent=video.muted?'Sound off':'Sound on';sound.setAttribute('aria-pressed',String(!video.muted))})
  frame.addEventListener('input',()=>moveFrame(frame.value))
  fit.addEventListener('click',()=>{fullFrame=!fullFrame;film.classList.toggle('is-full-frame',fullFrame);fit.setAttribute('aria-pressed',String(fullFrame));fit.textContent=fullFrame?'Fill width':'Full frame';updateFraming()})
  stage.addEventListener('pointerdown',e=>{moved=false;if(frame.disabled||e.target.closest('button'))return;stage.setPointerCapture(e.pointerId);drag={y:e.clientY,value:Number(frame.value)}})
  stage.addEventListener('pointermove',e=>{if(drag){if(Math.abs(e.clientY-drag.y)>6)moved=true;moveFrame(drag.value-(e.clientY-drag.y)/overflow*100)}})
  for(const event of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(event,()=>{drag=null})
  stage.addEventListener('click',e=>{if(e.target.closest('button,input'))return;if(moved){moved=false;return}void playRecording()})
  fullscreen.disabled=!film.requestFullscreen
  fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement===film)await document.exitFullscreen();else await film.requestFullscreen()}catch{fullscreen.textContent='Full screen unavailable'}})
  document.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement===film?'Exit full screen':'Full screen';updateFraming()})
  new ResizeObserver(updateFraming).observe(stage)
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)video.pause()},{threshold:.01}).observe(stage)
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause()})
  document.querySelectorAll('[data-texas-recording]').forEach(button=>button.addEventListener('click',()=>{
    video.pause();video.removeAttribute('src');video.load();loaded=false;video.hidden=true;poster.hidden=false
    selected=recordings[button.dataset.texasRecording]
    video.muted=false;sound.textContent='Sound on';sound.setAttribute('aria-pressed','true')
    poster.src=selected.poster;poster.alt=selected.alt;video.poster=selected.poster;video.setAttribute('aria-label',selected.alt)
    film.style.setProperty('--clip-ratio',`${selected.width}/${selected.height}`)
    $('#texas-frame-direction').textContent=selected===recordings.drum?'Projection ↑ · Performers ↓':'Top ↑ · Bottom ↓';
    frame.setAttribute('aria-label',selected===recordings.drum?'Move video frame from projection overhead to performers below':'Move frame through the Android Jones projection test');
    $('#texas-drum-title').textContent=selected.title;$('#texas-drum-label').textContent=selected.label;$('#texas-description').textContent=selected.description;$('#texas-note').textContent=selected.note
    seek.value='0';seek.max=String(selected.duration);seek.disabled=true;$('#texas-time').textContent=`0:00 / ${fmt(Math.round(selected.duration))}`
    start.textContent='▶ Play recording';start.hidden=false;play.textContent='Play';fullFrame=false;film.classList.remove('is-full-frame');fit.textContent='Full frame';fit.setAttribute('aria-pressed','false')
    document.querySelectorAll('[data-texas-recording]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))
    moveFrame(30);updateFraming()
  }))
  moveFrame(frame.value);updateFraming()
}
