import { useState } from 'react';
import type { Role } from '../../glamnet/types';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

const ROLES: { id: Role; icon: string; title: string; desc: string }[] = [
  { id: 'client', icon: '✦', title: 'I need to look amazing', desc: 'Book a beauty professional for any occasion' },
  { id: 'artist', icon: '◈', title: 'I need work', desc: 'Showcase your skills and take bookings' },
  { id: 'brand', icon: '❋', title: 'I need talent', desc: 'Post a campaign and find the right artists' },
];

export default function Onboarding() {
  const [selected, setSelected] = useState<Role | null>(null);
  const [done, setDone] = useState(false);

  if (done && selected) {
    return (
      <Screen>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 32 }}>
          <div style={{ fontSize: 48 }}>✓</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, textAlign: 'center' }}>
            Welcome, {selected === 'client' ? 'Guest' : selected === 'artist' ? 'Artist' : 'Brand'}
          </div>
          <div style={{ fontSize: 14, color: `${C.charcoal}70`, textAlign: 'center' }}>
            {selected === 'client' ? 'Browse talent and book your next look' : selected === 'artist' ? 'Start receiving bookings today' : 'Post your first campaign'}
          </div>
          <button onClick={() => { setDone(false); setSelected(null); }} style={ghostBtn}>← Start over</button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, letterSpacing: '-0.5px', color: C.charcoal }}>
            GlamNet
          </div>
          <div style={{ fontSize: 14, color: `${C.charcoal}60`, marginTop: 6, letterSpacing: '0.04em' }}>
            South African beauty marketplace
          </div>
          <div style={{ width: 40, height: 2, backgroundColor: C.accent, margin: '16px auto 0' }} />
        </div>

        {/* Role cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {ROLES.map(role => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 20px', borderRadius: 16,
                  border: `1.5px solid ${isSelected ? C.accent : C.taupe}`,
                  backgroundColor: isSelected ? `${C.accent}12` : '#fff',
                  cursor: 'pointer', textAlign: 'left',
                  boxShadow: isSelected ? `0 0 0 3px ${C.accent}18` : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 20, color: isSelected ? C.accent : `${C.charcoal}40`, minWidth: 28, textAlign: 'center' }}>
                  {role.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.charcoal, marginBottom: 2 }}>{role.title}</div>
                  <div style={{ fontSize: 13, color: `${C.charcoal}70` }}>{role.desc}</div>
                </div>
                {isSelected && (
                  <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          disabled={!selected}
          onClick={() => selected && setDone(true)}
          style={{
            width: '100%', padding: '16px', borderRadius: 12, border: 'none',
            backgroundColor: selected ? C.accent : C.taupe,
            color: selected ? '#fff' : `${C.charcoal}40`,
            fontSize: 16, fontWeight: 600,
            cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.01em',
          }}
        >
          Continue
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: `${C.charcoal}50` }}>
          By continuing you agree to our Terms of Service
        </div>
      </div>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto' }}>
      {children}
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  marginTop: 8, padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.taupe}`,
  backgroundColor: 'transparent', color: C.charcoal, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
};
