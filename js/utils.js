// Utility functions
const Utils = {
  formatRupiah(num) {
    if (num == null || isNaN(num)) return 'Rp 0';
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  },

  formatNumber(num) {
    return Math.round(num).toLocaleString('id-ID');
  },

  formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  formatDateTime(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  generateInvoice() {
    const now = new Date();
    const date = now.toISOString().slice(0,10).replace(/-/g,'');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${date}-${rand}`;
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const colors = {
      success: 'bg-emerald-600',
      error: 'bg-red-600',
      warning: 'bg-amber-500',
      info: 'bg-slate-700'
    };
    const el = document.createElement('div');
    el.className = `toast ${colors[type] || colors.info} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 max-w-sm`;
    el.innerHTML = `<span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  },

  confirm(message) {
    return window.confirm(message);
  },

  // Simple debounce
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  // Online/offline detection
  isOnline() {
    return navigator.onLine;
  },

  updateOnlineStatus() {
    const badge = document.getElementById('offline-badge');
    if (!badge) return;
    if (navigator.onLine) {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    } else {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    }
  }
};

// Init online status
window.addEventListener('online', () => {
  Utils.updateOnlineStatus();
  Utils.toast('Koneksi kembali online', 'success');
});
window.addEventListener('offline', () => {
  Utils.updateOnlineStatus();
  Utils.toast('Mode offline aktif', 'warning');
});
