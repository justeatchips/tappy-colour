// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import { UserSettings } from '../../src/model/UserSettings'
import type { Router } from '../../src/router'
import { HomeScreen } from '../../src/views/HomeScreen'

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

function makeStore(artworks: Artwork[]): ArtworkStore {
  return {
    cache: artworks,
    on: vi.fn(() => () => {}),
    fetchAll: vi.fn(async () => artworks),
    getByBundledName: vi.fn(() => undefined),
    delete: vi.fn(async () => undefined),
  } as unknown as ArtworkStore
}

function makeRouter(): Router {
  return { navigate: vi.fn() } as unknown as Router
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
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
  UserSettings.update({
    soundEnabled: true,
    defaultSliderValue: 0.2,
    searchEnabled: false,
    autoFillEnabled: true,
    mascotId: 'rosie',
    pin: null,
  })
})

describe('HomeScreen delete confirmation', () => {
  it('requires two confirmations before deleting an artwork', async () => {
    const root = document.createElement('div')
    const artwork = makeArtwork()
    const store = makeStore([artwork])
    const screen = new HomeScreen(makeRouter(), store)

    screen.mount(root)
    const deleteButton = await vi.waitFor(() => {
      const found = root.querySelector<HTMLButtonElement>('button[aria-label="Delete"]')
      expect(found).toBeInstanceOf(HTMLButtonElement)
      return found
    })

    deleteButton!.click()
    expect(store.delete).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Delete "Test artwork"?')

    await clickDialogDelete()
    await vi.waitFor(() => expect(document.body.textContent).toContain('Delete "Test artwork" forever?'))
    expect(store.delete).not.toHaveBeenCalled()

    await clickDialogDelete()
    await vi.waitFor(() => expect(store.delete).toHaveBeenCalledWith('artwork-1'))
  })
})
