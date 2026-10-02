import React, { useState, useEffect } from 'react';
import { useCarWash } from '../context/CarWashContext';

export const Navbar = () => {
  const { activeRole, setActiveRole, selectedBranch, setSelectedBranch, notification, authUsers } = useCarWash();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const isStaffActive = activeRole !== 'pelanggan';
  const authenticatedStaffRole = Object.keys(authUsers).find(r => r !== 'pelanggan' && !!authUsers[r]);

  const handleStaffClick = () => {
    if (isStaffActive) return;
    setActiveRole(authenticatedStaffRole || 'welcomer');
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(13,13,15,0.97)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #28282F',
    }}>
      {/* Top bar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: 60, gap: 16 }}>
          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap: 12, flexShrink: 0, cursor: 'pointer' }} onClick={() => setActiveRole('pelanggan')}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #F2A900, #C98B00)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: 18, fontWeight: 900, color: '#0D0D0F',
              boxShadow: '0 4px 16px rgba(242,169,0,.35)',
              letterSpacing: '-.03em',
              flexShrink: 0,
            }}>A</div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-.02em', color: '#fff' }}>AURA</span>
                <span className="badge badge-gold" style={{ fontSize: 10 }}>✦ LUXURY AUTO CARE</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap: 8, marginTop: 1 }}>
                <span className="dot-live"></span>
                <span style={{ fontSize: 11, color: '#5C5C70', fontFamily: 'monospace' }}>{time} WIB</span>
                <span style={{ fontSize: 11, color: '#38383F' }}>•</span>
                <span style={{ fontSize: 11, color: '#5C5C70' }}>v1.1.0</span>
              </div>
            </div>
          </div>

          {/* 2 Separate Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Link 1: Portal Pelanggan */}
            <a
              href="#pelanggan"
              onClick={(e) => {
                e.preventDefault();
                setActiveRole('pelanggan');
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 14, fontWeight: !isStaffActive ? 700 : 500,
                color: !isStaffActive ? '#F2A900' : '#A0A0B0',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                borderBottom: !isStaffActive ? '2px solid #F2A900' : '2px solid transparent',
                transition: 'all .2s',
                background: !isStaffActive ? 'rgba(242,169,0,.08)' : 'transparent',
              }}>
              <span style={{ fontSize: 16 }}>👤</span>
              <span>Portal Pelanggan</span>
            </a>

            {/* Link 2: Login 1 Pintu Staff */}
            <a
              href="#staff-login"
              onClick={(e) => {
                e.preventDefault();
                handleStaffClick();
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 14, fontWeight: isStaffActive ? 700 : 500,
                color: isStaffActive ? '#F2A900' : '#A0A0B0',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                borderBottom: isStaffActive ? '2px solid #F2A900' : '2px solid transparent',
                transition: 'all .2s',
                background: isStaffActive ? 'rgba(242,169,0,.08)' : 'transparent',
              }}>
              <span style={{ fontSize: 16 }}>🔑</span>
              <span>Login 1 Pintu Staff</span>
              {authenticatedStaffRole && (
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#0EC278',
                  boxShadow: '0 0 6px #0EC278',
                }} title="Sesi Staff Aktif" />
              )}
            </a>
          </nav>

          {/* Branch selector */}
          <div style={{
            display:'flex', alignItems:'center', gap: 8,
            background: '#141417', border: '1px solid #28282F',
            borderRadius: 9, padding: '7px 12px', flexShrink: 0,
          }}>
            <span style={{ fontSize: 13 }}>📍</span>
            <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
              style={{
                background:'transparent', border:'none', color:'#fff',
                fontSize: 12.5, fontWeight: 600, outline:'none', cursor:'pointer',
              }}>
              <option value="senopati" style={{background:'#141417'}}>Senopati Flagship</option>
              <option value="bsd_city" style={{background:'#141417'}}>BSD City</option>
              <option value="surabaya_west" style={{background:'#141417'}}>Surabaya Barat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toast */}
      {notification && (
        <div style={{
          margin: '0 20px 10px',
          padding: '10px 16px',
          borderRadius: 10,
          fontSize: 12.5, fontWeight: 600,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12,
          background: notification.type === 'success' ? 'rgba(14,194,120,.12)' :
                      notification.type === 'warning' ? 'rgba(242,169,0,.12)' : 'rgba(56,189,248,.12)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(14,194,120,.3)' : notification.type === 'warning' ? 'rgba(242,169,0,.3)' : 'rgba(56,189,248,.3)'}`,
          color: notification.type === 'success' ? '#0EC278' : notification.type === 'warning' ? '#F2A900' : '#38BDF8',
          maxWidth: 860, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <span>{notification.message}</span>
          <span style={{ opacity: .5, fontSize: 11, fontFamily:'monospace' }}>AURA System</span>
        </div>
      )}
    </header>
  );
};
