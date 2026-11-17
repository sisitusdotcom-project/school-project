const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function findSlots() {
  const schedulesSnap = await db.ref('curriculum/schedules').once('value');
  const schedules = schedulesSnap.val() || {};

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  for (const day of days) {
    for (let p = 1; p <= 10; p++) {
      const roichaBusy = Object.values(schedules).some(s => s.day === day && Number(s.period) === p && (s.teacherId === 'GTK_ROICHATUL_JANNAH' || (s.subjectName||'').includes('IPAS')));
      const zaidSlot = Object.values(schedules).find(s => s.classId === 'CLASS_5_ZAID_BIN_TSABIT' && s.day === day && Number(s.period) === p);
      if (!roichaBusy && zaidSlot) {
        console.log('Day: ' + day + ', P' + p + ' -> Roichatul is FREE, 5 Zaid has: ' + zaidSlot.subjectName + ' (' + zaidSlot.teacherId + ')');
      }
    }
  }
  process.exit(0);
}
findSlots();
