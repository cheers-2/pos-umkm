// Database layer using Dexie (IndexedDB) - offline first
const db = new Dexie('POS_UMKM');

// Version 2: clean indexes (no multi-entry * on string fields)
db.version(2).stores({
  products: '++id, name, name_lc, sku, barcode, category',
  categories: '++id, name',
  transactions: '++id, invoice, createdAt, status, paymentMethod',
  transactionItems: '++id, transactionId, productId',
  users: '++id, username, role',
  settings: 'key',
  stockLogs: '++id, productId, type, createdAt'
});

// Keep version 1 definition so upgrade path is clean (empty stores = delete old)
db.version(1).stores({
  products: '++id, name, sku, barcode, category, name_lc',
  categories: '++id, name',
  transactions: '++id, invoice, createdAt, status, paymentMethod',
  transactionItems: '++id, transactionId, productId',
  users: '++id, username, role',
  settings: 'key',
  stockLogs: '++id, productId, type, createdAt'
});

// Seed data on first run
async function seedDatabase() {
  try {
    const userCount = await db.users.count();
    if (userCount > 0) return;

    // Users
    await db.users.bulkAdd([
      { username: 'owner', password: '123456', name: 'Pemilik Toko', role: 'owner' },
      { username: 'kasir', password: '123456', name: 'Kasir 1', role: 'kasir' }
    ]);

    // Categories
    await db.categories.bulkAdd([
      { name: 'Makanan' },
      { name: 'Minuman' },
      { name: 'Snack' },
      { name: 'Sembako' },
      { name: 'Lainnya' }
    ]);

    // Sample products
    const products = [
      { name: 'Nasi Goreng', sku: 'MKN001', barcode: '8991001100011', category: 'Makanan', price: 15000, cost: 8000, stock: 50, unit: 'porsi', image: null },
      { name: 'Mie Goreng', sku: 'MKN002', barcode: '8991001100028', category: 'Makanan', price: 12000, cost: 6000, stock: 40, unit: 'porsi', image: null },
      { name: 'Ayam Goreng', sku: 'MKN003', barcode: '8991001100035', category: 'Makanan', price: 18000, cost: 10000, stock: 30, unit: 'porsi', image: null },
      { name: 'Es Teh Manis', sku: 'MNM001', barcode: '8991001200018', category: 'Minuman', price: 5000, cost: 1500, stock: 100, unit: 'gelas', image: null },
      { name: 'Es Jeruk', sku: 'MNM002', barcode: '8991001200025', category: 'Minuman', price: 7000, cost: 2500, stock: 80, unit: 'gelas', image: null },
      { name: 'Kopi Hitam', sku: 'MNM003', barcode: '8991001200032', category: 'Minuman', price: 8000, cost: 3000, stock: 60, unit: 'gelas', image: null },
      { name: 'Keripik Kentang', sku: 'SNK001', barcode: '8991001300015', category: 'Snack', price: 10000, cost: 6000, stock: 25, unit: 'pcs', image: null },
      { name: 'Biskuit Roma', sku: 'SNK002', barcode: '8991001300022', category: 'Snack', price: 8000, cost: 5000, stock: 40, unit: 'pcs', image: null },
      { name: 'Beras 1kg', sku: 'SMB001', barcode: '8991001400012', category: 'Sembako', price: 14000, cost: 12000, stock: 20, unit: 'kg', image: null },
      { name: 'Minyak Goreng 1L', sku: 'SMB002', barcode: '8991001400029', category: 'Sembako', price: 18000, cost: 15000, stock: 15, unit: 'botol', image: null },
      { name: 'Gula Pasir 1kg', sku: 'SMB003', barcode: '8991001400036', category: 'Sembako', price: 16000, cost: 14000, stock: 18, unit: 'kg', image: null },
      { name: 'Air Mineral 600ml', sku: 'MNM004', barcode: '8991001200049', category: 'Minuman', price: 4000, cost: 2000, stock: 120, unit: 'botol', image: null }
    ];

    for (const p of products) {
      p.name_lc = p.name.toLowerCase();
      p.lowStock = 10;
      p.createdAt = new Date().toISOString();
      p.updatedAt = p.createdAt;
    }
    await db.products.bulkAdd(products);

    // Settings
    await db.settings.bulkPut([
      { key: 'storeName', value: 'Warung Maju Jaya' },
      { key: 'storeAddress', value: 'Jl. Merdeka No. 12, Jakarta' },
      { key: 'storePhone', value: '081234567890' },
      { key: 'taxRate', value: 11 },
      { key: 'taxEnabled', value: false },
      { key: 'currency', value: 'IDR' },
      { key: 'receiptFooter', value: 'Terima kasih sudah berbelanja!' },
      { key: 'lowStockThreshold', value: 10 }
    ]);

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  }
}

// Helper: completely wipe the database (for schema recovery)
async function resetDatabase() {
  await db.delete();
  // Re-open will recreate with current schema
  location.reload();
}

// Helper queries
async function getProducts(search = '', category = '') {
  let list;
  if (search) {
    const q = search.toLowerCase();
    list = await db.products
      .filter(p =>
        (p.name_lc && p.name_lc.includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q))
      )
      .toArray();
  } else {
    list = await db.products.orderBy('name').toArray();
  }
  if (category) list = list.filter(p => p.category === category);
  return list;
}

async function getProductByBarcode(barcode) {
  return await db.products.where('barcode').equals(barcode).first();
}

async function getProductById(id) {
  return await db.products.get(id);
}

async function updateStock(productId, qtyChange, type, note = '') {
  const p = await db.products.get(productId);
  if (!p) return;
  const newStock = Math.max(0, (p.stock || 0) + qtyChange);
  await db.products.update(productId, { stock: newStock, updatedAt: new Date().toISOString() });
  await db.stockLogs.add({
    productId,
    type,
    qty: Math.abs(qtyChange),
    before: p.stock,
    after: newStock,
    note,
    createdAt: new Date().toISOString()
  });
  return newStock;
}

async function createTransaction(data) {
  const id = await db.transactions.add({
    ...data,
    createdAt: new Date().toISOString(),
    status: 'completed'
  });
  for (const item of data.items) {
    await updateStock(item.productId, -item.qty, 'sale', `Transaksi #${data.invoice}`);
  }
  return id;
}

async function getTransactions(fromDate, toDate) {
  let list = await db.transactions.orderBy('createdAt').reverse().toArray();
  if (fromDate) list = list.filter(t => t.createdAt >= fromDate);
  if (toDate) list = list.filter(t => t.createdAt <= toDate + 'T23:59:59');
  return list;
}

async function getSettings() {
  const rows = await db.settings.toArray();
  const obj = {};
  rows.forEach(r => { obj[r.key] = r.value; });
  return obj;
}

async function saveSetting(key, value) {
  await db.settings.put({ key, value });
}
