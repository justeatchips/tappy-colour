// Direction A — "Squishy" — chunky rounded shapes, candy palette, lively mascots.
// All 6 screens for this direction.

const { useState: useStateA, useEffect: useEffectA } = React;

function ScreenFrame({ theme, density = 'chunky', texture = 'flat', children, label, style }) {
  return (
    <div
      data-screen-label={label}
      style={{
        width: 1180, height: 820,
        ...bgTexture(theme, texture),
        fontFamily: 'inherit',
        color: theme.ink,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// A1 — Home / Gallery
// ─────────────────────────────────────────────────────────────
function SquishyHome({ theme, mascot, density, texture }) {
  const sample = TC_SAMPLE_GALLERY;
  const starters = TC_STARTERS;
  return (
    <ScreenFrame theme={theme} density={density} texture={texture} label="Home — Squishy">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 36px', gap: 18 }}>
        <Mascot mascot={mascot} size={64} wave/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: theme.inkSoft, fontWeight: 600, letterSpacing: 0.5 }}>HI {mascot.name.toUpperCase()}!</div>
          <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, fontFamily: 'var(--tc-display)' }}>Tappy Colour</div>
        </div>
        <button style={iconBtn(theme)} aria-label="Settings">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={theme.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Big import buttons */}
      <div style={{ display: 'flex', gap: 18, padding: '0 36px', marginBottom: 24 }}>
        <BigImportCard color={theme.primary} icon="📷" title="Snap a photo" subtitle="Use the camera"/>
        <BigImportCard color={theme.accent} icon="🖼️" title="Pick from photos" subtitle="From your iPad"/>
        <BigImportCard color={theme.mint} icon="🔍" title="Search a picture" subtitle="Find something fun"/>
      </div>

      {/* My Pictures section */}
      <div style={{ padding: '0 36px', marginBottom: 12 }}>
        <SectionHeader theme={theme} title="My Pictures" emoji="🎨" count={sample.length}/>
      </div>
      <div style={{ display: 'flex', gap: 18, padding: '0 36px', marginBottom: 22, overflowX: 'visible' }}>
        {sample.map(a => (
          <GalleryCard key={a.id} artwork={a} theme={theme} palette={TC_SAMPLE_PALETTES[a.palette]}/>
        ))}
      </div>

      {/* Starters */}
      <div style={{ padding: '0 36px', marginBottom: 12 }}>
        <SectionHeader theme={theme} title="Pick a starter" emoji="✨" count={starters.length}/>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '0 36px' }}>
        {starters.map(s => (
          <StarterCard key={s.id} starter={s} theme={theme}/>
        ))}
      </div>
    </ScreenFrame>
  );
}

