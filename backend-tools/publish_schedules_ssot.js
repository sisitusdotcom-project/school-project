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

const classMap = {
  'KELAS 1 ABU BAKAR ASH-SHIDDIQ': 'CLASS_1_ABU_BAKAR_ASH_SHIDDIQ',
  'KELAS 2 USMAN BIN AFFFAN': 'CLASS_2_UTSMAN_BIN_AFFAN',
  'KELAS 3 ALI BIN ABI THALIB': 'CLASS_3_ALI_BIN_ABI_THALIB',
  'KELAS 4 ABDURRAHMAN BIN AUF': 'CLASS_4_ABDURRAHMAN_BIN_AUF',
  'KELAS 5': 'CLASS_5_ZAID_BIN_TSABIT',
  "KELAS 6 MU'ADZ BIN JABBAL": 'CLASS_6_MU_ADZ_BIN_JABAL',
  'KELAS 1 UMAR BIN KHOTTOB': 'CLASS_1_UMAR_BIN_KHATTAB',
  'KELAS 2 SALMAN AL FARISHI': 'CLASS_2_SALMAN_AL_FARISI',
  'KELAS 3 BILAL BIN RABBAH': 'CLASS_3_BILAL_BIN_RABBAH',
  'KELAS 4 KHALID BIN WALID': 'CLASS_4_KHALID_BIN_WALID',
  'KELAS 5 MARYAM BINTI IMRAN': 'CLASS_5_MARYAM_BINTI_IMRAN',
  'KELAS 6 FATIMAH BINTI MUHAMMAD': 'CLASS_6_FATIMAH_BINTI_MUHAMMAD',
  'KELAS 1 AISYAH BINTI ABU BAKAR': 'CLASS_1_AISYAH_BINTI_ABU_BAKAR',
  'KELAS 2 KHADIJAH BINTI KHUWAILID': 'CLASS_2_KHADIJAH_BINTI_KHUWAILID',
  'KELAS 3 ZAINAB BINTI JAHSYI': 'CLASS_3_ZAINAB_BINTI_JAHSYI',
  'KELAS 4 HAFSHAH BINTI UMMAR': 'CLASS_4_HAFSHAH_BINTI_UMAR'
};

const subjectIdMap = {
  "alqur'an hadist": { id: "SUB_ALQURAN_HADITS", category: "agama" },
  "al qur'an hadits": { id: "SUB_ALQURAN_HADITS", category: "agama" },
  "qur'an hadist": { id: "SUB_ALQURAN_HADITS", category: "agama" },
  "aqidah akhlak": { id: "SUB_AQIDAH_AKHLAQ", category: "agama" },
  "aqidah akhlaq": { id: "SUB_AQIDAH_AKHLAQ", category: "agama" },
  "ibadah syari'ah": { id: "SUB_FIQIH", category: "agama" },
  "ibadah syariah": { id: "SUB_FIQIH", category: "agama" },
  "praktik ibadah": { id: "SUB_FIQIH", category: "agama" },
  "praktek ibadah": { id: "SUB_FIQIH", category: "agama" },
  "tarikh islam": { id: "SUB_TARIKH_ISLAM", category: "agama" },
  "kemuhammadiyaan": { id: "SUB_KEMUHAMMADIYAHAN", category: "kekhasan" },
  "kemuhammadiyahan": { id: "SUB_KEMUHAMMADIYAHAN", category: "kekhasan" },
  "bahasa arab": { id: "SUB_B_ARAB", category: "kekhasan" },
  "bahasa indonesia": { id: "SUB_B_INDO", category: "standar" },
  "bahasa inggris": { id: "SUB_B_INGGRIS", category: "lokal" },
  "wow with english": { id: "SUB_B_INGGRIS", category: "lokal" },
  "matematika": { id: "SUB_MTK", category: "standar" },
  "ipas": { id: "SUB_IPAS", category: "standar" },
  "sains": { id: "SUB_SAINS", category: "standar" },
  "ips": { id: "SUB_IPS", category: "standar" },
  "ppkn": { id: "SUB_PKN", category: "standar" },
  "pkn": { id: "SUB_PKN", category: "standar" },
  "seni budaya": { id: "SUB_SBK", category: "standar" },
  "pjok": { id: "SUB_PJOK", category: "standar" },
  "olahraga": { id: "SUB_PJOK", category: "standar" },
  "tik": { id: "SUB_TIK", category: "lokal" },
  "btq": { id: "SUB_BTQ", category: "lokal" },
  "btq & tahfidz": { id: "SUB_BTQ", category: "lokal" }
};

