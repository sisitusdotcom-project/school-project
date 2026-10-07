# DOKUMENTASI SISTEM & KEBUTUHAN FITUR (SD MUHAMMADIYAH 1 SEDATI)
Tahun Pelajaran 2026/2027

Dokumen ini memuat daftar fitur yang benar-benar aktif (`[x]`) dan rencana fitur selanjutnya (`[ ]`). Dokumen ini menjadi sumber rujukan tunggal (Single Source of Truth) untuk *progress* pengembangan sistem.

SD MUHAMMADIYAH 1 SEDATI
TAHUN PELAJARAN 2026/2027
KEPALA SEKOLAH
Dhani Harsyahyadi, S.H.I.
WAKA KEUANGAN
Ainaini Ratna Noeri, M.Pd.
STAF KEUANGAN

### 1.	Asmaul Husna, S.Pd.

### 2.	Intan Ayu P., S.Sos.

### 3.	Brilianinda, S.Sos.
WAKA KURIKULUM
Roudlotul Millah, S.Pd., Gr.
STAF KURIKULUM

### 1.	Deayu Icha R., S.Pd., Gr.

### 2.	Muhammad Niam A., S.Pd.

### 3.	Aprilia An'umillah, S.Pd.

### 4.	Naila Adiba, S.Pd.
WAKA KESISWAAN
Furqon, S.H.
STAF KESISWAAN

### 1.	Moh. Muzakki, S.Pd.

### 2.	Nur Fadhilah, S.Pd., Gr.

### 3.	Eka Dessy Pratiwi, S.Pd., Gr.
WAKA HUMAS & PERSONALIA
Angga Dkk, S.E., M.Pd., Gr.
STAF HUMAS & PERSONALIA

### 1.	Andi Sugiyanto, S.E.

### 2.	Siti Nadhiroh, S.Pd.
WAKA SARANA PRASARANA
Wahyu Mutida I., S.Pd., Gr.
STAF SARANA PRASARANA

### 1.	Ahmad Tsalis N., S.Tr.T.

### 2.	Vindy Aprilia, S.Pd.

### 3.	Divia Arianti, S.Pd., Gr.


SD MUHAMMADIYAH 1 SEDATI
TAHUN PELAJARAN 2026/2027

## I. PEMBAGIAN AKUN DASHBOARD DIGITAL MUSADA
Pembagian Dashboard Digital Musada berdasarkan kebutuhan pengguna:

### 1.	Akun A – Kepala Sekolah
Status: Sudah tersedia

### 2.	Akun B – Wakil Kepala Sekolah dan Staf
Jumlah: 5 akun
Status: Sudah tersedia

### 3.	Akun C – Guru/Pendidik
Jumlah: 29 akun
Status: Sudah tersedia

### 4.	Akun D – Karyawan/Tenaga Kependidikan
Jumlah: 10 akun
Status: Sudah tersedia

### 5.	Akun E – Guru BTQ Ummi
Jumlah: 13 akun
Status: Sudah tersedia
6.	Akun F – Guru Ekstrakurikuler
Jumlah: 14 akun
Status: Belum tersedia
Catatan: Belum ada informasi detail terkait jenis ekstrakurikuler dan pembina.
7.	Akun G – Komite Sekolah
Jumlah: 1 akun
Status: Belum tersedia
Catatan: Belum ada informasi detail terkait struktur dan data Komite Sekolah.
8.	Akun H – Orang Tua/Wali Murid
Jumlah: 380 akun
Status: Sudah tersedia.

## II. RINCIAN TUGAS DAN KEBUTUHAN FITUR PERANGKAT SEKOLAH

### A. KEPALA SEKOLAH

### 1.	Rekapan Laporan
Status: Sebagian sudah tersedia.

### 2.	Integrasi Dashboard
Seluruh laporan dan data dari setiap bagian terintegrasi ke dalam Dashboard Kepala Sekolah.

### B. WAKIL KEPALA SEKOLAH (WAKA)

### 1.	HUMAS & PERSONALIA

**a. Menyusun, mengoordinasikan, dan mengevaluasi personalia guru dan karyawan sekolah.**
Fitur:
- [x]	Data pegawai. *(Menu: Kelola Pengguna & Data Kepegawaian)*
- [x]	Kisi-kisi/data kepegawaian. *(Terakomodasi di profil user & database pegawai)*
Akses: Staf & Waka


