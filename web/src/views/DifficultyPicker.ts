import type { Router } from '../router'
import type { ArtworkStore } from '../model/ArtworkStore'
import { ImportStaging, type StagedImage } from '../model/ImportStaging'
import { View, configureScrollableRoot } from './BaseView'
import { makeConversionSettings } from '../engine/ConversionSettings'
import { estimateCompletionMinutes, makeDifficultyPreviews, type DifficultyPreview } from '../engine/DifficultyPreview'
import { convert, convertFromBitmapInWorker, createGridFromConversionOutput } from '../engine/ImageConverter'
import { Palette } from '../engine/Palette'
import { BUNDLED_IMAGES } from '../assets/bundled'
import type { Artwork } from '../model/Artwork'
import { generateId } from '../model/Artwork'
import { ChickRow } from './ChickRow'
import { drawImageFit, makeSourceImageBlob, makeThumbnail, type ImageFit } from '../util/thumbnail'
import { ManagedObjectUrls } from '../util/objectUrl'
import { UserSettings } from '../model/UserSettings'
import { decodeAndDownscale } from '../util/imageImport'

export class DifficultyPicker extends View {
  private root: HTMLElement | null = null
  private sliderValue = UserSettings.get().defaultSliderValue
  private chickRow: ChickRow | null = null
  private startBtn: HTMLButtonElement | null = null
  private sliderInput: HTMLInputElement | null = null
  private previewCards: Array<{ sliderValue: number; element: HTMLElement }> = []
  private previewCanvases: Array<{ canvas: HTMLCanvasElement; gridSize: number }> = []
  private imageFit: ImageFit = 'cover'
  private objectUrls = new ManagedObjectUrls()

  constructor(
    private router: Router,
    private store: ArtworkStore,
    private bundledName: string | null,
    private staged: StagedImage | null
  ) {
    super()
  }

