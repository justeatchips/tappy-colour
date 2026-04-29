import type { PaintingSession } from '../model/PaintingSession'
import type { Router } from '../router'
import { Confetti } from './Confetti'
import { playCompletion } from '../util/sound'

export class CompletionOverlay {
  private el: HTMLElement
  private confetti: Confetti | null = null
  private unsubSession: (() => void) | null = null
  private showTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    private session: PaintingSession,
    private router: Router,
    private onDismiss?: () => void
  ) {
    this.el = document.createElement('div')
    this.el.setAttribute('data-completion-overlay', 'true')
    this.el.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease-out;
    `
  }

  mount(root: HTMLElement): void {
    root.appendChild(this.el)
    this.unsubSession = this.session.on('change', (eventType) => {
      if (eventType === 'completionChanged' && !this.session.isComplete) {
        this.unmount()
      }
    })

    // Create card
    const card = document.createElement('div')
    card.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      max-width: 400px;
    `

    // Title
    const title = document.createElement('h1')
    title.textContent = 'You did it! 🎉'
    title.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 20px 0;
    `
    card.appendChild(title)

    // Confetti canvas
    this.confetti = new Confetti()
    card.appendChild(this.confetti.element)

    // Message
    const message = document.createElement('p')
    message.textContent = 'You completed the puzzle!'
    message.style.cssText = `
      font-size: 16px;
      color: #6b7280;
      margin: 20px 0;
    `
    card.appendChild(message)

    const actionRow = document.createElement('div')
    actionRow.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 20px;
    `

    const keepLookingBtn = document.createElement('button')
    keepLookingBtn.textContent = 'Keep Looking'
    keepLookingBtn.style.cssText = `
      padding: 14px 20px;
      min-height: 44px;
      background: #f3f4f6;
      color: #1f2937;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    `
    keepLookingBtn.addEventListener('mouseover', () => {
      keepLookingBtn.style.background = '#e5e7eb'
    })
    keepLookingBtn.addEventListener('mouseout', () => {
      keepLookingBtn.style.background = '#f3f4f6'
    })
    keepLookingBtn.addEventListener('click', () => {
      this.unmount()
    })
    actionRow.appendChild(keepLookingBtn)

    // Back button
    const backBtn = document.createElement('button')
    backBtn.textContent = 'Back to Home'
    backBtn.className = 'btn-primary'
    backBtn.style.cssText = `
      padding: 14px 24px;
      min-height: 44px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    `
    backBtn.addEventListener('mouseover', () => {
      backBtn.style.background = '#1d4ed8'
    })
    backBtn.addEventListener('mouseout', () => {
      backBtn.style.background = '#2563eb'
    })
    backBtn.addEventListener('click', () => {
      this.router.navigate('#/')
    })
    actionRow.appendChild(backBtn)
    card.appendChild(actionRow)

    this.el.appendChild(card)

    // Show overlay after 900ms (numbers fade takes 600ms; give it room to finish)
    this.showTimer = setTimeout(() => {
      this.showTimer = null
      this.el.style.opacity = '1'
      this.confetti?.start()
      playCompletion()
    }, 900)
  }

  unmount(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer)
      this.showTimer = null
    }

    if (this.confetti) {
      this.confetti.stop()
      this.confetti = null
    }

    if (this.unsubSession) {
      this.unsubSession()
      this.unsubSession = null
    }

    this.el.remove()
    this.onDismiss?.()
  }
}
