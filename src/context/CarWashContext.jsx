import React, { createContext, useContext, useState } from 'react';

const CarWashContext = createContext();

export const initialMembers = [
  { id: 1, memberId: 'AUR-0001', name: 'Budi Santoso',    phone: '081299887766', vehicle: 'BMW X5 M-Sport',       plate: 'B 1888 AUR', username: 'budi.santoso',   password: '123456', points: 350, tier: 'VIP Gold',    totalVisits: 14, joinDate: '1 Januari 2026' },
  { id: 2, memberId: 'AUR-0002', name: 'Siti Rahma',      phone: '085711223344', vehicle: 'Porsche Macan GTS',    plate: 'B 9999 VIP', username: 'siti.rahma',     password: '123456', points: 180, tier: 'Silver',      totalVisits: 7,  joinDate: '15 Maret 2026' },
  { id: 3, memberId: 'AUR-0003', name: 'Handoko Kusuma',  phone: '081377889900', vehicle: 'Mercedes-Benz G63 AMG',plate: 'B 1 G63',    username: 'handoko.kusuma', password: '123456', points: 520, tier: 'VIP Platinum', totalVisits: 22, joinDate: '10 Februari 2026' },
];

export const initialInventory = [
  { id: 1, sku: 'OP-SHM-001', name: 'AURA Hydro Shampoo Concentrate', category: 'operasional', price: 0, cost: 0, stock: 42.5, minStock: 10, minAlert: 10, unit: 'Liter' },
  { id: 2, sku: 'OP-WAX-002', name: 'Ceramic Quartz Wax Coating', category: 'operasional', price: 0, cost: 0, stock: 14.0, minStock: 4, minAlert: 4, unit: 'Liter' },
  { id: 3, sku: 'OP-TIR-003', name: 'Deep Black Tire Dressing', category: 'operasional', price: 0, cost: 0, stock: 22.0, minStock: 5, minAlert: 5, unit: 'Liter' },
  { id: 4, sku: 'OP-MCF-004', name: 'Edgeless Microfiber Towels (700 GSM)', category: 'operasional', price: 0, cost: 0, stock: 65, minStock: 15, minAlert: 15, unit: 'Pcs' },
  { id: 5, sku: 'RET-KIT-01', name: 'AURA Quick Detailer Spray 500ml', category: 'autocare', price: 185000, cost: 95000, stock: 24, minStock: 5, minAlert: 5, unit: 'Botol' },
  { id: 6, sku: 'RET-APP-02', name: 'AURA Luxury Detailing Hoodie', category: 'merchandise', price: 450000, cost: 180000, stock: 12, minStock: 3, minAlert: 3, unit: 'Pcs' },
  { id: 7, sku: 'RET-AIR-03', name: 'AURA Leather & Oud Air Freshener', category: 'merchandise', price: 65000, cost: 28000, stock: 38, minStock: 10, minAlert: 10, unit: 'Pcs' }
];

export const initialReservations = [
  {
    id: 1,
    bookingCode: 'AURA-20260930-01',
    customerName: 'Budi Santoso',
    phone: '081299887766',
    vehicle: 'BMW X5 M-Sport',
    plate: 'B 1888 AUR',
    serviceId: 'premium_clean',
    serviceName: 'Premium Clean & Detailing',
    price: 250000,
    reservationDate: '2026-09-30',
    reservationTime: '19:30',
    queueNumber: 1,
    status: 'in_progress', // 'confirmed', 'checked_in', 'in_progress', 'completed', 'rescheduled_pending'
    paymentStatus: 'paid',
    paymentMethod: 'qris',
    branchId: 'senopati',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AURA-20260930-01',
    videoBeforeUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoAfterUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: 2,
    bookingCode: 'AURA-20260930-02',
    customerName: 'Siti Rahma',
    phone: '085711223344',
    vehicle: 'Porsche Macan GTS',
    plate: 'B 9999 VIP',
    serviceId: 'fast_clean',
    serviceName: 'Fast Clean Express',
    price: 75000,
    reservationDate: '2026-09-30',
    reservationTime: '20:00',
    queueNumber: 2,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'qris',
    branchId: 'senopati',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=AURA-20260930-02'
  }
];

