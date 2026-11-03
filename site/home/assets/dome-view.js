// Adapted from the Living Archive DomeView projection and interaction model.
// Media is restricted to the four 204-owned scenes in dome-scenes.json.
import {VERT,FRAG} from './dome-shaders.js'

const $=s=>document.querySelector(s)
const stage=$('#dome-stage'),canvas=$('#dome-canvas'),video=$('#dome-video'),poster=$('#dome-fallback')
const modeButton=$('#dome-mode'),playButton=$('#dome-play'),status=$('#dome-status'),player=$('#dome-player')
const scenes=await fetch(new URL('./dome-scenes.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Scene catalogue unavailable');return r.json()})
let scene=scenes[0],yaw=0,pitch=.22,fov=84,inside=0,targetInside=0,transition=null,drag=null
let visible=false,renderTimer=0,hasTexture=false,lastVideoTime=-1,loadedScene=null,flat=false
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x))
const ease=x=>x*x*(3-2*x)
const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true})
let program,texture,uniforms
function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Projection shader unavailable');return shader}
function setup(){
  if(!gl)throw Error('360 rendering unavailable')
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,VERT));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(program)
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Projection unavailable')
  gl.useProgram(program)
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW)
  const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
  texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture)
  for(const parameter of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,parameter,gl.CLAMP_TO_EDGE)
  for(const parameter of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,parameter,gl.LINEAR)
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,texture);gl.activeTexture(gl.TEXTURE0)
  uniforms=Object.fromEntries(['u_tex','u_next','u_mix','u_res','u_open','u_inside','u_yaw','u_pitch','u_f','u_ready','u_fish'].map(n=>[n,gl.getUniformLocation(program,n)]))
  gl.uniform1i(uniforms.u_tex,0);gl.uniform1i(uniforms.u_next,1);gl.uniform1f(uniforms.u_mix,0);gl.uniform1f(uniforms.u_fish,0)
}
function setFlat(){
  flat=true;stage.classList.add('is-flat');stage.setAttribute('aria-busy','false');status.textContent='360° panorama · flat preview'
  modeButton.disabled=true;modeButton.textContent='Panorama preview';$('#dome-hint').textContent='360° panorama shown flat'
  for(const id of ['#dome-reset','#dome-zoom-in','#dome-zoom-out'])$(id).disabled=true
  canvas.removeAttribute('tabindex');video.controls=true
}
try{setup()}catch{setFlat()}
function announceView(){
  const degrees=((yaw*180/Math.PI)%360+360)%360
  const heading=Math.round(degrees)%360,elevation=Math.round(pitch*180/Math.PI)
  $('#dome-heading-indicator').textContent=`${heading===0?'Front':'Heading'} · ${String(heading).padStart(3,'0')}°`
  if(targetInside){canvas.setAttribute('aria-valuenow',String(heading));canvas.setAttribute('aria-valuetext',`${heading} degrees heading, ${elevation} degrees elevation, ${Math.round(fov)} degree field of view`)}
}
function schedule(){
  if(!visible){const r=stage.getBoundingClientRect();visible=r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}
  // Match Living Archive: timers also advance in embedded panes where rAF can stall.
  if(!renderTimer&&visible&&!document.hidden&&!flat)renderTimer=setTimeout(()=>draw(performance.now()),33)
}
function draw(now){
  renderTimer=0
  if(!visible||document.hidden||flat)return
  const dpr=Math.min(devicePixelRatio||1,1.5),width=Math.max(1,Math.round(canvas.clientWidth*dpr)),height=Math.max(1,Math.round(canvas.clientHeight*dpr))
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
  gl.viewport(0,0,width,height);gl.useProgram(program)
  if(loadedScene===scene.id&&video.readyState>=2&&video.currentTime!==lastVideoTime){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,video);lastVideoTime=video.currentTime;hasTexture=true}
  if(transition){const t=clamp((now-transition.start)/1800,0,1);inside=transition.from+(targetInside-transition.from)*ease(t);if(t===1){transition=null;stage.dataset.view=targetInside?'inside':'dome'}}
  gl.uniform2f(uniforms.u_res,width,height);gl.uniform1f(uniforms.u_open,.72+.28*inside);gl.uniform1f(uniforms.u_inside,inside)
  gl.uniform1f(uniforms.u_yaw,yaw);gl.uniform1f(uniforms.u_pitch,pitch);gl.uniform1f(uniforms.u_f,1/Math.tan(fov*Math.PI/360));gl.uniform1f(uniforms.u_ready,hasTexture?1:0)
  gl.clearColor(.02,.02,.02,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3)
  if(hasTexture){stage.classList.add('is-ready');stage.setAttribute('aria-busy','false')}
  if(transition||(!video.paused&&loadedScene===scene.id))schedule()
}
function loadPoster(){
  hasTexture=false;lastVideoTime=-1;stage.classList.remove('is-ready');stage.setAttribute('aria-busy','true')
  const requested=scene.id;poster.onload=()=>{
    if(requested!==scene.id)return
    if(!flat){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,poster);hasTexture=true;schedule()}
    else stage.setAttribute('aria-busy','false')
    status.textContent=flat?'360° panorama · flat preview':`360° previsualisation · ${Math.round(scene.duration)}s loop`
  }
  poster.onerror=()=>{status.textContent='Scene image unavailable';stage.setAttribute('aria-busy','false')}
  poster.src=scene.poster;poster.alt=`${scene.title}, a 204 original 360° world`
}
function resetView(){yaw=0;pitch=.22;fov=84;announceView();schedule()}
function selectScene(next){
  const resume=!video.paused
  video.pause();video.removeAttribute('src');video.load();video.classList.remove('is-playing');loadedScene=null;scene=next
  $('#dome-scene-title').textContent=scene.title;resetView();loadPoster()
  document.querySelectorAll('[data-dome-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.domeScene===scene.id)))
  if(resume)void playMotion()
}
async function playMotion(){
  const requested=scene.id
  if(loadedScene!==scene.id){video.src=scene.video;video.load();loadedScene=scene.id;lastVideoTime=-1}
  try{await video.play();if(scene.id===requested){video.classList.add('is-playing');schedule()}}
  catch{if(scene.id===requested)status.textContent='Press Play motion to start this scene'}
}
video.addEventListener('play',()=>{document.querySelectorAll('video').forEach(v=>{if(v!==video)v.pause()});playButton.textContent='Pause motion';schedule()})
video.addEventListener('pause',()=>{playButton.textContent='Play motion';schedule()})
video.addEventListener('loadeddata',schedule)
playButton.addEventListener('click',()=>video.paused?playMotion():video.pause())
function setInside(next){
  if(flat)return
  targetInside=next?1:0
  if(reduced){inside=targetInside;transition=null;stage.dataset.view=targetInside?'inside':'dome'}else transition={start:performance.now(),from:inside}
  modeButton.innerHTML=targetInside?'Dome overview <span aria-hidden="true">↙</span>':'Step inside 360° <span aria-hidden="true">↗</span>'
  canvas.setAttribute('role',targetInside?'slider':'button')
  canvas.setAttribute('aria-label',targetInside?'360 degree view; drag or use arrow keys to look around':'Step inside the dome')
  for(const [name,value] of [['aria-valuemin','0'],['aria-valuemax','360']]){if(targetInside)canvas.setAttribute(name,value);else canvas.removeAttribute(name)}
  if(!targetInside){canvas.removeAttribute('aria-valuenow');canvas.removeAttribute('aria-valuetext')}
  $('#dome-hint').textContent=targetInside?'Drag to look · Click to play/pause':'Click the dome to step inside'
  announceView()
  stage.classList.toggle('is-inside',Boolean(targetInside));schedule()
  if(targetInside)void playMotion()
}
modeButton.addEventListener('click',()=>setInside(!targetInside))
$('#dome-reset').addEventListener('click',resetView)
$('#dome-zoom-in').addEventListener('click',()=>{fov=clamp(fov-8,46,100);announceView();schedule()})
$('#dome-zoom-out').addEventListener('click',()=>{fov=clamp(fov+8,46,100);announceView();schedule()})
canvas.addEventListener('pointerdown',e=>{if(flat)return;canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});drag={x:e.clientX,y:e.clientY,yaw,pitch}})
canvas.addEventListener('pointermove',e=>{if(!drag||!targetInside)return;const k=fov*Math.PI/180/canvas.clientHeight;yaw=drag.yaw-(e.clientX-drag.x)*k;pitch=clamp(drag.pitch+(e.clientY-drag.y)*k,-Math.PI/4,Math.PI/4);announceView();schedule()})
canvas.addEventListener('pointerup',e=>{const tap=drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8;drag=null;if(!tap)return;if(!targetInside)setInside(true);else if(video.paused)void playMotion();else video.pause()})
for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=null})
canvas.addEventListener('keydown',e=>{
  if(!targetInside){if(e.key==='Enter'||e.key===' '){e.preventDefault();setInside(true)}return}
  if(e.key==='Enter'||e.key===' '){e.preventDefault();if(video.paused)void playMotion();else video.pause();return}
  const keys={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}
  if(!keys[e.key])return;e.preventDefault();const [x,y]=keys[e.key];yaw+=x*Math.PI/18;pitch=clamp(pitch+y*Math.PI/36,-Math.PI/4,Math.PI/4);announceView();schedule()
})
for(const item of scenes){
  const button=document.createElement('button');button.type='button';button.className='dome-scene';button.dataset.domeScene=item.id;button.setAttribute('aria-pressed',String(item.id===scene.id))
  const image=document.createElement('img');image.src=item.poster;image.alt='';image.loading='lazy'
  const words=document.createElement('span'),title=document.createElement('strong'),type=document.createElement('small');title.textContent=item.title;type.textContent='204 original · 360°'
  words.append(title,type);button.append(image,words);button.addEventListener('click',()=>selectScene(item));$('#dome-scenes').append(button)
}
const fullscreen=$('#dome-fullscreen')
if(!player.requestFullscreen)fullscreen.disabled=true
fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement===player)await document.exitFullscreen();else await player.requestFullscreen()}catch{status.textContent='Full screen is unavailable in this browser'}})
document.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement===player?'Exit full screen':'Full screen';schedule()})
new ResizeObserver(schedule).observe(stage)
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();else{video.pause();clearTimeout(renderTimer);renderTimer=0}},{threshold:.01}).observe(stage)
document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();clearTimeout(renderTimer);renderTimer=0}else schedule()})
stage.dataset.view='dome';loadPoster();announceView()
