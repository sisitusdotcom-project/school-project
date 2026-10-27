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

async function runMigration() {
  console.log('Fetching live database snapshot...');
  const rootSnap = await db.ref().once('value');
  const root = rootSnap.val() || {};

  const students = root.students || {};
  const uidMap = {};
  const studentMeta = {};
  let maxNis = 0;

  for (const [uid, s] of Object.entries(students)) {
    if (!s || !s.nis) {
      console.warn(`[WARN] Student without NIS: ${uid}`, s);
      continue;
    }
    const cleanNis = String(s.nis).trim().padStart(4, '0');
    const n = parseInt(cleanNis, 10);
    if (!isNaN(n) && n > maxNis) maxNis = n;

    const newUid = 'SISWA_' + cleanNis;
    uidMap[uid] = newUid;
    studentMeta[newUid] = {
      nis: cleanNis,
      name: s.name || '',
      email: `siswa${cleanNis}@musada.sch.id`
    };
  }

  const oldUids = Object.keys(uidMap);
  console.log(`Mapped ${oldUids.length} students to NIS-based UIDs. Max NIS is ${maxNis} (formatted: ${String(maxNis).padStart(4, '0')}).`);

  const updates = {};

  for (const [oldUid, newUid] of Object.entries(uidMap)) {
    const s = students[oldUid];
    const cleanNis = studentMeta[newUid].nis;
    updates[`students/${newUid}`] = {
      ...s,
      nis: cleanNis,
      parentId: newUid
    };
    if (oldUid !== newUid) {
      updates[`students/${oldUid}`] = null;
    }

    const u = root.users?.[oldUid] || {};
    updates[`users/${newUid}`] = {
      name: s.name,
      role: 'ortu',
      isActive: true,
      createdAt: u.createdAt || Date.now()
    };
    if (oldUid !== newUid) {
      updates[`users/${oldUid}`] = null;
    }
  }

  if (root.classes) {
    for (const [classId, c] of Object.entries(root.classes)) {
      if (c.students) {
        for (const [stuId, val] of Object.entries(c.students)) {
          if (uidMap[stuId]) {
            const newUid = uidMap[stuId];
            updates[`classes/${classId}/students/${newUid}`] = true;
            if (stuId !== newUid) {
              updates[`classes/${classId}/students/${stuId}`] = null;
            }
          }
        }
      }
    }
  }

  if (root.ummi_classes) {
    for (const [uClassId, uc] of Object.entries(root.ummi_classes)) {
      if (uc.students) {
        for (const [stuId, val] of Object.entries(uc.students)) {
          if (uidMap[stuId]) {
            const newUid = uidMap[stuId];
            updates[`ummi_classes/${uClassId}/students/${newUid}`] = true;
            if (stuId !== newUid) {
              updates[`ummi_classes/${uClassId}/students/${stuId}`] = null;
            }
          }
        }
      }
    }
  }

  if (root.student_attendance_daily) {
    for (const [date, classes] of Object.entries(root.student_attendance_daily)) {
      for (const [classId, stus] of Object.entries(classes || {})) {
        for (const [stuId, rec] of Object.entries(stus || {})) {
          if (uidMap[stuId]) {
            const newUid = uidMap[stuId];
            updates[`student_attendance_daily/${date}/${classId}/${newUid}`] = rec;
            if (stuId !== newUid) {
              updates[`student_attendance_daily/${date}/${classId}/${stuId}`] = null;
            }
          }
        }
      }
    }
  }

  if (root.academic_grades) {
    for (const [year, sems] of Object.entries(root.academic_grades)) {
      for (const [sem, stus] of Object.entries(sems || {})) {
        for (const [stuId, grade] of Object.entries(stus || {})) {
          if (uidMap[stuId]) {
            const newUid = uidMap[stuId];
            updates[`academic_grades/${year}/${sem}/${newUid}`] = grade;
            if (stuId !== newUid) {
              updates[`academic_grades/${year}/${sem}/${stuId}`] = null;
            }
          }
        }
      }
    }
  }

  if (root.extracurriculars) {
    for (const [eId, eks] of Object.entries(root.extracurriculars)) {
      if (eks.students) {
        for (const [stuId, val] of Object.entries(eks.students)) {
          if (uidMap[stuId]) {
            const newUid = uidMap[stuId];
            updates[`extracurriculars/${eId}/students/${newUid}`] = true;
            if (stuId !== newUid) {
              updates[`extracurriculars/${eId}/students/${stuId}`] = null;
            }
          }
        }
      }
    }
  }

  if (root.ekstra && root.ekstra.attendance) {
    for (const [attId, attObj] of Object.entries(root.ekstra.attendance)) {
      if (attObj.records) {
        for (const [stuId, val] of Object.entries(attObj.records)) {
          if (uidMap[stuId]) {
            const newUid = uidMap[stuId];
            updates[`ekstra/attendance/${attId}/records/${newUid}`] = val;
            if (stuId !== newUid) {
              updates[`ekstra/attendance/${attId}/records/${stuId}`] = null;
            }
          }
        }
      }
    }
  }

  if (root.library && root.library.members) {
    for (const [nis, mem] of Object.entries(root.library.members)) {
      if (mem.studentId && uidMap[mem.studentId]) {
        updates[`library/members/${nis}/studentId`] = uidMap[mem.studentId];
      }
    }
  }

  if (root.assessments) {
    for (const [period, stus] of Object.entries(root.assessments)) {
      for (const [stuId, assessData] of Object.entries(stus || {})) {
        if (uidMap[stuId]) {
          const newUid = uidMap[stuId];
          updates[`assessments/${period}/${newUid}`] = assessData;
          if (stuId !== newUid) {
            updates[`assessments/${period}/${stuId}`] = null;
          }
        }
      }
    }
  }

  if (root.ummi_exams) {
    for (const [examId, exam] of Object.entries(root.ummi_exams)) {
      if (exam.studentId && uidMap[exam.studentId]) {
        updates[`ummi_exams/${examId}/studentId`] = uidMap[exam.studentId];
      }
    }
  }

  if (root.ummi_journals) {
    for (const [stuId, jRecords] of Object.entries(root.ummi_journals)) {
      if (uidMap[stuId]) {
        const newUid = uidMap[stuId];
        updates[`ummi_journals/${newUid}`] = jRecords;
        if (stuId !== newUid) {
          updates[`ummi_journals/${stuId}`] = null;
        }
      }
    }
  }

  if (root.finance && root.finance.student_bills) {
    for (const [billId, bill] of Object.entries(root.finance.student_bills)) {
      if (bill.studentId && uidMap[bill.studentId]) {
        updates[`finance/student_bills/${billId}/studentId`] = uidMap[bill.studentId];
      }
    }
  }

  if (root.observations) {
    for (const [obsId, obs] of Object.entries(root.observations)) {
      if (obs.studentId && uidMap[obs.studentId]) {
        updates[`observations/${obsId}/studentId`] = uidMap[obs.studentId];
      }
    }
  }

  updates['settings/lastNis'] = maxNis;

  const totalKeys = Object.keys(updates).length;
  console.log(`Generated ${totalKeys} update paths for RTDB.`);

  console.log('Writing batch updates to Firebase RTDB in chunks of 500...');
  const entries = Object.entries(updates);
  const CHUNK_SIZE = 500;
  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunk = Object.fromEntries(entries.slice(i, i + CHUNK_SIZE));
    await db.ref().update(chunk);
    console.log(`[RTDB] Written chunk ${Math.floor(i / CHUNK_SIZE) + 1} / ${Math.ceil(entries.length / CHUNK_SIZE)}`);
  }
  console.log('✅ Firebase RTDB updated successfully.');

  console.log('Synchronizing Firebase Authentication accounts for 378 students...');
  let existingAuthUsers = [];
  let pageToken;
  do {
    const list = await auth.listUsers(1000, pageToken);
    for (const u of list.users) {
      if (u.uid.startsWith('SISWA_') || (u.email && u.email.startsWith('siswa'))) {
        existingAuthUsers.push(u);
      }
    }
    pageToken = list.pageToken;
  } while (pageToken);

  console.log(`Found ${existingAuthUsers.length} existing student accounts in Firebase Auth.`);

  const validNewUids = new Set(Object.values(uidMap));

  for (const existing of existingAuthUsers) {
    if (!validNewUids.has(existing.uid)) {
      try {
        await auth.deleteUser(existing.uid);
        console.log(`[AUTH CLEAN] Deleted obsolete student account: ${existing.uid} (${existing.email})`);
      } catch (err) {
        console.warn(`[AUTH WARN] Could not delete ${existing.uid}:`, err.message);
      }
    }
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (const [newUid, meta] of Object.entries(studentMeta)) {
    try {
      let existingUser = null;
      try {
        existingUser = await auth.getUser(newUid);
      } catch (e) {
        if (e.code !== 'auth/user-not-found') throw e;
      }

      if (existingUser) {
        await auth.updateUser(newUid, {
          email: meta.email,
          displayName: meta.name
        });
        updatedCount++;
      } else {
        await auth.createUser({
          uid: newUid,
          email: meta.email,
          password: 'Password123!',
          displayName: meta.name
        });
        createdCount++;
      }
    } catch (err) {
      console.error(`[AUTH ERROR] On ${newUid} (${meta.email}):`, err.message);
    }
  }

  console.log(`✅ Firebase Authentication synced: ${createdCount} created, ${updatedCount} updated.`);

  console.log('Downloading fresh snapshot of RTDB to local export...');
  const freshSnap = await db.ref().once('value');
  const freshData = freshSnap.val();
  const exportPath = path.join(__dirname, 'data', 'musada-sd-default-rtdb-export.json');
  fs.writeFileSync(exportPath, JSON.stringify(freshData, null, 2), 'utf8');
  console.log(`✅ Fresh snapshot saved to ${exportPath}`);

  console.log('🎉 Full NIS SSOT migration completed successfully!');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
