const ManagementPages = {
  getRoleMode(role = Auth.currentRole) {
    const currentRole = role || AppConfig.ROLES.ADMIN;
    const readOnlyRoles = [AppConfig.ROLES.KEPSEK, AppConfig.ROLES.GURU, AppConfig.ROLES.ORTU];

    return {
      role: currentRole,
      isAdmin: currentRole === AppConfig.ROLES.ADMIN,
      isReadOnly: readOnlyRoles.includes(currentRole),
      isKepsek: currentRole === AppConfig.ROLES.KEPSEK,
      isGuru: currentRole === AppConfig.ROLES.GURU,
      isOrtu: currentRole === AppConfig.ROLES.ORTU
    };
  },

  async renderModule(container, moduleName, options = {}) {
    const safeName = moduleName || 'dashboard';
    const role = options.role || Auth.currentRole || AppConfig.ROLES.ADMIN;
    const readOnly = Boolean(options.readOnly) || this.getRoleMode(role).isReadOnly;
    const titleMap = {
      finance: 'Keuangan',
      curriculum: 'Kurikulum',
      'student-affairs': 'Kesiswaan',
      personnel: 'Humas & Personalia',
      facilities: 'Sarana & Prasarana'
    };

    const descriptionMap = {
      finance: 'Dashboard keuangan sekolah, tagihan, kas, dan laporan.',
      curriculum: 'Kurikulum, jadwal, mata pelajaran, dan capaian pembelajaran.',
      'student-affairs': 'Data siswa, kelas, kehadiran, prestasi, dan kegiatan siswa.',
      personnel: 'Data pegawai, struktur organisasi, kehadiran, dan humas sekolah.',
      facilities: 'Inventaris, aset, ruangan, pemeliharaan, dan sarana sekolah.'
    };

    Router.setTitle(titleMap[safeName] || 'Modul', descriptionMap[safeName] || 'Ringkasan modul management sekolah.');

    const modules = {
      finance: this.renderFinance,
      curriculum: this.renderCurriculum,
      'student-affairs': this.renderStudentAffairs,
      personnel: this.renderPersonnel,
      facilities: this.renderFacilities
    };

    const renderer = modules[safeName] || this.renderComingSoon;
    await renderer.call(this, container, readOnly);
  },

  renderComingSoon(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Modul ini sedang dikembangkan</h2>
          <p class="text-muted">Fitur utama akan disesuaikan dengan arsitektur multi-management sekolah yang tertuang di upgrade.md.</p>
        </div>
      </div>
    `;
  },

  formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  },

  getMonthKey(value) {
    return (value || '').toString().slice(0, 7);
  },

  getMonthOptions(selectedMonth, dates = []) {
    const uniqueMonths = Array.from(new Set([
      ...dates.map((item) => this.getMonthKey(item)).filter(Boolean),
      selectedMonth
    ].filter(Boolean))).sort((a, b) => b.localeCompare(a));

    if (!uniqueMonths.length) {
      return `<option value="${selectedMonth}" selected>${selectedMonth}</option>`;
    }

    return uniqueMonths.map((month) => `
      <option value="${month}" ${month === selectedMonth ? 'selected' : ''}>${month}</option>
    `).join('');
  },

  countAttendanceForClass(classId, classStudents, attendanceMap) {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpha = 0;

    classStudents.forEach((student) => {
      const status = attendanceMap[student.id];
      if (status === 'H') hadir += 1;
      else if (status === 'S') sakit += 1;
      else if (status === 'I') izin += 1;
      else if (status === 'A') alpha += 1;
    });

    return { hadir, sakit, izin, alpha };
  },

  bindFormSubmit(formId, handler) {
    const form = document.getElementById(formId);
    if (form) {
      form.addEventListener('submit', handler);
    }
  },

  renderMetricCards(items = []) {
    if (!items.length) {
      return '<div class="text-muted">Belum ada data.</div>';
    }

    return `
      <div class="stats-grid compact">
        ${items.map((item) => `
          <div class="stat-card ${item.tone || 'primary'}">
            <div class="stat-label">${item.label}</div>
            <div class="stat-value">${item.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderList(items = [], emptyMessage = 'Belum ada data.') {
    if (!items.length) {
      return `<li class="text-muted">${emptyMessage}</li>`;
    }

    return items.map((item) => `
      <li class="list-row">
        <span>${item.label}</span>
        ${item.badge ? `<span class="badge badge-primary">${item.badge}</span>` : ''}
      </li>
    `).join('');
  },

  renderModuleLinks(currentModule = '', links = []) {
    const fallbackLinks = [
      { href: '#/finance', label: 'Keuangan' },
      { href: '#/curriculum', label: 'Kurikulum' },
      { href: '#/student-affairs', label: 'Kesiswaan' },
      { href: '#/personnel', label: 'Personalia' },
      { href: '#/facilities', label: 'Sarpras' }
    ];

    const normalizedLinks = (links.length ? links : fallbackLinks)
      .filter((link) => link && link.href && link.href !== `#/${currentModule}`);

    return `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tautan cepat</h3>
          <div class="quick-inline">
            ${normalizedLinks.map((link) => `
              <a href="${link.href}" class="btn btn-sm btn-outline">${link.label}</a>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  async renderFinance(container, selectedMonth = null, readOnly = false) {
    const mode = this.getRoleMode();
    const isReadOnly = readOnly || mode.isReadOnly;
    const [summary, entriesData, studentBillsData, studentsData] = await Promise.all([
      DB.getFinanceSummary(),
      DB.getFinanceLedger(),
      DB.getStudentBills(),
      DB.getAllStudents()
    ]);

    const entries = DB.toArray(entriesData).sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateB.localeCompare(dateA);
    });

    const bills = DB.toArray(studentBillsData).sort((a, b) => {
      const dateA = a.dueDate || '';
      const dateB = b.dueDate || '';
      return dateB.localeCompare(dateA);
    });

    const students = DB.toArray(studentsData);
    const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthFilter = selectedMonth || currentMonth;
    const availableMonths = this.getMonthOptions(monthFilter, entries.map((entry) => entry.date));

    const filteredEntries = entries.filter((entry) => !entry.date || (entry.date || '').startsWith(monthFilter));
    const monthlySummary = filteredEntries.reduce((acc, entry) => {
      const amount = Number(entry.amount || 0);
      if (entry.type === 'income') acc.income += amount;
      if (entry.type === 'expense') acc.expense += amount;
      return acc;
    }, { income: 0, expense: 0, net: 0 });
    monthlySummary.net = monthlySummary.income - monthlySummary.expense;

    const monthlyByCategory = filteredEntries.reduce((acc, entry) => {
      const key = entry.category || 'Umum';
      const amount = Number(entry.amount || 0);
      if (!acc[key]) acc[key] = { income: 0, expense: 0 };
      if (entry.type === 'income') acc[key].income += amount;
      if (entry.type === 'expense') acc[key].expense += amount;
      return acc;
    }, {});

    const rows = entries.slice(0, 10).map((entry) => {
      const label = entry.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
      return `
        <tr>
          <td>${entry.date || '-'}</td>
          <td>${label}</td>
          <td>${entry.category || 'Umum'}</td>
          <td>${entry.description || '-'}</td>
          <td class="text-right ${entry.type === 'income' ? 'text-success' : 'text-danger'}">${this.formatCurrency(entry.amount)}</td>
        </tr>
      `;
    }).join('');

    const studentBillRows = bills.length ? bills.map((bill) => {
      const student = studentMap[bill.studentId] || {};
      const isPaid = bill.status === 'paid';
      return `
        <tr>
          <td>${student.name || bill.studentName || '-'}</td>
          <td>${bill.dueDate || '-'}</td>
          <td>${this.formatCurrency(bill.amount)}</td>
          <td><span class="badge ${isPaid ? 'badge-success' : 'badge-warning'}">${isPaid ? 'Lunas' : 'Belum Bayar'}</span></td>
          <td>
            <button type="button" class="btn btn-sm ${isPaid ? 'btn-outline' : 'btn-primary'}" data-bill-pay="${bill.id}" ${isPaid ? 'disabled' : ''}>
              ${isPaid ? 'Lunas' : 'Bayar'}
            </button>
          </td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="5" class="text-muted">Belum ada tagihan siswa.</td></tr>';

    const monthlyRows = Object.entries(monthlyByCategory).map(([category, values]) => `
      <tr>
        <td>${category}</td>
        <td>${this.formatCurrency(values.income)}</td>
        <td>${this.formatCurrency(values.expense)}</td>
        <td>${this.formatCurrency(values.income - values.expense)}</td>
      </tr>
    `).join('') || '<tr><td colspan="4" class="text-muted">Belum ada data transaksi untuk bulan ini.</td></tr>';

    const reportMonthOptions = this.getMonthOptions(monthFilter, entries.map((entry) => entry.date));

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card success"><div class="stat-label">Pemasukan</div><div class="stat-value">${this.formatCurrency(summary.income)}</div></div>
        <div class="stat-card danger"><div class="stat-label">Pengeluaran</div><div class="stat-value">${this.formatCurrency(summary.expense)}</div></div>
        <div class="stat-card primary"><div class="stat-label">Saldo</div><div class="stat-value">${this.formatCurrency(summary.net)}</div></div>
        <div class="stat-card warning"><div class="stat-label">Tagihan siswa</div><div class="stat-value">${bills.length}</div></div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <div class="toolbar-inline">
            <h3 class="card-title">Laporan keuangan bulanan</h3>
            <select id="finance-report-month" class="toolbar-select">
              ${reportMonthOptions}
            </select>
          </div>

          <div class="stats-grid compact">
            <div class="stat-card success"><div class="stat-label">Pemasukan bulan</div><div class="stat-value">${this.formatCurrency(monthlySummary.income)}</div></div>
            <div class="stat-card danger"><div class="stat-label">Pengeluaran bulan</div><div class="stat-value">${this.formatCurrency(monthlySummary.expense)}</div></div>
            <div class="stat-card primary"><div class="stat-label">Saldo bulan</div><div class="stat-value">${this.formatCurrency(monthlySummary.net)}</div></div>
          </div>

          <div class="table-wrap" style="margin-top: 18px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Pemasukan</th>
                  <th>Pengeluaran</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>${monthlyRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      ${isReadOnly ? `
        <div class="card section-block">
          <div class="card-body">
            <p class="text-muted">Mode lihat saja: admin bertugas mengelola input keuangan, sedangkan peran lain hanya memantau ringkasan dan laporan.</p>
          </div>
        </div>
      ` : `
        <div class="card section-block">
          <div class="card-body">
            <h3 class="card-title">Tambah transaksi</h3>
            <form id="finance-form" class="form-grid">
              <div class="form-group">
                <label for="finance-date">Tanggal</label>
                <input id="finance-date" type="date" value="${new Date().toISOString().slice(0, 10)}" required>
              </div>
              <div class="form-group">
                <label for="finance-type">Jenis</label>
                <select id="finance-type" required>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>
              <div class="form-group">
                <label for="finance-category">Kategori</label>
                <input id="finance-category" type="text" value="Umum" placeholder="Contoh: SPP, ATK, Honor" required>
              </div>
              <div class="form-group">
                <label for="finance-amount">Nominal</label>
                <input id="finance-amount" type="number" min="0" step="1000" placeholder="0" required>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label for="finance-description">Keterangan</label>
                <input id="finance-description" type="text" placeholder="Contoh: Pembayaran SPP bulan September" required>
              </div>
              <div style="grid-column: 1 / -1;">
                <button type="submit" class="btn btn-primary">Simpan transaksi</button>
              </div>
            </form>
          </div>
        </div>

        <div class="card section-block">
          <div class="card-body">
            <h3 class="card-title">Tagihan siswa</h3>
            <form id="student-bill-form" class="form-grid">
              <div class="form-group">
                <label for="bill-student">Siswa</label>
                <select id="bill-student" required>
                  <option value="">Pilih siswa</option>
                  ${students.map((student) => `<option value="${student.id}">${student.name} (${student.nis || '-'})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="bill-amount">Nominal</label>
                <input id="bill-amount" type="number" min="0" step="500" placeholder="500000" required>
              </div>
              <div class="form-group">
                <label for="bill-due-date">Jatuh Tempo</label>
                <input id="bill-due-date" type="date" value="${new Date().toISOString().slice(0, 10)}" required>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label for="bill-note">Keterangan</label>
                <input id="bill-note" type="text" placeholder="Contoh: SPP bulan Juni" required>
              </div>
              <div style="grid-column: 1 / -1;">
                <button type="submit" class="btn btn-primary">Buat tagihan</button>
              </div>
            </form>

            <div class="table-wrap" style="margin-top: 18px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Jatuh Tempo</th>
                  <th>Nominal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>${studentBillRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Transaksi terbaru</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jenis</th>
                  <th>Kategori</th>
                  <th>Keterangan</th>
                  <th class="text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="5" class="text-muted">Belum ada transaksi.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `}

      ${this.renderModuleLinks('finance', [
        { href: '#/curriculum', label: 'Kurikulum' },
        { href: '#/student-affairs', label: 'Kesiswaan' },
        { href: '#/personnel', label: 'Personalia' },
        { href: '#/facilities', label: 'Sarpras' }
      ])}
    `;

    this.bindFormSubmit('finance-form', async (event) => {
      event.preventDefault();
      const payload = {
        date: document.getElementById('finance-date').value,
        type: document.getElementById('finance-type').value,
        category: document.getElementById('finance-category').value,
        description: document.getElementById('finance-description').value,
        amount: document.getElementById('finance-amount').value
      };

      if (!payload.date || !payload.category || !payload.description || !payload.amount) {
        return;
      }

      await DB.saveFinanceEntry(payload);
      await this.renderFinance(container, monthFilter);
    });

    const financeReportMonth = document.getElementById('finance-report-month');
    if (financeReportMonth) {
      financeReportMonth.addEventListener('change', async (event) => {
        await this.renderFinance(container, event.target.value || currentMonth);
      });
    }

    const billForm = document.getElementById('student-bill-form');
    if (billForm) {
      billForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const studentId = document.getElementById('bill-student').value;
        const amount = Number(document.getElementById('bill-amount').value || 0);
        const dueDate = document.getElementById('bill-due-date').value;
        const note = document.getElementById('bill-note').value.trim();

        if (!studentId || !amount || !dueDate || !note) return;

        const student = studentMap[studentId];
        await DB.saveStudentBill({
          studentId,
          studentName: student?.name || '',
          amount,
          dueDate,
          status: 'pending',
          note
        });

        await this.renderFinance(container);
      });
    }

    container.querySelectorAll('[data-bill-pay]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const billId = btn.getAttribute('data-bill-pay');
        if (!billId) return;
        await DB.markStudentBillPaid(billId);
        await this.renderFinance(container, monthFilter);
      });
    });
  },

  async renderCurriculum(container) {
    const [settings, subjects, classes, students] = await Promise.all([
      DB.getSettings(),
      DB.getSubjects(),
      DB.getClasses(),
      DB.getAllStudents()
    ]);

    const subArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
    const classArr = DB.toArray(classes).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const studentArr = DB.toArray(students);
    const currentYear = settings?.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
    const currentSemester = settings?.currentSemester || AppConfig.DEFAULT_SETTINGS.currentSemester;

    const subjectSummary = {
      standar: 0,
      agama: 0,
      lokal: 0,
      kekhasan: 0
    };

    subArr.forEach((item) => {
      const key = item.category || 'standar';
      if (subjectSummary[key] !== undefined) subjectSummary[key] += 1;
    });

    const categoryLabel = {
      standar: 'Umum',
      agama: 'Agama',
      lokal: 'Muatan Lokal',
      kekhasan: 'Kekhasan'
    };

    const subjectList = subArr.length ? subArr.slice(0, 8).map((subject) => `
      <li class="list-row">
        <span>${subject.name}</span>
        <span class="badge badge-primary">${categoryLabel[subject.category] || subject.category || 'Umum'}</span>
      </li>
    `).join('') : '<li class="text-muted">Belum ada mata pelajaran.</li>';

    const curriculumSummary = this.renderMetricCards([
      { label: 'Tahun Ajaran', value: currentYear, tone: 'primary' },
      { label: 'Semester', value: currentSemester, tone: 'warning' },
      { label: 'Mata Pelajaran', value: subArr.length, tone: 'success' },
      { label: 'Kelas', value: classArr.length, tone: 'info' }
    ]);

    const agendaItems = [
      { label: `Mata pelajaran aktif: ${subArr.length}`, badge: 'Mapel' },
      { label: `Kelas terdaftar: ${classArr.length}`, badge: 'Kelas' },
      { label: `Siswa terdata: ${studentArr.length}`, badge: 'Siswa' },
      { label: `Mapel umum: ${subjectSummary.standar}`, badge: 'Umum' }
    ];

    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Ringkasan kurikulum</h3>
          ${curriculumSummary}
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Master mata pelajaran</h3>
          <ul class="list-plain">${subjectList}</ul>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Agenda kurikulum</h3>
          <ul class="list-plain">${this.renderList(agendaItems, 'Belum ada agenda kurikulum.')}</ul>
        </div>
      </div>

      ${this.renderModuleLinks('curriculum', [
        { href: '#/finance', label: 'Keuangan' },
        { href: '#/student-affairs', label: 'Kesiswaan' },
        { href: '#/personnel', label: 'Personalia' },
        { href: '#/facilities', label: 'Sarpras' }
      ])}
    `;
  },

  async renderStudentAffairs(container) {
    const [classes, students, users, achievementsData, extracurricularsData, violationsData] = await Promise.all([
      DB.getClasses(),
      DB.getAllStudents(),
      DB.getAllUsers(),
      DB.getStudentAchievements(),
      DB.getExtracurriculars(),
      DB.getStudentViolations()
    ]);

    const classArr = DB.toArray(classes).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const studentArr = DB.toArray(students).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const userArr = DB.toArray(users);
    const achievements = DB.toArray(achievementsData).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const extracurriculars = DB.toArray(extracurricularsData).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const violations = DB.toArray(violationsData).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const teacherMap = Object.fromEntries(userArr.map((user) => [user.id, user]));
    const parentMap = Object.fromEntries(userArr.filter((user) => user.role === AppConfig.ROLES.ORTU).map((user) => [user.id, user]));
    const classMap = Object.fromEntries(classArr.map((cls) => [cls.id, cls]));
    const defaultDate = new Date().toISOString().slice(0, 10);
    const currentMonth = defaultDate.slice(0, 7);
    const availableMonths = Array.from(new Set([
      ...achievements.map((item) => (item.date || '').slice(0, 7)).filter(Boolean),
      ...violations.map((item) => (item.date || '').slice(0, 7)).filter(Boolean),
      ...studentArr.map((student) => (student.createdAt || '').toString().slice(0, 7)).filter(Boolean),
      currentMonth
    ])).sort((a, b) => b.localeCompare(a));
    const monthFilter = currentMonth;
    const dailyAttendance = await DB.getDailyStudentAttendanceByDate(defaultDate);

    const activeStudents = studentArr.filter((s) => s.status === 'aktif' || !s.status).length;
    const attendanceRatio = studentArr.length ? Math.min(100, Math.round((activeStudents / studentArr.length) * 100)) : 0;
    const teacherCount = userArr.filter((u) => u.role === AppConfig.ROLES.GURU).length;
    const linkedParentCount = studentArr.filter((s) => s.parentId && parentMap[s.parentId]).length;
    const monthAchievements = achievements.filter((item) => (item.date || '').startsWith(monthFilter));
    const monthViolations = violations.filter((item) => (item.date || '').startsWith(monthFilter));
    const monthAttendanceRate = attendanceRatio;

    const renderStudentList = () => {
      const filterValue = document.getElementById('student-affairs-class-filter')?.value || 'all';
      const filteredStudents = filterValue === 'all'
        ? studentArr
        : studentArr.filter((student) => student.classId === filterValue);

      const rows = filteredStudents.length ? filteredStudents.slice(0, 10).map((student) => {
        const cls = classMap[student.classId];
        const parent = parentMap[student.parentId];
        return `
          <tr>
            <td>${student.nis || '-'}</td>
            <td>${student.name || '-'}</td>
            <td>${cls ? cls.name : '-'}</td>
            <td>${student.status === 'aktif' || !student.status ? 'Aktif' : (student.status || 'Nonaktif')}</td>
            <td>${parent ? parent.name : '<span class="text-muted">Belum tertaut</span>'}</td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="5" class="text-muted">Tidak ada data siswa pada filter ini.</td></tr>';

      const target = document.getElementById('student-affairs-table-body');
      if (target) target.innerHTML = rows;
    };

    const renderAttendanceRows = (selectedDate) => {
      const attendanceData = dailyAttendance || {};
      const rows = classArr.map((cls) => {
        const classStudents = studentArr.filter((student) => student.classId === cls.id);
        const studentsByClass = attendanceData[cls.id] || {};
        const counts = this.countAttendanceForClass(cls.id, classStudents, studentsByClass);

        return `
          <tr>
            <td>${cls.name}</td>
            <td>${counts.hadir}</td>
            <td>${counts.sakit}</td>
            <td>${counts.izin}</td>
            <td>${counts.alpha}</td>
            <td>${classStudents.length}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="6" class="text-muted">Belum ada absensi siswa.</td></tr>';

      const target = document.getElementById('student-affairs-attendance-body');
      if (target) target.innerHTML = rows;

      const label = document.getElementById('student-affairs-attendance-date-label');
      if (label) label.textContent = `Rekap absensi ${selectedDate}`;
    };

    const classCards = classArr.length ? classArr.map((cls) => {
      const count = studentArr.filter((student) => student.classId === cls.id).length;
      const teacher = teacherMap[cls.teacherId];
      return `
        <div class="card section-block">
          <div class="card-body">
            <div class="toolbar-inline">
              <div>
                <strong>${cls.name || '-'}</strong>
                <div class="text-muted">${teacher ? teacher.name : 'Wali belum ditetapkan'}</div>
              </div>
              <span class="badge badge-primary">${count} siswa</span>
            </div>
          </div>
        </div>
      `;
    }).join('') : '<div class="text-muted">Belum ada data kelas.</div>';

    const achievementRows = achievements.length ? achievements.slice(0, 6).map((item) => {
      const student = studentArr.find((s) => s.id === item.studentId);
      return `
        <tr>
          <td>${student ? student.name : item.studentName || '-'}</td>
          <td>${item.title || '-'}</td>
          <td>${item.category || 'Umum'}</td>
          <td>${item.date || '-'}</td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="4" class="text-muted">Belum ada prestasi siswa.</td></tr>';

    const violationRows = violations.length ? violations.slice(0, 6).map((item) => {
      const student = studentArr.find((s) => s.id === item.studentId);
      return `
        <tr>
          <td>${student ? student.name : item.studentName || '-'}</td>
          <td>${item.title || '-'}</td>
          <td>${item.category || 'Kedisiplinan'}</td>
          <td>${item.date || '-'}</td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="4" class="text-muted">Belum ada pelanggaran siswa.</td></tr>';

    const monthlyReportOptions = availableMonths.map((month) => `
      <option value="${month}" ${month === monthFilter ? 'selected' : ''}>${month}</option>
    `).join('');

    const renderMonthSummary = (selectedMonth) => {
      const monthAchievementsCount = achievements.filter((item) => (item.date || '').startsWith(selectedMonth)).length;
      const monthViolationsCount = violations.filter((item) => (item.date || '').startsWith(selectedMonth)).length;
      const target = document.getElementById('student-affairs-month-summary');
      if (!target) return;

      target.innerHTML = `
        <div class="stats-grid compact">
          <div class="stat-card success"><div class="stat-label">Prestasi</div><div class="stat-value">${monthAchievementsCount}</div></div>
          <div class="stat-card danger"><div class="stat-label">Pelanggaran</div><div class="stat-value">${monthViolationsCount}</div></div>
          <div class="stat-card warning"><div class="stat-label">Kehadiran</div><div class="stat-value">${attendanceRatio}%</div></div>
        </div>
      `;
    };

    const extracurricularRows = extracurriculars.length ? extracurriculars.slice(0, 6).map((item) => `
      <li class="list-row">
        <span>${item.name || '-'}</span>
        <span class="badge badge-primary">${item.teacherId ? 'Aktif' : 'Master'}</span>
      </li>
    `).join('') : '<li class="text-muted">Belum ada data ekstrakurikuler.</li>';

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card primary"><div class="stat-label">Siswa</div><div class="stat-value">${studentArr.length}</div></div>
        <div class="stat-card success"><div class="stat-label">Kelas</div><div class="stat-value">${classArr.length}</div></div>
        <div class="stat-card warning"><div class="stat-label">Kehadiran</div><div class="stat-value">${attendanceRatio}%</div></div>
        <div class="stat-card danger"><div class="stat-label">Guru Wali</div><div class="stat-value">${teacherCount}</div></div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Data kesiswaan utama</h3>
          <ul class="list-plain">
            <li>Jumlah siswa aktif: <strong>${activeStudents}</strong></li>
            <li>Jumlah orang tua yang tertaut: <strong>${linkedParentCount}</strong></li>
            <li>Jumlah rombel: <strong>${classArr.length}</strong></li>
            <li>Prestasi, pelanggaran, dan ekstrakurikuler kini sudah terintegrasi dengan data siswa.</li>
          </ul>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Rombel</h3>
          ${classCards}
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <div class="toolbar-inline">
            <h3 class="card-title">Laporan kesiswaan bulanan</h3>
            <select id="student-affairs-month-filter" class="toolbar-select">
              ${monthlyReportOptions}
            </select>
          </div>

          <div id="student-affairs-month-summary">
            <div class="stats-grid compact">
              <div class="stat-card success"><div class="stat-label">Prestasi</div><div class="stat-value">${monthAchievements.length}</div></div>
              <div class="stat-card danger"><div class="stat-label">Pelanggaran</div><div class="stat-value">${monthViolations.length}</div></div>
              <div class="stat-card warning"><div class="stat-label">Kehadiran</div><div class="stat-value">${monthAttendanceRate}%</div></div>
            </div>
          </div>
        </div>
      </div>

      ${isReadOnly ? `
        <div class="card section-block">
          <div class="card-body">
            <p class="text-muted">Mode lihat saja: admin mengelola data prestasi dan kesiswaan, sementara guru atau orang tua hanya memantau perkembangan siswa.</p>
          </div>
        </div>
      ` : `
        <div class="card section-block">
          <div class="card-body">
            <h3 class="card-title">Prestasi siswa</h3>
            <form id="student-affairs-achievement-form" class="form-grid">
              <div class="form-group">
                <label for="achievement-student">Siswa</label>
                <select id="achievement-student" required>
                  <option value="">Pilih siswa</option>
                  ${studentArr.map((student) => `<option value="${student.id}">${student.name} (${student.nis || '-'})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="achievement-category">Kategori</label>
                <select id="achievement-category" required>
                  <option value="Akademik">Akademik</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Seni">Seni</option>
                  <option value="Keagamaan">Keagamaan</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>
              <div class="form-group">
                <label for="achievement-title">Judul prestasi</label>
                <input id="achievement-title" type="text" placeholder="Contoh: Juara 1 Lomba Coding" required>
              </div>
              <div class="form-group">
                <label for="achievement-date">Tanggal</label>
                <input id="achievement-date" type="date" value="${defaultDate}" required>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label for="achievement-description">Keterangan</label>
                <textarea id="achievement-description" rows="2" placeholder="Deskripsi singkat prestasi..." required></textarea>
              </div>
              <div style="grid-column: 1 / -1;">
                <button type="submit" class="btn btn-primary">Tambah prestasi</button>
              </div>
            </form>

            <div class="table-wrap" style="margin-top: 18px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Prestasi</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>${achievementRows}</tbody>
            </table>
          </div>
        </div>
      `}

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Ekstrakurikuler</h3>
          <ul class="list-plain">${extracurricularRows}</ul>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <div class="toolbar-inline">
            <h3 class="card-title">Daftar siswa</h3>
            <select id="student-affairs-class-filter" class="toolbar-select">
              <option value="all">Semua kelas</option>
              ${classArr.map((cls) => `<option value="${cls.id}">${cls.name}</option>`).join('')}
            </select>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>NIS</th>
                  <th>Nama</th>
                  <th>Kelas</th>
                  <th>Status</th>
                  <th>Orang Tua</th>
                </tr>
              </thead>
              <tbody id="student-affairs-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <div class="toolbar-inline">
            <h3 id="student-affairs-attendance-date-label" class="card-title">Rekap absensi ${defaultDate}</h3>
            <input id="student-affairs-attendance-date" type="date" class="toolbar-select" value="${defaultDate}">
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Kelas</th>
                  <th>H</th>
                  <th>S</th>
                  <th>I</th>
                  <th>A</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody id="student-affairs-attendance-body"></tbody>
            </table>
          </div>
        </div>
      </div>

      ${isReadOnly ? `
        <div class="card section-block">
          <div class="card-body">
            <p class="text-muted">Mode lihat saja: data pelanggaran dan prestasi dikelola oleh admin agar proses administrasi tetap terpusat dan tidak bercampur dengan tugas guru atau wali murid.</p>
          </div>
        </div>
      ` : `
        <div class="card section-block">
          <div class="card-body">
            <h3 class="card-title">Catat pelanggaran siswa</h3>
            <p class="text-muted">Data prestasi dan pelanggaran mengacu pada siswa yang sama, sehingga modul keuangan, kurikulum, dan kesiswaan dapat dibaca dari satu sumber yang konsisten.</p>
            <form id="student-affairs-violation-form" class="form-grid">
              <div class="form-group">
                <label for="violation-student">Siswa</label>
                <select id="violation-student" required>
                  <option value="">Pilih siswa</option>
                  ${studentArr.map((student) => `<option value="${student.id}">${student.name} (${student.nis || '-'})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="violation-category">Kategori</label>
                <select id="violation-category" required>
                  <option value="Kedisiplinan">Kedisiplinan</option>
                  <option value="Etika">Etika</option>
                  <option value="Sopan Santun">Sopan Santun</option>
                  <option value="Kehadiran">Kehadiran</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div class="form-group">
                <label for="violation-title">Judul pelanggaran</label>
                <input id="violation-title" type="text" placeholder="Contoh: Terlambat 3 hari" required>
              </div>
              <div class="form-group">
                <label for="violation-date">Tanggal</label>
                <input id="violation-date" type="date" value="${defaultDate}" required>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label for="violation-description">Keterangan</label>
                <textarea id="violation-description" rows="2" placeholder="Deskripsi pelanggaran..." required></textarea>
              </div>
              <div style="grid-column: 1 / -1;">
                <button type="submit" class="btn btn-primary">Catat pelanggaran</button>
              </div>
            </form>

            <div class="table-wrap" style="margin-top: 18px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>${violationRows}</tbody>
            </table>
          </div>
        </div>
      `}

      ${this.renderModuleLinks('student-affairs', [
        { href: '#/finance', label: 'Keuangan' },
        { href: '#/curriculum', label: 'Kurikulum' },
        { href: '#/personnel', label: 'Personalia' },
        { href: '#/facilities', label: 'Sarpras' }
      ])}
    `;

    renderStudentList();
    renderAttendanceRows(defaultDate);
    renderMonthSummary(monthFilter);

    const achievementForm = document.getElementById('student-affairs-achievement-form');
    if (achievementForm) {
      achievementForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const studentId = document.getElementById('achievement-student').value;
        const category = document.getElementById('achievement-category').value;
        const title = document.getElementById('achievement-title').value.trim();
        const description = document.getElementById('achievement-description').value.trim();
        const date = document.getElementById('achievement-date').value;

        if (!studentId || !title || !description || !date) return;

        const student = studentArr.find((item) => item.id === studentId);
        await DB.saveStudentAchievement({
          studentId,
          studentName: student ? student.name : '',
          category,
          title,
          description,
          date
        });

        await this.renderStudentAffairs(container);
      });
    }

    const studentAffairsMonthFilter = document.getElementById('student-affairs-month-filter');
    if (studentAffairsMonthFilter) {
      studentAffairsMonthFilter.addEventListener('change', (event) => {
        const nextMonth = event.target.value || currentMonth;
        renderMonthSummary(nextMonth);
      });
    }

    const violationForm = document.getElementById('student-affairs-violation-form');
    if (violationForm) {
      violationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const studentId = document.getElementById('violation-student').value;
        const category = document.getElementById('violation-category').value;
        const title = document.getElementById('violation-title').value.trim();
        const description = document.getElementById('violation-description').value.trim();
        const date = document.getElementById('violation-date').value;

        if (!studentId || !title || !description || !date) return;

        const student = studentArr.find((item) => item.id === studentId);
        await DB.saveStudentViolation({
          studentId,
          studentName: student ? student.name : '',
          category,
          title,
          description,
          date
        });

        await this.renderStudentAffairs(container);
      });
    }

    const classFilter = document.getElementById('student-affairs-class-filter');
    if (classFilter) {
      classFilter.addEventListener('change', renderStudentList);
    }

    const attendanceDate = document.getElementById('student-affairs-attendance-date');
    if (attendanceDate) {
      attendanceDate.addEventListener('change', async () => {
        const selectedDate = attendanceDate.value || defaultDate;
        const nextAttendance = await DB.getDailyStudentAttendanceByDate(selectedDate);
        const attendanceTarget = document.getElementById('student-affairs-attendance-body');
        if (!attendanceTarget) return;

        const rows = classArr.map((cls) => {
          const classStudents = studentArr.filter((student) => student.classId === cls.id);
          const studentsByClass = nextAttendance[cls.id] || {};
          const counts = this.countAttendanceForClass(cls.id, classStudents, studentsByClass);

          return `
            <tr>
              <td>${cls.name}</td>
              <td>${counts.hadir}</td>
              <td>${counts.sakit}</td>
              <td>${counts.izin}</td>
              <td>${counts.alpha}</td>
              <td>${classStudents.length}</td>
            </tr>
          `;
        }).join('') || '<tr><td colspan="6" class="text-muted">Belum ada absensi siswa.</td></tr>';

        attendanceTarget.innerHTML = rows;
        const label = document.getElementById('student-affairs-attendance-date-label');
        if (label) label.textContent = `Rekap absensi ${selectedDate}`;
      });
    }
  },

  async renderPersonnel(container) {
    const [users, employeesData, announcementsData] = await Promise.all([
      DB.getAllUsers(),
      DB.getPersonnelDirectory(),
      DB.getPersonnelAnnouncements()
    ]);

    const userArr = DB.toArray(users);
    const employeeArr = DB.toArray(employeesData).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const announcementArr = DB.toArray(announcementsData).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const teacherCount = userArr.filter((u) => u.role === AppConfig.ROLES.GURU).length;
    const adminCount = userArr.filter((u) => u.role === AppConfig.ROLES.ADMIN).length;
    const kepsekCount = userArr.filter((u) => u.role === AppConfig.ROLES.KEPSEK).length;
    const ortuCount = userArr.filter((u) => u.role === AppConfig.ROLES.ORTU).length;

    const staffOverview = [
      { label: 'Guru', value: teacherCount, tone: 'primary' },
      { label: 'Admin', value: adminCount, tone: 'success' },
      { label: 'Kepala Sekolah', value: kepsekCount, tone: 'warning' },
      { label: 'Orang Tua', value: ortuCount, tone: 'danger' }
    ];

    const summaryItems = [
      { label: 'Pegawai', value: employeeArr.length, tone: 'primary' },
      { label: 'Pengumuman', value: announcementArr.length, tone: 'success' },
      { label: 'User aktif', value: userArr.length, tone: 'warning' },
      { label: 'Jabatan terdaftar', value: new Set(employeeArr.map((employee) => employee.position || 'Umum')).size, tone: 'danger' }
    ];

    const employeeRows = employeeArr.length ? employeeArr.slice(0, 6).map((employee) => `
      <tr>
        <td>${employee.name || '-'}</td>
        <td>${employee.position || '-'}</td>
        <td>${employee.department || '-'}</td>
        <td>${employee.status || 'Aktif'}</td>
      </tr>
    `).join('') : '<tr><td colspan="4" class="text-muted">Belum ada data personel.</td></tr>';

    const announcementRows = announcementArr.length ? announcementArr.slice(0, 5).map((item) => `
      <li class="list-row">
        <span>${item.title || '-'}</span>
        <span class="text-muted">${item.date || '-'}</span>
      </li>
    `).join('') : '<li class="text-muted">Belum ada pengumuman.</li>';

    container.innerHTML = `
      <div class="stats-grid">
        ${staffOverview.map((item) => `
          <div class="stat-card ${item.tone}"><div class="stat-label">${item.label}</div><div class="stat-value">${item.value}</div></div>
        `).join('')}
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Ringkasan personalia</h3>
          ${this.renderMetricCards(summaryItems)}
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tambah pegawai</h3>
          <form id="personnel-employee-form" class="form-grid">
            <div class="form-group">
              <label for="personnel-employee-name">Nama</label>
              <input id="personnel-employee-name" type="text" placeholder="Nama pegawai" required>
            </div>
            <div class="form-group">
              <label for="personnel-employee-position">Jabatan</label>
              <input id="personnel-employee-position" type="text" placeholder="Contoh: Guru Matematika" required>
            </div>
            <div class="form-group">
              <label for="personnel-employee-department">Unit</label>
              <input id="personnel-employee-department" type="text" placeholder="Contoh: Kurikulum" required>
            </div>
            <div class="form-group">
              <label for="personnel-employee-status">Status</label>
              <select id="personnel-employee-status">
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Pensiun">Pensiun</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
            <div class="form-group">
              <label for="personnel-employee-phone">Telepon</label>
              <input id="personnel-employee-phone" type="text" placeholder="08xxx">
            </div>
            <div class="form-group">
              <label for="personnel-employee-email">Email</label>
              <input id="personnel-employee-email" type="email" placeholder="email@sekolah.sch.id">
            </div>
            <div style="grid-column: 1 / -1;">
              <button type="submit" class="btn btn-primary">Simpan pegawai</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Buat pengumuman</h3>
          <form id="personnel-announcement-form" class="form-grid">
            <div class="form-group">
              <label for="personnel-announcement-title">Judul</label>
              <input id="personnel-announcement-title" type="text" placeholder="Judul pengumuman" required>
            </div>
            <div class="form-group">
              <label for="personnel-announcement-date">Tanggal</label>
              <input id="personnel-announcement-date" type="date" value="${new Date().toISOString().slice(0, 10)}" required>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="personnel-announcement-description">Isi pengumuman</label>
              <textarea id="personnel-announcement-description" rows="3" placeholder="Isi pengumuman..." required></textarea>
            </div>
            <div style="grid-column: 1 / -1;">
              <button type="submit" class="btn btn-primary">Publikasikan</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Pengumuman</h3>
          <ul class="list-plain">${announcementRows}</ul>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Direktori personel</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${employeeRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Daftar pengguna yang terdaftar</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Peran</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                ${userArr.slice(0, 6).map((user) => `
                  <tr>
                    <td>${user.name || '-'}</td>
                    <td>${AppConfig.getRoleLabel(user.role)}</td>
                    <td>${user.email || '-'}</td>
                  </tr>
                `).join('') || '<tr><td colspan="3" class="text-muted">Belum ada data pengguna.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      ${this.renderModuleLinks('personnel', [
        { href: '#/finance', label: 'Keuangan' },
        { href: '#/curriculum', label: 'Kurikulum' },
        { href: '#/student-affairs', label: 'Kesiswaan' },
        { href: '#/facilities', label: 'Sarpras' }
      ])}
    `;

    const employeeForm = document.getElementById('personnel-employee-form');
    if (employeeForm) {
      employeeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
          name: document.getElementById('personnel-employee-name').value.trim(),
          position: document.getElementById('personnel-employee-position').value.trim(),
          department: document.getElementById('personnel-employee-department').value.trim(),
          status: document.getElementById('personnel-employee-status').value,
          phone: document.getElementById('personnel-employee-phone').value.trim(),
          email: document.getElementById('personnel-employee-email').value.trim()
        };

        if (!payload.name || !payload.position || !payload.department) return;

        await DB.savePersonnelMember(payload);
        await this.renderPersonnel(container);
      });
    }

    const announcementForm = document.getElementById('personnel-announcement-form');
    if (announcementForm) {
      announcementForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
          title: document.getElementById('personnel-announcement-title').value.trim(),
          date: document.getElementById('personnel-announcement-date').value,
          description: document.getElementById('personnel-announcement-description').value.trim()
        };

        if (!payload.title || !payload.date || !payload.description) return;

        await DB.savePersonnelAnnouncement(payload);
        await this.renderPersonnel(container);
      });
    }
  },

  async renderFacilities(container) {
    const [classes, students, assetsData, roomsData, maintenanceData] = await Promise.all([
      DB.getClasses(),
      DB.getAllStudents(),
      DB.getFacilityAssets(),
      DB.getFacilityRooms(),
      DB.getFacilityMaintenance()
    ]);

    const classArr = DB.toArray(classes);
    const studentArr = DB.toArray(students);
    const assets = DB.toArray(assetsData);
    const rooms = DB.toArray(roomsData);
    const maintenance = DB.toArray(maintenanceData);

    const roomCount = rooms.length;
    const assetCount = assets.length;
    const maintenanceCount = maintenance.length;
    const issueCount = assets.filter((asset) => {
      const condition = (asset.condition || '').toLowerCase();
      return condition.includes('rusak');
    }).length;

    const assetRows = assets.length ? assets.slice(0, 8).map((asset) => `
      <tr>
        <td>${asset.name || '-'}</td>
        <td>${asset.category || 'Umum'}</td>
        <td>${asset.quantity || 0}</td>
        <td>${asset.condition || 'Baik'}</td>
        <td>${asset.room || '-'}</td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="text-muted">Belum ada aset sarpras.</td></tr>';

    const roomRows = rooms.length ? rooms.slice(0, 8).map((room) => `
      <tr>
        <td>${room.name || '-'}</td>
        <td>${room.type || 'Kelas'}</td>
        <td>${room.location || '-'}</td>
        <td>${room.capacity || 0}</td>
        <td>${room.status || 'Aktif'}</td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="text-muted">Belum ada data ruangan.</td></tr>';

    const maintenanceRows = maintenance.length ? maintenance.slice(0, 8).map((item) => `
      <tr>
        <td>${item.itemName || '-'}</td>
        <td>${item.type || 'Pemeliharaan'}</td>
        <td>${item.date || '-'}</td>
        <td>${item.status || 'Diajukan'}</td>
      </tr>
    `).join('') : '<tr><td colspan="4" class="text-muted">Belum ada pemeliharaan.</td></tr>';

    const form = `
      <div class="card" style="margin-top: 18px;">
        <div class="card-body">
          <h3 class="card-title">Tambah aset</h3>
          <form id="facility-asset-form" class="form-grid">
            <div class="form-group">
              <label for="facility-asset-name">Nama aset</label>
              <input id="facility-asset-name" type="text" placeholder="Contoh: Laptop Lab Komputer" required>
            </div>
            <div class="form-group">
              <label for="facility-asset-category">Kategori</label>
              <input id="facility-asset-category" type="text" value="Umum" required>
            </div>
            <div class="form-group">
              <label for="facility-asset-quantity">Jumlah</label>
              <input id="facility-asset-quantity" type="number" min="1" value="1" required>
            </div>
            <div class="form-group">
              <label for="facility-asset-condition">Kondisi</label>
              <select id="facility-asset-condition">
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
            <div class="form-group">
              <label for="facility-asset-room">Ruangan</label>
              <input id="facility-asset-room" type="text" placeholder="Contoh: Lab Komputer">
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="facility-asset-notes">Catatan</label>
              <textarea id="facility-asset-notes" rows="2" placeholder="Catatan singkat aset..."></textarea>
            </div>
            <div style="grid-column: 1 / -1;">
              <button type="submit" class="btn btn-primary">Simpan aset</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card" style="margin-top: 18px;">
        <div class="card-body">
          <h3 class="card-title">Tambah ruangan</h3>
          <form id="facility-room-form" class="form-grid">
            <div class="form-group">
              <label for="facility-room-name">Nama ruangan</label>
              <input id="facility-room-name" type="text" placeholder="Contoh: R. 1A" required>
            </div>
            <div class="form-group">
              <label for="facility-room-type">Tipe</label>
              <select id="facility-room-type">
                <option value="Kelas">Kelas</option>
                <option value="Lab">Lab</option>
                <option value="Perpustakaan">Perpustakaan</option>
                <option value="Kantor">Kantor</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div class="form-group">
              <label for="facility-room-location">Lokasi</label>
              <input id="facility-room-location" type="text" placeholder="Contoh: Gedung Utama" required>
            </div>
            <div class="form-group">
              <label for="facility-room-capacity">Kapasitas</label>
              <input id="facility-room-capacity" type="number" min="1" value="30" required>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="facility-room-notes">Catatan</label>
              <textarea id="facility-room-notes" rows="2" placeholder="Catatan ruangan..."></textarea>
            </div>
            <div style="grid-column: 1 / -1;">
              <button type="submit" class="btn btn-primary">Simpan ruangan</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card" style="margin-top: 18px;">
        <div class="card-body">
          <h3 class="card-title">Catat pemeliharaan</h3>
          <form id="facility-maintenance-form" class="form-grid">
            <div class="form-group">
              <label for="facility-maintenance-item">Nama barang</label>
              <input id="facility-maintenance-item" type="text" placeholder="Contoh: AC Kelas 2A" required>
            </div>
            <div class="form-group">
              <label for="facility-maintenance-type">Jenis</label>
              <select id="facility-maintenance-type">
                <option value="Pemeliharaan">Pemeliharaan</option>
                <option value="Perbaikan">Perbaikan</option>
                <option value="Pemeriksaan">Pemeriksaan</option>
                <option value="Penggantian">Penggantian</option>
              </select>
            </div>
            <div class="form-group">
              <label for="facility-maintenance-date">Tanggal</label>
              <input id="facility-maintenance-date" type="date" value="${new Date().toISOString().slice(0, 10)}" required>
            </div>
            <div class="form-group">
              <label for="facility-maintenance-status">Status</label>
              <select id="facility-maintenance-status">
                <option value="Diajukan">Diajukan</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="facility-maintenance-description">Deskripsi</label>
              <textarea id="facility-maintenance-description" rows="2" placeholder="Keterangan pemeliharaan..." required></textarea>
            </div>
            <div style="grid-column: 1 / -1;">
              <button type="submit" class="btn btn-primary">Simpan pemeliharaan</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const facilitySummary = this.renderMetricCards([
      { label: 'Aset', value: assetCount, tone: 'primary' },
      { label: 'Ruangan', value: roomCount, tone: 'success' },
      { label: 'Pemeliharaan', value: maintenanceCount, tone: 'warning' },
      { label: 'Kerusakan', value: issueCount, tone: 'danger' }
    ]);

    const facilityInsights = [
      { label: `Aset aktif: ${assetCount}`, badge: 'Aset' },
      { label: `Ruangan aktif: ${roomCount}`, badge: 'Ruangan' },
      { label: `Pemeliharaan tercatat: ${maintenanceCount}`, badge: 'Perawatan' },
      { label: `Barang rusak: ${issueCount}`, badge: 'Risiko' }
    ];

    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Ringkasan sarana & prasarana</h3>
          ${facilitySummary}
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Insight operasional</h3>
          <ul class="list-plain">${this.renderList(facilityInsights, 'Belum ada insight sarpras.')}</ul>
        </div>
      </div>

      ${form}

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Inventaris aset</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th>Jumlah</th>
                  <th>Kondisi</th>
                  <th>Ruangan</th>
                </tr>
              </thead>
              <tbody>${assetRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Ruangan</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Tipe</th>
                  <th>Lokasi</th>
                  <th>Kapasitas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${roomRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Pemeliharaan</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Barang</th>
                  <th>Jenis</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${maintenanceRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      ${this.renderModuleLinks('facilities', [
        { href: '#/finance', label: 'Keuangan' },
        { href: '#/curriculum', label: 'Kurikulum' },
        { href: '#/student-affairs', label: 'Kesiswaan' },
        { href: '#/personnel', label: 'Personalia' }
      ])}
    `;

    const assetForm = document.getElementById('facility-asset-form');
    if (assetForm) {
      assetForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
          name: document.getElementById('facility-asset-name').value.trim(),
          category: document.getElementById('facility-asset-category').value.trim(),
          quantity: Number(document.getElementById('facility-asset-quantity').value || 1),
          condition: document.getElementById('facility-asset-condition').value,
          room: document.getElementById('facility-asset-room').value.trim(),
          notes: document.getElementById('facility-asset-notes').value.trim()
        };

        if (!payload.name || !payload.category) return;
        await DB.saveFacilityAsset(payload);
        await this.renderFacilities(container);
      });
    }

    const roomForm = document.getElementById('facility-room-form');
    if (roomForm) {
      roomForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
          name: document.getElementById('facility-room-name').value.trim(),
          type: document.getElementById('facility-room-type').value,
          location: document.getElementById('facility-room-location').value.trim(),
          capacity: Number(document.getElementById('facility-room-capacity').value || 0),
          notes: document.getElementById('facility-room-notes').value.trim(),
          status: 'Aktif'
        };

        if (!payload.name || !payload.location) return;
        await DB.saveFacilityRoom(payload);
        await this.renderFacilities(container);
      });
    }

    const maintenanceForm = document.getElementById('facility-maintenance-form');
    if (maintenanceForm) {
      maintenanceForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
          itemName: document.getElementById('facility-maintenance-item').value.trim(),
          type: document.getElementById('facility-maintenance-type').value,
          date: document.getElementById('facility-maintenance-date').value,
          status: document.getElementById('facility-maintenance-status').value,
          description: document.getElementById('facility-maintenance-description').value.trim()
        };

        if (!payload.itemName || !payload.date || !payload.description) return;
        await DB.saveFacilityMaintenance(payload);
        await this.renderFacilities(container);
      });
    }
  }
};
