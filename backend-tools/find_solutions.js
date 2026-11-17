const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function findConflictSolutions() {
  const [schedulesSnap, usersSnap, classesSnap] = await Promise.all([
    db.ref('curriculum/schedules').once('value'),
    db.ref('users').once('value'),
    db.ref('classes').once('value')
  ]);

  const schedules = schedulesSnap.val() || {};
  const users = usersSnap.val() || {};
  const classes = classesSnap.val() || {};

  function getConflicts(schedList) {
    const bucket = {};
    schedList.forEach(s => {
      if (!s || !s.day || s.type === 'break' || s.type === 'ishoma') return;
      const tIds = (s.teachers && s.teachers.length) ? s.teachers : [s.teacherId, s.coTeacherId].filter(Boolean);
      tIds.forEach(tId => {
        if (!tId || tId === 'TIM_UMMI') return;
        const key = `${s.day}__${s.period || s.startTime}__${tId}`;
        if (!bucket[key]) bucket[key] = [];
        bucket[key].push(s);
      });
    });
    const conflicts = {};
    for (const [k, g] of Object.entries(bucket)) {
      if (g.length > 1) conflicts[k] = g;
    }
    return conflicts;
  }

  const initialConflicts = getConflicts(Object.values(schedules));
  console.log(`Initial conflict count: ${Object.keys(initialConflicts).length}`);

  // Let's print out what classes have conflicts and what periods they have on those days
  for (const [key, group] of Object.entries(initialConflicts)) {
    const [day, period, tId] = key.split('__');
    console.log(`\nConflict on ${day} period ${period} for ${users[tId]?.name || tId}:`);
    group.forEach(s => {
      // Find other periods on the same day for this class
      const otherSlots = Object.values(schedules).filter(o => o.classId === s.classId && o.day === s.day && o.id !== s.id && o.type !== 'break' && o.type !== 'ishoma');
      console.log(`  Class ${s.classId} (${s.subjectName}): other periods on ${day} are [${otherSlots.map(o => `P${o.period}: ${o.subjectName} (${users[o.teacherId]?.name || o.teacherId})`).join(', ')}]`);
    });
  }

  process.exit(0);
}

findConflictSolutions();