**b. Mengatur dan mengevaluasi kedisiplinan guru dan tenaga kependidikan.**
Fitur:
- [x]	Rekap dan riwayat kehadiran harian sekolah. *(Menu: Pantau Disiplin Guru)*
- [x]	Rekap dan riwayat kehadiran tugas khusus. *(Tercakup dalam filter riwayat absensi)*
- [x]	Rekap dan riwayat izin kehadiran. *(Tercakup di Pantau Disiplin Guru)*
- [x]	Pengaturan keterlambatan kehadiran. *(Ada di Dashboard Personalia: Pengaturan Jam)*
- [x]	Pengaturan koordinat lokasi. *(Tercakup di backend/app-config)*
- [x]	Pengaturan waktu presensi. *(Dashboard Personalia)*
Akses: Waka Only


**c. Menyusun, membantu, dan mengevaluasi kualitas, jenjang karier, serta kepangkatan guru dan tenaga kependidikan.**
Fitur:
- [ ]	Penilaian kinerja berdasarkan kapasitas, kapabilitas, dan kualitas guru/karyawan. *(Menu: Penilaian Kinerja PKG)* 
- [ ]	Penilaian aspek Persyarikatan. *(Ada di instrumen PKG)* 
- [ ]	Upload dokumen pendukung. *(Menu: Pelatihan & Kompetensi, bisa upload sertifikat)* 
Akses: Waka Only


**d. Mengelola hubungan dan kerja sama dengan pihak eksternal, seperti sekolah mitra, masyarakat, pemerintah negeri/swasta, dan lembaga sosial.**
Fitur:
- [ ]	Upload dokumen surat masuk. *(Menu: Dokumen Kerja Sama)* 
- [ ]	Upload dokumen surat keluar. *(Menu: Dokumen Kerja Sama)* 
- [ ]	MoU. *(Menu: Kemitraan & MoU)* 
- [ ]	SK. *(Tercakup di Dokumen)* 
- [ ]	Piagam. *(Tercakup di Dokumen)* 
- [ ]	Surat kuasa. *(Tercakup di Dokumen)* 
- [x]	Dokumen terkait lainnya. *(Semua terintegrasi dengan upload ke Google Drive)*
Akses: Staf & Waka


**e. Menjalin sinergi dengan Komite, Paguyuban, Iwama, dan Musada.**
Fitur:
- [ ]	Laporan keuangan Komite. *(Diberikan lewat role spesifik KOMITE yang memiliki menu Keuangan Paguyuban & Komite, bisa diakses jika waka merangkap)* 
- [x]	Integrasi dengan bagian Keuangan. *(Tersedia melalui mapping multi-assignment)*
Akses: Staf & Waka.


**f. Menyusun, mengoordinasikan, dan mengevaluasi kegiatan SPMB.**
Fitur:
- [ ]	Halaman pendaftaran. *(spmb.html yang mem-push data via REST API)* 
- [ ]	Ringkasan data pendaftar. *(Menu: Manajemen SPMB di Dashboard)* 
- [ ]	QR Code SPMB. *(Tersedia di halaman publik/landing page)* 
- [ ]	Pengaturan formulir pendaftaran. *(Terintegrasi melalui form di spmb.html)* 
- [ ]	Pengaturan pembayaran. *(Di dalam Manajemen SPMB)* 
- [ ]	Riwayat pembayaran. *(Di dalam Manajemen SPMB)* 
Akses: Waka Only

### 2.	KEUANGAN

**a. Mengoordinasikan dan mengevaluasi laporan anggaran setiap agenda/kegiatan sekolah.**
Fitur:
- [ ]	Upload proposal kegiatan. *(Menu: Persetujuan Proposal)* 
- [ ]	Persetujuan (ACC/Non-ACC). *(Menu: Persetujuan Proposal)* 
- [ ]	Evaluasi anggaran. *(Menu: LPJ & Sinkronisasi Kas)* 
Terhubung dengan: Kepala Sekolah.

**b. Menerima, menyaring, dan mengidentifikasi calon siswa penerima beasiswa dan keringanan biaya pendidikan.**
Fitur:
- [ ]	Pengajuan keringanan biaya. *(Menu: Pengajuan Beasiswa)* 
- [ ]	Kriteria Yatim, Dhuafa, Persyarikatan, Non-Persyarikatan. *(Ada di form Pengajuan Beasiswa)* 
- [ ]	Upload bukti/dokumen pengajuan. *(Fitur upload pada Pengajuan Beasiswa)* 
Terhubung dengan: Kepala Sekolah.

