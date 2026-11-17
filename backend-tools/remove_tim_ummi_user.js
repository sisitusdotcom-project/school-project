const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function removeVirtualUser() {
  await db.ref('users/TIM_UMMI').remove();
  console.log('Removed users/TIM_UMMI successfully.');
  process.exit(0);
}
removeVirtualUser();
