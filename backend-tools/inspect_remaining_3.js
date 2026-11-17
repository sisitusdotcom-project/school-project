const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function inspectRemaining() {
  const schedulesSnap = await db.ref('curriculum/schedules').once('value');
  const schedules = schedulesSnap.val() || {};

  console.log('--- 3 ALI TUESDAY ---');
  Object.values(schedules)
    .filter(s => s.classId === 'CLASS_3_ALI_BIN_ABI_THALIB' && s.day === 'Selasa')
    .sort((a,b) => (a.period||0) - (b.period||0))
    .forEach(s => console.log('P' + s.period, s.startTime + '-' + s.endTime, s.subjectName));

  console.log('\n--- 3 BILAL TUESDAY ---');
  Object.values(schedules)
    .filter(s => s.classId === 'CLASS_3_BILAL_BIN_RABBAH' && s.day === 'Selasa')
    .sort((a,b) => (a.period||0) - (b.period||0))
    .forEach(s => console.log('P' + s.period, s.startTime + '-' + s.endTime, s.subjectName));

  console.log('\n--- 4 ABDURRAHMAN MONDAY ---');
  Object.values(schedules)
    .filter(s => s.classId === 'CLASS_4_ABDURRAHMAN_BIN_AUF' && s.day === 'Senin')
    .sort((a,b) => (a.period||0) - (b.period||0))
    .forEach(s => console.log('P' + s.period, s.startTime + '-' + s.endTime, s.subjectName));

  console.log('\n--- 4 KHALID MONDAY ---');
  Object.values(schedules)
    .filter(s => s.classId === 'CLASS_4_KHALID_BIN_WALID' && s.day === 'Senin')
    .sort((a,b) => (a.period||0) - (b.period||0))
    .forEach(s => console.log('P' + s.period, s.startTime + '-' + s.endTime, s.subjectName));

  console.log('\n--- HARIS KUSWANDI ALL TAPAK SUCI SLOTS ---');
  Object.values(schedules)
    .filter(s => (s.subjectName||'').toLowerCase().includes('tapak suci'))
    .sort((a,b) => (a.period||0) - (b.period||0))
    .forEach(s => console.log(s.day, 'P' + s.period, s.startTime + '-' + s.endTime, s.classId));

  process.exit(0);
}
inspectRemaining();
