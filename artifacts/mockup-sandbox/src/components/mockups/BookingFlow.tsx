import { useState } from 'react';
import { ARTISTS } from '../../glamnet/data';

const C = { canvas: '#FAF7F4', charcoal: '#1C1A19', accent: '#B8765C', taupe: '#E8E1DA', sage: '#7C8B6F' } as const;

const ARTIST = ARTISTS[0];

const SERVICES = [
  { name: 'Bridal Full Glam', duration: '3 hrs', price: 2800 },
  { name: 'Evening Glam', duration: '1.5 hrs', price: 1400 },
  { name: 'Editorial / Campaign', duration: '4 hrs', price: 3200 },
  { name: 'Natural Day Look', duration: '1 hr', price: 900 },
];

const DAYS = ['Mon 7', 'Tue 8', 'Wed 9', 'Thu 10', 'Fri 11', 'Sat 12', 'Sun 13'];
const TIMES = ['08:00', '09:30', '11:00', '13:00', '14:30', '16:00'];

type Step = 1 | 2 | 3;

export default function BookingFlow() {
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <Screen>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 32, gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: `${C.sage}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: C.sage }}>✓</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, textAlign: 'center' }}>Payment initiated</div>
          <div style={{ fontSize: 14, color: `${C.charcoal}60`, textAlign: 'center' }}>You will be redirected to PayFast to complete your booking</div>
          <button onClick={() => { setStep(1); setService(null); setDay(null); setTime(null); setConfirmed(false); }} style={{ marginTop: 16, ...ghostBtn }}>Start over</button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: C.canvas, borderBottom: `1px solid ${C.taupe}`, padding: '16px 20px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button
            onClick={() => step > 1 ? setStep((step - 1) as Step) : undefined}
            style={{ background: 'none', border: 'none', cursor: step > 1 ? 'pointer' : 'default', fontSize: 20, color: step > 1 ? C.charcoal : `${C.charcoal}30`, padding: 0, lineHeight: 1 }}
          >←</button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Book {ARTIST.name.split(' ')[0]}</span>
        </div>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s < 3 ? 1 : 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                backgroundColor: s < step ? C.sage : s === step ? C.accent : C.taupe,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: s <= step ? '#fff' : `${C.charcoal}50`,
              }}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div style={{ flex: 1, height: 2, backgroundColor: s < step ? C.sage : C.taupe, margin: '0 4px' }} />}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {['Service', 'Date & Time', 'Review'].map(label => (
            <span key={label} style={{ fontSize: 10, color: `${C.charcoal}50`, letterSpacing: '0.04em' }}>{label}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 100px' }}>
        {step === 1 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Choose a service</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SERVICES.map((svc, i) => (
                <button key={svc.name} onClick={() => setService(i)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 18px', borderRadius: 14,
                    border: `1.5px solid ${service === i ? C.accent : C.taupe}`,
                    backgroundColor: service === i ? `${C.accent}08` : '#fff',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.charcoal }}>{svc.name}</div>
                    <div style={{ fontSize: 12, color: `${C.charcoal}55`, marginTop: 2 }}>{svc.duration}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>R{svc.price.toLocaleString()}</span>
                    {service === i && <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</div>}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Pick a date</div>
            <div style={{ fontSize: 13, color: `${C.charcoal}60`, marginBottom: 16 }}>July 2026</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 24, scrollbarWidth: 'none' }}>
              {DAYS.map((d, i) => (
                <button key={d} onClick={() => setDay(i)}
                  style={{
                    flexShrink: 0, width: 52, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                    border: `1.5px solid ${day === i ? C.accent : C.taupe}`,
                    backgroundColor: day === i ? C.accent : '#fff',
                    color: day === i ? '#fff' : C.charcoal,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 500, opacity: day === i ? 0.85 : 0.55 }}>{d.split(' ')[0]}</span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{d.split(' ')[1]}</span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Pick a time</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {TIMES.map(t => (
                <button key={t} onClick={() => setTime(t)}
                  style={{
                    padding: '12px 0', borderRadius: 12, cursor: 'pointer',
                    border: `1.5px solid ${time === t ? C.accent : C.taupe}`,
                    backgroundColor: time === t ? C.accent : '#fff',
                    color: time === t ? '#fff' : C.charcoal,
                    fontSize: 14, fontWeight: time === t ? 600 : 400,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >{t}</button>
              ))}
            </div>
          </>
        )}

        {step === 3 && service !== null && day !== null && time !== null && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Review your booking</div>
            <div style={{ backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${C.taupe}`, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.taupe}`, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{ARTIST.name}</div>
                  <div style={{ fontSize: 12, color: `${C.charcoal}60` }}>{ARTIST.specialty}</div>
                </div>
              </div>
              {[
                { label: 'Service', value: SERVICES[service].name },
                { label: 'Duration', value: SERVICES[service].duration },
                { label: 'Date', value: `${DAYS[day]}, Jul 2026` },
                { label: 'Time', value: time },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `1px solid ${C.taupe}` }}>
                  <span style={{ fontSize: 13, color: `${C.charcoal}60` }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.charcoal }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>R{SERVICES[service].price.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: `${C.charcoal}50`, textAlign: 'center', marginBottom: 20 }}>
              Payment via PayFast · Secure checkout
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, padding: '12px 20px 28px', backgroundColor: C.canvas, borderTop: `1px solid ${C.taupe}` }}>
        {step < 3 ? (
          <button
            disabled={(step === 1 && service === null) || (step === 2 && (day === null || time === null))}
            onClick={() => setStep((step + 1) as Step)}
            style={{
              width: '100%', padding: 16, borderRadius: 12, border: 'none',
              backgroundColor: ((step === 1 && service !== null) || (step === 2 && day !== null && time !== null)) ? C.accent : C.taupe,
              color: ((step === 1 && service !== null) || (step === 2 && day !== null && time !== null)) ? '#fff' : `${C.charcoal}40`,
              fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            }}
          >Next</button>
        ) : (
          <button
            onClick={() => setConfirmed(true)}
            style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', backgroundColor: C.accent, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
          >Confirm & Pay</button>
        )}
      </div>
    </Screen>
  );
}

function Avatar() {
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#D4A5A0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>ND</div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', backgroundColor: C.canvas, fontFamily: "'Inter', sans-serif", color: C.charcoal, maxWidth: 390, margin: '0 auto' }}>{children}</div>;
}

const ghostBtn: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.taupe}`,
  backgroundColor: 'transparent', color: C.charcoal, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
};
