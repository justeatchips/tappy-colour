import type { View } from './views/BaseView'
import type { ArtworkStore } from './model/ArtworkStore'
import type { StagedImage } from './model/ImportStaging'
import { UserSettings } from './model/UserSettings'
import { getSearchAccess } from './util/searchAccess'
import { blurActiveTextEditingElement } from './util/focus'

export class Router {
  private current: View | null = null
  private isRouting = false
  private pendingRoute = false

  constructor(private root: HTMLElement, private store: ArtworkStore) {}

  start(): void {
    window.addEventListener('hashchange', () => this.route())
    this.route()
  }

  navigate(hash: string): void {
    window.location.hash = hash
  }

  private async route(): Promise<void> {
    if (this.isRouting) {
      this.pendingRoute = true
      return
    }

    this.isRouting = true
    try {
      do {
        this.pendingRoute = false
        await this.renderCurrentRoute()
      } while (this.pendingRoute)
    } finally {
      this.isRouting = false
    }
  }

  private async renderCurrentRoute(): Promise<void> {
    const settings = UserSettings.get()
    const { hash, staged } = await this.resolveRoute(window.location.hash.replace(/^#\/?/, ''), settings)

    blurActiveTextEditingElement()
    this.current?.unmount()
    this.current = null
    this.root.innerHTML = ''

    if (hash === 'onboarding') {
      const { OnboardingScreen } = await import('./views/OnboardingScreen')
      const view = new OnboardingScreen(this)
      await view.mount(this.root).catch(() => {})
      this.current = view
    } else if (hash === 'difficulty/import' && staged) {
      const { DifficultyPicker } = await import('./views/DifficultyPicker')
      const view = new DifficultyPicker(this, this.store, null, staged)
      view.mount(this.root)
      this.current = view
    } else if (hash.startsWith('difficulty/')) {
      const bundledName = hash.slice('difficulty/'.length)
      const { DifficultyPicker } = await import('./views/DifficultyPicker')
      const view = new DifficultyPicker(this, this.store, bundledName, null)
      view.mount(this.root)
      this.current = view
    } else if (hash.startsWith('puzzle/')) {
      const artworkId = hash.slice('puzzle/'.length)
      const { PuzzleContainer } = await import('./views/PuzzleContainer')
      const view = new PuzzleContainer(this, this.store, artworkId)
      view.mount(this.root)
      this.current = view
    } else if (hash === 'settings') {
      const { SettingsScreen } = await import('./views/SettingsScreen')
      const view = new SettingsScreen(this, this.store)
      view.mount(this.root)
      this.current = view
    } else if (hash === 'search') {
      const { SearchScreen } = await import('./views/SearchScreen')
      const view = new SearchScreen(this)
      view.mount(this.root)
      this.current = view
    }

    if (!this.current) {
      const { HomeScreen } = await import('./views/HomeScreen')
      const view = new HomeScreen(this, this.store)
      view.mount(this.root)
      this.current = view
    }
  }

  private async resolveRoute(
    requestedHash: string,
    settings: ReturnType<typeof UserSettings.get>
  ): Promise<{ hash: string; staged: StagedImage | null }> {
    let hash = requestedHash
    let staged: StagedImage | null = null

    if (settings.mascotId === null && hash !== 'onboarding' && hash !== '') {
      this.replaceHash('onboarding')
      hash = 'onboarding'
    }

    if (hash === 'difficulty/import') {
      const { ImportStaging } = await import('./model/ImportStaging')
      staged = ImportStaging.take()
      if (!staged) {
        this.replaceHash('')
        hash = ''
      }
    }

    if (hash === 'search') {
      const searchAccess = getSearchAccess(settings, navigator.onLine)
      if (!searchAccess.allowed) {
        this.replaceHash('')
        hash = ''
      }
    }

    return { hash, staged }
  }

  private replaceHash(hash: string): void {
    history.replaceState(null, '', hash === '' ? '#/' : `#/${hash}`)
  }
}
