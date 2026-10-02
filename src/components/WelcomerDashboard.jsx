import React, { useState, useRef } from 'react';
import { useCarWash } from '../context/CarWashContext';

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

const STATUS_COLOR = {
  confirmed: '#F2A900',
  checked_in: '#38BDF8',
  completed: '#0EC278',
  rescheduled_pending: '#F04F4F',
};

const STATUS_LABEL = {
  confirmed: 'Menunggu Check-In',
  checked_in: 'Checked In',
  completed: 'Selesai (Checked Out)',
  rescheduled_pending: '⏰ Terlambat >5m',
};

// ── Walk-in services catalogue ──────────────────────────────────────────────
const WALK_SERVICES = [
  {
    id: 'fast_clean', name: 'Fast Clean Express', emoji: '⚡',
    variants: [
      { id: 'small',  label: 'Small',  price: 65000 },
      { id: 'medium', label: 'Medium', price: 85000 },
      { id: 'big',    label: 'Big',    price: 105000 },
    ],
  },
  {
    id: 'premium_clean', name: 'Premium Clean & Detailing', emoji: '✦',
    variants: [
      { id: 'small',  label: 'Small',  price: 200000 },
      { id: 'medium', label: 'Medium', price: 275000 },
      { id: 'big',    label: 'Big',    price: 350000 },
    ],
  },
];

