# DOKUMEN SPESIFIKASI PERSYARATAN PRODUK (PRD)
## SISTEM MANAJEMEN CAR WASH TERINTEGRASI & LUXURY MEMBER PLATFORM

---

## 1. DOKUMEN INFORMASI & RINGKASAN EKSEKUTIF

| Parameter | Keterangan |
| :--- | :--- |
| **Nama Produk** | **AURA Auto Care & Luxury Car Wash System** |
| **Versi Dokumen** | v1.0.0 (Production Draft) |
| **Tanggal Terbit** | September 2026 |
| **Target Pasar** | Pemilik Kendaraan Segmen Menengah Ke Atas (Upper-Middle Class & Luxury Owners) |
| **Tech Stack** | React.js (Customer Web App & Marketplace), Vue.js (Internal Operational Portal & POS), REST API Backend, Laragon MySQL DB |
| **Tema Visual** | Charcoal Modern (`#121212` / `#1E1E1E`) & Accent Amber Yellow (`#FFC700` / `#F5A623`) - *Clean, Sleek & Premium Design* |

---

## 2. TUJUAN SISTEM & VISI PRODUK

### 2.1 Latar Belakang & Visi
Pasar pencucian dan perawatan mobil kelas premium membutuhkan efisiensi waktu, transparansi proses, serta kemudahan reservasi tanpa menghilangkan rasa eksklusivitas. Sistem ini dirancang untuk mengintegrasikan pengalaman digital pelanggan dengan operasional internal *car wash* secara *real-time*.

### 2.2 Target Audience (User Personas)
1. **Pelanggan Class-A/B+**: Menginginkan kepastian antrean tanpa harus menunggu lama, pembayaran *contactless*, dokumentasi transparan (sebelum & sesudah cuci), serta *loyalty points*.
2. **Welcomer (Front Officer)**: Membutuhkan sistem cepat untuk menyambut pelanggan, memverifikasi reservasi via QR Code, melakukan registrasi member kilat, dan mengarahkan ke bay pencucian.
3. **Kasir (Front Office Cashier)**: Membutuhkan POS fleksibel untuk pemrosesan pembayaran tunai/QRIS, serta *cross-selling* barang *autocare* atau *merchandise*.
4. **Staf Inventori**: Membutuhkan pemantauan stok bahan baku (shampoo, wax, microfiber) serta produk fisik secara *real-time* dengan pemotongan otomatis.
5. **Staf Keuangan**: Membutuhkan visualisasi arus kas harian/bulanan, breakdown tunai vs non-tunai, dan ekspor laporan instan.
6. **Owner (Pemilik Usaha)**: Membutuhkan dashboard eksekutif untuk memantau pendapatan multi-cabang, kinerja staf, profitabilitas, serta tren bisnis secara real-time dari mana saja.

---

## 3. ARSITEKTUR TEKNOLOGI & INFRASTRUKTUR

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +-----------------------------------+   +-------------------------------------+  |
|  |     Customer Portal & Marketplace |   |      Internal Operational Portal    |  |
|  |             (React.js)            |   |          (Vue.js 3 + Pinia)         |  |
|  |   - Online Reservation & Queue    |   |   - Welcomer Interface              |  |
|  |   - Loyalty Point & WA Ticket     |   |   - Cashier POS & Invoice           |  |
|  |   - Autocare Store Checkout       |   |   - Inventory & Stock Management    |  |
|  |   - Video Documentation Viewer    |   |   - Owner Executive Dashboard       |  |
|  +-----------------------------------+   +-------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                      REST APIs / WebSockets
                                           |
+------------------------------------------v----------------------------------------+
|                                  BACKEND SERVICES                                 |
|  - Auth & RBAC Service (JWT + Refresh Tokens)                                     |
|  - Booking & Queue Engine (Auto-Assign Bay & Slot Management)                     |
|  - POS & Billing Core (Integrated Payment Engine)                                 |
|  - Real-time Inventory Deductor & Notification Engine                             |
|  - WhatsApp Gateway Integrator (Fonnte / Wablas API)                              |
|  - Video Media Storage Handler (Local Storage / Cloud S3)                         |
+------------------------------------------+----------------------------------------+
                                           |
