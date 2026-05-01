// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDBForTesting } from '../../src/persistence/db'
import { loadDefaultProfileSettings, saveDefaultProfileSettings } from '../../src/model/ProfileStore'
import { SETTINGS_STORAGE_KEY, UserSettings, type SettingsData } from '../../src/model/UserSettings'

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

const savedSettings: SettingsData = {
  soundEnabled: false,
  defaultSliderValue: 0.72,
  searchEnabled: true,
  autoFillEnabled: false,
  mascotId: 'sparkle',
  pin: 17,
}

beforeEach(async () => {
  vi.useRealTimers()
  await resetDBForTesting()
  localStorage.clear()
  await deleteDatabase('tappy-colour')
  UserSettings.resetForTesting()
})

describe('durable profile settings', () => {
  it('round-trips the default child profile in IndexedDB', async () => {
    await saveDefaultProfileSettings(savedSettings, 1000)

    expect(await loadDefaultProfileSettings()).toEqual(savedSettings)
  })

  it('restores the local settings cache from the durable profile when browser storage is missing', async () => {
    await saveDefaultProfileSettings(savedSettings, 1000)

    expect(UserSettings.get().mascotId).toBeNull()

    await UserSettings.hydrateFromDurableProfile()

    expect(UserSettings.get()).toEqual(savedSettings)
    expect(JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '{}')).toMatchObject(savedSettings)
  })

  it('keeps configured local settings and updates the durable profile when both exist', async () => {
    await saveDefaultProfileSettings(savedSettings, 1000)

    const localSettings: SettingsData = {
      soundEnabled: true,
      defaultSliderValue: 0.33,
      searchEnabled: false,
      autoFillEnabled: true,
      mascotId: 'bo',
      pin: 23,
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(localSettings))
    UserSettings.resetForTesting()

    await UserSettings.hydrateFromDurableProfile()

    expect(UserSettings.get()).toEqual(localSettings)
    expect(await loadDefaultProfileSettings()).toEqual(localSettings)
  })

  it('writes settings updates through to the durable profile', async () => {
    UserSettings.update({
      searchEnabled: true,
      mascotId: 'luna',
      pin: 19,
    })

    await vi.waitFor(async () => {
      expect(await loadDefaultProfileSettings()).toMatchObject({
        searchEnabled: true,
        mascotId: 'luna',
        pin: 19,
      })
    })
  })
})
