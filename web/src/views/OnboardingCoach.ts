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
    this.overlay.className = 'onboarding-coach'
    root.appendChild(this.overlay)

    this.showStep(0, opts)

    const unsubPalette = opts.session.on('change', (eventType) => {
      if (eventType === 'selectionChanged' && this.step === 0) {
        this.showStep(1, opts)
      } else if (eventType === 'gridChanged' && this.step === 1) {
        this.finish()
      }
    })
    this.unsubs.push(unsubPalette)
  }

  private showStep(step: number, opts: CoachOptions): void {
    this.step = step
    if (this.autoTimer !== null) { clearTimeout(this.autoTimer); this.autoTimer = null }
    if (!this.overlay) return

    this.overlay.innerHTML = ''

    const targetEl = step === 0
      ? opts.paletteEl.querySelector('[data-palette-entry]') as HTMLElement | null
      : opts.gridEl
    if (!targetEl) { this.finish(); return }

    const rect = targetEl.getBoundingClientRect()
    const text = step === 0 ? 'Pick a colour!' : 'Now tap a square!'

    const bubble = document.createElement('div')
    bubble.className = 'onboarding-coach__bubble'
    bubble.textContent = text

    const bubbleTop = Math.max(8, rect.top - 60)
    const bubbleLeft = Math.max(8, Math.min(window.innerWidth - 240, rect.left + rect.width / 2 - 100))
    bubble.style.top = `${bubbleTop}px`
    bubble.style.left = `${bubbleLeft}px`

    bubble.addEventListener('click', () => {
      if (step === 0) this.showStep(1, opts)
      else this.finish()
    })

    const arrow = document.createElement('div')
    arrow.className = 'onboarding-coach__arrow'
    arrow.style.top = `${bubbleTop + 46}px`
    arrow.style.left = `${bubbleLeft + 90}px`

    this.overlay.appendChild(bubble)
    this.overlay.appendChild(arrow)

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
