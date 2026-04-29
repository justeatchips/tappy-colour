import SwiftUI

struct ArtworkThumbnailView: View {
    let imageName: String
    let title: String
    let artwork: Artwork?

    var body: some View {
        VStack(spacing: 12) {
            ZStack(alignment: .topTrailing) {
                Image(imageName)
                    .resizable()
                    .scaledToFill()
                    .clipped()
                    .aspectRatio(1, contentMode: .fill)
                    .frame(maxWidth: .infinity)

                if let artwork = artwork, artwork.isComplete {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 28))
                        .foregroundStyle(.green)
                        .padding(8)
                }
            }
            .frame(maxWidth: .infinity)
            .aspectRatio(1, contentMode: .fit)
            .background(Color(UIColor.systemGray5))
            .cornerRadius(16)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 16, weight: .semibold))
                    .lineLimit(1)

                if let artwork = artwork {
                    let totalCells = artwork.grid.columns * artwork.grid.rows
                    let paintedCells = totalCells - artwork.grid.unpaintedCount
                    let percentage = totalCells > 0 ? Int((Double(paintedCells) / Double(totalCells)) * 100) : 0

                    Text("\(percentage)% done")
                        .font(.system(size: 13, weight: .regular))
                        .foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 8)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    let artwork = Artwork(
        id: UUID(),
        title: "Duck",
        bundledImageName: "img_duck",
        grid: PixelGrid(columns: 20, rows: 20, cells: Array(repeating: GridCell(paletteIndex: 0, painted: false), count: 400)),
        palette: Palette(colours: [], originalColours: []),
        conversionSettings: ConversionSettings.make(sliderValue: 0.5),
        createdAt: Date(),
        lastModifiedAt: Date(),
        isComplete: false
    )

    VStack {
        ArtworkThumbnailView(imageName: "img_duck", title: "Duck", artwork: artwork)
        ArtworkThumbnailView(imageName: "img_cat", title: "Cat", artwork: nil)
    }
    .padding()
}
