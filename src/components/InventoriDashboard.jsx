import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

const INITIAL_MUTATION_LOGS = [
  { id: 'LOG-001', date: '2026-09-30 09:15', sku: 'OP-SHM-001', item: 'AURA Hydro Shampoo Concentrate', type: 'in', qty: 20, unit: 'Liter', note: 'Restock Supplier PT Kimia Jaya', user: 'Staf Inventori' },
  { id: 'LOG-002', date: '2026-09-30 11:30', sku: 'OP-MCF-004', item: 'Edgeless Microfiber Towels (700 GSM)', type: 'out', qty: 5, unit: 'Pcs', note: 'Penggunaan Bay Washing Detailing 1', user: 'Staf Bay' },
  { id: 'LOG-003', date: '2026-09-30 14:20', sku: 'RET-KIT-01', item: 'AURA Quick Detailer Spray 500ml', type: 'out', qty: 1, unit: 'Botol', note: 'Penjualan Kasir POS (#INV-001)', user: 'Kasir POS' },
  { id: 'LOG-004', date: '2026-09-30 16:45', sku: 'OP-WAX-002', item: 'Ceramic Quartz Wax Coating', type: 'out', qty: 2, unit: 'Liter', note: 'Pemakaian Premium Coating Session', user: 'Staf Detailing' },
  { id: 'LOG-005', date: '2026-09-30 17:10', sku: 'RET-AIR-03', item: 'AURA Leather & Oud Air Freshener', type: 'in', qty: 15, unit: 'Pcs', note: 'Penerimaan PO Gudang Utama', user: 'Staf Inventori' },
];

