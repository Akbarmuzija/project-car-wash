# Desain UI/UX Sistem Car Wash Terintegrasi

## 1. Tujuan Dokumen

Dokumen ini dibuat sebagai panduan pengembangan visual yang sangat detail untuk sistem car wash premium. Tujuannya agar desainer, developer, maupun AI prompt generator dapat membuat antarmuka yang konsisten, cepat dipahami, dan sesuai dengan karakter brand premium modern.

Dokumen ini bukan sekadar ringkasan umum. Ini adalah spesifikasi visual yang siap dijadikan acuan untuk:
- desain halaman web
- desain dashboard internal
- prototype UI/UX
- prompt generasi desain dari AI
- slicing interface ke React/Vite
- konsistensi antar modul: pelanggan, welcomer, kasir, inventory, owner

---

## 2. Prinsip Utama Desain

### 2.1 Karakter visual utama
- Premium
- Modern
- Dark luxury
- Efisien untuk operasi cepat
- Terlihat profesional untuk segmen upper-middle class dan premium

### 2.2 Arah estetika
- Background utama berwarna charcoal gelap
- Aksen utama berwarna emas premium
- Teks bersih, tinggi kontras, mudah dibaca
- Tidak menggunakan banyak dekorasi visual berlebihan
- Fokus utama pada data, status, transaksi, dan keputusan cepat

### 2.3 Prinsip UX operasional
- User harus melihat tombol utama dalam hitungan detik
- Status operasional tidak boleh ambigu
- Semua form harus ringkas, tidak memakan ruang berlebih
- Proses booking, pembayaran, scan, dan bay assignment harus terasa cepat
- Semua modul harus mengikuti pola visual yang sama agar sistem terasa satu ekosistem

---

## 3. Design System Lengkap

### 3.1 Skala warna

```css
:root {
  --bg-main: #0D0D0F;
  --bg-card: #141417;
  --bg-surface: #1A1A1F;
  --bg-input: #202026;
  --bg-hover: #242429;

  --gold: #F2A900;
  --gold-dim: #C98B00;
  --gold-soft: rgba(242,169,0,0.18);
  --gold-border: rgba(242,169,0,0.28);

  --emerald: #0EC278;
  --emerald-soft: rgba(14,194,120,0.12);

  --crimson: #F04F4F;
  --crimson-soft: rgba(240,79,79,0.12);

  --cyan: #38BDF8;
  --cyan-soft: rgba(56,189,248,0.12);

  --text-primary: #FFFFFF;
  --text-secondary: #A0A0B0;
  --text-muted: #5C5C70;

  --border-1: #28282F;
  --border-2: #38383F;
}
```

### 3.2 Fungsi warna yang detail

| Warna | Bentuk penggunaan | Arti visual |
| --- | --- | --- |
| Gold/Amber | Tombol utama, header highlight, status aktif, badge premium | Premium, penting, prioritas tinggi |
| Charcoal hitam | Latar utama, panel, dashboard, card | Solid, tajam, profesional |
| Abu-abu gelap | Form field, panel sekunder | Netral, tidak mengganggu fokus |
| Emas gelap | Hover state, shadow highlight | Kedalaman premium dan interaksi |
| Hijau | Ready, success, paid, available | Konfirmasi positif |
| Merah | Error, critical, low stock, failed | Peringatan dan fokus perhatian |
| Biru | Informasi, scan, system status, proses | Hanif / netral teknis |

### 3.3 Tipografi
- Font utama: Inter, Segoe UI, Roboto, atau sans-serif modern
- Heading: tebal, clean, presisi
- Ukuran teks utama: 12–14px untuk body panel
- Ukuran heading: 18–32px tergantung level
- Label: uppercase kecil dengan tracking 0.06em
- Gaya heading: lebih padat, lebih sedikit spasi antar huruf agar terlihat modern

### 3.4 Ukuran font yang disarankan
- H1: 28–32px, bold
- H2: 22–26px, bold
- H3: 18–20px, semi-bold
- H4: 14–16px, bold
- Body: 12–14px
- Caption/label: 10–11px

---

## 4. Sistem Bentuk dan Frame