export const initialTransactions = [
  { id: 'INV-20260930-001', date: '2026-09-30 14:20', customer: 'Handoko Kusuma', cashier: 'Kasir - Rian', channel: 'pos_cashier', amount: 325000, method: 'qris', status: 'success', branch: 'senopati', items: ['Premium Clean (Rp 250.000)', 'Air Freshener (Rp 75.000)'] },
  { id: 'INV-20260930-002', date: '2026-09-30 15:45', customer: 'Budi Santoso', cashier: 'Online Engine', channel: 'online_booking', amount: 250000, method: 'qris', status: 'success', branch: 'senopati', items: ['Premium Clean & Detailing (Rp 250.000)'] },
  { id: 'INV-20260930-003', date: '2026-09-30 16:10', customer: 'Siti Rahma', cashier: 'Kasir - Rian', channel: 'pos_cashier', amount: 75000, method: 'cash', status: 'success', branch: 'senopati', items: ['Fast Clean Express (Rp 75.000)'] },
  { id: 'INV-20260930-004', date: '2026-09-30 17:00', customer: 'Budi Santoso', cashier: 'Marketplace Engine', channel: 'marketplace', amount: 185000, method: 'e_wallet', status: 'success', branch: 'senopati', items: ['Quick Detailer Spray (Rp 185.000)'] },
  { id: 'INV-20260930-005', date: '2026-09-30 18:15', customer: 'Dhani Pratama', cashier: 'Kasir - Rian', channel: 'pos_cashier', amount: 250000, method: 'credit_card', status: 'success', branch: 'bsd_city', items: ['Premium Clean (Rp 250.000)'] }
];

