import React, { useState, useMemo } from 'react';
import { useCarWash } from '../context/CarWashContext';

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

// ── Raw daily transaction data per branch ─────────────────────────────────────
const RAW_DAILY = (() => {
  const branches = ['senopati', 'bsd_city', 'surabaya_west'];
  const days = [];
  const now = new Date('2026-09-30');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.rsetDate?.(d.getDate() - i);
    // simple manual date offset
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const iso = day.toISOString().slice(0, 10);
    const dow = day.getDay(); // 0=Sun
    branches.forEach(br => {
      const base = br === 'senopati' ? 3200000 : br === 'bsd_city' ? 2100000 : 1600000;
      const noise = 0.7 + Math.random() * 0.6;
      const weekend = (dow === 0 || dow === 6) ? 1.35 : 1;
      const revenue = Math.round(base * noise * weekend / 10000) * 10000;
      const cost = Math.round(revenue * (0.30 + Math.random() * 0.08));
      const txCount = br === 'senopati' ? Math.round(8 + Math.random() * 7) : br === 'bsd_city' ? Math.round(5 + Math.random() * 6) : Math.round(4 + Math.random() * 5);
      days.push({ date: iso, branch: br, revenue, cost, txCount });
    });
  }
  return days;
})();

// aggregation helper
const aggregate = (data) => ({
  revenue: data.reduce((s, d) => s + d.revenue, 0),
  cost: data.reduce((s, d) => s + d.cost, 0),
  txCount: data.reduce((s, d) => s + d.txCount, 0),
});

const BRANCHES = [
  { id: 'all',           label: 'Semua Cabang',      short: 'Semua' },
  { id: 'senopati',      label: 'Senopati Flagship',  short: 'Senopati' },
  { id: 'bsd_city',      label: 'BSD City',           short: 'BSD City' },
  { id: 'surabaya_west', label: 'Surabaya Barat',     short: 'Sby Barat' },
];

const PERIODS = [
  { id: 'day',   label: 'Harian' },
  { id: 'week',  label: 'Mingguan' },
  { id: 'month', label: 'Bulanan' },
  { id: 'year',  label: 'Tahunan' },
];

const MONTHLY_SEED = [
  { month: 'Mar', senopati: 68500000, bsd_city: 44200000, surabaya_west: 31000000, cost_ratio: 0.36 },
  { month: 'Apr', senopati: 72100000, bsd_city: 47800000, surabaya_west: 33500000, cost_ratio: 0.35 },
  { month: 'Mei', senopati: 69800000, bsd_city: 45200000, surabaya_west: 30200000, cost_ratio: 0.37 },
  { month: 'Jun', senopati: 78500000, bsd_city: 51000000, surabaya_west: 36700000, cost_ratio: 0.34 },
  { month: 'Jul', senopati: 84800000, bsd_city: 56400000, surabaya_west: 40100000, cost_ratio: 0.33 },
  { month: 'Agu', senopati: 81100000, bsd_city: 53800000, surabaya_west: 38900000, cost_ratio: 0.35 },
  { month: 'Sep', senopati: 91400000, bsd_city: 60200000, surabaya_west: 43800000, cost_ratio: 0.32 },
];

const TABS = [
  { id: 'overview', label: 'Overview',            emoji: '📊' },
  { id: 'income',   label: 'Laporan Pendapatan',  emoji: '💰' },
  { id: 'expense',  label: 'Pengeluaran',          emoji: '📤' },
  { id: 'members',  label: 'Member Analytics',    emoji: '👥' },
];

