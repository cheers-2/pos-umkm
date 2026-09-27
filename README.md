# POS UMKM - Aplikasi Kasir untuk UMKM Indonesia

Aplikasi Point of Sale (POS) / kasir web modern, offline-first, khusus untuk warung, kafe, toko retail, dan UMKM di Indonesia.

## Fitur MVP yang Sudah Ada

### 1. Kasir & Transaksi
- Interface kasir cepat & responsif (HP / tablet / desktop)
- Cari produk + scan barcode (ketik barcode di kolom pencarian)
- Keranjang belanja dengan ubah qty
- Diskon per transaksi (% atau nominal)
- PPN otomatis (bisa diaktifkan di pengaturan)
- Multi metode pembayaran: Tunai, QRIS, E-Wallet, Debit, Kredit
- Cetak struk PDF + share ke WhatsApp
- Offline mode (data tersimpan di IndexedDB browser)

### 2. Manajemen Produk & Stok
- CRUD produk (nama, SKU, barcode, kategori, harga jual/modal, stok, satuan)
- Import massal via Excel/CSV
- Export produk ke Excel
- Update stok otomatis setiap transaksi
- Notifikasi stok menipis
- Fitur stok opname

### 3. Role-Based Access
- **Owner**: akses penuh (produk, laporan, pengaturan, hapus data)
- **Kasir**: hanya transaksi kasir + lihat produk
- Login sederhana (demo: owner/123456 dan kasir/123456)

### 4. Laporan & Dashboard
- Ringkasan penjualan (total, jumlah transaksi, rata-rata, estimasi laba)
- Produk terlaris
- Breakdown metode pembayaran
- Filter tanggal
- Export laporan ke Excel

### 5. Pengaturan Toko
- Nama, alamat, telepon, footer struk
- Aktifkan/nonaktifkan PPN + tarif

## Cara Menjalankan

### Opsi 1: Langsung buka (paling mudah)
1. Buka folder `pos-umkm-app`
2. Double-click `index.html` atau buka via browser
3. Untuk fitur PWA & offline penuh, lebih baik serve via local server:

```bash
# Python
python -m http.server 8080

# atau Node
npx serve .
```

Lalu buka http://localhost:8080

### Opsi 2: Install sebagai aplikasi (mirip APK)
1. Buka di Chrome / Edge di Android atau desktop
2. Menu → "Install app" / "Add to Home Screen"
3. Aplikasi akan muncul seperti app native

## Akun Demo
| Role  | Username | Password |
|-------|----------|----------|
| Owner | owner    | 123456   |
| Kasir | kasir    | 123456   |

## Menjadikan APK Asli (Android)

Karena ini Progressive Web App (PWA), Anda bisa mengubahnya menjadi APK dengan beberapa cara:

### Cara termudah (tanpa coding):
1. Buka https://www.pwabuilder.com
2. Masukkan URL aplikasi Anda (setelah di-host)
3. Download APK / package Android

### Cara developer (Capacitor):
```bash
npm create @capacitor/app
# copy file web ke folder www
npx cap add android
npx cap sync
npx cap open android
# Build APK di Android Studio
```

### Host gratis supaya bisa di-install:
- Netlify, Vercel, GitHub Pages, atau Cloudflare Pages
- Upload seluruh folder `pos-umkm-app`

## Struktur Folder
```
pos-umkm-app/
├── index.html          # Entry point
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline)
├── css/style.css
├── js/
│   ├── db.js           # IndexedDB + seed data
│   ├── auth.js         # Login & role
│   ├── pos.js          # Halaman kasir
│   ├── products.js     # Produk & stok
│   ├── reports.js      # Laporan
│   ├── settings.js     # Pengaturan
│   ├── utils.js
│   └── app.js          # Router utama
└── icons/
```

## Catatan Teknis
- Data 100% tersimpan di browser (IndexedDB) → offline first
- Tidak perlu server / database cloud untuk MVP
- Untuk multi-device sync & multi-outlet, bisa ditambahkan backend (Supabase / Firebase) di tahap berikutnya
- Browser modern (Chrome, Edge, Safari, Firefox) didukung

## Roadmap Berikutnya (di luar MVP)
- Multi-outlet + transfer stok
- CRM & loyalty poin
- Kitchen Display System (KDS)
- Self-order via QR meja
- Sinkronisasi cloud otomatis
- Integrasi payment gateway QRIS real

---
Dibuat untuk UMKM Indonesia • Offline-first • Siap pakai
