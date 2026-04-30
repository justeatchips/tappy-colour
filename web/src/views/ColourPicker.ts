import type { RGBA8 } from '../engine/types'
import { rgbToHsb, hsbToRgb } from '../util/colour'
import { createPanel, createPxButton } from '../ui/pixel'

const CURATED: RGBA8[] = [
  { r: 220, g: 38, b: 38, a: 255 },
  { r: 239, g: 68, b: 68, a: 255 },
  { r: 249, g: 115, b: 22, a: 255 },
  { r: 251, g: 146, b: 60, a: 255 },
  { r: 234, g: 179, b: 8, a: 255 },
  { r: 253, g: 224, b: 71, a: 255 },
  { r: 22, g: 163, b: 74, a: 255 },
  { r: 74, g: 222, b: 128, a: 255 },
  { r: 16, g: 185, b: 129, a: 255 },
  { r: 52, g: 211, b: 153, a: 255 },
  { r: 6, g: 182, b: 212, a: 255 },
  { r: 103, g: 232, b: 249, a: 255 },
  { r: 37, g: 99, b: 235, a: 255 },
  { r: 96, g: 165, b: 250, a: 255 },
  { r: 124, g: 58, b: 237, a: 255 },
  { r: 167, g: 139, b: 250, a: 255 },
  { r: 219, g: 39, b: 119, a: 255 },
  { r: 244, g: 114, b: 182, a: 255 },
  { r: 120, g: 53, b: 15, a: 255 },
  { r: 180, g: 83, b: 9, a: 255 },
  { r: 245, g: 158, b: 11, a: 255 },
  { r: 254, g: 215, b: 170, a: 255 },
  { r: 253, g: 186, b: 116, a: 255 },
  { r: 252, g: 165, b: 165, a: 255 },
  { r: 17, g: 24, b: 39, a: 255 },
  { r: 75, g: 85, b: 99, a: 255 },
  { r: 156, g: 163, b: 175, a: 255 },
  { r: 209, g: 213, b: 219, a: 255 },
  { r: 243, g: 244, b: 246, a: 255 },
  { r: 255, g: 255, b: 255, a: 255 },
]

const CB_SAFE: RGBA8[] = [
  { r: 0, g: 0, b: 0, a: 255 },
  { r: 230, g: 159, b: 0, a: 255 },
  { r: 86, g: 180, b: 233, a: 255 },
  { r: 0, g: 158, b: 115, a: 255 },
  { r: 240, g: 228, b: 66, a: 255 },
  { r: 0, g: 114, b: 178, a: 255 },
  { r: 213, g: 94, b: 0, a: 255 },
  { r: 204, g: 121, b: 167, a: 255 },
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
    overlay.className = 'tc-modal-scrim'
    overlay.dataset.colourPickerOverlay = 'true'
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.cancel() })

    const panel = createPanel('tc-stack colour-picker')

    const header = document.createElement('div')
    header.className = 'colour-picker__header'

    const title = document.createElement('h3')
    title.className = 'px-title px-title--sm colour-picker__title'
    title.textContent = 'PICK A COLOUR'
    header.appendChild(title)

    this.previewEl = document.createElement('div')
    this.previewEl.className = 'colour-picker__preview'
    header.appendChild(this.previewEl)
    panel.appendChild(header)

    panel.appendChild(this.makeLabel('Colourblind-friendly'))
    panel.appendChild(this.makeSwatchGrid(CB_SAFE, 'colour-picker__grid--safe'))

    panel.appendChild(this.makeLabel('Quick colours'))
    panel.appendChild(this.makeSwatchGrid(CURATED, 'colour-picker__grid--quick'))

    panel.appendChild(this.makeLabel('Custom colour'))
    panel.appendChild(this.makeSliders())

    const btnRow = document.createElement('div')
    btnRow.className = 'tc-modal-actions'

    if (this.opts.onReset) {
      const resetBtn = createPxButton({
        label: 'Reset Palette',
        variant: 'danger',
        onClick: () => { this.unmount(); this.opts.onReset!() },
      })
      resetBtn.addEventListener('touchend', (e) => {
        e.preventDefault()
        this.unmount()
        this.opts.onReset!()
      })
      btnRow.appendChild(resetBtn)
    }

    const cancelBtn = createPxButton({
      label: 'Cancel',
      variant: 'ghost',
      onClick: () => this.cancel(),
    })
    cancelBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.cancel() })
    btnRow.appendChild(cancelBtn)

    panel.appendChild(btnRow)
    overlay.appendChild(panel)

    this.updatePreview()
    return overlay
  }

  private makeLabel(text: string): HTMLElement {
    const label = document.createElement('p')
    label.className = 'colour-picker__section-label'
    label.textContent = text
    return label
  }

  private makeSwatchGrid(colours: RGBA8[], modifier: string): HTMLElement {
    const grid = document.createElement('div')
    grid.className = `colour-picker__grid ${modifier}`

    for (const colour of colours) {
      const swatch = document.createElement('button')
      swatch.type = 'button'
      swatch.className = 'colour-picker__swatch'
      swatch.style.background = `rgb(${colour.r},${colour.g},${colour.b})`
      const pick = () => { this.current = { ...colour }; this.opts.onPick(this.current); this.updatePreview() }
      swatch.addEventListener('click', pick)
      swatch.addEventListener('touchend', (e) => { e.preventDefault(); pick() })
      grid.appendChild(swatch)
    }

    return grid
  }

  private makeSliders(): HTMLElement {
    const hsbSection = document.createElement('div')
    hsbSection.className = 'colour-picker__sliders'

    const hsb = rgbToHsb(this.current.r, this.current.g, this.current.b)
    const sliderDefs: Array<{ label: string; min: number; max: number; initial: number; gradient: string; ref: 'hSlider' | 'sSlider' | 'bSlider' }> = [
      { label: 'Hue', min: 0, max: 360, initial: hsb.h, gradient: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)', ref: 'hSlider' },
      { label: 'Saturation', min: 0, max: 100, initial: hsb.s, gradient: 'linear-gradient(to right, white, hsl(0, 100%, 50%))', ref: 'sSlider' },
      { label: 'Brightness', min: 0, max: 100, initial: hsb.b, gradient: 'linear-gradient(to right, black, white)', ref: 'bSlider' },
    ]

    for (const def of sliderDefs) {
      const row = document.createElement('div')
      row.className = 'colour-picker__slider-row'

      const lbl = document.createElement('span')
      lbl.className = 'colour-picker__slider-label'
      lbl.textContent = def.label

      const sliderWrap = document.createElement('div')
      sliderWrap.className = 'colour-picker__slider-wrap'
      sliderWrap.style.background = def.gradient

      const slider = document.createElement('input')
      slider.type = 'range'
      slider.className = 'colour-picker__slider'
      slider.min = def.min.toString()
      slider.max = def.max.toString()
      slider.value = def.initial.toString()
      slider.addEventListener('input', () => this.onSliderChange())
      sliderWrap.appendChild(slider)

      this[def.ref] = slider

      row.appendChild(lbl)
      row.appendChild(sliderWrap)
      hsbSection.appendChild(row)
    }

    return hsbSection
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