**c. Membuat laporan keuangan harian, bulanan, dan tahunan.**
Fitur:
- [ ]	Menggunakan dashboard keuangan yang sudah tersedia. *(Menu: Penerimaan & Pengeluaran, BKU, Dashboard)* 
Terhubung dengan: Ortu Siswa

**d. Mendata dan menagih tunggakan siswa setiap akhir bulan.**
Fitur:
- [ ]	Menggunakan dashboard keuangan yang sudah tersedia. *(Menu: Penerimaan & Pengeluaran)* 
Terhubung dengan: Ortu Siswa

**e. Menghitung penggajian guru.**
Fitur:
- [ ]	Menu Penghitungan Gaji. *(Menu: Penghitungan Gaji)* 
Terhubung dengan: Humas & Personalia.

**f. Perpajakan.**
Perubahan:
- [ ]	Menu Perpajakan yang sekarang tidak relevan, tolong diganti menjadi Menu Laporan BOS. *(Sudah diganti di sidebar menjadi Laporan BOS)* 
Terhubung dengan: Kepala sekolah

### 3.	KURIKULUM

**a. Merencanakan dan menyusun kalender akademik.**
Intrakurikuler:
- [ ]	Jadwal pelajaran murid. *(Menu: Jadwal Pelajaran & Kalender)* 
Terhubung/dibagikan kepada: Guru dan Orang Tua/Wali Murid.
- [ ]	Jadwal pelajaran guru. *(Menu: Jadwal Pelajaran & Kalender)* 
Terhubung/dibagikan kepada: Guru.
Kokurikuler:
- [ ]	Jadwal pembiasaan. *(Tercakup di Kalender Akademik)* 
Dibagikan kepada: Guru dan Orang Tua/Wali Murid sebagai pengumuman.
- [ ]	Jadwal Mini Project. *(Tercakup di Kalender Akademik)* 
Dibagikan kepada: Guru dan Orang Tua/Wali Murid sebagai pengumuman.
- [ ]	Jadwal Pentas Budaya. *(Tercakup di Kalender Akademik)* 
Dibagikan kepada: Guru dan Orang Tua/Wali Murid sebagai pengumuman.
- [ ]	Jadwal Outing Class. *(Tercakup di Kalender Akademik)* 
Dibagikan kepada: Guru dan Orang Tua/Wali Murid sebagai pengumuman.

**b. Menjaga kualitas pembelajaran.**
Fitur:
- [ ]	Jurnal pembelajaran guru. *(Menu: Jurnal Pembelajaran)* 
- [ ]	Prota. *(Modul Ajar - Tahap 2 / Coming Soon)* 
- [ ]	Prosem.  *(Menu: Perangkat & Modul Ajar)* 
- [ ]	RPP.  *(Menu: Perangkat & Modul Ajar)* 
- [ ]	Tombol ACC/Non-ACC. *(Fitur status Diverifikasi di Perangkat & Modul Ajar)* 
Terhubung dengan: Guru.
Fitur tambahan:
- [ ]	Jadwal supervisi. *(Menu: Supervisi Guru)* 
Dibagikan kepada: Guru.
- [ ]	Bank materi dan media pembelajaran. *(Modul ajar terintegrasi)* 
Dibagikan kepada: Guru.

**c. Mengatur dan mengevaluasi pembelajaran.**
Fitur:
- [ ]	Bank soal. *(Menu: Bank Soal)* 
Terhubung dengan: Guru.
- [x]	Database nilai: *(Menu: Database Nilai & Sistem Penilaian)*
  - [x] Nilai Harian.
  - [x] Nilai Tengah Semester.
  - [x] Nilai Akhir Semester.
Terhubung dengan: Guru.

### 4.	KESISWAAN

**a. Menyusun dan mengoordinasikan administrasi murid.**
Fitur:
- [x]	Data murid lengkap. *(Menu: Dashboard Kesiswaan)*
- [ ]	Kenaikan kelas. *(Manajemen status siswa terintegrasi di sistem pusat)* 
- [ ]	Perpindahan/mutasi murid. *(Menu: PPDB & Mutasi)* 
- [ ]	Data alumni. *(Menu: PPDB & Mutasi)* 
- [x]	Rekap dan riwayat kehadiran murid. *(Menu: Pantau Kehadiran Siswa)*
- [x]	Pengaturan absensi murid. *(Pengaturan global melalui Dashboard)*

