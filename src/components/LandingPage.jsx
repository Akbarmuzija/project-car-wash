import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';

export const LandingPage = ({ onLoginSuccess }) => {
  const { members, registerMember, loginUser, showToast } = useCarWash();
  const [authModal, setAuthModal] = useState(false); // false | 'login' | 'register'
  
  // Login Form State
  const [loginInput, setLoginInput] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register Form State
  const [regForm, setRegForm] = useState({
    name: '', phone: '', vehicle: '', plate: '', username: '', password: '123456'
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const query = loginInput.trim().toLowerCase();
    const found = members.find(m => 
      m.username?.toLowerCase() === query || 
      m.phone.replace(/\D/g,'') === query.replace(/\D/g,'') ||
      m.name.toLowerCase().includes(query)
    );

    if (found) {
      if (loginPass && loginPass !== (found.password || '123456')) {
        showToast('Password salah! Template default: 123456', 'error');
        return;
      }
      loginUser('pelanggan', found);
      setAuthModal(false);
      if (onLoginSuccess) onLoginSuccess();
    } else {
      showToast('Akun tidak ditemukan. Silakan daftarkan akun member baru!', 'warning');
      setAuthModal('register');
    }
  };

  const handleQuickDemoLogin = (memberData) => {
    loginUser('pelanggan', memberData);
    setAuthModal(false);
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newM = registerMember(regForm);
    loginUser('pelanggan', newM);
    setAuthModal(false);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div style={{ background: '#0D0D0F', color: '#fff', minHeight: '100vh' }}>
      
      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden', padding: '80px 20px 100px',
        background: 'radial-gradient(circle at 50% 20%, rgba(242,169,0,.15) 0%, transparent 60%), linear-gradient(180deg, #141417 0%, #0D0D0F 100%)',
        borderBottom: '1px solid #28282F', textAlign: 'center',
      }}>
        {/* Glow backdrop circles */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,169,0,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span className="badge badge-gold" style={{ fontSize: 12, padding: '6px 14px', marginBottom: 20, display: 'inline-block', letterSpacing: '.08em' }}>
            ✦ THE ULTIMATE CAR CARE EXPERIENCE
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 20 }}>
            Presisi Detailing &amp; Cuci Mobil Premium <span style={{ color: '#F2A900' }}>Tanpa Antre</span>
          </h1>
          <p style={{ fontSize: 16, color: '#A0A0B0', maxWidth: 680, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Nikmati reservasi online eksklusif, dokumentasi video pengerjaan Before-After, ruang tunggu VIP Lounge, serta loyalty rewards untuk segmen menengah ke atas.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            <button className="btn btn-gold" style={{ padding: '14px 28px', fontSize: 15 }} onClick={() => setAuthModal('login')}>
              🔑 Login Member &amp; Booking
            </button>
            <button className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: 15 }} onClick={() => setAuthModal('register')}>
              ✨ Daftar Member Baru (+50 Pts)
            </button>
            <button className="btn btn-ghost" style={{ padding: '14px 24px', fontSize: 14, color: '#0EC278', border: '1px solid rgba(14,194,120,.3)' }} onClick={() => handleQuickDemoLogin(members[0])}>
              ⚡ 1-Click Demo Login ({members[0].name})
            </button>
          </div>
        </div>
      </section>

      {/* ── SERVICE HIGHLIGHTS ────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="tag">LAYANAN UNGGULAN</span>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>Pilihan Paket Perawatan Kendaraan</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Fast Clean */}
          <div className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
            <span className="badge badge-blue" style={{ marginBottom: 12, display: 'inline-block' }}>15 - 20 MENIT</span>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Fast Clean Express</h3>
            <p style={{ fontSize: 13, color: '#A0A0B0', lineHeight: 1.6, marginBottom: 20 }}>
              Drive-through express bay modern tanpa perlu turun dari mobil. Sangat cocok untuk perawatan rutin berkala harian.
            </p>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#38BDF8', marginBottom: 20 }}>Mulai Rp 65.000</div>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAuthModal('login')}>
              Pesan Fast Clean →
            </button>
          </div>

          {/* Premium Clean */}
          <div className="card-gold" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-gold">45 - 60 MENIT</span>
              <span className="badge badge-gold">VIDEO DOCS 🎥</span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Premium Clean &amp; Detailing</h3>
            <p style={{ fontSize: 13, color: '#A0A0B0', lineHeight: 1.6, marginBottom: 20 }}>
              Pengalaman detailing menyeluruh dengan akses VIP Lounge, interior sanitasi ozone, wax coating, dan rekaman video Before-After.
            </p>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#F2A900', marginBottom: 20 }}>Mulai Rp 200.000</div>
            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAuthModal('login')}>
              Pesan Premium Clean →
            </button>
          </div>

          {/* Autocare Store */}
          <div className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🛒</div>
            <span className="badge badge-gold" style={{ marginBottom: 12, display: 'inline-block' }}>STORE &amp; MERCHANDISE</span>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>AURA Autocare Store</h3>
            <p style={{ fontSize: 13, color: '#A0A0B0', lineHeight: 1.6, marginBottom: 20 }}>
              Beli produk perawatan bodi mobil kualitas premium (Detailer Spray, Leather Conditioner) dan Official Apparel Merchandise.
            </p>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 20 }}>Katalog Lengkap</div>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAuthModal('login')}>
              Jelajahi Store →
            </button>
          </div>
        </div>
      </section>

      {/* ── MEMBER DEMO CARDS ──────────────────────────────────────────── */}
      <section style={{ background: '#141417', borderTop: '1px solid #28282F', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span className="tag">UJI COBA DEMO CEPAT</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 6, marginBottom: 24 }}>Pilih Akun Demo Pelanggan untuk Login Instan</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {members.map(m => (
              <div key={m.id} onClick={() => handleQuickDemoLogin(m)} style={{
                background: '#0D0D0F', border: '1px solid #28282F', borderRadius: 12, padding: 16,
                cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#F2A900'; e.currentTarget.style.background = '#1a1500'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#28282F'; e.currentTarget.style.background = '#0D0D0F'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{m.name}</span>
                  <span className="badge badge-gold" style={{ fontSize: 9 }}>{m.tier}</span>
                </div>
                <div style={{ fontSize: 11, color: '#A0A0B0', marginBottom: 4 }}>🚗 {m.vehicle}</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#F2A900' }}>User: {m.username}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTH MODAL ────────────────────────────────────────────────── */}
      {authModal && (
        <div className="modal-overlay" onClick={() => setAuthModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 440, width: '100%' }}>
            
            {/* Modal Tab Switcher */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #28282F', paddingBottom: 10 }}>
              <button onClick={() => setAuthModal('login')} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: authModal === 'login' ? 800 : 500,
                color: authModal === 'login' ? '#F2A900' : '#5C5C70',
              }}>
                🔑 Login Member
              </button>
              <button onClick={() => setAuthModal('register')} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: authModal === 'register' ? 800 : 500,
                color: authModal === 'register' ? '#F2A900' : '#5C5C70',
              }}>
                ✨ Daftar Baru
              </button>
            </div>

            {authModal === 'login' ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Username / No. WhatsApp *</label>
                  <input className="input" placeholder="cth. budi.santoso / 081299887766"
                    value={loginInput} onChange={e => setLoginInput(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Password (Default: 123456)</label>
                  <input type="password" className="input mono" placeholder="123456"
                    value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-gold" style={{ justifyContent: 'center', padding: '12px 0', fontSize: 14 }}>
                  Masuk ke Akun Member →
                </button>

                <div style={{ height: 1, background: '#28282F', margin: '8px 0' }} />
                <div style={{ fontSize: 11, color: '#5C5C70', textAlign: 'center' }}>
                  Atau gunakan tombol 1-Click Demo Login di halaman utama.
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Nama Lengkap *</label>
                  <input className="input" placeholder="cth. Andika Pratama"
                    value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value, username: e.target.value.toLowerCase().replace(/\s+/g, '.') })} required />
                </div>
                <div>
                  <label className="label">No. WhatsApp *</label>
                  <input className="input" placeholder="08123456789"
                    value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Jenis Kendaraan *</label>
                  <input className="input" placeholder="cth. BMW 3 Series"
                    value={regForm.vehicle} onChange={e => setRegForm({ ...regForm, vehicle: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Plat Nomor *</label>
                  <input className="input mono" placeholder="cth. B 1234 ABC"
                    value={regForm.plate} onChange={e => setRegForm({ ...regForm, plate: e.target.value.toUpperCase() })} required />
                </div>
                <div>
                  <label className="label">Username *</label>
                  <input className="input mono" placeholder="andika.pratama"
                    value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value.toLowerCase() })} required />
                </div>

                <div style={{ gridColumn: '1/-1', marginTop: 6 }}>
                  <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}>
                    ✨ Registrasi &amp; Masuk Dashboard
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
