import type { Router } from '../router'
import type { ArtworkStore } from '../model/ArtworkStore'
import type { Artwork } from '../model/Artwork'
import { View, configureFixedRoot } from './BaseView'
import { PaintingSession } from '../model/PaintingSession'
import { GridCanvas } from './GridCanvas'
import { PaletteStrip } from './PaletteStrip'
import { ToolbarStrip } from './ToolbarStrip'
import { CompletionOverlay } from './CompletionOverlay'
import { OnboardingCoach } from './OnboardingCoach'
import { ColourEncouragement } from './ColourEncouragement'
import { BUNDLED_IMAGES } from '../assets/bundled'
import { ManagedObjectUrls } from '../util/objectUrl'
import { canPrintColourSheet, printArtworkSheet } from '../util/printSheet'
import { createPanel, createPxButton, createTopBar } from '../ui/pixel'

const HOME_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 8.2L9 2l7 6.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.5 7.5V16h9V7.5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
</svg>`

const FIT_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 7V3h4M11 3h4v4M15 11v4h-4M7 15H3v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const UNDO_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.5 5H3v3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.5 8A6 6 0 1110 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`

const CREDIT_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2"/>
  <path d="M9 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <circle cx="9" cy="5.2" r="1" fill="currentColor"/>
</svg>`

const PRINT_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 6V2h8v4M5 13H3V7h12v6h-2M5 11h8v5H5v-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
</svg>`

const PHOTO_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2.5" y="3" width="13" height="12" rx="1.5" stroke="currentColor" stroke-width="2"/>
  <path d="M4.5 13l3-3.5 2 2.3 1.4-1.5L15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

export class PuzzleContainer extends View {
  private root: HTMLElement | null = null
  private session: PaintingSession | null = null
  private gridCanvas: GridCanvas | null = null
  private paletteStrip: PaletteStrip | null = null
  private toolbarStrip: ToolbarStrip | null = null
  private completionOverlay: CompletionOverlay | null = null
  private colourEncouragement: ColourEncouragement | null = null
  private onboardingCoach: OnboardingCoach | null = null
  private sourceImageEl: HTMLImageElement | null = null
  private sourceToggleBtn: HTMLButtonElement | null = null
  private printBtn: HTMLButtonElement | null = null
  private showingSourceImage = false
  private objectUrls = new ManagedObjectUrls()
  private unsub: (() => void) | null = null

  constructor(
    private router: Router,
    private store: ArtworkStore,
    private artworkId: string
  ) {
    super()
  }

  mount(root: HTMLElement): void {
    this.root = root
    configureFixedRoot(root)

    this.store.get(this.artworkId).then(artwork => {
      if (!artwork) {
        this.router.navigate('#/')
        return
      }
      if (!this.root) return
      this.mountGame(root, artwork)
    })
  }

