import type { RGBA8 } from '../engine/types'
import { rgbToHsb, hsbToRgb } from '../util/colour'

// Curated kid-friendly colour grid (30 colours, 6 columns)
const CURATED: RGBA8[] = [
  // Row 1: reds + oranges
  { r: 220, g: 38,  b: 38,  a: 255 },
  { r: 239, g: 68,  b: 68,  a: 255 },
  { r: 249, g: 115, b: 22,  a: 255 },
  { r: 251, g: 146, b: 60,  a: 255 },
  { r: 234, g: 179, b: 8,   a: 255 },
  { r: 253, g: 224, b: 71,  a: 255 },
  // Row 2: greens
  { r: 22,  g: 163, b: 74,  a: 255 },
  { r: 74,  g: 222, b: 128, a: 255 },
  { r: 16,  g: 185, b: 129, a: 255 },
  { r: 52,  g: 211, b: 153, a: 255 },
  { r: 6,   g: 182, b: 212, a: 255 },
  { r: 103, g: 232, b: 249, a: 255 },
  // Row 3: blues + purples
  { r: 37,  g: 99,  b: 235, a: 255 },
  { r: 96,  g: 165, b: 250, a: 255 },
  { r: 124, g: 58,  b: 237, a: 255 },
  { r: 167, g: 139, b: 250, a: 255 },
  { r: 219, g: 39,  b: 119, a: 255 },
  { r: 244, g: 114, b: 182, a: 255 },
  // Row 4: browns + skin tones
  { r: 120, g: 53,  b: 15,  a: 255 },
  { r: 180, g: 83,  b: 9,   a: 255 },
  { r: 245, g: 158, b: 11,  a: 255 },
  { r: 254, g: 215, b: 170, a: 255 },
  { r: 253, g: 186, b: 116, a: 255 },
  { r: 252, g: 165, b: 165, a: 255 },
  // Row 5: greyscale
  { r: 17,  g: 24,  b: 39,  a: 255 },
  { r: 75,  g: 85,  b: 99,  a: 255 },
  { r: 156, g: 163, b: 175, a: 255 },
  { r: 209, g: 213, b: 219, a: 255 },
  { r: 243, g: 244, b: 246, a: 255 },
  { r: 255, g: 255, b: 255, a: 255 },
]

// Okabe-Ito / Wong colour-blind-safe palette
const CB_SAFE: RGBA8[] = [
  { r: 0,   g: 0,   b: 0,   a: 255 }, // black
  { r: 230, g: 159, b: 0,   a: 255 }, // orange
  { r: 86,  g: 180, b: 233, a: 255 }, // sky blue
  { r: 0,   g: 158, b: 115, a: 255 }, // bluish green
  { r: 240, g: 228, b: 66,  a: 255 }, // yellow
  { r: 0,   g: 114, b: 178, a: 255 }, // blue
  { r: 213, g: 94,  b: 0,   a: 255 }, // vermillion
  { r: 204, g: 121, b: 167, a: 255 }, // reddish purple
]

export interface ColourPickerOptions {
  initial: RGBA8
  onPick: (rgba: RGBA8) => void
  onCancel: () => void
  onReset?: () => void
}

export class ColourPicker {
  private overlay: HTMLElement
  private current: RGBA8
  private previewEl: HTMLElement | null = null
  private hSlider: HTMLInputElement | null = null
  private sSlider: HTMLInputElement | null = null
  private bSlider: HTMLInputElement | null = null

  constructor(private opts: ColourPickerOptions) {
    this.current = { ...opts.initial }
    this.overlay = this.build()
  }

  mount(root: HTMLElement): void {
    root.appendChild(this.overlay)
  }

  unmount(): void {
    this.overlay.remove()
  }

