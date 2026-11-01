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
        : [Utils.resolveImageUrl(item.img)]
    }));
  },
  getAll() {
    return this.productsCache;
  },
  getById(id) {
    return this.productsCache.find(p => String(p.id) === String(id));
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
        nama: product.nama,
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
window.Utils = Utils;
window.DataService = DataService;
window.CartManager = CartManager;
window.Toast = Toast;
window.ModalController = ModalController;
window.Router = Router;