  private mountGame(root: HTMLElement, artwork: Artwork): void {
    const session = new PaintingSession(artwork, this.store)
    this.session = session
    this.colourEncouragement = new ColourEncouragement()
    const sourceImageUrl = this.sourceImageUrlFor(artwork)

    const outer = document.createElement('div')
    outer.className = 'tc-game-shell'

    const { bar: toolbar, titleEl } = createTopBar(artwork.title)

    const backBtn = createPxButton({
      label: 'HOME',
      icon: HOME_ICON,
      variant: 'ghost',
      size: 'sm',
      onClick: () => this.router.navigate('#/'),
    })

    const controls = document.createElement('div')
    controls.className = 'tc-control-group'

    const resetZoomBtn = createPxButton({
      label: 'FIT',
      icon: FIT_ICON,
      ariaLabel: 'Reset zoom',
      variant: 'ghost',
      size: 'sm',
    })
    resetZoomBtn.title = 'Reset zoom'

    const undoBtn = createPxButton({
      label: 'UNDO',
      icon: UNDO_ICON,
      variant: 'ghost',
      size: 'sm',
      onClick: () => session.undo(),
    })

    const attributionBtn = createPxButton({
      label: 'CREDIT',
      icon: CREDIT_ICON,
      variant: 'ghost',
      size: 'sm',
    })
    attributionBtn.setAttribute('data-attribution-toggle', 'true')
    attributionBtn.hidden = artwork.source.kind !== 'search'
    attributionBtn.addEventListener('click', () => this.showAttributionDetails(artwork))

    const printBtn = createPxButton({
      label: 'PRINT',
      icon: PRINT_ICON,
      variant: 'ghost',
      size: 'sm',
    })
    printBtn.setAttribute('data-print-sheet', 'true')
    printBtn.hidden = true
    printBtn.addEventListener('click', () => {
      const snapshot = this.printableSnapshot()
      if (snapshot) printArtworkSheet(snapshot)
    })
    this.printBtn = printBtn

    const sourceToggleBtn = createPxButton({
      label: 'PHOTO',
      icon: PHOTO_ICON,
      variant: 'accent',
      size: 'sm',
    })
    sourceToggleBtn.setAttribute('data-source-toggle', 'true')
    sourceToggleBtn.setAttribute('aria-pressed', 'false')
    sourceToggleBtn.hidden = true
    sourceToggleBtn.addEventListener('click', () => this.toggleSourceImage())
    this.sourceToggleBtn = sourceToggleBtn

    toolbar.appendChild(backBtn)
    toolbar.appendChild(titleEl)
    controls.appendChild(resetZoomBtn)
    controls.appendChild(undoBtn)
    controls.appendChild(attributionBtn)
    controls.appendChild(printBtn)
    controls.appendChild(sourceToggleBtn)
    toolbar.appendChild(controls)

    const canvasArea = document.createElement('div')
    canvasArea.className = 'tc-canvas-stage'

    const toolbarStrip = new ToolbarStrip(session)
    this.toolbarStrip = toolbarStrip

    const paletteStrip = new PaletteStrip(session)
    this.paletteStrip = paletteStrip

    outer.appendChild(toolbar)
    outer.appendChild(toolbarStrip.element)
    outer.appendChild(canvasArea)
    outer.appendChild(paletteStrip.element)
    root.appendChild(outer)

    const gridCanvas = new GridCanvas(session, canvasArea)
    this.gridCanvas = gridCanvas
    gridCanvas.mount()

    if (sourceImageUrl) {
      const sourceImage = document.createElement('img')
      sourceImage.src = sourceImageUrl
      sourceImage.alt = `${artwork.title} source image`
      sourceImage.className = 'tc-source-image'
      sourceImage.setAttribute('data-source-image', 'true')
      sourceImage.hidden = true
      canvasArea.appendChild(sourceImage)
      this.sourceImageEl = sourceImage
    }

    this.updateSourceToggle()
    this.updatePrintButton()

    resetZoomBtn.addEventListener('click', () => gridCanvas.resetZoom())
    toolbarStrip.mount()
    paletteStrip.mount()

    if (OnboardingCoach.shouldShow()) {
      const coach = new OnboardingCoach()
      this.onboardingCoach = coach
      coach.mount(root, {
        paletteEl: paletteStrip.element,
        gridEl: canvasArea,
        session,
      })
    }

    this.unsub = session.on('change', (eventType) => {
      if (eventType === 'colourCompleted' && this.root) {
        const completedIndex = session.lastCompletedPaletteIndex
        if (completedIndex !== null) {
          this.colourEncouragement?.show(this.root, completedIndex + 1)
        }
      }
      if (eventType === 'gridChanged' || eventType === 'completionChanged') {
        this.updatePrintButton()
      }
      if (eventType === 'completionChanged' && session.isComplete && this.root) {
        this.updateSourceToggle()
        const overlay = new CompletionOverlay(session, this.router, () => {
          this.completionOverlay = null
        })
        overlay.mount(this.root)
        this.completionOverlay = overlay
      } else if (eventType === 'completionChanged') {
        this.updateSourceToggle()
      }
    })
  }

