import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';
import { 
  Package, PlusCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, 
  ShoppingBag, CheckCircle2, RefreshCw, Layers 
} from 'lucide-react';

export const InventoryPortal = () => {
  const { inventory, restockItem, marketplaceOrders, setMarketplaceOrders, showToast } = useCarWash();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  const filteredInventory = selectedCategory === 'all' 
    ? inventory 
    : inventory.filter(i => i.category === selectedCategory);

  const lowStockItems = inventory.filter(i => i.stock <= i.minAlert);

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !restockQty || parseFloat(restockQty) <= 0) return;
    restockItem(selectedProduct.id, restockQty);
    setShowRestockModal(false);
    setSelectedProduct(null);
    setRestockQty('');
  };

  const markOrderReady = (orderId) => {
    setMarketplaceOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'ready_for_pickup' };
      }
      return o;
    }));
    showToast(`Pesanan ${orderId} siap diambil pelanggan!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#242832] pb-4">
        <div>
          <span className="badge-pill badge-gold mb-1">Inventory Management Portal</span>
          <h2 className="text-xl font-bold text-white font-heading">Manajemen Stok & Bahan Baku Operasional</h2>
        </div>

        <div className="flex items-center gap-3">
          {lowStockItems.length > 0 && (
            <span className="badge-pill badge-danger text-xs px-3 py-1.5 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle size={14} /> {lowStockItems.length} Stok Kritis Minta Restock
            </span>
          )}
          <button 
            onClick={() => {
              setSelectedProduct(inventory[0]);
              setShowRestockModal(true);
            }}
            className="btn-gold text-xs"
          >
            <PlusCircle size={15} /> Catat Restock Barang Masuk
          </button>
        </div>
      </div>

      {/* Formula & Deductions Rules Card */}
      <div className="card-executive p-5 border-l-4 border-l-[#06B6D4] space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <Layers size={16} className="text-[#06B6D4]" /> Real-Time Automatic Stock Deduction Engine
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Formula Service Material</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-slate-300">
          <div className="bg-[#0B0C0E] p-3 rounded-xl border border-[#242832]">
            <span className="font-bold text-[#F5B800] block mb-1">Fast Clean Wash Formula:</span>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• Hydro Shampoo: -0.100 Liter per cuci</li>
              <li>• Tire Dressing: -0.050 Liter per cuci</li>
            </ul>
          </div>
          <div className="bg-[#0B0C0E] p-3 rounded-xl border border-[#242832]">
            <span className="font-bold text-[#F5B800] block mb-1">Premium Clean & Detailing Formula:</span>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• Hydro Shampoo: -0.200 Liter per cuci</li>
              <li>• Ceramic Quartz Wax: -0.050 Liter per cuci</li>
              <li>• Tire Dressing: -0.080 Liter per cuci</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Grid: Inventory Table & Marketplace Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Master Table */}
        <div className="lg:col-span-2 card-executive p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242832] pb-3">
            <h3 className="font-bold text-white text-base font-heading">Daftar Stok Inventori</h3>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedCategory === 'all' ? 'bg-[#F5B800] text-[#0B0C0E] font-bold' : 'bg-[#1C1F26] text-slate-400 hover:text-white'}`}
              >
                Semua
              </button>
              <button 
                onClick={() => setSelectedCategory('operasional')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedCategory === 'operasional' ? 'bg-[#F5B800] text-[#0B0C0E] font-bold' : 'bg-[#1C1F26] text-slate-400 hover:text-white'}`}
              >
                Bahan Operasional
              </button>
              <button 
                onClick={() => setSelectedCategory('autocare')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedCategory === 'autocare' ? 'bg-[#F5B800] text-[#0B0C0E] font-bold' : 'bg-[#1C1F26] text-slate-400 hover:text-white'}`}
              >
                Retail Store
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-[#242832] bg-[#0B0C0E]">
                <tr>
                  <th className="p-3">SKU / Nama Produk</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-right">Harga Jual</th>
                  <th className="p-3 text-center">Stok Saat Ini</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242832]">
                {filteredInventory.map(item => {
                  const isLow = item.stock <= item.minAlert;
                  return (
                    <tr key={item.id} className="hover:bg-[#1C1F26]/50 transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                      </td>
                      <td className="p-3">
                        <span className="badge-pill badge-gold text-[10px] uppercase">{item.category}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        {item.price > 0 ? `Rp ${item.price.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-2.5 py-1 rounded-lg ${isLow ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40' : 'text-white'}`}>
                          {item.stock} {item.unit}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => {
                            setSelectedProduct(item);
                            setShowRestockModal(true);
                          }}
                          className="btn-dark text-[11px] py-1 px-2.5"
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Marketplace Order Notifications Queue */}
        <div className="card-executive p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-[#242832] pb-3">
            <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#F5B800]" /> Notifikasi Order Store
            </h3>
            <span className="badge-pill badge-gold">{marketplaceOrders.length} Order</span>
          </div>

          <div className="space-y-3">
            {marketplaceOrders.map(order => (
              <div key={order.id} className="bg-[#0B0C0E] p-3.5 rounded-xl border border-[#242832] space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#F5B800]">{order.id}</span>
                    <span className="text-xs text-white font-bold block">{order.user}</span>
                  </div>
                  <span className={`badge-pill ${order.status === 'ready_for_pickup' ? 'badge-emerald' : 'badge-gold'}`}>
                    {order.status === 'ready_for_pickup' ? 'Siap Diambil' : 'Perlu Disiapkan'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 border-t border-b border-[#242832] py-1.5 font-mono">
                  {order.items}
                </p>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Rp {order.total.toLocaleString('id-ID')}</span>
                  {order.status !== 'ready_for_pickup' && (
                    <button 
                      onClick={() => markOrderReady(order.id)}
                      className="btn-gold text-[10px] py-1 px-2"
                    >
                      Tandai Siap Diambil
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Restock */}
      {showRestockModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="card-executive p-6 max-w-md w-full space-y-4 relative">
            <h3 className="text-lg font-bold text-white font-heading">Input Restock Barang Masuk</h3>
            <p className="text-xs text-slate-400">Menambahkan jumlah stok fisik untuk produk: <b className="text-white">{selectedProduct.name}</b></p>
            
            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Stok Saat Ini</label>
                <input type="text" readOnly value={`${selectedProduct.stock} ${selectedProduct.unit}`} className="input-executive bg-[#14161B] cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Jumlah Tambahan Restock ({selectedProduct.unit})</label>
                <input 
                  type="number" 
                  step="0.1"
                  required 
                  value={restockQty} 
                  onChange={e => setRestockQty(e.target.value)} 
                  placeholder="Contoh: 10" 
                  className="input-executive font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#242832]">
                <button type="button" onClick={() => setShowRestockModal(false)} className="btn-dark w-full justify-center text-xs">
                  Batal
                </button>
                <button type="submit" className="btn-gold w-full justify-center text-xs">
                  Simpan Stok Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
