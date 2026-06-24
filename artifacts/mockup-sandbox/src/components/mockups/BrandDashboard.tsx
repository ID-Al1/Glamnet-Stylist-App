import { useState } from 'react';
import { CAMPAIGNS } from '../../glamnet/data';
import type { Campaign } from '../../glamnet/types';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

const CONFIRMED = [2, 1, 4];
const NEEDED = [3, 2, 6];

export default function BrandDashboard() {
  const [view, setView] = useState<'dashboard' | 'create' | 'review'>('dashboard');
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  if (view === 'create') {
    return (
      <div style={screenStyle}>
        <Header title="New Campaign" onBack={() => setView('dashboard')} />
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
          <div style={{ fontSize: 36 }}>✎</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>Create a Campaign</div>
          <div style={{ fontSize: 13, color: `${C.charcoal}60`, textAlign: 'center' }}>See CreateCampaign screen for the full form</div>
        </div>
      </div>
    );
  }

  if (view === 'review' && activeCampaign) {
    return (
      <div style={screenStyle}>
        <Header title="Applicants" onBack={() => { setView('dashboard'); setActiveCampaign(null); }} />
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
          <div style={{ fontSize: 36 }}>👥</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>{activeCampaign.title}</div>
          <div style={{ fontSize: 13, color: `${C.charcoal}60`, textAlign: 'center' }}>{activeCampaign.applicants} applicants · See ApplicantReview screen</div>
        </div>
      </div>
    );
  }

  return (
    <div style={screenStyle}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.taupe}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: `${C.charcoal}55`, fontWeight: 500, letterSpacing: '0.04em', marginBottom: 4 }}>Brand Portal</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>My Campaigns</div>
        </div>
        <button
          onClick={() => setView('create')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', backgroundColor: C.accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New
        </button>
      </div>

      {/* Campaign list */}
      <div style={{ padding: '16px 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {CAMPAIGNS.map((campaign, i) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            confirmed={CONFIRMED[i]}
            needed={NEEDED[i]}
            onReview={() => { setActiveCampaign(campaign); setView('review'); }}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignCard({ campaign, confirmed, needed, onReview }: { campaign: Campaign; confirmed: number; needed: number; onReview: () => void }) {
  const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000);
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${C.taupe}`, overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px 14px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, paddingRight: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.charcoal, lineHeight: 1.3 }}>{campaign.title}</div>
            <div style={{ fontSize: 12, color: `${C.charcoal}60`, marginTop: 2 }}>{campaign.role}</div>
          </div>
          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.sage, backgroundColor: `${C.sage}15`, padding: '3px 10px', borderRadius: 10 }}>Active</span>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <Stat label="Budget" value={`R${(campaign.budget / 1000).toFixed(0)}k`} />
          <Stat label="Applicants" value={String(campaign.applicants)} />
          <Stat label="Deadline" value={daysLeft > 0 ? `${daysLeft}d left` : 'Due'} highlight={daysLeft < 10} />
        </div>

        {/* Confirmed progress */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: `${C.charcoal}55` }}>Artists confirmed</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.charcoal }}>{confirmed} / {needed}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, backgroundColor: C.taupe, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, backgroundColor: C.sage, width: `${(confirmed / needed) * 100}%` }} />
          </div>
        </div>
      </div>

      <button
        onClick={onReview}
        style={{ width: '100%', padding: '12px 0', border: 'none', borderTop: `1px solid ${C.taupe}`, backgroundColor: `${C.accent}06`, color: C.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
      >
        Review applicants →
      </button>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: `${C.charcoal}50`, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: highlight ? C.accent : C.charcoal }}>{value}</div>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ position: 'sticky', top: 0, backgroundColor: C.canvas, borderBottom: `1px solid ${C.taupe}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.charcoal, padding: 0, lineHeight: 1 }}>←</button>
      <span style={{ fontSize: 16, fontWeight: 600 }}>{title}</span>
    </div>
  );
}

const screenStyle: React.CSSProperties = {
  minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto',
};
