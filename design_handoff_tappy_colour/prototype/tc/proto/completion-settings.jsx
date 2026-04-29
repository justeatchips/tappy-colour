// Completion + Settings (with parental gate).

function Completion({ theme, mascot, puzzle, onHome, onNew }) {
  return (
    <Screen theme={theme} label="05 Completion">
      <Confetti theme={theme}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 40 }}>
        <PixelMascot mascot={mascot} size={140} wave/>
        <PxTitle theme={theme} size={72}>WAHOO!</PxTitle>
        <div style={{ fontFamily: 'var(--tc-display)', fontSize: 14, letterSpacing: 0.5, color: theme.inkSoft, textAlign: 'center' }}>★ NEW ARTWORK COMPLETE ★</div>
        <PxPanel color="#fff" borderColor={theme.ink} padding={14}>
          <div style={{ background: theme.bgAlt, padding: 10, border: `3px solid ${theme.ink}`, borderRadius: 4, width: 320, height: 320 }}>
            <PuzzleThumb puzzle={puzzle} painted={fullyPainted(puzzle)}/>
          </div>
        </PxPanel>
        <div style={{ display: 'flex', gap: 14 }}>
          <PxButton color={theme.primary} size="lg" onClick={onHome}>SAVE!</PxButton>
          <PxButton color="#fff" textColor={theme.ink} borderColor={theme.ink} size="lg" onClick={onNew}>NEW PIC</PxButton>
        </div>
      </div>
    </Screen>
  );
}

function fullyPainted(puzzle) {
  const out = {};
  puzzle.grid.forEach((row, y) => {
    row.split('').forEach((ch, x) => {
      if (ch !== '.') out[`${x},${y}`] = parseInt(ch, 16);
    });
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
// Settings modal — with parental maths gate.
// ─────────────────────────────────────────────────────────────
function SettingsModal({ theme, mascot, parentGated, onGate, onClose, onReset }) {
  const [internetSearch, setInternetSearch] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [autoFill, setAutoFill] = useState(true);
  const [preStarted, setPreStarted] = useState(false);
  const [defaultDiff, setDefaultDiff] = useState(6);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(20, 30, 50, 0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20,
    }}>
      <PxPanel color={theme.bg} borderColor={theme.ink} padding={0} style={{ maxWidth: 900, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ background: theme.surface, padding: 16, borderBottom: `4px solid ${theme.ink}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <PxTitle theme={theme} size={24} style={{ flex: 1 }}>⚙ SETTINGS</PxTitle>
          <PxButton color="#fff" textColor={theme.ink} borderColor={theme.ink} size="sm" onClick={onClose}>✕ CLOSE</PxButton>
        </div>

        {!parentGated ? (
          <ParentGate theme={theme} onPass={onGate} onCancel={onClose}/>
        ) : (
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SettingRow theme={theme} title="Internet picture search" sub="Lets your child search safe images">
              <PxToggle theme={theme} on={internetSearch} onChange={setInternetSearch}/>
            </SettingRow>
            <SettingRow theme={theme} title="Sound effects" sub="Beeps and bloops">
              <PxToggle theme={theme} on={sounds} onChange={setSounds}/>
            </SettingRow>
            <SettingRow theme={theme} title="Default difficulty" sub="Where the slider starts">
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 12 }).map((_, j) => (
                  <button key={j} onClick={() => setDefaultDiff(j + 1)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: j < defaultDiff ? 1 : 0.2 }}>
                    <PixelMascot mascot={mascot} size={20}/>
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow theme={theme} title="Auto-fill backgrounds" sub="Skip big plain areas">
              <PxToggle theme={theme} on={autoFill} onChange={setAutoFill}/>
            </SettingRow>
            <SettingRow theme={theme} title="Pre-painted starters" sub="Fewer chicks at the start">
              <PxToggle theme={theme} on={preStarted} onChange={setPreStarted}/>
            </SettingRow>
            <SettingRow theme={theme} title="Reset everything" sub="Forget mascot + saved pictures" danger>
              <PxButton color="#ffd0d6" textColor="#d54864" borderColor="#d54864" size="sm" onClick={() => { if (confirm('Are you sure? This will delete all artwork.')) { onReset(); onClose(); } }}>RESET ALL</PxButton>
            </SettingRow>
          </div>
        )}
      </PxPanel>
    </div>
  );
}

function ParentGate({ theme, onPass, onCancel }) {
  // Generate a problem only once per gate session
  const problem = useMemo(() => {
    const a = 7 + Math.floor(Math.random() * 6);   // 7-12
    const b = 4 + Math.floor(Math.random() * 5);   // 4-8
    return { a, b, answer: a + b };
  }, []);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    if (parseInt(value, 10) === problem.answer) {
      onPass();
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: 60 }}>🔒</div>
      <PxTitle theme={theme} size={26} style={{ textAlign: 'center' }}>GROWN-UPS ONLY</PxTitle>
      <div style={{ fontSize: 14, color: theme.inkSoft, textAlign: 'center', maxWidth: 400, fontWeight: 700, lineHeight: 1.5 }}>
        Settings are for parents. Solve this to continue.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 28px', background: '#fff', border: `4px solid ${theme.ink}`, boxShadow: `0 6px 0 0 ${theme.ink}` }}>
        <div style={{ fontFamily: 'var(--tc-display)', fontSize: 32, letterSpacing: 1 }}>{problem.a} + {problem.b} =</div>
        <input
          type="text" inputMode="numeric" autoFocus
          value={value}
          onChange={e => setValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{
            width: 80, height: 56, fontFamily: 'var(--tc-display)', fontSize: 32, textAlign: 'center',
            border: `4px solid ${error ? '#d54864' : theme.ink}`,
            background: theme.bgAlt, outline: 'none',
            animation: error ? 'tcShake 0.3s steps(4)' : undefined,
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <PxButton color="#fff" textColor={theme.ink} borderColor={theme.ink} onClick={onCancel}>CANCEL</PxButton>
        <PxButton color={theme.primary} onClick={submit}>UNLOCK</PxButton>
      </div>
    </div>
  );
}

function SettingRow({ theme, title, sub, children, danger }) {
  return (
    <div style={{
      background: '#fff', padding: 14, border: `4px solid ${theme.ink}`,
      boxShadow: `0 4px 0 0 ${theme.ink}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: danger ? '#d54864' : theme.ink }}>{title}</div>
        <div style={{ fontSize: 11, color: theme.inkSoft, fontWeight: 700 }}>{sub}</div>
      </div>
      {children}
    </div>
  );
}

function PxToggle({ theme, on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 60, height: 32, background: on ? theme.mint : theme.bgAlt,
      border: `3px solid ${theme.ink}`, position: 'relative', cursor: 'pointer', padding: 0,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: on ? 26 : 0, width: 26, height: 24,
        background: '#fff', borderLeft: `3px solid ${theme.ink}`,
        borderRight: on ? '0' : `3px solid ${theme.ink}`,
        transition: 'left 0.15s steps(3)',
      }}/>
    </button>
  );
}

Object.assign(window, { Completion, SettingsModal, ParentGate, SettingRow, PxToggle });
