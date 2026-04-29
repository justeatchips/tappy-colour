import Foundation
import Accelerate

// MARK: - KMeansQuantiser
struct KMeansQuantiser {
    static func quantise(pixels: [RGBA8], k: Int, maxIterations: Int = 20) -> (centroids: [RGBA8], assignments: [Int]) {
        guard !pixels.isEmpty else {
            return (centroids: [], assignments: [])
        }

        let effectiveK = min(k, pixels.count)
        guard effectiveK > 0 else {
            return (centroids: [], assignments: [])
        }

        // MARK: K-means++ Initialization
        var centroids = kmeansppInitialization(pixels: pixels, k: effectiveK)
        var assignments = [Int](repeating: 0, count: pixels.count)

        // MARK: Iterative K-means
        for iteration in 0..<maxIterations {
            let previousAssignments = assignments

            // Assignment step
            assignments = assignPixelsToCentroids(pixels: pixels, centroids: centroids)

            // Check for convergence
            if assignments == previousAssignments {
                break
            }

            // Update step with empty cluster recovery
            centroids = updateCentroids(pixels: pixels, assignments: assignments, k: effectiveK, previousCentroids: centroids)
        }

        return (centroids: centroids, assignments: assignments)
    }

    // MARK: - K-means++ Initialization
    private static func kmeansppInitialization(pixels: [RGBA8], k: Int) -> [RGBA8] {
        var centroids: [RGBA8] = []

        let firstIdx = Int.random(in: 0..<pixels.count)
        centroids.append(pixels[firstIdx])

        while centroids.count < k {
            var minDistances = [Float](repeating: .infinity, count: pixels.count)

            for (pixelIdx, pixel) in pixels.enumerated() {
                var minDist = Float.infinity
                for centroid in centroids {
                    let dist = squaredEuclideanDistance(pixel, centroid)
                    minDist = min(minDist, dist)
                }
                minDistances[pixelIdx] = minDist
            }

            var sumDistances = Float(0)
            for dist in minDistances {
                sumDistances += dist
            }

            guard sumDistances > 0 else {
                let randomIdx = Int.random(in: 0..<pixels.count)
                centroids.append(pixels[randomIdx])
                continue
            }

            var cumulativeDist = Float(0)
            let threshold = Float.random(in: 0..<sumDistances)

            for (pixelIdx, minDist) in minDistances.enumerated() {
                cumulativeDist += minDist
                if cumulativeDist >= threshold {
                    centroids.append(pixels[pixelIdx])
                    break
                }
            }
        }

        return centroids
    }

    // MARK: - Assignment Step
    private static func assignPixelsToCentroids(pixels: [RGBA8], centroids: [RGBA8]) -> [Int] {
        var assignments = [Int](repeating: 0, count: pixels.count)

        for (pixelIdx, pixel) in pixels.enumerated() {
            var minDist = Float.infinity
            var bestCentroid = 0

            for (centroidIdx, centroid) in centroids.enumerated() {
                let dist = squaredEuclideanDistance(pixel, centroid)
                if dist < minDist {
                    minDist = dist
                    bestCentroid = centroidIdx
                }
            }

            assignments[pixelIdx] = bestCentroid
        }

        return assignments
    }

    // MARK: - Update Step
    private static func updateCentroids(pixels: [RGBA8], assignments: [Int], k: Int, previousCentroids: [RGBA8]) -> [RGBA8] {
        var newCentroids: [RGBA8] = []
        var clusterCounts = [Int](repeating: 0, count: k)
        var clusterSumsR = [Float](repeating: 0, count: k)
        var clusterSumsG = [Float](repeating: 0, count: k)
        var clusterSumsB = [Float](repeating: 0, count: k)

        for (pixelIdx, assignment) in assignments.enumerated() {
            let pixel = pixels[pixelIdx]
            clusterCounts[assignment] += 1
            clusterSumsR[assignment] += Float(pixel.r)
            clusterSumsG[assignment] += Float(pixel.g)
            clusterSumsB[assignment] += Float(pixel.b)
        }

        for clusterIdx in 0..<k {
            if clusterCounts[clusterIdx] == 0 {
                newCentroids.append(recoverEmptyCluster(pixels: pixels, assignments: assignments, clusterIdx: clusterIdx, previousCentroids: previousCentroids))
            } else {
                let r = UInt8(clamped: (clusterSumsR[clusterIdx] / Float(clusterCounts[clusterIdx])).rounded())
                let g = UInt8(clamped: (clusterSumsG[clusterIdx] / Float(clusterCounts[clusterIdx])).rounded())
                let b = UInt8(clamped: (clusterSumsB[clusterIdx] / Float(clusterCounts[clusterIdx])).rounded())
                newCentroids.append(RGBA8(r: r, g: g, b: b, a: 255))
            }
        }

        return newCentroids
    }

    // MARK: - Empty Cluster Recovery
    private static func recoverEmptyCluster(pixels: [RGBA8], assignments: [Int], clusterIdx: Int, previousCentroids: [RGBA8]) -> RGBA8 {
        var maxMinDist = Float(0)
        var bestPixelIdx = 0

        for (pixelIdx, pixel) in pixels.enumerated() {
            var minDist = Float.infinity
            for (otherClusterIdx, centroid) in previousCentroids.enumerated() {
                if otherClusterIdx == clusterIdx { continue }
                let dist = squaredEuclideanDistance(pixel, centroid)
                minDist = min(minDist, dist)
            }

            if minDist > maxMinDist {
                maxMinDist = minDist
                bestPixelIdx = pixelIdx
            }
        }

        return pixels[bestPixelIdx]
    }

    // MARK: - Distance Calculation
    private static func squaredEuclideanDistance(_ a: RGBA8, _ b: RGBA8) -> Float {
        let dr = Float(a.r) - Float(b.r)
        let dg = Float(a.g) - Float(b.g)
        let db = Float(a.b) - Float(b.b)
        return dr * dr + dg * dg + db * db
    }
}

// MARK: - UInt8 Helper
private extension UInt8 {
    init(clamped value: Float) {
        let clamped = max(0.0, min(255.0, value))
        self = UInt8(clamped)
    }
}
