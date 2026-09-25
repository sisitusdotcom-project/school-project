const FacilitiesPages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    const readOnly = role !== AppConfig.ROLES.ADMIN && role !== AppConfig.ROLES.KEPSEK;
    Router.setTitle('Sarana & Prasarana', 'Ringkasan aset, kebutuhan, dan maintenance sekolah.');

    const [assetsData, roomsData, maintenanceData] = await Promise.all([
      DB.getFacilityAssets(),
      DB.getFacilityRooms(),
      DB.getFacilityMaintenance()
    ]);
    const assets = DB.toArray(assetsData);
    const rooms = DB.toArray(roomsData);
    const maintenance = DB.toArray(maintenanceData);

    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-building-office"></i></div>
          <div><p class="stat-value">${rooms.length}</p><p class="stat-label text-muted">Ruangan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-check-circle"></i></div>
          <div><p class="stat-value">${assets.length}</p><p class="stat-label text-muted">Aset tercatat</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-wrench"></i></div>
          <div><p class="stat-value">${maintenance.length}</p><p class="stat-label text-muted">Pemeliharaan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-shield-check"></i></div>
          <div><p class="stat-value">${role}</p><p class="stat-label text-muted">Role</p></div>
        </div>
      </section>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tugas sarpras</h3>
          <ul class="list-plain">
            <li>Data ruangan dan aset tidak disamakan dengan rombel akademik.</li>
            <li>Dashboard ini hanya menyajikan rekap; input aset dan pemeliharaan belum dibuka.</li>
            <li>Kepala sekolah memantau kesiapan fasilitas untuk proses pembelajaran.</li>
          </ul>
        </div>
      </div>
    `;
  }
};
