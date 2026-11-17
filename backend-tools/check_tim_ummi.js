const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function checkTimUmmiRefs() {
  const [classesSnap, schedSnap] = await Promise.all([
    db.ref('classes').once('value'),
    db.ref('curriculum/schedules').once('value')
  ]);
  const classes = classesSnap.val() || {};
  const schedules = schedSnap.val() || {};

  let classCount = 0;
  for (const [cid, c] of Object.entries(classes)) {
    for (const [sid, tid] of Object.entries(c.subjectTeachers || {})) {
      if (tid === 'TIM_UMMI') {
        console.log('Class using TIM_UMMI:', cid, sid);
        classCount++;
      }
    }
  }

  let schedCount = 0;
  for (const [sid, s] of Object.entries(schedules)) {
    if (s.teacherId === 'TIM_UMMI' || (s.teachers && s.teachers.includes('TIM_UMMI'))) {
      console.log('Schedule using TIM_UMMI:', sid);
      schedCount++;
    }
  }

  console.log('Total classes using TIM_UMMI:', classCount);
  console.log('Total schedules using TIM_UMMI:', schedCount);
  process.exit(0);
}
checkTimUmmiRefs();
