const ATTENDANCE_GEOFENCE = window.APP_ATTENDANCE_GEOFENCE || window.AppConfig?.attendanceGeofence || {
lat: -7.378448579234777,
lng: 112.75929775962251,
radiusMeters: 50
};
const GuruPages = {
async renderDashboard(container) {
const role = Auth.currentRole || Auth.userData?.role;
const userAssignments = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
if (AppConfig.isPureGuruEkstra(role, userAssignments)) {
await GuruPages.renderEkstraDashboard(container);
return;
}
if (AppConfig.isPureGuruUmmi(role, userAssignments)) {
await GuruPages.renderUmmiDashboard(container);
return;
}
Router.setTitle('Beranda', 'Selamat datang di Dasbor Digital Sekolah.');
const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const [classArr, students, myAtt] = await Promise.all([DB.getClassesForTeacher(Auth.currentUser.uid), DB.getAllStudents(), DB.getTeacherAttendance(dateStr, Auth.currentUser.uid)]);
const studentCount = DB.toArray(students).filter(s => classArr.some(c => c.id === s.classId)).length;
let attStatus = 'Belum Presensi';
let attClass = 'badge-warning';
if (myAtt) {
if (myAtt.time_out) {
attStatus = 'Sudah Pulang (' + myAtt.time_out + ')';
attClass = 'badge-success';
} else if (myAtt.time_in) {
attStatus = 'Sudah Datang (' + myAtt.time_in + ')';
attClass = 'badge-success';
}
}
container.innerHTML = `
<div class="card hero-panel">
<div class="hero-panel__inner">
<div>
<p class="hero-panel__meta">${today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<h2 class="hero-panel__time">${timeStr}</h2>
</div>
<div class="hero-panel__status">
<p class="hero-panel__meta">Status Kehadiran</p>
<span class="badge ${attClass}">${attStatus}</span>
</div>
</div>
</div>
<section class="card-grid section-spacer">
<div class="card stat-card">
<div class="stat-icon stat-icon--success"><i class="ph ph-map-pin"></i></div>
<div><p class="stat-value">${myAtt ? (myAtt.time_in ? '✓' : '—') : '—'}</p><p class="stat-label text-muted">Datang</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--primary"><i class="ph ph-users-three"></i></div>
<div><p class="stat-value">${studentCount}</p><p class="stat-label text-muted">Siswa di kelas saya</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--danger"><i class="ph ph-chalkboard-teacher"></i></div>
<div><p class="stat-value">${classArr.length}</p><p class="stat-label text-muted">Kelas terlibat</p></div>
</div>
</section>
<section class="card section-spacer">
<div class="card-header">
<h3 class="card-title"><i class="ph ph-lightning"></i> Aksi Cepat Guru</h3>
</div>
<div class="card-body">
<div class="quick-nav-grid">
<a href="#/attendance" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-map-pin"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Presensi Saya</div>
<div class="quick-nav-desc">Catat presensi GPS masuk / pulang</div>
</div>
</a>
<a href="#/guru/academic" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-check-square"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Nilai Akademik</div>
<div class="quick-nav-desc">Input nilai mapel yang diampu</div>
</div>
</a>
<a href="#/curriculum/syllabus" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-upload-simple"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Perangkat Ajar</div>
<div class="quick-nav-desc">Unggah modul ajar & RPP</div>
</div>
</a>
<a href="#/guru/portfolio" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-folder"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Portofolio Guru</div>
<div class="quick-nav-desc">Dokumentasi karya & sertifikat</div>
</div>
</a>
<a href="#/guru/student-attendance" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-users-three"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Absensi Siswa</div>
<div class="quick-nav-desc">Presensi harian murid kelas</div>
</div>
</a>
<a href="#/guru/classes" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-chalkboard-teacher"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">E-Rapor Kelas</div>
<div class="quick-nav-desc">Pengisian lembar capaian rapor</div>
</div>
</a>
<a href="#/gtk/official-travel" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-airplane-takeoff"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Perjalanan Dinas</div>
<div class="quick-nav-desc">Pengajuan & riwayat tugas dinas guru</div>
</div>
</a>
<a href="#/gtk/salary-slip" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Slip Gaji Pribadi</div>
<div class="quick-nav-desc">Rincian honorarium & kehadiran cutoff 29-28</div>
</div>
</a>
</div>
</div>
</section>
<div class="card panel-callout">
<h3 class="card-title info-banner"><i class="ph ph-megaphone"></i> Papan Informasi</h3>
<p class="text-muted soft-note">Validasi lokasi dilakukan oleh server secara aman. Browser tidak menyimpan koordinat sekolah untuk keperluan validasi presensi.</p>
</div>
`;
},
async renderClasses(container) {
Router.setTitle('Kelas & E-Rapor', 'Pusat pengelolaan penilaian akademik, karakter, dan pencetakan rapor rombel.');
const uid = Auth.currentUser.uid;
const [classArr, students, subjects] = await Promise.all([
DB.getClassesForTeacher(uid),
DB.getAllStudents(),
DB.getSubjects()
]);
const studentArr = DB.toArray(students);
if (!classArr.length) {
container.innerHTML = `<div class="card"><p class="text-muted">Anda belum ditugaskan mengajar di kelas manapun. Hubungi waka kurikulum untuk pemetaan rombel.</p></div>`;
return;
}
const cards = classArr.map(c => {
const isWali = c.teacherId === uid;
const count = studentArr.filter(s => s.classId === c.id).length;
const mySubjectIds = Object.keys(c.subjectTeachers || {}).filter(subId => c.subjectTeachers[subId] === uid);
const mySubjectNames = mySubjectIds.map(sid => (subjects[sid] && subjects[sid].name) || sid);
const firstSubId = mySubjectIds[0] || '';
let roleBadge = '';
let teachingNote = '';
let actionButtons = '';
if (isWali) {
roleBadge = '<span class="badge badge-primary"><i class="ph ph-star"></i> Wali Kelas</span>';
teachingNote = mySubjectNames.length ? `Wali Kelas · Mengampu: ${AppConfig.escapeHtml(mySubjectNames.join(', '))}` : 'Wali Kelas & Penanggung Jawab Rapor Rombel';
actionButtons = `
<div class="card-actions-wrapper">
<div class="card-actions-row">
<a href="#/guru/academic?classId=${c.id}" class="btn btn-primary btn-sm"><i class="ph ph-check-square"></i> Input Nilai Mapel</a>
<a href="#/guru/assess/${c.id}" class="btn btn-outline btn-sm"><i class="ph ph-star"></i> Nilai Karakter (P3)</a>
</div>
<div class="card-actions-row">
<a href="#/guru/observe/${c.id}" class="btn btn-outline btn-sm"><i class="ph ph-note-pencil"></i> Catatan Rapor</a>
<button type="button" class="btn btn-outline btn-sm btn-print-modal-cls" data-print-cls="${c.id}"><i class="ph ph-printer"></i> Cetak Rapor Murid</button>
</div>
</div>
`;
} else {
roleBadge = '<span class="badge badge-success"><i class="ph ph-chalkboard-teacher"></i> Guru Mapel</span>';
teachingNote = mySubjectNames.length ? `Mengampu: <strong>${AppConfig.escapeHtml(mySubjectNames.join(', '))}</strong>` : 'Guru Pengampu Mata Pelajaran';
actionButtons = `
<div class="card-actions-wrapper">
<div class="card-actions-row">
<a href="#/guru/academic?classId=${c.id}${firstSubId ? `&subjectId=${firstSubId}` : ''}" class="btn btn-primary btn-sm"><i class="ph ph-check-square"></i> Input Nilai ${AppConfig.escapeHtml(mySubjectNames[0] || 'Mapel')}</a>
<a href="#/guru/observe/${c.id}" class="btn btn-outline btn-sm"><i class="ph ph-chat-text"></i> Catatan</a>
</div>
</div>
`;
}
return `
<div class="card class-card">
<div class="card-header">
<h3 class="card-title">${AppConfig.escapeHtml(c.name)}</h3>
${roleBadge}
</div>
<div class="class-teaching-note">${teachingNote}</div>
<p class="text-muted">${count} murid terdaftar</p>
${actionButtons}
</div>`;
}).join('');
container.innerHTML = `
<div class="card-grid">${cards}</div>
<div class="modal-overlay" id="modal-rapor-print">
<div class="modal modal-lg">
<div class="modal-header">
<h3 class="modal-title" id="rapor-modal-title">Cetak Lembar Rapor F4</h3>
<button class="btn-icon" data-close-modal="modal-rapor-print"><i class="ph ph-x"></i></button>
</div>
<div class="modal-body">
<p class="text-muted soft-note">Pilih murid untuk mencetak lembar rapor resmi format F4 (Cover, Nilai Akademik, Ekstrakurikuler, Catatan Wali Kelas, dan Presensi).</p>
<div id="rapor-students-list" class="rapor-students-list"></div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-rapor-print">Tutup</button>
</div>
</div>
</div>
`;
container.querySelectorAll('.btn-print-modal-cls').forEach(btn => {
btn.onclick = () => {
const classId = btn.dataset.printCls;
const targetClass = classArr.find(c => c.id === classId);
if (!targetClass) return;
const classStudents = studentArr.filter(s => s.classId === classId).sort((a, b) => a.name.localeCompare(b.name));
document.getElementById('rapor-modal-title').textContent = `Cetak Rapor Murid - Kelas ${targetClass.name}`;
const listContainer = document.getElementById('rapor-students-list');
if (!classStudents.length) {
listContainer.innerHTML = '<div class="card text-center text-muted p-3">Belum ada data murid terdaftar di kelas ini.</div>';
} else {
listContainer.innerHTML = classStudents.map((s, idx) => `
<div class="rapor-student-row">
<div class="rapor-student-info">
<span class="badge badge-primary">${idx + 1}</span>
<div>
<strong>${AppConfig.escapeHtml(s.name)}</strong>
<div class="text-muted small">${AppConfig.formatStudentIdentity(s)} · <span class="badge badge-success"><i class="ph ph-book-open"></i> Ummi: ${AppConfig.escapeHtml(s.ummiLevel || 'Pra-Jilid')}</span></div>
</div>
</div>
<a href="print.html?id=${s.id}" target="_blank" class="btn btn-primary btn-sm"><i class="ph ph-printer"></i> Cetak Rapor F4</a>
</div>
`).join('');
}
document.getElementById('modal-rapor-print').classList.add('active');
};
});
},
async renderAssessment(container, classId) {
const [classes, charData, settings] = await Promise.all([
DB.getClasses(),
DB.getCharacters(),
DB.getSettings()
]);
const cls = classes[classId];
if (!cls) {
container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
return;
}
Router.setTitle(`Penilaian ${AppConfig.escapeHtml(cls.name)}`, `${settings.currentAcademicYear} — Semester ${settings.currentSemester}`);
const studentData = await DB.getStudentsByClass(classId);
const studentArr = DB.toArray(studentData).sort((a, b) => a.name.localeCompare(b.name));
const charArr = DB.toArray(charData).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
if (!studentArr.length) {
container.innerHTML = `<div class="card"><p class="text-muted">Belum ada siswa di kelas ini. Minta admin menambahkan data siswa.</p></div>`;
return;
}
if (!charArr.length) {
container.innerHTML = `<div class="card"><p class="text-muted">Belum ada indikator karakter aktif. Minta admin untuk menambahkan indikator.</p></div>`;
return;
}
const year = settings.currentAcademicYear;
const sem = settings.currentSemester;
const allScores = {};
for (const s of studentArr) {
allScores[s.id] = await DB.getAssessments(year, sem, s.id);
}
const scoreLabel = {
1: 'Perlu Bimbingan',
2: 'Mulai Berkembang',
3: 'Baik',
4: 'Sangat Baik'
};
const studentCards = studentArr.map(s => {
const ratingRows = charArr.map(ch => {
const existing = allScores[s.id]?.[ch.id]?.score || 0;
const btns = [1, 2, 3, 4].map(n => `
<button class="rating-btn ${existing === n ? 'active' : ''}"
data-score="${n}" data-stu="${s.id}" data-char="${ch.id}"
title="${scoreLabel[n]}">${n}</button>
`).join('');
return `
<div class="rating-row">
<div class="rating-label">${AppConfig.escapeHtml(ch.name)}</div>
<div class="rating-options">${btns}</div>
</div>`;
}).join('');
return `
<div class="card assess-card">
<div class="card-header">
<h3 class="card-title" style="font-size:15px">${AppConfig.escapeHtml(s.name)}</h3>
<div style="display:flex; gap:6px;">
<a href="print.html?id=${s.id}" target="_blank" class="btn btn-outline btn-sm">
<i class="ph ph-printer"></i> Cetak
</a>
<button type="button" class="btn btn-outline btn-sm btn-open-obs" data-obs-id="${s.id}" data-obs-name="${AppConfig.escapeHtml(s.name)}">
<i class="ph ph-chat-text"></i> Catatan
</button>
</div>
</div>
${ratingRows}
</div>`;
}).join('');
container.innerHTML = `
<div class="card" style="margin-bottom:16px">
<p class="text-muted" style="font-size:13px">Ketuk angka untuk memberi nilai: <strong>1</strong> (Perlu Bimbingan) — <strong>4</strong> (Sangat Baik). Nilai langsung tersimpan otomatis.</p>
</div>
<div class="card-grid">${studentCards}</div>
${GuruPages._obsModal(charArr)}
`;
container.addEventListener('click', async (e) => {
const obsBtn = e.target.closest('.btn-open-obs');
if (obsBtn) {
GuruPages._openObsModal(obsBtn.dataset.obsId, obsBtn.dataset.obsName);
return;
}
const btn = e.target.closest('.rating-btn');
if (!btn) return;
const {
stu,
char,
score
} = btn.dataset;
const siblings = btn.parentElement.querySelectorAll('.rating-btn');
siblings.forEach(b => b.classList.remove('active'));
btn.classList.add('active');
try {
await DB.saveAssessment(year, sem, stu, char, score, Auth.currentUser.uid);
} catch (err) {
}
});
},
async renderObserveClass(container, classId) {
const [classes, charData, studentData] = await Promise.all([
DB.getClasses(),
DB.getCharacters(),
DB.getStudentsByClass(classId)
]);
const cls = classes[classId];
if (!cls) {
container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
return;
}
Router.setTitle(`Catatan observasi — ${AppConfig.escapeHtml(cls.name)}`, 'Catat perilaku positif atau yang perlu bimbingan.');
const studentArr = DB.toArray(studentData).sort((a, b) => a.name.localeCompare(b.name));
const charArr = DB.toArray(charData).filter(c => c.active !== false);
const stuOpts = studentArr.map(s => `<option value="${s.id}">${AppConfig.escapeHtml(s.name)}</option>`).join('');
const charOpts = charArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('');
const obsData = await DB.getObservationsByTeacher(Auth.currentUser.uid);
const obsArr = DB.toArray(obsData).filter(o => studentArr.some(s => s.id === o.studentId)).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 30);
const obsRows = obsArr.length ? obsArr.map(o => {
const stu = studentArr.find(s => s.id === o.studentId);
const ch = charArr.find(c => c.id === o.characterId);
const d = o.date || '-';
return `
<div class="obs-item ${o.type === 'positive' ? 'obs-positive' : 'obs-warning'}">
<div class="obs-meta">
<strong>${stu ? stu.name : '?'}</strong>
<span class="badge ${o.type === 'positive' ? 'badge-success' : 'badge-warning'}">${o.type === 'positive' ? 'Positif' : 'Perlu Bimbingan'}</span>
</div>
<p class="obs-note">${o.note || '-'}</p>
<p class="obs-date text-muted">${ch ? ch.name : ''} · ${d}</p>
</div>`;
}).join('') : '<p class="text-muted" style="padding:12px 0">Belum ada catatan observasi.</p>';
container.innerHTML = `
<div style="margin-bottom:16px"><a href="#/guru/classes" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali</a></div>
<div class="card" style="margin-bottom:20px">
<h3 class="card-title" style="margin-bottom:16px">Tambah catatan cepat</h3>
<form id="form-obs-quick">
<div class="form-group"><label>Siswa</label><select id="oq-stu" required>${stuOpts}</select></div>
<div class="form-row">
<div class="form-group"><label>Jenis</label>
<select id="oq-type"><option value="positive">👍 Positif</option><option value="needs_improvement">⚠ Perlu bimbingan</option></select>
</div>
<div class="form-group"><label>Karakter</label><select id="oq-char" required>${charOpts}</select></div>
</div>
<div class="form-group"><label>Catatan</label>
<textarea id="oq-note" rows="2" placeholder="Contoh: Membantu teman merapikan kelas setelah selesai belajar."></textarea>
</div>
<button type="submit" class="btn btn-primary"><i class="ph ph-paper-plane-tilt"></i> Simpan</button>
</form>
</div>
<div class="card">
<h3 class="card-title" style="margin-bottom:12px">Riwayat catatan terbaru</h3>
<div class="obs-list">${obsRows}</div>
</div>
`;
document.getElementById('form-obs-quick').onsubmit = async (e) => {
e.preventDefault();
const btn = e.target.querySelector('button[type="submit"]');
btn.disabled = true;
btn.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';
const today = new Date().toISOString().slice(0, 10);
await DB.saveObservation({
studentId: document.getElementById('oq-stu').value,
teacherId: Auth.currentUser.uid,
type: document.getElementById('oq-type').value,
characterId: document.getElementById('oq-char').value,
note: document.getElementById('oq-note').value.trim(),
date: today
});
GuruPages.renderObserveClass(container, classId);
};
},
async renderObservationHistory(container) {
Router.setTitle('Riwayat observasi', 'Seluruh catatan perilaku yang pernah Anda tulis.');
const [obsData, students, charData] = await Promise.all([
DB.getObservationsByTeacher(Auth.currentUser.uid),
DB.getAllStudents(),
DB.getCharacters()
]);
const obsArr = DB.toArray(obsData).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
const studentMap = students || {};
const charMap = charData || {};
if (!obsArr.length) {
container.innerHTML = '<div class="card"><p class="text-muted">Belum ada catatan observasi. Mulai dari halaman kelas Anda.</p></div>';
return;
}
const items = obsArr.map(o => {
const stu = studentMap[o.studentId];
const ch = charMap[o.characterId];
return `
<div class="obs-item ${o.type === 'positive' ? 'obs-positive' : 'obs-warning'}">
<div class="obs-meta">
<strong>${stu ? stu.name : 'Siswa'}</strong>
<span class="badge ${o.type === 'positive' ? 'badge-success' : 'badge-warning'}">${o.type === 'positive' ? 'Positif' : 'Perlu Bimbingan'}</span>
</div>
<p class="obs-note">${o.note || '-'}</p>
<p class="obs-date text-muted">${ch ? ch.name : ''} · ${o.date || ''}</p>
</div>`;
}).join('');
container.innerHTML = `<div class="card"><div class="obs-list">${items}</div></div>`;
},
async renderAcademicGrades(container) {
Router.setTitle('Input Nilai Mapel', 'Input nilai akhir dan capaian kompetensi siswa per rombel.');
const uid = Auth.currentUser.uid;
const [classArr, subjects, settings] = await Promise.all([DB.getClassesForTeacher(uid), DB.getSubjects(), DB.getSettings()]);
const subArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
if (!classArr.length || !subArr.length) {
container.innerHTML = `<div class="card"><p class="text-muted">Data kelas atau mata pelajaran belum tersedia untuk Anda.</p></div>`;
return;
}
const hash = window.location.hash || '';
const queryString = hash.includes('?') ? hash.split('?')[1] : '';
const urlParams = new URLSearchParams(queryString);
const preClassId = urlParams.get('classId');
const preSubjectId = urlParams.get('subjectId');
const classOpts = classArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('');
container.innerHTML = `
<div class="card" style="margin-bottom:20px">
<form id="filter-academic" class="inline-form" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
<div class="form-group" style="margin-bottom:0;flex:1;min-width:200px">
<label>Pilih Kelas</label>
<select id="ac-class" required>
<option value="">Pilih Kelas</option>
${classOpts}
</select>
</div>
<div class="form-group" style="margin-bottom:0;flex:1;min-width:200px">
<label>Mata Pelajaran</label>
<select id="ac-subject" required disabled>
<option value="">Pilih Mata Pelajaran</option>
</select>
</div>
<button type="submit" class="btn btn-primary"><i class="ph ph-magnifying-glass"></i> Tampilkan</button>
</form>
</div>
<div id="academic-container"></div>
`;    const populateSubjectsForClass = (classId) => {
const subSelect = document.getElementById('ac-subject');
if (!subSelect) return [];
subSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
if (!classId) {
subSelect.disabled = true;
return [];
}
const cls = classArr.find(c => c.id === classId);
const isWali = cls && cls.teacherId === uid;
const classSubKeys = cls && cls.subjectTeachers ? Object.keys(cls.subjectTeachers) : [];
const classSubjects = classSubKeys.length > 0 ? subArr.filter(s => classSubKeys.includes(s.id)) : subArr;
let availableSubjects = [];
if (isWali) {
availableSubjects = classSubjects;
} else {
const mySubjectIds = Object.keys(cls.subjectTeachers || {}).filter(subId => cls.subjectTeachers[subId] === uid);
availableSubjects = classSubjects.filter(s => mySubjectIds.includes(s.id));
}
availableSubjects.forEach(s => {
subSelect.innerHTML += `<option value="${s.id}">${AppConfig.escapeHtml(s.name)}</option>`;
});
subSelect.disabled = availableSubjects.length === 0;
return availableSubjects;
};
document.getElementById('ac-class').addEventListener('change', (e) => {
populateSubjectsForClass(e.target.value);
});document.getElementById('filter-academic').onsubmit = async (e) => {
e.preventDefault();
const classId = document.getElementById('ac-class').value;
const subjectId = document.getElementById('ac-subject').value;
if (!classId || !subjectId) return;
const acContainer = document.getElementById('academic-container');
acContainer.innerHTML = '<div class="loader" style="margin: 20px auto"></div>';
const cls = classArr.find(c => c.id === classId);
const isWali = cls && cls.teacherId === uid;
const subjectTeacherUid = cls?.subjectTeachers?.[subjectId];
const isSubjectTeacher = subjectTeacherUid === uid || (!subjectTeacherUid && isWali);
const isReadOnly = isWali && !isSubjectTeacher && Boolean(subjectTeacherUid);
const year = settings.currentAcademicYear;
const sem = settings.currentSemester;
const [students, rawChapters, finalization] = await Promise.all([
DB.getStudentsByClass(classId),
DB.getSubjectChapters(year, sem, classId, subjectId),
DB.getRaporFinalization(year, sem, classId)
]);
const studentArr = DB.toArray(students).sort((a, b) => a.name.localeCompare(b.name));
if (!studentArr.length) {
acContainer.innerHTML = '<div class="card"><p class="text-muted">Belum ada siswa di kelas ini.</p></div>';
return;
}
let currentChapters = Array.isArray(rawChapters) && rawChapters.length ? rawChapters : [
{ chapterNo: 1, title: 'Bab 1', cp: 'Memahami materi pokok dan konsep dasar bab 1 dengan baik' },
{ chapterNo: 2, title: 'Bab 2', cp: 'Mampu menyelesaikan latihan dan penerapan materi bab 2 secara mandiri' }
];
const grades = {};
for (const s of studentArr) {
const studentGrades = await DB.getAcademicGrades(year, sem, s.id);
grades[s.id] = studentGrades[subjectId] || {};
}
const renderFullUi = () => {
let chManageHtml = '';
if (isReadOnly) {
chManageHtml = `
<div class="card section-block" style="margin-bottom:14px; border-left:4px solid var(--warning,#f59e0b);">
<div class="card-header mk-header" style="padding:10px 14px;">
<h4 style="margin:0;font-size:13.5px;"><i class="ph ph-lock"></i> Mode Peninjauan Wali Kelas (Read-Only Nilai Mapel)</h4>
<span class="badge badge-warning">Guru Mapel Pengampu</span>
</div>
<div class="card-body" style="padding:10px 14px; font-size:12.5px;">
<p class="text-muted" style="margin:0 0 8px 0;">Nilai PH per Bab, STS, dan SAS/SAT diinput langsung oleh guru pengampu mapel. Nilai ini otomatis direkap untuk rapor. Sebagai wali kelas, Anda dapat memeriksa dan menyesuaikan deskripsi Capaian Kompetensi (CP) rapor sebelum difinalisasi.</p>
<div style="display:flex; flex-wrap:wrap; gap:8px;">
${currentChapters.map(c => `<span class="badge badge-outline" style="font-size:11px;"><strong>${AppConfig.escapeHtml(c.title || 'Bab ' + c.chapterNo)}:</strong> ${AppConfig.escapeHtml(c.cp || '-')}</span>`).join('')}
</div>
</div>
</div>
`;
} else {
chManageHtml = `
<div class="card section-block" style="margin-bottom:14px; border-left:4px solid var(--primary,#2563eb);">
<div class="card-header mk-header" style="padding:10px 14px;">
<h4 style="margin:0;font-size:13.5px;"><i class="ph ph-list-numbers"></i> Bab & Capaian Pembelajaran (CP/TP) yang Diujikan</h4>
<button type="button" class="btn btn-xs btn-outline" id="btn-add-chapter"><i class="ph ph-plus"></i> Tambah Bab</button>
</div>
<div class="card-body" style="padding:12px 14px;">
<p class="text-muted" style="font-size:12px; margin:0 0 10px 0;">Input judul bab dan kalimat Capaian Pembelajaran (CP/TP). Nilai per bab akan ditampilkan pada laporan wali kelas dan orang tua murid. CP pada bab bernilai terbaik otomatis disarankan sebagai deskripsi rapor.</p>
<div id="chapters-list-container" style="display:flex; flex-direction:column; gap:8px;">
${currentChapters.map((ch, idx) => `
<div class="chapter-config-row" data-idx="${idx}" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; background:var(--bg-subtle,#f8fafc); padding:8px 10px; border-radius:8px; border:1px solid var(--border-color,#e2e8f0);">
<strong style="font-size:12px; min-width:55px;">Bab ${ch.chapterNo}:</strong>
<input type="text" class="ch-title-inp" data-idx="${idx}" value="${AppConfig.escapeHtml(ch.title || '')}" placeholder="Judul / Materi Bab" style="flex:1; min-width:140px; font-size:12px; padding:4px 8px; border-radius:6px; border:1px solid var(--border-color);">
<input type="text" class="ch-cp-inp" data-idx="${idx}" value="${AppConfig.escapeHtml(ch.cp || '')}" placeholder="Deskripsi Capaian Pembelajaran (CP/TP)" style="flex:2; min-width:200px; font-size:12px; padding:4px 8px; border-radius:6px; border:1px solid var(--border-color);">
${currentChapters.length > 1 ? `<button type="button" class="btn-icon btn-remove-ch" data-idx="${idx}" style="color:var(--danger,#ef4444);"><i class="ph ph-trash"></i></button>` : ''}
</div>
`).join('')}
</div>
</div>
</div>
`;
}
let finalizationCard = '';
if (isWali) {
const isFin = finalization && finalization.finalized;
finalizationCard = `
<div class="card section-block" style="margin-bottom:14px; background:${isFin ? '#ecfdf5' : '#fffbeb'}; border:1px solid ${isFin ? '#a7f3d0' : '#fde68a'}; padding:12px 16px;">
<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
<div>
<h4 style="margin:0 0 4px 0; font-size:13.5px; color:${isFin ? '#065f46' : '#92400e'};">
<i class="ph ph-${isFin ? 'check-circle' : 'clock'}"></i> Status Finalisasi Rapor Kelas ${AppConfig.escapeHtml(cls.name)}
</h4>
<p style="margin:0; font-size:12px; color:${isFin ? '#047857' : '#b45309'};">
${isFin ? 'Rapor kelas telah difinalisasi. Lembar rapor resmi siap diunduh & dicetak oleh wali murid.' : 'Rapor belum difinalisasi. Wali murid belum dapat mengunduh rapor cetak.'}
</p>
</div>
<button type="button" id="btn-toggle-finalize-rapor" class="btn btn-sm ${isFin ? 'btn-outline-danger' : 'btn-success'}">
<i class="ph ph-${isFin ? 'lock-key-open' : 'seal-check'}"></i> ${isFin ? 'Batalkan Finalisasi' : 'Finalisasi Rapor Kelas'}
</button>
</div>
</div>
`;
}
const studentCardsHtml = studentArr.map((s, idx) => {
const g = grades[s.id] || {};
const existingStudentChapters = g.chapters || [];
const chInputs = currentChapters.map((ch) => {
const chScoreObj = existingStudentChapters.find(sc => sc.chapterNo === ch.chapterNo);
const val = chScoreObj ? chScoreObj.score : (ch.chapterNo === 1 && g.ph ? g.ph : '');
return `
<div class="form-group" style="margin-bottom:0; min-width:85px; flex:1;">
<label style="font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${AppConfig.escapeHtml(ch.title || 'Bab ' + ch.chapterNo)}">${AppConfig.escapeHtml(ch.title || 'Bab ' + ch.chapterNo)}</label>
<input type="number" class="ac-ch-score" data-stu="${s.id}" data-chno="${ch.chapterNo}" value="${val || ''}" placeholder="75-100" min="75" max="100" ${isReadOnly ? 'disabled' : ''}>
</div>
`;
}).join('');
const validChScores = currentChapters.map(ch => {
const found = existingStudentChapters.find(sc => sc.chapterNo === ch.chapterNo);
return found && Number.isFinite(Number(found.score)) && Number(found.score) >= 75 ? Number(found.score) : null;
}).filter(v => v !== null);
const computedPh = validChScores.length ? Math.round(validChScores.reduce((a, b) => a + b, 0) / validChScores.length) : (g.ph || '');
let bestChText = 'Belum diisi';
if (validChScores.length) {
let maxScore = -1;
let maxCh = null;
currentChapters.forEach(ch => {
const found = existingStudentChapters.find(sc => sc.chapterNo === ch.chapterNo);
const scoreNum = found ? Number(found.score) : null;
if (Number.isFinite(scoreNum) && scoreNum > maxScore) {
maxScore = scoreNum;
maxCh = ch;
}
});
if (maxCh) {
bestChText = `${maxCh.title || 'Bab ' + maxCh.chapterNo} (${maxScore})`;
}
}
const defaultCpText = g.competency || (bestChText !== 'Belum diisi' ? `Menunjukkan penguasaan sangat baik pada materi ${bestChText}.` : 'Menunjukkan penguasaan materi yang baik.');
return `
<div class="card section-block stu-grade-card" data-stu="${s.id}" style="margin-bottom:12px; padding:12px;">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:6px;">
<h4 style="margin:0; font-size:14px;">${idx + 1}. ${AppConfig.escapeHtml(s.name)}</h4>
<div style="display:inline-flex; align-items:center; gap:8px;">
<span class="text-muted" style="font-size:12px;">NISN: ${s.nisn || '-'}</span>
<span class="badge badge-success ac-best-badge" data-stu="${s.id}" style="font-size:11px;"><i class="ph ph-trend-up"></i> Terbaik: ${AppConfig.escapeHtml(bestChText)}</span>
</div>
</div>
<div style="background:var(--bg-card,#fff); border:1px solid var(--border-color,#e2e8f0); border-radius:8px; padding:10px; margin-bottom:10px;">
<div style="font-size:11.5px; font-weight:700; color:var(--text-muted); margin-bottom:6px;"><i class="ph ph-exam"></i> Penilaian Harian (PH) per Bab:</div>
<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
${chInputs}
<div class="form-group" style="margin-bottom:0; min-width:85px;">
<label style="font-size:11px; font-weight:700; color:var(--primary);">Rata-rata PH</label>
<input type="number" class="ac-ph-avg" data-stu="${s.id}" value="${computedPh || ''}" placeholder="PH" readonly style="background:var(--bg-subtle,#f1f5f9); font-weight:700;">
</div>
</div>
</div>
<div class="grade-input-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:8px; margin-bottom:10px;">
<div class="form-group" style="margin-bottom:0;">
<label style="font-size:11px;">STS 1 (Ganjil)</label>
<input type="number" class="ac-sts1" data-stu="${s.id}" value="${g.sts1 || ''}" placeholder="75-100" min="75" max="100" ${isReadOnly ? 'disabled' : ''}>
</div>
<div class="form-group" style="margin-bottom:0;">
<label style="font-size:11px;">SAS (Semester 1)</label>
<input type="number" class="ac-sas" data-stu="${s.id}" value="${g.sas || ''}" placeholder="75-100" min="75" max="100" ${isReadOnly ? 'disabled' : ''}>
</div>
<div class="form-group" style="margin-bottom:0;">
<label style="font-size:11px;">STS 2 (Genap)</label>
<input type="number" class="ac-sts2" data-stu="${s.id}" value="${g.sts2 || ''}" placeholder="75-100" min="75" max="100" ${isReadOnly ? 'disabled' : ''}>
</div>
<div class="form-group" style="margin-bottom:0;">
<label style="font-size:11px;">SAT (Akhir Tahun)</label>
<input type="number" class="ac-sat" data-stu="${s.id}" value="${g.sat || ''}" placeholder="75-100" min="75" max="100" ${isReadOnly ? 'disabled' : ''}>
</div>
<div class="form-group" style="margin-bottom:0;">
<label style="font-size:11px; font-weight:700; color:var(--primary);">Nilai Akhir Rapor</label>
<input type="number" class="ac-score" data-stu="${s.id}" value="${g.score || ''}" placeholder="75-100" min="75" max="100">
</div>
</div>
<div class="form-group" style="margin-bottom:0;">
<label style="font-size:11.5px; display:flex; justify-content:space-between; align-items:center;">
<span><strong>Capaian Kompetensi (CP Rapor Siswa)</strong></span>
<span class="text-muted" style="font-size:11px;">Otomatis dari Bab Tertinggi (Bisa Diedit Wali Kelas)</span>
</label>
<textarea class="ac-comp-text" data-stu="${s.id}" rows="2" style="width:100%; font-size:12.5px; border-radius:6px; border:1px solid var(--border-color); padding:6px 8px;">${AppConfig.escapeHtml(defaultCpText)}</textarea>
</div>
</div>
`;
}).join('');
acContainer.innerHTML = `
${finalizationCard}
${chManageHtml}
<div style="margin-bottom:16px;">
${studentCardsHtml}
</div>
<button id="btn-save-academic" class="btn btn-primary" style="width:100%; padding:12px; font-size:14px;"><i class="ph ph-floppy-disk"></i> Simpan Semua Nilai & Capaian Rapor</button>
`;
bindEvents();
};
const bindEvents = () => {
const btnAddCh = document.getElementById('btn-add-chapter');
if (btnAddCh) {
btnAddCh.onclick = () => {
const nextNo = currentChapters.length + 1;
currentChapters.push({
chapterNo: nextNo,
title: `Bab ${nextNo}`,
cp: `Mampu memahami dan menerapkan kompetensi pada materi bab ${nextNo}`
});
renderFullUi();
};
}
acContainer.querySelectorAll('.btn-remove-ch').forEach(btn => {
btn.onclick = () => {
const idx = Number(btn.getAttribute('data-idx'));
if (currentChapters.length > 1) {
currentChapters.splice(idx, 1);
currentChapters.forEach((c, i) => c.chapterNo = i + 1);
renderFullUi();
}
};
});
acContainer.querySelectorAll('.ch-title-inp').forEach(inp => {
inp.onchange = (e) => {
const idx = Number(e.target.getAttribute('data-idx'));
if (currentChapters[idx]) currentChapters[idx].title = e.target.value.trim();
};
});
acContainer.querySelectorAll('.ch-cp-inp').forEach(inp => {
inp.onchange = (e) => {
const idx = Number(e.target.getAttribute('data-idx'));
if (currentChapters[idx]) currentChapters[idx].cp = e.target.value.trim();
};
});
const btnToggleFinalize = document.getElementById('btn-toggle-finalize-rapor');
if (btnToggleFinalize) {
btnToggleFinalize.onclick = async () => {
const currentFin = finalization && finalization.finalized;
const confirmMsg = currentFin ? 'Batalkan status finalisasi rapor kelas ini?' : 'Finalisasi rapor kelas ini? Wali murid akan dapat melihat dan mencetak lembar rapor.';
if (!confirm(confirmMsg)) return;
btnToggleFinalize.disabled = true;
try {
await DB.saveRaporFinalization(year, sem, classId, {
finalized: !currentFin,
finalizedBy: uid,
className: cls.name
});
if (!currentFin && typeof NotificationService !== 'undefined') {
const parents = await DB.getStudentsByClass(classId);
const parentArr = DB.toArray(parents);
parentArr.forEach(st => {
if (st.parentUid) {
NotificationService.send({
recipientUid: st.parentUid,
title: 'Rapor Digital Siswa Siap',
message: `Rapor semester ${sem} T.A ${year} untuk ananda ${st.name} telah difinalisasi dan siap dicetak.`,
link: '#/parent/report-card',
type: 'success'
});
}
});
}
document.getElementById('filter-academic').dispatchEvent(new Event('submit', { cancelable: true }));
} catch (err) {
alert('Gagal memperbarui status finalisasi rapor.');
btnToggleFinalize.disabled = false;
}
};
}
acContainer.querySelectorAll('.stu-grade-card').forEach(card => {
const stuId = card.getAttribute('data-stu');
const chScoreInputs = card.querySelectorAll('.ac-ch-score');
const sts1Inp = card.querySelector('.ac-sts1');
const sasInp = card.querySelector('.ac-sas');
const sts2Inp = card.querySelector('.ac-sts2');
const satInp = card.querySelector('.ac-sat');
const phAvgInp = card.querySelector('.ac-ph-avg');
const scoreInp = card.querySelector('.ac-score');
const compText = card.querySelector('.ac-comp-text');
const bestBadge = card.querySelector('.ac-best-badge');
const recalculateStudent = () => {
const chScores = [];
chScoreInputs.forEach(inp => {
const chNo = Number(inp.getAttribute('data-chno'));
const v = Number(inp.value);
if (inp.value && Number.isFinite(v) && v >= 75) {
chScores.push({ chapterNo: chNo, score: v });
}
});
let phAvg = null;
let bestCh = null;
if (chScores.length) {
phAvg = Math.round(chScores.reduce((acc, c) => acc + c.score, 0) / chScores.length);
chScores.sort((a, b) => b.score - a.score);
const foundCh = currentChapters.find(c => c.chapterNo === chScores[0].chapterNo);
bestCh = {
chapterNo: chScores[0].chapterNo,
score: chScores[0].score,
title: foundCh?.title || `Bab ${chScores[0].chapterNo}`,
cp: foundCh?.cp || ''
};
}
if (phAvgInp) phAvgInp.value = phAvg || '';
if (bestBadge) {
bestBadge.innerHTML = bestCh ? `<i class="ph ph-trend-up"></i> Terbaik: ${AppConfig.escapeHtml(bestCh.title)} (${bestCh.score})` : '<i class="ph ph-trend-up"></i> Belum diisi';
}
const sts1Val = Number(sts1Inp?.value);
const sasVal = Number(sasInp?.value);
const sts2Val = Number(sts2Inp?.value);
const satVal = Number(satInp?.value);
const validExams = [phAvg, sts1Val, sasVal, sts2Val, satVal].filter(v => Number.isFinite(v) && v >= 75);
if (validExams.length && scoreInp) {
scoreInp.value = Math.round(validExams.reduce((a, b) => a + b, 0) / validExams.length);
}
if (bestCh && compText && (!compText.value.trim() || compText.value.startsWith('Menunjukkan penguasaan'))) {
compText.value = bestCh.cp ? `Menunjukkan penguasaan materi yang sangat baik dalam ${bestCh.cp}.` : `Menunjukkan penguasaan materi yang sangat baik pada ${bestCh.title}.`;
}
};
chScoreInputs.forEach(inp => inp.oninput = recalculateStudent);
[sts1Inp, sasInp, sts2Inp, satInp].forEach(inp => {
if (inp) inp.oninput = recalculateStudent;
});
});
document.getElementById('btn-save-academic').onclick = async (e) => {
const btn = e.target;
for (const card of acContainer.querySelectorAll('.stu-grade-card')) {
const inputs = card.querySelectorAll('input[type="number"]');
for (const inp of inputs) {
if (inp.readOnly || inp.disabled) continue;
const v = Number(inp.value);
if (inp.value && (v < 75 || v > 100)) {
alert('Skala nilai harus berada di rentang 75 sampai 100.');
inp.focus();
return;
}
}
}
btn.disabled = true;
btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
try {
if (!isReadOnly) {
await DB.saveSubjectChapters(year, sem, classId, subjectId, currentChapters);
}
const promises = [];
for (const s of studentArr) {
const card = acContainer.querySelector(`.stu-grade-card[data-stu="${s.id}"]`);
if (!card) continue;
const studentChapters = [];
card.querySelectorAll('.ac-ch-score').forEach(inp => {
const chNo = Number(inp.getAttribute('data-chno'));
const val = Number(inp.value);
const chObj = currentChapters.find(c => c.chapterNo === chNo);
if (inp.value && Number.isFinite(val)) {
studentChapters.push({
chapterNo: chNo,
title: chObj?.title || `Bab ${chNo}`,
cp: chObj?.cp || '',
score: val
});
}
});
const phVal = card.querySelector('.ac-ph-avg')?.value;
const sts1Val = card.querySelector('.ac-sts1')?.value;
const sasVal = card.querySelector('.ac-sas')?.value;
const sts2Val = card.querySelector('.ac-sts2')?.value;
const satVal = card.querySelector('.ac-sat')?.value;
const scoreVal = card.querySelector('.ac-score')?.value;
const compVal = card.querySelector('.ac-comp-text')?.value.trim();
let bestCh = null;
if (studentChapters.length) {
const sorted = [...studentChapters].sort((a, b) => b.score - a.score);
bestCh = sorted[0];
}
if (scoreVal || phVal || sts1Val || sasVal || sts2Val || satVal || compVal || studentChapters.length) {
promises.push(DB.saveAcademicGrade(year, sem, s.id, subjectId, {
chapters: studentChapters,
ph: phVal ? parseInt(phVal) : null,
bestChapter: bestCh,
sts1: sts1Val ? parseInt(sts1Val) : null,
sas: sasVal ? parseInt(sasVal) : null,
sts2: sts2Val ? parseInt(sts2Val) : null,
sat: satVal ? parseInt(satVal) : null,
score: scoreVal ? parseInt(scoreVal) : null,
competency: compVal,
descPositive: compVal,
updatedBy: uid,
updatedByRole: isReadOnly ? 'WALI_KELAS' : 'GURU_MAPEL'
}));
}
}
await Promise.all(promises);
btn.innerHTML = '<i class="ph ph-check"></i> Tersimpan';
if (typeof NotificationService !== 'undefined' && !isReadOnly && cls?.teacherId && cls.teacherId !== uid) {
const subObj = subArr.find(s => s.id === subjectId);
NotificationService.send({
recipientUid: cls.teacherId,
title: 'Nilai Siswa Diperbarui',
message: `Nilai mapel ${subObj?.name || 'Mata Pelajaran'} (${cls.name}) telah disimpan oleh guru pengampu.`,
link: `#/guru/academic?classId=${classId}&subjectId=${subjectId}`,
type: 'info'
});
}
setTimeout(() => {
btn.disabled = false;
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Semua Nilai & Capaian Rapor';
}, 2000);
} catch (err) {
console.error('Error saving grades:', err);
alert('Gagal menyimpan nilai.');
btn.disabled = false;
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Semua Nilai & Capaian Rapor';
}
};
};
renderFullUi();
};
if (preClassId && classArr.some(c => c.id === preClassId)) {
document.getElementById('ac-class').value = preClassId;
const avail = populateSubjectsForClass(preClassId);
if (preSubjectId && avail.some(s => s.id === preSubjectId)) {
document.getElementById('ac-subject').value = preSubjectId;
setTimeout(() => {
const form = document.getElementById('filter-academic');
if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
}, 50);
}
}
},
async renderAdditionalData(container) {
Router.setTitle('Data Tambahan', 'Input Kokurikuler, Ekstrakurikuler, Kehadiran, dan Catatan Wali Kelas.');
const [classes, ekskuls, settings] = await Promise.all([
DB.getClasses(),
DB.getExtracurriculars(),
DB.getSettings()
]);
const classArr = DB.toArray(classes);
const eksArr = DB.toArray(ekskuls).sort((a, b) => (a.order || 0) - (b.order || 0));
if (!classArr.length) {
container.innerHTML = `<div class="card"><p class="text-muted">Data kelas belum tersedia.</p></div>`;
return;
}
const classOpts = classArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('');
container.innerHTML = `
<div class="card" style="margin-bottom:20px">
<div class="form-group" style="margin-bottom:0">
<label>Pilih Kelas</label>
<select id="add-class">
<option value="">— Pilih Kelas —</option>
${classOpts}
</select>
</div>
</div>
<div id="add-student-container"></div>
<div id="add-form-container"></div>
`;
document.getElementById('add-class').onchange = async (e) => {
const classId = e.target.value;
const stuContainer = document.getElementById('add-student-container');
const formContainer = document.getElementById('add-form-container');
formContainer.innerHTML = '';
if (!classId) {
stuContainer.innerHTML = '';
return;
}
stuContainer.innerHTML = '<div class="loader" style="margin: 20px auto"></div>';
const students = await DB.getStudentsByClass(classId);
const studentArr = DB.toArray(students).sort((a, b) => a.name.localeCompare(b.name));
if (!studentArr.length) {
stuContainer.innerHTML = `<div class="card"><p class="text-muted">Belum ada siswa di kelas ini.</p></div>`;
return;
}
const stuOpts = studentArr.map(s => `<option value="${s.id}">${AppConfig.escapeHtml(s.name)}</option>`).join('');
stuContainer.innerHTML = `
<div class="card" style="margin-bottom:20px">
<div class="form-group" style="margin-bottom:0">
<label>Pilih Siswa</label>
<select id="add-student">
<option value="">— Pilih Siswa —</option>
${stuOpts}
</select>
</div>
</div>
`;
document.getElementById('add-student').onchange = async (e) => {
const studentId = e.target.value;
if (!studentId) {
formContainer.innerHTML = '';
return;
}
formContainer.innerHTML = '<div class="loader" style="margin: 20px auto"></div>';
const year = settings.currentAcademicYear;
const sem = settings.currentSemester;
const [cocu, stuEks, att, note, snapAch] = await Promise.all([
DB.getCocurricular(year, sem, studentId),
DB.getStudentExtracurriculars(year, sem, studentId),
DB.getAttendance(year, sem, studentId),
DB.getTeacherNote(year, sem, studentId),
db.ref('student_affairs/achievements').orderByChild('studentId').equalTo(studentId).once('value')
]);
const achList = [];
snapAch.forEach(c => { achList.push({ id: c.key, ...c.val() }); });
const eksList = eksArr.map(e => {
const selected = stuEks && stuEks[e.id];
return `
<div style="border: 1px solid #ddd; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
<label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:bold; cursor:pointer">
<input type="checkbox" class="chk-eks" data-id="${e.id}" ${selected ? 'checked' : ''}>
${AppConfig.escapeHtml(e.name)}
</label>
<textarea id="desc-eks-${e.id}" rows="2" placeholder="Keterangan untuk ekstrakurikuler ini..." style="display: ${selected ? 'block' : 'none'}; width:100%">${selected ? (selected.description || '') : ''}</textarea>
</div>
`;
}).join('');
formContainer.innerHTML = `
<div class="card" style="margin-bottom:20px">
<h3 class="card-title" style="margin-bottom:16px">Kokurikuler</h3>
<div class="form-group">
<textarea id="add-cocu" rows="3" placeholder="Contoh: Ananda mandiri dan aktif dalam kegiatan sekolah...">${cocu ? (cocu.description || '') : ''}</textarea>
</div>
</div>
<div class="card" style="margin-bottom:20px">
<h3 class="card-title" style="margin-bottom:16px">Ekstrakurikuler</h3>
${eksArr.length ? eksList : '<p class="text-muted">Belum ada master ekstrakurikuler.</p>'}
</div>
<div class="card" style="margin-bottom:20px">
<h3 class="card-title" style="margin-bottom:16px">Ketidakhadiran (Hari)</h3>
<div style="display:flex; gap:12px; flex-wrap:wrap">
<div class="form-group" style="flex:1; min-width:80px">
<label>Sakit</label>
<input type="number" id="add-sakit" value="${att ? (att.sakit || 0) : 0}" min="0">
</div>
<div class="form-group" style="flex:1; min-width:80px">
<label>Izin</label>
<input type="number" id="add-izin" value="${att ? (att.izin || 0) : 0}" min="0">
</div>
<div class="form-group" style="flex:1; min-width:80px">
<label>Tanpa Keterangan</label>
<input type="number" id="add-alpa" value="${att ? (att.alpa || 0) : 0}" min="0">
</div>
</div>
</div>
<div class="card" style="margin-bottom:20px">
<h3 class="card-title" style="margin-bottom:16px"><i class="ph ph-trophy"></i> Prestasi Siswa (Terintegrasi Kesiswaan)</h3>
${achList.length ? `
<div class="alert alert-info" style="margin-bottom:0">
<p style="margin:0 0 6px 0"><strong>Tercatat ${achList.length} Prestasi di Kesiswaan:</strong></p>
<ul style="margin:0 0 8px 16px; padding:0">
${achList.map(a => `<li><strong>${AppConfig.escapeHtml(a.title || a.competition || 'Prestasi')}</strong> — Juara ${AppConfig.escapeHtml(a.rank || '-')} (${AppConfig.escapeHtml(a.level || '-')})</li>`).join('')}
</ul>
<button type="button" class="btn btn-sm btn-outline" id="btn-copy-ach"><i class="ph ph-copy"></i> Sisipkan ke Catatan Rapor</button>
</div>
` : '<p class="text-muted" style="margin:0">Belum ada catatan prestasi dari Kesiswaan untuk siswa ini.</p>'}
</div>
<div class="card" style="margin-bottom:20px">
<h3 class="card-title" style="margin-bottom:16px">Catatan Wali Kelas</h3>
<div class="form-group">
<textarea id="add-note" rows="3" placeholder="Contoh: Ananda anak yang santun, aktif dalam ibadah berjamaah...">${note ? (note.note || '') : ''}</textarea>
</div>
</div>
<button id="btn-save-additional" class="btn btn-primary" style="width:100%; margin-bottom:40px"><i class="ph ph-floppy-disk"></i> Simpan Data Tambahan</button>
`;
document.querySelectorAll('.chk-eks').forEach(chk => {
chk.onchange = (e) => {
const txt = document.getElementById(`desc-eks-${e.target.dataset.id}`);
txt.style.display = e.target.checked ? 'block' : 'none';
};
});
const copyAchBtn = document.getElementById('btn-copy-ach');
if (copyAchBtn) {
copyAchBtn.onclick = () => {
const achText = achList.map(a => `${a.title || a.competition || 'Prestasi'} (Juara ${a.rank || '-'}, Tingkat ${a.level || '-'})`).join('; ');
const noteArea = document.getElementById('add-note');
const prefix = noteArea.value.trim() ? noteArea.value.trim() + '\n\nPrestasi yang diraih: ' : 'Prestasi yang diraih: ';
noteArea.value = prefix + achText;
};
}
document.getElementById('btn-save-additional').onclick = async (e) => {
const btn = e.target;
btn.disabled = true;
btn.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';
const pCocu = DB.saveCocurricular(year, sem, studentId, {
description: document.getElementById('add-cocu').value.trim(),
updatedBy: Auth.currentUser.uid
});
const pNote = DB.saveTeacherNote(year, sem, studentId, {
note: document.getElementById('add-note').value.trim(),
updatedBy: Auth.currentUser.uid
});
const pAtt = DB.saveAttendance(year, sem, studentId, {
sakit: parseInt(document.getElementById('add-sakit').value) || 0,
izin: parseInt(document.getElementById('add-izin').value) || 0,
alpa: parseInt(document.getElementById('add-alpa').value) || 0,
updatedBy: Auth.currentUser.uid
});
const pEks = [];
document.querySelectorAll('.chk-eks').forEach(chk => {
const id = chk.dataset.id;
if (chk.checked) {
const desc = document.getElementById(`desc-eks-${id}`).value.trim();
pEks.push(DB.saveStudentExtracurricular(year, sem, studentId, id, {
description: desc,
updatedBy: Auth.currentUser.uid
}));
} else {
pEks.push(DB.deleteStudentExtracurricular(year, sem, studentId, id));
}
});
try {
await Promise.all([pCocu, pNote, pAtt, ...pEks]);
btn.innerHTML = '<i class="ph ph-check"></i> Tersimpan';
setTimeout(() => {
btn.disabled = false;
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Data Tambahan';
}, 2000);
} catch (err) {
alert('Gagal menyimpan data.');
btn.disabled = false;
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Data Tambahan';
}
};
};
};
},
_obsModal(charArr) {
const charOpts = charArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('');
return `
<div class="modal-overlay" id="modal-obs">
<div class="modal">
<div class="modal-header">
<h3 class="modal-title" id="obs-title">Catatan perilaku</h3>
<button class="btn-icon" data-close-modal="modal-obs""><i class="ph ph-x"></i></button>
</div>
<form id="form-obs-modal">
<input type="hidden" id="obs-stu-id">
<div class="modal-body">
<div class="form-group"><label>Jenis</label>
<select id="obs-type"><option value="positive">👍 Positif</option><option value="needs_improvement">⚠ Perlu bimbingan</option></select>
</div>
<div class="form-group"><label>Karakter</label><select id="obs-char" required>${charOpts}</select></div>
<div class="form-group"><label>Catatan</label><textarea id="obs-note" rows="3" placeholder="Contoh: Mengerjakan tugas tepat waktu tanpa diingatkan."></textarea></div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-obs"">Batal</button>
<button type="submit" class="btn btn-primary">Simpan</button>
</div>
</form>
</div>
</div>`;
},
_openObsModal(studentId, studentName) {
document.getElementById('obs-title').innerText = `Catatan — ${AppConfig.escapeHtml(studentName)}`;
document.getElementById('obs-stu-id').value = studentId;
document.getElementById('obs-note').value = '';
document.getElementById('modal-obs').classList.add('active');
const form = document.getElementById('form-obs-modal');
form.onsubmit = async (e) => {
e.preventDefault();
const btn = form.querySelector('button[type="submit"]');
btn.disabled = true;
const today = new Date().toISOString().slice(0, 10);
await DB.saveObservation({
studentId: document.getElementById('obs-stu-id').value,
teacherId: Auth.currentUser.uid,
type: document.getElementById('obs-type').value,
characterId: document.getElementById('obs-char').value,
note: document.getElementById('obs-note').value.trim(),
date: today
});
btn.disabled = false;
App.closeModal('modal-obs');
};
},
async renderEkskulInput(container, eksId) {
const [ekskuls, classes, settings] = await Promise.all([
DB.getExtracurriculars(),
DB.getClasses(),
DB.getSettings()
]);
const eks = ekskuls[eksId];
if (!eks || eks.teacherId !== Auth.currentUser.uid) {
container.innerHTML = '<div class="card"><p class="error-text">Ekstrakurikuler tidak ditemukan atau Anda tidak memiliki akses.</p></div>';
return;
}
Router.setTitle(`Nilai Ekskul: ${AppConfig.escapeHtml(eks.name)}`, 'Pilih kelas untuk menginput nilai siswa.');
const classArr = DB.toArray(classes);
const classOpts = classArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('');
container.innerHTML = `
<div style="margin-bottom:16px"><a href="#/dashboard" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali</a></div>
<div class="card" style="margin-bottom:20px">
<form id="filter-eks" class="inline-form" style="display:flex;gap:12px;align-items:flex-end">
<div class="form-group" style="margin-bottom:0;flex:1">
<label>Pilih Kelas</label>
<select id="eks-class" required>
<option value="">— Pilih Kelas —</option>
${classOpts}
</select>
</div>
<button type="submit" class="btn btn-primary"><i class="ph ph-magnifying-glass"></i> Tampilkan</button>
</form>
</div>
<div id="eks-container"></div>
`;
document.getElementById('filter-eks').onsubmit = async (e) => {
e.preventDefault();
const classId = document.getElementById('eks-class').value;
if (!classId) return;
const eksCont = document.getElementById('eks-container');
eksCont.innerHTML = '<div class="loader" style="margin: 20px auto"></div>';
const students = await DB.getStudentsByClass(classId);
const studentArr = DB.toArray(students).sort((a, b) => a.name.localeCompare(b.name));
if (!studentArr.length) {
eksCont.innerHTML = `<div class="card"><p class="text-muted">Belum ada siswa di kelas ini.</p></div>`;
return;
}
const year = settings.currentAcademicYear;
const sem = settings.currentSemester;
const sEksData = {};
for (const s of studentArr) {
const dt = await DB.getStudentExtracurriculars(year, sem, s.id);
sEksData[s.id] = dt[eks.id] || { score: '', description: '' };
}
const rows = studentArr.map((s, idx) => `
<div class="card" style="margin-bottom: 12px; padding: 12px;">
<h4 style="margin-top:0; margin-bottom:12px; font-size:15px">${idx + 1}. ${AppConfig.escapeHtml(s.name)}</h4>
<div style="display:flex; gap:16px; flex-wrap:wrap">
<div class="form-group" style="flex: 0 0 120px; margin-bottom:0">
<label>Nilai (A/B/C/D)</label>
<select class="input-score" data-stu="${s.id}">
<option value="">—</option>
<option value="A" ${sEksData[s.id].score === 'A' ? 'selected' : ''}>A (Sangat Baik)</option>
<option value="B" ${sEksData[s.id].score === 'B' ? 'selected' : ''}>B (Baik)</option>
<option value="C" ${sEksData[s.id].score === 'C' ? 'selected' : ''}>C (Cukup)</option>
<option value="D" ${sEksData[s.id].score === 'D' ? 'selected' : ''}>D (Kurang)</option>
</select>
</div>
<div class="form-group" style="flex: 1; margin-bottom:0">
<label>Keterangan</label>
<textarea rows="2" class="input-desc" data-stu="${s.id}">${sEksData[s.id].description || ''}</textarea>
</div>
</div>
</div>
`).join('');
eksCont.innerHTML = `
<form id="form-save-eks">
${rows}
<div style="text-align:right; margin-top:20px; position:sticky; bottom:20px; z-index:100;">
<button type="submit" class="btn btn-primary" style="box-shadow: 0 4px 12px rgba(0,0,0,0.15)"><i class="ph ph-floppy-disk"></i> Simpan Semua Nilai</button>
</div>
</form>
`;
document.getElementById('form-save-eks').onsubmit = async (ev) => {
ev.preventDefault();
const btn = ev.target.querySelector('button[type="submit"]');
btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
btn.disabled = true;
try {
const scores = document.querySelectorAll('.input-score');
const descs = document.querySelectorAll('.input-desc');
for (let i = 0; i < scores.length; i++) {
const stu = scores[i].dataset.stu;
const score = scores[i].value;
const desc = descs[i].value;
if (score || desc) {
await DB.saveStudentExtracurricular(year, sem, stu, eks.id, { score, description: desc });
} else {
await DB.deleteStudentExtracurricular(year, sem, stu, eks.id);
}
}
alert('Berhasil menyimpan nilai ekstrakurikuler!');
} catch (err) {
alert('Gagal menyimpan: ' + err.message);
} finally {
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Semua Nilai';
btn.disabled = false;
}
};
};
},
async renderTeacherAttendance(container) {
Router.setTitle('Presensi Kehadiran', 'Rekam kehadiran harian Anda di area sekolah.');
const geofence = window.APP_ATTENDANCE_GEOFENCE || window.AppConfig?.attendanceGeofence || ATTENDANCE_GEOFENCE;
const schoolLat = Number(geofence?.lat ?? -7.378448579234777);
const schoolLng = Number(geofence?.lng ?? 112.75929775962251);
const maxRadius = Number(geofence?.radiusMeters ?? 50);
const maxAccuracy = 200;
const hasLocalGeofence = Number.isFinite(schoolLat) && Number.isFinite(schoolLng) && Number.isFinite(maxRadius) && maxRadius > 0;
const hostName = window.location.host;
container.innerHTML = `
<div class="card attendance-status-card">
<div id="geo-status-icon" class="attendance-status-icon">
<i class="ph ph-spinner ph-spin"></i>
</div>
<h3 id="geo-status-title" class="attendance-status-title">Mencari Lokasi...</h3>
<p id="geo-status-text" class="attendance-status-text">Mohon tunggu, sedang memverifikasi posisi koordinat Anda.</p>
<div id="geo-permission-box" class="attendance-permission-box">
<div class="attendance-guide-title">
<i class="ph ph-shield-warning"></i>
<span id="geo-permission-headline">Panduan Mengaktifkan Izin Lokasi di Browser</span>
</div>
<p id="geo-permission-desc" class="attendance-status-text attendance-permission-desc">Browser otomatis mengunci akses jika izin lokasi pernah ditolak sebelumnya. Ikuti petunjuk di bawah untuk mengizinkan kembali:</p>
<div class="attendance-unblock-guide">
<div class="attendance-step-item">
<span class="attendance-step-num">1</span>
<span>Di bilah alamat (URL) paling atas browser, klik/ketuk ikon <strong>Setelan Situs / Ikon Gembok 🔒</strong> di sebelah kiri alamat <code>${hostName}</code>.</span>
</div>
<div class="attendance-step-item">
<span class="attendance-step-num">2</span>
<span>Buka menu <strong>Izin (Permissions)</strong> lalu ubah opsi <strong>Lokasi (Location)</strong> menjadi <strong>Izinkan (Allow)</strong> atau klik <strong>Reset Izin</strong>.</span>
</div>
<div class="attendance-step-item">
<span class="attendance-step-num">3</span>
<span>Pastikan pengaturan <strong>Layanan Lokasi (GPS)</strong> pada perangkat HP atau Laptop Anda sudah dalam status <strong>Aktif (ON)</strong>.</span>
</div>
<div class="attendance-step-item">
<span class="attendance-step-num">4</span>
<span>Setelah izin diberikan, <strong>muat ulang (refresh)</strong> halaman ini untuk memulai verifikasi kehadiran.</span>
</div>
</div>
<div class="attendance-alt-notice">
<div class="attendance-alt-title">
<i class="ph ph-info"></i>
<span>Kendala Perangkat / Lokasi Tetap Tidak Terdeteksi?</span>
</div>
<p class="attendance-alt-text">Jika browser atau perangkat tetap tidak dapat mendeteksi koordinat GPS, segera laporkan kehadiran Anda ke Admin IT atau Humas & Personalia agar kehadiran Anda langsung diverifikasi.</p>
<a id="btn-report-attendance-wa" class="btn btn-primary btn-sm attendance-wa-report-btn" target="_blank" rel="noopener">
<i class="ph ph-whatsapp-logo"></i> Konfirmasi ke Admin IT / Personalia
</a>
</div>
</div>
<div class="attendance-actions-row">
<button id="btn-checkin" class="btn btn-primary" disabled><i class="ph ph-sign-in"></i> Presensi Datang</button>
<button id="btn-checkout" class="btn btn-outline" disabled><i class="ph ph-sign-out"></i> Presensi Pulang</button>
</div>
<div id="proof-panel" class="attendance-proof-panel">
<div class="attendance-proof-header">
<strong>Bukti Foto Kehadiran dari Kamera</strong>
<span id="proof-status" class="text-muted">Belum ada foto</span>
</div>
<video id="attendance-camera-video" class="attendance-camera-video" autoplay playsinline muted></video>
<button id="attendance-camera-capture" type="button" class="btn btn-primary attendance-camera-capture">Ambil Foto Kamera</button>
<div id="attendance-proof-wrapper" class="attendance-proof-wrapper">
<img id="attendance-proof-preview" class="attendance-proof-preview" src="" alt="Preview bukti presensi">
</div>
</div>
</div>
<div class="card attendance-history-card">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
<h4 class="attendance-history-title" style="margin:0;">Riwayat Hari Ini</h4>
<span id="att-schedule-badge" class="badge badge-primary" style="font-size:11px;">Jadwal Aktif</span>
</div>
<div id="att-history-container">
<p class="text-muted attendance-history-empty">Memuat data...</p>
</div>
</div>
<section class="card section-block" style="margin-top:16px;">
<div class="card-header mk-header">
<h3 class="card-title"><i class="ph ph-calendar-check"></i> Rekap & Riwayat Presensi Saya</h3>
</div>
<div class="card-body">
<div class="card-grid section-spacer" id="att-rekap-stats" style="margin-bottom:16px;"></div>
<div class="table-wrap">
<table class="table">
<thead><tr><th>Tanggal</th><th>Jam Datang</th><th>Jam Pulang</th><th>Status</th><th>Bukti</th></tr></thead>
<tbody id="att-full-history-tbody"><tr><td colspan="5" class="text-muted">Memuat data rekap...</td></tr></tbody>
</table>
</div>
</div>
</section>
`;
const statusIcon = document.getElementById('geo-status-icon');
const statusTitle = document.getElementById('geo-status-title');
const statusText = document.getElementById('geo-status-text');
const permissionBox = document.getElementById('geo-permission-box');
const btnCheckin = document.getElementById('btn-checkin');
const btnCheckout = document.getElementById('btn-checkout');
const histContainer = document.getElementById('att-history-container');
const proofPanel = document.getElementById('proof-panel');
const cameraVideo = document.getElementById('attendance-camera-video');
const cameraCaptureBtn = document.getElementById('attendance-camera-capture');
const proofPreview = document.getElementById('attendance-proof-preview');
const proofStatus = document.getElementById('proof-status');
const proofWrapper = document.getElementById('attendance-proof-wrapper');
let cameraStream = null;
let capturedProofDataUrl = null;
const stopCamera = () => {
if (cameraStream) {
cameraStream.getTracks().forEach((track) => track.stop());
cameraStream = null;
}
if (cameraVideo) {
cameraVideo.srcObject = null;
}
};
const startCamera = async () => {
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
alert('Browser Anda tidak mendukung akses kamera.');
return false;
}
try {
if (cameraStream) return true;
cameraStream = await navigator.mediaDevices.getUserMedia({
video: {
facingMode: 'environment',
width: { ideal: 1280 },
height: { ideal: 720 }
},
audio: false
});
cameraVideo.srcObject = cameraStream;
cameraVideo.play();
return true;
} catch (error) {
console.error('Kamera error:', error);
alert('Izin kamera diperlukan untuk mengambil bukti presensi.');
return false;
}
};
const compressImageDataUrl = async (dataUrl, maxWidth = 1600, quality = 0.82) => {
return new Promise((resolve, reject) => {
const img = new Image();
img.onload = () => {
const canvas = document.createElement('canvas');
const scale = Math.min(1, maxWidth / img.width);
canvas.width = Math.max(1, Math.round(img.width * scale));
canvas.height = Math.max(1, Math.round(img.height * scale));
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
resolve(canvas.toDataURL('image/jpeg', quality));
};
img.onerror = reject;
img.src = dataUrl;
});
};
const captureCameraProof = async () => {
if (!cameraVideo || !cameraVideo.videoWidth || !cameraVideo.videoHeight) {
alert('Kamera belum siap. Silakan tunggu sebentar lalu coba lagi.');
return;
}
try {
const canvas = document.createElement('canvas');
canvas.width = cameraVideo.videoWidth;
canvas.height = cameraVideo.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
const snapshot = canvas.toDataURL('image/jpeg', 0.82);
const compressed = await compressImageDataUrl(snapshot, 1600, 0.82);
capturedProofDataUrl = compressed;
proofPreview.src = compressed;
proofWrapper.style.display = 'block';
proofStatus.innerText = 'Foto siap dikirim';
cameraCaptureBtn.innerText = 'Ambil Ulang Foto';
stopCamera();
} catch (error) {
console.error('Capture camera error:', error);
alert('Gagal mengambil foto dari kamera. Silakan coba lagi.');
}
};
cameraCaptureBtn.addEventListener('click', async () => {
const started = await startCamera();
if (!started || !cameraVideo) return;
try {
await new Promise((resolve) => {
const onReady = () => {
cameraVideo.removeEventListener('loadeddata', onReady);
resolve();
};
if (cameraVideo.readyState >= 2) {
resolve();
return;
}
cameraVideo.addEventListener('loadeddata', onReady, { once: true });
});
await captureCameraProof();
} catch (error) {
console.error('Camera capture button error:', error);
alert('Gagal mengakses kamera. Silakan coba lagi.');
}
});
const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
const teacherId = Auth.currentUser.uid;
const loadHistory = async () => {
const [myAtt, fullHist, settings] = await Promise.all([
DB.getTeacherAttendance(dateStr, teacherId),
DB.getTeacherAttendanceHistory(teacherId, 60),
DB.getSettings()
]);
const isUmmi = AppConfig.isUserUmmi(Auth.userData || Auth.currentUser);
const sched = AppConfig.getAttendanceSchedule ? AppConfig.getAttendanceSchedule(settings?.attendanceRules, isUmmi, new Date()) : {
inStart: '06:00', inEnd: isUmmi ? '07:15' : '06:45', outStart: isUmmi ? '12:30' : '14:30', outEnd: '17:30', label: `${isUmmi ? 'Guru Ummi' : 'GTK'}: Masuk 06:00`
};
const schedBadge = document.getElementById('att-schedule-badge');
if (schedBadge) {
schedBadge.textContent = sched.label;
}
if (sched.isOff) {
statusTitle.innerText = "Hari Libur";
statusText.innerText = `Hari ini (${sched.dayKey}) adalah hari libur untuk ${isUmmi ? 'Guru Ummi' : 'GTK'}. Tidak ada kewajiban presensi.`;
statusIcon.style.background = '#F3F4F6';
statusIcon.style.color = '#6B7280';
statusIcon.innerHTML = '<i class="ph ph-calendar-x" style="font-size: 32px;"></i>';
} else if (sched.isOptional) {
statusTitle.innerText = "Sabtu Opsional";
statusText.innerText = `Hari ini (${sched.dayKey}) jadwal presensi opsional untuk pembinaan.${isUmmi ? ' Tidak ada hitungan keterlambatan.' : ' Presensi masuk dibuka 07.00-08.00 WIB, pulang bebas.'}`;
}
if (!myAtt) {
histContainer.innerHTML = '<p class="text-muted" style="font-size: 13px; margin: 0;">Belum ada rekam presensi hari ini.</p>';
} else {
const proofMarkup = myAtt.proof_url
? `<div style="margin-top: 12px;"><img src="${DriveBridge.normalizeDriveImageUrl(myAtt.proof_url, 'w300', '')}" alt="Bukti presensi" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 10px; border: 1px solid #E5E7EB;"></div>`
: '';
histContainer.innerHTML = `
<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 8px;">
<span class="text-muted" style="font-size: 13px;">Datang</span>
<strong style="font-size: 13px;">${myAtt.time_in || '-'}</strong>
</div>
<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 8px;">
<span class="text-muted" style="font-size: 13px;">Pulang</span>
<strong style="font-size: 13px;">${myAtt.time_out || '-'}</strong>
</div>
${proofMarkup}
`;
if (myAtt.time_in && !myAtt.time_out) {
btnCheckin.style.display = 'none';
} else if (myAtt.time_in && myAtt.time_out) {
btnCheckin.style.display = 'none';
btnCheckout.style.display = 'none';
statusTitle.innerText = "Presensi Selesai";
statusText.innerText = "Anda sudah menyelesaikan presensi hari ini.";
}
}
const fullTbody = document.getElementById('att-full-history-tbody');
const statsGrid = document.getElementById('att-rekap-stats');
if (fullTbody && fullHist) {
let onTimeCount = 0;
let lateCount = 0;
const rowsHtml = fullHist.map((h) => {
let statusBadge = '<span class="badge badge-warning">Terlambat</span>';
const isLate = AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(h.time_in, sched) : (h.time_in > (sched.inEnd || '06:45'));
if (sched.noLatePenalty || (sched.isOptional && isUmmi)) {
statusBadge = '<span class="badge badge-success">Hadir (Pembinaan)</span>';
onTimeCount++;
} else if (!isLate && h.time_in) {
statusBadge = '<span class="badge badge-success">Tepat Waktu</span>';
onTimeCount++;
} else {
lateCount++;
}
const proofBtn = h.proof_url
? `<button type="button" class="btn btn-xs btn-outline mk-preview-btn" data-preview-url="${AppConfig.escapeHtml(h.proof_url)}" data-preview-title="Bukti Presensi ${h.date}"><i class="ph ph-eye"></i> Bukti</button>`
: '-';
return `<tr>
<td><strong>${h.date}</strong></td>
<td>${h.time_in || '-'}</td>
<td>${h.time_out || '-'}</td>
<td>${statusBadge}</td>
<td>${proofBtn}</td>
</tr>`;
}).join('') || '<tr><td colspan="5" class="text-muted">Belum ada riwayat kehadiran sebelumnya.</td></tr>';
fullTbody.innerHTML = rowsHtml;
if (statsGrid) {
statsGrid.innerHTML = `
<div class="card stat-card">
<div class="stat-icon stat-icon--primary"><i class="ph ph-calendar-check"></i></div>
<div><p class="stat-value">${fullHist.length}</p><p class="stat-label text-muted">Total Kehadiran</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--success"><i class="ph ph-check-circle"></i></div>
<div><p class="stat-value">${onTimeCount}</p><p class="stat-label text-muted">Tepat Waktu</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--warning"><i class="ph ph-clock-countdown"></i></div>
<div><p class="stat-value">${lateCount}</p><p class="stat-label text-muted">Terlambat</p></div>
</div>`;
}
}
};
await loadHistory();
const getDistance = (lat1, lon1, lat2, lon2) => {
const R = 6371e3;
const p1 = lat1 * Math.PI / 180;
const p2 = lat2 * Math.PI / 180;
const dp = (lat2 - lat1) * Math.PI / 180;
const dl = (lon2 - lon1) * Math.PI / 180;
const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
return R * c;
};
let currentLocation = null;
let currentAccuracy = null;
let watchId = null;
const acceptPosition = (latitude, longitude, accuracy, distance) => {
currentAccuracy = Number(accuracy || 0);
currentLocation = { lat: latitude, lng: longitude };
permissionBox.classList.remove('active');
if (!hasLocalGeofence) {
const posisiReady = currentAccuracy <= maxAccuracy;
if (posisiReady) {
statusIcon.style.background = '#D1FAE5'; statusIcon.style.color = '#10B981';
statusIcon.innerHTML = '<i class="ph ph-shield-check" style="font-size: 32px;"></i>';
statusTitle.innerText = 'Posisi Sudah Siap';
statusText.innerText = `Akurasi posisi saat ini ${Math.round(currentAccuracy)} m. Validasi final tetap dilakukan di server untuk memastikan lokasi sekolah benar.`;
proofPanel.style.display = 'block';
cameraVideo.style.display = 'block';
proofWrapper.style.display = 'none';
proofStatus.innerText = 'Belum ada foto';
cameraCaptureBtn.innerText = 'Ambil Foto Kamera';
btnCheckin.disabled = false;
btnCheckout.disabled = false;
void startCamera();
if (watchId !== null && navigator.geolocation) {
navigator.geolocation.clearWatch(watchId);
watchId = null;
}
return true;
}
statusIcon.style.background = '#FEF3C7'; statusIcon.style.color = '#F59E0B';
statusIcon.innerHTML = '<i class="ph ph-warning" style="font-size: 32px;"></i>';
statusTitle.innerText = 'Posisi Belum Cukup Akurat';
statusText.innerText = `Akurasi posisi saat ini ${Math.round(currentAccuracy)} m. Sistem butuh ${maxAccuracy} m atau lebih baik agar presensi bisa diproses.`;
btnCheckin.disabled = true;
btnCheckout.disabled = true;
return false;
}
const effectiveDist = distance !== undefined ? distance : getDistance(schoolLat, schoolLng, latitude, longitude);
const adjustedDistance = Math.max(0, effectiveDist - accuracy);
const isInside = adjustedDistance <= maxRadius && accuracy <= maxAccuracy;
if (isInside) {
statusIcon.style.background = '#D1FAE5'; statusIcon.style.color = '#10B981';
statusIcon.innerHTML = '<i class="ph ph-check-circle" style="font-size: 32px;"></i>';
statusTitle.innerText = "Berada di Area Sekolah";
statusText.innerText = `Jarak efektif: ${Math.round(adjustedDistance)} meter. Akurasi posisi: ${Math.round(accuracy)} m.`;
proofPanel.style.display = 'block';
cameraVideo.style.display = 'block';
proofWrapper.style.display = 'none';
proofStatus.innerText = 'Belum ada foto';
cameraCaptureBtn.innerText = 'Ambil Foto Kamera';
btnCheckin.disabled = false;
btnCheckout.disabled = false;
void startCamera();
if (watchId !== null && navigator.geolocation) {
navigator.geolocation.clearWatch(watchId);
watchId = null;
}
return true;
}
statusIcon.style.background = '#FEF3C7'; statusIcon.style.color = '#F59E0B';
statusIcon.innerHTML = '<i class="ph ph-warning" style="font-size: 32px;"></i>';
statusTitle.innerText = "Posisi Belum Valid";
statusText.innerText = `Jarak Anda sekitar ${Math.round(effectiveDist)} m dari titik presensi dan akurasi posisi ${Math.round(accuracy)} m. Harap berada di area presensi (maksimal ${maxRadius} m).`;
btnCheckin.disabled = true;
btnCheckout.disabled = true;
return false;
};
const onGeoSuccess = (position) => {
const { latitude, longitude, accuracy } = position.coords;
const distance = hasLocalGeofence ? getDistance(schoolLat, schoolLng, latitude, longitude) : 0;
const ok = acceptPosition(latitude, longitude, accuracy, distance);
if (!ok && watchId === null && hasLocalGeofence) {
statusTitle.innerText = "Posisi Belum Valid";
statusText.innerText = `Jarak Anda sekitar ${Math.round(distance)} m dari titik presensi dan akurasi posisi ${Math.round(accuracy)} m. Harap bergerak ke area yang lebih dekat atau tunggu posisi lebih stabil.`;
}
};
const onGeoError = (error) => {
statusIcon.style.background = '#FEE2E2'; statusIcon.style.color = '#EF4444';
statusIcon.innerHTML = '<i class="ph ph-warning-circle" style="font-size: 32px;"></i>';
if (error && error.code === 1) {
statusTitle.innerText = "Akses Posisi Ditolak";
statusText.innerText = "Izin lokasi pada browser belum diaktifkan. Silakan ikuti petunjuk setelan di bawah ini.";
} else if (error && error.code === 2) {
statusTitle.innerText = "Sinyal Lokasi Tidak Ditemukan";
statusText.innerText = "Perangkat tidak dapat menentukan posisi. Pastikan Layanan Lokasi (GPS) pada perangkat aktif.";
} else if (error && error.code === 3) {
statusTitle.innerText = "Waktu Pencarian Lokasi Habis";
statusText.innerText = "Pencarian koordinat memakan waktu terlalu lama. Silakan coba lagi.";
} else {
statusTitle.innerText = "Akses Posisi Bermasalah";
statusText.innerText = "Tidak dapat mengakses posisi lokasi saat ini. Silakan ikuti panduan di bawah.";
}
permissionBox.classList.add('active');
btnCheckin.disabled = true;
btnCheckout.disabled = true;
console.error('Geolocation error:', error);
};
const requestLocationWithFallback = () => {
statusIcon.style.background = '#F3F4F6'; statusIcon.style.color = '#9CA3AF';
statusIcon.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
statusTitle.innerText = "Mencari Lokasi...";
statusText.innerText = "Memverifikasi koordinat GPS perangkat Anda...";
const tryStandard = () => {
navigator.geolocation.getCurrentPosition(
(pos) => {
permissionBox.classList.remove('active');
onGeoSuccess(pos);
startGeolocationWatch();
},
(err) => {
onGeoError(err);
},
{ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
);
};
navigator.geolocation.getCurrentPosition(
(pos) => {
permissionBox.classList.remove('active');
onGeoSuccess(pos);
startGeolocationWatch();
},
(err) => {
if (err.code === 1) {
onGeoError(err);
} else {
tryStandard();
}
},
{ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
);
};
const startGeolocationWatch = () => {
if (!navigator.geolocation) {
statusIcon.style.background = '#FEE2E2'; statusIcon.style.color = '#EF4444';
statusIcon.innerHTML = '<i class="ph ph-warning-circle" style="font-size: 32px;"></i>';
statusTitle.innerText = "Perangkat Tidak Mendukung Posisi";
statusText.innerText = "Perangkat Anda tidak mendukung fitur lokasi GPS.";
permissionBox.classList.remove('active');
return;
}
if (watchId !== null) {
navigator.geolocation.clearWatch(watchId);
watchId = null;
}
watchId = navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, {
enableHighAccuracy: true,
timeout: 15000,
maximumAge: 0
});
};
const reportWaBtn = document.getElementById('btn-report-attendance-wa');
if (reportWaBtn) {
const teacherName = Auth.currentUser?.displayName || Auth.currentUser?.email || 'Guru';
const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const dateStrFormat = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const waText = `Assalamu'alaikum Bu Siti (Staf Personalia MUSADA),\n\nSaya *${teacherName}* ingin mengonfirmasi kehadiran hari ini (*${dateStrFormat}* pukul *${nowStr}* WIB) karena mengalami kendala izin atau deteksi lokasi GPS pada perangkat saya.\n\nMohon bantuan verifikasi presensi. Terima kasih.`;
reportWaBtn.href = `https://wa.me/6285704845822?text=${encodeURIComponent(waText)}`;
}
if (navigator.permissions && navigator.permissions.query) {
navigator.permissions.query({ name: 'geolocation' }).then(perm => {
perm.onchange = () => {
if (perm.state === 'granted') {
permissionBox.classList.remove('active');
startGeolocationWatch();
} else if (perm.state === 'denied') {
onGeoError({ code: 1, message: 'User denied Geolocation' });
}
};
}).catch(() => {});
}
startGeolocationWatch();
const handlePresensi = async (type) => {
if (!currentLocation) return;
const btn = type === 'in' ? btnCheckin : btnCheckout;
if (!capturedProofDataUrl || !capturedProofDataUrl.startsWith('data:image/')) {
alert('Harap ambil foto bukti kehadiran dari kamera sebelum presensi disimpan.');
return;
}
btn.disabled = true;
btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Memproses...';
try {
const compressedProof = await compressImageDataUrl(capturedProofDataUrl, 1600, 0.82);
const isUmmi = AppConfig.isUserUmmi(Auth.userData || Auth.currentUser);
const result = await DB.submitTeacherAttendanceToWorker({
dateStr,
teacherId,
type,
photoDataUrl: compressedProof,
location: currentLocation,
accuracy: currentAccuracy,
isUmmi,
roleGroup: isUmmi ? 'ummi' : 'gtk'
});
const payload = type === 'in'
? { time_in: result.serverTimestamp ? new Date(result.serverTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), location_in: result.location || currentLocation }
: { time_out: result.serverTimestamp ? new Date(result.serverTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), location_out: result.location || currentLocation };
if (result.proof_url) payload.proof_url = result.proof_url;
if (result.record && Object.keys(result.record).length) Object.assign(payload, result.record);
await DB.saveTeacherAttendance(dateStr, teacherId, payload);
alert('Presensi berhasil dicatat.');
capturedProofDataUrl = null;
proofPreview.src = '';
proofWrapper.style.display = 'none';
proofStatus.innerText = 'Belum ada foto';
cameraCaptureBtn.innerText = 'Ambil Foto Kamera';
stopCamera();
await loadHistory();
} catch (err) {
console.error(err);
alert(err && err.message ? err.message : 'Gagal mencatat presensi. Pastikan foto dan lokasi benar, serta endpoint Drive aktif.');
btn.disabled = false;
btn.innerHTML = type === 'in' ? '<i class="ph ph-sign-in"></i> Presensi Datang' : '<i class="ph ph-sign-out"></i> Presensi Pulang';
}
};
btnCheckin.onclick = () => handlePresensi('in');
btnCheckout.onclick = () => handlePresensi('out');
},
async renderStudentAttendance(container) {
Router.setTitle('Absensi Siswa', 'Pilih kelas untuk mengabsen siswa hari ini.');
const classes = await DB.getClasses();
const classArr = DB.toArray(classes).filter(c => c.teacherId === Auth.currentUser.uid);
if (!classArr.length) {
container.innerHTML = `<div class="card"><p class="text-muted">Anda belum ditugaskan sebagai wali kelas.</p></div>`;
return;
}
const cards = classArr.map(c => `
<a href="#/guru/student-attendance/${c.id}" class="card class-card attendance-class-card">
<div>
<h3 class="card-title attendance-class-title">${AppConfig.escapeHtml(c.name)}</h3>
<p class="text-muted attendance-class-subtitle">Input Absensi Kelas</p>
</div>
<i class="ph ph-caret-right attendance-class-caret"></i>
</a>
`).join('');
container.innerHTML = `<div class="card-grid">${cards}</div>`;
},
async renderStudentAttendanceInput(container, classId) {
const classes = await DB.getClasses();
const cls = classes[classId];
if (!cls) {
container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
return;
}
const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
const dateDisplay = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
Router.setTitle(`Absensi ${AppConfig.escapeHtml(cls.name)}`, dateDisplay);
const studentData = await DB.getStudentsByClass(classId);
const studentArr = DB.toArray(studentData).sort((a, b) => a.name.localeCompare(b.name));
if (!studentArr.length) {
container.innerHTML = `<div class="card"><p class="text-muted">Belum ada siswa di kelas ini.</p></div>`;
return;
}
const currentMonth = dateStr.slice(0, 7);
const [attData, monthlyLeaves] = await Promise.all([
DB.getDailyStudentAttendance(dateStr, classId),
DB.getClassMonthlyLeaves(classId, currentMonth)
]);
const todayLeaves = {};
(monthlyLeaves || []).forEach((l) => {
if (l.startDate <= dateStr && (!l.endDate || l.endDate >= dateStr) && l.status !== 'Ditolak') {
todayLeaves[l.studentId] = l;
}
});
const rows = studentArr.map((s, idx) => {
const hasOrtuLeave = todayLeaves[s.id];
const defaultVal = hasOrtuLeave ? (hasOrtuLeave.type === 'Sakit' ? 'S' : 'I') : 'H';
const currentAtt = attData[s.id] || defaultVal;
const leaveBadge = hasOrtuLeave
? `<span class="badge badge-success" style="font-size:11px; margin-left:6px;"><i class="ph ph-envelope-simple"></i> Izin Ortu (${AppConfig.escapeHtml(hasOrtuLeave.type)})</span>`
: '';
return `
<div class="card student-att-row">
<div class="student-att-col">
<p class="student-att-name">${idx + 1}. ${AppConfig.escapeHtml(s.name)}${leaveBadge}</p>
</div>
<div class="att-toggle-group" data-stu="${s.id}">
<button type="button" class="att-btn ${currentAtt === 'H' ? 'active-h' : ''}" data-val="H">H</button>
<button type="button" class="att-btn ${currentAtt === 'S' ? 'active-s' : ''}" data-val="S">S</button>
<button type="button" class="att-btn ${currentAtt === 'I' ? 'active-i' : ''}" data-val="I">I</button>
<button type="button" class="att-btn ${currentAtt === 'A' ? 'active-a' : ''}" data-val="A">A</button>
</div>
</div>
`;
}).join('');
const sakitTotal = (monthlyLeaves || []).filter((l) => l.type === 'Sakit').length;
const izinTotal = (monthlyLeaves || []).filter((l) => l.type !== 'Sakit').length;
const leaveRows = (monthlyLeaves || []).map((l) => {
const st = studentArr.find((x) => x.id === l.studentId);
const proofBtn = l.document
? `<button type="button" class="btn btn-xs btn-outline mk-preview-btn" data-preview-url="${AppConfig.escapeHtml(l.document)}" data-preview-title="Surat Izin ${st ? st.name : ''}"><i class="ph ph-file-text"></i> Bukti</button>`
: '-';
return `<tr>
<td><strong>${st ? AppConfig.escapeHtml(st.name) : l.studentId}</strong></td>
<td>${l.startDate} s/d ${l.endDate || l.startDate}</td>
<td><span class="badge ${l.type === 'Sakit' ? 'badge-danger' : 'badge-warning'}">${AppConfig.escapeHtml(l.type || 'Izin')}</span></td>
<td>${AppConfig.escapeHtml(l.reason || '-')}</td>
<td>${proofBtn}</td>
<td><span class="badge ${l.status === 'Disetujui' ? 'badge-success' : 'badge-warning'}">${AppConfig.escapeHtml(l.status || 'Diajukan')}</span></td>
</tr>`;
}).join('') || '<tr><td colspan="6" class="text-muted">Belum ada pengajuan izin siswa pada bulan ini.</td></tr>';
container.innerHTML = `
<div class="attendance-back-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
<a href="#/guru/student-attendance" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali</a>
<button type="button" id="btn-toggle-leave-recap" class="btn btn-outline btn-sm"><i class="ph ph-calendar"></i> Akumulasi Izin Bulan Ini (${(monthlyLeaves || []).length})</button>
</div>
<section id="section-leave-recap" class="card section-block" style="display:none; margin-top:12px;">
<div class="card-header mk-header">
<h3 class="card-title"><i class="ph ph-first-aid"></i> Akumulasi Perizinan Siswa (Bulan ${currentMonth})</h3>
</div>
<div class="card-body">
<div class="card-grid section-spacer" style="margin-bottom:12px;">
<div class="card stat-card"><div class="stat-icon stat-icon--primary"><i class="ph ph-calendar-x"></i></div><div><p class="stat-value">${(monthlyLeaves || []).length}</p><p class="stat-label text-muted">Total Izin/Sakit</p></div></div>
<div class="card stat-card"><div class="stat-icon stat-icon--danger"><i class="ph ph-first-aid"></i></div><div><p class="stat-value">${sakitTotal}</p><p class="stat-label text-muted">Sakit</p></div></div>
<div class="card stat-card"><div class="stat-icon stat-icon--warning"><i class="ph ph-clock"></i></div><div><p class="stat-value">${izinTotal}</p><p class="stat-label text-muted">Izin Keperluan</p></div></div>
</div>
<div class="table-wrap">
<table class="table">
<thead><tr><th>Nama Siswa</th><th>Rentang Tanggal</th><th>Jenis</th><th>Keterangan</th><th>Bukti Surat</th><th>Status</th></tr></thead>
<tbody>${leaveRows}</tbody>
</table>
</div>
</div>
</section>
<div class="card attendance-info-banner" style="margin-top:12px;">
<p>Siswa yang telah diajukan izin oleh wali murid otomatis terdeteksi. Ketuk inisial untuk mengubah status manual jika diperlukan: <strong>H</strong> (Hadir), <strong>S</strong> (Sakit), <strong>I</strong> (Izin), <strong>A</strong> (Alpa).</p>
</div>
<div id="student-list-container">
${rows}
</div>
<div class="attendance-save-wrapper">
<button id="btn-save-att" class="btn btn-primary btn-save-attendance">
<i class="ph ph-floppy-disk"></i> Simpan Absensi
</button>
</div>
`;
const toggleRecapBtn = document.getElementById('btn-toggle-leave-recap');
const recapSection = document.getElementById('section-leave-recap');
if (toggleRecapBtn && recapSection) {
toggleRecapBtn.onclick = () => {
recapSection.style.display = recapSection.style.display === 'none' ? 'block' : 'none';
};
}
document.getElementById('student-list-container').addEventListener('click', (e) => {
if (e.target.classList.contains('att-btn')) {
const group = e.target.closest('.att-toggle-group');
group.querySelectorAll('.att-btn').forEach(b => {
b.classList.remove('active-h', 'active-s', 'active-i', 'active-a');
});
const val = e.target.dataset.val;
e.target.classList.add(`active-${val.toLowerCase()}`);
}
});
document.getElementById('btn-save-att').onclick = async (e) => {
const btn = e.target;
btn.disabled = true;
btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
const payload = {};
document.querySelectorAll('.att-toggle-group').forEach(group => {
const stuId = group.dataset.stu;
const activeBtn = group.querySelector('.att-btn[class*="active-"]');
if (activeBtn) {
payload[stuId] = activeBtn.dataset.val;
}
});
try {
await DB.saveDailyStudentAttendance(dateStr, classId, payload);
btn.innerHTML = '<i class="ph ph-check"></i> Berhasil Disimpan';
btn.style.background = '#10B981';
btn.style.borderColor = '#10B981';
setTimeout(() => {
btn.disabled = false;
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Absensi';
btn.style.background = '';
btn.style.borderColor = '';
}, 2000);
} catch (err) {
alert('Gagal menyimpan absensi.');
btn.disabled = false;
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Absensi';
}
};
},
async renderTendikDashboard(container) {
Router.setTitle('Beranda Tenaga Kependidikan', 'Selamat datang di Dasbor Digital Tenaga Kependidikan SD Muhammadiyah 1 Sedati.');
const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const user = Auth.currentUser || {};
const uid = user.uid;
const [myAtt, directoryData, perfData] = await Promise.all([
DB.getTeacherAttendance(dateStr, uid),
DB._readCollection ? DB._readCollection('personnel/directory', {}) : Promise.resolve({}),
DB._readCollection ? DB._readCollection('tendik/performance', {}) : Promise.resolve({})
]);
const dirList = DB.toArray(directoryData);
const cleanUserName = (user.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const empProfile = dirList.find(d => d.userId === uid || (d.name && d.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanUserName)) || {};
const nbm = empProfile.nbm || empProfile.nuptk || user.nbm || user.nuptk || user.nip || '-';
const position = empProfile.position || user.position || 'Tenaga Administrasi Sekolah';
let attStatus = 'Belum Presensi';
let attClass = 'badge-warning';
if (myAtt) {
if (myAtt.time_out) {
attStatus = 'Sudah Pulang (' + myAtt.time_out + ')';
attClass = 'badge-success';
} else if (myAtt.time_in) {
attStatus = 'Sudah Datang (' + myAtt.time_in + ')';
attClass = 'badge-success';
}
}
const myPerfList = DB.toArray(perfData).filter(p => p.employeeId === uid || p.userId === uid);
container.innerHTML = `
<div class="card hero-panel">
<div class="hero-panel__inner">
<div>
<p class="hero-panel__meta">${today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<h2 class="hero-panel__time">${timeStr}</h2>
<p class="hero-panel__meta" style="margin-top:6px;"><strong style="font-size:16px;">${AppConfig.escapeHtml(user.name || 'Pegawai Tendik')}</strong> · NBM: ${nbm} · ${AppConfig.escapeHtml(position)}</p>
</div>
<div class="hero-panel__status">
<p class="hero-panel__meta">Status Kehadiran</p>
<span class="badge ${attClass}">${attStatus}</span>
</div>
</div>
</div>
<section class="card-grid section-spacer">
<div class="card stat-card">
<div class="stat-icon stat-icon--success"><i class="ph ph-map-pin"></i></div>
<div><p class="stat-value">${myAtt ? (myAtt.time_in ? '✓' : '—') : '—'}</p><p class="stat-label text-muted">Presensi Datang</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--primary"><i class="ph ph-clipboard-text"></i></div>
<div><p class="stat-value">${myPerfList.length}</p><p class="stat-label text-muted">Laporan Kinerja</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--warning"><i class="ph ph-folder-star"></i></div>
<div><p class="stat-value">Aktif</p><p class="stat-label text-muted">Status Kepegawaian</p></div>
</div>
</section>
<section class="card section-spacer">
<div class="card-header">
<h3 class="card-title"><i class="ph ph-lightning"></i> Menu Utama Tenaga Kependidikan</h3>
</div>
<div class="card-body">
<div class="quick-nav-grid">
<a href="#/attendance" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-map-pin"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Presensi Kehadiran</div>
<div class="quick-nav-desc">Presensi GPS masuk dan pulang harian</div>
</div>
</a>
<a href="#/tendik/performance" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-clipboard-text"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Laporan Kinerja Tendik</div>
<div class="quick-nav-desc">Catatan tupoksi & capaian tugas bulanan</div>
</div>
</a>
<a href="#/tendik/portfolio" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-folder"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Portofolio & Sertifikasi</div>
<div class="quick-nav-desc">Dokumen SK, sertifikat diklat & ijazah</div>
</div>
</a>
<a href="#/gtk/official-travel" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-airplane-takeoff"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Perjalanan Dinas</div>
<div class="quick-nav-desc">Pengajuan & riwayat tugas dinas luar</div>
</div>
</a>
<a href="#/gtk/salary-slip" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Slip Gaji Pribadi</div>
<div class="quick-nav-desc">Rincian penerimaan gaji bulanan & cutoff 29-28</div>
</div>
</a>
</div>
</div>
</section>
`;
},
async renderUmmiDashboard(container) {
Router.setTitle('Beranda Guru UMMI', "Selamat datang di Dasbor Pembelajaran Al-Qur'an & Metode Ummi.");
const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const uid = Auth.currentUser.uid;
const [ummiClasses, myAtt] = await Promise.all([
DB.getUmmiClasses(),
DB.getTeacherAttendance(dateStr, uid)
]);
const classArr = DB.toArray(ummiClasses);
let myClasses = classArr.filter(c => c.teacherId === uid);
if (!myClasses.length) {
const assigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
myClasses = classArr.filter(c => assigns.some(a => a.toLowerCase().includes(c.name.toLowerCase().replace(/[^a-z0-9]/g, ''))));
}
const rombelName = myClasses.map(c => c.name).join(', ') || 'Metode Ummi';
const totalEnrolled = myClasses.reduce((sum, c) => sum + Object.keys(c.students || {}).length, 0);
const teacherName = AppConfig.formatUserName(Auth.userData || Auth.currentUser) || 'Ustadz / Ustadzah';
let attStatus = 'Belum Presensi';
let attClass = 'badge-warning';
if (myAtt) {
if (myAtt.time_out) {
attStatus = 'Sudah Pulang (' + myAtt.time_out + ')';
attClass = 'badge-success';
} else if (myAtt.time_in) {
attStatus = 'Sudah Datang (' + myAtt.time_in + ')';
attClass = 'badge-success';
}
}
const assigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
const isKoord = assigns.includes('KOORD_UMMI');
container.innerHTML = `
<div class="card hero-panel">
<div class="hero-panel__inner">
<div>
<p class="hero-panel__meta">${today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<h2 class="hero-panel__time">${timeStr}</h2>
<p class="hero-panel__meta" style="margin-top:6px;"><strong style="font-size:16px;">${AppConfig.escapeHtml(teacherName)}</strong> · Pengampu ${AppConfig.escapeHtml(rombelName)}</p>
</div>
<div class="hero-panel__status">
<p class="hero-panel__meta">Status Kehadiran</p>
<span class="badge ${attClass}">${attStatus}</span>
</div>
</div>
</div>
<section class="card-grid section-spacer">
<div class="card stat-card">
<div class="stat-icon stat-icon--primary"><i class="ph ph-chalkboard-teacher"></i></div>
<div><p class="stat-value">${myClasses.length}</p><p class="stat-label text-muted">Rombel Diampu</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--success"><i class="ph ph-users-three"></i></div>
<div><p class="stat-value">${totalEnrolled}</p><p class="stat-label text-muted">Santri Binaan</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--danger"><i class="ph ph-calendar-check"></i></div>
<div><p class="stat-value">${myAtt ? (myAtt.time_in || 'Hadir') : 'Belum'}</p><p class="stat-label text-muted">Presensi Datang</p></div>
</div>
</section>
<section class="card section-spacer">
<div class="card-header">
<h3 class="card-title"><i class="ph ph-lightning"></i> Menu Utama Pembelajaran UMMI</h3>
</div>
<div class="card-body">
<div class="quick-nav-grid">
<a href="#/attendance" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-map-pin"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Presensi Kehadiran</div>
<div class="quick-nav-desc">Catat presensi harian guru via GPS sekolah</div>
</div>
</a>
<a href="#/guru/ummi/classes" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-chalkboard-teacher"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Rombel Ummi Saya</div>
<div class="quick-nav-desc">Daftar santri & kelompok jilid yang diampu</div>
</div>
</a>
<a href="#/guru/ummi/progress" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-book-open"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Jurnal Harian Jilid</div>
<div class="quick-nav-desc">Pencatatan halaman & capaian jilid harian</div>
</div>
</a>
<a href="#/guru/ummi/tahfidz" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-book-bookmark"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Setoran Tahfidz</div>
<div class="quick-nav-desc">Simak hafalan surat juz 30 - 1 santri</div>
</div>
</a>
<a href="#/guru/ummi/tasmi" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-headphones"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Ujian Tasmi'</div>
<div class="quick-nav-desc">Pengujian kelulusan tasmi' & munaqosyah</div>
</div>
</a>
<a href="#/curriculum/syllabus" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-upload-simple"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Perangkat & Modul Ummi</div>
<div class="quick-nav-desc">Unggah perangkat & panduan metode Ummi</div>
</div>
</a>
<a href="#/guru/portfolio" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-folder"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Portofolio Guru Ummi</div>
<div class="quick-nav-desc">Dokumentasi syahadah, sertifikat & lisensi</div>
</div>
</a>
<a href="#/gtk/official-travel" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-airplane-takeoff"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Perjalanan Dinas</div>
<div class="quick-nav-desc">Pengajuan & riwayat tugas dinas guru ummi</div>
</div>
</a>
<a href="#/gtk/salary-slip" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Slip Gaji Pribadi</div>
<div class="quick-nav-desc">Rincian honor & tunjangan bulanan santri binaan</div>
</div>
</a>
</div>
</div>
</section>
${isKoord ? `
<section class="card section-spacer">
<div class="card-header">
<h3 class="card-title"><i class="ph ph-crown"></i> Menu Koordinator UMMI</h3>
</div>
<div class="card-body">
<div class="quick-nav-grid">
<a href="#/guru/ummi/koord/mapping" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-users-three"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Pemetaan Rombel & Guru</div>
<div class="quick-nav-desc">Atur pembagian jilid dan ustadz pengampu</div>
</div>
</a>
<a href="#/guru/ummi/koord/exams" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-check-circle"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Antrean Ujian Jilid</div>
<div class="quick-nav-desc">Verifikasi kelayakan munaqosyah santri</div>
</div>
</a>
<a href="#/guru/ummi/koord/tasmi" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-microphone-stage"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Plotting Guru Tasmi'</div>
<div class="quick-nav-desc">Jadwal dan penugasan penguji tasmi'</div>
</div>
</a>
</div>
</div>
</section>
` : ''}
`;
},
async renderEkstraDashboard(container) {
Router.setTitle('Beranda Pembina Ekstrakurikuler', 'Selamat datang di Dasbor Digital Ekstrakurikuler.');
const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const uid = Auth.currentUser.uid;
const [ekskuls, snapAtt] = await Promise.all([
DB.getExtracurriculars(),
db.ref('ekstra/attendance').once('value')
]);
const eksArr = DB.toArray(ekskuls);
let myEks = eksArr.filter(e => e.teacherId === uid);
if (!myEks.length) {
const assigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
myEks = eksArr.filter(e => assigns.some(a => a.toLowerCase().includes(e.name.toLowerCase().replace(/[^a-z0-9]/g, ''))));
}
const eksName = myEks.map(e => e.name).join(', ') || 'Ekstrakurikuler';
const totalEnrolled = myEks.reduce((sum, e) => sum + Object.keys(e.students || {}).length, 0);
const attList = DB.toArray(snapAtt.val() || {}).filter(a => myEks.some(e => e.id === a.ekstraId));
const coachName = Auth.userData?.name || Auth.currentUser?.displayName || 'Pembina';
container.innerHTML = `
<div class="card hero-panel">
<div class="hero-panel__inner">
<div>
<p class="hero-panel__meta">${today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
<h2 class="hero-panel__time">${timeStr}</h2>
<p class="hero-panel__meta" style="margin-top:6px;"><strong style="font-size:16px;">${AppConfig.escapeHtml(coachName)}</strong> · Pembina ${AppConfig.escapeHtml(eksName)}</p>
</div>
<div class="hero-panel__status">
<p class="hero-panel__meta">Model Presensi</p>
<span class="badge badge-primary">Berbasis Pertemuan</span>
</div>
</div>
</div>
<section class="card-grid section-spacer">
<div class="card stat-card">
<div class="stat-icon stat-icon--primary"><i class="ph ph-trophy"></i></div>
<div><p class="stat-value">${myEks.length}</p><p class="stat-label text-muted">Ekskul Diampu</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--success"><i class="ph ph-users-three"></i></div>
<div><p class="stat-value">${totalEnrolled}</p><p class="stat-label text-muted">Peserta Resmi Terdaftar</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--danger"><i class="ph ph-calendar-check"></i></div>
<div><p class="stat-value">${attList.length}</p><p class="stat-label text-muted">Pertemuan Terlaksana</p></div>
</div>
</section>
<section class="card section-spacer">
<div class="card-header">
<h3 class="card-title"><i class="ph ph-lightning"></i> Menu Utama Pembina Ekstrakurikuler</h3>
</div>
<div class="card-body">
<div class="quick-nav-grid">
<a href="#/guru/ekstra/attendance" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-users-three"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Presensi Peserta</div>
<div class="quick-nav-desc">Catat absensi & materi latihan per pertemuan</div>
</div>
</a>
<a href="#/guru/ekstra/syllabus" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-clipboard-text"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Program Latihan</div>
<div class="quick-nav-desc">Susun target capaian materi mingguan</div>
</div>
</a>
<a href="#/curriculum/syllabus" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-upload-simple"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Perangkat & Modul Ajar</div>
<div class="quick-nav-desc">Unggah modul ajar, ATP, prota & promes</div>
</div>
</a>
<a href="#/guru/portfolio" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-folder"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Portofolio Pembina</div>
<div class="quick-nav-desc">Dokumentasi karya, sertifikat & lisensi</div>
</div>
</a>
<a href="#/guru/extracurriculars" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-trophy"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Nilai E-Rapor Ekskul</div>
<div class="quick-nav-desc">Penilaian capaian akhir semester untuk rapor</div>
</div>
</a>
<a href="#/guru/ekstra/talents" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-star"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Pemetaan Bakat Siswa</div>
<div class="quick-nav-desc">Pencatatan potensi & prestasi khusus anak binaan</div>
</div>
</a>
<a href="#/gtk/official-travel" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-airplane-takeoff"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Perjalanan Dinas</div>
<div class="quick-nav-desc">Pengajuan surat tugas & pendampingan lomba</div>
</div>
</a>
<a href="#/gtk/salary-slip" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Slip Gaji Pribadi</div>
<div class="quick-nav-desc">Rincian honor pembina ekskul bulanan</div>
</div>
</a>
</div>
</div>
</section>
<div class="card panel-callout">
<h3 class="card-title info-banner"><i class="ph ph-info"></i> Ketentuan Presensi & Data Peserta</h3>
<p class="text-muted soft-note">Daftar peserta ekstrakurikuler dikelola secara terpusat oleh Waka Kesiswaan. Pembina cukup melakukan absensi per pertemuan saat kegiatan ekskul berlangsung.</p>
</div>
`;
},
async renderEkstraAttendance(container) {
Router.setTitle('Presensi Pertemuan Ekskul', 'Pencatatan kehadiran peserta dan jurnal materi per pertemuan ekstrakurikuler.');
const [ekskuls, users, classes, allStudents, snapAtt] = await Promise.all([
DB.getExtracurriculars(),
DB.getAllUsers(),
DB.getClasses(),
DB.getAllStudents(),
db.ref('ekstra/attendance').once('value')
]);
const eksArr = DB.toArray(ekskuls).sort((a, b) => (a.order || 0) - (b.order || 0));
const uid = Auth.currentUser.uid;
const isSpecialRole = Auth.currentUser.role === AppConfig.ROLES.ADMIN || Auth.currentUser.role === AppConfig.ROLES.STUDENT_AFFAIRS || Auth.currentUser.role === AppConfig.ROLES.KEPSEK;
let coachEkskuls = eksArr.filter(e => e.teacherId === uid);
if (!coachEkskuls.length && isSpecialRole) coachEkskuls = eksArr;
if (!coachEkskuls.length) {
const userAssignments = AppConfig.getRoleAssignments(Auth.currentUser);
const matched = eksArr.filter(e => {
const simpleName = e.name.toLowerCase().replace(/[^a-z0-9]/g, '');
return userAssignments.some(a => a.toLowerCase().includes(simpleName));
});
if (matched.length) coachEkskuls = matched;
}
if (!coachEkskuls.length) {
container.innerHTML = `<div class="card"><p class="text-muted">Anda belum terdaftar sebagai pembina ekstrakurikuler. Hubungi Waka Kesiswaan untuk penugasan pembina.</p></div>`;
return;
}
let activeEksId = coachEkskuls[0].id;
const attObj = snapAtt.val() || {};
const attList = Object.entries(attObj).map(([id, val]) => ({ id, ...val }));
const studentMap = DB.toArray(allStudents).reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
const classMap = DB.toArray(classes).reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
const renderContent = (selectedEksId) => {
activeEksId = selectedEksId;
const currentEks = eksArr.find(x => x.id === activeEksId) || coachEkskuls[0];
const enrolledIds = Object.keys(currentEks.students || {});
const enrolledStudents = enrolledIds.map(id => studentMap[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
const history = attList.filter(a => a.ekstraId === activeEksId).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const eksOptions = coachEkskuls.map(e => `<option value="${e.id}" ${e.id === activeEksId ? 'selected' : ''}>${AppConfig.escapeHtml(e.name)}</option>`).join('');
const rows = history.length ? history.map((item, idx) => {
const pres = item.presentCount ?? (item.records ? Object.values(item.records).filter(r => r === 'Hadir' || r.status === 'Hadir').length : 0);
const tot = item.totalCount ?? (item.records ? Object.keys(item.records).length : enrolledStudents.length);
const pct = tot > 0 ? Math.round((pres / tot) * 100) : 0;
return `
<tr>
<td>${idx + 1}</td>
<td><strong>${item.date || '-'}</strong></td>
<td>${AppConfig.escapeHtml(item.note || 'Latihan Rutin')}</td>
<td><span class="badge badge-success">${pres} / ${tot} Hadir (${pct}%)</span></td>
<td>${AppConfig.escapeHtml(item.teacherName || '-')}</td>
<td class="action-cell">
<button class="btn btn-outline btn-sm" data-view-att="${item.id}" title="Lihat Rekap"><i class="ph ph-eye"></i></button>
<button class="btn btn-danger btn-sm" data-del-att="${item.id}" title="Hapus"><i class="ph ph-trash"></i></button>
</td>
</tr>
`}).join('') : '<tr><td colspan="6" class="text-center text-muted">Belum ada riwayat presensi pertemuan.</td></tr>';
container.innerHTML = `
<div class="card" style="margin-bottom:16px;">
<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:200px;">
<label style="font-weight:600;margin:0;">Ekstrakurikuler:</label>
<select id="sel-active-ekskul" style="min-width:200px;">${eksOptions}</select>
</div>
<button class="btn btn-primary" id="btn-add-session"><i class="ph ph-plus"></i> Tambah Presensi Pertemuan</button>
</div>
</div>
<section class="card-grid" style="margin-bottom:16px;">
<div class="card stat-card">
<div class="stat-icon stat-icon--primary"><i class="ph ph-users-three"></i></div>
<div><p class="stat-value">${enrolledStudents.length}</p><p class="stat-label text-muted">Peserta Resmi Terdaftar</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--success"><i class="ph ph-calendar-check"></i></div>
<div><p class="stat-value">${history.length}</p><p class="stat-label text-muted">Pertemuan Terlaksana</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--warning"><i class="ph ph-clock"></i></div>
<div><p class="stat-value">${currentEks.schedule || '1-2x / Pekan'}</p><p class="stat-label text-muted">Jadwal Pertemuan</p></div>
</div>
</section>
<div class="card">
<div class="card-header"><h3 class="card-title">Riwayat Pertemuan & Presensi</h3></div>
<div class="table-responsive">
<table class="table">
<thead><tr><th style="width:50px">No</th><th style="width:120px">Tanggal</th><th>Catatan Materi Pertemuan</th><th style="width:180px">Kehadiran</th><th>Pembina</th><th style="width:90px">Aksi</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</div>
</div>
${GuruPages._ekstraAttendanceModal(currentEks, enrolledStudents, classMap)}
${GuruPages._ekstraAttendanceDetailModal()}
`;
document.getElementById('sel-active-ekskul').onchange = (e) => renderContent(e.target.value);
document.getElementById('btn-add-session').onclick = () => GuruPages._openEkstraAttendanceModal(currentEks, enrolledStudents, classMap, container, () => renderContent(activeEksId));
container.querySelectorAll('[data-view-att]').forEach(btn => {
btn.onclick = () => {
const item = history.find(h => h.id === btn.dataset.viewAtt);
if (item) GuruPages._openEkstraAttendanceDetailModal(item, studentMap, classMap);
};
});
container.querySelectorAll('[data-del-att]').forEach(btn => {
btn.onclick = async () => {
if (!confirm('Hapus data presensi pertemuan ini?')) return;
await db.ref(`ekstra/attendance/${btn.dataset.delAtt}`).remove();
delete attObj[btn.dataset.delAtt];
renderContent(activeEksId);
};
});
};
renderContent(activeEksId);
},
_ekstraAttendanceModal(currentEks, enrolledStudents, classMap) {
const today = new Date().toISOString().slice(0, 10);
const stuCards = enrolledStudents.length ? enrolledStudents.map(s => {
const className = classMap[s.classId] || s.classId || '-';
const idLabel = AppConfig.formatStudentIdentity(s.nis, s.nisn);
return `
<div class="eks-att-card">
<div class="eks-att-info">
<p class="eks-att-name">${AppConfig.escapeHtml(s.name)}</p>
<p class="eks-att-meta">${AppConfig.escapeHtml(className)} · ${idLabel}</p>
</div>
<div class="att-toggle-group" data-stu="${s.id}">
<button type="button" class="att-btn active-h" data-val="H">H</button>
<button type="button" class="att-btn" data-val="I">I</button>
<button type="button" class="att-btn" data-val="S">S</button>
<button type="button" class="att-btn" data-val="A">A</button>
</div>
</div>
`;
}).join('') : '<div class="alert alert-warning"><p style="margin:0;">Belum ada murid yang didaftarkan pada ekstrakurikuler ini oleh Kesiswaan/Admin.</p></div>';
return `
<div class="modal-overlay" id="modal-add-ekstra-att">
<div class="modal modal-lg">
<div class="modal-header">
<div>
<h3 class="modal-title">Tambah Presensi Pertemuan</h3>
<p class="text-muted class-teaching-note">${AppConfig.escapeHtml(currentEks.name)} · Daftar Peserta Resmi</p>
</div>
<button class="btn-icon" data-close-modal="modal-add-ekstra-att"><i class="ph ph-x"></i></button>
</div>
<form id="form-save-ekstra-att">
<div class="modal-body">
<div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
<div class="form-group" style="flex:1;min-width:180px;margin-bottom:0;">
<label>Tanggal Pertemuan</label>
<input type="date" id="input-att-date" required value="${today}">
</div>
<div class="form-group" style="flex:2;min-width:240px;margin-bottom:0;">
<label>Materi / Catatan Latihan</label>
<input type="text" id="input-att-note" required placeholder="Contoh: Pengenalan teknik dasar, fisik, atau materi pertemuan...">
</div>
</div>
<div class="eks-att-summary-bar">
<span id="summary-att-counts">Hadir: ${enrolledStudents.length} | Izin: 0 | Sakit: 0 | Alpa: 0</span>
<button type="button" class="btn btn-outline btn-sm" id="btn-att-all-hadir" style="margin-left:auto;"><i class="ph ph-check-circle"></i> Semua Hadir</button>
</div>
<div style="max-height:380px;overflow-y:auto;padding-right:4px;">
${stuCards}
</div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-add-ekstra-att">Batal</button>
<button type="submit" class="btn btn-primary" id="btn-submit-ekstra-att" ${enrolledStudents.length ? '' : 'disabled'}><i class="ph ph-floppy-disk"></i> Simpan Presensi</button>
</div>
</form>
</div>
</div>`;
},
_openEkstraAttendanceModal(currentEks, enrolledStudents, classMap, container, onSaved) {
const modal = document.getElementById('modal-add-ekstra-att');
if (!modal) return;
const updateSummary = () => {
let h = 0, i = 0, s = 0, a = 0;
modal.querySelectorAll('.att-toggle-group').forEach(group => {
const activeBtn = group.querySelector('.att-btn[class*="active-"]');
const val = activeBtn ? activeBtn.dataset.val : 'H';
if (val === 'H') h++;
else if (val === 'I') i++;
else if (val === 'S') s++;
else if (val === 'A') a++;
});
const el = document.getElementById('summary-att-counts');
if (el) el.innerText = `Hadir: ${h} | Izin: ${i} | Sakit: ${s} | Alpa: ${a}`;
};
modal.querySelectorAll('.att-toggle-group').forEach(group => {
group.onclick = (ev) => {
if (ev.target.classList.contains('att-btn')) {
group.querySelectorAll('.att-btn').forEach(b => b.classList.remove('active-h', 'active-s', 'active-i', 'active-a'));
const val = ev.target.dataset.val;
ev.target.classList.add(`active-${val.toLowerCase()}`);
updateSummary();
}
};
});
const btnAll = document.getElementById('btn-att-all-hadir');
if (btnAll) {
btnAll.onclick = () => {
modal.querySelectorAll('.att-toggle-group').forEach(group => {
group.querySelectorAll('.att-btn').forEach(b => b.classList.remove('active-h', 'active-s', 'active-i', 'active-a'));
const hBtn = group.querySelector('.att-btn[data-val="H"]');
if (hBtn) hBtn.classList.add('active-h');
});
updateSummary();
};
}
const form = document.getElementById('form-save-ekstra-att');
form.onsubmit = async (e) => {
e.preventDefault();
const btn = document.getElementById('btn-submit-ekstra-att');
btn.disabled = true;
btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
const dateVal = document.getElementById('input-att-date').value;
const noteVal = document.getElementById('input-att-note').value.trim();
const records = {};
let presentCount = 0;
modal.querySelectorAll('.att-toggle-group').forEach(group => {
const sid = group.dataset.stu;
const student = enrolledStudents.find(x => x.id === sid);
const activeBtn = group.querySelector('.att-btn[class*="active-"]');
const statusVal = activeBtn ? activeBtn.dataset.val : 'H';
const statusLabel = statusVal === 'H' ? 'Hadir' : (statusVal === 'I' ? 'Izin' : (statusVal === 'S' ? 'Sakit' : 'Alpa'));
if (statusLabel === 'Hadir') presentCount++;
records[sid] = {
status: statusLabel,
name: student ? student.name : sid,
class: student ? (classMap[student.classId] || student.classId || '-') : '-'
};
});
const newRef = db.ref('ekstra/attendance').push();
await newRef.set({
date: dateVal,
ekstraId: currentEks.id,
ekstraName: currentEks.name,
teacherId: Auth.currentUser.uid,
teacherName: Auth.currentUser.name || Auth.currentUser.displayName || 'Pembina',
note: noteVal,
records: records,
presentCount: presentCount,
totalCount: enrolledStudents.length,
createdAt: firebase.database.ServerValue.TIMESTAMP
});
btn.disabled = false;
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Presensi';
App.closeModal('modal-add-ekstra-att');
if (onSaved) onSaved();
};
updateSummary();
modal.classList.add('active');
},
_ekstraAttendanceDetailModal() {
return `
<div class="modal-overlay" id="modal-eks-att-detail">
<div class="modal modal-lg">
<div class="modal-header">
<div>
<h3 class="modal-title" id="det-att-title">Detail Presensi Pertemuan</h3>
<p class="text-muted class-teaching-note" id="det-att-sub"></p>
</div>
<button class="btn-icon" data-close-modal="modal-eks-att-detail"><i class="ph ph-x"></i></button>
</div>
<div class="modal-body">
<div style="background:#f8fafc;padding:12px;border-radius:8px;border:1px solid var(--border-color);margin-bottom:14px;">
<p style="margin:0 0 4px 0;"><strong>Catatan / Materi:</strong> <span id="det-att-note"></span></p>
<p style="margin:0;"><strong>Kehadiran:</strong> <span id="det-att-summary"></span></p>
</div>
<div style="max-height:360px;overflow-y:auto;">
<table class="eks-detail-table">
<thead><tr><th style="width:50px">No</th><th>Nama Murid</th><th>Kelas</th><th style="width:110px">Status</th></tr></thead>
<tbody id="det-att-tbody"></tbody>
</table>
</div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-primary" data-close-modal="modal-eks-att-detail">Tutup</button>
</div>
</div>
</div>`;
},
_openEkstraAttendanceDetailModal(item, studentMap, classMap) {
document.getElementById('det-att-title').innerText = `Presensi: ${item.ekstraName || 'Ekstrakurikuler'}`;
document.getElementById('det-att-sub').innerText = `Tanggal: ${item.date || '-'} · Pembina: ${item.teacherName || '-'}`;
document.getElementById('det-att-note').innerText = item.note || 'Latihan Rutin';
const recs = item.records || {};
const recEntries = Object.entries(recs);
let h = 0, i = 0, s = 0, a = 0;
const rows = recEntries.map(([sid, rec], idx) => {
const status = typeof rec === 'string' ? rec : (rec.status || 'Hadir');
if (status === 'Hadir') h++;
else if (status === 'Izin') i++;
else if (status === 'Sakit') s++;
else a++;
const stu = studentMap[sid] || {};
const name = rec.name || stu.name || sid;
const cName = rec.class || classMap[stu.classId] || stu.classId || '-';
const badgeCls = status === 'Hadir' ? 'badge-success' : (status === 'Izin' ? 'badge-warning' : (status === 'Sakit' ? 'badge-primary' : 'badge-danger'));
return `
<tr>
<td>${idx + 1}</td>
<td><strong>${AppConfig.escapeHtml(name)}</strong></td>
<td>${AppConfig.escapeHtml(cName)}</td>
<td><span class="badge ${badgeCls}">${status}</span></td>
</tr>
`;
}).join('');
document.getElementById('det-att-summary').innerText = `Hadir: ${h} | Izin: ${i} | Sakit: ${s} | Alpa: ${a} (Total ${recEntries.length} Murid)`;
document.getElementById('det-att-tbody').innerHTML = rows || '<tr><td colspan="4" class="text-center text-muted">Tidak ada rincian data.</td></tr>';
document.getElementById('modal-eks-att-detail').classList.add('active');
},
async renderEkstraGrades(container) {
Router.setTitle('Nilai E-Rapor Ekstrakurikuler', 'Input nilai akhir dan deskripsi capaian ekstrakurikuler peserta binaan.');
const uid = Auth.currentUser.uid;
const [ekskuls, allStudents, settings] = await Promise.all([
DB.getExtracurriculars(),
DB.getAllStudents(),
DB.getSettings()
]);
const eksArr = DB.toArray(ekskuls);
let myEks = eksArr.filter(e => e.teacherId === uid);
if (!myEks.length) {
const assigns = AppConfig.getRoleAssignments(Auth.currentUser);
myEks = eksArr.filter(e => assigns.some(a => a.toLowerCase().includes(e.name.toLowerCase().replace(/[^a-z0-9]/g, ''))));
}
if (!myEks.length) {
container.innerHTML = `<div class="card"><p class="text-muted">Anda belum memiliki ekstrakurikuler binaan untuk dinilai.</p></div>`;
return;
}
const year = settings.currentAcademicYear || '2026/2027';
const sem = settings.currentSemester || '1';
let activeEks = myEks[0];
const studentMap = DB.toArray(allStudents).reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
let viewContainer = container.querySelector('#ekskul-grades-view');
if (!viewContainer) {
const guideBanner = container.querySelector('#feature-guide-banner');
container.innerHTML = '';
if (guideBanner) {
container.appendChild(guideBanner);
}
viewContainer = document.createElement('div');
viewContainer.id = 'ekskul-grades-view';
container.appendChild(viewContainer);
}
const renderGradeForm = async (selectedId) => {
activeEks = myEks.find(e => e.id === selectedId) || myEks[0];
const enrolledIds = Object.keys(activeEks.students || {});
const enrolledStudents = enrolledIds.map(id => studentMap[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
const eksOpts = myEks.map(e => `<option value="${e.id}" ${e.id === activeEks.id ? 'selected' : ''}>${AppConfig.escapeHtml(e.name)}</option>`).join('');
if (!enrolledStudents.length) {
viewContainer.innerHTML = `
<div class="card" style="margin-bottom:16px;">
<div style="display:flex;gap:12px;align-items:center;">
<label style="font-weight:600;margin:0;">Ekstrakurikuler:</label>
<select id="sel-grade-eks">${eksOpts}</select>
</div>
</div>
<div class="card"><p class="text-muted">Belum ada murid yang didaftarkan pada ekstrakurikuler ini oleh Kesiswaan/Admin.</p></div>
`;
document.getElementById('sel-grade-eks').onchange = (e) => renderGradeForm(e.target.value);
if (typeof FeatureGuides !== 'undefined') {
FeatureGuides.attach(container, '#/guru/extracurriculars');
}
return;
}
viewContainer.innerHTML = `<div class="loader" style="margin:40px auto;"></div>`;
const gradesData = {};
await Promise.all(enrolledStudents.map(async (s) => {
const dt = await DB.getStudentExtracurriculars(year, sem, s.id);
gradesData[s.id] = dt[activeEks.id] || { score: '', description: '' };
}));
const rows = enrolledStudents.map((s, idx) => {
const g = gradesData[s.id] || { score: '', description: '' };
return `
<div class="card" style="margin-bottom:12px;padding:14px;">
<h4 style="margin:0 0 10px 0;font-size:15px;">${idx + 1}. ${AppConfig.escapeHtml(s.name)}</h4>
<div style="display:flex;gap:14px;flex-wrap:wrap;">
<div class="form-group" style="flex:0 0 140px;margin-bottom:0;">
<label>Nilai (Predikat)</label>
<select class="eks-input-score" data-sid="${s.id}">
<option value="">— Belum Dinilai —</option>
<option value="A" ${g.score === 'A' ? 'selected' : ''}>A (Sangat Baik)</option>
<option value="B" ${g.score === 'B' ? 'selected' : ''}>B (Baik)</option>
<option value="C" ${g.score === 'C' ? 'selected' : ''}>C (Cukup)</option>
<option value="D" ${g.score === 'D' ? 'selected' : ''}>D (Kurang)</option>
</select>
</div>
<div class="form-group" style="flex:1;min-width:220px;margin-bottom:0;">
<label>Deskripsi Capaian Rapor</label>
<input type="text" class="eks-input-desc" data-sid="${s.id}" value="${AppConfig.escapeHtml(g.description || '')}" placeholder="Contoh: Sangat aktif dan menguasai materi dengan sangat baik.">
</div>
</div>
</div>
`}).join('');
container.innerHTML = `
<div class="card" style="margin-bottom:16px;">
<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
<div style="display:flex;gap:12px;align-items:center;">
<label style="font-weight:600;margin:0;">Ekstrakurikuler:</label>
<select id="sel-grade-eks">${eksOpts}</select>
</div>
<span class="badge badge-primary">Tahun Ajaran ${year} (Sem. ${sem})</span>
</div>
</div>
<form id="form-save-all-grades">
${rows}
<div style="position:sticky;bottom:16px;margin-top:20px;z-index:100;">
<button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><i class="ph ph-floppy-disk"></i> Simpan Semua Nilai E-Rapor Ekskul</button>
</div>
</form>
`;
document.getElementById('sel-grade-eks').onchange = (e) => renderGradeForm(e.target.value);
document.getElementById('form-save-all-grades').onsubmit = async (ev) => {
ev.preventDefault();
const btn = ev.target.querySelector('button[type="submit"]');
btn.disabled = true;
btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan Nilai...';
const scores = document.querySelectorAll('.eks-input-score');
const descs = document.querySelectorAll('.eks-input-desc');
for (let i = 0; i < scores.length; i++) {
const sid = scores[i].dataset.sid;
const score = scores[i].value;
const description = descs[i].value.trim();
if (score || description) {
await DB.saveStudentExtracurricular(year, sem, sid, activeEks.id, { score, description, updatedBy: uid });
} else {
await DB.deleteStudentExtracurricular(year, sem, sid, activeEks.id);
}
}
btn.disabled = false;
btn.innerHTML = '<i class="ph ph-check"></i> Tersimpan Berhasil!';
setTimeout(() => {
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Semua Nilai E-Rapor Ekskul';
}, 2000);
};
if (typeof FeatureGuides !== 'undefined') {
FeatureGuides.attach(container, '#/guru/extracurriculars');
}
};
await renderGradeForm(activeEks.id);
if (typeof FeatureGuides !== 'undefined') {
FeatureGuides.attach(container, '#/guru/extracurriculars');
}
}
,
async renderSalarySlip(container) {
Router.setTitle('Slip Gaji Pribadi', 'Rincian gaji dan rekap tunjangan bulanan resmi GTK.');
const user = Auth.userData || Auth.currentUser || {};
const uid = (Auth.currentUser && Auth.currentUser.uid) || user.uid;
const today = new Date();
const cutoff = AppConfig.getPayrollCutoffRange ? AppConfig.getPayrollCutoffRange(today) : {
startStr: '2026-09-29', endStr: '2026-10-28', monthLabel: 'Oktober 2026', cutoffLabel: '29 Sep 2026 s/d 28 Okt 2026', sD: new Date(2026, 8, 29), eD: new Date(2026, 9, 28)
};
const [directoryData, salariesData, rangeAttData, settings, ummiClassesData] = await Promise.all([
DB._readCollection ? DB._readCollection('personnel/directory', {}) : Promise.resolve({}),
DB._readCollection ? DB._readCollection('finance/salaries', {}) : Promise.resolve({}),
DB.getTeacherAttendanceRange(cutoff.startStr, cutoff.endStr),
DB.getSettings(),
DB._readCollection ? DB._readCollection('ummi_classes', {}) : Promise.resolve({})
]);
const dirList = DB.toArray(directoryData);
const cleanUserName = (user.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const empProfile = dirList.find(d => d.userId === uid || (d.name && d.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanUserName)) || {};
const salaryList = DB.toArray(salariesData);
const matchedSalary = salaryList.find(s => (s.employeeId === uid || (empProfile.id && s.employeeId === empProfile.id)) && (!s.month || s.month === cutoff.startStr.slice(0, 7) || s.month === cutoff.endStr.slice(0, 7))) || null;
let onTimeCount = 0, lateCount = 0;
const isUmmi = AppConfig.isUserUmmi(user);
Object.entries(rangeAttData || {}).forEach(([dk, byTeacher]) => {
const att = byTeacher && byTeacher[uid];
if (att && att.time_in) {
const sched = AppConfig.getAttendanceSchedule ? AppConfig.getAttendanceSchedule(settings.attendanceRules, isUmmi, dk) : null;
const isLate = sched && AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(att.time_in, sched) : false;
if (isLate) lateCount++;
else onTimeCount++;
}
});
const totalPresent = onTimeCount + lateCount;
let totalWorkDays = 0;
const cur = new Date(cutoff.sD);
while (cur <= cutoff.eD) {
if (cur.getDay() !== 0) totalWorkDays++;
cur.setDate(cur.getDate() + 1);
}
const ummiList = DB.toArray(ummiClassesData);
const myUmmiRombel = ummiList.filter(c => c.teacherId === uid || (c.teacherName && cleanUserName && c.teacherName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanUserName)));
const slip = AppConfig.resolveSalarySlipData(user, empProfile, matchedSalary, {
totalPresent, onTimeCount, lateCount, totalWorkDays
}, {
ummiClassesCount: myUmmiRombel.length || 3
});
container.innerHTML = `
<div class="salary-slip-actions">
<button class="btn btn-outline" id="btn-print-slip"><i class="ph ph-printer"></i> Cetak Slip Gaji</button>
</div>
<div class="salary-slip-sheet">
<div class="salary-slip-notice">
<i class="ph ph-info"></i> <strong>Informasi Penggajian:</strong> ${AppConfig.escapeHtml(slip.noticeText)}
</div>
<div class="salary-slip-brand">
<img src="assets/img/majlis-dikdaspnf.webp" alt="Logo Majelis Dikdasmen PNF" class="salary-slip-logo salary-slip-logo-dikdas" onerror="this.src='../../assets/img/link-terkait/majlis-dikdaspnf.webp'">
<div class="salary-slip-brand-text">
<div class="salary-slip-org">MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL</div>
<div class="salary-slip-pcm">PIMPINAN CABANG MUHAMMADIYAH SEDATI</div>
<h2 class="salary-slip-title">SD MUHAMMADIYAH 1 SEDATI</h2>
<p class="salary-slip-meta">Jl. H. Syukur No. 65, Sedati Gede, Kec. Sedati, Sidoarjo 61253 | Telp/WA: 0859-6439-9398</p>
<p class="salary-slip-meta">Website: musada.sch.id | Email: sdmusada16@gmail.com</p>
</div>
<img src="assets/img/logo.webp" alt="Logo SD Muhammadiyah 1 Sedati" class="salary-slip-logo salary-slip-logo-school" onerror="this.src='../../assets/img/logo/logo.webp'">
</div>
<div class="salary-slip-doc-header">
<h3 class="salary-slip-doc-title">SURAT BUKTI RINCIAN HONORARIUM & GAJI PEGAWAI</h3>
<p class="salary-slip-doc-sub">Periode: <strong>${cutoff.monthLabel}</strong> (${cutoff.cutoffLabel})</p>
</div>
<div class="salary-slip-info">
<div class="salary-slip-info-row"><span class="salary-slip-label">Nama Pegawai</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${AppConfig.escapeHtml(slip.name)}</span></div>
<div class="salary-slip-info-row"><span class="salary-slip-label">NBM / NUPTK</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${AppConfig.escapeHtml(slip.nbm)}</span></div>
<div class="salary-slip-info-row"><span class="salary-slip-label">Jabatan / Tugas</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${AppConfig.escapeHtml(slip.position)}</span></div>
<div class="salary-slip-info-row"><span class="salary-slip-label">Status Kepegawaian</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${AppConfig.escapeHtml(slip.empStatus)}</span></div>
<div class="salary-slip-info-row"><span class="salary-slip-label">Kehadiran (Cutoff)</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${slip.totalPresent} / ${slip.totalWorkDays} Hari (${slip.onTimeCount} Tepat, ${slip.lateCount} Terlambat)</span></div>
<div class="salary-slip-info-row"><span class="salary-slip-label">Status Pencairan</span><span class="salary-slip-sep">:</span><span class="salary-slip-val"><span class="badge ${slip.badgeClass}">${AppConfig.escapeHtml(slip.statusText)}</span></span></div>
</div>
<table class="salary-slip-table">
<thead>
<tr>
<th>Rincian Penghasilan & Tunjangan</th>
<th class="text-right">Nominal (Rp)</th>
</tr>
</thead>
<tbody>
<tr>
<td>${AppConfig.escapeHtml(slip.basicLabel)}</td>
<td class="text-right">Rp ${slip.basicSalary.toLocaleString('id-ID')}</td>
</tr>
<tr>
<td>${AppConfig.escapeHtml(slip.functionalLabel)}</td>
<td class="text-right">Rp ${slip.functionalAllowance.toLocaleString('id-ID')}</td>
</tr>
<tr>
<td>${AppConfig.escapeHtml(slip.teachingLabel)}</td>
<td class="text-right">Rp ${slip.teachingAllowance.toLocaleString('id-ID')}</td>
</tr>
<tr>
<td><strong>Total Penghasilan Kotor</strong></td>
<td class="text-right"><strong>Rp ${slip.grossSalary.toLocaleString('id-ID')}</strong></td>
</tr>
</tbody>
</table>
<table class="salary-slip-table">
<thead>
<tr>
<th>Rincian Potongan</th>
<th class="text-right">Nominal (Rp)</th>
</tr>
</thead>
<tbody>
<tr>
<td>${AppConfig.escapeHtml(slip.deductionLabel)}</td>
<td class="text-right">Rp ${slip.deductions.toLocaleString('id-ID')}</td>
</tr>
<tr class="salary-slip-total-row">
<td><strong>TOTAL GAJI BERSIH (TAKE HOME PAY)</strong></td>
<td class="text-right"><strong>Rp ${slip.netSalary.toLocaleString('id-ID')}</strong></td>
</tr>
</tbody>
</table>
<div class="salary-slip-signatures">
<div class="salary-slip-sig-box">
<span>Penerima,</span>
<div class="salary-slip-sig-space"></div>
<strong>${AppConfig.escapeHtml(slip.name)}</strong>
<br><small class="text-muted">NBM: ${AppConfig.escapeHtml(slip.nbm)}</small>
</div>
<div class="salary-slip-sig-box">
<span>Sedati, 28 ${cutoff.monthLabel}<br>Waka Keuangan / Bendahara</span>
<div class="salary-slip-sig-space"></div>
<strong>Bendahara Keuangan</strong>
<br><small class="text-muted">SD Muhammadiyah 1 Sedati</small>
</div>
</div>
</div>
`;
const btnPrint = document.getElementById('btn-print-slip');
if (btnPrint) {
btnPrint.onclick = () => window.print();
}
}
};
