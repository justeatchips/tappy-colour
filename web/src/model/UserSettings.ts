const STORAGE_KEY = 'tappy-settings-v1'

export interface SettingsData {
  soundEnabled: boolean
  defaultSliderValue: number
  searchEnabled: boolean
  autoFillEnabled: boolean
  mascotId: string | null
  pin: number | null  // null = not set yet; numeric answer to arithmetic gate
}

const DEFAULTS: SettingsData = {
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

  constructor() {
    this.data = this.load()
  }

  private load(): SettingsData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { ...DEFAULTS }
      const parsed = JSON.parse(raw) as Partial<SettingsData>
      return { ...DEFAULTS, ...parsed }
    } catch {
      return { ...DEFAULTS }
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch {
      // localStorage unavailable (private browsing, storage full) — ignore
    }
  }

  get(): SettingsData {
    return { ...this.data }
  }

  update(patch: Partial<SettingsData>): void {
    this.data = { ...this.data, ...patch }
    this.persist()
    for (const fn of this.listeners) fn(this.get())
  }

  onChange(fn: ChangeListener): () => void {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  }

  /** True once the parent has set a PIN on first visit to settings. */
  get hasPin(): boolean {
    return this.data.pin !== null
  }

  /**
   * Generate a random arithmetic challenge whose answer equals the stored PIN.
   * Returns { question, answer } — caller checks user input against answer.
   */
  makeChallenge(): { question: string; answer: number } {
    const pin = this.data.pin
    if (pin === null || pin < 2) throw new Error('No PIN set')
    const a = Math.floor(Math.random() * (pin - 1)) + 1
    const b = pin - a
    return { question: `${a} + ${b}`, answer: pin }
  }
}

export const UserSettings = new UserSettingsStore()
