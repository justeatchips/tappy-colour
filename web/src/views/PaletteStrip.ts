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
  }

  get element(): HTMLElement {
    return this.el
  }

  mount(): void {
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
    container.className = 'palette-strip__list'

    for (let i = 0; i < palette.colours.length; i++) {
      const entry = document.createElement('button')
      entry.type = 'button'
      entry.className = 'palette-entry'
      entry.dataset.paletteEntry = String(i)
      entry.setAttribute('aria-label', `Colour ${i + 1}`)

      const swatch = document.createElement('div')
      swatch.className = 'palette-swatch'
      swatch.dataset.paletteSwatch = String(i)
      swatch.style.background = palette.cssString(i)

      const paintedCount = this.session.paintedCells(i)
      const totalCount = this.session.totalCells(i)

      if (paintedCount === totalCount && totalCount > 0) {
        const checkmark = document.createElement('div')
        checkmark.className = 'palette-swatch__check'
        checkmark.textContent = 'OK'
        swatch.appendChild(checkmark)
      }

      entry.appendChild(swatch)

      const numberEl = document.createElement('div')
      numberEl.className = 'palette-number'
      numberEl.dataset.paletteNumber = String(i)
      numberEl.textContent = (i + 1).toString()
      entry.appendChild(numberEl)

      const progressEl = document.createElement('div')
      progressEl.className = 'palette-progress'
      progressEl.dataset.paletteProgress = String(i)
      progressEl.textContent = `${paintedCount}/${totalCount}`
      entry.appendChild(progressEl)

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

      if (index === this.session.selectedPaletteIndex) {
        entry.setAttribute('aria-current', 'true')
        if (pulse && swatch) {
          swatch.classList.remove('swatch-pulse')
          void swatch.offsetWidth
          swatch.classList.add('swatch-pulse')
          swatch.addEventListener('animationend', () => swatch.classList.remove('swatch-pulse'), { once: true })
        }
      } else {
        entry.removeAttribute('aria-current')
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
