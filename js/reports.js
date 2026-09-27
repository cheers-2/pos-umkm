// Laporan & Dashboard
const ReportsPage = {
  async render(container) {
    container.innerHTML = `
      <div class="p-4 max-w-6xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 class="text-xl font-bold text-slate-800">Laporan Penjualan</h2>
          <div class="flex gap-2">
            <input type="date" id="report-from" class="px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <input type="date" id="report-to" class="px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            <button id="btn-filter-report" class="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">Filter</button>
            <button id="btn-export-report" class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-1">
              <i data-lucide="download" class="w-4 h-4"></i> Excel
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-4">
            <p class="text-xs text-slate-500 mb-1">Total Penjualan</p>
            <p id="stat-revenue" class="text-xl font-bold text-primary-700">Rp 0</p>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200 p-4">
            <p class="text-xs text-slate-500 mb-1">Jumlah Transaksi</p>
            <p id="stat-count" class="text-xl font-bold">0</p>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200 p-4">
            <p class="text-xs text-slate-500 mb-1">Rata-rata / Transaksi</p>
            <p id="stat-avg" class="text-xl font-bold">Rp 0</p>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200 p-4">
            <p class="text-xs text-slate-500 mb-1">Estimasi Laba</p>
            <p id="stat-profit" class="text-xl font-bold text-emerald-600">Rp 0</p>
          </div>
        </div>

        <!-- Top Products -->
        <div class="grid lg:grid-cols-2 gap-4 mb-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 class="font-bold mb-3">Produk Terlaris</h3>
            <div id="top-products" class="space-y-2"></div>
          </div>
          <div class="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 class="font-bold mb-3">Metode Pembayaran</h3>
            <div id="payment-breakdown" class="space-y-2"></div>
          </div>
        </div>

        <!-- Transaction List -->
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 font-bold">Riwayat Transaksi</div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="text-left px-4 py-3 font-medium">Invoice</th>
                  <th class="text-left px-4 py-3 font-medium">Waktu</th>
                  <th class="text-left px-4 py-3 font-medium">Kasir</th>
                  <th class="text-left px-4 py-3 font-medium">Metode</th>
                  <th class="text-right px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody id="tx-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    // Default today
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('report-from').value = today;
    document.getElementById('report-to').value = today;
    document.getElementById('btn-filter-report').onclick = () => this.load();
    document.getElementById('btn-export-report').onclick = () => this.exportExcel();
    await this.load();
  },

  async load() {
    const from = document.getElementById('report-from').value;
    const to = document.getElementById('report-to').value;
    const list = await getTransactions(from, to);

    // Stats
    const revenue = list.reduce((s, t) => s + (t.total || 0), 0);
    const count = list.length;
    const avg = count ? revenue / count : 0;
    let profit = 0;
    list.forEach(t => {
      (t.items || []).forEach(i => {
        profit += ((i.price || 0) - (i.cost || 0)) * (i.qty || 0);
      });
    });

    document.getElementById('stat-revenue').textContent = Utils.formatRupiah(revenue);
    document.getElementById('stat-count').textContent = Utils.formatNumber(count);
    document.getElementById('stat-avg').textContent = Utils.formatRupiah(avg);
    document.getElementById('stat-profit').textContent = Utils.formatRupiah(profit);

    // Top products
    const productMap = {};
    list.forEach(t => {
      (t.items || []).forEach(i => {
        if (!productMap[i.name]) productMap[i.name] = { qty: 0, revenue: 0 };
        productMap[i.name].qty += i.qty;
        productMap[i.name].revenue += i.subtotal || (i.price * i.qty);
      });
    });
    const top = Object.entries(productMap)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    document.getElementById('top-products').innerHTML = top.length
      ? top.map((p, i) => `
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">${i + 1}</span>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm truncate">${p.name}</div>
            <div class="text-xs text-slate-400">${p.qty} terjual</div>
          </div>
          <div class="text-sm font-medium">${Utils.formatRupiah(p.revenue)}</div>
        </div>
      `).join('')
      : '<p class="text-slate-400 text-sm">Belum ada data</p>';

    // Payment methods
    const payMap = {};
    list.forEach(t => {
      const m = t.paymentMethod || 'lainnya';
      payMap[m] = (payMap[m] || 0) + 1;
    });
    document.getElementById('payment-breakdown').innerHTML = Object.keys(payMap).length
      ? Object.entries(payMap).map(([m, c]) => `
        <div class="flex justify-between text-sm">
          <span class="capitalize">${m}</span>
          <span class="font-medium">${c}x (${Math.round(c / count * 100)}%)</span>
        </div>
      `).join('')
      : '<p class="text-slate-400 text-sm">Belum ada data</p>';

    // Table
    const tbody = document.getElementById('tx-table-body');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-slate-400">Tidak ada transaksi pada periode ini</td></tr>`;
    } else {
      tbody.innerHTML = list.map(t => `
        <tr class="border-t border-slate-100 hover:bg-slate-50">
          <td class="px-4 py-3 font-medium text-primary-700">${t.invoice}</td>
          <td class="px-4 py-3 text-slate-500">${Utils.formatDateTime(t.createdAt)}</td>
          <td class="px-4 py-3">${t.cashier || '-'}</td>
          <td class="px-4 py-3 capitalize">${t.paymentMethod || '-'}</td>
          <td class="px-4 py-3 text-right font-medium">${Utils.formatRupiah(t.total)}</td>
        </tr>
      `).join('');
    }

    this._lastList = list;
  },

  exportExcel() {
    const list = this._lastList || [];
    const data = list.map(t => ({
      Invoice: t.invoice,
      Waktu: Utils.formatDateTime(t.createdAt),
      Kasir: t.cashier,
      Metode: t.paymentMethod,
      Subtotal: t.subtotal,
      Diskon: t.discount,
      Pajak: t.tax,
      Total: t.total
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
    XLSX.writeFile(wb, `laporan-pos-${new Date().toISOString().slice(0,10)}.xlsx`);
    Utils.toast('Laporan diexport', 'success');
  }
};
