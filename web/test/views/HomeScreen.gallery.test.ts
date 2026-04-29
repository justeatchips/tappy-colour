// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import { BUNDLED_IMAGES } from '../../src/assets/bundled'
import type { Artwork } from '../../src/model/Artwork'
import { UserSettings } from '../../src/model/UserSettings'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import type { Router } from '../../src/router'
import { HomeScreen } from '../../src/views/HomeScreen'

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(res => { resolve = res })
  return { promise, resolve }
}

function makeArtwork(bundledImageName: string, title: string): Artwork {
  return {
    id: 'saved-starter',
    title,
    source: { kind: 'bundled', bundledImageName },
    createdAt: 1,
    lastModifiedAt: 2,
    isComplete: false,
    conversionSettings: { sliderValue: 0, gridSize: 2, paletteSize: 1, autoFillEnabled: true },
    palette: new Palette([{ number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } }]),
    grid: PixelGrid.create(2, 2, new Uint8Array([0, 0, 0, 0]), 1),
  }
}

function makeStore(initialLoad: Promise<Artwork[]>): ArtworkStore {
  let cache: Artwork[] = []
  return {
    get cache() { return cache },
    on: vi.fn(() => () => {}),
    fetchAll: vi.fn(async () => {
      cache = await initialLoad
      return cache
    }),
    getByBundledName: vi.fn((name: string) =>
      cache.find(artwork =>
        artwork.source.kind === 'bundled' && artwork.source.bundledImageName === name
      )
    ),
  } as unknown as ArtworkStore
}

function makeRouter(): Router {
  return { navigate: vi.fn() } as unknown as Router
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

describe('HomeScreen gallery loading', () => {
  it('does not render starter cards until the initial gallery load finishes', async () => {
    const load = deferred<Artwork[]>()
    const root = document.createElement('div')
    const screen = new HomeScreen(makeRouter(), makeStore(load.promise))

    screen.mount(root)

    expect(root.querySelector('#home-gallery-loading')).toBeInstanceOf(HTMLElement)
    expect(root.querySelectorAll('.gallery-card')).toHaveLength(0)

    load.resolve([])
    await vi.waitFor(() => expect(root.querySelector('#home-gallery-loading')).toBeNull())

    expect(root.querySelectorAll('.gallery-card').length).toBeGreaterThan(0)
  })

  it('opens the saved bundled artwork instead of a duplicate starter after loading', async () => {
    const bundled = BUNDLED_IMAGES[0]
    const load = deferred<Artwork[]>()
    const root = document.createElement('div')
    const router = makeRouter()
    const screen = new HomeScreen(router, makeStore(load.promise))

    screen.mount(root)
    load.resolve([makeArtwork(bundled.id, bundled.title)])
    await vi.waitFor(() => expect(root.querySelector('#home-gallery-loading')).toBeNull())

    const matchingTitles = [...root.querySelectorAll('.gallery-card__title')]
      .filter(title => title.textContent === bundled.title)
    expect(matchingTitles).toHaveLength(1)

    matchingTitles[0].closest('button')?.click()

    expect(router.navigate).toHaveBeenCalledWith('#/puzzle/saved-starter')
  })
})