+------------------------------------------v----------------------------------------+
|                                  DATABASE LAYER                                   |
|                          Laragon MySQL Engine (Inno DB)                           |
+-----------------------------------------------------------------------------------+
```

---

## 4. SISTEM DESAIN & PANDUAN VISUAL (CHARCOAL & YELLOW CLEAN AESTHETICS)

Sistem wajib memberikan nuansa mewah, bersih, modern, dan presisi tinggi dengan standar *dark-mode luxury design*.

### 4.1 Color Palette Tokens
```css
:root {
  /* Surface Colors */
  --bg-primary: #121212;         /* Deep Charcoal base */
  --bg-secondary: #1E1E1E;       /* Card & Container Charcoal */
  --bg-tertiary: #2A2A2A;        /* Elevated Surface & Input Fill */
  --bg-glass: rgba(30, 30, 30, 0.75); /* Glassmorphism backdrop */
  
  /* Brand Accent Colors */
  --accent-yellow-primary: #FFC700;   /* Pure Luxury Yellow Accent */
  --accent-yellow-hover: #E6B200;     /* Darker Yellow for Hover */
  --accent-yellow-glow: rgba(255, 199, 0, 0.25); /* Glow shadow */
  
  /* Status Colors */
  --status-success: #10B981;     /* Emerald Green */
  --status-warning: #F59E0B;     /* Amber Orange */
  --status-danger: #EF4444;      /* Crimson Red */
  --status-info: #3B82F6;        /* Bright Blue */

  /* Neutral Text & Icons */
  --text-primary: #F3F4F6;       /* Pure Off-White */
  --text-secondary: #9CA3AF;     /* Soft Muted Gray */
  --text-dark: #121212;          /* Black text for Yellow Buttons */
  
  /* Border & Dividers */
  --border-subtle: #2D2D2D;
  --border-highlight: #444444;
  --border-yellow-glow: #FFC70040;
}
```

### 4.2 Prinsip UI/UX Clean Design
- **Typography**: Menggunakan font sans-serif modern bertipe *geometric/grotesk* (seperti *Inter*, *Outfit*, atau *Plus Jakarta Sans*).
- **Elevasi & Kedalaman**: Penggunaan subtle border `#2D2D2D`, *backdrop-blur* 12px, dan efek *gold glow hover* pada tombol aksi utama.
- **Micro-Interactions**: Transisi halus (200ms ease-in-out), animasi status antrean real-time, dan umpan balik visual instan.
- **Card Layout**: Tata letak grid clean tanpa elemen grafis yang mengganggu, mementingkan kemudahan membaca data statistik.

---

## 5. ROLES & HAK AKSES SISTEM (RBAC MATRIX)

Sistem mendukung 5 role pengguna utama dengan pembatasan hak akses yang ketat:

| Fitur / Modul | Pelanggan | Welcomer | Kasir | Staf Inventori | Owner / Admin Keuangan |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Registrasi & Login Akun** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Login Portal Internal** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Reservasi Online & Jadwal** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Input Walk-In Queue & Scan QR** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **POS & Kasir Transaksi On-Site** | ❌ | ✅ (Terbatas) | ✅ (Penuh) | ❌ | ❌ |
| **Upload Video Dokumentasi (Before/After)** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Beli Merchandise (Marketplace App)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Restock & Catat Inventori Operasional** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **POS Dashboard Kasir (Keuangan Harian)** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Dashboard Executive & Financial Owner** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 6. SPESIFIKASI FITUR TERPINCI DENGAN ACTIVITY WORKFLOW LOGIC

---

### 6.1 MODUL 1: AUTENTIKASI & MANAJEMEN AKUN / MEMBER

#### A. Deskripsi
Sistem pendaftaran dan identifikasi pengguna berbasis nomor WhatsApp & QR Code unik untuk member.

#### B. Persyaratan Fungsional
1. **Registrasi Pelanggan**:
   - Memasukkan Nama Lengkap, Nomor WhatsApp, Model Mobil, dan Nomor Plat Kendaraan.
   - Verifikasi berbasis OTP WhatsApp atau pendaftaran instan dari sisi Welcomer saat *walk-in*.
