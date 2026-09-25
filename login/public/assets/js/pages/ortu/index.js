const OrtuPages = {
  async renderDashboard(container) {
    Router.setTitle('Perkembangan anak', 'Pantau seluruh hasil belajar dan karakter anak Anda.');
    const myStudents = await DB.getStudentsByParent(Auth.currentUser.uid);
    const studentArr = DB.toArray(myStudents);
    if (!studentArr.length) {
      container.innerHTML = `
        <div class="card panel-callout ortu-empty-panel">
          <div class="ortu-empty-icon"><i class="ph ph-users-three"></i></div>
          <h3 class="ortu-empty-title">Akun belum terhubung</h3>
          <p class="text-muted">Silakan hubungi wali kelas atau admin sekolah untuk menautkan akun ini ke data anak Anda.</p>
        </div>`;
      return;
    }
    const [settings, chars, classes, subjectsData, extrasData] = await Promise.all([
      DB.getSettings(),
      DB.getCharacters(),
      DB.getClasses(),
      DB.getSubjects(),
      DB.getExtracurriculars()
    ]);
    const charArr = DB.toArray(chars).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const subjArr = DB.toArray(subjectsData).filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const exArr = DB.toArray(extrasData);
    const year = settings.currentAcademicYear;
    const sem = settings.currentSemester;
    const scoreLabel = {
      4: 'Sangat Baik',
      3: 'Baik',
      2: 'Mulai Berkembang',
      1: 'Perlu Bimbingan'
    };
    const scoreColor = {
      4: 'var(--primary)',
      3: 'var(--success)',
      2: 'var(--warning)',
      1: 'var(--danger)'
    };
    let html = '';
    for (const student of studentArr) {
      const cls = classes[student.classId];
      const [scores, obsData, parentResp, acadGrades, stuExtra, cocurr, attendance, teacherNote] = await Promise.all([
        DB.getAssessments(year, sem, student.id),
        DB.getObservationsByStudent(student.id),
        DB.getParentResponse(year, sem, student.id),
        DB.getAcademicGrades(year, sem, student.id),
        DB.getStudentExtracurriculars(year, sem, student.id),
        DB.getCocurricular(year, sem, student.id),
        DB.getAttendance(year, sem, student.id),
        DB.getTeacherNote(year, sem, student.id)
      ]);
      const obsArr = DB.toArray(obsData).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 15);
      const charCards = charArr.map(c => {
        const sc = scores[c.id]?.score;
        return `
          <div class="char-progress-item">
            <div class="char-progress-header">
              <span class="char-name">${c.name}</span>
              <span class="char-score" style="color:${sc ? scoreColor[sc] : 'var(--text-muted)'}">
                ${sc ? scoreLabel[sc] : 'Belum dinilai'}
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${sc ? (sc / 4 * 100) : 0}%;background:${sc ? scoreColor[sc] : '#e2e8f0'}"></div>
            </div>
          </div>`;
      }).join('');
      const vals = charArr.map(c => scores[c.id]?.score).filter(Boolean);
      const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
      const obsHtml = obsArr.length ? obsArr.map(o => {
        const ch = charArr.find(c => c.id === o.characterId);
        return `
          <div class="obs-item ${o.type === 'positive' ? 'obs-positive' : 'obs-warning'}">
            <div class="obs-meta">
              <span class="badge ${o.type === 'positive' ? 'badge-success' : 'badge-warning'}">${o.type === 'positive' ? 'Positif' : 'Perlu Bimbingan'}</span>
              <span class="obs-date text-muted">${o.date || ''}</span>
            </div>
            <p class="obs-note">${o.note || '-'}</p>
            <p class="text-muted" class="obs-char-meta">${ch ? ch.name : ''}</p>
          </div>`;
      }).join('') : '<p class="text-muted" >Belum ada catatan observasi dari guru.</p>';
      const acadHtml = subjArr.map(s => {
        const g = acadGrades ? acadGrades[s.id] : null;
        return `
          <tr>
            <td>${s.name}</td>
            <td class="text-center"><strong>${g && g.score ? g.score : '-'}</strong></td>
            <td class="text-muted cocurr-desc">${g && g.desc ? g.desc : '-'}</td>
          </tr>
        `;
      }).join('');
      const extraHtml = DB.toArray(stuExtra || {}).map(e => {
        const baseEx = exArr.find(x => x.id === e.extraId);
        return `<tr><td>${baseEx ? baseEx.name : 'Ekstrakurikuler'}</td><td>${e.score || '-'}</td><td>${e.desc || '-'}</td></tr>`;
      }).join('') || '<tr><td colspan="3" class="text-muted text-center">Belum ada data ekstrakurikuler.</td></tr>';
      const cocurrHtml = DB.toArray(cocurr || {}).map(c => `
        <div class="cocurr-item">
          <strong>${c.title || 'Proyek'}</strong><br>
          <span class="student-report-profile__meta" class="text-muted">${c.desc || '-'}</span>
        </div>
      `).join('') || '<p class="text-muted">Belum ada catatan proyek.</p>';
      const att = attendance || {};
      const attHtml = `
        <table class="table" >
          <tr><td class="table-col-lg">Sakit</td><td ><strong>${att.sakit || 0}</strong> hari</td></tr>
          <tr><td>Izin</td><td><strong>${att.izin || 0}</strong> hari</td></tr>
          <tr><td>Tanpa Keterangan</td><td><strong>${att.alpa || 0}</strong> hari</td></tr>
        </table>
      `;
      html += `
        <section class="student-report" >
          <!-- Profil Singkat -->
          <div class="card student-report-profile">
            <div>
              <h3 >${student.name}</h3>
              <p class="text-muted" class="student-report-profile__meta">${cls ? cls.name : '-'} · NIS: ${student.nis || '-'} · ${year} Sem ${sem}</p>
            </div>
            <div class="avg-score" class="avg-score-header">
              <div class="avg-score-label">Skor Karakter</div>
              <div>${avg}<span class="avg-max">/4</span></div>
            </div>
          </div>

          <!-- Navigasi Tabs -->
          <div class="tabs student-report-tabs">
            <button class="btn btn-tab active" data-target="tab-karakter-${student.id}" data-student="${student.id}" data-tab="karakter"><i class="ph ph-star"></i> Karakter</button>
            <button class="btn btn-tab" data-target="tab-akademik-${student.id}" data-student="${student.id}" data-tab="akademik"><i class="ph ph-books"></i> Akademik</button>
            <button class="btn btn-tab" data-target="tab-lain-${student.id}" data-student="${student.id}" data-tab="lain"><i class="ph ph-info"></i> Lainnya</button>
          </div>

          <!-- TAB 1: Karakter -->
          <div id="tab-karakter-${student.id}" class="tab-content active">
            <div class="card-grid ortu-grid">
              <div class="card ortu-inner-card">
                <h3 class="card-title ortu-inner-title">Perkembangan Aspek Karakter</h3>
                <div class="char-progress-list">${charCards}</div>
              </div>
              <div class="ortu-sub-grid">
                <div class="card ortu-inner-card">
                  <h3 class="card-title ortu-inner-title">Catatan Observasi Guru</h3>
                  <div class="obs-list">${obsHtml}</div>
                </div>
                <div class="card ortu-inner-card">
                  <h3 class="card-title ortu-inner-title">Grafik Rata-rata</h3>
                  <div class="kepsek-chart-wrap"><canvas id="chart-${student.id}"></canvas></div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: Akademik -->
          <div id="tab-akademik-${student.id}" class="tab-content hidden">
            <div class="card ortu-inner-card">
              <h3 class="card-title ortu-inner-title">Nilai Capaian Kompetensi (Akademik)</h3>
              <div class="table-responsive">
                <table class="table">
                  <thead><tr><th>Mata Pelajaran</th><th class="table-col-md text-center">Nilai</th><th>Deskripsi Capaian</th></tr></thead>
                  <tbody>${acadHtml}</tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TAB 3: Lainnya -->
          <div id="tab-lain-${student.id}" class="tab-content hidden">
            <div class="card-grid ortu-grid">
              <div class="card ortu-inner-card">
                <h3 class="card-title ortu-inner-title">Ketidakhadiran</h3>
                ${attHtml}
              </div>
              <div class="card ortu-inner-card">
                <h3 class="card-title ortu-inner-title">Catatan Wali Kelas</h3>
                <p class="ortu-teacher-note">
                  ${teacherNote ? (teacherNote.note || '-') : '-'}
                </p>
              </div>
              <div class="card ortu-inner-card">
                <h3 class="card-title ortu-inner-title">Ekstrakurikuler</h3>
                <div class="table-responsive"><table class="table"><thead><tr><th>Kegiatan</th><th>Predikat</th><th>Keterangan</th></tr></thead><tbody>${extraHtml}</tbody></table></div>
              </div>
              <div class="card ortu-inner-card">
                <h3 class="card-title ortu-inner-title">Kokurikuler (Proyek Profil Pelajar Pancasila)</h3>
                ${cocurrHtml}
              </div>
            </div>
          </div>

          <!-- TANGGAPAN ORTU (Selalu muncul di bawah) -->
          <div class="card parent-response-card">
            <h3 class="card-title ortu-inner-title">Tanggapan Orang Tua / Wali</h3>
            <div class="form-group" >
              <textarea id="resp-${student.id}" rows="3" placeholder="Tuliskan tanggapan Anda mengenai perkembangan Ananda..." class="ortu-textarea">${parentResp ? (parentResp.response || '') : ''}</textarea>
            </div>
            <button class="btn btn-primary btn-sm btn-save-resp" data-stu="${student.id}"><i class="ph ph-floppy-disk"></i> Simpan Tanggapan</button>
          </div>
        </section>
      `;
    }
    container.innerHTML = html;
    
    container.querySelectorAll('.btn-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.dataset.student;
        const tabName = e.currentTarget.dataset.tab;
        if (studentId && tabName) OrtuPages.switchTab(studentId, tabName);
      });
    });
    container.querySelectorAll('.btn-save-resp').forEach(btn => {
      btn.onclick = async (e) => {
        const studentId = e.target.dataset.stu;
        const respText = document.getElementById(`resp-${studentId}`).value.trim();
        const oldHtml = e.target.innerHTML;
        e.target.disabled = true;
        e.target.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';
        try {
          await DB.saveParentResponse(year, sem, studentId, {
            response: respText,
            updatedBy: Auth.currentUser.uid
          });
          e.target.innerHTML = '<i class="ph ph-check"></i> Tersimpan';
          setTimeout(() => {
            e.target.disabled = false;
            e.target.innerHTML = oldHtml;
          }, 2000);
        } catch (err) {
          alert('Gagal menyimpan tanggapan.');
          e.target.disabled = false;
          e.target.innerHTML = oldHtml;
        }
      };
    });
    for (const student of studentArr) {
      const scores = await DB.getAssessments(year, sem, student.id);
      const labels = charArr.map(c => c.name);
      const values = charArr.map(c => scores[c.id]?.score || 0);
      new Chart(document.getElementById(`chart-${student.id}`), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Skor',
            data: values,
            backgroundColor: values.map(v => v >= 4 ? 'rgba(59,130,246,0.7)' : v >= 3 ? 'rgba(16,185,129,0.7)' : v >= 2 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.5)'),
            borderRadius: 6,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 4,
              ticks: {
                stepSize: 1
              }
            },
            x: {
              ticks: {
                font: {
                  size: 10
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  },
  switchTab(studentId, tabName) {
    const parent = document.querySelector(`#tab-karakter-${studentId}`).parentElement.parentElement;
    parent.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    parent.querySelectorAll('.btn-tab').forEach(b => {
      if (b.dataset.target.includes(studentId)) b.classList.remove('active');
    });
    parent.querySelector(`#tab-${tabName}-${studentId}`).classList.remove('hidden');
    parent.querySelector(`[data-target="tab-${tabName}-${studentId}"]`).classList.add('active');
  }
};