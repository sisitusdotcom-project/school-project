const ScheduleManager = {
  currentTab: 'rombel',
  selectedClassId: null,
  selectedTeacherId: null,
  selectedYear: null,
  selectedSem: null,
  classes: {},
  subjects: {},
  users: {},
  schedules: {},
  settings: {},
  cachedConflicts: {},
  periodsSeninKamis: [
    { period: 1, time: '07.00 - 07.30', type: 'pembiasaan', label: 'Pembiasaan / Upacara' },
    { period: 2, time: '07.30 - 08.15', type: 'kbm', label: 'Jam Ke-1' },
    { period: 3, time: '08.15 - 09.00', type: 'kbm', label: 'Jam Ke-2' },
    { period: 4, time: '09.00 - 09.30', type: 'break', label: 'Istirahat Pagi' },
    { period: 5, time: '09.30 - 10.15', type: 'kbm', label: 'Jam Ke-3' },
    { period: 6, time: '10.15 - 11.00', type: 'kbm', label: 'Jam Ke-4' },
    { period: 7, time: '11.00 - 11.45', type: 'kbm', label: 'Jam Ke-5' },
    { period: 8, time: '11.45 - 12.30', type: 'kbm', label: 'Jam Ke-6' },
    { period: 9, time: '12.30 - 13.30', type: 'ishoma', label: 'ISHOMA (Sholat & Makan)' },
    { period: 10, time: '13.30 - 14.15', type: 'kbm', label: 'Jam Ke-7' },
    { period: 11, time: '14.15 - 15.00', type: 'kbm', label: 'Jam Ke-8' }
  ],
  periodsJumat: [
    { period: 1, time: '07.00 - 07.45', type: 'kbm', label: 'Jam Ke-1' },
    { period: 2, time: '07.45 - 08.30', type: 'kbm', label: 'Jam Ke-2' },
    { period: 3, time: '08.30 - 09.15', type: 'kbm', label: 'Jam Ke-3' },
    { period: 4, time: '09.15 - 09.45', type: 'break', label: 'Istirahat Pagi' },
    { period: 5, time: '09.45 - 10.30', type: 'kbm', label: 'Jam Ke-4' },
    { period: 6, time: '10.30 - 11.15', type: 'kbm', label: 'Jam Ke-5' },
    { period: 7, time: '11.15 - 12.30', type: 'jumat', label: "Sholat Jum'at / Keputrian" },
    { period: 8, time: '12.30 - 13.15', type: 'ekskul', label: 'Ekstrakurikuler Wajib' }
  ],
  uniforms: (AppConfig.DEFAULT_SETTINGS && AppConfig.DEFAULT_SETTINGS.defaultUniforms) ? { ...AppConfig.DEFAULT_SETTINGS.defaultUniforms } : {
    'Senin': 'Putih - Merah (Upacara)',
    'Selasa': 'Batik Muhammadiyah - Putih',
    'Rabu': 'Tapak Suci (Kelas Bawah) / Merah - Putih (Kelas Atas)',
    'Kamis': 'Olahraga (Kelas Bawah) / HW (Kelas Atas)',
    'Jumat': 'Hizbul Wathan / Batik Berkarakter',
    "Jum'at": 'Hizbul Wathan / Batik Berkarakter'
  },
  days: ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"],
  habituationData: {
    lower: [
      { week: 1, senin: 'Senam Indonesia Sehat & Sholat Dhuha', selasa: 'Literasi Membaca', rabu: 'English Morning', kamis: "Muroja'ah Hadist Pilihan" },
      { week: 2, senin: 'Upacara Bendera', selasa: 'Aritmatika Cepat', rabu: 'Arabic Morning', kamis: "Muroja'ah Doa Harian" },
      { week: 3, senin: 'Senam Indonesia Sehat & Sholat Dhuha', selasa: 'Literasi Membaca', rabu: 'English Morning', kamis: "Muroja'ah Hadist Pilihan" },
      { week: 4, senin: 'Upacara Bendera', selasa: 'Aritmatika Cepat', rabu: 'Arabic Morning', kamis: "Muroja'ah Doa Harian" },
      { week: 5, senin: 'Senam Indonesia Sehat & Sholat Dhuha', selasa: 'Literasi Membaca', rabu: 'English Morning', kamis: "Muroja'ah Hadist Pilihan" }
    ],
    upper: [
      { week: 1, senin: 'Upacara Bendera', selasa: 'Literasi Membaca', rabu: 'English Morning', kamis: "Muroja'ah Hadist Pilihan" },
      { week: 2, senin: 'Classmeeting & Bina Karakter', selasa: 'Aritmatika Cepat', rabu: 'Arabic Morning', kamis: "Muroja'ah Doa Harian" },
      { week: 3, senin: 'Upacara Bendera', selasa: 'Literasi Membaca', rabu: 'English Morning', kamis: "Muroja'ah Hadist Pilihan" },
      { week: 4, senin: 'Classmeeting & Bina Karakter', selasa: 'Aritmatika Cepat', rabu: 'Arabic Morning', kamis: "Muroja'ah Doa Harian" },
      { week: 5, senin: 'Upacara Bendera', selasa: 'Literasi Membaca', rabu: 'English Morning', kamis: "Muroja'ah Hadist Pilihan" }
    ]
  },
  async render(container, rawParams = {}) {
    Router.setTitle('Jadwal Pembelajaran & Beban Mengajar', 'Manajemen jadwal tatap muka kelas, penugasan guru, deteksi bentrok, dan rekap beban kerja KBM.');
    const user = Auth.userData || Auth.currentUser || {};
    const uid = user.uid || Auth.currentUser?.uid;
    const isGuruOnly = (Auth.currentRole === AppConfig.ROLES.GURU || Auth.currentRole === AppConfig.ROLES.GURU_UMMI || Auth.currentRole === AppConfig.ROLES.GURU_EKSKUL) &&
      !Auth.hasRole(AppConfig.ROLES.ADMIN) &&
      !Auth.hasRole(AppConfig.ROLES.CURRICULUM) &&
      !Auth.hasUnit('WAKA_KURIKULUM') &&
      !Auth.hasUnit('STAF_KURIKULUM');
    if (rawParams.viewMode === 'teacher' || isGuruOnly) {
      this.currentTab = 'guru';
    }
    const [settings, schedSettings, classes, subjects, users, schedules] = await Promise.all([
      DB.getSettings().catch(() => ({})),
      DB.getScheduleSettings().catch(() => ({})),
      DB.getClasses().catch(() => ({})),
      DB.getSubjects().catch(() => ({})),
      DB.getAllUsers().catch(() => ({})),
      DB.getSchedules().catch(() => ({}))
    ]);
    this.settings = settings || {};
    this.schedSettings = schedSettings || {};
    this.classes = classes || {};
    this.subjects = subjects || {};
    this.users = users || {};
    this.schedules = schedules || {};
    if (schedSettings) {
      if (schedSettings.framework) {
        if (schedSettings.framework.seninKamis) this.periodsSeninKamis = schedSettings.framework.seninKamis;
        if (schedSettings.framework.jumat) this.periodsJumat = schedSettings.framework.jumat;
      }
      if (schedSettings.uniforms) {
        this.uniforms = { ...this.uniforms, ...schedSettings.uniforms };
      }
      if (schedSettings.habits) {
        this.habituationData = { ...this.habituationData, ...schedSettings.habits };
      }
    }
    this.selectedYear = settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
    this.selectedSem = String(settings.currentSemester || AppConfig.DEFAULT_SETTINGS.currentSemester);
    const classList = DB.toArray(this.classes).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'id'));
    if (!this.selectedClassId && classList.length) {
      const myClass = classList.find(c => c.teacherId === uid);
      this.selectedClassId = myClass ? myClass.id : classList[0].id;
    }
    if (!this.selectedTeacherId) {
      this.selectedTeacherId = uid;
    }
    this.computeConflicts();
    container.innerHTML = `
      <section class="card section-spacer sched-toolbar-card">
        <div class="card-body">
          <div class="sched-nav-tabs">
            <button type="button" class="sched-tab-btn${this.currentTab === 'rombel' ? ' active' : ''}" data-tab="rombel">
              <i class="ph ph-chalkboard"></i> Matriks Rombel
            </button>
            <button type="button" class="sched-tab-btn${this.currentTab === 'guru' ? ' active' : ''}" data-tab="guru">
              <i class="ph ph-user-check"></i> Jadwal Guru &amp; Bentrok
            </button>
            <button type="button" class="sched-tab-btn${this.currentTab === 'workload' ? ' active' : ''}" data-tab="workload">
              <i class="ph ph-chart-bar"></i> Beban Mengajar (SK)
            </button>
            <button type="button" class="sched-tab-btn${this.currentTab === 'pembiasaan' ? ' active' : ''}" data-tab="pembiasaan">
              <i class="ph ph-sun"></i> Pembiasaan &amp; Seragam
            </button>
            ${!isGuruOnly ? `
            <button type="button" class="sched-tab-btn${this.currentTab === 'manage' ? ' active' : ''}" data-tab="manage">
              <i class="ph ph-sliders"></i> Pengaturan &amp; Impor
            </button>` : ''}
          </div>
          <div class="sched-controls-grid" id="sched-toolbar-controls"></div>
        </div>
      </section>
      <div id="sched-content-view"></div>
      <div id="sched-modal-container"></div>
    `;
    this.bindToolbarEvents(container, isGuruOnly);
    this.renderCurrentView();
  },
  computeConflicts() {
    this.cachedConflicts = {};
    const slots = Object.entries(this.schedules).map(([id, s]) => ({ id, ...s })).filter(s => s && s.day && (s.teacherId || (s.teachers && s.teachers.length)) && s.type !== 'break' && s.type !== 'ishoma');
    const bucket = {};
    const normDay = (d) => (d === "Jum'at" || d === 'Jumat') ? "Jum'at" : d;
    slots.forEach(s => {
      const pKey = s.period || s.startTime;
      const tIds = (s.teachers && s.teachers.length) ? s.teachers : [s.teacherId, s.coTeacherId].filter(Boolean);
      tIds.forEach(tId => {
        if (!tId || tId === 'TIM_UMMI') return;
        const key = `${normDay(s.day)}__${pKey}__${tId}`;
        if (!bucket[key]) bucket[key] = [];
        bucket[key].push(s);
      });
    });
    Object.values(bucket).forEach(group => {
      if (group.length > 1) {
        if (group.every(s => s.isJoint)) return;
        group.forEach(s => {
          this.cachedConflicts[s.id] = group.filter(other => other.id !== s.id);
        });
      }
    });
  },
  getKepsekInfo() {
    const kepsek = Object.values(this.users || {}).find(u => u && (u.role === 'kepsek' || u.unit === 'KEPSEK' || (u.assignments || []).includes('KEPSEK')));
    return {
      name: (kepsek && (kepsek.name || kepsek.displayName)) || AppConfig.SCHOOL_PROFILE.headmaster || 'Dhani Harsyahyadi, S.H.I.',
      nbm: (kepsek && (kepsek.nbm || kepsek.nip)) || AppConfig.SCHOOL_PROFILE.headmasterNbm || '1314863'
    };
  },
  getCurriculumLeadInfo() {
    const lead = Object.values(this.users || {}).find(u => u && ((u.assignments || []).includes('WAKA_KURIKULUM') || u.unit === 'WAKA_KURIKULUM' || u.role === 'kurikulum'));
    return {
      name: (lead && (lead.name || lead.displayName)) || 'Roudhotul Millah, S.Pd., Gr.',
      nbm: (lead && (lead.nbm || lead.nip)) || '-'
    };
  },
  bindToolbarEvents(container, isGuruOnly) {
    const tabBtns = container.querySelectorAll('.sched-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this.renderCurrentView();
      });
    });
  },
  renderCurrentView() {
    const controls = document.getElementById('sched-toolbar-controls');
    const view = document.getElementById('sched-content-view');
    if (!controls || !view) return;
    if (this.currentTab === 'rombel') {
      this.renderRombelControls(controls);
      this.renderRombelView(view);
    } else if (this.currentTab === 'guru') {
      this.renderGuruControls(controls);
      this.renderGuruView(view);
    } else if (this.currentTab === 'workload') {
      this.renderWorkloadControls(controls);
      this.renderWorkloadView(view);
    } else if (this.currentTab === 'pembiasaan') {
      this.renderPembiasaanControls(controls);
      this.renderPembiasaanView(view);
    } else if (this.currentTab === 'manage') {
      controls.innerHTML = '';
      this.renderManageView(view);
    }
  },
  renderRombelControls(controls) {
    const classList = DB.toArray(this.classes).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'id'));
    const classOpts = classList.map(c => `<option value="${c.id}" ${c.id === this.selectedClassId ? 'selected' : ''}>${AppConfig.escapeHtml(c.name)}</option>`).join('');
    const canEdit = Auth.hasRole(AppConfig.ROLES.ADMIN) || Auth.hasRole(AppConfig.ROLES.CURRICULUM) || Auth.hasUnit('WAKA_KURIKULUM') || Auth.hasUnit('STAF_KURIKULUM');
    controls.innerHTML = `
      <div class="form-group compact-field">
        <label for="sched-class-select"><i class="ph ph-chalkboard"></i> Pilih Rombongan Belajar</label>
        <select id="sched-class-select" class="form-select">${classOpts}</select>
      </div>
      <div class="form-group compact-field sched-filter-action-group">
        <button type="button" class="btn btn-outline" id="btn-print-sched"><i class="ph ph-printer"></i> Cetak Jadwal</button>
        ${canEdit ? `<button type="button" class="btn btn-primary" id="btn-add-slot"><i class="ph ph-plus-circle"></i> Tambah Slot</button>` : ''}
      </div>
    `;
    const sel = controls.querySelector('#sched-class-select');
    if (sel) {
      sel.addEventListener('change', () => {
        this.selectedClassId = sel.value;
        const view = document.getElementById('sched-content-view');
        if (view) this.renderRombelView(view);
      });
    }
    const btnPrint = controls.querySelector('#btn-print-sched');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => window.print());
    }
    const btnAdd = controls.querySelector('#btn-add-slot');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this.openSlotModal(null, { classId: this.selectedClassId }));
    }
  },
  renderRombelView(view) {
    const currentClass = this.classes[this.selectedClassId] || {};
    const kepsek = this.getKepsekInfo();
    const walas = this.users[currentClass.teacherId];
    const walasName = walas ? (walas.name || walas.displayName) : 'Belum Ditentukan';
    const classSlots = Object.entries(this.schedules)
      .map(([id, s]) => ({ id, ...s }))
      .filter(s => s && s.classId === this.selectedClassId);
    const maxPeriod = classSlots.reduce((max, s) => Math.max(max, Number(s.period) || 0), 0);
    const totalPeriods = Math.max(10, maxPeriod);
    const periodList = Array.from({ length: totalPeriods }, (_, i) => i + 1);
    const uniformCards = this.days.map(d => `
      <div class="sched-uniform-card sched-uniform-card--clickable" data-action="open-uniforms-modal" title="Klik untuk mengubah setelan seragam sekolah">
        <div class="sched-uniform-day">${d}</div>
        <div class="sched-uniform-val">${this.uniforms[d] || '-'}</div>
      </div>
    `).join('');
    const gridRows = periodList.map(pNum => {
      const cells = [];
      let cIdx = 0;
      while (cIdx < this.days.length) {
        const day = this.days[cIdx];
        const normD = (day === "Jum'at" || day === 'Jumat') ? "Jum'at" : day;
        const slot = classSlots.find(s => ((s.day === "Jum'at" || s.day === 'Jumat') ? "Jum'at" : s.day) === normD && Number(s.period) === pNum);
        const isBreak = slot && (slot.type === 'break' || slot.type === 'ishoma' || (slot.subjectName || '').toLowerCase().includes('istirahat') || (slot.subjectName || '').toLowerCase().includes('ishoma'));
        if (isBreak) {
          let span = 1;
          const bLabel = (slot.subjectName || (slot.type === 'ishoma' ? 'ISHOMA' : 'Istirahat')).trim();
          while (cIdx + span < this.days.length) {
            const nextDay = this.days[cIdx + span];
            const nextNormD = (nextDay === "Jum'at" || nextDay === 'Jumat') ? "Jum'at" : nextDay;
            const nextSlot = classSlots.find(s => ((s.day === "Jum'at" || s.day === 'Jumat') ? "Jum'at" : s.day) === nextNormD && Number(s.period) === pNum);
            const nextIsBreak = nextSlot && (nextSlot.type === 'break' || nextSlot.type === 'ishoma' || (nextSlot.subjectName || '').toLowerCase().includes('istirahat') || (nextSlot.subjectName || '').toLowerCase().includes('ishoma'));
            if (nextIsBreak) {
              const nbLabel = (nextSlot.subjectName || (nextSlot.type === 'ishoma' ? 'ISHOMA' : 'Istirahat')).trim();
              if (nbLabel.toLowerCase() === bLabel.toLowerCase() || (bLabel.toLowerCase().includes('istirahat') && nbLabel.toLowerCase().includes('istirahat')) || (bLabel.toLowerCase().includes('ishoma') && nbLabel.toLowerCase().includes('ishoma'))) {
                span++;
                continue;
              }
            }
            break;
          }
          const icon = bLabel.toLowerCase().includes('ishoma') ? 'ph-bowl-food' : 'ph-coffee';
          cells.push(`<td colspan="${span}" class="sched-cell-break-merged" data-slot-id="${slot.id}"><i class="ph ${icon}"></i> ${AppConfig.escapeHtml(bLabel)}</td>`);
          cIdx += span;
        } else if (slot) {
          let span = 1;
          const sub = this.subjects[slot.subjectId];
          const subName = slot.subjectName || (sub ? sub.name : slot.subjectId) || '-';
          const teacher = this.users[slot.teacherId];
          const tName = slot.teacherName || (teacher ? (teacher.name || teacher.displayName) : '');
          const hasConflict = !!this.cachedConflicts[slot.id];
          while (cIdx + span < this.days.length) {
            const nextDay = this.days[cIdx + span];
            const nextNormD = (nextDay === "Jum'at" || nextDay === 'Jumat') ? "Jum'at" : nextDay;
            const nextSlot = classSlots.find(s => ((s.day === "Jum'at" || s.day === 'Jumat') ? "Jum'at" : s.day) === nextNormD && Number(s.period) === pNum);
            if (nextSlot && !this.cachedConflicts[nextSlot.id] && !hasConflict) {
              const nextSub = this.subjects[nextSlot.subjectId];
              const nextSubName = nextSlot.subjectName || (nextSub ? nextSub.name : nextSlot.subjectId) || '-';
              const nextTeacher = this.users[nextSlot.teacherId];
              const nextTName = nextSlot.teacherName || (nextTeacher ? (nextTeacher.name || nextTeacher.displayName) : '');
              if (nextSubName === subName && nextTName === tName && (nextSlot.room || '') === (slot.room || '') && !!nextSlot.isJoint === !!slot.isJoint) {
                span++;
                continue;
              }
            }
            break;
          }
          let toneClass = 'sched-cell-card--umum';
          const lowerSub = subName.toLowerCase();
          if (lowerSub.includes('pembiasaan') || lowerSub.includes('upacara')) toneClass = 'sched-cell-card--break';
          else if (lowerSub.includes('aqidah') || lowerSub.includes('ibadah') || lowerSub.includes('tarikh') || lowerSub.includes('qur') || lowerSub.includes('arab') || lowerSub.includes('btq') || lowerSub.includes('kemuhammadiyahan')) toneClass = 'sched-cell-card--ismuba';
          else if (lowerSub.includes('pjok') || lowerSub.includes('tapak suci') || lowerSub.includes('hw') || lowerSub.includes('ekstra')) toneClass = 'sched-cell-card--ekskul';
          if (hasConflict) toneClass = 'sched-cell-card--conflict';
          cells.push(`
            <td ${span > 1 ? `colspan="${span}" class="sched-td-merged"` : ''}>
              <div class="sched-cell-card ${toneClass}" data-slot-id="${slot.id}">
                <div class="sched-card-subj">${AppConfig.escapeHtml(subName)}</div>
                ${tName ? `<div class="sched-card-teacher"><i class="ph ph-chalkboard-teacher"></i> ${AppConfig.escapeHtml(tName)}</div>` : ''}
                ${slot.room ? `<div class="sched-card-room"><i class="ph ph-door"></i> ${AppConfig.escapeHtml(slot.room)}</div>` : ''}
                ${slot.startTime && slot.endTime ? `<div class="sched-card-time"><i class="ph ph-clock"></i> ${AppConfig.escapeHtml(slot.startTime)} - ${AppConfig.escapeHtml(slot.endTime)}</div>` : ''}
                ${hasConflict ? `<div class="sched-conflict-badge"><i class="ph ph-warning-octagon"></i> Bentrok Guru!</div>` : (slot.isJoint ? `<div class="sched-joint-badge"><i class="ph ph-users-three"></i> Sesi Gabungan</div>` : '')}
              </div>
            </td>
          `);
          cIdx += span;
        } else {
          cells.push(`
            <td class="sched-cell-empty" data-day="${day}" data-period="${pNum}">
              <span class="text-muted sched-cell-empty-dash">-</span>
            </td>
          `);
          cIdx++;
        }
      }
      return `
        <tr>
          <td class="sched-time-col">
            <div class="sched-col-time-period">Jam Ke-${pNum}</div>
          </td>
          ${cells.join('')}
        </tr>
      `;
    }).join('');
    view.innerHTML = `
      <section class="sched-print-paper card section-spacer">
        <div class="print-only sched-print-kop-wrapper">
          ${AppConfig.getOfficialKopHtml({ showDivider: false })}
        </div>
        <div class="sched-page-header-row">
          <div>
            <h2 class="sched-page-title">Jadwal Pelajaran ${AppConfig.escapeHtml(currentClass.name || 'Rombel')}</h2>
            <p class="sched-page-subtitle">Wali Kelas: <strong>${AppConfig.escapeHtml(walasName)}</strong> · T.A. ${this.selectedYear} Semester ${this.selectedSem}</p>
          </div>
          <div class="no-print">
            <span class="badge badge-primary sched-badge-pill"><i class="ph ph-clock"></i> 5 Hari Sekolah (Senin - Jum'at)</span>
          </div>
        </div>
        <div class="sched-uniform-row">
          ${uniformCards}
        </div>
        <div class="sched-grid-wrapper">
          <table class="sched-table">
            <thead>
              <tr>
                <th class="sched-col-time-header">Waktu</th>
                <th>Senin</th>
                <th>Selasa</th>
                <th>Rabu</th>
                <th>Kamis</th>
                <th>Jum'at</th>
              </tr>
            </thead>
            <tbody>
              ${gridRows}
            </tbody>
          </table>
        </div>
        <div class="print-only sched-signatures-grid">
          <div class="sched-sig-box">
            <p class="sched-sig-role">Mengetahui,<br>Kepala SD Muhammadiyah 1 Sedati</p>
            <p class="sched-sig-name">${AppConfig.escapeHtml(kepsek.name)}</p>
            <p class="sched-sig-id">NBM: ${AppConfig.escapeHtml(kepsek.nbm)}</p>
          </div>
          <div class="sched-sig-box">
            <p class="sched-sig-role">Sidoarjo, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>Wali Kelas ${AppConfig.escapeHtml(currentClass.name || '')}</p>
            <p class="sched-sig-name">${AppConfig.escapeHtml(walasName)}</p>
            <p class="sched-sig-id">NBM/NIP: ${walas ? (walas.nbm || walas.nip || '-') : '-'}</p>
          </div>
        </div>
      </section>
    `;
    const canEdit = Auth.hasRole(AppConfig.ROLES.ADMIN) || Auth.hasRole(AppConfig.ROLES.CURRICULUM) || Auth.hasUnit('WAKA_KURIKULUM') || Auth.hasUnit('STAF_KURIKULUM');
    if (canEdit) {
      view.querySelectorAll('.sched-cell-card').forEach(card => {
        card.addEventListener('click', () => {
          const slotId = card.dataset.slotId;
          this.openSlotModal(slotId);
        });
      });
      view.querySelectorAll('.sched-cell-break-merged').forEach(cell => {
        cell.addEventListener('click', () => {
          const slotId = cell.dataset.slotId;
          if (slotId) this.openSlotModal(slotId);
        });
      });
      view.querySelectorAll('.sched-cell-empty').forEach(cell => {
        cell.addEventListener('click', () => {
          const day = cell.dataset.day;
          const period = Number(cell.dataset.period);
          this.openSlotModal(null, {
            classId: this.selectedClassId,
            day,
            period
          });
        });
      });
      view.querySelectorAll('[data-action="open-uniforms-modal"]').forEach(card => {
        card.addEventListener('click', () => this.openUniformsModal());
      });
    }
  },
  renderGuruControls(controls) {
    const isGuruOnly = (Auth.currentRole === AppConfig.ROLES.GURU || Auth.currentRole === AppConfig.ROLES.GURU_UMMI || Auth.currentRole === AppConfig.ROLES.GURU_EKSKUL) &&
      !Auth.hasRole(AppConfig.ROLES.ADMIN) &&
      !Auth.hasRole(AppConfig.ROLES.CURRICULUM) &&
      !Auth.hasUnit('WAKA_KURIKULUM') &&
      !Auth.hasUnit('STAF_KURIKULUM');
    const userList = DB.toArray(this.users)
      .filter(u => u && (u.role === 'guru' || u.role === 'guruUmmi' || u.role === 'guru_ummi' || u.role === 'guruEkskul' || u.role === 'guru_ekskul' || (u.assignments || []).some(a => a.startsWith('GURU_'))))
      .sort((a, b) => (a.name || a.displayName || '').localeCompare(b.name || b.displayName || '', 'id'));
    const teacherOpts = userList.map(u => `
      <option value="${u.id}" ${u.id === this.selectedTeacherId ? 'selected' : ''}>
        ${AppConfig.escapeHtml(u.name || u.displayName || u.email)}
      </option>
    `).join('');
    controls.innerHTML = `
      ${!isGuruOnly ? `
      <div class="form-group compact-field">
        <label for="sched-teacher-select"><i class="ph ph-chalkboard-teacher"></i> Pilih Guru Pengampu</label>
        <select id="sched-teacher-select" class="form-select">${teacherOpts}</select>
      </div>` : ''}
      <div class="form-group compact-field sched-filter-action-group">
        <button type="button" class="btn btn-outline" id="btn-print-teacher-sched"><i class="ph ph-printer"></i> Cetak Jadwal Guru</button>
      </div>
    `;
    const sel = controls.querySelector('#sched-teacher-select');
    if (sel) {
      sel.addEventListener('change', () => {
        this.selectedTeacherId = sel.value;
        const view = document.getElementById('sched-content-view');
        if (view) this.renderGuruView(view);
      });
    }
    const btnPrint = controls.querySelector('#btn-print-teacher-sched');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => window.print());
    }
  },
  renderGuruView(view) {
    const teacher = this.users[this.selectedTeacherId] || {};
    const kepsek = this.getKepsekInfo();
    const tName = teacher.name || teacher.displayName || 'Guru';
    const teacherSlots = Object.entries(this.schedules)
      .map(([id, s]) => ({ id, ...s }))
      .filter(s => s && (s.teacherId === this.selectedTeacherId || s.coTeacherId === this.selectedTeacherId || (s.teachers && s.teachers.includes(this.selectedTeacherId))));
    let totalJp = 0;
    let conflictCount = 0;
    teacherSlots.forEach(s => {
      if (s.type !== 'break' && s.type !== 'ishoma') {
        totalJp += (s.isUmmi || s.subjectId === 'SUB_BTQ' ? 2 : 1);
      }
      if (this.cachedConflicts[s.id]) conflictCount++;
    });
    const maxPeriod = teacherSlots.reduce((max, s) => Math.max(max, Number(s.period) || 0), 0);
    const totalPeriods = Math.max(10, maxPeriod);
    const periodList = Array.from({ length: totalPeriods }, (_, i) => i + 1);
    const gridRows = periodList.map(pNum => {
      const cells = [];
      let cIdx = 0;
      while (cIdx < this.days.length) {
        const day = this.days[cIdx];
        const normD = (day === "Jum'at" || day === 'Jumat') ? "Jum'at" : day;
        const slotsInPeriod = teacherSlots.filter(s => ((s.day === "Jum'at" || s.day === 'Jumat') ? "Jum'at" : s.day) === normD && Number(s.period) === pNum);
        const breakSlot = slotsInPeriod.find(s => s.type === 'break' || s.type === 'ishoma' || (s.subjectName || '').toLowerCase().includes('istirahat') || (s.subjectName || '').toLowerCase().includes('ishoma'));
        if (breakSlot) {
          let span = 1;
          const bLabel = (breakSlot.subjectName || (breakSlot.type === 'ishoma' ? 'ISHOMA' : 'Istirahat')).trim();
          while (cIdx + span < this.days.length) {
            const nextDay = this.days[cIdx + span];
            const nextNormD = (nextDay === "Jum'at" || nextDay === 'Jumat') ? "Jum'at" : nextDay;
            const nextSlots = teacherSlots.filter(s => ((s.day === "Jum'at" || s.day === 'Jumat') ? "Jum'at" : s.day) === nextNormD && Number(s.period) === pNum);
            const nextBreak = nextSlots.find(s => s.type === 'break' || s.type === 'ishoma' || (s.subjectName || '').toLowerCase().includes('istirahat') || (s.subjectName || '').toLowerCase().includes('ishoma'));
            if (nextBreak) {
              const nbLabel = (nextBreak.subjectName || (nextBreak.type === 'ishoma' ? 'ISHOMA' : 'Istirahat')).trim();
              if (nbLabel.toLowerCase() === bLabel.toLowerCase() || (bLabel.toLowerCase().includes('istirahat') && nbLabel.toLowerCase().includes('istirahat')) || (bLabel.toLowerCase().includes('ishoma') && nbLabel.toLowerCase().includes('ishoma'))) {
                span++;
                continue;
              }
            }
            break;
          }
          const icon = bLabel.toLowerCase().includes('ishoma') ? 'ph-bowl-food' : 'ph-coffee';
          cells.push(`<td colspan="${span}" class="sched-cell-break-merged"><i class="ph ${icon}"></i> ${AppConfig.escapeHtml(bLabel)}</td>`);
          cIdx += span;
        } else if (slotsInPeriod.length) {
          const hasConflict = slotsInPeriod.length > 1 || slotsInPeriod.some(s => this.cachedConflicts[s.id]);
          cells.push(`
            <td>
              ${slotsInPeriod.map(slot => {
                const cls = this.classes[slot.classId];
                const cName = cls ? cls.name : (slot.className || slot.classId);
                const sub = this.subjects[slot.subjectId];
                const subName = slot.subjectName || (sub ? sub.name : slot.subjectId) || '-';
                return `
                  <div class="sched-cell-card ${hasConflict ? 'sched-cell-card--conflict' : 'sched-cell-card--umum'}" data-slot-id="${slot.id}">
                    <div class="sched-card-subj">${AppConfig.escapeHtml(subName)}</div>
                    <div class="sched-card-teacher"><i class="ph ph-chalkboard"></i> ${AppConfig.escapeHtml(cName)}</div>
                    ${slot.room ? `<div class="sched-card-room"><i class="ph ph-door"></i> ${AppConfig.escapeHtml(slot.room)}</div>` : ''}
                    ${slot.startTime && slot.endTime ? `<div class="sched-card-time"><i class="ph ph-clock"></i> ${AppConfig.escapeHtml(slot.startTime)} - ${AppConfig.escapeHtml(slot.endTime)}</div>` : ''}
                    ${hasConflict ? `<div class="sched-conflict-badge"><i class="ph ph-warning-octagon"></i> Bentrok Mengajar!</div>` : (slot.isJoint ? `<div class="sched-joint-badge"><i class="ph ph-users-three"></i> Sesi Gabungan</div>` : '')}
                  </div>
                `;
              }).join('')}
            </td>
          `);
          cIdx++;
        } else {
          cells.push(`
            <td class="sched-cell-empty">
              <span class="text-muted sched-cell-empty-dash">-</span>
            </td>
          `);
          cIdx++;
        }
      }
      return `
        <tr>
          <td class="sched-time-col">
            <div class="sched-col-time-period">Jam Ke-${pNum}</div>
          </td>
          ${cells.join('')}
        </tr>
      `;
    }).join('');
    view.innerHTML = `
      <section class="sched-print-paper card section-spacer">
        <div class="print-only sched-print-kop-wrapper">
          ${AppConfig.getOfficialKopHtml({ showDivider: false })}
        </div>
        <div class="sched-stat-grid no-print">
          <div class="sched-stat-item">
            <div class="sched-stat-icon sched-stat-icon--primary"><i class="ph ph-clock"></i></div>
            <div>
              <div class="sched-stat-label">Total Beban Tatap Muka</div>
              <div class="sched-stat-val">${totalJp} <span class="sched-stat-unit">JP / Pekan</span></div>
            </div>
          </div>
          <div class="sched-stat-item">
            <div class="sched-stat-icon ${conflictCount > 0 ? 'sched-stat-icon--danger' : 'sched-stat-icon--neutral'}"><i class="ph ${conflictCount > 0 ? 'ph-warning-octagon' : 'ph-shield-check'}"></i></div>
            <div>
              <div class="sched-stat-label">Deteksi Bentrok</div>
              <div class="sched-stat-status-text ${conflictCount > 0 ? 'sched-stat-status-text--danger' : 'sched-stat-status-text--ok'}">
                ${conflictCount > 0 ? `${conflictCount} Slot Bentrok!` : 'Aman (0 Bentrok)'}
              </div>
            </div>
          </div>
        </div>
        <div class="sched-meta-header-block">
          <h2 class="sched-page-title">Jadwal Mengajar: ${AppConfig.escapeHtml(tName)}</h2>
          <p class="sched-page-subtitle">NBM/NIP: ${teacher.nbm || teacher.nip || '-'} · Beban Mengajar: <strong>${totalJp} JP</strong> · T.A. ${this.selectedYear}</p>
        </div>
        <div class="sched-grid-wrapper">
          <table class="sched-table">
            <thead>
              <tr>
                <th class="sched-col-time-header">Waktu</th>
                <th>Senin</th>
                <th>Selasa</th>
                <th>Rabu</th>
                <th>Kamis</th>
                <th>Jum'at</th>
              </tr>
            </thead>
            <tbody>
              ${gridRows}
            </tbody>
          </table>
        </div>
        <div class="print-only sched-signatures-grid">
          <div class="sched-sig-box">
            <p class="sched-sig-role">Mengetahui,<br>Kepala SD Muhammadiyah 1 Sedati</p>
            <p class="sched-sig-name">${AppConfig.escapeHtml(kepsek.name)}</p>
            <p class="sched-sig-id">NBM: ${AppConfig.escapeHtml(kepsek.nbm)}</p>
          </div>
          <div class="sched-sig-box">
            <p class="sched-sig-role">Sidoarjo, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>Guru Yang Bersangkutan</p>
            <p class="sched-sig-name">${AppConfig.escapeHtml(tName)}</p>
            <p class="sched-sig-id">NBM/NIP: ${teacher.nbm || teacher.nip || '-'}</p>
          </div>
        </div>
      </section>
    `;
  },
  renderWorkloadControls(controls) {
    controls.innerHTML = `
      <div class="form-group compact-field sched-filter-action-group">
        <button type="button" class="btn btn-outline" id="btn-print-workload"><i class="ph ph-printer"></i> Cetak Rekap SK Mengajar</button>
      </div>
    `;
    const btnPrint = controls.querySelector('#btn-print-workload');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());
  },
  renderWorkloadView(view) {
    const kepsek = this.getKepsekInfo();
    const curriculumLead = this.getCurriculumLeadInfo();
    const userList = DB.toArray(this.users)
      .filter(u => u && (u.role === 'guru' || u.role === 'guruUmmi' || u.role === 'guru_ummi' || u.role === 'guruEkskul' || u.role === 'guru_ekskul' || (u.assignments || []).some(a => a.startsWith('GURU_'))))
      .sort((a, b) => (a.name || a.displayName || '').localeCompare(b.name || b.displayName || '', 'id'));
    const allSlots = Object.values(this.schedules).filter(s => s && s.type !== 'break' && s.type !== 'ishoma');
    let totalAllJp = 0;
    const rowsHtml = userList.map((u, idx) => {
      const mySlots = allSlots.filter(s => s.teacherId === u.id || s.coTeacherId === u.id || (s.teachers && s.teachers.includes(u.id)));
      let jp = 0;
      mySlots.forEach(s => {
        jp += (s.isUmmi || s.subjectId === 'SUB_BTQ' ? 2 : 1);
      });
      totalAllJp += jp;
      const myClasses = Object.values(this.classes).filter(c => c.teacherId === u.id).map(c => c.name);
      const subjectsTaught = [...new Set(mySlots.map(s => {
        const sub = this.subjects[s.subjectId];
        return sub ? sub.name : (s.subjectName || s.subjectId);
      }))].filter(Boolean);
      let statusBadge = '<span class="badge badge-warning">Kurang (&lt; 18 JP)</span>';
      if (jp >= 18 && jp <= 24) statusBadge = '<span class="badge badge-success">Ideal (18 - 24 JP)</span>';
      else if (jp > 24) statusBadge = '<span class="badge badge-primary">Jam Lebih (&gt; 24 JP)</span>';
      const roleTitle = myClasses.length ? `Wali Kelas ${AppConfig.escapeHtml(myClasses.join(', '))}` : (u.role === 'guruUmmi' || u.role === 'guru_ummi' ? "Guru Al-Qur'an (Metode Ummi)" : (u.assignments?.includes('PENDAMPING') ? 'Guru Pendamping' : 'Guru Bidang Studi'));
      return `
        <tr>
          <td class="sched-td-center">${idx + 1}</td>
          <td>
            <strong>${AppConfig.escapeHtml(u.name || u.displayName)}</strong>
            <div class="sched-teacher-meta">NBM: ${u.nbm || u.nip || '-'}</div>
          </td>
          <td>${roleTitle}</td>
          <td>${subjectsTaught.length ? AppConfig.escapeHtml(subjectsTaught.slice(0, 3).join(', ')) + (subjectsTaught.length > 3 ? ` (+${subjectsTaught.length - 3})` : '') : '-'}</td>
          <td class="sched-workload-jp-cell">${jp} JP</td>
          <td class="sched-td-center">${statusBadge}</td>
        </tr>
      `;
    }).join('');
    view.innerHTML = `
      <section class="sched-print-paper card section-spacer">
        <div class="print-only sched-print-kop-wrapper">
          ${AppConfig.getOfficialKopHtml({ showDivider: false })}
        </div>
        <div class="sched-stats-cards no-print">
          <div class="sched-stat-item">
            <div class="sched-stat-icon sched-stat-icon--blue"><i class="ph ph-users"></i></div>
            <div>
              <div class="sched-stat-label">Total Pendidik Aktif</div>
              <div class="sched-stat-val">${userList.length} Orang Guru</div>
            </div>
          </div>
          <div class="sched-stat-item">
            <div class="sched-stat-icon sched-stat-icon--green"><i class="ph ph-clock"></i></div>
            <div>
              <div class="sched-stat-label">Total Alokasi Tatap Muka</div>
              <div class="sched-stat-val">${totalAllJp} JP Terdistribusi</div>
            </div>
          </div>
          <div class="sched-stat-item">
            <div class="sched-stat-icon sched-stat-icon--amber"><i class="ph ph-chart-line"></i></div>
            <div>
              <div class="sched-stat-label">Rata-rata Beban Mengajar</div>
              <div class="sched-stat-val">${userList.length ? (totalAllJp / userList.length).toFixed(1) : 0} JP / Guru</div>
            </div>
          </div>
        </div>
        <div class="sched-meta-header-block">
          <h2 class="sched-page-title">Rekapitulasi Pembagian Tugas Mengajar &amp; Beban Kerja Guru</h2>
          <p class="sched-page-subtitle">Lampiran SK Pembagian Tugas Akademik · Tahun Pelajaran ${this.selectedYear}</p>
        </div>
        <div class="sched-grid-wrapper">
          <table class="sched-workload-table">
            <thead>
              <tr>
                <th class="sched-th-no">No</th>
                <th>Nama Guru &amp; NBM</th>
                <th>Tugas Pokok / Rombel</th>
                <th>Mata Pelajaran Diampu</th>
                <th class="sched-th-jp">Beban Mingguan</th>
                <th class="sched-th-status">Status Beban</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
        <div class="print-only sched-signatures-grid">
          <div class="sched-sig-box">
            <p class="sched-sig-role">Mengetahui,<br>Kepala SD Muhammadiyah 1 Sedati</p>
            <p class="sched-sig-name">${AppConfig.escapeHtml(kepsek.name)}</p>
            <p class="sched-sig-id">NBM: ${AppConfig.escapeHtml(kepsek.nbm)}</p>
          </div>
          <div class="sched-sig-box">
            <p class="sched-sig-role">Sidoarjo, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>Waka Kurikulum</p>
            <p class="sched-sig-name">${AppConfig.escapeHtml(curriculumLead.name)}</p>
            <p class="sched-sig-id">NBM/NIP: ${AppConfig.escapeHtml(curriculumLead.nbm)}</p>
          </div>
        </div>
      </section>
    `;
  },
  renderPembiasaanControls(controls) {
    controls.innerHTML = `
      <div class="form-group compact-field sched-filter-action-group">
        <button type="button" class="btn btn-outline" id="btn-edit-habits-ctrl"><i class="ph ph-sparkle"></i> Ubah Pembiasaan</button>
        <button type="button" class="btn btn-primary" id="btn-print-habits-ctrl"><i class="ph ph-printer"></i> Cetak Jadwal Pembiasaan</button>
      </div>
    `;
    const btnPrint = controls.querySelector('#btn-print-habits-ctrl');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());
    const btnHabits = controls.querySelector('#btn-edit-habits-ctrl');
    if (btnHabits) btnHabits.addEventListener('click', () => this.openHabitsModal());
  },
  renderPembiasaanView(view) {
    const kepsek = this.getKepsekInfo();
    const curriculumLead = this.getCurriculumLeadInfo();
    const habits = this.habituationData || {};
    const lowerList = Array.isArray(habits.lower) ? habits.lower : [];
    const upperList = Array.isArray(habits.upper) ? habits.upper : [];
    const lowerRows = lowerList.map(item => `
      <tr>
        <td class="sched-td-center-bold">Minggu ${item.week}</td>
        <td>${item.senin || '-'}</td>
        <td>${item.selasa || '-'}</td>
        <td>${item.rabu || '-'}</td>
        <td>${item.kamis || '-'}</td>
      </tr>
    `).join('');
    const upperRows = upperList.map(item => `
      <tr>
        <td class="sched-td-center-bold">Minggu ${item.week}</td>
        <td>${item.senin || '-'}</td>
        <td>${item.selasa || '-'}</td>
        <td>${item.rabu || '-'}</td>
        <td>${item.kamis || '-'}</td>
      </tr>
    `).join('');
    view.innerHTML = `
      <section class="sched-print-paper card section-spacer">
        <div class="print-only sched-print-kop-wrapper">
          ${AppConfig.getOfficialKopHtml({ showDivider: false })}
        </div>
        <div class="sched-page-header-row">
          <div>
            <h2 class="sched-page-title">Jadwal Pembiasaan Karakter &amp; Budaya Sekolah</h2>
            <p class="sched-page-subtitle">Pelaksanaan Jam Ke-0 (07.00 - 07.30 WIB) · SD Muhammadiyah 1 Sedati</p>
          </div>
          <div class="sched-actions-row no-print">
            <button type="button" class="btn btn-outline" id="btn-edit-habits-view"><i class="ph ph-sparkle"></i> Ubah Pembiasaan</button>
            <button type="button" class="btn btn-primary" id="btn-print-habits-view"><i class="ph ph-printer"></i> Cetak Jadwal Pembiasaan</button>
          </div>
        </div>
        <div class="sched-habit-block">
          <h3 class="sched-section-subtitle"><i class="ph ph-sparkle"></i> Siklus Pembiasaan Kelas 1 - 3 (Fase A &amp; B Awal)</h3>
          <div class="sched-grid-wrapper">
            <table class="sched-workload-table">
              <thead>
                <tr>
                  <th class="sched-th-week">Pekan</th>
                  <th>Senin</th>
                  <th>Selasa</th>
                  <th>Rabu</th>
                  <th>Kamis</th>
                </tr>
              </thead>
              <tbody>
                ${lowerRows}
              </tbody>
            </table>
          </div>
        </div>
        <div class="sched-habit-block">
          <h3 class="sched-section-subtitle"><i class="ph ph-sparkle"></i> Siklus Pembiasaan Kelas 4 - 6 (Fase B Atas &amp; C)</h3>
          <div class="sched-grid-wrapper">
            <table class="sched-workload-table">
              <thead>
                <tr>
                  <th class="sched-th-week">Pekan</th>
                  <th>Senin</th>
                  <th>Selasa</th>
                  <th>Rabu</th>
                  <th>Kamis</th>
                </tr>
              </thead>
              <tbody>
                ${upperRows}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 class="sched-section-subtitle"><i class="ph ph-t-shirt"></i> Ketentuan Seragam Harian Siswa &amp; Guru</h3>
          <div class="sched-uniform-row">
            ${this.days.map(d => `
              <div class="sched-uniform-card sched-uniform-card--clickable" data-action="open-uniforms-modal" title="Klik untuk mengubah setelan seragam sekolah">
                <div class="sched-uniform-day">${d}</div>
                <div class="sched-uniform-val">${this.uniforms[d] || '-'}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="print-only sched-signatures-grid">
          <div class="sched-sig-box">
            <p class="sched-sig-role">Mengetahui,<br>Kepala SD Muhammadiyah 1 Sedati</p>
            <p class="sched-sig-name">${AppConfig.escapeHtml(kepsek.name)}</p>
            <p class="sched-sig-id">NBM: ${AppConfig.escapeHtml(kepsek.nbm)}</p>
          </div>
          <div class="sched-sig-box">
            <p class="sched-sig-role">Sidoarjo, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>Waka Kurikulum</p>
            <p class="sched-sig-name">${AppConfig.escapeHtml(curriculumLead.name)}</p>
            <p class="sched-sig-id">NBM/NIP: ${AppConfig.escapeHtml(curriculumLead.nbm)}</p>
          </div>
        </div>
      </section>
    `;
    const btnPrintView = view.querySelector('#btn-print-habits-view');
    if (btnPrintView) btnPrintView.addEventListener('click', () => window.print());
    const btnHabitsView = view.querySelector('#btn-edit-habits-view');
    if (btnHabitsView) btnHabitsView.addEventListener('click', () => this.openHabitsModal());
    view.querySelectorAll('[data-action="open-uniforms-modal"]').forEach(card => {
      card.addEventListener('click', () => this.openUniformsModal());
    });
  },
  renderHabitsView(view) {
    return this.renderPembiasaanView(view);
  },
  renderManageView(view) {
    const totalSlots = Object.keys(this.schedules).length;
    view.innerHTML = `
      <section class="card section-spacer">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ph-database"></i> Sinkronisasi &amp; Manajemen Data Jadwal</h3>
          <p class="text-muted">Kelola basis data jadwal pembelajaran tahun ajaran ${this.selectedYear}. Anda dapat memuat seluruh jadwal 16 rombel dari dokumen acuan TAPEL 2026/2027.</p>
          <div class="card-grid section-spacer">
            <div class="card sched-admin-box">
              <h4 class="sched-admin-card-title"><i class="ph ph-book-open"></i> Bank Mata Pelajaran (SSOT Akademik)</h4>
              <p class="sched-admin-card-desc">Kelola nama mata pelajaran, kode, kategori (Agama, Umum, Mulok, Kekhasan), urutan buku nilai, dan pemetaan guru pengampu.</p>
              <a href="#/admin/subjects" class="btn btn-outline"><i class="ph ph-sliders"></i> Buka Manajemen Bank Mapel</a>
            </div>
            <div class="card sched-admin-box">
              <h4 class="sched-admin-card-title"><i class="ph ph-cloud-arrow-down"></i> Sinkronisasi Master Jadwal 16 Rombel</h4>
              <p class="sched-admin-card-desc">Pulihkan 664 slot jadwal resmi (16 rombel lengkap dengan mapel, guru walas, guru bidang studi, jam istirahat, dan seragam) dari template master database Firebase RTDB.</p>
              <button type="button" class="btn btn-primary" id="btn-seed-jadwal">
                <i class="ph ph-download-simple"></i> Jalankan Sinkronisasi Jadwal 16 Rombel
              </button>
            </div>
            <div class="card sched-admin-box--danger">
              <h4 class="sched-admin-card-title--danger"><i class="ph ph-trash"></i> Bersihkan / Reset Jadwal</h4>
              <p class="sched-admin-card-desc">Saat ini terdapat <strong>${totalSlots} slot</strong> jadwal tersimpan di database. Reset akan mengosongkan seluruh slot jadwal berjalan.</p>
              <button type="button" class="btn btn-outline btn-outline-danger" id="btn-clear-jadwal">
                <i class="ph ph-trash"></i> Kosongkan Seluruh Slot Jadwal
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
    const btnSeed = view.querySelector('#btn-seed-jadwal');
    if (btnSeed) {
      btnSeed.addEventListener('click', async () => {
        if (!confirm('Impor jadwal 16 rombel T.A. 2026/2027 ke database? Data jadwal yang ada akan diperbarui.')) return;
        btnSeed.disabled = true;
        btnSeed.innerHTML = '<span class="btn-spinner"></span> Menyinkronkan...';
        try {
          await this.seedTsvData();
          alert('Sinkronisasi jadwal 16 rombel berhasil!');
          location.reload();
        } catch (err) {
          alert('Gagal menyinkronkan data: ' + err.message);
          btnSeed.disabled = false;
          btnSeed.innerHTML = '<i class="ph ph-download-simple"></i> Jalankan Sinkronisasi Jadwal 16 Rombel';
        }
      });
    }
    const btnClear = view.querySelector('#btn-clear-jadwal');
    if (btnClear) {
      btnClear.addEventListener('click', async () => {
        if (!confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH slot jadwal?')) return;
        try {
          await db.ref('curriculum/schedules').remove();
          alert('Seluruh slot jadwal telah dibersihkan.');
          location.reload();
        } catch (err) {
          alert('Gagal menghapus: ' + err.message);
        }
      });
    }
  },
  openSlotModal(slotId, defaults = {}) {
    const modalWrap = document.getElementById('sched-modal-container');
    if (!modalWrap) return;
    const existing = slotId ? this.schedules[slotId] : (defaults || {});
    const classList = DB.toArray(this.classes).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'id'));
    const subjectList = DB.toArray(this.subjects).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'id'));
    const userList = DB.toArray(this.users)
      .filter(u => u && (u.role === 'guru' || u.role === 'guruUmmi' || u.role === 'guru_ummi' || u.role === 'guruEkskul' || u.role === 'guru_ekskul' || (u.assignments || []).some(a => a.startsWith('GURU_'))))
      .sort((a, b) => (a.name || a.displayName || '').localeCompare(b.name || b.displayName || '', 'id'));
    const dayOpts = this.days.map(d => `<option value="${d}" ${(existing.day || defaults.day) === d ? 'selected' : ''}>${d}</option>`).join('');
    const classOpts = classList.map(c => `<option value="${c.id}" ${(existing.classId || defaults.classId) === c.id ? 'selected' : ''}>${AppConfig.escapeHtml(c.name)}</option>`).join('');
    const subjectOpts = `<option value="">(Non-Mapel / Kegiatan Khusus)</option>` + subjectList.map(s => `<option value="${s.id}" ${existing.subjectId === s.id ? 'selected' : ''}>${AppConfig.escapeHtml(s.name)}</option>`).join('');
    const teacherOpts = `<option value="">(Tanpa Guru Pengampu)</option>` + userList.map(u => `<option value="${u.id}" ${existing.teacherId === u.id ? 'selected' : ''}>${AppConfig.escapeHtml(u.name || u.displayName)}</option>`).join('');
    modalWrap.innerHTML = `
      <div class="modal-overlay active" id="sched-modal-overlay">
        <div class="modal sched-modal-dialog" id="sched-slot-modal">
          <div class="modal-header">
            <h3 class="modal-title">${slotId ? 'Ubah Slot Pembelajaran' : 'Tambah Slot Pembelajaran'}</h3>
            <button type="button" class="btn-icon" id="btn-close-sched-modal"><i class="ph ph-x"></i></button>
          </div>
        <form id="sched-slot-form">
          <div class="modal-body sched-modal-form">
            <div class="sched-form-grid-half">
              <div class="form-group compact-field">
                <label>Hari <span class="text-danger">*</span></label>
                <select id="slot-day" class="form-select" required>${dayOpts}</select>
              </div>
              <div class="form-group compact-field">
                <label>Jam Ke- <span class="text-danger">*</span></label>
                <input type="number" id="slot-period" class="form-input" min="1" max="11" value="${existing.period || defaults.period || 1}" required>
              </div>
            </div>
            <div class="sched-form-grid-half">
              <div class="form-group compact-field">
                <label>Jam Mulai</label>
                <input type="text" id="slot-start-time" class="form-input" placeholder="07:30" value="${existing.startTime || defaults.startTime || '07:30'}">
              </div>
              <div class="form-group compact-field">
                <label>Jam Selesai</label>
                <input type="text" id="slot-end-time" class="form-input" placeholder="08:15" value="${existing.endTime || defaults.endTime || '08:15'}">
              </div>
            </div>
            <div class="form-group compact-field">
              <label>Rombongan Belajar <span class="text-danger">*</span></label>
              <select id="slot-class" class="form-select" required>${classOpts}</select>
            </div>
            <div class="form-group compact-field">
              <label>Mata Pelajaran <span class="text-danger">*</span></label>
              <select id="slot-subject" class="form-select">${subjectOpts}</select>
            </div>
            <div class="form-group compact-field">
              <label>Nama Mapel Kustom / Label</label>
              <input type="text" id="slot-subject-name" class="form-input" placeholder="Kosongkan jika sesuai master" value="${AppConfig.escapeHtml(existing.subjectName || '')}">
            </div>
            <div class="form-group compact-field">
              <label>Guru Pengampu <span class="text-danger">*</span></label>
              <select id="slot-teacher" class="form-select">${teacherOpts}</select>
            </div>
            <div class="form-group compact-field">
              <label>Ruangan / Catatan</label>
              <input type="text" id="slot-room" class="form-input" placeholder="Contoh: Lab Komputer / Lapangan" value="${AppConfig.escapeHtml(existing.room || '')}">
            </div>
            <div class="form-group compact-field">
              <label class="form-switch-card">
                <div class="form-switch-info">
                  <span class="form-switch-title"><i class="ph ph-users-three"></i> Sesi Gabungan Paralel</span>
                  <span class="form-switch-desc">Aktifkan jika sesi ini diajar bersama rombel lain (Joint Class)</span>
                </div>
                <span class="form-switch">
                  <input type="checkbox" id="slot-is-joint" ${existing.isJoint ? 'checked' : ''}>
                </span>
              </label>
            </div>
          </div>
          <div class="modal-footer sched-modal-footer-flex">
            <div>
              ${slotId ? `<button type="button" class="btn btn-outline btn-outline-danger" id="btn-delete-slot"><i class="ph ph-trash"></i> Hapus</button>` : ''}
            </div>
            <div class="sched-btn-group-row">
              <button type="button" class="btn btn-outline" id="btn-cancel-sched">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-sched"><i class="ph ph-floppy-disk"></i> Simpan Slot</button>
            </div>
          </div>
        </form>
      </div>
    </div>
    `;
    const closeModal = () => {
      modalWrap.innerHTML = '';
    };
    const selSub = modalWrap.querySelector('#slot-subject');
    const inputSubName = modalWrap.querySelector('#slot-subject-name');
    if (selSub && inputSubName) {
      selSub.addEventListener('change', () => {
        const sid = selSub.value;
        if (sid && this.subjects[sid]) {
          inputSubName.value = this.subjects[sid].name;
        }
      });
    }
    modalWrap.querySelector('#btn-close-sched-modal')?.addEventListener('click', closeModal);
    modalWrap.querySelector('#sched-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'sched-modal-overlay') closeModal();
    });
    modalWrap.querySelector('#btn-cancel-sched')?.addEventListener('click', closeModal);
    const btnDel = modalWrap.querySelector('#btn-delete-slot');
    if (btnDel && slotId) {
      btnDel.addEventListener('click', async () => {
        if (!confirm('Hapus slot jadwal ini?')) return;
        await DB.deleteSchedule(slotId);
        delete this.schedules[slotId];
        this.computeConflicts();
        closeModal();
        this.renderCurrentView();
      });
    }
    const form = modalWrap.querySelector('#sched-slot-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const day = modalWrap.querySelector('#slot-day').value;
      const period = Number(modalWrap.querySelector('#slot-period').value);
      const startTime = modalWrap.querySelector('#slot-start-time').value.trim();
      const endTime = modalWrap.querySelector('#slot-end-time').value.trim();
      const classId = modalWrap.querySelector('#slot-class').value;
      const subjectId = modalWrap.querySelector('#slot-subject').value;
      const customSubName = modalWrap.querySelector('#slot-subject-name').value.trim();
      const teacherId = modalWrap.querySelector('#slot-teacher').value;
      const room = modalWrap.querySelector('#slot-room').value.trim();
      const isJoint = modalWrap.querySelector('#slot-is-joint')?.checked || false;
      const subObj = subjectId ? this.subjects[subjectId] : null;
      const teacherObj = teacherId ? this.users[teacherId] : null;
      let slotCategory = subObj ? (subObj.category || 'standar') : 'kokurikuler';
      let slotType = 'lesson';
      const lowerName = (customSubName || (subObj ? subObj.name : '')).toLowerCase();
      if (lowerName.includes('istirahat') || lowerName.includes('ishoma')) {
        slotCategory = 'break';
        slotType = 'break';
      } else if (lowerName.includes('pembiasaan') || lowerName.includes('upacara') || lowerName.includes('senam')) {
        slotCategory = 'rutinitas';
        slotType = 'habit';
      }
      const payload = {
        day,
        period,
        startTime,
        endTime,
        classId,
        subjectId: subjectId || null,
        subjectName: customSubName || (subObj ? subObj.name : 'Kegiatan Khusus'),
        teacherId: teacherId || '',
        teacherName: teacherObj ? (teacherObj.name || teacherObj.displayName) : '',
        room,
        isJoint,
        jointNote: isJoint ? (existing.jointNote || 'Sesi Gabungan Paralel') : '',
        category: slotCategory,
        type: slotType,
        academicYear: this.selectedYear,
        semester: this.selectedSem,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      };
      const btnSave = form.querySelector('#btn-save-sched');
      btnSave.disabled = true;
      btnSave.innerHTML = '<span class="btn-spinner"></span> Menyimpan...';
      try {
        const savedId = await DB.saveSchedule(slotId, payload);
        if (classId && subjectId && teacherId && subjectId !== 'SUB_BTQ') {
          await db.ref(`classes/${classId}/subjectTeachers/${subjectId}`).set(teacherId);
          if (this.classes[classId]) {
            if (!this.classes[classId].subjectTeachers) this.classes[classId].subjectTeachers = {};
            this.classes[classId].subjectTeachers[subjectId] = teacherId;
          }
        }
        this.schedules[savedId || slotId] = { ...payload, id: savedId || slotId };
        this.computeConflicts();
        closeModal();
        this.renderCurrentView();
      } catch (err) {
        alert('Gagal menyimpan slot: ' + err.message);
        btnSave.disabled = false;
        btnSave.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Slot';
      }
    });
  },
  openHabitsModal() {
    const modalWrap = document.getElementById('sched-modal-container');
    if (!modalWrap) return;
    const habits = this.habituationData || {};
    const lower = Array.isArray(habits.lower) && habits.lower.length ? habits.lower : [
      { week: 1, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'Literasi Numerasi', kamis: 'Hadits & Doa' },
      { week: 2, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'English Morning', kamis: 'Adab & Karakter' },
      { week: 3, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'Bahasa Arab Dasar', kamis: 'Aritmatika Ceria' },
      { week: 4, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'Kisah Sahabat Nabi', kamis: 'Tahfidz Bersama' },
      { week: 5, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'Kreativitas / Musik', kamis: 'Muhasabah Pagi' }
    ];
    const upper = Array.isArray(habits.upper) && habits.upper.length ? habits.upper : [
      { week: 1, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'Literasi Membaca', kamis: 'Aritmatika / Sains' },
      { week: 2, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'English Speech', kamis: 'Hadits Pilihan' },
      { week: 3, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'Muhadatsah Arab', kamis: 'Kemuhammadiyahan' },
      { week: 4, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'Literasi Digital', kamis: 'Kajian Karakter' },
      { week: 5, senin: 'Upacara Bendera', selasa: "Dhuha & Muraja'ah", rabu: 'Public Speaking', kamis: 'Kultum Siswa' }
    ];
    const renderRows = (arr, prefix) => arr.map(item => `
      <tr>
        <td class="sched-td-center-bold">Minggu ${item.week}</td>
        <td><input type="text" class="sched-habit-input" id="${prefix}-senin-${item.week}" value="${AppConfig.escapeHtml(item.senin || '')}" required></td>
        <td><input type="text" class="sched-habit-input" id="${prefix}-selasa-${item.week}" value="${AppConfig.escapeHtml(item.selasa || '')}" required></td>
        <td><input type="text" class="sched-habit-input" id="${prefix}-rabu-${item.week}" value="${AppConfig.escapeHtml(item.rabu || '')}" required></td>
        <td><input type="text" class="sched-habit-input" id="${prefix}-kamis-${item.week}" value="${AppConfig.escapeHtml(item.kamis || '')}" required></td>
      </tr>
    `).join('');
    modalWrap.innerHTML = `
      <div class="modal-overlay active" id="modal-habits-overlay">
        <div class="modal sched-modal-dialog-lg">
          <div class="modal-header">
            <h3 class="modal-title"><i class="ph ph-sparkle"></i> Kelola Siklus Pembiasaan Sekolah</h3>
            <button type="button" class="btn-icon" id="btn-close-habits-modal"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-habits-settings">
            <div class="modal-body sched-modal-form">
              <p class="text-sm text-muted">Agenda pembiasaan karakter jam ke-0 (07.00 - 07.30 WIB) berlaku untuk siklus 5 pekan. Perubahan tersimpan secara terpusat (SSOT) di Realtime Database.</p>
              <div class="sched-habit-modal-block">
                <h4 class="sched-section-subtitle"><i class="ph ph-sparkle"></i> Siklus Pembiasaan Kelas 1 - 3 (Fase A &amp; B Awal)</h4>
                <div class="table-responsive">
                  <table class="sched-habit-edit-table">
                    <thead>
                      <tr>
                        <th class="sched-th-week">Pekan</th>
                        <th>Senin</th>
                        <th>Selasa</th>
                        <th>Rabu</th>
                        <th>Kamis</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${renderRows(lower, 'lower')}
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="sched-habit-modal-block">
                <h4 class="sched-section-subtitle"><i class="ph ph-sparkle"></i> Siklus Pembiasaan Kelas 4 - 6 (Fase B Atas &amp; C)</h4>
                <div class="table-responsive">
                  <table class="sched-habit-edit-table">
                    <thead>
                      <tr>
                        <th class="sched-th-week">Pekan</th>
                        <th>Senin</th>
                        <th>Selasa</th>
                        <th>Rabu</th>
                        <th>Kamis</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${renderRows(upper, 'upper')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="modal-footer sched-modal-footer-flex">
              <button type="button" class="btn btn-outline" id="btn-cancel-habits-modal">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-habits-modal"><i class="ph ph-floppy-disk"></i> Simpan Jadwal Pembiasaan</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const closeModal = () => { modalWrap.innerHTML = ''; };
    const overlay = modalWrap.querySelector('#modal-habits-overlay');
    const btnClose = modalWrap.querySelector('#btn-close-habits-modal');
    const btnCancel = modalWrap.querySelector('#btn-cancel-habits-modal');
    const form = modalWrap.querySelector('#form-habits-settings');
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedLower = lower.map(item => ({
          week: item.week,
          senin: (form.querySelector(`#lower-senin-${item.week}`)?.value || '').trim(),
          selasa: (form.querySelector(`#lower-selasa-${item.week}`)?.value || '').trim(),
          rabu: (form.querySelector(`#lower-rabu-${item.week}`)?.value || '').trim(),
          kamis: (form.querySelector(`#lower-kamis-${item.week}`)?.value || '').trim()
        }));
        const updatedUpper = upper.map(item => ({
          week: item.week,
          senin: (form.querySelector(`#upper-senin-${item.week}`)?.value || '').trim(),
          selasa: (form.querySelector(`#upper-selasa-${item.week}`)?.value || '').trim(),
          rabu: (form.querySelector(`#upper-rabu-${item.week}`)?.value || '').trim(),
          kamis: (form.querySelector(`#upper-kamis-${item.week}`)?.value || '').trim()
        }));
        const newHabits = { lower: updatedLower, upper: updatedUpper };
        try {
          await DB.saveScheduleSettings({ habits: newHabits });
          this.habituationData = newHabits;
          closeModal();
          const view = document.getElementById('sched-content-view');
          if (view) this.renderPembiasaanView(view);
          alert('Jadwal pembiasaan berhasil disimpan ke database.');
        } catch (err) {
          alert('Gagal menyimpan: ' + err.message);
        }
      });
    }
  },
  openUniformsModal() {
    const modalWrap = document.getElementById('sched-modal-container');
    if (!modalWrap) return;
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"];
    const inputsHtml = days.map(d => `
      <div class="form-group compact-field">
        <label>Seragam Hari ${d} <span class="text-danger">*</span></label>
        <input type="text" id="uniform-${d}" class="form-input" value="${AppConfig.escapeHtml(this.uniforms[d] || '')}" required>
      </div>
    `).join('');
    modalWrap.innerHTML = `
      <div class="modal-overlay active" id="modal-uniforms-overlay">
        <div class="modal sched-modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title"><i class="ph ph-t-shirt"></i> Kelola Ketentuan Seragam Sekolah</h3>
            <button type="button" class="btn-icon" id="btn-close-uniforms"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-uniforms">
            <div class="modal-body sched-modal-form">
              <p class="text-sm text-muted">Pengaturan seragam ini tersimpan secara terpusat (SSOT) di Realtime Database dan langsung disinkronkan ke seluruh jadwal pelajaran rombel serta jadwal pembiasaan.</p>
              ${inputsHtml}
            </div>
            <div class="modal-footer sched-modal-footer-flex">
              <button type="button" class="btn btn-outline" id="btn-cancel-uniforms">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-uniforms"><i class="ph ph-floppy-disk"></i> Simpan Ketentuan Seragam</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const closeModal = () => { modalWrap.innerHTML = ''; };
    const overlay = modalWrap.querySelector('#modal-uniforms-overlay');
    const btnClose = modalWrap.querySelector('#btn-close-uniforms');
    const btnCancel = modalWrap.querySelector('#btn-cancel-uniforms');
    const form = modalWrap.querySelector('#form-uniforms');
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updated = {};
        days.forEach(d => {
          const inp = form.querySelector(`#uniform-${d}`);
          if (inp) updated[d] = inp.value.trim();
        });
        if (updated["Jum'at"]) updated['Jumat'] = updated["Jum'at"];
        try {
          await DB.saveScheduleSettings({ uniforms: updated });
          this.uniforms = { ...this.uniforms, ...updated };
          closeModal();
          const view = document.getElementById('sched-content-view');
          if (view) {
            if (this.currentTab === 'rombel') this.renderRombelView(view);
            else if (this.currentTab === 'pembiasaan') this.renderHabitsView(view);
          }
          alert('Ketentuan seragam berhasil disimpan ke database.');
        } catch (err) {
          alert('Gagal menyimpan: ' + err.message);
        }
      });
    }
  },
  async seedTsvData() {
    if (!isDBReady()) return;
    const snap = await db.ref('curriculum/master_template').once('value');
    const template = snap.val();
    if (!template || !Object.keys(template).length) {
      alert('Template master belum tersedia di database RTDB.');
      return;
    }
    await db.ref('curriculum/schedules').set(template);
  }
};
window.ScheduleManager = ScheduleManager;