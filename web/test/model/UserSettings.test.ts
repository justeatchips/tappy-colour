import { describe, it, expect, beforeEach, vi } from 'vitest'

// Stub localStorage before importing module
const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear: () => { for (const k in store) delete store[k] },
})

// Must be imported AFTER stubbing so the constructor sees the stub
const { UserSettings } = await import('../../src/model/UserSettings')

beforeEach(() => {
  // Reset storage and reload defaults between tests
  localStorage.clear()
  UserSettings.resetForTesting()
  UserSettings.update({
    soundEnabled: true,
    defaultSliderValue: 0.2,
    searchEnabled: false,
    autoFillEnabled: true,
    mascotId: null,
    pin: null,
  })
})

describe('UserSettings defaults', () => {
  it('returns default soundEnabled = true', () => {
    expect(UserSettings.get().soundEnabled).toBe(true)
  })

  it('returns default defaultSliderValue = 0.2', () => {
    expect(UserSettings.get().defaultSliderValue).toBe(0.2)
  })

  it('returns default pin = null', () => {
    expect(UserSettings.get().pin).toBeNull()
  })

  it('hasPin is false when pin is null', () => {
    expect(UserSettings.hasPin).toBe(false)
  })
})

describe('UserSettings.update', () => {
  it('persists partial update', () => {
    UserSettings.update({ soundEnabled: false })
    expect(UserSettings.get().soundEnabled).toBe(false)
    expect(UserSettings.get().defaultSliderValue).toBe(0.2)  // unchanged
  })

  it('hasPin is true after setting pin', () => {
    UserSettings.update({ pin: 13 })
    expect(UserSettings.hasPin).toBe(true)
  })

  it('notifies onChange listeners', () => {
    const calls: boolean[] = []
    const unsub = UserSettings.onChange(s => calls.push(s.soundEnabled))
    UserSettings.update({ soundEnabled: false })
    UserSettings.update({ soundEnabled: true })
    unsub()
    UserSettings.update({ soundEnabled: false })  // after unsub — should not fire
    expect(calls).toEqual([false, true])
  })
})

describe('UserSettings.makeChallenge', () => {
  it('returns a question and answer equalling the stored pin', () => {
    UserSettings.update({ pin: 17 })
    const { question, answer } = UserSettings.makeChallenge()
    expect(answer).toBe(17)
    // question is "A + B" format
    const parts = question.split(' + ').map(Number)
    expect(parts).toHaveLength(2)
    expect(parts[0] + parts[1]).toBe(17)
  })

  it('both addends are positive', () => {
    UserSettings.update({ pin: 15 })
    for (let i = 0; i < 20; i++) {
      const { question } = UserSettings.makeChallenge()
      const [a, b] = question.split(' + ').map(Number)
      expect(a).toBeGreaterThanOrEqual(1)
      expect(b).toBeGreaterThanOrEqual(1)
    }
  })
})
