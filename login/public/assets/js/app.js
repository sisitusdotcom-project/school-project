const App = {
  getDashboardRenderer() {
    const role = Auth.currentRole || Auth.userData?.role;
    const assignments = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
    if (AppConfig.isPureGuruEkstra(role, assignments)) {
      return GuruPages.renderEkstraDashboard;
    }
    if (AppConfig.isPureGuruUmmi(role, assignments)) {
      return GuruPages.renderUmmiDashboard;
    }
    const renderers = {
      '#/panduan': typeof FeatureGuides !== 'undefined' ? FeatureGuides.renderGuidePage : null,
      [AppConfig.ROLES.ADMIN]: AdminPages.renderDashboard,
      [AppConfig.ROLES.GURU]: GuruPages.renderDashboard,
      [AppConfig.ROLES.GURU_EKSKUL]: GuruPages.renderEkstraDashboard,
      [AppConfig.ROLES.GURU_UMMI]: GuruPages.renderUmmiDashboard,
      [AppConfig.ROLES.TENDIK]: GuruPages.renderTendikDashboard,
      [AppConfig.ROLES.KOMITE]: typeof KomitePages !== 'undefined' ? KomitePages.renderDashboard : null,
      [AppConfig.ROLES.KEPSEK]: KepsekPages.renderDashboard,
      [AppConfig.ROLES.ORTU]: OrtuPages.renderDashboard,
      [AppConfig.ROLES.PERSONNEL]: PersonnelPages.renderDashboard,
      [AppConfig.ROLES.FINANCE]: FinancePages.renderDashboard,
      [AppConfig.ROLES.FACILITIES]: FacilitiesPages.renderDashboard,
      [AppConfig.ROLES.CURRICULUM]: CurriculumPages.renderDashboard,
      [AppConfig.ROLES.STUDENT_AFFAIRS]: StudentAffairsPages.renderDashboard,
      [AppConfig.ROLES.IT_ADMIN]: ITAdminPages.renderDashboard
    };
    return renderers[role] || (async (container) => {
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
  isRouteAllowed(rawPath, role = Auth.currentRole) {
    if (!role) return false;
    let path = rawPath || '#/dashboard';
    if (path === '#/guru/attendance') path = '#/attendance';
    if (path === '#/panduan') return true;
    if (path === '#/dashboard' || path === '#/ortu/dashboard') return !!this.getDashboardRenderer();
    if (role === AppConfig.ROLES.ADMIN) return true;
    if (path === '#/attendance' && role !== AppConfig.ROLES.ORTU && role !== AppConfig.ROLES.KOMITE) return true;
    if (path.startsWith('#/admin/students/')) path = '#/admin/classes';
    if (path.startsWith('#/guru/assess/')) path = '#/guru/classes';
    if (path.startsWith('#/guru/observe/')) path = '#/guru/classes';
    if (path.startsWith('#/guru/student-attendance/')) path = '#/guru/student-attendance';
    if (path.startsWith('#/guru/classes/')) path = '#/guru/classes';
    if (path === '#/personnel/training') path = '#/personnel/portfolio';
    if (path === '#/personnel/welfare') path = '#/finance/welfare';
    const assignments = Auth.currentAssignments || [];
    if (role === AppConfig.ROLES.GURU || role === AppConfig.ROLES.GURU_EKSKUL || role === AppConfig.ROLES.GURU_UMMI) {
      const guruAllowed = [
        '#/attendance',
        '#/guru/academic',
        '#/gtk/salary-slip',
        '#/gtk/official-travel',
        '#/curriculum/syllabus',
        '#/guru/portfolio',
        '#/guru/observations',
        '#/guru/student-attendance',
        '#/guru/classes',
        '#/guru/additional',
        '#/student-affairs/leaves',
        '#/guru/ekstra/syllabus',
        '#/guru/ekstra/attendance',
        '#/guru/extracurriculars',
        '#/guru/ekstra/talents',
        '#/guru/ummi/classes',
        '#/guru/ummi/progress',
        '#/guru/ummi/tahfidz',
        '#/guru/ummi/tasmi',
        '#/guru/ummi/koord/mapping',
        '#/guru/ummi/koord/exams',
        '#/guru/ummi/koord/tasmi'
      ];
      if (guruAllowed.includes(path)) return true;
    }
    if (role === AppConfig.ROLES.KEPSEK) {
      const kepsekPrefixes = ['#/dashboard', '#/attendance', '#/admin/attendance', '#/kepsek/', '#/curriculum', '#/student-affairs', '#/finance', '#/personnel', '#/facilities', '#/komite'];
      if (kepsekPrefixes.some(p => path === p || path.startsWith(p + '/'))) return true;
    }
    if (role === AppConfig.ROLES.TENDIK) {
      const tendikAllowed = ['#/attendance', '#/tendik/performance', '#/tendik/portfolio'];
      if (tendikAllowed.includes(path)) return true;
    }
    if (role === AppConfig.ROLES.KOMITE) {
      const komiteAllowed = ['#/dashboard', '#/komite/activities', '#/komite/finance-paguyuban', '#/panduan'];
      if (komiteAllowed.includes(path)) return true;
    }
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
      const notifDropdown = document.getElementById('notif-dropdown');
      if (notifDropdown && notifDropdown.classList.contains('active')) {
        notifDropdown.classList.remove('active');
      }
      sidebar.classList.toggle('active');
      backdrop.classList.toggle('active');
    };
    if (menuButton) menuButton.addEventListener('click', toggleMenu);
    if (closeButton) closeButton.addEventListener('click', toggleMenu);
    if (backdrop) backdrop.addEventListener('click', toggleMenu);
    const pageLogout = document.getElementById('page-user-logout');
    if (pageLogout) pageLogout.addEventListener('click', () => Auth.logout());
    let pendingProfilePhotoDataUrl = null;
    let pendingProfilePhotoAction = 'keep';
    const profileButton = document.getElementById('page-user-profile');
    if (profileButton) {
      profileButton.addEventListener('click', async () => {
        const u = await DB.getUser(Auth.currentUser.uid);
        if (!u) return;
        pendingProfilePhotoDataUrl = null;
        pendingProfilePhotoAction = 'keep';
        const nameEl = document.getElementById('profile-name');
        const roleEl = document.getElementById('profile-role');
        const emailEl = document.getElementById('profile-email');
        const pwdEl = document.getElementById('profile-password');
        const previewEl = document.getElementById('profile-avatar-preview');
        const removeBtn = document.getElementById('btn-remove-photo');
        const fileInput = document.getElementById('profile-photo-input');
        if (nameEl) {
          const val = AppConfig.formatUserName(u);
          if (nameEl.tagName === 'INPUT') nameEl.value = val;
          else nameEl.textContent = val;
        }
        if (roleEl) {
          const val = AppConfig.getRoleAssignmentLabel(u || { role: Auth.currentRole });
          if (roleEl.tagName === 'INPUT') roleEl.value = val;
          else roleEl.textContent = val;
        }
        if (emailEl) emailEl.value = Auth.currentUser.email || '';
        if (pwdEl) pwdEl.value = '';
        if (fileInput) fileInput.value = '';
        if (previewEl) {
          const photoUrl = u.photoURL || Auth.userData?.photoURL || '';
          if (photoUrl) {
            const normalized = DriveBridge.normalizeDriveImageUrl(photoUrl, 'w200', '');
            previewEl.innerHTML = `<img src="${normalized}" alt="Foto profil">`;
            if (removeBtn) {
              removeBtn.classList.remove('hidden');
              removeBtn.style.display = 'inline-flex';
            }
          } else {
            previewEl.innerHTML = '<i class="ph ph-user"></i>';
            if (removeBtn) {
              removeBtn.classList.add('hidden');
              removeBtn.style.display = 'none';
            }
          }
        }
        App.openModal('modal-profile');
      });
    }
    const changePhotoBtn = document.getElementById('btn-change-photo');
    const photoInput = document.getElementById('profile-photo-input');
    const removePhotoBtn = document.getElementById('btn-remove-photo');
    if (changePhotoBtn && photoInput) {
      changePhotoBtn.addEventListener('click', () => photoInput.click());
      photoInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          alert('Harap pilih berkas foto/gambar (JPG/PNG).');
          return;
        }
        try {
          const previewEl = document.getElementById('profile-avatar-preview');
          const dataUrl = await SmartFileCompressor.cropAndResizeAvatar(file, 320);
          pendingProfilePhotoDataUrl = dataUrl;
          pendingProfilePhotoAction = 'update';
          if (previewEl) {
            previewEl.innerHTML = `<img src="${dataUrl}" alt="Pratinjau foto baru">`;
          }
          if (removePhotoBtn) {
            removePhotoBtn.classList.remove('hidden');
            removePhotoBtn.style.display = 'inline-flex';
          }
        } catch (err) {
          alert('Gagal memproses foto: ' + err.message);
        }
      });
    }
    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', () => {
        pendingProfilePhotoDataUrl = null;
        pendingProfilePhotoAction = 'remove';
        const previewEl = document.getElementById('profile-avatar-preview');
        const fileInput = document.getElementById('profile-photo-input');
        if (previewEl) previewEl.innerHTML = '<i class="ph ph-user"></i>';
        if (fileInput) fileInput.value = '';
        removePhotoBtn.classList.add('hidden');
        removePhotoBtn.style.display = 'none';
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
          if (pendingProfilePhotoAction === 'update' && pendingProfilePhotoDataUrl) {
            btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Mengunggah foto...';
            const uploadedUrl = await DB.saveProfilePhoto(Auth.currentUser.uid, pendingProfilePhotoDataUrl, 'image/jpeg');
            if (uploadedUrl && Auth.userData) {
              Auth.userData.photoURL = uploadedUrl;
            }
          } else if (pendingProfilePhotoAction === 'remove') {
            await DB.removeProfilePhoto(Auth.currentUser.uid);
            if (Auth.userData) Auth.userData.photoURL = '';
          }
          if (email !== (Auth.currentUser.email || '') || pwd) {
            btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Memperbarui akun...';
            await Auth.updateProfileCredentials(email, pwd);
          }
          Auth.updateProfileUI();
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
    ['#/admin/students/:id', '#/guru/assess/:id', '#/guru/observe/:id', '#/guru/student-attendance/:id', '#/panduan'].forEach(r => allRoutes.add(r));
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
        const renderers = {
          '#/panduan': typeof FeatureGuides !== 'undefined' ? FeatureGuides.renderGuidePage : null,
          '#/admin/assignments': window.AdminAssignmentsModule?.render,
          '#/admin/users': typeof AdminPages !== 'undefined' ? AdminPages.renderUsers : null,
          '#/admin/classes': typeof AdminPages !== 'undefined' ? AdminPages.renderClasses : null,
          '#/admin/students/:id': typeof AdminPages !== 'undefined' ? AdminPages.renderStudents : null,
          '#/admin/subjects': typeof AdminPages !== 'undefined' ? AdminPages.renderSubjects : null,
          '#/admin/characters': typeof AdminPages !== 'undefined' ? AdminPages.renderCharacters : null,
          '#/admin/extracurriculars': typeof AdminPages !== 'undefined' ? AdminPages.renderExtracurriculars : null,
          '#/admin/attendance': typeof AdminPages !== 'undefined' ? AdminPages.renderAttendance : null,
          '#/gtk/salary-slip': typeof GuruPages !== 'undefined' ? GuruPages.renderSalarySlip : null,
          '#/attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderTeacherAttendance : null,
          '#/guru/attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderTeacherAttendance : null,
          '#/guru/student-attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderStudentAttendance : null,
          '#/guru/classes': typeof GuruPages !== 'undefined' ? GuruPages.renderClasses : null,
          '#/guru/academic': typeof GuruPages !== 'undefined' ? GuruPages.renderAcademicGrades : null,
          '#/guru/additional': typeof GuruPages !== 'undefined' ? GuruPages.renderAdditionalData : null,
          '#/guru/observations': typeof GuruPages !== 'undefined' ? GuruPages.renderObservationHistory : null,
          '#/guru/assess/:id': typeof GuruPages !== 'undefined' ? GuruPages.renderAssessment : null,
          '#/guru/observe/:id': typeof GuruPages !== 'undefined' ? GuruPages.renderObserveClass : null,
          '#/guru/student-attendance/:id': typeof GuruPages !== 'undefined' ? GuruPages.renderStudentAttendanceInput : null,
          '#/guru/ekstra/attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderEkstraAttendance : null,
          '#/guru/extracurriculars': typeof GuruPages !== 'undefined' ? GuruPages.renderEkstraGrades : null,
          '#/guru/ummi/koord/mapping': typeof UMMIPages !== 'undefined' ? UMMIPages.renderUmmiMapping : null,
          '#/guru/ummi/classes': typeof UMMIPages !== 'undefined' ? UMMIPages.renderUmmiClasses : null,
          '#/guru/ummi/progress': typeof UMMIPages !== 'undefined' ? UMMIPages.renderProgress : null,
          '#/guru/ummi/tahfidz': typeof UMMIPages !== 'undefined' ? UMMIPages.renderTahfidz : null,
          '#/guru/ummi/tasmi': typeof UMMIPages !== 'undefined' ? UMMIPages.renderTasmi : null,
          '#/guru/ummi/koord/exams': typeof UMMIPages !== 'undefined' ? UMMIPages.renderExams : null,
          '#/guru/ummi/koord/tasmi': typeof UMMIPages !== 'undefined' ? UMMIPages.renderTasmiPlotting : null,
          '#/kepsek/reports': typeof KepsekPages !== 'undefined' ? KepsekPages.renderReports : null,
          '#/ortu/dashboard': typeof OrtuPages !== 'undefined' ? OrtuPages.renderDashboard : null,
          '#/parent/report-card': typeof OrtuPages !== 'undefined' ? OrtuPages.renderReportCard : null,
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
        if (typeof ModuleKit !== 'undefined' && ModuleKit.has(path)) {
          const config = ModuleKit.defs[path];
          await ModuleKit.render(container, path, config.noun || 'Modul', config.icon || 'ph-cube');
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
document.addEventListener('click', (e) => {
  const closeBtn = e.target.closest('[data-close-modal]');
  if (closeBtn) {
    App.closeModal(closeBtn.dataset.closeModal);
    return;
  }
  const prevBtn = e.target.closest('[data-preview-url], [data-proof-url]');
  if (prevBtn) {
    e.preventDefault();
    const url = prevBtn.dataset.previewUrl || prevBtn.dataset.proofUrl;
    const title = prevBtn.dataset.previewTitle || 'Bukti Presensi / Berkas';
    if (typeof ModuleKit !== 'undefined' && ModuleKit.showFilePreview) {
      ModuleKit.showFilePreview(url, title);
    }
  }
});
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
