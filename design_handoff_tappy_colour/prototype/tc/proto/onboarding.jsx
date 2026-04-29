// Onboarding — pick a mascot. Renders a grid of all TC_MASCOTS as pixel sprites.

function Onboarding({ theme, mascotId, setMascotId, onDone }) {
  const selected = mascotId || 'rosie';
  const m = TC_MASCOTS.find(x => x.id === selected) || TC_MASCOTS[1];
  return (
    <Screen theme={theme} label="01 Onboarding">
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ fontFamily: 'var(--tc-display)', fontSize: 12, letterSpacing: 1, color: theme.inkSoft, marginBottom: 8 }}>★ STEP 1 OF 1 ★</div>
        <PxTitle theme={theme} size={48} style={{ textAlign: 'center', marginBottom: 4 }}>PICK YOUR BUDDY</PxTitle>
        <div style={{ fontSize: 14, color: theme.inkSoft, marginBottom: 28, fontWeight: 700 }}>they cheer you on while you colour</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 130px)', gap: 14, marginBottom: 28 }}>
          {TC_MASCOTS.map((mm) => {
            const isSel = mm.id === selected;
            return (
              <button
                key={mm.id}
                onClick={() => setMascotId(mm.id)}
                style={{
                  background: isSel ? theme.primarySoft : '#fff',
                  border: `4px solid ${isSel ? theme.primary : theme.ink}`,
                  boxShadow: isSel ? `0 6px 0 0 ${theme.primary}` : `0 4px 0 0 ${theme.ink}`,
                  padding: 12, cursor: 'pointer', textAlign: 'center',
                  transform: isSel ? 'translateY(-2px)' : 'none',
                  transition: 'transform 0.1s steps(2)',
                }}>
                <PixelMascot mascot={mm} size={88} wave={isSel}/>
                <div style={{ fontFamily: 'var(--tc-display)', fontSize: 14, letterSpacing: 1, marginTop: 6 }}>{mm.name.toUpperCase()}</div>
                <div style={{ fontSize: 10, color: theme.inkSoft, fontWeight: 700 }}>{mm.tag}</div>
              </button>
            );
          })}
        </div>

        <PxButton color={theme.primary} size="lg" onClick={onDone} style={{ minWidth: 280 }}>▶ THAT'S THE ONE!</PxButton>
        <div style={{ fontSize: 12, color: theme.inkSoft, marginTop: 12, fontWeight: 700 }}>tap a buddy then press the button</div>
      </div>
    </Screen>
  );
}

Object.assign(window, { Onboarding });
