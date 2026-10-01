import React, { useState } from 'react';
import { useCarWash } from '../context/CarWashContext';
import { 
  BarChart3, TrendingUp, DollarSign, CreditCard, Download, 
  Filter, Calendar, Car, Shield, Award, MapPin 
} from 'lucide-react';

export const OwnerPortal = () => {
  const { 
    transactions, selectedBranch, setSelectedBranch, 
    exportCSV, exportExcel, showToast 
  } = useCarWash();

  const [dateRange, setDateRange] = useState('today');

  const filteredTxs = transactions.filter(t => {
    if (selectedBranch === 'all') return true;
    return t.branch === selectedBranch;
  });

  const totalRevenue = filteredTxs.reduce((sum, t) => sum + t.amount, 0);
  const qrisTotal = filteredTxs.filter(t => t.method === 'qris' || t.method === 'e_wallet').reduce((sum, t) => sum + t.amount, 0);
  const cashTotal = filteredTxs.filter(t => t.method === 'cash').reduce((sum, t) => sum + t.amount, 0);
  const cardTotal = filteredTxs.filter(t => t.method === 'credit_card').reduce((sum, t) => sum + t.amount, 0);

  const totalVehiclesWashed = filteredTxs.filter(t => t.channel !== 'marketplace').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Executive Header Ribbon */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#242832] pb-4">
        <div>
          <span className="badge-pill badge-gold mb-1">Owner Executive Dashboard</span>
          <h2 className="text-xl font-bold text-white font-heading">Analitik Keuangan & Performa Bisnis</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#14161B] px-3 py-1.5 rounded-xl border border-[#242832]">
            <Filter size={14} className="text-[#F5B800]" />
            <select 
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer font-semibold"
            >
              <option value="today" className="bg-[#14161B]">Hari Ini (30 Sept 2026)</option>
              <option value="7days" className="bg-[#14161B]">7 Hari Terakhir</option>
              <option value="month" className="bg-[#14161B]">Bulan Ini (September)</option>
              <option value="all" className="bg-[#14161B]">Semua Periode</option>
            </select>
          </div>

          <button onClick={exportCSV} className="btn-dark text-xs">
            <Download size={14} /> Ekspor CSV
          </button>
          <button onClick={exportExcel} className="btn-gold text-xs">
            <Download size={14} /> Ekspor Excel (.xls)
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-gold-glow p-5 space-y-2">
          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Gross Revenue</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#F5B800] font-heading">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </h3>
            <span className="text-xs text-[#10B981] flex items-center font-bold">
              <TrendingUp size={14} /> +18.5%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Total pemasukan terverifikasi</p>
        </div>

        <div className="card-executive p-5 space-y-2">
          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Non-Cash (QRIS & E-Wallet)</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white font-heading">
              Rp {qrisTotal.toLocaleString('id-ID')}
            </h3>
            <span className="badge-pill badge-gold text-[10px]">
              {totalRevenue > 0 ? Math.round((qrisTotal / totalRevenue) * 100) : 0}% Ratio
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Pembayaran digital otomatis</p>
        </div>

        <div className="card-executive p-5 space-y-2">
          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Tunai (Cash Drawer)</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white font-heading">
              Rp {cashTotal.toLocaleString('id-ID')}
            </h3>
            <span className="badge-pill badge-emerald text-[10px]">
              {totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0}% Ratio
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Penerimaan fisik kasir</p>
        </div>

        <div className="card-executive p-5 space-y-2">
          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Kendaraan Dicuci</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white font-heading">
              {totalVehiclesWashed} <span className="text-xs font-normal text-slate-400">Unit</span>
            </h3>
            <span className="badge-pill badge-emerald text-[10px]">Fast & Premium</span>
          </div>
          <p className="text-[11px] text-slate-400">Rata-rata 45 menit / unit</p>
        </div>
      </div>

      {/* Visual Analytics Section (Charts & Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Breakdown Bar Visual */}
        <div className="lg:col-span-2 card-executive p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#242832] pb-3">
            <h3 className="font-bold text-white text-base font-heading flex items-center gap-2">
              <BarChart3 size={18} className="text-[#F5B800]" /> Tren Pendapatan Harian
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Data Sync</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-[#242832]">
            {[
              { day: 'Senin', amount: 1800000, height: '45%' },
              { day: 'Selasa', amount: 2400000, height: '60%' },
              { day: 'Rabu', amount: 3100000, height: '75%' },
              { day: 'Kamis', amount: 2100000, height: '52%' },
              { day: 'Jumat', amount: 3900000, height: '90%' },
              { day: 'Sabtu', amount: 4800000, height: '100%' },
              { day: 'Minggu', amount: 4200000, height: '95%' }
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-[#F5B800] opacity-0 group-hover:opacity-100 transition-opacity">
                  {(bar.amount / 1000000).toFixed(1)}M
                </span>
                <div 
                  style={{ height: bar.height }}
                  className="w-full bg-gradient-to-t from-[#C99600] to-[#F5B800] rounded-t-lg transition-all group-hover:brightness-125 shadow-[0_0_10px_rgba(245,184,0,0.25)]"
                ></div>
                <span className="text-xs text-slate-400">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="card-executive p-5 space-y-4">
          <h3 className="font-bold text-white text-base font-heading border-b border-[#242832] pb-3">
            Komposisi Pembayaran
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">QRIS & E-Wallet</span>
                <span className="text-[#F5B800] font-mono font-bold">Rp {qrisTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-[#0B0C0E] h-2 rounded-full overflow-hidden">
                <div className="bg-[#F5B800] h-full" style={{ width: `${totalRevenue > 0 ? (qrisTotal / totalRevenue) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">Tunai (Cash)</span>
                <span className="text-[#10B981] font-mono font-bold">Rp {cashTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-[#0B0C0E] h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full" style={{ width: `${totalRevenue > 0 ? (cashTotal / totalRevenue) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">Kartu Kredit / Debit</span>
                <span className="text-[#06B6D4] font-mono font-bold">Rp {cardTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-[#0B0C0E] h-2 rounded-full overflow-hidden">
                <div className="bg-[#06B6D4] h-full" style={{ width: `${totalRevenue > 0 ? (cardTotal / totalRevenue) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="card-executive p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#242832] pb-3">
          <h3 className="font-bold text-white text-base font-heading">Log Transaksi Real-Time</h3>
          <span className="text-xs text-slate-400 font-mono">Menampilkan {filteredTxs.length} Transaksi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-[#242832] bg-[#0B0C0E]">
              <tr>
                <th className="p-3">ID Invoice</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Kasir / Channel</th>
                <th className="p-3">Metode Bayar</th>
                <th className="p-3 text-right">Total Transaksi</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242832]">
              {filteredTxs.map(tx => (
                <tr key={tx.id} className="hover:bg-[#1C1F26]/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#F5B800]">{tx.id}</td>
                  <td className="p-3 text-slate-400">{tx.date}</td>
                  <td className="p-3 font-bold text-white">{tx.customer}</td>
                  <td className="p-3 text-slate-300">{tx.cashier} ({tx.channel})</td>
                  <td className="p-3 uppercase font-mono font-semibold text-white">{tx.method}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-white">
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-center">
                    <span className="badge-pill badge-emerald">Success</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
