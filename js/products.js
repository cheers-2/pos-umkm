// Products & Stock management page
const ProductsPage = {
  async render(container) {
    const settings = await getSettings();
    container.innerHTML = `
      <div class="p-4 max-w-6xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 class="text-xl font-bold text-slate-800">Produk & Stok</h2>
          <div class="flex flex-wrap gap-2">
            <button id="btn-import" class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-1.5">
              <i data-lucide="upload" class="w-4 h-4"></i> Import Excel
            </button>
            <button id="btn-export" class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-1.5">
              <i data-lucide="download" class="w-4 h-4"></i> Export
            </button>
            <button id="btn-add-product" class="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 flex items-center gap-1.5">
              <i data-lucide="plus" class="w-4 h-4"></i> Tambah Produk
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 mb-4">
          <input type="text" id="product-search" placeholder="Cari nama, SKU, barcode..." class="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
          <select id="product-category-filter" class="px-4 py-2.5 border border-slate-200 rounded-xl bg-white">
            <option value="">Semua Kategori</option>
          </select>
        </div>

        <div id="low-stock-alert" class="hidden mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-2">
          <i data-lucide="alert-triangle" class="w-5 h-5 shrink-0"></i>
          <span id="low-stock-text"></span>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="text-left px-4 py-3 font-medium">Produk</th>
                  <th class="text-left px-4 py-3 font-medium hidden md:table-cell">SKU / Barcode</th>
                  <th class="text-left px-4 py-3 font-medium">Kategori</th>
                  <th class="text-right px-4 py-3 font-medium">Harga</th>
                  <th class="text-right px-4 py-3 font-medium">Stok</th>
                  <th class="text-center px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody id="product-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Add/Edit -->
      <div id="product-modal" class="hidden fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h3 id="modal-title" class="font-bold text-lg">Tambah Produk</h3>
            <button id="btn-close-modal" class="p-2 hover:bg-slate-100 rounded-lg"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          <form id="product-form" class="p-5 space-y-4">
            <input type="hidden" id="product-id" />
            <div>
              <label class="block text-sm font-medium mb-1">Nama Produk *</label>
              <input type="text" id="p-name" required class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1">SKU</label>
                <input type="text" id="p-sku" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Barcode</label>
                <input type="text" id="p-barcode" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Kategori</label>
              <select id="p-category" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500">
                <option value="Makanan">Makanan</option>
                <option value="Minuman">Minuman</option>
                <option value="Snack">Snack</option>
                <option value="Sembako">Sembako</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1">Harga Jual *</label>
                <input type="number" id="p-price" required min="0" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Harga Modal</label>
                <input type="number" id="p-cost" min="0" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1">Stok Awal</label>
                <input type="number" id="p-stock" min="0" value="0" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Satuan</label>
                <input type="text" id="p-unit" value="pcs" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Batas Stok Menipis</label>
              <input type="number" id="p-lowstock" min="0" value="10" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" id="btn-cancel-modal" class="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50">Batal</button>
              <button type="submit" class="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <input type="file" id="import-file" accept=".xlsx,.xls,.csv" class="hidden" />
    `;

    lucide.createIcons();
    await this.loadCategories();
    await this.loadProducts();
    this.bindEvents();
  },

  async loadCategories() {
    const cats = await db.categories.toArray();
    const sel = document.getElementById('product-category-filter');
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  },

  async loadProducts() {
    const search = document.getElementById('product-search')?.value || '';
    const category = document.getElementById('product-category-filter')?.value || '';
    const list = await getProducts(search, category);
    const tbody = document.getElementById('product-table-body');
    const lowStock = list.filter(p => p.stock <= (p.lowStock || 10));

    const alertBox = document.getElementById('low-stock-alert');
    if (lowStock.length > 0) {
      alertBox.classList.remove('hidden');
      document.getElementById('low-stock-text').textContent = `${lowStock.length} produk stok menipis: ${lowStock.slice(0,3).map(p=>p.name).join(', ')}${lowStock.length>3?'...':''}`;
    } else {
      alertBox.classList.add('hidden');
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400">Belum ada produk</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(p => `
      <tr class="border-t border-slate-100 hover:bg-slate-50">
        <td class="px-4 py-3">
          <div class="font-medium">${p.name}</div>
          <div class="text-xs text-slate-400 md:hidden">${p.sku || '-'} • ${p.barcode || '-'}</div>
        </td>
        <td class="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">${p.sku || '-'}<br>${p.barcode || '-'}</td>
        <td class="px-4 py-3"><span class="px-2 py-0.5 bg-slate-100 rounded text-xs">${p.category || '-'}</span></td>
        <td class="px-4 py-3 text-right font-medium">${Utils.formatRupiah(p.price)}</td>
        <td class="px-4 py-3 text-right">
          <span class="${p.stock <= (p.lowStock||10) ? 'text-red-600 font-semibold' : ''}">${p.stock} ${p.unit || ''}</span>
        </td>
        <td class="px-4 py-3 text-center">
          <button onclick="ProductsPage.edit(${p.id})" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500" title="Edit">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
          <button onclick="ProductsPage.adjustStock(${p.id})" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500" title="Opname">
            <i data-lucide="clipboard-list" class="w-4 h-4"></i>
          </button>
          ${Auth.isOwner() ? `<button onclick="ProductsPage.remove(${p.id})" class="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Hapus"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
        </td>
      </tr>
    `).join('');
    lucide.createIcons();
  },

  bindEvents() {
    document.getElementById('btn-add-product').onclick = () => this.openModal();
    document.getElementById('btn-close-modal').onclick = () => this.closeModal();
    document.getElementById('btn-cancel-modal').onclick = () => this.closeModal();
    document.getElementById('product-form').onsubmit = (e) => this.save(e);
    document.getElementById('product-search').oninput = Utils.debounce(() => this.loadProducts(), 300);
    document.getElementById('product-category-filter').onchange = () => this.loadProducts();
    document.getElementById('btn-export').onclick = () => this.exportExcel();
    document.getElementById('btn-import').onclick = () => document.getElementById('import-file').click();
    document.getElementById('import-file').onchange = (e) => this.importExcel(e);
  },

  openModal(product = null) {
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('modal-title').textContent = product ? 'Edit Produk' : 'Tambah Produk';
    document.getElementById('product-id').value = product ? product.id : '';
    document.getElementById('p-name').value = product?.name || '';
    document.getElementById('p-sku').value = product?.sku || '';
    document.getElementById('p-barcode').value = product?.barcode || '';
    document.getElementById('p-category').value = product?.category || 'Lainnya';
    document.getElementById('p-price').value = product?.price || '';
    document.getElementById('p-cost').value = product?.cost || '';
    document.getElementById('p-stock').value = product?.stock ?? 0;
    document.getElementById('p-unit').value = product?.unit || 'pcs';
    document.getElementById('p-lowstock').value = product?.lowStock ?? 10;
    if (product) document.getElementById('p-stock').disabled = true; // stock diubah via opname
    else document.getElementById('p-stock').disabled = false;
  },

  closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
  },

  async save(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const data = {
      name: document.getElementById('p-name').value.trim(),
      name_lc: document.getElementById('p-name').value.trim().toLowerCase(),
      sku: document.getElementById('p-sku').value.trim(),
      barcode: document.getElementById('p-barcode').value.trim(),
      category: document.getElementById('p-category').value,
      price: Number(document.getElementById('p-price').value) || 0,
      cost: Number(document.getElementById('p-cost').value) || 0,
      unit: document.getElementById('p-unit').value.trim() || 'pcs',
      lowStock: Number(document.getElementById('p-lowstock').value) || 10,
      updatedAt: new Date().toISOString()
    };

    if (id) {
      await db.products.update(Number(id), data);
      Utils.toast('Produk diperbarui', 'success');
    } else {
      data.stock = Number(document.getElementById('p-stock').value) || 0;
      data.createdAt = new Date().toISOString();
      await db.products.add(data);
      Utils.toast('Produk ditambahkan', 'success');
    }
    this.closeModal();
    this.loadProducts();
  },

  async edit(id) {
    const p = await db.products.get(id);
    if (p) this.openModal(p);
  },

  async adjustStock(id) {
    const p = await db.products.get(id);
    if (!p) return;
    const input = prompt(`Stok opname untuk "${p.name}"\nStok saat ini: ${p.stock}\nMasukkan stok aktual:`, p.stock);
    if (input === null) return;
    const newStock = parseInt(input, 10);
    if (isNaN(newStock) || newStock < 0) {
      Utils.toast('Stok tidak valid', 'error');
      return;
    }
    const diff = newStock - p.stock;
    await updateStock(id, diff, 'opname', 'Stok opname manual');
    Utils.toast(`Stok ${p.name} diperbarui menjadi ${newStock}`, 'success');
    this.loadProducts();
  },

  async remove(id) {
    if (!Auth.requireOwner()) return;
    if (!Utils.confirm('Hapus produk ini?')) return;
    await db.products.delete(id);
    Utils.toast('Produk dihapus', 'success');
    this.loadProducts();
  },

  async exportExcel() {
    const list = await db.products.toArray();
    const data = list.map(p => ({
      Nama: p.name,
      SKU: p.sku,
      Barcode: p.barcode,
      Kategori: p.category,
      'Harga Jual': p.price,
      'Harga Modal': p.cost,
      Stok: p.stock,
      Satuan: p.unit,
      'Batas Stok': p.lowStock
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produk');
    XLSX.writeFile(wb, `produk-pos-${new Date().toISOString().slice(0,10)}.xlsx`);
    Utils.toast('Export berhasil', 'success');
  },

  async importExcel(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        let count = 0;
        for (const row of rows) {
          const name = row.Nama || row.name || row.Name;
          if (!name) continue;
          const existing = await db.products.where('name_lc').equals(name.toLowerCase()).first();
          const payload = {
            name,
            name_lc: name.toLowerCase(),
            sku: row.SKU || row.sku || '',
            barcode: String(row.Barcode || row.barcode || ''),
            category: row.Kategori || row.category || 'Lainnya',
            price: Number(row['Harga Jual'] || row.price || 0),
            cost: Number(row['Harga Modal'] || row.cost || 0),
            stock: Number(row.Stok || row.stock || 0),
            unit: row.Satuan || row.unit || 'pcs',
            lowStock: Number(row['Batas Stok'] || 10),
            updatedAt: new Date().toISOString()
          };
          if (existing) {
            await db.products.update(existing.id, payload);
          } else {
            payload.createdAt = new Date().toISOString();
            await db.products.add(payload);
          }
          count++;
        }
        Utils.toast(`${count} produk berhasil diimport`, 'success');
        this.loadProducts();
      } catch (err) {
        console.error(err);
        Utils.toast('Gagal import file', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }
};
