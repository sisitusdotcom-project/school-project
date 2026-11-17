const CurriculumPages = {
  async renderDashboard(container) {
    Router.setTitle('Kurikulum', 'Pusat pengelolaan struktur akademik, kalender pembelajaran, dan supervisi mutu KBM.');
    const today = new Date();
    const dateStr = AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr(today) : today.toISOString().slice(0, 10);
    const user = Auth.userData || Auth.currentUser || {};
    const uid = user.uid || Auth.currentUser?.uid;
    const assignments = typeof App !== 'undefined' && App.getAssignments ? App.getAssignments() : (Auth.currentAssignments || []);
    const canManageSettings = Auth.currentRole === AppConfig.ROLES.ADMIN ||
      Auth.currentRole === AppConfig.ROLES.CURRICULUM ||
      Auth.hasRole(AppConfig.ROLES.ADMIN) ||
      Auth.hasRole(AppConfig.ROLES.CURRICULUM) ||
      Auth.hasUnit('WAKA_KURIKULUM') ||
      Auth.hasUnit('STAF_KURIKULUM') ||
      assignments.includes('WAKA_KURIKULUM') ||
      assignments.includes('STAF_KURIKULUM') ||
      assignments.includes('TIM_IT') ||
      assignments.includes('WAKA_HUMAS_PERSONALIA');
    const quickNavHtml = App.renderQuickNav([
      { href: '#/admin/classes', icon: 'ph-chalkboard', title: 'Pembagian Rombel', desc: 'Daftar kelas & penugasan wali' },
      { href: '#/admin/classes?action=promo', icon: 'ph-arrow-fat-lines-up', title: 'Kenaikan & Promosi Rombel', desc: 'Proses kenaikan kelas & kelulusan alumni' },
      { href: '#/admin/subjects', icon: 'ph-book-open', title: 'Pemetaan Mapel & Guru', desc: 'Distribusi guru pengampu' },
      { href: '#/curriculum/cocurricular', icon: 'ph-plant', title: 'Konfigurasi Kokurikuler', desc: 'Tema & proyek P5 per fase/rombel' },
      { href: '#/curriculum/schedules', icon: 'ph-calendar-blank', title: 'Jadwal Pelajaran', desc: 'Jadwal KBM & kalender akademik' },
      { href: '#/curriculum/syllabus', icon: 'ph-upload-simple', title: 'Perangkat & Modul Ajar', desc: 'Verifikasi Prota, Prosem & RPP' },
      { href: '#/curriculum/monitoring', icon: 'ph-eye', title: 'Pemantauan KBM', desc: 'Kendali keterlaksanaan jam ajar' },
      { href: '#/curriculum/questions', icon: 'ph-question', title: 'Bank Soal Asesmen', desc: 'Kumpulan kisi-kisi & naskah STS/SAS' },
      { href: '#/curriculum/journals', icon: 'ph-notebook', title: 'Jurnal Pembelajaran', desc: 'Catatan harian materi kelas' },
      { href: '#/curriculum/grades', icon: 'ph-chart-bar', title: 'Rekapitulasi Nilai', desc: 'Rekap capaian akademik murid' },
      { href: '#/curriculum/leger', icon: 'ph-table', title: 'Buku Leger Rapor', desc: 'Rekapitulasi nilai & cetak leger 16 rombel' },
      { href: '#/curriculum/evaluations', icon: 'ph-sliders', title: 'Sistem Penilaian', desc: 'Bobot formatif, sumatif & TP' },
      { href: '#/curriculum/supervision', icon: 'ph-clipboard-text', title: 'Supervisi Guru', desc: 'Observasi pedagogik mengajar' }
    ]);
    const [settings, subjects, classes, myAtt] = await Promise.all([
      DB.getSettings(),
      DB.getSubjects(),
      DB.getClasses(),
      DB.getTeacherAttendance(dateStr, uid).catch(() => null)
    ]);
    const subjectList = DB.toArray(subjects);
    const classList = DB.toArray(classes);
    const heroHtml = AppConfig.getDashboardHeroHtml({
      user,
      attendanceRecord: myAtt,
      position: 'Waka / Staf Kurikulum',
      date: today
    });
    container.innerHTML = `
      ${heroHtml}
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-books"></i></div>
          <div><p class="stat-value">${settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear}</p><p class="stat-label text-muted">Tahun Ajaran</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-calendar"></i></div>
          <div><p class="stat-value">Semester ${settings.currentSemester || AppConfig.DEFAULT_SETTINGS.currentSemester}</p><p class="stat-label text-muted">Semester Berjalan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-list-checks"></i></div>
          <div><p class="stat-value">${subjectList.length}</p><p class="stat-label text-muted">Mata Pelajaran Aktif</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-buildings"></i></div>
          <div><p class="stat-value">${classList.length}</p><p class="stat-label text-muted">Rombongan Belajar</p></div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Operasional Kurikulum</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            ${quickNavHtml}
          </div>
        </div>
      </section>
      ${canManageSettings ? `
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-gear"></i> Konfigurasi Kalender Akademik Aktif (Pusat Mandat SSOT)</h3>
        </div>
        <div class="card-body">
          <form id="form-academic-settings" class="inline-form">
            <div class="form-group compact-field">
              <label>Tahun Ajaran</label>
              <input id="set-year" value="${settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear}" placeholder="Contoh: 2026/2027">
            </div>
            <div class="form-group compact-field">
              <label>Semester</label>
              <select id="set-sem">
                <option value="1" ${settings.currentSemester === '1' ? 'selected' : ''}>Semester 1 (Ganjil)</option>
                <option value="2" ${settings.currentSemester === '2' ? 'selected' : ''}>Semester 2 (Genap)</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Pengaturan</button>
          </form>
        </div>
      </section>
      ` : ''}
    `;
    const formAcademic = document.getElementById('form-academic-settings');
    if (formAcademic) {
      formAcademic.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isConfirmed = confirm('PERINGATAN: Mengubah Tahun Ajaran atau Semester akan berdampak ke seluruh sistem (Presensi, Nilai, dll). Yakin ingin menyimpan perubahan ini?');
        if (!isConfirmed) return;
        const btn = formAcademic.querySelector('button');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
        try {
          const yearVal = document.getElementById('set-year').value.trim();
          const semVal = document.getElementById('set-sem').value;
          await DB.updateSettings({
            academicYear: yearVal,
            currentAcademicYear: yearVal,
            semester: semVal === '2' ? 'Genap' : 'Ganjil',
            currentSemester: semVal
          });
          btn.innerHTML = '<i class="ph ph-check"></i> Berhasil Disimpan';
        } catch (error) {
          console.error('Error updating academic settings', error);
          btn.innerHTML = '<i class="ph ph-x"></i> Gagal Menyimpan';
        } finally {
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }, 2000);
        }
      });
    }
  },
  async renderCocurricular(container) {
    Router.setTitle('Konfigurasi Kokurikuler (P5)', 'Kelola tema proyek Profil Pelajar Pancasila, target fase/rombel, dimensi sasaran, dan narasi capaian rapor.');
    const [settings, cocuProjects, classes] = await Promise.all([
      DB.getSettings(),
      DB.getCocurricularProjects(),
      DB.getClasses()
    ]);
    const currentYear = settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
    const currentSem = settings.currentSemester || AppConfig.DEFAULT_SETTINGS.currentSemester;
    const assignments = typeof App !== 'undefined' && App.getAssignments ? App.getAssignments() : (Auth.currentAssignments || []);
    const canManage = Auth.currentRole === AppConfig.ROLES.ADMIN ||
      Auth.currentRole === AppConfig.ROLES.CURRICULUM ||
      Auth.hasRole(AppConfig.ROLES.ADMIN) ||
      Auth.hasRole(AppConfig.ROLES.CURRICULUM) ||
      Auth.hasUnit('WAKA_KURIKULUM') ||
      Auth.hasUnit('STAF_KURIKULUM') ||
      assignments.includes('WAKA_KURIKULUM') ||
      assignments.includes('STAF_KURIKULUM') ||
      assignments.includes('TIM_IT');
    const classArr = DB.toArray(classes);
    const cocuList = Object.entries(cocuProjects || {}).map(([id, data]) => ({ id, ...data }));
    const P5_THEMES = [
      { name: 'Gaya Hidup Berkelanjutan', badge: 'badge-success' },
      { name: 'Kearifan Lokal', badge: 'badge-primary' },
      { name: 'Bhinneka Tunggal Ika', badge: 'badge-info' },
      { name: 'Bangunlah Jiwa dan Raganya', badge: 'badge-danger' },
      { name: 'Suara Demokrasi', badge: 'badge-warning' },
      { name: 'Rekayasa dan Teknologi', badge: 'badge-primary' },
      { name: 'Kewirausahaan', badge: 'badge-warning' }
    ];
    const P5_DIMENSIONS = [
      'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
      'Berkebinekaan Global',
      'Bergotong Royong',
      'Mandiri',
      'Bernalar Kritis',
      'Kreatif'
    ];
    const phaseLabel = (target) => {
      if (target === 'FASE_A') return 'Fase A (Kelas 1-2)';
      if (target === 'FASE_B') return 'Fase B (Kelas 3-4)';
      if (target === 'FASE_C') return 'Fase C (Kelas 5-6)';
      if (target === 'ALL') return 'Semua Fase (Seluruh Sekolah)';
      const foundCls = classArr.find(c => c.id === target);
      return foundCls ? foundCls.name : target;
    };
    const renderTable = () => {
      const q = (document.getElementById('search-p5')?.value || '').toLowerCase();
      const phaseFilter = document.getElementById('filter-p5-phase')?.value || '';
      const filtered = cocuList.filter(p => {
        const matchesQ = !q || (p.title || '').toLowerCase().includes(q) || (p.theme || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
        const matchesPhase = !phaseFilter || p.target === phaseFilter || (phaseFilter === 'FASE_A' && (p.target === 'FASE_A' || p.target === 'ALL')) || (phaseFilter === 'FASE_B' && (p.target === 'FASE_B' || p.target === 'ALL')) || (phaseFilter === 'FASE_C' && (p.target === 'FASE_C' || p.target === 'ALL'));
        return matchesQ && matchesPhase;
      });
      const rows = filtered.length ? filtered.map((p, idx) => {
        const themeObj = P5_THEMES.find(t => t.name === p.theme) || { badge: 'badge-primary' };
        const dims = Array.isArray(p.dimensions) ? p.dimensions : [];
        const dimBadges = dims.map(d => `<span class="badge badge-outline">${AppConfig.escapeHtml(d)}</span>`).join(' ');
        return `
          <tr>
            <td>${idx + 1}</td>
            <td class="table-col-lg">
              <span class="badge ${themeObj.badge}">${AppConfig.escapeHtml(p.theme || 'Kokurikuler')}</span>
              <div class="user-cell-name">${AppConfig.escapeHtml(p.title || '-')}</div>
              ${p.description ? `<div class="text-muted text-xs">${AppConfig.escapeHtml(p.description)}</div>` : ''}
            </td>
            <td>
              <span class="badge badge-outline">${AppConfig.escapeHtml(phaseLabel(p.target))}</span>
              <div class="text-muted text-xs">TA ${AppConfig.escapeHtml(p.academicYear || currentYear)} · Smt ${AppConfig.escapeHtml(p.semester || currentSem)}</div>
            </td>
            <td class="table-col-md">
              <div class="d-flex flex-wrap gap-1">${dimBadges || '<span class="text-muted">-</span>'}</div>
            </td>
            <td class="table-col-lg">
              <div class="text-xs text-muted">${AppConfig.escapeHtml(p.narrativeTemplate || '-')}</div>
            </td>
            <td class="action-cell">
              ${canManage ? `
                <button class="btn btn-outline btn-sm" data-edit-p5="${p.id}" title="Edit Proyek"><i class="ph ph-pencil-simple"></i></button>
                <button class="btn btn-danger btn-sm" data-del-p5="${p.id}" title="Hapus Proyek"><i class="ph ph-trash"></i></button>
              ` : '<span class="text-muted">-</span>'}
            </td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="6" class="text-center text-muted">Belum ada proyek kokurikuler P5 yang dikonfigurasi.</td></tr>';
      const tbody = container.querySelector('#tbody-p5');
      if (tbody) tbody.innerHTML = rows;
      container.querySelectorAll('[data-edit-p5]').forEach(btn => {
        btn.onclick = () => {
          const item = cocuList.find(x => x.id === btn.dataset.editP5);
          if (item) openModal(item);
        };
      });
      container.querySelectorAll('[data-del-p5]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Yakin ingin menghapus proyek kokurikuler P5 ini?')) return;
          try {
            await DB.deleteCocurricularProject(btn.dataset.delP5);
            CurriculumPages.renderCocurricular(container);
          } catch (err) {
            console.error('Gagal menghapus proyek:', err);
            alert('Gagal menghapus proyek: ' + (err.message || 'Terjadi kesalahan'));
          }
        };
      });
    };
    const openModal = (item = null) => {
      const modal = document.getElementById('modal-p5');
      const titleEl = document.getElementById('modal-p5-title');
      const form = document.getElementById('form-p5');
      form.reset();
      document.getElementById('p5-id').value = item ? item.id : '';
      document.getElementById('p5-year').value = item?.academicYear || currentYear;
      document.getElementById('p5-sem').value = item?.semester || currentSem;
      document.getElementById('p5-target').value = item?.target || 'FASE_A';
      document.getElementById('p5-theme').value = item?.theme || P5_THEMES[0].name;
      document.getElementById('p5-title').value = item?.title || '';
      document.getElementById('p5-desc').value = item?.description || '';
      document.getElementById('p5-narrative').value = item?.narrativeTemplate || '';
      const chosenDims = Array.isArray(item?.dimensions) ? item.dimensions : [];
      document.querySelectorAll('.chk-dimension').forEach(chk => {
        chk.checked = chosenDims.includes(chk.value);
      });
      titleEl.innerText = item ? 'Edit Proyek Kokurikuler (P5)' : 'Tambah Proyek Kokurikuler (P5)';
      modal.classList.add('active');
    };
    container.innerHTML = `
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div class="toolbar-controls">
            <div class="search-box">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" id="search-p5" placeholder="Cari tema / judul proyek...">
            </div>
            <select id="filter-p5-phase">
              <option value="">Semua Fase & Sasaran</option>
              <option value="FASE_A">Fase A (Kelas 1-2)</option>
              <option value="FASE_B">Fase B (Kelas 3-4)</option>
              <option value="FASE_C">Fase C (Kelas 5-6)</option>
              <option value="ALL">Semua Fase (Seluruh Sekolah)</option>
            </select>
          </div>
          <div class="toolbar-actions">
            <a href="#/curriculum" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali ke Kurikulum</a>
            ${canManage ? `<button class="btn btn-primary" id="btn-add-p5"><i class="ph ph-plus"></i> Tambah Proyek P5</button>` : ''}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th class="table-col-sm">No</th>
                <th class="table-col-lg">Tema & Judul Proyek P5</th>
                <th>Target Sasaran</th>
                <th class="table-col-md">Dimensi Profil Pancasila</th>
                <th class="table-col-lg">Template Capaian Rapor</th>
                <th class="table-col-md">Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-p5"></tbody>
          </table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-p5">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-p5-title">Tambah Proyek Kokurikuler (P5)</h3>
            <button class="btn-icon" data-close-modal="modal-p5"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-p5">
            <div class="modal-body">
              <input type="hidden" id="p5-id">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Tahun Ajaran</label>
                  <input type="text" id="p5-year" required>
                </div>
                <div class="form-group flex-1">
                  <label>Semester</label>
                  <select id="p5-sem" required>
                    <option value="1">Semester 1 (Ganjil)</option>
                    <option value="2">Semester 2 (Genap)</option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>Target Sasaran Fase / Rombel</label>
                  <select id="p5-target" required>
                    <option value="FASE_A">Fase A (Kelas 1 - 2)</option>
                    <option value="FASE_B">Fase B (Kelas 3 - 4)</option>
                    <option value="FASE_C">Fase C (Kelas 5 - 6)</option>
                    <option value="ALL">Semua Fase (Seluruh Sekolah)</option>
                    ${classArr.map(c => `<option value="${c.id}">Rombel Spesifik: ${AppConfig.escapeHtml(c.name)}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Tema Proyek (Kemendikbudristek)</label>
                <select id="p5-theme" required>
                  ${P5_THEMES.map(t => `<option value="${t.name}">${t.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Judul Proyek P5</label>
                <input type="text" id="p5-title" placeholder="Contoh: Pengelolaan Sampah Plastik Menjadi Karya Seni Berguna" required>
              </div>
              <div class="form-group">
                <label>Deskripsi & Tujuan Proyek (Opsional)</label>
                <textarea id="p5-desc" rows="2" placeholder="Jelaskan secara ringkas maksud, alur kegiatan, dan tujuan pembelajaran proyek ini..."></textarea>
              </div>
              <div class="form-group">
                <label>Dimensi Profil Pelajar Pancasila yang Disasar</label>
                <div class="grid-dimensions">
                  ${P5_DIMENSIONS.map((dim) => `
                    <label class="checkbox-card">
                      <input type="checkbox" class="chk-dimension" value="${AppConfig.escapeHtml(dim)}">
                      <span>${AppConfig.escapeHtml(dim)}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
              <div class="form-group">
                <div class="flex-between align-center mb-1">
                  <label>Template Capaian Naratif Rapor</label>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-preset-narrative"><i class="ph ph-magic-wand"></i> Buat Contoh Narasi</button>
                </div>
                <textarea id="p5-narrative" rows="3" placeholder="Contoh: Ananda aktif berpartisipasi dalam proyek [Judul Proyek], menunjukkan sikap gotong royong dan bernalar kritis yang sangat baik saat merancang solusi bersama tim." required></textarea>
                <small class="text-muted">Template ini akan muncul sebagai opsi satu klik bagi Wali Kelas saat mengisi lembar rapor bagian Kokurikuler.</small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-p5">Batal</button>
              <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Proyek</button>
            </div>
          </form>
        </div>
      </div>
    `;
    renderTable();
    document.getElementById('search-p5')?.addEventListener('input', renderTable);
    document.getElementById('filter-p5-phase')?.addEventListener('change', renderTable);
    const btnAdd = document.getElementById('btn-add-p5');
    if (btnAdd) btnAdd.onclick = () => openModal(null);
    const btnPreset = document.getElementById('btn-preset-narrative');
    if (btnPreset) {
      btnPreset.onclick = () => {
        const titleVal = document.getElementById('p5-title').value.trim() || 'Proyek Penguatan Profil Pelajar Pancasila';
        const checkedDims = Array.from(document.querySelectorAll('.chk-dimension:checked')).map(c => c.value);
        let dimText = 'gotong royong, kemandirian, dan bernalar kritis';
        if (checkedDims.length > 0) {
          dimText = checkedDims.map(d => d.toLowerCase().replace('beriman, bertakwa kepada tuhan yme, dan berakhlak mulia', 'akhlak mulia')).join(', ');
        }
        document.getElementById('p5-narrative').value = `Ananda sangat aktif dan antusias dalam menyelesaikan proyek "${titleVal}". Menunjukkan perkembangan yang sangat baik dalam dimensi ${dimText} selama proses perencanaan hingga perayaan hasil belajar.`;
      };
    }
    const formP5 = document.getElementById('form-p5');
    if (formP5) {
      formP5.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = formP5.querySelector('button[type="submit"]');
        const originalHtml = submitBtn ? submitBtn.innerHTML : 'Simpan Proyek';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
        }
        try {
          const id = document.getElementById('p5-id').value || null;
          const selectedDims = Array.from(document.querySelectorAll('.chk-dimension:checked')).map(c => c.value);
          const payload = {
            academicYear: document.getElementById('p5-year').value.trim(),
            semester: document.getElementById('p5-sem').value,
            target: document.getElementById('p5-target').value,
            theme: document.getElementById('p5-theme').value,
            title: document.getElementById('p5-title').value.trim(),
            description: document.getElementById('p5-desc').value.trim(),
            dimensions: selectedDims,
            narrativeTemplate: document.getElementById('p5-narrative').value.trim(),
            updatedBy: Auth.currentUser?.uid || 'curriculum'
          };
          await DB.saveCocurricularProject(id, payload);
          App.closeModal('modal-p5');
          CurriculumPages.renderCocurricular(container);
        } catch (err) {
          console.error('Gagal menyimpan proyek P5:', err);
          alert('Gagal menyimpan proyek P5: ' + (err.message || 'Terjadi kesalahan sistem.'));
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHtml;
          }
        }
      };
    }
  }
};