const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function inspectClass456() {
  const [classesSnap, usersSnap, subjectsSnap] = await Promise.all([
    db.ref('classes').once('value'),
    db.ref('users').once('value'),
    db.ref('subjects').once('value')
  ]);
  const classes = classesSnap.val() || {};
  const users = usersSnap.val() || {};
  const subjects = subjectsSnap.val() || {};

  ['CLASS_4_ABDURRAHMAN_BIN_AUF', 'CLASS_4_KHALID_BIN_WALID', 'CLASS_4_HAFSHAH_BINTI_UMAR', 'CLASS_5_MARYAM_BINTI_IMRAN', 'CLASS_5_ZAID_BIN_TSABIT', 'CLASS_6_FATIMAH_BINTI_MUHAMMAD', 'CLASS_6_MU_ADZ_BIN_JABAL'].forEach(cId => {
    const c = classes[cId];
    console.log('\n=== ' + c.name + ' (' + cId + ') ===');
    console.log('Walas:', c.teacherId, users[c.teacherId]?.name);
    const st = c.subjectTeachers || {};
    for (const [sId, tId] of Object.entries(st)) {
      const sName = subjects[sId]?.name || sId;
      const tName = users[tId]?.name || tId;
      console.log('  ' + sId + ' (' + sName + ') -> ' + tName);
    }
  });
  process.exit(0);
}
inspectClass456();