  private sourceImageUrlFor(artwork: Artwork): string | null {
    if (artwork.source.kind === 'bundled') {
      const bundledImageName = artwork.source.bundledImageName
      return BUNDLED_IMAGES.find(image => image.id === bundledImageName)?.src ?? null
    }

    if (artwork.sourceImageBlob) {
      return this.objectUrls.create(artwork.sourceImageBlob)
    }

    if (artwork.thumbnailBlob) {
      return this.objectUrls.create(artwork.thumbnailBlob)
    }

    return null
  }

  private toggleSourceImage(): void {
    if (!this.session?.isComplete || !this.sourceImageEl) return
    this.showingSourceImage = !this.showingSourceImage
    this.updateSourceToggle()
  }

  private printableSnapshot(): Artwork | null {
    if (!this.session) return null
    const snapshot = this.session.toArtworkSnapshot()
    return canPrintColourSheet(snapshot) ? snapshot : null
  }

  private updatePrintButton(): void {
    if (!this.printBtn) return
    this.printBtn.hidden = !this.printableSnapshot()
  }

  private updateSourceToggle(): void {
    if (!this.sourceToggleBtn) return

    const canToggle = Boolean(this.session?.isComplete && this.sourceImageEl)
    if (!canToggle) {
      this.showingSourceImage = false
    }

    this.sourceToggleBtn.hidden = !canToggle
    const label = this.sourceToggleBtn.querySelector<HTMLElement>('.px-button__label')
    if (label) label.textContent = this.showingSourceImage ? 'PAINT' : 'PHOTO'
    this.sourceToggleBtn.setAttribute('aria-pressed', String(this.showingSourceImage))

    if (this.sourceImageEl) {
      this.sourceImageEl.hidden = !(canToggle && this.showingSourceImage)
    }
  }

  private showAttributionDetails(artwork: Artwork): void {
    if (artwork.source.kind !== 'search') return

    const attribution = artwork.source.attribution
    const overlay = document.createElement('div')
    overlay.className = 'tc-modal-scrim'
    overlay.setAttribute('data-attribution-details', 'true')

    const panel = createPanel('tc-modal-card')

    const title = document.createElement('h2')
    title.className = 'px-title px-title--sm'
    title.textContent = 'PICTURE CREDIT'
    panel.appendChild(title)

    const rows: Array<[string, string]> = [
      ['Title', attribution.title || artwork.title],
      ['Creator', attribution.creator || 'Unknown'],
      ['License', attribution.license || 'Unknown'],
      ['Source', attribution.sourceUrl],
    ]

    for (const [label, value] of rows) {
      const row = document.createElement('p')
      const strong = document.createElement('strong')
      strong.textContent = `${label}: `
      row.appendChild(strong)
      row.append(value || 'Unknown')
      panel.appendChild(row)
    }

    const close = createPxButton({
      label: 'CLOSE',
      variant: 'ghost',
      onClick: () => overlay.remove(),
    })
    panel.appendChild(close)

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) overlay.remove()
    })
    overlay.appendChild(panel)
    document.body.appendChild(overlay)
  }

  unmount(): void {
    this.unsub?.()
    this.unsub = null
    this.session?.destroy()
    this.session = null
    this.gridCanvas?.unmount()
    this.gridCanvas = null
    this.toolbarStrip?.unmount()
    this.toolbarStrip = null
    this.paletteStrip?.unmount()
    this.paletteStrip = null
    this.completionOverlay?.unmount()
    this.completionOverlay = null
    this.colourEncouragement?.unmount()
    this.colourEncouragement = null
    this.onboardingCoach?.unmount()
    this.onboardingCoach = null
    this.sourceImageEl = null
    this.sourceToggleBtn = null
    this.printBtn = null
    this.showingSourceImage = false
    this.objectUrls.revokeAll()
    if (this.root) {
      this.root.innerHTML = ''
      this.root = null
    }
  }
}
