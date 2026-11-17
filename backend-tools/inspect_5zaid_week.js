const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function run() {
  const schedulesSnap = await db.ref('curriculum/schedules').once('value');
  const schedules = schedulesSnap.val() || {};

  const slots = Object.values(schedules).filter(s => s.classId === 'CLASS_5_ZAID_BIN_TSABIT');
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  slots.sort((a,b) => {
    if (a.day !== b.day) return days.indexOf(a.day) - days.indexOf(b.day);
    return (a.period || 0) - (b.period || 0);
  });
  slots.forEach(s => {
    console.log(s.day, 'P' + s.period, s.startTime + '-' + s.endTime, s.subjectName, '|', s.teacherId);
  });
  process.exit(0);
}
run();