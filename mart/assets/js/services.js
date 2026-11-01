const Utils = {
  formatRupiah(amount) {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  },
  resolveImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (trimmed.includes('drive.google.com') || trimmed.includes('drive.usercontent.google.com')) {
      const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return 'https://drive.google.com/thumbnail?id=' + fileIdMatch[1] + '&sz=w1000';
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
  },
  debounce(func, wait = 200) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
};
const DataService = {
  rtdbUrl: 'https://musada-sd-default-rtdb.firebaseio.com/mart/products.json',
  settingsUrl: 'https://musada-sd-default-rtdb.firebaseio.com/mart/settings.json',
  ordersUrl: 'https://musada-sd-default-rtdb.firebaseio.com/mart/orders',
  cacheKey: 'musada_mart_products_cache',
  contactWa: '6285964399398',
  productsCache: [],
  settings: {},
  async loadProducts() {
    let rawData = null;
    try {
      const [resProd, resSet] = await Promise.all([
        fetch(this.rtdbUrl),
        fetch(this.settingsUrl).catch(() => null)
      ]);
      if (resProd && resProd.ok) {
        rawData = await resProd.json();
        if (rawData) {
          try {
            localStorage.setItem(this.cacheKey, JSON.stringify(rawData));
          } catch (e) {}
        }
      }
      if (resSet && resSet.ok) {
        const setData = await resSet.json();
        if (setData) {
          this.settings = setData;
          if (setData.contactWa) this.contactWa = setData.contactWa;
        }
      }
    } catch (err) {}
    if (!rawData) {
      try {
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) rawData = JSON.parse(cached);
      } catch (e) {}
    }
    this.productsCache = this.normalizeProducts(rawData);
    return this.productsCache;
  },
  normalizeProducts(raw) {
    if (!raw) return [];
    let list = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (typeof raw === 'object') {
      if (raw.products && typeof raw.products === 'object') {
        list = Array.isArray(raw.products) ? raw.products : Object.values(raw.products);
      } else {
        list = Object.values(raw);
      }
    }
    return list.map(item => ({
      ...item,
      img: Utils.resolveImageUrl(item.img),
      galeri: (item.galeri && item.galeri.length > 0)
        ? item.galeri.map(g => Utils.resolveImageUrl(g))
        : (item.img ? [Utils.resolveImageUrl(item.img)] : [])
    }));
  },
  getAll() {
    return this.productsCache;
  },
  getById(id) {
    return this.productsCache.find(p => String(p.id) === String(id));
  },
  async submitOrder(order) {
    try {
      const res = await fetch(`${this.ordersUrl}/${order.orderId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (!res.ok) throw new Error('Gagal menyimpan pesanan ke server');
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const product = this.getById(item.id);
          if (product && typeof product.stok === 'number') {
            const nextStok = Math.max(0, product.stok - item.qty);
            product.stok = nextStok;
            fetch(`https://musada-sd-default-rtdb.firebaseio.com/mart/products/${item.id}.json`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stok: nextStok })
            }).catch(() => {});
          }
        }
      }
      return { success: true, orderId: order.orderId };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
