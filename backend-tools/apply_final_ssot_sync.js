const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function applyFinalSSOTSync() {
  console.log('Starting Final SSOT & DRY Synchronization...');

  const [subjectsSnap, classesSnap, schedulesSnap, usersSnap] = await Promise.all([
    db.ref('subjects').once('value'),
    db.ref('classes').once('value'),
    db.ref('curriculum/schedules').once('value'),
    db.ref('users').once('value')
  ]);

  const subjects = subjectsSnap.val() || {};
  const classes = classesSnap.val() || {};
  const schedules = schedulesSnap.val() || {};
  const users = usersSnap.val() || {};

  const updates = {};

  // 1. Ensure dedicated subjects exist
  const newSubjects = {
    SUB_PRAKTIK_IBADAH: {
      id: 'SUB_PRAKTIK_IBADAH',
      name: 'Praktik Ibadah',
      category: 'agama',
      code: 'PI',
      order: 19,
      active: true
    },
    SUB_TAPAK_SUCI: {
      id: 'SUB_TAPAK_SUCI',
      name: 'Tapak Suci',
      category: 'muatan_lokal',
      code: 'TS',
      order: 20,
      active: true
    },
    SUB_HW: {
      id: 'SUB_HW',
      name: 'Hizbul Wathan',
      category: 'muatan_lokal',
      code: 'HW',
      order: 21,
      active: true
    },
    SUB_ENGLISH_EDUCATION: {
      id: 'SUB_ENGLISH_EDUCATION',
      name: 'Wow With English',
      category: 'muatan_lokal',
      code: 'WWE',
      order: 22,
      active: true
    }
  };

  for (const [sId, sData] of Object.entries(newSubjects)) {
    if (!subjects[sId]) {
      updates[`subjects/${sId}`] = sData;
      subjects[sId] = sData;
    }
  }

  // 2. Canonical mapping for classes subjectTeachers
  for (const [cId, cls] of Object.entries(classes)) {
    const st = { ...(cls.subjectTeachers || {}) };

    // Common across all classes
    st['SUB_PRAKTIK_IBADAH'] = 'GTK_MUHAMMAD_KHOHAR';
    st['SUB_FIQIH'] = 'GTK_MUHAMMAD_NIAM_AGUSTIAN';
    st['SUB_TAPAK_SUCI'] = 'GTK_HARIS_KUSWANDI';
    st['SUB_ENGLISH_EDUCATION'] = 'GTK_NAILA_ADIBA';

    // Grade 4
    if (cId.startsWith('CLASS_4_')) {
      st['SUB_MTK'] = 'GTK_KHALIMAH_SA_DIYAH';
      st['SUB_B_INDO'] = 'GTK_DEAYU_ICHA_RISTYA';
      st['SUB_IPAS'] = 'GTK_ROICHATUL_JANNAH';
      st['SUB_SAINS'] = 'GTK_ROICHATUL_JANNAH';
      st['SUB_AQIDAH_AKHLAQ'] = 'GTK_FURQON';
      st['SUB_B_ARAB'] = 'GTK_FURQON';
      st['SUB_B_INGGRIS'] = 'GTK_APRILIA_AN_UMILLAH';
      if (cId === 'CLASS_4_HAFSHAH_BINTI_UMAR') {
        st['SUB_PKN'] = 'GTK_KHALIMAH_SA_DIYAH';
        st['SUB_SBK'] = 'GTK_KHALIMAH_SA_DIYAH';
        st['SUB_HW'] = 'GTK_KHALIMAH_SA_DIYAH';
      } else {
        st['SUB_PKN'] = 'GTK_DEAYU_ICHA_RISTYA';
        st['SUB_SBK'] = 'GTK_DEAYU_ICHA_RISTYA';
        st['SUB_HW'] = 'GTK_DEAYU_ICHA_RISTYA';
      }
    }

    // Grade 5
    if (cId.startsWith('CLASS_5_')) {
      st['SUB_MTK'] = 'GTK_AINAINI_RATNA_NOERI';
      st['SUB_B_INDO'] = 'GTK_ROICHATUL_JANNAH';
      st['SUB_IPAS'] = 'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA';
      st['SUB_SAINS'] = 'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA';
      st['SUB_PKN'] = 'GTK_AINAINI_RATNA_NOERI';
      st['SUB_SBK'] = 'GTK_NURUL_LAILY_MUFIDA';
      st['SUB_AQIDAH_AKHLAQ'] = 'GTK_FURQON';
      st['SUB_B_ARAB'] = 'GTK_FURQON';
      st['SUB_B_INGGRIS'] = 'GTK_APRILIA_AN_UMILLAH';
      st['SUB_KEMUHAMMADIYAHAN'] = 'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA';
      st['SUB_HW'] = cId === 'CLASS_5_ZAID_BIN_TSABIT' ? 'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA' : 'GTK_AINAINI_RATNA_NOERI';
    }

    // Grade 6
    if (cId.startsWith('CLASS_6_')) {
      st['SUB_MTK'] = 'GTK_ROUDHOTUL_MILLAH';
      st['SUB_B_INDO'] = 'GTK_EKA_DESSY_PRATIWI';
      st['SUB_PKN'] = 'GTK_MUHAMMAD_MUZAKKI';
      st['SUB_SBK'] = 'GTK_EKA_DESSY_PRATIWI';
      st['SUB_AQIDAH_AKHLAQ'] = 'GTK_APRILIA_AN_UMILLAH';
      st['SUB_B_ARAB'] = 'GTK_FURQON';
      st['SUB_B_INGGRIS'] = 'GTK_APRILIA_AN_UMILLAH';
      st['SUB_KEMUHAMMADIYAHAN'] = 'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA';
      if (cId === 'CLASS_6_MU_ADZ_BIN_JABAL') {
        st['SUB_IPAS'] = 'GTK_ROUDHOTUL_MILLAH';
        st['SUB_SAINS'] = 'GTK_ROUDHOTUL_MILLAH';
      } else {
        st['SUB_IPAS'] = 'GTK_EKA_DESSY_PRATIWI';
        st['SUB_SAINS'] = 'GTK_EKA_DESSY_PRATIWI';
      }
    }

    // Grade 3
    if (cId.startsWith('CLASS_3_')) {
      st['SUB_B_ARAB'] = 'GTK_FURQON';
      st['SUB_ALQURAN_HADITS'] = 'GTK_AHMAD_TSALIS_NOVARIYANTO';
      if (cId === 'CLASS_3_BILAL_BIN_RABBAH') {
        st['SUB_AQIDAH_AKHLAQ'] = 'GTK_MASLUKHATUL_FAUJIYAH';
      } else {
        st['SUB_AQIDAH_AKHLAQ'] = 'GTK_MUHAMMAD_NIAM_AGUSTIAN';
      }
      if (cId === 'CLASS_3_ZAINAB_BINTI_JAHSYI') {
        st['SUB_PKN'] = 'GTK_EKA_DESSY_PRATIWI';
      }
    }

    updates[`classes/${cId}/subjectTeachers`] = st;
  }

  // 3. Update all schedule slots
  const updatedSchedules = {};
  for (const [id, s] of Object.entries(schedules)) {
    let slot = { ...s };
    const subName = (s.subjectName || '').toLowerCase();
    const cId = s.classId;

    if (subName.includes('praktik ibadah')) {
      slot.subjectId = 'SUB_PRAKTIK_IBADAH';
      slot.subjectName = 'Praktik Ibadah';
      slot.teacherId = 'GTK_MUHAMMAD_KHOHAR';
      slot.teacherName = users['GTK_MUHAMMAD_KHOHAR']?.name || 'Muhammad Khohar, M.Pd.';
    } else if (subName.includes('ibadah syari')) {
      slot.subjectId = 'SUB_FIQIH';
      slot.subjectName = "Ibadah Syari'ah";
      slot.teacherId = 'GTK_MUHAMMAD_NIAM_AGUSTIAN';
      slot.teacherName = users['GTK_MUHAMMAD_NIAM_AGUSTIAN']?.name || 'Muhammad Niam Agustian, M.Pd.';
    } else if (subName.includes('tapak suci')) {
      slot.subjectId = 'SUB_TAPAK_SUCI';
      slot.subjectName = 'Tapak Suci';
      slot.teacherId = 'GTK_HARIS_KUSWANDI';
      slot.teacherName = users['GTK_HARIS_KUSWANDI']?.name || 'Haris Kuswandi';
      if ((slot.day === 'Selasa' && Number(slot.period) === 2) || (slot.day === 'Senin' && Number(slot.period) === 5)) {
        slot.isJoint = true;
        slot.jointNote = 'Sesi Gabungan Paralel di Lapangan';
      }
    } else if (subName.includes('wow with english') || subName.includes('english for education')) {
      slot.subjectId = 'SUB_ENGLISH_EDUCATION';
      slot.subjectName = 'Wow With English';
      slot.teacherId = 'GTK_NAILA_ADIBA';
      slot.teacherName = users['GTK_NAILA_ADIBA']?.name || 'Naila Adiba, S.Pd.';
    } else if (cId.startsWith('CLASS_4_')) {
      if (subName === 'matematika') {
        slot.subjectId = 'SUB_MTK';
        slot.teacherId = 'GTK_KHALIMAH_SA_DIYAH';
        slot.teacherName = users['GTK_KHALIMAH_SA_DIYAH']?.name || "Khalimah Sa'diyah, S.Pd., Gr.";
      } else if (subName === 'bahasa indonesia') {
        slot.subjectId = 'SUB_B_INDO';
        slot.teacherId = 'GTK_DEAYU_ICHA_RISTYA';
        slot.teacherName = users['GTK_DEAYU_ICHA_RISTYA']?.name || 'Deayu Icha Ristya, S.Pd., Gr.';
      } else if (subName === 'ipas') {
        slot.subjectId = 'SUB_IPAS';
        slot.teacherId = 'GTK_ROICHATUL_JANNAH';
        slot.teacherName = users['GTK_ROICHATUL_JANNAH']?.name || 'Roichatul Jannah, S.Pd., Gr.';
      } else if (subName === 'ppkn' || subName === 'pkn') {
        slot.subjectId = 'SUB_PKN';
        const tId = cId === 'CLASS_4_HAFSHAH_BINTI_UMAR' ? 'GTK_KHALIMAH_SA_DIYAH' : 'GTK_DEAYU_ICHA_RISTYA';
        slot.teacherId = tId;
        slot.teacherName = users[tId]?.name;
      } else if (subName === 'seni budaya') {
        slot.subjectId = 'SUB_SBK';
        const tId = cId === 'CLASS_4_HAFSHAH_BINTI_UMAR' ? 'GTK_KHALIMAH_SA_DIYAH' : 'GTK_DEAYU_ICHA_RISTYA';
        slot.teacherId = tId;
        slot.teacherName = users[tId]?.name;
      } else if (subName.includes('aqidah')) {
        slot.subjectId = 'SUB_AQIDAH_AKHLAQ';
        slot.teacherId = 'GTK_FURQON';
        slot.teacherName = users['GTK_FURQON']?.name || 'Furqon, SH.';
      } else if (subName.includes('hizbul') || subName === 'hw') {
        slot.subjectId = 'SUB_HW';
        slot.subjectName = 'Hizbul Wathan';
        slot.teacherId = 'GTK_DEAYU_ICHA_RISTYA';
        slot.teacherName = users['GTK_DEAYU_ICHA_RISTYA']?.name || 'Deayu Icha Ristya, S.Pd., Gr.';
        slot.isJoint = true;
        slot.jointNote = 'Sesi Gabungan HW Kelas 4';
      } else if (subName.includes('inggris')) {
        slot.subjectId = 'SUB_B_INGGRIS';
        slot.teacherId = 'GTK_APRILIA_AN_UMILLAH';
        slot.teacherName = users['GTK_APRILIA_AN_UMILLAH']?.name || "Aprilia An'umillah, S.Pd.";
      }
    } else if (cId.startsWith('CLASS_5_')) {
      if (subName === 'matematika') {
        slot.subjectId = 'SUB_MTK';
        slot.teacherId = 'GTK_AINAINI_RATNA_NOERI';
        slot.teacherName = users['GTK_AINAINI_RATNA_NOERI']?.name || 'Ainaini Ratna Noeri, M.Pd.';
      } else if (subName === 'bahasa indonesia') {
        slot.subjectId = 'SUB_B_INDO';
        slot.teacherId = 'GTK_ROICHATUL_JANNAH';
        slot.teacherName = users['GTK_ROICHATUL_JANNAH']?.name || 'Roichatul Jannah, S.Pd., Gr.';
      } else if (subName === 'ipas') {
        slot.subjectId = 'SUB_IPAS';
        slot.teacherId = 'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA';
        slot.teacherName = users['GTK_ANGGA_DWI_KURNIAWAN_KUSUMA']?.name || 'Angga Dwi Kurniawan Kusuma, M.Pd., Gr.';
      } else if (subName === 'ppkn' || subName === 'pkn') {
        slot.subjectId = 'SUB_PKN';
        slot.teacherId = 'GTK_AINAINI_RATNA_NOERI';
        slot.teacherName = users['GTK_AINAINI_RATNA_NOERI']?.name || 'Ainaini Ratna Noeri, M.Pd.';
      } else if (subName === 'seni budaya') {
        slot.subjectId = 'SUB_SBK';
        slot.teacherId = 'GTK_NURUL_LAILY_MUFIDA';
        slot.teacherName = users['GTK_NURUL_LAILY_MUFIDA']?.name || 'Nurul Laily Mufida, S.Pd.';
      } else if (subName.includes('aqidah')) {
        slot.subjectId = 'SUB_AQIDAH_AKHLAQ';
        slot.teacherId = 'GTK_FURQON';
        slot.teacherName = users['GTK_FURQON']?.name || 'Furqon, SH.';
      } else if (subName.includes('inggris')) {
        slot.subjectId = 'SUB_B_INGGRIS';
        slot.teacherId = 'GTK_APRILIA_AN_UMILLAH';
        slot.teacherName = users['GTK_APRILIA_AN_UMILLAH']?.name || "Aprilia An'umillah, S.Pd.";
      }
    } else if (cId.startsWith('CLASS_6_')) {
      if (subName === 'matematika') {
        slot.subjectId = 'SUB_MTK';
        slot.teacherId = 'GTK_ROUDHOTUL_MILLAH';
        slot.teacherName = users['GTK_ROUDHOTUL_MILLAH']?.name || 'Roudhotul Millah, S.Pd., Gr.';
      } else if (subName === 'bahasa indonesia') {
        slot.subjectId = 'SUB_B_INDO';
        slot.teacherId = 'GTK_EKA_DESSY_PRATIWI';
        slot.teacherName = users['GTK_EKA_DESSY_PRATIWI']?.name || 'Eka Dessy Pratiwi, S.Pd., Gr.';
      } else if (subName === 'ppkn' || subName === 'pkn') {
        slot.subjectId = 'SUB_PKN';
        slot.teacherId = 'GTK_MUHAMMAD_MUZAKKI';
        slot.teacherName = users['GTK_MUHAMMAD_MUZAKKI']?.name || 'Muhammad Muzakki, S.Pd.';
      } else if (subName === 'seni budaya') {
        slot.subjectId = 'SUB_SBK';
        slot.teacherId = 'GTK_EKA_DESSY_PRATIWI';
        slot.teacherName = users['GTK_EKA_DESSY_PRATIWI']?.name || 'Eka Dessy Pratiwi, S.Pd., Gr.';
      } else if (subName.includes('inggris')) {
        slot.subjectId = 'SUB_B_INGGRIS';
        slot.teacherId = 'GTK_APRILIA_AN_UMILLAH';
        slot.teacherName = users['GTK_APRILIA_AN_UMILLAH']?.name || "Aprilia An'umillah, S.Pd.";
      }
    } else if (cId === 'CLASS_3_BILAL_BIN_RABBAH' && subName.includes('aqidah')) {
      slot.subjectId = 'SUB_AQIDAH_AKHLAQ';
      slot.teacherId = 'GTK_MASLUKHATUL_FAUJIYAH';
      slot.teacherName = users['GTK_MASLUKHATUL_FAUJIYAH']?.name || 'Maslukhatul Faujiyah, S.Pd.';
    }

    updatedSchedules[id] = slot;
    updates[`curriculum/schedules/${id}`] = slot;
  }

  // Also update master_template
  updates['curriculum/master_template'] = updatedSchedules;

  console.log(`Prepared ${Object.keys(updates).length} update entries. Executing atomic multi-path update...`);
  await db.ref().update(updates);
  console.log('Firebase RTDB multi-path update completed successfully!');

  // Validate zero conflicts
  const bucket = {};
  Object.values(updatedSchedules).forEach(s => {
    if (!s || !s.day || s.type === 'break' || s.type === 'ishoma') return;
    const tIds = (s.teachers && s.teachers.length) ? s.teachers : [s.teacherId, s.coTeacherId].filter(Boolean);
    tIds.forEach(tId => {
      if (!tId || tId === 'TIM_UMMI') return;
      const key = `${s.day}__${s.period || s.startTime}__${tId}`;
      if (!bucket[key]) bucket[key] = [];
      bucket[key].push(s);
    });
  });

  const conflicts = Object.entries(bucket).filter(([_, g]) => {
    if (g.length <= 1) return false;
    return !g.every(s => s.isJoint);
  });

  console.log(`\n=== VALIDATION AUDIT ===`);
  console.log(`Total conflict groups: ${conflicts.length}`);
  if (conflicts.length === 0) {
    console.log('CONGRATULATIONS: 0 Schedule Conflicts! 100% SSOT & DRY compliant.');
  } else {
    console.error('Found remaining conflicts:', conflicts);
  }
  process.exit(0);
}

applyFinalSSOTSync().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
