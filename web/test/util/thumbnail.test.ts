import { describe, expect, it, vi } from 'vitest'
import { drawImageFit } from '../../src/util/thumbnail'

function makeSource(width: number, height: number): CanvasImageSource & { width: number; height: number } {
  return { width, height } as CanvasImageSource & { width: number; height: number }
}

function makeContext(): CanvasRenderingContext2D {
  return {
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

describe('drawImageFit', () => {
  it('cover-crops wide images without stretching them', () => {
    const source = makeSource(400, 200)
    const ctx = makeContext()

    drawImageFit(ctx, source, 0, 0, 100, 100, 'cover')

    expect(ctx.drawImage).toHaveBeenCalledWith(source, 100, 0, 200, 200, 0, 0, 100, 100)
  })

  it('contains wide images without stretching them', () => {
    const source = makeSource(400, 200)
    const ctx = makeContext()

    drawImageFit(ctx, source, 0, 0, 100, 100, 'contain')

    expect(ctx.drawImage).toHaveBeenCalledWith(source, 0, 25, 100, 50)
  })
})
