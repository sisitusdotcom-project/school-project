const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);
async function syncUsers() {
  const exportPath = path.join(__dirname, 'data', 'musada-sd-default-rtdb-export.json');
  const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const users = data.users || {};
  console.log(`Menyinkronkan ${Object.keys(users).length} pengguna ke Firebase Realtime Database...`);
  await db.ref('users').update(users);
  console.log('Sinkronisasi pengguna ke RTDB berhasil!');
  process.exit(0);
}
syncUsers().catch((err) => {
  console.error('Gagal:', err);
  process.exit(1);
});
