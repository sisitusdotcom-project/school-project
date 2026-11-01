const HomeView = {
  activeCategory: 'semua',
  searchKeyword: '',
  sortOrder: 'default',
  render() {
    const container = document.getElementById('gridProduk');
    if (!container) return;
    container.innerHTML = '';
    let list = [...DataService.getAll()];
    if (this.activeCategory !== 'semua') {
      list = list.filter(p => p.kat === this.activeCategory);
    }
    if (this.searchKeyword) {
      const kw = this.searchKeyword.toLowerCase().trim();
      list = list.filter(p => 
        (p.nama && p.nama.toLowerCase().includes(kw)) || 
        (p.kode && p.kode.toLowerCase().includes(kw)) ||
        (p.deskripsi && p.deskripsi.toLowerCase().includes(kw)) ||
        (p.kat && p.kat.toLowerCase().includes(kw))
      );
    }
    if (this.sortOrder === 'termurah') {
      list.sort((a, b) => a.harga - b.harga);
    } else if (this.sortOrder === 'termahal') {
      list.sort((a, b) => b.harga - a.harga);
    } else if (this.sortOrder === 'terlaris') {
      list.sort((a, b) => (parseInt(b.terjual) || 0) - (parseInt(a.terjual) || 0));
    }
    const txtJumlah = document.getElementById('txtJumlahKatalog');
    if (txtJumlah) txtJumlah.textContent = list.length + ' Produk';
    if (list.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><h3>Produk tidak ditemukan</h3><p>Coba kata kunci lain atau pilih kategori produk yang berbeda.</p><button class="btn btn-primary btn-sm" data-action="reset-filters">Lihat Semua Produk</button></div>';
      return;
    }
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card-produk';
      const diskonHtml = p.diskon ? '<span class="badge-discount">' + p.diskon + '</span>' : '';
      const hargaCoretHtml = p.hargaCoret ? '<span class="card-price-original">' + Utils.formatRupiah(p.hargaCoret) + '</span>' : '';
      const skuHtml = p.kode ? '<span class="card-sku">' + p.kode + '</span>' : '';
      const imgHtml = p.img
        ? '<img src="' + p.img + '" alt="' + p.nama + '" loading="lazy">'
        : '<div class="card-img-placeholder"><i class="' + Utils.getCategoryIcon(p.kat) + '"></i><span>' + (p.kat || 'KOPERASI').toUpperCase() + '</span></div>';
      card.innerHTML = '<div class="card-img-wrap" data-action="navigate-detail" data-id="' + p.id + '">' +
        imgHtml +
        '<div class="card-badge-top">' + diskonHtml + '</div>' +
        '</div>' +
        '<div class="card-body">' +
        '<div>' +
        '<div style="display: flex; justify-content: space-between; align-items: center;">' +
        '<span class="card-category">' + (p.kat || 'PRODUK').toUpperCase() + '</span>' +
        skuHtml +
        '</div>' +
        '<div class="card-title" data-action="navigate-detail" data-id="' + p.id + '" title="' + p.nama + '">' + p.nama + '</div>' +
        '</div>' +
        '<div class="card-meta">' +
        '<span class="rating-star"><i class="fa-solid fa-star"></i></span>' +
        '<span class="card-rating-bold">' + (p.rating || '5.0') + '</span>' +
        '<span>• Stok ' + (p.stok || '0') + '</span>' +
        '</div>' +
        '<div class="card-price-row">' +
        '<div class="card-price-group">' +
        hargaCoretHtml +
        '<span class="card-price">' + Utils.formatRupiah(p.harga) + '</span>' +
        '</div>' +
        '<button class="btn-card-add" data-action="open-variant-modal" data-id="' + p.id + '" data-mode="cart" title="Tambah ke Keranjang">' +
        '<i class="fa-solid fa-cart-plus"></i>' +
        '</button>' +
        '</div>' +
        '</div>';
      container.appendChild(card);
    });
  }
};
const DetailView = {
  loadProduct(id) {
    const product = DataService.getById(id);
    if (!product) {
      Router.navigate('home');
      return;
    }
    AppService.currentDetailProduct = product;
    AppService.selectedDetailVariant = (product.variasi && product.variasi.length > 0) ? product.variasi[0] : 'Standar';
    document.getElementById('bcCategory').textContent = (product.kat || 'Umum').toUpperCase();
    document.getElementById('bcTitle').textContent = product.nama;
    document.getElementById('detailCategoryLabel').textContent = (product.kat || 'PRODUK').toUpperCase();
    document.getElementById('detailJudul').textContent = product.nama;
    document.getElementById('detailRating').textContent = product.rating || '5.0';
    document.getElementById('detailTerjual').textContent = 'SKU: ' + (product.kode || product.id.toUpperCase());
    document.getElementById('detailStok').textContent = product.stok;
    document.getElementById('detailHarga').textContent = Utils.formatRupiah(product.harga);
    const hargaCoretEl = document.getElementById('detailHargaCoret');
    if (product.hargaCoret) {
      hargaCoretEl.textContent = Utils.formatRupiah(product.hargaCoret);
      hargaCoretEl.style.display = 'block';
    } else {
      hargaCoretEl.style.display = 'none';
    }
    const diskonBadgeEl = document.getElementById('detailDiskonBadge');
    if (product.diskon) {
      diskonBadgeEl.textContent = product.diskon;
      diskonBadgeEl.style.display = 'inline-block';
    } else {
      diskonBadgeEl.style.display = 'none';
    }
    const mainImgWrap = document.getElementById('detailMainImgWrap');
    if (mainImgWrap) {
      mainImgWrap.innerHTML = product.img
        ? '<img id="detailImg" src="' + product.img + '" alt="' + product.nama + '">'
        : '<div class="card-img-placeholder" style="height: 320px;"><i class="' + Utils.getCategoryIcon(product.kat) + '" style="font-size: 56px;"></i><span>' + (product.kat || 'KOPERASI').toUpperCase() + '</span></div>';
    }
    const thumbsContainer = document.getElementById('detailThumbs');
    thumbsContainer.innerHTML = '';
    const gallery = product.galeri || (product.img ? [product.img] : []);
    gallery.forEach((gSrc, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'gallery-thumb' + (index === 0 ? ' aktif' : '');
      thumb.dataset.action = 'select-thumb';
      thumb.dataset.src = gSrc;
      thumb.innerHTML = '<img src="' + gSrc + '" alt="Thumbnail">';
      thumbsContainer.appendChild(thumb);
    });
    document.getElementById('detailLabelVariasi').textContent = (product.labelVar || 'Pilihan') + ':';
    document.getElementById('txtVariasiTerpilih').textContent = AppService.selectedDetailVariant;
    const varContainer = document.getElementById('detailVariasiContainer');
    varContainer.innerHTML = '';
    const variants = product.variasi || ['Standar'];
    variants.forEach((v, index) => {
      const chip = document.createElement('div');
      chip.className = 'variant-chip' + (index === 0 ? ' aktif' : '');
      chip.dataset.action = 'select-detail-variant';
      chip.dataset.variant = v;
      chip.textContent = v;
      varContainer.appendChild(chip);
    });
    document.getElementById('inpDetailQty').value = '1';
    document.getElementById('detailTeks').textContent = product.deskripsi || 'Tidak ada deskripsi tersedia.';
    const specsTable = document.getElementById('detailSpecsTable');
    specsTable.innerHTML = '';
    const specs = { 'Kode SKU': product.kode || product.id.toUpperCase(), ...(product.spesifikasi || {}) };
    for (const [key, val] of Object.entries(specs)) {
      const row = document.createElement('tr');
      row.innerHTML = '<th>' + key + '</th><td>' + val + '</td>';
      specsTable.appendChild(row);
    }
    AppService.switchDetailTab('desc');
  }
};
const CartView = {
  render() {
    const container = document.getElementById('cartListContainer');
    if (!container) return;
    const summary = CartManager.getSummary();
    const items = summary.items;
    container.innerHTML = '';
    document.getElementById('cartTotalItemsCount').textContent = items.length;
    document.getElementById('txtSumTotalItem').textContent = summary.selectedCount + ' pcs';
    document.getElementById('txtSumSubtotal').textContent = Utils.formatRupiah(summary.subtotal);
    document.getElementById('txtSumGrandTotal').textContent = Utils.formatRupiah(summary.subtotal);
    document.getElementById('txtSumBtnCount').textContent = summary.selectedCount;
    document.getElementById('txtTotalBayarMobile').textContent = Utils.formatRupiah(summary.subtotal);
    document.getElementById('txtJmlCheckoutMobile').textContent = summary.selectedCount;
    const cbSemua = document.getElementById('cbPilihSemua');
    const cbSemuaMobile = document.getElementById('cbPilihSemuaMobile');
    if (cbSemua) cbSemua.checked = summary.allSelected;
    if (cbSemuaMobile) cbSemuaMobile.checked = summary.allSelected;
    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-cart-arrow-down"></i><h3>Keranjang belanja masih kosong</h3><p>Temukan alat tulis, seragam, dan perlengkapan sekolah favoritmu sekarang!</p><button class="btn btn-primary btn-sm" data-action="navigate-home"><i class="fa-solid fa-bag-shopping"></i> Mulai Belanja</button></div>';
      return;
    }
    items.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      const imgHtml = item.img
        ? '<img src="' + item.img + '" alt="' + item.nama + '" class="cart-item-img cart-item-img-clean">'
        : '<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;background:#f1f5f9;color:var(--primary);font-size:18px;"><i class="' + Utils.getCategoryIcon(item.kat) + '"></i></div>';
      cartItem.innerHTML = '<div class="cart-item-check">' +
        '<input type="checkbox" class="custom-checkbox" data-action="toggle-cart-item" data-cart-id="' + item.cartId + '" ' + (item.selected ? 'checked' : '') + '>' +
        '</div>' +
        imgHtml +
        '<div class="cart-item-info">' +
        '<div class="cart-item-title cart-item-title-bold">' + item.nama + '</div>' +
        '<div class="cart-item-variant"><span class="card-sku" style="margin-right:4px;">' + (item.kode || '') + '</span>' + (item.labelVar || 'Variasi') + ': ' + item.variasi + '</div>' +
        '<div class="cart-item-price">' + Utils.formatRupiah(item.harga) + '</div>' +
        '<div class="cart-item-actions">' +
        '<div class="qty-control">' +
        '<button data-action="cart-qty" data-cart-id="' + item.cartId + '" data-delta="-1"><i class="fa-solid fa-minus"></i></button>' +
        '<input type="number" value="' + item.qty + '" readonly>' +
        '<button data-action="cart-qty" data-cart-id="' + item.cartId + '" data-delta="1"><i class="fa-solid fa-plus"></i></button>' +
        '</div>' +
        '<button class="cart-delete-btn" data-action="cart-remove" data-cart-id="' + item.cartId + '" title="Hapus"><i class="fa-regular fa-trash-can"></i></button>' +
        '</div>' +
        '</div>';
      container.appendChild(cartItem);
    });
  }
};
const AppService = {
  modalProduct: null,
  modalVariant: null,
  modalMode: 'cart',
  currentDetailProduct: null,
  selectedDetailVariant: null,
  selectedBuyerType: 'wali',
  activeCheckoutItems: [],
  checkoutSource: 'cart',
  lastPlacedOrder: null,
  openVariantModal(productId, mode = 'cart') {
    const product = DataService.getById(productId);
    if (!product) return;
    this.modalProduct = product;
    this.modalMode = mode;
    this.modalVariant = (product.variasi && product.variasi.length > 0) ? product.variasi[0] : 'Standar';
    const modImgWrap = document.getElementById('modVarImgWrap');
    if (modImgWrap) {
      modImgWrap.innerHTML = product.img
        ? '<img class="modal-thumb" src="' + product.img + '" alt="Thumbnail">'
        : '<div class="modal-thumb" style="display:flex;align-items:center;justify-content:center;background:#f1f5f9;color:var(--primary);font-size:22px;"><i class="' + Utils.getCategoryIcon(product.kat) + '"></i></div>';
    }
    document.getElementById('modVarHarga').textContent = Utils.formatRupiah(product.harga);
    document.getElementById('modVarStok').textContent = product.stok;
    document.getElementById('modVarTitle').textContent = (product.labelVar || 'Pilih Variasi') + ':';
    document.getElementById('inpModalQty').value = '1';
    const submitBtn = document.getElementById('btnSubmitModalVariasi');
    if (submitBtn) {
      submitBtn.textContent = mode === 'cart' ? 'Masukkan Keranjang' : 'Beli Sekarang';
    }
    this.renderVariantChips();
    ModalController.open('modalVariasi');
  },
  renderVariantChips() {
    const container = document.getElementById('modVarChipsContainer');
    if (!container || !this.modalProduct) return;
    container.innerHTML = '';
    const variants = this.modalProduct.variasi || ['Standar'];
    variants.forEach(v => {
      const chip = document.createElement('div');
      chip.className = 'variant-chip' + (v === this.modalVariant ? ' aktif' : '');
      chip.dataset.action = 'select-modal-variant';
      chip.dataset.variant = v;
      chip.textContent = v;
      container.appendChild(chip);
    });
    const label = document.getElementById('modVarSelectedLabel');
    if (label) label.textContent = 'Pilihan: ' + this.modalVariant;
  },
  selectModalVariant(v) {
    this.modalVariant = v;
    this.renderVariantChips();
  },
  changeModalQty(delta) {
    const inp = document.getElementById('inpModalQty');
    if (!inp || !this.modalProduct) return;
    let qty = (parseInt(inp.value) || 1) + delta;
    if (qty < 1) qty = 1;
    if (qty > this.modalProduct.stok) qty = this.modalProduct.stok;
    inp.value = qty;
  },
  changeDetailQty(delta) {
    const inp = document.getElementById('inpDetailQty');
    if (!inp || !this.currentDetailProduct) return;
    let qty = (parseInt(inp.value) || 1) + delta;
    if (qty < 1) qty = 1;
    if (qty > this.currentDetailProduct.stok) qty = this.currentDetailProduct.stok;
    inp.value = qty;
  },
  selectDetailVariant(v) {
    this.selectedDetailVariant = v;
    document.getElementById('txtVariasiTerpilih').textContent = v;
    document.querySelectorAll('#detailVariasiContainer .variant-chip').forEach(c => {
      c.classList.toggle('aktif', c.dataset.variant === v);
    });
  },
  selectGalleryImage(thumbEl, src) {
    const mainImg = document.getElementById('detailImg');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('#detailThumbs .gallery-thumb').forEach(t => t.classList.remove('aktif'));
    if (thumbEl) thumbEl.classList.add('aktif');
  },
  switchDetailTab(tab) {
    const descBody = document.getElementById('tabContentDesc');
    const specsBody = document.getElementById('tabContentSpecs');
    const tabs = document.querySelectorAll('.detail-tab-btn');
    tabs.forEach(t => t.classList.remove('aktif'));
    if (tab === 'desc') {
      tabs[0].classList.add('aktif');
      descBody.style.display = 'block';
      specsBody.style.display = 'none';
    } else {
      tabs[1].classList.add('aktif');
      descBody.style.display = 'none';
      specsBody.style.display = 'block';
    }
  },
  addCurrentDetailToCart() {
    if (!this.currentDetailProduct) return;
    const qty = parseInt(document.getElementById('inpDetailQty').value) || 1;
    CartManager.addItem(this.currentDetailProduct, this.selectedDetailVariant, qty);
  },
  buyCurrentDetailNow() {
    if (!this.currentDetailProduct) return;
    const qty = parseInt(document.getElementById('inpDetailQty').value) || 1;
    this.triggerCheckout([{
      cartId: this.currentDetailProduct.id + '-' + this.selectedDetailVariant,
      id: this.currentDetailProduct.id,
      kode: this.currentDetailProduct.kode || this.currentDetailProduct.id.toUpperCase(),
      nama: this.currentDetailProduct.nama,
      variasi: this.selectedDetailVariant,
      harga: this.currentDetailProduct.harga,
      img: this.currentDetailProduct.img,
      qty: qty
    }], 'direct');
  },
  filterByCategory(cat) {
    HomeView.activeCategory = cat;
    document.querySelectorAll('.subcat-pill').forEach(pill => {
      pill.classList.toggle('aktif', pill.dataset.kat === cat);
    });
    const titles = {
      semua: 'Katalog Produk',
      atk: 'Katalog Alat Tulis (ATK)',
      seragam: 'Katalog Seragam & Atribut',
      buku: 'Katalog Buku & LKS',
      makanan: 'Katalog Makanan & Minuman'
    };
    const titleEl = document.getElementById('txtJudulKoleksi');
    if (titleEl) titleEl.textContent = titles[cat] || 'Katalog Produk';
    Router.navigate('home');
    HomeView.render();
  },
  resetFilters() {
    HomeView.activeCategory = 'semua';
    HomeView.searchKeyword = '';
    HomeView.sortOrder = 'default';
    const inpCari = document.getElementById('inpCari');
    if (inpCari) inpCari.value = '';
    const btnClear = document.getElementById('btnSearchClear');
    if (btnClear) btnClear.style.display = 'none';
    const selSortir = document.getElementById('selSortir');
    if (selSortir) selSortir.value = 'default';
    document.querySelectorAll('.subcat-pill').forEach(pill => {
      pill.classList.toggle('aktif', pill.dataset.kat === 'semua');
    });
    document.getElementById('txtJudulKoleksi').textContent = 'Katalog Produk';
    HomeView.render();
  },
  selectBuyerType(type) {
    this.selectedBuyerType = type;
    document.querySelectorAll('.buyer-type-btn').forEach(btn => {
      btn.classList.toggle('aktif', btn.dataset.buyer === type);
    });
    const grpSiswa = document.getElementById('grpFieldSiswa');
    const grpGtk = document.getElementById('grpFieldGtk');
    if (grpSiswa) grpSiswa.classList.toggle('aktif', type === 'wali' || type === 'siswa');
    if (grpGtk) grpGtk.classList.toggle('aktif', type === 'guru');
  },
  triggerCheckout(items, source = 'cart') {
    if (!items || items.length === 0) {
      Toast.show('Pilih minimal 1 produk untuk checkout', 'info');
      return;
    }
    this.activeCheckoutItems = items;
    this.checkoutSource = source;
    const totalBayar = items.reduce((acc, i) => acc + (i.harga * i.qty), 0);
    const totalQty = items.reduce((acc, i) => acc + i.qty, 0);
    document.getElementById('txtTotalBayarCheckout').textContent = Utils.formatRupiah(totalBayar);
    document.getElementById('txtCheckoutItemCount').textContent = totalQty;
    this.selectBuyerType('wali');
    ModalController.open('modalCheckout');
  },
  async confirmAndPlaceOrder() {
    const nama = document.getElementById('inpNama').value.trim();
    const wa = document.getElementById('inpWa').value.trim();
    const pengiriman = document.getElementById('selPengiriman').value;
    const pembayaran = document.getElementById('selPembayaran').value;
    const catatan = document.getElementById('inpCatatan').value.trim();
    const namaSiswa = document.getElementById('inpNamaSiswa') ? document.getElementById('inpNamaSiswa').value.trim() : '';
    const kelasSiswa = document.getElementById('inpKelasSiswa') ? document.getElementById('inpKelasSiswa').value.trim() : '';
    const unitGtk = document.getElementById('inpUnitGtk') ? document.getElementById('inpUnitGtk').value.trim() : '';
    if (!nama || !wa) {
      Toast.show('Harap isi Nama Pemesan dan Nomor WhatsApp aktif!', 'error');
      return;
    }
    if ((this.selectedBuyerType === 'wali' || this.selectedBuyerType === 'siswa') && (!namaSiswa || !kelasSiswa)) {
      Toast.show('Harap isi Nama Siswa dan Kelas untuk keperluan serah terima!', 'error');
      return;
    }
    const btnSubmit = document.getElementById('btnSubmitPesanan');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses Pesanan...';
    }
    const totalBayar = this.activeCheckoutItems.reduce((acc, i) => acc + (i.harga * i.qty), 0);
    const totalQty = this.activeCheckoutItems.reduce((acc, i) => acc + i.qty, 0);
    const orderNumber = 'MSD-' + Math.floor(100000 + Math.random() * 900000);
    const orderPayload = {
      orderId: orderNumber,
      orderNumber: orderNumber,
      createdAt: new Date().toISOString(),
      status: 'Menunggu Diambil',
      tipePembeli: this.selectedBuyerType,
      namaPemesan: nama,
      noWa: wa,
      namaSiswa: namaSiswa,
      kelasSiswa: kelasSiswa,
      unitGtk: unitGtk,
      opsiPengambilan: pengiriman,
      metodePembayaran: pembayaran,
      catatan: catatan,
      items: this.activeCheckoutItems.map(i => ({
        id: i.id,
        kode: i.kode || i.id.toUpperCase(),
        nama: i.nama,
        variasi: i.variasi,
        harga: i.harga,
        qty: i.qty,
        subtotal: i.harga * i.qty
      })),
      totalItem: totalQty,
      totalBayar: totalBayar
    };
    const result = await DataService.submitOrder(orderPayload);
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fa-solid fa-circle-check"></i> Konfirmasi & Buat Pesanan';
    }
    if (!result.success) {
      Toast.show('Terjadi kendala saat mengirim pesanan. Silakan coba lagi.', 'error');
      return;
    }
    this.lastPlacedOrder = orderPayload;
    if (this.checkoutSource === 'cart') {
      const purchasedCartIds = this.activeCheckoutItems.map(i => i.cartId);
      CartManager.clearPurchased(purchasedCartIds);
    }
    ModalController.close('modalCheckout');
    this.showReceiptModal(orderPayload);
  },
  showReceiptModal(order) {
    document.getElementById('receiptOrderId').textContent = '#' + order.orderId;
    const qrImg = document.getElementById('receiptQrImg');
    if (qrImg) {
      qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(order.orderId);
    }
    document.getElementById('rcpNamaPemesan').textContent = order.namaPemesan + ' (' + order.tipePembeli.toUpperCase() + ')';
    const rowSiswa = document.getElementById('rcpRowSiswa');
    if (rowSiswa) {
      if (order.namaSiswa) {
        rowSiswa.style.display = 'table-row';
        document.getElementById('rcpNamaSiswa').textContent = order.namaSiswa + ' (' + order.kelasSiswa + ')';
      } else {
        rowSiswa.style.display = 'none';
      }
    }
    document.getElementById('rcpPengambilan').textContent = order.opsiPengambilan;
    document.getElementById('rcpPembayaran').textContent = order.metodePembayaran;
    document.getElementById('rcpTotalBayar').textContent = Utils.formatRupiah(order.totalBayar);
    const listWrap = document.getElementById('receiptItemsList');
    if (listWrap) {
      listWrap.innerHTML = '';
      order.items.forEach(i => {
        const row = document.createElement('div');
        row.className = 'receipt-item-row';
        row.innerHTML = '<div><strong>' + i.nama + '</strong> (' + i.variasi + ') <span style="color:var(--gray);">x' + i.qty + '</span></div><div>' + Utils.formatRupiah(i.subtotal) + '</div>';
        listWrap.appendChild(row);
      });
    }
    ModalController.open('modalReceipt');
    Toast.show('Pesanan berhasil dibuat! Simpan kode struk Anda.', 'success');
  },
  printReceipt() {
    window.print();
  },
  saveReceiptToWa() {
    if (!this.lastPlacedOrder) return;
    const o = this.lastPlacedOrder;
    let msg = '*STRUK DIGITAL PEMESANAN - MUSADA MART*\n';
    msg += 'No. Pesanan: #' + o.orderId + '\n';
    msg += 'Tanggal: ' + new Date(o.createdAt).toLocaleString('id-ID') + '\n';
    msg += 'Status: ' + o.status + '\n';
    msg += '------------------------------------------\n';
    msg += 'Pemesan: ' + o.namaPemesan + '\n';
    if (o.namaSiswa) msg += 'Siswa: ' + o.namaSiswa + ' (' + o.kelasSiswa + ')\n';
    msg += 'Opsi Pengambilan: ' + o.opsiPengambilan + '\n';
    msg += 'Pembayaran: ' + o.metodePembayaran + '\n';
    msg += '------------------------------------------\n';
    msg += 'Daftar Barang:\n';
    o.items.forEach((i, idx) => {
      msg += (idx + 1) + '. ' + i.nama + ' (' + i.variasi + ') ' + i.qty + 'x - ' + Utils.formatRupiah(i.subtotal) + '\n';
    });
    msg += '------------------------------------------\n';
    msg += '*Total Pembayaran: ' + Utils.formatRupiah(o.totalBayar) + '*\n';
    msg += '------------------------------------------\n';
    msg += 'Tunjukkan struk ini di koperasi sekolah saat pengambilan.';
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
  }
};
document.addEventListener('DOMContentLoaded', async () => {
  await DataService.loadProducts();
  CartManager.updateBadges();
  HomeView.render();
  const inpCari = document.getElementById('inpCari');
  const btnClear = document.getElementById('btnSearchClear');
  const btnSearch = document.getElementById('btnSearchSubmit');
  if (inpCari) {
    inpCari.addEventListener('input', Utils.debounce(function(e) {
      HomeView.searchKeyword = e.target.value;
      if (btnClear) btnClear.style.display = e.target.value ? 'inline-block' : 'none';
      Router.navigate('home');
      HomeView.render();
    }, 200));
  }
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      inpCari.value = '';
      HomeView.searchKeyword = '';
      btnClear.style.display = 'none';
      HomeView.render();
      inpCari.focus();
    });
  }
  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      HomeView.searchKeyword = inpCari.value;
      Router.navigate('home');
      HomeView.render();
    });
  }
  const selSortir = document.getElementById('selSortir');
  if (selSortir) {
    selSortir.addEventListener('change', function() {
      HomeView.sortOrder = this.value;
      HomeView.render();
    });
  }
  const cbSemua = document.getElementById('cbPilihSemua');
  const cbSemuaMobile = document.getElementById('cbPilihSemuaMobile');
  if (cbSemua) cbSemua.addEventListener('change', (e) => CartManager.toggleSelectAll(e.target.checked));
  if (cbSemuaMobile) cbSemuaMobile.addEventListener('change', (e) => CartManager.toggleSelectAll(e.target.checked));
  const triggerCartCheckout = () => {
    const summary = CartManager.getSummary();
    AppService.triggerCheckout(summary.selectedItems, 'cart');
  };
  const btnCheckoutDesktop = document.getElementById('btnCheckoutDesktop');
  const btnCheckoutMobile = document.getElementById('btnCheckoutMobile');
  if (btnCheckoutDesktop) btnCheckoutDesktop.addEventListener('click', triggerCartCheckout);
  if (btnCheckoutMobile) btnCheckoutMobile.addEventListener('click', triggerCartCheckout);
  const btnSubmitVar = document.getElementById('btnSubmitModalVariasi');
  if (btnSubmitVar) {
    btnSubmitVar.addEventListener('click', () => {
      const qty = parseInt(document.getElementById('inpModalQty').value) || 1;
      ModalController.close('modalVariasi');
      if (AppService.modalMode === 'cart') {
        CartManager.addItem(AppService.modalProduct, AppService.modalVariant, qty);
      } else {
        AppService.triggerCheckout([{
          cartId: AppService.modalProduct.id + '-' + AppService.modalVariant,
          id: AppService.modalProduct.id,
          kode: AppService.modalProduct.kode || AppService.modalProduct.id.toUpperCase(),
          nama: AppService.modalProduct.nama,
          variasi: AppService.modalVariant,
          harga: AppService.modalProduct.harga,
          img: AppService.modalProduct.img,
          qty: qty
        }], 'direct');
      }
    });
  }
  const btnSubmitOrder = document.getElementById('btnSubmitPesanan');
  if (btnSubmitOrder) {
    btnSubmitOrder.addEventListener('click', () => {
      AppService.confirmAndPlaceOrder();
    });
  }
  document.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (action === 'navigate-home') {
      Router.navigate('home');
    } else if (action === 'navigate-cart') {
      Router.navigate('cart');
    } else if (action === 'navigate-detail') {
      Router.navigate('detail', { id: actionEl.dataset.id });
    } else if (action === 'toast') {
      Toast.show(actionEl.dataset.message, actionEl.dataset.type || 'info');
    } else if (action === 'filter-category') {
      AppService.filterByCategory(actionEl.dataset.category);
    } else if (action === 'reset-filters') {
      AppService.resetFilters();
    } else if (action === 'open-variant-modal') {
      AppService.openVariantModal(actionEl.dataset.id, actionEl.dataset.mode || 'cart');
    } else if (action === 'select-thumb') {
      AppService.selectGalleryImage(actionEl, actionEl.dataset.src);
    } else if (action === 'select-detail-variant') {
      AppService.selectDetailVariant(actionEl.dataset.variant);
    } else if (action === 'change-detail-qty') {
      AppService.changeDetailQty(parseInt(actionEl.dataset.delta) || 1);
    } else if (action === 'add-detail-cart') {
      AppService.addCurrentDetailToCart();
    } else if (action === 'buy-detail-now') {
      AppService.buyCurrentDetailNow();
    } else if (action === 'switch-detail-tab') {
      AppService.switchDetailTab(actionEl.dataset.tab);
    } else if (action === 'cart-qty') {
      CartManager.updateQty(actionEl.dataset.cartId, parseInt(actionEl.dataset.delta) || 1);
    } else if (action === 'cart-remove') {
      CartManager.removeItem(actionEl.dataset.cartId);
    } else if (action === 'clear-selected-cart') {
      CartManager.clearSelected();
    } else if (action === 'close-modal') {
      ModalController.close(actionEl.dataset.modal);
    } else if (action === 'select-modal-variant') {
      AppService.selectModalVariant(actionEl.dataset.variant);
    } else if (action === 'change-modal-qty') {
      AppService.changeModalQty(parseInt(actionEl.dataset.delta) || 1);
    } else if (action === 'select-buyer-type') {
      AppService.selectBuyerType(actionEl.dataset.buyer);
    } else if (action === 'print-receipt') {
      AppService.printReceipt();
    } else if (action === 'save-receipt-wa') {
      AppService.saveReceiptToWa();
    } else if (action === 'finish-receipt') {
      ModalController.close('modalReceipt');
      Router.navigate('home');
    }
  });
  document.addEventListener('change', (e) => {
    const actionEl = e.target.closest('[data-action="toggle-cart-item"]');
    if (actionEl) {
      CartManager.toggleSelect(actionEl.dataset.cartId);
    }
  });
});
window.HomeView = HomeView;
window.DetailView = DetailView;
window.CartView = CartView;
window.AppService = AppService;