2. **Scan QR Member**:
   - Setiap member mendapatkan ID QR Code digital yang tersimpan di profil *web app*.
   - Welcomer dapat melakukan scan QR Code member untuk memuat data profil, potongan harga otomatis, serta riwayat pencucian secara instan.
3. **Sistem Poin & Tiering Reward**:
   - Setiap pencucian atau pembelian produk menambahkan akumulasi poin ke akun member.
   - Poin dapat ditukarkan dengan potongan harga, gratis *fast clean*, atau produk *autocare*.

---

### 6.2 MODUL 2: RESERVASI ONLINE PELANGGAN & INTEGRASI WHATSAPP

#### A. Flow Aktivitas Berdasarkan Diagram
1. Pelanggan membuka Halaman Reservasi dan memasukkan Nomor HP.
2. **Sistem Terintegrasi**: Memvalidasi status member. Jika belum terdaftar, sistem menampilkan form pendaftaran kilat.
3. Pelanggan memilih jenis layanan (*Fast Clean* atau *Premium Clean*), cabang, serta slot jadwal pencucian online.
4. Pelanggan melakukan pembayaran di muka via QRIS / E-Wallet.
5. **Sistem Terintegrasi**: Verifikasi pembayaran otomatis -> Catat pemasukan di sistem keuangan -> Terbitkan Nomor Antrean, QR Code Pemesanan, dan Struk Digital.
6. **WhatsApp Notification Service**: Mengirimkan konfirmasi otomatis berupa:
   - Nomor Antrean & Waktu Slot Reservasi.
   - Link QR Code Digital & Struk Bukti Bayar.
7. **Mekanisme Keterlambatan (Late Arrival Logic)**:
   - Jika pelanggan terlambat `> 5 menit` dari slot waktu dan belum melakukan Scan QR di lokasi, sistem secara otomatis mengalihkan slot antrean ke antrean berikutnya dan mengirim notifikasi WhatsApp untuk melakukan jadwal ulang (*reschedule*).

---

### 6.3 MODUL 3: WELCOMER POS & ON-SITE QUEUE MANAGEMENT

#### A. Deskripsi
Antarmuka khusus Welcomer di tablet/monitor sentuh pintu masuk lokasi car wash.

#### B. Flow Aktivitas Berdasarkan Diagram
1. **Penyambutan Walk-In**:
   - Welcomer menyambut pelanggan dan menanyakan status keanggotaan.
   - **Ada Member**: Scan QR / Input No HP -> Data member otomatis dimuat.
   - **Belum Member**: Input Data Member Baru (Nama, No. HP, Jenis Mobil, Plat Nomor) -> Simpan ke database.
2. **Pemilihan Layanan & Kasir Pintu Masuk**:
   - Welcomer memasukkan pilihan paket: **Fast Clean** (pencucian cepat di mana pelanggan tetap di dalam mobil) atau **Premium Clean** (pencucian detail, pelanggan menunggu di ruang tunggu).
   - Welcomer menawarkan produk *add-on* (Merchandise / Autocare).
   - Menghitung total biaya otomatis (termasuk potongan *discount member* jika ada).
3. **Pembayaran On-Site**:
   - **Cash**: Terima uang tunai -> Konfirmasi pembayaran di sistem.
   - **QRIS Dynamic**: Sistem menampilkan QRIS pada monitor sekunder welcomer -> Pelanggan melakukan scan -> Verifikasi otomatis sistem -> Terbitkan struk.
4. **Pengarahan Area (Bay Assignment)**:
   - Jika *Fast Clean*: Sistem mengarahkan kendaraan ke *Fast Clean Bay* (Pelanggan tetap di dalam mobil).
   - Jika *Premium Clean*: Sistem mengarahkan ke ruang tunggu VIP & kunci mobil diserahkan ke staf operasional.

---

### 6.4 MODUL 4: DOKUMENTASI VIDEO PREMIUM (BEFORE-AFTER UPLOAD)

#### A. Deskripsi Fitur
Sebagai nilai tambah untuk target pasar *upper-middle class*, layanan **Premium Clean** menyediakan dokumentasi transparansi kondisi kendaraan sebelum dan sesudah pengerjaan.

