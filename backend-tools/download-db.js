const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');
const path = require('path');

let serviceAccount;
try {
  serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
} catch (e) {
  console.error("❌ ERROR: File service account tidak ditemukan di backend-tools/keys/");
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});

const db = getDatabase(app);

async function downloadDB() {
  console.log("Mengunduh database dari Firebase...");
  try {
    const rootRef = db.ref();
    const snapshot = await rootRef.once('value');
    const data = snapshot.val();
    
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    const filePath = path.join(dataDir, 'musada-sd-default-rtdb-export.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Berhasil mengunduh dan menyimpan database ke ${filePath}`);
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error);
  } finally {
    process.exit(0);
  }
}

downloadDB();
