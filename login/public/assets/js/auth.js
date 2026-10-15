const Auth = {
  currentUser: null,
  currentRole: null,
  currentAssignments: [],
  userData: null,
  init() {
    if (!auth) return;
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        try {
          const userData = await DB.getUser(user.uid);
          if (!userData) {
            await this.logout();
            return;
          }
          this.userData = userData;
          this.currentRole = userData.role;
          this.currentAssignments = AppConfig.normalizeAssignments(userData.assignments || userData.unitRoles || []);
          this.updateProfileUI();
          if (typeof NotificationService !== 'undefined') NotificationService.init(user.uid);
          if (userData.role === AppConfig.ROLES.ADMIN) DB.backfillUnitFlags().catch((err) => console.error(err));
          const appShell = document.getElementById('app-shell');
          const loginView = document.getElementById('login-view');
          if (appShell) appShell.classList.remove('hidden');
          if (loginView) loginView.classList.add('hidden');
          if (!location.hash || location.hash === '#/login') {
            window.location.hash = '#/dashboard';
            return;
          }
          Router.handleRoute();
        } catch (error) {
          console.error('Auth initialization failed:', error);
          await this.logout();
        }
        return;
      }
      this.currentUser = null;
      this.currentRole = null;
      this.currentAssignments = [];
      this.userData = null;
      if (typeof NotificationService !== 'undefined') NotificationService.init(null);
      const appShell = document.getElementById('app-shell');
      const loginView = document.getElementById('login-view');
      const loading = document.getElementById('app-loading');
      if (appShell) appShell.classList.add('hidden');
      if (loginView) loginView.classList.remove('hidden');
      if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
          loading.classList.add('hidden');
        }, 300);
      }
    });
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await this.login();
      });
    }
    const toggleButton = document.getElementById('toggle-password');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.togglePasswordVisibility());
    }
  },
  async login() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btn = document.getElementById('btn-login');
    const err = document.getElementById('login-error');
    if (!emailInput || !passwordInput || !btn || !err) return;
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    btn.disabled = true;
    btn.querySelector('.btn-text').innerText = 'Loading...';
    err.classList.add('hidden');
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        err.innerText = 'Email atau password salah.';
      } else if (error.code === 'auth/too-many-requests') {
        err.innerText = 'Terlalu banyak percobaan. Silakan coba lagi nanti.';
      } else {
        err.innerText = 'Terjadi kesalahan saat login: ' + error.message;
      }
      err.classList.remove('hidden');
      btn.disabled = false;
      btn.querySelector('.btn-text').innerText = 'Masuk';
    }
  },
  togglePasswordVisibility() {
    const passInput = document.getElementById('password');
    const icon = document.getElementById('toggle-password-icon');
    if (!passInput || !icon) return;
    const isPasswordHidden = passInput.type === 'password';
    passInput.type = isPasswordHidden ? 'text' : 'password';
    icon.classList.toggle('ph-eye', !isPasswordHidden);
    icon.classList.toggle('ph-eye-slash', isPasswordHidden);
  },
  async logout() {
    if (auth) await auth.signOut();
    window.location.hash = '';
  },
  async updateProfileCredentials(newEmail, newPassword) {
    if (!this.currentUser) throw new Error('Tidak ada pengguna yang login.');
    if (newEmail && newEmail !== this.currentUser.email) {
      await this.currentUser.updateEmail(newEmail);
    }
    if (newPassword && newPassword.length >= 6) {
      await this.currentUser.updatePassword(newPassword);
    }
  },
  updateProfileUI() {
    if (!this.userData) return;
    const pageUserName = document.getElementById('page-user-name');
    const pageUserRole = document.getElementById('page-user-role');
    const pageUserGreeting = document.getElementById('page-user-greeting');
    const avatarWrap = document.querySelector('.page-user__avatar');
    if (pageUserName) pageUserName.innerText = AppConfig.formatUserName(this.userData);
    if (pageUserRole) pageUserRole.innerText = AppConfig.getRoleAssignmentLabel(this.userData || { role: this.currentRole });
    if (pageUserGreeting) pageUserGreeting.innerText = `${this.getTimeGreeting()},`;
    if (avatarWrap) {
      const photoUrl = this.userData.photoURL || '';
      avatarWrap.innerHTML = '<i class="ph ph-user"></i>';
      const normalizedUrl = photoUrl
        ? DriveBridge.normalizeDriveImageUrl(photoUrl, 'w200', '')
        : '';
      if (normalizedUrl) {
        const image = document.createElement('img');
        image.src = normalizedUrl;
        image.alt = this.userData.name || 'Foto pengguna';
        image.onerror = () => {
          avatarWrap.innerHTML = '<i class="ph ph-user"></i>';
        };
        avatarWrap.replaceChildren(image);
      }
    }
    this.buildSidebar();
  },
  getTimeGreeting(hour = new Date().getHours()) {
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  },
  buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = '';
    const links = AppConfig.getRoleNav(this.currentRole, this.userData?.assignments || this.currentAssignments || []);
    let currentGroup = null;
    links.forEach((link) => {
      if (link.group && link.group !== currentGroup) {
        const groupTitle = document.createElement('div');
        groupTitle.className = 'nav-section-title';
        groupTitle.innerText = link.group;
        nav.appendChild(groupTitle);
        currentGroup = link.group;
      }
      const item = document.createElement('a');
      item.href = link.hash;
      item.className = 'btn-nav';
      item.innerHTML = `<i class="ph ${link.icon}"></i><span>${link.text}</span>`;
      nav.appendChild(item);
    });
    const loading = document.getElementById('app-loading');
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => loading.classList.add('hidden'), 300);
    }
  }
};
