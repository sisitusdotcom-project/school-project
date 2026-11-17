const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function inspectClassDays() {
  const schedSnap = await db.ref('curriculum/schedules').once('value');
  const schedules = Object.entries(schedSnap.val() || {}).map(([id, s]) => ({ id, ...s }));

  function printDay(classId, day) {
    const list = schedules.filter(s => s.classId === classId && s.day === day)
      .sort((a, b) => (Number(a.period) || 0) - (Number(b.period) || 0));
    console.log(`\n=== ${classId} on ${day} ===`);
    list.forEach(s => {
      console.log(`  P${s.period} (${s.startTime}-${s.endTime}): ${s.subjectName} | ${s.teacherName} (${s.teacherId})`);
    });
  }

  // Conflict 1: Senin P3 - GTK_MUHAMMAD_NIAM_AGUSTIAN
  printDay('CLASS_1_ABU_BAKAR_ASH_SHIDDIQ', 'Senin');
  printDay('CLASS_3_ALI_BIN_ABI_THALIB', 'Senin');

  process.exit(0);
}
inspectClassDays();
