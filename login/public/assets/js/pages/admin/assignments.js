window.AdminAssignmentsModule = {
  async render(container) {
    Router.setTitle('Distribusi Penugasan GTK', 'Peta pembagian tugas struktural dan amanah tambahan seluruh pendidik & tenaga kependidikan.');
    const [usersData, classesData, ekskulsData] = await Promise.all([
      DB.getAllUsers(),
      DB.getClasses(),
      DB.getExtracurriculars()
    ]);
    const users = DB.toArray(usersData);
    const classList = DB.toArray(classesData).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id', { numeric: true }));
    const eksList = DB.toArray(ekskulsData).sort((a, b) => (a.order || 0) - (b.order || 0) || (a.name || '').localeCompare(b.name || '', 'id'));
    const gtkList = users.filter(u => AppConfig.isGTK(u)).sort((a, b) => a.name.localeCompare(b.name, 'id'));
    const countWaka = gtkList.filter(u => (u.assignments || []).some(a => a.startsWith('WAKA_'))).length;
    const countUmmi = gtkList.filter(u => AppConfig.isUserUmmi(u)).length;
    const countWali = gtkList.filter(u => (u.assignments || []).some(a => a.startsWith('GURU_KELAS_')) || classList.some(c => c.teacherId === u.id)).length;
    const countEkskul = gtkList.filter(u => AppConfig.isUserEkstra(u) || eksList.some(e => e.teacherId === u.id)).length;
    let activeFilter = 'ALL';
    let searchQuery = '';
    const renderTable = () => {
      const q = searchQuery.toLowerCase();
      const filtered = gtkList.filter(u => {
        const assigns = AppConfig.getRoleAssignments(u);
        const waliClasses = classList.filter(c => c.teacherId === u.id);
        const matchSearch = (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || assigns.some(a => a.toLowerCase().includes(q)) || waliClasses.some(c => (c.name || '').toLowerCase().includes(q));
        if (!matchSearch) return false;
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'WAKA') return assigns.some(a => a.startsWith('WAKA_'));
        if (activeFilter === 'KURIKULUM') return assigns.some(a => a.includes('KURIKULUM'));
        if (activeFilter === 'KESISWAAN') return assigns.some(a => a.includes('KESISWAAN'));
        if (activeFilter === 'HUMAS') return assigns.some(a => a.includes('HUMAS'));
        if (activeFilter === 'KEUANGAN') return assigns.some(a => a.includes('KEUANGAN'));
        if (activeFilter === 'SARPRAS') return assigns.some(a => a.includes('SARPRAS'));
        if (activeFilter === 'UMMI') return AppConfig.isUserUmmi(u);
        if (activeFilter === 'WALI') return assigns.some(a => a.startsWith('GURU_KELAS_')) || waliClasses.length > 0;
        if (activeFilter === 'EKSKUL') return AppConfig.isUserEkstra(u) || eksList.some(e => e.teacherId === u.id);
        if (activeFilter === 'IT') return assigns.some(a => a === 'TIM_IT');
        return true;
      });
      const rows = filtered.length ? filtered.map((u, idx) => {
        const assigns = AppConfig.getRoleAssignments(u);
        const waliClasses = classList.filter(c => c.teacherId === u.id);
        const displayItems = [];
        const seenCodes = new Set();
        assigns.forEach(item => {
          if (item.startsWith('GURU_KELAS_')) {
            const rawId = item.replace('GURU_KELAS_', '');
            const foundCls = classList.find(c => c.id === rawId || c.name.replace(/[^A-Za-z0-9]/g, '_').toUpperCase() === rawId);
            const label = foundCls ? ('Wali ' + foundCls.name) : ('Wali Kelas ' + rawId.replace(/_/g, ' '));
            seenCodes.add(foundCls ? foundCls.id : rawId);
            displayItems.push({ label, badgeClass: 'badge-primary' });
          } else {
            const label = AppConfig.UNIT_LABELS[item] || item.replace(/_/g, ' ');
            const badgeClass = AppConfig.getAssignmentBadgeClass ? AppConfig.getAssignmentBadgeClass(item) : 'badge-outline';
            displayItems.push({ label, badgeClass });
          }
        });
        waliClasses.forEach(c => {
          if (!seenCodes.has(c.id)) {
            seenCodes.add(c.id);
            displayItems.push({ label: 'Wali ' + c.name, badgeClass: 'badge-primary' });
          }
        });
        const badgesHtml = displayItems.length ? displayItems.map(d => `<span class="badge ${d.badgeClass}">${AppConfig.escapeHtml(d.label)}</span>`).join('') : '<span class="text-muted">Hanya Tugas Utama Guru / Tendik</span>';
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <strong>${AppConfig.escapeHtml(u.name)}</strong><br>
              <small class="text-muted">${u.email || (u.id.toLowerCase().replace(/[^a-z0-9]/g, '') + '@musada.sch.id')}</small>
            </td>
            <td><span class="badge ${AppConfig.getRoleBadgeClass(u.role)}">${AppConfig.PRIMARY_ROLES[u.role] || u.role}</span></td>
            <td><div class="user-badges-container">${badgesHtml}</div></td>
            <td class="action-cell">
              <button class="btn btn-outline btn-sm" data-edit-assign="${u.id}"><i class="ph ph-sliders"></i> Atur Penugasan</button>
            </td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="5" class="text-center text-muted">Tidak ada personil pada unit ini.</td></tr>';
      const tbody = container.querySelector('#tbody-assignments');
      if (tbody) tbody.innerHTML = rows;
      container.querySelectorAll('[data-edit-assign]').forEach(btn => {
        btn.onclick = () => {
          const u = gtkList.find(x => x.id === btn.dataset.editAssign);
          if (!u) return;
          document.getElementById('assign-user-id').value = u.id;
          document.getElementById('assign-user-name').innerText = u.name;
          document.getElementById('assign-user-role').innerText = AppConfig.PRIMARY_ROLES[u.role] || u.role;
          const currentAssigns = AppConfig.normalizeAssignments(u.assignments || []);
          document.querySelectorAll('#form-assign-modal input[type="checkbox"]').forEach(cb => {
            const clsId = cb.dataset.classId;
            if (clsId) {
              const clsObj = classList.find(c => c.id === clsId);
              const isAssigned = (clsObj && clsObj.teacherId === u.id) || currentAssigns.includes(cb.value) || currentAssigns.includes('GURU_KELAS_' + clsId);
              cb.checked = Boolean(isAssigned);
            } else {
              cb.checked = currentAssigns.includes(cb.value);
            }
          });
          document.getElementById('modal-assign-gtk').classList.add('active');
        };
      });
    };
    const waliCheckboxesHtml = classList.length ? classList.map(c => `
      <label title="${AppConfig.escapeHtml(c.name)}">
        <input type="checkbox" value="GURU_KELAS_${c.id}" data-class-id="${c.id}">
        Wali ${AppConfig.escapeHtml(c.name)}
      </label>
    `).join('') : '<p class="text-muted text-xs">Belum ada data rombel di master data.</p>';
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-chalkboard-teacher"></i></div>
          <div><p class="stat-value">${gtkList.length}</p><p class="stat-label text-muted">Total GTK</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-crown"></i></div>
          <div><p class="stat-value">${countWaka}</p><p class="stat-label text-muted">Waka Unit</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-book-open"></i></div>
          <div><p class="stat-value">${countUmmi}</p><p class="stat-label text-muted">Tim Ummi</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-users-three"></i></div>
          <div><p class="stat-value">${countWali}</p><p class="stat-label text-muted">Wali Kelas (${classList.length} Rombel)</p></div>
        </div>
      </section>
      <div class="card toolbar-panel">
        <div class="assignment-filter-bar">
          <button class="btn-unit-filter active" data-filter="ALL">Semua GTK (${gtkList.length})</button>
          <button class="btn-unit-filter" data-filter="WAKA">Waka Unit (${countWaka})</button>
          <button class="btn-unit-filter" data-filter="KURIKULUM">Kurikulum</button>
          <button class="btn-unit-filter" data-filter="KESISWAAN">Kesiswaan</button>
          <button class="btn-unit-filter" data-filter="HUMAS">Humas & SDM</button>
          <button class="btn-unit-filter" data-filter="KEUANGAN">Keuangan</button>
          <button class="btn-unit-filter" data-filter="SARPRAS">Sarpras</button>
          <button class="btn-unit-filter" data-filter="UMMI">Tim Ummi (${countUmmi})</button>
          <button class="btn-unit-filter" data-filter="WALI">Wali Kelas (${countWali})</button>
          <button class="btn-unit-filter" data-filter="EKSKUL">Pembina Ekskul (${countEkskul})</button>
          <button class="btn-unit-filter" data-filter="IT">Tim IT</button>
        </div>
        <div class="toolbar-row">
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" id="search-assign" placeholder="Cari nama pegawai, tugas tambahan...">
          </div>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th style="width:50px">No</th>
                <th>Nama Pegawai / Email</th>
                <th>Peran Utama</th>
                <th>Plotting Penugasan Aktif</th>
                <th class="table-col-md">Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-assignments"></tbody>
          </table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-assign-gtk">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title"><i class="ph ph-sliders"></i> Atur Penugasan GTK</h3>
            <button class="btn-icon" id="btn-close-assign-modal"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-assign-modal">
            <div class="modal-body">
              <input type="hidden" id="assign-user-id">
              <div class="alert alert-info">
                <strong>Pegawai:</strong> <span id="assign-user-name">-</span> | <strong>Profesi Pokok:</strong> <span id="assign-user-role">-</span>
              </div>
              <div class="assignment-unit-group">
                <div class="assignment-unit-title"><i class="ph ph-briefcase"></i> Waka & Staf Unit Kerja</div>
                <div class="assignment-checkbox-grid">
                  <label><input type="checkbox" value="WAKA_KURIKULUM"> Waka Kurikulum</label>
                  <label><input type="checkbox" value="STAF_KURIKULUM"> Staf Kurikulum</label>
                  <label><input type="checkbox" value="WAKA_KESISWAAN"> Waka Kesiswaan</label>
                  <label><input type="checkbox" value="STAF_KESISWAAN"> Staf Kesiswaan</label>
                  <label><input type="checkbox" value="WAKA_HUMAS_PERSONALIA"> Waka Humas & Personalia</label>
                  <label><input type="checkbox" value="STAF_HUMAS_PERSONALIA"> Staf Humas & Personalia</label>
                  <label><input type="checkbox" value="WAKA_KEUANGAN"> Waka Keuangan</label>
                  <label><input type="checkbox" value="STAF_KEUANGAN"> Staf Keuangan</label>
                  <label><input type="checkbox" value="WAKA_SARPRAS"> Waka Sarpras</label>
                  <label><input type="checkbox" value="STAF_SARPRAS"> Staf Sarpras</label>
                </div>
              </div>
              <div class="assignment-unit-group">
                <div class="assignment-unit-title"><i class="ph ph-star"></i> Tim Khusus & Koordinator</div>
                <div class="assignment-checkbox-grid">
                  <label><input type="checkbox" value="KOORD_UMMI"> Koordinator Ummi</label>
                  <label><input type="checkbox" value="TIM_UMMI"> Guru / Tim Ummi</label>
                  <label><input type="checkbox" value="TIM_IT"> Tim IT & Sistem</label>
                  <label><input type="checkbox" value="TIM_B_INGGRIS"> Tim English Lab</label>
                </div>
              </div>
              <div class="assignment-unit-group">
                <div class="assignment-unit-title"><i class="ph ph-users-three"></i> Amanah Wali Kelas (${classList.length} Rombel)</div>
                <div class="assignment-checkbox-grid">
                  ${waliCheckboxesHtml}
                </div>
              </div>
              <div class="assignment-unit-group">
                <div class="assignment-unit-title"><i class="ph ph-trophy"></i> Pembina Ekstrakurikuler</div>
                <div class="assignment-checkbox-grid">
                  <label><input type="checkbox" value="GURU_EKSTRA_BADMINTON"> Ekskul Badminton</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_FUTSAL"> Ekskul Futsal</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_COOKING"> Ekskul Cooking</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_RENANG"> Ekskul Renang</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_TS"> Pembina Tapak Suci</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_PANAHAN_PUTRA"> Ekskul Panahan Putra</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_PANAHAN_PUTRI"> Ekskul Panahan Putri</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_TARI"> Ekskul Seni Tari</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_KONTEN_KREATOR"> Ekskul Konten Kreator</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_ROBOTIK"> Ekskul Robotika</label>
                  <label><input type="checkbox" value="GURU_EKSTRA_CODING"> Ekskul Coding & Pemrograman</label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="btn-cancel-assign-modal">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-assign"><i class="ph ph-check"></i> Simpan Penugasan</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const searchInput = container.querySelector('#search-assign');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        renderTable();
      };
    }
    container.querySelectorAll('.btn-unit-filter').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.btn-unit-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderTable();
      };
    });
    const closeModal = () => {
      document.getElementById('modal-assign-gtk').classList.remove('active');
    };
    const btnClose = container.querySelector('#btn-close-assign-modal');
    if (btnClose) btnClose.onclick = closeModal;
    const btnCancel = container.querySelector('#btn-cancel-assign-modal');
    if (btnCancel) btnCancel.onclick = closeModal;
    const formAssign = container.querySelector('#form-assign-modal');
    if (formAssign) {
      formAssign.onsubmit = async (e) => {
        e.preventDefault();
        const userId = document.getElementById('assign-user-id').value;
        if (!userId) return;
        const selected = [];
        const selectedWaliClassIds = [];
        container.querySelectorAll('#form-assign-modal input[type="checkbox"]:checked').forEach(cb => {
          selected.push(cb.value);
          if (cb.dataset.classId) {
            selectedWaliClassIds.push(cb.dataset.classId);
          }
        });
        const targetUser = gtkList.find(u => u.id === userId);
        if (!targetUser) return;
        const submitBtn = container.querySelector('#btn-save-assign');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
        try {
          const unitFlags = {};
          selected.forEach(code => {
            if (code) unitFlags[code] = true;
          });
          await DB.saveUser(userId, {
            ...targetUser,
            assignments: selected,
            unitFlags: unitFlags
          });
          targetUser.assignments = selected;
          targetUser.unitFlags = unitFlags;
          const classSyncPromises = [];
          for (const c of classList) {
            const isChecked = selectedWaliClassIds.includes(c.id);
            if (isChecked && c.teacherId !== userId) {
              c.teacherId = userId;
              classSyncPromises.push(DB.saveClass(c.id, { ...c, teacherId: userId }));
            } else if (!isChecked && c.teacherId === userId) {
              c.teacherId = null;
              classSyncPromises.push(DB.saveClass(c.id, { ...c, teacherId: null }));
            }
          }
          if (classSyncPromises.length > 0) {
            await Promise.all(classSyncPromises);
          }
          alert('Penugasan untuk ' + targetUser.name + ' berhasil diperbarui!');
          closeModal();
          renderTable();
          if (Auth.currentUser && Auth.currentUser.uid === userId) {
            Auth.currentUser.assignments = selected;
            Auth.currentUser.unitFlags = unitFlags;
            App.renderSidebar(targetUser.role, Auth.currentUser);
          }
        } catch (err) {
          alert('Gagal menyimpan penugasan: ' + err.message);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="ph ph-check"></i> Simpan Penugasan';
        }
      };
    }
    renderTable();
  }
};