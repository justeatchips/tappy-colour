import type { PaintingSession } from '../model/PaintingSession'

const STORAGE_KEY = 'tappy-onboarded-v1'

function shouldShow(): boolean {
  try { return !localStorage.getItem(STORAGE_KEY) } catch { return false }
}

function markComplete(): void {
  try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
}

interface CoachOptions {
  paletteEl: HTMLElement
  gridEl: HTMLElement
  session: PaintingSession
}

export class OnboardingCoach {
  private overlay: HTMLElement | null = null
  private unsubs: Array<() => void> = []
  private step = 0
  private autoTimer: ReturnType<typeof setTimeout> | null = null

  static shouldShow = shouldShow

  mount(root: HTMLElement, opts: CoachOptions): void {
    this.overlay = document.createElement('div')
    this.overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 500;
      pointer-events: none;
    `
    root.appendChild(this.overlay)

    this.showStep(0, opts)

    // Advance on first palette selection
    const unsubPalette = opts.session.on('change', (eventType) => {
      if (eventType === 'selectionChanged' && this.step === 0) {
        this.showStep(1, opts)
      } else if (eventType === 'gridChanged' && this.step === 1) {
        this.finish()
      }
    })
    this.unsubs.push(unsubPalette)

    // URL override: ?onboarding=1 forces show (dev helper)
  }

  private showStep(step: number, opts: CoachOptions): void {
    this.step = step
    if (this.autoTimer !== null) { clearTimeout(this.autoTimer); this.autoTimer = null }
    if (!this.overlay) return

    this.overlay.innerHTML = ''

    const targetEl = step === 0 ? opts.paletteEl.querySelector('button') as HTMLElement | null : opts.gridEl
    if (!targetEl) { this.finish(); return }

    const rect = targetEl.getBoundingClientRect()
    const text = step === 0 ? 'Pick a colour! 🎨' : 'Now tap a square! ✏️'

    const bubble = document.createElement('div')
    bubble.style.cssText = `
      position: fixed;
      background: #1f2937;
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      white-space: nowrap;
      pointer-events: auto;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      cursor: pointer;
    `
    bubble.textContent = text

    // Position bubble above the target
    const bubbleTop = Math.max(8, rect.top - 60)
    const bubbleLeft = Math.max(8, Math.min(window.innerWidth - 240, rect.left + rect.width / 2 - 100))
    bubble.style.top = `${bubbleTop}px`
    bubble.style.left = `${bubbleLeft}px`

    bubble.addEventListener('click', () => {
      if (step === 0) this.showStep(1, opts)
      else this.finish()
    })

    // Arrow pointing down toward target
    const arrow = document.createElement('div')
    arrow.style.cssText = `
      position: fixed;
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 12px solid #1f2937;
      pointer-events: none;
    `
    arrow.style.top = `${bubbleTop + 46}px`
    arrow.style.left = `${bubbleLeft + 90}px`

    this.overlay.appendChild(bubble)
    this.overlay.appendChild(arrow)

    // Auto-advance after 6 seconds
    this.autoTimer = setTimeout(() => {
      if (step === 0) this.showStep(1, opts)
      else this.finish()
    }, 6000)
  }

  private finish(): void {
    markComplete()
    this.unmount()
  }

  unmount(): void {
    if (this.autoTimer !== null) { clearTimeout(this.autoTimer); this.autoTimer = null }
    this.unsubs.forEach(u => u())
    this.unsubs = []
    this.overlay?.remove()
    this.overlay = null
  }
}
