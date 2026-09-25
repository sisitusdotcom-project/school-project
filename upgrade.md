Saya sedang mengembangkan aplikasi manajemen internal sekolah.

## KONDISI APLIKASI SAAT INI

Aplikasi saat ini sudah memiliki role:

* Admin → `admin.js`
* Kepala Sekolah → `kepsek.js`
* Guru → `guru.js`
* Orang Tua → `ortu.js`

Fitur yang sudah ada antara lain:

* Penilaian siswa
* E-Rapor
* Absensi guru

Seluruh data aplikasi akan dipusatkan pada **Firebase Realtime Database (RTDB)**.

Sekarang aplikasi akan dikembangkan menjadi sistem **Multi Management Sekolah** yang lebih luas, bukan lagi hanya sistem penilaian/rapor/absensi.

Modul utama yang akan dikembangkan:

1. Keuangan
2. Kurikulum
3. Kesiswaan
4. Humas & Personalia
5. Sarana & Prasarana

---

# TUGAS UTAMA

Sebelum menulis atau mengubah kode apa pun:

### 1. AUDIT SELURUH ROLE YANG SUDAH ADA

Baca dan pahami terlebih dahulu seluruh implementasi:

* `admin.js`
* `kepsek.js`
* `guru.js`
* `ortu.js`

Jangan hanya melihat nama fungsi atau struktur HTML.

Pelajari:

* pola navigasi
* struktur menu
* role/permission
* autentikasi
* cara mengambil data RTDB
* cara menyimpan data RTDB
* struktur database
* helper/utilitas yang sudah tersedia
* pola CRUD
* validasi
* loading state
* error handling
* modal/form
* tabel/list
* pagination/filter/search jika ada
* dashboard/statistik
* notifikasi
* audit/log jika sudah ada
* cara menentukan akses berdasarkan role
* komunikasi antar halaman/module
* konfigurasi Firebase
* konfigurasi API
* pola penamaan variabel/function
* komponen UI yang sudah digunakan

Cari juga kode yang sebenarnya sudah memiliki fungsi umum tetapi masih ditulis berulang di beberapa file.

**Jangan membuat implementasi baru jika sebenarnya sudah ada helper/function yang dapat digunakan kembali.**

---

# 2. PETAKAN TUPoksi DAN AKSES

Buat pemetaan internal terlebih dahulu mengenai:

| Modul              | Admin | Kepala Sekolah | Guru | Orang Tua |
| ------------------ | ----- | -------------- | ---- | --------- |
| Keuangan           |       |                |      |           |
| Kurikulum          |       |                |      |           |
| Kesiswaan          |       |                |      |           |
| Humas & Personalia |       |                |      |           |
| Sarana-Prasarana   |       |                |      |           |
| Penilaian          |       |                |      |           |
| E-Rapor            |       |                |      |           |
| Absensi            |       |                |      |           |

Jangan mengarang akses secara sembarangan.

Gunakan struktur aplikasi yang sudah ada sebagai dasar, lalu tentukan akses berdasarkan **tupoksi masing-masing role**.

Jika terdapat fungsi yang secara logis membutuhkan kewenangan khusus, pisahkan antara:

* melihat
* membuat
* mengubah
* menghapus
* menyetujui/mengesahkan
* mengelola konfigurasi

Jangan menganggap semua role memiliki CRUD penuh.

---

# 3. BUAT ARSITEKTUR MULTI MANAGEMENT

Tujuan akhirnya adalah aplikasi memiliki struktur management seperti:

### KEUANGAN

Contoh area yang perlu dipertimbangkan:

* Dashboard keuangan
* Pemasukan
* Pengeluaran
* Kas
* Tagihan siswa
* Pembayaran siswa
* Honor/gaji
* Anggaran
* Laporan keuangan
* Rekap transaksi
* Konfigurasi keuangan

### KURIKULUM

