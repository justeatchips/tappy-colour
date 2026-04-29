import type { RGBA8 } from '../engine/types'

/**
 * Convert RGBA8 to CSS "rgb(r,g,b)" string.
 */
export function toCssRgb(rgba: RGBA8): string {
  return `rgb(${rgba.r},${rgba.g},${rgba.b})`
}

/**
 * Calculate relative luminance [0,1] for contrast checking.
 * Uses the WCAG 2.0 relative luminance formula.
 */
export function luminance(rgba: RGBA8): number {
  const lineariseChannel = (c: number): number => {
    const normalized = c / 255
    if (normalized <= 0.04045) {
      return normalized / 12.92
    }
    return Math.pow((normalized + 0.055) / 1.055, 2.4)
  }

  const r = lineariseChannel(rgba.r)
  const g = lineariseChannel(rgba.g)
  const b = lineariseChannel(rgba.b)

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Return true if white text is more readable than black on this background.
 * Uses relative luminance: if luminance < 0.5, use white text; else black.
 */
export function isLightBackground(rgba: RGBA8): boolean {
  return luminance(rgba) > 0.5
}

/**
 * Parse "#rrggbb" hex string to RGBA8.
 * Throws on invalid format.
 */
export function fromHex(hex: string): RGBA8 {
  const match = hex.match(/^#?([0-9a-fA-F]{6})$/)
  if (!match) {
    throw new Error(`Invalid hex color: ${hex}`)
  }

  const num = parseInt(match[1], 16)
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
    a: 255,
  }
}

/**
 * Convert RGBA8 to "#rrggbb" hex string.
 */
export function toHex(rgba: RGBA8): string {
  const toHexByte = (n: number): string => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  return `#${toHexByte(rgba.r)}${toHexByte(rgba.g)}${toHexByte(rgba.b)}`
}
