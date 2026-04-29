// Tappy Colour — Pixel Native clickable prototype.
// Single-file React app with navigation between screens, real puzzle painting,
// palette + tool selection, undo, and parental gate.

const { useState, useRef, useEffect, useMemo, useCallback } = React;

// ─────────────────────────────────────────────────────────────
// PUZZLE DEFINITIONS — bigger 16x16 pixel artworks for the prototype.
// Each cell number maps to a palette index (1..N).
// ─────────────────────────────────────────────────────────────
const PUZZLES = {
  unicorn: {
    id: 'unicorn',
    title: 'UNICORN',
    palette: ['#ffd0e3', '#ff8fbf', '#ff5fa2', '#a78bfa', '#7adfc1', '#ffd25f', '#ffffff', '#3a2a4a'],
    paletteNames: ['Pink', 'Hot Pink', 'Magenta', 'Lilac', 'Mint', 'Yellow', 'White', 'Black'],
    grid: [
      '................',
      '......6.........',
      '.....66.........',
      '....363.........',
      '...3633........',
      '..436.33333.....',
      '..433.32323....',
      '..436.3333333...',
      '..43377777333..',
      '..43388888333..',
      '..436.7777733..',
      '...3..7333333..',
      '......3.333.3..',
      '......3.333.3..',
      '......88...88..',
      '................',
    ],
  },
  cat: {
    id: 'cat',
    title: 'KITTY',
    palette: ['#3a2a20', '#7a5d4a', '#c79a6b', '#f3ead8', '#ffffff', '#ff9bbd', '#7adfc1'],
    paletteNames: ['Dark', 'Brown', 'Tan', 'Cream', 'White', 'Pink', 'Mint'],
    grid: [
      '................',
      '..1..........1..',
      '..11........11..',
      '..121......121..',
      '..1221....1221..',
      '..12222111122222',
      '.122222111222221',
      '.122122111122221',
      '.122222111222221',
      '.12222262622221.',
      '.12222226622221.',
      '.12222266622221.',
      '..1222222222221.',
      '...1222222221...',
      '....11111111....',
      '................',
    ],
  },
  rocket: {
    id: 'rocket',
    title: 'ROCKET',
    palette: ['#1f2e4a', '#3da9ff', '#bfe1ff', '#ffffff', '#ffd25f', '#ff5fa2', '#ff8a3d'],
    paletteNames: ['Navy', 'Blue', 'Sky', 'White', 'Yellow', 'Pink', 'Orange'],
    grid: [
      '.......1........',
      '......121.......',
      '.....12321......',
      '....1233321.....',
      '....1233321.....',
      '....1232321.....',
      '....1233321.....',
      '....1233321.....',
      '....1244421.....',
      '...12.4441.21...',
      '..127..1..1721..',
      '..76....1...67..',
      '..67....2....76.',
      '..6.....7....6..',
      '...........7....',
      '.....7..........',
    ],
  },
  flower: {
    id: 'flower',
    title: 'SUNFLOWER',
    palette: ['#7adfc1', '#3a8a4a', '#ffd25f', '#ff8a3d', '#5a3a20', '#ffffff'],
    paletteNames: ['Mint', 'Green', 'Yellow', 'Orange', 'Brown', 'White'],
    grid: [
      '................',
      '......333.......',
      '....33333333....',
      '...3344443333...',
      '..334445544433..',
      '..334455554433..',
      '..334445544433..',
      '..334444444433..',
      '...33344443.....',
      '....3333333.....',
      '......222.......',
      '......222.......',
      '....1.222.1.....',
      '...11.222..1....',
      '..111.222..11...',
      '..11..2.....1...',
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// Storage / state hooks
// ─────────────────────────────────────────────────────────────
const TC_STORAGE_KEY = 'tappyColourProtoState_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(TC_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(TC_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

// ─────────────────────────────────────────────────────────────
// Root app
// ─────────────────────────────────────────────────────────────
function ProtoApp() {
  const theme = TC_THEMES.sky;
  const fontVars = {
    '--tc-display': '"Pixelify Sans", "Silkscreen", system-ui, sans-serif',
    '--tc-body': '"Nunito", system-ui, sans-serif',
    fontFamily: '"Nunito", system-ui, sans-serif',
  };

  const persisted = loadState();
  const [route, setRoute] = useState(persisted?.route || 'onboarding');
  const [mascotId, setMascotId] = useState(persisted?.mascotId || null);
  const [puzzleId, setPuzzleId] = useState(persisted?.puzzleId || 'unicorn');
  const [difficulty, setDifficulty] = useState(persisted?.difficulty ?? 0.45);
  // painted: { puzzleId: { 'x,y': cellNumber-painted-or-null } }  — true once painted.
  const [painted, setPainted] = useState(persisted?.painted || {});
  const [showSettings, setShowSettings] = useState(false);
  const [parentGated, setParentGated] = useState(false);

  // Persist on every change
  useEffect(() => {
    saveState({ route, mascotId, puzzleId, difficulty, painted });
  }, [route, mascotId, puzzleId, difficulty, painted]);

  const mascot = useMemo(() => TC_MASCOTS.find(m => m.id === mascotId) || TC_MASCOTS[1], [mascotId]);

  const goto = (r) => setRoute(r);
  const startPuzzle = (id) => { setPuzzleId(id); setRoute('puzzle'); };
  const updatePainted = (id, key, num) => {
    setPainted(p => ({ ...p, [id]: { ...(p[id] || {}), [key]: num } }));
  };
  const resetPuzzle = (id) => {
    setPainted(p => { const c = { ...p }; delete c[id]; return c; });
  };

  const reset = () => {
    localStorage.removeItem(TC_STORAGE_KEY);
    setMascotId(null); setPainted({}); setRoute('onboarding'); setPuzzleId('unicorn'); setDifficulty(0.45);
  };

  let content;
  if (route === 'onboarding') {
    content = <Onboarding theme={theme} mascotId={mascotId} setMascotId={setMascotId} onDone={() => goto('home')}/>;
  } else if (route === 'home') {
    content = <Home theme={theme} mascot={mascot} painted={painted} onPick={(id) => { setPuzzleId(id); goto('difficulty'); }} onSettings={() => setShowSettings(true)} onReset={reset}/>;
  } else if (route === 'difficulty') {
    content = <Difficulty theme={theme} mascot={mascot} value={difficulty} onChange={setDifficulty} puzzleId={puzzleId} onBack={() => goto('home')} onStart={() => goto('puzzle')}/>;
  } else if (route === 'puzzle') {
    content = <Puzzle theme={theme} mascot={mascot} puzzle={PUZZLES[puzzleId]} painted={painted[puzzleId] || {}} onPaint={(k, n) => updatePainted(puzzleId, k, n)} onHome={() => goto('home')} onComplete={() => goto('completion')} onReset={() => resetPuzzle(puzzleId)}/>;
  } else if (route === 'completion') {
    content = <Completion theme={theme} mascot={mascot} puzzle={PUZZLES[puzzleId]} onHome={() => goto('home')} onNew={() => { resetPuzzle(puzzleId); goto('home'); }}/>;
  }

  return (
    <div style={{ ...fontVars, width: '100%', minHeight: '100vh', background: theme.bg, position: 'relative', overflow: 'hidden' }}>
      {content}
      {showSettings && <SettingsModal theme={theme} mascot={mascot} parentGated={parentGated} onGate={() => setParentGated(true)} onClose={() => { setShowSettings(false); setParentGated(false); }} onReset={reset}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable UI atoms — pixel-stepped, retro
// ─────────────────────────────────────────────────────────────
function PxPanel({ children, color = '#fff', borderColor, shadow = true, padding = 16, style }) {
  const bc = borderColor || '#1a1020';
  return (
    <div style={{
      background: color,
      padding,
      border: `4px solid ${bc}`,
      borderRadius: 6,
      boxShadow: shadow ? `0 6px 0 0 ${bc}, 0 8px 24px rgba(20, 30, 50, 0.08)` : 'none',
      ...style,
    }}>{children}</div>
  );
}

function PxButton({ children, color = '#3da9ff', textColor = '#fff', borderColor = '#1a1020', size = 'md', onClick, disabled, style }) {
  const [pressed, setPressed] = useState(false);
  const pad = size === 'lg' ? '16px 28px' : size === 'sm' ? '8px 14px' : '12px 20px';
  const fs = size === 'lg' ? 22 : size === 'sm' ? 12 : 16;
  const off = pressed ? 4 : 0;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: disabled ? '#bbb' : color,
        color: textColor,
        fontFamily: 'var(--tc-display)', fontSize: fs, letterSpacing: 0.5,
        padding: pad, border: `4px solid ${borderColor}`,
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: pressed ? `0 0 0 0 ${borderColor}` : `0 6px 0 0 ${borderColor}, 0 8px 16px rgba(20, 30, 50, 0.1)`,
        transform: pressed ? 'translateY(6px)' : 'translateY(0)',
        transition: 'transform 0.05s steps(2), box-shadow 0.05s steps(2)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}>{children}</button>
  );
}

function PxTitle({ children, size = 36, color, theme, style }) {
  return (
    <div style={{
      fontFamily: 'var(--tc-display)', fontSize: size, letterSpacing: 1,
      color: color || theme.primary,
      textShadow: `3px 3px 0 ${theme.ink}`,
      lineHeight: 1.1, ...style,
    }}>{children}</div>
  );
}

// Generic chrome with a header bar — used by most screens.
function Screen({ theme, label, children, style }) {
  return (
    <div data-screen-label={label} style={{
      width: '100%', minHeight: '100vh',
      background: theme.bg,
      backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.ink}10 1.5px, transparent 1.5px)`,
      backgroundSize: '18px 18px',
      position: 'relative',
      ...style,
    }}>{children}</div>
  );
}

Object.assign(window, {
  ProtoApp, PUZZLES, PxPanel, PxButton, PxTitle, Screen,
  loadState, saveState, TC_STORAGE_KEY,
});
