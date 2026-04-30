import type { PaintingSession } from '../model/PaintingSession'
import { ColourPicker } from './ColourPicker'
import { showConfirmDialog } from './ConfirmDialog'

export class PaletteStrip {
  private el: HTMLElement
  private unsubs: Array<() => void> = []
  private activePicker: ColourPicker | null = null

  constructor(private session: PaintingSession) {
    this.el = document.createElement('div')
    this.el.className = 'palette-strip'
    this.el.style.cssText = `
      height: 80px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-top: 1px solid #e5e7eb;
      overflow-x: auto;
      overflow-y: hidden;
    `
  }

  get element(): HTMLElement {
    return this.el
  }

  mount(): void {
    // Inject pulse keyframe once
    if (!document.getElementById('palette-strip-styles')) {
      const style = document.createElement('style')
      style.id = 'palette-strip-styles'
      style.textContent = `
        @keyframes swatch-pulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
        .swatch-pulse { animation: swatch-pulse 0.5s ease-out; }
      `
      document.head.appendChild(style)
    }

    const unsubChange = this.session.on('change', (eventType) => {
      if (eventType === 'selectionChanged') {
        this.updateSelection(true)
      } else if (eventType === 'gridChanged' || eventType === 'paletteChanged') {
        this.render()
      }
    })
    this.unsubs.push(unsubChange)

    this.render()
  }

  unmount(): void {
    this.activePicker?.unmount()
    this.activePicker = null
    this.unsubs.forEach(unsub => unsub())
    this.unsubs = []
    this.el.innerHTML = ''
  }

  private render(): void {
    this.el.innerHTML = ''

    const palette = this.session.palette

    const container = document.createElement('div')
    container.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 8px;
      min-width: max-content;
    `

    for (let i = 0; i < palette.colours.length; i++) {
      const entry = document.createElement('button')
      entry.type = 'button'
      entry.dataset.paletteEntry = String(i)
      entry.setAttribute('aria-label', `Colour ${i + 1}`)
      entry.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px;
        min-width: 64px;
        cursor: pointer;
        border-radius: 8px;
        border: 3px solid transparent;
        box-sizing: border-box;
        transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        font-family: inherit;
      `

      entry.addEventListener('mouseover', () => {
        if (i !== this.session.selectedPaletteIndex) {
          entry.style.background = 'rgba(0, 0, 0, 0.05)'
        }
      })

      entry.addEventListener('mouseout', () => {
        if (i !== this.session.selectedPaletteIndex) {
          entry.style.background = 'transparent'
        }
      })

      // Swatch
      const swatch = document.createElement('div')
      swatch.dataset.paletteSwatch = String(i)
      swatch.style.cssText = `
        width: 44px;
        height: 44px;
        border-radius: 8px;
        background: ${palette.cssString(i)};
        position: relative;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      `

      const paintedCount = this.session.paintedCells(i)
      const totalCount = this.session.totalCells(i)

      // Checkmark if all painted
      if (paintedCount === totalCount && totalCount > 0) {
        const checkmark = document.createElement('div')
        checkmark.style.cssText = `
          position: absolute;
          top: -4px;
          right: -4px;
          width: 24px;
          height: 24px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
        `
        checkmark.textContent = '✓'
        swatch.appendChild(checkmark)
      }

      entry.appendChild(swatch)

      // Number
      const numberEl = document.createElement('div')
      numberEl.dataset.paletteNumber = String(i)
      numberEl.style.cssText = `
        font-size: 14px;
        font-weight: bold;
        color: #1f2937;
        margin-top: 4px;
        min-width: 28px;
        min-height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
      `
      numberEl.textContent = (i + 1).toString()
      entry.appendChild(numberEl)

      // Progress
      const progressEl = document.createElement('div')
      progressEl.dataset.paletteProgress = String(i)
      progressEl.style.cssText = `
        font-size: 12px;
        color: #6b7280;
        margin-top: 2px;
      `
      progressEl.textContent = `${paintedCount}/${totalCount}`
      entry.appendChild(progressEl)

      // Tap selects; long-press (500ms) opens colour picker
      this.attachEntryHandlers(entry, i)

      container.appendChild(entry)
    }

