import { useState } from 'react';
import { BOOKING_REQUESTS } from '../../glamnet/data';
import type { BookingRequest } from '../../glamnet/types';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

export default function BookingRequests() {
  const [statuses, setStatuses] = useState<Record<string, 'pending' | 'confirmed' | 'declined'>>(
    Object.fromEntries(BOOKING_REQUESTS.map(r => [r.id, 'pending']))
  );

  const requests = BOOKING_REQUESTS.filter(r => statuses[r.id] === 'pending');

  const accept = (id: string) => setStatuses(s => ({ ...s, [id]: 'confirmed' }));
  const decline = (id: string) => setStatuses(s => ({ ...s, [id]: 'declined' }));

  const accepted = BOOKING_REQUESTS.filter(r => statuses[r.id] === 'confirmed');
  const declined = BOOKING_REQUESTS.filter(r => statuses[r.id] === 'declined');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: C.canvas, borderBottom: `1px solid ${C.taupe}`, padding: '16px 20px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.charcoal, padding: 0, lineHeight: 1 }}>←</button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Booking Requests</div>
            {requests.length > 0 && <div style={{ fontSize: 12, color: C.accent, fontWeight: 500 }}>{requests.length} pending</div>}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 40px' }}>
        {/* Pending */}
        {requests.length === 0 && accepted.length === 0 && declined.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: `${C.charcoal}50`, fontSize: 14 }}>No requests yet</div>
        )}

        {requests.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel label="Pending review" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.map(req => (
                <RequestCard key={req.id} request={req} onAccept={() => accept(req.id)} onDecline={() => decline(req.id)} />
              ))}
            </div>
          </div>
        )}

        {accepted.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel label="Accepted" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {accepted.map(req => (
                <MiniCard key={req.id} request={req} status="confirmed" />
              ))}
            </div>
          </div>
        )}

        {declined.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel label="Declined" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {declined.map(req => (
                <MiniCard key={req.id} request={req} status="declined" />
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && (accepted.length > 0 || declined.length > 0) && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: `${C.charcoal}50`, fontSize: 13 }}>All requests reviewed ✓</div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request, onAccept, onDecline }: { request: BookingRequest; onAccept: () => void; onDecline: () => void }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${C.taupe}`, overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 14px' }}>
        {/* Client */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Avatar name={request.clientName} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{request.clientName}</div>
              <div style={{ fontSize: 12, color: `${C.charcoal}60` }}>{request.service}</div>
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>R{request.budget.toLocaleString()}</div>
        </div>
        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Detail icon="📅" label={`${request.date} at ${request.time}`} />
          <Detail icon="📍" label={request.location} />
        </div>
      </div>
      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${C.taupe}` }}>
        <button onClick={onDecline} style={{ padding: '13px 0', border: 'none', backgroundColor: `${C.taupe}60`, color: `${C.charcoal}70`, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", borderRight: `1px solid ${C.taupe}` }}>
          Decline
        </button>
        <button onClick={onAccept} style={{ padding: '13px 0', border: 'none', backgroundColor: `${C.sage}15`, color: C.sage, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          Accept
        </button>
      </div>
    </div>
  );
}

function MiniCard({ request, status }: { request: BookingRequest; status: 'confirmed' | 'declined' }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: `1px solid ${C.taupe}`, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: status === 'declined' ? 0.5 : 1 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.charcoal }}>{request.clientName}</div>
        <div style={{ fontSize: 12, color: `${C.charcoal}55` }}>{request.service} · {request.date}</div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: status === 'confirmed' ? C.sage : `${C.charcoal}50`, backgroundColor: status === 'confirmed' ? `${C.sage}15` : `${C.taupe}80`, padding: '3px 10px', borderRadius: 10 }}>
        {status === 'confirmed' ? 'Accepted' : 'Declined'}
      </span>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = ['#D4A5A0', '#A0B4C8', '#B5C4A0', '#C4B5A0'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>{initials}</div>
  );
}

function Detail({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span style={{ fontSize: 12, color: `${C.charcoal}65`, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: `${C.charcoal}50`, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>;
}
