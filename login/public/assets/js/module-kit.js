const ModuleKit = {
  defs: {},
  UNIT_BY_ROLE: {
    studentAffairs: 'WAKA_KESISWAAN',
    personnel: 'WAKA_HUMAS_PERSONALIA',
    facilities: 'WAKA_SARPRAS',
    finance: 'WAKA_KEUANGAN',
    curriculum: 'WAKA_KURIKULUM',
    it_admin: 'TIM_IT'
  },
  STAFF_UNIT_BY_ROLE: {
    studentAffairs: 'STAF_KESISWAAN',
    personnel: 'STAF_HUMAS_PERSONALIA',
    facilities: 'STAF_SARPRAS',
    finance: 'STAF_KEUANGAN',
    curriculum: 'STAF_KURIKULUM'
  },
  REF_LOADERS: {
    student: async () => {
      if (typeof Auth !== 'undefined' && Auth.currentUser && (Auth.currentRole === 'ortu' || Auth.userData?.role === 'ortu')) {
        return DB.getStudentsByParent(Auth.currentUser.uid);
      }
      return DB.getAllStudents();
    },
    class: () => DB.getClasses(),
    subject: async (ctx) => {
      const [subjects, classes] = await Promise.all([DB.getSubjects(), DB.getClasses()]);
      const subMap = subjects || {};
      if (ctx && ctx.meta) {
        ctx.meta.allSubjects = subMap;
        ctx.meta.classes = classes || {};
      }
      return subMap;
    },
    user: async () => {
      const users = await DB.getAllUsers();
      const out = {};
      Object.entries(users || {}).forEach(([id, u]) => {
        if (u && u.role !== 'ortu') out[id] = u;
      });
      return out;
    },
    teacher: async () => {
      const users = await DB.getAllUsers();
      const out = {};
      Object.entries(users || {}).forEach(([id, u]) => {
        if (u && (u.role === 'guru' || u.role === 'guruEkskul' || u.role === 'admin' || u.role === 'kepsek' || AppConfig.getRoleAssignments(u).some(a => a.startsWith('GURU_EKSTRA_')))) out[id] = u;
      });
      return out;
    },
    employee: async () => {
      const users = await DB.getAllUsers();
      const out = {};
      Object.entries(users || {}).forEach(([id, u]) => {
        if (u && u.role !== 'ortu') out[id] = u;
      });
      return out;
    },
    approvedScholarshipStudent: async () => {
      const [scholarships, allStudents] = await Promise.all([
        ModuleKit.fetchObject('student_affairs/scholarships'),
        DB.getAllStudents()
      ]);
      const out = {};
      Object.values(scholarships || {}).forEach((s) => {
        if (s && s.studentId && (s.status === 'Disetujui' || s.status === 'Dicairkan')) {
          const stu = (allStudents || {})[s.studentId];
          const name = stu ? (stu.name || s.studentId) : s.studentId;
          out[s.studentId] = { name: `${name} (${s.program || 'Beasiswa'} - Terverifikasi Kesiswaan)` };
        }
      });
      if (!Object.keys(out).length) {
        Object.entries(allStudents || {}).forEach(([id, s]) => {
          if (s) out[id] = s;
        });
      }
      return out;
    },
    asset: () => DB.getFacilityAssets(),
    rkasComponent: async () => {
      const rkas = await DB.getRKAS();
      const out = {};
      Object.entries(rkas || {}).forEach(([id, item]) => {
        if (item) out[id] = { name: `${item.code ? '[' + item.code + '] ' : ''}${item.component || 'Komponen'} (Pagu: Rp ${Number(item.pagu || 0).toLocaleString('id-ID')})` };
      });
      return out;
    },
    ekskul: () => DB.getExtracurriculars(),
    ummiClass: (ctx) => ModuleKit.scopedClasses('ummi_classes', 'teacherId', ctx, 'KOORD_UMMI'),
    ummiStudent: (ctx) => ModuleKit.scopedStudents('ummi_classes', 'teacherId', ctx, 'KOORD_UMMI'),
    engClass: (ctx) => ModuleKit.scopedClasses('english_classes', 'createdBy', ctx, 'TIM_B_INGGRIS_KOORD'),
    engStudent: (ctx) => ModuleKit.scopedStudents('english_classes', 'createdBy', ctx, 'TIM_B_INGGRIS_KOORD')
  },
  register(defs) {
    Object.assign(this.defs, defs);
  },
  has(path) {
    return Object.prototype.hasOwnProperty.call(this.defs, path);
  },
  hasUnit(unit) {
    return (Auth.currentAssignments || []).includes(unit);
  },
  sees(def) {
    return this.isPrivileged(def) || this.isApprover(def) || (def.seeAllUnits || []).some((u) => this.hasUnit(u));
  },
  isPrivileged() {
    return Auth.currentRole === AppConfig.ROLES.ADMIN || (Auth.currentAssignments || []).some((a) => a.startsWith('WAKA_') || a === 'TIM_IT');
  },
  isApprover(def) {
    if (!def) return false;
    const role = Auth.currentRole;
    if (role === AppConfig.ROLES.ADMIN || role === AppConfig.ROLES.KEPSEK) return true;
    if ((def.approverRoles || []).includes(role)) return true;
    const approverUnits = [
      ...(def.approverUnits || []),
      ...(def.approverRoles || []).map((r) => this.UNIT_BY_ROLE[r]).filter(Boolean),
      ...(def.approverRoles || []).map((r) => this.STAFF_UNIT_BY_ROLE[r]).filter(Boolean)
    ];
    return approverUnits.some((u) => this.hasUnit(u));
  },
  canWrite(def) {
    const role = Auth.currentRole;
    if (role === AppConfig.ROLES.ADMIN) return true;
    if ((def.writeRoles || []).includes(role)) return true;
    const wakaUnits = (def.writeRoles || []).map((r) => this.UNIT_BY_ROLE[r]).filter(Boolean);
    const staffUnits = !def.wakaOnly ? (def.writeRoles || []).map((r) => this.STAFF_UNIT_BY_ROLE[r]).filter(Boolean) : [];
    const units = [...wakaUnits, ...staffUnits, ...(def.units || [])];
    return units.some((u) => this.hasUnit(u));
  },
  async scopedClasses(node, ownerKey, ctx, allUnit) {
    const data = (await ModuleKit.fetchObject(node)) || {};
    const all = ctx.admin || ModuleKit.hasUnit(allUnit);
    const out = {};
    Object.entries(data).forEach(([id, cls]) => {
      if (all || cls[ownerKey] === ctx.uid) out[id] = { name: cls.level ? `${cls.name} (${cls.level})` : cls.name, students: cls.students || {} };
    });
    return out;
  },
  async scopedStudents(node, ownerKey, ctx, allUnit) {
    const [classes, students] = await Promise.all([ModuleKit.scopedClasses(node, ownerKey, ctx, allUnit), DB.getAllStudents()]);
    const out = {};
    Object.entries(classes).forEach(([classId, cls]) => {
      Object.keys(cls.students || {}).forEach((sid) => {
        const student = (students || {})[sid];
        if (!student) return;
        out[sid] = { name: `${student.name} (${cls.name})` };
        ctx.meta.studentClass[sid] = classId;
      });
    });
    return out;
  },
  async fetchObject(node) {
    if (!isDBReady()) return {};
    const snap = await db.ref(node).once('value');
    return snap.val() || {};
  },
  esc(value) {
    return AppConfig.escapeHtml(String(value ?? ''));
  },
  money(value) {
    return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
  },
  today() {
    return typeof AppConfig !== 'undefined' && AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr() : new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  },
  optionList(field) {
    return (field.options || []).map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt));
  },
  async loadRefs(def) {
    const kinds = [...new Set((def.fields || []).filter((f) => f.ref).map((f) => f.ref))];
    const ctx = { uid: Auth.currentUser ? Auth.currentUser.uid : '', admin: this.isPrivileged(def), meta: { studentClass: {} } };
    const [settings] = await Promise.all([DB.getSettings()]);
    const refs = { __settings: settings };
    await Promise.all(kinds.map(async (kind) => {
      const data = (await this.REF_LOADERS[kind](ctx)) || {};
      refs[kind] = {};
      Object.entries(data).forEach(([id, item]) => {
        if (!item || typeof item !== 'object') return;
        refs[kind][id] = item.name || item.displayName || item.email || id;
      });
    }));
    Object.defineProperty(refs, '__ctx', { value: ctx, enumerable: false });
    return refs;
  },
  async fetchRows(node, limit = 1000) {
    if (!isDBReady()) return [];
    const snap = await db.ref(node).orderByKey().limitToLast(limit).once('value');
    const rows = [];
    snap.forEach((child) => {
      rows.push({ id: child.key, ...child.val() });
    });
    return rows;
  },
  fmtStamp(value) {
    return value ? new Date(value).toLocaleString('id-ID') : '-';
  },
  cell(def, field, row, refs) {
    const value = row[field.key];
    if (field.type === 'money') return this.money(value);
    if (field.type === 'timestamp') return this.esc(this.fmtStamp(value));
    if (field.type === 'multi') return `${Object.keys(value || {}).length} siswa`;
    if (field.ref) {
      if (row[`${field.key}Name`]) return this.esc(row[`${field.key}Name`]);
      const metaSubs = refs.__ctx?.meta?.allSubjects;
      const refName = (refs[field.ref] || {})[value] || (metaSubs && metaSubs[value] ? metaSubs[value].name : '') || '-';
      return this.esc(refName);
    }
    if (field.key === def.statusField && value) {
      const tone = (def.badges || {})[value] || 'warning';
      const opt = this.optionList(field).find((o) => o.value === value);
      return `<span class="badge badge-${tone}">${this.esc(opt ? opt.label : value)}</span>`;
    }
    if (field.type === 'textarea') {
      const text = String(value || '-');
      return this.esc(text.length > 80 ? `${text.slice(0, 80)}...` : text);
    }
    if (field.type === 'file' || field.type === 'link') {
      if (!value) return '<span class="text-muted">-</span>';
      return `<button type="button" class="btn btn-sm btn-outline mk-preview-btn" data-preview-url="${this.esc(value)}" data-preview-title="${this.esc(row.title || row.docType || field.label || 'Berkas')}"><i class="ph ph-file-text"></i> Lihat Berkas</button>`;
    }
    return this.esc(value === undefined || value === '' ? '-' : value);
  },
  plain(def, field, row, refs) {
    const value = row[field.key];
    if (field.type === 'timestamp') return this.fmtStamp(value);
    if (field.type === 'multi') return Object.keys(value || {}).map((id) => (refs[field.ref] || {})[id] || id).join(', ');
    if (field.ref) return row[`${field.key}Name`] || (refs[field.ref] || {})[value] || '-';
    if (field.type === 'file' || field.type === 'link') return value || '-';
    return value === undefined || value === '' ? '-' : value;
  },
  matchWhere(row, where) {
    return Object.entries(where || {}).every(([key, val]) => (Array.isArray(val) ? val.includes(row[key]) : row[key] === val));
  },
  summaryValue(item, rows) {
    const scoped = rows.filter((row) => this.matchWhere(row, item.where));
    if (item.sum) {
      const total = scoped.reduce((acc, row) => acc + Number(row[item.sum] || 0), 0);
      return item.money ? this.money(total) : total.toLocaleString('id-ID');
    }
    return scoped.length.toLocaleString('id-ID');
  },
  renderLoading(text = 'Memuat data...') {
    return `<div class="card section-block"><div class="card-body"><div class="loading-state"><div class="loader loading-state__loader"></div><span>${this.esc(text)}</span></div></div></div>`;
  },
  async render(container, path, title, icon) {
    const def = this.defs[path];
    if (def.view === 'cashbook') {
      await this.renderCashbook(container, def, title);
      return;
    }
    if (def.view === 'myclasses') {
      await this.renderMyClasses(container, def, title);
      return;
    }
    if (def.view === 'backup') {
      await this.renderBackup(container, def, title);
      return;
    }
    Router.setTitle(title, def.subtitle || '');
    container.innerHTML = this.renderLoading('Memuat data...');
    const writable = !def.readOnly && this.canWrite(def);
    const canAdd = writable && !def.noAdd;
    const canDel = writable && !def.noDelete;
    const uid = Auth.currentUser ? Auth.currentUser.uid : '';
    const isOrtu = Auth.currentRole === 'ortu' || Auth.userData?.role === 'ortu';
    const loadRows = async () => {
      const all = await this.fetchRows(def.node);
      if (isOrtu) {
        const myStudents = await DB.getStudentsByParent(Auth.currentUser.uid);
        const childIds = Object.keys(myStudents || {});
        return all.filter((r) => childIds.includes(r.studentId) || r.createdBy === uid);
      }
      return !def.own || this.sees(def) ? all : all.filter((r) => (r.teacherId && r.teacherId === uid) || r.createdBy === uid);
    };
    const [rows, refs] = await Promise.all([loadRows(), this.loadRefs(def)]);
    const state = { rows, q: '', status: '', editing: null };
    const listFields = def.fields.filter((f) => f.list !== false);
    const statusField = def.fields.find((f) => f.key === def.statusField);
    const colCount = listFields.length + (writable ? 1 : 0);
    const summaryHtml = (def.summary || []).map((item) => `
      <div class="card stat-card">
        <div class="stat-icon stat-icon--${item.tone || 'primary'}"><i class="ph ${item.icon || 'ph-list-checks'}"></i></div>
        <div><p class="stat-value" data-mk-summary="${(def.summary || []).indexOf(item)}">0</p><p class="stat-label text-muted">${this.esc(item.label)}</p></div>
      </div>`).join('');
    const statusFilter = statusField ? `
      <select id="mk-status" class="mk-filter">
        <option value="">Semua ${this.esc(statusField.label)}</option>
        ${this.optionList(statusField).map((o) => `<option value="${this.esc(o.value)}">${this.esc(o.label)}</option>`).join('')}
      </select>` : '';
    container.innerHTML = `
      ${summaryHtml ? `<section class="card-grid section-spacer">${summaryHtml}</section>` : ''}
      <section class="card section-block">
        <div class="card-header mk-header">
          <h3 class="card-title"><i class="ph ${icon}"></i> ${this.esc(def.noun || title)}</h3>
          <div class="mk-toolbar">
            <input type="search" id="mk-search" class="mk-filter" placeholder="Cari data...">
            ${statusFilter}
            <button type="button" class="btn btn-outline btn-sm" id="mk-export"><i class="ph ph-file-xls"></i> Unduh Excel</button>
            ${(def.allowImport && writable) ? '<button type="button" class="btn btn-outline btn-sm" id="mk-import"><i class="ph ph-file-arrow-up"></i> Impor Excel</button><input type="file" id="mk-import-file" accept=".xlsx,.xls,.csv" style="display:none;">' : ''}
            ${canAdd ? '<button type="button" class="btn btn-primary btn-sm" id="mk-add"><i class="ph ph-plus"></i> Tambah</button>' : ''}
          </div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr>${listFields.map((f) => `<th${f.type === 'money' ? ' class="text-right"' : ''}>${this.esc(f.label)}</th>`).join('')}${writable ? '<th class="text-right">Aksi</th>' : ''}</tr></thead>
            <tbody id="mk-body"></tbody>
          </table>
        </div>
        <div class="card-body mk-count text-muted" id="mk-count"></div>
      </section>
      ${writable ? `
      <div class="modal-overlay" id="mk-modal">
        <div class="modal modal-wide">
          <div class="modal-header">
            <h3 class="modal-title" id="mk-modal-title"></h3>
            <button type="button" class="btn-icon" id="mk-close"><i class="ph ph-x"></i></button>
          </div>
          <form id="mk-form">
            <div class="modal-body mk-form-grid">${def.fields.map((f) => this.fieldHtml(f, refs)).join('')}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="mk-cancel">Batal</button>
              <button type="submit" class="btn btn-primary" id="mk-save">Simpan</button>
            </div>
          </form>
        </div>
      </div>` : ''}`;
    const body = container.querySelector('#mk-body');
    const countEl = container.querySelector('#mk-count');
    const filtered = () => {
      const q = state.q.toLowerCase();
      const list = state.rows.filter((row) => {
        if (state.status && row[def.statusField] !== state.status) return false;
        if (!q) return true;
        return def.fields.some((f) => String(this.plain(def, f, row, refs)).toLowerCase().includes(q));
      });
      const dateKey = def.dateField;
      list.sort((a, b) => {
        if (dateKey) {
          const diff = String(b[dateKey] || '').localeCompare(String(a[dateKey] || ''));
          if (diff) return diff;
        }
        return String(b.id).localeCompare(String(a.id));
      });
      return list;
    };
    const paint = () => {
      const list = filtered();
      body.innerHTML = list.map((row) => `
        <tr>
          ${listFields.map((f) => `<td${f.type === 'money' ? ' class="text-right"' : ''}>${this.cell(def, f, row, refs)}</td>`).join('')}
          ${writable ? `<td class="action-cell text-right">
            ${(!isOrtu || row.status === 'Diajukan') ? `<button type="button" class="btn btn-sm btn-outline" data-mk-edit="${row.id}" title="Ubah"><i class="ph ph-pencil-simple"></i></button>` : ''}
            ${(canDel && (!isOrtu || row.status === 'Diajukan')) ? `<button type="button" class="btn btn-sm btn-danger" data-mk-del="${row.id}" title="Hapus"><i class="ph ph-trash"></i></button>` : ''}
          </td>` : ''}
        </tr>`).join('') || `<tr><td colspan="${colCount}" class="text-muted">Belum ada data.</td></tr>`;
      countEl.textContent = `${list.length} dari ${state.rows.length} data`;
      container.querySelectorAll('[data-mk-summary]').forEach((el) => {
        el.textContent = this.summaryValue(def.summary[Number(el.dataset.mkSummary)], state.rows);
      });
    };
    paint();
    container.querySelector('#mk-search').addEventListener('input', (e) => {
      state.q = e.target.value.trim();
      paint();
    });
    const statusEl = container.querySelector('#mk-status');
    if (statusEl) {
      statusEl.addEventListener('change', (e) => {
        state.status = e.target.value;
        paint();
      });
    }
    container.querySelector('#mk-export').addEventListener('click', () => {
      if (!window.XLSX) {
        alert('Library Excel belum dimuat.');
        return;
      }
      let data = filtered().map((row, index) => {
        const out = { No: index + 1 };
        def.fields.forEach((f) => {
          out[f.label] = this.plain(def, f, row, refs);
        });
        return out;
      });
      if (!data.length && def.node === 'curriculum/schedules') {
        data = [
          { No: 1, Hari: 'Senin', Mulai: '07:30', Selesai: '08:45', Kelas: '1 ABU BAKAR ASH SHIDDIQ', 'Mata Pelajaran': 'Matematika', Guru: 'Nur Fadhilah' },
          { No: 2, Hari: 'Senin', Mulai: '08:45', Selesai: '10:00', Kelas: '1 ABU BAKAR ASH SHIDDIQ', 'Mata Pelajaran': 'Bahasa Indonesia', Guru: 'Nur Fadhilah' },
          { No: 3, Hari: 'Selasa', Mulai: '07:30', Selesai: '08:45', Kelas: '1 ABU BAKAR ASH SHIDDIQ', 'Mata Pelajaran': 'Baca Tulis Qur\'an (BTQ)', Guru: 'Vindy Aprillia' }
        ];
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Data');
      XLSX.writeFile(wb, `${(def.noun || title).replace(/[^A-Za-z0-9]+/g, '_')}.xlsx`);
    });
    const importBtn = container.querySelector('#mk-import');
    const importFile = container.querySelector('#mk-import-file');
    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!window.XLSX) {
          alert('Library Excel belum siap.');
          return;
        }
        try {
          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer, { type: 'array' });
          const firstSheet = wb.Sheets[wb.SheetNames[0]];
          const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
          if (!rawRows.length) {
            alert('File Excel kosong atau format tidak sesuai.');
            importFile.value = '';
            return;
          }
          const [allClasses, allSubjects, allUsers] = await Promise.all([
            DB.getClasses(),
            DB.getSubjects(),
            DB.getAllUsers()
          ]);
          const classByName = {};
          Object.entries(allClasses || {}).forEach(([id, c]) => {
            classByName[String(c.name || '').trim().toLowerCase()] = id;
            classByName[id.toLowerCase()] = id;
          });
          const subByName = {};
          Object.entries(allSubjects || {}).forEach(([id, s]) => {
            subByName[String(s.name || '').trim().toLowerCase()] = id;
            subByName[id.toLowerCase()] = id;
          });
          const userByName = {};
          Object.entries(allUsers || {}).forEach(([id, u]) => {
            userByName[String(u.name || u.displayName || '').trim().toLowerCase()] = id;
            userByName[id.toLowerCase()] = id;
          });
          const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
          const dayMap = {};
          validDays.forEach(d => { dayMap[d.toLowerCase()] = d; });
          const formatTimeVal = (val) => {
            if (typeof val === 'number') {
              const totalMinutes = Math.round(val * 24 * 60);
              const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
              const m = String(totalMinutes % 60).padStart(2, '0');
              return `${h}:${m}`;
            }
            const s = String(val).trim().replace('.', ':');
            const m = s.match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/);
            if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
            return s;
          };
          const updates = {};
          let validCount = 0;
          let skippedCount = 0;
          rawRows.forEach((r) => {
            const getCol = (...keys) => {
              for (const k of keys) {
                const found = Object.keys(r).find(rk => rk.trim().toLowerCase() === k.toLowerCase());
                if (found && r[found] !== undefined && r[found] !== '') return r[found];
              }
              return '';
            };
            const rawDay = String(getCol('Hari', 'Day')).trim().toLowerCase();
            const day = dayMap[rawDay];
            const startTime = formatTimeVal(getCol('Mulai', 'Jam Mulai', 'Start', 'StartTime'));
            const endTime = formatTimeVal(getCol('Selesai', 'Jam Selesai', 'End', 'EndTime'));
            const rawCls = String(getCol('Kelas', 'Nama Kelas', 'Class', 'ClassId')).trim().toLowerCase();
            const classId = classByName[rawCls];
            const rawSub = String(getCol('Mata Pelajaran', 'Mapel', 'Subject', 'SubjectId')).trim().toLowerCase();
            const subjectId = subByName[rawSub];
            const rawTeacher = String(getCol('Guru', 'Nama Guru', 'Teacher', 'TeacherId')).trim().toLowerCase();
            let teacherId = userByName[rawTeacher];
            if (!teacherId && classId && subjectId && allClasses[classId]?.subjectTeachers?.[subjectId]) {
              teacherId = allClasses[classId].subjectTeachers[subjectId];
            }
            if (!day || !startTime || !endTime || !classId || !subjectId) {
              skippedCount++;
              return;
            }
            const newKey = db.ref(def.node).push().key;
            updates[`${def.node}/${newKey}`] = {
              day,
              startTime,
              endTime,
              classId,
              subjectId,
              teacherId: teacherId || '',
              createdAt: new Date().toISOString()
            };
            validCount++;
          });
          if (!validCount) {
            alert(`Tidak ada data jadwal valid untuk diimpor (${skippedCount} baris tidak sesuai). Pastikan nama kolom: Hari, Mulai, Selesai, Kelas, Mata Pelajaran, Guru.`);
            importFile.value = '';
            return;
          }
          if (!confirm(`Ditemukan ${validCount} jadwal pelajaran valid (${skippedCount} baris dilewati). Lanjutkan impor ke database?`)) {
            importFile.value = '';
            return;
          }
          await db.ref().update(updates);
          alert(`Sukses mengimpor ${validCount} jadwal pelajaran!`);
          importFile.value = '';
          const freshRows = await ModuleKit.fetchRows(def.node);
          state.rows = freshRows;
          paint();
        } catch (err) {
          console.error(err);
          alert('Gagal membaca file Excel: ' + (err?.message || err));
          importFile.value = '';
        }
      });
    }
    if (!writable) return;
    const modalId = 'mk-modal';
    const form = container.querySelector('#mk-form');
    const openForm = (row) => {
      state.editing = row ? row.id : null;
      container.querySelector('#mk-modal-title').textContent = `${row ? 'Ubah' : 'Tambah'} ${def.noun || title}`;
      def.fields.forEach((f) => {
        const el = form.querySelector(`#mk-f-${f.key}`);
        let value = row ? row[f.key] : (f.default !== undefined ? f.default : (f.type === 'date' ? this.today() : ''));
        if (f.key === 'semester' && refs.__settings) {
          const s = refs.__settings;
          const y = s.currentAcademicYear || s.academicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
          const sem = (s.currentSemester === '2' || s.semester === 'Genap') ? 'Semester 2 (Genap)' : 'Semester 1 (Ganjil)';
          const otherSem = sem === 'Semester 1 (Ganjil)' ? 'Semester 2 (Genap)' : 'Semester 1 (Ganjil)';
          const opts = [`${sem} - T.A. ${y}`, `${otherSem} - T.A. ${y}`, `1 Tahun Penuh - T.A. ${y}`];
          el.innerHTML = opts.map((o) => `<option value="${this.esc(o)}">${this.esc(o)}</option>`).join('');
          if (!row) value = `${sem} - T.A. ${y}`;
        }
        if (f.key === 'academicYear' && refs.__settings && !row && !value) {
          const s = refs.__settings;
          value = s.currentAcademicYear || s.academicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
        }
        if (f.type === 'multi') {
          const chosen = value && typeof value === 'object' ? value : {};
          el.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
            cb.checked = !!chosen[cb.value];
          });
          return;
        }
        if (f.type === 'file') {
          const fileInput = form.querySelector(`#mk-f-${f.key}_file`);
          const infoEl = form.querySelector(`#mk-f-${f.key}_hint_info`);
          if (infoEl) infoEl.innerHTML = '';
          if (fileInput) {
            fileInput.value = '';
            fileInput.onchange = (e) => {
              const chosen = e.target.files && e.target.files[0];
              const curInfo = form.querySelector(`#mk-f-${f.key}_hint_info`);
              if (!curInfo) return;
              if (chosen) {
                curInfo.innerHTML = `<span class="text-success"><i class="ph ph-check-circle"></i> Berkas dipilih: ${this.esc(chosen.name)}</span>`;
              } else {
                curInfo.innerHTML = '';
              }
            };
          }
          const curEl = form.querySelector(`#mk-f-${f.key}_current`);
          if (curEl) {
            if (row && row[f.key]) {
              curEl.innerHTML = `<div class="mk-file-badge"><span class="text-success"><i class="ph ph-check-circle"></i> Berkas tersimpan di server</span><button type="button" class="btn btn-xs btn-outline" data-preview-url="${this.esc(row[f.key])}" data-preview-title="${this.esc(row.title || row.docType || f.label || 'Berkas')}"><i class="ph ph-eye"></i> Lihat Berkas</button></div>`;
            } else {
              curEl.innerHTML = '';
            }
          }
        }
        if (f.type === 'money') {
          value = value === undefined || value === null || value === '' ? '' : (window.AppConfig?.formatRupiah ? window.AppConfig.formatRupiah(value) : value);
        }
        el.value = value === undefined || value === null ? '' : value;
      });
      if (window.AppConfig?.initRupiahInputs) window.AppConfig.initRupiahInputs(form);
      const isApprover = this.isApprover(def);
      if (isOrtu || (!isApprover && def.approverRoles)) {
        const sf = form.querySelector(`#mk-f-${def.statusField || 'status'}`);
        if (sf) {
          sf.value = row ? (row[def.statusField || 'status'] || 'Diajukan') : 'Diajukan';
          sf.disabled = true;
        }
      } else {
        const sf = form.querySelector(`#mk-f-${def.statusField || 'status'}`);
        if (sf) sf.disabled = false;
      }
      const isSchedule = def.node === 'curriculum/schedules';
      const tf = form.querySelector('#mk-f-teacherId');
      if (tf) {
        if (!isApprover && !isSchedule && def.approverRoles) {
          tf.value = row ? (row.teacherId || uid) : uid;
          tf.disabled = true;
        } else {
          tf.disabled = false;
        }
      }
      const cf = form.querySelector('#mk-f-classId');
      const sfSub = form.querySelector('#mk-f-subjectId');
      if (isSchedule && cf && sfSub) {
        const updateScheduleDependencies = () => {
          const selectedClassId = cf.value;
          const classes = refs.__ctx?.meta?.classes || {};
          const allSubjects = refs.__ctx?.meta?.allSubjects || refs.subject || {};
          const targetClass = classes[selectedClassId];
          const classSubjectMap = targetClass?.subjectTeachers || {};
          const curSubVal = sfSub.value;
          let entries = Object.entries(allSubjects);
          if (selectedClassId && Object.keys(classSubjectMap).length > 0) {
            entries.sort((a, b) => {
              const aHas = classSubjectMap[a[0]] ? 1 : 0;
              const bHas = classSubjectMap[b[0]] ? 1 : 0;
              if (aHas !== bHas) return bHas - aHas;
              return String(a[1].name || a[1]).localeCompare(String(b[1].name || b[1]));
            });
          } else {
            entries.sort((a, b) => String(a[1].name || a[1]).localeCompare(String(b[1].name || b[1])));
          }
          sfSub.innerHTML = '<option value="">-- Pilih --</option>' + entries.map(([id, s]) => {
            const isClassSub = classSubjectMap[id] ? ' ✓ (Mapel Kelas)' : '';
            return `<option value="${this.esc(id)}">${this.esc(s.name || s)}${isClassSub}</option>`;
          }).join('');
          if (curSubVal && entries.some(([id]) => id === curSubVal)) {
            sfSub.value = curSubVal;
          }
          if (tf && selectedClassId && sfSub.value && classSubjectMap[sfSub.value]) {
            tf.value = classSubjectMap[sfSub.value];
          }
        };
        cf.onchange = () => {
          updateScheduleDependencies();
        };
        sfSub.onchange = () => {
          const selectedClassId = cf.value;
          const classes = refs.__ctx?.meta?.classes || {};
          const targetClass = classes[selectedClassId];
          const assignedTeacher = targetClass?.subjectTeachers?.[sfSub.value];
          if (tf && assignedTeacher) {
            tf.value = assignedTeacher;
          }
        };
        updateScheduleDependencies();
      } else if (sfSub) {
        const activeTeacherId = tf ? tf.value : (row ? (row.teacherId || uid) : uid);
        const updateSubjectOptions = (tId) => {
          const allSubjects = refs.__ctx?.meta?.allSubjects || refs.subject || {};
          const classes = refs.__ctx?.meta?.classes || {};
          let allowedIds = null;
          if (tId && !isApprover && def.approverRoles) {
            const taught = new Set();
            Object.values(classes).forEach((cls) => {
              if (cls && cls.subjectTeachers) {
                Object.entries(cls.subjectTeachers).forEach(([subId, tUid]) => {
                  if (tUid === tId) taught.add(subId);
                });
              }
            });
            if (taught.size > 0) allowedIds = taught;
          }
          const entries = Object.entries(allSubjects).filter(([id]) => !allowedIds || allowedIds.has(id));
          entries.sort((a, b) => String(a[1].name || a[1]).localeCompare(String(b[1].name || b[1])));
          const curVal = row ? (row.subjectId || '') : sfSub.value;
          sfSub.innerHTML = '<option value="">-- Pilih --</option>' + entries.map(([id, s]) => `<option value="${this.esc(id)}">${this.esc(s.name || s)}</option>`).join('');
          if (curVal && entries.some(([id]) => id === curVal)) sfSub.value = curVal;
        };
        updateSubjectOptions(activeTeacherId);
        if (tf && isApprover) {
          tf.onchange = () => updateSubjectOptions(tf.value);
        }
      }
      const rf = form.querySelector('#mk-f-reviewerFeedback');
      if (rf) {
        rf.disabled = !isApprover;
        rf.readOnly = !isApprover;
        rf.placeholder = isApprover ? 'Catatan telaah atau instruksi revisi dari kurikulum...' : '(Hanya dapat diisi oleh peninjau Kurikulum)';
      }
      const gtkField = form.querySelector('#mk-f-gtkId');
      if (gtkField) {
        if (!isApprover) {
          gtkField.value = row ? (row.gtkId || uid) : uid;
          gtkField.disabled = true;
        } else {
          gtkField.disabled = false;
        }
      }
      const vakasiField = form.querySelector('#mk-f-vakasi');
      if (vakasiField) {
        vakasiField.disabled = !isApprover;
        vakasiField.readOnly = !isApprover;
      }
      const humasFeedback = form.querySelector('#mk-f-humasFeedback');
      if (humasFeedback) {
        humasFeedback.disabled = !isApprover;
        humasFeedback.readOnly = !isApprover;
        humasFeedback.placeholder = isApprover ? 'Catatan telaah atau instruksi verifikasi Humas...' : '(Hanya dapat diisi oleh peninjau Humas)';
      }
      const finTypeField = form.querySelector('#mk-f-type');
      const finCatField = form.querySelector('#mk-f-category');
      const finRkasGroup = form.querySelector('#mk-f-rkasId')?.closest('.mk-fgroup');
      if (finTypeField && finCatField && window.AppConfig?.getFinanceCategories) {
        const updateFinCategories = (selectedType) => {
          const list = window.AppConfig.getFinanceCategories(selectedType);
          const curVal = row ? (row.category || '') : finCatField.value;
          finCatField.innerHTML = '<option value="">-- Pilih Kategori --</option>' + list.map((c) => `<option value="${this.esc(c)}">${this.esc(c)}</option>`).join('');
          if (curVal && list.includes(curVal)) finCatField.value = curVal;
          if (finRkasGroup) {
            finRkasGroup.style.display = String(selectedType).toLowerCase() === 'expense' ? '' : 'none';
          }
        };
        const initType = row ? (row.type || 'income') : (finTypeField.value || 'income');
        finTypeField.value = initType;
        updateFinCategories(initType);
        finTypeField.onchange = () => updateFinCategories(finTypeField.value);
      }
      App.openModal(modalId);
    };
    const closeForm = () => App.closeModal(modalId);
    const addBtn = container.querySelector('#mk-add');
    if (addBtn) addBtn.addEventListener('click', () => openForm(null));
    container.querySelector('#mk-close').addEventListener('click', closeForm);
    container.querySelector('#mk-cancel').addEventListener('click', closeForm);
    body.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-mk-edit]');
      const delBtn = e.target.closest('[data-mk-del]');
      if (editBtn) {
        const row = state.rows.find((r) => r.id === editBtn.dataset.mkEdit);
        if (row && row[def.statusField || 'status'] === 'Disetujui (ACC)' && !this.isApprover(def) && def.approverRoles) {
          alert('Perangkat ini sudah disetujui (ACC) oleh Kurikulum. Jika ingin melakukan revisi, silakan hubungi bagian Kurikulum untuk membuka status revisi.');
          return;
        }
        openForm(row);
        return;
      }
      if (!delBtn) return;
      const targetRow = state.rows.find((r) => r.id === delBtn.dataset.mkDel);
      if (targetRow && targetRow[def.statusField || 'status'] === 'Disetujui (ACC)' && !this.isApprover(def) && def.approverRoles) {
        alert('Perangkat yang telah disetujui (ACC) tidak dapat dihapus. Silakan hubungi bagian Kurikulum.');
        return;
      }
      if (!confirm('Yakin ingin menghapus data ini?')) return;
      try {
        await db.ref(`${def.node}/${delBtn.dataset.mkDel}`).remove();
        this.audit('delete', def.node, delBtn.dataset.mkDel);
        state.rows = state.rows.filter((r) => r.id !== delBtn.dataset.mkDel);
        paint();
      } catch (error) {
        console.error(error);
        alert('Gagal menghapus. Pastikan Anda memiliki akses untuk unit ini.');
      }
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('#mk-save');
      btn.disabled = true;
      btn.textContent = 'Menyimpan...';
      const payload = {};
      try {
        for (const f of def.fields) {
          if (f.readonly) continue;
          if (f.type === 'file') {
            const fileEl = form.querySelector(`#mk-f-${f.key}_file`);
            const hiddenEl = form.querySelector(`#mk-f-${f.key}`);
            let value = hiddenEl.value.trim();
            if (fileEl && fileEl.files && fileEl.files[0]) {
              btn.textContent = 'Memeriksa berkas...';
              const up = await DriveBridge.uploadFile(fileEl.files[0], {
                folderKey: f.folderKey || 'uploads',
                onProgress: (msg) => { btn.textContent = msg; }
              });
              value = up.fileUrl;
              hiddenEl.value = value;
            }
            if (f.required && !value) {
              alert(`${f.label} wajib diunggah.`);
              throw new Error('Validation failed');
            }
            payload[f.key] = value;
            continue;
          }
          const el = form.querySelector(`#mk-f-${f.key}`);
          if (f.type === 'multi') {
            const chosen = {};
            el.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
              chosen[cb.value] = true;
            });
            if (f.required && !Object.keys(chosen).length) {
              alert(`${f.label} wajib diisi.`);
              throw new Error('Validation failed');
            }
            payload[f.key] = chosen;
            continue;
          }
          let value = el.value.trim();
          if (f.required && !value) {
            alert(`${f.label} wajib diisi.`);
            el.focus();
            throw new Error('Validation failed');
          }
          if (f.type === 'money') {
            value = window.AppConfig?.parseRupiah ? window.AppConfig.parseRupiah(value) : (value === '' ? 0 : Number(String(value).replace(/[^0-9]/g, '')));
          } else if (f.type === 'number') {
            value = value === '' ? 0 : Number(value);
          }
          payload[f.key] = value;
          if (f.ref) payload[`${f.key}Name`] = value ? ((refs[f.ref] || {})[value] || '') : '';
        }
        const isApprover = this.isApprover(def);
        const currentRow = state.editing ? state.rows.find((r) => r.id === state.editing) : null;
        if (isOrtu || (!isApprover && def.approverRoles)) {
          if (def.statusField) payload[def.statusField] = 'Diajukan';
        }
        if (!isApprover && def.fields.some((f) => f.key === 'teacherId')) {
          payload.teacherId = currentRow ? (currentRow.teacherId || uid) : uid;
          if (refs.teacher && refs.teacher[payload.teacherId]) {
            payload.teacherIdName = refs.teacher[payload.teacherId];
          }
        }
        if (!isApprover && def.fields.some((f) => f.key === 'reviewerFeedback')) {
          payload.reviewerFeedback = currentRow ? (currentRow.reviewerFeedback || '') : '';
        }
        if (!isApprover && def.fields.some((f) => f.key === 'gtkId')) {
          payload.gtkId = currentRow ? (currentRow.gtkId || uid) : uid;
          if (refs.teacher && refs.teacher[payload.gtkId]) {
            payload.gtkIdName = refs.teacher[payload.gtkId];
          }
        }
        if (!isApprover && def.fields.some((f) => f.key === 'vakasi')) {
          payload.vakasi = currentRow ? (currentRow.vakasi || 0) : 0;
        }
        if (!isApprover && def.fields.some((f) => f.key === 'humasFeedback')) {
          payload.humasFeedback = currentRow ? (currentRow.humasFeedback || '') : '';
        }
        const ctx = refs.__ctx;
        const derived = def.derive ? def.derive(payload, ctx) : {};
        const stamp = firebase.database.ServerValue.TIMESTAMP;
        let recordId = state.editing;
        if (state.editing) {
          await db.ref(`${def.node}/${state.editing}`).update({ ...payload, ...derived, updatedAt: stamp, updatedBy: uid });
        } else {
          const ref = db.ref(def.node).push();
          recordId = ref.key;
          await ref.set({ ...payload, ...derived, createdAt: stamp, createdBy: uid, createdByName: (Auth.userData && Auth.userData.name) || '' });
        }
        if (def.after) await def.after({ ...payload, ...derived }, ctx, recordId);
        this.audit(state.editing ? 'update' : 'create', def.node, recordId);
        if (typeof NotificationService !== 'undefined') {
          NotificationService.notifyModuleChange({
            node: def.node,
            noun: def.noun,
            payload,
            isEditing: state.editing,
            uid,
            uploaderName: (Auth.userData && Auth.userData.name) || (Auth.currentUser && Auth.currentUser.displayName) || 'GTK',
            isApprover
          });
          NotificationService.updateActionBadges();
        }
        closeForm();
        state.rows = await loadRows();
        paint();
      } catch (error) {
        if (error.message !== 'Validation failed') {
          console.error(error);
          alert('Gagal menyimpan atau mengunggah file. Pastikan Anda memiliki akses untuk unit ini.');
        }
      } finally {
        const btn = form.querySelector('#mk-save');
        btn.disabled = false;
        btn.textContent = 'Simpan';
      }
    });
  },
  audit(action, node, recordId) {
    if (!isDBReady()) return;
    const user = Auth.currentUser;
    if (!user) return;
    db.ref('audit_logs').push({
      uid: user.uid,
      name: (Auth.userData && Auth.userData.name) || '',
      role: Auth.currentRole || '',
      action,
      node,
      recordId: recordId || '',
      createdAt: firebase.database.ServerValue.TIMESTAMP
    }).catch((error) => console.error(error));
  },
  fieldHtml(field, refs) {
    const id = `mk-f-${field.key}`;
    const req = field.required ? ' required' : '';
    const dis = field.readonly ? ' disabled' : '';
    let control;
    if (field.type === 'multi') {
      const options = Object.entries(refs[field.ref] || {}).sort((a, b) => String(a[1]).localeCompare(String(b[1])));
      control = `<div id="${id}" class="checkbox-grid mk-multi">${options.map(([k, label]) => `<label class="checkbox-card"><input type="checkbox" value="${this.esc(k)}"><span>${this.esc(label)}</span></label>`).join('') || '<p class="text-muted">Belum ada pilihan tersedia.</p>'}</div>`;
    } else if (field.ref) {
      const options = Object.entries(refs[field.ref] || {}).sort((a, b) => String(a[1]).localeCompare(String(b[1])));
      control = `<select id="${id}"${req}${dis}><option value="">-- Pilih --</option>${options.map(([k, label]) => `<option value="${this.esc(k)}">${this.esc(label)}</option>`).join('')}</select>`;
    } else if (field.type === 'select') {
      let options = this.optionList(field);
      if (field.key === 'semester' && (!options || !options.length) && refs.__settings) {
        const s = refs.__settings;
        const y = s.currentAcademicYear || s.academicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
        const sem = (s.currentSemester === '2' || s.semester === 'Genap') ? 'Semester 2 (Genap)' : 'Semester 1 (Ganjil)';
        const otherSem = sem === 'Semester 1 (Ganjil)' ? 'Semester 2 (Genap)' : 'Semester 1 (Ganjil)';
        options = [
          { value: `${sem} - T.A. ${y}`, label: `${sem} - T.A. ${y}` },
          { value: `${otherSem} - T.A. ${y}`, label: `${otherSem} - T.A. ${y}` },
          { value: `1 Tahun Penuh - T.A. ${y}`, label: `1 Tahun Penuh - T.A. ${y}` }
        ];
      }
      control = `<select id="${id}"${req}${dis}>${field.required ? '' : '<option value="">-- Pilih --</option>'}${options.map((o) => `<option value="${this.esc(o.value)}">${this.esc(o.label)}</option>`).join('')}</select>`;
    } else if (field.type === 'textarea') {
      control = `<textarea id="${id}" rows="3"${req}${dis}></textarea>`;
    } else if (field.type === 'file') {
      control = `<div class="mk-file-box"><input type="hidden" id="${id}"><input type="file" id="${id}_file" class="mk-file-input" accept="${field.accept || '*/*'}"><div class="mk-file-hint text-muted"><i class="ph ph-upload-simple"></i> Unggah berkas dari perangkat (PDF, Dokumen, atau Gambar)</div><div id="${id}_hint_info" class="mk-file-hint-info mt-5 text-sm"></div><div id="${id}_current" class="mk-file-current"></div></div>`;
    } else if (field.type === 'money') {
      control = `<div class="input-money-wrap"><span class="input-money-prefix">Rp</span><input type="text" inputmode="numeric" id="${id}" class="input-money" placeholder="0" data-type="money"${req}${dis}></div>`;
    } else {
      const type = field.type === 'number' ? 'number' : (['date', 'time'].includes(field.type) ? field.type : 'text');
      const min = type === 'number' ? ' min="0" step="any"' : '';
      control = `<input type="${type}" id="${id}"${min}${req}${dis}>`;
    }
    return `<div class="form-group${field.wide ? ' mk-wide' : ''}"><label for="${id}">${this.esc(field.label)}</label>${control}</div>`;
  },
  async renderMyClasses(container, def, title) {
    Router.setTitle(title, def.subtitle || '');
    container.innerHTML = this.renderLoading('Memuat data...');
    const uid = Auth.currentUser ? Auth.currentUser.uid : '';
    const [classes, students, progress] = await Promise.all([
      this.fetchObject(def.classNode),
      DB.getAllStudents(),
      this.fetchObject(def.progressNode)
    ]);
    const all = this.isPrivileged() || this.hasUnit(def.allUnit);
    const mine = Object.entries(classes).filter(([, cls]) => all || cls[def.ownerKey] === uid);
    const cards = mine.map(([classId, cls]) => {
      const ids = Object.keys(cls.students || {});
      const rows = ids.map((sid) => {
        const student = (students || {})[sid] || {};
        const pos = progress[sid] || {};
        return `<tr><td>${this.esc(student.name || sid)}</td><td>${this.esc(pos.level || '-')}</td><td>${this.esc(pos.page || '-')}</td><td>${this.esc(pos.status || '-')}</td><td>${this.esc(pos.date || '-')}</td></tr>`;
      }).join('') || '<tr><td colspan="5" class="text-muted">Belum ada siswa di rombel ini.</td></tr>';
      return `
        <section class="card section-block" data-class="${this.esc(classId)}">
          <div class="card-header mk-header">
            <h3 class="card-title"><i class="ph ph-chalkboard-teacher"></i> ${this.esc(cls.name)}</h3>
            <span class="badge badge-primary">${this.esc(cls.level || '-')} - ${ids.length} siswa</span>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Siswa</th><th>Jilid / Level</th><th>Halaman</th><th>Capaian</th><th>Terakhir</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>`;
    }).join('');
    container.innerHTML = cards || '<div class="card section-block"><div class="card-body text-muted">Belum ada rombel yang ditugaskan kepada Anda. Hubungi koordinator.</div></div>';
  },
  async renderBackup(container, def, title) {
    Router.setTitle(title, def.subtitle || '');
    const history = (await this.fetchRows('it_admin/backups', 20)).reverse();
    container.innerHTML = `
      <section class="card section-block">
        <div class="card-header mk-header"><h3 class="card-title"><i class="ph ph-cloud-arrow-down"></i> Cadangkan Data</h3></div>
        <div class="card-body">
          <p class="text-muted">Pilih koleksi data yang akan diunduh sebagai berkas cadangan. Pemulihan data dilakukan melalui pusat kontrol admin demi keamanan.</p>
          <div class="checkbox-grid mk-multi" id="bk-nodes">
            ${def.nodes.map((node) => `<label class="checkbox-card"><input type="checkbox" value="${this.esc(node)}" checked><span>${this.esc(node)}</span></label>`).join('')}
          </div>
          <div class="mk-toolbar mk-actions">
            <button type="button" class="btn btn-primary" id="bk-run"><i class="ph ph-download-simple"></i> Unduh Cadangan</button>
            <span class="text-muted" id="bk-status"></span>
          </div>
        </div>
      </section>
      <section class="card section-block">
        <div class="card-header mk-header"><h3 class="card-title"><i class="ph ph-clock-counter-clockwise"></i> Riwayat Cadangan</h3></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Waktu</th><th>Oleh</th><th>Koleksi</th><th>Ukuran</th></tr></thead>
            <tbody>${history.map((h) => `<tr><td>${this.esc(this.fmtStamp(h.createdAt))}</td><td>${this.esc(h.createdByName || '-')}</td><td>${this.esc(Object.keys(h.nodes || {}).join(', '))}</td><td>${this.esc(Math.round((h.bytes || 0) / 1024))} KB</td></tr>`).join('') || '<tr><td colspan="4" class="text-muted">Belum ada riwayat.</td></tr>'}</tbody>
          </table>
        </div>
      </section>`;
    const status = container.querySelector('#bk-status');
    container.querySelector('#bk-run').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const chosen = Array.from(container.querySelectorAll('#bk-nodes input:checked')).map((cb) => cb.value);
      if (!chosen.length) {
        alert('Pilih minimal satu koleksi.');
        return;
      }
      btn.disabled = true;
      status.textContent = 'Mengambil data...';
      try {
        const dump = {};
        for (const node of chosen) dump[node] = await this.fetchObject(node);
        const json = JSON.stringify({ exportedAt: new Date().toISOString(), data: dump });
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${this.today()}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        const flags = {};
        chosen.forEach((node) => {
          flags[node.replace(/\//g, '_')] = true;
        });
        await db.ref('it_admin/backups').push({
          nodes: flags,
          bytes: json.length,
          createdBy: Auth.currentUser.uid,
          createdByName: (Auth.userData && Auth.userData.name) || '',
          createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        status.textContent = 'Cadangan berhasil diunduh.';
      } catch (error) {
        console.error(error);
        status.textContent = 'Gagal mengambil sebagian data. Periksa hak akses.';
      } finally {
        btn.disabled = false;
      }
    });
  },
  monthBounds(month) {
    const [y, m] = month.split('-').map(Number);
    const last = new Date(y, m, 0).getDate();
    return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, '0')}` };
  },
  async renderCashbook(container, def, title) {
    Router.setTitle(title, def.subtitle || '');
    const state = { month: this.today().slice(0, 7), rows: [], opening: 0 };
    container.innerHTML = `
      <section class="card-grid section-spacer" id="cb-summary"></section>
      <section class="card section-block">
        <div class="card-header mk-header">
          <h3 class="card-title"><i class="ph ph-book-open"></i> Buku Kas Umum</h3>
          <div class="mk-toolbar">
            <input type="month" id="cb-month" class="mk-filter" value="${state.month}">
            <button type="button" class="btn btn-outline btn-sm" id="cb-xls"><i class="ph ph-file-xls"></i> Excel</button>
            <button type="button" class="btn btn-outline btn-sm" id="cb-pdf"><i class="ph ph-file-pdf"></i> PDF</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Tanggal</th><th>No. Bukti</th><th>Uraian</th><th class="text-right">Penerimaan</th><th class="text-right">Pengeluaran</th><th class="text-right">Saldo</th></tr></thead>
            <tbody id="cb-body"></tbody>
          </table>
        </div>
      </section>`;
    const load = async () => {
      const bounds = this.monthBounds(state.month);
      const all = isDBReady()
        ? await db.ref('finance/ledger').orderByChild('date').endAt(bounds.end).once('value')
        : null;
      state.rows = [];
      state.opening = 0;
      if (all) {
        all.forEach((child) => {
          const row = { id: child.key, ...child.val() };
          const amount = Number(row.amount || 0);
          const signed = row.type === 'expense' ? -amount : amount;
          if (String(row.date || '') < bounds.start) state.opening += signed;
          else state.rows.push(row);
        });
      }
      state.rows.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.id).localeCompare(String(b.id)));
      paint();
    };
    const lines = () => {
      let balance = state.opening;
      let income = 0;
      let expense = 0;
      const out = state.rows.map((row) => {
        const amount = Number(row.amount || 0);
        const isExp = row.type === 'expense';
        balance += isExp ? -amount : amount;
        if (isExp) expense += amount;
        else income += amount;
        return { date: row.date || '-', ref: row.refNo || '-', desc: row.description || '-', debit: isExp ? 0 : amount, credit: isExp ? amount : 0, balance };
      });
      return { out, income, expense, closing: balance };
    };
    const paint = () => {
      const { out, income, expense, closing } = lines();
      container.querySelector('#cb-body').innerHTML = `
        <tr class="mk-row-muted"><td colspan="5"><strong>Saldo Awal</strong></td><td class="text-right"><strong>${this.money(state.opening)}</strong></td></tr>
        ${out.map((l) => `<tr><td>${this.esc(l.date)}</td><td>${this.esc(l.ref)}</td><td>${this.esc(l.desc)}</td><td class="text-right">${l.debit ? this.money(l.debit) : '-'}</td><td class="text-right">${l.credit ? this.money(l.credit) : '-'}</td><td class="text-right">${this.money(l.balance)}</td></tr>`).join('') || '<tr><td colspan="6" class="text-muted">Tidak ada transaksi pada bulan ini.</td></tr>'}
        <tr class="mk-row-muted"><td colspan="3"><strong>Jumlah</strong></td><td class="text-right"><strong>${this.money(income)}</strong></td><td class="text-right"><strong>${this.money(expense)}</strong></td><td class="text-right"><strong>${this.money(closing)}</strong></td></tr>`;
      container.querySelector('#cb-summary').innerHTML = [
        ['Saldo Awal', state.opening, 'primary', 'ph-bank'],
        ['Penerimaan', income, 'success', 'ph-arrow-down-left'],
        ['Pengeluaran', expense, 'danger', 'ph-arrow-up-right'],
        ['Saldo Akhir', closing, 'warning', 'ph-wallet']
      ].map(([label, value, tone, icon]) => `
        <div class="card stat-card">
          <div class="stat-icon stat-icon--${tone}"><i class="ph ${icon}"></i></div>
          <div><p class="stat-value">${this.money(value)}</p><p class="stat-label text-muted">${label}</p></div>
        </div>`).join('');
    };
    container.querySelector('#cb-month').addEventListener('change', (e) => {
      if (!e.target.value) return;
      state.month = e.target.value;
      load();
    });
    container.querySelector('#cb-xls').addEventListener('click', () => {
      if (!window.XLSX) {
        alert('Library Excel belum dimuat.');
        return;
      }
      const { out, closing } = lines();
      const data = [{ Tanggal: '', 'No. Bukti': '', Uraian: 'Saldo Awal', Penerimaan: '', Pengeluaran: '', Saldo: state.opening }]
        .concat(out.map((l) => ({ Tanggal: l.date, 'No. Bukti': l.ref, Uraian: l.desc, Penerimaan: l.debit, Pengeluaran: l.credit, Saldo: l.balance })))
        .concat([{ Tanggal: '', 'No. Bukti': '', Uraian: 'Saldo Akhir', Penerimaan: '', Pengeluaran: '', Saldo: closing }]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'BKU');
      XLSX.writeFile(wb, `BKU_${state.month}.xlsx`);
    });
    container.querySelector('#cb-pdf').addEventListener('click', () => {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('Library PDF belum dimuat.');
        return;
      }
      const { out, closing } = lines();
      const doc = new window.jspdf.jsPDF();
      doc.setFontSize(14);
      doc.text(`Buku Kas Umum - ${state.month}`, 14, 15);
      const body = [['', '', 'Saldo Awal', '', '', this.money(state.opening)]]
        .concat(out.map((l) => [l.date, l.ref, l.desc, l.debit ? this.money(l.debit) : '-', l.credit ? this.money(l.credit) : '-', this.money(l.balance)]))
        .concat([['', '', 'Saldo Akhir', '', '', this.money(closing)]]);
      doc.autoTable({ head: [['Tanggal', 'No. Bukti', 'Uraian', 'Penerimaan', 'Pengeluaran', 'Saldo']], body, startY: 22, theme: 'grid', styles: { fontSize: 8 } });
      doc.save(`BKU_${state.month}.pdf`);
    });
    await load();
  },
  showFilePreview(rawUrl, title = 'Pratinjau Berkas') {
    if (!rawUrl) return;
    document.querySelectorAll('.mk-preview-overlay').forEach((m) => m.remove());
    const url = rawUrl.trim();
    const driveId = typeof DriveBridge !== 'undefined' && DriveBridge.extractFileId ? DriveBridge.extractFileId(url) : (url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/))?.[1];
    const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i.test(url) || url.startsWith('data:image/');
    const viewerUrl = typeof DriveBridge !== 'undefined' && DriveBridge.getViewerUrl ? DriveBridge.getViewerUrl(url, title) : url;
    const downloadUrl = (driveId && typeof DriveBridge !== 'undefined' && DriveBridge.getDownloadUrl) ? DriveBridge.getDownloadUrl(driveId) : url;
    let contentHtml = '';
    if (isImage) {
      const imgSrc = typeof DriveBridge !== 'undefined' ? DriveBridge.normalizeDriveImageUrl(url, 'w1200', url) : url;
      contentHtml = `<div class="mk-preview-img-wrap"><img src="${this.esc(imgSrc)}" alt="${this.esc(title)}" class="mk-preview-img"></div>`;
    } else if (driveId) {
      contentHtml = `<div class="mk-preview-frame-wrap"><div class="mk-preview-corner-guard"></div><iframe src="https://drive.google.com/file/d/${this.esc(driveId)}/preview" class="mk-preview-frame" allow="autoplay"></iframe></div>`;
    } else if (/\.pdf(\?.*)?$/i.test(url)) {
      contentHtml = `<div class="mk-preview-frame-wrap"><div class="mk-preview-corner-guard"></div><iframe src="${this.esc(url)}" class="mk-preview-frame"></iframe></div>`;
    } else {
      contentHtml = `<div class="mk-preview-fallback"><i class="ph ph-file-arrow-down mk-preview-fallback-icon"></i><p class="text-muted">Pratinjau langsung tidak tersedia untuk format berkas ini.</p><a href="${this.esc(downloadUrl)}" class="btn btn-primary" download><i class="ph ph-download-simple"></i> Unduh Berkas</a></div>`;
    }
    const modal = document.createElement('div');
    modal.className = 'modal-overlay mk-preview-overlay active';
    modal.innerHTML = `
      <div class="modal modal-wide mk-preview-modal">
        <div class="modal-header">
          <h3 class="modal-title"><i class="ph ph-file-text"></i> ${this.esc(title)}</h3>
          <button class="btn-icon" type="button" data-close-preview="1"><i class="ph ph-x"></i></button>
        </div>
        <div class="modal-body mk-preview-body">
          ${contentHtml}
        </div>
        <div class="modal-footer">
          <a href="${this.esc(downloadUrl)}" class="btn btn-outline" download><i class="ph ph-download-simple"></i> Unduh</a>
          <a href="${this.esc(viewerUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline"><i class="ph ph-arrow-square-out"></i> Buka di Tab Baru</a>
          <button type="button" class="btn btn-primary" data-close-preview="1">Tutup</button>
        </div>
      </div>
    `;
    const closeModal = () => {
      document.removeEventListener('keydown', keyHandler);
      modal.remove();
    };
    const keyHandler = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', keyHandler);
    modal.querySelectorAll('[data-close-preview]').forEach((el) => {
      el.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      };
    });
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
    document.body.appendChild(modal);
  }
};