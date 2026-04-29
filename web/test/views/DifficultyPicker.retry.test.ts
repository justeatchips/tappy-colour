// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConversionOutput } from '../../src/engine/ImageConverter'
import type { ArtworkStore } from '../../src/model/ArtworkStore'
import type { StagedImage } from '../../src/model/ImportStaging'
import { UserSettings } from '../../src/model/UserSettings'
import type { Router } from '../../src/router'
import { DifficultyPicker } from '../../src/views/DifficultyPicker'

const {
  convertFromBitmapInWorkerMock,
  decodeAndDownscaleMock,
  makeSourceImageBlobMock,
  makeThumbnailMock,
} = vi.hoisted(() => ({
  convertFromBitmapInWorkerMock: vi.fn(),
  decodeAndDownscaleMock: vi.fn(),
  makeSourceImageBlobMock: vi.fn(),
  makeThumbnailMock: vi.fn(),
}))

vi.mock('../../src/util/imageImport', () => ({
  decodeAndDownscale: decodeAndDownscaleMock,
}))

vi.mock('../../src/util/thumbnail', () => ({
  makeSourceImageBlob: makeSourceImageBlobMock,
  makeThumbnail: makeThumbnailMock,
}))

vi.mock('../../src/engine/ImageConverter', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/engine/ImageConverter')>()
  return {
    ...actual,
    convertFromBitmapInWorker: convertFromBitmapInWorkerMock,
  }
})

function makeBitmap(width = 8, height = 8): ImageBitmap {
  return {
    width,
    height,
    close: vi.fn(),
  } as unknown as ImageBitmap
}

function makeStore(): ArtworkStore {
  return { saveImmediate: vi.fn(async () => {}) } as unknown as ArtworkStore
}

function makeRouter(): Router {
  return { navigate: vi.fn() } as unknown as Router
}

function makeOutput(): ConversionOutput {
  return {
    paletteIndices: new Uint8Array([0]),
    centroids: [{ r: 220, g: 120, b: 40, a: 255 }],
    columns: 1,
    rows: 1,
  }
}

async function flushAsync(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
}

beforeEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  UserSettings.update({
    soundEnabled: true,
    defaultSliderValue: 0.2,
    searchEnabled: false,
    autoFillEnabled: true,
    mascotId: 'rosie',
    pin: null,
  })

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    getImageData: vi.fn(),
    imageSmoothingEnabled: false,
  } as unknown as CanvasRenderingContext2D)

  makeThumbnailMock.mockResolvedValue(new Blob(['thumb'], { type: 'image/jpeg' }))
  makeSourceImageBlobMock.mockResolvedValue(new Blob(['source'], { type: 'image/jpeg' }))
})

describe('DifficultyPicker imported image retry', () => {
  it('decodes a fresh bitmap from the staged blob for each conversion attempt', async () => {
    const previewBitmap = makeBitmap()
    const firstAttemptBitmap = makeBitmap()
    const secondAttemptBitmap = makeBitmap()
    const staged: StagedImage = {
      bitmap: previewBitmap,
      imageBlob: new Blob(['original image'], { type: 'image/jpeg' }),
      suggestedTitle: 'Retry Photo',
      origin: 'library',
    }
    const store = makeStore()
    const router = makeRouter()
    const screen = new DifficultyPicker(router, store, null, staged)
    const root = document.createElement('div')

    decodeAndDownscaleMock
      .mockResolvedValueOnce(firstAttemptBitmap)
      .mockResolvedValueOnce(secondAttemptBitmap)
    convertFromBitmapInWorkerMock
      .mockRejectedValueOnce(new Error('worker failed'))
      .mockResolvedValueOnce(makeOutput())

    screen.mount(root)
    const startBtn = root.querySelector<HTMLButtonElement>('#diff-start-btn')
    expect(startBtn).toBeInstanceOf(HTMLButtonElement)

    startBtn!.click()
    await flushAsync()

    expect(convertFromBitmapInWorkerMock).toHaveBeenCalledWith(firstAttemptBitmap, expect.any(Object))
    expect(decodeAndDownscaleMock).toHaveBeenCalledWith(staged.imageBlob)
    expect(previewBitmap.close).not.toHaveBeenCalled()
    expect(startBtn!.disabled).toBe(false)
    expect(store.saveImmediate).not.toHaveBeenCalled()

    startBtn!.click()
    await flushAsync()

    expect(decodeAndDownscaleMock).toHaveBeenCalledTimes(2)
    expect(convertFromBitmapInWorkerMock).toHaveBeenLastCalledWith(secondAttemptBitmap, expect.any(Object))
    expect(store.saveImmediate).toHaveBeenCalledTimes(1)
    expect(router.navigate).toHaveBeenCalledWith(expect.stringMatching(/^#\/puzzle\//))
    expect(previewBitmap.close).toHaveBeenCalledTimes(1)
  })
})
