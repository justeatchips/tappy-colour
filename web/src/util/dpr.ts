/**
 * Get the current device pixel ratio.
 * Defaults to 1 if window.devicePixelRatio is not available.
 */
export function getDpr(): number {
  if (typeof window !== 'undefined' && window.devicePixelRatio) {
    return window.devicePixelRatio
  }
  return 1
}

/**
 * Set up a canvas for high-DPI rendering.
 * - Sets canvas.width/height in physical pixels (CSS pixels * DPR)
 * - Sets canvas.style.width/height in CSS pixels
 * - Applies ctx.setTransform(dpr, 0, 0, dpr, 0, 0) so subsequent draws use CSS units
 */
export function setupHiDpiCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): CanvasRenderingContext2D {
  const dpr = getDpr()

  canvas.width = cssWidth * dpr
  canvas.height = cssHeight * dpr

  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`

  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  return ctx
}
