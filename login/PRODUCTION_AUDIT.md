# Audit Produksi — Multi Management Sekolah

Status audit: 25 September 2026. Ruang lingkup: aplikasi pada `login/`, Firebase Authentication, Firebase Realtime Database (RTDB), serta perubahan yang belum dikomit.

## Ringkasan keputusan

Implementasi saat ini telah membagi kode per peran dan menambahkan dasbor ringkasan untuk lima domain manajemen. Namun, ini **belum merupakan implementasi CRUD penuh untuk lima domain**. Modul baru sengaja diperlakukan sebagai fase pondasi/read-only sampai model data, aturan akses berbasis unit, dan migrasi disetujui. Fitur lama tetap memakai node RTDB lama dan tidak dipindahkan pada audit ini.

Aturan RTDB sebelumnya memiliki `.read: auth != null` di akar. Karena aturan RTDB bersifat cascading, aturan itu memberi seluruh pengguna terautentikasi akses baca ke semua node dan membatalkan pembatasan pada node anak. Aturan tersebut telah dihapus. Akses daftar `users` kini hanya untuk admin; pengguna lain hanya dapat membaca profilnya sendiri. Pengguna juga tidak lagi dapat mengubah `role` atau `assignments` sendiri; mereka hanya dapat memperbarui `photoURL` miliknya.

## Struktur aplikasi saat ini

| Area | Implementasi aktif |
| --- | --- |
| Bootstrap, hash routing, sidebar | `public/assets/js/app.js`, `router.js`, `auth.js` |
| Konfigurasi dan navigasi role | `public/assets/js/app-config.js` |
| Permission deklaratif | `public/assets/js/permissions.js` |
| Data access | `public/assets/js/db.js` |
| Admin | pengguna, kelas/siswa, mapel, karakter, pengaturan, penugasan |
| Guru | presensi guru/siswa, penilaian karakter, nilai akademik, e-rapor, observasi |
| Kepala sekolah | dashboard dan laporan kelas |
| Orang tua | perkembangan anak dan tanggapan orang tua |
| Modul baru | dasbor ringkasan Keuangan, Kurikulum, Kesiswaan, Personalia, Sarpras |

`management.js` berisi prototipe CRUD yang tidak diregistrasikan oleh router aktif dan tidak lagi dimuat oleh halaman produksi. Ia bukan jalur produksi dan tidak boleh diaktifkan sebelum kontrol akses berbasis unit serta validasi data selesai.

## Pemetaan akses

Legenda: V = lihat, K = kelola data operasional, S = setujui/monitor, - = tanpa akses.

| Modul | Admin | Kepala Sekolah | Guru | Orang Tua |
| --- | --- | --- | --- | --- |
| Keuangan | K, konfigurasi | V, S | - | - |
| Kurikulum | konfigurasi/master | V, S | K pada kelas/mapel penugasannya | - |
| Kesiswaan | master, konfigurasi | V, S | K pada kelas/penugasannya | V data anak sendiri |
| Humas & Personalia | K | V, S | V diri sendiri/permintaan izin | - |
| Sarpras | K | V, S | - | - |
| Penilaian & E-Rapor | konfigurasi | V, S | K pada kelas/penugasannya | V data anak sendiri |
| Absensi | konfigurasi/rekap | V, S | presensi diri dan kelas penugasannya | V rekap anak sendiri |

Penugasan unit (`assignments`) adalah tambahan cakupan kerja, bukan role baru. Nilainya harus hanya dapat ditulis admin. Tahap berikutnya perlu menyimpan penugasan sebagai map, misalnya `assignments: { curriculum: true }`, agar dapat divalidasi langsung oleh RTDB Rules.

Rincian penyajian per role, daftar fitur yang benar-benar aktif, dan fitur yang belum boleh diklaim tersedia ada pada `ROLE_SCOPE_MATRIX.md`. Penugasan sekarang tidak lagi menambah menu di luar hak role dasar; sebelumnya akun guru yang diberi label unit tertentu dapat melihat menu yang lalu ditolak oleh route guard.

## SSOT dan struktur RTDB target

Node lama tetap menjadi sumber aktif hingga migrasi diselesaikan. Target SSOT yang disetujui sebelum CRUD baru adalah:

```text
master/
  students/{studentId}
  employees/{employeeId}
  classes/{classId}
  subjects/{subjectId}
  academicYears/{academicYearId}
  semesters/{semesterId}
  rooms/{roomId}
  assets/{assetId}
finance/
  ledger/{transactionId}
  invoices/{invoiceId}
  payments/{paymentId}
  budgets/{budgetId}
curriculum/
  schedules/{scheduleId}
  teachingAssignments/{assignmentId}
studentAffairs/
  attendance/{attendanceId}
  achievements/{achievementId}
  violations/{violationId}
personnel/
  leaveRequests/{requestId}
  announcements/{announcementId}
facilities/
  maintenance/{maintenanceId}
  loans/{loanId}
auditLogs/{logId}
```

Semua transaksi memakai ID referensi seperti `studentId`, `employeeId`, `classId`, `subjectId`, dan `assetId`. Nama siswa atau pegawai tidak disalin ke transaksi kecuali snapshot historis eksplisit (misalnya nama penerima pada kuitansi yang sudah diterbitkan), dengan nama field `studentSnapshot` dan alasan dokumenter.

