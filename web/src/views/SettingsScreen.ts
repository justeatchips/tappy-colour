import type { Router } from '../router'
import type { ArtworkStore } from '../model/ArtworkStore'
import { View, configureScrollableRoot } from './BaseView'
import { UserSettings } from '../model/UserSettings'
import { showConfirmDialog } from './ConfirmDialog'
import { focusTextInputWhenHelpful } from '../util/focus'

type GateResult = 'pass' | 'cancel'

function showMathGate(mode: 'setup' | 'verify'): Promise<GateResult> {
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(20,30,50,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      padding: 20px;
      box-sizing: border-box;
    `

    const card = document.createElement('div')
    card.className = 'px-panel'
    card.style.cssText = `
      max-width: 360px;
      width: 100%;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    `

    const challenge = mode === 'verify' ? UserSettings.makeChallenge() : null

    const title = document.createElement('h2')
    title.className = 'px-title px-title--md'
    title.style.cssText = 'text-align: center; margin: 0;'
    title.textContent = mode === 'setup' ? 'CREATE PARENT CODE' : 'PARENT CHECK'
    card.appendChild(title)

    const sub = document.createElement('p')
    sub.style.cssText = `
      margin: 0;
      font-family: var(--tc-font-body);
      font-size: 13px;
      color: var(--tc-ink-soft);
      text-align: center;
      line-height: 1.5;
    `
    if (mode === 'setup') {
      sub.textContent = 'Choose a number 10–30. Solve maths to access settings later.'
    } else {
      sub.textContent = `What is ${challenge!.question} = ?`
    }
    card.appendChild(sub)

    const input = document.createElement('input')
    input.type = 'number'
    input.inputMode = 'numeric'
    input.autocomplete = 'off'
    input.enterKeyHint = 'done'
    input.setAttribute('autocorrect', 'off')
    if (mode === 'setup') {
      input.min = '10'
      input.max = '30'
      input.placeholder = 'e.g. 17'
    } else {
      input.placeholder = '?'
    }
    input.style.cssText = `
      font-family: var(--tc-font-display);
      font-size: 28px;
      text-align: center;
      padding: 12px;
      border: 4px solid var(--tc-ink-black);
      border-radius: 6px;
      width: 100%;
      box-sizing: border-box;
      color: var(--tc-ink);
      outline: none;
    `

    const error = document.createElement('p')
    error.style.cssText = `
      margin: 0;
      font-size: 13px;
      color: var(--tc-danger);
      text-align: center;
      min-height: 18px;
      font-weight: 700;
    `
    card.appendChild(input)
    card.appendChild(error)

    const btnRow = document.createElement('div')
    btnRow.style.cssText = 'display: flex; gap: 10px;'

    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'px-button px-button--ghost'
    cancelBtn.textContent = 'CANCEL'
    cancelBtn.addEventListener('click', () => dismiss('cancel'))

    const confirmBtn = document.createElement('button')
    confirmBtn.className = 'px-button px-button--primary'
    confirmBtn.textContent = mode === 'setup' ? 'SAVE' : 'CHECK'
    confirmBtn.addEventListener('click', () => handleConfirm())

    btnRow.appendChild(cancelBtn)
    btnRow.appendChild(confirmBtn)
    card.appendChild(btnRow)

    const dismiss = (result: GateResult) => {
      input.blur()
      overlay.remove()
      resolve(result)
    }

    const handleConfirm = () => {
      const val = parseInt(input.value, 10)
      if (isNaN(val)) {
        error.textContent = 'Please enter a number.'
        shakeCard()
        return
      }
      if (mode === 'setup') {
        if (val < 10 || val > 30) {
          error.textContent = 'Pick 10–30.'
          shakeCard()
          return
        }
        UserSettings.update({ pin: val })
        dismiss('pass')
      } else {
        if (val !== challenge!.answer) {
          error.textContent = 'Not quite — try again.'
          input.value = ''
          shakeCard()
          return
        }
        dismiss('pass')
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConfirm()
    })

    const shakeCard = () => {
      card.style.animation = 'none'
      void card.offsetWidth
      card.style.transition = 'transform 50ms'
      const steps = ['-8px', '8px', '-6px', '6px', '0']
      let i = 0
      const step = () => {
        if (i >= steps.length) return
        card.style.transform = `translateX(${steps[i++]})`
        setTimeout(step, 50)
      }
      step()
    }

    overlay.appendChild(card)
    document.body.appendChild(overlay)
    requestAnimationFrame(() => focusTextInputWhenHelpful(input))
  })
}

export class SettingsScreen extends View {
  private root: HTMLElement | null = null

  constructor(private router: Router, private store: ArtworkStore) {
    super()
  }

  mount(root: HTMLElement): void {
    this.root = root
    configureScrollableRoot(root)
    this.checkPin().then(passed => {
      if (!passed) {
        this.router.navigate('#/')
        return
      }
      this.render()
    })
  }

  unmount(): void {
    if (this.root) {
      this.root.innerHTML = ''
      this.root = null
    }
  }

  private async checkPin(): Promise<boolean> {
    if (!UserSettings.hasPin) {
      const result = await showMathGate('setup')
      return result === 'pass'
    }
    const result = await showMathGate('verify')
    return result === 'pass'
  }

  private render(): void {
    if (!this.root) return
    this.root.innerHTML = ''

    const page = document.createElement('div')
    page.style.cssText = `
      padding: 28px;
      max-width: 800px;
      margin: 0 auto;
    `

    // Header
    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 26px;
    `

    const backBtn = document.createElement('button')
    backBtn.className = 'px-button px-button--ghost'
    backBtn.textContent = '← BACK'
    backBtn.addEventListener('click', () => this.router.navigate('#/'))
    header.appendChild(backBtn)

    const title = document.createElement('h1')
    title.className = 'px-title px-title--md'
    title.style.cssText = 'flex: 1; text-align: center; margin: 0;'
    title.textContent = '⚙ SETTINGS'
    header.appendChild(title)

    const spacer = document.createElement('div')
    spacer.style.cssText = 'width: 110px;'
    header.appendChild(spacer)

    page.appendChild(header)

    // Settings grid
    const settingsGrid = document.createElement('div')
    settingsGrid.className = 'settings-grid'

    const s = UserSettings.get()

    // Sound
    settingsGrid.appendChild(
      this.makeSettingRow(
        '🔊 Sound Effects',
        'Tap sounds and completion chime',
        s.soundEnabled,
        v => UserSettings.update({ soundEnabled: v })
      )
    )

    // Search
    settingsGrid.appendChild(
      this.makeSettingRow(
        '🔍 Internet Search',
        'Lets your child search safe images',
        s.searchEnabled,
        v => UserSettings.update({ searchEnabled: v })
      )
    )

    // Auto-fill
    settingsGrid.appendChild(
      this.makeSettingRow(
        '✨ Auto-Fill',
        'Quick-fill adjacent cells same colour',
        s.autoFillEnabled,
        v => UserSettings.update({ autoFillEnabled: v })
      )
    )

    // Default difficulty
    const diffPanel = document.createElement('div')
    diffPanel.className = 'px-panel'
    diffPanel.style.cssText = `
      padding: 14px;
      grid-column: 1 / -1;
    `

    const diffTitle = document.createElement('div')
    diffTitle.className = 'setting-row__title'
    diffTitle.textContent = '🐣 Default Difficulty'
    diffPanel.appendChild(diffTitle)

    const diffSub = document.createElement('div')
    diffSub.className = 'setting-row__sub'
    diffSub.textContent = 'Starting level for new puzzles'
    diffPanel.appendChild(diffSub)

    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = '0'
    slider.max = '1'
    slider.step = '0.01'
    slider.value = String(s.defaultSliderValue)
    slider.style.cssText = `
      width: 100%;
      margin: 14px 0;
      accent-color: var(--tc-primary);
      cursor: pointer;
    `
    slider.addEventListener('input', () => {
      UserSettings.update({ defaultSliderValue: parseFloat(slider.value) })
    })
    diffPanel.appendChild(slider)

    const diffLabels = document.createElement('div')
    diffLabels.style.cssText = `
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--tc-ink-soft);
      font-weight: 700;
    `
    diffLabels.textContent = 'EASY                                 HARD'
    diffPanel.appendChild(diffLabels)

    settingsGrid.appendChild(diffPanel)

    // Change parent code
    const changePinBtn = document.createElement('button')
    changePinBtn.className = 'px-button px-button--primary'
    changePinBtn.style.cssText = `
      grid-column: 1 / -1;
      width: 100%;
    `
    changePinBtn.textContent = '🔐 CHANGE PARENT CODE'
    changePinBtn.addEventListener('click', async () => {
      const result = await showMathGate('setup')
      if (result === 'pass') this.showToast('Parent code updated.')
    })
    settingsGrid.appendChild(changePinBtn)

    // Reset all
    const resetBtn = document.createElement('button')
    resetBtn.className = 'px-button'
    resetBtn.style.cssText = `
      grid-column: 1 / -1;
      width: 100%;
      background: var(--tc-danger);
      color: white;
      border-color: var(--tc-ink-black);
    `
    resetBtn.textContent = '🗑 DELETE ALL PICTURES'
    resetBtn.addEventListener('click', () => this.handleClearAll())
    settingsGrid.appendChild(resetBtn)

    page.appendChild(settingsGrid)
    this.root.appendChild(page)
  }

  private makeSettingRow(label: string, sub: string, value: boolean, onChange: (v: boolean) => void): HTMLElement {
    const row = document.createElement('div')
    row.className = 'px-panel setting-row'
    row.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px;
    `

    const text = document.createElement('div')
    const l = document.createElement('div')
    l.className = 'setting-row__title'
    l.textContent = label
    const s = document.createElement('div')
    s.className = 'setting-row__sub'
    s.textContent = sub
    text.appendChild(l)
    text.appendChild(s)

    const toggle = document.createElement('label')
    toggle.className = 'px-toggle'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = value
    input.addEventListener('change', () => onChange(input.checked))
    const span = document.createElement('span')
    toggle.appendChild(input)
    toggle.appendChild(span)

    row.appendChild(text)
    row.appendChild(toggle)
    return row
  }

  private async handleClearAll(): Promise<void> {
    const confirmed = await showConfirmDialog('Delete ALL pictures? Cannot undo.')
    if (!confirmed) return
    const confirmed2 = await showConfirmDialog('Are you absolutely sure? All progress lost.')
    if (!confirmed2) return
    await this.store.clearAll()
    this.showToast('All pictures deleted.')
  }

  private showToast(message: string): void {
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--tc-ink-black);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 999;
      max-width: 90vw;
      text-align: center;
      font-family: var(--tc-font-body);
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }
}
