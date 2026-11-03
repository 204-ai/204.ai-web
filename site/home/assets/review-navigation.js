const siteHome=document.querySelector('meta[name="204-site-base"]')?.content||'/'
// A full document load returns from the React detail shell to the curated review homepage.
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
 const link=event.target.closest('a[href]');if(!link||link.target==='_blank')return
 const url=new URL(link.href,location.href)
 if(url.origin===location.origin&&url.pathname===siteHome){event.preventDefault();event.stopPropagation();location.assign(url.href)}
},true)
addEventListener('popstate',()=>{if(location.pathname===siteHome)location.reload()})
