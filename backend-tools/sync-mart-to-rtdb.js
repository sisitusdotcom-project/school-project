const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');
const path = require('path');
const https = require('https');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function syncMartData() {
  console.log('1. Membaca master data produk...');
  const jsonPath = path.join(__dirname, '../mart/assets/data/products.json');
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log('2. Mengunggah data produk ke RTDB /mart/products...');
  await db.ref('mart/products').set(products);

  console.log('3. Mengunggah konfigurasi toko ke RTDB /mart/settings...');
  await db.ref('mart/settings').set({
    storeName: 'MUSADA Mart',
    schoolName: 'SD Muhammadiyah 1 Sedati',
    tagline: 'Koperasi Sekolah Digital',
    contactWa: '6285964399398',
    openHours: 'Senin - Jumat: 07.00 - 15.00 WIB',
    location: 'Gedung Utama Lantai 1, SD Muhammadiyah 1 Sedati',
    updatedAt: new Date().toISOString()
  });

  console.log('4. Memperbarui rules keamanan di login/database.rules.json...');
  const rulesPath = path.join(__dirname, '../login/database.rules.json');
  const rulesObj = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  rulesObj.rules.mart = {
    ".read": "true",
    ".write": "true",
    "products": {
      ".indexOn": ["kat", "nama"]
    },
    "orders": {
      ".indexOn": ["orderNumber", "createdAt"]
    }
  };
  fs.writeFileSync(rulesPath, JSON.stringify(rulesObj, null, 2), 'utf8');

  console.log('5. Menerapkan security rules ke Firebase RTDB...');
  await db.setRules(JSON.stringify(rulesObj));

  console.log('6. Menguji pembacaan publik tanpa autentikasi via HTTPS GET...');
  await new Promise((resolve, reject) => {
    https.get('https://musada-sd-default-rtdb.firebaseio.com/mart/products.json', (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const count = Object.keys(parsed).length;
          console.log(`SUKSES: Berhasil membaca ${count} produk dari endpoint RTDB publik!`);
          resolve();
        } catch (e) {
          console.error('Gagal parse respons publik:', body);
          reject(e);
        }
      });
    }).on('error', reject);
  });

  console.log('Sinkronisasi RTDB selesai 100%!');
  process.exit(0);
}

syncMartData().catch(err => {
  console.error('Error saat sinkronisasi RTDB:', err);
  process.exit(1);
});

