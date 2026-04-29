import type { RGBA8 } from './types'

export interface PaletteColour {
  rgba: RGBA8
  number: number  // 1-based display label
}

export class Palette {
  colours: PaletteColour[]
  readonly originalColours: PaletteColour[]

  constructor(colours: PaletteColour[]) {
    this.colours = colours.map(c => ({ ...c, rgba: { ...c.rgba } }))
    this.originalColours = colours.map(c => ({ ...c, rgba: { ...c.rgba } }))
  }

  replaceColour(index: number, rgba: RGBA8): void {
    if (index >= 0 && index < this.colours.length) {
      this.colours[index] = { ...this.colours[index], rgba: { ...rgba } }
    }
  }

  reset(): void {
    this.colours = this.originalColours.map(c => ({ ...c, rgba: { ...c.rgba } }))
  }

  cssString(index: number): string {
    const c = this.colours[index]
    if (!c) return '#f5f5f5'
    return `rgb(${c.rgba.r},${c.rgba.g},${c.rgba.b})`
  }

  toJSON(): PaletteColour[] {
    return this.colours.map(c => ({ ...c, rgba: { ...c.rgba } }))
  }

  static fromJSON(data: PaletteColour[]): Palette {
    return new Palette(data)
  }
}
