# PETA FITUR DAN ROLE APLIKASI SEKOLAH
**Terakhir Diperbarui:** September 2026

Dokumen ini merangkum seluruh pemetaan peran (*Role*), hak akses, penugasan kelompok (*Group*), dan fitur modul yang ada di dalam sistem, baik yang sudah berfungsi (Tahap 1) maupun yang masih berupa *Placeholder/Coming Soon* (Tahap 2).

---

## 1. MANAJEMEN SISTEM (ADMINISTRATOR)
Bertugas memastikan ekosistem aplikasi dan struktur hierarki guru terhubung dengan benar.
*   **Dashboard Admin** *(Tersedia)* - Ringkasan statistik dan akses.
*   **Hak Akses & Penugasan** *(Tersedia)* - Menambahkan *role* (Guru, Kepsek, Ortu) dan menugaskan jabatan (Waka, Koordinator, Staff).
*   **Data Master Pengguna** *(Tersedia)* - CRUD Akun Pengguna.
*   **Manajemen Rombel & Mapel** *(Tersedia)* - Mengelola daftar Rombongan Belajar dan Mata Pelajaran.
*   **Master Karakter** *(Tersedia)* - Indikator observasi siswa.

## 2. TIM IT (OPERASIONAL & JARINGAN)
Bertugas mengatur sistem data *backend* dan integrasi perangkat keras/lunak.
*   **Dashboard IT** *(Coming Soon)* - Pantau performa *server* aplikasi.
*   **Sinkronisasi Dapodik** *(Coming Soon)* - Tarik/dorong data siswa dan sarpras ke server Dapodik.
*   **Backup & Restore Data** *(Coming Soon)* - Ekspor/impor data RTDB (Firebase).
*   **Log Audit Sistem** *(Coming Soon)* - Jejak digital perubahan data oleh *user*.
*   **Infrastruktur Jaringan & Integrasi API** *(Coming Soon)* - CCTV, CBT Ujian.

---

## 3. JAJARAN WAKIL KEPALA SEKOLAH (WAKA)

### A. WAKA KURIKULUM (Perencanaan & KBM)
*   **Pengaturan Umum Akademik** *(Tersedia)* - Ubah Tahun Ajaran & Semester (Global).
*   **Perencanaan KBM** *(Coming Soon)* - RPP, Silabus, Alokasi Waktu.
*   **Jadwal Pelajaran** *(Coming Soon)* - Plotting jam mengajar guru.
*   **Kalender Akademik** *(Coming Soon)* - Agenda sekolah tahunan.
*   **Evaluasi Akademik** *(Coming Soon)* - Bank Soal, UTS, UAS.

### B. WAKA KESISWAAN (Siswa & Karakter)
*   **Buku Induk & PPDB** *(Coming Soon)* - Manajemen penerimaan siswa baru.
*   **Peminatan & Ekstrakurikuler** *(Coming Soon)* - Plotting siswa ke kelas Ekskul.
*   **Bimbingan & Konseling** *(Coming Soon)* - Catatan pelanggaran dan penghargaan siswa (Poin).
*   **Beasiswa & Mutasi** *(Coming Soon)* - Laporan pindah/keluar/masuk.

### C. WAKA KEUANGAN (Anggaran & BOSP)
*   **RKAS (Rencana Anggaran)** *(Coming Soon)* - Integrasi ARKAS.
*   **Penerimaan (SPP/BOS)** *(Coming Soon)* - Pemasukan siswa bulanan.
*   **Pengeluaran & Belanja** *(Coming Soon)* - Buku Kas Umum (BKU).
*   **Penggajian (Payroll)** *(Coming Soon)* - Honorarium guru & staf.

### D. HUMAS & PERSONALIA (Pegawai & Publikasi)
*   **Pengaturan Jam & Tanggal Absensi** *(Tersedia)* - Pengaturan batas waktu Check-In / Check-Out.
*   **Direktori Kepegawaian** *(Coming Soon)* - Data Guru/Staf.
*   **Penilaian Kinerja (PKG)** *(Coming Soon)* - Evaluasi tahunan.
*   **Agenda & Pengaduan** *(Coming Soon)* - Layanan masyarakat dan MoU Kemitraan.

