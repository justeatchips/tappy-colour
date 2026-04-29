import SwiftUI

struct ConfettiParticle {
    var x: CGFloat
    var y: CGFloat
    var vx: CGFloat
    var vy: CGFloat
    var colour: Color
    var rotation: Double
    var opacity: Double
}

struct ConfettiView: View {
    @State private var particles: [ConfettiParticle] = []
    @State private var previousDate = Date()

    private let colours: [Color] = [.red, .blue, .green, .yellow, .orange, .pink, .purple, .cyan]

    var body: some View {
        GeometryReader { geo in
            TimelineView(.animation(minimumInterval: 1.0 / 60.0, paused: particles.isEmpty)) { timelineContext in
                Canvas { context, _ in
                    for particle in particles where particle.opacity > 0 {
                        var ctx = context
                        ctx.opacity = particle.opacity
                        let rect = CGRect(x: particle.x - 4, y: particle.y - 4, width: 8, height: 8)
                        ctx.fill(Path(rect), with: .color(particle.colour))
                    }
                }
                .onChange(of: timelineContext.date) { newDate in
                    let dt = min(newDate.timeIntervalSince(previousDate), 0.05)
                    previousDate = newDate
                    tick(deltaTime: dt)
                }
            }
            .onAppear {
                previousDate = Date()
                spawnParticles(width: geo.size.width, height: geo.size.height)
            }
        }
    }

    private func spawnParticles(width: CGFloat, height: CGFloat) {
        particles = (0..<40).map { _ in
            ConfettiParticle(
                x: CGFloat.random(in: 0..<max(width, 1)),
                y: height * 0.3,
                vx: CGFloat.random(in: -120...120),
                vy: CGFloat.random(in: -500...(-200)),
                colour: colours.randomElement() ?? .red,
                rotation: Double.random(in: 0..<360),
                opacity: 1.0
            )
        }
    }

    private func tick(deltaTime: Double) {
        guard !particles.isEmpty else { return }
        var updated = particles
        for i in updated.indices {
            updated[i].x += updated[i].vx * deltaTime
            updated[i].y += updated[i].vy * deltaTime
            updated[i].vy += 500 * deltaTime   // gravity
            updated[i].rotation += 200 * deltaTime
            updated[i].opacity = max(0, updated[i].opacity - 0.35 * deltaTime)
        }
        updated.removeAll { $0.opacity <= 0 }
        particles = updated
    }
}

#Preview {
    ConfettiView()
        .frame(height: 300)
        .background(Color.gray.opacity(0.2))
}