export const OwnerDashboard = () => {
  const { transactions, members } = useCarWash();

  const [tab, setTab] = useState('overview');
  const [branch, setBranch] = useState('all');
  const [period, setPeriod] = useState('month');
  const [selectedDate, setSelectedDate] = useState('2026-09-30');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [compareMode, setCompareMode] = useState(false);

  // ── Derived filter data ─────────────────────────────────────────────────────
  const filteredDaily = useMemo(() => {
    let rows = RAW_DAILY;
    if (branch !== 'all') rows = rows.filter(r => r.branch === branch);
    if (period === 'day') rows = rows.filter(r => r.date === selectedDate);
    else if (period === 'week') {
      const base = new Date(selectedDate);
      const mon = new Date(base); mon.setDate(base.getDate() - base.getDay() + 1);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      rows = rows.filter(r => r.date >= mon.toISOString().slice(0,10) && r.date <= sun.toISOString().slice(0,10));
    } else if (period === 'month') {
      rows = rows.filter(r => r.date.startsWith(selectedMonth));
    }
    // year → all 30 days (our data only covers Sep 2026)
    return rows;
  }, [branch, period, selectedDate, selectedMonth]);

  const kpi = useMemo(() => aggregate(filteredDaily), [filteredDaily]);

  // for chart bars
  const chartRows = useMemo(() => {
    if (period === 'day') {
      // hourly mock
      return Array.from({ length: 12 }, (_, i) => {
        const h = 8 + i;
        const rev = Math.round(100000 + Math.random() * 400000);
        return { label: `${h}:00`, revenue: rev, cost: Math.round(rev * 0.33) };
      });
    }
    if (period === 'week') {
      const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
      return days.map(d => {
        const dayRows = filteredDaily.filter((_, i) => i % 7 === days.indexOf(d) % 7);
        const agg = aggregate(dayRows.length ? dayRows : [{ revenue: Math.round(500000 + Math.random() * 2000000), cost: 500000, txCount: 5 }]);
        return { label: d, ...agg };
      });
    }
    if (period === 'month') {
      // daily within month
      const byDate = {};
      filteredDaily.forEach(r => {
        if (!byDate[r.date]) byDate[r.date] = { revenue: 0, cost: 0, txCount: 0 };
        byDate[r.date].revenue += r.revenue;
        byDate[r.date].cost += r.cost;
        byDate[r.date].txCount += r.txCount;
      });
      return Object.entries(byDate).map(([date, v]) => ({
        label: date.slice(8),
        ...v,
      }));
    }
    // year → monthly
    return MONTHLY_SEED.map(m => {
      const rev = branch === 'all'
        ? m.senopati + m.bsd_city + m.surabaya_west
        : m[branch] ?? m.senopati;
      return { label: m.month, revenue: rev, cost: Math.round(rev * m.cost_ratio) };
    });
  }, [period, filteredDaily, branch]);

  const maxChartVal = Math.max(...chartRows.map(r => r.revenue), 1);

  // previous period for growth calc
  const prevKpi = useMemo(() => {
    let rows = RAW_DAILY;
    if (branch !== 'all') rows = rows.filter(r => r.branch === branch);
    if (period === 'day') {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      rows = rows.filter(r => r.date === prev.toISOString().slice(0, 10));
    } else if (period === 'month') {
      const [y, m] = selectedMonth.split('-').map(Number);
      const prevM = m === 1 ? `${y-1}-12` : `${y}-${String(m-1).padStart(2,'0')}`;
      rows = rows.filter(r => r.date.startsWith(prevM));
    } else {
      rows = rows.slice(0, Math.floor(rows.length / 2));
    }
    return aggregate(rows);
  }, [branch, period, selectedDate, selectedMonth, filteredDaily]);

  const growthPct = prevKpi.revenue > 0
    ? ((kpi.revenue - prevKpi.revenue) / prevKpi.revenue * 100).toFixed(1)
    : '–';
  const profit = kpi.revenue - kpi.cost;
  const margin = kpi.revenue > 0 ? (profit / kpi.revenue * 100).toFixed(1) : '0';

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.totalVisits > 0).length;
  const branchLabel = BRANCHES.find(b => b.id === branch)?.label ?? 'Semua Cabang';
  const periodLabel = PERIODS.find(p => p.id === period)?.label ?? '';

  // income table rows
  const incomeTableRows = useMemo(() => {
    if (period === 'year') return MONTHLY_SEED.map(m => {
      const rev = branch === 'all' ? m.senopati + m.bsd_city + m.surabaya_west : m[branch] ?? m.senopati;
      const cost = Math.round(rev * m.cost_ratio);
      return { label: `${m.month} 2026`, revenue: rev, cost };
    });
    if (period === 'month') {
      const byDate = {};
      filteredDaily.forEach(r => {
        if (!byDate[r.date]) byDate[r.date] = { revenue: 0, cost: 0, txCount: 0 };
        byDate[r.date].revenue += r.revenue;
        byDate[r.date].cost += r.cost;
        byDate[r.date].txCount += r.txCount;
      });
      return Object.entries(byDate).map(([date, v]) => ({ label: date, ...v }));
    }
    if (period === 'week') {
      const branchRows = branch === 'all' ? BRANCHES.filter(b => b.id !== 'all') : BRANCHES.filter(b => b.id === branch);
      return branchRows.map(b => {
        const rows = filteredDaily.filter(r => r.branch === b.id);
        const agg = aggregate(rows);
        return { label: b.label, ...agg };
      });
    }
    // day
    const brs = branch === 'all' ? ['senopati', 'bsd_city', 'surabaya_west'] : [branch];
    return brs.map(br => {
      const rows = filteredDaily.filter(r => r.branch === br);
      const agg = aggregate(rows);
      return { label: BRANCHES.find(b => b.id === br)?.label ?? br, ...agg };
    });
  }, [period, branch, filteredDaily]);

  const exportCSV = () => {
    const rows = [
      ['Periode', 'Cabang', 'Pendapatan', 'Biaya', 'Laba Kotor', 'Margin (%)'],
      ...incomeTableRows.map(r => {
        const prof = r.revenue - r.cost;
        const marg = r.revenue > 0 ? (prof / r.revenue * 100).toFixed(1) : '0';
        return [r.label, branchLabel, r.revenue, r.cost, prof, marg + '%'];
      }),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `AURA_Laporan_${period}_${branch}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  // ─── STYLE HELPERS ────────────────────────────────────────────────────────
  const pill = (active) => ({
    padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 12.5, fontWeight: 600, transition: 'all .15s',
    background: active ? '#F2A900' : 'transparent',
    color: active ? '#0D0D0F' : '#A0A0B0',
  });

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 20px' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-.03em' }}>Owner Analytics</h1>
          <p style={{ fontSize: 13, color: '#5C5C70', marginTop: 4 }}>
            Pemantauan keuangan real-time ·{' '}
            <span style={{ color: '#F2A900' }}>{branchLabel}</span>
            {' '}·{' '}
            <span style={{ color: '#A0A0B0' }}>{periodLabel}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={exportCSV} style={{ fontSize: 12 }}>📊 Export CSV</button>
          <button className="btn btn-gold" style={{ fontSize: 12 }}>📄 Export Excel</button>
        </div>
      </div>

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div style={{
        background: '#141417', border: '1px solid #28282F', borderRadius: 14,
        padding: '14px 18px', marginBottom: 24,
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20,
      }}>
        {/* Branch filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#5C5C70' }}>
            📍 Cabang
          </span>
          <div style={{ display: 'flex', gap: 4, background: '#0D0D0F', borderRadius: 9, padding: 4 }}>
            {BRANCHES.map(b => (
              <button key={b.id} onClick={() => setBranch(b.id)} style={{
                ...pill(branch === b.id), padding: '6px 12px', fontSize: 12,
              }}>{b.short}</button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 40, background: '#28282F' }} />

        {/* Period filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#5C5C70' }}>
            📅 Periode
          </span>
          <div style={{ display: 'flex', gap: 4, background: '#0D0D0F', borderRadius: 9, padding: 4 }}>
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} style={{
                ...pill(period === p.id), padding: '6px 12px', fontSize: 12,
              }}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Date / month picker */}
        {(period === 'day' || period === 'week') && (
          <>
            <div style={{ width: 1, height: 40, background: '#28282F' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#5C5C70' }}>
                🗓️ Pilih Tanggal
              </span>
              <input type="date" value={selectedDate} max="2026-09-30" min="2026-09-01"
                onChange={e => setSelectedDate(e.target.value)}
                className="input" style={{ width: 160, padding: '7px 12px', fontSize: 12 }} />
            </div>
          </>
        )}
        {period === 'month' && (
          <>
            <div style={{ width: 1, height: 40, background: '#28282F' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#5C5C70' }}>
                🗓️ Pilih Bulan
              </span>
              <input type="month" value={selectedMonth} max="2026-09"
                onChange={e => setSelectedMonth(e.target.value)}
                className="input" style={{ width: 160, padding: '7px 12px', fontSize: 12 }} />
            </div>
          </>
        )}

        {/* Divider */}
        <div style={{ width: 1, height: 40, background: '#28282F' }} />

        {/* Active filter badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ fontSize: 11, color: '#5C5C70' }}>Filter aktif:</span>
          <span className="badge badge-gold">{branchLabel}</span>
          <span className="badge badge-gold">{periodLabel}</span>
          {period === 'day' && <span className="badge badge-blue">{selectedDate}</span>}
          {period === 'month' && <span className="badge badge-blue">{selectedMonth}</span>}
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #28282F' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500,
              background: 'transparent', color: active ? '#F2A900' : '#A0A0B0',
              borderBottom: active ? '2px solid #F2A900' : '2px solid transparent',
              marginBottom: -1, transition: 'all .15s',
            }}>{t.emoji} {t.label}</button>
          );
        })}
      </div>

      {/* ═══ OVERVIEW ═══════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              {
                label: `Pendapatan (${periodLabel})`, value: G(kpi.revenue),
                delta: `${Number(growthPct) >= 0 ? '+' : ''}${growthPct}% vs sebelumnya`,
                deltaColor: Number(growthPct) >= 0 ? '#0EC278' : '#F04F4F',
                color: '#F2A900', icon: '💰',
              },
              {
                label: 'Laba Kotor', value: G(profit),
                delta: `${margin}% margin`,
                deltaColor: '#0EC278',
                color: '#0EC278', icon: '📈',
              },
              {
                label: 'Biaya Operasional', value: G(kpi.cost),
                delta: `${kpi.revenue > 0 ? (kpi.cost / kpi.revenue * 100).toFixed(0) : 0}% dari omzet`,
                deltaColor: '#38BDF8',
                color: '#38BDF8', icon: '📤',
              },
              {
                label: 'Total Transaksi', value: kpi.txCount,
                delta: `${period === 'day' ? 'Hari ini' : period === 'week' ? 'Minggu ini' : 'Bulan ini'}`,
                deltaColor: '#A855F7',
                color: '#A855F7', icon: '🧾',
              },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: `${s.deltaColor}18`, color: s.deltaColor, border: `1px solid ${s.deltaColor}33` }}>
                    {s.delta}
                  </span>
                </div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color, marginTop: 6, fontSize: 22 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Chart + Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>
            {/* Dynamic bar chart */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>
                    Grafik Pendapatan — <span style={{ color: '#F2A900' }}>{branchLabel}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#5C5C70', marginTop: 3 }}>
                    {period === 'day' ? `Per jam · ${selectedDate}` :
                     period === 'week' ? 'Per hari dalam minggu' :
                     period === 'month' ? `Per tanggal · ${selectedMonth}` : 'Per bulan · 2026'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#F2A900' }} />
                    <span style={{ color: '#A0A0B0' }}>Pendapatan</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#38BDF8' }} />
                    <span style={{ color: '#A0A0B0' }}>Biaya</span>
                  </div>
                </div>
              </div>

              {/* Scrollable chart area */}
              <div style={{ overflowX: chartRows.length > 14 ? 'auto' : 'visible', paddingBottom: 4 }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-end', gap: 6, height: 170,
                  minWidth: chartRows.length > 14 ? chartRows.length * 36 : 'auto',
                }}>
                  {chartRows.map((d, i) => (
                    <div key={i} style={{ flex: chartRows.length <= 14 ? 1 : '0 0 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'default' }}>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%' }}>
                        <div style={{
                          width: 'calc(50% - 1px)', minHeight: 4,
                          height: `${Math.round((d.revenue / maxChartVal) * 140)}px`,
                          background: 'linear-gradient(to top, #C98B00, #F2A900)',
                          borderRadius: '4px 4px 0 0', transition: 'height .4s',
                        }} />
                        <div style={{
                          width: 'calc(50% - 1px)', minHeight: 4,
                          height: `${Math.round(((d.cost ?? 0) / maxChartVal) * 140)}px`,
                          background: 'linear-gradient(to top, #1e6a8a, #38BDF8)',
                          borderRadius: '4px 4px 0 0', transition: 'height .4s',
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: '#5C5C70', textAlign: 'center' }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart footer: total */}
              <div style={{ display: 'flex', gap: 24, marginTop: 14, paddingTop: 14, borderTop: '1px solid #28282F' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#5C5C70', marginBottom: 2 }}>Total Pendapatan</div>
                  <div style={{ fontWeight: 800, color: '#F2A900' }}>{G(chartRows.reduce((s, r) => s + r.revenue, 0))}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#5C5C70', marginBottom: 2 }}>Total Biaya</div>
                  <div style={{ fontWeight: 800, color: '#38BDF8' }}>{G(chartRows.reduce((s, r) => s + (r.cost ?? 0), 0))}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#5C5C70', marginBottom: 2 }}>Laba Bersih</div>
                  <div style={{ fontWeight: 800, color: '#0EC278' }}>{G(chartRows.reduce((s, r) => s + r.revenue - (r.cost ?? 0), 0))}</div>
                </div>
              </div>
            </div>

            {/* Revenue breakdown */}
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 18 }}>Komposisi Pendapatan</div>
              {[
                { label: 'Premium Clean Detailing', pct: 59, color: '#F2A900' },
                { label: 'Fast Clean Express', pct: 22, color: '#38BDF8' },
                { label: 'Penjualan Merchandise', pct: 12, color: '#0EC278' },
                { label: 'Auto Care Products', pct: 7, color: '#A855F7' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: '#A0A0B0' }}>{item.label}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: '#5C5C70' }}>{item.pct}%</span>
                      <span style={{ fontWeight: 700 }}>{G(Math.round(kpi.revenue * item.pct / 100))}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${item.pct}%`,
                      background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                    }} />
                  </div>
                </div>
              ))}

              {/* Branch contribution */}
              {branch === 'all' && (
                <>
                  <div style={{ height: 1, background: '#28282F', margin: '18px 0' }} />
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#A0A0B0' }}>Kontribusi Per Cabang</div>
                  {BRANCHES.filter(b => b.id !== 'all').map(b => {
                    const brRows = filteredDaily.filter(r => r.branch === b.id);
                    const brAgg = aggregate(brRows);
                    const pct = kpi.revenue > 0 ? Math.round(brAgg.revenue / kpi.revenue * 100) : 0;
                    const bColor = b.id === 'senopati' ? '#F2A900' : b.id === 'bsd_city' ? '#38BDF8' : '#0EC278';
                    return (
                      <div key={b.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                          <span style={{ color: '#A0A0B0' }}>{b.label}</span>
                          <span style={{ fontWeight: 700 }}>{pct}% · {G(brAgg.revenue)}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${bColor}88, ${bColor})` }} />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Bottom row: recent tx + member */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #28282F', fontWeight: 800, fontSize: 14 }}>Transaksi Terkini</div>
              <table className="data-table">
                <thead><tr><th>Layanan</th><th>Nominal</th><th>Metode</th></tr></thead>
                <tbody>
                  {[
                    { name: 'Premium Clean', amount: 225000, method: 'QRIS' },
                    { name: 'Fast Clean × 2', amount: 150000, method: 'Cash' },
                    { name: 'Wax Premium Kit', amount: 185000, method: 'Transfer' },
                    { name: 'Fast Clean', amount: 75000, method: 'QRIS' },
                    { name: 'Interior Kit', amount: 145000, method: 'Debit' },
                  ].map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td style={{ color: '#F2A900', fontWeight: 700 }}>{G(t.amount)}</td>
                      <td><span className="badge badge-gold">{t.method}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 18 }}>Member Analytics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                {[
                  { label: 'Total Member', value: totalMembers, color: '#F2A900' },
                  { label: 'Aktif Bulan Ini', value: activeMembers, color: '#0EC278' },
                  { label: 'VIP Gold', value: members.filter(m => m.tier === 'VIP Gold').length, color: '#F2A900' },
                  { label: 'VIP Platinum', value: members.filter(m => m.tier === 'VIP Platinum').length, color: '#A855F7' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '12px 14px', background: '#0D0D0F', borderRadius: 10, border: '1px solid #28282F' }}>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: 26, marginTop: 5 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {members.slice(0, 3).map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(242,169,0,.12)', border: '1px solid rgba(242,169,0,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#F2A900', flexShrink: 0 }}>
                    {m.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#5C5C70' }}>{m.totalVisits} kunjungan · {m.points} pts</div>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: 10 }}>{m.tier}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══ LAPORAN PENDAPATAN ═════════════════════════════════════════ */}
      {tab === 'income' && (
        <div>
          {/* Sub-filter info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge badge-gold">{branchLabel}</span>
              <span className="badge badge-blue">{periodLabel}</span>
              {period === 'day' && <span className="badge badge-blue">{selectedDate}</span>}
              {period === 'month' && <span className="badge badge-blue">{selectedMonth}</span>}
              <span style={{ fontSize: 12, color: '#5C5C70' }}>· {incomeTableRows.length} baris data</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={exportCSV} style={{ fontSize: 12 }}>📊 Export CSV</button>
            </div>
          </div>

          {/* Summary KPI bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
            {[
              { label: 'Total Pendapatan', value: G(kpi.revenue), color: '#F2A900' },
              { label: 'Total Biaya', value: G(kpi.cost), color: '#38BDF8' },
              { label: 'Laba Kotor', value: G(profit), color: '#0EC278' },
              { label: 'Avg. Margin', value: `${margin}%`, color: '#A855F7' },
            ].map(s => (
              <div key={s.label} style={{ padding: '12px 16px', background: '#141417', border: '1px solid #28282F', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#A0A0B0' }}>{s.label}</span>
                <span style={{ fontWeight: 800, color: s.color, fontSize: 14 }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{period === 'day' || period === 'week' ? 'Cabang' : period === 'month' ? 'Tanggal' : 'Bulan'}</th>
                  <th>Pendapatan</th>
                  <th>Biaya Operasional</th>
                  <th>Laba Kotor</th>
                  <th>Margin</th>
                  <th>Transaksi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {incomeTableRows.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#5C5C70', padding: '40px 0' }}>Tidak ada data untuk filter yang dipilih</td></tr>
                )}
                {incomeTableRows.map((d, i) => {
                  const rowProfit = d.revenue - d.cost;
                  const rowMargin = d.revenue > 0 ? (rowProfit / d.revenue * 100).toFixed(1) : '0';
                  const isGood = Number(rowMargin) >= 60;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{d.label}</td>
                      <td style={{ color: '#F2A900', fontWeight: 700 }}>{G(d.revenue)}</td>
                      <td style={{ color: '#38BDF8' }}>{G(d.cost)}</td>
                      <td style={{ color: '#0EC278', fontWeight: 700 }}>{G(rowProfit)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 70 }}>
                            <div className="progress-fill" style={{
                              width: `${Math.min(100, Number(rowMargin))}%`,
                              background: isGood ? 'linear-gradient(90deg,#0EC278aa,#0EC278)' : 'linear-gradient(90deg,#F2A900aa,#F2A900)',
                            }} />
                          </div>
                          <span style={{ fontSize: 12, color: isGood ? '#0EC278' : '#F2A900', fontWeight: 700 }}>{rowMargin}%</span>
                        </div>
                      </td>
                      <td style={{ color: '#A0A0B0', fontSize: 13 }}>{d.txCount ?? '–'}</td>
                      <td><span className="badge badge-green">✓ Tercatat</span></td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                {incomeTableRows.length > 1 && (
                  <tr style={{ background: 'rgba(242,169,0,.04)', borderTop: '2px solid rgba(242,169,0,.2)' }}>
                    <td style={{ fontWeight: 900, color: '#F2A900', fontSize: 13 }}>TOTAL</td>
                    <td style={{ color: '#F2A900', fontWeight: 900 }}>{G(kpi.revenue)}</td>
                    <td style={{ color: '#38BDF8', fontWeight: 700 }}>{G(kpi.cost)}</td>
                    <td style={{ color: '#0EC278', fontWeight: 900 }}>{G(profit)}</td>
                    <td><span style={{ fontSize: 13, fontWeight: 900, color: '#0EC278' }}>{margin}%</span></td>
                    <td style={{ color: '#A0A0B0', fontWeight: 700 }}>{kpi.txCount}</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ PENGELUARAN ════════════════════════════════════════════════ */}
      {tab === 'expense' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
            {[
              { label: 'Total Pengeluaran', value: G(kpi.cost), color: '#F04F4F' },
              { label: '% dari Omzet', value: `${kpi.revenue > 0 ? (kpi.cost / kpi.revenue * 100).toFixed(1) : 0}%`, color: '#F2A900' },
              { label: 'Net Profit', value: G(profit), color: '#0EC278' },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px 18px', background: '#141417', border: '1px solid #28282F', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#A0A0B0' }}>{s.label}</span>
                <span style={{ fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Kategori</th><th>Deskripsi</th><th>Estimasi ({periodLabel})</th><th>% dari Omzet</th></tr>
              </thead>
              <tbody>
                {[
                  { cat: 'Bahan Operasional', desc: 'Shampoo, wax, microfiber restok', pct: 0.28 },
                  { cat: 'SDM', desc: 'Gaji & insentif karyawan', pct: 0.38 },
                  { cat: 'Utilitas', desc: 'Listrik, air, internet', pct: 0.10 },
                  { cat: 'Marketing', desc: 'Instagram Ads, Google Ads', pct: 0.07 },
                  { cat: 'Maintenance', desc: 'Perawatan mesin cuci & AC lounge', pct: 0.12 },
                  { cat: 'Overhead Lainnya', desc: 'Administrasi, asuransi, dll.', pct: 0.05 },
                ].map((e, i) => {
                  const amt = Math.round(kpi.cost * e.pct);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{e.cat}</td>
                      <td style={{ color: '#A0A0B0', fontSize: 12 }}>{e.desc}</td>
                      <td style={{ color: '#F04F4F', fontWeight: 700 }}>{G(amt)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className="progress-fill" style={{ width: `${Math.round(e.pct * 100)}%`, background: 'linear-gradient(90deg,#F04F4Faa,#F04F4F)' }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#5C5C70' }}>{Math.round(e.pct * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ MEMBER ANALYTICS ══════════════════════════════════════════ */}
      {tab === 'members' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Member</th><th>Tier</th><th>Total Kunjungan</th><th>Points</th><th>LTV (Est.)</th><th>Kendaraan</th></tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#5C5C70' }}>{m.phone}</div>
                  </td>
                  <td><span className="badge badge-gold">{m.tier}</span></td>
                  <td style={{ fontWeight: 700, fontSize: 16 }}>{m.totalVisits}</td>
                  <td style={{ color: '#F2A900', fontWeight: 700 }}>{m.points} pts</td>
                  <td style={{ color: '#0EC278', fontWeight: 700 }}>{G(m.totalVisits * 187500)}</td>
                  <td>
                    <div style={{ fontSize: 12 }}>{m.vehicle}</div>
                    <div className="mono" style={{ fontSize: 11, color: '#5C5C70' }}>{m.plate}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