  private build(): HTMLElement {
    const overlay = document.createElement('div')
    overlay.dataset.colourPickerOverlay = 'true'
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 20px;
      box-sizing: border-box;
    `

    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.cancel() })

    const panel = document.createElement('div')
    panel.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 20px;
      width: 100%;
      max-width: 360px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.25);
      max-height: 90vh;
      overflow-y: auto;
      box-sizing: border-box;
    `

    // Header
    const header = document.createElement('div')
    header.style.cssText = `display: flex; justify-content: space-between; align-items: center;`
    const title = document.createElement('h3')
    title.textContent = 'Pick a Colour'
    title.style.cssText = `margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;`
    header.appendChild(title)

    // Preview swatch
    this.previewEl = document.createElement('div')
    this.previewEl.style.cssText = `
      width: 44px;
      height: 44px;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      flex-shrink: 0;
    `
    header.appendChild(this.previewEl)
    panel.appendChild(header)

    // Colour-blind section
    const cbLabel = document.createElement('p')
    cbLabel.textContent = 'Colourblind-friendly'
    cbLabel.style.cssText = `margin: 0; font-size: 13px; font-weight: 600; color: #6b7280;`
    panel.appendChild(cbLabel)

    const cbGrid = document.createElement('div')
    cbGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
    `
    for (const colour of CB_SAFE) {
      const swatch = document.createElement('button')
      swatch.style.cssText = `
        width: 100%;
        aspect-ratio: 1;
        min-height: 36px;
        min-width: 36px;
        border-radius: 8px;
        border: 2px solid transparent;
        background: rgb(${colour.r},${colour.g},${colour.b});
        cursor: pointer;
        padding: 0;
        transition: transform 0.1s, border-color 0.1s;
      `
      swatch.addEventListener('mouseover', () => { swatch.style.transform = 'scale(1.1)' })
      swatch.addEventListener('mouseout', () => { swatch.style.transform = 'scale(1)' })
      const pick = () => { this.current = { ...colour }; this.opts.onPick(this.current) }
      swatch.addEventListener('click', pick)
      swatch.addEventListener('touchend', (e) => { e.preventDefault(); pick() })
      cbGrid.appendChild(swatch)
    }
    panel.appendChild(cbGrid)

    // Curated grid
    const gridLabel = document.createElement('p')
    gridLabel.textContent = 'Quick colours'
    gridLabel.style.cssText = `margin: 0; font-size: 13px; font-weight: 600; color: #6b7280;`
    panel.appendChild(gridLabel)

    const grid = document.createElement('div')
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
    `
    for (const colour of CURATED) {
      const swatch = document.createElement('button')
      swatch.style.cssText = `
        width: 100%;
        aspect-ratio: 1;
        min-height: 44px;
        min-width: 36px;
        border-radius: 8px;
        border: 2px solid transparent;
        background: rgb(${colour.r},${colour.g},${colour.b});
        cursor: pointer;
        padding: 0;
        transition: transform 0.1s, border-color 0.1s;
      `
      swatch.addEventListener('mouseover', () => { swatch.style.transform = 'scale(1.1)' })
      swatch.addEventListener('mouseout', () => { swatch.style.transform = 'scale(1)' })
      const pick = () => { this.current = { ...colour }; this.opts.onPick(this.current) }
      swatch.addEventListener('click', pick)
      swatch.addEventListener('touchend', (e) => { e.preventDefault(); pick() })
      grid.appendChild(swatch)
    }
    panel.appendChild(grid)

    // HSB sliders
    const hsbLabel = document.createElement('p')
    hsbLabel.textContent = 'Custom colour'
    hsbLabel.style.cssText = `margin: 0; font-size: 13px; font-weight: 600; color: #6b7280;`
    panel.appendChild(hsbLabel)

    const hsbSection = document.createElement('div')
    hsbSection.style.cssText = `display: flex; flex-direction: column; gap: 10px;`

    const hsb = rgbToHsb(this.current.r, this.current.g, this.current.b)
    const sliderDefs: Array<{ label: string; min: number; max: number; initial: number; gradient: string; ref: 'hSlider' | 'sSlider' | 'bSlider' }> = [
      { label: 'Hue', min: 0, max: 360, initial: hsb.h, gradient: 'linear-gradient(to right,red,yellow,lime,cyan,blue,magenta,red)', ref: 'hSlider' },
      { label: 'Saturation', min: 0, max: 100, initial: hsb.s, gradient: 'linear-gradient(to right,#fff,hsl(0,100%,50%))', ref: 'sSlider' },
      { label: 'Brightness', min: 0, max: 100, initial: hsb.b, gradient: 'linear-gradient(to right,#000,#fff)', ref: 'bSlider' },
    ]

    for (const def of sliderDefs) {
      const row = document.createElement('div')
      row.style.cssText = `display: flex; align-items: center; gap: 10px;`

      const lbl = document.createElement('span')
      lbl.textContent = def.label
      lbl.style.cssText = `width: 72px; font-size: 12px; font-weight: 600; color: #374151; flex-shrink: 0;`

      const sliderWrap = document.createElement('div')
      sliderWrap.style.cssText = `flex: 1; height: 24px; border-radius: 4px; background: ${def.gradient}; position: relative;`

      const slider = document.createElement('input')
      slider.type = 'range'
      slider.min = def.min.toString()
      slider.max = def.max.toString()
      slider.value = def.initial.toString()
      slider.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0.01;
        cursor: pointer;
        margin: 0;
        min-height: 44px;
      `
      slider.addEventListener('input', () => this.onSliderChange())
      sliderWrap.appendChild(slider)
      this.hSlider = def.ref === 'hSlider' ? slider : this.hSlider
      this.sSlider = def.ref === 'sSlider' ? slider : this.sSlider
      this.bSlider = def.ref === 'bSlider' ? slider : this.bSlider

      row.appendChild(lbl)
      row.appendChild(sliderWrap)
      hsbSection.appendChild(row)
    }

    panel.appendChild(hsbSection)

    // Buttons
    const btnRow = document.createElement('div')
    btnRow.style.cssText = `display: flex; gap: 10px; margin-top: 4px;`

    if (this.opts.onReset) {
      const resetBtn = document.createElement('button')
      resetBtn.textContent = 'Reset Palette'
      resetBtn.style.cssText = `
        flex: 1;
        padding: 14px;
        min-height: 52px;
        font-size: 15px;
        font-weight: 600;
        background: #fef2f2;
        color: #dc2626;
        border: none;
        border-radius: 10px;
        cursor: pointer;
      `
      const doReset = () => { this.unmount(); this.opts.onReset!() }
      resetBtn.addEventListener('click', doReset)
      resetBtn.addEventListener('touchend', (e) => { e.preventDefault(); doReset() })
      btnRow.appendChild(resetBtn)
    }

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.style.cssText = `
      flex: 1;
      padding: 14px;
      min-height: 52px;
      font-size: 15px;
      font-weight: 600;
      background: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 10px;
      cursor: pointer;
    `
    const doCancel = () => { this.cancel() }
    cancelBtn.addEventListener('click', doCancel)
    cancelBtn.addEventListener('touchend', (e) => { e.preventDefault(); doCancel() })
    btnRow.appendChild(cancelBtn)

    panel.appendChild(btnRow)
    overlay.appendChild(panel)

    this.updatePreview()
    return overlay
  }

  private onSliderChange(): void {
    if (!this.hSlider || !this.sSlider || !this.bSlider) return
    const h = parseInt(this.hSlider.value)
    const s = parseInt(this.sSlider.value)
    const b = parseInt(this.bSlider.value)
    this.current = hsbToRgb(h, s, b)
    this.updatePreview()
    this.opts.onPick(this.current)
  }

  private cancel(): void {
    this.unmount()
    this.opts.onCancel()
  }

  private updatePreview(): void {
    if (this.previewEl) {
      this.previewEl.style.background = `rgb(${this.current.r},${this.current.g},${this.current.b})`
    }
  }
}
