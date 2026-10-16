(function(){
  let currentAdminId = null;
  let currentSession = null;
  let scanner = null;
  let scannerActive = true;
  let scannedMember = null;
  let scannedBook = null;
  let allTransactions = [];
  let allMembers = [];
  let allBooks = [];
  let allVisits = [];
  let allDonations = [];
  const scanSound = new Audio('assets/audio/scanner-correct.mp3');
  const scanWrongSound = new Audio('assets/audio/scanner-wrong.mp3');
  function speak(text) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'id-ID';
      u.rate = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang === 'id-ID');
      if (idVoice) u.voice = idVoice;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function updateGreeting() {
    const el = document.getElementById('dynamicGreeting');
    if (!el) return;
    const hour = new Date().getHours();
    let g = 'Selamat malam,';
    if (hour >= 4 && hour < 10) g = 'Selamat pagi,';
    else if (hour >= 10 && hour < 15) g = 'Selamat siang,';
    else if (hour >= 15 && hour < 18) g = 'Selamat sore,';
    el.textContent = g;
  }
  function startClocks() {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    function tick() {
      const now = new Date();
      const dayName = days[now.getDay()];
      const date = String(now.getDate()).padStart(2, '0');
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      const sec = now.getSeconds();
      const min = now.getMinutes();
      const hr = now.getHours();
      const secDeg = (sec / 60) * 360;
      const minDeg = (min / 60) * 360 + (sec / 60) * 6;
      const hrDeg = (hr / 12) * 360 + (min / 60) * 30;
      const loginDate = document.getElementById('loginDateText');
      if (loginDate) loginDate.textContent = `${dayName}, ${date} ${monthName} ${year}`;
      const lH = document.getElementById('loginHourHand');
      const lM = document.getElementById('loginMinHand');
      const lS = document.getElementById('loginSecHand');
      if (lH && lM && lS) {
        lH.style.transform = `rotate(${hrDeg}deg)`;
        lM.style.transform = `rotate(${minDeg}deg)`;
        lS.style.transform = `rotate(${secDeg}deg)`;
      }
      const hDay = document.getElementById('headerDayText');
      const hDate = document.getElementById('headerDateText');
      if (hDay) hDay.textContent = `${dayName},`;
      if (hDate) hDate.textContent = `${date} ${monthName} ${year}`;
      const sH = document.getElementById('headerHourHand');
      const sM = document.getElementById('headerMinHand');
      const sS = document.getElementById('headerSecHand');
      if (sH && sM && sS) {
        sH.style.transform = `rotate(${hrDeg}deg)`;
        sM.style.transform = `rotate(${minDeg}deg)`;
        sS.style.transform = `rotate(${secDeg}deg)`;
      }
    }
    setInterval(tick, 1000);
    tick();
  }
  function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').classList.remove('dashboard-hidden');
    updateGreeting();
    const nama = localStorage.getItem('lib_adminNama') || 'Admin';
    const headerName = document.getElementById('adminNameHeader');
    if (headerName) headerName.textContent = nama;
    initScanner();
    loadAllDashboardData();
    loadAdminProfile();
  }
  function handleLogout() {
    Swal.fire({
      title: 'Konfirmasi Keluar',
      text: 'Apakah Anda yakin ingin keluar dari dashboard admin perpustakaan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('lib_sessionToken');
        localStorage.removeItem('lib_adminId');
        localStorage.removeItem('lib_adminNama');
        window.location.reload();
      }
    });
  }
  async function loadAllDashboardData() {
    try {
      const [stats, books, members, transactions, visits, donations] = await Promise.all([
        DBLibrary.getStatistics(),
        DBLibrary.getBooks(),
        DBLibrary.getMembers(),
        DBLibrary.getTransactions(),
        DBLibrary.getVisits(500),
        DBLibrary.getDonations()
      ]);
      allBooks = books;
      allMembers = members;
      allTransactions = transactions;
      allVisits = visits;
      allDonations = donations;
      renderStatistikTab(stats, members);
      renderTransactionsTable();
      renderOverdueTable();
      renderMembersTable();
      renderBooksTable();
      renderVisitsTable();
      renderDonationsTable();
      populateBookCategoriesFilter();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }
  function renderStatistikTab(stats, members) {
    document.getElementById('statCardTotalBuku').textContent = stats.totalBuku || 0;
    document.getElementById('statCardStokTersedia').textContent = stats.stokTersedia || 0;
    document.getElementById('statCardDipinjam').textContent = stats.dipinjam || 0;
    document.getElementById('statCardOverdue').textContent = stats.overdueCount || 0;
    document.getElementById('statCardTotalAnggota').textContent = members.length || 0;
    document.getElementById('statCardKunjunganToday').textContent = stats.visitsToday || 0;
  }
  function renderTransactionsTable() {
    const tbody = document.getElementById('transactionTableBody');
    if (!tbody) return;
    const q = (document.getElementById('searchTransactionInput')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('filterTransactionStatus')?.value || 'ALL';
    let filtered = allTransactions;
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (q) {
      filtered = filtered.filter(t => {
        return (t.trxNo && t.trxNo.toLowerCase().includes(q)) ||
          (t.memberCode && t.memberCode.toLowerCase().includes(q)) ||
          (t.bookCode && t.bookCode.toLowerCase().includes(q));
      });
    }
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Tidak ada data transaksi yang sesuai.</td></tr>';
      return;
    }
    tbody.innerHTML = filtered.map(t => {
      const isBorrowed = t.status === 'DIPINJAM';
      const badge = isBorrowed
        ? '<span class="status-badge-sidebar" style="background:#FEF3C7; color:#92400E; display:inline-block; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;">DIPINJAM</span>'
        : '<span class="status-badge-sidebar" style="background:#D1FAE5; color:#065F46; display:inline-block; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;">KEMBALI</span>';
      const actionBtn = isBorrowed
        ? `<button type="button" class="btn-xs btn-warning btn-return-trx" data-trx="${t.trxNo}"><i class="fas fa-sign-in-alt"></i> Kembalikan</button>`
        : '-';
      return `
        <tr>
          <td><strong>${t.trxNo}</strong></td>
          <td>${t.borrowDate || '-'}</td>
          <td>${t.memberCode}</td>
          <td>${t.bookCode}</td>
          <td>${t.durationDays} hari</td>
          <td>${t.dueDate || '-'}</td>
          <td>${t.returnDate || '-'}</td>
          <td>${badge}</td>
          <td>${actionBtn}</td>
        </tr>
      `;
    }).join('');
    tbody.querySelectorAll('.btn-return-trx').forEach(b => {
      b.addEventListener('click', () => openReturnModal(b.dataset.trx));
    });
  }
  function renderOverdueTable() {
    const tbody = document.getElementById('overdueTableBody');
    if (!tbody) return;
    const today = new Date().toISOString().slice(0, 10);
    const overdueList = allTransactions.filter(t => t.status === 'DIPINJAM' && t.dueDate && today > t.dueDate);
    if (!overdueList.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Alhamdulillah, tidak ada peminjaman yang melewati jatuh tempo.</td></tr>';
      return;
    }
    tbody.innerHTML = overdueList.map(t => {
      const due = new Date(t.dueDate);
      const now = new Date(today);
      const diffDays = Math.max(1, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
      const fine = diffDays * 500;
      const m = allMembers.find(mem => mem.code === t.memberCode) || {};
      const b = allBooks.find(book => book.code === t.bookCode) || {};
      return `
        <tr>
          <td><strong>${t.trxNo}</strong></td>
          <td>${m.name || t.memberCode} <br><small class="text-muted">${t.memberCode}</small></td>
          <td>${b.title || t.bookCode} <br><small class="text-muted">${t.bookCode}</small></td>
          <td>${t.borrowDate}</td>
          <td><span style="color:#EF4444; font-weight:700;">${t.dueDate}</span></td>
          <td><span style="color:#EF4444; font-weight:800;">${diffDays} Hari</span></td>
          <td>Rp ${fine.toLocaleString('id-ID')}</td>
          <td>
            <button type="button" class="btn-xs btn-warning btn-return-trx" data-trx="${t.trxNo}"><i class="fas fa-sign-in-alt"></i> Kembalikan</button>
          </td>
        </tr>
      `;
    }).join('');
    tbody.querySelectorAll('.btn-return-trx').forEach(btn => {
      btn.addEventListener('click', () => openReturnModal(btn.dataset.trx));
    });
  }
  function renderMembersTable() {
    const tbody = document.getElementById('memberTableBody');
    if (!tbody) return;
    const q = (document.getElementById('searchMemberInput')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('filterMemberType')?.value || 'ALL';
    let filtered = allMembers;
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(m => m.type === typeFilter);
    }
    if (q) {
      filtered = filtered.filter(m => {
        return (m.name && m.name.toLowerCase().includes(q)) ||
          (m.code && m.code.toLowerCase().includes(q)) ||
          (m.note && m.note.toLowerCase().includes(q));
      });
    }
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Belum ada data anggota yang sesuai.</td></tr>';
      return;
    }
    tbody.innerHTML = filtered.map(m => {
      return `
        <tr>
          <td><strong>${m.code}</strong></td>
          <td>${m.name}</td>
          <td>${m.gender || '-'}</td>
          <td><span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:#EFF6FF; color:#1D4ED8;">${m.type}</span></td>
          <td>${m.note || '-'}</td>
          <td>${m.printStatus === 'DICETAK' ? '<span style="color:#059669; font-weight:700;">Sudah Dicetak</span>' : '<span style="color:#9CA3AF;">Belum Dicetak</span>'}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn-xs btn-primary btn-edit-member" data-code="${m.code}"><i class="fas fa-edit"></i></button>
              <button type="button" class="btn-xs btn-danger btn-del-member" data-code="${m.code}"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    tbody.querySelectorAll('.btn-edit-member').forEach(b => {
      b.addEventListener('click', () => openMemberModal(b.dataset.code));
    });
    tbody.querySelectorAll('.btn-del-member').forEach(b => {
      b.addEventListener('click', () => deleteMember(b.dataset.code));
    });
  }
  function renderBooksTable() {
    const tbody = document.getElementById('bookTableBody');
    if (!tbody) return;
    const q = (document.getElementById('searchBookAdminInput')?.value || '').toLowerCase();
    const catFilter = document.getElementById('filterBookCategory')?.value || 'ALL';
    let filtered = allBooks;
    if (catFilter !== 'ALL') {
      filtered = filtered.filter(b => b.category === catFilter);
    }
    if (q) {
      filtered = filtered.filter(b => {
        return (b.title && b.title.toLowerCase().includes(q)) ||
          (b.code && b.code.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.shelfCode && b.shelfCode.toLowerCase().includes(q)) ||
          (b.publisher && b.publisher.toLowerCase().includes(q));
      });
    }
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">Belum ada koleksi buku yang sesuai.</td></tr>';
      return;
    }
    tbody.innerHTML = filtered.map(b => {
      const ebookBadge = b.isEbook ? '<span style="color:#0D9488; font-weight:700; margin-left:6px;"><i class="fas fa-bolt"></i> E-Book</span>' : '';
      return `
        <tr>
          <td><strong>${b.code}</strong></td>
          <td><span style="padding:2px 6px; background:#F1F5F9; border-radius:4px; font-weight:600;">${b.shelfCode}</span></td>
          <td><strong>${b.title}</strong>${ebookBadge}</td>
          <td>${b.author || '-'}</td>
          <td>${b.publisher || '-'}</td>
          <td>${b.year || '-'}</td>
          <td><span style="font-weight:700; color:${parseInt(b.stockAvailable,10)>0 ? '#10B981':'#EF4444'}">${b.stockAvailable}</span></td>
          <td>${b.stockTotal}</td>
          <td>${b.category}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn-xs btn-primary btn-edit-book" data-code="${b.code}"><i class="fas fa-edit"></i></button>
              <button type="button" class="btn-xs btn-danger btn-del-book" data-code="${b.code}"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    tbody.querySelectorAll('.btn-edit-book').forEach(b => {
      b.addEventListener('click', () => openBookModal(b.dataset.code));
    });
    tbody.querySelectorAll('.btn-del-book').forEach(b => {
      b.addEventListener('click', () => deleteBook(b.dataset.code));
    });
  }
  function populateBookCategoriesFilter() {
    const sel = document.getElementById('filterBookCategory');
    if (!sel) return;
    const cats = [...new Set(allBooks.map(b => b.category).filter(Boolean))];
    sel.innerHTML = '<option value="ALL">Semua Kategori</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }
  function renderVisitsTable() {
    const tbody = document.getElementById('visitTableBody');
    if (!tbody) return;
    const q = (document.getElementById('searchVisitInput')?.value || '').toLowerCase();
    const dateFilter = document.getElementById('filterVisitDate')?.value || '';
    let filtered = allVisits;
    if (dateFilter) {
      filtered = filtered.filter(v => v.date === dateFilter);
    }
    if (q) {
      filtered = filtered.filter(v => {
        return (v.memberName && v.memberName.toLowerCase().includes(q)) ||
          (v.memberCode && v.memberCode.toLowerCase().includes(q));
      });
    }
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Belum ada data kunjungan.</td></tr>';
      return;
    }
    tbody.innerHTML = filtered.map(v => {
      return `
        <tr>
          <td><strong>${v.date}</strong></td>
          <td>${v.time || '-'}</td>
          <td>${v.memberCode || '-'}</td>
          <td>${v.memberName}</td>
          <td><span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#EFF6FF; color:#1D4ED8;">${v.memberType}</span></td>
          <td>${v.purpose}</td>
        </tr>
      `;
    }).join('');
  }
  function renderDonationsTable() {
    const tbody = document.getElementById('donationsTableBody');
    if (!tbody) return;
    if (!allDonations.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Belum ada donasi yang tercatat.</td></tr>';
      return;
    }
    tbody.innerHTML = allDonations.map(d => {
      const isMoney = d.type === 'dana';
      const typeBadge = isMoney
        ? '<span style="background:#FEF3C7; color:#92400E; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">Dana / Infaq</span>'
        : '<span style="background:#D1FAE5; color:#065F46; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">Buku Fisik</span>';
      const detailText = isMoney ? `Rp ${(parseInt(d.amount, 10)||0).toLocaleString('id-ID')}` : `${d.bookCount || 0} Buku: ${d.bookTitles || '-'}`;
      const statusBadge = d.status === 'verified'
        ? '<span style="color:#059669; font-weight:700;"><i class="fas fa-check-circle"></i> Terverifikasi</span>'
        : '<span style="color:#D97706; font-weight:700;"><i class="fas fa-clock"></i> Menunggu</span>';
      const verifyBtn = d.status !== 'verified'
        ? `<button type="button" class="btn-xs btn-success btn-verify-donasi" data-id="${d.id}"><i class="fas fa-check"></i> Verifikasi</button>`
        : `<button type="button" class="btn-xs btn-secondary btn-unverify-donasi" data-id="${d.id}"><i class="fas fa-undo"></i> Batal</button>`;
      return `
        <tr>
          <td>${d.date || '-'}</td>
          <td>${typeBadge}</td>
          <td><strong>${d.donorName}</strong></td>
          <td>${d.phone || '-'}</td>
          <td>${detailText}</td>
          <td>${d.notes || '-'}</td>
          <td>${statusBadge}</td>
          <td>${verifyBtn}</td>
        </tr>
      `;
    }).join('');
    tbody.querySelectorAll('.btn-verify-donasi').forEach(b => {
      b.addEventListener('click', async () => {
        await DBLibrary.updateDonationStatus(b.dataset.id, 'verified');
        Swal.fire('Berhasil', 'Donasi berhasil diverifikasi.', 'success');
        loadAllDashboardData();
      });
    });
    tbody.querySelectorAll('.btn-unverify-donasi').forEach(b => {
      b.addEventListener('click', async () => {
        await DBLibrary.updateDonationStatus(b.dataset.id, 'pending');
        loadAllDashboardData();
      });
    });
  }
  function initScanner() {
    if (scanner) return;
    try {
      scanner = new Html5Qrcode('reader');
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        qrMessage => {
          if (scannerActive) processScanCode(qrMessage.trim());
        },
        errorMessage => {}
      );
    } catch (err) {
      console.warn('Scanner init warning:', err);
    }
  }
  let isProcessingScan = false;
  async function processScanCode(code) {
    if (isProcessingScan || !code) return;
    isProcessingScan = true;
    const member = allMembers.find(m => m.code === code);
    const book = allBooks.find(b => b.code === code);
    if (member) {
      scanSound.play().catch(() => {});
      scannedMember = member;
      updateScannedMemberUI(member);
      speak(`Berhasil scan data anggota, atas nama ${member.name}`);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Anggota: ${member.name}`,
        showConfirmButton: false,
        timer: 2000
      });
    } else if (book) {
      scanSound.play().catch(() => {});
      scannedBook = book;
      updateScannedBookUI(book);
      speak(`Berhasil scan buku, dengan judul ${book.title}`);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Buku: ${book.title}`,
        showConfirmButton: false,
        timer: 2000
      });
    } else {
      scanWrongSound.play().catch(() => {});
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: `Kode tidak ditemukan: ${code}`,
        showConfirmButton: false,
        timer: 2500
      });
    }
    updateScanActionButtons();
    setTimeout(() => {
      isProcessingScan = false;
    }, 1000);
  }
  function updateScannedMemberUI(m) {
    const el = document.getElementById('memberInfo');
    if (!el) return;
    if (!m) {
      el.innerHTML = 'Belum ada anggota yang dipindai';
      el.className = 'info-content-empty';
      return;
    }
    el.className = 'info-content-filled';
    el.innerHTML = `
      <div style="font-size:15px; font-weight:700; color:#1E40AF; margin-bottom:4px;">${m.name}</div>
      <div style="font-size:13px; color:#475569;">Kode: <strong>${m.code}</strong> | Kategori: <strong>${m.type}</strong></div>
      <div style="font-size:12px; color:#64748B;">Keterangan: ${m.note || '-'}</div>
    `;
  }
  function updateScannedBookUI(b) {
    const el = document.getElementById('bookInfo');
    if (!el) return;
    if (!b) {
      el.innerHTML = 'Belum ada buku yang dipindai';
      el.className = 'info-content-empty';
      return;
    }
    el.className = 'info-content-filled';
    el.innerHTML = `
      <div style="font-size:15px; font-weight:700; color:#1E40AF; margin-bottom:4px;">${b.title}</div>
      <div style="font-size:13px; color:#475569;">Kode: <strong>${b.code}</strong> | Rak: <strong>${b.shelfCode}</strong> | Stok: <strong>${b.stockAvailable}/${b.stockTotal}</strong></div>
      <div style="font-size:12px; color:#64748B;">Pengarang: ${b.author || '-'} | Penerbit: ${b.publisher || '-'}</div>
    `;
  }
  function updateScanActionButtons() {
    const btnBorrow = document.getElementById('btnDirectBorrow');
    const btnReturn = document.getElementById('btnDirectReturn');
    const btnVisit = document.getElementById('btnDirectVisit');
    if (btnBorrow) btnBorrow.disabled = !(scannedMember && scannedBook);
    if (btnReturn) btnReturn.disabled = !scannedBook;
    if (btnVisit) btnVisit.disabled = !scannedMember;
  }
  function resetScannedData() {
    scannedMember = null;
    scannedBook = null;
    updateScannedMemberUI(null);
    updateScannedBookUI(null);
    updateScanActionButtons();
  }
  function openReturnModal(trxNo) {
    const trx = allTransactions.find(t => t.trxNo === trxNo);
    if (!trx) return;
    const m = allMembers.find(mem => mem.code === trx.memberCode) || {};
    const b = allBooks.find(book => book.code === trx.bookCode) || {};
    const box = document.getElementById('returnInfoBox');
    if (box) {
      box.innerHTML = `
        <p><strong>No Transaksi:</strong> ${trx.trxNo}</p>
        <p><strong>Peminjam:</strong> ${m.name || trx.memberCode} (${trx.memberCode})</p>
        <p><strong>Buku:</strong> ${b.title || trx.bookCode} (${trx.bookCode})</p>
        <p><strong>Tgl Pinjam:</strong> ${trx.borrowDate} | <strong>Jatuh Tempo:</strong> ${trx.dueDate}</p>
      `;
    }
    const btnConfirm = document.getElementById('btnConfirmReturnAction');
    if (btnConfirm) {
      btnConfirm.onclick = async () => {
        try {
          await DBLibrary.returnBook(trx.trxNo);
          Swal.fire('Berhasil', 'Buku telah berhasil dikembalikan!', 'success');
          closeModals();
          loadAllDashboardData();
        } catch (e) {
          Swal.fire('Gagal', e.message, 'error');
        }
      };
    }
    document.getElementById('returnModal')?.classList.add('active');
  }
  function openBookModal(code = null) {
    const isEdit = !!code;
    document.getElementById('bookFormIsEdit').value = isEdit ? '1' : '0';
    document.getElementById('bookModalTitle').innerHTML = isEdit ? '<i class="fas fa-edit"></i> Edit Koleksi Buku' : '<i class="fas fa-plus"></i> Tambah Koleksi Buku';
    const form = document.getElementById('bookForm');
    form.reset();
    document.getElementById('bookFormCode').readOnly = isEdit;
    if (isEdit) {
      const b = allBooks.find(item => item.code === code);
      if (b) {
        document.getElementById('bookFormCode').value = b.code;
        document.getElementById('bookFormShelf').value = b.shelfCode || '';
        document.getElementById('bookFormTitle').value = b.title || '';
        document.getElementById('bookFormAuthor').value = b.author || '';
        document.getElementById('bookFormPublisher').value = b.publisher || '';
        document.getElementById('bookFormYear').value = b.year || '';
        document.getElementById('bookFormStock').value = b.stockTotal || 1;
        document.getElementById('bookFormCategory').value = b.category || '';
        document.getElementById('bookFormIsEbook').checked = b.isEbook === true;
        document.getElementById('bookFormEbookUrl').value = b.ebookUrl || '';
        document.getElementById('ebookUrlGroup').style.display = b.isEbook ? 'block' : 'none';
      }
    }
    document.getElementById('bookModal')?.classList.add('active');
  }
  async function deleteBook(code) {
    const res = await Swal.fire({
      title: 'Hapus Buku?',
      text: `Yakin ingin menghapus koleksi buku dengan kode ${code}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (res.isConfirmed) {
      await DBLibrary.deleteBook(code);
      Swal.fire('Terhapus', 'Koleksi buku berhasil dihapus.', 'success');
      loadAllDashboardData();
    }
  }
  function openMemberModal(code = null) {
    const isEdit = !!code;
    document.getElementById('memberFormIsEdit').value = isEdit ? '1' : '0';
    document.getElementById('memberModalTitle').innerHTML = isEdit ? '<i class="fas fa-edit"></i> Edit Data Anggota' : '<i class="fas fa-user-plus"></i> Tambah Data Anggota';
    const form = document.getElementById('memberForm');
    form.reset();
    document.getElementById('memberFormCode').readOnly = isEdit;
    if (isEdit) {
      const m = allMembers.find(item => item.code === code);
      if (m) {
        document.getElementById('memberFormCode').value = m.code;
        document.getElementById('memberFormName').value = m.name || '';
        document.getElementById('memberFormGender').value = m.gender || 'Laki-Laki';
        document.getElementById('memberFormType').value = m.type || 'Siswa';
        document.getElementById('memberFormNote').value = m.note || '';
      }
    }
    document.getElementById('memberModal')?.classList.add('active');
  }
  async function deleteMember(code) {
    const res = await Swal.fire({
      title: 'Hapus Anggota?',
      text: `Yakin ingin menghapus anggota dengan kode ${code}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (res.isConfirmed) {
      await DBLibrary.deleteMember(code);
      Swal.fire('Terhapus', 'Anggota berhasil dihapus.', 'success');
      loadAllDashboardData();
    }
  }
  function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  }
  async function loadAdminProfile() {
    if (!currentAdminId) return;
    try {
      const admin = await DBLibrary.getAdmin(currentAdminId);
      if (!admin) return;
      document.getElementById('adminDisplayNama').textContent = admin.namaLengkap || admin.username;
      document.getElementById('adminDisplayUsername').textContent = admin.username;
      document.getElementById('adminDisplayEmail').textContent = admin.email || '-';
      document.getElementById('updateNamaLengkap').value = admin.namaLengkap || '';
      document.getElementById('updateEmail').value = admin.email || '';
      if (admin.fotoUrl) {
        document.getElementById('adminPhotoPreview').src = admin.fotoUrl;
        document.getElementById('headerAdminPhoto').src = admin.fotoUrl;
      }
    } catch (e) {
      console.error('Error load admin profile:', e);
    }
  }
  function setupAdminEvents() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value.trim();
        const p = document.getElementById('password').value;
        const errDiv = document.getElementById('loginError');
        errDiv.style.display = 'none';
        try {
          const res = await DBLibrary.adminLogin(u, p);
          currentAdminId = res.adminId;
          currentSession = res.sessionToken;
          localStorage.setItem('lib_sessionToken', res.sessionToken);
          localStorage.setItem('lib_adminId', res.adminId);
          localStorage.setItem('lib_adminNama', res.namaLengkap);
          showDashboard();
        } catch (err) {
          errDiv.textContent = err.message || 'Login gagal.';
          errDiv.style.display = 'block';
        }
      });
    }
    document.getElementById('btnTogglePassword')?.addEventListener('click', () => {
      const p = document.getElementById('password');
      const icon = document.getElementById('eyeIcon');
      if (p.type === 'password') {
        p.type = 'text';
        icon.className = 'fas fa-eye-slash';
      } else {
        p.type = 'password';
        icon.className = 'fas fa-eye';
      }
    });
    document.getElementById('btnLogout')?.addEventListener('click', handleLogout);
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(`tab-${target}`)?.classList.add('active');
        document.getElementById('currentTabTitle').textContent = tab.textContent.trim();
        if (target === 'qrgen') renderPrintPreview();
      });
    });
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
      document.getElementById('mainSidebar')?.classList.toggle('active');
    });
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', closeModals);
    });
    document.getElementById('btnResetScan')?.addEventListener('click', resetScannedData);
    document.getElementById('btnManualScan')?.addEventListener('click', () => {
      const code = document.getElementById('manualScanInput')?.value.trim();
      if (code) processScanCode(code);
    });
    document.getElementById('manualScanInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const code = e.target.value.trim();
        if (code) processScanCode(code);
      }
    });
    document.getElementById('btnDirectBorrow')?.addEventListener('click', async () => {
      if (!scannedMember || !scannedBook) return;
      try {
        await DBLibrary.borrowBook({
          memberCode: scannedMember.code,
          bookCode: scannedBook.code,
          durationDays: 7
        });
        Swal.fire('Berhasil', `Peminjaman buku ${scannedBook.title} untuk ${scannedMember.name} berhasil disimpan!`, 'success');
        speak('Peminjaman berhasil disimpan');
        resetScannedData();
        loadAllDashboardData();
      } catch (e) {
        Swal.fire('Gagal', e.message, 'error');
      }
    });
    document.getElementById('btnDirectReturn')?.addEventListener('click', async () => {
      if (!scannedBook) return;
      const activeLoan = allTransactions.find(t => t.bookCode === scannedBook.code && t.status === 'DIPINJAM');
      if (!activeLoan) {
        Swal.fire('Perhatian', 'Tidak ditemukan catatan peminjaman aktif untuk buku ini.', 'warning');
        return;
      }
      openReturnModal(activeLoan.trxNo);
    });
    document.getElementById('btnDirectVisit')?.addEventListener('click', async () => {
      if (!scannedMember) return;
      try {
        await DBLibrary.logVisit({
          memberCode: scannedMember.code,
          memberName: scannedMember.name,
          memberType: scannedMember.type
        });
        Swal.fire('Berhasil', `Kunjungan anggota ${scannedMember.name} berhasil dicatat!`, 'success');
        speak(`Kunjungan atas nama ${scannedMember.name} berhasil dicatat`);
        resetScannedData();
        loadAllDashboardData();
      } catch (e) {
        Swal.fire('Gagal', e.message, 'error');
      }
    });
    document.getElementById('searchTransactionInput')?.addEventListener('input', renderTransactionsTable);
    document.getElementById('filterTransactionStatus')?.addEventListener('change', renderTransactionsTable);
    document.getElementById('btnOpenBorrowModal')?.addEventListener('click', () => {
      document.getElementById('borrowForm')?.reset();
      document.getElementById('borrowModal')?.classList.add('active');
    });
    document.getElementById('borrowForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const memberCode = document.getElementById('borrowMemberCode').value.trim();
      const bookCode = document.getElementById('borrowBookCode').value.trim();
      const durationDays = document.getElementById('borrowDuration').value;
      const notes = document.getElementById('borrowNotes').value.trim();
      try {
        await DBLibrary.borrowBook({ memberCode, bookCode, durationDays, notes });
        Swal.fire('Berhasil', 'Peminjaman berhasil dicatat.', 'success');
        closeModals();
        loadAllDashboardData();
      } catch (err) {
        Swal.fire('Gagal', err.message, 'error');
      }
    });
    document.getElementById('searchMemberInput')?.addEventListener('input', renderMembersTable);
    document.getElementById('filterMemberType')?.addEventListener('change', renderMembersTable);
    document.getElementById('btnOpenMemberModal')?.addEventListener('click', () => openMemberModal(null));
    document.getElementById('memberForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('memberFormCode').value.trim().toUpperCase();
      const name = document.getElementById('memberFormName').value.trim();
      const gender = document.getElementById('memberFormGender').value;
      const type = document.getElementById('memberFormType').value;
      const note = document.getElementById('memberFormNote').value.trim();
      try {
        await DBLibrary.saveMember(code, { name, gender, type, note });
        Swal.fire('Berhasil', 'Data anggota berhasil disimpan.', 'success');
        closeModals();
        loadAllDashboardData();
      } catch (err) {
        Swal.fire('Gagal', err.message, 'error');
      }
    });
    document.getElementById('btnSyncFromMaster')?.addEventListener('click', async () => {
      const res = await Swal.fire({
        title: 'Sinkronisasi Master Data?',
        text: 'Sistem akan memeriksa master data Siswa dan GTK MUSADA di RTDB, lalu menambahkan yang belum ada ke data anggota perpustakaan.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sinkronkan Sekarang',
        cancelButtonText: 'Batal'
      });
      if (res.isConfirmed) {
        Swal.showLoading();
        try {
          const count = await DBLibrary.syncMembersFromMaster();
          Swal.fire('Selesai', `Berhasil menyinkronkan ${count} anggota baru dari database sekolah!`, 'success');
          loadAllDashboardData();
        } catch (e) {
          Swal.fire('Gagal', e.message, 'error');
        }
      }
    });
    document.getElementById('btnOpenRombelModal')?.addEventListener('click', () => {
      const tbody = document.getElementById('rombelTableBody');
      const students = allMembers.filter(m => m.type === 'Siswa');
      if (tbody) {
        tbody.innerHTML = students.map(s => `
          <tr>
            <td><input type="checkbox" class="rombel-check" value="${s.code}"></td>
            <td><strong>${s.code}</strong></td>
            <td>${s.name}</td>
            <td>${s.note || '-'}</td>
          </tr>
        `).join('');
      }
      document.getElementById('rombelModal')?.classList.add('active');
    });
    document.getElementById('selectAllRombel')?.addEventListener('change', (e) => {
      document.querySelectorAll('.rombel-check').forEach(cb => cb.checked = e.target.checked);
    });
    document.getElementById('searchRombelInput')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#rombelTableBody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
      });
    });
    document.getElementById('rombelForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const selected = Array.from(document.querySelectorAll('.rombel-check:checked')).map(cb => cb.value);
      const newClass = document.getElementById('rombelNewClass').value.trim();
      if (!selected.length) {
        Swal.fire('Perhatian', 'Pilih minimal satu siswa.', 'warning');
        return;
      }
      try {
        await DBLibrary.bulkUpdateMemberNote(selected, newClass);
        Swal.fire('Berhasil', `Berhasil menaikkan kelas untuk ${selected.length} siswa menjadi ${newClass}!`, 'success');
        closeModals();
        loadAllDashboardData();
      } catch (err) {
        Swal.fire('Gagal', err.message, 'error');
      }
    });
    document.getElementById('searchBookAdminInput')?.addEventListener('input', renderBooksTable);
    document.getElementById('filterBookCategory')?.addEventListener('change', renderBooksTable);
    document.getElementById('btnOpenBookModal')?.addEventListener('click', () => openBookModal(null));
    document.getElementById('bookFormIsEbook')?.addEventListener('change', (e) => {
      document.getElementById('ebookUrlGroup').style.display = e.target.checked ? 'block' : 'none';
    });
    document.getElementById('bookForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isEdit = document.getElementById('bookFormIsEdit').value === '1';
      const code = document.getElementById('bookFormCode').value.trim().toUpperCase();
      const shelfCode = document.getElementById('bookFormShelf').value.trim();
      const title = document.getElementById('bookFormTitle').value.trim();
      const author = document.getElementById('bookFormAuthor').value.trim();
      const publisher = document.getElementById('bookFormPublisher').value.trim();
      const year = document.getElementById('bookFormYear').value.trim();
      const stock = parseInt(document.getElementById('bookFormStock').value, 10) || 1;
      const category = document.getElementById('bookFormCategory').value.trim() || 'Umum';
      const isEbook = document.getElementById('bookFormIsEbook').checked;
      const ebookUrl = document.getElementById('bookFormEbookUrl').value.trim();
      const existing = allBooks.find(b => b.code === code);
      const stockAvail = isEdit && existing ? Math.min(existing.stockAvailable, stock) : stock;
      try {
        await DBLibrary.saveBook(code, {
          shelfCode,
          title,
          author,
          publisher,
          year,
          stockAvailable: stockAvail,
          stockTotal: stock,
          category,
          isEbook,
          ebookUrl
        });
        Swal.fire('Berhasil', 'Koleksi buku berhasil disimpan.', 'success');
        closeModals();
        loadAllDashboardData();
      } catch (err) {
        Swal.fire('Gagal', err.message, 'error');
      }
    });
    document.querySelectorAll('input[name="printType"]').forEach(r => {
      r.addEventListener('change', renderPrintPreview);
    });
    document.getElementById('btnPrintSelected')?.addEventListener('click', () => {
      window.print();
    });
    document.getElementById('searchVisitInput')?.addEventListener('input', renderVisitsTable);
    document.getElementById('filterVisitDate')?.addEventListener('change', renderVisitsTable);
    document.getElementById('updateProfileForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const namaLengkap = document.getElementById('updateNamaLengkap').value.trim();
      const email = document.getElementById('updateEmail').value.trim();
      try {
        await DBLibrary.updateAdminProfile(currentAdminId, { namaLengkap, email });
        localStorage.setItem('lib_adminNama', namaLengkap);
        Swal.fire('Berhasil', 'Profil berhasil diperbarui.', 'success');
        loadAdminProfile();
      } catch (e) {
        Swal.fire('Gagal', e.message, 'error');
      }
    });
    document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const oldP = document.getElementById('oldPassword').value;
      const newP = document.getElementById('newPassword').value;
      const confirmP = document.getElementById('confirmPassword').value;
      if (newP !== confirmP) {
        Swal.fire('Perhatian', 'Password baru tidak cocok.', 'warning');
        return;
      }
      try {
        await DBLibrary.updateAdminPassword(currentAdminId, oldP, newP);
        Swal.fire('Berhasil', 'Password admin berhasil diubah.', 'success');
        document.getElementById('changePasswordForm').reset();
      } catch (e) {
        Swal.fire('Gagal', e.message, 'error');
      }
    });
    document.getElementById('photoUpload')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const b64 = evt.target.result;
        try {
          await DBLibrary.updateAdminProfile(currentAdminId, { fotoUrl: b64 });
          Swal.fire('Berhasil', 'Foto profil berhasil diperbarui.', 'success');
          loadAdminProfile();
        } catch (err) {
          Swal.fire('Gagal', err.message, 'error');
        }
      };
      reader.readAsDataURL(file);
    });
  }
  function renderPrintPreview() {
    const container = document.getElementById('printPreviewContainer');
    if (!container) return;
    const type = document.querySelector('input[name="printType"]:checked')?.value || 'member';
    if (type === 'member') {
      container.innerHTML = allMembers.map(m => `
        <div class="print-card" style="border:2px dashed #CBD5E1; padding:16px; border-radius:12px; background:#FFFFFF; text-align:center; page-break-inside:avoid; margin-bottom:14px;">
          <div style="font-size:12px; font-weight:800; color:#1D4ED8; text-transform:uppercase;">KARTU ANGGOTA PERPUSTAKAAN</div>
          <div style="font-size:11px; color:#64748B; margin-bottom:8px;">SD Muhammadiyah 1 Sedati</div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(m.code)}" alt="QR ${m.code}" style="width:90px; height:90px; margin:0 auto 8px; display:block;">
          <div style="font-size:14px; font-weight:800; color:#0F172A;">${m.name}</div>
          <div style="font-size:12px; font-weight:700; color:#2563EB;">${m.code}</div>
          <div style="font-size:11px; color:#475569;">${m.type} • ${m.note || '-'}</div>
        </div>
      `).join('');
    } else {
      container.innerHTML = allBooks.map(b => `
        <div class="print-card" style="border:1px solid #CBD5E1; padding:12px; border-radius:8px; background:#FFFFFF; text-align:center; page-break-inside:avoid; margin-bottom:12px;">
          <div style="font-size:11px; font-weight:700; color:#1E293B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${b.title}</div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(b.code)}" alt="QR ${b.code}" style="width:75px; height:75px; margin:4px auto; display:block;">
          <div style="font-size:12px; font-weight:800; color:#1E40AF;">${b.code}</div>
          <div style="font-size:11px; color:#64748B;">Rak: <strong>${b.shelfCode}</strong> | ${b.category}</div>
        </div>
      `).join('');
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    startClocks();
    setupAdminEvents();
    const token = localStorage.getItem('lib_sessionToken');
    const adminId = localStorage.getItem('lib_adminId');
    if (token && adminId) {
      currentAdminId = adminId;
      currentSession = token;
      showDashboard();
    }
  });
})();
