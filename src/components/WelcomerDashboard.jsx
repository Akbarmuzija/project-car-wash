import React, { useState, useRef } from 'react';
import { useCarWash } from '../context/CarWashContext';

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

const STATUS_COLOR = {
  confirmed: '#F2A900',
  checked_in: '#38BDF8',
  in_progress: '#A855F7',
  completed: '#0EC278',
  rescheduled_pending: '#F04F4F',
};

const STATUS_LABEL = {
  confirmed: 'Menunggu Check-In',
  checked_in: 'Checked In',
  in_progress: 'Sedang Dicuci',
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
    walkInCustomer, registerMember, showToast, logoutUser, authUsers
  } = useCarWash();

  // Layout & Tab state
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [tab, setTab] = useState('queue'); // 'queue' | 'walkin' | 'bays' | 'members'

  // QR / Code scan
  const [scan, setScan] = useState('');
  const [found, setFound] = useState(null);
  const scanRef = useRef();

  // Member search & Walk-In state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const [wiForm, setWiForm] = useState({
    name: '', phone: '', vehicle: '', plate: '',
    service: 'fast_clean', variant: 'medium',
    payMethod: 'qris',
  });

  // Modal states
  const [addMemberPanel, setAddMemberPanel] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', vehicle: '', plate: '', username: '', password: '123456' });
  const [qrisModal, setQrisModal] = useState(false);
  const [pendingWalkInData, setPendingWalkInData] = useState(null);
  const [waModal, setWaModal] = useState(false);
  const [waData, setWaData] = useState(null);
  const [qrScanModal, setQrScanModal] = useState(false);
  const [printedTicket, setPrintedTicket] = useState(null);

  // Bay state simulator
  const [fastBays, setFastBays] = useState([
    { id: 1, name: 'Bay 1 Express', status: 'occupied', car: 'BMW X5 (B 1888 AUR)' },
    { id: 2, name: 'Bay 2 Express', status: 'available', car: null },
    { id: 3, name: 'Bay 3 Express', status: 'available', car: null }
  ]);
  const [detailingBays, setDetailingBays] = useState([
    { id: 1, name: 'Detailing Lounge 1', status: 'occupied', car: 'Porsche Macan (B 9999 VIP)' },
    { id: 2, name: 'Detailing Lounge 2', status: 'available', car: null }
  ]);

  const welcomerUser = authUsers?.welcomer || { name: 'Front Officer Welcomer', role: 'Gate Controller' };

  // Derived stats
  const queue   = reservations.filter(r => !['completed', 'cancelled'].includes(r.status));
  const today   = reservations.filter(r => r.status === 'completed');
  const walkIns = reservations.filter(r => r.type === 'walkin');

  // Handlers
  const handleScan = () => {
    const q = scan.trim().toUpperCase();
    if (!q) return;
    const r = reservations.find(r =>
      r.bookingCode?.toUpperCase() === q ||
      String(r.queueNumber) === scan.trim() ||
      r.plate?.toUpperCase() === q
    );
    if (r) {
      setFound(r);
    } else {
      showToast('Kode tiket / antrean / plat tidak ditemukan', 'error');
    }
  };

  const handleCheckIn = (id) => {
    checkInCustomer(id);
    setFound(null);
    setScan('');
    showToast('Check-In Berhasil! Kendaraan diteruskan ke Bay Washing.', 'success');
  };

  const handleCheckOut = (id) => {
    checkOutCustomer(id);
    showToast('Check-Out Selesai! Kendaraan telah keluar dari area carwash.', 'success');
  };

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
      setPendingWalkInData(walkData);
      setQrisModal(true);
    } else {
      const res = walkInCustomer({ ...walkData, paymentMethod: 'cash' });
      triggerWaSimulation(res, 'cash');
      setTab('queue');
      clearSearch();
    }
  };

  const handleConfirmQrisWalkIn = () => {
    if (!pendingWalkInData) return;
    const res = walkInCustomer({ ...pendingWalkInData, paymentMethod: 'qris' });
    setQrisModal(false);
    setPendingWalkInData(null);
    triggerWaSimulation(res, 'qris');
    setTab('queue');
    clearSearch();
  };

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

  const currentSvc  = WALK_SERVICES.find(s => s.id === wiForm.service);
  const currentVrnt = currentSvc.variants.find(v => v.id === wiForm.variant);

  const SIDEBAR_W = sidebarExpanded ? 240 : 64;

  const navItems = [
    { id: 'queue', label: 'Antrean & Check-In', icon: '📌', count: queue.length },
    { id: 'walkin', label: 'Registrasi Walk-In', icon: '⚡', count: null },
    { id: 'bays', label: 'Bay Monitoring', icon: '🚗', count: null },
    { id: 'members', label: 'Database Member', icon: '👥', count: members.length },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', background: '#0D0D0F', color: '#fff' }}>
      
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside style={{
        width: SIDEBAR_W,
        background: '#141417',
        borderRight: '1px solid #28282F',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .2s ease',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #28282F', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarExpanded ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#F2A900', letterSpacing: '.04em' }}>AURA</div>
              <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 800 }}>Welcomer Console</div>
            </div>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 900, color: '#F2A900', margin: '0 auto' }}>A</div>
          )}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            style={{
              background: '#28282F', border: 'none', color: '#A0A0B0',
              width: 26, height: 26, borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
            }}
          >
            {sidebarExpanded ? '◄' : '►'}
          </button>
        </div>

        {/* Sidebar Links */}
        <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map(item => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: sidebarExpanded ? '12px 14px' : '12px 0',
                  justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, rgba(242,169,0,.18), rgba(242,169,0,.05))' : 'transparent',
                  color: isActive ? '#F2A900' : '#A0A0B0',
                  fontWeight: isActive ? 800 : 500,
                  fontSize: 13,
                  borderLeft: isActive ? '3px solid #F2A900' : '3px solid transparent',
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {sidebarExpanded && (
                  <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {sidebarExpanded && item.count !== null && (
                  <span className="badge" style={{
                    fontSize: 10,
                    background: isActive ? 'rgba(242,169,0,.2)' : '#28282F',
                    color: isActive ? '#F2A900' : '#808090',
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (Profile & Logout) */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #28282F', background: '#0D0D0F' }}>
          {sidebarExpanded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #F2A900, #C98B00)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 900, color: '#0D0D0F',
              }}>
                FO
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{welcomerUser.name}</div>
                <div style={{ fontSize: 10, color: '#5C5C70' }}>Senopati Gate</div>
              </div>
              <button
                onClick={() => logoutUser('welcomer')}
                title="Logout Sesi Welcomer"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#5C5C70', fontSize: 16, padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#F04F4F'}
                onMouseLeave={e => e.currentTarget.style.color = '#5C5C70'}
              >
                ⏻
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#F2A900', color: '#0D0D0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
                FO
              </div>
              <button onClick={() => logoutUser('welcomer')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5C5C70', fontSize: 16, padding: 4 }} title="Logout Sesi Welcomer">⏻</button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', minWidth: 0 }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#F2A900', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>WELCOMER & GATE CONSOLE</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              {tab === 'queue' && 'Antrean Aktif & Fast Check-In'}
              {tab === 'walkin' && 'Input Pendaftaran Member Walk-In'}
              {tab === 'bays' && 'Real-Time Bay & Washing Monitoring'}
              {tab === 'members' && 'Database & Registrasi Member'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-gold" onClick={() => setQrScanModal(true)} style={{ fontSize: 12, padding: '10px 16px' }}>
              🔲 Scan Scanner QR
            </button>
            <button className="btn btn-dark" onClick={() => { setTab('walkin'); clearSearch(); }} style={{ fontSize: 12, padding: '10px 16px' }}>
              + Walk-In Baru
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Antrean Menunggu Check-In', value: queue.filter(r => r.status === 'confirmed').length, color: '#F2A900', icon: '🎫' },
            { label: 'Checked In / Sedang Cuci', value: queue.filter(r => ['checked_in', 'in_progress'].includes(r.status)).length, color: '#38BDF8', icon: '🚗' },
            { label: 'Selesai Hari Ini', value: today.length + 2, color: '#0EC278', icon: '✅' },
            { label: 'Bay Tersedia', value: `${fastBays.filter(b => b.status === 'available').length}/${fastBays.length}`, color: '#A855F7', icon: '⚡' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px', background: '#141417', border: '1px solid #28282F', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ color: s.color, fontSize: 22, fontWeight: 900 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#5C5C70', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TAB 1: QUEUE & FAST CHECK-IN ── */}
        {tab === 'queue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Fast Scan Box */}
            <div className="card-gold" style={{ padding: 22, background: 'linear-gradient(135deg, rgba(242,169,0,.1), rgba(20,20,23,.95))', border: '1px solid rgba(242,169,0,.3)', borderRadius: 16 }}>
              <div style={{ fontSize: 12, color: '#F2A900', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                🔲 Cari / Scan QR Code / Kode Pemesanan / Plat Nomor
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  ref={scanRef}
                  value={scan}
                  onChange={e => setScan(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan()}
                  className="input mono"
                  placeholder="Contoh: AURA-20260930-01 atau B 1888 AUR atau No. Antrean #1"
                  style={{ flex: 1, minWidth: 260, fontSize: 14 }}
                />
                <button className="btn btn-gold" onClick={handleScan} style={{ padding: '0 24px' }}>
                  🔍 Verifikasi Check-In
                </button>
              </div>

              {/* Scan result output */}
              {found && (
                <div style={{ marginTop: 18, padding: 18, borderRadius: 12, background: '#0D0D0F', border: '1px solid #F2A900' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase' }}>Kode Pemesanan</div>
                        <div className="mono" style={{ fontSize: 16, fontWeight: 900, color: '#F2A900' }}>{found.bookingCode}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase' }}>Pelanggan</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{found.customerName}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase' }}>Kendaraan</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8' }}>{found.vehicle} ({found.plate})</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase' }}>Layanan</div>
                        <div style={{ fontSize: 13, color: '#fff' }}>{found.serviceName}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase' }}>Status Saat Ini</div>
                        <span className="badge" style={{ background: `${STATUS_COLOR[found.status]}20`, color: STATUS_COLOR[found.status], border: `1px solid ${STATUS_COLOR[found.status]}40` }}>
                          {STATUS_LABEL[found.status]}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {found.status === 'confirmed' && (
                        <button className="btn btn-gold" onClick={() => handleCheckIn(found.id)}>
                          ✅ Masukkan Ke Bay (Check-In)
                        </button>
                      )}
                      {found.status === 'checked_in' && (
                        <button className="btn btn-gold" style={{ background: 'rgba(14,194,120,.2)', color: '#0EC278', border: '1px solid #0EC278' }} onClick={() => handleCheckOut(found.id)}>
                          🏁 Check-Out (Selesai)
                        </button>
                      )}
                      <button className="btn btn-ghost" onClick={() => setFound(null)}>✕ Tutup</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Queue Data Table */}
            <div className="card" style={{ padding: 24, background: '#141417', border: '1px solid #28282F' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 }}>Daftar Antrean & Status Kedatangan</h3>
                <span className="badge badge-gold">{queue.length} Antrean Aktif</span>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>No. Antrean</th>
                    <th>Kode Booking</th>
                    <th>Nama Pelanggan</th>
                    <th>Kendaraan & Plat</th>
                    <th>Paket Layanan</th>
                    <th>Jam Reservasi</th>
                    <th>Status</th>
                    <th>Aksi Gate</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: '#5C5C70', padding: '50px 0' }}>
                        Tidak ada antrean aktif saat ini. Pelanggan walk-in dapat didaftarkan di menu Walk-In.
                      </td>
                    </tr>
                  ) : (
                    queue.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 900, fontSize: 20, color: '#F2A900', fontFamily: 'monospace' }}>#{r.queueNumber}</td>
                        <td className="mono" style={{ color: '#38BDF8', fontWeight: 700, fontSize: 12 }}>{r.bookingCode}</td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.customerName}</div>
                          <div style={{ fontSize: 11, color: '#5C5C70' }}>{r.phone}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{r.vehicle}</div>
                          <div className="mono" style={{ fontSize: 11, color: '#F2A900' }}>{r.plate}</div>
                        </td>
                        <td style={{ fontSize: 13 }}>{r.serviceName}</td>
                        <td className="mono" style={{ fontSize: 12, color: '#A0A0B0' }}>{r.reservationTime || 'Walk-In'}</td>
                        <td>
                          <span className="badge" style={{ background: `${STATUS_COLOR[r.status]}18`, color: STATUS_COLOR[r.status], border: `1px solid ${STATUS_COLOR[r.status]}35` }}>
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
                              <button className="btn btn-ghost" style={{ fontSize: 11, padding: '6px 12px', color: '#0EC278' }} onClick={() => handleCheckOut(r.id)}>
                                🏁 Selesai
                              </button>
                            )}
                            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '6px 10px' }} onClick={() => setPrintedTicket(r)}>
                              🖨️ Tiket
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: WALK-IN REGISTRATION ── */}
        {tab === 'walkin' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: 24, alignItems: 'start' }}>
            
            {/* Form Pendaftaran Walk-In */}
            <div className="card" style={{ padding: 26, background: '#141417', border: '1px solid #28282F' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Registrasi Kendaraan Walk-In Baru</div>
              <p style={{ fontSize: 12, color: '#5C5C70', marginBottom: 20 }}>Daftarkan kendaraan langsung di pintu masuk dalam &lt; 30 detik</p>

              {/* Fast Member Lookup */}
              <div style={{ background: '#0D0D0F', padding: 16, borderRadius: 14, border: '1px solid #28282F', marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#F2A900', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>🔍 Cari Database Member Eksisting</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="input"
                    placeholder="Ketik Nama / No HP Member..."
                    style={{ fontSize: 12 }}
                  />
                  <button className="btn btn-gold" onClick={handleSearch} style={{ fontSize: 12 }}>Cari</button>
                  {searchQuery && <button className="btn btn-ghost" onClick={clearSearch} style={{ fontSize: 12 }}>Clear</button>}
                </div>

                {/* Search Results Dropdown */}
                {searchResults && searchResults.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {searchResults.map(m => (
                      <div
                        key={m.id}
                        onClick={() => selectMember(m)}
                        style={{
                          padding: '10px 14px', background: '#141417', borderRadius: 10, border: '1px solid #28282F',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{m.name} ({m.memberId})</div>
                          <div style={{ fontSize: 11, color: '#5C5C70' }}>{m.phone} · {m.vehicle} ({m.plate})</div>
                        </div>
                        <span className="badge badge-gold" style={{ fontSize: 10 }}>Pilih Member</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Registration Form */}
              <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Nama Lengkap Pelanggan</label>
                    <input className="input" required value={wiForm.name} onChange={e => setWiForm({ ...wiForm, name: e.target.value })} placeholder="Budi Santoso" />
                  </div>
                  <div>
                    <label className="label">Nomor WhatsApp</label>
                    <input className="input" required value={wiForm.phone} onChange={e => setWiForm({ ...wiForm, phone: e.target.value })} placeholder="0812xxxxxxxx" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Model & Merk Kendaraan</label>
                    <input className="input" required value={wiForm.vehicle} onChange={e => setWiForm({ ...wiForm, vehicle: e.target.value })} placeholder="BMW X5 / Honda HR-V" />
                  </div>
                  <div>
                    <label className="label">Plat Nomor</label>
                    <input className="input mono uppercase" required value={wiForm.plate} onChange={e => setWiForm({ ...wiForm, plate: e.target.value.toUpperCase() })} placeholder="B 1234 ABC" />
                  </div>
                </div>

                {/* Service Choice */}
                <div>
                  <label className="label">Pilih Paket Layanan</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {WALK_SERVICES.map(svc => (
                      <div
                        key={svc.id}
                        onClick={() => setWiForm({ ...wiForm, service: svc.id })}
                        style={{
                          padding: 14, borderRadius: 12, cursor: 'pointer',
                          background: wiForm.service === svc.id ? 'rgba(242,169,0,.1)' : '#0D0D0F',
                          border: `1px solid ${wiForm.service === svc.id ? '#F2A900' : '#28282F'}`,
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{svc.emoji}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: wiForm.service === svc.id ? '#F2A900' : '#fff' }}>{svc.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variant Choice */}
                <div>
                  <label className="label">Ukuran / Variant Kendaraan</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {currentSvc.variants.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setWiForm({ ...wiForm, variant: v.id })}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid', cursor: 'pointer',
                          borderColor: wiForm.variant === v.id ? '#F2A900' : '#28282F',
                          background: wiForm.variant === v.id ? 'rgba(242,169,0,.15)' : 'transparent',
                          color: wiForm.variant === v.id ? '#F2A900' : '#A0A0B0',
                          fontWeight: 700, fontSize: 12,
                        }}
                      >
                        {v.label}<br />
                        <span style={{ fontSize: 11, fontWeight: 900 }}>{G(v.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="label">Metode Pembayaran Onsite</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setWiForm({ ...wiForm, payMethod: 'qris' })}
                      style={{
                        padding: 12, borderRadius: 10, border: '1px solid', cursor: 'pointer',
                        borderColor: wiForm.payMethod === 'qris' ? '#38BDF8' : '#28282F',
                        background: wiForm.payMethod === 'qris' ? 'rgba(56,189,248,.12)' : '#0D0D0F',
                        color: wiForm.payMethod === 'qris' ? '#38BDF8' : '#A0A0B0',
                        fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                      }}
                    >
                      📱 QRIS Dinamis (Welcomer)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWiForm({ ...wiForm, payMethod: 'cash' })}
                      style={{
                        padding: 12, borderRadius: 10, border: '1px solid', cursor: 'pointer',
                        borderColor: wiForm.payMethod === 'cash' ? '#0EC278' : '#28282F',
                        background: wiForm.payMethod === 'cash' ? 'rgba(14,194,120,.12)' : '#0D0D0F',
                        color: wiForm.payMethod === 'cash' ? '#0EC278' : '#A0A0B0',
                        fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                      }}
                    >
                      💵 Tunai (Bayar Di Kasir POS)
                    </button>
                  </div>
                </div>

                <button className="btn btn-gold" type="submit" style={{ padding: '14px 0', fontSize: 14, justifyContent: 'center', marginTop: 10 }}>
                  🚀 Terbitkan Tiket & Masukkan Ke Antrean
                </button>
              </form>
            </div>

            {/* Summary Preview Box */}
            <div className="card" style={{ padding: 24, background: '#141417', border: '1px solid #28282F', position: 'sticky', top: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #28282F' }}>
                📋 Ringkasan Tiket Walk-In
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#5C5C70' }}>Nama Pelanggan</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{wiForm.name || '–'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#5C5C70' }}>Kendaraan</span>
                  <span style={{ fontWeight: 700, color: '#38BDF8' }}>{wiForm.vehicle || '–'} ({wiForm.plate || '–'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#5C5C70' }}>Paket Cuci</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{currentSvc.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#5C5C70' }}>Ukuran Variant</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{currentVrnt.label}</span>
                </div>
                <div style={{ height: 1, background: '#28282F', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900 }}>
                  <span>TOTAL ESTIMASI</span>
                  <span style={{ color: '#F2A900' }}>{G(currentVrnt.price)}</span>
                </div>
              </div>

              <button className="btn btn-ghost" onClick={() => setAddMemberPanel(true)} style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                + Daftarkan Sebagai Member Baru
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: BAY MONITORING ── */}
        {tab === 'bays' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              
              {/* Fast Clean Bays */}
              <div className="card" style={{ padding: 24, background: '#141417', border: '1px solid #28282F' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #28282F' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    ⚡ Fast Clean Express Bays (Drive-Through)
                  </h3>
                  <span className="badge badge-emerald">Pelanggan di Dalam Mobil</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {fastBays.map(bay => (
                    <div key={bay.id} style={{ background: '#0D0D0F', padding: 18, borderRadius: 14, border: '1px solid #28282F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{bay.name}</div>
                        <div style={{ fontSize: 12, color: '#5C5C70', marginTop: 4 }}>
                          {bay.car ? `🚗 ${bay.car}` : 'Bay Kosong & Ready'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFastBays(prev => prev.map(b => b.id === bay.id ? { ...b, status: b.status === 'occupied' ? 'available' : 'occupied', car: b.status === 'occupied' ? null : 'Walk-In Customer' } : b));
                        }}
                        className={`badge ${bay.status === 'occupied' ? 'badge-gold' : 'badge-emerald'}`}
                        style={{ cursor: 'pointer', fontSize: 11, padding: '6px 14px' }}
                      >
                        {bay.status === 'occupied' ? 'Sedang Dicuci (Terisi)' : '✓ Ready / Tersedia'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Detailing Bays */}
              <div className="card" style={{ padding: 24, background: '#141417', border: '1px solid #28282F' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #28282F' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    ✦ Premium Detailing Bays & VIP Lounge
                  </h3>
                  <span className="badge badge-gold">Video Live Stream Active</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {detailingBays.map(bay => (
                    <div key={bay.id} style={{ background: '#0D0D0F', padding: 18, borderRadius: 14, border: '1px solid #28282F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{bay.name}</div>
                        <div style={{ fontSize: 12, color: '#5C5C70', marginTop: 4 }}>
                          {bay.car ? `🏎️ ${bay.car}` : 'Lounge Bay Kosong'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDetailingBays(prev => prev.map(b => b.id === bay.id ? { ...b, status: b.status === 'occupied' ? 'available' : 'occupied', car: b.status === 'occupied' ? null : 'VIP Member Customer' } : b));
                        }}
                        className={`badge ${bay.status === 'occupied' ? 'badge-gold' : 'badge-emerald'}`}
                        style={{ cursor: 'pointer', fontSize: 11, padding: '6px 14px' }}
                      >
                        {bay.status === 'occupied' ? 'Pengerjaan Detailing' : '✓ Ready / Tersedia'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: DATABASE MEMBER ── */}
        {tab === 'members' && (
          <div className="card" style={{ padding: 24, background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>Database Member AURA Auto Care</h3>
                <p style={{ fontSize: 12, color: '#5C5C70', margin: 0 }}>Pilih member untuk pengisian otomatis form walk-in</p>
              </div>
              <button className="btn btn-gold" onClick={() => setAddMemberPanel(true)}>
                + Tambah Member Baru
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Member</th>
                  <th>Nama Lengkap</th>
                  <th>No. WhatsApp</th>
                  <th>Kendaraan</th>
                  <th>Plat Nomor</th>
                  <th>Tier & Poin</th>
                  <th>Total Kunjungan</th>
                  <th>Aksi Direct Walk-In</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td className="mono" style={{ color: '#F2A900', fontWeight: 800 }}>{m.memberId}</td>
                    <td style={{ fontWeight: 800, color: '#fff' }}>{m.name}</td>
                    <td style={{ fontSize: 12, color: '#A0A0B0' }}>{m.phone}</td>
                    <td style={{ fontSize: 13 }}>{m.vehicle}</td>
                    <td className="mono" style={{ fontSize: 12, color: '#38BDF8', fontWeight: 700 }}>{m.plate}</td>
                    <td>
                      <span className="badge badge-gold" style={{ fontSize: 10 }}>{m.tier} ({m.points} pts)</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{m.totalVisits}x</td>
                    <td>
                      <button
                        className="btn btn-gold"
                        style={{ fontSize: 11, padding: '6px 12px' }}
                        onClick={() => {
                          selectMember(m);
                          setTab('walkin');
                        }}
                      >
                        ⚡ Input Walk-In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* ── MODALS & DIALOGS ── */}

      {/* Modal QR Code Scanner Simulator */}
      {qrScanModal && (
        <div className="modal-overlay" onClick={() => setQrScanModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 420, width: '100%', background: '#141417', border: '1px solid #28282F', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#F2A900', marginBottom: 8 }}>🔲 Scanner QR Code Ticket</div>
            <p style={{ fontSize: 12, color: '#5C5C70', marginBottom: 20 }}>Arahkan kamera tablet ke barcode tiket pelanggan atau masukkan kode pemesanan manual.</p>
            
            <div style={{ padding: 28, border: '2px dashed #F2A900', borderRadius: 16, background: '#0D0D0F', marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
              <div style={{ fontSize: 11, color: '#A0A0B0' }}>Kamera Scanner Welcomer Active...</div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: 16 }}>
              <label className="label">Ketik Kode Booking Manual</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="scannerInput"
                  className="input mono uppercase"
                  placeholder="AURA-20260930-01"
                  style={{ fontSize: 13 }}
                />
                <button
                  className="btn btn-gold"
                  onClick={() => {
                    const val = document.getElementById('scannerInput').value;
                    setScan(val);
                    setQrScanModal(false);
                    setTimeout(handleScan, 50);
                  }}
                >
                  Verifikasi
                </button>
              </div>
            </div>

            <button className="btn btn-ghost" onClick={() => setQrScanModal(false)} style={{ width: '100%', justifyContent: 'center' }}>Tutup</button>
          </div>
        </div>
      )}

      {/* Modal QRIS Payment at Welcomer */}
      {qrisModal && pendingWalkInData && (
        <div className="modal-overlay" onClick={() => setQrisModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 400, width: '100%', background: '#141417', border: '1px solid #28282F', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#38BDF8', marginBottom: 4 }}>📱 Bayar Langsung QRIS</div>
            <div style={{ fontSize: 12, color: '#5C5C70', marginBottom: 16 }}>Pendaftaran Walk-In · {pendingWalkInData.name}</div>
            
            <div style={{ background: '#fff', padding: 16, borderRadius: 14, display: 'inline-block', marginBottom: 16 }}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AURA-WALKIN-PAYMENT" alt="QRIS" style={{ width: 160, height: 160 }} />
            </div>

            <div style={{ fontSize: 20, fontWeight: 900, color: '#F2A900', marginBottom: 16 }}>
              {G(pendingWalkInData.price)}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setQrisModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
              <button className="btn btn-gold" onClick={handleConfirmQrisWalkIn} style={{ flex: 1, justifyContent: 'center' }}>✅ Konfirmasi Lunas</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notification Simulation WhatsApp */}
      {waModal && waData && (
        <div className="modal-overlay" onClick={() => setWaModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 26, maxWidth: 440, width: '100%', background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0EC278', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              💬 Tiket WhatsApp Terkirim ke Pelanggan
            </div>
            <div style={{ background: '#0D0D0F', padding: 16, borderRadius: 12, border: '1px solid #28282F', fontSize: 12, lineHeight: 1.7, color: '#A0A0B0', whiteSpace: 'pre-line' }}>
              {`Halo ${waData.customerName}! Selamat datang di AURA Auto Care.

Tiket Walk-In Anda telah terbit:
• Kode Booking: ${waData.bookingCode}
• No. Antrean: #${waData.queueNumber}
• Kendaraan: ${waData.vehicle}
• Paket: ${waData.serviceName}
• Total: ${G(waData.price)} (${waData.payMethod})

Silakan tunggu di VIP Lounge selama kendaraan Anda dikerjakan.`}
            </div>
            <button className="btn btn-gold" onClick={() => setWaModal(false)} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Add Member Panel */}
      {addMemberPanel && (
        <div className="modal-overlay" onClick={() => setAddMemberPanel(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 26, maxWidth: 480, width: '100%', background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #28282F' }}>
              + Daftarkan Member Baru AURA
            </div>
            <form onSubmit={handleRegisterMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Nama Lengkap</label>
                <input className="input" required value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="Ahmad Subagyo" />
              </div>
              <div>
                <label className="label">Nomor WhatsApp</label>
                <input className="input" required value={newMember.phone} onChange={e => setNewMember({ ...newMember, phone: e.target.value })} placeholder="08123456789" />
              </div>
              <div>
                <label className="label">Plat Nomor</label>
                <input className="input mono uppercase" required value={newMember.plate} onChange={e => setNewMember({ ...newMember, plate: e.target.value.toUpperCase() })} placeholder="B 8888 AUR" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Model Kendaraan</label>
                <input className="input" required value={newMember.vehicle} onChange={e => setNewMember({ ...newMember, vehicle: e.target.value })} placeholder="Mercedes Benz C200" />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setAddMemberPanel(false)} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }}>Simpan & Gunakan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Ticket Receipt Modal */}
      {printedTicket && (
        <div className="modal-overlay" onClick={() => setPrintedTicket(null)}>
          <div className="printable card" onClick={e => e.stopPropagation()} style={{ padding: 26, maxWidth: 360, width: '100%', background: '#141417', border: '1px solid #28282F', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#F2A900' }}>AURA AUTO CARE</div>
            <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase', letterSpacing: '.1em' }}>Gateway Ticket Console</div>
            <div style={{ height: 1, background: '#28282F', margin: '14px 0' }} />
            
            <div style={{ fontSize: 36, fontWeight: 900, color: '#F2A900', fontFamily: 'monospace' }}>#{printedTicket.queueNumber}</div>
            <div className="mono" style={{ fontSize: 12, color: '#38BDF8', fontWeight: 700, marginBottom: 12 }}>{printedTicket.bookingCode}</div>

            <div style={{ textAlign: 'left', background: '#0D0D0F', padding: 14, borderRadius: 10, border: '1px solid #28282F', fontSize: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#5C5C70' }}>Pelanggan</span>
                <span style={{ fontWeight: 700 }}>{printedTicket.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#5C5C70' }}>Kendaraan</span>
                <span style={{ fontWeight: 700, color: '#38BDF8' }}>{printedTicket.vehicle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#5C5C70' }}>Plat Nomor</span>
                <span style={{ fontWeight: 700, color: '#F2A900' }}>{printedTicket.plate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#5C5C70' }}>Layanan</span>
                <span style={{ fontWeight: 700 }}>{printedTicket.serviceName}</span>
              </div>
            </div>

            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { window.print(); setPrintedTicket(null); }}>
              🖨️ Cetak Tiket Gate
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default WelcomerDashboard;
