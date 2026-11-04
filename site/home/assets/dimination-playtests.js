;(()=>{
 const carousel=document.querySelector('.dim-playtests')
 const slides=Array.from(carousel.querySelectorAll('[data-playtest]'))
 const arrows=carousel.querySelector('.playtest-arrows')
 const artworkObserver=new IntersectionObserver(([entry])=>{
  if(!entry.isIntersecting)return
  for(const image of carousel.querySelectorAll('svg image[data-src]')){
   image.setAttribute('href',image.dataset.src)
  }
  artworkObserver.disconnect()
 },{rootMargin:'300px'})
 artworkObserver.observe(carousel)
 const family=document.querySelector('#family-hover'),familyHint=document.querySelector('#family-hint')
 const familyHeads=family.querySelectorAll('[data-family-head]')
 const familyProgress=document.querySelector('#family-progress')
 const revealedHeads=new Set()
 const peel=document.querySelector('#dunbrae-compare')
 const clip=peel.querySelector('video')
 let hintTimer,familyVisible=false
 let nextExerciseTimer
 function scheduleHint(delay=4000){
  clearTimeout(hintTimer);familyHint.hidden=true
  if(familyVisible&&current===0&&!family.querySelector('.is-revealed'))hintTimer=setTimeout(()=>{familyHint.hidden=false},delay)
 }
 const resetFaces=[]
 let current=0
 function select(next,automatic=false){
  clearTimeout(nextExerciseTimer)
  const focused=document.activeElement
  const focusWithinSlide=slides[current].contains(focused)
  const focusedArrow=arrows.contains(focused)?focused:null
  peel.dispatchEvent(new Event('reset-peel'))
  resetFaces.forEach(reset=>reset())
  revealedHeads.clear()
  familyProgress.textContent=`0 / ${familyHeads.length} faces revealed`
  current=(next+slides.length)%slides.length
  slides.forEach((slide,i)=>{slide.hidden=i!==current})
  const controls=slides[current].querySelector('.street-cup-controls')??slides[current].querySelector('.playtest-visual')
  controls.append(arrows)
  if(focusedArrow)focusedArrow.focus({preventScroll:true})
  else if(automatic&&focusWithinSlide)slides[current].querySelector('#dunbrae-pull, [data-street-cup]')?.focus({preventScroll:true})
  document.querySelector('#playtest-count').textContent=`0${current+1} / 0${slides.length}`
  scheduleHint()
 }
 document.querySelector('#playtest-prev').addEventListener('click',()=>select(current-1))
 document.querySelector('#playtest-next').addEventListener('click',()=>select(current+1))
 clip.addEventListener('ended',()=>{
  if(current===1&&peel.classList.contains('is-open'))select(2,true)
 })
 document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight'].includes(event.key))return
  if(event.target.closest('input,textarea,select,video,iframe,[contenteditable="true"]'))return
  const rect=slides[current].querySelector('.playtest-visual').getBoundingClientRect()
  const visible=Math.min(rect.bottom,innerHeight)-Math.max(rect.top,88)
  if(!carousel.contains(document.activeElement)&&visible<Math.min(rect.height*.5,160))return
  event.preventDefault();select(current+(event.key==='ArrowRight'?1:-1))
 })
 const cups=Array.from(document.querySelectorAll('[data-street-cup]'))
 const cupReplay=document.querySelector('#street-cup-replay')
 const cupProgress=document.querySelector('#street-cup-progress')
 const portraits=[
  {name:'Dimi',src:'assets/street-faces.webp',width:1000,height:558,crop:'424 73 244 244'},
  {name:'Fictional decoy',src:'assets/family-countryside-before.webp',width:1000,height:1336,crop:'411 192 180 180'},
  {name:'Fictional decoy',src:'assets/family-countryside-before.webp',width:1000,height:1336,crop:'552 329 190 190'},
  {name:'Fictional decoy',src:'assets/family-countryside-before.webp',width:1000,height:1336,crop:'260 204 185 185'},
  {name:'Fictional decoy',src:'assets/family-countryside-before.webp',width:1000,height:1336,crop:'227 370 183 183'},
 ]
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)')
 let dimiCup=-1
 let lineup=[]

 function shuffleCups(){
  const available=cups.map((_,index)=>index).filter(index=>index!==dimiCup)
  dimiCup=available[Math.floor(Math.random()*available.length)]
  const decoys=portraits.slice(1)
  lineup=cups.map((_,index)=>index===dimiCup?portraits[0]:decoys.splice(Math.floor(Math.random()*decoys.length),1)[0])
  cups.forEach((cup,index)=>{
   delete cup.dataset.result
   cup.removeAttribute('aria-disabled')
   cup.setAttribute('aria-label',`Lift cup ${index+1}`)
   cup.querySelector('.street-cup-portrait').setAttribute('hidden','')
  })
  cupReplay.hidden=true
  cupProgress.textContent=''
 }

 cups.forEach((cup,pick)=>cup.addEventListener('click',()=>{
  if(cup.hasAttribute('aria-disabled'))return
  cups.forEach((choice,index)=>{
   const face=lineup[index]
   const portrait=choice.querySelector('.street-cup-portrait')
   const image=portrait.querySelector('image')
   portrait.setAttribute('viewBox',face.crop)
   image.setAttribute('href',face.src)
   image.setAttribute('width',face.width)
   image.setAttribute('height',face.height)
   portrait.removeAttribute('hidden')
   choice.dataset.result=index===dimiCup?'dimi':index===pick?'miss':'decoy'
   choice.setAttribute('aria-label',`Cup ${index+1}: ${face.name}`)
   choice.setAttribute('aria-disabled','true')
  })
  cupProgress.textContent=pick===dimiCup?'You found Dimi.':`Dimi was under cup ${dimiCup+1}.`
  cupReplay.hidden=false
 }))

 cupReplay.addEventListener('click',()=>{
  shuffleCups()
  cupProgress.textContent='Cups shuffled. Pick again.'
  cups[0].focus({preventScroll:true})
  if(reducedMotion.matches)return
  cups.forEach((cup,index)=>{
   const direction=index===1?-1:1-index
   cup.querySelector('.street-cup-shell').animate([
    {transform:'translate(0, 0) rotate(0)'},
    {transform:`translate(${direction*28}%, -15%) rotate(${direction*12}deg)`},
    {transform:'translate(0, 0) rotate(0)'},
   ],{duration:360,delay:index*55,easing:'ease-in-out'})
  })
 })
 shuffleCups()
 new IntersectionObserver(entries=>{
  familyVisible=entries[0].isIntersecting
  scheduleHint(1500)
 },{threshold:.35}).observe(family)
 familyHeads.forEach(head=>{
  const layer=family.querySelector('[data-face-layer="'+head.dataset.familyHead+'"]')
  let hovering=false,focused=false,tapped=false,timer
  function sync(){
   const shown=hovering||focused||tapped
   layer.classList.toggle('is-revealed',shown)
   head.classList.toggle('is-active',shown)
   if(current===0&&shown&&!revealedHeads.has(head)){
    revealedHeads.add(head)
    const count=revealedHeads.size
    const complete=count===familyHeads.length
    familyProgress.textContent=complete?'All faces revealed. Up next: Sketch → scene.':`${count} / ${familyHeads.length} faces revealed`
    if(complete)nextExerciseTimer=setTimeout(()=>select(1,true),3000)
   }
   scheduleHint()
  }
  head.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){hovering=true;sync()}})
  head.addEventListener('pointerleave',()=>{hovering=false;sync()})
  head.addEventListener('focus',()=>{focused=head.matches(':focus-visible');sync()})
  head.addEventListener('blur',()=>{focused=false;sync()})
  head.addEventListener('click',()=>{
   clearTimeout(timer);tapped=true;sync()
   timer=setTimeout(()=>{tapped=false;sync()},400)
  })
  resetFaces.push(()=>{clearTimeout(timer);hovering=false;focused=false;tapped=false;sync()})
 })
})()
