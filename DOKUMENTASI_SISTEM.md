# DOKUMENTASI SISTEM & KEBUTUHAN FITUR (SD MUHAMMADIYAH 1 SEDATI)
**Tahun Pelajaran 2026/2027**  
**Versi Sistem:** 2.1 (Arsitektur Dua Tingkat & Matriks Distribusi Data SSOT/DRY)  
**Terakhir Diperbarui:** 13 Oktober 2026  
**Status Acuan:** Single Source of Truth (SSOT) & Don't Repeat Yourself (DRY)

Dokumen ini merupakan sumber rujukan tunggal (*Single Source of Truth*) arsitektur sistem, pembagian hak akses, matriks distribusi data (Dari Siapa, Untuk Siapa, Tujuannya Apa), dan batasan domain operasional sistem Dashboard Digital SD Muhammadiyah 1 Sedati (Musada).

---

## I. ARSITEKTUR PERAN & PENUGASAN DUA TINGKAT (TWO-TIER ARCHITECTURE)

Sistem mengadopsi arsitektur dua tingkat untuk memisahkan secara tegas antara **identitas profesi dasar** dan **penugasan struktural/fungsional**, sehingga mencegah duplikasi akun (*DRY*) dan menjaga integritas data kepegawaian (*SSOT*).

```
+-----------------------------------------------------------------------------------+
|               TINGKAT 1: IDENTITAS PROFESI UTAMA (Base Role)                      |
|  [admin] Administrator Sistem       [kepsek] Kepala Sekolah                       |
|  [guru]  Guru / Pendidik            [tendik] Tenaga Kependidikan                  |
|  [ortu]  Orang Tua / Wali Murid                                                   |
+-----------------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|            TINGKAT 2: PENUGASAN STRUKTURAL & TIM (Assignments & UnitFlags)        |
|  - Waka & Staf Unit Kerja      : Kurikulum, Kesiswaan, Sarpras, Humas, Keuangan   |
|  - Tim Khusus & Koordinator    : Koordinator Ummi, Tim Ummi, Tim IT, English Lab  |
|  - Tugas Pokok Mengajar        : Wali Kelas (16 Rombel), Guru Mapel, Ekstra       |
+-----------------------------------------------------------------------------------+
```

### 1. Prinsip Utama: 1 Orang = 1 Akun Tunggal (SSOT)
* Setiap pegawai (GTK) hanya memiliki **satu akun login** dengan email format `gtk[namabersih]@musada.sch.id`.
* Pendidik yang merangkap jabatan (misalnya: Guru Kelas yang menjabat Waka Keuangan, atau Guru Mapel yang merangkap Koordinator Ummi dan Staf Kurikulum) **tidak dibuatkan multi-akun**, melainkan diberikan atribut penugasan ganda pada array `assignments`.
* Setiap murid/wali murid memiliki **satu akun login tunggal** berbasis NIS: `siswa[NIS]@musada.sch.id` (UID: `SISWA_[NIS]`).
* **NIS sebagai SSOT Siswa:** Seluruh relasi data murid (kelas, presensi, rapor, ekskul, perpustakaan) mengacu secara tunggal ke NIS. NISN tetap dicatat sebagai data atribut biasa (seperti halnya jenis kelamin/tanggal lahir).
* **Auto-generate NIS pada SPMB:** Saat pendaftaran siswa baru (SPMB), sistem langsung menerbitkan NIS urutan terakhir secara otomatis (`settings/lastNis + 1`) sehingga tidak ada duplikasi NIS.
* **Aturan Mutasi / Keluar:** Jika siswa mutasi atau keluar, nomor NIS tetap melekat pada siswa tersebut (tidak didaur ulang), dan nomor pendaftaran berikutnya berlanjut ke urutan berikutnya.
* Navigasi sidebar dirakit secara dinamis oleh sistem (`AppConfig.getRoleNav`) berdasarkan kombinasi role dan penugasan yang dimiliki.

