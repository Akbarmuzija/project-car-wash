import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';

export const LandingPage = ({ onLoginSuccess }) => {
  const { members, registerMember, loginUser, reservations, selectedBranch, setSelectedBranch, showToast } = useCarWash();
  const [authModal, setAuthModal] = useState(false); // false | 'login' | 'register'
  const [activeNav, setActiveNav] = useState('home');
  
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

  const scrollToSection = (id) => {
    setActiveNav(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Branch live queue calculation
  const branchQueues = [
    { name: 'Senopati Flagship', activeCount: reservations.filter(r => r.branch === 'senopati' && r.status !== 'completed').length + 2, status: 'Open', lane: 'Fastest Lane' },
    { name: 'BSD City',          activeCount: reservations.filter(r => r.branch === 'bsd_city' && r.status !== 'completed').length + 1, status: 'Open', lane: 'Express Lane' },
    { name: 'Surabaya Barat',    activeCount: reservations.filter(r => r.branch === 'surabaya_west' && r.status !== 'completed').length + 3, status: 'Open', lane: 'Standard' },
    { name: 'Gading Serpong',    activeCount: 1, status: 'Open', lane: 'Fast Lane' },
    { name: 'Kemang Auto Lounge',activeCount: 2, status: 'Open', lane: 'VIP Bay' },
  ];

  return (
    <div style={{ background: '#0D0D0F', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ── LANDING PAGE HEADER NAV ──────────────────────────────────────── */}
      <nav style={{
        background: 'rgba(13,13,15,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #28282F',
        padding: '12px 24px',
        position: 'sticky', top: 60, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1280, margin: '0 auto',
      }}>
        {/* Brand logo in landing header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => scrollToSection('home')}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #F2A900, #C98B00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: '#0D0D0F',
          }}>A</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
            AURA <span style={{ color: '#F2A900' }}>Xpress</span>
          </div>
        </div>

        {/* Center menu links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'home',          label: 'Home' },
            { id: 'story',         label: 'Our Story' },
            { id: 'locations',     label: 'Locations' },
            { id: 'gallery',       label: 'Gallery' },
            { id: 'pricing',       label: 'Pricing' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'live-queue',    label: 'Live Queue' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: activeNav === item.id ? 700 : 500,
                color: activeNav === item.id ? '#F2A900' : '#A0A0B0',
                transition: 'all .15s',
                padding: '4px 0',
              }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* Right action button */}
        <button
          onClick={() => setAuthModal('login')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px', borderRadius: 24,
            background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 16px rgba(168,85,247,.3)',
            transition: 'transform .15s, boxShadow .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span>➔</span>
          <span>Customer Login</span>
        </button>
      </nav>

      {/* ── HERO SECTION (Matching Cuci Xpress Layout) ────────────────────── */}
      <section id="home" style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 40, alignItems: 'center' }}>
          
          {/* LEFT HERO COLUMN */}
          <div>
            <h1 style={{
              fontSize: 'clamp(40px, 5.5vw, 64px)',
              fontWeight: 900,
              letterSpacing: '-.03em',
              lineHeight: 1.05,
              marginBottom: 24,
              color: '#fff',
            }}>
              Drive in.<br />
              Drive out.<br />
              <span style={{
                background: 'linear-gradient(135deg, #A855F7 0%, #C084FC 40%, #F2A900 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Sparkling clean.</span>
            </h1>

            <p style={{
              fontSize: 15, color: '#A0A0B0', lineHeight: 1.65,
              maxWidth: 520, marginBottom: 32,
            }}>
              AURA Luxury Auto Care provides fast, consistent drive-thru car washes focused on convenience, reliability, and customer satisfaction. Our mission — Building time-saving services that help move your journey forward.
            </p>

            {/* TWO PRIMARY CTA BUTTONS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
              <button
                onClick={() => scrollToSection('locations')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 28px', borderRadius: 14,
                  background: '#8B5CF6',
                  color: '#fff',
                  border: '2px solid #000',
                  boxShadow: '4px 4px 0px #000',
                  fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px #000'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px #000'; }}
              >
                <span>Find Our Locations</span>
                <span style={{ fontSize: 16 }}>→</span>
              </button>

              <button
                onClick={() => setAuthModal('login')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 28px', borderRadius: 14,
                  background: '#F2A900',
                  color: '#0D0D0F',
                  border: '2px solid #000',
                  boxShadow: '4px 4px 0px #000',
                  fontSize: 15, fontWeight: 900, cursor: 'pointer',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px #000'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0px #000'; }}
              >
                <span>Login or Register</span>
                <span style={{ fontSize: 16 }}>→</span>
              </button>
            </div>

            {/* REVIEWS & SOCIAL PROOF */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Avatars */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[
                  { text: 'KA', bg: '#A855F7' },
                  { text: 'FY', bg: '#F2A900' },
                  { text: 'IC', bg: '#0EC278' },
                  { text: '+60', bg: '#38BDF8' },
                ].map((av, idx) => (
                  <div key={idx} style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: av.bg, color: '#0D0D0F',
                    fontSize: 11, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #0D0D0F',
                    marginLeft: idx > 0 ? -10 : 0,
                  }}>
                    {av.text}
                  </div>
                ))}
              </div>

              {/* Rating text */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#F2A900', fontSize: 13 }}>⭐⭐⭐⭐⭐</span>
                  <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>4.7</span>
                </div>
                <div style={{ fontSize: 11, color: '#A0A0B0' }}>63 Google Reviews</div>
              </div>
            </div>
          </div>

          {/* RIGHT LIVE QUEUE CARD WIDGET */}
          <div>
            <div style={{
              background: '#141417',
              border: '2px solid #28282F',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,.5), 6px 6px 0px #000',
              position: 'relative',
            }}>
              {/* Card top bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#0EC278' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0EC278', boxShadow: '0 0 8px #0EC278', display: 'inline-block' }} />
                  <span>LIVE • 11:30</span>
                </div>
                <div style={{
                  background: '#0D0D0F', border: '1px solid #28282F', borderRadius: 20,
                  padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#38BDF8',
                }}>
                  Fastest lane • Senopati • open now
                </div>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#fff' }}>
                Queue across all branches
              </h3>

              {/* Branch queue list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {branchQueues.map(b => (
                  <div key={b.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E0E0E0', width: 120 }}>{b.name}</span>
                    
                    {/* Status bar */}
                    <div style={{ flex: 1, height: 8, background: '#28282F', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(b.activeCount * 20, 90)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #0EC278, #38BDF8)',
                        borderRadius: 4,
                      }} />
                    </div>

                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0EC278', width: 45, textAlign: 'right' }}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 16, borderTop: '1px solid #28282F', fontSize: 12,
              }}>
                <span style={{ color: '#0EC278', fontWeight: 600 }}>All quiet — drive in any branch</span>
                <button
                  onClick={() => scrollToSection('live-queue')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#A855F7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>See live queue</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── OUR STORY / MISSION SECTION ──────────────────────────────────── */}
      <section id="story" style={{ background: '#141417', borderTop: '1px solid #28282F', borderBottom: '1px solid #28282F', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-gold" style={{ fontSize: 11, marginBottom: 12, display: 'inline-block' }}>OUR STORY &amp; MISSION</span>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 20 }}>Reinventing the Drive-Thru Car Care Experience</h2>
          <p style={{ fontSize: 15, color: '#A0A0B0', lineHeight: 1.7, maxWidth: 780, margin: '0 auto 48px' }}>
            Berdiri sejak tahun 2024, AURA Luxury Auto Care memadukan kecepatan teknologi drive-through modern dengan presisi detailing tangan profesional. Kami menghadirkan standar pencucian hemat waktu tanpa mengorbankan kualitas kilau kendaraan Anda.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '⚡', title: 'Speed & Consistency', desc: 'Sistem cuci otomatis 15-20 menit dengan air terfilterisasi dan sampo PH-balanced.' },
              { icon: '🌱', title: 'Eco-Friendly Tech', desc: 'Mendaur ulang 85% penggunaan air dan menggunakan bahan pembersih ramah lingkungan.' },
              { icon: '👑', title: 'VIP Lounge Experience', desc: 'Nikmati specialty coffee & high-speed Wi-Fi gratis saat mobil Anda dipoles di detailing bay.' }
            ].map((card, i) => (
              <div key={i} className="card" style={{ padding: 28, textAlign: 'left' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{card.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: '#A0A0B0', lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATIONS SECTION ────────────────────────────────────────────── */}
      <section id="locations" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="badge badge-gold" style={{ fontSize: 11, marginBottom: 12, display: 'inline-block' }}>OUR BRANCH NETWORK</span>
          <h2 style={{ fontSize: 32, fontWeight: 900 }}>Cabang Resmi AURA Auto Care</h2>
          <p style={{ fontSize: 14, color: '#A0A0B0', marginTop: 6 }}>Pilih cabang terdekat untuk reservasi atau langsung datang</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {[
            { id: 'senopati',     name: 'Senopati Flagship Bay', addr: 'Jl. Senopati No. 88, Jakarta Selatan', time: '08:00 - 21:00 WIB', phone: '+62 812-9988-7766' },
            { id: 'bsd_city',     name: 'BSD City Tech Park',   addr: 'Kawasan Green Office Park, BSD City', time: '08:00 - 21:00 WIB', phone: '+62 813-8877-6655' },
            { id: 'surabaya_west',name: 'Surabaya Barat Hub',   addr: 'Jl. HR Muhammad No. 42, Surabaya',    time: '08:00 - 21:00 WIB', phone: '+62 811-7766-5544' },
          ].map(loc => (
            <div key={loc.id} className="card" style={{ padding: 28, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>📍</span>
                <span className="badge badge-gold" style={{ fontSize: 10 }}>OPEN NOW</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{loc.name}</h3>
              <p style={{ fontSize: 13, color: '#A0A0B0', marginBottom: 12 }}>{loc.addr}</p>
              <div style={{ fontSize: 12, color: '#5C5C70', marginBottom: 4 }}>🕒 {loc.time}</div>
              <div style={{ fontSize: 12, color: '#5C5C70', marginBottom: 20 }}>📞 {loc.phone}</div>
              <button
                className="btn btn-gold"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setSelectedBranch(loc.id); setAuthModal('login'); }}>
                Pesan di Cabang Ini →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING SECTION ──────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: '#141417', borderTop: '1px solid #28282F', borderBottom: '1px solid #28282F', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-gold" style={{ fontSize: 11, marginBottom: 12, display: 'inline-block' }}>PAKET &amp; HARGA</span>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 48 }}>Pilihan Layanan Cuci &amp; Detailing</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
            {/* Fast Clean */}
            <div className="card" style={{ padding: 36, textAlign: 'left', border: '1px solid #28282F' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
              <span className="badge badge-blue" style={{ marginBottom: 12, display: 'inline-block' }}>15 - 20 MENIT</span>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Fast Clean Express</h3>
              <p style={{ fontSize: 13, color: '#A0A0B0', marginBottom: 20 }}>Drive-through express bay modern tanpa turun dari mobil.</p>
              
              <div style={{ fontSize: 32, fontWeight: 900, color: '#38BDF8', marginBottom: 20 }}>
                Rp 65.000 <span style={{ fontSize: 13, color: '#5C5C70', fontWeight: 500 }}>/ mobil</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, fontSize: 13, color: '#A0A0B0' }}>
                <li>✓ Touchless foam wash &amp; high pressure rinse</li>
                <li>✓ Deep gloss tire dressing</li>
                <li>✓ Air freshener spray gratis</li>
                <li>✓ Tetap di dalam mobil saat pencucian</li>
              </ul>

              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAuthModal('login')}>
                Pesan Fast Clean Sekarang
              </button>
            </div>

            {/* Premium Clean */}
            <div className="card-gold" style={{ padding: 36, textAlign: 'left', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <span className="badge badge-gold">MOST POPULAR ✦</span>
              </div>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
              <span className="badge badge-gold" style={{ marginBottom: 12, display: 'inline-block' }}>45 - 60 MENIT</span>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Premium Clean &amp; Detailing</h3>
              <p style={{ fontSize: 13, color: '#A0A0B0', marginBottom: 20 }}>Pengalaman detailing menyeluruh dengan akses VIP Lounge.</p>

              <div style={{ fontSize: 32, fontWeight: 900, color: '#F2A900', marginBottom: 20 }}>
                Rp 200.000 <span style={{ fontSize: 13, color: '#5C5C70', fontWeight: 500 }}>/ mobil</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, fontSize: 13, color: '#A0A0B0' }}>
                <li>✓ Akses Lounge VIP + Signature Drink</li>
                <li>✓ Vacuum interior komplit &amp; sanitasi ozone</li>
                <li>✓ Ceramic hydrophobic wax coating</li>
                <li>✓ 🎥 Video dokumentasi Before &amp; After HD</li>
              </ul>

              <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAuthModal('login')}>
                Pesan Premium Clean Sekarang
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE QUEUE SECTION ───────────────────────────────────────────── */}
      <section id="live-queue" style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <span className="badge badge-gold" style={{ fontSize: 11, marginBottom: 12, display: 'inline-block' }}>REAL-TIME MONITORING</span>
        <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Status Antrean Aktif Hari Ini</h2>
        <p style={{ fontSize: 14, color: '#A0A0B0', marginBottom: 40 }}>Pantau kepadatan jalur di setiap cabang secara langsung</p>

        <div className="card" style={{ padding: 28, textOverflow: 'ellipsis' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {branchQueues.map(b => (
              <div key={b.name} style={{ background: '#0D0D0F', border: '1px solid #28282F', borderRadius: 12, padding: 18, textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: '#5C5C70', fontWeight: 700 }}>{b.lane}</div>
                <div style={{ fontSize: 15, fontWeight: 800, margin: '4px 0 10px', color: '#fff' }}>{b.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#0EC278', fontWeight: 700 }}>● {b.status}</span>
                  <span style={{ fontSize: 12, color: '#F2A900', fontWeight: 700 }}>{b.activeCount} Mobil Antre</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: '#08080A', borderTop: '1px solid #28282F', padding: '40px 24px', textAlign: 'center', fontSize: 13, color: '#5C5C70' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
          <div>
            <strong style={{ color: '#fff' }}>AURA Luxury Auto Care &amp; Integrated System</strong> © 2026
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={() => scrollToSection('home')} style={{ background: 'none', border: 'none', color: '#5C5C70', cursor: 'pointer' }}>Home</button>
            <button onClick={() => scrollToSection('pricing')} style={{ background: 'none', border: 'none', color: '#5C5C70', cursor: 'pointer' }}>Pricing</button>
            <button onClick={() => setAuthModal('login')} style={{ background: 'none', border: 'none', color: '#F2A900', cursor: 'pointer', fontWeight: 700 }}>Customer Portal Login</button>
          </div>
        </div>
      </footer>

      {/* ── AUTH MODAL (LOGIN & REGISTER) ────────────────────────────────── */}
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
                🔑 Login Member Pelanggan
              </button>
              <button onClick={() => setAuthModal('register')} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: authModal === 'register' ? 800 : 500,
                color: authModal === 'register' ? '#F2A900' : '#5C5C70',
              }}>
                ✨ Daftar Member Baru
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
                
                {/* Quick 1-Click Demo Logins */}
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5C5C70', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  ⚡ Quick Demo Login Pelanggan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {members.map(m => (
                    <button key={m.id} type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '7px 10px', justifyContent: 'space-between' }} onClick={() => handleQuickDemoLogin(m)}>
                      <span>👤 {m.name} ({m.tier})</span>
                      <span className="mono" style={{ color: '#F2A900' }}>Login →</span>
                    </button>
                  ))}
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
