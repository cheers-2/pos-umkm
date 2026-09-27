// Main application controller
const App = {
  currentPage: 'kasir',

  async init() {
    try {
      await seedDatabase();
      Utils.updateOnlineStatus();

      // Restore session
      if (Auth.restore()) {
        this.showMainApp();
      } else {
        this.showLogin();
      }

      // Login form
      document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const result = await Auth.login(username, password);
        if (result.ok) {
          this.showMainApp();
        } else {
          Utils.toast(result.message, 'error');
        }
      };

      // Logout
      document.getElementById('btn-logout').onclick = () => {
        Auth.logout();
        this.showLogin();
      };

      // Sidebar toggle
      document.getElementById('btn-menu').onclick = () => {
        document.getElementById('sidebar').classList.toggle('-translate-x-full');
        document.getElementById('sidebar-overlay').classList.toggle('hidden');
      };
      document.getElementById('sidebar-overlay').onclick = () => {
        document.getElementById('sidebar').classList.add('-translate-x-full');
        document.getElementById('sidebar-overlay').classList.add('hidden');
      };

      // Navigation
      document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = () => {
          const page = btn.dataset.page;
          this.navigate(page);
          // Close mobile sidebar
          document.getElementById('sidebar').classList.add('-translate-x-full');
          document.getElementById('sidebar-overlay').classList.add('hidden');
        };
      });

      // Hide loading
      document.getElementById('loading-screen').classList.add('hidden');
      lucide.createIcons();
    } catch (err) {
      console.error('Init error:', err);
      const isConstraint = (err.name === 'ConstraintError') || (err.message && err.message.includes('createIndex'));
      document.getElementById('loading-screen').innerHTML = `
        <div class="text-center px-6">
          <p class="text-white text-lg font-bold">Gagal memuat aplikasi</p>
          <p class="text-primary-100 text-sm mt-2 max-w-md mx-auto">${err.message || err}</p>
          ${isConstraint ? `
            <p class="text-primary-200 text-xs mt-3">Database lama bentrok dengan versi baru.<br>Klik tombol di bawah untuk reset data lokal.</p>
            <button onclick="resetDatabase()" class="mt-4 px-5 py-2.5 bg-amber-400 text-amber-900 rounded-xl font-semibold hover:bg-amber-300">
              Reset Database & Muat Ulang
            </button>
          ` : ''}
          <button onclick="location.reload()" class="mt-3 block mx-auto px-4 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30">
            Coba Lagi
          </button>
        </div>
      `;
    }
  },

  showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
    lucide.createIcons();
  },

  async showMainApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');

    const user = Auth.currentUser;
    document.getElementById('current-user').textContent = user.name + (user.role === 'owner' ? ' (Owner)' : '');

    // Role-based UI
    document.querySelectorAll('.owner-only').forEach(el => {
      if (Auth.isOwner()) {
        el.classList.remove('hidden-role');
      } else {
        el.classList.add('hidden-role');
      }
    });

    const settings = await getSettings();
    document.getElementById('outlet-name').textContent = settings.storeName || 'POS UMKM';

    this.navigate('kasir');
    lucide.createIcons();
  },

  async navigate(page) {
    this.currentPage = page;
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.dataset.page === page) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const content = document.getElementById('content');
    content.innerHTML = `<div class="flex items-center justify-center h-40"><div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>`;

    try {
      if (page === 'kasir') await PosPage.render(content);
      else if (page === 'produk') await ProductsPage.render(content);
      else if (page === 'laporan') await ReportsPage.render(content);
      else if (page === 'pengaturan') await SettingsPage.render(content);
    } catch (err) {
      console.error(err);
      content.innerHTML = `<div class="p-8 text-center text-red-500">Gagal memuat halaman: ${err.message}</div>`;
    }
  }
};

// Start
document.addEventListener('DOMContentLoaded', () => App.init());
