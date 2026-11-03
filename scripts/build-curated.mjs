// Package the approved static chapters alongside the React case/service routes.
// Code/images/fonts use a versioned directory; large MP4s keep individual content hashes.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),source=join(root,'site'),dist=join(root,'dist')
const base=process.env.VITE_BASE||'/',siteUrl=(process.env.SITE_URL||'https://studio204-web.web.app').replace(/\/$/,'')
const hash=data=>createHash('sha256').update(data).digest('hex').slice(0,12)
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)])}
const files=walk(source).filter(f=>!f.endsWith('.md')).sort(),digest=hash(Buffer.concat(files.map(f=>Buffer.concat([Buffer.from(relative(source,f)),readFileSync(f)]))))
const bundle=`assets/site-${digest}`
const urls=new Map()
for(const file of files){
 const rel=relative(source,file).replaceAll('\\','/'),ext=extname(file)
 if(ext==='.html')urls.set(file,base+(rel==='home/index.html'?'index.html':rel))
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
 text=text.replace(/(["'`])(\/(?:work|services|about|contact|makers)(?:\/[^"'`?#\s]*)?)(?=[?#"'`])/g,(_,quote,path)=>quote+(path.endsWith('/')||/\.[a-z0-9]+$/i.test(path)?path:path+'/'))
 // Root-relative navigation/media stay valid for both Firebase and the retained GH Pages build.
 if(base!=='/')text=text.replace(/(["'`])\/(media|work|services|about|contact|makers|sentient-space)(?=[\/\?#"'`])/g,`$1${base}$2`).replace(/(href=["'])\/(#|["'])/g,`$1${base}$2`)
 if(/127\.0\.0\.1|localhost|\/Users\//.test(text))throw Error(`Local path leaked into public chapter ${rel}`)
 return text
}
const generatedRoot=readFileSync(join(dist,'index.html'),'utf8')
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
  let text=transform(readFileSync(file,'utf8'),file)
  if(file.endsWith('home/index.html')){
   text=text.replace(/<title>[\s\S]*?<\/title>/,generatedRoot.match(/<title>[\s\S]*?<\/title>/)[0])
   const metas=[...generatedRoot.matchAll(/<meta (?:property="og:|name="twitter:)[^>]+>/g)].map(m=>m[0]).join('\n')
   text=text.replace('</head>',`${metas}\n<link rel="canonical" href="${siteUrl}/">\n</head>`)
  }
  writeFileSync(target,text)
 }else copyFileSync(file,target)
}
// Include the new physical-space page in the generated sitemap; chapter anchors share /.
const sitemap=join(dist,'sitemap.xml')
try{let xml=readFileSync(sitemap,'utf8');xml=xml.replace('</urlset>',`<url><loc>${siteUrl}/sentient-space/</loc></url></urlset>`);writeFileSync(sitemap,xml)}catch{/* SITE_URL may be intentionally absent in a local build. */}
const all=walk(dist),bytes=all.reduce((n,f)=>n+statSync(f).size,0)
if(bytes>256*1024*1024)throw Error(`Deployment exceeds the 256 MiB release budget: ${bytes}`)
for(const f of files)if(f.endsWith('.mp4')&&statSync(f).size>10*1024*1024)throw Error(`Chapter video exceeds 10 MiB: ${relative(source,f)}`)
writeFileSync(join(dist,'release.json'),JSON.stringify({format:1,chapterVersion:digest,sourceCommit:process.env.GITHUB_SHA||null,files:all.length,bytes},null,2)+'\n')
console.log(`curated build: ${digest}, ${(bytes/1e6).toFixed(1)} MB, ${all.length} files; homepage + Sentient Space + React routes`)
