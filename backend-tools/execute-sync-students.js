const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);
const tsvPath = path.join(__dirname, 'data', 'data-siswa.tsv');
let tsvContent = fs.readFileSync(tsvPath, 'utf8');
const lines = tsvContent.split('\n');
const verifiedNisns = {
  '0843': '0156654497', // Arshaka virendra dairy
  '0967': '3199842198', // Muhammad zafran arrasyad
  '0699': '3168793093', // Daffa dzaky alfarizi
  '0906': '3194314839', // Aleesya shirin Abdillah
  '0952': '0156063475', // Rania azzahra kusumawardhani
  '0992': '3193762629'  // Putri diva ramadhani
};
const updatedTsvLines = lines.map(line => {
  const parts = line.split('\t');
  if (parts.length >= 3 && verifiedNisns[parts[1]]) {
    parts[2] = verifiedNisns[parts[1]];
    return parts.join('\t');
  }
  return line;
});
fs.writeFileSync(tsvPath, updatedTsvLines.join('\n'), 'utf8');
console.log('✅ TSV master data-siswa.tsv updated with verified NISNs');
async function syncStudents() {
  console.log('Fetching live database snapshot...');
  const rootSnap = await db.ref().once('value');
  const rootData = rootSnap.val() || {};
  const updates = {};
  const studentSpecs = [
    {
      nis: '0695',
      name: 'Arshaka Rasyeed Sugiarto',
      nisn: '3160913779',
      uid: 'SISWA_3160913779',
      gender: 'L',
      classId: 'CLASS_4_KHALID_BIN_WALID',
      ummiClassId: 'UMMI_K4_RAHMAH',
      ummiLevel: 'Jilid 5',
      oldUidsToRemove: []
    },
    {
      nis: '0843',
      name: 'Arshaka Virendra Daery F.R.',
      nisn: '0156654497',
      uid: 'SISWA_0156654497',
      gender: 'L',
      classId: 'CLASS_5_ZAID_BIN_TSABIT',
      ummiClassId: 'UMMI_K5_ZIHA',
      ummiLevel: 'Jilid 3',
      oldUidsToRemove: ['SISWA_0843']
    },
    {
      nis: '0967',
      name: 'Muhammad Zafran Arrasyad',
      nisn: '3199842198',
      uid: 'SISWA_3199842198',
      gender: 'L',
      classId: 'CLASS_1_UMAR_BIN_KHATTAB',
      ummiClassId: 'UMMI_K1_LAYYIN',
      ummiLevel: 'Jilid 1',
      oldUidsToRemove: []
    },
    {
      nis: '0809',
      name: 'Muhammad Zafran Janitra',
      nisn: '3173650927',
      uid: 'SISWA_3173650927',
      gender: 'L',
      classId: 'CLASS_3_ALI_BIN_ABI_THALIB',
      ummiClassId: 'UMMI_K3_NANIK',
      ummiLevel: 'Jilid 6',
      oldUidsToRemove: ['SISWA_0809']
    },
    {
      nis: '0699',
      name: 'Daffa Dzaky Alfarizi',
      nisn: '3168793093',
      uid: 'SISWA_3168793093',
      gender: 'L',
      classId: 'CLASS_4_KHALID_BIN_WALID',
      ummiClassId: 'UMMI_K4_AIDAH',
      ummiLevel: 'Jilid 2',
      oldUidsToRemove: []
    },
    {
      nis: '0704',
      name: 'Fatih Zafir Al Karim',
      nisn: '3174012701',
      uid: 'SISWA_3174012701',
      gender: 'L',
      classId: 'CLASS_4_KHALID_BIN_WALID',
      ummiClassId: 'UMMI_K4_AISYAH',
      ummiLevel: "Al Qur'an",
      oldUidsToRemove: ['SISWA_0704']
    },
    {
      nis: '0860',
      name: 'Alesha Hanan Salsabila',
      nisn: '3186389891',
      uid: 'SISWA_3186389891',
      gender: 'P',
      classId: 'CLASS_2_UTSMAN_BIN_AFFAN',
      ummiClassId: 'UMMI_K2_ABIDA',
      ummiLevel: 'Jilid 4',
      oldUidsToRemove: []
    },
    {
      nis: '0906',
      name: 'Aleesya Shirin Abdillah',
      nisn: '3194314839',
      uid: 'SISWA_3194314839',
      gender: 'P',
      classId: 'CLASS_2_KHADIJAH_BINTI_KHUWAILID',
      ummiClassId: 'UMMI_K2_FITRA',
      ummiLevel: 'Jilid 3',
      oldUidsToRemove: ['SISWA_0906']
    },
    {
      nis: '0952',
      name: 'Rania Azzahra Kusumawardhani',
      nisn: '0156063475',
      uid: 'SISWA_0156063475',
      gender: 'P',
      classId: 'CLASS_1_ABU_BAKAR_ASH_SHIDDIQ',
      ummiClassId: 'UMMI_K1_DEWI',
      ummiLevel: 'Jilid 1',
      oldUidsToRemove: []
    },
    {
      nis: '0993',
      name: 'Qalesya Nashwa Aulia',
      nisn: '3194760461',
      uid: 'SISWA_3194760461',
      gender: 'P',
      classId: 'CLASS_1_AISYAH_BINTI_ABU_BAKAR',
      ummiClassId: 'UMMI_K1_ZIHA',
      ummiLevel: 'Jilid 1',
      oldUidsToRemove: ['SISWA_0993']
    },
    {
      nis: '0947',
      name: 'Meccayla Annalyn Aisyafara',
      nisn: '3200922888',
      uid: 'SISWA_3200922888',
      gender: 'P',
      classId: 'CLASS_1_ABU_BAKAR_ASH_SHIDDIQ',
      ummiClassId: 'UMMI_K1_DEWI',
      ummiLevel: 'Jilid 1',
      oldUidsToRemove: []
    },
    {
      nis: '0992',
      name: 'Putri Diva Ramadhani',
      nisn: '3193762629',
      uid: 'SISWA_3193762629',
      gender: 'P',
      classId: 'CLASS_1_AISYAH_BINTI_ABU_BAKAR',
      ummiClassId: 'UMMI_K1_NANIK',
      ummiLevel: 'Jilid 1',
      oldUidsToRemove: ['SISWA_0992']
    }
  ];
  const classesToClean = [
    { classId: 'CLASS_5_ZAID_BIN_TSABIT', wrongUids: ['SISWA_3160913779', 'SISWA_0843'] },
    { classId: 'CLASS_3_ALI_BIN_ABI_THALIB', wrongUids: ['SISWA_0809'] },
    { classId: 'CLASS_4_KHALID_BIN_WALID', wrongUids: ['SISWA_0704'] },
    { classId: 'CLASS_2_KHADIJAH_BINTI_KHUWAILID', wrongUids: ['SISWA_3186389891', 'SISWA_0906'] },
    { classId: 'CLASS_1_AISYAH_BINTI_ABU_BAKAR', wrongUids: ['SISWA_3194760461', 'SISWA_3200922888', 'SISWA_0992', 'SISWA_0993'] },
    { classId: 'CLASS_1_ABU_BAKAR_ASH_SHIDDIQ', wrongUids: ['SISWA_0993'] }
  ];
  for (const c of classesToClean) {
    for (const wUid of c.wrongUids) {
      updates[`classes/${c.classId}/students/${wUid}`] = null;
    }
  }
  const ummiToClean = [
    { ummiClassId: 'UMMI_K5_ZIHA', wrongUids: ['SISWA_0843'] },
    { ummiClassId: 'UMMI_K1_LAYYIN', wrongUids: ['SISWA_3173650927'] },
    { ummiClassId: 'UMMI_K3_NANIK', wrongUids: ['SISWA_0809'] },
    { ummiClassId: 'UMMI_K4_AIDAH', wrongUids: ['SISWA_3174012701'] },
    { ummiClassId: 'UMMI_K4_AISYAH', wrongUids: ['SISWA_0704'] },
    { ummiClassId: 'UMMI_K2_FITRA', wrongUids: ['SISWA_0906'] },
    { ummiClassId: 'UMMI_K1_DEWI', wrongUids: ['SISWA_3194760461'] },
    { ummiClassId: 'UMMI_K1_ZIHA', wrongUids: ['SISWA_0993'] },
    { ummiClassId: 'UMMI_K1_NANIK', wrongUids: ['SISWA_0992'] }
  ];
  for (const u of ummiToClean) {
    for (const wUid of u.wrongUids) {
      updates[`ummi_classes/${u.ummiClassId}/students/${wUid}`] = null;
    }
  }
  for (const spec of studentSpecs) {
    updates[`students/${spec.uid}`] = {
      name: spec.name,
      nis: spec.nis,
      nisn: spec.nisn,
      classId: spec.classId,
      parentId: spec.uid,
      gender: spec.gender,
      isActive: true,
      ummiClassId: spec.ummiClassId,
      ummiLevel: spec.ummiLevel
    };
    updates[`users/${spec.uid}`] = {
      name: spec.name,
      role: 'ortu',
      isActive: true,
      createdAt: 1791926272025
    };
    updates[`classes/${spec.classId}/students/${spec.uid}`] = true;
    updates[`ummi_classes/${spec.ummiClassId}/students/${spec.uid}`] = true;
    if (rootData.library && rootData.library.members && rootData.library.members[spec.nis]) {
      updates[`library/members/${spec.nis}/studentId`] = spec.uid;
    }
    for (const oldUid of spec.oldUidsToRemove) {
      updates[`students/${oldUid}`] = null;
      updates[`users/${oldUid}`] = null;
    }
  }
  if (rootData.student_attendance_daily && rootData.student_attendance_daily['2026-10-15']) {
    const att5 = rootData.student_attendance_daily['2026-10-15']['CLASS_5_ZAID_BIN_TSABIT'];
    if (att5 && att5['SISWA_3160913779']) {
      updates[`student_attendance_daily/2026-10-15/CLASS_5_ZAID_BIN_TSABIT/SISWA_0156654497`] = att5['SISWA_3160913779'];
      updates[`student_attendance_daily/2026-10-15/CLASS_5_ZAID_BIN_TSABIT/SISWA_3160913779`] = null;
    }
  }
  console.log(`Writing ${Object.keys(updates).length} synchronized updates to Firebase RTDB...`);
  await db.ref().update(updates);
  console.log('✅ Live Firebase Realtime Database updated successfully!');
  const freshSnap = await db.ref().once('value');
  const freshData = freshSnap.val();
  const exportPath = path.join(__dirname, 'data', 'musada-sd-default-rtdb-export.json');
  fs.writeFileSync(exportPath, JSON.stringify(freshData, null, 2), 'utf8');
  console.log(`✅ Local export saved to ${exportPath}`);
  process.exit(0);
}
syncStudents().catch(err => {
  console.error('❌ Error during synchronization:', err);
  process.exit(1);
});
