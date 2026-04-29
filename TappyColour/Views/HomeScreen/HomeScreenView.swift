import SwiftUI

struct HomeScreenView: View {
    @EnvironmentObject var artworkStore: ArtworkStore

    let bundledImages: [(name: String, title: String)] = [
        ("img_duck", "Duck"),
        ("img_cat", "Cat"),
        ("img_rocket", "Rocket"),
        ("img_flower", "Flower"),
        ("img_fish", "Fish")
    ]

    @State private var showDifficultyPicker = false
    @State private var selectedImageName: String? = nil
    @State private var selectedArtwork: Artwork? = nil
    @State private var createdArtwork: Artwork? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color(UIColor.systemBackground)
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    Text("Tappy Colour")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.blue)
                        .padding(.vertical, 20)

                    GeometryReader { geometry in
                        let isPortrait = geometry.size.width < 768
                        let columnCount = isPortrait ? 2 : 3

                        LazyVGrid(
                            columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: columnCount),
                            spacing: 16
                        ) {
                            ForEach(bundledImages, id: \.name) { image in
                                Button {
                                    handleTap(imageName: image.name)
                                } label: {
                                    ArtworkThumbnailView(
                                        imageName: image.name,
                                        title: image.title,
                                        artwork: existingArtwork(for: image.name)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(20)
                    }
                }
            }
            .navigationDestination(item: $selectedArtwork) { artwork in
                PuzzleContainerView(artwork: artwork)
            }
            .sheet(isPresented: $showDifficultyPicker) {
                if let imageName = selectedImageName,
                   let image = bundledImages.first(where: { $0.name == imageName }) {
                    DifficultyPickerView(
                        imageName: imageName,
                        title: image.title,
                        createdArtwork: $createdArtwork
                    )
                }
            }
            .onChange(of: createdArtwork) { newValue in
                if let artwork = newValue {
                    showDifficultyPicker = false
                    createdArtwork = nil
                    selectedArtwork = artwork
                }
            }
        }
    }

    private func handleTap(imageName: String) {
        if let existing = existingArtwork(for: imageName) {
            selectedArtwork = existing
        } else {
            selectedImageName = imageName
            showDifficultyPicker = true
        }
    }

    private func existingArtwork(for imageName: String) -> Artwork? {
        artworkStore.artworks.first { $0.bundledImageName == imageName }
    }
}

#Preview {
    HomeScreenView()
        .environmentObject(ArtworkStore(context: PersistenceController.shared.container.viewContext))
}
