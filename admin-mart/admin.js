const RTDB_BASE = 'https://musada-sd-default-rtdb.firebaseio.com/mart';
const scanSound = new Audio('assets/audio/scanner-correct.mp3');
const scanWrongSound = new Audio('assets/audio/scanner-wrong.mp3');
function playScanSound(success = true) {
  try {
    if (success) {
      scanSound.currentTime = 0;
      scanSound.play().catch(() => {});
    } else {
      scanWrongSound.currentTime = 0;
      scanWrongSound.play().catch(() => {});
    }
  } catch (e) {}
}
const Utils = {
  formatRupiah(amount) {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  },
  resolveImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (trimmed.includes('drive.google.com') || trimmed.includes('drive.usercontent.google.com')) {
      const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return 'https://drive.google.com/thumbnail?id=' + match[1] + '&sz=w1000';
      }
    }
    return trimmed;
  },
  getCategoryIcon(kat) {
    const k = (kat || '').toLowerCase();
    if (k.includes('atk')) return 'fa-solid fa-pen-ruler';
    if (k.includes('seragam')) return 'fa-solid fa-shirt';
    if (k.includes('buku')) return 'fa-solid fa-book';
    if (k.includes('makan') || k.includes('minum')) return 'fa-solid fa-cookie-bite';
    return 'fa-solid fa-bag-shopping';
  }
};
const AdminApp = {
  products: {},
  orders: {},
  settings: {},
  posCart: [],
  scanner: null,
  isScanning: false,
  scanMode: 'order',
  activeTab: 'tabScanner',
  filterOrderStatus: 'all',
  searchProductQuery: '',
  filterProductCategory: 'all',
  filterLowStockOnly: false,
  async init() {
    await this.loadAllData();
    this.initScanner();
    this.renderAll();
    setInterval(() => this.loadOrdersSilently(), 15000);
  },
  async loadAllData() {
    try {
      const [resProd, resOrd, resSet] = await Promise.all([
        fetch(`${RTDB_BASE}/products.json`),
        fetch(`${RTDB_BASE}/orders.json`),
        fetch(`${RTDB_BASE}/settings.json`)
      ]);
      if (resProd.ok) this.products = (await resProd.json()) || {};
      if (resOrd.ok) this.orders = (await resOrd.json()) || {};
      if (resSet.ok) this.settings = (await resSet.json()) || {};
    } catch (e) {
      Swal.fire('Error', 'Gagal memuat data dari Firebase RTDB', 'error');
    }
  },
  async loadOrdersSilently() {
    try {
      const res = await fetch(`${RTDB_BASE}/orders.json`);
      if (res.ok) {
        this.orders = (await res.json()) || {};
        this.updateOrderBadges();
        if (this.activeTab === 'tabOrders') this.renderOrdersTable();
      }
    } catch (e) {}
  },
  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.admin-nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    document.querySelectorAll('.admin-tab-content').forEach(c => {
      c.classList.toggle('active', c.id === tabId);
    });
    if (tabId === 'tabScanner') {
      if (!this.isScanning) this.startScanner();
    } else {
      if (this.isScanning) this.stopScanner();
    }
    this.renderAll();
  },
  initScanner() {
    if (typeof Html5Qrcode === 'undefined') return;
    try {
      this.scanner = new Html5Qrcode('reader');
      this.startScanner();
    } catch (e) {}
  },
  async startScanner() {
    if (!this.scanner || this.isScanning) return;
    try {
      await this.scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => this.handleScanSuccess(decodedText.trim()),
        () => {}
      );
      this.isScanning = true;
      const btn = document.getElementById('btnToggleScanner');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-stop"></i> Matikan Kamera';
    } catch (e) {
      this.isScanning = false;
      const btn = document.getElementById('btnToggleScanner');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Nyalakan Kamera';
    }
  },
  async stopScanner() {
    if (!this.scanner || !this.isScanning) return;
    try {
      await this.scanner.stop();
      this.isScanning = false;
      const btn = document.getElementById('btnToggleScanner');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Nyalakan Kamera';
    } catch (e) {}
  },
  toggleScanner() {
    if (this.isScanning) {
      this.stopScanner();
    } else {
      this.startScanner();
    }
  },
  setScanMode(mode) {
    this.scanMode = mode;
    document.querySelectorAll('.scanner-mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
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
    const inp = document.getElementById('inpManualCode');
    if (!inp || !inp.value.trim()) return;
    const code = inp.value.trim();
    this.handleScanSuccess(code);
    inp.value = '';
  },
  processOrderScan(orderId) {
    const cleanId = orderId.replace(/^#/, '');
    const order = this.orders[cleanId];
    const container = document.getElementById('scanResultContainer');
    if (!order) {
      playScanSound(false);
      container.innerHTML = '<div style="color:var(--red);font-weight:700;"><i class="fa-solid fa-triangle-exclamation"></i> Pesanan #' + cleanId + ' tidak ditemukan di database!</div>';
      return;
    }
    playScanSound(true);
    let itemsHtml = '';
    order.items.forEach(i => {
      itemsHtml += '<div>• ' + i.nama + ' (' + i.variasi + ') <strong>x' + i.qty + '</strong></div>';
    });
    const isDone = order.status === 'Selesai';
    const statusClass = isDone ? 'done' : (order.status === 'Dibatalkan' ? 'cancelled' : 'pending');
    container.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<strong style="font-size:14px;color:var(--primary);">PESANAN #' + order.orderId + '</strong>' +
      '<span class="status-pill ' + statusClass + '">' + order.status + '</span>' +
      '</div>' +
      '<div style="font-size:12px;margin-bottom:6px;">Pemesan: <strong>' + order.namaPemesan + '</strong> (' + (order.tipePembeli || '').toUpperCase() + ')</div>' +
      (order.namaSiswa ? '<div style="font-size:12px;margin-bottom:6px;">Siswa: <strong>' + order.namaSiswa + '</strong> (' + order.kelasSiswa + ')</div>' : '') +
      '<div style="font-size:12px;margin-bottom:6px;">Penyerahan: <strong>' + order.opsiPengambilan + '</strong></div>' +
      '<div style="font-size:12px;margin-bottom:6px;">Pembayaran: <strong>' + order.metodePembayaran + ' (' + Utils.formatRupiah(order.totalBayar) + ')</strong></div>' +
      '<div style="background:#ffffff;padding:8px;border-radius:4px;border:1px solid var(--border);margin-bottom:10px;">' + itemsHtml + '</div>' +
      (!isDone ? '<button class="btn btn-secondary btn-block" data-action="complete-scanned-order" data-id="' + order.orderId + '"><i class="fa-solid fa-check-double"></i> Serahkan Barang & Tandai Selesai</button>' : '<div style="color:var(--green);font-weight:700;text-align:center;"><i class="fa-solid fa-circle-check"></i> Pesanan ini sudah selesai diambil.</div>');
  },
  processProductScan(code) {
    const product = Object.values(this.products).find(p => (p.kode && p.kode.toLowerCase() === code.toLowerCase()) || (p.id && p.id.toLowerCase() === code.toLowerCase()));
    const container = document.getElementById('scanResultContainer');
    if (!product) {
      playScanSound(false);
      container.innerHTML = '<div style="color:var(--red);font-weight:700;"><i class="fa-solid fa-triangle-exclamation"></i> Produk dengan SKU/Kode "' + code + '" tidak ditemukan!</div>';
      return;
    }
    playScanSound(true);
    const imgHtml = product.img
      ? '<img src="' + Utils.resolveImageUrl(product.img) + '" class="table-img">'
      : '<div class="table-placeholder"><i class="' + Utils.getCategoryIcon(product.kat) + '"></i></div>';
    container.innerHTML = '<div style="display:flex;gap:12px;align-items:center;">' +
      imgHtml +
      '<div style="flex:1;">' +
      '<span class="sku-badge">' + (product.kode || product.id) + '</span>' +
      '<div style="font-size:14px;font-weight:700;color:var(--dark);">' + product.nama + '</div>' +
      '<div style="color:var(--primary);font-weight:700;">' + Utils.formatRupiah(product.harga) + '</div>' +
      '</div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid var(--border);">' +
      '<div>Stok Fisik: <strong id="lblScanStock" style="font-size:16px;color:var(--primary);">' + product.stok + '</strong></div>' +
      '<div style="display:flex;gap:6px;">' +
      '<button class="btn btn-outline btn-sm" data-action="quick-adjust-scanned" data-id="' + product.id + '" data-delta="-1">-1</button>' +
      '<button class="btn btn-outline btn-sm" data-action="quick-adjust-scanned" data-id="' + product.id + '" data-delta="1">+1</button>' +
      '<button class="btn btn-outline btn-sm" data-action="quick-adjust-scanned" data-id="' + product.id + '" data-delta="5">+5</button>' +
      '<button class="btn btn-primary btn-sm" data-action="add-pos-item" data-id="' + product.id + '"><i class="fa-solid fa-cart-plus"></i> + Kasir</button>' +
      '</div>' +
      '</div>';
  },
  async completeOrder(orderId) {
    try {
      const order = this.orders[orderId];
      if (!order) return;
      order.status = 'Selesai';
      order.completedAt = new Date().toISOString();
      await fetch(`${RTDB_BASE}/orders/${orderId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Selesai', completedAt: order.completedAt })
      });
      playScanSound(true);
      Swal.fire({ title: 'Berhasil!', text: 'Pesanan #' + orderId + ' ditandai Selesai.', icon: 'success', timer: 1500 });
      this.renderOrdersTable();
      this.updateOrderBadges();
      const container = document.getElementById('scanResultContainer');
      if (container) container.innerHTML = '<div style="color:var(--green);font-weight:700;"><i class="fa-solid fa-circle-check"></i> Pesanan #' + orderId + ' telah diserahkan & selesai!</div>';
    } catch (e) {
      Swal.fire('Error', 'Gagal memperbarui status pesanan', 'error');
    }
  },
  async cancelOrder(orderId) {
    const confirm = await Swal.fire({
      title: 'Batalkan Pesanan?',
      text: 'Pesanan #' + orderId + ' akan dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Batalkan'
    });
    if (!confirm.isConfirmed) return;
    try {
      await fetch(`${RTDB_BASE}/orders/${orderId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Dibatalkan' })
      });
      this.orders[orderId].status = 'Dibatalkan';
      Swal.fire('Dibatalkan', 'Pesanan #' + orderId + ' telah dibatalkan.', 'info');
      this.renderOrdersTable();
      this.updateOrderBadges();
    } catch (e) {
      Swal.fire('Error', 'Gagal membatalkan pesanan', 'error');
    }
  },
  renderAll() {
    this.updateOrderBadges();
    this.renderStats();
    this.renderStockTable();
    this.renderOrdersTable();
    this.renderPosCart();
    this.renderSettingsForm();
  },
  updateOrderBadges() {
    const pendingCount = Object.values(this.orders).filter(o => o.status === 'Menunggu Diambil').length;
    const badge = document.getElementById('badgePendingOrders');
    if (badge) badge.textContent = pendingCount;
  },
  renderStats() {
    const productList = Object.values(this.products);
    const orderList = Object.values(this.orders);
    const totalSku = productList.length;
    const totalUnits = productList.reduce((acc, p) => acc + (parseInt(p.stok) || 0), 0);
    const lowStockCount = productList.filter(p => (parseInt(p.stok) || 0) < 10).length;
    const completedOrders = orderList.filter(o => o.status === 'Selesai');
    const totalOmzet = completedOrders.reduce((acc, o) => acc + (parseInt(o.totalBayar) || 0), 0);
    const elSku = document.getElementById('statTotalSku');
    const elUnits = document.getElementById('statTotalUnits');
    const elLow = document.getElementById('statLowStock');
    const elOmzet = document.getElementById('statTotalOmzet');
    if (elSku) elSku.textContent = totalSku;
    if (elUnits) elUnits.textContent = totalUnits;
    if (elLow) elLow.textContent = lowStockCount;
    if (elOmzet) elOmzet.textContent = Utils.formatRupiah(totalOmzet);
  },
  renderStockTable() {
    const tbody = document.getElementById('stockTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let list = Object.values(this.products);
    if (this.filterProductCategory !== 'all') {
      list = list.filter(p => p.kat === this.filterProductCategory);
    }
    if (this.filterLowStockOnly) {
      list = list.filter(p => (parseInt(p.stok) || 0) < 10);
    }
    if (this.searchProductQuery) {
      const q = this.searchProductQuery.toLowerCase();
      list = list.filter(p => (p.nama && p.nama.toLowerCase().includes(q)) || (p.kode && p.kode.toLowerCase().includes(q)));
    }
    list.forEach(p => {
      const tr = document.createElement('tr');
      const imgHtml = p.img
        ? '<img src="' + Utils.resolveImageUrl(p.img) + '" class="table-img">'
        : '<div class="table-placeholder"><i class="' + Utils.getCategoryIcon(p.kat) + '"></i></div>';
      tr.innerHTML = '<td>' + imgHtml + '</td>' +
        '<td><span class="sku-badge">' + (p.kode || p.id) + '</span></td>' +
        '<td><strong>' + p.nama + '</strong><br><span style="color:var(--gray);">' + (p.kat || '').toUpperCase() + '</span></td>' +
        '<td><strong>' + Utils.formatRupiah(p.harga) + '</strong></td>' +
        '<td>' +
        '<div class="stock-stepper">' +
        '<button data-action="step-stock" data-id="' + p.id + '" data-delta="-1">-</button>' +
        '<input type="number" value="' + p.stok + '" data-action="input-stock" data-id="' + p.id + '">' +
        '<button data-action="step-stock" data-id="' + p.id + '" data-delta="1">+</button>' +
        '</div>' +
        '</td>' +
        '<td>' +
        '<div style="display:flex;gap:4px;">' +
        '<button class="btn btn-outline btn-sm" data-action="edit-product" data-id="' + p.id + '" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>' +
        '<button class="btn btn-outline btn-sm" style="color:var(--red);" data-action="delete-product" data-id="' + p.id + '" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>' +
        '</div>' +
        '</td>';
      tbody.appendChild(tr);
    });
  },
  async updateStock(productId, newStok) {
    const val = Math.max(0, parseInt(newStok) || 0);
    if (this.products[productId]) {
      this.products[productId].stok = val;
    }
    try {
      await fetch(`${RTDB_BASE}/products/${productId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stok: val })
      });
      this.renderStats();
    } catch (e) {}
  },
  async stepStock(productId, delta) {
    const current = parseInt(this.products[productId]?.stok) || 0;
    const nextVal = Math.max(0, current + delta);
    await this.updateStock(productId, nextVal);
    this.renderStockTable();
    const scanLbl = document.getElementById('lblScanStock');
    if (scanLbl) scanLbl.textContent = nextVal;
  },
  renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let list = Object.values(this.orders);
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (this.filterOrderStatus !== 'all') {
      list = list.filter(o => o.status === this.filterOrderStatus);
    }
    list.forEach(o => {
      const tr = document.createElement('tr');
      const isDone = o.status === 'Selesai';
      const statusClass = isDone ? 'done' : (o.status === 'Dibatalkan' ? 'cancelled' : 'pending');
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';
      tr.innerHTML = '<td><strong>#' + o.orderId + '</strong><br><span style="color:var(--gray);">' + dateStr + '</span></td>' +
        '<td><strong>' + o.namaPemesan + '</strong><br><span style="color:var(--gray);">' + (o.tipePembeli || '').toUpperCase() + '</span></td>' +
        '<td>' + (o.namaSiswa ? '<strong>' + o.namaSiswa + '</strong><br><span style="color:var(--gray);">' + o.kelasSiswa + '</span>' : '-') + '</td>' +
        '<td>' + o.opsiPengambilan + '</td>' +
        '<td><strong>' + Utils.formatRupiah(o.totalBayar) + '</strong><br><span style="color:var(--gray);">' + o.metodePembayaran + '</span></td>' +
        '<td><span class="status-pill ' + statusClass + '">' + o.status + '</span></td>' +
        '<td>' +
        '<div style="display:flex;gap:4px;">' +
        (!isDone && o.status !== 'Dibatalkan' ? '<button class="btn btn-secondary btn-sm" data-action="complete-order" data-id="' + o.orderId + '" title="Tandai Selesai"><i class="fa-solid fa-check"></i></button>' : '') +
        (!isDone && o.status !== 'Dibatalkan' ? '<button class="btn btn-outline btn-sm" style="color:var(--red);" data-action="cancel-order" data-id="' + o.orderId + '" title="Batalkan"><i class="fa-solid fa-xmark"></i></button>' : '') +
        '<button class="btn btn-outline btn-sm" data-action="view-order-detail" data-id="' + o.orderId + '" title="Detail"><i class="fa-solid fa-eye"></i></button>' +
        '</div>' +
        '</td>';
      tbody.appendChild(tr);
    });
  },
  viewOrderDetail(orderId) {
    const o = this.orders[orderId];
    if (!o) return;
    let itemsHtml = '';
    o.items.forEach(i => {
      itemsHtml += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #eee;">' +
        '<div>' + i.nama + ' (' + i.variasi + ') x' + i.qty + '</div>' +
        '<div><strong>' + Utils.formatRupiah(i.subtotal) + '</strong></div>' +
        '</div>';
    });
    Swal.fire({
      title: 'Detail Pesanan #' + o.orderId,
      html: '<div style="text-align:left;font-size:12px;">' +
        '<p><strong>Pemesan:</strong> ' + o.namaPemesan + ' (' + o.tipePembeli + ')</p>' +
        (o.namaSiswa ? '<p><strong>Siswa:</strong> ' + o.namaSiswa + ' (' + o.kelasSiswa + ')</p>' : '') +
        '<p><strong>No. WhatsApp:</strong> ' + o.noWa + '</p>' +
        '<p><strong>Opsi Pengambilan:</strong> ' + o.opsiPengambilan + '</p>' +
        '<p><strong>Pembayaran:</strong> ' + o.metodePembayaran + '</p>' +
        (o.catatan ? '<p><strong>Catatan:</strong> ' + o.catatan + '</p>' : '') +
        '<div style="margin:12px 0;background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">' + itemsHtml + '</div>' +
        '<div style="font-size:14px;font-weight:800;color:var(--primary);text-align:right;">Total: ' + Utils.formatRupiah(o.totalBayar) + '</div>' +
        '</div>',
      confirmButtonText: 'Tutup'
    });
  },
  addToPos(productId) {
    const p = this.products[productId];
    if (!p) return;
    const existing = this.posCart.find(i => i.id === productId);
    if (existing) {
      existing.qty++;
    } else {
      this.posCart.push({
        id: p.id,
        kode: p.kode || p.id,
        nama: p.nama,
        harga: p.harga,
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
    container.innerHTML = '';
    let total = 0;
    this.posCart.forEach((item, idx) => {
      total += item.harga * item.qty;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px dashed var(--border-light);';
      row.innerHTML = '<div><strong>' + item.nama + '</strong><br><span style="color:var(--gray);">' + Utils.formatRupiah(item.harga) + '</span></div>' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
        '<button class="btn btn-outline btn-sm" data-action="pos-qty" data-index="' + idx + '" data-delta="-1">-</button>' +
        '<span>' + item.qty + '</span>' +
        '<button class="btn btn-outline btn-sm" data-action="pos-qty" data-index="' + idx + '" data-delta="1">+</button>' +
        '</div>';
      container.appendChild(row);
    });
    const elTotal = document.getElementById('posTotalBayar');
    if (elTotal) elTotal.textContent = Utils.formatRupiah(total);
  },
  async checkoutPos() {
    if (this.posCart.length === 0) {
      Swal.fire('Kasir Kosong', 'Tambahkan produk terlebih dahulu.', 'info');
      return;
    }
    const total = this.posCart.reduce((acc, i) => acc + (i.harga * i.qty), 0);
    const orderId = 'POS-' + Math.floor(100000 + Math.random() * 900000);
    const order = {
      orderId: orderId,
      orderNumber: orderId,
      createdAt: new Date().toISOString(),
      status: 'Selesai',
      tipePembeli: 'Langsung Kasir',
      namaPemesan: 'Pembeli Kasir Koperasi',
      noWa: '-',
      opsiPengambilan: 'Ambil Sendiri di Toko Koperasi (Langsung)',
      metodePembayaran: 'Tunai Kasir',
      items: this.posCart.map(i => ({
        id: i.id,
        kode: i.kode,
        nama: i.nama,
        variasi: 'Standar',
        harga: i.harga,
        qty: i.qty,
        subtotal: i.harga * i.qty
      })),
      totalItem: this.posCart.reduce((acc, i) => acc + i.qty, 0),
      totalBayar: total
    };
    try {
      await fetch(`${RTDB_BASE}/orders/${orderId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      for (const item of this.posCart) {
        const prod = this.products[item.id];
        if (prod) {
          const nextStok = Math.max(0, (prod.stok || 0) - item.qty);
          this.updateStock(item.id, nextStok);
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
    document.getElementById('inpProdDriveLink').value = p ? (p.img || '') : '';
    document.getElementById('inpProdDeskripsi').value = p ? (p.deskripsi || '') : '';
    this.updateDrivePreview();
    const modal = document.getElementById('modalProduct');
    if (modal) modal.classList.add('active');
  },
  closeProductModal() {
    const modal = document.getElementById('modalProduct');
    if (modal) modal.classList.remove('active');
  },
  updateDrivePreview() {
    const val = document.getElementById('inpProdDriveLink').value.trim();
    const imgEl = document.getElementById('drivePreviewImg');
    const txtEl = document.getElementById('drivePreviewText');
    if (!val) {
      if (imgEl) imgEl.style.display = 'none';
      if (txtEl) txtEl.textContent = 'Tempel link share Google Drive di atas untuk melihat preview gambar.';
      return;
    }
    const resolved = Utils.resolveImageUrl(val);
    if (imgEl) {
      imgEl.src = resolved;
      imgEl.style.display = 'block';
    }
    if (txtEl) txtEl.textContent = 'URL Drive terkonversi valid untuk web.';
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
      await fetch(`${RTDB_BASE}/products/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      this.products[id] = payload;
      this.closeProductModal();
      Swal.fire('Berhasil!', 'Data produk tersimpan ke Firebase RTDB.', 'success');
      this.renderAll();
    } catch (e) {
      Swal.fire('Error', 'Gagal menyimpan produk ke database', 'error');
    }
  },
  async deleteProduct(productId) {
    const confirm = await Swal.fire({
      title: 'Hapus Produk?',
      text: 'Produk akan dihapus permanen dari katalog koperasi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    });
    if (!confirm.isConfirmed) return;
    try {
      await fetch(`${RTDB_BASE}/products/${productId}.json`, { method: 'DELETE' });
      delete this.products[productId];
      Swal.fire('Terhapus', 'Produk berhasil dihapus.', 'success');
      this.renderAll();
    } catch (e) {
      Swal.fire('Error', 'Gagal menghapus produk', 'error');
    }
  },
  renderSettingsForm() {
    const s = this.settings || {};
    const inpNama = document.getElementById('setStoreName');
    const inpWa = document.getElementById('setContactWa');
    const inpHours = document.getElementById('setOpenHours');
    const inpLoc = document.getElementById('setLocation');
    if (inpNama) inpNama.value = s.storeName || 'MUSADA Mart';
    if (inpWa) inpWa.value = s.contactWa || '6285964399398';
    if (inpHours) inpHours.value = s.openHours || 'Senin - Jumat: 07.00 - 15.00 WIB';
    if (inpLoc) inpLoc.value = s.location || 'Gedung Utama Lantai 1, SD Muhammadiyah 1 Sedati';
  },
  async saveSettings() {
    const payload = {
      storeName: document.getElementById('setStoreName').value.trim(),
      contactWa: document.getElementById('setContactWa').value.trim(),
      openHours: document.getElementById('setOpenHours').value.trim(),
      location: document.getElementById('setLocation').value.trim(),
      updatedAt: new Date().toISOString()
    };
    try {
      await fetch(`${RTDB_BASE}/settings.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      this.settings = payload;
      Swal.fire('Berhasil', 'Pengaturan koperasi diperbarui di RTDB.', 'success');
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
      AdminApp.stepStock(el.dataset.id, parseInt(el.dataset.delta) || 1);
    } else if (action === 'add-pos-item') {
      AdminApp.addToPos(el.dataset.id);
    } else if (action === 'pos-qty') {
      AdminApp.updatePosQty(parseInt(el.dataset.index), parseInt(el.dataset.delta) || 1);
    } else if (action === 'clear-pos') {
      AdminApp.clearPosCart();
    } else if (action === 'checkout-pos') {
      AdminApp.checkoutPos();
    } else if (action === 'step-stock') {
      AdminApp.stepStock(el.dataset.id, parseInt(el.dataset.delta) || 1);
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
        Swal.fire({ title: 'Tersinkronisasi', text: 'Data terbaru dari RTDB berhasil dimuat.', icon: 'success', timer: 1200 });
      });
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
      AdminApp.searchProductQuery = e.target.value;
      AdminApp.renderStockTable();
    } else if (e.target.id === 'inpProdDriveLink') {
      AdminApp.updateDrivePreview();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.id === 'inpManualCode') {
      AdminApp.manualScanSubmit();
    }
  });
});
window.AdminApp = AdminApp;