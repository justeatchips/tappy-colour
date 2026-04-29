// Direction C — "Pixel Native" — celebrate the colour-by-numbers grid.
// Pixel borders, retro-game charm, Silkscreen font for headlines.

function PixelFrame({ theme, density, texture, label, children }) {
  return (
    <div data-screen-label={label} style={{
      width: 1180, height: 820, ...bgTexture(theme, 'dotty'),
      fontFamily: 'inherit', color: theme.ink,
      position: 'relative', overflow: 'hidden',
      imageRendering: 'pixelated',
    }}>
      {children}
    </div>
  );
}

// Pixel-bordered card: chunky stepped corners (no border-radius)
function PixelCard({ children, color = '#fff', borderColor, padding = 16, style, shadowColor }) {
  const sc = shadowColor || 'rgba(0,0,0,0.15)';
  return (
    <div style={{
      background: color,
      padding,
      border: `3px solid ${borderColor || '#1a1020'}`,
      boxShadow: `0 4px 0 ${borderColor || '#1a1020'}, 4px 4px 0 ${borderColor || '#1a1020'}, 4px 8px 0 ${sc}`,
      position: 'relative',
      ...style,
    }}>{children}</div>
  );
}

function PixelButton({ children, color, textColor = '#fff', borderColor = '#1a1020', size = 'md', onClick, style }) {
  const pad = size === 'lg' ? '16px 28px' : '10px 18px';
  const fs = size === 'lg' ? 18 : 14;
  return (
    <button onClick={onClick} style={{
      background: color, color: textColor, fontFamily: 'var(--tc-display)',
      fontSize: fs, padding: pad,
      border: `3px solid ${borderColor}`,
      boxShadow: `0 4px 0 ${borderColor}, 4px 4px 0 ${borderColor}`,
      cursor: 'pointer', letterSpacing: 1,
      ...style,
    }}>{children}</button>
  );
}

