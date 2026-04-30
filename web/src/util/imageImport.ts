const MAX_DECODE_PX = 1024
const MAX_MEGAPIXELS = 24 * 1024 * 1024 // 24 MP

/**
 * Open a file picker restricted to images and resolve with the chosen File.
 * Rejects if the user cancels or picks a non-image file.
 */
export function pickImageFromLibrary(): Promise<File> {
  return pickImagesFromLibrary().then(files => files[0])
}

/**
 * Open a file picker restricted to images and resolve with every chosen File.
 * The browser may impose its own picker/storage constraints, but the app does
 * not add an arbitrary count limit.
 */
export function pickImagesFromLibrary(): Promise<File[]> {
  return pickFiles({ camera: false, multiple: true })
}

/**
 * Open the device camera (falls back to file picker on desktop).
 * Resolves with the captured File.
 */
export function captureImageFromCamera(): Promise<File> {
  return pickFiles({ camera: true, multiple: false }).then(files => files[0])
}

function pickFiles(opts: { camera: boolean; multiple: boolean }): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = opts.multiple
    if (opts.camera) input.setAttribute('capture', 'environment')

    let resolved = false

    input.addEventListener('change', () => {
      const files = [...(input.files ?? [])]
      const nonImage = files.find(file => !file.type.startsWith('image/'))
      if (files.length === 0) {
        reject(new Error('No file selected'))
      } else if (nonImage) {
        reject(new Error('Selected file is not an image'))
      } else {
        resolved = true
        resolve(files)
      }
    })

    // Detect cancel via focus returning to window with no file chosen
    const onFocus = () => {
      window.removeEventListener('focus', onFocus)
      // Give the change event a tick to fire first
      setTimeout(() => {
        if (!resolved) reject(new Error('No file selected'))
      }, 500)
    }
    window.addEventListener('focus', onFocus)

    input.click()
  })
}

/**
 * Decode a File into an ImageBitmap, respecting EXIF orientation and
 * downscaling to MAX_DECODE_PX on the longest edge to keep memory reasonable.
 * Throws if the decoded image exceeds MAX_MEGAPIXELS.
 */
export async function decodeAndDownscale(image: Blob): Promise<ImageBitmap> {
  // Fast path: let the browser decode and downscale in one shot
  const bitmap = await createImageBitmap(image, {
    imageOrientation: 'from-image',
    premultiplyAlpha: 'none',
  })

  const { width, height } = bitmap
  if (width * height > MAX_MEGAPIXELS) {
    bitmap.close()
    throw new Error(
      `Image is too large (${Math.round((width * height) / 1_000_000)} MP). Please choose a smaller photo.`
    )
  }

  if (width <= MAX_DECODE_PX && height <= MAX_DECODE_PX) {
    return bitmap
  }

  // Downscale to fit within MAX_DECODE_PX on the longest edge
  const scale = MAX_DECODE_PX / Math.max(width, height)
  const targetW = Math.round(width * scale)
  const targetH = Math.round(height * scale)

  bitmap.close()
  return createImageBitmap(image, {
    imageOrientation: 'from-image',
    premultiplyAlpha: 'none',
    resizeWidth: targetW,
    resizeHeight: targetH,
    resizeQuality: 'high',
  })
}
