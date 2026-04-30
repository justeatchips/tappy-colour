// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import { PaintingSession } from '../../src/model/PaintingSession'
import { GridCanvas } from '../../src/views/GridCanvas'

interface DrawCall {
  fillStyle?: string
  strokeStyle?: string
  lineWidth?: number
  text?: string
}

interface FakeContext {
  fillStyle: string
  strokeStyle: string
  lineWidth: number
  font: string
  textAlign: CanvasTextAlign
  textBaseline: CanvasTextBaseline
  fillCalls: DrawCall[]
  strokeCalls: DrawCall[]
  textCalls: DrawCall[]
  clearRect: () => void
  fillRect: (this: FakeContext) => void
  strokeRect: (this: FakeContext) => void
  fillText: (this: FakeContext, text: string) => void
  setTransform: () => void
}

class ResizeObserverStub {
  observe(): void {}
  disconnect(): void {}
}

function makeContext(): FakeContext {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    fillCalls: [],
    strokeCalls: [],
    textCalls: [],
    clearRect: vi.fn(),
    fillRect() {
      this.fillCalls.push({ fillStyle: this.fillStyle })
    },
    strokeRect() {
      this.strokeCalls.push({ strokeStyle: this.strokeStyle, lineWidth: this.lineWidth })
    },
    fillText(text: string) {
      this.textCalls.push({ text, fillStyle: this.fillStyle })
    },
    setTransform: vi.fn(),
  }
}

function makeSession(): PaintingSession {
  const grid = PixelGrid.create(2, 1, new Uint8Array([0, 1]), 2)
  const artwork: Artwork = {
    id: 'grid-selection',
    title: 'Grid Selection',
    source: { kind: 'bundled', bundledImageName: 'grid-selection' },
    createdAt: 0,
    lastModifiedAt: 0,
    isComplete: false,
    conversionSettings: { sliderValue: 0, gridSize: 2, paletteSize: 2, autoFillEnabled: true },
    palette: new Palette([
      { number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } },
      { number: 2, rgba: { r: 0, g: 255, b: 0, a: 255 } },
    ]),
    grid,
    sessionState: { currentTool: 'tap', selectedPaletteIndex: 0 },
  }
  const store = { save: vi.fn().mockResolvedValue(undefined) } as unknown as ArtworkStore
  return new PaintingSession(artwork, store)
}

function makeSizedSession(columns: number, rows: number, complete = false): PaintingSession {
  const indices = new Uint8Array(columns * rows)
  const grid = PixelGrid.create(columns, rows, indices, 1)
  if (complete) {
    const cells = Array.from({ length: columns * rows }, (_, index) => ({
      col: index % columns,
      row: Math.floor(index / columns),
    }))
    grid.paintCells(cells)
  }
  const artwork: Artwork = {
    id: 'grid-density',
    title: 'Grid Density',
    source: { kind: 'bundled', bundledImageName: 'grid-density' },
    createdAt: 0,
    lastModifiedAt: 0,
    isComplete: complete,
    conversionSettings: { sliderValue: 1, gridSize: columns, paletteSize: 1, autoFillEnabled: true },
    palette: new Palette([{ number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } }]),
    grid,
  }
  const store = { save: vi.fn().mockResolvedValue(undefined) } as unknown as ArtworkStore
  return new PaintingSession(artwork, store)
}

function mountWithContexts(session: PaintingSession, width: number, height: number): {
  canvas: GridCanvas
  contexts: FakeContext[]
} {
  const contexts: FakeContext[] = []
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
    const ctx = makeContext()
    contexts.push(ctx)
    return ctx as unknown as CanvasRenderingContext2D
  })

  const container = document.createElement('div')
  Object.defineProperty(container, 'clientWidth', { value: width })
  Object.defineProperty(container, 'clientHeight', { value: height })

  const canvas = new GridCanvas(session, container)
  canvas.mount()
  return { canvas, contexts }
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