function PixelTitle({ children, theme, size = 36, color, style }) {
  return (
    <div style={{
      fontFamily: 'var(--tc-display)', fontSize: size,
      letterSpacing: 2, color: color || theme.primary,
      textShadow: `3px 3px 0 ${theme.ink}`,
      lineHeight: 1.1, ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// C1 — Home
// ─────────────────────────────────────────────────────────────
function PixelHome({ theme, mascot, density }) {
  return (
    <PixelFrame theme={theme} label="Home — Pixel">
      <div style={{ padding: 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <PixelCard color={theme.surface} borderColor={theme.ink} padding={10} shadowColor={theme.shadow}>
            <PixelMascot mascot={mascot} size={48} wave/>
          </PixelCard>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontFamily: 'var(--tc-display)', color: theme.inkSoft, letterSpacing: 1 }}>HI {mascot.name.toUpperCase()}!</div>
            <PixelTitle theme={theme} size={36}>TAPPY COLOUR</PixelTitle>
          </div>
          <PixelButton color={theme.surface} textColor={theme.ink} borderColor={theme.ink} size="md" style={{ width: 56, padding: '10px 0' }}>⚙</PixelButton>
        </div>

        {/* Big actions */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 26, justifyContent: 'center' }}>
          {[
            { icon: '📷', label: 'CAMERA', color: theme.primary },
            { icon: '🖼', label: 'PHOTOS', color: theme.accent },
            { icon: '🔍', label: 'SEARCH', color: theme.mint },
          ].map((b, i) => (
            <PixelCard key={i} color={b.color} borderColor={theme.ink} padding={18} shadowColor={theme.shadow} style={{ flex: '0 1 320px', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 32 }}>{b.icon}</div>
                <div style={{ fontFamily: 'var(--tc-display)', fontSize: 18, letterSpacing: 1.5 }}>{b.label}</div>
              </div>
            </PixelCard>
          ))}
        </div>

        {/* Gallery row */}
        <div style={{ fontFamily: 'var(--tc-display)', fontSize: 18, letterSpacing: 1.5, marginBottom: 12, color: theme.ink, textAlign: 'center' }}>★ MY PICTURES</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, justifyContent: 'center' }}>
          {TC_SAMPLE_GALLERY.map(a => (
            <PixelCard key={a.id} color={theme.surface} borderColor={theme.ink} padding={8} shadowColor={theme.shadow} style={{ width: 184 }}>
              <div style={{ width: '100%', aspectRatio: '1 / 1', background: theme.bgAlt, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PuzzlePreview shape={a.id} palette={TC_SAMPLE_PALETTES[a.palette]} cell={13} painted={a.progress}/>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{a.title}</div>
              {a.complete
                ? <div style={{ fontFamily: 'var(--tc-display)', fontSize: 11, color: theme.primary, letterSpacing: 1 }}>★ DONE</div>
                : <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 8, background: theme.bgAlt, border: `2px solid ${theme.ink}` }}>
                      <div style={{ width: `${a.progress * 100}%`, height: '100%', background: theme.primary }}/>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800 }}>{Math.round(a.progress * 100)}%</div>
                  </div>}
            </PixelCard>
          ))}
        </div>

        {/* Starters */}
        <div style={{ fontFamily: 'var(--tc-display)', fontSize: 16, letterSpacing: 1.5, marginBottom: 8, color: theme.inkSoft, textAlign: 'center' }}>OR PICK A STARTER</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {TC_STARTERS.map(s => (
            <PixelCard key={s.id} color={theme.surface} borderColor={theme.ink} padding={6} shadowColor={theme.shadow} style={{ width: 120 }}>
              <div style={{ width: '100%', aspectRatio: '1 / 1', background: s.hue + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <PuzzlePreview shape={s.id} palette={[s.hue, darken(s.hue, 0.2), '#fff']} cell={9} painted={1.0}/>
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, textAlign: 'center' }}>{s.title}</div>
            </PixelCard>
          ))}
        </div>
      </div>
    </PixelFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// C2 — Difficulty
// ─────────────────────────────────────────────────────────────
function PixelDifficulty({ theme, mascot, density, value = 0.45 }) {
  const grid = Math.round(16 + value * 64);
  const palette = Math.round(6 + value * 18);
  const chickCount = Math.round(1 + value * 11);
  return (
    <PixelFrame theme={theme} label="Difficulty — Pixel">
      <div style={{ padding: 32, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <PixelButton color={theme.surface} textColor={theme.ink} borderColor={theme.ink}>← BACK</PixelButton>
          <PixelTitle theme={theme} size={28} style={{ flex: 1, textAlign: 'center' }}>HOW HARD?</PixelTitle>
          <div style={{ width: 90 }}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, flex: 1 }}>
          <PixelCard color={theme.surface} borderColor={theme.ink} padding={14} shadowColor={theme.shadow}>
            <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${theme.primarySoft}, ${theme.accentSoft})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PixelMascot mascot={mascot} size={240} wave/>
            </div>
          </PixelCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <PixelCard color={theme.surface} borderColor={theme.ink} padding={20} shadowColor={theme.shadow}>
              <div style={{ fontFamily: 'var(--tc-display)', fontSize: 14, letterSpacing: 1.5, color: theme.inkSoft, marginBottom: 14 }}>CHICK METER</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, padding: '12px 4px', minHeight: 60, background: theme.bgAlt, border: `3px solid ${theme.ink}`, marginBottom: 18 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ opacity: i < chickCount ? 1 : 0.18 }}>
                    <PixelChick size={28} color={mascot.body} accent={mascot.accent}/>
                  </div>
                ))}
              </div>

              <div style={{ position: 'relative', height: 32, marginBottom: 18 }}>
                <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 12, background: theme.bgAlt, border: `3px solid ${theme.ink}` }}/>
                <div style={{ position: 'absolute', top: 12, left: 0, width: `${value * 100}%`, height: 12, background: theme.primary, border: `3px solid ${theme.ink}` }}/>
                <div style={{ position: 'absolute', top: 0, left: `calc(${value * 100}% - 14px)`, width: 28, height: 28, background: theme.primary, border: `3px solid ${theme.ink}` }}/>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Stat3 theme={theme} label="GRID" value={`${grid}×${grid}`}/>
                <Stat3 theme={theme} label="COLOURS" value={palette}/>
                <Stat3 theme={theme} label="TIME" value={value < 0.4 ? '~10M' : value < 0.7 ? '~30M' : '60M+'}/>
              </div>
            </PixelCard>

            <PixelButton color={theme.primary} borderColor={theme.ink} size="lg" style={{ alignSelf: 'center' }}>▶ START!</PixelButton>
          </div>
        </div>
      </div>
    </PixelFrame>
  );
}

