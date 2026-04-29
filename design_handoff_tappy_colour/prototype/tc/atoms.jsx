// Atoms for Tappy Colour designs.
// Mascot, PuzzlePreview (the colour-by-numbers grid as decoration),
// PaletteRow, ToolDock, and a few shared shapes.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Mascot — chunky, cute, vector. Each kind is a different silhouette
// using simple SVG shapes (no fancy paths). Has eye blink animation.
// ─────────────────────────────────────────────────────────────
function Mascot({ mascot, size = 80, expression = 'happy', wave = false, style }) {
  const m = mascot;
  const animRef = useRef(null);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let t;
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 140);
      t = setTimeout(blink, 2400 + Math.random() * 2400);
    };
    t = setTimeout(blink, 1500 + Math.random() * 2000);
    return () => clearTimeout(t);
  }, []);

  // Common eye, mouth, cheek
  const Eye = ({ cx, cy, r = 4 }) => (
    blinking
      ? <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#1a1020" strokeWidth="2.4" strokeLinecap="round"/>
      : <>
          <circle cx={cx} cy={cy} r={r} fill="#1a1020"/>
          <circle cx={cx + r * 0.35} cy={cy - r * 0.35} r={r * 0.32} fill="#fff"/>
        </>
  );
  const Cheek = ({ cx, cy, r = 4 }) => (
    <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.7} fill={m.cheek} opacity="0.7"/>
  );
  const Mouth = ({ cx, cy }) => (
    expression === 'wow'
      ? <ellipse cx={cx} cy={cy} rx="3.2" ry="4.5" fill="#3a1820"/>
      : expression === 'sleep'
        ? <path d={`M ${cx-4} ${cy} Q ${cx} ${cy-2} ${cx+4} ${cy}`} stroke="#1a1020" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        : <path d={`M ${cx-3.5} ${cy} Q ${cx} ${cy+3.2} ${cx+3.5} ${cy}`} stroke="#1a1020" strokeWidth="2" fill="none" strokeLinecap="round"/>
  );

  const draw = () => {
    switch (m.kind) {
      case 'chick':
        return <>
          {/* feet */}
          <path d="M 38 92 L 38 96 M 36 96 L 40 96" stroke={m.accent} strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M 62 92 L 62 96 M 60 96 L 64 96" stroke={m.accent} strokeWidth="2.2" strokeLinecap="round"/>
          {/* body */}
          <ellipse cx="50" cy="58" rx="32" ry="34" fill={m.body}/>
          {/* wing */}
          <path d="M 22 56 Q 18 70 28 76 Q 32 70 30 60 Z" fill={m.accent} opacity="0.3"/>
          {/* head fluff */}
          <circle cx="44" cy="28" r="3" fill={m.accent} opacity="0.5"/>
          <circle cx="50" cy="24" r="3.5" fill={m.accent} opacity="0.5"/>
          <circle cx="56" cy="28" r="3" fill={m.accent} opacity="0.5"/>
          {/* beak */}
          <path d="M 50 60 L 44 64 L 50 67 Z" fill={m.accent}/>
          {/* eyes */}
          <Eye cx={42} cy={52}/>
          <Eye cx={58} cy={52}/>
          <Cheek cx={36} cy={62}/>
          <Cheek cx={64} cy={62}/>
        </>;
      case 'bunny':
        return <>
          {/* ears */}
          <ellipse cx="38" cy="18" rx="6" ry="16" fill={m.body}/>
          <ellipse cx="62" cy="18" rx="6" ry="16" fill={m.body}/>
          <ellipse cx="38" cy="20" rx="3" ry="11" fill={m.cheek}/>
          <ellipse cx="62" cy="20" rx="3" ry="11" fill={m.cheek}/>
          {/* body */}
          <ellipse cx="50" cy="62" rx="30" ry="30" fill={m.body}/>
          {/* nose */}
          <path d="M 50 60 L 46 63 L 50 65 L 54 63 Z" fill={m.accent}/>
          <line x1="50" y1="65" x2="50" y2="69" stroke="#1a1020" strokeWidth="1.6"/>
          <Eye cx={40} cy={54}/>
          <Eye cx={60} cy={54}/>
          <Cheek cx={34} cy={64}/>
          <Cheek cx={66} cy={64}/>
          <Mouth cx={50} cy={72}/>
        </>;
      case 'bear':
        return <>
          <circle cx="30" cy="32" r="9" fill={m.body}/>
          <circle cx="70" cy="32" r="9" fill={m.body}/>
          <circle cx="30" cy="32" r="4" fill={m.accent} opacity="0.5"/>
          <circle cx="70" cy="32" r="4" fill={m.accent} opacity="0.5"/>
          <circle cx="50" cy="58" r="34" fill={m.body}/>
          <ellipse cx="50" cy="68" rx="14" ry="11" fill={m.cheek} opacity="0.5"/>
          <circle cx="50" cy="64" r="3.5" fill={m.accent}/>
          <Eye cx={40} cy={54}/>
          <Eye cx={60} cy={54}/>
          <Mouth cx={50} cy={72}/>
        </>;
      case 'cat':
        return <>
          <path d="M 22 30 L 30 14 L 40 28 Z" fill={m.body}/>
          <path d="M 60 28 L 70 14 L 78 30 Z" fill={m.body}/>
          <path d="M 25 28 L 30 18 L 36 28 Z" fill={m.cheek}/>
          <path d="M 64 28 L 70 18 L 75 28 Z" fill={m.cheek}/>
          <circle cx="50" cy="58" r="32" fill={m.body}/>
          <Eye cx={40} cy={54} r={4.5}/>
          <Eye cx={60} cy={54} r={4.5}/>
          <path d="M 50 64 L 47 67 L 50 70 L 53 67 Z" fill={m.accent}/>
          <path d="M 50 70 Q 46 74 42 72 M 50 70 Q 54 74 58 72" stroke="#1a1020" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
          <Cheek cx={30} cy={62}/>
          <Cheek cx={70} cy={62}/>
          {/* whiskers */}
          <line x1="30" y1="66" x2="20" y2="64" stroke="#1a1020" strokeWidth="1.2"/>
          <line x1="30" y1="68" x2="20" y2="70" stroke="#1a1020" strokeWidth="1.2"/>
          <line x1="70" y1="66" x2="80" y2="64" stroke="#1a1020" strokeWidth="1.2"/>
          <line x1="70" y1="68" x2="80" y2="70" stroke="#1a1020" strokeWidth="1.2"/>
        </>;
      case 'frog':
        return <>
          {/* eyes on top */}
          <circle cx="32" cy="28" r="11" fill={m.body}/>
          <circle cx="68" cy="28" r="11" fill={m.body}/>
          <circle cx="32" cy="28" r="6" fill="#fff"/>
          <circle cx="68" cy="28" r="6" fill="#fff"/>
          <Eye cx={32} cy={28} r={3.5}/>
          <Eye cx={68} cy={28} r={3.5}/>
          {/* body */}
          <ellipse cx="50" cy="62" rx="34" ry="28" fill={m.body}/>
          <ellipse cx="50" cy="68" rx="20" ry="10" fill={m.cheek} opacity="0.4"/>
          <Mouth cx={50} cy={66}/>
          <Cheek cx={28} cy={62}/>
          <Cheek cx={72} cy={62}/>
        </>;
      case 'fox':
        return <>
          <path d="M 22 24 L 32 14 L 36 32 Z" fill={m.body}/>
          <path d="M 64 32 L 68 14 L 78 24 Z" fill={m.body}/>
          <path d="M 26 24 L 32 20 L 33 30 Z" fill={m.accent}/>
          <path d="M 67 30 L 68 20 L 74 24 Z" fill={m.accent}/>
          <path d="M 18 60 Q 50 30 82 60 Q 78 92 50 92 Q 22 92 18 60 Z" fill={m.body}/>
          <path d="M 36 70 Q 50 80 64 70 L 64 86 Q 50 92 36 86 Z" fill="#fff" opacity="0.85"/>
          <Eye cx={40} cy={56}/>
          <Eye cx={60} cy={56}/>
          <path d="M 50 66 L 46 69 L 50 72 L 54 69 Z" fill="#1a1020"/>
          <Mouth cx={50} cy={76}/>
        </>;
      case 'octopus':
        return <>
          {/* head */}
          <path d="M 16 50 Q 16 18 50 18 Q 84 18 84 50 L 84 64 Q 50 60 16 64 Z" fill={m.body}/>
          {/* tentacles */}
          <path d="M 18 60 Q 16 78 22 88 Q 28 80 28 64 Z" fill={m.body}/>
          <path d="M 32 62 Q 32 84 38 92 Q 44 84 42 64 Z" fill={m.body}/>
          <path d="M 46 62 Q 46 84 52 92 Q 58 84 56 64 Z" fill={m.body}/>
          <path d="M 60 62 Q 60 84 66 92 Q 72 84 70 64 Z" fill={m.body}/>
          <path d="M 74 60 Q 78 78 82 88 Q 84 80 82 64 Z" fill={m.body}/>
          {/* dots */}
          <circle cx="22" cy="78" r="1.5" fill={m.accent} opacity="0.4"/>
          <circle cx="38" cy="80" r="1.5" fill={m.accent} opacity="0.4"/>
          <circle cx="52" cy="80" r="1.5" fill={m.accent} opacity="0.4"/>
          <circle cx="66" cy="80" r="1.5" fill={m.accent} opacity="0.4"/>
          <circle cx="78" cy="78" r="1.5" fill={m.accent} opacity="0.4"/>
          <Eye cx={40} cy={42}/>
          <Eye cx={60} cy={42}/>
          <Cheek cx={32} cy={50}/>
          <Cheek cx={68} cy={50}/>
          <Mouth cx={50} cy={52}/>
        </>;
      case 'dino':
        return <>
          {/* spikes */}
          <path d="M 30 36 L 34 28 L 38 36 Z" fill={m.accent}/>
          <path d="M 42 30 L 46 22 L 50 30 Z" fill={m.accent}/>
          <path d="M 54 30 L 58 22 L 62 30 Z" fill={m.accent}/>
          <path d="M 66 36 L 70 28 L 74 36 Z" fill={m.accent}/>
          {/* body */}
          <ellipse cx="50" cy="58" rx="34" ry="32" fill={m.body}/>
          {/* belly */}
          <ellipse cx="50" cy="68" rx="22" ry="16" fill={m.cheek} opacity="0.4"/>
          <Eye cx={40} cy={52}/>
          <Eye cx={60} cy={52}/>
          <Cheek cx={32} cy={62}/>
          <Cheek cx={68} cy={62}/>
          <Mouth cx={50} cy={68}/>
        </>;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: size, height: size, display: 'inline-block', ...style }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{
          overflow: 'visible',
          animation: wave ? 'tcMascotBob 1.4s ease-in-out infinite' : undefined,
          transformOrigin: '50% 90%',
        }}
      >
        {draw()}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pixel-art versions of the chick row, for the difficulty slider.
