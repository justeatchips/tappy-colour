import type { Router } from '../router'
import type { ArtworkStore } from '../model/ArtworkStore'
import type { Artwork } from '../model/Artwork'
import { View, configureScrollableRoot } from './BaseView'
import { UserSettings } from '../model/UserSettings'
import { showConfirmDialog } from './ConfirmDialog'
import { focusTextInputWhenHelpful } from '../util/focus'
import { createPanel, createPxButton, createToast } from '../ui/pixel'

type GateResult = 'pass' | 'cancel'

function showMathGate(mode: 'setup' | 'verify'): Promise<GateResult> {
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.className = 'tc-modal-scrim'

    const card = createPanel('tc-modal-card')

    const challenge = mode === 'verify' ? UserSettings.makeChallenge() : null

    const title = document.createElement('h2')
    title.className = 'px-title px-title--md tc-text-center'
    title.textContent = mode === 'setup' ? 'CREATE PARENT CODE' : 'PARENT CHECK'
    card.appendChild(title)

    const sub = document.createElement('p')
    sub.className = 'tc-form-help'
    if (mode === 'setup') {
      sub.textContent = 'Choose a number 10-30. Solve maths to access settings later.'
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
    input.className = 'tc-number-input'

    const error = document.createElement('p')
    error.className = 'tc-form-error'
    card.appendChild(input)
    card.appendChild(error)

    const btnRow = document.createElement('div')
    btnRow.className = 'tc-modal-actions'

    const cancelBtn = createPxButton({
      label: 'CANCEL',
      variant: 'ghost',
      onClick: () => dismiss('cancel'),
    })

    const confirmBtn = createPxButton({
      label: mode === 'setup' ? 'SAVE' : 'CHECK',
      variant: 'primary',
      onClick: () => handleConfirm(),
    })

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
          error.textContent = 'Pick 10-30.'
          shakeCard()
          return
        }
        UserSettings.update({ pin: val })
        dismiss('pass')
      } else {
        if (val !== challenge!.answer) {
          error.textContent = 'Not quite - try again.'
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
  private manageOpen = false
  private manageLoading = false
  private artworks: Artwork[] = []
  private selectedArtworkIds = new Set<string>()

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
    page.className = 'tc-page settings-page'

    // Header
    const header = document.createElement('div')
    header.className = 'settings-header'

    const backBtn = createPxButton({
      label: 'BACK',
      variant: 'ghost',
      onClick: () => this.router.navigate('#/'),
    })
    header.appendChild(backBtn)

    const title = document.createElement('h1')
    title.className = 'px-title px-title--md settings-title'
    title.textContent = 'SETTINGS'
    header.appendChild(title)

    const spacer = document.createElement('div')
    spacer.className = 'settings-header__spacer'
    header.appendChild(spacer)

    page.appendChild(header)

    // Settings grid
    const settingsGrid = document.createElement('div')
    settingsGrid.className = 'settings-grid'

    const s = UserSettings.get()

    // Sound
    settingsGrid.appendChild(
      this.makeSettingRow(
        'Sound Effects',
        'Tap sounds and completion chime',
        s.soundEnabled,
        v => UserSettings.update({ soundEnabled: v })
      )
    )

    // Search
    settingsGrid.appendChild(
      this.makeSettingRow(
        'Internet Search',
        'Lets your child search safe images',
        s.searchEnabled,
        v => UserSettings.update({ searchEnabled: v })
      )
    )

    // Auto-fill
    settingsGrid.appendChild(
      this.makeSettingRow(
        'Auto-Fill',
        'Quick-fill adjacent cells same colour',
        s.autoFillEnabled,
        v => UserSettings.update({ autoFillEnabled: v })
      )
    )

    // Default difficulty
    const diffPanel = document.createElement('div')
    diffPanel.className = 'px-panel settings-wide-panel'

    const diffTitle = document.createElement('div')
    diffTitle.className = 'setting-row__title'
    diffTitle.textContent = 'Default Difficulty'
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
    slider.className = 'settings-range'
    slider.addEventListener('input', () => {
      UserSettings.update({ defaultSliderValue: parseFloat(slider.value) })
    })
    diffPanel.appendChild(slider)

    const diffLabels = document.createElement('div')
    diffLabels.className = 'settings-difficulty-labels'
    diffLabels.innerHTML = '<span>EASY</span><span>HARD</span>'
    diffPanel.appendChild(diffLabels)

    settingsGrid.appendChild(diffPanel)

    // Change parent code
    const changePinBtn = createPxButton({
      label: 'CHANGE PARENT CODE',
      variant: 'primary',
      className: 'settings-wide-button',
      onClick: async () => {
        const result = await showMathGate('setup')
        if (result === 'pass') this.showToast('Parent code updated.')
      },
    })
    settingsGrid.appendChild(changePinBtn)

    const manageBtn = createPxButton({
      label: this.manageOpen ? 'HIDE PICTURE MANAGER' : 'SELECT PICTURES',
      variant: 'ghost',
      className: 'settings-wide-button',
      onClick: () => {
        if (this.manageOpen) {
          this.manageOpen = false
          this.selectedArtworkIds.clear()
          this.render()
          return
        }
        void this.openPictureManager()
      },
    })
    settingsGrid.appendChild(manageBtn)

    if (this.manageOpen) {
      settingsGrid.appendChild(this.makePictureManager())
    }

    // Reset all
    const resetBtn = createPxButton({
      label: 'DELETE ALL PICTURES',
      variant: 'danger',
      className: 'settings-wide-button',
      onClick: () => this.handleClearAll(),
    })
    settingsGrid.appendChild(resetBtn)

    page.appendChild(settingsGrid)
    this.root.appendChild(page)
  }

  private makeSettingRow(label: string, sub: string, value: boolean, onChange: (v: boolean) => void): HTMLElement {
    const row = document.createElement('div')
    row.className = 'px-panel setting-row'

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

  private async openPictureManager(): Promise<void> {
    this.manageOpen = true
    this.manageLoading = true
    this.selectedArtworkIds.clear()
    this.render()

    try {
      this.artworks = await this.store.fetchAll()
    } catch {
      this.showToast('Could not load pictures.')
      this.artworks = []
    } finally {
      this.manageLoading = false
      this.render()
    }
  }

  private makePictureManager(): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'px-panel settings-picture-manager'
    panel.setAttribute('data-picture-manager', 'true')

    const title = document.createElement('div')
    title.className = 'setting-row__title'
    title.textContent = 'Picture Manager'
    panel.appendChild(title)

    if (this.manageLoading) {
      const loading = document.createElement('div')
      loading.className = 'setting-row__sub'
      loading.textContent = 'Loading pictures...'
      panel.appendChild(loading)
      return panel
    }

    if (this.artworks.length === 0) {
      const empty = document.createElement('div')
      empty.className = 'setting-row__sub'
      empty.textContent = 'No saved pictures yet.'
      panel.appendChild(empty)
      return panel
    }

    for (const artwork of this.artworks) {
      const row = document.createElement('label')
      row.className = 'settings-picture-row'

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = this.selectedArtworkIds.has(artwork.id)
      checkbox.setAttribute('data-manage-picture', artwork.id)
      checkbox.className = 'settings-picture-checkbox'
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) this.selectedArtworkIds.add(artwork.id)
        else this.selectedArtworkIds.delete(artwork.id)
        this.render()
      })

      const text = document.createElement('span')
      text.textContent = artwork.title
      text.className = 'settings-picture-title'

      row.appendChild(checkbox)
      row.appendChild(text)
      panel.appendChild(row)
    }

    const deleteSelected = createPxButton({
      label: `DELETE SELECTED (${this.selectedArtworkIds.size})`,
      variant: 'danger',
    })
    deleteSelected.setAttribute('data-delete-selected-pictures', 'true')
    deleteSelected.disabled = this.selectedArtworkIds.size === 0
    deleteSelected.classList.add('settings-wide-button')
    deleteSelected.addEventListener('click', () => { void this.handleDeleteSelected() })
    panel.appendChild(deleteSelected)

    return panel
  }

  private async handleDeleteSelected(): Promise<void> {
    const ids = [...this.selectedArtworkIds]
    if (ids.length === 0) return

    const confirmed = await showConfirmDialog(`Delete ${ids.length} selected picture${ids.length === 1 ? '' : 's'}?`)
    if (!confirmed) return
    const confirmedAgain = await showConfirmDialog('Delete selected pictures forever?')
    if (!confirmedAgain) return

    try {
      await Promise.all(ids.map(id => this.store.delete(id)))
      this.selectedArtworkIds.clear()
      this.artworks = await this.store.fetchAll()
      this.showToast('Selected pictures deleted.')
      this.render()
    } catch {
      this.showToast('Could not delete selected pictures.')
    }
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
    const toast = createToast(message)
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }
}
