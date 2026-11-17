const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function run() {
  const usersSnap = await db.ref('users').once('value');
  const users = usersSnap.val() || {};
  for (const [id, u] of Object.entries(users)) {
    if (u.name && (u.name.toLowerCase().includes('kohar') || u.name.toLowerCase().includes('niam') || u.name.toLowerCase().includes('furqon'))) {
      console.log(id, u.name, u.role, u.roles);
    }
  }
  process.exit(0);
}
run();