import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { collectDistPrecacheUrls } from '../../build/precacheManifest'

describe('collectDistPrecacheUrls', () => {
  it('includes built app assets and excludes the service worker itself', () => {
    const distDir = mkdtempSync(join(tmpdir(), 'tappy-colour-dist-'))
    try {
      mkdirSync(join(distDir, 'assets'))
      mkdirSync(join(distDir, 'images'))
      writeFileSync(join(distDir, 'index.html'), '<div id="app"></div>')
      writeFileSync(join(distDir, 'assets', 'main.abc123.js'), '')
      writeFileSync(join(distDir, 'assets', 'style.def456.css'), '')
      writeFileSync(join(distDir, 'images', 'chick.png'), '')
      writeFileSync(join(distDir, 'service-worker.js'), '')

      expect(collectDistPrecacheUrls(distDir)).toEqual([
        './',
        './assets/main.abc123.js',
        './assets/style.def456.css',
        './images/chick.png'
      ])
    } finally {
      rmSync(distDir, { force: true, recursive: true })
    }
  })
})