## Relasi utama

* `students.classId → classes/{classId}` dan `students.parentId → users/{uid}`.
* `classes.teacherId` dan `classes.subjectTeachers/{subjectId} → users/{uid}`.
* `finance.invoices.studentId → students/{studentId}`; pembayaran mengacu ke `invoiceId`.
* Penilaian, absensi, prestasi, dan pelanggaran selalu mengacu ke `studentId`, `classId`, tahun ajaran, dan semester.
* Aset mengacu ke `roomId`; pemeliharaan/peminjaman mengacu ke `assetId`.
* Pegawai harus memakai satu `employeeId` yang dapat ditautkan ke `users/{uid}` bila memiliki akun, bukan salinan profil di beberapa domain.

## Temuan audit

| Prioritas | Temuan | Dampak | Status |
| --- | --- | --- | --- |
| Kritis | Hak baca global RTDB untuk semua user login | Orang tua dapat membaca data lintas siswa dan data keuangan | Diperbaiki di `database.rules.json` |
| Kritis | Pengguna dapat menulis seluruh profilnya sendiri | Eskalasi role/assignment | Diperbaiki; self-write dibatasi untuk `photoURL` |
| Tinggi | `management.js` menduplikasi modul dan berisi CRUD yang tidak terhubung ke router | Risiko dua implementasi dan dua sumber data bila diaktifkan | Tidak diaktifkan; perlu dipecah atau dihapus pada PR khusus setelah persetujuan |
| Tinggi | `master/*` diperkenalkan, sementara fitur aktif masih memakai node lama (`students`, `classes`, `subjects`) | Dua SSOT | Belum ada data baru ditulis ke `master/*`; migrasi wajib sebelum aktivasi CRUD |
| Tinggi | Data transaksi prototipe menyimpan `studentName` | Data referensi mudah basi | Target schema menggunakan `studentId`; snapshot hanya untuk dokumen final |
| Sedang | Permission JavaScript belum setara dengan RTDB Rules berbasis penugasan | Menu dapat disembunyikan tetapi akses tidak terjamin bila rules salah | Rules tetap least privilege berbasis role; penugasan berbasis map diperlukan pada fase berikutnya |
| Sedang | Banyak renderer menyuntikkan data RTDB ke `innerHTML` | Risiko XSS bila data tidak tervalidasi | Tambahkan helper escaping dan validasi skema sebelum membuka CRUD untuk input pengguna luas |
| Sedang | Tidak ada test runner/emulator Firebase yang terkonfigurasi | Akses rules dan regresi belum otomatis | Checklist manual dan Firebase Emulator test perlu ditambahkan sebelum deploy CRUD |

## Duplikasi dan utilitas bersama

Yang sudah tepat untuk dipakai ulang: `DB` sebagai data-access layer, `AppConfig` untuk role/nav, `Router`, serta `PermissionManager`. Jangan menambah inisialisasi Firebase atau helper RTDB baru per modul.

Yang perlu dibuat pada fase implementasi berikutnya: `escapeHtml`, pembuat toast/error state, dialog konfirmasi, validator skema payload, guard `requirePermission`, logger audit, pagination/query service, dan renderer tabel/form yang aman. `management.js` tidak boleh menjadi utility bersama karena mencampur UI, bisnis, dan akses data dalam satu file.

## Strategi migrasi aman

1. Backup RTDB dan catat jumlah record setiap node lama.
2. Tetapkan node kanonik secara tertulis; untuk fase ini node lama tetap kanonik agar e-rapor, penilaian, dan absensi tidak rusak.
3. Tambahkan migrator terpisah yang idempotent, memakai `migrationVersion` dan hanya menyalin record yang belum termigrasi.
4. Validasi jumlah dan referensi ID hasil migrasi; jangan menghapus node lama.
5. Lakukan dual-read terbatas dengan fallback node lama, lalu pindahkan satu domain per rilis.
6. Ubah Rules dan indeks bersamaan dengan domain yang dipindahkan. Hapus fallback hanya setelah audit data dan masa observasi.

## Rencana implementasi sebelum CRUD domain dibuka

1. Tambahkan test Firebase Emulator untuk admin, kepsek, guru, dan orang tua; khususnya ownership anak dan larangan privilege escalation.
2. Formalisasikan `assignments` sebagai map dan terapkan Rules per domain/aksi.
3. Tetapkan SSOT master dan migrator idempotent untuk satu domain prioritas (disarankan Kesiswaan).
4. Tambahkan validasi payload, escape output, audit log, loading/error/toast standar.
5. Implementasikan CRUD satu domain, uji mobile dan regresi fitur lama, lalu lanjut domain berikutnya.

## Checklist commit/deploy saat ini

* Validasi sintaks semua JavaScript.
* Validasi JSON Rules.
* Uji manual login empat role dan rute lama: admin, guru, kepsek, orang tua.
* Publish Rules RTDB bersamaan dengan kode; perubahan file lokal saja tidak mengamankan database produksi.
* Jangan aktifkan atau mengandalkan CRUD dalam `management.js` pada rilis ini.
