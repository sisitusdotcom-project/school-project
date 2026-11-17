const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function run() {
  const [schedulesSnap, classesSnap] = await Promise.all([
    db.ref('curriculum/schedules').once('value'),
    db.ref('classes').once('value')
  ]);
  const schedules = schedulesSnap.val() || {};
  const classes = classesSnap.val() || {};

  const slots = Object.values(schedules).filter(s => s.teacherId === 'GTK_ROICHATUL_JANNAH');
  slots.sort((a,b) => {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    if (a.day !== b.day) return days.indexOf(a.day) - days.indexOf(b.day);
    return (a.period || 0) - (b.period || 0);
  });
  console.log('Roichatul slots count:', slots.length);
  slots.forEach(s => {
    console.log(s.day, 'Period:', s.period, s.startTime + '-' + s.endTime, '| Class:', classes[s.classId]?.name, '| Subj:', s.subjectName);
  });
  process.exit(0);
}
run();