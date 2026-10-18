(function(){
  let allBooks = [];
  let currentCollectionType = 'all';
  let currentCategory = 'all';
  let searchQuery = '';
  let activeBook = null;
  let activeFlipbookInstance = null;
  let displayedLimit = 24;
  const BATCH_SIZE = 24;
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
  function normalizeCategory(raw) {
    if (!raw) return 'Koleksi Umum';
    const s = raw.trim();
    const lower = s.toLowerCase();
    if (lower.includes('dongeng')) return 'Dongeng Anak';
    if (lower.includes('komik')) return 'Komik Anak';
    if (lower.includes('cerita islami') || lower.includes('e-book islami') || lower.includes('fikih') || lower.includes('ensiklopedia anak islami')) return 'Cerita & Buku Islami';
    if (lower.includes('cerita anak')) return 'Cerita Anak';
    if (lower.includes('nonfiksi') || lower.includes('non-fiksi')) return 'Nonfiksi Edukatif';
    if (lower.includes('majalah')) return 'Majalah Anak';
    if (lower.includes('novel')) return 'Novel Anak';
    if (lower.includes('muhammadiyah')) return 'Kemuhammadiyahan';
    if (lower.includes('guru') || lower.includes('pendidikan') || lower.includes('modul')) return 'Pendidikan & Guru';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function getThemeClassByCategory(cat) {
    const c = (cat || '').toLowerCase();
    if (c.includes('islam') || c.includes('muhammadiyah')) return 'cover-theme-islam';
    if (c.includes('dongeng') || c.includes('cerita')) return 'cover-theme-story';
    if (c.includes('komik')) return 'cover-theme-comic';
    if (c.includes('nonfiksi') || c.includes('pendidikan') || c.includes('modul')) return 'cover-theme-edu';
    return 'cover-theme-default';
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
      renderCategoryFilters();
      filterAndRenderBooks();
    } catch (err) {
      console.error('Load library error:', err);
      const container = document.getElementById('booksGrid');
      if (container) {
        container.innerHTML = `<div class="grid-full-col"><i class="fas fa-exclamation-triangle"></i>Gagal memuat katalog buku dari database. Silakan muat ulang halaman.</div>`;
      }
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
    const waText = document.getElementById('footerWaText');
    const waLink = document.getElementById('libContactWaLink');
    if (settings.contactWa) {
      const cleanWa = settings.contactWa.replace(/[^0-9]/g, '');
      if (waText) waText.innerText = '+' + cleanWa;
      if (waLink) waLink.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent('Halo Pustakawan MUSADA Library, saya ingin konsultasi mengenai layanan perpustakaan...')}`;
    }
    renderDonationAccounts(settings.donationAccounts, settings.contactWa);
  }
  function renderDonationAccounts(accounts, contactWa) {
    const container = document.getElementById('donationAccountsContainer');
    if (!container) return;
    const cleanWa = (contactWa || '6285704845822').replace(/[^0-9]/g, '');
    const validAccounts = Array.isArray(accounts) && accounts.filter(a => a && a.number && a.number.length >= 6);
    if (validAccounts && validAccounts.length > 0) {
      container.innerHTML = `
        <div class="bank-grid">
          ${validAccounts.map(b => `
            <div class="bank-box">
              <div class="bank-name"><i class="fas fa-university"></i> ${b.bank || 'Bank Transfer'}</div>
              <div class="bank-num">${b.number}</div>
              <div class="bank-holder">a.n. ${b.holder || 'SD Muhammadiyah 1 Sedati'}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="donation-notice-card">
          <div class="donation-notice-icon"><i class="fas fa-hand-holding-heart"></i></div>
          <div class="donation-notice-content">
            <h4>Penyaluran Infaq & Donasi Literasi</h4>
            <p>Rekening resmi infaq literasi dalam pembaruan administrasi sekolah. Donasi dapat dikoordinasikan langsung via formulir di bawah atau konfirmasi WhatsApp petugas.</p>
            <a href="https://wa.me/${cleanWa}?text=${encodeURIComponent('Halo Petugas Perpustakaan MUSADA, saya berniat menyalurkan infaq/donasi buku untuk perpustakaan...')}" target="_blank" rel="noopener" class="btn-wa-donation"><i class="fab fa-whatsapp"></i> Hubungi WhatsApp Petugas</a>
          </div>
        </div>
      `;
    }
  }
  function getFilteredPool() {
    let pool = allBooks;
    if (currentCollectionType === 'physical') {
      pool = allBooks.filter(b => !b.isEbook);
    } else if (currentCollectionType === 'ebook') {
      pool = allBooks.filter(b => b.isEbook);
    }
    return pool;
  }
  function renderCategoryFilters() {
    const pool = getFilteredPool();
    const select = document.getElementById('categorySelectFilter');
    const pillsContainer = document.getElementById('categoryPills');
    const catCounts = {};
    pool.forEach(b => {
      const norm = normalizeCategory(b.category);
      catCounts[norm] = (catCounts[norm] || 0) + 1;
    });
    const sortedCats = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]);
    if (select) {
      select.innerHTML = `<option value="all">Semua Kategori (${pool.length})</option>` +
        sortedCats.map(cat => `<option value="${cat}" ${currentCategory === cat ? 'selected' : ''}>${cat} (${catCounts[cat]})</option>`).join('');
    }
    if (pillsContainer) {
      const topPills = ['all', ...sortedCats.slice(0, 6)];
      pillsContainer.innerHTML = topPills.map(cat => {
        const isAll = cat === 'all';
        const label = isAll ? 'Semua Koleksi' : cat;
        const count = isAll ? pool.length : catCounts[cat];
        const activeClass = currentCategory === cat ? 'active' : '';
        return `<button type="button" class="pill-btn ${activeClass}" data-category="${cat}">${label} (${count})</button>`;
      }).join('');
      pillsContainer.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentCategory = btn.dataset.category;
          if (select) select.value = currentCategory;
          pillsContainer.querySelectorAll('.pill-btn').forEach(b => b.classList.toggle('active', b.dataset.category === currentCategory));
          displayedLimit = BATCH_SIZE;
          filterAndRenderBooks();
        });
      });
    }
  }
  function filterAndRenderBooks() {
    const container = document.getElementById('booksGrid');
    const statusText = document.getElementById('catalogCountText');
    const loadMoreWrap = document.getElementById('loadMoreWrap');
    const btnLoadMore = document.getElementById('btnLoadMoreBooks');
    if (!container) return;
    let pool = getFilteredPool();
    if (currentCategory && currentCategory !== 'all') {
      pool = pool.filter(b => normalizeCategory(b.category) === currentCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(b => {
        return (b.title && b.title.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.code && b.code.toLowerCase().includes(q)) ||
          (b.shelfCode && b.shelfCode.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q)) ||
          (b.publisher && b.publisher.toLowerCase().includes(q));
      });
    }
    if (statusText) {
      statusText.innerText = `Menampilkan ${Math.min(displayedLimit, pool.length)} dari ${pool.length} koleksi buku`;
    }
    if (!pool.length) {
      container.innerHTML = `<div class="grid-full-col"><i class="fas fa-search"></i>Tidak ada koleksi buku yang cocok dengan kata kunci atau filter pencarian Anda.</div>`;
      if (loadMoreWrap) loadMoreWrap.classList.add('pane-hidden');
      return;
    }
    const currentBatch = pool.slice(0, displayedLimit);
    container.innerHTML = currentBatch.map(b => {
      const normCat = normalizeCategory(b.category);
      if (b.isEbook) {
        const coverHtml = b.coverUrl
          ? `<img src="${b.coverUrl}" alt="${b.title}" class="book-cover-img" loading="lazy">`
          : `
            <div class="cover-mockup cover-theme-islam">
              <i class="fas fa-tablet-alt cover-mockup-icon"></i>
              <div class="cover-mockup-title">${b.title}</div>
              <div class="cover-mockup-meta">3D E-Book · ${b.author || 'Pustaka'}</div>
            </div>
          `;
        return `
          <article class="book-card is-ebook">
            <div class="book-cover-wrap">
              <span class="badge-ebook-tag"><i class="fas fa-bolt"></i> 3D E-Book</span>
              <span class="badge-pages-tag"><i class="fas fa-layer-group"></i> Flipbook</span>
              ${coverHtml}
            </div>
            <div class="book-body">
              <span class="book-category">${normCat}</span>
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
      const stockText = isAvail ? `${b.stockAvailable} eks` : 'Kosong';
      const dotClass = isAvail ? 'avail' : 'empty';
      const themeClass = getThemeClassByCategory(b.category);
      const coverHtml = b.coverUrl
        ? `<img src="${b.coverUrl}" alt="${b.title}" class="book-cover-img" loading="lazy">`
        : `
          <div class="cover-mockup ${themeClass}">
            <i class="fas fa-book-open cover-mockup-icon"></i>
            <div class="cover-mockup-title">${b.title}</div>
            <div class="cover-mockup-meta">Rak ${b.shelfCode || '-'} · ${b.author || 'Anonim'}</div>
          </div>
        `;
      return `
        <article class="book-card is-physical">
          <div class="book-cover-wrap">
            <span class="badge-shelf"><i class="fas fa-archive"></i> Rak ${b.shelfCode || '-'}</span>
            ${coverHtml}
          </div>
          <div class="book-body">
            <span class="book-category">${normCat}</span>
            <h4 class="book-title" title="${b.title}">${b.title}</h4>
            <p class="book-author"><i class="fas fa-feather-alt"></i> ${b.author || 'Anonim'} (${b.year || '-'})</p>
            <div class="book-footer">
              <span class="stock-indicator" title="Ketersediaan buku di rak"><span class="stock-dot ${dotClass}"></span>${stockText}</span>
              <div class="book-action-group">
                <button type="button" class="btn-loan-book" data-code="${b.code}" ${isAvail ? '' : 'disabled'}><i class="fas fa-bookmark"></i> Pinjam</button>
                <button type="button" class="btn-view-book" data-code="${b.code}"><i class="fas fa-info-circle"></i> Info</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
    if (loadMoreWrap && btnLoadMore) {
      if (pool.length > displayedLimit) {
        loadMoreWrap.classList.remove('pane-hidden');
        const remaining = pool.length - displayedLimit;
        btnLoadMore.innerHTML = `<i class="fas fa-chevron-down"></i> Tampilkan Lebih Banyak (${remaining} buku lagi)`;
      } else {
        loadMoreWrap.classList.add('pane-hidden');
      }
    }
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
    document.getElementById('modalBookCategory').innerText = normalizeCategory(book.category);
    document.getElementById('modalBookAuthor').innerText = book.author || '-';
    document.getElementById('modalBookPublisher').innerText = book.publisher || '-';
    document.getElementById('modalBookYear').innerText = book.year || '-';
    document.getElementById('modalBookShelf').innerText = book.isEbook ? 'Digital (Akses Online)' : (book.shelfCode ? 'Rak ' + book.shelfCode : '-');
    document.getElementById('modalBookCode').innerText = book.code || '-';
    document.getElementById('modalBookStock').innerText = book.isEbook ? 'Tersedia Digital (Akses Online)' : `${book.stockAvailable} dari ${book.stockTotal} eksemplar`;
    document.getElementById('modalBookDesc').innerText = book.description || 'Buku ini tersedia di koleksi MUSADA Library SD Muhammadiyah 1 Sedati.';
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
    const pickupInput = document.getElementById('loanPickupDate');
    if (pickupInput) {
      const today = new Date().toISOString().slice(0, 10);
      pickupInput.min = today;
      if (!pickupInput.value) pickupInput.value = today;
    }
    updateHandoverUI();
    modal.classList.add('active');
  }
  function updateHandoverUI() {
    const bType = document.getElementById('loanBorrowerType')?.value || 'Wali';
    const grpHandover = document.getElementById('groupHandoverMethod');
    const grpStudent = document.getElementById('groupStudentDetails');
    const noticeText = document.getElementById('loanNoticeText');
    if (bType === 'Wali') {
      if (grpHandover) grpHandover.classList.remove('pane-hidden');
      if (grpStudent) grpStudent.classList.remove('pane-hidden');
      const rad = document.querySelector('input[name="handoverMethodRadio"]:checked');
      const isEntrusted = rad ? rad.value === 'entrusted' : true;
      if (noticeText) {
        noticeText.innerText = isEntrusted
          ? 'Buku akan disiapkan pustakawan dan dititipkan kepada Ananda saat jam pulang sekolah melalui wali kelas.'
          : 'Orang tua/wali murid dipersilakan mengambil buku langsung di ruang perpustakaan sekolah pada jam kerja layanan.';
      }
    } else if (bType === 'Siswa') {
      if (grpHandover) grpHandover.classList.add('pane-hidden');
      if (grpStudent) grpStudent.classList.remove('pane-hidden');
      if (noticeText) {
        noticeText.innerText = 'Siswa dapat mengambil buku langsung di meja sirkulasi perpustakaan pada jam istirahat atau saat pulang sekolah.';
      }
    } else if (bType === 'GTK') {
      if (grpHandover) grpHandover.classList.add('pane-hidden');
      if (grpStudent) grpStudent.classList.add('pane-hidden');
      if (noticeText) {
        noticeText.innerText = 'Buku dapat diambil di perpustakaan atau diantarkan ke ruang guru oleh petugas perpustakaan.';
      }
    } else {
      if (grpHandover) grpHandover.classList.add('pane-hidden');
      if (grpStudent) grpStudent.classList.add('pane-hidden');
      if (noticeText) {
        noticeText.innerText = 'Masyarakat umum / tamu dipersilakan mengambil buku langsung ke meja sirkulasi perpustakaan dengan menunjukkan kartu identitas diri.';
      }
    }
  }
  function getBookBookmark(code) {
    if (!code) return null;
    try {
      const raw = localStorage.getItem('musada_bm_' + code);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  function setBookBookmark(code, page, title) {
    if (!code) return;
    try {
      localStorage.setItem('musada_bm_' + code, JSON.stringify({ page: parseInt(page, 10), title: title || '', time: Date.now() }));
    } catch (e) {}
  }
  function removeBookBookmark(code) {
    if (!code) return;
    try {
      localStorage.removeItem('musada_bm_' + code);
    } catch (e) {}
  }
  function isCurrentPageBookmarked(bm, cur, isDouble, total) {
    if (!bm || !bm.page) return false;
    const bmPage = parseInt(bm.page, 10);
    if (!isDouble || cur <= 1 || cur > total) {
      return bmPage === cur;
    }
    const pLeft = Math.floor(cur / 2) * 2;
    const pRight = pLeft + 1;
    return bmPage === pLeft || bmPage === pRight;
  }
  function updateBookmarkUI(book, cur, isDouble, total) {
    if (!book) return;
    const btnBm = document.getElementById('btnFbBookmark');
    const ribbon = document.getElementById('flipbookBookmarkRibbon');
    const bm = getBookBookmark(book.code);
    const hasBm = !!(bm && bm.page);
    const onBmPage = hasBm && isCurrentPageBookmarked(bm, cur, isDouble, total);
    if (btnBm) {
      const icon = btnBm.querySelector('i');
      if (onBmPage) {
        btnBm.classList.add('is-bookmarked');
        btnBm.title = `Halaman ${bm.page} ditandai (Klik untuk hapus penanda)`;
        if (icon) icon.className = 'fas fa-bookmark';
      } else {
        btnBm.classList.remove('is-bookmarked');
        btnBm.title = hasBm ? `Ada penanda di Hal ${bm.page} (Klik untuk tandai halaman ini)` : 'Tandai Halaman Ini';
        if (icon) icon.className = hasBm ? 'fas fa-bookmark' : 'far fa-bookmark';
      }
    }
    if (ribbon) {
      if (hasBm) {
        ribbon.classList.add('active');
        ribbon.title = `Penanda Buku: Halaman ${bm.page} (Klik untuk lompat)`;
      } else {
        ribbon.classList.remove('active');
      }
    }
  }
  function checkBookmarkOnOpen(book) {
    const bm = getBookBookmark(book.code);
    if (bm && bm.page && bm.page > 1) {
      showToast(`Ada penanda di Halaman ${bm.page}. Klik tali penanda untuk melanjutkan.`, 'info');
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
  function updatePageDisplay(fb) {
    const pageIndicator = document.getElementById('flipbookPageIndicator');
    if (!pageIndicator || !fb || !fb.target) return;
    const cur = fb.target._activePage || 1;
    const total = fb.target.pageCount || (fb.target.contentProvider && fb.target.contentProvider.pageCount) || 1;
    const isDouble = fb.target.pageMode === (window.DFLIP ? window.DFLIP.PAGE_MODE.DOUBLE : 2);
    if (!isDouble || cur <= 1 || cur > total) {
      pageIndicator.textContent = `${Math.min(cur, total)} / ${total}`;
    } else {
      const pLeft = Math.floor(cur / 2) * 2;
      const pRight = pLeft + 1;
      if (pRight > total) {
        pageIndicator.textContent = `${pLeft} / ${total}`;
      } else {
        pageIndicator.textContent = `${pLeft}-${pRight} / ${total}`;
      }
    }
    if (activeBook) {
      updateBookmarkUI(activeBook, cur, isDouble, total);
    }
  }
  function openFlipbookViewer(book) {
    activeBook = book;
    const modal = document.getElementById('flipbookModal');
    const stage = document.getElementById('flipbookStage');
    const titleEl = document.getElementById('flipbookBookTitle');
    const subTitleEl = document.getElementById('flipbookSubbarTitle');
    const pageIndicator = document.getElementById('flipbookPageIndicator');
    if (!modal || !stage) return;
    if (titleEl) titleEl.innerText = book.title;
    if (subTitleEl) subTitleEl.innerText = book.title;
    if (pageIndicator) pageIndicator.innerText = 'Memuat...';
    stage.innerHTML = '<div id="dfBookContainer"></div>';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const isMobileScreen = window.innerWidth <= 768;
    const pdfUrl = book.ebookUrl || 'buku-perpus/pedoman-hidup-islami-warga-muhammadiyah.pdf';
    window.dFlipLocation = 'assets/vendor/dflip/';
    if (window.DFLIP && window.DFLIP.defaults) {
      window.DFLIP.defaults.pdfjsWorkerSrc = 'assets/vendor/dflip/js/libs/pdf.worker.min.js';
    }
    const dFlipOptions = {
      webgl: true,
      webglShadow: true,
      soundEnable: false,
      height: '100%',
      duration: 550,
      stiffness: 1.5,
      pdfRenderQuality: isMobileScreen ? 0.8 : 0.9,
      maxTextureSize: isMobileScreen ? 1200 : 1600,
      minTextureSize: 512,
      rangeChunkSize: 524288,
      backgroundColor: '#1E242B',
      controlsPosition: (window.DFLIP && window.DFLIP.CONTROLSPOSITION && window.DFLIP.CONTROLSPOSITION.HIDDEN) || 'hide',
      allControls: 'altPrev,pageNumber,altNext,play,outline,thumbnail,zoomIn,zoomOut,fullScreen,share,download,search,more,pageMode,startPage,endPage,sound',
      hideControls: 'altPrev,altNext,pageNumber,play,outline,thumbnail,zoomIn,zoomOut,fullScreen,share,download,search,more,pageMode,startPage,endPage,sound',
      pageMode: isMobileScreen ? (window.DFLIP ? window.DFLIP.PAGE_MODE.SINGLE : 1) : (window.DFLIP ? window.DFLIP.PAGE_MODE.DOUBLE : 2),
      singlePageMode: window.DFLIP ? window.DFLIP.SINGLE_PAGE_MODE.BOOKLET : 2,
      onReady: function(fb) {
        updatePageDisplay(fb);
        checkBookmarkOnOpen(book);
      },
      onFlip: function(fb) {
        updatePageDisplay(fb);
      }
    };
    try {
      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.flipBook) {
        activeFlipbookInstance = window.jQuery('#dfBookContainer').flipBook(pdfUrl, dFlipOptions);
      } else {
        stage.innerHTML = `<iframe src="${pdfUrl}" class="flipbook-fallback-frame"></iframe>`;
      }
    } catch (e) {
      stage.innerHTML = `<iframe src="${pdfUrl}" class="flipbook-fallback-frame"></iframe>`;
    }
    const btnBm = document.getElementById('btnFbBookmark');
    const ribbon = document.getElementById('flipbookBookmarkRibbon');
    if (btnBm) {
      btnBm.onclick = () => {
        if (!activeBook || !activeFlipbookInstance || !activeFlipbookInstance.target) return;
        const cur = activeFlipbookInstance.target._activePage || 1;
        const total = activeFlipbookInstance.target.pageCount || 1;
        const isDouble = activeFlipbookInstance.target.pageMode === (window.DFLIP ? window.DFLIP.PAGE_MODE.DOUBLE : 2);
        const bm = getBookBookmark(activeBook.code);
        if (bm && isCurrentPageBookmarked(bm, cur, isDouble, total)) {
          removeBookBookmark(activeBook.code);
          showToast(`Penanda baca di Halaman ${bm.page} dihapus.`, 'info');
        } else {
          setBookBookmark(activeBook.code, cur, activeBook.title);
          showToast(`Halaman ${cur} disimpan sebagai penanda baca!`, 'success');
        }
        updateBookmarkUI(activeBook, cur, isDouble, total);
      };
    }
    if (ribbon) {
      ribbon.onclick = () => {
        if (!activeBook || !activeFlipbookInstance) return;
        const bm = getBookBookmark(activeBook.code);
        if (!bm || !bm.page) return;
        const cur = activeFlipbookInstance.target ? (activeFlipbookInstance.target._activePage || 1) : 1;
        const total = activeFlipbookInstance.target ? (activeFlipbookInstance.target.pageCount || 1) : 1;
        const isDouble = activeFlipbookInstance.target ? (activeFlipbookInstance.target.pageMode === (window.DFLIP ? window.DFLIP.PAGE_MODE.DOUBLE : 2)) : false;
        if (isCurrentPageBookmarked(bm, cur, isDouble, total)) {
          showToast(`Sedang berada di halaman penanda (${bm.page}).`, 'info');
        } else if (typeof activeFlipbookInstance.gotoPage === 'function') {
          activeFlipbookInstance.gotoPage(bm.page);
          showToast(`Melompat ke Halaman ${bm.page}.`, 'info');
        }
      };
    }
    const btnZoomIn = document.getElementById('btnFbZoomIn');
    const btnZoomOut = document.getElementById('btnFbZoomOut');
    const btnFullscreen = document.getElementById('btnFbFullscreen');
    if (btnZoomIn) {
      btnZoomIn.onclick = () => {
        if (activeFlipbookInstance && typeof activeFlipbookInstance.zoom === 'function') activeFlipbookInstance.zoom(1);
      };
    }
    if (btnZoomOut) {
      btnZoomOut.onclick = () => {
        if (activeFlipbookInstance && typeof activeFlipbookInstance.zoom === 'function') activeFlipbookInstance.zoom(-1);
      };
    }
    if (btnFullscreen) {
      btnFullscreen.onclick = () => {
        if (activeFlipbookInstance && activeFlipbookInstance.ui && typeof activeFlipbookInstance.ui.switchFullscreen === 'function') {
          activeFlipbookInstance.ui.switchFullscreen();
        } else if (modal.requestFullscreen) {
          if (!document.fullscreenElement) modal.requestFullscreen(); else document.exitFullscreen();
        }
      };
    }
    window.removeEventListener('keydown', onFlipbookKeyDown);
    window.addEventListener('keydown', onFlipbookKeyDown);
  }
  function closeFlipbookViewer() {
    window.removeEventListener('keydown', onFlipbookKeyDown);
    const modal = document.getElementById('flipbookModal');
    const stage = document.getElementById('flipbookStage');
    const ribbon = document.getElementById('flipbookBookmarkRibbon');
    if (modal) modal.classList.remove('active');
    if (ribbon) ribbon.classList.remove('active');
    document.body.style.overflow = '';
    if (activeFlipbookInstance && typeof activeFlipbookInstance.dispose === 'function') {
      try {
        activeFlipbookInstance.dispose();
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
        displayedLimit = BATCH_SIZE;
        renderCategoryFilters();
        filterAndRenderBooks();
      });
    });
    const searchInput = document.getElementById('searchBookInput');
    const btnClear = document.getElementById('btnClearSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        if (btnClear) btnClear.classList.toggle('pane-hidden', !searchQuery);
        displayedLimit = BATCH_SIZE;
        filterAndRenderBooks();
      });
    }
    if (btnClear && searchInput) {
      btnClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        btnClear.classList.add('pane-hidden');
        displayedLimit = BATCH_SIZE;
        filterAndRenderBooks();
        searchInput.focus();
      });
    }
    const catSelect = document.getElementById('categorySelectFilter');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        const pillsContainer = document.getElementById('categoryPills');
        if (pillsContainer) {
          pillsContainer.querySelectorAll('.pill-btn').forEach(b => b.classList.toggle('active', b.dataset.category === currentCategory));
        }
        displayedLimit = BATCH_SIZE;
        filterAndRenderBooks();
      });
    }
    const btnLoadMore = document.getElementById('btnLoadMoreBooks');
    if (btnLoadMore) {
      btnLoadMore.addEventListener('click', () => {
        displayedLimit += BATCH_SIZE;
        filterAndRenderBooks();
      });
    }
    const mobileToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('publicNavMenu');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
        });
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
    const memberCodeInput = document.getElementById('guestMemberCode');
    const memberNameInput = document.getElementById('guestMemberName');
    const memberTypeSelect = document.getElementById('guestMemberType');
    const btnLookup = document.getElementById('btnLookupMember');
    async function doMemberLookup() {
      if (!memberCodeInput) return;
      const code = memberCodeInput.value.trim().toUpperCase();
      if (!code) return;
      try {
        const m = await DBLibrary.getMember(code);
        if (m) {
          if (memberNameInput) memberNameInput.value = m.name;
          if (memberTypeSelect) {
            if (m.type === 'Siswa') memberTypeSelect.value = 'Siswa';
            else if (m.type === 'Guru' || m.type === 'Tenaga Kependidikan') memberTypeSelect.value = 'GTK';
          }
          showToast(`Data anggota ditemukan: ${m.name}`, 'success');
        } else {
          showToast('Data kode anggota tidak ditemukan, silakan isi nama Anda.', 'info');
        }
      } catch (e) {}
    }
    if (memberCodeInput) memberCodeInput.addEventListener('change', doMemberLookup);
    if (btnLookup) btnLookup.addEventListener('click', doMemberLookup);
    if (guestForm) {
      guestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btnSubmitGuest') || guestForm.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencatat Kehadiran...';
        try {
          const memberCode = (memberCodeInput ? memberCodeInput.value : '').trim().toUpperCase();
          const memberName = (memberNameInput ? memberNameInput.value : '').trim();
          const memberType = memberTypeSelect ? memberTypeSelect.value : 'Umum';
          const purpose = (document.getElementById('guestPurpose')?.value || 'Membaca Buku').trim();
          await DBLibrary.logVisit({ memberCode, memberName, memberType, purpose });
          showToast('Kehadiran Anda berhasil dicatat. Selamat membaca!', 'success');
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
        const btn = document.getElementById('btnSubmitDonasiBuku') || formBuku.querySelector('button[type="submit"]');
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
        const btn = document.getElementById('btnSubmitDonasiDana') || formDana.querySelector('button[type="submit"]');
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
