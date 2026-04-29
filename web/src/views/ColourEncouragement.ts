import { colourDoneMessage, mascotImageUrl, resolveMascotId } from '../model/Mascots'
import { UserSettings } from '../model/UserSettings'
import { playColourDone } from '../util/sound'

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export class ColourEncouragement {
  private el: HTMLElement | null = null
  private timer: ReturnType<typeof setTimeout> | null = null

  show(root: HTMLElement, paletteNumber: number): void {
    this.unmount()

    const settings = UserSettings.get()
    const mascotId = resolveMascotId(settings.mascotId)
    const reducedMotion = prefersReducedMotion()

    const el = document.createElement('div')
    el.dataset.colourEncouragement = 'true'
    el.style.cssText = `
      position: fixed;
      left: 50%;
      bottom: 104px;
      z-index: 95;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px 10px 10px;
      min-height: 64px;
      max-width: min(420px, calc(100vw - 32px));
      background: #fff;
      border: 4px solid var(--tc-ink-black);
      border-radius: 8px;
      box-shadow: 0 6px 0 0 var(--tc-ink-black);
      font-family: var(--tc-font-display);
      color: var(--tc-ink);
      pointer-events: none;
      opacity: ${reducedMotion ? '1' : '0'};
      transform: translate(-50%, ${reducedMotion ? '0' : '10px'}) scale(${reducedMotion ? '1' : '0.96'});
      transition: ${reducedMotion ? 'none' : 'opacity 140ms ease-out, transform 140ms ease-out'};
    `

    const img = document.createElement('img')
    img.src = mascotImageUrl(mascotId)
    img.alt = ''
    img.style.cssText = `
      width: 48px;
      height: 48px;
      flex: 0 0 auto;
      object-fit: contain;
    `
    if (!reducedMotion) img.className = 'mascot-bob'
    el.appendChild(img)

    const text = document.createElement('div')
    text.textContent = colourDoneMessage(mascotId, paletteNumber)
    text.style.cssText = `
      font-size: 14px;
      line-height: 1.2;
      overflow-wrap: anywhere;
    `
    el.appendChild(text)

    root.appendChild(el)
    this.el = el
    playColourDone()

    if (!reducedMotion) {
      requestAnimationFrame(() => {
        if (!this.el) return
        this.el.style.opacity = '1'
        this.el.style.transform = 'translate(-50%, 0) scale(1)'
      })
    }

    this.timer = setTimeout(() => this.unmount(), 1600)
  }

  unmount(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.el?.remove()
    this.el = null
  }
}
