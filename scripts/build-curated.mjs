// Package the approved static chapters alongside the React case/service routes.
// Code/images/fonts use a versioned directory; large MP4s keep individual content hashes.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { siteHeader, siteFooter } from '../src/lib/site-shell.ts'
import { buildContent } from '../src/data/content.ts'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),source=join(root,'site'),dist=join(root,'dist')
const base=process.env.VITE_BASE||'/',siteUrl=(process.env.SITE_URL||'https://studio204-web.web.app').replace(/\/$/,'')
const readContent=name=>JSON.parse(readFileSync(join(root,'content',name+'.json'),'utf8'))
const content=buildContent({studio:readContent('studio'),services:readContent('services'),works:readContent('works'),people:readContent('people'),redirects:readContent('redirects')})
const chapterRoutes={ 'home/index.html':'', 'home/productions.html':'productions/', 'home/experiences.html':'experiences/', 'home/services.html':'services/', 'home/archives.html':'archives/', 'home/alan-watts.html':'work/alan-watts/' }
const escape=s=>s.replaceAll('&','&amp;').replaceAll('\"','&quot;').replaceAll('<','&lt;')
const hash=data=>createHash('sha256').update(data).digest('hex').slice(0,12)
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)])}
const sourceFiles=walk(source).filter(f=>!f.endsWith('.md')).sort()
const digest=hash(Buffer.concat(sourceFiles.map(f=>Buffer.concat([Buffer.from(relative(source,f)),readFileSync(f)]))))
const files=sourceFiles.filter(f=>!f.endsWith('.partial.html'))
const alanWattsFilms=readFileSync(join(source,'home/alan-watts-films.partial.html'),'utf8')
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
 const rel=relative(source,file).replaceAll('\\','/'),group=rel.startsWith('home/')?'home':'sentient-space'
 const docDir=rel.includes('/presentation/')?join(source,'sentient-space/presentation'):join(source,group)
 const refDir=file.endsWith('.css')?dirname(file):docDir
 for(const target of files){
  const ref=relative(refDir,target).replaceAll('\\','/'),url=urls.get(target)
  for(const variant of [ref,'./'+ref])text=text.replace(new RegExp(`(["'\x60])${esc(variant)}(?=[#?"'\x60])`,'g'),(_,quote)=>quote+url)
 }
 // Dynamic thumbnail templates use the same versioned asset directory.
 text=text.replace(/(["'`])assets\//g,`$1${base}${bundle}/${group}/assets/`)
 // Static chapter links must select generated route directories on any static host.
 text=text.replace(/(["'`])(\/(?:productions|experiences|technology|archives|work|services|about|contact|makers)(?:\/[^"'`?#\s]*)?)(?=[?#"'`])/g,(_,quote,path)=>quote+(path.endsWith('/')||/\.[a-z0-9]+$/i.test(path)?path:path+'/'))
 // Root-relative navigation/media stay valid for both Firebase and the retained GH Pages build.
 if(base!=='/')text=text.replace(/(["'`])\/(media|productions|experiences|technology|archives|work|services|about|contact|makers|sentient-space)(?=[\/\?#"'`])/g,`$1${base}$2`).replace(/(href=["'])\/(#|["'])/g,`$1${base}$2`)
 if(/127\.0\.0\.1|localhost|\/Users\//.test(text))throw Error(`Local path leaked into public chapter ${rel}`)
 return text
}
const bridge=urls.get(join(source,'home/assets/review-navigation.js'))
for(const file of walk(dist).filter(f=>f.endsWith('.html'))){
 let html=readFileSync(file,'utf8');if(html.includes('http-equiv="refresh"'))continue
 html=html.replace('</head>',`<meta name="204-site-base" content="${base}"><script src="${bridge}"></script></head>`)
 writeFileSync(file,html)
}
copyFileSync(join(dist,'index.html'),join(dist,'app-shell.html'))
for(const file of files){
 const url=urls.get(file),target=join(dist,url.slice(base.length));mkdirSync(dirname(target),{recursive:true})
 if(/\.(html|css|js|json|svg)$/.test(file)){
  const raw=readFileSync(file,'utf8')
  let text=transform(file.endsWith('.html')?raw.replace('<!-- site:alan-watts-films -->',()=>alanWattsFilms):raw,file)
  if(file.endsWith('.html')){
   const rel=relative(source,file).replaceAll('\\','/'),route=chapterRoutes[rel]
   if(route!==undefined){
    const navigationRoute=route==='archives/'?'services/':route==='work/alan-watts/'?'productions/':route
    text=text.replace('<!-- site:header -->',siteHeader(base,content.studio.logoUrl,navigationRoute)).replace('<!-- site:footer -->',siteFooter(base,content.studio))
    text=text.replace(/<!-- site:services:(content|interactive) -->/g,(_,pillar)=>{
     const title=pillar==='content'?'Production services':'Experience services'
     const heading=route==='services/'?'h3':'h2'
     const allServices=route==='services/'?'':`<a href="${base}services/#services">All services ↗</a>`
     return `<div class="chapter-services-head"><${heading}>${title}</${heading}>${allServices}</div><div class="chapter-services-list">${content.pillars[pillar].map(service=>`<a href="${base}services/${service.slug}/"><span><strong>${escape(service.label)}</strong><small>${escape(service.desc.replace(/\n/g,' '))}</small></span><span aria-hidden="true">↗</span></a>`).join('')}</div>`
    })
   }
   if(rel==='sentient-space/index.html'){
    text=text.replace(/<header[\s\S]*?<\/header>/,siteHeader(base,content.studio.logoUrl,'experiences/')).replace(/<footer>[\s\S]*?<\/footer>/,siteFooter(base,content.studio))
    text=text.replace('</head>',`<link rel="stylesheet" href="${urls.get(join(source,'home/assets/site-shell.css'))}"></head>`)
   }
   if(route!==undefined||rel==='sentient-space/index.html'){
    const title=text.match(/<title>([\s\S]*?)<\/title>/)[1],desc=text.match(/<meta name="description" content="([^"]*)"/)[1]
    const canonical=siteUrl+'/'+(route??'sentient-space/')
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
try{let xml=readFileSync(sitemap,'utf8');xml=xml.replace(`<loc>${siteUrl}/work/alan-watts</loc>`,`<loc>${siteUrl}/work/alan-watts/</loc>`).replace('</urlset>',['productions/','experiences/','archives/','sentient-space/'].map(path=>`<url><loc>${siteUrl}/${path}</loc></url>`).join('')+'</urlset>');writeFileSync(sitemap,xml)}catch{/* SITE_URL may be intentionally absent in a local build. */}
const all=walk(dist),bytes=all.reduce((n,f)=>n+statSync(f).size,0)
if(bytes>256*1024*1024)throw Error(`Deployment exceeds the 256 MiB release budget: ${bytes}`)
for(const f of files)if(f.endsWith('.mp4')&&statSync(f).size>10*1024*1024)throw Error(`Chapter video exceeds 10 MiB: ${relative(source,f)}`)
writeFileSync(join(dist,'release.json'),JSON.stringify({format:1,chapterVersion:digest,sourceCommit:process.env.GITHUB_SHA||null,files:all.length,bytes},null,2)+'\n')
console.log(`curated build: ${digest}, ${(bytes/1e6).toFixed(1)} MB, ${all.length} files; home + Productions + Experiences + Services + Archives + Sentient Space + catalog`)
