import { useState } from 'react';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

export default function BookingConfirmation() {
  const [home, setHome] = useState(false);

  if (home) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 12 }}>Discover Artists</div>
          <button onClick={() => setHome(false)} style={ghostBtn}>← Back to confirmation</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

      {/* Sage check */}
      <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: `${C.sage}20`, border: `2px solid ${C.sage}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Confirmed label */}
      <div style={{ fontSize: 13, fontWeight: 600, color: C.sage, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
        Booking Confirmed
      </div>

      {/* Artist name — signature moment */}
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, fontStyle: 'italic', color: C.charcoal, textAlign: 'center', lineHeight: 1.2, marginBottom: 28 }}>
        Naledi Dlamini
      </div>

      {/* Appointment card */}
      <div style={{ width: '100%', backgroundColor: '#fff', borderRadius: 20, border: `1px solid ${C.taupe}`, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ backgroundColor: C.accent, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your appointment</div>
        </div>
        {[
          { label: 'Service', value: 'Bridal Full Glam' },
          { label: 'Date', value: 'Wednesday, 9 Jul 2026' },
          { label: 'Time', value: '08:00' },
          { label: 'Location', value: 'To be confirmed' },
          { label: 'Total paid', value: 'R2,800' },
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${C.taupe}` : 'none' }}>
            <span style={{ fontSize: 13, color: `${C.charcoal}55` }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: row.label === 'Total paid' ? 700 : 500, color: row.label === 'Total paid' ? C.accent : C.charcoal }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, color: `${C.charcoal}55`, textAlign: 'center', lineHeight: 1.6, marginBottom: 28, maxWidth: 260 }}>
        Naledi will confirm the location and any prep notes within 24 hours.
      </div>

      {/* Home button */}
      <button
        onClick={() => setHome(true)}
        style={{ width: '100%', padding: 16, borderRadius: 12, border: `1.5px solid ${C.taupe}`, backgroundColor: '#fff', color: C.charcoal, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
      >
        Back to home
      </button>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.taupe}`,
  backgroundColor: 'transparent', color: C.charcoal, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
};
