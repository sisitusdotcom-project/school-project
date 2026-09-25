const PersonnelPages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    Router.setTitle('Humas & Personalia', 'Ringkasan pegawai dan struktur sekolah.');

    const isAdmin = role === AppConfig.ROLES.ADMIN;
    const [directoryData, usersData] = await Promise.all([
      DB.getPersonnelDirectory(),
      isAdmin ? DB.getAllUsers() : Promise.resolve({})
    ]);
    const personnelDirectory = DB.toArray(directoryData);
    const users = DB.toArray(usersData);
    const guruCount = personnelDirectory.filter((employee) => employee.position?.toLowerCase().includes('guru')).length;
    const employeeCount = personnelDirectory.length;
    const kepsekCount = personnelDirectory.filter((employee) => employee.position?.toLowerCase().includes('kepala sekolah')).length;

    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-chalkboard-teacher"></i></div>
          <div><p class="stat-value">${guruCount}</p><p class="stat-label text-muted">Guru</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-briefcase"></i></div>
          <div><p class="stat-value">${employeeCount}</p><p class="stat-label text-muted">Pegawai tercatat</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-crown"></i></div>
          <div><p class="stat-value">${kepsekCount}</p><p class="stat-label text-muted">Kepsek</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-eye"></i></div>
          <div><p class="stat-value">${isAdmin ? users.length : '—'}</p><p class="stat-label text-muted">${isAdmin ? 'Akun sistem' : 'Akses akun disembunyikan'}</p></div>
        </div>
      </section>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tugas personalia</h3>
          <ul class="list-plain">
            <li>Role aktif: <strong>${role}</strong></li>
            <li>Direktori pegawai adalah sumber rekap personel; akun sistem hanya untuk autentikasi dan akses.</li>
            <li>Kepala sekolah memantau efektivitas, bukan mengubah profil pegawai dari dashboard ini.</li>
            <li>Dashboard ini belum membuka CRUD pegawai, cuti, dokumen, atau pengumuman.</li>
          </ul>
        </div>
      </div>
    `;
  }
};
