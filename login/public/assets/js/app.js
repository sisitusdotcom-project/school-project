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
    
    return navItems.some(nav => nav.hash === path);
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

    const profileWidget = document.querySelector('.user-profile-widget');
    if (profileWidget) {
      profileWidget.style.cursor = 'pointer';
      profileWidget.addEventListener('click', async () => {
        const u = await DB.getUser(Auth.currentUser.uid);
        if (!u) return;
        document.getElementById('profile-email').value = Auth.currentUser.email || '';
        document.getElementById('profile-password').value = '';
        App.openModal('modal-profile');
      });
    }

    const formProfile = document.getElementById('form-profile');
    if (formProfile) {
      formProfile.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formProfile.querySelector('button[type="submit"]');
        const email = document.getElementById('profile-email').value.trim();
        const pwd = document.getElementById('profile-password').value;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
        
        try {
          // Update Firebase Auth if credentials change
          await Auth.updateProfileCredentials(email, pwd);
          
          alert('Profil berhasil diperbarui!');
          App.closeModal('modal-profile');
        } catch (err) {
          alert('Gagal memperbarui profil: ' + err.message);
        } finally {
          btn.disabled = false;
          btn.innerHTML = 'Simpan Profil';
        }
      });
    }

    Router.init();
    Router.add('#/dashboard', async (container) => {
      const renderer = this.getDashboardRenderer();
      if (renderer) {
        await renderer.call(null, container);
        return;
      }

      container.innerHTML = '<p class="text-center text-muted">Role tidak valid.</p>';
    });

    const allRoutes = new Set();
    Object.values(AppConfig.NAV_ITEMS).forEach(items => {
      items.forEach(item => {
        allRoutes.add(item.hash);
      });
    });
    
    // Add dynamic routes manually
    ['#/admin/students/:id', '#/guru/assess/:id', '#/guru/observe/:id', '#/guru/student-attendance/:id'].forEach(r => allRoutes.add(r));

    // Register all routes
    allRoutes.forEach(path => {
      if (path === '#/dashboard') return;
      
      Router.add(path, async (container, routeParams) => {
        const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
        const hasAccess = this.isRouteAllowed(path, role);

        if (!hasAccess) {
          container.innerHTML = `
            <div class="card">
              <div class="card-body">
                <h2 class="card-title"><i class="ph ph-lock"></i> Akses Ditolak</h2>
                <p class="text-muted">Anda belum memiliki akses untuk melihat modul ini.</p>
              </div>
            </div>
          `;
          return;
        }

        if (typeof ModuleKit !== 'undefined' && ModuleKit.has(path)) {
          const config = ModuleKit.defs[path];
          await ModuleKit.render(container, path, config.noun || 'Modul', config.icon || 'ph-cube');
          return;
        }

        // Custom renderers
        const renderers = {
          '#/admin/assignments': window.AdminAssignmentsModule?.render,
          '#/admin/users': typeof AdminPages !== 'undefined' ? AdminPages.renderUsers : null,
          '#/admin/classes': typeof AdminPages !== 'undefined' ? AdminPages.renderClasses : null,
          '#/admin/students/:id': typeof AdminPages !== 'undefined' ? AdminPages.renderStudents : null,
          '#/admin/subjects': typeof AdminPages !== 'undefined' ? AdminPages.renderSubjects : null,
          '#/admin/characters': typeof AdminPages !== 'undefined' ? AdminPages.renderCharacters : null,
          '#/admin/extracurriculars': typeof AdminPages !== 'undefined' ? AdminPages.renderExtracurriculars : null,
          '#/admin/attendance': typeof AdminPages !== 'undefined' ? AdminPages.renderAttendance : null,
          '#/attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderTeacherAttendance : null,
          '#/guru/attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderTeacherAttendance : null, // Backwards compatibility
          '#/guru/student-attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderStudentAttendance : null,
          '#/guru/classes': typeof GuruPages !== 'undefined' ? GuruPages.renderClasses : null,
          '#/guru/academic': typeof GuruPages !== 'undefined' ? GuruPages.renderAcademicGrades : null,
          '#/guru/additional': typeof GuruPages !== 'undefined' ? GuruPages.renderAdditionalData : null,
          '#/guru/observations': typeof GuruPages !== 'undefined' ? GuruPages.renderObservationHistory : null,
          '#/guru/assess/:id': typeof GuruPages !== 'undefined' ? GuruPages.renderAssessment : null,
          '#/guru/observe/:id': typeof GuruPages !== 'undefined' ? GuruPages.renderObserveClass : null,
          '#/guru/student-attendance/:id': typeof GuruPages !== 'undefined' ? GuruPages.renderStudentAttendanceInput : null,
          '#/kepsek/reports': typeof KepsekPages !== 'undefined' ? KepsekPages.renderReports : null,
          '#/ortu/dashboard': typeof OrtuPages !== 'undefined' ? OrtuPages.renderDashboard : null,
          '#/finance': typeof FinancePages !== 'undefined' ? FinancePages.renderDashboard : null,
          '#/curriculum': typeof CurriculumPages !== 'undefined' ? CurriculumPages.renderDashboard : null,
          '#/student-affairs': typeof StudentAffairsPages !== 'undefined' ? StudentAffairsPages.renderDashboard : null,
          '#/personnel': typeof PersonnelPages !== 'undefined' ? PersonnelPages.renderDashboard : null,
          '#/facilities': typeof FacilitiesPages !== 'undefined' ? FacilitiesPages.renderDashboard : null,
          '#/it-admin/dashboard': typeof ITAdminPages !== 'undefined' ? ITAdminPages.renderDashboard : null
        };

        if (renderers[path]) {
          await renderers[path](container, routeParams);
          return;
        }

        container.innerHTML = `
          <div class="card section-block">
            <div class="card-body">
              <h3 class="card-title"><i class="ph ph-hammer"></i> Modul Tahap Pengembangan</h3>
              <p class="text-muted">Modul ini sedang disiapkan dan akan segera hadir.</p>
            </div>
          </div>
        `;
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