function Stat3({ theme, label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--tc-display)', fontSize: 20, color: theme.ink, letterSpacing: 1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'var(--tc-display)', fontSize: 10, color: theme.inkSoft, marginTop: 6, letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// C3 — Puzzle
// ─────────────────────────────────────────────────────────────
function PixelPuzzle({ theme, mascot, density }) {
  const palette = TC_SAMPLE_PALETTES.unicorn;
  const progresses = palette.map((_, i) => [Math.round((1 - i * 0.1) * 30), 30]);
  return (
    <PixelFrame theme={theme} label="Puzzle — Pixel">
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 22px', gap: 12, borderBottom: `3px solid ${theme.ink}`, background: theme.surface }}>
        <PixelButton color={theme.bgAlt} textColor={theme.ink} borderColor={theme.ink} size="md">← HOME</PixelButton>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--tc-display)', fontSize: 20, letterSpacing: 1.5 }}>UNICORN</div>
        <PixelButton color={theme.bgAlt} textColor={theme.ink} borderColor={theme.ink} size="md">↶ UNDO</PixelButton>
      </div>

      <div style={{ padding: '8px 22px', display: 'flex', alignItems: 'center', gap: 12, background: theme.surface, borderBottom: `3px solid ${theme.ink}` }}>
        <div style={{ flex: 1, height: 14, background: theme.bgAlt, border: `3px solid ${theme.ink}` }}>
          <div style={{ width: '64%', height: '100%', background: theme.primary, borderRight: `3px solid ${theme.ink}` }}/>
        </div>
        <div style={{ fontFamily: 'var(--tc-display)', fontSize: 12, letterSpacing: 1 }}>64% DONE</div>
      </div>

      <div style={{ display: 'flex', gap: 16, padding: '20px 22px', height: 530 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <PixelToolDock selected="tap" theme={theme} orientation="vertical"/>
        </div>

        <PixelCard color={theme.surface} borderColor={theme.ink} padding={16} shadowColor={theme.shadow} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <PuzzlePreview shape="unicorn" palette={palette} cell={42} painted={0.62} showNumbers/>
          <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
            <PixelCard color={theme.sun} borderColor={theme.ink} padding="6px 12px" shadowColor={theme.shadow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--tc-display)', fontSize: 12, letterSpacing: 1 }}>
                <PixelMascot mascot={mascot} size={26}/> WAHOO!
              </div>
            </PixelCard>
          </div>
        </PixelCard>
      </div>

      <div style={{ padding: '0 22px 14px' }}>
        <PixelCard color={theme.surface} borderColor={theme.ink} padding="10px 14px" shadowColor={theme.shadow}>
          <div style={{ fontFamily: 'var(--tc-display)', fontSize: 11, letterSpacing: 1.5, color: theme.inkSoft, marginBottom: 6 }}>PALETTE — HOLD TO SWAP</div>
          <PixelPaletteRow colors={palette} selected={2} progresses={progresses} theme={theme}/>
        </PixelCard>
      </div>
    </PixelFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// C4 — Completion
// ─────────────────────────────────────────────────────────────
function PixelCompletion({ theme, mascot, density }) {
  return (
    <PixelFrame theme={theme} label="Completion — Pixel">
      <Confetti theme={theme}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <PixelMascot mascot={mascot} size={140} wave/>
        <PixelTitle theme={theme} size={64}>WAHOO!</PixelTitle>
        <div style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', maxWidth: 480 }}>★ NEW ARTWORK COMPLETE ★</div>
        <PixelCard color={theme.surface} borderColor={theme.ink} padding={14} shadowColor={theme.shadow}>
          <div style={{ background: theme.bgAlt, padding: 12 }}>
            <PuzzlePreview shape="unicorn" palette={TC_SAMPLE_PALETTES.unicorn} cell={20} painted={1.0}/>
          </div>
        </PixelCard>
        <div style={{ display: 'flex', gap: 14 }}>
          <PixelButton color={theme.primary} borderColor={theme.ink} size="lg">SAVE!</PixelButton>
          <PixelButton color={theme.surface} textColor={theme.ink} borderColor={theme.ink} size="lg">NEW PIC</PixelButton>
        </div>
      </div>
    </PixelFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// C5 — Settings
// ─────────────────────────────────────────────────────────────
function PixelSettings({ theme, mascot, density }) {
  return (
    <PixelFrame theme={theme} label="Settings — Pixel">
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <PixelButton color={theme.surface} textColor={theme.ink} borderColor={theme.ink}>← DONE</PixelButton>
          <PixelTitle theme={theme} size={28}>SETTINGS</PixelTitle>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { title: 'Internet picture search', sub: 'Lets your child search safe images', toggle: true, on: true },
            { title: 'Sound effects', sub: 'Beeps and bloops', toggle: true, on: true },
            { title: 'Default difficulty', sub: 'Where the slider starts', chicks: 6 },
            { title: 'Auto-fill backgrounds', sub: 'Skip big plain areas', toggle: true, on: true },
            { title: 'Pre-painted starters', sub: 'Fewer chicks at the start', toggle: true, on: false },
            { title: 'Clear all artwork', sub: 'Delete saved pictures', danger: true, button: 'CLEAR ALL' },
          ].map((s, i) => (
            <PixelCard key={i} color={theme.surface} borderColor={theme.ink} padding={16} shadowColor={theme.shadow}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: s.danger ? '#d54864' : theme.ink }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: theme.inkSoft, fontWeight: 600 }}>{s.sub}</div>
                </div>
                {s.toggle ? <PixelToggle theme={theme} on={s.on}/> :
                 s.chicks ? <div style={{ display: 'flex', gap: 2 }}>{Array.from({ length: s.chicks }).map((_, j) => <PixelChick key={j} size={18} color={mascot.body} accent={mascot.accent}/>)}</div> :
                 s.button ? <PixelButton color="#ffd0d6" textColor="#d54864" borderColor="#d54864">{s.button}</PixelButton> : null}
              </div>
            </PixelCard>
          ))}
        </div>
      </div>
    </PixelFrame>
  );
}

function PixelToggle({ theme, on }) {
  return (
    <div style={{ width: 56, height: 28, background: on ? theme.mint : theme.bgAlt, border: `3px solid ${theme.ink}`, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: on ? 24 : 0, width: 24, height: 22, background: '#fff', borderLeft: `3px solid ${theme.ink}`, borderRight: on ? `0` : `3px solid ${theme.ink}` }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// C6 — Onboarding
// ─────────────────────────────────────────────────────────────
function PixelOnboarding({ theme, mascot, density }) {
  return (
    <PixelFrame theme={theme} label="Onboarding — Pixel">
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ fontFamily: 'var(--tc-display)', fontSize: 12, letterSpacing: 2, color: theme.inkSoft, marginBottom: 8 }}>★ STEP 1 OF 3 ★</div>
        <PixelTitle theme={theme} size={42} style={{ textAlign: 'center', marginBottom: 8 }}>PICK YOUR BUDDY</PixelTitle>
        <div style={{ fontSize: 16, color: theme.inkSoft, marginBottom: 24, fontWeight: 700 }}>they cheer you on while you colour</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {TC_MASCOTS.map((m, i) => (
            <PixelCard key={m.id} color={i === 1 ? theme.primarySoft : theme.surface} borderColor={i === 1 ? theme.primary : theme.ink} padding={10} shadowColor={theme.shadow} style={{ width: 130, textAlign: 'center' }}>
              <PixelMascot mascot={m} size={84} wave={i === 1}/>
              <div style={{ fontFamily: 'var(--tc-display)', fontSize: 14, letterSpacing: 1, marginTop: 4 }}>{m.name.toUpperCase()}</div>
              <div style={{ fontSize: 10, color: theme.inkSoft, fontWeight: 700 }}>{m.tag}</div>
            </PixelCard>
          ))}
        </div>

        <PixelButton color={theme.primary} borderColor={theme.ink} size="lg">▶ THAT'S THE ONE!</PixelButton>
      </div>
    </PixelFrame>
  );
}

Object.assign(window, {
  PixelHome, PixelDifficulty, PixelPuzzle,
  PixelCompletion, PixelSettings, PixelOnboarding,
});
