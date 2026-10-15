(function () {
  const R = AppConfig.ROLES;
  const t = (key, label, o = {}) => ({ key, label, type: 'text', ...o });
  const area = (key, label, o = {}) => ({ key, label, type: 'textarea', list: false, wide: true, ...o });
  const num = (key, label, o = {}) => ({ key, label, type: 'number', ...o });
  const money = (key, label, o = {}) => ({ key, label, type: 'money', ...o });
  const date = (key, label, o = {}) => ({ key, label, type: 'date', ...o });
  const time = (key, label, o = {}) => ({ key, label, type: 'time', ...o });
  const sel = (key, label, options, o = {}) => ({ key, label, type: 'select', options, ...o });
  const ref = (key, label, kind, o = {}) => ({ key, label, type: 'select', ref: kind, ...o });
  const file = (key, label, folderKey, o = {}) => ({ key, label, type: 'file', folderKey, ...o });
  const link = (key, label, o = {}) => ({ key, label, type: 'link', list: false, wide: true, ...o });
  const year = (d) => String(d || '').slice(0, 4);
  const done = { Selesai: 'success', Disetujui: 'success', Aktif: 'success', Terealisasi: 'success', Diterima: 'success', Dicairkan: 'success', Diverifikasi: 'success', Disetor: 'success', Terpublikasi: 'success', Dikembalikan: 'success', Normal: 'success', Aman: 'success', Terpenuhi: 'success' };
  const bad = { Ditolak: 'danger', Rusak: 'danger', Bahaya: 'danger', Nonaktif: 'danger', Berakhir: 'danger', 'Belum Disetor': 'danger' };
  const badges = { ...done, ...bad };
  const SA = [R.STUDENT_AFFAIRS];
  const PE = [R.PERSONNEL];
  const FA = [R.FACILITIES];
  const FI = [R.FINANCE];
  const CU = [R.CURRICULUM];
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  ModuleKit.register({
    '#/finance/bos': {
      node: 'finance/bos', noun: 'Laporan BOS', writeRoles: FI, dateField: 'date',
      subtitle: 'Pengelolaan dan pelaporan dana BOS.',
      derive: (p) => ({ year: year(p.date) }),
      summary: [
        { label: 'Total Penerimaan', icon: 'ph-download-simple', tone: 'success', sum: 'income', money: true },
        { label: 'Total Pengeluaran', icon: 'ph-upload-simple', tone: 'danger', sum: 'expense', money: true }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Uraian Transaksi', { required: true }),
        sel('category', 'Kategori', ['Penerimaan BOS', 'Honorarium', 'Alat Tulis', 'Pemeliharaan', 'Lainnya'], { required: true }),
        money('income', 'Penerimaan'),
        money('expense', 'Pengeluaran'),
        file('proof', 'Bukti Transaksi (File)', 'bos_proofs'),
        area('description', 'Keterangan')
      ]
    },
    '#/finance/scholarships': {
      node: 'finance/scholarships', noun: 'Pencairan Beasiswa & SPP', writeRoles: FI, dateField: 'date', statusField: 'status', badges,
      subtitle: 'Realisasi pencairan dana beasiswa dan pemotongan SPP bagi siswa yang disetujui Kesiswaan.',
      summary: [
        { label: 'Total Pencairan', icon: 'ph-hand-coins', tone: 'primary' },
        { label: 'Dicairkan', icon: 'ph-check-circle', tone: 'success', where: { status: 'Dicairkan' } },
        { label: 'Total Nominal', icon: 'ph-wallet', tone: 'warning', sum: 'amount', money: true }
      ],
      fields: [
        date('date', 'Tanggal Pencairan', { required: true }),
        ref('studentId', 'Siswa Penerima (Disetujui Kesiswaan)', 'approvedScholarshipStudent', { required: true }),
        sel('source', 'Sumber Dana', ['PIP Kemdikbud', 'Beasiswa Yayasan/Lazismu', 'Beasiswa Prestasi', 'Subsidi Silang'], { required: true }),
        money('amount', 'Nominal Dicairkan', { required: true }),
        sel('disbursementType', 'Bentuk Realisasi', ['Pembebasan SPP', 'Uang Saku/Tunai', 'Bantuan Seragam/Buku', 'Transfer Bank'], { required: true }),
        sel('status', 'Status Pencairan', ['Diproses', 'Dicairkan', 'Tertunda'], { required: true }),
        file('proof', 'Bukti Kuitansi / Transfer', 'scholarship_proofs'),
        area('notes', 'Catatan')
      ]
    },
    '#/finance/salaries': {
      node: 'finance/salaries', noun: 'Penghitungan Gaji GTK', writeRoles: FI, dateField: 'month', statusField: 'status', badges,
      subtitle: 'Perhitungan gaji pokok, tunjangan fungsional/wali kelas, jam mengajar, dan potongan kasbon GTK.',
      summary: [
        { label: 'Total Gaji Disalurkan', icon: 'ph-money', tone: 'success', sum: 'netSalary', money: true },
        { label: 'Terbayar', icon: 'ph-check-circle', tone: 'success', where: { status: ['Ditransfer Bank', 'Dibayarkan Tunai'] } }
      ],
      fields: [
        date('month', 'Bulan Periode', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        money('basicSalary', 'Gaji Pokok', { required: true }),
        money('functionalAllowance', 'Tunjangan Fungsional/Wali Kelas'),
        money('teachingAllowance', 'Tunjangan Jam Mengajar'),
        money('deductions', 'Potongan (Kasbon/Koperasi/Infaq)'),
        money('netSalary', 'Gaji Bersih Diterima', { readonly: true }),
        sel('status', 'Status Pembayaran', ['Draft', 'Disetujui Kepala Sekolah', 'Ditransfer Bank', 'Dibayarkan Tunai'], { required: true }),
        file('slip', 'Slip Gaji (PDF/Scan)', 'salaries')
      ],
      derive: (p) => ({ netSalary: (Number(p.basicSalary) || 0) + (Number(p.functionalAllowance) || 0) + (Number(p.teachingAllowance) || 0) - (Number(p.deductions) || 0) })
    },
    '#/finance/proposals': {
      node: 'finance/proposals', noun: 'Persetujuan Proposal Kegiatan', writeRoles: [R.FINANCE, R.ADMIN], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Evaluasi pengajuan anggaran tiap agenda kegiatan dari unit kerja sekolah.',
      summary: [
        { label: 'Total Proposal', icon: 'ph-file-text', tone: 'primary' },
        { label: 'Disetujui', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui Waka Keuangan' } }
      ],
      fields: [
        date('date', 'Tanggal Pengajuan', { required: true }),
        t('title', 'Nama Kegiatan / Proposal', { required: true }),
        sel('unit', 'Unit Pengaju', ['Kesiswaan', 'Kurikulum', 'Sarpras', 'Humas & Personalia', 'Program Ummi', 'Ekstrakurikuler'], { required: true }),
        t('pic', 'Penanggung Jawab (PIC)', { required: true }),
        money('budget', 'Anggaran Diajukan', { required: true }),
        money('approvedBudget', 'Anggaran Disetujui'),
        file('document', 'Dokumen Proposal (PDF)', 'proposals', { required: true }),
        sel('status', 'Status Persetujuan', ['Diajukan', 'Disetujui Waka Keuangan', 'Disetujui Kepala Sekolah', 'Ditolak', 'Perlu Revisi'], { required: true }),
        area('notes', 'Catatan / Evaluasi Anggaran')
      ]
    },
    '#/personnel/documents': {
      node: 'personnel/documents', noun: 'Dokumen Kerja Sama', writeRoles: PE, dateField: 'date',
      subtitle: 'Dokumen MoU, Surat Masuk/Keluar, Piagam.',
      summary: [
        { label: 'Total Dokumen', icon: 'ph-folder', tone: 'primary' }
      ],
      fields: [
        date('date', 'Tanggal Dokumen', { required: true }),
        t('title', 'Judul Dokumen', { required: true }),
        sel('type', 'Jenis Dokumen', ['Surat Masuk', 'Surat Keluar', 'MoU', 'SK', 'Piagam', 'Surat Kuasa', 'Lainnya'], { required: true }),
        t('partner', 'Pihak Terkait'),
        file('document', 'File Dokumen', 'partnerships', { required: true }),
        area('description', 'Keterangan')
      ]
    },
    '#/curriculum/questions': {
      node: 'curriculum/questions', noun: 'Bank Soal', writeRoles: CU,
      subtitle: 'Kumpulan soal untuk bahan evaluasi.',
      summary: [
        { label: 'Total Soal', icon: 'ph-file-code', tone: 'primary' }
      ],
      fields: [
        sel('grade', 'Kelas', ['1', '2', '3', '4', '5', '6'], { required: true }),
        t('subject', 'Mata Pelajaran', { required: true }),
        t('topic', 'Bab / Topik', { required: true }),
        file('document', 'File Soal', 'questions', { required: true }),
        area('description', 'Deskripsi')
      ]
    },
    '#/curriculum/journals': { own: true,
      node: 'curriculum/journals', noun: 'Jurnal Pembelajaran', writeRoles: [R.CURRICULUM, R.GURU], dateField: 'date', units: ['GURU_UMUM', 'WALI_KELAS'],
      subtitle: 'Pemantauan jurnal mengajar harian guru.',
      summary: [
        { label: 'Total Jurnal', icon: 'ph-notebook', tone: 'primary' }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('teacherId', 'Guru', 'teacher', { required: true }),
        t('subject', 'Mata Pelajaran', { required: true }),
        area('material', 'Materi yang Diajarkan', { required: true }),
        t('notes', 'Catatan Khusus')
      ]
    },
    '#/curriculum/grades': {
      node: 'curriculum/grades', noun: 'Rekapitulasi Nilai', writeRoles: CU,
      subtitle: 'Arsip nilai harian, STS, SAS, dan ASAJ.',
      summary: [
        { label: 'Total Arsip Nilai', icon: 'ph-exam', tone: 'primary' }
      ],
      fields: [
        t('academicYear', 'Tahun Ajaran', { required: true }),
        sel('examType', 'Jenis Penilaian', ['PH', 'STS 1', 'STS 2', 'SAS', 'ASAJ'], { required: true }),
        sel('grade', 'Kelas', ['1', '2', '3', '4', '5', '6'], { required: true }),
        t('subject', 'Mata Pelajaran', { required: true }),
        file('document', 'File Rekap Nilai', 'grades', { required: true })
      ]
    },
    '#/tendik/performance': {
      node: 'tendik/performance', noun: 'Laporan Kinerja', writeRoles: ['tendik'], dateField: 'date',
      subtitle: 'Progress pekerjaan harian/pekanan.',
      fields: [
        date('date', 'Tanggal Laporan', { required: true }),
        area('tasks', 'Tugas yang Diselesaikan', { required: true }),
        file('document', 'File Bukti Kinerja', 'tendik_performance')
      ]
    },
    '#/tendik/portfolio': {
      node: 'tendik/portfolio', noun: 'Portofolio Tendik', writeRoles: ['tendik'], dateField: 'date',
      subtitle: 'Dokumen pencapaian tenaga kependidikan.',
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Judul', { required: true }),
        file('document', 'Dokumen Pendukung', 'tendik_portfolio', { required: true })
      ]
    },
    '#/guru/portfolio': { own: true,
      node: 'guru/portfolio', noun: 'Portofolio & Rekam Jejak Guru', writeRoles: [R.GURU, R.GURU_EKSKUL, R.GURU_UMMI, R.TENDIK], dateField: 'date',
      subtitle: 'Dokumen pelatihan, sertifikasi kompetensi, workshop, dan rekam jejak guru/pembina.',
      fields: [
        date('date', 'Tanggal', { required: true }),
        sel('category', 'Kategori', ['Pelatihan & Workshop', 'Sertifikasi Profesi', 'Portofolio Prestasi', 'Karya Inovasi', 'Lainnya'], { required: true, default: 'Pelatihan & Workshop' }),
        t('title', 'Nama Pelatihan / Judul Portofolio', { required: true }),
        t('organizer', 'Lembaga Penyelenggara'),
        num('hours', 'Jumlah Jam (JP)'),
        t('certificateNo', 'Nomor Sertifikat / Dokumen'),
        file('document', 'Dokumen Pendukung', 'guru_portfolio', { required: true }),
        area('description', 'Keterangan Tambahan')
      ]
    },
    '#/komite/activities': {
      node: 'komite/activities', noun: 'Kegiatan Paguyuban', writeRoles: [R.KOMITE, R.PERSONNEL], dateField: 'date',
      subtitle: 'Data agenda dan kegiatan paguyuban wali murid bersama sekolah.',
      summary: [
        { label: 'Total Kegiatan', icon: 'ph-calendar-check', tone: 'primary' }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Nama Kegiatan', { required: true }),
        file('document', 'Dokumentasi / File', 'komite_activities'),
        area('description', 'Keterangan')
      ]
    },
    '#/komite/finance-paguyuban': {
      node: 'komite/finance-paguyuban', noun: 'Keuangan Paguyuban', writeRoles: [R.KOMITE, R.FINANCE], dateField: 'date',
      subtitle: 'Laporan keuangan kas paguyuban.',
      summary: [
        { label: 'Total Pemasukan', icon: 'ph-download-simple', tone: 'success', sum: 'income', money: true },
        { label: 'Total Pengeluaran', icon: 'ph-upload-simple', tone: 'danger', sum: 'expense', money: true }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Uraian Transaksi', { required: true }),
        money('income', 'Pemasukan'),
        money('expense', 'Pengeluaran'),
        file('proof', 'Bukti Transaksi', 'komite_finance')
      ]
    },
    '#/komite/finance-komite': {
      node: 'komite/finance-komite', noun: 'Keuangan Komite', writeRoles: ['komite'], dateField: 'date',
      subtitle: 'Laporan keuangan kas Komite Sekolah.',
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Uraian Transaksi', { required: true }),
        money('income', 'Pemasukan'),
        money('expense', 'Pengeluaran'),
        file('proof', 'Bukti Transaksi', 'komite_finance')
      ]
    },
    '#/student-affairs/rules': {
      node: 'student_affairs/violations', noun: 'Pelanggaran & TPPK', writeRoles: SA, dateField: 'date', statusField: 'status', badges: { ...badges, Dilaporkan: 'warning', Ditindaklanjuti: 'warning' },
      subtitle: 'Pencatatan pelanggaran tata tertib dan kasus TPPK beserta tindak lanjutnya.',
      summary: [
        { label: 'Total Catatan', icon: 'ph-gavel', tone: 'primary' },
        { label: 'Belum Selesai', icon: 'ph-hourglass', tone: 'warning', where: { status: ['Dilaporkan', 'Ditindaklanjuti'] } },
        { label: 'Kasus Berat', icon: 'ph-warning', tone: 'danger', where: { severity: 'Berat' } },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('studentId', 'Siswa', 'student', { required: true }),
        t('title', 'Pelanggaran / Kasus', { required: true }),
        sel('category', 'Kategori', ['Kedisiplinan', 'Kerapian', 'Kehadiran', 'Bullying / Kekerasan (TPPK)', 'Lainnya'], { required: true }),
        sel('severity', 'Tingkat', ['Ringan', 'Sedang', 'Berat'], { required: true }),
        sel('status', 'Status Kasus', ['Dilaporkan', 'Ditindaklanjuti', 'Selesai Pembinaan'], { required: true }),
        sel('actionFollowUp', 'Bentuk Pembinaan', ['Peringatan Lisan', 'Surat Peringatan (SP1)', 'Panggilan Orang Tua', 'Konseling Guru BK', 'Selesai Pembinaan'], { required: true }),
        area('description', 'Kronologi Kejadian', { required: true }),
        area('action', 'Catatan Tindak Lanjut & Kesepakatan')
      ]
    },
    '#/student-affairs/achievements': {
      node: 'student_affairs/achievements', noun: 'Prestasi Siswa', writeRoles: SA, dateField: 'date',
      subtitle: 'Rekap lomba dan penghargaan siswa.',
      derive: (p) => ({ year: year(p.date) }),
      summary: [
        { label: 'Total Prestasi', icon: 'ph-medal', tone: 'primary' },
        { label: 'Tingkat Nasional+', icon: 'ph-trophy', tone: 'warning', where: { level: ['Nasional', 'Internasional'] } },
        { label: 'Akademik', icon: 'ph-student', tone: 'success', where: { category: 'Akademik' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('studentId', 'Siswa', 'student', { required: true }),
        t('title', 'Nama Lomba / Penghargaan', { required: true }),
        sel('category', 'Bidang', ['Akademik', 'Olahraga', 'Seni', 'Keagamaan', 'Lainnya'], { required: true }),
        sel('level', 'Tingkat', ['Sekolah', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nasional', 'Internasional'], { required: true }),
        t('rank', 'Peringkat / Juara'),
        area('description', 'Keterangan')
      ]
    },
    '#/student-affairs/scholarships': {
      node: 'student_affairs/scholarships', noun: 'Beasiswa & PIP', writeRoles: SA, statusField: 'status', badges,
      subtitle: 'Data penerima beasiswa dan Program Indonesia Pintar.',
      summary: [
        { label: 'Total Penerima', icon: 'ph-hand-coins', tone: 'primary' },
        { label: 'Dicairkan', icon: 'ph-check-circle', tone: 'success', where: { status: 'Dicairkan' } },
        { label: 'Total Dana', icon: 'ph-wallet', tone: 'warning', sum: 'amount', money: true }
      ],
      fields: [
        ref('studentId', 'Siswa', 'student', { required: true }),
        sel('program', 'Program', ['PIP', 'Beasiswa Yayasan', 'Beasiswa Prestasi', 'Lainnya'], { required: true }),
        t('academicYear', 'Tahun Ajaran', { required: true }),
        money('amount', 'Nominal'),
        sel('status', 'Status', ['Diajukan', 'Disetujui', 'Dicairkan', 'Ditolak'], { required: true }),
        area('note', 'Catatan')
      ]
    },
    '#/student-affairs/mpls': {
      node: 'student_affairs/mpls', noun: 'Kegiatan MPLS', writeRoles: SA, dateField: 'date', statusField: 'status', badges: { ...badges, Direncanakan: 'warning', Berjalan: 'warning' },
      subtitle: 'Perencanaan dan pelaksanaan Masa Pengenalan Lingkungan Sekolah serta pembagian gugus siswa baru.',
      summary: [
        { label: 'Total Kegiatan', icon: 'ph-flag-banner', tone: 'primary' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } },
        { label: 'Total Peserta', icon: 'ph-users-three', tone: 'warning', sum: 'participants' }
      ],
      fields: [
        date('date', 'Tanggal Kegiatan', { required: true }),
        t('title', 'Nama Kegiatan / Agenda', { required: true }),
        sel('gugus', 'Gugus Siswa Baru', ['Semua Gugus', 'Gugus 1 (Abu Bakar)', 'Gugus 2 (Umar bin Khattab)', 'Gugus 3 (Utsman bin Affan)', 'Gugus 4 (Ali bin Abi Thalib)'], { required: true }),
        ref('mentorId', 'Guru Pendamping / Pemateri', 'teacher'),
        t('location', 'Tempat / Ruangan'),
        num('participants', 'Jumlah Siswa'),
        sel('status', 'Status Pelaksanaan', ['Direncanakan', 'Berjalan', 'Selesai'], { required: true }),
        area('description', 'Deskripsi & Sasaran Pembelajaran')
      ]
    },
    '#/student-affairs/ppdb': {
      node: 'spmb_registrations', noun: 'Penerimaan Siswa Baru (SPMB / PPDB)', writeRoles: SA, dateField: 'timestamp', statusField: 'status',
      badges: { ...badges, Mendaftar: 'warning', Seleksi: 'primary', Diterima: 'success', Ditolak: 'danger' },
      subtitle: 'Data pendaftar siswa baru online (SPMB) dan mutasi siswa.',
      summary: [
        { label: 'Total Pendaftar', icon: 'ph-users', tone: 'primary' },
        { label: 'Diterima', icon: 'ph-check-circle', tone: 'success', where: { status: 'Diterima' } },
        { label: 'Dalam Seleksi', icon: 'ph-hourglass', tone: 'warning', where: { status: ['Mendaftar', 'Seleksi'] } }
      ],
      fields: [
        t('nama_lengkap', 'Nama Calon Siswa', { required: true }),
        sel('jenis_kelamin', 'Jenis Kelamin', ['Laki-laki', 'Perempuan']),
        t('nik', 'NIK (16 Digit)'),
        t('nisn', 'NISN'),
        t('sekolah_asal', 'Sekolah Asal'),
        t('nama_ibu', 'Nama Orang Tua / Wali'),
        t('wa_orangtua', 'No. WhatsApp / HP', { required: true }),
        t('email_orangtua', 'Email Orang Tua'),
        sel('status', 'Status Pendaftaran', ['Mendaftar', 'Seleksi', 'Diterima', 'Ditolak'], { required: true }),
        file('bukti_transfer', 'Bukti Transfer Pendaftaran', 'spmb_transfer'),
        area('catatan', 'Catatan Panitia / Seleksi')
      ]
    },
    '#/personnel/data': {
      node: 'personnel/directory', noun: 'Data Kepegawaian', writeRoles: PE, statusField: 'status', badges: { ...badges, Cuti: 'warning' },
      subtitle: 'Direktori resmi SDM GTK SD Muhammadiyah 1 Sedati bersumber Dapodik.',
      summary: [
        { label: 'Total Pegawai', icon: 'ph-folder-user', tone: 'primary' },
        { label: 'Aktif', icon: 'ph-check-circle', tone: 'success', where: { status: 'Aktif' } },
        { label: 'Cuti', icon: 'ph-airplane-tilt', tone: 'warning', where: { status: 'Cuti' } }
      ],
      fields: [
        t('name', 'Nama Lengkap', { required: true }),
        t('nbm', 'NBM (Nomor Baku Muhammadiyah)'),
        t('nuptk', 'NUPTK'),
        t('position', 'Jabatan / Tugas', { required: true }),
        sel('employmentStatus', 'Status Kepegawaian', ['PNS', 'GTY', 'GTT', 'Honorer', 'Tendik'], { required: true }),
        t('phone', 'No. HP / WA'),
        t('education', 'Pendidikan Terakhir'),
        date('joinDate', 'TMT Pengangkatan / Bergabung'),
        ref('userId', 'Akun Sistem (opsional)', 'user'),
        sel('status', 'Status', ['Aktif', 'Cuti', 'Nonaktif'], { required: true, default: 'Aktif' })
      ]
    },
    '#/personnel/evaluations': { wakaOnly: true,
      node: 'personnel/evaluations', noun: 'Penilaian Kinerja SDM', writeRoles: PE, dateField: 'date', statusField: 'statusRecommendation', badges: { 'Prioritas': 'success', 'Prospek': 'success', 'Lanjutan': 'info', 'Pemula': 'warning', 'Perlu Pembinaan': 'danger', 'Naik': 'success', 'Tetap': 'info' },
      subtitle: 'Format Penilaian Kinerja SDM Majelis Dikdasmen & PNF PCM Sedati: Loyalitas, Kapasitas, dan Kapabilitas.',
      derive: (p) => {
        const l1 = Number(p.loyaltyCountry) || 0;
        const l2 = Number(p.loyaltyMuhammadiyah) || 0;
        const l3 = Number(p.loyaltyAum) || 0;
        const l4 = Number(p.loyaltyCommitment) || 0;
        const avgLoyalty = Math.round((l1 + l2 + l3 + l4) / 4);
        const c1 = Number(p.capacityExemplary) || 0;
        const c2 = Number(p.capacityTeamwork) || 0;
        const c3 = Number(p.capacityLeadership) || 0;
        const c4 = Number(p.capacityDiscipline) || 0;
        const c5 = Number(p.capacityInnovation) || 0;
        const c6 = Number(p.capacityResponsibility) || 0;
        const c7 = Number(p.capacityIntegrity) || 0;
        const c8 = Number(p.capacitySelfDev) || 0;
        const avgCapacity = Math.round((c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8) / 8);
        const avgCapability = Number(p.capabilitySop) || 0;
        const avgTotal = Math.round((avgLoyalty + avgCapacity + avgCapability) / 3);
        const isPass = (avgLoyalty >= 75) && (avgCapacity >= 75) && (avgCapability >= 75);
        let pred = 'Pemula';
        if (!isPass) {
          pred = 'Perlu Pembinaan';
        } else if (avgTotal >= 90) {
          pred = 'Prioritas';
        } else if (avgTotal >= 85) {
          pred = 'Prospek';
        } else if (avgTotal >= 81) {
          pred = 'Lanjutan';
        }
        const recStatus = p.statusRecommendation || (isPass && avgTotal >= 85 ? 'Naik' : 'Tetap');
        return {
          avgLoyalty: avgLoyalty,
          avgCapacity: avgCapacity,
          avgCapability: avgCapability,
          score: avgTotal,
          predicate: pred,
          statusRecommendation: recStatus
        };
      },
      summary: [
        { label: 'Total Penilaian', icon: 'ph-chart-line-up', tone: 'primary' },
        { label: 'Rekomendasi Naik', icon: 'ph-arrow-up-right', tone: 'success', where: { statusRecommendation: 'Naik' } },
        { label: 'Perlu Pembinaan', icon: 'ph-warning', tone: 'danger', where: { predicate: 'Perlu Pembinaan' } }
      ],
      fields: [
        date('date', 'Tanggal Penilaian', { required: true }),
        ref('employeeId', 'Pegawai SDM', 'employee', { required: true }),
        t('period', 'Periode Penilaian (contoh: Semester Ganjil 2026/2027)', { required: true }),
        num('loyaltyCountry', '1.1 Loyalitas thd Negara (1-100, Lulus >= 75)', { required: true }),
        num('loyaltyMuhammadiyah', '1.2 Loyalitas thd Perserikatan (1-100, Lulus >= 75)', { required: true }),
        num('loyaltyAum', '1.3 Loyalitas thd AUM (1-100, Lulus >= 75)', { required: true }),
        num('loyaltyCommitment', '1.4 Kepatuhan & Komitmen (1-100, Lulus >= 75)', { required: true }),
        num('avgLoyalty', 'Rata-rata Loyalitas', { readonly: true }),
        num('capacityExemplary', '2.1 Keteladanan / Uswah Hasanah (1-100, Lulus >= 75)', { required: true }),
        num('capacityTeamwork', '2.2 Team Work / Kolektif Kolegial (1-100, Lulus >= 75)', { required: true }),
        num('capacityLeadership', '2.3 Leadership (1-100, Lulus >= 75)', { required: true }),
        num('capacityDiscipline', '2.4 Kedisiplinan (1-100, Lulus >= 75)', { required: true }),
        num('capacityInnovation', '2.5 Inovasi & Kreasi (1-100, Lulus >= 75)', { required: true }),
        num('capacityResponsibility', '2.6 Tanggung Jawab / Responsibility (1-100, Lulus >= 75)', { required: true }),
        num('capacityIntegrity', '2.7 Kejujuran (1-100, Lulus >= 75)', { required: true }),
        num('capacitySelfDev', '2.8 Pengembangan Diri (1-100, Lulus >= 75)', { required: true }),
        num('avgCapacity', 'Rata-rata Kapasitas', { readonly: true }),
        num('capabilitySop', '3.1 Pelaksanaan Jobdesk & SOP SDM (1-100, Lulus >= 75)', { required: true }),
        num('avgCapability', 'Rata-rata Kapabilitas', { readonly: true }),
        num('score', 'Rata-rata Total Nilai Kinerja', { readonly: true }),
        sel('predicate', 'Kategori Kinerja SDM', ['Prioritas', 'Prospek', 'Lanjutan', 'Pemula', 'Perlu Pembinaan'], { readonly: true }),
        sel('statusRecommendation', 'Status Rekomendasi (Naik / Tetap)', ['Naik', 'Tetap'], { required: true, default: 'Tetap' }),
        area('note', 'Catatan Pembinaan & Evaluasi SDM')
      ]
    },
    '#/personnel/portfolio': { own: true,
      node: 'personnel/portfolio', noun: 'Portofolio & Kompetensi', writeRoles: [R.PERSONNEL, R.GURU, R.TENDIK], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Riwayat pelatihan, workshop, sertifikasi kompetensi, dan rekam jejak portofolio SDM.',
      summary: [
        { label: 'Total Portofolio', icon: 'ph-folder-star', tone: 'primary' },
        { label: 'Total Jam (JP)', icon: 'ph-clock', tone: 'warning', sum: 'hours' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal Perolehan / Kegiatan', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        sel('category', 'Kategori', ['Pelatihan & Workshop', 'Sertifikasi Profesi', 'Portofolio Prestasi', 'Karya Inovasi / Publikasi', 'Lainnya'], { required: true, default: 'Pelatihan & Workshop' }),
        t('title', 'Nama Pelatihan / Judul Portofolio', { required: true }),
        t('organizer', 'Lembaga Penyelenggara / Penerbit'),
        num('hours', 'Jumlah Jam (JP)'),
        t('certificateNo', 'Nomor Sertifikat / SK'),
        sel('status', 'Status', ['Direncanakan', 'Sedang Berjalan', 'Selesai'], { required: true, default: 'Selesai' }),
        file('document', 'Berkas Sertifikat / Portofolio', 'personnel_portfolio', { accept: '.pdf,image/*' }),
        area('description', 'Keterangan Capaian & Deskripsi')
      ]
    },
    '#/personnel/training': { own: true,
      node: 'personnel/portfolio', noun: 'Portofolio & Kompetensi', writeRoles: [R.PERSONNEL, R.GURU, R.TENDIK], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Riwayat pelatihan, workshop, sertifikasi kompetensi, dan rekam jejak portofolio SDM.',
      summary: [
        { label: 'Total Portofolio', icon: 'ph-folder-star', tone: 'primary' },
        { label: 'Total Jam (JP)', icon: 'ph-clock', tone: 'warning', sum: 'hours' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal Perolehan / Kegiatan', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        sel('category', 'Kategori', ['Pelatihan & Workshop', 'Sertifikasi Profesi', 'Portofolio Prestasi', 'Karya Inovasi / Publikasi', 'Lainnya'], { required: true, default: 'Pelatihan & Workshop' }),
        t('title', 'Nama Pelatihan / Judul Portofolio', { required: true }),
        t('organizer', 'Lembaga Penyelenggara / Penerbit'),
        num('hours', 'Jumlah Jam (JP)'),
        t('certificateNo', 'Nomor Sertifikat / SK'),
        sel('status', 'Status', ['Direncanakan', 'Sedang Berjalan', 'Selesai'], { required: true, default: 'Selesai' }),
        file('document', 'Berkas Sertifikat / Portofolio', 'personnel_portfolio', { accept: '.pdf,image/*' }),
        area('description', 'Keterangan Capaian & Deskripsi')
      ]
    },
    '#/finance/welfare': {
      node: 'finance/welfare', noun: 'Kesejahteraan Pegawai', writeRoles: [R.FINANCE, R.BENDAHARA, R.ADMIN], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Penetapan hak tunjangan sosial, apresiasi, santunan duka/sakit, dan persalinan pegawai oleh Keuangan.',
      summary: [
        { label: 'Total Catatan', icon: 'ph-heart', tone: 'primary' },
        { label: 'Total Nominal', icon: 'ph-wallet', tone: 'success', sum: 'amount', money: true },
        { label: 'Disetujui', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui Waka' } }
      ],
      fields: [
        date('date', 'Tanggal SK / Pengajuan', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        sel('type', 'Jenis Kesejahteraan', ['Santunan Sakit', 'Santunan Duka', 'Bantuan Persalinan', 'Apresiasi Prestasi', 'Tunjangan Hari Raya', 'Lainnya'], { required: true }),
        money('amount', 'Nominal Bantuan', { required: true }),
        sel('status', 'Status Persetujuan', ['Diajukan', 'Disetujui Waka', 'Dicairkan Keuangan', 'Ditolak'], { required: true }),
        file('document', 'Berkas Pendukung / Surat Dokter', 'welfare_docs'),
        area('note', 'Keterangan / Alasan')
      ],
      after: async (p, ctx, id) => {
        if (p.status === 'Dicairkan Keuangan' && p.amount > 0) {
          const empName = p.employeeIdName || p.employeeId || 'Pegawai';
          const ledgerRef = db.ref('finance/ledger').push();
          await ledgerRef.set({
            date: p.date || new Date().toISOString().slice(0, 10),
            type: 'expense',
            category: 'Honor',
            refNo: `WLF-${id ? id.slice(-6) : Date.now()}`,
            description: `Realisasi Kesejahteraan Pegawai: ${p.type || 'Tunjangan'} (${empName})`,
            amount: Number(p.amount) || 0,
            method: 'Transfer',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            sourceModule: 'finance/welfare',
            sourceId: id
          });
        }
      }
    },
    '#/personnel/welfare': {
      node: 'finance/welfare', noun: 'Kesejahteraan Pegawai', writeRoles: [R.FINANCE, R.BENDAHARA, R.ADMIN], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Penetapan hak tunjangan sosial, apresiasi, santunan duka/sakit, dan persalinan pegawai oleh Keuangan.',
      summary: [
        { label: 'Total Catatan', icon: 'ph-heart', tone: 'primary' },
        { label: 'Total Nominal', icon: 'ph-wallet', tone: 'success', sum: 'amount', money: true },
        { label: 'Disetujui', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui Waka' } }
      ],
      fields: [
        date('date', 'Tanggal SK / Pengajuan', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        sel('type', 'Jenis Kesejahteraan', ['Santunan Sakit', 'Santunan Duka', 'Bantuan Persalinan', 'Apresiasi Prestasi', 'Tunjangan Hari Raya', 'Lainnya'], { required: true }),
        money('amount', 'Nominal Bantuan', { required: true }),
        sel('status', 'Status Persetujuan', ['Diajukan', 'Disetujui Waka', 'Dicairkan Keuangan', 'Ditolak'], { required: true }),
        file('document', 'Berkas Pendukung / Surat Dokter', 'welfare_docs'),
        area('note', 'Keterangan / Alasan')
      ]
    },
    '#/personnel/publications': {
      node: 'personnel/announcements', noun: 'Publikasi & Informasi', writeRoles: PE, dateField: 'date', statusField: 'audience', badges: {},
      subtitle: 'Pengumuman dan informasi internal sekolah.',
      summary: [
        { label: 'Total Publikasi', icon: 'ph-megaphone', tone: 'primary' },
        { label: 'Untuk Semua', icon: 'ph-users-three', tone: 'success', where: { audience: 'Semua' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Judul', { required: true }),
        sel('audience', 'Sasaran', ['Semua', 'Guru', 'Tendik', 'Orang Tua'], { required: true }),
        area('description', 'Isi Informasi', { required: true })
      ]
    },
    '#/personnel/complaints': {
      node: 'personnel/complaints', noun: 'Layanan Pengaduan', writeRoles: PE, dateField: 'date', statusField: 'status', badges: { ...badges, Baru: 'danger', Diproses: 'warning' },
      subtitle: 'Pencatatan dan penanganan pengaduan dari warga sekolah.',
      summary: [
        { label: 'Total Pengaduan', icon: 'ph-chats', tone: 'primary' },
        { label: 'Baru', icon: 'ph-bell-ringing', tone: 'danger', where: { status: 'Baru' } },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('reporter', 'Pelapor', { required: true }),
        sel('category', 'Kategori', ['Layanan', 'Sarana', 'Akademik', 'Kepegawaian', 'Lainnya'], { required: true }),
        sel('status', 'Status', ['Baru', 'Diproses', 'Selesai'], { required: true, default: 'Baru' }),
        area('description', 'Isi Pengaduan', { required: true }),
        area('response', 'Tanggapan')
      ]
    },
    '#/personnel/partnerships': {
      node: 'personnel/partnerships', noun: 'Kemitraan & MoU', writeRoles: PE, dateField: 'startDate', statusField: 'status', badges: { ...badges, Penjajakan: 'warning' },
      subtitle: 'Daftar mitra dan perjanjian kerja sama.',
      summary: [
        { label: 'Total Mitra', icon: 'ph-handshake', tone: 'primary' },
        { label: 'Aktif', icon: 'ph-check-circle', tone: 'success', where: { status: 'Aktif' } },
        { label: 'Berakhir', icon: 'ph-clock-countdown', tone: 'danger', where: { status: 'Berakhir' } }
      ],
      fields: [
        t('partner', 'Nama Mitra', { required: true }),
        sel('type', 'Jenis', ['Instansi', 'Perusahaan', 'Lembaga Pendidikan', 'Komunitas'], { required: true }),
        date('startDate', 'Mulai'),
        date('endDate', 'Berakhir'),
        t('picName', 'Narahubung'),
        sel('status', 'Status', ['Penjajakan', 'Aktif', 'Berakhir'], { required: true }),
        area('note', 'Cakupan Kerja Sama')
      ]
    },
    '#/personnel/events': {
      node: 'personnel/events', noun: 'Manajemen Acara', writeRoles: PE, dateField: 'date', statusField: 'status', badges: { ...badges, Direncanakan: 'warning', Berjalan: 'warning' },
      subtitle: 'Agenda dan kepanitiaan acara sekolah.',
      summary: [
        { label: 'Total Acara', icon: 'ph-calendar-star', tone: 'primary' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } },
        { label: 'Total Anggaran', icon: 'ph-wallet', tone: 'warning', sum: 'budget', money: true }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Nama Acara', { required: true }),
        t('location', 'Tempat'),
        t('pic', 'Penanggung Jawab'),
        money('budget', 'Anggaran'),
        sel('status', 'Status', ['Direncanakan', 'Berjalan', 'Selesai'], { required: true }),
        area('description', 'Deskripsi')
      ]
    },
    '#/facilities/inventory': {
      node: 'facilities/assets', noun: 'Buku Inventaris', writeRoles: FA, dateField: 'acquiredDate', statusField: 'status', badges: { ...badges, Dipinjam: 'warning', Dihapus: 'danger' },
      subtitle: 'Register aset sekolah beserta lokasi dan kondisi.',
      summary: [
        { label: 'Jenis Aset', icon: 'ph-archive-box', tone: 'primary' },
        { label: 'Total Unit', icon: 'ph-stack', tone: 'success', sum: 'qty' },
        { label: 'Rusak', icon: 'ph-warning', tone: 'danger', where: { condition: ['Rusak Ringan', 'Rusak Berat'] } },
        { label: 'Nilai Perolehan', icon: 'ph-wallet', tone: 'warning', sum: 'price', money: true }
      ],
      fields: [
        t('code', 'Kode Inventaris', { required: true }),
        t('name', 'Nama Barang', { required: true }),
        sel('category', 'Kategori', ['Furniture', 'Elektronik', 'Bangunan', 'Kendaraan', 'Alat Olahraga', 'Buku / Perpustakaan', 'Lainnya'], { required: true }),
        t('room', 'Lokasi / Ruangan'),
        num('qty', 'Jumlah', { default: 1 }),
        sel('condition', 'Kondisi', ['Baik', 'Rusak Ringan', 'Rusak Berat'], { required: true, default: 'Baik' }),
        sel('source', 'Sumber', ['BOS', 'Hibah', 'Yayasan', 'Swadaya', 'Lainnya']),
        date('acquiredDate', 'Tgl Perolehan'),
        money('price', 'Harga Perolehan'),
        sel('status', 'Status', ['Aktif', 'Dipinjam', 'Dihapus'], { required: true, default: 'Aktif' })
      ]
    },
    '#/facilities/dapodik': {
      node: 'facilities/rooms', noun: 'Data Sarpras Dapodik', writeRoles: FA, statusField: 'condition', badges: { Baik: 'success', 'Rusak Ringan': 'warning', 'Rusak Berat': 'danger' },
      subtitle: 'Data ruangan dan bangunan sesuai format Dapodik.',
      summary: [
        { label: 'Total Ruangan', icon: 'ph-building-office', tone: 'primary' },
        { label: 'Total Luas (m2)', icon: 'ph-ruler', tone: 'success', sum: 'area' },
        { label: 'Rusak', icon: 'ph-warning', tone: 'danger', where: { condition: ['Rusak Ringan', 'Rusak Berat'] } }
      ],
      fields: [
        t('name', 'Nama Ruangan', { required: true }),
        sel('type', 'Jenis', ['Ruang Kelas', 'Laboratorium', 'Perpustakaan', 'Ruang Guru', 'Toilet', 'Musala', 'Aula', 'Lainnya'], { required: true }),
        num('area', 'Luas (m2)'),
        num('capacity', 'Kapasitas'),
        num('yearBuilt', 'Tahun Dibangun'),
        sel('condition', 'Kondisi', ['Baik', 'Rusak Ringan', 'Rusak Berat'], { required: true, default: 'Baik' }),
        t('dapodikId', 'ID Dapodik'),
        area('note', 'Catatan')
      ]
    },
    '#/facilities/planning': { wakaOnly: true,
      node: 'facilities/needs', noun: 'Analisis Kebutuhan', writeRoles: FA, statusField: 'status', badges: { ...badges, Diusulkan: 'warning', Ditunda: 'warning' },
      subtitle: 'Usulan kebutuhan sarana dan prasarana beserta prioritasnya.',
      summary: [
        { label: 'Total Usulan', icon: 'ph-clipboard-text', tone: 'primary' },
        { label: 'Prioritas Tinggi', icon: 'ph-flag', tone: 'danger', where: { priority: 'Tinggi' } },
        { label: 'Estimasi Biaya', icon: 'ph-wallet', tone: 'warning', sum: 'estimate', money: true }
      ],
      fields: [
        t('item', 'Kebutuhan', { required: true }),
        sel('category', 'Kategori', ['Furniture', 'Elektronik', 'Bangunan', 'Alat Pembelajaran', 'Lainnya'], { required: true }),
        num('qty', 'Jumlah', { default: 1 }),
        sel('priority', 'Prioritas', ['Tinggi', 'Sedang', 'Rendah'], { required: true }),
        money('estimate', 'Estimasi Biaya'),
        sel('status', 'Status', ['Diusulkan', 'Disetujui', 'Ditunda', 'Terpenuhi'], { required: true, default: 'Diusulkan' }),
        area('reason', 'Alasan / Dasar Kebutuhan')
      ]
    },
    '#/facilities/rkas': { wakaOnly: true,
      node: 'facilities/procurement', noun: 'Rencana Pengadaan (RKAS)', writeRoles: FA, statusField: 'status', badges: { ...badges, Rencana: 'warning', Proses: 'warning' },
      subtitle: 'Rencana dan realisasi pengadaan barang.',
      derive: (p) => ({ total: Number(p.qty || 0) * Number(p.unitPrice || 0) }),
      summary: [
        { label: 'Total Rencana', icon: 'ph-shopping-cart', tone: 'primary' },
        { label: 'Terealisasi', icon: 'ph-check-circle', tone: 'success', where: { status: 'Terealisasi' } },
        { label: 'Total Anggaran', icon: 'ph-wallet', tone: 'warning', sum: 'total', money: true }
      ],
      fields: [
        t('item', 'Barang / Jasa', { required: true }),
        t('academicYear', 'Tahun Anggaran', { required: true }),
        num('qty', 'Jumlah', { default: 1 }),
        money('unitPrice', 'Harga Satuan'),
        sel('source', 'Sumber Dana', ['BOS', 'Yayasan', 'Hibah', 'Lainnya']),
        sel('status', 'Status', ['Rencana', 'Proses', 'Terealisasi'], { required: true, default: 'Rencana' }),
        area('note', 'Catatan')
      ]
    },
    '#/facilities/maintenance': {
      node: 'facilities/maintenance', noun: 'Perawatan Gedung', writeRoles: FA, dateField: 'date', statusField: 'status', badges: { ...badges, Direncanakan: 'warning', Dikerjakan: 'warning' },
      subtitle: 'Jadwal dan riwayat perawatan gedung serta perbaikan.',
      summary: [
        { label: 'Total Pekerjaan', icon: 'ph-wrench', tone: 'primary' },
        { label: 'Berjalan', icon: 'ph-hourglass', tone: 'warning', where: { status: ['Direncanakan', 'Dikerjakan'] } },
        { label: 'Total Biaya', icon: 'ph-wallet', tone: 'danger', sum: 'cost', money: true }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Pekerjaan', { required: true }),
        t('location', 'Lokasi', { required: true }),
        ref('assetId', 'Aset Terkait', 'asset'),
        sel('type', 'Jenis', ['Rutin', 'Perbaikan', 'Renovasi'], { required: true }),
        t('technician', 'Pelaksana / Teknisi'),
        money('cost', 'Biaya'),
        sel('status', 'Status', ['Direncanakan', 'Dikerjakan', 'Selesai'], { required: true, default: 'Direncanakan' }),
        area('note', 'Catatan')
      ]
    },
    '#/facilities/safety': {
      node: 'facilities/safety', noun: 'Pengecekan Keamanan', writeRoles: FA, dateField: 'date', statusField: 'result', badges: { ...badges, 'Perlu Perhatian': 'warning' },
      subtitle: 'Inspeksi keamanan area dan peralatan keselamatan.',
      summary: [
        { label: 'Total Inspeksi', icon: 'ph-shield-check', tone: 'primary' },
        { label: 'Aman', icon: 'ph-check-circle', tone: 'success', where: { result: 'Aman' } },
        { label: 'Perlu Tindakan', icon: 'ph-warning', tone: 'danger', where: { result: ['Perlu Perhatian', 'Bahaya'] } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('area', 'Area', { required: true }),
        sel('checkItem', 'Objek Pemeriksaan', ['APAR', 'Instalasi Listrik', 'Jalur Evakuasi', 'Pagar & Gerbang', 'Kotak P3K', 'CCTV', 'Lainnya'], { required: true }),
        sel('result', 'Hasil', ['Aman', 'Perlu Perhatian', 'Bahaya'], { required: true }),
        t('inspector', 'Petugas'),
        area('note', 'Temuan / Tindak Lanjut')
      ]
    },
    '#/facilities/electronics': {
      node: 'facilities/electronics', noun: 'Pemeliharaan Elektronik & IT', writeRoles: FA, dateField: 'nextService', statusField: 'status', badges: { ...badges, 'Perlu Servis': 'warning' },
      subtitle: 'Daftar perangkat elektronik dan jadwal servis.',
      summary: [
        { label: 'Total Perangkat', icon: 'ph-desktop', tone: 'primary' },
        { label: 'Normal', icon: 'ph-check-circle', tone: 'success', where: { status: 'Normal' } },
        { label: 'Perlu Servis / Rusak', icon: 'ph-warning', tone: 'danger', where: { status: ['Perlu Servis', 'Rusak'] } }
      ],
      fields: [
        t('name', 'Perangkat', { required: true }),
        sel('type', 'Jenis', ['Komputer / Laptop', 'Proyektor', 'Printer', 'Jaringan', 'AC', 'Audio', 'Lainnya'], { required: true }),
        t('location', 'Lokasi'),
        date('lastService', 'Servis Terakhir', { default: '' }),
        date('nextService', 'Servis Berikutnya', { default: '' }),
        sel('status', 'Status', ['Normal', 'Perlu Servis', 'Rusak'], { required: true, default: 'Normal' }),
        area('note', 'Catatan')
      ]
    },
    '#/facilities/loans': {
      node: 'facilities/loans', noun: 'Peminjaman Fasilitas', writeRoles: FA, dateField: 'date', statusField: 'status', badges: { ...badges, Dipinjam: 'warning' },
      subtitle: 'Pencatatan peminjaman barang dan ruangan.',
      summary: [
        { label: 'Total Peminjaman', icon: 'ph-hand-pointing', tone: 'primary' },
        { label: 'Sedang Dipinjam', icon: 'ph-hourglass', tone: 'warning', where: { status: 'Dipinjam' } },
        { label: 'Dikembalikan', icon: 'ph-check-circle', tone: 'success', where: { status: 'Dikembalikan' } }
      ],
      fields: [
        date('date', 'Tanggal Pinjam', { required: true }),
        t('item', 'Barang / Ruangan', { required: true }),
        t('borrower', 'Peminjam', { required: true }),
        date('returnDate', 'Rencana Kembali', { default: '' }),
        sel('status', 'Status', ['Dipinjam', 'Dikembalikan'], { required: true, default: 'Dipinjam' }),
        area('purpose', 'Keperluan')
      ]
    },
    '#/facilities/disposal': {
      node: 'facilities/disposals', noun: 'Penghapusan Aset', writeRoles: FA, dateField: 'date', statusField: 'status', badges: { ...badges, Diajukan: 'warning' },
      subtitle: 'Usulan dan berita acara penghapusan aset rusak.',
      summary: [
        { label: 'Total Usulan', icon: 'ph-trash', tone: 'primary' },
        { label: 'Diajukan', icon: 'ph-hourglass', tone: 'warning', where: { status: 'Diajukan' } },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('assetId', 'Aset', 'asset', { required: true }),
        sel('method', 'Metode', ['Dihapus', 'Dilelang', 'Dihibahkan'], { required: true }),
        t('reportNo', 'No. Berita Acara'),
        sel('status', 'Status', ['Diajukan', 'Disetujui', 'Selesai'], { required: true, default: 'Diajukan' }),
        area('reason', 'Alasan Penghapusan', { required: true })
      ]
    },
    '#/finance/transactions': {
      node: 'finance/ledger', noun: 'Penerimaan & Pengeluaran', writeRoles: FI, dateField: 'date', statusField: 'type', badges: { income: 'success', expense: 'danger' },
      subtitle: 'Jurnal transaksi kas. Menjadi sumber Buku Kas Umum dan ringkasan dashboard.',
      summary: [
        { label: 'Total Transaksi', icon: 'ph-arrows-left-right', tone: 'primary' },
        { label: 'Penerimaan', icon: 'ph-arrow-down-left', tone: 'success', where: { type: 'income' }, sum: 'amount', money: true },
        { label: 'Pengeluaran', icon: 'ph-arrow-up-right', tone: 'danger', where: { type: 'expense' }, sum: 'amount', money: true }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        sel('type', 'Tipe', [{ value: 'income', label: 'Penerimaan' }, { value: 'expense', label: 'Pengeluaran' }], { required: true }),
        t('refNo', 'No. Bukti'),
        sel('category', 'Kategori', ['BOS', 'SPP', 'Donasi', 'Honor', 'ATK', 'Listrik & Air', 'Pemeliharaan', 'Kegiatan', 'Lainnya'], { required: true }),
        t('description', 'Uraian', { required: true }),
        money('amount', 'Nominal', { required: true }),
        sel('method', 'Metode', ['Tunai', 'Transfer'])
      ]
    },
    '#/finance/cashbook': {
      view: 'cashbook', writeRoles: [], subtitle: 'Buku Kas Umum per bulan dengan saldo berjalan, dihitung otomatis dari jurnal transaksi.'
    },
    '#/finance/rkas': { wakaOnly: true,
      node: 'finance/rkas', noun: 'Penyusunan RKAS', writeRoles: FI, statusField: 'status', badges: { ...badges, Draft: 'warning', Revisi: 'warning' },
      subtitle: 'Pagu anggaran dan realisasi per komponen.',
      derive: (p) => ({ remaining: Number(p.pagu || 0) - Number(p.realized || 0) }),
      summary: [
        { label: 'Komponen', icon: 'ph-chart-bar', tone: 'primary' },
        { label: 'Total Pagu', icon: 'ph-wallet', tone: 'warning', sum: 'pagu', money: true },
        { label: 'Realisasi', icon: 'ph-check-circle', tone: 'success', sum: 'realized', money: true },
        { label: 'Sisa', icon: 'ph-piggy-bank', tone: 'danger', sum: 'remaining', money: true }
      ],
      fields: [
        t('fiscalYear', 'Tahun Anggaran', { required: true }),
        t('code', 'Kode'),
        t('component', 'Komponen / Kegiatan', { required: true }),
        sel('category', 'Kategori', ['Pengembangan Perpustakaan', 'Kegiatan Pembelajaran', 'Evaluasi', 'Administrasi', 'Honor', 'Sarpras', 'Lainnya'], { required: true }),
        money('pagu', 'Pagu', { required: true }),
        money('realized', 'Realisasi'),
        sel('status', 'Status', ['Draft', 'Revisi', 'Disetujui'], { required: true, default: 'Draft' })
      ]
    },
    '#/finance/archives': {
      node: 'finance/archives', noun: 'Arsip Bukti Transaksi', writeRoles: FI, dateField: 'date',
      subtitle: 'Register dokumen bukti transaksi dengan unggahan berkas.',
      summary: [
        { label: 'Total Dokumen', icon: 'ph-archive-box', tone: 'primary' },
        { label: 'Total Nilai', icon: 'ph-wallet', tone: 'warning', sum: 'amount', money: true }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('docNo', 'No. Dokumen', { required: true }),
        sel('docType', 'Jenis', ['Kuitansi', 'Nota', 'Faktur', 'SPJ', 'Lainnya'], { required: true }),
        t('title', 'Perihal', { required: true }),
        money('amount', 'Nominal'),
        file('fileUrl', 'Berkas Bukti Transaksi', 'finance_archives', { accept: '.pdf,image/*' }),
        area('note', 'Catatan')
      ]
    },
    '#/finance/reports': {
      node: 'finance/lpj', noun: 'LPJ & Sinkronisasi Kas', writeRoles: FI, dateField: 'submittedDate', statusField: 'status', badges: { ...badges, Draft: 'warning', Diserahkan: 'warning' },
      subtitle: 'Laporan pertanggungjawaban per periode.',
      derive: (p) => ({ balance: Number(p.totalIncome || 0) - Number(p.totalExpense || 0) }),
      summary: [
        { label: 'Total LPJ', icon: 'ph-file-text', tone: 'primary' },
        { label: 'Disetujui', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui' } }
      ],
      fields: [
        t('period', 'Periode', { required: true }),
        sel('reportType', 'Jenis', ['LPJ Bulanan', 'BOS Triwulan', 'Tahunan'], { required: true }),
        date('submittedDate', 'Tgl Penyerahan'),
        money('totalIncome', 'Total Penerimaan'),
        money('totalExpense', 'Total Pengeluaran'),
        sel('status', 'Status', ['Draft', 'Diserahkan', 'Disetujui'], { required: true, default: 'Draft' }),
        area('note', 'Catatan')
      ]
    },
    '#/finance/transparency': {
      node: 'finance/transparency', noun: 'Publikasi Anggaran', writeRoles: FI, statusField: 'published', badges: { Terpublikasi: 'success', Draft: 'warning' },
      subtitle: 'Ringkasan anggaran yang dipublikasikan kepada warga sekolah.',
      summary: [
        { label: 'Total Item', icon: 'ph-projector-screen', tone: 'primary' },
        { label: 'Terpublikasi', icon: 'ph-check-circle', tone: 'success', where: { published: 'Terpublikasi' } },
        { label: 'Total Nilai', icon: 'ph-wallet', tone: 'warning', sum: 'amount', money: true }
      ],
      fields: [
        t('fiscalYear', 'Tahun', { required: true }),
        t('title', 'Uraian', { required: true }),
        sel('category', 'Sumber', ['BOS', 'Yayasan', 'SPP', 'Hibah', 'Lainnya'], { required: true }),
        money('amount', 'Nilai', { required: true }),
        sel('published', 'Status', ['Draft', 'Terpublikasi'], { required: true, default: 'Draft' }),
        area('description', 'Keterangan')
      ]
    },
    '#/curriculum/schedules': {
      node: 'curriculum/schedules', noun: 'Jadwal Pelajaran', writeRoles: CU, statusField: 'day', badges: {},
      subtitle: 'Jadwal pelajaran per kelas.',
      summary: [
        { label: 'Total Slot', icon: 'ph-calendar', tone: 'primary' }
      ],
      fields: [
        sel('day', 'Hari', days, { required: true }),
        time('startTime', 'Mulai', { required: true }),
        time('endTime', 'Selesai', { required: true }),
        ref('classId', 'Kelas', 'class', { required: true }),
        ref('subjectId', 'Mata Pelajaran', 'subject', { required: true }),
        ref('teacherId', 'Guru', 'teacher', { required: true })
      ]
    },
    '#/curriculum/syllabus': { own: true,
      node: 'curriculum/documents', noun: 'Perangkat & Modul Ajar', writeRoles: [R.CURRICULUM, R.GURU, R.GURU_EKSKUL, R.GURU_UMMI], statusField: 'status', badges: { ...badges, 'Diajukan': 'warning', 'Disetujui (ACC)': 'success', 'Perlu Revisi': 'danger', 'Draft': 'neutral' }, units: ['GURU_UMUM', 'WALI_KELAS', 'GURU_EKSTRA', 'TIM_UMMI'],
      approverRoles: [R.CURRICULUM],
      approverUnits: ['WAKA_KURIKULUM', 'STAF_KURIKULUM'],
      seeAllUnits: ['WAKA_KURIKULUM', 'STAF_KURIKULUM'],
      subtitle: 'Pengumpulan, telaah, dan verifikasi perangkat pembelajaran guru oleh Kurikulum.',
      summary: [
        { label: 'Total Dokumen', icon: 'ph-folder-open', tone: 'primary' },
        { label: 'Menunggu ACC', icon: 'ph-hourglass', tone: 'warning', where: { status: 'Diajukan' } },
        { label: 'Disetujui (ACC)', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui (ACC)' } },
        { label: 'Perlu Revisi', icon: 'ph-warning-octagon', tone: 'danger', where: { status: 'Perlu Revisi' } }
      ],
      fields: [
        ref('teacherId', 'Guru Pengunggah', 'teacher', { required: true }),
        ref('subjectId', 'Mata Pelajaran', 'subject', { required: true }),
        sel('docType', 'Jenis Perangkat', ['Modul Ajar / RPP', 'Alur Tujuan Pembelajaran (ATP)', 'Program Tahunan (Prota)', 'Program Semester (Promes)'], { required: true }),
        sel('semester', 'Semester / Tahun Ajaran', [], { required: true }),
        sel('status', 'Status Verifikasi Kurikulum', ['Draft', 'Diajukan', 'Disetujui (ACC)', 'Perlu Revisi'], { required: true, default: 'Diajukan' }),
        file('fileUrl', 'Berkas Modul / Perangkat Ajar', 'curriculum_syllabus', { required: true, accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*' }),
        area('note', 'Catatan Guru / Materi Pokok'),
        area('reviewerFeedback', 'Catatan Peninjau / Revisi Kurikulum')
      ]
    },
    '#/curriculum/monitoring': {
      node: 'curriculum/monitoring', noun: 'Pemantauan KBM', writeRoles: CU, dateField: 'date', statusField: 'result', badges: { Sesuai: 'success', 'Perlu Pembinaan': 'warning' },
      subtitle: 'Catatan pemantauan kegiatan belajar mengajar.',
      summary: [
        { label: 'Total Pemantauan', icon: 'ph-eye', tone: 'primary' },
        { label: 'Sesuai', icon: 'ph-check-circle', tone: 'success', where: { result: 'Sesuai' } },
        { label: 'Perlu Pembinaan', icon: 'ph-warning', tone: 'warning', where: { result: 'Perlu Pembinaan' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('teacherId', 'Guru', 'teacher', { required: true }),
        ref('classId', 'Kelas', 'class'),
        ref('subjectId', 'Mata Pelajaran', 'subject'),
        sel('result', 'Hasil', ['Sesuai', 'Perlu Pembinaan'], { required: true }),
        area('observation', 'Temuan')
      ]
    },
    '#/curriculum/evaluations': { wakaOnly: true,
      node: 'curriculum/assessment_policies', noun: 'Sistem Penilaian', writeRoles: CU,
      subtitle: 'Kebijakan penilaian: KKM, bobot, dan jadwal asesmen.',
      summary: [
        { label: 'Total Kebijakan', icon: 'ph-exam', tone: 'primary' }
      ],
      fields: [
        t('title', 'Kebijakan', { required: true }),
        sel('policyType', 'Jenis', ['KKM', 'Bobot Nilai', 'Jadwal Asesmen', 'Kriteria Kenaikan Kelas', 'Lainnya'], { required: true }),
        t('academicYear', 'Tahun Ajaran'),
        t('value', 'Nilai / Ketentuan'),
        area('description', 'Penjelasan')
      ]
    },
    '#/curriculum/supervision': { wakaOnly: true,
      node: 'curriculum/supervision', noun: 'Supervisi Guru', writeRoles: CU, dateField: 'date', statusField: 'status', badges: { ...badges, Terjadwal: 'warning' },
      subtitle: 'Jadwal dan hasil supervisi akademik.',
      summary: [
        { label: 'Total Supervisi', icon: 'ph-chalkboard-teacher', tone: 'primary' },
        { label: 'Terjadwal', icon: 'ph-hourglass', tone: 'warning', where: { status: 'Terjadwal' } },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('teacherId', 'Guru', 'teacher', { required: true }),
        ref('classId', 'Kelas', 'class'),
        num('score', 'Skor (0-100)'),
        sel('status', 'Status', ['Terjadwal', 'Selesai'], { required: true, default: 'Terjadwal' }),
        area('findings', 'Temuan'),
        area('followUp', 'Tindak Lanjut')
      ]
    },
    '#/guru/ekstra/syllabus': {
      node: 'ekstra/syllabus', noun: 'Program Latihan Ekskul', writeRoles: [R.GURU], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Perencanaan dan target latihan ekstrakurikuler.',
      summary: [
        { label: 'Total Program', icon: 'ph-clipboard-text', tone: 'primary' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal / Periode', { required: true }),
        ref('ekstraId', 'Ekstrakurikuler', 'ekskul', { required: true }),
        t('title', 'Materi Latihan', { required: true }),
        area('target', 'Target Capaian'),
        sel('status', 'Status', ['Direncanakan', 'Berjalan', 'Selesai'], { required: true, default: 'Direncanakan' })
      ]
    },
    '#/guru/ekstra/talents': {
      node: 'ekstra/talents', noun: 'Pemetaan Siswa Berbakat', writeRoles: [R.GURU],
      subtitle: 'Pencatatan potensi dan bakat khusus siswa.',
      summary: [
        { label: 'Total Siswa', icon: 'ph-star', tone: 'primary' }
      ],
      fields: [
        ref('studentId', 'Siswa', 'student', { required: true }),
        ref('ekstraId', 'Ekstrakurikuler', 'ekskul', { required: true }),
        t('talentType', 'Bakat / Spesialisasi', { required: true }),
        sel('level', 'Tingkat Kemampuan', ['Pemula', 'Menengah', 'Lanjut', 'Ahli'], { required: true }),
        area('notes', 'Rencana Pembinaan')
      ]
    },
    '#/guru/ummi/tahfidz': {
      node: 'ummi_tahfidz', noun: 'Setoran Tahfidz', writeRoles: [R.GURU], dateField: 'date', statusField: 'grade', badges: { A: 'success', B: 'success', C: 'warning', D: 'danger' },
      subtitle: 'Buku mutabaah hafalan surat dan juz siswa.',
      summary: [
        { label: 'Total Setoran', icon: 'ph-book-bookmark', tone: 'primary' }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('studentId', 'Siswa', 'ummiStudent', { required: true }),
        t('surah', 'Surat', { required: true }),
        t('verse', 'Ayat', { required: true }),
        sel('grade', 'Nilai (Kelancaran)', ['A', 'B', 'C', 'D'], { required: true }),
        area('notes', 'Catatan (Tajwid / Makhroj)')
      ]
    },
    '#/guru/ummi/tasmi': {
      node: 'ummi_tasmi_results', noun: 'Hasil Ujian Tasmi\'', writeRoles: [R.GURU], dateField: 'date', statusField: 'status', badges: { Lulus: 'success', Mengulang: 'warning' },
      subtitle: 'Penilaian hasil ujian Tasmi\' oleh penguji.',
      summary: [
        { label: 'Total Ujian', icon: 'ph-headphones', tone: 'primary' },
        { label: 'Lulus', icon: 'ph-check-circle', tone: 'success', where: { status: 'Lulus' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('studentId', 'Siswa', 'ummiStudent', { required: true }),
        t('juz', 'Juz', { required: true }),
        num('score', 'Skor Nilai', { required: true }),
        sel('status', 'Status', ['Lulus', 'Mengulang'], { required: true }),
        area('notes', 'Catatan Penguji')
      ]
    },
    '#/guru/english/classes': {
      view: 'myclasses', classNode: 'english_classes', progressNode: 'english_progress', ownerKey: 'createdBy', allUnit: 'TIM_B_INGGRIS_KOORD',
      subtitle: 'Daftar rombongan belajar English Lab beserta progresnya.'
    },
    '#/guru/english/progress': {
      node: 'english_progress', noun: 'Jurnal Progres Speaking', writeRoles: [R.GURU], dateField: 'date',
      subtitle: 'Pencatatan perkembangan speaking dan vocabulary siswa.',
      summary: [
        { label: 'Total Sesi', icon: 'ph-translate', tone: 'primary' }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('studentId', 'Siswa', 'engStudent', { required: true }),
        t('topic', 'Topik / Unit', { required: true }),
        sel('speakingScore', 'Speaking Score', ['Excellent', 'Good', 'Fair', 'Needs Improvement'], { required: true }),
        sel('vocabScore', 'Vocabulary Score', ['Excellent', 'Good', 'Fair', 'Needs Improvement'], { required: true }),
        area('notes', 'Feedback')
      ]
    },
    '#/it-admin/sync': {
      node: 'it_admin/sync_logs', noun: 'Sinkronisasi Dapodik', writeRoles: [R.ADMIN], units: ['TIM_IT'], dateField: 'date', statusField: 'status', badges: { Berhasil: 'success', Gagal: 'danger', Proses: 'warning' },
      subtitle: 'Riwayat sinkronisasi data dengan sistem Dapodik Pusat.',
      summary: [
        { label: 'Total Sinkronisasi', icon: 'ph-arrows-clockwise', tone: 'primary' },
        { label: 'Berhasil', icon: 'ph-check-circle', tone: 'success', where: { status: 'Berhasil' } }
      ],
      fields: [
        date('date', 'Tanggal Sinkronisasi', { required: true }),
        sel('type', 'Objek Data', ['Siswa & Rombel', 'Pegawai & PTK', 'Sarpras & Bangunan', 'Nilai Rapor'], { required: true }),
        num('records', 'Jumlah Data Tersinkron'),
        sel('status', 'Status', ['Proses', 'Berhasil', 'Gagal'], { required: true, default: 'Proses' }),
        area('notes', 'Catatan / Log Error')
      ]
    },
    '#/it-admin/backup': {
      view: 'backup',
      subtitle: 'Pencadangan database sistem sekolah untuk keamanan data.',
      nodes: ['users', 'students', 'classes', 'subjects', 'extracurriculars', 'characters', 'student_affairs/violations', 'personnel/directory', 'facilities/assets', 'finance/ledger', 'curriculum/schedules', 'ummi_classes', 'english_classes', 'audit_logs']
    },
    '#/it-admin/logs': {
      node: 'audit_logs', noun: 'Log Audit Sistem', writeRoles: [R.ADMIN], units: ['TIM_IT'], noAdd: true, noDelete: true,
      subtitle: 'Rekam jejak seluruh aktivitas pengguna dalam sistem.',
      summary: [
        { label: 'Total Aktivitas', icon: 'ph-scroll', tone: 'primary' }
      ],
      fields: [
        { key: 'createdAt', label: 'Waktu', type: 'timestamp', readonly: true },
        { key: 'name', label: 'Pengguna', type: 'text', readonly: true },
        { key: 'role', label: 'Peran', type: 'text', readonly: true },
        { key: 'action', label: 'Aktivitas', type: 'text', readonly: true },
        { key: 'node', label: 'Kategori Data', type: 'text', readonly: true },
        { key: 'recordId', label: 'ID Data', type: 'text', readonly: true }
      ]
    },
    '#/it-admin/network': {
      node: 'it_admin/network', noun: 'Infrastruktur Jaringan', writeRoles: [R.ADMIN], units: ['TIM_IT'], statusField: 'status', badges: { Aktif: 'success', Gangguan: 'warning', Mati: 'danger' },
      subtitle: 'Manajemen router, access point, dan perangkat jaringan sekolah.',
      summary: [
        { label: 'Total Perangkat', icon: 'ph-wifi-high', tone: 'primary' },
        { label: 'Gangguan', icon: 'ph-warning', tone: 'danger', where: { status: ['Gangguan', 'Mati'] } }
      ],
      fields: [
        t('device', 'Nama Perangkat', { required: true }),
        sel('type', 'Jenis', ['Router', 'Switch', 'Access Point', 'Server', 'CCTV'], { required: true }),
        t('ip', 'Alamat IP / MAC', { required: true }),
        t('location', 'Lokasi / Ruangan'),
        sel('status', 'Status', ['Aktif', 'Gangguan', 'Mati'], { required: true, default: 'Aktif' }),
        area('notes', 'Konfigurasi / Catatan')
      ]
    },
    '#/it-admin/integration': {
      node: 'it_admin/api_keys', noun: 'Integrasi API & CBT', writeRoles: [R.ADMIN], units: ['TIM_IT'], statusField: 'status', badges: { Aktif: 'success', Nonaktif: 'danger' },
      subtitle: 'Koneksi dan tautan integrasi aplikasi pihak ketiga.',
      summary: [
        { label: 'Total Layanan', icon: 'ph-plugs', tone: 'primary' }
      ],
      fields: [
        t('service', 'Nama Layanan / Aplikasi', { required: true }),
        t('endpoint', 'Tautan Layanan (URL)'),
        t('apiKey', 'Kunci Akses / Token (Opsional)'),
        sel('status', 'Status', ['Aktif', 'Nonaktif'], { required: true, default: 'Aktif' }),
        area('notes', 'Deskripsi Integrasi')
      ]
    },
    '#/student-affairs/alumni': {
      node: 'student_affairs/alumni', noun: 'Penelusuran Alumni', writeRoles: SA, dateField: 'graduationYear',
      subtitle: 'Tracer study data kelulusan siswa dan kelanjutan studi ke jenjang SMP/MTs.',
      summary: [
        { label: 'Total Alumni', icon: 'ph-graduation-cap', tone: 'primary' },
        { label: 'Pesantren / MTs', icon: 'ph-mosque', tone: 'success', where: { schoolType: 'Pesantren / MTs' } },
        { label: 'SMP', icon: 'ph-buildings', tone: 'warning', where: { schoolType: 'SMP' } }
      ],
      fields: [
        t('graduationYear', 'Tahun Lulus', { required: true }),
        t('name', 'Nama Lengkap Alumni', { required: true }),
        sel('gender', 'Jenis Kelamin', ['Laki-laki', 'Perempuan'], { required: true }),
        t('nisn', 'NISN'),
        t('destinationSchool', 'Sekolah Lanjutan', { required: true }),
        sel('schoolType', 'Jenis Sekolah Lanjutan', ['SMP', 'Pesantren / MTs', 'Luar Kota / Internasional'], { required: true }),
        sel('entryTrack', 'Jalur Masuk', ['Zonasi', 'Prestasi Akademik / Non-Akademik', 'Afirmasi / KETM', 'Tes Masuk Mandiri']),
        t('phone', 'No. WhatsApp / HP'),
        area('achievements', 'Prestasi Saat di SD / Sekolah Lanjutan'),
        area('note', 'Catatan / Alamat')
      ]
    },
    '#/student-affairs/leaves': {
      node: 'student_affairs/leaves', noun: 'Perizinan Siswa', writeRoles: [R.ORTU, R.STUDENT_AFFAIRS], dateField: 'startDate', statusField: 'status', badges: { Disetujui: 'success', Diajukan: 'warning', Ditolak: 'danger' },
      approverRoles: [R.STUDENT_AFFAIRS, R.GURU],
      approverUnits: ['WALI_KELAS', 'WAKA_KESISWAAN', 'STAF_KESISWAAN', 'WAKA_KURIKULUM'],
      seeAllUnits: ['WALI_KELAS', 'WAKA_KESISWAAN', 'STAF_KESISWAAN', 'WAKA_KURIKULUM'],
      subtitle: 'Pengajuan izin sakit/keperluan oleh wali murid dan verifikasi wali kelas & kesiswaan.',
      summary: [
        { label: 'Total Pengajuan', icon: 'ph-calendar-x', tone: 'primary' },
        { label: 'Sakit', icon: 'ph-first-aid', tone: 'danger', where: { type: 'Sakit' } },
        { label: 'Disetujui', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui' } }
      ],
      fields: [
        date('startDate', 'Mulai Tanggal', { required: true }),
        date('endDate', 'Sampai Tanggal', { required: true }),
        ref('studentId', 'Siswa', 'student', { required: true }),
        sel('type', 'Jenis Perizinan', ['Sakit', 'Izin Keluarga', 'Dispensasi Lomba / Acara'], { required: true }),
        file('document', 'Foto Surat Dokter / Surat Izin Ortu', 'student_leaves'),
        sel('status', 'Status Persetujuan', ['Diajukan', 'Disetujui', 'Ditolak'], { required: true }),
        area('reason', 'Alasan / Keterangan', { required: true })
      ]
    },
    '#/gtk/official-travel': {
      own: true,
      node: 'personnel/official_travel', noun: 'Perjalanan Dinas GTK', writeRoles: [R.GURU, R.GURU_EKSKUL, R.GURU_UMMI, R.TENDIK, R.PERSONNEL, R.PUBLIC_RELATIONS, R.ADMIN, R.KEPSEK], dateField: 'date', statusField: 'status',
      badges: { Disetujui: 'success', Diajukan: 'warning', 'Perlu Revisi': 'warning', Ditolak: 'danger' },
      approverRoles: [R.PERSONNEL],
      approverUnits: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
      seeAllUnits: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
      subtitle: 'Pengajuan tugas khusus / perjalanan dinas GTK serta penetapan hak transport/vakasi oleh Humas.',
      summary: [
        { label: 'Total Tugas', icon: 'ph-airplane-takeoff', tone: 'primary' },
        { label: 'Menunggu Verifikasi', icon: 'ph-hourglass', tone: 'warning', where: { status: 'Diajukan' } },
        { label: 'Disetujui Humas', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui' } },
        { label: 'Total Vakasi', icon: 'ph-wallet', tone: 'success', sum: 'vakasi', money: true }
      ],
      fields: [
        date('date', 'Tanggal Kegiatan', { required: true }),
        ref('gtkId', 'Nama GTK', 'teacher', { required: true }),
        t('invitingInstitution', 'Lembaga yang Mengundang', { required: true }),
        t('location', 'Lokasi Acara', { required: true }),
        t('eventTheme', 'Tema / Nama Acara', { required: true }),
        time('departureTime', 'Jam Berangkat', { required: true }),
        time('returnTime', 'Jam Pulang', { required: true }),
        sel('transportation', 'Kendaraan', ['Kendaraan Pribadi (Motor)', 'Kendaraan Pribadi (Mobil)', 'Kendaraan Sekolah', 'Transportasi Umum'], { required: true }),
        file('assignmentLetterUrl', 'Surat Tugas / Perjalanan Dinas', 'official_travel_letters', { required: true, accept: '.pdf,image/*' }),
        file('activityPhotoUrl', 'Foto Kegiatan di Lokasi', 'official_travel_photos', { required: true, accept: 'image/*' }),
        sel('status', 'Status Verifikasi Humas', ['Diajukan', 'Disetujui', 'Perlu Revisi', 'Ditolak'], { required: true, default: 'Diajukan' }),
        money('vakasi', 'Besaran Vakasi (Rp)', { default: 0 }),
        area('humasFeedback', 'Catatan Verifikasi Humas')
      ]
    },
    '#/humas/official-travel': {
      node: 'personnel/official_travel', noun: 'Verifikasi Perjalanan Dinas', writeRoles: [R.PERSONNEL, R.ADMIN, R.KEPSEK], dateField: 'date', statusField: 'status',
      badges: { Disetujui: 'success', Diajukan: 'warning', 'Perlu Revisi': 'warning', Ditolak: 'danger' },
      approverRoles: [R.PERSONNEL],
      approverUnits: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
      seeAllUnits: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
      subtitle: 'Telaah tugas dinas GTK, verifikasi surat tugas, foto kegiatan dan penetapan nominal vakasi.',
      summary: [
        { label: 'Total Tugas', icon: 'ph-airplane-takeoff', tone: 'primary' },
        { label: 'Menunggu Verifikasi', icon: 'ph-hourglass', tone: 'warning', where: { status: 'Diajukan' } },
        { label: 'Disetujui', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui' } },
        { label: 'Total Realisasi Vakasi', icon: 'ph-wallet', tone: 'success', sum: 'vakasi', money: true }
      ],
      fields: [
        date('date', 'Tanggal Kegiatan', { required: true }),
        ref('gtkId', 'Nama GTK', 'teacher', { required: true }),
        t('invitingInstitution', 'Lembaga yang Mengundang', { required: true }),
        t('location', 'Lokasi Acara', { required: true }),
        t('eventTheme', 'Tema / Nama Acara', { required: true }),
        time('departureTime', 'Jam Berangkat', { required: true }),
        time('returnTime', 'Jam Pulang', { required: true }),
        sel('transportation', 'Kendaraan', ['Kendaraan Pribadi (Motor)', 'Kendaraan Pribadi (Mobil)', 'Kendaraan Sekolah', 'Transportasi Umum'], { required: true }),
        file('assignmentLetterUrl', 'Surat Tugas / Perjalanan Dinas', 'official_travel_letters', { required: true, accept: '.pdf,image/*' }),
        file('activityPhotoUrl', 'Foto Kegiatan di Lokasi', 'official_travel_photos', { required: true, accept: 'image/*' }),
        sel('status', 'Status Verifikasi Humas', ['Diajukan', 'Disetujui', 'Perlu Revisi', 'Ditolak'], { required: true, default: 'Diajukan' }),
        money('vakasi', 'Besaran Vakasi (Rp)', { default: 0 }),
        area('humasFeedback', 'Catatan Verifikasi Humas')
      ]
    },
    '#/finance/student-bills': {
      node: 'finance/student_bills', noun: 'Tagihan & SPP Siswa', writeRoles: FI, dateField: 'paymentDate', statusField: 'status', badges: { Lunas: 'success', 'Bebas Beasiswa': 'primary', 'Belum Lunas': 'danger' },
      subtitle: 'Monitoring iuran bulanan SPP dan status pelunasan pembayaran siswa.',
      summary: [
        { label: 'Total Tagihan', icon: 'ph-receipt', tone: 'primary' },
        { label: 'Lunas', icon: 'ph-check-circle', tone: 'success', where: { status: 'Lunas' } },
        { label: 'Belum Lunas', icon: 'ph-warning', tone: 'danger', where: { status: 'Belum Lunas' } },
        { label: 'Bebas Beasiswa', icon: 'ph-hand-coins', tone: 'primary', where: { status: 'Bebas Beasiswa' } }
      ],
      fields: [
        t('academicYear', 'Tahun Ajaran', { required: true }),
        sel('month', 'Bulan Tagihan', ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'], { required: true }),
        ref('studentId', 'Siswa', 'student', { required: true }),
        money('amount', 'Nominal SPP', { required: true }),
        sel('status', 'Status Pelunasan', ['Belum Lunas', 'Lunas', 'Bebas Beasiswa'], { required: true }),
        date('paymentDate', 'Tanggal Pelunasan'),
        file('receipt', 'Bukti Pembayaran / Struk', 'spp_receipts'),
        area('note', 'Catatan')
      ]
    },
  });
})();
