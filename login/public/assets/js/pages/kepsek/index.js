const KepsekPages = {
  async renderDashboard(container) {
    Router.setTitle('Dasbor Kepala Sekolah', 'Ringkasan data akademik dan karakter seluruh sekolah.');
    const settings = await DB.getSettings();
    const year = settings.currentAcademicYear;
    const sem = settings.currentSemester;
    const today = new Date();
    const dateStr = AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr(today) : today.toISOString().slice(0, 10);
    const user = Auth.userData || Auth.currentUser || {};
    const uid = user.uid || Auth.currentUser?.uid;
    const [students, classes, chars, allAssess, allAcad, obsData, myAtt, directoryData, users] = await Promise.all([
      DB.getAllStudents(),
      DB.getClasses(),
      DB.getCharacters(),
      DB.getAllAssessmentsForPeriod(year, sem),
      DB.getAllAcademicGrades(year, sem),
      DB.getAllObservations(),
      DB.getTeacherAttendance(dateStr, uid).catch(() => null),
      DB._readCollection ? DB._readCollection('personnel/directory', {}) : Promise.resolve({}),
      DB.getAllUsers()
    ]);
    const dirList = DB.toArray(directoryData);
    const cleanUserName = (user.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const empProfile = dirList.find(d => d.userId === uid || (d.name && d.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanUserName)) || {};
    const heroHtml = AppConfig.getDashboardHeroHtml({
      user,
      empProfile,
      attendanceRecord: myAtt,
      position: 'Kepala Sekolah',
      date: today
    });
    const studentArr = DB.toArray(students);
    const classArr = DB.toArray(classes);
    const charArr = DB.toArray(chars).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const obsArr = DB.toArray(obsData);
    let needsAttention = 0;
    const studentAverages = {};
    const charAverages = {};
    charArr.forEach(c => {
      charAverages[c.id] = { total: 0, count: 0 };
    });
    const atRiskStudents = [];
    studentArr.forEach(s => {
      const scores = allAssess?.[s.id];
      const sObs = obsArr.filter(o => o.studentId === s.id);
      const hasWarningObs = sObs.some(o => o.type === 'needs_improvement');
      if (scores) {
        let total = 0, count = 0;
        Object.keys(scores).forEach(charId => {
          const sc = scores[charId].score;
          if (sc && charAverages[charId]) {
            charAverages[charId].total += sc;
            charAverages[charId].count++;
            total += sc;
            count++;
          }
        });
        const avg = count > 0 ? (total / count) : 0;
        studentAverages[s.id] = avg;
        if ((avg > 0 && avg < 2.5) || hasWarningObs) {
          needsAttention++;
          atRiskStudents.push({
            student: s,
            avg: avg.toFixed(2),
            warningCount: sObs.filter(o => o.type === 'needs_improvement').length
          });
        }
      } else if (hasWarningObs) {
        needsAttention++;
        atRiskStudents.push({
          student: s,
          avg: '-',
          warningCount: sObs.filter(o => o.type === 'needs_improvement').length
        });
      }
    });
    let globalAcadTotal = 0;
    let globalAcadCount = 0;
    Object.values(allAcad || {}).forEach(studentGrades => {
      Object.values(studentGrades || {}).forEach(grade => {
        if (grade.score) {
          globalAcadTotal += parseInt(grade.score);
          globalAcadCount++;
        }
      });
    });
    const globalAcadAvg = globalAcadCount > 0 ? Math.round(globalAcadTotal / globalAcadCount) : '-';
    let assessedStudentsCount = 0;
    studentArr.forEach(s => {
      const hasChar = allAssess && allAssess[s.id] && Object.values(allAssess[s.id]).some(v => v.score);
      const hasAcad = allAcad && allAcad[s.id] && Object.values(allAcad[s.id]).some(v => v.score);
      if (hasChar || hasAcad) assessedStudentsCount++;
    });
    const complianceRate = studentArr.length > 0 ? Math.round((assessedStudentsCount / studentArr.length) * 100) : 0;
    const atRiskHtml = atRiskStudents.length > 0 ? atRiskStudents.map(item => {
      const cls = classArr.find(c => c.id === item.student.classId);
      return `
        <tr>
          <td><strong>${AppConfig.escapeHtml(item.student.name)}</strong></td>
          <td>${cls ? AppConfig.escapeHtml(cls.name) : '-'}</td>
          <td class="text-center"><span class="badge ${item.avg < 2.5 && item.avg !== '-' ? 'badge-danger' : 'badge-warning'}">${item.avg}</span></td>
          <td class="text-center">${item.warningCount > 0 ? `<span class="badge badge-warning">${item.warningCount} Catatan</span>` : '-'}</td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="4" class="text-center text-muted">Bagus! Tidak ada siswa yang terdeteksi memerlukan perhatian khusus.</td></tr>';
    container.innerHTML = `
      ${heroHtml}
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-books"></i></div>
          <div><p class="stat-value">${globalAcadAvg}</p><p class="stat-label text-muted">Rata-rata Akademik Sekolah</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-check-circle"></i></div>
          <div><p class="stat-value">${complianceRate}%</p><p class="stat-label text-muted">Progres Pengisian Rapor</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-warning"></i></div>
          <div><p class="stat-value">${needsAttention}</p><p class="stat-label text-muted">Siswa Perlu Perhatian</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-student"></i></div>
          <div><p class="stat-value">${studentArr.length}</p><p class="stat-label text-muted">Total Siswa Aktif</p></div>
        </div>
      </section>
      <section class="card-grid section-spacer">
        <div class="card card-accent-danger">
          <h3 class="card-title section-spacer"><i class="ph ph-warning-circle text-danger"></i> Daftar Siswa Perlu Perhatian Khusus</h3>
          <p class="text-muted soft-note section-spacer">Daftar siswa dengan rata-rata karakter di bawah 2.5 atau memiliki catatan observasi bimbingan.</p>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr><th>Nama Siswa</th><th>Kelas</th><th class="text-center">Rata-rata Karakter</th><th class="text-center">Catatan Peringatan</th></tr>
              </thead>
              <tbody>${atRiskHtml}</tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title section-spacer">Rata-rata Karakter Sekolah — Sem ${sem}, ${year}</h3>
          <div class="kepsek-chart-wrap"><canvas id="chart-school"></canvas></div>
        </div>
      </section>
      <section class="card">
        <div class="card-header">
          <h3 class="card-title">Rekapitulasi per Rombel</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Kelas &amp; Fase</th><th>Wali Kelas</th><th>Jumlah Siswa</th><th>Rata-rata Karakter</th><th>Aksi</th></tr></thead>
            <tbody id="class-recap-body"></tbody>
          </table>
        </div>
      </section>
      <div id="kepsek-bulletin-container" class="section-spacer"></div>
    `;
    AppConfig.renderBulletinBoard(container.querySelector('#kepsek-bulletin-container'), { user });
    const labels = charArr.map(c => c.name);
    const values = charArr.map(c => {
      const d = charAverages[c.id];
      return d && d.count > 0 ? parseFloat((d.total / d.count).toFixed(2)) : 0;
    });
    new Chart(document.getElementById('chart-school'), {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Rata-rata sekolah',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.12)',
          pointBackgroundColor: '#3b82f6',
          pointRadius: 4
        }]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 4,
            ticks: { stepSize: 1, font: { size: 10 } },
            pointLabels: { font: { size: 11 } }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
    const tbody = document.getElementById('class-recap-body');
    classArr.forEach(cls => {
      const clsStudents = studentArr.filter(s => s.classId === cls.id);
      const teacher = users ? users[cls.teacherId] : null;
      let clsTotal = 0, clsCount = 0;
      clsStudents.forEach(s => {
        const scores = allAssess?.[s.id];
        if (!scores) return;
        Object.values(scores).forEach(d => {
          if (d.score) {
            clsTotal += d.score;
            clsCount++;
          }
        });
      });
      const avg = clsCount > 0 ? (clsTotal / clsCount).toFixed(2) : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${AppConfig.escapeHtml(cls.name)}</strong> <span class="badge badge-outline">Fase ${AppConfig.escapeHtml(AppConfig.getClassPhase(cls))}</span></td>
        <td>${teacher ? AppConfig.escapeHtml(teacher.name) : '<span class="text-muted">Belum ditugaskan</span>'}</td>
        <td>${clsStudents.length} siswa</td>
        <td>${avg !== '-' ? avg + ' / 4' : '<span class="text-muted">Belum ada data</span>'}</td>
        <td><a href="#/kepsek/class/${cls.id}" class="btn btn-outline btn-sm"><i class="ph ph-eye"></i> Detail</a></td>
      `;
      tbody.appendChild(tr);
    });
  },
  async renderReports(container) {
    Router.setTitle('Laporan Rombel', 'Pilih kelas untuk memantau nilai akademik, indikator karakter, dan kelengkapan rapor.');
    const settings = await DB.getSettings();
    const year = settings.currentAcademicYear;
    const sem = settings.currentSemester;
    const [classes, students, users, allAssess, allAcad] = await Promise.all([
      DB.getClasses(),
      DB.getAllStudents(),
      DB.getAllUsers(),
      DB.getAllAssessmentsForPeriod(year, sem),
      DB.getAllAcademicGrades(year, sem)
    ]);
    const classArr = DB.toArray(classes);
    const studentArr = DB.toArray(students);
    const renderCards = () => {
      const q = (document.getElementById('search-report-cls')?.value || '').toLowerCase();
      const phaseFilter = document.getElementById('filter-report-phase')?.value || '';
      const filtered = classArr.filter(c => {
        const teacher = users ? users[c.teacherId] : null;
        const phase = AppConfig.getClassPhase(c);
        const matchesQ = !q || c.name.toLowerCase().includes(q) || (teacher && teacher.name.toLowerCase().includes(q));
        const matchesPhase = !phaseFilter || phase === phaseFilter;
        return matchesQ && matchesPhase;
      });
      const cardsHtml = filtered.length ? filtered.map(c => {
        const clsStudents = studentArr.filter(s => s.classId === c.id);
        const count = clsStudents.length;
        const teacher = users ? users[c.teacherId] : null;
        const phase = AppConfig.getClassPhase(c);
        let acadTotal = 0, acadCount = 0;
        let charTotal = 0, charCount = 0;
        let evaluatedCount = 0;
        clsStudents.forEach(s => {
          const sAcad = allAcad?.[s.id];
          const sChar = allAssess?.[s.id];
          let hasAny = false;
          if (sAcad) {
            Object.values(sAcad).forEach(g => {
              if (g.score) {
                acadTotal += parseInt(g.score);
                acadCount++;
                hasAny = true;
              }
            });
          }
          if (sChar) {
            Object.values(sChar).forEach(ch => {
              if (ch.score) {
                charTotal += ch.score;
                charCount++;
                hasAny = true;
              }
            });
          }
          if (hasAny) evaluatedCount++;
        });
        const acadAvg = acadCount > 0 ? Math.round(acadTotal / acadCount) : '-';
        const charAvg = charCount > 0 ? (charTotal / charCount).toFixed(1) : '-';
        const progressPct = count > 0 ? Math.round((evaluatedCount / count) * 100) : 0;
        return `
          <div class="card class-card report-class-card" data-href="#/kepsek/class/${c.id}">
            <div class="report-class-header">
              <div class="report-class-title-wrap">
                <h3 class="card-title text-base mb-1">${AppConfig.escapeHtml(c.name)}</h3>
                <span class="badge badge-outline">Fase ${AppConfig.escapeHtml(phase)}</span>
              </div>
              <span class="badge ${progressPct === 100 ? 'badge-success' : (progressPct > 0 ? 'badge-primary' : 'badge-warning')}">${progressPct}% Lengkap</span>
            </div>
            <div class="report-class-walas">
              <i class="ph ph-chalkboard-teacher"></i> Wali Kelas: <strong>${teacher ? AppConfig.escapeHtml(teacher.name) : 'Belum ditugaskan'}</strong>
            </div>
            <div class="report-class-stats">
              <div class="report-stat-pill">
                <div class="report-stat-label">Siswa</div>
                <div class="report-stat-value">${count}</div>
              </div>
              <div class="report-stat-pill">
                <div class="report-stat-label">Akademik</div>
                <div class="report-stat-value ${acadAvg !== '-' && acadAvg < 75 ? 'text-danger' : 'text-primary'}">${acadAvg}</div>
              </div>
              <div class="report-stat-pill">
                <div class="report-stat-label">Karakter</div>
                <div class="report-stat-value ${charAvg !== '-' && charAvg < 2.5 ? 'text-danger' : 'text-success'}">${charAvg}</div>
              </div>
            </div>
            <button type="button" class="btn btn-outline btn-sm btn-block" data-open-class="${c.id}"><i class="ph ph-eye"></i> Buka Laporan Rombel</button>
          </div>
        `;
      }).join('') : '<div class="card"><p class="text-muted text-center">Tidak ada rombel yang sesuai filter.</p></div>';
      const containerEl = document.getElementById('report-cards-container');
      if (containerEl) {
        containerEl.innerHTML = cardsHtml;
        containerEl.querySelectorAll('[data-href]').forEach(card => {
          card.onclick = (e) => {
            const target = e.currentTarget.dataset.href;
            if (target) window.location.hash = target;
          };
        });
      }
    };
    container.innerHTML = `
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div class="report-toolbar-controls">
            <div class="search-box">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" id="search-report-cls" placeholder="Cari nama rombel / wali kelas...">
            </div>
            <select id="filter-report-phase">
              <option value="">Semua Fase</option>
              <option value="A">Fase A (Kelas 1–2)</option>
              <option value="B">Fase B (Kelas 3–4)</option>
              <option value="C">Fase C (Kelas 5–6)</option>
            </select>
          </div>
          <div class="toolbar-actions">
            <span class="badge badge-primary">Tahun Ajaran ${AppConfig.escapeHtml(year)} · Semester ${AppConfig.escapeHtml(sem)}</span>
          </div>
        </div>
      </div>
      <div id="report-cards-container" class="card-grid"></div>
    `;
    renderCards();
    document.getElementById('search-report-cls')?.addEventListener('input', renderCards);
    document.getElementById('filter-report-phase')?.addEventListener('change', renderCards);
  },
  async renderClassDetail(container, classId) {
    if (!classId) {
      window.location.hash = '#/kepsek/reports';
      return;
    }
    const settings = await DB.getSettings();
    const year = settings.currentAcademicYear;
    const sem = settings.currentSemester;
    const [classes, students, chars, subjects, users, allAssess, allAcad, attendances, teacherNotes] = await Promise.all([
      DB.getClasses(),
      DB.getStudentsByClass(classId),
      DB.getCharacters(),
      DB.getSubjects(),
      DB.getAllUsers(),
      DB.getAllAssessmentsForPeriod(year, sem),
      DB.getAllAcademicGrades(year, sem),
      DB._readCollection ? DB._readCollection(`attendances/${year}_${sem}`, {}) : Promise.resolve({}),
      DB._readCollection ? DB._readCollection(`teacher_notes/${year}_${sem}`, {}) : Promise.resolve({})
    ]);
    const cls = classes[classId];
    if (!cls) {
      container.innerHTML = `
        <div class="card">
          <div class="card-body text-center">
            <h3 class="text-danger mb-2">Kelas Tidak Ditemukan</h3>
            <p class="text-muted mb-3">Data rombel yang Anda cari tidak tersedia dalam sistem.</p>
            <a href="#/kepsek/reports" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali ke Laporan Rombel</a>
          </div>
        </div>
      `;
      return;
    }
    const phase = AppConfig.getClassPhase(cls);
    const teacher = users ? users[cls.teacherId] : null;
    const studentArr = DB.toArray(students).sort((a, b) => a.name.localeCompare(b.name));
    const charArr = DB.toArray(chars).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const allSubjectsArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
    const assignedSubIds = Object.keys(cls.subjectTeachers || {});
    const activeSubjects = allSubjectsArr.filter(s => assignedSubIds.length === 0 || assignedSubIds.includes(s.id));
    Router.setTitle(`Laporan ${AppConfig.escapeHtml(cls.name)}`, `Fase ${AppConfig.escapeHtml(phase)} · TA ${year} Semester ${sem}`);
    let activeTab = 'summary';
    let searchQuery = '';
    const renderContent = () => {
      const q = searchQuery.toLowerCase();
      const filteredStudents = studentArr.filter(s => !q || s.name.toLowerCase().includes(q) || (s.nis && String(s.nis).includes(q)));
      let tabHtml = '';
      if (activeTab === 'summary') {
        const rows = filteredStudents.length ? filteredStudents.map((s, idx) => {
          const sAcad = allAcad?.[s.id] || {};
          const sChar = allAssess?.[s.id] || {};
          const sAtt = attendances?.[s.id] || {};
          const sNote = teacherNotes?.[s.id] || {};
          let acadTot = 0, acadCnt = 0;
          Object.values(sAcad).forEach(g => {
            if (g.score) { acadTot += parseInt(g.score); acadCnt++; }
          });
          const acadAvg = acadCnt > 0 ? Math.round(acadTot / acadCnt) : '-';
          let charTot = 0, charCnt = 0;
          Object.values(sChar).forEach(ch => {
            if (ch.score) { charTot += ch.score; charCnt++; }
          });
          const charAvg = charCnt > 0 ? (charTot / charCnt).toFixed(1) : '-';
          const sakit = sAtt.sakit || 0;
          const izin = sAtt.izin || 0;
          const alpa = sAtt.alpa || 0;
          const attStr = (sakit || izin || alpa) ? `S:${sakit} I:${izin} A:${alpa}` : 'Nihil';
          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td>
                <div class="user-cell-name font-bold">${AppConfig.escapeHtml(s.name)}</div>
                <div class="user-cell-sub text-muted text-xs">NIS: ${AppConfig.escapeHtml(s.nis || s.nisn || '-')}</div>
              </td>
              <td class="text-center font-bold ${acadAvg !== '-' && acadAvg < 75 ? 'text-danger' : 'text-primary'}">${acadAvg}</td>
              <td class="text-center font-bold ${charAvg !== '-' && charAvg < 2.5 ? 'text-danger' : 'text-success'}">${charAvg}</td>
              <td class="text-center text-xs">${attStr}</td>
              <td class="text-xs text-muted">${sNote.note ? AppConfig.escapeHtml(sNote.note.slice(0, 40) + (sNote.note.length > 40 ? '...' : '')) : '-'}</td>
              <td class="action-cell">
                <a href="print.html?id=${s.id}&sem=${sem}&year=${encodeURIComponent(year)}" target="_blank" class="btn btn-outline btn-sm"><i class="ph ph-file-text"></i> E-Rapor</a>
              </td>
            </tr>
          `;
        }).join('') : '<tr><td colspan="7" class="text-center text-muted">Tidak ada siswa yang sesuai pencarian.</td></tr>';
        tabHtml = `
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th class="table-col-sm text-center">No</th>
                  <th>Nama Siswa</th>
                  <th class="text-center">Rata-rata Mapel</th>
                  <th class="text-center">Rata-rata Karakter</th>
                  <th class="text-center">Ketidakhadiran</th>
                  <th>Catatan Walas</th>
                  <th class="table-col-md">Aksi</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        `;
      } else if (activeTab === 'academic') {
        const thMapel = activeSubjects.map(sub => `<th class="text-center text-xs">${AppConfig.escapeHtml(sub.name)}</th>`).join('');
        const rows = filteredStudents.length ? filteredStudents.map((s, idx) => {
          const sAcad = allAcad?.[s.id] || {};
          let tot = 0, cnt = 0;
          const tds = activeSubjects.map(sub => {
            const grade = sAcad[sub.id];
            const sc = grade ? grade.score : null;
            if (sc) { tot += parseInt(sc); cnt++; }
            return `<td class="text-center font-mono ${sc && sc < 75 ? 'text-danger font-bold' : ''}">${sc || '—'}</td>`;
          }).join('');
          const avg = cnt > 0 ? Math.round(tot / cnt) : '-';
          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
              ${tds}
              <td class="text-center font-bold text-primary">${avg}</td>
            </tr>
          `;
        }).join('') : `<tr><td colspan="${activeSubjects.length + 3}" class="text-center text-muted">Tidak ada siswa.</td></tr>`;
        tabHtml = `
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th class="table-col-sm text-center">No</th>
                  <th>Nama Siswa</th>
                  ${thMapel}
                  <th class="text-center">Rata-rata</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        `;
      } else if (activeTab === 'characters') {
        const scoreBadge = { 4: 'badge-primary', 3: 'badge-success', 2: 'badge-warning', 1: 'badge-danger' };
        const thChars = charArr.map(c => `<th class="text-center text-xs">${AppConfig.escapeHtml(c.name)}</th>`).join('');
        const rows = filteredStudents.length ? filteredStudents.map((s, idx) => {
          const sChar = allAssess?.[s.id] || {};
          let tot = 0, cnt = 0;
          const tds = charArr.map(c => {
            const sc = sChar[c.id]?.score;
            if (sc) { tot += sc; cnt++; }
            return `<td class="text-center">${sc ? `<span class="badge ${scoreBadge[sc] || ''}">${sc}</span>` : '<span class="text-muted">—</span>'}</td>`;
          }).join('');
          const avg = cnt > 0 ? (tot / cnt).toFixed(1) : '-';
          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
              ${tds}
              <td class="text-center font-bold text-success">${avg}</td>
            </tr>
          `;
        }).join('') : `<tr><td colspan="${charArr.length + 3}" class="text-center text-muted">Tidak ada siswa.</td></tr>`;
        tabHtml = `
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th class="table-col-sm text-center">No</th>
                  <th>Nama Siswa</th>
                  ${thChars}
                  <th class="text-center">Rata-rata</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        `;
      }
      const mount = document.getElementById('class-detail-mount');
      if (mount) mount.innerHTML = tabHtml;
    };
    let globalClsAcadTot = 0, globalClsAcadCnt = 0;
    let globalClsCharTot = 0, globalClsCharCnt = 0;
    studentArr.forEach(s => {
      const sAcad = allAcad?.[s.id];
      const sChar = allAssess?.[s.id];
      if (sAcad) {
        Object.values(sAcad).forEach(g => {
          if (g.score) { globalClsAcadTot += parseInt(g.score); globalClsAcadCnt++; }
        });
      }
      if (sChar) {
        Object.values(sChar).forEach(ch => {
          if (ch.score) { globalClsCharTot += ch.score; globalClsCharCnt++; }
        });
      }
    });
    const clsAcadAvg = globalClsAcadCnt > 0 ? Math.round(globalClsAcadTot / globalClsAcadCnt) : '-';
    const clsCharAvg = globalClsCharCnt > 0 ? (globalClsCharTot / globalClsCharCnt).toFixed(1) : '-';
    container.innerHTML = `
      <div class="flex-between align-center mb-3">
        <a href="#/kepsek/reports" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali ke Laporan Rombel</a>
        <span class="badge badge-primary">Tahun Ajaran ${AppConfig.escapeHtml(year)} · Semester ${AppConfig.escapeHtml(sem)}</span>
      </div>
      <section class="card mb-3">
        <div class="flex-between align-start flex-wrap gap-2">
          <div>
            <h2 class="card-title text-xl mb-1">${AppConfig.escapeHtml(cls.name)}</h2>
            <div class="user-cell-sub text-muted">
              <span class="badge badge-outline">Fase ${AppConfig.escapeHtml(phase)}</span> · 
              Wali Kelas: <strong>${teacher ? AppConfig.escapeHtml(teacher.name) : 'Belum Ditugaskan'}</strong>
              ${teacher?.nbm ? `(NBM: ${AppConfig.escapeHtml(teacher.nbm)})` : ''}
            </div>
          </div>
          <div class="report-detail-stats">
            <div class="report-stat-pill">
              <div class="report-stat-label">Total Siswa</div>
              <div class="report-stat-value">${studentArr.length}</div>
            </div>
            <div class="report-stat-pill">
              <div class="report-stat-label">Rata Akademik</div>
              <div class="report-stat-value text-primary">${clsAcadAvg}</div>
            </div>
            <div class="report-stat-pill">
              <div class="report-stat-label">Rata Karakter</div>
              <div class="report-stat-value text-success">${clsCharAvg}</div>
            </div>
          </div>
        </div>
      </section>
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div class="report-toolbar-controls">
            <div class="report-tab-nav">
              <button type="button" class="btn btn-sm btn-primary" id="btn-tab-summary"><i class="ph ph-list-numbers"></i> Rekap Nilai &amp; Rapor</button>
              <button type="button" class="btn btn-sm btn-outline" id="btn-tab-academic"><i class="ph ph-book-open"></i> Matriks Mapel</button>
              <button type="button" class="btn btn-sm btn-outline" id="btn-tab-characters"><i class="ph ph-star"></i> Matriks Karakter</button>
            </div>
            <div class="search-box">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" id="search-student-detail" placeholder="Cari nama siswa / NIS...">
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div id="class-detail-mount"></div>
      </div>
    `;
    renderContent();
    const btnSummary = document.getElementById('btn-tab-summary');
    const btnAcad = document.getElementById('btn-tab-academic');
    const btnChar = document.getElementById('btn-tab-characters');
    const updateTabBtns = () => {
      btnSummary.className = `btn btn-sm ${activeTab === 'summary' ? 'btn-primary' : 'btn-outline'}`;
      btnAcad.className = `btn btn-sm ${activeTab === 'academic' ? 'btn-primary' : 'btn-outline'}`;
      btnChar.className = `btn btn-sm ${activeTab === 'characters' ? 'btn-primary' : 'btn-outline'}`;
    };
    btnSummary.onclick = () => { activeTab = 'summary'; updateTabBtns(); renderContent(); };
    btnAcad.onclick = () => { activeTab = 'academic'; updateTabBtns(); renderContent(); };
    btnChar.onclick = () => { activeTab = 'characters'; updateTabBtns(); renderContent(); };
    document.getElementById('search-student-detail')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderContent();
    });
  }
};