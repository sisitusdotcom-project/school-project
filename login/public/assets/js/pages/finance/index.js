const FinancePages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    Router.setTitle('Keuangan', 'Ringkasan kas, tagihan, dan laporan sekolah.');

    const [summary, billsData, studentIndex] = await Promise.all([
      DB.getFinanceSummary(),
      DB.getStudentBills(),
      DB.getStudentReferenceIndex()
    ]);

    const bills = DB.toArray(billsData);
    const pendingBills = bills.filter((bill) => bill.status !== 'paid').length;

    const rows = bills.slice(0, 4).map((bill) => `
      <tr>
        <td>${studentIndex[bill.studentId]?.name || 'Siswa tidak ditemukan'}</td>
        <td>${bill.dueDate || '-'}</td>
        <td>${Number(bill.amount || 0).toLocaleString('id-ID')}</td>
        <td><span class="badge ${bill.status === 'paid' ? 'badge-success' : 'badge-warning'}">${bill.status === 'paid' ? 'Lunas' : 'Belum'}</span></td>
      </tr>
    `).join('') || '<tr><td colspan="4" class="text-muted">Belum ada tagihan.</td></tr>';

    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-wallet"></i></div>
          <div><p class="stat-value">Rp ${Number(summary.income || 0).toLocaleString('id-ID')}</p><p class="stat-label text-muted">Pemasukan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-credit-card"></i></div>
          <div><p class="stat-value">Rp ${Number(summary.expense || 0).toLocaleString('id-ID')}</p><p class="stat-label text-muted">Pengeluaran</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-bank"></i></div>
          <div><p class="stat-value">Rp ${Number(summary.net || 0).toLocaleString('id-ID')}</p><p class="stat-label text-muted">Saldo</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-file-text"></i></div>
          <div><p class="stat-value">${pendingBills}</p><p class="stat-label text-muted">Tagihan tertunda</p></div>
        </div>
      </section>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Status tugas keuangan</h3>
          <ul class="list-plain">
            <li>Role aktif: <strong>${role}</strong></li>
            <li>Mode: <strong>Lihat ringkasan</strong></li>
            <li>Nama siswa selalu dibaca dari data siswa utama melalui <code>studentId</code>.</li>
            <li>Dashboard ini belum menyediakan input transaksi, tagihan, atau approval.</li>
          </ul>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tagihan terkini</h3>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>Siswa</th><th>Jatuh tempo</th><th>Nominal</th><th>Status</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};
