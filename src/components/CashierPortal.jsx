import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';
import { 
  CreditCard, Printer, ShoppingCart, Plus, Minus, Trash2, 
  CheckCircle2, DollarSign, Wallet, RefreshCw, X 
} from 'lucide-react';

export const CashierPortal = () => {
  const { inventory, addPosTransaction, showToast } = useCarWash();

  const services = [
    { id: 'fast_clean', name: 'Fast Clean Express', price: 75000 },
    { id: 'premium_clean', name: 'Premium Clean & Detailing', price: 250000 }
  ];

  const retailProducts = inventory.filter(i => i.category !== 'operasional');

  const [selectedService, setSelectedService] = useState(services[0]);
  const [retailCart, setRetailCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [cashAmount, setCashAmount] = useState('');

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastTxReceipt, setLastTxReceipt] = useState(null);

  const addRetailToCart = (prod) => {
    const existing = retailCart.find(c => c.id === prod.id);
    if (existing) {
      setRetailCart(retailCart.map(c => c.id === prod.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setRetailCart([...retailCart, { ...prod, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setRetailCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const retailSubtotal = retailCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const grandTotal = (selectedService ? selectedService.price : 0) + retailSubtotal;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!selectedService && retailCart.length === 0) {
      showToast('Pilih minimal 1 paket layanan atau produk retail!', 'warning');
      return;
    }

    const itemsSummary = [];
    if (selectedService) itemsSummary.push(`${selectedService.name} (Rp ${selectedService.price.toLocaleString('id-ID')})`);
    retailCart.forEach(i => itemsSummary.push(`${i.name} (${i.qty}x)`));

    const tx = addPosTransaction({
      customerName: customerName || 'Walk-In Customer',
      totalAmount: grandTotal,
      paymentMethod: paymentMethod,
      serviceId: selectedService?.id,
      retailItems: retailCart,
      itemsSummary: itemsSummary
    });

    setLastTxReceipt({
      ...tx,
      service: selectedService,
      retail: retailCart,
      cashAmount: cashAmount ? parseFloat(cashAmount) : grandTotal,
      change: cashAmount ? Math.max(0, parseFloat(cashAmount) - grandTotal) : 0
    });

    setShowReceiptModal(true);
    setRetailCart([]);
    setCustomerName('');
    setCashAmount('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#242832] pb-4">
        <div>
          <span className="badge-pill badge-gold mb-1">POS Front Office Console</span>
          <h2 className="text-xl font-bold text-white font-heading">Pengkasiran & Transaksi Onsite</h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Operator Shift:</span>
          <span className="text-xs font-bold text-white font-mono">Kasir - Rian Pratama</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product & Service Selector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Pilih Layanan Pencucian</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map(s => (
                <div 
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`card-executive p-4 cursor-pointer transition-all border ${
                    selectedService?.id === s.id ? 'border-[#F5B800] bg-[#F5B800]/10' : 'border-[#242832]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-xs">{s.name}</h4>
                    {selectedService?.id === s.id && <CheckCircle2 size={16} className="text-[#F5B800]" />}
                  </div>
                  <p className="text-base font-black text-[#F5B800] mt-1 font-heading">
                    Rp {s.price.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Add-on Retail Products */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Tambahkan Produk Retail Add-On</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {retailProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => addRetailToCart(p)}
                  className="card-executive p-3 cursor-pointer hover:border-[#F5B800] transition-all space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <h5 className="font-bold text-white text-xs line-clamp-1">{p.name}</h5>
                    <p className="text-xs text-[#F5B800] font-bold mt-0.5">Rp {p.price.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-400">Stok: {p.stock}</p>
                  </div>
                  <button className="btn-dark py-1 text-[11px] w-full justify-center">
                    + Tambah
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Checkout Sidebar */}
        <div className="card-executive p-5 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2 border-b border-[#242832] pb-3">
            <ShoppingCart size={16} className="text-[#F5B800]" /> Ringkasan Transaksi
          </h3>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nama Pelanggan (Opsional)</label>
              <input 
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Walk-In Customer"
                className="input-executive text-xs"
              />
            </div>

            {/* Selected Items List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedService && (
                <div className="flex justify-between items-center text-xs bg-[#0B0C0E] p-2.5 rounded-lg border border-[#242832]">
                  <span className="font-bold text-white">{selectedService.name}</span>
                  <span className="text-[#F5B800] font-bold">Rp {selectedService.price.toLocaleString('id-ID')}</span>
                </div>
              )}

              {retailCart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs bg-[#0B0C0E] p-2 rounded-lg border border-[#242832]">
                  <div className="truncate max-w-[140px]">
                    <span className="font-bold text-white block truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400">Rp {item.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQty(item.id, -1)} className="text-slate-400 hover:text-white"><Minus size={12} /></button>
                    <span className="font-bold text-white">{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item.id, 1)} className="text-slate-400 hover:text-white"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 border-t border-[#242832] pt-3">
              <label className="text-xs text-slate-400 block">Metode Pembayaran</label>
              <select 
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="input-executive text-xs cursor-pointer"
              >
                <option value="qris">QRIS Dynamic Monitor</option>
                <option value="cash">Tunai (Cash)</option>
                <option value="credit_card">Kartu Kredit / Debit</option>
              </select>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Uang Diterima (Rp)</label>
                  <input 
                    type="number" 
                    value={cashAmount}
                    onChange={e => setCashAmount(e.target.value)}
                    placeholder={grandTotal}
                    className="input-executive text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Total Section */}
            <div className="bg-[#0B0C0E] p-3 rounded-xl border border-[#242832] space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Biaya:</span>
                <span className="text-white font-bold">Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
              {paymentMethod === 'cash' && cashAmount && (
                <div className="flex justify-between text-xs text-[#10B981]">
                  <span>Kembalian:</span>
                  <span className="font-bold">Rp {Math.max(0, parseFloat(cashAmount) - grandTotal).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn-gold w-full justify-center py-3 text-xs">
              Konfirmasi & Cetak Struk <Printer size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Printable Thermal Receipt Modal */}
      {showReceiptModal && lastTxReceipt && (
        <div className="modal-overlay">
          <div className="card-executive p-6 max-w-sm w-full space-y-4 relative text-center">
            <div className="flex justify-between items-center border-b border-[#242832] pb-2">
              <h3 className="text-sm font-bold text-white">Struk Transaksi POS</h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>

            <div className="printable-receipt bg-white text-black p-4 rounded-lg text-left text-xs font-mono space-y-2 shadow-inner">
              <div className="text-center font-bold text-sm">AURA LUXURY CAR WASH</div>
              <div className="text-center text-[10px] text-slate-600">Jl. Senopati No. 88, Jakarta Selatan</div>
              <div className="text-center text-[10px] text-slate-600">Telp: (021) 555-8899</div>
              <hr className="border-black border-dashed" />
              <div>No. Invoice : {lastTxReceipt.id}</div>
              <div>Waktu       : {lastTxReceipt.date}</div>
              <div>Kasir       : {lastTxReceipt.cashier}</div>
              <div>Pelanggan   : {lastTxReceipt.customer}</div>
              <hr className="border-black border-dashed" />
              
              <div className="space-y-1">
                {lastTxReceipt.service && (
                  <div className="flex justify-between">
                    <span>{lastTxReceipt.service.name}</span>
                    <span>{lastTxReceipt.service.price.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {lastTxReceipt.retail.map(r => (
                  <div key={r.id} className="flex justify-between">
                    <span>{r.name} x{r.qty}</span>
                    <span>{(r.price * r.qty).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <hr className="border-black border-dashed" />
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>Rp {lastTxReceipt.amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Metode Bayar</span>
                <span>{lastTxReceipt.method.toUpperCase()}</span>
              </div>
              {lastTxReceipt.method === 'cash' && (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span>Tunai</span>
                    <span>Rp {lastTxReceipt.cashAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Kembali</span>
                    <span>Rp {lastTxReceipt.change.toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}
              <hr className="border-black border-dashed" />
              <div className="text-center text-[10px] mt-2">Terima kasih atas kunjungan Anda!</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => window.print()} className="btn-gold w-full justify-center text-xs">
                <Printer size={14} /> Cetak Struk Thermal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