function iconBtn(theme) {
  return {
    width: 52, height: 52,
    background: '#fff', border: 'none', borderRadius: 16,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 4px 0 ${theme.bgAlt}, 0 4px 10px ${theme.shadow}`,
  };
}

function BigImportCard({ color, icon, title, subtitle }) {
  return (
    <div style={{
      flex: 1,
      background: color,
      borderRadius: 26,
      padding: '22px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      cursor: 'pointer',
      boxShadow: `0 6px 0 ${darken(color, 0.18)}, 0 10px 24px rgba(0,0,0,0.1)`,
      color: '#fff',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 18,
        background: 'rgba(255,255,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>{title}</div>
        <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function SectionHeader({ theme, title, emoji, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--tc-display)', color: theme.ink }}>
        {emoji} {title}
      </div>
      <div style={{ fontSize: 14, color: theme.inkSoft, fontWeight: 700 }}>{count}</div>
    </div>
  );
}

function GalleryCard({ artwork, theme, palette }) {
  const pct = Math.round(artwork.progress * 100);
  return (
    <div style={{
      width: 200,
      background: '#fff',
      borderRadius: 22,
      padding: 12,
      boxShadow: `0 5px 0 ${theme.bgAlt}, 0 8px 18px ${theme.shadow}`,
      position: 'relative',
    }}>
      <div style={{
        width: '100%', aspectRatio: '1 / 1',
        borderRadius: 14,
        background: theme.bgAlt,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', marginBottom: 10,
      }}>
        <PuzzlePreview shape={artwork.id} palette={palette} cell={14} painted={artwork.progress}/>
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: theme.ink, marginBottom: 4 }}>{artwork.title}</div>
      {artwork.complete ? (
        <div style={{ fontSize: 13, color: theme.mint, fontWeight: 700 }}>★ Finished!</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1, height: 8, background: theme.bgAlt, borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
              borderRadius: 4,
            }}/>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.inkSoft }}>{pct}%</div>
        </div>
      )}
    </div>
  );
}

function StarterCard({ starter, theme }) {
  return (
    <div style={{
      width: 150, padding: 14, background: '#fff',
      borderRadius: 20,
      boxShadow: `0 4px 0 ${theme.bgAlt}, 0 6px 14px ${theme.shadow}`,
      textAlign: 'center',
    }}>
      <div style={{
        width: '100%', aspectRatio: '1 / 1',
        background: starter.hue + '33',
        borderRadius: 14, marginBottom: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <PuzzlePreview shape={starter.id} palette={[starter.hue, darken(starter.hue, 0.2), '#fff']} cell={11} painted={1.0}/>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{starter.title}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// A2 — Difficulty Picker (chick row)
// ─────────────────────────────────────────────────────────────
function SquishyDifficulty({ theme, mascot, density, texture, value = 0.45 }) {
  const grid = Math.round(16 + value * (80 - 16));
  const palette = Math.round(6 + value * (24 - 6));
  // chick row
  const chickCount = Math.round(1 + value * 11);
  return (
    <ScreenFrame theme={theme} density={density} texture={texture} label="Difficulty — Squishy">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 36px', gap: 14 }}>
        <button style={{
          ...iconBtn(theme), width: 'auto', padding: '0 18px', fontSize: 16, fontWeight: 800, color: theme.ink, fontFamily: 'inherit',
        }}>← Home</button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 28, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>
          My new picture
        </div>
        <div style={{ width: 110 }}/>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, padding: '0 48px' }}>
        {/* Left: source preview */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.inkSoft, marginBottom: 8 }}>YOUR PICTURE</div>
          <div style={{
            width: '100%', aspectRatio: '1 / 1',
            background: '#fff', borderRadius: 28,
            boxShadow: `0 6px 0 ${theme.bgAlt}, 0 10px 22px ${theme.shadow}`,
            padding: 16, position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '100%', height: '100%',
              borderRadius: 16,
              background: `linear-gradient(135deg, ${theme.primarySoft}, ${theme.accentSoft})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'monospace', color: theme.inkSoft, fontSize: 13,
            }}>
              <Mascot mascot={mascot} size={220} wave/>
            </div>
          </div>
        </div>

        {/* Right: difficulty picker */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.inkSoft, marginBottom: 8 }}>HOW HARD?</div>
          <div style={{
            background: '#fff', borderRadius: 28, padding: 24,
            boxShadow: `0 6px 0 ${theme.bgAlt}, 0 10px 22px ${theme.shadow}`,
          }}>
            {/* Chick row */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              gap: 4, padding: '8px 4px', minHeight: 60,
              background: theme.bgAlt, borderRadius: 14, marginBottom: 18,
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ opacity: i < chickCount ? 1 : 0.18, transform: `scale(${i < chickCount ? 1 : 0.85})`, transition: 'opacity 0.2s' }}>
                  <PixelChick size={28} color={mascot.body} accent={mascot.accent}/>
                </div>
              ))}
            </div>

            {/* Slider */}
            <div style={{ position: 'relative', height: 40, marginBottom: 14 }}>
              <div style={{
                position: 'absolute', top: 18, left: 0, right: 0, height: 12,
                background: theme.bgAlt, borderRadius: 6,
              }}/>
              <div style={{
                position: 'absolute', top: 18, left: 0, width: `${value * 100}%`, height: 12,
                background: `linear-gradient(90deg, ${theme.mint}, ${theme.primary})`,
                borderRadius: 6,
              }}/>
              <div style={{
                position: 'absolute', top: 4, left: `calc(${value * 100}% - 20px)`, width: 40, height: 40,
                background: '#fff', borderRadius: '50%',
                boxShadow: `0 4px 0 ${theme.bgAlt}, 0 6px 14px ${theme.shadow}`,
                border: `4px solid ${theme.primary}`,
              }}/>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
              <Stat theme={theme} label="Squares" value={`${grid}×${grid}`}/>
              <Stat theme={theme} label="Colours" value={palette}/>
              <Stat theme={theme} label="About" value={value < 0.4 ? '~10 min' : value < 0.7 ? '~30 min' : '60+ min'}/>
            </div>

            {/* Easy/Hard labels with mascots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 700, color: theme.inkSoft }}>
              <span>🐣 Easy peasy</span>
              <span>Pro mode 🐉</span>
            </div>
          </div>

          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <PrimaryButton color={theme.primary} size="lg">Let's colour! ✨</PrimaryButton>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

function Stat({ theme, label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--tc-display)', color: theme.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 700, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// A3 — Puzzle (the colouring screen)
// ─────────────────────────────────────────────────────────────
function SquishyPuzzle({ theme, mascot, density, texture }) {
  const palette = TC_SAMPLE_PALETTES.unicorn;
  const progresses = palette.map((_, i) => [Math.round((1 - i * 0.1) * 30), 30]);
  return (
    <ScreenFrame theme={theme} density={density} texture={texture} label="Puzzle — Squishy">
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', gap: 12 }}>
        <button style={{
          padding: '10px 18px', background: '#fff', border: 'none', borderRadius: 14,
          fontWeight: 800, fontSize: 14, color: theme.ink, cursor: 'pointer',
          boxShadow: `0 3px 0 ${theme.bgAlt}, 0 4px 8px ${theme.shadow}`, fontFamily: 'inherit',
        }}>← Home</button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Mascot mascot={mascot} size={36}/>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>Unicorn</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...iconBtn(theme), width: 44, height: 44, fontSize: 18, fontWeight: 800, color: theme.ink, fontFamily: 'inherit' }}>↶</button>
          <button style={{ ...iconBtn(theme), width: 44, height: 44, fontSize: 18, fontWeight: 800, color: theme.ink, fontFamily: 'inherit' }}>⊙</button>
        </div>
      </div>

      {/* Progress ribbon */}
      <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 10, background: '#fff', borderRadius: 5, overflow: 'hidden', boxShadow: `inset 0 1px 2px ${theme.shadow}` }}>
          <div style={{ width: '64%', height: '100%', background: `linear-gradient(90deg, ${theme.mint}, ${theme.primary}, ${theme.accent})`, borderRadius: 5 }}/>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: theme.inkSoft }}>64% done</div>
      </div>

      {/* Main canvas + side dock */}
      <div style={{ display: 'flex', gap: 16, padding: '0 24px', height: 540 }}>
        {/* Tool dock vertical on left */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <ToolDock selected="tap" theme={theme} density={density} orientation="vertical"/>
          <div style={{ height: 12 }}/>
          <div style={{ width: 64, textAlign: 'center', fontSize: 11, color: theme.inkSoft, fontWeight: 700 }}>TOOLS</div>
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: 28,
          boxShadow: `0 6px 0 ${theme.bgAlt}, 0 10px 22px ${theme.shadow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, position: 'relative', overflow: 'hidden',
        }}>
          <PuzzlePreview shape="unicorn" palette={palette} cell={42} painted={0.62} showNumbers/>
          {/* sparkle pop */}
          <div style={{
            position: 'absolute', top: '38%', left: '54%',
            width: 36, height: 36, borderRadius: '50%',
            background: 'radial-gradient(circle, #fff 0%, transparent 70%)',
            mixBlendMode: 'overlay', pointerEvents: 'none',
          }}/>
          {/* mascot peek */}
          <div style={{ position: 'absolute', bottom: 14, right: 14 }}>
            <Sticker color={theme.sun + 'cc'} radius={16} padding="8px 12px" rotate={-3} shadow={`0 3px 0 ${darken(theme.sun, 0.2)}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: theme.ink }}>
                <Mascot mascot={mascot} size={28}/>
                Wahoo!
              </div>
            </Sticker>
          </div>
        </div>
      </div>

      {/* Palette strip */}
      <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '10px 14px',
          boxShadow: `0 4px 0 ${theme.bgAlt}, 0 6px 14px ${theme.shadow}`,
          flex: 1, overflow: 'hidden',
        }}>
          <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 700, marginBottom: 6 }}>YOUR COLOURS · long-press to change</div>
          <PaletteRow colors={palette} selected={2} progresses={progresses} theme={theme} density={density}/>
        </div>
      </div>
    </ScreenFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// A4 — Completion celebration
