const LegerModule = {
  currentData: null,
  async render(container, rawParams = {}) {
    Router.setTitle('Buku Leger Rapor', 'Rekapitulasi nilai hasil belajar murid per rombongan belajar secara komprehensif, terpadu, dan sah.');
    const params = typeof rawParams === 'string' ? { classId: rawParams } : (rawParams || {});
    const user = Auth.userData || Auth.currentUser || {};
    const uid = user.uid || Auth.currentUser?.uid;
    const assignments = typeof App !== 'undefined' && App.getAssignments ? App.getAssignments() : (Auth.currentAssignments || []);
    const [settings, classes, subjects, users, characters] = await Promise.all([
      DB.getSettings(),
      DB.getClasses(),
      DB.getSubjects(),
      DB.getAllUsers(),
      DB.getCharacters()
    ]);
    const classList = DB.toArray(classes).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'id'));
    if (!classList.length) {
      container.innerHTML = '<div class="card"><p class="text-muted">Data rombongan belajar belum tersedia.</p></div>';
      return;
    }
    const hash = window.location.hash || '';
    const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
    const queryParams = new URLSearchParams(queryPart);
    let defaultClassId = params.classId || queryParams.get('classId');
    if (!defaultClassId) {
      const myWaliClass = classList.find(c => c.teacherId === uid || assignments.includes(`WALI_KELAS_${c.id}`));
      defaultClassId = myWaliClass ? myWaliClass.id : classList[0].id;
    }
    const currentYear = settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
    const currentSem = String(settings.currentSemester || AppConfig.DEFAULT_SETTINGS.currentSemester);
    const yearOptions = [
      currentYear,
      '2025/2026',
      '2026/2027',
      '2027/2028'
    ].filter((v, i, a) => a.indexOf(v) === i).map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>T.A. ${y}</option>`).join('');
    const classOptions = classList.map(c => `<option value="${c.id}" ${c.id === defaultClassId ? 'selected' : ''}>${AppConfig.escapeHtml(c.name)}</option>`).join('');
    container.innerHTML = `
      <section class="card section-spacer leger-toolbar-panel">
        <div class="card-body">
          <div class="leger-controls-grid">
            <div class="form-group compact-field leger-field-class">
              <label for="leger-class-select"><i class="ph ph-chalkboard"></i> Rombongan Belajar</label>
              <select id="leger-class-select" class="form-select">${classOptions}</select>
            </div>
            <div class="form-group compact-field">
              <label for="leger-year-select"><i class="ph ph-calendar"></i> Tahun Ajaran</label>
              <select id="leger-year-select" class="form-select">${yearOptions}</select>
            </div>
            <div class="form-group compact-field">
              <label for="leger-sem-select"><i class="ph ph-clock"></i> Semester</label>
              <select id="leger-sem-select" class="form-select">
                <option value="1" ${currentSem === '1' ? 'selected' : ''}>Semester 1</option>
                <option value="2" ${currentSem === '2' ? 'selected' : ''}>Semester 2</option>
              </select>
            </div>
            <div class="form-group compact-field">
              <label for="leger-sort-select"><i class="ph ph-sort-ascending"></i> Urutan</label>
              <select id="leger-sort-select" class="form-select">
                <option value="no">No Urut</option>
                <option value="name">Nama (A-Z)</option>
                <option value="rank">Rangking</option>
                <option value="nis">NIS</option>
              </select>
            </div>
            <div class="form-group compact-field leger-field-search">
              <label for="leger-search-input"><i class="ph ph-magnifying-glass"></i> Cari Siswa</label>
              <div class="leger-search-input-wrap">
                <i class="ph ph-magnifying-glass"></i>
                <input id="leger-search-input" type="search" placeholder="Ketik nama / NIS...">
              </div>
            </div>
          </div>
          <div class="leger-actions-row">
            <button id="leger-btn-excel" type="button" class="btn btn-success"><i class="ph ph-file-xls"></i> Unduh Excel</button>
            <button id="leger-btn-print" type="button" class="btn btn-primary"><i class="ph ph-printer"></i> Cetak Leger</button>
          </div>
          <div class="leger-toggles-bar">
            <span class="leger-toggles-label"><i class="ph ph-sliders"></i> Tampilkan Kolom:</span>
            <div class="leger-toggles-chips">
              <label class="leger-chip"><input type="checkbox" id="toggle-col-char" checked><span>Karakter (P3)</span></label>
              <label class="leger-chip"><input type="checkbox" id="toggle-col-ekskul" checked><span>Ekstrakurikuler</span></label>
              <label class="leger-chip"><input type="checkbox" id="toggle-col-att" checked><span>Presensi (S/I/A)</span></label>
              <label class="leger-chip"><input type="checkbox" id="toggle-col-note" checked><span>Catatan Wali</span></label>
            </div>
          </div>
        </div>
      </section>
      <div id="leger-stats-container"></div>
      <div id="leger-sheet-container"></div>
    `;
    const classSel = container.querySelector('#leger-class-select');
    const yearSel = container.querySelector('#leger-year-select');
    const semSel = container.querySelector('#leger-sem-select');
    const sortSel = container.querySelector('#leger-sort-select');
    const searchInp = container.querySelector('#leger-search-input');
    const btnExcel = container.querySelector('#leger-btn-excel');
    const btnPrint = container.querySelector('#leger-btn-print');
    const toggleChar = container.querySelector('#toggle-col-char');
    const toggleEks = container.querySelector('#toggle-col-ekskul');
    const toggleAtt = container.querySelector('#toggle-col-att');
    const toggleNote = container.querySelector('#toggle-col-note');
    const statsContainer = container.querySelector('#leger-stats-container');
    const sheetContainer = container.querySelector('#leger-sheet-container');
    const reload = async () => {
      const clsId = classSel.value;
      const yr = yearSel.value;
      const sm = semSel.value;
      await this.loadData({
        classId: clsId,
        year: yr,
        semester: sm,
        classes,
        classList,
        subjects,
        users,
        characters,
        statsContainer,
        sheetContainer
      });
    };
    classSel.addEventListener('change', reload);
    yearSel.addEventListener('change', reload);
    semSel.addEventListener('change', reload);
    sortSel.addEventListener('change', () => {
      this.applySort(sortSel.value);
    });
    searchInp.addEventListener('input', () => {
      this.applyFilter(searchInp.value.trim());
    });
    toggleChar.addEventListener('change', () => this.toggleColClass('col-char', toggleChar.checked));
    toggleEks.addEventListener('change', () => this.toggleColClass('col-ekskul', toggleEks.checked));
    toggleAtt.addEventListener('change', () => this.toggleColClass('col-att', toggleAtt.checked));
    toggleNote.addEventListener('change', () => this.toggleColClass('col-note', toggleNote.checked));
    btnPrint.addEventListener('click', () => {
      window.print();
    });
    btnExcel.addEventListener('click', () => {
      this.exportExcel();
    });
    await reload();
  },
  async loadData(ctx) {
    const { classId, year, semester, classes, classList, subjects, users, characters, statsContainer, sheetContainer } = ctx;
    sheetContainer.innerHTML = '<div class="loader-wrap"><div class="loader"></div></div>';
    statsContainer.innerHTML = '';
    const currentClass = (classes && classes[classId]) || (classList && classList.find(c => c.id === classId));
    if (!currentClass) {
      sheetContainer.innerHTML = '<div class="card"><p class="text-danger">Data kelas tidak ditemukan.</p></div>';
      return;
    }
    const cleanYear = String(year).replace(/\//g, '-');
    const [students, rawGrades, rawAssessments, rawAttendances, rawNotes, rawExtracurriculars] = await Promise.all([
      DB.getStudentsByClass(classId),
      DB.getAllAcademicGrades(year, semester),
      DB.getAllAssessmentsForPeriod(year, semester),
      DB._readCollection ? DB._readCollection(`attendances/${cleanYear}_${semester}`, {}) : Promise.resolve({}),
      DB._readCollection ? DB._readCollection(`teacher_notes/${cleanYear}_${semester}`, {}) : Promise.resolve({}),
      DB._readCollection ? DB._readCollection(`student_extracurriculars/${cleanYear}_${semester}`, {}) : Promise.resolve({})
    ]);
    const allAcademicGrades = rawGrades || {};
    const allAssessments = rawAssessments || {};
    const attendances = rawAttendances || {};
    const teacherNotes = rawNotes || {};
    const extracurriculars = rawExtracurriculars || {};
    const studentList = DB.toArray(students).filter(s => s && s.isActive !== false).sort((a, b) => (a.nis || '').localeCompare(b.nis || '') || a.name.localeCompare(b.name, 'id'));
    if (!studentList.length) {
      sheetContainer.innerHTML = '<div class="card"><p class="text-muted">Belum ada murid aktif yang terdaftar di rombel ini.</p></div>';
      return;
    }
    const allSubjects = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'id'));
    const classSubjectKeys = currentClass && currentClass.subjectTeachers ? Object.keys(currentClass.subjectTeachers) : [];
    const matchedSubjects = classSubjectKeys.length > 0 ? allSubjects.filter(s => classSubjectKeys.includes(s.id)) : allSubjects;
    const activeSubjects = matchedSubjects.length > 0 ? matchedSubjects : allSubjects;
    const rankings = (AppConfig.calculateClassRankings ? AppConfig.calculateClassRankings(studentList, allAcademicGrades) : {}) || {};
    const walasUser = (currentClass.teacherId && users && users[currentClass.teacherId]) ? users[currentClass.teacherId] : { name: currentClass.teacherName || '-', nbm: '-' };
    const kepsekUser = Object.values(users || {}).find(u => u && (u.role === 'kepsek' || u.unit === 'KEPSEK' || u.assignments?.includes?.('KEPSEK'))) || { name: 'Dhani Harsyahyadi, S.H.I.', nbm: '1314863' };
    const processedStudents = studentList.map((st, idx) => {
      const sId = st.id || st.nis;
      const grades = allAcademicGrades[sId] || (st.nis ? allAcademicGrades[st.nis] : null) || {};
      const subjectScores = {};
      let totalScore = 0;
      let scoredCount = 0;
      activeSubjects.forEach(sub => {
        const entry = grades[sub.id];
        const val = Number(entry?.score);
        if (!isNaN(val) && val > 0) {
          subjectScores[sub.id] = val;
          totalScore += val;
          scoredCount++;
        } else {
          subjectScores[sub.id] = null;
        }
      });
      const avgScore = scoredCount > 0 ? (totalScore / scoredCount) : 0;
      const rankInfo = (rankings[sId] || (st.nis ? rankings[st.nis] : null)) || {};
      const charEntries = allAssessments[sId] || (st.nis ? allAssessments[st.nis] : null) || {};
      let totalChar = 0;
      let countChar = 0;
      Object.values(charEntries).forEach(c => {
        const sc = Number(c?.score);
        if (!isNaN(sc) && sc > 0) {
          totalChar += sc;
          countChar++;
        }
      });
      const avgChar = countChar > 0 ? (totalChar / countChar) : null;
      const stuEks = extracurriculars[sId] || (st.nis ? extracurriculars[st.nis] : null) || {};
      const eksList = Object.entries(stuEks).map(([k, v]) => {
        const name = v?.name || v?.ekskulName || k;
        const pred = v?.predicate || v?.score || 'Baik';
        return `${name} (${pred})`;
      }).join(', ');
      const att = attendances[sId] || (st.nis ? attendances[st.nis] : null) || {};
      const note = teacherNotes[sId] || (st.nis ? teacherNotes[st.nis] : null) || {};
      const decisionText = note.decision || note.notes || '-';
      const rawGender = String(st.gender || st.jenisKelamin || '').trim().toUpperCase();
      const gender = rawGender.startsWith('L') ? 'L' : (rawGender.startsWith('P') ? 'P' : '-');
      return {
        initialNo: idx + 1,
        id: sId,
        nis: st.nis || '-',
        nisn: st.nisn || '-',
        name: st.name || '-',
        gender,
        subjectScores,
        totalScore,
        avgScore,
        scoredCount,
        rank: rankInfo.rank || null,
        avgChar,
        ekskulText: eksList || '-',
        sick: Number(att.sick || att.sakit || 0),
        permitted: Number(att.permitted || att.izin || 0),
        unexcused: Number(att.unexcused || att.alpa || 0),
        decisionText
      };
    });
    const subjectMetrics = {};
    activeSubjects.forEach(sub => {
      let sum = 0;
      let count = 0;
      let max = -Infinity;
      let min = Infinity;
      processedStudents.forEach(st => {
        const val = st.subjectScores[sub.id];
        if (val !== null) {
          sum += val;
          count++;
          if (val > max) max = val;
          if (val < min) min = val;
        }
      });
      subjectMetrics[sub.id] = {
        sum,
        count,
        avg: count > 0 ? (sum / count) : 0,
        max: count > 0 ? max : 0,
        min: count > 0 ? min : 0
      };
    });
    let grandSum = 0;
    let grandCount = 0;
    let maxTotal = 0;
    let minTotal = Infinity;
    let studentWithMax = '-';
    let studentWithMin = '-';
    let totalSick = 0;
    let totalPermitted = 0;
    let totalUnexcused = 0;
    let maleCount = 0;
    let femaleCount = 0;
    processedStudents.forEach(st => {
      if (st.gender === 'L') maleCount++;
      if (st.gender === 'P') femaleCount++;
      if (st.totalScore > 0) {
        grandSum += st.avgScore;
        grandCount++;
        if (st.totalScore > maxTotal) {
          maxTotal = st.totalScore;
          studentWithMax = st.name;
        }
        if (st.totalScore < minTotal) {
          minTotal = st.totalScore;
          studentWithMin = st.name;
        }
      }
      totalSick += st.sick;
      totalPermitted += st.permitted;
      totalUnexcused += st.unexcused;
    });
    const classAvg = grandCount > 0 ? (grandSum / grandCount) : 0;
    if (minTotal === Infinity) minTotal = 0;
    this.currentData = {
      classId,
      year,
      semester,
      currentClass,
      activeSubjects,
      students: processedStudents,
      subjectMetrics,
      walasUser,
      kepsekUser,
      meta: {
        totalStudents: processedStudents.length,
        maleCount,
        femaleCount,
        classAvg,
        maxTotal,
        minTotal,
        studentWithMax,
        studentWithMin,
        totalSick,
        totalPermitted,
        totalUnexcused
      }
    };
    statsContainer.innerHTML = `
      <section class="leger-stats-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-users-three"></i></div>
          <div class="stat-meta">
            <p class="stat-value">${processedStudents.length} <span class="text-sm text-muted">(${maleCount}L / ${femaleCount}P)</span></p>
            <p class="stat-label text-muted">Peserta Didik</p>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-chart-line-up"></i></div>
          <div class="stat-meta">
            <p class="stat-value">${classAvg.toFixed(2)}</p>
            <p class="stat-label text-muted">Rata-rata Rombel</p>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-trophy"></i></div>
          <div class="stat-meta">
            <p class="stat-value">${maxTotal > 0 ? maxTotal : '-'}</p>
            <p class="stat-label text-muted" title="${AppConfig.escapeHtml(studentWithMax)}">Tertinggi: ${AppConfig.escapeHtml(studentWithMax)}</p>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-trend-down"></i></div>
          <div class="stat-meta">
            <p class="stat-value">${minTotal > 0 ? minTotal : '-'}</p>
            <p class="stat-label text-muted" title="${AppConfig.escapeHtml(studentWithMin)}">Terendah: ${AppConfig.escapeHtml(studentWithMin)}</p>
          </div>
        </div>
      </section>
    `;
    this.renderSheet(sheetContainer);
  },
  renderSheet(container) {
    const d = this.currentData;
    if (!d) return;
    const { currentClass, activeSubjects, students, subjectMetrics, walasUser, kepsekUser, year, semester, meta } = d;
    const phase = AppConfig.getClassPhase ? AppConfig.getClassPhase(currentClass) : 'Fase Fondasi';
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const subjectThCols = activeSubjects.map(sub => `<th class="leger-th-sub" title="${AppConfig.escapeHtml(sub.name)}">${AppConfig.escapeHtml(this.abbreviateSubject(sub.name))}</th>`).join('');
    container.innerHTML = `
      <section class="card section-spacer leger-sheet">
        ${AppConfig.getOfficialKopHtml({ customClass: 'leger-kop', showDivider: false })}
        <div class="leger-title-box">
          <h2 class="leger-title">BUKU LEGER NILAI HASIL BELAJAR PESERTA DIDIK</h2>
          <p class="leger-subtitle">Tahun Ajaran ${AppConfig.escapeHtml(year)} · Semester ${semester === '1' ? '1 (Ganjil)' : '2 (Genap)'} · Kurikulum Merdeka</p>
        </div>
        <div class="leger-meta-grid">
          <div class="leger-meta-item">
            <span class="leger-meta-label">Rombongan Belajar:</span>
            <span class="leger-meta-val">${AppConfig.escapeHtml(currentClass.name)}</span>
          </div>
          <div class="leger-meta-item">
            <span class="leger-meta-label">Fase Belajar:</span>
            <span class="leger-meta-val">${AppConfig.escapeHtml(phase)}</span>
          </div>
          <div class="leger-meta-item">
            <span class="leger-meta-label">Wali Kelas:</span>
            <span class="leger-meta-val">${AppConfig.escapeHtml(walasUser.name || '-')}</span>
          </div>
          <div class="leger-meta-item">
            <span class="leger-meta-label">Kepala Sekolah:</span>
            <span class="leger-meta-val">${AppConfig.escapeHtml(kepsekUser.name || '-')}</span>
          </div>
        </div>
        <div class="table-wrap leger-table-wrap">
          <table id="leger-main-table" class="table leger-table">
            <thead>
              <tr>
                <th rowspan="2" class="leger-cell-no">No</th>
                <th rowspan="2" class="leger-cell-nis">NIS</th>
                <th rowspan="2" class="leger-cell-name">Nama Peserta Didik</th>
                <th rowspan="2" class="leger-cell-lp">L/P</th>
                <th colspan="${activeSubjects.length}" class="leger-th-group">Mata Pelajaran (Nilai Akhir)</th>
                <th colspan="3" class="leger-th-group">Prestasi Akademik</th>
                <th rowspan="2" class="col-char leger-cell-char">Karakter (P3)</th>
                <th rowspan="2" class="col-ekskul leger-cell-ekskul">Ekstrakurikuler</th>
                <th colspan="3" class="col-att leger-th-group">Ketidakhadiran</th>
                <th rowspan="2" class="col-note leger-cell-decision">Catatan / Keputusan</th>
              </tr>
              <tr>
                ${subjectThCols}
                <th class="leger-th-sub" title="Jumlah Nilai">JML</th>
                <th class="leger-th-sub" title="Rata-rata Nilai">RATA</th>
                <th class="leger-th-sub" title="Peringkat Kelas">PKT</th>
                <th class="col-att leger-th-sub" title="Sakit">S</th>
                <th class="col-att leger-th-sub" title="Izin">I</th>
                <th class="col-att leger-th-sub" title="Alpa / Tanpa Keterangan">A</th>
              </tr>
            </thead>
            <tbody id="leger-table-body">
              ${this.buildTableRows(students, activeSubjects)}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right"><strong>Jumlah Nilai Rombel</strong></td>
                ${activeSubjects.map(sub => `<td class="leger-cell-score">${subjectMetrics[sub.id]?.sum || '-'}</td>`).join('')}
                <td class="leger-cell-total">${meta.maxTotal > 0 ? students.reduce((acc, s) => acc + s.totalScore, 0) : '-'}</td>
                <td class="leger-cell-avg">-</td>
                <td class="leger-cell-rank">-</td>
                <td class="col-char">-</td>
                <td class="col-ekskul">-</td>
                <td class="col-att">${meta.totalSick}</td>
                <td class="col-att">${meta.totalPermitted}</td>
                <td class="col-att">${meta.totalUnexcused}</td>
                <td class="col-note">-</td>
              </tr>
              <tr>
                <td colspan="4" class="text-right"><strong>Rata-rata Nilai Kelas</strong></td>
                ${activeSubjects.map(sub => `<td class="leger-cell-score">${subjectMetrics[sub.id]?.count > 0 ? subjectMetrics[sub.id].avg.toFixed(1) : '-'}</td>`).join('')}
                <td class="leger-cell-total">-</td>
                <td class="leger-cell-avg">${meta.classAvg.toFixed(2)}</td>
                <td class="leger-cell-rank">-</td>
                <td class="col-char">-</td>
                <td class="col-ekskul">-</td>
                <td class="col-att">-</td>
                <td class="col-att">-</td>
                <td class="col-att">-</td>
                <td class="col-note">-</td>
              </tr>
              <tr>
                <td colspan="4" class="text-right"><strong>Nilai Tertinggi</strong></td>
                ${activeSubjects.map(sub => `<td class="leger-cell-score">${subjectMetrics[sub.id]?.count > 0 ? subjectMetrics[sub.id].max : '-'}</td>`).join('')}
                <td class="leger-cell-total">${meta.maxTotal > 0 ? meta.maxTotal : '-'}</td>
                <td class="leger-cell-avg">-</td>
                <td class="leger-cell-rank">1</td>
                <td class="col-char">-</td>
                <td class="col-ekskul">-</td>
                <td class="col-att">-</td>
                <td class="col-att">-</td>
                <td class="col-att">-</td>
                <td class="col-note">-</td>
              </tr>
              <tr>
                <td colspan="4" class="text-right"><strong>Nilai Terendah</strong></td>
                ${activeSubjects.map(sub => `<td class="leger-cell-score">${subjectMetrics[sub.id]?.count > 0 ? subjectMetrics[sub.id].min : '-'}</td>`).join('')}
                <td class="leger-cell-total">${meta.minTotal > 0 ? meta.minTotal : '-'}</td>
                <td class="leger-cell-avg">-</td>
                <td class="leger-cell-rank">${meta.totalStudents}</td>
                <td class="col-char">-</td>
                <td class="col-ekskul">-</td>
                <td class="col-att">-</td>
                <td class="col-att">-</td>
                <td class="col-att">-</td>
                <td class="col-note">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="leger-signatures">
          <div class="leger-sig-box">
            <p class="leger-sig-title">Mengetahui,</p>
            <p class="leger-sig-role">Kepala SD Muhammadiyah 1 Sedati</p>
            <div class="leger-sig-spacer"></div>
            <p class="leger-sig-name">${AppConfig.escapeHtml(kepsekUser.name || 'Dhani Harsyahyadi, S.H.I.')}</p>
            <p class="leger-sig-nbm">NBM: ${AppConfig.escapeHtml(kepsekUser.nbm || '1314863')}</p>
          </div>
          <div class="leger-sig-box">
            <p class="leger-sig-title">Sidoarjo, ${dateFormatted}</p>
            <p class="leger-sig-role">Wali Kelas ${AppConfig.escapeHtml(currentClass.name)}</p>
            <div class="leger-sig-spacer"></div>
            <p class="leger-sig-name">${AppConfig.escapeHtml(walasUser.name || '-')}</p>
            <p class="leger-sig-nbm">NBM: ${AppConfig.escapeHtml(walasUser.nbm || '-')}</p>
          </div>
        </div>
      </section>
    `;
  },
  buildTableRows(students, subjects) {
    return students.map((st, idx) => {
      const subjectCols = subjects.map(sub => {
        const val = st.subjectScores[sub.id];
        return `<td class="leger-cell-score ${val === null ? 'empty' : ''}">${val !== null ? val : '-'}</td>`;
      }).join('');
      const charVal = st.avgChar !== null ? st.avgChar.toFixed(1) : '-';
      return `
        <tr class="leger-row" data-id="${st.id}" data-name="${AppConfig.escapeHtml(st.name.toLowerCase())}" data-nis="${AppConfig.escapeHtml(st.nis)}">
          <td class="leger-cell-no">${idx + 1}</td>
          <td class="leger-cell-nis">${AppConfig.escapeHtml(st.nis)}</td>
          <td class="leger-cell-name" title="${AppConfig.escapeHtml(st.name)}">${AppConfig.escapeHtml(st.name)}</td>
          <td class="leger-cell-lp">${st.gender}</td>
          ${subjectCols}
          <td class="leger-cell-total">${st.totalScore > 0 ? st.totalScore : '-'}</td>
          <td class="leger-cell-avg">${st.avgScore > 0 ? st.avgScore.toFixed(2) : '-'}</td>
          <td class="leger-cell-rank">${st.rank ? st.rank : '-'}</td>
          <td class="col-char leger-cell-char">${charVal}</td>
          <td class="col-ekskul leger-cell-ekskul" title="${AppConfig.escapeHtml(st.ekskulText)}">${AppConfig.escapeHtml(st.ekskulText)}</td>
          <td class="col-att leger-cell-att">${st.sick}</td>
          <td class="col-att leger-cell-att">${st.permitted}</td>
          <td class="col-att leger-cell-att">${st.unexcused}</td>
          <td class="col-note leger-cell-decision" title="${AppConfig.escapeHtml(st.decisionText)}">${AppConfig.escapeHtml(st.decisionText)}</td>
        </tr>
      `;
    }).join('');
  },
  applySort(key) {
    if (!this.currentData) return;
    const { students, activeSubjects } = this.currentData;
    const sorted = [...students];
    if (key === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'id'));
    } else if (key === 'rank') {
      sorted.sort((a, b) => (a.rank || 9999) - (b.rank || 9999) || (b.totalScore - a.totalScore) || a.name.localeCompare(b.name, 'id'));
    } else if (key === 'nis') {
      sorted.sort((a, b) => a.nis.localeCompare(b.nis));
    } else {
      sorted.sort((a, b) => a.initialNo - b.initialNo);
    }
    const tbody = document.getElementById('leger-table-body');
    if (tbody) {
      tbody.innerHTML = this.buildTableRows(sorted, activeSubjects);
    }
  },
  applyFilter(query) {
    const q = query.toLowerCase();
    const rows = document.querySelectorAll('#leger-table-body .leger-row');
    rows.forEach(r => {
      const name = r.dataset.name || '';
      const nis = r.dataset.nis || '';
      const match = !q || name.includes(q) || nis.includes(q);
      r.classList.toggle('hidden', !match);
    });
  },
  toggleColClass(cls, show) {
    const cells = document.querySelectorAll(`.${cls}`);
    cells.forEach(el => {
      el.classList.toggle('hidden', !show);
    });
  },
  abbreviateSubject(name = '') {
    const clean = name.trim();
    if (clean.toLowerCase().includes('islam') || clean.toLowerCase().includes('agama')) return 'PAI';
    if (clean.toLowerCase().includes('pancasila') || clean.toLowerCase().includes('ppkn')) return 'PKN';
    if (clean.toLowerCase().includes('bahasa indonesia')) return 'BIN';
    if (clean.toLowerCase().includes('matematika')) return 'MAT';
    if (clean.toLowerCase().includes('ipas') || clean.toLowerCase().includes('alam')) return 'IPAS';
    if (clean.toLowerCase().includes('jasmani') || clean.toLowerCase().includes('pjok') || clean.toLowerCase().includes('olahraga')) return 'PJOK';
    if (clean.toLowerCase().includes('seni') || clean.toLowerCase().includes('rupa') || clean.toLowerCase().includes('musik')) return 'SENI';
    if (clean.toLowerCase().includes('inggris')) return 'BING';
    if (clean.toLowerCase().includes('jawa')) return 'BJAW';
    if (clean.toLowerCase().includes('arab')) return 'BARB';
    if (clean.toLowerCase().includes('kemuhammadiyahan') || clean.toLowerCase().includes('aik')) return 'AIK';
    if (clean.toLowerCase().includes('al-qur')) return 'QUR';
    if (clean.toLowerCase().includes('aqidah') || clean.toLowerCase().includes('akhlak')) return 'AQD';
    if (clean.toLowerCase().includes('fiqih') || clean.toLowerCase().includes('syari')) return 'FQH';
    if (clean.toLowerCase().includes('tarikh') || clean.toLowerCase().includes('sejarah')) return 'TRK';
    return clean.slice(0, 5).toUpperCase();
  },
  exportExcel() {
    if (!window.XLSX) {
      alert('Library SheetJS (XLSX) belum siap dimuat.');
      return;
    }
    const d = this.currentData;
    if (!d) {
      alert('Tidak ada data leger untuk diunduh.');
      return;
    }
    const { currentClass, activeSubjects, students, subjectMetrics, walasUser, kepsekUser, year, semester, meta } = d;
    const aoa = [
      ...AppConfig.getOfficialKopAoa('BUKU LEGER NILAI HASIL BELAJAR PESERTA DIDIK (E-RAPOR)'),
      [''],
      ['Rombongan Belajar:', currentClass.name, '', 'Tahun Ajaran:', year],
      ['Fase / Kurikulum:', AppConfig.getClassPhase ? AppConfig.getClassPhase(currentClass) : 'Fase Merdeka', '', 'Semester:', semester === '1' ? '1 (Ganjil)' : '2 (Genap)'],
      ['Wali Kelas:', walasUser.name || '-', '', 'Kepala Sekolah:', kepsekUser.name || 'Dhani Harsyahyadi, S.H.I.'],
      []
    ];
    const headerRow1 = ['No', 'NIS', 'NISN', 'Nama Peserta Didik', 'L/P'];
    activeSubjects.forEach(s => headerRow1.push(s.name));
    headerRow1.push('Jumlah', 'Rata-rata', 'Peringkat', 'Karakter (P3)', 'Ekstrakurikuler', 'Sakit', 'Izin', 'Alpa', 'Catatan / Keputusan');
    aoa.push(headerRow1);
    students.forEach((st, idx) => {
      const row = [
        idx + 1,
        st.nis,
        st.nisn,
        st.name,
        st.gender
      ];
      activeSubjects.forEach(sub => {
        row.push(st.subjectScores[sub.id] !== null ? st.subjectScores[sub.id] : '');
      });
      row.push(
        st.totalScore > 0 ? st.totalScore : '',
        st.avgScore > 0 ? Number(st.avgScore.toFixed(2)) : '',
        st.rank || '',
        st.avgChar !== null ? Number(st.avgChar.toFixed(1)) : '',
        st.ekskulText,
        st.sick,
        st.permitted,
        st.unexcused,
        st.decisionText
      );
      aoa.push(row);
    });
    aoa.push([]);
    const sumRow = ['JUMLAH NILAI', '', '', '', ''];
    activeSubjects.forEach(sub => sumRow.push(subjectMetrics[sub.id]?.sum || 0));
    sumRow.push(students.reduce((acc, s) => acc + s.totalScore, 0), '', '', '', '', meta.totalSick, meta.totalPermitted, meta.totalUnexcused, '');
    aoa.push(sumRow);
    const avgRow = ['RATA-RATA KELAS', '', '', '', ''];
    activeSubjects.forEach(sub => avgRow.push(subjectMetrics[sub.id]?.count > 0 ? Number(subjectMetrics[sub.id].avg.toFixed(1)) : ''));
    avgRow.push('', Number(meta.classAvg.toFixed(2)), '', '', '', '', '', '', '');
    aoa.push(avgRow);
    const maxRow = ['NILAI TERTINGGI', '', '', '', ''];
    activeSubjects.forEach(sub => maxRow.push(subjectMetrics[sub.id]?.count > 0 ? subjectMetrics[sub.id].max : ''));
    maxRow.push(meta.maxTotal, '', 1, '', '', '', '', '', '');
    aoa.push(maxRow);
    const minRow = ['NILAI TERENDAH', '', '', '', ''];
    activeSubjects.forEach(sub => minRow.push(subjectMetrics[sub.id]?.count > 0 ? subjectMetrics[sub.id].min : ''));
    minRow.push(meta.minTotal, '', meta.totalStudents, '', '', '', '', '', '');
    aoa.push(minRow);
    aoa.push([]);
    aoa.push([]);
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    aoa.push(['Mengetahui,', '', '', '', '', '', '', `Sidoarjo, ${dateFormatted}`]);
    aoa.push(['Kepala SD Muhammadiyah 1 Sedati', '', '', '', '', '', '', `Wali Kelas ${currentClass.name}`]);
    aoa.push([]);
    aoa.push([]);
    aoa.push([]);
    aoa.push([kepsekUser.name || 'Dhani Harsyahyadi, S.H.I.', '', '', '', '', '', '', walasUser.name || '-']);
    aoa.push([`NBM: ${kepsekUser.nbm || '1314863'}`, '', '', '', '', '', '', `NBM: ${walasUser.nbm || '-'}`]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const colWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 14 },
      { wch: 30 },
      { wch: 6 }
    ];
    activeSubjects.forEach(() => colWidths.push({ wch: 12 }));
    colWidths.push(
      { wch: 10 },
      { wch: 10 },
      { wch: 8 },
      { wch: 14 },
      { wch: 30 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 25 }
    );
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leger Rapor');
    const safeClassName = currentClass.name.replace(/[^A-Za-z0-9]+/g, '_');
    const safeYear = String(year).replace(/[^A-Za-z0-9]+/g, '-');
    const fileName = `Leger_Rapor_${safeClassName}_${safeYear}_Sem${semester}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
};
window.LegerModule = LegerModule;