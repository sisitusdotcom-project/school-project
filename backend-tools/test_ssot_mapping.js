const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function testSSOTMapping() {
  const [schedulesSnap, classesSnap, usersSnap] = await Promise.all([
    db.ref('curriculum/schedules').once('value'),
    db.ref('classes').once('value'),
    db.ref('users').once('value')
  ]);
  const schedules = schedulesSnap.val() || {};
  const classes = classesSnap.val() || {};
  const users = usersSnap.val() || {};

  const updatedSlots = [];
  for (const [id, s] of Object.entries(schedules)) {
    let slot = { ...s, id };
    const subName = (s.subjectName || '').toLowerCase();
    const cId = s.classId;

    if (subName.includes('praktik ibadah')) {
      slot.teacherId = 'GTK_MUHAMMAD_KHOHAR';
      slot.teacherName = users['GTK_MUHAMMAD_KHOHAR']?.name;
    } else if (subName.includes('ibadah syari')) {
      slot.teacherId = 'GTK_MUHAMMAD_NIAM_AGUSTIAN';
      slot.teacherName = users['GTK_MUHAMMAD_NIAM_AGUSTIAN']?.name;
    } else if (subName.includes('tapak suci')) {
      slot.teacherId = 'GTK_HARIS_KUSWANDI';
      slot.teacherName = users['GTK_HARIS_KUSWANDI']?.name;
    } else if (subName.includes('wow with english') || subName.includes('english for education')) {
      slot.teacherId = 'GTK_NAILA_ADIBA';
      slot.teacherName = users['GTK_NAILA_ADIBA']?.name;
    } else if (cId.startsWith('CLASS_4_')) {
      if (subName === 'matematika') {
        slot.teacherId = 'GTK_KHALIMAH_SA_DIYAH';
        slot.teacherName = users['GTK_KHALIMAH_SA_DIYAH']?.name;
      } else if (subName === 'bahasa indonesia') {
        slot.teacherId = 'GTK_DEAYU_ICHA_RISTYA';
        slot.teacherName = users['GTK_DEAYU_ICHA_RISTYA']?.name;
      } else if (subName === 'ipas') {
        slot.teacherId = 'GTK_ROICHATUL_JANNAH';
        slot.teacherName = users['GTK_ROICHATUL_JANNAH']?.name;
      } else if (subName === 'ppkn' || subName === 'pkn') {
        const tId = cId === 'CLASS_4_HAFSHAH_BINTI_UMAR' ? 'GTK_KHALIMAH_SA_DIYAH' : 'GTK_DEAYU_ICHA_RISTYA';
        slot.teacherId = tId;
        slot.teacherName = users[tId]?.name;
      } else if (subName === 'seni budaya') {
        const tId = cId === 'CLASS_4_HAFSHAH_BINTI_UMAR' ? 'GTK_KHALIMAH_SA_DIYAH' : 'GTK_DEAYU_ICHA_RISTYA';
        slot.teacherId = tId;
        slot.teacherName = users[tId]?.name;
      } else if (subName.includes('aqidah')) {
        slot.teacherId = 'GTK_FURQON';
        slot.teacherName = users['GTK_FURQON']?.name;
      }
    } else if (cId.startsWith('CLASS_5_')) {
      if (subName === 'matematika') {
        slot.teacherId = 'GTK_AINAINI_RATNA_NOERI';
        slot.teacherName = users['GTK_AINAINI_RATNA_NOERI']?.name;
      } else if (subName === 'bahasa indonesia') {
        slot.teacherId = 'GTK_ROICHATUL_JANNAH';
        slot.teacherName = users['GTK_ROICHATUL_JANNAH']?.name;
      } else if (subName === 'ipas') {
        slot.teacherId = 'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA';
        slot.teacherName = users['GTK_ANGGA_DWI_KURNIAWAN_KUSUMA']?.name;
      } else if (subName === 'ppkn' || subName === 'pkn') {
        slot.teacherId = 'GTK_AINAINI_RATNA_NOERI';
        slot.teacherName = users['GTK_AINAINI_RATNA_NOERI']?.name;
      } else if (subName === 'seni budaya') {
        slot.teacherId = 'GTK_NURUL_LAILY_MUFIDA';
        slot.teacherName = users['GTK_NURUL_LAILY_MUFIDA']?.name;
      } else if (subName.includes('aqidah')) {
        slot.teacherId = 'GTK_FURQON';
        slot.teacherName = users['GTK_FURQON']?.name;
      }
    } else if (cId.startsWith('CLASS_6_')) {
      if (subName === 'matematika') {
        slot.teacherId = 'GTK_ROUDHOTUL_MILLAH';
        slot.teacherName = users['GTK_ROUDHOTUL_MILLAH']?.name;
      } else if (subName === 'bahasa indonesia') {
        slot.teacherId = 'GTK_EKA_DESSY_PRATIWI';
        slot.teacherName = users['GTK_EKA_DESSY_PRATIWI']?.name;
      } else if (subName === 'ppkn' || subName === 'pkn') {
        slot.teacherId = 'GTK_MUHAMMAD_MUZAKKI';
        slot.teacherName = users['GTK_MUHAMMAD_MUZAKKI']?.name;
      } else if (subName === 'seni budaya') {
        slot.teacherId = 'GTK_EKA_DESSY_PRATIWI';
        slot.teacherName = users['GTK_EKA_DESSY_PRATIWI']?.name;
      }
    } else if (cId === 'CLASS_3_BILAL_BIN_RABBAH' && subName.includes('aqidah')) {
      slot.teacherId = 'GTK_MASLUKHATUL_FAUJIYAH';
      slot.teacherName = users['GTK_MASLUKHATUL_FAUJIYAH']?.name;
    }

    updatedSlots.push(slot);
  }

  const bucket = {};
  updatedSlots.forEach(s => {
    if (!s || !s.day || s.type === 'break' || s.type === 'ishoma') return;
    const tIds = (s.teachers && s.teachers.length) ? s.teachers : [s.teacherId, s.coTeacherId].filter(Boolean);
    tIds.forEach(tId => {
      if (!tId || tId === 'TIM_UMMI') return;
      const key = `${s.day}__${s.period || s.startTime}__${tId}`;
      if (!bucket[key]) bucket[key] = [];
      bucket[key].push(s);
    });
  });

  const conflicts = Object.entries(bucket).filter(([_, g]) => g.length > 1);
  console.log(`Remaining conflicts after applying canonical SSOT assignments: ${conflicts.length}`);
  conflicts.forEach(([key, group], idx) => {
    const [day, period, tId] = key.split('__');
    console.log(`\nConflict #${idx + 1}: ${day} Period ${period} - Guru: ${users[tId]?.name || tId} (${tId})`);
    group.forEach(s => {
      console.log(`   - Slot [${s.id}]: Class="${classes[s.classId]?.name}", Subject="${s.subjectName}", Time="${s.startTime}-${s.endTime}"`);
    });
  });
  process.exit(0);
}
testSSOTMapping();
