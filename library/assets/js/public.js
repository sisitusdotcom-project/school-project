(function(){
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.startsWith('admin-perpus') || hostname.startsWith('adm.perpus')) {
    window.location.replace('admin/');
    return;
  }
  let allBooks = [];
  let currentCategory = 'all';
  let searchQuery = '';
  let activeBook = null;
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
      const u = new SpeechSynthesisUtterance(`Selamat datang di Perpustakaan Surya Pintar, ${nama}`);
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
      renderCategoryPills(books);
      filterAndRenderBooks();
    } catch (err) {
      console.error('Load library error:', err);
    }
  }
  function renderStats(stats) {
    const elTotal = document.getElementById('statTotalBuku');
    const elStok = document.getElementById('statStokTersedia');
    const elEbook = document.getElementById('statEbookCount');
    const elVisits = document.getElementById('statVisitsToday');
    if (elTotal) elTotal.innerText = stats.totalBuku || 0;
    if (elStok) elStok.innerText = stats.stokTersedia || 0;
    const ebookCount = allBooks.filter(b => b.isEbook).length;
    if (elEbook) elEbook.innerText = ebookCount;
    if (elVisits) elVisits.innerText = stats.visitsToday || 0;
  }
  function renderSettings(settings) {
    const nameEl = document.getElementById('libSettingsName');
    const hoursEl = document.getElementById('libSettingsHours');
    if (nameEl && settings.libraryName) nameEl.innerText = settings.libraryName;
    if (hoursEl && settings.openHours) hoursEl.innerText = settings.openHours;
  }
  function renderCategoryPills(books) {
    const container = document.getElementById('categoryPills');
    if (!container) return;
    const categories = ['Semua', ...new Set(books.map(b => b.category).filter(Boolean))];
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
          (b.publisher && b.publisher.toLowerCase().includes(q));
      });
    }
    if (!filtered.length) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);"><i class="fas fa-search" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>Tidak ada koleksi buku yang cocok dengan pencarian Anda.</div>`;
      return;
    }
    container.innerHTML = filtered.map(b => {
      const isAvail = b.isEbook || (parseInt(b.stockAvailable, 10) > 0);
      const stockText = b.isEbook ? 'Digital E-Book' : (isAvail ? `Tersedia: ${b.stockAvailable} eks` : 'Sedang Dipinjam');
      const dotClass = isAvail ? 'avail' : 'empty';
      const coverHtml = b.coverUrl
        ? `<img src="${b.coverUrl}" alt="${b.title}" class="book-cover-img" loading="lazy">`
        : `<i class="fas ${b.isEbook ? 'fa-tablet-alt' : 'fa-book'} book-cover-placeholder"></i>`;
      const badgeEbook = b.isEbook ? `<span class="badge-ebook"><i class="fas fa-bolt"></i> E-Book</span>` : '';
      return `
        <article class="book-card">
          <div class="book-cover-wrap">
            ${badgeEbook}
            <span class="badge-shelf">Rak ${b.shelfCode || '-'}</span>
            ${coverHtml}
          </div>
          <div class="book-body">
            <span class="book-category">${b.category || 'Koleksi'}</span>
            <h4 class="book-title" title="${b.title}">${b.title}</h4>
            <p class="book-author"><i class="fas fa-feather-alt"></i> ${b.author || 'Anonim'} (${b.year || '-'})</p>
            <div class="book-footer">
              <span class="stock-indicator"><span class="stock-dot ${dotClass}"></span>${stockText}</span>
              <button type="button" class="btn-view-book" data-code="${b.code}"><i class="fas fa-info-circle"></i> Detail</button>
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
    document.getElementById('modalBookShelf').innerText = book.shelfCode || '-';
    document.getElementById('modalBookCode').innerText = book.code || '-';
    document.getElementById('modalBookStock').innerText = book.isEbook ? 'Tersedia Digital (Akses Online)' : `${book.stockAvailable} dari ${book.stockTotal} eksemplar`;
    document.getElementById('modalBookDesc').innerText = book.description || 'Buku ini tersedia di Perpustakaan Surya Pintar SD Muhammadiyah 1 Sedati untuk dibaca atau dipinjam.';
    const btnRead = document.getElementById('btnReadEbook');
    const btnReserve = document.getElementById('btnReserveBook');
    if (btnRead) {
      if (book.isEbook && book.ebookUrl) {
        btnRead.style.display = 'inline-flex';
        btnRead.onclick = () => openEbookViewer(book);
      } else {
        btnRead.style.display = 'none';
      }
    }
    if (btnReserve) {
      btnReserve.style.display = book.isEbook ? 'none' : 'inline-flex';
      btnReserve.disabled = parseInt(book.stockAvailable, 10) < 1;
      btnReserve.onclick = () => {
        closeAllModals();
        const bookInput = document.getElementById('reserveBookCode');
        if (bookInput) bookInput.value = book.code;
        const targetSection = document.getElementById('section-guestbook');
        if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
        showToast(`Buku "${book.title}" dipilih untuk peminjaman.`);
      };
    }
    modal.classList.add('active');
  }
  function openEbookViewer(book) {
    const modal = document.getElementById('ebookViewerModal');
    if (!modal) return;
    document.getElementById('ebookViewerTitle').innerText = book.title;
    const frame = document.getElementById('ebookIframe');
    if (frame) frame.src = book.ebookUrl;
    modal.classList.add('active');
  }
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    const frame = document.getElementById('ebookIframe');
    if (frame) frame.src = '';
  }
  function setupEventListeners() {
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
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        closeAllModals();
      }
    });
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
          showToast(`Kunjungan Anda berhasil dicatat. Selamat membaca!`, 'success');
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
          if (paneBuku) paneBuku.style.display = 'block';
          if (paneDana) paneDana.style.display = 'none';
        } else {
          if (paneBuku) paneBuku.style.display = 'none';
          if (paneDana) paneDana.style.display = 'block';
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
          showToast('Gagal mengirim formulir donasi: ' + err.message, 'error');
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
          showToast('Terima kasih atas infaq dan donasi Anda untuk kemajuan literasi MUSADA!', 'success');
          formDana.reset();
        } catch (err) {
          showToast('Gagal mengirim konfirmasi donasi: ' + err.message, 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = orig;
        }
      });
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    loadLibraryData();
    setupEventListeners();
  });
})();
