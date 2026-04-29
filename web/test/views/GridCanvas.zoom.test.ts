import { describe, it, expect } from 'vitest'

describe('GridCanvas zoom coordinate math', () => {
  it('cellAt at scale=1 maps correctly', () => {
    const cellSize = 10, scale = 1, panX = 5, panY = 5
    const toCell = (cx: number, cy: number) => ({
      col: Math.floor((cx - panX) / (cellSize * scale)),
      row: Math.floor((cy - panY) / (cellSize * scale)),
    })
    expect(toCell(5, 5)).toEqual({ col: 0, row: 0 })
    expect(toCell(14, 14)).toEqual({ col: 0, row: 0 })
    expect(toCell(15, 15)).toEqual({ col: 1, row: 1 })
  })

  it('cellAt at scale=2 maps correctly', () => {
    const cellSize = 10, scale = 2, panX = 0, panY = 0
    const toCell = (cx: number, cy: number) => ({
      col: Math.floor((cx - panX) / (cellSize * scale)),
      row: Math.floor((cy - panY) / (cellSize * scale)),
    })
    expect(toCell(0, 0)).toEqual({ col: 0, row: 0 })
    expect(toCell(19, 19)).toEqual({ col: 0, row: 0 })
    expect(toCell(20, 20)).toEqual({ col: 1, row: 1 })
  })

  it('applyZoom formula keeps pivot point fixed in grid space', () => {
    const cellSize = 10
    let scale = 1, panX = 0, panY = 0
    const px = 50, py = 30

    const gridUnderPivotBefore = {
      x: (px - panX) / (cellSize * scale),
      y: (py - panY) / (cellSize * scale),
    }

    const newScale = 2
    const ratio = newScale / scale
    panX = px - (px - panX) * ratio
    panY = py - (py - panY) * ratio
    scale = newScale

    const gridUnderPivotAfter = {
      x: (px - panX) / (cellSize * scale),
      y: (py - panY) / (cellSize * scale),
    }

    expect(gridUnderPivotAfter.x).toBeCloseTo(gridUnderPivotBefore.x)
    expect(gridUnderPivotAfter.y).toBeCloseTo(gridUnderPivotBefore.y)
  })

  it('clampPan keeps grid visible', () => {
    const clampPan = (panX: number, panY: number, scaledGridW: number, scaledGridH: number, w: number, h: number) => {
      const margin = 60
      return {
        panX: Math.min(w - margin, Math.max(margin - scaledGridW, panX)),
        panY: Math.min(h - margin, Math.max(margin - scaledGridH, panY)),
      }
    }
    expect(clampPan(1000, 0, 200, 200, 400, 400).panX).toBe(340)
    expect(clampPan(-1000, 0, 200, 200, 400, 400).panX).toBe(-140)
  })
})
