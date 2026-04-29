import { describe, it, expect } from 'vitest'
import { rgbToHsb, hsbToRgb } from '../../src/util/colour'

describe('colour conversion', () => {
  it('pure red round-trips', () => {
    const hsb = rgbToHsb(255, 0, 0)
    expect(hsb.h).toBe(0)
    expect(hsb.s).toBe(100)
    expect(hsb.b).toBe(100)
    const rgb = hsbToRgb(hsb.h, hsb.s, hsb.b)
    expect(rgb.r).toBe(255)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(0)
  })

  it('white round-trips', () => {
    const hsb = rgbToHsb(255, 255, 255)
    expect(hsb.b).toBe(100)
    expect(hsb.s).toBe(0)
    const rgb = hsbToRgb(hsb.h, hsb.s, hsb.b)
    expect(rgb.r).toBe(255)
    expect(rgb.g).toBe(255)
    expect(rgb.b).toBe(255)
  })

  it('black round-trips', () => {
    const hsb = rgbToHsb(0, 0, 0)
    expect(hsb.b).toBe(0)
    const rgb = hsbToRgb(hsb.h, hsb.s, hsb.b)
    expect(rgb.r).toBe(0)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(0)
  })

  it('pure blue round-trips', () => {
    const hsb = rgbToHsb(0, 0, 255)
    expect(hsb.h).toBe(240)
    const rgb = hsbToRgb(hsb.h, hsb.s, hsb.b)
    expect(rgb.r).toBe(0)
    expect(rgb.g).toBe(0)
    expect(rgb.b).toBe(255)
  })

  it('hsbToRgb always sets alpha 255', () => {
    const rgb = hsbToRgb(120, 80, 70)
    expect(rgb.a).toBe(255)
  })
})