// ─────────────────────────────────────────────────────────────
function SquishyCompletion({ theme, mascot, density, texture }) {
  return (
    <ScreenFrame theme={theme} density={density} texture={texture} label="Completion — Squishy">
      <Confetti theme={theme}/>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 22,
      }}>
        {/* Big mascot reaction */}
        <div style={{ display: 'flex', gap: 30, alignItems: 'flex-end' }}>
          <Mascot mascot={mascot} size={160} expression="wow" wave/>
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, fontFamily: 'var(--tc-display)', color: theme.primary, lineHeight: 1 }}>
          WAHOO!
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: theme.ink, textAlign: 'center', maxWidth: 480 }}>
          You finished your unicorn! It looks <span style={{ color: theme.accent }}>amazing</span>.
        </div>

        {/* Reveal frame */}
        <div style={{
          background: '#fff', borderRadius: 28, padding: 18,
          boxShadow: `0 6px 0 ${theme.bgAlt}, 0 14px 28px ${theme.shadow}`,
          transform: 'rotate(-2deg)',
        }}>
          <div style={{
            background: theme.bgAlt, borderRadius: 16, padding: 14,
          }}>
            <PuzzlePreview shape="unicorn" palette={TC_SAMPLE_PALETTES.unicorn} cell={20} painted={1.0}/>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 14 }}>
          <PrimaryButton color={theme.primary} size="lg">Save it!</PrimaryButton>
          <PrimaryButton color="#fff" textColor={theme.ink} size="lg">New picture</PrimaryButton>
        </div>
      </div>
    </ScreenFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// A5 — Settings / parental gate
