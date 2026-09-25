const FinancePages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    const isReadOnly = role !== AppConfig.ROLES.ADMIN;
    Router.setTitle('Keuangan', 'Ringkasan kas, tagihan, dan laporan sekolah.');

    const [summary, billsData, ledgerData, studentIndex] = await Promise.all([
      DB.getFinanceSummary(),
      DB.getStudentBills(),
      DB.getFinanceLedger(),
      DB.getStudentReferenceIndex()
    ]);

    const bills = DB.toArray(billsData);
    const ledger = DB.toArray(ledgerData).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const pendingBills = bills.filter((bill) => bill.status !== 'paid').length;

    const billRows = bills.map((bill) => `
      <tr>
        <td>${AppConfig.escapeHtml(studentIndex[bill.studentId]?.name || 'Siswa tidak ditemukan')}</td>
        <td>${AppConfig.escapeHtml(bill.dueDate || '-')}</td>
        <td>Rp ${Number(bill.amount || 0).toLocaleString('id-ID')}</td>
        <td>
          <span class="badge ${bill.status === 'paid' ? 'badge-success' : 'badge-warning'}">
            ${bill.status === 'paid' ? 'Lunas' : 'Belum'}
          </span>
        </td>
        ${!isReadOnly ? `
        <td class="action-cell">
          ${bill.status !== 'paid' ? `<button class="btn btn-sm btn-success" data-pay-bill="${bill.id}" title="Tandai Lunas"><i class="ph ph-check"></i></button>` : ''}
        </td>` : ''}
      </tr>
    `).join('') || `<tr><td colspan="${isReadOnly ? '4' : '5'}" class="text-muted">Belum ada tagihan.</td></tr>`;

    const ledgerRows = ledger.slice(0, 10).map((entry) => `
      <tr>
        <td>${AppConfig.escapeHtml(entry.date || '-')}</td>
        <td>
          <span class="badge ${entry.type === 'income' ? 'badge-success' : 'badge-danger'}">
            ${entry.type === 'income' ? 'Masuk' : 'Keluar'}
          </span>
        </td>
        <td>${AppConfig.escapeHtml(entry.description || '-')}</td>
        <td class="text-right">Rp ${Number(entry.amount || 0).toLocaleString('id-ID')}</td>
        ${!isReadOnly ? `
        <td class="action-cell text-right">
          <button class="btn btn-sm btn-danger" data-del-ledger="${entry.id}"><i class="ph ph-trash"></i></button>
        </td>` : ''}
      </tr>
    `).join('') || `<tr><td colspan="${isReadOnly ? '4' : '5'}" class="text-muted">Belum ada transaksi.</td></tr>`;

    const studentsOpts = Object.keys(studentIndex).map(id => `<option value="${id}">${AppConfig.escapeHtml(studentIndex[id].name)}</option>`).join('');

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

      <div class="card-grid section-spacer">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Buku Kas (10 Transaksi Terakhir)</h3>
            ${!isReadOnly ? `<button class="btn btn-primary btn-sm" id="btn-add-ledger"><i class="ph ph-plus"></i> Transaksi Baru</button>` : ''}
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>Tanggal</th><th>Tipe</th><th>Keterangan</th><th class="text-right">Nominal</th>${!isReadOnly ? '<th class="text-right">Aksi</th>' : ''}</tr>
              </thead>
              <tbody>${ledgerRows}</tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Daftar Tagihan Siswa</h3>
            ${!isReadOnly ? `<button class="btn btn-primary btn-sm" id="btn-add-bill"><i class="ph ph-plus"></i> Buat Tagihan</button>` : ''}
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>Siswa</th><th>Jatuh tempo</th><th>Nominal</th><th>Status</th>${!isReadOnly ? '<th>Aksi</th>' : ''}</tr>
              </thead>
              <tbody>${billRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      
      <div class="modal-overlay" id="modal-ledger">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Transaksi Kas Baru</h3>
            <button class="btn-icon" onclick="App.closeModal('modal-ledger')"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-ledger">
            <div class="modal-body">
              <div class="form-group">
                <label>Tipe Transaksi</label>
                <select id="ledger-type" required>
                  <option value="income">Pemasukan (Uang Masuk)</option>
                  <option value="expense">Pengeluaran (Uang Keluar)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nominal (Rp)</label>
                <input type="number" id="ledger-amount" required min="1">
              </div>
              <div class="form-group">
                <label>Keterangan</label>
                <input type="text" id="ledger-desc" required placeholder="Contoh: Beli spidol">
              </div>
              <div class="form-group">
                <label>Tanggal</label>
                <input type="date" id="ledger-date" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-ledger')">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan Transaksi</button>
            </div>
          </form>
        </div>
      </div>

      
      <div class="modal-overlay" id="modal-bill">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Buat Tagihan Baru</h3>
            <button class="btn-icon" onclick="App.closeModal('modal-bill')"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-bill">
            <div class="modal-body">
              <div class="form-group">
                <label>Siswa</label>
                <select id="bill-student" required>
                  <option value="">-- Pilih Siswa --</option>
                  ${studentsOpts}
                </select>
              </div>
              <div class="form-group">
                <label>Nominal Tagihan (Rp)</label>
                <input type="number" id="bill-amount" required min="1">
              </div>
              <div class="form-group">
                <label>Jatuh Tempo</label>
                <input type="date" id="bill-date" required>
              </div>
              <div class="form-group">
                <label>Keterangan</label>
                <input type="text" id="bill-desc" placeholder="Contoh: SPP Bulan Juli">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-bill')">Batal</button>
              <button type="submit" class="btn btn-primary">Buat Tagihan</button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (!isReadOnly) {
      document.getElementById('btn-add-ledger').addEventListener('click', () => {
        document.getElementById('ledger-date').value = new Date().toISOString().slice(0, 10);
        App.openModal('modal-ledger');
      });

      document.getElementById('btn-add-bill').addEventListener('click', () => {
        document.getElementById('bill-date').value = new Date().toISOString().slice(0, 10);
        App.openModal('modal-bill');
      });

      document.getElementById('form-ledger').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = 'Menyimpan...';
        await DB.saveFinanceEntry({
          type: document.getElementById('ledger-type').value,
          amount: document.getElementById('ledger-amount').value,
          description: document.getElementById('ledger-desc').value,
          date: document.getElementById('ledger-date').value
        });
        App.closeModal('modal-ledger');
        FinancePages.renderDashboard(container);
      });

      document.getElementById('form-bill').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = 'Menyimpan...';
        await DB.saveStudentBill({
          studentId: document.getElementById('bill-student').value,
          amount: document.getElementById('bill-amount').value,
          dueDate: document.getElementById('bill-date').value,
          note: document.getElementById('bill-desc').value,
          status: 'pending'
        });
        App.closeModal('modal-bill');
        FinancePages.renderDashboard(container);
      });

      container.querySelectorAll('[data-pay-bill]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          if (!confirm('Tandai tagihan ini lunas?')) return;
          const id = e.currentTarget.dataset.payBill;
          await DB.markStudentBillPaid(id);
          FinancePages.renderDashboard(container);
        });
      });

      container.querySelectorAll('[data-del-ledger]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
          const id = e.currentTarget.dataset.delLedger;
          await DB.deleteFinanceEntry(id);
          FinancePages.renderDashboard(container);
        });
      });
    }
  }
};
