const FeatureGuides = {
  items: {
    '#/dashboard': {
      func: 'Ringkasan eksekutif seluruh metrik penting madrasah (total murid, kehadiran GTK, keuangan, dan status operasional).',
      from: 'Sistem Terpadu (Agregasi Seluruh Unit)',
      to: 'Kepala Sekolah & Seluruh Dewan Guru / Staf',
      rel: 'Multi-Node Data (attendance_records, finance/ledger, students, classes)',
      usage: 'Pantau kartu metrik utama dan grafik harian untuk evaluasi cepat kondisi madrasah.'
    },
    '#/attendance': {
      func: 'Pencatatan kehadiran mandiri pendidik dan tenaga kependidikan berbasis titik koordinat radius sekolah (geofence GPS).',
      from: 'GTK Mandiri (Smartphone / Perangkat Guru)',
      to: 'Bagian Personalia & Kepala Sekolah',
      rel: 'attendance_records (Digunakan untuk perhitungan disiplin, tunjangan, dan slip gaji)',
      usage: 'Pastikan GPS perangkat aktif, klik tombol Masuk saat tiba di sekolah dan Pulang saat selesai bertugas.'
    },
    '#/admin/users': {
      func: 'Manajemen akun login, pemeliharaan kredensial email dinas, reset password, dan status aktif seluruh warga sekolah.',
      from: 'Waka Humas & Personalia / Tim IT',
      to: 'Seluruh GTK & Orang Tua Murid',
      rel: 'Node users (SSOT Kredensial & Autentikasi Firebase)',
      usage: 'Gunakan filter peran untuk mencari akun. Klik ikon pensil untuk mereset kata sandi atau memperbarui data akun.'
    },
    '#/admin/assignments': {
      func: 'Matriks & plotting penugasan struktural dua tingkat (Waka, Staf Unit, Tim Khusus, Wali Kelas, Pembina Ekskul) tanpa duplikasi akun.',
      from: 'Waka Humas & Personalia / Kepala Sekolah',
      to: 'Seluruh Pegawai GTK (Menentukan menu sidebar yang aktif)',
      rel: 'users/{id}/assignments & unitFlags (SSOT Pembagian Tugas & Hak Akses Menu)',
      usage: 'Pilih tab unit untuk memfilter personil. Klik tombol Atur Penugasan untuk mencentang tugas tambahan guru/tendik.'
    },
    '#/personnel/data': {
      func: 'Buku induk profil kepegawaian resmi GTK (NIP, NUPTK, status kepegawaian, riwayat pendidikan, dan nomor kontak).',
      from: 'Staf Personalia & GTK Mandiri',
      to: 'Arsip Sekolah, Yayasan, dan Kepala Sekolah',
      rel: 'personnel/directory (Terkoneksi dengan data penggajian dan profil dinas)',
      usage: 'Klik Tambah untuk mendaftarkan biodata staf baru, atau klik ikon edit untuk memperbarui pangkat/kontak.'
    },
    '#/admin/attendance': {
      func: 'Monitoring rekapitulasi kehadiran realtime seluruh guru dan karyawan sekolah.',
      from: 'Sistem Presensi GPS GTK',
      to: 'Waka Humas & Personalia serta Kepala Sekolah',
      rel: 'attendance_records & personnel/evaluations (Dasar penilaian kedisiplinan kerja)',
      usage: 'Pilih tanggal atau bulan untuk mengecek jam kedatangan, keterlambatan, dan status kehadiran staf.'
    },
    '#/personnel/evaluations': {
      func: 'Penilaian Kinerja Guru (PKG) tahunan dengan rubrik 3 pilar: Pedagogik, Kepribadian, dan Profesional.',
      from: 'Kepala Sekolah & Asesor Penilai',
      to: 'Guru yang Dinilai & Arsip Kepegawaian',
      rel: 'personnel/evaluations (Otomatis menghasilkan skor akumulatif dan predikat mutu)',
      usage: 'Pilih nama guru yang dinilai, isi skor 1-4 pada setiap pilar instrumen, dan simpan untuk menerbitkan SKP.'
    },
    '#/personnel/training': {
      func: 'Pelacakan keikutsertaan workshop, seminar, dan portofolio sertifikat pengembangan keprofesian berkelanjutan.',
      from: 'Guru Mandiri & Bagian SDM',
      to: 'GTK & Arsip Sekolah (Khusus: own: true)',
      rel: 'personnel/training (Riwayat pengembangan kompetensi guru)',
      usage: 'Guru mengunggah sertifikat dan jam pelatihan miliknya; Waka Personalia dapat memvalidasi seluruh berkas.'
    },
    '#/personnel/welfare': {
      func: 'Penetapan hak santunan sosial GTK (tunjangan duka, santunan sakit, bantuan melahirkan, dan apresiasi).',
      from: 'Waka Humas & Personalia',
      to: 'GTK Penerima & Bendahara Keuangan',
      rel: 'finance/ledger (Status Dicairkan Keuangan otomatis memposting uang keluar ke BKU)',
      usage: 'Pilih pegawai penerima, isi nominal hak santunan. Jika status diset Dicairkan, kas pengeluaran otomatis tercatat di BKU.'
    },
    '#/personnel/publications': {
      func: 'Papan pengumuman digital madrasah untuk edaran resmi, hari libur, dan jadwal kegiatan penting.',
      from: 'Tim Humas Madrasah',
      to: 'Seluruh Warga Sekolah (Guru, Tendik, Orang Tua)',
      rel: 'personnel/announcements (Tampil di dashboard publik/internal)',
      usage: 'Klik Tambah Informasi untuk mempublikasikan berita atau surat edaran sekolah.'
    },
    '#/personnel/complaints': {
      func: 'Layanan terpadu penerimaan aspirasi, masukan, dan pengaduan dari wali murid serta masyarakat umum.',
      from: 'Wali Murid / Masyarakat (Publik)',
      to: 'Tim Humas & Kepala Sekolah',
      rel: 'personnel/complaints (Pelacak alur tindak lanjut: Baru -> Diproses -> Selesai)',
      usage: 'Tinjau tiket aduan yang masuk, perbarui status penanganan, dan tuliskan catatan solusi tindak lanjut.'
    },
    '#/personnel/partnerships': {
      func: 'Pencatatan kemitraan strategis kelembagaan dengan instansi eksternal (Puskesmas, Polsek, Bank, Universitas).',
      from: 'Tim Humas Madrasah',
      to: 'Pihak Mitra & Pimpinan Madrasah',
      rel: 'personnel/partnerships & personnel/documents (Arsip legal MoU)',
      usage: 'Tambahkan data MoU, nama instansi mitra, ruang lingkup program, dan masa berlaku kemitraan.'
    },
    '#/personnel/documents': {
      func: 'Repositori digital arsip surat resmi, SK pengangkatan, piagam kerja sama, dan dokumen kelembagaan.',
      from: 'Staf Administrasi Humas',
      to: 'Arsiparis & Pimpinan Sekolah',
      rel: 'personnel/documents (Penyimpanan tautan cloud dokumen resmi)',
      usage: 'Pilih kategori surat/SK, cantumkan nomor dokumen, dan tempel tautan file Google Drive/PDF.'
    },
    '#/personnel/events': {
      func: 'Koordinasi manajemen kepanitiaan dan timeline acara besar sekolah (Milad, Wisuda, Baitul Arqom, Pawai).',
      from: 'Panitia Pelaksana & Tim Humas',
      to: 'Seluruh Warga Sekolah',
      rel: 'personnel/events (Terkoneksi dengan proposal dana di Keuangan)',
      usage: 'Daftarkan nama kegiatan, susunan ketua panitia, jadwal pelaksanaan, dan target capaian acara.'
    },
    '#/admin/classes': {
      func: 'Master pembagian 16 rombel (1A-6B), plotting wali kelas, serta eksekusi kenaikan kelas dan kelulusan massal.',
      from: 'Waka Kurikulum & Administrator',
      to: 'Wali Kelas, Seluruh Dewan Guru, dan Operator Sistem',
      rel: 'classes & student_promotions (SSOT Rombel & Kenaikan Kelas)',
      usage: 'Kelola wali kelas dan mapel khusus. Pada akhir tahun, gunakan tombol Kenaikan Kelas untuk mempromosikan murid secara massal.'
    },
    '#/admin/subjects': {
      func: 'Master struktur kurikulum mata pelajaran (Agama, Umum, Muatan Lokal, Kekhasan) dan beban jam ajar.',
      from: 'Waka Kurikulum',
      to: 'Guru Mapel & Lembar E-Rapor',
      rel: 'subjects (SSOT Daftar Mata Pelajaran untuk Ledger Nilai)',
      usage: 'Atur daftar mata pelajaran, kelompok kategori, dan urutan tampilan pada cetak lembar rapor.'
    },
    '#/curriculum/schedules': {
      func: 'Penyusunan jadwal tatap muka mingguan per kelas, alokasi jam pelajaran, dan plotting guru pengampu.',
      from: 'Staf Kurikulum',
      to: 'Guru Pengajar, Siswa, dan Petugas Piket',
      rel: 'curriculum/schedules (Rujukan keterlaksanaan KBM harian)',
      usage: 'Gunakan filter kelas atau hari untuk memetakan guru pengajar pada setiap jam sesi pelajaran.'
    },
    '#/curriculum/syllabus': {
      func: 'Pengumpulan, telaah, dan alur persetujuan (ACC) Perangkat Ajar & Modul Ajar guru oleh Waka Kurikulum.',
      from: 'Guru Pengampu Mata Pelajaran / Kelas',
      to: 'Waka Kurikulum (Verifikator) & Guru Mandiri',
      rel: 'curriculum/documents (Status: Draft -> Diajukan -> Disetujui/Perlu Revisi)',
      usage: 'Guru mengunggah tautan modul ajar miliknya; Kurikulum memeriksa berkas dan menyematkan status ACC atau catatan revisi.'
    },
    '#/curriculum/monitoring': {
      func: 'Pemantauan keterlaksanaan KBM harian, ketepatan waktu masuk guru, dan penanganan jam kelas kosong.',
      from: 'Petugas Piket Kurikulum',
      to: 'Guru Pengajar & Kepala Sekolah',
      rel: 'curriculum/monitoring (Evaluasi kepatuhan jadwal ajar)',
      usage: 'Petugas piket mencatat kesesuaian mengajar guru per jam sesi atau mengisi guru pengganti bila ada yang berhalangan.'
    },
    '#/curriculum/questions': {
      func: 'Bank soal terpusat: pengumpulan naskah asesmen sumatif, kisi-kisi soal, dan pedoman rubrik jawaban.',
      from: 'Guru Penyusun Soal',
      to: 'Kurikulum & Tim Penggandaan Asesmen',
      rel: 'curriculum/questions (Repositori arsip ujian sekolah)',
      usage: 'Unggah kisi-kisi dan naskah soal per mata pelajaran menjelang pekan STS (Tengah Semester) atau SAS (Akhir Semester).'
    },
    '#/curriculum/journals': {
      func: 'Jurnal harian mengajar guru: rekapitulasi materi pokok yang selesai diajarkan dan dinamika belajar siswa.',
      from: 'Guru Pengajar Sesi KBM',
      to: 'Kurikulum & Kepala Sekolah (Scoping: own: true)',
      rel: 'curriculum/journals (Bukti fisik pelaksanaan pembelajaran)',
      usage: 'Isi ringkasan materi ajar dan catatan kelas setelah menyelesaikan jam sesi pembelajaran di kelas.'
    },
    '#/curriculum/supervision': {
      func: 'Instrumen supervisi klinis akademik: observasi proses belajar mengajar guru di dalam kelas.',
      from: 'Kepala Sekolah & Waka Kurikulum',
      to: 'Guru yang Disupervisi',
      rel: 'curriculum/supervision (Rekomendasi peningkatan mutu mengajar)',
      usage: 'Asesor mengisi catatan observasi saat meninjau interaksi belajar di kelas dan memberikan catatan refleksi.'
    },
    '#/curriculum/grades': {
      func: 'Database nilai terpusat yang ditarik otomatis dari E-Rapor untuk memantau ketercapaian KKTP seluruh rombel.',
      from: 'E-Rapor Guru Mapel & Wali Kelas',
      to: 'Waka Kurikulum & Kepala Sekolah',
      rel: 'grades/{classId}_{subjectId} (Monitoring capaian belajar lintas kelas)',
      usage: 'Pilih rombel dan mata pelajaran untuk melihat sebaran nilai formatif dan sumatif siswa secara menyeluruh.'
    },
    '#/curriculum/evaluations': {
      func: 'Kebijakan sistem penilaian madrasah (bobot formatif, sumatif tengah semester, dan sumatif akhir semester).',
      from: 'Waka Kurikulum',
      to: 'Seluruh Dewan Guru',
      rel: 'curriculum/assessment_policies (Acuan formula penghitungan rapor)',
      usage: 'Tetapkan formula pembobotan nilai rapor dan panduan kriteria kenaikan kelas bagi dewan guru.'
    },
    '#/student-affairs/ppdb': {
      func: 'Penerimaan Siswa Baru (SPMB / PPDB): verifikasi berkas pendaftaran online, konfirmasi biaya formulir, dan mutasi.',
      from: 'Calon Wali Murid Publik (via spmb.html)',
      to: 'Panitia PPDB Kesiswaan & Bendahara',
      rel: 'spmb_registrations (Pintu tunggal pendaftaran siswa baru)',
      usage: 'Verifikasi berkas calon santri baru, cek bukti transfer formulir, dan ubah status menjadi Diterima / Menunggu Berkas.'
    },
    '#/student-affairs/mpls': {
      func: 'Masa Pengenalan Lingkungan Sekolah: perencanaan orientasi, pembagian gugus siswa baru, dan mentor pendamping.',
      from: 'Panitia MPLS Kesiswaan',
      to: 'Siswa Baru Kelas 1 & Guru Pembimbing',
      rel: 'student_affairs/mpls (Pengelompokan gugus dan jadwal materi)',
      usage: 'Petakan siswa baru ke dalam Gugus 1-4, tentukan guru mentor pendamping, dan pantau adaptasi lingkungan santri.'
    },
    '#/student-affairs/rules': {
      func: 'Pencatatan pelanggaran disiplin siswa, akumulasi poin pembinaan, dan alur penanganan kekerasan/bullying (TPPK).',
      from: 'Guru Piket, Wali Kelas, dan Tim TPPK',
      to: 'Siswa, Wali Kelas, Guru BK, dan Orang Tua',
      rel: 'student_affairs/violations (Tindak lanjut: SP1, Panggilan Ortu, Bimbingan BK)',
      usage: 'Catat kronologi pelanggaran atau insiden TPPK, pilih tingkat keparahan, dan tetapkan bentuk pembinaan.'
    },
    '#/student-affairs/leaves': {
      func: 'Layanan permohonan izin/sakit siswa online lengkap dengan lampiran surat dokter dan dispensasi perlombaan.',
      from: 'Orang Tua Murid / Wali Kelas',
      to: 'Guru Piket, Wali Kelas, dan Kesiswaan',
      rel: 'student_affairs/leaves (Terkoneksi langsung ke absensi siswa harian)',
      usage: 'Orang tua mengajukan permohonan izin dari dashboard; guru piket/wali kelas memverifikasi dan menyetujui surat izin.'
    },
    '#/student-affairs/achievements': {
      func: 'Pendataan prestasi juara perlombaan siswa (akademik, seni, olahraga) di tingkat kecamatan hingga internasional.',
      from: 'Guru Pembina Lomba & Wali Kelas',
      to: 'Siswa, Tim Humas, dan Lembar E-Rapor Siswa',
      rel: 'student_affairs/achievements (Terintegrasi 1-klik ke lembar catatan rapor guru/additional)',
      usage: 'Input juara lomba siswa. Data prestasi yang tersimpan otomatis muncul di form E-Rapor wali kelas untuk disisipkan.'
    },
    '#/student-affairs/scholarships': {
      func: 'Pintu tunggal seleksi kelayakan beasiswa siswa (Yatim, Dhuafa, PIP Kemdikbud, Prestasi) dan kuota penerima.',
      from: 'Wali Kelas & Tim Kesiswaan',
      to: 'Siswa Penerima & Waka Keuangan',
      rel: 'student_affairs/scholarships (SSOT Kesiswaan untuk dicairkan di Keuangan)',
      usage: 'Verifikasi berkas kelayakan siswa dan setujui status beasiswa. Bendahara hanya dapat mencairkan siswa yang di-ACC di sini.'
    },
    '#/student-affairs/alumni': {
      func: 'Tracer study data kelulusan santri, jalur kelulusan, dan penelusuran studi lanjutan ke jenjang SMP/MTs/Pesantren.',
      from: 'Tim Kesiswaan / Alumni',
      to: 'Sekolah, Yayasan, dan Publik',
      rel: 'student_affairs/alumni (Rekam jejak alumni dan profil lulusan)',
      usage: 'Tambahkan data lulusan kelas 6, tahun lulus, sekolah lanjutan yang dituju, dan catatan prestasi alumni.'
    },
    '#/admin/characters': {
      func: 'Master instrumen indikator profil pelajar Muhammadiyah dan sikap Islami (kejujuran, disiplin, ibadah, santun).',
      from: 'Waka Kesiswaan',
      to: 'Seluruh Wali Kelas untuk E-Rapor',
      rel: 'master/character_indicators (Format lampiran rapor karakter)',
      usage: 'Atur butir-butir indikator akhlak yang akan dinilai oleh setiap wali kelas pada sesi observasi harian.'
    },
    '#/admin/extracurriculars': {
      func: 'Master cabang ekstrakurikuler resmi sekolah, kuota rombel, jadwal latihan mingguan, dan plotting pembina.',
      from: 'Waka Kesiswaan',
      to: 'Pembina Ekskul, Wali Kelas, dan Siswa',
      rel: 'master/extracurriculars (Terkoneksi ke nilai E-Rapor ekskul)',
      usage: 'Daftarkan cabang ekskul (HW, Tapak Suci, Panahan, dll.), plotting guru pembina, dan tentukan target capaian.'
    },
    '#/finance/rkas': {
      func: 'Penyusunan Rencana Kegiatan & Anggaran Sekolah (RKAS) per komponen belanja serta pemantauan serapan kas.',
      from: 'Waka Keuangan & Tim Manajemen',
      to: 'Kepala Sekolah, Yayasan, dan Bendahara',
      rel: 'finance/rkas (Kontrol pagu belanja agar tidak defisit anggaran)',
      usage: 'Susun alokasi anggaran belanja per pos program. Sistem menghitung sisa pagu anggaran secara otomatis.'
    },
    '#/finance/transactions': {
      func: 'Jurnal harian penerimaan dan pengeluaran kas sekolah dengan nomor bukti nota kontan / transfer.',
      from: 'Bendahara Sekolah',
      to: 'Buku Kas Umum (BKU)',
      rel: 'finance/ledger (SSOT Seluruh Mutasi Kas Madrasah)',
      usage: 'Catat setiap mutasi uang masuk atau uang keluar operasional. Transaksi ini menjadi basis saldo berjalan BKU.'
    },
    '#/finance/cashbook': {
      func: 'Buku Kas Umum (BKU) dengan kalkulasi saldo berjalan otomatis (Kas Tunai & Rekening Bank) per periode.',
      from: 'Dihitung Otomatis dari Jurnal Transaksi',
      to: 'Kepala Sekolah, Auditor, dan Yayasan',
      rel: 'finance/ledger (Derived Balance Ledger)',
      usage: 'Pilih bulan buku kas untuk memeriksa saldo awal, total penerimaan, total belanja, dan sisa saldo kas akhir.'
    },
    '#/finance/bos': {
      func: 'Pembukuan dan pertanggungjawaban belanja dana Bantuan Operasional Sekolah (BOS) reguler kementerian.',
      from: 'Bendahara BOS',
      to: 'Tim BOS Sekolah & Dinas Pendidikan Dikdasmen',
      rel: 'finance/bos (Dilengkapi nomor bukti kuitansi belanja BOS)',
      usage: 'Input transaksi belanja komponen BOS sesuai 12 standar juknis kementerian lengkap dengan tautan nota digital.'
    },
    '#/finance/scholarships': {
      func: 'Eksekusi pencairan kas beasiswa atau pemotongan tagihan SPP bagi siswa yang telah disetujui Kesiswaan.',
      from: 'Bendahara Sekolah',
      to: 'Siswa Penerima & Kas Sekolah',
      rel: 'finance/scholarships & finance/ledger (Terkunci pada approvedScholarshipStudent)',
      usage: 'Pilih siswa dari daftar yang telah disetujui Kesiswaan, tentukan nominal pencairan atau potongan SPP, lalu simpan.'
    },
    '#/finance/student-bills': {
      func: 'Monitoring tagihan iuran SPP bulanan siswa, riwayat kuitansi pelunasan, dan status beasiswa murid.',
      from: 'Bendahara Keuangan',
      to: 'Orang Tua Murid & Sekolah',
      rel: 'finance/student_bills (Tampil transparan di dashboard orang tua)',
      usage: 'Periksa status pembayaran SPP per rombel. Tandai status lunas atau kirim rincian tagihan digital ke wali murid.'
    },
    '#/finance/salaries': {
      func: 'Penghitungan slip gaji bulanan GTK: gaji pokok, tunjangan wali kelas/fungsional, jam mengajar, dan potongan.',
      from: 'Bendahara Gaji',
      to: 'Seluruh GTK Sekolah',
      rel: 'finance/salaries (Terkoneksi dengan data profil pegawai GTK)',
      usage: 'Pilih nama pegawai dari dropdown GTK steril, isi komponen tunjangan/potongan, dan cetak rincian slip gaji.'
    },
    '#/finance/proposals': {
      func: 'Alur pengajuan dan peninjauan proposal permohonan dana kegiatan unit kerja (ACC, Revisi, atau Ditolak).',
      from: 'Panitia Pelaksana Unit Kerja',
      to: 'Waka Keuangan & Kepala Sekolah',
      rel: 'finance/proposals (Pengendalian kas keluar berbasis rencana program)',
      usage: 'Unit kerja mengajukan permohonan anggaran kegiatan; Waka Keuangan meninjau kelayakan biaya dan memberi status ACC.'
    },
    '#/finance/archives': {
      func: 'Repositori digital arsip kuitansi, nota kontan, bukti transfer belanja, dan faktur pajak keuangan.',
      from: 'Staf Administrasi Keuangan',
      to: 'Pemeriksa Keuangan & Pengawas Sekolah',
      rel: 'finance/archives (Bukti akuntabilitas fisik digital)',
      usage: 'Unggah foto struk belanja atau bukti transfer bank untuk memvalidasi catatan pengeluaran di BKU.'
    },
    '#/finance/reports': {
      func: 'Laporan Pertanggungjawaban (LPJ) keuangan semesteran dan sinkronisasi kas tutup buku tahunan.',
      from: 'Waka Keuangan',
      to: 'Kepala Sekolah & Komite Sekolah',
      rel: 'finance/lpj (Laporan tutup buku kas berkala)',
      usage: 'Generate laporan rekap realisasi penerimaan vs pengeluaran tahun berjalan untuk diajukan ke yayasan.'
    },
    '#/facilities/inventory': {
      func: 'Buku induk inventaris barang sekolah: kode registrasi aset, jumlah unit, ruangan lokasi, dan kondisi fisik.',
      from: 'Tim Sarpras Madrasah',
      to: 'Warga Sekolah, Auditor Sarpras, dan Pimpinan',
      rel: 'facilities/assets (Master seluruh inventaris fisik sekolah)',
      usage: 'Daftarkan barang inventaris baru, pilih lokasi ruangan, catat kondisi fisik (Baik/Rusak), dan simpan.'
    },
    '#/facilities/dapodik': {
      func: 'Data legalitas sarpras Dapodik: dimensi luas ruangan, kapasitas tampung, tahun pembangunan, dan kelayakan ruang.',
      from: 'Staf Sarpras & Operator Dapodik',
      to: 'Dapodik Kemdikbud & Arsip Madrasah',
      rel: 'facilities/rooms (Data resmi sarana gedung sekolah)',
      usage: 'Perbarui data luas bangunan kelas, laboratorium, perpustakaan, atau toilet sesuai standar teknis Dapodik.'
    },
    '#/facilities/maintenance': {
      func: 'Pelacakan perawatan rutin fasilitas: servis AC, perbaikan sanitasi/toilet, pengecatan dinding, dan kelistrikan.',
      from: 'Teknisi / Staf Perawatan Sarpras',
      to: 'Seluruh Pengguna Fasilitas Sekolah',
      rel: 'facilities/maintenance (Jadwal pemeliharaan berkala gedung)',
      usage: 'Catat laporan fasilitas yang membutuhkan perbaikan, tetapkan teknisi pelaksana, dan perbarui status selesai servis.'
    },
    '#/facilities/loans': {
      func: 'Administrasi peminjaman fasilitas sekolah (aula, proyektor, sound system, kamera) agar jadwal tidak bentrok.',
      from: 'Pemohon (Guru, Ekskul, Paguyuban)',
      to: 'Pengelola Fasilitas Sarpras',
      rel: 'facilities/loans (Pelacak status: Diajukan -> Dipinjam -> Dikembalikan)',
      usage: 'Ajukan tanggal dan barang yang ingin dipinjam; petugas Sarpras menyetujui ketersediaan jadwal pemakaian.'
    },
    '#/facilities/disposal': {
      func: 'Penerbitan berita acara afkir dan penghapusan inventaris aset yang telah rusak berat atau habis masa pakai.',
      from: 'Waka Sarpras',
      to: 'Kepala Sekolah & Pengurus Yayasan',
      rel: 'facilities/disposals (Penghapusan resmi dari buku inventaris)',
      usage: 'Pilih barang yang rusak permanen, sertakan alasan penghapusan aset, dan terbitkan berita acara afkir.'
    },
    '#/guru/student-attendance': {
      func: 'Presensi harian murid per rombel kelas: pencatatan kehadiran (Hadir, Sakit, Izin, Alpa) setiap pagi.',
      from: 'Wali Kelas Rombel',
      to: 'Orang Tua Murid, Kesiswaan, dan E-Rapor',
      rel: 'attendance_records (Otomatis tampil di dashboard ortu dan akumulasi rapor)',
      usage: 'Pilih rombel, centang status kehadiran setiap anak, dan klik Simpan Absensi. Data sakit/izin otomatis tersinkron.'
    },
    '#/guru/classes': {
      func: 'E-Rapor Rombel: pengolahan ledger nilai akhir murid, penguncian nilai rapor, dan pencetakan rapor F4.',
      from: 'Wali Kelas (Mengagregasi Nilai Mapel & Sikap)',
      to: 'Wali Murid & Kepala Sekolah',
      rel: 'classes/{id}/grades & print.html (Penerbitan rapor hasil belajar siswa)',
      usage: 'Pilih kelas yang dibimbing, periksa capaian nilai seluruh murid, lalu klik Cetak Rapor untuk mencetak format F4 resmi.'
    },
    '#/guru/additional': {
      func: 'Data tambahan E-Rapor: pengisian catatan wali kelas, nilai ekstrakurikuler, dan sinkronisasi prestasi lomba.',
      from: 'Wali Kelas Rombel',
      to: 'Lembar Cetak E-Rapor Siswa',
      rel: 'classes/{id}/additional (Terintegrasi tombol 1-klik dari Kesiswaan)',
      usage: 'Pilih anak, tulis catatan perkembangan, atau gunakan tombol sisipkan prestasi dari Kesiswaan, lalu simpan.'
    },
    '#/guru/academic': {
      func: 'Input nilai akademik formatif per Tujuan Pembelajaran (TP) dan nilai asesmen sumatif (STS / SAS).',
      from: 'Guru Pengampu Mata Pelajaran',
      to: 'Wali Kelas & Ledger E-Rapor Siswa',
      rel: 'grades/{classId}_{subjectId} (SSOT Nilai Akademik)',
      usage: 'Pilih rombel dan mata pelajaran Anda, isi skor capaian kompetensi siswa, dan sistem otomatis menghitung rata-rata.'
    },
    '#/guru/portfolio': {
      func: 'Portofolio pendidik mandiri: penyimpanan berkas ijazah, sertifikat pendidik, karya inovasi pembelajaran, dan diklat.',
      from: 'Guru Mandiri',
      to: 'Guru & Bagian SDM Kepegawaian',
      rel: 'guru/portfolio (Scoping: own: true)',
      usage: 'Unggah berkas dokumen pengembangan keprofesian pribadi Anda secara aman dan terorganisir.'
    },
    '#/guru/ummi/koord/mapping': {
      func: 'Pemetaan kelompok mengaji metode Ummi: mengelompokkan santri per jilid (1-6, Al-Quran, Tajwid) dan guru pengampu.',
      from: 'Koordinator Ummi',
      to: 'Guru Ummi & Santri',
      rel: 'ummi_classes (SSOT Rombel Halaqah Al-Quran)',
      usage: 'Tentukan guru pembina halaqah dan masukkan daftar santri berdasarkan capaian jilid kemampuan membacanya.'
    },
    '#/guru/ummi/progress': {
      func: 'Jurnal harian mengaji santri: mencatat capaian jilid, halaman, kelancaran bacaan, dan catatan tajwid/makhroj.',
      from: 'Guru Ummi Halaqah',
      to: 'Santri, Koordinator Ummi, dan Orang Tua',
      rel: 'ummi_progress (Tampil realtime di dashboard wali murid)',
      usage: 'Pilih nama santri pada sesi mengaji hari ini, catat jilid dan nomor halaman bacaan, lalu klik Simpan Progres.'
    },
    '#/guru/ummi/tahfidz': {
      func: 'Pencatatan setoran hafalan Al-Quran santri (Juz 30 s/d Juz 1) beserta status kelancaran mutqin.',
      from: 'Guru Pembimbing Tahfidz',
      to: 'Santri, Koordinator, dan Orang Tua',
      rel: 'ummi_tahfidz (Rekam jejak target hafalan juz anak)',
      usage: 'Pilih surah dan rentang ayat yang disetorkan santri, beri predikat kelancaran, dan simpan catatan hafalan.'
    },
    '#/guru/ummi/tasmi': {
      func: 'Penilaian majelis tasmi terbuka: menguji hafalan sekali duduk di hadapan dewan penguji resmi.',
      from: 'Guru Penguji Tasmi',
      to: 'Koordinator Ummi & Rapor Tahfidz Santri',
      rel: 'ummi_tasmi_results (Sertifikasi kelulusan hafalan Al-Quran)',
      usage: 'Penguji menilai aspek kelancaran, fashohah, dan makharijul huruf selama majelis tasmi berlangsung.'
    },
    '#/guru/ekstra/syllabus': {
      func: 'Penyusunan target kurikulum dan program latihan mingguan cabang ekstrakurikuler selama satu semester.',
      from: 'Pembina Cabang Ekstrakurikuler',
      to: 'Kesiswaan & Santri Peserta Ekskul',
      rel: 'ekstra/syllabus (Panduan modul latihan ekskul)',
      usage: 'Input materi pembinaan per pertemuan mingguan untuk panduan latihan fisik, seni, atau sains.'
    },
    '#/guru/ekstra/attendance': {
      func: 'Presensi kehadiran santri peserta ekstrakurikuler pada setiap sesi latihan mingguan.',
      from: 'Pembina Ekstrakurikuler',
      to: 'Kesiswaan & Orang Tua Murid',
      rel: 'ekstra/attendance (Syarat kelayakan penilaian rapor ekskul)',
      usage: 'Buka form absensi pada hari latihan, centang santri yang hadir, sakit, atau berhalangan.'
    },
    '#/guru/extracurriculars': {
      func: 'Penilaian predikat rapor ekstrakurikuler (Sangat Baik / Baik / Cukup) beserta deskripsi bakat santri.',
      from: 'Pembina Ekstrakurikuler',
      to: 'Wali Kelas & Cetak E-Rapor Murid',
      rel: 'ekstra/grades (Terkoneksi langsung ke lembar nilai rapor wali kelas)',
      usage: 'Berikan predikat nilai dan kalimat deskripsi capaian bakat santri untuk otomatis dicetak di lembar E-Rapor.'
    },
    '#/guru/ekstra/talents': {
      func: 'Pemetaan bibit santri berbakat untuk pembinaan intensif dan seleksi delegasi perlombaan resmi (O2SN, FLS2N).',
      from: 'Pembina Ekstrakurikuler',
      to: 'Waka Kesiswaan',
      rel: 'ekstra/talents (Database atlet & talenta sekolah)',
      usage: 'Catat siswa dengan keahlian menonjol di bidangnya agar diprioritaskan saat ada undangan kejuaraan.'
    },
    '#/ortu/dashboard': {
      func: 'Portal terpadu orang tua: pantau kehadiran anak setiap pagi, progres mengaji Ummi/Tahfidz, catatan guru, dan rapor.',
      from: 'Wali Kelas & Guru Al-Quran',
      to: 'Orang Tua / Wali Murid',
      rel: 'Multi-Node Santri (attendance_records, ummi_progress, student_bills)',
      usage: 'Lihat ringkasan aktivitas ananda hari ini, ajukan permohonan izin jika sakit, dan cek tagihan SPP online.'
    },
    '#/curriculum': {
      func: 'Dashboard eksekutif pemantauan operasional akademik & kurikulum madrasah (kalender akademik, kelengkapan modul ajar, dan rekapitulasi KBM).',
      from: 'Dewan Guru & Staf Kurikulum (Modul Ajar, Nilai, Presensi)',
      to: 'Waka Kurikulum & Kepala Sekolah',
      rel: 'Multi-Node Kurikulum (curriculum/*, academic_grades, teaching_schedules)',
      usage: 'Pantau persentase kelengkapan perangkat ajar guru dan distribusi jadwal mengajar untuk evaluasi mutu pembelajaran.'
    },
    '#/student-affairs': {
      func: 'Panel kontrol monitoring kesiswaan terpadu (kedisiplinan, prestasi santri, rekapitulasi perizinan/sakit, dan status SPMB/PPDB).',
      from: 'Wali Kelas, Guru BK, Panitia SPMB, dan Pembina Prestasi',
      to: 'Waka Kesiswaan & Kepala Sekolah',
      rel: 'Multi-Node Kesiswaan (student_affairs/*, achievements, violations, leaves)',
      usage: 'Tinjau tren kedisiplinan santri, pantau rekapitulasi perizinan harian, dan pantau progres pendaftaran murid baru.'
    },
    '#/finance': {
      func: 'Ikhtisar neraca keuangan madrasah (realisasi RKAS, arus kas masuk/keluar, penerimaan SPP/infak, dan serapan dana BOS).',
      from: 'Bendahara Sekolah & Petugas Kasir SPP',
      to: 'Waka Keuangan & Kepala Sekolah',
      rel: 'Multi-Node Keuangan (finance/ledger, student_bills, bos_reports)',
      usage: 'Cek saldo kas tunai/bank terkini, grafik penerimaan harian, dan bandingkan serapan pos anggaran terhadap pagu RKAS.'
    },
    '#/personnel': {
      func: 'Pusat informasi manajemen SDM dan kehumasan (rekapitulasi absensi GTK hari ini, status kinerja guru, aduan publik, dan agenda madrasah).',
      from: 'Staf Humas, Presensi GTK, dan Sistem Pengaduan',
      to: 'Waka Humas & Personalia serta Kepala Sekolah',
      rel: 'Multi-Node SDM & Humas (personnel/*, attendance_records, evaluations)',
      usage: 'Pantau persentase kehadiran GTK pagi ini, periksa aduan wali murid yang butuh respons, dan cek agenda kegiatan sekolah terdekat.'
    },
    '#/facilities': {
      func: 'Pusat kendali aset fisik dan fasilitas sarana prasarana (kondisi ruang kelas, status barang inventaris, tiket perbaikan, dan kebersihan).',
      from: 'Staf Sarpras & Teknisi Pemeliharaan',
      to: 'Waka Sarpras & Kepala Sekolah',
      rel: 'Multi-Node Sarpras (facilities/*, inventory_items, maintenance_logs)',
      usage: 'Pantau rasio aset layak pakai, tindak lanjuti laporan kerusakan fasilitas gedung, dan rencanakan pengadaan baru.'
    },
    '#/kepsek/reports': {
      func: 'Monitoring berkala catatan wali kelas, tren presensi santri per rombel, dan progres penerbitan E-Rapor antar jenjang.',
      from: 'Wali Kelas & Tim Kurikulum',
      to: 'Kepala Sekolah',
      rel: 'classes, academic_grades, student_attendance',
      usage: 'Pilih tingkat kelas atau rombel untuk melihat daya serap kurikulum, rata-rata ketidakhadiran, dan ringkasan catatan wali kelas.'
    },
    '#/guru/observations': {
      func: 'Dokumentasi catatan observasi proses pembelajaran di kelas dan masukan konstruktif peningkatan metode pengajaran.',
      from: 'Kepala Sekolah / Guru Senior (Supervisor)',
      to: 'Guru yang Diobservasi & Arsip Mutu Kurikulum',
      rel: 'curriculum/supervision & personnel/evaluations',
      usage: 'Tinjau catatan rekomendasi dari supervisor, pelajari poin perbaikan metode ajar, dan unggah tindak lanjut perbaikan.'
    },
    '#/guru/english/classes': {
      func: 'Pengelolaan kelompok belajar kemampuan bahasa Inggris santri berdasarkan tingkat kecakapan (Beginner, Intermediate, Advanced).',
      from: 'Koordinator / Tim English Lab',
      to: 'Guru Mapel B. Inggris & Siswa',
      rel: 'english_classes & student_directory',
      usage: 'Pilih kelompok kelas bahasa untuk melihat daftar santri aktif, jadwal praktikum lab, dan modul speaking mingguan.'
    },
    '#/guru/english/progress': {
      func: 'Pencatatan capaian kompetensi lisan (Vocabulary, Pronunciation, Fluency, Grammar) santri dalam program English Lab.',
      from: 'Guru Pembina English Lab',
      to: 'Koordinator Bahasa, Wali Kelas, & Orang Tua',
      rel: 'english_progress (Terkoneksi ke deskripsi rapor mulok)',
      usage: 'Pilih nama santri, tentukan topik dialog speaking hari ini, lalu berikan skor kriteria dan feedback langsung.'
    },
    '#/guru/ummi/classes': {
      func: 'Daftar santri bimbingan Al-Qur\'an metode Ummi yang diampu langsung oleh guru pengajar (Jilid 1-6, Al-Qur\'an, Ghorib, Tajwid).',
      from: 'Koordinator Ummi (Plotting Rombel)',
      to: 'Guru Ummi yang Bertugas',
      rel: 'ummi_classes & ummi_students',
      usage: 'Klik rombel halaqah Anda untuk melihat daftar santri, rekap jilid terakhir, dan memulai pencatatan tilawah harian.'
    },
    '#/guru/ummi/koord/exams': {
      func: 'Manajemen pendaftaran, penjadwalan, dan verifikasi kelayakan santri untuk mengikuti munaqosyah jilid dan munaqosyah akhir Ummi.',
      from: 'Usulan Guru Ummi Halaqah',
      to: 'Koordinator Ummi & Tim Penguji',
      rel: 'ummi_exams (Syarat penerbitan sertifikat Ummi)',
      usage: 'Tinjau santri yang diajukan naik jilid, tentukan tanggal ujian dan penguji resmi, lalu input hasil kelulusan.'
    },
    '#/guru/ummi/koord/tasmi': {
      func: 'Penjadwalan majelis simaan Al-Qur\'an sekali duduk (1 Juz, 3 Juz, 5 Juz) serta penetapan ustadz/ustadzah penguji tasmi.',
      from: 'Koordinator Tahfidz / Ummi',
      to: 'Penguji Tasmi & Santri Penghafal',
      rel: 'ummi_tasmi_schedule & student_tahfidz_records',
      usage: 'Jadwalkan majelis tasmi, tentukan target juz yang disimak, tunjuk guru penyimak, dan cetak sertifikat syahadah setelah lulus.'
    },
    '#/facilities/electronics': {
      func: 'Registrasi dan kontrol perawatan perangkat elektronik madrasah (AC, proyektor LCD, printer, audio speaker, dan PC lab).',
      from: 'Teknisi Sarpras & Tim IT',
      to: 'Waka Sarpras & Pengguna Ruang',
      rel: 'facilities/electronics (Jadwal servis berkala & riwayat suku cadang)',
      usage: 'Catat nomor seri barang, jadwal servis berkala, dan status fungsi (Normal / Perlu Servis / Rusak Berat).'
    },
    '#/facilities/planning': {
      func: 'Perencanaan kebutuhan fasilitas madrasah jangka pendek dan menengah berdasarkan usulan unit kerja dan rombel baru.',
      from: 'Unit Kerja Madrasah & Tim Sarpras',
      to: 'Waka Sarpras, Kepala Sekolah, & Bendahara RKAS',
      rel: 'facilities/planning (Dasar penetapan pos belanja sarpras di RKAS)',
      usage: 'Input usulan pengadaan sarana/prasarana, sertakan estimasi urgensi (Tinggi/Sedang/Rendah) dan prakiraan anggaran.'
    },
    '#/facilities/rkas': {
      func: 'Sinkronisasi daftar belanja barang modal sarpras yang telah disetujui masuk ke dalam Rencana Kerja & Anggaran Sekolah.',
      from: 'Waka Sarpras',
      to: 'Bendahara Keuangan (Sinkron ke modul RKAS Keuangan)',
      rel: 'facilities/rkas & finance/rkas (SSOT Anggaran Pengadaan)',
      usage: 'Tinjau pos belanja inventaris yang disetujui, pastikan spesifikasi barang dan volume sesuai alokasi plafon kas.'
    },
    '#/facilities/safety': {
      func: 'Checklist inspeksi berkala keamanan lingkungan fisik madrasah (APAR, instalasi kabel listrik, pagar pengaman, CCTV, dan sanitasi).',
      from: 'Petugas Keamanan & Staf K3 Sarpras',
      to: 'Waka Sarpras & Kepala Sekolah',
      rel: 'facilities/safety (Arsip pemenuhan standar akreditasi K3 madrasah)',
      usage: 'Lakukan inspeksi berkala per zona gedung, centang kondisi keamanan, dan laporkan potensi bahaya untuk segera ditangani.'
    },
    '#/finance/transparency': {
      func: 'Papan informasi akuntabilitas dan publikasi realisasi penerimaan serta penggunaan dana sekolah (BOS, Komite, Infaq) kepada publik/wali murid.',
      from: 'Bendahara Madrasah',
      to: 'Wali Murid, Komite Sekolah, & Publik',
      rel: 'finance/transparency (Laporan ringkas yang disanitasi dari data sensitif BKU)',
      usage: 'Terbitkan laporan infografis realisasi kas semesteran agar orang tua murid dapat melihat amanah dana secara transparan.'
    },
    '#/tendik/performance': {
      func: 'Pengisian dan rekapitulasi Sasaran Kinerja Pegawai (SKP) harian/bulanan tenaga kependidikan (TU, Kebersihan, Keamanan, Operator).',
      from: 'Tendik Mandiri',
      to: 'Kepala Tata Usaha & Waka Personalia',
      rel: 'tendik/performance & attendance_records (Kriteria insentif kinerja)',
      usage: 'Isi uraian tugas harian yang diselesaikan, jumlah berkas/layanan yang diproses, dan ajukan verifikasi kepada atasan.'
    },
    '#/tendik/portfolio': {
      func: 'Penyimpanan arsip bukti fisik keterampilan kerja, sertifikat diklat kependidikan, SK kepanitiaan, dan inovasi layanan administrasi.',
      from: 'Tendik Mandiri',
      to: 'Arsip Kepegawaian & Verifikator SDM',
      rel: 'tendik/portfolio (Dokumen pendukung kenaikan jenjang karir/golongan)',
      usage: 'Unggah sertifikat pelatihan administrasi atau piagam penghargaan kerja sebagai portofolio kepegawaian.'
    },
    '#/komite/activities': {
      func: 'Dokumentasi program kerja bersama antara komite, paguyuban kelas, dan madrasah (Parenting, Class Meeting, Bakti Sosial).',
      from: 'Pengurus Komite & Paguyuban Kelas',
      to: 'Seluruh Wali Murid & Pimpinan Madrasah',
      rel: 'komite/activities',
      usage: 'Input agenda kegiatan orang tua murid, unggah dokumentasi foto/laporan ringkas kegiatan paguyuban.'
    },
    '#/komite/finance-komite': {
      func: 'Pencatatan kas mandiri komite madrasah (iuran sukarela, bantuan sarana belajar, dana santunan) terpisah dari rekening resmi madrasah.',
      from: 'Bendahara Komite Sekolah',
      to: 'Pengurus Komite & Anggota Wali Murid',
      rel: 'komite/finance_records (Otonomi dana perwakilan orang tua murid)',
      usage: 'Catat pemasukan kas komite dan penyaluran dana untuk kegiatan penunjang santri, lalu cetak laporan periodik.'
    },
    '#/komite/finance-paguyuban': {
      func: 'Pembukuan kas internal paguyuban per rombel kelas (dana hias kelas, bingkisan wali kelas, konsumsi kegiatan santri).',
      from: 'Bendahara Paguyuban Kelas',
      to: 'Orang Tua Murid Rombel Terkait',
      rel: 'komite/finance_paguyuban',
      usage: 'Pilih kelas binaan, catat iuran kas paguyuban dan pengeluaran kelas secara terbuka agar dapat ditinjau oleh sesama wali murid.'
    },
    '#/it-admin/sync': {
      func: 'Pemetaan dan sinkronisasi data profil santri, rombel, dan guru dengan format ekspor/impor Dapodik & EMIS Kemenag.',
      from: 'Operator Data Madrasah',
      to: 'Pusat Data Kemendikbudristek & Kemenag',
      rel: 'students, personnel/directory, classes (SSOT Verifikasi Data Nasional)',
      usage: 'Periksa kelengkapan NISN/NUPTK warga sekolah, lalu jalankan sinkronisasi atau ekspor berkas data master Dapodik/EMIS.'
    },
    '#/it-admin/backup': {
      func: 'Pencadangan snapshot database berkala ke penyimpanan lokal atau cloud Google Drive untuk proteksi bencana (disaster recovery).',
      from: 'Tim Administrator IT',
      to: 'Keamanan & Keberlanjutan Data Madrasah',
      rel: 'Snapshot Cloud Realtime Database & Storage',
      usage: 'Klik Buat Cadangan Baru untuk mengunduh snapshot data JSON terkini, atau pilih berkas cadangan untuk pemulihan darurat.'
    },
    '#/it-admin/logs': {
      func: 'Rekam jejak seluruh mutasi penting (perubahan nilai rapor, pencairan uang kas, reset password, dan riwayat login gagal).',
      from: 'Sistem Logging Otomatis',
      to: 'Auditor IT & Kepala Sekolah',
      rel: 'system_audit_logs (Forensik integritas data)',
      usage: 'Filter aktivitas berdasarkan tanggal atau nama staf untuk melacak siapa yang melakukan aksi tertentu pada sistem.'
    },
    '#/it-admin/network': {
      func: 'Monitoring perangkat jaringan lokal sekolah (Access Point WiFi, Router Mikrotik, Switch Hub, dan alokasi bandwidth kelas).',
      from: 'Teknisi Jaringan IT',
      to: 'Kebutuhan CBT, Smart Classroom, & Kantor',
      rel: 'it/network_assets',
      usage: 'Pantau status aktif access point per lantai, uji latensi internet, dan catat riwayat perawatan kabel LAN/WiFi.'
    },
    '#/it-admin/integration': {
      func: 'Manajemen kunci API, integrasi server Computer Based Test (CBT), gateway WhatsApp notifikasi, dan webhook eksternal.',
      from: 'Tim Pengembang IT',
      to: 'Otomatisasi Notifikasi Wali Murid & Server Ujian',
      rel: 'system_integrations & notification_gateway',
      usage: 'Atur koneksi API WhatsApp gateway untuk kirim bukti presensi santri otomatis ke orang tua, atau sambungkan server ujian CBT.'
    },
    '#/it-admin/dashboard': {
      func: 'Pusat telemetri operasional teknologi: monitoring lalu lintas API, kuota Google Drive, dan status geofence sekolah.',
      from: 'Telemetri Sistem Realtime',
      to: 'Tim IT & Administrator',
      rel: 'Audit & Telemetri Infrastruktur',
      usage: 'Pantau grafik kesehatan server, status latensi Firebase, dan kuota penyimpanan berkas Google Drive.'
    }
  },
  get(routePath) {
    if (!routePath) return null;
    const cleanPath = routePath.split('?')[0];
    if (this.items[cleanPath]) return this.items[cleanPath];
    const baseDynamic = cleanPath.split('/').slice(0, -1).join('/') + '/:id';
    if (this.items[baseDynamic]) return this.items[baseDynamic];
    if (window.ModuleKit && window.ModuleKit.defs && window.ModuleKit.defs[cleanPath]) {
      const def = window.ModuleKit.defs[cleanPath];
      return {
        func: def.subtitle || ('Pengelolaan data ' + (def.noun || 'modul') + ' sekolah.'),
        from: 'Unit Kerja Terkait (' + (def.noun || 'Staf') + ')',
        to: 'Manajemen & Pengguna Terotorisasi',
        rel: 'Node: ' + (def.node || 'operasional') + ' (Tersimpan realtime di database)',
        usage: 'Klik tombol Tambah untuk membuat catatan baru, manfaatkan kolom pencarian untuk memfilter data, atau ekspor ke Excel/PDF.'
      };
    }
    return null;
  },
  render(routePath) {
    const guide = this.get(routePath);
    if (!guide) return '';
    return `
      <div class="feature-guide-card" id="feature-guide-banner">
        <div class="feature-guide-header" id="btn-toggle-feature-guide">
          <div class="feature-guide-title">
            <i class="ph ph-info"></i>
            <span>Panduan Fitur & Alur Kerja</span>
          </div>
          <button type="button" class="btn-toggle-guide" title="Sembunyikan / Tampilkan panduan">
            <span id="text-toggle-feature-guide">Tutup</span>
            <i class="ph ph-caret-up" id="icon-toggle-feature-guide"></i>
          </button>
        </div>
        <div class="feature-guide-body" id="feature-guide-content">
          <div class="feature-guide-grid">
            <div class="guide-item">
              <span class="guide-badge-label"><i class="ph ph-target"></i> Fungsi Fitur</span>
              <p class="guide-text">${guide.func}</p>
            </div>
            <div class="guide-item">
              <span class="guide-badge-label"><i class="ph ph-arrows-left-right"></i> Distribusi Data</span>
              <p class="guide-text">
                <span class="guide-flow-tag">Dari: ${guide.from}</span> &rarr; <span class="guide-flow-tag">Untuk: ${guide.to}</span>
                <br><small class="guide-subtext"><strong>Terkait:</strong> ${guide.rel}</small>
              </p>
            </div>
            <div class="guide-item">
              <span class="guide-badge-label"><i class="ph ph-play-circle"></i> Cara Penggunaan</span>
              <p class="guide-text">${guide.usage}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  attach(container, routePath) {
    if (!container) return;
    if (container.querySelector('#feature-guide-banner')) return;
    const guideHtml = this.render(routePath);
    if (!guideHtml) return;
    const temp = document.createElement('div');
    temp.innerHTML = guideHtml.trim();
    const bannerEl = temp.firstElementChild;
    if (!bannerEl) return;
    container.insertBefore(bannerEl, container.firstChild);
    const toggleBtn = bannerEl.querySelector('#btn-toggle-feature-guide');
    const contentEl = bannerEl.querySelector('#feature-guide-content');
    const textEl = bannerEl.querySelector('#text-toggle-feature-guide');
    const iconEl = bannerEl.querySelector('#icon-toggle-feature-guide');
    if (toggleBtn && contentEl) {
      toggleBtn.onclick = (e) => {
        e.preventDefault();
        const isCollapsed = contentEl.classList.toggle('collapsed');
        if (textEl) textEl.innerText = isCollapsed ? 'Buka' : 'Tutup';
        if (iconEl) {
          iconEl.className = isCollapsed ? 'ph ph-caret-down' : 'ph ph-caret-up';
        }
      };
    }
  }
};
window.FeatureGuides = FeatureGuides;
