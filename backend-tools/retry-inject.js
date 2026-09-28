const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');

let serviceAccount;
try {
  serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
} catch (e) {
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://musada-sd-default-rtdb.firebaseio.com"
});

const db = getDatabase();
const rtdbExport = JSON.parse(fs.readFileSync('./data/musada-sd-default-rtdb-export.json', 'utf-8'));

async function injectData() {
  console.log("Mencoba ulang injeksi...");
  try {
    const updates = {};
    if (rtdbExport.users) updates['/users'] = rtdbExport.users;
    
    // Inject master items to ROOT
    if (rtdbExport.master) {
       if (rtdbExport.master.classes) updates['/classes'] = rtdbExport.master.classes;
       if (rtdbExport.master.subjects) updates['/subjects'] = rtdbExport.master.subjects;
       if (rtdbExport.master.academicYears) updates['/academicYears'] = rtdbExport.master.academicYears;
       if (rtdbExport.master.semesters) updates['/semesters'] = rtdbExport.master.semesters;
       if (rtdbExport.master.rooms) updates['/rooms'] = rtdbExport.master.rooms;
       if (rtdbExport.master.assets) updates['/assets'] = rtdbExport.master.assets;
    }
    
    if (rtdbExport.settings) updates['/settings'] = rtdbExport.settings;
    
    updates['/master'] = null; // Clean up old wrong path
    
    await db.ref().update(updates);
    console.log("✅ INJEKSI BERHASIL!");
    process.exit(0);
  } catch (error) {
    console.error("❌ INJEKSI GAGAL:", error);
    process.exit(1);
  }
}

injectData();
