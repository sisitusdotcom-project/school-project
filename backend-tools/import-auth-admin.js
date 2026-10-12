const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
let serviceAccount;
try {
  serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
} catch (e) {
  console.error("ERROR: File service account tidak ditemukan di backend-tools/keys/");
  process.exit(1);
}
initializeApp({
  credential: cert(serviceAccount)
});
const rtdbExport = JSON.parse(fs.readFileSync('./data/musada-sd-default-rtdb-export.json', 'utf-8'));
const users = rtdbExport.users || {};
const defaultPassword = 'Password123!';
async function importUsers() {
  console.log(`Mulai memproses ${Object.keys(users).length} pengguna...`);
  for (const [uid, userData] of Object.entries(users)) {
    try {
      try {
        await getAuth().getUser(uid);
        console.log(`[SKIP] Akun sudah ada: ${uid}`);
        continue;
      } catch (e) {
        if (e.code !== 'auth/user-not-found') throw e;
      }
      const cleanUid = uid.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${cleanUid}@musada.sch.id`;
      await getAuth().createUser({
        uid: uid,
        email: email,
        password: defaultPassword,
        displayName: userData.name
      });
      console.log(`[SUCCESS] Dibuat: ${uid} - Email: ${email}`);
    } catch (error) {
      console.error(`[ERROR] Gagal membuat ${uid}:`, error.message);
    }
  }
  console.log("Selesai memproses semua pengguna!");
}
importUsers();
