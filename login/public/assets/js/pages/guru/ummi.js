const UMMIPages = {
  async renderUmmiClasses(container) {
    Router.setTitle('Rombel Ummi Saya', 'Daftar kelompok jilid dan santri binaan yang Anda ampu.');
    const uid = Auth.currentUser.uid;
    const [ummiClasses, allStudents, allClasses] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllStudents(),
      DB.getAllClasses()
    ]);
    const classArr = DB.toArray(ummiClasses);
    let myClasses = classArr.filter(c => c.teacherId === uid);
    if (!myClasses.length) {
      const assigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
      myClasses = classArr.filter(c => assigns.some(a => a.toLowerCase().includes(c.name.toLowerCase().replace(/[^a-z0-9]/g, ''))));
    }
    if (!myClasses.length) {
      container.innerHTML = `
        <div class="card section-block">
          <div class="card-body text-center">
            <div class="stat-icon stat-icon--warning" style="margin:0 auto 16px;"><i class="ph ph-chalkboard-teacher"></i></div>
            <h3 class="card-title">Belum Ada Rombel Ditugaskan</h3>
            <p class="text-muted">Anda belum memiliki Rombel Ummi yang ditugaskan oleh Koordinator Ummi. Silakan hubungi Koordinator Ummi untuk pemetaan rombel.</p>
          </div>
        </div>
      `;
      return;
    }
    const studentMap = DB.toArray(allStudents).reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
    const gradeClassMap = DB.toArray(allClasses).reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
    const rombelCards = myClasses.map((cls, idx) => {
      const studentIds = Object.keys(cls.students || {});
      const studentsInRombel = studentIds.map(id => studentMap[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
      const studentRows = studentsInRombel.length ? studentsInRombel.map((s, sIdx) => {
        const cName = gradeClassMap[s.classId] || s.classId || '-';
        const idLabel = AppConfig.formatStudentIdentity(s.nis, s.nisn);
        return `
          <tr>
            <td>${sIdx + 1}</td>
            <td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
            <td>${AppConfig.escapeHtml(cName)}</td>
            <td>${idLabel}</td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada santri terdaftar di rombel ini.</td></tr>';
      return `
        <div class="card section-spacer">
          <div class="card-header">
            <div>
              <h3 class="card-title">${idx + 1}. ${AppConfig.escapeHtml(cls.name)}</h3>
              <p class="text-muted">${AppConfig.escapeHtml(cls.level || 'Jilid')} · Total ${studentsInRombel.length} Santri</p>
            </div>
            <button class="btn btn-outline btn-sm" data-manage-students="${cls.id}"><i class="ph ph-users"></i> Kelola Santri</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Santri</th>
                  <th>Kelas Formal</th>
                  <th>Identitas</th>
                </tr>
              </thead>
              <tbody>${studentRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');
    container.innerHTML = `
      ${rombelCards}
      <div class="modal-overlay" id="modal-ummi-students">
        <div class="modal modal-lg">
          <div class="modal-header">
            <div>
              <h3 class="modal-title" id="modal-ummi-stu-title">Kelola Santri Rombel</h3>
              <p class="text-muted" id="modal-ummi-stu-sub">Pilih santri untuk rombel ini</p>
            </div>
            <button class="btn-icon" data-close-modal="modal-ummi-students"><i class="ph ph-x"></i></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="modal-ummi-stu-id">
            <div class="eks-students-filter-row">
              <select id="modal-ummi-class-filter" class="mapel-select-input">
                <option value="">— Semua Kelas Formal —</option>
                ${DB.toArray(allClasses).map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('')}
              </select>
              <input type="text" id="modal-ummi-search" placeholder="Cari nama murid atau NIS..." class="mapel-select-input">
              <span class="eks-badge-counter" id="modal-ummi-count">0 Santri Terpilih</span>
            </div>
            <div class="card-actions-row">
              <button type="button" class="btn btn-outline btn-sm" id="btn-ummi-select-all"><i class="ph ph-check-square"></i> Pilih Semua Tampil</button>
              <button type="button" class="btn btn-outline btn-sm" id="btn-ummi-deselect-all"><i class="ph ph-square"></i> Batalkan Semua Tampil</button>
            </div>
            <div class="eks-students-list" id="modal-ummi-students-list"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-close-modal="modal-ummi-students">Batal</button>
            <button type="button" class="btn btn-primary" id="btn-save-ummi-students"><i class="ph ph-floppy-disk"></i> Simpan Daftar Santri</button>
          </div>
        </div>
      </div>
    `;
    const studentArr = DB.toArray(allStudents);
    const classArrAll = DB.toArray(allClasses);
    container.querySelectorAll('[data-manage-students]').forEach(btn => {
      btn.onclick = () => {
        const clsId = btn.dataset.manageStudents;
        const targetCls = myClasses.find(c => c.id === clsId);
        if (!targetCls) return;
        UMMIPages._openStudentsModal(targetCls, studentArr, classArrAll, container);
      };
    });
  },
  _openStudentsModal(targetCls, studentArr, classArr, container) {
    document.getElementById('modal-ummi-stu-id').value = targetCls.id;
    document.getElementById('modal-ummi-stu-title').innerText = `Kelola Santri: ${targetCls.name}`;
    document.getElementById('modal-ummi-stu-sub').innerText = `Tingkat ${targetCls.level || 'Ummi'} · Atur daftar murid yang masuk ke kelompok ini`;
    const selectedMap = { ...(targetCls.students || {}) };
    const classMap = classArr.reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
    const updateCount = () => {
      const cnt = Object.keys(selectedMap).length;
      document.getElementById('modal-ummi-count').innerText = `${cnt} Santri Terpilih`;
    };
    const renderList = () => {
      const filterClass = document.getElementById('modal-ummi-class-filter').value;
      const searchVal = document.getElementById('modal-ummi-search').value.toLowerCase().trim();
      const filtered = studentArr.filter(s => {
        if (filterClass && s.classId !== filterClass) return false;
        if (searchVal) {
          const matchName = (s.name || '').toLowerCase().includes(searchVal);
          const matchNis = (s.nis || '').includes(searchVal) || (s.nisn || '').includes(searchVal);
          if (!matchName && !matchNis) return false;
        }
        return true;
      });
      const listCont = document.getElementById('modal-ummi-students-list');
      if (!filtered.length) {
        listCont.innerHTML = '<p class="text-muted" style="padding:16px;">Tidak ada santri yang cocok dengan filter.</p>';
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
    document.getElementById('modal-ummi-class-filter').value = '';
    document.getElementById('modal-ummi-search').value = '';
    document.getElementById('modal-ummi-class-filter').onchange = renderList;
    document.getElementById('modal-ummi-search').oninput = renderList;
    document.getElementById('btn-ummi-select-all').onclick = () => {
      document.querySelectorAll('#modal-ummi-students-list input[type="checkbox"]').forEach(chk => {
        chk.checked = true;
        selectedMap[chk.dataset.studentId] = true;
      });
      updateCount();
    };
    document.getElementById('btn-ummi-deselect-all').onclick = () => {
      document.querySelectorAll('#modal-ummi-students-list input[type="checkbox"]').forEach(chk => {
        chk.checked = false;
        delete selectedMap[chk.dataset.studentId];
      });
      updateCount();
    };
    document.getElementById('btn-save-ummi-students').onclick = async () => {
      const btn = document.getElementById('btn-save-ummi-students');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      const cleanStudents = Object.keys(selectedMap).length ? selectedMap : null;
      await db.ref(`ummi_classes/${targetCls.id}/students`).set(cleanStudents);
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Daftar Santri';
      App.closeModal('modal-ummi-students');
      UMMIPages.renderUmmiClasses(container);
    };
    updateCount();
    renderList();
    document.getElementById('modal-ummi-students').classList.add('active');
  },
  async renderProgress(container) {
    Router.setTitle('Jurnal Harian Jilid', 'Pencatatan jilid, halaman, dan catatan tajwid santri.');
    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ph-book-open"></i> Jurnal Harian Jilid Santri</h3>
          <p class="text-muted">Modul jurnal harian tilawah dan progres jilid santri sedang disiapkan untuk pencatatan realtime.</p>
        </div>
      </div>
    `;
  },
  async renderTahfidz(container) {
    Router.setTitle('Setoran Tahfidz (Juz 30-1)', 'Pencatatan hafalan surat dan ayat Al-Quran santri.');
    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ph-book-bookmark"></i> Setoran Tahfidz Al-Qur'an</h3>
          <p class="text-muted">Modul pencatatan setoran hafalan juz 30 hingga juz 1 sedang dalam tahap integrasi.</p>
        </div>
      </div>
    `;
  },
  async renderTasmi(container) {
    Router.setTitle("Ujian Tasmi' (Penguji)", 'Pengujian kelulusan sekali duduk dan munaqosyah.');
    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ph-headphones"></i> Lembar Penilaian Tasmi'</h3>
          <p class="text-muted">Modul penilaian ujian tasmi' bil ghoib dan munaqosyah sedang disiapkan.</p>
        </div>
      </div>
    `;
  },
  async renderExams(container) {
    Router.setTitle('Antrean Ujian Jilid & Munaqosyah', 'Monitoring santri yang siap mengikuti ujian munaqosyah.');
    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ph-check-circle"></i> Antrean Ujian & Munaqosyah</h3>
          <p class="text-muted">Daftar verifikasi santri siap uji tingkat jilid dan munaqosyah pusat.</p>
        </div>
      </div>
    `;
  },
  async renderTasmiPlotting(container) {
    Router.setTitle("Plotting Guru Tasmi'", 'Jadwal dan penugasan ustadz/ustadzah penguji tasmi.');
    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ph-microphone-stage"></i> Plotting Tim Penguji Tasmi'</h3>
          <p class="text-muted">Penjadwalan dan distribusi santri ke penguji tasmi' berkala.</p>
        </div>
      </div>
    `;
  },
  async renderPlaceholder(container, title, icon) {
    if (location.hash === '#/guru/ummi/koord/mapping') {
      await UMMIPages.renderUmmiMapping(container);
      return;
    }
    if (location.hash === '#/guru/ummi/classes') {
      await UMMIPages.renderUmmiClasses(container);
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
    const [ummiClasses, users] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllUsers()
    ]);
    const classArr = DB.toArray(ummiClasses);
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
          <td>${studentCount} santri</td>
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
                <th>Jumlah Santri</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-ummi">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="ummi-modal-title">Tambah Rombel Ummi</h3>
            <button class="btn-icon" data-close-modal="modal-ummi"><i class="ph ph-x"></i></button>
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
              <button type="button" class="btn btn-outline" data-close-modal="modal-ummi">Batal</button>
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
          alert('Tidak bisa menghapus rombel karena masih ada santri di dalamnya.');
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
