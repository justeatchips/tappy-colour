// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import { PaintingSession } from '../../src/model/PaintingSession'
import { PaletteStrip } from '../../src/views/PaletteStrip'

function makeArtwork(): Artwork {
  const grid = PixelGrid.create(3, 1, new Uint8Array([0, 1, 2]), 3)
  grid.paint(0, 0)

  return {
    id: 'test',
    title: 'Test',
    source: { kind: 'bundled', bundledImageName: 'test' },
    createdAt: 0,
    lastModifiedAt: 0,
    isComplete: false,
    conversionSettings: { sliderValue: 0, gridSize: 3, paletteSize: 3, autoFillEnabled: true },
    palette: new Palette([
      { number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } },
      { number: 2, rgba: { r: 0, g: 255, b: 0, a: 255 } },
      { number: 3, rgba: { r: 0, g: 0, b: 255, a: 255 } },
    ]),
    grid,
    sessionState: { currentTool: 'tap', selectedPaletteIndex: 1 },
  }
}

function makeSession(): PaintingSession {
  const store = { save: vi.fn().mockResolvedValue(undefined) } as unknown as ArtworkStore
  return new PaintingSession(makeArtwork(), store)
}

beforeEach(() => {
  document.body.innerHTML = ''
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

describe('PaletteStrip selection targets', () => {
  it('applies a strong selected state to the active palette entry', () => {
    const strip = new PaletteStrip(makeSession())
    strip.mount()

    const entries = strip.element.querySelectorAll<HTMLElement>('[data-palette-entry]')
    const swatches = strip.element.querySelectorAll<HTMLElement>('[data-palette-swatch]')
    const selected = strip.element.querySelector<HTMLElement>('[data-palette-entry="1"]')
    const selectedSwatch = strip.element.querySelector<HTMLElement>('[data-palette-swatch="1"]')
    const selectedNumber = strip.element.querySelector<HTMLElement>('[data-palette-number="1"]')
    const unselected = strip.element.querySelector<HTMLElement>('[data-palette-entry="0"]')

    expect(entries).toHaveLength(3)
    expect(swatches).toHaveLength(3)
    expect(selected?.getAttribute('aria-current')).toBe('true')
    expect(selected?.classList.contains('palette-entry')).toBe(true)
    expect(selectedSwatch?.classList.contains('palette-swatch')).toBe(true)
    expect(selectedNumber?.classList.contains('palette-number')).toBe(true)
    expect(unselected?.getAttribute('aria-current')).toBeNull()
  })

  it('renders palette entries as native buttons for keyboard and assistive controls', () => {
    const strip = new PaletteStrip(makeSession())
    strip.mount()

    const entry = strip.element.querySelector<HTMLButtonElement>('[data-palette-entry="2"]')

    expect(entry).toBeInstanceOf(HTMLButtonElement)
    expect(entry?.type).toBe('button')
    expect(entry?.getAttribute('aria-label')).toBe('Colour 3')
  })

  it('scrolls the selected palette entry into view', () => {
    const strip = new PaletteStrip(makeSession())
    strip.mount()

    const selected = strip.element.querySelector<HTMLElement>('[data-palette-entry="1"]')

    expect(selected?.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  })

  it('removes the colour picker overlay when the backdrop is tapped', () => {
    vi.useFakeTimers()
    try {
      const strip = new PaletteStrip(makeSession())
      strip.mount()

      const firstEntry = strip.element.querySelector<HTMLElement>('[data-palette-entry="1"]')
      expect(firstEntry).toBeInstanceOf(HTMLElement)
      firstEntry!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0, clientY: 0 }))
      vi.advanceTimersByTime(500)

      const overlay = document.body.querySelector<HTMLElement>('[data-colour-picker-overlay]')
      expect(overlay).toBeInstanceOf(HTMLElement)
      overlay!.click()

      expect(document.body.querySelector('[data-colour-picker-overlay]')).toBeNull()

      const secondEntry = strip.element.querySelector<HTMLElement>('[data-palette-entry="2"]')
      expect(secondEntry).toBeInstanceOf(HTMLElement)
      secondEntry!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0, clientY: 0 }))
      vi.advanceTimersByTime(500)

      expect(document.body.querySelectorAll('[data-colour-picker-overlay]')).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
