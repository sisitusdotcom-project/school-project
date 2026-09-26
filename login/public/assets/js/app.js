const App = {
  getDashboardRenderer() {
    const renderers = {
      [AppConfig.ROLES.ADMIN]: AdminPages.renderDashboard,
      [AppConfig.ROLES.GURU]: GuruPages.renderDashboard,
      [AppConfig.ROLES.KEPSEK]: KepsekPages.renderDashboard,
      [AppConfig.ROLES.ORTU]: OrtuPages.renderDashboard
    };

    return renderers[Auth.currentRole] || null;
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
        { path: '#/guru/observations', title: 'Observasi', icon: 'ph-note-pencil' }
      ],
      [AppConfig.ROLES.KEPSEK]: [
        { path: '#/kepsek/reports', title: 'Laporan Kelas', icon: 'ph-file-text' }
      ],
      [AppConfig.ROLES.ORTU]: [
        { path: '#/ortu/dashboard', title: 'Perkembangan Anak', icon: 'ph-graduation-cap' }
      ]
    };
  },

  isManagementRouteAllowed(path, role = Auth.currentRole) {
    if (!role) return false;
    const modules = {
      '#/finance': 'finance',
      '#/curriculum': 'curriculum',
      '#/student-affairs': 'studentAffairs',
      '#/personnel': 'personnel',
      '#/facilities': 'facilities'
    };
    const module = modules[path];

    if (!module) return false;
    return window.PermissionManager
      ? window.PermissionManager.canAccessModule(role, module)
      : AppConfig.MODULE_ACCESS[module]?.roles.includes(role);
  },

  isRouteAllowed(path, role = Auth.currentRole) {
    if (path === '#/dashboard') return !!this.getDashboardRenderer();
    if (this.isManagementRouteAllowed(path, role)) return true;

    const allowedRoutes = this.getManagementRouteConfig()[role] || [];
    return allowedRoutes.some(({ path: allowedPath }) => {
      if (allowedPath === path) return true;
      if (!allowedPath.includes('/:id')) return false;
      return path.startsWith(allowedPath.replace('/:id', '/'));
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

        if (path === '#/kepsek/reports') {
          await KepsekPages.renderReports(container);
          return;
        }

        if (path === '#/ortu/dashboard') {
          await OrtuPages.renderDashboard(container);
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
