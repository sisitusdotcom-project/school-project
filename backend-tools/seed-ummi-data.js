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
async function runSeed() {
  const exportPath = path.join(__dirname, 'data', 'musada-sd-default-rtdb-export.json');
  const rtdb = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const ummiClasses = rtdb.ummi_classes || {};
  const rooms = rtdb.rooms || {};
  const students = rtdb.students || {};
  console.log(`Menyinkronkan ${Object.keys(ummiClasses).length} Rombel Ummi dan ${Object.keys(students).length} santri ke Firebase RTDB...`);
  await db.ref('rooms').update(rooms);
  await db.ref('ummi_classes').set(ummiClasses);
  const studentUpdates = {};
  for (const [uid, s] of Object.entries(students)) {
    studentUpdates[`students/${uid}/ummiClassId`] = s.ummiClassId || null;
    studentUpdates[`students/${uid}/ummiLevel`] = s.ummiLevel || null;
    studentUpdates[`students/${uid}/name`] = s.name;
    studentUpdates[`students/${uid}/nis`] = s.nis;
    studentUpdates[`students/${uid}/nisn`] = s.nisn;
    studentUpdates[`students/${uid}/classId`] = s.classId;
    studentUpdates[`students/${uid}/gender`] = s.gender;
    studentUpdates[`students/${uid}/parentId`] = s.parentId || uid;
    studentUpdates[`students/${uid}/isActive`] = s.isActive !== false;
  }
  await db.ref().update(studentUpdates);
  console.log('Sinkronisasi pemetaan rombel Ummi real berhasil diselesaikan!');
  process.exit(0);
}
runSeed().catch(err => {
  console.error('Gagal:', err);
  process.exit(1);
});
