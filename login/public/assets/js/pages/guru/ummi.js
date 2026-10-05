const UMMIPages = {
  async renderPlaceholder(container, title, icon) {
    if (location.hash === '#/guru/ummi/koord/mapping') {
      await UMMIPages.renderUmmiMapping(container);
      return;
    }
    
    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ${icon}"></i> ${title}</h3>
          <p class="text-muted">Modul ini sedang dalam tahap pengembangan (Coming Soon).</p>
        </div>
      </div>
    `;
  },

  async renderUmmiMapping(container) {
    Router.setTitle('Pemetaan Rombel & Guru Ummi', 'Atur pembagian kelas Jilid/Al-Quran dan guru pengampunya.');
    
    // Fetch necessary data
    const [ummiClasses, users] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllUsers()
    ]);
    
    const classArr = DB.toArray(ummiClasses);
    // Find teachers who have GURU_UMMI, TIM_UMMI, or KOORD_UMMI
    const guruUmmi = DB.toArray(users).filter(u => {
      const assignments = AppConfig.getRoleAssignments(u);
      return assignments.includes('GURU_UMMI') || assignments.includes('TIM_UMMI') || assignments.includes('KOORD_UMMI');
    });

    const rows = classArr.length ? classArr.map(c => {
      const teacher = guruUmmi.find(g => g.id === c.teacherId);
      const studentCount = Object.keys(c.students || {}).length;
      return `
        <tr>
          <td><strong>${AppConfig.escapeHtml(c.name)}</strong><br><small class="text-muted">${AppConfig.escapeHtml(c.level || 'Belum diatur')}</small></td>
          <td>${teacher ? AppConfig.escapeHtml(teacher.name) : '<span class="text-muted">Belum ditugaskan</span>'}</td>
          <td>${studentCount} siswa</td>
          <td class="action-cell table-col-md">
            <button class="btn btn-outline btn-sm" data-edit-ummi="${c.id}" title="Edit Rombel"><i class="ph ph-pencil-simple"></i></button>
            <button class="btn btn-danger btn-sm" data-del-ummi="${c.id}" title="Hapus"><i class="ph ph-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada Rombel Ummi.</td></tr>';

    const guruOptions = guruUmmi.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('');

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar Rombel Ummi</h3>
          <button class="btn btn-primary" id="btn-add-ummi"><i class="ph ph-plus"></i> Tambah Rombel</button>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nama Rombel / Jilid</th>
                <th>Guru Pengampu</th>
                <th>Jumlah Siswa</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>

      <!-- Modal Tambah/Edit Rombel Ummi -->
      <div class="modal-overlay" id="modal-ummi">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="ummi-modal-title">Tambah Rombel Ummi</h3>
            <button class="btn-icon" onclick="App.closeModal('modal-ummi')"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-ummi">
            <div class="modal-body">
              <input type="hidden" id="ummi-id">
              <div class="form-group">
                <label>Nama Rombel (Contoh: Jilid 1A, Al Quran B)</label>
                <input type="text" id="ummi-name" required placeholder="Masukkan nama rombel...">
              </div>
              <div class="form-group">
                <label>Level/Jilid</label>
                <select id="ummi-level" required>
                  <option value="">— Pilih Level —</option>
                  <option value="Pra-TK">Pra-TK</option>
                  <option value="Jilid 1">Jilid 1</option>
                  <option value="Jilid 2">Jilid 2</option>
                  <option value="Jilid 3">Jilid 3</option>
                  <option value="Jilid 4">Jilid 4</option>
                  <option value="Jilid 5">Jilid 5</option>
                  <option value="Jilid 6">Jilid 6</option>
                  <option value="Al-Quran">Al-Quran</option>
                  <option value="Ghorib/Tajwid">Ghorib/Tajwid</option>
                </select>
              </div>
              <div class="form-group">
                <label>Guru Pengampu</label>
                <select id="ummi-teacher" required>
                  <option value="">— Pilih Guru Ummi —</option>
                  ${guruOptions}
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-ummi')">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-ummi">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-add-ummi').onclick = () => {
      document.getElementById('ummi-modal-title').innerText = 'Tambah Rombel Ummi';
      document.getElementById('form-ummi').reset();
      document.getElementById('ummi-id').value = '';
      App.openModal('modal-ummi');
    };

    container.querySelectorAll('[data-edit-ummi]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.editUmmi;
        const cls = classArr.find(c => c.id === id);
        if(!cls) return;
        document.getElementById('ummi-modal-title').innerText = 'Edit Rombel Ummi';
        document.getElementById('ummi-id').value = cls.id;
        document.getElementById('ummi-name').value = cls.name || '';
        document.getElementById('ummi-level').value = cls.level || '';
        document.getElementById('ummi-teacher').value = cls.teacherId || '';
        App.openModal('modal-ummi');
      };
    });

    container.querySelectorAll('[data-del-ummi]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.delUmmi;
        const cls = classArr.find(c => c.id === id);
        if(!cls) return;
        if(Object.keys(cls.students || {}).length > 0) {
          alert('Tidak bisa menghapus rombel karena masih ada siswa di dalamnya.');
          return;
        }
        if(!confirm(`Yakin ingin menghapus Rombel Ummi "${cls.name}"?`)) return;
        await DB.deleteUmmiClass(id);
        UMMIPages.renderUmmiMapping(container);
      };
    });

    document.getElementById('form-ummi').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('ummi-id').value;
      const data = {
        name: document.getElementById('ummi-name').value.trim(),
        level: document.getElementById('ummi-level').value,
        teacherId: document.getElementById('ummi-teacher').value
      };
      if(!data.name || !data.level || !data.teacherId) return;
      
      const btnSave = document.getElementById('btn-save-ummi');
      btnSave.disabled = true;
      btnSave.innerText = 'Menyimpan...';

      try {
        if(id) {
          const existing = classArr.find(c => c.id === id);
          await DB.saveUmmiClass(id, { ...existing, ...data });
        } else {
          await DB.saveUmmiClass(null, { ...data, students: {} });
        }
        App.closeModal('modal-ummi');
        UMMIPages.renderUmmiMapping(container);
      } catch (err) {
        alert(err.message || 'Terjadi kesalahan saat menyimpan');
        btnSave.disabled = false;
        btnSave.innerText = 'Simpan';
      }
    };
  }
};
