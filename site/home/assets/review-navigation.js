const siteHome=document.querySelector('meta[name="204-site-base"]')?.content||'/'
const editorialPaths=['','productions/','experiences/','services/','technology/','archives/','sentient-space/','work/alan-watts/'].map(path=>siteHome+path)
const isEditorial=path=>editorialPaths.includes(path.endsWith('/')?path:path+'/')
// Editorial pages use full documents; do not let the catalog router replace them.
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
 const link=event.target.closest('a[href]');if(!link||link.target==='_blank')return
 const url=new URL(link.href,location.href)
 if(url.pathname===location.pathname&&url.hash)return
 if(url.origin===location.origin&&isEditorial(url.pathname)){
  event.preventDefault();event.stopPropagation()
  if(!url.pathname.endsWith('/'))url.pathname+='/'
  location.assign(url.href)
 }
},true)
addEventListener('popstate',()=>{if(isEditorial(location.pathname))location.reload()})
