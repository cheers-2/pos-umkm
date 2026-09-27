// Authentication & Role management
const Auth = {
  currentUser: null,

  async login(username, password) {
    const user = await db.users.where('username').equals(username).first();
    if (!user || user.password !== password) {
      return { ok: false, message: 'Username atau password salah' };
    }
    this.currentUser = { id: user.id, username: user.username, name: user.name, role: user.role };
    localStorage.setItem('pos_user', JSON.stringify(this.currentUser));
    return { ok: true, user: this.currentUser };
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('pos_user');
  },

  restore() {
    const raw = localStorage.getItem('pos_user');
    if (raw) {
      try {
        this.currentUser = JSON.parse(raw);
        return true;
      } catch (e) {
        localStorage.removeItem('pos_user');
      }
    }
    return false;
  },

  isOwner() {
    return this.currentUser && this.currentUser.role === 'owner';
  },

  isKasir() {
    return this.currentUser && this.currentUser.role === 'kasir';
  },

  requireOwner() {
    if (!this.isOwner()) {
      Utils.toast('Hanya Owner yang bisa mengakses fitur ini', 'error');
      return false;
    }
    return true;
  }
};
