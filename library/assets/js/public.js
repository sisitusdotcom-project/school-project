(function(){
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.startsWith('admin-perpus') || hostname.startsWith('adm.perpus')) {
    window.location.replace('admin/');
    return;
  }
  let allBooks = [];
  let currentCollectionType = 'all';
  let currentCategory = 'all';
  let searchQuery = '';
  let activeBook = null;
  let activeFlipbookInstance = null;
  function showToast(message, type = 'info') {
    const toast = document.getElementById('publicToast');
    if (!toast) return;
    toast.innerText = message;
    toast.style.borderLeftColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#2563EB';
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3500);
  }
  function bunyikanSalam(nama) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Selamat datang di MUSADA Library, ${nama}`);
      u.lang = 'id-ID';
      u.rate = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang === 'id-ID');
      if (idVoice) u.voice = idVoice;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  async function loadLibraryData() {
    try {
      const [books, stats, settings] = await Promise.all([
        DBLibrary.getBooks(),
        DBLibrary.getStatistics(),
        DBLibrary.getSettings()
      ]);
      allBooks = books;
      renderStats(stats);
      renderSettings(settings);
      renderCategoryPills();
      filterAndRenderBooks();
    } catch (err) {
      console.error('Load library error:', err);
    }
  }
  function renderStats(stats) {
    const physicalBooks = allBooks.filter(b => !b.isEbook);
    const ebookBooks = allBooks.filter(b => b.isEbook);
    const elTotal = document.getElementById('statTotalBuku');
    const elStok = document.getElementById('statStokTersedia');
    const elEbook = document.getElementById('statEbookCount');
    const elVisits = document.getElementById('statVisitsToday');
    if (elTotal) elTotal.innerText = physicalBooks.length || (stats.totalBuku || 0);
    if (elStok) {
      const availablePhysical = physicalBooks.reduce((acc, b) => acc + (parseInt(b.stockAvailable, 10) || 0), 0);
      elStok.innerText = availablePhysical || (stats.stokTersedia || 0);
    }
    if (elEbook) elEbook.innerText = ebookBooks.length || 0;
    if (elVisits) elVisits.innerText = stats.visitsToday || 0;
    const badgeAll = document.getElementById('badgeCountAll');
    const badgePhys = document.getElementById('badgeCountPhysical');
    const badgeEb = document.getElementById('badgeCountEbook');
    if (badgeAll) badgeAll.innerText = allBooks.length;
    if (badgePhys) badgePhys.innerText = physicalBooks.length;
    if (badgeEb) badgeEb.innerText = ebookBooks.length;
  }
  function renderSettings(settings) {
    const hoursEl = document.getElementById('libSettingsHours');
    if (hoursEl && settings.openHours) hoursEl.innerText = settings.openHours;
  }
  function renderCategoryPills() {
    const container = document.getElementById('categoryPills');
    if (!container) return;
    let pool = allBooks;
    if (currentCollectionType === 'physical') {
      pool = allBooks.filter(b => !b.isEbook);
    } else if (currentCollectionType === 'ebook') {
      pool = allBooks.filter(b => b.isEbook);
    }
    const categories = ['Semua', ...new Set(pool.map(b => b.category).filter(Boolean))];
    container.innerHTML = categories.map(cat => {
      const isAll = cat === 'Semua';
      const key = isAll ? 'all' : cat;
      const activeClass = currentCategory === key ? 'active' : '';
      return `<button type="button" class="pill-btn ${activeClass}" data-category="${key}">${cat}</button>`;
    }).join('');
    container.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        filterAndRenderBooks();
      });
    });
  }
  function filterAndRenderBooks() {
    const container = document.getElementById('booksGrid');
    if (!container) return;
    let filtered = allBooks;
    if (currentCollectionType === 'physical') {
      filtered = filtered.filter(b => !b.isEbook);
    } else if (currentCollectionType === 'ebook') {
      filtered = filtered.filter(b => b.isEbook);
    }
    if (currentCategory && currentCategory !== 'all') {
      filtered = filtered.filter(b => b.category === currentCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b => {
        return (b.title && b.title.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.code && b.code.toLowerCase().includes(q)) ||
          (b.shelfCode && b.shelfCode.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q)) ||
          (b.publisher && b.publisher.toLowerCase().includes(q));
      });
    }
    if (!filtered.length) {
      container.innerHTML = `<div class="grid-full-col"><i class="fas fa-search"></i>Tidak ada koleksi buku yang cocok dengan pencarian Anda.</div>`;
      return;
    }
    container.innerHTML = filtered.map(b => {
      if (b.isEbook) {
        const coverHtml = b.coverUrl
          ? `<img src="${b.coverUrl}" alt="${b.title}" class="book-cover-img" loading="lazy">`
          : `<i class="fas fa-tablet-alt book-cover-placeholder"></i>`;
        return `
          <article class="book-card is-ebook">
            <div class="book-cover-wrap">
              <span class="badge-ebook-tag"><i class="fas fa-bolt"></i> E-Book</span>
              <span class="badge-pages-tag"><i class="fas fa-layer-group"></i> 3D Flipbook</span>
              ${coverHtml}
            </div>
            <div class="book-body">
              <span class="book-category">${b.category || 'E-Book Digital'}</span>
              <h4 class="book-title" title="${b.title}">${b.title}</h4>
              <p class="book-author"><i class="fas fa-feather-alt"></i> ${b.author || 'Anonim'} (${b.year || '-'})</p>
              <div class="book-footer">
                <button type="button" class="btn-read-flip" data-code="${b.code}"><i class="fas fa-book-reader"></i> Baca Flipbook</button>
                <button type="button" class="btn-view-book" data-code="${b.code}"><i class="fas fa-info-circle"></i> Detail</button>
              </div>
            </div>
          </article>
        `;
      }
      const isAvail = (parseInt(b.stockAvailable, 10) > 0);
      const stockText = isAvail ? `Tersedia: ${b.stockAvailable} eks` : 'Sedang Dipinjam';
      const dotClass = isAvail ? 'avail' : 'empty';
      const coverHtml = b.coverUrl
        ? `<img src="${b.coverUrl}" alt="${b.title}" class="book-cover-img" loading="lazy">`
        : `<i class="fas fa-book book-cover-placeholder"></i>`;
      return `
        <article class="book-card is-physical">
          <div class="book-cover-wrap">
            <span class="badge-shelf"><i class="fas fa-archive"></i> Rak ${b.shelfCode || '-'}</span>
            ${coverHtml}
          </div>
          <div class="book-body">
            <span class="book-category">${b.category || 'Koleksi Rak'}</span>
            <h4 class="book-title" title="${b.title}">${b.title}</h4>
            <p class="book-author"><i class="fas fa-feather-alt"></i> ${b.author || 'Anonim'} (${b.year || '-'})</p>
            <div class="book-footer">
              <span class="stock-indicator"><span class="stock-dot ${dotClass}"></span>${stockText}</span>
              <div class="book-action-group">
                <button type="button" class="btn-loan-book" data-code="${b.code}" ${isAvail ? '' : 'disabled'}><i class="fas fa-bookmark"></i> Pinjam</button>
                <button type="button" class="btn-view-book" data-code="${b.code}"><i class="fas fa-info-circle"></i> Info</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
    container.querySelectorAll('.btn-view-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const b = allBooks.find(item => item.code === code);
        if (b) openBookDetailModal(b);
      });
    });
    container.querySelectorAll('.btn-read-flip').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const b = allBooks.find(item => item.code === code);
        if (b) openFlipbookViewer(b);
      });
    });
    container.querySelectorAll('.btn-loan-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const b = allBooks.find(item => item.code === code);
        if (b) openLoanRequestModal(b);
      });
    });
  }
  function openBookDetailModal(book) {
    activeBook = book;
    const modal = document.getElementById('bookDetailModal');
    if (!modal) return;
    document.getElementById('modalBookTitle').innerText = book.title;
    document.getElementById('modalBookCategory').innerText = book.category || 'Koleksi Umum';
    document.getElementById('modalBookAuthor').innerText = book.author || '-';
    document.getElementById('modalBookPublisher').innerText = book.publisher || '-';
    document.getElementById('modalBookYear').innerText = book.year || '-';
    document.getElementById('modalBookShelf').innerText = book.isEbook ? 'Digital (Akses Online)' : (book.shelfCode || '-');
    document.getElementById('modalBookCode').innerText = book.code || '-';
    document.getElementById('modalBookStock').innerText = book.isEbook ? 'Tersedia Digital (Akses Online)' : `${book.stockAvailable} dari ${book.stockTotal} eksemplar`;
    document.getElementById('modalBookDesc').innerText = book.description || 'Buku ini tersedia di MUSADA Library SD Muhammadiyah 1 Sedati.';
    const btnRead = document.getElementById('btnReadEbook');
    const btnReserve = document.getElementById('btnReserveBook');
    if (btnRead) {
      if (book.isEbook) {
        btnRead.classList.remove('pane-hidden');
        btnRead.onclick = () => {
          closeAllModals();
          openFlipbookViewer(book);
        };
      } else {
        btnRead.classList.add('pane-hidden');
      }
    }
    if (btnReserve) {
      if (book.isEbook) {
        btnReserve.classList.add('pane-hidden');
      } else {
        btnReserve.classList.remove('pane-hidden');
        btnReserve.disabled = parseInt(book.stockAvailable, 10) < 1;
        btnReserve.onclick = () => {
          closeAllModals();
          openLoanRequestModal(book);
        };
      }
    }
    modal.classList.add('active');
  }
  function openLoanRequestModal(book) {
    activeBook = book;
    const modal = document.getElementById('loanRequestModal');
    if (!modal) return;
    document.getElementById('loanBookCode').value = book.code;
    document.getElementById('loanPreviewTitle').innerText = book.title;
    document.getElementById('loanPreviewCode').innerText = book.code;
    document.getElementById('loanPreviewShelf').innerText = 'Rak ' + (book.shelfCode || '-');
    document.getElementById('loanPreviewAuthor').innerText = book.author || 'Anonim';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('loanPickupDate');
    if (dateInput) {
      dateInput.value = tomorrow.toISOString().slice(0, 10);
      dateInput.min = new Date().toISOString().slice(0, 10);
    }
    updateHandoverUI();
    modal.classList.add('active');
  }
  function updateHandoverUI() {
    const bTypeSelect = document.getElementById('loanBorrowerType');
    const bType = bTypeSelect ? bTypeSelect.value : 'Wali';
    const grpHandover = document.getElementById('groupHandoverMethod');
    const grpStudent = document.getElementById('groupStudentDetails');
    const noticeText = document.getElementById('loanNoticeText');
    const radioEntrusted = document.querySelector('input[name="handoverMethodRadio"][value="entrusted"]');
    const isEntrusted = radioEntrusted ? radioEntrusted.checked : true;
    if (bType === 'Wali') {
      if (grpHandover) grpHandover.classList.remove('pane-hidden');
      if (grpStudent) grpStudent.classList.remove('pane-hidden');
      if (noticeText) {
        noticeText.innerText = isEntrusted
          ? 'Buku fisik yang dipinjam akan disiapkan oleh petugas perpustakaan dan dititipkan kepada Ananda melalui wali kelas pada hari belajar berikutnya.'
          : 'Bapak/Ibu dapat datang langsung mengambil buku ke meja sirkulasi perpustakaan sekolah pada jam kerja dengan menyebutkan kode pengajuan.';
      }
    } else if (bType === 'Siswa') {
      if (grpHandover) grpHandover.classList.add('pane-hidden');
      if (grpStudent) grpStudent.classList.remove('pane-hidden');
      if (noticeText) {
        noticeText.innerText = 'Siswa dapat mengambil buku langsung di perpustakaan pada jam istirahat atau saat pulang sekolah.';
      }
    } else if (bType === 'GTK') {
      if (grpHandover) grpHandover.classList.add('pane-hidden');
      if (grpStudent) grpStudent.classList.add('pane-hidden');
      if (noticeText) {
        noticeText.innerText = 'Buku dapat diambil di perpustakaan atau diantarkan ke ruang guru oleh pustakawan.';
      }
    } else {
      if (grpHandover) grpHandover.classList.add('pane-hidden');
      if (grpStudent) grpStudent.classList.add('pane-hidden');
      if (noticeText) {
        noticeText.innerText = 'Masyarakat umum / tamu dipersilakan mengambil buku langsung ke meja sirkulasi perpustakaan dengan menunjukkan kartu identitas diri.';
      }
    }
  }
  function onFlipbookKeyDown(e) {
    if (!activeFlipbookInstance) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      if (typeof activeFlipbookInstance.nextPage === 'function') activeFlipbookInstance.nextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      if (typeof activeFlipbookInstance.prevPage === 'function') activeFlipbookInstance.prevPage();
    } else if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (e.shiftKey) {
        if (typeof activeFlipbookInstance.prevPage === 'function') activeFlipbookInstance.prevPage();
      } else {
        if (typeof activeFlipbookInstance.nextPage === 'function') activeFlipbookInstance.nextPage();
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (typeof activeFlipbookInstance.firstPage === 'function') activeFlipbookInstance.firstPage();
    } else if (e.key === 'End') {
      e.preventDefault();
      if (typeof activeFlipbookInstance.lastPage === 'function') activeFlipbookInstance.lastPage();
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      if (typeof activeFlipbookInstance.zoomIn === 'function') activeFlipbookInstance.zoomIn();
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      if (typeof activeFlipbookInstance.zoomOut === 'function') activeFlipbookInstance.zoomOut();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeFlipbookViewer();
    }
  }
  function openFlipbookViewer(book) {
    const modal = document.getElementById('flipbookModal');
    const stage = document.getElementById('flipbookStage');
    const titleEl = document.getElementById('flipbookBookTitle');
    if (!modal || !stage) return;
    if (titleEl) titleEl.innerText = book.title;
    stage.innerHTML = '<div id="dfBookContainer"></div>';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
        const isMobileScreen = window.innerWidth <= 768;
    const pdfUrl = book.ebookUrl || 'buku-perpus/pedoman-hidup-islami-warga-muhammadiyah.pdf';
    const fbOptions = {
      pdfUrl: pdfUrl,
      backgroundColor: '#1E242B',
      skin: 'dark',
      skinColor: '#F8FAFC',
      skinBackground: '#0F172A',
      btnColor: '#F8FAFC',
      btnColorHover: '#38BDF8',
      viewMode: '3d',
      singlePageMode: isMobileScreen,
      singlePageModeIfMobile: true,
      responsiveView: true,
      responsiveViewTreshold: 768,
      touchSwipeEnabled: true,
      sideNavigationButtons: true,
      pageFlipDuration: 0.7,
      pdfBrowserViewerIfMobile: false,
      pdfPageScale: 1.5,
      sound: false,
      assets: {
        preloader: 'assets/vendor/flipbook/images/preloader.jpg',
        overlay: 'assets/vendor/flipbook/images/overlay.png'
      },
      btnOrder: [
        'btnPrev',
        'currentPage',
        'btnNext',
        'btnZoomIn',
        'btnZoomOut',
        'btnThumbs',
        'btnExpand'
      ],
      currentPage: {
        enabled: true,
        title: 'Nomor Halaman',
        vAlign: 'bottom',
        hAlign: 'center'
      },
      btnPrev: {
        enabled: true,
        title: 'Halaman Sebelumnya',
        vAlign: 'bottom',
        hAlign: 'center'
      },
      btnNext: {
        enabled: true,
        title: 'Halaman Selanjutnya',
        vAlign: 'bottom',
        hAlign: 'center'
      },
      btnZoomIn: {
        enabled: true,
        title: 'Perbesar',
        vAlign: 'bottom',
        hAlign: 'center'
      },
      btnZoomOut: {
        enabled: true,
        title: 'Perkecil',
        vAlign: 'bottom',
        hAlign: 'center'
      },
      btnThumbs: {
        enabled: true,
        title: 'Semua Halaman',
        vAlign: 'bottom',
        hAlign: 'center'
      },
      btnExpand: {
        enabled: true,
        title: 'Layar Penuh',
        vAlign: 'bottom',
        hAlign: 'center'
      },
      btnFirst: {
        enabled: false
      },
      btnLast: {
        enabled: false
      },
      btnAutoplay: {
        enabled: false
      },
      btnBookmark: {
        enabled: false
      },
      btnToc: {
        enabled: false
      },
      btnSound: {
        enabled: false
      },
      btnDownloadPdf: {
        enabled: false
      },
      btnDownloadPages: {
        enabled: false
      },
      btnPrint: {
        enabled: false
      },
      btnShare: {
        enabled: false
      },
      btnSelect: {
        enabled: false
      }
    };
    try {
      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.flipBook) {
        activeFlipbookInstance = window.jQuery('#dfBookContainer').flipBook(fbOptions);
      } else {
        stage.innerHTML = `<iframe src="${pdfUrl}" class="flipbook-fallback-frame"></iframe>`;
      }
    } catch (e) {
      stage.innerHTML = `<iframe src="${pdfUrl}" class="flipbook-fallback-frame"></iframe>`;
    }
    window.removeEventListener('keydown', onFlipbookKeyDown);
    window.addEventListener('keydown', onFlipbookKeyDown);
  }
  function closeFlipbookViewer() {
    window.removeEventListener('keydown', onFlipbookKeyDown);
    const modal = document.getElementById('flipbookModal');
    const stage = document.getElementById('flipbookStage');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    if (activeFlipbookInstance && activeFlipbookInstance.autoplay && typeof activeFlipbookInstance.toggleAutoplay === 'function') {
      try {
        activeFlipbookInstance.toggleAutoplay();
      } catch (e) {}
    }
    if (stage) stage.innerHTML = '';
    activeFlipbookInstance = null;
  }
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    closeFlipbookViewer();
  }
  function setupEventListeners() {
    const collTabs = document.querySelectorAll('.collection-tab-btn');
    collTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        collTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCollectionType = btn.dataset.type;
        currentCategory = 'all';
        renderCategoryPills();
        filterAndRenderBooks();
      });
    });
    const searchInput = document.getElementById('searchBookInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        filterAndRenderBooks();
      });
    }
    const mobileToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('publicNavMenu');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });
    const btnCloseFb = document.getElementById('btnCloseFlipbook');
    if (btnCloseFb) {
      btnCloseFb.addEventListener('click', closeFlipbookViewer);
    }
    const btnCloseSuc = document.getElementById('btnCloseSuccess');
    if (btnCloseSuc) {
      btnCloseSuc.addEventListener('click', closeAllModals);
    }
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        closeAllModals();
      }
    });
    const bTypeSelect = document.getElementById('loanBorrowerType');
    if (bTypeSelect) {
      bTypeSelect.addEventListener('change', updateHandoverUI);
    }
    const optEntrusted = document.getElementById('optHandoverEntrusted');
    const optDirect = document.getElementById('optHandoverDirect');
    const radEntrusted = document.querySelector('input[name="handoverMethodRadio"][value="entrusted"]');
    const radDirect = document.querySelector('input[name="handoverMethodRadio"][value="direct"]');
    if (optEntrusted && optDirect) {
      optEntrusted.addEventListener('click', () => {
        optEntrusted.classList.add('selected');
        optDirect.classList.remove('selected');
        if (radEntrusted) radEntrusted.checked = true;
        updateHandoverUI();
      });
      optDirect.addEventListener('click', () => {
        optDirect.classList.add('selected');
        optEntrusted.classList.remove('selected');
        if (radDirect) radDirect.checked = true;
        updateHandoverUI();
      });
    }
    const loanMemberCodeInput = document.getElementById('loanMemberCode');
    if (loanMemberCodeInput) {
      loanMemberCodeInput.addEventListener('change', async () => {
        const code = loanMemberCodeInput.value.trim().toUpperCase();
        if (!code) return;
        try {
          const m = await DBLibrary.getMember(code);
          if (m) {
            const borrowerNameInput = document.getElementById('loanBorrowerName');
            const studentNameInput = document.getElementById('loanStudentName');
            const studentClassInput = document.getElementById('loanStudentClass');
            if (m.type === 'Siswa') {
              if (studentNameInput) studentNameInput.value = m.name;
              if (studentClassInput && m.note) studentClassInput.value = m.note;
              if (borrowerNameInput && !borrowerNameInput.value) borrowerNameInput.value = m.name;
            } else {
              if (borrowerNameInput) borrowerNameInput.value = m.name;
            }
            showToast(`Data anggota ditemukan: ${m.name}`, 'success');
          }
        } catch (e) {}
      });
    }
    const loanForm = document.getElementById('loanRequestForm');
    if (loanForm) {
      loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btnSubmitLoan');
        const origText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim Pengajuan...';
        try {
          const bookCode = document.getElementById('loanBookCode').value;
          const book = allBooks.find(b => b.code === bookCode) || activeBook || {};
          const borrowerType = document.getElementById('loanBorrowerType').value;
          const borrowerName = document.getElementById('loanBorrowerName').value.trim();
          const phone = document.getElementById('loanBorrowerPhone').value.trim();
          const memberCode = (document.getElementById('loanMemberCode')?.value || '').trim();
          const studentName = (document.getElementById('loanStudentName')?.value || '').trim();
          const studentClass = (document.getElementById('loanStudentClass')?.value || '').trim();
          const pickupDate = document.getElementById('loanPickupDate').value;
          const notes = (document.getElementById('loanNotes')?.value || '').trim();
          let handoverMethod = 'direct';
          if (borrowerType === 'Wali') {
            const rad = document.querySelector('input[name="handoverMethodRadio"]:checked');
            handoverMethod = rad ? rad.value : 'entrusted';
          }
          const res = await DBLibrary.submitLoanRequest({
            bookCode: book.code,
            bookTitle: book.title,
            shelfCode: book.shelfCode || '-',
            borrowerType,
            borrowerName,
            phone,
            memberCode,
            studentName,
            studentClass,
            pickupDate,
            handoverMethod,
            notes
          });
          closeAllModals();
          const modalSuccess = document.getElementById('loanSuccessModal');
          const receiptEl = document.getElementById('receiptReqId');
          const summaryEl = document.getElementById('receiptSummary');
          const instructionsEl = document.getElementById('receiptInstructions');
          const btnWa = document.getElementById('btnWaConfirm');
          if (receiptEl) receiptEl.innerText = res.id;
          if (summaryEl) {
            summaryEl.innerText = `Buku "${book.title}" berhasil diajukan untuk ${borrowerName}.`;
          }
          if (instructionsEl) {
            if (handoverMethod === 'entrusted') {
              instructionsEl.innerHTML = `
                <li>Kode Pengajuan: <strong>${res.id}</strong></li>
                <li>Metode: <strong>Dititipkan ke Ananda</strong> (${studentName || borrowerName} - ${studentClass || 'Siswa'})</li>
                <li>Petugas perpustakaan akan menyiapkan buku dan menyerahkannya melalui wali kelas pada hari belajar berikutnya.</li>
                <li>Masa pinjam berlaku 7 hari sejak buku diterima.</li>
              `;
            } else {
              instructionsEl.innerHTML = `
                <li>Kode Pengajuan: <strong>${res.id}</strong></li>
                <li>Metode: <strong>Datang Langsung ke Perpustakaan</strong></li>
                <li>Silakan tunjukkan kode pengajuan ini kepada petugas perpustakaan di meja sirkulasi pada tanggal ${pickupDate}.</li>
                <li>Masa pinjam berlaku 7 hari sejak pengambilan buku.</li>
              `;
            }
          }
          if (btnWa) {
            const waMsg = encodeURIComponent(`Halo Petugas Perpustakaan MUSADA,\nSaya telah mengajukan peminjaman buku via website:\n\n*No. Pengajuan:* ${res.id}\n*Buku:* ${book.title} (${book.code})\n*Pemohon:* ${borrowerName} (${borrowerType})\n*Metode:* ${handoverMethod === 'entrusted' ? 'Dititipkan ke Ananda (' + (studentName || borrowerName) + ' - ' + studentClass + ')' : 'Datang Langsung'}\n*Tgl Rencana:* ${pickupDate}\n\nMohon bantuannya untuk diproses. Terima kasih!`);
            btnWa.href = `https://wa.me/6285704845822?text=${waMsg}`;
          }
          if (modalSuccess) modalSuccess.classList.add('active');
          showToast('Pengajuan peminjaman berhasil dikirimkan!', 'success');
          loanForm.reset();
        } catch (err) {
          showToast(`Gagal mengajukan peminjaman: ${err.message}`, 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }
      });
    }
    const guestForm = document.getElementById('guestbookForm');
    if (guestForm) {
      const memberCodeInput = document.getElementById('guestMemberCode');
      const memberNameInput = document.getElementById('guestMemberName');
      const memberTypeSelect = document.getElementById('guestMemberType');
      if (memberCodeInput) {
        memberCodeInput.addEventListener('change', async () => {
          const code = memberCodeInput.value.trim().toUpperCase();
          if (!code) return;
          try {
            const m = await DBLibrary.getMember(code);
            if (m) {
              if (memberNameInput) memberNameInput.value = m.name;
              if (memberTypeSelect) memberTypeSelect.value = m.type;
              showToast(`Data anggota ditemukan: ${m.name}`, 'success');
            }
          } catch (e) {}
        });
      }
      guestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = guestForm.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencatat Kunjungan...';
        try {
          const memberCode = (memberCodeInput ? memberCodeInput.value : '').trim().toUpperCase();
          const memberName = (memberNameInput ? memberNameInput.value : '').trim();
          const memberType = memberTypeSelect ? memberTypeSelect.value : 'Umum';
          const purpose = (document.getElementById('guestPurpose')?.value || 'Membaca Buku').trim();
          await DBLibrary.logVisit({ memberCode, memberName, memberType, purpose });
          showToast('Kunjungan Anda berhasil dicatat. Selamat membaca!', 'success');
          bunyikanSalam(memberName || 'Pengunjung');
          guestForm.reset();
          const stats = await DBLibrary.getStatistics();
          renderStats(stats);
        } catch (err) {
          showToast(`Gagal mencatat kunjungan: ${err.message}`, 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }
      });
    }
    const donationTabs = document.querySelectorAll('.donation-tab-btn');
    const paneBuku = document.getElementById('paneDonasiBuku');
    const paneDana = document.getElementById('paneDonasiDana');
    donationTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        donationTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        if (tab === 'buku') {
          if (paneBuku) paneBuku.classList.remove('pane-hidden');
          if (paneDana) paneDana.classList.add('pane-hidden');
        } else {
          if (paneBuku) paneBuku.classList.add('pane-hidden');
          if (paneDana) paneDana.classList.remove('pane-hidden');
        }
      });
    });
    const formBuku = document.getElementById('formDonasiBuku');
    if (formBuku) {
      formBuku.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formBuku.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim Formulir...';
        try {
          const donorName = document.getElementById('donaturBukuName').value.trim();
          const phone = document.getElementById('donaturBukuPhone').value.trim();
          const email = document.getElementById('donaturBukuEmail').value.trim();
          const bookCount = document.getElementById('donaturBukuCount').value.trim();
          const bookTitles = document.getElementById('donaturBukuTitles').value.trim();
          const notes = document.getElementById('donaturBukuNotes').value.trim();
          await DBLibrary.submitDonation({
            type: 'buku',
            donorName,
            phone,
            email,
            bookCount,
            bookTitles,
            notes
          });
          showToast('Terima kasih! Formulir donasi buku Anda berhasil dikirimkan.', 'success');
          formBuku.reset();
        } catch (err) {
          showToast(`Gagal mengirim donasi: ${err.message}`, 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = orig;
        }
      });
    }
    const formDana = document.getElementById('formDonasiDana');
    if (formDana) {
      formDana.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = formDana.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim Konfirmasi...';
        try {
          const donorName = document.getElementById('donaturDanaName').value.trim();
          const phone = document.getElementById('donaturDanaPhone').value.trim();
          const amount = document.getElementById('donaturDanaAmount').value.trim();
          const notes = document.getElementById('donaturDanaNotes').value.trim();
          await DBLibrary.submitDonation({
            type: 'dana',
            donorName,
            phone,
            amount,
            notes
          });
          showToast('Alhamdulillah, konfirmasi donasi dana Anda telah diterima.', 'success');
          formDana.reset();
        } catch (err) {
          showToast(`Gagal mengirim konfirmasi donasi: ${err.message}`, 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = orig;
        }
      });
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadLibraryData();
  });
})();