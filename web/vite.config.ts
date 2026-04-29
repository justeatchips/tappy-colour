import { defineConfig } from 'vitest/config'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { collectDistPrecacheUrls } from './build/precacheManifest'

export default defineConfig({
  base: '/tappy-colour/',
  build: {
    target: 'es2022',
    outDir: 'dist',
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html') }
    }
  },
  worker: { format: 'es' },
  server: { host: '127.0.0.1', port: 5173 },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
  },
  plugins: [
    {
      name: 'inject-sw-version',
      closeBundle() {
        const distPath = resolve(__dirname, 'dist')
        const swPath = resolve(__dirname, 'dist/service-worker.js')
        try {
          const content = readFileSync(swPath, 'utf-8')
          const precacheUrls = collectDistPrecacheUrls(distPath)
          const patched = content
            .replace('__SW_VERSION__', Date.now().toString())
            .replace('__PRECACHE_URLS__', JSON.stringify(precacheUrls, null, 2))
          writeFileSync(swPath, patched)
        } catch {}
      }
    }
  ]
})
