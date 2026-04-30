import type { PaintingSession } from '../model/PaintingSession'
import type { Router } from '../router'
import { Confetti } from './Confetti'
import { playCompletion } from '../util/sound'
import { createPanel, createPxButton } from '../ui/pixel'

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
    this.el.className = 'tc-completion-overlay'
    this.el.setAttribute('data-completion-overlay', 'true')
    this.el.setAttribute('data-visible', 'false')
  }

  mount(root: HTMLElement): void {
    root.appendChild(this.el)
    this.unsubSession = this.session.on('change', (eventType) => {
      if (eventType === 'completionChanged' && !this.session.isComplete) {
        this.unmount()
      }
    })

    const card = createPanel('tc-completion-card')

    const title = document.createElement('h1')
    title.className = 'px-title px-title--lg tc-completion-title'
    title.textContent = 'ALL DONE!'
    card.appendChild(title)

    this.confetti = new Confetti()
    card.appendChild(this.confetti.element)

    const message = document.createElement('p')
    message.className = 'tc-completion-message'
    message.textContent = 'You completed the puzzle!'
    card.appendChild(message)

    const actionRow = document.createElement('div')
    actionRow.className = 'tc-completion-actions'

    const keepLookingBtn = createPxButton({
      label: 'Keep Looking',
      variant: 'ghost',
      onClick: () => this.unmount(),
    })
    actionRow.appendChild(keepLookingBtn)

    const backBtn = createPxButton({
      label: 'HOME',
      variant: 'primary',
      onClick: () => this.router.navigate('#/'),
    })
    actionRow.appendChild(backBtn)
    card.appendChild(actionRow)

    this.el.appendChild(card)

    this.showTimer = setTimeout(() => {
      this.showTimer = null
      this.el.setAttribute('data-visible', 'true')
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