**b. Mengoordinasikan program pembinaan dan bimbingan konseling siswa.**
Fitur:
- [ ]	Data pelanggaran murid. *(Menu: Tata Tertib & TPPK)* 
- [ ]	Data prestasi murid. *(Menu: Lomba & Penghargaan)* 
- [x]	Data hasil observasi wali kelas. *(Diakses via Indikator Karakter & Sikap)*
- [x]	Rekap dan penilaian karakter murid. *(Menu: Indikator Karakter & Sikap)*
- [x]	Data observasi wali kelas. *(Diakses via Indikator Karakter & Sikap)*

**c. Mengoordinasikan prestasi murid dalam perlombaan dan ekstrakurikuler.**
Fitur:
- [ ]	Jadwal ekstrakurikuler. *(Menu: Ekstrakurikuler)* 
- [ ]	Jadwal guru mengajar. *(Menu: Ekstrakurikuler)* 
- [ ]	Jurnal pembelajaran. *(Melalui role GURU_EKSTRA: Program Latihan)* 
- [ ]	Presensi murid. *(Melalui role GURU_EKSTRA: Presensi Peserta)* 
Terhubung dengan: Seluruh Guru Ekstrakurikuler.
- [ ]	Penilaian. *(Melalui role GURU_EKSTRA: Nilai E-Rapor Ekskul)* 

### 5.	SARANA DAN PRASARANA (SARPRAS)

**a. Menyusun, mengoordinasikan, dan mendayagunakan sarana dan prasarana sekolah.**
Fitur:
- [ ]	Kontrol fasilitas sarana: *(Menu: Perawatan Gedung & Sanitasi, Pengecekan Keamanan Area)* 
  - [ ] Kebersihan. 
  - [ ] Keamanan. 
  - [ ] Keindahan. 
  - [ ] Air minum. 
  - [ ] Antar-jemput. 
- [ ]	Kontrol pemeliharaan prasarana: *(Menu: Pemeliharaan Elektronik & IT, Perawatan Gedung)* 
  - [ ] AC. 
  - [ ] Barang elektronik. 
  - [ ] Gedung sekolah. 
  - [ ] Sarana/prasarana lainnya. 

**b. Mengadakan, menjaga, dan mendokumentasikan aset sekolah.**
Fitur:
- [ ]	Daftar aset. *(Menu: Buku Inventaris (Aset))* 
- [ ]	Kode aset bergerak. *(Tercakup di form inventaris)* 
- [ ]	Kode aset tidak bergerak. *(Tercakup di form inventaris)* 
- [ ]	Nilai penyusutan. *(Kolom perhitungan nilai di inventaris)* 
- [ ]	Taksiran nominal. *(Kolom harga di inventaris)* 

## III. KEBUTUHAN FITUR AKUN GURU WALI KELAS

### A. GURU WALI KELAS
- [x]	1. Absensi murid. *(Menu: Absensi Siswa)*
- [x]	2. Penilaian karakter murid dan catatan yang memerlukan bimbingan. *(Menu: Riwayat Observasi / E-Rapor)*
Terhubung dengan: Kesiswaan dan Kepala Sekolah.
- [ ]	3. Pengumuman. *(Dikelola terpusat oleh Personalia, Wali Kelas komunikasi via Dashboard / Catatan)* 
- [x]	4. Rapor murid. *(Menu: E-Rapor Kelas)*
Komponen:
  - [ ]	Nilai akhir STS 1. 
  - [ ]	SAS. 
  - [ ]	STS. 
  - [ ]	ASAJ. 
  - [x]	Penilaian karakter.


## IV. KEBUTUHAN FITUR GURU PENDAMPING / GURU MAPEL / GURU UMUM / GURU DASAR

### A. Presensi harian
- [x]	Riwayat presensi. *(Menu: Riwayat Presensi Guru)*
- [x]	Rekap absensi bulanan. *(Terhubung ke Dashboard Personalia)*
Terhubung dengan: Humas & Personalia.

### B. Penilaian akademik
- [ ]	Penilaian Harian (PH). *(Fitur Formatif - Tahap 2 / Coming Soon)*
- [ ]	STS 1. 
- [ ]	SAS. 
- [ ]	STS. 
- [ ]	ASAJ. 
- [ ]	Perhitungan rata-rata nilai. 
Terhubung dengan: Wali Kelas dan Guru yang bersangkutan.
Terintegrasi dengan: Rapor Wali Kelas.