* Dashboard kurikulum
* Tahun ajaran
* Semester
* Kurikulum
* Mata pelajaran
* Jadwal pelajaran
* Pembagian tugas mengajar
* Kalender pendidikan
* Program pembelajaran
* Target/capaian pembelajaran
* Rekap penilaian
* E-Rapor
* Laporan kurikulum

### KESISWAAN

* Dashboard siswa
* Data siswa
* Data kelas/rombel
* Kenaikan kelas
* Mutasi siswa
* Kehadiran siswa
* Pelanggaran
* Prestasi
* Kegiatan siswa
* Ekstrakurikuler
* Penilaian karakter
* Alumni
* Laporan kesiswaan

### HUMAS & PERSONALIA

Gabungkan kebutuhan hubungan sekolah dan pengelolaan SDM secara terstruktur.

Contoh:

* Dashboard personalia
* Data guru
* Data tenaga kependidikan
* Jabatan
* Struktur organisasi
* Tupoksi
* Kehadiran pegawai
* Cuti/izin
* Riwayat pekerjaan
* Dokumen pegawai
* Kegiatan humas
* Informasi/pengumuman
* Hubungan orang tua
* Surat/dokumen
* Laporan personalia

### SARANA & PRASARANA

* Dashboard sarpras
* Data aset
* Inventaris
* Ruangan
* Kondisi barang
* Pengadaan
* Pemindahan aset
* Peminjaman
* Pemeliharaan
* Kerusakan
* Penghapusan aset
* Stok
* Laporan sarpras

**Daftar di atas adalah area yang perlu dianalisis, bukan instruksi untuk membuat semua fitur secara membabi buta.**

Sesuaikan dengan struktur aplikasi yang sudah ada dan hindari fitur yang redundan.

---

# 4. SSOT — SINGLE SOURCE OF TRUTH

Ini WAJIB.

Jangan membuat data yang sama disimpan di banyak tempat tanpa alasan.

Contoh:

Data siswa harus mempunyai satu sumber utama.

Data guru harus mempunyai satu sumber utama.

Data kelas/rombel harus mempunyai satu sumber utama.

Data tahun ajaran harus mempunyai satu sumber utama.

Data mata pelajaran harus mempunyai satu sumber utama.

Data transaksi keuangan harus mempunyai satu sumber utama.

Modul lain harus mengambil referensi dari sumber tersebut.

Contoh:

Jika nama siswa berubah:

`Kesiswaan → Data Siswa`

maka modul:

* E-Rapor
* Penilaian
* Absensi
* Keuangan
* Orang Tua

harus menggunakan data siswa dari sumber yang sama atau mekanisme sinkronisasi yang benar.

**Jangan membuat master data siswa baru khusus untuk setiap modul.**

---

# 5. DRY — DON'T REPEAT YOURSELF

Audit seluruh kode untuk menemukan duplikasi.

Jika ada fungsi yang digunakan beberapa role/module, buat shared utility/component.

Contoh area yang sebaiknya dipertimbangkan:

* Firebase initialization
* RTDB read
* RTDB write
* RTDB update
* RTDB delete
* query/filter
* authentication
* role checking
* permission checking
* loading state
* toast/notification
* modal
* confirmation dialog
* form validation
* format currency
* format date
* pagination
* search
* export
* audit log
* error handling

Jangan membuat:

```text
adminLoadStudents()
guruLoadStudents()
kepsekLoadStudents()
ortuLoadStudents()
```

jika sebenarnya logikanya sama.

Gunakan shared function/service dengan parameter seperlunya.

---

# 6. STRUKTUR RTDB

Rancang struktur RTDB yang scalable.

Pisahkan dengan jelas antara:

### MASTER DATA

Contoh konsep:

```text
master/
  students/
  teachers/
  staff/
  classes/
  subjects/
  academicYears/
  semesters/
  rooms/
  assets/
```

### TRANSACTIONAL DATA

Contoh:

```text
finance/
  income/
  expenses/
  invoices/
  payments/
  budgets/

attendance/
assessment/
reportCards/
studentAffairs/
curriculum/
publicRelations/
facilities/
```

