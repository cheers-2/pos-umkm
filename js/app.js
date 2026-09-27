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
      document.getElementById('loading-screen').innerHTML = `
        <p class="text-white text-lg">Gagal memuat aplikasi</p>
        <p class="text-primary-100 text-sm mt-2">${err.message}</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-white text-primary-700 rounded-xl font-medium">Coba Lagi</button>
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
