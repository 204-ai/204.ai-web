import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// SPEC V30: intrinsic image sizes for <img width height>, derived at build time from the
// tracked media manifest: no generated file to drift, no runtime ratio probe. Keys carry the
// deploy base, exactly as src/data/studio.ts rebases content paths (GH Pages: /204.ai-web/).
function mediaDims(): Plugin {
  const id = 'virtual:media-dims'
  const manifest = resolve(__dirname, 'scripts/media-manifest.json')
  let base = '/'
  return {
    name: 'media-dims',
    configResolved(config) {
      base = config.base
    },
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(target) {
      if (target !== `\0${id}`) return
      this.addWatchFile(manifest)
      const { local } = JSON.parse(readFileSync(manifest, 'utf8')) as {
        local: Record<string, { path: string; w?: number; h?: number }>
      }
      const dims: Record<string, [number, number]> = {}
      for (const e of Object.values(local))
        if (e.w && e.h && /\.(webp|jpe?g|png)$/.test(e.path)) dims[base + e.path.replace(/^\//, '')] = [e.w, e.h]
      return `export default ${JSON.stringify(dims)}`
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), mediaDims()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // shareable organism sandbox (user 2026-07-22) — a real page in
        // prod; the SITE never mounts the organism (no bleed)
        'organism-lab': resolve(__dirname, 'organism-lab.html'),
        'organism-game': resolve(__dirname, 'organism-game.html'),
      },
    },
  },
})
