// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PixelGrid } from '../../src/engine/PixelGrid'
import { Palette } from '../../src/engine/Palette'
import type { Artwork } from '../../src/model/Artwork'
import { ArtworkStore } from '../../src/model/ArtworkStore'
import { resetDBForTesting } from '../../src/persistence/db'
import { encodeArtwork } from '../../src/persistence/codec'

function makeArtwork(id: string, lastModifiedAt: number): Artwork {
  return {
    id,
    title: `Artwork ${lastModifiedAt}`,
    source: { kind: 'bundled', bundledImageName: 'starter' },
    createdAt: 1,
    lastModifiedAt,
    isComplete: false,
    conversionSettings: { sliderValue: 0, gridSize: 2, paletteSize: 1, autoFillEnabled: true },
    palette: new Palette([{ number: 1, rgba: { r: 255, g: 0, b: 0, a: 255 } }]),
    grid: PixelGrid.create(2, 2, new Uint8Array([0, 0, 0, 0]), 1),
  }
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

function seedLegacyV2Artwork(artwork: Artwork): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tappy-colour', 2)
    request.onupgradeneeded = () => {
      const db = request.result
      const store = db.createObjectStore('artworks', { keyPath: 'id' })
      store.createIndex('by-lastModifiedAt', 'lastModifiedAt')
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction('artworks', 'readwrite')
      tx.objectStore('artworks').put(encodeArtwork(artwork))
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => reject(tx.error)
    }
  })
}

beforeEach(async () => {
  vi.useRealTimers()
  await resetDBForTesting()
  await deleteDatabase('tappy-colour')
})

describe('ArtworkStore pending saves', () => {
  it('flushes the latest debounced artwork before its timer fires', async () => {
    const store = new ArtworkStore()

    await store.save(makeArtwork('artwork-1', 10))
    await store.save(makeArtwork('artwork-1', 20))
    await store.flushPendingSaves()

    const saved = await store.get('artwork-1')
    expect(saved?.lastModifiedAt).toBe(20)
    expect(saved?.title).toBe('Artwork 20')
  })

  it('flushes debounced saves when the page hides', async () => {
    const store = new ArtworkStore()

    await store.save(makeArtwork('artwork-2', 30))
    window.dispatchEvent(new Event('pagehide'))

    await vi.waitFor(async () => {
      const saved = await store.get('artwork-2')
      expect(saved?.lastModifiedAt).toBe(30)
    })
  })
})

describe('ArtworkStore migrations', () => {
  it('keeps existing artworks when the profiles store is added', async () => {
    const existingArtwork = makeArtwork('survives-profile-upgrade', 40)
    await seedLegacyV2Artwork(existingArtwork)
    await resetDBForTesting()

    const store = new ArtworkStore()
    const artworks = await store.fetchAll()

    expect(artworks.map(artwork => artwork.id)).toContain('survives-profile-upgrade')
    expect(await store.get('survives-profile-upgrade')).toMatchObject({
      id: 'survives-profile-upgrade',
      title: 'Artwork 40',
    })
  })
})
