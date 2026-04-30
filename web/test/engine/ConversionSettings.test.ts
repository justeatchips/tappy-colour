import { describe, it, expect } from 'vitest'
import { makeConversionSettings } from '../../src/engine/ConversionSettings'

describe('makeConversionSettings', () => {
  it('returns minimum values at slider=0', () => {
    const s = makeConversionSettings(0)
    expect(s.sliderValue).toBe(0)
    expect(s.gridSize).toBe(16)
    expect(s.paletteSize).toBe(6)
    expect(s.autoFillEnabled).toBe(true)
  })

  it('returns maximum values at slider=1', () => {
    const s = makeConversionSettings(1)
    expect(s.sliderValue).toBe(1)
    expect(s.gridSize).toBe(80)
    expect(s.paletteSize).toBe(24)
  })

  it('is monotonically increasing', () => {
    const steps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    const settings = steps.map(step => makeConversionSettings(step))
    for (let i = 1; i < settings.length; i++) {
      expect(settings[i].gridSize).toBeGreaterThanOrEqual(settings[i - 1].gridSize)
      expect(settings[i].paletteSize).toBeGreaterThanOrEqual(settings[i - 1].paletteSize)
    }
  })

  it('clamps out-of-range inputs', () => {
    const low = makeConversionSettings(-1)
    expect(low.gridSize).toBe(16)
    expect(low.paletteSize).toBe(6)
    const high = makeConversionSettings(2)
    expect(high.gridSize).toBe(80)
    expect(high.paletteSize).toBe(24)
  })

  it('keeps the requested auto-fill setting', () => {
    expect(makeConversionSettings(0.5, { autoFillEnabled: false }).autoFillEnabled).toBe(false)
    expect(makeConversionSettings(0.5, { autoFillEnabled: true }).autoFillEnabled).toBe(true)
  })

  it('keeps the requested cell shape', () => {
    expect(makeConversionSettings(0.5).cellShape).toBe('square')
    expect(makeConversionSettings(0.5, { cellShape: 'hexCircle' }).cellShape).toBe('hexCircle')
  })

  it('gridSize stays within 16–80', () => {
    for (let i = 0; i <= 100; i++) {
      const s = makeConversionSettings(i / 100)
      expect(s.gridSize).toBeGreaterThanOrEqual(16)
      expect(s.gridSize).toBeLessThanOrEqual(80)
    }
  })
})
