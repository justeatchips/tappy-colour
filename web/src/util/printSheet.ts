import type { Artwork } from '../model/Artwork'

export function canPrintColourSheet(artwork: Pick<Artwork, 'grid' | 'isComplete'>): boolean {
  const totalCells = artwork.grid.columns * artwork.grid.rows
  return artwork.isComplete || artwork.grid.unpaintedCount === totalCells
}

export function printArtworkSheet(artwork: Artwork): boolean {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return false

  printWindow.opener = null
  printWindow.document.write(createPrintableSheetHtml(artwork))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  return true
}

export function createPrintableSheetHtml(artwork: Artwork): string {
  const cells: string[] = []
  for (let row = 0; row < artwork.grid.rows; row++) {
    for (let col = 0; col < artwork.grid.columns; col++) {
      const cell = artwork.grid.cell(col, row)
      const number = artwork.palette.colours[cell.paletteIndex]?.number ?? cell.paletteIndex + 1
      cells.push(`<span class="cell">${number}</span>`)
    }
  }

  const legend = artwork.palette.colours.map(colour => {
    const rgba = colour.rgba
    const css = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${Math.round((rgba.a / 255) * 100) / 100})`
    return `
      <div class="legend-item">
        <span class="legend-number">${colour.number}</span>
        <span class="swatch" style="background:${css}"></span>
      </div>
    `
  }).join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(artwork.title)} - Tappy Colour Sheet</title>
  <style>
    @page { margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 22px;
      text-align: center;
    }
    .meta {
      margin: 0 0 12px;
      color: #4b5563;
      font-size: 12px;
      text-align: center;
    }
    .sheet-grid {
      display: grid;
      grid-template-columns: repeat(${artwork.grid.columns}, 1fr);
      width: min(100%, 180mm);
      margin: 0 auto;
      border: 1px solid #111827;
      aspect-ratio: ${artwork.grid.columns} / ${artwork.grid.rows};
    }
    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      min-height: 0;
      border-right: 0.5px solid #9ca3af;
      border-bottom: 0.5px solid #9ca3af;
      font-size: clamp(5px, ${Math.max(5, Math.floor(130 / artwork.grid.columns))}px, 14px);
      line-height: 1;
    }
    .legend {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(58px, 1fr));
      gap: 8px;
      margin: 14px auto 0;
      width: min(100%, 180mm);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      break-inside: avoid;
    }
    .legend-number {
      min-width: 20px;
      font-weight: 700;
      text-align: right;
    }
    .swatch {
      width: 22px;
      height: 22px;
      border: 1px solid #111827;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(artwork.title)}</h1>
  <p class="meta">${artwork.grid.columns}x${artwork.grid.rows} colour-by-number</p>
  <main class="sheet-grid">${cells.join('')}</main>
  <section class="legend">${legend}</section>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
