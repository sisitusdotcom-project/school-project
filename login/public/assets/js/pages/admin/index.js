const AdminPages = {
async renderDashboard(container) {
Router.setTitle('Dashboard admin', 'Ringkasan data dan pengaturan sistem.');
const [settings, users, classes, chars, students] = await Promise.all([
DB.getSettings(),
DB.getAllUsers(),
DB.getClasses(),
DB.getCharacters(),
DB.getAllStudents()
]);
const attendanceRules = settings.attendanceRules || {};
const userArr = DB.toArray(users);
const classArr = DB.toArray(classes);
const charArr = DB.toArray(chars);
const studentArr = DB.toArray(students);
const guruCount = userArr.filter(u => AppConfig.isTeacher(u)).length;
const ortuCount = userArr.filter(u => u.role === AppConfig.ROLES.ORTU).length;
const summaryCards = [
{ label: 'Pengguna aktif', value: userArr.length, tone: 'primary', icon: 'ph-users' },
{ label: 'Guru', value: guruCount, tone: 'success', icon: 'ph-chalkboard-teacher' },
{ label: 'Kelas', value: classArr.length, tone: 'warning', icon: 'ph-books' },
{ label: 'Siswa', value: studentArr.length, tone: 'danger', icon: 'ph-student' }
];
container.innerHTML = `
<section class="card-grid section-spacer">
${summaryCards.map((item) => `
<div class="card stat-card">
<div class="stat-icon stat-icon--${item.tone}"><i class="ph ${item.icon}"></i></div>
<div><p class="stat-value">${item.value}</p><p class="stat-label text-muted">${item.label}</p></div>
</div>
`).join('')}
</section>
<section class="card section-spacer">
<div class="card-header">
<h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Operasional Administrator Sistem</h3>
</div>
<div class="card-body">
<div class="quick-nav-grid">
<a href="#/admin/users" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-users-three"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Kelola Pengguna</div>
<div class="quick-nav-desc">Akun login, reset sandi & peran</div>
</div>
</a>
<a href="#/admin/assignments" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-tree-structure"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Distribusi Penugasan</div>
<div class="quick-nav-desc">Plotting Waka, Staf & Tim Unit</div>
</div>
</a>
<a href="#/attendance" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-map-pin"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Presensi Kehadiran</div>
<div class="quick-nav-desc">Presensi GPS mandiri staf/admin</div>
</div>
</a>
<a href="#/admin/attendance" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-clock-user"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Pantau Disiplin Guru</div>
<div class="quick-nav-desc">Monitoring presensi harian GTK</div>
</div>
</a>
<a href="#/admin/classes" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-chalkboard"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Pembagian Rombel</div>
<div class="quick-nav-desc">Daftar kelas & penugasan wali</div>
</div>
</a>
<a href="#/admin/subjects" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-book-open"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Pemetaan Mapel & Guru</div>
<div class="quick-nav-desc">Distribusi guru pengampu mapel</div>
</div>
</a>
<a href="#/admin/characters" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-star"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Indikator Karakter</div>
<div class="quick-nav-desc">Rubrik adab & sikap murid</div>
</div>
</a>
<a href="#/it-admin/backup" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-cloud-arrow-down"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Backup & Restore</div>
<div class="quick-nav-desc">Pencadangan data sekolah</div>
</div>
</a>
</div>
</div>
</section>
<section class="card section-spacer">
<div class="card-header">
<h3 class="card-title">Konfigurasi sekolah (SSOT)</h3>
<a href="#/curriculum" class="btn btn-outline btn-sm"><i class="ph ph-calendar"></i> Pengaturan di Kurikulum</a>
</div>
<ul class="list-plain">
<li>Tahun ajaran: <strong>${settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear}</strong></li>
<li>Semester aktif: <strong>${settings.currentSemester || AppConfig.DEFAULT_SETTINGS.currentSemester}</strong></li>
<li>Indikator karakter aktif: <strong>${charArr.filter(c => c.active !== false).length}</strong></li>
<li>Orang tua terdaftar: <strong>${ortuCount}</strong></li>
</ul>
</section>
`;
},
async renderCharacters(container) {
Router.setTitle('Indikator karakter', 'Aspek karakter yang dinilai guru.');
const chars = await DB.getCharacters();
const charArr = DB.toArray(chars).sort((a, b) => (a.order || 0) - (b.order || 0));
const rows = charArr.length ? charArr.map(c => `
<tr>
<td>${c.order || '-'}</td>
<td><strong>${AppConfig.escapeHtml(c.name)}</strong></td>
<td><span class="badge ${c.active !== false ? 'badge-success' : 'badge-danger'}">${c.active !== false ? 'Aktif' : 'Nonaktif'}</span></td>
<td class="action-cell">
<button class="btn btn-outline btn-sm" data-edit-char="${c.id}"><i class="ph ph-pencil-simple"></i></button>
<button class="btn btn-danger btn-sm" data-del-char="${c.id}"><i class="ph ph-trash"></i></button>
</td>
</tr>
`).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada indikator. Klik "Tambah" untuk memulai.</td></tr>';
container.innerHTML = `
<div class="card">
<div class="card-header">
<h3 class="card-title">Daftar aspek karakter</h3>
<button class="btn btn-primary" id="btn-add-char"><i class="ph ph-plus"></i> Tambah</button>
</div>
<div class="table-responsive">
<table class="table"><thead><tr><th class="table-col-sm">No</th><th>Nama</th><th>Status</th><th class="table-col-md">Aksi</th></tr></thead>
<tbody>${rows}</tbody></table>
</div>
</div>
${AdminPages._charModal()}
`;
document.getElementById('btn-add-char').onclick = () => AdminPages._openCharModal(null, charArr.length + 1);
container.querySelectorAll('[data-edit-char]').forEach(btn => {
btn.onclick = () => {
const c = charArr.find(x => x.id === btn.dataset.editChar);
if (c) AdminPages._openCharModal(c);
};
});
container.querySelectorAll('[data-del-char]').forEach(btn => {
btn.onclick = async () => {
if (!confirm('Yakin hapus indikator ini?')) return;
await DB.deleteCharacter(btn.dataset.delChar);
AdminPages.renderCharacters(container);
};
});
document.getElementById('form-char').onsubmit = async (e) => {
e.preventDefault();
const id = document.getElementById('char-id').value || null;
await DB.saveCharacter(id, {
name: document.getElementById('char-name').value.trim(),
order: parseInt(document.getElementById('char-order').value) || 1,
active: document.getElementById('char-active').value === 'true'
});
App.closeModal('modal-char');
AdminPages.renderCharacters(container);
};
},
_charModal() {
return `
<div class="modal-overlay" id="modal-char">
<div class="modal">
<div class="modal-header">
<h3 class="modal-title" id="char-modal-title">Tambah indikator</h3>
<button class="btn-icon" data-close-modal="modal-char"><i class="ph ph-x"></i></button>
</div>
<form id="form-char">
<div class="modal-body">
<input type="hidden" id="char-id">
<div class="form-group">
<label>Nama karakter</label>
<input id="char-name" required placeholder="Contoh: Disiplin">
</div>
<div class="form-group">
<label>Urutan tampil</label>
<input id="char-order" type="number" min="1" value="1">
</div>
<div class="form-group">
<label>Status</label>
<select id="char-active"><option value="true">Aktif</option><option value="false">Nonaktif</option></select>
</div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-char">Batal</button>
<button type="submit" class="btn btn-primary">Simpan</button>
</div>
</form>
</div>
</div>`;
},
_openCharModal(existing, nextOrder) {
document.getElementById('char-modal-title').innerText = existing ? 'Edit indikator' : 'Tambah indikator';
document.getElementById('char-id').value = existing ? existing.id : '';
document.getElementById('char-name').value = existing ? existing.name : '';
document.getElementById('char-order').value = existing ? existing.order : (nextOrder || 1);
document.getElementById('char-active').value = existing ? String(existing.active !== false) : 'true';
App.openModal('modal-char');
},
async renderUsers(container) {
Router.setTitle('Kelola Pengguna', 'Tambah, edit, dan atur peran pengguna sistem.');
const [users, classes, subjects] = await Promise.all([
DB.getAllUsers(),
DB.getClasses(),
DB.getSubjects()
]);
let userArr = DB.toArray(users);
const renderTable = () => {
const q = (document.getElementById('search-user')?.value || '').toLowerCase();
const roleFilter = document.getElementById('filter-role')?.value || '';
const filtered = userArr.filter(u => {
const matchSearch = (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
const matchRole = AppConfig.isUserInRole(u, roleFilter);
return matchSearch && matchRole;
});
const rows = filtered.length ? filtered.map(u => {
const teachingLabels = DB.buildTeachingLabels(u.id, classes, subjects);
const teachingText = teachingLabels.map(label => AppConfig.escapeHtml(label)).join(', ');
const isLongTeaching = teachingText.length > 36;
const teachingHtml = teachingLabels.length ? (isLongTeaching ? `
<div class="user-teaching-marquee-box" title="${teachingText}">
<div class="user-teaching-marquee-track">
<span class="user-teaching-marquee-item"><i class="ph ph-book-open"></i> ${teachingText} &nbsp;&bull;&nbsp;&nbsp;</span>
<span class="user-teaching-marquee-item"><i class="ph ph-book-open"></i> ${teachingText} &nbsp;&bull;&nbsp;&nbsp;</span>
</div>
</div>` : `
<div class="user-teaching-static-box" title="${teachingText}">
<i class="ph ph-book-open"></i> ${teachingText}
</div>`) : '';
return `
<tr>
<td class="user-cell">
<strong>${AppConfig.escapeHtml(u.name)}</strong><br>
<small class="text-muted">
Email: ${u.email || '-'}<br>
<span class="user-id-subtext">Default: ${u.id.toLowerCase().replace(/[^a-z0-9]/g, '')}@musada.sch.id</span>
</small>
${teachingHtml}
</td>
<td>
<div class="user-badges-container">
<span class="badge ${AppConfig.getRoleBadgeClass(u.role)}">${AppConfig.PRIMARY_ROLES[u.role] || u.role}</span>
${AppConfig.getRoleAssignments(u).map((item) => {
const label = AppConfig.UNIT_LABELS[item] || (item.startsWith('GURU_KELAS_') ? ('Wali Kelas ' + item.replace('GURU_KELAS_', '').replace(/_/g, ' ')) : item);
const badgeClass = AppConfig.getAssignmentBadgeClass ? AppConfig.getAssignmentBadgeClass(item) : 'badge-outline';
return `<span class="badge ${badgeClass}">${AppConfig.escapeHtml(label)}</span>`;
}).join('')}
</div>
</td>
<td class="action-cell">
<button class="btn btn-outline btn-sm" data-edit-usr="${u.id}"><i class="ph ph-pencil-simple"></i></button>
<button class="btn btn-danger btn-sm" data-del-usr="${u.id}"><i class="ph ph-trash"></i></button>
</td>
</tr>
`;
}).join('') : '<tr><td colspan="4" class="text-center text-muted">Tidak ada pengguna ditemukan.</td></tr>';
const tbody = container.querySelector('#tbody-users');
if (tbody) tbody.innerHTML = rows;
container.querySelectorAll('[data-edit-usr]').forEach(btn => {
btn.onclick = () => {
const u = userArr.find(x => x.id === btn.dataset.editUsr);
if (!u) return;
document.getElementById('usr-modal-title').innerText = 'Edit pengguna';
document.getElementById('usr-id').value = u.id;
document.getElementById('usr-name').value = u.name;
document.getElementById('usr-email').value = u.email || '';
document.getElementById('usr-password').value = '';
document.getElementById('usr-password').placeholder = '(Kosongkan jika tidak diubah)';
document.getElementById('usr-role').value = u.role;
const selectedAssignments = AppConfig.normalizeAssignments(u.assignments || []);
Array.from(document.querySelectorAll('#usr-assignments-group input[type="checkbox"]')).forEach((cb) => {
cb.checked = selectedAssignments.includes(cb.value);
});
document.getElementById('usr-password').removeAttribute('required');
App.openModal('modal-usr');
};
});
container.querySelectorAll('[data-del-usr]').forEach(btn => {
btn.onclick = async () => {
if (!confirm('Yakin menghapus pengguna ini?')) return;
await DB.deleteUser(btn.dataset.delUsr);
AdminPages.renderUsers(container);
};
});
};
container.innerHTML = `
<div class="card toolbar-panel">
<div class="toolbar-row">
<div class="toolbar-controls">
<div class="search-box">
<i class="ph ph-magnifying-glass"></i>
<input type="text" id="search-user" placeholder="Cari nama, email...">
</div>
<select id="filter-role" class="toolbar-select">
<option value="">Semua Peran</option>
${Object.entries(AppConfig.PRIMARY_ROLES).map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
</select>
</div>
<button class="btn btn-primary" id="btn-add-usr"><i class="ph ph-plus"></i> Tambah Pengguna</button>
</div>
</div>
<div class="card">
<div class="table-responsive">
<table class="table"><thead><tr><th class="table-col-user">Nama / Email</th><th>Peran</th><th class="table-col-md">Aksi</th></tr></thead>
<tbody id="tbody-users"></tbody></table>
</div>
</div>
<div class="modal-overlay" id="modal-usr">
<div class="modal">
<div class="modal-header">
<h3 class="modal-title" id="usr-modal-title">Tambah pengguna</h3>
<button class="btn-icon" data-close-modal="modal-usr"><i class="ph ph-x"></i></button>
</div>
<form id="form-usr">
<div class="modal-body">
<input type="hidden" id="usr-id">
<div class="form-group"><label>Nama Lengkap</label><input id="usr-name" required></div>
<div class="form-group"><label>Email (opsional)</label><input type="email" id="usr-email"></div>
<div class="form-group"><label>Password</label><input type="password" id="usr-password" required minlength="6"></div>
<div class="form-group"><label>Peran utama</label><select id="usr-role" required>
${Object.entries(AppConfig.PRIMARY_ROLES).map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
</select></div>
<div class="form-group">
<label>Tugas / unit kerja tambahan</label>
<div id="usr-assignments-group">
<div class="assignment-section-label">Pimpinan / Waka</div>
<div class="checkbox-grid">
<label class="checkbox-card"><input type="checkbox" value="WAKA_KURIKULUM"> <span>Waka Kurikulum</span></label>
<label class="checkbox-card"><input type="checkbox" value="WAKA_KESISWAAN"> <span>Waka Kesiswaan</span></label>
<label class="checkbox-card"><input type="checkbox" value="WAKA_SARPRAS"> <span>Waka Sarpras</span></label>
<label class="checkbox-card"><input type="checkbox" value="WAKA_HUMAS_PERSONALIA"> <span>Waka Humas & Personalia</span></label>
<label class="checkbox-card"><input type="checkbox" value="WAKA_KEUANGAN"> <span>Waka Keuangan</span></label>
</div>
<div class="assignment-section-label">Staf Pelaksana Unit</div>
<div class="checkbox-grid">
<label class="checkbox-card"><input type="checkbox" value="STAF_KURIKULUM"> <span>Staf Kurikulum</span></label>
<label class="checkbox-card"><input type="checkbox" value="STAF_KESISWAAN"> <span>Staf Kesiswaan</span></label>
<label class="checkbox-card"><input type="checkbox" value="STAF_SARPRAS"> <span>Staf Sarpras</span></label>
<label class="checkbox-card"><input type="checkbox" value="STAF_HUMAS_PERSONALIA"> <span>Staf Humas & Personalia</span></label>
<label class="checkbox-card"><input type="checkbox" value="STAF_KEUANGAN"> <span>Staf Keuangan</span></label>
</div>
<div class="assignment-section-label">Tim Khusus & Koordinator Program</div>
<div class="checkbox-grid">
<label class="checkbox-card"><input type="checkbox" value="KOORD_UMMI"> <span>Koordinator Ummi</span></label>
<label class="checkbox-card"><input type="checkbox" value="TIM_UMMI"> <span>Tim Ummi (Guru Al-Qur'an)</span></label>
<label class="checkbox-card"><input type="checkbox" value="TIM_IT"> <span>Tim IT & Sistem</span></label>
<label class="checkbox-card"><input type="checkbox" value="TIM_B_INGGRIS"> <span>Tim English Lab</span></label>
</div>
<div class="assignment-section-label">Guru Ekstrakurikuler</div>
<div class="checkbox-grid">
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_HW"> <span>Pembina HW</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_TS"> <span>Pembina Tapak Suci</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_PANAHAN_PUTRA"> <span>Ekskul Panahan Putra</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_PANAHAN_PUTRI"> <span>Ekskul Panahan Putri</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_BADMINTON"> <span>Ekskul Badminton</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_RENANG"> <span>Ekskul Renang</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_COOKING"> <span>Ekskul Cooking</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_TARI"> <span>Ekskul Tari</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_LUKIS"> <span>Ekskul Lukis</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_SEMPOA"> <span>Ekskul Sempoa</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_STORY_TELLING"> <span>Ekskul Story Telling</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_EKSTRA_TAHFIDZ_CAMP"> <span>Pembina Tahfidz Camp</span></label>
</div>
<div class="assignment-section-label">Guru Mapel Spesifik</div>
<div class="checkbox-grid">
<label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_PAI"> <span>Guru Mapel PAI</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_PJOK"> <span>Guru Mapel PJOK</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_B_INGGRIS"> <span>Guru Mapel B. Inggris</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_SENI"> <span>Guru Mapel Seni</span></label>
<label class="checkbox-card"><input type="checkbox" value="GURU_MAPEL_TIK"> <span>Guru Mapel TIK</span></label>
</div>
</div>
<small class="text-muted">Pilih satu atau lebih penugasan struktural / tim.</small>
</div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-usr">Batal</button>
<button type="submit" class="btn btn-primary">Simpan</button>
</div>
</form>
</div>
</div>
`;
renderTable();
document.getElementById('search-user').addEventListener('input', renderTable);
document.getElementById('filter-role').addEventListener('change', renderTable);
document.getElementById('btn-add-usr').onclick = () => {
document.getElementById('usr-modal-title').innerText = 'Tambah pengguna';
document.getElementById('usr-id').value = '';
document.getElementById('usr-name').value = '';
document.getElementById('usr-email').value = '';
document.getElementById('usr-password').value = '';
document.getElementById('usr-password').placeholder = '';
document.getElementById('usr-role').value = 'guru';
Array.from(document.querySelectorAll('#usr-assignments-group input[type="checkbox"]')).forEach((cb) => {
cb.checked = false;
});
document.getElementById('usr-password').setAttribute('required', 'true');
App.openModal('modal-usr');
};
document.getElementById('form-usr').onsubmit = async (e) => {
e.preventDefault();
const btn = e.target.querySelector('button[type="submit"]');
btn.disabled = true;
btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
const id = document.getElementById('usr-id').value || null;
const pwd = document.getElementById('usr-password').value;
const assignments = Array.from(document.querySelectorAll('#usr-assignments-group input[type="checkbox"]:checked')).map((cb) => cb.value);
const name = document.getElementById('usr-name').value.trim();
let email = document.getElementById('usr-email').value.trim();
if (!email) {
email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@musada.sch.id`;
}
const data = {
name,
email,
role: document.getElementById('usr-role').value,
assignments: assignments
};
if (pwd) data.password = pwd;
try {
if (!id) {
if (!pwd || pwd.length < 6) throw new Error('Password minimal 6 karakter.');
const secApp = firebase.initializeApp(firebaseConfig, 'SecAuth_' + Date.now());
let newUid = null;
try {
const cred = await secApp.auth().createUserWithEmailAndPassword(email, pwd);
newUid = cred.user.uid;
await cred.user.updateProfile({ displayName: name });
} finally {
await secApp.delete();
}
if (newUid) {
await DB.createUserInDB(newUid, data);
}
} else {
await DB.saveUser(id, data);
}
App.closeModal('modal-usr');
AdminPages.renderUsers(container);
} catch (err) {
alert(err.message || 'Gagal menyimpan');
btn.disabled = false;
btn.innerHTML = 'Simpan';
}
};
},
async renderClasses(container) {
Router.setTitle('Data kelas', 'Kelola kelas dan penugasan wali kelas serta guru mapel.');
const [classes, users, students, subjects] = await Promise.all([
DB.getClasses(),
DB.getAllUsers(),
DB.getAllStudents(),
DB.getSubjects()
]);
const classArr = DB.toArray(classes);
const isKurikulum = Auth.currentRole === AppConfig.ROLES.ADMIN || Auth.currentAssignments.includes('WAKA_KURIKULUM');
const guruArr = DB.toArray(users).filter(u => AppConfig.isTeacher(u));
const subArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
const studentArr = DB.toArray(students);
const rows = classArr.length ? classArr.map(c => {
const teacher = guruArr.find(g => g.id === c.teacherId);
const count = studentArr.filter(s => s.classId === c.id).length;
return `
<tr>
<td><strong>${AppConfig.escapeHtml(c.name)}</strong> <span class="badge badge-outline">Fase ${AppConfig.escapeHtml(AppConfig.getClassPhase(c))}</span></td>
<td>${teacher ? teacher.name : '<span class="text-muted">Belum ditugaskan</span>'}</td>
<td>${count} siswa</td>
<td class="action-cell table-col-lg">
${isKurikulum ? `<button class="btn btn-outline btn-sm" data-mapel-cls="${c.id}" title="Atur Guru Mapel"><i class="ph ph-books"></i> Mapel</button>` : ''}
${isKurikulum ? `<button class="btn btn-outline btn-sm" data-edit-cls="${c.id}" title="Edit Kelas"><i class="ph ph-pencil-simple"></i></button>` : ''}
<button class="btn btn-outline btn-sm" data-view-cls="${c.id}" title="Lihat Siswa"><i class="ph ph-eye"></i></button>
${isKurikulum ? `<button class="btn btn-danger btn-sm" data-del-cls="${c.id}" title="Hapus"><i class="ph ph-trash"></i></button>` : ''}
</td>
</tr>`;
}).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada kelas.</td></tr>';
const guruOptions = guruArr.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('');
container.innerHTML = `
<div class="card">
<div class="card-header">
<h3 class="card-title">Daftar kelas</h3>
${isKurikulum ? `
<div class="card-actions">
<button class="btn btn-outline" id="btn-promo-cls"><i class="ph ph-arrow-fat-lines-up"></i> Kenaikan Kelas</button>
<button class="btn btn-primary" id="btn-add-cls"><i class="ph ph-plus"></i> Tambah</button>
</div>
` : ''}
</div>
<div class="table-responsive">
<table class="table"><thead><tr><th>Nama Kelas</th><th>Wali Kelas</th><th>Jumlah Siswa</th><th class="table-col-lg">Aksi</th></tr></thead>
<tbody>${rows}</tbody></table>
</div>
</div>
<div class="modal-overlay" id="modal-cls">
<div class="modal">
<div class="modal-header">
<h3 class="modal-title" id="cls-modal-title">Tambah kelas</h3>
<button class="btn-icon" data-close-modal="modal-cls"><i class="ph ph-x"></i></button>
</div>
<form id="form-cls">
<div class="modal-body">
<input type="hidden" id="cls-id">
<div class="form-group">
<label>Nama kelas</label>
<input id="cls-name" required placeholder="Contoh: 4A">
</div>
<div class="form-group">
<label>Wali kelas</label>
<select id="cls-teacher">
<option value="">— Pilih guru —</option>
${guruOptions}
</select>
</div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-cls">Batal</button>
<button type="submit" class="btn btn-primary">Simpan</button>
</div>
</form>
</div>
</div>
<div class="modal-overlay" id="modal-mapel">
<div class="modal modal-lg">
<div class="modal-header">
<h3 class="modal-title" id="mapel-modal-title">Mata Pelajaran & Guru Pengampu</h3>
<button class="btn-icon" data-close-modal="modal-mapel"><i class="ph ph-x"></i></button>
</div>
<form id="form-mapel">
<div class="modal-body">
<input type="hidden" id="mapel-cls-id">
<p class="text-muted soft-note">Struktur mata pelajaran bersifat mandiri per rombel. Anda dapat menambah mapel dari bank mapel, menugaskan guru pengampu, atau menghapus mapel dari rombel ini.</p>
${isKurikulum ? `
<div class="rombel-mapel-toolbar">
<div class="form-group mb-0 flex-1">
<label>Pilih Mata Pelajaran dari Bank Mapel:</label>
<select id="mapel-select-add">
<option value="">Pilih Mata Pelajaran</option>
</select>
</div>
<button type="button" class="btn btn-primary" id="btn-add-subject-to-class"><i class="ph ph-plus"></i> Tambah ke Rombel</button>
</div>
` : ''}
<div class="rombel-mapel-header-bar">
<span id="mapel-count-badge" class="badge badge-primary">0 Mata Pelajaran</span>
<a href="#/admin/subjects" class="guide-action-link"><i class="ph ph-sliders"></i> Kelola Bank Mapel</a>
</div>
<div id="mapel-list-container" class="rombel-mapel-list"></div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-mapel">Batal</button>
${isKurikulum ? `<button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Penugasan Rombel</button>` : ''}
</div>
</form>
</div>
</div>
<div class="modal-overlay" id="modal-promo">
<div class="modal modal-lg">
<div class="modal-header">
<h3 class="modal-title"><i class="ph ph-arrow-fat-lines-up"></i> Kenaikan Kelas & Promosi Rombel</h3>
<button class="btn-icon" data-close-modal="modal-promo"><i class="ph ph-x"></i></button>
</div>
<form id="form-promo">
<div class="modal-body">
<p class="text-muted soft-note">Pilih kelas asal dan kelas tujuan untuk memproses kenaikan kelas atau kelulusan siswa secara massal pada akhir tahun ajaran.</p>
<div class="form-row">
<div class="form-group">
<label>Kelas Asal (Saat Ini)</label>
<select id="promo-from-cls" required>
<option value="">— Pilih Kelas Asal —</option>
${classArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label>Kelas Tujuan (Kenaikan / Kelulusan)</label>
<select id="promo-to-cls" required>
<option value="">— Pilih Kelas Tujuan —</option>
${classArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('')}
<option value="LULUS_ALUMNI">Lulus / Alumni (Khusus Kelas 6)</option>
</select>
</div>
</div>
<div class="card-header">
<label><strong>Daftar Siswa yang Akan Dipromosikan:</strong></label>
<div>
<input type="checkbox" id="promo-select-all" checked> <label for="promo-select-all">Pilih Semua</label>
</div>
</div>
<div class="table-responsive">
<table class="table table-sm">
<thead><tr><th class="table-th-select">Pilih</th><th>NIS</th><th>Nama Siswa</th><th>Status</th></tr></thead>
<tbody id="promo-students-tbody">
<tr><td colspan="4" class="text-center text-muted">Pilih kelas asal terlebih dahulu.</td></tr>
</tbody>
</table>
</div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-promo">Batal</button>
<button type="submit" class="btn btn-primary" id="btn-submit-promo"><i class="ph ph-check"></i> Eksekusi Kenaikan Kelas</button>
</div>
</form>
</div>
</div>
`;
const btnAddCls = document.getElementById('btn-add-cls');
if (btnAddCls) {
btnAddCls.onclick = () => {
document.getElementById('cls-modal-title').innerText = 'Tambah kelas';
document.getElementById('cls-id').value = '';
document.getElementById('cls-name').value = '';
document.getElementById('cls-teacher').value = '';
document.getElementById('modal-cls').classList.add('active');
};
}
container.querySelectorAll('[data-edit-cls]').forEach(btn => {
btn.onclick = () => {
const c = classArr.find(x => x.id === btn.dataset.editCls);
if (!c) return;
document.getElementById('cls-modal-title').innerText = 'Edit kelas';
document.getElementById('cls-id').value = c.id;
document.getElementById('cls-name').value = c.name;
document.getElementById('cls-teacher').value = c.teacherId || '';
document.getElementById('modal-cls').classList.add('active');
};
});
let activeClass = null;
let editingSubjectTeachers = {};
const categoryBadge = {
'agama': 'badge-success',
'standar': 'badge-primary',
'lokal': 'badge-warning',
'kekhasan': 'badge-danger'
};
const categoryLabel = {
'agama': 'Agama',
'standar': 'Umum',
'lokal': 'Muatan Lokal',
'kekhasan': 'Kekhasan'
};
const updateMapelAddDropdown = () => {
const addSelect = document.getElementById('mapel-select-add');
if (!addSelect) return;
const currentSubIds = Object.keys(editingSubjectTeachers);
const availableToAdd = subArr.filter(s => !currentSubIds.includes(s.id));
if (!availableToAdd.length) {
addSelect.innerHTML = '<option value="">Semua mata pelajaran kurikulum telah terpasang</option>';
addSelect.disabled = true;
} else {
addSelect.disabled = false;
addSelect.innerHTML = '<option value="">Pilih Mata Pelajaran</option>' +
availableToAdd.map(s => `<option value="${s.id}">[${categoryLabel[s.category] || s.category}] ${AppConfig.escapeHtml(s.name)}</option>`).join('');
}
};
const renderMapelList = () => {
const containerEl = document.getElementById('mapel-list-container');
const countBadge = document.getElementById('mapel-count-badge');
if (!containerEl) return;
const subIds = Object.keys(editingSubjectTeachers);
if (countBadge) countBadge.textContent = `${subIds.length} Mata Pelajaran Aktif`;
updateMapelAddDropdown();
if (!subIds.length) {
containerEl.innerHTML = '<div class="card text-center text-muted p-3">Belum ada mata pelajaran untuk rombel ini. Pilih dari dropdown di atas untuk menambahkan.</div>';
return;
}
const activeSubjects = subIds.map(sid => {
const meta = subArr.find(s => s.id === sid) || { id: sid, name: sid, category: 'standar', order: 99 };
return {
id: sid,
name: meta.name || sid,
category: meta.category || 'standar',
order: meta.order !== undefined ? meta.order : 99,
teacherId: editingSubjectTeachers[sid] || ''
};
}).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
containerEl.innerHTML = activeSubjects.map(sub => `
<div class="rombel-subject-item" data-item-sub="${sub.id}">
<div class="rombel-subject-info">
<span class="badge ${categoryBadge[sub.category] || 'badge-primary'}">${categoryLabel[sub.category] || sub.category}</span>
<strong>${AppConfig.escapeHtml(sub.name)}</strong>
</div>
<div class="rombel-subject-controls">
<select class="mapel-select-input" data-sub-id="${sub.id}" ${!isKurikulum ? 'disabled' : ''}>
<option value="">Default (Wali Kelas)</option>
${guruArr.map(g => `<option value="${g.id}" ${sub.teacherId === g.id ? 'selected' : ''}>${AppConfig.escapeHtml(g.name)}</option>`).join('')}
</select>
${isKurikulum ? `
<button type="button" class="btn btn-outline btn-danger btn-sm btn-del-rombel-sub" data-del-sub="${sub.id}" title="Hapus dari rombel ini">
<i class="ph ph-trash"></i>
</button>
` : ''}
</div>
</div>
`).join('');
containerEl.querySelectorAll('.mapel-select-input').forEach(sel => {
sel.onchange = (e) => {
const sid = e.target.dataset.subId;
editingSubjectTeachers[sid] = e.target.value;
};
});
containerEl.querySelectorAll('.btn-del-rombel-sub').forEach(btn => {
btn.onclick = () => {
const sid = btn.dataset.delSub;
delete editingSubjectTeachers[sid];
renderMapelList();
};
});
};
const btnAddSubToClass = document.getElementById('btn-add-subject-to-class');
if (btnAddSubToClass) {
btnAddSubToClass.onclick = () => {
const addSelect = document.getElementById('mapel-select-add');
const selectedSubId = addSelect ? addSelect.value : '';
if (!selectedSubId) {
alert('Pilih mata pelajaran yang ingin ditambahkan terlebih dahulu.');
return;
}
editingSubjectTeachers[selectedSubId] = (activeClass && activeClass.teacherId) || '';
renderMapelList();
};
}
container.querySelectorAll('[data-mapel-cls]').forEach(btn => {
btn.onclick = () => {
const c = classArr.find(x => x.id === btn.dataset.mapelCls);
if (!c) return;
activeClass = c;
editingSubjectTeachers = { ...(c.subjectTeachers || {}) };
document.getElementById('mapel-modal-title').textContent = `Mata Pelajaran & Guru Pengampu - Kelas ${c.name}`;
document.getElementById('mapel-cls-id').value = c.id;
renderMapelList();
document.getElementById('modal-mapel').classList.add('active');
};
});
container.querySelectorAll('[data-del-cls]').forEach(btn => {
btn.onclick = async () => {
const classId = btn.dataset.delCls;
const studentsInClass = await DB.getStudentsByClass(classId);
if (Object.keys(studentsInClass || {}).length > 0) {
alert('Tidak dapat menghapus kelas karena masih ada siswa yang terdaftar di dalamnya. Silakan pindahkan atau hapus siswa terlebih dahulu.');
return;
}
if (!confirm('Yakin ingin menghapus kelas ini secara permanen?')) return;
await DB.deleteClass(classId);
AdminPages.renderClasses(container);
};
});
container.querySelectorAll('[data-view-cls]').forEach(btn => {
btn.onclick = () => {
window.location.hash = `#/admin/students/${btn.dataset.viewCls}`;
};
});
document.getElementById('form-cls').onsubmit = async (e) => {
e.preventDefault();
const id = document.getElementById('cls-id').value || null;
const clsName = document.getElementById('cls-name').value.trim();
await DB.saveClass(id, {
name: clsName,
phase: AppConfig.getClassPhase({ name: clsName, id }),
teacherId: document.getElementById('cls-teacher').value || null
});
App.closeModal('modal-cls');
AdminPages.renderClasses(container);
};
document.getElementById('form-mapel').onsubmit = async (e) => {
e.preventDefault();
if (!isKurikulum) return;
const id = document.getElementById('mapel-cls-id').value;
if (!id) return;
await DB.saveClassSubjectTeachers(id, editingSubjectTeachers);
App.closeModal('modal-mapel');
AdminPages.renderClasses(container);
};
const btnPromoCls = document.getElementById('btn-promo-cls');
if (btnPromoCls) {
btnPromoCls.onclick = () => {
document.getElementById('promo-from-cls').value = '';
document.getElementById('promo-to-cls').value = '';
document.getElementById('promo-students-tbody').innerHTML = '<tr><td colspan="4" class="text-center text-muted">Pilih kelas asal terlebih dahulu.</td></tr>';
document.getElementById('modal-promo').classList.add('active');
};
if (window.location.hash.includes('action=promo')) {
setTimeout(() => { btnPromoCls.click(); }, 150);
}
}
const promoFromSelect = document.getElementById('promo-from-cls');
if (promoFromSelect) {
promoFromSelect.onchange = () => {
const fromId = promoFromSelect.value;
const tbody = document.getElementById('promo-students-tbody');
if (!fromId) {
tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Pilih kelas asal terlebih dahulu.</td></tr>';
return;
}
const filteredStudents = studentArr.filter(s => s.classId === fromId && s.status !== 'Lulus' && s.status !== 'Keluar').sort((a,b) => (a.name || '').localeCompare(b.name || ''));
if (!filteredStudents.length) {
tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Tidak ada siswa aktif terdaftar di kelas ini.</td></tr>';
return;
}
tbody.innerHTML = filteredStudents.map(s => `
<tr>
<td><input type="checkbox" class="chk-promo-stu" data-stu-id="${s.id}" checked></td>
<td>${s.nis || s.nisn || '-'}</td>
<td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
<td><span class="badge badge-success">Siap Promosi</span></td>
</tr>
`).join('');
const selectAll = document.getElementById('promo-select-all');
if (selectAll) selectAll.checked = true;
};
}
const promoSelectAll = document.getElementById('promo-select-all');
if (promoSelectAll) {
promoSelectAll.onchange = (e) => {
document.querySelectorAll('.chk-promo-stu').forEach(chk => { chk.checked = e.target.checked; });
};
}
const formPromo = document.getElementById('form-promo');
if (formPromo) {
formPromo.onsubmit = async (e) => {
e.preventDefault();
const fromId = document.getElementById('promo-from-cls').value;
const toId = document.getElementById('promo-to-cls').value;
if (!fromId || !toId) return alert('Pilih kelas asal dan kelas tujuan.');
if (fromId === toId) return alert('Kelas tujuan tidak boleh sama dengan kelas asal.');
const selectedIds = [];
document.querySelectorAll('.chk-promo-stu:checked').forEach(chk => {
selectedIds.push(chk.dataset.stuId);
});
if (!selectedIds.length) return alert('Pilih setidaknya satu siswa untuk dipromosikan.');
const fromClsName = classArr.find(c => c.id === fromId)?.name || fromId;
const toClsName = toId === 'LULUS_ALUMNI' ? 'Lulus / Alumni' : (classArr.find(c => c.id === toId)?.name || toId);
if (!confirm(`Yakin ingin mempromosikan ${selectedIds.length} siswa dari ${fromClsName} ke ${toClsName}?`)) return;
const submitBtn = document.getElementById('btn-submit-promo');
submitBtn.disabled = true;
submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Memproses...';
try {
const settings = await DB.getSettings();
const currentYear = settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear;
const timestamp = new Date().toISOString();
const updates = {};
let existingAlumni = {};
if (toId === 'LULUS_ALUMNI') {
try {
const snap = await firebase.database().ref('student_affairs/alumni').once('value');
existingAlumni = snap.val() || {};
} catch (alumniErr) {}
}
const promoKey = firebase.database().ref(`classes/${fromId}/promotion`).push().key;
const promoLog = {
id: promoKey,
date: timestamp,
academicYear: currentYear,
fromClassId: fromId,
fromClassName: fromClsName,
toClassId: toId,
toClassName: toClsName,
totalStudents: selectedIds.length,
studentIds: selectedIds,
executedBy: Auth.currentUser.uid
};
updates[`classes/${fromId}/promotion/${promoKey}`] = promoLog;
updates[`student_promotions/${promoKey}`] = promoLog;
selectedIds.forEach(id => {
const stu = studentArr.find(s => s.id === id) || {};
if (toId === 'LULUS_ALUMNI') {
updates[`students/${id}/classId`] = 'ALUMNI';
updates[`students/${id}/status`] = 'Lulus';
updates[`students/${id}/graduationYear`] = currentYear;
const prev = existingAlumni[id] || {};
updates[`student_affairs/alumni/${id}`] = {
...prev,
id: id,
studentId: id,
name: stu.name || prev.name || '',
gender: stu.gender || prev.gender || 'Laki-laki',
nisn: stu.nisn || prev.nisn || '',
graduationYear: currentYear,
destinationSchool: prev.destinationSchool || 'Belum terdata',
schoolType: prev.schoolType || 'SMP',
updatedAt: timestamp
};
} else {
updates[`students/${id}/classId`] = toId;
updates[`students/${id}/status`] = 'Aktif';
}
updates[`students/${id}/promotionHistory/${promoKey}`] = {
promoId: promoKey,
date: timestamp,
academicYear: currentYear,
fromClassId: fromId,
fromClassName: fromClsName,
toClassId: toId,
toClassName: toClsName,
executedBy: Auth.currentUser.uid
};
updates[`students/${id}/lastPromotion`] = {
date: timestamp,
academicYear: currentYear,
fromClassId: fromId,
toClassId: toId
};
});
const auditKey = firebase.database().ref('audit_logs').push().key;
updates[`audit_logs/${auditKey}`] = {
action: 'PROMOSI_KELAS',
actor: Auth.currentUser.uid,
actorName: Auth.currentUser.displayName || Auth.currentUser.email || 'Admin/Kurikulum',
timestamp: timestamp,
detail: `Kenaikan rombel dari ${fromClsName} ke ${toClsName} (${selectedIds.length} siswa). Tahun Ajaran: ${currentYear}`
};
await firebase.database().ref().update(updates);
alert(`Sukses mempromosikan ${selectedIds.length} siswa ke ${toClsName}!`);
App.closeModal('modal-promo');
AdminPages.renderClasses(container);
} catch (err) {
alert('Gagal memproses promosi: ' + err.message);
submitBtn.disabled = false;
submitBtn.innerHTML = '<i class="ph ph-check"></i> Eksekusi Kenaikan Kelas';
}
};
}
},
async renderStudents(container, classId) {
const classes = await DB.getClasses();
const cls = classes[classId];
if (!cls) {
container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
return;
}
Router.setTitle(`Siswa kelas ${AppConfig.escapeHtml(cls.name)}`, 'Kelola data siswa dan hubungkan dengan akun orang tua.');
const [studentData, users] = await Promise.all([
DB.getStudentsByClass(classId),
DB.getAllUsers()
]);
const studentArr = DB.toArray(studentData).sort((a,b) => a.name.localeCompare(b.name));
const ortuArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.ORTU);
const renderTable = () => {
const q = (document.getElementById('search-student')?.value || '').toLowerCase();
const genderFilter = document.getElementById('filter-gender')?.value || '';
const filtered = studentArr.filter(s => {
const matchSearch = (s.name || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
const matchGender = genderFilter ? s.gender === genderFilter : true;
return matchSearch && matchGender;
});
const rows = filtered.length ? filtered.map(s => {
const parent = ortuArr.find(p => p.id === s.parentId);
return `
<tr>
<td>${s.nis || '-'}</td>
<td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
<td>${s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '-'}</td>
<td>${parent ? parent.name : '<span class="text-muted">Belum tertaut</span>'}</td>
<td class="action-cell">
<button class="btn btn-outline btn-sm" data-edit-stu="${s.id}"><i class="ph ph-pencil-simple"></i></button>
<button class="btn btn-danger btn-sm" data-del-stu="${s.id}"><i class="ph ph-trash"></i></button>
</td>
</tr>
`;
}).join('') : '<tr><td colspan="5" class="text-center text-muted">Tidak ada data siswa ditemukan.</td></tr>';
const tbody = container.querySelector('#tbody-students');
if (tbody) tbody.innerHTML = rows;
container.querySelectorAll('[data-edit-stu]').forEach(btn => {
btn.onclick = () => {
const s = studentArr.find(x => x.id === btn.dataset.editStu);
if (!s) return;
document.getElementById('stu-modal-title').innerText = 'Edit siswa';
document.getElementById('stu-id').value = s.id;
document.getElementById('stu-nis').value = s.nis || '';
document.getElementById('stu-nisn').value = s.nisn || '';
document.getElementById('stu-name').value = s.name;
document.getElementById('stu-gender').value = s.gender || 'L';
document.getElementById('stu-parent').value = s.parentId || '';
App.openModal('modal-stu');
};
});
container.querySelectorAll('[data-del-stu]').forEach(btn => {
btn.onclick = async () => {
if (!confirm('Yakin menghapus siswa ini?')) return;
await DB.deleteStudent(btn.dataset.delStu);
AdminPages.renderStudents(container, classId);
};
});
};
const ortuOptions = ortuArr.map(p => `<option value="${p.id}">${AppConfig.escapeHtml(p.name)} (${AppConfig.escapeHtml(p.username)})</option>`).join('');
container.innerHTML = `
<div class="toolbar-panel"><a href="#/admin/classes" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali ke kelas</a></div>
<div class="card toolbar-panel">
<div class="toolbar-row">
<div class="toolbar-controls">
<div class="search-box">
<i class="ph ph-magnifying-glass"></i>
<input type="text" id="search-student" placeholder="Cari nama atau NIS...">
</div>
<select id="filter-gender" class="toolbar-select">
<option value="">Semua L/P</option>
<option value="L">Laki-laki</option>
<option value="P">Perempuan</option>
</select>
</div>
<button class="btn btn-primary" id="btn-add-stu"><i class="ph ph-plus"></i> Tambah Siswa</button>
</div>
</div>
<div class="card">
<div class="table-responsive">
<table class="table"><thead><tr><th>NIS</th><th>Nama Siswa</th><th>L/P</th><th>Orang Tua</th><th class="table-col-md">Aksi</th></tr></thead>
<tbody id="tbody-students"></tbody></table>
</div>
</div>
<div class="modal-overlay" id="modal-stu">
<div class="modal">
<div class="modal-header">
<h3 class="modal-title" id="stu-modal-title">Tambah siswa</h3>
<button class="btn-icon" data-close-modal="modal-stu"><i class="ph ph-x"></i></button>
</div>
<form id="form-stu">
<div class="modal-body">
<input type="hidden" id="stu-id">
<div class="form-split">
<div class="form-group"><label>NIS</label><input id="stu-nis" required></div>
<div class="form-group"><label>NISN</label><input id="stu-nisn"></div>
</div>
<div class="form-group"><label>Nama Lengkap</label><input id="stu-name" required></div>
<div class="form-group"><label>Jenis Kelamin</label><select id="stu-gender"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
<div class="form-group"><label>Tautkan Orang Tua</label><select id="stu-parent"><option value="">— Tidak ditautkan —</option>${ortuOptions}</select></div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-stu">Batal</button>
<button type="submit" class="btn btn-primary">Simpan</button>
</div>
</form>
</div>
</div>
`;
renderTable();
document.getElementById('search-student').addEventListener('input', renderTable);
document.getElementById('filter-gender').addEventListener('change', renderTable);
document.getElementById('btn-add-stu').onclick = async () => {
document.getElementById('stu-modal-title').innerText = 'Tambah siswa';
document.getElementById('stu-id').value = '';
const nextNis = await DB.getNextNis();
document.getElementById('stu-nis').value = nextNis;
document.getElementById('stu-nisn').value = '';
document.getElementById('stu-name').value = '';
document.getElementById('stu-gender').value = 'L';
document.getElementById('stu-parent').value = '';
App.openModal('modal-stu');
};
document.getElementById('form-stu').onsubmit = async (e) => {
e.preventDefault();
const nis = document.getElementById('stu-nis').value.trim();
const id = document.getElementById('stu-id').value || ('SISWA_' + nis);
await DB.saveStudent(id, {
classId: classId,
nis: nis,
nisn: document.getElementById('stu-nisn').value.trim(),
name: document.getElementById('stu-name').value.trim(),
gender: document.getElementById('stu-gender').value,
parentId: document.getElementById('stu-parent').value || id
});
App.closeModal('modal-stu');
AdminPages.renderStudents(container, classId);
};
},
async renderSubjects(container) {
Router.setTitle('Pemetaan Mapel & Guru', 'Kelola struktur mata pelajaran kurikulum dan pemetaan guru pengampu.');
const [subjects, classes, users] = await Promise.all([DB.getSubjects(), DB.getClasses(), DB.getAllUsers()]);
const subArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
const classArr = DB.toArray(classes);
const categoryLabel = {
'agama': 'Agama',
'standar': 'Umum',
'lokal': 'Muatan Lokal',
'kekhasan': 'Kekhasan'
};
const categoryBadge = {
'agama': 'badge-success',
'standar': 'badge-primary',
'lokal': 'badge-warning',
'kekhasan': 'badge-danger'
};
const renderTable = () => {
const q = (document.getElementById('search-sub')?.value || '').toLowerCase();
const filtered = subArr.filter(s => (s.name || '').toLowerCase().includes(q));
const rows = filtered.length ? filtered.map(s => {
const assignedTeachers = [...new Set(classArr.map(c => c.subjectTeachers && c.subjectTeachers[s.id]).filter(Boolean))];
const assignedClassesCount = classArr.filter(c => c.subjectTeachers && c.subjectTeachers[s.id]).length;
let mappingInfo = '<span class="text-muted">Mengikuti Wali Kelas</span>';
if (assignedTeachers.length > 0) {
const names = assignedTeachers.map(tid => (users[tid]?.name || tid).split(',')[0]).join(', ');
mappingInfo = `<strong>${assignedClassesCount} Rombel</strong> <small class="text-muted">(${AppConfig.escapeHtml(names)})</small>`;
}
return `
<tr>
<td>${s.order || '-'}</td>
<td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
<td><span class="badge ${categoryBadge[s.category] || 'badge-primary'}">${categoryLabel[s.category] || s.category}</span></td>
<td>${mappingInfo}</td>
<td class="action-cell">
<button class="btn btn-outline btn-sm" data-edit-sub="${s.id}"><i class="ph ph-pencil-simple"></i></button>
<button class="btn btn-danger btn-sm" data-del-sub="${s.id}"><i class="ph ph-trash"></i></button>
</td>
</tr>
`;
}).join('') : '<tr><td colspan="5" class="text-center text-muted">Belum ada mata pelajaran.</td></tr>';
const tbody = container.querySelector('#tbody-subjects');
if (tbody) tbody.innerHTML = rows;
container.querySelectorAll('[data-edit-sub]').forEach(btn => {
btn.onclick = () => {
const s = subArr.find(x => x.id === btn.dataset.editSub);
if (s) AdminPages._openSubjectModal(s);
};
});
container.querySelectorAll('[data-del-sub]').forEach(btn => {
btn.onclick = async () => {
if (!confirm('Yakin menghapus mata pelajaran ini?')) return;
await DB.deleteSubject(btn.dataset.delSub);
AdminPages.renderSubjects(container);
};
});
};
container.innerHTML = `
<div class="card toolbar-panel">
<div class="toolbar-row">
<div class="toolbar-controls">
<div class="search-box">
<i class="ph ph-magnifying-glass"></i>
<input type="text" id="search-sub" placeholder="Cari mata pelajaran...">
</div>
</div>
<div class="toolbar-actions">
<a href="#/admin/classes" class="btn btn-outline"><i class="ph ph-chalkboard-teacher"></i> Atur Pemetaan per Rombel</a>
<button class="btn btn-primary" id="btn-add-sub"><i class="ph ph-plus"></i> Tambah Mapel</button>
</div>
</div>
</div>
<div class="card">
<div class="table-responsive">
<table class="table"><thead><tr><th class="table-col-sm">No</th><th>Nama Mata Pelajaran</th><th>Kategori</th><th>Guru Pengampu Terpetakan</th><th class="table-col-md">Aksi</th></tr></thead>
<tbody id="tbody-subjects"></tbody></table>
</div>
</div>
${AdminPages._subjectModal()}
`;
renderTable();
document.getElementById('search-sub').addEventListener('input', renderTable);
document.getElementById('btn-add-sub').onclick = () => AdminPages._openSubjectModal(null, subArr.length + 1);
document.getElementById('form-sub').onsubmit = async (e) => {
e.preventDefault();
const id = document.getElementById('sub-id').value || null;
await DB.saveSubject(id, {
name: document.getElementById('sub-name').value.trim(),
category: document.getElementById('sub-category').value,
order: parseInt(document.getElementById('sub-order').value) || 1
});
App.closeModal('modal-sub');
AdminPages.renderSubjects(container);
};
},
_subjectModal() {
return `
<div class="modal-overlay" id="modal-sub">
<div class="modal">
<div class="modal-header">
<h3 class="modal-title" id="sub-modal-title">Tambah mata pelajaran</h3>
<button class="btn-icon" data-close-modal="modal-sub"><i class="ph ph-x"></i></button>
</div>
<form id="form-sub">
<div class="modal-body">
<input type="hidden" id="sub-id">
<div class="form-group">
<label>Kategori</label>
<select id="sub-category" required>
<option value="standar">Umum</option>
<option value="agama">Agama</option>
<option value="lokal">Muatan Lokal</option>
<option value="kekhasan">Kekhasan</option>
</select>
</div>
<div class="form-group">
<label>Nama Mata Pelajaran</label>
<input type="text" id="sub-name" required placeholder="Contoh: Matematika">
</div>
<div class="form-group">
<label>Urutan (Opsional)</label>
<input type="number" id="sub-order" placeholder="Contoh: 1">
</div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-sub">Batal</button>
<button type="submit" class="btn btn-primary">Simpan</button>
</div>
</form>
</div>
</div>`;
},
_openSubjectModal(existing = null, nextOrder = 1) {
document.getElementById('sub-modal-title').innerText = existing ? 'Edit mata pelajaran' : 'Tambah mata pelajaran';
document.getElementById('sub-id').value = existing ? existing.id : '';
document.getElementById('sub-category').value = existing ? existing.category : 'standar';
document.getElementById('sub-name').value = existing ? existing.name : '';
document.getElementById('sub-order').value = existing ? existing.order : nextOrder;
document.getElementById('modal-sub').classList.add('active');
},
async renderExtracurriculars(container) {
Router.setTitle('Ekstrakurikuler', 'Kelola daftar ekstrakurikuler sekolah dan pemetaan peserta resmi.');
const [ekskuls, users, classes, allStudents] = await Promise.all([
DB.getExtracurriculars(),
DB.getAllUsers(),
DB.getClasses(),
DB.getAllStudents()
]);
const pembinaArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.GURU || u.role === AppConfig.ROLES.GURU_EKSKUL || u.role === AppConfig.ROLES.TENDIK || AppConfig.getRoleAssignments(u).some(a => a.startsWith('GURU_EKSTRA_')));
const classArr = DB.toArray(classes);
const studentArr = DB.toArray(allStudents);
const eksArr = DB.toArray(ekskuls).sort((a, b) => (a.order || 0) - (b.order || 0));
const rows = eksArr.length ? eksArr.map(e => {
const guru = pembinaArr.find(g => g.id === e.teacherId);
const studentCount = Object.keys(e.students || {}).length;
return `
<tr>
<td>${e.order || '-'}</td>
<td><strong>${AppConfig.escapeHtml(e.name)}</strong></td>
<td>${guru ? guru.name : '<span class="text-muted">Belum ada pembina</span>'}</td>
<td><button class="btn btn-outline btn-sm" data-manage-students="${e.id}"><i class="ph ph-users-three"></i> ${studentCount} Murid</button></td>
<td class="action-cell">
<button class="btn btn-outline btn-sm" data-edit-eks="${e.id}"><i class="ph ph-pencil-simple"></i></button>
<button class="btn btn-danger btn-sm" data-del-eks="${e.id}"><i class="ph ph-trash"></i></button>
</td>
</tr>
`}).join('') : '<tr><td colspan="5" class="text-center text-muted">Belum ada ekstrakurikuler.</td></tr>';
container.innerHTML = `
<div class="card">
<div class="card-header">
<h3 class="card-title">Daftar Ekstrakurikuler</h3>
<button class="btn btn-primary" id="btn-add-eks"><i class="ph ph-plus"></i> Tambah</button>
</div>
<div class="table-responsive">
<table class="table"><thead><tr><th style="width:50px">No</th><th>Nama Ekstrakurikuler</th><th>Guru Pembina</th><th style="width:140px">Jumlah Peserta</th><th style="width:100px">Aksi</th></tr></thead>
<tbody>${rows}</tbody></table>
</div>
</div>
${AdminPages._extracurricularModal(pembinaArr)}
${AdminPages._extracurricularStudentsModal(classArr)}
`;
document.getElementById('btn-add-eks').onclick = () => AdminPages._openExtracurricularModal(null, eksArr.length + 1);
container.querySelectorAll('[data-edit-eks]').forEach(btn => {
btn.onclick = () => {
const e = eksArr.find(x => x.id === btn.dataset.editEks);
if (e) AdminPages._openExtracurricularModal(e);
};
});
container.querySelectorAll('[data-manage-students]').forEach(btn => {
btn.onclick = () => {
const e = eksArr.find(x => x.id === btn.dataset.manageStudents);
if (e) AdminPages._openExtracurricularStudentsModal(e, studentArr, classArr, container);
};
});
container.querySelectorAll('[data-del-eks]').forEach(btn => {
btn.onclick = async () => {
if (!confirm('Yakin hapus ekstrakurikuler ini?')) return;
await DB.deleteExtracurricular(btn.dataset.delEks);
AdminPages.renderExtracurriculars(container);
};
});
document.getElementById('form-eks').onsubmit = async (e) => {
e.preventDefault();
const id = document.getElementById('eks-id').value || null;
const existing = id ? ekskuls[id] : null;
await DB.saveExtracurricular(id, {
name: document.getElementById('eks-name').value.trim(),
order: parseInt(document.getElementById('eks-order').value) || 1,
teacherId: document.getElementById('eks-teacher').value || null,
schedule: document.getElementById('eks-schedule').value.trim() || null,
students: existing ? (existing.students || null) : null
});
App.closeModal('modal-eks');
AdminPages.renderExtracurriculars(container);
};
},
_extracurricularModal(guruArr) {
return `
<div class="modal-overlay" id="modal-eks">
<div class="modal">
<div class="modal-header">
<h3 class="modal-title" id="eks-modal-title">Tambah ekstrakurikuler</h3>
<button class="btn-icon" data-close-modal="modal-eks"><i class="ph ph-x"></i></button>
</div>
<form id="form-eks">
<div class="modal-body">
<input type="hidden" id="eks-id">
<div class="form-group">
<label>Nama ekstrakurikuler</label>
<input id="eks-name" required placeholder="Contoh: Hizbul Wathan (HW)">
</div>
<div class="form-group">
<label>Guru Pembina</label>
<select id="eks-teacher">
<option value="">-- Pilih Pembina (Opsional) --</option>
${guruArr.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label>Jadwal Latihan</label>
<input id="eks-schedule" placeholder="Contoh: Jumat, 13.00 - 14.30">
</div>
<div class="form-group">
<label>Urutan tampil</label>
<input id="eks-order" type="number" min="1" value="1">
</div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-eks">Batal</button>
<button type="submit" class="btn btn-primary">Simpan</button>
</div>
</form>
</div>
</div>`;
},
_openExtracurricularModal(existing, nextOrder) {
document.getElementById('eks-modal-title').innerText = existing ? 'Edit ekstrakurikuler' : 'Tambah ekstrakurikuler';
document.getElementById('eks-id').value = existing ? existing.id : '';
document.getElementById('eks-name').value = existing ? existing.name : '';
document.getElementById('eks-teacher').value = existing ? (existing.teacherId || '') : '';
document.getElementById('eks-schedule').value = existing ? (existing.schedule || '') : '';
document.getElementById('eks-order').value = existing ? existing.order : (nextOrder || 1);
document.getElementById('modal-eks').classList.add('active');
},
_extracurricularStudentsModal(classArr) {
const classOpts = classArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('');
return `
<div class="modal-overlay" id="modal-eks-students">
<div class="modal modal-lg">
<div class="modal-header">
<div>
<h3 class="modal-title" id="modal-eks-stu-title">Kelola Peserta Ekstrakurikuler</h3>
<p class="text-muted class-teaching-note" id="modal-eks-stu-sub">Pemetaan resmi murid peserta ekstrakurikuler (Data Kesiswaan)</p>
</div>
<button class="btn-icon" data-close-modal="modal-eks-students"><i class="ph ph-x"></i></button>
</div>
<div class="modal-body">
<input type="hidden" id="modal-eks-stu-id">
<div class="eks-students-filter-row">
<select id="modal-eks-class-filter" class="mapel-select-input">
<option value="">— Semua Kelas —</option>
${classOpts}
</select>
<input type="text" id="modal-eks-search" placeholder="Cari nama murid atau NIS..." class="mapel-select-input">
<span class="eks-badge-counter" id="modal-eks-count">0 Murid Terpilih</span>
</div>
<div class="card-actions-row">
<button type="button" class="btn btn-outline btn-sm" id="btn-eks-select-all"><i class="ph ph-check-square"></i> Pilih Semua Tampil</button>
<button type="button" class="btn btn-outline btn-sm" id="btn-eks-deselect-all"><i class="ph ph-square"></i> Batalkan Semua Tampil</button>
</div>
<div class="eks-students-list" id="modal-eks-students-list"></div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline" data-close-modal="modal-eks-students">Batal</button>
<button type="button" class="btn btn-primary" id="btn-save-eks-students"><i class="ph ph-floppy-disk"></i> Simpan Daftar Peserta</button>
</div>
</div>
</div>`;
},
_openExtracurricularStudentsModal(ekskul, studentArr, classArr, container) {
document.getElementById('modal-eks-stu-id').value = ekskul.id;
document.getElementById('modal-eks-stu-title').innerText = `Kelola Peserta: ${ekskul.name}`;
const selectedMap = { ...(ekskul.students || {}) };
const classMap = classArr.reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
const updateCount = () => {
const cnt = Object.keys(selectedMap).length;
document.getElementById('modal-eks-count').innerText = `${cnt} Murid Terpilih`;
};
const renderList = () => {
const filterClass = document.getElementById('modal-eks-class-filter').value;
const searchVal = document.getElementById('modal-eks-search').value.toLowerCase().trim();
const filtered = studentArr.filter(s => {
if (filterClass && s.classId !== filterClass) return false;
if (searchVal) {
const matchName = (s.name || '').toLowerCase().includes(searchVal);
const matchNis = (s.nis || '').includes(searchVal) || (s.nisn || '').includes(searchVal);
if (!matchName && !matchNis) return false;
}
return true;
});
const listCont = document.getElementById('modal-eks-students-list');
if (!filtered.length) {
listCont.innerHTML = '<p class="text-muted class-teaching-note">Tidak ada murid yang cocok dengan filter.</p>';
return;
}
listCont.innerHTML = filtered.map(s => {
const isChecked = !!selectedMap[s.id];
const className = classMap[s.classId] || s.classId || '-';
const idLabel = AppConfig.formatStudentIdentity(s.nis, s.nisn);
return `
<label class="eks-student-item">
<input type="checkbox" data-student-id="${s.id}" ${isChecked ? 'checked' : ''}>
<div class="eks-student-meta">
<span class="eks-student-name">${AppConfig.escapeHtml(s.name)}</span>
<span class="eks-student-sub">${AppConfig.escapeHtml(className)} · ${idLabel}</span>
</div>
</label>
`;
}).join('');
listCont.querySelectorAll('input[type="checkbox"]').forEach(chk => {
chk.onchange = (ev) => {
const sid = ev.target.dataset.studentId;
if (ev.target.checked) {
selectedMap[sid] = true;
} else {
delete selectedMap[sid];
}
updateCount();
};
});
};
document.getElementById('modal-eks-class-filter').value = '';
document.getElementById('modal-eks-search').value = '';
document.getElementById('modal-eks-class-filter').onchange = renderList;
document.getElementById('modal-eks-search').oninput = renderList;
document.getElementById('btn-eks-select-all').onclick = () => {
document.querySelectorAll('#modal-eks-students-list input[type="checkbox"]').forEach(chk => {
chk.checked = true;
selectedMap[chk.dataset.studentId] = true;
});
updateCount();
};
document.getElementById('btn-eks-deselect-all').onclick = () => {
document.querySelectorAll('#modal-eks-students-list input[type="checkbox"]').forEach(chk => {
chk.checked = false;
delete selectedMap[chk.dataset.studentId];
});
updateCount();
};
document.getElementById('btn-save-eks-students').onclick = async () => {
const btn = document.getElementById('btn-save-eks-students');
btn.disabled = true;
btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
const cleanStudents = Object.keys(selectedMap).length ? selectedMap : null;
await db.ref(`extracurriculars/${ekskul.id}/students`).set(cleanStudents);
btn.disabled = false;
btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Daftar Peserta';
App.closeModal('modal-eks-students');
AdminPages.renderExtracurriculars(container);
};
updateCount();
renderList();
document.getElementById('modal-eks-students').classList.add('active');
},
async renderAttendance(container) {
Router.setTitle('Pantau Disiplin Guru & Rekap Penggajian', 'Monitoring presensi harian dan rekapitulasi kehadiran bahan penggajian (cutoff 29 s/d 28).');
const today = new Date();
const pad = (n) => String(n).padStart(2, '0');
const defaultDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
const settings = await DB.getSettings();
const [allUsers, directoryData] = await Promise.all([
DB.getAllUsers(),
DB._readCollection ? DB._readCollection('personnel/directory', {}) : Promise.resolve({})
]);
const teacherArr = DB.toArray(allUsers).filter(u => AppConfig.isTeacher(u) || AppConfig.isGTK(u));
const dirList = DB.toArray(directoryData);
const dirMap = {};
dirList.forEach(d => {
if (d.userId) dirMap[d.userId] = d;
const cleanName = (d.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
if (cleanName) dirMap[cleanName] = d;
});
const getEmployeeNbm = (u) => {
const cleanName = (u.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const match = dirMap[u.id] || dirMap[cleanName];
return (match && (match.nbm || match.nuptk)) || u.nbm || u.nuptk || u.nip || '-';
};
const getEmployeePos = (u) => {
const cleanName = (u.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const match = dirMap[u.id] || dirMap[cleanName];
return (match && match.position) || u.position || (AppConfig.isUserUmmi(u) ? 'Guru Ummi' : (u.role === 'tendik' ? 'Tenaga Kependidikan' : 'Guru'));
};
const calcCutoff = (refD) => AppConfig.getPayrollCutoffRange(refD);
let activeTab = 'payroll';
let currentCutoff = calcCutoff(today);
let selectedDailyDate = defaultDate;
const renderContent = async () => {
const [dailyAttData, rangeAttData] = await Promise.all([
DB.getTeacherAttendanceByDate(selectedDailyDate),
DB.getTeacherAttendanceRange(currentCutoff.startStr, currentCutoff.endStr)
]);
const dateKeys = Object.keys(rangeAttData || {}).sort();
let totalWorkDays = 0;
const cur = new Date(currentCutoff.sD);
while (cur <= currentCutoff.eD) {
if (cur.getDay() !== 0) totalWorkDays++;
cur.setDate(cur.getDate() + 1);
}
const recapRows = teacherArr.map((g, idx) => {
let onTime = 0, late = 0;
dateKeys.forEach(dk => {
const dayAtt = rangeAttData[dk] && rangeAttData[dk][g.id];
if (dayAtt && dayAtt.time_in) {
const isUmmi = AppConfig.isUserUmmi(g);
const sched = AppConfig.getAttendanceSchedule ? AppConfig.getAttendanceSchedule(settings.attendanceRules, isUmmi, dk) : null;
const isLate = sched && AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(dayAtt.time_in, sched) : false;
if (isLate) late++;
else onTime++;
}
});
const totalHadir = onTime + late;
const pct = totalWorkDays > 0 ? Math.min(100, Math.round((totalHadir / totalWorkDays) * 100)) : 100;
return {
idx: idx + 1,
id: g.id,
name: g.name,
nbm: getEmployeeNbm(g),
position: getEmployeePos(g),
workDays: totalWorkDays,
onTime,
late,
totalHadir,
pct
};
});
const avgPct = recapRows.length ? Math.round(recapRows.reduce((acc, r) => acc + r.pct, 0) / recapRows.length) : 100;
const totalLateAll = recapRows.reduce((acc, r) => acc + r.late, 0);
const totalHadirAll = recapRows.reduce((acc, r) => acc + r.totalHadir, 0);
const teacherDailyRows = teacherArr.map(g => {
const att = dailyAttData[g.id] || {};
const status = att.time_in ? (att.time_out ? 'Selesai' : 'Datang') : 'Belum hadir';
const timeIn = att.time_in || '-';
const timeOut = att.time_out || '-';
const isUmmi = AppConfig.isUserUmmi(g);
const sched = AppConfig.getAttendanceSchedule ? AppConfig.getAttendanceSchedule(settings.attendanceRules, isUmmi, selectedDailyDate) : null;
let lateBadge = '';
if (att.time_in && sched) {
const isLate = AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(att.time_in, sched) : false;
const lateReasonNote = att.late_reason ? `<br><small class="text-danger" style="font-size:11px;" title="Alasan/Banding"><em>"${AppConfig.escapeHtml(att.late_reason)}"</em></small>` : '';
lateBadge = isLate ? ` <span class="badge badge-warning">Terlambat</span>${lateReasonNote}` : ' <span class="badge badge-success">Tepat Waktu</span>';
}
const proofBtn = att.proof_url
? `<button type="button" class="btn btn-outline btn-sm mk-preview-btn" data-preview-url="${AppConfig.escapeHtml(att.proof_url)}" data-preview-title="Bukti Presensi ${AppConfig.escapeHtml(g.name)} (${selectedDailyDate})"><i class="ph ph-eye"></i> Lihat bukti</button>`
: '<span class="text-muted">Tidak ada bukti</span>';
return `
<tr>
<td><strong>${AppConfig.escapeHtml(g.name)}</strong><br><small class="text-muted">NBM: ${getEmployeeNbm(g)} · ${getEmployeePos(g)}</small></td>
<td><span class="badge ${att.time_in ? 'badge-success' : 'badge-warning'}">${status}</span>${lateBadge}</td>
<td>${timeIn}</td>
<td>${timeOut}</td>
<td>${proofBtn}</td>
</tr>
`;
}).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada data presensi guru.</td></tr>';
const recapTableRows = recapRows.map(r => `
<tr>
<td>${r.idx}</td>
<td><strong>${AppConfig.escapeHtml(r.name)}</strong></td>
<td>${r.nbm}</td>
<td>${AppConfig.escapeHtml(r.position)}</td>
<td class="text-center">${r.workDays}</td>
<td class="text-center text-success"><strong>${r.onTime}</strong></td>
<td class="text-center ${r.late > 0 ? 'text-warning' : ''}">${r.late}</td>
<td class="text-center"><strong>${r.totalHadir}</strong></td>
<td class="text-center"><span class="badge ${r.pct >= 90 ? 'badge-success' : (r.pct >= 75 ? 'badge-warning' : 'badge-danger')}">${r.pct}%</span></td>
</tr>
`).join('') || '<tr><td colspan="9" class="text-center text-muted">Belum ada data rekapitulasi.</td></tr>';
container.innerHTML = `
<div class="card" style="margin-bottom:16px;">
<div class="payroll-recap-header">
<div>
<h3 class="card-title" style="margin:0;">Pantau Disiplin GTK & Rekap Penggajian</h3>
<p class="text-muted" style="margin:4px 0 0 0;">Monitoring kehadiran guru & karyawan serta rekapitulasi presensi bahan penggajian cutoff tanggal 29 s/d 28.</p>
</div>
<div class="payroll-filter-bar">
<button class="btn btn-outline btn-sm" id="btn-export-payroll"><i class="ph ph-file-csv"></i> Ekspor Data Penggajian (TSV)</button>
<button class="btn btn-outline btn-sm" id="btn-print-recap"><i class="ph ph-printer"></i> Cetak Rekap</button>
</div>
</div>
<div class="payroll-tab-nav">
<button class="payroll-tab-btn ${activeTab === 'payroll' ? 'active' : ''}" id="tab-btn-payroll"><i class="ph ph-calculator"></i> Rekap Bahan Penggajian (Cutoff 29 - 28)</button>
<button class="payroll-tab-btn ${activeTab === 'daily' ? 'active' : ''}" id="tab-btn-daily"><i class="ph ph-calendar-check"></i> Presensi Harian GTK</button>
</div>
</div>
${activeTab === 'payroll' ? `
<div class="payroll-stat-grid">
<div class="payroll-stat-card">
<span class="payroll-stat-label">Total GTK Terdaftar</span>
<span class="payroll-stat-val">${teacherArr.length}</span>
</div>
<div class="payroll-stat-card">
<span class="payroll-stat-label">Hari Kerja Efektif</span>
<span class="payroll-stat-val">${totalWorkDays} hari</span>
</div>
<div class="payroll-stat-card">
<span class="payroll-stat-label">Rata-rata Disiplin</span>
<span class="payroll-stat-val text-success">${avgPct}%</span>
</div>
<div class="payroll-stat-card">
<span class="payroll-stat-label">Total Keterlambatan</span>
<span class="payroll-stat-val ${totalLateAll > 0 ? 'text-warning' : ''}">${totalLateAll} kali</span>
</div>
</div>
<div class="card" style="margin-bottom:20px;">
<div class="card-header">
<div>
<h3 class="card-title">Rekapitulasi Presensi Bahan Penggajian</h3>
<p class="text-muted" style="margin:4px 0 0 0; font-size:12px;">Periode Cutoff: <strong>${currentCutoff.startStr}</strong> s/d <strong>${currentCutoff.endStr}</strong></p>
</div>
<div class="payroll-filter-bar">
<div class="form-group" style="margin:0;">
<label style="font-size:11px; margin-bottom:2px; display:block;">Mulai Cutoff (29)</label>
<input type="date" id="input-cutoff-start" value="${currentCutoff.startStr}" class="form-control" style="font-size:12px; padding:4px 8px;">
</div>
<div class="form-group" style="margin:0;">
<label style="font-size:11px; margin-bottom:2px; display:block;">Selesai Cutoff (28)</label>
<input type="date" id="input-cutoff-end" value="${currentCutoff.endStr}" class="form-control" style="font-size:12px; padding:4px 8px;">
</div>
<button class="btn btn-primary btn-sm" id="btn-apply-cutoff" style="align-self:flex-end;"><i class="ph ph-magnifying-glass"></i> Terapkan</button>
</div>
</div>
<div class="table-responsive">
<table class="table" id="table-payroll-recap">
<thead>
<tr>
<th style="width:40px;">No</th>
<th>Nama Pegawai</th>
<th>NBM / NUPTK</th>
<th>Jabatan</th>
<th class="text-center">Hari Kerja</th>
<th class="text-center">Tepat Waktu</th>
<th class="text-center">Terlambat</th>
<th class="text-center">Total Hadir</th>
<th class="text-center">% Disiplin</th>
</tr>
</thead>
<tbody>${recapTableRows}</tbody>
</table>
</div>
</div>
` : `
<div class="card">
<div class="card-header">
<div>
<h3 class="card-title">Presensi Harian GTK</h3>
<p class="text-muted" style="margin:4px 0 0 0; font-size:12px;">Pilih tanggal untuk melihat detail kedatangan dan jam pulang.</p>
</div>
<div class="form-group" style="margin:0; min-width:200px;">
<input id="attendance-date-picker" type="date" value="${selectedDailyDate}" class="form-control">
</div>
</div>
<div class="table-responsive">
<table class="table">
<thead><tr><th>Nama Pegawai</th><th>Status</th><th>Datang</th><th>Pulang</th><th>Bukti</th></tr></thead>
<tbody>${teacherDailyRows}</tbody>
</table>
</div>
</div>
`}
`;
const tabPayroll = document.getElementById('tab-btn-payroll');
const tabDaily = document.getElementById('tab-btn-daily');
if (tabPayroll) tabPayroll.onclick = () => { activeTab = 'payroll'; renderContent(); };
if (tabDaily) tabDaily.onclick = () => { activeTab = 'daily'; renderContent(); };
const btnApplyCutoff = document.getElementById('btn-apply-cutoff');
if (btnApplyCutoff) {
btnApplyCutoff.onclick = () => {
const s = document.getElementById('input-cutoff-start').value;
const e = document.getElementById('input-cutoff-end').value;
if (s && e) {
currentCutoff = { startStr: s, endStr: e, sD: new Date(s), eD: new Date(e) };
renderContent();
}
};
}
const datePicker = document.getElementById('attendance-date-picker');
if (datePicker) {
datePicker.onchange = () => {
selectedDailyDate = datePicker.value || defaultDate;
renderContent();
};
}
const btnExport = document.getElementById('btn-export-payroll');
if (btnExport) {
btnExport.onclick = () => {
const headers = ['No', 'Nama Pegawai', 'NBM', 'Jabatan', 'Hari Kerja', 'Tepat Waktu', 'Terlambat', 'Total Hadir', 'Persen Disiplin'];
const lines = [headers.join('	')];
recapRows.forEach(r => {
lines.push([r.idx, r.name, r.nbm, r.position, r.workDays, r.onTime, r.late, r.totalHadir, `${r.pct}%`].join('	'));
});
const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `Rekap_Presensi_Penggajian_${currentCutoff.startStr}_sd_${currentCutoff.endStr}.tsv`;
a.click();
URL.revokeObjectURL(url);
};
}
const btnPrint = document.getElementById('btn-print-recap');
if (btnPrint) {
btnPrint.onclick = () => window.print();
}
};
await renderContent();
}
};
