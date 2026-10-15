const KomitePages = {
  async renderDashboard(container) {
    Router.setTitle('Dashboard Komite & Paguyuban', 'Pusat koordinasi agenda kegiatan dan transparansi kas paguyuban madrasah.');
    const [activitiesData, financeData] = await Promise.all([
      ModuleKit.fetchObject('komite/activities').catch(() => ({})),
      ModuleKit.fetchObject('komite/finance-paguyuban').catch(() => ({}))
    ]);
    const actList = Object.values(activitiesData || {});
    const finList = Object.values(financeData || {});
    const totalActivities = actList.length;
    let totalIncome = 0;
    let totalExpense = 0;
    finList.forEach((item) => {
      totalIncome += Number(item.income || 0);
      totalExpense += Number(item.expense || 0);
    });
    const saldo = totalIncome - totalExpense;
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-calendar-check"></i></div>
          <div><p class="stat-value">${totalActivities}</p><p class="stat-label text-muted">Agenda Kegiatan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-trend-up"></i></div>
          <div><p class="stat-value">Rp ${totalIncome.toLocaleString('id-ID')}</p><p class="stat-label text-muted">Total Pemasukan Kas</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-trend-down"></i></div>
          <div><p class="stat-value">Rp ${totalExpense.toLocaleString('id-ID')}</p><p class="stat-label text-muted">Total Pengeluaran Kas</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-wallet"></i></div>
          <div><p class="stat-value">Rp ${saldo.toLocaleString('id-ID')}</p><p class="stat-label text-muted">Saldo Kas Paguyuban</p></div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Utama Komite & Paguyuban</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            <a href="#/komite/activities" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-users-three"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Laporan Kegiatan Paguyuban</div>
                <div class="quick-nav-desc">Pencatatan agenda, notulensi, dan dokumentasi kegiatan</div>
              </div>
            </a>
            <a href="#/komite/finance-paguyuban" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-wallet"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Keuangan Paguyuban</div>
                <div class="quick-nav-desc">Pencatatan kas pemasukan, pengeluaran, dan bukti transaksi</div>
              </div>
            </a>
          </div>
        </div>
      </section>
      <section class="card">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-handshake"></i> Sinergi Koordinasi Madrasah</h3>
        </div>
        <div class="card-body">
          <p class="text-muted komite-lead-text">Seluruh data kegiatan dan kas paguyuban tersinkronisasi langsung secara terpusat untuk transparansi madrasah:</p>
          <div class="quick-nav-grid">
            <div class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-briefcase"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Humas & Personalia</div>
                <div class="quick-nav-desc">Kemitraan, komunikasi publik, dan sinergi program</div>
              </div>
            </div>
            <div class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-coins"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Bagian Keuangan</div>
                <div class="quick-nav-desc">Sinkronisasi pembukuan dan akuntabilitas kas</div>
              </div>
            </div>
            <div class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-user-circle-gear"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Kepala Sekolah</div>
                <div class="quick-nav-desc">Supervisi, arahan kebijakan, dan evaluasi program</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
};
