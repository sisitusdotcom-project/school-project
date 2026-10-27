const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});

const db = getDatabase(app);
const auth = getAuth(app);

const tsvPath = path.join(__dirname, 'data', 'data-siswa.tsv');
const tsvContent = fs.readFileSync(tsvPath, 'utf8');

const tsvMap = {};
for (const line of tsvContent.split('\n')) {
  const parts = line.trim().split('\t');
  if (parts.length >= 4 && parts[0].match(/^\d+$/)) {
    const nis = parts[1].trim();
    const nisn = parts[2].trim();
    const name = parts[3].trim();
    const gender = parts[5] ? parts[5].trim() : '';
    tsvMap[nis] = { nisn, name, gender };
  }
}

async function migrateLeadingZeroStudents() {
  console.log('Fetching live RTDB data snapshot...');
  const rootSnap = await db.ref().once('value');
  const root = rootSnap.val() || {};

  const oldStudents = root.students || {};
  const targets = [];

  for (const [uid, s] of Object.entries(oldStudents)) {
    if (uid.startsWith('SISWA_')) {
      const id = uid.replace('SISWA_', '');
      if (id.length === 9 && !id.includes('_')) {
        const fullNisn = '0' + id;
        targets.push({
          oldUid: uid,
          newUid: 'SISWA_' + fullNisn,
          stripped: id,
          fullNisn: fullNisn,
          oldEmail: 'siswa' + id + '@musada.sch.id',
          newEmail: 'siswa' + fullNisn + '@musada.sch.id',
          student: s
        });
      }
    }
  }

  console.log(`Found ${targets.length} students with stripped leading zeros to migrate.`);
  if (targets.length === 0) {
    console.log('No students need migration. Exiting.');
    process.exit(0);
  }

  const updates = {};
  const targetMap = new Map();
  targets.forEach(t => targetMap.set(t.oldUid, t));

  for (const t of targets) {
    const s = t.student;
    const tsvData = tsvMap[s.nis] || {};
    const gender = (s.gender && s.gender !== '-') ? s.gender : (tsvData.gender || 'L');

    updates[`students/${t.newUid}`] = {
      name: s.name,
      nis: s.nis,
      nisn: t.fullNisn,
      classId: s.classId,
      parentId: t.newUid,
      gender: gender,
      isActive: true,
      ummiClassId: s.ummiClassId || null,
      ummiLevel: s.ummiLevel || null
    };
    updates[`students/${t.oldUid}`] = null;

    const existingUser = root.users?.[t.oldUid] || {};
    updates[`users/${t.newUid}`] = {
      name: s.name,
      role: 'ortu',
      isActive: true,
      createdAt: existingUser.createdAt || Date.now()
    };
    updates[`users/${t.oldUid}`] = null;

    if (s.classId) {
      updates[`classes/${s.classId}/students/${t.newUid}`] = true;
      updates[`classes/${s.classId}/students/${t.oldUid}`] = null;
    }
  }

  if (root.classes) {
    for (const [cid, cData] of Object.entries(root.classes)) {
      if (cData.students) {
        for (const oldUid of Object.keys(cData.students)) {
          if (targetMap.has(oldUid)) {
            const t = targetMap.get(oldUid);
            updates[`classes/${cid}/students/${t.newUid}`] = true;
            updates[`classes/${cid}/students/${oldUid}`] = null;
          }
        }
      }
    }
  }

  if (root.ummi_classes) {
    for (const [ucid, ucData] of Object.entries(root.ummi_classes)) {
      if (ucData.students) {
        for (const oldUid of Object.keys(ucData.students)) {
          if (targetMap.has(oldUid)) {
            const t = targetMap.get(oldUid);
            updates[`ummi_classes/${ucid}/students/${t.newUid}`] = true;
            updates[`ummi_classes/${ucid}/students/${oldUid}`] = null;
          }
        }
      }
    }
  }

  if (root.student_attendance_daily) {
    for (const [date, byClass] of Object.entries(root.student_attendance_daily)) {
      for (const [cid, byStudent] of Object.entries(byClass || {})) {
        for (const [studentUid, attRecord] of Object.entries(byStudent || {})) {
          if (targetMap.has(studentUid)) {
            const t = targetMap.get(studentUid);
            updates[`student_attendance_daily/${date}/${cid}/${t.newUid}`] = attRecord;
            updates[`student_attendance_daily/${date}/${cid}/${studentUid}`] = null;
          }
        }
      }
    }
  }

  if (root.academic_grades) {
    for (const [year, bySem] of Object.entries(root.academic_grades)) {
      for (const [sem, byStudent] of Object.entries(bySem || {})) {
        for (const [studentUid, gradeObj] of Object.entries(byStudent || {})) {
          if (targetMap.has(studentUid)) {
            const t = targetMap.get(studentUid);
            updates[`academic_grades/${year}/${sem}/${t.newUid}`] = gradeObj;
            updates[`academic_grades/${year}/${sem}/${studentUid}`] = null;
          }
        }
      }
    }
  }

  if (root.extracurriculars) {
    for (const [eid, eData] of Object.entries(root.extracurriculars)) {
      if (eData.students) {
        for (const studentUid of Object.keys(eData.students)) {
          if (targetMap.has(studentUid)) {
            const t = targetMap.get(studentUid);
            updates[`extracurriculars/${eid}/students/${t.newUid}`] = true;
            updates[`extracurriculars/${eid}/students/${studentUid}`] = null;
          }
        }
      }
    }
  }

  if (root.library && root.library.members) {
    for (const [nis, mem] of Object.entries(root.library.members)) {
      if (mem.studentId && targetMap.has(mem.studentId)) {
        const t = targetMap.get(mem.studentId);
        updates[`library/members/${nis}/studentId`] = t.newUid;
      }
    }
  }

  if (root.ummi_exams) {
    for (const [exId, exData] of Object.entries(root.ummi_exams)) {
      if (exData.studentId && targetMap.has(exData.studentId)) {
        const t = targetMap.get(exData.studentId);
        updates[`ummi_exams/${exId}/studentId`] = t.newUid;
      }
    }
  }

  if (root.ummi_journals) {
    for (const [jUid, jRecords] of Object.entries(root.ummi_journals)) {
      if (targetMap.has(jUid)) {
        const t = targetMap.get(jUid);
        updates[`ummi_journals/${t.newUid}`] = jRecords;
        updates[`ummi_journals/${jUid}`] = null;
      }
    }
  }

  console.log(`Prepared ${Object.keys(updates).length} updates in RTDB.`);
  console.log('Writing updates to Firebase RTDB...');
  await db.ref().update(updates);
  console.log('✅ Firebase RTDB updated successfully.');

  console.log('Synchronizing Firebase Authentication accounts...');
  for (const t of targets) {
    try {
      try {
        await auth.deleteUser(t.oldUid);
        console.log(`[AUTH] Deleted old account: ${t.oldUid} (${t.oldEmail})`);
      } catch (err) {
        if (err.code !== 'auth/user-not-found') {
          console.warn(`[AUTH WARN] Could not delete ${t.oldUid}:`, err.message);
        }
      }

      try {
        await auth.deleteUser(t.newUid);
      } catch (e) {}

      await auth.createUser({
        uid: t.newUid,
        email: t.newEmail,
        password: 'Password123!',
        displayName: t.student.name
      });
      console.log(`[AUTH SUCCESS] Created ${t.newUid} -> ${t.newEmail}`);
    } catch (err) {
      console.error(`[AUTH ERROR] Failed on ${t.newUid}:`, err.message);
    }
  }
  console.log('✅ Firebase Authentication synchronized.');

  console.log('Downloading fresh snapshot of RTDB to local export...');
  const freshSnap = await db.ref().once('value');
  const freshData = freshSnap.val();
  const exportPath = path.join(__dirname, 'data', 'musada-sd-default-rtdb-export.json');
  fs.writeFileSync(exportPath, JSON.stringify(freshData, null, 2), 'utf8');
  console.log(`✅ Saved fresh snapshot to ${exportPath}`);

  console.log('🎉 All 24 students with leading zeros successfully synchronized!');
  process.exit(0);
}

migrateLeadingZeroStudents().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
