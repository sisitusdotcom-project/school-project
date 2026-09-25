window.AdminAssignmentsModule = {
  async render(container) {
    Router.setTitle('Penugasan', 'Admin menetapkan tugas dan wewenang per role agar tidak ada tumpang tindih kerja.');

    const userList = DB.toArray(await DB.getAllUsers());
    const classList = DB.toArray(await DB.getClasses());
    const assignmentPillars = [
      { title: 'Keuangan', owner: 'Unit keuangan / bendahara', detail: 'Bertanggung jawab pada kas, tagihan, pembayaran, anggaran, dan laporan keuangan.' },
      { title: 'Kurikulum', owner: 'Guru, waka kurikulum, dan tim pembelajaran', detail: 'Admin hanya menyiapkan struktur data awal, kurikulum tidak dibebankan ke dashboard admin.' },
      { title: 'Kesiswaan', owner: 'Tim kesiswaan', detail: 'Mengelola siswa, absensi, prestasi, pelanggaran, dan perkembangan siswa.' },
      { title: 'Sarpras', owner: 'Tim sarpras', detail: 'Mengelola aset, ruangan, maintenance, dan kebutuhan fasilitas sekolah.' },
      { title: 'Personalia', owner: 'Humas & personalia', detail: 'Mengelola data pegawai, organisasi, dan struktur SDM sekolah.' }
    ];

    const roleSummary = [
      { role: 'Admin', count: userList.filter((user) => user.role === AppConfig.ROLES.ADMIN).length },
      { role: 'Guru', count: userList.filter((user) => user.role === AppConfig.ROLES.GURU).length },
      { role: 'Kepsek', count: userList.filter((user) => user.role === AppConfig.ROLES.KEPSEK).length },
      { role: 'Orang Tua', count: userList.filter((user) => user.role === AppConfig.ROLES.ORTU).length }
    ];

    const roleCards = roleSummary.map((item) => `
      <div class="card stat-card">
        <div class="stat-icon stat-icon--primary"><i class="ph ph-users"></i></div>
        <div><p class="stat-value">${item.count}</p><p class="stat-label text-muted">${item.role}</p></div>
      </div>
    `).join('');

    const assignmentRows = assignmentPillars.map((item) => `
      <tr>
        <td><strong>${AppConfig.escapeHtml(item.title)}</strong></td>
        <td>${item.owner}</td>
        <td>${AppConfig.escapeHtml(item.detail)}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <section class="card-grid section-spacer">
        ${roleCards}
      </section>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tujuan tab penugasan</h3>
          <ul class="list-plain">
            <li>Menetapkan unit mana yang bertanggung jawab atas fungsi tertentu.</li>
            <li>Memastikan tidak ada overlap tugas antara admin, guru, kepsek, dan unit operasional.</li>
            <li>Menjadi pusat kontrol agar setiap akun punya peran yang jelas dan konsisten.</li>
          </ul>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Matriks penugasan unit</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Pemilik tugas</th>
                  <th>Fokus kerja</th>
                </tr>
              </thead>
              <tbody>${assignmentRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};
