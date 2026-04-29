// Difficulty — chick meter + slider, with start button.

function Difficulty({ theme, mascot, value, onChange, puzzleId, onBack, onStart }) {
  const grid = Math.round(8 + value * 24);
  const palette = Math.round(4 + value * 8);
  const chickCount = Math.max(1, Math.round(value * 12));
  const time = value < 0.4 ? '~10 min' : value < 0.7 ? '~30 min' : '60 min+';

  const sliderRef = useRef(null);
  const handleSlide = (clientX) => {
    if (!sliderRef.current) return;
    const r = sliderRef.current.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    onChange(v);
  };

  return (
    <Screen theme={theme} label="03 Difficulty">
      <div style={{ padding: 28, maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <PxButton color="#fff" textColor={theme.ink} borderColor={theme.ink} onClick={onBack}>← BACK</PxButton>
          <PxTitle theme={theme} size={32} style={{ flex: 1, textAlign: 'center' }}>HOW HARD?</PxTitle>
          <div style={{ width: 110 }}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <PxPanel color="#fff" borderColor={theme.ink} padding={24}>
            <div style={{ width: '100%', height: 360, background: `linear-gradient(135deg, ${theme.primarySoft}, ${theme.accentSoft})`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${theme.ink}` }}>
              <PixelMascot mascot={mascot} size={260} wave/>
            </div>
            <div style={{ marginTop: 14, textAlign: 'center', fontFamily: 'var(--tc-display)', fontSize: 14, letterSpacing: 1, color: theme.inkSoft }}>
              {mascot.name.toUpperCase()} IS READY!
            </div>
          </PxPanel>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PxPanel color="#fff" borderColor={theme.ink} padding={20}>
              <div style={{ fontFamily: 'var(--tc-display)', fontSize: 14, letterSpacing: 0.5, color: theme.inkSoft, marginBottom: 12 }}>★ {mascot.name.toUpperCase()} METER ★</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, padding: '12px 4px', minHeight: 60, background: theme.bgAlt, border: `3px solid ${theme.ink}`, marginBottom: 18 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ opacity: i < chickCount ? 1 : 0.18, transition: 'opacity 0.15s', filter: i < chickCount ? 'none' : 'grayscale(0.5)' }}>
                    <PixelMascot mascot={mascot} size={32}/>
                  </div>
                ))}
              </div>

              {/* Slider */}
              <div
                ref={sliderRef}
                onMouseDown={(e) => handleSlide(e.clientX)}
                onMouseMove={(e) => { if (e.buttons === 1) handleSlide(e.clientX); }}
                onTouchStart={(e) => handleSlide(e.touches[0].clientX)}
                onTouchMove={(e) => handleSlide(e.touches[0].clientX)}
                style={{ position: 'relative', height: 36, marginBottom: 18, cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 14, background: theme.bgAlt, border: `3px solid ${theme.ink}` }}/>
                <div style={{ position: 'absolute', top: 12, left: 0, width: `${value * 100}%`, height: 14, background: theme.primary, borderTop: `3px solid ${theme.ink}`, borderBottom: `3px solid ${theme.ink}`, borderLeft: `3px solid ${theme.ink}` }}/>
                <div style={{ position: 'absolute', top: 0, left: `calc(${value * 100}% - 16px)`, width: 32, height: 32, background: theme.primary, border: `3px solid ${theme.ink}`, boxShadow: `0 4px 0 0 ${theme.ink}` }}/>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Stat3 theme={theme} label="GRID" value={`${grid}×${grid}`}/>
                <Stat3 theme={theme} label="COLOURS" value={palette}/>
                <Stat3 theme={theme} label="TIME" value={time}/>
              </div>
            </PxPanel>

            <PxButton color={theme.primary} size="lg" onClick={onStart} style={{ alignSelf: 'center', minWidth: 280 }}>▶ START!</PxButton>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function Stat3({ theme, label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--tc-display)', fontSize: 22, color: theme.ink, letterSpacing: 1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'var(--tc-display)', fontSize: 10, color: theme.inkSoft, marginTop: 6, letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { Difficulty });
