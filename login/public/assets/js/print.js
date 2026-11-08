const urlParams = new URLSearchParams(window.location.search);
document.addEventListener('DOMContentLoaded', () => {
  const type = urlParams.get('type') || 'report';
  const id = urlParams.get('id');
  const container = document.getElementById('print-container');
  if (!id) {
    container.innerHTML = '<p class="print-error-text">Error: Parameter ID tidak ditemukan.</p>';
    return;
  }
  const checkDB = setInterval(() => {
    if (typeof DB !== 'undefined' && firebase.auth) {
      clearInterval(checkDB);
      firebase.auth().onAuthStateChanged(async user => {
        if (user) {
          if (type === 'certificate') {
            await generateCertificate(id, container);
          } else {
            await generateReport(id, container);
          }
        } else {
          container.innerHTML = '<p class="print-error-text">Harap login terlebih dahulu untuk mencetak dokumen resmi.</p>';
        }
      });
    }
  }, 100);
});
async function generateReport(studentId, container) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const student = await DB.getStudent(studentId);
    if (!student) throw new Error('Siswa tidak ditemukan');
    const [settings, classes, subjectsObj, ekskulsObj, charactersObj] = await Promise.all([
      DB.getSettings(),
      DB.getClasses(),
      DB.getSubjects(),
      DB.getExtracurriculars(),
      DB.getCharacters()
    ]);
    const cls = classes[student.classId] || {
      name: '-',
      phase: '-',
      teacherId: null
    };
    const year = urlParams.get('year') || settings.currentAcademicYear;
    const sem = parseInt(urlParams.get('sem'), 10) || settings.currentSemester || 1;
    const [academic, cocu, stuEks, att, note, parentResp, chars, rankResult] = await Promise.all([
      DB.getAcademicGrades(year, sem, studentId),
      DB.getCocurricular(year, sem, studentId),
      DB.getStudentExtracurriculars(year, sem, studentId),
      DB.getAttendance(year, sem, studentId),
      DB.getTeacherNote(year, sem, studentId),
      DB.getParentResponse(year, sem, studentId),
      DB.getAssessments(year, sem, studentId),
      DB.getStudentClassRank(year, sem, studentId, student.classId).catch(() => null)
    ]);
    const rankText = (rankResult && rankResult.isTop10 && rankResult.text) ? rankResult.text : '';
    const normCategory = (cat) => {
      const c = (cat || '').toLowerCase();
      if (c === 'agama') return 'Agama';
      if (c === 'standar' || c === 'umum') return 'Umum';
      if (c === 'lokal' || c === 'muatan lokal') return 'Muatan Lokal';
      if (c === 'kekhasan') return 'Kekhasan';
      return 'Umum';
    };
    const classSubKeys = cls && cls.subjectTeachers ? Object.keys(cls.subjectTeachers) : [];
    const allSubs = DB.toArray(subjectsObj);
    const subjects = (classSubKeys.length > 0 ? allSubs.filter(s => classSubKeys.includes(s.id) || s.id === 'SUB_BTQ') : allSubs)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const ekskuls = DB.toArray(ekskulsObj);
    const characters = DB.toArray(charactersObj).sort((a, b) => (a.order || 0) - (b.order || 0));
    const getGroupHtml = (groupName, startNo, groupLabel) => {
      const groupSubjects = subjects.filter(s => normCategory(s.category) === groupName);
      if (!groupSubjects.length) return '';
      let html = `
        <tr>
            <td class="text-center" rowspan="${groupSubjects.length + 1}" style="vertical-align: top; padding-top: 6px;">${startNo}.</td>
            <td><strong>${groupLabel}</strong></td>
            <td class="text-center"></td>
            <td class="capaian-box"></td>
        </tr>
      `;
      groupSubjects.forEach((sub, idx) => {
        const grade = academic[sub.id] || {};
        html += `
          <tr class="sub-subject">
              <td>${startNo}.${idx + 1} ${sub.name}</td>
              <td class="text-center">${grade.score || ''}</td>
              <td class="capaian-box">
                  ${grade.descPositive ? '<p>' + grade.descPositive + '</p>' : (grade.competency ? '<p>' + grade.competency + '</p>' : '')}
                  ${grade.descNegative ? '<p>' + grade.descNegative + '</p>' : ''}
                  ${!grade.descPositive && !grade.descNegative && !grade.competency ? '<p>-</p>' : ''}
              </td>
          </tr>
        `;
      });
      return html;
    };
    const getGeneralHtml = (startNo) => {
      const generalSubjects = subjects.filter(s => normCategory(s.category) === 'Umum');
      if (!generalSubjects.length) return {
        html: '',
        count: 0
      };
      let html = '';
      generalSubjects.forEach((sub, idx) => {
        const grade = academic[sub.id] || {};
        html += `
          <tr>
              <td class="text-center">${startNo + idx}.</td>
              <td>${sub.name}</td>
              <td class="text-center">${grade.score || ''}</td>
              <td class="capaian-box">
                  ${grade.descPositive ? '<p>' + grade.descPositive + '</p>' : (grade.competency ? '<p>' + grade.competency + '</p>' : '')}
                  ${grade.descNegative ? '<p>' + grade.descNegative + '</p>' : ''}
                  ${!grade.descPositive && !grade.descNegative && !grade.competency ? '<p>-</p>' : ''}
              </td>
          </tr>
        `;
      });
      return {
        html,
        count: generalSubjects.length
      };
    };
    let tableHtml = '';
    let currentNo = 1;
    tableHtml += getGroupHtml('Agama', currentNo, 'Pendidikan Agama');
    if (subjects.some(s => normCategory(s.category) === 'Agama')) currentNo++;
    const general = getGeneralHtml(currentNo);
    tableHtml += general.html;
    currentNo += general.count;
    tableHtml += getGroupHtml('Muatan Lokal', currentNo, 'Muatan Lokal');
    if (subjects.some(s => normCategory(s.category) === 'Muatan Lokal')) currentNo++;
    const kekhasanSubjects = subjects.filter(s => normCategory(s.category) === 'Kekhasan');
    kekhasanSubjects.forEach((sub, idx) => {
      const grade = academic[sub.id] || {};
      tableHtml += `
        <tr>
            <td class="text-center">${currentNo + idx}.</td>
            <td>${sub.name}</td>
            <td class="text-center">${grade.score || ''}</td>
            <td class="capaian-box">
                ${grade.descPositive ? '<p>' + grade.descPositive + '</p>' : (grade.competency ? '<p>' + grade.competency + '</p>' : '')}
                ${grade.descNegative ? '<p>' + grade.descNegative + '</p>' : ''}
                ${!grade.descPositive && !grade.descNegative && !grade.competency ? '<p>-</p>' : ''}
            </td>
        </tr>
      `;
    });
    const myEks = DB.toArray(stuEks);
    let eksHtml = '';
    if (myEks.length) {
      myEks.forEach((e, i) => {
        const masterEks = ekskuls.find(x => x.id === e.id);
        eksHtml += `
          <tr>
              <td class="text-center">${i + 1}</td>
              <td>${masterEks ? masterEks.name : '-'}</td>
              <td>${e.description || '-'}</td>
          </tr>
        `;
      });
    } else {
      eksHtml = '<tr><td colspan="3" class="text-center text-muted">Belum ada data ekstrakurikuler</td></tr>';
    }
    const kepsekName = settings.kepsekName || 'Dhani Harsyahyadi, S.H.I.';
    const headmasterNBM = settings.kepsekNBM || '';
    let waliKelasName = '_______________';
    if (cls.teacherId) {
      const teacher = await DB.getUser(cls.teacherId);
      if (teacher && teacher.name) waliKelasName = teacher.name;
    }
    let characterRows = '';
    const scoreLabel = {
      4: 'Sangat Baik',
      3: 'Baik',
      2: 'Mulai Berkembang',
      1: 'Perlu Bimbingan'
    };
    characters.forEach((c, idx) => {
      const sc = chars[c.id]?.score;
      characterRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${c.name}</td>
          <td class="text-center">${sc ? sc : '-'}</td>
          <td>${sc ? scoreLabel[sc] : '-'}</td>
        </tr>
      `;
    });
    const lampiranHtml = `
      <div class="page" style="page-break-before: always; margin-top: 20px;">
        <h2 class="text-center" style="margin-bottom:20px;">LAMPIRAN PERKEMBANGAN KARAKTER</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 8%;">No.</th>
              <th style="width: 52%;">Aspek Karakter / Akhlak</th>
              <th style="width: 15%;">Skor (1-4)</th>
              <th style="width: 25%;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${characterRows || '<tr><td colspan="4" class="text-center text-muted">Belum ada data karakter</td></tr>'}
          </tbody>
        </table>
        <p style="font-size: 12px; color: #555; margin-top: 10px;">Keterangan Skor:<br>4 = Sangat Baik<br>3 = Baik<br>2 = Mulai Berkembang<br>1 = Perlu Bimbingan</p>
      </div>
    `;
    container.innerHTML = `
      <div class="print-actions">
        <button type="button" class="btn-action btn-close" id="btn-close-print"><i class="ph ph-x"></i> Tutup</button>
        <button type="button" class="btn-action btn-print" id="btn-do-print"><i class="ph ph-printer"></i> Cetak Rapor (F4)</button>
      </div>
      <div class="page">
          <table class="identity-table">
              <tr>
                  <td style="width: 15%;">Nama Murid</td>
                  <td style="width: 35%;">: <span>${student.name || '-'}</span></td>
                  <td style="width: 15%;">Kelas</td>
                  <td style="width: 35%;">: <span>${cls.name}</span></td>
              </tr>
              <tr>
                  <td>NIS / NISN</td>
                  <td>: <span>${(window.AppConfig && AppConfig.formatStudentIdentity) ? AppConfig.formatStudentIdentity(student, 'slash') : [student.nis, student.nisn].filter(Boolean).join(' / ') || '-'}</span></td>
                  <td>Fase</td>
                  <td>: <span>${(window.AppConfig && AppConfig.getClassPhase) ? AppConfig.getClassPhase(cls) : (cls.phase || '-')}</span></td>
              </tr>
              <tr>
                  <td>Sekolah</td>
                  <td>: <span>SD Muhammadiyah 1 Sedati</span></td>
                  <td>Semester</td>
                  <td>: <span>${sem}</span></td>
              </tr>
              <tr>
                  <td>Alamat</td>
                  <td>: <span>Jl. H. Syukur No. 65, Sedati</span></td>
                  <td>Tahun Ajaran</td>
                  <td>: <span>${year}</span></td>
              </tr>
          </table>
          <table class="data-table">
              <thead>
                  <tr>
                      <th style="width: 6%;">No.</th>
                      <th style="width: 28%;">Mata Pelajaran</th>
                      <th style="width: 10%;">Nilai Akhir</th>
                      <th style="width: 56%;">Capaian Kompetensi</th>
                  </tr>
              </thead>
              <tbody>
                  ${tableHtml || '<tr><td colspan="4" class="text-center text-muted">Belum ada nilai akademik</td></tr>'}
                  ${rankText ? `<tr class="rank-row"><td colspan="2" class="text-center"><strong>Peringkat Kelas</strong></td><td colspan="2"><strong>${rankText}</strong></td></tr>` : ''}
              </tbody>
          </table>
          <div class="section-header">Kokurikuler</div>
          <div class="content-box">
            ${cocu && cocu.description ? cocu.description.replace(/\\n/g, '<br>') : '-'}
          </div>
          <table class="data-table">
              <thead>
                  <tr>
                      <th style="width: 6%;">No.</th>
                      <th style="width: 44%;">Ekstrakurikuler</th>
                      <th style="width: 50%;">Keterangan</th>
                  </tr>
              </thead>
              <tbody>
                  ${eksHtml}
              </tbody>
          </table>
          <div class="flex-row">
              <div class="flex-col-left">
                  <table class="attendance-table">
                      <thead>
                          <tr>
                              <th colspan="2">Ketidakhadiran</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td style="width: 60%;">Sakit</td>
                              <td>: <span>${att ? (att.sakit || 0) : 0}</span> hari</td>
                          </tr>
                          <tr>
                              <td>Izin</td>
                              <td>: <span>${att ? (att.izin || 0) : 0}</span> hari</td>
                          </tr>
                          <tr>
                              <td>Tanpa Keterangan</td>
                              <td>: <span>${att ? (att.alpa || 0) : 0}</span> hari</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
              <div class="flex-col-right">
                  <div class="section-header">Catatan Wali Kelas</div>
                  <div class="content-box catatan-wali-box">
                    ${note && note.note ? note.note.replace(/\\n/g, '<br>') : '-'}
                  </div>
              </div>
          </div>
          <table class="signature-table-dual">
              <tr>
                  <td class="sig-left">
                      Orang Tua / Wali Murid
                      <div class="signature-space"></div>
                      ( <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> )
                  </td>
                  <td class="sig-right">
                      <span>Sedati</span>, <span>___ ________ ${new Date().getFullYear()}</span><br>
                      Wali Kelas
                      <div class="signature-space"></div>
                      ( <u>${waliKelasName}</u> )
                  </td>
              </tr>
              <tr>
                  <td colspan="2" class="sig-center">
                      Mengetahui,<br>Kepala Sekolah
                      <div class="signature-space"></div>
                      ( <u>${kepsekName}</u> )
                      ${headmasterNBM ? '<br><span class="signature-nbm">NBM: ' + headmasterNBM + '</span>' : ''}
                  </td>
              </tr>
          </table>
      </div>
      ${lampiranHtml}
    `;
      const btnClose = document.getElementById('btn-close-print');
      if (btnClose) btnClose.addEventListener('click', () => window.close());
      const btnPrint = document.getElementById('btn-do-print');
      if (btnPrint) btnPrint.addEventListener('click', () => window.print());
    } catch (err) {
    container.innerHTML = '<p class="print-error-text">Terjadi kesalahan: ' + err.message + '</p>';
  }
}
async function generateCertificate(achieveId, container) {
  try {
    const achieve = await DB._read(`student_affairs/achievements/${achieveId}`);
    if (!achieve) throw new Error('Data prestasi/sertifikat tidak ditemukan.');
    const student = (achieve.studentId ? await DB.getStudent(achieve.studentId) : null) || {
      name: achieve.studentName || 'Siswa Berprestasi',
      nis: '-',
      nisn: '-'
    };
    const classes = await DB.getClasses().catch(() => ({}));
    const cls = classes[student.classId] || { name: student.className || '-' };
    const isJuara = (achieve.participationType || 'Juara') === 'Juara' || (achieve.rank && !achieve.rank.toLowerCase().includes('partisipan') && !achieve.rank.toLowerCase().includes('peserta'));
    const certTitle = isJuara ? 'SERTIFIKAT PENGHARGAAN' : 'SERTIFIKAT APRESIASI PARTISIPASI';
    const yr = achieve.year || (achieve.date ? achieve.date.slice(0, 4) : new Date().getFullYear());
    const certNo = achieve.certificateNo || `0${(achieveId || '').slice(-4).toUpperCase()}/SERT-PRESTASI/SDM1/${yr}`;
    const dateFormatted = achieve.date ? new Date(achieve.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const rankText = achieve.rank || (isJuara ? 'Juara' : 'Partisipan / Kontingen');
    const narrativeText = isJuara
      ? `Atas dedikasi, ketekunan, dan prestasi gemilang yang berhasil diraih sebagai <strong>${AppConfig.escapeHtml(rankText)}</strong> dalam ajang <strong>${AppConfig.escapeHtml(achieve.title || 'Kejuaraan')}</strong> (Tingkat ${AppConfig.escapeHtml(achieve.level || 'Kabupaten')}) bidang ${AppConfig.escapeHtml(achieve.category || 'Prestasi')} yang diselenggarakan pada tanggal ${dateFormatted}.`
      : `Atas dedikasi, semangat juang, dan partisipasi aktif yang membanggakan sebagai <strong>Kontingen / Peserta Lomba</strong> dalam ajang <strong>${AppConfig.escapeHtml(achieve.title || 'Kegiatan')}</strong> (Tingkat ${AppConfig.escapeHtml(achieve.level || 'Kabupaten')}) bidang ${AppConfig.escapeHtml(achieve.category || 'Prestasi')} yang diselenggarakan pada tanggal ${dateFormatted}.`;
    container.innerHTML = `
      <div class="print-actions-bar">
        <button type="button" class="btn-print-action btn-print-close" id="btn-cert-close"><i class="ph ph-x"></i> Tutup</button>
        <button type="button" class="btn-print-action btn-print-run" id="btn-cert-print"><i class="ph ph-printer"></i> Cetak Sertifikat</button>
      </div>
      <div class="certificate-page">
        <div class="certificate-outer-frame">
          <div class="certificate-inner-frame">
            <div class="certificate-header">
              <img src="../../assets/img/logo/dikdasmen.webp" alt="Logo Dikdasmen" class="cert-logo-left">
              <div class="cert-header-text">
                <h4 class="cert-org">MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL</h4>
                <h4 class="cert-pcm">PIMPINAN CABANG MUHAMMADIYAH SEDATI</h4>
                <h2 class="cert-school-name">SD MUHAMMADIYAH 1 SEDATI</h2>
                <p class="cert-school-address">Alamat: Jl. H. Syukur No. 65, Sedati Gede, Sidoarjo 61253 | Telp: 0859-6439-9398 | Website: musada.sch.id</p>
              </div>
              <img src="../../assets/img/logo/logo.webp" alt="Logo Musada" class="cert-logo-right">
            </div>
            <div class="cert-divider"></div>
            <div class="cert-body">
              <h1 class="cert-title">${certTitle}</h1>
              <p class="cert-no">Nomor: ${AppConfig.escapeHtml(certNo)}</p>
              <p class="cert-lead">Diberikan oleh SD Muhammadiyah 1 Sedati sebagai wujud apresiasi dan kebanggaan kepada:</p>
              <h2 class="cert-student-name">${AppConfig.escapeHtml(student.name)}</h2>
              <p class="cert-student-meta">NIS: <strong>${AppConfig.escapeHtml(AppConfig.getStudentNis(student) || student.nis || '-')}</strong> &nbsp;·&nbsp; NISN: <strong>${AppConfig.escapeHtml(AppConfig.getStudentNisn(student) || student.nisn || '-')}</strong> &nbsp;·&nbsp; Kelas: <strong>${AppConfig.escapeHtml(cls.name || '-')}</strong></p>
              <p class="cert-narrative">${narrativeText}</p>
            </div>
            <div class="cert-footer">
              <div class="cert-sig cert-sig-left">
                <p class="cert-sig-title">Mengetahui,</p>
                <p class="cert-sig-role">Waka Kesiswaan</p>
                <div class="cert-sig-space"></div>
                <p class="cert-sig-name">Waka Kesiswaan SDM 1 Sedati</p>
                <p class="cert-sig-id">Pimpinan Cabang Muhammadiyah Sedati</p>
              </div>
              <div class="cert-seal">
                <div class="cert-seal-badge">
                  <i class="ph ph-seal-check"></i>
                  <span>RESMI SEKOLAH</span>
                </div>
              </div>
              <div class="cert-sig cert-sig-right">
                <p class="cert-sig-title">Sedati, ${dateFormatted}</p>
                <p class="cert-sig-role">Kepala Sekolah</p>
                <div class="cert-sig-space"></div>
                <p class="cert-sig-name"><strong>Dhani Harsyahyadi, S.H.I.</strong></p>
                <p class="cert-sig-id">NUPTK: 8962767668130162</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const btnCertClose = document.getElementById('btn-cert-close');
    if (btnCertClose) btnCertClose.addEventListener('click', () => window.close());
    const btnCertPrint = document.getElementById('btn-cert-print');
    if (btnCertPrint) btnCertPrint.addEventListener('click', () => window.print());
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="print-error-text">Terjadi kesalahan: ${AppConfig.escapeHtml(err.message)}</p>`;
  }
}
