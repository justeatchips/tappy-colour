import SwiftUI

@main
struct TappyColourApp: App {
    let persistenceController = PersistenceController.shared
    @StateObject private var artworkStore: ArtworkStore

    init() {
        let store = ArtworkStore(context: PersistenceController.shared.container.viewContext)
        _artworkStore = StateObject(wrappedValue: store)
    }

    var body: some Scene {
        WindowGroup {
            HomeScreenView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
                .environmentObject(artworkStore)
                .onAppear { artworkStore.fetchAll() }
        }
    }
}
