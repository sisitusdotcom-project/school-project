const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function checkFridayP2() {
  const [schedulesSnap, usersSnap] = await Promise.all([
    db.ref('curriculum/schedules').once('value'),
    db.ref('users').once('value')
  ]);
  const schedules = schedulesSnap.val() || {};
  const users = usersSnap.val() || {};

  const busyTeachers = new Set();
  Object.values(schedules).forEach(s => {
    if (s.day === 'Jumat' && Number(s.period) === 2) {
      if (s.teacherId) busyTeachers.add(s.teacherId);
      if (s.coTeacherId) busyTeachers.add(s.coTeacherId);
      if (s.teachers) s.teachers.forEach(t => busyTeachers.add(t));
    }
  });

  const gtkUsers = Object.entries(users).filter(([id, u]) => id.startsWith('GTK_'));
  const freeGTK = gtkUsers.filter(([id, u]) => !busyTeachers.has(id));

  console.log('Total GTK:', gtkUsers.length);
  console.log('Busy on Friday P2:', busyTeachers.size);
  console.log('Free on Friday P2:', freeGTK.length);
  console.log('\nFree GTK list:');
  freeGTK.forEach(([id, u]) => console.log('  ' + id + ': ' + u.name + ' (' + (u.role || '') + ')'));

  process.exit(0);
}
checkFridayP2();