// ─────────────────────────────────────────────────────────────
function PixelChick({ size = 24, color = '#ffd25f', accent = '#ff8a3d' }) {
  // 7x7 pixel chick
  const px = size / 7;
  const dots = [
    [2, 0], [3, 0], [4, 0],
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
    [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
    [2, 4], [3, 4], [4, 4],
    [2, 5], [4, 5],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ shapeRendering: 'crispEdges' }}>
      {dots.map(([x, y], i) => (
        <rect key={i} x={x * px} y={y * px} width={px} height={px} fill={color}/>
      ))}
      {/* beak */}
      <rect x={3 * px} y={2 * px} width={px} height={px} fill={accent}/>
      {/* eye */}
      <rect x={4 * px} y={1.5 * px} width={px * 0.5} height={px * 0.5} fill="#1a1020"/>
      <rect x={2 * px} y={1.5 * px} width={px * 0.5} height={px * 0.5} fill="#1a1020"/>
      {/* feet */}
      <rect x={2 * px} y={6 * px} width={px} height={px * 0.4} fill={accent}/>
      <rect x={4 * px} y={6 * px} width={px} height={px * 0.4} fill={accent}/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// PuzzlePreview — renders a fake colour-by-numbers grid using a
// simple shape mask. Cells either show their colour (painted) or
// just a number on white (unpainted).
// ─────────────────────────────────────────────────────────────
const TC_SHAPES = {
  unicorn: [
    '...11.11...',
    '..1232321..',
    '.123535321.',
    '.123444321.',
    '.123455321.',
    '.124444421.',
    '.234555432.',
    '..2444442..',
    '...23332...',
    '....222....',
  ],
  cat: [
    '..11...11..',
    '.1221.1221.',
    '.1232.2321.',
    '.1233333321',
    '.1233553321',
    '.1233553321',
    '.1234443321',
    '..123333321',
    '...1333321.',
    '....22222..',
  ],
  rocket: [
    '....11....',
    '...1221...',
    '..123321..',
    '..123321..',
    '..123321..',
    '..123321..',
    '..123321..',
    '..145541..',
    '..1...1...',
    '..2...2...',
  ],
  flower: [
    '..1.111.1..',
    '.121.1.121.',
    '.123.1.321.',
    '..1232321..',
    '...12321...',
    '....111....',
    '....222....',
    '....222....',
    '...22.22...',
    '..222.222..',
  ],
  dino: [
    '....11.....',
    '....122....',
    '...122222..',
    '..1222222..',
    '..1222222..',
    '..2222222..',
    '...122222..',
    '...1...1...',
    '...2...2...',
    '...22..22..',
  ],
  butterfly: [
    '.11..1..11.',
    '1221.1.1221',
    '1232.1.2321',
    '12321.12321',
    '12321.12321',
    '1221.1.1221',
    '.11..1..11.',
    '...........',
    '....111....',
    '....222....',
  ],
  castle: [
    '1.1.1.1.1.1',
    '11111111111',
    '11211211211',
    '11111111111',
    '111.111.111',
    '11111311111',
    '11113331111',
    '11113331111',
    '11111111111',
    '11111111111',
  ],
  whale: [
    '...........',
    '..1111.....',
    '.122222111.',
    '12222222221',
    '13222222221',
    '12222222221',
    '.122222221.',
    '..111111...',
    '....1.1....',
    '...........',
  ],
};

function PuzzlePreview({ shape = 'unicorn', palette, cell = 14, painted = 1.0, showNumbers = false, style }) {
  const grid = TC_SHAPES[shape] || TC_SHAPES.unicorn;
  const rows = grid.length;
  const cols = grid[0].length;
  // Determine which cells to "paint" based on `painted` ratio
  const filledCells = useMemo(() => {
    const list = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = grid[y][x];
        if (ch !== '.') list.push({ x, y, n: parseInt(ch, 10) });
      }
    }
    // deterministic shuffle by simple hash so painted reveal looks organic
    list.sort((a, b) => ((a.x * 7 + a.y * 13) % 17) - ((b.x * 7 + b.y * 13) % 17));
    return list;
  }, [shape]);
  const paintCount = Math.floor(filledCells.length * painted);
  const isPainted = (x, y) => {
    const idx = filledCells.findIndex(c => c.x === x && c.y === y);
    return idx >= 0 && idx < paintCount;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
        gridTemplateRows: `repeat(${rows}, ${cell}px)`,
        gap: 1,
        background: '#e8e2d8',
        padding: 1,
        borderRadius: 4,
        ...style,
      }}
    >
      {grid.map((row, y) => row.split('').map((ch, x) => {
        if (ch === '.') {
          return <div key={`${x}-${y}`} style={{ background: 'transparent' }}/>;
        }
        const n = parseInt(ch, 10);
        const color = palette[n - 1] || '#ddd';
        const filled = isPainted(x, y);
        return (
          <div
            key={`${x}-${y}`}
            style={{
              background: filled ? color : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: cell * 0.55,
              fontWeight: 600,
              color: '#9a8a78',
              fontFamily: 'system-ui',
              transition: 'background 0.2s',
            }}
          >
            {!filled && showNumbers ? n : ''}
          </div>
        );
      }))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PaletteRow — the strip of numbered colour swatches.
// ─────────────────────────────────────────────────────────────
function PaletteRow({ colors, selected = 0, progresses, theme, density = 'chunky', style }) {
  const scale = density === 'chunky' ? 1 : 0.78;
  const sw = 56 * scale;
  const gap = 10 * scale;
  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-end', ...style }}>
      {colors.map((c, i) => {
        const isSel = i === selected;
        const prog = progresses ? progresses[i] : null;
        const done = prog && prog[0] >= prog[1];
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: sw, height: sw,
                background: c,
                borderRadius: sw * 0.28,
                boxShadow: isSel
                  ? `0 0 0 4px #fff, 0 0 0 7px ${theme.ink}, 0 6px 14px ${theme.shadow}`
                  : `0 4px 0 0 rgba(0,0,0,0.08), 0 2px 4px ${theme.shadow}`,
                position: 'relative',
                transform: isSel ? 'translateY(-3px)' : 'none',
                transition: 'transform 0.18s, box-shadow 0.18s',
                opacity: done ? 0.55 : 1,
              }}
            >
              {done && (
                <div style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 22, height: 22, borderRadius: '50%',
                  background: theme.mint, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14, boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                }}>✓</div>
              )}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: sw * 0.42,
                textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                fontFamily: 'inherit',
              }}>{i + 1}</div>
            </div>
            {prog && (
              <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 600 }}>
                {prog[0]}/{prog[1]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Texture backgrounds.
// ─────────────────────────────────────────────────────────────
function bgTexture(theme, kind = 'flat') {
  switch (kind) {
    case 'dotty':
      return {
        backgroundColor: theme.bg,
        backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.ink}10 1.5px, transparent 1.5px)`,
        backgroundSize: '18px 18px',
      };
    case 'striped':
      return {
        backgroundColor: theme.bg,
        backgroundImage: `repeating-linear-gradient(45deg, ${theme.ink}06 0 8px, transparent 8px 16px)`,
      };
    case 'paper':
      return {
        backgroundColor: theme.bg,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, ${theme.primarySoft}55 0%, transparent 35%),
          radial-gradient(circle at 80% 60%, ${theme.accentSoft}55 0%, transparent 35%),
          repeating-linear-gradient(0deg, transparent 0 28px, ${theme.ink}05 28px 29px)
        `,
      };
    case 'flat':
    default:
      return { backgroundColor: theme.bg };
  }
}

