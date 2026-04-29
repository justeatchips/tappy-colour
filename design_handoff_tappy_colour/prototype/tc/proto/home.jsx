// Home — gallery of starter puzzles + greeting from the chosen mascot.

function Home({ theme, mascot, painted, onPick, onSettings, onReset }) {
  const tiles = Object.values(PUZZLES);
  return (
    <Screen theme={theme} label="02 Home">
      <div style={{ padding: 28, maxWidth: 1080, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26 }}>
          <PxPanel padding={8} color="#fff" borderColor={theme.ink} shadow={false}>
            <PixelMascot mascot={mascot} size={56} wave/>
          </PxPanel>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontFamily: 'var(--tc-display)', color: theme.inkSoft, letterSpacing: 1 }}>HI {mascot.name.toUpperCase()}!</div>
            <PxTitle theme={theme} size={40}>TAPPY COLOUR</PxTitle>
          </div>
          <PxButton color="#fff" textColor={theme.ink} borderColor={theme.ink} size="md" onClick={onSettings} style={{ width: 60 }}>⚙</PxButton>
        </div>

        {/* Big actions */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28, justifyContent: 'center' }}>
          {[
            { icon: '📷', label: 'CAMERA', color: theme.primary },
            { icon: '🖼', label: 'PHOTOS', color: theme.accent },
            { icon: '🔍', label: 'SEARCH', color: theme.mint },
          ].map((b, i) => (
            <button key={i} style={{
              flex: '0 1 300px',
              background: b.color, color: '#fff', cursor: 'pointer',
              border: `4px solid ${theme.ink}`, padding: '20px 18px',
              borderRadius: 6,
              boxShadow: `0 6px 0 0 ${theme.ink}, 0 8px 16px rgba(20, 30, 50, 0.1)`,
              display: 'flex', alignItems: 'center', gap: 14,
              fontFamily: 'var(--tc-display)', fontSize: 22, letterSpacing: 0.5,
            }} onClick={() => onPick(tiles[0].id)}>
              <div style={{ fontSize: 32 }}>{b.icon}</div>
              {b.label}
            </button>
          ))}
        </div>

        {/* Pictures section */}
        <div style={{ fontFamily: 'var(--tc-display)', fontSize: 18, letterSpacing: 0.5, marginBottom: 12, color: theme.ink, textAlign: 'center' }}>★ TAP A PICTURE ★</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, justifyContent: 'center' }}>
          {tiles.map(p => {
            const cells = painted[p.id] || {};
            // Compute progress: # painted vs total non-empty
            let total = 0, done = 0;
            p.grid.forEach((row, y) => {
              row.split('').forEach((ch, x) => {
                if (ch !== '.') {
                  total++;
                  if (cells[`${x},${y}`]) done++;
                }
              });
            });
            const progress = total > 0 ? done / total : 0;
            const complete = progress >= 1;
            return (
              <button key={p.id} onClick={() => onPick(p.id)} style={{
                background: '#fff', border: `4px solid ${theme.ink}`,
                borderRadius: 6,
                boxShadow: `0 6px 0 0 ${theme.ink}, 0 8px 16px rgba(20, 30, 50, 0.08)`,
                padding: 10, cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'inherit',
              }}>
                <div style={{ width: '100%', aspectRatio: '1 / 1', background: theme.bgAlt, marginBottom: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, border: `2px solid ${theme.ink}22` }}>
                  <PuzzleThumb puzzle={p} painted={cells}/>
                </div>
                <div style={{ fontFamily: 'var(--tc-display)', fontSize: 14, letterSpacing: 1, marginBottom: 4 }}>{p.title}</div>
                {complete
                  ? <div style={{ fontFamily: 'var(--tc-display)', fontSize: 11, color: theme.primary, letterSpacing: 1 }}>★ DONE</div>
                  : <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 8, background: theme.bgAlt, border: `2px solid ${theme.ink}` }}>
                        <div style={{ width: `${progress * 100}%`, height: '100%', background: theme.primary }}/>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 800 }}>{Math.round(progress * 100)}%</div>
                    </div>}
              </button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}

// Tiny thumbnail of a puzzle, showing painted state. SVG so it scales cleanly to fit any container.
function PuzzleThumb({ puzzle, painted, size }) {
  const grid = puzzle.grid;
  const rows = grid.length;
  const cols = grid[0].length;
  const cells = [];
  grid.forEach((row, y) => {
    row.split('').forEach((ch, x) => {
      if (ch === '.') {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="transparent"/>);
        return;
      }
      const num = parseInt(ch, 16);
      const filled = painted[`${x},${y}`];
      const color = filled ? puzzle.palette[num - 1] : '#ffffff';
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={color}/>);
      if (!filled) {
        // light gridlines so the unfinished puzzle doesn't look like a blank
        cells.push(<rect key={`${x}-${y}-b`} x={x + 0.95} y={y} width="0.1" height="1.02" fill="#e8e2d8"/>);
      }
    });
  });
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={size || '100%'}
      height={size || '100%'}
      preserveAspectRatio="xMidYMid meet"
      style={{ shapeRendering: 'crispEdges', display: 'block', borderRadius: 3 }}
    >
      {cells}
    </svg>
  );
}

Object.assign(window, { Home, PuzzleThumb });
