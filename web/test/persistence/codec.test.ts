import { describe, it, expect } from 'vitest'
import { encodeArtwork, decodeArtwork } from '../../src/persistence/codec'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import { makeConversionSettings } from '../../src/engine/ConversionSettings'
import type { Artwork } from '../../src/model/Artwork'

function makeMinimalArtwork(overrides: Partial<Artwork> = {}): Artwork {
  const indices = new Uint8Array([0, 1, 1, 0])
  const grid = PixelGrid.create(2, 2, indices, 2)
  const palette = new Palette([
    { rgba: { r: 255, g: 0, b: 0, a: 255 }, number: 1 },
    { rgba: { r: 0, g: 0, b: 255, a: 255 }, number: 2 },
  ])
  return {
    id: 'test-id',
    title: 'Test Artwork',
    source: { kind: 'bundled', bundledImageName: 'duck' },
    createdAt: 1000,
    lastModifiedAt: 2000,
    isComplete: false,
    conversionSettings: makeConversionSettings(0.5),
    palette,
    grid,
    ...overrides,
  }
}

describe('codec', () => {
  it('round-trips a bundled artwork', () => {
    const original = makeMinimalArtwork()
    const record = encodeArtwork(original)
    const decoded = decodeArtwork(record)

    expect(decoded.id).toBe(original.id)
    expect(decoded.title).toBe(original.title)
    expect(decoded.source).toEqual({ kind: 'bundled', bundledImageName: 'duck' })
    expect(decoded.createdAt).toBe(original.createdAt)
    expect(decoded.lastModifiedAt).toBe(original.lastModifiedAt)
    expect(decoded.isComplete).toBe(original.isComplete)
    expect(decoded.conversionSettings.autoFillEnabled).toBe(true)
    expect(decoded.grid.columns).toBe(2)
    expect(decoded.grid.rows).toBe(2)
    expect(decoded.grid.unpaintedCount).toBe(4)
  })

  it('round-trips a user artwork with thumbnailBlob', () => {
    const blob = new Blob(['fake-img'], { type: 'image/jpeg' })
    const sourceBlob = new Blob(['source-img'], { type: 'image/jpeg' })
    const original = makeMinimalArtwork({
      source: { kind: 'user', capturedAt: 5000, origin: 'camera' },
      thumbnailBlob: blob,
      sourceImageBlob: sourceBlob,
    })
    const record = encodeArtwork(original)
    expect(record.bundledImageName).toBeNull()
    expect(record.thumbnailBlob).toBe(blob)
    expect(record.sourceImageBlob).toBe(sourceBlob)

    const decoded = decodeArtwork(record)
    expect(decoded.source).toEqual({ kind: 'user', capturedAt: 5000, origin: 'camera' })
    expect(decoded.thumbnailBlob).toBe(blob)
    expect(decoded.sourceImageBlob).toBe(sourceBlob)
  })

  it('preserves painted cell state through encode/decode', () => {
    const original = makeMinimalArtwork()
    original.grid.paint(0, 0)
    original.grid.paint(1, 1)

    const decoded = decodeArtwork(encodeArtwork(original))
    expect(decoded.grid.cell(0, 0).painted).toBe(true)
    expect(decoded.grid.cell(1, 1).painted).toBe(true)
    expect(decoded.grid.cell(1, 0).painted).toBe(false)
    expect(decoded.grid.unpaintedCount).toBe(2)
  })

  it('preserves custom palette colours', () => {
    const original = makeMinimalArtwork()
    original.palette.colours[0].rgba = { r: 128, g: 64, b: 32, a: 255 }

    const decoded = decodeArtwork(encodeArtwork(original))
    expect(decoded.palette.colours[0].rgba).toEqual({ r: 128, g: 64, b: 32, a: 255 })
    expect(decoded.palette.originalColours[0].rgba).toEqual({ r: 255, g: 0, b: 0, a: 255 })
  })

  it('preserves painting session state', () => {
    const original = makeMinimalArtwork({
      sessionState: { currentTool: 'bucket', selectedPaletteIndex: 1 },
    })

    const decoded = decodeArtwork(encodeArtwork(original))

    expect(decoded.sessionState).toEqual({ currentTool: 'bucket', selectedPaletteIndex: 1 })
  })

  it('preserves the conversion auto-fill setting', () => {
    const original = makeMinimalArtwork({
      conversionSettings: makeConversionSettings(0.5, { autoFillEnabled: false }),
    })

    const decoded = decodeArtwork(encodeArtwork(original))

    expect(decoded.conversionSettings.autoFillEnabled).toBe(false)
  })

  it('defaults older records without auto-fill state to enabled', () => {
    const record = encodeArtwork(makeMinimalArtwork({
      conversionSettings: makeConversionSettings(0.5, { autoFillEnabled: false }),
    }))
    delete record.autoFillEnabled

    const decoded = decodeArtwork(record)

    expect(decoded.conversionSettings.autoFillEnabled).toBe(true)
  })

  it('decodes older records without painting session state', () => {
    const record = encodeArtwork(makeMinimalArtwork())
    delete record.currentTool
    delete record.selectedPaletteIndex

    const decoded = decodeArtwork(record)

    expect(decoded.sessionState).toBeUndefined()
  })

  it('encodes bundledImageName null for user artworks', () => {
    const original = makeMinimalArtwork({
      source: { kind: 'user', capturedAt: 1234, origin: 'library' },
    })
    const record = encodeArtwork(original)
    expect(record.bundledImageName).toBeNull()
  })
})