// ─────────────────────────────────────────────────────────────
// Sticker — a chunky rounded card with optional rotation.
// ─────────────────────────────────────────────────────────────
function Sticker({ children, color = '#fff', rotate = 0, padding = 16, radius = 20, shadow, style }) {
  return (
    <div
      style={{
        background: color,
        borderRadius: radius,
        padding,
        transform: `rotate(${rotate}deg)`,
        boxShadow: shadow || '0 6px 0 rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.08)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PrimaryButton — the chunky CTA used everywhere.
// ─────────────────────────────────────────────────────────────
function PrimaryButton({ children, color, textColor = '#fff', size = 'lg', style, onClick }) {
  const pad = size === 'lg' ? '18px 32px' : size === 'md' ? '12px 22px' : '8px 16px';
  const fs = size === 'lg' ? 22 : size === 'md' ? 17 : 14;
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: textColor,
        fontWeight: 800,
        fontFamily: 'inherit',
        fontSize: fs,
        padding: pad,
        border: 'none',
        borderRadius: 18,
        cursor: 'pointer',
        boxShadow: `0 5px 0 0 ${darken(color, 0.18)}, 0 8px 20px rgba(0,0,0,0.12)`,
        transition: 'transform 0.1s, box-shadow 0.1s',
        ...style,
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = `0 2px 0 0 ${darken(color, 0.18)}, 0 4px 10px rgba(0,0,0,0.1)`; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 5px 0 0 ${darken(color, 0.18)}, 0 8px 20px rgba(0,0,0,0.12)`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 5px 0 0 ${darken(color, 0.18)}, 0 8px 20px rgba(0,0,0,0.12)`; }}
    >
      {children}
    </button>
  );
}

function darken(hex, amount = 0.2) {
  // crude darken — accept any hex
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - amount))));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

