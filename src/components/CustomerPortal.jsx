import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';
import { LandingPage } from './LandingPage';

// ── Service catalogue ─────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'fast_clean', name: 'Fast Clean Express', emoji: '⚡', accentColor: '#38BDF8',
    duration: '15–20 menit', description: 'Drive-through express bay tanpa turun dari mobil', hasDocs: false,
    features: [
      'Touchless foam wash & rinse',
      'Deep gloss tire dressing',
      'Air freshener spray & cuci cepat',
      '🔒 Video Before & After (Khusus Premium)',
    ],
    variants: [
      { id: 'small', label: 'Small', sub: 'City car / Hatchback', price: 65000, icon: '🚗' },
      { id: 'medium', label: 'Medium', sub: 'Sedan / SUV standard', price: 85000, icon: '🚙' },
      { id: 'big', label: 'Big', sub: 'SUV besar / MPV / Minivan', price: 105000, icon: '🚐' },
    ],
  },
  {
    id: 'premium_clean', name: 'Premium Clean & Detailing', emoji: '✦', accentColor: '#F2A900',
    duration: '45–60 menit', description: 'Pengalaman detailing eksklusif di Lounge VIP', hasDocs: true,
    features: [
      'Akses Lounge VIP + Signature Drink',
      'Interior vacuum & ozone sanitasi',
      'Ceramic hydrophobic wax coating',
      '✦ Video Dokumentasi Before & After [INCLUDED]',
    ],
    variants: [
      { id: 'small', label: 'Small', sub: 'City car / Hatchback', price: 200000, icon: '🚗' },
      { id: 'medium', label: 'Medium', sub: 'Sedan / SUV standard', price: 275000, icon: '🚙' },
      { id: 'big', label: 'Big', sub: 'SUV besar / MPV / Minivan', price: 350000, icon: '🚐' },
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
  'VIP Gold': { bg: 'linear-gradient(135deg, #1a1200 0%, #2a2000 40%, #1a1200 100%)', accent: '#F2A900', shine: 'rgba(242,169,0,.4)', label: '✦ VIP GOLD', textColor: '#FEF3C7' },
  'Silver': { bg: 'linear-gradient(135deg, #111318 0%, #1d2029 40%, #111318 100%)', accent: '#94A3B8', shine: 'rgba(148,163,184,.3)', label: '◈ SILVER', textColor: '#CBD5E1' },
};

// ──────────────────────────────────────────────────────────────────────────────
// SIDEBAR NAV CONFIG
// ──────────────────────────────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', group: 'main' },
  { id: 'reservasi', label: 'Reservasi Online', icon: '📅', group: 'main', parent: 'dashboard' },
  { id: 'antrean', label: 'Antrean Aktif', icon: '🎫', group: 'main', parent: 'dashboard' },
  { id: 'kendaraan', label: 'Kendaraan Saya', icon: '🚗', group: 'main' },
  { id: 'store', label: 'Store & Merch', icon: '🛒', group: 'main' },
  { id: 'profil', label: 'Profil Saya', icon: '👤', group: 'pref' },
  { id: 'notifikasi', label: 'Notifikasi', icon: '🔔', group: 'pref' },
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
    { icon: '☕', name: 'Free Signature Coffee', pts: 50 },
    { icon: '🎁', name: 'Diskon 15% Fast Clean', pts: 100 },
    { icon: '✦', name: 'Free Premium Detailing', pts: 350 },
    { icon: '👑', name: 'Upgrade ke VIP Gold', pts: 500 },
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
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${tier.accent}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${tier.accent}11 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* TOP */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${tier.accent}, ${tier.accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#0D0D0F' }}>A</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: '.12em', color: '#fff' }}>AURA</div>
              <div style={{ fontSize: 9, letterSpacing: '.2em', color: `${tier.accent}cc`, textTransform: 'uppercase' }}>AUTO CARE</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: tier.accent }}>{tier.label}</div>
            <div style={{ fontSize: 9, color: `${tier.textColor}88`, letterSpacing: '.08em', marginTop: 2 }}>MEMBER CARD</div>
          </div>
        </div>

        {/* MIDDLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${tier.accent}33, ${tier.accent}11)`, border: `1.5px solid ${tier.accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: tier.accent }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-.02em', color: '#fff', lineHeight: 1.1, marginBottom: 4 }}>{member.name}</div>
            <div style={{ fontSize: 11, color: `${tier.textColor}99`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🚗</span><span>{member.vehicle}</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, marginTop: 3, color: tier.accent, fontWeight: 700 }}>{member.plate}</div>
          </div>
        </div>

        {/* BOTTOM */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
          <div>
            <div style={{ fontSize: 9, color: `${tier.textColor}66`, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 2 }}>Member ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '.1em' }}>{member.memberId ?? 'AUR-0001'}</div>
            <div style={{ fontSize: 9, color: `${tier.textColor}66`, marginTop: 4 }}>Bergabung {member.joinDate ?? '2026'}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: `${tier.textColor}66`, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 2 }}>AURA Points</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: tier.accent, lineHeight: 1 }}>{member.points}</div>
            <div style={{ fontSize: 9, color: `${tier.textColor}66`, marginTop: 1 }}>pts · {member.totalVisits ?? 0} kunjungan</div>
          </div>
        </div>
      </div>

      {/* QR BLOCK */}
      <div style={{ background: '#141417', border: '1px solid #28282F', borderRadius: 16, padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 8, border: `3px solid ${tier.accent}`, boxShadow: `0 0 20px ${tier.shine}`, flexShrink: 0 }}>
          <img src={qrUrl} alt="QR Member" style={{ width: 90, height: 90, display: 'block', borderRadius: 6 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 10, color: '#fff' }}>Scan QR di Meja Welcomer</div>
          {[{ label: 'Username', value: member.username ?? member.phone }, { label: 'No. HP', value: member.phone }, { label: 'Tier', value: member.tier }].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
              <span style={{ color: '#5C5C70' }}>{r.label}</span>
              <span style={{ fontWeight: 700, color: '#A0A0B0', fontFamily: r.label === 'Username' ? 'monospace' : 'inherit' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* REDEEM REWARDS */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🎁</span> Redeem Reward Points
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#F2A900', fontWeight: 700 }}>{member.points} pts tersedia</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REWARDS.map(r => {
            const canRedeem = member.points >= r.pts;
            return (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0D0D0F', border: '1px solid #28282F', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#5C5C70' }}>{r.pts} poin</div>
                  </div>
                </div>
                <button
                  disabled={!canRedeem}
                  className={canRedeem ? 'btn btn-gold' : 'btn btn-ghost'}
                  style={{ fontSize: 11, padding: '6px 14px', opacity: canRedeem ? 1 : 0.4, cursor: canRedeem ? 'pointer' : 'not-allowed' }}
                >
                  {canRedeem ? 'Redeem' : `Kurang ${r.pts - member.points} pts`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn btn-ghost" style={{ justifyContent: 'center', fontSize: 11 }} onClick={() => window.print()}>🖨️ Cetak Kartu Member</button>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// DATA CABANG
// ──────────────────────────────────────────────────────────────────────────────
const CABANG_LIST = [
  { id: 1, name: 'Pusat',   status: 'open',   queue: 3 },
  { id: 2, name: 'Utara',   status: 'closed',  queue: 0 },
  { id: 3, name: 'Selatan', status: 'closed',  queue: 0 },
  { id: 4, name: 'Timur',   status: 'open',   queue: 5 },
  { id: 5, name: 'Barat',   status: 'closed',  queue: 0 },
];

// ──────────────────────────────────────────────────────────────────────────────
// PAGE: DASHBOARD (Layout referensi, tema dark tetap)
// ──────────────────────────────────────────────────────────────────────────────
const DashboardPage = ({ member, reservations, onNavigate }) => {
  const [visitFilter, setVisitFilter] = useState('week');
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const myRes = reservations.filter(r => r.phone === member.phone);
  const activeRes = myRes.filter(r => !['completed', 'cancelled'].includes(r.status));
  const completedRes = myRes.filter(r => r.status === 'completed');
  const todayWashed = 105;

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── WELCOME HEADER ── */}
      <div>
        <div style={{ fontSize: 13, color: '#5C5C70', marginBottom: 4, fontWeight: 500 }}>Welcome back,</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
            {member.name.split(' ')[0]}
          </h1>
          <span style={{ fontSize: 28 }}>👋</span>
        </div>
      </div>

      {/* ── ONE-TAP WASH BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #2D1060 0%, #4A1C96 30%, #6D28D9 55%, #92400E 80%, #B45309 100%)',
        borderRadius: 18,
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(109,40,217,.3)',
        border: '1px solid rgba(255,255,255,.08)',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.03)', pointerEvents: 'none' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 8 }}>ONE-TAP WASH</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Pilih cabang dan bayar<br />di muka sekarang.
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>
            Reservasi online tersedia 24/7 — konfirmasi instan.
          </div>
        </div>
        <button
          onClick={() => onNavigate('reservasi')}
          style={{
            background: 'rgba(255,255,255,.12)',
            color: '#fff',
            border: '1.5px solid rgba(255,255,255,.25)',
            borderRadius: 12,
            padding: '13px 22px',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
            backdropFilter: 'blur(8px)',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; }}
        >
          Bayar & Antre →
        </button>
      </div>

      {/* ── QUEUE RIGHT NOW ── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0EC278', display: 'inline-block', boxShadow: '0 0 0 3px rgba(14,194,120,.2)' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0EC278', textTransform: 'uppercase', letterSpacing: '.08em' }}>LIVE</span>
              <span style={{ fontSize: 11, color: '#5C5C70', marginLeft: 2 }}>· {timeStr}</span>
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Antrean Saat Ini</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: '#1A1A1F', color: '#A0A0B0', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, border: '1px solid #28282F' }}>
              Hari ini · {todayWashed} dicuci
            </span>
            <button onClick={() => onNavigate('antrean')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#F2A900' }}>
              Lihat semua →
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {CABANG_LIST.map(cabang => (
            <div key={cabang.id} style={{
              background: cabang.status === 'open' ? 'linear-gradient(135deg, rgba(14,194,120,.08), rgba(14,194,120,.04))' : '#1A1A1F',
              border: cabang.status === 'open' ? '1px solid rgba(14,194,120,.25)' : '1px solid #28282F',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: cabang.status === 'open' ? '#0EC278' : '#28282F',
                  display: 'inline-block', flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#5C5C70', textTransform: 'uppercase', letterSpacing: '.04em' }}>{cabang.name}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: cabang.status === 'open' ? '#0EC278' : '#5C5C70' }}>
                {cabang.status === 'open' ? `${cabang.queue} antri` : 'Tutup'}
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* ── GRAFIK KUNJUNGAN ── */}
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

      {/* ── ANTREAN AKTIF (Professional Full-Width Layout) ── */}
      <div className="card" style={{ padding: 24, border: activeRes.length > 0 ? '1px solid rgba(242,169,0,.3)' : '1px solid #28282F' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(242,169,0,.12)', border: '1px solid rgba(242,169,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              🎫
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                Antrean Aktif Saya
                {activeRes.length > 0 && <span className="badge badge-gold" style={{ fontSize: 10 }}>{activeRes.length} Aktif</span>}
              </div>
              <div style={{ fontSize: 12, color: '#5C5C70', marginTop: 1 }}>Pantau status pengerjaan cuci mobil secara real-time</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-gold" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => onNavigate('reservasi')}>
              + Buat Reservasi
            </button>
            {activeRes.length > 0 && (
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => onNavigate('antrean')}>
                Lihat Detail Antrean →
              </button>
            )}
          </div>
        </div>

        {activeRes.length === 0 ? (
          <div style={{ background: '#0D0D0F', borderRadius: 14, border: '1px solid #28282F', padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.8 }}>🚘</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#A0A0B0', marginBottom: 4 }}>Tidak Ada Antrean Aktif Saat Ini</div>
            <div style={{ fontSize: 12, color: '#5C5C70', maxWidth: 420, margin: '0 auto 16px', lineHeight: 1.5 }}>
              Anda belum memiliki reservasi atau antrean yang sedang berjalan. Klik tombol di bawah untuk membuat reservasi online.
            </div>
            <button className="btn btn-gold" style={{ fontSize: 12, padding: '8px 18px', display: 'inline-flex' }} onClick={() => onNavigate('reservasi')}>
              📅 Reservasi Online Sekarang
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeRes.map(r => (
              <div key={r.id} style={{
                background: 'linear-gradient(135deg, #18181C 0%, #111114 100%)',
                border: '1px solid rgba(242,169,0,.25)',
                borderRadius: 14,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                flexWrap: 'wrap',
                gap: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,.4)',
              }}>
                {/* Left: Queue number badge & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 280 }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #F2A900, #C98B00)',
                    color: '#0D0D0F',
                    borderRadius: 12,
                    padding: '12px 18px',
                    textAlign: 'center',
                    boxShadow: '0 4px 14px rgba(242,169,0,.3)',
                    flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em', opacity: 0.85 }}>ANTREAN</div>
                    <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>#{r.queueNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{r.serviceName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#F2A900', fontFamily: 'monospace', fontWeight: 800, background: 'rgba(242,169,0,.1)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(242,169,0,.2)' }}>{r.bookingCode}</span>
                      <span style={{ fontSize: 12, color: '#5C5C70' }}>•</span>
                      <span style={{ fontSize: 12, color: '#A0A0B0', fontWeight: 600 }}>🚗 {r.vehicle} ({r.plate})</span>
                      <span style={{ fontSize: 12, color: '#5C5C70' }}>•</span>
                      <span style={{ fontSize: 12, color: '#A0A0B0' }}>⏰ {r.reservationTime} WIB</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status pill & QR CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: `${STATUS_COLORS[r.status] || '#F2A900'}18`,
                      color: STATUS_COLORS[r.status] || '#F2A900',
                      border: `1px solid ${STATUS_COLORS[r.status] || '#F2A900'}44`,
                      padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[r.status] || '#F2A900' }} />
                      {r.status.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, color: '#5C5C70', marginTop: 4 }}>
                      Scan QR di Welcomer
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('antrean')}
                    title="Klik untuk membuka tiket QR"
                    style={{
                      background: '#141417',
                      border: '1.5px solid rgba(242,169,0,.3)',
                      borderRadius: 10,
                      padding: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#F2A900'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(242,169,0,.3)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <img src={r.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=AURA'} alt="QR Code" style={{ width: 42, height: 42, borderRadius: 6, background: '#fff', display: 'block' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
  const [activeVideoTab, setActiveVideoTabState] = useState({});
  
  const setVideoTab = (targetKey) => {
    const [resId, tabName] = targetKey.split('_');
    setActiveVideoTabState(prev => ({ ...prev, [resId]: tabName }));
  };

  const myRes = reservations.filter(r => r.phone === member.phone);
  const activeRes = myRes.filter(r => !['completed', 'cancelled'].includes(r.status));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>Antrean Aktif</h2>
          <p style={{ fontSize: 13, color: '#5C5C70', margin: 0 }}>Status real-time kendaraan Anda di jalur pencucian</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#141417', border: '1px solid #28282F', padding: '8px 16px', borderRadius: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0EC278', boxShadow: '0 0 0 3px rgba(14,194,120,.25)' }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Sistem Antrean Online Live</span>
        </div>
      </div>

      {activeRes.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Tidak ada antrean aktif</div>
          <div style={{ fontSize: 13, color: '#5C5C70', marginBottom: 20 }}>
            Kendaraan Anda sedang tidak dalam antrean pencucian saat ini.
          </div>
          <button className="btn btn-gold" style={{ padding: '10px 20px', fontSize: 13 }} onClick={() => window.location.hash = '#reservasi'}>
            + Buat Reservasi Online
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {activeRes.map(r => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24, alignItems: 'start' }}>

              {/* LEFT COLUMN: Main Ticket & Timeline */}
              <div className="card-gold" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <span className="badge badge-gold" style={{ fontSize: 10, marginBottom: 8, display: 'inline-block' }}>✦ TIKET ANTREAN AKTIF</span>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>{r.serviceName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#F2A900', fontFamily: 'monospace', fontWeight: 800, background: 'rgba(242,169,0,.15)', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(242,169,0,.3)' }}>
                        {r.bookingCode}
                      </span>
                      <span style={{ fontSize: 12, color: '#5C5C70' }}>•</span>
                      <span style={{ fontSize: 12, color: '#A0A0B0', fontWeight: 600 }}>🚗 {r.vehicle} ({r.plate})</span>
                    </div>
                  </div>

                  {/* Big Queue Number */}
                  <div style={{
                    background: 'linear-gradient(135deg, #F2A900, #C98B00)',
                    color: '#0D0D0F',
                    borderRadius: 16,
                    padding: '14px 24px',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(242,169,0,.35)',
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.12em', opacity: 0.85 }}>NO. ANTREAN</div>
                    <div style={{ fontSize: 44, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, marginTop: 2 }}>#{r.queueNumber}</div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#A0A0B0', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
                    Tahapan Pengerjaan Cuci
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { key: 'confirmed', label: '1. Menunggu Bay', sub: 'Persiapan & antrean', color: '#F2A900' },
                      { key: 'checked_in', label: '2. Proses Cuci', sub: 'Pencucian & Detailing', color: '#38BDF8' },
                      { key: 'completed', label: '3. Selesai', sub: 'Siap diambil', color: '#0EC278' },
                    ].map((st, idx) => {
                      const isDone = r.status === st.key || (st.key === 'confirmed' && ['checked_in', 'in_progress', 'completed'].includes(r.status)) || (st.key === 'checked_in' && ['in_progress', 'completed'].includes(r.status));
                      return (
                        <div key={st.key} style={{
                          background: isDone ? `${st.color}12` : '#0D0D0F',
                          border: `1px solid ${isDone ? st.color + '44' : '#28282F'}`,
                          borderRadius: 12,
                          padding: 14,
                          textAlign: 'center',
                          opacity: isDone ? 1 : 0.45,
                          transition: 'all .2s',
                        }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: isDone ? st.color : '#28282F',
                            color: isDone ? '#0D0D0F' : '#5C5C70',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 8px', fontSize: 13, fontWeight: 900,
                          }}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: isDone ? '#fff' : '#A0A0B0', marginBottom: 2 }}>{st.label}</div>
                          <div style={{ fontSize: 10, color: '#5C5C70' }}>{st.sub}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Info Box */}
                <div style={{ background: '#0D0D0F', border: '1px solid #28282F', borderRadius: 12, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase', fontWeight: 700 }}>Waktu Jadwal</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 3 }}>{r.reservationDate}</div>
                    <div style={{ fontSize: 11, color: '#F2A900', fontWeight: 700 }}>{r.reservationTime} WIB</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase', fontWeight: 700 }}>Status Pembayaran</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0EC278', marginTop: 3 }}>● LUNAS (QRIS)</div>
                    <div style={{ fontSize: 11, color: '#5C5C70' }}>Pembayaran terverifikasi</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase', fontWeight: 700 }}>Estimasi Pengerjaan</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 3 }}>15 - 25 Menit</div>
                    <div style={{ fontSize: 11, color: '#5C5C70' }}>Tergantung antrean bay</div>
                  </div>
                </div>

                {/* ── VIDEO DOKUMENTASI BEFORE & AFTER (PREMIUM VS FAST CLEAN) ── */}
                {(() => {
                  const isPremium = r.serviceId === 'premium_clean' || r.serviceName?.toLowerCase().includes('premium');
                  return isPremium ? (
                    <div style={{ background: '#0D0D0F', border: '1px solid rgba(242,169,0,.3)', borderRadius: 14, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(242,169,0,.18)', border: '1px solid rgba(242,169,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                            🎥
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                              Dokumentasi Video Before & After
                              <span className="badge badge-gold" style={{ fontSize: 9 }}>✦ PREMIUM FEATURE</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#5C5C70' }}>Live stream pengerjaan detailing VIP Lounge</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setVideoTab(r.id + '_before')}
                            style={{
                              padding: '6px 12px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                              borderColor: (activeVideoTab[r.id] || 'before') === 'before' ? '#F2A900' : '#28282F',
                              background: (activeVideoTab[r.id] || 'before') === 'before' ? 'rgba(242,169,0,.18)' : '#141417',
                              color: (activeVideoTab[r.id] || 'before') === 'before' ? '#F2A900' : '#A0A0B0',
                            }}
                          >
                            📹 Sebelum (Before)
                          </button>
                          <button
                            onClick={() => setVideoTab(r.id + '_after')}
                            style={{
                              padding: '6px 12px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                              borderColor: activeVideoTab[r.id] === 'after' ? '#0EC278' : '#28282F',
                              background: activeVideoTab[r.id] === 'after' ? 'rgba(14,194,120,.18)' : '#141417',
                              color: activeVideoTab[r.id] === 'after' ? '#0EC278' : '#A0A0B0',
                            }}
                          >
                            ✨ Sesudah (After)
                          </button>
                        </div>
                      </div>

                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #28282F', background: '#000' }}>
                        <video
                          controls
                          key={activeVideoTab[r.id] === 'after' ? 'after' : 'before'}
                          src={activeVideoTab[r.id] === 'after' ? (r.videoAfterUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4') : (r.videoBeforeUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')}
                          style={{ width: '100%', maxHeight: 280, display: 'block', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#0D0D0F', border: '1px solid #28282F', borderRadius: 14, padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid #28282F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          🔒
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', background: '#1E2028', padding: '2px 8px', borderRadius: 6, border: '1px solid #28282F' }}>
                              DOKUMENTASI DIBATASI (FAST CLEAN)
                            </span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                            Video Dokumentasi Before & After Tidak Tersedia
                          </div>
                          <div style={{ fontSize: 11.5, color: '#5C5C70', marginTop: 4, lineHeight: 1.5 }}>
                            Layanan <strong style={{ color: '#38BDF8' }}>Fast Clean Express</strong> difokuskan pada cuci cepat drive-through (15–20 menit) tanpa pengerjaan detailing di lounge. Fitur perekaman Video HD Before & After secara eksklusif hanya tersedia pada paket <strong style={{ color: '#F2A900' }}>Premium Clean & Detailing</strong>.
                          </div>
                          <button
                            onClick={() => window.location.hash = '#reservasi'}
                            style={{
                              marginTop: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(242,169,0,.3)',
                              background: 'rgba(242,169,0,.1)', color: '#F2A900', fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}
                          >
                            ✦ Upgrade Ke Premium Clean & Detailing →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* RIGHT COLUMN: Digital Pass QR & Assistance */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* QR Card */}
                <div className="card" style={{ padding: 24, textAlign: 'center', background: '#141417', border: '1px solid rgba(242,169,0,.3)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2A900', marginBottom: 12 }}>
                    DIGITAL PASS QR
                  </div>
                  <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 16,
                    display: 'inline-block',
                    marginBottom: 14,
                    border: '3px solid #F2A900',
                    boxShadow: '0 0 30px rgba(242,169,0,.2)',
                  }}>
                    <img src={r.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AURA'} alt="QR Code" style={{ width: 140, height: 140, display: 'block', borderRadius: 6 }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Tunjukkan QR ke Welcomer</div>
                  <div style={{ fontSize: 11.5, color: '#5C5C70', lineHeight: 1.5, marginBottom: 16 }}>
                    Petugas bay akan melakukan scan pada kode QR di atas saat kendaraan Anda memasuki area cuci.
                  </div>

                  <div style={{ height: 1, background: '#28282F', marginBottom: 16 }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button className="btn btn-ghost" style={{ justifyContent: 'center', width: '100%', fontSize: 12 }} onClick={() => window.print()}>
                      🖨️ Cetak Tiket Antrean
                    </button>
                    <button className="btn btn-danger" style={{ justifyContent: 'center', width: '100%', fontSize: 12 }} onClick={() => triggerLateArrival(r.id)}>
                      ⏰ Trigger Terlambat Datang
                    </button>
                  </div>
                </div>

                {/* VIP Lounge & Help Card */}
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>☕</span> Fasilitas Lounge VIP
                  </div>
                  <div style={{ fontSize: 11.5, color: '#5C5C70', lineHeight: 1.5, marginBottom: 12 }}>
                    Silakan menunggu di Lounge VIP kami. Nikmati Free Signature Coffee & High-speed Wi-Fi.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#A0A0B0', background: '#0D0D0F', padding: '8px 12px', borderRadius: 8, border: '1px solid #28282F' }}>
                    <span>CS WhatsApp</span>
                    <span style={{ color: '#F2A900', fontWeight: 700 }}>+6281299887766</span>
                  </div>
                </div>
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
const STORE_CATALOGUE = [
  { id: 101, sku: 'RET-KIT-01', name: 'AURA Quick Detailer Spray 500ml', category: 'autocare', price: 185000, stock: 24, unit: 'Botol', rating: 4.9, reviews: 124, icon: '🧪', desc: 'Formula hydrophobic gloss enhancer untuk kilau instan & perlindungan debu.' },
  { id: 102, sku: 'RET-APP-02', name: 'AURA Luxury Detailing Hoodie', category: 'merchandise', price: 450000, stock: 12, unit: 'Pcs', rating: 5.0, reviews: 48, icon: '👕', desc: 'Apparel resmi AURA dengan bahan cotton fleece 330 GSM super nyaman.' },
  { id: 103, sku: 'RET-AIR-03', name: 'AURA Leather & Oud Air Freshener', category: 'aromaterapi', price: 65000, stock: 38, unit: 'Pcs', rating: 4.8, reviews: 210, icon: '🌿', desc: 'Parfum kabin aroma kayu oud & kulit kemewahan khas VIP Lounge.' },
  { id: 104, sku: 'RET-COAT-04', name: 'Ceramic Quartz Wax Shield 250ml', category: 'autocare', price: 275000, stock: 18, unit: 'Botol', rating: 4.9, reviews: 89, icon: '✦', desc: 'Coating wax sintetis tahan air hujan asam & perlindungan sinar UV 90 hari.' },
  { id: 105, sku: 'RET-TOWEL-05', name: 'Edgeless Microfiber Towel Set (3 Pcs)', category: 'autocare', price: 120000, stock: 45, unit: 'Set', rating: 4.9, reviews: 340, icon: '🧽', desc: 'Kain microfiber 700 GSM tanpa jahitan pinggir, anti baret cat mobil.' },
  { id: 106, sku: 'RET-TUMBLER-06', name: 'AURA Thermal Aluminum Tumbler 750ml', category: 'merchandise', price: 210000, stock: 15, unit: 'Pcs', rating: 5.0, reviews: 65, icon: '🥤', desc: 'Tumbler stainless double-wall menahan dingin 24 jam dengan logo AURA.' },
];

const StorePage = () => {
  const { checkoutMarketplace, showToast } = useCarWash();
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [deliveryOption, setDeliveryOption] = useState('pickup');

  const categories = [
    { id: 'all', label: 'Semua Produk' },
    { id: 'autocare', label: '🧪 Autocare & Detailing' },
    { id: 'merchandise', label: '👕 Merchandise & Apparel' },
    { id: 'aromaterapi', label: '🌿 Aromaterapi Kabin' },
  ];

  const filteredProducts = STORE_CATALOGUE.filter(p => {
    const matchCat = selectedCat === 'all' || p.category === selectedCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>Store & Merchandise</h2>
          <p style={{ fontSize: 13, color: '#5C5C70', margin: 0 }}>Produk perawatan mobil kelas premium & merchandise eksklusif AURA</p>
        </div>
        {/* Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <input
            type="text"
            placeholder="Cari produk / SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: '#141417',
              border: '1px solid #28282F',
              borderRadius: 10,
              padding: '9px 14px 9px 36px',
              color: '#fff',
              fontSize: 12.5,
              outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5C5C70', fontSize: 14 }}>🔍</span>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: selectedCat === c.id ? '#F2A900' : '#28282F',
              background: selectedCat === c.id ? 'rgba(242,169,0,.15)' : '#141417',
              color: selectedCat === c.id ? '#F2A900' : '#A0A0B0',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Products + Cart Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24, alignItems: 'start' }}>

        {/* Product Cards Grid */}
        <div>
          {filteredProducts.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: '#5C5C70' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#A0A0B0' }}>Produk Tidak Ditemukan</div>
              <div style={{ fontSize: 12, color: '#5C5C70', marginTop: 4 }}>Coba kata kunci pencarian atau kategori lain</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 18 }}>
              {filteredProducts.map(p => (
                <div key={p.id} className="card" style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  background: '#141417',
                  border: '1px solid #28282F',
                  borderRadius: 14,
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(242,169,0,.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#28282F'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div>
                    {/* Visual Icon Container */}
                    <div style={{
                      background: 'linear-gradient(135deg, #1C1C22 0%, #111114 100%)',
                      border: '1px solid #28282F',
                      borderRadius: 12,
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      fontSize: 48,
                      marginBottom: 14,
                      position: 'relative',
                    }}>
                      {p.icon}
                      <span className="badge badge-gold" style={{ position: 'absolute', top: 10, right: 10, fontSize: 9 }}>
                        {p.category.toUpperCase()}
                      </span>
                    </div>

                    {/* Rating & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#F2A900', marginBottom: 6, fontWeight: 700 }}>
                      <span>⭐ {p.rating}</span>
                      <span style={{ color: '#5C5C70' }}>({p.reviews} ulasan)</span>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: '#5C5C70', marginBottom: 12, lineHeight: 1.4 }}>{p.desc}</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, paddingTop: 10, borderTop: '1px solid #28282F' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#F2A900' }}>{G(p.price)}</div>
                      <div style={{ fontSize: 10.5, color: '#0EC278', fontWeight: 700 }}>Stok: {p.stock} {p.unit}</div>
                    </div>

                    <button
                      className="btn btn-gold"
                      style={{ width: '100%', justifyContent: 'center', fontSize: 12.5, padding: '9px 0' }}
                      onClick={() => addToCart(p)}
                    >
                      + Tambah ke Keranjang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Panel (Right Sticky) */}
        <div className="card" style={{ padding: 22, position: 'sticky', top: 80, background: '#141417', border: '1px solid #28282F' }}>
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #28282F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛒</span> Keranjang Belanja
            </span>
            {cart.length > 0 && <span className="badge badge-gold">{cart.reduce((s, i) => s + i.qty, 0)} Item</span>}
          </div>

          {cart.length > 0 ? (
            <>
              {/* Item List */}
              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, paddingRight: 4 }}>
                {cart.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#0D0D0F', borderRadius: 10, border: '1px solid #28282F' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#1A1A1F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {c.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#F2A900', fontWeight: 800 }}>{G(c.price * c.qty)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => updateCartQty(c.id, -1)} style={{ width: 22, height: 22, borderRadius: 6, background: '#28282F', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 12, fontWeight: 800, minWidth: 16, textAlign: 'center' }}>{c.qty}</span>
                      <button onClick={() => updateCartQty(c.id, 1)} style={{ width: 22, height: 22, borderRadius: 6, background: '#28282F', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(c.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#5C5C70', padding: 2 }} title="Hapus">✕</button>
                  </div>
                ))}
              </div>

              {/* Delivery / Pick up option */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5C5C70', textTransform: 'uppercase', marginBottom: 8 }}>Metode Pengambilan</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={() => setDeliveryOption('pickup')}
                    style={{
                      padding: '8px 10px', borderRadius: 8, border: '1px solid',
                      borderColor: deliveryOption === 'pickup' ? '#F2A900' : '#28282F',
                      background: deliveryOption === 'pickup' ? 'rgba(242,169,0,.1)' : '#0D0D0F',
                      color: deliveryOption === 'pickup' ? '#F2A900' : '#A0A0B0',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    🚗 Pick up di Bay
                  </button>
                  <button
                    onClick={() => setDeliveryOption('delivery')}
                    style={{
                      padding: '8px 10px', borderRadius: 8, border: '1px solid',
                      borderColor: deliveryOption === 'delivery' ? '#F2A900' : '#28282F',
                      background: deliveryOption === 'delivery' ? 'rgba(242,169,0,.1)' : '#0D0D0F',
                      color: deliveryOption === 'delivery' ? '#F2A900' : '#A0A0B0',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    📦 Kirim ke Rumah
                  </button>
                </div>
              </div>

              <div style={{ height: 1, background: '#28282F', marginBottom: 14 }} />

              {/* Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A0A0B0' }}>
                  <span>Subtotal</span><span>{G(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A0A0B0' }}>
                  <span>Ongkir / Biaya Ambil</span><span style={{ color: '#0EC278', fontWeight: 700 }}>GRATIS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 15, color: '#fff', paddingTop: 8, borderTop: '1px solid #28282F', marginTop: 4 }}>
                  <span>Total Tagihan</span>
                  <span style={{ color: '#F2A900' }}>{G(cartTotal)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="btn btn-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 13.5 }}
                  onClick={() => { checkoutMarketplace(cart, cartTotal); setCart([]); }}
                >
                  🛒 Checkout via QRIS ({G(cartTotal)})
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 11, color: '#F04F4F' }}
                  onClick={() => setCart([])}
                >
                  Kosongkan Keranjang
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#5C5C70', fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
              <div style={{ fontWeight: 700, color: '#A0A0B0', marginBottom: 4 }}>Keranjang Anda Kosong</div>
              <div>Pilih produk perawatan & merchandise resmi AURA di panel sebelah kiri.</div>
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
      case 'dashboard': return <DashboardPage member={member} reservations={reservations} onNavigate={setActivePage} />;
      case 'reservasi': return <ReservasiPage member={member} />;
      case 'antrean': return <AntreanPage member={member} reservations={reservations} />;
      case 'kendaraan': return <KendaraanPage member={member} />;
      case 'store': return <StorePage />;
      case 'profil': return <ProfilPage member={member} />;
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

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: SIDEBAR_W, minHeight: '100%',
        background: '#141417',
        borderRight: '1px solid #28282F',
        display: 'flex', flexDirection: 'column',
        transition: 'width .22s ease',
        flexShrink: 0, overflow: 'hidden',
        position: 'sticky', top: 60, height: 'calc(100vh - 60px)',
      }}>
        {/* Brand Header */}
        <div style={{ padding: sidebarExpanded ? '18px 16px 14px' : '18px 10px 14px', borderBottom: '1px solid #28282F', display: 'flex', alignItems: 'center', justifyContent: sidebarExpanded ? 'space-between' : 'center' }}>
          {sidebarExpanded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, #F2A900, #C98B00)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, flexShrink: 0,
              }}>🚗</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: '-.01em' }}>AURA</div>
                <div style={{ fontSize: 10, color: '#5C5C70', fontWeight: 600 }}>Car Wash</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            style={{ background: '#1A1A1F', border: '1px solid #28282F', cursor: 'pointer', color: '#5C5C70', fontSize: 12, padding: '4px 7px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#28282F'; e.currentTarget.style.color = '#A0A0B0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1A1A1F'; e.currentTarget.style.color = '#5C5C70'; }}
          >
            {sidebarExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* NAV SECTION */}
        <div style={{ padding: '10px 8px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Overview / Dashboard */}
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
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            {sidebarExpanded && <><span style={{ flex: 1, textAlign: 'left' }}>Overview</span><span style={{ fontSize: 11, color: activePage === 'dashboard' ? '#F2A90080' : '#3A3A45' }}>{dashboardOpen ? '∧' : '∨'}</span></>}
          </button>

          {sidebarExpanded && dashboardOpen && (
            <div style={{ marginLeft: 28, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <button onClick={() => setActivePage('reservasi')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: activePage === 'reservasi' ? 'rgba(242,169,0,.08)' : 'transparent', color: activePage === 'reservasi' ? '#F2A900' : '#5C5C70', fontSize: 12, fontWeight: activePage === 'reservasi' ? 700 : 400, textAlign: 'left' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: activePage === 'reservasi' ? '#F2A900' : '#28282F', flexShrink: 0 }} />
                Reservasi Online
              </button>
              <button onClick={() => setActivePage('antrean')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: activePage === 'antrean' ? 'rgba(242,169,0,.08)' : 'transparent', color: activePage === 'antrean' ? '#F2A900' : '#5C5C70', fontSize: 12, fontWeight: activePage === 'antrean' ? 700 : 400, textAlign: 'left' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: activePage === 'antrean' ? '#F2A900' : '#28282F', flexShrink: 0 }} />
                Antrean Aktif
              </button>
            </div>
          )}

          {/* Activity */}
          <button
            onClick={() => setActivePage('reservasi')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: sidebarExpanded ? '10px 14px' : '10px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#A0A0B0',
              fontSize: 13, fontWeight: 500,
              transition: 'all .15s', justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              borderLeft: '3px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A0A0B0'; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            {sidebarExpanded && <span style={{ flex: 1, textAlign: 'left' }}>Activity</span>}
          </button>

          {/* My Vehicles */}
          <button
            onClick={() => setActivePage('kendaraan')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: sidebarExpanded ? '10px 14px' : '10px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activePage === 'kendaraan' ? 'rgba(242,169,0,.12)' : 'transparent',
              color: activePage === 'kendaraan' ? '#F2A900' : '#A0A0B0',
              fontSize: 13, fontWeight: activePage === 'kendaraan' ? 700 : 500,
              transition: 'all .15s', justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              borderLeft: activePage === 'kendaraan' ? '3px solid #F2A900' : '3px solid transparent',
            }}
            onMouseEnter={e => { if (activePage !== 'kendaraan') { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={e => { if (activePage !== 'kendaraan') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A0A0B0'; } }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
            {sidebarExpanded && <span style={{ flex: 1, textAlign: 'left' }}>My Vehicles</span>}
          </button>

          {/* Member Card (Formerly Subscription) */}
          <button
            onClick={() => setActivePage('membercard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: sidebarExpanded ? '10px 14px' : '10px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activePage === 'membercard' ? 'rgba(242,169,0,.12)' : 'transparent',
              color: activePage === 'membercard' ? '#F2A900' : '#A0A0B0',
              fontSize: 13, fontWeight: activePage === 'membercard' ? 700 : 500,
              transition: 'all .15s', justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              borderLeft: activePage === 'membercard' ? '3px solid #F2A900' : '3px solid transparent',
            }}
            onMouseEnter={e => { if (activePage !== 'membercard') { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={e => { if (activePage !== 'membercard') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A0A0B0'; } }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <line x1="1" y1="12" x2="23" y2="12"/>
            </svg>
            {sidebarExpanded && <><span style={{ flex: 1, textAlign: 'left' }}>Member Card</span>
              <span style={{ background: 'rgba(242,169,0,.15)', color: '#F2A900', borderRadius: 8, fontSize: 9, fontWeight: 800, padding: '2px 6px' }}>{member.tier}</span>
            </>}
          </button>

          {/* Separator */}
          <div style={{ height: 1, background: '#1E1E24', margin: '10px 4px' }} />

          {/* Store */}
          <button
            onClick={() => setActivePage('store')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: sidebarExpanded ? '10px 14px' : '10px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activePage === 'store' ? 'rgba(242,169,0,.12)' : 'transparent',
              color: activePage === 'store' ? '#F2A900' : '#A0A0B0',
              fontSize: 13, fontWeight: activePage === 'store' ? 700 : 500,
              transition: 'all .15s', justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              borderLeft: activePage === 'store' ? '3px solid #F2A900' : '3px solid transparent',
            }}
            onMouseEnter={e => { if (activePage !== 'store') { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={e => { if (activePage !== 'store') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A0A0B0'; } }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {sidebarExpanded && <span style={{ flex: 1, textAlign: 'left' }}>Store & Merch</span>}
          </button>
        </div>

        {/* SIDEBAR BOTTOM — Profile + Logout (Clicking profile user box navigates to Profil page) */}
        <div style={{ borderTop: '1px solid #28282F', padding: '10px 8px' }}>
          {sidebarExpanded ? (
            <div
              onClick={() => setActivePage('profil')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                background: activePage === 'profil' ? 'rgba(242,169,0,.12)' : 'transparent',
                border: activePage === 'profil' ? '1px solid rgba(242,169,0,.3)' : '1px solid transparent',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (activePage !== 'profil') e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
              onMouseLeave={e => { if (activePage !== 'profil') e.currentTarget.style.background = 'transparent'; }}
              title="Buka Profil Saya"
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: tier.bg, border: `2px solid ${tier.accent}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 900, color: tier.accent,
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: activePage === 'profil' ? '#F2A900' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</div>
                <div style={{ fontSize: 10, color: '#5C5C70' }}>{member.tier}</div>
              </div>
              <span style={{ fontSize: 13, color: '#5C5C70' }}>›</span>
              <button
                onClick={(e) => { e.stopPropagation(); logoutUser('pelanggan'); }}
                title="Log Out"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#5C5C70', fontSize: 16, padding: 4, marginLeft: 2,
                  display: 'flex', alignItems: 'center', borderRadius: 6, transition: 'color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#F04F4F'}
                onMouseLeave={e => e.currentTarget.style.color = '#5C5C70'}
              >⏻</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: tier.bg, border: `2px solid ${tier.accent}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900, color: tier.accent, cursor: 'pointer',
                  boxShadow: activePage === 'profil' ? '0 0 10px #F2A900' : 'none',
                }}
                onClick={() => setActivePage('profil')}
                title="Buka Profil Saya"
              >
                {initials}
              </div>
              <button onClick={(e) => { e.stopPropagation(); logoutUser('pelanggan'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5C5C70', fontSize: 16, padding: 4 }} title="Log Out">⏻</button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', minWidth: 0 }}>
        {renderPage()}
      </main>
    </div>
  );
};
