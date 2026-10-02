import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';

const INTERNAL_ROLES = [
  {
    id: 'welcomer',
    title: 'Welcomer Front Officer',
    icon: '🖥️',
    badge: 'FRONT OFFICE & GATEWAY',
    defaultUser: 'welcomer.staff',
    defaultPass: '123456',
    defaultName: 'Front Officer Welcomer',
    desc: 'Verifikasi QR Code, registrasi member baru, dan antrean walk-in.',
    color: '#38BDF8',
  },
  {
    id: 'kasir',
    title: 'Kasir POS Financial',
    icon: '💳',
    badge: 'POINT OF SALE & CASHIER',
    defaultUser: 'kasir.rian',
    defaultPass: '123456',
    defaultName: 'Kasir Rian — Shift POS',
    desc: 'Pemrosesan pembayaran tunai, QRIS, pencetakan struk, dan POS.',
    color: '#0EC278',
  },
  {
    id: 'inventori',
    title: 'Staf Inventori & Stock',
    icon: '📦',
    badge: 'INVENTORY & CONTROL',
    defaultUser: 'inventori.staff',
    defaultPass: '123456',
    defaultName: 'Staf Inventori Gudang',
    desc: 'Stok bahan baku operasional, restock barang, dan log keluar.',
    color: '#A855F7',
  },
  {
    id: 'owner',
    title: 'Owner Executive Dashboard',
    icon: '📊',
    badge: 'EXECUTIVE & OWNER',
    defaultUser: 'owner.admin',
    defaultPass: '123456',
    defaultName: 'Owner / Admin Keuangan',
    desc: 'Analitik omzet harian, multi-cabang, profit, dan ekspor laporan.',
    color: '#F2A900',
  },
];

export const RoleLoginGate = ({ role, children }) => {
  const { authUsers, loginUser, logoutUser, setActiveRole, showToast } = useCarWash();
  
  // Single Portal Login Form State
  const [selectedRole, setSelectedRole] = useState(role || 'welcomer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const currentUser = authUsers[role];
  const meta = INTERNAL_ROLES.find(r => r.id === role) || INTERNAL_ROLES[0];
  const activeTargetMeta = INTERNAL_ROLES.find(r => r.id === selectedRole) || INTERNAL_ROLES[0];

  const handleSinglePortalSubmit = (e) => {
    e.preventDefault();
    const target = activeTargetMeta;
    const inputUser = username.trim() || target.defaultUser;

    // Validate password (accepts 123456 or role password template)
    if (password && password !== '123456' && password !== target.defaultPass) {
      showToast(`Password salah untuk role ${target.title}! Template default: 123456`, 'error');
      return;
    }

    loginUser(selectedRole, { username: inputUser, name: target.defaultName, role: selectedRole });
    setActiveRole(selectedRole);
    setUsername('');
    setPassword('');
  };

  const handleQuickRoleLogin = (targetRole) => {
    const target = INTERNAL_ROLES.find(r => r.id === targetRole);
    loginUser(targetRole, { username: target.defaultUser, name: target.defaultName, role: targetRole });
    setActiveRole(targetRole);
  };

  // If user is already authenticated for this active role, render the Dashboard!
  if (currentUser) {
    return (
      <div>
        {/* Role Authenticated Top Bar */}
        <div style={{
          background: '#141417', borderBottom: '1px solid #28282F',
          padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: 1280, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{meta.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{meta.title}</span>
            <span className="badge badge-gold" style={{ fontSize: 10 }}>✓ Terautentikasi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 12, color: '#A0A0B0' }}>
              Sesi Login: <strong style={{ color: meta.color }}>{currentUser.name}</strong>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px', color: '#F04F4F', border: '1px solid rgba(240,79,79,.3)' }} onClick={() => logoutUser(role)}>
              🚪 Logout Sesi
            </button>
          </div>
        </div>

        {/* Dashboard Component */}
        {children}
      </div>
    );
  }

  // ── UNIFIED SINGLE PINTU LOGIN FOR INTERNAL STAF & OWNER ────────────────
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 100px)', padding: 20 }}>
      <div className="card" style={{ maxWidth: 520, width: '100%', padding: 32 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1a1500, #2b2100)', border: '1px solid rgba(242,169,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px', color: '#F2A900', boxShadow: '0 4px 16px rgba(242,169,0,.15)' }}>
            🔑
          </div>
          <span className="badge badge-gold" style={{ fontSize: 10, letterSpacing: '.12em', marginBottom: 6, display: 'inline-block' }}>
            PORTAL LOGIN TUNGGAL STAF &amp; OWNER
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 4 }}>Satu Pintu Login Internal</h2>
          <p style={{ fontSize: 12, color: '#5C5C70' }}>Pilih role internal dan masukkan password/PIN khusus untuk masuk</p>
        </div>

        {/* Step 1: Select Role */}
        <div style={{ marginBottom: 20 }}>
          <label className="label">Pilih Role Akses *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {INTERNAL_ROLES.map(r => {
              const active = selectedRole === r.id;
              return (
                <div key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  style={{
                    padding: 12, borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${active ? r.color : '#28282F'}`,
                    background: active ? `${r.color}14` : '#0D0D0F',
                    transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: active ? r.color : '#fff' }}>{r.title}</div>
                    <div style={{ fontSize: 10, color: '#5C5C70' }}>Pass: 123456</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Form Login */}
        <form onSubmit={handleSinglePortalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">ID Staf / Username ({activeTargetMeta.title})</label>
            <input className="input mono" placeholder={activeTargetMeta.defaultUser}
              value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Password / PIN Akses *</label>
            <input type="password" className="input mono" placeholder="123456"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-gold" style={{ justifyContent: 'center', padding: '12px 0', fontSize: 14, marginTop: 4 }}>
            🔑 Masuk ke Portal {activeTargetMeta.title} →
          </button>
        </form>

        <div style={{ height: 1, background: '#28282F', margin: '20px 0' }} />

        {/* 1-Click Quick Demo Login options */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#5C5C70', marginBottom: 10, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          ⚡ Quick Demo Login (1-Click)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {INTERNAL_ROLES.map(r => (
            <button key={r.id} type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '7px 8px', justifyContent: 'center' }} onClick={() => handleQuickRoleLogin(r.id)}>
              {r.icon} {r.id.toUpperCase()}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
