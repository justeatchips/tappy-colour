import type { Router } from '../router'
import { View, configureScrollableRoot } from './BaseView'
import { childSafeAutocomplete, sanitizeQuery, filterResults, type OpenverseResult } from '../util/searchSafety'
import { ImportStaging } from '../model/ImportStaging'
import type { SearchAttribution } from '../model/Artwork'
import { blurActiveTextEditingElement, focusTextInputWhenHelpful } from '../util/focus'
import { createIconButton, createToast } from '../ui/pixel'

const OPENVERSE_BASE = 'https://api.openverse.org/v1/images/'
const PAGE_SIZE = 20
const MAX_SEARCH_IMAGE_BYTES = 15 * 1024 * 1024
const TOPIC_IMAGE_BASE = `${import.meta.env.BASE_URL}images/`

const BACK_ICON = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13.5 5L7.5 11L13.5 17" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const SEARCH_ICON = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9.5" cy="9.5" r="5.5" stroke="currentColor" stroke-width="2"/>
  <path d="M14 14L19 19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
</svg>`

type SearchImageKind = 'full' | 'thumbnail'

interface SearchTopic {
  id: string
  label: string
  query: string
  imageSrc: string
  bundledImageId: string
}

interface SelectedImageAsset {
  blob: Blob
  kind: SearchImageKind
  url: string
}

const SEARCH_TOPICS: SearchTopic[] = [
  { id: 'duck', label: 'Duck', query: 'duck animal', imageSrc: `${TOPIC_IMAGE_BASE}img_duck.png`, bundledImageId: 'img_duck' },
  { id: 'cat', label: 'Cat', query: 'cat animal', imageSrc: `${TOPIC_IMAGE_BASE}img_cat.png`, bundledImageId: 'img_cat' },
  { id: 'rocket', label: 'Rocket', query: 'rocket space', imageSrc: `${TOPIC_IMAGE_BASE}img_rocket.png`, bundledImageId: 'img_rocket' },
  { id: 'flower', label: 'Flower', query: 'flower', imageSrc: `${TOPIC_IMAGE_BASE}img_flower.png`, bundledImageId: 'img_flower' },
  { id: 'fish', label: 'Fish', query: 'fish animal', imageSrc: `${TOPIC_IMAGE_BASE}img_fish.png`, bundledImageId: 'img_fish' },
]

export class SearchScreen extends View {
  private root: HTMLElement | null = null
  private abortController: AbortController | null = null

  constructor(private router: Router) {
    super()
  }

  mount(root: HTMLElement): void {
    this.root = root
    configureScrollableRoot(root)
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
    page.className = 'tc-search-screen'

    const header = document.createElement('div')
    header.className = 'tc-search-header'

    const backBtn = createIconButton('Back', BACK_ICON, {
      variant: 'ghost',
      onClick: () => this.router.navigate('#/'),
    })
    backBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.router.navigate('#/') })

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'tc-input'
    input.placeholder = 'Search for a picture...'
    input.setAttribute('aria-label', 'Search')

    const searchBtn = createIconButton('Search', SEARCH_ICON, {
      variant: 'primary',
    })

    const suggestions = document.createElement('div')
    suggestions.className = 'tc-search-suggestions'
    suggestions.setAttribute('aria-label', 'Safe search ideas')

    const resultsArea = document.createElement('div')
    resultsArea.className = 'tc-search-results'

    const updateSuggestions = () => {
      this.renderAutocomplete(input, suggestions, resultsArea)
    }

    const doSearch = (topic: SearchTopic | null = null) => {
      input.blur()
      suggestions.innerHTML = ''
      const rawQuery = topic?.query ?? input.value
      void this.handleSearch(rawQuery, resultsArea, topic)
    }

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch() })
    input.addEventListener('input', updateSuggestions)
    input.addEventListener('focus', updateSuggestions)
    searchBtn.addEventListener('click', () => doSearch())
    searchBtn.addEventListener('touchend', (e) => { e.preventDefault(); doSearch() })

    header.appendChild(backBtn)
    header.appendChild(input)
    header.appendChild(searchBtn)

    this.showPlaceholder(resultsArea, (topic) => {
      input.value = topic.label
      doSearch(topic)
    })

    page.appendChild(header)
    page.appendChild(suggestions)
    page.appendChild(resultsArea)
    this.root.appendChild(page)

    setTimeout(() => focusTextInputWhenHelpful(input), 50)
  }

  private renderAutocomplete(
    input: HTMLInputElement,
    container: HTMLElement,
    area: HTMLElement
  ): void {
    container.innerHTML = ''
    const suggestions = childSafeAutocomplete(input.value)
    if (suggestions.length === 0) return

    for (const suggestion of suggestions) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'tc-search-suggestion'
      button.textContent = suggestion
      button.setAttribute('aria-label', `Search ${suggestion}`)
      button.addEventListener('click', () => {
        input.value = suggestion
        container.innerHTML = ''
        const topic = this.topicForSuggestion(suggestion)
        void this.handleSearch(topic?.query ?? suggestion, area, topic)
      })
      container.appendChild(button)
    }
  }

  private topicForSuggestion(suggestion: string): SearchTopic | null {
    const normalised = suggestion.toLowerCase()
    return SEARCH_TOPICS.find(topic =>
      topic.label.toLowerCase() === normalised ||
      topic.query.toLowerCase() === normalised
    ) ?? null
  }

  private showPlaceholder(area: HTMLElement, onTopicSearch: (topic: SearchTopic) => void): void {
    area.innerHTML = ''
    const picker = document.createElement('div')
    picker.className = 'tc-topic-picker'

    for (const topic of SEARCH_TOPICS) {
      picker.appendChild(this.makeTopicCard(topic, onTopicSearch))
    }

    area.appendChild(picker)
  }

  private makeTopicCard(topic: SearchTopic, onTopicSearch: (topic: SearchTopic) => void): HTMLElement {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'tc-topic-card'
    card.dataset.searchTopic = topic.id
    card.setAttribute('aria-label', `Search ${topic.label}`)

    const img = document.createElement('img')
    img.src = topic.imageSrc
    img.alt = ''
    card.appendChild(img)

    const label = document.createElement('span')
    label.textContent = topic.label
    card.appendChild(label)

    const select = () => onTopicSearch(topic)
    card.addEventListener('click', select)
    card.addEventListener('touchend', (e) => { e.preventDefault(); select() })

    return card
  }

  private showLoading(area: HTMLElement): void {
    area.innerHTML = ''
    const msg = document.createElement('p')
    msg.className = 'tc-empty-state px-panel'
    msg.textContent = 'Searching...'
    area.appendChild(msg)
  }

  private showError(area: HTMLElement, message: string): void {
    area.innerHTML = ''
    const msg = document.createElement('p')
    msg.className = 'tc-empty-state tc-empty-state--danger px-panel'
    msg.textContent = message
    area.appendChild(msg)
  }

  private showResults(area: HTMLElement, results: OpenverseResult[], topic: SearchTopic | null = null): void {
    area.innerHTML = ''

    if (results.length === 0 && !topic) {
      const msg = document.createElement('p')
      msg.className = 'tc-empty-state px-panel'
      msg.textContent = 'No pictures found - try different words!'
      area.appendChild(msg)
      return
    }

    const grid = document.createElement('div')
    grid.className = 'tc-search-results-grid'

    if (topic) {
      grid.appendChild(this.makeTopicResultCard(topic))
    }

    for (const result of results) {
      grid.appendChild(this.makeResultCard(result))
    }

    const credit = document.createElement('p')
    credit.className = 'tc-search-credit'
    credit.innerHTML = 'Images from <a href="https://openverse.org" target="_blank" rel="noopener">Openverse</a> - free to use'

    area.appendChild(grid)
    area.appendChild(credit)
  }

  private makeResultCard(result: OpenverseResult): HTMLElement {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'tc-search-card'
    card.setAttribute('aria-label', result.title || 'Search result')

    const img = document.createElement('img')
    img.src = result.thumbnail
    img.alt = result.title || ''
    img.crossOrigin = 'anonymous'
    img.addEventListener('error', () => {
      img.style.display = 'none'
      const fallback = document.createElement('div')
      fallback.className = 'tc-search-card__fallback'
      fallback.textContent = 'IMG'
      card.insertBefore(fallback, card.firstChild)
    })

    card.appendChild(img)

    const onSelect = () => this.handleSelect(result)
    card.addEventListener('click', onSelect)
    card.addEventListener('touchend', (e) => { e.preventDefault(); onSelect() })

    return card
  }

  private makeTopicResultCard(topic: SearchTopic): HTMLElement {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'tc-search-card tc-search-card--topic'
    card.dataset.topicResult = topic.id
    card.setAttribute('aria-label', `Use ${topic.label}`)

    const img = document.createElement('img')
    img.src = topic.imageSrc
    img.alt = topic.label
    card.appendChild(img)

    const label = document.createElement('span')
    label.className = 'tc-search-card__badge'
    label.textContent = 'TAPPY'
    card.appendChild(label)

    card.addEventListener('click', () => this.router.navigate(`#/difficulty/${topic.bundledImageId}`))
    card.addEventListener('touchend', (e) => {
      e.preventDefault()
      this.router.navigate(`#/difficulty/${topic.bundledImageId}`)
    })

    return card
  }

  private async handleSearch(rawQuery: string, area: HTMLElement, topic: SearchTopic | null = null): Promise<void> {
    const query = sanitizeQuery(rawQuery)
    if (!query) {
      this.showError(area, "That search isn't available - try something else!")
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
      this.showResults(area, filtered, topic)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      if (topic) {
        this.showResults(area, [], topic)
        return
      }
      this.showError(area, "Can't connect - check your internet connection.")
    }
  }

  private async handleSelect(result: OpenverseResult): Promise<void> {
    if (!this.root) return
    blurActiveTextEditingElement()

    const overlay = document.createElement('div')
    overlay.className = 'tc-loading-overlay'
    overlay.textContent = 'Loading picture...'
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
      const errMsg = createToast("Couldn't load that picture - try another one.")
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
