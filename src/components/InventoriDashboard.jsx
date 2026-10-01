import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

export const InventoriDashboard = () => {
  const { inventory, updateInventory, showToast } = useCarWash();
  const [tab, setTab] = useState('stock');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name:'', sku:'', category:'operasional', stock:0, minStock:0, unit:'pcs', price:0, cost:0 });

  const cats = ['all', ...Array.from(new Set(inventory.map(i => i.category)))];
  const filtered = inventory.filter(i => {
    const matchCat = catFilter === 'all' || i.category === catFilter;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStock = inventory.filter(i => i.stock <= i.minStock);
  const totalValue = inventory.reduce((s,i) => s + i.stock * i.cost, 0);

  const handleEdit = (e) => {
    e.preventDefault();
    updateInventory(editModal);
    setEditModal(null);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    updateInventory({ ...newItem, id: `inv_${Date.now()}`, createdAt: new Date().toISOString() });
    setNewItem({ name:'', sku:'', category:'operasional', stock:0, minStock:0, unit:'pcs', price:0, cost:0 });
    setAddModal(false);
  };

  const STOCK_BAR = (item) => {
    const pct = Math.min(100, Math.round(item.stock / Math.max(item.minStock * 3, item.stock) * 100));
    const color = item.stock <= item.minStock ? '#F04F4F' : item.stock <= item.minStock * 1.5 ? '#F2A900' : '#0EC278';
    return { pct, color };
  };

  return (
    <div style={{ maxWidth:1280, margin:'0 auto', padding:'28px 20px' }}>

      {/* STATS ROW */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Total Item SKU', value: inventory.length, color:'#F2A900', icon:'📦' },
          { label:'Nilai Total Stok', value: G(totalValue), color:'#0EC278', icon:'💰', small:true },
          { label:'Stok Kritis', value: lowStock.length, color:'#F04F4F', icon:'⚠️' },
          { label:'Kategori', value: cats.length - 1, color:'#38BDF8', icon:'🏷️' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:42, height:42, borderRadius:10, background:`${s.color}18`, border:`1px solid ${s.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ color:s.color, fontSize: s.small ? 18 : 26 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* LOW STOCK ALERTS */}
      {lowStock.length > 0 && (
        <div style={{ padding:'14px 18px', background:'rgba(240,79,79,.07)', border:'1px solid rgba(240,79,79,.2)', borderRadius:12, marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ fontSize:14 }}>⚠️</span>
            <span style={{ fontWeight:700, fontSize:13, color:'#F04F4F' }}>{lowStock.length} Item Stok Kritis / Menipis</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {lowStock.map(i => (
              <span key={i.id} style={{ padding:'4px 10px', background:'rgba(240,79,79,.1)', border:'1px solid rgba(240,79,79,.25)', borderRadius:99, fontSize:11, fontWeight:700, color:'#F04F4F' }}>
                {i.name} — {i.stock} {i.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TOOLBAR */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:20, alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} className="input" placeholder="🔍 Cari nama atau SKU..." style={{ maxWidth:280 }} />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{
              padding:'7px 14px', borderRadius:8, border:'1px solid', fontSize:12, fontWeight:600, cursor:'pointer',
              borderColor: catFilter===c ? '#F2A900' : '#28282F',
              background: catFilter===c ? 'rgba(242,169,0,.12)' : 'transparent',
              color: catFilter===c ? '#F2A900' : '#A0A0B0',
              textTransform:'capitalize',
            }}>{c === 'all' ? 'Semua' : c}</button>
          ))}
        </div>
        <button className="btn btn-gold" style={{ marginLeft:'auto' }} onClick={() => setAddModal(true)}>
          + Tambah Item
        </button>
      </div>

      {/* STOCK TABLE */}
      <div className="card" style={{ overflow:'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>SKU</th><th>Nama Item</th><th>Kategori</th><th>Stok Saat Ini</th><th>Min. Stok</th><th>Level Stok</th><th>HPP</th><th>Harga Jual</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign:'center', color:'#5C5C70', padding:'40px 0' }}>Tidak ada item ditemukan</td></tr>
            )}
            {filtered.map(item => {
              const { pct, color } = STOCK_BAR(item);
              const isCrit = item.stock <= item.minStock;
              return (
                <tr key={item.id}>
                  <td className="mono" style={{ fontSize:11, color:'#5C5C70' }}>{item.sku}</td>
                  <td style={{ fontWeight:700 }}>{item.name}</td>
                  <td><span className="badge badge-gold" style={{ textTransform:'capitalize' }}>{item.category}</span></td>
                  <td>
                    <span style={{ fontWeight:800, fontSize:16, color: isCrit ? '#F04F4F' : '#fff' }}>{item.stock}</span>
                    <span style={{ fontSize:11, color:'#5C5C70', marginLeft:4 }}>{item.unit}</span>
                  </td>
                  <td style={{ fontSize:13, color:'#A0A0B0' }}>{item.minStock} {item.unit}</td>
                  <td style={{ minWidth:120 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width:`${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
                    </div>
                    <div style={{ fontSize:10, color: isCrit ? '#F04F4F' : '#5C5C70', marginTop:3 }}>{isCrit ? '🔴 KRITIS' : `${pct}%`}</div>
                  </td>
                  <td style={{ fontSize:12, color:'#A0A0B0' }}>{G(item.cost)}</td>
                  <td style={{ fontWeight:700, color:'#F2A900' }}>{G(item.price)}</td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-ghost" style={{ fontSize:11, padding:'5px 10px' }} onClick={() => setEditModal({...item})}>Edit</button>
                      {isCrit && <button className="btn" style={{ fontSize:11, padding:'5px 10px', background:'rgba(240,79,79,.12)', color:'#F04F4F', border:'1px solid rgba(240,79,79,.25)', borderRadius:8 }}>PO</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="card" onClick={e=>e.stopPropagation()} style={{ padding:28, maxWidth:480, width:'100%' }}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:20, paddingBottom:14, borderBottom:'1px solid #28282F' }}>
              Edit Item — <span style={{ color:'#F2A900' }}>{editModal.name}</span>
            </div>
            <form onSubmit={handleEdit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="label">Nama Item</label>
                <input className="input" value={editModal.name} onChange={e=>setEditModal({...editModal,name:e.target.value})} required />
              </div>
              <div>
                <label className="label">Stok</label>
                <input type="number" className="input" value={editModal.stock} onChange={e=>setEditModal({...editModal,stock:Number(e.target.value)})} />
              </div>
              <div>
                <label className="label">Minimum Stok</label>
                <input type="number" className="input" value={editModal.minStock} onChange={e=>setEditModal({...editModal,minStock:Number(e.target.value)})} />
              </div>
              <div>
                <label className="label">HPP (Cost)</label>
                <input type="number" className="input" value={editModal.cost} onChange={e=>setEditModal({...editModal,cost:Number(e.target.value)})} />
              </div>
              <div>
                <label className="label">Harga Jual</label>
                <input type="number" className="input" value={editModal.price} onChange={e=>setEditModal({...editModal,price:Number(e.target.value)})} />
              </div>
              <div style={{ gridColumn:'1/-1', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(null)} style={{ justifyContent:'center' }}>Batal</button>
                <button type="submit" className="btn btn-gold" style={{ justifyContent:'center' }}>Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(false)}>
          <div className="card" onClick={e=>e.stopPropagation()} style={{ padding:28, maxWidth:520, width:'100%' }}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:20, paddingBottom:14, borderBottom:'1px solid #28282F' }}>+ Tambah Item Baru</div>
            <form onSubmit={handleAdd} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="label">Nama Item</label>
                <input className="input" placeholder="cth. Shampoo Carwash 5L" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})} required />
              </div>
              <div>
                <label className="label">SKU</label>
                <input className="input mono" placeholder="BAHAN-001" value={newItem.sku} onChange={e=>setNewItem({...newItem,sku:e.target.value})} required />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select className="input" value={newItem.category} onChange={e=>setNewItem({...newItem,category:e.target.value})}>
                  <option value="operasional">Operasional</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="autocare">Auto Care</option>
                </select>
              </div>
              <div>
                <label className="label">Stok Awal</label>
                <input type="number" className="input" value={newItem.stock} onChange={e=>setNewItem({...newItem,stock:Number(e.target.value)})} />
              </div>
              <div>
                <label className="label">Min. Stok</label>
                <input type="number" className="input" value={newItem.minStock} onChange={e=>setNewItem({...newItem,minStock:Number(e.target.value)})} />
              </div>
              <div>
                <label className="label">Unit</label>
                <select className="input" value={newItem.unit} onChange={e=>setNewItem({...newItem,unit:e.target.value})}>
                  <option value="pcs">pcs</option>
                  <option value="liter">liter</option>
                  <option value="kg">kg</option>
                  <option value="lusin">lusin</option>
                </select>
              </div>
              <div>
                <label className="label">HPP (Cost)</label>
                <input type="number" className="input" value={newItem.cost} onChange={e=>setNewItem({...newItem,cost:Number(e.target.value)})} />
              </div>
              <div>
                <label className="label">Harga Jual</label>
                <input type="number" className="input" value={newItem.price} onChange={e=>setNewItem({...newItem,price:Number(e.target.value)})} />
              </div>
              <div style={{ gridColumn:'1/-1', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setAddModal(false)} style={{ justifyContent:'center' }}>Batal</button>
                <button type="submit" className="btn btn-gold" style={{ justifyContent:'center' }}>+ Tambah Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
