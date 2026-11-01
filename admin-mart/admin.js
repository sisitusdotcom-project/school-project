function playScanSound(success = true) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (success) {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {}
}
const Utils = {
  formatRupiah(amount) {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  },
  resolveImageUrl(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.includes('drive.google.com') || trimmed.includes('drive.usercontent.google.com') || trimmed.includes('lh3.googleusercontent.com')) {
      const match = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) || trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return 'https://drive.google.com/thumbnail?id=' + match[1] + '&sz=w1000';
      }
    }
    return trimmed;
  },
  getCategoryIcon(kat) {
    const map = {
      'atk': 'fa-pen-ruler',
      'seragam': 'fa-shirt',
      'buku': 'fa-book-open',
      'makanan': 'fa-utensils',
      'umum': 'fa-box'
    };
    return map[kat] || 'fa-tag';
  }
};
const AdminApp = {
  RTDB_BASE: 'https://musada-sd-default-rtdb.firebaseio.com/mart',
  GAS_URL: 'https://script.google.com/macros/s/AKfycbxk4PM_VNZt__dwfXuk5v3pI366vHDFG31HZNx2t_4jpmomd-2aUXgKkEHimB8DfJQcrg/exec',
  products: {},
  orders: {},
  settings: {},
  posCart: [],
  scanner: null,
  isScanning: false,
  currentScanMode: 'order',
  activeTab: 'tabScanner',
  filterOrderStatus: 'all',
  filterProductCategory: 'all',
  filterLowStockOnly: false,
  searchProductQuery: '',
  pollingInterval: null,
  async init() {
    await this.loadAllData();
    this.renderAll();
    this.setupUploadZone();
    this.pollingInterval = setInterval(() => {
      this.loadOrdersSilently();
    }, 15000);
  },
  setupUploadZone() {
    const zone = document.getElementById('serverUploadZone');
    const fileInp = document.getElementById('inpProdFile');
    if (!zone || !fileInp) return;
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.uploadProductImage(e.dataTransfer.files[0]);
      }
    });
    fileInp.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.uploadProductImage(e.target.files[0]);
      }
    });
  },
  async loadAllData() {
    try {
      const [resProd, resOrders, resSettings] = await Promise.all([
        fetch(this.RTDB_BASE + '/products.json'),
        fetch(this.RTDB_BASE + '/orders.json'),
        fetch(this.RTDB_BASE + '/settings.json')
      ]);
      this.products = (await resProd.json()) || {};
      this.orders = (await resOrders.json()) || {};
      this.settings = (await resSettings.json()) || {};
    } catch (e) {
      console.error(e);
    }
  },
  async loadOrdersSilently() {
    try {
      const res = await fetch(this.RTDB_BASE + '/orders.json');
      if (res.ok) {
        this.orders = (await res.json()) || {};
        this.updateOrderBadges();
        if (this.activeTab === 'tabOrders') this.renderOrdersTable();
        if (this.activeTab === 'tabStats') this.renderStats();
      }
    } catch (e) {}
  },
  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.admin-nav-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
    });
    document.querySelectorAll('.admin-tab-content').forEach(c => {
      c.classList.toggle('active', c.id === tabId);
    });
    if (tabId === 'tabScanner') {
      if (!this.scanner && this.isScanning) this.startScanner();
    } else {
      if (this.scanner && this.isScanning) this.stopScanner();
    }
    if (tabId === 'tabStock') this.renderStockTable();
    if (tabId === 'tabOrders') this.renderOrdersTable();
    if (tabId === 'tabStats') this.renderStats();
    if (tabId === 'tabSettings') this.renderSettingsForm();
  },
  initScanner() {
    if (!window.Html5Qrcode) return;
    if (!this.scanner) {
      this.scanner = new Html5Qrcode('reader');
    }
  },
  async startScanner() {
    this.initScanner();
    if (!this.scanner) return;
    try {
      await this.scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => this.handleScanSuccess(decodedText),
        () => {}
      );
      this.isScanning = true;
      const btn = document.getElementById('btnToggleScanner');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-stop"></i> Matikan Kamera';
    } catch (e) {
      this.isScanning = false;
      Swal.fire('Kamera Tidak Tersedia', 'Pastikan izin akses kamera diaktifkan di browser Anda.', 'warning');
    }
  },
  async stopScanner() {
    if (this.scanner && this.isScanning) {
      try {
        await this.scanner.stop();
      } catch (e) {}
      this.isScanning = false;
      const btn = document.getElementById('btnToggleScanner');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Nyalakan Kamera';
    }
  },
  toggleScanner() {
    if (this.isScanning) {
      this.stopScanner();
    } else {
      this.startScanner();
    }
  },
  setScanMode(mode) {
    this.currentScanMode = mode;
    document.querySelectorAll('.scanner-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  },
  handleScanSuccess(code) {
    if (code.startsWith('MSD-') || this.orders[code]) {
      this.processOrderScan(code);
    } else {
      this.processProductScan(code);
    }
  },
  manualScanSubmit() {
    const val = (document.getElementById('inpManualCode').value || '').trim();
    if (!val) return;
    this.handleScanSuccess(val);
    document.getElementById('inpManualCode').value = '';
  },
  processOrderScan(orderId) {
    const order = this.orders[orderId];
    const container = document.getElementById('scanResultContainer');
    if (!order) {
      playScanSound(false);
      container.innerHTML = '<div class="scan-status-error"><i class="fa-solid fa-triangle-exclamation"></i> Pesanan ID #' + orderId + ' tidak ditemukan di database.</div>';
      return;
    }
    playScanSound(true);
    const isDone = order.status === 'Selesai';
    const statusClass = isDone ? 'badge-status-done' : (order.status === 'Dibatalkan' ? 'badge-status-cancel' : 'badge-status-pending');
    let itemsList = '';
    (order.items || []).forEach(it => {
      itemsList += '<div>- ' + it.qty + 'x ' + it.nama + ' (' + it.variasi + ')</div>';
    });
    container.innerHTML = '<div class="scan-order-header">' +
      '<strong class="scan-order-id">PESANAN #' + order.orderId + '</strong>' +
      '<span class="' + statusClass + '">' + order.status + '</span>' +
      '</div>' +
      '<div class="scan-order-row">Pemesan: <strong>' + order.namaPemesan + '</strong> (' + order.tipePembeli + ')</div>' +
      (order.namaSiswa ? '<div class="scan-order-row">Siswa: <strong>' + order.namaSiswa + '</strong> (Kelas ' + order.kelasSiswa + ')</div>' : '') +
      '<div class="scan-order-row">Penyerahan: <strong>' + order.opsiPengambilan + '</strong></div>' +
      '<div class="scan-order-row">Pembayaran: <strong>' + order.metodePembayaran + ' (' + Utils.formatRupiah(order.totalBayar) + ')</strong></div>' +
      '<div class="scan-order-box">' + itemsList + '</div>' +
      (!isDone ? '<button class="btn btn-secondary btn-block" data-action="complete-scanned-order" data-id="' + order.orderId + '"><i class="fa-solid fa-check-double"></i> Serahkan Barang & Selesaikan</button>' : '');
  },
  processProductScan(code) {
    const searchCode = code.toUpperCase();
    const product = Object.values(this.products).find(p => (p.kode && p.kode.toUpperCase() === searchCode) || p.id === code);
    const container = document.getElementById('scanResultContainer');
    if (!product) {
      playScanSound(false);
      container.innerHTML = '<div class="scan-status-error"><i class="fa-solid fa-triangle-exclamation"></i> SKU / Barcode ' + code + ' belum terdaftar.</div>';
      return;
    }
    playScanSound(true);
    const imgUrl = Utils.resolveImageUrl(product.img) || '/assets/img/icon-512x512.png';
    container.innerHTML = '<div class="scan-prod-card">' +
      '<img src="' + imgUrl + '" class="table-prod-thumb" alt="' + product.nama + '">' +
      '<div class="flex-1">' +
      '<span class="badge-sku">' + product.kode + '</span>' +
      '<div class="scan-prod-title">' + product.nama + '</div>' +
      '<div class="scan-prod-price">' + Utils.formatRupiah(product.harga) + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="scan-prod-stock-row">' +
      '<div>Stok Fisik: <strong id="lblScanStock" class="scan-prod-stock-val">' + product.stok + '</strong></div>' +
      '<div class="btn-group-sm">' +
      '<button class="btn btn-outline btn-sm" data-action="quick-adjust-scanned" data-id="' + product.id + '" data-delta="-1">-1</button>' +
      '<button class="btn btn-outline btn-sm" data-action="quick-adjust-scanned" data-id="' + product.id + '" data-delta="1">+1</button>' +
      '<button class="btn btn-primary btn-sm" data-action="add-pos-item" data-id="' + product.id + '"><i class="fa-solid fa-cart-plus"></i> + Kasir</button>' +
      '</div>' +
      '</div>';
  },
  async completeOrder(orderId) {
    try {
      const order = this.orders[orderId];
      if (!order) return;
      order.status = 'Selesai';
      order.selesaiPada = new Date().toISOString();
      await fetch(this.RTDB_BASE + '/orders/' + orderId + '.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      playScanSound(true);
      Swal.fire('Pesanan Selesai!', 'Pesanan #' + orderId + ' telah diserahkan.', 'success');
      this.renderOrdersTable();
      this.renderStats();
      this.updateOrderBadges();
      const container = document.getElementById('scanResultContainer');
      if (container) container.innerHTML = '<div class="scan-status-success"><i class="fa-solid fa-circle-check"></i> Pesanan #' + orderId + ' telah ditandai Selesai.</div>';
    } catch (e) {
      Swal.fire('Error', 'Gagal memperbarui status pesanan', 'error');
    }
  },
  async cancelOrder(orderId) {
    const res = await Swal.fire({
      title: 'Batalkan Pesanan #' + orderId + '?',
      text: 'Stok barang akan dikembalikan ke etalase.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Batalkan',
      cancelButtonText: 'Tutup'
    });
    if (!res.isConfirmed) return;
    try {
      const order = this.orders[orderId];
      if (!order) return;
      order.status = 'Dibatalkan';
      await fetch(this.RTDB_BASE + '/orders/' + orderId + '.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      for (const item of (order.items || [])) {
        if (this.products[item.id]) {
          await this.stepStock(item.id, item.qty);
        }
      }
      Swal.fire('Dibatalkan', 'Pesanan #' + orderId + ' telah dibatalkan.', 'info');
      this.renderOrdersTable();
      this.renderStats();
      this.updateOrderBadges();
    } catch (e) {
      Swal.fire('Error', 'Gagal membatalkan pesanan', 'error');
    }
  },
  renderAll() {
    this.updateOrderBadges();
    this.renderStockTable();
    this.renderOrdersTable();
    this.renderStats();
    this.renderSettingsForm();
    this.renderPosCart();
  },
  updateOrderBadges() {
    const pendingCount = Object.values(this.orders).filter(o => o.status === 'Menunggu Diambil').length;
    const badge = document.getElementById('badgePendingOrders');
    if (badge) {
      badge.textContent = pendingCount;
      badge.classList.toggle('active', pendingCount > 0);
    }
  },
  renderStats() {
    const orderList = Object.values(this.orders);
    const productList = Object.values(this.products);
    let totalOmset = 0;
    let totalPesanan = orderList.length;
    let pendingPesanan = 0;
    orderList.forEach(o => {
      if (o.status === 'Selesai') totalOmset += (o.totalBayar || 0);
      if (o.status === 'Menunggu Diambil') pendingPesanan++;
    });
    const lowStockCount = productList.filter(p => (p.stok || 0) <= 5).length;
    document.getElementById('statTotalOmset').textContent = Utils.formatRupiah(totalOmset);
    document.getElementById('statTotalPesanan').textContent = totalPesanan;
    document.getElementById('statPendingPesanan').textContent = pendingPesanan + ' pesanan menunggu diambil';
    document.getElementById('statLowStock').textContent = lowStockCount;
    document.getElementById('statTotalSku').textContent = productList.length;
  },
  renderStockTable() {
    const tbody = document.getElementById('tbodyStock');
    if (!tbody) return;
    tbody.innerHTML = '';
    let list = Object.values(this.products);
    if (this.filterProductCategory !== 'all') {
      list = list.filter(p => p.kat === this.filterProductCategory);
    }
    if (this.filterLowStockOnly) {
      list = list.filter(p => (p.stok || 0) <= 5);
    }
    if (this.searchProductQuery) {
      const q = this.searchProductQuery.toLowerCase();
      list = list.filter(p => (p.nama && p.nama.toLowerCase().includes(q)) || (p.kode && p.kode.toLowerCase().includes(q)));
    }
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center-muted">Tidak ada produk yang cocok.</td></tr>';
      return;
    }
    list.forEach(p => {
      const tr = document.createElement('tr');
      const isLow = (p.stok || 0) <= 5;
      const imgUrl = Utils.resolveImageUrl(p.img) || '/assets/img/icon-512x512.png';
      tr.innerHTML = '<td><span class="badge-sku">' + (p.kode || p.id) + '</span></td>' +
        '<td>' +
        '<div class="table-prod-info">' +
        '<img src="' + imgUrl + '" class="table-prod-thumb" alt="' + p.nama + '">' +
        '<div><strong>' + p.nama + '</strong><br><span class="text-muted">' + (p.kat || '').toUpperCase() + '</span></div>' +
        '</div>' +
        '</td>' +
        '<td>' +
        '<div class="stock-counter">' +
        '<button class="stock-counter-btn" data-action="step-stock" data-id="' + p.id + '" data-delta="-1">-</button>' +
        '<input type="number" class="stock-counter-input ' + (isLow ? 'text-red' : '') + '" value="' + (p.stok || 0) + '" data-action="input-stock" data-id="' + p.id + '">' +
        '<button class="stock-counter-btn" data-action="step-stock" data-id="' + p.id + '" data-delta="1">+</button>' +
        '</div>' +
        '</td>' +
        '<td><strong>' + Utils.formatRupiah(p.harga) + '</strong></td>' +
        '<td><span class="text-xs-muted">' + (p.variasi ? p.variasi.join(', ') : '-') + '</span></td>' +
        '<td>' +
        '<div class="btn-group-row">' +
        '<button class="btn btn-outline btn-sm" data-action="add-pos-item" data-id="' + p.id + '" title="+ Kasir"><i class="fa-solid fa-cart-plus"></i></button>' +
        '<button class="btn btn-outline btn-sm" data-action="edit-product" data-id="' + p.id + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
        '<button class="btn btn-outline btn-sm text-red" data-action="delete-product" data-id="' + p.id + '" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>' +
        '</div>' +
        '</td>';
      tbody.appendChild(tr);
    });
  },
  async updateStock(productId, newStok) {
    const val = Math.max(0, parseInt(newStok) || 0);
    if (this.products[productId]) {
      this.products[productId].stok = val;
      await fetch(this.RTDB_BASE + '/products/' + productId + '/stok.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(val)
      });
      this.renderStats();
    }
  },
  async stepStock(productId, delta) {
    const p = this.products[productId];
    if (!p) return;
    const current = parseInt(p.stok) || 0;
    const updated = Math.max(0, current + delta);
    await this.updateStock(productId, updated);
    this.renderStockTable();
  },
  renderOrdersTable() {
    const tbody = document.getElementById('tbodyOrders');
    if (!tbody) return;
    tbody.innerHTML = '';
    let list = Object.values(this.orders);
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (this.filterOrderStatus !== 'all') {
      list = list.filter(o => o.status === this.filterOrderStatus);
    }
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center-muted">Tidak ada pesanan pada status ini.</td></tr>';
      return;
    }
    list.forEach(o => {
      const tr = document.createElement('tr');
      const isDone = o.status === 'Selesai';
      const statusClass = isDone ? 'badge-status-done' : (o.status === 'Dibatalkan' ? 'badge-status-cancel' : 'badge-status-pending');
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
      tr.innerHTML = '<td><strong>#' + o.orderId + '</strong><br><span class="text-muted">' + dateStr + '</span></td>' +
        '<td><strong>' + o.namaPemesan + '</strong><br><span class="text-muted">' + (o.tipePembeli || 'Umum') + '</span></td>' +
        '<td>' + (o.namaSiswa ? '<strong>' + o.namaSiswa + '</strong><br><span class="text-muted">Kelas ' + o.kelasSiswa + '</span>' : '<span class="text-muted">-</span>') + '</td>' +
        '<td><strong>' + Utils.formatRupiah(o.totalBayar) + '</strong><br><span class="text-muted">' + (o.metodePembayaran || 'Tunai') + '</span></td>' +
        '<td><span class="text-xs-muted">' + (o.opsiPengambilan || 'Ambil di Koperasi') + '</span></td>' +
        '<td><span class="' + statusClass + '">' + o.status + '</span></td>' +
        '<td>' +
        '<div class="btn-group-row">' +
        '<button class="btn btn-outline btn-sm" data-action="view-order-detail" data-id="' + o.orderId + '" title="Lihat Rincian"><i class="fa-solid fa-eye"></i></button>' +
        (!isDone && o.status !== 'Dibatalkan' ? '<button class="btn btn-secondary btn-sm" data-action="complete-order" data-id="' + o.orderId + '" title="Selesai"><i class="fa-solid fa-check"></i></button>' : '') +
        (!isDone && o.status !== 'Dibatalkan' ? '<button class="btn btn-outline btn-sm text-red" data-action="cancel-order" data-id="' + o.orderId + '" title="Batalkan"><i class="fa-solid fa-xmark"></i></button>' : '') +
        '</div>' +
        '</td>';
      tbody.appendChild(tr);
    });
  },
  viewOrderDetail(orderId) {
    const o = this.orders[orderId];
    if (!o) return;
    let itemsHtml = '';
    (o.items || []).forEach(it => {
      itemsHtml += '<div class="order-detail-item-row">' +
        '<span>' + it.qty + 'x ' + it.nama + ' (' + it.variasi + ')</span>' +
        '<strong>' + Utils.formatRupiah(it.subtotal) + '</strong>' +
        '</div>';
    });
    Swal.fire({
      title: 'Rincian Pesanan #' + o.orderId,
      html: '<div class="order-detail-modal">' +
        '<div><strong>Pemesan:</strong> ' + o.namaPemesan + ' (' + o.tipePembeli + ')</div>' +
        '<div><strong>WhatsApp:</strong> ' + (o.waPemesan || '-') + '</div>' +
        (o.namaSiswa ? '<div><strong>Siswa:</strong> ' + o.namaSiswa + ' (Kelas ' + o.kelasSiswa + ')</div>' : '') +
        '<div><strong>Metode Serah:</strong> ' + o.opsiPengambilan + '</div>' +
        '<div><strong>Pembayaran:</strong> ' + o.metodePembayaran + '</div>' +
        (o.catatan ? '<div><strong>Catatan:</strong> ' + o.catatan + '</div>' : '') +
        '<div class="order-detail-items-box">' + itemsHtml + '</div>' +
        '<div class="order-detail-total">Total: ' + Utils.formatRupiah(o.totalBayar) + '</div>' +
        '</div>',
      confirmButtonText: 'Tutup'
    });
  },
  addToPos(productId) {
    const prod = this.products[productId];
    if (!prod) return;
    const existing = this.posCart.find(i => i.id === productId);
    if (existing) {
      existing.qty++;
    } else {
      this.posCart.push({
        id: prod.id,
        kode: prod.kode,
        nama: prod.nama,
        harga: prod.harga,
        qty: 1
      });
    }
    this.renderPosCart();
  },
  updatePosQty(index, delta) {
    if (!this.posCart[index]) return;
    this.posCart[index].qty += delta;
    if (this.posCart[index].qty <= 0) {
      this.posCart.splice(index, 1);
    }
    this.renderPosCart();
  },
  clearPosCart() {
    this.posCart = [];
    this.renderPosCart();
  },
  renderPosCart() {
    const container = document.getElementById('posCartItems');
    if (!container) return;
    if (this.posCart.length === 0) {
      container.innerHTML = '<div class="pos-cart-empty"><i class="fa-solid fa-cart-shopping pos-empty-icon"></i>Kasir masih kosong. Scan barcode produk atau klik "+ Kasir" di katalog.</div>';
      document.getElementById('posTotalBayar').textContent = 'Rp 0';
      return;
    }
    container.innerHTML = '';
    let total = 0;
    this.posCart.forEach((item, idx) => {
      const sub = item.harga * item.qty;
      total += sub;
      const row = document.createElement('div');
      row.className = 'pos-cart-row';
      row.innerHTML = '<div><strong>' + item.nama + '</strong><br><span class="text-muted">' + Utils.formatRupiah(item.harga) + '</span></div>' +
        '<div class="pos-row-action">' +
        '<button class="stock-counter-btn" data-action="pos-qty" data-index="' + idx + '" data-delta="-1">-</button>' +
        '<span><strong>' + item.qty + '</strong></span>' +
        '<button class="stock-counter-btn" data-action="pos-qty" data-index="' + idx + '" data-delta="1">+</button>' +
        '</div>';
      container.appendChild(row);
    });
    document.getElementById('posTotalBayar').textContent = Utils.formatRupiah(total);
  },
  async checkoutPos() {
    if (this.posCart.length === 0) {
      Swal.fire('Kasir Kosong', 'Tambahkan barang terlebih dahulu.', 'warning');
      return;
    }
    let total = 0;
    const items = this.posCart.map(it => {
      const sub = it.harga * it.qty;
      total += sub;
      return {
        id: it.id,
        nama: it.nama,
        variasi: 'Standar',
        harga: it.harga,
        qty: it.qty,
        subtotal: sub
      };
    });
    const orderId = 'POS-' + Date.now().toString().slice(-6);
    const payment = document.getElementById('selPosPayment').value;
    const notes = document.getElementById('inpPosNotes').value.trim() || 'Transaksi Langsung Kasir';
    const payload = {
      orderId: orderId,
      namaPemesan: 'Kasir Langsung',
      tipePembeli: 'Langsung',
      metodePembayaran: payment,
      opsiPengambilan: 'Langsung Kasir',
      catatan: notes,
      items: items,
      totalBayar: total,
      status: 'Selesai',
      createdAt: new Date().toISOString(),
      selesaiPada: new Date().toISOString()
    };
    try {
      await fetch(this.RTDB_BASE + '/orders/' + orderId + '.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      for (const item of this.posCart) {
        const prod = this.products[item.id];
        if (prod) {
          const newStok = Math.max(0, (parseInt(prod.stok) || 0) - item.qty);
          await this.updateStock(item.id, newStok);
        }
      }
      playScanSound(true);
      Swal.fire('Transaksi Selesai!', 'Penjualan kasir senilai ' + Utils.formatRupiah(total) + ' berhasil dibukukan.', 'success');
      this.clearPosCart();
      this.loadAllData().then(() => this.renderAll());
    } catch (e) {
      Swal.fire('Error', 'Gagal memproses transaksi kasir', 'error');
    }
  },
  openProductModal(productId = null) {
    const isEdit = !!productId;
    document.getElementById('modalProductTitle').textContent = isEdit ? 'Edit Produk Koperasi' : 'Tambah Produk Baru';
    document.getElementById('inpProdId').value = productId || ('p' + Date.now());
    const p = productId ? this.products[productId] : null;
    document.getElementById('inpProdSku').value = p ? (p.kode || '') : '';
    document.getElementById('inpProdNama').value = p ? p.nama : '';
    document.getElementById('selProdKat').value = p ? (p.kat || 'atk') : 'atk';
    document.getElementById('inpProdHarga').value = p ? p.harga : '';
    document.getElementById('inpProdHargaCoret').value = p ? (p.hargaCoret || '') : '';
    document.getElementById('inpProdStok').value = p ? p.stok : '10';
    document.getElementById('inpProdLabelVar').value = p ? (p.labelVar || 'Pilihan') : 'Pilihan';
    document.getElementById('inpProdVariasi').value = p ? (p.variasi ? p.variasi.join(', ') : '') : 'Standar';
    document.getElementById('inpProdDeskripsi').value = p ? (p.deskripsi || '') : '';
    const fileInp = document.getElementById('inpProdFile');
    if (fileInp) fileInp.value = '';
    const promptEl = document.getElementById('uploadPrompt');
    const progressEl = document.getElementById('uploadProgressBox');
    const previewEl = document.getElementById('uploadPreviewBox');
    if (progressEl) progressEl.classList.add('visually-hidden');
    if (p && p.img) {
      document.getElementById('inpProdDriveLink').value = p.img;
      const prevImg = document.getElementById('serverPreviewImg');
      if (prevImg) prevImg.src = Utils.resolveImageUrl(p.img);
      const nameEl = document.getElementById('uploadServerFileName');
      if (nameEl) nameEl.textContent = p.kode ? (p.kode + ' - Server Media MUSADA') : 'Foto Produk Tersimpan';
      if (promptEl) promptEl.classList.add('visually-hidden');
      if (previewEl) previewEl.classList.remove('visually-hidden');
    } else {
      document.getElementById('inpProdDriveLink').value = '';
      const prevImg = document.getElementById('serverPreviewImg');
      if (prevImg) prevImg.src = '';
      if (promptEl) promptEl.classList.remove('visually-hidden');
      if (previewEl) previewEl.classList.add('visually-hidden');
    }
    const modal = document.getElementById('modalProduct');
    if (modal) modal.classList.add('active');
  },
  closeProductModal() {
    const modal = document.getElementById('modalProduct');
    if (modal) modal.classList.remove('active');
  },
  compressImage(file, maxDim = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          let dataUrl = canvas.toDataURL('image/webp', quality);
          let mime = 'image/webp';
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            mime = 'image/jpeg';
          }
          const base64Data = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : dataUrl;
          resolve({ dataUrl, base64Data, mimeType: mime });
        };
        img.onerror = () => reject(new Error('Gagal membaca gambar'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  },
  async uploadProductImage(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire('Format Salah', 'Pilih file gambar valid (JPG, PNG, atau WebP).', 'warning');
      return;
    }
    const promptEl = document.getElementById('uploadPrompt');
    const progressEl = document.getElementById('uploadProgressBox');
    const previewEl = document.getElementById('uploadPreviewBox');
    const progressTxt = document.getElementById('uploadProgressText');
    if (promptEl) promptEl.classList.add('visually-hidden');
    if (previewEl) previewEl.classList.add('visually-hidden');
    if (progressEl) progressEl.classList.remove('visually-hidden');
    if (progressTxt) progressTxt.textContent = 'Mengompresi foto produk...';
    try {
      const compressed = await this.compressImage(file);
      if (progressTxt) progressTxt.textContent = 'Menyimpan di Server Media MUSADA...';
      const skuVal = document.getElementById('inpProdSku').value.trim();
      const cleanSku = (skuVal || 'item').replace(/[^a-zA-Z0-9_-]/g, '_');
      const ext = compressed.mimeType === 'image/webp' ? '.webp' : '.jpg';
      const fileName = 'mart_' + cleanSku + '_' + Date.now() + ext;
      const folderId = (this.settings && this.settings.driveFolderId) ? this.settings.driveFolderId.trim() : '';
      const params = new URLSearchParams();
      params.append('action', 'upload');
      params.append('fileName', fileName);
      params.append('mimeType', compressed.mimeType);
      params.append('fileData', compressed.base64Data);
      params.append('folderKey', 'musada_mart');
      if (folderId) params.append('folderId', folderId);
      const res = await fetch(this.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: params.toString()
      });
      const result = await res.json();
      if (!result || result.status !== 'success' || !result.fileUrl) {
        throw new Error(result && result.message ? result.message : 'Koneksi server gagal');
      }
      document.getElementById('inpProdDriveLink').value = result.fileUrl;
      const prevImg = document.getElementById('serverPreviewImg');
      if (prevImg) prevImg.src = Utils.resolveImageUrl(result.fileUrl);
      const nameEl = document.getElementById('uploadServerFileName');
      if (nameEl) nameEl.textContent = fileName;
      if (progressEl) progressEl.classList.add('visually-hidden');
      if (previewEl) previewEl.classList.remove('visually-hidden');
    } catch (err) {
      if (progressEl) progressEl.classList.add('visually-hidden');
      if (promptEl) promptEl.classList.remove('visually-hidden');
      Swal.fire('Upload Gagal', 'Gagal mengunggah foto ke Server Media: ' + (err.message || 'Koneksi terganggu'), 'error');
    }
  },
  removeProductImage() {
    document.getElementById('inpProdDriveLink').value = '';
    const fileInp = document.getElementById('inpProdFile');
    if (fileInp) fileInp.value = '';
    const previewEl = document.getElementById('uploadPreviewBox');
    const promptEl = document.getElementById('uploadPrompt');
    if (previewEl) previewEl.classList.add('visually-hidden');
    if (promptEl) promptEl.classList.remove('visually-hidden');
  },
  async saveProduct() {
    const id = document.getElementById('inpProdId').value;
    const sku = document.getElementById('inpProdSku').value.trim();
    const nama = document.getElementById('inpProdNama').value.trim();
    const kat = document.getElementById('selProdKat').value;
    const harga = parseInt(document.getElementById('inpProdHarga').value) || 0;
    const hargaCoret = parseInt(document.getElementById('inpProdHargaCoret').value) || 0;
    const stok = parseInt(document.getElementById('inpProdStok').value) || 0;
    const labelVar = document.getElementById('inpProdLabelVar').value.trim() || 'Pilihan';
    const variasiRaw = document.getElementById('inpProdVariasi').value.trim();
    const variasi = variasiRaw ? variasiRaw.split(',').map(s => s.trim()).filter(Boolean) : ['Standar'];
    const driveLink = document.getElementById('inpProdDriveLink').value.trim();
    const deskripsi = document.getElementById('inpProdDeskripsi').value.trim();
    if (!sku || !nama || harga <= 0) {
      Swal.fire('Input Kurang', 'Harap lengkapi SKU, Nama, dan Harga Produk.', 'warning');
      return;
    }
    const payload = {
      id: id,
      kode: sku.toUpperCase(),
      nama: nama,
      kat: kat,
      harga: harga,
      hargaCoret: hargaCoret,
      stok: stok,
      labelVar: labelVar,
      variasi: variasi,
      img: driveLink,
      galeri: driveLink ? [driveLink] : [],
      deskripsi: deskripsi
    };
    try {
      await fetch(this.RTDB_BASE + '/products/' + id + '.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      this.products[id] = payload;
      this.closeProductModal();
      Swal.fire('Tersimpan', 'Produk ' + nama + ' berhasil diperbarui di database.', 'success');
      this.renderStockTable();
      this.renderStats();
    } catch (e) {
      Swal.fire('Error', 'Gagal menyimpan produk ke database', 'error');
    }
  },
  async deleteProduct(productId) {
    const p = this.products[productId];
    const res = await Swal.fire({
      title: 'Hapus Produk?',
      text: 'Produk "' + (p ? p.nama : productId) + '" akan dihapus permanen dari etalase.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (!res.isConfirmed) return;
    try {
      await fetch(this.RTDB_BASE + '/products/' + productId + '.json', {
        method: 'DELETE'
      });
      delete this.products[productId];
      Swal.fire('Dihapus', 'Produk berhasil dihapus.', 'info');
      this.renderStockTable();
      this.renderStats();
    } catch (e) {
      Swal.fire('Error', 'Gagal menghapus produk', 'error');
    }
  },
  renderSettingsForm() {
    if (!this.settings) return;
    if (this.settings.namaKoperasi) document.getElementById('inpSettingNamaKoperasi').value = this.settings.namaKoperasi;
    if (this.settings.waAdmin) document.getElementById('inpSettingWa').value = this.settings.waAdmin;
    if (this.settings.jamPelayanan) document.getElementById('inpSettingJam').value = this.settings.jamPelayanan;
    if (this.settings.minStockAlert) document.getElementById('inpSettingMinStock').value = this.settings.minStockAlert;
    if (this.settings.driveFolderId) document.getElementById('inpSettingDriveFolder').value = this.settings.driveFolderId;
  },
  async saveSettings() {
    const payload = {
      namaKoperasi: document.getElementById('inpSettingNamaKoperasi').value.trim(),
      waAdmin: document.getElementById('inpSettingWa').value.trim(),
      jamPelayanan: document.getElementById('inpSettingJam').value.trim(),
      minStockAlert: parseInt(document.getElementById('inpSettingMinStock').value) || 5,
      driveFolderId: document.getElementById('inpSettingDriveFolder').value.trim()
    };
    try {
      await fetch(this.RTDB_BASE + '/settings.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      this.settings = payload;
      Swal.fire('Pengaturan Tersimpan', 'Informasi koperasi berhasil diperbarui.', 'success');
    } catch (e) {
      Swal.fire('Error', 'Gagal menyimpan pengaturan', 'error');
    }
  }
};
document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    if (action === 'switch-tab') {
      AdminApp.switchTab(el.dataset.tab);
    } else if (action === 'toggle-scanner') {
      AdminApp.toggleScanner();
    } else if (action === 'set-scan-mode') {
      AdminApp.setScanMode(el.dataset.mode);
    } else if (action === 'submit-manual-code') {
      AdminApp.manualScanSubmit();
    } else if (action === 'complete-scanned-order') {
      AdminApp.completeOrder(el.dataset.id);
    } else if (action === 'quick-adjust-scanned') {
      AdminApp.stepStock(el.dataset.id, parseInt(el.dataset.delta));
    } else if (action === 'add-pos-item') {
      AdminApp.addToPos(el.dataset.id);
    } else if (action === 'pos-qty') {
      AdminApp.updatePosQty(parseInt(el.dataset.index), parseInt(el.dataset.delta));
    } else if (action === 'clear-pos') {
      AdminApp.clearPosCart();
    } else if (action === 'checkout-pos') {
      AdminApp.checkoutPos();
    } else if (action === 'step-stock') {
      AdminApp.stepStock(el.dataset.id, parseInt(el.dataset.delta));
    } else if (action === 'open-add-product-modal') {
      AdminApp.openProductModal();
    } else if (action === 'edit-product') {
      AdminApp.openProductModal(el.dataset.id);
    } else if (action === 'delete-product') {
      AdminApp.deleteProduct(el.dataset.id);
    } else if (action === 'close-product-modal') {
      AdminApp.closeProductModal();
    } else if (action === 'save-product') {
      AdminApp.saveProduct();
    } else if (action === 'complete-order') {
      AdminApp.completeOrder(el.dataset.id);
    } else if (action === 'cancel-order') {
      AdminApp.cancelOrder(el.dataset.id);
    } else if (action === 'view-order-detail') {
      AdminApp.viewOrderDetail(el.dataset.id);
    } else if (action === 'save-settings') {
      AdminApp.saveSettings();
    } else if (action === 'refresh-data') {
      AdminApp.loadAllData().then(() => {
        AdminApp.renderAll();
        Swal.fire('Sinkron', 'Data RTDB berhasil diperbarui.', 'success');
      });
    } else if (action === 'trigger-file-select') {
      const fileInp = document.getElementById('inpProdFile');
      if (fileInp) fileInp.click();
    } else if (action === 'remove-product-image') {
      AdminApp.removeProductImage();
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'selFilterOrderStatus') {
      AdminApp.filterOrderStatus = e.target.value;
      AdminApp.renderOrdersTable();
    } else if (e.target.id === 'selFilterProductKat') {
      AdminApp.filterProductCategory = e.target.value;
      AdminApp.renderStockTable();
    } else if (e.target.id === 'cbFilterLowStock') {
      AdminApp.filterLowStockOnly = e.target.checked;
      AdminApp.renderStockTable();
    } else if (e.target.dataset.action === 'input-stock') {
      AdminApp.updateStock(e.target.dataset.id, e.target.value);
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'inpSearchProduct') {
      AdminApp.searchProductQuery = e.target.value.trim();
      AdminApp.renderStockTable();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.id === 'inpManualCode') {
      AdminApp.manualScanSubmit();
    }
  });
});