Jangan menggunakan struktur hanya berdasarkan halaman.

Database harus mencerminkan **domain data**, bukan struktur UI.

---

# 7. REFERENSI ANTAR DATA

Gunakan ID sebagai referensi.

Contoh:

```text
studentId
teacherId
classId
subjectId
academicYearId
semesterId
assetId
transactionId
```

Hindari menyimpan data yang sama secara penuh di banyak node.

Misalnya jangan:

```text
finance/payments/123/studentName
finance/payments/123/studentClass
finance/payments/123/studentAddress
```

jika informasi tersebut sudah tersedia sebagai master student.

Jika snapshot historis memang diperlukan, jelaskan alasannya dan gunakan hanya pada data yang memang membutuhkan historical snapshot.

---

# 8. SECURITY

Jangan menganggap menyembunyikan menu berdasarkan JavaScript sebagai security.

Pastikan desain mempertimbangkan:

* Firebase Authentication
* role
* permission
* Firebase RTDB Security Rules
* ownership data
* akses berdasarkan user
* validasi server-side/security rules
* prinsip least privilege

Contoh:

Guru tidak boleh mendapatkan akses admin hanya karena seseorang memanggil function JavaScript secara manual.

Orang tua hanya boleh mengakses data anak yang memang terhubung dengan akun mereka.

Admin, kepala sekolah, guru dan orang tua harus mempunyai batas akses yang jelas.

Jika security rules yang ada sekarang belum mampu mendukung struktur baru, **jangan mengabaikannya**. Identifikasi dan perbaiki.

---

# 9. ROLE VS PERMISSION

Jangan hardcode seluruh logika akses di setiap halaman jika bisa dibuat sistem permission terpusat.

Contoh konsep:

```text
role:
  admin
  kepala_sekolah
  guru
  orang_tua
```

dengan permission seperti:

```text
finance.view
finance.manage
finance.approve

curriculum.view
curriculum.manage

students.view
students.manage

facilities.view
facilities.manage
```

Namun jangan membuat sistem permission yang terlalu kompleks jika kebutuhan aplikasi belum memerlukannya.

Gunakan pendekatan yang sederhana tetapi scalable.

---

# 10. NAVIGASI

Buat struktur navigasi yang jelas.

Contoh konsep:

```text
Dashboard

AKADEMIK
├── Kurikulum
├── Penilaian
├── E-Rapor
└── Jadwal

KESISWAAN
├── Data Siswa
├── Kehadiran
├── Karakter
├── Prestasi
└── Kegiatan

KEUANGAN
├── Dashboard
├── Pemasukan
├── Pengeluaran
├── Pembayaran
└── Laporan

PERSONALIA & HUMAS
├── Data Pegawai
├── Kehadiran
├── Cuti/Izin
├── Tupoksi
└── Humas

SARANA & PRASARANA
├── Inventaris
├── Aset
├── Ruangan
├── Pemeliharaan
└── Peminjaman
```

Tetapi jangan langsung menganggap struktur di atas final.

**Analisis struktur aplikasi yang sudah ada terlebih dahulu.**

Pertahankan UX/pola navigasi yang sudah konsisten jika memang masih baik.

---

# 11. JANGAN MERUSAK FITUR LAMA

Ini sangat penting.

Fitur berikut harus tetap bekerja:

* Penilaian siswa
* E-Rapor
* Absensi guru
* Login
* Role admin
* Role kepala sekolah
* Role guru
* Role orang tua

Sebelum melakukan perubahan besar:

1. identifikasi dependency
2. identifikasi data lama
3. identifikasi fungsi yang dipakai banyak modul
4. hindari breaking changes
5. jika perlu migration, buat migration yang aman

Jangan menghapus kode lama hanya karena terlihat tidak digunakan sebelum memastikan dependency-nya.

---

# 12. MIGRATION

Jika struktur RTDB lama tidak cocok dengan arsitektur baru:

* jangan langsung menghapus data lama
* buat strategi migration
* pertahankan backward compatibility bila diperlukan
* pastikan data lama tetap dapat dibaca
* lakukan migration secara bertahap

Jika perlu membuat script migration, buat terpisah dan idempotent.

---

# 13. PERFORMA

RTDB harus digunakan secara efisien.

Hindari:

* membaca seluruh database hanya untuk menampilkan satu halaman
* listener global yang tidak diperlukan
* query berulang
* duplikasi listener
* fetch data yang sama berkali-kali
* nested listener yang berlebihan

Gunakan:

* query terarah
* indexing yang tepat
* cache seperlunya
* shared state/data service bila memang diperlukan
* lazy loading untuk modul besar

Prioritaskan aplikasi tetap cepat pada perangkat mobile.

---

# 14. UI/UX

Gunakan pola UI yang sudah ada.

Jangan membuat setiap modul mempunyai desain berbeda.

Harus ada konsistensi untuk:

* sidebar
* navbar
* card
* table
* modal
* form
* button
* badge/status
* loading
* empty state
* error state
* confirmation
* toast

Jika sudah ada design system/component utility, gunakan kembali.

Jangan membuat CSS yang sama berulang-ulang.

---

# 15. IMPLEMENTASI BERTAHAP

Jangan membuat seluruh 5 management secara asal dalam satu langkah.

Kerjakan secara bertahap:

### FASE 1

Audit:

* seluruh role
* struktur JS
* struktur HTML
* Firebase
* RTDB
* authentication
* security rules
* existing utilities

### FASE 2

Buat arsitektur:

* master data
* shared services
* role/permission
* RTDB structure
* navigation architecture

### FASE 3

Implementasi:

* Keuangan
* Kurikulum
* Kesiswaan
* Humas & Personalia
* Sarana-Prasarana

### FASE 4

Integrasi dengan:

* Penilaian
* E-Rapor
* Absensi
* Orang tua

### FASE 5

Testing:

* role access
* CRUD
* security rules
* data consistency
* mobile
* performance
* regression testing

---

# OUTPUT YANG SAYA INGINKAN DARI ANDA

Sebelum coding besar-besaran, berikan terlebih dahulu hasil audit dan rancangan:

1. Struktur aplikasi saat ini
2. Struktur role saat ini
3. Modul/fitur yang sudah tersedia
4. Duplikasi kode yang ditemukan
5. Shared utility yang sebaiknya dibuat
6. Struktur RTDB saat ini
7. Struktur RTDB yang direkomendasikan
8. Master data apa saja
9. Relasi antar master data
10. Pemetaan role → permission
11. Struktur menu baru
12. Potensi konflik dengan fitur lama
13. Strategi migration jika diperlukan
14. Masalah security yang ditemukan
15. Rencana implementasi bertahap

Setelah rancangan tersebut jelas, baru lakukan implementasi.

---

# PRINSIP WAJIB

Gunakan prinsip:

**SSOT**
Single Source of Truth.

**DRY**
Don't Repeat Yourself.

**Separation of Concerns**
UI, business logic, data access, authentication dan authorization tidak dicampur tanpa alasan.

**Least Privilege**
Role hanya mendapatkan akses yang diperlukan.

**Scalable**
Struktur harus memungkinkan penambahan modul berikutnya tanpa membongkar seluruh aplikasi.

**Backward Compatible**
Fitur lama tetap bekerja.

**Data Integrity**
Tidak boleh terjadi konflik atau duplikasi sumber data.

**Security by Design**
Security bukan hanya menyembunyikan menu.

**Mobile First**
Karena aplikasi akan banyak digunakan melalui HP.

**Best Implementation**
Jika ada pendekatan yang lebih baik daripada instruksi saya, gunakan pendekatan tersebut dan jelaskan alasannya.

Jangan melakukan perubahan arsitektur besar secara diam-diam.

Jika menemukan masalah fundamental pada kode lama, laporkan terlebih dahulu sebelum mengubahnya.
