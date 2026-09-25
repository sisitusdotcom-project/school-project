# Matriks Ranah Akses dan Penyajian

Status: 25 September 2026. Dokumen ini adalah sumber kebijakan produk untuk menu, route guard, dan penyajian dashboard. Hak di database tetap ditentukan oleh `database.rules.json`; UI tidak boleh dianggap sebagai kontrol keamanan.

Legenda: **L** = lihat/monitor, **O** = operasi pada data yang ditugaskan, **S** = setujui, **K** = konfigurasi/master, **—** = tidak ditampilkan dan tidak diizinkan.

| Ranah | Admin | Kepala Sekolah | Guru | Orang tua/wali |
| --- | --- | --- | --- | --- |
| Akun, role, penugasan | K | — | — | — |
| Master kelas, siswa, mapel, karakter | K | L | L sesuai kelas | L data anak sendiri |
| Penilaian, e-rapor, observasi | K konfigurasi | L | O kelas/mapel yang ditugaskan | L data anak sendiri; tanggapan sendiri |
| Presensi guru | L/rekap | L | O presensi sendiri | — |
| Presensi siswa | L/rekap | L | O kelas yang ditugaskan | L data anak sendiri |
| Keuangan | L/audit | L, S | — | — |
| Kurikulum (ringkasan) | L | L | L; operasi melalui fitur kelas/e-rapor | — |
| Kesiswaan (ringkasan) | L | L | L sesuai penugasan kelas | — |
| Personalia & humas | L/audit akun | L | — | — |
| Sarpras | L/audit | L | — | — |

## Yang benar-benar tersedia saat ini

| Peran | Menu/fungsi aktif |
| --- | --- |
| Admin | Pengguna, penugasan, kelas & siswa, mata pelajaran, indikator karakter, rekap presensi. |
| Kepala sekolah | Dashboard sekolah, laporan kelas, serta lima dashboard ringkasan lintas unit tanpa pengubahan data. |
| Guru | Presensi diri, presensi siswa, kelas/e-rapor, nilai akademik, data rapor tambahan, dan observasi. |
| Orang tua/wali | Perkembangan anak dan tanggapan pada data anak yang terhubung ke akunnya. |
| Keuangan/Kurikulum/Kesiswaan/Personalia/Sarpras | Baru dashboard ringkasan. CRUD domain, approval, dokumen, ekspor, dan audit trail belum diaktifkan. |

## Batas SSOT

Sampai migrasi disetujui, node fitur lama adalah sumber aktif: `students`, `classes`, `subjects`, dan data e-rapor/presensi lama. Dashboard baru hanya membaca referensi tersebut atau node domain yang telah ada; tidak boleh membuat salinan master baru.

Target sesudah migrasi adalah `master/students`, `master/employees`, `master/classes`, `master/subjects`, `master/academicYears`, `master/semesters`, `master/rooms`, dan `master/assets`. Transaksi hanya menyimpan ID referensi. Contohnya tagihan, prestasi, dan pelanggaran menyimpan `studentId`, bukan `studentName`; nama ditampilkan dengan lookup ke master.

`users/{uid}` adalah identitas/login, bukan direktori pegawai. Hubungkan dengan `employeeId` saat CRUD personalia dibangun, agar profil kepegawaian tidak disalin sebagai data akun.

## Ketentuan penugasan unit

`assignments` saat ini hanya label penugasan yang dapat diubah admin. Ia **bukan** role dan tidak boleh memperluas akses seorang guru ke keuangan, personalia, atau sarpras. Untuk mengaktifkan operator unit diperlukan rilis terpisah: role unit yang eksplisit atau custom claims, indeks penugasan yang dapat diverifikasi Rules, serta pengujian Firebase Emulator. Sampai itu ada, menu unit yang tidak sesuai role dasar tidak ditampilkan.

## Kesenjangan yang masih harus diimplementasikan

1. CRUD tervalidasi per domain, dengan audit log dan approval server-side.
2. Rules berbasis kepemilikan kelas/mapel untuk membaca dan menulis data guru, bukan hanya guard JavaScript.
3. Migrator idempoten dari node lama ke master kanonik, lalu perubahan rules dan query per domain.
4. Test Firebase Emulator untuk empat role dan regresi e-rapor/presensi.

