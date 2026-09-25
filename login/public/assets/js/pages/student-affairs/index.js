const StudentAffairsPages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    const readOnly = role !== AppConfig.ROLES.ADMIN && role !== AppConfig.ROLES.GURU;
    Router.setTitle('Kesiswaan', 'Ringkasan siswa, absensi, dan prestasi.');

    const [students, classes] = await Promise.all([
      DB.getAllStudents(),
      DB.getClasses()
    ]);

    const studentList = DB.toArray(students);
    const classList = DB.toArray(classes);
    const activeStudents = studentList.length;

    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-student"></i></div>
          <div><p class="stat-value">${activeStudents}</p><p class="stat-label text-muted">Siswa</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-school"></i></div>
          <div><p class="stat-value">${classList.length}</p><p class="stat-label text-muted">Rombel</p></div>
        </div>
        <!-- removed duplicate stat card -->
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-bell"></i></div>
          <div><p class="stat-value">${readOnly ? 'Read' : 'Edit'}</p><p class="stat-label text-muted">Mode</p></div>
        </div>
      </section>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tugas kesiswaan</h3>
          <ul class="list-plain">
            <li>Role aktif: <strong>${role}</strong></li>
            <li>Data siswa dan rombel hanya menjadi referensi; dashboard ini belum mengubah master data.</li>
            <li>Absensi, nilai, dan observasi dikerjakan melalui fitur guru sesuai kelas yang ditugaskan.</li>
          </ul>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Rombel aktif</h3>
          <ul class="list-plain">
            ${classList.slice(0, 6).map((item) => `<li>${item.name || '-'}</li>`).join('') || '<li class="text-muted">Belum ada kelas.</li>'}
          </ul>
        </div>
      </div>
    `;
  }
};
