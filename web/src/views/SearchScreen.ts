import type { Router } from '../router'
import { View, configureFixedRoot } from './BaseView'
import { sanitizeQuery, filterResults, type OpenverseResult } from '../util/searchSafety'
import { ImportStaging } from '../model/ImportStaging'
import type { SearchAttribution } from '../model/Artwork'
import { blurActiveTextEditingElement, focusTextInputWhenHelpful } from '../util/focus'

const OPENVERSE_BASE = 'https://api.openverse.org/v1/images/'
const PAGE_SIZE = 20
const MAX_SEARCH_IMAGE_BYTES = 15 * 1024 * 1024

type SearchImageKind = 'full' | 'thumbnail'

interface SelectedImageAsset {
  blob: Blob
  kind: SearchImageKind
  url: string
}

export class SearchScreen extends View {
  private root: HTMLElement | null = null
  private abortController: AbortController | null = null

  constructor(private router: Router) {
    super()
  }

  mount(root: HTMLElement): void {
    this.root = root
    configureFixedRoot(root)
    root.style.display = 'flex'
    root.style.flexDirection = 'column'
    root.style.height = '100%'
    this.render()
  }

  unmount(): void {
    this.abortController?.abort()
    this.abortController = null
    if (this.root) {
      this.root.innerHTML = ''
      this.root = null
    }
  }

