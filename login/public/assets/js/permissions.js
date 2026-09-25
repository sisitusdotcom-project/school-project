(function () {
  const MODULES = Object.freeze({
    dashboard: {
      slug: 'dashboard',
      label: 'Dashboard',
      icon: 'ph-squares-four',
      roles: ['admin', 'kepsek', 'guru', 'ortu'],
      description: 'Ringkasan sistem dan indikator utama sekolah.'
    },
    finance: {
      slug: 'finance',
      label: 'Keuangan',
      icon: 'ph-wallet',
      roles: ['admin', 'kepsek'],
      description: 'Pemasukan, pengeluaran, tagihan, kas, dan laporan keuangan.'
    },
    curriculum: {
      slug: 'curriculum',
      label: 'Kurikulum',
      icon: 'ph-books',
      roles: ['admin', 'kepsek', 'guru'],
      description: 'Tahun ajaran, jadwal, mata pelajaran, rapor, dan laporan kurikulum.'
    },
    studentAffairs: {
      slug: 'studentAffairs',
      label: 'Kesiswaan',
      icon: 'ph-users-three',
      roles: ['admin', 'kepsek', 'guru'],
      description: 'Data siswa, kelas, presensi, prestasi, dan pelanggaran.'
    },
    personnel: {
      slug: 'personnel',
      label: 'Humas & Personalia',
      icon: 'ph-briefcase',
      roles: ['admin', 'kepsek'],
      description: 'Data pegawai, kehadiran, cuti, struktur organisasi, dan humas.'
    },
    facilities: {
      slug: 'facilities',
      label: 'Sarana & Prasarana',
      icon: 'ph-building-office',
      roles: ['admin', 'kepsek'],
      description: 'Inventaris, aset, ruangan, pemeliharaan, dan laporan sarpras.'
    }
  });

  const PERMISSIONS = Object.freeze({
    dashboard: 'dashboard.view',
    finance: {
      view: 'finance.view',
      create: 'finance.create',
      update: 'finance.update',
      delete: 'finance.delete',
      manage: 'finance.manage',
      approve: 'finance.approve'
    },
    curriculum: {
      view: 'curriculum.view',
      create: 'curriculum.create',
      update: 'curriculum.update',
      delete: 'curriculum.delete',
      manage: 'curriculum.manage'
    },
    studentAffairs: {
      view: 'studentAffairs.view',
      create: 'studentAffairs.create',
      update: 'studentAffairs.update',
      delete: 'studentAffairs.delete',
      manage: 'studentAffairs.manage'
    },
    personnel: {
      view: 'personnel.view',
      create: 'personnel.create',
      update: 'personnel.update',
      delete: 'personnel.delete',
      manage: 'personnel.manage'
    },
    facilities: {
      view: 'facilities.view',
      create: 'facilities.create',
      update: 'facilities.update',
      delete: 'facilities.delete',
      manage: 'facilities.manage'
    },
    attendance: {
      view: 'attendance.view',
      create: 'attendance.create',
      update: 'attendance.update',
      delete: 'attendance.delete',
      manage: 'attendance.manage'
    },
    reports: {
      view: 'reports.view',
      create: 'reports.create',
      update: 'reports.update',
      delete: 'reports.delete',
      manage: 'reports.manage'
    }
  });

  const ROLE_PERMISSIONS = Object.freeze({
    admin: [
      PERMISSIONS.dashboard,
      PERMISSIONS.finance.view,
      PERMISSIONS.curriculum.view,
      PERMISSIONS.studentAffairs.view,
      PERMISSIONS.personnel.view,
      PERMISSIONS.facilities.view,
      PERMISSIONS.attendance.view,
      PERMISSIONS.attendance.create,
      PERMISSIONS.attendance.update,
      PERMISSIONS.attendance.delete,
      PERMISSIONS.attendance.manage,
      PERMISSIONS.reports.view
    ],
    kepsek: [
      PERMISSIONS.dashboard,
      PERMISSIONS.finance.view,
      PERMISSIONS.finance.approve,
      PERMISSIONS.curriculum.view,
      PERMISSIONS.studentAffairs.view,
      PERMISSIONS.personnel.view,
      PERMISSIONS.facilities.view,
      PERMISSIONS.attendance.view,
      PERMISSIONS.reports.view
    ],
    guru: [
      PERMISSIONS.dashboard,
      PERMISSIONS.curriculum.view,
      PERMISSIONS.curriculum.create,
      PERMISSIONS.curriculum.update,
      PERMISSIONS.studentAffairs.view,
      PERMISSIONS.studentAffairs.create,
      PERMISSIONS.studentAffairs.update,
      PERMISSIONS.attendance.view,
      PERMISSIONS.attendance.create,
      PERMISSIONS.attendance.update,
      PERMISSIONS.attendance.manage,
      PERMISSIONS.reports.view
    ],
    ortu: [
      PERMISSIONS.dashboard,
      PERMISSIONS.studentAffairs.view,
      PERMISSIONS.reports.view
    ]
  });

  function hasPermission(role, permission) {
    if (!role || !permission) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  function can(role, permissionKey) {
    return hasPermission(role, permissionKey);
  }

  function getAllowedModules(role) {
    const roleKey = role || 'ortu';
    return Object.values(MODULES).filter((module) => module.slug === 'dashboard' || canAccessModule(roleKey, module.slug));
  }

  function canAccessModule(role, moduleKey) {
    return !!window.AppConfig?.MODULE_ACCESS?.[moduleKey]?.roles.includes(role);
  }

  window.PermissionManager = Object.freeze({
    MODULES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    hasPermission,
    can,
    getAllowedModules,
    canAccessModule
  });
})();
