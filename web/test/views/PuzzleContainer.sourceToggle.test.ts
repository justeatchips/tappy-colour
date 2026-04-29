// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import type { Router } from '../../src/router'
import { PuzzleContainer } from '../../src/views/PuzzleContainer'

class ResizeObserverStub {
  observe(): void {}
  disconnect(): void {}
}

function makeCanvasContext(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

function makeArtwork(complete: boolean): Artwork {
  const grid = PixelGrid.create(2, 1, new Uint8Array([0, 0]), 1)
  if (complete) {
    grid.paintCells([{ col: 0, row: 0 }, { col: 1, row: 0 }])
  }

  return {
    id: 'source-toggle',
    title: 'Source Toggle',
    source: { kind: 'user', capturedAt: 1000, origin: 'library' },
    thumbnailBlob: new Blob(['thumb'], { type: 'image/jpeg' }),
    sourceImageBlob: new Blob(['source'], { type: 'image/jpeg' }),
    createdAt: 1000,
    lastModifiedAt: 1000,
    isComplete: complete,
    conversionSettings: { sliderValue: 0, gridSize: 2, paletteSize: 1, autoFillEnabled: true },
    palette: new Palette([{ number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } }]),
    grid,
  }
}

function makeStore(artwork: Artwork): ArtworkStore {
  return {
    get: vi.fn().mockResolvedValue(artwork),
    save: vi.fn().mockResolvedValue(undefined),
  } as unknown as ArtworkStore
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  Element.prototype.scrollIntoView = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(makeCanvasContext())
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:source-image'),
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  })
})

describe('PuzzleContainer source image toggle', () => {
  it('toggles between the completed painting and stored source image', async () => {
    const root = document.createElement('div')
    const view = new PuzzleContainer(
      { navigate: vi.fn() } as unknown as Router,
      makeStore(makeArtwork(true)),
      'source-toggle'
    )

    view.mount(root)

    await vi.waitFor(() => {
      expect(root.querySelector('[data-source-toggle]')).toBeInstanceOf(HTMLButtonElement)
    })

    const toggle = root.querySelector<HTMLButtonElement>('[data-source-toggle]')!
    const print = root.querySelector<HTMLButtonElement>('[data-print-sheet]')!
    const sourceImage = root.querySelector<HTMLImageElement>('[data-source-image]')!

    expect(print.style.display).toBe('inline-flex')
    expect(toggle.style.display).toBe('inline-flex')
    expect(toggle.textContent).toBe('PHOTO')
    expect(sourceImage.src).toBe('blob:source-image')
    expect(sourceImage.style.display).toBe('none')

    toggle.click()

    expect(toggle.textContent).toBe('PAINT')
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(sourceImage.style.display).toBe('block')

    toggle.click()

    expect(toggle.textContent).toBe('PHOTO')
    expect(sourceImage.style.display).toBe('none')

    view.unmount()
  })

  it('keeps the source toggle hidden until the puzzle is complete', async () => {
    const root = document.createElement('div')
    const view = new PuzzleContainer(
      { navigate: vi.fn() } as unknown as Router,
      makeStore(makeArtwork(false)),
      'source-toggle'
    )

    view.mount(root)

    await vi.waitFor(() => {
      expect(root.querySelector('[data-source-toggle]')).toBeInstanceOf(HTMLButtonElement)
    })

    const toggle = root.querySelector<HTMLButtonElement>('[data-source-toggle]')!
    const print = root.querySelector<HTMLButtonElement>('[data-print-sheet]')!
    const sourceImage = root.querySelector<HTMLImageElement>('[data-source-image]')!

    expect(print.style.display).toBe('inline-flex')
    expect(toggle.style.display).toBe('none')
    expect(sourceImage.style.display).toBe('none')

    view.unmount()
  })
})
