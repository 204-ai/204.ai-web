// Preserve links shared before the chapters moved to separate pages.
;(()=>{
 const base=document.querySelector('meta[name="204-site-base"]')?.content||'/'
 // Some static preview hosts serve the home fallback for bare directory URLs.
 if(location.pathname===base+'services'||location.pathname===base+'technology'){
  location.replace(base+'services/'+location.search+location.hash);return
 }
 if(location.pathname===base+'work/alan-watts'){
  location.replace(base+'work/alan-watts/'+location.search+location.hash);return
 }
 const chapters={productions:['productions','production-overview','alan-watts','working-title','dimination','dunbrae-making-of'],experiences:['experiences','magic-mirror','magic-photo-booth','texas-eclipse-reel','texas-recordings','texas-drum','immersive-dome'],services:['technology']}
 if(location.pathname===base){
  const id=location.hash.slice(1)
  for(const [page,ids] of Object.entries(chapters))if(ids.includes(id)){location.replace(base+page+'/'+location.hash);return}
 }
 function revealDetails(){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));const details=target?.closest('details');if(details)details.open=true}
 addEventListener('hashchange',revealDetails);revealDetails()
 const menu=document.querySelector('.site-menu')
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus()}})
 document.addEventListener('click',event=>{if(menu?.open&&!menu.contains(event.target))menu.open=false})
})()
