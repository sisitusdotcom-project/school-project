const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const path = require('path');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

const rombelUmmiMap = {
  // Sesi 1: 09:30 - 11:00 (Senin - Kamis, period 5)
  'CLASS_1_ABU_BAKAR_ASH_SHIDDIQ': {
    lead: 'GTK_AISYAH_HANI_SULAIMAN',
    coTeacherId: 'GTK_DEWI_NUR_MASLIHAH',
    teachers: ['GTK_AISYAH_HANI_SULAIMAN', 'GTK_DEWI_NUR_MASLIHAH'],
    teacherName: 'Ustdz. Aisyah Hani & Ustdz. Dewi Nur Maslihah'
  },
  'CLASS_1_UMAR_BIN_KHATTAB': {
    lead: 'GTK_ZAIDATUR_RAHMAH',
    coTeacherId: 'GTK_LAYYINANTUS_SANIYYAH',
    teachers: ['GTK_ZAIDATUR_RAHMAH', 'GTK_LAYYINANTUS_SANIYYAH'],
    teacherName: 'Ustdz. Zaidatur Rahmah & Ustdz. Layyinantus'
  },
  'CLASS_1_AISYAH_BINTI_ABU_BAKAR': {
    lead: 'GTK_BIBI_MUTHLIATIL_JANNAH',
    coTeacherId: 'GTK_URWATUN_NAZIHAH',
    teachers: ['GTK_BIBI_MUTHLIATIL_JANNAH', 'GTK_URWATUN_NAZIHAH'],
    teacherName: 'Ustdz. Bibi Muthliatil & Ustdz. Urwatun Nazihah'
  },
  'CLASS_2_UTSMAN_BIN_AFFAN': {
    lead: 'GTK_FITRIANING_DANIYAH_FIJRIANI',
    coTeacherId: 'GTK_ISMATUL_KHUSNAH',
    teachers: ['GTK_FITRIANING_DANIYAH_FIJRIANI', 'GTK_ISMATUL_KHUSNAH'],
    teacherName: 'Ustdz. Fitrianing & Ustdz. Ismatul Khusnah'
  },
  'CLASS_2_KHADIJAH_BINTI_KHUWAILID': {
    lead: 'GTK_SILVANA_IZZA_RAHMA_DEWI',
    coTeacherId: 'GTK_YULIANINGSIH',
    teachers: ['GTK_SILVANA_IZZA_RAHMA_DEWI', 'GTK_YULIANINGSIH'],
    teacherName: 'Ustdz. Silvana Izza & Ustdz. Yulianingsih'
  },
  'CLASS_2_SALMAN_AL_FARISI': {
    lead: 'GTK_NUR_ABIDHATUL_LAILIYAH',
    coTeacherId: 'GTK_FUAIDA_RAHMAH',
    teachers: ['GTK_NUR_ABIDHATUL_LAILIYAH', 'GTK_FUAIDA_RAHMAH', 'GTK_NANIK'],
    teacherName: 'Ustdz. Nur Abidhatul, Ustdz. Fuaida & Ustdz. Nanik'
  },

  // Sesi 2: 11:00 - 12:30 (Senin - Kamis, period 6/7)
  'CLASS_3_BILAL_BIN_RABBAH': {
    lead: 'GTK_DEWI_NUR_MASLIHAH',
    coTeacherId: 'GTK_YULIANINGSIH',
    teachers: ['GTK_DEWI_NUR_MASLIHAH', 'GTK_YULIANINGSIH'],
    teacherName: 'Ustdz. Dewi Nur Maslihah & Ustdz. Yulianingsih'
  },
  'CLASS_3_ALI_BIN_ABI_THALIB': {
    lead: 'GTK_LAYYINANTUS_SANIYYAH',
    coTeacherId: 'GTK_URWATUN_NAZIHAH',
    teachers: ['GTK_LAYYINANTUS_SANIYYAH', 'GTK_URWATUN_NAZIHAH'],
    teacherName: 'Ustdz. Layyinantus & Ustdz. Urwatun Nazihah'
  },
  'CLASS_3_ZAINAB_BINTI_JAHSYI': {
    lead: 'GTK_BIBI_MUTHLIATIL_JANNAH',
    coTeacherId: 'GTK_NANIK',
    teachers: ['GTK_BIBI_MUTHLIATIL_JANNAH', 'GTK_NANIK'],
    teacherName: 'Ustdz. Bibi Muthliatil & Ustdz. Nanik'
  },
  'CLASS_4_ABDURRAHMAN_BIN_AUF': {
    lead: 'GTK_FITRIANING_DANIYAH_FIJRIANI',
    coTeacherId: 'GTK_ISMATUL_KHUSNAH',
    teachers: ['GTK_FITRIANING_DANIYAH_FIJRIANI', 'GTK_ISMATUL_KHUSNAH'],
    teacherName: 'Ustdz. Fitrianing & Ustdz. Ismatul Khusnah'
  },
  'CLASS_4_KHALID_BIN_WALID': {
    lead: 'GTK_ZAIDATUR_RAHMAH',
    coTeacherId: 'GTK_SILVANA_IZZA_RAHMA_DEWI',
    teachers: ['GTK_ZAIDATUR_RAHMAH', 'GTK_SILVANA_IZZA_RAHMA_DEWI'],
    teacherName: 'Ustdz. Zaidatur Rahmah & Ustdz. Silvana Izza'
  },
  'CLASS_4_HAFSHAH_BINTI_UMAR': {
    lead: 'GTK_AISYAH_HANI_SULAIMAN',
    coTeacherId: 'GTK_NUR_ABIDHATUL_LAILIYAH',
    teachers: ['GTK_AISYAH_HANI_SULAIMAN', 'GTK_NUR_ABIDHATUL_LAILIYAH', 'GTK_FUAIDA_RAHMAH'],
    teacherName: 'Ustdz. Aisyah Hani, Ustdz. Nur Abidhatul & Ustdz. Fuaida'
  },

  // Sesi 3: 07:30 - 09:00 (Senin - Kamis, period 2/3)
  'CLASS_5_MARYAM_BINTI_IMRAN': {
    lead: 'GTK_DEWI_NUR_MASLIHAH',
    coTeacherId: 'GTK_URWATUN_NAZIHAH',
    teachers: ['GTK_DEWI_NUR_MASLIHAH', 'GTK_URWATUN_NAZIHAH'],
    teacherName: 'Ustdz. Dewi Nur Maslihah & Ustdz. Urwatun Nazihah'
  },
  'CLASS_5_ZAID_BIN_TSABIT': {
    lead: 'GTK_BIBI_MUTHLIATIL_JANNAH',
    coTeacherId: 'GTK_LAYYINANTUS_SANIYYAH',
    teachers: ['GTK_BIBI_MUTHLIATIL_JANNAH', 'GTK_LAYYINANTUS_SANIYYAH', 'GTK_NANIK', 'GTK_SILVANA_IZZA_RAHMA_DEWI'],
    teacherName: 'Ustdz. Bibi Muthliatil, Ustdz. Layyin, Ustdz. Nanik & Ustdz. Silvana'
  },
  'CLASS_6_MU_ADZ_BIN_JABAL': {
    lead: 'GTK_FITRIANING_DANIYAH_FIJRIANI',
    coTeacherId: 'GTK_ISMATUL_KHUSNAH',
    teachers: ['GTK_FITRIANING_DANIYAH_FIJRIANI', 'GTK_ISMATUL_KHUSNAH'],
    teacherName: 'Ustdz. Fitrianing & Ustdz. Ismatul Khusnah'
  },
  'CLASS_6_FATIMAH_BINTI_MUHAMMAD': {
    lead: 'GTK_ZAIDATUR_RAHMAH',
    coTeacherId: 'GTK_FUAIDA_RAHMAH',
    teachers: ['GTK_ZAIDATUR_RAHMAH', 'GTK_FUAIDA_RAHMAH', 'GTK_MARYAM', 'GTK_AISYAH_HANI_SULAIMAN', 'GTK_NUR_ABIDHATUL_LAILIYAH', 'GTK_YULIANINGSIH'],
    teacherName: 'Ustdz. Zaidatur, Ustdz. Fuaida, Ustdz. Maryam & Tim Ummi K6'
  }
};

