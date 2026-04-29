// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import { PaintingSession } from '../../src/model/PaintingSession'
import { ToolbarStrip } from '../../src/views/ToolbarStrip'

function makeSession(): PaintingSession {
  const artwork: Artwork = {
    id: 'toolbar-test',
    title: 'Toolbar Test',
    source: { kind: 'bundled', bundledImageName: 'toolbar-test' },
    createdAt: 0,
    lastModifiedAt: 0,
    isComplete: false,
    conversionSettings: { sliderValue: 0, gridSize: 2, paletteSize: 1, autoFillEnabled: true },
    palette: new Palette([{ number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } }]),
    grid: PixelGrid.create(2, 1, new Uint8Array([0, 0]), 1),
  }
  const store = { save: vi.fn().mockResolvedValue(undefined) } as unknown as ArtworkStore
  return new PaintingSession(artwork, store)
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('ToolbarStrip hint button', () => {
  it('requests a hint without changing the active tool', () => {
    const session = makeSession()
    const events: string[] = []
    session.on('change', (event) => events.push(event))
    const toolbar = new ToolbarStrip(session)
    toolbar.mount()

    toolbar.element.querySelector<HTMLButtonElement>('button[aria-label="Hint"]')?.click()

    expect(events).toContain('hintRequested')
    expect(session.currentTool).toBe('tap')
  })

  it('disables the hint button when the selected colour has no cells left', () => {
    const session = makeSession()
    const toolbar = new ToolbarStrip(session)
    toolbar.mount()
    const hintButton = toolbar.element.querySelector<HTMLButtonElement>('button[aria-label="Hint"]')
    expect(hintButton?.disabled).toBe(false)

    session.fillAllOfSelected()

    expect(hintButton?.disabled).toBe(true)
  })
})
