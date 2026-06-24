import { useState } from 'react';
import { ARTISTS } from '../../glamnet/data';
import type { Artist } from '../../glamnet/types';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

type Filter = 'All' | 'Makeup' | 'Hair' | 'Nails';
const FILTERS: Filter[] = ['All', 'Makeup', 'Hair', 'Nails'];

const SPECIALTY_MAP: Record<Filter, string[]> = {
  All: [],
  Makeup: ['Bridal Makeup', 'Editorial Makeup', 'Full Glam'],
  Hair: ['Hair Styling', 'Natural Hair'],
  Nails: ['Nail Art'],
};

export default function ClientHome() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    const artist = ARTISTS.find(a => a.id === selectedId)!;
    return <ArtistDetailView artist={artist} onBack={() => setSelectedId(null)} />;
  }

  const visible = ARTISTS.filter(a => {
    const matchQuery = query === '' || a.name.toLowerCase().includes(query.toLowerCase()) || a.specialty.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === 'All' || SPECIALTY_MAP[filter].includes(a.specialty);
    return matchQuery && matchFilter;
  });

  return (
    <Screen>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: C.canvas, borderBottom: `1px solid ${C.taupe}`, padding: '16px 20px 12px', zIndex: 10 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Discover Artists</div>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, border: `1px solid ${C.taupe}`, padding: '10px 14px', marginBottom: 12 }}>
          <span style={{ fontSize: 16, opacity: 0.4 }}>🔍</span>
          <input
            type="search" placeholder="Search by name or specialty…"
            value={query} onChange={e => setQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, backgroundColor: 'transparent', color: C.charcoal, fontFamily: "'Inter', sans-serif" }}
          />
        </div>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter === f ? C.accent : C.taupe}`,
                backgroundColor: filter === f ? C.accent : '#fff',
                color: filter === f ? '#fff' : C.charcoal,
                fontSize: 13, fontWeight: filter === f ? 600 : 400,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Artist list */}
      <div style={{ padding: '12px 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: `${C.charcoal}50`, fontSize: 14 }}>
            No artists match your search
          </div>
        )}
        {visible.map(artist => (
          <button key={artist.id} onClick={() => setSelectedId(artist.id)}
            style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <ArtistCard artist={artist} />
          </button>
        ))}
      </div>
    </Screen>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${C.taupe}`, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <Avatar name={artist.name} size={52} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.charcoal }}>{artist.name}</div>
            <div style={{ fontSize: 13, color: `${C.charcoal}70`, marginTop: 1 }}>{artist.specialty}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, whiteSpace: 'nowrap', marginLeft: 8 }}>R{artist.dayRate.toLocaleString()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Stars rating={artist.rating} />
          <span style={{ fontSize: 12, color: `${C.charcoal}60` }}>{artist.rating} ({artist.reviews})</span>
          <span style={{ fontSize: 12, color: `${C.charcoal}40` }}>·</span>
          <span style={{ fontSize: 12, color: `${C.charcoal}60` }}>📍 {artist.location}</span>
        </div>
        {!artist.available && (
          <div style={{ marginTop: 6, fontSize: 11, color: C.accent, fontWeight: 500 }}>Fully booked</div>
        )}
      </div>
    </div>
  );
}

function ArtistDetailView({ artist, onBack }: { artist: Artist; onBack: () => void }) {
  return (
    <Screen>
      <div style={{ position: 'sticky', top: 0, backgroundColor: C.canvas, borderBottom: `1px solid ${C.taupe}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.charcoal, padding: 0, lineHeight: 1 }}>←</button>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{artist.name}</span>
      </div>
      <div style={{ padding: '24px 20px 32px' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <Avatar name={artist.name} size={72} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>{artist.name}</div>
            <div style={{ fontSize: 14, color: `${C.charcoal}70`, marginTop: 2 }}>{artist.specialty}</div>
            <div style={{ fontSize: 13, color: `${C.charcoal}60`, marginTop: 4 }}>📍 {artist.location}</div>
            <Stars rating={artist.rating} style={{ marginTop: 8 }} />
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: `${C.charcoal}85`, marginBottom: 20 }}>{artist.bio}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {artist.skills.map(s => <Pill key={s} label={s} />)}
        </div>
        <button style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', backgroundColor: artist.available ? C.accent : C.taupe, color: artist.available ? '#fff' : `${C.charcoal}50`, fontSize: 16, fontWeight: 600, cursor: artist.available ? 'pointer' : 'not-allowed', fontFamily: "'Inter', sans-serif" }}>
          {artist.available ? `Book ${artist.name.split(' ')[0]}` : 'Fully Booked'}
        </button>
      </div>
    </Screen>
  );
}

function Avatar({ name, size }: { name: string; size: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = ['#D4A5A0', '#A0B4C8', '#B5C4A0', '#C4B5A0', '#A0B5C4', '#C4A0B5'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: size * 0.35, color: '#fff', letterSpacing: '0.02em' }}>
      {initials}
    </div>
  );
}

function Stars({ rating, style }: { rating: number; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', gap: 2, ...style }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 12, color: i <= Math.round(rating) ? '#E6B85C' : C.taupe }}>★</span>
      ))}
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, backgroundColor: `${C.accent}12`, border: `1px solid ${C.accent}30`, fontSize: 12, color: C.accent, fontWeight: 500 }}>{label}</span>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto' }}>
      {children}
    </div>
  );
}