async function publish() {
  console.log("Memulai penerbitan jadwal ke RTDB...");

  const [classesSnap, subjectsSnap, usersSnap] = await Promise.all([
    db.ref('classes').once('value'),
    db.ref('subjects').once('value'),
    db.ref('users').once('value')
  ]);

  const classes = classesSnap.val() || {};
  const subjects = subjectsSnap.val() || {};
  const users = usersSnap.val() || {};

  // 1. Pastikan SUB_IPAS ada di subjects RTDB
  if (!subjects['SUB_IPAS']) {
    console.log("Menambahkan SUB_IPAS ke RTDB subjects...");
    await db.ref('subjects/SUB_IPAS').set({
      name: "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
      code: "IPAS",
      category: "standar",
      order: 5
    });
  }

  // 2. Simpan pengaturan jadwal ke curriculum/settings
  console.log("Menyimpan pengaturan jadwal ke curriculum/settings...");
  const settingsData = {
    academicYear: "2026/2027",
    semester: "1",
    framework: {
      seninKamis: [
        { period: 0, time: "07.00 - 07.30", type: "habit", label: "Pembiasaan / Upacara" },
        { period: 1, time: "07.30 - 08.05", type: "lesson", label: "Jam Ke-1" },
        { period: 2, time: "08.05 - 08.40", type: "lesson", label: "Jam Ke-2" },
        { period: 3, time: "08.40 - 09.15", type: "lesson", label: "Jam Ke-3" },
        { period: 4, time: "09.15 - 09.45", type: "break", label: "Istirahat 1" },
        { period: 5, time: "09.45 - 10.20", type: "lesson", label: "Jam Ke-4" },
        { period: 6, time: "10.20 - 10.55", type: "lesson", label: "Jam Ke-5" },
        { period: 7, time: "10.55 - 11.30", type: "lesson", label: "Jam Ke-6" },
        { period: 8, time: "11.30 - 12.30", type: "break", label: "ISHOMA" },
        { period: 9, time: "12.30 - 13.05", type: "lesson", label: "Jam Ke-7" },
        { period: 10, time: "13.05 - 13.40", type: "lesson", label: "Jam Ke-8" }
      ],
      jumat: [
        { period: 0, time: "07.00 - 07.30", type: "habit", label: "Pembiasaan / Senam" },
        { period: 1, time: "07.30 - 08.05", type: "lesson", label: "Jam Ke-1" },
        { period: 2, time: "08.05 - 08.40", type: "lesson", label: "Jam Ke-2" },
        { period: 3, time: "08.40 - 09.10", type: "break", label: "Istirahat" },
        { period: 4, time: "09.10 - 09.45", type: "lesson", label: "Jam Ke-3" },
        { period: 5, time: "09.45 - 10.20", type: "lesson", label: "Jam Ke-4" }
      ]
    },
    uniforms: {
      Senin: "Putih - Merah (Upacara)",
      Selasa: "Batik Muhammadiyah - Putih",
      Rabu: "Tapak Suci (Kelas Bawah) / Merah - Putih (Kelas Atas)",
      Kamis: "Olahraga (Kelas Bawah) / HW (Kelas Atas)",
      Jumat: "Hizbul Wathan / Batik Berkarakter"
    },
    habits: {
      lower: [
        { week: 1, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "Literasi Numerasi", kamis: "Hadits & Doa", jumat: "Senam / Bersih Diri" },
        { week: 2, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "English Morning", kamis: "Adab & Karakter", jumat: "Jalan Sehat" },
        { week: 3, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "Bahasa Arab Dasar", kamis: "Aritmatika Ceria", jumat: "Kerja Bakti" },
        { week: 4, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "Kisah Sahabat Nabi", kamis: "Tahfidz Bersama", jumat: "Senam Sehat" },
        { week: 5, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "Kreativitas / Musik", kamis: "Muhasabah Pagi", jumat: "Pentas Bakat Cilik" }
      ],
      upper: [
        { week: 1, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "Literasi Membaca", kamis: "Aritmatika / Sains", jumat: "Jum'at Bersih" },
        { week: 2, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "English Speech", kamis: "Hadits Pilihan", jumat: "Senam Kebugaran" },
        { week: 3, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "Muhadatsah Arab", kamis: "Kemuhammadiyahan", jumat: "Jalan Sehat Islami" },
        { week: 4, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "Literasi Digital", kamis: "Kajian Karakter", jumat: "Bakti Sosial" },
        { week: 5, senin: "Upacara Bendera", selasa: "Dhuha & Muraja'ah", rabu: "Public Speaking", kamis: "Kultum Siswa", jumat: "Pentas Kreasi" }
      ]
    },
    updatedAt: Date.now()
  };

  await db.ref('curriculum/settings').set(settingsData);

  // 3. Ekstraksi semua slot dari jadwal-pelajaran.tsv
  const tsvPath = path.join(__dirname, '../JADWAL-TAPEL-2026-2027/jadwal-pelajaran.tsv');
  const rawLines = fs.readFileSync(tsvPath, 'utf-8').split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.trim().length > 0);

  const blocks = [
    { name_row: 3, start_row: 6, end_row: 16, cols: [0, 10, 20, 30, 40, 50] },
    { name_row: 19, start_row: 22, end_row: 32, cols: [0, 10, 20, 30, 40, 50] },
    { name_row: 35, start_row: 38, end_row: 48, cols: [0, 10, 20, 30] }
  ];

  const batchSchedules = {};
  let totalSlots = 0;

  for (const b of blocks) {
    const nameParts = rawLines[b.name_row].split('\t');
    for (const baseCol of b.cols) {
      const rawName = nameParts[baseCol] ? nameParts[baseCol].trim() : '';
      let classId = classMap[rawName];
      if (!classId) {
        for (const [k, v] of Object.entries(classMap)) {
          if (k.includes(rawName) || rawName.includes(k)) {
            classId = v;
            break;
          }
        }
      }
      if (!classId) continue;

      const clsObj = classes[classId] || {};
      const walasUid = clsObj.teacherId || '';
      const walasObj = users[walasUid] || {};
      const walasName = walasObj.name || walasObj.displayName || '';
      const subjectTeachers = clsObj.subjectTeachers || {};

      for (let r = b.start_row; r < b.end_row; r++) {
        const rowParts = rawLines[r].split('\t');
        const pStr = rowParts[baseCol] ? rowParts[baseCol].trim() : '';
        const pNum = parseInt(pStr, 10);
        if (isNaN(pNum)) continue;

        const tMonWed = rowParts[baseCol + 1] ? rowParts[baseCol + 1].trim() : '';
        const subSenin = rowParts[baseCol + 2] ? rowParts[baseCol + 2].trim() : '';
        const subSelasa = rowParts[baseCol + 3] ? rowParts[baseCol + 3].trim() : '';
        const subRabu = rowParts[baseCol + 4] ? rowParts[baseCol + 4].trim() : '';
        const tThu = (rowParts[baseCol + 5] && rowParts[baseCol + 5].trim()) ? rowParts[baseCol + 5].trim() : tMonWed;
        const subKamis = rowParts[baseCol + 6] ? rowParts[baseCol + 6].trim() : '';
        const tFri = (rowParts[baseCol + 7] && rowParts[baseCol + 7].trim()) ? rowParts[baseCol + 7].trim() : tMonWed;
        const subJumat = rowParts[baseCol + 8] ? rowParts[baseCol + 8].trim() : '';

        const items = [
          { day: 'Senin', time: tMonWed, sub: subSenin },
          { day: 'Selasa', time: tMonWed, sub: subSelasa },
          { day: 'Rabu', time: tMonWed, sub: subRabu },
          { day: 'Kamis', time: tThu, sub: subKamis },
          { day: 'Jumat', time: tFri, sub: subJumat }
        ];

        for (const item of items) {
          if (!item.sub || item.sub === '-' || item.sub === '') continue;

          const sRaw = item.sub.trim();
          const sLower = sRaw.toLowerCase();

          // Penentuan jenis slot & mapel SSOT
          const isBreak = sLower.includes('istirahat') || sLower.includes('ishoma');
          const isHabit = sLower.includes('pembiasaan') || sLower.includes('upacara') || sLower.includes('sholat');
          const matchedSub = subjectIdMap[sLower] || null;

          let subjectId = null;
          let category = 'standar';
          let slotType = 'lesson';

          if (isBreak) {
            category = 'break';
            slotType = 'break';
          } else if (isHabit) {
            category = 'rutinitas';
            slotType = 'habit';
          } else if (matchedSub) {
            subjectId = matchedSub.id;
            category = matchedSub.category;
          } else {
            category = 'kokurikuler';
          }

          // Penentuan guru pengampu SSOT
          let assignedTeacherId = '';
          let assignedTeacherName = '';

          if (!isBreak && !isHabit) {
            if (subjectId && subjectTeachers[subjectId]) {
              assignedTeacherId = subjectTeachers[subjectId];
              const u = users[assignedTeacherId];
              assignedTeacherName = u ? (u.name || u.displayName) : '';
            } else if (sLower.includes('pjok') || sLower.includes('olahraga')) {
              assignedTeacherId = 'GTK_MUHAMMAD_MUZAKKI';
              const u = users[assignedTeacherId];
              assignedTeacherName = u ? (u.name || u.displayName) : 'Muhammad Muzakki, S.Pd.';
            } else if (sLower.includes('arab')) {
              assignedTeacherId = 'GTK_FURQON';
              const u = users[assignedTeacherId];
              assignedTeacherName = u ? (u.name || u.displayName) : 'Furqon, SH.';
            } else if (sLower.includes('tik')) {
              assignedTeacherId = 'GTK_VINDY_APRILLIA';
              const u = users[assignedTeacherId];
              assignedTeacherName = u ? (u.name || u.displayName) : 'Vindy Aprilia, S.Pd.';
            } else if (sLower.includes('tarikh') || (sLower.includes('seni') && (classId.includes('_5_') || classId.includes('_6_')))) {
              assignedTeacherId = 'GTK_NURUL_LAILY_MUFIDA';
              const u = users[assignedTeacherId];
              assignedTeacherName = u ? (u.name || u.displayName) : 'Nurul Laily Mufida, S.Pd.';
            } else {
              // Guru kelas / Walas
              assignedTeacherId = walasUid;
              assignedTeacherName = walasName;
            }
          }

          let startTime = '';
          let endTime = '';
          if (item.time && item.time.includes('-')) {
            const splitted = item.time.split('-').map(t => t.trim().replace('.', ':'));
            startTime = splitted[0] || '';
            endTime = splitted[1] || '';
          }

          const slotKey = `slot_${classId}_${item.day}_${pNum}`;

          batchSchedules[slotKey] = {
            academicYear: "2026/2027",
            semester: "1",
            classId,
            className: clsObj.name || rawName,
            day: item.day,
            period: pNum,
            startTime,
            endTime,
            subjectId,
            subjectName: sRaw,
            teacherId: assignedTeacherId,
            teacherName: assignedTeacherName,
            room: `Ruang ${clsObj.name || rawName}`,
            category,
            type: slotType,
            updatedAt: Date.now()
          };

          totalSlots++;
        }
      }
    }
  }

  console.log(`Mengunggah ${totalSlots} slot jadwal ke path curriculum/schedules...`);
  await db.ref('curriculum/schedules').set(batchSchedules);
  console.log("SUKSES: Seluruh jadwal berhasil diterbitkan ke RTDB!");
  process.exit(0);
}

publish().catch(err => {
  console.error("Gagal menerbitkan jadwal:", err);
  process.exit(1);
});
