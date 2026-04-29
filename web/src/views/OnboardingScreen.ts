import type { Router } from '../router'
import { configureScrollableRoot, type View } from './BaseView'
import { loadMascots, mascotImageUrl, type Mascot } from '../model/Mascots'
import { UserSettings } from '../model/UserSettings'

export class OnboardingScreen implements View {
  private root: HTMLElement | null = null
  private selectedMascotId: string | null = null

  constructor(private router: Router) {}

  async mount(root: HTMLElement): Promise<void> {
    this.root = root
    configureScrollableRoot(root)

    try {
      const allMascots = await loadMascots()
      this.render(allMascots)
    } catch (err) {
      console.error('Failed to load mascots:', err)
      this.renderError()
    }
  }

  unmount(): void {
    if (this.root) {
      this.root.innerHTML = ''
      this.root = null
    }
  }

  private render(mascots: Mascot[]): void {
    if (!this.root) return
    this.root.innerHTML = ''

    const screen = document.createElement('div')
    screen.className = 'onboarding-screen'

    const content = document.createElement('div')
    content.className = 'onboarding-content'

    const stepLabel = document.createElement('div')
    stepLabel.className = 'px-step-label'
    stepLabel.textContent = '★ STEP 1 OF 1 ★'
    content.appendChild(stepLabel)

    const title = document.createElement('h1')
    title.className = 'px-title px-title--lg'
    title.textContent = 'PICK YOUR BUDDY'
    content.appendChild(title)

    const subtitle = document.createElement('p')
    subtitle.className = 'onboarding-subtitle'
    subtitle.textContent = 'they cheer you on while you colour'
    content.appendChild(subtitle)

    const grid = document.createElement('div')
    grid.className = 'mascot-grid'

    for (const mascot of mascots) {
      const card = document.createElement('button')
      card.className = 'mascot-card'
      card.setAttribute('data-id', mascot.id)

      const img = document.createElement('img')
      img.src = mascotImageUrl(mascot.id)
      img.alt = mascot.name
      img.className = 'mascot-art mascot-art--card'

      const name = document.createElement('div')
      name.className = 'mascot-card__name'
      name.textContent = mascot.name.toUpperCase()

      const tag = document.createElement('div')
      tag.className = 'mascot-card__tag'
      tag.textContent = mascot.tag

      card.appendChild(img)
      card.appendChild(name)
      card.appendChild(tag)

      card.addEventListener('click', () => {
        // Deselect all
        grid.querySelectorAll('[data-selected]').forEach(el => el.removeAttribute('data-selected'))
        grid.querySelectorAll('img.mascot-bob').forEach(el => el.classList.remove('mascot-bob'))
        // Select this one
        card.setAttribute('data-selected', '')
        const cardImg = card.querySelector('img') as HTMLImageElement
        if (cardImg) cardImg.classList.add('mascot-bob')
        this.selectedMascotId = mascot.id
        // Enable button
        const ctaBtn = this.root?.querySelector('#onboard-cta') as HTMLButtonElement
        if (ctaBtn) ctaBtn.disabled = false
      })

      grid.appendChild(card)
    }
    content.appendChild(grid)

    const ctaBtn = document.createElement('button')
    ctaBtn.id = 'onboard-cta'
    ctaBtn.className = 'px-button px-button--primary px-button--lg'
    ctaBtn.textContent = '▶ THAT\'S THE ONE!'
    ctaBtn.disabled = true
    ctaBtn.addEventListener('click', () => this.confirm())
    content.appendChild(ctaBtn)

    const hint = document.createElement('p')
    hint.className = 'onboarding-hint'
    hint.textContent = 'tap a buddy then press the button'
    content.appendChild(hint)

    screen.appendChild(content)
    this.root.appendChild(screen)
  }

  private confirm(): void {
    if (!this.selectedMascotId) return
    UserSettings.update({ mascotId: this.selectedMascotId })
    this.router.navigate('#/')
  }

  private renderError(): void {
    if (!this.root) return
    this.root.innerHTML = ''

    const screen = document.createElement('div')
    screen.className = 'onboarding-screen'

    const content = document.createElement('div')
    content.className = 'onboarding-content'

    const title = document.createElement('h1')
    title.className = 'px-title px-title--lg'
    title.textContent = 'OOH NO!'
    content.appendChild(title)

    const message = document.createElement('p')
    message.style.cssText = `
      font-family: var(--tc-font-body);
      font-size: 14px;
      color: var(--tc-ink-soft);
      margin: 16px 0;
      line-height: 1.5;
    `
    message.textContent = 'Failed to load the buddies. Please check your internet and try again.'
    content.appendChild(message)

    const retryBtn = document.createElement('button')
    retryBtn.className = 'px-button px-button--primary px-button--lg'
    retryBtn.textContent = '↻ RETRY'
    retryBtn.addEventListener('click', () => {
      this.root!.innerHTML = ''
      this.mount(this.root!)
    })
    content.appendChild(retryBtn)

    screen.appendChild(content)
    this.root.appendChild(screen)
  }
}
