import { openDB, type IDBPDatabase } from 'idb'
import type { ArtworkSource } from '../model/Artwork'
import type { PaintTool } from '../model/PaintTool'

export interface ArtworkRecord {
  id: string
  title: string
  bundledImageName: string | null // null for user artworks; kept for index lookup
  sourceJson: string // JSON.stringify(ArtworkSource)
  thumbnailBlob: Blob | null
  sourceImageBlob?: Blob | null
  createdAt: number // epoch ms
  lastModifiedAt: number // epoch ms — indexed
  isComplete: boolean
  sliderValue: number
  autoFillEnabled?: boolean | null
  gridColumns: number
  gridRows: number
  paletteJson: string // JSON.stringify(PaletteColour[])
  originalPaletteJson: string // JSON.stringify(PaletteColour[])
  paintStateData: Uint8Array // 1-byte-per-cell: (painted ? 0x80 : 0) | (paletteIndex & 0x7F)
  currentTool?: PaintTool | null
  selectedPaletteIndex?: number | null
}

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB(): Promise<IDBPDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = openDB('tappy-colour', 2, {
    upgrade(db, oldVersion, _newVersion, tx) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('artworks', { keyPath: 'id' })
        store.createIndex('by-lastModifiedAt', 'lastModifiedAt')
      }
      if (oldVersion < 2) {
        // Migrate v1 records: wrap bundledImageName into sourceJson, add thumbnailBlob
        const store = tx.objectStore('artworks')
        void (async () => {
          let cursor = await store.openCursor()
          while (cursor) {
            const old = cursor.value as Record<string, unknown>
            const name = old['bundledImageName'] as string | undefined
            const source: ArtworkSource = name
              ? { kind: 'bundled', bundledImageName: name }
              : { kind: 'user', capturedAt: (old['createdAt'] as number) ?? Date.now(), origin: 'library' }
            await cursor.update({
              ...old,
              bundledImageName: name ?? null,
              sourceJson: JSON.stringify(source),
              thumbnailBlob: null,
            })
            cursor = await cursor.continue()
          }
        })()
      }
    },
  })

  return dbPromise
}

// Reset for testing only — allows multiple getDB() calls in tests with fresh state
export function resetDBForTesting(): void {
  void dbPromise?.then(db => db.close()).catch(() => {})
  dbPromise = null
}
