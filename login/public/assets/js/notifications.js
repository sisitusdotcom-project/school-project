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
  _recentSent: new Map(),
  async send({ recipientUid, title, message, link = '', type = 'info', action = '' }) {
    if (!recipientUid || !isDBReady()) return;
    const cleanTitle = (title || '').trim();
    const cleanMsg = (message || '').replace(/\s*\(\s*\)/g, '').replace(/\s*""/g, '').trim();
    const dedupeKey = `${recipientUid}:${cleanTitle}:${cleanMsg}:${link}`;
    const now = Date.now();
    const lastSent = this._recentSent.get(dedupeKey);
    if (lastSent && (now - lastSent) < 60000) {
      return;
    }
    this._recentSent.set(dedupeKey, now);
    if (this._recentSent.size > 200) {
      const cutoff = now - 120000;
      for (const [k, time] of this._recentSent.entries()) {
        if (time < cutoff) this._recentSent.delete(k);
      }
    }
    await db.ref(`notifications/${recipientUid}`).push({
      title: cleanTitle,
      message: cleanMsg,
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
      const docType = payload.docType || 'Modul Ajar';
      let subjectName = payload.subjectIdName || payload.subjectName || '';
      if (!subjectName && payload.subjectId) {
        try {
          const subjects = await DB.getSubjects();
          if (subjects && subjects[payload.subjectId]) {
            subjectName = subjects[payload.subjectId].name || '';
          }
        } catch (_) {}
      }
      const subjectPart = subjectName ? ` Mata Pelajaran ${subjectName}` : '';
      const semPart = payload.semester ? ` [${payload.semester}]` : '';
      const notePart = payload.note ? ` ("${payload.note.length > 35 ? payload.note.slice(0, 35) + '...' : payload.note}")` : '';
      const fullContext = `${docType}${subjectPart}${semPart}${notePart}`.trim();
      if (!isApprover) {
        if (payload.status === 'Draft') return;
        this.sendToRole({
          unit: ['WAKA_KURIKULUM', 'STAF_KURIKULUM'],
          title: isEditing ? 'Perangkat Ajar Diperbarui' : 'Perangkat Ajar Perlu Ditinjau',
          message: `${uploaderName} mengajukan ${fullContext} untuk diverifikasi.`,
          link: '#/curriculum/syllabus',
          type: 'info',
          action: 'Perlu Verifikasi',
          excludeUid: uid
        });
      } else if (payload.teacherId) {
        const isAcc = payload.status === 'Disetujui (ACC)';
        const feedbackStr = payload.reviewerFeedback ? ` Catatan verifikator: "${payload.reviewerFeedback}"` : '';
        this.send({
          recipientUid: payload.teacherId,
          title: isAcc ? 'Perangkat Ajar Disetujui (ACC)' : 'Perangkat Ajar Perlu Revisi',
          message: isAcc
            ? `Perangkat ${fullContext} Anda telah disetujui Kurikulum.${feedbackStr}`
            : `Perangkat ${fullContext} Anda memerlukan revisi dari Kurikulum.${feedbackStr}`,
          link: '#/curriculum/syllabus',
          type: isAcc ? 'success' : 'warning',
          action: isAcc ? 'Lihat Berkas' : 'Perbaiki Berkas'
        });
      }
    } else if (node === 'guru/portfolio' || node === 'tendik/portfolio' || node === 'personnel/portfolio') {
      const portTitle = payload.title ? `"${payload.title}"` : 'portofolio';
      const catPart = payload.category ? ` (${payload.category})` : '';
      if (!isApprover) {
        if (payload.status === 'Draft') return;
        this.sendToRole({
          unit: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
          title: isEditing ? 'Portofolio Diperbarui' : 'Portofolio Baru Perlu Verifikasi',
          message: `${uploaderName} mengajukan ${portTitle}${catPart} untuk diverifikasi.`,
          link: '#/personnel/portfolio',
          type: 'info',
          action: 'Verifikasi & ACC',
          excludeUid: uid
        });
      } else {
        const targetRecipient = payload.teacherId || payload.employeeId;
        const isAcc = payload.status === 'Disetujui (ACC)';
        if (targetRecipient) {
          const feedbackStr = payload.reviewerFeedback ? ` Catatan verifikator: "${payload.reviewerFeedback}"` : '';
          this.send({
            recipientUid: targetRecipient,
            title: isAcc ? 'Portofolio Disetujui (ACC)' : 'Portofolio Perlu Revisi',
            message: isAcc
              ? `Portofolio ${portTitle} Anda telah disetujui (ACC) oleh Personalia.${feedbackStr}`
              : `Portofolio ${portTitle} Anda memerlukan revisi.${feedbackStr}`,
            link: '#/guru/portfolio',
            type: isAcc ? 'success' : 'warning',
            action: isAcc ? 'Lihat Portofolio' : 'Perbaiki Berkas'
          });
        }
      }
    } else if (node === 'personnel/official_travel') {
      const dest = payload.location ? ` ke ${payload.location}` : '';
      const inst = payload.institution ? ` (${payload.institution})` : '';
      if (!isApprover) {
        if (payload.status === 'Draft') return;
        this.sendToRole({
          unit: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
          title: isEditing ? 'Tugas Dinas Diperbarui' : 'Tugas Dinas Baru Perlu Verifikasi',
          message: `${payload.gtkIdName || uploaderName} mengajukan dinas${dest}${inst}.`,
          link: '#/humas/official-travel',
          type: 'info',
          action: 'Verifikasi & Vakasi',
          excludeUid: uid
        });
      } else if (payload.gtkId) {
        const isAcc = payload.status === 'Disetujui';
        const vakasiStr = Number(payload.vakasi) > 0 ? ` Vakasi: ${moneyStr(payload.vakasi)}.` : '';
        this.send({
          recipientUid: payload.gtkId,
          title: `Perjalanan Dinas ${payload.status || 'Diverifikasi'}`,
          message: `Tugas dinas${dest} telah diverifikasi Humas. Status: ${payload.status}.${vakasiStr}`,
          link: '#/gtk/official-travel',
          type: isAcc ? 'success' : 'info',
          action: 'Lihat Riwayat'
        });
        if (isAcc && Number(payload.vakasi) > 0) {
          this.sendToRole({
            unit: ['WAKA_KEUANGAN', 'STAF_KEUANGAN'],
            title: 'Vakasi Tugas Dinas Siap Dicairkan',
            message: `Vakasi tugas dinas an. ${payload.gtkIdName || 'GTK'} sebesar ${moneyStr(payload.vakasi)} siap dicairkan.`,
            link: '#/finance/transactions',
            type: 'info',
            action: 'Pencairan Kas',
            excludeUid: uid
          });
        }
      }
    } else if (node === 'student_affairs/leaves') {
      const typeStr = payload.type || 'Izin';
      const dateStr = payload.startDate ? ` (${payload.startDate}${payload.endDate && payload.endDate !== payload.startDate ? ` s.d ${payload.endDate}` : ''})` : '';
      if (!isApprover) {
        DB.getAllStudents().then((allStudents) => {
          const stu = (allStudents || {})[payload.studentId];
          const sName = stu ? (stu.name || payload.studentId) : (payload.studentIdName || payload.studentId || 'Murid');
          const classId = stu?.classId || payload.classId;
          if (classId) {
            DB.getClasses().then((classes) => {
              const cls = (classes || {})[classId];
              const clsName = cls ? ` (${cls.name})` : '';
              if (cls && cls.teacherId) {
                this.send({
                  recipientUid: cls.teacherId,
                  title: 'Pengajuan Izin Siswa Baru',
                  message: `Wali murid an. ${sName}${clsName} mengajukan ${typeStr}${dateStr}.`,
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
            message: `Pengajuan ${typeStr} an. ${sName}${dateStr}.`,
            link: '#/student-affairs/leaves',
            type: 'info',
            action: 'Verifikasi Izin',
            excludeUid: uid
          });
        });
      } else if (payload.createdBy && payload.createdBy !== uid) {
        this.send({
          recipientUid: payload.createdBy,
          title: `Izin Siswa: ${payload.status || 'Diverifikasi'}`,
          message: `Pengajuan ${typeStr} anak Anda telah ${payload.status === 'Disetujui' ? 'disetujui' : payload.status}.`,
          link: '#/ortu/leaves',
          type: payload.status === 'Disetujui' ? 'success' : 'info',
          action: 'Lihat Status'
        });
      }
    } else if (node === 'personnel/complaints') {
      const complTitle = payload.title ? `"${payload.title}"` : (payload.complaint ? `"${payload.complaint.slice(0, 40)}..."` : 'aspirasi baru');
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
          title: 'Aspirasi / Pengaduan Baru',
          message: `Aspirasi baru dari ${payload.name || uploaderName}: ${complTitle}`,
          link: '#/personnel/complaints',
          type: 'warning',
          action: 'Tindak Lanjut',
          excludeUid: uid
        });
      } else if (payload.createdBy && payload.createdBy !== uid) {
        const solStr = payload.followUp ? ` Solusi: "${payload.followUp}"` : '';
        this.send({
          recipientUid: payload.createdBy,
          title: `Aspirasi Ditindaklanjuti: ${payload.status}`,
          message: `Tindak lanjut atas ${complTitle}: ${payload.status}.${solStr}`,
          link: '#/personnel/complaints',
          type: 'info',
          action: 'Lihat Solusi'
        });
      }
    } else if (node === 'personnel/welfare') {
      const typeStr = payload.type ? ` ${payload.type}` : '';
      const amountStr = Number(payload.amount) > 0 ? ` (${moneyStr(payload.amount)})` : '';
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA'],
          title: 'Pengajuan Santunan Sosial GTK',
          message: `Pengajuan santunan${typeStr} untuk ${payload.recipientName || 'GTK'}${amountStr}.`,
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
            message: `Santunan${typeStr}${amountStr} telah ${payload.status}.`,
            link: '#/personnel/welfare',
            type: payload.status.includes('Disetujui') ? 'success' : 'info'
          });
        }
        if (payload.status === 'Disetujui' || payload.status === 'Dicairkan') {
          this.sendToRole({
            unit: ['WAKA_KEUANGAN', 'STAF_KEUANGAN'],
            title: 'Pencairan Santunan GTK',
            message: `Santunan an. ${payload.recipientName || 'GTK'} sebesar ${moneyStr(payload.amount || 0)} disetujui untuk pencairan kas.`,
            link: '#/finance/transactions',
            type: 'info',
            action: 'Pencairan Kas',
            excludeUid: uid
          });
        }
      }
    } else if (node === 'finance/proposals') {
      const unitStr = payload.unit ? `Unit ${payload.unit} ` : '';
      const propTitle = payload.title ? `"${payload.title}"` : 'proposal anggaran';
      const budgetStr = Number(payload.budget) > 0 ? ` (${moneyStr(payload.budget)})` : '';
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_KEUANGAN', 'STAF_KEUANGAN'],
          role: 'kepsek',
          title: 'Proposal Anggaran Perlu Evaluasi',
          message: `${unitStr}mengajukan ${propTitle}${budgetStr}.`,
          link: '#/finance/proposals',
          type: 'info',
          action: 'Evaluasi Proposal',
          excludeUid: uid
        });
      } else if (payload.createdBy && payload.createdBy !== uid) {
        const approvedStr = Number(payload.approvedBudget || payload.budget) > 0 ? ` Disetujui: ${moneyStr(payload.approvedBudget || payload.budget)}.` : '';
        this.send({
          recipientUid: payload.createdBy,
          title: `Proposal Anggaran: ${payload.status}`,
          message: `Proposal ${propTitle} telah ${payload.status}.${approvedStr}`,
          link: '#/finance/proposals',
          type: payload.status.includes('Disetujui') ? 'success' : 'warning',
          action: 'Lihat Evaluasi'
        });
      }
    } else if (node === 'facilities/maintenance') {
      const facName = payload.facilityName || payload.title || 'fasilitas sekolah';
      const locStr = payload.location ? ` di ${payload.location}` : '';
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_SARPRAS', 'STAF_SARPRAS'],
          title: 'Laporan Kerusakan Fasilitas Masuk',
          message: `Laporan kerusakan ${facName}${locStr} memerlukan perbaikan.`,
          link: '#/facilities/maintenance',
          type: 'warning',
          action: 'Perlu Perbaikan',
          excludeUid: uid
        });
      } else if (payload.createdBy && payload.createdBy !== uid) {
        this.send({
          recipientUid: payload.createdBy,
          title: `Pemeliharaan Fasilitas: ${payload.status}`,
          message: `Status perbaikan ${facName}: ${payload.status}.`,
          link: '#/facilities/maintenance',
          type: payload.status === 'Selesai' ? 'success' : 'info'
        });
      }
    } else if (node === 'student_affairs/violations') {
      const stuName = payload.studentIdName || payload.studentName || 'Murid';
      const vioName = payload.violation || 'pelanggaran tata tertib';
      const pointStr = Number(payload.points) > 0 ? ` (${payload.points} poin)` : '';
      this.sendToRole({
        unit: ['WAKA_KESISWAAN', 'STAF_KESISWAAN'],
        title: 'Catatan Kedisiplinan Siswa',
        message: `Siswa an. ${stuName} tercatat ${vioName}${pointStr}.`,
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
                message: `Murid kelas Anda an. ${stu.name || stuName} tercatat ${vioName}${pointStr}.`,
                link: '#/student-affairs/rules',
                type: 'warning',
                action: 'Pembinaan Kelas'
              });
            }
          });
        }
      });
    } else if (node === 'student_affairs/achievements') {
      const stuName = payload.studentIdName || payload.studentName || 'Murid';
      const achTitle = payload.title ? `"${payload.title}"` : 'kejuaraan';
      const rankStr = payload.rank ? ` (${payload.rank})` : '';
      this.sendToRole({
        unit: ['WAKA_KESISWAAN', 'STAF_KESISWAAN'],
        role: 'kepsek',
        title: 'Prestasi Siswa Baru!',
        message: `Siswa an. ${stuName} meraih prestasi ${achTitle}${rankStr}.`,
        link: '#/student-affairs/achievements',
        type: 'success',
        action: 'Lihat Prestasi',
        excludeUid: uid
      });
    } else if (node === 'student_affairs/scholarships') {
      const stuName = payload.studentIdName || payload.studentName || 'Murid';
      const srcStr = payload.source ? ` (${payload.source})` : '';
      if (!isApprover) {
        this.sendToRole({
          unit: ['WAKA_KESISWAAN', 'STAF_KESISWAAN'],
          title: 'Pengajuan Beasiswa Siswa',
          message: `Pengajuan beasiswa an. ${stuName}${srcStr}.`,
          link: '#/student-affairs/scholarships',
          type: 'info',
          action: 'Perlu Seleksi',
          excludeUid: uid
        });
      } else if (payload.status === 'Disetujui') {
        this.sendToRole({
          unit: ['WAKA_KEUANGAN', 'STAF_KEUANGAN'],
          title: 'Beasiswa Siswa Siap Direalisasikan',
          message: `Beasiswa an. ${stuName} disetujui kesiswaan, siap diproses bendahara.`,
          link: '#/finance/scholarships',
          type: 'info',
          action: 'Realisasi Beasiswa',
          excludeUid: uid
        });
      }
    } else if (node === 'spmb_registrations') {
      const regName = payload.studentName || payload.name || 'Calon Murid';
      this.sendToRole({
        unit: ['WAKA_KESISWAAN', 'STAF_KESISWAAN'],
        title: 'Pendaftar Baru SPMB Masuk',
        message: `Calon siswa baru an. ${regName} telah mendaftar.`,
        link: '#/student-affairs/ppdb',
        type: 'info',
        action: 'Verifikasi Berkas',
        excludeUid: uid
      });
    } else if (node === 'komite/activities' || node === 'komite/finance-paguyuban') {
      const repTitle = payload.title ? `"${payload.title}"` : 'kegiatan';
      this.sendToRole({
        unit: ['WAKA_HUMAS_PERSONALIA', 'STAF_HUMAS_PERSONALIA', 'WAKA_KEUANGAN'],
        role: 'kepsek',
        title: 'Laporan Paguyuban Komite Baru',
        message: `Laporan ${noun || 'Komite'}: ${repTitle} telah diterbitkan.`,
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
      tasks.push(db.ref('guru/portfolio').orderByChild('status').equalTo('Diajukan').once('value').then((s) => {
        setBadge('#/personnel/portfolio', s.numChildren());
        setBadge('#/guru/portfolio', s.numChildren());
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
    if (window.Auth && Auth.userData && [AppConfig.ROLES.GURU, AppConfig.ROLES.GURU_UMMI, AppConfig.ROLES.GURU_EKSKUL, AppConfig.ROLES.TENDIK].includes(Auth.userData.role)) {
      tasks.push(Promise.all([
        DB.getTeacherAttendanceHistory(uid, 60).catch(() => []),
        DB.getSettings().catch(() => ({}))
      ]).then(([hist, settings]) => {
        const gradeResult = AppConfig.calculateAttendanceGrade(DB.toArray(hist), { attendanceRules: settings?.attendanceRules });
        if (gradeResult.isPoorGrade) {
          const warnNotifId = `poor_grade_${(gradeResult.academicYear || 'current').replace('/', '_')}`;
          if (!this.notifications.some((n) => n.id === warnNotifId)) {
            this.notifications.unshift({
              id: warnNotifId,
              title: gradeResult.warningTitle || 'Peringatan Evaluasi Kehadiran',
              message: gradeResult.warningText || 'Grade kehadiran semester ini berada di bawah batas standar.',
              link: '#/attendance',
              type: 'danger',
              action: 'Cek Evaluasi',
              read: false,
              createdAt: Date.now()
            });
            this.renderBadge();
            this.renderDropdown();
          }
        }
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
        headerCount.textContent = `${unreadCount} Baru`;
        headerCount.title = actionCount > 0 ? `${unreadCount} belum dibaca (${actionCount} perlu tindakan)` : `${unreadCount} belum dibaca`;
        headerCount.classList.add('active');
      } else {
        headerCount.textContent = '0';
        headerCount.title = '';
        headerCount.classList.remove('active');
      }
    }
    const readAllBtn = document.getElementById('btn-notif-read-all');
    if (readAllBtn) {
      readAllBtn.disabled = unreadCount === 0;
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
      const unreadDot = !n.read ? '<span class="notif-unread-dot"></span>' : '';
      return `
        <div class="notif-item${n.read ? '' : ' unread'}" data-notif-id="${n.id}" data-notif-link="${AppConfig.escapeHtml(n.link || '')}">
          <div class="notif-icon notif-icon--${n.type || 'info'}"><i class="ph ${icon}"></i></div>
          <div class="notif-content">
            <div class="notif-title">
              <span>${AppConfig.escapeHtml(n.title)}</span>
              ${unreadDot}
            </div>
            <div class="notif-message">${AppConfig.escapeHtml((n.message || '').replace(/\s*\(\s*\)/g, '').replace(/\s*""/g, '').trim())}</div>
            <div class="notif-meta">
              ${actionBadge}
              <span class="notif-time"><i class="ph ph-clock"></i> ${timeStr}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  setupDropdownListeners(uid) {
    const dropdown = document.getElementById('notif-dropdown');
    const backdrop = document.getElementById('notif-backdrop');
    const toggleBtns = [document.getElementById('btn-notif-toggle'), document.getElementById('btn-notif-toggle-mobile')].filter(Boolean);
    const readAllBtn = document.getElementById('btn-notif-read-all');
    const closeBtn = document.getElementById('btn-notif-close');
    const closeNotif = () => {
      if (dropdown) dropdown.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
    };
    const openNotif = () => {
      const sidebar = document.getElementById('sidebar');
      const sideBackdrop = document.getElementById('sidebar-backdrop');
      if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (sideBackdrop) sideBackdrop.classList.remove('active');
      }
      if (dropdown) {
        const willOpen = !dropdown.classList.contains('active');
        dropdown.classList.toggle('active', willOpen);
        if (backdrop) backdrop.classList.toggle('active', willOpen);
        if (willOpen) this.updateActionBadges();
      }
    };
    toggleBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openNotif();
      };
    });
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeNotif();
      };
    }
    if (backdrop) {
      backdrop.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeNotif();
      };
    }
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
          closeNotif();
        }
      }
      const item = e.target.closest('.notif-item');
      if (item) {
        const id = item.dataset.notifId;
        const link = item.dataset.notifLink;
        this.markAsRead(uid, id);
        closeNotif();
        if (link) window.location.hash = link;
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown && dropdown.classList.contains('active')) {
        closeNotif();
      }
    });
  }
};
