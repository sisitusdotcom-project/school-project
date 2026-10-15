const UMMI_LEVELS = [
  'Pra-Jilid',
  'Jilid 1',
  'Jilid 2',
  'Jilid 3',
  'Jilid 4',
  'Jilid 5',
  'Jilid 6',
  'Al-Quran',
  'Gharibul Qur\'an',
  'Tajwid Dasar'
];
const UMMI_LEVEL_DESCS = {
  'Pra-Jilid': 'Pengenalan huruf hijaiyah dasar dan persiapan masuk jilid',
  'Jilid 1': 'Pengenalan huruf hijaiyah tunggal berbaris fathah, kasrah, dhammah, dan latihan dasar',
  'Jilid 2': 'Pengenalan bacaan panjang (mad thabi\'i) dan variasinya',
  'Jilid 3': 'Pengenalan bacaan tanwin, sukun, qalqalah, dan harakat panjang lainnya',
  'Jilid 4': 'Pengenalan tasydid, nun mati/tanwin bertemu huruf hijaiyah (idgham, ikhfa, izhhar, iqlab), dan hukum tajwid dasar',
  'Jilid 5': 'Pengenalan bacaan khusus, wakaf, dan pendalaman tajwid praktis',
  'Jilid 6': 'Pelancaran bacaan Al-Qur\'an dengan tartil dan persiapan langsung membaca Al-Qur\'an mushaf standar',
  'Al-Quran': 'Pelancaran tilawah mushaf Al-Qur\'an dengan tajwid dan fashahah',
  'Gharibul Qur\'an': 'Khusus membahas bacaan khusus (isymam, imalah, tashil, saktah)',
  'Tajwid Dasar': 'Panduan teori dan hukum ilmu tajwid praktis'
};
const UMMI_GRADES = [
  { score: 100, predicate: 'A+', label: '100 = A+ (Benar semua, kualitas baca bagus sekali = Naik ke halaman berikutnya)', action: 'Naik ke halaman berikutnya' },
  { score: 95, predicate: 'A', label: '95 = A (Benar semua, kualitas baca biasa-biasa = Naik ke halaman berikutnya)', action: 'Naik ke halaman berikutnya' },
  { score: 90, predicate: 'B+', label: '90 = B+ (Salah 1 kali, bisa membetulkan sendiri = Naik ke halaman berikutnya)', action: 'Naik ke halaman berikutnya' },
  { score: 85, predicate: 'B', label: '85 = B (Salah 2 kali, bisa membetulkan sendiri = Naik ke halaman berikutnya)', action: 'Naik ke halaman berikutnya' },
  { score: 80, predicate: 'B-', label: '80 = B- (Salah 3 kali, bisa membetulkan sendiri = Naik, tapi diulangi dulu halaman tsb)', action: 'Naik, tapi diulangi dulu halaman tsb' },
  { score: 75, predicate: 'C+', label: '75 = C+ (Salah 4 kali, bisa membetulkan sendiri = Belum boleh dinaikkan/diulangi lagi)', action: 'Belum boleh dinaikkan / diulangi lagi' },
  { score: 70, predicate: 'C', label: '70 = C (Salah 5 kali, bisa membetulkan sendiri = Belum boleh dinaikkan/diulangi lagi)', action: 'Belum boleh dinaikkan / diulangi lagi' }
];
const UMMIPages = {
  async renderUmmiMapping(container) {
    Router.setTitle('Pemetaan Rombel & Guru Ummi', 'Atur pembagian rombel berbasis kemampuan santri lintas kelas.');
    const [ummiClasses, users, allStudents, allClasses, roomsData] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllUsers(),
      DB.getAllStudents(),
      DB.getClasses(),
      DB.getRooms()
    ]);
    const roomArr = DB.toArray(roomsData);
    const classArr = DB.toArray(ummiClasses);
    const guruUmmi = DB.toArray(users).filter(u => {
      const assignments = AppConfig.getRoleAssignments(u);
      return assignments.includes('GURU_UMMI') || assignments.includes('TIM_UMMI') || assignments.includes('KOORD_UMMI');
    });
    const rows = classArr.length ? classArr.map((c, idx) => {
      const teacher = guruUmmi.find(g => g.id === c.teacherId);
      const studentCount = Object.keys(c.students || {}).length;
      return `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${AppConfig.escapeHtml(c.name)}</strong><br><small class="text-muted"><i class="ph ph-map-pin"></i> ${AppConfig.escapeHtml(c.room || 'Tempat belum diatur')} · ${AppConfig.escapeHtml(c.level || 'Jilid')}</small></td>
          <td>${teacher ? AppConfig.escapeHtml(teacher.name) : '<span class="text-muted">Belum ditugaskan</span>'}</td>
          <td><span class="badge badge-primary">${studentCount} Santri</span></td>
          <td class="action-cell">
            <button class="btn btn-primary btn-sm" data-map-students="${c.id}" title="Petakan Santri"><i class="ph ph-users-three"></i> Petakan Santri</button>
            <button class="btn btn-outline btn-sm" data-edit-ummi="${c.id}" title="Edit Rombel"><i class="ph ph-pencil-simple"></i></button>
            <button class="btn btn-danger btn-sm" data-del-ummi="${c.id}" title="Hapus"><i class="ph ph-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="5" class="text-center text-muted">Belum ada Rombel Ummi. Silakan buat rombel baru.</td></tr>';
    const guruOptions = guruUmmi.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('');
    const levelOptions = UMMI_LEVELS.map(lvl => `<option value="${lvl}">${lvl}</option>`).join('');
    container.innerHTML = `
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div>
            <h3 class="card-title">Daftar Rombel Ummi & Pembagian Guru</h3>
            <p class="text-muted">Rombel bersifat fleksibel lintas kelas formal berdasarkan hasil tes kemampuan membaca jilid Al-Qur\'an.</p>
          </div>
          <button class="btn btn-primary" id="btn-add-ummi"><i class="ph ph-plus"></i> Tambah Rombel Baru</button>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Rombel & Tempat</th>
                <th>Ustadz / Ustadzah Pengampu</th>
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
                <label>Nama Rombel (Contoh: Kelompok Jilid 1A, Kelompok Al-Qur\'an Khadijah)</label>
                <input type="text" id="ummi-name" required placeholder="Masukkan nama rombel...">
              </div>
              <div class="form-group">
                <label>Tingkat / Jilid Utama</label>
                <select id="ummi-level" required>
                  <option value="">— Pilih Tingkat —</option>
                  ${levelOptions}
                </select>
              </div>
              <div class="form-group">
                <label>Guru Pengampu (Ustadz / Ustadzah)</label>
                <select id="ummi-teacher" required>
                  <option value="">— Pilih Guru Ummi —</option>
                  ${guruOptions}
                </select>
              </div>
              <div class="form-group">
                <label>Tempat / Ruang Belajar (Di Lingkungan Sekolah)</label>
                <input type="text" id="ummi-room" list="rooms-list-options" placeholder="Contoh: Serambi Masjid (Sayap Timur), Kelas 1 Abu Bakar, dll.">
                <datalist id="rooms-list-options">
                  ${roomArr.map(r => `<option value="${AppConfig.escapeHtml(r.name || r.id)}"></option>`).join('')}
                </datalist>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-ummi">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-ummi">Simpan Rombel</button>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-overlay" id="modal-ummi-mapping-students">
        <div class="modal modal-lg">
          <div class="modal-header">
            <div>
              <h3 class="modal-title" id="modal-map-stu-title">Pemetaan Santri Rombel</h3>
              <p class="text-muted" id="modal-map-stu-sub">Pilih santri lintas kelas formal untuk dikelompokkan ke rombel ini.</p>
            </div>
            <button class="btn-icon" data-close-modal="modal-ummi-mapping-students"><i class="ph ph-x"></i></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="modal-map-cls-id">
            <div class="eks-students-filter-row">
              <select id="modal-map-class-filter" class="mapel-select-input">
                <option value="">— Semua Kelas Formal (1 s/d 6) —</option>
                ${DB.toArray(allClasses).map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('')}
              </select>
              <input type="text" id="modal-map-search" placeholder="Cari nama santri atau NIS..." class="mapel-select-input">
              <span class="eks-badge-counter" id="modal-map-count">0 Santri Terpilih</span>
            </div>
            <div class="card-actions-row">
              <button type="button" class="btn btn-outline btn-sm" id="btn-map-select-all"><i class="ph ph-check-square"></i> Pilih Semua Tampil</button>
              <button type="button" class="btn btn-outline btn-sm" id="btn-map-deselect-all"><i class="ph ph-square"></i> Batalkan Semua Tampil</button>
            </div>
            <div class="eks-students-list" id="modal-map-students-list"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-close-modal="modal-ummi-mapping-students">Batal</button>
            <button type="button" class="btn btn-primary" id="btn-save-map-students"><i class="ph ph-floppy-disk"></i> Simpan Pemetaan Santri</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btn-add-ummi').onclick = () => {
      document.getElementById('ummi-modal-title').innerText = 'Tambah Rombel Ummi';
      document.getElementById('form-ummi').reset();
      document.getElementById('ummi-id').value = '';
      document.getElementById('ummi-room').value = '';
      App.openModal('modal-ummi');
    };
    container.querySelectorAll('[data-edit-ummi]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.editUmmi;
        const cls = classArr.find(c => c.id === id);
        if (!cls) return;
        document.getElementById('ummi-modal-title').innerText = 'Edit Rombel Ummi';
        document.getElementById('ummi-id').value = cls.id;
        document.getElementById('ummi-name').value = cls.name || '';
        document.getElementById('ummi-level').value = cls.level || '';
        document.getElementById('ummi-teacher').value = cls.teacherId || '';
        document.getElementById('ummi-room').value = cls.room || '';
        App.openModal('modal-ummi');
      };
    });
    container.querySelectorAll('[data-del-ummi]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.delUmmi;
        const cls = classArr.find(c => c.id === id);
        if (!cls) return;
        if (Object.keys(cls.students || {}).length > 0) {
          alert('Tidak bisa menghapus rombel karena masih ada santri di dalamnya. Kosongkan santri terlebih dahulu.');
          return;
        }
        if (!confirm(`Yakin ingin menghapus Rombel Ummi "${cls.name}"?`)) return;
        await DB.deleteUmmiClass(id);
        UMMIPages.renderUmmiMapping(container);
      };
    });
    const studentArr = DB.toArray(allStudents);
    const classArrAll = DB.toArray(allClasses);
    container.querySelectorAll('[data-map-students]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.mapStudents;
        const cls = classArr.find(c => c.id === id);
        if (!cls) return;
        UMMIPages._openMappingStudentsModal(cls, studentArr, classArrAll, container);
      };
    });
    document.getElementById('form-ummi').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('ummi-id').value;
      const data = {
        name: document.getElementById('ummi-name').value.trim(),
        level: document.getElementById('ummi-level').value,
        teacherId: document.getElementById('ummi-teacher').value,
        room: document.getElementById('ummi-room').value.trim()
      };
      if (!data.name || !data.level || !data.teacherId) return;
      const btnSave = document.getElementById('btn-save-ummi');
      btnSave.disabled = true;
      btnSave.innerText = 'Menyimpan...';
      try {
        if (id) {
          const existing = classArr.find(c => c.id === id);
          await DB.saveUmmiClass(id, { ...existing, ...data });
        } else {
          await DB.saveUmmiClass(null, { ...data, students: {} });
        }
        if (typeof NotificationService !== 'undefined' && data.teacherId) {
          NotificationService.notifyUmmiMappingUpdated({
            className: data.name,
            room: data.room,
            teacherId: data.teacherId
          });
        }
        App.closeModal('modal-ummi');
        UMMIPages.renderUmmiMapping(container);
      } catch (err) {
        alert(err.message || 'Terjadi kesalahan saat menyimpan');
        btnSave.disabled = false;
        btnSave.innerText = 'Simpan Rombel';
      }
    };
  },
  _openMappingStudentsModal(cls, studentArr, classArr, container) {
    document.getElementById('modal-map-cls-id').value = cls.id;
    document.getElementById('modal-map-stu-title').innerText = `Petakan Santri: ${cls.name}`;
    document.getElementById('modal-map-stu-sub').innerText = `Tingkat ${cls.level || 'Ummi'} · Masukkan santri lintas kelas 1 s/d 6 sesuai kemampuan baca`;
    const selectedMap = { ...(cls.students || {}) };
    const classMap = classArr.reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
    const updateCount = () => {
      const cnt = Object.keys(selectedMap).length;
      document.getElementById('modal-map-count').innerText = `${cnt} Santri Terpilih`;
    };
    const renderList = () => {
      const filterClass = document.getElementById('modal-map-class-filter').value;
      const searchVal = document.getElementById('modal-map-search').value.toLowerCase().trim();
      const filtered = studentArr.filter(s => {
        if (filterClass && s.classId !== filterClass) return false;
        if (searchVal) {
          const matchName = (s.name || '').toLowerCase().includes(searchVal);
          const matchNis = (s.nis || '').includes(searchVal) || (s.nisn || '').includes(searchVal);
          if (!matchName && !matchNis) return false;
        }
        return true;
      });
      const listCont = document.getElementById('modal-map-students-list');
      if (!filtered.length) {
        listCont.innerHTML = '<p class="text-muted" class="empty-state-text">Tidak ada santri yang cocok dengan filter.</p>';
        return;
      }
      listCont.innerHTML = filtered.map(s => {
        const isChecked = !!selectedMap[s.id];
        const className = classMap[s.classId] || s.classId || '-';
        const curLvl = s.ummiLevel || cls.level || 'Jilid';
        return `
          <label class="eks-student-item">
            <input type="checkbox" data-student-id="${s.id}" ${isChecked ? 'checked' : ''}>
            <div class="eks-student-meta">
              <span class="eks-student-name">${AppConfig.escapeHtml(s.name)}</span>
              <span class="eks-student-sub">${AppConfig.escapeHtml(className)} · ${idLabel} · <strong class="text-primary">${AppConfig.escapeHtml(curLvl)}</strong></span>
            </div>
          </label>
        `;
      }).join('');
      listCont.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.onchange = (ev) => {
          const sid = ev.target.dataset.studentId;
          const sObj = studentArr.find(x => x.id === sid);
          if (ev.target.checked) {
            selectedMap[sid] = {
              level: (sObj && sObj.ummiLevel) || cls.level || 'Jilid 1',
              enrolledAt: Date.now()
            };
          } else {
            delete selectedMap[sid];
          }
          updateCount();
        };
      });
    };
    document.getElementById('modal-map-class-filter').value = '';
    document.getElementById('modal-map-search').value = '';
    document.getElementById('modal-map-class-filter').onchange = renderList;
    document.getElementById('modal-map-search').oninput = renderList;
    document.getElementById('btn-map-select-all').onclick = () => {
      document.querySelectorAll('#modal-map-students-list input[type="checkbox"]').forEach(chk => {
        chk.checked = true;
        const sid = chk.dataset.studentId;
        const sObj = studentArr.find(x => x.id === sid);
        selectedMap[sid] = {
          level: (sObj && sObj.ummiLevel) || cls.level || 'Jilid 1',
          enrolledAt: Date.now()
        };
      });
      updateCount();
    };
    document.getElementById('btn-map-deselect-all').onclick = () => {
      document.querySelectorAll('#modal-map-students-list input[type="checkbox"]').forEach(chk => {
        chk.checked = false;
        delete selectedMap[chk.dataset.studentId];
      });
      updateCount();
    };
    document.getElementById('btn-save-map-students').onclick = async () => {
      const btn = document.getElementById('btn-save-map-students');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      const cleanStudents = Object.keys(selectedMap).length ? selectedMap : null;
      await db.ref(`ummi_classes/${cls.id}/students`).set(cleanStudents);
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Pemetaan Santri';
      App.closeModal('modal-ummi-mapping-students');
      UMMIPages.renderUmmiMapping(container);
    };
    updateCount();
    renderList();
    document.getElementById('modal-ummi-mapping-students').classList.add('active');
  },
  async renderUmmiClasses(container) {
    Router.setTitle('Rombel Ummi Saya', 'Daftar kelompok jilid dan santri binaan yang Anda ampu.');
    const uid = Auth.currentUser.uid;
    const [ummiClasses, allStudents, allClasses] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllStudents(),
      DB.getClasses()
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
            <div class="stat-icon stat-icon--warning" ><i class="ph ph-chalkboard-teacher"></i></div>
            <h3 class="card-title">Belum Ada Rombel Ditugaskan</h3>
            <p class="text-muted">Anda belum memiliki Rombel Ummi yang ditugaskan oleh Koordinator Ummi. Silakan hubungi Koordinator Ummi untuk pemetaan rombel santri.</p>
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
        const stuLevel = s.ummiLevel || (cls.students[s.id] && cls.students[s.id].level) || cls.level || 'Jilid';
        return `
          <tr>
            <td class="text-center">${sIdx + 1}</td>
            <td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
            <td>${AppConfig.escapeHtml(cName)}</td>
            <td><span class="badge badge-success">${AppConfig.escapeHtml(stuLevel)}</span></td>
            <td class="action-cell">
              <a href="#/guru/ummi/progress?classId=${cls.id}&studentId=${s.id}" class="btn btn-primary btn-sm"><i class="ph ph-book-open"></i> Buka Jurnal</a>
              <button class="btn btn-outline btn-sm" data-req-exam="${s.id}" data-stu-name="${AppConfig.escapeHtml(s.name)}" data-cur-level="${AppConfig.escapeHtml(stuLevel)}" data-cls-id="${cls.id}"><i class="ph ph-arrow-circle-up"></i> Ajukan Tes</button>
            </td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="5" class="text-center text-muted">Belum ada santri terdaftar di rombel ini.</td></tr>';
      const mobileStudentCards = studentsInRombel.length ? studentsInRombel.map((s, sIdx) => {
        const cName = gradeClassMap[s.classId] || s.classId || '-';
        const stuLevel = s.ummiLevel || (cls.students[s.id] && cls.students[s.id].level) || cls.level || 'Jilid';
        return `
          <div class="ummi-student-item">
            <div class="ummi-student-item-top">
              <div class="ummi-student-item-title">
                <span class="ummi-student-num">${sIdx + 1}.</span>
                <strong>${AppConfig.escapeHtml(s.name)}</strong>
              </div>
              <span class="badge badge-success badge-sm">${AppConfig.escapeHtml(stuLevel)}</span>
            </div>
            <div class="ummi-student-item-sub">
              <span><i class="ph ph-chalkboard"></i> ${AppConfig.escapeHtml(cName)}</span>
            </div>
            <div class="ummi-student-item-actions">
              <a href="#/guru/ummi/progress?classId=${cls.id}&studentId=${s.id}" class="btn btn-primary btn-xs"><i class="ph ph-book-open"></i> Buka Jurnal</a>
              <button class="btn btn-outline btn-xs" data-req-exam="${s.id}" data-stu-name="${AppConfig.escapeHtml(s.name)}" data-cur-level="${AppConfig.escapeHtml(stuLevel)}" data-cls-id="${cls.id}"><i class="ph ph-arrow-circle-up"></i> Ajukan Tes</button>
            </div>
          </div>
        `;
      }).join('') : '<p class="text-muted text-center empty-state-text">Belum ada santri terdaftar di rombel ini.</p>';
      return `
        <div class="card section-spacer">
          <div class="card-header ummi-rombel-header">
            <div class="ummi-rombel-info">
              <h3 class="card-title">${idx + 1}. ${AppConfig.escapeHtml(cls.name)}</h3>
              <p class="text-muted ummi-rombel-meta"><i class="ph ph-map-pin"></i> <strong>Tempat:</strong> ${AppConfig.escapeHtml(cls.room || 'Tempat belum diatur')} · Tingkat: ${AppConfig.escapeHtml(cls.level || 'Jilid')} · Total ${studentsInRombel.length} Santri Binaan Lintas Kelas</p>
            </div>
            <div class="card-header-actions ummi-rombel-actions">
              <a href="#/guru/ummi/progress?classId=${cls.id}" class="btn btn-primary btn-sm"><i class="ph ph-book-open"></i> Jurnal Rombel Ini</a>
            </div>
          </div>
          <div class="ummi-students-desktop table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th class="table-col-sm text-center">No</th>
                  <th>Nama Santri</th>
                  <th>Kelas Formal</th>
                  <th>Tingkat Jilid</th>
                  <th class="table-col-action">Aksi Pembelajaran</th>
                </tr>
              </thead>
              <tbody>${studentRows}</tbody>
            </table>
          </div>
          <div class="ummi-students-mobile">
            ${mobileStudentCards}
          </div>
        </div>
      `;
    }).join('');
    container.innerHTML = `
      ${rombelCards}
      <div class="modal-overlay" id="modal-req-exam">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-req-title">Ajukan Tes Kenaikan Jilid</h3>
            <button class="btn-icon" data-close-modal="modal-req-exam"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-req-exam">
            <div class="modal-body">
              <input type="hidden" id="req-stu-id">
              <input type="hidden" id="req-cls-id">
              <div class="form-group">
                <label>Nama Santri</label>
                <input type="text" id="req-stu-name" readonly>
              </div>
              <div class="form-group">
                <label>Tingkat / Jilid Saat Ini</label>
                <input type="text" id="req-cur-level" readonly>
              </div>
              <div class="form-group">
                <label>Target Kenaikan Tingkat</label>
                <select id="req-target-level" required>
                  ${UMMI_LEVELS.map(lvl => `<option value="${lvl}">${lvl}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Catatan Kesiapan dari Guru Pengampu</label>
                <textarea id="req-notes" rows="3" required placeholder="Contoh: Sudah tuntas jilid 2 sampai halaman akhir, bacaan tartil dan makhraj mad thabi\'i konsisten lancar."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-req-exam">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-req"><i class="ph ph-paper-plane-tilt"></i> Kirim Pengajuan ke Koordinator</button>
            </div>
          </form>
        </div>
      </div>
    `;
    container.querySelectorAll('[data-req-exam]').forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.reqExam;
        const sname = btn.dataset.stuName;
        const curLvl = btn.dataset.curLevel;
        const cid = btn.dataset.clsId;
        document.getElementById('req-stu-id').value = sid;
        document.getElementById('req-cls-id').value = cid;
        document.getElementById('req-stu-name').value = sname;
        document.getElementById('req-cur-level').value = curLvl;
        const curIdx = UMMI_LEVELS.indexOf(curLvl);
        const nextLvl = (curIdx !== -1 && curIdx < UMMI_LEVELS.length - 1) ? UMMI_LEVELS[curIdx + 1] : curLvl;
        document.getElementById('req-target-level').value = nextLvl;
        document.getElementById('req-notes').value = '';
        App.openModal('modal-req-exam');
      };
    });
    document.getElementById('form-req-exam').onsubmit = async (e) => {
      e.preventDefault();
      const sid = document.getElementById('req-stu-id').value;
      const cid = document.getElementById('req-cls-id').value;
      const sname = document.getElementById('req-stu-name').value;
      const curLvl = document.getElementById('req-cur-level').value;
      const targetLvl = document.getElementById('req-target-level').value;
      const notes = document.getElementById('req-notes').value.trim();
      const btn = document.getElementById('btn-submit-req');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Mengirim...';
      try {
        await DB.saveUmmiExam(null, {
          studentId: sid,
          studentName: sname,
          ummiClassId: cid,
          currentLevel: curLvl,
          targetLevel: targetLvl,
          teacherNotes: notes,
          requestedBy: Auth.currentUser.uid,
          requestedByName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
          requestedAt: Date.now(),
          status: 'Menunggu ACC'
        });
        if (typeof NotificationService !== 'undefined') {
          NotificationService.notifyUmmiExamRequested({
            studentName: sname,
            currentLevel: curLvl,
            targetLevel: targetLvl,
            requestedByName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
            requestedBy: Auth.currentUser.uid
          });
        }
        App.closeModal('modal-req-exam');
        alert('Pengajuan ujian kenaikan jilid berhasil dikirim ke Koordinator Ummi!');
      } catch (err) {
        alert(err.message || 'Gagal mengirim pengajuan.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Kirim Pengajuan ke Koordinator';
      }
    };
  },
  async renderProgress(container) {
    Router.setTitle('Jurnal Harian Jilid', 'Pencatatan sesi pembelajaran harian dan Kartu Prestasi santri.');
    const uid = Auth.currentUser.uid;
    const [ummiClasses, allStudents, allClasses] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllStudents(),
      DB.getClasses()
    ]);
    const classArr = DB.toArray(ummiClasses);
    const userAssigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || Auth.currentUser || {});
    const isKoordOrAdmin = userAssigns.includes('KOORD_UMMI') || Auth.currentRole === 'admin' || Auth.userData?.role === 'admin';
    let myClasses = isKoordOrAdmin ? classArr : classArr.filter(c => c.teacherId === uid);
    if (!myClasses.length) {
      const assigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
      myClasses = classArr.filter(c => assigns.some(a => a.toLowerCase().includes(c.name.toLowerCase().replace(/[^a-z0-9]/g, ''))));
    }
    if (!myClasses.length) {
      myClasses = classArr;
    }
    if (!myClasses.length) {
      container.innerHTML = `<div class="card"><p class="text-muted">Belum ada Rombel Ummi terdaftar di sistem. Silakan buat rombel terlebih dahulu di menu Pemetaan Rombel.</p></div>`;
      return;
    }
    const studentMap = DB.toArray(allStudents).reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
    const gradeClassMap = DB.toArray(allClasses).reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
    const hash = window.location.hash || '';
    const qs = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(qs);
    let activeClassId = params.get('classId') || myClasses[0].id;
    let activeCls = myClasses.find(c => c.id === activeClassId) || myClasses[0];
    let viewContainer = container.querySelector('#ummi-progress-view');
    if (!viewContainer) {
      const guideBanner = container.querySelector('#feature-guide-banner');
      container.innerHTML = '';
      if (guideBanner) {
        container.appendChild(guideBanner);
      }
      viewContainer = document.createElement('div');
      viewContainer.id = 'ummi-progress-view';
      container.appendChild(viewContainer);
    }
    const renderJournalView = async (selectedClassId, selectedStudentId) => {
      activeCls = myClasses.find(c => c.id === selectedClassId) || myClasses[0];
      const enrolledIds = Object.keys(activeCls.students || {});
      const enrolledStudents = enrolledIds.map(id => studentMap[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
      const clsOpts = myClasses.map(c => `<option value="${c.id}" ${c.id === activeCls.id ? 'selected' : ''}>${AppConfig.escapeHtml(c.name)} (${AppConfig.escapeHtml(c.level || 'Jilid')})</option>`).join('');
      if (!enrolledStudents.length) {
        viewContainer.innerHTML = `
          <div class="card toolbar-panel ummi-toolbar-card">
            <div class="ummi-toolbar">
              <div class="ummi-toolbar-item">
                <label class="ummi-toolbar-label">Pilih Rombel:</label>
                <select id="sel-jurnal-cls" class="ummi-toolbar-select">${clsOpts}</select>
              </div>
            </div>
          </div>
          <div class="card"><p class="text-muted">Belum ada santri di rombel ini. Koordinator dapat menambahkan santri lewat menu Pemetaan Rombel.</p></div>
        `;
        document.getElementById('sel-jurnal-cls').onchange = (e) => renderJournalView(e.target.value);
        if (typeof FeatureGuides !== 'undefined') {
          FeatureGuides.attach(container, '#/guru/ummi/progress');
        }
        return;
      }
      let activeStudent = enrolledStudents.find(s => s.id === selectedStudentId) || enrolledStudents[0];
      const studentOpts = enrolledStudents.map(s => `<option value="${s.id}" ${s.id === activeStudent.id ? 'selected' : ''}>${AppConfig.escapeHtml(s.name)} (${gradeClassMap[s.classId] || s.classId || '-'})</option>`).join('');
      const journalsObj = await DB.getUmmiJournals(activeStudent.id);
      const journalsArr = DB.toArray(journalsObj).sort((a, b) => (Number(a.meetingNo) || 0) - (Number(b.meetingNo) || 0));
      const nextMeetingNo = journalsArr.length ? (Math.max(...journalsArr.map(j => Number(j.meetingNo) || 0)) + 1) : 1;
      const todayStr = new Date().toISOString().slice(0, 10);
      const curStudentLevel = activeStudent.ummiLevel || (activeCls.students[activeStudent.id] && activeCls.students[activeStudent.id].level) || activeCls.level || 'Jilid 1';
      const levelOpts = UMMI_LEVELS.map(lvl => `<option value="${lvl}" ${lvl === curStudentLevel ? 'selected' : ''}>${lvl} — ${UMMI_LEVEL_DESCS[lvl] || ''}</option>`).join('');
      const gradeOpts = UMMI_GRADES.map(g => `<option value="${g.score}">${g.label}</option>`).join('');
      const journalRows = journalsArr.length ? journalsArr.map(j => {
        const badgeCls = (j.score >= 90) ? 'badge-success' : ((j.score >= 80) ? 'badge-primary' : 'badge-warning');
        return `
          <tr>
            <td class="text-center"><strong>${j.meetingNo || j.meetingNumber || '-'}</strong></td>
            <td>${AppConfig.escapeHtml(j.date || '-')}</td>
            <td><span class="badge badge-primary">${AppConfig.escapeHtml(j.level || '-')}</span></td>
            <td><strong>${AppConfig.escapeHtml(j.page || j.pageOrAyat || '-')}</strong></td>
            <td>${AppConfig.escapeHtml(j.material || '-')}</td>
            <td><span class="badge ${badgeCls}">${j.score || '-'} (${j.predicate || (UMMI_GRADES.find(g => g.score === Number(j.score)) || {}).predicate || '-'})</span><br><small class="text-muted">${AppConfig.escapeHtml(j.action || (UMMI_GRADES.find(g => g.score === Number(j.score)) || {}).action || '')}</small></td>
            <td><span class="badge badge-success"><i class="ph ph-check"></i> ${AppConfig.escapeHtml(j.teacherName || 'Ustadz')}</span></td>
            <td>${j.parentVerified ? `<span class="badge badge-success"><i class="ph ph-check-double"></i> Disimak (${AppConfig.escapeHtml(j.parentVerifiedBy || 'Orang Tua')})</span>` : '<span class="badge badge-warning">Belum Disimak</span>'}</td>
            <td>${AppConfig.escapeHtml(j.note || j.notes || '-')}</td>
            <td class="action-cell">
              <button class="btn btn-danger btn-sm" data-del-journal="${j.id}" title="Hapus"><i class="ph ph-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="10" class="text-center text-muted">Belum ada riwayat tatap muka. Masukkan sesi pembelajaran hari ini pada form di bawah.</td></tr>';
      viewContainer.innerHTML = `
        <div class="card toolbar-panel ummi-toolbar-card">
          <div class="ummi-toolbar">
            <div class="ummi-toolbar-group">
              <div class="ummi-toolbar-item">
                <label class="ummi-toolbar-label">Rombel Ummi:</label>
                <select id="sel-jurnal-cls" class="ummi-toolbar-select">${clsOpts}</select>
              </div>
              <div class="ummi-toolbar-item">
                <label class="ummi-toolbar-label">Pilih Santri:</label>
                <select id="sel-jurnal-stu" class="ummi-toolbar-select">${studentOpts}</select>
              </div>
            </div>
            <button class="btn btn-primary btn-sm ummi-toolbar-btn" id="btn-quick-req-exam"><i class="ph ph-arrow-circle-up"></i> Ajukan Tes Kenaikan Jilid</button>
          </div>
        </div>
        <div class="card section-spacer ummi-student-card">
          <div class="ummi-student-banner">
            <div class="ummi-student-info">
              <h3 class="ummi-student-title">${AppConfig.escapeHtml(activeStudent.name)}</h3>
              <p class="ummi-student-meta">Kelas Formal: <strong>${gradeClassMap[activeStudent.classId] || activeStudent.classId || '-'}</strong> · Rombel: <strong>${AppConfig.escapeHtml(activeCls.name)}</strong> · Tingkat Saat Ini: <span class="badge badge-primary">${AppConfig.escapeHtml(curStudentLevel)}</span></p>
            </div>
            <div class="ummi-student-badge-wrap">
              <span class="badge badge-success ummi-stat-badge"><i class="ph ph-calendar-check"></i> Total ${journalsArr.length} Tatap Muka</span>
            </div>
          </div>
        </div>
        <div class="card section-spacer">
          <div class="card-header">
            <h3 class="card-title"><i class="ph ph-plus-circle"></i> Input Sesi Pembelajaran Hari Ini</h3>
          </div>
          <form id="form-add-journal" class="ummi-journal-form">
            <div class="ummi-form-grid">
              <div class="form-group">
                <label>Tatap Muka Ke- (Otomatis Urut)</label>
                <input type="number" id="in-meeting" value="${nextMeetingNo}" required readonly class="input-readonly-bold">
              </div>
              <div class="form-group">
                <label>Tanggal Belajar</label>
                <input type="date" id="in-date" value="${todayStr}" required>
              </div>
              <div class="form-group">
                <label>Tingkat / Jilid</label>
                <select id="in-level" required>${levelOpts}</select>
              </div>
              <div class="form-group">
                <label>Halaman / Ayat</label>
                <input type="text" id="in-page" placeholder="Contoh: Hal. 15 / QS. An-Naba: 1-10" required>
              </div>
            </div>
            <div class="ummi-form-grid-wide">
              <div class="form-group">
                <label>Materi Pokok Bahasan</label>
                <input type="text" id="in-material" placeholder="Contoh: Mengenal tanda sukun dan hukum qalqalah" required>
              </div>
              <div class="form-group">
                <label>Nilai & Kualitas Baca (Standar Ummi)</label>
                <select id="in-score" required>${gradeOpts}</select>
              </div>
            </div>
            <div class="form-group ummi-form-note-group">
              <label>Catatan Kesalahan / Keterangan Belajar di Sekolah</label>
              <input type="text" id="in-note" placeholder="Contoh: Perhatikan panjang mad thabi\'i pada baris ke-3, fashahah sudah sangat baik.">
            </div>
            <button type="submit" class="btn btn-primary ummi-submit-btn" id="btn-save-journal"><i class="ph ph-floppy-disk"></i> Simpan Sesi & Perbarui Capaian BTQ</button>
          </form>
        </div>
        <div class="card section-spacer">
          <div class="card-header">
            <h3 class="card-title"><i class="ph ph-table"></i> Kartu Prestasi Santri (${AppConfig.escapeHtml(activeStudent.name)})</h3>
            <span class="badge badge-primary">9 Kolom Standar Prestasi</span>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th class="table-col-sm">Tatap Muka</th>
                  <th>Tanggal</th>
                  <th>Jilid</th>
                  <th>Halaman / Ayat</th>
                  <th>Pokok Bahasan / Materi</th>
                  <th>Nilai & Keputusan</th>
                  <th>Disimak Guru</th>
                  <th>Disimak Ortu</th>
                  <th>Catatan Kesalahan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>${journalRows}</tbody>
            </table>
          </div>
        </div>
        <div class="modal-overlay" id="modal-req-exam">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">Ajukan Tes Kenaikan Jilid</h3>
              <button class="btn-icon" data-close-modal="modal-req-exam"><i class="ph ph-x"></i></button>
            </div>
            <form id="form-req-exam">
              <div class="modal-body">
                <div class="form-group">
                  <label>Nama Santri</label>
                  <input type="text" value="${AppConfig.escapeHtml(activeStudent.name)}" readonly>
                </div>
                <div class="form-group">
                  <label>Tingkat / Jilid Saat Ini</label>
                  <input type="text" value="${AppConfig.escapeHtml(curStudentLevel)}" readonly>
                </div>
                <div class="form-group">
                  <label>Target Kenaikan Tingkat</label>
                  <select id="prog-target-level" required>
                    ${UMMI_LEVELS.map(lvl => `<option value="${lvl}">${lvl}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Catatan Kesiapan Guru</label>
                  <textarea id="prog-notes" rows="3" required placeholder="Tuliskan catatan kesiapan santri untuk diuji oleh Koordinator Ummi..."></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal="modal-req-exam">Batal</button>
                <button type="submit" class="btn btn-primary" id="btn-prog-submit-req"><i class="ph ph-paper-plane-tilt"></i> Kirim ke Koordinator</button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.getElementById('sel-jurnal-cls').onchange = (e) => renderJournalView(e.target.value);
      document.getElementById('sel-jurnal-stu').onchange = (e) => renderJournalView(activeCls.id, e.target.value);
      document.getElementById('btn-quick-req-exam').onclick = () => {
        const curIdx = UMMI_LEVELS.indexOf(curStudentLevel);
        const nextLvl = (curIdx !== -1 && curIdx < UMMI_LEVELS.length - 1) ? UMMI_LEVELS[curIdx + 1] : curStudentLevel;
        document.getElementById('prog-target-level').value = nextLvl;
        App.openModal('modal-req-exam');
      };
      document.getElementById('form-req-exam').onsubmit = async (e) => {
        e.preventDefault();
        const targetLvl = document.getElementById('prog-target-level').value;
        const notes = document.getElementById('prog-notes').value.trim();
        const btn = document.getElementById('btn-prog-submit-req');
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Mengirim...';
        try {
          await DB.saveUmmiExam(null, {
            studentId: activeStudent.id,
            studentName: activeStudent.name,
            ummiClassId: activeCls.id,
            currentLevel: curStudentLevel,
            targetLevel: targetLvl,
            teacherNotes: notes,
            requestedBy: uid,
            requestedByName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
            requestedAt: Date.now(),
            status: 'Menunggu ACC'
          });
          if (typeof NotificationService !== 'undefined') {
            NotificationService.notifyUmmiExamRequested({
              studentName: activeStudent.name,
              currentLevel: curStudentLevel,
              targetLevel: targetLvl,
              requestedByName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
              requestedBy: uid
            });
          }
          App.closeModal('modal-req-exam');
          alert('Pengajuan ujian kenaikan jilid berhasil dikirim ke Koordinator Ummi!');
        } catch (err) {
          alert(err.message || 'Gagal mengirim pengajuan.');
        } finally {
          btn.disabled = false;
          btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Kirim ke Koordinator';
        }
      };
      viewContainer.querySelectorAll('[data-del-journal]').forEach(btn => {
        btn.onclick = async () => {
          const jid = btn.dataset.delJournal;
          if (!confirm('Yakin ingin menghapus sesi jurnal ini?')) return;
          await DB.deleteUmmiJournal(activeStudent.id, jid);
          renderJournalView(activeCls.id, activeStudent.id);
        };
      });
      document.getElementById('form-add-journal').onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-journal');
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan Sesi & Menghitung BTQ...';
        const meetingNo = Number(document.getElementById('in-meeting').value) || nextMeetingNo;
        const dateVal = document.getElementById('in-date').value;
        const lvlVal = document.getElementById('in-level').value;
        const pageVal = document.getElementById('in-page').value.trim();
        const matVal = document.getElementById('in-material').value.trim();
        const scoreVal = Number(document.getElementById('in-score').value);
        const noteVal = document.getElementById('in-note').value.trim();
        const gradeObj = UMMI_GRADES.find(g => g.score === scoreVal) || UMMI_GRADES[0];
        try {
          await DB.saveUmmiJournal(activeStudent.id, null, {
            meetingNo: meetingNo,
            date: dateVal,
            level: lvlVal,
            page: pageVal,
            material: matVal,
            score: scoreVal,
            predicate: gradeObj.predicate,
            action: gradeObj.action,
            teacherId: uid,
            teacherName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
            teacherVerified: true,
            teacherVerifiedAt: Date.now(),
            parentVerified: false,
            note: noteVal,
            ummiClassId: activeCls.id
          });
          renderJournalView(activeCls.id, activeStudent.id);
        } catch (err) {
          alert(err.message || 'Gagal menyimpan jurnal.');
          btn.disabled = false;
          btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Sesi & Perbarui Capaian BTQ';
        }
      };
      if (typeof FeatureGuides !== 'undefined') {
        FeatureGuides.attach(container, '#/guru/ummi/progress');
      }
    };
    await renderJournalView(activeClassId, params.get('studentId'));
    if (typeof FeatureGuides !== 'undefined') {
      FeatureGuides.attach(container, '#/guru/ummi/progress');
    }
  },
  async renderExams(container) {
    Router.setTitle('Antrean Ujian Jilid & Munaqosyah', 'Monitoring dan pengujian kelayakan kenaikan jilid santri.');
    const [snapExams, users, settings] = await Promise.all([
      DB.getUmmiExams(),
      DB.getAllUsers(),
      DB.getSettings()
    ]);
    const examArr = DB.toArray(snapExams).sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
    const guruUmmi = DB.toArray(users).filter(u => {
      const assignments = AppConfig.getRoleAssignments(u);
      return assignments.includes('GURU_UMMI') || assignments.includes('TIM_UMMI') || assignments.includes('KOORD_UMMI');
    });
    const pendingCount = examArr.filter(e => e.status === 'Menunggu ACC').length;
    const scheduledCount = examArr.filter(e => e.status === 'Dijadwalkan').length;
    const passedCount = examArr.filter(e => e.status === 'Lolos').length;
    const rejectedCount = examArr.filter(e => e.status === 'Ditolak').length;
    let activeFilter = 'all';
    const renderTable = (filter) => {
      activeFilter = filter;
      const filtered = examArr.filter(e => {
        if (filter === 'all') return true;
        return e.status === filter;
      });
      const rows = filtered.length ? filtered.map((e, idx) => {
        let badgeCls = 'badge-warning';
        if (e.status === 'Dijadwalkan') badgeCls = 'badge-primary';
        else if (e.status === 'Lolos') badgeCls = 'badge-success';
        else if (e.status === 'Ditolak') badgeCls = 'badge-danger';
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${AppConfig.escapeHtml(e.studentName || '-')}</strong></td>
            <td><span class="badge badge-outline">${AppConfig.escapeHtml(e.currentLevel || '-')}</span> <i class="ph ph-arrow-right"></i> <span class="badge badge-primary">${AppConfig.escapeHtml(e.targetLevel || '-')}</span></td>
            <td>${AppConfig.escapeHtml(e.requestedByName || '-')}<br><small class="text-muted">${AppConfig.escapeHtml(e.teacherNotes || '-')}</small></td>
            <td><span class="badge ${badgeCls}">${e.status}</span></td>
            <td>${e.scheduledDate ? `<strong>${e.scheduledDate}</strong><br><small class="text-muted">Penguji: ${AppConfig.escapeHtml(e.examinerName || '-')}</small>` : '<span class="text-muted">Belum dijadwalkan</span>'}</td>
            <td>${e.examNotes ? AppConfig.escapeHtml(e.examNotes) : (e.score ? `Nilai: ${e.score}` : '-')}</td>
            <td class="action-cell">
              ${e.status === 'Menunggu ACC' ? `
                <button class="btn btn-primary btn-sm" data-acc-exam="${e.id}"><i class="ph ph-calendar-plus"></i> ACC & Jadwal</button>
                <button class="btn btn-danger btn-sm" data-reject-exam="${e.id}"><i class="ph ph-x-circle"></i> Tolak</button>
              ` : ''}
              ${e.status === 'Dijadwalkan' ? `
                <button class="btn btn-success btn-sm" data-result-exam="${e.id}"><i class="ph ph-check-circle"></i> Input Hasil Tes</button>
              ` : ''}
              ${e.status === 'Lolos' ? `<span class="badge badge-success"><i class="ph ph-seal-check"></i> Tingkat Naik</span>` : ''}
              ${e.status === 'Ditolak' ? `<button class="btn btn-outline btn-sm" data-reopen-exam="${e.id}"><i class="ph ph-arrows-clockwise"></i> Evaluasi Ulang</button>` : ''}
            </td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="8" class="text-center text-muted">Tidak ada data ujian pada filter ini.</td></tr>';
      document.getElementById('exam-table-body').innerHTML = rows;
      container.querySelectorAll('[data-acc-exam]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.accExam;
          const target = examArr.find(x => x.id === id);
          if (!target) return;
          UMMIPages._openAccModal(target, guruUmmi, container);
        };
      });
      container.querySelectorAll('[data-reject-exam]').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.rejectExam;
          const note = prompt('Tuliskan alasan penolakan atau catatan pembinaan untuk santri ini:');
          if (note === null) return;
          await DB.saveUmmiExam(id, {
            status: 'Ditolak',
            examNotes: note || 'Perlu pemantapan materi oleh guru pengampu.',
            completedAt: Date.now()
          });
          UMMIPages.renderExams(container);
        };
      });
      container.querySelectorAll('[data-result-exam]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.resultExam;
          const target = examArr.find(x => x.id === id);
          if (!target) return;
          UMMIPages._openResultModal(target, container);
        };
      });
      container.querySelectorAll('[data-reopen-exam]').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.reopenExam;
          await DB.saveUmmiExam(id, { status: 'Menunggu ACC' });
          UMMIPages.renderExams(container);
        };
      });
    };
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-hourglass-high"></i></div>
          <div><p class="stat-value">${pendingCount}</p><p class="stat-label text-muted">Menunggu ACC</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-calendar"></i></div>
          <div><p class="stat-value">${scheduledCount}</p><p class="stat-label text-muted">Sudah Dijadwalkan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-check-circle"></i></div>
          <div><p class="stat-value">${passedCount}</p><p class="stat-label text-muted">Lolos Kenaikan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-x-circle"></i></div>
          <div><p class="stat-value">${rejectedCount}</p><p class="stat-label text-muted">Perlu Pembinaan</p></div>
        </div>
      </section>
      <div class="card toolbar-panel">
        <div class="btn-group-wrap">
          <button class="btn btn-outline btn-sm active" data-filter="all">Semua (${examArr.length})</button>
          <button class="btn btn-outline btn-sm" data-filter="Menunggu ACC">Menunggu ACC (${pendingCount})</button>
          <button class="btn btn-outline btn-sm" data-filter="Dijadwalkan">Dijadwalkan (${scheduledCount})</button>
          <button class="btn btn-outline btn-sm" data-filter="Lolos">Lolos (${passedCount})</button>
          <button class="btn btn-outline btn-sm" data-filter="Ditolak">Ditolak (${rejectedCount})</button>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Santri</th>
                <th>Tingkat -> Target</th>
                <th>Pengaju & Catatan</th>
                <th>Status</th>
                <th>Jadwal & Penguji</th>
                <th>Catatan Ujian</th>
                <th>Aksi Koordinator</th>
              </tr>
            </thead>
            <tbody id="exam-table-body"></tbody>
          </table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-acc-exam">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">ACC & Jadwalkan Ujian Kenaikan</h3>
            <button class="btn-icon" data-close-modal="modal-acc-exam"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-acc-exam">
            <div class="modal-body">
              <input type="hidden" id="acc-exam-id">
              <div class="form-group">
                <label>Santri</label>
                <input type="text" id="acc-stu-name" readonly>
              </div>
              <div class="form-group">
                <label>Target Kenaikan Jilid</label>
                <input type="text" id="acc-target-level" readonly>
              </div>
              <div class="form-group">
                <label>Tanggal Ujian Kenaikan</label>
                <input type="date" id="acc-date" required>
                <small class="text-muted text-block-hint" id="acc-quota-note">*Maksimal kuota 7 santri per hari untuk setiap penguji.</small>
              </div>
              <div class="form-group">
                <label>Koordinator / Penguji Yang Ditugaskan</label>
                <select id="acc-examiner" required>
                  ${guruUmmi.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-acc-exam">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-acc"><i class="ph ph-calendar-check"></i> Konfirmasi & Jadwalkan</button>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-overlay" id="modal-result-exam">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Input Hasil Ujian Kenaikan Jilid</h3>
            <button class="btn-icon" data-close-modal="modal-result-exam"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-result-exam">
            <div class="modal-body">
              <input type="hidden" id="res-exam-id">
              <input type="hidden" id="res-stu-id">
              <input type="hidden" id="res-cls-id">
              <input type="hidden" id="res-target-level">
              <div class="form-group">
                <label>Santri</label>
                <input type="text" id="res-stu-name" readonly>
              </div>
              <div class="form-group">
                <label>Target Kenaikan Jilid</label>
                <input type="text" id="res-display-level" readonly>
              </div>
              <div class="form-group">
                <label>Nilai Munaqosyah / Ujian (0 - 100)</label>
                <input type="number" id="res-score" min="0" max="100" required placeholder="Contoh: 90">
              </div>
              <div class="form-group">
                <label>Keputusan Ujian</label>
                <select id="res-decision" required>
                  <option value="Lolos">Lolos — Otomatis Naikkan Tingkat Jilid Santri</option>
                  <option value="Ditolak">Belum Lolos — Perlu Pemantapan & Mengulang</option>
                </select>
              </div>
              <div class="form-group">
                <label>Catatan Hasil Ujian</label>
                <textarea id="res-notes" rows="3" required placeholder="Tuliskan catatan kelulusan / evaluasi tajwid santri..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-result-exam">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-result"><i class="ph ph-floppy-disk"></i> Simpan Hasil & Perbarui Tingkat</button>
            </div>
          </form>
        </div>
      </div>
    `;
    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTable(btn.dataset.filter);
      };
    });
    renderTable('all');
  },
  _openAccModal(target, guruUmmi, container) {
    document.getElementById('acc-exam-id').value = target.id;
    document.getElementById('acc-stu-name').value = target.studentName || '-';
    document.getElementById('acc-target-level').value = `${target.currentLevel} -> ${target.targetLevel}`;
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('acc-date').value = today;
    document.getElementById('acc-examiner').value = Auth.currentUser.uid;
    App.openModal('modal-acc-exam');
    document.getElementById('form-acc-exam').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('acc-exam-id').value;
      const dateVal = document.getElementById('acc-date').value;
      const examinerId = document.getElementById('acc-examiner').value;
      const examinerObj = guruUmmi.find(g => g.id === examinerId);
      const examinerName = examinerObj ? examinerObj.name : 'Koordinator';
      const scheduledCount = await DB.getScheduledUmmiExamsCount(dateVal, examinerId);
      if (scheduledCount >= 7) {
        alert(`Kuota ujian pada tanggal ${dateVal} untuk ${examinerName} sudah penuh (Maksimal 7 santri per hari). Silakan pilih tanggal lain atau penguji lain.`);
        return;
      }
      const btn = document.getElementById('btn-save-acc');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menjadwalkan...';
      try {
        await DB.saveUmmiExam(id, {
          status: 'Dijadwalkan',
          scheduledDate: dateVal,
          examinerId: examinerId,
          examinerName: examinerName
        });
        if (typeof NotificationService !== 'undefined') {
          NotificationService.notifyUmmiExamScheduled({
            studentName: target.studentName,
            targetLevel: target.targetLevel,
            scheduledDate: dateVal,
            examinerName: examinerName,
            examinerId: examinerId,
            requestedBy: target.requestedBy
          });
        }
        App.closeModal('modal-acc-exam');
        UMMIPages.renderExams(container);
      } catch (err) {
        alert(err.message || 'Gagal menjadwalkan ujian.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-calendar-check"></i> Konfirmasi & Jadwalkan';
      }
    };
  },
  _openResultModal(target, container) {
    document.getElementById('res-exam-id').value = target.id;
    document.getElementById('res-stu-id').value = target.studentId;
    document.getElementById('res-cls-id').value = target.ummiClassId || '';
    document.getElementById('res-target-level').value = target.targetLevel;
    document.getElementById('res-stu-name').value = target.studentName || '-';
    document.getElementById('res-display-level').value = `${target.currentLevel} -> ${target.targetLevel}`;
    document.getElementById('res-score').value = 90;
    document.getElementById('res-decision').value = 'Lolos';
    document.getElementById('res-notes').value = 'Alhamdulillah telah lulus ujian kenaikan tingkat dengan bacaan tartil dan lancar.';
    App.openModal('modal-result-exam');
    document.getElementById('form-result-exam').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('res-exam-id').value;
      const sid = document.getElementById('res-stu-id').value;
      const cid = document.getElementById('res-cls-id').value;
      const targetLvl = document.getElementById('res-target-level').value;
      const score = Number(document.getElementById('res-score').value);
      const decision = document.getElementById('res-decision').value;
      const notes = document.getElementById('res-notes').value.trim();
      const btn = document.getElementById('btn-save-result');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      try {
        await DB.saveUmmiExam(id, {
          status: decision,
          score: score,
          examNotes: notes,
          studentId: sid,
          targetLevel: targetLvl,
          ummiClassId: cid,
          completedAt: Date.now()
        });
        if (typeof NotificationService !== 'undefined') {
          NotificationService.notifyUmmiExamResult({
            studentName: target.studentName || document.getElementById('res-stu-name').value,
            targetLevel: targetLvl,
            decision: decision,
            score: score,
            requestedBy: target.requestedBy,
            studentId: sid
          });
        }
        App.closeModal('modal-result-exam');
        if (decision === 'Lolos') {
          alert(`Selamat! Santri berhasil lulus dan tingkat jilid resmi dinaikkan ke ${targetLvl}. Nilai rapor BTQ otomatis diperbarui.`);
        } else {
          alert('Hasil ujian disimpan. Santri akan dibina kembali oleh guru pengampu.');
        }
        UMMIPages.renderExams(container);
      } catch (err) {
        alert(err.message || 'Gagal menyimpan hasil ujian.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Hasil & Perbarui Tingkat';
      }
    };
  },
  async renderTahfidz(container) {
    Router.setTitle('Setoran Tahfidz (Juz 30-1)', 'Pencatatan hafalan surat dan ayat Al-Quran santri.');
    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ph-book-bookmark"></i> Setoran Tahfidz Al-Qur\'an</h3>
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
          <h3 class="card-title"><i class="ph ph-headphones"></i> Lembar Penilaian Tasmi\'</h3>
          <p class="text-muted">Modul penilaian ujian tasmi\' bil ghoib dan munaqosyah sedang disiapkan.</p>
        </div>
      </div>
    `;
  },
  async renderTasmiPlotting(container) {
    Router.setTitle("Plotting Guru Tasmi'", 'Jadwal dan penugasan ustadz/ustadzah penguji tasmi.');
    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ph-microphone-stage"></i> Plotting Tim Penguji Tasmi\'</h3>
          <p class="text-muted">Penjadwalan dan distribusi santri ke penguji tasmi\' berkala.</p>
        </div>
      </div>
    `;
  }
};