### 4.1 Radius
- Card panel utama: 12–16px
- Form input: 9px
- Button: 9–12px
- Badge/pill: 999px
- Modal: 16–20px

### 4.2 Border
- Border panel utama: 1px, warna abu gelap
- Border active: 1px warna emas atau hijau tergantung status
- Border hover: lebih jelas, lebih terang dari default
- Modal overlay: background hitam semi-transparan dengan blur lembut

### 4.3 Shadow
- Shadow umum: ringan, sangat halus, tidak terlalu mencolok
- Shadow gold: 0 0 16px rgba(242,169,0,0.18)
- Hover state: naik sedikit 1–2px dan border lebih terang

### 4.4 Spacing system
- Gap antar section: 16–24px
- Padding card: 16–20px
- Padding panel besar: 20–28px
- Spacing antar item dalam list: 10–14px
- Space di antara form field: 10–12px

### 4.5 Struktur frame yang umum
Semua tampilan utama mengikuti pola berikut:

```text
[Header / Topbar]
  - Brand & role
  - Quick actions
  - Status / tanggal

[Section Row]
  - KPI cards 4 kolom

[Main Grid]
  - big analytics area
  - secondary summary panel

[Detail Panel]
  - table / list / queue / transactions
```

Ini pola yang harus dipertahankan di semua dashboard.

---

## 5. Sistem Tombol yang Detail

### 5.1 Tombol utama atau primary
Bentuk tombol:
- background: gold gradient
- text: hitam pekat
- radius: 9px
- berat font: 600–700
- padding: 10–14px
- tinggi minimum: 38–44px agar nyaman saat sentuh

Struktur visual:
- warna paling menonjol di layar
- selalu berada di posisi yang paling mudah dilihat
- jarak antar tombol besar dan jelas
- hover state: lebih terang, bayangan lebih besar, sedikit naik

Contoh fungsi tombol utama:
- Simpan
- Lanjutkan
- Scan QR
- Konfirmasi Bayar
- Bayar Sekarang
- Print Struk
- Ekspor Laporan

### 5.2 Tombol sekunder atau ghost
- background: panel gelap
- border: 1px abu gelap
- text: putih atau abu muda
- cocok untuk aksi seperti batal, lihat detail, tutup, refresh

### 5.3 Tombol danger
- background: merah gelap dengan opacity tertentu
- text merah terang
- digunakan untuk aksi kritis seperti hapus, reset, batal order, low stock warning

### 5.4 Button group
- Untuk pilihan metode pembayaran atau kategori status, gunakan group tombol horizontal atau vertical
- 1 tombol aktif dengan highlight gold
- tombol tidak aktif berwarna panel gelap
- tombol aktif harus terlihat jelas dan lebih tebal secara layout

### 5.5 Prinsip interaksi tombol
- hover: background lebih terang, shadow lebih jelas, elevasi naik
- active: sedikit menekan ke bawah
- transisi: 180ms ease
- jangan terlalu banyak tombol yang sama ukuran berjejer di satu card

---

## 6. Sistem Status, Badge, dan Label

### 6.1 Badge utama
Badge harus berbentuk pill dan memiliki background soft sesuai status.

| Status | Bentuk | Warna | Kegunaan |
| --- | --- | --- | --- |
| Active / Premium / Waiting | Pill | Gold | Menunggu, aktif, premium, in progress |
| Available / Ready / Success | Pill | Hijau | Tersedia, sukses, selesai, dibayar |
| Error / Warning / Low stock | Pill | Merah | Peringatan, stok habis, gagal |
| Informational / Scan / New | Pill | Biru | Scan QR, info, data baru |

### 6.2 Status indicator real-time
- Gunakan titik kecil berwarna hijau dengan animasi pulse kecil
- Dipasang di sisi label seperti Live, Active, Running, Ready
- Tidak perlu terlalu besar, cukup 6–8px diameter

### 6.3 Label form
- Label harus kecil, uppercase, tracking medium
- Warna abu muda agar tidak dominan namun tetap jelas
- Margin bawah label sekitar 6px

### 6.4 Kesalahan dan warning
- teks alert harus menggunakan merah lembut, tidak terlalu mencolok sampai mengganggu
- cukup dengan ikon kecil + teks singkat

---

