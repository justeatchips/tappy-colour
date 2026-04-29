import SwiftUI

struct PuzzleContainerView: View {
    let artwork: Artwork

    @EnvironmentObject var artworkStore: ArtworkStore
    @Environment(\.dismiss) var dismiss

    @StateObject private var session: PaintingSession
    @State private var scale: CGFloat = 1.0
    @State private var offset: CGSize = .zero

    init(artwork: Artwork) {
        self.artwork = artwork
        _session = StateObject(wrappedValue: PaintingSession(artwork: artwork))
    }

    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                GeometryReader { geometry in
                    ZStack {
                        Color(UIColor.systemBackground)

                        let cellSize = min(geometry.size.width, geometry.size.height) / CGFloat(session.grid.columns)

                        GridCanvasView(session: session, cellSize: cellSize)
                            .frame(
                                width: cellSize * CGFloat(session.grid.columns),
                                height: cellSize * CGFloat(session.grid.rows)
                            )
                            .position(
                                x: geometry.size.width / 2,
                                y: geometry.size.height / 2
                            )
                            .scaleEffect(scale)
                            .offset(offset)
                            .gesture(
                                MagnificationGesture()
                                    .onChanged { value in
                                        scale = max(1.0, min(6.0, value))
                                    }
                            )
                    }
                }

                PaletteStripView(session: session)
            }

            if session.isComplete {
                CompletionOverlayView(session: session) {
                    dismiss()
                }
            }
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { dismiss() }) {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                }
            }

            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { session.undo() }) {
                    Image(systemName: "arrow.uturn.left")
                }
            }
        }
        .navigationBarBackButtonHidden(true)
        .onAppear {
            session.onNeedsSave = { session in
                let updated = currentArtwork()
                artworkStore.save(artwork: updated)
            }
        }
    }

    private func currentArtwork() -> Artwork {
        var updated = artwork
        updated.grid = session.grid
        updated.palette = session.palette
        updated.isComplete = session.isComplete
        updated.lastModifiedAt = Date()
        return updated
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

    NavigationStack {
        PuzzleContainerView(artwork: artwork)
            .environmentObject(ArtworkStore(context: PersistenceController.shared.container.viewContext))
    }
}
