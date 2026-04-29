import { convert, convertFromBitmap } from '../engine/ImageConverter'

self.addEventListener('message', async (e: MessageEvent) => {
  const { id, imageUrl, bitmap, settings } = e.data
  try {
    const result = bitmap
      ? await convertFromBitmap(bitmap as ImageBitmap, settings)
      : await convert(imageUrl as string, settings)
    self.postMessage({ id, result })
  } catch (err) {
    self.postMessage({ id, error: String(err) })
  }
})
