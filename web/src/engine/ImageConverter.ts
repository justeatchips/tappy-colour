import type { ConversionSettings } from './ConversionSettings'
import type { RGBA8 } from './types'
import { quantise } from './KMeansQuantiser'
import { PixelGrid } from './PixelGrid'
import { findAutoFillCells } from './autoFill'

const useOffscreenCanvas = typeof OffscreenCanvas !== 'undefined'

export interface ConversionOutput {
  paletteIndices: Uint8Array
  centroids: RGBA8[]
  columns: number
  rows: number
}

export function createGridFromConversionOutput(
  output: ConversionOutput,
  settings: Pick<ConversionSettings, 'autoFillEnabled'>
): PixelGrid {
  const grid = PixelGrid.create(output.columns, output.rows, output.paletteIndices, output.centroids.length)
  if (settings.autoFillEnabled) {
    grid.paintCells(findAutoFillCells(output))
  }
  return grid
}

export async function convertFromBitmap(
  bitmap: ImageBitmap,
  settings: ConversionSettings
): Promise<ConversionOutput> {
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2

  let canvas: HTMLCanvasElement | OffscreenCanvas

  if (useOffscreenCanvas) {
    canvas = new OffscreenCanvas(settings.gridSize, settings.gridSize)
  } else {
    canvas = document.createElement('canvas')
    ;(canvas as HTMLCanvasElement).width = settings.gridSize
    ;(canvas as HTMLCanvasElement).height = settings.gridSize
  }

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, settings.gridSize, settings.gridSize)

  const imageData = ctx.getImageData(0, 0, settings.gridSize, settings.gridSize)
  const { centroids, assignments } = quantise(imageData.data, settings.paletteSize)

  return {
    paletteIndices: assignments,
    centroids,
    columns: settings.gridSize,
    rows: settings.gridSize,
  }
}

export async function convert(
  imageUrl: string,
  settings: ConversionSettings
): Promise<ConversionOutput> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }

  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob)
  try {
    return await convertFromBitmap(bitmap, settings)
  } finally {
    bitmap.close()
  }
}

let worker: Worker | null = null
let nextWorkerId = 0
const pendingWorkerCalls = new Map<
  number,
  { resolve: (v: ConversionOutput) => void; reject: (e: Error) => void }
>()

function errorFromWorkerEvent(e: ErrorEvent | MessageEvent): Error {
  if ('message' in e && e.message) return new Error(e.message)
  return new Error('Worker error')
}

function rejectPendingWorkerCalls(error: Error): void {
  for (const handler of pendingWorkerCalls.values()) {
    handler.reject(error)
  }
  pendingWorkerCalls.clear()
}

function resetWorkerAfterFailure(error: Error): void {
  const failedWorker = worker
  worker = null
  rejectPendingWorkerCalls(error)
  failedWorker?.terminate()
}

function handleWorkerFailure(e: ErrorEvent | MessageEvent): void {
  e.preventDefault?.()
  resetWorkerAfterFailure(errorFromWorkerEvent(e))
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/conversion.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.addEventListener('message', (e: MessageEvent) => {
      const { id, result, error } = e.data
      const handler = pendingWorkerCalls.get(id)
      if (!handler) return
      pendingWorkerCalls.delete(id)
      if (error) {
        handler.reject(new Error(error))
      } else {
        handler.resolve(result)
      }
    })
    worker.addEventListener('error', handleWorkerFailure)
    worker.addEventListener('messageerror', handleWorkerFailure)
  }
  return worker
}

export function convertInWorker(
  imageUrl: string,
  settings: ConversionSettings
): Promise<ConversionOutput> {
  return new Promise((resolve, reject) => {
    const w = getWorker()
    const id = ++nextWorkerId
    pendingWorkerCalls.set(id, { resolve, reject })
    try {
      w.postMessage({ id, imageUrl, settings })
    } catch (err) {
      pendingWorkerCalls.delete(id)
      reject(err instanceof Error ? err : new Error('Worker postMessage failed'))
    }
  })
}

export function convertFromBitmapInWorker(
  bitmap: ImageBitmap,
  settings: ConversionSettings
): Promise<ConversionOutput> {
  return new Promise((resolve, reject) => {
    const w = getWorker()
    const id = ++nextWorkerId
    pendingWorkerCalls.set(id, { resolve, reject })
    // Transfer the bitmap so it doesn't need to be cloned
    try {
      w.postMessage({ id, bitmap, settings }, [bitmap])
    } catch (err) {
      pendingWorkerCalls.delete(id)
      reject(err instanceof Error ? err : new Error('Worker postMessage failed'))
    }
  })
}