export const WelcomerDashboard = () => {
  const {
    reservations, members, checkInCustomer, checkOutCustomer,
    walkInCustomer, registerMember, showToast
  } = useCarWash();

  // ── QR / code scan ──────────────────────────────────────────────────────────
  const [scan, setScan]       = useState('');
  const [found, setFound]     = useState(null);
  const scanRef               = useRef();

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('queue');

  // ── Walk-In state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Walk-in form
  const [wiForm, setWiForm] = useState({
    name: '', phone: '', vehicle: '', plate: '',
    service: 'fast_clean', variant: 'medium',
    payMethod: 'qris', // 'qris' | 'cash'
  });

  // Modal states
  const [addMemberPanel, setAddMemberPanel] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', vehicle: '', plate: '', username: '', password: '123456' });
  const [qrisModal, setQrisModal] = useState(false);
  const [pendingWalkInData, setPendingWalkInData] = useState(null);
  const [waModal, setWaModal] = useState(false);
  const [waData, setWaData] = useState(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const queue   = reservations.filter(r => !['completed', 'cancelled'].includes(r.status));
  const today   = reservations.filter(r => r.status === 'completed');
  const walkIns = reservations.filter(r => r.type === 'walkin');

  // ── Handlers: QR Scan ──────────────────────────────────────────────────────
  const handleScan = () => {
    const q = scan.trim().toUpperCase();
    const r = reservations.find(r =>
      r.bookingCode?.toUpperCase() === q ||
      String(r.queueNumber) === scan.trim()
    );
    if (r) setFound(r);
    else showToast('Kode tiket / antrean tidak ditemukan', 'error');
  };

  const handleCheckIn = (id) => {
    checkInCustomer(id);
    setFound(null);
    setScan('');
    showToast('Check-In berhasil!', 'success');
  };

  const handleCheckOut = (id) => {
    checkOutCustomer(id);
    showToast('Check-Out (Selesai) berhasil!', 'success');
  };

  // ── Handlers: Member Search ────────────────────────────────────────────────
  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) { showToast('Masukkan nama atau nomor HP terlebih dahulu', 'error'); return; }
    const results = members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );
    setSearchResults(results);
    setSelectedMember(null);
    setAddMemberPanel(false);
    setWiForm(f => ({ ...f, name: '', phone: '', vehicle: '', plate: '' }));
    if (results.length === 0) showToast('Pelanggan tidak ditemukan — Silakan daftarkan member baru', 'warning');
  };

  const selectMember = (m) => {
    setSelectedMember(m);
    setWiForm(f => ({ ...f, name: m.name, phone: m.phone, vehicle: m.vehicle, plate: m.plate }));
    setAddMemberPanel(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSelectedMember(null);
    setAddMemberPanel(false);
    setWiForm({ name: '', phone: '', vehicle: '', plate: '', service: 'fast_clean', variant: 'medium', payMethod: 'qris' });
  };

  // ── Handlers: Register New Member ─────────────────────────────────────────
  const handleRegisterMember = (e) => {
    e.preventDefault();
    const finalData = {
      ...newMember,
      username: newMember.username || newMember.name.toLowerCase().replace(/\s+/g, '.'),
      password: newMember.password || '123456',
    };
    const m = registerMember(finalData);
    selectMember(m);
    setNewMember({ name: '', phone: '', vehicle: '', plate: '', username: '', password: '123456' });
    setAddMemberPanel(false);
    showToast(`Member baru ${m.name} (${m.memberId}) berhasil didaftarkan!`, 'success');
  };

  // ── Handlers: Walk-In Submit ───────────────────────────────────────────────
  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    const svc = WALK_SERVICES.find(s => s.id === wiForm.service);
    const vrnt = svc.variants.find(v => v.id === wiForm.variant);

    const walkData = {
      name: wiForm.name,
      phone: wiForm.phone,
      vehicle: wiForm.vehicle,
      plate: wiForm.plate,
      service: wiForm.service,
      serviceName: `${svc.name} (${vrnt.label})`,
      variant: wiForm.variant,
      price: vrnt.price,
      paymentMethod: wiForm.payMethod,
    };

    if (wiForm.payMethod === 'qris') {
      // Show QRIS modal directly at Welcomer!
      setPendingWalkInData(walkData);
      setQrisModal(true);
    } else {
      // Cash payment -> Process walk-in as unpaid & direct customer to Kasir POS
      const res = walkInCustomer({ ...walkData, paymentMethod: 'cash' });
      triggerWaSimulation(res, 'cash');
      setTab('queue');
      clearSearch();
    }
  };

  // Confirm QRIS Payment at Welcomer
  const handleConfirmQrisWalkIn = () => {
    if (!pendingWalkInData) return;
    const res = walkInCustomer({ ...pendingWalkInData, paymentMethod: 'qris' });
    setQrisModal(false);
    setPendingWalkInData(null);
    triggerWaSimulation(res, 'qris');
    setTab('queue');
    clearSearch();
  };

  // Trigger WhatsApp Simulation Popup
  const triggerWaSimulation = (reservation, method) => {
    setWaData({
      customerName: reservation.customerName,
      phone: reservation.phone,
      queueNumber: reservation.queueNumber,
      bookingCode: reservation.bookingCode,
      vehicle: `${reservation.vehicle} (${reservation.plate})`,
      serviceName: reservation.serviceName,
      price: reservation.price,
      payMethod: method === 'qris' ? 'LUNAS (QRIS Welcomer)' : 'PEMBAYARAN CASH (Kasir POS)',
    });
    setWaModal(true);
  };

  const currentSvc   = WALK_SERVICES.find(s => s.id === wiForm.service);
  const currentVrnt  = currentSvc.variants.find(v => v.id === wiForm.variant);

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>

      {/* ── STAT ROW ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Antrean Aktif',      value: queue.length,                                               color: '#F2A900', icon: '🎫' },
          { label: 'Check-In Hari Ini',  value: today.length + 2,                                           color: '#0EC278', icon: '✅' },
          { label: 'Walk-In Hari Ini',   value: walkIns.length + 3,                                         color: '#38BDF8', icon: '🚶' },
          { label: 'Terlambat',          value: queue.filter(r => r.status === 'rescheduled_pending').length, color: '#F04F4F', icon: '⏰' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ color: s.color, fontSize: 26 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── QR SCAN BAR ───────────────────────────────────────────────── */}
      <div className="card-gold" style={{ padding: '18px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 11, color: '#F2A900', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
              🔲 Scan QR / Kode Tiket / No. Antrean
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input ref={scanRef} value={scan} onChange={e => setScan(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                className="input mono" placeholder="Scan atau ketik: AURA-20260930-01 / No. antrean"
              />
              <button className="btn btn-gold" onClick={handleScan} style={{ flexShrink: 0 }}>🔍 Scan</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {queue.slice(0, 4).map(r => (
              <button key={r.id} className="btn btn-ghost" style={{ fontSize: 12 }}
                onClick={() => { setScan(String(r.queueNumber)); setTimeout(handleScan, 50); }}>
                #{r.queueNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Scan result */}
        {found && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: '#0D0D0F', border: '1px solid rgba(242,169,0,.3)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Kode Tiket',  val: found.bookingCode, mono: true, gold: true },
                  { label: 'Pelanggan',   val: found.customerName, bold: true },
                  { label: 'Kendaraan',   val: `${found.vehicle} · ${found.plate}`, mono: true },
                  { label: 'Layanan',     val: found.serviceName },
                  { label: 'Slot',        val: found.reservationTime ?? '–', mono: true },
                ].map(c => (
                  <div key={c.label}>
                    <div className="tag" style={{ marginBottom: 2 }}>{c.label}</div>
                    <div style={{
                      fontWeight: c.bold ? 700 : c.gold ? 800 : 500,
                      fontSize: c.gold ? 15 : 13,
                      fontFamily: c.mono ? 'monospace' : 'inherit',
                      color: c.gold ? '#F2A900' : '#fff',
                    }}>{c.val}</div>
                  </div>
                ))}
                <div>
                  <div className="tag" style={{ marginBottom: 2 }}>Status</div>
                  <span className="badge" style={{ background: `${STATUS_COLOR[found.status]}18`, color: STATUS_COLOR[found.status], border: `1px solid ${STATUS_COLOR[found.status]}44` }}>
                    {STATUS_LABEL[found.status]}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {found.status === 'confirmed' && (
                  <button className="btn btn-gold" onClick={() => handleCheckIn(found.id)}>✅ Proses Check-In</button>
                )}
                {found.status === 'checked_in' && (
                  <button className="btn btn-gold" style={{ background:'rgba(14,194,120,.2)', color:'#0EC278', border:'1px solid #0EC278' }} onClick={() => handleCheckOut(found.id)}>🏁 Check-Out (Selesai)</button>
                )}
                <button className="btn btn-ghost" onClick={() => setFound(null)} style={{ fontSize: 12 }}>✕ Tutup</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TABS ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #28282F' }}>
        {[
          { id: 'queue',   label: 'Antrean Aktif',    emoji: '📋' },
          { id: 'walkin',  label: 'Walk-In Baru',      emoji: '🚶' },
          { id: 'history', label: 'Riwayat Hari Ini',  emoji: '📁' },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500,
              background: 'transparent', color: active ? '#F2A900' : '#A0A0B0',
              borderBottom: active ? '2px solid #F2A900' : '2px solid transparent',
              marginBottom: -1, transition: 'all .15s',
            }}>
              {t.emoji} {t.label}
              {t.id === 'queue' && queue.length > 0 && (
                <span style={{ background: '#F2A900', color: '#0D0D0F', borderRadius: '99px', fontSize: 10, fontWeight: 800, padding: '1px 6px' }}>{queue.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ ANTREAN AKTIF (Check-In & Check-Out Only) ════════════════ */}
      {tab === 'queue' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Antrean</th><th>Pelanggan</th><th>Kendaraan</th><th>Layanan</th><th>Bayar</th><th>Tipe</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {queue.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#5C5C70', padding: '40px 0', fontSize: 13 }}>Tidak ada antrean aktif saat ini</td></tr>
              )}
              {queue.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 900, fontSize: 22, color: '#F2A900', fontFamily: 'monospace' }}>#{r.queueNumber}</td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.customerName}</div>
                    <div style={{ fontSize: 11, color: '#5C5C70' }}>{r.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{r.vehicle}</div>
                    <div className="mono" style={{ fontSize: 11, color: '#A0A0B0' }}>{r.plate}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{r.serviceName}</td>
                  <td>
                    <span className="badge" style={{ background: r.paymentStatus==='paid' ? 'rgba(14,194,120,.15)' : 'rgba(240,79,79,.15)', color: r.paymentStatus==='paid' ? '#0EC278' : '#F04F4F', border: `1px solid ${r.paymentStatus==='paid'?'#0EC278':'#F04F4F'}44` }}>
                      {r.paymentStatus==='paid' ? '✓ Lunas' : '⏳ Belum Bayar'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.type === 'walkin' ? 'badge-blue' : 'badge-gold'}`}>
                      {r.type === 'walkin' ? '🚶 Walk-In' : '📅 Reservasi'}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: `${STATUS_COLOR[r.status]}18`, color: STATUS_COLOR[r.status], border: `1px solid ${STATUS_COLOR[r.status]}44` }}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {r.status === 'confirmed' && (
                        <button className="btn btn-gold" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => handleCheckIn(r.id)}>
                          ✅ Check-In
                        </button>
                      )}
                      {r.status === 'checked_in' && (
                        <button className="btn btn-gold" style={{ fontSize: 11, padding: '6px 12px', background:'rgba(14,194,120,.15)', color:'#0EC278', border:'1px solid rgba(14,194,120,.4)' }} onClick={() => handleCheckOut(r.id)}>
                          🏁 Check-Out (Selesai)
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ WALK-IN BARU ══════════════════════════════════════════════ */}
      {tab === 'walkin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

          {/* LEFT: Search + Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Step 1: Cari Member ──────────────────────────────── */}
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #28282F' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F2A900', color: '#0D0D0F', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Cari Data Member</span>
                {selectedMember && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, cursor: 'pointer', color: '#5C5C70', textDecoration: 'underline' }} onClick={clearSearch}>Ganti pelanggan</span>
                )}
              </div>

              {!selectedMember ? (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      className="input"
                      placeholder="Cari nama atau nomor HP pelanggan..."
                    />
                    <button className="btn btn-gold" onClick={handleSearch} style={{ flexShrink: 0 }}>🔍 Cari</button>
                    <button className="btn btn-ghost" onClick={() => setAddMemberPanel(p => !p)} style={{ flexShrink: 0, fontSize: 12 }}>
                      {addMemberPanel ? '✕ Batal' : '➕ Member Baru'}
                    </button>
                  </div>

                  {/* Search results */}
                  {searchResults !== null && (
                    <>
                      {searchResults.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ fontSize: 11, color: '#5C5C70', marginBottom: 2 }}>{searchResults.length} member ditemukan — Klik untuk pilih:</div>
                          {searchResults.map(m => (
                            <div key={m.id}
                              onClick={() => selectMember(m)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                                background: '#0D0D0F', border: '1px solid #28282F', borderRadius: 10,
                                cursor: 'pointer', transition: 'all .15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#F2A900'; e.currentTarget.style.background = '#1a1500'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#28282F'; e.currentTarget.style.background = '#0D0D0F'; }}
                            >
                              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(242,169,0,.12)', border: '1px solid rgba(242,169,0,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#F2A900', flexShrink: 0 }}>
                                {m.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                  <span style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</span>
                                  <span className="badge badge-gold" style={{ fontSize: 10 }}>{m.tier}</span>
                                </div>
                                <div style={{ fontSize: 12, color: '#5C5C70' }}>
                                  <span className="mono">{m.phone}</span>
                                  <span style={{ margin: '0 6px' }}>·</span>
                                  <span>{m.vehicle}</span>
                                  <span style={{ margin: '0 4px' }}>·</span>
                                  <span className="mono">{m.plate}</span>
                                </div>
                              </div>
                              <div style={{ fontSize: 11, color: '#5C5C70', textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, color: '#F2A900' }}>{m.points} pts</div>
                                <div>{m.totalVisits} kunjungan</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', background: '#0D0D0F', borderRadius: 12, border: '1px dashed #28282F' }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Pelanggan Tidak Ditemukan</div>
                          <div style={{ fontSize: 12, color: '#5C5C70', marginBottom: 16 }}>
                            Tidak ada member dengan nama atau nomor HP "<strong style={{ color: '#A0A0B0' }}>{searchQuery}</strong>"
                          </div>
                          <button className="btn btn-gold" onClick={() => setAddMemberPanel(true)} style={{ justifyContent: 'center' }}>
                            + Daftarkan Member Baru
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Add New Member Panel */}
                  {addMemberPanel && (
                    <div style={{ marginTop: 16, padding: 20, background: '#141417', border: '1px solid rgba(242,169,0,.25)', borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(242,169,0,.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>✨</span>
                          <span style={{ fontWeight: 800, fontSize: 14, color: '#F2A900' }}>Registrasi Member Baru</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#A0A0B0', background: '#0D0D0F', padding: '2px 8px', borderRadius: 6, border: '1px solid #28282F' }}>Akun Baru</span>
                      </div>
                      <form onSubmit={handleRegisterMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label className="label">Nama Lengkap *</label>
                          <input className="input" placeholder="cth. Andika Pratama"
                            value={newMember.name}
                            onChange={e => {
                              const val = e.target.value;
                              const autoUser = val.toLowerCase().trim().replace(/\s+/g, '.');
                              setNewMember(nm => ({
                                ...nm,
                                name: val,
                                username: nm.username ? nm.username : autoUser
                              }));
                            }}
                            required />
                        </div>
                        <div>
                          <label className="label">No. Telepon / WhatsApp *</label>
                          <input className="input" placeholder="081234567890"
                            value={newMember.phone} onChange={e => setNewMember({ ...newMember, phone: e.target.value })} required />
                        </div>
                        <div>
                          <label className="label">Jenis Kendaraan *</label>
                          <input className="input" placeholder="cth. Honda HR-V / Sedan"
                            value={newMember.vehicle} onChange={e => setNewMember({ ...newMember, vehicle: e.target.value })} required />
                        </div>
                        <div>
                          <label className="label">Plat / No. Kendaraan *</label>
                          <input className="input mono" placeholder="cth. B 1234 ABC"
                            value={newMember.plate} onChange={e => setNewMember({ ...newMember, plate: e.target.value.toUpperCase() })} required />
                        </div>

                        <div>
                          <label className="label">Username Member *</label>
                          <input className="input mono" placeholder="cth. andika.pratama"
                            value={newMember.username} onChange={e => setNewMember({ ...newMember, username: e.target.value.toLowerCase() })} required />
                        </div>
                        <div>
                          <label className="label">Password (Default: 123456)</label>
                          <input className="input mono" placeholder="123456"
                            value={newMember.password} onChange={e => setNewMember({ ...newMember, password: e.target.value })} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, gridColumn: '1/-1', marginTop: 4 }}>
                          <button type="button" className="btn btn-ghost" style={{ justifyContent: 'center' }}
                            onClick={() => setAddMemberPanel(false)}>
                            Batal
                          </button>
                          <button type="submit" className="btn btn-gold" style={{ justifyContent: 'center' }}>
                            ✨ Daftarkan & Lanjut
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(14,194,120,.07)', border: '1px solid rgba(14,194,120,.25)', borderRadius: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(14,194,120,.12)', border: '1px solid rgba(14,194,120,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0EC278', fontSize: 14, flexShrink: 0 }}>
                    {selectedMember.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>{selectedMember.name}</span>
                      <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Member Ditemukan</span>
                      <span className="badge badge-gold" style={{ fontSize: 10 }}>{selectedMember.tier}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#A0A0B0' }}>
                      <span className="mono">{selectedMember.phone}</span>
                      <span style={{ margin: '0 6px' }}>·</span>
                      <span>{selectedMember.vehicle}</span>
                      <span style={{ margin: '0 4px' }}>·</span>
                      <span className="mono">{selectedMember.plate}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#F2A900' }}>{selectedMember.points}</div>
                    <div style={{ fontSize: 10, color: '#5C5C70' }}>poin</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Step 2: Pilih Layanan & Ukuran ──────────────────── */}
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #28282F' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: selectedMember ? '#F2A900' : '#28282F', color: selectedMember ? '#0D0D0F' : '#5C5C70', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                <span style={{ fontWeight: 700, fontSize: 14, color: selectedMember ? '#fff' : '#5C5C70' }}>Pilih Layanan & Ukuran Kendaraan</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, opacity: selectedMember ? 1 : 0.4, pointerEvents: selectedMember ? 'auto' : 'none' }}>
                {WALK_SERVICES.map(s => {
                  const active = wiForm.service === s.id;
                  return (
                    <div key={s.id}
                      onClick={() => setWiForm(f => ({ ...f, service: s.id, variant: 'medium' }))}
                      style={{
                        border: `2px solid ${active ? '#F2A900' : '#28282F'}`,
                        borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
                        background: active ? 'rgba(242,169,0,.08)' : '#0D0D0F',
                        transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: active ? '#F2A900' : '#fff' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#5C5C70' }}>
                          {s.id === 'fast_clean' ? 'Mulai Rp 65.000' : 'Mulai Rp 200.000'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Variant selector */}
              <div style={{ opacity: selectedMember ? 1 : 0.4, pointerEvents: selectedMember ? 'auto' : 'none' }}>
                <label className="label">Ukuran Kendaraan</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {currentSvc.variants.map(v => {
                    const active = wiForm.variant === v.id;
                    return (
                      <button key={v.id}
                        type="button"
                        onClick={() => setWiForm(f => ({ ...f, variant: v.id }))}
                        style={{
                          padding: '10px 8px', borderRadius: 9, cursor: 'pointer',
                          border: `2px solid ${active ? '#F2A900' : '#28282F'}`,
                          background: active ? 'rgba(242,169,0,.1)' : '#0D0D0F',
                          fontFamily: 'inherit', transition: 'all .15s', textAlign: 'center',
                        }}>
                        <div style={{ fontSize: 18, marginBottom: 4 }}>
                          {v.id === 'small' ? '🚗' : v.id === 'medium' ? '🚙' : '🚐'}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#F2A900' : '#fff', marginBottom: 2 }}>{v.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: active ? '#F2A900' : '#A0A0B0' }}>{G(v.price)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Step 3: Metode Pembayaran & Submit Walk-In ──────────────────────── */}
            <form onSubmit={handleWalkInSubmit} className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #28282F' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: selectedMember ? '#F2A900' : '#28282F', color: selectedMember ? '#0D0D0F' : '#5C5C70', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
                <span style={{ fontWeight: 700, fontSize: 14, color: selectedMember ? '#fff' : '#5C5C70' }}>Pilih Metode Pembayaran Walk-In</span>
              </div>

              {/* Payment Method Selector */}
              <div style={{ opacity: selectedMember ? 1 : 0.4, pointerEvents: selectedMember ? 'auto' : 'none', marginBottom: 16 }}>
                <label className="label">Metode Pembayaran *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { id: 'qris', label: '📱 QRIS Instant', sub: 'Muncul QR & Otomatis ke Kasir/Owner', color: '#38BDF8' },
                    { id: 'cash', label: '💵 Bayar Tunai (Cash)', sub: 'Diarahkan ke Meja Kasir POS', color: '#0EC278' },
                  ].map(m => {
                    const active = wiForm.payMethod === m.id;
                    return (
                      <div key={m.id}
                        onClick={() => setWiForm(f => ({ ...f, payMethod: m.id }))}
                        style={{
                          border: `2px solid ${active ? m.color : '#28282F'}`,
                          borderRadius: 10, padding: 12, cursor: 'pointer',
                          background: active ? `${m.color}12` : '#0D0D0F',
                          transition: 'all .15s',
                        }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: active ? m.color : '#fff', marginBottom: 4 }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: '#5C5C70', lineHeight: 1.3 }}>{m.sub}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price summary */}
              {selectedMember && (
                <div style={{ background: '#0D0D0F', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(242,169,0,.2)', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A0A0B0', marginBottom: 4 }}>
                    <span>{currentSvc.name} ({currentVrnt.label})</span>
                    <span>{G(currentVrnt.price)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: wiForm.payMethod==='qris'?'#38BDF8':'#0EC278', marginBottom: 6 }}>
                    {wiForm.payMethod === 'qris' ? '📱 Pembayaran QRIS di Layar Welcomer' : '💵 Pembayaran Tunai di Meja Kasir POS'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 16, borderTop: '1px solid #28282F', paddingTop: 8 }}>
                    <span style={{ color: '#A0A0B0', fontSize: 12 }}>Total Tagihan</span>
                    <span style={{ color: '#F2A900' }}>{G(currentVrnt.price)}</span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-gold"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 13.5 }}
                disabled={!selectedMember}
              >
                {wiForm.payMethod === 'qris' ? '📱 Tampilkan QR Code & Proses Walk-In' : '🚶 Proses Walk-In & Arahkan ke Kasir'}
              </button>
            </form>
          </div>

          {/* RIGHT: Panduan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #28282F' }}>📋 Alur Pembayaran & Notifikasi WA</div>
              {[
                { step: '1', title: 'Pilih Metode QRIS / Cash', desc: 'Sesuai permintaan pelanggan', color: '#F2A900' },
                { step: '2', title: 'QRIS Langsung Lunas', desc: 'Scan QR di Welcomer -> Catatan keuangan masuk ke Kasir POS & Owner', color: '#38BDF8' },
                { step: '3', title: 'Cash via Kasir POS', desc: 'Pelanggan diberi Kode Antrean untuk bayar di meja kasir', color: '#0EC278' },
                { step: '4', title: 'Simulasi WA Gateway', desc: 'Pesan notifikasi WA otomatis terkirim ke no. HP pelanggan', color: '#A855F7' },
              ].map(g => (
                <div key={g.step} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${g.color}18`, border: `1px solid ${g.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: g.color, flexShrink: 0 }}>{g.step}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: '#5C5C70', marginTop: 2, lineHeight: 1.5 }}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ HISTORY ══════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Pelanggan</th><th>Kendaraan</th><th>Layanan</th><th>Pembayaran</th><th>Tipe</th><th>Waktu</th></tr>
            </thead>
            <tbody>
              {today.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#5C5C70', padding: '40px 0' }}>Belum ada layanan selesai hari ini</td></tr>
              )}
              {today.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.customerName}</td>
                  <td>
                    <div style={{ fontSize: 12 }}>{r.vehicle}</div>
                    <div className="mono" style={{ fontSize: 11, color: '#5C5C70' }}>{r.plate}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{r.serviceName}</td>
                  <td style={{ color: '#F2A900', fontWeight: 700 }}>{G(r.price)}</td>
                  <td><span className={`badge ${r.type === 'walkin' ? 'badge-blue' : 'badge-gold'}`}>{r.type === 'walkin' ? '🚶 Walk-In' : '📅 Reservasi'}</span></td>
                  <td className="mono" style={{ fontSize: 11, color: '#5C5C70' }}>WIB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL QRIS WELCOMER ────────────────────────────────────────── */}
      {qrisModal && pendingWalkInData && (
        <div className="modal-overlay" onClick={() => setQrisModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>📱 Scan QRIS Walk-In Welcomer</div>
            <div style={{ fontSize: 13, color: '#A0A0B0', marginBottom: 2 }}>{pendingWalkInData.name} · {pendingWalkInData.vehicle}</div>
            <div style={{ fontSize: 12, color: '#5C5C70', marginBottom: 14 }}>{pendingWalkInData.serviceName}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F2A900', marginBottom: 16 }}>{G(pendingWalkInData.price)}</div>

            <div style={{ background: '#fff', borderRadius: 14, padding: 16, display: 'inline-block', marginBottom: 16, border: '3px solid #F2A900', boxShadow: '0 0 24px rgba(242,169,0,.3)' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AURA-WALKIN-${pendingWalkInData.plate}`} alt="QRIS Welcomer" style={{ width: 160, height: 160, display: 'block' }} />
            </div>

            <div style={{ fontSize: 11, color: '#38BDF8', marginBottom: 20, background: 'rgba(56,189,248,.1)', padding: '8px 12px', borderRadius: 8 }}>
              💡 Konfirmasi ini otomatis mencatat keuangan ke Kasir POS &amp; Owner Dashboard!
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => setQrisModal(false)}>Batal</button>
              <button className="btn btn-gold" style={{ justifyContent: 'center' }} onClick={handleConfirmQrisWalkIn}>✅ Konfirmasi Lunas</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL SIMULASI WHATSAPP GATEWAY ────────────────────────────── */}
      {waModal && waData && (
        <div className="modal-overlay" onClick={() => setWaModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 440, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #28282F' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(14,194,120,.2)', color: '#0EC278', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📲</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Simulasi WA Gateway (Terkirim)</div>
                <div style={{ fontSize: 11, color: '#5C5C70' }}>Nomor HP: <span className="mono" style={{ color: '#fff' }}>{waData.phone}</span></div>
              </div>
            </div>

            <div style={{ background: '#0D0D0F', borderRadius: 12, padding: 18, fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.8, border: '1px solid rgba(14,194,120,.3)', marginBottom: 20 }}>
              <div style={{ color: '#0EC278', fontWeight: 800, marginBottom: 8 }}>🟢 [AURA WA GATEWAY AUTOMATION]</div>
              <div>Halo <strong>{waData.customerName}</strong>, Terima kasih telah berkunjung ke AURA Auto Care! 🚗✨</div>
              <div style={{ height: 1, background: '#28282F', margin: '8px 0' }} />
              <div>🎫 No. Antrean: <strong style={{ color: '#F2A900', fontSize: 16 }}>#{waData.queueNumber}</strong></div>
              <div>🔖 Kode Booking: <strong>{waData.bookingCode}</strong></div>
              <div>🚘 Kendaraan: {waData.vehicle}</div>
              <div>📦 Layanan: {waData.serviceName}</div>
              <div>💰 Total: <strong>{G(waData.price)}</strong></div>
              <div>💳 Status Bayar: <span style={{ color: '#F2A900' }}>{waData.payMethod}</span></div>
              <div style={{ height: 1, background: '#28282F', margin: '8px 0' }} />
              <div style={{ color: '#5C5C70', fontSize: 11 }}>Tunjukkan pesan ini atau Tiket QR Anda kepada staf kami saat kendaraan diserahkan.</div>
            </div>

            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setWaModal(false)}>
              ✓ Tutup Simulasi WA
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
