import SwiftUI

struct GridCanvasView: View {
    @ObservedObject var session: PaintingSession
    let cellSize: CGFloat

    @State private var dragStarted = false

    var body: some View {
        let width = cellSize * CGFloat(session.grid.columns)
        let height = cellSize * CGFloat(session.grid.rows)

        Canvas { context, _ in
            // Pass 1: Draw cells with background colours
            for row in 0..<session.grid.rows {
                for col in 0..<session.grid.columns {
                    let cell = session.grid.cell(col: col, row: row)
                    let rect = CGRect(
                        x: CGFloat(col) * cellSize,
                        y: CGFloat(row) * cellSize,
                        width: cellSize,
                        height: cellSize
                    )

                    let fillColor: Color = cell.painted
                        ? session.palette.swiftUIColor(at: Int(cell.paletteIndex))
                        : Color(white: 0.96)

                    context.fill(
                        Path(roundedRect: rect, cornerRadius: 0),
                        with: .color(fillColor)
                    )

                    // Draw border
                    context.stroke(
                        Path(roundedRect: rect, cornerRadius: 0),
                        with: .color(Color(white: 0.9)),
                        lineWidth: 1
                    )
                }
            }

            // Pass 2: Draw numbers on unpainted cells
            if session.numbersVisible {
                for row in 0..<session.grid.rows {
                    for col in 0..<session.grid.columns {
                        let cell = session.grid.cell(col: col, row: row)
                        if !cell.painted {
                            let centerX = CGFloat(col) * cellSize + cellSize / 2
                            let centerY = CGFloat(row) * cellSize + cellSize / 2
                            let point = CGPoint(x: centerX, y: centerY)

                            let number = session.palette.colours[Int(cell.paletteIndex)].number

                            var textContext = context
                            textContext.draw(
                                Text("\(number)")
                                    .font(.system(size: max(8, cellSize * 0.45), weight: .bold))
                                    .foregroundStyle(.gray),
                                at: point,
                                anchor: .center
                            )
                        }
                    }
                }
            }
        }
        .frame(width: width, height: height)
        .onTapGesture(coordinateSpace: .local) { location in
            let col = Int(location.x / cellSize)
            let row = Int(location.y / cellSize)
            guard col >= 0, col < session.grid.columns,
                  row >= 0, row < session.grid.rows else { return }

            session.tap(col: col, row: row)
        }
        .gesture(
            DragGesture(minimumDistance: 0, coordinateSpace: .local)
                .onChanged { value in
                    let col = Int(value.location.x / cellSize)
                    let row = Int(value.location.y / cellSize)

                    if !dragStarted {
                        dragStarted = true
                        session.dragBegan()
                    }

                    guard col >= 0, col < session.grid.columns,
                          row >= 0, row < session.grid.rows else { return }

                    session.dragMoved(col: col, row: row)
                }
                .onEnded { _ in
                    session.dragEnded()
                    dragStarted = false
                }
        )
    }
}

#Preview {
    let palette = Palette(
        colours: [
            PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
            PaletteColour(rgba: RGBA8(r: 0, g: 255, b: 0), number: 2)
        ],
        originalColours: [
            PaletteColour(rgba: RGBA8(r: 255, g: 0, b: 0), number: 1),
            PaletteColour(rgba: RGBA8(r: 0, g: 255, b: 0), number: 2)
        ]
    )
    let cells = (0..<100).map { i in
        GridCell(paletteIndex: UInt8(i % 2), painted: false)
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
    GridCanvasView(session: session, cellSize: 30)
}