## 7. Sistem Form dan Input

### 7.1 Arsitektur input
- background: charcoal gelap
- border: 1px solid abu gelap
- font color: putih
- placeholder: abu muda
- focus state: border gold dengan glow kecil

### 7.2 Bentuk field
- tinggi field: 42–46px
- radius: 9px
- padding kiri & kanan: 12–14px
- error field: border merah, background merah sangat gelap

### 7.3 Layout form
- di desktop: maksimal 2 kolom untuk field yang berhubungan
- di tablet: 1 kolom atau 2 kolom terbatas
- urutan form yang disarankan:
  1. identitas customer
  2. jenis layanan
  3. metode pembayaran
  4. konfirmasi

### 7.4 Form modal
- modal harus berada di tengah layar
- dimensi lebar modal: 420–560px untuk form normal
- modal besar: 720–960px untuk dashboard detail atau print preview
- background modal: panel dark charcoal
- tombol action ada di bawah form atau di sisi kanan form
- close button berada di kanan atas dengan bentuk lingkaran kecil

---

## 8. Grid Layout yang Disarankan

### 8.1 Desktop umum
Gunakan sistem grid 12 kolom.

Contoh:
- 4 kolom KPI di baris atas
- 8 kolom panel besar + 4 kolom side panel
- 12 kolom untuk tabel line lengkap

### 8.2 Tablet
- Gunakan 2 kolom untuk card utama
- Stack section dengan jarak lebih lebar
- Tombol tetap besar dan mudah disentuh

### 8.3 Layar operasional welcomer
- Fokus pada satu layar kerja yang singkat
- 4 action card besar dalam grid 2x2
- panel bay list berada di bawahnya
- form modal hanya muncul saat dibutuhkan

### 8.4 Layar kasir
- kiri: daftar item / transaksi
- kanan: ringkasan pembayaran & total akhir
- total pembayaran selalu di posisi paling dominan

### 8.5 Layar owner/dashboard eksekutif
- bagian atas: summary metric 4 kartu
- tengah: chart besar
- kanan atau bawah: breakdown metode pembayaran
- bawah: table log transaksi

---

## 9. Tata Letak Per Modul

## 9.1 Landing Page / Customer Front
Tujuan: menampilkan brand premium dan mempersingkat keputusan pelanggan.

Bentuk layout:
- Header atas dengan logo brand, tombol login, dan tombol reserve
- Hero section dengan judul besar, subjudul singkat, CTA utama gold
- Card layanan 3 kolom di bawah hero
- Bagian benefit dengan 3–4 highlight box
- Section testimoni dan lokasi
- Footer dengan jam operasional, kontak, WhatsApp, dan alamat

Visual detail:
- hero area minimal tapi cukup besar
- tombol utama besar berwarna gold
- card layanan memiliki hover border emas
- gunakan spacing besar agar terasa premium dan bukan padat

## 9.2 Customer Portal
Tujuan: pelanggan melihat riwayat, reward, reservasi, dan layanan.

Struktur layout:
- top bar dengan nama pelanggan dan status member
- 3–4 kartu ringkasan di atas
- area utama terdiri dari daftar booking dan ringkasan akun
- section tambahan: dokumentasi before-after, reward points, marketplace

Bentuk detail:
- card ringkasan dapat dibuat 4 kolom kecil
- setiap booking item terdiri dari ikon status, nama jasa, tanggal, dan tombol lihat detail
- status menggunakan badge warna yang jelas
- area reward dibuat sedikit lebih menonjol dengan gold background atau side border gold

## 9.3 Welcomer Console
Tujuan: operasional cepat dan sentuhan layar yang mudah.

Struktur layout:
- header ribbon dengan label Welcomer Console
- 4 action cards besar dalam grid 2x2
- setelah itu panel bay monitoring dua sisi: fast clean dan premium detailing
- form modal untuk member baru atau scan QR

Bentuk detail:
- every action card harus terlihat seperti tombol besar dengan ikon, judul, dan subjudul singkat
- bay panel berupa list item dengan nama bay, status, dan kendaraan
- bay status ada 3 kategori: tersedia, terisi, in progress
- formulir modal tidak boleh terlalu panjang, maksimal 2–3 kelompok field

