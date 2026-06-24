import { useState } from 'react';
import { ARTISTS } from '../../glamnet/data';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

const SERVICES = [
  { name: 'Bridal Full Glam', duration: '3 hrs', price: 2800 },
  { name: 'Evening Glam', duration: '1.5 hrs', price: 1400 },
  { name: 'Editorial / Campaign', duration: '4 hrs', price: 3200 },
  { name: 'Natural Day Look', duration: '1 hr', price: 900 },
];

const PORTFOLIO_COLORS = ['#D4B5A8', '#B8C4A0', '#A8B8C4', '#C4A8B8'];

export default function ArtistProfile() {
  const artist = ARTISTS[0];
  const [booked, setBooked] = useState(false);

  if (booked) {
    return (
      <Screen>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: `${C.sage}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: C.sage }}>✓</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, textAlign: 'center' }}>Booking started</div>
          <div style={{ fontSize: 14, color: `${C.charcoal}60`, textAlign: 'center' }}>Continue to pick your date and time</div>
          <button onClick={() => setBooked(false)} style={ghostBtn}>← Back to profile</button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: C.canvas, borderBottom: `1px solid ${C.taupe}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.charcoal, padding: 0, lineHeight: 1 }}>←</button>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Artist Profile</span>
      </div>

      <div style={{ padding: '24px 20px 40px' }}>
        {/* Hero */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
          <Avatar name={artist.name} size={80} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{artist.name}</div>
            <div style={{ fontSize: 14, color: `${C.charcoal}70`, marginTop: 3 }}>{artist.specialty}</div>
            <div style={{ fontSize: 13, color: `${C.charcoal}55`, marginTop: 3 }}>📍 {artist.location}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Stars rating={artist.rating} />
              <span style={{ fontSize: 12, color: `${C.charcoal}60` }}>{artist.rating} · {artist.reviews} reviews</span>
            </div>
          </div>
        </div>

        {/* Availability badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, backgroundColor: `${C.sage}18`, border: `1px solid ${C.sage}40`, marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.sage }} />
          <span style={{ fontSize: 12, color: C.sage, fontWeight: 500 }}>Available for bookings</span>
        </div>

        {/* Bio */}
        <Section title="About">
          <p style={{ fontSize: 14, lineHeight: 1.65, color: `${C.charcoal}80` }}>{artist.bio}</p>
        </Section>

        {/* Skills */}
        <Section title="Specialises in">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {artist.skills.map(s => <Pill key={s} label={s} />)}
          </div>
        </Section>

        {/* Portfolio */}
        <Section title="Portfolio">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PORTFOLIO_COLORS.map((color, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 12, backgroundColor: color, border: `1px solid ${C.taupe}` }} />
            ))}
          </div>
        </Section>

        {/* Services */}
        <Section title="Services & Pricing">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {SERVICES.map((svc, i) => (
              <div key={svc.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: i < SERVICES.length - 1 ? `1px solid ${C.taupe}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.charcoal }}>{svc.name}</div>
                  <div style={{ fontSize: 12, color: `${C.charcoal}55`, marginTop: 1 }}>{svc.duration}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>R{svc.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Book CTA */}
        <button
          onClick={() => setBooked(true)}
          style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', backgroundColor: C.accent, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif', marginTop: 8" }}
        >
          Book {artist.name.split(' ')[0]}
        </button>
      </div>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: `${C.charcoal}50`, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Avatar({ name, size }: { name: string; size: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#D4A5A0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: size * 0.32, color: '#fff' }}>
      {initials}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ fontSize: 12, color: i <= Math.round(rating) ? '#E6B85C' : C.taupe }}>★</span>)}
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return <span style={{ padding: '5px 12px', borderRadius: 20, backgroundColor: `${C.accent}12`, border: `1px solid ${C.accent}30`, fontSize: 12, color: C.accent, fontWeight: 500 }}>{label}</span>;
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto' }}>{children}</div>;
}

const ghostBtn: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.taupe}`,
  backgroundColor: 'transparent', color: C.charcoal, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
};
