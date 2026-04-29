import type { PixelGrid } from '../engine/PixelGrid'
import type { Palette } from '../engine/Palette'
import type { ConversionSettings } from '../engine/ConversionSettings'
import type { PaintTool } from './PaintTool'

export interface SearchAttribution {
  title: string
  creator: string
  creatorUrl: string
  license: string
  licenseUrl: string
  sourceUrl: string
  usedImageUrl?: string
  usedImageKind?: 'full' | 'thumbnail'
}

export type ArtworkSource =
  | { kind: 'bundled'; bundledImageName: string }
  | { kind: 'user'; capturedAt: number; origin: 'library' | 'camera' }
  | { kind: 'search'; capturedAt: number; attribution: SearchAttribution }

export interface Artwork {
  id: string
  title: string
  source: ArtworkSource
  thumbnailBlob?: Blob
  sourceImageBlob?: Blob
  createdAt: number // epoch ms
  lastModifiedAt: number // epoch ms
  isComplete: boolean
  conversionSettings: ConversionSettings
  palette: Palette
  grid: PixelGrid
  sessionState?: {
    currentTool: PaintTool
    selectedPaletteIndex: number
  }
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function getBundledImageName(artwork: Artwork): string | undefined {
  return artwork.source.kind === 'bundled' ? artwork.source.bundledImageName : undefined
}
