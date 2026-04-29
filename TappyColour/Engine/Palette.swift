import Foundation
import SwiftUI

// MARK: - PaletteColour
struct PaletteColour: Equatable, Codable {
    var rgba: RGBA8
    let number: Int

    init(rgba: RGBA8, number: Int) {
        self.rgba = rgba
        self.number = number
    }
}

// MARK: - Palette
struct Palette: Equatable, Codable {
    var colours: [PaletteColour]
    let originalColours: [PaletteColour]

    init(colours: [PaletteColour], originalColours: [PaletteColour]) {
        self.colours = colours
        self.originalColours = originalColours
    }

    // MARK: Colour Manipulation
    mutating func replaceColour(at index: Int, with rgba: RGBA8) {
        guard index >= 0, index < colours.count else { return }
        colours[index].rgba = rgba
    }

    mutating func reset() {
        colours = originalColours
    }

    // MARK: SwiftUI Integration
    func swiftUIColor(at index: Int) -> Color {
        guard index >= 0, index < colours.count else {
            return Color.clear
        }
        let colour = colours[index]
        let red = Double(colour.rgba.r) / 255.0
        let green = Double(colour.rgba.g) / 255.0
        let blue = Double(colour.rgba.b) / 255.0
        let alpha = Double(colour.rgba.a) / 255.0
        return Color(red: red, green: green, blue: blue, opacity: alpha)
    }
}