describe('GridCanvas selected colour highlight', () => {
  it('re-renders selected cells and numbers when the palette selection changes', () => {
    const contexts: FakeContext[] = []
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      const ctx = makeContext()
      contexts.push(ctx)
      return ctx as unknown as CanvasRenderingContext2D
    })

    const container = document.createElement('div')
    Object.defineProperty(container, 'clientWidth', { value: 100 })
    Object.defineProperty(container, 'clientHeight', { value: 50 })

    const session = makeSession()
    const canvas = new GridCanvas(session, container)
    canvas.mount()

    session.selectPaletteIndex(1)

    const cellsCtx = contexts[0]
    const numbersCtx = contexts[1]
    expect(cellsCtx.fillCalls.some(call => call.fillStyle === 'rgba(0, 255, 0, 0.22)')).toBe(true)
    expect(cellsCtx.strokeCalls.some(call =>
      call.strokeStyle === '#111827' &&
      typeof call.lineWidth === 'number' &&
      call.lineWidth >= 2
    )).toBe(true)
    expect(numbersCtx.textCalls.some(call => call.text === '2' && call.fillStyle === '#111827')).toBe(true)
  })

  it('draws a temporary hint overlay for remaining selected cells', () => {
    vi.useFakeTimers()
    try {
      const contexts: FakeContext[] = []
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
        const ctx = makeContext()
        contexts.push(ctx)
        return ctx as unknown as CanvasRenderingContext2D
      })

      const container = document.createElement('div')
      Object.defineProperty(container, 'clientWidth', { value: 100 })
      Object.defineProperty(container, 'clientHeight', { value: 50 })

      const session = makeSession()
      const canvas = new GridCanvas(session, container)
      canvas.mount()
      session.selectPaletteIndex(1)

      const cellsCtx = contexts[0]
      cellsCtx.fillCalls.length = 0
      session.requestHint()

      expect(cellsCtx.fillCalls.some(call => call.fillStyle === 'rgba(250, 204, 21, 0.28)')).toBe(true)

      canvas.unmount()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('GridCanvas dense number labels', () => {
  it('hides labels when dense cells are too small to read', () => {
    const { canvas, contexts } = mountWithContexts(makeSizedSession(80, 80), 320, 320)

    expect(contexts[1].textCalls).toHaveLength(0)

    canvas.unmount()
  })

  it('draws labels again when effective cells are readable', () => {
    const { canvas, contexts } = mountWithContexts(makeSizedSession(20, 20), 320, 320)

    expect(contexts[1].textCalls.length).toBeGreaterThan(0)

    canvas.unmount()
  })
})

describe('GridCanvas completion rendering', () => {
  it('keeps cell boundaries visible while a puzzle is in progress', () => {
    const { canvas, contexts } = mountWithContexts(makeSizedSession(2, 1), 100, 50)

    expect(contexts[0].strokeCalls.length).toBeGreaterThan(0)

    canvas.unmount()
  })

  it('hides cell boundaries for completed puzzles', () => {
    const { canvas, contexts } = mountWithContexts(makeSizedSession(2, 1, true), 100, 50)

    expect(contexts[0].strokeCalls).toHaveLength(0)

    canvas.unmount()
  })
})

describe('GridCanvas mouse input', () => {
  it('paints a matching cell with a laptop mouse click', () => {
    const session = makeSession()
    const container = document.createElement('div')
    Object.defineProperty(container, 'clientWidth', { value: 100 })
    Object.defineProperty(container, 'clientHeight', { value: 50 })

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      return makeContext() as unknown as CanvasRenderingContext2D
    })

    const gridCanvas = new GridCanvas(session, container)
    gridCanvas.mount()

    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 50,
      width: 100,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect)

    const canvas = container.querySelector('canvas')!
    canvas.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      buttons: 1,
      clientX: 30,
      clientY: 20,
      bubbles: true,
    }))
    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 30,
      clientY: 20,
      bubbles: true,
    }))

    expect(session.grid.cell(0, 0).painted).toBe(true)

    gridCanvas.unmount()
  })
})