## 9.4 Kasir POS
Tujuan: menghitung total, menerima pembayaran, dan mengakhiri transaksi dengan cepat.

Struktur layout:
- area kiri: list item transaksi
- area kanan: ringkasan payment
- tombol metode pembayaran 4 opsi
- panel total bayar sangat dominan di bagian atas kanan
- area bawah: tombol simpan, print, batal

Bentuk detail:
- total bayar lebih besar dari item lain, dibuat paling menonjol
- metode pembayaran dibangun sebagai group button dengan label singkat
- item transaksi ditampilkan seperti row tabel dengan nama item, qty, harga
- panel receipt preview bisa muncul modal atau panel kecil di samping

## 9.5 Inventory Dashboard
Tujuan: menjaga stok operasional dan barang marketplace tetap aman.

Struktur layout:
- atas: metric inventory
- tengah: data table produk
- sisi kanan: restock panel, alert low stock, order masuk
- bawah: daftar order marketplace siap pickup

Bentuk detail:
- item produk menggunakan row list dengan nama, kategori, stok, status
- stok yang low stock diberi badge merah dan highlight area
- tombol restock selalu dekat item yang membutuhkan perhatian

## 9.6 Owner Dashboard
Tujuan: monitoring kesehatan bisnis dan analitik keuangan.

Struktur layout:
- header dengan filter tanggal dan tombol ekspor
- 4 top metric cards
- chart area besar di tengah
- sisi kanan atau bawah: payment composition dan top service
- bagian bawah: transaction log

Bentuk detail:
- metric cards menggunakan ukuran lebih besar dari panel biasa
- chart menggunakan gold untuk bar paling aktif
- progress bar dan donut chart harus sangat jelas dan tidak terlalu ramai
- table log transaksi dengan kolom: invoice, waktu, pelanggan, metode bayar, total, status

---

## 10. Detail Komponen Visual yang Harus Konsisten

### 10.1 Card
- background: richly dark
- rincian: border tipis, radius 12–16px, padding 16–20px
- manfaat: membagi area panel jelas tanpa terlihat berantakan

### 10.2 Header panel
- gunakan border bawah tipis atau border accent gold di kiri
- bagian header biasanya berisi tag kriteria dan tombol quick action

### 10.3 Table list
- baris yang berisi data harus memiliki padding yang konsisten
- hover row berwarna slightly lighter
- header table lebih gelap dan teks lebih selaras

### 10.4 Modal
- overlay hitam semi transparan
- modal dengan background dark
- tombol utama diletakkan bawah atau samping kanan
- body modal dibuat ringkas agar fokus pada satu tindakan

### 10.5 Quick action tile
- ukuran besar, ikon di atas, judul di bawah, subtitle kecil
- cocok untuk touchscreen welcomer
- hover state border gold, background sedikit lebih terang

---

## 11. Panduan Spacing & Proporsi

### 11.1 Rasio visual yang disarankan
- Panel besar: 70–85% lebar layar untuk content utama
- Sisi kanan summary: 25–30% untuk detail pendukung
- Jarak antar card: 16px minimum
- Jarak antar section: 24px
- Margin halaman kiri-kanan: 20–32px

### 11.2 Panjang garis teks
- hindari blok teks yang terlalu panjang dalam satu panel
- maksimal 2–3 baris untuk deskripsi kecil
- lebih baik menggunakan label dan angka daripada deskripsi panjang

### 11.3 Ukuran ikon
- ikon utama: 18–24px
- ikon kecil untuk badge atau status: 12–14px
- ikon dalam tombol: 14–18px dengan jarak 6–8px

---

## 12. Prinsip Make It Prompt-Ready

Untuk keperluan prompt AI atau desain, gunakan prinsip berikut:

### 12.1 Format prompt yang ideal
"Buat antarmuka dashboard car wash premium berwarna dark luxury. Latar utama charcoal hitam, aksen emas premium, tombol utama gold gradient, layout grid modern, panel card gelap dengan border tipis. Desain harus terlihat profesional, cepat dipakai, mudah dioperasikan, dan sesuai untuk aplikasi layanan cuci mobil premium. Tampilkan metric cards, table transaksi, action panel, dan status bay. Gunakan spacing yang rapi, tombol yang besar, border tipis, teks white/gray, status green yellow red blue, dan visual yang tidak terlalu ramai."