### 2. Distribusi Akun Sistem Aktif (Database Realtime)
1. **Administrator Sistem (`role: 'admin'`)**: 1 akun master (`admin@musada.sch.id`) untuk pemeliharaan teknis dan darurat basis data.
2. **Kepala Sekolah (`role: 'kepsek'`)**: 1 akun eksekutif (`Dhani Harsyahyadi, S.H.I.`) untuk pengawasan dan supervisi lintas unit.
3. **Guru / Pendidik (`role: 'guru'`)**: 53 akun pendidik aktif.
   * Termasuk 5 Waka (tetap berprofesi pokok sebagai guru).
   * Termasuk 3 Tim IT.
   * Termasuk 15 Guru/Tim Ummi (1 Koordinator + 14 Guru Al-Qur'an).
   * Termasuk 14 Pembina Ekstrakurikuler.
   * Termasuk 16 Wali Kelas rombel.
4. **Tenaga Kependidikan (`role: 'tendik'`)**: 10 akun staf kependidikan (TU, Bendahara TU, Perpustakaan, Koperasi, Driver, Kebersihan).
5. **Orang Tua / Wali Murid (`role: 'ortu'`)**: 378 akun orang tua/wali siswa aktif (login format: `siswa[NIS]@musada.sch.id` / `0623`).

---

## II. STRUKTUR PIMPINAN & DISTRIBUSI UNIT KERJA

### 1. Kepala Sekolah
* **Kepala Sekolah:** Dhani Harsyahyadi, S.H.I.

### 2. Wakil Kepala Sekolah (Waka) & Staf Unit Kerja
* **Waka Kurikulum:** Roudhotul Millah, S.Pd., Gr.
  * Staf Kurikulum: Deayu Icha R., S.Pd., Gr. | Muhammad Niam A., S.Pd. | Aprilia An'umillah, S.Pd. | Naila Adiba, S.Pd.
* **Waka Kesiswaan:** Furqon, S.H.
  * Staf Kesiswaan: Moh. Muzakki, S.Pd. | Nur Fadhilah, S.Pd., Gr. | Eka Dessy Pratiwi, S.Pd., Gr.
* **Waka Humas & Personalia:** Angga Dwi Kurniawan Kusuma, M.Pd., Gr.
  * Staf Humas & Personalia: Andi Sugiyanto, S.E. | Siti Nadhiroh, S.Pd.
* **Waka Sarana & Prasarana:** Wahyu Mufida Isnaini, S.Pd., Gr.
  * Staf Sarpras: Ahmad Tsalis N., S.Tr.T. | Vindy Aprilia, S.Pd. | Divia Arianti, S.Pd., Gr.
* **Waka Keuangan:** Ainaini Ratna Noeri, M.Pd.
  * Staf Keuangan: Asmaul Husna, S.Pd. | Intan Ayu P., S.Sos. | Brilianinda, S.Sos.

### 3. Tim Khusus & Koordinator Program
* **Koordinator Ummi (`KOORD_UMMI`):** Aprilia An'umillah, S.Pd.
* **Tim IT & Sistem (`TIM_IT`):** Ahmad Tsalis Novariyanto, S.Tr.T. | Divia Arianti, S.Pd., Gr. | Vindy Aprillia, S.Pd. | Administrator Sistem
* **Tim English Lab (`TIM_B_INGGRIS`):** Tim Guru Bahasa Inggris
* **Tim Ummi (`TIM_UMMI`):** 14 Guru Pembelajar Al-Qur'an Metode Ummi
* **Pembina Ekstrakurikuler (`GURU_EKSTRA_...`):** 14 Guru Pembina Cabang Ekskul

---

## III. MATRIKS FITUR OPERASIONAL & DISTRIBUSI DATA PER UNIT KERJA

Keterangan Status:
* `[x]` = Fitur telah aktif terintegrasi di sistem dan memiliki modul UI/API.
* `[ ]` = Rencana pengembangan tahap lanjutan / fitur tambahan yang belum diaktifkan.

---

### A. KEPALA SEKOLAH (`role: 'kepsek'`)
*Tupoksi: Supervisi umum, persetujuan kebijakan, pemantauan mutu pendidikan, dan evaluasi ketercapaian program lintas bidang.*

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Dashboard Eksekutif**<br>`#/dashboard` | Agregasi otomatis sistem | Kepala Sekolah | Ringkasan metrik sekolah: total murid, kehadiran harian GTK, status keuangan, dan capaian program | Ringkasan Multi-Node |
| `[x]` | **Presensi Kehadiran**<br>`#/attendance` | Kepala Sekolah (GPS Check-In) | Arsip Kepegawaian & Personalia | Pencatatan kehadiran mandiri pimpinan berbasis radius koordinat sekolah | `attendance_records` |
| `[x]` | **Laporan Kelas & Rapor**<br>`#/kepsek/reports` | Wali Kelas & Guru Mapel | Kepala Sekolah & Pengawas Dikdasmen | Memantau rekap nilai rapor semester, statistik kelulusan, dan grafik ketuntasan per rombel | `classes/{id}/grades` |
| `[x]` | **Monitoring Kurikulum**<br>`#/curriculum` | Waka & Staf Kurikulum | Kepala Sekolah | Pengawasan keterlaksanaan jadwal KBM, modul ajar guru, dan bank soal asesmen | `curriculum/*` |
| `[x]` | **Monitoring Kesiswaan**<br>`#/student-affairs` | Waka & Staf Kesiswaan | Kepala Sekolah | Pengawasan data pendaftar PPDB, kedisiplinan murid, prestasi lomba, dan beasiswa | `student_affairs/*` |
| `[x]` | **Monitoring Keuangan**<br>`#/finance` | Waka & Staf Keuangan | Kepala Sekolah | Pengawasan serapan RKAS, realisasi dana BOS, BKU kas berjalan, dan anggaran kegiatan | `finance/*` |
| `[x]` | **Monitoring Humas & SDM**<br>`#/personnel` | Waka Humas & Personalia | Kepala Sekolah | Pemantauan kedisiplinan GTK, hasil PKG, kesejahteraan staf, dan tindak lanjut aduan publik | `personnel/*` |
| `[x]` | **Monitoring Sarpras**<br>`#/facilities` | Waka & Staf Sarpras | Kepala Sekolah | Pengawasan kondisi aset gedung, pemeliharaan ruang, dan usulan pengadaan fasilitas | `facilities/*` |

---

### B. WAKA & STAF KESISWAAN (`assignments: 'WAKA_KESISWAAN' / 'STAF_KESISWAAN'`)
*Tupoksi: Mengelola siklus murid sejak pendaftaran (SPMB/PPDB), MPLS, pembinaan karakter/disiplin (TPPK), prestasi lomba, beasiswa siswa, hingga pemantauan ekskul.*

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Penerimaan Siswa Baru (SPMB / PPDB)**<br>`#/student-affairs/ppdb` | Calon wali murid publik (via `spmb.html`) | Panitia PPDB Kesiswaan & Bendahara | Registrasi siswa baru online, verifikasi berkas, validasi bukti transfer formulir, dan mutasi masuk | `spmb_registrations` *(SSOT)* |
| `[x]` | **Masa Pengenalan (MPLS)**<br>`#/student-affairs/mpls` | Panitia MPLS Kesiswaan | Siswa Baru & Guru Pendamping | Perencanaan jadwal orientasi, pembagian gugus siswa baru, dan evaluasi adaptasi lingkungan sekolah | `student_affairs/mpls` |
| `[x]` | **Tata Tertib & TPPK**<br>`#/student-affairs/rules` | Guru Piket, Wali Kelas, Tim TPPK | Siswa, Wali Kelas, Guru BK, Ortu | Pencatatan pelanggaran disiplin siswa, akumulasi poin pembinaan, dan tindak lanjut penanganan kekerasan | `student_affairs/violations` |
| `[x]` | **Lomba & Prestasi Murid**<br>`#/student-affairs/achievements` | Guru Pembina Lomba & Wali Kelas | Siswa, Tim Humas, & Lembar E-Rapor | Mendata capaian juara perlombaan siswa (sains, seni, olahraga) untuk apresiasi dan rapor | `student_affairs/achievements` |
| `[x]` | **Data Beasiswa & PIP**<br>`#/student-affairs/scholarships` | Wali Kelas & Tim Kesiswaan | Siswa Penerima & Waka Keuangan | **Pintu Tunggal Seleksi Beasiswa:** verifikasi kelayakan kriteria (Yatim, Dhuafa, PIP) dan penetapan SK penerima | `student_affairs/scholarships` |
| `[x]` | **Indikator Karakter & Sikap**<br>`#/admin/characters` | Waka Kesiswaan | Seluruh Wali Kelas | Menyusun rubrik observasi sikap Islami dan profil pelajar Muhammadiyah untuk rapor | `master/character_indicators` |
| `[x]` | **Master Ekstrakurikuler**<br>`#/admin/extracurriculars` | Waka Kesiswaan | Pembina Ekskul & Siswa | Menetapkan cabang ekskul resmi, jadwal latihan mingguan, kuota rombel, dan pembina | `master/extracurriculars` |
| `[x]` | **Perizinan Siswa (Sakit/Izin)**<br>`#/student-affairs/leaves` | Orang Tua Murid / Wali Kelas | Guru Piket & Kesiswaan | Pengajuan dan verifikasi surat izin sakit dan dispensasi lomba siswa online | `student_affairs/leaves` |
| `[x]` | **Pantau Kehadiran Siswa**<br>`#/admin/attendance` | Wali Kelas (Rekap Harian) | Kesiswaan & Kepala Sekolah | Pemantauan tingkat absensi siswa sekolah secara terpadu untuk deteksi dini siswa bermasalah | `attendance_records` |
| `[x]` | **Penelusuran Alumni**<br>`#/student-affairs/alumni` | Alumni / Tim Kesiswaan | Sekolah & Humas | Tracer study data kelulusan siswa, jalur masuk, dan kelanjutan studi ke jenjang SMP/MTs/Pesantren | `student_affairs/alumni` |
| `[x]` | **Kenaikan Kelas & Promosi Rombel**<br>`#/admin/classes` | Wali Kelas & Kurikulum | Seluruh Rombel & Siswa | Pemrosesan status kenaikan kelas massal dan penetapan kelulusan alumni akhir tahun ajaran | `classes/{id}/promotion` *(SSOT)* |

---

### C. WAKA & STAF HUMAS & PERSONALIA (`assignments: 'WAKA_HUMAS_PERSONALIA' / 'STAF_HUMAS_PERSONALIA'`)
*Tupoksi: Administrasi kepegawaian (SDM/GTK), disiplin kehadiran guru, peningkatan mutu/PKG, kemitraan eksternal (MoU), komunikasi publik, dan layanan aduan masyarakat.*

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Data Kepegawaian**<br>`#/personnel/data` | Staf Personalia | Seluruh GTK & Kepala Sekolah | Direktori induk pegawai: biodata, NIP/NUPTK, status kepegawaian (PNS/GTY/Tendik), dan pendidikan | `personnel/directory` |
| `[x]` | **Kelola Pengguna**<br>`#/admin/users` | Waka Humas / Tim IT | GTK Sekolah | Manajemen akun login, aktivasi akun, dan pemeliharaan kredensial | `users` |
| `[x]` | **Distribusi Penugasan**<br>`#/admin/assignments` | Waka Humas & Kepala Sekolah | Seluruh Pegawai | Plotting peran dua tingkat (Waka, Staf Unit, Tim Khusus, Wali Kelas, Pembina Ekskul) | `users/{id}/assignments` |
| `[x]` | **Pantau Disiplin Guru**<br>`#/admin/attendance` | Data Presensi GPS Guru | Waka Personalia & Kepala Sekolah | Monitoring rekap kehadiran realtime guru/karyawan, jam datang/pulang, dan izin | `attendance_records` |
| `[x]` | **Penilaian Kinerja (PKG)**<br>`#/personnel/evaluations` | Kepala Sekolah & Asesor PKG | Guru yang Dinilai | Evaluasi tahunan kompetensi pedagogik, kepribadian, sosial, dan profesional guru | `personnel/evaluations` |
| `[x]` | **Pelatihan & Kompetensi**<br>`#/personnel/training` | GTK & Personalia | GTK & Sekolah | Pendataan keikutsertaan workshop/diklat, pemenuhan jam pelatihan, dan arsip sertifikat | `personnel/training` |
| `[x]` | **Kesejahteraan Staf**<br>`#/personnel/welfare` | Waka Humas & Personalia | GTK Penerima Manfaat | **Penetapan Hak Kesejahteraan:** SK tunjangan duka, santunan sakit, bantuan melahirkan, dan apresiasi GTK | `personnel/welfare` |
| `[x]` | **Publikasi & Informasi**<br>`#/personnel/publications` | Tim Humas | Warga Sekolah (Guru/Tendik/Ortu) | Penyebaran edaran resmi, pengumuman hari libur, dan informasi internal sekolah | `personnel/announcements` |
| `[x]` | **Layanan Pengaduan**<br>`#/personnel/complaints` | Wali Murid & Masyarakat | Tim Humas & Kepala Sekolah | Menampung komplain, kritik, atau saran wali murid serta memproses status tindak lanjut | `personnel/complaints` |
| `[x]` | **Kemitraan & MoU**<br>`#/personnel/partnerships` | Tim Humas | Lembaga Mitra & Sekolah | Pendataan kerja sama kelembagaan (Puskesmas, Bank, Kepolisian, Perguruan Tinggi) | `personnel/partnerships` |
| `[x]` | **Dokumen Kerja Sama & SK**<br>`#/personnel/documents` | Staf Humas | Arsip Sekolah & Pimpinan | Repositori naskah resmi MoU, surat keputusan pengangkatan, dan piagam kerja sama | `personnel/documents` |
| `[x]` | **Manajemen Acara**<br>`#/personnel/events` | Tim Humas | Seluruh Warga Sekolah | Koordinasi kepanitiaan acara besar sekolah (Milad, Wisuda, Baitul Arqom, Pawai) | `personnel/events` |

---

### D. WAKA & STAF KURIKULUM (`assignments: 'WAKA_KURIKULUM' / 'STAF_KURIKULUM'`)
*Tupoksi: Perencanaan intrakurikuler & kokurikuler, beban mengajar, jadwal pelajaran, perangkat ajar, pemantauan KBM, bank soal, dan evaluasi nilai rapor.*

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Pembagian Rombel & Kelas**<br>`#/admin/classes` | Waka Kurikulum | Wali Kelas & Seluruh Guru | Menetapkan 16 rombel (1A-6B), kuota siswa per kelas, dan penugasan wali kelas | `classes` *(SSOT)* |
| `[x]` | **Pemetaan Mapel & Guru**<br>`#/admin/subjects` | Waka Kurikulum | Guru Mapel & Kurikulum | Menetapkan struktur kurikulum, alokasi jam pelajaran mingguan, dan plotting pengampu | `subjects` *(SSOT)* |
| `[x]` | **Jadwal Pelajaran**<br>`#/curriculum/schedules` | Staf Kurikulum | Guru, Siswa, Petugas Piket | Jadwal mingguan per hari, per jam sesi, per ruang kelas, dan guru pengajar | `curriculum/schedules` |
| `[x]` | **Perangkat & Modul Ajar**<br>`#/curriculum/syllabus` | Guru Pengampu Mapel/Kelas | Waka Kurikulum (Verifikator) | Guru mengunggah RPP/Modul Ajar; Kurikulum memverifikasi kelayakan pembelajaran (Status ACC) | `curriculum/documents` |
| `[x]` | **Pemantauan KBM Harian**<br>`#/curriculum/monitoring` | Petugas Piket Kurikulum | Guru Pengajar & Kepala Sekolah | Memantau ketepatan jam masuk mengajar, kesesuaian materi, dan pengisian kelas jam kosong | `curriculum/monitoring` |
| `[x]` | **Bank Soal Asesmen**<br>`#/curriculum/questions` | Guru Penyusun Soal | Tim Penggandaan & Arsip | Pengumpulan naskah soal sumatif, kisi-kisi asesmen, dan instrumen kunci jawaban | `curriculum/questions` |
| `[x]` | **Jurnal Pembelajaran**<br>`#/curriculum/journals` | Guru Pengajar Kelas/Mapel | Kurikulum & Kepala Sekolah | Jurnal harian guru: materi pokok yang tuntas diajarkan dan kendala siswa di kelas | `curriculum/journals` |
| `[x]` | **Supervisi Akademik**<br>`#/curriculum/supervision` | Kepala Sekolah & Waka Kurikulum | Guru yang Disupervisi | Penilaian klinis proses mengajar guru di dalam kelas berbasis rubrik pedagogik | `curriculum/supervision` |
| `[x]` | **Database Nilai Terpusat**<br>`#/curriculum/grades` | Ditarik otomatis dari E-Rapor | Kurikulum & Kepala Sekolah | Pengawasan ketercapaian kriteria ketuntasan tujuan pembelajaran (KKTP) lintas rombel | `curriculum/grades` |
| `[x]` | **Kebijakan Sistem Penilaian**<br>`#/curriculum/evaluations` | Waka Kurikulum | Seluruh Dewan Guru | Menetapkan bobot formatif, sumatif tengah semester (STS), dan sumatif akhir (SAS/ASAJ) | `curriculum/assessment_policies` |

---

### E. WAKA & STAF KEUANGAN (`assignments: 'WAKA_KEUANGAN' / 'STAF_KEUANGAN'`)
*Tupoksi: Perencanaan RKAS, pembukuan kas umum (BKU), realisasi BOS, penggajian pegawai, verifikasi proposal anggaran, dan laporan pertanggungjawaban kas.*

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Penyusunan RKAS**<br>`#/finance/rkas` | Waka Keuangan & Tim Anggaran | Kepala Sekolah & Yayasan | Menyusun pagu anggaran belanja sekolah per komponen dan mengontrol serapan anggaran | `finance/rkas` |
| `[x]` | **Penerimaan & Pengeluaran**<br>`#/finance/transactions` | Bendahara Sekolah | Buku Kas Umum (BKU) | Jurnal harian mutasi uang masuk (SPP/Infaq/BOS) dan uang keluar dengan bukti nota | `finance/ledger` |
| `[x]` | **Buku Kas Umum (BKU)**<br>`#/finance/cashbook` | Dihitung otomatis dari Jurnal | Kepala Sekolah & Auditor | Buku Kas Umum per bulan dengan saldo kas berjalan (Tunai & Bank) | `finance/ledger` *(Derived)* |
| `[x]` | **Laporan Dana BOS**<br>`#/finance/bos` | Bendahara BOS | Tim BOS Sekolah & Dinas | Pembukuan belanja dana BOS reguler sesuai juknis kementerian lengkap dengan bukti kuitansi | `finance/bos` |
| `[x]` | **Pencairan Beasiswa & SPP**<br>`#/finance/scholarships` | Bendahara Sekolah | Siswa Penerima & Kas Sekolah | **Eksekusi Kas Beasiswa:** mencairkan dana beasiswa atau memotong tagihan SPP siswa yang telah disetujui Kesiswaan | `finance/scholarships` |
| `[x]` | **Tagihan & SPP Siswa**<br>`#/finance/student-bills` | Bendahara Keuangan | Orang Tua Murid & Sekolah | Monitoring iuran bulanan SPP, riwayat kuitansi pelunasan, dan status bebas beasiswa siswa | `finance/student_bills` |
| `[x]` | **Penghitungan Gaji GTK**<br>`#/finance/salaries` | Bendahara Gaji | Seluruh GTK Sekolah | Menghitung slip gaji bulanan: gaji pokok, tunjangan fungsional/wali kelas, jam mengajar, dan potongan | `finance/salaries` |
| `[x]` | **Verifikasi Proposal Kegiatan**<br>`#/finance/proposals` | Pemohon Unit Kerja Lain | Waka Keuangan & Kepala Sekolah | Meninjau proposal dana kegiatan unit (Status: *Diajukan -> Disetujui/Ditolak/Revisi*) | `finance/proposals` |
| `[x]` | **Administrasi Pajak**<br>`#/finance/taxes` | Bendahara Pajak | KPP Pratama & Arsip Keuangan | Pencatatan pungut dan setor pajak belanja barang/jasa (PPh 21, PPh 23, PPN) | `finance/taxes` |
| `[x]` | **Arsip Bukti Transaksi**<br>`#/finance/archives` | Staf Keuangan | Pengawas & Pemeriksa Keuangan | Repositori arsip digital kuitansi, nota kontan, struk transfer, dan faktur belanja | `finance/archives` |
| `[x]` | **Laporan Pertanggungjawaban (LPJ)**<br>`#/finance/reports` | Waka Keuangan | Kepala Sekolah & Komite Sekolah | Laporan pertanggungjawaban realisasi kas semesteran dan tahunan | `finance/lpj` |
| `[x]` | **Publikasi Anggaran**<br>`#/finance/transparency` | Tim Keuangan | Wali Murid & Komite Sekolah | Infografis transparansi pengelolaan dana sekolah sebagai bentuk akuntabilitas publik | `finance/transparency` |

---

### F. WAKA & STAF SARANA PRASARANA (`assignments: 'WAKA_SARPRAS' / 'STAF_SARPRAS'`)
*Tupoksi: Inventarisasi aset sekolah, perawatan gedung/sanitasi, pemeliharaan IT/elektronik, analisis kebutuhan pengadaan, dan manajemen peminjaman fasilitas.*

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Buku Inventaris (Aset)**<br>`#/facilities/inventory` | Tim Sarpras | Warga Sekolah & Pimpinan | Buku induk inventaris barang bergerak/tidak bergerak, kode barang, kondisi (Baik/Rusak), dan lokasi | `facilities/assets` |
| `[x]` | **Data Sarpras Dapodik & Ruang**<br>`#/facilities/dapodik` | Staf Sarpras & Operator | Dapodik Kemdikbud | Data legalitas ruangan kelas, laboratorium, perpustakaan, UKS, dan dimensi bangunan | `facilities/rooms` |
| `[x]` | **Analisis Kebutuhan**<br>`#/facilities/planning` | Unit Kerja & Guru | Waka Sarpras | Rekapitulasi permohonan fasilitas belajar baru dari guru kelas atau unit kerja | `facilities/needs` |
| `[x]` | **Rencana Pengadaan (RKAS Sarpras)**<br>`#/facilities/rkas` | Waka Sarpras | Waka Keuangan & Kepala Sekolah | Pengajuan daftar belanja barang inventaris baru ke dokumen RKAS tahunan sekolah | `facilities/procurement` |
| `[x]` | **Perawatan Gedung & Sanitasi**<br>`#/facilities/maintenance` | Petugas Kebersihan / Teknisi | Warga Sekolah | Log pemeliharaan berkala toilet, sanitasi, perbaikan atap bocor, pengecatan, dan kelistrikan | `facilities/maintenance` |
| `[x]` | **Pengecekan Keamanan Area**<br>`#/facilities/safety` | Petugas Keamanan / Sarpras | Pimpinan Sekolah | Inspeksi keamanan lingkungan: fungsi APAR, kamera CCTV, pagar gerbang, dan mitigasi bahaya | `facilities/safety` |
| `[x]` | **Pemeliharaan Elektronik & IT**<br>`#/facilities/electronics` | Teknisi Sarpras & Tim IT | Pengguna Komputer / Lab | Servis rutin AC kelas, proyektor, komputer laboratorium, mesin absensi, dan printer | `facilities/electronics` |
| `[x]` | **Peminjaman Fasilitas & Ruang**<br>`#/facilities/loans` | Pemohon (Guru/Ekskul/Paguyuban) | Pengelola Fasilitas Sarpras | Mengatur izin penggunaan aula, sound system, proyektor lapangan agar tidak terjadi jadwal bentrok | `facilities/loans` |
| `[x]` | **Penghapusan Aset Rusak**<br>`#/facilities/disposal` | Waka Sarpras | Kepala Sekolah & Yayasan | Penerbitan berita acara pemusnahan atau penghapusan barang rusak berat yang sudah tidak layak pakai | `facilities/disposals` |

---

### G. GURU KELAS / WALI KELAS (`assignments: 'GURU_KELAS_...'`)
*Tupoksi: Pembinaan rombel, pencatatan absensi harian kelas, penilaian sikap/karakter, pengisian data tambahan, dan penerbitan rapor siswa.*

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Absensi Siswa Rombel**<br>`#/guru/student-attendance` | Wali Kelas (Setiap Pagi) | Orang Tua Murid & Kesiswaan | Mencatat kehadiran harian murid kelas (Hadir, Sakit, Izin, Alpa) yang otomatis tampil di dashboard ortu | `attendance_records` |
| `[x]` | **Input Observasi Karakter**<br>`#/guru/observe/:id` | Wali Kelas | Lembar E-Rapor Murid | Menilai perkembangan karakter Islami murid (kejujuran, disiplin, ibadah, gotong royong) | `character_evaluations` |
| `[x]` | **E-Rapor Kelas & Rekap Nilai**<br>`#/guru/classes` | Ditarik dari Guru Mapel & Wali | Wali Murid & Kepala Sekolah | Mengolah ledger nilai rapor akhir semester dan mencetak rapor hasil belajar murid | `classes/{id}/grades` |
| `[x]` | **Data Tambahan E-Rapor**<br>`#/guru/additional` | Wali Kelas | Lembar E-Rapor Murid | Mengisi catatan wali kelas, rekap nilai ekstrakurikuler murid, dan prestasi perlombaan siswa | `classes/{id}/additional` |
| `[x]` | **Riwayat Observasi Siswa**<br>`#/guru/observations` | Wali Kelas | Guru BK & Kepala Sekolah | Jurnal anekdot pengamatan perkembangan perilaku siswa dari waktu ke waktu | `student_observations` |

---

### H. GURU MAPEL & GURU UMUM (`role: 'guru'`)
*Tupoksi: Pelaksanaan KBM mata pelajaran, input nilai formatif/sumatif, penyusunan perangkat ajar, dan portofolio profesional.*

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Presensi Kehadiran Mandiri**<br>`#/attendance` | Guru Mandiri (GPS Check-In) | Personalia & Kepala Sekolah | Check-in dan check-out kehadiran harian berbasis radius geofence sekolah | `attendance_records` |
| `[x]` | **Input Nilai Akademik Mapel**<br>`#/guru/academic` | Guru Pengampu Mata Pelajaran | Wali Kelas & E-Rapor | Input capaian nilai formatif per Tujuan Pembelajaran (TP) dan nilai sumatif (STS/SAS) | `grades/{classId}_{subjectId}` |
| `[x]` | **Upload Perangkat Ajar**<br>`#/curriculum/syllabus` | Guru Mandiri | Waka Kurikulum (Verifikator) | Mengunggah dokumen Modul Ajar dan Alur Tujuan Pembelajaran (ATP) untuk ditinjau | `curriculum/documents` |
| `[x]` | **Portofolio Guru**<br>`#/guru/portfolio` | Guru Mandiri | Guru & Bagian SDM | Menyimpan riwayat ijazah, sertifikat pendidik, karya inovasi, dan sertifikat pelatihan | `guru/portfolio` |
| `[x]` | **Riwayat Pengamatan KBM**<br>`#/guru/observations` | Guru Pengampu | Guru Mandiri | Catatan personal guru terhadap dinamika belajar anak selama jam pelajaran | `guru/observations` |

---

### I. PROGRAM AL-QUR'AN (TIM UMMI & KOORDINATOR UMMI)

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Pemetaan Rombel Ummi**<br>`#/guru/ummi/koord/mapping` | Koordinator Ummi | Guru Ummi & Santri | Memetakan siswa berdasarkan jilid (Jilid 1-6, Al-Qur'an, Ghorib, Tajwid) dan menetapkan guru pengampu | `ummi_classes` *(SSOT)* |
| `[x]` | **Antrean Ujian & Munaqosyah**<br>`#/guru/ummi/koord/exams` | Koordinator Ummi | Guru Penguji & Santri | Memvalidasi santri yang siap ujian kenaikan jilid dan munaqosyah kelulusan tartil | `ummi_exams` |
| `[x]` | **Plotting Guru Penguji Tasmi'**<br>`#/guru/ummi/koord/tasmi` | Koordinator Ummi | Guru Penguji Tasmi' | Menjadwalkan majelis ujian tasmi' hafalan Al-Qur'an dan menunjuk guru penyimak resmi | `ummi_tasmi_schedules` |
| `[x]` | **Rombel Ummi Saya**<br>`#/guru/ummi/classes` | Ditarik dari Pemetaan | Guru Ummi Pengampu | Melihat daftar santri di kelompok halaqah Ummi yang dibimbingnya | `ummi_classes` |
| `[x]` | **Jurnal Harian Jilid**<br>`#/guru/ummi/progress` | Guru Ummi Halaqah | Santri, Koordinator, & Ortu | Mencatat capaian jilid dan halaman mengaji santri setiap pertemuan beserta catatan makhroj/tajwid | `ummi_progress` |
| `[x]` | **Setoran Tahfidz (Juz 30 - 1)**<br>`#/guru/ummi/tahfidz` | Guru Ummi Pembimbing | Santri & Orang Tua | Mencatat setoran hafalan surah/ayat Al-Qur'an santri secara berkala | `ummi_tahfidz` |
| `[x]` | **Hasil Ujian Tasmi'**<br>`#/guru/ummi/tasmi` | Guru Penguji Tasmi' | Koordinator Ummi & Rapor | Menilai kelancaran hafalan, tajwid, dan fashohah santri saat ujian tasmi' terbuka | `ummi_tasmi_results` |

---

### J. TIM PENGEMBANGAN BAHASA INGGRIS (`assignments: 'TIM_B_INGGRIS'`)

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Rombel English Lab**<br>`#/guru/english/classes` | Koordinator English Lab | Guru Pengampu English Lab | Pengelompokan siswa berdasarkan level proficiency bahasa Inggris | `english_classes` |
| `[x]` | **Jurnal Progres Speaking**<br>`#/guru/english/progress` | Guru Pengampu English Lab | Siswa & Wali Murid | Mencatat capaian kosa kata, kelancaran percakapan (*speaking*), dan aktivitas listening murid | `english_progress` |

---

### K. PEMBINA EKSTRAKURIKULER (`assignments: 'GURU_EKSTRA_...'`)

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Program Latihan Ekskul**<br>`#/guru/ekstra/syllabus` | Pembina Ekstrakurikuler | Kesiswaan & Peserta Ekskul | Menyusun target capaian latihan mingguan cabang ekskul selama satu semester | `ekstra/syllabus` |
| `[x]` | **Presensi Peserta Ekskul**<br>`#/guru/ekstra/attendance` | Pembina Ekstrakurikuler | Kesiswaan & Orang Tua | Mencatat kehadiran siswa saat latihan mingguan (Hadir/Izin/Alpa) | `ekstra/attendance` |
| `[x]` | **Nilai E-Rapor Ekskul**<br>`#/guru/extracurriculars` | Pembina Ekstrakurikuler | Wali Kelas & E-Rapor Siswa | Memberikan predikat nilai (Sangat Baik/Baik/Cukup) dan deskripsi capaian bakat untuk dicetak di rapor | `ekstra/grades` |
| `[x]` | **Pemetaan Siswa Berbakat**<br>`#/guru/ekstra/talents` | Pembina Ekstrakurikuler | Waka Kesiswaan | Mendata siswa bertalenta tinggi untuk dibina intensif menuju delegasi lomba (O2SN, FLS2N, dll.) | `ekstra/talents` |

---

### L. TIM IT & SISTEM (`assignments: 'TIM_IT'`)

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Dashboard Operasional IT**<br>`#/it-admin/dashboard` | Telemetri Sistem Realtime | Tim IT & Administrator | Memantau lalu lintas API, kuota Google Drive, integritas database, dan status geofence presensi | Sistem Telemetri |
| `[x]` | **Kelola Pengguna GTK**<br>`#/admin/users` | Tim IT / Waka Humas | GTK Sekolah | Reset password darurat, aktivasi email dinas, dan penguncian akun nonaktif | `users` |
| `[x]` | **Sinkronisasi Dapodik**<br>`#/it-admin/sync` | Tim IT / Operator Sekolah | Manajemen Sekolah | Log riwayat integrasi data siswa, rombel, dan guru dari server lokal ke web | `it_admin/sync_logs` |
| `[x]` | **Backup & Restore Data**<br>`#/it-admin/backup` | Tim IT | Administrator Sistem | Pembuatan berkas cadangan data berkala dan pemulihan darurat sistem | Cloud Backup |
| `[x]` | **Log Audit Sistem**<br>`#/it-admin/logs` | Audit Trail Otomatis | Tim IT & Pimpinan | Merekam aktivitas kritis: siapa yang mengubah nilai, menghapus data, atau mengubah penugasan | `audit_logs` |
| `[x]` | **Infrastruktur Jaringan**<br>`#/it-admin/network` | Tim IT | Teknisi Sekolah | Memantau akses poin Wi-Fi kelas, server CBT lokal, dan bandwidth internet | `it_admin/network` |
| `[x]` | **Integrasi API & CBT**<br>`#/it-admin/integration` | Tim IT | Pihak Ketiga & Ujian Komputer | Manajemen API keys untuk integrasi WhatsApp notifikasi, Google Apps Script, dan CBT | `it_admin/api_keys` |

---

### M. TENAGA KEPENDIDIKAN (`role: 'tendik'`)

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Presensi Kehadiran GPS**<br>`#/attendance` | Staf Tendik Mandiri | Bagian Personalia | Check-in dan check-out presensi harian staf TU, perpus, driver, dan kebersihan | `attendance_records` |
| `[x]` | **Laporan Kinerja Harian**<br>`#/tendik/performance` | Staf Tendik Mandiri | Kepala Tata Usaha & Pimpinan | Log aktivitas harian pegawai: tugas administrasi surat, pelayanan wali murid, atau perbaikan fasilitas | `tendik/performance` |
| `[x]` | **Portofolio Staf Tendik**<br>`#/tendik/portfolio` | Staf Tendik Mandiri | Staf Tendik & SDM | Repositori sertifikat keahlian, SK penugasan, dan dokumen kompetensi tenaga kependidikan | `tendik/portfolio` |

---

### N. ORANG TUA / WALI MURID (`role: 'ortu'`)

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Dashboard Perkembangan Anak**<br>`#/ortu/dashboard` | Wali Kelas & Guru Al-Qur'an | Orang Tua / Wali Murid | Memantau rekap absensi anak harian, capaian jilid Ummi/Tahfidz, catatan guru, dan unduh rapor | Multi-Node Anak |
| `[x]` | **Komunikasi Orang Tua**<br>`#/ortu/dashboard` | Orang Tua Murid | Wali Kelas / Guru | Memberikan tanggapan timbal balik atas catatan bimbingan karakter dari wali kelas | `parent_responses` |
| `[x]` | **Permohonan Izin / Sakit Online**<br>`#/student-affairs/leaves` | Orang Tua Murid | Wali Kelas & Guru Piket | Pengajuan surat permohonan izin/sakit siswa online lengkap dengan lampiran surat dokter | `student_affairs/leaves` |
| `[x]` | **Riwayat Tagihan SPP Siswa**<br>`#/finance/student-bills` | Bendahara Keuangan | Orang Tua Murid | Melihat rincian tagihan SPP per bulan, kuitansi digital, dan status pelunasan | `finance/student_bills` |

---

### O. KOMITE SEKOLAH & PAGUYUBAN KELAS (`role: 'komite'`)

| Status | Fitur & Rute Sistem | Dari Siapa (Producer) | Untuk Siapa (Consumer) | Tujuan & Proses Bisnis | Node SSOT Basis Data |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `[x]` | **Kegiatan Paguyuban**<br>`#/komite/activities` | Pengurus Paguyuban Kelas | Wali Murid Kelas & Sekolah | Dokumentasi notulensi rapat paguyuban kelas dan agenda *parenting* kelas | `komite/activities` |
| `[x]` | **Keuangan Paguyuban**<br>`#/komite/finance-paguyuban` | Bendahara Paguyuban Kelas | Wali Murid Kelas | Laporan kas iuran sukarela paguyuban kelas untuk kegiatan santai murid di kelas | `komite/finance-paguyuban` |
| `[x]` | **Keuangan Komite Sekolah**<br>`#/komite/finance-komite` | Bendahara Komite Sekolah | Pengurus Komite & Sekolah | Laporan dana infaq komite sekolah untuk program bantuan sarana atau kegiatan akbar siswa | `komite/finance-komite` |

---

## IV. MATRIKS BATAS DOMAIN & RESOLUSI SALAH KAMAR (SSOT & DRY BOUNDARIES)

Untuk menjamin sistem bebas dari duplikasi data (*DRY*) dan memiliki satu sumber kebenaran data (*SSOT*), batas kewenangan operasional diatur secara tegas sebagai berikut:

```
+---------------------------------------------------------------------------------------------------------+
| DOMAIN KASUS         | KAMAR KEPUTUSAN / DATA POKOK (SSOT)    | KAMAR EKSEKUSI / DISTRIBUSI HILIR       |
+----------------------+----------------------------------------+-----------------------------------------+
| Beasiswa Murid       | Kesiswaan (#/student-affairs/scholar.) | Keuangan (#/finance/scholarships)       |
|                      | -> Menyeleksi kriteria & SK penerima   | -> Pencairan dana kas & potong SPP BKU  |
+----------------------+----------------------------------------+-----------------------------------------+
| Kesejahteraan GTK    | Personalia (#/personnel/welfare)       | Keuangan (#/finance/salaries & cashbook)|
|                      | -> Menetapkan hak tunjangan/santunan   | -> Membayarkan uang keluar di BKU kas   |
+----------------------+----------------------------------------+-----------------------------------------+
| Modul Ajar Guru      | Guru Mandiri (#/curriculum/syllabus)   | Kurikulum (#/curriculum/syllabus)       |
|                      | -> Mengunggah draft modul ajar         | -> Memverifikasi & memberi status ACC   |
+----------------------+----------------------------------------+-----------------------------------------+
| Supervisi vs PKG     | Kurikulum (#/curriculum/supervision)   | Personalia (#/personnel/evaluations)    |
|                      | -> Observasi klinis pedagogik di kelas | -> Evaluasi tahunan kepatuhan & SKP GTK |
+----------------------+----------------------------------------+-----------------------------------------+
| Ekstrakurikuler      | Rute Definitif: #/guru/ekstra/...      | Kode Mati Dihapus: #/ekskul/...         |
|                      | -> 1 rute tunggal pembina ekskul       | -> Mencegah rute ganda yang membingungkan|
+----------------------+----------------------------------------+-----------------------------------------+
| Entitas Dropdown GTK | module-kit.js: REF_LOADERS.employee    | Steril dari Akun Ortu/Siswa             |
|                      | -> Memuat 53 Guru + 10 Tendik          | -> 372 akun ortu difilter sepenuhnya    |
+----------------------+----------------------------------------+-----------------------------------------+
```

1. **Beasiswa Siswa (Kesiswaan vs Keuangan):**
   * **Kesiswaan** adalah pemilik mandat tunggal penyeleksi kelayakan siswa penerima beasiswa (Yatim, Dhuafa, PIP, Prestasi) pada node `student_affairs/scholarships`.
   * **Keuangan** dilarang mengulang form seleksi kriteria beasiswa dari nol. Keuangan hanya bertindak sebagai pihak pembayar yang mengeksekusi pencairan dana atau memotong buku tagihan SPP siswa pada modul `#/finance/scholarships` berdasarkan daftar yang telah disetujui Kesiswaan.
2. **Kesejahteraan GTK vs Pembukuan Kas (Personalia vs Keuangan):**
   * **Humas & Personalia** mencatat jenis bantuan, santunan duka/sakit, apresiasi, atau tunjangan kepegawaian pada `personnel/welfare`.
   * **Keuangan** mencatat pengeluaran nominal uang kas nyata ke dalam Buku Kas Umum (`finance/ledger`) agar neraca kas sekolah tetap akurat dan seimbang (*balanced*).
3. **Modul Ajar Guru vs Kurikulum (Guru vs Kurikulum):**
   * **Guru** bertindak sebagai *producer* yang mengunggah berkas Modul Ajar/RPP mandiri.
   * **Waka Kurikulum** bertindak sebagai *supervisor/verifier* yang meninjau isi materi dan menyematkan status *ACC / Revisi*.
4. **Supervisi Akademik vs Penilaian Kinerja Guru (Kurikulum vs Personalia):**
   * **Supervisi Akademik (`#/curriculum/supervision`)**: Ditangani Waka Kurikulum / Kepala Sekolah untuk membedah kualitas interaksi mengajar di kelas secara pedagogik.
   * **Penilaian Kinerja Guru/PKG (`#/personnel/evaluations`)**: Ditangani Waka Humas & Personalia untuk penilaian formal angka kredit, kepatuhan disiplin jam kerja, dan kelayakan tunjangan kepegawaian tahunan.
5. **Sterilisasi Entitas Relasi Data (`REF_LOADERS`):**
   * Loader dropdown pada `module-kit.js` dipisahkan secara tegas:
     - `employee`: Khusus GTK aktif (`role !== 'ortu'`). Menjamin form *Kesejahteraan Staf*, *Pelatihan*, dan *Gaji* tidak lagi memuat nama siswa.
     - `teacher`: Khusus Pendidik (`role === 'guru'`, `admin`, `kepsek`). Menjamin form *Jadwal*, *Supervisi*, *Jurnal*, dan *Plotting Ummi* hanya memuat guru pengajar.
     - `student`: Khusus Siswa dari basis data pokok murid.
6. **Kategori Penerimaan & Pengeluaran Kas Keuangan (`AppConfig.FINANCE_CATEGORIES`):**
   * **Pemasukan (Income)**: SPP, Uang Kegiatan, Daftar Ulang, DPP, Buku, Seragam, Extrakurikuler, Catering, Antar Jemput, Lainnya.
   * **Pengeluaran (Expense)**: Kepala Sekolah, Bidang Kurikulum, Bidang Kesiswaan, Bidang Sarana Prasarana, Bidang Humas Personalia Perkaderan, Bidang Keuangan, Honorarium, Donasi.
   * **Implementasi SSOT & DRY**: Seluruh daftar kategori dikonsolidasikan terpusat di `AppConfig.FINANCE_CATEGORIES`. Dropdown kategori pada modal transaksi `ModuleKit` (`#/finance/transactions`) dan modal kasir dashboard keuangan (`#modal-fin-ledger`) beroperasi dinamis mengikuti pilihan Tipe Transaksi (`income` vs `expense`), serta memetakan kode akun jurnal umum secara otomatis melalui `AppConfig.resolveFinanceAccounts()`.

---

## V. ATURAN HAK AKSES BASIS DATA (FIREBASE SECURITY RULES)

Aturan keamanan basis data Firebase Realtime Database diselaraskan dengan arsitektur dua tingkat:
1. **Pembatasan Data Orang Tua**: Akun `ortu` hanya dapat membaca data yang berelasi langsung dengan anaknya (`parentId === auth.uid`) dan dilarang mengakses node internal GTK.
2. **Akses Staf GTK**: Akun terautentikasi internal (`role !== 'ortu'`) memiliki izin baca terhadap node operasional sekolah, dengan izin tulis yang diverifikasi pada tingkat modul aplikasi melalui `ModuleKit.canWrite` dan penugasan unit.
3. **Penerimaan Siswa Baru (`spmb_registrations`)**:
   * Izin Tulis (`.write: "true"`): Terbuka untuk pendaftaran calon siswa publik melalui `spmb.html`.
   * Izin Baca (`.read`): Terbatas untuk seluruh akun staf internal sekolah (`role !== 'ortu'`).

---

## VI. STANDAR PENGEMBANGAN TEKNIS (DEVELOPER GUIDELINES)

1. **Prinsip SSOT & DRY**: Dilarang membuat modul atau node database duplikat untuk entitas yang sama. Semua relasi merujuk pada identitas unik primer (`GTK_...`, `SISWA_...`, `CLASS_...`).
2. **Kerapian Kode**:
   * Bebas dari komentar (*No comments*) di dalam berkas JavaScript, CSS, dan HTML.
   * Bebas dari baris kosong yang tidak diperlukan (*No blank lines*).
   * Dilarang *inline CSS* (`style="..."`) dan *inline event listener* (`onclick="..."`).
   * Dilarang menggunakan parameter *cache busting* (`?v=1.0`).
3. **Integritas Encoding**: Pengolahan berkas wajib menggunakan Python atau Node.js dengan `encoding="utf-8"` secara eksplisit untuk menjaga keutuhan karakter Unicode multibyte.
---

## VII. PANDUAN FITUR KONTEKSTUAL & ALUR KERJA SISTEM (FEATURE GUIDES)

Untuk memastikan seluruh pengguna (Pendidik, Tenaga Kependidikan, Pimpinan, Orang Tua, dan Komite) tidak mengalami kebingungan (*Zero UX Friction*), sistem telah dilengkapi dengan modul panduan kontekstual otomatis (**`FeatureGuides`**) pada seluruh **90 rute navigasi aktif**.

```
+---------------------------------------------------------------------------------------------------+
| [i] Panduan Fitur & Alur Kerja                                                          [Tutup ^] |
| +-------------------------+-----------------------------------+---------------------------------+ |
| | (c) FUNGSI FITUR        | <-> DISTRIBUSI DATA               | (>) CARA PENGGUNAAN             | |
| | Penjelasan tujuan nyata | Dari : [Producer Data]            | Langkah taktis operasional      | |
| | fungsional modul dalam  | Untuk: [Consumer Data]            | tombol, filter, pencarian, dan  | |
| | operasional sekolah.   | Relasi: [Node SSOT & Dampak Hilir]| ekspor laporan.                 | |
| +-------------------------+-----------------------------------+---------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### Karakteristik Desain Panduan Fitur:
1. **100% DRY & Otomatis Terpasang**: Terintegrasi langsung pada `Router.handleRoute()` melalui `FeatureGuides.attach(container, path)` tanpa perlu penulisan kode berulang di setiap halaman modul.
2. **Triad Penjelasan Komprehensif**:
   * **Fungsi Fitur**: Menjawab pertanyaan "Untuk apa tab/modul ini dibuat?".
   * **Distribusi & Alur Data**: Menjawab "Data ini berasal dari siapa, ditujukan untuk siapa, dan node database apa yang dipengaruhi?".
   * **Cara Penggunaan**: Memberikan panduan aksi nyata bagi pengguna (cara filter, cara input, cara ekspor, atau cara validasi).
3. **Ergonomis & Responsif**:
   * Dilengkapi tombol interaktif *Tutup / Buka* (*Collapsible*) yang memungkinkan pengguna yang sudah mahir menyembunyikan panduan untuk menghemat ruang vertikal layar.
   * Dirancang dengan CSS modern bebas inline style, kompatibel dengan layar smartphone (*min-width: 0* guna mencegah *grid blowout*).