#### B. Spesifikasi Alur Kerja
1. Staf/Welcomer mengambil perekaman video pendek (kondisi bodi sebelum dicuci & sesudah pengerjaan *detailing*).
2. Melalui aplikasi Vue.js Welcomer/Operator, staf mengunggah file video dokumentasi ke sistem.
3. **Sistem Terintegrasi**: Menyimpan file video dan menyambungkannya dengan ID Transaksi Reservasi.
4. Notifikasi terisi otomatis di aplikasi pelanggan: *"Dokumentasi pengerjaan mobil Anda telah tersedia."* Pelanggan dapat memutar video langsung dari dashboard pelanggan React.js.

---

### 6.5 MODUL 5: MARKETPLACE MERCHANDISE & AUTO CARE PRODUCTS

#### A. Deskripsi Fitur
Modul toko digital di dalam aplikasi pelanggan React.js untuk membeli produk-produk *car care* premium (seperti microfiber premium, car wax, freshener, apparel merchandise).

#### B. Flow Aktivitas Berdasarkan Diagram
1. Pelanggan mengakses menu Marketplace di Aplikasi React.js.
2. Memilih produk, memasukkan ke keranjang, dan melakukan *checkout* / pembayaran digital.
3. **Sistem Terintegrasi**: Verifikasi pembayaran otomatis -> Memotong jumlah stok produk di inventori secara *real-time*.
4. **Staf Inventori**: Menerima notifikasi pesanan masuk -> Menyiapkan barang *merchandise/autocare* untuk diambil saat cuci mobil atau diserahkan oleh welcomer.

---

### 6.6 MODUL 6: DASHBOARD POS KASIR (FRONT OFFICE FINANCIAL POS)

#### A. Deskripsi
Dashboard khusus antarmuka operasional kasir (Vue.js) untuk pencatatan dan penerimaan transaksi fisik di lokasi.

#### B. Fitur Utama POS Kasir
1. **Penjualan Cepat (Quick Checkout)**: Pencatatan jasa cuci mobil + produk fisik (*add-on*).
2. **Multi-Metode Pembayaran**: Tunai, QRIS, Transfer Bank, Debit/Kredit Card.
3. **Pencetakan Struk (Receipt Printing)**: Integrasi dengan printer thermal Bluetooth/USB serta opsi Struk WhatsApp / Email.
4. **Rekap Shift Kasir (Close Out Shift)**: Perhitungan total kas tunai dalam laci (*cash drawer*) vs laporan penjualan sistem di akhir *shift*.

---

### 6.7 MODUL 7: DASHBOARD PEMANTAUAN & KEUANGAN OWNER (EXECUTIVE DASHBOARD)

#### A. Deskripsi
Dashboard tingkat tinggi berbasis Vue.js untuk Pemilik (*Owner*) dan Admin Keuangan guna memantau kesehatan bisnis dan analitik keuangan.

#### B. Fitur Utama Dashboard Owner
1. **Executive Financial Summary Card**:
   - Total Gross Revenue (Pemasukan Kotor).
   - Net Profit & Breakdown Biaya Operasional.
   - Perbandingan Pendapatan Cash vs Non-Cash (QRIS/E-Wallet/Bank).
   - Total Kendaraan Dicuci (Fast Clean vs Premium Clean).
2. **Filter Rentang Waktu Dinamis**:
   - Filter Harian, Mingguan, Bulanan, Tahunan, atau Custom Date Range.
3. **Multi-Cabang & Keseluruhan (Branch Selector)**:
   - Opsi memantau performa per cabang (*branch performance*) atau rekap gabungan (*consolidated report*).
4. **Visualisasi Grafik Analitik**:
   - Grafik garis tren pemasukan harian/bulanan.
   - Grafik lingkaran (*donut chart*) perbandingan metode pembayaran.
   - Grafik batang layanan paling diminati & produk merchandise terlaris.
5. **Modul Ekspor Laporan Keuangan**:
   - Opsi ekspor data transaksi dan rekapitulasi keuangan ke dalam format **CSV** dan **Excel (.xlsx)**.

---

### 6.8 MODUL 8: MANAJEMEN INVENTORI & OTOMATISASI STOK

#### A. Deskripsi
Modul pemantauan dan pengelolaan stok bahan baku operasional serta produk fisik komersial.

