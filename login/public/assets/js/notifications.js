const NotificationService = {
  dbRef: null,
  activeListener: null,
  notifications: [],
  currentUid: null,
  init(uid) {
    if (this.activeListener && this.dbRef) {
      this.dbRef.off('value', this.activeListener);
      this.activeListener = null;
    }
    this.currentUid = uid;
    this.notifications = [];
    if (!uid || !isDBReady()) {
      this.renderBadge();
      this.renderDropdown();
      return;
    }
    this.dbRef = db.ref(`notifications/${uid}`);
    this.activeListener = this.dbRef.limitToLast(30).on('value', (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, item]) => ({ id, ...item }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      this.notifications = list;
      this.renderBadge();
      this.renderDropdown();
    });
    this.setupDropdownListeners(uid);
  },
  async send({ recipientUid, title, message, link = '', type = 'info' }) {
    if (!recipientUid || !isDBReady()) return;
    await db.ref(`notifications/${recipientUid}`).push({
      title,
      message,
      link,
      type,
      read: false,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async sendToRole({ role, unit, title, message, link = '', type = 'info', excludeUid = null }) {
    if (!isDBReady()) return;
    const users = await DB.getAllUsers();
    const targets = new Set();
    const unitList = Array.isArray(unit) ? unit : (unit ? [unit] : []);
    const roleList = Array.isArray(role) ? role : (role ? [role] : []);
    Object.entries(users || {}).forEach(([uid, u]) => {
      if (!u || (excludeUid && uid === excludeUid)) return;
      const assignments = AppConfig.getRoleAssignments(u);
      const hasUnit = unitList.some((un) => assignments.includes(un));
      const hasRole = roleList.some((r) => u.role === r || assignments.includes(r));
      if (unitList.length && roleList.length) {
        if (hasUnit || hasRole) targets.add(uid);
      } else if (unitList.length) {
        if (hasUnit) targets.add(uid);
      } else if (roleList.length) {
        if (hasRole) targets.add(uid);
      }
    });
    await Promise.all(Array.from(targets).map((uid) => this.send({ recipientUid: uid, title, message, link, type })));
  },
  async markAsRead(uid, notifId) {
    if (!uid || !notifId || !isDBReady()) return;
    await db.ref(`notifications/${uid}/${notifId}`).update({ read: true });
  },
  async markAllAsRead(uid) {
    if (!uid || !isDBReady()) return;
    const updates = {};
    this.notifications.forEach((n) => {
      if (!n.read) updates[`${n.id}/read`] = true;
    });
    if (Object.keys(updates).length) {
      await db.ref(`notifications/${uid}`).update(updates);
    }
  },
  renderBadge() {
    const unreadCount = this.notifications.filter((n) => !n.read).length;
    const badges = document.querySelectorAll('.notif-badge');
    badges.forEach((b) => {
      if (unreadCount > 0) {
        b.textContent = unreadCount > 99 ? '99+' : unreadCount;
        b.classList.add('active');
      } else {
        b.textContent = '0';
        b.classList.remove('active');
      }
    });
    const headerCount = document.getElementById('notif-unread-count');
    if (headerCount) {
      if (unreadCount > 0) {
        headerCount.textContent = `${unreadCount} Baru`;
        headerCount.classList.add('active');
      } else {
        headerCount.textContent = '0';
        headerCount.classList.remove('active');
      }
    }
  },
  renderDropdown() {
    const listEl = document.getElementById('notif-list');
    if (!listEl) return;
    if (!this.notifications.length) {
      listEl.innerHTML = '<div class="notif-empty"><i class="ph ph-bell-slash"></i><p>Tidak ada notifikasi baru.</p></div>';
      return;
    }
    listEl.innerHTML = this.notifications.map((n) => {
      let icon = 'ph-bell';
      if (n.type === 'success') icon = 'ph-check-circle';
      else if (n.type === 'warning') icon = 'ph-warning';
      else if (n.type === 'danger') icon = 'ph-warning-octagon';
      else if (n.type === 'info') icon = 'ph-info';
      const timeStr = n.createdAt ? new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : '-';
      return `
        <div class="notif-item${n.read ? '' : ' unread'}" data-notif-id="${n.id}" data-notif-link="${AppConfig.escapeHtml(n.link || '')}">
          <div class="notif-icon notif-icon--${n.type || 'info'}"><i class="ph ${icon}"></i></div>
          <div class="notif-content">
            <div class="notif-title">${AppConfig.escapeHtml(n.title)}</div>
            <div class="notif-message">${AppConfig.escapeHtml(n.message)}</div>
            <div class="notif-time text-muted">${timeStr}</div>
          </div>
        </div>
      `;
    }).join('');
  },
  setupDropdownListeners(uid) {
    const dropdown = document.getElementById('notif-dropdown');
    const toggleBtns = [document.getElementById('btn-notif-toggle'), document.getElementById('btn-notif-toggle-mobile')].filter(Boolean);
    const readAllBtn = document.getElementById('btn-notif-read-all');
    toggleBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropdown) dropdown.classList.toggle('active');
      };
    });
    if (readAllBtn) {
      readAllBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.markAllAsRead(uid);
      };
    }
    document.addEventListener('click', (e) => {
      if (dropdown && dropdown.classList.contains('active')) {
        if (!dropdown.contains(e.target) && !toggleBtns.some((b) => b.contains(e.target))) {
          dropdown.classList.remove('active');
        }
      }
      const item = e.target.closest('.notif-item');
      if (item) {
        const id = item.dataset.notifId;
        const link = item.dataset.notifLink;
        this.markAsRead(uid, id);
        if (dropdown) dropdown.classList.remove('active');
        if (link) window.location.hash = link;
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown && dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
      }
    });
  }
};
