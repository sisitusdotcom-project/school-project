const NotificationService = {
  dbRef: null,
  activeListener: null,
  notifications: [],
  init(uid) {
    if (!uid || !isDBReady()) return;
    if (this.activeListener && this.dbRef) {
      this.dbRef.off('value', this.activeListener);
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
  async sendToRole({ role, unit, title, message, link = '', type = 'info' }) {
    if (!isDBReady()) return;
    const users = await DB.getAllUsers();
    const targets = [];
    Object.entries(users || {}).forEach(([uid, u]) => {
      if (!u) return;
      const assignments = AppConfig.getRoleAssignments(u);
      if (role && (u.role === role || assignments.includes(role))) {
        targets.push(uid);
      } else if (unit && assignments.includes(unit)) {
        targets.push(uid);
      }
    });
    await Promise.all(targets.map((uid) => this.send({ recipientUid: uid, title, message, link, type })));
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
        b.style.display = 'inline-flex';
      } else {
        b.style.display = 'none';
      }
    });
  },
  renderDropdown() {
    const listEl = document.getElementById('notif-list');
    if (!listEl) return;
    if (!this.notifications.length) {
      listEl.innerHTML = '<div class="notif-empty"><i class="ph ph-bell-slash"></i><p>Belum ada notifikasi.</p></div>';
      return;
    }
    listEl.innerHTML = this.notifications.map((n) => `
      <div class="notif-item${n.read ? '' : ' unread'}" data-notif-id="${n.id}" data-notif-link="${AppConfig.escapeHtml(n.link || '')}">
        <div class="notif-icon notif-icon--${n.type || 'info'}"><i class="ph ${n.type === 'success' ? 'ph-check-circle' : (n.type === 'danger' ? 'ph-warning-octagon' : 'ph-bell')}"></i></div>
        <div class="notif-content">
          <div class="notif-title">${AppConfig.escapeHtml(n.title)}</div>
          <div class="notif-message">${AppConfig.escapeHtml(n.message)}</div>
          <div class="notif-time text-muted">${n.createdAt ? new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : '-'}</div>
        </div>
      </div>
    `).join('');
  },
  setupDropdownListeners(uid) {
    const dropdown = document.getElementById('notif-dropdown');
    const toggleBtns = [document.getElementById('btn-notif-toggle'), document.getElementById('btn-notif-toggle-mobile')].filter(Boolean);
    const readAllBtn = document.getElementById('btn-notif-read-all');
    toggleBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (dropdown) {
          dropdown.classList.toggle('active');
        }
      };
    });
    if (readAllBtn) {
      readAllBtn.onclick = (e) => {
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
  }
};