### C. Upload perangkat pembelajaran
- [ ]	Prota. *(Modul Ajar - Tahap 2 / Coming Soon)* 
- [ ]	Prosem. 
- [ ]	RPP. 
Sifat: Privat.
Terhubung dengan: Kurikulum.

### D. Portofolio Guru
- [x]	Terhubung dengan: Humas & Personalia. *(Menu: Pelatihan & Kompetensi)*


## V. KEBUTUHAN FITUR GURU UMMI

### A. Presensi harian
- [x]	Riwayat presensi. *(Menu: Riwayat Presensi Guru)*
- [x]	Rekap absensi bulanan.

### B. Penilaian pekanan dan pengajuan naik jilid
- [ ]	Progress pembelajaran murid. 
- [ ]	Pengajuan kenaikan jilid. *(Fitur Ujian - Tahap 2)*

### C. Upload perangkat pembelajaran
- [ ]	Prota. *(Modul Ajar - Tahap 2 / Coming Soon)* 
- [ ]	Prosem. 
- [ ]	RPP. 
Sifat: Privat.

### D. Portofolio Guru.
- [x]	*(Menu: Pelatihan & Kompetensi)*

### E. ACC/Non-ACC pengajuan naik jilid.
- [ ]	Keterangan: Fitur khusus untuk 2 Koordinator Ummi. *(Role: KOORDINATOR_UMMI - Tahap 2)*


## VI. KEBUTUHAN FITUR GURU EKSTRAKURIKULER

### A. Presensi murid.
- [ ]	

### B. Penilaian bulanan.
- [ ]	Progress pembelajaran murid. 

### C. Upload perangkat pembelajaran.
- [ ]	Prota. 
- [ ]	Prosem. 
- [ ]	RPP. 
Sifat: Privat.

### D. Portofolio Guru.
- [x]	*(Menu: Pelatihan & Kompetensi)*


## VII. KEBUTUHAN FITUR TENAGA KEPENDIDIKAN
Tenaga Kependidikan meliputi:
- [x]	Tata Usaha (TU).
- [x]	Bendahara.
- [ ]	Petugas Kebersihan. 
- [x]	Perpustakaan.
- [x]	Koperasi.
- [x]	Driver.
*(Semua tercakup dalam role Personnel)*

### A. Presensi kehadiran.
- [x]	*(Menu: Check-In/Out Kehadiran)*

### B. Laporan kinerja harian/pekanan.
- [x]	Progress pekerjaan yang dilakukan. *(Menu: Laporan Kinerja)*

### C. Portofolio Tenaga Kependidikan.
- [x]	*(Menu: Pelatihan & Kompetensi)*


## VIII. KEBUTUHAN FITUR WALI MURID

### A. Absensi/kehadiran murid.
- [ ]	*(Dashboard Wali Murid - Tahap 2 / Coming Soon)*

### B. Perizinan murid.
- [ ]	*(Pengajuan Izin - Tahap 2)*

### C. Jadwal pelajaran.
- [ ]	*(Tampil di Dashboard - Tahap 2)*

### D. Rapor karakter murid.
- [ ]	*(Tampil di menu Rapor - Tahap 2)*

### E. Tahsin & Tahfidz.
- [ ]	*(Progress UMMI - Tahap 2)*

### F. Administrasi pembayaran.
- [ ]	*(Menu: Tagihan & SPP - Tahap 2)*

### G. Pengumuman.
- [ ]	*(Notifikasi/Pengumuman - Tahap 2)*

### H. Rapor murid.
- [ ]	Komponen: STS 1, SAS, STS, ASAJ. 


## IX. KEBUTUHAN FITUR KOMITE MUSADA

### A. Kegiatan Paguyuban
- [ ]	Menjadi salah satu bahan/informasi pada Dashboard Utama Website. 

### B. Laporan Keuangan Paguyuban
- [ ]	Terhubung dengan: Keuangan. *(Menu: Keuangan Komite - Tahap 2)*

### C. Laporan Keuangan Komite
- [ ]	Terhubung dengan: Keuangan. 
- [ ]	Format laporan keuangan mengikuti format laporan keuangan pada Dashboard Keuangan. 
