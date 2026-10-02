import React, { useState, useMemo } from 'react';
import { useCarWash } from '../context/CarWashContext';

const G = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

// ── Seeded random (stable across renders) ─────────────────────────────────────
let _seed = 42;
const srand = () => { _seed = (_seed * 1664525 + 1013904223) & 0xffffffff; return (_seed >>> 0) / 0xffffffff; };

// ── Branch & Period constants ─────────────────────────────────────────────────
const BRANCHES = [
  { id: 'all',           label: 'Semua Cabang',    short: 'Semua' },
  { id: 'senopati',      label: 'Senopati Flagship', short: 'Senopati' },
  { id: 'bsd_city',      label: 'BSD City',         short: 'BSD City' },
  { id: 'surabaya_west', label: 'Surabaya Barat',   short: 'Sby Barat' },
];
const PERIODS = [
  { id: 'day',   label: 'Harian' },
  { id: 'week',  label: 'Mingguan' },
  { id: 'month', label: 'Bulanan' },
  { id: 'year',  label: 'Tahunan' },
];
const MONTHLY_SEED = [
  { month: 'Mar', key:'2026-03', senopati: 68500000, bsd_city: 44200000, surabaya_west: 31000000, cost_ratio: 0.36 },
  { month: 'Apr', key:'2026-04', senopati: 72100000, bsd_city: 47800000, surabaya_west: 33500000, cost_ratio: 0.35 },
  { month: 'Mei', key:'2026-05', senopati: 69800000, bsd_city: 45200000, surabaya_west: 30200000, cost_ratio: 0.37 },
  { month: 'Jun', key:'2026-06', senopati: 78500000, bsd_city: 51000000, surabaya_west: 36700000, cost_ratio: 0.34 },
  { month: 'Jul', key:'2026-07', senopati: 84800000, bsd_city: 56400000, surabaya_west: 40100000, cost_ratio: 0.33 },
  { month: 'Agu', key:'2026-08', senopati: 81100000, bsd_city: 53800000, surabaya_west: 38900000, cost_ratio: 0.35 },
  { month: 'Sep', key:'2026-09', senopati: 91400000, bsd_city: 60200000, surabaya_west: 43800000, cost_ratio: 0.32 },
];

// ── Raw daily data (30 days) ──────────────────────────────────────────────────
const RAW_DAILY = (() => {
  _seed = 42;
  const branches = ['senopati', 'bsd_city', 'surabaya_west'];
  const days = [];
  const now = new Date('2026-09-30');
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const iso = day.toISOString().slice(0, 10);
    const dow = day.getDay();
    branches.forEach(br => {
      const base = br === 'senopati' ? 3200000 : br === 'bsd_city' ? 2100000 : 1600000;
      const noise = 0.75 + srand() * 0.5;
      const weekend = (dow === 0 || dow === 6) ? 1.35 : 1;
      const revenue = Math.round(base * noise * weekend / 10000) * 10000;
      const cost = Math.round(revenue * (0.30 + srand() * 0.08));
      const txCount = br === 'senopati' ? Math.round(8 + srand() * 7) : br === 'bsd_city' ? Math.round(5 + srand() * 6) : Math.round(4 + srand() * 5);
      days.push({ date: iso, branch: br, revenue, cost, txCount });
    });
  }
  return days;
})();

// ── Generate mutation entries from RAW_DAILY ──────────────────────────────────
// Each daily row → multiple line items (income rows + expense rows)
const INCOME_CATEGORIES = ['Cuci Mobil Premium', 'Fast Clean Express', 'Walk-In Cash', 'QRIS Online', 'Merchandise Retail', 'Member Fee'];
const EXPENSE_CATEGORIES = ['Gaji & Honorarium', 'Biaya Kimia & Bahan', 'Listrik & Utilitas', 'Sewa Tempat', 'Maintenance Alat', 'Operasional Lainnya'];
const BRANCH_LABELS = { senopati: 'Senopati', bsd_city: 'BSD City', surabaya_west: 'Sby Barat' };

_seed = 999;
const ALL_MUTATIONS = (() => {
  const rows = [];
  let running = 0;
  let txSeq = 1000;

  RAW_DAILY.forEach(d => {
    // Generate 3-5 income entries per branch-day
    const incomeCount = 2 + Math.round(srand() * 3);
    const revPerEntry = d.revenue / incomeCount;
    for (let i = 0; i < incomeCount; i++) {
      const amount = Math.round(revPerEntry * (0.7 + srand() * 0.6) / 1000) * 1000;
      running += amount;
      rows.push({
        id: `INC-${txSeq++}`,
        date: d.date,
        type: 'income',
        branch: d.branch,
        category: INCOME_CATEGORIES[Math.floor(srand() * INCOME_CATEGORIES.length)],
        description: `${INCOME_CATEGORIES[Math.floor(srand() * INCOME_CATEGORIES.length)]} — ${BRANCH_LABELS[d.branch]}`,
        amount,
        balance: running,
      });
    }
    // Generate 1-3 expense entries per branch-day
    const expCount = 1 + Math.round(srand() * 2);
    const costPerEntry = d.cost / expCount;
    for (let i = 0; i < expCount; i++) {
      const amount = Math.round(costPerEntry * (0.6 + srand() * 0.8) / 1000) * 1000;
      running -= amount;
      rows.push({
        id: `EXP-${txSeq++}`,
        date: d.date,
        type: 'expense',
        branch: d.branch,
        category: EXPENSE_CATEGORIES[Math.floor(srand() * EXPENSE_CATEGORIES.length)],
        description: `${EXPENSE_CATEGORIES[Math.floor(srand() * EXPENSE_CATEGORIES.length)]} — ${BRANCH_LABELS[d.branch]}`,
        amount,
        balance: running,
      });
    }
  });

  // Sort by date desc (newest first)
  return rows.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
})();

