const FinancePages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    const isReadOnly = role !== AppConfig.ROLES.ADMIN;
    Router.setTitle('Dashboard Keuangan', 'Ringkasan kas, 4 laporan pokok, tagihan SPP, dan realisasi RKAS.');
    const [settings, summary, billsData, ledgerData, studentIndex, rkasData, assetsData] = await Promise.all([
      DB.getSettings(),
      DB.getFinanceSummary(),
      DB.getStudentBills(),
      DB.getFinanceLedger(),
      DB.getStudentReferenceIndex(),
      DB.getRKAS(),
      DB.getFacilityAssets()
    ]);
    const bills = DB.toArray(billsData);
    const ledger = DB.toArray(ledgerData).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.id).localeCompare(String(a.id)));
    const rkasList = DB.toArray(rkasData);
    const assetList = DB.toArray(assetsData);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = settings?.currentAcademicYear || settings?.academicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
    const kepsekName = settings?.kepsekName || 'Dhani Harsyahyadi, S.H.I.';
    const kepsekNBM = settings?.kepsekNBM || settings?.kepsekNuptk || '8962767668130162';
    const wakaKeuanganName = settings?.wakaKeuanganName || 'Ainaini Ratna Noeri, M.Pd.';
    let activeTab = 'summary';
    let selectedMonth = currentMonth;
    const money = (val) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');
    const esc = (txt) => AppConfig.escapeHtml(txt || '');
    const resolveAccounts = (entry) => {
      const isExp = entry.type === 'expense';
      const method = entry.method || 'Tunai';
      let cashAcc = { code: '1-1001', name: 'Kas Tunai (Brankas)' };
      if (method.includes('BOS')) cashAcc = { code: '1-1003', name: 'Bank Jatim (Kas BOS)' };
      else if (method.includes('Bank') || method.includes('Transfer')) cashAcc = { code: '1-1002', name: 'Bank Jatim (Operasional)' };
      let contraAcc = { code: isExp ? '5-9999' : '4-9999', name: isExp ? 'Beban Operasional Lainnya' : 'Pendapatan Lainnya' };
      const cat = (entry.category || '').toLowerCase();
      if (!isExp) {
        if (cat.includes('spp')) contraAcc = { code: '4-1010', name: 'Pendapatan SPP Siswa' };
        else if (cat.includes('bos')) contraAcc = { code: '4-1020', name: 'Pendapatan Dana BOS' };
        else if (cat.includes('donasi') || cat.includes('infaq')) contraAcc = { code: '4-1030', name: 'Pendapatan Infaq & Donasi' };
        else if (cat.includes('formulir') || cat.includes('spmb') || cat.includes('ppdb')) contraAcc = { code: '4-1040', name: 'Pendapatan Formulir SPMB' };
        else contraAcc = { code: '4-1090', name: `Pendapatan ${entry.category || 'Lainnya'}` };
      } else {
        if (cat.includes('honor') || cat.includes('gaji')) contraAcc = { code: '5-1010', name: 'Beban Gaji & Honor GTK' };
        else if (cat.includes('atk')) contraAcc = { code: '5-2010', name: 'Beban ATK & Pembelajaran' };
        else if (cat.includes('listrik') || cat.includes('air') || cat.includes('internet')) contraAcc = { code: '5-2020', name: 'Beban Daya & Jasa' };
        else if (cat.includes('sarpras') || cat.includes('pemeliharaan')) contraAcc = { code: '5-2030', name: 'Beban Pemeliharaan Sarpras' };
        else if (cat.includes('kegiatan') || cat.includes('lomba')) contraAcc = { code: '5-2040', name: 'Beban Kegiatan Kesiswaan' };
        else if (cat.includes('santunan') || cat.includes('sosial') || cat.includes('kesejahteraan')) contraAcc = { code: '5-2050', name: 'Beban Kesejahteraan GTK' };
        else contraAcc = { code: '5-2090', name: `Beban ${entry.category || 'Operasional'}` };
      }
      return {
        debit: isExp ? contraAcc : cashAcc,
        credit: isExp ? cashAcc : contraAcc
      };
    };
    const computeLedgerMetrics = (filterMonth = null) => {
      let filtered = ledger;
      if (filterMonth) filtered = ledger.filter(item => String(item.date || '').startsWith(filterMonth));
      let inc = 0, exp = 0;
      let cashBal = 0, bankOpBal = 0, bankBosBal = 0;
      ledger.forEach(item => {
        const amt = Number(item.amount || 0);
        const signed = item.type === 'expense' ? -amt : amt;
        const m = item.method || 'Tunai';
        if (m.includes('BOS')) bankBosBal += signed;
        else if (m.includes('Bank') || m.includes('Transfer')) bankOpBal += signed;
        else cashBal += signed;
      });
      filtered.forEach(item => {
        const amt = Number(item.amount || 0);
        if (item.type === 'income') inc += amt;
        else exp += amt;
      });
      return {
        filtered,
        income: inc,
        expense: exp,
        surplus: inc - exp,
        totalCash: cashBal + bankOpBal + bankBosBal,
        cashTunai: cashBal,
        bankOperasional: bankOpBal,
        bankBOS: bankBosBal
      };
    };
    const computeReceivables = () => {
      let pendingTotal = 0;
      let pendingCount = 0;
      let paidTotal = 0;
      let scholarshipTotal = 0;
      bills.forEach(bill => {
        const amt = Number(bill.amount || 0);
        const s = String(bill.status || '').toLowerCase();
        if (s === 'paid' || s === 'lunas') {
          paidTotal += amt;
        } else if (s.includes('beasiswa')) {
          scholarshipTotal += amt;
        } else {
          pendingTotal += amt;
          pendingCount++;
        }
      });
      return { pendingTotal, pendingCount, paidTotal, scholarshipTotal };
    };
    const computeRKASMetrics = () => {
      let totalPagu = 0;
      let totalRealized = 0;
      const rows = rkasList.map(item => {
        const pagu = Number(item.pagu || 0);
        totalPagu += pagu;
        let actual = 0;
        ledger.forEach(entry => {
          if (entry.type === 'expense') {
            const matchesId = entry.rkasId && entry.rkasId === item.id;
            const matchesCategory = entry.category && item.category && entry.category.toLowerCase() === item.category.toLowerCase();
            const matchesDesc = item.component && entry.description && entry.description.toLowerCase().includes(item.component.toLowerCase());
            if (matchesId || matchesCategory || matchesDesc) {
              actual += Number(entry.amount || 0);
            }
          }
        });
        totalRealized += actual;
        const remaining = pagu - actual;
        const pct = pagu > 0 ? ((actual / pagu) * 100).toFixed(1) : '0';
        let statusBadge = 'badge-success';
        let statusText = 'Efisien';
        if (Number(pct) > 100) {
          statusBadge = 'badge-danger';
          statusText = 'Over-Budget';
        } else if (Number(pct) >= 95) {
          statusBadge = 'badge-warning';
          statusText = 'Mendekati Pagu';
        } else if (Number(pct) >= 75) {
          statusBadge = 'badge-primary';
          statusText = 'On Track';
        }
        return { ...item, pagu, actual, remaining, pct, statusBadge, statusText };
      });
      const remainingTotal = totalPagu - totalRealized;
      const overallPct = totalPagu > 0 ? ((totalRealized / totalPagu) * 100).toFixed(1) : '0';
      return { rows, totalPagu, totalRealized, remainingTotal, overallPct };
    };
    const computeAssetFixedTotal = () => {
      let total = 0;
      assetList.forEach(a => {
        if (a && a.condition !== 'Rusak Berat' && a.status !== 'Afkir') {
          const qty = Number(a.quantity || 1);
          const val = Number(a.price || a.unitPrice || a.estimatedValue || a.value || 0);
          total += qty * val;
        }
      });
      return total;
    };
    const formatMonthLabel = (mStr) => {
      if (!mStr) return '-';
      const parts = String(mStr).split('-');
      if (parts.length !== 2) return mStr;
      const year = parts[0];
      const mIdx = parseInt(parts[1], 10) - 1;
      const mNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${mNames[mIdx] || parts[1]} ${year}`;
    };
    const getReportTitle = () => {
      if (activeTab === 'journal') return 'JURNAL UMUM TRANSAKSI KEUANGAN';
      if (activeTab === 'cashflow') return 'LAPORAN ARUS KAS (ISAK 35)';
      if (activeTab === 'rkas') return 'LAPORAN REALISASI ANGGARAN (LRA / RKAS)';
      if (activeTab === 'balance') return 'LAPORAN POSISI KEUANGAN (NERACA)';
      return 'IKHTISAR LAPORAN KEUANGAN SEKOLAH';
    };
    const renderHeaderKop = () => `
      <div class="salary-slip-brand">
        <img src="assets/img/majlis-dikdaspnf.webp" alt="Logo Majelis Dikdasmen PNF" class="salary-slip-logo salary-slip-logo-dikdas" onerror="this.src=\'../../assets/img/link-terkait/majlis-dikdaspnf.webp\'">
        <div class="salary-slip-brand-text">
          <div class="salary-slip-org">MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL</div>
          <div class="salary-slip-pcm">PIMPINAN CABANG MUHAMMADIYAH SEDATI</div>
          <h2 class="salary-slip-title">SD MUHAMMADIYAH 1 SEDATI</h2>
          <p class="salary-slip-meta">Jl. H. Syukur No. 65, Sedati Gede, Kec. Sedati, Sidoarjo 61253 | Telp/WA: 0859-6439-9398</p>
          <p class="salary-slip-meta">Website: musada.sch.id | Email: sdmusada16@gmail.com</p>
        </div>
        <img src="assets/img/logo.webp" alt="Logo SD Muhammadiyah 1 Sedati" class="salary-slip-logo salary-slip-logo-school" onerror="this.src=\'../../assets/img/logo/logo.webp\'">
      </div>
      <div class="salary-slip-doc-header">
        <h3 class="salary-slip-doc-title">${getReportTitle()}</h3>
        <p class="salary-slip-doc-sub">Periode: <strong>${formatMonthLabel(selectedMonth)}</strong> | Tahun Ajaran: <strong>${esc(currentYear)}</strong></p>
      </div>
    `;
    const renderToolbar = () => `
      <div class="fin-dash-toolbar">
        <div class="fin-dash-filters">
          <div class="fin-filter-group">
            <label class="form-label fin-filter-label" for="fin-period-select">Periode:</label>
            <input type="month" id="fin-period-select" class="form-input fin-period-input" value="${selectedMonth}">
          </div>
          <span class="badge badge-primary fin-period-badge">T.A. ${esc(currentYear)}</span>
        </div>
        <div class="fin-dash-actions">
          ${!isReadOnly ? `
          <button type="button" class="btn btn-primary btn-sm" id="btn-open-add-ledger"><i class="ph ph-plus"></i> Transaksi Kas</button>
          <button type="button" class="btn btn-outline btn-sm" id="btn-open-add-bill"><i class="ph ph-receipt"></i> Tagihan SPP</button>
          ` : ''}
          <button type="button" class="btn btn-outline btn-sm" id="btn-export-excel"><i class="ph ph-file-xls"></i> Ekspor Excel</button>
          <button type="button" class="btn btn-outline btn-sm" id="btn-print-report"><i class="ph ph-printer"></i> Cetak PDF</button>
        </div>
      </div>
      <div class="fin-tabs">
        <button type="button" class="fin-tab-btn ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary"><i class="ph ph-squares-four"></i> Ringkasan Eksekutif</button>
        <button type="button" class="fin-tab-btn ${activeTab === 'journal' ? 'active' : ''}" data-tab="journal"><i class="ph ph-book-open"></i> 1. Jurnal Umum</button>
        <button type="button" class="fin-tab-btn ${activeTab === 'cashflow' ? 'active' : ''}" data-tab="cashflow"><i class="ph ph-arrows-left-right"></i> 2. Arus Kas (ISAK 35)</button>
        <button type="button" class="fin-tab-btn ${activeTab === 'rkas' ? 'active' : ''}" data-tab="rkas"><i class="ph ph-chart-bar"></i> 3. Realisasi Anggaran (LRA)</button>
        <button type="button" class="fin-tab-btn ${activeTab === 'balance' ? 'active' : ''}" data-tab="balance"><i class="ph ph-scales"></i> 4. Posisi Keuangan (Neraca)</button>
      </div>
      <div class="fin-print-header">
        ${renderHeaderKop()}
      </div>
    `;
    const renderSummaryView = () => {
      const lm = computeLedgerMetrics(selectedMonth);
      const rec = computeReceivables();
      const rkas = computeRKASMetrics();
      const recentBills = bills.slice(0, 8);
      const recentLedger = lm.filtered.slice(0, 8);
      const billRows = recentBills.map(bill => {
        const s = String(bill.status || '').toLowerCase();
        const isPaid = s === 'paid' || s === 'lunas';
        const isFree = s.includes('beasiswa');
        const badgeClass = isPaid ? 'badge-success' : (isFree ? 'badge-primary' : 'badge-danger');
        const statusLabel = isPaid ? 'Lunas' : (isFree ? 'Bebas Beasiswa' : 'Belum Lunas');
        const stuName = studentIndex[bill.studentId]?.name || 'Siswa tidak ditemukan';
        return `
          <tr>
            <td><strong>${esc(stuName)}</strong><br><small class="text-muted">${esc(bill.month || '')} ${esc(bill.academicYear || '')}</small></td>
            <td>${esc(bill.dueDate || '-')}</td>
            <td class="text-right">${money(bill.amount)}</td>
            <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
            ${!isReadOnly ? `
            <td class="action-cell text-center">
              ${!isPaid && !isFree ? `<button type="button" class="btn btn-sm btn-success" data-action="pay-bill" data-id="${bill.id}" title="Tandai Lunas"><i class="ph ph-check"></i> Lunas</button>` : '<i class="ph ph-check-circle text-success" title="Terbayar"></i>'}
            </td>` : ''}
          </tr>
        `;
      }).join('') || '<tr><td colspan="5" class="text-muted text-center">Belum ada catatan tagihan SPP.</td></tr>';
      const ledgerRows = recentLedger.map(entry => `
        <tr>
          <td>${esc(entry.date || '-')}</td>
          <td><span class="badge ${entry.type === 'income' ? 'badge-success' : 'badge-danger'}">${entry.type === 'income' ? 'Masuk' : 'Keluar'}</span></td>
          <td><strong>${esc(entry.category || 'Umum')}</strong> - ${esc(entry.description || '-')}</td>
          <td><small class="text-muted">${esc(entry.method || 'Tunai')}</small></td>
          <td class="text-right font-weight-bold">${money(entry.amount)}</td>
          ${!isReadOnly ? `
          <td class="action-cell text-center">
            <button type="button" class="btn btn-sm btn-danger" data-action="del-ledger" data-id="${entry.id}" title="Hapus Transaksi"><i class="ph ph-trash"></i></button>
          </td>` : ''}
        </tr>
      `).join('') || '<tr><td colspan="6" class="text-muted text-center">Belum ada transaksi kas pada bulan ini.</td></tr>';
      return `
        <div class="fin-summary-grid">
          <div class="card stat-card success">
            <div class="stat-icon stat-icon--success"><i class="ph ph-arrow-down-left"></i></div>
            <div>
              <p class="stat-value">${money(lm.income)}</p>
              <p class="stat-label text-muted">Pemasukan Bulan Ini</p>
            </div>
          </div>
          <div class="card stat-card danger">
            <div class="stat-icon stat-icon--danger"><i class="ph ph-arrow-up-right"></i></div>
            <div>
              <p class="stat-value">${money(lm.expense)}</p>
              <p class="stat-label text-muted">Pengeluaran Bulan Ini</p>
            </div>
          </div>
          <div class="card stat-card primary">
            <div class="stat-icon stat-icon--primary"><i class="ph ph-wallet"></i></div>
            <div>
              <p class="stat-value">${money(lm.totalCash)}</p>
              <p class="stat-label text-muted">Total Kas & Bank Riil</p>
            </div>
          </div>
          <div class="card stat-card warning">
            <div class="stat-icon stat-icon--warning"><i class="ph ph-receipt"></i></div>
            <div>
              <p class="stat-value">${money(rec.pendingTotal)}</p>
              <p class="stat-label text-muted">Piutang SPP (${rec.pendingCount} Siswa)</p>
            </div>
          </div>
          <div class="card stat-card info">
            <div class="stat-icon stat-icon--info"><i class="ph ph-chart-pie-slice"></i></div>
            <div>
              <p class="stat-value">${rkas.overallPct}%</p>
              <p class="stat-label text-muted">Serapan RKAS (${money(rkas.totalRealized)})</p>
            </div>
          </div>
        </div>
        <div class="fin-formula-box">
          <div class="fin-formula-text">
            <strong><i class="ph ph-scales"></i> Ikhtisar Saldo Likuiditas Sekolah:</strong>
            Kas Tunai: <strong>${money(lm.cashTunai)}</strong> | Bank Jatim Operasional: <strong>${money(lm.bankOperasional)}</strong> | Bank BOS: <strong>${money(lm.bankBOS)}</strong>
          </div>
          <div class="fin-badge-balanced"><i class="ph ph-check-circle"></i> Terintegrasi SSOT</div>
        </div>
        <div class="card section-spacer fin-screen-only" id="fin-shortcuts-section">
          <div class="card-header">
            <h3 class="card-title"><i class="ph ph-lightning"></i> Pintasan Operasional Keuangan & Penggajian</h3>
          </div>
          <div class="card-body">
            <div class="quick-nav-grid">
              <a href="#/finance/salaries" class="quick-nav-card">
                <div class="quick-nav-icon"><i class="ph ph-money"></i></div>
                <div class="quick-nav-info">
                  <div class="quick-nav-title">Penghitungan Gaji GTK</div>
                  <div class="quick-nav-desc">Slip gaji pokok & tunjangan</div>
                </div>
              </a>
              <a href="#/admin/attendance" class="quick-nav-card">
                <div class="quick-nav-icon"><i class="ph ph-clock"></i></div>
                <div class="quick-nav-info">
                  <div class="quick-nav-title">Presensi Penggajian (29-28)</div>
                  <div class="quick-nav-desc">Kalkulasi disiplin kehadiran</div>
                </div>
              </a>
              <a href="#/finance/welfare" class="quick-nav-card">
                <div class="quick-nav-icon"><i class="ph ph-heart"></i></div>
                <div class="quick-nav-info">
                  <div class="quick-nav-title">Kesejahteraan Pegawai</div>
                  <div class="quick-nav-desc">Santunan sakit, duka & persalinan</div>
                </div>
              </a>
              <a href="#/finance/proposals" class="quick-nav-card">
                <div class="quick-nav-icon"><i class="ph ph-file-text"></i></div>
                <div class="quick-nav-info">
                  <div class="quick-nav-title">Persetujuan Proposal</div>
                  <div class="quick-nav-desc">Evaluasi pengajuan dana unit</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div class="card-grid section-spacer">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title"><i class="ph ph-book-open"></i> Mutasi Kas Bulan ${selectedMonth}</h3>
              <a href="#/finance/transactions" class="btn btn-outline btn-sm">Lihat Semua</a>
            </div>
            <div class="table-wrap">
              <table class="table fin-table">
                <thead>
                  <tr><th>Tanggal</th><th>Tipe</th><th>Uraian</th><th>Metode</th><th class="text-right">Nominal</th>${!isReadOnly ? '<th class="text-center">Aksi</th>' : ''}</tr>
                </thead>
                <tbody>${ledgerRows}</tbody>
              </table>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3 class="card-title"><i class="ph ph-receipt"></i> Status Iuran SPP Siswa</h3>
              <a href="#/finance/student-bills" class="btn btn-outline btn-sm">Lihat Semua</a>
            </div>
            <div class="table-wrap">
              <table class="table fin-table">
                <thead>
                  <tr><th>Siswa</th><th>Jatuh Tempo</th><th class="text-right">Nominal</th><th>Status</th>${!isReadOnly ? '<th class="text-center">Aksi</th>' : ''}</tr>
                </thead>
                <tbody>${billRows}</tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    };
    const renderJournalView = () => {
      const lm = computeLedgerMetrics(selectedMonth);
      let totalDebit = 0;
      let totalCredit = 0;
      const rows = [];
      lm.filtered.forEach((entry, idx) => {
        const amt = Number(entry.amount || 0);
        const accs = resolveAccounts(entry);
        totalDebit += amt;
        totalCredit += amt;
        const refNo = entry.refNo || `JU-${String(idx + 1).padStart(4, '0')}`;
        rows.push(`
          <tr>
            <td>${esc(entry.date || '-')}</td>
            <td><code>${esc(refNo)}</code></td>
            <td><strong>${esc(accs.debit.code)}</strong> - ${esc(accs.debit.name)}</td>
            <td>${esc(entry.description || '-')}</td>
            <td class="text-right font-weight-bold">${money(amt)}</td>
            <td class="text-right text-muted">-</td>
          </tr>
          <tr class="fin-credit-row">
            <td></td>
            <td></td>
            <td class="fin-indent-1">&rarr; <strong>${esc(accs.credit.code)}</strong> - ${esc(accs.credit.name)}</td>
            <td class="text-muted"><small>Pencatatan kas berpasangan (${esc(entry.method || 'Tunai')})</small></td>
            <td class="text-right text-muted">-</td>
            <td class="text-right font-weight-bold">${money(amt)}</td>
          </tr>
        `);
      });
      const isBalanced = totalDebit === totalCredit;
      return `
        <div class="fin-formula-box">
          <div class="fin-formula-text">
            <strong><i class="ph ph-calculator"></i> Kaidah Akuntansi Jurnal Umum (Double-Entry):</strong><br>
            Total Debit: <strong>${money(totalDebit)}</strong> | Total Kredit: <strong>${money(totalCredit)}</strong>
          </div>
          <div class="${isBalanced ? 'fin-badge-balanced' : 'fin-badge-unbalanced'}">
            <i class="ph ${isBalanced ? 'ph-check-circle' : 'ph-warning-circle'}"></i> ${isBalanced ? 'JURNAL SEIMBANG (BALANCED)' : 'SELISIH / TIDAK SEIMBANG'}
          </div>
        </div>
        <div class="card section-block">
          <div class="card-header">
            <h3 class="card-title"><i class="ph ph-book-open"></i> Jurnal Umum Transaksi Keuangan - Bulan ${selectedMonth}</h3>
          </div>
          <div class="table-wrap">
            <table class="table fin-table" id="table-journal">
              <thead>
                <tr>
                  <th class="fin-w-110">Tanggal</th>
                  <th class="fin-w-130">No. Bukti</th>
                  <th>Kode & Akun Perkiraan</th>
                  <th>Keterangan Transaksi</th>
                  <th class="text-right fin-w-140">Debit (Rp)</th>
                  <th class="text-right fin-w-140">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody>
                ${rows.join('') || '<tr><td colspan="6" class="text-center text-muted">Belum ada transaksi jurnal untuk periode ini.</td></tr>'}
                <tr class="fin-row-total">
                  <td colspan="4" class="text-right"><strong>TOTAL JURNAL UMUM</strong></td>
                  <td class="text-right"><strong>${money(totalDebit)}</strong></td>
                  <td class="text-right"><strong>${money(totalCredit)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    };
    const renderCashFlowView = () => {
      let openBal = 0;
      ledger.forEach(item => {
        if (String(item.date || '') < selectedMonth + '-01') {
          const amt = Number(item.amount || 0);
          openBal += item.type === 'expense' ? -amt : amt;
        }
      });
      const curLedger = ledger.filter(item => String(item.date || '').startsWith(selectedMonth));
      let inSPP = 0, inBOS = 0, inInfaq = 0, inOther = 0;
      let outGaji = 0, outATK = 0, outDaya = 0, outKeg = 0, outSocial = 0, outOtherOp = 0;
      let inInvest = 0, outInvest = 0;
      let inFinance = 0, outFinance = 0;
      curLedger.forEach(item => {
        const amt = Number(item.amount || 0);
        const cat = (item.category || '').toLowerCase();
        if (item.type === 'income') {
          if (cat.includes('spp')) inSPP += amt;
          else if (cat.includes('bos')) inBOS += amt;
          else if (cat.includes('donasi') || cat.includes('infaq')) inInfaq += amt;
          else if (cat.includes('investasi') || cat.includes('aset')) inInvest += amt;
          else if (cat.includes('yayasan') || cat.includes('hibah')) inFinance += amt;
          else inOther += amt;
        } else {
          if (cat.includes('honor') || cat.includes('gaji')) outGaji += amt;
          else if (cat.includes('atk')) outATK += amt;
          else if (cat.includes('listrik') || cat.includes('air') || cat.includes('internet')) outDaya += amt;
          else if (cat.includes('kegiatan') || cat.includes('lomba')) outKeg += amt;
          else if (cat.includes('santunan') || cat.includes('sosial') || cat.includes('kesejahteraan')) outSocial += amt;
          else if (cat.includes('aset') || cat.includes('gedung') || cat.includes('pengadaan')) outInvest += amt;
          else if (cat.includes('pinjaman') || cat.includes('finansial')) outFinance += amt;
          else outOtherOp += amt;
        }
      });
      const totalInOp = inSPP + inBOS + inInfaq + inOther;
      const totalOutOp = outGaji + outATK + outDaya + outKeg + outSocial + outOtherOp;
      const netOp = totalInOp - totalOutOp;
      const netInvest = inInvest - outInvest;
      const netFinance = inFinance - outFinance;
      const netChange = netOp + netInvest + netFinance;
      const closeBal = openBal + netChange;
      return `
        <div class="fin-formula-box">
          <div class="fin-formula-text">
            <strong><i class="ph ph-book-bookmark"></i> Standar Arus Kas Nirlaba (ISAK 35):</strong><br>
            Saldo Awal: <strong>${money(openBal)}</strong> + Arus Kas Bersih (Operasional + Investasi + Pendanaan): <strong>${money(netChange)}</strong> = Saldo Akhir: <strong>${money(closeBal)}</strong>
          </div>
          <div class="fin-badge-balanced"><i class="ph ph-check-circle"></i> Sesuai Standar ISAK 35</div>
        </div>
        <div class="card section-block">
          <div class="card-header">
            <h3 class="card-title"><i class="ph ph-arrows-left-right"></i> Laporan Arus Kas (Metode Langsung) - Periode ${selectedMonth}</h3>
          </div>
          <div class="table-wrap">
            <table class="table fin-table" id="table-cashflow">
              <thead>
                <tr>
                  <th>Aktivitas Arus Kas</th>
                  <th class="text-right fin-w-160">Rincian (Rp)</th>
                  <th class="text-right fin-w-180">Subtotal (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr class="fin-row-header"><td colspan="3">A. ARUS KAS DARI AKTIVITAS OPERASIONAL</td></tr>
                <tr><td class="fin-indent-1">Penerimaan Iuran SPP Siswa</td><td class="text-right">${money(inSPP)}</td><td></td></tr>
                <tr><td class="fin-indent-1">Penerimaan Dana BOS Reguler</td><td class="text-right">${money(inBOS)}</td><td></td></tr>
                <tr><td class="fin-indent-1">Penerimaan Infaq & Donasi Sekolah</td><td class="text-right">${money(inInfaq)}</td><td></td></tr>
                <tr><td class="fin-indent-1">Penerimaan Operasional Lainnya</td><td class="text-right">${money(inOther)}</td><td></td></tr>
                <tr class="fin-row-subtotal"><td class="fin-indent-1"><strong>Total Arus Kas Masuk Operasional</strong></td><td></td><td class="text-right text-success"><strong>${money(totalInOp)}</strong></td></tr>
                <tr><td class="fin-indent-1">Pembayaran Gaji & Honorarium GTK</td><td class="text-right">(${money(outGaji)})</td><td></td></tr>
                <tr><td class="fin-indent-1">Belanja Bahan ATK & Pembelajaran</td><td class="text-right">(${money(outATK)})</td><td></td></tr>
                <tr><td class="fin-indent-1">Beban Daya & Jasa (Listrik/Air/Internet)</td><td class="text-right">(${money(outDaya)})</td><td></td></tr>
                <tr><td class="fin-indent-1">Beban Kegiatan & Lomba Siswa</td><td class="text-right">(${money(outKeg)})</td><td></td></tr>
                <tr><td class="fin-indent-1">Beban Kesejahteraan & Santunan Pegawai</td><td class="text-right">(${money(outSocial)})</td><td></td></tr>
                <tr><td class="fin-indent-1">Beban Operasional Umum Lainnya</td><td class="text-right">(${money(outOtherOp)})</td><td></td></tr>
                <tr class="fin-row-subtotal"><td class="fin-indent-1"><strong>Total Arus Kas Keluar Operasional</strong></td><td></td><td class="text-right text-danger"><strong>(${money(totalOutOp)})</strong></td></tr>
                <tr class="fin-row-header"><td><strong>Arus Kas Bersih dari Aktivitas Operasional (AKO)</strong></td><td></td><td class="text-right font-weight-bold"><strong>${money(netOp)}</strong></td></tr>
                <tr class="fin-row-header"><td colspan="3">B. ARUS KAS DARI AKTIVITAS INVESTASI</td></tr>
                <tr><td class="fin-indent-1">Penjualan Aset Afkir / Barang Bekas</td><td class="text-right">${money(inInvest)}</td><td></td></tr>
                <tr><td class="fin-indent-1">Pengadaan Aset Tetap, Inventaris & Sarpras</td><td class="text-right">(${money(outInvest)})</td><td></td></tr>
                <tr class="fin-row-header"><td><strong>Arus Kas Bersih dari Aktivitas Investasi (AKI)</strong></td><td></td><td class="text-right font-weight-bold"><strong>${money(netInvest)}</strong></td></tr>
                <tr class="fin-row-header"><td colspan="3">C. ARUS KAS DARI AKTIVITAS PENDANAAN</td></tr>
                <tr><td class="fin-indent-1">Bantuan Dana Pembangunan dari Yayasan / PCM</td><td class="text-right">${money(inFinance)}</td><td></td></tr>
                <tr><td class="fin-indent-1">Pembayaran Kewajiban Finansial / Pinjaman</td><td class="text-right">(${money(outFinance)})</td><td></td></tr>
                <tr class="fin-row-header"><td><strong>Arus Kas Bersih dari Aktivitas Pendanaan (AKP)</strong></td><td></td><td class="text-right font-weight-bold"><strong>${money(netFinance)}</strong></td></tr>
                <tr class="fin-row-total"><td colspan="2"><strong>KENAIKAN / (PENURUNAN) BERSIH KAS (AKO + AKI + AKP)</strong></td><td class="text-right"><strong>${money(netChange)}</strong></td></tr>
                <tr><td colspan="2"><strong>SALDO AWAL KAS & SETARA KAS PERIODE INI</strong></td><td class="text-right font-weight-bold">${money(openBal)}</td></tr>
                <tr class="fin-row-total"><td colspan="2"><strong>SALDO AKHIR KAS & SETARA KAS</strong></td><td class="text-right font-weight-bold text-primary"><strong>${money(closeBal)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    };
    const renderRKASView = () => {
      const rkas = computeRKASMetrics();
      const rows = rkas.rows.map((row, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><code>${esc(row.code || '-')}</code></td>
          <td><strong>${esc(row.component)}</strong></td>
          <td><span class="badge badge-outline">${esc(row.category)}</span></td>
          <td class="text-right">${money(row.pagu)}</td>
          <td class="text-right font-weight-bold">${money(row.actual)}</td>
          <td class="text-right font-weight-bold ${row.remaining < 0 ? 'text-danger' : 'text-success'}">${money(row.remaining)}</td>
          <td class="text-center font-weight-bold">${row.pct}%</td>
          <td class="text-center"><span class="badge ${row.statusBadge}">${row.statusText}</span></td>
        </tr>
      `).join('') || '<tr><td colspan="9" class="text-center text-muted">Belum ada komponen anggaran RKAS yang terdaftar.</td></tr>';
      return `
        <div class="fin-formula-box">
          <div class="fin-formula-text">
            <strong><i class="ph ph-chart-bar"></i> Rumus Serapan RKAS Otomatis:</strong><br>
            Total Pagu: <strong>${money(rkas.totalPagu)}</strong> | Realisasi Belanja: <strong>${money(rkas.totalRealized)}</strong> | Sisa Pagu: <strong>${money(rkas.remainingTotal)}</strong> (${rkas.overallPct}%)
          </div>
          <div class="fin-badge-balanced"><i class="ph ph-check-circle"></i> Teragregasi Real-Time</div>
        </div>
        <div class="card section-block">
          <div class="card-header">
            <h3 class="card-title"><i class="ph ph-file-text"></i> Laporan Realisasi Anggaran (LRA / Budget vs Actual)</h3>
            <a href="#/finance/rkas" class="btn btn-outline btn-sm">Kelola Pagu RKAS</a>
          </div>
          <div class="table-wrap">
            <table class="table fin-table" id="table-rkas">
              <thead>
                <tr>
                  <th class="text-center fin-w-40">No</th>
                  <th class="fin-w-90">Kode</th>
                  <th>Komponen Program / Kegiatan</th>
                  <th>Kategori Pos</th>
                  <th class="text-right fin-w-130">Pagu Anggaran</th>
                  <th class="text-right fin-w-130">Realisasi Aktual</th>
                  <th class="text-right fin-w-130">Sisa Pagu</th>
                  <th class="text-center fin-w-90">% Serapan</th>
                  <th class="text-center fin-w-110">Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="fin-row-total">
                  <td colspan="4" class="text-right"><strong>TOTAL REALISASI ANGGARAN SEKOLAH</strong></td>
                  <td class="text-right"><strong>${money(rkas.totalPagu)}</strong></td>
                  <td class="text-right"><strong>${money(rkas.totalRealized)}</strong></td>
                  <td class="text-right font-weight-bold ${rkas.remainingTotal < 0 ? 'text-danger' : 'text-success'}"><strong>${money(rkas.remainingTotal)}</strong></td>
                  <td class="text-center"><strong>${rkas.overallPct}%</strong></td>
                  <td class="text-center"><span class="badge badge-primary">Rangkuman</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    };
    const renderBalanceView = () => {
      const lm = computeLedgerMetrics();
      const rec = computeReceivables();
      const assetFixed = computeAssetFixedTotal();
      const totalCurrentAssets = lm.totalCash + rec.pendingTotal;
      const totalFixedAssets = assetFixed;
      const totalAssets = totalCurrentAssets + totalFixedAssets;
      const debtPayable = 0;
      const salaryPayable = 0;
      const totalLiabilities = debtPayable + salaryPayable;
      const currentSurplus = lm.surplus;
      const initialNetAssets = Math.max(0, totalAssets - totalLiabilities - currentSurplus);
      const totalNetAssets = initialNetAssets + currentSurplus;
      const totalLiabilitiesAndNetAssets = totalLiabilities + totalNetAssets;
      const diff = totalAssets - totalLiabilitiesAndNetAssets;
      const isBalanced = Math.abs(diff) < 1;
      return `
        <div class="fin-formula-box">
          <div class="fin-formula-text">
            <strong><i class="ph ph-scales"></i> Persamaan Dasar Neraca Nirlaba (ISAK 35):</strong><br>
            <strong>TOTAL ASET (${money(totalAssets)}) = TOTAL LIABILITAS (${money(totalLiabilities)}) + TOTAL ASET NETO (${money(totalNetAssets)})</strong>
          </div>
          <div class="${isBalanced ? 'fin-badge-balanced' : 'fin-badge-unbalanced'}">
            <i class="ph ${isBalanced ? 'ph-check-circle' : 'ph-warning-circle'}"></i> ${isBalanced ? 'NERACA SEIMBANG (BALANCED)' : 'SELISIH: ' + money(diff)}
          </div>
        </div>
        <div class="card section-block">
          <div class="card-header">
            <h3 class="card-title"><i class="ph ph-scales"></i> Laporan Posisi Keuangan (Neraca) per ${selectedMonth}</h3>
          </div>
          <div class="table-wrap">
            <table class="table fin-table" id="table-balance">
              <thead>
                <tr>
                  <th>Pos Akun Keuangan</th>
                  <th class="text-right fin-w-160">Rincian Akun (Rp)</th>
                  <th class="text-right fin-w-180">Jumlah Total (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr class="fin-row-header"><td colspan="3">1. ASET (AKTIVA)</td></tr>
                <tr><td class="fin-indent-1"><strong>Aset Lancar:</strong></td><td></td><td></td></tr>
                <tr><td class="fin-indent-2">Kas Tunai Sekolah (Brankas Kasir)</td><td class="text-right">${money(lm.cashTunai)}</td><td></td></tr>
                <tr><td class="fin-indent-2">Rekening Bank Jatim Operasional</td><td class="text-right">${money(lm.bankOperasional)}</td><td></td></tr>
                <tr><td class="fin-indent-2">Rekening Bank BOS Reguler</td><td class="text-right">${money(lm.bankBOS)}</td><td></td></tr>
                <tr><td class="fin-indent-2">Piutang Tagihan SPP Siswa (${rec.pendingCount} Siswa)</td><td class="text-right">${money(rec.pendingTotal)}</td><td></td></tr>
                <tr class="fin-row-subtotal"><td class="fin-indent-1"><strong>Total Aset Lancar</strong></td><td></td><td class="text-right font-weight-bold">${money(totalCurrentAssets)}</td></tr>
                <tr><td class="fin-indent-1"><strong>Aset Tetap (Sarana & Prasarana):</strong></td><td></td><td></td></tr>
                <tr><td class="fin-indent-2">Nilai Perolehan Inventaris & Fasilitas Sarpras</td><td class="text-right">${money(totalFixedAssets)}</td><td></td></tr>
                <tr><td class="fin-indent-2">Akumulasi Penyusutan Aset Tetap</td><td class="text-right">(Rp 0)</td><td></td></tr>
                <tr class="fin-row-subtotal"><td class="fin-indent-1"><strong>Total Aset Tetap Bersih</strong></td><td></td><td class="text-right font-weight-bold">${money(totalFixedAssets)}</td></tr>
                <tr class="fin-row-total"><td><strong>TOTAL ASET SEKOLAH</strong></td><td></td><td class="text-right text-primary font-weight-bold"><strong>${money(totalAssets)}</strong></td></tr>
                <tr class="fin-row-header"><td colspan="3">2. LIABILITAS (KEWAJIBAN / UTANG)</td></tr>
                <tr><td class="fin-indent-1">Utang Belanja Operasional</td><td class="text-right">${money(debtPayable)}</td><td></td></tr>
                <tr><td class="fin-indent-1">Utang Gaji / Tunjangan Terutang</td><td class="text-right">${money(salaryPayable)}</td><td></td></tr>
                <tr class="fin-row-subtotal"><td class="fin-indent-1"><strong>Total Liabilitas Jangka Pendek</strong></td><td></td><td class="text-right font-weight-bold">${money(totalLiabilities)}</td></tr>
                <tr class="fin-row-header"><td colspan="3">3. ASET NETO (EKUITAS NIRLABA)</td></tr>
                <tr><td class="fin-indent-1">Aset Neto Awal (Modal Yayasan & Akumulasi Aset)</td><td class="text-right">${money(initialNetAssets)}</td><td></td></tr>
                <tr><td class="fin-indent-1">Surplus / (Defisit) Operasional Periode Berjalan</td><td class="text-right">${money(currentSurplus)}</td><td></td></tr>
                <tr class="fin-row-subtotal"><td class="fin-indent-1"><strong>Total Aset Neto Sekolah</strong></td><td></td><td class="text-right font-weight-bold">${money(totalNetAssets)}</td></tr>
                <tr class="fin-row-total"><td><strong>TOTAL LIABILITAS & ASET NETO</strong></td><td></td><td class="text-right text-success font-weight-bold"><strong>${money(totalLiabilitiesAndNetAssets)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    };
    const renderSignatures = () => `
      <div class="salary-slip-signatures fin-print-signatures">
        <div class="salary-slip-sig-box fin-print-sig-box">
          <span>Mengetahui,</span><br>
          <strong>Kepala Sekolah</strong>
          <div class="salary-slip-sig-space fin-print-sig-space"></div>
          <strong>${esc(kepsekName)}</strong><br>
          <small class="text-muted">NUPTK: ${esc(kepsekNBM)}</small>
        </div>
        <div class="salary-slip-sig-box fin-print-sig-box">
          <span>Sedati, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span><br>
          <strong>Waka Keuangan</strong>
          <div class="salary-slip-sig-space fin-print-sig-space"></div>
          <strong>${esc(wakaKeuanganName)}</strong><br>
          <small class="text-muted">SD Muhammadiyah 1 Sedati</small>
        </div>
      </div>
    `;
    const renderModals = () => {
      const studentsOpts = Object.keys(studentIndex).map(id => `<option value="${id}">${esc(studentIndex[id].name)} (${esc(studentIndex[id].nis || '-')})</option>`).join('');
      const rkasOpts = rkasList.map(r => `<option value="${r.id}">[${esc(r.code || '-')}] ${esc(r.component)}</option>`).join('');
      return `
        <div class="modal-overlay" id="modal-fin-ledger">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title"><i class="ph ph-wallet"></i> Transaksi Kas Baru</h3>
              <button type="button" class="btn-icon" data-close-modal="modal-fin-ledger"><i class="ph ph-x"></i></button>
            </div>
            <form id="form-fin-ledger">
              <div class="modal-body">
                <div class="form-group">
                  <label for="fin-ledger-type">Tipe Transaksi</label>
                  <select id="fin-ledger-type" class="form-select" required>
                    <option value="income">Pemasukan (Uang Masuk)</option>
                    <option value="expense">Pengeluaran (Uang Keluar)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="fin-ledger-cat">Kategori Transaksi</label>
                  <select id="fin-ledger-cat" class="form-select" required>
                    <option value="SPP">SPP Siswa</option>
                    <option value="BOS">Dana BOS Reguler</option>
                    <option value="Donasi">Donasi & Infaq</option>
                    <option value="Honor">Gaji & Honor GTK</option>
                    <option value="ATK">ATK & Bahan Pembelajaran</option>
                    <option value="Listrik & Air">Listrik, Air & Internet</option>
                    <option value="Pemeliharaan">Pemeliharaan Gedung & Sarpras</option>
                    <option value="Kegiatan">Kegiatan Siswa & Lomba</option>
                    <option value="Santunan">Santunan Sosial Pegawai</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="fin-ledger-method">Metode Kas / Bank</label>
                  <select id="fin-ledger-method" class="form-select" required>
                    <option value="Tunai (Brankas)">Kas Tunai (Brankas Kasir)</option>
                    <option value="Bank Jatim Operasional">Bank Jatim Operasional</option>
                    <option value="Bank BOS">Bank Jatim BOS Reguler</option>
                    <option value="Transfer Lainnya">Transfer Bank Lainnya</option>
                  </select>
                </div>
                <div class="form-group fin-d-none" id="group-fin-rkas">
                  <label for="fin-ledger-rkas">Alokasi Komponen RKAS (Khusus Pengeluaran)</label>
                  <select id="fin-ledger-rkas" class="form-select">
                    <option value="">-- Tanpa Pos RKAS / Bebas --</option>
                    ${rkasOpts}
                  </select>
                </div>
                <div class="form-group">
                  <label for="fin-ledger-amount">Nominal (Rp)</label>
                  <input type="number" id="fin-ledger-amount" class="form-input" required min="1" placeholder="Contoh: 350000">
                </div>
                <div class="form-group">
                  <label for="fin-ledger-desc">Keterangan / Uraian</label>
                  <input type="text" id="fin-ledger-desc" class="form-input" required placeholder="Contoh: Pembelian spidol kelas 1A">
                </div>
                <div class="form-group">
                  <label for="fin-ledger-date">Tanggal Transaksi</label>
                  <input type="date" id="fin-ledger-date" class="form-input" required value="${new Date().toISOString().slice(0, 10)}">
                </div>
                <div class="form-group">
                  <label for="fin-ledger-ref">Nomor Bukti / Kuitansi (Opsional)</label>
                  <input type="text" id="fin-ledger-ref" class="form-input" placeholder="Contoh: BKK-001/X/2026">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal="modal-fin-ledger">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
        <div class="modal-overlay" id="modal-fin-bill">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title"><i class="ph ph-receipt"></i> Buat Tagihan SPP Baru</h3>
              <button type="button" class="btn-icon" data-close-modal="modal-fin-bill"><i class="ph ph-x"></i></button>
            </div>
            <form id="form-fin-bill">
              <div class="modal-body">
                <div class="form-group">
                  <label for="fin-bill-student">Pilih Siswa</label>
                  <select id="fin-bill-student" class="form-select" required>
                    <option value="">-- Pilih Siswa --</option>
                    ${studentsOpts}
                  </select>
                </div>
                <div class="form-group">
                  <label for="fin-bill-month">Bulan Tagihan</label>
                  <select id="fin-bill-month" class="form-select" required>
                    <option value="Juli">Juli</option>
                    <option value="Agustus">Agustus</option>
                    <option value="September">September</option>
                    <option value="Oktober">Oktober</option>
                    <option value="November">November</option>
                    <option value="Desember">Desember</option>
                    <option value="Januari">Januari</option>
                    <option value="Februari">Februari</option>
                    <option value="Maret">Maret</option>
                    <option value="April">April</option>
                    <option value="Mei">Mei</option>
                    <option value="Juni">Juni</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="fin-bill-year">Tahun Ajaran</label>
                  <input type="text" id="fin-bill-year" class="form-input" required value="${esc(currentYear)}">
                </div>
                <div class="form-group">
                  <label for="fin-bill-amount">Nominal SPP (Rp)</label>
                  <input type="number" id="fin-bill-amount" class="form-input" required min="1" placeholder="Masukkan nominal SPP">
                </div>
                <div class="form-group">
                  <label for="fin-bill-date">Jatuh Tempo</label>
                  <input type="date" id="fin-bill-date" class="form-input" required value="${new Date().toISOString().slice(0, 10)}">
                </div>
                <div class="form-group">
                  <label for="fin-bill-status">Status Tagihan</label>
                  <select id="fin-bill-status" class="form-select" required>
                    <option value="Belum Lunas">Belum Lunas</option>
                    <option value="Lunas">Lunas (Otomatis Catat Kas)</option>
                    <option value="Bebas Beasiswa">Bebas Beasiswa (Subsidi)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="fin-bill-note">Catatan Tambahan</label>
                  <input type="text" id="fin-bill-note" class="form-input" placeholder="Contoh: SPP Reguler">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal="modal-fin-bill">Batal</button>
                <button type="submit" class="btn btn-primary">Buat Tagihan</button>
              </div>
            </form>
          </div>
        </div>
      `;
    };
    const paint = () => {
      let contentHtml = '';
      if (activeTab === 'summary') contentHtml = renderSummaryView();
      else if (activeTab === 'journal') contentHtml = renderJournalView();
      else if (activeTab === 'cashflow') contentHtml = renderCashFlowView();
      else if (activeTab === 'rkas') contentHtml = renderRKASView();
      else if (activeTab === 'balance') contentHtml = renderBalanceView();
      container.innerHTML = `
        <div id="fin-main-content">
          ${renderToolbar()}
          <div id="fin-tab-content">${contentHtml}</div>
          ${renderSignatures()}
          ${renderModals()}
        </div>
      `;
      bindEvents();
    };
    const exportExcel = () => {
      if (!window.XLSX) {
        alert('Library Excel (XLSX) belum siap dimuat.');
        return;
      }
      const wb = XLSX.utils.book_new();
      let tableId = '';
      let filename = `Laporan_Keuangan_Musada_${selectedMonth}`;
      if (activeTab === 'journal') {
        tableId = 'table-journal';
        filename = `1_Jurnal_Umum_${selectedMonth}`;
      } else if (activeTab === 'cashflow') {
        tableId = 'table-cashflow';
        filename = `2_Arus_Kas_ISAK35_${selectedMonth}`;
      } else if (activeTab === 'rkas') {
        tableId = 'table-rkas';
        filename = `3_Realisasi_RKAS_${selectedMonth}`;
      } else if (activeTab === 'balance') {
        tableId = 'table-balance';
        filename = `4_Posisi_Keuangan_Neraca_${selectedMonth}`;
      } else {
        const lm = computeLedgerMetrics(selectedMonth);
        const data = lm.filtered.map(l => ({
          Tanggal: l.date,
          Tipe: l.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          Kategori: l.category,
          Metode: l.method,
          Uraian: l.description,
          Nominal: l.amount
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan Kas');
        XLSX.writeFile(wb, `${filename}.xlsx`);
        return;
      }
      const tbl = document.getElementById(tableId);
      if (tbl) {
        const ws = XLSX.utils.table_to_sheet(tbl);
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }
    };
    const bindEvents = () => {
      container.querySelectorAll('.fin-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tab = e.currentTarget.dataset.tab;
          if (tab && tab !== activeTab) {
            activeTab = tab;
            paint();
          }
        });
      });
      const periodInput = container.querySelector('#fin-period-select');
      if (periodInput) {
        periodInput.addEventListener('change', (e) => {
          if (e.target.value) {
            selectedMonth = e.target.value;
            paint();
          }
        });
      }
      const btnExcel = container.querySelector('#btn-export-excel');
      if (btnExcel) btnExcel.addEventListener('click', exportExcel);
      const btnPrint = container.querySelector('#btn-print-report');
      if (btnPrint) btnPrint.addEventListener('click', () => window.print());
      const btnAddLedger = container.querySelector('#btn-open-add-ledger');
      if (btnAddLedger) {
        btnAddLedger.addEventListener('click', () => {
          App.openModal('modal-fin-ledger');
        });
      }
      const btnAddBill = container.querySelector('#btn-open-add-bill');
      if (btnAddBill) {
        btnAddBill.addEventListener('click', () => {
          App.openModal('modal-fin-bill');
        });
      }
      const typeSelect = container.querySelector('#fin-ledger-type');
      const rkasGroup = container.querySelector('#group-fin-rkas');
      if (typeSelect && rkasGroup) {
        typeSelect.addEventListener('change', () => {
          rkasGroup.classList.toggle('fin-d-none', typeSelect.value !== 'expense');
        });
      }
      const formLedger = container.querySelector('#form-fin-ledger');
      if (formLedger) {
        formLedger.addEventListener('submit', async (e) => {
          e.preventDefault();
          const submitBtn = e.target.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Menyimpan...';
          const payload = {
            type: document.getElementById('fin-ledger-type').value,
            category: document.getElementById('fin-ledger-cat').value,
            method: document.getElementById('fin-ledger-method').value,
            rkasId: document.getElementById('fin-ledger-rkas').value || null,
            amount: Number(document.getElementById('fin-ledger-amount').value),
            description: document.getElementById('fin-ledger-desc').value,
            date: document.getElementById('fin-ledger-date').value,
            refNo: document.getElementById('fin-ledger-ref').value
          };
          await DB.saveFinanceEntry(payload);
          App.closeModal('modal-fin-ledger');
          FinancePages.renderDashboard(container);
        });
      }
      const formBill = container.querySelector('#form-fin-bill');
      if (formBill) {
        formBill.addEventListener('submit', async (e) => {
          e.preventDefault();
          const submitBtn = e.target.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Menyimpan...';
          const stuId = document.getElementById('fin-bill-student').value;
          const status = document.getElementById('fin-bill-status').value;
          const amt = Number(document.getElementById('fin-bill-amount').value);
          const month = document.getElementById('fin-bill-month').value;
          const year = document.getElementById('fin-bill-year').value;
          const dueDate = document.getElementById('fin-bill-date').value;
          const note = document.getElementById('fin-bill-note').value;
          const billId = await DB.saveStudentBill({
            studentId: stuId,
            amount: amt,
            month: month,
            academicYear: year,
            dueDate: dueDate,
            note: note,
            status: status
          });
          if (status === 'Lunas' && billId) {
            await DB.markStudentBillPaid(billId, {
              paymentDate: dueDate,
              studentName: studentIndex[stuId]?.name || ''
            });
          }
          App.closeModal('modal-fin-bill');
          FinancePages.renderDashboard(container);
        });
      }
      container.querySelectorAll('[data-action="pay-bill"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          if (!id) return;
          const bill = bills.find(b => b.id === id);
          const studentName = studentIndex[bill?.studentId]?.name || 'Siswa';
          if (!confirm(`Tandai tagihan SPP an. ${studentName} (${money(bill?.amount)}) LUNAS?\nSistem akan otomatis mencatat kas masuk di Buku Kas Umum.`)) return;
          e.currentTarget.disabled = true;
          await DB.markStudentBillPaid(id, { studentName });
          FinancePages.renderDashboard(container);
        });
      });
      container.querySelectorAll('[data-action="del-ledger"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          if (!id || !confirm('Yakin ingin menghapus transaksi kas ini?')) return;
          e.currentTarget.disabled = true;
          await DB.deleteFinanceEntry(id);
          FinancePages.renderDashboard(container);
        });
      });
    };
    paint();
  }
};
