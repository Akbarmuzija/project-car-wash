import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';

// ── Service catalogue ─────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'fast_clean',
    name: 'Fast Clean Express',
    emoji: '⚡',
    accentColor: '#38BDF8',
    duration: '15–20 menit',
    description: 'Drive-through express bay tanpa turun dari mobil',
    hasDocs: false,   // ← NO documentation
    features: [
      'Touchless foam wash & rinse',
      'Deep gloss tire dressing',
      'Air freshener spray',
      'Tidak perlu turun dari mobil',
    ],
    variants: [
      { id: 'small',  label: 'Small',  sub: 'City car / Hatchback',      price: 65000,  icon: '🚗' },
      { id: 'medium', label: 'Medium', sub: 'Sedan / SUV standard',        price: 85000,  icon: '🚙' },
      { id: 'big',    label: 'Big',    sub: 'SUV besar / MPV / Minivan',   price: 105000, icon: '🚐' },
    ],
  },
  {
    id: 'premium_clean',
    name: 'Premium Clean & Detailing',
    emoji: '✦',
    accentColor: '#F2A900',
    duration: '45–60 menit',
    description: 'Pengalaman detailing eksklusif di Lounge VIP',
    hasDocs: true,   // ← HAS documentation
    features: [
      'Akses Lounge VIP + Signature Drink',
      'Interior vacuum & ozone sanitasi',
      'Ceramic hydrophobic wax coating',
      'Video dokumentasi Before & After ✦',
    ],
    variants: [
      { id: 'small',  label: 'Small',  sub: 'City car / Hatchback',      price: 200000, icon: '🚗' },
      { id: 'medium', label: 'Medium', sub: 'Sedan / SUV standard',        price: 275000, icon: '🚙' },
      { id: 'big',    label: 'Big',    sub: 'SUV besar / MPV / Minivan',   price: 350000, icon: '🚐' },
    ],
  },
];

const STATUS_STEPS = [
  { key: 'confirmed',           label: 'Confirmed & Paid', sub: 'Slot terverifikasi',   color: '#F2A900' },
  { key: 'checked_in',          label: 'Checked In',       sub: 'Scan QR di Welcomer',  color: '#38BDF8' },
  { key: 'in_progress',         label: 'In Progress',      sub: 'Sedang dikerjakan',     color: '#0EC278' },
  { key: 'rescheduled_pending', label: 'Late ⚠️',          sub: '>5 menit terlambat',    color: '#F04F4F' },
];

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

// ─── MEMBER CARD MODAL ────────────────────────────────────────────────────────
const TIER_STYLES = {
  'VIP Platinum': { bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1a0a2e 100%)', accent: '#A855F7', shine: 'rgba(168,85,247,.4)', label: '✦ VIP PLATINUM', textColor: '#E9D5FF' },
  'VIP Gold':     { bg: 'linear-gradient(135deg, #1a1200 0%, #2a2000 40%, #1a1200 100%)', accent: '#F2A900', shine: 'rgba(242,169,0,.4)',   label: '✦ VIP GOLD',     textColor: '#FEF3C7' },
  'Silver':       { bg: 'linear-gradient(135deg, #111318 0%, #1d2029 40%, #111318 100%)', accent: '#94A3B8', shine: 'rgba(148,163,184,.3)', label: '◈ SILVER',        textColor: '#CBD5E1' },
};

