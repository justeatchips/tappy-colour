# Super-High-Resolution Puzzle Mode Spike

## Recommendation

Do not ship 100x100 or 500x500 puzzle creation in the current renderer yet.

The storage model can handle larger grids, but the current canvas path redraws every cell on each grid render. That is acceptable at the current 80x80 maximum, but 500x500 would ask the main thread to consider 250,000 cells per render before number labels, highlights, hints, or completion effects.

## Current Cost Shape

| Grid | Cells | Paint-state bytes | Renderer risk |
| --- | ---: | ---: | --- |
| 80x80 | 6,400 | ~6 KB | Current maximum |
| 100x100 | 10,000 | ~10 KB | Plausible with profiling |
| 500x500 | 250,000 | ~250 KB | Not suitable for per-cell redraws |

The IndexedDB format remains compact because each cell is one byte. The main risks are conversion time, canvas redraw cost, number-label density, touch targeting, and child usability.

## Required Before Shipping

- Move completed/painted base pixels into a cached bitmap layer and redraw only dirty cells while painting.
- Add viewport culling so zoomed and panned views do not loop over off-screen cells.
- Keep number labels hidden until the effective cell size is readable.
- Profile conversion-worker time separately for 100x100, 160x160, and 500x500 inputs on low-end tablets.
- Add a parent/older-kid gate with clear time and tiny-cell warnings before allowing grids above 80x80.
- Extend print/export paths so very large grids paginate or scale predictably.

## Suggested Next Step

Start with an experimental 100x100 cap behind a hidden/internal flag after renderer profiling. Treat 500x500 as an export-quality mode only after cached rendering and viewport culling exist.
