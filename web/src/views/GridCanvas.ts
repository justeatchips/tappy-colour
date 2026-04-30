import type { PaintingSession } from '../model/PaintingSession'
import type { CellCoord } from '../engine/types'
import { setupHiDpiCanvas } from '../util/dpr'
import { primaryTouch } from '../util/touch'
import { unlockAudio } from '../util/sound'
import {
  hexCellCenter,
  hexLayoutFor,
  isCellActiveForShape,
  pointInPointyHex,
} from '../engine/GridShape'

export class GridCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null = null
  private numbersCanvas: HTMLCanvasElement
  private numbersCtx: CanvasRenderingContext2D | null = null
  private cellSize = 0
  private offsetX = 0
  private offsetY = 0
  private resizeObserver: ResizeObserver | null = null
  private unsubs: Array<() => void> = []

  private readonly boundOnTouchStart: (e: TouchEvent) => void
  private readonly boundOnTouchMove: (e: TouchEvent) => void
  private readonly boundOnTouchEnd: (e: TouchEvent) => void
  private readonly boundOnMouseDown: (e: MouseEvent) => void
  private readonly boundOnMouseMove: (e: MouseEvent) => void
  private readonly boundOnMouseUp: (e: MouseEvent) => void
  private readonly boundOnWheel: (e: WheelEvent) => void

  // Zoom & pan
  private scale = 1
  private panX = 0
  private panY = 0
  private minScale = 1
  private maxScale = 8
  private pinchStartDist = 0
  private pinchStartScale = 1
  private pinchStartPanX = 0
  private pinchStartPanY = 0
  private pinchStartMidX = 0
  private pinchStartMidY = 0

  // Touch state machine
  private touchState: 'idle' | 'pendingPaint' | 'painting' | 'pinching' = 'idle'
  private pendingTimer: ReturnType<typeof setTimeout> | null = null
  private hintTimers: Array<ReturnType<typeof setTimeout>> = []
  private wrongCellTimers: Array<ReturnType<typeof setTimeout>> = []
  private hintOpacity = 0
  private wrongCellOpacity = 0
  private wrongCell: CellCoord | null = null
  private paintStartCol = -1
  private paintStartRow = -1
  private lastTouchX = 0
  private lastTouchY = 0
  private mouseDown = false

  constructor(private session: PaintingSession, private container: HTMLElement) {
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = `
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      background: white;
      touch-action: none;
    `
    this.numbersCanvas = document.createElement('canvas')
    this.numbersCanvas.style.cssText = `
      display: block;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      transition: opacity 0.6s ease-out;
    `
    this.boundOnTouchStart = this.onTouchStart.bind(this)
    this.boundOnTouchMove = this.onTouchMove.bind(this)
    this.boundOnTouchEnd = this.onTouchEnd.bind(this)
    this.boundOnMouseDown = this.onMouseDown.bind(this)
    this.boundOnMouseMove = this.onMouseMove.bind(this)
    this.boundOnMouseUp = this.onMouseUp.bind(this)
    this.boundOnWheel = this.onWheel.bind(this)
  }

  mount(): void {
    // Ensure container has position: relative for absolute positioning of numbersCanvas
    if (this.container.style.position !== 'absolute' && this.container.style.position !== 'fixed') {
      this.container.style.position = 'relative'
    }

    this.container.appendChild(this.canvas)
    this.container.appendChild(this.numbersCanvas)
    this.ctx = this.canvas.getContext('2d')
    this.numbersCtx = this.numbersCanvas.getContext('2d')

    if (!this.ctx) {
      throw new Error('Failed to get canvas context')
    }
    if (!this.numbersCtx) {
      throw new Error('Failed to get numbers canvas context')
    }

    // Set initial opacity based on numbersVisible
    this.numbersCanvas.style.opacity = this.session.numbersVisible ? '1' : '0'

    // Set up ResizeObserver
    this.resizeObserver = new ResizeObserver(() => {
      this.resize()
    })
    this.resizeObserver.observe(this.container)

    // Initial resize
    this.resize()

    // Subscribe to session changes
    const unsubGridChanged = this.session.on('change', (eventType) => {
      if (
        eventType === 'gridChanged' ||
        eventType === 'paletteChanged' ||
        eventType === 'selectionChanged' ||
        eventType === 'completionChanged' ||
        eventType === 'numbersVisibilityChanged' ||
        eventType === 'hintRequested' ||
        eventType === 'wrongCell'
      ) {
        if (eventType === 'numbersVisibilityChanged') {
          this.numbersCanvas.style.opacity = this.session.numbersVisible ? '1' : '0'
        }
        if (eventType === 'hintRequested') {
          this.startHint()
          return
        }
        if (eventType === 'wrongCell') {
          this.startWrongCellFeedback()
          return
        }
        this.render()
      }
    })
    this.unsubs.push(unsubGridChanged)

    // Attach touch listeners
    this.canvas.addEventListener('touchstart', this.boundOnTouchStart, { passive: false })
    this.canvas.addEventListener('touchmove', this.boundOnTouchMove, { passive: false })
    this.canvas.addEventListener('touchend', this.boundOnTouchEnd, { passive: false })
    this.canvas.addEventListener('touchcancel', this.boundOnTouchEnd, { passive: false })
    this.canvas.addEventListener('mousedown', this.boundOnMouseDown)
    window.addEventListener('mousemove', this.boundOnMouseMove)
    window.addEventListener('mouseup', this.boundOnMouseUp)

    // Wheel event for desktop zoom
    this.canvas.addEventListener('wheel', this.boundOnWheel, { passive: false })

    this.unsubs.push(() => {
      this.canvas.removeEventListener('touchstart', this.boundOnTouchStart)
      this.canvas.removeEventListener('touchmove', this.boundOnTouchMove)
      this.canvas.removeEventListener('touchend', this.boundOnTouchEnd)
      this.canvas.removeEventListener('touchcancel', this.boundOnTouchEnd)
      this.canvas.removeEventListener('mousedown', this.boundOnMouseDown)
      window.removeEventListener('mousemove', this.boundOnMouseMove)
      window.removeEventListener('mouseup', this.boundOnMouseUp)
      this.canvas.removeEventListener('wheel', this.boundOnWheel)
    })
  }

  unmount(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer)
      this.pendingTimer = null
    }
    this.clearHintTimers()
    this.clearWrongCellTimers()

    this.unsubs.forEach(unsub => unsub())
    this.unsubs = []

    this.canvas.remove()
    this.numbersCanvas.remove()
    this.ctx = null
    this.numbersCtx = null
  }

  private resize(): void {
    const w = this.container.clientWidth
    const h = this.container.clientHeight

    const cols = this.session.grid.columns
    const rows = this.session.grid.rows

    let gridWidth: number
    let gridHeight: number
    if (this.session.cellShape === 'hexCircle') {
      const layout = hexLayoutFor(cols, rows)
      this.cellSize = Math.max(1, Math.floor(Math.min(w / layout.width, h / layout.height)))
      gridWidth = layout.width * this.cellSize
      gridHeight = layout.height * this.cellSize
    } else {
      this.cellSize = Math.floor(Math.min(w, h) / Math.max(cols, rows))
      gridWidth = this.cellSize * cols
      gridHeight = this.cellSize * rows
    }

    this.offsetX = Math.floor((w - gridWidth) / 2)
    this.offsetY = Math.floor((h - gridHeight) / 2)

    this.minScale = 1
    this.maxScale = Math.max(8, Math.ceil(44 / this.cellSize))
    this.scale = 1
    this.panX = this.offsetX
    this.panY = this.offsetY

    setupHiDpiCanvas(this.canvas, w, h)
    setupHiDpiCanvas(this.numbersCanvas, w, h)
    this.render()
  }

  private render(): void {
    this.renderCells()
    this.renderNumbers()
  }

  private renderCells(): void {
    if (!this.ctx) return

    this.ctx.clearRect(0, 0, this.container.clientWidth, this.container.clientHeight)

    const grid = this.session.grid
    const palette = this.session.palette
    const effectiveCellSize = this.cellSize * this.scale
    const showCellBoundaries = !this.session.isComplete
    const isHexCircle = this.session.cellShape === 'hexCircle'
    const hexLayout = isHexCircle ? hexLayoutFor(grid.columns, grid.rows, effectiveCellSize) : null

    for (let col = 0; col < grid.columns; col++) {
      for (let row = 0; row < grid.rows; row++) {
        if (!this.isCellActive(col, row)) continue

        const cell = grid.cell(col, row)
        const isSelected = !cell.painted && cell.paletteIndex === this.session.selectedPaletteIndex
        const fillStyle = cell.painted
          ? palette.cssString(cell.paletteIndex)
          : isSelected
            ? this.selectedCellFill(cell.paletteIndex)
            : '#f5f5f5'
        const strokeStyle = isSelected ? '#111827' : '#ddd'
        const strokeWidth = isSelected ? Math.max(2, Math.min(4, effectiveCellSize * 0.08)) : 1

        if (hexLayout) {
          const center = hexCellCenter(col, row, hexLayout)
          const cx = this.panX + center.x
          const cy = this.panY + center.y
          this.drawHexCell(cx, cy, effectiveCellSize, fillStyle, showCellBoundaries ? strokeStyle : null, strokeWidth)

          if (showCellBoundaries && isSelected && this.hintOpacity > 0) {
            this.drawHexCell(cx, cy, Math.max(1, effectiveCellSize - 1), this.hintCellFill(), this.hintStroke(), Math.max(3, Math.min(6, effectiveCellSize * 0.12)))
          }

          if (showCellBoundaries && this.wrongCellOpacity > 0 && this.wrongCell?.col === col && this.wrongCell.row === row) {
            this.drawHexCell(
              cx,
              cy,
              Math.max(1, effectiveCellSize - 1),
              `rgba(239, 68, 68, ${Math.round(this.wrongCellOpacity * 18) / 100})`,
              `rgba(220, 38, 38, ${Math.round(this.wrongCellOpacity * 95) / 100})`,
              Math.max(3, Math.min(6, effectiveCellSize * 0.12))
            )
          }
          continue
        }

        const x = this.panX + col * effectiveCellSize
        const y = this.panY + row * effectiveCellSize

        this.ctx.fillStyle = fillStyle
        this.ctx.fillRect(x, y, effectiveCellSize, effectiveCellSize)

        if (showCellBoundaries) {
          this.ctx.strokeStyle = strokeStyle
          this.ctx.lineWidth = strokeWidth
          this.ctx.strokeRect(x, y, effectiveCellSize, effectiveCellSize)
        }

        if (showCellBoundaries && isSelected && this.hintOpacity > 0) {
          this.ctx.fillStyle = this.hintCellFill()
          this.ctx.fillRect(x, y, effectiveCellSize, effectiveCellSize)
          this.ctx.strokeStyle = this.hintStroke()
          this.ctx.lineWidth = Math.max(3, Math.min(6, effectiveCellSize * 0.12))
          this.ctx.strokeRect(x + 1, y + 1, effectiveCellSize - 2, effectiveCellSize - 2)
        }

        if (showCellBoundaries && this.wrongCellOpacity > 0 && this.wrongCell?.col === col && this.wrongCell.row === row) {
          this.ctx.fillStyle = `rgba(239, 68, 68, ${Math.round(this.wrongCellOpacity * 18) / 100})`
          this.ctx.fillRect(x, y, effectiveCellSize, effectiveCellSize)
          this.ctx.strokeStyle = `rgba(220, 38, 38, ${Math.round(this.wrongCellOpacity * 95) / 100})`
          this.ctx.lineWidth = Math.max(3, Math.min(6, effectiveCellSize * 0.12))
          this.ctx.strokeRect(x + 1, y + 1, effectiveCellSize - 2, effectiveCellSize - 2)
        }
      }
    }
  }

  private drawHexCell(
    centerX: number,
    centerY: number,
    radius: number,
    fillStyle: string,
    strokeStyle: string | null,
    lineWidth: number
  ): void {
    if (!this.ctx) return
    this.traceHexPath(this.ctx, centerX, centerY, radius)
    this.ctx.fillStyle = fillStyle
    this.ctx.fill()
    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke()
    }
  }

  private traceHexPath(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 3
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
  }

  private renderNumbers(): void {
    if (!this.numbersCtx) return

    this.numbersCtx.clearRect(0, 0, this.container.clientWidth, this.container.clientHeight)

    const grid = this.session.grid
    const palette = this.session.palette
    const effectiveCellSize = this.cellSize * this.scale
    const isHexCircle = this.session.cellShape === 'hexCircle'
    const hexLayout = isHexCircle ? hexLayoutFor(grid.columns, grid.rows, effectiveCellSize) : null

    if (effectiveCellSize < 12) return

    const fontSize = Math.min(28, Math.max(9, Math.floor(effectiveCellSize * 0.45)))
    this.numbersCtx.font = `bold ${fontSize}px -apple-system, system-ui, sans-serif`
    this.numbersCtx.textAlign = 'center'
    this.numbersCtx.textBaseline = 'middle'
    this.numbersCtx.fillStyle = '#888'

    for (let col = 0; col < grid.columns; col++) {
      for (let row = 0; row < grid.rows; row++) {
        if (!this.isCellActive(col, row)) continue
        const cell = grid.cell(col, row)
        if (!cell.painted) {
          const isSelected = cell.paletteIndex === this.session.selectedPaletteIndex
          const colourEntry = palette.colours[cell.paletteIndex]
          const number = colourEntry ? colourEntry.number : cell.paletteIndex + 1
          const center = hexLayout
            ? hexCellCenter(col, row, hexLayout)
            : {
                x: col * effectiveCellSize + effectiveCellSize / 2,
                y: row * effectiveCellSize + effectiveCellSize / 2,
              }
          const x = this.panX + center.x
          const y = this.panY + center.y
          if (isSelected) {
            this.numbersCtx.font = `900 ${Math.max(fontSize + 2, Math.floor(effectiveCellSize * 0.55))}px -apple-system, system-ui, sans-serif`
            this.numbersCtx.fillStyle = '#111827'
          } else {
            this.numbersCtx.font = `bold ${fontSize}px -apple-system, system-ui, sans-serif`
            this.numbersCtx.fillStyle = '#888'
          }
          this.numbersCtx.fillText(number.toString(), x, y)
        }
      }
    }
  }

  private selectedCellFill(paletteIndex: number): string {
    const colour = this.session.palette.colours[paletteIndex]?.rgba
    if (!colour) return 'rgba(250, 204, 21, 0.24)'
    return `rgba(${colour.r}, ${colour.g}, ${colour.b}, 0.22)`
  }

  private hintCellFill(): string {
    return `rgba(250, 204, 21, ${Math.round(this.hintOpacity * 28) / 100})`
  }

  private hintStroke(): string {
    return `rgba(17, 24, 39, ${Math.round(this.hintOpacity * 90) / 100})`
  }

  private startHint(): void {
    this.clearHintTimers()
    this.hintOpacity = 1
    this.render()

    this.hintTimers = [
      setTimeout(() => {
        this.hintOpacity = 0.45
        this.render()
      }, 700),
      setTimeout(() => {
        this.hintOpacity = 0
        this.render()
        this.clearHintTimers()
      }, 1150),
    ]
  }

  private clearHintTimers(): void {
    for (const timer of this.hintTimers) clearTimeout(timer)
    this.hintTimers = []
  }

  private startWrongCellFeedback(): void {
    this.clearWrongCellTimers()
    this.wrongCell = this.session.lastRejectedCell
    if (!this.wrongCell) return
    this.wrongCellOpacity = 1
    this.render()

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    this.wrongCellTimers = [
      setTimeout(() => {
        this.wrongCellOpacity = reducedMotion ? 0 : 0.45
        this.render()
      }, reducedMotion ? 120 : 180),
      setTimeout(() => {
        this.wrongCellOpacity = 0
        this.wrongCell = null
        this.render()
        this.clearWrongCellTimers()
      }, reducedMotion ? 220 : 360),
    ]
  }

  private clearWrongCellTimers(): void {
    for (const timer of this.wrongCellTimers) clearTimeout(timer)
    this.wrongCellTimers = []
  }

  private isCellActive(col: number, row: number): boolean {
    return isCellActiveForShape(
      col,
      row,
      this.session.grid.columns,
      this.session.grid.rows,
      this.session.cellShape
    )
  }

  private cellAt(clientX: number, clientY: number): CellCoord | null {
    const rect = this.canvas.getBoundingClientRect()
    const effectiveCellSize = this.cellSize * this.scale
    const localX = clientX - rect.left - this.panX
    const localY = clientY - rect.top - this.panY

    if (this.session.cellShape === 'hexCircle') {
      return this.hexCellAt(localX, localY, effectiveCellSize)
    }

    const x = localX / effectiveCellSize
    const y = localY / effectiveCellSize

    const col = Math.floor(x)
    const row = Math.floor(y)

    if (col < 0 || col >= this.session.grid.columns || row < 0 || row >= this.session.grid.rows) {
      return null
    }

    return { col, row }
  }

  private hexCellAt(localX: number, localY: number, radius: number): CellCoord | null {
    const grid = this.session.grid
    const layout = hexLayoutFor(grid.columns, grid.rows, radius)
    const estimatedRow = Math.round((localY - radius) / layout.verticalStep)

    let best: CellCoord | null = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (let row = estimatedRow - 1; row <= estimatedRow + 1; row++) {
      if (row < 0 || row >= grid.rows) continue
      const rowOffset = (row % 2) * layout.hexWidth / 2
      const estimatedCol = Math.round((localX - rowOffset - layout.hexWidth / 2) / layout.hexWidth)

      for (let col = estimatedCol - 1; col <= estimatedCol + 1; col++) {
        if (col < 0 || col >= grid.columns || !this.isCellActive(col, row)) continue

        const center = hexCellCenter(col, row, layout)
        if (!pointInPointyHex(localX, localY, center.x, center.y, radius)) continue

        const dx = localX - center.x
        const dy = localY - center.y
        const distance = dx * dx + dy * dy
        if (distance < bestDistance) {
          bestDistance = distance
          best = { col, row }
        }
      }
    }

    return best
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 2) {
      e.preventDefault()
      if (this.touchState === 'painting') {
        this.session.dragEnded()
      }
      if (this.pendingTimer !== null) {
        clearTimeout(this.pendingTimer)
        this.pendingTimer = null
      }
      const rect = this.canvas.getBoundingClientRect()
      const t1 = e.touches[0], t2 = e.touches[1]
      this.pinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      this.pinchStartScale = this.scale
      this.pinchStartPanX = this.panX
      this.pinchStartPanY = this.panY
      this.pinchStartMidX = (t1.clientX + t2.clientX) / 2 - rect.left
      this.pinchStartMidY = (t1.clientY + t2.clientY) / 2 - rect.top
      this.touchState = 'pinching'
      return
    }

    e.preventDefault()

    const touch = primaryTouch(e)
    if (!touch) return
    this.beginPointerPaint(touch.clientX, touch.clientY)
  }

  private onTouchMove(e: TouchEvent): void {
    if (this.touchState === 'pinching') {
      e.preventDefault()
      if (e.touches.length < 2) return
      const t1 = e.touches[0], t2 = e.touches[1]
      const rect = this.canvas.getBoundingClientRect()
      const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      const newMidX = (t1.clientX + t2.clientX) / 2 - rect.left
      const newMidY = (t1.clientY + t2.clientY) / 2 - rect.top

      const scaleRatio = newDist / this.pinchStartDist
      const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.pinchStartScale * scaleRatio))
      const ratio = newScale / this.pinchStartScale

      const newPanX = this.pinchStartMidX - (this.pinchStartMidX - this.pinchStartPanX) * ratio + (newMidX - this.pinchStartMidX)
      const newPanY = this.pinchStartMidY - (this.pinchStartMidY - this.pinchStartPanY) * ratio + (newMidY - this.pinchStartMidY)

      this.scale = newScale
      ;({ panX: this.panX, panY: this.panY } = this.clampPan(newPanX, newPanY))
      this.render()
      return
    }

    if (this.touchState === 'idle') return

    e.preventDefault()

    const touch = primaryTouch(e)
    if (!touch) return
    this.movePointerPaint(touch.clientX, touch.clientY)
  }

  private onTouchEnd(e: TouchEvent): void {
    e.preventDefault()
    this.finishPointerPaint()
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button !== 0 && e.buttons !== 1) return
    e.preventDefault()
    this.mouseDown = true
    this.beginPointerPaint(e.clientX, e.clientY)
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.mouseDown) return
    e.preventDefault()
    this.movePointerPaint(e.clientX, e.clientY)
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.mouseDown) return
    e.preventDefault()
    this.mouseDown = false
    this.finishPointerPaint()
  }

  private beginPointerPaint(clientX: number, clientY: number): void {
    unlockAudio()

    this.lastTouchX = clientX
    this.lastTouchY = clientY

    const cell = this.cellAt(clientX, clientY)
    if (!cell) return

    this.paintStartCol = cell.col
    this.paintStartRow = cell.row
    this.touchState = 'pendingPaint'

    this.pendingTimer = setTimeout(() => {
      if (this.touchState === 'pendingPaint' && this.session.currentTool === 'tap') {
        this.touchState = 'painting'
        this.session.dragBegan()
        this.session.dragMoved(this.paintStartCol, this.paintStartRow)
        this.render()
      }
    }, 10)
  }

  private movePointerPaint(clientX: number, clientY: number): void {
    const cell = this.cellAt(clientX, clientY)

    if (this.touchState === 'pendingPaint') {
      const dx = clientX - this.lastTouchX
      const dy = clientY - this.lastTouchY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 5 && this.session.currentTool === 'tap') {
        this.clearPendingTimer()

        this.touchState = 'painting'
        this.session.dragBegan()

        if (cell) {
          this.session.dragMoved(cell.col, cell.row)
        }
        this.render()
      }
    } else if (this.touchState === 'painting' && cell) {
      this.session.dragMoved(cell.col, cell.row)
    }
  }

  private finishPointerPaint(): void {

    if (this.touchState === 'pinching') {
      this.touchState = 'idle'
      return
    }

    this.clearPendingTimer()

    const tool = this.session.currentTool

    if (this.touchState === 'pendingPaint') {
      if (tool === 'bucket') {
        this.session.bucketFill(this.paintStartCol, this.paintStartRow)
      } else if (tool === 'fillAll') {
        this.session.fillAllOfSelected()
      } else {
        this.session.tap(this.paintStartCol, this.paintStartRow)
      }
    } else if (this.touchState === 'painting') {
      if (tool === 'tap') {
        this.session.dragEnded()
      } else {
        // bucket/fillAll don't drag — abort cleanly
        this.session.dragEnded()
      }
    }

    this.touchState = 'idle'
  }

  private clearPendingTimer(): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer)
      this.pendingTimer = null
    }
  }

  private clampPan(panX: number, panY: number): { panX: number; panY: number } {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    const effectiveCellSize = this.cellSize * this.scale
    const hexLayout = this.session.cellShape === 'hexCircle'
      ? hexLayoutFor(this.session.grid.columns, this.session.grid.rows, effectiveCellSize)
      : null
    const scaledGridW = hexLayout?.width ?? effectiveCellSize * this.session.grid.columns
    const scaledGridH = hexLayout?.height ?? effectiveCellSize * this.session.grid.rows
    const margin = 60
    return {
      panX: Math.min(w - margin, Math.max(margin - scaledGridW, panX)),
      panY: Math.min(h - margin, Math.max(margin - scaledGridH, panY)),
    }
  }

  private applyZoom(newScale: number, pivotX: number, pivotY: number): void {
    newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale))
    const ratio = newScale / this.scale
    const newPanX = pivotX - (pivotX - this.panX) * ratio
    const newPanY = pivotY - (pivotY - this.panY) * ratio
    this.scale = newScale
    ;({ panX: this.panX, panY: this.panY } = this.clampPan(newPanX, newPanY))
    this.render()
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault()
    const rect = this.canvas.getBoundingClientRect()
    const pivotX = e.clientX - rect.left
    const pivotY = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
    this.applyZoom(this.scale * factor, pivotX, pivotY)
  }

  resetZoom(): void {
    this.scale = 1
    this.panX = this.offsetX
    this.panY = this.offsetY
    this.render()
  }
}
