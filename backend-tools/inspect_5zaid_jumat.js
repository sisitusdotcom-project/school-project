const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function run() {
  const [schedulesSnap, usersSnap] = await Promise.all([
    db.ref('curriculum/schedules').once('value'),
    db.ref('users').once('value')
  ]);
  const schedules = schedulesSnap.val() || {};
  const users = usersSnap.val() || {};

  const slots = Object.values(schedules).filter(s => s.classId === 'CLASS_5_ZAID_BIN_TSABIT' && s.day === 'Jumat');
  slots.sort((a,b) => (a.period || 0) - (b.period || 0));
  slots.forEach(s => {
    console.log('Period:', s.period, s.startTime + '-' + s.endTime, s.subjectName, 'Teacher:', s.teacherId, users[s.teacherId]?.name);
  });
  process.exit(0);
}
run();