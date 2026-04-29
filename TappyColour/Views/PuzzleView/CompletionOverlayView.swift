import SwiftUI

struct CompletionOverlayView: View {
    @ObservedObject var session: PaintingSession
    var onDismiss: () -> Void

    var body: some View {
        ZStack {
            if session.isComplete {
                Color.black
                    .opacity(0.4)
                    .ignoresSafeArea()

                VStack(spacing: 20) {
                    VStack(spacing: 16) {
                        Text("You did it! 🎉")
                            .font(.system(size: 42, weight: .bold))
                            .foregroundStyle(.white)
                            .multilineTextAlignment(.center)

                        ConfettiView()
                            .frame(height: 100)
                    }

                    Button(action: onDismiss) {
                        Text("Back to Home")
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.blue)
                            .foregroundStyle(.white)
                            .font(.system(size: 16, weight: .semibold))
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 40)
                }
                .transition(.opacity)
            }
        }
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
    let cells = (0..<100).map { _ in
        GridCell(paletteIndex: 0, painted: true)
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
        isComplete: true
    )

    let session = PaintingSession(artwork: artwork)

    ZStack {
        Color.gray
        CompletionOverlayView(session: session) {
            print("Dismissed")
        }
    }
}