const aggregate = (data) => ({
  revenue: data.reduce((s, d) => s + d.revenue, 0),
  cost: data.reduce((s, d) => s + d.cost, 0),
  txCount: data.reduce((s, d) => s + d.txCount, 0),
});

// ── SVG Area/Line Chart ───────────────────────────────────────────────────────
const AreaLineChart = ({ data, width = 600, height = 220 }) => {
  if (!data || data.length === 0) return null;
  const padL = 60, padR = 20, padT = 20, padB = 40;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxVal = Math.max(...data.map(d => d.revenue), ...data.map(d => d.cost ?? 0), 1) * 1.1;
  const xPos = (i) => padL + (i / (data.length - 1 || 1)) * chartW;
  const yPos = (v) => padT + chartH - (v / maxVal) * chartH;
  const revPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(d.revenue)}`).join(' ');
  const costPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(d.cost ?? 0)}`).join(' ');
  const revArea = `${revPath} L${xPos(data.length - 1)},${padT + chartH} L${xPos(0)},${padT + chartH} Z`;
  const costArea = `${costPath} L${xPos(data.length - 1)},${padT + chartH} L${xPos(0)},${padT + chartH} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => f * maxVal);
  const step = Math.max(1, Math.ceil(data.length / 10));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F2A900" stopOpacity="0.22"/><stop offset="100%" stopColor="#F2A900" stopOpacity="0"/></linearGradient>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38BDF8" stopOpacity="0.16"/><stop offset="100%" stopColor="#38BDF8" stopOpacity="0"/></linearGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {yTicks.map((val, i) => { const y = yPos(val); return <g key={i}><line x1={padL} y1={y} x2={padL+chartW} y2={y} stroke="#1A1A24" strokeWidth="1"/><text x={padL-8} y={y+4} fill="#3A3A50" fontSize="9" textAnchor="end" fontFamily="monospace">{val>=1e6?`${(val/1e6).toFixed(1)}M`:val>=1e3?`${(val/1e3).toFixed(0)}K`:'0'}</text></g>; })}
      <line x1={padL} y1={padT+chartH} x2={padL+chartW} y2={padT+chartH} stroke="#28282F" strokeWidth="1"/>
      <path d={costArea} fill="url(#cg)"/>
      <path d={revArea} fill="url(#rg)"/>
      <path d={costPath} fill="none" stroke="#38BDF8" strokeWidth="2" opacity="0.75"/>
      <path d={revPath} fill="none" stroke="#F2A900" strokeWidth="2.5" filter="url(#gl)"/>
      {data.map((d, i) => i % step === 0 || i === data.length-1 ? (
        <g key={i}>
          <circle cx={xPos(i)} cy={yPos(d.revenue)} r="3.5" fill="#F2A900" stroke="#0D0D0F" strokeWidth="1.5"/>
          <text x={xPos(i)} y={padT+chartH+17} fill="#5C5C70" fontSize="9" textAnchor="middle" fontFamily="system-ui">{d.label}</text>
        </g>
      ) : null)}
    </svg>
  );
};

// ── Donut Chart ───────────────────────────────────────────────────────────────
const DonutChart = ({ segments, total }) => {
  const size = 140, cx = 70, cy = 70, r = 52, sw = 18, circ = 2 * Math.PI * r;
  let cum = 0;
  const arcs = segments.map(s => { const pct = s.value / total; const da = `${pct*circ} ${circ}`; const do_ = -cum*circ; cum += pct; return {...s, da, do_}; });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1A1F" strokeWidth={sw}/>
      {arcs.map((a, i) => <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth={sw-2} strokeDasharray={a.da} strokeDashoffset={a.do_} strokeLinecap="butt" style={{ transform:`rotate(-90deg)`, transformOrigin:`${cx}px ${cy}px` }}/>)}
      <text x={cx} y={cy-5} fill="#fff" fontSize="16" fontWeight="900" textAnchor="middle" dominantBaseline="middle" fontFamily="system-ui">{segments[0] ? `${Math.round(segments[0].value/total*100)}%` : ''}</text>
      <text x={cx} y={cy+12} fill="#5C5C70" fontSize="8" textAnchor="middle" fontFamily="system-ui">TOP SERVICE</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const OwnerDashboard = () => {
  const { transactions, members, staffList, addStaffAccount, deleteStaffAccount, toggleStaffStatus, logoutUser, showToast } = useCarWash();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [branch, setBranch] = useState('all');
  const [period, setPeriod] = useState('month');
  const [selectedDate, setSelectedDate] = useState('2026-09-30');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  // Staff form
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', username: '', role: 'kasir', branch: 'senopati', password: '123456' });

  // Mutation/laporan filters
  const [mutType, setMutType] = useState('all');      // 'all' | 'income' | 'expense'
  const [mutPeriod, setMutPeriod] = useState('month'); // 'day' | 'month'
  const [mutDate, setMutDate] = useState('2026-09-30');
  const [mutMonth, setMutMonth] = useState('2026-09');
  const [mutBranch, setMutBranch] = useState('all');
  const [mutSearch, setMutSearch] = useState('');
  const [mutPage, setMutPage] = useState(1);
  const MUT_PAGE_SIZE = 15;

  // ── Filtered daily for overview chart ─────────────────────────────────────
  const filteredDaily = useMemo(() => {
    let rows = RAW_DAILY;
    if (branch !== 'all') rows = rows.filter(r => r.branch === branch);
    if (period === 'day') rows = rows.filter(r => r.date === selectedDate);
    else if (period === 'week') {
      const base = new Date(selectedDate);
      const mon = new Date(base); mon.setDate(base.getDate() - base.getDay() + 1);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      rows = rows.filter(r => r.date >= mon.toISOString().slice(0, 10) && r.date <= sun.toISOString().slice(0, 10));
    } else if (period === 'month') {
      rows = rows.filter(r => r.date.startsWith(selectedMonth));
    }
    return rows;
  }, [branch, period, selectedDate, selectedMonth]);

  const kpi = useMemo(() => aggregate(filteredDaily), [filteredDaily]);

  const chartRows = useMemo(() => {
    if (period === 'day') {
      return Array.from({ length: 12 }, (_, i) => {
        const h = 8 + i;
        const rev = Math.round(180000 + (i * 234567) % 680000);
        return { label: `${h}:00`, revenue: rev, cost: Math.round(rev * 0.33) };
      });
    }
    if (period === 'week') {
      return ['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map((d, i) => {
        const rev = Math.round(1100000 + (i * 345678) % 2400000);
        return { label: d, revenue: rev, cost: Math.round(rev * 0.33) };
      });
    }
    if (period === 'month') {
      const byDate = {};
      filteredDaily.forEach(r => {
        if (!byDate[r.date]) byDate[r.date] = { revenue: 0, cost: 0, txCount: 0 };
        byDate[r.date].revenue += r.revenue; byDate[r.date].cost += r.cost;
      });
      return Object.entries(byDate).map(([date, v]) => ({ label: date.slice(8), ...v }));
    }
    return MONTHLY_SEED.map(m => {
      const rev = branch === 'all' ? m.senopati + m.bsd_city + m.surabaya_west : m[branch] ?? m.senopati;
      return { label: m.month, revenue: rev, cost: Math.round(rev * m.cost_ratio) };
    });
  }, [period, filteredDaily, branch]);

  const profit = kpi.revenue - kpi.cost;
  const margin = kpi.revenue > 0 ? (profit / kpi.revenue * 100).toFixed(1) : '0';
  const branchLabel = BRANCHES.find(b => b.id === branch)?.label ?? 'Semua Cabang';
  const periodLabel = PERIODS.find(p => p.id === period)?.label ?? '';
  const totalChartRev  = chartRows.reduce((s, r) => s + r.revenue, 0);
  const totalChartCost = chartRows.reduce((s, r) => s + (r.cost ?? 0), 0);

  // ── Mutation filter logic ─────────────────────────────────────────────────
  const filteredMutations = useMemo(() => {
    let rows = ALL_MUTATIONS;
    // Branch filter
    if (mutBranch !== 'all') rows = rows.filter(r => r.branch === mutBranch);
    // Type filter
    if (mutType !== 'all') rows = rows.filter(r => r.type === mutType);
    // Period filter
    if (mutPeriod === 'day') rows = rows.filter(r => r.date === mutDate);
    else rows = rows.filter(r => r.date.startsWith(mutMonth));
    // Search
    if (mutSearch.trim()) {
      const q = mutSearch.toLowerCase();
      rows = rows.filter(r => r.description.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    return rows;
  }, [mutBranch, mutType, mutPeriod, mutDate, mutMonth, mutSearch]);

  const mutTotalIncome  = filteredMutations.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const mutTotalExpense = filteredMutations.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const mutNet          = mutTotalIncome - mutTotalExpense;

  const totalPages = Math.max(1, Math.ceil(filteredMutations.length / MUT_PAGE_SIZE));
  const pagedMut = filteredMutations.slice((mutPage - 1) * MUT_PAGE_SIZE, mutPage * MUT_PAGE_SIZE);

  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.username) { showToast('Nama dan username staf wajib diisi!', 'error'); return; }
    addStaffAccount(staffForm);
    setStaffForm({ name: '', username: '', role: 'kasir', branch: 'senopati', password: '123456' });
    setShowAddStaffModal(false);
  };

  const SIDEBAR_W = sidebarExpanded ? 240 : 64;

  // ── Sidebar items ─────────────────────────────────────────────────────────
  const SIDEBAR_NAV = [
    {
      id: 'overview', label: 'Executive Overview',
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
    {
      id: 'laporan', label: 'Laporan Keuangan',
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    },
    {
      id: 'members', label: 'Member Analytics',
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>,
    },
    {
      id: 'users', label: 'Kelola Staf / User',
      badge: staffList.length,
      icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
  ];

  // ── Page content renderer ─────────────────────────────────────────────────
  const renderContent = () => {
    // ── OVERVIEW ──────────────────────────────────────────────────────────
    if (activeTab === 'overview') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: `Pendapatan ${periodLabel}`, value: G(kpi.revenue), delta: '+18.4%', sub: 'vs periode lalu', color: '#F2A900',
              icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
            { label: 'Laba Bersih', value: G(profit), delta: `${margin}%`, sub: 'profit margin', color: '#0EC278',
              icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
            { label: 'Biaya Operasional', value: G(kpi.cost), delta: `${kpi.revenue > 0 ? (kpi.cost/kpi.revenue*100).toFixed(0) : 0}%`, sub: 'dari omzet', color: '#38BDF8',
              icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
            { label: 'Total Transaksi', value: `${kpi.txCount} Tx`, delta: `${transactions.length}`, sub: 'dari kasir POS', color: '#A855F7',
              icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '20px 22px', background: 'linear-gradient(135deg,#141417,#111114)', border: '1px solid #28282F', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:`${s.color}08`, pointerEvents:'none' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:`${s.color}15`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>{s.icon}</div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:900, color:s.color }}>{s.delta}</div>
                  <div style={{ fontSize:9, color:'#5C5C70', marginTop:1 }}>{s.sub}</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:'#5C5C70', fontWeight:600, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:900, color:'#fff', letterSpacing:'-.02em' }}>{s.value}</div>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${s.color},transparent)` }}/>
            </div>
          ))}
        </div>

        {/* Chart + Composition */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 18 }}>
          <div className="card" style={{ padding: 24, background: '#141417', border: '1px solid #28282F' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:900, color:'#fff', marginBottom:3 }}>Grafik Pendapatan — <span style={{ color:'#F2A900' }}>{branchLabel}</span></div>
                <div style={{ fontSize:11, color:'#5C5C70' }}>{period==='day'?`Per jam · ${selectedDate}`:period==='week'?'Per hari':period==='month'?`Per tanggal · ${selectedMonth}`:'Per bulan · 2026'}</div>
              </div>
              <div style={{ display:'flex', gap:14, fontSize:10.5, fontWeight:700, flexWrap:'wrap' }}>
                {[['#F2A900','Pendapatan'],['#38BDF8','Biaya']].map(([c,l]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:22, height:3, borderRadius:2, background:c }}/>
                    <span style={{ color:'#A0A0B0' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <AreaLineChart data={chartRows} width={700} height={230}/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:18, paddingTop:16, borderTop:'1px solid #1E1E26' }}>
              {[['Total Pendapatan',G(totalChartRev),'#F2A900'],['Total Biaya',G(totalChartCost),'#38BDF8'],['Net Profit',G(totalChartRev-totalChartCost),'#0EC278']].map(([l,v,c]) => (
                <div key={l} style={{ background:'#0D0D0F', borderRadius:10, padding:'11px 14px', border:'1px solid #1E1E26' }}>
                  <div style={{ fontSize:10, color:'#5C5C70', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:15, fontWeight:900, color:c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="card" style={{ padding:20, background:'#141417', border:'1px solid #28282F', flex:1 }}>
              <div style={{ fontSize:14, fontWeight:800, color:'#fff', marginBottom:16 }}>Komposisi Layanan</div>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
                <DonutChart segments={[{color:'#F2A900',value:58},{color:'#38BDF8',value:23},{color:'#0EC278',value:12},{color:'#A855F7',value:7}]} total={100}/>
              </div>
              {[['Premium Detailing',58,'#F2A900'],['Fast Clean',23,'#38BDF8'],['Merchandise',12,'#0EC278'],['Products',7,'#A855F7']].map(([l,p,c]) => (
                <div key={l} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6, color:'#A0A0B0' }}><span style={{ width:7, height:7, borderRadius:2, background:c, display:'inline-block' }}/>{l}</span>
                    <span style={{ fontWeight:800, color:'#fff' }}>{p}%</span>
                  </div>
                  <div style={{ height:4, background:'#0D0D0F', borderRadius:4, overflow:'hidden' }}><div style={{ width:`${p}%`, height:'100%', background:c, borderRadius:4 }}/></div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding:16, background:'#141417', border:'1px solid #28282F' }}>
              <div style={{ fontSize:12, fontWeight:800, color:'#fff', marginBottom:12 }}>Performa Cabang</div>
              {[['Senopati',91400000,'#F2A900',100],['BSD City',60200000,'#38BDF8',66],['Sby Barat',43800000,'#0EC278',48]].map(([n,v,c,p]) => (
                <div key={n} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:10.5, marginBottom:3 }}>
                    <span style={{ color:'#A0A0B0' }}>{n}</span>
                    <span style={{ color:'#fff', fontWeight:800, fontFamily:'monospace' }}>{G(v)}</span>
                  </div>
                  <div style={{ height:4, background:'#0D0D0F', borderRadius:4, overflow:'hidden' }}><div style={{ width:`${p}%`, height:'100%', background:c, borderRadius:4 }}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: member tiers + recent tx */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr) minmax(0,2fr)', gap: 14 }}>
          {[
            { label:'VIP Platinum', val: members.filter(m=>m.tier==='VIP Platinum').length, color:'#A855F7', icon:'👑' },
            { label:'VIP Gold',     val: members.filter(m=>m.tier==='VIP Gold').length,     color:'#F2A900', icon:'⭐' },
            { label:'Silver',       val: members.filter(m=>m.tier==='Silver').length,       color:'#94A3B8', icon:'◈' },
          ].map(t => (
            <div key={t.label} className="card" style={{ padding:'20px 22px', background:'#141417', border:`1px solid ${t.color}22` }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{t.icon}</div>
              <div style={{ fontSize:30, fontWeight:900, color:t.color }}>{t.val}</div>
              <div style={{ fontSize:11, color:'#5C5C70', fontWeight:600, marginTop:4 }}>{t.label}</div>
            </div>
          ))}
          <div className="card" style={{ padding:20, background:'#141417', border:'1px solid #28282F' }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#fff', marginBottom:14 }}>Transaksi Terbaru (POS)</div>
            {transactions.length === 0
              ? <div style={{ padding:'28px 0', textAlign:'center', color:'#5C5C70', fontSize:12 }}>Belum ada transaksi</div>
              : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[...transactions].slice(-5).reverse().map((t, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'#0D0D0F', borderRadius:10, border:'1px solid #1E1E26' }}>
                      <div style={{ width:32, height:32, borderRadius:9, background:'rgba(242,169,0,.1)', border:'1px solid rgba(242,169,0,.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>💳</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11.5, fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.customer||t.customerName||'Walk-In'}</div>
                        <div style={{ fontSize:10, color:'#5C5C70' }}>{Array.isArray(t.items)?t.items[0]||'POS':t.channel||'POS'}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:12, fontWeight:900, color:'#F2A900' }}>{G(t.amount||t.total||0)}</div>
                        <div style={{ fontSize:9, color:'#5C5C70', textTransform:'uppercase', fontWeight:700 }}>{(t.method||'qris').toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    );

    // ── LAPORAN KEUANGAN (Bank Statement Style) ───────────────────────────
    if (activeTab === 'laporan') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header Banner */}
        <div style={{ background:'linear-gradient(135deg,#0f1a0f,#1a2a1a,#0f1a0f)', borderRadius:16, padding:'22px 28px', border:'1px solid rgba(14,194,120,.2)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.12em', color:'#0EC278', marginBottom:6 }}>📄 LAPORAN MUTASI KEUANGAN</div>
            <div style={{ fontSize:11, color:'#5C5C70', marginTop:2 }}>
              {mutPeriod === 'day' ? `Tanggal ${mutDate}` : `Bulan ${mutMonth}`} · {BRANCHES.find(b=>b.id===mutBranch)?.label}
            </div>
          </div>
          {/* Summary pills */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {[
              { label:'Total Pemasukan', val: G(mutTotalIncome), color:'#0EC278', bg:'rgba(14,194,120,.1)', border:'rgba(14,194,120,.25)' },
              { label:'Total Pengeluaran', val: G(mutTotalExpense), color:'#F04F4F', bg:'rgba(240,79,79,.08)', border:'rgba(240,79,79,.22)' },
              { label:'Selisih Bersih', val: G(Math.abs(mutNet)), color: mutNet>=0?'#F2A900':'#F04F4F', bg:'rgba(242,169,0,.08)', border:'rgba(242,169,0,.2)' },
            ].map(s => (
              <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:12, padding:'10px 18px', minWidth:160, textAlign:'center' }}>
                <div style={{ fontSize:10, color:'#5C5C70', fontWeight:700, marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.val}</div>
                {s.label === 'Selisih Bersih' && <div style={{ fontSize:9, color:'#5C5C70', marginTop:2 }}>{mutNet>=0?'▲ Surplus':'▼ Defisit'}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>

          {/* Period toggle */}
          <div style={{ display:'flex', background:'#141417', border:'1px solid #28282F', borderRadius:10, padding:3, gap:3 }}>
            {[['day','Harian'],['month','Bulanan']].map(([id,l]) => (
              <button key={id} onClick={() => { setMutPeriod(id); setMutPage(1); }} style={{
                padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                background: mutPeriod===id ? '#F2A900' : 'transparent',
                color: mutPeriod===id ? '#0D0D0F' : '#5C5C70', transition:'all .15s',
              }}>{l}</button>
            ))}
          </div>

          {/* Date / Month input */}
          {mutPeriod === 'day'
            ? <input type="date" value={mutDate} onChange={e => { setMutDate(e.target.value); setMutPage(1); }} className="input" style={{ width:155, fontSize:12, padding:'7px 12px' }}/>
            : <input type="month" value={mutMonth} onChange={e => { setMutMonth(e.target.value); setMutPage(1); }} className="input" style={{ width:155, fontSize:12, padding:'7px 12px' }}/>
          }

          {/* Type filter */}
          <div style={{ display:'flex', background:'#141417', border:'1px solid #28282F', borderRadius:10, padding:3, gap:3 }}>
            {[['all','Semua'],['income','Pemasukan'],['expense','Pengeluaran']].map(([id,l]) => (
              <button key={id} onClick={() => { setMutType(id); setMutPage(1); }} style={{
                padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                background: mutType===id ? (id==='income'?'#0EC278':id==='expense'?'#F04F4F':'#F2A900') : 'transparent',
                color: mutType===id ? (id==='all'?'#0D0D0F':'#fff') : '#5C5C70',
                transition:'all .15s',
              }}>{l}</button>
            ))}
          </div>

          {/* Branch filter */}
          <select value={mutBranch} onChange={e => { setMutBranch(e.target.value); setMutPage(1); }} className="input" style={{ fontSize:12, padding:'7px 12px', width:170 }}>
            {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>

          {/* Search */}
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <input type="text" placeholder="Cari deskripsi / kode / kategori..." value={mutSearch} onChange={e => { setMutSearch(e.target.value); setMutPage(1); }}
              style={{ width:'100%', background:'#141417', border:'1px solid #28282F', borderRadius:10, padding:'7px 12px 7px 34px', color:'#fff', fontSize:12, outline:'none' }}/>
            <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#5C5C70', fontSize:13 }}>🔍</span>
          </div>

          {/* Result count */}
          <div style={{ fontSize:11, color:'#5C5C70', fontWeight:700, whiteSpace:'nowrap' }}>
            {filteredMutations.length} entri
          </div>
        </div>

        {/* Statement Table */}
        <div className="card" style={{ padding:0, background:'#141417', border:'1px solid #28282F', overflow:'hidden' }}>
          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'120px 80px 1fr 160px 140px 130px', gap:0, padding:'12px 20px', background:'#0D0D0F', borderBottom:'1px solid #1E1E26', fontSize:10.5, fontWeight:800, color:'#5C5C70', textTransform:'uppercase', letterSpacing:'.07em' }}>
            <div>Tanggal</div>
            <div>No. Ref</div>
            <div>Deskripsi & Kategori</div>
            <div>Cabang</div>
            <div style={{ textAlign:'right' }}>Debit / Kredit</div>
            <div style={{ textAlign:'right' }}>Saldo</div>
          </div>

          {pagedMut.length === 0 ? (
            <div style={{ padding:'60px 20px', textAlign:'center', color:'#5C5C70' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#A0A0B0', marginBottom:4 }}>Tidak ada data</div>
              <div style={{ fontSize:12 }}>Coba ubah filter periode atau jenis transaksi</div>
            </div>
          ) : (
            <div>
              {pagedMut.map((row, idx) => {
                const isIncome = row.type === 'income';
                const isLast = idx === pagedMut.length - 1;
                return (
                  <div key={row.id} style={{
                    display:'grid', gridTemplateColumns:'120px 80px 1fr 160px 140px 130px',
                    gap:0, padding:'13px 20px',
                    borderBottom: isLast ? 'none' : '1px solid #1A1A20',
                    background: idx % 2 === 0 ? '#141417' : '#131316',
                    transition:'background .12s',
                    cursor:'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(242,169,0,.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = idx%2===0?'#141417':'#131316'}
                  >
                    {/* Date */}
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{row.date}</div>
                      <div style={{ fontSize:10, color:'#5C5C70', marginTop:2 }}>
                        {new Date(row.date).toLocaleDateString('id-ID',{weekday:'short'})}
                      </div>
                    </div>

                    {/* Ref */}
                    <div style={{ display:'flex', alignItems:'center' }}>
                      <span style={{ fontSize:10, fontFamily:'monospace', color:'#5C5C70', fontWeight:600 }}>{row.id}</span>
                    </div>

                    {/* Description */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                      <div style={{ width:34, height:34, borderRadius:9, flexShrink:0,
                        background: isIncome ? 'rgba(14,194,120,.1)' : 'rgba(240,79,79,.08)',
                        border: `1px solid ${isIncome ? 'rgba(14,194,120,.2)' : 'rgba(240,79,79,.18)'}`,
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
                      }}>
                        {isIncome ? '↑' : '↓'}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:12.5, fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{row.description}</div>
                        <div style={{ fontSize:10.5, color:'#5C5C70', marginTop:1 }}>
                          <span style={{
                            background: isIncome ? 'rgba(14,194,120,.1)' : 'rgba(240,79,79,.08)',
                            color: isIncome ? '#0EC278' : '#F04F4F',
                            borderRadius:5, padding:'1px 6px', fontWeight:700, fontSize:9.5,
                          }}>{row.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Branch */}
                    <div style={{ display:'flex', alignItems:'center' }}>
                      <span style={{ fontSize:11.5, color:'#A0A0B0', fontWeight:600 }}>{BRANCH_LABELS[row.branch] || row.branch}</span>
                    </div>

                    {/* Amount */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                      <span style={{ fontSize:13.5, fontWeight:900, color: isIncome ? '#0EC278' : '#F04F4F', fontFamily:'monospace' }}>
                        {isIncome ? '+' : '-'}{G(row.amount)}
                      </span>
                    </div>

                    {/* Balance */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                      <span style={{ fontSize:12.5, fontWeight:800, color:'#F2A900', fontFamily:'monospace' }}>{G(Math.abs(row.balance))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderTop:'1px solid #1E1E26', background:'#0D0D0F' }}>
              <div style={{ fontSize:11, color:'#5C5C70' }}>
                Menampilkan {(mutPage-1)*MUT_PAGE_SIZE+1}–{Math.min(mutPage*MUT_PAGE_SIZE, filteredMutations.length)} dari {filteredMutations.length} entri
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => setMutPage(p => Math.max(1, p-1))} disabled={mutPage===1}
                  style={{ padding:'5px 12px', borderRadius:8, border:'1px solid #28282F', background: mutPage===1?'transparent':'#1A1A1F', color: mutPage===1?'#3A3A45':'#A0A0B0', cursor: mutPage===1?'default':'pointer', fontSize:12, fontWeight:700 }}>
                  ← Prev
                </button>
                {Array.from({length:Math.min(7,totalPages)},(_,i)=>{
                  let pg = i+1;
                  if(totalPages>7){
                    if(mutPage<=4) pg=i+1;
                    else if(mutPage>=totalPages-3) pg=totalPages-6+i;
                    else pg=mutPage-3+i;
                  }
                  return (
                    <button key={pg} onClick={() => setMutPage(pg)}
                      style={{ width:32, height:32, borderRadius:8, border: pg===mutPage?'none':'1px solid #28282F', background: pg===mutPage?'#F2A900':'transparent', color: pg===mutPage?'#0D0D0F':'#A0A0B0', cursor:'pointer', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => setMutPage(p => Math.min(totalPages, p+1))} disabled={mutPage===totalPages}
                  style={{ padding:'5px 12px', borderRadius:8, border:'1px solid #28282F', background: mutPage===totalPages?'transparent':'#1A1A1F', color: mutPage===totalPages?'#3A3A45':'#A0A0B0', cursor: mutPage===totalPages?'default':'pointer', fontSize:12, fontWeight:700 }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    // ── MEMBER ANALYTICS ──────────────────────────────────────────────────
    if (activeTab === 'members') return (
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label:'Total Member', val:members.length, color:'#F2A900', icon:'👥' },
            { label:'VIP Platinum', val:members.filter(m=>m.tier==='VIP Platinum').length, color:'#A855F7', icon:'👑' },
            { label:'VIP Gold', val:members.filter(m=>m.tier==='VIP Gold').length, color:'#F2A900', icon:'⭐' },
            { label:'Silver Member', val:members.filter(m=>m.tier==='Silver').length, color:'#94A3B8', icon:'◈' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'18px 20px', background:'#141417', border:`1px solid ${s.color}20` }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:28, fontWeight:900, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11, color:'#5C5C70', marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding:22, background:'#141417', border:'1px solid #28282F' }}>
          <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:16 }}>Daftar Member Terdaftar</div>
          <table className="data-table">
            <thead><tr><th>Member</th><th>Tier</th><th>Kunjungan</th><th>AURA Points</th><th>Bergabung</th></tr></thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id||i}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#1A1A1F,#28282F)', border:'1.5px solid rgba(242,169,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'#F2A900' }}>
                        {m.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontWeight:800, fontSize:13 }}>{m.name}</div>
                        <div style={{ fontSize:10.5, color:'#5C5C70' }}>{m.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: m.tier==='VIP Platinum'?'rgba(168,85,247,.15)':m.tier==='VIP Gold'?'rgba(242,169,0,.15)':'rgba(148,163,184,.15)',
                      color: m.tier==='VIP Platinum'?'#A855F7':m.tier==='VIP Gold'?'#F2A900':'#94A3B8',
                      border:`1px solid ${m.tier==='VIP Platinum'?'rgba(168,85,247,.3)':m.tier==='VIP Gold'?'rgba(242,169,0,.3)':'rgba(148,163,184,.3)'}`,
                    }}>{m.tier}</span>
                  </td>
                  <td style={{ fontWeight:800, color:'#fff' }}>{m.totalVisits??0}x</td>
                  <td style={{ color:'#F2A900', fontWeight:800 }}>{m.points??0} pts</td>
                  <td style={{ color:'#5C5C70', fontSize:12 }}>{m.joinDate??'2026'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    // ── KELOLA USER ───────────────────────────────────────────────────────
    if (activeTab === 'users') return (
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
          <div>
            <h3 style={{ fontSize:20, fontWeight:900, color:'#fff', margin:0 }}>Kelola Akun User & Staf</h3>
            <p style={{ fontSize:13, color:'#5C5C70', margin:'4px 0 0 0' }}>Buat dan kelola hak akses akun Kasir, Welcomer, dan Staf Inventori</p>
          </div>
          <button className="btn btn-gold" style={{ fontSize:13, padding:'9px 18px' }} onClick={() => setShowAddStaffModal(true)}>
            + Buat Akun Staf Baru
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label:'Total Staf', val:staffList.length, color:'#F2A900', icon:'👤' },
            { label:'Kasir POS', val:staffList.filter(s=>s.role==='kasir').length, color:'#0EC278', icon:'💳' },
            { label:'Welcomer', val:staffList.filter(s=>s.role==='welcomer').length, color:'#38BDF8', icon:'🖥️' },
            { label:'Inventori', val:staffList.filter(s=>s.role==='inventori').length, color:'#A855F7', icon:'📦' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'18px 20px', background:'#141417', border:`1px solid ${s.color}25`, display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:`${s.color}15`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:26, fontWeight:900, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:11, color:'#5C5C70' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding:22, background:'#141417', border:'1px solid #28282F' }}>
          <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginBottom:16 }}>Daftar Akun Pengguna Staf AURA</div>
          <table className="data-table">
            <thead><tr><th>Staf</th><th>Username</th><th>Role</th><th>Cabang</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {staffList.length === 0
                ? <tr><td colSpan={6} style={{ textAlign:'center', color:'#5C5C70', padding:'50px 0' }}><div style={{ fontSize:32, marginBottom:8 }}>👤</div>Belum ada akun staf</td></tr>
                : staffList.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#1A1A1F,#28282F)', border:'1.5px solid #F2A900', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'#F2A900' }}>
                          {s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontWeight:800, fontSize:13 }}>{s.name}</div>
                          <div style={{ fontSize:10, color:'#5C5C70' }}>Dibuat: {s.createdAt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mono" style={{ color:'#F2A900', fontWeight:700 }}>{s.username}</td>
                    <td>
                      <span className="badge" style={{
                        background: s.role==='kasir'?'rgba(14,194,120,.15)':s.role==='welcomer'?'rgba(56,189,248,.15)':'rgba(168,85,247,.15)',
                        color: s.role==='kasir'?'#0EC278':s.role==='welcomer'?'#38BDF8':'#A855F7',
                        border:`1px solid ${s.role==='kasir'?'rgba(14,194,120,.3)':s.role==='welcomer'?'rgba(56,189,248,.3)':'rgba(168,85,247,.3)'}`,
                        fontSize:10.5, fontWeight:800,
                      }}>{s.role.toUpperCase()}</span>
                    </td>
                    <td style={{ fontSize:12 }}>{BRANCHES.find(b=>b.id===s.branch)?.label||s.branch}</td>
                    <td>
                      <button onClick={() => toggleStaffStatus(s.id)} style={{
                        background: s.status==='active'?'rgba(14,194,120,.12)':'rgba(240,79,79,.12)',
                        color: s.status==='active'?'#0EC278':'#F04F4F',
                        border:`1px solid ${s.status==='active'?'rgba(14,194,120,.3)':'rgba(240,79,79,.3)'}`,
                        borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:800, cursor:'pointer',
                      }}>{s.status==='active'?'● AKTIF':'○ NONAKTIF'}</button>
                    </td>
                    <td>
                      <button onClick={() => deleteStaffAccount(s.id)} style={{ background:'transparent', border:'1px solid rgba(240,79,79,.3)', color:'#F04F4F', borderRadius:8, padding:'5px 10px', fontSize:11, cursor:'pointer', fontWeight:700 }}>
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Modal Add Staff */}
        {showAddStaffModal && (
          <div className="modal-overlay" onClick={() => setShowAddStaffModal(false)}>
            <div className="card" onClick={e => e.stopPropagation()} style={{ padding:32, maxWidth:480, width:'100%', background:'#141417', border:'1px solid #28282F' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'rgba(242,169,0,.15)', border:'1px solid rgba(242,169,0,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>👤</div>
                <div>
                  <div style={{ fontSize:17, fontWeight:900, color:'#fff' }}>Buat Akun Staf Baru</div>
                  <div style={{ fontSize:11, color:'#5C5C70' }}>Daftarkan akun staf untuk portal kasir, welcomer, atau inventori</div>
                </div>
              </div>
              <div style={{ height:1, background:'#28282F', margin:'18px 0' }}/>
              <form onSubmit={handleCreateStaff} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label className="label">Role / Tanggung Jawab *</label>
                  <select value={staffForm.role} onChange={e=>setStaffForm({...staffForm,role:e.target.value})} className="input">
                    <option value="kasir">💳 Kasir POS Financial</option>
                    <option value="welcomer">🖥️ Welcomer Front Officer</option>
                    <option value="inventori">📦 Staf Inventori Gudang</option>
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label className="label">Nama Lengkap *</label>
                    <input className="input" placeholder="cth. Rian Kasir" value={staffForm.name} onChange={e=>setStaffForm({...staffForm,name:e.target.value})} required/>
                  </div>
                  <div>
                    <label className="label">Username Login *</label>
                    <input className="input mono" placeholder="kasir.rian" value={staffForm.username} onChange={e=>setStaffForm({...staffForm,username:e.target.value})} required/>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label className="label">Password</label>
                    <input className="input mono" value={staffForm.password} onChange={e=>setStaffForm({...staffForm,password:e.target.value})} required/>
                  </div>
                  <div>
                    <label className="label">Cabang Penugasan</label>
                    <select value={staffForm.branch} onChange={e=>setStaffForm({...staffForm,branch:e.target.value})} className="input">
                      {BRANCHES.filter(b=>b.id!=='all').map(b=><option key={b.id} value={b.id}>{b.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:6 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddStaffModal(false)} style={{ justifyContent:'center' }}>Batal</button>
                  <button type="submit" className="btn btn-gold" style={{ justifyContent:'center' }}>✓ Buat Akun</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );

    return null;
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 60px)', background:'#0D0D0F' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: SIDEBAR_W, minHeight:'100%', background:'#141417', borderRight:'1px solid #28282F',
        display:'flex', flexDirection:'column', transition:'width .22s ease',
        flexShrink:0, overflow:'hidden', position:'sticky', top:60, height:'calc(100vh - 60px)',
      }}>
        {/* Brand */}
        <div style={{ padding: sidebarExpanded?'18px 16px 14px':'18px 10px 14px', borderBottom:'1px solid #28282F', display:'flex', alignItems:'center', justifyContent: sidebarExpanded?'space-between':'center' }}>
          {sidebarExpanded && (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#F2A900,#C98B00)', display:'flex', alignItems:'center', justifyContent:'center', color:'#0D0D0F', fontWeight:900 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:900, color:'#fff' }}>OWNER</div>
                <div style={{ fontSize:10, color:'#5C5C70' }}>Executive Analytics</div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarExpanded(!sidebarExpanded)}
            style={{ background:'#1A1A1F', border:'1px solid #28282F', cursor:'pointer', color:'#5C5C70', fontSize:12, padding:'4px 7px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, transition:'all .15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#28282F'; e.currentTarget.style.color='#A0A0B0'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#1A1A1F'; e.currentTarget.style.color='#5C5C70'; }}
          >{sidebarExpanded?'◀':'▶'}</button>
        </div>

        {/* Nav */}
        <div style={{ padding:'10px 8px', flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
          {SIDEBAR_NAV.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                display:'flex', alignItems:'center', gap:12,
                width:'100%', padding: sidebarExpanded?'10px 14px':'10px',
                borderRadius:10, border:'none', cursor:'pointer',
                background: active?'rgba(242,169,0,.12)':'transparent',
                color: active?'#F2A900':'#A0A0B0',
                fontSize:13, fontWeight: active?700:500, transition:'all .15s',
                justifyContent: sidebarExpanded?'flex-start':'center',
                borderLeft: active?'3px solid #F2A900':'3px solid transparent',
                position:'relative',
              }}
              onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='#fff'; }}}
              onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#A0A0B0'; }}}
              >
                <span style={{ flexShrink:0 }}>{item.icon}</span>
                {sidebarExpanded && <span style={{ flex:1, textAlign:'left' }}>{item.label}</span>}
                {sidebarExpanded && item.badge && (
                  <span style={{ background:'rgba(242,169,0,.15)', color:'#F2A900', borderRadius:10, fontSize:10, fontWeight:800, padding:'2px 7px' }}>{item.badge}</span>
                )}
                {!sidebarExpanded && active && (
                  <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', width:3, height:20, background:'#F2A900', borderRadius:'3px 0 0 3px' }}/>
                )}
              </button>
            );
          })}
        </div>

        {/* Profile */}
        <div style={{ borderTop:'1px solid #28282F', padding:'12px 10px' }}>
          {sidebarExpanded ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#F2A900,#C98B00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#0D0D0F' }}>OW</div>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Owner Executive</div>
                <div style={{ fontSize:10, color:'#5C5C70' }}>Admin System · Super Akses</div>
              </div>
              <button onClick={() => logoutUser('owner')} title="Logout"
                style={{ background:'transparent', border:'none', cursor:'pointer', color:'#5C5C70', fontSize:16, padding:4, display:'flex', alignItems:'center', borderRadius:6, transition:'color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#F04F4F'}
                onMouseLeave={e=>e.currentTarget.style.color='#5C5C70'}
              >⏻</button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'center' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'#F2A900', color:'#0D0D0F', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900 }}>OW</div>
              <button onClick={() => logoutUser('owner')} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#5C5C70', fontSize:16, padding:4 }}>⏻</button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, padding:'32px 28px', overflowY:'auto', minWidth:0 }}>
        {/* Top Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:11, color:'#F2A900', fontWeight:800, textTransform:'uppercase', letterSpacing:'.14em', marginBottom:4 }}>EXECUTIVE DASHBOARD</div>
            <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>
              {activeTab==='overview' && 'Executive Analytics Overview'}
              {activeTab==='laporan' && 'Laporan Mutasi Keuangan'}
              {activeTab==='members' && 'Member LTV & Retention'}
              {activeTab==='users'   && 'Kelola User & Staf'}
            </h1>
          </div>

          {/* Overview filter controls */}
          {activeTab === 'overview' && (
            <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ display:'flex', background:'#141417', border:'1px solid #28282F', borderRadius:10, padding:3, gap:3 }}>
                {BRANCHES.map(b => (
                  <button key={b.id} onClick={() => setBranch(b.id)} style={{
                    padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:11.5, fontWeight:700,
                    background: branch===b.id?'#F2A900':'transparent',
                    color: branch===b.id?'#0D0D0F':'#5C5C70', transition:'all .15s',
                  }}>{b.short}</button>
                ))}
              </div>
              <div style={{ display:'flex', background:'#141417', border:'1px solid #28282F', borderRadius:10, padding:3, gap:3 }}>
                {PERIODS.map(p => (
                  <button key={p.id} onClick={() => setPeriod(p.id)} style={{
                    padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:11.5, fontWeight:700,
                    background: period===p.id?'#F2A900':'transparent',
                    color: period===p.id?'#0D0D0F':'#5C5C70', transition:'all .15s',
                  }}>{p.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {renderContent()}
      </main>
    </div>
  );
};
