import type { Artwork, ArtworkSource } from '../model/Artwork'
import type { ArtworkRecord } from './db'
import { Palette } from '../engine/Palette'
import { PixelGrid } from '../engine/PixelGrid'
import { makeConversionSettings } from '../engine/ConversionSettings'
import type { PaletteColour } from '../engine/types'
import type { PaintTool } from '../model/PaintTool'

function isPaintTool(value: unknown): value is PaintTool {
  return value === 'tap' || value === 'bucket' || value === 'fillAll'
}

export function encodeArtwork(artwork: Artwork): ArtworkRecord {
  const paintStateData = artwork.grid.toPaintStateBytes()
  const bundledImageName =
    artwork.source.kind === 'bundled' ? artwork.source.bundledImageName : null

  return {
    id: artwork.id,
    title: artwork.title,
    bundledImageName,
    sourceJson: JSON.stringify(artwork.source),
    thumbnailBlob: artwork.thumbnailBlob ?? null,
    sourceImageBlob: artwork.sourceImageBlob ?? null,
    createdAt: artwork.createdAt,
    lastModifiedAt: artwork.lastModifiedAt,
    isComplete: artwork.isComplete,
    sliderValue: artwork.conversionSettings.sliderValue,
    autoFillEnabled: artwork.conversionSettings.autoFillEnabled,
    gridColumns: artwork.grid.columns,
    gridRows: artwork.grid.rows,
    paletteJson: JSON.stringify(artwork.palette.colours),
    originalPaletteJson: JSON.stringify(artwork.palette.originalColours),
    paintStateData,
    currentTool: artwork.sessionState?.currentTool ?? null,
    selectedPaletteIndex: artwork.sessionState?.selectedPaletteIndex ?? null,
  }
}

export function decodeArtwork(record: ArtworkRecord): Artwork {
  const paletteColours: PaletteColour[] = JSON.parse(record.paletteJson)
  const originalPaletteColours: PaletteColour[] = JSON.parse(record.originalPaletteJson)

  const palette = new Palette(originalPaletteColours)
  palette.colours = paletteColours.map(c => ({ ...c, rgba: { ...c.rgba } }))

  const grid = PixelGrid.fromPaintStateBytes(
    record.paintStateData,
    record.gridColumns,
    record.gridRows,
    paletteColours.length
  )

  const conversionSettings = makeConversionSettings(record.sliderValue, {
    autoFillEnabled: record.autoFillEnabled ?? true,
  })

  const source: ArtworkSource = record.sourceJson
    ? (JSON.parse(record.sourceJson) as ArtworkSource)
    : { kind: 'bundled', bundledImageName: record.bundledImageName ?? '' }

  const selectedPaletteIndex = record.selectedPaletteIndex
  const currentTool = record.currentTool
  const sessionState = isPaintTool(currentTool) &&
    selectedPaletteIndex !== null &&
    selectedPaletteIndex !== undefined &&
    selectedPaletteIndex >= 0 &&
    selectedPaletteIndex < paletteColours.length
    ? { currentTool, selectedPaletteIndex }
    : undefined

  return {
    id: record.id,
    title: record.title,
    source,
    thumbnailBlob: record.thumbnailBlob ?? undefined,
    sourceImageBlob: record.sourceImageBlob ?? undefined,
    createdAt: record.createdAt,
    lastModifiedAt: record.lastModifiedAt,
    isComplete: record.isComplete,
    conversionSettings,
    palette,
    grid,
    sessionState,
  }
}
