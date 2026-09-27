// Kasir / Point of Sale page
const PosPage = {
  cart: [],
  discountType: 'none', // none | percent | amount
  discountValue: 0,
  paymentMethod: 'tunai',
  taxEnabled: false,
  taxRate: 11,

  async render(container) {
    const settings = await getSettings();
    this.taxEnabled = settings.taxEnabled === true || settings.taxEnabled === 'true';
    this.taxRate = Number(settings.taxRate) || 11;

    container.innerHTML = `
      <div class="h-full flex flex-col lg:flex-row">
        <!-- Left: Products -->
        <div class="flex-1 flex flex-col min-h-0 border-r border-slate-200">
          <div class="p-3 bg-white border-b border-slate-100 flex gap-2 shrink-0">
            <div class="relative flex-1">
              <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input type="text" id="pos-search" placeholder="Cari produk / scan barcode..." class="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm" autofocus />
            </div>
            <select id="pos-category" class="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm">
              <option value="">Semua</option>
            </select>
          </div>
          <div id="pos-product-grid" class="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 content-start">
          </div>
        </div>

        <!-- Right: Cart -->
        <div class="w-full lg:w-96 bg-white flex flex-col border-t lg:border-t-0 shrink-0 max-h-[50vh] lg:max-h-none">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold">Keranjang</h3>
            <button id="btn-clear-cart" class="text-xs text-red-500 hover:underline">Kosongkan</button>
          </div>
          <div id="cart-items" class="flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px]">
            <p class="text-center text-slate-400 text-sm py-8">Keranjang kosong</p>
          </div>
          <div class="border-t border-slate-100 p-4 space-y-3 bg-slate-50 safe-bottom">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Subtotal</span>
              <span id="cart-subtotal" class="font-medium">Rp 0</span>
            </div>
            <div class="flex items-center gap-2">
              <select id="discount-type" class="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                <option value="none">Diskon</option>
                <option value="percent">%</option>
                <option value="amount">Rp</option>
              </select>
              <input type="number" id="discount-value" min="0" value="0" class="w-20 text-sm border border-slate-200 rounded-lg px-2 py-1.5" />
              <span id="cart-discount" class="text-sm text-red-500 ml-auto">- Rp 0</span>
            </div>
            <div id="tax-row" class="flex justify-between text-sm ${this.taxEnabled ? '' : 'hidden'}">
              <span class="text-slate-500">PPN ${this.taxRate}%</span>
              <span id="cart-tax">Rp 0</span>
            </div>
            <div class="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span id="cart-total" class="text-primary-700">Rp 0</span>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1">Metode Pembayaran</label>
              <div class="grid grid-cols-3 gap-1.5">
                <button class="pay-method active px-2 py-2 text-xs rounded-lg border border-primary-500 bg-primary-50 text-primary-700 font-medium" data-method="tunai">Tunai</button>
                <button class="pay-method px-2 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50" data-method="qris">QRIS</button>
                <button class="pay-method px-2 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50" data-method="ewallet">E-Wallet</button>
                <button class="pay-method px-2 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50" data-method="debit">Debit</button>
                <button class="pay-method px-2 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50" data-method="kredit">Kredit</button>
                <button class="pay-method px-2 py-2 text-xs rounded-lg border border-slate-200 hover:bg-slate-50" data-method="lainnya">Lainnya</button>
              </div>
            </div>
            <button id="btn-checkout" class="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <i data-lucide="check-circle" class="w-5 h-5"></i> Bayar
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Success Modal -->
      <div id="success-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-lucide="check" class="w-8 h-8 text-emerald-600"></i>
          </div>
          <h3 class="text-xl font-bold mb-1">Pembayaran Berhasil</h3>
          <p id="success-invoice" class="text-slate-500 text-sm mb-1"></p>
          <p id="success-total" class="text-2xl font-bold text-primary-700 mb-6"></p>
          <div class="flex gap-2">
            <button id="btn-print-receipt" class="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-1.5">
              <i data-lucide="printer" class="w-4 h-4"></i> Struk
            </button>
            <button id="btn-share-wa" class="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-1.5">
              <i data-lucide="message-circle" class="w-4 h-4"></i> WA
            </button>
          </div>
          <button id="btn-new-transaction" class="w-full mt-3 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700">
            Transaksi Baru
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();
    await this.loadCategories();
    await this.loadProducts();
    this.bindEvents();
    this.renderCart();
  },

  async loadCategories() {
    const cats = await db.categories.toArray();
    const sel = document.getElementById('pos-category');
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  },

  async loadProducts() {
    const search = document.getElementById('pos-search')?.value || '';
    const category = document.getElementById('pos-category')?.value || '';
    const list = await getProducts(search, category);
    const grid = document.getElementById('pos-product-grid');
    if (list.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-10">Tidak ada produk</p>`;
      return;
    }
    grid.innerHTML = list.map(p => `
      <button class="product-card bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-primary-400 hover:shadow-sm ${p.stock <= 0 ? 'opacity-50' : ''}" data-id="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>
        <div class="font-medium text-sm line-clamp-2 mb-1">${p.name}</div>
        <div class="text-primary-700 font-bold text-sm">${Utils.formatRupiah(p.price)}</div>
        <div class="text-xs text-slate-400 mt-1">Stok: ${p.stock}</div>
      </button>
    `).join('');
  },

  bindEvents() {
    document.getElementById('pos-search').oninput = Utils.debounce((e) => {
      // If looks like barcode (long number), try exact match
      const val = e.target.value.trim();
      if (/^\d{8,}$/.test(val)) {
        this.addByBarcode(val);
      } else {
        this.loadProducts();
      }
    }, 250);

    document.getElementById('pos-category').onchange = () => this.loadProducts();

    document.getElementById('pos-product-grid').onclick = (e) => {
      const btn = e.target.closest('[data-id]');
      if (btn) this.addToCart(Number(btn.dataset.id));
    };

    document.getElementById('btn-clear-cart').onclick = () => {
      if (this.cart.length && Utils.confirm('Kosongkan keranjang?')) {
        this.cart = [];
        this.renderCart();
      }
    };

    document.getElementById('discount-type').onchange = (e) => {
      this.discountType = e.target.value;
      this.renderCart();
    };
    document.getElementById('discount-value').oninput = (e) => {
      this.discountValue = Number(e.target.value) || 0;
      this.renderCart();
    };

    document.querySelectorAll('.pay-method').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.pay-method').forEach(b => {
          b.classList.remove('active', 'border-primary-500', 'bg-primary-50', 'text-primary-700');
          b.classList.add('border-slate-200');
        });
        btn.classList.add('active', 'border-primary-500', 'bg-primary-50', 'text-primary-700');
        btn.classList.remove('border-slate-200');
        this.paymentMethod = btn.dataset.method;
      };
    });

    document.getElementById('btn-checkout').onclick = () => this.checkout();
    document.getElementById('btn-new-transaction').onclick = () => {
      document.getElementById('success-modal').classList.add('hidden');
      this.cart = [];
      this.discountType = 'none';
      this.discountValue = 0;
      document.getElementById('discount-type').value = 'none';
      document.getElementById('discount-value').value = 0;
      this.renderCart();
      document.getElementById('pos-search').focus();
    };
  },

  async addByBarcode(barcode) {
    const p = await getProductByBarcode(barcode);
    if (p) {
      this.addToCart(p.id);
      document.getElementById('pos-search').value = '';
      this.loadProducts();
    } else {
      Utils.toast('Barcode tidak ditemukan', 'warning');
    }
  },

  async addToCart(productId) {
    const p = await getProductById(productId);
    if (!p || p.stock <= 0) {
      Utils.toast('Stok habis', 'warning');
      return;
    }
    const existing = this.cart.find(c => c.productId === productId);
    if (existing) {
      if (existing.qty >= p.stock) {
        Utils.toast('Stok tidak cukup', 'warning');
        return;
      }
      existing.qty += 1;
    } else {
      this.cart.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        cost: p.cost || 0,
        qty: 1,
        maxStock: p.stock
      });
    }
    this.renderCart();
  },

  changeQty(index, delta) {
    const item = this.cart[index];
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      this.cart.splice(index, 1);
    } else if (newQty > item.maxStock) {
      Utils.toast('Stok tidak cukup', 'warning');
      return;
    } else {
      item.qty = newQty;
    }
    this.renderCart();
  },

  removeItem(index) {
    this.cart.splice(index, 1);
    this.renderCart();
  },

  calcTotals() {
    const subtotal = this.cart.reduce((s, i) => s + i.price * i.qty, 0);
    let discount = 0;
    if (this.discountType === 'percent') {
      discount = subtotal * (this.discountValue / 100);
    } else if (this.discountType === 'amount') {
      discount = this.discountValue;
    }
    discount = Math.min(discount, subtotal);
    const afterDiscount = subtotal - discount;
    const tax = this.taxEnabled ? afterDiscount * (this.taxRate / 100) : 0;
    const total = afterDiscount + tax;
    return { subtotal, discount, tax, total };
  },

  renderCart() {
    const container = document.getElementById('cart-items');
    const { subtotal, discount, tax, total } = this.calcTotals();

    if (this.cart.length === 0) {
      container.innerHTML = `<p class="text-center text-slate-400 text-sm py-8">Keranjang kosong</p>`;
    } else {
      container.innerHTML = this.cart.map((item, idx) => `
        <div class="cart-item flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-2.5">
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm truncate">${item.name}</div>
            <div class="text-xs text-slate-500">${Utils.formatRupiah(item.price)} × ${item.qty}</div>
          </div>
          <div class="flex items-center gap-1">
            <button onclick="PosPage.changeQty(${idx}, -1)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold">−</button>
            <span class="w-6 text-center text-sm font-medium">${item.qty}</span>
            <button onclick="PosPage.changeQty(${idx}, 1)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold">+</button>
          </div>
          <div class="text-sm font-semibold w-20 text-right">${Utils.formatRupiah(item.price * item.qty)}</div>
          <button onclick="PosPage.removeItem(${idx})" class="p-1 text-slate-400 hover:text-red-500"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>
      `).join('');
      lucide.createIcons();
    }

    document.getElementById('cart-subtotal').textContent = Utils.formatRupiah(subtotal);
    document.getElementById('cart-discount').textContent = '- ' + Utils.formatRupiah(discount);
    document.getElementById('cart-tax').textContent = Utils.formatRupiah(tax);
    document.getElementById('cart-total').textContent = Utils.formatRupiah(total);
    document.getElementById('btn-checkout').disabled = this.cart.length === 0;
  },

  async checkout() {
    if (this.cart.length === 0) return;
    const { subtotal, discount, tax, total } = this.calcTotals();
    const invoice = Utils.generateInvoice();
    const settings = await getSettings();

    const tx = {
      invoice,
      items: this.cart.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        cost: i.cost,
        qty: i.qty,
        subtotal: i.price * i.qty
      })),
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: this.paymentMethod,
      cashier: Auth.currentUser?.name || 'Kasir',
      cashierId: Auth.currentUser?.id,
      storeName: settings.storeName || 'POS UMKM'
    };

    try {
      await createTransaction(tx);
      this.lastTransaction = tx;

      document.getElementById('success-invoice').textContent = invoice;
      document.getElementById('success-total').textContent = Utils.formatRupiah(total);
      document.getElementById('success-modal').classList.remove('hidden');
      lucide.createIcons();

      // Bind print & share once
      document.getElementById('btn-print-receipt').onclick = () => this.printReceipt(tx, settings);
      document.getElementById('btn-share-wa').onclick = () => this.shareWhatsApp(tx, settings);

      // Refresh product stock display
      this.loadProducts();
      Utils.toast('Transaksi berhasil disimpan', 'success');
    } catch (err) {
      console.error(err);
      Utils.toast('Gagal menyimpan transaksi', 'error');
    }
  },

  printReceipt(tx, settings) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: [80, 150 + tx.items.length * 8] });
    let y = 10;
    doc.setFontSize(12);
    doc.text(settings.storeName || 'POS UMKM', 40, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.text(settings.storeAddress || '', 40, y, { align: 'center' });
    y += 4;
    doc.text(settings.storePhone || '', 40, y, { align: 'center' });
    y += 6;
    doc.line(5, y, 75, y);
    y += 5;
    doc.text(`No: ${tx.invoice}`, 5, y);
    y += 4;
    doc.text(`Tgl: ${Utils.formatDateTime(new Date().toISOString())}`, 5, y);
    y += 4;
    doc.text(`Kasir: ${tx.cashier}`, 5, y);
    y += 5;
    doc.line(5, y, 75, y);
    y += 5;

    tx.items.forEach(item => {
      doc.text(item.name.substring(0, 28), 5, y);
      y += 4;
      doc.text(`${item.qty} x ${Utils.formatRupiah(item.price)}`, 5, y);
      doc.text(Utils.formatRupiah(item.subtotal), 75, y, { align: 'right' });
      y += 5;
    });

    doc.line(5, y, 75, y);
    y += 5;
    doc.text('Subtotal', 5, y);
    doc.text(Utils.formatRupiah(tx.subtotal), 75, y, { align: 'right' });
    y += 4;
    if (tx.discount > 0) {
      doc.text('Diskon', 5, y);
      doc.text('-' + Utils.formatRupiah(tx.discount), 75, y, { align: 'right' });
      y += 4;
    }
    if (tx.tax > 0) {
      doc.text('PPN', 5, y);
      doc.text(Utils.formatRupiah(tx.tax), 75, y, { align: 'right' });
      y += 4;
    }
    doc.setFontSize(10);
    doc.text('TOTAL', 5, y);
    doc.text(Utils.formatRupiah(tx.total), 75, y, { align: 'right' });
    y += 6;
    doc.setFontSize(8);
    doc.text(`Bayar: ${tx.paymentMethod.toUpperCase()}`, 5, y);
    y += 8;
    doc.text(settings.receiptFooter || 'Terima kasih!', 40, y, { align: 'center' });

    doc.save(`struk-${tx.invoice}.pdf`);
    Utils.toast('Struk PDF diunduh', 'success');
  },

  shareWhatsApp(tx, settings) {
    let text = `*${settings.storeName || 'POS UMKM'}*\n`;
    text += `${tx.invoice}\n`;
    text += `${Utils.formatDateTime(new Date().toISOString())}\n`;
    text += `----------------\n`;
    tx.items.forEach(i => {
      text += `${i.name}\n${i.qty} x ${Utils.formatRupiah(i.price)} = ${Utils.formatRupiah(i.subtotal)}\n`;
    });
    text += `----------------\n`;
    text += `Total: *${Utils.formatRupiah(tx.total)}*\n`;
    text += `Bayar: ${tx.paymentMethod}\n`;
    text += `\n${settings.receiptFooter || 'Terima kasih!'}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
};
