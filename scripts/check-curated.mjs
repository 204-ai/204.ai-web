// Validate deployable chapter links and release budgets without a browser.
import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs'
import {join,dirname,resolve} from 'node:path'
const dist=resolve('dist'),base=process.env.VITE_BASE||'/'
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)])
const errors=[]
const release=JSON.parse(readFileSync(join(dist,'release.json')))
const files=walk(dist).filter(f=>f.endsWith('.html')||f.includes(`/assets/site-${release.chapterVersion}/`)&&/\.(js|css|json|svg)$/.test(f))
for(const file of files){
 const text=readFileSync(file,'utf8')
 if(/\/Users\/|127\.0\.0\.1|localhost/.test(text))errors.push(`Local path in ${file}`)
 const refs=[...text.matchAll(/(?:["'`])((?:\/|\.\.?\/)[^"'`\s<>]+\.(?:js|css|json|svg|webp|png|jpe?g|woff2?|mp4|vtt|html))(?:[?#][^"'`\s<>]*)?["'`]/g)].map(m=>m[1])
 if(file.endsWith('.css'))refs.push(...[...text.matchAll(/url\((?!["'])([^)]+)\)/g)].map(m=>m[1]))
 for(const ref of refs){
  if(ref.includes('${')||ref.startsWith('//')||ref.startsWith('data:'))continue
  const target=ref.startsWith('/')?join(dist,ref.slice(base.length)):resolve(dirname(file),ref)
  if(!existsSync(target))errors.push(`Missing ${ref} in ${file.slice(dist.length)}`)
 }
}
const home=readFileSync(join(dist,'index.html'),'utf8')
for(const id of ['productions','experiences','technology','magic-mirror','magic-photo-booth','dimination','immersive-dome'])if(!home.includes(`id="${id}"`))errors.push(`Missing chapter ${id}`)
if(!home.includes('September 2026')||!home.includes('production-showreel'))errors.push('Missing September reel')
if(!home.includes('1 of 3: A family of Dimi'))errors.push('Family carousel must start first')
if(!existsSync(join(dist,'app-shell.html')))errors.push('Missing route fallback')
const videos=walk(join(dist,'media/site'))
for(const f of videos)if(statSync(f).size>10*1024*1024)errors.push(`Oversized chapter video: ${f}`)
if(release.bytes>256*1024*1024)errors.push('Release over budget')
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`CURATED_CHECK_PASS: ${files.length} text files, ${videos.length} videos, ${(release.bytes/1e6).toFixed(1)} MB release`)
