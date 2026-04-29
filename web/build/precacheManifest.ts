import { readdirSync, statSync } from 'fs'
import { relative, resolve, sep } from 'path'

export function collectDistPrecacheUrls(distDir: string): string[] {
  const urls = ['./']
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir).sort()) {
      const fullPath = resolve(dir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        walk(fullPath)
        continue
      }

      const distPath = relative(distDir, fullPath).split(sep).join('/')
      if (distPath === 'service-worker.js') continue
      if (distPath === 'index.html') continue

      urls.push(`./${distPath}`)
    }
  }

  walk(distDir)
  return urls
}
