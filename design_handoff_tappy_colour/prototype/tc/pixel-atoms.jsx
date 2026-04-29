// Pixel-art atoms used exclusively by the C · Pixel Native direction.
// PixelMascot — a 32x32 pixel sprite per mascot kind (more detail, softer feel).
// PixelPaletteRow — chunky pixel-bordered numbered swatches.
// PixelToolDock — chunky pixel-bordered tool buttons with pixel icons.

const { useEffect: pxUseEffect, useState: pxUseState, useMemo: pxUseMemo } = React;

// Render a sprite from an array of rows where each character is a
// palette index ('0'..'9','a'..'z') or '.' for transparent.
function PixelSprite({ rows, palette, scale = 4, style }) {
  const h = rows.length;
  const w = rows[0].length;
  const cells = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ') continue;
      const c = palette[ch];
      if (!c) continue;
      cells.push(
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={c}/>
      );
    }
  }
  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      style={{ shapeRendering: 'crispEdges', display: 'block', ...style }}
    >
      {cells}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 32×32 mascot sprites. Palette legend (per-kind palette overrides below):
//   a = main body fill
//   b = body outline / dark shade
//   h = body soft shade (between a and b)
//   c = white / belly / eye-white
//   l = light highlight on body
//   d = primary accent (beak, nose, paws, spots)
//   e = cheek pink
//   k = black (eye, mouth)
//   s = sparkle white
//   p, q, r = rainbow pink / yellow / mint (manes, accents)
//   g = secondary dark accent (whisker, claw)
// ─────────────────────────────────────────────────────────────
const PX_SPRITES = {
  // CHICK — Pip. Round, fluffy yellow body, orange beak + feet, side-glance smile, eye highlight.
  chick: [
    '................................',
    '................................',
    '............bbbbbb..............',
    '..........bbhaaaahbb............',
    '.........bhaaaaaaaahb...........',
    '........bhaalaaaaaalhb..........',
    '........baallaaaaaallab.........',
    '.......bhaaaaaaaaaaaaab.........',
    '.......baaaaaaaaaaaaaab.........',
    '.......baakksaaaaakksab.........',
    '.......baaksskaakssksab.........',
    '.......baaksskaakssksab.........',
    '.......baaakkaaaakkaaab.........',
    '......bdaaaaaaaaaaaaadb.........',
    '......bdddaaaaaaaaadddb.........',
    '.......baddddaaaadddab..........',
    '.......baeaaaaaaaaeaab..........',
    '.......baaaaaaaaaaaaab..........',
    '.......bhaaaaaaaaaaahb..........',
    '........bhaaaaaaaaahb...........',
    '.........bhaaaaaaahb............',
    '..........bbhaaahbb.............',
    '............bbbbb...............',
    '...........bb...bb..............',
    '..........bdd...bdd.............',
    '.........bdddd.bdddd............',
    '.........bdddd.bdddd............',
    '..........bbb...bbb.............',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
  // BUNNY — Rosie. Long ears with pink inside, white face, pink nose, whiskers.
  bunny: [
    '................................',
    '......bbb..............bbb......',
    '.....bhaab............bhaab.....',
    '....bhaeab............bhaeab....',
    '....baeeab............baeeab....',
    '....baeeab............baeeab....',
    '....baeebb............bbeeab....',
    '....baeab.............b.eab.....',
    '....baab................bab.....',
    '....baab................bab.....',
    '....bhaabb..........bbhaab......',
    '.....bbaaabbbbbbbbaaaaab........',
    '.......bhaaaaaaaaaaaaaab........',
    '......bhaaaaaaaaaaaaaaaab.......',
    '......baaaaaaaaaaaaaaaaab.......',
    '......baakksaaaaaaakksaab.......',
    '......baaksskaaaakssksaab.......',
    'gggggg.baakkaaaadkaakaab.gggggg.',
    'gggggggbaaaaaaadddaaaab.ggggggg.',
    '......bbaaeaaaadkdaaeaab........',
    '......bhaaaaaaaaaaaaaaab........',
    '......baaaakaaaaaakaaaab........',
    '......bhaaakkaaaakkaaahb........',
    '.......bhaakkkkkkkkahb..........',
    '........bhaaaaaaaaahb...........',
    '..........bbhaaahbb.............',
    '............bbbbb...............',
    '...........bb...bb..............',
    '..........bcc...bcc.............',
    '.........bcccc.bcccc............',
    '..........bbb...bbb.............',
    '................................',
  ],
  // BEAR — Bo. Round ears, snout, big eyes, pink tongue.
  bear: [
    '................................',
    '....bbb................bbb......',
    '...bhaab..............bhaab.....',
    '..bhaaab..............bhaaab....',
    '..baaaab..............baaaab....',
    '..baeaab..............baeaab....',
    '..baaaabb............bbaaaab....',
    '..bhaaaab............baaaaab....',
    '...bbaaaabbbbbbbbbbbbaaaaab.....',
    '.....bhaaaaaaaaaaaaaaaaaab......',
    '....bhaaaaaaaaaaaaaaaaaaaab.....',
    '....baaaaaaaaaaaaaaaaaaaaab.....',
    '....baakksaaaaaaaaaaakksaab.....',
    '....baaksskaaaaaaaakssksaab.....',
    '....baakkkaaaadddaaakkkaaab.....',
    '....bhaaaaaadddddddaaaaaahb.....',
    '.....baaaaadddddddddaaaaab......',
    '.....bhaaccccccccccccaaahb......',
    '......bhcccceeeeeeccccchb.......',
    '.......bccceeeeeeeeeccccb.......',
    '.......bccccceeeeeeccccab.......',
    '.......bcccccccccccccccb........',
    '........bbcccccccccccbb.........',
    '..........bbbcccccbbb...........',
    '............bbbbbb..............',
    '...........bb....bb.............',
    '..........bdd....bdd............',
    '.........bdddd..bdddd...........',
    '..........bbb....bbb............',
    '................................',
    '................................',
    '................................',
  ],
  // CAT — Mochi. Triangle ears, vertical pupils, pink nose, whiskers, stripes.
  cat: [
    '................................',
    '...bb....................bb.....',
    '...bab..................bab.....',
    '..bhab..................bahb....',
    '..baeab................baeab....',
    '..baeab................baeab....',
    '..baaab................baaab....',
    '..baaaabb............bbaaaab....',
    '..bhaaaaabbbbbbbbbbbbaaaaaab....',
    '...bbaaaaaaaaaaaaaaaaaaaaab.....',
    '....bhaaaaaaaaaaaaaaaaaaab......',
    '....baahaahaaaaaaaahaahaab......',
    '....baaaaaaaaaaaaaaaaaaaab......',
    '....baakkkaaaaaaaaaaakkkab......',
    '....baakksaaaaaaaaaakssksab.....',
    'g...baaksskaaaaaaaaaksskab...g..',
    'gg..baakkkaaaaeeaaaaakkkab..gg..',
    'ggg.baaaaaaaaeddeaaaaaaaab.ggg..',
    'gggg.baaaaaaeddddeaaaaaab.gggg..',
    'gggg.bbaeaaaadddaaaaaeab.gggg...',
    'g....bhaaaaaaaaaaaaaaab.g.......',
    '......baaaakaaaaaakaaab.........',
    '......bhaaakkaaaakkaaahb........',
    '.......bhaakkkkkkkkahb..........',
    '........bhaaaaaaaaahb...........',
    '..........bbhaaahbb.............',
    '...........bb.bb................',
    '..........bdd.bdd...............',
    '.........bdddd.bdddd............',
    '.........bdddd.bdddd............',
    '..........bbb...bbb.............',
    '................................',
  ],
  // FROG — Finn. Bulgy eyes on top, wide mouth, soft belly.
  frog: [
    '................................',
    '..........bbbb....bbbb..........',
    '........bhaaaab..bhaaaab........',
    '.......bhacccab..bcccaab........',
    '.......bhackkcb..bckkcab........',
    '.......baacckcb..bckccab........',
    '.......baccccab..bccccab........',
    '......bhaaaaaabbbbaaaaaab.......',
    '.....bhaaaaaaaaaaaaaaaaaab......',
    '....bhaaaaaaaaaaaaaaaaaaaab.....',
    '....baaaaaaaaaaaaaaaaaaaaab.....',
    '....baeaaaaaaaaaaaaaaaaaeaab....',
    '....baaaaaaaaaaaaaaaaaaaaaab....',
    '....baaaaaaaaaaaaaaaaaaaaaab....',
    '....baaaakkkkkkkkkkkkkaaaaab....',
    '....bhaakssccccccccskkaaaab.....',
    '.....baakcccccccccccckaaab......',
    '.....bhaakkkkkkkkkkkkahb........',
    '......bhaccccccccccchb..........',
    '......baccccccccccccab..........',
    '......baccceedddccccab..........',
    '......baccccdddddccab...........',
    '......baccccccccccab............',
    '.......bhccccccccab.............',
    '........bhcccccchb..............',
    '..........bbcccbb...............',
    '............bbb.................',
    '..........bb...bb...............',
    '.........baa...baa..............',
    '........baaaa.baaaa.............',
    '.........bbb...bbb..............',
    '................................',
  ],
  // FOX — Luna. Pointy ears, white face mask, sly eyes, fluffy tail.
  fox: [
    '................................',
    '...bb....................bb.....',
    '..bdab..................badb....',
    '..bdaab................baadb....',
    '..baaab................baaab....',
    '..baaaab..............baaaab....',
    '..baaaaabb..........bbaaaaab....',
    '..bhaaaaaabbbbbbbbbbaaaaaab.....',
    '...bhaaaaaaaaaaaaaaaaaaaab......',
    '....baccccccccccccccccccab......',
    '....bacccccccccccccccccccab.....',
    '....baacccccccccccccccccaab.....',
    '....bhaackkccccccccccckkaab.....',
    '....bhaackksccccccccckkscab.....',
    '....bhaccccccaaaaccccccccab.....',
    'gg..bhccccccaaaaaacccccccab..gg.',
    'ggg.bhcccccadkkdaccccccccab.ggg.',
    'gg..bhcccccaadddaccccccccab..gg.',
    '....bhaccccaaaaaaccccccccab.....',
    '.....bccccccccaaaaccccccab......',
    '.....bcccccaaaakkaaaccccab......',
    '......bhccaaaakkkkaaaccab.......',
    '.......bccaaaaaaaaaacccb........',
    '.......bbccccccccccccbb.........',
    '..........bbcccccccbb...........',
    '............bbbbbb..............',
    '...........bb....bb.............',
    '..........bdd....bdd............',
    '.........bdddd..bdddd...........',
    '..........bbb....bbb............',
    '................................',
    '................................',
  ],
  // OCTOPUS — Bibi. Bulb head, eight tentacles with suction dots.
  octopus: [
    '................................',
    '............bbbbbbbb............',
    '..........bbhaaaaaahbb..........',
    '.........bhaaaaaaaaaahb.........',
    '........bhaaaaaaaaaaaahb........',
    '.......bhaalaaaaaaaalaahb.......',
    '.......baaaaaaaaaaaaaaaab.......',
    '.......baeaaaaaaaaaaaaeaab......',
    '......bhaaaaaaaaaaaaaaaaab......',
    '......baakksaaaaaaaaakksab......',
    '......baaksskaaaaaakssksab......',
    '......baakkkaaaaaaaaakkkab......',
    '......baaaaaaaaaaaaaaaaaab......',
    '......baaaaaadddddaaaaaaab......',
    '......baaaaadkkkkdaaaaaab.......',
    '......bhaaaadddddaaaaaaab.......',
    '.......baaaaaaaaaaaaaaab........',
    '.......baaaaaaaaaaaaaaab........',
    '......bhabbabbabbabbabbab.......',
    '......b.b.b.b.b.b.b.b.b.b.......',
    '......bab.bab.bab.bab.bab.......',
    '.....bab...bab.bab...bab........',
    '.....bcb...bcb.bcb...bcb........',
    '.....b.b...b.b.b.b...b.b........',
    '....bb.bb.bb.bb.bb.bb.bb........',
    '...bb...bb...bb...bb...bb.......',
    '..bp.....bq...br...bp...bq......',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
  // DINO — Sprout. Spiky back, big belly, friendly eye, little legs.
  dino: [
    '................................',
    '.............d..d..d............',
    '............bdbdbdb.............',
    '...........bdadadab.............',
    '..........bddabababdb...........',
    '.........bdaababababbb..........',
    '........bhaaaaaaaaaaaab.........',
    '.......bhaaaaaaaaaaaaaab........',
    '......bhaaaaaaaaaaaaaaab........',
    '......baaakkksaaaaaakkksab......',
    '......baaksssksaaakssssksab.....',
    '......baakkkksaaakssksksaab.....',
    '......baakkkaaaaaaakkkaaaab.....',
    '......bhaaaaaeeaaaaaaaaaaab.....',
    '......bhaaaeeddeeaaaaaaaab......',
    '.......bhaadddddaaaaaaab........',
    '.......baaccccccccccaaab........',
    '.......bacccceeeecccccab........',
    '.......baccceeeeeeccccab........',
    '.......bacccccccccccccb.........',
    '........bccccccccccccab.........',
    '........bbcccccccccccbb.........',
    '.........bbcccccccccbb..........',
    '..........bbcccccccbb...........',
    '............bbbbbb..............',
    '..........bb....bb..............',
    '.........bdd....bdd.............',
    '........bdddd..bdddd............',
    '.........bbb....bbb.............',
    '................................',
    '................................',
    '................................',
  ],
  // UNICORN — Sparkle. White body, golden horn, rainbow mane, sparkles.
  unicorn: [
    '................s...............',
    '..s............................s',
    '.....................d..........',
    '....................dadb........',
    '....................dad.........',
    '...................daadb........',
    '..................daaadb........',
    '.....p...........bdaaab.........',
    '....pq...........baaaab.........',
    '...pqr...........baaaaab........',
    '...pqr.........bbbcaaaaab.......',
    '...pqr........bccaaaaaaab.......',
    '...pqrb......bcccaaaaaaab.......',
    '...pqrb.....bccccaaaaaaaab......',
    '....pqrb...bccccaaaaaaaaab......',
    '....pqrbbbbcccccaaaaaaaaab......',
    '....pqrbbbbcccccaaaaaaaaab......',
    '....pqrbbbbcccccaakksaakkab.....',
    '....pqrcccccccccaaksskakssab....',
    '....pqcccccccccccaakkaakkab.....',
    '....pcccccccccccaaaaeeaaaab.....',
    '....bccccccccccaaaaaeeaaaab.....',
    '.....cccccccccccaaaaaaaaab......',
    '......bccccccccccaaaaaaab.......',
    '......bcccccccccccaaaaab........',
    '......bbcccccccccccaaaab........',
    '.......bbccccccccccccaab........',
    '.........bbcccccbbbcccab........',
    '..........bb..bb..bbcab.........',
    '.........bdd..bdd..bdd..........',
    '........bdddd.bdddd.bdddd.......',
    '.........bbb..bbb...bbb.........',
  ],
  // POO — Plop. Smiling poop swirl with sparkles.
  poo: [
    '................................',
    '................................',
    '..........s............s........',
    '...............bbbbb............',
    '..............bhaaaab...........',
    '..............baaaaab...........',
    '..............baaaaab...........',
    '..........bbbbbaaaaab...........',
    '.........bhaaaaaaaaab...........',
    '........bhaaaaaaaaaaab..........',
    '........baakksaaakksaab.........',
    '........baaksskaksskaab.........',
    '........baakkaaaaakaaab.........',
    '......bbbaaaaaeddeaaaab.........',
    '.....bhaaaaaaaeddddeaaab........',
    '.....baaaaaaaaeeeeeeaaab........',
    '....bhaaaaaaaaaaaaaaaaab........',
    '....baaakksaaaaakksaaaab........',
    '....baaksskaaaakssksaaab........',
    '....baakkaaaaaaakkaaaaab........',
    '....bhaaaaaeeeeeaaaaaaab........',
    '....baaaaeedddddeeaaaaab........',
    '....bbaaaaeeeeeeeaaaaabb........',
    '...bhaaaaaaaaaaaaaaaaaab........',
    '...baaaaaaaaaaaaaaaaaaaab.......',
    '...bbaaaaaaaaaaaaaaaaaabb.......',
    '....bbbaaaaaaaaaaaaaaabb........',
    '......bbbbbaaaaaaabbbbb.........',
    '..........bbbbbbbb..............',
    '................................',
    '...........s.............s......',
    '................................',
  ],
  // SMILEY — Sunny. Classic round yellow smiley face.
  smiley: [
    '................................',
    '................................',
    '..........bbbbbbbbbbbb..........',
    '........bbhaaaaaaaaaahbb........',
    '.......bhaaaaaaaaaaaaaahb.......',
    '......bhaalaaaaaaaaaalaahb......',
    '.....bhaallaaaaaaaaaallaahb.....',
    '....bhaaalaaaaaaaaaaaalaaahb....',
    '....baaaaaaaaaaaaaaaaaaaaab.....',
    '...bhaaaaaaaaaaaaaaaaaaaaaab....',
    '...baaaaaaaaaaaaaaaaaaaaaaab....',
    '...baaaaakkkaaaaaaaaakkkaaab....',
    '...baaaakssskaaaaaakssskaaab....',
    '...baaaaksskkaaaaaakssskaaab....',
    '...baaaakkkkkaaaaaakkkkkaaab....',
    '...baaaaakkkaaaaaaakkkaaaaab....',
    '...baeaaaaaaaaaaaaaaaaaaeaab....',
    '...baeaaaaaaaaaaaaaaaaaaeaab....',
    '...baaaaaakaaaaaaaaaakaaaaab....',
    '....baaaaakkaaaaaaaakkaaaab.....',
    '....bhaaaakkkkkkkkkkkkaaab......',
    '.....baaaaakkkkkkkkkkaaab.......',
    '......bhaaaaaaaaaaaaaahb........',
    '.......bhaaaaaaaaaaaahb.........',
    '........bbhaaaaaaaahbb..........',
    '..........bbbbbbbbbb............',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
};

// Returns the palette for a mascot. Per-kind variants for things like
// fox white face, unicorn rainbow mane, etc.
function pxPalette(mascot) {
  const { body, accent, cheek, kind } = mascot;

  // Default palette — most mascots use this
  let p = {
    a: body,                       // body
    h: pxBlend(body, '#000000', 0.18), // soft mid-shade
    b: pxDarken(body, 0.40),       // outline / shadow
    l: pxBlend(body, '#ffffff', 0.30), // light highlight
    c: '#ffffff',                  // white / inner / belly
    d: accent,                     // beak / nose / spike accent
    e: cheek,                      // cheek / inner ear / belly soft
    k: '#1a1020',                  // eye / mouth black
    s: '#ffffff',                  // eye highlight
    p: '#ff5fa2',                  // rainbow pink
    q: '#ffd25f',                  // rainbow yellow
    r: '#7adfc1',                  // rainbow mint
    g: '#1a1020',                  // whisker / claw
  };

  if (kind === 'unicorn') {
    p.a = '#ffffff';
    p.h = '#f3e6f0';
    p.b = '#7a5a8a';
    p.l = '#ffffff';
    p.c = '#ffe5f3';
    p.d = '#f4b830';
    p.e = '#ff9bbd';
  }
  if (kind === 'poo') {
    p.a = '#8a5a3a';
    p.h = '#6f4628';
    p.b = '#3e2410';
    p.l = '#a87a5a';
    p.c = '#ffffff';
    p.d = '#a87a5a';
    p.e = '#ff9bbd';
  }
  if (kind === 'fox') {
    p.a = body;
    p.h = pxBlend(body, '#000000', 0.18);
    p.b = pxDarken(body, 0.45);
    p.l = pxBlend(body, '#ffffff', 0.3);
    p.c = '#ffffff';
    p.d = '#1a1020';
    p.e = '#1a1020';
  }
  if (kind === 'cat') {
    p.a = body;
    p.h = pxBlend(body, '#000000', 0.22);
    p.b = pxDarken(body, 0.50);
    p.d = '#ff7aa6';
    p.e = '#ff9bbd';
  }
  if (kind === 'frog') {
    p.c = '#ffffff';
  }
  return p;
}

function pxDarken(hex, amount = 0.3) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - amount))));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

