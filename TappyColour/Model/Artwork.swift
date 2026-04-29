import Foundation

struct Artwork: Identifiable, Equatable {
    let id: UUID
    var title: String
    var bundledImageName: String    // e.g. "img_duck" — asset catalog name
    var grid: PixelGrid
    var palette: Palette
    var conversionSettings: ConversionSettings
    var createdAt: Date
    var lastModifiedAt: Date
    var isComplete: Bool            // mirrors grid.isComplete, stored for home screen queries
}
