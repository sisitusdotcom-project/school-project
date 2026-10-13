const fs = require('fs');
const siswaTsv = fs.readFileSync('./data/data-siswa.tsv', 'utf-8');
const guruTsv = fs.readFileSync('./data/data-guru.tsv', 'utf-8');
const rtdb = {
  users: {},
  classes: {},
  students: {},
  subjects: {
    'SUB_AQIDAH_AKHLAQ': {'name': 'Aqidah Akhlaq', 'order': 1, 'category': 'agama'},
    'SUB_FIQIH': {'name': 'Ibadah Syari\'ah/Fiqih', 'order': 2, 'category': 'agama'},
    'SUB_ALQURAN_HADITS': {'name': 'Al Qur\'an Hadits', 'order': 3, 'category': 'agama'},
    'SUB_TARIKH_ISLAM': {'name': 'Tarikh Islam', 'order': 4, 'category': 'agama'},
    'SUB_PKN': {'name': 'Pendidikan Kewarganegaraan', 'order': 5, 'category': 'standar'},
    'SUB_B_INDO': {'name': 'Bahasa Indonesia', 'order': 6, 'category': 'standar'},
    'SUB_MTK': {'name': 'Matematika', 'order': 7, 'category': 'standar'},
    'SUB_SAINS': {'name': 'Sains', 'order': 8, 'category': 'standar'},
    'SUB_IPS': {'name': 'Ilmu Pengetahuan Sosial', 'order': 9, 'category': 'standar'},
    'SUB_SBK': {'name': 'Seni Budaya dan Keterampilan', 'order': 10, 'category': 'standar'},
    'SUB_PJOK': {'name': 'Pendidikan Jasmani, Olahraga & Kesehatan', 'order': 11, 'category': 'standar'},
    'SUB_BTQ': {'name': 'Baca Tulis Qur\'an (BTQ)', 'order': 12, 'category': 'lokal'},
    'SUB_B_DAERAH': {'name': 'Bahasa Daerah', 'order': 13, 'category': 'lokal'},
    'SUB_B_INGGRIS': {'name': 'Bahasa Inggris', 'order': 14, 'category': 'lokal'},
    'SUB_TIK': {'name': 'TIK', 'order': 15, 'category': 'lokal'},
    'SUB_KEMUHAMMADIYAHAN': {'name': 'Kemuhammadiyahan', 'order': 16, 'category': 'kekhasan'},
    'SUB_B_ARAB': {'name': 'Bahasa Arab', 'order': 17, 'category': 'kekhasan'}
  },
  academicYears: {},
  semesters: {},
  rooms: {},
  assets: {},
  settings: {
    schoolName: "SD Muhammadiyah 1 Sedati",
    academicYear: "2026/2027",
    semester: "Ganjil"
  }
};
let currentClass = "";
const linesSiswa = siswaTsv.split('\n').map(l => l.trim());
let isParsingStudents = false;
for (let i = 0; i < linesSiswa.length; i++) {
  const line = linesSiswa[i];
  if (line.startsWith('NO\tNO INDUK\tNISN')) {
    isParsingStudents = true;
    continue;
  }
  if (isParsingStudents && line) {
    const cols = line.split('\t');
    if (cols.length >= 4) {
      const no = cols[0];
      const noInduk = cols[1];
      const nisn = cols[2];
      const nama = cols[3];
      const kelas = cols[4] || currentClass;
      const gender = cols[5]?.trim() || '';
      if (kelas) currentClass = kelas;
      if (!nama || nama.toLowerCase() === 'nama' || !no.match(/^\d+$/)) continue;
      const cleanNisn = nisn ? nisn.replace(/\s+/g, '') : (noInduk || (Date.now() + '_' + no));
      const uid = `SISWA_${cleanNisn}`;
      let classId = 'CLASS_' + currentClass.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      classId = classId.replace(/_+/g, '_');
      rtdb.users[uid] = {
        name: nama,
        role: 'ortu',
        isActive: true,
        createdAt: Date.now()
      };
      rtdb.students[uid] = {
        name: nama,
        nis: noInduk || '',
        nisn: nisn || '',
        classId: classId,
        parentId: uid,
        gender: gender,
        isActive: true
      };
      if (!rtdb.classes[classId]) {
        rtdb.classes[classId] = {
          name: currentClass,
          students: {}
        };
      }
      rtdb.classes[classId].students[uid] = true;
    }
  }
}
const guruLines = guruTsv.split('\n').map(l => l.trim());
for (let i = 0; i < guruLines.length; i++) {
  const line = guruLines[i];
  if (!line || line.startsWith('No\tNama')) continue;
  let cols = line.split('\t');
  if (cols.length < 4) continue;
  let name = cols[1]?.trim();
  let jabatan = cols[2]?.trim() || '';
  let gender = cols[3]?.trim() || '';
  let tugasTambahan = cols[5]?.trim() || '';
  if (!name || name.toLowerCase() === 'nama') continue;
  const baseName = name.split(',')[0].trim();
  const uid = 'GTK_' + baseName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  if (!rtdb.users[uid]) {
    rtdb.users[uid] = {
      name: name,
      role: jabatan === 'Tenaga Kependidikan' ? 'tendik' : (jabatan === 'Kepala Sekolah' ? 'kepsek' : 'guru'),
      jabatan: jabatan,
      gender: gender,
      assignments: [],
      isActive: true,
      createdAt: Date.now()
    };
  }
  const user = rtdb.users[uid];
  const allTugas = [tugasTambahan].filter(t => t && t !== '-').join(', ');
  const tugasList = allTugas.split(',').map(t => t.trim()).filter(Boolean);
  for (const t of tugasList) {
    if (!t) continue;
    let assignmentCode = t;
    if (t.startsWith('GURU_KELAS_')) {
      const className = t.replace('GURU_KELAS_', '').replace(/_/g, ' ');
      const classId = 'CLASS_' + t.replace('GURU_KELAS_', '');
      if (!rtdb.classes[classId]) {
        rtdb.classes[classId] = { name: className, students: {} };
      }
      rtdb.classes[classId].teacherId = uid;
    }
    const isCode = /^(GURU_|WAKA_|TIM_|KOORD_|STAF_|SUB_)/.test(t);
    if (isCode && !user.assignments.includes(assignmentCode)) {
      user.assignments.push(assignmentCode);
    }
  }
  if (user.assignments.length) {
    user.unitFlags = {};
    user.assignments.forEach(a => {
      user.unitFlags[a] = true;
    });
  }
}
rtdb.users['ADMIN'] = {
  name: 'Administrator Sistem',
  role: 'admin',
  jabatan: 'Administrator',
  gender: 'L',
  assignments: ['TIM_IT'],
  isActive: true,
  createdAt: Date.now()
};
const gradeClasses = {
  1: ['CLASS_1_ABU_BAKAR_ASH_SHIDDIQ', 'CLASS_1_AISYAH_BINTI_ABU_BAKAR', 'CLASS_1_UMAR_BIN_KHATTAB'],
  2: ['CLASS_2_KHADIJAH_BINTI_KHUWAILID', 'CLASS_2_SALMAN_AL_FARISI', 'CLASS_2_UTSMAN_BIN_AFFAN'],
  3: ['CLASS_3_ALI_BIN_ABI_THALIB', 'CLASS_3_BILAL_BIN_RABBAH', 'CLASS_3_ZAINAB_BINTI_JAHSYI'],
  4: ['CLASS_4_ABDURRAHMAN_BIN_AUF', 'CLASS_4_HAFSHAH_BINTI_UMAR', 'CLASS_4_KHALID_BIN_WALID'],
  5: ['CLASS_5_MARYAM_BINTI_IMRAN', 'CLASS_5_ZAID_BIN_TSABIT'],
  6: ['CLASS_6_FATIMAH_BINTI_MUHAMMAD', 'CLASS_6_MU_ADZ_BIN_JABAL']
};
const allClasses = Object.values(gradeClasses).flat();
allClasses.forEach(cid => {
  if (rtdb.classes[cid]) rtdb.classes[cid].subjectTeachers = rtdb.classes[cid].subjectTeachers || {};
});
function mapSubject(cids, subId, teacherUid) {
  cids.forEach(cid => {
    if (rtdb.classes[cid]) {
      rtdb.classes[cid].subjectTeachers = rtdb.classes[cid].subjectTeachers || {};
      rtdb.classes[cid].subjectTeachers[subId] = teacherUid;
    }
  });
}
mapSubject(allClasses, 'SUB_PJOK', 'GTK_MUHAMMAD_MUZAKKI');
mapSubject(allClasses, 'SUB_TARIKH_ISLAM', 'GTK_NURUL_LAILY_MUFIDA');
mapSubject(allClasses, 'SUB_FIQIH', 'GTK_MUHAMMAD_NIAM_AGUSTIAN');
mapSubject([...gradeClasses[1], ...gradeClasses[2]], 'SUB_ALQURAN_HADITS', 'GTK_VINDY_APRILLIA');
mapSubject([...gradeClasses[3], ...gradeClasses[4], ...gradeClasses[5], ...gradeClasses[6]], 'SUB_ALQURAN_HADITS', 'GTK_AHMAD_TSALIS_NOVARIYANTO');
mapSubject([...gradeClasses[4], ...gradeClasses[5], ...gradeClasses[6]], 'SUB_TIK', 'GTK_VINDY_APRILLIA');
mapSubject([...gradeClasses[3], ...gradeClasses[4], ...gradeClasses[5], ...gradeClasses[6]], 'SUB_B_ARAB', 'GTK_FURQON');
mapSubject(gradeClasses[3], 'SUB_AQIDAH_AKHLAQ', 'GTK_MUHAMMAD_NIAM_AGUSTIAN');
mapSubject([...gradeClasses[4], ...gradeClasses[5]], 'SUB_AQIDAH_AKHLAQ', 'GTK_FURQON');
mapSubject(gradeClasses[6], 'SUB_AQIDAH_AKHLAQ', 'GTK_APRILIA_AN_UMILLAH');
mapSubject([...gradeClasses[4], ...gradeClasses[5], ...gradeClasses[6]], 'SUB_B_INGGRIS', 'GTK_APRILIA_AN_UMILLAH');
mapSubject([...gradeClasses[4], ...gradeClasses[5], ...gradeClasses[6]], 'SUB_KEMUHAMMADIYAHAN', 'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA');
mapSubject(gradeClasses[5], 'SUB_MTK', 'GTK_AINAINI_RATNA_NOERI');
mapSubject(gradeClasses[5], 'SUB_PKN', 'GTK_AINAINI_RATNA_NOERI');
mapSubject(gradeClasses[5], 'SUB_SAINS', 'GTK_ANGGA_DWI_KURNIAWAN_KUSUMA');
mapSubject(gradeClasses[5], 'SUB_B_INDO', 'GTK_ROICHATUL_JANNAH');
mapSubject(gradeClasses[5], 'SUB_SBK', 'GTK_NURUL_LAILY_MUFIDA');
mapSubject(gradeClasses[6], 'SUB_MTK', 'GTK_ROUDHOTUL_MILLAH');
mapSubject(gradeClasses[6], 'SUB_SAINS', 'GTK_ROUDHOTUL_MILLAH');
mapSubject(gradeClasses[6], 'SUB_B_INDO', 'GTK_EKA_DESSY_PRATIWI');
mapSubject(gradeClasses[6], 'SUB_SBK', 'GTK_EKA_DESSY_PRATIWI');
mapSubject(gradeClasses[4], 'SUB_SAINS', 'GTK_ROICHATUL_JANNAH');
mapSubject(['CLASS_4_ABDURRAHMAN_BIN_AUF'], 'SUB_MTK', 'GTK_DEAYU_ICHA_RISTYA');
mapSubject(['CLASS_4_ABDURRAHMAN_BIN_AUF'], 'SUB_PKN', 'GTK_DEAYU_ICHA_RISTYA');
mapSubject(['CLASS_4_ABDURRAHMAN_BIN_AUF'], 'SUB_SBK', 'GTK_DEAYU_ICHA_RISTYA');
mapSubject(['CLASS_4_HAFSHAH_BINTI_UMAR'], 'SUB_MTK', 'GTK_KHALIMAH_SA_DIYAH');
mapSubject(['CLASS_4_HAFSHAH_BINTI_UMAR'], 'SUB_PKN', 'GTK_KHALIMAH_SA_DIYAH');
mapSubject(['CLASS_4_HAFSHAH_BINTI_UMAR'], 'SUB_SBK', 'GTK_KHALIMAH_SA_DIYAH');
mapSubject(['CLASS_4_KHALID_BIN_WALID'], 'SUB_MTK', 'GTK_ROICHATUL_JANNAH');
mapSubject(['CLASS_4_KHALID_BIN_WALID'], 'SUB_PKN', 'GTK_ROICHATUL_JANNAH');
mapSubject(['CLASS_4_KHALID_BIN_WALID'], 'SUB_SBK', 'GTK_ROICHATUL_JANNAH');
const elementarySubs = ['SUB_MTK', 'SUB_B_INDO', 'SUB_B_INGGRIS', 'SUB_PKN', 'SUB_SBK', 'SUB_SAINS'];
[1, 2, 3].forEach(g => {
  gradeClasses[g].forEach(cid => {
    const waliId = rtdb.classes[cid]?.teacherId;
    if (waliId) {
      elementarySubs.forEach(sid => {
        rtdb.classes[cid].subjectTeachers[sid] = waliId;
      });
    }
  });
});
fs.writeFileSync('./data/musada-sd-default-rtdb-export.json', JSON.stringify(rtdb, null, 2));
console.log('Successfully generated ./data/musada-sd-default-rtdb-export.json, Teachers:', Object.values(rtdb.users).filter(u => u.role !== 'ortu').length, 'Students:', Object.values(rtdb.users).filter(u => u.role === 'ortu').length);