const THUMB_SIZE = 256
const SOURCE_MAX_EDGE = 1024

export type ImageFit = 'cover' | 'contain'

function sourceSize(source: CanvasImageSource & { width: number; height: number }): { width: number; height: number } {
  const naturalWidth = 'naturalWidth' in source ? source.naturalWidth : 0
  const naturalHeight = 'naturalHeight' in source ? source.naturalHeight : 0
  return {
    width: naturalWidth || source.width,
    height: naturalHeight || source.height,
  }
}

export function drawImageFit(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  source: CanvasImageSource & { width: number; height: number },
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  fit: ImageFit = 'cover'
): void {
  const { width, height } = sourceSize(source)
  if (width <= 0 || height <= 0 || dw <= 0 || dh <= 0) return

  if (fit === 'contain') {
    const scale = Math.min(dw / width, dh / height)
    const drawnWidth = width * scale
    const drawnHeight = height * scale
    const offsetX = dx + (dw - drawnWidth) / 2
    const offsetY = dy + (dh - drawnHeight) / 2
    ctx.drawImage(source, offsetX, offsetY, drawnWidth, drawnHeight)
    return
  }

  const scale = Math.max(dw / width, dh / height)
  const sourceWidth = dw / scale
  const sourceHeight = dh / scale
  const sx = (width - sourceWidth) / 2
  const sy = (height - sourceHeight) / 2
  ctx.drawImage(source, sx, sy, sourceWidth, sourceHeight, dx, dy, dw, dh)
}

export async function makeThumbnail(bitmap: ImageBitmap, size = THUMB_SIZE, fit: ImageFit = 'cover'): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, size, size)
  drawImageFit(ctx, bitmap, 0, 0, size, size, fit)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      0.8
    )
  })
}

export async function makeSourceImageBlob(bitmap: ImageBitmap, maxEdge = SOURCE_MAX_EDGE): Promise<Blob> {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      0.9
    )
  })
}
