const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const path = require('path');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

async function fullAudit() {
  const [usersSnap, classesSnap, subjectsSnap, schedulesSnap] = await Promise.all([
    db.ref('users').once('value'),
    db.ref('classes').once('value'),
    db.ref('subjects').once('value'),
    db.ref('curriculum/schedules').once('value')
  ]);

  const users = usersSnap.val() || {};
  const classes = classesSnap.val() || {};
  const subjects = subjectsSnap.val() || {};
  const schedules = schedulesSnap.val() || {};

  console.log('=== FULL SSOT AUDIT ===');
  console.log(`Users: ${Object.keys(users).length}`);
  console.log(`Classes: ${Object.keys(classes).length}`);
  console.log(`Subjects: ${Object.keys(subjects).length}`);
  console.log(`Schedules: ${Object.keys(schedules).length}`);

  // 1. Check if users has virtual user TIM_UMMI
  if (users.TIM_UMMI) {
    console.log('\n[NOTE] users/TIM_UMMI exists:', JSON.stringify(users.TIM_UMMI));
  }

  // 2. Audit Classes: Walas & Subject Teachers
  console.log('\n=== AUDIT CLASSES ===');
  for (const [classId, c] of Object.entries(classes)) {
    const walas = users[c.teacherId];
    console.log(`\nClass: ${classId} (${c.name})`);
    console.log(`  Walas ID: ${c.teacherId} (${walas ? walas.name : 'UNKNOWN'})`);
    console.log(`  Subject Teachers count: ${Object.keys(c.subjectTeachers || {}).length}`);
    for (const [subId, tId] of Object.entries(c.subjectTeachers || {})) {
      const sub = subjects[subId];
      const teacher = users[tId];
      if (!sub) console.log(`    [WARN] Unknown subjectId ${subId} in class ${classId}`);
      if (!teacher) console.log(`    [WARN] Unknown teacherId ${tId} for subject ${subId} in class ${classId}`);
    }
  }

  // 3. Audit Schedules vs Classes & Subjects & Teachers
  console.log('\n=== AUDIT SCHEDULES VS SSOT ===');
  let missingClassInSchedule = 0;
  let missingSubjectInSchedule = 0;
  let missingTeacherInSchedule = 0;
  let scheduleMismatchesWithClassTeachers = [];

  for (const [slotId, s] of Object.entries(schedules)) {
    if (!classes[s.classId]) {
      missingClassInSchedule++;
    }
    if (s.subjectId && !subjects[s.subjectId]) {
      missingSubjectInSchedule++;
    }
    if (s.teacherId && !users[s.teacherId]) {
      missingTeacherInSchedule++;
    }

    // Check if the scheduled teacher matches class subjectTeacher
    if (s.classId && s.subjectId && classes[s.classId] && classes[s.classId].subjectTeachers) {
      const assignedTeacherId = classes[s.classId].subjectTeachers[s.subjectId];
      if (assignedTeacherId && s.teacherId && assignedTeacherId !== s.teacherId && !s.isUmmi) {
        scheduleMismatchesWithClassTeachers.push({
          slotId,
          classId: s.classId,
          subjectId: s.subjectId,
          schedTeacher: `${s.teacherName} (${s.teacherId})`,
          classTeacher: assignedTeacherId
        });
      }
    }
  }

  console.log(`Missing classes in schedules: ${missingClassInSchedule}`);
  console.log(`Missing subjects in schedules: ${missingSubjectInSchedule}`);
  console.log(`Missing teachers in schedules: ${missingTeacherInSchedule}`);
  console.log(`Schedule vs Class SubjectTeacher mismatches: ${scheduleMismatchesWithClassTeachers.length}`);
  if (scheduleMismatchesWithClassTeachers.length > 0) {
    console.log('Sample mismatches:');
    scheduleMismatchesWithClassTeachers.slice(0, 10).forEach(m => {
      console.log(`  ${m.classId} | ${m.subjectId}: Sched=${m.schedTeacher} vs ClassTeacher=${m.classTeacher}`);
    });
  }

  // 4. Audit Conflicts in Schedules
  const cachedConflicts = {};
  const slots = Object.entries(schedules).map(([id, s]) => ({ id, ...s })).filter(s => s && s.day && (s.teacherId || (s.teachers && s.teachers.length)) && s.type !== 'break' && s.type !== 'ishoma');
  const bucket = {};
  slots.forEach(s => {
    const pKey = s.period || s.startTime;
    const tIds = (s.teachers && s.teachers.length) ? s.teachers : [s.teacherId, s.coTeacherId].filter(Boolean);
    tIds.forEach(tId => {
      if (!tId || tId === 'TIM_UMMI') return;
      const key = `${s.day}__${pKey}__${tId}`;
      if (!bucket[key]) bucket[key] = [];
      bucket[key].push(s);
    });
  });

  Object.values(bucket).forEach(group => {
    if (group.length > 1) {
      group.forEach(s => {
        cachedConflicts[s.id] = group.filter(other => other.id !== s.id);
      });
    }
  });

  console.log(`\nTotal conflict slots in schedules: ${Object.keys(cachedConflicts).length}`);
  for (const [k, group] of Object.entries(bucket)) {
    if (group.length > 1) {
      const names = group.map(g => `${g.classId} (${g.subjectName || g.subjectId})`).join(' AND ');
      console.log(`  BENTROK: [${k}] => ${names}`);
    }
  }

  process.exit(0);
}

fullAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
