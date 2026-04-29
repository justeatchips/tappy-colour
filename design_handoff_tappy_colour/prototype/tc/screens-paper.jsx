// Direction B — "Paper Craft" — warm paper textures, sticker shapes,
// hand-drawn edges, scrapbook palette. Uses cream theme by default.

function PaperFrame({ theme, density, texture, label, children }) {
  // override texture to paper feel for this direction
  const bg = bgTexture(theme, 'paper');
  return (
    <div data-screen-label={label} style={{
      width: 1180, height: 820, ...bg,
      fontFamily: 'inherit', color: theme.ink,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* paper grain noise overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle at 50% 50%, transparent 60%, rgba(80,60,30,0.08) 100%)`,
      }}/>
      {children}
    </div>
  );
}

// Tape strip (decorative)
function Tape({ color, rotate = 0, style }) {
  return (
    <div style={{
      width: 80, height: 22, background: color, opacity: 0.65,
      transform: `rotate(${rotate}deg)`,
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0 2px, transparent 2px 4px)',
      ...style,
    }}/>
  );
}

// Hand-drawn frame using SVG paths
function PaperCard({ children, color = '#fff', rotate = 0, padding = 20, style }) {
  return (
    <div style={{
      background: color,
      padding,
      transform: `rotate(${rotate}deg)`,
      borderRadius: 14,
      boxShadow: '0 2px 0 rgba(0,0,0,0.04), 0 8px 18px rgba(80,60,30,0.12), inset 0 0 0 1px rgba(80,60,30,0.06)',
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// B1 — Home
// ─────────────────────────────────────────────────────────────
function PaperHome({ theme, mascot, density, texture }) {
  return (
    <PaperFrame theme={theme} label="Home — Paper">
      {/* Header strip */}
      <div style={{ padding: '28px 40px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <Tape color={theme.primary} rotate={-8} style={{ position: 'absolute', top: -8, left: 28 }}/>
          <PaperCard color="#fff" rotate={-2} padding="10px 18px">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mascot mascot={mascot} size={56} wave/>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.inkSoft, letterSpacing: 1 }}>HI {mascot.name.toUpperCase()}!</div>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--tc-display)', lineHeight: 1 }}>Tappy Colour</div>
              </div>
            </div>
          </PaperCard>
        </div>
        <div style={{ flex: 1 }}/>
        <button style={{
          width: 50, height: 50, background: '#fff', border: 'none', borderRadius: 12,
          boxShadow: '0 4px 10px rgba(80,60,30,0.15)', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 22,
        }}>⚙</button>
      </div>

      {/* Action stickers */}
      <div style={{ display: 'flex', gap: 16, padding: '0 40px', marginBottom: 24 }}>
        {[
          { icon: '📷', label: 'Snap a photo', color: theme.primary, rot: -1.5 },
          { icon: '🖼', label: 'Pick a photo', color: theme.accent, rot: 1.5 },
          { icon: '🔍', label: 'Search safely', color: theme.mint, rot: -1 },
        ].map((b, i) => (
          <PaperCard key={i} color={b.color} rotate={b.rot} padding="20px 22px" style={{ flex: 1, color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 36, lineHeight: 1 }}>{b.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>{b.label}</div>
            </div>
          </PaperCard>
        ))}
      </div>

      {/* My Pictures — like a scrapbook */}
      <div style={{ padding: '0 40px', marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>My Pictures</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.inkSoft }}>{TC_SAMPLE_GALLERY.length} so far</div>
      </div>
      <div style={{ display: 'flex', gap: 22, padding: '14px 40px 24px', flexWrap: 'nowrap' }}>
        {TC_SAMPLE_GALLERY.map((a, i) => (
          <div key={a.id} style={{ position: 'relative', transform: `rotate(${[-2, 1.5, -1, 2][i] || 0}deg)` }}>
            <Tape color={i % 2 ? theme.primary : theme.accent} rotate={[-12, 8, -10, 12][i] || 0} style={{ position: 'absolute', top: -10, left: 50 }}/>
            <PaperCard color="#fff" padding={10} style={{ width: 180 }}>
              <div style={{
                width: '100%', aspectRatio: '1 / 1', background: theme.bgAlt,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, borderRadius: 6,
              }}>
                <PuzzlePreview shape={a.id} palette={TC_SAMPLE_PALETTES[a.palette]} cell={13} painted={a.progress}/>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{a.title}</div>
              {a.complete
                ? <div style={{ fontSize: 12, color: theme.primary, fontWeight: 800 }}>★ Finished</div>
                : <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 6, background: theme.bgAlt, borderRadius: 3 }}>
                      <div style={{ width: `${a.progress * 100}%`, height: '100%', background: theme.primary, borderRadius: 3 }}/>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: theme.inkSoft }}>{Math.round(a.progress * 100)}%</div>
                  </div>}
            </PaperCard>
          </div>
        ))}
      </div>

      {/* Starters */}
      <div style={{ padding: '0 40px 6px', fontSize: 18, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>or pick a starter ✨</div>
      <div style={{ display: 'flex', gap: 14, padding: '8px 40px' }}>
        {TC_STARTERS.map((s, i) => (
          <PaperCard key={s.id} color="#fff" rotate={[-1, 1, -1.5, 0.5][i]} padding={8} style={{ width: 120 }}>
            <div style={{
              width: '100%', aspectRatio: '1 / 1', background: s.hue + '22',
              borderRadius: 4, marginBottom: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PuzzlePreview shape={s.id} palette={[s.hue, darken(s.hue, 0.2), '#fff']} cell={9} painted={1.0}/>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center' }}>{s.title}</div>
          </PaperCard>
        ))}
      </div>
    </PaperFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B2 — Difficulty
// ─────────────────────────────────────────────────────────────
function PaperDifficulty({ theme, mascot, density, texture, value = 0.45 }) {
  const grid = Math.round(16 + value * 64);
  const palette = Math.round(6 + value * 18);
  const chickCount = Math.round(1 + value * 11);
  return (
    <PaperFrame theme={theme} label="Difficulty — Paper">
      <div style={{ padding: 36, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <button style={{ padding: '8px 16px', background: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 3px 8px rgba(80,60,30,0.15)' }}>← Back</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 26, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>How tricky?</div>
          <div style={{ width: 80 }}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, flex: 1 }}>
          <PaperCard color="#fff" rotate={-1.5} padding={16}>
            <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${theme.primarySoft}, ${theme.accentSoft})`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mascot mascot={mascot} size={240} wave/>
            </div>
          </PaperCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PaperCard color="#fff" rotate={1} padding={20}>
              <div style={{ fontSize: 13, fontWeight: 800, color: theme.inkSoft, letterSpacing: 1, marginBottom: 14 }}>HOW MANY CHICKS?</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, padding: '12px 4px', minHeight: 60, background: theme.bgAlt, borderRadius: 8, marginBottom: 20 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ opacity: i < chickCount ? 1 : 0.18 }}>
                    <PixelChick size={28} color={mascot.body} accent={mascot.accent}/>
                  </div>
                ))}
              </div>

              <div style={{ position: 'relative', height: 36, marginBottom: 18 }}>
                <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 8, background: theme.bgAlt, borderRadius: 4 }}/>
                <div style={{ position: 'absolute', top: 16, left: 0, width: `${value * 100}%`, height: 8, background: theme.primary, borderRadius: 4 }}/>
                <div style={{ position: 'absolute', top: 4, left: `calc(${value * 100}% - 16px)`, width: 32, height: 32, background: '#fff', borderRadius: '50%', border: `4px solid ${theme.primary}`, boxShadow: '0 4px 8px rgba(80,60,30,0.2)' }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Stat theme={theme} label="Squares" value={`${grid}×${grid}`}/>
                <Stat theme={theme} label="Colours" value={palette}/>
                <Stat theme={theme} label="About" value={value < 0.4 ? '~10m' : value < 0.7 ? '~30m' : '60m+'}/>
              </div>
            </PaperCard>

            <PrimaryButton color={theme.primary} size="lg" style={{ alignSelf: 'center', transform: 'rotate(-1deg)' }}>Let's go! ✏️</PrimaryButton>
          </div>
        </div>
      </div>
    </PaperFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B3 — Puzzle
// ─────────────────────────────────────────────────────────────
function PaperPuzzle({ theme, mascot, density, texture }) {
  const palette = TC_SAMPLE_PALETTES.unicorn;
  const progresses = palette.map((_, i) => [Math.round((1 - i * 0.1) * 30), 30]);
  return (
    <PaperFrame theme={theme} label="Puzzle — Paper">
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', gap: 12 }}>
        <button style={{ padding: '8px 14px', background: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 3px 8px rgba(80,60,30,0.12)' }}>← Home</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: theme.inkSoft, fontWeight: 700 }}>colouring</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>Unicorn ✨</div>
        </div>
        <button style={{ padding: '8px 14px', background: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 3px 8px rgba(80,60,30,0.12)' }}>↶ Undo</button>
      </div>

      <div style={{ display: 'flex', gap: 14, padding: '0 24px', height: 580 }}>
        <div style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <ToolDock selected="tap" theme={theme} density={density} orientation="vertical"/>
        </div>

        <PaperCard color="#fff" rotate={-0.5} padding={20} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* tape on corners */}
          <Tape color={theme.primary} rotate={-25} style={{ position: 'absolute', top: -8, left: 30 }}/>
          <Tape color={theme.accent} rotate={20} style={{ position: 'absolute', top: -8, right: 30 }}/>

          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PuzzlePreview shape="unicorn" palette={palette} cell={42} painted={0.62} showNumbers/>
          </div>

          <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
            <PaperCard color={theme.sun} rotate={-3} padding="6px 10px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800 }}>
                <Mascot mascot={mascot} size={26}/> Nice!
              </div>
            </PaperCard>
          </div>
        </PaperCard>
      </div>

      <div style={{ padding: '14px 24px' }}>
        <PaperCard color="#fff" rotate={0.5} padding="10px 14px">
          <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 800, marginBottom: 6, letterSpacing: 1 }}>YOUR PALETTE — long-press to swap</div>
          <PaletteRow colors={palette} selected={2} progresses={progresses} theme={theme} density={density}/>
        </PaperCard>
      </div>
    </PaperFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B4 — Completion
// ─────────────────────────────────────────────────────────────
function PaperCompletion({ theme, mascot, density, texture }) {
  return (
    <PaperFrame theme={theme} label="Completion — Paper">
      <Confetti theme={theme}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <Mascot mascot={mascot} size={140} expression="wow" wave/>
        <div style={{ fontSize: 60, fontWeight: 800, fontFamily: 'var(--tc-display)', color: theme.primary, transform: 'rotate(-2deg)' }}>WAHOO!</div>
        <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', maxWidth: 480 }}>Your unicorn is done — and it looks <span style={{ color: theme.accent }}>incredible</span>.</div>
        <div style={{ position: 'relative' }}>
          <Tape color={theme.primary} rotate={-15} style={{ position: 'absolute', top: -8, left: -10 }}/>
          <Tape color={theme.mint} rotate={18} style={{ position: 'absolute', top: -8, right: -10 }}/>
          <PaperCard color="#fff" rotate={-2} padding={16}>
            <div style={{ background: theme.bgAlt, padding: 12, borderRadius: 6 }}>
              <PuzzlePreview shape="unicorn" palette={TC_SAMPLE_PALETTES.unicorn} cell={20} painted={1.0}/>
            </div>
          </PaperCard>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <PrimaryButton color={theme.primary} size="lg">Save it!</PrimaryButton>
          <PrimaryButton color="#fff" textColor={theme.ink} size="lg">New picture</PrimaryButton>
        </div>
      </div>
    </PaperFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// B5 — Settings
// ─────────────────────────────────────────────────────────────
function PaperSettings({ theme, mascot, density, texture }) {
  return (
    <PaperFrame theme={theme} label="Settings — Paper">
      <div style={{ padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button style={{ padding: '8px 16px', background: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 3px 8px rgba(80,60,30,0.12)' }}>← Done</button>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>Settings</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {[
            { title: 'Internet picture search', sub: 'Lets your child search safe images', toggle: true, on: true, rot: -1 },
            { title: 'Sound effects', sub: 'Pops, plops & cheers', toggle: true, on: true, rot: 1 },
            { title: 'Default difficulty', sub: 'Where the slider starts', chicks: 6, rot: -0.5 },
            { title: 'Auto-fill backgrounds', sub: 'Skip big plain areas', toggle: true, on: true, rot: 0.5 },
            { title: 'Pre-painted starters', sub: 'Fewer chicks at the start', toggle: true, on: false, rot: -1 },
            { title: 'Clear all artwork', sub: 'Delete saved pictures', danger: true, button: 'Clear all', rot: 1 },
          ].map((s, i) => (
            <PaperCard key={i} color="#fff" rotate={s.rot} padding={18}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.danger ? '#d54864' : theme.ink }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: theme.inkSoft, fontWeight: 600 }}>{s.sub}</div>
                </div>
                {s.toggle ? <Toggle theme={theme} on={s.on}/> :
                 s.chicks ? <div style={{ display: 'flex', gap: 2 }}>{Array.from({ length: s.chicks }).map((_, j) => <PixelChick key={j} size={18} color={mascot.body} accent={mascot.accent}/>)}</div> :
                 s.button ? <button style={{ background: '#fff5f5', color: '#d54864', border: 'none', padding: '8px 14px', borderRadius: 8, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>{s.button}</button> : null}
              </div>
            </PaperCard>
          ))}
        </div>
      </div>
    </PaperFrame>
  );
}

function Toggle({ theme, on }) {
  return (
    <div style={{ width: 56, height: 32, borderRadius: 16, background: on ? theme.mint : theme.bgAlt, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 27 : 3, width: 26, height: 26, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// B6 — Onboarding (mascot picker)
// ─────────────────────────────────────────────────────────────
function PaperOnboarding({ theme, mascot, density, texture }) {
  return (
    <PaperFrame theme={theme} label="Onboarding — Paper">
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36 }}>
        <div style={{ fontSize: 13, color: theme.inkSoft, fontWeight: 800, letterSpacing: 1 }}>STEP 1 OF 3</div>
        <div style={{ fontSize: 44, fontWeight: 800, fontFamily: 'var(--tc-display)', textAlign: 'center', margin: '8px 0', transform: 'rotate(-1deg)' }}>Pick your buddy ✨</div>
        <div style={{ fontSize: 17, color: theme.inkSoft, marginBottom: 26, fontWeight: 700 }}>They cheer you on while you colour</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 26 }}>
          {TC_MASCOTS.map((m, i) => (
            <PaperCard key={m.id} color={i === 1 ? theme.primarySoft : '#fff'} rotate={[-2, 1, -1, 1.5, -1.5, 2, -1, 1][i]} padding={12} style={{ width: 130, textAlign: 'center', border: i === 1 ? `3px solid ${theme.primary}` : 'none' }}>
              <Mascot mascot={m} size={84} wave={i === 1}/>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 700 }}>{m.tag}</div>
            </PaperCard>
          ))}
        </div>

        <PrimaryButton color={theme.primary} size="lg">That's the one! →</PrimaryButton>
      </div>
    </PaperFrame>
  );
}

function Stat({ theme, label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--tc-display)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 700, marginTop: 4 }}>{label}</div>
    </div>
  );
}

Object.assign(window, {
  PaperHome, PaperDifficulty, PaperPuzzle,
  PaperCompletion, PaperSettings, PaperOnboarding,
});
