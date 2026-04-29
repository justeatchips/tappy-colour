import XCTest
@testable import TappyColour

final class KMeansQuantiserTests: XCTestCase {

    func testUniformImage() {
        let colour = RGBA8(r: 200, g: 100, b: 50)
        let pixels = Array(repeating: colour, count: 10)
        let result = KMeansQuantiser.quantise(pixels: pixels, k: 2)
        // With all identical pixels, both centroids should be very close to the source colour
        for centroid in result.centroids {
            XCTAssertEqual(Int(centroid.r), 200, accuracy: 5)
            XCTAssertEqual(Int(centroid.g), 100, accuracy: 5)
            XCTAssertEqual(Int(centroid.b), 50, accuracy: 5)
        }
    }

    func testTwoColourImage() {
        let red = RGBA8(r: 255, g: 0, b: 0)
        let blue = RGBA8(r: 0, g: 0, b: 255)
        let pixels = Array(repeating: red, count: 5) + Array(repeating: blue, count: 5)
        let result = KMeansQuantiser.quantise(pixels: pixels, k: 2)
        XCTAssertEqual(result.centroids.count, 2)
        // Centroids should be close to pure red and pure blue
        let centroidReds = result.centroids.map { Int($0.r) }
        let centroidBlues = result.centroids.map { Int($0.b) }
        XCTAssertTrue(centroidReds.contains(where: { $0 > 200 }), "Expected a red centroid")
        XCTAssertTrue(centroidBlues.contains(where: { $0 > 200 }), "Expected a blue centroid")
    }

    func testEmptyClusterRecovery() {
        // 3 distinct colours, k=4 — forces empty cluster recovery
        let pixels: [RGBA8] = [
            RGBA8(r: 255, g: 0, b: 0),
            RGBA8(r: 0, g: 255, b: 0),
            RGBA8(r: 0, g: 0, b: 255)
        ]
        let result = KMeansQuantiser.quantise(pixels: pixels, k: 4)
        // k is clamped to pixels.count = 3, so we expect 3 centroids
        XCTAssertEqual(result.centroids.count, min(4, pixels.count))
        XCTAssertFalse(result.centroids.isEmpty)
    }

    func testPerformance() {
        var rng = SystemRandomNumberGenerator()
        let pixels = (0..<6400).map { _ in
            RGBA8(r: .random(in: 0...255, using: &rng),
                  g: .random(in: 0...255, using: &rng),
                  b: .random(in: 0...255, using: &rng))
        }
        let start = Date()
        _ = KMeansQuantiser.quantise(pixels: pixels, k: 24)
        let elapsed = Date().timeIntervalSince(start)
        XCTAssertLessThan(elapsed, 2.0, "Quantisation should complete in under 2 seconds")
    }

    func testAssignmentLengthMatchesInput() {
        let pixels = (0..<50).map { _ in RGBA8(r: .random(in: 0...255), g: .random(in: 0...255), b: .random(in: 0...255)) }
        let result = KMeansQuantiser.quantise(pixels: pixels, k: 5)
        XCTAssertEqual(result.assignments.count, pixels.count)
    }

    func testAssignmentBoundsAreValid() {
        let pixels = (0..<30).map { _ in RGBA8(r: .random(in: 0...255), g: .random(in: 0...255), b: .random(in: 0...255)) }
        let k = 6
        let result = KMeansQuantiser.quantise(pixels: pixels, k: k)
        for assignment in result.assignments {
            XCTAssertGreaterThanOrEqual(assignment, 0)
            XCTAssertLessThan(assignment, result.centroids.count)
        }
    }

    func testCentroidCountEqualsK() {
        let pixels = (0..<20).map { i in RGBA8(r: UInt8(i * 12), g: UInt8(i * 5), b: UInt8(i * 3)) }
        let k = 4
        let result = KMeansQuantiser.quantise(pixels: pixels, k: k)
        XCTAssertEqual(result.centroids.count, min(k, pixels.count))
    }
}