  private render(): void {
    if (!this.root) return
    this.root.innerHTML = ''

    const page = document.createElement('div')
    page.style.cssText = `
      display: flex; flex-direction: column; height: 100%;
      font-family: system-ui, sans-serif; background: #f9fafb;
    `

    // Header
    const header = document.createElement('div')
    header.style.cssText = `
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px; background: white;
      border-bottom: 1px solid #e5e7eb; flex-shrink: 0;
    `

    const backBtn = document.createElement('button')
    backBtn.textContent = '←'
    backBtn.setAttribute('aria-label', 'Back')
    backBtn.style.cssText = `
      font-size: 22px; background: none; border: none; cursor: pointer;
      min-width: 44px; min-height: 44px; border-radius: 8px; line-height: 1;
      color: #2563eb;
    `
    backBtn.addEventListener('click', () => this.router.navigate('#/'))
    backBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.router.navigate('#/') })

    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'Search for a picture…'
    input.setAttribute('aria-label', 'Search')
    input.style.cssText = `
      flex: 1; padding: 10px 14px; font-size: 16px;
      border: 2px solid #d1d5db; border-radius: 10px; outline: none;
      min-height: 44px; box-sizing: border-box;
    `
    input.addEventListener('focus', () => { input.style.borderColor = '#2563eb' })
    input.addEventListener('blur', () => { input.style.borderColor = '#d1d5db' })

    const searchBtn = document.createElement('button')
    searchBtn.textContent = '🔍'
    searchBtn.setAttribute('aria-label', 'Search')
    searchBtn.style.cssText = `
      font-size: 20px; background: #2563eb; color: white; border: none;
      border-radius: 10px; cursor: pointer; min-width: 44px; min-height: 44px;
      padding: 0 12px; line-height: 1;
    `

    const doSearch = () => {
      input.blur()
      void this.handleSearch(input.value, resultsArea)
    }

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch() })
    searchBtn.addEventListener('click', doSearch)
    searchBtn.addEventListener('touchend', (e) => { e.preventDefault(); doSearch() })

    header.appendChild(backBtn)
    header.appendChild(input)
    header.appendChild(searchBtn)

    // Results area
    const resultsArea = document.createElement('div')
    resultsArea.style.cssText = `
      flex: 1; overflow-y: auto; padding: 16px;
    `
    this.showPlaceholder(resultsArea)

    page.appendChild(header)
    page.appendChild(resultsArea)
    this.root.appendChild(page)

    // Helpful on desktop, noisy on iPad where motion can trigger "Undo Typing".
    setTimeout(() => focusTextInputWhenHelpful(input), 50)
  }

  private showPlaceholder(area: HTMLElement): void {
    area.innerHTML = ''
    const msg = document.createElement('p')
    msg.textContent = 'Type something to search for free pictures!'
    msg.style.cssText = `
      color: #9ca3af; font-size: 16px; text-align: center; margin-top: 40px;
    `
    area.appendChild(msg)
  }

  private showLoading(area: HTMLElement): void {
    area.innerHTML = ''
    const msg = document.createElement('p')
    msg.textContent = 'Searching…'
    msg.style.cssText = `
      color: #6b7280; font-size: 16px; text-align: center; margin-top: 40px;
    `
    area.appendChild(msg)
  }

  private showError(area: HTMLElement, message: string): void {
    area.innerHTML = ''
    const msg = document.createElement('p')
    msg.textContent = message
    msg.style.cssText = `
      color: #dc2626; font-size: 16px; text-align: center; margin-top: 40px; padding: 0 20px;
    `
    area.appendChild(msg)
  }

  private showResults(area: HTMLElement, results: OpenverseResult[]): void {
    area.innerHTML = ''

    if (results.length === 0) {
      const msg = document.createElement('p')
      msg.textContent = 'No pictures found — try different words!'
      msg.style.cssText = `
        color: #9ca3af; font-size: 16px; text-align: center; margin-top: 40px;
      `
      area.appendChild(msg)
      return
    }

    const grid = document.createElement('div')
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    `

    for (const result of results) {
      grid.appendChild(this.makeResultCard(result))
    }

    const credit = document.createElement('p')
    credit.innerHTML = 'Images from <a href="https://openverse.org" target="_blank" rel="noopener">Openverse</a> — free to use'
    credit.style.cssText = `
      color: #9ca3af; font-size: 12px; text-align: center; margin-top: 12px;
    `
    const link = credit.querySelector('a') as HTMLAnchorElement
    if (link) link.style.cssText = 'color: #6b7280;'

    area.appendChild(grid)
    area.appendChild(credit)
  }

  private makeResultCard(result: OpenverseResult): HTMLElement {
    const card = document.createElement('button')
    card.style.cssText = `
      background: white; border: 2px solid #e5e7eb; border-radius: 10px;
      padding: 0; cursor: pointer; overflow: hidden;
      display: flex; flex-direction: column; align-items: stretch;
      min-height: 120px; transition: border-color 0.15s;
    `
    card.setAttribute('aria-label', result.title || 'Search result')
    card.addEventListener('mouseenter', () => { card.style.borderColor = '#2563eb' })
    card.addEventListener('mouseleave', () => { card.style.borderColor = '#e5e7eb' })

    const img = document.createElement('img')
    img.src = result.thumbnail
    img.alt = result.title || ''
    img.crossOrigin = 'anonymous'
    img.style.cssText = `
      width: 100%; aspect-ratio: 1; object-fit: cover; display: block;
    `
    img.addEventListener('error', () => {
      img.style.display = 'none'
      const fallback = document.createElement('div')
      fallback.textContent = '🖼'
      fallback.style.cssText = `
        width: 100%; aspect-ratio: 1; display: flex;
        align-items: center; justify-content: center; font-size: 32px;
        background: #f3f4f6;
      `
      card.insertBefore(fallback, card.firstChild)
    })

    card.appendChild(img)

    const onSelect = () => this.handleSelect(result)
    card.addEventListener('click', onSelect)
    card.addEventListener('touchend', (e) => { e.preventDefault(); onSelect() })

    return card
  }

  private async handleSearch(rawQuery: string, area: HTMLElement): Promise<void> {
    const query = sanitizeQuery(rawQuery)
    if (!query) {
      this.showError(area, "That search isn't available — try something else!")
      return
    }

    this.abortController?.abort()
    this.abortController = new AbortController()
    const { signal } = this.abortController

    this.showLoading(area)

    try {
      const params = new URLSearchParams({
        q: query,
        license: 'cc0,pdm,by,by-sa,by-nc,by-nc-sa',
        safesearch: 'true',
        page_size: String(PAGE_SIZE),
      })

      const res = await fetch(`${OPENVERSE_BASE}?${params}`, {
        signal,
        headers: { 'Accept': 'application/json' },
      })

      if (!res.ok) throw new Error(`Search failed (${res.status})`)

      const data = await res.json() as { results: OpenverseResult[] }
      const filtered = filterResults(data.results ?? [])
      this.showResults(area, filtered)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      this.showError(area, "Can't connect — check your internet connection.")
    }
  }

  private async handleSelect(result: OpenverseResult): Promise<void> {
    if (!this.root) return
    blurActiveTextEditingElement()

    // Show loading overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 100; font-size: 16px; color: white; font-family: system-ui, sans-serif;
    `
    overlay.textContent = 'Loading picture…'
    this.root.appendChild(overlay)

    try {
      const selectedImage = await this.fetchSelectedImage(result)

      const { decodeAndDownscale } = await import('../util/imageImport')
      const bitmap = await decodeAndDownscale(selectedImage.blob)

      const attribution: SearchAttribution = {
        title: result.title || 'Untitled',
        creator: result.creator || '',
        creatorUrl: result.creator_url || '',
        license: result.license,
        licenseUrl: result.license_url || '',
        sourceUrl: result.foreign_landing_url || result.url,
        usedImageUrl: selectedImage.url,
        usedImageKind: selectedImage.kind,
      }

      ImportStaging.set({
        bitmap,
        imageBlob: selectedImage.blob,
        suggestedTitle: result.title || 'Search Picture',
        origin: 'search',
        attribution,
      })

      this.router.navigate('#/difficulty/import')
    } catch {
      overlay.remove()
      const errMsg = document.createElement('div')
      errMsg.textContent = "Couldn't load that picture — try another one."
      errMsg.style.cssText = `
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        background: #1f2937; color: white; padding: 12px 20px; border-radius: 8px;
        font-size: 14px; z-index: 99; max-width: 90vw; text-align: center;
        font-family: system-ui, sans-serif;
      `
      this.root?.appendChild(errMsg)
      setTimeout(() => errMsg.remove(), 3500)
    }
  }

  private async fetchSelectedImage(result: OpenverseResult): Promise<SelectedImageAsset> {
    const candidates: Array<{ kind: SearchImageKind; url: string }> = [
      { kind: 'full', url: result.url },
      { kind: 'thumbnail', url: result.thumbnail },
    ]

    const tried = new Set<string>()
    let lastError: Error | null = null

    for (const candidate of candidates) {
      if (!this.isHttpUrl(candidate.url) || tried.has(candidate.url)) continue
      tried.add(candidate.url)
      try {
        return await this.fetchImageCandidate(candidate.url, candidate.kind)
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Image fetch failed')
      }
    }

    throw lastError ?? new Error('No usable image URL')
  }

  private async fetchImageCandidate(url: string, kind: SearchImageKind): Promise<SelectedImageAsset> {
    const res = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    })
    if (!res.ok) throw new Error('Image fetch failed')

    const contentLength = Number(res.headers.get('Content-Length') ?? '')
    if (Number.isFinite(contentLength) && contentLength > MAX_SEARCH_IMAGE_BYTES) {
      throw new Error('Image is too large')
    }

    const contentType = (res.headers.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase()
    if (contentType && !contentType.startsWith('image/')) {
      throw new Error('URL did not return an image')
    }

    const blob = await res.blob()
    const blobType = (blob.type || contentType).toLowerCase()
    if (!blobType.startsWith('image/')) throw new Error('URL did not return an image')
    if (blob.size === 0) throw new Error('Image is empty')
    if (blob.size > MAX_SEARCH_IMAGE_BYTES) throw new Error('Image is too large')

    return { blob, kind, url }
  }

  private isHttpUrl(value: string): boolean {
    try {
      const url = new URL(value)
      return url.protocol === 'https:' || url.protocol === 'http:'
    } catch {
      return false
    }
  }
}