async function applySSOTMapping() {
  console.log('Fetching classes & schedules from RTDB...');
  const [classesSnap, schedSnap] = await Promise.all([
    db.ref('classes').once('value'),
    db.ref('curriculum/schedules').once('value')
  ]);

  const classes = classesSnap.val() || {};
  const schedules = schedSnap.val() || {};

  // 1. Update classes[classId].subjectTeachers.SUB_BTQ to lead teacher
  const classUpdates = {};
  for (const [classId, map] of Object.entries(rombelUmmiMap)) {
    if (classes[classId]) {
      classUpdates[`classes/${classId}/subjectTeachers/SUB_BTQ`] = map.lead;
    }
  }
  await db.ref().update(classUpdates);
  console.log(`Updated classes subjectTeachers for 16 rombels.`);

  // 2. Prepare cleaned schedules: remove slot_ummi_... and update regular BTQ slots
  const cleanedSchedules = {};
  let removedCount = 0;
  let updatedBTQCount = 0;

  for (const [id, slot] of Object.entries(schedules)) {
    if (id.startsWith('slot_ummi_')) {
      removedCount++;
      continue;
    }
    const s = { ...slot };
    if (s.subjectId === 'SUB_BTQ' || s.isUmmi || (s.subjectName && s.subjectName.toLowerCase().includes('btq'))) {
      const map = rombelUmmiMap[s.classId];
      if (map) {
        s.teacherId = map.lead;
        s.coTeacherId = map.coTeacherId;
        s.teachers = map.teachers;
        s.teacherName = map.teacherName;
        s.isUmmi = true;
        s.subjectName = 'BTQ & Tahfidz';
        s.subjectId = 'SUB_BTQ';
        updatedBTQCount++;
      }
    }
    cleanedSchedules[id] = s;
  }

  console.log(`Removed ${removedCount} duplicate slot_ummi_ slots.`);
  console.log(`Updated ${updatedBTQCount} regular BTQ slots.`);
  console.log(`Final schedules count: ${Object.keys(cleanedSchedules).length}`);

  // 3. Save cleaned schedules to curriculum/schedules & curriculum/master_template
  await db.ref('curriculum/schedules').set(cleanedSchedules);
  await db.ref('curriculum/master_template').set(cleanedSchedules);
  console.log('Successfully saved to RTDB curriculum/schedules and curriculum/master_template!');

  process.exit(0);
}

applySSOTMapping().catch(err => {
  console.error('Failed to apply SSOT mapping:', err);
  process.exit(1);
});
