import type { Router } from '../router'
import type { ArtworkStore } from '../model/ArtworkStore'
import type { Artwork } from '../model/Artwork'
import { View, configureScrollableRoot } from './BaseView'
import { BUNDLED_IMAGES } from '../assets/bundled'
import { createGalleryCard } from './GalleryCard'
import { showConfirmDialog } from './ConfirmDialog'
import { ManagedObjectUrls } from '../util/objectUrl'
import { ImportStaging } from '../model/ImportStaging'
import { pickImagesFromLibrary, captureImageFromCamera, decodeAndDownscale } from '../util/imageImport'
import { UserSettings } from '../model/UserSettings'
import { mascotImageUrl, getMascotById, loadMascots, resolveMascotId } from '../model/Mascots'
import { getSearchAccess } from '../util/searchAccess'

export class HomeScreen extends View {
  private root: HTMLElement | null = null
  private unsub: (() => void) | null = null
  private objectUrls = new ManagedObjectUrls()
  private galleryLoaded = false

  constructor(private router: Router, private store: ArtworkStore) {
    super()
  }

  mount(root: HTMLElement): void {
    this.root = root
    this.galleryLoaded = false
    configureScrollableRoot(root)
    this.render()
    this.unsub = this.store.on('changed', () => {
      this.objectUrls.revokeAll()
      this.render()
    })
    window.addEventListener('online', this.handleConnectivityChange)
    window.addEventListener('offline', this.handleConnectivityChange)
    this.store.fetchAll()
      .catch(() => [])
      .then(() => {
        if (!this.root) return
        this.galleryLoaded = true
        this.objectUrls.revokeAll()
        this.render()
      })
    loadMascots()
      .then(() => {
        if (this.root) this.render()
      })
      .catch(() => {})
  }

  unmount(): void {
    this.unsub?.()
    this.unsub = null
    window.removeEventListener('online', this.handleConnectivityChange)
    window.removeEventListener('offline', this.handleConnectivityChange)
    this.objectUrls.revokeAll()
    if (this.root) {
      this.root.innerHTML = ''
      this.root = null
    }
  }

  private render(): void {
    if (!this.root) return
    this.root.innerHTML = ''

    const container = document.createElement('div')
    container.className = 'tc-page home-page'

    // Header
    const header = document.createElement('header')
    header.className = 'home-header'

    const mascotPanel = document.createElement('div')
    mascotPanel.className = 'px-panel home-header__mascot-panel'

    const settings = UserSettings.get()
    const mascotId = resolveMascotId(settings.mascotId)
    const mascotImg = document.createElement('img')
    mascotImg.className = 'mascot-art mascot-art--header mascot-bob'
    mascotImg.src = mascotImageUrl(mascotId)
    mascotImg.alt = 'Mascot buddy'
    mascotPanel.appendChild(mascotImg)
    header.appendChild(mascotPanel)

    const headerInfo = document.createElement('div')
    headerInfo.className = 'home-header__info'

    const greeting = document.createElement('div')
    greeting.className = 'home-header__greeting'
    const mascot = getMascotById(mascotId)
    greeting.textContent = `HI ${mascot?.name?.toUpperCase() || 'BUDDY'}!`
    headerInfo.appendChild(greeting)

    const title = document.createElement('div')
    title.className = 'px-title px-title--md home-header__title'
    title.textContent = 'TAPPY COLOUR'
    headerInfo.appendChild(title)
    header.appendChild(headerInfo)

    const settingsBtn = document.createElement('button')
    settingsBtn.className = 'px-button px-button--ghost px-button--icon'
    settingsBtn.textContent = '⚙'
    settingsBtn.id = 'home-settings-btn'
    settingsBtn.addEventListener('click', () => this.router.navigate('#/settings'))
    header.appendChild(settingsBtn)

    container.appendChild(header)

    // Action buttons
    const actionRow = document.createElement('div')
    actionRow.className = 'home-action-row'

    const cameraBtn = this.makeActionBtn('📷', 'CAMERA', 'home-action-btn--primary', () => this.handleCamera())
    const photosBtn = this.makeActionBtn('🖼', 'PHOTOS', 'home-action-btn--accent', () => this.handleLibrary())
    const searchAccess = getSearchAccess(settings, navigator.onLine)
    const searchBtn = this.makeActionBtn('🔍', 'SEARCH', 'home-action-btn--accent', () => this.router.navigate('#/search'))
    if (!searchAccess.allowed) {
      searchBtn.disabled = true
      searchBtn.setAttribute('aria-disabled', 'true')
      searchBtn.title = searchAccess.reason === 'offline'
        ? 'Connect to the internet to search.'
        : 'Turn on Internet Search in Settings.'
      searchBtn.style.opacity = '0.55'
      searchBtn.style.cursor = 'not-allowed'
    }

    actionRow.appendChild(cameraBtn)
    actionRow.appendChild(photosBtn)
    actionRow.appendChild(searchBtn)
    container.appendChild(actionRow)

    // Gallery label
    const galleryLabel = document.createElement('div')
    galleryLabel.className = 'px-title px-title--sm'
    galleryLabel.style.cssText = 'text-align: center; margin-bottom: 12px;'
    galleryLabel.textContent = '★ TAP A PICTURE ★'
    container.appendChild(galleryLabel)

    if (!this.galleryLoaded) {
      const loading = document.createElement('div')
      loading.id = 'home-gallery-loading'
      loading.className = 'px-panel'
      loading.style.cssText = `
        padding: 18px;
        text-align: center;
        font-family: var(--tc-font-display);
        font-size: 14px;
        color: var(--tc-ink-soft);
      `
      loading.textContent = 'LOADING PICTURES...'
      container.appendChild(loading)
      this.root.appendChild(container)
      return
    }

    // Gallery grid
    const savedArtworks = this.store['cache'] as Artwork[]
    const notStarted = BUNDLED_IMAGES.filter(img => !this.store.getByBundledName(img.id))
    const allArtworks: Array<{ artwork: Artwork; isStarter: boolean; bundledName?: string }> = []

    for (const artwork of savedArtworks) {
      allArtworks.push({ artwork, isStarter: false })
    }

    for (const img of notStarted) {
      const starterArtwork: Artwork = {
        id: '__starter__' + img.id,
        title: img.title,
        source: { kind: 'bundled', bundledImageName: img.id },
        createdAt: 0,
        lastModifiedAt: 0,
        isComplete: false,
        conversionSettings: { sliderValue: 0, gridSize: 16, paletteSize: 6, autoFillEnabled: true },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        palette: null as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        grid: { columns: 1, rows: 1, unpaintedCount: 1 } as any,
      }
      allArtworks.push({ artwork: starterArtwork, isStarter: true, bundledName: img.id })
    }

    const galleryGrid = document.createElement('div')
    galleryGrid.className = 'home-gallery-grid'
    galleryGrid.id = 'home-gallery'

    for (const { artwork, isStarter, bundledName } of allArtworks) {
      const bundledImg = bundledName ? BUNDLED_IMAGES.find(i => i.id === bundledName) : null

      const card = createGalleryCard({
        artwork,
        imageSrc: bundledImg?.src ?? null,
        objectUrls: this.objectUrls,
        onOpen: () => {
          if (isStarter && bundledName) {
            this.router.navigate(`#/difficulty/${bundledName}`)
          } else {
            this.router.navigate(`#/puzzle/${artwork.id}`)
          }
        },
        onDelete: !isStarter ? () => this.handleDelete(artwork) : () => {},
      })

      galleryGrid.appendChild(card)
    }

    container.appendChild(galleryGrid)

    if (savedArtworks.length === 0 && notStarted.length === 0) {
      const empty = document.createElement('p')
      empty.textContent = 'No pictures yet — tap a button above to get started!'
      empty.style.cssText = `color: var(--tc-ink-soft); font-size: 16px; text-align: center;`
      container.appendChild(empty)
    }

    this.root.appendChild(container)
  }

