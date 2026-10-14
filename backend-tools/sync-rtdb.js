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
async function syncDatabase() {
  const exportPath = path.join(__dirname, 'data', 'musada-sd-default-rtdb-export.json');
  const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const users = data.users || {};
  const classes = data.classes || {};
  const subjects = data.subjects || {};
  const characters = data.characters || {};
  console.log(`Menyinkronkan ${Object.keys(users).length} pengguna, ${Object.keys(classes).length} kelas, dan ${Object.keys(subjects).length} mata pelajaran...`);
  await db.ref('users').update(users);
  await db.ref('classes').update(classes);
  await db.ref('subjects').update(subjects);
  await db.ref('characters').update(characters);
  await Promise.all(Object.keys(users).map((uid) => db.ref(`users/${uid}/teachingRole`).remove()));
  console.log('Sinkronisasi RTDB berhasil!');
  process.exit(0);
}
syncDatabase().catch((err) => {
  console.error('Gagal:', err);
  process.exit(1);
});