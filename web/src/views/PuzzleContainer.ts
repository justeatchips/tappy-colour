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
    outer.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: #f9fafb;
      position: relative;
    `

    // Toolbar
    const toolbar = document.createElement('div')
    toolbar.style.cssText = `
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 52px;
      flex-shrink: 0;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      gap: 8px;
    `

    const backBtn = document.createElement('button')
    backBtn.textContent = '← Home'
    backBtn.style.cssText = `
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    `
    backBtn.addEventListener('click', () => this.router.navigate('#/'))

    const titleEl = document.createElement('span')
    titleEl.textContent = artwork.title
    titleEl.style.cssText = `
      flex: 1;
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
    `

    const resetZoomBtn = document.createElement('button')
    resetZoomBtn.textContent = '⊙'
    resetZoomBtn.title = 'Reset zoom'
    resetZoomBtn.style.cssText = `
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    `

    const undoBtn = document.createElement('button')
    undoBtn.textContent = 'Undo'
    undoBtn.style.cssText = `
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    `
    undoBtn.addEventListener('click', () => session.undo())

    const attributionBtn = document.createElement('button')
    attributionBtn.textContent = 'CREDIT'
    attributionBtn.setAttribute('data-attribution-toggle', 'true')
    attributionBtn.style.cssText = `
      min-height: 44px;
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      display: ${artwork.source.kind === 'search' ? 'inline-flex' : 'none'};
      align-items: center;
      justify-content: center;
    `
    attributionBtn.addEventListener('click', () => this.showAttributionDetails(artwork))

    const printBtn = document.createElement('button')
    printBtn.textContent = 'PRINT'
    printBtn.setAttribute('data-print-sheet', 'true')
    printBtn.style.cssText = `
      min-height: 44px;
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      display: none;
      align-items: center;
      justify-content: center;
    `
    printBtn.addEventListener('click', () => {
      const snapshot = this.printableSnapshot()
      if (snapshot) printArtworkSheet(snapshot)
    })
    this.printBtn = printBtn

    const sourceToggleBtn = document.createElement('button')
    sourceToggleBtn.textContent = 'PHOTO'
    sourceToggleBtn.setAttribute('data-source-toggle', 'true')
    sourceToggleBtn.setAttribute('aria-pressed', 'false')
    sourceToggleBtn.style.cssText = `
      min-height: 44px;
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      display: none;
      align-items: center;
      justify-content: center;
    `
    sourceToggleBtn.addEventListener('click', () => this.toggleSourceImage())
    this.sourceToggleBtn = sourceToggleBtn

    toolbar.appendChild(backBtn)
    toolbar.appendChild(titleEl)
    toolbar.appendChild(resetZoomBtn)
    toolbar.appendChild(undoBtn)
    toolbar.appendChild(attributionBtn)
    toolbar.appendChild(printBtn)
    toolbar.appendChild(sourceToggleBtn)

    // Canvas area
    const canvasArea = document.createElement('div')
    canvasArea.style.cssText = `
      flex: 1;
      min-height: 0;
      position: relative;
    `

    // Tool strip
    const toolbarStrip = new ToolbarStrip(session)
    this.toolbarStrip = toolbarStrip

    // Palette strip
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
      sourceImage.setAttribute('data-source-image', 'true')
      sourceImage.style.cssText = `
        position: absolute;
        inset: 0;
        z-index: 3;
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: white;
        display: none;
        pointer-events: none;
      `
      canvasArea.appendChild(sourceImage)
      this.sourceImageEl = sourceImage
    }
    this.updateSourceToggle()
    this.updatePrintButton()

    resetZoomBtn.addEventListener('click', () => gridCanvas.resetZoom())
    toolbarStrip.mount()
    paletteStrip.mount()

    // First-run coach marks
    if (OnboardingCoach.shouldShow()) {
      const coach = new OnboardingCoach()
      this.onboardingCoach = coach
      coach.mount(root, {
        paletteEl: paletteStrip.element,
        gridEl: canvasArea,
        session,
      })
    }

    // Show completion overlay when puzzle is finished
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
    this.printBtn.style.display = this.printableSnapshot() ? 'inline-flex' : 'none'
  }

  private updateSourceToggle(): void {
    if (!this.sourceToggleBtn) return

    const canToggle = Boolean(this.session?.isComplete && this.sourceImageEl)
    if (!canToggle) {
      this.showingSourceImage = false
    }

    this.sourceToggleBtn.style.display = canToggle ? 'inline-flex' : 'none'
    this.sourceToggleBtn.textContent = this.showingSourceImage ? 'PAINT' : 'PHOTO'
    this.sourceToggleBtn.setAttribute('aria-pressed', String(this.showingSourceImage))

    if (this.sourceImageEl) {
      this.sourceImageEl.style.display = canToggle && this.showingSourceImage ? 'block' : 'none'
    }
  }

  private showAttributionDetails(artwork: Artwork): void {
    if (artwork.source.kind !== 'search') return

    const attribution = artwork.source.attribution
    const overlay = document.createElement('div')
    overlay.setAttribute('data-attribution-details', 'true')
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 1200;
      background: rgba(20,30,50,0.72);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `

    const panel = document.createElement('div')
    panel.style.cssText = `
      width: min(420px, 100%);
      background: white;
      border-radius: 8px;
      padding: 20px;
      color: #1f2937;
      box-shadow: 0 12px 40px rgba(0,0,0,0.25);
      display: flex;
      flex-direction: column;
      gap: 10px;
    `

    const title = document.createElement('h2')
    title.textContent = 'Picture Credit'
    title.style.cssText = 'margin: 0; font-size: 20px;'
    panel.appendChild(title)

    const rows: Array<[string, string]> = [
      ['Title', attribution.title || artwork.title],
      ['Creator', attribution.creator || 'Unknown'],
      ['License', attribution.license || 'Unknown'],
      ['Source', attribution.sourceUrl],
    ]

    for (const [label, value] of rows) {
      const row = document.createElement('p')
      row.style.cssText = 'margin: 0; font-size: 14px; line-height: 1.4;'
      const strong = document.createElement('strong')
      strong.textContent = `${label}: `
      row.appendChild(strong)
      row.append(value || 'Unknown')
      panel.appendChild(row)
    }

    const close = document.createElement('button')
    close.textContent = 'CLOSE'
    close.style.cssText = `
      margin-top: 8px;
      min-height: 44px;
      padding: 8px 14px;
      background: #f3f4f6;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      text-align: center;
    `
    close.addEventListener('click', () => overlay.remove())
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