// ─────────────────────────────────────────────────────────────
function SquishySettings({ theme, mascot, density, texture, gated = true }) {
  return (
    <ScreenFrame theme={theme} density={density} texture={texture} label="Settings — Squishy">
      {gated ? (
        // Parental gate
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.15)',
        }}>
          <div style={{
            width: 460, background: '#fff', borderRadius: 28, padding: 32,
            boxShadow: `0 10px 30px rgba(0,0,0,0.18)`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, color: theme.inkSoft, fontWeight: 700, letterSpacing: 1 }}>FOR GROWN-UPS</div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--tc-display)', margin: '8px 0 6px' }}>What is 7 + 6?</div>
            <div style={{ fontSize: 14, color: theme.inkSoft, marginBottom: 22 }}>A quick maths puzzle to keep little fingers out</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 22 }}>
              {[10, 12, 13, 14].map((n, i) => (
                <button key={n} style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: i === 2 ? theme.primary : '#fff',
                  color: i === 2 ? '#fff' : theme.ink,
                  border: i === 2 ? 'none' : `2px solid ${theme.bgAlt}`,
                  fontSize: 24, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer',
                  boxShadow: i === 2 ? `0 4px 0 ${darken(theme.primary, 0.18)}` : 'none',
                }}>{n}</button>
              ))}
            </div>
            <button style={{
              background: 'transparent', border: 'none', color: theme.inkSoft,
              fontSize: 14, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
            }}>← Cancel</button>
          </div>
        </div>
      ) : null}

      {/* Settings background */}
      <div style={{ padding: 36, opacity: gated ? 0.55 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button style={{
            padding: '10px 18px', background: '#fff', border: 'none', borderRadius: 14,
            fontWeight: 800, fontSize: 14, color: theme.ink, cursor: 'pointer',
            boxShadow: `0 3px 0 ${theme.bgAlt}`, fontFamily: 'inherit',
          }}>← Done</button>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--tc-display)' }}>Settings</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <SettingCard theme={theme} title="Internet picture search" sub="Lets your child search safe images" toggle>
            <Toggle theme={theme} on/>
          </SettingCard>
          <SettingCard theme={theme} title="Sound effects" sub="Pops, plops & cheers">
            <Toggle theme={theme} on/>
          </SettingCard>
          <SettingCard theme={theme} title="Default difficulty" sub="Where the slider starts">
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <PixelChick key={i} size={20} color={mascot.body} accent={mascot.accent}/>
              ))}
            </div>
          </SettingCard>
          <SettingCard theme={theme} title="Auto-fill backgrounds" sub="Skip big plain areas">
            <Toggle theme={theme} on/>
          </SettingCard>
          <SettingCard theme={theme} title="Pre-painted starters" sub="Fewer chicks at the start">
            <Toggle theme={theme} on={false}/>
          </SettingCard>
          <SettingCard theme={theme} title="Clear all artwork" sub="Delete saved pictures" danger>
            <button style={{
              background: '#fff5f5', color: '#d54864', border: 'none',
              padding: '8px 16px', borderRadius: 12, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer',
            }}>Clear all</button>
          </SettingCard>
        </div>
      </div>
    </ScreenFrame>
  );
}

