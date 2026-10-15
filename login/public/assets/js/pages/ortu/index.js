const OrtuPages = {
  charts: {},
  async renderDashboard(container) {
    Router.setTitle('Perkembangan Anak', 'Pantau seluruh hasil belajar dan karakter anak Anda.');
    const myStudents = await DB.getStudentsByParent(Auth.currentUser.uid);
    const studentArr = DB.toArray(myStudents);
    if (!studentArr.length) {
      container.innerHTML = `<div class="card panel-callout ortu-empty-panel"><div class="ortu-empty-icon"><i class="ph ph-users-three"></i></div><h3 class="ortu-empty-title">Akun belum terhubung</h3><p class="text-muted">Silakan hubungi wali kelas atau admin sekolah untuk menautkan akun ini ke data anak Anda.</p></div>`;
      return;
    }
    const [settings, chars, classes, subjectsData, extrasData, allUmmiClasses, allUmmiExams] = await Promise.all([
      DB.getSettings(),
      DB.getCharacters(),
      DB.getClasses(),
      DB.getSubjects(),
      DB.getExtracurriculars(),
      DB.getUmmiClasses(),
      DB.getUmmiExams()
    ]);
    const charArr = DB.toArray(chars).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const subjArr = DB.toArray(subjectsData).filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const exArr = DB.toArray(extrasData);
    const ummiClsArr = DB.toArray(allUmmiClasses || {});
    const year = (settings && settings.currentAcademicYear) || '2024/2025';
    const sem = (settings && settings.currentSemester) || 1;
    const scoreLabel = {
      4: 'Sangat Baik',
      3: 'Baik',
      2: 'Mulai Berkembang',
      1: 'Perlu Bimbingan'
    };
    const scoresByStudent = {};
    let switcherHtml = '';
    if (studentArr.length > 1) {
      switcherHtml = `<div class="ortu-child-switcher"><button type="button" class="btn btn-sm btn-outline ortu-child-btn active" data-child-filter="all"><i class="ph ph-users"></i> Semua Anak (${studentArr.length})</button>${studentArr.map(s => `<button type="button" class="btn btn-sm btn-outline ortu-child-btn" data-child-filter="${s.id}"><i class="ph ph-user"></i> ${AppConfig.escapeHtml(s.name)}</button>`).join('')}</div>`;
    }
    let html = switcherHtml;
    for (const student of studentArr) {
      const cls = classes[student.classId];
      const phase = AppConfig.getClassPhase(cls);
      const [scores, obsData, parentResp, acadGrades, stuExtra, cocurr, attendance, teacherNote, ummiJournals] = await Promise.all([
        DB.getAssessments(year, sem, student.id),
        DB.getObservationsByStudent(student.id),
        DB.getParentResponse(year, sem, student.id),
        DB.getAcademicGrades(year, sem, student.id),
        DB.getStudentExtracurriculars(year, sem, student.id),
        DB.getCocurricular(year, sem, student.id),
        DB.getAttendance(year, sem, student.id),
        DB.getTeacherNote(year, sem, student.id),
        DB.getUmmiJournals(student.id)
      ]);
      scoresByStudent[student.id] = scores || {};
      const obsArr = DB.toArray(obsData).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 15);
      const charCards = charArr.map(c => {
        const sc = (scores && scores[c.id]) ? scores[c.id].score : 0;
        return `<div class="char-progress-item"><div class="char-progress-header"><span class="char-name">${AppConfig.escapeHtml(c.name)}</span><span class="char-score char-score--${sc}">${sc ? scoreLabel[sc] : 'Belum dinilai'}</span></div><div class="progress-bar"><div class="progress-fill progress-fill--${sc}"></div></div></div>`;
      }).join('');
      const vals = charArr.map(c => (scores && scores[c.id]) ? scores[c.id].score : 0).filter(Boolean);
      const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
      const obsHtml = obsArr.length ? obsArr.map(o => {
        const ch = charArr.find(c => c.id === o.characterId);
        return `<div class="obs-item ${o.type === 'positive' ? 'obs-positive' : 'obs-warning'}"><div class="obs-meta"><span class="badge ${o.type === 'positive' ? 'badge-success' : 'badge-warning'}">${o.type === 'positive' ? 'Positif' : 'Perlu Bimbingan'}</span><span class="obs-date text-muted">${AppConfig.escapeHtml(o.date || '')}</span></div><p class="obs-note">${AppConfig.escapeHtml(o.note || '-')}</p><p class="obs-char-meta text-muted">${ch ? AppConfig.escapeHtml(ch.name) : ''}</p></div>`;
      }).join('') : '<p class="text-muted">Belum ada catatan observasi dari guru.</p>';
      const acadHtml = subjArr.map(s => {
        const g = acadGrades ? acadGrades[s.id] : null;
        const phVal = g && g.ph ? g.ph : '-';
        const stsVal = g ? (g.sts2 || g.sts1 || '-') : '-';
        const sasVal = g ? (g.sat || g.sas || '-') : '-';
        const scoreVal = g && g.score ? g.score : '-';
        const compVal = g && (g.competency || g.desc) ? AppConfig.escapeHtml(g.competency || g.desc) : '-';
        const chaptersList = g && Array.isArray(g.chapters) && g.chapters.length ? g.chapters.map(c => `
          <div style="font-size:11.5px; margin-top:4px; padding:3px 6px; background:var(--bg-subtle,#f8fafc); border-radius:4px; border:1px solid var(--border-color,#e2e8f0);">
            <strong style="color:var(--text-main);">${AppConfig.escapeHtml(c.title || 'Bab ' + c.chapterNo)}:</strong> Nilai PH: <strong>${c.score}</strong>
            ${c.cp ? `<div class="text-muted" style="font-size:11px; margin-top:2px;">${AppConfig.escapeHtml(c.cp)}</div>` : ''}
          </div>
        `).join('') : '';
        return `
          <tr>
            <td>
              <strong>${AppConfig.escapeHtml(s.name)}</strong>
              ${g && g.bestChapter ? `<div style="margin-top:4px;"><span class="badge badge-success" style="font-size:10px;"><i class="ph ph-trend-up"></i> Bab Terbaik: ${AppConfig.escapeHtml(g.bestChapter.title || 'Bab ' + g.bestChapter.chapterNo)} (${g.bestChapter.score})</span></div>` : ''}
            </td>
            <td class="text-center">${phVal}</td>
            <td class="text-center">${stsVal}</td>
            <td class="text-center">${sasVal}</td>
            <td class="text-center"><span class="badge ${scoreVal !== '-' ? 'badge-primary' : 'badge-neutral'}">${scoreVal}</span></td>
            <td class="cocurr-desc">
              <div style="font-weight:600; color:var(--text-main); line-height:1.4;">${compVal}</div>
              ${chaptersList ? `<div style="margin-top:8px;"><div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:4px;"><i class="ph ph-books"></i> Nilai Harian per Bab:</div>${chaptersList}</div>` : ''}
            </td>
          </tr>
        `;
      }).join('');
      const extraHtml = DB.toArray(stuExtra || {}).map(e => {
        const baseEx = exArr.find(x => x.id === e.extraId);
        return `<tr><td>${baseEx ? AppConfig.escapeHtml(baseEx.name) : 'Ekstrakurikuler'}</td><td>${AppConfig.escapeHtml(e.score || '-')}</td><td>${AppConfig.escapeHtml(e.desc || '-')}</td></tr>`;
      }).join('') || '<tr><td colspan="3" class="text-muted text-center">Belum ada data ekstrakurikuler.</td></tr>';
      const cocurrHtml = DB.toArray(cocurr || {}).map(c => `<div class="cocurr-item"><strong>${AppConfig.escapeHtml(c.title || 'Proyek')}</strong><br><span class="student-report-profile__meta text-muted">${AppConfig.escapeHtml(c.desc || '-')}</span></div>`).join('') || '<p class="text-muted">Belum ada catatan proyek.</p>';
      const att = attendance || {};
      const attHtml = `<table class="table"><tr><td class="table-col-lg">Sakit</td><td><strong>${att.sakit || 0}</strong> hari</td></tr><tr><td>Izin</td><td><strong>${att.izin || 0}</strong> hari</td></tr><tr><td>Tanpa Keterangan</td><td><strong>${att.alpa || 0}</strong> hari</td></tr></table>`;
      const myUmmiClass = ummiClsArr.find(c => c.students && c.students[student.id]);
      const ummiClassName = myUmmiClass ? myUmmiClass.name : (student.ummiClassId || 'Belum Masuk Rombel');
      const currentUmmiLvl = (myUmmiClass && myUmmiClass.students && myUmmiClass.students[student.id] && myUmmiClass.students[student.id].level) || student.ummiLevel || 'Pra-Jilid';
      const studentExams = DB.toArray(allUmmiExams || {}).filter(ex => ex.studentId === student.id).sort((a, b) => (b.requestDate || '').localeCompare(a.requestDate || ''));
      const latestExam = studentExams[0];
      let examBadge = '';
      if (latestExam) {
        if (latestExam.status === 'pending') {
          examBadge = `<div class="panel-callout" style="padding:10px 14px;border-radius:8px;margin-bottom:12px;background:var(--bg-panel);border-left:4px solid var(--primary-color);"><i class="ph ph-hourglass"></i> Pengajuan Ujian Kenaikan ke <strong>${AppConfig.escapeHtml(latestExam.targetLevel)}</strong> sedang menunggu penjadwalan oleh Koordinator Ummi.</div>`;
        } else if (latestExam.status === 'scheduled') {
          examBadge = `<div class="panel-callout" style="padding:10px 14px;border-radius:8px;margin-bottom:12px;background:var(--bg-panel);border-left:4px solid #f59e0b;"><i class="ph ph-calendar-check"></i> <strong>Jadwal Ujian Munaqasyah:</strong> ${AppConfig.escapeHtml(latestExam.scheduledDate)} oleh Koordinator/Penguji ${AppConfig.escapeHtml(latestExam.examinerName || 'Koordinator')}.</div>`;
        } else if (latestExam.status === 'passed') {
          examBadge = `<div class="panel-callout" style="padding:10px 14px;border-radius:8px;margin-bottom:12px;background:var(--bg-panel);border-left:4px solid #10b981;"><i class="ph ph-check-fat"></i> <strong>Alhamdulillah Lolos!</strong> Ananda telah dinyatakan lulus dan naik ke tingkatan <strong>${AppConfig.escapeHtml(latestExam.targetLevel)}</strong>.</div>`;
        } else if (latestExam.status === 'rejected') {
          examBadge = `<div class="panel-callout" style="padding:10px 14px;border-radius:8px;margin-bottom:12px;background:var(--bg-panel);border-left:4px solid #ef4444;"><i class="ph ph-warning-circle"></i> Catatan Koordinator: ${AppConfig.escapeHtml(latestExam.decisionNotes || 'Perlu pemantapan di jilid saat ini.')}</div>`;
        }
      }
      const jArr = DB.toArray(ummiJournals || {}).sort((a, b) => (b.meetingNumber || 0) - (a.meetingNumber || 0));
      const journalRows = jArr.length ? jArr.map(j => {
        const scoreInfo = (window.UMMIPages && UMMIPages.GRADE_PREDICATES && UMMIPages.GRADE_PREDICATES[j.score]) ? UMMIPages.GRADE_PREDICATES[j.score] : { label: j.score || '-', desc: '' };
        const parentAction = j.parentVerified ? `<span class="badge badge-success"><i class="ph ph-check-circle"></i> Disimak (${AppConfig.escapeHtml(j.parentVerifiedBy || 'Orang Tua')})</span>` : `<button type="button" class="btn btn-sm btn-outline btn-verify-ummi" data-student="${student.id}" data-journal="${j.id}"><i class="ph ph-check"></i> Simak di Rumah</button>`;
        return `<tr><td class="text-center"><strong>${j.meetingNumber || '-'}</strong></td><td>${AppConfig.escapeHtml(j.date || '-')}</td><td><span class="badge badge-secondary">${AppConfig.escapeHtml(j.level || '-')}</span></td><td>Hal/Ayat: <strong>${AppConfig.escapeHtml(j.pageOrAyat || '-')}</strong></td><td>${AppConfig.escapeHtml(j.material || '-')}</td><td><span class="badge badge-primary">${AppConfig.escapeHtml(scoreInfo.label || j.score)}</span> <div class="text-muted small">${AppConfig.escapeHtml(scoreInfo.desc || '')}</div></td><td><span class="text-success"><i class="ph ph-user-check"></i> ${AppConfig.escapeHtml(j.teacherName || 'Guru')}</span></td><td>${parentAction}</td><td class="text-muted small">${AppConfig.escapeHtml(j.notes || '-')}</td></tr>`;
      }).join('') : '<tr><td colspan="9" class="text-center text-muted p-3">Belum ada catatan jurnal prestasi Ummi.</td></tr>';
      html += `<section class="student-report" data-student-card="${student.id}"><div class="card student-report-profile"><div><h3>${AppConfig.escapeHtml(student.name)}</h3><p class="student-report-profile__meta text-muted">${cls ? AppConfig.escapeHtml(cls.name) : '-'} · Fase ${AppConfig.escapeHtml(phase)} · NIS: ${AppConfig.escapeHtml(student.nis || '-')} · NISN: ${AppConfig.escapeHtml(student.nisn || '-')} · TP ${AppConfig.escapeHtml(year)} Sem ${AppConfig.escapeHtml(String(sem))} · <span class="badge badge-success"><i class="ph ph-book-open"></i> Ummi: ${AppConfig.escapeHtml(currentUmmiLvl)}</span></p></div><div class="avg-score-header"><div class="avg-score-label">Skor Karakter</div><div class="avg-score">${avg}<span class="avg-max">/4</span></div></div></div><div class="tabs student-report-tabs"><button type="button" class="btn btn-tab active" data-target="tab-karakter-${student.id}" data-student="${student.id}" data-tab="karakter"><i class="ph ph-star"></i> Karakter</button><button type="button" class="btn btn-tab" data-target="tab-akademik-${student.id}" data-student="${student.id}" data-tab="akademik"><i class="ph ph-books"></i> Akademik</button><button type="button" class="btn btn-tab" data-target="tab-ummi-${student.id}" data-student="${student.id}" data-tab="ummi"><i class="ph ph-book-open"></i> Al-Qur'an (Ummi)</button><button type="button" class="btn btn-tab" data-target="tab-lain-${student.id}" data-student="${student.id}" data-tab="lain"><i class="ph ph-info"></i> Lainnya</button></div><div id="tab-karakter-${student.id}" class="tab-content active"><div class="card-grid ortu-grid"><div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Perkembangan Aspek Karakter (P3)</h3><div class="char-progress-list">${charCards}</div></div><div class="ortu-sub-grid"><div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Catatan Observasi Guru</h3><div class="obs-list">${obsHtml}</div></div><div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Grafik Profil Karakter</h3><div class="kepsek-chart-wrap"><canvas id="chart-${student.id}"></canvas></div></div></div></div></div><div id="tab-akademik-${student.id}" class="tab-content hidden"><div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Nilai Capaian Kompetensi (Akademik)</h3><div class="table-responsive"><table class="table"><thead><tr><th>Mata Pelajaran</th><th class="text-center">PH</th><th class="text-center">STS</th><th class="text-center">SAS/SAT</th><th class="text-center">Rapor</th><th>Capaian Kompetensi (CP/TP)</th></tr></thead><tbody>${acadHtml}</tbody></table></div></div></div><div id="tab-ummi-${student.id}" class="tab-content hidden"><div class="card ortu-inner-card"><div class="d-flex justify-between items-center" style="gap:15px;flex-wrap:wrap;border-bottom:1px solid var(--border-color);padding-bottom:12px;margin-bottom:15px;"><div><h3 class="card-title ortu-inner-title" style="margin:0;"><i class="ph ph-book-open"></i> Pembelajaran Al-Qur'an (Metode Ummi)</h3><p class="text-muted small" style="margin:4px 0 0 0;">Rombel: <strong>${AppConfig.escapeHtml(ummiClassName)}</strong>${myUmmiClass && myUmmiClass.room ? ` · <i class="ph ph-map-pin"></i> ${AppConfig.escapeHtml(myUmmiClass.room)}` : ''} · Nilai Rapor BTQ: <strong>${acadGrades && acadGrades['SUB_BTQ'] ? acadGrades['SUB_BTQ'].score : '-'}</strong></p></div><div><span class="badge badge-success" style="font-size:13px;padding:6px 12px;"><i class="ph ph-bookmark-simple"></i> Tingkatan: ${AppConfig.escapeHtml(currentUmmiLvl)}</span></div></div>${examBadge}<h4 style="margin:16px 0 8px 0;font-size:14px;color:var(--text-color);"><i class="ph ph-notebook"></i> Kartu Prestasi & Jurnal Harian Santri</h4><div class="table-responsive"><table class="table"><thead><tr><th class="text-center" style="width:45px;">TM</th><th>Tanggal</th><th>Jilid</th><th>Hal / Ayat</th><th>Materi Pokok</th><th>Nilai</th><th>Simak Guru</th><th>Simak Ortu</th><th>Catatan</th></tr></thead><tbody>${journalRows}</tbody></table></div></div></div><div id="tab-lain-${student.id}" class="tab-content hidden"><div class="card-grid ortu-grid"><div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Ketidakhadiran</h3>${attHtml}</div><div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Catatan Wali Kelas</h3><p class="ortu-teacher-note">${teacherNote ? AppConfig.escapeHtml(teacherNote.note || '-') : '-'}</p></div><div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Ekstrakurikuler</h3><div class="table-responsive"><table class="table"><thead><tr><th>Kegiatan</th><th>Predikat</th><th>Keterangan</th></tr></thead><tbody>${extraHtml}</tbody></table></div></div><div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Kokurikuler (Proyek P5)</h3>${cocurrHtml}</div></div></div><div class="card parent-response-card"><h3 class="card-title ortu-inner-title">Tanggapan Orang Tua / Wali</h3><div class="form-group"><textarea id="resp-${student.id}" rows="3" placeholder="Tuliskan tanggapan Anda mengenai perkembangan Ananda..." class="ortu-textarea">${parentResp ? AppConfig.escapeHtml(parentResp.response || '') : ''}</textarea></div><button type="button" class="btn btn-primary btn-sm btn-save-resp" data-stu="${student.id}"><i class="ph ph-floppy-disk"></i> Simpan Tanggapan</button></div></section>`;
    }
    container.innerHTML = html;
    if (studentArr.length > 1) {
      container.querySelectorAll('[data-child-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          container.querySelectorAll('[data-child-filter]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.dataset.childFilter;
          container.querySelectorAll('[data-student-card]').forEach(card => {
            if (filter === 'all' || card.dataset.studentCard === filter) {
              card.classList.remove('hidden');
            } else {
              card.classList.add('hidden');
            }
          });
        });
      });
    }
    container.querySelectorAll('.btn-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.dataset.student;
        const tabName = e.currentTarget.dataset.tab;
        if (studentId && tabName) OrtuPages.switchTab(studentId, tabName);
      });
    });
    container.querySelectorAll('.btn-verify-ummi').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const targetBtn = e.currentTarget;
        const studentId = targetBtn.dataset.student;
        const journalId = targetBtn.dataset.journal;
        targetBtn.disabled = true;
        targetBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
        try {
          await DB.verifyParentUmmiJournal(studentId, journalId, (Auth.currentUser && Auth.currentUser.name) || 'Orang Tua / Wali');
          await OrtuPages.renderDashboard(container);
        } catch (err) {
          alert('Gagal memverifikasi jurnal.');
          targetBtn.disabled = false;
          targetBtn.innerHTML = '<i class="ph ph-check"></i> Simak di Rumah';
        }
      });
    });
    container.querySelectorAll('.btn-save-resp').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const targetBtn = e.currentTarget;
        const studentId = targetBtn.dataset.stu;
        const respEl = document.getElementById(`resp-${studentId}`);
        const respText = respEl ? respEl.value.trim() : '';
        const oldHtml = targetBtn.innerHTML;
        targetBtn.disabled = true;
        targetBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
        try {
          await DB.saveParentResponse(year, sem, studentId, {
            response: respText,
            updatedBy: Auth.currentUser.uid
          });
          targetBtn.innerHTML = '<i class="ph ph-check"></i> Tersimpan';
          setTimeout(() => {
            targetBtn.disabled = false;
            targetBtn.innerHTML = oldHtml;
          }, 2000);
        } catch (err) {
          alert('Gagal menyimpan tanggapan.');
          targetBtn.disabled = false;
          targetBtn.innerHTML = oldHtml;
        }
      });
    });
    for (const student of studentArr) {
      const scores = scoresByStudent[student.id] || {};
      const labels = charArr.map(c => c.name);
      const values = charArr.map(c => (scores[c.id] && scores[c.id].score) || 0);
      const canvas = document.getElementById(`chart-${student.id}`);
      if (typeof Chart !== 'undefined' && canvas) {
        if (OrtuPages.charts[student.id]) {
          OrtuPages.charts[student.id].destroy();
        }
        OrtuPages.charts[student.id] = new Chart(canvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Skor Karakter',
              data: values,
              backgroundColor: values.map(v => v >= 4 ? 'rgba(59,130,246,0.75)' : v >= 3 ? 'rgba(16,185,129,0.75)' : v >= 2 ? 'rgba(245,158,11,0.75)' : 'rgba(239,68,68,0.75)'),
              borderRadius: 6,
              maxBarThickness: 36
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
    }
  },
  switchTab(studentId, tabName) {
    const card = document.querySelector(`[data-student-card="${studentId}"]`);
    if (!card) return;
    card.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    card.querySelectorAll('.btn-tab').forEach(b => {
      if (b.dataset.student === studentId) b.classList.remove('active');
    });
    const targetTab = card.querySelector(`#tab-${tabName}-${studentId}`);
    if (targetTab) targetTab.classList.remove('hidden');
    const targetBtn = card.querySelector(`[data-target="tab-${tabName}-${studentId}"]`);
    if (targetBtn) targetBtn.classList.add('active');
  },
  async renderReportCard(container) {
    Router.setTitle('Rapor Digital Siswa', 'Lembar Rapor Resmi Kurikulum Merdeka');
    const myStudents = await DB.getStudentsByParent(Auth.currentUser.uid);
    const studentArr = DB.toArray(myStudents);
    if (!studentArr.length) {
      container.innerHTML = `<div class="card panel-callout ortu-empty-panel"><div class="ortu-empty-icon"><i class="ph ph-users-three"></i></div><h3 class="ortu-empty-title">Akun belum terhubung</h3><p class="text-muted">Silakan hubungi wali kelas atau admin sekolah untuk menautkan akun ini ke data anak Anda.</p></div>`;
      return;
    }
    const [settings, classes] = await Promise.all([
      DB.getSettings(),
      DB.getClasses()
    ]);
    const year = settings?.currentAcademicYear || '2024/2025';
    const sem = settings?.currentSemester || 1;
    let cardsHtml = '';
    for (const student of studentArr) {
      const cls = classes[student.classId] || {};
      const finalization = await DB.getRaporFinalization(year, sem, student.classId);
      const isFin = finalization && finalization.finalized;
      cardsHtml += `
        <div class="card section-block" style="margin-bottom:16px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 style="margin:0 0 6px 0; font-size:16px;">${AppConfig.escapeHtml(student.name)}</h3>
              <p class="text-muted" style="margin:0; font-size:13px;">
                Kelas: <strong>${AppConfig.escapeHtml(cls.name || '-')}</strong> · NISN: <strong>${AppConfig.escapeHtml(student.nisn || '-')}</strong> · Tahun Ajaran: <strong>${AppConfig.escapeHtml(year)}</strong> (Semester ${sem})
              </p>
            </div>
            <div>
              ${isFin ? '<span class="badge badge-success" style="font-size:12px; padding:6px 12px;"><i class="ph ph-check-circle"></i> Siap Diunduh & Dicetak</span>' : '<span class="badge badge-warning" style="font-size:12px; padding:6px 12px;"><i class="ph ph-clock"></i> Proses Rekapitulasi Rapor</span>'}
            </div>
          </div>
          <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--border-color,#e2e8f0); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <p class="text-muted" style="margin:0; font-size:12.5px;">
              ${isFin ? 'Rapor semester ini telah difinalisasi oleh wali kelas. Anda dapat langsung mencetak lembar rapor format F4 resmi.' : 'Wali kelas sedang melakukan rekapitulasi nilai akhir. Lembar cetak rapor akan dapat diunduh setelah difinalisasi oleh sekolah.'}
            </p>
            <div style="display:inline-flex; gap:8px;">
              <a href="print.html?id=${student.id}" target="_blank" class="btn ${isFin ? 'btn-primary' : 'btn-outline'}" style="display:inline-flex; align-items:center; gap:6px;">
                <i class="ph ph-printer"></i> ${isFin ? 'Cetak Lembar Rapor F4' : 'Pratinjau Lembar Rapor'}
              </a>
            </div>
          </div>
        </div>
      `;
    }
    container.innerHTML = `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:18px; margin:0 0 6px 0;"><i class="ph ph-file-pdf"></i> Lembar Rapor Resmi Siswa</h2>
        <p class="text-muted" style="margin:0; font-size:13px;">Akses dan cetak lembar e-rapor resmi Kurikulum Merdeka untuk putra-putri Anda.</p>
      </div>
      ${cardsHtml}
    `;
  }
};