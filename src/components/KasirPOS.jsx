import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', icon: '📱', color: '#38BDF8' },
  { id: 'cash', label: 'Tunai', icon: '💵', color: '#0EC278' },
  { id: 'transfer', label: 'Transfer', icon: '🏦', color: '#F2A900' },
  { id: 'debit', label: 'Debit/CC', icon: '💳', color: '#A855F7' },
];

const POS_PRODUCTS = [
  { id: 'fast_clean', sku: 'SVC-001', name: 'Fast Clean Express', price: 75000, cat: 'service', icon: '⚡', desc: 'Cuci cepat drive-through tanpa turun dari mobil' },
  { id: 'premium_clean', sku: 'SVC-002', name: 'Premium Clean & Detailing', price: 250000, cat: 'service', icon: '✦', desc: 'Cuci premium + interior vacuum & ozone VIP Lounge' },
  { id: 'wax_premium', sku: 'RET-KIT-01', name: 'AURA Quick Detailer Spray 500ml', price: 185000, cat: 'product', icon: '🧪', desc: 'Hydrophobic gloss spray enhancer' },
  { id: 'interior_kit', sku: 'RET-INT-02', name: 'Interior Care & Leather Protect', price: 145000, cat: 'product', icon: '🧽', desc: 'Pembersih & pengkilap jok kulit sintetis' },
  { id: 'tire_kit', sku: 'RET-TIR-03', name: 'Deep Black Tire Shine Gel', price: 95000, cat: 'product', icon: '🚗', desc: 'Gel pengkilap ban tahan 3 minggu' },
  { id: 'parfum', sku: 'RET-AIR-03', name: 'AURA Leather & Oud Air Freshener', price: 65000, cat: 'product', icon: '🌿', desc: 'Parfum kabin mewah aroma kayu oud' },
  { id: 'microfiber', sku: 'RET-TOWEL-05', name: 'Edgeless Microfiber Towel Set (3 Pcs)', price: 120000, cat: 'product', icon: '🧽', desc: 'Microfiber 700 GSM anti baret cat' },
  { id: 'tumbler', sku: 'RET-APP-06', name: 'AURA Thermal Tumbler 750ml', price: 210000, cat: 'product', icon: '🥤', desc: 'Tumbler stainless double-wall AURA' },
];

