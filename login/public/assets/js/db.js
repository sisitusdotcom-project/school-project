const DB = {
  _read(path, fallback = null) {
    if (!isDBReady()) return Promise.resolve(fallback);
    return db.ref(path).once('value').then((snap) => snap.val() ?? fallback);
  },

  _readCollection(path, fallback = {}) {
    return this._read(path, fallback);
  },

  _sanitizeUserPayload(data = {}) {
    const safeData = { ...data };
    delete safeData.password;
    return safeData;
  },

  _currentUserIsAdmin() {
    return !!(typeof Auth !== 'undefined' && Auth.currentRole === AppConfig.ROLES.ADMIN);
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
  async submitTeacherAttendanceToWorker({ dateStr, teacherId, type, photoDataUrl, location, accuracy }) {
    const workerUrl = (window.CLOUDFLARE_ATTENDANCE_WORKER_URL || '').trim();

    if (!workerUrl || workerUrl.includes('your-subdomain')) {
      const fallbackProof = await this.saveTeacherAttendanceProof(dateStr, teacherId, photoDataUrl, 'image/jpeg');
      const payload = {
        ...(type === 'in' ? { time_in: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } : {}),
        ...(type === 'out' ? { time_out: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } : {}),
        ...(location ? (type === 'in' ? { location_in: location } : { location_out: location }) : {}),
        ...(fallbackProof ? { proof_url: fallbackProof } : {})
      };
      await this.saveTeacherAttendance(dateStr, teacherId, payload);
      return { status: 'success', proof_url: fallbackProof, record: payload };
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
        clientTimestamp: new Date().toISOString()
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
  async getClassesForTeacher(teacherUid) {
    const classes = await this.getClasses();
    return this.toArray(classes).filter(c => {
      const isWali = c.teacherId === teacherUid;
      const isMapel = c.subjectTeachers && Object.values(c.subjectTeachers).includes(teacherUid);
      return isWali || isMapel;
    });
  },
  async saveClass(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`classes/${id}`) : db.ref('classes').push();
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
  async getAllStudents() {
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
      description: data.description || 'Transaksi baru',
      amount: Number(data.amount || 0),
      date: data.date || new Date().toISOString().slice(0, 10),
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
    const normalized = {
      studentId: data.studentId || '',
      amount: Number(data.amount || 0),
      dueDate: data.dueDate || new Date().toISOString().slice(0, 10),
      status: data.status || 'pending',
      note: data.note || '',
      createdAt: data.createdAt || firebase.database.ServerValue.TIMESTAMP
    };

    const ref = id ? db.ref(`finance/student_bills/${id}`) : db.ref('finance/student_bills').push();
    await ref.set(normalized);
    return ref.key;
  },
  async markStudentBillPaid(id) {
    if (!isDBReady() || !id) return;
    const bills = await this.getStudentBills();
    const bill = bills[id];
    if (!bill) return;
    await db.ref(`finance/student_bills/${id}/status`).set('paid');
  }
};

Object.assign(DB, {
  toArray: AppConfig.toArray
});
