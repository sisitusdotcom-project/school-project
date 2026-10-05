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
  REF_LOADERS: {
    student: () => DB.getAllStudents(),
    class: () => DB.getClasses(),
    subject: () => DB.getSubjects(),
    user: () => DB.getAllUsers(),
    asset: () => DB.getFacilityAssets(),
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
    return this.isPrivileged(def) || (def.seeAllUnits || []).some((u) => this.hasUnit(u));
  },
  isPrivileged() {
    return Auth.currentRole === AppConfig.ROLES.ADMIN;
  },
  canWrite(def) {
    const role = Auth.currentRole;
    if (role === AppConfig.ROLES.ADMIN) return true;
    if ((def.writeRoles || []).includes(role)) return true;
    const units = (def.writeRoles || []).map((r) => this.UNIT_BY_ROLE[r]).filter(Boolean).concat(def.units || []);
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
    return new Date().toISOString().slice(0, 10);
  },
  optionList(field) {
    return (field.options || []).map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt));
  },
  async loadRefs(def) {
    const kinds = [...new Set((def.fields || []).filter((f) => f.ref).map((f) => f.ref))];
    const ctx = { uid: Auth.currentUser ? Auth.currentUser.uid : '', admin: this.isPrivileged(def), meta: { studentClass: {} } };
    const refs = {};
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
      return this.esc((refs[field.ref] || {})[value] || '-');
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
    if (field.type === 'link' && value) {
      return `<a href="${this.esc(value)}" target="_blank" rel="noopener noreferrer">Buka</a>`;
    }
    return this.esc(value === undefined || value === '' ? '-' : value);
  },
  plain(def, field, row, refs) {
    const value = row[field.key];
    if (field.type === 'timestamp') return this.fmtStamp(value);
    if (field.type === 'multi') return Object.keys(value || {}).map((id) => (refs[field.ref] || {})[id] || id).join(', ');
    if (field.ref) return row[`${field.key}Name`] || (refs[field.ref] || {})[value] || '-';
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
    container.innerHTML = '<div class="card section-block"><div class="card-body text-muted">Memuat data...</div></div>';
    const writable = !def.readOnly && this.canWrite(def);
    const canAdd = writable && !def.noAdd;
    const canDel = writable && !def.noDelete;
    const uid = Auth.currentUser ? Auth.currentUser.uid : '';
    const loadRows = async () => {
      const all = await this.fetchRows(def.node);
      return !def.own || this.sees(def) ? all : all.filter((r) => r.createdBy === uid);
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
            <button type="button" class="btn btn-outline btn-sm" id="mk-export"><i class="ph ph-file-xls"></i> Excel</button>
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
            <button type="button" class="btn btn-sm btn-outline" data-mk-edit="${row.id}" title="Ubah"><i class="ph ph-pencil-simple"></i></button>
            ${canDel ? `<button type="button" class="btn btn-sm btn-danger" data-mk-del="${row.id}" title="Hapus"><i class="ph ph-trash"></i></button>` : ''}
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
      const data = filtered().map((row, index) => {
        const out = { No: index + 1 };
        def.fields.forEach((f) => {
          out[f.label] = this.plain(def, f, row, refs);
        });
        return out;
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Data');
      XLSX.writeFile(wb, `${(def.noun || title).replace(/[^A-Za-z0-9]+/g, '_')}.xlsx`);
    });
    if (!writable) return;
    const modalId = 'mk-modal';
    const form = container.querySelector('#mk-form');
    const openForm = (row) => {
      state.editing = row ? row.id : null;
      container.querySelector('#mk-modal-title').textContent = `${row ? 'Ubah' : 'Tambah'} ${def.noun || title}`;
      def.fields.forEach((f) => {
        const el = form.querySelector(`#mk-f-${f.key}`);
        const value = row ? row[f.key] : (f.default !== undefined ? f.default : (f.type === 'date' ? this.today() : ''));
        if (f.type === 'multi') {
          const chosen = value && typeof value === 'object' ? value : {};
          el.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
            cb.checked = !!chosen[cb.value];
          });
          return;
        }
        el.value = value === undefined || value === null ? '' : value;
      });
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
        openForm(state.rows.find((r) => r.id === editBtn.dataset.mkEdit));
        return;
      }
      if (!delBtn) return;
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
      const payload = {};
      for (const f of def.fields) {
        if (f.readonly) continue;
        const el = form.querySelector(`#mk-f-${f.key}`);
        if (f.type === 'multi') {
          const chosen = {};
          el.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
            chosen[cb.value] = true;
          });
          if (f.required && !Object.keys(chosen).length) {
            alert(`${f.label} wajib diisi.`);
            return;
          }
          payload[f.key] = chosen;
          continue;
        }
        let value = el.value.trim();
        if (f.required && !value) {
          alert(`${f.label} wajib diisi.`);
          el.focus();
          return;
        }
        if (f.type === 'number' || f.type === 'money') value = value === '' ? 0 : Number(value);
        payload[f.key] = value;
        if (f.ref) payload[`${f.key}Name`] = value ? ((refs[f.ref] || {})[value] || '') : '';
      }
      const ctx = refs.__ctx;
      const derived = def.derive ? def.derive(payload, ctx) : {};
      const btn = form.querySelector('#mk-save');
      btn.disabled = true;
      btn.textContent = 'Menyimpan...';
      try {
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
        closeForm();
        state.rows = await loadRows();
        paint();
      } catch (error) {
        console.error(error);
        alert('Gagal menyimpan. Pastikan Anda memiliki akses untuk unit ini.');
      } finally {
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
      control = `<select id="${id}"${req}${dis}>${field.required ? '' : '<option value="">-- Pilih --</option>'}${this.optionList(field).map((o) => `<option value="${this.esc(o.value)}">${this.esc(o.label)}</option>`).join('')}</select>`;
    } else if (field.type === 'textarea') {
      control = `<textarea id="${id}" rows="3"${req}${dis}></textarea>`;
    } else {
      const type = ['number', 'money'].includes(field.type) ? 'number' : (['date', 'time'].includes(field.type) ? field.type : 'text');
      const min = type === 'number' ? ' min="0" step="any"' : '';
      control = `<input type="${type}" id="${id}"${min}${req}${dis}>`;
    }
    return `<div class="form-group${field.wide ? ' mk-wide' : ''}"><label for="${id}">${this.esc(field.label)}</label>${control}</div>`;
  },
  async renderMyClasses(container, def, title) {
    Router.setTitle(title, def.subtitle || '');
    container.innerHTML = '<div class="card section-block"><div class="card-body text-muted">Memuat data...</div></div>';
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
          <p class="text-muted">Pilih koleksi yang akan diunduh sebagai berkas JSON. Restore dilakukan manual oleh admin melalui Firebase Console demi keamanan.</p>
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
  }
};
