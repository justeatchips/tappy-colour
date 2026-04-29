import type { RGBA8 } from './types'

export interface QuantiseResult {
  centroids: RGBA8[]
  assignments: Uint8Array
}

/** Minimal linear congruential generator for deterministic seeding */
function lcg(seed: number): number {
  const m = 2147483647
  const a = 16807
  return Math.abs((a * (seed % (m - 1))) % m)
}

export function quantise(
  pixels: Uint8ClampedArray,
  k: number,
  maxIterations = 20,
  seed = 42
): QuantiseResult {
  const pixelCount = pixels.length / 4
  const effectiveK = Math.min(k, Math.max(1, pixelCount))

  // k-means++ initialization
  const centroidIndices: number[] = []
  const rng = new Uint32Array(1)
  rng[0] = lcg(seed)

  // First centroid: random pixel
  centroidIndices.push(lcg(rng[0]) % pixelCount)

  // Subsequent centroids: roulette selection based on min-dist²
  const minDist = new Float64Array(pixelCount)
  minDist.fill(Infinity)

  for (let c = 1; c < effectiveK; c++) {
    updateMinDist(pixels, pixelCount, centroidIndices, minDist)

    let totalDist = 0
    for (let i = 0; i < pixelCount; i++) {
      totalDist += minDist[i]
    }

    let roulette = (lcg(rng[0]) / 0x100000000) * totalDist
    rng[0] = lcg(rng[0])

    let cumulative = 0
    for (let i = 0; i < pixelCount; i++) {
      cumulative += minDist[i]
      if (cumulative >= roulette) {
        centroidIndices.push(i)
        break
      }
    }
  }

  // Initialize centroid accumulators
  const centroidR = new Float64Array(effectiveK)
  const centroidG = new Float64Array(effectiveK)
  const centroidB = new Float64Array(effectiveK)

  for (let i = 0; i < effectiveK; i++) {
    const idx = centroidIndices[i]
    centroidR[i] = pixels[idx * 4]
    centroidG[i] = pixels[idx * 4 + 1]
    centroidB[i] = pixels[idx * 4 + 2]
  }

  const assignments = new Uint8Array(pixelCount)

  // k-means iterations
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    let changedCount = 0
    let maxMinDist = 0
    let maxMinDistIdx = 0

    const accR = new Float64Array(effectiveK)
    const accG = new Float64Array(effectiveK)
    const accB = new Float64Array(effectiveK)
    const counts = new Int32Array(effectiveK)

    for (let i = 0; i < pixelCount; i++) {
      const r = pixels[i * 4]
      const g = pixels[i * 4 + 1]
      const b = pixels[i * 4 + 2]

      let bestDist = Infinity
      let bestCluster = 0

      for (let j = 0; j < effectiveK; j++) {
        const dr = r - centroidR[j]
        const dg = g - centroidG[j]
        const db = b - centroidB[j]
        const dist = dr * dr + dg * dg + db * db

        if (dist < bestDist) {
          bestDist = dist
          bestCluster = j
        }
      }

      if (assignments[i] !== bestCluster) {
        changedCount++
      }
      assignments[i] = bestCluster

      if (bestDist > maxMinDist) {
        maxMinDist = bestDist
        maxMinDistIdx = i
      }

      accR[bestCluster] += r
      accG[bestCluster] += g
      accB[bestCluster] += b
      counts[bestCluster]++
    }

    // Update centroids
    const emptyClusters: number[] = []
    for (let j = 0; j < effectiveK; j++) {
      if (counts[j] === 0) {
        emptyClusters.push(j)
      } else {
        centroidR[j] = accR[j] / counts[j]
        centroidG[j] = accG[j] / counts[j]
        centroidB[j] = accB[j] / counts[j]
      }
    }

    // Recover empty clusters
    for (const j of emptyClusters) {
      centroidR[j] = pixels[maxMinDistIdx * 4]
      centroidG[j] = pixels[maxMinDistIdx * 4 + 1]
      centroidB[j] = pixels[maxMinDistIdx * 4 + 2]
    }

    if (changedCount === 0) {
      break
    }
  }

  // Convert centroids to RGBA8
  const centroids: RGBA8[] = []
  for (let i = 0; i < effectiveK; i++) {
    centroids.push({
      r: Math.max(0, Math.min(255, Math.round(centroidR[i]))),
      g: Math.max(0, Math.min(255, Math.round(centroidG[i]))),
      b: Math.max(0, Math.min(255, Math.round(centroidB[i]))),
      a: 255
    })
  }

  return { centroids, assignments }
}

function updateMinDist(
  pixels: Uint8ClampedArray,
  pixelCount: number,
  centroidIndices: number[],
  minDist: Float64Array
): void {
  const lastCentroidIdx = centroidIndices[centroidIndices.length - 1]
  const cr = pixels[lastCentroidIdx * 4]
  const cg = pixels[lastCentroidIdx * 4 + 1]
  const cb = pixels[lastCentroidIdx * 4 + 2]

  for (let i = 0; i < pixelCount; i++) {
    const r = pixels[i * 4]
    const g = pixels[i * 4 + 1]
    const b = pixels[i * 4 + 2]
    const dr = r - cr
    const dg = g - cg
    const db = b - cb
    const dist = dr * dr + dg * dg + db * db
    minDist[i] = Math.min(minDist[i], dist)
  }
}
