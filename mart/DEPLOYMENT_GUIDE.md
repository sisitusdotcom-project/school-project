# Panduan Deployment Cloudflare Pages: MUSADA Mart Monorepo

Panduan resmi deployment arsitektur multi-domain untuk **MUSADA Mart (Koperasi Sekolah Digital)** berbasis **SSOT (Single Source of Truth)** dan **DRY (Don't Repeat Yourself)** dari repositori GitHub `MUSADA.SCH.ID`.

## Arsitektur Subdomain
1. **Portal Publik**: `https://mart.musada.sch.id/`
   - Menampilkan Katalog Produk Koperasi (ATK, Seragam, Buku, Makanan), Galeri Detail Produk, Keranjang Belanja, dan Checkout Pesanan Langsung (Beli > Checkout > Ambil di Sekolah dengan Struk QR Digital).
2. **Portal Administrator**: `https://admin-mart.musada.sch.id/`
   - Scanner Barcode/QR Kamera (Serah Terima Pesanan & Stock Opname), Kasir Koperasi Langsung (POS), Manajemen Inventaris Realtime, dan Sinkronisasi Firebase Realtime Database.

---

## Konfigurasi Cloudflare Pages

### 1. Proyek Halaman Publik (`mart.musada.sch.id`)
1. Masuk ke **Cloudflare Dashboard** > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Pilih repositori `MUSADA.SCH.ID` (Branch: `main`).
3. Pengaturan Build:
   - **Framework Preset**: `None`
   - **Root directory**: `/` (biarkan root)
   - **Build Command**:
     ```bash
     mkdir -p dist && cp -r mart/. dist/
     ```
   - **Build Output Directory**: `dist`
4. Klik **Save and Deploy**.
5. Pada tab **Custom domains**, daftarkan: `mart.musada.sch.id`.

### 2. Proyek Portal Administrator (`admin-mart.musada.sch.id`)
1. Di **Cloudflare Dashboard** > **Workers & Pages**, buat proyek Pages baru dari repositori yang sama (`MUSADA.SCH.ID`).
2. Pengaturan Build:
   - **Framework Preset**: `None`
   - **Root directory**: `/` (biarkan root)
   - **Build Command**:
     ```bash
     mkdir -p dist && cp -r admin-mart/. dist/
     ```
   - **Build Output Directory**: `dist`
3. Klik **Save and Deploy**.
4. Pada tab **Custom domains**, daftarkan: `admin-mart.musada.sch.id`.

---

## Keunggulan Arsitektur SSOT & DRY
- **Zero Asset Duplication**: Seluruh stylesheet, script pengendali, dan skema data produk tersimpan terpusat di `mart/assets/`.
- **Unified Database Client**: Terintegrasi langsung dengan Firebase Realtime Database `https://musada-sd-default-rtdb.firebaseio.com/mart` (SSOT) tanpa data file lokal statis, serta didukung pengelola URL gambar Google Drive otomatis.
- **Strict Compliance**: Bebas komentar berlebih, bebas baris kosong tak terpakai, tanpa inline style/script, dan sepenuhnya responsif mencegah CSS Grid blowout di perangkat mobile.