  mount(root: HTMLElement): void {
    this.root = root
    configureScrollableRoot(root)

    const container = document.createElement('div')
    container.className = 'difficulty-screen'

    // Top bar
    const topBar = document.createElement('div')
    topBar.className = 'difficulty-topbar'

    const backBtn = document.createElement('button')
    backBtn.className = 'px-button px-button--ghost'
    backBtn.id = 'diff-back-btn'
    backBtn.textContent = '← BACK'
    backBtn.addEventListener('click', () => {
      ImportStaging.clearQueue()
      this.router.navigate('#/')
    })
    topBar.appendChild(backBtn)

    const topTitle = document.createElement('div')
    topTitle.className = 'px-title px-title--md difficulty-title'
    topTitle.textContent = 'HOW HARD?'
    topBar.appendChild(topTitle)

    const spacer = document.createElement('div')
    spacer.className = 'difficulty-topbar__spacer'
    topBar.appendChild(spacer)

    container.appendChild(topBar)

    // Two-column layout
    const gridContainer = document.createElement('div')
    gridContainer.className = 'difficulty-layout'

    // Left: smart difficulty previews
    const leftCol = document.createElement('div')
    leftCol.className = 'difficulty-preview-col'
    const settings = UserSettings.get()
    leftCol.appendChild(this.makePreviewPanel(settings.autoFillEnabled))
    gridContainer.appendChild(leftCol)

    // Right: meter + slider + stats
    const rightCol = document.createElement('div')
    rightCol.className = 'difficulty-controls-col'

    const controlsPanel = document.createElement('div')
    controlsPanel.className = 'px-panel'
    controlsPanel.style.cssText = 'padding: 20px;'

    const meterLabel = document.createElement('div')
    meterLabel.style.cssText = `
      font-family: var(--tc-font-display);
      font-size: 14px;
      letter-spacing: 0.5px;
      color: var(--tc-ink-soft);
      margin-bottom: 12px;
    `
    meterLabel.textContent = '★ DIFFICULTY METER ★'
    controlsPanel.appendChild(meterLabel)

    const meterContainer = document.createElement('div')
    meterContainer.id = 'diff-meter'
    meterContainer.style.cssText = `
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 4px;
      padding: 12px 4px;
      min-height: 60px;
      background: var(--tc-bg-alt);
      border: 3px solid var(--tc-ink-black);
      margin-bottom: 18px;
    `

    // Add chick row indicators
    this.chickRow = new ChickRow()
    this.chickRow.update(this.sliderValue)
    meterContainer.appendChild(this.chickRow.element)

    controlsPanel.appendChild(meterContainer)

    const slider = document.createElement('input')
    slider.type = 'range'
    slider.id = 'diff-slider'
    slider.min = '0'
    slider.max = '100'
    slider.value = String(Math.round(this.sliderValue * 100))
    this.sliderInput = slider
    slider.style.cssText = `
      width: 100%;
      height: 36px;
      margin-bottom: 18px;
      accent-color: var(--tc-primary);
      cursor: pointer;
    `

    slider.addEventListener('input', (e) => {
      this.setSliderValue((e.target as HTMLInputElement).valueAsNumber / 100)
    })

    controlsPanel.appendChild(slider)

    // Stats row
    const statsRow = document.createElement('div')
    statsRow.className = 'difficulty-stat-row'

    const gridStat = this.makeStat('GRID', 'diff-stat-grid')
    const colorsStat = this.makeStat('COLOURS', 'diff-stat-colours')
    const timeStat = this.makeStat('TIME EST.', 'diff-stat-time')

    statsRow.appendChild(gridStat)
    statsRow.appendChild(colorsStat)
    statsRow.appendChild(timeStat)
    controlsPanel.appendChild(statsRow)

    rightCol.appendChild(controlsPanel)

    const startBtn = document.createElement('button')
    startBtn.className = 'px-button px-button--primary px-button--lg difficulty-start-btn'
    startBtn.id = 'diff-start-btn'
    startBtn.textContent = '▶ START!'
    this.startBtn = startBtn
    startBtn.addEventListener('click', () => { this.startGame() })
    startBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.startGame() })

    rightCol.appendChild(startBtn)
    gridContainer.appendChild(rightCol)

    container.appendChild(gridContainer)
    root.appendChild(container)

    // Initial stats
    const initialSettings = makeConversionSettings(this.sliderValue, {
      autoFillEnabled: UserSettings.get().autoFillEnabled,
      imageFit: this.imageFit,
    })
    this.updateStatsDisplay(initialSettings)
    this.updatePreviewSelection()
    this.renderPreviewCanvases()
  }

  private makePreviewPanel(autoFillEnabled: boolean): HTMLElement {
    this.previewCards = []
    this.previewCanvases = []

    const panel = document.createElement('div')
    panel.className = 'px-panel'
    panel.style.cssText = 'padding: 18px;'

    const title = document.createElement('div')
    title.className = 'px-title px-title--sm'
    title.style.cssText = 'text-align: center; margin-bottom: 14px;'
    title.textContent = 'PREVIEW'
    panel.appendChild(title)

    const fitControls = document.createElement('div')
    fitControls.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    `
    fitControls.appendChild(this.makeFitButton('cover', 'FILL'))
    fitControls.appendChild(this.makeFitButton('contain', 'FIT'))
    panel.appendChild(fitControls)

    const previewGrid = document.createElement('div')
    previewGrid.className = 'difficulty-preview-grid'

    for (const preview of makeDifficultyPreviews(autoFillEnabled)) {
      previewGrid.appendChild(this.makePreviewCard(preview))
    }

    panel.appendChild(previewGrid)
    this.updateFitButtons(panel)
    return panel
  }

  private makeFitButton(fit: ImageFit, label: string): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.setAttribute('data-image-fit', fit)
    button.textContent = label
    button.style.cssText = `
      flex: 1;
      min-height: 44px;
      padding: 8px;
      border: 3px solid var(--tc-ink-black);
      border-radius: 4px;
      font-family: var(--tc-font-display);
      font-size: 12px;
      cursor: pointer;
      text-align: center;
    `
    button.addEventListener('click', () => this.setImageFit(fit))
    return button
  }

  private setImageFit(fit: ImageFit): void {
    if (this.imageFit === fit) return
    this.imageFit = fit
    this.updateFitButtons()
    this.renderPreviewCanvases()
  }

  private updateFitButtons(root: ParentNode = this.root ?? document): void {
    const buttons = root.querySelectorAll<HTMLButtonElement>('[data-image-fit]')
    for (const button of buttons) {
      const selected = button.dataset.imageFit === this.imageFit
      button.setAttribute('aria-pressed', String(selected))
      button.style.background = selected ? 'var(--tc-primary-soft)' : 'var(--tc-surface)'
      button.style.boxShadow = selected ? '0 2px 0 0 var(--tc-ink-black)' : '0 4px 0 0 var(--tc-ink-black)'
      button.style.transform = selected ? 'translateY(2px)' : 'translateY(0)'
    }
  }

  private makePreviewCard(preview: DifficultyPreview): HTMLElement {
    const card = document.createElement('button')
    card.type = 'button'
    card.setAttribute('data-difficulty-preview', preview.id)
    card.style.cssText = `
      min-width: 0;
      min-height: 44px;
      padding: 8px;
      background: var(--tc-surface);
      border: 3px solid var(--tc-ink-black);
      border-radius: 4px;
      box-shadow: 0 4px 0 0 var(--tc-ink-black);
      cursor: pointer;
      font-family: inherit;
      text-align: center;
    `
    card.addEventListener('click', () => {
      this.setSliderValue(preview.sliderValue)
    })

    const canvas = document.createElement('canvas')
    canvas.width = 96
    canvas.height = 96
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = `
      width: 100%;
      aspect-ratio: 1;
      display: block;
      background: var(--tc-bg-alt);
      border: 2px solid rgba(31,46,74,0.16);
      image-rendering: pixelated;
      margin-bottom: 8px;
    `
    this.previewCanvases.push({ canvas, gridSize: preview.settings.gridSize })
    card.appendChild(canvas)

    const label = document.createElement('div')
    label.style.cssText = `
      font-family: var(--tc-font-display);
      font-size: 12px;
      letter-spacing: 1px;
      color: var(--tc-ink);
    `
    label.textContent = preview.label
    card.appendChild(label)

    const meta = document.createElement('div')
    meta.style.cssText = `
      margin-top: 5px;
      font-family: var(--tc-font-display);
      font-size: 10px;
      line-height: 1.45;
      color: var(--tc-ink-soft);
      letter-spacing: 0.5px;
    `
    meta.textContent = `${preview.settings.gridSize}x${preview.settings.gridSize} - ${preview.estimatedMinutes}m`
    card.appendChild(meta)

    if (preview.tinyCells) {
      const warning = document.createElement('div')
      warning.setAttribute('data-difficulty-warning', 'tiny-cells')
      warning.style.cssText = `
        margin-top: 6px;
        padding: 4px 3px;
        background: #fef3c7;
        border: 2px solid #92400e;
        border-radius: 3px;
        font-family: var(--tc-font-display);
        font-size: 9px;
        color: #92400e;
        letter-spacing: 0.5px;
      `
      warning.textContent = 'TINY CELLS'
      card.appendChild(warning)
    }

    this.previewCards.push({ sliderValue: preview.sliderValue, element: card })
    return card
  }

  private makeStat(label: string, id: string): HTMLElement {
    const container = document.createElement('div')
    container.className = 'diff-stat'
    container.style.cssText = 'text-align: center;'

    const value = document.createElement('div')
    value.className = 'diff-stat__value'
    value.id = id
    value.style.cssText = `
      font-family: var(--tc-font-display);
      font-size: 22px;
      color: var(--tc-ink);
      letter-spacing: 1px;
    `
    value.textContent = '—'

    const labelEl = document.createElement('div')
    labelEl.className = 'diff-stat__label'
    labelEl.style.cssText = `
      font-family: var(--tc-font-display);
      font-size: 10px;
      color: var(--tc-ink-soft);
      margin-top: 6px;
      letter-spacing: 1px;
    `
    labelEl.textContent = label

    container.appendChild(value)
    container.appendChild(labelEl)
    return container
  }

  private setSliderValue(value: number): void {
    this.sliderValue = Math.max(0, Math.min(1, value))
    if (this.sliderInput) {
      this.sliderInput.value = String(Math.round(this.sliderValue * 100))
    }

    const settings = makeConversionSettings(this.sliderValue, {
      autoFillEnabled: UserSettings.get().autoFillEnabled,
      imageFit: this.imageFit,
    })
    this.updateStatsDisplay(settings)
    this.chickRow?.update(this.sliderValue)
    this.updatePreviewSelection()
  }

  private updatePreviewSelection(): void {
    let best: { sliderValue: number; element: HTMLElement } | null = null
    for (const card of this.previewCards) {
      if (!best || Math.abs(card.sliderValue - this.sliderValue) < Math.abs(best.sliderValue - this.sliderValue)) {
        best = card
      }
    }

    for (const card of this.previewCards) {
      const selected = card === best
      card.element.style.background = selected ? 'var(--tc-primary-soft)' : 'var(--tc-surface)'
      card.element.style.transform = selected ? 'translateY(2px)' : 'translateY(0)'
      card.element.style.boxShadow = selected ? '0 2px 0 0 var(--tc-ink-black)' : '0 4px 0 0 var(--tc-ink-black)'
      card.element.setAttribute('aria-pressed', String(selected))
    }
  }

  private renderPreviewCanvases(): void {
    const source = this.previewSource()
    if (source) {
      this.drawAllPreviews(source)
      return
    }

    const imgEntry = BUNDLED_IMAGES.find(i => i.id === this.bundledName)
    if (!imgEntry) return

    const img = new Image()
    img.onload = () => {
      if (!this.root) return
      this.drawAllPreviews(img)
    }
    img.src = imgEntry.src
  }

  private previewSource(): (CanvasImageSource & { width: number; height: number }) | null {
    if (this.staged?.bitmap) return this.staged.bitmap
    return null
  }

  private drawAllPreviews(source: CanvasImageSource & { width: number; height: number }): void {
    for (const preview of this.previewCanvases) {
      this.drawPixelPreview(preview.canvas, source, preview.gridSize)
    }
  }

  private drawPixelPreview(
    canvas: HTMLCanvasElement,
    source: CanvasImageSource & { width: number; height: number },
    gridSize: number
  ): void {
    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = canvas.getContext('2d')
    } catch {
      return
    }
    if (!ctx) return

    const sample = document.createElement('canvas')
    sample.width = gridSize
    sample.height = gridSize
    let sampleCtx: CanvasRenderingContext2D | null = null
    try {
      sampleCtx = sample.getContext('2d')
    } catch {
      return
    }
    if (!sampleCtx) return

    sampleCtx.fillStyle = '#fff'
    sampleCtx.fillRect(0, 0, gridSize, gridSize)
    drawImageFit(sampleCtx, source, 0, 0, gridSize, gridSize, this.imageFit)

    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(sample, 0, 0, canvas.width, canvas.height)
  }

  private updateStatsDisplay(settings: ReturnType<typeof makeConversionSettings>): void {
    const gridStat = document.getElementById('diff-stat-grid')
    if (gridStat) gridStat.textContent = `${settings.gridSize}×${settings.gridSize}`

    const colorsStat = document.getElementById('diff-stat-colours')
    if (colorsStat) colorsStat.textContent = `${settings.paletteSize}`

    // Rough time estimate (varies by user)
    const mins = estimateCompletionMinutes(settings)
    const timeStat = document.getElementById('diff-stat-time')
    if (timeStat) timeStat.textContent = `${mins}m`
  }

  unmount(): void {
    this.objectUrls.revokeAll()
    this.sliderInput = null
    this.previewCards = []
    this.previewCanvases = []
    if (this.staged && !ImportStaging.has()) {
      ImportStaging.clearQueue()
    }
    this.releaseStaged()
    if (this.root) {
      this.root.innerHTML = ''
      this.root = null
    }
  }

  private releaseStaged(): void {
    if (!this.staged) return
    this.staged.bitmap.close()
    this.staged = null
  }

  private async startGame(): Promise<void> {
    if (!this.startBtn) return
    this.startBtn.textContent = 'Converting...'
    this.startBtn.disabled = true

    try {
      const settings = makeConversionSettings(this.sliderValue, {
        autoFillEnabled: UserSettings.get().autoFillEnabled,
        imageFit: this.imageFit,
      })
      let output: Awaited<ReturnType<typeof convert>>
      let thumbnail: Blob | undefined
      let sourceImageBlob: Blob | undefined
      let artworkTitle: string
      let artwork: Artwork
      let releaseStagedAfterSave = false

      if (this.staged) {
        const stagedImage = this.staged
        let conversionBitmap: ImageBitmap | null = null

        try {
          conversionBitmap = await decodeAndDownscale(stagedImage.imageBlob)
          ;[thumbnail, sourceImageBlob] = await Promise.all([
            makeThumbnail(conversionBitmap, undefined, this.imageFit),
            makeSourceImageBlob(conversionBitmap),
          ])

          const conversionPromise = convertFromBitmapInWorker(conversionBitmap, settings)
          conversionBitmap = null
          output = await conversionPromise
        } finally {
          conversionBitmap?.close()
        }

        const stagedOrigin = stagedImage.origin
        const stagedAttribution = stagedImage.attribution
        const capturedAt = Date.now()
        artworkTitle = stagedImage.suggestedTitle
        releaseStagedAfterSave = true

        const paletteColours = output.centroids.map((c, i) => ({ rgba: c, number: i + 1 }))
        const palette = new Palette(paletteColours)
        const grid = createGridFromConversionOutput(output, settings)

        const source: import('../model/Artwork').ArtworkSource =
          stagedOrigin === 'search' && stagedAttribution
            ? { kind: 'search', capturedAt, attribution: stagedAttribution }
            : { kind: 'user', capturedAt, origin: stagedOrigin as 'library' | 'camera' }

        artwork = {
          id: generateId(),
          title: artworkTitle,
          source,
          thumbnailBlob: thumbnail,
          sourceImageBlob,
          createdAt: Date.now(),
          lastModifiedAt: Date.now(),
          isComplete: false,
          conversionSettings: settings,
          palette,
          grid,
        }
      } else {
        const imgEntry = BUNDLED_IMAGES.find(i => i.id === this.bundledName)
        if (!imgEntry) throw new Error('Bundled image not found')

        output = await convert(imgEntry.src, settings)
        artworkTitle = imgEntry.title

        const paletteColours = output.centroids.map((c, i) => ({ rgba: c, number: i + 1 }))
        const palette = new Palette(paletteColours)
        const grid = createGridFromConversionOutput(output, settings)

        artwork = {
          id: generateId(),
          title: artworkTitle,
          source: { kind: 'bundled', bundledImageName: this.bundledName! },
          createdAt: Date.now(),
          lastModifiedAt: Date.now(),
          isComplete: false,
          conversionSettings: settings,
          palette,
          grid,
        }
      }

      await this.store.saveImmediate(artwork)
      if (releaseStagedAfterSave) this.releaseStaged()
      if (await this.stageNextQueuedImport()) {
        this.router.navigate('#/difficulty/import')
      } else {
        this.router.navigate(`#/puzzle/${artwork.id}`)
      }
    } catch (err) {
      console.error('Conversion failed:', err)
      this.showToast(this.storageErrorMessage(err))
      if (this.startBtn) {
        this.startBtn.textContent = '▶ START!'
        this.startBtn.disabled = false
      }
    }
  }

  private async stageNextQueuedImport(): Promise<boolean> {
    const next = ImportStaging.takeNextQueued()
    if (!next) return false

    try {
      const bitmap = await decodeAndDownscale(next.imageBlob)
      ImportStaging.set({ ...next, bitmap })
      return true
    } catch {
      this.showToast(`Could not load ${next.suggestedTitle}.`)
      return this.stageNextQueuedImport()
    }
  }

  private storageErrorMessage(err: unknown): string {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      return 'Device storage is full. Delete some pictures in Settings, then try again.'
    }
    return 'Could not convert or save this picture. Try another photo or check device storage.'
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
