import XCTest

final class KMeansQuantiserTests: XCTestCase {

    func testUniformImage() {
        let sourceColour = RGBA8(r: 128, g: 64, b: 32)
        let pixels = (0..<10).map { _ in sourceColour }

        let result = KMeansQuantiser.quantise(pixels: pixels, k: 2)

        XCTAssertEqual(result.centroids.count, 2)
        for centroid in result.centroids {
            let dr = abs(Int(centroid.r) - 128)
            let dg = abs(Int(centroid.g) - 64)
            let db = abs(Int(centroid.b) - 32)
            XCTAssertLessThan(dr + dg + db, 20)
        }
    }

    func testTwoColourImage() {
        var pixels: [RGBA8] = []
        for _ in 0..<5 {
            pixels.append(RGBA8(r: 255, g: 0, b: 0))
        }
        for _ in 0..<5 {
            pixels.append(RGBA8(r: 0, g: 0, b: 255))
        }

        let result = KMeansQuantiser.quantise(pixels: pixels, k: 2)

        XCTAssertEqual(result.centroids.count, 2)

        var hasRed = false
        var hasBlue = false

        for centroid in result.centroids {
            if centroid.r > 200 && centroid.b < 100 {
                hasRed = true
            }
            if centroid.b > 200 && centroid.r < 100 {
                hasBlue = true
            }
        }

        XCTAssertTrue(hasRed)
        XCTAssertTrue(hasBlue)
    }

    func testEmptyClusterRecovery() {
        var pixels: [RGBA8] = []
        pixels.append(RGBA8(r: 255, g: 0, b: 0))
        pixels.append(RGBA8(r: 0, g: 255, b: 0))
        pixels.append(RGBA8(r: 0, g: 0, b: 255))

        let result = KMeansQuantiser.quantise(pixels: pixels, k: 4)

        XCTAssertEqual(result.centroids.count, 4)
        XCTAssertEqual(result.assignments.count, 3)
    }

    func testPerformance() {
        var pixels: [RGBA8] = []
        for _ in 0..<6400 {
            pixels.append(RGBA8(
                r: UInt8.random(in: 0...255),
                g: UInt8.random(in: 0...255),
                b: UInt8.random(in: 0...255)
            ))
        }

        measure {
            _ = KMeansQuantiser.quantise(pixels: pixels, k: 24)
        }
    }

    func testAssignmentLengthMatchesInput() {
        let pixels = (0..<100).map { _ in
            RGBA8(r: UInt8.random(in: 0...255), g: UInt8.random(in: 0...255), b: UInt8.random(in: 0...255))
        }

        let result = KMeansQuantiser.quantise(pixels: pixels, k: 5)

        XCTAssertEqual(result.assignments.count, pixels.count)
    }

    func testAssignmentBoundsAreValid() {
        let pixels = (0..<50).map { _ in
            RGBA8(r: UInt8.random(in: 0...255), g: UInt8.random(in: 0...255), b: UInt8.random(in: 0...255))
        }

        let result = KMeansQuantiser.quantise(pixels: pixels, k: 8)

        for assignment in result.assignments {
            XCTAssertGreaterThanOrEqual(assignment, 0)
            XCTAssertLessThan(assignment, 8)
        }
    }

    func testCentroidCountEqualsK() {
        let pixels = (0..<100).map { _ in
            RGBA8(r: UInt8.random(in: 0...255), g: UInt8.random(in: 0...255), b: UInt8.random(in: 0...255))
        }

        let result = KMeansQuantiser.quantise(pixels: pixels, k: 16)

        XCTAssertEqual(result.centroids.count, 16)
    }
}
