const FacilitiesPages = {
  async renderDashboard(container) {
    Router.setTitle('Sarana & Prasarana', 'Pusat pengelolaan inventaris aset, pemeliharaan fasilitas, dan perencanaan kebutuhan madrasah.');
    const [assetsData, roomsData, maintenanceData] = await Promise.all([
      DB.getFacilityAssets(),
      DB.getFacilityRooms(),
      DB.getFacilityMaintenance()
    ]);
    const assets = DB.toArray(assetsData);
    const rooms = DB.toArray(roomsData);
    const maintenance = DB.toArray(maintenanceData);
    const baikCount = assets.filter((a) => !a.condition || a.condition === 'Baik' || a.status === 'Baik').length;
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-building-office"></i></div>
          <div><p class="stat-value">${rooms.length}</p><p class="stat-label text-muted">Ruangan & Gedung</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-archive-box"></i></div>
          <div><p class="stat-value">${assets.length}</p><p class="stat-label text-muted">Aset Inventaris</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-wrench"></i></div>
          <div><p class="stat-value">${maintenance.length}</p><p class="stat-label text-muted">Tiket Pemeliharaan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-shield-check"></i></div>
          <div><p class="stat-value">${baikCount}</p><p class="stat-label text-muted">Aset Siap Pakai</p></div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Operasional Sarana & Prasarana</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            <a href="#/facilities/inventory" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-archive-box"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Buku Inventaris (Aset)</div>
                <div class="quick-nav-desc">Pencatatan sarana madrasah</div>
              </div>
            </a>
            <a href="#/facilities/planning" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-clipboard-text"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Analisis Kebutuhan</div>
                <div class="quick-nav-desc">Perencanaan sarana tahunan</div>
              </div>
            </a>
            <a href="#/facilities/rkas" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-chart-pie-slice"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Rencana Pengadaan (RKAS)</div>
                <div class="quick-nav-desc">Alokasi anggaran belanja aset</div>
              </div>
            </a>
            <a href="#/facilities/maintenance" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-wrench"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pemeliharaan & Sanitasi</div>
                <div class="quick-nav-desc">Perawatan gedung & toilet</div>
              </div>
            </a>
            <a href="#/facilities/electronics" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-desktop"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pemeliharaan Elektronik</div>
                <div class="quick-nav-desc">AC, proyektor, audio & PC lab</div>
              </div>
            </a>
            <a href="#/facilities/safety" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-shield-check"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pengecekan Keamanan K3</div>
                <div class="quick-nav-desc">APAR, instalasi & CCTV</div>
              </div>
            </a>
            <a href="#/facilities/loans" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-calendar-check"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Peminjaman Fasilitas</div>
                <div class="quick-nav-desc">Peminjaman aula & perlengkapan</div>
              </div>
            </a>
            <a href="#/facilities/disposal" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-trash"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Penghapusan Aset</div>
                <div class="quick-nav-desc">Afkir barang rusak berat</div>
              </div>
            </a>
          </div>
        </div>
      </section>
    `;
  }
};
