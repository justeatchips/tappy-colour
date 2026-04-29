// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserSettings } from '../../src/model/UserSettings'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import type { Router } from '../../src/router'
import { SettingsScreen } from '../../src/views/SettingsScreen'

function makeStore(): ArtworkStore {
  return { clearAll: vi.fn() } as unknown as ArtworkStore
}

function makeRouter(): Router {
  return { navigate: vi.fn() } as unknown as Router
}

async function passParentGate(): Promise<void> {
  const input = await vi.waitFor(() => {
    const found = document.body.querySelector('input[type="number"]') as HTMLInputElement | null
    expect(found).toBeInstanceOf(HTMLInputElement)
    return found!
  })
  input.value = '17'

  const checkButton = [...document.body.querySelectorAll('button')]
    .find(button => button.textContent === 'CHECK')
  expect(checkButton).toBeInstanceOf(HTMLButtonElement)
  ;(checkButton as HTMLButtonElement).click()
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 0
  })
  UserSettings.update({
    soundEnabled: true,
    defaultSliderValue: 0.2,
    searchEnabled: false,
    autoFillEnabled: true,
    mascotId: 'rosie',
    pin: 17,
  })
})

describe('SettingsScreen required controls', () => {
  it('renders parent-controlled search and auto-fill toggles', async () => {
    const root = document.createElement('div')
    const screen = new SettingsScreen(makeRouter(), makeStore())

    screen.mount(root)
    await passParentGate()

    await vi.waitFor(() => expect(root.textContent).toContain('Internet Search'))
    expect(root.textContent).toContain('Auto-Fill')
  })

  it('updates searchEnabled and autoFillEnabled from their toggles', async () => {
    const root = document.createElement('div')
    const screen = new SettingsScreen(makeRouter(), makeStore())

    screen.mount(root)
    await passParentGate()
    await vi.waitFor(() => expect(root.textContent).toContain('Internet Search'))

    const toggles = root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    const searchToggle = toggles[1]
    const autoFillToggle = toggles[2]

    expect(searchToggle.checked).toBe(false)
    expect(autoFillToggle.checked).toBe(true)

    searchToggle.checked = true
    searchToggle.dispatchEvent(new Event('change', { bubbles: true }))
    autoFillToggle.checked = false
    autoFillToggle.dispatchEvent(new Event('change', { bubbles: true }))

    expect(UserSettings.get().searchEnabled).toBe(true)
    expect(UserSettings.get().autoFillEnabled).toBe(false)
  })
})
