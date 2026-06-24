import { useState } from 'react';
import { BOOKING_REQUESTS } from '../../glamnet/data';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

const UPCOMING = [
  { clientName: 'Sipho Khumalo', service: 'Evening Glam', date: 'Mon 7 Jul', time: '14:00', price: 1400 },
  { clientName: 'Thandiwe Moyo', service: 'Bridal Full Glam', date: 'Fri 11 Jul', time: '08:00', price: 2800 },
];

export default function ArtistDashboard() {
  const [available, setAvailable] = useState(true);
  const [showRequests, setShowRequests] = useState(false);

  if (showRequests) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Booking Requests</div>
          <div style={{ fontSize: 14, color: `${C.charcoal}60`, marginBottom: 20 }}>{BOOKING_REQUESTS.length} pending requests</div>
          <button onClick={() => setShowRequests(false)} style={ghostBtn}>← Back to dashboard</button>
        </div>
      </div>
    );
  }

  const pendingCount = BOOKING_REQUESTS.filter(r => r.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.taupe}` }}>
        <div style={{ fontSize: 12, color: `${C.charcoal}55`, fontWeight: 500, letterSpacing: '0.04em', marginBottom: 4 }}>Good morning,</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>Naledi</div>
      </div>

      <div style={{ padding: '20px 20px 32px' }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {/* Earnings */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${C.taupe}`, padding: '16px 16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: `${C.charcoal}50`, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>This month</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.charcoal }}>R14,200</div>
            <div style={{ fontSize: 12, color: C.sage, marginTop: 4, fontWeight: 500 }}>↑ 12% vs last month</div>
          </div>

          {/* Availability */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${C.taupe}`, padding: '16px 16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: `${C.charcoal}50`, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Availability</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: available ? C.sage : `${C.charcoal}50` }}>
                {available ? 'Open' : 'Closed'}
              </span>
              <button
                onClick={() => setAvailable(!available)}
                style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', padding: 2, backgroundColor: available ? C.sage : C.taupe, transition: 'background-color 0.2s', position: 'relative' }}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff', transition: 'transform 0.2s', transform: available ? 'translateX(20px)' : 'translateX(0)' }} />
              </button>
            </div>
            <div style={{ fontSize: 11, color: `${C.charcoal}50` }}>
              {available ? 'Accepting bookings' : 'Not accepting bookings'}
            </div>
          </div>
        </div>

        {/* Upcoming bookings */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: `${C.charcoal}50`, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Upcoming</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {UPCOMING.map(b => (
              <div key={b.clientName} style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${C.taupe}`, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.charcoal }}>{b.clientName}</div>
                  <div style={{ fontSize: 12, color: `${C.charcoal}60`, marginTop: 2 }}>{b.service}</div>
                  <div style={{ fontSize: 12, color: `${C.charcoal}50`, marginTop: 2 }}>📅 {b.date} at {b.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>R{b.price.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: C.sage, fontWeight: 500, marginTop: 2 }}>Confirmed</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests CTA */}
        <button
          onClick={() => setShowRequests(true)}
          style={{ width: '100%', padding: 16, borderRadius: 12, border: `1.5px solid ${C.accent}`, backgroundColor: `${C.accent}08`, color: C.accent, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          See booking requests
          {pendingCount > 0 && (
            <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: C.accent, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingCount}</span>
          )}
        </button>
      </div>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.taupe}`,
  backgroundColor: 'transparent', color: C.charcoal, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
};
