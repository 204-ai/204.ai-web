;(()=>{
 const carousel=document.querySelector('.dim-playtests')
 const slides=Array.from(carousel.querySelectorAll('[data-playtest]'))
 const resetFaces=[]
 let current=0
 function select(next){
  document.querySelector('#dunbrae-back').click()
  resetFaces.forEach(reset=>reset())
  current=(next+slides.length)%slides.length
  slides.forEach((slide,i)=>{slide.hidden=i!==current})
  document.querySelector('#playtest-count').textContent=`0${current+1} / 0${slides.length}`
 }
 document.querySelector('#playtest-prev').addEventListener('click',()=>select(current-1))
 document.querySelector('#playtest-next').addEventListener('click',()=>select(current+1))
 carousel.addEventListener('keydown',event=>{
  if(event.target.matches('input[type=range]'))return
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();select(current+(event.key==='ArrowRight'?1:-1))}
 })
 const face=document.querySelector('#street-face-toggle'),image=face.querySelector('img'),hint=face.querySelector('span')
 face.addEventListener('click',()=>{
  const shown=face.getAttribute('aria-pressed')!=='true'
  face.setAttribute('aria-pressed',String(shown));face.setAttribute('aria-label',shown?"Mask Dimi's face":"Reveal Dimi's face")
  image.src=`assets/street-${shown?'faces':'mask'}.webp`
  image.alt=shown?'Finished street scene with Dimi as all three characters':'Street scene with a green editing mask over the central face'
  hint.textContent=shown?'Tap to mask ↗':'Tap to unmask ↗'
 })
 const family=document.querySelector('#family-hover')
 const imageObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){family.querySelectorAll('[data-family-src]').forEach(image=>image.setAttribute('href',image.dataset.familySrc));imageObserver.disconnect()}},{rootMargin:'500px'})
 imageObserver.observe(carousel)
 family.querySelectorAll('[data-family-head]').forEach(head=>{
  const layer=family.querySelector('[data-face-layer="'+head.dataset.familyHead+'"]')
  let hovering=false,focused=false,tapped=false,timer
  function sync(){layer.classList.toggle('is-revealed',hovering||focused||tapped)}
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
