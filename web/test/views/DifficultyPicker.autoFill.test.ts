// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Artwork } from '../../src/model/Artwork'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import { UserSettings } from '../../src/model/UserSettings'
import type { Router } from '../../src/router'
import { BUNDLED_IMAGES } from '../../src/assets/bundled'
import { createGridFromConversionOutput } from '../../src/engine/ImageConverter'
import { DifficultyPicker } from '../../src/views/DifficultyPicker'

vi.mock('../../src/engine/ImageConverter', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/engine/ImageConverter')>()
  return {
    ...actual,
    convert: vi.fn(async () => ({
      paletteIndices: new Uint8Array([
        0, 0, 0, 0, 0,
        0, 1, 1, 1, 0,
        0, 1, 1, 1, 0,
        0, 1, 1, 1, 0,
        0, 0, 0, 0, 0,
      ]),
      centroids: [
        { r: 250, g: 250, b: 248, a: 255 },
        { r: 180, g: 30, b: 30, a: 255 },
      ],
      columns: 5,
      rows: 5,
    })),
    createGridFromConversionOutput: vi.fn(actual.createGridFromConversionOutput),
  }
})

function makeStore(): ArtworkStore {
  return { saveImmediate: vi.fn() } as unknown as ArtworkStore
}

function makeRouter(): Router {
  return { navigate: vi.fn() } as unknown as Router
}

function savedArtwork(store: ArtworkStore): Artwork {
  return vi.mocked(store.saveImmediate).mock.calls[0][0] as Artwork
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.clearAllMocks()
  UserSettings.update({
    soundEnabled: true,
    defaultSliderValue: 0.2,
    searchEnabled: false,
    autoFillEnabled: false,
    mascotId: 'rosie',
    pin: null,
  })
})

describe('DifficultyPicker auto-fill setting', () => {
  it('passes the parent auto-fill setting into newly converted puzzles', async () => {
    const root = document.createElement('div')
    const store = makeStore()
    const router = makeRouter()
    const screen = new DifficultyPicker(router, store, BUNDLED_IMAGES[0].id, null)

    screen.mount(root)
    root.querySelector<HTMLButtonElement>('#diff-start-btn')?.click()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(createGridFromConversionOutput).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ autoFillEnabled: false })
    )
    expect(savedArtwork(store).conversionSettings.autoFillEnabled).toBe(false)
    expect(savedArtwork(store).grid.unpaintedCount).toBe(25)
  })
})
