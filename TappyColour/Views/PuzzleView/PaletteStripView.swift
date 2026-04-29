import SwiftUI

struct PaletteStripView: View {
    @ObservedObject var session: PaintingSession

    var body: some View {
        VStack {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(0..<session.palette.colours.count, id: \.self) { index in
                        PaletteEntryView(
                            index: index,
                            session: session
                        )
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
        }
        .frame(height: 80)
        .background(.ultraThinMaterial)
    }
}

struct PaletteEntryView: View {
    let index: Int
    @ObservedObject var session: PaintingSession

    var body: some View {
        VStack(spacing: 4) {
            ZStack(alignment: .center) {
                RoundedRectangle(cornerRadius: 8)
                    .fill(session.palette.swiftUIColor(at: index))
                    .frame(width: 44, height: 44)

                Text("\(session.palette.colours[index].number)")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.white)

                if session.grid.unpaintedPerColour[index] == 0 {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(.white)
                }
            }
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(
                        session.selectedPaletteIndex == index ? Color.blue : Color.clear,
                        lineWidth: 3
                    )
            )

            let painted = session.paintedCells(forIndex: index)
            let total = session.totalCells(forIndex: index)
            Text("\(painted)/\(total)")
                .font(.system(size: 10, weight: .regular))
                .foregroundStyle(.secondary)
        }
        .frame(width: 64)
        .onTapGesture {
            session.selectedPaletteIndex = index
        }
    }
}

#Preview {
    let palette = Palette(
        colours: [
            PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
            PaletteColour(rgba: RGBA8(r: 0, g: 255, b: 0), number: 2),
            PaletteColour(rgba: RGBA8(r: 0, g: 0, b: 255), number: 3)
        ],
        originalColours: [
            PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
            PaletteColour(rgba: RGBA8(r: 0, g: 255, b: 0), number: 2),
            PaletteColour(rgba: RGBA8(r: 0, g: 0, b: 255), number: 3)
        ]
    )
    let cells = (0..<100).map { i in
        GridCell(paletteIndex: UInt8(i % 3), painted: i < 50)
    }
    let grid = PixelGrid(columns: 10, rows: 10, cells: cells)
    let artwork = Artwork(
        id: UUID(),
        title: "Test",
        bundledImageName: "img_duck",
        grid: grid,
        palette: palette,
        conversionSettings: ConversionSettings.make(sliderValue: 0.5),
        createdAt: Date(),
        lastModifiedAt: Date(),
        isComplete: false
    )

    let session = PaintingSession(artwork: artwork)
    PaletteStripView(session: session)
}
