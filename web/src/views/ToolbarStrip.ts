import type { PaintingSession } from '../model/PaintingSession'
import type { PaintTool } from '../model/PaintTool'
import { pulseElement } from '../ui/pixel'

const TOOLS: Array<{ tool: PaintTool; label: string; shortLabel: string; icon: string }> = [
  {
    tool: 'tap',
    label: 'Tap',
    shortLabel: 'Tap',
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.8"/>
      <path d="M12 5.5l5.8 5.8-3.2.7 2.1 4.1-2.4 1.2-2-4-2.2 2.3L12 5.5z" fill="currentColor"/>
    </svg>`,
  },
  {
    tool: 'bucket',
    label: 'Fill Region',
    shortLabel: 'Fill',
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12.5l6.2-6.2 5.5 5.5-4.2 4.2H4v-3.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M8.5 5L11 2.5l6 6-2.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M17.5 14.5c1.1 1.2 1.7 2.2 1.7 3a1.7 1.7 0 01-3.4 0c0-.8.6-1.8 1.7-3z" fill="currentColor"/>
    </svg>`,
  },
  {
    tool: 'fillAll',
    label: 'Fill All',
    shortLabel: 'All',
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor"/>
      <rect x="13" y="3" width="6" height="6" rx="1" fill="currentColor"/>
      <rect x="3" y="13" width="6" height="6" rx="1" fill="currentColor"/>
      <rect x="13" y="13" width="6" height="6" rx="1" fill="currentColor"/>
      <path d="M5 16l1.2 1.2L8.5 15" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 6l1.2 1.2L18.5 5" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
]

const HINT_ICON = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 18h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M9 21h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M11 2a6 6 0 00-3.4 10.9c.8.6 1.1 1.2 1.1 2.1h4.6c0-.9.3-1.5 1.1-2.1A6 6 0 0011 2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
</svg>`

export class ToolbarStrip {
  private el: HTMLElement
  private buttons: Map<PaintTool, HTMLButtonElement> = new Map()
  private hintButton: HTMLButtonElement | null = null
  private unsubs: Array<() => void> = []

  constructor(private session: PaintingSession) {
    this.el = document.createElement('div')
    this.el.className = 'tc-tool-strip'
    this.buildButtons()
  }

  get element(): HTMLElement {
    return this.el
  }

  mount(): void {
    const unsub = this.session.on('change', (eventType) => {
      if (eventType === 'toolChanged') this.updateSelection()
      if (eventType === 'selectionChanged' || eventType === 'gridChanged') this.updateHintAvailability()
    })
    this.unsubs.push(unsub)
    this.updateSelection()
  }

  unmount(): void {
    this.unsubs.forEach(u => u())
    this.unsubs = []
  }

  private buildButtons(): void {
    for (const { tool, label, shortLabel, icon } of TOOLS) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'tc-tool-button'
      btn.setAttribute('aria-label', label)
      btn.title = label
      btn.dataset.touchLabel = label
      btn.innerHTML = `<span class="tc-tool-button__icon">${icon}</span><span class="tc-tool-button__text">${shortLabel}</span>`

      const activate = () => {
        this.session.setTool(tool)
        pulseElement(btn)
      }

      btn.addEventListener('click', activate)
      btn.addEventListener('touchend', (e) => { e.preventDefault(); activate() })

      this.buttons.set(tool, btn)
      this.el.appendChild(btn)
    }

    const hintBtn = this.makeIconButton('Hint', 'Hint', HINT_ICON)
    hintBtn.title = 'Hint'
    const requestHint = () => {
      this.session.requestHint()
      pulseElement(hintBtn)
    }
    hintBtn.addEventListener('click', requestHint)
    hintBtn.addEventListener('touchend', (e) => { e.preventDefault(); requestHint() })
    this.hintButton = hintBtn
    this.el.appendChild(hintBtn)

    // Spacer so label sits right-aligned
    const spacer = document.createElement('div')
    spacer.className = 'tc-tool-spacer'
    this.el.appendChild(spacer)

    // Tool name label
    const label = document.createElement('span')
    label.id = 'toolbar-tool-label'
    label.className = 'tc-tool-label'
    this.el.appendChild(label)
  }

  private makeIconButton(label: string, shortLabel: string, icon: string): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'tc-tool-button'
    btn.setAttribute('aria-label', label)
    btn.title = label
    btn.dataset.touchLabel = label
    btn.innerHTML = `<span class="tc-tool-button__icon">${icon}</span><span class="tc-tool-button__text">${shortLabel}</span>`
    return btn
  }

  private updateSelection(): void {
    const active = this.session.currentTool
    for (const [tool, btn] of this.buttons) {
      btn.dataset.active = String(tool === active)
    }

    const labelEl = this.el.querySelector('#toolbar-tool-label') as HTMLElement | null
    if (labelEl) {
      const entry = TOOLS.find(t => t.tool === active)
      labelEl.textContent = entry?.label ?? ''
    }

    this.updateHintAvailability()
  }

  private updateHintAvailability(): void {
    if (!this.hintButton) return
    const hasHintCells = this.session.grid.unpaintedForColour(this.session.selectedPaletteIndex) > 0
    this.hintButton.disabled = !hasHintCells
  }
}
