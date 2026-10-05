(function () {
  const ROLES = Object.freeze({
    ADMIN: 'admin',
    GURU: 'guru',
    KEPSEK: 'kepsek',
    ORTU: 'ortu',
    FINANCE: 'finance',
    CURRICULUM: 'curriculum',
    STUDENT_AFFAIRS: 'studentAffairs',
    PERSONNEL: 'personnel',
    FACILITIES: 'facilities',
    IT_ADMIN: 'it_admin'
  });

  const UNIT_LABELS = Object.freeze({
    [ROLES.FINANCE]: 'Keuangan',
    [ROLES.CURRICULUM]: 'Kurikulum',
    [ROLES.STUDENT_AFFAIRS]: 'Kesiswaan',
    [ROLES.PERSONNEL]: 'Personalia',
    [ROLES.FACILITIES]: 'Sarpras',
    [ROLES.IT_ADMIN]: 'IT Admin'
  });

  const ROLE_LABELS = Object.freeze({
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.GURU]: 'Guru / Wali Kelas',
    [ROLES.KEPSEK]: 'Kepala Sekolah',
    [ROLES.ORTU]: 'Orang Tua / Wali',
    [ROLES.FINANCE]: 'Keuangan',
    [ROLES.CURRICULUM]: 'Kurikulum',
    [ROLES.STUDENT_AFFAIRS]: 'Kesiswaan',
    [ROLES.PERSONNEL]: 'Personalia',
    [ROLES.FACILITIES]: 'Sarpras',
    [ROLES.IT_ADMIN]: 'IT Admin'
  });

  const NAV_ITEMS = Object.freeze({
    [ROLES.ADMIN]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Dashboard Sekolah' }
    ],
    [ROLES.GURU]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' }
    ],
    'GURU_UMUM': [
      { hash: '#/guru/attendance', icon: 'ph-map-pin', text: 'Presensi Guru', group: 'Tugas Utama Guru' },
      { hash: '#/guru/academic', icon: 'ph-check-square', text: 'Nilai Akademik', group: 'Tugas Utama Guru' },
      { hash: '#/guru/observations', icon: 'ph-note-pencil', text: 'Riwayat Observasi', group: 'Tugas Utama Guru' }
    ],
    'WALI_KELAS': [
      { hash: '#/guru/student-attendance', icon: 'ph-users-three', text: 'Absensi Siswa', group: 'Tupoksi Wali Kelas' },
      { hash: '#/guru/classes', icon: 'ph-chalkboard-teacher', text: 'E-Rapor (Kelas)', group: 'Tupoksi Wali Kelas' },
      { hash: '#/guru/additional', icon: 'ph-folder-plus', text: 'Data Tambahan Rapor', group: 'Tupoksi Wali Kelas' }
    ],
    [ROLES.KEPSEK]: [
      { hash: '#/dashboard', icon: 'ph-chart-pie', text: 'Dashboard Kepala Sekolah' },
      { hash: '#/kepsek/reports', icon: 'ph-file-text', text: 'Laporan Kelas' },
      { hash: '#/curriculum', icon: 'ph-books', text: 'Monitoring Kurikulum' },
      { hash: '#/student-affairs', icon: 'ph-users-three', text: 'Monitoring Kesiswaan' },
      { hash: '#/finance', icon: 'ph-wallet', text: 'Monitoring Keuangan' },
      { hash: '#/personnel', icon: 'ph-briefcase', text: 'Monitoring Personalia' },
      { hash: '#/facilities', icon: 'ph-building-office', text: 'Monitoring Sarpras' }
    ],
    [ROLES.ORTU]: [
      { hash: '#/ortu/dashboard', icon: 'ph-graduation-cap', text: 'Perkembangan Anak' }
    ],
    [ROLES.IT_ADMIN]: [
      { hash: '#/it-admin/dashboard', icon: 'ph-database', text: 'Sinkronisasi Data' }
    ],
    [ROLES.PERSONNEL]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' }
    ],
    [ROLES.FINANCE]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' }
    ],
    [ROLES.STUDENT_AFFAIRS]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' }
    ],
    [ROLES.CURRICULUM]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' }
    ],
    [ROLES.FACILITIES]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' }
    ],
    'WAKA_HUMAS_PERSONALIA': [
      { hash: '#/personnel', icon: 'ph-briefcase', text: 'Dashboard Personalia', group: 'Personalia: Administrasi SDM' },
      { hash: '#/admin/users', icon: 'ph-users', text: 'Kelola Pengguna', group: 'Personalia: Administrasi SDM' },
      { hash: '#/admin/assignments', icon: 'ph-clipboard-text', text: 'Distribusi Penugasan', group: 'Personalia: Administrasi SDM' },
      { hash: '#/personnel/data', icon: 'ph-folder-user', text: 'Data Kepegawaian', group: 'Personalia: Administrasi SDM' },
      { hash: '#/admin/attendance', icon: 'ph-clock', text: 'Pantau Disiplin Guru', group: 'Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/evaluations', icon: 'ph-chart-line-up', text: 'Penilaian Kinerja (PKG)', group: 'Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/training', icon: 'ph-certificate', text: 'Pelatihan & Kompetensi', group: 'Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/welfare', icon: 'ph-heart', text: 'Kesejahteraan Staf', group: 'Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/publications', icon: 'ph-megaphone', text: 'Publikasi & Informasi', group: 'Humas: Komunikasi Publik' },
      { hash: '#/personnel/complaints', icon: 'ph-chats', text: 'Layanan Pengaduan', group: 'Humas: Komunikasi Publik' },
      { hash: '#/personnel/partnerships', icon: 'ph-handshake', text: 'Kemitraan & MoU', group: 'Humas: Kemitraan & Acara' },
      { hash: '#/personnel/events', icon: 'ph-calendar-star', text: 'Manajemen Acara', group: 'Humas: Kemitraan & Acara' }
    ],
    'WAKA_KESISWAAN': [
      { hash: '#/student-affairs', icon: 'ph-users-three', text: 'Dashboard Kesiswaan', group: 'Kesiswaan: Umum' },
      { hash: '#/student-affairs/ppdb', icon: 'ph-user-plus', text: 'PPDB & Mutasi', group: 'Kesiswaan: PPDB & Transisi' },
      { hash: '#/student-affairs/mpls', icon: 'ph-flag-banner', text: 'Masa Pengenalan (MPLS)', group: 'Kesiswaan: PPDB & Transisi' },
      { hash: '#/admin/characters', icon: 'ph-star', text: 'Indikator Karakter & Sikap', group: 'Kesiswaan: Karakter & Disiplin' },
      { hash: '#/student-affairs/rules', icon: 'ph-gavel', text: 'Tata Tertib & TPPK', group: 'Kesiswaan: Karakter & Disiplin' },
      { hash: '#/admin/extracurriculars', icon: 'ph-trophy', text: 'Ekstrakurikuler', group: 'Kesiswaan: Bakat & Prestasi' },
      { hash: '#/student-affairs/achievements', icon: 'ph-medal', text: 'Lomba & Penghargaan', group: 'Kesiswaan: Bakat & Prestasi' },
      { hash: '#/admin/attendance', icon: 'ph-calendar-check', text: 'Pantau Kehadiran Siswa', group: 'Kesiswaan: Administrasi' },
      { hash: '#/student-affairs/scholarships', icon: 'ph-hand-coins', text: 'Data Beasiswa & PIP', group: 'Kesiswaan: Administrasi' }
    ],
    'WAKA_KURIKULUM': [
      { hash: '#/curriculum', icon: 'ph-books', text: 'Dashboard Kurikulum', group: 'Kurikulum: Umum' },
      { hash: '#/admin/classes', icon: 'ph-users-three', text: 'Pembagian Rombel & Kelas', group: 'Kurikulum: Perencanaan' },
      { hash: '#/admin/subjects', icon: 'ph-book-bookmark', text: 'Pemetaan Mapel & Guru', group: 'Kurikulum: Perencanaan' },
      { hash: '#/curriculum/schedules', icon: 'ph-calendar', text: 'Jadwal Pelajaran & Kalender', group: 'Kurikulum: Perencanaan' },
      { hash: '#/curriculum/syllabus', icon: 'ph-folder-open', text: 'Perangkat & Modul Ajar', group: 'Kurikulum: Pelaksanaan KBM' },
      { hash: '#/curriculum/monitoring', icon: 'ph-eye', text: 'Pemantauan KBM', group: 'Kurikulum: Pelaksanaan KBM' },
      { hash: '#/curriculum/evaluations', icon: 'ph-exam', text: 'Sistem Penilaian', group: 'Kurikulum: Supervisi & Evaluasi' },
      { hash: '#/curriculum/supervision', icon: 'ph-chalkboard-teacher', text: 'Supervisi Guru', group: 'Kurikulum: Supervisi & Evaluasi' }
    ],
    'WAKA_KEUANGAN': [
      { hash: '#/finance', icon: 'ph-wallet', text: 'Dashboard Keuangan', group: 'Keuangan: Umum' },
      { hash: '#/finance/rkas', icon: 'ph-chart-bar', text: 'Penyusunan RKAS', group: 'Keuangan: Perencanaan' },
      { hash: '#/finance/transactions', icon: 'ph-arrows-left-right', text: 'Penerimaan & Pengeluaran', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/cashbook', icon: 'ph-book-open', text: 'Buku Kas Umum (BKU)', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/taxes', icon: 'ph-receipt', text: 'Administrasi Pajak', group: 'Keuangan: Perpajakan & Arsip' },
      { hash: '#/finance/archives', icon: 'ph-archive-box', text: 'Arsip Bukti Transaksi', group: 'Keuangan: Perpajakan & Arsip' },
      { hash: '#/finance/reports', icon: 'ph-file-text', text: 'LPJ & Sinkronisasi Kas', group: 'Keuangan: Pelaporan' },
      { hash: '#/finance/transparency', icon: 'ph-projector-screen', text: 'Publikasi Anggaran', group: 'Keuangan: Pelaporan' }
    ],
    'WAKA_SARPRAS': [
      { hash: '#/facilities', icon: 'ph-building-office', text: 'Dashboard Sarpras', group: 'Sarpras: Inventarisasi' },
      { hash: '#/facilities/inventory', icon: 'ph-archive-box', text: 'Buku Inventaris (Aset)', group: 'Sarpras: Inventarisasi' },
      { hash: '#/facilities/dapodik', icon: 'ph-cloud-arrow-up', text: 'Data Sarpras Dapodik', group: 'Sarpras: Inventarisasi' },
      { hash: '#/facilities/planning', icon: 'ph-clipboard-text', text: 'Analisis Kebutuhan', group: 'Sarpras: Perencanaan & Pengadaan' },
      { hash: '#/facilities/rkas', icon: 'ph-shopping-cart', text: 'Rencana Pengadaan (RKAS)', group: 'Sarpras: Perencanaan & Pengadaan' },
      { hash: '#/facilities/maintenance', icon: 'ph-wrench', text: 'Perawatan Gedung & Sanitasi', group: 'Sarpras: Pemeliharaan & Keamanan' },
      { hash: '#/facilities/safety', icon: 'ph-shield-check', text: 'Pengecekan Keamanan Area', group: 'Sarpras: Pemeliharaan & Keamanan' },
      { hash: '#/facilities/electronics', icon: 'ph-desktop', text: 'Pemeliharaan Elektronik & IT', group: 'Sarpras: Pemeliharaan & Keamanan' },
      { hash: '#/facilities/loans', icon: 'ph-hand-pointing', text: 'Peminjaman Fasilitas', group: 'Sarpras: Pengawasan & Penghapusan' },
      { hash: '#/facilities/disposal', icon: 'ph-trash', text: 'Penghapusan Aset Rusak', group: 'Sarpras: Pengawasan & Penghapusan' }
    ],
    'TIM_IT': [
      { hash: '#/it-admin/dashboard', icon: 'ph-monitor', text: 'Dashboard IT', group: 'IT & Sistem: Operasional' },
      { hash: '#/it-admin/sync', icon: 'ph-arrows-clockwise', text: 'Sinkronisasi Dapodik', group: 'IT & Sistem: Operasional' },
      { hash: '#/it-admin/backup', icon: 'ph-cloud-arrow-down', text: 'Backup & Restore Data', group: 'IT & Sistem: Basis Data' },
      { hash: '#/it-admin/logs', icon: 'ph-scroll', text: 'Log Audit Sistem', group: 'IT & Sistem: Basis Data' },
      { hash: '#/it-admin/network', icon: 'ph-wifi-high', text: 'Infrastruktur Jaringan', group: 'IT & Sistem: Jaringan' },
      { hash: '#/it-admin/integration', icon: 'ph-plugs', text: 'Integrasi API & CBT', group: 'IT & Sistem: Jaringan' }
    ],
    'GURU_EKSTRA': [
      { hash: '#/guru/ekstra/syllabus', icon: 'ph-clipboard-text', text: 'Program Latihan', group: 'Guru Ekskul: Perencanaan' },
      { hash: '#/guru/ekstra/attendance', icon: 'ph-users-three', text: 'Presensi Peserta', group: 'Guru Ekskul: Pelaksanaan' },
      { hash: '#/guru/extracurriculars', icon: 'ph-trophy', text: 'Nilai E-Rapor Ekskul', group: 'Guru Ekskul: Evaluasi' },
      { hash: '#/guru/ekstra/talents', icon: 'ph-star', text: 'Pemetaan Siswa Berbakat', group: 'Guru Ekskul: Evaluasi' }
    ],
    'KOORD_UMMI': [
      { hash: '#/guru/ummi/koord/mapping', icon: 'ph-users-three', text: 'Pemetaan Rombel & Guru', group: 'Koordinator Ummi' },
      { hash: '#/guru/ummi/koord/exams', icon: 'ph-check-circle', text: 'Antrean Ujian Jilid/Munaqosyah', group: 'Koordinator Ummi' },
      { hash: '#/guru/ummi/koord/tasmi', icon: 'ph-microphone-stage', text: 'Plotting Guru Tasmi\'', group: 'Koordinator Ummi' }
    ],
    'TIM_UMMI': [
      { hash: '#/guru/ummi/classes', icon: 'ph-chalkboard-teacher', text: 'Rombel Ummi Saya', group: 'Guru Ummi: Kelas & Capaian' },
      { hash: '#/guru/ummi/progress', icon: 'ph-book-open', text: 'Jurnal Harian Jilid', group: 'Guru Ummi: Kelas & Capaian' },
      { hash: '#/guru/ummi/tahfidz', icon: 'ph-book-bookmark', text: 'Setoran Tahfidz (Juz 30-1)', group: 'Guru Ummi: Tahfidz & Tasmi\'' },
      { hash: '#/guru/ummi/tasmi', icon: 'ph-headphones', text: 'Ujian Tasmi\' (Penguji)', group: 'Guru Ummi: Tahfidz & Tasmi\'' }
    ],
    'TIM_B_INGGRIS': [
      { hash: '#/guru/english/classes', icon: 'ph-chalkboard-teacher', text: 'Rombel English Lab', group: 'English Lab' },
      { hash: '#/guru/english/progress', icon: 'ph-translate', text: 'Jurnal Progres Speaking', group: 'English Lab' }
    ]
  });

  const DEFAULT_SETTINGS = Object.freeze({
    currentAcademicYear: '2026/2027',
    currentSemester: '1',
    attendanceRules: Object.freeze({
      checkInStart: '07:00',
      checkInEnd: '09:00',
      checkOutStart: '15:00',
      checkOutEnd: '17:00',
      attendanceStartDate: '',
      attendanceEndDate: ''
    })
  });


  function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function normalizeSettings(rawSettings = {}) {
    const source = rawSettings || {};
    const attendanceRules = source.attendanceRules || {};

    return {
      ...DEFAULT_SETTINGS,
      ...source,
      attendanceRules: {
        ...DEFAULT_SETTINGS.attendanceRules,
        ...attendanceRules
      }
    };
  }

  function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return Object.keys(value).map((key) => ({
      id: key,
      ...value[key]
    }));
  }

  function normalizeAssignments(assignments = []) {
    if (!Array.isArray(assignments)) {
      if (assignments) return [String(assignments)];
      return [];
    }

    return [...new Set(assignments
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean))];
  }

  function getRoleLabel(role) {
    return ROLE_LABELS[role] || 'Pengguna';
  }

  function formatUserName(user) {
    if (!user) return 'Pengguna';
    let name = user.name || 'Pengguna';
    if (user.role === ROLES.ORTU) return name;

    if (user.gender) {
      if (user.gender === 'L' && !name.toLowerCase().startsWith('ustadz')) {
        name = `Ustadz ${name}`;
      } else if (user.gender === 'P' && !name.toLowerCase().startsWith('ustadz')) {
        name = `Ustadzah ${name}`;
      }
    }
    return name;
  }

  function getRoleAssignments(user = {}) {
    if (!user || typeof user !== 'object') return [];
    return normalizeAssignments(user.assignments || user.unitRoles || user.roles || []);
  }

  function getRoleAssignmentLabel(user = {}) {
    const assignments = getRoleAssignments(user);
    if (!assignments.length) return getRoleLabel(user.role);
    const unitLabels = assignments.map((item) => {
      if (UNIT_LABELS[item]) return UNIT_LABELS[item];
      // Format dynamically for assignments like GURU_EKSTRA_HW -> Guru Ekstra Hw
      return item.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    }).join(', ');
    return `${getRoleLabel(user.role)} · ${unitLabels}`;
  }

  const TEACHING_PREFIXES = ['GURU_', 'WAKA_', 'TIM_UMMI', 'TIM_B_INGGRIS'];

  function isTeachingAssignment(a) {
    return TEACHING_PREFIXES.some(prefix => a.startsWith(prefix));
  }

  function getRoleNav(role, assignments = []) {
    let baseNav = [...(NAV_ITEMS[role] || [])];
    const isGuru = role === ROLES.GURU || assignments.some(isTeachingAssignment);
    const isWaliKelas = assignments.some(a => a.startsWith('GURU_KELAS_'));
    const isGuruEkstra = assignments.some(a => a.startsWith('GURU_EKSTRA_'));
    const isTimUmmi = assignments.some(a => a === 'GURU_UMMI' || a === 'TIM_UMMI' || a === 'KOORD_UMMI');
    const isTimInggris = assignments.some(a => a === 'TIM_B_INGGRIS');
    if (isGuru) {
      baseNav = [...baseNav, ...(NAV_ITEMS['GURU_UMUM'] || [])];
    }
    if (isWaliKelas) {
      baseNav = [...baseNav, ...(NAV_ITEMS['WALI_KELAS'] || [])];
    }
    if (isGuruEkstra) {
      baseNav = [...baseNav, ...(NAV_ITEMS['GURU_EKSTRA'] || [])];
    }
    if (isTimUmmi) {
      baseNav = [...baseNav, ...(NAV_ITEMS['TIM_UMMI'] || [])];
    }
    if (isTimInggris) {
      baseNav = [...baseNav, ...(NAV_ITEMS['TIM_B_INGGRIS'] || [])];
    }
    const unitAssignments = normalizeAssignments(assignments);
    const unitNav = unitAssignments.flatMap((unit) => {
      return NAV_ITEMS[unit] || [];
    });
    const merged = [...baseNav, ...unitNav];
    return merged.filter((item, index, arr) => arr.findIndex((entry) => entry.hash === item.hash) === index);
  }

  function getRoleBadgeClass(role) {
    switch (role) {
      case ROLES.ADMIN:
        return 'badge-primary';
      case ROLES.GURU:
        return 'badge-warning';
      case ROLES.KEPSEK:
        return 'badge-success';
      case ROLES.ORTU:
        return 'badge-outline';
      default:
        return 'badge-outline';
    }
  }

  const APP_DEFAULTS = Object.freeze({
    googleDriveUploadUrl: 'https://script.google.com/macros/s/AKfycbwHNSb34p_FcX_dTQuw87viaZ9joh2rT3KdtMLBVvwpocWzyF3HICPUPRfPuy63LDsNsw/exec',
    attendanceWorkerUrl: 'https://musada-absensi.sisitusdotcom.workers.dev/',
    attendanceGeofence: Object.freeze({
      lat: null,
      lng: null,
      radiusMeters: null
    })
  });

  const runtimeConfig = {
    googleDriveUploadUrl: window.GOOGLE_DRIVE_UPLOAD_URL || APP_DEFAULTS.googleDriveUploadUrl,
    attendanceWorkerUrl: window.CLOUDFLARE_ATTENDANCE_WORKER_URL || APP_DEFAULTS.attendanceWorkerUrl,
    attendanceGeofence: window.APP_ATTENDANCE_GEOFENCE || APP_DEFAULTS.attendanceGeofence
  };

  window.APP_ATTENDANCE_GEOFENCE = Object.freeze(runtimeConfig.attendanceGeofence);
  window.GOOGLE_DRIVE_UPLOAD_URL = runtimeConfig.googleDriveUploadUrl;
  window.CLOUDFLARE_ATTENDANCE_WORKER_URL = runtimeConfig.attendanceWorkerUrl;
  window.GOOGLE_DRIVE_CONFIG = Object.freeze({
    uploadUrl: runtimeConfig.googleDriveUploadUrl,
    attendanceWorkerUrl: runtimeConfig.attendanceWorkerUrl
  });

  window.AppConfig = Object.freeze({
    ROLES,
    ROLE_LABELS,
    UNIT_LABELS,
    NAV_ITEMS,
    DEFAULT_SETTINGS,
    APP_DEFAULTS,
    escapeHtml,
    normalizeSettings,
    normalizeAssignments,
    toArray,
    getRoleLabel,
    getRoleAssignments,
    getRoleAssignmentLabel,
    getRoleNav,
    getRoleBadgeClass,
    isTeachingAssignment,
    formatUserName
  });
})();
