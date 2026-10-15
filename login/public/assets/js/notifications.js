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
    this.activeListener = this.dbRef.limitToLast(40).on('value', (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, item]) => ({ id, ...item }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      this.notifications = list;
      this.renderBadge();
      this.renderDropdown();
    });
    this.setupDropdownListeners(uid);
    this.updateActionBadges();
  },
  formatMoney(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  },
  async send({ recipientUid, title, message, link = '', type = 'info', action = '' }) {
    if (!recipientUid || !isDBReady()) return;
    await db.ref(`notifications/${recipientUid}`).push({
      title,
      message,
      link,
      type,
      action,
      read: false,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async sendToRole({ role, unit, title, message, link = '', type = 'info', action = '', excludeUid = null }) {
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
    await Promise.all(Array.from(targets).map((uid) => this.send({ recipientUid: uid, title, message, link, type, action })));
  },
  async markAsRead(uid, notifId) {
    if (!uid || !notifId || !isDBReady()) return;
    await db.ref(`notifications/${uid}/${notifId}`).update({ read: true });
    this.updateActionBadges();
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
    this.updateActionBadges();
  },
  async notifyModuleChange({ node, noun = '', payload = {}, isEditing = false, uid = '', uploaderName = '', isApprover = false }) {
    if (!node || !isDBReady()) return;
    const moneyStr = this.formatMoney;
    if (node === 'curriculum/documents') {
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_KURIKULUM', 'STAF_KURIKULUM'],
          title: 'Modul Ajar Perlu Ditinjau',
          message: `${uploaderName} mengajukan ${payload.docType || 'Modul Ajar'} (${payload.title || ''}) untuk diverifikasi.`,
          link: '#/curriculum/syllabus',
          type: 'info',
          action: 'Perlu Verifikasi',
          excludeUid: uid
        });
      } else if (payload.teacherId) {
        const isAcc = payload.status === 'Disetujui (ACC)';
        this.send({
          recipientUid: payload.teacherId,
          title: isAcc ? 'Perangkat Ajar Disetujui (ACC)' : 'Perangkat Ajar Perlu Revisi',
          message: isAcc
            ? `Perangkat ${payload.docType || 'Modul Ajar'} (${payload.title || ''}) Anda telah disetujui Kurikulum.`
            : `Perangkat ${payload.docType || 'Modul Ajar'} (${payload.title || ''}) memerlukan revisi dari Kurikulum.`,
          link: '#/curriculum/syllabus',
          type: isAcc ? 'success' : 'warning',
          action: isAcc ? 'Lihat Berkas' : 'Perbaiki Berkas'
        });
      }
    } else if (node === 'personnel/official_travel') {
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
          title: 'Tugas Dinas Baru Perlu Verifikasi',
          message: `${payload.gtkIdName || uploaderName} mengajukan dinas ke ${payload.location || ''} (${payload.institution || ''}).`,
          link: '#/humas/official-travel',
          type: 'info',
          action: 'Verifikasi & Vakasi',
          excludeUid: uid
        });
      } else if (payload.gtkId) {
        const isAcc = payload.status === 'Disetujui';
        this.send({
          recipientUid: payload.gtkId,
          title: `Perjalanan Dinas ${payload.status || 'Diverifikasi'}`,
          message: `Tugas dinas ke ${payload.location || ''} telah diverifikasi Humas. Status: ${payload.status}. Vakasi: ${moneyStr(payload.vakasi || 0)}.`,
          link: '#/gtk/official-travel',
          type: isAcc ? 'success' : 'info',
          action: 'Lihat Riwayat'
        });
        if (isAcc && Number(payload.vakasi) > 0) {
          this.sendToRole({
            unit: ['WAKA_KEUANGAN', 'STAF_KEUANGAN'],
            title: 'Vakasi Tugas Dinas Siap Dicairkan',
            message: `Vakasi tugas dinas an. ${payload.gtkIdName || 'GTK'} sebesar ${moneyStr(payload.vakasi)} siap dicairkan.`,
            link: '#/finance/ledger',
            type: 'info',
            action: 'Pencairan Kas',
            excludeUid: uid
          });
        }
      }
    } else if (node === 'student_affairs/leaves') {
      if (!isApprover) {
        DB.getAllStudents().then((allStudents) => {
          const stu = (allStudents || {})[payload.studentId];
          const sName = stu ? (stu.name || payload.studentId) : payload.studentId;
          const classId = stu?.classId;
          if (classId) {
            DB.getClasses().then((classes) => {
              const cls = (classes || {})[classId];
              if (cls && cls.teacherId) {
                this.send({
                  recipientUid: cls.teacherId,
                  title: 'Pengajuan Izin Siswa Baru',
                  message: `Wali murid an. ${sName} (${cls.name}) mengajukan ${payload.type || 'izin'} (${payload.startDate}).`,
                  link: `#/guru/student-attendance/${classId}`,
                  type: 'info',
                  action: 'Tindak Lanjut Absensi',
                  excludeUid: uid
                });
              }
            });
          }
          this.sendToRole({
            unit: ['WAKA_KESISWAAN', 'STAF_KESISWAAN'],
            title: 'Pengajuan Izin Siswa Masuk',
            message: `Pengajuan ${payload.type || 'izin'} an. ${sName} (${payload.startDate}).`,
            link: '#/student-affairs/leaves',
            type: 'info',
            action: 'Verifikasi Izin',
            excludeUid: uid
          });
        });
      } else if (payload.createdBy && payload.createdBy !== uid) {
        this.send({
          recipientUid: payload.createdBy,
          title: `Izin Siswa ${payload.status || 'Diverifikasi'}`,
          message: `Pengajuan ${payload.type || 'izin'} anak Anda telah ${payload.status === 'Disetujui' ? 'disetujui' : payload.status}.`,
          link: '#/ortu/leaves',
          type: payload.status === 'Disetujui' ? 'success' : 'info',
          action: 'Lihat Status'
        });
      }
    } else if (node === 'personnel/complaints') {
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
          title: 'Aspirasi / Pengaduan Baru',
          message: `Aspirasi baru dari ${payload.name || uploaderName}: "${(payload.title || payload.complaint || '').slice(0, 50)}..."`,
          link: '#/personnel/complaints',
          type: 'warning',
          action: 'Tindak Lanjut',
          excludeUid: uid
        });
      } else if (payload.createdBy && payload.createdBy !== uid) {
        this.send({
          recipientUid: payload.createdBy,
          title: `Aspirasi Ditindaklanjuti: ${payload.status}`,
          message: `Tindak lanjut atas aspirasi "${payload.title || ''}": ${payload.followUp || payload.status}.`,
          link: '#/personnel/complaints',
          type: 'info',
          action: 'Lihat Solusi'
        });
      }
    } else if (node === 'personnel/welfare') {
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
          title: 'Pengajuan Santunan Sosial GTK',
          message: `Pengajuan santunan ${payload.type || ''} untuk ${payload.recipientName || 'GTK'} (${moneyStr(payload.amount || 0)}).`,
          link: '#/personnel/welfare',
          type: 'info',
          action: 'Perlu Verifikasi',
          excludeUid: uid
        });
      } else {
        if (payload.recipientId) {
          this.send({
            recipientUid: payload.recipientId,
            title: `Santunan Sosial GTK: ${payload.status}`,
            message: `Santunan ${payload.type || ''} sebesar ${moneyStr(payload.amount || 0)} telah ${payload.status}.`,
            link: '#/personnel/welfare',
            type: payload.status.includes('Disetujui') ? 'success' : 'info'
          });
        }
        if (payload.status === 'Disetujui' || payload.status === 'Dicairkan') {
          this.sendToRole({
            unit: ['WAKA_KEUANGAN', 'STAF_KEUANGAN'],
            title: 'Pencairan Santunan GTK',
            message: `Santunan an. ${payload.recipientName || 'GTK'} sebesar ${moneyStr(payload.amount || 0)} disetujui untuk pencairan kas.`,
            link: '#/finance/ledger',
            type: 'info',
            action: 'Pencairan Kas',
            excludeUid: uid
          });
        }
      }
    } else if (node === 'finance/proposals') {
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_KEUANGAN', 'STAF_KEUANGAN'],
          role: 'kepsek',
          title: 'Proposal Anggaran Perlu Evaluasi',
          message: `Unit ${payload.unit || ''} mengajukan proposal "${payload.title || ''}" (${moneyStr(payload.budget || 0)}).`,
          link: '#/finance/proposals',
          type: 'info',
          action: 'Evaluasi Proposal',
          excludeUid: uid
        });
      } else if (payload.createdBy && payload.createdBy !== uid) {
        this.send({
          recipientUid: payload.createdBy,
          title: `Proposal Anggaran: ${payload.status}`,
          message: `Proposal "${payload.title}" telah ${payload.status}. Disetujui: ${moneyStr(payload.approvedBudget || payload.budget || 0)}.`,
          link: '#/finance/proposals',
          type: payload.status.includes('Disetujui') ? 'success' : 'warning',
          action: 'Lihat Evaluasi'
        });
      }
    } else if (node === 'facilities/maintenance') {
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_SARPRAS', 'STAF_SARPRAS'],
          title: 'Laporan Kerusakan Fasilitas Masuk',
          message: `Laporan kerusakan ${payload.facilityName || payload.title || 'fasilitas'} (${payload.location || ''}) memerlukan perbaikan.`,
          link: '#/facilities/maintenance',
          type: 'warning',
          action: 'Perlu Perbaikan',
          excludeUid: uid
        });
      } else if (payload.createdBy && payload.createdBy !== uid) {
        this.send({
          recipientUid: payload.createdBy,
          title: `Pemeliharaan Fasilitas: ${payload.status}`,
          message: `Status perbaikan ${payload.facilityName || payload.title || 'fasilitas'}: ${payload.status}.`,
          link: '#/facilities/maintenance',
          type: payload.status === 'Selesai' ? 'success' : 'info'
        });
      }
    } else if (node === 'student_affairs/violations') {
      this.sendToRole({
        unit: ['WAKA_KESISWAAN', 'STAF_KESISWAAN'],
        title: 'Catatan Kedisiplinan Siswa',
        message: `Siswa an. ${payload.studentIdName || 'Murid'} tercatat ${payload.violation || 'pelanggaran'} (${payload.points || 0} poin).`,
        link: '#/student-affairs/rules',
        type: 'warning',
        action: 'Pembinaan Siswa',
        excludeUid: uid
      });
      DB.getAllStudents().then((allStudents) => {
        const stu = (allStudents || {})[payload.studentId];
        if (stu && stu.classId) {
          DB.getClasses().then((classes) => {
            const cls = (classes || {})[stu.classId];
            if (cls && cls.teacherId && cls.teacherId !== uid) {
              this.send({
                recipientUid: cls.teacherId,
                title: 'Pelanggaran Siswa Binaan',
                message: `Murid kelas Anda an. ${stu.name} tercatat ${payload.violation || 'pelanggaran'}.`,
                link: '#/student-affairs/rules',
                type: 'warning',
                action: 'Pembinaan Kelas'
              });
            }
          });
        }
      });
    } else if (node === 'student_affairs/achievements') {
      this.sendToRole({
        unit: ['WAKA_KESISWAAN', 'STAF_KESISWAAN'],
        role: 'kepsek',
        title: 'Prestasi Siswa Baru!',
        message: `Siswa an. ${payload.studentIdName || 'Murid'} meraih prestasi ${payload.title || ''} (${payload.rank || ''}).`,
        link: '#/student-affairs/achievements',
        type: 'success',
        action: 'Lihat Prestasi',
        excludeUid: uid
      });
    } else if (node === 'student_affairs/scholarships') {
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_KESISWAAN', 'STAF_KESISWAAN'],
          title: 'Pengajuan Beasiswa Siswa',
          message: `Pengajuan beasiswa an. ${payload.studentIdName || 'Murid'} (${payload.source || ''}).`,
          link: '#/student-affairs/scholarships',
          type: 'info',
          action: 'Perlu Seleksi',
          excludeUid: uid
        });
      } else if (payload.status === 'Disetujui') {
        this.sendToRole({
          unit: ['WAKA_KEUANGAN', 'STAF_KEUANGAN'],
          title: 'Beasiswa Siswa Siap Direalisasikan',
          message: `Beasiswa an. ${payload.studentIdName || 'Murid'} disetujui kesiswaan, siap diproses bendahara.`,
          link: '#/finance/scholarships',
          type: 'info',
          action: 'Realisasi Beasiswa',
          excludeUid: uid
        });
      }
    } else if (node === 'spmb_registrations') {
      this.sendToRole({
        unit: ['WAKA_KESISWAAN', 'STAF_KESISWAAN'],
        title: 'Pendaftar Baru SPMB Masuk',
        message: `Calon siswa baru an. ${payload.studentName || payload.name || 'Calon Murid'} telah mendaftar.`,
        link: '#/student-affairs/ppdb',
        type: 'info',
        action: 'Verifikasi Berkas',
        excludeUid: uid
      });
    } else if (node === 'komite/activities' || node === 'komite/finance-paguyuban') {
      this.sendToRole({
        unit: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA', 'WAKA_KEUANGAN'],
        role: 'kepsek',
        title: 'Laporan Paguyuban Komite Baru',
        message: `Laporan ${noun || 'Komite'}: "${payload.title || ''}" telah diterbitkan.`,
        link: '#/komite/activities',
        type: 'info',
        action: 'Tinjau Laporan',
        excludeUid: uid
      });
    }
  },
  async notifyUmmiExamRequested({ studentName, currentLevel, targetLevel, requestedByName, requestedBy }) {
    await this.sendToRole({
      unit: ['KOORD_UMMI'],
      title: 'Pengajuan Ujian Kenaikan Jilid',
      message: `${requestedByName || 'Guru Ummi'} mengajukan santri an. ${studentName} (${currentLevel} -> ${targetLevel}) untuk diuji.`,
      link: '#/guru/ummi/koord/exams',
      type: 'info',
      action: 'Jadwalkan Ujian',
      excludeUid: requestedBy
    });
    this.updateActionBadges();
  },
  async notifyUmmiExamScheduled({ studentName, targetLevel, scheduledDate, examinerName, examinerId, requestedBy }) {
    if (requestedBy) {
      await this.send({
        recipientUid: requestedBy,
        title: 'Ujian Kenaikan Jilid Dijadwalkan',
        message: `Ujian santri an. ${studentName} (${targetLevel}) dijadwalkan pada ${scheduledDate} (Penguji: ${examinerName}).`,
        link: '#/guru/ummi/progress',
        type: 'info',
        action: 'Lihat Jadwal'
      });
    }
    if (examinerId && examinerId !== (window.Auth && Auth.currentUser ? Auth.currentUser.uid : null)) {
      await this.send({
        recipientUid: examinerId,
        title: 'Tugas Penguji Ujian Kenaikan Jilid',
        message: `Anda ditugaskan menguji santri an. ${studentName} (${targetLevel}) pada ${scheduledDate}.`,
        link: '#/guru/ummi/koord/exams',
        type: 'info',
        action: 'Input Hasil'
      });
    }
    this.updateActionBadges();
  },
  async notifyUmmiExamResult({ studentName, targetLevel, decision, score, requestedBy, studentId }) {
    const isPass = decision === 'Lolos';
    if (requestedBy) {
      await this.send({
        recipientUid: requestedBy,
        title: `Hasil Ujian Kenaikan Jilid: ${decision}`,
        message: `Santri an. ${studentName} dinyatakan ${decision} ke ${targetLevel} (Nilai: ${score}).`,
        link: '#/guru/ummi/progress',
        type: isPass ? 'success' : 'warning',
        action: isPass ? 'Cek Capaian' : 'Bina Santri'
      });
    }
    if (studentId) {
      DB.getAllStudents().then((allStudents) => {
        const stu = (allStudents || {})[studentId];
        if (stu && stu.classId) {
          DB.getClasses().then((classes) => {
            const cls = (classes || {})[stu.classId];
            if (cls && cls.teacherId && cls.teacherId !== requestedBy) {
              this.send({
                recipientUid: cls.teacherId,
                title: 'Perkembangan Jilid Ummi Siswa Binaan',
                message: `Murid kelas Anda an. ${studentName} telah ${decision} ke ${targetLevel} dalam pembelajaran Ummi.`,
                link: '#/guru/classes',
                type: 'info'
              });
            }
          });
        }
      });
    }
    this.updateActionBadges();
  },
  async notifyUmmiMappingUpdated({ className, room, teacherId }) {
    if (teacherId && teacherId !== (window.Auth && Auth.currentUser ? Auth.currentUser.uid : null)) {
      await this.send({
        recipientUid: teacherId,
        title: 'Penugasan Rombel Ummi',
        message: `Anda ditugaskan mengampu rombel Ummi ${className} di ${room || 'tempat yang ditentukan'}.`,
        link: '#/guru/ummi/classes',
        type: 'info',
        action: 'Buka Rombel'
      });
    }
    this.updateActionBadges();
  },
  async updateActionBadges() {
    if (!isDBReady() || !window.Auth || !Auth.currentUser) return;
    const assignments = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
    const uid = Auth.currentUser.uid;
    const isKur = assignments.includes('WAKA_KURIKULUM') || assignments.includes('STAF_KURIKULUM');
    const isHum = assignments.includes('WAKA_HUMAS_PERSONALIA') || assignments.includes('STAF_HUMAS_PERSONALIA');
    const isKes = assignments.includes('WAKA_KESISWAAN') || assignments.includes('STAF_KESISWAAN');
    const isKeu = assignments.includes('WAKA_KEUANGAN') || assignments.includes('STAF_KEUANGAN');
    const isSar = assignments.includes('WAKA_SARPRAS') || assignments.includes('STAF_SARPRAS');
    const isWali = assignments.some((a) => a.startsWith('GURU_KELAS_'));
    const isKoordUmmi = assignments.includes('KOORD_UMMI');
    const isGuruUmmi = AppConfig.isUserUmmi(Auth.userData || Auth.currentUser);
    const setBadge = (route, count) => {
      const el = document.querySelector(`.nav-counter-badge[data-route="${route}"]`);
      if (el) {
        if (count > 0) {
          el.textContent = count > 99 ? '99+' : count;
          el.classList.add('active');
        } else {
          el.textContent = '';
          el.classList.remove('active');
        }
      }
    };
    const tasks = [];
    if (isKur) {
      tasks.push(db.ref('curriculum/documents').orderByChild('status').equalTo('Diajukan').once('value').then((s) => {
        setBadge('#/curriculum/syllabus', s.numChildren());
      }));
    }
    if (isHum) {
      tasks.push(db.ref('personnel/official_travel').orderByChild('status').equalTo('Diajukan').once('value').then((s) => {
        setBadge('#/humas/official-travel', s.numChildren());
      }));
      tasks.push(db.ref('personnel/complaints').orderByChild('status').equalTo('Baru').once('value').then((s) => {
        setBadge('#/personnel/complaints', s.numChildren());
      }));
      tasks.push(db.ref('personnel/welfare').orderByChild('status').equalTo('Diajukan').once('value').then((s) => {
        setBadge('#/personnel/welfare', s.numChildren());
      }));
    }
    if (isKes) {
      tasks.push(db.ref('student_affairs/leaves').orderByChild('status').equalTo('Diajukan').once('value').then((s) => {
        setBadge('#/student-affairs/leaves', s.numChildren());
      }));
      tasks.push(db.ref('student_affairs/scholarships').orderByChild('status').equalTo('Diajukan').once('value').then((s) => {
        setBadge('#/student-affairs/scholarships', s.numChildren());
      }));
      tasks.push(db.ref('spmb_registrations').orderByChild('status').equalTo('Diajukan').once('value').then((s) => {
        setBadge('#/student-affairs/ppdb', s.numChildren());
      }));
    }
    if (isKeu) {
      tasks.push(db.ref('finance/proposals').orderByChild('status').equalTo('Diajukan').once('value').then((s) => {
        setBadge('#/finance/proposals', s.numChildren());
      }));
      tasks.push(db.ref('personnel/official_travel').orderByChild('status').equalTo('Disetujui').once('value').then((s) => {
        const data = s.val() || {};
        const count = Object.values(data).filter((t) => Number(t.vakasi) > 0 && t.disbursementStatus !== 'Dicairkan').length;
        setBadge('#/finance/transactions', count);
      }));
    }
    if (isSar) {
      tasks.push(db.ref('facilities/maintenance').orderByChild('status').equalTo('Diajukan').once('value').then((s) => {
        setBadge('#/facilities/maintenance', s.numChildren());
      }));
    }
    if (isKoordUmmi) {
      tasks.push(db.ref('ummi_exams').orderByChild('status').equalTo('Menunggu ACC').once('value').then((s) => {
        setBadge('#/guru/ummi/koord/exams', s.numChildren());
      }));
    }
    if (isGuruUmmi) {
      tasks.push(db.ref('ummi_exams').orderByChild('examinerId').equalTo(uid).once('value').then((s) => {
        const data = s.val() || {};
        const count = Object.values(data).filter((e) => e.status === 'Dijadwalkan').length;
        if (count > 0) setBadge('#/guru/ummi/koord/exams', count);
      }));
    }
    if (isWali && !isKes) {
      tasks.push(Promise.all([DB.getClasses(), db.ref('student_affairs/leaves').orderByChild('status').equalTo('Diajukan').once('value')]).then(([classes, s]) => {
        const myClasses = Object.values(classes || {}).filter((c) => c.teacherId === uid).map((c) => c.id);
        const leaves = s.val() || {};
        DB.getAllStudents().then((students) => {
          const count = Object.values(leaves).filter((l) => {
            const st = (students || {})[l.studentId];
            return st && myClasses.includes(st.classId);
          }).length;
          setBadge('#/guru/student-attendance', count);
          setBadge('#/student-affairs/leaves', count);
        });
      }));
    }
    await Promise.allSettled(tasks);
  },
  renderBadge() {
    const unreadCount = this.notifications.filter((n) => !n.read).length;
    const actionCount = this.notifications.filter((n) => !n.read && n.action).length;
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
        const actionText = actionCount > 0 ? ` (${actionCount} Perlu Aksi)` : '';
        headerCount.textContent = `${unreadCount} Baru${actionText}`;
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
      const actionBadge = n.action
        ? `<span class="notif-action-tag"><i class="ph ph-arrow-up-right"></i> ${AppConfig.escapeHtml(n.action)}</span>`
        : '';
      return `
        <div class="notif-item${n.read ? '' : ' unread'}" data-notif-id="${n.id}" data-notif-link="${AppConfig.escapeHtml(n.link || '')}">
          <div class="notif-icon notif-icon--${n.type || 'info'}"><i class="ph ${icon}"></i></div>
          <div class="notif-content">
            <div class="notif-title">${AppConfig.escapeHtml(n.title)}</div>
            <div class="notif-message">${AppConfig.escapeHtml(n.message)}</div>
            ${actionBadge}
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
        this.updateActionBadges();
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
