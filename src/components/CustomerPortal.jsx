import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';
import { LandingPage } from './LandingPage';

// ── Service catalogue ─────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'fast_clean', name: 'Fast Clean Express', emoji: '⚡', accentColor: '#38BDF8',
    duration: '15–20 menit', description: 'Drive-through express bay tanpa turun dari mobil', hasDocs: false,
    features: ['Touchless foam wash & rinse', 'Deep gloss tire dressing', 'Air freshener spray', 'Tidak perlu turun dari mobil'],
    variants: [
      { id: 'small',  label: 'Small',  sub: 'City car / Hatchback',    price: 65000,  icon: '🚗' },
      { id: 'medium', label: 'Medium', sub: 'Sedan / SUV standard',     price: 85000,  icon: '🚙' },
      { id: 'big',    label: 'Big',    sub: 'SUV besar / MPV / Minivan', price: 105000, icon: '🚐' },
    ],
  },
  {
    id: 'premium_clean', name: 'Premium Clean & Detailing', emoji: '✦', accentColor: '#F2A900',
    duration: '45–60 menit', description: 'Pengalaman detailing eksklusif di Lounge VIP', hasDocs: true,
    features: ['Akses Lounge VIP + Signature Drink', 'Interior vacuum & ozone sanitasi', 'Ceramic hydrophobic wax coating', 'Video dokumentasi Before & After ✦'],
    variants: [
      { id: 'small',  label: 'Small',  sub: 'City car / Hatchback',    price: 200000, icon: '🚗' },
      { id: 'medium', label: 'Medium', sub: 'Sedan / SUV standard',     price: 275000, icon: '🚙' },
      { id: 'big',    label: 'Big',    sub: 'SUV besar / MPV / Minivan', price: 350000, icon: '🚐' },
    ],
  },
];

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

const STATUS_COLORS = {
  confirmed: '#F2A900', checked_in: '#38BDF8', in_progress: '#A855F7',
  completed: '#0EC278', cancelled: '#F04F4F', rescheduled_pending: '#F04F4F',
};

const TIER_STYLES = {
  'VIP Platinum': { bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1a0a2e 100%)', accent: '#A855F7', shine: 'rgba(168,85,247,.4)', label: '✦ VIP PLATINUM', textColor: '#E9D5FF' },
  'VIP Gold':     { bg: 'linear-gradient(135deg, #1a1200 0%, #2a2000 40%, #1a1200 100%)', accent: '#F2A900', shine: 'rgba(242,169,0,.4)',   label: '✦ VIP GOLD',     textColor: '#FEF3C7' },
  'Silver':       { bg: 'linear-gradient(135deg, #111318 0%, #1d2029 40%, #111318 100%)', accent: '#94A3B8', shine: 'rgba(148,163,184,.3)', label: '◈ SILVER',        textColor: '#CBD5E1' },
};

// ──────────────────────────────────────────────────────────────────────────────
// SIDEBAR NAV CONFIG
// ──────────────────────────────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',       icon: '⊞', group: 'main' },
  { id: 'reservasi',   label: 'Reservasi Online', icon: '📅', group: 'main', parent: 'dashboard' },
  { id: 'antrean',     label: 'Antrean Aktif',   icon: '🎫', group: 'main', parent: 'dashboard' },
  { id: 'kendaraan',   label: 'Kendaraan Saya',  icon: '🚗', group: 'main' },
  { id: 'store',       label: 'Store & Merch',   icon: '🛒', group: 'main' },
  { id: 'profil',      label: 'Profil Saya',     icon: '👤', group: 'pref' },
  { id: 'notifikasi',  label: 'Notifikasi',      icon: '🔔', group: 'pref' },
];

