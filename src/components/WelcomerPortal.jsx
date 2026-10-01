import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';
import { 
  UserPlus, QrCode, Car, CheckCircle2, AlertCircle, ArrowRight, 
  CreditCard, Sparkles, Navigation, Printer, RefreshCw 
} from 'lucide-react';

export const WelcomerPortal = () => {
  const { 
    members, reservations, setReservations, registerMember, 
    addPosTransaction, showToast 
  } = useCarWash();

  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showQrScanModal, setShowQrScanModal] = useState(false);
  const [scannedTicket, setScannedTicket] = useState(null);

  const [walkName, setWalkName] = useState('');
  const [walkPhone, setWalkPhone] = useState('');
  const [walkVehicle, setWalkVehicle] = useState('');
  const [walkPlate, setWalkPlate] = useState('');
  const [walkService, setWalkService] = useState('fast_clean');
  const [walkPayment, setWalkPayment] = useState('qris');

  const [fastCleanBays, setFastCleanBays] = useState([
    { id: 1, name: 'Bay 1 Express', status: 'occupied', car: 'BMW X5 (B 1888 AUR)' },
    { id: 2, name: 'Bay 2 Express', status: 'available', car: null },
    { id: 3, name: 'Bay 3 Express', status: 'available', car: null }
  ]);

  const [premiumBays, setPremiumBays] = useState([
    { id: 1, name: 'Detailing Bay 1', status: 'in_progress', car: 'Porsche Macan (B 9999 VIP)' },
    { id: 2, name: 'Detailing Bay 2', status: 'available', car: null }
  ]);

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    const newMember = registerMember({
      name: walkName,
      phone: walkPhone,
      vehicle: walkVehicle,
      plate: walkPlate
    });

    const price = walkService === 'fast_clean' ? 75000 : 250000;
    const serviceName = walkService === 'fast_clean' ? 'Fast Clean Express' : 'Premium Clean & Detailing';

    addPosTransaction({
      customerName: newMember.name,
      totalAmount: price,
      paymentMethod: walkPayment,
      serviceId: walkService,
      itemsSummary: [`${serviceName} (Rp ${price.toLocaleString('id-ID')})`]
    });

    if (walkService === 'fast_clean') {
      setFastCleanBays(prev => prev.map(b => b.status === 'available' ? { ...b, status: 'occupied', car: `${walkVehicle} (${walkPlate})` } : b));
    } else {
      setPremiumBays(prev => prev.map(b => b.status === 'available' ? { ...b, status: 'in_progress', car: `${walkVehicle} (${walkPlate})` } : b));
    }

    setShowWalkInModal(false);
    setWalkName(''); setWalkPhone(''); setWalkVehicle(''); setWalkPlate('');
  };

  const simulateQrScan = (code) => {
    const found = reservations.find(r => r.bookingCode === code || r.plate === code);
    if (found) {
      setScannedTicket(found);
      setReservations(prev => prev.map(r => r.id === found.id ? { ...r, status: 'checked_in' } : r));
      showToast(`Scan Berhasil! Ticket ${found.bookingCode} terverifikasi Checked-In.`, 'success');
    } else {
      showToast(`Kode QR / Plat Nomor tidak ditemukan!`, 'warning');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="card-executive p-6 border-l-4 border-l-[#F5B800] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="badge-pill badge-gold mb-1">Welcomer Touchscreen Console</span>
          <h2 className="text-xl font-bold text-white font-heading">Pintu Masuk & Pendaftaran Walk-In</h2>
          <p className="text-xs text-slate-400 mt-1">Sambut pelanggan, scan tiket QR, atau daftarkan member baru dalam &lt; 45 detik.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowQrScanModal(true)}
            className="btn-gold text-xs py-3 px-5"
          >
            <QrCode size={16} /> Scan QR Ticket / Member
          </button>
          <button 
            onClick={() => setShowWalkInModal(true)}
            className="btn-dark text-xs py-3 px-5"
          >
            <UserPlus size={16} /> Input Member Walk-In Baru
          </button>
        </div>
      </div>

      {/* Touchscreen Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setShowWalkInModal(true)}
          className="card-executive p-6 cursor-pointer hover:border-[#F5B800] transition-all flex flex-col items-center text-center space-y-3 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F5B800]/15 text-[#F5B800] flex items-center justify-center group-hover:scale-110 transition-transform border border-[#F5B800]/30">
            <UserPlus size={26} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm font-heading">Registrasi Walk-In</h4>
            <p className="text-xs text-slate-400 mt-1">Daftarkan member baru & bayar di tempat</p>
          </div>
        </div>

        <div 
          onClick={() => setShowQrScanModal(true)}
          className="card-executive p-6 cursor-pointer hover:border-[#F5B800] transition-all flex flex-col items-center text-center space-y-3 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/15 text-[#06B6D4] flex items-center justify-center group-hover:scale-110 transition-transform border border-[#06B6D4]/30">
            <QrCode size={26} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm font-heading">Scan QR Reservasi</h4>
            <p className="text-xs text-slate-400 mt-1">Verifikasi tiket online booking</p>
          </div>
        </div>

        <div className="card-executive p-6 flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
            <Car size={26} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm font-heading">Fast Clean Bays</h4>
            <p className="text-xs text-slate-400 mt-1">2/3 Bay Tersedia</p>
          </div>
        </div>

        <div className="card-executive p-6 flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center border border-[#F59E0B]/30">
            <Sparkles size={26} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm font-heading">Premium Detailing Lounge</h4>
            <p className="text-xs text-slate-400 mt-1">1/2 Detailing Bay Aktif</p>
          </div>
        </div>
      </div>

      {/* Real-time Bay Monitoring & Direct Routing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Clean Bays */}
        <div className="card-executive p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#242832] pb-3">
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <Car size={16} className="text-[#F5B800]" /> Fast Clean Bays (Drive-Through)
            </h3>
            <span className="badge-pill badge-emerald">Pelanggan di Dalam Mobil</span>
          </div>

          <div className="space-y-3">
            {fastCleanBays.map(bay => (
              <div key={bay.id} className="bg-[#0B0C0E] p-4 rounded-xl border border-[#242832] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white text-xs">{bay.name}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {bay.car ? `Kendaraan: ${bay.car}` : 'Bay Kosong & Ready'}
                  </p>
                </div>
                <span className={`badge-pill ${bay.status === 'occupied' ? 'badge-gold' : 'badge-emerald'}`}>
                  {bay.status === 'occupied' ? 'Terisi' : 'Tersedia'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Detailing Bays */}
        <div className="card-executive p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#242832] pb-3">
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <Sparkles size={16} className="text-[#F5B800]" /> Premium Clean Bays (Lounge)
            </h3>
            <span className="badge-pill badge-gold">Video Before-After Active</span>
          </div>

          <div className="space-y-3">
            {premiumBays.map(bay => (
              <div key={bay.id} className="bg-[#0B0C0E] p-4 rounded-xl border border-[#242832] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white text-xs">{bay.name}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {bay.car ? `Kendaraan: ${bay.car}` : 'Bay Kosong & Ready'}
                  </p>
                </div>
                <span className={`badge-pill ${bay.status === 'in_progress' ? 'badge-gold' : 'badge-emerald'}`}>
                  {bay.status === 'in_progress' ? 'Pengerjaan & Video' : 'Tersedia'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Input Walk-In Member */}
      {showWalkInModal && (
        <div className="modal-overlay">
          <div className="card-executive p-6 max-w-lg w-full space-y-4 relative">
            <h3 className="text-lg font-bold text-white font-heading">Input Data Member Walk-In Baru</h3>
            
            <form onSubmit={handleWalkInSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Lengkap Pelanggan</label>
                <input type="text" required value={walkName} onChange={e => setWalkName(e.target.value)} placeholder="Contoh: Ahmad Wijaya" className="input-executive" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nomor WhatsApp</label>
                <input type="tel" required value={walkPhone} onChange={e => setWalkPhone(e.target.value)} placeholder="0812xxxxxxxx" className="input-executive" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Model Kendaraan</label>
                  <input type="text" required value={walkVehicle} onChange={e => setWalkVehicle(e.target.value)} placeholder="BMW / Mercedes / Honda" className="input-executive" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Plat Nomor</label>
                  <input type="text" required value={walkPlate} onChange={e => setWalkPlate(e.target.value)} placeholder="B 1234 ABC" className="input-executive font-mono uppercase" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Paket Layanan</label>
                  <select value={walkService} onChange={e => setWalkService(e.target.value)} className="input-executive cursor-pointer">
                    <option value="fast_clean">Fast Clean Express (Rp 75.000)</option>
                    <option value="premium_clean">Premium Clean (Rp 250.000)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Metode Bayar Onsite</label>
                  <select value={walkPayment} onChange={e => setWalkPayment(e.target.value)} className="input-executive cursor-pointer">
                    <option value="qris">QRIS Dinamis</option>
                    <option value="cash">Tunai (Cash)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-[#242832]">
                <button type="button" onClick={() => setShowWalkInModal(false)} className="btn-dark w-full justify-center text-xs">
                  Batal
                </button>
                <button type="submit" className="btn-gold w-full justify-center text-xs">
                  Simpan & Proses Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code Scanner Simulator */}
      {showQrScanModal && (
        <div className="modal-overlay">
          <div className="card-executive p-6 max-w-md w-full space-y-4 text-center relative">
            <h3 className="text-lg font-bold text-white font-heading">Scan QR Ticket / Member Code</h3>
            <p className="text-xs text-slate-400">Arahkan kamera tablet ke QR Code pelanggan atau masukkan Kode Booking secara manual.</p>

            <div className="bg-[#0B0C0E] p-6 rounded-2xl border-2 border-dashed border-[#F5B800] space-y-3">
              <QrCode size={56} className="mx-auto text-[#F5B800] animate-pulse" />
              <p className="text-xs text-slate-400">Kamera Scanner Aktif...</p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs text-slate-400 block">Atau Input Kode Pemesanan / Plat Nomor:</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="manualCode"
                  placeholder="AURA-20260930-01 atau B 1888 AUR" 
                  className="input-executive font-mono text-xs uppercase"
                />
                <button 
                  onClick={() => {
                    const val = document.getElementById('manualCode').value;
                    simulateQrScan(val);
                  }}
                  className="btn-gold text-xs"
                >
                  Verifikasi
                </button>
              </div>
            </div>

            <button onClick={() => setShowQrScanModal(false)} className="btn-dark w-full justify-center text-xs mt-2">
              Tutup Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