function pxBlend(hex, withHex, amount = 0.3) {
  const parse = (h) => {
    const c = h.replace('#', '');
    return [
      parseInt(c.substring(0, 2), 16),
      parseInt(c.substring(2, 4), 16),
      parseInt(c.substring(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(withHex);
  const mix = (a, b) => Math.round(a * (1 - amount) + b * amount);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

function PixelMascot({ mascot, size = 80, wave = false, style }) {
  const rows = PX_SPRITES[mascot.kind] || PX_SPRITES.chick;
  const palette = pxPalette(mascot);
  const native = rows[0].length;
  const scale = size / native;
  return (
    <div
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        animation: wave ? 'tcMascotBob 1.4s steps(2) infinite' : undefined,
        transformOrigin: '50% 90%',
        ...style,
      }}
    >
      <PixelSprite rows={rows} palette={palette} scale={scale}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PixelPaletteRow — pixel-bordered numbered swatches.
// ─────────────────────────────────────────────────────────────
function PixelPaletteRow({ colors, selected = 0, progresses, theme, onPick, style }) {
  const sw = 56;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', ...style }}>
      {colors.map((c, i) => {
        const isSel = i === selected;
        const prog = progresses ? progresses[i] : null;
        const done = prog && prog[0] >= prog[1];
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => onPick && onPick(i)}
              style={{
                position: 'relative',
                transform: isSel ? 'translateY(-4px)' : 'none',
                transition: 'transform 0.1s steps(2)',
                background: 'none', border: 'none', padding: 0, cursor: onPick ? 'pointer' : 'default',
              }}>
              <div style={{
                width: sw, height: sw,
                background: c,
                border: `4px solid ${theme.ink}`,
                borderRadius: 6,
                boxShadow: isSel
                  ? `0 6px 0 0 ${theme.ink}, inset 0 0 0 3px #fff, 0 8px 16px rgba(0,0,0,0.12)`
                  : `0 4px 0 0 ${theme.ink}, 0 6px 12px rgba(0,0,0,0.08)`,
                position: 'relative',
                opacity: done ? 0.45 : 1,
              }}>
                <div style={{
                  position: 'absolute', top: 4, left: 4,
                  width: 6, height: 6, background: '#ffffff66', borderRadius: 2,
                }}/>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  fontFamily: 'var(--tc-display)', fontSize: 22, fontWeight: 700, color: '#fff',
                  textShadow: `2px 2px 0 ${theme.ink}`,
                }}>{i + 1}</div>
              </div>
            </button>
            {prog && (
              <div style={{ fontFamily: 'var(--tc-display)', fontSize: 10, color: theme.inkSoft, letterSpacing: 0.5 }}>
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
// PixelToolDock — pixel-bordered tool buttons with pixel icons.
// ─────────────────────────────────────────────────────────────
function PixelToolDock({ selected, theme, orientation = 'horizontal', onPick, style }) {
  const tools = [
    { id: 'tap', label: 'TAP' },
    { id: 'bucket', label: 'SPLASH' },
    { id: 'magic', label: 'MAGIC' },
  ];
  const dir = orientation === 'horizontal' ? 'row' : 'column';
  return (
    <div style={{ display: 'flex', flexDirection: dir, gap: 10, ...style }}>
      {tools.map(t => {
        const active = selected === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onPick && onPick(t.id)}
            style={{
              width: 72, height: 72,
              background: active ? theme.primary : theme.surface,
              color: active ? '#fff' : theme.ink,
              border: `4px solid ${theme.ink}`,
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--tc-display)',
              boxShadow: active
                ? `0 6px 0 0 ${theme.ink}, inset 0 0 0 3px #ffffff66, 0 8px 16px rgba(0,0,0,0.12)`
                : `0 4px 0 0 ${theme.ink}, 0 6px 12px rgba(0,0,0,0.08)`,
              transition: 'transform 0.1s steps(2)',
              transform: active ? 'translateY(-2px)' : 'none',
              padding: 0,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <PixelToolIcon id={t.id} color={active ? '#fff' : theme.ink}/>
              <div style={{ fontSize: 10, letterSpacing: 0.5, marginTop: 2 }}>{t.label}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PixelToolIcon({ id, color }) {
  // 12x12 mini icons
  const ICONS = {
    tap: [
      '............',
      '....aa......',
      '...aaaa.....',
      '...aaaaa....',
      '..aa.aaaa...',
      '..aa..aaaa..',
      '..aa...aaa..',
      '...a....aa..',
      '............',
      '............',
      '....bbbb....',
      '............',
    ],
    bucket: [
      '.aaaaaaa....',
      '.a.....a....',
      '.aaaaaaa....',
      '.aaaaaaa....',
      '.aaaaaaa....',
      '..aaaaaa....',
      '...aaaaa....',
      '....aaaa....',
      '.....aaa....',
      '......aa....',
      '.......a....',
      '............',
    ],
    magic: [
      '.........aa.',
      '........aa..',
      '.......aa...',
      '......aa....',
      '.....aa.....',
      '....aa..a...',
      '...aa.....a.',
      '..aa........',
      '.aa.........',
      'aa..........',
      'a...........',
      '............',
    ],
  };
  const rows = ICONS[id] || ICONS.tap;
  return <PixelSprite rows={rows} palette={{ a: color, b: color }} scale={3}/>;
}

Object.assign(window, {
  PixelSprite, PixelMascot, PixelPaletteRow, PixelToolDock,
  PX_SPRITES,
});
