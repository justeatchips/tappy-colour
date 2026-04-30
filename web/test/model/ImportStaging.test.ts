import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImportStaging, type StagedImage } from '../../src/model/ImportStaging'

function makeBitmap(): ImageBitmap {
  return { width: 1, height: 1, close: vi.fn() } as unknown as ImageBitmap
}

function makeStaged(title: string): StagedImage {
  return {
    bitmap: makeBitmap(),
    imageBlob: new Blob([title], { type: 'image/jpeg' }),
    suggestedTitle: title,
    origin: 'library',
  }
}

beforeEach(() => {
  ImportStaging.take()
  ImportStaging.clearQueue()
})

describe('ImportStaging queue', () => {
  it('stores a current image plus unlimited queued library imports', () => {
    ImportStaging.set(makeStaged('First'), [
      {
        imageBlob: new Blob(['second'], { type: 'image/jpeg' }),
        suggestedTitle: 'Second',
        origin: 'library',
      },
      {
        imageBlob: new Blob(['third'], { type: 'image/jpeg' }),
        suggestedTitle: 'Third',
        origin: 'library',
      },
    ])

    expect(ImportStaging.queuedCount()).toBe(2)
    expect(ImportStaging.take()?.suggestedTitle).toBe('First')
    expect(ImportStaging.takeNextQueued()?.suggestedTitle).toBe('Second')
    expect(ImportStaging.takeNextQueued()?.suggestedTitle).toBe('Third')
    expect(ImportStaging.takeNextQueued()).toBeNull()
  })
})
