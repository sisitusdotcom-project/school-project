# Panduan Format Akun & Hak Akses (Cheat Sheet)

Dokumen ini adalah ringkasan (*cheat sheet*) untuk mempermudah Anda mengingat format pembuatan dan *login* masing-masing akun, beserta hak akses (tugas) yang dimilikinya. Semua *password default* untuk akun baru adalah: **`Password123!`**

---

## 1. 🎓 Siswa (Orang Tua / Wali)
*Format Email:* `siswa[ID]@musada.sch.id`

- **Siswa dengan NISN (Normal)**
  - *ID yang dipakai:* NISN
  - *Contoh Email:* `siswa3192042116@musada.sch.id`
  - *Fitur Dasbor:* Perkembangan Anak, Rapor, dan Observasi.

- **Siswa Tanpa NISN (Kosong / Tanda Strip)**
  - *ID yang dipakai:* NIS (No. Induk)
  - *Contoh Email:* `siswa0930@musada.sch.id`
  - *Fitur Dasbor:* Sama seperti siswa normal.

---

## 2. 👨‍🏫 Guru (Tenaga Pendidik Dasar)
*Format Email:* `guru[namatanpagelar]@musada.sch.id`

- **Guru Kelas / Wali Kelas**
  - *Trigger di TSV:* Kolom Tugas Mengajar memuat "Guru Kelas"
  - *Contoh Email:* `gurunurfadhillah@musada.sch.id`
  - *Fitur Dasbor:* Presensi Guru, Absensi Siswa, E-Rapor (Kelas), Nilai Akademik.

- **Guru Mata Pelajaran (PAI, PJOK, dll)**
  - *Trigger di TSV:* Kolom Tugas Mengajar memuat "Guru PAI" / "Guru TIK"
  - *Contoh Email:* `guruanggadwikurniawan@musada.sch.id`
  - *Fitur Dasbor:* Presensi Guru, Input Nilai Akademik, Ekstrakurikuler (jika ada).

---

## 3. 👔 Wakil Kepala (Waka / Admin Khusus)
*Setiap Waka sejatinya adalah GURU, sehingga mereka mewarisi seluruh tab fitur Guru ditambah dengan tab manajemen ekstra.*

- **Waka Kesiswaan** (Contoh: Bapak Furqon)
  - *Trigger di TSV:* Kolom Tugas Tambahan memuat "Kesiswaan" / "Wakil Kepala"
  - *Contoh Email:* `gurufurqon@musada.sch.id`
  - *Fitur Ekstra:* Dasbor Kesiswaan, Data Seluruh Kelas & Siswa, Ekstrakurikuler, Rekap Presensi Sekolah.
  
- **Waka Keuangan**
  - *Trigger di TSV:* Kolom Tugas Tambahan memuat "Keuangan"
  - *Fitur Ekstra:* Dasbor Keuangan (Pembayaran, SPP, Tagihan).

- **Waka Kurikulum**
  - *Trigger di TSV:* Kolom Tugas Tambahan memuat "Kurikulum"
  - *Fitur Ekstra:* Dasbor Kurikulum, Master Mata Pelajaran.

- **Waka Humas & Personalia**
  - *Trigger di TSV:* Kolom Tugas Tambahan memuat "Humas"
  - *Fitur Ekstra:* Kelola Pengguna (Super Admin Semu), Dasbor Personalia, Penugasan Jabatan.

- **Waka Sarpras**
  - *Trigger di TSV:* Kolom Tugas Tambahan memuat "Sarana"
  - *Fitur Ekstra:* Dasbor Sarana & Prasarana.

---

## 4. 👑 Kepala Sekolah
- *Trigger di TSV:* Kolom Jabatan memuat "Kepala Sekolah"
- *Contoh Email:* `gurudhaniharsyahyadi@musada.sch.id`
- *Fitur Dasbor:* **Murni Supervisi.** (Dasbor Kepala Sekolah, Grafik Sekolah, Laporan Kelas, Peringkat/Evaluasi). Tidak memiliki form *input* teknis.

---

## 5. 💻 Tim IT / Operator (Sinkronisasi Data)
- *Trigger di TSV:* Kolom Tugas Tambahan memuat "IT" (Contoh: Ibu Divia Arianti)
- *Contoh Email:* `gurudiviaarianti@musada.sch.id`
- *Fitur Ekstra:* **Sinkronisasi Data** (Bisa melihat tombol *Download* TSV dari Web).

---

## 6. 👮 Tenaga Kependidikan (Staf Non-Guru)
- *Trigger di TSV:* Tabel bagian `TENDIK` (Koperasi, Keamanan, Kebersihan, dll).
- *Contoh Email:* `gurubrilianinda@musada.sch.id`
- *Fitur Dasbor:* Hanya melihat "Beranda" / Halaman Selamat Datang dasar (Tidak melihat form Guru Kelas / Rapor).

---

**Catatan Penamaan Unik (SSOT):**
Semua huruf pada nama diubah menjadi *lowercase* (huruf kecil) dan seluruh karakter/spasi dibuang kecuali susunan nama paling depan (sebelum tanda koma pertama/gelar). Jika ada dua nama yang benar-benar persis sama, sistem berpotensi menganggapnya 1 orang yang sama. Pastikan penulisan nama di TSV konsisten.