// ──────────────────────────────────────────────────────────────────────────────
// MINI BAR CHART
// ──────────────────────────────────────────────────────────────────────────────
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: '#5C5C70', fontWeight: 700 }}>{d.value}</div>
          <div style={{
            flex: 1, width: '100%', minHeight: 4,
            height: `${(d.value / max) * 100}%`,
            background: d.highlight ? 'linear-gradient(180deg,#F2A900,#C98B00)' : 'linear-gradient(180deg,#38BDF855,#38BDF822)',
            borderRadius: '4px 4px 0 0',
            border: d.highlight ? '1px solid #F2A90060' : '1px solid #28282F',
            transition: 'all .3s',
            position: 'relative',
          }} />
          <div style={{ fontSize: 10, color: '#5C5C70', whiteSpace: 'nowrap' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MEMBER CARD DISPLAY
// ──────────────────────────────────────────────────────────────────────────────
const MemberCardFull = ({ member }) => {
  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES['Silver'];
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const qrData = `AURA-MEMBER-${member.memberId ?? 'AUR-0001'}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}&bgcolor=ffffff&color=0D0D0F&qzone=2`;

  const REWARDS = [
    { icon: '☕', name: 'Free Signature Coffee', pts: 50  },
    { icon: '🎁', name: 'Diskon 15% Fast Clean', pts: 100 },
    { icon: '✦',  name: 'Free Premium Detailing', pts: 350 },
    { icon: '👑', name: 'Upgrade ke VIP Gold',   pts: 500 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* THE CARD */}
      <div style={{
        width: '100%', aspectRatio: '1.586 / 1',
        background: tier.bg, borderRadius: 20, padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
        border: `1px solid ${tier.accent}44`,
        boxShadow: `0 0 60px ${tier.shine}, 0 24px 48px rgba(0,0,0,.6)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:`radial-gradient(circle, ${tier.accent}22 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-40, width:240, height:240, borderRadius:'50%', background:`radial-gradient(circle, ${tier.accent}11 0%, transparent 70%)`, pointerEvents:'none' }} />

        {/* TOP */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg, ${tier.accent}, ${tier.accent}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:'#0D0D0F' }}>A</div>
            <div>
              <div style={{ fontWeight:900, fontSize:15, letterSpacing:'.12em', color:'#fff' }}>AURA</div>
              <div style={{ fontSize:9, letterSpacing:'.2em', color:`${tier.accent}cc`, textTransform:'uppercase' }}>AUTO CARE</div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.14em', color: tier.accent }}>{tier.label}</div>
            <div style={{ fontSize:9, color:`${tier.textColor}88`, letterSpacing:'.08em', marginTop:2 }}>MEMBER CARD</div>
          </div>
        </div>

        {/* MIDDLE */}
        <div style={{ display:'flex', alignItems:'center', gap:16, position:'relative' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg, ${tier.accent}33, ${tier.accent}11)`, border:`1.5px solid ${tier.accent}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, color: tier.accent }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:900, letterSpacing:'-.02em', color:'#fff', lineHeight:1.1, marginBottom:4 }}>{member.name}</div>
            <div style={{ fontSize:11, color:`${tier.textColor}99`, display:'flex', alignItems:'center', gap:6 }}>
              <span>🚗</span><span>{member.vehicle}</span>
            </div>
            <div style={{ fontFamily:'monospace', fontSize:11, marginTop:3, color: tier.accent, fontWeight:700 }}>{member.plate}</div>
          </div>
        </div>

        {/* BOTTOM */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', position:'relative' }}>
          <div>
            <div style={{ fontSize:9, color:`${tier.textColor}66`, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:2 }}>Member ID</div>
            <div style={{ fontFamily:'monospace', fontSize:14, fontWeight:800, color:'#fff', letterSpacing:'.1em' }}>{member.memberId ?? 'AUR-0001'}</div>
            <div style={{ fontSize:9, color:`${tier.textColor}66`, marginTop:4 }}>Bergabung {member.joinDate ?? '2026'}</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:9, color:`${tier.textColor}66`, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:2 }}>AURA Points</div>
            <div style={{ fontSize:28, fontWeight:900, color: tier.accent, lineHeight:1 }}>{member.points}</div>
            <div style={{ fontSize:9, color:`${tier.textColor}66`, marginTop:1 }}>pts · {member.totalVisits ?? 0} kunjungan</div>
          </div>
        </div>
      </div>

      {/* QR BLOCK */}
      <div style={{ background:'#141417', border:'1px solid #28282F', borderRadius:16, padding:'20px 24px', display:'flex', gap:20, alignItems:'center' }}>
        <div style={{ background:'#fff', borderRadius:12, padding:8, border:`3px solid ${tier.accent}`, boxShadow:`0 0 20px ${tier.shine}`, flexShrink:0 }}>
          <img src={qrUrl} alt="QR Member" style={{ width:90, height:90, display:'block', borderRadius:6 }} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:800, marginBottom:10, color:'#fff' }}>Scan QR di Meja Welcomer</div>
          {[ { label:'Username', value: member.username ?? member.phone }, { label:'No. HP', value: member.phone }, { label:'Tier', value: member.tier } ].map(r => (
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
              <span style={{ color:'#5C5C70' }}>{r.label}</span>
              <span style={{ fontWeight:700, color:'#A0A0B0', fontFamily: r.label==='Username'?'monospace':'inherit' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* REDEEM REWARDS */}
      <div>
        <div style={{ fontSize:14, fontWeight:800, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          <span>🎁</span> Redeem Reward Points
          <span style={{ marginLeft:'auto', fontSize:11, color:'#F2A900', fontWeight:700 }}>{member.points} pts tersedia</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {REWARDS.map(r => {
            const canRedeem = member.points >= r.pts;
            return (
              <div key={r.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#0D0D0F', border:'1px solid #28282F', borderRadius:12, padding:'12px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:20 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{r.name}</div>
                    <div style={{ fontSize:11, color:'#5C5C70' }}>{r.pts} poin</div>
                  </div>
                </div>
                <button
                  disabled={!canRedeem}
                  className={canRedeem ? 'btn btn-gold' : 'btn btn-ghost'}
                  style={{ fontSize:11, padding:'6px 14px', opacity: canRedeem ? 1 : 0.4, cursor: canRedeem ? 'pointer' : 'not-allowed' }}
                >
                  {canRedeem ? 'Redeem' : `Kurang ${r.pts - member.points} pts`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn btn-ghost" style={{ justifyContent:'center', fontSize:11 }} onClick={() => window.print()}>🖨️ Cetak Kartu Member</button>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// PAGE: DASHBOARD
// ──────────────────────────────────────────────────────────────────────────────
const DashboardPage = ({ member, reservations, onNavigate }) => {
  const [visitFilter, setVisitFilter] = useState('week');

  const myRes = reservations.filter(r => r.phone === member.phone);
  const activeRes = myRes.filter(r => !['completed', 'cancelled'].includes(r.status));
  const completedRes = myRes.filter(r => r.status === 'completed');

  // Mock visit history chart data
  const chartData = {
    week: [
      { label: 'Sen', value: 0 }, { label: 'Sel', value: 1, highlight: true },
      { label: 'Rab', value: 0 }, { label: 'Kam', value: 2 },
      { label: 'Jum', value: 1 }, { label: 'Sab', value: 3, highlight: true },
      { label: 'Min', value: 0 },
    ],
    month: [
      { label: 'M1', value: 2 }, { label: 'M2', value: 4, highlight: true },
      { label: 'M3', value: 1 }, { label: 'M4', value: 3 },
    ],
    year: [
      { label: 'Jan', value: 3 }, { label: 'Feb', value: 2 }, { label: 'Mar', value: 4 },
      { label: 'Apr', value: 1 }, { label: 'Mei', value: 5, highlight: true },
      { label: 'Jun', value: 2 }, { label: 'Jul', value: 3 }, { label: 'Agu', value: 4 },
      { label: 'Sep', value: 6, highlight: true }, { label: 'Okt', value: 1 },
      { label: 'Nov', value: 0 }, { label: 'Des', value: 0 },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* STATS SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { icon: '✅', label: 'Total Kunjungan', value: member.totalVisits ?? myRes.length, color: '#0EC278' },
          { icon: '📅', label: 'Reservasi Aktif', value: activeRes.length, color: '#38BDF8' },
          { icon: '🌟', label: 'AURA Points', value: `${member.points} pts`, color: '#F2A900' },
          { icon: '🏅', label: 'Tier Member', value: member.tier, color: '#A855F7' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 22 }}>{stat.icon}</div>
            <div style={{ fontSize: 11, color: '#5C5C70', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* GRAFIK KUNJUNGAN */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Grafik Kunjungan</div>
            <div style={{ fontSize: 12, color: '#5C5C70', marginTop: 2 }}>Histori pencucian berdasarkan periode</div>
          </div>
          <div style={{ display: 'flex', gap: 6, background: '#0D0D0F', borderRadius: 8, padding: 4 }}>
            {[{ id: 'week', label: 'Minggu' }, { id: 'month', label: 'Bulan' }, { id: 'year', label: 'Tahun' }].map(f => (
              <button key={f.id} onClick={() => setVisitFilter(f.id)} style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: visitFilter === f.id ? '#F2A900' : 'transparent',
                color: visitFilter === f.id ? '#0D0D0F' : '#A0A0B0',
                transition: 'all .15s',
              }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={chartData[visitFilter]} />
      </div>

      {/* RESERVASI TERBARU & ANTREAN AKTIF */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>

        {/* Reservasi Online */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>📅 Reservasi Online</div>
            <button className="btn btn-gold" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => onNavigate('reservasi')}>+ Buat Baru</button>
          </div>
          {myRes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#5C5C70', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>Belum ada reservasi
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myRes.slice(0, 3).map(r => (
                <div key={r.id} style={{ background: '#0D0D0F', border: '1px solid #28282F', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.serviceName}</div>
                    <div style={{ fontSize: 11, color: '#5C5C70', marginTop: 2 }}>{r.reservationDate} · {r.reservationTime} WIB</div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#F2A900', marginTop: 2 }}>{r.bookingCode}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                    background: `${STATUS_COLORS[r.status] || '#5C5C70'}22`,
                    color: STATUS_COLORS[r.status] || '#5C5C70',
                    border: `1px solid ${STATUS_COLORS[r.status] || '#5C5C70'}44`,
                    whiteSpace: 'nowrap',
                  }}>
                    {r.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Antrean Aktif */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>🎫 Antrean Aktif</div>
          {activeRes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#5C5C70', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>Tidak ada antrean aktif saat ini
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeRes.map(r => (
                <div key={r.id} className="card-gold" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{r.serviceName}</div>
                      <div style={{ fontSize: 11, color: '#A0A0B0', marginTop: 2 }}>Kode: <span style={{ fontFamily: 'monospace', color: '#F2A900' }}>{r.bookingCode}</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#5C5C70' }}>No. Antrean</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#F2A900', fontFamily: 'monospace' }}>#{r.queueNumber}</div>
                    </div>
                  </div>
                  <div style={{ background: '#fff', padding: 6, borderRadius: 8, display: 'inline-block', border: '2px solid #F2A900' }}>
                    <img src={r.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=AURA'} alt="QR" style={{ width: 70, height: 70, display: 'block', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// PAGE: RESERVASI ONLINE (BOOKING FORM)
// ──────────────────────────────────────────────────────────────────────────────
const ReservasiPage = ({ member }) => {
  const { createReservation, showToast } = useCarWash();
  const [svcId, setSvcId] = useState('premium_clean');
  const [variantId, setVariantId] = useState('medium');
  const [date, setDate] = useState('2026-10-10');
  const [time, setTime] = useState('20:00');
  const [qrisModal, setQrisModal] = useState(false);
  const [waModal, setWaModal] = useState(false);
  const [ticket, setTicket] = useState(null);

  const service = SERVICES.find(s => s.id === svcId);
  const variant = service.variants.find(v => v.id === variantId);
  const discount = member.tier === 'VIP Platinum' ? 15 : member.tier === 'VIP Gold' ? 10 : 0;
  const discAmt = Math.round(variant.price * discount / 100);
  const totalPay = variant.price - discAmt;

  const handleBook = (e) => { e.preventDefault(); setQrisModal(true); };
  const handlePay = () => {
    setQrisModal(false);
    const r = createReservation({ name: member.name, phone: member.phone, vehicle: member.vehicle, plate: member.plate, serviceId: svcId, serviceName: `${service.name} (${variant.label})`, variantId, variantLabel: variant.label, price: totalPay, date, time, paymentMethod: 'qris' });
    setTicket(r);
    setWaModal(true);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Reservasi Online</h2>
        <p style={{ fontSize: 13, color: '#5C5C70' }}>Pilih paket layanan dan jadwal yang sesuai untuk kendaraan Anda</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div>
          {/* Step 1: Pilih Paket */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F2A900', color: '#0D0D0F', fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#A0A0B0' }}>Pilih Paket Layanan</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            {SERVICES.map(s => {
              const active = svcId === s.id;
              return (
                <div key={s.id} onClick={() => { setSvcId(s.id); setVariantId('medium'); }}
                  style={{ background: active ? 'linear-gradient(135deg,#1a1500,#161300)' : '#141417', border: `1px solid ${active ? s.accentColor : '#28282F'}`, borderRadius: 14, padding: 22, cursor: 'pointer', transition: 'all .18s', boxShadow: active ? `0 0 20px ${s.accentColor}22` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ fontSize: 28 }}>{s.emoji}</div>
                    {active && <div style={{ width: 22, height: 22, borderRadius: '50%', background: s.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#0D0D0F' }}>✓</div>}
                  </div>
                  <div style={{ fontSize: 11, color: s.accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.duration}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 6 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#5C5C70', marginBottom: 14 }}>{s.description}</div>
                  <div style={{ height: 1, background: '#28282F', marginBottom: 14 }} />
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {s.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: f.includes('✦') ? s.accentColor : '#A0A0B0' }}>
                        <span style={{ color: s.accentColor, flexShrink: 0 }}>✦</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Step 2: Ukuran Kendaraan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F2A900', color: '#0D0D0F', fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#A0A0B0' }}>Pilih Ukuran Kendaraan</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {service.variants.map(v => {
              const active = variantId === v.id;
              return (
                <div key={v.id} onClick={() => setVariantId(v.id)}
                  style={{ border: `2px solid ${active ? service.accentColor : '#28282F'}`, borderRadius: 12, padding: '16px 14px', cursor: 'pointer', background: active ? `${service.accentColor}10` : '#141417', transition: 'all .15s', textAlign: 'center', boxShadow: active ? `0 0 16px ${service.accentColor}22` : 'none' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{v.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>{v.label}</div>
                  <div style={{ fontSize: 11, color: '#5C5C70', marginBottom: 10, lineHeight: 1.4 }}>{v.sub}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: active ? service.accentColor : '#fff' }}>{G(v.price)}</div>
                  {discount > 0 && <div style={{ fontSize: 10, color: '#0EC278', marginTop: 4, fontWeight: 700 }}>Hemat {G(Math.round(v.price * discount / 100))}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Form Konfirmasi */}
        <div className="card" style={{ padding: 22, position: 'sticky', top: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #28282F' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F2A900', color: '#0D0D0F', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
            <span style={{ fontSize: 13, fontWeight: 800 }}>Konfirmasi Jadwal & Bayar</span>
          </div>
          <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Tanggal Reservasi</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Slot Waktu</label>
              <select value={time} onChange={e => setTime(e.target.value)} className="input">
                {['09:00', '10:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:00'].map(t => (
                  <option key={t} value={t}>{t} WIB — Slot Tersedia</option>
                ))}
              </select>
            </div>
            <div style={{ background: '#0D0D0F', borderRadius: 10, padding: 14, border: '1px solid #28282F' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A0A0B0', marginBottom: 6 }}>
                <span>{service.name} ({variant.label})</span><span>{G(variant.price)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#0EC278', marginBottom: 6 }}>
                  <span>Diskon Member ({discount}%)</span><span>−{G(discAmt)}</span>
                </div>
              )}
              <div style={{ height: 1, background: '#28282F', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900 }}>
                <span style={{ color: '#A0A0B0', fontSize: 13 }}>Total Bayar</span>
                <span style={{ color: '#F2A900', fontSize: 18 }}>{G(totalPay)}</span>
              </div>
            </div>
            <button type="submit" className="btn btn-gold" style={{ justifyContent: 'center', padding: '12px 0', fontSize: 14 }}>
              📱 Bayar via QRIS →
            </button>
          </form>
        </div>
      </div>

      {/* QRIS Modal */}
      {qrisModal && (
        <div className="modal-overlay" onClick={() => setQrisModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Scan QRIS Pembayaran</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#F2A900', marginBottom: 20 }}>{G(totalPay)}</div>
            <div style={{ background: '#fff', borderRadius: 14, padding: 16, display: 'inline-block', marginBottom: 20, border: '3px solid #F2A900' }}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AURA-PAYMENT-QRIS" alt="QRIS" style={{ width: 150, height: 150, display: 'block', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => setQrisModal(false)}>Batal</button>
              <button className="btn btn-gold" style={{ justifyContent: 'center' }} onClick={handlePay}>✓ Simulasi Bayar</button>
            </div>
          </div>
        </div>
      )}

      {/* WA Modal */}
      {waModal && ticket && (
        <div className="modal-overlay" onClick={() => setWaModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 420, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(14,194,120,.15)', border: '1px solid rgba(14,194,120,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0EC278', fontSize: 16 }}>✓</div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Booking Berhasil!</div>
            </div>
            <div style={{ background: '#0D0D0F', borderRadius: 10, padding: 16, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8, border: '1px solid #28282F', marginBottom: 20 }}>
              <div style={{ color: '#F2A900', fontWeight: 700, marginBottom: 8 }}>📲 [AURA WA Gateway]</div>
              <div>Halo <strong>{ticket.customerName}</strong>, Pembayaran BERHASIL ✅</div>
              <div style={{ height: 1, background: '#28282F', margin: '8px 0' }} />
              <div>🎫 Antrean: <strong>#{ticket.queueNumber}</strong></div>
              <div>🔖 Kode: <strong>{ticket.bookingCode}</strong></div>
              <div>🚘 {ticket.vehicle} ({ticket.plate})</div>
              <div>📦 {ticket.serviceName}</div>
              <div>⏰ {ticket.reservationDate} · {ticket.reservationTime} WIB</div>
            </div>
            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setWaModal(false)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// PAGE: ANTREAN AKTIF
// ──────────────────────────────────────────────────────────────────────────────
const AntreanPage = ({ member, reservations }) => {
  const { triggerLateArrival } = useCarWash();
  const myRes = reservations.filter(r => r.phone === member.phone);
  const activeRes = myRes.filter(r => !['completed', 'cancelled'].includes(r.status));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Antrean Aktif</h2>
        <p style={{ fontSize: 13, color: '#5C5C70' }}>Status realtime kendaraan Anda di jalur pencucian</p>
      </div>
      {activeRes.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Tidak ada antrean aktif</div>
          <div style={{ fontSize: 13, color: '#5C5C70' }}>Buat reservasi baru di menu Reservasi Online</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
          {activeRes.map(r => (
            <div key={r.id} className="card-gold" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <span className="badge badge-gold" style={{ marginBottom: 6, display: 'inline-block' }}>Tiket Antrean</span>
                  <h3 style={{ fontSize: 20, fontWeight: 900 }}>{r.serviceName}</h3>
                  <div style={{ fontSize: 12, color: '#A0A0B0', marginTop: 2 }}>Kode: <strong className="mono" style={{ color: '#F2A900' }}>{r.bookingCode}</strong></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#5C5C70', fontWeight: 700 }}>No. Antrean</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: '#F2A900', lineHeight: 1, fontFamily: 'monospace' }}>#{r.queueNumber}</div>
                </div>
              </div>

              {/* Status Steps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20, background: '#0D0D0F', padding: 16, borderRadius: 12, border: '1px solid #28282F' }}>
                {[
                  { key: 'confirmed', label: 'Menunggu', color: '#F2A900' },
                  { key: 'checked_in', label: 'Proses', color: '#38BDF8' },
                  { key: 'completed', label: 'Selesai', color: '#0EC278' },
                ].map((st, idx) => {
                  const isDone = r.status === st.key || (st.key === 'confirmed' && ['checked_in', 'in_progress', 'completed'].includes(r.status)) || (st.key === 'checked_in' && ['in_progress', 'completed'].includes(r.status));
                  return (
                    <div key={st.key} style={{ textAlign: 'center', opacity: isDone ? 1 : 0.4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: isDone ? st.color : '#28282F', color: isDone ? '#0D0D0F' : '#5C5C70', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: 12, fontWeight: 900 }}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isDone ? st.color : '#A0A0B0' }}>{st.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* QR Code */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#0D0D0F', padding: 18, borderRadius: 14, border: '1px solid rgba(242,169,0,.2)', marginBottom: 20 }}>
                <div style={{ background: '#fff', padding: 8, borderRadius: 10, border: '2px solid #F2A900', flexShrink: 0 }}>
                  <img src={r.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AURA'} alt="QR Code" style={{ width: 90, height: 90, display: 'block' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Tunjukkan QR ke Welcomer</div>
                  <div style={{ fontSize: 12, color: '#A0A0B0' }}>Petugas will scan untuk konfirmasi kedatangan</div>
                  <div style={{ fontSize: 11, color: '#F2A900', marginTop: 8, fontWeight: 700 }}>Slot: {r.reservationTime} WIB</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#5C5C70' }}>CS WA: +6281299887766</span>
                <button className="btn btn-danger" onClick={() => triggerLateArrival(r.id)}>⏰ Trigger Terlambat</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// PAGE: KENDARAAN SAYA
// ──────────────────────────────────────────────────────────────────────────────
const KendaraanPage = ({ member }) => {
  const { showToast } = useCarWash();
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ vehicle: '', plate: '', type: 'Sedan' });

  // In real app these would be per-member. Here we simulate multi-vehicle list
  const [vehicles, setVehicles] = useState([
    { id: 1, vehicle: member.vehicle, plate: member.plate, type: 'SUV', isPrimary: true },
  ]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (editIdx !== null) {
      setVehicles(prev => prev.map((v, i) => i === editIdx ? { ...v, ...form } : v));
      showToast('Data kendaraan diperbarui!', 'success');
      setEditIdx(null);
    } else {
      const newV = { id: Date.now(), ...form, isPrimary: false };
      setVehicles(prev => [...prev, newV]);
      showToast('Kendaraan baru berhasil ditambahkan!', 'success');
    }
    setForm({ vehicle: '', plate: '', type: 'Sedan' });
    setShowForm(false);
  };

  const handleEdit = (v, idx) => {
    setForm({ vehicle: v.vehicle, plate: v.plate, type: v.type });
    setEditIdx(idx);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    showToast('Kendaraan dihapus dari daftar', 'warning');
  };

  const VEHICLE_TYPES = ['City Car', 'Hatchback', 'Sedan', 'SUV', 'MPV', 'Pickup', 'Minivan', 'Truck'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Kendaraan Saya</h2>
          <p style={{ fontSize: 13, color: '#5C5C70' }}>Kelola daftar kendaraan yang terdaftar di akun Anda</p>
        </div>
        <button className="btn btn-gold" style={{ fontSize: 13 }} onClick={() => { setShowForm(true); setEditIdx(null); setForm({ vehicle: '', plate: '', type: 'Sedan' }); }}>
          + Tambah Kendaraan
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card-gold" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>
            {editIdx !== null ? '✏️ Edit Kendaraan' : '➕ Tambah Kendaraan Baru'}
          </div>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="label">Nama Kendaraan *</label>
              <input className="input" placeholder="cth. Honda CR-V" value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} required />
            </div>
            <div>
              <label className="label">Plat Nomor *</label>
              <input className="input mono" placeholder="B 1234 XYZ" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })} required />
            </div>
            <div>
              <label className="label">Jenis / Tipe</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-gold" style={{ fontSize: 13 }}>
                {editIdx !== null ? 'Simpan' : '+ Tambah'}
              </button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicle List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {vehicles.map((v, idx) => (
          <div key={v.id} className="card" style={{ padding: 24, position: 'relative', border: v.isPrimary ? '1px solid rgba(242,169,0,.3)' : '1px solid #28282F' }}>
            {v.isPrimary && <div style={{ position: 'absolute', top: 14, right: 14 }}><span className="badge badge-gold" style={{ fontSize: 10 }}>🚗 Kendaraan Utama</span></div>}
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚗</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{v.vehicle}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ padding: '3px 10px', background: '#1A1A1F', borderRadius: 6, fontFamily: 'monospace', fontSize: 14, color: '#F2A900', border: '1px solid #28282F', fontWeight: 800 }}>{v.plate}</span>
              <span style={{ fontSize: 12, color: '#5C5C70' }}>{v.type}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ fontSize: 12, flex: 1, justifyContent: 'center' }} onClick={() => handleEdit(v, idx)}>✏️ Edit</button>
              {!v.isPrimary && <button className="btn btn-ghost" style={{ fontSize: 12, color: '#F04F4F', border: '1px solid rgba(240,79,79,.25)', flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(v.id)}>🗑️ Hapus</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// PAGE: PROFIL
// ──────────────────────────────────────────────────────────────────────────────
const ProfilPage = ({ member }) => {
  const { showToast } = useCarWash();
  const [form, setForm] = useState({ name: member.name, phone: member.phone, username: member.username || '', password: '', passwordConfirm: '' });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.passwordConfirm) {
      showToast('Password konfirmasi tidak cocok!', 'error');
      return;
    }
    setSaved(true);
    showToast('Profil berhasil diperbarui!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Profil Saya</h2>
        <p style={{ fontSize: 13, color: '#5C5C70' }}>Perbarui informasi akun dan keamanan Anda</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24, alignItems: 'start' }}>
        {/* Info Form */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👤</span> Informasi Akun
          </div>

          {/* Avatar circle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a1500, #2a2100)',
              border: '3px solid #F2A900',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, color: '#F2A900',
              boxShadow: '0 0 20px rgba(242,169,0,.2)',
              marginBottom: 10,
            }}>
              {member.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <span className="badge badge-gold" style={{ fontSize: 11 }}>✦ {member.tier}</span>
            <div style={{ fontSize: 12, color: '#5C5C70', marginTop: 4 }}>Member ID: <span className="mono" style={{ color: '#F2A900' }}>{member.memberId}</span></div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Nama Lengkap *</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">No. WhatsApp / HP *</label>
              <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="label">Username</label>
              <input className="input mono" value={form.username} onChange={e => setForm({ ...form, username: e.target.value.toLowerCase() })} />
            </div>

            <div style={{ height: 1, background: '#28282F' }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#A0A0B0' }}>🔒 Ganti Password (opsional)</div>

            <div>
              <label className="label">Password Baru</label>
              <input type="password" className="input mono" placeholder="••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="label">Konfirmasi Password Baru</label>
              <input type="password" className="input mono" placeholder="••••••" value={form.passwordConfirm} onChange={e => setForm({ ...form, passwordConfirm: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-gold" style={{ justifyContent: 'center', padding: '12px 0', fontSize: 14, marginTop: 4 }}>
              {saved ? '✓ Profil Tersimpan!' : '💾 Simpan Perubahan'}
            </button>
          </form>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card-gold" style={{ padding: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📊 Statistik Akun</div>
            {[
              { label: 'Total Kunjungan', value: `${member.totalVisits ?? 0}x` },
              { label: 'AURA Points', value: `${member.points} pts` },
              { label: 'Member Tier', value: member.tier },
              { label: 'Bergabung Sejak', value: member.joinDate ?? '2026' },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                <span style={{ color: '#5C5C70' }}>{stat.label}</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🔐 Keamanan Akun</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#A0A0B0' }}>Status Akun</span>
                <span style={{ color: '#0EC278', fontWeight: 700 }}>● Aktif & Terverifikasi</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#A0A0B0' }}>Login Terakhir</span>
                <span style={{ color: '#A0A0B0' }}>Hari ini</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// PAGE: STORE & MERCHANDISE
// ──────────────────────────────────────────────────────────────────────────────
const StorePage = () => {
  const { inventory, checkoutMarketplace, showToast } = useCarWash();
  const [cart, setCart] = useState([]);

  const products = inventory.filter(i => i.category !== 'operasional');

  const addToCart = (p) => {
    setCart(c => {
      const ex = c.find(x => x.id === p.id);
      return ex ? c.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...p, qty: 1 }];
    });
    showToast(`${p.name} ditambahkan ke keranjang`, 'info');
  };

  const updateCartQty = (id, delta) => {
    setCart(c => c.map(x => {
      if (x.id === id) { const newQty = x.qty + delta; return newQty > 0 ? { ...x, qty: newQty } : null; }
      return x;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(c => c.filter(x => x.id !== id));
    showToast('Barang dihapus dari keranjang', 'warning');
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Store & Merchandise</h2>
        <p style={{ fontSize: 13, color: '#5C5C70' }}>Produk perawatan mobil premium & apparel resmi AURA</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
          {products.map(p => (
            <div key={p.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: 10, marginBottom: 8, display: 'inline-block' }}>{p.category}</span>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#5C5C70', marginBottom: 10 }}>SKU: {p.sku}</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#F2A900', marginBottom: 4 }}>{G(p.price)}</div>
                <div style={{ fontSize: 11, color: '#5C5C70', marginBottom: 14 }}>Stok: <strong style={{ color: '#A0A0B0' }}>{p.stock} {p.unit}</strong></div>
                <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', fontSize: 12.5 }} onClick={() => addToCart(p)}>
                  + Tambah ke Keranjang
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Panel */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #28282F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🛒 Keranjang</span>
            {cart.length > 0 && <span className="badge badge-gold">{cart.reduce((s, i) => s + i.qty, 0)} Item</span>}
          </div>

          {cart.length > 0 ? (
            <>
              <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {cart.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#0D0D0F', borderRadius: 10, border: '1px solid #28282F' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#F2A900', fontWeight: 800 }}>{G(c.price * c.qty)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateCartQty(c.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, background: '#28282F', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{c.qty}</span>
                      <button onClick={() => updateCartQty(c.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, background: '#28282F', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(c.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4 }}>🗑️</button>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: '#28282F', marginBottom: 14 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, marginBottom: 16 }}>
                <span style={{ color: '#A0A0B0', fontSize: 13 }}>Total Tagihan</span>
                <span style={{ color: '#F2A900', fontSize: 18 }}>{G(cartTotal)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 13.5 }} onClick={() => { checkoutMarketplace(cart, cartTotal); setCart([]); }}>
                  🛒 Checkout ({G(cartTotal)})
                </button>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 11, color: '#F04F4F' }} onClick={() => setCart([])}>
                  Kosongkan Keranjang
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#5C5C70', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
              Keranjang Anda kosong.<br />Pilih produk di panel kiri.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN CUSTOMER PORTAL WITH SIDEBAR
// ──────────────────────────────────────────────────────────────────────────────
export const CustomerPortal = () => {
  const { members, reservations, authUsers, logoutUser } = useCarWash();

  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [dashboardOpen, setDashboardOpen] = useState(true);

  // If customer is not logged in, show Landing Page first!
  const member = authUsers.pelanggan || members[0];
  const isLoggedIn = !!authUsers.pelanggan;

  if (!isLoggedIn) return <LandingPage />;

  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES['Silver'];
  const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':  return <DashboardPage member={member} reservations={reservations} onNavigate={setActivePage} />;
      case 'reservasi':  return <ReservasiPage member={member} />;
      case 'antrean':    return <AntreanPage member={member} reservations={reservations} />;
      case 'kendaraan':  return <KendaraanPage member={member} />;
      case 'store':      return <StorePage />;
      case 'profil':     return <ProfilPage member={member} />;
      case 'membercard': return (
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Member Card</h2>
            <p style={{ fontSize: 13, color: '#5C5C70' }}>Tunjukkan kartu ini ke petugas untuk scan QR</p>
          </div>
          <MemberCardFull member={member} />
        </div>
      );
      default: return null;
    }
  };

  const SIDEBAR_W = sidebarExpanded ? 240 : 64;

  const navItem = (id, label, icon, badge = null) => {
    const active = activePage === id;
    return (
      <button
        key={id}
        onClick={() => setActivePage(id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          width: '100%', padding: sidebarExpanded ? '10px 14px' : '10px',
          borderRadius: 10, border: 'none', cursor: 'pointer',
          background: active ? 'rgba(242,169,0,.12)' : 'transparent',
          color: active ? '#F2A900' : '#A0A0B0',
          fontSize: 13, fontWeight: active ? 700 : 500,
          transition: 'all .15s',
          justifyContent: sidebarExpanded ? 'flex-start' : 'center',
          borderLeft: active ? '3px solid #F2A900' : '3px solid transparent',
          position: 'relative',
        }}
        title={!sidebarExpanded ? label : undefined}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
        {sidebarExpanded && <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>}
        {sidebarExpanded && badge && (
          <span style={{ background: badge.bg, color: badge.color, borderRadius: 10, fontSize: 10, fontWeight: 800, padding: '2px 7px' }}>{badge.label}</span>
        )}
        {!sidebarExpanded && active && (
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, background: '#F2A900', borderRadius: '3px 0 0 3px' }} />
        )}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', background: '#0D0D0F' }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: SIDEBAR_W, minHeight: '100%',
        background: '#141417',
        borderRight: '1px solid #28282F',
        display: 'flex', flexDirection: 'column',
        transition: 'width .2s ease',
        flexShrink: 0, overflow: 'hidden',
        position: 'sticky', top: 60, height: 'calc(100vh - 60px)',
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '16px 12px', borderBottom: '1px solid #28282F', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarExpanded && (
            <div style={{ fontSize: 11, fontWeight: 800, color: '#5C5C70', textTransform: 'uppercase', letterSpacing: '.06em' }}>Main Menu</div>
          )}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5C5C70', fontSize: 16, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: sidebarExpanded ? 'auto' : 'auto' }}
          >
            {sidebarExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* NAV SECTION: Main */}
        <div style={{ padding: '12px 8px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Dashboard + sub-items */}
          <button
            onClick={() => { setActivePage('dashboard'); setDashboardOpen(!dashboardOpen); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: sidebarExpanded ? '10px 14px' : '10px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activePage === 'dashboard' ? 'rgba(242,169,0,.12)' : 'transparent',
              color: activePage === 'dashboard' ? '#F2A900' : '#A0A0B0',
              fontSize: 13, fontWeight: activePage === 'dashboard' ? 700 : 500,
              transition: 'all .15s',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              borderLeft: activePage === 'dashboard' ? '3px solid #F2A900' : '3px solid transparent',
            }}
          >
            <span style={{ fontSize: 18 }}>⊞</span>
            {sidebarExpanded && <><span style={{ flex: 1, textAlign: 'left' }}>Dashboard</span><span style={{ fontSize: 12, color: '#5C5C70' }}>{dashboardOpen ? '∧' : '∨'}</span></>}
          </button>

          {sidebarExpanded && dashboardOpen && (
            <div style={{ marginLeft: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => setActivePage('reservasi')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: activePage === 'reservasi' ? 'rgba(242,169,0,.08)' : 'transparent', color: activePage === 'reservasi' ? '#F2A900' : '#A0A0B0', fontSize: 12, fontWeight: activePage === 'reservasi' ? 700 : 500, textAlign: 'left' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: activePage === 'reservasi' ? '#F2A900' : '#28282F' }} />
                Reservasi Online
              </button>
              <button onClick={() => setActivePage('antrean')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: activePage === 'antrean' ? 'rgba(242,169,0,.08)' : 'transparent', color: activePage === 'antrean' ? '#F2A900' : '#A0A0B0', fontSize: 12, fontWeight: activePage === 'antrean' ? 700 : 500, textAlign: 'left' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: activePage === 'antrean' ? '#F2A900' : '#28282F' }} />
                Antrean Aktif
              </button>
            </div>
          )}

          {navItem('kendaraan', 'Kendaraan Saya', '🚗')}
          {navItem('store', 'Store & Merchandise', '🛒')}

          {/* Separator + Preferences */}
          <div style={{ height: 1, background: '#28282F', margin: '12px 4px' }} />
          {sidebarExpanded && <div style={{ fontSize: 11, fontWeight: 800, color: '#5C5C70', textTransform: 'uppercase', letterSpacing: '.06em', padding: '4px 14px' }}>Preferences</div>}

          {navItem('profil', 'Profil Saya', '👤')}
          {navItem('membercard', 'Member Card', '🪪', { label: member.tier, bg: 'rgba(242,169,0,.15)', color: '#F2A900' })}
        </div>

        {/* SIDEBAR BOTTOM — Profile + Logout */}
        <div style={{ borderTop: '1px solid #28282F', padding: '14px 12px' }}>
          {sidebarExpanded ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* User identity block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: tier.bg, border: `2px solid ${tier.accent}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 900, color: tier.accent,
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</div>
                  <div style={{ fontSize: 11, color: '#5C5C70' }}>{member.tier}</div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => logoutUser('pelanggan')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 12px', borderRadius: 10,
                  border: '1px solid rgba(240,79,79,.2)', cursor: 'pointer',
                  background: 'transparent', color: '#F04F4F', fontSize: 13, fontWeight: 700,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,79,79,.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 16 }}>⏻</span>
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: tier.bg, border: `2px solid ${tier.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: tier.accent, cursor: 'pointer' }} onClick={() => setActivePage('profil')}>
                {initials}
              </div>
              <button onClick={() => logoutUser('pelanggan')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F04F4F', fontSize: 18, padding: 4 }} title="Log Out">⏻</button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', minWidth: 0 }}>
        {renderPage()}
      </main>
    </div>
  );
};