function SettingCard({ theme, title, sub, children, danger }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, padding: '18px 20px',
      boxShadow: `0 4px 0 ${theme.bgAlt}, 0 6px 14px ${theme.shadow}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
    }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: danger ? '#d54864' : theme.ink, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: theme.inkSoft, fontWeight: 600 }}>{sub}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ theme, on }) {
  return (
    <div style={{
      width: 56, height: 32, borderRadius: 16,
      background: on ? theme.mint : theme.bgAlt,
      position: 'relative',
      transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 27 : 3,
        width: 26, height: 26, borderRadius: '50%', background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// A6 — Onboarding coach marks
// ─────────────────────────────────────────────────────────────
function SquishyOnboarding({ theme, mascot, density, texture }) {
  // Show mascot picker first-run screen (the most distinctive bit since user
  // requested selectable mascots)
  return (
    <ScreenFrame theme={theme} density={density} texture={texture} label="Onboarding — Squishy">
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 36,
      }}>
        <div style={{ fontSize: 14, color: theme.inkSoft, fontWeight: 700, letterSpacing: 1 }}>STEP 1 OF 3</div>
        <div style={{ fontSize: 44, fontWeight: 800, fontFamily: 'var(--tc-display)', textAlign: 'center', margin: '10px 0 6px' }}>
          Pick your buddy!
        </div>
        <div style={{ fontSize: 18, color: theme.inkSoft, textAlign: 'center', marginBottom: 28, fontWeight: 600 }}>
          They'll cheer you on while you colour
        </div>

        {/* Mascot grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
          padding: 18, background: '#fff', borderRadius: 24,
          boxShadow: `0 6px 0 ${theme.bgAlt}, 0 10px 22px ${theme.shadow}`,
          marginBottom: 28,
        }}>
          {TC_MASCOTS.map((m, i) => (
            <div key={m.id} style={{
              width: 130, padding: 12, borderRadius: 18,
              background: i === 1 ? theme.primarySoft : theme.bgAlt,
              border: i === 1 ? `3px solid ${theme.primary}` : '3px solid transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              cursor: 'pointer',
              transform: i === 1 ? 'translateY(-4px)' : 'none',
              transition: 'transform 0.15s',
            }}>
              <Mascot mascot={m} size={84} wave={i === 1}/>
              <div style={{ fontSize: 16, fontWeight: 800, color: theme.ink }}>{m.name}</div>
              <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 600 }}>{m.tag}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <PrimaryButton color={theme.primary} size="lg">That's the one! →</PrimaryButton>
        </div>
      </div>
    </ScreenFrame>
  );
}

Object.assign(window, {
  SquishyHome, SquishyDifficulty, SquishyPuzzle,
  SquishyCompletion, SquishySettings, SquishyOnboarding,
});
