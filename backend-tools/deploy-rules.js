const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');
const path = require('path');
const sa = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
const app = initializeApp({
  credential: cert(sa),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);
async function deploy() {
  const rulesPath = path.join(__dirname, '../login/database.rules.json');
  const rulesString = fs.readFileSync(rulesPath, 'utf8');
  console.log('Menerapkan aturan keamanan ke Firebase Realtime Database...');
  await db.setRules(rulesString);
  console.log('Berhasil memperbarui Firebase Realtime Database rules!');
  process.exit(0);
}
deploy().catch((err) => {
  console.error('Gagal menerapkan rules:', err);
  process.exit(1);
});
