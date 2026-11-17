const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function analyzeResolutions() {
  const [schedulesSnap, classesSnap] = await Promise.all([
    db.ref('curriculum/schedules').once('value'),
    db.ref('classes').once('value')
  ]);

  const schedules = schedulesSnap.val() || {};
  const classes = classesSnap.val() || {};

  // Find all slots for each class by day and period
  const byClassDay = {};
  for (const [id, s] of Object.entries(schedules)) {
    if (!byClassDay[s.classId]) byClassDay[s.classId] = {};
    if (!byClassDay[s.classId][s.day]) byClassDay[s.classId][s.day] = {};
    byClassDay[s.classId][s.day][s.period] = { id, ...s };
  }

  console.log('Class schedule matrix loaded.');
  process.exit(0);
}
analyzeResolutions();
