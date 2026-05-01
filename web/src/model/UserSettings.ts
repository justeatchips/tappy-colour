import { loadDefaultProfileSettings, saveDefaultProfileSettings } from './ProfileStore'

export const SETTINGS_STORAGE_KEY = 'tappy-settings-v1'

export interface SettingsData {
  soundEnabled: boolean
  defaultSliderValue: number
  searchEnabled: boolean
  autoFillEnabled: boolean
  mascotId: string | null
  pin: number | null  // null = not set yet; numeric answer to arithmetic gate
}

export const DEFAULT_SETTINGS: SettingsData = {
  soundEnabled: true,
  defaultSliderValue: 0.2,
  searchEnabled: false,
  autoFillEnabled: true,
  mascotId: null,
  pin: null,
}

type ChangeListener = (settings: SettingsData) => void

class UserSettingsStore {
  private data: SettingsData
  private listeners: ChangeListener[] = []
  private loadedFromLocalStorage = false

  constructor() {
    const loaded = this.load()
    this.data = loaded.data
    this.loadedFromLocalStorage = loaded.loadedFromLocalStorage
  }

  private load(): { data: SettingsData; loadedFromLocalStorage: boolean } {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (!raw) return { data: { ...DEFAULT_SETTINGS }, loadedFromLocalStorage: false }
      const parsed = JSON.parse(raw) as Partial<SettingsData>
      return { data: { ...DEFAULT_SETTINGS, ...parsed }, loadedFromLocalStorage: true }
    } catch {
      return { data: { ...DEFAULT_SETTINGS }, loadedFromLocalStorage: false }
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.data))
      this.loadedFromLocalStorage = true
    } catch {
      // localStorage unavailable (private browsing, storage full) - ignore.
    }
  }

  get(): SettingsData {
    return { ...this.data }
  }

  async hydrateFromDurableProfile(): Promise<void> {
    const profileSettings = await loadDefaultProfileSettings()

    if (profileSettings && this.shouldUseDurableProfile(profileSettings)) {
      this.data = { ...DEFAULT_SETTINGS, ...profileSettings }
      this.persist()
      this.notify()
      return
    }

    await saveDefaultProfileSettings(this.data)
  }

  update(patch: Partial<SettingsData>): void {
    this.data = { ...this.data, ...patch }
    this.persist()
    void saveDefaultProfileSettings(this.data).catch(() => {
      // LocalStorage remains the fast cache; durable profile persistence is best-effort per update.
    })
    this.notify()
  }

  onChange(fn: ChangeListener): () => void {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  }

  resetForTesting(): void {
    const loaded = this.load()
    this.data = loaded.data
    this.loadedFromLocalStorage = loaded.loadedFromLocalStorage
    this.listeners = []
  }

  /** True once the parent has set a PIN on first visit to settings. */
  get hasPin(): boolean {
    return this.data.pin !== null
  }

  /**
   * Generate a random arithmetic challenge whose answer equals the stored PIN.
   * Returns { question, answer } - caller checks user input against answer.
   */
  makeChallenge(): { question: string; answer: number } {
    const pin = this.data.pin
    if (pin === null || pin < 2) throw new Error('No PIN set')
    const a = Math.floor(Math.random() * (pin - 1)) + 1
    const b = pin - a
    return { question: `${a} + ${b}`, answer: pin }
  }

  private notify(): void {
    for (const fn of this.listeners) fn(this.get())
  }

  private shouldUseDurableProfile(profileSettings: SettingsData): boolean {
    if (!this.loadedFromLocalStorage) return true
    return this.isUnconfiguredDefaults(this.data) && !this.isUnconfiguredDefaults(profileSettings)
  }

  private isUnconfiguredDefaults(settings: SettingsData): boolean {
    return settings.soundEnabled === DEFAULT_SETTINGS.soundEnabled &&
      settings.defaultSliderValue === DEFAULT_SETTINGS.defaultSliderValue &&
      settings.searchEnabled === DEFAULT_SETTINGS.searchEnabled &&
      settings.autoFillEnabled === DEFAULT_SETTINGS.autoFillEnabled &&
      settings.mascotId === DEFAULT_SETTINGS.mascotId &&
      settings.pin === DEFAULT_SETTINGS.pin
  }
}

export const UserSettings = new UserSettingsStore()
