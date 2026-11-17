const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function inspectConflicts() {
  const [schedulesSnap, usersSnap, classesSnap] = await Promise.all([
    db.ref('curriculum/schedules').once('value'),
    db.ref('users').once('value'),
    db.ref('classes').once('value')
  ]);

  const schedules = schedulesSnap.val() || {};
  const users = usersSnap.val() || {};
  const classes = classesSnap.val() || {};

  const slots = Object.entries(schedules).map(([id, s]) => ({ id, ...s })).filter(s => s && s.day && (s.teacherId || (s.teachers && s.teachers.length)) && s.type !== 'break' && s.type !== 'ishoma');
  const bucket = {};
  slots.forEach(s => {
    const pKey = s.period || s.startTime;
    const tIds = (s.teachers && s.teachers.length) ? s.teachers : [s.teacherId, s.coTeacherId].filter(Boolean);
    tIds.forEach(tId => {
      const key = `${s.day}__${pKey}__${tId}`;
      if (!bucket[key]) bucket[key] = [];
      bucket[key].push(s);
    });
  });

  const conflicts = Object.entries(bucket).filter(([_, group]) => group.length > 1);
  console.log(`Total conflict groups: ${conflicts.length}`);

  conflicts.forEach(([key, group], idx) => {
    const [day, period, tId] = key.split('__');
    const teacher = users[tId];
    const tName = teacher ? teacher.name : tId;
    console.log(`\nConflict #${idx + 1}: ${day} Period ${period} - Guru: ${tName} (${tId})`);
    group.forEach(s => {
      const c = classes[s.classId];
      const cName = c ? c.name : s.classId;
      console.log(`   - Slot [${s.id}]: Class="${cName}", Subject="${s.subjectName}", Time="${s.startTime}-${s.endTime}", Room="${s.room}"`);
    });
  });

  process.exit(0);
}
inspectConflicts();
