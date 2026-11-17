const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function run() {
  const rootSnap = await db.ref('/').once('value');
  const root = rootSnap.val() || {};
  console.log('Root keys:', Object.keys(root));
  if (root.assignments) {
    console.log('assignments keys:', Object.keys(root.assignments));
  }
  process.exit(0);
}
run();