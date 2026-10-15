const AdminPages = {
  async renderDashboard(container) {
    Router.setTitle('Dashboard admin', 'Ringkasan data dan pengaturan sistem.');
    const [settings, users, classes, chars, students] = await Promise.all([
      DB.getSettings(),
      DB.getAllUsers(),
      DB.getClasses(),
      DB.getCharacters(),
      DB.getAllStudents()
    ]);
    const attendanceRules = settings.attendanceRules || {};
    const userArr = DB.toArray(users);
    const classArr = DB.toArray(classes);
    const charArr = DB.toArray(chars);
    const studentArr = DB.toArray(students);
    const guruCount = userArr.filter(u => u.role === AppConfig.ROLES.GURU || AppConfig.getRoleAssignments(u).some(AppConfig.isTeachingAssignment)).length;
    const ortuCount = userArr.filter(u => u.role === AppConfig.ROLES.ORTU).length;
    const summaryCards = [
      { label: 'Pengguna aktif', value: userArr.length, tone: 'primary', icon: 'ph-users' },
      { label: 'Guru', value: guruCount, tone: 'success', icon: 'ph-chalkboard-teacher' },
      { label: 'Kelas', value: classArr.length, tone: 'warning', icon: 'ph-books' },
      { label: 'Siswa', value: studentArr.length, tone: 'danger', icon: 'ph-student' }
    ];
    container.innerHTML = `
      <section class="card-grid section-spacer">
        ${summaryCards.map((item) => `
          <div class="card stat-card">
            <div class="stat-icon stat-icon--${item.tone}"><i class="ph ${item.icon}"></i></div>
            <div><p class="stat-value">${item.value}</p><p class="stat-label text-muted">${item.label}</p></div>
          </div>
        `).join('')}
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Operasional Administrator Sistem</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            <a href="#/admin/users" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-users-three"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Kelola Pengguna</div>
                <div class="quick-nav-desc">Akun login, reset sandi & peran</div>
              </div>
            </a>
            <a href="#/admin/assignments" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-tree-structure"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Distribusi Penugasan</div>
                <div class="quick-nav-desc">Plotting Waka, Staf & Tim Unit</div>
              </div>
            </a>
            <a href="#/attendance" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-map-pin"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Presensi Kehadiran</div>
                <div class="quick-nav-desc">Presensi GPS mandiri staf/admin</div>
              </div>
            </a>
            <a href="#/admin/attendance" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-clock-user"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pantau Disiplin Guru</div>
                <div class="quick-nav-desc">Monitoring presensi harian GTK</div>
              </div>
            </a>
            <a href="#/admin/classes" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-chalkboard"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pembagian Rombel</div>
                <div class="quick-nav-desc">Daftar kelas & penugasan wali</div>
              </div>
            </a>
            <a href="#/admin/subjects" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-book-open"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pemetaan Mapel & Guru</div>
                <div class="quick-nav-desc">Distribusi guru pengampu mapel</div>
              </div>
            </a>
            <a href="#/admin/characters" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-star"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Indikator Karakter</div>
                <div class="quick-nav-desc">Rubrik adab & sikap murid</div>
              </div>
            </a>
            <a href="#/it-admin/backup" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-cloud-arrow-down"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Backup & Restore</div>
                <div class="quick-nav-desc">Pencadangan database sistem</div>
              </div>
            </a>
          </div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title">Konfigurasi sekolah</h3>
        </div>
        <ul class="list-plain">
          <li>Tahun ajaran: <strong>${settings.currentAcademicYear}</strong></li>
          <li>Semester aktif: <strong>${settings.currentSemester}</strong></li>
          <li>Indikator karakter aktif: <strong>${charArr.filter(c => c.active !== false).length}</strong></li>
          <li>Orang tua terdaftar: <strong>${ortuCount}</strong></li>
        </ul>
      </section>
    `;
  },
  async renderCharacters(container) {
    Router.setTitle('Indikator karakter', 'Aspek karakter yang dinilai guru.');
    const chars = await DB.getCharacters();
    const charArr = DB.toArray(chars).sort((a, b) => (a.order || 0) - (b.order || 0));
    const rows = charArr.length ? charArr.map(c => `
      <tr>
        <td>${c.order || '-'}</td>
        <td><strong>${AppConfig.escapeHtml(c.name)}</strong></td>
        <td><span class="badge ${c.active !== false ? 'badge-success' : 'badge-danger'}">${c.active !== false ? 'Aktif' : 'Nonaktif'}</span></td>
        <td class="action-cell">
          <button class="btn btn-outline btn-sm" data-edit-char="${c.id}"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn btn-danger btn-sm" data-del-char="${c.id}"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada indikator. Klik "Tambah" untuk memulai.</td></tr>';
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar aspek karakter</h3>
          <button class="btn btn-primary" id="btn-add-char"><i class="ph ph-plus"></i> Tambah</button>
        </div>
        <div class="table-responsive">
          <table class="table"><thead><tr><th class="table-col-sm">No</th><th>Nama</th><th>Status</th><th class="table-col-md">Aksi</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>
      ${AdminPages._charModal()}
    `;
    document.getElementById('btn-add-char').onclick = () => AdminPages._openCharModal(null, charArr.length + 1);
    container.querySelectorAll('[data-edit-char]').forEach(btn => {
      btn.onclick = () => {
        const c = charArr.find(x => x.id === btn.dataset.editChar);
        if (c) AdminPages._openCharModal(c);
      };
    });
    container.querySelectorAll('[data-del-char]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Yakin hapus indikator ini?')) return;
        await DB.deleteCharacter(btn.dataset.delChar);
        AdminPages.renderCharacters(container);
      };
    });
    document.getElementById('form-char').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('char-id').value || null;
      await DB.saveCharacter(id, {
        name: document.getElementById('char-name').value.trim(),
        order: parseInt(document.getElementById('char-order').value) || 1,
        active: document.getElementById('char-active').value === 'true'
      });
      App.closeModal('modal-char');
      AdminPages.renderCharacters(container);
    };
  },
  _charModal() {
    return `
    <div class="modal-overlay" id="modal-char">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="char-modal-title">Tambah indikator</h3>
          <button class="btn-icon" data-close-modal="modal-char"><i class="ph ph-x"></i></button>
        </div>
        <form id="form-char">
          <div class="modal-body">
            <input type="hidden" id="char-id">
            <div class="form-group">
              <label>Nama karakter</label>
              <input id="char-name" required placeholder="Contoh: Disiplin">
            </div>
            <div class="form-group">
              <label>Urutan tampil</label>
              <input id="char-order" type="number" min="1" value="1">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="char-active"><option value="true">Aktif</option><option value="false">Nonaktif</option></select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-close-modal="modal-char">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>`;
  },
  _openCharModal(existing, nextOrder) {
    document.getElementById('char-modal-title').innerText = existing ? 'Edit indikator' : 'Tambah indikator';
    document.getElementById('char-id').value = existing ? existing.id : '';
    document.getElementById('char-name').value = existing ? existing.name : '';
    document.getElementById('char-order').value = existing ? existing.order : (nextOrder || 1);
    document.getElementById('char-active').value = existing ? String(existing.active !== false) : 'true';
    App.openModal('modal-char');
  },
  async renderUsers(container) {
    Router.setTitle('Kelola Pengguna', 'Tambah, edit, dan atur peran pengguna sistem.');
    const [users, classes, subjects] = await Promise.all([
      DB.getAllUsers(),
      DB.getClasses(),
      DB.getSubjects()
    ]);
    let userArr = DB.toArray(users);
    const renderTable = () => {
      const q = (document.getElementById('search-user')?.value || '').toLowerCase();
      const roleFilter = document.getElementById('filter-role')?.value || '';
      const filtered = userArr.filter(u => {
        const matchSearch = (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
        const matchRole = roleFilter ? u.role === roleFilter : true;
        return matchSearch && matchRole;
      });
      const rows = filtered.length ? filtered.map(u => {
        const teachingLabels = DB.buildTeachingLabels(u.id, classes, subjects);
        return `
        <tr>
          <td>
            <strong>${AppConfig.escapeHtml(u.name)}</strong><br>
            <small class="text-muted">
              Email: ${u.email || '-'}<br>
              <span class="user-id-subtext">Default: ${u.id.toLowerCase().replace(/[^a-z0-9]/g, '')}@musada.sch.id</span>
            </small>
            ${teachingLabels.length ? `<div class="mt-4"><small class="text-muted"><i class="ph ph-book-open"></i> ${teachingLabels.map(label => AppConfig.escapeHtml(label)).join(', ')}</small></div>` : ''}
          </td>
          <td>
            <div class="user-badges-container">
              <span class="badge ${AppConfig.getRoleBadgeClass(u.role)}">${AppConfig.PRIMARY_ROLES[u.role] || u.role}</span>
              ${AppConfig.getRoleAssignments(u).map((item) => {
                const label = AppConfig.UNIT_LABELS[item] || (item.startsWith('GURU_KELAS_') ? ('Wali Kelas ' + item.replace('GURU_KELAS_', '').replace(/_/g, ' ')) : item);
                const badgeClass = AppConfig.getAssignmentBadgeClass ? AppConfig.getAssignmentBadgeClass(item) : 'badge-outline';
                return `<span class="badge ${badgeClass}">${AppConfig.escapeHtml(label)}</span>`;
              }).join('')}
            </div>
          </td>
          <td class="action-cell">
            <button class="btn btn-outline btn-sm" data-edit-usr="${u.id}"><i class="ph ph-pencil-simple"></i></button>
            <button class="btn btn-danger btn-sm" data-del-usr="${u.id}"><i class="ph ph-trash"></i></button>
          </td>
        </tr>
      `;
      }).join('') : '<tr><td colspan="4" class="text-center text-muted">Tidak ada pengguna ditemukan.</td></tr>';
      const tbody = container.querySelector('#tbody-users');
      if (tbody) tbody.innerHTML = rows;
      container.querySelectorAll('[data-edit-usr]').forEach(btn => {
        btn.onclick = () => {
          const u = userArr.find(x => x.id === btn.dataset.editUsr);
          if (!u) return;
          document.getElementById('usr-modal-title').innerText = 'Edit pengguna';
          document.getElementById('usr-id').value = u.id;
          document.getElementById('usr-name').value = u.name;
          document.getElementById('usr-email').value = u.email || '';
          document.getElementById('usr-password').value = '';
          document.getElementById('usr-password').placeholder = '(Kosongkan jika tidak diubah)';
          document.getElementById('usr-role').value = u.role;
          const selectedAssignments = AppConfig.normalizeAssignments(u.assignments || []);
          Array.from(document.querySelectorAll('#usr-assignments-group input[type="checkbox"]')).forEach((cb) => {
            cb.checked = selectedAssignments.includes(cb.value);
          });
          document.getElementById('usr-password').removeAttribute('required');
          App.openModal('modal-usr');
        };
      });
      container.querySelectorAll('[data-del-usr]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Yakin menghapus pengguna ini?')) return;
          await DB.deleteUser(btn.dataset.delUsr);
          AdminPages.renderUsers(container);
        };
      });
    };
    container.innerHTML = `
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div class="toolbar-controls">
            <div class="search-box">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" id="search-user" placeholder="Cari nama, email...">
            </div>
            <select id="filter-role" class="toolbar-select">
              <option value="">Semua Peran</option>
              ${Object.entries(AppConfig.PRIMARY_ROLES).map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary" id="btn-add-usr"><i class="ph ph-plus"></i> Tambah Pengguna</button>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Nama / Email</th><th>Peran</th><th class="table-col-md">Aksi</th></tr></thead>
          <tbody id="tbody-users"></tbody></table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-usr">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="usr-modal-title">Tambah pengguna</h3>
            <button class="btn-icon" data-close-modal="modal-usr"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-usr">
            <div class="modal-body">
              <input type="hidden" id="usr-id">
              <div class="form-group"><label>Nama Lengkap</label><input id="usr-name" required></div>
              <div class="form-group"><label>Email (opsional)</label><input type="email" id="usr-email"></div>
              <div class="form-group"><label>Password</label><input type="password" id="usr-password" required minlength="6"></div>
              <div class="form-group"><label>Peran utama</label><select id="usr-role" required>
                ${Object.entries(AppConfig.PRIMARY_ROLES).map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
              </select></div>
              <div class="form-group">
                <label>Tugas / unit kerja tambahan</label>
                <div id="usr-assignments-group">
                  <div class="assignment-section-label">Pimpinan / Waka</div>
                  <div class="checkbox-grid">
                    <label class="checkbox-card"><input type="checkbox" value="WAKA_KURIKULUM"> <span>Waka Kurikulum</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="WAKA_KESISWAAN"> <span>Waka Kesiswaan</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="WAKA_SARPRAS"> <span>Waka Sarpras</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="WAKA_HUMAS_PERSONALIA"> <span>Waka Humas & Personalia</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="WAKA_KEUANGAN"> <span>Waka Keuangan</span></label>
                  </div>
                  <div class="assignment-section-label">Staf Pelaksana Unit</div>
                  <div class="checkbox-grid">
                    <label class="checkbox-card"><input type="checkbox" value="STAF_KURIKULUM"> <span>Staf Kurikulum</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="STAF_KESISWAAN"> <span>Staf Kesiswaan</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="STAF_SARPRAS"> <span>Staf Sarpras</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="STAF_HUMAS_PERSONALIA"> <span>Staf Humas & Personalia</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="STAF_KEUANGAN"> <span>Staf Keuangan</span></label>
                  </div>
                  <div class="assignment-section-label">Tim Khusus & Koordinator Program</div>
                  <div class="checkbox-grid">
                    <label class="checkbox-card"><input type="checkbox" value="KOORD_UMMI"> <span>Koordinator Ummi</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="TIM_UMMI"> <span>Tim Ummi (Guru Al-Qur'an)</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="TIM_IT"> <span>Tim IT & Sistem</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="TIM_B_INGGRIS"> <span>Tim English Lab</span></label>
                  </div>
                  <div class="assignment-section-label">Guru Ekstrakurikuler</div>
                  <div class="checkbox-grid">
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_HW"> <span>Pembina HW</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_TS"> <span>Pembina Tapak Suci</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_PANAHAN_PUTRA"> <span>Ekskul Panahan Putra</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_PANAHAN_PUTRI"> <span>Ekskul Panahan Putri</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_BADMINTON"> <span>Ekskul Badminton</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_RENANG"> <span>Ekskul Renang</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_COOKING"> <span>Ekskul Cooking</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_TARI"> <span>Ekskul Tari</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_LUKIS"> <span>Ekskul Lukis</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_SEMPOA"> <span>Ekskul Sempoa</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_STORY_TELLING"> <span>Ekskul Story Telling</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_TAHFIDZ_CAMP"> <span>Pembina Tahfidz Camp</span></label>
                  </div>
                  <div class="assignment-section-label">Guru Mapel Spesifik</div>
                  <div class="checkbox-grid">
                    <label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_PAI"> <span>Guru Mapel PAI</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_PJOK"> <span>Guru Mapel PJOK</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_B_INGGRIS"> <span>Guru Mapel B. Inggris</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_SENI"> <span>Guru Mapel Seni</span></label>
                    <label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_TIK"> <span>Guru Mapel TIK</span></label>
                  </div>
                </div>
                <small class="text-muted">Pilih satu atau lebih penugasan struktural / tim.</small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-usr">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    `;
    renderTable();
    document.getElementById('search-user').addEventListener('input', renderTable);
    document.getElementById('filter-role').addEventListener('change', renderTable);
    document.getElementById('btn-add-usr').onclick = () => {
      document.getElementById('usr-modal-title').innerText = 'Tambah pengguna';
      document.getElementById('usr-id').value = '';
      document.getElementById('usr-name').value = '';
      document.getElementById('usr-email').value = '';
      document.getElementById('usr-password').value = '';
      document.getElementById('usr-password').placeholder = '';
      document.getElementById('usr-role').value = 'guru';
      Array.from(document.querySelectorAll('#usr-assignments-group input[type="checkbox"]')).forEach((cb) => {
        cb.checked = false;
      });
      document.getElementById('usr-password').setAttribute('required', 'true');
      App.openModal('modal-usr');
    };
    document.getElementById('form-usr').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      const id = document.getElementById('usr-id').value || null;
      const pwd = document.getElementById('usr-password').value;
      const assignments = Array.from(document.querySelectorAll('#usr-assignments-group input[type="checkbox"]:checked')).map((cb) => cb.value);
      const name = document.getElementById('usr-name').value.trim();
      let email = document.getElementById('usr-email').value.trim();
      if (!email) {
        email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@musada.sch.id`;
      }
      const data = {
        name,
        email,
        role: document.getElementById('usr-role').value,
        assignments: assignments
      };
      if (pwd) data.password = pwd;
      try {
        if (!id) {
          if (!pwd || pwd.length < 6) throw new Error('Password minimal 6 karakter.');
          const secApp = firebase.initializeApp(firebaseConfig, 'SecAuth_' + Date.now());
          let newUid = null;
          try {
            const cred = await secApp.auth().createUserWithEmailAndPassword(email, pwd);
            newUid = cred.user.uid;
            await cred.user.updateProfile({ displayName: name });
          } finally {
            await secApp.delete();
          }
          if (newUid) {
            await DB.createUserInDB(newUid, data);
          }
        } else {
          await DB.saveUser(id, data);
        }
        App.closeModal('modal-usr');
        AdminPages.renderUsers(container);
      } catch (err) {
        alert(err.message || 'Gagal menyimpan');
        btn.disabled = false;
        btn.innerHTML = 'Simpan';
      }
    };
  },
  async renderClasses(container) {
    Router.setTitle('Data kelas', 'Kelola kelas dan penugasan wali kelas serta guru mapel.');
    const [classes, users, students, subjects] = await Promise.all([
      DB.getClasses(),
      DB.getAllUsers(),
      DB.getAllStudents(),
      DB.getSubjects()
    ]);
    const classArr = DB.toArray(classes);
    const isKurikulum = Auth.currentRole === AppConfig.ROLES.ADMIN || Auth.currentAssignments.includes('WAKA_KURIKULUM');
    const guruArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.GURU || AppConfig.getRoleAssignments(u).some(AppConfig.isTeachingAssignment));
    const subArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
    const studentArr = DB.toArray(students);
    const rows = classArr.length ? classArr.map(c => {
      const teacher = guruArr.find(g => g.id === c.teacherId);
      const count = studentArr.filter(s => s.classId === c.id).length;
      return `
        <tr>
          <td><strong>${AppConfig.escapeHtml(c.name)}</strong> <span class="badge badge-outline">Fase ${AppConfig.escapeHtml(AppConfig.getClassPhase(c))}</span></td>
          <td>${teacher ? teacher.name : '<span class="text-muted">Belum ditugaskan</span>'}</td>
          <td>${count} siswa</td>
          <td class="action-cell table-col-lg">
            ${isKurikulum ? `<button class="btn btn-outline btn-sm" data-mapel-cls="${c.id}" title="Atur Guru Mapel"><i class="ph ph-books"></i> Mapel</button>` : ''}
            ${isKurikulum ? `<button class="btn btn-outline btn-sm" data-edit-cls="${c.id}" title="Edit Kelas"><i class="ph ph-pencil-simple"></i></button>` : ''}
            <button class="btn btn-outline btn-sm" data-view-cls="${c.id}" title="Lihat Siswa"><i class="ph ph-eye"></i></button>
            ${isKurikulum ? `<button class="btn btn-danger btn-sm" data-del-cls="${c.id}" title="Hapus"><i class="ph ph-trash"></i></button>` : ''}
          </td>
        </tr>`;
    }).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada kelas.</td></tr>';
    const guruOptions = guruArr.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('');
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar kelas</h3>
          ${isKurikulum ? `
            <div class="card-actions">
              <button class="btn btn-outline" id="btn-promo-cls"><i class="ph ph-arrow-fat-lines-up"></i> Kenaikan Kelas</button>
              <button class="btn btn-primary" id="btn-add-cls"><i class="ph ph-plus"></i> Tambah</button>
            </div>
          ` : ''}
        </div>
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Nama Kelas</th><th>Wali Kelas</th><th>Jumlah Siswa</th><th style="width:220px">Aksi</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-cls">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="cls-modal-title">Tambah kelas</h3>
            <button class="btn-icon" data-close-modal="modal-cls"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-cls">
            <div class="modal-body">
              <input type="hidden" id="cls-id">
              <div class="form-group">
                <label>Nama kelas</label>
                <input id="cls-name" required placeholder="Contoh: 4A">
              </div>
              <div class="form-group">
                <label>Wali kelas</label>
                <select id="cls-teacher">
                  <option value="">— Pilih guru —</option>
                  ${guruOptions}
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-cls">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-overlay" id="modal-mapel">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title" id="mapel-modal-title">Mata Pelajaran & Guru Pengampu</h3>
            <button class="btn-icon" data-close-modal="modal-mapel"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-mapel">
            <div class="modal-body">
              <input type="hidden" id="mapel-cls-id">
              <p class="text-muted soft-note">Struktur mata pelajaran bersifat mandiri per rombel. Anda dapat menambah mapel dari bank mapel, menugaskan guru pengampu, atau menghapus mapel dari rombel ini.</p>
              ${isKurikulum ? `
                <div class="rombel-mapel-toolbar">
                  <div class="form-group mb-0 flex-1">
                    <label>Pilih Mata Pelajaran dari Bank Mapel:</label>
                    <select id="mapel-select-add">
                      <option value="">Pilih Mata Pelajaran</option>
                    </select>
                  </div>
                  <button type="button" class="btn btn-primary" id="btn-add-subject-to-class"><i class="ph ph-plus"></i> Tambah ke Rombel</button>
                </div>
              ` : ''}
              <div class="rombel-mapel-header-bar">
                <span id="mapel-count-badge" class="badge badge-primary">0 Mata Pelajaran</span>
                <a href="#/admin/subjects" class="guide-action-link"><i class="ph ph-sliders"></i> Kelola Bank Mapel</a>
              </div>
              <div id="mapel-list-container" class="rombel-mapel-list"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-mapel">Batal</button>
              ${isKurikulum ? `<button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Penugasan Rombel</button>` : ''}
            </div>
          </form>
        </div>
      </div>
      <div class="modal-overlay" id="modal-promo">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title"><i class="ph ph-arrow-fat-lines-up"></i> Kenaikan Kelas & Promosi Rombel</h3>
            <button class="btn-icon" data-close-modal="modal-promo"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-promo">
            <div class="modal-body">
              <p class="text-muted soft-note">Pilih kelas asal dan kelas tujuan untuk memproses kenaikan kelas atau kelulusan siswa secara massal pada akhir tahun ajaran.</p>
              <div class="form-row">
                <div class="form-group">
                  <label>Kelas Asal (Saat Ini)</label>
                  <select id="promo-from-cls" required>
                    <option value="">— Pilih Kelas Asal —</option>
                    ${classArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Kelas Tujuan (Kenaikan / Kelulusan)</label>
                  <select id="promo-to-cls" required>
                    <option value="">— Pilih Kelas Tujuan —</option>
                    ${classArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('')}
                    <option value="LULUS_ALUMNI">Lulus / Alumni (Khusus Kelas 6)</option>
                  </select>
                </div>
              </div>
              <div class="card-header">
                <label><strong>Daftar Siswa yang Akan Dipromosikan:</strong></label>
                <div>
                  <input type="checkbox" id="promo-select-all" checked> <label for="promo-select-all">Pilih Semua</label>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead><tr><th style="width:40px">Pilih</th><th>NIS</th><th>Nama Siswa</th><th>Status</th></tr></thead>
                  <tbody id="promo-students-tbody">
                    <tr><td colspan="4" class="text-center text-muted">Pilih kelas asal terlebih dahulu.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-promo">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-promo"><i class="ph ph-check"></i> Eksekusi Kenaikan Kelas</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const btnAddCls = document.getElementById('btn-add-cls');
    if (btnAddCls) {
      btnAddCls.onclick = () => {
        document.getElementById('cls-modal-title').innerText = 'Tambah kelas';
        document.getElementById('cls-id').value = '';
        document.getElementById('cls-name').value = '';
        document.getElementById('cls-teacher').value = '';
        document.getElementById('modal-cls').classList.add('active');
      };
    }
    container.querySelectorAll('[data-edit-cls]').forEach(btn => {
      btn.onclick = () => {
        const c = classArr.find(x => x.id === btn.dataset.editCls);
        if (!c) return;
        document.getElementById('cls-modal-title').innerText = 'Edit kelas';
        document.getElementById('cls-id').value = c.id;
        document.getElementById('cls-name').value = c.name;
        document.getElementById('cls-teacher').value = c.teacherId || '';
        document.getElementById('modal-cls').classList.add('active');
      };
    });
    let activeClass = null;
    let editingSubjectTeachers = {};
    const categoryBadge = {
      'agama': 'badge-success',
      'standar': 'badge-primary',
      'lokal': 'badge-warning',
      'kekhasan': 'badge-danger'
    };
    const categoryLabel = {
      'agama': 'Agama',
      'standar': 'Umum',
      'lokal': 'Muatan Lokal',
      'kekhasan': 'Kekhasan'
    };
    const updateMapelAddDropdown = () => {
      const addSelect = document.getElementById('mapel-select-add');
      if (!addSelect) return;
      const currentSubIds = Object.keys(editingSubjectTeachers);
      const availableToAdd = subArr.filter(s => !currentSubIds.includes(s.id));
      if (!availableToAdd.length) {
        addSelect.innerHTML = '<option value="">Semua mata pelajaran kurikulum telah terpasang</option>';
        addSelect.disabled = true;
      } else {
        addSelect.disabled = false;
        addSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>' +
          availableToAdd.map(s => `<option value="${s.id}">[${categoryLabel[s.category] || s.category}] ${AppConfig.escapeHtml(s.name)}</option>`).join('');
      }
    };
    const renderMapelList = () => {
      const containerEl = document.getElementById('mapel-list-container');
      const countBadge = document.getElementById('mapel-count-badge');
      if (!containerEl) return;
      const subIds = Object.keys(editingSubjectTeachers);
      if (countBadge) countBadge.textContent = `${subIds.length} Mata Pelajaran Aktif`;
      updateMapelAddDropdown();
      if (!subIds.length) {
        containerEl.innerHTML = '<div class="card text-center text-muted p-3">Belum ada mata pelajaran untuk rombel ini. Pilih dari dropdown di atas untuk menambahkan.</div>';
        return;
      }
      const activeSubjects = subIds.map(sid => {
        const meta = subArr.find(s => s.id === sid) || { id: sid, name: sid, category: 'standar', order: 99 };
        return {
          id: sid,
          name: meta.name || sid,
          category: meta.category || 'standar',
          order: meta.order !== undefined ? meta.order : 99,
          teacherId: editingSubjectTeachers[sid] || ''
        };
      }).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
      containerEl.innerHTML = activeSubjects.map(sub => `
        <div class="rombel-subject-item" data-item-sub="${sub.id}">
          <div class="rombel-subject-info">
            <span class="badge ${categoryBadge[sub.category] || 'badge-primary'}">${categoryLabel[sub.category] || sub.category}</span>
            <strong>${AppConfig.escapeHtml(sub.name)}</strong>
          </div>
          <div class="rombel-subject-controls">
            <select class="mapel-select-input" data-sub-id="${sub.id}" ${!isKurikulum ? 'disabled' : ''}>
              <option value="">Default (Wali Kelas)</option>
              ${guruArr.map(g => `<option value="${g.id}" ${sub.teacherId === g.id ? 'selected' : ''}>${AppConfig.escapeHtml(g.name)}</option>`).join('')}
            </select>
            ${isKurikulum ? `
              <button type="button" class="btn btn-outline btn-danger btn-sm btn-del-rombel-sub" data-del-sub="${sub.id}" title="Hapus dari rombel ini">
                <i class="ph ph-trash"></i>
              </button>
            ` : ''}
          </div>
        </div>
      `).join('');
      containerEl.querySelectorAll('.mapel-select-input').forEach(sel => {
        sel.onchange = (e) => {
          const sid = e.target.dataset.subId;
          editingSubjectTeachers[sid] = e.target.value;
        };
      });
      containerEl.querySelectorAll('.btn-del-rombel-sub').forEach(btn => {
        btn.onclick = () => {
          const sid = btn.dataset.delSub;
          delete editingSubjectTeachers[sid];
          renderMapelList();
        };
      });
    };
    const btnAddSubToClass = document.getElementById('btn-add-subject-to-class');
    if (btnAddSubToClass) {
      btnAddSubToClass.onclick = () => {
        const addSelect = document.getElementById('mapel-select-add');
        const selectedSubId = addSelect ? addSelect.value : '';
        if (!selectedSubId) {
          alert('Pilih mata pelajaran yang ingin ditambahkan terlebih dahulu.');
          return;
        }
        editingSubjectTeachers[selectedSubId] = (activeClass && activeClass.teacherId) || '';
        renderMapelList();
      };
    }
    container.querySelectorAll('[data-mapel-cls]').forEach(btn => {
      btn.onclick = () => {
        const c = classArr.find(x => x.id === btn.dataset.mapelCls);
        if (!c) return;
        activeClass = c;
        editingSubjectTeachers = { ...(c.subjectTeachers || {}) };
        document.getElementById('mapel-modal-title').textContent = `Mata Pelajaran & Guru Pengampu - Kelas ${c.name}`;
        document.getElementById('mapel-cls-id').value = c.id;
        renderMapelList();
        document.getElementById('modal-mapel').classList.add('active');
      };
    });
    container.querySelectorAll('[data-del-cls]').forEach(btn => {
      btn.onclick = async () => {
        const classId = btn.dataset.delCls;
        const studentsInClass = await DB.getStudentsByClass(classId);
        if (Object.keys(studentsInClass || {}).length > 0) {
          alert('Tidak dapat menghapus kelas karena masih ada siswa yang terdaftar di dalamnya. Silakan pindahkan atau hapus siswa terlebih dahulu.');
          return;
        }
        if (!confirm('Yakin ingin menghapus kelas ini secara permanen?')) return;
        await DB.deleteClass(classId);
        AdminPages.renderClasses(container);
      };
    });
    container.querySelectorAll('[data-view-cls]').forEach(btn => {
      btn.onclick = () => {
        window.location.hash = `#/admin/students/${btn.dataset.viewCls}`;
      };
    });
    document.getElementById('form-cls').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('cls-id').value || null;
      const clsName = document.getElementById('cls-name').value.trim();
      await DB.saveClass(id, {
        name: clsName,
        phase: AppConfig.getClassPhase({ name: clsName, id }),
        teacherId: document.getElementById('cls-teacher').value || null
      });
      App.closeModal('modal-cls');
      AdminPages.renderClasses(container);
    };
    document.getElementById('form-mapel').onsubmit = async (e) => {
      e.preventDefault();
      if (!isKurikulum) return;
      const id = document.getElementById('mapel-cls-id').value;
      if (!id) return;
      await DB.saveClassSubjectTeachers(id, editingSubjectTeachers);
      App.closeModal('modal-mapel');
      AdminPages.renderClasses(container);
    };
    const btnPromoCls = document.getElementById('btn-promo-cls');
    if (btnPromoCls) {
      btnPromoCls.onclick = () => {
        document.getElementById('promo-from-cls').value = '';
        document.getElementById('promo-to-cls').value = '';
        document.getElementById('promo-students-tbody').innerHTML = '<tr><td colspan="4" class="text-center text-muted">Pilih kelas asal terlebih dahulu.</td></tr>';
        document.getElementById('modal-promo').classList.add('active');
      };
    }
    const promoFromSelect = document.getElementById('promo-from-cls');
    if (promoFromSelect) {
      promoFromSelect.onchange = () => {
        const fromId = promoFromSelect.value;
        const tbody = document.getElementById('promo-students-tbody');
        if (!fromId) {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Pilih kelas asal terlebih dahulu.</td></tr>';
          return;
        }
        const filteredStudents = studentArr.filter(s => s.classId === fromId).sort((a,b) => a.name.localeCompare(b.name));
        if (!filteredStudents.length) {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Tidak ada siswa terdaftar di kelas ini.</td></tr>';
          return;
        }
        tbody.innerHTML = filteredStudents.map(s => `
          <tr>
            <td><input type="checkbox" class="chk-promo-stu" data-stu-id="${s.id}" checked></td>
            <td>${s.nis || '-'}</td>
            <td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
            <td><span class="badge badge-success">Siap Promosi</span></td>
          </tr>
        `).join('');
        const selectAll = document.getElementById('promo-select-all');
        if (selectAll) selectAll.checked = true;
      };
    }
    const promoSelectAll = document.getElementById('promo-select-all');
    if (promoSelectAll) {
      promoSelectAll.onchange = (e) => {
        document.querySelectorAll('.chk-promo-stu').forEach(chk => { chk.checked = e.target.checked; });
      };
    }
    const formPromo = document.getElementById('form-promo');
    if (formPromo) {
      formPromo.onsubmit = async (e) => {
        e.preventDefault();
        const fromId = document.getElementById('promo-from-cls').value;
        const toId = document.getElementById('promo-to-cls').value;
        if (!fromId || !toId) return alert('Pilih kelas asal dan kelas tujuan.');
        if (fromId === toId) return alert('Kelas tujuan tidak boleh sama dengan kelas asal.');
        const selectedIds = [];
        document.querySelectorAll('.chk-promo-stu:checked').forEach(chk => {
          selectedIds.push(chk.dataset.stuId);
        });
        if (!selectedIds.length) return alert('Pilih setidaknya satu siswa untuk dipromosikan.');
        const fromClsName = classArr.find(c => c.id === fromId)?.name || fromId;
        const toClsName = toId === 'LULUS_ALUMNI' ? 'Lulus / Alumni' : (classArr.find(c => c.id === toId)?.name || toId);
        if (!confirm(`Yakin ingin mempromosikan ${selectedIds.length} siswa dari ${fromClsName} ke ${toClsName}?`)) return;
        const submitBtn = document.getElementById('btn-submit-promo');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph ph-spinner"></i> Memproses...';
        try {
          const updates = {};
          selectedIds.forEach(id => {
            if (toId === 'LULUS_ALUMNI') {
              updates[`students/${id}/classId`] = 'ALUMNI';
              updates[`students/${id}/status`] = 'Lulus';
            } else {
              updates[`students/${id}/classId`] = toId;
            }
          });
          const promoLog = {
            date: new Date().toISOString(),
            fromClassId: fromId,
            fromClassName: fromClsName,
            toClassId: toId,
            toClassName: toClsName,
            totalStudents: selectedIds.length,
            studentIds: selectedIds,
            executedBy: Auth.currentUser.uid
          };
          const promoKey = firebase.database().ref(`classes/${fromId}/promotion`).push().key;
          updates[`classes/${fromId}/promotion/${promoKey}`] = promoLog;
          updates[`student_promotions/${promoKey}`] = promoLog;
          await firebase.database().ref().update(updates);
          alert(`Sukses mempromosikan ${selectedIds.length} siswa ke ${toClsName}!`);
          App.closeModal('modal-promo');
          AdminPages.renderClasses(container);
        } catch (err) {
          alert('Gagal memproses promosi: ' + err.message);
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="ph ph-check"></i> Eksekusi Kenaikan Kelas';
        }
      };
    }
  },
  async renderStudents(container, classId) {
    const classes = await DB.getClasses();
    const cls = classes[classId];
    if (!cls) {
      container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
      return;
    }
    Router.setTitle(`Siswa kelas ${AppConfig.escapeHtml(cls.name)}`, 'Kelola data siswa dan hubungkan dengan akun orang tua.');
    const [studentData, users] = await Promise.all([
      DB.getStudentsByClass(classId),
      DB.getAllUsers()
    ]);
    const studentArr = DB.toArray(studentData).sort((a,b) => a.name.localeCompare(b.name));
    const ortuArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.ORTU);
    const renderTable = () => {
      const q = (document.getElementById('search-student')?.value || '').toLowerCase();
      const genderFilter = document.getElementById('filter-gender')?.value || '';
      const filtered = studentArr.filter(s => {
        const matchSearch = (s.name || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
        const matchGender = genderFilter ? s.gender === genderFilter : true;
        return matchSearch && matchGender;
      });
      const rows = filtered.length ? filtered.map(s => {
        const parent = ortuArr.find(p => p.id === s.parentId);
        return `
          <tr>
            <td>${s.nis || '-'}</td>
            <td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
            <td>${s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '-'}</td>
            <td>${parent ? parent.name : '<span class="text-muted">Belum tertaut</span>'}</td>
            <td class="action-cell">
              <button class="btn btn-outline btn-sm" data-edit-stu="${s.id}"><i class="ph ph-pencil-simple"></i></button>
              <button class="btn btn-danger btn-sm" data-del-stu="${s.id}"><i class="ph ph-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="5" class="text-center text-muted">Tidak ada data siswa ditemukan.</td></tr>';
      const tbody = container.querySelector('#tbody-students');
      if (tbody) tbody.innerHTML = rows;
      container.querySelectorAll('[data-edit-stu]').forEach(btn => {
        btn.onclick = () => {
          const s = studentArr.find(x => x.id === btn.dataset.editStu);
          if (!s) return;
          document.getElementById('stu-modal-title').innerText = 'Edit siswa';
          document.getElementById('stu-id').value = s.id;
          document.getElementById('stu-nis').value = s.nis || '';
          document.getElementById('stu-nisn').value = s.nisn || '';
          document.getElementById('stu-name').value = s.name;
          document.getElementById('stu-gender').value = s.gender || 'L';
          document.getElementById('stu-parent').value = s.parentId || '';
          App.openModal('modal-stu');
        };
      });
      container.querySelectorAll('[data-del-stu]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Yakin menghapus siswa ini?')) return;
          await DB.deleteStudent(btn.dataset.delStu);
          AdminPages.renderStudents(container, classId);
        };
      });
    };
    const ortuOptions = ortuArr.map(p => `<option value="${p.id}">${AppConfig.escapeHtml(p.name)} (${AppConfig.escapeHtml(p.username)})</option>`).join('');
    container.innerHTML = `
      <div class="toolbar-panel"><a href="#/admin/classes" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali ke kelas</a></div>
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div class="toolbar-controls">
            <div class="search-box">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" id="search-student" placeholder="Cari nama atau NIS...">
            </div>
            <select id="filter-gender" class="toolbar-select">
              <option value="">Semua L/P</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <button class="btn btn-primary" id="btn-add-stu"><i class="ph ph-plus"></i> Tambah Siswa</button>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>NIS</th><th>Nama Siswa</th><th>L/P</th><th>Orang Tua</th><th class="table-col-md">Aksi</th></tr></thead>
          <tbody id="tbody-students"></tbody></table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-stu">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="stu-modal-title">Tambah siswa</h3>
            <button class="btn-icon" data-close-modal="modal-stu"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-stu">
            <div class="modal-body">
              <input type="hidden" id="stu-id">
              <div class="form-split">
                <div class="form-group"><label>NIS</label><input id="stu-nis" required></div>
                <div class="form-group"><label>NISN</label><input id="stu-nisn"></div>
              </div>
              <div class="form-group"><label>Nama Lengkap</label><input id="stu-name" required></div>
              <div class="form-group"><label>Jenis Kelamin</label><select id="stu-gender"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
              <div class="form-group"><label>Tautkan Orang Tua</label><select id="stu-parent"><option value="">— Tidak ditautkan —</option>${ortuOptions}</select></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-stu">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    `;
    renderTable();
    document.getElementById('search-student').addEventListener('input', renderTable);
    document.getElementById('filter-gender').addEventListener('change', renderTable);
    document.getElementById('btn-add-stu').onclick = () => {
      document.getElementById('stu-modal-title').innerText = 'Tambah siswa';
      document.getElementById('stu-id').value = '';
      document.getElementById('stu-nis').value = '';
      document.getElementById('stu-nisn').value = '';
      document.getElementById('stu-name').value = '';
      document.getElementById('stu-gender').value = 'L';
      document.getElementById('stu-parent').value = '';
      App.openModal('modal-stu');
    };
    document.getElementById('form-stu').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('stu-id').value || null;
      await DB.saveStudent(id, {
        classId: classId,
        nis: document.getElementById('stu-nis').value.trim(),
        nisn: document.getElementById('stu-nisn').value.trim(),
        name: document.getElementById('stu-name').value.trim(),
        gender: document.getElementById('stu-gender').value,
        parentId: document.getElementById('stu-parent').value || null
      });
      App.closeModal('modal-stu');
      AdminPages.renderStudents(container, classId);
    };
  },
  async renderSubjects(container) {
    Router.setTitle('Pemetaan Mapel & Guru', 'Kelola struktur mata pelajaran kurikulum dan pemetaan guru pengampu.');
    const [subjects, classes, users] = await Promise.all([DB.getSubjects(), DB.getClasses(), DB.getAllUsers()]);
    const subArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
    const classArr = DB.toArray(classes);
    const categoryLabel = {
      'agama': 'Agama',
      'standar': 'Umum',
      'lokal': 'Muatan Lokal',
      'kekhasan': 'Kekhasan'
    };
    const categoryBadge = {
      'agama': 'badge-success',
      'standar': 'badge-primary',
      'lokal': 'badge-warning',
      'kekhasan': 'badge-danger'
    };
    const renderTable = () => {
      const q = (document.getElementById('search-sub')?.value || '').toLowerCase();
      const filtered = subArr.filter(s => (s.name || '').toLowerCase().includes(q));
      const rows = filtered.length ? filtered.map(s => {
        const assignedTeachers = [...new Set(classArr.map(c => c.subjectTeachers && c.subjectTeachers[s.id]).filter(Boolean))];
        const assignedClassesCount = classArr.filter(c => c.subjectTeachers && c.subjectTeachers[s.id]).length;
        let mappingInfo = '<span class="text-muted">Mengikuti Wali Kelas</span>';
        if (assignedTeachers.length > 0) {
          const names = assignedTeachers.map(tid => (users[tid]?.name || tid).split(',')[0]).join(', ');
          mappingInfo = `<strong>${assignedClassesCount} Rombel</strong> <small class="text-muted">(${AppConfig.escapeHtml(names)})</small>`;
        }
        return `
        <tr>
          <td>${s.order || '-'}</td>
          <td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
          <td><span class="badge ${categoryBadge[s.category] || 'badge-primary'}">${categoryLabel[s.category] || s.category}</span></td>
          <td>${mappingInfo}</td>
          <td class="action-cell">
            <button class="btn btn-outline btn-sm" data-edit-sub="${s.id}"><i class="ph ph-pencil-simple"></i></button>
            <button class="btn btn-danger btn-sm" data-del-sub="${s.id}"><i class="ph ph-trash"></i></button>
          </td>
        </tr>
      `;
      }).join('') : '<tr><td colspan="5" class="text-center text-muted">Belum ada mata pelajaran.</td></tr>';
      const tbody = container.querySelector('#tbody-subjects');
      if (tbody) tbody.innerHTML = rows;
      container.querySelectorAll('[data-edit-sub]').forEach(btn => {
        btn.onclick = () => {
          const s = subArr.find(x => x.id === btn.dataset.editSub);
          if (s) AdminPages._openSubjectModal(s);
        };
      });
      container.querySelectorAll('[data-del-sub]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Yakin menghapus mata pelajaran ini?')) return;
          await DB.deleteSubject(btn.dataset.delSub);
          AdminPages.renderSubjects(container);
        };
      });
    };
    container.innerHTML = `
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div class="toolbar-controls">
            <div class="search-box">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" id="search-sub" placeholder="Cari mata pelajaran...">
            </div>
          </div>
          <div class="toolbar-actions">
            <a href="#/admin/classes" class="btn btn-outline"><i class="ph ph-chalkboard-teacher"></i> Atur Pemetaan per Rombel</a>
            <button class="btn btn-primary" id="btn-add-sub"><i class="ph ph-plus"></i> Tambah Mapel</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table"><thead><tr><th class="table-col-sm">No</th><th>Nama Mata Pelajaran</th><th>Kategori</th><th>Guru Pengampu Terpetakan</th><th class="table-col-md">Aksi</th></tr></thead>
          <tbody id="tbody-subjects"></tbody></table>
        </div>
      </div>
      ${AdminPages._subjectModal()}
    `;
    renderTable();
    document.getElementById('search-sub').addEventListener('input', renderTable);
    document.getElementById('btn-add-sub').onclick = () => AdminPages._openSubjectModal(null, subArr.length + 1);
    document.getElementById('form-sub').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('sub-id').value || null;
      await DB.saveSubject(id, {
        name: document.getElementById('sub-name').value.trim(),
        category: document.getElementById('sub-category').value,
        order: parseInt(document.getElementById('sub-order').value) || 1
      });
      App.closeModal('modal-sub');
      AdminPages.renderSubjects(container);
    };
  },
  _subjectModal() {
    return `
    <div class="modal-overlay" id="modal-sub">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="sub-modal-title">Tambah mata pelajaran</h3>
          <button class="btn-icon" data-close-modal="modal-sub"><i class="ph ph-x"></i></button>
        </div>
        <form id="form-sub">
          <div class="modal-body">
            <input type="hidden" id="sub-id">
            <div class="form-group">
              <label>Kategori</label>
              <select id="sub-category" required>
                <option value="standar">Umum</option>
                <option value="agama">Agama</option>
                <option value="lokal">Muatan Lokal</option>
                <option value="kekhasan">Kekhasan</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nama Mata Pelajaran</label>
              <input type="text" id="sub-name" required placeholder="Contoh: Matematika">
            </div>
            <div class="form-group">
              <label>Urutan (Opsional)</label>
              <input type="number" id="sub-order" placeholder="Contoh: 1">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-close-modal="modal-sub">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>`;
  },
  _openSubjectModal(existing = null, nextOrder = 1) {
    document.getElementById('sub-modal-title').innerText = existing ? 'Edit mata pelajaran' : 'Tambah mata pelajaran';
    document.getElementById('sub-id').value = existing ? existing.id : '';
    document.getElementById('sub-category').value = existing ? existing.category : 'standar';
    document.getElementById('sub-name').value = existing ? existing.name : '';
    document.getElementById('sub-order').value = existing ? existing.order : nextOrder;
    document.getElementById('modal-sub').classList.add('active');
  },
  async renderExtracurriculars(container) {
    Router.setTitle('Ekstrakurikuler', 'Kelola daftar ekstrakurikuler sekolah dan pemetaan peserta SSOT.');
    const [ekskuls, users, classes, allStudents] = await Promise.all([
      DB.getExtracurriculars(),
      DB.getAllUsers(),
      DB.getClasses(),
      DB.getAllStudents()
    ]);
    const pembinaArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.GURU || u.role === AppConfig.ROLES.GURU_EKSKUL || u.role === AppConfig.ROLES.TENDIK || AppConfig.getRoleAssignments(u).some(a => a.startsWith('GURU_EKSTRA_')));
    const classArr = DB.toArray(classes);
    const studentArr = DB.toArray(allStudents);
    const eksArr = DB.toArray(ekskuls).sort((a, b) => (a.order || 0) - (b.order || 0));
    const rows = eksArr.length ? eksArr.map(e => {
      const guru = pembinaArr.find(g => g.id === e.teacherId);
      const studentCount = Object.keys(e.students || {}).length;
      return `
      <tr>
        <td>${e.order || '-'}</td>
        <td><strong>${AppConfig.escapeHtml(e.name)}</strong></td>
        <td>${guru ? guru.name : '<span class="text-muted">Belum ada pembina</span>'}</td>
        <td><button class="btn btn-outline btn-sm" data-manage-students="${e.id}"><i class="ph ph-users-three"></i> ${studentCount} Murid</button></td>
        <td class="action-cell">
          <button class="btn btn-outline btn-sm" data-edit-eks="${e.id}"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn btn-danger btn-sm" data-del-eks="${e.id}"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `}).join('') : '<tr><td colspan="5" class="text-center text-muted">Belum ada ekstrakurikuler.</td></tr>';
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar Ekstrakurikuler</h3>
          <button class="btn btn-primary" id="btn-add-eks"><i class="ph ph-plus"></i> Tambah</button>
        </div>
        <div class="table-responsive">
          <table class="table"><thead><tr><th style="width:50px">No</th><th>Nama Ekstrakurikuler</th><th>Guru Pembina</th><th style="width:140px">Peserta (SSOT)</th><th style="width:100px">Aksi</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>
      ${AdminPages._extracurricularModal(pembinaArr)}
      ${AdminPages._extracurricularStudentsModal(classArr)}
    `;
    document.getElementById('btn-add-eks').onclick = () => AdminPages._openExtracurricularModal(null, eksArr.length + 1);
    container.querySelectorAll('[data-edit-eks]').forEach(btn => {
      btn.onclick = () => {
        const e = eksArr.find(x => x.id === btn.dataset.editEks);
        if (e) AdminPages._openExtracurricularModal(e);
      };
    });
    container.querySelectorAll('[data-manage-students]').forEach(btn => {
      btn.onclick = () => {
        const e = eksArr.find(x => x.id === btn.dataset.manageStudents);
        if (e) AdminPages._openExtracurricularStudentsModal(e, studentArr, classArr, container);
      };
    });
    container.querySelectorAll('[data-del-eks]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Yakin hapus ekstrakurikuler ini?')) return;
        await DB.deleteExtracurricular(btn.dataset.delEks);
        AdminPages.renderExtracurriculars(container);
      };
    });
    document.getElementById('form-eks').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('eks-id').value || null;
      const existing = id ? ekskuls[id] : null;
      await DB.saveExtracurricular(id, {
        name: document.getElementById('eks-name').value.trim(),
        order: parseInt(document.getElementById('eks-order').value) || 1,
        teacherId: document.getElementById('eks-teacher').value || null,
        schedule: document.getElementById('eks-schedule').value.trim() || null,
        students: existing ? (existing.students || null) : null
      });
      App.closeModal('modal-eks');
      AdminPages.renderExtracurriculars(container);
    };
  },
  _extracurricularModal(guruArr) {
    return `
    <div class="modal-overlay" id="modal-eks">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="eks-modal-title">Tambah ekstrakurikuler</h3>
          <button class="btn-icon" data-close-modal="modal-eks"><i class="ph ph-x"></i></button>
        </div>
        <form id="form-eks">
          <div class="modal-body">
            <input type="hidden" id="eks-id">
            <div class="form-group">
              <label>Nama ekstrakurikuler</label>
              <input id="eks-name" required placeholder="Contoh: Hizbul Wathan (HW)">
            </div>
            <div class="form-group">
              <label>Guru Pembina</label>
              <select id="eks-teacher">
                <option value="">-- Pilih Pembina (Opsional) --</option>
                ${guruArr.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Jadwal Latihan</label>
              <input id="eks-schedule" placeholder="Contoh: Jumat, 13.00 - 14.30">
            </div>
            <div class="form-group">
              <label>Urutan tampil</label>
              <input id="eks-order" type="number" min="1" value="1">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-close-modal="modal-eks">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>`;
  },
  _openExtracurricularModal(existing, nextOrder) {
    document.getElementById('eks-modal-title').innerText = existing ? 'Edit ekstrakurikuler' : 'Tambah ekstrakurikuler';
    document.getElementById('eks-id').value = existing ? existing.id : '';
    document.getElementById('eks-name').value = existing ? existing.name : '';
    document.getElementById('eks-teacher').value = existing ? (existing.teacherId || '') : '';
    document.getElementById('eks-schedule').value = existing ? (existing.schedule || '') : '';
    document.getElementById('eks-order').value = existing ? existing.order : (nextOrder || 1);
    document.getElementById('modal-eks').classList.add('active');
  },
  _extracurricularStudentsModal(classArr) {
    const classOpts = classArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('');
    return `
    <div class="modal-overlay" id="modal-eks-students">
      <div class="modal modal-lg">
        <div class="modal-header">
          <div>
            <h3 class="modal-title" id="modal-eks-stu-title">Kelola Peserta Ekstrakurikuler</h3>
            <p class="text-muted class-teaching-note" id="modal-eks-stu-sub">Pemetaan resmi murid peserta ekstrakurikuler (SSOT Kesiswaan)</p>
          </div>
          <button class="btn-icon" data-close-modal="modal-eks-students"><i class="ph ph-x"></i></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="modal-eks-stu-id">
          <div class="eks-students-filter-row">
            <select id="modal-eks-class-filter" class="mapel-select-input">
              <option value="">— Semua Kelas —</option>
              ${classOpts}
            </select>
            <input type="text" id="modal-eks-search" placeholder="Cari nama murid atau NIS..." class="mapel-select-input">
            <span class="eks-badge-counter" id="modal-eks-count">0 Murid Terpilih</span>
          </div>
          <div class="card-actions-row">
            <button type="button" class="btn btn-outline btn-sm" id="btn-eks-select-all"><i class="ph ph-check-square"></i> Pilih Semua Tampil</button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-eks-deselect-all"><i class="ph ph-square"></i> Batalkan Semua Tampil</button>
          </div>
          <div class="eks-students-list" id="modal-eks-students-list"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" data-close-modal="modal-eks-students">Batal</button>
          <button type="button" class="btn btn-primary" id="btn-save-eks-students"><i class="ph ph-floppy-disk"></i> Simpan Daftar Peserta</button>
        </div>
      </div>
    </div>`;
  },
  _openExtracurricularStudentsModal(ekskul, studentArr, classArr, container) {
    document.getElementById('modal-eks-stu-id').value = ekskul.id;
    document.getElementById('modal-eks-stu-title').innerText = `Kelola Peserta: ${ekskul.name}`;
    const selectedMap = { ...(ekskul.students || {}) };
    const classMap = classArr.reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
    const updateCount = () => {
      const cnt = Object.keys(selectedMap).length;
      document.getElementById('modal-eks-count').innerText = `${cnt} Murid Terpilih`;
    };
    const renderList = () => {
      const filterClass = document.getElementById('modal-eks-class-filter').value;
      const searchVal = document.getElementById('modal-eks-search').value.toLowerCase().trim();
      const filtered = studentArr.filter(s => {
        if (filterClass && s.classId !== filterClass) return false;
        if (searchVal) {
          const matchName = (s.name || '').toLowerCase().includes(searchVal);
          const matchNis = (s.nis || '').includes(searchVal) || (s.nisn || '').includes(searchVal);
          if (!matchName && !matchNis) return false;
        }
        return true;
      });
      const listCont = document.getElementById('modal-eks-students-list');
      if (!filtered.length) {
        listCont.innerHTML = '<p class="text-muted class-teaching-note">Tidak ada murid yang cocok dengan filter.</p>';
        return;
      }
      listCont.innerHTML = filtered.map(s => {
        const isChecked = !!selectedMap[s.id];
        const className = classMap[s.classId] || s.classId || '-';
        const idLabel = AppConfig.formatStudentIdentity(s.nis, s.nisn);
        return `
          <label class="eks-student-item">
            <input type="checkbox" data-student-id="${s.id}" ${isChecked ? 'checked' : ''}>
            <div class="eks-student-meta">
              <span class="eks-student-name">${AppConfig.escapeHtml(s.name)}</span>
              <span class="eks-student-sub">${AppConfig.escapeHtml(className)} · ${idLabel}</span>
            </div>
          </label>
        `;
      }).join('');
      listCont.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.onchange = (ev) => {
          const sid = ev.target.dataset.studentId;
          if (ev.target.checked) {
            selectedMap[sid] = true;
          } else {
            delete selectedMap[sid];
          }
          updateCount();
        };
      });
    };
    document.getElementById('modal-eks-class-filter').value = '';
    document.getElementById('modal-eks-search').value = '';
    document.getElementById('modal-eks-class-filter').onchange = renderList;
    document.getElementById('modal-eks-search').oninput = renderList;
    document.getElementById('btn-eks-select-all').onclick = () => {
      document.querySelectorAll('#modal-eks-students-list input[type="checkbox"]').forEach(chk => {
        chk.checked = true;
        selectedMap[chk.dataset.studentId] = true;
      });
      updateCount();
    };
    document.getElementById('btn-eks-deselect-all').onclick = () => {
      document.querySelectorAll('#modal-eks-students-list input[type="checkbox"]').forEach(chk => {
        chk.checked = false;
        delete selectedMap[chk.dataset.studentId];
      });
      updateCount();
    };
    document.getElementById('btn-save-eks-students').onclick = async () => {
      const btn = document.getElementById('btn-save-eks-students');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      const cleanStudents = Object.keys(selectedMap).length ? selectedMap : null;
      await db.ref(`extracurriculars/${ekskul.id}/students`).set(cleanStudents);
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Daftar Peserta';
      App.closeModal('modal-eks-students');
      AdminPages.renderExtracurriculars(container);
    };
    updateCount();
    renderList();
    document.getElementById('modal-eks-students').classList.add('active');
  },
  async renderAttendance(container) {
    Router.setTitle('Rekapan Presensi', 'Monitoring absensi guru dan siswa per hari.');
    const today = new Date();
    const defaultDate = today.toISOString().slice(0, 10);
    const settings = await DB.getSettings();
    const [teacherAttendance, studentAttendance, classes, students, users] = await Promise.all([
      DB.getTeacherAttendanceByDate(defaultDate),
      DB.getDailyStudentAttendanceByDate(defaultDate),
      DB.getClasses(),
      DB.getAllStudents(),
      DB.getAllUsers()
    ]);
    const classArr = DB.toArray(classes);
    const studentArr = DB.toArray(students);
    const teacherArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.GURU || AppConfig.getRoleAssignments(u).some(AppConfig.isTeachingAssignment));
    const renderTeacherRows = (dateStr, teacherData, attendanceData) => teacherArr.map(g => {
      const att = attendanceData[g.id] || {};
      const status = att.time_in ? (att.time_out ? 'Selesai' : 'Datang') : 'Belum hadir';
      const timeIn = att.time_in || '-';
      const timeOut = att.time_out || '-';
      const proofBtn = att.proof_url
        ? `<button class="btn btn-outline btn-sm" data-proof-date="${dateStr}" data-proof-teacher="${g.id}" data-proof-url="${att.proof_url}"><i class="ph ph-eye"></i> Lihat bukti</button>`
        : '<span class="text-muted">Tidak ada bukti</span>';
      return `
        <tr>
          <td>${AppConfig.escapeHtml(g.name)}</td>
          <td><span class="badge ${att.time_in ? 'badge-success' : 'badge-warning'}">${status}</span></td>
          <td>${timeIn}</td>
          <td>${timeOut}</td>
          <td>${proofBtn}</td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada data presensi guru.</td></tr>';
    const renderStudentSummary = (dateStr, attendanceData) => classArr.map(cls => {
      const classStudents = studentArr.filter(s => s.classId === cls.id);
      const att = attendanceData[cls.id] || {};
      let had = 0, sick = 0, izin = 0, alpha = 0;
      classStudents.forEach(s => {
        const v = att[s.id];
        if (v === 'H') had++;
        else if (v === 'S') sick++;
        else if (v === 'I') izin++;
        else if (v === 'A') alpha++;
      });
      return `
        <tr>
          <td>${AppConfig.escapeHtml(cls.name)}</td>
          <td>${had}</td>
          <td>${sick}</td>
          <td>${izin}</td>
          <td>${alpha}</td>
          <td>${classStudents.length}</td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="6" class="text-center text-muted">Belum ada data absensi siswa.</td></tr>';
    const buildTable = async (selectedDate) => {
      const [teacherData, studentData] = await Promise.all([
        DB.getTeacherAttendanceByDate(selectedDate),
        DB.getDailyStudentAttendanceByDate(selectedDate)
      ]);
      const teacherRows = renderTeacherRows(selectedDate, teacherArr, teacherData);
      const studentSummary = renderStudentSummary(selectedDate, studentData);
      container.innerHTML = `
        <div class="card" style="margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 class="card-title" style="margin:0;">Rekapan presensi</h3>
              <p class="text-muted" style="margin:6px 0 0 0;">Atur tanggal untuk melihat semua rekapan.</p>
            </div>
            <div class="form-group" style="margin:0; min-width:220px;">
              <label style="display:block; margin-bottom:6px; font-size:12px;">Tanggal</label>
              <input id="attendance-date-picker" type="date" value="${selectedDate}" class="form-control" style="width:100%;">
            </div>
          </div>
        </div>
        <div class="card" style="margin-bottom:20px">
          <div class="card-header">
            <h3 class="card-title">Presensi Guru</h3>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Nama Guru</th><th>Status</th><th>Datang</th><th>Pulang</th><th>Bukti</th></tr></thead>
              <tbody>${teacherRows}</tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Absensi Siswa per Kelas</h3>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Kelas</th><th>H</th><th>S</th><th>I</th><th>A</th><th>Total</th></tr></thead>
              <tbody>${studentSummary}</tbody>
            </table>
          </div>
        </div>
      `;
      const datePicker = document.getElementById('attendance-date-picker');
      if (datePicker) {
        datePicker.onchange = async () => {
          const nextDate = datePicker.value || defaultDate;
          await buildTable(nextDate);
        };
      }
      container.querySelectorAll('[data-proof-url]').forEach(btn => {
        btn.onclick = () => {
          const url = btn.dataset.proofUrl;
          const modal = document.createElement('div');
          modal.className = 'modal-overlay active';
          modal.innerHTML = `
            <div class="modal modal-wide">
              <div class="modal-header">
                <h3 class="modal-title">Bukti Presensi</h3>
                <button class="btn-icon" type="button" data-close-proof="1"><i class="ph ph-x"></i></button>
              </div>
              <div class="modal-body" style="text-align:center;">
                <img src="${DriveBridge.normalizeDriveImageUrl(url, 'w800', '')}" alt="Bukti presensi" style="max-width:100%; max-height:70vh; border-radius:10px; object-fit:contain; background:#f3f4f6;">
              </div>
              <div class="modal-footer">
                <a href="${DriveBridge.normalizeDriveImageUrl(url, 'w800', '')}" target="_blank" class="btn btn-primary">Buka ukuran penuh</a>
                <button type="button" class="btn btn-outline" data-close-proof="1">Tutup</button>
              </div>
            </div>
          `;
          document.body.appendChild(modal);
          modal.querySelectorAll('[data-close-proof]').forEach(el => {
            el.onclick = () => modal.remove();
          });
        };
      });
    };
    await buildTable(defaultDate);
  },
};
