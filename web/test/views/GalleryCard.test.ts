// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import { createGalleryCard } from '../../src/views/GalleryCard'

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

function dispatchTouch(target: EventTarget, type: string, clientX: number, clientY: number): Event {
  const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent
  const touch = { clientX, clientY } as Touch
  const activeTouches = type === 'touchend' || type === 'touchcancel' ? [] : [touch]

  Object.defineProperty(event, 'touches', { value: activeTouches })
  Object.defineProperty(event, 'changedTouches', { value: [touch] })
  target.dispatchEvent(event)
  return event
}

function makeCard(onOpen = vi.fn(), onDelete = vi.fn(), showDelete = false): HTMLElement {
  return createGalleryCard({
    artwork: makeArtwork(),
    imageSrc: null,
    onOpen,
    onDelete,
    showDelete,
    objectUrls: { create: () => 'blob:test' },
  })
}

describe('GalleryCard touch activation', () => {
  it('does not show destructive controls by default', () => {
    const card = makeCard()

    expect(card.querySelector('button[aria-label="Delete"]')).toBeNull()
  })

  it('opens on a touch tap inside the movement threshold', () => {
    const onOpen = vi.fn()
    const card = makeCard(onOpen)

    dispatchTouch(card, 'touchstart', 100, 100)
    const endEvent = dispatchTouch(card, 'touchend', 104, 105)

    expect(onOpen).toHaveBeenCalledOnce()
    expect(endEvent.defaultPrevented).toBe(true)
  })

  it('does not open when the touch gesture scrolls beyond the movement threshold', () => {
    const onOpen = vi.fn()
    const card = makeCard(onOpen)

    dispatchTouch(card, 'touchstart', 100, 100)
    dispatchTouch(card, 'touchmove', 100, 132)
    const endEvent = dispatchTouch(card, 'touchend', 100, 132)

    expect(onOpen).not.toHaveBeenCalled()
    expect(endEvent.defaultPrevented).toBe(false)
  })

  it('suppresses a synthetic click after a scroll-cancelled touch', () => {
    const onOpen = vi.fn()
    const card = makeCard(onOpen)

    dispatchTouch(card, 'touchstart', 100, 100)
    dispatchTouch(card, 'touchmove', 100, 132)
    dispatchTouch(card, 'touchend', 100, 132)
    card.click()

    expect(onOpen).not.toHaveBeenCalled()
  })

  it('does not delete or open when scrolling starts on the delete button', () => {
    const onOpen = vi.fn()
    const onDelete = vi.fn()
    const card = makeCard(onOpen, onDelete, true)
    const deleteButton = card.querySelector('button[aria-label="Delete"]')

    expect(deleteButton).toBeInstanceOf(HTMLButtonElement)

    dispatchTouch(deleteButton as HTMLButtonElement, 'touchstart', 40, 40)
    dispatchTouch(deleteButton as HTMLButtonElement, 'touchmove', 40, 68)
    dispatchTouch(deleteButton as HTMLButtonElement, 'touchend', 40, 68)

    expect(onDelete).not.toHaveBeenCalled()
    expect(onOpen).not.toHaveBeenCalled()
  })
})