    this.el.appendChild(container)
    this.updateSelection()
  }

  private attachEntryHandlers(entry: HTMLElement, index: number): void {
    let longPressTimer: ReturnType<typeof setTimeout> | null = null
    let longPressFired = false
    let startX = 0
    let startY = 0

    const startLongPress = (x: number, y: number) => {
      startX = x; startY = y; longPressFired = false
      longPressTimer = setTimeout(() => {
        longPressFired = true
        this.openColourPicker(index)
      }, 500)
    }

    const cancelLongPress = () => {
      if (longPressTimer !== null) { clearTimeout(longPressTimer); longPressTimer = null }
    }

    entry.addEventListener('touchstart', (e) => {
      const t = e.touches[0]
      startLongPress(t.clientX, t.clientY)
    }, { passive: true })

    entry.addEventListener('touchmove', (e) => {
      const t = e.touches[0]
      const dx = t.clientX - startX, dy = t.clientY - startY
      if (Math.sqrt(dx * dx + dy * dy) > 8) cancelLongPress()
    }, { passive: true })

    const select = () => {
      this.session.selectPaletteIndex(index)
      this.updateSelection()
    }

    entry.addEventListener('touchend', (e) => {
      cancelLongPress()
      if (!longPressFired) { e.preventDefault(); select() }
    })

    entry.addEventListener('mousedown', (e) => startLongPress(e.clientX, e.clientY))
    entry.addEventListener('mousemove', (e) => {
      const dx = e.clientX - startX, dy = e.clientY - startY
      if (Math.sqrt(dx * dx + dy * dy) > 8) cancelLongPress()
    })
    entry.addEventListener('mouseup', () => { cancelLongPress() })
    entry.addEventListener('click', () => { if (!longPressFired) select() })
  }

  private openColourPicker(index: number): void {
    if (this.activePicker) return
    const initial = this.session.palette.colours[index]?.rgba ?? { r: 128, g: 128, b: 128, a: 255 }

    const picker = new ColourPicker({
      initial,
      onPick: (rgba) => {
        this.session.replacePaletteColour(index, rgba)
      },
      onCancel: () => {
        this.activePicker = null
      },
      onReset: async () => {
        this.activePicker = null
        const confirmed = await showConfirmDialog('Reset all colours to the suggested palette?')
        if (confirmed) this.session.resetPalette()
      },
    })

    this.activePicker = picker
    picker.mount(document.body)
  }

  private updateSelection(pulse = false): void {
    const entries = this.el.querySelectorAll<HTMLElement>('[data-palette-entry]')
    entries.forEach((entry, index) => {
      const swatch = entry.querySelector<HTMLElement>('[data-palette-swatch]')
      const number = entry.querySelector<HTMLElement>('[data-palette-number]')
      const progress = entry.querySelector<HTMLElement>('[data-palette-progress]')

      if (index === this.session.selectedPaletteIndex) {
        entry.setAttribute('aria-current', 'true')
        entry.style.background = '#fef3c7'
        entry.style.borderColor = '#111827'
        entry.style.boxShadow = '0 0 0 4px #facc15, 0 5px 0 0 #111827'
        entry.style.transform = 'translateY(-2px)'
        if (swatch) swatch.style.boxShadow = '0 0 0 3px #fff, 0 0 0 6px #111827'
        if (number) {
          number.style.background = '#111827'
          number.style.color = '#fff'
        }
        if (progress) progress.style.color = '#111827'
        if (pulse) {
          if (swatch) {
            swatch.classList.remove('swatch-pulse')
            void swatch.offsetWidth // force reflow to restart animation
            swatch.classList.add('swatch-pulse')
            swatch.addEventListener('animationend', () => swatch.classList.remove('swatch-pulse'), { once: true })
          }
        }
      } else {
        entry.removeAttribute('aria-current')
        entry.style.background = 'transparent'
        entry.style.borderColor = 'transparent'
        entry.style.boxShadow = 'none'
        entry.style.transform = 'translateY(0)'
        if (swatch) swatch.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
        if (number) {
          number.style.background = 'transparent'
          number.style.color = '#1f2937'
        }
        if (progress) progress.style.color = '#6b7280'
      }
    })

    this.scrollActiveIntoView()
  }

  private scrollActiveIntoView(): void {
    const entry = this.el.querySelector<HTMLElement>(`[data-palette-entry="${this.session.selectedPaletteIndex}"]`)
    if (entry) {
      entry.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }
}
