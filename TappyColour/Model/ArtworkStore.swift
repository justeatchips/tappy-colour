import CoreData
import Combine

@MainActor
final class ArtworkStore: ObservableObject {
    @Published private(set) var artworks: [Artwork] = []

    private let context: NSManagedObjectContext

    init(context: NSManagedObjectContext) {
        self.context = context
    }

    // MARK: - CRUD Operations

    func fetchAll() {
        let request = NSFetchRequest<NSManagedObject>(entityName: "ArtworkEntity")
        let sortDescriptor = NSSortDescriptor(key: "lastModifiedAt", ascending: false)
        request.sortDescriptors = [sortDescriptor]

        do {
            let entities = try context.fetch(request)
            artworks = entities.compactMap { artworkFromEntity($0) }
        } catch {
            print("Failed to fetch artworks: \(error.localizedDescription)")
            artworks = []
        }
    }

    func save(artwork: Artwork) {
        context.performAndWait {
            let request = NSFetchRequest<NSManagedObject>(entityName: "ArtworkEntity")
            request.predicate = NSPredicate(format: "id == %@", artwork.id as CVarArg)

            do {
                let results = try context.fetch(request)
                let entity: NSManagedObject

                if let existing = results.first {
                    entity = existing
                } else {
                    guard let entityDescription = NSEntityDescription.entity(forEntityName: "ArtworkEntity", in: context) else {
                        print("Failed to get ArtworkEntity description")
                        return
                    }
                    entity = NSManagedObject(entity: entityDescription, insertInto: context)
                }

                // Set all attributes
                entity.setValue(artwork.id, forKey: "id")
                entity.setValue(artwork.title, forKey: "title")
                entity.setValue(artwork.bundledImageName, forKey: "bundledImageName")
                entity.setValue(artwork.createdAt, forKey: "createdAt")
                entity.setValue(artwork.lastModifiedAt, forKey: "lastModifiedAt")
                entity.setValue(artwork.isComplete, forKey: "isComplete")
                entity.setValue(artwork.conversionSettings.sliderValue, forKey: "sliderValue")
                entity.setValue(Int16(artwork.grid.columns), forKey: "gridColumns")
                entity.setValue(Int16(artwork.grid.rows), forKey: "gridRows")

                // Encode paint state: 1 byte per cell (bit 7 = painted, bits 0-6 = palette index)
                var paintStateBytes = [UInt8]()
                for cell in artwork.grid.cells {
                    let byte: UInt8 = (cell.painted ? 0x80 : 0x00) | (cell.paletteIndex & 0x7F)
                    paintStateBytes.append(byte)
                }
                entity.setValue(Data(paintStateBytes), forKey: "paintStateData")

                // Encode palette colours as JSON
                do {
                    let paletteData = try JSONEncoder().encode(artwork.palette.colours)
                    entity.setValue(paletteData, forKey: "paletteData")
                } catch {
                    print("Failed to encode palette: \(error.localizedDescription)")
                    return
                }

                // Encode original palette colours as JSON
                do {
                    let originalPaletteData = try JSONEncoder().encode(artwork.palette.originalColours)
                    entity.setValue(originalPaletteData, forKey: "originalPaletteData")
                } catch {
                    print("Failed to encode original palette: \(error.localizedDescription)")
                    return
                }

                try context.save()
            } catch {
                print("Failed to save artwork: \(error.localizedDescription)")
            }
        }
        fetchAll()
    }

    func delete(artwork: Artwork) {
        context.performAndWait {
            let request = NSFetchRequest<NSManagedObject>(entityName: "ArtworkEntity")
            request.predicate = NSPredicate(format: "id == %@", artwork.id as CVarArg)

            do {
                let results = try context.fetch(request)
                for entity in results {
                    context.delete(entity)
                }
                try context.save()
            } catch {
                print("Failed to delete artwork: \(error.localizedDescription)")
            }
        }
        fetchAll()
    }

    // MARK: - Helper Methods

    private func artworkFromEntity(_ entity: NSManagedObject) -> Artwork? {
        guard let id = entity.value(forKey: "id") as? UUID,
              let title = entity.value(forKey: "title") as? String,
              let bundledImageName = entity.value(forKey: "bundledImageName") as? String,
              let createdAt = entity.value(forKey: "createdAt") as? Date,
              let lastModifiedAt = entity.value(forKey: "lastModifiedAt") as? Date,
              let isComplete = entity.value(forKey: "isComplete") as? Bool,
              let sliderValue = entity.value(forKey: "sliderValue") as? Float,
              let gridColumnsValue = entity.value(forKey: "gridColumns") as? Int16,
              let gridRowsValue = entity.value(forKey: "gridRows") as? Int16,
              let paintStateData = entity.value(forKey: "paintStateData") as? Data,
              let paletteData = entity.value(forKey: "paletteData") as? Data,
              let originalPaletteData = entity.value(forKey: "originalPaletteData") as? Data else {
            return nil
        }

        let gridColumns = Int(gridColumnsValue)
        let gridRows = Int(gridRowsValue)

        // Decode paint state bytes
        let paintBytes = [UInt8](paintStateData)
        var cells: [GridCell] = []
        for byte in paintBytes {
            let painted = (byte & 0x80) != 0
            let paletteIndex = byte & 0x7F
            cells.append(GridCell(paletteIndex: paletteIndex, painted: painted))
        }

        // Validate grid size
        guard cells.count == gridColumns * gridRows else {
            print("Paint state size mismatch: expected \(gridColumns * gridRows), got \(cells.count)")
            return nil
        }

        let grid = PixelGrid(columns: gridColumns, rows: gridRows, cells: cells)

        // Decode palette colours
        guard let paletteColours = try? JSONDecoder().decode([PaletteColour].self, from: paletteData) else {
            print("Failed to decode palette colours")
            return nil
        }

        // Decode original palette colours
        guard let originalPaletteColours = try? JSONDecoder().decode([PaletteColour].self, from: originalPaletteData) else {
            print("Failed to decode original palette colours")
            return nil
        }

        let palette = Palette(colours: paletteColours, originalColours: originalPaletteColours)
        let conversionSettings = ConversionSettings.make(sliderValue: sliderValue)

        return Artwork(
            id: id,
            title: title,
            bundledImageName: bundledImageName,
            grid: grid,
            palette: palette,
            conversionSettings: conversionSettings,
            createdAt: createdAt,
            lastModifiedAt: lastModifiedAt,
            isComplete: isComplete
        )
    }
}
