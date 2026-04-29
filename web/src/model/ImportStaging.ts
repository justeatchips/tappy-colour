import type { SearchAttribution } from './Artwork'

export interface StagedImage {
  bitmap: ImageBitmap
  imageBlob: Blob
  suggestedTitle: string
  origin: 'library' | 'camera' | 'search'
  attribution?: SearchAttribution
}

// In-memory singleton. Cleared after DifficultyPicker consumes it.
// A hard reload of #/difficulty/import with no staged image redirects to #/.
let staged: StagedImage | null = null

export const ImportStaging = {
  set(image: StagedImage): void {
    staged = image
  },
  take(): StagedImage | null {
    const s = staged
    staged = null
    return s
  },
  has(): boolean {
    return staged !== null
  },
}
