import type { PaintingSession } from '../model/PaintingSession'
import type { PaintTool } from '../model/PaintTool'

const TOOLS: Array<{ tool: PaintTool; label: string; icon: string }> = [
  {
    tool: 'tap',
    label: 'Tap',
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 2C11 2 8 5.5 8 9a3 3 0 006 0c0-3.5-3-7-3-7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M8 14v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M11 15v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M14 14v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  },
  {
    tool: 'bucket',
    label: 'Fill Region',
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16l8-8 4 4-5 6H4v-2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M10 6l2-2 4 4-2 2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="18" cy="17" r="2" stroke="currentColor" stroke-width="1.8"/>
    </svg>`,
  },
  {
    tool: 'fillAll',
    label: 'Fill All',
    icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="12" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="3" y="12" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="12" y="12" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
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
    this.el.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      flex-shrink: 0;
    `
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
    for (const { tool, label, icon } of TOOLS) {
      const btn = document.createElement('button')
      btn.setAttribute('aria-label', label)
      btn.innerHTML = icon
      btn.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        border: 2px solid transparent;
        border-radius: 10px;
        background: #f3f4f6;
        color: #374151;
        cursor: pointer;
        padding: 0;
        transition: transform 0.15s, background 0.15s, border-color 0.15s;
      `

      const activate = () => {
        this.session.setTool(tool)
        btn.style.transform = 'scale(1.15)'
        setTimeout(() => { btn.style.transform = 'scale(1)' }, 150)
      }

      btn.addEventListener('click', activate)
      btn.addEventListener('touchend', (e) => { e.preventDefault(); activate() })

      this.buttons.set(tool, btn)
      this.el.appendChild(btn)
    }

    const hintBtn = this.makeIconButton('Hint', HINT_ICON)
    hintBtn.title = 'Hint'
    const requestHint = () => {
      this.session.requestHint()
      hintBtn.style.transform = 'scale(1.15)'
      setTimeout(() => { hintBtn.style.transform = 'scale(1)' }, 150)
    }
    hintBtn.addEventListener('click', requestHint)
    hintBtn.addEventListener('touchend', (e) => { e.preventDefault(); requestHint() })
    this.hintButton = hintBtn
    this.el.appendChild(hintBtn)

    // Spacer so label sits right-aligned
    const spacer = document.createElement('div')
    spacer.style.flex = '1'
    this.el.appendChild(spacer)

    // Tool name label
    const label = document.createElement('span')
    label.id = 'toolbar-tool-label'
    label.style.cssText = `font-size: 12px; color: #6b7280; font-weight: 600;`
    this.el.appendChild(label)
  }

  private makeIconButton(label: string, icon: string): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.setAttribute('aria-label', label)
    btn.innerHTML = icon
    btn.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      border: 2px solid transparent;
      border-radius: 10px;
      background: #f3f4f6;
      color: #374151;
      cursor: pointer;
      padding: 0;
      transition: transform 0.15s, background 0.15s, border-color 0.15s, opacity 0.15s;
    `
    return btn
  }

  private updateSelection(): void {
    const active = this.session.currentTool
    for (const [tool, btn] of this.buttons) {
      if (tool === active) {
        btn.style.background = '#dbeafe'
        btn.style.borderColor = '#2563eb'
        btn.style.color = '#1d4ed8'
      } else {
        btn.style.background = '#f3f4f6'
        btn.style.borderColor = 'transparent'
        btn.style.color = '#374151'
      }
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
    this.hintButton.style.opacity = hasHintCells ? '1' : '0.45'
    this.hintButton.style.cursor = hasHintCells ? 'pointer' : 'not-allowed'
  }
}
