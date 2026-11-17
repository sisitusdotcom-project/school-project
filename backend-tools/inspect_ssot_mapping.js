const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function run() {
  const [classesSnap, subjectsSnap, usersSnap] = await Promise.all([
    db.ref('classes').once('value'),
    db.ref('subjects').once('value'),
    db.ref('users').once('value')
  ]);
  const classes = classesSnap.val() || {};
  const subjects = subjectsSnap.val() || {};
  const users = usersSnap.val() || {};

  console.log('--- ALL SUBJECTS ---');
  for (const [id, s] of Object.entries(subjects)) {
    console.log(id, s.name, s.code, s.defaultTeacherId);
  }

  console.log('\n--- CLASS SUBJECT TEACHERS ---');
  for (const [cId, c] of Object.entries(classes)) {
    console.log('\nClass:', c.name, '(' + cId + ')');
    const st = c.subjectTeachers || {};
    for (const [sId, teacher] of Object.entries(st)) {
      const tId = typeof teacher === 'string' ? teacher : teacher.teacherId;
      const tName = users[tId]?.name || tId;
      const sName = subjects[sId]?.name || sId;
      console.log('  ' + sId + ' (' + sName + ') -> ' + tName + ' (' + tId + ')');
    }
  }
  process.exit(0);
}
run();