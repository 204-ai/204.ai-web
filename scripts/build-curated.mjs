// Package the approved static chapters alongside the React case/service routes.
// Code/images/fonts use a versioned directory; large MP4s keep individual content hashes.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { siteHeader, siteFooter } from '../src/lib/site-shell.ts'
import { buildContent, servicePath } from '../src/data/content.ts'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),source=join(root,'site'),dist=join(root,'dist')
const base=process.env.VITE_BASE||'/',siteUrl=(process.env.SITE_URL||'https://studio204-web.web.app').replace(/\/$/,'')
const readContent=name=>JSON.parse(readFileSync(join(root,'content',name+'.json'),'utf8'))
const content=buildContent({studio:readContent('studio'),services:readContent('services'),works:readContent('works'),people:readContent('people'),redirects:readContent('redirects')})
const chapterRoutes={ 'home/index.html':'', 'home/productions.html':'productions/', 'home/experiences.html':'experiences/', 'home/services.html':'services/', 'home/archives.html':'archives/', 'home/alan-watts.html':'work/alan-watts/', 'home/ciurlionis.html':'work/m-k-ciurlionis-trail-of-angels/' }
for(const entry of readdirSync(join(source,'home/artworks')).filter(name=>name.endsWith('.html'))){
 chapterRoutes['home/artworks/'+entry]='artworks/'+entry.slice(0,-5)+'/'
}
const escape=s=>s.replaceAll('&','&amp;').replaceAll('\"','&quot;').replaceAll('<','&lt;')
const hash=data=>createHash('sha256').update(data).digest('hex').slice(0,12)
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)])}
const sourceFiles=walk(source).filter(f=>!f.endsWith('.md')).sort()
const digest=hash(Buffer.concat(sourceFiles.map(f=>Buffer.concat([Buffer.from(relative(source,f)),readFileSync(f)]))))
const files=sourceFiles.filter(f=>!f.endsWith('.partial.html'))
const chapterPartials=Object.fromEntries(['alan-watts-films','dome-experience','archive-research','archive-article','archive-slides'].map(name=>[name,readFileSync(join(source,'home',name+'.partial.html'),'utf8')]))
const bundle=`assets/site-${digest}`
const urls=new Map()
for(const file of files){
 const rel=relative(source,file).replaceAll('\\','/'),ext=extname(file)
 if(ext==='.html')urls.set(file,base+(rel in chapterRoutes?chapterRoutes[rel]+'index.html':rel))
 else if(ext==='.mp4')urls.set(file,base+`media/site/${rel.replace(/\.mp4$/,'').replaceAll('/','-')}-${hash(readFileSync(file))}.mp4`)
 else urls.set(file,base+`${bundle}/${rel}`)
}
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
function transform(text,file){
 const rel=relative(source,file).replaceAll('\\','/'),group=rel.startsWith('home/')?'home':'sentient-studio'
 const docDir=rel.includes('/presentation/')?join(source,'sentient-studio/presentation'):join(source,group)
 const refDir=file.endsWith('.css')?dirname(file):docDir
 for(const target of files){
  const ref=relative(refDir,target).replaceAll('\\','/'),url=urls.get(target)
  for(const variant of [ref,'./'+ref])text=text.replace(new RegExp(`(["'\x60])${esc(variant)}(?=[#?"'\x60])`,'g'),(_,quote)=>quote+url)
 }
 // Dynamic thumbnail templates use the same versioned asset directory.
 text=text.replace(/(["'`])assets\//g,`$1${base}${bundle}/${group}/assets/`)
 // Static chapter links must select generated route directories on any static host.
 text=text.replace(/(["'`])(\/(?:productions|experiences|technology|archives|artworks|work|services|about|contact|makers)(?:\/[^"'`?#\s]*)?)(?=[?#"'`])/g,(_,quote,path)=>quote+(path.endsWith('/')||/\.[a-z0-9]+$/i.test(path)?path:path+'/'))
 // Root-relative navigation/media stay valid for both Firebase and the retained GH Pages build.
 if(base!=='/')text=text.replace(/(["'`])\/(favicon\.svg|media|productions|experiences|technology|archives|artworks|work|services|about|contact|makers|sentient-studio)(?=[\/\?#"'`])/g,`$1${base}$2`).replace(/(href=["'])\/(#|["'])/g,`$1${base}$2`)
 if(/127\.0\.0\.1|localhost|\/Users\//.test(text))throw Error(`Local path leaked into public chapter ${rel}`)
 return text
}
const bridge=urls.get(join(source,'home/assets/review-navigation.js'))
const headingInkCss=urls.get(join(source,'home/assets/heading-ink.css'))
const headingInkJs=urls.get(join(source,'home/assets/heading-ink.js'))
const headerScroll=urls.get(join(source,'home/assets/site-header-scroll.js'))
const headingEffects=`<link rel="stylesheet" href="${headingInkCss}"><script defer src="${headingInkJs}"></script>`
const siteEffects=headingEffects+`<script defer src="${headerScroll}"></script>`
for(const file of walk(dist).filter(f=>f.endsWith('.html'))){
 let html=readFileSync(file,'utf8');if(html.includes('http-equiv="refresh"'))continue
 const effects=html.includes('id="root"')?headingEffects:''
 html=html.replace('</head>',`<meta name="204-site-base" content="${base}"><script src="${bridge}"></script>${effects}</head>`)
 writeFileSync(file,html)
}
copyFileSync(join(dist,'index.html'),join(dist,'app-shell.html'))
for(const file of files){
 const url=urls.get(file),target=join(dist,url.slice(base.length));mkdirSync(dirname(target),{recursive:true})
 if(/\.(html|css|js|json|svg)$/.test(file)){
  const raw=readFileSync(file,'utf8')
  let text=transform(file.endsWith('.html')?raw.replace(/<!-- site:([a-z-]+) -->/g,(marker,name)=>chapterPartials[name]??marker):raw,file)
  if(file.endsWith('.html')){
   const rel=relative(source,file).replaceAll('\\','/'),route=chapterRoutes[rel]
   if(route!==undefined){
    const navigationRoute=route.startsWith('artworks/')?'services/':route==='archives/'||route.startsWith('work/')?'productions/':route
    text=text.replace('<!-- site:header -->',siteHeader(base,content.studio,navigationRoute)).replace('<!-- site:footer -->',siteFooter(base,content.studio))
    if(route==='')text=text.replace('<!-- site:mission -->',escape(content.studio.copy.home.who))
    text=text.replace(/<!-- site:services:(content|interactive) -->/g,(_,pillar)=>{
     const title=pillar==='content'?'Production services':'Experience services'
     const heading=route==='services/'?'h3':'h2'
     const allServices=route==='services/'?'':`<a href="${base}services/#services">All services ↗</a>`
     const services=content.pillars[pillar].map(service=>{
      const thumbnail=urls.get(join(source,'home/assets/service-thumbnails',service.id+'.webp'))
      const image=thumbnail?`<img class="chapter-service-thumb" src="${thumbnail}" width="420" height="168" alt="" loading="lazy" decoding="async">`:''
      const description=escape(service.desc.replace(/\n/g,' '))
      return `<a href="${base}${servicePath(service).slice(1)}/">${image}<span class="chapter-service-copy"><strong>${escape(service.label)}</strong><small>${description}</small></span><span aria-hidden="true">↗</span></a>`
     }).join('')
     return `<div class="chapter-services-head"><${heading}>${title}</${heading}>${allServices}</div><div class="chapter-services-list">${services}</div>`
    })
   }
   if(rel==='sentient-studio/index.html'){
    text=text.replace(/<header[\s\S]*?<\/header>/,siteHeader(base,content.studio,'experiences/')).replace(/<footer>[\s\S]*?<\/footer>/,siteFooter(base,content.studio))
    text=text.replace('</head>',`<link rel="stylesheet" href="${urls.get(join(source,'home/assets/site-shell.css'))}"></head>`)
   }
   if(route!==undefined||rel==='sentient-studio/index.html'){
    text=text.replace('</head>',siteEffects+'</head>')
    const title=text.match(/<title>([\s\S]*?)<\/title>/)[1],desc=text.match(/<meta name="description" content="([^"]*)"/)[1]
    const canonical=siteUrl+'/'+(route??'sentient-studio/')
    const image=siteUrl+'/media/204white-p-800.jpg'
    text=text.replace('</head>',`<meta name="204-site-base" content="${base}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${desc}"><meta property="og:type" content="website"><meta property="og:image" content="${image}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${canonical}"></head>`)
    // Shell assets come from the same source as the catalog; prefix their media URLs too.
    if(base!=='/')text=text.replace(/(["'])\/media\//g,`$1${base}media/`)
   }
  }
  writeFileSync(target,text)
 }else copyFileSync(file,target)
}
// Include the new physical-space page in the generated sitemap; chapter anchors share /.
const sitemap=join(dist,'sitemap.xml')
try{
 let xml=readFileSync(sitemap,'utf8')
 for(const route of Object.values(chapterRoutes).filter(route=>route.startsWith('work/'))){
  xml=xml.replace(`<loc>${siteUrl}/${route.slice(0,-1)}</loc>`,`<loc>${siteUrl}/${route}</loc>`)
 }
 const chapterUrls=['productions/','experiences/','archives/','sentient-studio/',...Object.values(chapterRoutes).filter(route=>route.startsWith('artworks/'))]
 xml=xml.replace('</urlset>',chapterUrls.map(path=>`<url><loc>${siteUrl}/${path}</loc></url>`).join('')+'</urlset>')
 writeFileSync(sitemap,xml)
}catch{/* SITE_URL may be intentionally absent in a local build. */}
const all=walk(dist),bytes=all.reduce((n,f)=>n+statSync(f).size,0)
if(bytes>256*1024*1024)throw Error(`Deployment exceeds the 256 MiB release budget: ${bytes}`)
for(const f of files)if(f.endsWith('.mp4')&&statSync(f).size>10*1024*1024)throw Error(`Chapter video exceeds 10 MiB: ${relative(source,f)}`)
writeFileSync(join(dist,'release.json'),JSON.stringify({format:1,chapterVersion:digest,sourceCommit:process.env.GITHUB_SHA||null,files:all.length,bytes},null,2)+'\n')
console.log(`curated build: ${digest}, ${(bytes/1e6).toFixed(1)} MB, ${all.length} files; home + Productions + Experiences + Services + Archives + Sentient Studio + catalog`)
