import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

const PAYMENT_METHODS = [
  { id:'qris', label:'QRIS', icon:'📱', color:'#38BDF8' },
  { id:'cash', label:'Tunai', icon:'💵', color:'#0EC278' },
  { id:'transfer', label:'Transfer', icon:'🏦', color:'#F2A900' },
  { id:'debit', label:'Debit/CC', icon:'💳', color:'#A855F7' },
];

const QUICK_ITEMS = [
  { id:'fast_clean', name:'Fast Clean Express', price:75000, cat:'service' },
  { id:'premium_clean', name:'Premium Clean', price:250000, cat:'service' },
  { id:'wax_premium', name:'Premium Wax Kit', price:185000, cat:'product' },
  { id:'interior_kit', name:'Interior Care Kit', price:145000, cat:'product' },
  { id:'tire_kit', name:'Tire Shine Kit', price:95000, cat:'product' },
  { id:'parfum', name:'Car Parfume Luxury', price:65000, cat:'product' },
  { id:'microfiber', name:'Microfiber Cloth 5-pack', price:45000, cat:'product' },
];

export const KasirPOS = () => {
  const { transactions, processPayment, reservations, payUnpaidReservation, inventory, showToast } = useCarWash();
  const [cart, setCart] = useState([]);
  const [method, setMethod] = useState('qris');
  const [cashIn, setCashIn] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [tab, setTab] = useState('pos');
  const [discount, setDiscount] = useState(0);

  const unpaidQueue = reservations.filter(r => r.paymentStatus === 'unpaid' && !['completed', 'cancelled'].includes(r.status));

  const addItem = (item) => {
    setCart(c => {
      const ex = c.find(x => x.id === item.id);
      return ex ? c.map(x => x.id===item.id ? {...x, qty:x.qty+1} : x) : [...c, {...item, qty:1}];
    });
  };

  const removeItem = (id) => setCart(c => c.filter(x => x.id !== id));
  const updateQty = (id, qty) => { if(qty<1) { removeItem(id); return; } setCart(c => c.map(x => x.id===id ? {...x, qty} : x)); };

  const subtotal = cart.reduce((s,i) => s+i.price*i.qty, 0);
  const disc = Math.round(subtotal * discount / 100);
  const total = subtotal - disc;
  const cashInNum = Number(cashIn.replace(/\D/g,'')) || 0;
  const change = cashInNum - total;

  const handleProcess = () => {
    if (cart.length === 0) { showToast('Keranjang kosong', 'error'); return; }
    const tx = processPayment({ items: cart, total, discount, method });
    setReceipt(tx);
    setCart([]); setCashIn(''); setDiscount(0);
  };

  const dayTotal = transactions.reduce((s,t) => s + (t.amount || t.total || 0), 0);
  const txToday = [...transactions].slice(-10).reverse();

  return (
    <div style={{ maxWidth:1280, margin:'0 auto', padding:'28px 20px' }}>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid #28282F', paddingBottom:0 }}>
        {[
          { id:'pos',label:'💳 Point of Sale'},
          { id:'unpaid', label: `📌 Belum Bayar Kasir (${unpaidQueue.length})` },
          { id:'history',label:'📋 Riwayat Transaksi'}
        ].map(t => {
          const active = tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:'flex', alignItems:'center', gap:7, padding:'10px 18px',
              border:'none', cursor:'pointer', fontSize:13, fontWeight:active?700:500,
              background:'transparent', color: active ? '#F2A900' : (t.id==='unpaid'&&unpaidQueue.length>0 ? '#F04F4F' : '#A0A0B0'),
              borderBottom: active?'2px solid #F2A900':'2px solid transparent', marginBottom:-1, transition:'all .15s',
            }}>
              {t.label}
              {t.id==='unpaid' && unpaidQueue.length > 0 && (
                <span style={{ background:'#F04F4F', color:'#fff', borderRadius:'99px', fontSize:10, fontWeight:800, padding:'1px 6px' }}>{unpaidQueue.length}</span>
              )}
            </button>
          );
        })}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10, paddingBottom:8 }}>
          <span style={{ fontSize:11, color:'#5C5C70', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:700 }}>Omzet Hari Ini</span>
          <span style={{ fontWeight:900, color:'#F2A900', fontSize:18, letterSpacing:'-.02em' }}>{G(dayTotal)}</span>
        </div>
      </div>

      {/* ═══ TAB: POS KASIR ════════════════════════════════════════════ */}
      {tab === 'pos' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' }}>

          {/* LEFT: product grid & unpaid notification box */}
          <div>
            {unpaidQueue.length > 0 && (
              <div style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(240,79,79,.08)', border: '1px solid rgba(240,79,79,.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>📌</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#F04F4F' }}>Ada {unpaidQueue.length} Pelanggan Belum Bayar Tunai (Walk-In/Reservasi)</div>
                    <div style={{ fontSize: 11, color: '#A0A0B0' }}>Klik tab "Belum Bayar Kasir" untuk memproses pembayaran tunai.</div>
                  </div>
                </div>
                <button className="btn btn-gold" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => setTab('unpaid')}>
                  Lihat Antrean →
                </button>
              </div>
            )}

            <p className="tag" style={{ marginBottom:14 }}>Daftar Layanan &amp; Produk</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
              {QUICK_ITEMS.map(item => (
                <button key={item.id} onClick={() => addItem(item)} style={{
                  background:'#141417', border:'1px solid #28282F', borderRadius:12, padding:'16px 14px',
                  cursor:'pointer', textAlign:'left', transition:'all .15s',
                  fontFamily:'inherit',
                }} onMouseEnter={e=>{ e.currentTarget.style.borderColor='#F2A900'; e.currentTarget.style.background='#1a1500'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='#28282F'; e.currentTarget.style.background='#141417'; }}>
                  <div style={{ fontSize:20, marginBottom:10 }}>{item.cat==='service' ? (item.id==='fast_clean'?'⚡':'✦') : '🧴'}</div>
                  <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color: item.cat==='service'?'#F2A900':'#38BDF8', display:'block', marginBottom:6 }}>{item.cat}</span>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:6, lineHeight:1.3 }}>{item.name}</div>
                  <div style={{ fontSize:16, fontWeight:900, color:'#F2A900', letterSpacing:'-.02em' }}>{G(item.price)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: cart & payment */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>🛒 Keranjang Belanja</span>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#F04F4F', fontSize:11, fontWeight:700 }}>
                  Hapus Semua
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div style={{ padding:'30px 0', textAlign:'center', color:'#5C5C70', fontSize:13, borderRadius:10, border:'1px dashed #28282F', marginBottom:20 }}>
                Pilih item di panel kiri
              </div>
            ) : (
              <div className="scroll-list" style={{ maxHeight:250, display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                {cart.map(c => (
                  <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'#0D0D0F', borderRadius:8, border:'1px solid #28282F' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700 }}>{c.name}</div>
                      <div style={{ fontSize:11, color:'#5C5C70' }}>{G(c.price)}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <button onClick={() => updateQty(c.id, c.qty-1)} style={{ width:22, height:22, borderRadius:5, background:'#28282F', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                      <span style={{ fontSize:12, fontWeight:700, minWidth:16, textAlign:'center' }}>{c.qty}</span>
                      <button onClick={() => updateQty(c.id, c.qty+1)} style={{ width:22, height:22, borderRadius:5, background:'#28282F', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                    </div>
                    <span style={{ fontSize:12.5, fontWeight:800, color:'#F2A900', minWidth:65, textAlign:'right' }}>{G(c.price*c.qty)}</span>
                    <button onClick={() => removeItem(c.id)} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:14, padding:'2px' }} title="Hapus Barang">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Discount */}
            <div style={{ marginBottom:14 }}>
              <label className="label">Diskon (%)</label>
              <select value={discount} onChange={e => setDiscount(Number(e.target.value))} className="input">
                <option value={0}>Tidak ada</option>
                <option value={5}>5% — Promo Member</option>
                <option value={10}>10% — VIP Gold</option>
                <option value={15}>15% — VIP Platinum</option>
              </select>
            </div>

            {/* Summary */}
            <div style={{ background:'#0D0D0F', borderRadius:10, padding:'12px 14px', border:'1px solid #28282F', marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#A0A0B0', marginBottom:5 }}>
                <span>Subtotal</span><span>{G(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#0EC278', marginBottom:5 }}>
                  <span>Diskon ({discount}%)</span><span>- {G(disc)}</span>
                </div>
              )}
              <div style={{ height:1, background:'#28282F', margin:'8px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:900 }}>
                <span style={{ color:'#A0A0B0', fontSize:13 }}>TOTAL</span>
                <span style={{ color:'#F2A900', letterSpacing:'-.02em' }}>{G(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom:14 }}>
              <label className="label">Metode Pembayaran</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.id} onClick={() => setMethod(pm.id)} style={{
                    padding:'9px 4px', borderRadius:8, border:`1px solid ${method===pm.id ? pm.color : '#28282F'}`,
                    background: method===pm.id ? `${pm.color}18` : '#0D0D0F',
                    cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all .15s',
                  }}>
                    <span style={{ fontSize:16 }}>{pm.icon}</span>
                    <span style={{ fontSize:10, fontWeight:700, color: method===pm.id ? pm.color : '#5C5C70' }}>{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {method === 'cash' && (
              <div style={{ marginBottom:14 }}>
                <label className="label">Uang Tunai Masuk</label>
                <input className="input mono" placeholder="0" value={cashIn} onChange={e => setCashIn(e.target.value)} />
                {cashInNum >= total && (
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700, color:'#0EC278', marginTop:8, padding:'8px 10px', background:'rgba(14,194,120,.08)', borderRadius:8, border:'1px solid rgba(14,194,120,.2)' }}>
                    <span>Kembalian</span><span>{G(change)}</span>
                  </div>
                )}
              </div>
            )}

            <button className="btn btn-gold" onClick={handleProcess} style={{ width:'100%', justifyContent:'center', padding:'13px 0', fontSize:14 }}>
              💳 Proses Transaksi &amp; Cetak Struk
            </button>
          </div>
        </div>
      )}

      {/* ═══ TAB: ANTREAN BELUM BAYAR (PEMBAYARAN CASH WELCOMER) ════════ */}
      {tab === 'unpaid' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #28282F' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#F04F4F' }}>📌 Antrean Belum Bayar (Pembayaran Tunai Kasir)</h3>
              <p style={{ fontSize: 12, color: '#5C5C70' }}>Pelanggan walk-in / reservasi yang memilih bayar tunai di meja Kasir POS</p>
            </div>
            <span className="badge" style={{ background: 'rgba(240,79,79,.15)', color: '#F04F4F', border: '1px solid rgba(240,79,79,.3)', fontSize: 12 }}>
              {unpaidQueue.length} Antrean Pending
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr><th>No. Antrean</th><th>Kode Booking</th><th>Pelanggan</th><th>Kendaraan</th><th>Layanan</th><th>Total Tagihan</th><th>Aksi Kasir</th></tr>
            </thead>
            <tbody>
              {unpaidQueue.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#5C5C70', padding: '40px 0' }}>Tidak ada antrean pending pembayaran saat ini</td></tr>
              )}
              {unpaidQueue.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 900, fontSize: 20, color: '#F2A900', fontFamily: 'monospace' }}>#{r.queueNumber}</td>
                  <td className="mono" style={{ color: '#38BDF8', fontWeight: 700 }}>{r.bookingCode}</td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.customerName}</div>
                    <div style={{ fontSize: 11, color: '#5C5C70' }}>{r.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{r.vehicle}</div>
                    <div className="mono" style={{ fontSize: 11, color: '#A0A0B0' }}>{r.plate}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{r.serviceName}</td>
                  <td style={{ fontSize: 16, fontWeight: 900, color: '#F2A900' }}>{G(r.price)}</td>
                  <td>
                    <button className="btn btn-gold" style={{ fontSize: 11, padding: '8px 14px' }} onClick={() => payUnpaidReservation(r.id, 'cash')}>
                      💵 Terima Bayar Tunai (LUNAS)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ TAB: RIWAYAT TRANSAKSI ═════════════════════════════════════ */}
      {tab === 'history' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
            {[
              { label:'Total Transaksi', value: transactions.length, sub:'hari ini', color:'#F2A900' },
              { label:'Omzet Service', value: G(dayTotal * 0.7), sub:'dari layanan cuci', color:'#0EC278' },
              { label:'Omzet Produk', value: G(dayTotal * 0.3), sub:'dari merchandise', color:'#38BDF8' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding:'18px 22px' }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color, fontSize:24, marginTop:8 }}>{s.value}</div>
                <div style={{ fontSize:11, color:'#5C5C70', marginTop:4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ overflow:'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID Invoice</th><th>Pelanggan</th><th>Detail / Channel</th><th>Total</th><th>Metode</th><th>Waktu</th></tr>
              </thead>
              <tbody>
                {txToday.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', color:'#5C5C70', padding:'40px 0' }}>Belum ada transaksi hari ini</td></tr>
                )}
                {txToday.map(t => (
                  <tr key={t.id}>
                    <td className="mono" style={{ fontSize:11, color:'#5C5C70' }}>{t.id}</td>
                    <td style={{ fontWeight:700 }}>{t.customer || t.customerName || 'Walk-In'}</td>
                    <td style={{ fontSize:12, color:'#A0A0B0' }}>{Array.isArray(t.items) ? t.items.join(', ') : t.channel}</td>
                    <td style={{ fontWeight:800, color:'#F2A900' }}>{G(t.amount || t.total)}</td>
                    <td><span className="badge badge-gold">{(t.method || 'qris').toUpperCase()}</span></td>
                    <td className="mono" style={{ fontSize:11, color:'#5C5C70' }}>{t.date || t.time || 'WIB'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && (
        <div className="modal-overlay" onClick={() => setReceipt(null)}>
          <div onClick={e => e.stopPropagation()} className="printable" style={{
            background:'#141417', border:'1px solid #28282F', borderRadius:14, padding:24, maxWidth:380, width:'100%',
          }}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:22, fontWeight:900, letterSpacing:'.04em', color:'#F2A900', marginBottom:4 }}>AURA</div>
              <div style={{ fontSize:11, color:'#5C5C70', letterSpacing:'.1em', textTransform:'uppercase' }}>Auto Care · Senopati Flagship</div>
              <div style={{ height:1, background:'#28282F', margin:'14px 0' }} />
              <div className="mono" style={{ fontSize:11, color:'#5C5C70', marginBottom:2 }}>{receipt.id}</div>
              <div style={{ fontSize:11, color:'#5C5C70' }}>{new Date().toLocaleString('id-ID')}</div>
            </div>
            <div style={{ marginBottom:16 }}>
              {receipt.items?.map((i, idx) => (
                <div key={idx} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:7, color:'#A0A0B0' }}>
                  <span>{typeof i === 'string' ? i : `${i.name} × ${i.qty}`}</span>
                  <span>{typeof i === 'string' ? '' : G(i.price * i.qty)}</span>
                </div>
              ))}
              <div style={{ height:1, background:'#28282F', margin:'12px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:15 }}>
                <span style={{ color:'#A0A0B0' }}>TOTAL</span>
                <span style={{ color:'#F2A900' }}>{G(receipt.amount || receipt.total)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#5C5C70', marginTop:6 }}>
                <span>Metode</span><span style={{ textTransform:'uppercase' }}>{receipt.method}</span>
              </div>
            </div>
            <div style={{ textAlign:'center', fontSize:11, color:'#5C5C70', borderTop:'1px solid #28282F', paddingTop:14, lineHeight:1.8 }}>
              Terima kasih telah mempercayakan<br/>kendaraan Anda pada AURA Auto Care
            </div>
            <button className="btn btn-gold" style={{ width:'100%', justifyContent:'center', marginTop:16 }} onClick={() => { window.print(); setReceipt(null); }}>
              🖨️ Cetak Struk
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