  private makeActionBtn(emoji: string, label: string, className: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `px-button home-action-btn ${className}`
    btn.style.cssText = `
      flex: 0 1 300px;
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 22px;
      padding: 20px 18px;
      color: white;
      font-family: var(--tc-font-display);
      letter-spacing: 0.5px;
    `

    const emojiSpan = document.createElement('span')
    emojiSpan.style.cssText = 'font-size: 28px;'
    emojiSpan.textContent = emoji

    const labelSpan = document.createElement('span')
    labelSpan.textContent = label

    btn.appendChild(emojiSpan)
    btn.appendChild(labelSpan)
    btn.addEventListener('click', onClick)
    return btn
  }

  private handleConnectivityChange = (): void => {
    this.render()
  }

  private async handleLibrary(): Promise<void> {
    try {
      const files = await pickImagesFromLibrary()
      const [file, ...queuedFiles] = files
      if (!file) throw new Error('No file selected')

      const bitmap = await decodeAndDownscale(file)
      const suggestedTitle = this.suggestedTitleForFile(file)
      ImportStaging.set(
        { bitmap, imageBlob: file, suggestedTitle, origin: 'library' },
        queuedFiles.map(queued => ({
          imageBlob: queued,
          suggestedTitle: this.suggestedTitleForFile(queued),
          origin: 'library' as const,
        }))
      )
      this.router.navigate('#/difficulty/import')
    } catch (err) {
      if (err instanceof Error && err.message !== 'No file selected') {
        this.showToast(err.message)
      }
    }
  }

  private suggestedTitleForFile(file: File): string {
    return file.name.replace(/\.\w+$/, '') || 'My Photo'
  }

  private async handleCamera(): Promise<void> {
    try {
      const file = await captureImageFromCamera()
      const bitmap = await decodeAndDownscale(file)
      const now = new Date()
      const suggestedTitle = `Photo ${now.toLocaleDateString()}`
      ImportStaging.set({ bitmap, imageBlob: file, suggestedTitle, origin: 'camera' })
      this.router.navigate('#/difficulty/import')
    } catch (err) {
      if (err instanceof Error && err.message !== 'No file selected') {
        this.showToast(err.message)
      }
    }
  }

  private async handleDelete(artwork: Artwork): Promise<void> {
    const confirmed = await showConfirmDialog(`Delete "${artwork.title}"?`)
    if (!confirmed) return

    const confirmedAgain = await showConfirmDialog(`Delete "${artwork.title}" forever?`)
    if (!confirmedAgain) return

    await this.store.delete(artwork.id)
  }

  private showToast(message: string): void {
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--tc-ink-black);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 999;
      max-width: 90vw;
      text-align: center;
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3500)
  }
}