export const KasirPOS = () => {
  const { transactions, processPayment, reservations, payUnpaidReservation, showToast, logoutUser, authUsers } = useCarWash();
  
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'unpaid' | 'history' | 'report'
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [cart, setCart] = useState([]);
  const [method, setMethod] = useState('qris');
  const [cashIn, setCashIn] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');

  const cashierUser = authUsers?.kasir || { name: 'Kasir - Rian', role: 'Shift POS Senopati' };

  const unpaidQueue = reservations.filter(r => r.paymentStatus === 'unpaid' && !['completed', 'cancelled'].includes(r.status));

  const filteredItems = POS_PRODUCTS.filter(item => {
    const matchCat = catFilter === 'all' || item.cat === catFilter;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addItem = (item) => {
    setCart(c => {
      const ex = c.find(x => x.id === item.id);
      return ex ? c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => setCart(c => c.filter(x => x.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) { removeItem(id); return; }
    setCart(c => c.map(x => x.id === id ? { ...x, qty } : x));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const disc = Math.round(subtotal * discount / 100);
  const total = subtotal - disc;
  const cashInNum = Number(cashIn.replace(/\D/g, '')) || 0;
  const change = cashInNum - total;

  const handleProcess = () => {
    if (cart.length === 0) { showToast('Keranjang transaksi masih kosong', 'error'); return; }
    if (method === 'cash' && cashInNum < total) { showToast('Jumlah uang tunai kurang dari total tagihan', 'error'); return; }
    const tx = processPayment({ items: cart, total, discount, method });
    setReceipt(tx);
    setCart([]);
    setCashIn('');
    setDiscount(0);
  };

  const dayTotal = transactions.reduce((s, t) => s + (t.amount || t.total || 0), 0);
  const txToday = [...transactions].slice(-15).reverse();

  const SIDEBAR_W = sidebarExpanded ? 240 : 64;

  const renderContent = () => {
    switch (activeTab) {
      case 'pos':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 24, alignItems: 'start' }}>
            {/* LEFT: Filters & Product Grid */}
            <div>
              {/* Unpaid Banner Alert */}
              {unpaidQueue.length > 0 && (
                <div style={{
                  marginBottom: 20, padding: '14px 20px',
                  background: 'linear-gradient(135deg, rgba(240,79,79,.12), rgba(240,79,79,.04))',
                  border: '1px solid rgba(240,79,79,.3)',
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(240,79,79,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#F04F4F' }}>
                      📌
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: '#F04F4F' }}>Ada {unpaidQueue.length} Antrean Belum Bayar (Kasir Walk-In)</div>
                      <div style={{ fontSize: 11.5, color: '#A0A0B0', marginTop: 1 }}>Pelanggan menunggu konfirmasi bayar tunai di meja kasir</div>
                    </div>
                  </div>
                  <button className="btn btn-gold" style={{ fontSize: 11.5, padding: '7px 14px' }} onClick={() => setActiveTab('unpaid')}>
                    Bayar Antrean ({unpaidQueue.length}) →
                  </button>
                </div>
              )}

              {/* Filters Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                {/* Category Pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'Semua Items' },
                    { id: 'service', label: '⚡ Service Cuci' },
                    { id: 'product', label: '🧴 Produk & Merch' },
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCatFilter(c.id)}
                      style={{
                        padding: '7px 16px', borderRadius: 20,
                        border: '1px solid',
                        borderColor: catFilter === c.id ? '#F2A900' : '#28282F',
                        background: catFilter === c.id ? 'rgba(242,169,0,.15)' : '#141417',
                        color: catFilter === c.id ? '#F2A900' : '#A0A0B0',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div style={{ position: 'relative', width: 240 }}>
                  <input
                    type="text"
                    placeholder="Cari item / SKU..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      width: '100%', background: '#141417', border: '1px solid #28282F',
                      borderRadius: 10, padding: '8px 12px 8px 34px', color: '#fff', fontSize: 12, outline: 'none',
                    }}
                  />
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5C5C70', fontSize: 13 }}>🔍</span>
                </div>
              </div>

              {/* Product Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    style={{
                      background: '#141417', border: '1px solid #28282F', borderRadius: 14,
                      padding: 18, cursor: 'pointer', textAlign: 'left', transition: 'all .18s',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 160,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#F2A900'; e.currentTarget.style.background = 'rgba(242,169,0,.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#28282F'; e.currentTarget.style.background = '#141417'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 28 }}>{item.icon}</span>
                        <span className="badge" style={{
                          fontSize: 9,
                          background: item.cat === 'service' ? 'rgba(242,169,0,.15)' : 'rgba(56,189,248,.15)',
                          color: item.cat === 'service' ? '#F2A900' : '#38BDF8',
                          border: `1px solid ${item.cat === 'service' ? 'rgba(242,169,0,.3)' : 'rgba(56,189,248,.3)'}`,
                        }}>
                          {item.cat.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
                      <div style={{ fontSize: 10.5, color: '#5C5C70' }}>SKU: {item.sku}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #28282F', marginTop: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#F2A900' }}>{G(item.price)}</div>
                      <span style={{ fontSize: 11, color: '#F2A900', fontWeight: 800 }}>+ Tambah</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Cart & Checkout Panel (Sticky 380px) */}
            <div className="card" style={{ padding: 22, position: 'sticky', top: 80, background: '#141417', border: '1px solid #28282F' }}>
              <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #28282F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🛒</span> Ringkasan Transaksi
                </span>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F04F4F', fontSize: 11, fontWeight: 700 }}>
                    Kosongkan
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#5C5C70', fontSize: 13, borderRadius: 12, border: '1px dashed #28282F', marginBottom: 20 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💳</div>
                  Klik produk / layanan di panel kiri<br />untuk menambahkan ke keranjang POS.
                </div>
              ) : (
                <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, paddingRight: 4 }}>
                  {cart.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#0D0D0F', borderRadius: 10, border: '1px solid #28282F' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: '#5C5C70' }}>{G(c.price)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <button onClick={() => updateQty(c.id, c.qty - 1)} style={{ width: 22, height: 22, borderRadius: 6, background: '#28282F', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ fontSize: 12, fontWeight: 800, minWidth: 16, textAlign: 'center' }}>{c.qty}</span>
                        <button onClick={() => updateQty(c.id, c.qty + 1)} style={{ width: 22, height: 22, borderRadius: 6, background: '#28282F', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#F2A900', minWidth: 65, textAlign: 'right' }}>{G(c.price * c.qty)}</div>
                      <button onClick={() => removeItem(c.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#5C5C70', padding: 2 }} title="Hapus">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Discount Selector */}
              <div style={{ marginBottom: 14 }}>
                <label className="label" style={{ fontSize: 11.5 }}>Diskon / Promo Member</label>
                <select value={discount} onChange={e => setDiscount(Number(e.target.value))} className="input" style={{ fontSize: 12 }}>
                  <option value={0}>Tidak ada (0%)</option>
                  <option value={5}>5% — Promo Member Regular</option>
                  <option value={10}>10% — VIP Gold Member</option>
                  <option value={15}>15% — VIP Platinum Member</option>
                  <option value={20}>20% — Special Voucher Code</option>
                </select>
              </div>

              {/* Summary Calculation */}
              <div style={{ background: '#0D0D0F', borderRadius: 12, padding: 14, border: '1px solid #28282F', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#A0A0B0', marginBottom: 5 }}>
                  <span>Subtotal Tagihan</span><span>{G(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#0EC278', marginBottom: 5 }}>
                    <span>Diskon Member ({discount}%)</span><span>− {G(disc)}</span>
                  </div>
                )}
                <div style={{ height: 1, background: '#28282F', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#A0A0B0', fontSize: 12, fontWeight: 700 }}>TOTAL BAYAR</span>
                  <span style={{ color: '#F2A900', fontSize: 22, fontWeight: 900, letterSpacing: '-.02em' }}>{G(total)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: 16 }}>
                <label className="label" style={{ fontSize: 11.5, marginBottom: 8 }}>Metode Pembayaran</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setMethod(pm.id)}
                      style={{
                        padding: '10px 4px', borderRadius: 10,
                        border: `1.5px solid ${method === pm.id ? pm.color : '#28282F'}`,
                        background: method === pm.id ? `${pm.color}18` : '#0D0D0F',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all .15s',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{pm.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: method === pm.id ? pm.color : '#5C5C70' }}>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Input if Cash Selected */}
              {method === 'cash' && (
                <div style={{ marginBottom: 16 }}>
                  <label className="label" style={{ fontSize: 11.5 }}>Nominal Uang Tunai Diterima</label>
                  <input
                    className="input mono"
                    placeholder="0"
                    value={cashIn}
                    onChange={e => setCashIn(e.target.value)}
                    style={{ fontSize: 15, fontWeight: 800 }}
                  />
                  {/* Quick Cash Presets */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
                    {[total, 100000, 200000].map(val => (
                      <button
                        key={val}
                        onClick={() => setCashIn(val.toString())}
                        style={{ padding: '5px 0', borderRadius: 6, background: '#0D0D0F', border: '1px solid #28282F', color: '#A0A0B0', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
                      >
                        {val === total ? 'Uang Pas' : G(val)}
                      </button>
                    ))}
                  </div>

                  {cashInNum >= total && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 900, color: '#0EC278', marginTop: 10, padding: '10px 14px', background: 'rgba(14,194,120,.1)', borderRadius: 10, border: '1px solid rgba(14,194,120,.3)' }}>
                      <span>KEMBALIAN</span><span>{G(change)}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                className="btn btn-gold"
                onClick={handleProcess}
                style={{ width: '100%', justifyContent: 'center', padding: '13px 0', fontSize: 13.5 }}
              >
                💳 Proses Pembayaran & Cetak Struk
              </button>
            </div>
          </div>
        );

      case 'unpaid':
        return (
          <div className="card" style={{ padding: 28, background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #28282F' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#F04F4F', margin: '0 0 4px 0' }}>📌 Antrean Belum Bayar (Kasir Walk-In)</h3>
                <p style={{ fontSize: 12.5, color: '#5C5C70', margin: 0 }}>Daftar transaksi pelanggan yang memilih pembayaran tunai di kasir</p>
              </div>
              <span className="badge" style={{ background: 'rgba(240,79,79,.15)', color: '#F04F4F', border: '1px solid rgba(240,79,79,.3)', fontSize: 12, padding: '6px 12px' }}>
                {unpaidQueue.length} Transaksi Pending
              </span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Antrean</th><th>Kode Booking</th><th>Pelanggan</th><th>Kendaraan</th><th>Layanan</th><th>Total Tagihan</th><th>Aksi Pelunasan</th>
                </tr>
              </thead>
              <tbody>
                {unpaidQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#5C5C70', padding: '50px 0' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                      Tidak ada antrean pending pembayaran saat ini
                    </td>
                  </tr>
                ) : (
                  unpaidQueue.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 900, fontSize: 22, color: '#F2A900', fontFamily: 'monospace' }}>#{r.queueNumber}</td>
                      <td className="mono" style={{ color: '#38BDF8', fontWeight: 700 }}>{r.bookingCode}</td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.customerName}</div>
                        <div style={{ fontSize: 11, color: '#5C5C70' }}>{r.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.vehicle}</div>
                        <div className="mono" style={{ fontSize: 11, color: '#F2A900' }}>{r.plate}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{r.serviceName}</td>
                      <td style={{ fontSize: 17, fontWeight: 900, color: '#F2A900' }}>{G(r.price)}</td>
                      <td>
                        <button className="btn btn-gold" style={{ fontSize: 11.5, padding: '8px 16px' }} onClick={() => payUnpaidReservation(r.id, 'cash')}>
                          💵 Terima Bayar Tunai (LUNAS)
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case 'history':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {[
                { label: 'Total Transaksi Hari Ini', value: `${transactions.length} Transaksi`, sub: 'Kasir & Walk-In', color: '#F2A900' },
                { label: 'Estimasi Omzet Layanan', value: G(dayTotal * 0.7), sub: 'Dari pencucian & detailing', color: '#0EC278' },
                { label: 'Estimasi Omzet Merchandise', value: G(dayTotal * 0.3), sub: 'Dari produk & merchandise', color: '#38BDF8' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: 22, background: '#141417', border: '1px solid #28282F' }}>
                  <div style={{ fontSize: 11, color: '#5C5C70', textTransform: 'uppercase', fontWeight: 700 }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: 24, fontWeight: 900, marginTop: 8, letterSpacing: '-.02em' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#5C5C70', marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* History Table */}
            <div className="card" style={{ padding: 24, background: '#141417', border: '1px solid #28282F' }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#fff' }}>Daftar Transaksi Terbaru</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Invoice</th><th>Pelanggan</th><th>Detail / Items</th><th>Total Bayar</th><th>Metode</th><th>Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {txToday.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#5C5C70', padding: '40px 0' }}>Belum ada transaksi tercatat hari ini</td>
                    </tr>
                  ) : (
                    txToday.map(t => (
                      <tr key={t.id}>
                        <td className="mono" style={{ fontSize: 11.5, color: '#5C5C70' }}>{t.id}</td>
                        <td style={{ fontWeight: 700 }}>{t.customer || t.customerName || 'Walk-In Customer'}</td>
                        <td style={{ fontSize: 12, color: '#A0A0B0' }}>{Array.isArray(t.items) ? t.items.join(', ') : t.channel}</td>
                        <td style={{ fontWeight: 900, color: '#F2A900', fontSize: 15 }}>{G(t.amount || t.total)}</td>
                        <td><span className="badge badge-gold" style={{ fontSize: 10 }}>{(t.method || 'qris').toUpperCase()}</span></td>
                        <td className="mono" style={{ fontSize: 11, color: '#5C5C70' }}>{t.date || t.time || 'WIB'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'report':
        return (
          <div className="card" style={{ padding: 28, background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #28282F' }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>📊 Laporan Omzet & Penutupan Shift</h3>
              <p style={{ fontSize: 12.5, color: '#5C5C70', margin: 0 }}>Ringkasan penutupan kasir untuk shift {cashierUser.name}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <div style={{ background: '#0D0D0F', padding: 20, borderRadius: 14, border: '1px solid #28282F' }}>
                <div style={{ fontSize: 12, color: '#5C5C70', marginBottom: 12, fontWeight: 700 }}>REKAP PEMBAYARAN SHIFT</div>
                {PAYMENT_METHODS.map(pm => (
                  <div key={pm.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
                    <span style={{ color: '#A0A0B0', display: 'flex', alignItems: 'center', gap: 6 }}>{pm.icon} {pm.label}</span>
                    <span style={{ fontWeight: 800, color: '#fff' }}>{G(dayTotal * (pm.id === 'qris' ? 0.5 : pm.id === 'cash' ? 0.3 : 0.1))}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: '#28282F', margin: '14px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 16 }}>
                  <span>TOTAL OMZET SHIFT</span>
                  <span style={{ color: '#F2A900' }}>{G(dayTotal)}</span>
                </div>
              </div>
              <div style={{ background: '#0D0D0F', padding: 20, borderRadius: 14, border: '1px solid #28282F', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 8 }}>📌 Cetak Laporan Penutupan Shift</div>
                  <div style={{ fontSize: 12, color: '#5C5C70', lineHeight: 1.5 }}>
                    Cetak struk rekapitulasi fisik kasir sebelum melakukan serah terima shift ke petugas berikutnya.
                  </div>
                </div>
                <button className="btn btn-gold" style={{ justifyContent: 'center', padding: '12px 0', fontSize: 13 }} onClick={() => window.print()}>
                  🖨️ Cetak Laporan Shift POS
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', background: '#0D0D0F' }}>

      {/* ── KASIR SIDEBAR ── */}
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
                fontSize: 15, flexShrink: 0, color: '#0D0D0F', fontWeight: 900,
              }}>💳</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: '-.01em' }}>KASIR POS</div>
                <div style={{ fontSize: 10, color: '#5C5C70', fontWeight: 600 }}>AURA Financial</div>
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

        {/* Sidebar Nav List */}
        <div style={{ padding: '10px 8px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'pos', label: 'Point of Sale', icon: '💳' },
            { id: 'unpaid', label: 'Belum Bayar', icon: '📌', badge: unpaidQueue.length },
            { id: 'history', label: 'Riwayat Transaksi', icon: '📋' },
            { id: 'report', label: 'Laporan Shift', icon: '📊' },
          ].map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {sidebarExpanded && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                {sidebarExpanded && item.badge > 0 && (
                  <span style={{ background: '#F04F4F', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 900, padding: '2px 7px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div style={{ borderTop: '1px solid #28282F', padding: '12px 10px' }}>
          {sidebarExpanded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #F2A900, #C98B00)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 900, color: '#0D0D0F',
              }}>
                KR
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cashierUser.name}</div>
                <div style={{ fontSize: 10, color: '#5C5C70' }}>Senopati Flagship</div>
              </div>
              <button
                onClick={() => logoutUser('kasir')}
                title="Logout Sesi Kasir"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#5C5C70', fontSize: 16, padding: 4,
                  display: 'flex', alignItems: 'center', borderRadius: 6, transition: 'color .15s',
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
                KR
              </div>
              <button onClick={() => logoutUser('kasir')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5C5C70', fontSize: 16, padding: 4 }} title="Logout Sesi Kasir">⏻</button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', minWidth: 0 }}>
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#F2A900', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>TERMINAL KASIR POS</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              {activeTab === 'pos' && 'Point of Sale (Kasir Register)'}
              {activeTab === 'unpaid' && 'Antrean Belum Bayar'}
              {activeTab === 'history' && 'Riwayat Transaksi POS'}
              {activeTab === 'report' && 'Laporan Penutupan Shift'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: '#141417', border: '1px solid #28282F', padding: '8px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#5C5C70', fontWeight: 700, textTransform: 'uppercase' }}>Omzet Hari Ini</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#F2A900' }}>{G(dayTotal)}</div>
              </div>
            </div>
          </div>
        </div>

        {renderContent()}
      </main>

      {/* Printable Receipt Modal */}
      {receipt && (
        <div className="modal-overlay" onClick={() => setReceipt(null)}>
          <div onClick={e => e.stopPropagation()} className="printable card" style={{
            background: '#141417', border: '1px solid #28282F', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '.04em', color: '#F2A900', marginBottom: 4 }}>AURA</div>
              <div style={{ fontSize: 11, color: '#5C5C70', letterSpacing: '.1em', textTransform: 'uppercase' }}>Auto Care · Senopati Flagship</div>
              <div style={{ height: 1, background: '#28282F', margin: '14px 0' }} />
              <div className="mono" style={{ fontSize: 11, color: '#5C5C70', marginBottom: 2 }}>{receipt.id}</div>
              <div style={{ fontSize: 11, color: '#5C5C70' }}>{new Date().toLocaleString('id-ID')}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              {receipt.items?.map((i, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7, color: '#A0A0B0' }}>
                  <span>{typeof i === 'string' ? i : `${i.name} × ${i.qty}`}</span>
                  <span>{typeof i === 'string' ? '' : G(i.price * i.qty)}</span>
                </div>
              ))}
              <div style={{ height: 1, background: '#28282F', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 15 }}>
                <span style={{ color: '#A0A0B0' }}>TOTAL</span>
                <span style={{ color: '#F2A900' }}>{G(receipt.amount || receipt.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5C5C70', marginTop: 6 }}>
                <span>Metode Pembayaran</span><span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#0EC278' }}>{receipt.method}</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, color: '#5C5C70', borderTop: '1px solid #28282F', paddingTop: 14, lineHeight: 1.8 }}>
              Terima kasih telah mempercayakan<br />kendaraan Anda pada AURA Auto Care
            </div>
            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => { window.print(); setReceipt(null); }}>
              🖨️ Cetak Struk Transaksi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
