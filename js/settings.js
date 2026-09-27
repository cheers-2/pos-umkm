// Pengaturan (Owner only)
const SettingsPage = {
  async render(container) {
    if (!Auth.isOwner()) {
      container.innerHTML = `<div class="p-8 text-center text-slate-500">Hanya Owner yang dapat mengakses pengaturan.</div>`;
      return;
    }
    const s = await getSettings();
    container.innerHTML = `
      <div class="p-4 max-w-xl mx-auto">
        <h2 class="text-xl font-bold text-slate-800 mb-6">Pengaturan Toko</h2>
        <form id="settings-form" class="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nama Toko</label>
            <input type="text" id="s-storeName" value="${s.storeName || ''}" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Alamat</label>
            <input type="text" id="s-storeAddress" value="${s.storeAddress || ''}" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Telepon</label>
            <input type="text" id="s-storePhone" value="${s.storePhone || ''}" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Footer Struk</label>
            <input type="text" id="s-receiptFooter" value="${s.receiptFooter || ''}" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div class="flex items-center gap-3">
            <input type="checkbox" id="s-taxEnabled" ${s.taxEnabled === true || s.taxEnabled === 'true' ? 'checked' : ''} class="w-5 h-5 rounded text-primary-600" />
            <label for="s-taxEnabled" class="text-sm font-medium">Aktifkan PPN</label>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Tarif PPN (%)</label>
            <input type="number" id="s-taxRate" value="${s.taxRate || 11}" min="0" max="100" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700">Simpan Pengaturan</button>
        </form>

        <div class="mt-8 bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-bold mb-3">Manajemen User</h3>
          <div id="user-list" class="space-y-2 mb-4"></div>
          <p class="text-xs text-slate-400">Untuk menambah user baru, hubungi developer atau gunakan fitur lanjutan di versi berikutnya.</p>
        </div>

        <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <p class="font-medium mb-1">Backup Data</p>
          <p class="mb-3">Data tersimpan di browser (IndexedDB). Untuk backup, export produk & laporan secara berkala.</p>
          <button id="btn-clear-data" class="text-red-600 hover:underline text-sm">Reset semua data (hati-hati!)</button>
        </div>
      </div>
    `;

    document.getElementById('settings-form').onsubmit = async (e) => {
      e.preventDefault();
      await saveSetting('storeName', document.getElementById('s-storeName').value);
      await saveSetting('storeAddress', document.getElementById('s-storeAddress').value);
      await saveSetting('storePhone', document.getElementById('s-storePhone').value);
      await saveSetting('receiptFooter', document.getElementById('s-receiptFooter').value);
      await saveSetting('taxEnabled', document.getElementById('s-taxEnabled').checked);
      await saveSetting('taxRate', Number(document.getElementById('s-taxRate').value) || 11);
      document.getElementById('outlet-name').textContent = document.getElementById('s-storeName').value;
      Utils.toast('Pengaturan disimpan', 'success');
    };

    document.getElementById('btn-clear-data').onclick = async () => {
      if (!Utils.confirm('Hapus SEMUA data (produk, transaksi, setting)? Aksi ini tidak bisa dibatalkan.')) return;
      if (!Utils.confirm('Yakin sekali lagi?')) return;
      await db.delete();
      localStorage.clear();
      location.reload();
    };

    const users = await db.users.toArray();
    document.getElementById('user-list').innerHTML = users.map(u => `
      <div class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <div>
          <div class="font-medium">${u.name}</div>
          <div class="text-xs text-slate-400">@${u.username} • ${u.role}</div>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-full ${u.role === 'owner' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}">${u.role}</span>
      </div>
    `).join('');
  }
};
