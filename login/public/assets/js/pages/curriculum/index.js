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
            <li>Pengaturan jadwal, kalender, dan program pembelajaran belum tersedia di dashboard ini.</li>
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
    `;
  }
};
