export interface ConversionSettings {
  sliderValue: number
  gridSize: number
  paletteSize: number
  autoFillEnabled: boolean
  imageFit?: 'cover' | 'contain'
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

export function makeConversionSettings(
  sliderValue: number,
  opts: { autoFillEnabled?: boolean; imageFit?: 'cover' | 'contain' } = {}
): ConversionSettings {
  const s = clamp(sliderValue, 0, 1)
  return {
    sliderValue: s,
    gridSize: clamp(Math.round(16 + s * 64), 16, 80),
    paletteSize: clamp(Math.round(6 + s * 18), 6, 24),
    autoFillEnabled: opts.autoFillEnabled ?? true,
    imageFit: opts.imageFit ?? 'cover',
  }
}