export const InventoriDashboard = () => {
  const { inventory, updateInventory, showToast, logoutUser, authUsers } = useCarWash();

  // Layout & Navigation State
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [tab, setTab] = useState('stock'); // 'stock' | 'critical' | 'logs' | 'report'

  // Filtering State
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  // Modals & Logs State
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [mutationLogs, setMutationLogs] = useState(INITIAL_MUTATION_LOGS);

  const [newItem, setNewItem] = useState({
    name: '', sku: '', category: 'operasional', stock: 0, minStock: 0, unit: 'pcs', price: 0, cost: 0
  });

  const inventoryUser = authUsers?.inventori || { name: 'Staf Inventori Gudang', role: 'Logistics Manager' };

  const cats = ['all', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filtered = inventory.filter(i => {
    const matchCat = catFilter === 'all' || i.category === catFilter;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStock = inventory.filter(i => i.stock <= i.minStock);
  const totalValue = inventory.reduce((s, i) => s + i.stock * (i.cost || i.price || 0), 0);
  const totalRetailVal = inventory.reduce((s, i) => s + i.stock * (i.price || 0), 0);

  const handleEdit = (e) => {
    e.preventDefault();
    updateInventory(editModal);
    setEditModal(null);
    showToast(`Data SKU ${editModal.sku} berhasil diperbarui!`, 'success');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const itemData = {
      ...newItem,
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    updateInventory(itemData);

    // Record mutation log
    setMutationLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        date: new Date().toLocaleString('id-ID'),
        sku: itemData.sku,
        item: itemData.name,
        type: 'in',
        qty: itemData.stock,
        unit: itemData.unit,
        note: 'Penambahan SKU Baru',
        user: inventoryUser.name
      },
      ...prev
    ]);

    setNewItem({ name: '', sku: '', category: 'operasional', stock: 0, minStock: 0, unit: 'pcs', price: 0, cost: 0 });
    setAddModal(false);
    showToast(`Item ${itemData.name} berhasil ditambahkan ke inventori!`, 'success');
  };

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    const qtyNum = Number(restockQty);
    if (!qtyNum || qtyNum <= 0) {
      showToast('Masukkan jumlah restock yang valid', 'error');
      return;
    }

    const updated = {
      ...restockModal,
      stock: Number(restockModal.stock) + qtyNum
    };
    updateInventory(updated);

    // Record log
    setMutationLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        date: new Date().toLocaleString('id-ID'),
        sku: updated.sku,
        item: updated.name,
        type: 'in',
        qty: qtyNum,
        unit: updated.unit,
        note: 'Restock / Purchase Order Supplier',
        user: inventoryUser.name
      },
      ...prev
    ]);

    showToast(`Stok ${updated.name} berhasil ditambah +${qtyNum} ${updated.unit}!`, 'success');
    setRestockModal(null);
    setRestockQty('');
  };

  const STOCK_BAR = (item) => {
    const target = Math.max(item.minStock * 3, item.stock || 1);
    const pct = Math.min(100, Math.round((item.stock / target) * 100));
    const color = item.stock <= item.minStock ? '#F04F4F' : item.stock <= item.minStock * 1.5 ? '#F2A900' : '#0EC278';
    return { pct, color };
  };

  const SIDEBAR_W = sidebarExpanded ? 240 : 64;

  const navItems = [
    { id: 'stock', label: 'Katalog & Level Stok', icon: '📦', count: inventory.length },
    { id: 'critical', label: 'Stok Kritis & PO', icon: '⚠️', count: lowStock.length },
    { id: 'logs', label: 'Mutasi & Audit Stok', icon: '🔄', count: mutationLogs.length },
    { id: 'report', label: 'Kategori & Valuasi', icon: '📊', count: null },
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
              <div style={{ fontSize: 10, color: '#5C5C70', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 800 }}>Inventory & Logistics</div>
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

        {/* Navigation Links */}
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
                    background: item.id === 'critical' && item.count > 0 ? 'rgba(240,79,79,.25)' : isActive ? 'rgba(242,169,0,.2)' : '#28282F',
                    color: item.id === 'critical' && item.count > 0 ? '#F04F4F' : isActive ? '#F2A900' : '#808090',
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
                background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 900, color: '#0D0D0F',
              }}>
                INV
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inventoryUser.name}</div>
                <div style={{ fontSize: 10, color: '#5C5C70' }}>Manajemen Gudang</div>
              </div>
              <button
                onClick={() => logoutUser('inventori')}
                title="Logout Sesi Inventori"
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
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#38BDF8', color: '#0D0D0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
                INV
              </div>
              <button onClick={() => logoutUser('inventori')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5C5C70', fontSize: 16, padding: 4 }} title="Logout Sesi Inventori">⏻</button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', minWidth: 0 }}>
        
        {/* Top Bar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#F2A900', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>MANAJEMEN INVENTORI & LOGISTIK</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              {tab === 'stock' && 'Katalog SKU & Monitoring Stok'}
              {tab === 'critical' && 'Stok Menipis & Restock Purchase Orders'}
              {tab === 'logs' && 'Riwayat Mutasi & Audit Stok Gudang'}
              {tab === 'report' && 'Ringkasan Kategori & Valuasi Asset'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-gold" onClick={() => setAddModal(true)} style={{ fontSize: 12.5, padding: '10px 18px' }}>
              + Tambah Item SKU Baru
            </button>
          </div>
        </div>

        {/* Stats KPI Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Item SKU', value: inventory.length, color: '#F2A900', icon: '📦' },
            { label: 'Nilai Asset Stok (HPP)', value: G(totalValue), color: '#0EC278', icon: '💰', isMoney: true },
            { label: 'Estimasi Nilai Jual', value: G(totalRetailVal), color: '#38BDF8', icon: '🏷️', isMoney: true },
            { label: 'Stok Kritis / Warning', value: `${lowStock.length} Item`, color: lowStock.length > 0 ? '#F04F4F' : '#0EC278', icon: '⚠️' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px', background: '#141417', border: '1px solid #28282F', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ color: s.color, fontSize: s.isMoney ? 17 : 22, fontWeight: 900 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#5C5C70', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TAB 1: STOCK CATALOG ── */}
        {tab === 'stock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Search & Category Filter Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', background: '#141417', padding: '14px 18px', borderRadius: 14, border: '1px solid #28282F' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input"
                  placeholder="🔍 Cari Berdasarkan Nama Item atau SKU..."
                  style={{ paddingLeft: 36, fontSize: 12.5 }}
                />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5C5C70', fontSize: 13 }}>🔍</span>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {cats.map(c => (
                  <button
                    key={c}
                    onClick={() => setCatFilter(c)}
                    style={{
                      padding: '7px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      borderColor: catFilter === c ? '#F2A900' : '#28282F',
                      background: catFilter === c ? 'rgba(242,169,0,.15)' : 'transparent',
                      color: catFilter === c ? '#F2A900' : '#A0A0B0',
                      textTransform: 'capitalize',
                    }}
                  >
                    {c === 'all' ? 'Semua Kategori' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Table */}
            <div className="card" style={{ padding: 22, background: '#141417', border: '1px solid #28282F' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Nama Item Gudang</th>
                    <th>Kategori</th>
                    <th>Stok Saat Ini</th>
                    <th>Min. Stok</th>
                    <th>Status Level</th>
                    <th>HPP (Cost)</th>
                    <th>Harga Jual</th>
                    <th>Aksi Management</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', color: '#5C5C70', padding: '50px 0' }}>
                        Tidak ada item inventori yang cocok dengan pencarian
                      </td>
                    </tr>
                  ) : (
                    filtered.map(item => {
                      const { pct, color } = STOCK_BAR(item);
                      const isCrit = item.stock <= item.minStock;
                      return (
                        <tr key={item.id}>
                          <td className="mono" style={{ fontSize: 11.5, color: '#38BDF8', fontWeight: 700 }}>{item.sku}</td>
                          <td style={{ fontWeight: 800, color: '#fff' }}>{item.name}</td>
                          <td>
                            <span className="badge badge-gold" style={{ textTransform: 'capitalize', fontSize: 10 }}>
                              {item.category}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 900, fontSize: 16, color: isCrit ? '#F04F4F' : '#fff' }}>{item.stock}</span>
                            <span style={{ fontSize: 11, color: '#5C5C70', marginLeft: 4 }}>{item.unit}</span>
                          </td>
                          <td style={{ fontSize: 12, color: '#A0A0B0' }}>{item.minStock} {item.unit}</td>
                          <td style={{ minWidth: 130 }}>
                            <div className="progress-bar" style={{ height: 6, background: '#28282F', borderRadius: 4, overflow: 'hidden' }}>
                              <div className="progress-fill" style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width .3s ease' }} />
                            </div>
                            <div style={{ fontSize: 10, color: isCrit ? '#F04F4F' : '#5C5C70', marginTop: 4, fontWeight: 700 }}>
                              {isCrit ? '⚠️ KRITIS / RE-STOCK' : `${pct}% Capaian`}
                            </div>
                          </td>
                          <td style={{ fontSize: 12, color: '#A0A0B0' }}>{G(item.cost || 0)}</td>
                          <td style={{ fontWeight: 800, color: '#F2A900', fontSize: 13 }}>{G(item.price || 0)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => setEditModal({ ...item })}>
                                ✏️ Edit
                              </button>
                              <button className="btn btn-gold" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => setRestockModal(item)}>
                                + Restock
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: CRITICAL STOCK & PO ── */}
        {tab === 'critical' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {lowStock.length > 0 && (
              <div style={{ padding: '16px 20px', background: 'rgba(240,79,79,.1)', border: '1px solid rgba(240,79,79,.3)', borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#F04F4F', fontWeight: 800, fontSize: 14 }}>
                  <span>⚠️ Warning Stok Kritis ({lowStock.length} SKU Perlu Re-Order Direct)</span>
                </div>
                <p style={{ fontSize: 12, color: '#A0A0B0', marginTop: 4 }}>
                  Item di bawah ini telah mencapai atau melewati batas stok minimum operasional. Segera lakukan Purchase Order (PO).
                </p>
              </div>
            )}

            <div className="card" style={{ padding: 22, background: '#141417', border: '1px solid #28282F' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Nama Item SKU</th>
                    <th>Kategori</th>
                    <th>Sisa Stok</th>
                    <th>Batas Minimum</th>
                    <th>Rekomendasi Restock</th>
                    <th>Aksi Fast PO</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#0EC278', padding: '50px 0' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                        Semua stok berada di level aman. Tidak ada item kritis.
                      </td>
                    </tr>
                  ) : (
                    lowStock.map(item => (
                      <tr key={item.id}>
                        <td className="mono" style={{ color: '#F04F4F', fontWeight: 800 }}>{item.sku}</td>
                        <td style={{ fontWeight: 800, color: '#fff' }}>{item.name}</td>
                        <td><span className="badge badge-gold">{item.category}</span></td>
                        <td>
                          <span style={{ fontWeight: 900, color: '#F04F4F', fontSize: 16 }}>{item.stock}</span> {item.unit}
                        </td>
                        <td style={{ color: '#A0A0B0' }}>{item.minStock} {item.unit}</td>
                        <td style={{ fontWeight: 700, color: '#F2A900' }}>+{item.minStock * 3} {item.unit}</td>
                        <td>
                          <button className="btn btn-gold" style={{ fontSize: 11.5, padding: '7px 14px' }} onClick={() => setRestockModal(item)}>
                            📦 Buat Restock PO
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: MUTATION LOGS ── */}
        {tab === 'logs' && (
          <div className="card" style={{ padding: 24, background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>Jurnal Audit & Mutasi Stok Gudang</h3>
                <p style={{ fontSize: 12, color: '#5C5C70', margin: 0 }}>Catatan real-time barang masuk dari supplier dan keluar untuk operasional bay</p>
              </div>
              <span className="badge badge-gold">{mutationLogs.length} Catatan Log</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu & Tanggal</th>
                  <th>SKU</th>
                  <th>Nama Barang</th>
                  <th>Jenis Mutasi</th>
                  <th>Jumlah</th>
                  <th>Keterangan / Ref</th>
                  <th>Petugas / PIC</th>
                </tr>
              </thead>
              <tbody>
                {mutationLogs.map(log => (
                  <tr key={log.id}>
                    <td className="mono" style={{ fontSize: 11, color: '#5C5C70' }}>{log.date}</td>
                    <td className="mono" style={{ color: '#38BDF8', fontWeight: 700, fontSize: 11.5 }}>{log.sku}</td>
                    <td style={{ fontWeight: 800, color: '#fff' }}>{log.item}</td>
                    <td>
                      <span className={`badge ${log.type === 'in' ? 'badge-emerald' : 'badge-gold'}`} style={{ fontSize: 10 }}>
                        {log.type === 'in' ? '📥 BARANG MASUK' : '📤 KELUAR / PAKAI'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 900, color: log.type === 'in' ? '#0EC278' : '#F2A900', fontSize: 14 }}>
                      {log.type === 'in' ? `+${log.qty}` : `-${log.qty}`} {log.unit}
                    </td>
                    <td style={{ fontSize: 12, color: '#A0A0B0' }}>{log.note}</td>
                    <td style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB 4: CATEGORY VALUATION REPORT ── */}
        {tab === 'report' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {cats.filter(c => c !== 'all').map(cat => {
                const catItems = inventory.filter(i => i.category === cat);
                const catVal = catItems.reduce((s, i) => s + i.stock * (i.cost || i.price || 0), 0);
                return (
                  <div key={cat} className="card" style={{ padding: 22, background: '#141417', border: '1px solid #28282F' }}>
                    <div style={{ fontSize: 11, color: '#5C5C70', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '.06em' }}>
                      KATEGORI: {cat}
                    </div>
                    <div style={{ color: '#F2A900', fontSize: 22, fontWeight: 900, marginTop: 8 }}>
                      {G(catVal)}
                    </div>
                    <div style={{ fontSize: 12, color: '#A0A0B0', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Item SKU:</span>
                      <span style={{ color: '#fff', fontWeight: 800 }}>{catItems.length} SKU</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ── MODALS ── */}

      {/* Edit Item Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 480, width: '100%', background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #28282F' }}>
              Edit SKU — <span style={{ color: '#F2A900' }}>{editModal.name}</span>
            </div>
            <form onSubmit={handleEdit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Nama Item</label>
                <input className="input" value={editModal.name} onChange={e => setEditModal({ ...editModal, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Stok Saat Ini</label>
                <input type="number" step="any" className="input" value={editModal.stock} onChange={e => setEditModal({ ...editModal, stock: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Batas Min. Stok</label>
                <input type="number" step="any" className="input" value={editModal.minStock} onChange={e => setEditModal({ ...editModal, minStock: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">HPP (Cost Supplier)</label>
                <input type="number" className="input" value={editModal.cost || 0} onChange={e => setEditModal({ ...editModal, cost: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Harga Jual POS</label>
                <input type="number" className="input" value={editModal.price || 0} onChange={e => setEditModal({ ...editModal, price: Number(e.target.value) })} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }}>Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock PO Modal */}
      {restockModal && (
        <div className="modal-overlay" onClick={() => setRestockModal(null)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 420, width: '100%', background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0EC278', marginBottom: 6 }}>📦 Restock / Penerimaan Supplier</div>
            <div style={{ fontSize: 12, color: '#5C5C70', marginBottom: 16 }}>Item SKU: {restockModal.name} ({restockModal.sku})</div>
            
            <form onSubmit={handleRestockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Jumlah Restock yang Diterima ({restockModal.unit})</label>
                <input
                  type="number"
                  step="any"
                  className="input font-mono"
                  required
                  value={restockQty}
                  onChange={e => setRestockQty(e.target.value)}
                  placeholder={`Contoh: ${restockModal.minStock * 2}`}
                  style={{ fontSize: 16, fontWeight: 800 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setRestockModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }}>+ Tambah Ke Stok</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 520, width: '100%', background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #28282F' }}>
              + Tambah Item SKU Baru
            </div>
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Nama Item Barang</label>
                <input className="input" placeholder="contoh: Shampoo Carwash 5L" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">SKU</label>
                <input className="input mono uppercase" placeholder="OP-SHM-005" value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value.toUpperCase() })} required />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select className="input" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                  <option value="operasional">Operasional</option>
                  <option value="autocare">Auto Care</option>
                  <option value="merchandise">Merchandise</option>
                </select>
              </div>
              <div>
                <label className="label">Stok Awal</label>
                <input type="number" step="any" className="input" value={newItem.stock} onChange={e => setNewItem({ ...newItem, stock: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Min. Stok Warning</label>
                <input type="number" step="any" className="input" value={newItem.minStock} onChange={e => setNewItem({ ...newItem, minStock: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Satuan Unit</label>
                <select className="input" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })}>
                  <option value="Liter">Liter</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Botol">Botol</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>
              <div>
                <label className="label">HPP (Cost)</label>
                <input type="number" className="input" value={newItem.cost} onChange={e => setNewItem({ ...newItem, cost: Number(e.target.value) })} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Harga Jual Retail POS (Opsional)</label>
                <input type="number" className="input" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} placeholder="0 jika hanya operasional" />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setAddModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                <button type="submit" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }}>+ Simpan SKU</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoriDashboard;
