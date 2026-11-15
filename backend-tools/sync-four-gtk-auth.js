const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');

const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const auth = getAuth(app);
const db = getDatabase(app);

const TARGETS = [
  {
    uid: 'GTK_FITRIANING_DANIYAH_FIJRIANI',
    correctName: 'Fitraning Daniyah Fijriani',
    correctEmail: 'gtkfitraningdaniyahfijriani@musada.sch.id'
  },
  {
    uid: 'GTK_ISMATUL_KHUSNAH',
    correctName: 'Ismaul Kusnah, S.Hum.',
    correctEmail: 'gtkismaulkusnah@musada.sch.id'
  },
  {
    uid: 'GTK_LAYYINANTUS_SANIYYAH',
    correctName: 'Layyinatus Saniyyah',
    correctEmail: 'gtklayyinatussaniyyah@musada.sch.id'
  },
  {
    uid: 'GTK_VINDY_APRILLIA',
    correctName: 'Vindy Aprilia, S.Pd.',
    correctEmail: 'gtkvindyaprilia@musada.sch.id'
  }
];

async function syncAll() {
  console.log("=== MEMULAI SINKRONISASI 4 GTK ===");
  for (const t of TARGETS) {
    console.log(`\nMemproses UID: ${t.uid}...`);
    try {
      // 1. Update Firebase Authentication
      const updatedUser = await auth.updateUser(t.uid, {
        displayName: t.correctName,
        email: t.correctEmail,
        password: 'Password123!'
      });
      console.log(`  [AUTH SUCCESS] DisplayName: "${updatedUser.displayName}", Email: "${updatedUser.email}"`);

      // 2. Update Realtime Database node users/${uid}
      await db.ref(`users/${t.uid}`).update({
        name: t.correctName,
        email: t.correctEmail
      });
      console.log(`  [RTDB SUCCESS] users/${t.uid} updated`);
    } catch (err) {
      console.error(`  [ERROR] Gagal memproses ${t.uid}:`, err.message);
    }
  }

  // 3. Update personnel/directory if exists
  console.log("\nMemeriksa personnel/directory di RTDB...");
  const dirSnap = await db.ref('personnel/directory').once('value');
  const dirVal = dirSnap.val() || {};
  for (const [key, item] of Object.entries(dirVal)) {
    const itemUserId = item.userId;
    const itemName = item.name || '';
    for (const t of TARGETS) {
      if (itemUserId === t.uid || itemName.toLowerCase().includes(t.uid.toLowerCase().replace('gtk_', '').replace(/_/g, ' '))) {
        await db.ref(`personnel/directory/${key}`).update({
          name: t.correctName,
          email: t.correctEmail
        });
        console.log(`  [DIRECTORY SUCCESS] Updated directory/${key} for ${t.correctName}`);
      }
    }
  }

  console.log("\n=== SINKRONISASI SELESAI ===");
}

syncAll().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
