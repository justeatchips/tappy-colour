import SwiftUI

struct DifficultyPickerView: View {
    let imageName: String
    let title: String

    @EnvironmentObject var artworkStore: ArtworkStore
    @Environment(\.dismiss) var dismiss

    @State private var sliderValue: Float = 0.0
    @State private var isConverting = false
    @State private var conversionError: String? = nil
    @State private var selectedUIImage: UIImage? = nil

    @Binding var createdArtwork: Artwork?

    var body: some View {
        NavigationStack {
            ZStack {
                Color(UIColor.systemBackground)
                    .ignoresSafeArea()

                VStack(spacing: 20) {
                    Text(title)
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.blue)

                    if let image = selectedUIImage {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFit()
                            .frame(height: 200)
                            .cornerRadius(12)
                    } else {
                        Image(imageName)
                            .resizable()
                            .scaledToFit()
                            .frame(height: 200)
                            .cornerRadius(12)
                    }

                    VStack(spacing: 16) {
                        Text("Difficulty")
                            .font(.system(size: 16, weight: .semibold))
                            .frame(maxWidth: .infinity, alignment: .leading)

                        ChickRowView(sliderValue: sliderValue)

                        Slider(value: $sliderValue, in: 0...1)
                            .tint(.blue)
                    }
                    .padding(.horizontal, 16)

                    Spacer()

                    if let error = conversionError {
                        Text("Error: \(error)")
                            .font(.system(size: 14))
                            .foregroundStyle(.red)
                            .padding()
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(8)
                    }

                    Button(action: startColouring) {
                        if isConverting {
                            HStack(spacing: 8) {
                                ProgressView()
                                    .tint(.white)
                                Text("Converting...")
                            }
                        } else {
                            Text("Start Colouring")
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.blue)
                    .foregroundStyle(.white)
                    .font(.system(size: 16, weight: .semibold))
                    .cornerRadius(12)
                    .disabled(isConverting)
                    .padding(.horizontal, 16)
                }
                .padding(.vertical, 24)
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                sliderValue = UserDefaults.standard.float(forKey: "lastDifficultySliderValue")
                loadBundledImage()
            }
        }
    }

    private func loadBundledImage() {
        selectedUIImage = UIImage(named: imageName)
    }

    private func startColouring() {
        isConverting = true
        conversionError = nil

        Task {
            do {
                let image: UIImage
                if let uiImage = selectedUIImage {
                    image = uiImage
                } else if let bundledImage = UIImage(named: imageName) {
                    image = bundledImage
                } else {
                    throw ConversionError.imageRenderingFailed
                }

                let settings = ConversionSettings.make(sliderValue: sliderValue)
                UserDefaults.standard.set(sliderValue, forKey: "lastDifficultySliderValue")

                let converter = ImageConverter()
                let result = try await converter.convert(image: image, settings: settings)

                let artwork = Artwork(
                    id: UUID(),
                    title: title,
                    bundledImageName: imageName,
                    grid: result.grid,
                    palette: result.palette,
                    conversionSettings: settings,
                    createdAt: Date(),
                    lastModifiedAt: Date(),
                    isComplete: false
                )

                await MainActor.run {
                    artworkStore.save(artwork: artwork)
                    createdArtwork = artwork
                    isConverting = false
                }
            } catch {
                await MainActor.run {
                    conversionError = error.localizedDescription
                    isConverting = false
                }
            }
        }
    }
}

#Preview {
    @State var createdArtwork: Artwork?
    return DifficultyPickerView(
        imageName: "img_duck",
        title: "Duck",
        createdArtwork: $createdArtwork
    )
    .environmentObject(ArtworkStore(context: PersistenceController.shared.container.viewContext))
}
