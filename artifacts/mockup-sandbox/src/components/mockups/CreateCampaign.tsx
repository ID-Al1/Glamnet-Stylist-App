import { useState } from 'react';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

const ROLES = ['Makeup Artist', 'Hair Stylist', 'Nail Artist', 'Photographer', 'Multiple Roles'];

export default function CreateCampaign() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [count, setCount] = useState(1);
  const [brief, setBrief] = useState('');
  const [published, setPublished] = useState(false);

  if (published) {
    return (
      <Screen>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 32, gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: `${C.sage}20`, border: `2px solid ${C.sage}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, textAlign: 'center' }}>Campaign Published!</div>
          <div style={{ fontSize: 14, color: `${C.charcoal}60`, textAlign: 'center', maxWidth: 260 }}>
            <strong>{name || 'Your campaign'}</strong> is now live. Artists can start applying immediately.
          </div>
          <button onClick={() => { setPublished(false); setName(''); setRole(''); setBudget(''); setStartDate(''); setEndDate(''); setCount(1); setBrief(''); }}
            style={{ marginTop: 8, padding: '12px 24px', borderRadius: 12, border: `1.5px solid ${C.taupe}`, backgroundColor: '#fff', color: C.charcoal, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            Create another
          </button>
        </div>
      </Screen>
    );
  }

  const canPublish = name.trim() !== '' && role !== '' && budget !== '';

  return (
    <Screen>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: C.canvas, borderBottom: `1px solid ${C.taupe}`, padding: '16px 20px', zIndex: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.charcoal, padding: 0, lineHeight: 1 }}>←</button>
        <span style={{ fontSize: 16, fontWeight: 600 }}>New Campaign</span>
      </div>

      <div style={{ padding: '20px 20px 120px' }}>
        <Field label="Campaign name" required>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Summer Glow Campaign"
            style={inputStyle}
          />
        </Field>

        <Field label="Role needed" required>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)}
                style={{
                  padding: '8px 14px', borderRadius: 20, cursor: 'pointer',
                  border: `1.5px solid ${role === r ? C.accent : C.taupe}`,
                  backgroundColor: role === r ? `${C.accent}12` : '#fff',
                  color: role === r ? C.accent : C.charcoal,
                  fontSize: 13, fontWeight: role === r ? 600 : 400,
                  fontFamily: "'Inter', sans-serif",
                }}
              >{r}</button>
            ))}
          </div>
        </Field>

        <Field label="Budget (ZAR)" required>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: `${C.charcoal}50`, fontWeight: 500 }}>R</span>
            <input
              type="number" value={budget} onChange={e => setBudget(e.target.value)}
              placeholder="0"
              style={{ ...inputStyle, paddingLeft: 32 }}
            />
          </div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Start date">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="End date">
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <Field label="Number of artists">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setCount(c => Math.max(1, c - 1))} style={countBtn}>−</button>
            <span style={{ fontSize: 20, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{count}</span>
            <button onClick={() => setCount(c => Math.min(20, c + 1))} style={countBtn}>+</button>
            <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${count === n ? C.accent : C.taupe}`, backgroundColor: count === n ? C.accent : '#fff', color: count === n ? '#fff' : C.charcoal, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                >{n === 6 ? '6+' : n}</button>
              ))}
            </div>
          </div>
        </Field>

        <Field label="Brief (optional)">
          <textarea
            value={brief} onChange={e => setBrief(e.target.value)}
            placeholder="Describe the look, tone, and any specific requirements for artists…"
            rows={4}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          />
        </Field>
      </div>

      {/* Bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, padding: '12px 20px 28px', backgroundColor: C.canvas, borderTop: `1px solid ${C.taupe}` }}>
        <button
          disabled={!canPublish}
          onClick={() => canPublish && setPublished(true)}
          style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', backgroundColor: canPublish ? C.accent : C.taupe, color: canPublish ? '#fff' : `${C.charcoal}40`, fontSize: 16, fontWeight: 600, cursor: canPublish ? 'pointer' : 'not-allowed', fontFamily: "'Inter', sans-serif" }}
        >
          Publish Campaign
        </button>
      </div>
    </Screen>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: `${C.charcoal}70`, marginBottom: 8, letterSpacing: '0.02em' }}>
        {label}{required && <span style={{ color: C.accent, marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto' }}>{children}</div>;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.taupe}`,
  backgroundColor: '#fff', fontSize: 14, color: C.charcoal, fontFamily: "'Inter', sans-serif",
  outline: 'none', boxSizing: 'border-box',
};

const countBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.taupe}`,
  backgroundColor: '#fff', fontSize: 18, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
