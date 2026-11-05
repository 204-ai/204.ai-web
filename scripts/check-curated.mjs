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
for(const page of ['productions','experiences','services']){
 if(!home.includes(`href="${base}${page}/"`))errors.push(`Missing homepage choice ${page}`)
 const html=readFileSync(join(dist,page,'index.html'),'utf8')
 if(!html.includes('class="site-header"')||!html.includes('class="site-footer"'))errors.push(`Missing common shell: ${page}`)
 if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`Expected one page heading: ${page}`)
}
const services=readFileSync(join(dist,'services/index.html'),'utf8')
if(!/<h3 id="featured-technology-title">[^]*?Art &amp; Tech\.[^]*?<\/h3>/.test(home))errors.push('Missing Art & Tech homepage panel')
for(const id of ['studio-artworks','technology','services','content-services','interactive-services']){
 if(!services.includes(`id="${id}"`))errors.push(`Missing Art & Tech section ${id}`)
}
if((services.match(/class="capability"/g)||[]).length!==4)errors.push('Expected four workflow examples')
if(services.includes('prompin-walkthrough'))errors.push('Prompin walkthrough is still on Services')
for(const id of ['production-showreel','magic-mirror','dome-player','featured-screen'])if(home.includes(`id="${id}"`))errors.push(`Homepage still contains full chapter ${id}`)
const productions=readFileSync(join(dist,'productions/index.html'),'utf8'),experiences=readFileSync(join(dist,'experiences/index.html'),'utf8')
for(const id of ['production-showreel','alan-watts','working-title','dimination','dunbrae-making-of'])if(!productions.includes(`id="${id}"`))errors.push(`Missing production content ${id}`)
for(const id of ['magic-mirror','magic-booth','immersive-dome','texas-eclipse-reel'])if(!experiences.includes(`id="${id}"`))errors.push(`Missing experience content ${id}`)
if(!productions.includes('September 2026'))errors.push('Missing September reel')
if(!productions.includes('1 of 4: A family of Dimi'))errors.push('Family carousel must start first')
const alanWatts=readFileSync(join(dist,'work/alan-watts/index.html'),'utf8')
if(!productions.includes(`href="${base}work/alan-watts/"`))errors.push('Missing Alan Watts collaboration link')
for(const [page,html] of [['Productions',productions],['Alan Watts',alanWatts]]){
 if(!html.includes('id="featured-screen"')||(html.match(/data-piece="/g)||[]).length!==4)errors.push(`Missing Alan Watts film selector on ${page}`)
}
const archives=readFileSync(join(dist,'archives/index.html'),'utf8')
for(const id of ['archive-analysis','archive-preservation','archive-activation','archive-pilot'])if(!archives.includes(`id="${id}"`))errors.push(`Missing archive section ${id}`)
if(!archives.includes('class="site-header"')||!archives.includes('class="site-footer"'))errors.push('Missing common archive shell')
if(!archives.includes('with advisory from 204.ai'))errors.push('Missing Coilendar attribution')
if(!existsSync(join(dist,'app-shell.html')))errors.push('Missing route fallback')
const videos=walk(join(dist,'media/site'))
for(const f of videos)if(statSync(f).size>10*1024*1024)errors.push(`Oversized chapter video: ${f}`)
if(release.bytes>256*1024*1024)errors.push('Release over budget')
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`CURATED_CHECK_PASS: ${files.length} text files, ${videos.length} videos, ${(release.bytes/1e6).toFixed(1)} MB release`)
