const CurriculumPages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    Router.setTitle('Kurikulum', 'Ringkasan pembelajaran dan struktur akademik.');

    const [settings, subjects, classes] = await Promise.all([
      DB.getSettings(),
      DB.getSubjects(),
      DB.getClasses()
    ]);

    const subjectList = DB.toArray(subjects).slice(0, 5);
    const classList = DB.toArray(classes);

    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-books"></i></div>
          <div><p class="stat-value">${settings.currentAcademicYear || '-'}</p><p class="stat-label text-muted">Tahun ajaran</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-calendar"></i></div>
          <div><p class="stat-value">Semester ${settings.currentSemester || '-'}</p><p class="stat-label text-muted">Semester</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-list-checks"></i></div>
          <div><p class="stat-value">${subjectList.length}</p><p class="stat-label text-muted">Mapel aktif</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-school"></i></div>
          <div><p class="stat-value">${classList.length}</p><p class="stat-label text-muted">Rombel</p></div>
        </div>
      </section>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tugas kurikulum</h3>
          <ul class="list-plain">
            <li>Role aktif: <strong>${role}</strong></li>
            <li>Mode: <strong>Ringkasan kurikulum</strong></li>
            <li>Admin mengelola master mapel; guru mengisi pembelajaran melalui fitur kelas dan e-rapor yang telah ada.</li>
            <li>Jadwal, perangkat ajar, pemantauan KBM, penilaian, dan supervisi dikelola melalui menu Kurikulum di samping.</li>
          </ul>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Mapel utama</h3>
          <ul class="list-plain">
            ${subjectList.length ? subjectList.map((subject) => `<li>${subject.name || '-'}</li>`).join('') : '<li class="text-muted">Belum ada mapel.</li>'}
          </ul>
        </div>
      </div>
      
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title">Pengaturan Umum (Tahun Ajaran)</h3>
        </div>
        <form id="form-academic-settings" class="inline-form">
          <div class="form-group compact-field">
            <label>Tahun ajaran</label>
            <input id="set-year" value="${settings.currentAcademicYear || ''}" placeholder="Contoh: 2026/2027">
          </div>
          <div class="form-group compact-field">
            <label>Semester</label>
            <select id="set-sem">
              <option value="1" ${settings.currentSemester === '1' ? 'selected' : ''}>Semester 1</option>
              <option value="2" ${settings.currentSemester === '2' ? 'selected' : ''}>Semester 2</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Pengaturan</button>
        </form>
      </section>
    `;

    const formAcademic = document.getElementById('form-academic-settings');
    if (formAcademic) {
      formAcademic.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Perintah konfirmasi keras, karena ini akan mengubah master data untuk seluruh sistem
        const isConfirmed = confirm('PERINGATAN: Mengubah Tahun Ajaran atau Semester akan berdampak ke seluruh sistem (Presensi, Nilai, dll). Yakin ingin menyimpan perubahan ini?');
        if (!isConfirmed) return;

        const btn = formAcademic.querySelector('button');
        const originalHtml = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';

        try {
          await DB.updateSettings({
            currentAcademicYear: document.getElementById('set-year').value.trim(),
            currentSemester: document.getElementById('set-sem').value
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
  }
};