### 12.2 Instruksi yang harus selalu ada
- dark luxury aesthetic
- gold accent primary button
- charcoal background
- clean visual hierarchy
- fast operational UX
- premium brand feel
- no clutter
- strong contrast
- mobile/tablet friendly
- crisp forms and card layouts

### 12.3 Instruksi yang harus dihindari
- desain terlalu terang
- terlalu banyak warna
- terlalu banyak dekorasi gambar
- terlalu banyak efek glassmorphism yang berlebihan
- button terlalu kecil
- tabel yang terlalu padat dan susah dibaca
- terlalu banyak shadow dan glow

---

## 13. Deskripsi Visual Lengkap untuk Prompt

Berikut versi deskripsi paling detail yang bisa langsung dipakai:

"Buat desain UI/UX aplikasi car wash premium dengan tema dark luxury. Latar belakang utama berwarna charcoal hitam pekat (#0D0D0F), panel card berwarna charcoal medium (#141417), border tipis abu gelap (#28282F), dan accent utama gold premium (#F2A900). Gunakan tombol utama berbentuk rounded 9px dengan gradient emas ke amber, teks hitam gelap, shadow ringan gold, dan hover state lebih terang serta naik sedikit. Semua dashboard memakai layout grid modern yang rapi, card dengan padding 16–20px, border tipis, radius 12–16px, serta spacing yang jelas antar section. Teks utama berwarna putih, teks sekunder abu muda, judul bold, label kecil uppercase. Status ditandai dengan badge pill: gold untuk active/waiting, hijau untuk success/ready, merah untuk warning/error, biru untuk informasi/scan. Form input berwarna gelap dengan border abu dan focus state border emas serta glow kecil. Aplikasi harus terlihat premium, efisien, dan sangat cepat digunakan untuk operasi car wash: welcomer, kasir, inventory, dan owner. Gunakan tombol besar untuk layar sentuh, action card besar untuk proses cepat, panel bay monitoring dengan status jelas, dan table transaksi dengan row yang rapi. Hindari desain berantakan, terlalu ramai, atau terlalu banyak warna. Fokus pada keterbacaan, kontras, keputusan cepat, dan kesan premium yang modern."

---

## 14. Kesimpulan

Sistem car wash ini harus memiliki karakter premium, operasional, dan konsisten. Desain terbaik untuk aplikasi ini adalah kombinasi antara dark luxury, gold accent, spasi yang rapi, form sederhana, button besar, dan layout dashboard yang cepat dibaca. Semuanya harus terfokus pada satu tujuan utama: proses car wash yang cepat, bersih, mewah, dan efisien.

Jika digunakan sebagai prompt desain atau referensi UI, struktur ini sudah cukup lengkap untuk menghasilkan tampilan yang sesuai dengan kebutuhan sistem yang sudah dibuat.


## 8.3 Welcomer Portal
Tujuan: touchscreen cepat untuk check-in pelanggan dan pendaftaran walk-in.

Layout yang disarankan:
- Header panel: Welcome Console + aksi cepat
- 4 action cards besar:
  1. Regist Walk-In
  2. Scan QR / Member
  3. Bay Fast Clean
  4. Bay Premium Detailing
- Di bawahnya: monitoring bay real-time
- Panel form modal dengan input data member

Struktur visual:
- Aksi utama angka besar, ringkas, mudah disentuh
- Bay panel menggunakan layout list dengan status colored badge
- System harus memudahkan welcomer dalam 30–60 detik per pelanggan

---

## 8.4 Kasir POS
Tujuan: transaksi yang cepat, akurat, dan jelas.

Layout yang direkomendasikan:
- Kiri: daftar transaksi / order item
- Kanan: ringkasan pembayaran dan metode pembayaran
- Tombol metode pembayaran: Tunai, QRIS, Transfer, Kartu
- Daftar item dengan subtotal dan total akhir
- Receipt preview dalam panel

UX rules:
- Total pembayaran harus terlihat dominan di bagian atas kanan
- Metode pembayaran jelas dipisah dalam group button
- After payment, tampilkan notifikasi konfirmasi dan receipt

