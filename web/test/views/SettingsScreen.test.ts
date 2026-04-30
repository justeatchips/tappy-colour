// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserSettings } from '../../src/model/UserSettings'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import type { Router } from '../../src/router'
import { SettingsScreen } from '../../src/views/SettingsScreen'

function makeArtwork(): Artwork {
  return {
    id: 'artwork-1',
    title: 'Test artwork',
    source: { kind: 'bundled', bundledImageName: 'test' },
    createdAt: 1,
    lastModifiedAt: 1,
    isComplete: false,
    conversionSettings: { sliderValue: 0, gridSize: 2, paletteSize: 1, autoFillEnabled: true },
    palette: new Palette([{ number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } }]),
    grid: PixelGrid.create(2, 2, new Uint8Array([0, 0, 0, 0]), 1),
  }
}

function makeStore(artworks: Artwork[] = []): ArtworkStore {
  return {
    clearAll: vi.fn(),
    fetchAll: vi.fn(async () => artworks),
    delete: vi.fn(async () => undefined),
  } as unknown as ArtworkStore
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

async function clickDialogDelete(): Promise<void> {
  const button = await vi.waitFor(() => {
    const found = [...document.body.querySelectorAll('button')]
      .find(candidate => candidate.textContent === 'Delete')
    expect(found).toBeInstanceOf(HTMLButtonElement)
    return found as HTMLButtonElement
  })
  button.click()
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

  it('deletes selected pictures from the parent-gated manager after two confirmations', async () => {
    const root = document.createElement('div')
    const artwork = makeArtwork()
    const store = makeStore([artwork])
    const screen = new SettingsScreen(makeRouter(), store)

    screen.mount(root)
    await passParentGate()
    await vi.waitFor(() => expect(root.textContent).toContain('SELECT PICTURES'))

    const selectButton = [...root.querySelectorAll('button')]
      .find(button => button.textContent === 'SELECT PICTURES') as HTMLButtonElement | undefined
    expect(selectButton).toBeInstanceOf(HTMLButtonElement)
    selectButton!.click()

    const checkbox = await vi.waitFor(() => {
      const found = root.querySelector<HTMLInputElement>('[data-manage-picture="artwork-1"]')
      expect(found).toBeInstanceOf(HTMLInputElement)
      return found!
    })
    checkbox.checked = true
    checkbox.dispatchEvent(new Event('change', { bubbles: true }))

    const deleteSelected = await vi.waitFor(() => {
      const found = root.querySelector<HTMLButtonElement>('[data-delete-selected-pictures]')
      expect(found).toBeInstanceOf(HTMLButtonElement)
      expect(found!.disabled).toBe(false)
      return found!
    })
    deleteSelected.click()

    await clickDialogDelete()
    await clickDialogDelete()

    await vi.waitFor(() => expect(store.delete).toHaveBeenCalledWith('artwork-1'))
  })
})
