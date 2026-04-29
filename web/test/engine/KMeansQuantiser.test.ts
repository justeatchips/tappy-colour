import { describe, it, expect } from 'vitest'
import { quantise } from '../../src/engine/KMeansQuantiser'

function makePixels(colours: [number, number, number][], repeats = 10): Uint8ClampedArray {
  const data = new Uint8ClampedArray(colours.length * repeats * 4)
  let i = 0
  for (let r = 0; r < repeats; r++) {
    for (const [red, green, blue] of colours) {
      data[i++] = red
      data[i++] = green
      data[i++] = blue
      data[i++] = 255
    }
  }
  return data
}

describe('quantise', () => {
  it('returns exactly k centroids', () => {
    const pixels = makePixels([[255, 0, 0], [0, 255, 0], [0, 0, 255]])
    const result = quantise(pixels, 3)
    expect(result.centroids).toHaveLength(3)
  })

  it('returns one centroid per assignment', () => {
    const pixels = makePixels([[255, 0, 0], [0, 255, 0]])
    const result = quantise(pixels, 2)
    expect(result.assignments).toHaveLength(pixels.length / 4)
    for (const a of result.assignments) {
      expect(a).toBeLessThan(2)
    }
  })

  it('reduces k when fewer pixels than k', () => {
    const pixels = makePixels([[128, 64, 32]], 1)
    const result = quantise(pixels, 10)
    expect(result.centroids).toHaveLength(1)
    expect(result.assignments).toHaveLength(1)
    expect(result.assignments[0]).toBe(0)
  })

  it('is deterministic with the same seed', () => {
    const pixels = makePixels([[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0]])
    const a = quantise(pixels, 4, 20, 42)
    const b = quantise(pixels, 4, 20, 42)
    expect(a.centroids).toEqual(b.centroids)
    expect(Array.from(a.assignments)).toEqual(Array.from(b.assignments))
  })

  it('assigns clearly distinct colours to different clusters', () => {
    // Pure red, green, blue with many repetitions — clusters should separate cleanly
    const pixels = makePixels([[255, 0, 0], [0, 255, 0], [0, 0, 255]], 50)
    const result = quantise(pixels, 3)
    // All red pixels should share one assignment, all green another, all blue another
    const redAss = result.assignments[0]
    const greenAss = result.assignments[1]
    const blueAss = result.assignments[2]
    expect(new Set([redAss, greenAss, blueAss]).size).toBe(3)
    // All repetitions of each colour should map to the same cluster
    for (let rep = 0; rep < 50; rep++) {
      expect(result.assignments[rep * 3 + 0]).toBe(redAss)
      expect(result.assignments[rep * 3 + 1]).toBe(greenAss)
      expect(result.assignments[rep * 3 + 2]).toBe(blueAss)
    }
  })

  it('centroid values are clamped to 0–255', () => {
    const pixels = makePixels([[0, 0, 0], [255, 255, 255]])
    const result = quantise(pixels, 2)
    for (const c of result.centroids) {
      expect(c.r).toBeGreaterThanOrEqual(0)
      expect(c.r).toBeLessThanOrEqual(255)
      expect(c.g).toBeGreaterThanOrEqual(0)
      expect(c.g).toBeLessThanOrEqual(255)
      expect(c.b).toBeGreaterThanOrEqual(0)
      expect(c.b).toBeLessThanOrEqual(255)
      expect(c.a).toBe(255)
    }
  })
})
