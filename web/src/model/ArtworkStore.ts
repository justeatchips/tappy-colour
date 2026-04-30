import { getDB } from '../persistence/db'
import { encodeArtwork, decodeArtwork } from '../persistence/codec'
import { EventEmitter } from '../util/events'
import type { Artwork } from './Artwork'

export class ArtworkStore extends EventEmitter<{ changed: Artwork[] }> {
  private cache: Artwork[] = []
  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private pendingSaves = new Map<string, Artwork>()

  constructor() {
    super()
    this.setupPageHideListener()
  }

  /**
   * Set up listener for page hide/visibility to flush pending saves.
   */
  private setupPageHideListener(): void {
    if (typeof window === 'undefined') return

    const flushAll = () => {
      void this.flushPendingSaves().catch(err => this.notifyStorageError(err))
    }

    window.addEventListener('visibilitychange', flushAll)
    window.addEventListener('pagehide', flushAll)
  }

  /**
   * Fetch all artworks from IndexedDB, sorted by lastModifiedAt descending.
   * Caches results and emits 'changed' event.
   */
  async fetchAll(): Promise<Artwork[]> {
    const db = await getDB()
    const records = await db.getAllFromIndex(
      'artworks',
      'by-lastModifiedAt'
    )

    // Sort descending (most recent first)
    records.sort((a, b) => b.lastModifiedAt - a.lastModifiedAt)

    // Decode and cache
    this.cache = records.map((record) => decodeArtwork(record))

    this.emit('changed', this.cache)

    return this.cache
  }

  /**
   * Get a single artwork by ID from cache, or fetch from DB if not cached.
   */
  async get(id: string): Promise<Artwork | undefined> {
    // Check cache first
    const cached = this.cache.find((a) => a.id === id)
    if (cached) return cached

    // Fetch from DB
    const db = await getDB()
    const record = await db.get('artworks', id)

    if (!record) return undefined

    const artwork = decodeArtwork(record)

    // Update cache
    const existing = this.cache.findIndex((a) => a.id === id)
    if (existing >= 0) {
      this.cache[existing] = artwork
    } else {
      this.cache.push(artwork)
    }

    return artwork
  }

  /**
   * Save an artwork with debouncing (150ms).
   * Clears existing timer for this artwork and sets a new one.
   * Also flushes immediately on page hide.
   */
  async save(artwork: Artwork): Promise<void> {
    // Clear existing timer
    const existing = this.saveTimers.get(artwork.id)
    if (existing) {
      clearTimeout(existing)
    }

    // Set new debounced timer
    const timerId = setTimeout(() => {
      const pending = this.pendingSaves.get(artwork.id)
      this.pendingSaves.delete(artwork.id)
      this.saveTimers.delete(artwork.id)

      if (!pending) return

      this.saveImmediate(pending).catch(err => this.notifyStorageError(err))
    }, 150)

    this.pendingSaves.set(artwork.id, artwork)
    this.saveTimers.set(artwork.id, timerId)
  }

  /**
   * Immediately write all debounced saves that have not reached their timer yet.
   */
  async flushPendingSaves(): Promise<void> {
    const pending = [...this.pendingSaves.values()]

    for (const timer of this.saveTimers.values()) clearTimeout(timer)
    this.saveTimers.clear()
    this.pendingSaves.clear()

    await Promise.all(pending.map(artwork => this.saveImmediate(artwork)))
  }

  /**
   * Save an artwork immediately to IndexedDB without debouncing.
   */
  async saveImmediate(artwork: Artwork): Promise<void> {
    const timer = this.saveTimers.get(artwork.id)
    if (timer) {
      clearTimeout(timer)
      this.saveTimers.delete(artwork.id)
    }
    this.pendingSaves.delete(artwork.id)

    const db = await getDB()
    const record = encodeArtwork(artwork)

    await db.put('artworks', record)

    // Update cache
    const existing = this.cache.findIndex((a) => a.id === artwork.id)
    if (existing >= 0) {
      this.cache[existing] = artwork
    } else {
      this.cache.push(artwork)
    }

    this.emit('changed', this.cache)
  }

  getByBundledName(name: string): import('./Artwork').Artwork | undefined {
    return this.cache.find(
      a => a.source.kind === 'bundled' && a.source.bundledImageName === name
    )
  }

  /**
   * Delete all artworks from IndexedDB and cache.
   */
  async clearAll(): Promise<void> {
    for (const timer of this.saveTimers.values()) clearTimeout(timer)
    this.saveTimers.clear()
    this.pendingSaves.clear()

    const db = await getDB()
    await db.clear('artworks')
    this.cache = []
    this.emit('changed', this.cache)
  }

  /**
   * Delete an artwork from IndexedDB and cache.
   */
  async delete(id: string): Promise<void> {
    // Clear any pending save timer
    const timer = this.saveTimers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.saveTimers.delete(id)
    }
    this.pendingSaves.delete(id)

    const db = await getDB()
    await db.delete('artworks', id)

    // Remove from cache
    const existing = this.cache.findIndex((a) => a.id === id)
    if (existing >= 0) {
      this.cache.splice(existing, 1)
    }

    this.emit('changed', this.cache)
  }

  private notifyStorageError(err: unknown): void {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('tappy-storage-error', {
      detail: {
        error: err,
        message: err instanceof DOMException && err.name === 'QuotaExceededError'
          ? 'Device storage is full. Delete some pictures in Settings, then try again.'
          : 'Could not save your latest progress.',
      },
    }))
  }
}
