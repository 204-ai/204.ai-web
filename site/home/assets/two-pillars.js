// Keep the two-pillar navigation in sync with the section currently in view.
const pillarNav=[...document.querySelectorAll('[data-pillar-nav]')]
const sectionObserver=new IntersectionObserver(entries=>{
 for(const entry of entries)if(entry.isIntersecting){
  for(const link of pillarNav){
   if(link.dataset.pillarNav===entry.target.id)link.setAttribute('aria-current','location')
   else link.removeAttribute('aria-current')
  }
 }
},{rootMargin:'-15% 0px -65% 0px'})
for(const section of document.querySelectorAll('main > .pillar'))sectionObserver.observe(section)
function revealLinkedDetails(){
 const id=decodeURIComponent(location.hash.slice(1))
 if(!id)return
 const target=document.getElementById(id)
 const details=target?.closest('details')
 if(details)details.open=true
}
addEventListener('hashchange',revealLinkedDetails)
revealLinkedDetails()