export const CarWashProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState('pelanggan'); // 'pelanggan' | 'welcomer' | 'kasir' | 'inventori' | 'owner'
  const [selectedBranch, setSelectedBranch] = useState('senopati');
  const [members, setMembers] = useState(initialMembers);
  const [inventory, setInventory] = useState(initialInventory);
  const [reservations, setReservations] = useState(initialReservations);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [marketplaceOrders, setMarketplaceOrders] = useState([
    { id: 'ORD-8801', user: 'Budi Santoso', phone: '081299887766', total: 185000, items: 'AURA Quick Detailer Spray 500ml (1x)', status: 'ready_for_pickup', date: '2026-09-30 17:00' }
  ]);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Walk-in or Online Member Registration
  const registerMember = (memberData) => {
    const pad = (n) => String(n).padStart(4, '0');
    const newId = members.length + 1;
    const newMember = {
      id: newId,
      memberId: `AUR-${pad(newId)}`,
      name: memberData.name,
      phone: memberData.phone,
      vehicle: memberData.vehicle,
      plate: memberData.plate,
      username: memberData.username || memberData.phone,
      password: memberData.password || '123456',
      points: 50,
      tier: 'Silver',
      totalVisits: 0,
      joinDate: new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' }),
    };
    setMembers(prev => [...prev, newMember]);
    showToast(`Member baru ${newMember.name} (${newMember.memberId}) berhasil terdaftar! +50 Poin Bonus.`, 'success');
    return newMember;
  };

  // Create Online Booking Reservation
  const createReservation = (bookingData) => {
    const newQueueNum = reservations.filter(r => r.reservationDate === bookingData.date).length + 1;
    const newCode = `AURA-${newDateStr()}-${String(newQueueNum).padStart(2, '0')}`;
    const newReservation = {
      id: reservations.length + 1,
      bookingCode: newCode,
      customerName: bookingData.name,
      phone: bookingData.phone,
      vehicle: bookingData.vehicle,
      plate: bookingData.plate,
      serviceId: bookingData.serviceId,
      serviceName: bookingData.serviceName,
      price: bookingData.price,
      reservationDate: bookingData.date,
      reservationTime: bookingData.time,
      queueNumber: newQueueNum,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: bookingData.paymentMethod || 'qris',
      branchId: selectedBranch,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${newCode}`
    };

    setReservations([...reservations, newReservation]);

    // Record Transaction
    const newTx = {
      id: `INV-${newDateStr()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date().toLocaleString('id-ID'),
      customer: bookingData.name,
      cashier: 'Online Engine',
      channel: 'online_booking',
      amount: bookingData.price,
      method: bookingData.paymentMethod || 'qris',
      status: 'success',
      branch: selectedBranch,
      items: [`${bookingData.serviceName} (Rp ${bookingData.price.toLocaleString('id-ID')})`]
    };
    setTransactions([newTx, ...transactions]);

    // Deduct stock formula automatically
    deductOperationalMaterials(bookingData.serviceId);

    showToast(`Reservasi Berhasil! No. Antrean #${newQueueNum}. Tiket QR dikirim via WhatsApp.`, 'success');
    return newReservation;
  };

  // Late Arrival Engine Trigger (> 5 mins late)
  const triggerLateArrival = (reservationId) => {
    setReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return {
          ...r,
          status: 'rescheduled_pending',
          notes: 'Terlambat > 5 Menit dari slot reservasi. Dana tersimpan sebagai Deposit Voucher.'
        };
      }
      return r;
    }));

    showToast(`⚠️ LATE ARRIVAL ENGINE: Reservasi #${reservationId} terlambat > 5 menit. Slot dialihkan ke antrean berikutnya. Notifikasi Reschedule dikirim via WA!`, 'warning');
  };

  // Deduct Operational Materials per wash type
  const deductOperationalMaterials = (serviceId) => {
    setInventory(prev => prev.map(item => {
      if (serviceId === 'fast_clean') {
        if (item.sku === 'OP-SHM-001') return { ...item, stock: Math.max(0, +(item.stock - 0.100).toFixed(2)) };
        if (item.sku === 'OP-TIR-003') return { ...item, stock: Math.max(0, +(item.stock - 0.050).toFixed(2)) };
      } else if (serviceId === 'premium_clean') {
        if (item.sku === 'OP-SHM-001') return { ...item, stock: Math.max(0, +(item.stock - 0.200).toFixed(2)) };
        if (item.sku === 'OP-WAX-002') return { ...item, stock: Math.max(0, +(item.stock - 0.050).toFixed(2)) };
        if (item.sku === 'OP-TIR-003') return { ...item, stock: Math.max(0, +(item.stock - 0.080).toFixed(2)) };
      }
      return item;
    }));
  };

  // Add POS Cashier Transaction
  const addPosTransaction = (txData) => {
    const newTx = {
      id: `INV-${newDateStr()}-${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date().toLocaleString('id-ID'),
      customer: txData.customerName || 'Walk-In Customer',
      cashier: 'Kasir Front Office',
      channel: 'pos_cashier',
      amount: txData.totalAmount,
      method: txData.paymentMethod,
      status: 'success',
      branch: selectedBranch,
      items: txData.itemsSummary
    };

    setTransactions([newTx, ...transactions]);

    // Deduct retail product stock if any
    if (txData.retailItems && txData.retailItems.length > 0) {
      setInventory(prev => prev.map(item => {
        const found = txData.retailItems.find(i => i.id === item.id);
        if (found) {
          return { ...item, stock: Math.max(0, item.stock - found.qty) };
        }
        return item;
      }));
    }

    if (txData.serviceId) {
      deductOperationalMaterials(txData.serviceId);
    }

    showToast(`Transaksi ${newTx.id} senilai Rp ${txData.totalAmount.toLocaleString('id-ID')} Berhasil Disimpan!`, 'success');
    return newTx;
  };

  // Restock Inbound Inventory
  const restockItem = (productId, addQty) => {
    setInventory(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, stock: +(item.stock + parseFloat(addQty)).toFixed(2) };
      }
      return item;
    }));
    showToast(`Restock Berhasil! Stok telah ditambahkan.`, 'success');
  };

  // Checkout Marketplace Order
  const checkoutMarketplace = (cartItems, total) => {
    const newOrd = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      user: 'Budi Santoso',
      phone: '081299887766',
      total: total,
      items: cartItems.map(i => `${i.name} (${i.qty}x)`).join(', '),
      status: 'preparing',
      date: new Date().toLocaleString('id-ID')
    };

    setMarketplaceOrders([newOrd, ...marketplaceOrders]);

    // Deduct stock
    setInventory(prev => prev.map(invItem => {
      const inCart = cartItems.find(c => c.id === invItem.id);
      if (inCart) {
        return { ...invItem, stock: Math.max(0, invItem.stock - inCart.qty) };
      }
      return invItem;
    }));

    showToast(`Order Marketplace ${newOrd.id} berhasil diselesaikan! Staf inventori sedang menyiapkan pesanan Anda.`, 'success');
  };

  // Export CSV Data
  const exportCSV = () => {
    const headers = ['ID Invoice', 'Tanggal', 'Pelanggan', 'Kasir / Channel', 'Metode Bayar', 'Total (Rp)', 'Status', 'Cabang'];
    const rows = transactions.map(t => [t.id, t.date, t.customer, `${t.cashier} (${t.channel})`, t.method.toUpperCase(), t.amount, t.status, t.branch]);
    
    let csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_AURA_CarWash_${newDateStr()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`File Laporan CSV Keuangan berhasil diunduh!`, 'success');
  };

  // Export Excel Data
  const exportExcel = () => {
    let tsvContent = 'data:application/vnd.ms-excel;charset=utf-8,' +
      'ID Invoice\tTanggal\tPelanggan\tKasir / Channel\tMetode Bayar\tTotal (Rp)\tStatus\tCabang\n' +
      transactions.map(t => `${t.id}\t${t.date}\t${t.customer}\t${t.cashier}\t${t.method.toUpperCase()}\t${t.amount}\t${t.status}\t${t.branch}`).join('\n');
    
    const encodedUri = encodeURI(tsvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_AURA_CarWash_${newDateStr()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`File Laporan Excel (.xls) Keuangan berhasil diunduh!`, 'success');
  };

  // ── ALIASES used by the redesigned components ──────────────────────

  /** Check-in a reservation by ID */
  const checkInCustomer = (reservationId) => {
    setReservations(prev => prev.map(r =>
      r.id === reservationId ? { ...r, status: 'checked_in' } : r
    ));
    showToast(`Check-In berhasil! Pelanggan dipersilakan masuk.`, 'success');
  };

  /** Check-out (Selesai) a reservation by ID */
  const checkOutCustomer = (reservationId) => {
    setReservations(prev => prev.map(r =>
      r.id === reservationId ? { ...r, status: 'completed' } : r
    ));
    showToast(`Check-Out (Selesai) berhasil! Layanan telah diselesaikan.`, 'success');
  };

  /** Register a walk-in customer */
  const walkInCustomer = (data) => {
    const qNum = reservations.length + 1;
    const code = `WALK-${newDateStr2()}-${String(qNum).padStart(2,'0')}`;
    const isQrisPaid = data.paymentMethod === 'qris';
    const payStatus = isQrisPaid ? 'paid' : 'unpaid';

    const newRes = {
      id: reservations.length + 1,
      bookingCode: code,
      customerName: data.name,
      phone: data.phone,
      vehicle: data.vehicle,
      plate: data.plate,
      serviceId: data.service,
      serviceName: data.serviceName
        ?? (data.service === 'fast_clean' ? 'Fast Clean Express' : 'Premium Clean & Detailing'),
      variantId: data.variant ?? 'medium',
      price: data.price
        ?? (data.service === 'fast_clean' ? 85000 : 275000),
      queueNumber: qNum,
      status: 'checked_in',
      paymentStatus: payStatus,
      paymentMethod: data.paymentMethod || 'cash',
      branchId: selectedBranch,
      type: 'walkin',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${code}`,
    };

    setReservations(prev => [...prev, newRes]);

    // If paid via QRIS directly at Welcomer, record financial transaction for POS & Owner!
    if (isQrisPaid) {
      const newTx = {
        id: `INV-${newDateStr2()}-${String(transactions.length + 1).padStart(3, '0')}`,
        date: new Date().toLocaleString('id-ID'),
        customer: data.name,
        cashier: 'Welcomer QRIS Engine',
        channel: 'welcomer_qris',
        amount: newRes.price,
        method: 'qris',
        status: 'success',
        branch: selectedBranch,
        items: [`${newRes.serviceName} (Rp ${newRes.price.toLocaleString('id-ID')})`]
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    deductOperationalMaterials(data.service);

    showToast(`Walk-In terdaftar! No. Antrean #${qNum} — ${newRes.serviceName}`, 'success');
    return newRes;
  };

  /** Process cash payment for an unpaid reservation at Kasir POS */
  const payUnpaidReservation = (reservationId, method = 'cash') => {
    let target = null;
    setReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        target = { ...r, paymentStatus: 'paid', paymentMethod: method };
        return target;
      }
      return r;
    }));

    if (target) {
      const newTx = {
        id: `INV-${newDateStr2()}-${String(transactions.length + 1).padStart(3, '0')}`,
        date: new Date().toLocaleString('id-ID'),
        customer: target.customerName,
        cashier: 'Kasir Front Office',
        channel: 'pos_cashier',
        amount: target.price,
        method: method,
        status: 'success',
        branch: selectedBranch,
        items: [`${target.serviceName} (${target.bookingCode})`]
      };
      setTransactions(prev => [newTx, ...prev]);
      showToast(`Pembayaran #${target.bookingCode} sebesar Rp ${target.price.toLocaleString('id-ID')} LUNAS di Kasir POS!`, 'success');
    }
  };

  /** Store / Inventory CRUD Operations */
  const addProduct = (itemData) => {
    const newProduct = {
      id: inventory.length + 1,
      sku: itemData.sku || `RET-PROD-${String(inventory.length + 1).padStart(2,'0')}`,
      name: itemData.name,
      category: itemData.category || 'autocare',
      price: parseFloat(itemData.price) || 0,
      cost: parseFloat(itemData.cost) || 0,
      stock: parseInt(itemData.stock) || 0,
      minStock: 5,
      minAlert: 5,
      unit: itemData.unit || 'Pcs',
    };
    setInventory(prev => [...prev, newProduct]);
    showToast(`Produk Store "${newProduct.name}" berhasil ditambahkan!`, 'success');
    return newProduct;
  };

  const updateProduct = (productId, updatedData) => {
    setInventory(prev => prev.map(item =>
      item.id === productId ? { ...item, ...updatedData } : item
    ));
    showToast(`Produk Store berhasil diperbarui!`, 'success');
  };

  const deleteProduct = (productId) => {
    setInventory(prev => prev.filter(item => item.id !== productId));
    showToast(`Produk Store berhasil dihapus.`, 'warning');
  };

  /** Process a POS payment — alias for addPosTransaction */
  const processPayment = ({ items, total, discount, method }) => {
    const tx = {
      id: `INV-${newDateStr2()}-${String(transactions.length + 1).padStart(3,'0')}`,
      date: new Date().toLocaleString('id-ID'),
      time: new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }),
      customerName: 'Walk-In Customer',
      cashier: 'Kasir Front Office',
      channel: 'pos_cashier',
      total,
      amount: total,
      discount,
      method,
      status: 'success',
      branch: selectedBranch,
      items,
    };
    setTransactions(prev => [tx, ...prev]);
    showToast(`Transaksi ${tx.id} sebesar Rp ${total.toLocaleString('id-ID')} berhasil!`, 'success');
    return tx;
  };

  /** Update or add an inventory item */
  const updateInventory = (itemData) => {
    setInventory(prev => {
      const exists = prev.find(i => i.id === itemData.id);
      if (exists) return prev.map(i => i.id === itemData.id ? { ...i, ...itemData } : i);
      return [...prev, { ...itemData, id: `inv_${Date.now()}` }];
    });
    showToast(`Item inventori berhasil diperbarui.`, 'success');
  };

  const newDateStr2 = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  };

  const newDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  };

  return (
    <CarWashContext.Provider value={{
      activeRole,
      setActiveRole,
      selectedBranch,
      setSelectedBranch,
      members,
      inventory,
      reservations,
      setReservations,
      transactions,
      marketplaceOrders,
      setMarketplaceOrders,
      registerMember,
      createReservation,
      triggerLateArrival,
      addPosTransaction,
      restockItem,
      checkoutMarketplace,
      exportCSV,
      exportExcel,
      notification,
      showToast,
      // ── aliases for redesigned components ──
      checkInCustomer,
      checkOutCustomer,
      walkInCustomer,
      payUnpaidReservation,
      addProduct,
      updateProduct,
      deleteProduct,
      processPayment,
      updateInventory,
    }}>
      {children}
    </CarWashContext.Provider>
  );
};

export const useCarWash = () => useContext(CarWashContext);