---

## 8.5 Inventori Dashboard
Tujuan: pantau stok, restock, dan pesanan marketplace.

Layout yang disarankan:
- KPI: stok total, low stock, order masuk, nilai stok
- Data table produk dengan status stock
- Panel restock cepat di sisi kanan
- Section marketplace order siap pickup

Visual rules:
- Stok rendah memakai warna merah/amber tersendiri
- Product cards harus mudah di-scan
- Tombol restock visible di dekat item yang low stock

---

## 8.6 Owner Dashboard
Tujuan: monitoring bisnis dan keuangan secara strategis.

Layout yang disarankan:
- Header dengan filter date range dan tombol export
- 4 metric cards besar
- Chart area besar untuk tren pendapatan
- Panel payment composition
- Table log transaksi real-time

Visual rules:
- Metric card paling penting berada paling atas
- Chart menggunakan warna gold gradient untuk highlight
- Payment breakdown dibuat dalam bar progress yang mudah dibaca
- Export actions harus selalu terlihat di header

---

## 9. Tata Letak Khusus untuk UI “Cepat”

Untuk sistem seperti ini, design harus dibuat agar operasional lebih cepat. Rekomendasi:

### 9.1 Prinsip workflow cepat
- Aksi inti selalu berada di bagian paling atas atau paling kiri panel
- Form dibuat ringkas tanpa banyak field yang tidak perlu
- Status langsung terlihat tanpa perlu scroll panjang
- Komponen penting seperti bay status, scan, payment, receipt, harus bentuknya konsisten

### 9.2 Pola layout yang efektif
- Header row → KPI row → main content grid → bottom detail table
- Panel utama dibuat 2 kolom saat desktop
- Panel yang lebih kecil seperti side summary diletakkan di sisi kanan

---

## 10. Rekomendasi Komponen UI yang Sudah Cocok dengan Sistem

Komponen berikut sangat sesuai dengan sistem yang sekarang dibuat:

- `card-executive` untuk panel utama dashboard
- `card-gold-glow` untuk summary premium
- `btn-gold` untuk action utama
- `btn-ghost` untuk button sekunder
- `badge-pill` untuk status
- `modal-overlay` untuk form dan konfirmasi transaksi
- `input-executive` untuk form terstruktur

Semua ini sudah cocok dengan tema sistem dan bisa dipertahankan agar konsisten.

---

## 11. Rekomendasi Final UI Direction

### 11.1 Tone visual
- Premium, cepat, modern, dan tegas
- Tidak terlalu ramai secara grafis
- Fokus pada pusat aktivitas: transaksi, bay, status, dan analitik

### 11.2 Keunggulan desain ini
- Cocok untuk user internal maupun pelanggan
- Mudah dikembangkan untuk fitur berikutnya
- Memiliki karakter premium yang sesuai target market
- Konsisten dengan sistem yang sudah dibangun oleh aplikasi ini

---

## 12. Panduan Implementasi Singkat

Gunakan pendekatan ini untuk seluruh module:

1. Gunakan warna latar charcoal untuk seluruh aplikasi.
2. Gunakan gold untuk aksi utama dan highlight premium.
3. Batasi elemen dekorasi agar tidak mengganggu fokus operasional.
4. Buat status dengan warna dan icon jelas.
5. Pastikan tombol utama selalu lebih besar dan lebih mencolok dari tombol sekunder.
6. Gunakan card dengan border tipis, padding cukup, dan shadow ringan agar terlihat premium namun tidak terlalu ramai.
7. Untuk layar monitor atau tablet, pastikan ukuran tombol minimal nyaman di sentuhan.

---

## 13. Kesimpulan

Design UI/UX yang paling pas untuk sistem car wash ini adalah kombinasi antara dark luxury aesthetic, operational clarity, dan fast action workflow. Warna utama charcoal + gold menciptakan kesan premium dan profesional, sementara struktur layout yang jelas memudahkan operasional untuk welcomer, kasir, inventori, dan owner.

Dengan pendekatan ini, sistem akan terasa modern, cepat dipakai, dan cocok untuk bisnis car wash kelas premium atau upper-middle class.
