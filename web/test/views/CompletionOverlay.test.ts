// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import { PaintingSession } from '../../src/model/PaintingSession'
import type { Router } from '../../src/router'
import { CompletionOverlay } from '../../src/views/CompletionOverlay'

function makeCompleteableSession(): PaintingSession {
  const grid = PixelGrid.create(1, 1, new Uint8Array([0]), 1)
  const artwork: Artwork = {
    id: 'completion-test',
    title: 'Completion Test',
    source: { kind: 'bundled', bundledImageName: 'completion-test' },
    createdAt: 0,
    lastModifiedAt: 0,
    isComplete: false,
    conversionSettings: { sliderValue: 0, gridSize: 1, paletteSize: 1, autoFillEnabled: true },
    palette: new Palette([{ number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } }]),
    grid,
  }
  const store = { save: vi.fn().mockResolvedValue(undefined) } as unknown as ArtworkStore
  return new PaintingSession(artwork, store)
}

describe('CompletionOverlay', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({} as CanvasRenderingContext2D)
  })

  it('unmounts and cancels its show timer when completion is undone', () => {
    vi.useFakeTimers()
    try {
      const root = document.createElement('div')
      const session = makeCompleteableSession()
      const router = { navigate: vi.fn() } as unknown as Router

      session.tap(0, 0)
      const overlay = new CompletionOverlay(session, router)
      overlay.mount(root)
      expect(root.querySelector('[data-completion-overlay]')).toBeInstanceOf(HTMLElement)

      session.undo()
      vi.advanceTimersByTime(1000)

      expect(root.querySelector('[data-completion-overlay]')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('can be dismissed to keep viewing the completed puzzle', () => {
    const root = document.createElement('div')
    const session = makeCompleteableSession()
    const router = { navigate: vi.fn() } as unknown as Router
    const onDismiss = vi.fn()

    const overlay = new CompletionOverlay(session, router, onDismiss)
    overlay.mount(root)

    const keepLookingBtn = Array.from(root.querySelectorAll('button'))
      .find(button => button.textContent === 'Keep Looking')
    keepLookingBtn?.click()

    expect(root.querySelector('[data-completion-overlay]')).toBeNull()
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
