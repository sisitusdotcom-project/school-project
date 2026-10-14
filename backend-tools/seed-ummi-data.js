const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const path = require('path');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);
async function runSeed() {
  console.log('Mengambil data dari RTDB...');
  const [studentsSnap, usersSnap, settingsSnap] = await Promise.all([
    db.ref('students').once('value'),
    db.ref('users').once('value'),
    db.ref('settings').once('value')
  ]);
  const students = studentsSnap.val() || {};
  const settings = settingsSnap.val() || {};
  const year = settings.currentAcademicYear || settings.academicYear || '2026/2027';
  const sem = settings.currentSemester || (settings.semester === 'Genap' ? 2 : 1) || 1;
  const gradeKey = `${year}_${sem}`;
  const studentList = Object.entries(students).map(([id, data]) => ({ id, ...data }));
  const getByClass = (classId) => studentList.filter(s => s.classId === classId);
  const c1Abu = getByClass('CLASS_1_ABU_BAKAR_ASH_SHIDDIQ');
  const c1Umar = getByClass('CLASS_1_UMAR_BIN_KHATTAB');
  const c1Aisyah = getByClass('CLASS_1_AISYAH_BINTI_ABU_BAKAR');
  const c2Khadijah = getByClass('CLASS_2_KHADIJAH_BINTI_KHUWAILID');
  const c2Utsman = getByClass('CLASS_2_UTSMAN_BIN_AFFAN');
  const c2Salman = getByClass('CLASS_2_SALMAN_AL_FARISI');
  const c3Ali = getByClass('CLASS_3_ALI_BIN_ABI_THALIB');
  const c3Bilal = getByClass('CLASS_3_BILAL_BIN_RABBAH');
  const c3Zainab = getByClass('CLASS_3_ZAINAB_BINTI_JAHSYI');
  const c4Abdur = getByClass('CLASS_4_ABDURRAHMAN_BIN_AUF');
  const c4Hafshah = getByClass('CLASS_4_HAFSHAH_BINTI_UMAR');
  const c4Khalid = getByClass('CLASS_4_KHALID_BIN_WALID');
  const c5Maryam = getByClass('CLASS_5_MARYAM_BINTI_IMRAN');
  const c5Zaid = getByClass('CLASS_5_ZAID_BIN_TSABIT');
  const c6Fatimah = getByClass('CLASS_6_FATIMAH_BINTI_MUHAMMAD');
  const c6Muadz = getByClass('CLASS_6_MU_ADZ_BIN_JABAL');
  const roomsPayload = {
    'ROOM_SERAMBI_TIMUR': { id: 'ROOM_SERAMBI_TIMUR', name: 'Serambi Masjid (Sayap Timur)', location: 'Masjid Lantai 1' },
    'ROOM_SERAMBI_BARAT': { id: 'ROOM_SERAMBI_BARAT', name: 'Serambi Masjid (Sayap Barat)', location: 'Masjid Lantai 1' },
    'ROOM_SERAMBI_DEPAN': { id: 'ROOM_SERAMBI_DEPAN', name: 'Serambi Masjid (Sisi Depan / Mihrab)', location: 'Masjid Lantai 1' },
    'ROOM_SERAMBI_BELAKANG': { id: 'ROOM_SERAMBI_BELAKANG', name: 'Serambi Masjid (Sisi Belakang)', location: 'Masjid Lantai 1' },
    'ROOM_KELAS_1_ABU_BAKAR': { id: 'ROOM_KELAS_1_ABU_BAKAR', name: 'Ruang Kelas 1 Abu Bakar Ash-Shiddiq', location: 'Gedung A Lantai 1' },
    'ROOM_KELAS_1_UMAR': { id: 'ROOM_KELAS_1_UMAR', name: 'Ruang Kelas 1 Umar bin Khattab', location: 'Gedung A Lantai 1' },
    'ROOM_KELAS_1_AISYAH': { id: 'ROOM_KELAS_1_AISYAH', name: 'Ruang Kelas 1 Aisyah binti Abu Bakar', location: 'Gedung A Lantai 1' },
    'ROOM_KELAS_2_KHADIJAH': { id: 'ROOM_KELAS_2_KHADIJAH', name: 'Ruang Kelas 2 Khadijah binti Khuwailid', location: 'Gedung A Lantai 2' },
    'ROOM_KELAS_2_UTSMAN': { id: 'ROOM_KELAS_2_UTSMAN', name: 'Ruang Kelas 2 Utsman bin Affan', location: 'Gedung A Lantai 2' },
    'ROOM_KELAS_2_SALMAN': { id: 'ROOM_KELAS_2_SALMAN', name: 'Ruang Kelas 2 Salman Al-Farisi', location: 'Gedung A Lantai 2' },
    'ROOM_KELAS_3_ALI': { id: 'ROOM_KELAS_3_ALI', name: 'Ruang Kelas 3 Ali bin Abi Thalib', location: 'Gedung B Lantai 1' },
    'ROOM_KELAS_3_BILAL': { id: 'ROOM_KELAS_3_BILAL', name: 'Ruang Kelas 3 Bilal bin Rabbah', location: 'Gedung B Lantai 1' },
    'ROOM_KELAS_3_ZAINAB': { id: 'ROOM_KELAS_3_ZAINAB', name: 'Ruang Kelas 3 Zainab binti Jahsyi', location: 'Gedung B Lantai 1' },
    'ROOM_PERPUSTAKAAN': { id: 'ROOM_PERPUSTAKAAN', name: 'Ruang Perpustakaan', location: 'Gedung B Lantai 2' },
    'ROOM_AULA': { id: 'ROOM_AULA', name: 'Ruang Aula Utama', location: 'Gedung Utama Lantai 2' }
  };
  const rombels = [
    {
      id: 'UMMI_ROMBEL_1',
      name: 'Rombel Al-Muslim',
      teacherId: 'GTK_AISYAH_HANI_SULAIMAN',
      teacherName: 'Aisyah Hani Sulaiman',
      room: 'Serambi Masjid (Sayap Timur)',
      level: 'Pra-Jilid s.d. Jilid 2',
      notes: 'Kelompok santri tahap awal dan pelancaran harakat',
      students: [
        { s: c1Abu[0], lvl: 'Pra-Jilid' },
        { s: c1Abu[1], lvl: 'Pra-Jilid' },
        { s: c1Abu[2], lvl: 'Jilid 1' },
        { s: c1Abu[3], lvl: 'Jilid 1' },
        { s: c1Umar[0], lvl: 'Pra-Jilid' },
        { s: c1Umar[1], lvl: 'Jilid 1' },
        { s: c2Khadijah[0], lvl: 'Jilid 1' },
        { s: c2Khadijah[1], lvl: 'Jilid 2' },
        { s: c2Salman[0], lvl: 'Jilid 2' },
        { s: c3Ali[0], lvl: 'Jilid 2' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_2',
      name: 'Rombel Al-Mukmin',
      teacherId: 'GTK_BIBI_MUTHLIATIL_JANNAH',
      teacherName: 'Bibi Muthliatil Jannah, S.Pd.',
      room: 'Serambi Masjid (Sayap Barat)',
      level: 'Jilid 2 s.d. Jilid 3',
      notes: 'Kelompok santri mad thabi\'i dan tanwin lintas kelas',
      students: [
        { s: c1Abu[4], lvl: 'Jilid 2' },
        { s: c1Umar[2], lvl: 'Jilid 2' },
        { s: c2Khadijah[2], lvl: 'Jilid 2' },
        { s: c2Utsman[0], lvl: 'Jilid 2' },
        { s: c2Utsman[1], lvl: 'Jilid 3' },
        { s: c3Ali[1], lvl: 'Jilid 3' },
        { s: c3Bilal[0], lvl: 'Jilid 3' },
        { s: c3Zainab[0], lvl: 'Jilid 3' },
        { s: c4Abdur[0], lvl: 'Jilid 3' },
        { s: c4Hafshah[0], lvl: 'Jilid 3' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_3',
      name: 'Rombel Al-Muhsin',
      teacherId: 'GTK_DEWI_NUR_MASLIHAH',
      teacherName: 'Dewi Nur Maslihah, S.Pd.',
      room: 'Serambi Masjid (Sisi Depan / Mihrab)',
      level: 'Jilid 3 s.d. Jilid 4',
      notes: 'Kelompok sukun, qalqalah, dan tasydid lintas jenjang',
      students: [
        { s: c1Umar[3], lvl: 'Jilid 3' },
        { s: c2Salman[1], lvl: 'Jilid 3' },
        { s: c2Utsman[2], lvl: 'Jilid 3' },
        { s: c3Ali[2], lvl: 'Jilid 4' },
        { s: c3Bilal[1], lvl: 'Jilid 4' },
        { s: c3Zainab[1], lvl: 'Jilid 4' },
        { s: c4Abdur[1], lvl: 'Jilid 4' },
        { s: c4Hafshah[1], lvl: 'Jilid 4' },
        { s: c4Khalid[0], lvl: 'Jilid 4' },
        { s: c5Maryam[0], lvl: 'Jilid 4' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_4',
      name: 'Rombel Al-Alim',
      teacherId: 'GTK_FITRIANING_DANIYAH_FIJRIANI',
      teacherName: 'Fitrianing Daniyah Fijriani',
      room: 'Serambi Masjid (Sisi Belakang)',
      level: 'Jilid 4 s.d. Jilid 5',
      notes: 'Kelompok nun mati, ikhfa, idgham dan wakaf',
      students: [
        { s: c2Khadijah[3], lvl: 'Jilid 4' },
        { s: c3Ali[3], lvl: 'Jilid 4' },
        { s: c3Bilal[2], lvl: 'Jilid 4' },
        { s: c4Abdur[2], lvl: 'Jilid 4' },
        { s: c4Hafshah[2], lvl: 'Jilid 5' },
        { s: c4Khalid[1], lvl: 'Jilid 5' },
        { s: c5Maryam[1], lvl: 'Jilid 5' },
        { s: c5Zaid[0], lvl: 'Jilid 5' },
        { s: c6Fatimah[0], lvl: 'Jilid 5' },
        { s: c6Muadz[0], lvl: 'Jilid 5' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_5',
      name: 'Rombel Al-Hafidz',
      teacherId: 'GTK_FUAIDA_RAHMAH',
      teacherName: 'Fuaida Rahmah',
      room: 'Ruang Kelas 1 Abu Bakar Ash-Shiddiq',
      level: 'Pra-Jilid s.d. Jilid 1',
      notes: 'Bimbingan intensif persiapan jilid 1 untuk santri pemula',
      students: [
        { s: c1Abu[5], lvl: 'Pra-Jilid' },
        { s: c1Abu[6], lvl: 'Pra-Jilid' },
        { s: c1Aisyah[0], lvl: 'Pra-Jilid' },
        { s: c1Aisyah[1], lvl: 'Jilid 1' },
        { s: c1Umar[4], lvl: 'Jilid 1' },
        { s: c2Salman[2], lvl: 'Jilid 1' },
        { s: c2Khadijah[4], lvl: 'Jilid 1' },
        { s: c3Bilal[3], lvl: 'Jilid 1' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_6',
      name: 'Rombel Al-Fattah',
      teacherId: 'GTK_ISMATUL_KHUSNAH',
      teacherName: 'Ismatul Khusnah, S.Hum.',
      room: 'Ruang Kelas 1 Umar bin Khattab',
      level: 'Jilid 1 s.d. Jilid 2',
      notes: 'Fokus makharijul huruf dan panjang pendek dua harakat',
      students: [
        { s: c1Aisyah[2], lvl: 'Jilid 1' },
        { s: c1Aisyah[3], lvl: 'Jilid 1' },
        { s: c1Abu[7], lvl: 'Jilid 1' },
        { s: c2Utsman[3], lvl: 'Jilid 2' },
        { s: c2Salman[3], lvl: 'Jilid 2' },
        { s: c3Zainab[2], lvl: 'Jilid 2' },
        { s: c4Abdur[3], lvl: 'Jilid 2' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_7',
      name: 'Rombel Al-Karim',
      teacherId: 'GTK_LAYYINANTUS_SANIYYAH',
      teacherName: 'Layyinantus Saniyyah',
      room: 'Ruang Kelas 1 Aisyah binti Abu Bakar',
      level: 'Jilid 2 s.d. Jilid 3',
      notes: 'Bimbingan mad thabi\'i, kasrah panjang, dan dhommah panjang',
      students: [
        { s: c1Umar[5], lvl: 'Jilid 2' },
        { s: c1Aisyah[4], lvl: 'Jilid 2' },
        { s: c2Khadijah[5], lvl: 'Jilid 2' },
        { s: c2Salman[4], lvl: 'Jilid 3' },
        { s: c3Ali[4], lvl: 'Jilid 3' },
        { s: c3Bilal[4], lvl: 'Jilid 3' },
        { s: c4Hafshah[3], lvl: 'Jilid 3' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_8',
      name: 'Rombel Al-Quddus',
      teacherId: 'GTK_MARYAM',
      teacherName: 'Maryam',
      room: 'Ruang Kelas 2 Khadijah binti Khuwailid',
      level: 'Jilid 3 s.d. Jilid 4',
      notes: 'Penguasaan bacaan tanwin, sukun, dan qalqalah praktis',
      students: [
        { s: c2Utsman[4], lvl: 'Jilid 3' },
        { s: c2Khadijah[6], lvl: 'Jilid 3' },
        { s: c3Zainab[3], lvl: 'Jilid 3' },
        { s: c3Ali[5], lvl: 'Jilid 4' },
        { s: c4Khalid[2], lvl: 'Jilid 4' },
        { s: c5Maryam[2], lvl: 'Jilid 4' },
        { s: c5Zaid[1], lvl: 'Jilid 4' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_9',
      name: 'Rombel Al-Hadi',
      teacherId: 'GTK_NANIK',
      teacherName: 'Nanik',
      room: 'Ruang Kelas 2 Utsman bin Affan',
      level: 'Jilid 4 s.d. Jilid 5',
      notes: 'Pendalaman tasydid dan hukum nun mati (ikhfa, idgham, izhhar)',
      students: [
        { s: c3Bilal[5], lvl: 'Jilid 4' },
        { s: c3Zainab[4], lvl: 'Jilid 4' },
        { s: c4Abdur[4], lvl: 'Jilid 4' },
        { s: c4Hafshah[4], lvl: 'Jilid 5' },
        { s: c4Khalid[3], lvl: 'Jilid 5' },
        { s: c5Maryam[3], lvl: 'Jilid 5' },
        { s: c6Fatimah[1], lvl: 'Jilid 5' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_10',
      name: 'Rombel Al-Mughni',
      teacherId: 'GTK_NUR_ABIDHATUL_LAILIYAH',
      teacherName: 'Nur Abidhatul Lailiyah',
      room: 'Ruang Kelas 2 Salman Al-Farisi',
      level: 'Jilid 5 s.d. Jilid 6',
      notes: 'Bimbingan wakaf, cara berhenti, dan pelancaran bacaan Al-Qur\'an',
      students: [
        { s: c3Ali[6], lvl: 'Jilid 5' },
        { s: c4Abdur[5], lvl: 'Jilid 5' },
        { s: c4Hafshah[5], lvl: 'Jilid 5' },
        { s: c5Maryam[4], lvl: 'Jilid 6' },
        { s: c5Zaid[2], lvl: 'Jilid 6' },
        { s: c6Fatimah[2], lvl: 'Jilid 6' },
        { s: c6Muadz[1], lvl: 'Jilid 6' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_11',
      name: 'Rombel Al-Basir',
      teacherId: 'GTK_SILVANA_IZZA_RAHMA_DEWI',
      teacherName: 'Silvana Izza Rahma Dewi, S.Pd.',
      room: 'Ruang Kelas 3 Ali bin Abi Thalib',
      level: 'Jilid 6 s.d. Al-Qur\'an',
      notes: 'Persiapan masuk membaca mushaf standar dengan tartil',
      students: [
        { s: c4Khalid[4], lvl: 'Jilid 6' },
        { s: c5Maryam[5], lvl: 'Jilid 6' },
        { s: c5Zaid[3], lvl: 'Jilid 6' },
        { s: c6Fatimah[3], lvl: 'Al-Qur\'an' },
        { s: c6Fatimah[4], lvl: 'Al-Qur\'an' },
        { s: c6Muadz[2], lvl: 'Al-Qur\'an' },
        { s: c6Muadz[3], lvl: 'Al-Qur\'an' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_12',
      name: 'Rombel Al-Aziz',
      teacherId: 'GTK_URWATUN_NAZIHAH',
      teacherName: 'Urwatun Nazihah, S.Pd.',
      room: 'Ruang Kelas 3 Bilal bin Rabbah',
      level: 'Al-Qur\'an & Gharibul Qur\'an',
      notes: 'Tadarus Al-Qur\'an tartil dan pengenalan bacaan khusus (gharib)',
      students: [
        { s: c5Zaid[4], lvl: 'Al-Qur\'an' },
        { s: c5Zaid[5], lvl: 'Al-Qur\'an' },
        { s: c6Fatimah[5], lvl: 'Al-Qur\'an' },
        { s: c6Fatimah[6], lvl: 'Gharibul Qur\'an' },
        { s: c6Muadz[4], lvl: 'Gharibul Qur\'an' },
        { s: c6Muadz[5], lvl: 'Gharibul Qur\'an' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_13',
      name: 'Rombel Al-Hakim',
      teacherId: 'GTK_YULIANINGSIH',
      teacherName: 'Yulianingsih',
      room: 'Ruang Kelas 3 Zainab binti Jahsyi',
      level: 'Gharibul Qur\'an & Tajwid Dasar',
      notes: 'Pendalaman isymam, imalah, tashil, saktah dan kaidah tajwid',
      students: [
        { s: c5Maryam[6], lvl: 'Gharibul Qur\'an' },
        { s: c5Zaid[6], lvl: 'Gharibul Qur\'an' },
        { s: c6Fatimah[7], lvl: 'Gharibul Qur\'an' },
        { s: c6Fatimah[8], lvl: 'Tajwid Dasar' },
        { s: c6Muadz[6], lvl: 'Tajwid Dasar' },
        { s: c6Muadz[7], lvl: 'Tajwid Dasar' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_14',
      name: 'Rombel Al-Barri',
      teacherId: 'GTK_ZAIDATUR_RAHMAH',
      teacherName: 'Zaidatur Rahmah',
      room: 'Ruang Perpustakaan',
      level: 'Tajwid Dasar & Tahfidz',
      notes: 'Penguatan teori ilmu tajwid praktis dan pembinaan tahfidz',
      students: [
        { s: c5Zaid[7], lvl: 'Tajwid Dasar' },
        { s: c5Zaid[8], lvl: 'Tajwid Dasar' },
        { s: c6Fatimah[9], lvl: 'Tajwid Dasar' },
        { s: c6Fatimah[10], lvl: 'Tajwid Dasar' },
        { s: c6Muadz[8], lvl: 'Tajwid Dasar' },
        { s: c6Muadz[9], lvl: 'Tajwid Dasar' }
      ]
    },
    {
      id: 'UMMI_ROMBEL_15',
      name: 'Rombel An-Nur',
      teacherId: 'GTK_APRILIA_AN_UMILLAH',
      teacherName: "Aprilia An'umillah, S.Pd.",
      room: 'Ruang Aula Utama',
      level: 'Munaqasyah & Pra-Khataman',
      notes: 'Binaan khusus Koordinator Ummi persiapan munaqasyah dan khataman',
      students: [
        { s: c5Maryam[7], lvl: 'Al-Qur\'an' },
        { s: c5Zaid[9], lvl: 'Al-Qur\'an' },
        { s: c6Fatimah[11], lvl: 'Gharibul Qur\'an' },
        { s: c6Fatimah[12], lvl: 'Tajwid Dasar' },
        { s: c6Muadz[10], lvl: 'Gharibul Qur\'an' },
        { s: c6Muadz[11], lvl: 'Tajwid Dasar' }
      ]
    }
  ];
  const ummiClassesPayload = {};
  const studentUpdates = {};
  const journalPayload = {};
  const academicGradeUpdates = {};
  for (const rombel of rombels) {
    const studentMap = {};
    for (const item of rombel.students) {
      if (!item.s || !item.s.id) continue;
      const sId = item.s.id;
      studentMap[sId] = {
        id: sId,
        name: item.s.name,
        classId: item.s.classId,
        level: item.lvl
      };
      studentUpdates[`students/${sId}/ummiClassId`] = rombel.id;
      studentUpdates[`students/${sId}/ummiLevel`] = item.lvl;
    }
    ummiClassesPayload[rombel.id] = {
      id: rombel.id,
      name: rombel.name,
      teacherId: rombel.teacherId,
      room: rombel.room,
      level: rombel.level,
      notes: rombel.notes,
      updatedAt: Date.now(),
      students: studentMap
    };
  }
  const sampleSessions = [
    { tm: 1, date: '2026-10-02', page: 'Hal. 10', mat: 'Pengenalan Fathah dan Kasrah', score: 95, pVer: true, pBy: 'Ayahanda', note: 'Makhraj murni dan tepat' },
    { tm: 2, date: '2026-10-05', page: 'Hal. 11', mat: 'Latihan Harakat Dhammah', score: 90, pVer: true, pBy: 'Ibunda', note: 'Sempat keliru huruf ro, bisa koreksi mandiri' },
    { tm: 3, date: '2026-10-08', page: 'Hal. 12', mat: 'Penyambungan Huruf Hijaiyah', score: 100, pVer: true, pBy: 'Orang Tua', note: 'Membaca tartil tanpa jeda salah' },
    { tm: 4, date: '2026-10-10', page: 'Hal. 13', mat: 'Penyambungan Huruf di Akhir Kata', score: 95, pVer: false, pBy: '', note: 'Bagus dan lancar' },
    { tm: 5, date: '2026-10-13', page: 'Hal. 14', mat: 'Evaluasi Pembacaan Kalimat Sederhana', score: 90, pVer: false, pBy: '', note: 'Sudah menguasai baris 1 s.d. 8' }
  ];
  for (const rombel of rombels) {
    for (const item of rombel.students.slice(0, 4)) {
      if (!item.s || !item.s.id) continue;
      const sId = item.s.id;
      journalPayload[sId] = {};
      let totalScore = 0;
      let count = 0;
      sampleSessions.forEach((sess, idx) => {
        const jId = `JRN_${sId}_${sess.tm}`;
        const pred = sess.score >= 100 ? 'A+' : (sess.score >= 95 ? 'A' : (sess.score >= 90 ? 'B+' : (sess.score >= 85 ? 'B' : (sess.score >= 80 ? 'B-' : (sess.score >= 75 ? 'C+' : 'C')))));
        const act = sess.score >= 85 ? 'Naik ke halaman berikutnya' : (sess.score >= 80 ? 'Naik, tapi diulangi dulu halaman tsb' : 'Belum boleh dinaikkan / diulangi lagi');
        journalPayload[sId][jId] = {
          id: jId,
          meetingNo: sess.tm,
          meetingNumber: sess.tm,
          date: sess.date,
          level: item.lvl,
          page: sess.page,
          pageOrAyat: sess.page,
          material: sess.mat,
          score: sess.score,
          predicate: pred,
          action: act,
          teacherName: rombel.teacherName,
          teacherId: rombel.teacherId,
          teacherVerified: true,
          parentVerified: sess.pVer,
          parentVerifiedBy: sess.pBy,
          note: sess.note,
          notes: sess.note,
          createdAt: Date.now() - ((5 - idx) * 86400000)
        };
        totalScore += sess.score;
        count++;
      });
      const avg = Math.round(totalScore / count);
      const desc = `Tuntas pada pembelajaran Al-Qur'an Metode Ummi tingkat ${item.lvl} dengan rata-rata capaian harian ${avg}. Membaca dengan tartil, fashih, dan aktif menyimak bimbingan di ${rombel.room}.`;
      academicGradeUpdates[`academic_grades/${gradeKey}/${sId}/SUB_BTQ`] = {
        score: avg,
        desc: desc,
        updatedAt: Date.now()
      };
      academicGradeUpdates[`academic_grades/2024/2025_1/${sId}/SUB_BTQ`] = {
        score: avg,
        desc: desc,
        updatedAt: Date.now()
      };
    }
  }
  const sampleExams = {
    'EXAM_001': {
      id: 'EXAM_001',
      studentId: c1Abu[2].id,
      studentName: c1Abu[2].name,
      currentLevel: 'Jilid 1',
      targetLevel: 'Jilid 2',
      teacherId: 'GTK_AISYAH_HANI_SULAIMAN',
      teacherName: 'Aisyah Hani Sulaiman',
      notes: 'Ananda sudah menuntaskan jilid 1 dengan halaman terakhir predikat A+ secara berturut-turut.',
      requestDate: '2026-10-12',
      status: 'pending'
    },
    'EXAM_002': {
      id: 'EXAM_002',
      studentId: c2Utsman[1].id,
      studentName: c2Utsman[1].name,
      currentLevel: 'Jilid 3',
      targetLevel: 'Jilid 4',
      teacherId: 'GTK_BIBI_MUTHLIATIL_JANNAH',
      teacherName: 'Bibi Muthliatil Jannah, S.Pd.',
      notes: 'Sudah menguasai tanwin dan sukun, siap munaqasyah jilid 4.',
      requestDate: '2026-10-11',
      status: 'scheduled',
      scheduledDate: '2026-10-16',
      examinerId: 'GTK_APRILIA_AN_UMILLAH',
      examinerName: "Aprilia An'umillah, S.Pd."
    },
    'EXAM_003': {
      id: 'EXAM_003',
      studentId: c6Fatimah[0].id,
      studentName: c6Fatimah[0].name,
      currentLevel: 'Jilid 5',
      targetLevel: 'Jilid 6',
      teacherId: 'GTK_FITRIANING_DANIYAH_FIJRIANI',
      teacherName: 'Fitrianing Daniyah Fijriani',
      notes: 'Penguasaan wakaf dan tajwid sangat baik, siap lanjut ke Jilid 6.',
      requestDate: '2026-10-08',
      status: 'passed',
      scheduledDate: '2026-10-10',
      examinerId: 'GTK_APRILIA_AN_UMILLAH',
      examinerName: "Aprilia An'umillah, S.Pd.",
      examScore: 98,
      decisionNotes: 'Lolos munaqasyah dengan predikat Mumtaz (Istimewa).',
      decidedAt: Date.now() - 172800000
    },
    'EXAM_004': {
      id: 'EXAM_004',
      studentId: c4Abdur[1].id,
      studentName: c4Abdur[1].name,
      currentLevel: 'Jilid 4',
      targetLevel: 'Jilid 5',
      teacherId: 'GTK_DEWI_NUR_MASLIHAH',
      teacherName: 'Dewi Nur Maslihah, S.Pd.',
      notes: 'Pengajuan munaqasyah kenaikan jilid 5.',
      requestDate: '2026-10-09',
      status: 'rejected',
      decisionNotes: 'Perlu pemantapan dengung pada hukum Ikhfa Haqiqi dan Idgham Bighunnah di halaman 24-30 sebelum diajukan kembali.',
      decidedAt: Date.now() - 86400000
    }
  };
  console.log('Menyimpan rooms ke RTDB...');
  await db.ref('rooms').set(roomsPayload);
  console.log('Menyimpan 15 Rombel Ummi ke RTDB...');
  await db.ref('ummi_classes').set(ummiClassesPayload);
  console.log('Memperbarui level dan rombel siswa di RTDB...');
  await db.ref().update(studentUpdates);
  console.log('Menyimpan jurnal prestasi ke RTDB...');
  await db.ref('ummi_journals').set(journalPayload);
  console.log('Menyinkronkan nilai rapor BTQ...');
  await db.ref().update(academicGradeUpdates);
  console.log('Menyimpan data ujian kenaikan...');
  await db.ref('ummi_exams').set(sampleExams);
  console.log('Selesai! 15 Rombel untuk 15 Guru Ummi dengan lokasi ruang dan data siswa berhasil dicatat di RTDB!');
  process.exit(0);
}
runSeed().catch(err => {
  console.error('Gagal:', err);
  process.exit(1);
});
