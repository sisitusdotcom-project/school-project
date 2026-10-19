const DB = {
  _read(path, fallback = null) {
    if (!isDBReady()) return Promise.resolve(fallback);
    return db.ref(path).once('value').then((snap) => snap.val() ?? fallback);
  },
  _readCollection(path, fallback = {}) {
    return this._read(path, fallback);
  },
  _buildUnitFlags(assignments = []) {
    const flags = {};
    AppConfig.normalizeAssignments(assignments).forEach((item) => {
      const key = item.replace(/[.$#\[\]\/]/g, '_');
      flags[key] = true;
      if (key.startsWith('GURU_EKSTRA_')) flags.GURU_EKSTRA = true;
      if (key.startsWith('GURU_KELAS_')) flags.GURU_KELAS = true;
    });
    return flags;
  },
  _sanitizeUserPayload(data = {}) {
    const safeData = { ...data };
    delete safeData.password;
    if (Array.isArray(safeData.assignments)) {
      const flags = this._buildUnitFlags(safeData.assignments);
      safeData.unitFlags = Object.keys(flags).length ? flags : null;
    }
    return safeData;
  },
  async backfillUnitFlags() {
    if (!isDBReady() || !this._currentUserIsAdmin()) return;
    const users = await this.getAllUsers();
    const updates = {};
    Object.entries(users || {}).forEach(([uid, user]) => {
      const flags = this._buildUnitFlags(AppConfig.getRoleAssignments(user));
      const current = user.unitFlags || {};
      const same = JSON.stringify(Object.keys(flags).sort()) === JSON.stringify(Object.keys(current).sort());
      if (!same) updates[`users/${uid}/unitFlags`] = Object.keys(flags).length ? flags : null;
    });
    if (Object.keys(updates).length) await db.ref().update(updates);
  },
  _currentUserIsAdmin() {
    return !!(typeof Auth !== 'undefined' && (Auth.currentRole === AppConfig.ROLES.ADMIN || (Auth.currentAssignments || []).some((a) => a.startsWith('WAKA_') || a === 'TIM_IT')));
  },
  async _canManageClass(classId) {
    if (!classId || typeof Auth === 'undefined' || !Auth.currentUser) return true;
    if (this._currentUserIsAdmin()) return true;
    const classes = await this.getClasses();
    const cls = classes[classId] || null;
    return !!(cls && (cls.teacherId === Auth.currentUser.uid || (cls.subjectTeachers && Object.values(cls.subjectTeachers).includes(Auth.currentUser.uid))));
  },
  _buildAttendancePayload(data = {}) {
    const payload = {};
    if (data.time_in) payload.time_in = data.time_in;
    if (data.location_in) payload.location_in = data.location_in;
    if (data.time_out) payload.time_out = data.time_out;
    if (data.location_out) payload.location_out = data.location_out;
    if (data.proof_url) payload.proof_url = data.proof_url;
    if (data.proofUrl) payload.proof_url = data.proofUrl;
    if (data.late_reason) payload.late_reason = data.late_reason;
    if (data.lateReason) payload.late_reason = data.lateReason;
    return payload;
  },
  _serializeStudentAttendance(data = {}) {
    const normalized = {};
    Object.entries(data || {}).forEach(([studentId, status]) => {
      if (['H', 'S', 'I', 'A'].includes(status)) normalized[studentId] = status;
    });
    return normalized;
  },
  async getUser(uid) {
    return this._read(`users/${uid}`, null);
  },
  async getAllUsers() {
    return this._readCollection('users', {});
  },
  async getUsersByRole(role) {
    const users = await this.getAllUsers();
    return this.toArray(users).filter(u => u.role === role);
  },
  async saveUser(uid, data) {
    if (!isDBReady()) return;
    await db.ref(`users/${uid}`).update(this._sanitizeUserPayload(data));
  },
  async saveProfilePhoto(uid, base64Data, mimeType = 'image/jpeg') {
    if (!uid || !base64Data) return null;
    const fileUrl = await DriveBridge.uploadProfilePhoto(uid, base64Data, mimeType);
    if (!fileUrl) return null;
    await db.ref(`users/${uid}/photoURL`).set(fileUrl);
    return fileUrl;
  },
  async uploadDriveFile(fileName, mimeType, base64Data, folderId = null) {
    if (!fileName || !mimeType || !base64Data) return null;
    const result = await DriveBridge.uploadBase64({ fileName, mimeType, base64Data, folderId });
    return result.fileUrl || null;
  },
  async createUserInDB(uid, data) {
    if (!isDBReady()) return;
    await db.ref(`users/${uid}`).set({
      ...this._sanitizeUserPayload(data),
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async deleteUser(uid) {
    if (!isDBReady()) return;
    await db.ref(`users/${uid}`).remove();
  },
  async getSettings() {
    const defaultSettings = AppConfig.DEFAULT_SETTINGS;
    if (!isDBReady()) return defaultSettings;
    const snap = await db.ref('settings').once('value');
    const current = snap.val() || {};
    return AppConfig.normalizeSettings(current);
  },
  async updateSettings(data) {
    if (!isDBReady()) return;
    await db.ref('settings').update(data);
  },
  async getSchoolSettings() {
    const defaultSettings = {
      location: {
        lat: null,
        lng: null,
        radius_meters: null
      }
    };
    if (!isDBReady()) return defaultSettings;
    const snap = await db.ref('school_settings').once('value');
    const current = snap.val() || {};
    return {
      ...defaultSettings,
      ...current,
      location: {
        lat: current.location?.lat ?? null,
        lng: current.location?.lng ?? null,
        radius_meters: current.location?.radius_meters ?? null
      }
    };
  },
  async updateSchoolSettings(data) {
    if (!isDBReady()) return;
    await db.ref('school_settings').update(data);
  },
  async getTeacherAttendance(dateStr, teacherId) {
    return this._read(`teacher_attendance/${dateStr}/${teacherId}`, null);
  },
  async getTeacherAttendanceByDate(dateStr) {
    return this._readCollection(`teacher_attendance/${dateStr}`, {});
  },
  async getTeacherAttendanceRange(startDate, endDate) {
    if (!isDBReady()) return {};
    const snap = await db.ref('teacher_attendance').orderByKey().startAt(startDate).endAt(endDate).once('value');
    return snap.val() || {};
  },
  async getTeacherAttendanceHistory(teacherId, limit = 60) {
    if (!isDBReady()) return [];
    const snap = await db.ref('teacher_attendance').limitToLast(limit).once('value');
    const val = snap.val() || {};
    const history = [];
    Object.entries(val).forEach(([dateStr, byTeacher]) => {
      if (byTeacher && byTeacher[teacherId]) {
        history.push({ date: dateStr, ...byTeacher[teacherId] });
      }
    });
    return history.sort((a, b) => b.date.localeCompare(a.date));
  },
  async getClassMonthlyLeaves(classId, monthStr) {
    if (!isDBReady()) return [];
    const snap = await db.ref('student_affairs/leaves').once('value');
    const val = snap.val() || {};
    const students = await this.getStudentsByClass(classId);
    const stuIds = new Set(Object.keys(students || {}));
    const leaves = [];
    Object.values(val).forEach((l) => {
      if (l && stuIds.has(l.studentId)) {
        if (!monthStr || (l.startDate && l.startDate.startsWith(monthStr))) {
          leaves.push(l);
        }
      }
    });
    return leaves;
  },
  async saveTeacherAttendance(dateStr, teacherId, data) {
    if (!isDBReady()) return;
    const isAdmin = this._currentUserIsAdmin();
    if (typeof Auth !== 'undefined' && Auth.currentUser && teacherId !== Auth.currentUser.uid && !isAdmin) {
      throw new Error('Anda tidak berwenang mengubah presensi guru lain.');
    }
    const payload = this._buildAttendancePayload(data || {});
    if (!Object.keys(payload).length) return;
    await db.ref(`teacher_attendance/${dateStr}/${teacherId}`).update(payload);
  },
  async saveTeacherAttendanceProof(dateStr, teacherId, base64Data, mimeType = 'image/jpeg') {
    if (!base64Data) return null;
    const fileUrl = await DriveBridge.uploadAttendanceProof(dateStr, teacherId, base64Data, mimeType);
    if (!fileUrl) return null;
    await this.saveTeacherAttendance(dateStr, teacherId, { proof_url: fileUrl });
    return fileUrl;
  },
  async submitTeacherAttendanceToWorker({ dateStr, teacherId, type, photoDataUrl, location, accuracy, isUmmi, roleGroup, lateReason }) {
    const workerUrl = (window.CLOUDFLARE_ATTENDANCE_WORKER_URL || '').trim();
    if (!workerUrl || workerUrl.includes('your-subdomain')) {
      const proofUrl = await this.saveTeacherAttendanceProof(dateStr, teacherId, photoDataUrl, 'image/jpeg');
      const payload = {
        ...(type === 'in' ? { time_in: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } : {}),
        ...(type === 'out' ? { time_out: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } : {}),
        ...(location ? (type === 'in' ? { location_in: location } : { location_out: location }) : {}),
        ...(proofUrl ? { proof_url: proofUrl } : {}),
        ...(lateReason ? { late_reason: lateReason } : {})
      };
      await this.saveTeacherAttendance(dateStr, teacherId, payload);
      return { status: 'success', proof_url: proofUrl, record: payload };
    }
    const user = typeof firebase !== 'undefined' && firebase.auth ? firebase.auth().currentUser : null;
    const idToken = user ? await user.getIdToken() : '';
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({
        dateStr,
        teacherId,
        type,
        photoDataUrl,
        location,
        accuracy,
        isUmmi: !!isUmmi,
        roleGroup: roleGroup || (isUmmi ? 'ummi' : 'gtk'),
        clientTimestamp: new Date().toISOString(),
        lateReason: lateReason || ''
      })
    });
    let result = {};
    try {
      result = await response.json();
    } catch (error) {
      result = { status: 'error', message: 'Respons worker tidak valid JSON.' };
    }
    if (!response.ok || result.status !== 'success') {
      throw new Error(result && result.message ? result.message : 'Gagal memvalidasi absensi di server.');
    }
    return result;
  },
  async getDailyStudentAttendance(dateStr, classId) {
    return this._readCollection(`student_attendance_daily/${dateStr}/${classId}`, {});
  },
  async getDailyStudentAttendanceByDate(dateStr) {
    return this._readCollection(`student_attendance_daily/${dateStr}`, {});
  },
  async saveDailyStudentAttendance(dateStr, classId, data) {
    if (!isDBReady()) return;
    if (typeof Auth !== 'undefined' && Auth.currentUser && !this._currentUserIsAdmin()) {
      const canManage = await this._canManageClass(classId);
      if (!canManage) {
        throw new Error('Anda tidak berwenang mengisi absensi kelas ini.');
      }
    }
    const normalized = this._serializeStudentAttendance(data);
    if (!Object.keys(normalized).length) return;
    await db.ref(`student_attendance_daily/${dateStr}/${classId}`).update(normalized);
  },
  async getCharacters() {
    if (!isDBReady()) return {};
    const snap = await db.ref('characters').orderByChild('order').once('value');
    return snap.val() || {};
  },
  async saveCharacter(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`characters/${id}`) : db.ref('characters').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteCharacter(id) {
    if (!isDBReady()) return;
    await db.ref(`characters/${id}`).remove();
  },
  async getClasses() {
    return this._readCollection('classes', {});
  },
  async getAllClasses() {
    return this.getClasses();
  },
  async getClassesForTeacher(teacherUid) {
    const classes = await this.getClasses();
    return this.toArray(classes).filter(c => {
      const isWali = c.teacherId === teacherUid;
      const isMapel = c.subjectTeachers && Object.values(c.subjectTeachers).includes(teacherUid);
      return isWali || isMapel;
    });
  },
  buildTeachingLabels(userId, classes, subjects) {
    return AppConfig.buildTeachingLabels(userId, classes, subjects);
  },
  async saveClass(id, data) {
    if (!isDBReady()) return null;
    if (id) {
      await db.ref(`classes/${id}`).update(data);
      return id;
    }
    const ref = db.ref('classes').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteClass(id) {
    if (!isDBReady()) return;
    await db.ref(`classes/${id}`).remove();
  },
  async saveClassSubjectTeachers(classId, subjectTeachers) {
    if (!isDBReady()) return;
    await db.ref(`classes/${classId}/subjectTeachers`).set(subjectTeachers);
  },
  async getClassSubjects(classId) {
    if (!classId || !isDBReady()) return [];
    const [classes, subjects, users] = await Promise.all([
      this.getClasses(),
      this.getSubjects(),
      this.getAllUsers()
    ]);
    const cls = classes[classId];
    if (!cls) return [];
    const st = cls.subjectTeachers || {};
    const subMap = subjects || {};
    const userMap = users || {};
    const subKeys = Object.keys(st);
    if (!subKeys.length) {
      return this.toArray(subMap).sort((a, b) => (a.order || 0) - (b.order || 0)).map(s => ({
        id: s.id,
        name: s.name,
        category: s.category || 'standar',
        order: s.order || 99,
        teacherId: cls.teacherId || '',
        teacherName: cls.teacherId && userMap[cls.teacherId] ? userMap[cls.teacherId].name : 'Default Wali Kelas'
      }));
    }
    const result = [];
    for (const subId of subKeys) {
      const meta = subMap[subId] || (cls.customSubjects && cls.customSubjects[subId]) || { id: subId, name: subId, category: 'standar', order: 99 };
      const teacherId = st[subId] || '';
      const teacher = teacherId && userMap[teacherId] ? userMap[teacherId] : null;
      result.push({
        id: subId,
        name: meta.name || subId,
        category: meta.category || 'standar',
        order: meta.order !== undefined ? meta.order : 99,
        teacherId: teacherId,
        teacherName: teacher ? teacher.name : (cls.teacherId && userMap[cls.teacherId] ? `${userMap[cls.teacherId].name} (Wali Kelas)` : 'Belum Ditugaskan')
      });
    }
    return result.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
  },
  async addSubjectToClass(classId, subjectId, teacherId = '') {
    if (!isDBReady() || !classId || !subjectId) return;
    await db.ref(`classes/${classId}/subjectTeachers/${subjectId}`).set(teacherId);
  },
  async removeSubjectFromClass(classId, subjectId) {
    if (!isDBReady() || !classId || !subjectId) return;
    await db.ref(`classes/${classId}/subjectTeachers/${subjectId}`).remove();
  },
  async getUmmiClasses() {
    return this._readCollection('ummi_classes', {});
  },
  async saveUmmiClass(id, data) {
    if (!isDBReady()) return null;
    if (id) {
      await db.ref(`ummi_classes/${id}`).update(data);
      return id;
    }
    const ref = db.ref('ummi_classes').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteUmmiClass(id) {
    if (!isDBReady()) return;
    await db.ref(`ummi_classes/${id}`).remove();
  },
  async getUmmiJournals(studentId) {
    if (!isDBReady() || !studentId) return {};
    const snap = await db.ref(`ummi_journals/${studentId}`).once('value');
    return snap.val() || {};
  },
  async saveUmmiJournal(studentId, journalId, data) {
    if (!isDBReady() || !studentId) return null;
    let key = journalId;
    if (key) {
      await db.ref(`ummi_journals/${studentId}/${key}`).update({
        ...data,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });
    } else {
      const ref = db.ref(`ummi_journals/${studentId}`).push();
      key = ref.key;
      await ref.set({
        ...data,
        id: key,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    }
    await this.syncStudentBTQGrade(studentId);
    return key;
  },
  async deleteUmmiJournal(studentId, journalId) {
    if (!isDBReady() || !studentId || !journalId) return;
    await db.ref(`ummi_journals/${studentId}/${journalId}`).remove();
    await this.syncStudentBTQGrade(studentId);
  },
  async verifyParentUmmiJournal(studentId, journalId) {
    if (!isDBReady() || !studentId || !journalId) return;
    await db.ref(`ummi_journals/${studentId}/${journalId}`).update({
      parentVerified: true,
      parentVerifiedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async getUmmiExams() {
    return this._readCollection('ummi_exams', {});
  },
  async saveUmmiExam(examId, data) {
    if (!isDBReady()) return null;
    let key = examId;
    if (key) {
      await db.ref(`ummi_exams/${key}`).update({
        ...data,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });
    } else {
      const ref = db.ref('ummi_exams').push();
      key = ref.key;
      await ref.set({
        ...data,
        id: key,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    }
    if (data.status === 'Lolos' && data.studentId && data.targetLevel) {
      await this.updateStudentUmmiLevel(data.studentId, data.targetLevel, data.ummiClassId);
    }
    return key;
  },
  async deleteUmmiExam(examId) {
    if (!isDBReady() || !examId) return;
    await db.ref(`ummi_exams/${examId}`).remove();
  },
  async getScheduledUmmiExamsCount(dateStr, examinerId) {
    if (!isDBReady() || !dateStr) return 0;
    const snap = await db.ref('ummi_exams').once('value');
    const exams = this.toArray(snap.val() || {});
    return exams.filter(e => e.scheduledDate === dateStr && (examinerId ? e.examinerId === examinerId : true) && (e.status === 'Dijadwalkan' || e.status === 'Lolos')).length;
  },
  async updateStudentUmmiLevel(studentId, newLevel, ummiClassId) {
    if (!isDBReady() || !studentId || !newLevel) return;
    await db.ref(`students/${studentId}/ummiLevel`).set(newLevel);
    if (ummiClassId) {
      await db.ref(`ummi_classes/${ummiClassId}/students/${studentId}`).update({
        level: newLevel
      });
    }
    await this.syncStudentBTQGrade(studentId);
  },
  async syncStudentBTQGrade(studentId, explicitYear, explicitSem) {
    if (!isDBReady() || !studentId) return;
    let year = explicitYear;
    let sem = explicitSem;
    if (!year || !sem) {
      const settings = await this.getSettings();
      year = settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
      sem = settings.currentSemester || AppConfig.DEFAULT_SETTINGS.currentSemester;
    }
    const snap = await db.ref(`ummi_journals/${studentId}`).once('value');
    const journals = this.toArray(snap.val() || {});
    if (!journals.length) return;
    const scores = journals.map(j => Number(j.score) || 0).filter(s => s > 0);
    if (!scores.length) return;
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const sorted = journals.sort((a, b) => (Number(b.meetingNo) || 0) - (Number(a.meetingNo) || 0));
    const latest = sorted[0];
    const compDesc = `Ananda telah mencapai pembelajaran metode Ummi pada tingkat ${latest.level || 'Ummi'} (terakhir pada ${latest.page || 'halaman awal'}). Menunjukkan kualitas bacaan yang baik dan aktif dalam bimbingan tatap muka Al-Qur'an.`;
    await this.saveAcademicGrade(year, sem, studentId, 'SUB_BTQ', {
      score: avgScore,
      competency: compDesc,
      source: 'auto_ummi',
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async getRooms() {
    if (!isDBReady()) return {};
    const snap = await db.ref('rooms').once('value');
    return snap.val() || {};
  },
  async saveRoom(id, data) {
    if (!isDBReady()) return;
    const key = id || db.ref('rooms').push().key;
    await db.ref(`rooms/${key}`).set({ ...data, id: key });
    return key;
  },
  async getAllStudents() {
    if (typeof Auth !== 'undefined' && Auth.currentUser && (Auth.currentRole === 'ortu' || Auth.userData?.role === 'ortu')) {
      return this.getStudentsByParent(Auth.currentUser.uid);
    }
    return this._readCollection('students', {});
  },
  async getStudentReferenceIndex() {
    const students = this.toArray(await this.getAllStudents());
    return students.reduce((index, student) => {
      index[student.id] = student;
      return index;
    }, {});
  },
  async getStudentsByClass(classId) {
    if (!isDBReady()) return {};
    const snap = await db.ref('students').orderByChild('classId').equalTo(classId).once('value');
    return snap.val() || {};
  },
  async getStudentsByParent(parentUid) {
    if (!isDBReady()) return {};
    const snap = await db.ref('students').orderByChild('parentId').equalTo(parentUid).once('value');
    return snap.val() || {};
  },
  async getStudent(id) {
    return this._read(`students/${id}`, null);
  },
  async saveStudent(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`students/${id}`) : db.ref('students').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteStudent(id) {
    if (!isDBReady()) return;
    await db.ref(`students/${id}`).remove();
  },
  _assessPath(year, sem) {
    return `assessments/${year.replace('/', '-')}_${sem}`;
  },
  async getAssessments(year, sem, studentId) {
    return this._readCollection(`${this._assessPath(year, sem)}/${studentId}`, {});
  },
  async getAllAssessmentsForPeriod(year, sem) {
    return this._readCollection(this._assessPath(year, sem), {});
  },
  async saveAssessment(year, sem, studentId, charId, score, teacherId) {
    if (!isDBReady()) return;
    await db.ref(`${this._assessPath(year, sem)}/${studentId}/${charId}`).set({
      score: parseInt(score),
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      updatedBy: teacherId
    });
  },
  async getObservationsByStudent(studentId) {
    if (!isDBReady()) return {};
    const snap = await db.ref('observations').orderByChild('studentId').equalTo(studentId).once('value');
    return snap.val() || {};
  },
  async getObservationsByTeacher(teacherUid) {
    if (!isDBReady()) return {};
    const snap = await db.ref('observations').orderByChild('teacherId').equalTo(teacherUid).once('value');
    return snap.val() || {};
  },
  async getAllObservations() {
    return this._readCollection('observations', {});
  },
  async saveObservation(data) {
    if (!isDBReady()) return null;
    data.timestamp = firebase.database.ServerValue.TIMESTAMP;
    const ref = await db.ref('observations').push(data);
    return ref.key;
  },
  async deleteObservation(id) {
    if (!isDBReady()) return;
    await db.ref(`observations/${id}`).remove();
  },
  async getSubjects() {
    if (!isDBReady()) return {};
    const snap = await db.ref('subjects').orderByChild('order').once('value');
    return snap.val() || {};
  },
  async saveSubject(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`subjects/${id}`) : db.ref('subjects').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteSubject(id) {
    if (!isDBReady()) return;
    await db.ref(`subjects/${id}`).remove();
  },
  async getExtracurriculars() {
    return this._readCollection('extracurriculars', {});
  },
  async saveExtracurricular(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`extracurriculars/${id}`) : db.ref('extracurriculars').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteExtracurricular(id) {
    if (!isDBReady()) return;
    await db.ref(`extracurriculars/${id}`).remove();
  },
  async getFacilityAssets() {
    return this._readCollection('facilities/assets', {});
  },
  async saveFacilityAsset(data, id = null) {
    if (!isDBReady()) return null;
    const normalized = {
      name: data.name || 'Aset baru',
      category: data.category || 'Umum',
      condition: data.condition || 'Baik',
      quantity: Number(data.quantity || 1),
      room: data.room || '-',
      status: data.status || 'Aktif',
      notes: data.notes || '',
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`facilities/assets/${id}`) : db.ref('facilities/assets').push();
    await ref.set(normalized);
    return ref.key;
  },
  async getFacilityRooms() {
    return this._readCollection('facilities/rooms', {});
  },
  async saveFacilityRoom(data, id = null) {
    if (!isDBReady()) return null;
    const normalized = {
      name: data.name || 'Ruangan baru',
      type: data.type || 'Kelas',
      location: data.location || '-',
      capacity: Number(data.capacity || 0),
      status: data.status || 'Aktif',
      notes: data.notes || '',
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`facilities/rooms/${id}`) : db.ref('facilities/rooms').push();
    await ref.set(normalized);
    return ref.key;
  },
  async getFacilityMaintenance() {
    return this._readCollection('facilities/maintenance', {});
  },
  async saveFacilityMaintenance(data, id = null) {
    if (!isDBReady()) return null;
    const normalized = {
      itemName: data.itemName || 'Barang',
      type: data.type || 'Pemeliharaan',
      date: data.date || new Date().toISOString().slice(0, 10),
      description: data.description || '-',
      status: data.status || 'Diajukan',
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`facilities/maintenance/${id}`) : db.ref('facilities/maintenance').push();
    await ref.set(normalized);
    return ref.key;
  },
  async getPersonnelDirectory() {
    return this._readCollection('personnel/employees', {});
  },
  async savePersonnelMember(data, id = null) {
    if (!isDBReady()) return null;
    const normalized = {
      name: data.name || 'Pegawai baru',
      position: data.position || 'Staf',
      department: data.department || 'Umum',
      email: data.email || '',
      phone: data.phone || '',
      status: data.status || 'Aktif',
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`personnel/employees/${id}`) : db.ref('personnel/employees').push();
    await ref.set(normalized);
    return ref.key;
  },
  async getPersonnelAnnouncements() {
    return this._readCollection('personnel/announcements', {});
  },
  async savePersonnelAnnouncement(data, id = null) {
    if (!isDBReady()) return null;
    const normalized = {
      title: data.title || 'Pengumuman baru',
      description: data.description || '',
      date: data.date || new Date().toISOString().slice(0, 10),
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`personnel/announcements/${id}`) : db.ref('personnel/announcements').push();
    await ref.set(normalized);
    return ref.key;
  },
  async getStudentAchievements() {
    return this._readCollection('student_affairs/achievements', {});
  },
  async saveStudentAchievement(data, id = null) {
    if (!isDBReady()) return null;
    const normalized = {
      studentId: data.studentId || '',
      title: data.title || 'Prestasi Baru',
      category: data.category || 'Umum',
      description: data.description || '',
      date: data.date || new Date().toISOString().slice(0, 10),
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`student_affairs/achievements/${id}`) : db.ref('student_affairs/achievements').push();
    await ref.set(normalized);
    return ref.key;
  },
  async getStudentViolations() {
    return this._readCollection('student_affairs/violations', {});
  },
  async saveStudentViolation(data, id = null) {
    if (!isDBReady()) return null;
    const normalized = {
      studentId: data.studentId || '',
      title: data.title || 'Catatan Pelanggaran',
      category: data.category || 'Kedisiplinan',
      description: data.description || '',
      date: data.date || new Date().toISOString().slice(0, 10),
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`student_affairs/violations/${id}`) : db.ref('student_affairs/violations').push();
    await ref.set(normalized);
    return ref.key;
  },
  _raporPath(type, year, sem) {
    return `${type}/${year.replace('/', '-')}_${sem}`;
  },
  async getAcademicGrades(year, sem, studentId) {
    return this._readCollection(`${this._raporPath('academic_grades', year, sem)}/${studentId}`, {});
  },
  async getAllAcademicGrades(year, sem) {
    return this._readCollection(this._raporPath('academic_grades', year, sem), {});
  },
  async getSubjectChapters(year, sem, classId, subjectId) {
    return this._read(`subject_chapters/${year}/${sem}/${classId}/${subjectId}`, []);
  },
  async saveSubjectChapters(year, sem, classId, subjectId, chapters) {
    if (!isDBReady()) return;
    await db.ref(`subject_chapters/${year}/${sem}/${classId}/${subjectId}`).set(chapters);
  },
  async getRaporFinalization(year, sem, classId) {
    return this._read(`rapor_finalization/${year}/${sem}/${classId}`, null);
  },
  async saveRaporFinalization(year, sem, classId, data) {
    if (!isDBReady()) return;
    await db.ref(`rapor_finalization/${year}/${sem}/${classId}`).set({
      ...data,
      finalizedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async saveAcademicGrade(year, sem, studentId, subjectId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('academic_grades', year, sem)}/${studentId}/${subjectId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async getStudentExtracurriculars(year, sem, studentId) {
    return this._readCollection(`${this._raporPath('student_extracurriculars', year, sem)}/${studentId}`, {});
  },
  async saveStudentExtracurricular(year, sem, studentId, ekskulId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('student_extracurriculars', year, sem)}/${studentId}/${ekskulId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async deleteStudentExtracurricular(year, sem, studentId, ekskulId) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('student_extracurriculars', year, sem)}/${studentId}/${ekskulId}`).remove();
  },
  async getCocurricular(year, sem, studentId) {
    return this._read(`${this._raporPath('cocurriculars', year, sem)}/${studentId}`, null);
  },
  async saveCocurricular(year, sem, studentId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('cocurriculars', year, sem)}/${studentId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async getAttendance(year, sem, studentId) {
    return this._read(`${this._raporPath('attendances', year, sem)}/${studentId}`, null);
  },
  async saveAttendance(year, sem, studentId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('attendances', year, sem)}/${studentId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async getTeacherNote(year, sem, studentId) {
    return this._read(`${this._raporPath('teacher_notes', year, sem)}/${studentId}`, null);
  },
  async saveTeacherNote(year, sem, studentId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('teacher_notes', year, sem)}/${studentId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async getParentResponse(year, sem, studentId) {
    return this._read(`${this._raporPath('parent_responses', year, sem)}/${studentId}`, null);
  },
  async saveParentResponse(year, sem, studentId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('parent_responses', year, sem)}/${studentId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async getFinanceLedger() {
    return this._readCollection('finance/ledger', {});
  },
  async getFinanceSummary() {
    const entries = this.toArray(await this.getFinanceLedger());
    const summary = entries.reduce((acc, item) => {
      const amount = Number(item.amount || 0);
      if (!item || !item.type) return acc;
      if (item.type === 'income') acc.income += amount;
      if (item.type === 'expense') acc.expense += amount;
      acc.count += 1;
      return acc;
    }, { income: 0, expense: 0, count: 0 });
    summary.net = summary.income - summary.expense;
    return summary;
  },
  async saveFinanceEntry(data, id = null) {
    if (!isDBReady()) return null;
    const entry = {
      id: id || data.id || null,
      type: data.type || 'income',
      category: data.category || 'Umum',
      accountCode: data.accountCode || (data.type === 'expense' ? '5-9999' : '4-9999'),
      accountName: data.accountName || (data.type === 'expense' ? 'Beban Operasional Lainnya' : 'Pendapatan Lainnya'),
      rkasId: data.rkasId || null,
      refNo: data.refNo || '',
      method: data.method || 'Tunai',
      description: data.description || 'Transaksi baru',
      amount: Number(data.amount || 0),
      date: data.date || new Date().toISOString().slice(0, 10),
      sourceBillId: data.sourceBillId || null,
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`finance/ledger/${id}`) : db.ref('finance/ledger').push();
    await ref.set(entry);
    return ref.key;
  },
  async deleteFinanceEntry(id) {
    if (!isDBReady() || !id) return;
    await db.ref(`finance/ledger/${id}`).remove();
  },
  async getStudentBills() {
    return this._readCollection('finance/student_bills', {});
  },
  async saveStudentBill(data, id = null) {
    if (!isDBReady()) return null;
    let normStatus = 'Belum Lunas';
    const s = String(data.status || '').toLowerCase();
    if (s === 'paid' || s === 'lunas') normStatus = 'Lunas';
    else if (s.includes('beasiswa')) normStatus = 'Bebas Beasiswa';
    const normalized = {
      academicYear: data.academicYear || '',
      month: data.month || '',
      studentId: data.studentId || '',
      amount: Number(data.amount || 0),
      dueDate: data.dueDate || data.paymentDate || new Date().toISOString().slice(0, 10),
      paymentDate: data.paymentDate || (normStatus === 'Lunas' ? new Date().toISOString().slice(0, 10) : ''),
      status: normStatus,
      receipt: data.receipt || '',
      note: data.note || '',
      ledgerEntryId: data.ledgerEntryId || null,
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`finance/student_bills/${id}`) : db.ref('finance/student_bills').push();
    await ref.set(normalized);
    return ref.key;
  },
  async markStudentBillPaid(id, opts = {}) {
    if (!isDBReady() || !id) return null;
    const bills = await this.getStudentBills();
    const bill = bills[id];
    if (!bill) return null;
    const payDate = opts.paymentDate || new Date().toISOString().slice(0, 10);
    const method = opts.method || 'Transfer';
    const updates = {
      [`finance/student_bills/${id}/status`]: 'Lunas',
      [`finance/student_bills/${id}/paymentDate`]: payDate
    };
    let ledgerKey = bill.ledgerEntryId || null;
    if (!ledgerKey) {
      let studentName = opts.studentName || '';
      if (!studentName && bill.studentId) {
        const student = await this.getStudent(bill.studentId);
        studentName = student?.name || bill.studentId;
      }
      const periodLabel = [bill.month, bill.academicYear].filter(Boolean).join(' ');
      const desc = `Pembayaran SPP ${periodLabel ? periodLabel + ' ' : ''}- ${studentName || 'Siswa'}`.trim();
      const ledgerEntry = {
        type: 'income',
        category: 'SPP',
        accountCode: '4-1010',
        accountName: 'Pendapatan SPP Siswa',
        description: desc,
        amount: Number(bill.amount || 0),
        date: payDate,
        method: method,
        refNo: opts.refNo || `SPP-${String(Date.now()).slice(-6)}`,
        sourceBillId: id,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };
      const lRef = db.ref('finance/ledger').push();
      ledgerKey = lRef.key;
      ledgerEntry.id = ledgerKey;
      updates[`finance/ledger/${ledgerKey}`] = ledgerEntry;
      updates[`finance/student_bills/${id}/ledgerEntryId`] = ledgerKey;
    }
    await db.ref().update(updates);
    return ledgerKey;
  },
  async getRKAS() {
    return this._readCollection('finance/rkas', {});
  },
  async saveRKAS(data, id = null) {
    if (!isDBReady()) return null;
    const item = {
      fiscalYear: data.fiscalYear || '',
      code: data.code || '',
      component: data.component || 'Komponen Anggaran',
      category: data.category || 'Lainnya',
      pagu: Number(data.pagu || 0),
      realized: Number(data.realized || 0),
      status: data.status || 'Draft',
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    const ref = id ? db.ref(`finance/rkas/${id}`) : db.ref('finance/rkas').push();
    await ref.set(item);
    return ref.key;
  }
,
  async getStudentReferenceIndex() {
    const students = await this.getAllStudents();
    const index = {};
    for (const key in students) {
      index[key] = { name: students[key].name, nis: students[key].nis };
    }
    return index;
  },
  async getPersonnelDirectory() {
    return this._readCollection('personnel/directory', {});
  },
  async getFacilityAssets() {
    return this._readCollection('facilities/assets', {});
  },
  async getFacilityRooms() {
    return this._readCollection('facilities/rooms', {});
  },
  async getFacilityMaintenance() {
    return this._readCollection('facilities/maintenance', {});
  }
};
Object.assign(DB, {
  toArray: AppConfig.toArray
});
