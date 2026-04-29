import type { RGBA8 } from '../engine/types'

export interface HSB { h: number; s: number; b: number }

export function rgbToHsb(r: number, g: number, b: number): HSB {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const diff = max - min
  let h = 0
  if (diff !== 0) {
    if (max === rn)      h = ((gn - bn) / diff) % 6
    else if (max === gn) h = (bn - rn) / diff + 2
    else                 h = (rn - gn) / diff + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : Math.round((diff / max) * 100)
  const bv = Math.round(max * 100)
  return { h, s, b: bv }
}

export function hsbToRgb(h: number, s: number, b: number): RGBA8 {
  const sn = s / 100, bn = b / 100
  const c = bn * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = bn - c
  let r = 0, g = 0, bv = 0
  if (h < 60)       { r = c; g = x; bv = 0 }
  else if (h < 120) { r = x; g = c; bv = 0 }
  else if (h < 180) { r = 0; g = c; bv = x }
  else if (h < 240) { r = 0; g = x; bv = c }
  else if (h < 300) { r = x; g = 0; bv = c }
  else              { r = c; g = 0; bv = x }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((bv + m) * 255),
    a: 255,
  }
}