#### B. Fitur Utama Inventori
1. **Kategori Barang**:
   - **Bahan Operasional**: Sabun Shampoo Mobil, Wax Coating, Tire Polish, Microfiber Towels (diukur dalam Liter / Pcs).
   - **Produk Retail (Marketplace/POS)**: Autocare Kits, Air Freshener, Merchandise Apparel.
2. **Real-time Automatic Stock Deduction**:
   - Setiap transaksi cuci mobil otomatis mengurangi estimasi pemakaian bahan operasional (misal: 1 Fast Clean = 100ml Shampoo).
   - Setiap penjualan produk retail di POS/Marketplace langsung memotong jumlah stok fisik.
3. **Restock & Stok Masuk (Purchase & Inbound)**:
   - Form pencatatan barang masuk oleh Staf Inventori untuk memperbarui jumlah stok secara *real-time*.
4. **Log Stok Keluar & Alert Minimum Stock**:
   - Laporan rekap stok keluar berdasarkan rentang waktu.
   - Notifikasi otomatis ketika stok bahan baku mendekati batas minimum (*low stock warning*).

---

## 7. STRUKTUR DATABASE MYSQL (LARAGON DB SCHEMA)

Berikut adalah perancangan tabel-tabel utama pada database MySQL:

### 7.1 Tabel `users`
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) NULL,
    password VARCHAR(255) NULL,
    role ENUM('pelanggan', 'welcomer', 'kasir', 'inventori', 'finance', 'owner') DEFAULT 'pelanggan',
    loyalty_points INT DEFAULT 0,
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 7.2 Tabel `vehicles`
```sql
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plate_number VARCHAR(15) UNIQUE NOT NULL,
    brand_model VARCHAR(100) NOT NULL, -- ex: "BMW X5", "Porsche Macan"
    vehicle_size ENUM('small', 'medium', 'large', 'luxury') DEFAULT 'medium',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 7.3 Tabel `services`
```sql
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- "Fast Clean", "Premium Clean & Detailing"
    service_type ENUM('fast_clean', 'premium_clean') NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    estimated_duration_minutes INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 7.4 Tabel `reservations`
```sql
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(30) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    service_id INT NOT NULL,
    branch_id INT NOT NULL DEFAULT 1,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    queue_number INT NOT NULL,
    status ENUM('pending_payment', 'confirmed', 'checked_in', 'in_progress', 'completed', 'rescheduled', 'cancelled') DEFAULT 'pending_payment',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    qr_code_url VARCHAR(255),
    video_before_url VARCHAR(255) NULL,
    video_after_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);
```

### 7.5 Tabel `products` (Inventori & Merchandise)
```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('operasional', 'autocare', 'merchandise') NOT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    stock_qty INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 5,
    unit VARCHAR(20) NOT NULL DEFAULT 'pcs', -- 'pcs', 'liter', 'botol'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.6 Tabel `transactions` (Keuangan POS)
```sql
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    reservation_id INT NULL,
    user_id INT NULL,
    cashier_id INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    final_amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash', 'qris', 'e_wallet', 'bank_transfer', 'credit_card') NOT NULL,
    payment_status ENUM('pending', 'success', 'failed') DEFAULT 'success',
    branch_id INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);
```

### 7.7 Tabel `transaction_details`
```sql
CREATE TABLE transaction_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    item_type ENUM('service', 'product') NOT NULL,
    item_id INT NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);
```

### 7.8 Tabel `inventory_logs`
```sql
CREATE TABLE inventory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type ENUM('inbound', 'outbound', 'adjustment') NOT NULL,
    qty INT NOT NULL,
    notes TEXT,
    staff_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (staff_id) REFERENCES users(id)
);
```

---

## 8. SPESIFIKASI ANTARMUKA KUNCI (UI/UX LAYOUT SPECS)

### 8.1 Layout 1: Customer Portal (React.js)
- **Tema Color**: Dark Charcoal Background (`#121212`), Card Gray (`#1E1E1E`), Vivid Amber Accent (`#FFC700`).
- **Header**: Logo Brand AURA Auto Care, Status Poin Loyalty, Quick Navigation (Reservasi, Status Antrean, Marketplace, Profil).
- **Hero Section**: Slot Booking Cepat dengan tanggal & waktu dinamis.
- **Kartu Antrean Aktif**: Widget real-time menampilkan posisi antrean pelanggan saat ini + QR Code Akses Pintu Masuk.
- **Pemain Dokumentasi Video**: Modal khusus video player modern untuk memutar rekaman *before-after* cuci mobil.