const MemberCardModal = ({ member, onClose }) => {
  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES['Silver'];
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const qrData = `AURA-MEMBER-${member.memberId ?? 'AUR-0001'}`;
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}&bgcolor=ffffff&color=0D0D0F&qzone=2`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 440, width: '100%' }}>

        {/* ── THE CARD ──────────────────────────────────────── */}
        <div style={{
          width: '100%', aspectRatio: '1.586 / 1',
          background: tier.bg,
          borderRadius: 20,
          padding: '28px 32px',
          position: 'relative', overflow: 'hidden',
          border: `1px solid ${tier.accent}44`,
          boxShadow: `0 0 60px ${tier.shine}, 0 24px 48px rgba(0,0,0,.6)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>

          {/* Decorative circles */}
          <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:`radial-gradient(circle, ${tier.accent}22 0%, transparent 70%)`, pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-80, left:-40, width:240, height:240, borderRadius:'50%', background:`radial-gradient(circle, ${tier.accent}11 0%, transparent 70%)`, pointerEvents:'none' }} />
          {/* Shine stripe */}
          <div style={{ position:'absolute', top:0, left:'30%', width:'40%', height:'100%', background:`linear-gradient(90deg, transparent, ${tier.accent}08, transparent)`, transform:'skewX(-15deg)', pointerEvents:'none' }} />

          {/* TOP ROW: brand + tier */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg, ${tier.accent}, ${tier.accent}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:'#0D0D0F', flexShrink:0 }}>A</div>
                <div>
                  <div style={{ fontWeight:900, fontSize:15, letterSpacing:'.12em', color:'#fff' }}>AURA</div>
                  <div style={{ fontSize:9, letterSpacing:'.2em', color:`${tier.accent}cc`, textTransform:'uppercase', marginTop:-1 }}>AUTO CARE</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.14em', color: tier.accent, textTransform:'uppercase' }}>{tier.label}</div>
              <div style={{ fontSize:9, color:`${tier.textColor}88`, letterSpacing:'.08em', marginTop:2 }}>MEMBER CARD</div>
            </div>
          </div>

          {/* MIDDLE: avatar + name + vehicle */}
          <div style={{ display:'flex', alignItems:'center', gap:16, position:'relative' }}>
            <div style={{
              width:52, height:52, borderRadius:14,
              background:`linear-gradient(135deg, ${tier.accent}33, ${tier.accent}11)`,
              border:`1.5px solid ${tier.accent}66`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, fontWeight:900, color: tier.accent,
              letterSpacing:'-.02em', flexShrink:0,
            }}>{initials}</div>
            <div>
              <div style={{ fontSize:18, fontWeight:900, letterSpacing:'-.02em', color:'#fff', lineHeight:1.1, marginBottom:4 }}>{member.name}</div>
              <div style={{ fontSize:11, color:`${tier.textColor}99`, letterSpacing:'.04em', display:'flex', alignItems:'center', gap:6 }}>
                <span>🚗</span>
                <span>{member.vehicle}</span>
              </div>
              <div style={{ fontFamily:'monospace', fontSize:11, marginTop:3, color: tier.accent, fontWeight:700, letterSpacing:'.06em' }}>{member.plate}</div>
            </div>
          </div>

          {/* BOTTOM ROW: ID + points + validThru */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', position:'relative' }}>
            <div>
              <div style={{ fontSize:9, color:`${tier.textColor}66`, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:2 }}>Member ID</div>
              <div style={{ fontFamily:'monospace', fontSize:14, fontWeight:800, color:'#fff', letterSpacing:'.1em' }}>{member.memberId ?? 'AUR-0001'}</div>
              <div style={{ fontSize:9, color:`${tier.textColor}66`, letterSpacing:'.08em', marginTop:4, textTransform:'uppercase' }}>Bergabung {member.joinDate ?? '2026'}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, color:`${tier.textColor}66`, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:2 }}>AURA Points</div>
              <div style={{ fontSize:24, fontWeight:900, color: tier.accent, lineHeight:1, letterSpacing:'-.02em' }}>{member.points}</div>
              <div style={{ fontSize:9, color:`${tier.textColor}66`, marginTop:1, letterSpacing:'.08em' }}>pts · {member.totalVisits ?? 0} kunjungan</div>
            </div>
          </div>
        </div>

        {/* ── QR + INFO ──────────────────────────────────────── */}
        <div style={{ background:'#141417', border:'1px solid #28282F', borderRadius:16, padding:'20px 24px', width:'100%', display:'flex', gap:20, alignItems:'center' }}>
          {/* QR Code */}
          <div style={{ background:'#fff', borderRadius:12, padding:8, border:`3px solid ${tier.accent}`, boxShadow:`0 0 20px ${tier.shine}`, flexShrink:0 }}>
            <img src={qrUrl} alt="QR Member" style={{ width:90, height:90, display:'block', borderRadius:6 }} />
          </div>
          {/* Info */}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:800, marginBottom:10, color:'#fff' }}>Scan QR di Meja Welcomer</div>
            {[
              { label:'Username',   value: member.username ?? member.phone },
              { label:'No. HP',     value: member.phone },
              { label:'Tier',       value: member.tier },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
                <span style={{ color:'#5C5C70' }}>{r.label}</span>
                <span style={{ fontWeight:700, color:'#A0A0B0', fontFamily: r.label==='Username'?'monospace':'inherit' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── ACTIONS ────────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, width:'100%' }}>
          <button className="btn btn-ghost" style={{ justifyContent:'center' }} onClick={onClose}>Tutup</button>
          <button className="btn btn-gold" style={{ justifyContent:'center' }} onClick={() => window.print()}>🖨️ Cetak Kartu</button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const CustomerPortal = () => {
  const { members, reservations, createReservation, triggerLateArrival, inventory, checkoutMarketplace, showToast } = useCarWash();

  const [tab, setTab]         = useState('reservasi');
  const [svcId, setSvcId]     = useState('premium_clean');
  const [variantId, setVariantId] = useState('medium');
  const [date, setDate]       = useState('2026-09-30');
  const [time, setTime]       = useState('20:00');
  const [qrisModal, setQrisModal] = useState(false);
  const [waModal, setWaModal] = useState(false);
  const [ticket, setTicket]   = useState(null);
  const [cart, setCart]       = useState([]);
  const [cardModal, setCardModal] = useState(false);

  const member    = members[0];
  const myRes     = reservations.filter(r => r.phone === member.phone);
  const activeRes = myRes.find(r => !['completed','cancelled'].includes(r.status)) || myRes[0];

  const service    = SERVICES.find(s => s.id === svcId);
  const variant    = service.variants.find(v => v.id === variantId);
  const discount   = member.tier === 'VIP Platinum' ? 15 : member.tier === 'VIP Gold' ? 10 : 0;
  const discAmt    = Math.round(variant.price * discount / 100);
  const totalPay   = variant.price - discAmt;

  // Has the member ever booked Premium Clean?
  const hasPremiumHistory = myRes.some(r => r.serviceId === 'premium_clean');

  const handleBook = (e) => { e.preventDefault(); setQrisModal(true); };
  const handlePay  = () => {
    setQrisModal(false);
    const r = createReservation({ name: member.name, phone: member.phone, vehicle: member.vehicle, plate: member.plate, serviceId: svcId, serviceName: `${service.name} (${variant.label})`, variantId, variantLabel: variant.label, price: totalPay, date, time, paymentMethod: 'qris' });
    setTicket(r);
    setWaModal(true);
  };

  const products  = inventory.filter(i => i.category !== 'operasional');
  const addToCart = (p) => {
    setCart(c => {
      const ex = c.find(x => x.id === p.id);
      return ex ? c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...p, qty: 1 }];
    });
    showToast(`${p.name} ditambahkan`, 'info');
  };
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const TABS = [
    { id: 'reservasi', label: 'Reservasi Online', emoji: '📅' },
    { id: 'antrean',   label: 'Antrean Aktif',   emoji: '🎫' },
    { id: 'video',     label: 'Dokumentasi',     emoji: '🎥', premiumOnly: true },
    { id: 'store',     label: 'Store',            emoji: '🛒' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>

      {/* ── PROFILE CARD ──────────────────────────────────────────────── */}
      <div className="card-gold" style={{ padding: '22px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', right:-40, top:-40, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(242,169,0,.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:20, position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:56, height:56, borderRadius:14, background:'linear-gradient(135deg, #1a1500, #2a2100)', border:'1.5px solid rgba(242,169,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:'#F2A900', boxShadow:'0 4px 16px rgba(242,169,0,.15)' }}>
              {member.name.split(' ').map(w => w[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:'-.03em' }}>{member.name}</h2>
                <span className="badge badge-gold">✦ {member.tier}</span>
              </div>
              <div style={{ fontSize:12.5, color:'#A0A0B0', display:'flex', alignItems:'center', gap:6 }}>
                <span>🚗</span><span>{member.vehicle}</span>
                <span style={{ padding:'2px 8px', background:'#1A1A1F', borderRadius:6, fontFamily:'monospace', fontSize:12, color:'#fff', border:'1px solid #28282F' }}>{member.plate}</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'#5C5C70', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:700, marginBottom:2 }}>AURA Points</div>
              <div style={{ fontSize:28, fontWeight:900, color:'#F2A900', letterSpacing:'-.03em', lineHeight:1 }}>{member.points} <span style={{ fontSize:13, color:'#A0A0B0', fontWeight:500 }}>pts</span></div>
            </div>
            <div style={{ width:1, height:40, background:'#28282F' }} />
            <button className="btn btn-gold" style={{ fontSize:12 }} onClick={() => setCardModal(true)}>🪪 Lihat Member Card</button>
          </div>
        </div>
      </div>

      {/* ── TABS ──────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid #28282F' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          const locked = t.premiumOnly && !hasPremiumHistory;
          return (
            <button key={t.id}
              onClick={() => { if (!locked) setTab(t.id); else showToast('Dokumentasi hanya tersedia untuk paket Premium Clean', 'warning'); }}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', border:'none', cursor: locked ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:active?700:500, background:'transparent', color: locked ? '#38383F' : active ? '#F2A900' : '#A0A0B0', borderBottom: active ? '2px solid #F2A900' : '2px solid transparent', marginBottom:-1, transition:'all .15s' }}>
              <span>{t.emoji}</span>{t.label}
              {t.premiumOnly && <span style={{ fontSize:9, fontWeight:800, padding:'2px 5px', borderRadius:4, background: hasPremiumHistory ? 'rgba(242,169,0,.15)' : 'rgba(255,255,255,.05)', color: hasPremiumHistory ? '#F2A900' : '#38383F', letterSpacing:'.06em' }}>PREMIUM</span>}
              {t.id === 'antrean' && activeRes && <span style={{ width:7, height:7, borderRadius:'50%', background:'#0EC278', boxShadow:'0 0 6px #0EC278', display:'inline-block' }} />}
            </button>
          );
        })}
      </div>

      {/* ═══ RESERVASI ══════════════════════════════════════════════════ */}
      {tab === 'reservasi' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24 }}>
          <div>
            {/* Step 1 */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'#F2A900', color:'#0D0D0F', fontSize:12, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>1</div>
              <span style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.06em', color:'#A0A0B0' }}>Pilih Paket Layanan</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:28 }}>
              {SERVICES.map(s => {
                const active = svcId === s.id;
                return (
                  <div key={s.id} onClick={() => { setSvcId(s.id); setVariantId('medium'); }}
                    style={{ background: active ? 'linear-gradient(135deg,#1a1500,#161300)' : '#141417', border:`1px solid ${active ? s.accentColor : '#28282F'}`, borderRadius:14, padding:22, cursor:'pointer', transition:'all .18s', boxShadow: active ? `0 0 20px ${s.accentColor}22` : 'none' }}
                    onMouseEnter={e => { if(!active) { e.currentTarget.style.borderColor = s.accentColor+'88'; e.currentTarget.style.background='#1A1A1F'; }}}
                    onMouseLeave={e => { if(!active) { e.currentTarget.style.borderColor='#28282F'; e.currentTarget.style.background='#141417'; }}}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                      <div style={{ fontSize:28 }}>{s.emoji}</div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                        {active && <div style={{ width:22, height:22, borderRadius:'50%', background:s.accentColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'#0D0D0F' }}>✓</div>}
                        {s.hasDocs && <span style={{ fontSize:9, fontWeight:800, padding:'2px 5px', borderRadius:4, background:'rgba(242,169,0,.12)', color:'#F2A900', letterSpacing:'.06em' }}>DOCS ✦</span>}
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:s.accentColor, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>{s.duration}</div>
                    <div style={{ fontSize:16, fontWeight:800, letterSpacing:'-.02em', marginBottom:6 }}>{s.name}</div>
                    <div style={{ fontSize:12, color:'#5C5C70', marginBottom:14 }}>{s.description}</div>
                    <div style={{ height:1, background:'#28282F', marginBottom:14 }} />
                    <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:7 }}>
                      {s.features.map((f,i) => (
                        <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12, color: f.includes('✦') ? s.accentColor : '#A0A0B0' }}>
                          <span style={{ color:s.accentColor, flexShrink:0, marginTop:1 }}>✦</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Step 2 */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'#F2A900', color:'#0D0D0F', fontSize:12, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>2</div>
              <span style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.06em', color:'#A0A0B0' }}>Pilih Ukuran Kendaraan</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {service.variants.map(v => {
                const active = variantId === v.id;
                return (
                  <div key={v.id} onClick={() => setVariantId(v.id)}
                    style={{ border:`2px solid ${active ? service.accentColor : '#28282F'}`, borderRadius:12, padding:'16px 14px', cursor:'pointer', background: active ? `${service.accentColor}10` : '#141417', transition:'all .15s', textAlign:'center', boxShadow: active ? `0 0 16px ${service.accentColor}22` : 'none' }}
                    onMouseEnter={e => { if(!active) e.currentTarget.style.borderColor = service.accentColor+'55'; }}
                    onMouseLeave={e => { if(!active) e.currentTarget.style.borderColor = '#28282F'; }}
                  >
                    <div style={{ fontSize:28, marginBottom:8 }}>{v.icon}</div>
                    <div style={{ fontSize:13, fontWeight:800, marginBottom:3 }}>{v.label}</div>
                    <div style={{ fontSize:11, color:'#5C5C70', marginBottom:10, lineHeight:1.4 }}>{v.sub}</div>
                    <div style={{ fontSize:18, fontWeight:900, letterSpacing:'-.02em', color: active ? service.accentColor : '#fff' }}>{G(v.price)}</div>
                    {discount > 0 && <div style={{ fontSize:10, color:'#0EC278', marginTop:4, fontWeight:700 }}>Hemat {G(Math.round(v.price * discount / 100))}</div>}
                  </div>
                );
              })}
            </div>
            {discount > 0 && (
              <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'rgba(14,194,120,.07)', border:'1px solid rgba(14,194,120,.2)', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14 }}>🎁</span>
                <span style={{ fontSize:12.5, color:'#0EC278', fontWeight:600 }}>Diskon <strong>{discount}%</strong> untuk tier <strong>{member.tier}</strong> otomatis diterapkan</span>
              </div>
            )}
          </div>

          {/* Booking form */}
          <div className="card" style={{ padding:22, height:'fit-content', position:'sticky', top:80 }}>
            <div style={{ marginBottom:18, paddingBottom:14, borderBottom:'1px solid #28282F', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>📅</span><span style={{ fontWeight:700, fontSize:14 }}>Step 3 — Konfirmasi Slot</span>
            </div>
            <div style={{ background:'#0D0D0F', borderRadius:10, padding:14, border:`1px solid ${service.accentColor}33`, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span style={{ fontSize:16 }}>{service.emoji}</span>
                <span style={{ fontWeight:700, fontSize:13, color:service.accentColor }}>{service.name}</span>
                {service.hasDocs && <span style={{ fontSize:9, fontWeight:800, padding:'2px 5px', borderRadius:4, background:'rgba(242,169,0,.12)', color:'#F2A900' }}>DOCS ✦</span>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#A0A0B0' }}>
                <span>{variant.icon}</span><span>{variant.label} — {variant.sub}</span>
              </div>
            </div>
            <form onSubmit={handleBook} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label className="label">No. WhatsApp</label><input readOnly value={member.phone} className="input" /></div>
              <div><label className="label">Kendaraan & Plat</label><input readOnly value={`${member.vehicle} · ${member.plate}`} className="input" /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label className="label">Tanggal</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="input" required /></div>
                <div>
                  <label className="label">Slot Waktu</label>
                  <select value={time} onChange={e=>setTime(e.target.value)} className="input">
                    {['19:00','19:30','20:00','20:30','21:00'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ background:'#0D0D0F', borderRadius:10, padding:14, border:'1px solid #28282F' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
                  <span style={{ color:'#A0A0B0' }}>{service.name} ({variant.label})</span><span>{G(variant.price)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#0EC278', marginBottom:5 }}>
                    <span>Diskon {member.tier} ({discount}%)</span><span>- {G(discAmt)}</span>
                  </div>
                )}
                <div style={{ height:1, background:'#28282F', margin:'8px 0' }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:900 }}>
                  <span style={{ color:'#A0A0B0', fontSize:13 }}>Total Bayar</span>
                  <span style={{ color:'#F2A900', letterSpacing:'-.02em' }}>{G(totalPay)}</span>
                </div>
              </div>
              <button type="submit" className="btn btn-gold" style={{ justifyContent:'center', padding:'13px 0', fontSize:13.5 }}>Bayar via QRIS & Booking →</button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ ANTREAN ════════════════════════════════════════════════════ */}
      {tab === 'antrean' && (
        <div>
          {activeRes ? (
            <div className="card-gold" style={{ padding:28 }}>
              <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:20, marginBottom:24, paddingBottom:20, borderBottom:'1px solid rgba(242,169,0,.15)' }}>
                <div>
                  <div className="tag" style={{ marginBottom:6 }}>Kode Tiket Reservasi</div>
                  <div className="mono" style={{ fontSize:22, fontWeight:900, color:'#F2A900', letterSpacing:'.04em' }}>{activeRes.bookingCode}</div>
                  <div style={{ fontSize:12, color:'#A0A0B0', marginTop:6 }}>{activeRes.serviceName}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ textAlign:'right' }}>
                    <div className="tag" style={{ marginBottom:4 }}>No. Antrean</div>
                    <div style={{ fontSize:44, fontWeight:900, lineHeight:1 }}>#{activeRes.queueNumber}</div>
                  </div>
                  <div style={{ background:'#fff', padding:8, borderRadius:10, border:'3px solid #F2A900' }}>
                    <img src={activeRes.qrCodeUrl} alt="QR" style={{ width:70, height:70, display:'block', borderRadius:4 }} />
                  </div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
                {STATUS_STEPS.map(s => {
                  const active = activeRes.status === s.key;
                  return (
                    <div key={s.key} style={{ padding:14, borderRadius:10, background: active ? `${s.color}12` : '#0D0D0F', border:`1px solid ${active ? s.color+'55' : '#28282F'}` }}>
                      <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.06em', color:s.color, marginBottom:6 }}>● Status</div>
                      <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{s.label}</div>
                      <div style={{ fontSize:11, color:'#5C5C70' }}>{s.sub}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:14, padding:16, borderRadius:10, background:'rgba(240,79,79,.07)', border:'1px solid rgba(240,79,79,.2)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <span style={{ fontSize:20 }}>⏱️</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:3 }}>Uji Sistem: Late Arrival Engine</div>
                    <div style={{ fontSize:12, color:'#A0A0B0' }}>Simulasikan keterlambatan &gt;5 menit dari slot tanpa scan QR.</div>
                  </div>
                </div>
                <button className="btn btn-danger" onClick={() => triggerLateArrival(activeRes.id)}>⏰ Trigger Terlambat</button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding:60, textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Tidak ada reservasi aktif</div>
              <div style={{ fontSize:13, color:'#5C5C70' }}>Buat pemesanan di tab Reservasi Online</div>
            </div>
          )}
        </div>
      )}

      {/* ═══ DOKUMENTASI — Premium Only ════════════════════════════════ */}
      {tab === 'video' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <p className="section-title">Dokumentasi Before & After</p>
            <span className="badge badge-gold">✦ Eksklusif Premium Clean</span>
          </div>
          {!hasPremiumHistory ? (
            <div className="card" style={{ padding:60, textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎥</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Fitur Eksklusif Premium Clean</div>
              <div style={{ fontSize:13, color:'#5C5C70', maxWidth:400, margin:'0 auto' }}>Dokumentasi video before &amp; after hanya tersedia setelah Anda menggunakan paket <strong style={{ color:'#F2A900' }}>Premium Clean &amp; Detailing</strong>.</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {[
                { label:'SEBELUM', sub:'Inspeksi kondisi awal kendaraan', color:'#38BDF8', src:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
                { label:'SESUDAH', sub:'Hasil akhir detailing & coating', color:'#0EC278', src:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
              ].map((v,i) => (
                <div key={i} className="card" style={{ overflow:'hidden' }}>
                  <div style={{ position:'relative', background:'#000', aspectRatio:'16/9' }}>
                    <video src={v.src} controls style={{ width:'100%', height:'100%', display:'block', objectFit:'cover' }} />
                    <div style={{ position:'absolute', top:12, left:12, background:'rgba(13,13,15,.85)', backdropFilter:'blur(8px)', padding:'4px 10px', borderRadius:6, border:`1px solid ${v.color}44`, fontSize:11, fontWeight:800, letterSpacing:'.06em', color:v.color }}>{v.label}</div>
                  </div>
                  <div style={{ padding:'14px 18px' }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{v.sub}</div>
                    <div style={{ fontSize:12, color:'#5C5C70', marginTop:4 }}>Rekaman oleh Welcomer — 30 Sept 2026</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ STORE ══════════════════════════════════════════════════════ */}
      {tab === 'store' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24 }}>
          <div>
            <p className="tag" style={{ marginBottom:16 }}>AURA Auto Care & Apparel Store</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:14 }}>
              {products.map(p => (
                <div key={p.id} className="card" style={{ padding:18 }}>
                  <div style={{ height:70, background:'linear-gradient(135deg,#1A1A1F,#202026)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, fontSize:28 }}>
                    {p.category === 'merchandise' ? '👕' : '🧴'}
                  </div>
                  <span className="badge badge-gold" style={{ marginBottom:8, fontSize:10 }}>{p.category}</span>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:4, lineHeight:1.3 }}>{p.name}</div>
                  <div style={{ fontFamily:'monospace', fontSize:11, color:'#5C5C70', marginBottom:10 }}>{p.sku}</div>
                  <div style={{ fontSize:18, fontWeight:900, color:'#F2A900', letterSpacing:'-.02em', marginBottom:4 }}>{G(p.price)}</div>
                  <div style={{ fontSize:11, color:'#5C5C70', marginBottom:14 }}>Stok: <strong style={{ color:'#A0A0B0' }}>{p.stock} {p.unit}</strong></div>
                  <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', fontSize:12 }} onClick={() => addToCart(p)}>+ Keranjang</button>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding:20, height:'fit-content' }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:16, paddingBottom:14, borderBottom:'1px solid #28282F', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>🛒 Keranjang</span><span className="badge badge-gold">{cart.length}</span>
            </div>
            {cart.length > 0 ? (
              <>
                <div className="scroll-list" style={{ maxHeight:260, display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                  {cart.map(c => (
                    <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'#0D0D0F', borderRadius:8, border:'1px solid #28282F' }}>
                      <div><div style={{ fontSize:12, fontWeight:700 }}>{c.name}</div><div style={{ fontSize:11, color:'#5C5C70' }}>{c.qty}x · {G(c.price)}</div></div>
                      <span style={{ fontSize:12, fontWeight:700, color:'#F2A900' }}>{G(c.price * c.qty)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height:1, background:'#28282F', marginBottom:14 }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:14, marginBottom:14 }}>
                  <span style={{ color:'#A0A0B0' }}>Total</span><span style={{ color:'#F2A900' }}>{G(cartTotal)}</span>
                </div>
                <button className="btn btn-gold" style={{ width:'100%', justifyContent:'center' }} onClick={() => { checkoutMarketplace(cart, cartTotal); setCart([]); }}>Checkout Sekarang</button>
              </>
            ) : (
              <div style={{ padding:'30px 0', textAlign:'center', color:'#5C5C70', fontSize:13 }}>Keranjang kosong</div>
            )}
          </div>
        </div>
      )}

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {cardModal && <MemberCardModal member={member} onClose={() => setCardModal(false)} />}

      {qrisModal && (
        <div className="modal-overlay" onClick={() => setQrisModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding:28, maxWidth:400, width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Scan QRIS Pembayaran</div>
            <div style={{ fontSize:13, color:'#A0A0B0', marginBottom:4 }}>{service.name} · {variant.label}</div>
            <div style={{ fontSize:24, fontWeight:900, color:'#F2A900', marginBottom:20 }}>{G(totalPay)}</div>
            <div style={{ background:'#fff', borderRadius:14, padding:16, display:'inline-block', marginBottom:20, border:'3px solid #F2A900', boxShadow:'0 0 20px rgba(242,169,0,.25)' }}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AURA-PAYMENT-QRIS" alt="QRIS" style={{ width:150, height:150, display:'block', borderRadius:4 }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button className="btn btn-ghost" style={{ justifyContent:'center' }} onClick={() => setQrisModal(false)}>Batal</button>
              <button className="btn btn-gold" style={{ justifyContent:'center' }} onClick={handlePay}>✓ Simulasi Bayar</button>
            </div>
          </div>
        </div>
      )}

      {waModal && ticket && (
        <div className="modal-overlay" onClick={() => setWaModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding:28, maxWidth:420, width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(14,194,120,.15)', border:'1px solid rgba(14,194,120,.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#0EC278', fontSize:16 }}>✓</div>
              <div style={{ fontWeight:800, fontSize:16 }}>Booking Berhasil! Tiket via WA</div>
            </div>
            <div style={{ background:'#0D0D0F', borderRadius:10, padding:16, fontFamily:'monospace', fontSize:12, lineHeight:1.8, border:'1px solid #28282F', marginBottom:20 }}>
              <div style={{ color:'#F2A900', fontWeight:700, marginBottom:8 }}>📲 [AURA WA Gateway]</div>
              <div>Halo <strong>{ticket.customerName}</strong>, Pembayaran BERHASIL ✅</div>
              <div style={{ height:1, background:'#28282F', margin:'8px 0' }} />
              <div>🎫 Antrean: <strong>#{ticket.queueNumber}</strong></div>
              <div>🔖 Kode: <strong>{ticket.bookingCode}</strong></div>
              <div>🚘 {ticket.vehicle} ({ticket.plate})</div>
              <div>📦 {ticket.serviceName}</div>
              <div>⏰ {ticket.reservationDate} · {ticket.reservationTime} WIB</div>
              <div style={{ height:1, background:'#28282F', margin:'8px 0' }} />
              <div style={{ color:'#5C5C70', fontSize:11 }}>⚠️ Terlambat &gt;5 menit → slot dialihkan otomatis</div>
            </div>
            <button className="btn btn-gold" style={{ width:'100%', justifyContent:'center' }} onClick={() => { setWaModal(false); setTab('antrean'); }}>Lihat Status Antrean →</button>
          </div>
        </div>
      )}
    </div>
  );
};
