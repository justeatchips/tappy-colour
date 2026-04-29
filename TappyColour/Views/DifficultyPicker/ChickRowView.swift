import SwiftUI

struct ChickRowView: View {
    let sliderValue: Float

    var chickCount: Int {
        max(1, Int(1 + sliderValue * 9))
    }

    var body: some View {
        HStack(spacing: 12) {
            ForEach(0..<chickCount, id: \.self) { _ in
                Image("chick")
                    .resizable()
                    .frame(width: 32, height: 32)
                    .interpolation(.none)
            }
            Spacer()
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: chickCount)
    }
}

#Preview {
    VStack(spacing: 20) {
        ChickRowView(sliderValue: 0.0)
        ChickRowView(sliderValue: 0.5)
        ChickRowView(sliderValue: 1.0)
    }
    .padding()
}
