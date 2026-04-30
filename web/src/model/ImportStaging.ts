import type { SearchAttribution } from './Artwork'

export interface StagedImage {
  bitmap: ImageBitmap
  imageBlob: Blob
  suggestedTitle: string
  origin: 'library' | 'camera' | 'search'
  attribution?: SearchAttribution
}

export interface QueuedImage {
  imageBlob: Blob
  suggestedTitle: string
  origin: 'library' | 'camera' | 'search'
  attribution?: SearchAttribution
}

// In-memory singleton. Cleared after DifficultyPicker consumes it.
// A hard reload of #/difficulty/import with no staged image redirects to #/.
let staged: StagedImage | null = null
const queued: QueuedImage[] = []

export const ImportStaging = {
  set(image: StagedImage, nextImages: QueuedImage[] = []): void {
    staged = image
    queued.push(...nextImages)
  },
  enqueue(images: QueuedImage[]): void {
    queued.push(...images)
  },
  take(): StagedImage | null {
    const s = staged
    staged = null
    return s
  },
  takeNextQueued(): QueuedImage | null {
    return queued.shift() ?? null
  },
  has(): boolean {
    return staged !== null
  },
  queuedCount(): number {
    return queued.length
  },
  clearQueue(): void {
    queued.length = 0
  },
}
