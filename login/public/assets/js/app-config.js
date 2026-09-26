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
    FACILITIES: 'facilities'
  });

  const UNIT_LABELS = Object.freeze({
    [ROLES.FINANCE]: 'Keuangan',
    [ROLES.CURRICULUM]: 'Kurikulum',
    [ROLES.STUDENT_AFFAIRS]: 'Kesiswaan',
    [ROLES.PERSONNEL]: 'Personalia',
    [ROLES.FACILITIES]: 'Sarpras'
  });

  const ROLE_LABELS = Object.freeze({
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.GURU]: 'Guru / Wali Kelas',
    [ROLES.KEPSEK]: 'Kepala Sekolah',
    [ROLES.ORTU]: 'Orang Tua / Wali',
    [ROLES.FINANCE]: 'Manajemen Keuangan',
    [ROLES.CURRICULUM]: 'Manajemen Kurikulum',
    [ROLES.STUDENT_AFFAIRS]: 'Manajemen Kesiswaan',
    [ROLES.PERSONNEL]: 'Manajemen Personalia',
    [ROLES.FACILITIES]: 'Manajemen Sarpras'
  });

  const ROLE_OPTIONS = Object.freeze({
    [ROLES.ADMIN]: 'Admin',
    [ROLES.GURU]: 'Guru',
    [ROLES.KEPSEK]: 'Kepsek',
    [ROLES.ORTU]: 'Orang Tua'
  });

  const MANAGEMENT_ROUTE_MAP = Object.freeze({
    [ROLES.FINANCE]: '#/finance',
    [ROLES.CURRICULUM]: '#/curriculum',
    [ROLES.STUDENT_AFFAIRS]: '#/student-affairs',
    [ROLES.PERSONNEL]: '#/personnel',
    [ROLES.FACILITIES]: '#/facilities'
  });
  const MODULE_ACCESS = Object.freeze({
    finance: { roles: [ROLES.ADMIN, ROLES.KEPSEK], label: 'Keuangan', scope: 'rekap keuangan sekolah' },
    curriculum: { roles: [ROLES.ADMIN, ROLES.KEPSEK, ROLES.GURU], label: 'Kurikulum', scope: 'struktur dan rekap pembelajaran' },
    studentAffairs: { roles: [ROLES.ADMIN, ROLES.KEPSEK, ROLES.GURU], label: 'Kesiswaan', scope: 'rekap siswa dan perkembangan kelas' },
    personnel: { roles: [ROLES.ADMIN, ROLES.KEPSEK], label: 'Humas & Personalia', scope: 'rekap SDM dan komunikasi internal' },
    facilities: { roles: [ROLES.ADMIN, ROLES.KEPSEK], label: 'Sarpras', scope: 'rekap aset, ruangan, dan pemeliharaan' }
  });

  const ROLE_CONTENT_MAP = Object.freeze({
    [ROLES.ADMIN]: {
      label: 'Admin',
      scope: 'Penetapan tugas, pengaturan utama, dan pengelolaan akses sistem.',
      features: [
        'Penugasan per unit kerja',
        'Pengelolaan pengguna dan hak akses',
        'Master kelas dan siswa',
        'Master mata pelajaran',
        'Indikator karakter dan konfigurasi sekolah'
      ],
      notAllowed: [
        'Mengisi operasional harian keuangan',
        'Menangani pembelajaran guru setiap hari',
        'Menjadi unit kesiswaan',
        'Mengelola data sarpras sebagai pelaksana utama'
      ]
    },
    [ROLES.KEPSEK]: {
      label: 'Kepala Sekolah',
      scope: 'Monitoring sekolah, evaluasi kinerja, dan keputusan strategis.',
      features: [
        'Dashboard sekolah',
        'Laporan kelas dan rekap akademik',
        'Monitoring kesiswaan',
        'Review keuangan dan sarpras',
        'Evaluasi personel dan kebijakan sekolah'
      ],
      notAllowed: [
        'Input data harian operasional',
        'Menjadi pelaksana kegiatan unit teknis',
        'Mengambil alih tugas admin secara langsung'
      ]
    },
    [ROLES.GURU]: {
      label: 'Guru',
      scope: 'Pembelajaran, penilaian, dan pemantauan perkembangan siswa di kelas.',
      features: [
        'Presensi guru',
        'Absensi siswa',
        'E-Rapor dan kelas',
        'Nilai akademik',
        'Riwayat observasi siswa'
      ],
      notAllowed: [
        'Mengelola konfigurasi sekolah',
        'Menetapkan tugas admin',
        'Mengurus kas dan keuangan sekolah',
        'Menjadi pengendali seluruh data siswa di semua unit'
      ]
    },
    finance: {
      label: 'Keuangan',
      scope: 'Pemasukan, pengeluaran, kas, tagihan, dan laporan keuangan.',
      features: [
        'Ringkasan pemasukan dan pengeluaran',
        'Tagihan siswa dan status pembayaran',
        'Laporan keuangan sekolah',
        'Approval dan monitoring anggaran'
      ],
      notAllowed: [
        'Penyusunan struktur kurikulum',
        'Mengelola data siswa harian',
        'Menjadi dashboard admin umum'
      ]
    },
    curriculum: {
      label: 'Kurikulum',
      scope: 'Perencanaan pembelajaran, mata pelajaran, dan evaluasi akademik.',
      features: [
        'Tahun ajaran dan semester',
        'Master mata pelajaran',
        'Rombel dan pembelajaran',
        'Nilai dan e-rapor',
        'Laporan kurikulum'
      ],
      notAllowed: [
        'Menangani tagihan dan kas',
        'Mengelola absensi pegawai',
        'Menjadi satu-satunya sumber data siswa'
      ]
    },
    studentAffairs: {
      label: 'Kesiswaan',
      scope: 'Data siswa, kelas, kedisiplinan, prestasi, dan perkembangan siswa.',
      features: [
        'Rekap siswa dan rombel',
        'Absensi siswa',
        'Prestasi dan observasi',
        'Pelanggaran dan perkembangan',
        'Laporan kesiswaan'
      ],
      notAllowed: [
        'Membuat jadwal pelajaran',
        'Mengurus kas sekolah',
        'Mengolah data pegawai secara penuh'
      ]
    },
    personnel: {
      label: 'Personalia',
      scope: 'Data pegawai, struktur organisasi, dan kebutuhan SDM sekolah.',
      features: [
        'Guru dan tenaga kependidikan',
        'Jabatan dan struktur organisasi',
        'Kehadiran pegawai',
        'Laporan personalia dan humas'
      ],
      notAllowed: [
        'Pengelolaan kurikulum harian',
        'Pembayaran siswa',
        'Rekap administrasi akademik pokok'
      ]
    },
    facilities: {
      label: 'Sarpras',
      scope: 'Inventaris, ruangan, aset, dan maintenance sekolah.',
      features: [
        'Inventaris aset',
        'Kondisi ruang dan fasilitas',
        'Pemeliharaan dan kebutuhan sarpras',
        'Laporan aset dan maintenance'
      ],
      notAllowed: [
        'Mengelola penilaian guru',
        'Mengatur data siswa',
        'Menjadi pusat dashboard seluruh sekolah'
      ]
    },
    [ROLES.ORTU]: {
      label: 'Orang Tua / Wali',
      scope: 'Pemantauan perkembangan dan kegiatan anak.',
      features: [
        'Perkembangan anak',
        'Kehadiran dan kinerja siswa',
        'Informasi rapor dan aktivitas sekolah'
      ],
      notAllowed: [
        'Mengelola data pihak sekolah',
        'Menerima akses operasional penuh',
        'Mengelola data keuangan sekolah'
      ]
    }
  });

  const NAV_ITEMS = Object.freeze({
    [ROLES.ADMIN]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Dashboard' },
      { hash: '#/admin/assignments', icon: 'ph-clipboard-text', text: 'Penugasan' },
      { hash: '#/admin/users', icon: 'ph-users', text: 'Pengguna' },
      { hash: '#/admin/classes', icon: 'ph-books', text: 'Kelas & Siswa' },
      { hash: '#/admin/subjects', icon: 'ph-book-bookmark', text: 'Mata Pelajaran' },
      { hash: '#/admin/extracurriculars', icon: 'ph-trophy', text: 'Ekstrakurikuler' },
      { hash: '#/admin/characters', icon: 'ph-star', text: 'Indikator Karakter' },
      { hash: '#/admin/attendance', icon: 'ph-calendar-check', text: 'Rekap Presensi' }
    ],
    [ROLES.GURU]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
      { hash: '#/guru/attendance', icon: 'ph-map-pin', text: 'Presensi Guru' },
      { hash: '#/guru/student-attendance', icon: 'ph-users-three', text: 'Absensi Siswa' },
      { hash: '#/guru/classes', icon: 'ph-chalkboard-teacher', text: 'E-Rapor (Kelas)' },
      { hash: '#/guru/academic', icon: 'ph-check-square', text: 'Nilai Akademik' },
      { hash: '#/guru/additional', icon: 'ph-folder-plus', text: 'Data Tambahan Rapor' },
      { hash: '#/guru/observations', icon: 'ph-note-pencil', text: 'Riwayat Observasi' }
    ],
    [ROLES.KEPSEK]: [
      { hash: '#/dashboard', icon: 'ph-chart-pie', text: 'Dashboard Sekolah' },
      { hash: '#/finance', icon: 'ph-wallet', text: 'Keuangan' },
      { hash: '#/curriculum', icon: 'ph-books', text: 'Kurikulum' },
      { hash: '#/student-affairs', icon: 'ph-users-three', text: 'Kesiswaan' },
      { hash: '#/personnel', icon: 'ph-briefcase', text: 'Personalia' },
      { hash: '#/facilities', icon: 'ph-building-office', text: 'Sarpras' },
      { hash: '#/kepsek/reports', icon: 'ph-file-text', text: 'Laporan Kelas' }
    ],
    [ROLES.ORTU]: [
      { hash: '#/ortu/dashboard', icon: 'ph-graduation-cap', text: 'Perkembangan Anak' }
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

  function getRoleNav(role, assignments = []) {
    const baseNav = NAV_ITEMS[role] || [];
    const unitAssignments = normalizeAssignments(assignments);
    const unitNav = unitAssignments.flatMap((unit) => {
      const route = MANAGEMENT_ROUTE_MAP[unit];
      if (!route) return [];
      const config = {
        '#/finance': { hash: '#/finance', icon: 'ph-wallet', text: 'Keuangan' },
        '#/curriculum': { hash: '#/curriculum', icon: 'ph-books', text: 'Kurikulum' },
        '#/student-affairs': { hash: '#/student-affairs', icon: 'ph-users-three', text: 'Kesiswaan' },
        '#/personnel': { hash: '#/personnel', icon: 'ph-briefcase', text: 'Personalia' },
        '#/facilities': { hash: '#/facilities', icon: 'ph-building-office', text: 'Sarpras' }
      };
      const moduleKey = Object.keys(MANAGEMENT_ROUTE_MAP).find((key) => MANAGEMENT_ROUTE_MAP[key] === route);
      if (!moduleKey || !MODULE_ACCESS[moduleKey]?.roles.includes(role)) return [];
      return [config[route]];
    }).filter(Boolean);

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
    ROLE_OPTIONS,
    ROLE_CONTENT_MAP,
    MODULE_ACCESS,
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
    getRoleBadgeClass
  });
})();
