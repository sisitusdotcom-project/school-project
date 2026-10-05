const App = {
  getDashboardRenderer() {
    const renderers = {
      [AppConfig.ROLES.ADMIN]: AdminPages.renderDashboard,
      [AppConfig.ROLES.GURU]: GuruPages.renderDashboard,
      [AppConfig.ROLES.KEPSEK]: KepsekPages.renderDashboard,
      [AppConfig.ROLES.ORTU]: OrtuPages.renderDashboard,
      [AppConfig.ROLES.PERSONNEL]: PersonnelPages.renderDashboard,
      [AppConfig.ROLES.FINANCE]: FinancePages.renderDashboard,
      [AppConfig.ROLES.FACILITIES]: FacilitiesPages.renderDashboard,
      [AppConfig.ROLES.CURRICULUM]: CurriculumPages.renderDashboard,
      [AppConfig.ROLES.STUDENT_AFFAIRS]: StudentAffairsPages.renderDashboard,
      [AppConfig.ROLES.IT_ADMIN]: ITAdminPages.renderDashboard
    };

    return renderers[Auth.currentRole] || (async (container) => {
      container.innerHTML = `
        <div class="card section-block">
          <div class="card-body text-center">
            <h3 class="card-title">Selamat Datang</h3>
            <p class="text-muted">Gunakan menu di samping untuk bernavigasi sesuai hak akses Anda.</p>
          </div>
        </div>
      `;
    });
  },

  getManagementPermissionKey(path, action = 'view') {
    const mapping = {
      '#/finance': `finance.${action}`,
      '#/curriculum': `curriculum.${action}`,
      '#/student-affairs': `studentAffairs.${action}`,
      '#/personnel': `personnel.${action}`,
      '#/facilities': `facilities.${action}`
    };
    return mapping[path] || null;
  },

  getManagementRouteConfig() {
    return {
      [AppConfig.ROLES.ADMIN]: [
        { path: '#/admin/assignments', title: 'Penugasan', icon: 'ph-clipboard-text' },
        { path: '#/admin/users', title: 'Pengguna', icon: 'ph-users' },
        { path: '#/admin/classes', title: 'Kelas & Siswa', icon: 'ph-books' },
        { path: '#/admin/students/:id', title: 'Siswa', icon: 'ph-graduation-cap' },
        { path: '#/admin/subjects', title: 'Mata Pelajaran', icon: 'ph-book-bookmark' },
        { path: '#/admin/characters', title: 'Indikator Karakter', icon: 'ph-star' },
        { path: '#/admin/extracurriculars', title: 'Ekstrakurikuler', icon: 'ph-trophy' },
        { path: '#/admin/attendance', title: 'Rekap Presensi', icon: 'ph-calendar-check' }
      ],
      [AppConfig.ROLES.GURU]: [
        { path: '#/guru/attendance', title: 'Presensi Guru', icon: 'ph-map-pin' },
        { path: '#/guru/student-attendance', title: 'Absensi Siswa', icon: 'ph-users-three' },
        { path: '#/guru/classes', title: 'E-Rapor', icon: 'ph-chalkboard-teacher' },
        { path: '#/guru/academic', title: 'Nilai Akademik', icon: 'ph-check-square' },
        { path: '#/guru/additional', title: 'Data Tambahan Rapor', icon: 'ph-folder-plus' },
        { path: '#/guru/observations', title: 'Observasi', icon: 'ph-note-pencil' },
        { path: '#/guru/assess/:id', title: 'Penilaian Karakter', icon: 'ph-note-pencil' },
        { path: '#/guru/observe/:id', title: 'Catatan Observasi', icon: 'ph-chat-text' },
        { path: '#/guru/student-attendance/:id', title: 'Input Absensi Siswa', icon: 'ph-users-three' }
      ],
      'GURU_EKSTRA': [
        { path: '#/guru/ekstra/syllabus', title: 'Program Latihan', icon: 'ph-clipboard-text' },
        { path: '#/guru/ekstra/attendance', title: 'Presensi Peserta', icon: 'ph-users-three' },
        { path: '#/guru/extracurriculars', title: 'Nilai E-Rapor Ekskul', icon: 'ph-trophy' },
        { path: '#/guru/ekstra/talents', title: 'Pemetaan Siswa Berbakat', icon: 'ph-star' }
      ],
      'KOORD_UMMI': [
        { path: '#/guru/ummi/koord/mapping', title: 'Pemetaan Rombel & Guru', icon: 'ph-users-three' },
        { path: '#/guru/ummi/koord/exams', title: 'Antrean Ujian Jilid', icon: 'ph-check-circle' },
        { path: '#/guru/ummi/koord/tasmi', title: 'Plotting Guru Tasmi\'', icon: 'ph-microphone-stage' }
      ],
      'TIM_UMMI': [
        { path: '#/guru/ummi/classes', title: 'Rombel Ummi Saya', icon: 'ph-chalkboard-teacher' },
        { path: '#/guru/ummi/progress', title: 'Jurnal Harian Jilid', icon: 'ph-book-open' },
        { path: '#/guru/ummi/tahfidz', title: 'Setoran Tahfidz', icon: 'ph-book-bookmark' },
        { path: '#/guru/ummi/tasmi', title: 'Ujian Tasmi\'', icon: 'ph-headphones' }
      ],
      [AppConfig.ROLES.KEPSEK]: [
        { path: '#/kepsek/reports', title: 'Laporan Kelas', icon: 'ph-file-text' }
      ],
      [AppConfig.ROLES.ORTU]: [
        { path: '#/ortu/dashboard', title: 'Perkembangan Anak', icon: 'ph-graduation-cap' }
      ],
      [AppConfig.ROLES.IT_ADMIN]: [
        { path: '#/it-admin/dashboard', title: 'Dashboard IT', icon: 'ph-monitor' },
        { path: '#/it-admin/sync', title: 'Sinkronisasi Dapodik', icon: 'ph-arrows-clockwise' },
        { path: '#/it-admin/backup', title: 'Backup & Restore', icon: 'ph-cloud-arrow-down' },
        { path: '#/it-admin/logs', title: 'Log Audit Sistem', icon: 'ph-scroll' },
        { path: '#/it-admin/network', title: 'Infrastruktur Jaringan', icon: 'ph-wifi-high' },
        { path: '#/it-admin/integration', title: 'Integrasi API & CBT', icon: 'ph-plugs' }
      ],
      [AppConfig.ROLES.CURRICULUM]: [
        { path: '#/curriculum/schedules', title: 'Jadwal & Kalender', icon: 'ph-calendar' },
        { path: '#/curriculum/syllabus', title: 'Perangkat & Modul', icon: 'ph-folder-open' },
        { path: '#/curriculum/monitoring', title: 'Pemantauan KBM', icon: 'ph-eye' },
        { path: '#/curriculum/evaluations', title: 'Sistem Penilaian', icon: 'ph-exam' },
        { path: '#/curriculum/supervision', title: 'Supervisi Guru', icon: 'ph-chalkboard-teacher' }
      ],
      [AppConfig.ROLES.FINANCE]: [
        { path: '#/finance/rkas', title: 'Penyusunan RKAS', icon: 'ph-chart-bar' },
        { path: '#/finance/transactions', title: 'Penerimaan & Pengeluaran', icon: 'ph-arrows-left-right' },
        { path: '#/finance/cashbook', title: 'Buku Kas Umum', icon: 'ph-book-open' },
        { path: '#/finance/taxes', title: 'Administrasi Pajak', icon: 'ph-receipt' },
        { path: '#/finance/archives', title: 'Arsip Bukti Transaksi', icon: 'ph-archive-box' },
        { path: '#/finance/reports', title: 'LPJ & Sinkronisasi Kas', icon: 'ph-file-text' },
        { path: '#/finance/transparency', title: 'Publikasi Anggaran', icon: 'ph-projector-screen' }
      ],
      [AppConfig.ROLES.STUDENT_AFFAIRS]: [
        { path: '#/student-affairs/ppdb', title: 'PPDB & Mutasi', icon: 'ph-user-plus' },
        { path: '#/student-affairs/mpls', title: 'Masa Pengenalan (MPLS)', icon: 'ph-flag-banner' },
        { path: '#/student-affairs/rules', title: 'Tata Tertib & TPPK', icon: 'ph-gavel' },
        { path: '#/student-affairs/achievements', title: 'Lomba & Penghargaan', icon: 'ph-medal' },
        { path: '#/student-affairs/scholarships', title: 'Data Beasiswa & PIP', icon: 'ph-hand-coins' }
      ],
      [AppConfig.ROLES.PERSONNEL]: [
        { path: '#/personnel/data', title: 'Data Kepegawaian', icon: 'ph-folder-user' },

        { path: '#/personnel/evaluations', title: 'Penilaian Kinerja (PKG)', icon: 'ph-chart-line-up' },
        { path: '#/personnel/training', title: 'Pelatihan & Kompetensi', icon: 'ph-certificate' },
        { path: '#/personnel/welfare', title: 'Kesejahteraan Staf', icon: 'ph-heart' },
        { path: '#/personnel/publications', title: 'Publikasi & Informasi', icon: 'ph-megaphone' },
        { path: '#/personnel/complaints', title: 'Layanan Pengaduan', icon: 'ph-chats' },
        { path: '#/personnel/partnerships', title: 'Kemitraan & MoU', icon: 'ph-handshake' },
        { path: '#/personnel/events', title: 'Manajemen Acara', icon: 'ph-calendar-star' }
      ],
      [AppConfig.ROLES.FACILITIES]: [
        { path: '#/facilities/inventory', title: 'Buku Inventaris', icon: 'ph-archive-box' },
        { path: '#/facilities/dapodik', title: 'Data Sarpras Dapodik', icon: 'ph-cloud-arrow-up' },
        { path: '#/facilities/planning', title: 'Analisis Kebutuhan', icon: 'ph-clipboard-text' },
        { path: '#/facilities/rkas', title: 'Rencana Pengadaan', icon: 'ph-shopping-cart' },
        { path: '#/facilities/maintenance', title: 'Perawatan Gedung', icon: 'ph-wrench' },
        { path: '#/facilities/safety', title: 'Keamanan Area', icon: 'ph-shield-check' },
        { path: '#/facilities/electronics', title: 'Elektronik & IT', icon: 'ph-desktop' },
        { path: '#/facilities/loans', title: 'Peminjaman Fasilitas', icon: 'ph-hand-pointing' },
        { path: '#/facilities/disposal', title: 'Penghapusan Aset', icon: 'ph-trash' }
      ],
      'TIM_B_INGGRIS': [
        { path: '#/guru/english/classes', title: 'Rombel English Lab', icon: 'ph-chalkboard-teacher' },
        { path: '#/guru/english/progress', title: 'Jurnal Progres Speaking', icon: 'ph-translate' }
      ]
    };
  },

  isManagementRouteAllowed(path, role = Auth.currentRole) {
    return this.isRouteAllowed(path, role);
  },

  isRouteAllowed(path, role = Auth.currentRole) {
    if (!role) return false;
    if (path === '#/dashboard') return !!this.getDashboardRenderer();
    
    // Some static paths that any user with the correct base module can access
    if (path.startsWith('#/admin/students/')) path = '#/admin/classes';
    if (path.startsWith('#/guru/assess/')) path = '#/guru/classes';
    if (path.startsWith('#/guru/observe/')) path = '#/guru/classes';
    if (path.startsWith('#/guru/student-attendance/')) path = '#/guru/student-attendance';
    if (path.startsWith('#/guru/classes/')) path = '#/guru/classes';
    
    const assignments = Auth.currentAssignments || [];
    const navItems = AppConfig.getRoleNav(role, assignments);
    
    return navItems.some(nav => {
      if (nav.hash === path) return true;
      return false;
    });
  },

  init() {
    const menuButton = document.getElementById('btn-menu-toggle');
    const closeButton = document.getElementById('btn-menu-close');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    const toggleMenu = () => {
      if (!sidebar || !backdrop) return;
      sidebar.classList.toggle('active');
      backdrop.classList.toggle('active');
    };

    if (menuButton) menuButton.addEventListener('click', toggleMenu);
    if (closeButton) closeButton.addEventListener('click', toggleMenu);
    if (backdrop) backdrop.addEventListener('click', toggleMenu);

    const dummyFeatures = [
      { path: '#/guru/ummi', title: 'Penilaian UMMI / Tahfidz', icon: 'ph-book-open-text', desc: 'Input progres dan penilaian metode UMMI / Tahfidz per siswa' },
      { path: '#/guru/english-lab', title: 'English Lab', icon: 'ph-translate', desc: 'Pencatatan kegiatan lab Bahasa Inggris dan progres siswa' }
    ];

    dummyFeatures.forEach(feature => {
      Router.add(feature.path, async (container) => {
        Router.setTitle(feature.title, feature.desc);
        container.innerHTML = `<div class="card"><div class="card-body text-center" style="padding: 40px 20px;"><i class="ph ${feature.icon}" style="font-size: 48px; color: var(--border-color); margin-bottom: 20px;"></i><h3 style="margin-bottom: 10px">Modul ${feature.title}</h3><p class="text-muted">${feature.desc}.<br>Fitur ini (Tahap 2) sedang disiapkan oleh tim developer.</p></div></div>`;
      });
    });

    Router.init();
    Router.add('#/dashboard', async (container) => {
      const renderer = this.getDashboardRenderer();
      if (renderer) {
        await renderer.call(null, container);
        return;
      }

      container.innerHTML = '<p class="text-center text-muted">Role tidak valid.</p>';
    });

    const registerProtectedRoute = ({ path, title, icon, handler, permissionKey }) => {
      Router.add(path, async (container) => {
        const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
        const hasAccess = this.isManagementRouteAllowed(path, role)
          && (!permissionKey || !window.PermissionManager || window.PermissionManager.hasPermission(role, permissionKey));

        if (!hasAccess) {
          container.innerHTML = `
            <div class="card">
              <div class="card-body">
                <h2 class="card-title"><i class="ph ${icon}"></i> ${title}</h2>
                <p class="text-muted">Anda belum memiliki akses untuk melihat modul ini.</p>
              </div>
            </div>
          `;
          return;
        }

        await handler(container);
      });
    };

    registerProtectedRoute({
      path: '#/finance',
      title: 'Keuangan',
      icon: 'ph-wallet',
      permissionKey: 'finance.view',
      handler: async (container) => {
        await FinancePages.renderDashboard(container);
      }
    });

    registerProtectedRoute({
      path: '#/curriculum',
      title: 'Kurikulum',
      icon: 'ph-books',
      permissionKey: 'curriculum.view',
      handler: async (container) => {
        await CurriculumPages.renderDashboard(container);
      }
    });

    registerProtectedRoute({
      path: '#/student-affairs',
      title: 'Kesiswaan',
      icon: 'ph-users-three',
      permissionKey: 'studentAffairs.view',
      handler: async (container) => {
        await StudentAffairsPages.renderDashboard(container);
      }
    });

    registerProtectedRoute({
      path: '#/personnel',
      title: 'Personalia',
      icon: 'ph-briefcase',
      permissionKey: 'personnel.view',
      handler: async (container) => {
        await PersonnelPages.renderDashboard(container);
      }
    });

    registerProtectedRoute({
      path: '#/facilities',
      title: 'Sarpras',
      icon: 'ph-building-office',
      permissionKey: 'facilities.view',
      handler: async (container) => {
        await FacilitiesPages.renderDashboard(container);
      }
    });

    const roleRoutes = Object.values(this.getManagementRouteConfig()).flat();

    roleRoutes.forEach(({ path, title, icon }) => {
      Router.add(path, async (container, routeParams) => {
        const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
        const permission = this.getManagementPermissionKey(path, 'view');
        const hasAccess = this.isRouteAllowed(path, role)
          && (!permission || (window.PermissionManager ? window.PermissionManager.hasPermission(role, permission) : true));

        if (!hasAccess) {
          container.innerHTML = `
            <div class="card">
              <div class="card-body">
                <h2 class="card-title"><i class="ph ${icon}"></i> ${title}</h2>
                <p class="text-muted">Anda belum memiliki akses untuk melihat modul ini.</p>
              </div>
            </div>
          `;
          return;
        }

        if (path === '#/admin/assignments') {
          await window.AdminAssignmentsModule.render(container);
          return;
        }

        if (path === '#/admin/users') {
          await AdminPages.renderUsers(container);
          return;
        }

        if (path === '#/admin/classes') {
          await AdminPages.renderClasses(container);
          return;
        }

        if (path === '#/admin/students/:id') {
          await AdminPages.renderStudents(container, routeParams);
          return;
        }

        if (path === '#/admin/subjects') {
          await AdminPages.renderSubjects(container);
          return;
        }

        if (path === '#/admin/characters') {
          await AdminPages.renderCharacters(container);
          return;
        }

        if (path === '#/admin/extracurriculars') {
          await AdminPages.renderExtracurriculars(container);
          return;
        }

        if (path === '#/admin/attendance') {
          await AdminPages.renderAttendance(container);
          return;
        }

        if (path === '#/guru/attendance') {
          await GuruPages.renderTeacherAttendance(container);
          return;
        }

        if (path === '#/guru/student-attendance') {
          await GuruPages.renderStudentAttendance(container);
          return;
        }

        if (path === '#/guru/classes') {
          await GuruPages.renderClasses(container);
          return;
        }

        if (path === '#/guru/academic') {
          await GuruPages.renderAcademicGrades(container);
          return;
        }

        if (path === '#/guru/additional') {
          await GuruPages.renderAdditionalData(container);
          return;
        }

        if (path === '#/guru/observations') {
          await GuruPages.renderObservationHistory(container);
          return;
        }

        if (path === '#/guru/assess/:id') {
          if (typeof GuruPages !== 'undefined' && GuruPages.renderAssessment) {
            await GuruPages.renderAssessment(container, routeParams);
          }
          return;
        }

        if (path === '#/guru/observe/:id') {
          if (typeof GuruPages !== 'undefined' && GuruPages.renderObserveClass) {
            await GuruPages.renderObserveClass(container, routeParams);
          }
          return;
        }

        if (path === '#/guru/student-attendance/:id') {
          if (typeof GuruPages !== 'undefined' && GuruPages.renderStudentAttendanceInput) {
            await GuruPages.renderStudentAttendanceInput(container, routeParams);
          }
          return;
        }

        if (path === '#/kepsek/reports') {
          await KepsekPages.renderReports(container);
          return;
        }

        if (path === '#/ortu/dashboard') {
          await OrtuPages.renderDashboard(container);
          return;
        }

        if (path.startsWith('#/it-admin/')) {
          if (path === '#/it-admin/dashboard' && typeof ITAdminPages !== 'undefined' && ITAdminPages.renderDashboard) {
            await ITAdminPages.renderDashboard(container);
          } else if (typeof ITAdminPages !== 'undefined' && ITAdminPages.renderPlaceholder) {
            await ITAdminPages.renderPlaceholder(container, title, icon);
          } else {
            container.innerHTML = `
              <div class="card section-block">
                <div class="card-body">
                  <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
                  <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
                </div>
              </div>
            `;
          }
          return;
        }

        if (path.startsWith('#/curriculum/')) {
          if (typeof CurriculumPages !== 'undefined' && CurriculumPages.renderPlaceholder) {
            await CurriculumPages.renderPlaceholder(container, title, icon);
          } else {
            container.innerHTML = `
              <div class="card section-block">
                <div class="card-body">
                  <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
                  <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
                </div>
              </div>
            `;
          }
          return;
        }

        if (path.startsWith('#/finance/')) {
          if (typeof FinancePages !== 'undefined' && FinancePages.renderPlaceholder) {
            await FinancePages.renderPlaceholder(container, title, icon);
          } else {
            container.innerHTML = `
              <div class="card section-block">
                <div class="card-body">
                  <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
                  <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
                </div>
              </div>
            `;
          }
          return;
        }

        if (path.startsWith('#/student-affairs/')) {
          if (typeof StudentAffairsPages !== 'undefined' && StudentAffairsPages.renderPlaceholder) {
            await StudentAffairsPages.renderPlaceholder(container, title, icon);
          } else {
            container.innerHTML = `
              <div class="card section-block">
                <div class="card-body">
                  <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
                  <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
                </div>
              </div>
            `;
          }
          return;
        }

        if (path.startsWith('#/personnel/')) {
          if (typeof PersonnelPages !== 'undefined' && PersonnelPages.renderPlaceholder) {
            await PersonnelPages.renderPlaceholder(container, title, icon);
          } else {
            container.innerHTML = `
              <div class="card section-block">
                <div class="card-body">
                  <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
                  <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
                </div>
              </div>
            `;
          }
          return;
        }

        if (path.startsWith('#/facilities/')) {
          if (typeof FacilitiesPages !== 'undefined' && FacilitiesPages.renderPlaceholder) {
            await FacilitiesPages.renderPlaceholder(container, title, icon);
          } else {
            container.innerHTML = `
              <div class="card section-block">
                <div class="card-body">
                  <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
                  <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
                </div>
              </div>
            `;
          }
          return;
        }

        if (path.startsWith('#/guru/ekstra/') || path === '#/guru/extracurriculars') {
          if (typeof GuruPages !== 'undefined' && GuruPages.renderPlaceholder) {
            await GuruPages.renderPlaceholder(container, title, icon);
          } else {
            container.innerHTML = `
              <div class="card section-block">
                <div class="card-body">
                  <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
                  <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
                </div>
              </div>
            `;
          }
          return;
        }

        if (path.startsWith('#/guru/ummi/')) {
          if (typeof UMMIPages !== 'undefined' && UMMIPages.renderPlaceholder) {
            await UMMIPages.renderPlaceholder(container, title, icon);
          } else {
            container.innerHTML = `
              <div class="card section-block">
                <div class="card-body">
                  <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
                  <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
                </div>
              </div>
            `;
          }
          return;
        }
        if (path.startsWith('#/guru/english/') || path.startsWith('#/staff/')) {
          container.innerHTML = `
            <div class="card section-block">
              <div class="card-body">
                <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
                <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
              </div>
            </div>
          `;
          return;
        }
      });
    });

    Auth.init();
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();

  const splitWrapper = document.querySelector('.auth-split-wrapper');
  if (splitWrapper) {
    setInterval(() => {
      if (window.innerWidth <= 991 && splitWrapper.scrollLeft === 0) {
        splitWrapper.classList.add('nudge-swipe');
        setTimeout(() => {
          splitWrapper.classList.remove('nudge-swipe');
        }, 600);
      }
    }, 4000);
  }
});
