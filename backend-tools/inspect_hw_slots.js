const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function run() {
  const [schedulesSnap, usersSnap, classesSnap] = await Promise.all([
    db.ref('curriculum/schedules').once('value'),
    db.ref('users').once('value'),
    db.ref('classes').once('value')
  ]);
  const schedules = schedulesSnap.val() || {};
  const users = usersSnap.val() || {};
  const classes = classesSnap.val() || {};

  const hwSlots = Object.entries(schedules)
    .map(([id, s]) => ({ id, ...s }))
    .filter(s => (s.subjectName || '').toLowerCase().includes('hizbul') || (s.subjectName || '').toLowerCase() === 'hw');
  
  console.log('HW slots count:', hwSlots.length);
  hwSlots.forEach(s => {
    console.log(s.classId, classes[s.classId]?.name, 'Day:', s.day, 'Period:', s.period, 'Teacher:', s.teacherId, users[s.teacherId]?.name);
  });
  process.exit(0);
}
run();