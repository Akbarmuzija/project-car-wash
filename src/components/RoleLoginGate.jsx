import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';

const ROLE_META = {
  welcomer: {
    title: 'Welcomer Front Officer Portal',
    icon: '🖥️',
    badge: 'FRONT OFFICE & GATEWAY',
    defaultUser: 'welcomer.staff',
    defaultName: 'Front Officer Welcomer',
    desc: 'Verifikasi reservasi QR Code, registrasi member baru, dan penanganan antrean walk-in.',
  },
  kasir: {
    title: 'Kasir POS Financial Gateway',
    icon: '💳',
    badge: 'POINT OF SALE & CASHIER',
    defaultUser: 'kasir.rian',
    defaultName: 'Kasir Rian — Shift Pagi',
    desc: 'Pemrosesan pembayaran tunai, QRIS, pencetakan struk, dan transaksi POS.',
  },
  inventori: {
    title: 'Staf Inventori & Material Portal',
    icon: '📦',
    badge: 'INVENTORY & STOCK CONTROL',
    defaultUser: 'inventori.staff',
    defaultName: 'Staf Inventori Gudang',
    desc: 'Pemantauan stok bahan baku operasional, restock barang, dan log bahan keluar.',
  },
  owner: {
    title: 'Owner Executive Financial Dashboard',
    icon: '📊',
    badge: 'EXECUTIVE & OWNER ACCESS',
    defaultUser: 'owner.admin',
    defaultName: 'Owner / Admin Keuangan Utama',
    desc: 'Analitik pendapatan multi-cabang, rekap transaksi harian, dan ekspor laporan CSV/Excel.',
  },
};

export const RoleLoginGate = ({ role, children }) => {
  const { authUsers, loginUser, logoutUser } = useCarWash();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const currentUser = authUsers[role];
  const meta = ROLE_META[role] || ROLE_META.welcomer;

  const handleLogin = (e) => {
    e.preventDefault();
    const u = username.trim() || meta.defaultUser;
    loginUser(role, { username: u, name: meta.defaultName, role });
  };

  const handleQuickLogin = () => {
    loginUser(role, { username: meta.defaultUser, name: meta.defaultName, role });
  };

  // If user is already logged in for this role, render children (the dashboard) with a top profile status bar!
  if (currentUser) {
    return (
      <div>
        {/* Role Authenticated Header Bar */}
        <div style={{
          background: 'gradient-dark', borderBottom: '1px solid #28282F',
          padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: 1280, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{meta.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{meta.title}</span>
            <span className="badge badge-gold" style={{ fontSize: 10 }}>✓ Autentikasi Aktif</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 12, color: '#A0A0B0' }}>
              Logged in: <strong style={{ color: '#F2A900' }}>{currentUser.name}</strong>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px', color: '#F04F4F', border: '1px solid rgba(240,79,79,.3)' }} onClick={() => logoutUser(role)}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {children}
      </div>
    );
  }

  // Otherwise, render the Login Screen for this role!
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: 20 }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(242,169,0,.12)', border: '1px solid rgba(242,169,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>
          {meta.icon}
        </div>

        <span className="badge badge-gold" style={{ fontSize: 10, letterSpacing: '.08em', marginBottom: 8, display: 'inline-block' }}>
          {meta.badge}
        </span>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{meta.title}</h2>
        <p style={{ fontSize: 12, color: '#5C5C70', marginBottom: 24, lineHeight: 1.5 }}>
          {meta.desc}
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
          <div>
            <label className="label">ID Staf / Username *</label>
            <input className="input mono" placeholder={meta.defaultUser} value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Password / PIN *</label>
            <input type="password" className="input mono" placeholder="123456" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-gold" style={{ justifyContent: 'center', padding: '12px 0', fontSize: 14, marginTop: 6 }}>
            🔑 Login Portal {role.toUpperCase()}
          </button>
        </form>

        <div style={{ height: 1, background: '#28282F', margin: '20px 0' }} />

        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12.5, color: '#0EC278', border: '1px solid rgba(14,194,120,.3)' }} onClick={handleQuickLogin}>
          ⚡ 1-Click Quick Demo Login ({meta.defaultUser})
        </button>
      </div>
    </div>
  );
};
