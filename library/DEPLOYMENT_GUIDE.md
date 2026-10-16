# Panduan Deployment Cloudflare Pages: MUSADA Library Monorepo

Panduan resmi deployment arsitektur multi-domain untuk **MUSADA Library** berbasis **SSOT (Single Source of Truth)** dan **DRY (Don't Repeat Yourself)** dari satu repositori GitHub `MUSADA.SCH.ID`.

## Arsitektur Subdomain
1. **Portal Publik**: `https://library.musada.sch.id/`
   - Menampilkan OPAC (Katalog Buku & E-Book), Presensi Kunjungan Mandiri, dan Donasi Literasi.
2. **Portal Administrator**: `https://admin-library.musada.sch.id/`
   - Menampilkan Dashboard Petugas, Scanner Barcode/QR kamera, Sirkulasi Pinjam-Kembali, Overdue, Bank Data Buku & Anggota, Cetak Kartu/Barcode, dan Sinkronisasi Master Data Sekolah.

---

## Konfigurasi Cloudflare Pages

### 1. Proyek Halaman Publik (`library.musada.sch.id`)
1. Masuk ke **Cloudflare Dashboard** > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Pilih repositori `MUSADA.SCH.ID` (Branch: `main`).
3. Pengaturan Build:
   - **Framework Preset**: `None`
   - **Root directory**: `/` (biarkan root)
   - **Build Command**:
     ```bash
     mkdir -p dist && cp -r library/* dist/
     ```
   - **Build Output Directory**: `dist`
4. Klik **Save and Deploy**.
5. Pada tab **Custom domains**, daftarkan: `library.musada.sch.id`.

### 2. Proyek Portal Administrator (`admin-library.musada.sch.id`)
1. Di **Cloudflare Dashboard** > **Workers & Pages**, buat proyek Pages baru dari repositori yang sama (`MUSADA.SCH.ID`).
2. Pengaturan Build:
   - **Framework Preset**: `None`
   - **Root directory**: `/` (biarkan root)
   - **Build Command**:
     ```bash
     mkdir -p dist && cp -r admin-library/* dist/ && cp -r library/assets dist/assets
     ```
   - **Build Output Directory**: `dist`
3. Klik **Save and Deploy**.
4. Pada tab **Custom domains**, daftarkan: `admin-library.musada.sch.id`.

---

## Keunggulan Arsitektur SSOT & DRY
- **Zero Asset Duplication**: Seluruh aset gambar, logo, favicon, audio scanner, stylesheet, dan modul database tersimpan di satu lokasi terpusat (`library/assets/`).
- **Unified Database Client**: Keduanya menggunakan modul SSOT `assets/js/db-library.js` yang terhubung langsung ke Firebase Realtime Database `/library`.
- **Isolasi Keamanan & Profesionalisme**: Dashboard admin tidak terekspos di domain publik, dan portal publik terpisah dari area internal admin.
- **Tautan Terintegrasi**: Tombol "Area Petugas" pada publik langsung membuka `https://admin-library.musada.sch.id`, dan tombol "Portal Publik" pada admin membuka `https://library.musada.sch.id`.
