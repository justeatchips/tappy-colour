// Puzzle — the colour-by-numbers play screen.
// Real interactivity: tap a cell with the matching colour selected to paint it.
// Tools: tap (single cell), bucket (fill all of same number), magic (random reveal).

function Puzzle({ theme, mascot, puzzle, painted, onPaint, onHome, onComplete, onReset }) {
  const [selected, setSelected] = useState(0);   // palette index
  const [tool, setTool] = useState('tap');        // 'tap' | 'bucket' | 'magic'
  const [history, setHistory] = useState([]);     // stack of {key, num}
  const [showWrong, setShowWrong] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  // Compute totals + per-color progress.
  const stats = useMemo(() => {
    const perColor = puzzle.palette.map(() => [0, 0]); // [done, total]
    let total = 0, done = 0;
    puzzle.grid.forEach((row, y) => {
      row.split('').forEach((ch, x) => {
        if (ch === '.') return;
        const num = parseInt(ch, 16);
        perColor[num - 1][1]++;
        total++;
        if (painted[`${x},${y}`]) {
          perColor[num - 1][0]++;
          done++;
        }
      });
    });
    return { perColor, total, done, ratio: total > 0 ? done / total : 0 };
  }, [puzzle, painted]);

  const isComplete = stats.ratio >= 1;
  useEffect(() => {
    if (isComplete) {
      setCelebrate(true);
      const t = setTimeout(() => onComplete(), 1400);
      return () => clearTimeout(t);
    }
  }, [isComplete]);

  // Auto-advance to next available colour when current is done
  useEffect(() => {
    if (stats.perColor[selected] && stats.perColor[selected][0] >= stats.perColor[selected][1]) {
      const next = stats.perColor.findIndex(([d, t]) => t > 0 && d < t);
      if (next >= 0 && next !== selected) setSelected(next);
    }
  }, [stats.done]);

  const paintCell = (x, y) => {
    const ch = puzzle.grid[y][x];
    if (ch === '.') return;
    const num = parseInt(ch, 16);
    const key = `${x},${y}`;
    if (painted[key]) return;

    if (tool === 'tap') {
      if (num - 1 !== selected) {
        // Wrong colour — flash a hint
        setShowWrong(key);
        setTimeout(() => setShowWrong(null), 400);
        return;
      }
      onPaint(key, num);
      setHistory(h => [...h, [{ key, num }]]);
    } else if (tool === 'bucket') {
      // Fill ALL cells with the same number as the tapped cell, regardless of selected
      const filled = [];
      puzzle.grid.forEach((row, yy) => {
        row.split('').forEach((ch, xx) => {
          if (ch === '.') return;
          if (parseInt(ch, 16) === num && !painted[`${xx},${yy}`]) {
            filled.push({ key: `${xx},${yy}`, num });
          }
        });
      });
      filled.forEach(({ key, num }) => onPaint(key, num));
      if (filled.length) setHistory(h => [...h, filled]);
      setSelected(num - 1);
    } else if (tool === 'magic') {
      // Reveal up to 5 random cells
      const remaining = [];
      puzzle.grid.forEach((row, yy) => {
        row.split('').forEach((ch, xx) => {
          if (ch === '.') return;
          const k = `${xx},${yy}`;
          if (!painted[k]) remaining.push({ key: k, num: parseInt(ch, 16) });
        });
      });
      remaining.sort(() => Math.random() - 0.5);
      const picked = remaining.slice(0, 5);
      picked.forEach(({ key, num }) => onPaint(key, num));
      if (picked.length) setHistory(h => [...h, picked]);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    last.forEach(({ key }) => onPaint(key, null));
  };

  // Cell size — fit within ~640px area
  const cell = 36;

  return (
    <Screen theme={theme} label="04 Puzzle">
      {celebrate && <Confetti theme={theme}/>}
      <div style={{ padding: 16, maxWidth: 1180, margin: '0 auto' }}>
        {/* Top bar */}
        <PxPanel color="#fff" borderColor={theme.ink} padding={12} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PxButton color={theme.bgAlt} textColor={theme.ink} borderColor={theme.ink} size="sm" onClick={onHome}>← HOME</PxButton>
            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--tc-display)', fontSize: 22, letterSpacing: 1 }}>{puzzle.title}</div>
            <PxButton color={theme.bgAlt} textColor={theme.ink} borderColor={theme.ink} size="sm" onClick={undo} disabled={history.length === 0}>↶ UNDO</PxButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1, height: 14, background: theme.bgAlt, border: `3px solid ${theme.ink}` }}>
              <div style={{ width: `${stats.ratio * 100}%`, height: '100%', background: theme.primary, transition: 'width 0.3s steps(8)' }}/>
            </div>
            <div style={{ fontFamily: 'var(--tc-display)', fontSize: 13, letterSpacing: 1, minWidth: 90, textAlign: 'right' }}>{Math.round(stats.ratio * 100)}% DONE</div>
          </div>
        </PxPanel>

        {/* Body: tools + canvas */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', paddingTop: 40 }}>
            <PixelToolDock selected={tool} theme={theme} orientation="vertical" onPick={setTool}/>
            <div style={{ fontFamily: 'var(--tc-display)', fontSize: 9, color: theme.inkSoft, textAlign: 'center', letterSpacing: 1, lineHeight: 1.4, marginTop: 8 }}>
              {tool === 'tap' && 'TAP A CELL'}
              {tool === 'bucket' && 'FILLS A NUMBER'}
              {tool === 'magic' && 'REVEALS 5'}
            </div>
          </div>

          <PxPanel color="#fff" borderColor={theme.ink} padding={16} style={{ flex: 1, position: 'relative' }}>
            <PuzzleCanvas
              puzzle={puzzle}
              painted={painted}
              cell={cell}
              theme={theme}
              selected={selected}
              tool={tool}
              showWrong={showWrong}
              onTap={paintCell}
            />
            {/* Mascot peek */}
            <div style={{ position: 'absolute', bottom: -20, right: -20, transform: celebrate ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.3s steps(2)' }}>
              <PxPanel color={theme.sun} borderColor={theme.ink} padding="6px 12px" shadow={true}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--tc-display)', fontSize: 14, letterSpacing: 1 }}>
                  <PixelMascot mascot={mascot} size={36} wave={celebrate}/>
                  {celebrate ? 'WAHOO!' : 'NICE!'}
                </div>
              </PxPanel>
            </div>
          </PxPanel>
        </div>

        {/* Palette strip */}
        <PxPanel color="#fff" borderColor={theme.ink} padding={14} style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--tc-display)', fontSize: 12, letterSpacing: 0.5, color: theme.inkSoft }}>★ PALETTE — TAP TO SELECT</div>
            <button onClick={onReset} style={{
              background: 'none', border: 'none', color: theme.inkSoft, cursor: 'pointer',
              fontFamily: 'var(--tc-display)', fontSize: 11, letterSpacing: 1, textDecoration: 'underline',
            }}>RESET</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PixelPaletteRow
              colors={puzzle.palette}
              selected={selected}
              progresses={stats.perColor}
              theme={theme}
              onPick={setSelected}
            />
          </div>
        </PxPanel>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// PuzzleCanvas — interactive grid.
// ─────────────────────────────────────────────────────────────
function PuzzleCanvas({ puzzle, painted, cell, theme, selected, tool, showWrong, onTap }) {
  const grid = puzzle.grid;
  const rows = grid.length;
  const cols = grid[0].length;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
      gridTemplateRows: `repeat(${rows}, ${cell}px)`,
      gap: 1, background: theme.ink + '33',
      padding: 6, margin: '0 auto', width: 'fit-content',
      borderRadius: 8, border: `4px solid ${theme.ink}`,
      boxShadow: `0 6px 0 0 ${theme.ink}, 0 12px 24px rgba(20,30,50,0.1)`,
    }}>
      {grid.map((row, y) => row.split('').map((ch, x) => {
        const key = `${x},${y}`;
        if (ch === '.') {
          return <div key={key} style={{ background: theme.bgAlt }}/>;
        }
        const num = parseInt(ch, 16);
        const filled = painted[key];
        const isWrong = showWrong === key;
        const isHighlightedNum = !filled && (num - 1) === selected;
        const cellColor = puzzle.palette[num - 1] || '#ddd';
        const bg = filled ? cellColor : (isHighlightedNum ? '#fff7dc' : '#ffffff');
        return (
          <button
            key={key}
            onClick={() => onTap(x, y)}
            style={{
              background: bg,
              border: 'none',
              padding: 0,
              cursor: filled ? 'default' : 'pointer',
              fontFamily: 'var(--tc-display)',
              fontSize: cell * 0.42,
              fontWeight: 700,
              color: isHighlightedNum ? theme.primary : '#9a8a78',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              outline: isWrong ? `4px solid #ff3a3a` : 'none',
              outlineOffset: -3,
              animation: isWrong ? 'tcShake 0.3s steps(4)' : undefined,
              transition: 'background 0.1s steps(2)',
            }}
          >
            {!filled ? num : ''}
          </button>
        );
      }))}
      <style>{`
        @keyframes tcShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { Puzzle, PuzzleCanvas });
