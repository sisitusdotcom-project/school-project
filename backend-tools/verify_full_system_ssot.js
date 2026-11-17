const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function verifyFullSystem() {
  console.log('--- STARTING COMPREHENSIVE SSOT & DRY AUDIT ---');

  const [classesSnap, subjectsSnap, schedulesSnap, usersSnap] = await Promise.all([
    db.ref('classes').once('value'),
    db.ref('subjects').once('value'),
    db.ref('curriculum/schedules').once('value'),
    db.ref('users').once('value')
  ]);

  const classes = classesSnap.val() || {};
  const subjects = subjectsSnap.val() || {};
  const schedules = schedulesSnap.val() || {};
  const users = usersSnap.val() || {};

  console.log(`Classes count: ${Object.keys(classes).length}`);
  console.log(`Subjects count: ${Object.keys(subjects).length}`);
  console.log(`Schedule slots count: ${Object.keys(schedules).length}`);
  console.log(`Users count: ${Object.keys(users).length}`);

  // 1. Check virtual user TIM_UMMI
  if (users['TIM_UMMI']) {
    console.error('FAIL: TIM_UMMI still exists in users node!');
  } else {
    console.log('PASS: No virtual TIM_UMMI user found in users node.');
  }

  // 2. Check schedule conflicts
  const bucket = {};
  Object.values(schedules).forEach(s => {
    if (!s || !s.day || s.type === 'break' || s.type === 'ishoma') return;
    const tIds = (s.teachers && s.teachers.length) ? s.teachers : [s.teacherId, s.coTeacherId].filter(Boolean);
    tIds.forEach(tId => {
      if (!tId || tId === 'TIM_UMMI') return;
      const key = `${s.day}__${s.period || s.startTime}__${tId}`;
      if (!bucket[key]) bucket[key] = [];
      bucket[key].push(s);
    });
  });

  const conflicts = Object.entries(bucket).filter(([_, group]) => {
    if (group.length <= 1) return false;
    return !group.every(s => s.isJoint);
  });

  console.log(`\nSchedule Conflicts Count: ${conflicts.length}`);
  if (conflicts.length === 0) {
    console.log('PASS: ZERO schedule conflicts across the entire school!');
  } else {
    console.error('FAIL: Found conflicts:', conflicts);
  }

  // 3. Check sample teacher teaching subtitles
  const sampleGtkIds = [
    'GTK_MUHAMMAD_KHOHAR',
    'GTK_MUHAMMAD_NIAM_AGUSTIAN',
    'GTK_HARIS_KUSWANDI',
    'GTK_NAILA_ADIBA',
    'GTK_APRILIA_AN_UMILLAH',
    'GTK_ROICHATUL_JANNAH',
    'GTK_DEAYU_ICHA_RISTYA',
    'GTK_KHALIMAH_SA_DIYAH',
    'GTK_AINAINI_RATNA_NOERI',
    'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA',
    'GTK_ROUDHOTUL_MILLAH',
    'GTK_EKA_DESSY_PRATIWI',
    'GTK_MUHAMMAD_MUZAKKI'
  ];

  console.log('\n--- SAMPLE GTK TEACHING LABELS AUDIT ---');
  sampleGtkIds.forEach(tId => {
    const u = users[tId];
    if (!u) return;
    const subjMap = new Map();
    const classList = Object.entries(classes);
    const totalClasses = classList.length;
    classList.forEach(([classId, classroom]) => {
      const subjectTeachers = classroom?.subjectTeachers || {};
      Object.entries(subjects).forEach(([subjectId, subject]) => {
        if (subjectTeachers[subjectId] !== tId) return;
        if (!subjMap.has(subjectId)) {
          subjMap.set(subjectId, { name: subject.name, classes: [] });
        }
        subjMap.get(subjectId).classes.push(classId);
      });
    });

    const labels = [...subjMap.values()].map(item => {
      if (item.classes.length === totalClasses) return `${item.name} (Semua Kelas)`;
      return `${item.name} (${item.classes.length} Rombel)`;
    });

    console.log(`${u.name} (${tId}):`);
    console.log(`   Teaching: ${labels.join(', ') || '(Belum ada mapel rombel)'}`);
  });

  process.exit(0);
}

verifyFullSystem().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
