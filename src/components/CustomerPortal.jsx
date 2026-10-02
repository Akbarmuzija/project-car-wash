import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';
import { LandingPage } from './LandingPage';

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
  { key: 'confirmed',           label: 'Menunggu',        sub: 'Verifikasi di Welcomer', color: '#F2A900' },
  { key: 'checked_in',          label: 'Checked In',      sub: 'Proses Pencucian',       color: '#38BDF8' },
  { key: 'completed',           label: 'Check-Out (Selesai)', sub: 'Selesai Pencucian',  color: '#0EC278' },
  { key: 'rescheduled_pending', label: 'Late ⚠️',         sub: '>5 menit terlambat',     color: '#F04F4F' },
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
          <div style={{ position:'absolute', top:0, left:'30%', width:'40%', height:'100%', background:`linear-gradient(90deg, transparent, ${tier.accent}08, transparent)`, transform:'skewX(-15deg)', pointerEvents:'none' }} />

          {/* TOP ROW */}
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

          {/* MIDDLE */}
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

          {/* BOTTOM ROW */}
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

        {/* QR + INFO */}
        <div style={{ background:'#141417', border:'1px solid #28282F', borderRadius:16, padding:'20px 24px', width:'100%', display:'flex', gap:20, alignItems:'center' }}>
          <div style={{ background:'#fff', borderRadius:12, padding:8, border:`3px solid ${tier.accent}`, boxShadow:`0 0 20px ${tier.shine}`, flexShrink:0 }}>
            <img src={qrUrl} alt="QR Member" style={{ width:90, height:90, display:'block', borderRadius:6 }} />
          </div>
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

        {/* ACTIONS */}
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
  const {
    members, reservations, createReservation, triggerLateArrival,
    inventory, checkoutMarketplace, showToast, authUsers, logoutUser
  } = useCarWash();

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

  // If customer is not logged in, show Landing Page first!
  const member = authUsers.pelanggan || members[0];
  const isLoggedIn = !!authUsers.pelanggan;

  if (!isLoggedIn) {
    return <LandingPage />;
  }

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

  // Customer Cart Handlers: Add, Increase, Decrease, Remove
  const addToCart = (p) => {
    setCart(c => {
      const ex = c.find(x => x.id === p.id);
      return ex ? c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...p, qty: 1 }];
    });
    showToast(`${p.name} ditambahkan ke keranjang`, 'info');
  };

  const updateCartQty = (id, delta) => {
    setCart(c => c.map(x => {
      if (x.id === id) {
        const newQty = x.qty + delta;
        return newQty > 0 ? { ...x, qty: newQty } : null;
      }
      return x;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(c => c.filter(x => x.id !== id));
    showToast('Barang dihapus dari keranjang', 'warning');
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Tabs navigation - Dokumentasi ONLY appears if user has booked Premium Clean!
  const TABS = [
    { id: 'reservasi', label: 'Reservasi Online', emoji: '📅' },
    { id: 'antrean',   label: 'Antrean Aktif',   emoji: '🎫' },
    ...(hasPremiumHistory ? [{ id: 'video', label: 'Dokumentasi Video', emoji: '🎥', premiumOnly: true }] : []),
    { id: 'store',     label: 'Store & Merchandise', emoji: '🛒' },
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
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-gold" style={{ fontSize:12 }} onClick={() => setCardModal(true)}>🪪 Member Card</button>
              <button className="btn btn-ghost" style={{ fontSize:12, color:'#F04F4F', border:'1px solid rgba(240,79,79,.3)' }} onClick={() => logoutUser('pelanggan')}>🚪 Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ──────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid #28282F' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', border:'none', cursor: 'pointer', fontSize:13, fontWeight:active?700:500, background:'transparent', color: active ? '#F2A900' : '#A0A0B0', borderBottom: active ? '2px solid #F2A900' : '2px solid transparent', marginBottom:-1, transition:'all .15s' }}>
              <span>{t.emoji}</span>{t.label}
              {t.premiumOnly && <span style={{ fontSize:9, fontWeight:800, padding:'2px 5px', borderRadius:4, background: 'rgba(242,169,0,.15)', color: '#F2A900', letterSpacing:'.06em' }}>PREMIUM ONLY</span>}
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

          {/* Right form panel */}
          <div className="card" style={{ padding:22, height:'fit-content' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, paddingBottom:14, borderBottom:'1px solid #28282F' }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'#F2A900', color:'#0D0D0F', fontSize:12, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>3</div>
              <span style={{ fontSize:13, fontWeight:800 }}>Konfirmasi Jadwal &amp; Bayar</span>
            </div>
            <form onSubmit={handleBook} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label className="label">Tanggal Reservasi</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">Pilihan Slot Waktu</label>
                <select value={time} onChange={e => setTime(e.target.value)} className="input">
                  {['09:00','10:30','13:00','14:30','16:00','17:30','19:00','20:00'].map(t => (
                    <option key={t} value={t}>{t} WIB — Slot Tersedia</option>
                  ))}
                </select>
              </div>

              {/* Price Breakdown */}
              <div style={{ background:'#0D0D0F', borderRadius:10, padding:14, border:'1px solid #28282F', marginTop:6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#A0A0B0', marginBottom:6 }}>
                  <span>{service.name} ({variant.label})</span>
                  <span>{G(variant.price)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#0EC278', marginBottom:6 }}>
                    <span>Diskon Member ({discount}%)</span>
                    <span>−{G(discAmt)}</span>
                  </div>
                )}
                <div style={{ height:1, background:'#28282F', margin:'8px 0' }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:16 }}>
                  <span style={{ color:'#A0A0B0', fontSize:13 }}>Total Bayar</span>
                  <span style={{ color:'#F2A900' }}>{G(totalPay)}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-gold" style={{ width:'100%', justifyContent:'center', padding:'12px 0', fontSize:14, marginTop:4 }}>
                📱 Bayar DP &amp; Reservasi via QRIS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ ANTREAN AKTIF ══════════════════════════════════════════════ */}
      {tab === 'antrean' && (
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          {activeRes ? (
            <div className="card-gold" style={{ padding:28 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <span className="badge badge-gold" style={{ marginBottom:6, display:'inline-block' }}>Tiket Akses Antrean</span>
                  <h3 style={{ fontSize:22, fontWeight:900, letterSpacing:'-.02em' }}>{activeRes.serviceName}</h3>
                  <div style={{ fontSize:12, color:'#A0A0B0', marginTop:2 }}>Kode Booking: <strong className="mono" style={{ color:'#F2A900' }}>{activeRes.bookingCode}</strong></div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:11, color:'#5C5C70', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:700 }}>No. Antrean</div>
                  <div style={{ fontSize:36, fontWeight:900, color:'#F2A900', lineHeight:1, fontFamily:'monospace' }}>#{activeRes.queueNumber}</div>
                </div>
              </div>

              {/* Status Stepper */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:24, background:'#0D0D0F', padding:16, borderRadius:12, border:'1px solid #28282F' }}>
                {STATUS_STEPS.slice(0,3).map((st, idx) => {
                  const isDone = (activeRes.status === st.key) || (st.key === 'confirmed' && ['checked_in','completed'].includes(activeRes.status)) || (st.key === 'checked_in' && activeRes.status === 'completed');
                  return (
                    <div key={st.key} style={{ textAlign:'center', opacity: isDone ? 1 : 0.4 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background: isDone ? st.color : '#28282F', color: isDone ? '#0D0D0F' : '#5C5C70', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 6px', fontSize:12, fontWeight:900 }}>
                        {isDone ? '✓' : idx+1}
                      </div>
                      <div style={{ fontSize:11, fontWeight:700, color: isDone ? st.color : '#A0A0B0' }}>{st.label}</div>
                      <div style={{ fontSize:9, color:'#5C5C70', marginTop:2 }}>{st.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* QR Code */}
              <div style={{ display:'flex', alignItems:'center', gap:20, background:'#0D0D0F', padding:20, borderRadius:14, border:'1px solid rgba(242,169,0,.2)', marginBottom:20 }}>
                <div style={{ background:'#fff', padding:8, borderRadius:10, border:'2px solid #F2A900', flexShrink:0 }}>
                  <img src={activeRes.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AURA'} alt="QR Code" style={{ width:100, height:100, display:'block' }} />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#fff', marginBottom:4 }}>Tunjukkan QR Code ke Welcomer</div>
                  <div style={{ fontSize:12, color:'#A0A0B0', lineHeight:1.5 }}>Petugas welcomer kami akan melakukan scan QR untuk mengonfirmasi kedatangan Anda.</div>
                  <div style={{ fontSize:11, color:'#F2A900', marginTop:8, fontWeight:700 }}> Slot Waktu: {activeRes.reservationTime ?? '20:00'} WIB</div>
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:12, color:'#5C5C70' }}>Membutuhkan bantuan? Hubungi CS WA +6281299887766</span>
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
            <p className="section-title">Dokumentasi Before &amp; After</p>
            <span className="badge badge-gold">✦ Eksklusif Premium Clean</span>
          </div>
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
                  <div style={{ fontSize:12, color:'#5C5C70', marginTop:4 }}>Rekaman oleh Welcomer — AURA Detailing Bay</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ STORE & MERCHANDISE (CUSTOMER SHOPPING & CART) ════════════════ */}
      {tab === 'store' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24 }}>
          <div>
            <div style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:18, fontWeight:800 }}>Store Autocare &amp; Merchandise</h3>
              <p style={{ fontSize:12, color:'#5C5C70' }}>Produk perawatan mobil premium &amp; apparel resmi AURA</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:14 }}>
              {products.map(p => (
                <div key={p.id} className="card" style={{ padding:16, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <div>
                    <span className="badge badge-gold" style={{ fontSize:10, marginBottom:8, display:'inline-block' }}>{p.category}</span>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:4, lineHeight:1.3 }}>{p.name}</div>
                    <div style={{ fontFamily:'monospace', fontSize:11, color:'#5C5C70', marginBottom:10 }}>SKU: {p.sku}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:18, fontWeight:900, color:'#F2A900', letterSpacing:'-.02em', marginBottom:4 }}>{G(p.price)}</div>
                    <div style={{ fontSize:11, color:'#5C5C70', marginBottom:14 }}>Stok: <strong style={{ color:'#A0A0B0' }}>{p.stock} {p.unit}</strong></div>
                    <button className="btn btn-gold" style={{ width:'100%', justifyContent:'center', fontSize:12.5 }} onClick={() => addToCart(p)}>
                      + Tambah ke Keranjang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Cart Panel (Manage Items in Cart: Add, Decrease, Remove) */}
          <div className="card" style={{ padding:20, height:'fit-content' }}>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:16, paddingBottom:14, borderBottom:'1px solid #28282F', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>🛒 Keranjang Saya</span>
              {cart.length > 0 && (
                <span className="badge badge-gold">{cart.reduce((s,i)=>s+i.qty, 0)} Item</span>
              )}
            </div>

            {cart.length > 0 ? (
              <>
                <div className="scroll-list" style={{ maxHeight:320, display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                  {cart.map(c => (
                    <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px', background:'#0D0D0F', borderRadius:10, border:'1px solid #28282F' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12.5, fontWeight:700, color:'#fff', marginBottom:2 }}>{c.name}</div>
                        <div style={{ fontSize:11, color:'#F2A900', fontWeight:800 }}>{G(c.price * c.qty)}</div>
                      </div>

                      {/* Qty controls: Decrease (-), Quantity, Increase (+) */}
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <button
                          onClick={() => updateCartQty(c.id, -1)}
                          style={{ width:24, height:24, borderRadius:6, background:'#28282F', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}
                          title="Kurangi Jumlah"
                        >−</button>
                        <span style={{ fontSize:13, fontWeight:800, minWidth:20, textAlign:'center' }}>{c.qty}</span>
                        <button
                          onClick={() => updateCartQty(c.id, 1)}
                          style={{ width:24, height:24, borderRadius:6, background:'#28282F', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}
                          title="Tambah Jumlah"
                        >+</button>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => removeFromCart(c.id)}
                        style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:14, padding:4 }}
                        title="Hapus Barang"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ height:1, background:'#28282F', marginBottom:14 }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:15, marginBottom:16 }}>
                  <span style={{ color:'#A0A0B0', fontSize:13 }}>Total Tagihan</span>
                  <span style={{ color:'#F2A900', fontSize:18 }}>{G(cartTotal)}</span>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <button className="btn btn-gold" style={{ width:'100%', justifyContent:'center', padding:'12px 0', fontSize:13.5 }} onClick={() => { checkoutMarketplace(cart, cartTotal); setCart([]); }}>
                    🛒 Checkout Sekarang ({G(cartTotal)})
                  </button>
                  <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', fontSize:11, color:'#F04F4F' }} onClick={() => setCart([])}>
                    Kosongkan Keranjang
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding:'40px 0', textAlign:'center', color:'#5C5C70', fontSize:13 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🛒</div>
                Keranjang Anda masih kosong.<br/>Pilih produk di panel kiri.
              </div>
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
