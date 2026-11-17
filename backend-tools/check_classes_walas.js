const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function run() {
  const classesSnap = await db.ref('classes').once('value');
  const classes = classesSnap.val() || {};
  for (const [id, c] of Object.entries(classes)) {
    console.log(id, '--> Name:', c.name, '| WalasId:', c.teacherId, '| WalasName:', c.teacherName);
  }
  process.exit(0);
}
run();