### E. WAKA SARPRAS (Fasilitas & Aset)
*   **Buku Inventaris** *(Coming Soon)* - Labeling barang dan jumlah aset.
*   **Analisis & Pengadaan (RKAS Sarpras)** *(Coming Soon)* - Usulan pembelian barang.
*   **Pemeliharaan Gedung** *(Coming Soon)* - Laporan kerusakan (AC, Meja, dll).
*   **Peminjaman & Penghapusan** *(Coming Soon)* - Sirkulasi alat sekolah.

---

## 4. TENAGA PENDIDIK (GURU)

### A. GURU MATA PELAJARAN (Umum)
*   **Presensi Guru (Check-In)** *(Tersedia)* - Absensi berbasis koordinat/QR (Front-end ready).
*   **Absensi Siswa** *(Tersedia)* - Input absensi harian kelas.
*   **Input Nilai Akademik** *(Tersedia)* - Formatif, Sumatif.
*   **Observasi Karakter** *(Tersedia)* - Input sikap sosial/spiritual.
*   **E-Rapor** *(Tersedia)* - Cetak dan rekap nilai per kelas.

### B. WALI KELAS
*   *(Wali Kelas memiliki fitur turunan dari Guru)*
*   **Ledger Kelas & Jurnal** *(Tersedia)* - Kontrol perkembangan nilai khusus di rombel yang ia pimpin.

---

## 5. PROGRAM BTQ & TAHFIDZ

### A. KOORDINATOR BTQ
*   **Pemetaan Rombel & Guru** *(Coming Soon)* - Pembagian siswa per jilid & guru pembimbingnya.
*   **Antrean Ujian Jilid/Munaqosyah** *(Coming Soon)* - ACC & tes kenaikan jilid (Jilid 1-6, Ghorib, Tajwid).
*   **Plotting Guru Tasmi'** *(Coming Soon)* - Menunjuk guru untuk mengetes hafalan anak.

### B. TIM BTQ (Guru Pengajar)
*   **Rombel BTQ Saya** *(Coming Soon)* - Lihat daftar siswa yang ditugaskan khusus.
*   **Jurnal Harian Jilid** *(Coming Soon)* - Update progres "Sampai jilid/halaman berapa" & klik *Ajukan Ujian*.
*   **Setoran Tahfidz (Juz 30-1)** *(Coming Soon)* - Catatan setoran surat (Validasi per-ayat).
*   **Ujian Tasmi'** *(Coming Soon)* - Penilaian akhir bagi guru penguji Tasmi'.

---

## 6. GURU EKSTRAKURIKULER & ENGLISH LAB
*   **Program Latihan & Silabus Ekskul** *(Coming Soon)* - Rencana latihan per semester.
*   **Presensi Ekskul** *(Coming Soon)* - Checklist absensi siswa yang ikut ekstrakurikuler.
*   **Nilai E-Rapor Ekskul** *(Coming Soon)* - Input A/B/C dan Deskripsi singkat untuk rapor.
*   **Pemetaan Siswa Berbakat** *(Coming Soon)* - Pemantauan anak potensial untuk lomba.
*   **English Lab** *(Coming Soon)* - Rombel khusus bahasa Inggris & Jurnal Speaking/Listening.

---

## 7. STAF OPERASIONAL (NON-AKADEMIK)

*   **KOPERASI:** Kasir Penjualan (POS), Stok Barang Koperasi, Laporan Penjualan *(Coming Soon)*.
*   **PERPUSTAKAAN:** Katalog Buku, Sirkulasi (Pinjam/Kembali), Data Anggota *(Coming Soon)*.
*   **KEAMANAN:** Buku Tamu Digital, Log Patroli, Laporan Insiden *(Coming Soon)*.
*   **KEBERSIHAN:** Jadwal Piket Area, Checklist Kebersihan Harian *(Coming Soon)*.
*   **PERTAMANAN:** Jadwal Perawatan, Log Penyiraman Taman *(Coming Soon)*.
*   **PENGEMUDI:** Jadwal Antar-Jemput/Tugas Luar, Log Servis & BBM Kendaraan *(Coming Soon)*.

---

## 8. KEPALA SEKOLAH & ORANG TUA
*   **Kepala Sekolah:** Dashboard Pantau Akademik, Laporan Kelas *(Tersedia)*.
*   **Orang Tua:** Dashboard Perkembangan Anak (Nilai, Absensi, Tahfidz, Keuangan) *(Coming Soon / Tahap Integrasi)*.
