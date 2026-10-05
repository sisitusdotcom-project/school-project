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
        sel('status', 'Status', ['Dilaporkan', 'Ditindaklanjuti', 'Selesai'], { required: true }),
        area('description', 'Kronologi'),
        area('action', 'Tindak Lanjut')
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
      subtitle: 'Perencanaan dan pelaksanaan Masa Pengenalan Lingkungan Sekolah.',
      summary: [
        { label: 'Total Kegiatan', icon: 'ph-flag-banner', tone: 'primary' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } },
        { label: 'Total Peserta', icon: 'ph-users-three', tone: 'warning', sum: 'participants' }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Kegiatan', { required: true }),
        t('location', 'Tempat'),
        t('pic', 'Penanggung Jawab'),
        num('participants', 'Peserta'),
        sel('status', 'Status', ['Direncanakan', 'Berjalan', 'Selesai'], { required: true }),
        area('description', 'Deskripsi')
      ]
    },
    '#/student-affairs/ppdb': {
      node: 'student_affairs/ppdb', noun: 'PPDB & Mutasi', writeRoles: SA, dateField: 'date', statusField: 'status', badges: { ...badges, Mendaftar: 'warning', 'Daftar Ulang': 'success' },
      subtitle: 'Pendaftar peserta didik baru dan mutasi siswa.',
      derive: (p) => ({ year: year(p.date) }),
      summary: [
        { label: 'Total Pendaftar', icon: 'ph-user-plus', tone: 'primary' },
        { label: 'Diterima', icon: 'ph-check-circle', tone: 'success', where: { status: ['Diterima', 'Daftar Ulang'] } },
        { label: 'Mutasi', icon: 'ph-arrows-left-right', tone: 'warning', where: { type: ['Mutasi Masuk', 'Mutasi Keluar'] } }
      ],
      fields: [
        date('date', 'Tanggal Daftar', { required: true }),
        t('name', 'Nama Calon Siswa', { required: true }),
        sel('type', 'Jenis', ['Baru', 'Mutasi Masuk', 'Mutasi Keluar'], { required: true }),
        t('parentName', 'Nama Orang Tua / Wali'),
        t('phone', 'No. HP'),
        t('originSchool', 'Asal Sekolah'),
        sel('status', 'Status', ['Mendaftar', 'Diterima', 'Daftar Ulang', 'Ditolak'], { required: true }),
        area('note', 'Catatan')
      ]
    },
    '#/personnel/data': {
      node: 'personnel/directory', noun: 'Data Kepegawaian', writeRoles: PE, statusField: 'status', badges: { ...badges, Cuti: 'warning' },
      subtitle: 'Direktori pegawai: guru dan tenaga kependidikan.',
      summary: [
        { label: 'Total Pegawai', icon: 'ph-folder-user', tone: 'primary' },
        { label: 'Aktif', icon: 'ph-check-circle', tone: 'success', where: { status: 'Aktif' } },
        { label: 'Cuti', icon: 'ph-airplane-tilt', tone: 'warning', where: { status: 'Cuti' } }
      ],
      fields: [
        t('name', 'Nama Lengkap', { required: true }),
        t('nip', 'NIP / NUPTK'),
        t('position', 'Jabatan', { required: true }),
        sel('employmentStatus', 'Status Kepegawaian', ['PNS', 'GTY', 'GTT', 'Honorer', 'Tendik'], { required: true }),
        t('phone', 'No. HP'),
        t('education', 'Pendidikan Terakhir'),
        date('joinDate', 'Tanggal Bergabung'),
        ref('userId', 'Akun Sistem (opsional)', 'user'),
        sel('status', 'Status', ['Aktif', 'Cuti', 'Nonaktif'], { required: true, default: 'Aktif' })
      ]
    },
    '#/personnel/evaluations': {
      node: 'personnel/evaluations', noun: 'Penilaian Kinerja (PKG)', writeRoles: PE, dateField: 'date', statusField: 'predicate', badges: { 'Sangat Baik': 'success', Baik: 'success', Cukup: 'warning', Kurang: 'danger' },
      subtitle: 'Penilaian kinerja guru dan tenaga kependidikan per periode.',
      summary: [
        { label: 'Total Penilaian', icon: 'ph-chart-line-up', tone: 'primary' },
        { label: 'Sangat Baik', icon: 'ph-star', tone: 'success', where: { predicate: 'Sangat Baik' } },
        { label: 'Perlu Pembinaan', icon: 'ph-warning', tone: 'danger', where: { predicate: ['Cukup', 'Kurang'] } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('employeeId', 'Pegawai', 'user', { required: true }),
        t('period', 'Periode', { required: true }),
        num('score', 'Skor (0-100)', { required: true }),
        sel('predicate', 'Predikat', ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'], { required: true }),
        area('note', 'Catatan & Rencana Pengembangan')
      ]
    },
    '#/personnel/training': {
      node: 'personnel/training', noun: 'Pelatihan & Kompetensi', writeRoles: PE, dateField: 'date', statusField: 'status', badges,
      subtitle: 'Riwayat pelatihan, workshop, dan sertifikasi pegawai.',
      summary: [
        { label: 'Total Pelatihan', icon: 'ph-certificate', tone: 'primary' },
        { label: 'Total Jam', icon: 'ph-clock', tone: 'warning', sum: 'hours' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('employeeId', 'Pegawai', 'user', { required: true }),
        t('title', 'Nama Pelatihan', { required: true }),
        t('organizer', 'Penyelenggara'),
        num('hours', 'Jam Pelajaran'),
        t('certificateNo', 'No. Sertifikat'),
        sel('status', 'Status', ['Direncanakan', 'Berjalan', 'Selesai'], { required: true }),
        link('certificateUrl', 'Tautan Sertifikat')
      ]
    },
    '#/personnel/welfare': {
      node: 'personnel/welfare', noun: 'Kesejahteraan Staf', writeRoles: PE, dateField: 'date',
      subtitle: 'Tunjangan, bantuan, dan apresiasi untuk pegawai.',
      summary: [
        { label: 'Total Catatan', icon: 'ph-heart', tone: 'primary' },
        { label: 'Total Nominal', icon: 'ph-wallet', tone: 'success', sum: 'amount', money: true }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('employeeId', 'Pegawai', 'user', { required: true }),
        sel('type', 'Jenis', ['Tunjangan', 'Bantuan Sakit', 'Santunan', 'Apresiasi', 'Lainnya'], { required: true }),
        money('amount', 'Nominal'),
        area('note', 'Keterangan')
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
    '#/facilities/planning': {
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
    '#/facilities/rkas': {
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
    '#/finance/rkas': {
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
    '#/finance/taxes': {
      node: 'finance/taxes', noun: 'Administrasi Pajak', writeRoles: FI, dateField: 'date', statusField: 'status', badges,
      subtitle: 'Pencatatan pemotongan dan penyetoran pajak.',
      summary: [
        { label: 'Total Catatan', icon: 'ph-receipt', tone: 'primary' },
        { label: 'Belum Disetor', icon: 'ph-warning', tone: 'danger', where: { status: 'Belum Disetor' }, sum: 'amount', money: true },
        { label: 'Disetor', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetor' }, sum: 'amount', money: true }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        sel('taxType', 'Jenis Pajak', ['PPh 21', 'PPh 22', 'PPh 23', 'PPN'], { required: true }),
        money('basis', 'Dasar Pengenaan'),
        money('amount', 'Nilai Pajak', { required: true }),
        t('billingCode', 'Kode Billing'),
        sel('status', 'Status', ['Belum Disetor', 'Disetor'], { required: true, default: 'Belum Disetor' }),
        area('note', 'Catatan')
      ]
    },
    '#/finance/archives': {
      node: 'finance/archives', noun: 'Arsip Bukti Transaksi', writeRoles: FI, dateField: 'date',
      subtitle: 'Register dokumen bukti transaksi dengan tautan berkas.',
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
        link('fileUrl', 'Tautan Berkas (Drive)'),
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
        ref('teacherId', 'Guru', 'user', { required: true })
      ]
    },
    '#/curriculum/syllabus': {
      node: 'curriculum/documents', noun: 'Perangkat & Modul Ajar', writeRoles: CU, statusField: 'status', badges,
      subtitle: 'Pengumpulan dan verifikasi perangkat pembelajaran guru.',
      summary: [
        { label: 'Total Dokumen', icon: 'ph-folder-open', tone: 'primary' },
        { label: 'Diverifikasi', icon: 'ph-check-circle', tone: 'success', where: { status: 'Diverifikasi' } },
        { label: 'Belum Diunggah', icon: 'ph-warning', tone: 'danger', where: { status: 'Belum' } }
      ],
      fields: [
        ref('teacherId', 'Guru', 'user', { required: true }),
        ref('subjectId', 'Mata Pelajaran', 'subject'),
        sel('docType', 'Jenis', ['Modul Ajar', 'ATP', 'Prota', 'Promes', 'Silabus'], { required: true }),
        t('semester', 'Semester / Tahun Ajaran'),
        sel('status', 'Status', ['Belum', 'Diunggah', 'Diverifikasi'], { required: true, default: 'Belum' }),
        link('fileUrl', 'Tautan Berkas'),
        area('note', 'Catatan')
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
        ref('teacherId', 'Guru', 'user', { required: true }),
        ref('classId', 'Kelas', 'class'),
        ref('subjectId', 'Mata Pelajaran', 'subject'),
        sel('result', 'Hasil', ['Sesuai', 'Perlu Pembinaan'], { required: true }),
        area('observation', 'Temuan')
      ]
    },
    '#/curriculum/evaluations': {
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
    '#/curriculum/supervision': {
      node: 'curriculum/supervision', noun: 'Supervisi Guru', writeRoles: CU, dateField: 'date', statusField: 'status', badges: { ...badges, Terjadwal: 'warning' },
      subtitle: 'Jadwal dan hasil supervisi akademik.',
      summary: [
        { label: 'Total Supervisi', icon: 'ph-chalkboard-teacher', tone: 'primary' },
        { label: 'Terjadwal', icon: 'ph-hourglass', tone: 'warning', where: { status: 'Terjadwal' } },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('teacherId', 'Guru', 'user', { required: true }),
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
    '#/guru/ekstra/attendance': {
      node: 'ekstra/attendance', noun: 'Presensi Ekskul', writeRoles: [R.GURU], dateField: 'date',
      subtitle: 'Kehadiran peserta ekstrakurikuler.',
      summary: [
        { label: 'Total Pertemuan', icon: 'ph-users-three', tone: 'primary' }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('ekstraId', 'Ekstrakurikuler', 'ekskul', { required: true }),
        ref('students', 'Siswa Hadir', 'student', { type: 'multi' }),
        area('note', 'Catatan Pertemuan')
      ]
    },
    '#/guru/extracurriculars': {
      node: 'ekstra/grades', noun: 'Nilai E-Rapor Ekskul', writeRoles: [R.GURU], statusField: 'grade', badges: { A: 'success', B: 'success', C: 'warning', D: 'danger' },
      subtitle: 'Penilaian akhir semester untuk ekstrakurikuler.',
      summary: [
        { label: 'Total Nilai', icon: 'ph-trophy', tone: 'primary' }
      ],
      fields: [
        t('academicYear', 'Tahun Ajaran', { required: true }),
        sel('semester', 'Semester', ['Ganjil', 'Genap'], { required: true }),
        ref('ekstraId', 'Ekstrakurikuler', 'ekskul', { required: true }),
        ref('studentId', 'Siswa', 'student', { required: true }),
        sel('grade', 'Nilai (Predikat)', ['A', 'B', 'C', 'D'], { required: true }),
        area('description', 'Deskripsi Capaian', { required: true })
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
    '#/guru/ummi/koord/mapping': {
      node: 'ummi_classes', noun: 'Pemetaan Rombel Ummi', writeRoles: [R.ADMIN], units: ['KOORD_UMMI'],
      subtitle: 'Pembentukan kelompok belajar Ummi dan penugasan guru.',
      summary: [
        { label: 'Total Rombel', icon: 'ph-users-three', tone: 'primary' }
      ],
      fields: [
        t('name', 'Nama Kelompok', { required: true }),
        sel('level', 'Level / Jilid', ['Pra-TK', 'Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', 'Jilid 6', 'Al-Quran', 'Ghorib', 'Tajwid'], { required: true }),
        ref('teacherId', 'Guru Pengampu', 'user', { required: true }),
        ref('students', 'Daftar Siswa', 'student', { type: 'multi' })
      ]
    },
    '#/guru/ummi/koord/exams': {
      node: 'ummi_exams', noun: 'Antrean Ujian / Munaqosyah', writeRoles: [R.ADMIN], units: ['KOORD_UMMI'], dateField: 'date', statusField: 'status', badges: { ...badges, Lulus: 'success', Mengulang: 'warning', Antre: 'warning' },
      subtitle: 'Penjadwalan dan hasil ujian kenaikan jilid Ummi.',
      summary: [
        { label: 'Total Peserta', icon: 'ph-exam', tone: 'primary' },
        { label: 'Lulus', icon: 'ph-check-circle', tone: 'success', where: { status: 'Lulus' } }
      ],
      fields: [
        date('date', 'Tanggal Ujian', { required: true }),
        ref('studentId', 'Siswa', 'ummiStudent', { required: true }),
        sel('level', 'Level Ujian', ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', 'Jilid 6', 'Al-Quran', 'Ghorib', 'Tajwid', 'Munaqosyah'], { required: true }),
        ref('examiner', 'Penguji', 'user', { required: true }),
        sel('status', 'Status', ['Antre', 'Lulus', 'Mengulang'], { required: true, default: 'Antre' }),
        t('score', 'Nilai / Keterangan')
      ]
    },
    '#/guru/ummi/koord/tasmi': {
      node: 'ummi_tasmi_schedules', noun: 'Plotting Guru Tasmi\'', writeRoles: [R.ADMIN], units: ['KOORD_UMMI'], dateField: 'date',
      subtitle: 'Penjadwalan ujian Tasmi\' dan pengujinya.',
      summary: [
        { label: 'Total Jadwal', icon: 'ph-microphone-stage', tone: 'primary' }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('studentId', 'Siswa', 'ummiStudent', { required: true }),
        t('juz', 'Juz yang Diujikan', { required: true }),
        ref('examiner', 'Penguji (Penyimak)', 'user', { required: true }),
        time('time', 'Pukul')
      ]
    },
    '#/guru/ummi/classes': {
      view: 'myclasses', classNode: 'ummi_classes', progressNode: 'ummi_progress', ownerKey: 'teacherId', allUnit: 'KOORD_UMMI',
      subtitle: 'Daftar rombongan belajar Ummi yang Anda ampu beserta progresnya.'
    },
    '#/guru/ummi/progress': {
      node: 'ummi_progress', noun: 'Jurnal Harian Jilid', writeRoles: [R.GURU], dateField: 'date', statusField: 'status', badges: { Lancar: 'success', Ulang: 'warning' },
      subtitle: 'Catatan harian perkembangan membaca Al-Quran siswa.',
      summary: [
        { label: 'Total Setoran', icon: 'ph-book-open', tone: 'primary' },
        { label: 'Lancar', icon: 'ph-check-circle', tone: 'success', where: { status: 'Lancar' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('studentId', 'Siswa', 'ummiStudent', { required: true }),
        t('level', 'Jilid / Level', { required: true }),
        t('page', 'Halaman / Ayat', { required: true }),
        sel('status', 'Status', ['Lancar', 'Ulang'], { required: true }),
        area('notes', 'Catatan Guru')
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
        { key: 'action', label: 'Aksi (CRUD)', type: 'text', readonly: true },
        { key: 'node', label: 'Koleksi (Tabel)', type: 'text', readonly: true },
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
      subtitle: 'Kredensial dan endpoint untuk integrasi sistem pihak ketiga.',
      summary: [
        { label: 'Total Layanan', icon: 'ph-plugs', tone: 'primary' }
      ],
      fields: [
        t('service', 'Nama Layanan / Aplikasi', { required: true }),
        t('endpoint', 'URL Endpoint'),
        t('apiKey', 'API Key / Token (Opsional)'),
        sel('status', 'Status', ['Aktif', 'Nonaktif'], { required: true, default: 'Aktif' }),
        area('notes', 'Deskripsi Integrasi')
      ]
    }
  });
})();
