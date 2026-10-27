const fs = require('fs');
const path = require('path');
const exportPath = path.join(__dirname, 'data', 'musada-sd-default-rtdb-export.json');
const db = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
const students = db.students || {};
const users = db.users || {};
const classes = db.classes || {};
const ummiClasses = db.ummi_classes || {};
const libraryMembers = (db.library && db.library.members) || {};
const targetSpecs = [
  { nis: '0695', name: 'Arshaka Rasyeed Sugiarto', nisn: '3160913779', uid: 'SISWA_3160913779', classId: 'CLASS_4_KHALID_BIN_WALID', ummiClassId: 'UMMI_K4_RAHMAH' },
  { nis: '0843', name: 'Arshaka Virendra Daery F.R.', nisn: '0156654497', uid: 'SISWA_0156654497', classId: 'CLASS_5_ZAID_BIN_TSABIT', ummiClassId: 'UMMI_K5_ZIHA' },
  { nis: '0967', name: 'Muhammad Zafran Arrasyad', nisn: '3199842198', uid: 'SISWA_3199842198', classId: 'CLASS_1_UMAR_BIN_KHATTAB', ummiClassId: 'UMMI_K1_LAYYIN' },
  { nis: '0809', name: 'Muhammad Zafran Janitra', nisn: '3173650927', uid: 'SISWA_3173650927', classId: 'CLASS_3_ALI_BIN_ABI_THALIB', ummiClassId: 'UMMI_K3_NANIK' },
  { nis: '0699', name: 'Daffa Dzaky Alfarizi', nisn: '3168793093', uid: 'SISWA_3168793093', classId: 'CLASS_4_KHALID_BIN_WALID', ummiClassId: 'UMMI_K4_AIDAH' },
  { nis: '0704', name: 'Fatih Zafir Al Karim', nisn: '3174012701', uid: 'SISWA_3174012701', classId: 'CLASS_4_KHALID_BIN_WALID', ummiClassId: 'UMMI_K4_AISYAH' },
  { nis: '0860', name: 'Alesha Hanan Salsabila', nisn: '3186389891', uid: 'SISWA_3186389891', classId: 'CLASS_2_UTSMAN_BIN_AFFAN', ummiClassId: 'UMMI_K2_ABIDA' },
  { nis: '0906', name: 'Aleesya Shirin Abdillah', nisn: '3194314839', uid: 'SISWA_3194314839', classId: 'CLASS_2_KHADIJAH_BINTI_KHUWAILID', ummiClassId: 'UMMI_K2_FITRA' },
  { nis: '0952', name: 'Rania Azzahra Kusumawardhani', nisn: '0156063475', uid: 'SISWA_0156063475', classId: 'CLASS_1_ABU_BAKAR_ASH_SHIDDIQ', ummiClassId: 'UMMI_K1_DEWI' },
  { nis: '0993', name: 'Qalesya Nashwa Aulia', nisn: '3194760461', uid: 'SISWA_3194760461', classId: 'CLASS_1_AISYAH_BINTI_ABU_BAKAR', ummiClassId: 'UMMI_K1_ZIHA' },
  { nis: '0947', name: 'Meccayla Annalyn Aisyafara', nisn: '3200922888', uid: 'SISWA_3200922888', classId: 'CLASS_1_ABU_BAKAR_ASH_SHIDDIQ', ummiClassId: 'UMMI_K1_DEWI' },
  { nis: '0992', name: 'Putri Diva Ramadhani', nisn: '3193762629', uid: 'SISWA_3193762629', classId: 'CLASS_1_AISYAH_BINTI_ABU_BAKAR', ummiClassId: 'UMMI_K1_NANIK' }
];
console.log('=== VERIFYING ALL 12 STUDENTS ===');
let allOk = true;
for (const spec of targetSpecs) {
  const s = students[spec.uid];
  const u = users[spec.uid];
  const inClass = classes[spec.classId]?.students?.[spec.uid] === true;
  const inUmmi = ummiClasses[spec.ummiClassId]?.students?.[spec.uid] === true;
  const libMember = libraryMembers[spec.nis];
  const libOk = libMember && libMember.studentId === spec.uid;
  const sOk = s && s.nis === spec.nis && s.nisn === spec.nisn && s.classId === spec.classId;
  const uOk = u && u.name === spec.name && u.role === 'ortu';
  if (!sOk || !uOk || !inClass || !inUmmi || !libOk) {
    allOk = false;
    console.error(`❌ FAILED for ${spec.name} (${spec.nis}): sOk=${sOk}, uOk=${uOk}, inClass=${inClass}, inUmmi=${inUmmi}, libOk=${libOk}`);
  } else {
    console.log(`✅ OK: [${spec.nis}] ${spec.name} | NISN: ${spec.nisn} | Class: ${spec.classId} | Ummi: ${spec.ummiClassId}`);
  }
}
const deletedUids = ['SISWA_0843', 'SISWA_0704', 'SISWA_0906', 'SISWA_0993', 'SISWA_0992', 'SISWA_0809'];
for (const d of deletedUids) {
  if (students[d] || users[d]) {
    allOk = false;
    console.error(`❌ Old UID ${d} still exists!`);
  } else {
    console.log(`✅ Old UID ${d} cleanly deleted`);
  }
}
console.log('\n=== CHECKING NISN UNIQUENESS ACROSS ALL STUDENTS IN RTDB ===');
const seenNisns = {};
let duplicateCount = 0;
for (const [uid, s] of Object.entries(students)) {
  const nisn = (s.nisn || '').trim();
  if (nisn) {
    if (seenNisns[nisn]) {
      duplicateCount++;
      console.error(`❌ DUPLICATE NISN: ${nisn} between ${seenNisns[nisn]} and [${uid}] ${s.name}`);
    } else {
      seenNisns[nisn] = `[${uid}] ${s.name} (${s.nis})`;
    }
  }
}
if (duplicateCount === 0) {
  console.log(`✅ ZERO DUPLICATE NISN! Verified ${Object.keys(seenNisns).length} unique student NISNs.`);
}
if (allOk && duplicateCount === 0) {
  console.log('\n🎉 ALL CHECKS PASSED PERFECTLY!');
} else {
  console.error('\n⚠️ SOME CHECKS FAILED!');
  process.exit(1);
}
