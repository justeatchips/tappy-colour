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
    el.className = 'colour-encouragement'
    el.dataset.colourEncouragement = 'true'
    el.dataset.visible = reducedMotion ? 'true' : 'false'
    if (reducedMotion) el.style.transition = 'none'

    const img = document.createElement('img')
    img.className = reducedMotion
      ? 'colour-encouragement__image'
      : 'colour-encouragement__image mascot-bob'
    img.src = mascotImageUrl(mascotId)
    img.alt = ''
    el.appendChild(img)

    const text = document.createElement('div')
    text.className = 'colour-encouragement__text'
    text.textContent = colourDoneMessage(mascotId, paletteNumber)
    el.appendChild(text)

    root.appendChild(el)
    this.el = el
    playColourDone()

    if (!reducedMotion) {
      requestAnimationFrame(() => {
        if (this.el) this.el.dataset.visible = 'true'
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
