import { useState } from 'react';
import { APPLICANTS, CAMPAIGNS } from '../../glamnet/data';
import type { Applicant } from '../../glamnet/types';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

const CAMPAIGN = CAMPAIGNS[0];
const SPOTS_NEEDED = 3;

export default function ApplicantReview() {
  const [statuses, setStatuses] = useState<Record<string, 'pending' | 'confirmed' | 'declined'>>(
    Object.fromEntries(APPLICANTS.map(a => [a.id, 'pending']))
  );

  const confirm = (id: string) => setStatuses(s => ({ ...s, [id]: 'confirmed' }));
  const decline = (id: string) => setStatuses(s => ({ ...s, [id]: 'declined' }));

  const confirmed = APPLICANTS.filter(a => statuses[a.id] === 'confirmed');
  const pending = APPLICANTS.filter(a => statuses[a.id] === 'pending');
  const declined = APPLICANTS.filter(a => statuses[a.id] === 'declined');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: C.canvas, borderBottom: `1px solid ${C.taupe}`, padding: '16px 20px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.charcoal, padding: 0, lineHeight: 1 }}>←</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Applicants</div>
            <div style={{ fontSize: 12, color: `${C.charcoal}60` }}>{CAMPAIGN.title}</div>
          </div>
        </div>
        {/* Summary pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill count={confirmed.length} label="Confirmed" color={C.sage} />
          <Pill count={pending.length} label="Pending" color={C.accent} />
          <Pill count={declined.length} label="Declined" color={`${C.charcoal}50`} />
        </div>
        {/* Progress */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: `${C.charcoal}55` }}>Spots filled</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.charcoal }}>{confirmed.length} / {SPOTS_NEEDED}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, backgroundColor: C.taupe, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, backgroundColor: C.sage, width: `${Math.min(1, confirmed.length / SPOTS_NEEDED) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 40px' }}>
        {/* Confirmed */}
        {confirmed.length > 0 && (
          <Section label={`Confirmed (${confirmed.length})`}>
            {confirmed.map(a => <ApplicantCard key={a.id} applicant={a} status="confirmed" />)}
          </Section>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <Section label={`Pending review (${pending.length})`}>
            {pending.map(a => (
              <ApplicantCard key={a.id} applicant={a} status="pending" onConfirm={() => confirm(a.id)} onDecline={() => decline(a.id)} />
            ))}
          </Section>
        )}

        {/* Declined */}
        {declined.length > 0 && (
          <Section label={`Declined (${declined.length})`}>
            {declined.map(a => <ApplicantCard key={a.id} applicant={a} status="declined" />)}
          </Section>
        )}

        {pending.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: `${C.charcoal}50` }}>All applicants reviewed ✓</div>
        )}
      </div>
    </div>
  );
}

function ApplicantCard({ applicant, status, onConfirm, onDecline }: { applicant: Applicant; status: 'pending' | 'confirmed' | 'declined'; onConfirm?: () => void; onDecline?: () => void }) {
  const isPending = status === 'pending';
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${C.taupe}`, overflow: 'hidden', opacity: status === 'declined' ? 0.5 : 1, marginBottom: 10 }}>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar name={applicant.name} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>{applicant.name}</div>
                <div style={{ fontSize: 12, color: `${C.charcoal}60`, marginTop: 1 }}>{applicant.specialty}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal }}>R{applicant.dayRate.toLocaleString()}<span style={{ fontWeight: 400, fontSize: 11, color: `${C.charcoal}50` }}>/day</span></div>
                {status !== 'pending' && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: status === 'confirmed' ? C.sage : `${C.charcoal}50` }}>
                    {status === 'confirmed' ? '✓ Hired' : '✗ Declined'}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <Stars rating={applicant.rating} />
              <span style={{ fontSize: 11, color: `${C.charcoal}55` }}>{applicant.rating}</span>
              <span style={{ fontSize: 11, color: `${C.charcoal}35` }}>·</span>
              <span style={{ fontSize: 11, color: `${C.charcoal}55` }}>📍 {applicant.location}</span>
            </div>
          </div>
        </div>
      </div>
      {isPending && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${C.taupe}` }}>
          <button onClick={onDecline} style={{ padding: '12px 0', border: 'none', backgroundColor: `${C.taupe}60`, color: `${C.charcoal}70`, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", borderRight: `1px solid ${C.taupe}` }}>
            Decline
          </button>
          <button onClick={onConfirm} style={{ padding: '12px 0', border: 'none', backgroundColor: `${C.sage}15`, color: C.sage, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            Confirm Hire
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: `${C.charcoal}50`, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

function Pill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 16, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{count}</span>
      <span style={{ fontSize: 11, color, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const colors = ['#D4A5A0', '#A0B4C8', '#B5C4A0', '#C4B5A0'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0 }}>{initials}</div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ fontSize: 11, color: i <= Math.round(rating) ? '#E6B85C' : C.taupe }}>★</span>)}
    </div>
  );
}