// ─────────────────────────────────────────────────────────────
// ToolDock — three painting tools with selectable highlight.
// ─────────────────────────────────────────────────────────────
function ToolDock({ selected = 'tap', theme, density = 'chunky', orientation = 'horizontal', onPick }) {
  const tools = [
    { id: 'tap',     label: 'Tap',     icon: <ToolTapIcon/> },
    { id: 'bucket',  label: 'Splash',  icon: <ToolBucketIcon/> },
    { id: 'fillAll', label: 'Magic',   icon: <ToolMagicIcon/> },
  ];
  const sz = density === 'chunky' ? 64 : 50;
  const flexDir = orientation === 'vertical' ? 'column' : 'row';
  return (
    <div style={{ display: 'flex', flexDirection: flexDir, gap: 10 }}>
      {tools.map(t => {
        const active = t.id === selected;
        return (
          <button
            key={t.id}
            onClick={() => onPick && onPick(t.id)}
            style={{
              width: sz, height: sz,
              background: active ? theme.primary : '#fff',
              color: active ? '#fff' : theme.ink,
              border: 'none',
              borderRadius: sz * 0.3,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
              boxShadow: active
                ? `0 4px 0 0 ${darken(theme.primary, 0.18)}, 0 6px 14px ${theme.shadow}`
                : `0 4px 0 0 ${theme.bgAlt}, 0 4px 10px ${theme.shadow}`,
              transition: 'transform 0.15s',
              transform: active ? 'translateY(-2px) scale(1.04)' : 'none',
              position: 'relative',
            }}
            title={t.label}
          >
            {t.icon}
          </button>
        );
      })}
    </div>
  );
}

function ToolTapIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 3 C 12 3, 8 7, 8 11 a 4 4 0 0 0 8 0 C 16 7, 12 3, 12 3 Z" fill="currentColor"/>
    <circle cx="12" cy="11" r="1.5" fill="#fff"/>
  </svg>;
}
function ToolBucketIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M5 9 L 12 4 L 19 9 L 17 19 L 7 19 Z" fill="currentColor"/>
    <ellipse cx="12" cy="9" rx="7" ry="2" fill="rgba(255,255,255,0.4)"/>
  </svg>;
}
function ToolMagicIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M5 19 L 17 7 L 19 9 L 7 21 Z" fill="currentColor"/>
    <path d="M14 4 L 15 6 L 17 7 L 15 8 L 14 10 L 13 8 L 11 7 L 13 6 Z" fill="currentColor"/>
    <circle cx="20" cy="14" r="1.2" fill="currentColor"/>
    <circle cx="4" cy="6" r="1" fill="currentColor"/>
  </svg>;
}

// ─────────────────────────────────────────────────────────────
// Confetti — quick deterministic burst for completion screen.
// ─────────────────────────────────────────────────────────────
function Confetti({ count = 36, theme }) {
  const colors = [theme.primary, theme.accent, theme.mint, theme.sun];
  const pieces = useMemo(() => {
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push({
        x: (i * 37) % 100,
        y: (i * 23) % 100,
        c: colors[i % colors.length],
        r: ((i * 13) % 60) - 30,
        s: 6 + (i % 4) * 3,
        d: (i % 5) * 0.2,
      });
    }
    return out;
  }, [count, theme.id]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.s, height: p.s * 0.4,
          background: p.c,
          borderRadius: 2,
          transform: `rotate(${p.r}deg)`,
          opacity: 0.85,
          animation: `tcConfetti ${2 + p.d}s ease-in-out ${p.d}s infinite`,
        }}/>
      ))}
    </div>
  );
}

Object.assign(window, {
  Mascot, PixelChick, PuzzlePreview, PaletteRow, ToolDock,
  Sticker, PrimaryButton, Confetti, bgTexture, darken,
  TC_SHAPES,
});
