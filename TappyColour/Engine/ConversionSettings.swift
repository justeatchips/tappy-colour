import Foundation

struct ConversionSettings: Equatable, Codable {
    var sliderValue: Float
    var gridSize: Int
    var paletteSize: Int

    static func make(sliderValue: Float) -> ConversionSettings {
        let clamped = max(0.0, min(1.0, sliderValue))
        let gridSize = Int((16 + clamped * Float(80 - 16)).rounded())
        let paletteSize = Int((6 + clamped * Float(24 - 6)).rounded())
        return ConversionSettings(
            sliderValue: clamped,
            gridSize: max(16, min(80, gridSize)),
            paletteSize: max(6, min(24, paletteSize))
        )
    }
}
