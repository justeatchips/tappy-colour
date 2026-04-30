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
import { createPxButton } from '../ui/pixel'

const CAMERA_ICON = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 8l1.8-2.4h6.4L19 8h4a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h4z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
  <circle cx="14" cy="15.5" r="4.2" stroke="currentColor" stroke-width="2.2"/>
</svg>`

const PHOTOS_ICON = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2.2"/>
  <path d="M8 19l4.2-5 3 3.4 2-2.2L22 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="17.5" cy="10.5" r="1.8" fill="currentColor"/>
</svg>`

const HOME_SEARCH_ICON = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="6.5" stroke="currentColor" stroke-width="2.2"/>
  <path d="M17 17l6 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
</svg>`

const SETTINGS_ICON = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11 7.2a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6z" stroke="currentColor" stroke-width="2"/>
  <path d="M11 2v3M11 17v3M3.2 6.5l2.6 1.5M16.2 14l2.6 1.5M3.2 15.5L5.8 14M16.2 8l2.6-1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`

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

    const settingsBtn = createPxButton({
      icon: SETTINGS_ICON,
      ariaLabel: 'Settings',
      variant: 'ghost',
      size: 'icon',
      onClick: () => this.router.navigate('#/settings'),
    })
    settingsBtn.id = 'home-settings-btn'
    header.appendChild(settingsBtn)

    container.appendChild(header)

    // Action buttons
    const actionRow = document.createElement('div')
    actionRow.className = 'home-action-row'

    const cameraBtn = this.makeActionBtn(CAMERA_ICON, 'CAMERA', 'home-action-btn--primary', () => this.handleCamera())
    const photosBtn = this.makeActionBtn(PHOTOS_ICON, 'PHOTOS', 'home-action-btn--accent', () => this.handleLibrary())
    const searchAccess = getSearchAccess(settings, navigator.onLine)
    const searchBtn = this.makeActionBtn(HOME_SEARCH_ICON, 'SEARCH', 'home-action-btn--accent', () => this.router.navigate('#/search'))
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

  private makeActionBtn(icon: string, label: string, className: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `px-button home-action-btn ${className}`
    btn.type = 'button'
    btn.title = label
    btn.dataset.touchLabel = label
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

    const iconSpan = document.createElement('span')
    iconSpan.className = 'home-action-btn__icon'
    iconSpan.innerHTML = icon

    const labelSpan = document.createElement('span')
    labelSpan.textContent = label

    btn.appendChild(iconSpan)
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
