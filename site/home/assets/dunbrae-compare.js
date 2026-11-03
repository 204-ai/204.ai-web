{
  const frame=document.querySelector('#dunbrae-compare')
  const range=document.querySelector('#dunbrae-reveal')
  const video=document.querySelector('#dunbrae-result-video')
  const output=document.querySelector('#dunbrae-output')
  const play=document.querySelector('#dunbrae-play')
  const back=document.querySelector('#dunbrae-back')
  let wantsPlay=false
  function reveal(value){
    const p=Math.max(0,Math.min(100,Number(value)))
    frame.style.setProperty('--reveal',`${p}%`)
    range.value=String(p)
    range.setAttribute('aria-valuetext',`${p}% sketch, ${100-p}% directed scene`)
    document.querySelector('#dunbrae-sketch-label').style.opacity=p<8?'0':'1'
    document.querySelector('#dunbrae-output-label').style.opacity=p>92?'0':'1'
  }
  range.addEventListener('input',()=>{
    wantsPlay=false;video.pause();video.hidden=true;output.hidden=false;frame.classList.remove('is-video');back.hidden=true
    document.querySelector('#dunbrae-output-label').textContent='Directed scene'
    reveal(range.value)
  })
  async function toggleMaking(){
    if(!video.paused){wantsPlay=false;video.pause();return}
    wantsPlay=true;reveal(0);output.hidden=true;video.hidden=false;frame.classList.add('is-video');back.hidden=false
    document.querySelectorAll('video').forEach(v=>{if(v!==video)v.pause()})
    try{await video.play()}catch{if(wantsPlay){video.hidden=true;output.hidden=false;wantsPlay=false;frame.classList.remove('is-video');back.hidden=true;play.textContent='▶ Play making-of';document.querySelector('#dunbrae-output-label').textContent='Directed scene'}}
  }
  play.addEventListener('click',toggleMaking)
  video.addEventListener('click',toggleMaking)
  back.addEventListener('click',()=>{range.value='50';range.dispatchEvent(new Event('input'))})
  video.addEventListener('play',()=>{play.textContent='Ⅱ Pause making-of';document.querySelector('#dunbrae-output-label').textContent='Making-of'})
  video.addEventListener('pause',()=>{play.textContent='▶ Play making-of'})
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)video.pause()},{threshold:.01}).observe(frame)
  reveal(range.value)
}