const CartManager = {
  storageKey: 'musada_cart_v2',
  getItems() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },
  saveItems(items) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.updateBadges();
    if (window.CartView && window.CartView.render) {
      window.CartView.render();
    }
  },
  addItem(product, variant, qty = 1) {
    const items = this.getItems();
    const cartId = `${product.id}-${variant}`;
    const existingIndex = items.findIndex(i => i.cartId === cartId);
    if (existingIndex > -1) {
      const newQty = items[existingIndex].qty + qty;
      items[existingIndex].qty = Math.min(newQty, product.stok);
    } else {
      items.push({
        cartId: cartId,
        id: product.id,
        kode: product.kode || product.id.toUpperCase(),
        nama: product.nama,
        kat: product.kat,
        harga: product.harga,
        img: product.img,
        stok: product.stok,
        labelVar: product.labelVar,
        variasi: variant,
        qty: Math.min(qty, product.stok),
        selected: true
      });
    }
    this.saveItems(items);
    Toast.show('"' + product.nama + '" (' + variant + ') masuk ke keranjang!', 'success');
  },
  updateQty(cartId, delta) {
    const items = this.getItems();
    const item = items.find(i => i.cartId === cartId);
    if (!item) return;
    let nextQty = item.qty + delta;
    if (nextQty < 1) nextQty = 1;
    if (nextQty > item.stok) nextQty = item.stok;
    item.qty = nextQty;
    this.saveItems(items);
    if (window.CartView) window.CartView.render();
  },
  removeItem(cartId) {
    const items = this.getItems().filter(i => i.cartId !== cartId);
    this.saveItems(items);
    if (window.CartView) window.CartView.render();
    Toast.show('Item dihapus dari keranjang', 'info');
  },
  toggleSelect(cartId) {
    const items = this.getItems();
    const item = items.find(i => i.cartId === cartId);
    if (item) {
      item.selected = !item.selected;
      this.saveItems(items);
      if (window.CartView) window.CartView.render();
    }
  },
  toggleSelectAll(checked) {
    const items = this.getItems();
    items.forEach(i => i.selected = checked);
    this.saveItems(items);
    if (window.CartView) window.CartView.render();
  },
  clearSelected() {
    const items = this.getItems();
    const remaining = items.filter(i => !i.selected);
    if (remaining.length === items.length) {
      Toast.show('Tidak ada produk yang dipilih', 'info');
      return;
    }
    if (confirm('Hapus produk terpilih dari keranjang?')) {
      this.saveItems(remaining);
      if (window.CartView) window.CartView.render();
      Toast.show('Item terpilih berhasil dihapus', 'info');
    }
  },
  clearPurchased(purchasedCartIds) {
    const items = this.getItems().filter(i => !purchasedCartIds.includes(i.cartId));
    this.saveItems(items);
  },
  getSummary() {
    const items = this.getItems();
    const totalItemsCount = items.length;
    const selectedItems = items.filter(i => i.selected);
    const selectedCount = selectedItems.reduce((acc, i) => acc + i.qty, 0);
    const subtotal = selectedItems.reduce((acc, i) => acc + (i.harga * i.qty), 0);
    const allSelected = items.length > 0 && items.every(i => i.selected);
    return {
      items,
      totalItemsCount,
      selectedItems,
      selectedCount,
      subtotal,
      allSelected
    };
  },
  updateBadges() {
    const items = this.getItems();
    const totalQty = items.reduce((acc, i) => acc + i.qty, 0);
    ['badgeKeranjangMobile', 'badgeKeranjangDesktop', 'badgeKeranjangDetail'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = totalQty;
    });
    const headerCount = document.getElementById('cartHeaderCount');
    if (headerCount) headerCount.textContent = items.length;
  }
};
const Toast = {
  show(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'error') iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';
    if (type === 'info') iconHtml = '<i class="fa-solid fa-circle-info"></i>';
    toast.innerHTML = `${iconHtml}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};
const ModalController = {
  open(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('aktif');
      document.body.style.overflow = 'hidden';
    }
  },
  close(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('aktif');
      document.body.style.overflow = '';
    }
  }
};
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    ModalController.close(e.target.id);
  }
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.aktif').forEach(m => ModalController.close(m.id));
  }
});
const Router = {
  views: ['viewHome', 'viewDetail', 'viewCart'],
  navigate(viewKey, params = {}) {
    const targetViewId = viewKey.startsWith('view')
      ? viewKey
      : `view${viewKey.charAt(0).toUpperCase() + viewKey.slice(1)}`;
    this.views.forEach(vId => {
      const el = document.getElementById(vId);
      if (el) el.classList.remove('aktif');
    });
    const activeEl = document.getElementById(targetViewId);
    if (activeEl) {
      activeEl.classList.add('aktif');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (targetViewId === 'viewHome') {
      if (window.HomeView && window.HomeView.render) window.HomeView.render();
    } else if (targetViewId === 'viewDetail') {
      if (params.id && window.DetailView && window.DetailView.loadProduct) {
        window.DetailView.loadProduct(params.id);
      }
    } else if (targetViewId === 'viewCart') {
      if (window.CartView && window.CartView.render) {
        window.CartView.render();
      }
    }
  }
};
const FavoritesService = {
  STORAGE_KEY: 'musada_mart_favorites',
  getIds() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },
  isFavorite(productId) {
    if (!productId) return false;
    const ids = this.getIds();
    return ids.includes(String(productId));
  },
  toggle(productId) {
    if (!productId) return false;
    const strId = String(productId);
    let ids = this.getIds();
    const exists = ids.includes(strId);
    if (exists) {
      ids = ids.filter(id => id !== strId);
    } else {
      ids.push(strId);
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {}
    this.updateBadges();
    return !exists;
  },
  remove(productId) {
    if (!productId) return;
    const strId = String(productId);
    let ids = this.getIds();
    ids = ids.filter(id => id !== strId);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {}
    this.updateBadges();
  },
  clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
    this.updateBadges();
  },
  getCount() {
    return this.getIds().length;
  },
  updateBadges() {
    const count = this.getCount();
    const el = document.getElementById('badgeFavorit');
    if (el) el.textContent = count;
    const txtCount = document.getElementById('txtWishlistCount');
    if (txtCount) txtCount.textContent = count;
  }
};
window.Utils = Utils;
window.DataService = DataService;
window.CartManager = CartManager;
window.FavoritesService = FavoritesService;
window.Toast = Toast;
window.ModalController = ModalController;
window.Router = Router;