### 8.2 Layout 2: Welcomer Touchscreen POS (Vue.js)
- **Grid Layout Large Buttons**: Tombol-tombol besar untuk pengoperasian cepat di tablet/layar sentuh.
- **Fast Action Bar**: "Scan QR Member", "Input Walk-In Baru", "Fast Clean", "Premium Clean".
- **Dynamic QRIS Modal**: Pop-up monitor sekunder yang menghadap ke pelanggan untuk pembayaran cepat QRIS.

### 8.3 Layout 3: Owner Financial & Executive Dashboard (Vue.js)
- **Top Metrics Ribbon**: 4 Card Utama (Total Income Hari Ini, Transaksi Cash vs Non-Cash, Total Kendaraan, Alert Stok Kritis).
- **Main Analytics Chart Area**: Chart Interaktif (ApexCharts / Chart.js) dengan tab switcher (Daily Revenue, Monthly Growth, Service Breakdown).
- **Data Table Transaksi & Export Toolbar**: Filter rentang tanggal, search box, dropdown cabang, dan tombol cetak/ekspor CSV & Excel berwarna kuning emas.

---

## 9. PERSYARATAN NON-FUNGSIONAL (NON-FUNCTIONAL REQUIREMENTS)

1. **Performa & Responsivitas**:
   - Waktu muat halaman (*Page Load Time*) < 1.5 detik.
   - Respon API (*Backend Latency*) < 200ms untuk transaksi POS.
2. **Keamanan Data**:
   - Autentikasi JWT (JSON Web Token) dengan skema *access token* dan *refresh token*.
   - Hash kata sandi menggunakan algoritma **Bcrypt**.
   - Enkripsi tautan QR Code agar tidak mudah dipalsukan.
3. **Ketersediaan Real-Time**:
   - Integrasi WebSockets / Socket.io untuk pembaruan nomor antrean di layar publik dan pengisian posisi stok secara otomatis tanpa *refresh* halaman.
4. **Pengalaman Pengguna (UX Target)**:
   - Alur *walk-in* welcomer dari awal sapa hingga mencetak struk/QR harus dapat diselesaikan dalam waktu kurang dari 45 detik.

---

## 10. ROADMAP PENGEMBANGAN & TAHAPAN PELAKSANAAN

```
+-----------------------------------------------------------------------------------+
| TAHAP 1: PERSATUAN DATABASE & CORE API (Minggu 1-2)                               |
| - Setup DB Laragon MySQL & Migrasi Schema                                         |
| - Implementasi Backend Authentication REST API & Midtrans QRIS/WA Gateway API     |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
| TAHAP 2: FRONTEND OPERASIONAL INTERNAL VUE.JS (Minggu 3-4)                        |
| - Modul Welcomer Touchscreen & Walk-in Queue System                               |
| - Modul POS Kasir & Integrasi Printer Thermal                                     |
| - Modul Upload Video Dokumentasi Before-After                                     |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
| TAHAP 3: FRONTEND PELANGGAN REACT.JS (Minggu 5-6)                                 |
| - Modul Reservasi Online, Slotting & Ticket QR Code                               |
| - Modul Marketplace Merchandise & Auto Care                                       |
| - Modul Viewer Video Dokumentasi & Loyalty Points                                 |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
| TAHAP 4: DASHBOARD OWNER & INVENTORI VUE.JS (Minggu 7)                            |
| - Modul Real-Time Inventory & Automatic Deduction                                 |
| - Modul Executive Dashboard Financial Analytics & Export CSV/Excel               |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
| TAHAP 5: VERIFIKASI, UJI COBA & DEPLOYMENT (Minggu 8)                             |
| - Integration Testing, Stress Test POS, & Final Launch                            |
+-----------------------------------------------------------------------------------+
```

---

*Dokumentasi PRD ini dibuat berdasarkan spesifikasi diagram Activity & Use Case Sistem Car Wash Terintegrasi.*
