import Foundation
import UIKit
import CoreGraphics

// MARK: - ConversionError
enum ConversionError: Error {
    case imageTooSmall
    case quantisationFailed
    case imageRenderingFailed
}

// MARK: - ImageConverter
actor ImageConverter {
    func convert(image: UIImage, settings: ConversionSettings) async throws -> (grid: PixelGrid, palette: Palette) {
        let resizedPixels = try resizeImage(image, to: settings.gridSize)
        let quantisationResult = KMeansQuantiser.quantise(pixels: resizedPixels, k: settings.paletteSize)

        guard !quantisationResult.centroids.isEmpty else {
            throw ConversionError.quantisationFailed
        }

        let palette = buildPalette(from: quantisationResult.centroids)
        let grid = buildPixelGrid(
            size: settings.gridSize,
            assignments: quantisationResult.assignments
        )

        return (grid: grid, palette: palette)
    }

    // MARK: - Image Resizing

    private func resizeImage(_ image: UIImage, to gridSize: Int) throws -> [RGBA8] {
        guard let cgImage = image.cgImage else {
            throw ConversionError.imageRenderingFailed
        }

        let sourceWidth = CGFloat(cgImage.width)
        let sourceHeight = CGFloat(cgImage.height)
        guard sourceWidth >= 1, sourceHeight >= 1 else {
            throw ConversionError.imageTooSmall
        }

        // Centre-crop to square aspect fill, then scale to gridSize
        let cropRect = aspectFillCropRect(sourceWidth: sourceWidth, sourceHeight: sourceHeight)
        guard let croppedCGImage = cgImage.cropping(to: cropRect) else {
            throw ConversionError.imageRenderingFailed
        }

        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let context = CGContext(
            data: nil,
            width: gridSize,
            height: gridSize,
            bitsPerComponent: 8,
            bytesPerRow: gridSize * 4,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            throw ConversionError.imageRenderingFailed
        }

        // CGContext origin is bottom-left; flip so the drawn image is not upside down
        context.translateBy(x: 0, y: CGFloat(gridSize))
        context.scaleBy(x: 1, y: -1)
        context.draw(croppedCGImage, in: CGRect(x: 0, y: 0, width: gridSize, height: gridSize))

        guard let pixelData = context.data else {
            throw ConversionError.imageRenderingFailed
        }

        return extractRGBA8(from: pixelData, width: gridSize, height: gridSize)
    }

    // MARK: - Aspect Fill Crop

    private func aspectFillCropRect(sourceWidth: CGFloat, sourceHeight: CGFloat) -> CGRect {
        let side = min(sourceWidth, sourceHeight)
        let x = (sourceWidth - side) / 2
        let y = (sourceHeight - side) / 2
        return CGRect(x: x, y: y, width: side, height: side)
    }

    // MARK: - Pixel Extraction

    private func extractRGBA8(from pixelData: UnsafeMutableRawPointer, width: Int, height: Int) -> [RGBA8] {
        let buffer = pixelData.assumingMemoryBound(to: UInt8.self)
        let bytesPerPixel = 4
        var pixels = [RGBA8]()
        pixels.reserveCapacity(width * height)

        for y in 0..<height {
            for x in 0..<width {
                let offset = (y * width + x) * bytesPerPixel
                let r = buffer[offset]
                let g = buffer[offset + 1]
                let b = buffer[offset + 2]
                let alpha = buffer[offset + 3]
                // De-premultiply and force alpha to 255 — source images are fully opaque
                pixels.append(RGBA8(
                    r: dePremultiply(channel: r, alpha: alpha),
                    g: dePremultiply(channel: g, alpha: alpha),
                    b: dePremultiply(channel: b, alpha: alpha),
                    a: 255
                ))
            }
        }
        return pixels
    }

    // MARK: - Alpha De-premultiplication

    private func dePremultiply(channel: UInt8, alpha: UInt8) -> UInt8 {
        guard alpha > 0 else { return 0 }
        let result = Float(channel) / (Float(alpha) / 255.0)
        return UInt8(max(0, min(255, result.rounded())))
    }

    // MARK: - Palette Building

    private func buildPalette(from centroids: [RGBA8]) -> Palette {
        let colours = centroids.enumerated().map { index, rgba in
            PaletteColour(rgba: rgba, number: index + 1)
        }
        return Palette(colours: colours, originalColours: colours)
    }

    // MARK: - Grid Building

    private func buildPixelGrid(size: Int, assignments: [Int]) -> PixelGrid {
        let cells = assignments.map { assignment in
            // assignment is always in [0, paletteSize-1] (≤ 23), safe to cast
            GridCell(paletteIndex: UInt8(assignment), painted: false)
        }
        return PixelGrid(columns: size, rows: size, cells: cells)
    }
}
