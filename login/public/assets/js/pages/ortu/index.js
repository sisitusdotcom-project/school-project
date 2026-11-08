const OrtuPages = {
charts: {},
async renderDashboard(container) {
Router.setTitle('Perkembangan Anak', 'Pantau seluruh hasil belajar, karakter, dan data alumni.');
const myStudents = await DB.getStudentsByParent(Auth.currentUser.uid);
const studentArr = DB.toArray(myStudents);
if (!studentArr.length) {
container.innerHTML = `<div class="card panel-callout ortu-empty-panel"><div class="ortu-empty-icon"><i class="ph ph-users-three"></i></div><h3 class="ortu-empty-title">Akun belum terhubung</h3><p class="text-muted">Silakan hubungi wali kelas atau admin sekolah untuk menautkan akun ini ke data anak Anda.</p></div>`;
return;
}
const [settings, chars, classes, subjectsData, extrasData, allUmmiClasses, allUmmiExams, allSchedules, allUsers, allAchievements] = await Promise.all([
DB.getSettings().catch(() => ({})),
DB.getCharacters().catch(() => ({})),
DB.getClasses().catch(() => ({})),
DB.getSubjects().catch(() => ({})),
DB.getExtracurriculars().catch(() => ({})),
DB.getUmmiClasses().catch(() => ({})),
DB.getUmmiExams().catch(() => ({})),
DB.getSchedules().catch(() => ({})),
DB.getAllUsers().catch(() => ({})),
DB.getStudentAchievements().catch(() => ({}))
]);
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const todayObj = new Date();
const todayDayName = dayNames[todayObj.getDay()];
const tomorrowDate = new Date(todayObj);
tomorrowDate.setDate(todayObj.getDate() + 1);
const tomorrowDayName = dayNames[tomorrowDate.getDay()];
const currentMonth = todayObj.getMonth();
const charArr = DB.toArray(chars).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
const subjArr = DB.toArray(subjectsData).filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
const exArr = DB.toArray(extrasData);
const ummiClsArr = DB.toArray(allUmmiClasses || {});
const achList = DB.toArray(allAchievements || {});
const year = (settings && settings.currentAcademicYear) || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
const sem = (settings && settings.currentSemester) || AppConfig.DEFAULT_SETTINGS.currentSemester;
const scoreLabel = {
4: 'Sangat Baik',
3: 'Baik',
2: 'Mulai Berkembang',
1: 'Perlu Bimbingan'
};
const scoresByStudent = {};
const stuAchievementsMap = {};
await Promise.all(studentArr.map(async (s) => {
stuAchievementsMap[s.id] = await DB.getStudentAchievements(s.id).catch(() => ({}));
}));
let switcherHtml = '';
if (studentArr.length > 1) {
switcherHtml = `<div class="ortu-child-switcher"><button type="button" class="btn btn-sm btn-outline ortu-child-btn active" data-child-filter="all"><i class="ph ph-users"></i> Semua Anak (${studentArr.length})</button>${studentArr.map(s => `<button type="button" class="btn btn-sm btn-outline ortu-child-btn" data-child-filter="${s.id}"><i class="ph ph-user"></i> ${AppConfig.escapeHtml(s.name)}</button>`).join('')}</div>`;
}
let html = switcherHtml;
for (const student of studentArr) {
const stuAchDirect = DB.toArray(stuAchievementsMap[student.id] || student.achievements || {});
const stuAchievements = stuAchDirect.concat(
achList.filter(a => a && (a.studentId === student.id || (student.nis && String(a.nis) === String(student.nis)) || (student.name && a.studentName && a.studentName.toLowerCase() === student.name.toLowerCase())))
).filter((v, i, arr) => arr.findIndex(t => (t.id && t.id === v.id) || (t.title === v.title && t.date === v.date)) === i);
const isPraSd = Boolean(student.isPraSd || student.status === 'Calon Siswa' || (!student.classId && currentMonth < 6));
const isAlumni = Boolean(student.status === 'Alumni' || student.isAlumni || (student.classId && student.classId.includes('CLASS_6_') && currentMonth >= 6));
if (isPraSd) {
html += `
<section class="student-report" data-student-card="${student.id}">
<div class="prasd-hero">
<div class="prasd-hero-info">
<span class="prasd-badge-status"><i class="ph ph-sparkle"></i> Calon Siswa Baru (Pra SD)</span>
<h3 class="prasd-hero-title">${AppConfig.escapeHtml(student.name)}</h3>
<div class="prasd-hero-meta">
<span><strong>NIS:</strong> ${AppConfig.escapeHtml(student.nis || '-')}</span>
<span>·</span>
<span><strong>Jalur:</strong> ${AppConfig.escapeHtml(student.registrationTrack || 'Reguler')}</span>
<span>·</span>
<span><strong>Tahun Masuk:</strong> 2026/2027</span>
<span>·</span>
<span><strong>Status:</strong> ${AppConfig.escapeHtml(student.status || 'Calon Siswa')}</span>
</div>
</div>
<div>
<a href="https://wa.me/6285964399398" target="_blank" class="btn btn-primary"><i class="ph ph-whatsapp-logo"></i> Konsultasi Kesiswaan</a>
</div>
</div>
<div class="prasd-grid">
<div class="prasd-card">
<div class="prasd-card-header">
<h4 class="prasd-card-title"><i class="ph ph-megaphone-simple"></i> Pengumuman &amp; Informasi Sekolah</h4>
<span class="badge badge-primary">Informasi Resmi</span>
</div>
<div class="prasd-card-body">
<p class="text-muted small" style="margin-top:0;">Selamat datang di keluarga besar SD Muhammadiyah 1 Sedati. Berikut informasi persiapan awal tahun ajaran baru:</p>
<ul class="prasd-doc-list">
<li class="prasd-doc-item">
<span class="prasd-doc-name"><i class="ph ph-info"></i> Pengambilan Seragam &amp; Buku</span>
<span class="badge badge-outline">Koperasi Sekolah</span>
</li>
<li class="prasd-doc-item">
<span class="prasd-doc-name"><i class="ph ph-calendar"></i> Masuk Perdana &amp; Orientasi</span>
<span class="badge badge-outline">Juli 2026</span>
</li>
<li class="prasd-doc-item">
<span class="prasd-doc-name"><i class="ph ph-phone"></i> Layanan Informasi SPMB</span>
<span class="badge badge-success">0859-6439-9398</span>
</li>
</ul>
</div>
</div>
<div class="prasd-card">
<div class="prasd-card-header">
<h4 class="prasd-card-title"><i class="ph ph-calendar-check"></i> Jadwal Kegiatan Pra SD</h4>
<span class="badge badge-secondary">Tahapan Seleksi</span>
</div>
<div class="prasd-card-body">
<ul class="prasd-timeline">
<li class="prasd-timeline-item">
<div class="prasd-timeline-icon done"><i class="ph ph-check"></i></div>
<div class="prasd-timeline-content">
<h5 class="prasd-timeline-title">Pendaftaran &amp; Pembayaran Formulir</h5>
<p class="prasd-timeline-desc">Data formulir calon siswa telah terverifikasi di sistem.</p>
</div>
</li>
<li class="prasd-timeline-item">
<div class="prasd-timeline-icon"><i class="ph ph-user-focus"></i></div>
<div class="prasd-timeline-content">
<h5 class="prasd-timeline-title">Observasi Ramah Anak &amp; Pemetaan Gaya Belajar</h5>
<p class="prasd-timeline-desc">Jadwal tatap muka ramah anak untuk pemetaan kesiapan belajar.</p>
</div>
</li>
<li class="prasd-timeline-item">
<div class="prasd-timeline-icon"><i class="ph ph-users-three"></i></div>
<div class="prasd-timeline-content">
<h5 class="prasd-timeline-title">Silaturahmi &amp; Briefing Wali Murid Baru</h5>
<p class="prasd-timeline-desc">Pemaparan kurikulum Merdeka dan pembiasaan islami Musada.</p>
</div>
</li>
<li class="prasd-timeline-item">
<div class="prasd-timeline-icon"><i class="ph ph-t-shirt"></i></div>
<div class="prasd-timeline-content">
<h5 class="prasd-timeline-title">Pengambilan Seragam &amp; MPLS</h5>
<p class="prasd-timeline-desc">Masa Pengenalan Lingkungan Sekolah pada pekan awal Juli 2026.</p>
</div>
</li>
</ul>
</div>
</div>
<div class="prasd-card">
<div class="prasd-card-header">
<h4 class="prasd-card-title"><i class="ph ph-receipt"></i> Tagihan &amp; Rincian Administrasi</h4>
<span class="badge badge-success"><i class="ph ph-shield-check"></i> Rekening BSI</span>
</div>
<div class="prasd-card-body">
<div class="prasd-bill-box">
<div>
<div class="prasd-bill-label">Biaya Pendaftaran &amp; Formulir</div>
<div class="text-muted small">Pendaftaran SPMB Online</div>
</div>
<div class="prasd-bill-val">Rp 300.000 <span class="badge badge-success small">Lunas</span></div>
</div>
<div class="prasd-bill-box">
<div>
<div class="prasd-bill-label">Daftar Ulang &amp; Uang Seragam</div>
<div class="text-muted small">Paket 5 stel seragam + atribut</div>
</div>
<div class="prasd-bill-val"><span class="badge badge-outline">Sesuai Rincian Panitia</span></div>
</div>
<p class="text-muted small" style="margin:8px 0 0 0;">Pembayaran resmi sekolah disalurkan melalui Rekening BSI SD Muhammadiyah 1 Sedati No. <strong>7123456789</strong>.</p>
</div>
</div>
<div class="prasd-card">
<div class="prasd-card-header">
<h4 class="prasd-card-title"><i class="ph ph-folder-notch-open"></i> Administrasi &amp; Kelengkapan Berkas</h4>
<span class="badge badge-primary">Verifikasi</span>
</div>
<div class="prasd-card-body">
<ul class="prasd-doc-list">
<li class="prasd-doc-item">
<span class="prasd-doc-name"><i class="ph ph-file-text"></i> Akta Kelahiran Calon Siswa</span>
<span class="badge badge-success"><i class="ph ph-check"></i> Siap Verifikasi</span>
</li>
<li class="prasd-doc-item">
<span class="prasd-doc-name"><i class="ph ph-users"></i> Kartu Keluarga (KK)</span>
<span class="badge badge-success"><i class="ph ph-check"></i> Siap Verifikasi</span>
</li>
<li class="prasd-doc-item">
<span class="prasd-doc-name"><i class="ph ph-image"></i> Pas Foto Berwarna 3x4</span>
<span class="badge badge-success"><i class="ph ph-check"></i> Siap Verifikasi</span>
</li>
<li class="prasd-doc-item">
<span class="prasd-doc-name"><i class="ph ph-certificate"></i> Ijazah / Surat Keterangan Lulus TK</span>
<span class="badge badge-outline">Menyusul saat Lulus</span>
</li>
</ul>
<p class="text-muted small" style="margin:8px 0 0 0;">Berkas fisik diserahkan saat kegiatan Observasi Ramah Anak di sekolah.</p>
</div>
</div>
</div>
</section>
`;
continue;
}
if (isAlumni) {
const tracer = (Auth.userData && Auth.userData.alumniTracer) || {};
html += `
<section class="student-report" data-student-card="${student.id}">
<div class="prasd-hero" style="border-left:5px solid var(--primary,#3b82f6);">
<div class="prasd-hero-info">
<span class="prasd-badge-status"><i class="ph ph-graduation-cap"></i> Alumni SD Muhammadiyah 1 Sedati</span>
<h3 class="prasd-hero-title">${AppConfig.escapeHtml(student.name)}</h3>
<div class="prasd-hero-meta">
<span><strong>NIS:</strong> ${AppConfig.escapeHtml(student.nis || '-')}</span>
<span>·</span>
<span><strong>NISN:</strong> ${AppConfig.escapeHtml(student.nisn || '-')}</span>
<span>·</span>
<span><strong>Status:</strong> Alumni Lulus</span>
<span>·</span>
<span><strong>Tahun Lulus:</strong> 2025/2026</span>
</div>
</div>
<div>
<a href="print.html?id=${student.id}&sem=2&year=2025%2F2026" target="_blank" class="btn btn-outline"><i class="ph ph-printer"></i> Cetak E-Rapor Kelulusan</a>
</div>
</div>
<div class="prasd-grid">
<div class="prasd-card" style="grid-column: 1 / -1;">
<div class="prasd-card-header">
<h4 class="prasd-card-title"><i class="ph ph-address-book"></i> Pembaruan Kontak Alumni &amp; Tracer Study Mandiri</h4>
<span class="badge badge-success"><i class="ph ph-shield-check"></i> Terhubung Berkelanjutan</span>
</div>
<div class="prasd-card-body">
<p class="text-muted small" style="margin-top:0;">Sebagai bagian dari keluarga besar alumni Musada, mohon perbarui data nomor kontak aktif dan kelanjutan studi ananda agar sekolah dapat selalu mengundang dalam kegiatan alumni, silaturahmi akbar, dan penyaluran program beasiswa lanjutan.</p>
<form id="form-tracer-${student.id}" class="form-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
<div>
<label class="form-label small font-bold">No. WhatsApp Aktif</label>
<input type="text" class="input input-sm tracer-phone" value="${AppConfig.escapeHtml(tracer.phone || student.phone || '')}" placeholder="Contoh: 08123456789" required>
</div>
<div>
<label class="form-label small font-bold">Email Aktif</label>
<input type="email" class="input input-sm tracer-email" value="${AppConfig.escapeHtml(tracer.email || student.email || '')}" placeholder="Email aktif alumni / wali">
</div>
<div>
<label class="form-label small font-bold">Jenjang Sekolah Lanjutan</label>
<select class="input input-sm tracer-type">
<option value="Pesantren / Islamic Boarding" ${tracer.schoolType === 'Pesantren / Islamic Boarding' ? 'selected' : ''}>Pesantren / Islamic Boarding</option>
<option value="SMP Negeri / Swasta" ${(tracer.schoolType || 'SMP Negeri / Swasta') === 'SMP Negeri / Swasta' ? 'selected' : ''}>SMP Negeri / Swasta</option>
<option value="MTs Negeri / Swasta" ${tracer.schoolType === 'MTs Negeri / Swasta' ? 'selected' : ''}>MTs Negeri / Swasta</option>
<option value="SMA / SMK / MA" ${tracer.schoolType === 'SMA / SMK / MA' ? 'selected' : ''}>SMA / SMK / MA</option>
<option value="Perguruan Tinggi / Unggulan / Luar Negeri" ${tracer.schoolType === 'Perguruan Tinggi / Unggulan / Luar Negeri' ? 'selected' : ''}>Perguruan Tinggi / Unggulan</option>
</select>
</div>
<div>
<label class="form-label small font-bold">Nama Sekolah / Pesantren Lanjutan</label>
<input type="text" class="input input-sm tracer-school" value="${AppConfig.escapeHtml(tracer.destinationSchool || '')}" placeholder="Contoh: SMP Muhammadiyah 2 Taman">
</div>
<div style="grid-column: 1 / -1;">
<label class="form-label small font-bold">Aktivitas &amp; Prestasi Terkini di Sekolah Lanjutan</label>
<input type="text" class="input input-sm tracer-activity" value="${AppConfig.escapeHtml(tracer.currentActivity || '')}" placeholder="Contoh: Pengurus IPM / Santri Tahfidz 5 Juz">
</div>
<div style="grid-column: 1 / -1; display:flex; justify-content:flex-end;">
<button type="button" class="btn btn-primary btn-save-tracer" data-student="${student.id}"><i class="ph ph-floppy-disk"></i> Simpan Pembaruan Data Alumni</button>
</div>
</form>
</div>
</div>
</div>
</section>
`;
continue;
}
const cls = classes[student.classId];
const phase = AppConfig.getClassPhase(cls);
const stuClassId = student.classId;
const stuScheds = Object.values(allSchedules || {}).filter(s => s && s.classId === stuClassId);
const stuTodayScheds = stuScheds.filter(s => s.day === todayDayName).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
const stuTomorrowScheds = stuScheds.filter(s => s.day === tomorrowDayName).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
const renderChildSchedCards = (items, emptyMsg) => {
if (!items.length) return `<p class="text-muted" style="margin:0; font-size:13px;">${emptyMsg}</p>`;
return items.map(s => {
const sub = subjectsData[s.subjectId];
const u = allUsers[s.teacherId];
const subName = sub ? sub.name : s.subjectId;
const teacherName = u ? (u.name || u.displayName) : 'Guru Pengampu';
return `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; margin-bottom:8px; background:var(--bg-card,#fff); border:1px solid var(--border-color,#e2e8f0); border-radius:8px;"><div><strong style="color:var(--text-main); font-size:13px;">${AppConfig.escapeHtml(subName)}</strong><div class="text-muted" style="font-size:11.5px;"><i class="ph ph-chalkboard-teacher"></i> ${AppConfig.escapeHtml(teacherName)}</div></div><span class="badge badge-primary" style="font-size:11px;">${s.startTime || '-'} - ${s.endTime || '-'}</span></div>`;
}).join('');
};
const stuFullWeekRows = stuScheds.length ? [...stuScheds].sort((a, b) => {
const dA = dayNames.indexOf(a.day);
const dB = dayNames.indexOf(b.day);
if (dA !== dB) return dA - dB;
return (a.startTime || '').localeCompare(b.startTime || '');
}).map(s => {
const sub = subjectsData[s.subjectId];
const u = allUsers[s.teacherId];
const teacherName = u ? (u.name || u.displayName) : '-';
return `<tr><td><strong>${AppConfig.escapeHtml(s.day)}</strong></td><td><span class="badge badge-outline">${s.startTime || '-'} - ${s.endTime || '-'}</span></td><td>${AppConfig.escapeHtml(sub ? sub.name : s.subjectId)}</td><td>${AppConfig.escapeHtml(teacherName)}</td></tr>`;
}).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada jadwal pelajaran yang diterbitkan untuk kelas ini.</td></tr>';
const [scores, obsData, parentResp, acadGrades, stuExtra, cocurr, attendance, teacherNote, ummiJournals, rankResult] = await Promise.all([
DB.getAssessments(year, sem, student.id),
DB.getObservationsByStudent(student.id),
DB.getParentResponse(year, sem, student.id),
DB.getAcademicGrades(year, sem, student.id),
DB.getStudentExtracurriculars(year, sem, student.id),
DB.getCocurricular(year, sem, student.id),
DB.getAttendance(year, sem, student.id),
DB.getTeacherNote(year, sem, student.id),
DB.getUmmiJournals(student.id),
DB.getStudentClassRank(year, sem, student.id, student.classId)
]);
const rankBadge = (rankResult && rankResult.isTop10 && rankResult.text) ? ` · <span class="badge badge-primary"><i class="ph ph-medal"></i> ${AppConfig.escapeHtml(rankResult.text)}</span>` : '';
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
const achieveListHtml = stuAchievements.length ? stuAchievements.map(ach => {
const isWin = (ach.participationType || 'Juara') === 'Juara' || (ach.rank && !ach.rank.toLowerCase().includes('partisipan') && !ach.rank.toLowerCase().includes('peserta'));
return `
<div class="ortu-achieve-card">
<div class="ortu-achieve-top">
<h5 class="ortu-achieve-title">${AppConfig.escapeHtml(ach.title || 'Lomba')}</h5>
<span class="badge ${isWin ? 'badge-success' : 'badge-secondary'}">${AppConfig.escapeHtml(ach.rank || (isWin ? 'Juara' : 'Partisipan'))}</span>
</div>
<div class="ortu-achieve-meta">
<span><i class="ph ph-calendar"></i> ${AppConfig.escapeHtml(ach.date || '-')}</span>
<span>·</span>
<span><i class="ph ph-globe"></i> Tingkat ${AppConfig.escapeHtml(ach.level || 'Kabupaten')}</span>
<span>·</span>
<span><i class="ph ph-tag"></i> ${AppConfig.escapeHtml(ach.category || 'Prestasi')}</span>
<span>·</span>
<span><i class="ph ph-certificate"></i> No: ${AppConfig.escapeHtml(ach.certificateNo || '-')}</span>
</div>
<div class="ortu-achieve-actions">
<a href="print.html?type=certificate&id=${ach.id}" target="_blank" class="btn btn-sm btn-primary"><i class="ph ph-printer"></i> Cetak Sertifikat Apresiasi</a>
</div>
</div>
`;
}).join('') : '<p class="text-muted p-3">Belum ada catatan keikutsertaan lomba atau prestasi ananda. Mari dukung dan eksplorasi minat bakat ananda bersama sekolah!</p>';
html += `
<section class="student-report" data-student-card="${student.id}">
<div class="card student-report-profile">
<div>
<h3>${AppConfig.escapeHtml(student.name)}</h3>
<p class="student-report-profile__meta text-muted">${cls ? AppConfig.escapeHtml(cls.name) : '-'} · Fase ${AppConfig.escapeHtml(phase)} · NIS: ${AppConfig.escapeHtml(student.nis || '-')} · NISN: ${AppConfig.escapeHtml(student.nisn || '-')} · TP ${AppConfig.escapeHtml(year)} Sem ${AppConfig.escapeHtml(String(sem))} · <span class="badge badge-success"><i class="ph ph-book-open"></i> Ummi: ${AppConfig.escapeHtml(currentUmmiLvl)}</span>${rankBadge}</p>
</div>
<div class="avg-score-header">
<div class="avg-score-label">Skor Karakter</div>
<div class="avg-score">${avg}<span class="avg-max">/4</span></div>
</div>
</div>
<div class="tabs student-report-tabs">
<button type="button" class="btn btn-tab active" data-target="tab-karakter-${student.id}" data-student="${student.id}" data-tab="karakter"><i class="ph ph-star"></i> Karakter</button>
<button type="button" class="btn btn-tab" data-target="tab-akademik-${student.id}" data-student="${student.id}" data-tab="akademik"><i class="ph ph-books"></i> Akademik</button>
<button type="button" class="btn btn-tab" data-target="tab-jadwal-${student.id}" data-student="${student.id}" data-tab="jadwal"><i class="ph ph-calendar"></i> Jadwal Pelajaran</button>
<button type="button" class="btn btn-tab" data-target="tab-ummi-${student.id}" data-student="${student.id}" data-tab="ummi"><i class="ph ph-book-open"></i> Al-Qur'an (Ummi)</button>
<button type="button" class="btn btn-tab" data-target="tab-prestasi-${student.id}" data-student="${student.id}" data-tab="prestasi"><i class="ph ph-trophy"></i> Prestasi &amp; Lomba (${stuAchievements.length})</button>
<button type="button" class="btn btn-tab" data-target="tab-lain-${student.id}" data-student="${student.id}" data-tab="lain"><i class="ph ph-info"></i> Lainnya</button>
</div>
<div id="tab-karakter-${student.id}" class="tab-content active">
<div class="card-grid ortu-grid">
<div class="card ortu-inner-card">
<h3 class="card-title ortu-inner-title">Perkembangan Aspek Karakter (P3)</h3>
<div class="char-progress-list">${charCards}</div>
</div>
<div class="ortu-sub-grid">
<div class="card ortu-inner-card">
<h3 class="card-title ortu-inner-title">Catatan Observasi Guru</h3>
<div class="obs-list">${obsHtml}</div>
</div>
<div class="card ortu-inner-card">
<h3 class="card-title ortu-inner-title">Grafik Profil Karakter</h3>
<div class="kepsek-chart-wrap"><canvas id="chart-${student.id}"></canvas></div>
</div>
</div>
</div>
</div>
<div id="tab-akademik-${student.id}" class="tab-content hidden">
<div class="card ortu-inner-card">
<h3 class="card-title ortu-inner-title">Nilai Capaian Kompetensi (Akademik)</h3>
<div class="table-responsive">
<table class="table">
<thead><tr><th>Mata Pelajaran</th><th class="text-center">PH</th><th class="text-center">STS</th><th class="text-center">SAS/SAT</th><th class="text-center">Rapor</th><th>Capaian Kompetensi (CP/TP)</th></tr></thead>
<tbody>${acadHtml}</tbody>
</table>
</div>
</div>
</div>
<div id="tab-jadwal-${student.id}" class="tab-content hidden">
<div class="card ortu-inner-card">
<h3 class="card-title ortu-inner-title"><i class="ph ph-calendar"></i> Jadwal Pembelajaran Kelas ${cls ? AppConfig.escapeHtml(cls.name) : ''}</h3>
<div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom:16px;">
<div style="background:var(--bg-subtle,#f8fafc); border:1px solid var(--border-color,#e2e8f0); border-radius:10px; padding:16px;">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
<strong style="color:var(--text-main); font-size:14px;"><i class="ph ph-sun"></i> Jadwal Pembelajaran Hari Ini (${todayDayName})</strong>
<span class="badge ${stuTodayScheds.length ? 'badge-primary' : 'badge-neutral'}">${stuTodayScheds.length} Mapel</span>
</div>
${renderChildSchedCards(stuTodayScheds, 'Tidak ada jadwal pelajaran hari ini.')}
</div>
<div style="background:var(--bg-subtle,#f8fafc); border:1px solid var(--border-color,#e2e8f0); border-radius:10px; padding:16px;">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
<strong style="color:var(--text-main); font-size:14px;"><i class="ph ph-backpack"></i> Persiapan Buku &amp; Seragam Besok (${tomorrowDayName})</strong>
<span class="badge ${stuTomorrowScheds.length ? 'badge-success' : 'badge-neutral'}">${stuTomorrowScheds.length} Mapel</span>
</div>
${renderChildSchedCards(stuTomorrowScheds, 'Tidak ada jadwal pelajaran besok.')}
</div>
</div>
<h4 style="margin:16px 0 8px 0; font-size:14px; color:var(--text-color);"><i class="ph ph-calendar-blank"></i> Jadwal Lengkap 1 Pekan</h4>
<div class="table-responsive">
<table class="table">
<thead><tr><th>Hari</th><th>Jam</th><th>Mata Pelajaran</th><th>Guru Pengampu</th></tr></thead>
<tbody>${stuFullWeekRows}</tbody>
</table>
</div>
</div>
</div>
<div id="tab-ummi-${student.id}" class="tab-content hidden">
<div class="card ortu-inner-card">
<div class="d-flex justify-between items-center" style="gap:15px;flex-wrap:wrap;border-bottom:1px solid var(--border-color);padding-bottom:12px;margin-bottom:15px;">
<div>
<h3 class="card-title ortu-inner-title" style="margin:0;"><i class="ph ph-book-open"></i> Pembelajaran Al-Qur'an (Metode Ummi)</h3>
<p class="text-muted small" style="margin:4px 0 0 0;">Rombel: <strong>${AppConfig.escapeHtml(ummiClassName)}</strong>${myUmmiClass && myUmmiClass.room ? ` · <i class="ph ph-map-pin"></i> ${AppConfig.escapeHtml(myUmmiClass.room)}` : ''} · Nilai Rapor BTQ: <strong>${acadGrades && acadGrades['SUB_BTQ'] ? acadGrades['SUB_BTQ'].score : '-'}</strong></p>
</div>
<div><span class="badge badge-success" style="font-size:13px;padding:6px 12px;"><i class="ph ph-bookmark-simple"></i> Tingkatan: ${AppConfig.escapeHtml(currentUmmiLvl)}</span></div>
</div>
${examBadge}
<h4 style="margin:16px 0 8px 0;font-size:14px;color:var(--text-color);"><i class="ph ph-notebook"></i> Kartu Prestasi &amp; Jurnal Harian Santri</h4>
<div class="table-responsive">
<table class="table">
<thead><tr><th class="text-center" style="width:45px;">TM</th><th>Tanggal</th><th>Jilid</th><th>Hal / Ayat</th><th>Materi Pokok</th><th>Nilai</th><th>Simak Guru</th><th>Simak Ortu</th><th>Catatan</th></tr></thead>
<tbody>${journalRows}</tbody>
</table>
</div>
</div>
</div>
<div id="tab-prestasi-${student.id}" class="tab-content hidden">
<div class="card ortu-inner-card">
<div class="d-flex justify-between items-center" style="gap:15px;flex-wrap:wrap;border-bottom:1px solid var(--border-color);padding-bottom:12px;margin-bottom:15px;">
<div>
<h3 class="card-title ortu-inner-title" style="margin:0;"><i class="ph ph-trophy"></i> Catatan Prestasi &amp; Lomba Ananda</h3>
<p class="text-muted small" style="margin:4px 0 0 0;">Apresiasi resmi SD Muhammadiyah 1 Sedati untuk ananda juara maupun peserta kontingen lomba.</p>
</div>
<div><span class="badge badge-primary">${stuAchievements.length} Catatan Lomba</span></div>
</div>
<div class="ortu-achieve-grid">
${achieveListHtml}
</div>
</div>
</div>
<div id="tab-lain-${student.id}" class="tab-content hidden">
<div class="card-grid ortu-grid">
<div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Ketidakhadiran</h3>${attHtml}</div>
<div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Catatan Wali Kelas</h3><p class="ortu-teacher-note">${teacherNote ? AppConfig.escapeHtml(teacherNote.note || '-') : '-'}</p></div>
<div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Ekstrakurikuler</h3><div class="table-responsive"><table class="table"><thead><tr><th>Kegiatan</th><th>Predikat</th><th>Keterangan</th></tr></thead><tbody>${extraHtml}</tbody></table></div></div>
<div class="card ortu-inner-card"><h3 class="card-title ortu-inner-title">Kokurikuler (Proyek P5)</h3>${cocurrHtml}</div>
</div>
</div>
</section>
`;
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
container.querySelectorAll('.btn-save-tracer').forEach(btn => {
btn.addEventListener('click', async (e) => {
const targetBtn = e.currentTarget;
const studentId = targetBtn.dataset.student;
const form = document.getElementById(`form-tracer-${studentId}`);
if (!form) return;
const phone = form.querySelector('.tracer-phone').value.trim();
const email = form.querySelector('.tracer-email').value.trim();
const schoolType = form.querySelector('.tracer-type').value;
const destinationSchool = form.querySelector('.tracer-school').value.trim();
const currentActivity = form.querySelector('.tracer-activity').value.trim();
targetBtn.disabled = true;
targetBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
try {
const tracerData = {
phone,
email,
schoolType,
destinationSchool,
currentActivity,
updatedAt: Date.now()
};
await db.ref(`users/${Auth.currentUser.uid}/alumniTracer`).set(tracerData);
if (Auth.userData) Auth.userData.alumniTracer = tracerData;
targetBtn.innerHTML = '<i class="ph ph-check"></i> Data Alumni Tersimpan';
setTimeout(() => {
targetBtn.disabled = false;
targetBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Pembaruan Data Alumni';
}, 2500);
} catch (err) {
console.error(err);
alert('Gagal menyimpan pembaruan kontak alumni.');
targetBtn.disabled = false;
targetBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Pembaruan Data Alumni';
}
});
});
for (const student of studentArr) {
const isPraSd = Boolean(student.isPraSd || student.status === 'Calon Siswa' || (!student.classId && currentMonth < 6));
const isAlumni = Boolean(student.status === 'Alumni' || student.isAlumni || (student.classId && student.classId.includes('CLASS_6_') && currentMonth >= 6));
if (isPraSd || isAlumni) continue;
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
const settings = await DB.getSettings().catch(() => ({}));
const year = (settings && settings.currentAcademicYear) || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
const sem = (settings && settings.currentSemester) || AppConfig.DEFAULT_SETTINGS.currentSemester;
const classes = await DB.getClasses().catch(() => ({}));
const currentMonth = new Date().getMonth();
let cardsHtml = '';
for (const student of studentArr) {
const isPraSd = Boolean(student.isPraSd || student.status === 'Calon Siswa' || (!student.classId && currentMonth < 6));
const isAlumni = Boolean(student.status === 'Alumni' || student.isAlumni || (student.classId && student.classId.includes('CLASS_6_') && currentMonth >= 6));
if (isPraSd) {
cardsHtml += `
<div class="card section-block ortu-rapor-card">
<div class="ortu-rapor-header">
<div>
<h3 class="ortu-rapor-title">${AppConfig.escapeHtml(student.name)}</h3>
<p class="ortu-rapor-meta text-muted">Status: Calon Siswa (Pra SD) · NIS: ${AppConfig.escapeHtml(student.nis || '-')}</p>
</div>
<div class="ortu-rapor-badges">
<span class="badge badge-primary"><i class="ph ph-sparkle"></i> Pengenalan Rapor Digital</span>
<span class="badge badge-secondary"><i class="ph ph-hourglass-medium"></i> Aktif Juli 2026</span>
</div>
</div>
<div class="ortu-preview-grid">
<div class="ortu-preview-card">
<h5 class="ortu-preview-title"><i class="ph ph-heart-straight text-danger"></i> Asesmen Karakter</h5>
<p class="ortu-preview-desc">Pemantauan 6 Dimensi Profil Pelajar Pancasila, pembiasaan sholat berjamaah, dan adab Islami harian.</p>
</div>
<div class="ortu-preview-card">
<h5 class="ortu-preview-title"><i class="ph ph-book-open text-primary"></i> BTQ Ummi &amp; Tahfidz</h5>
<p class="ortu-preview-desc">Evaluasi tartil metode Ummi Foundation, munaqasyah Al-Qur'an, dan hafalan juz 30 terstandar.</p>
</div>
<div class="ortu-preview-card">
<h5 class="ortu-preview-title"><i class="ph ph-certificate text-success"></i> Capaian Akademik</h5>
<p class="ortu-preview-desc">Lembar rapor resmi Kurikulum Merdeka format F4 lengkap dengan deskripsi capaian per kompetensi.</p>
</div>
</div>
<div class="ortu-rapor-footer">
<p class="ortu-rapor-note text-muted">Lembar Rapor Digital resmi format F4 akan otomatis terisi dan dapat dicetak setelah ananda resmi mengikuti pembelajaran pada Tahun Ajaran Baru 2026/2027.</p>
<div class="ortu-rapor-actions">
<a href="#/dashboard" class="btn btn-primary ortu-rapor-btn"><i class="ph ph-arrow-left"></i> Kembali ke Dashboard Pra SD</a>
</div>
</div>
</div>
`;
continue;
}
const cls = classes[student.classId] || {};
const [finalization, rankResult, history] = await Promise.all([
DB.getRaporFinalization(year, sem, student.classId),
DB.getStudentClassRank(year, sem, student.id, student.classId),
DB.getStudentLearningHistory(student.id)
]);
const isFin = finalization && finalization.finalized;
const rankBadge = (rankResult && rankResult.isTop10 && rankResult.text) ? `<span class="badge badge-primary ortu-rapor-badge"><i class="ph ph-medal"></i> ${AppConfig.escapeHtml(rankResult.text)}</span>` : '';
const pastReports = (history || []).filter(h => !(h.year === year && h.sem === sem));
let historyHtml = '';
if (pastReports.length) {
historyHtml = `
<div class="card section-block ortu-history-block">
<h4 class="card-title"><i class="ph ph-clock-counter-clockwise"></i> Riwayat Laporan Pembelajaran &amp; Rapor (${AppConfig.escapeHtml(student.name)})</h4>
<p class="text-muted small">Arsip capaian belajar dan e-rapor ananda dari tingkat kelas sebelumnya:</p>
<div class="history-list">
${pastReports.map(h => `
<div class="history-card-item">
<div class="history-card-header">
<div>
<strong>T.A ${AppConfig.escapeHtml(h.year)} — Semester ${h.sem}</strong>
<div class="history-card-meta">
Rata-rata Nilai: <strong>${h.avgScore}</strong> (${h.gradeCount} Mapel) · Sakit: ${h.attendance.sakit || 0}, Izin: ${h.attendance.izin || 0}, Alpa: ${h.attendance.alpa || 0}
</div>
</div>
<a href="print.html?id=${student.id}&sem=${h.sem}&year=${encodeURIComponent(h.year)}" target="_blank" class="btn btn-outline btn-sm">
<i class="ph ph-printer"></i> Cetak Rapor Sem ${h.sem}
</a>
</div>
${h.note && h.note !== '-' ? `<p class="small text-muted mb-0"><strong>Catatan Wali Kelas:</strong> ${AppConfig.escapeHtml(h.note)}</p>` : ''}
</div>
`).join('')}
</div>
</div>
`;
}
cardsHtml += `
<div class="card section-block ortu-rapor-card">
<div class="ortu-rapor-header">
<div>
<h3 class="ortu-rapor-title">${AppConfig.escapeHtml(student.name)}</h3>
<p class="ortu-rapor-meta text-muted">${cls.name || (isAlumni ? 'Alumni' : '-')} · NIS: ${AppConfig.escapeHtml(student.nis || '-')} · NISN: ${AppConfig.escapeHtml(student.nisn || '-')} · T.A ${AppConfig.escapeHtml(year)} Sem ${AppConfig.escapeHtml(String(sem))}</p>
</div>
<div class="ortu-rapor-badges">
<span class="badge ${isFin ? 'badge-success' : 'badge-warning'} ortu-rapor-badge">
<i class="ph ${isFin ? 'ph-check-circle' : 'ph-clock'}"></i> ${isFin ? 'Rapor Difinalisasi' : 'Proses Rekapitulasi'}
</span>
${rankBadge}
</div>
</div>
<div class="ortu-rapor-footer">
<p class="ortu-rapor-note text-muted">
${isFin ? 'Rapor semester ini telah difinalisasi oleh wali kelas. Anda dapat langsung mencetak lembar rapor format F4 resmi.' : 'Wali kelas sedang melakukan rekapitulasi nilai akhir. Lembar cetak rapor akan dapat diunduh setelah difinalisasi oleh sekolah.'}
</p>
<div class="ortu-rapor-actions">
<a href="print.html?id=${student.id}&sem=${sem}&year=${encodeURIComponent(year)}" target="_blank" class="btn ${isFin ? 'btn-primary' : 'btn-outline'} ortu-rapor-btn">
<i class="ph ph-printer"></i> ${isFin ? 'Cetak Lembar Rapor F4' : 'Pratinjau Lembar Rapor'}
</a>
</div>
</div>
</div>
${historyHtml}
`;
}
container.innerHTML = `
<div class="ortu-rapor-head-wrap">
<h2 class="ortu-rapor-main-title">E-Rapor &amp; Riwayat Belajar</h2>
<p class="text-muted">Unduh lembar hasil belajar resmi format F4 atau pantau arsip semester terdahulu.</p>
</div>
${cardsHtml}
`;
}
};