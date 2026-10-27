(function () {
const ROLES = Object.freeze({
ADMIN: 'admin',
GURU: 'guru',
KEPSEK: 'kepsek',
ORTU: 'ortu',
FINANCE: 'finance',
CURRICULUM: 'curriculum',
STUDENT_AFFAIRS: 'studentAffairs',
PERSONNEL: 'personnel',
FACILITIES: 'facilities',
IT_ADMIN: 'it_admin',
GURU_EKSKUL: 'guruEkskul',
GURU_UMMI: 'guruUmmi',
KOMITE: 'komite',
TENDIK: 'tendik'
});
const PRIMARY_ROLES = Object.freeze({
[ROLES.GURU]: 'Guru / Pendidik',
[ROLES.GURU_UMMI]: 'Guru UMMI',
[ROLES.GURU_EKSKUL]: 'Guru Ekstrakurikuler',
[ROLES.TENDIK]: 'Tenaga Kependidikan',
[ROLES.KOMITE]: 'Komite Sekolah',
[ROLES.KEPSEK]: 'Kepala Sekolah',
[ROLES.ADMIN]: 'Administrator Sistem',
[ROLES.ORTU]: 'Orang Tua / Wali'
});
const UNIT_LABELS = Object.freeze({
'WAKA_HUMAS_PERSONALIA': 'Waka Humas & Personalia',
'STAF_HUMAS_PERSONALIA': 'Staf Humas & Personalia',
'WAKA_KEUANGAN': 'Waka Keuangan',
'STAF_KEUANGAN': 'Staf Keuangan',
'WAKA_KURIKULUM': 'Waka Kurikulum',
'STAF_KURIKULUM': 'Staf Kurikulum',
'WAKA_KESISWAAN': 'Waka Kesiswaan',
'STAF_KESISWAAN': 'Staf Kesiswaan',
'WAKA_SARPRAS': 'Waka Sarpras',
'STAF_SARPRAS': 'Staf Sarpras',
'TIM_IT': 'Tim IT & Sistem',
'KOORD_UMMI': 'Koordinator Ummi',
'TIM_UMMI': 'Tim Ummi',
'TIM_B_INGGRIS': 'Tim English Lab',
'GURU_EKSTRA_BADMINTON': 'Ekskul Badminton',
'GURU_EKSTRA_COOKING': 'Ekskul Cooking',
'GURU_EKSTRA_HAND_CRAFT': 'Ekskul Hand Craft',
'GURU_EKSTRA_HW': 'Pembina HW',
'GURU_EKSTRA_JAHIT_SULAM': 'Ekskul Jahit & Sulam',
'GURU_EKSTRA_LUKIS': 'Ekskul Lukis',
'GURU_EKSTRA_PANAHAN_PUTRA': 'Ekskul Panahan Putra',
'GURU_EKSTRA_PANAHAN_PUTRI': 'Ekskul Panahan Putri',
'GURU_EKSTRA_RENANG': 'Ekskul Renang',
'GURU_EKSTRA_SEMPOA': 'Ekskul Sempoa',
'GURU_EKSTRA_STORY_TELLING': 'Ekskul Story Telling',
'GURU_EKSTRA_TAHFIDZ_CAMP': 'Pembina Tahfidz Camp',
'GURU_EKSTRA_TARI': 'Ekskul Tari',
'GURU_EKSTRA_TS': 'Pembina Tapak Suci',
'GURU_MAPEL_PAI': 'Guru Mapel PAI',
'GURU_MAPEL_PJOK': 'Guru Mapel PJOK',
'GURU_MAPEL_B_INGGRIS': 'Guru Mapel B. Inggris',
'GURU_MAPEL_SENI': 'Guru Mapel Seni',
'GURU_MAPEL_TIK': 'Guru Mapel TIK'
});
function buildTeachingLabels(userId, classes = {}, subjects = {}) {
const subjMap = new Map();
const classList = Object.entries(classes || {});
const totalClasses = classList.length;
classList.forEach(([classId, classroom]) => {
const subjectTeachers = classroom?.subjectTeachers || {};
Object.entries(subjects || {}).forEach(([subjectId, subject]) => {
if (subjectTeachers[subjectId] !== userId || subject?.active === false) return;
if (!subjMap.has(subjectId)) {
subjMap.set(subjectId, {
name: subject.name,
order: subject.order || 0,
classes: []
});
}
const rawName = classroom.name || classId;
const shortName = rawName.split(' BINTI ')[0].split(' BIN ')[0].split(' ASH ')[0].trim();
subjMap.get(subjectId).classes.push({ id: classId, name: shortName });
});
});
if (!subjMap.size) return [];
return [...subjMap.values()]
.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'id'))
.map((item) => {
const cCount = item.classes.length;
if (cCount === totalClasses && totalClasses > 1) {
return `${item.name} (Semua Kelas)`;
}
if (cCount > 3) {
const grades = [...new Set(item.classes.map((c) => {
const m = c.id.match(/CLASS_(\d)_/);
return m ? parseInt(m[1], 10) : null;
}).filter(Boolean))].sort((x, y) => x - y);
if (grades.length > 1 && grades[grades.length - 1] - grades[0] === grades.length - 1) {
return `${item.name} (Kelas ${grades[0]}-${grades[grades.length - 1]})`;
}
return `${item.name} (${cCount} Rombel)`;
}
const names = item.classes.map((c) => c.name).join(', ');
return `${item.name} (${names})`;
});
}
const ROLE_LABELS = Object.freeze({
[ROLES.ADMIN]: 'Administrator',
[ROLES.GURU]: 'Guru / Wali Kelas',
[ROLES.KEPSEK]: 'Kepala Sekolah',
[ROLES.ORTU]: 'Orang Tua / Wali',
[ROLES.FINANCE]: 'Keuangan',
[ROLES.CURRICULUM]: 'Kurikulum',
[ROLES.STUDENT_AFFAIRS]: 'Kesiswaan',
[ROLES.PERSONNEL]: 'Humas & Personalia',
[ROLES.FACILITIES]: 'Sarpras',
[ROLES.IT_ADMIN]: 'IT Admin',
[ROLES.GURU_EKSKUL]: 'Guru Ekstrakurikuler',
[ROLES.GURU_UMMI]: 'Guru UMMI',
[ROLES.KOMITE]: 'Komite Sekolah',
[ROLES.TENDIK]: 'Tenaga Kependidikan'
});
const NAV_ITEMS = Object.freeze({
[ROLES.ADMIN]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Dashboard Sekolah' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' }
],
[ROLES.GURU]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' }
],
'GURU_UMUM': [
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' },
{ hash: '#/guru/academic', icon: 'ph-check-square', text: 'Input Nilai Mapel', group: 'Tugas Utama Guru' },
{ hash: '#/curriculum/syllabus', icon: 'ph-upload-simple', text: 'Upload Perangkat Ajar', group: 'Tugas Utama Guru' },
{ hash: '#/guru/portfolio', icon: 'ph-folder', text: 'Portofolio Guru', group: 'Tugas Utama Guru' },
{ hash: '#/guru/observations', icon: 'ph-note-pencil', text: 'Riwayat Observasi', group: 'Tugas Utama Guru' },
{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Tugas Utama Guru' },
{ hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Tugas Utama Guru' }
],
'WALI_KELAS': [
{ hash: '#/guru/student-attendance', icon: 'ph-users-three', text: 'Absensi Siswa', group: 'Tupoksi Wali Kelas' },
{ hash: '#/student-affairs/leaves', icon: 'ph-calendar-x', text: 'Perizinan Siswa Sakit/Izin', group: 'Tupoksi Wali Kelas' },
{ hash: '#/guru/classes', icon: 'ph-chalkboard-teacher', text: 'Kelas & E-Rapor Rombel', group: 'Tupoksi Wali Kelas' },
{ hash: '#/guru/additional', icon: 'ph-folder-plus', text: 'Data Tambahan Rapor', group: 'Tupoksi Wali Kelas' }
],
[ROLES.KEPSEK]: [
{ hash: '#/dashboard', icon: 'ph-chart-pie', text: 'Dashboard Kepala Sekolah' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' },
{ hash: '#/kepsek/reports', icon: 'ph-file-text', text: 'Laporan Kelas' },
{ hash: '#/curriculum', icon: 'ph-books', text: 'Monitoring Kurikulum' },
{ hash: '#/student-affairs', icon: 'ph-users-three', text: 'Monitoring Kesiswaan' },
{ hash: '#/finance', icon: 'ph-wallet', text: 'Monitoring Keuangan' },
{ hash: '#/personnel', icon: 'ph-briefcase', text: 'Monitoring Humas & Personalia' },
{ hash: '#/humas/official-travel', icon: 'ph-airplane-takeoff', text: 'Verifikasi Tugas Dinas', group: 'Monitoring Humas & Personalia' },
{ hash: '#/facilities', icon: 'ph-building-office', text: 'Monitoring Sarpras' },
{ hash: '#/komite/activities', icon: 'ph-users-three', text: 'Kegiatan Paguyuban', group: 'Monitoring Komite & Paguyuban' },
{ hash: '#/komite/finance-paguyuban', icon: 'ph-wallet', text: 'Keuangan Paguyuban', group: 'Monitoring Komite & Paguyuban' }
],
[ROLES.TENDIK]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' },
{ hash: '#/tendik/performance', icon: 'ph-clipboard-text', text: 'Laporan Kinerja', group: 'Tupoksi Tenaga Kependidikan' },
{ hash: '#/tendik/portfolio', icon: 'ph-folder', text: 'Portofolio', group: 'Tupoksi Tenaga Kependidikan' },
{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Tupoksi Tenaga Kependidikan' },
{ hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Tupoksi Tenaga Kependidikan' }
],
[ROLES.GURU_EKSKUL]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' }
],
[ROLES.GURU_UMMI]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' },
{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Guru Ummi' },
{ hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Guru Ummi' }
],
[ROLES.KOMITE]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
{ hash: '#/komite/activities', icon: 'ph-users-three', text: 'Kegiatan Paguyuban' },
{ hash: '#/komite/finance-paguyuban', icon: 'ph-wallet', text: 'Keuangan Paguyuban' }
],
[ROLES.ORTU]: [
{ hash: '#/dashboard', icon: 'ph-graduation-cap', text: 'Perkembangan Anak' },
{ hash: '#/parent/report-card', icon: 'ph-file-pdf', text: 'Rapor Digital Siswa' },
{ hash: '#/student-affairs/leaves', icon: 'ph-calendar-x', text: 'Permohonan Izin / Sakit' },
{ hash: '#/finance/student-bills', icon: 'ph-receipt', text: 'Riwayat Tagihan SPP' }
],
[ROLES.IT_ADMIN]: [
{ hash: '#/it-admin/dashboard', icon: 'ph-database', text: 'Sinkronisasi Data' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' }
],
[ROLES.PERSONNEL]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' }
],
[ROLES.FINANCE]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' }
],
[ROLES.STUDENT_AFFAIRS]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' }
],
[ROLES.CURRICULUM]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' }
],
[ROLES.FACILITIES]: [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' }
],
'WAKA_HUMAS_PERSONALIA': [
{ hash: '#/personnel', icon: 'ph-briefcase', text: 'Dashboard Humas & Personalia', group: 'Humas & Personalia: Administrasi SDM' },
{ hash: '#/admin/users', icon: 'ph-users', text: 'Kelola Pengguna', group: 'Humas & Personalia: Administrasi SDM' },
{ hash: '#/admin/assignments', icon: 'ph-clipboard-text', text: 'Distribusi Penugasan', group: 'Humas & Personalia: Administrasi SDM' },
{ hash: '#/personnel/data', icon: 'ph-folder-user', text: 'Data Kepegawaian', group: 'Humas & Personalia: Administrasi SDM' },
{ hash: '#/admin/attendance', icon: 'ph-clock', text: 'Pantau Disiplin Guru', group: 'Humas & Personalia: Kinerja & Portofolio' },
{ hash: '#/personnel/evaluations', icon: 'ph-chart-line-up', text: 'Penilaian Kinerja SDM', group: 'Humas & Personalia: Kinerja & Portofolio' },
{ hash: '#/personnel/portfolio', icon: 'ph-folder-star', text: 'Portofolio & Kompetensi', group: 'Humas & Personalia: Kinerja & Portofolio' },
{ hash: '#/humas/official-travel', icon: 'ph-airplane-takeoff', text: 'Verifikasi Tugas Dinas', group: 'Humas & Personalia: Kinerja & Portofolio' },
{ hash: '#/personnel/publications', icon: 'ph-megaphone', text: 'Publikasi & Informasi', group: 'Humas & Personalia: Komunikasi Publik & Aduan' },
{ hash: '#/personnel/complaints', icon: 'ph-chats', text: 'Layanan Pengaduan', group: 'Humas & Personalia: Komunikasi Publik & Aduan' },
{ hash: '#/personnel/documents', icon: 'ph-folder', text: 'Dokumen Kerja Sama', group: 'Humas & Personalia: Kemitraan & Dokumen' },
{ hash: '#/personnel/partnerships', icon: 'ph-handshake', text: 'Kemitraan & MoU', group: 'Humas & Personalia: Kemitraan & Dokumen' },
{ hash: '#/personnel/events', icon: 'ph-calendar-star', text: 'Manajemen Acara', group: 'Humas & Personalia: Kemitraan & Dokumen' },
{ hash: '#/komite/activities', icon: 'ph-users-three', text: 'Kegiatan Paguyuban', group: 'Humas & Personalia: Kemitraan & Dokumen' },
{ hash: '#/komite/finance-paguyuban', icon: 'ph-wallet', text: 'Keuangan Paguyuban', group: 'Humas & Personalia: Kemitraan & Dokumen' }
],
'STAF_HUMAS_PERSONALIA': [
{ hash: '#/personnel', icon: 'ph-briefcase', text: 'Dashboard Humas & Personalia', group: 'Humas & Personalia: Administrasi SDM' },
{ hash: '#/personnel/data', icon: 'ph-folder-user', text: 'Data Kepegawaian', group: 'Humas & Personalia: Administrasi SDM' },
{ hash: '#/personnel/portfolio', icon: 'ph-folder-star', text: 'Portofolio & Kompetensi', group: 'Humas & Personalia: Kinerja & Portofolio' },
{ hash: '#/humas/official-travel', icon: 'ph-airplane-takeoff', text: 'Verifikasi Tugas Dinas', group: 'Humas & Personalia: Kinerja & Portofolio' },
{ hash: '#/personnel/publications', icon: 'ph-megaphone', text: 'Publikasi & Informasi', group: 'Humas & Personalia: Komunikasi Publik & Aduan' },
{ hash: '#/personnel/complaints', icon: 'ph-chats', text: 'Layanan Pengaduan', group: 'Humas & Personalia: Komunikasi Publik & Aduan' },
{ hash: '#/personnel/documents', icon: 'ph-folder', text: 'Dokumen Kerja Sama', group: 'Humas & Personalia: Kemitraan & Dokumen' },
{ hash: '#/personnel/partnerships', icon: 'ph-handshake', text: 'Kemitraan & MoU', group: 'Humas & Personalia: Kemitraan & Dokumen' },
{ hash: '#/personnel/events', icon: 'ph-calendar-star', text: 'Manajemen Acara', group: 'Humas & Personalia: Kemitraan & Dokumen' },
{ hash: '#/komite/activities', icon: 'ph-users-three', text: 'Kegiatan Paguyuban', group: 'Humas & Personalia: Kemitraan & Dokumen' },
{ hash: '#/komite/finance-paguyuban', icon: 'ph-wallet', text: 'Keuangan Paguyuban', group: 'Humas & Personalia: Kemitraan & Dokumen' }
],
'WAKA_KESISWAAN': [
{ hash: '#/student-affairs', icon: 'ph-users-three', text: 'Dashboard Kesiswaan', group: 'Kesiswaan: Umum' },
{ hash: '#/student-affairs/ppdb', icon: 'ph-user-plus', text: 'Penerimaan Siswa Baru (SPMB / PPDB)', group: 'Kesiswaan: PPDB & Transisi' },
{ hash: '#/student-affairs/mpls', icon: 'ph-flag-banner', text: 'Masa Pengenalan (MPLS)', group: 'Kesiswaan: PPDB & Transisi' },
{ hash: '#/admin/characters', icon: 'ph-star', text: 'Indikator Karakter & Sikap', group: 'Kesiswaan: Karakter & Disiplin' },
{ hash: '#/student-affairs/rules', icon: 'ph-gavel', text: 'Tata Tertib & TPPK', group: 'Kesiswaan: Karakter & Disiplin' },
{ hash: '#/student-affairs/leaves', icon: 'ph-calendar-x', text: 'Perizinan Siswa Sakit/Izin', group: 'Kesiswaan: Karakter & Disiplin' },
{ hash: '#/admin/extracurriculars', icon: 'ph-trophy', text: 'Ekstrakurikuler', group: 'Kesiswaan: Bakat & Prestasi' },
{ hash: '#/student-affairs/achievements', icon: 'ph-medal', text: 'Lomba & Penghargaan', group: 'Kesiswaan: Bakat & Prestasi' },
{ hash: '#/admin/attendance', icon: 'ph-calendar-check', text: 'Pantau Kehadiran Siswa', group: 'Kesiswaan: Administrasi' },
{ hash: '#/student-affairs/scholarships', icon: 'ph-hand-coins', text: 'Data Beasiswa & PIP', group: 'Kesiswaan: Administrasi' },
{ hash: '#/student-affairs/alumni', icon: 'ph-graduation-cap', text: 'Penelusuran Alumni', group: 'Kesiswaan: Administrasi' }
],
'STAF_KESISWAAN': [
{ hash: '#/student-affairs', icon: 'ph-users-three', text: 'Dashboard Kesiswaan', group: 'Kesiswaan: Umum' },
{ hash: '#/student-affairs/ppdb', icon: 'ph-user-plus', text: 'Penerimaan Siswa Baru (SPMB / PPDB)', group: 'Kesiswaan: PPDB & Transisi' },
{ hash: '#/student-affairs/mpls', icon: 'ph-flag-banner', text: 'Masa Pengenalan (MPLS)', group: 'Kesiswaan: PPDB & Transisi' },
{ hash: '#/admin/characters', icon: 'ph-star', text: 'Indikator Karakter & Sikap', group: 'Kesiswaan: Karakter & Disiplin' },
{ hash: '#/student-affairs/rules', icon: 'ph-gavel', text: 'Tata Tertib & TPPK', group: 'Kesiswaan: Karakter & Disiplin' },
{ hash: '#/student-affairs/leaves', icon: 'ph-calendar-x', text: 'Perizinan Siswa Sakit/Izin', group: 'Kesiswaan: Karakter & Disiplin' },
{ hash: '#/student-affairs/achievements', icon: 'ph-medal', text: 'Lomba & Penghargaan', group: 'Kesiswaan: Bakat & Prestasi' },
{ hash: '#/student-affairs/scholarships', icon: 'ph-hand-coins', text: 'Data Beasiswa & PIP', group: 'Kesiswaan: Administrasi' },
{ hash: '#/student-affairs/alumni', icon: 'ph-graduation-cap', text: 'Penelusuran Alumni', group: 'Kesiswaan: Administrasi' }
],
'WAKA_KURIKULUM': [
{ hash: '#/curriculum', icon: 'ph-books', text: 'Dashboard Kurikulum', group: 'Kurikulum: Umum' },
{ hash: '#/admin/classes', icon: 'ph-users-three', text: 'Pembagian Rombel & Kelas', group: 'Kurikulum: Perencanaan' },
{ hash: '#/admin/subjects', icon: 'ph-book-bookmark', text: 'Pemetaan Mapel & Guru', group: 'Kurikulum: Perencanaan' },
{ hash: '#/curriculum/schedules', icon: 'ph-calendar', text: 'Jadwal Pelajaran & Kalender', group: 'Kurikulum: Perencanaan' },
{ hash: '#/curriculum/syllabus', icon: 'ph-folder-open', text: 'Perangkat & Modul Ajar', group: 'Kurikulum: Pelaksanaan KBM' },
{ hash: '#/curriculum/monitoring', icon: 'ph-eye', text: 'Pemantauan KBM', group: 'Kurikulum: Pelaksanaan KBM' },
{ hash: '#/curriculum/questions', icon: 'ph-file-code', text: 'Bank Soal', group: 'Kurikulum: Pelaksanaan KBM' },
{ hash: '#/curriculum/journals', icon: 'ph-notebook', text: 'Jurnal Pembelajaran', group: 'Kurikulum: Pelaksanaan KBM' },
{ hash: '#/admin/attendance', icon: 'ph-clock', text: 'Pantau Kehadiran', group: 'Kurikulum: Pelaksanaan KBM' },
{ hash: '#/curriculum/grades', icon: 'ph-exam', text: 'Rekapitulasi Nilai', group: 'Kurikulum: Supervisi & Evaluasi' },
{ hash: '#/curriculum/evaluations', icon: 'ph-exam', text: 'Sistem Penilaian', group: 'Kurikulum: Supervisi & Evaluasi' },
{ hash: '#/curriculum/supervision', icon: 'ph-chalkboard-teacher', text: 'Supervisi Guru', group: 'Kurikulum: Supervisi & Evaluasi' }
],
'STAF_KURIKULUM': [
{ hash: '#/curriculum', icon: 'ph-books', text: 'Dashboard Kurikulum', group: 'Kurikulum: Umum' },
{ hash: '#/curriculum/schedules', icon: 'ph-calendar', text: 'Jadwal Pelajaran & Kalender', group: 'Kurikulum: Perencanaan' },
{ hash: '#/curriculum/syllabus', icon: 'ph-folder-open', text: 'Perangkat & Modul Ajar', group: 'Kurikulum: Pelaksanaan KBM' },
{ hash: '#/curriculum/monitoring', icon: 'ph-eye', text: 'Pemantauan KBM', group: 'Kurikulum: Pelaksanaan KBM' },
{ hash: '#/curriculum/questions', icon: 'ph-file-code', text: 'Bank Soal', group: 'Kurikulum: Pelaksanaan KBM' },
{ hash: '#/curriculum/journals', icon: 'ph-notebook', text: 'Jurnal Pembelajaran', group: 'Kurikulum: Pelaksanaan KBM' },
{ hash: '#/curriculum/grades', icon: 'ph-exam', text: 'Rekapitulasi Nilai', group: 'Kurikulum: Supervisi & Evaluasi' }
],
'WAKA_KEUANGAN': [
{ hash: '#/finance', icon: 'ph-wallet', text: 'Dashboard Keuangan', group: 'Keuangan: Umum' },
{ hash: '#/finance/rkas', icon: 'ph-chart-bar', text: 'Penyusunan RKAS', group: 'Keuangan: Perencanaan' },
{ hash: '#/finance/transactions', icon: 'ph-arrows-left-right', text: 'Penerimaan & Pengeluaran', group: 'Keuangan: Pembukuan' },
{ hash: '#/finance/cashbook', icon: 'ph-book-open', text: 'Buku Kas Umum (BKU)', group: 'Keuangan: Pembukuan' },
{ hash: '#/finance/bos', icon: 'ph-receipt', text: 'Laporan BOS', group: 'Keuangan: BOS & Beasiswa' },
{ hash: '#/finance/scholarships', icon: 'ph-hand-coins', text: 'Pencairan Beasiswa & SPP', group: 'Keuangan: BOS & Beasiswa' },
{ hash: '#/finance/student-bills', icon: 'ph-receipt', text: 'Tagihan & SPP Siswa', group: 'Keuangan: BOS & Beasiswa' },
{ hash: '#/finance/salaries', icon: 'ph-money', text: 'Penghitungan Gaji', group: 'Keuangan: Penggajian & Kesejahteraan' },
{ hash: '#/admin/attendance', icon: 'ph-clock', text: 'Rekap Presensi Penggajian (29-28)', group: 'Keuangan: Penggajian & Kesejahteraan' },
{ hash: '#/finance/welfare', icon: 'ph-heart', text: 'Kesejahteraan Pegawai', group: 'Keuangan: Penggajian & Kesejahteraan' },
{ hash: '#/finance/proposals', icon: 'ph-file-text', text: 'Persetujuan Proposal', group: 'Keuangan: Penggajian & Kesejahteraan' },
{ hash: '#/finance/archives', icon: 'ph-archive-box', text: 'Arsip Bukti Transaksi', group: 'Keuangan: Dokumen & Laporan' },
{ hash: '#/finance/reports', icon: 'ph-file-text', text: 'LPJ & Sinkronisasi Kas', group: 'Keuangan: Dokumen & Laporan' },
{ hash: '#/komite/finance-paguyuban', icon: 'ph-wallet', text: 'Kas Paguyuban & Komite', group: 'Keuangan: Dokumen & Laporan' },
{ hash: '#/finance/transparency', icon: 'ph-projector-screen', text: 'Publikasi Anggaran', group: 'Keuangan: Dokumen & Laporan' }
],
'STAF_KEUANGAN': [
{ hash: '#/finance', icon: 'ph-wallet', text: 'Dashboard Keuangan', group: 'Keuangan: Umum' },
{ hash: '#/finance/transactions', icon: 'ph-arrows-left-right', text: 'Penerimaan & Pengeluaran', group: 'Keuangan: Pembukuan' },
{ hash: '#/finance/cashbook', icon: 'ph-book-open', text: 'Buku Kas Umum (BKU)', group: 'Keuangan: Pembukuan' },
{ hash: '#/finance/bos', icon: 'ph-receipt', text: 'Laporan BOS', group: 'Keuangan: BOS & Beasiswa' },
{ hash: '#/finance/scholarships', icon: 'ph-hand-coins', text: 'Pencairan Beasiswa & SPP', group: 'Keuangan: BOS & Beasiswa' },
{ hash: '#/finance/student-bills', icon: 'ph-receipt', text: 'Tagihan & SPP Siswa', group: 'Keuangan: BOS & Beasiswa' },
{ hash: '#/finance/welfare', icon: 'ph-heart', text: 'Kesejahteraan Pegawai', group: 'Keuangan: BOS & Beasiswa' },
{ hash: '#/finance/archives', icon: 'ph-archive-box', text: 'Arsip Bukti Transaksi', group: 'Keuangan: Dokumen & Laporan' },
{ hash: '#/finance/reports', icon: 'ph-file-text', text: 'LPJ & Sinkronisasi Kas', group: 'Keuangan: Dokumen & Laporan' },
{ hash: '#/komite/finance-paguyuban', icon: 'ph-wallet', text: 'Kas Paguyuban & Komite', group: 'Keuangan: Dokumen & Laporan' }
],
'WAKA_SARPRAS': [
{ hash: '#/facilities', icon: 'ph-building-office', text: 'Dashboard Sarpras', group: 'Sarpras: Inventarisasi' },
{ hash: '#/facilities/inventory', icon: 'ph-archive-box', text: 'Buku Inventaris (Aset)', group: 'Sarpras: Inventarisasi' },
{ hash: '#/facilities/dapodik', icon: 'ph-cloud-arrow-up', text: 'Data Sarpras Dapodik', group: 'Sarpras: Inventarisasi' },
{ hash: '#/facilities/planning', icon: 'ph-clipboard-text', text: 'Analisis Kebutuhan', group: 'Sarpras: Perencanaan & Pengadaan' },
{ hash: '#/facilities/rkas', icon: 'ph-shopping-cart', text: 'Rencana Pengadaan (RKAS)', group: 'Sarpras: Perencanaan & Pengadaan' },
{ hash: '#/facilities/maintenance', icon: 'ph-wrench', text: 'Perawatan Gedung & Sanitasi', group: 'Sarpras: Pemeliharaan & Keamanan' },
{ hash: '#/facilities/safety', icon: 'ph-shield-check', text: 'Pengecekan Keamanan Area', group: 'Sarpras: Pemeliharaan & Keamanan' },
{ hash: '#/facilities/electronics', icon: 'ph-desktop', text: 'Pemeliharaan Elektronik & IT', group: 'Sarpras: Pemeliharaan & Keamanan' },
{ hash: '#/facilities/loans', icon: 'ph-hand-pointing', text: 'Peminjaman Fasilitas', group: 'Sarpras: Pengawasan & Penghapusan' },
{ hash: '#/facilities/disposal', icon: 'ph-trash', text: 'Penghapusan Aset Rusak', group: 'Sarpras: Pengawasan & Penghapusan' }
],
'STAF_SARPRAS': [
{ hash: '#/facilities', icon: 'ph-building-office', text: 'Dashboard Sarpras', group: 'Sarpras: Inventarisasi' },
{ hash: '#/facilities/inventory', icon: 'ph-archive-box', text: 'Buku Inventaris (Aset)', group: 'Sarpras: Inventarisasi' },
{ hash: '#/facilities/maintenance', icon: 'ph-wrench', text: 'Perawatan Gedung & Sanitasi', group: 'Sarpras: Pemeliharaan & Keamanan' },
{ hash: '#/facilities/safety', icon: 'ph-shield-check', text: 'Pengecekan Keamanan Area', group: 'Sarpras: Pemeliharaan & Keamanan' },
{ hash: '#/facilities/electronics', icon: 'ph-desktop', text: 'Pemeliharaan Elektronik & IT', group: 'Sarpras: Pemeliharaan & Keamanan' },
{ hash: '#/facilities/loans', icon: 'ph-hand-pointing', text: 'Peminjaman Fasilitas', group: 'Sarpras: Pengawasan & Penghapusan' },
{ hash: '#/facilities/disposal', icon: 'ph-trash', text: 'Penghapusan Aset Rusak', group: 'Sarpras: Pengawasan & Penghapusan' }
],
'TIM_IT': [
{ hash: '#/it-admin/dashboard', icon: 'ph-monitor', text: 'Dashboard IT', group: 'IT & Sistem: Operasional' },
{ hash: '#/admin/users', icon: 'ph-users', text: 'Kelola Pengguna', group: 'IT & Sistem: Operasional' },
{ hash: '#/it-admin/sync', icon: 'ph-arrows-clockwise', text: 'Sinkronisasi Dapodik', group: 'IT & Sistem: Operasional' },
{ hash: '#/it-admin/backup', icon: 'ph-cloud-arrow-down', text: 'Backup & Restore Data', group: 'IT & Sistem: Basis Data' },
{ hash: '#/it-admin/logs', icon: 'ph-scroll', text: 'Log Audit Sistem', group: 'IT & Sistem: Basis Data' },
{ hash: '#/it-admin/network', icon: 'ph-wifi-high', text: 'Infrastruktur Jaringan', group: 'IT & Sistem: Jaringan' },
{ hash: '#/it-admin/integration', icon: 'ph-plugs', text: 'Integrasi API & CBT', group: 'IT & Sistem: Jaringan' }
],
'GURU_EKSTRA': [
{ hash: '#/guru/ekstra/syllabus', icon: 'ph-clipboard-text', text: 'Program Latihan', group: 'Guru Ekskul: Perencanaan' },
{ hash: '#/curriculum/syllabus', icon: 'ph-upload-simple', text: 'Perangkat & Modul Ajar', group: 'Guru Ekskul: Perencanaan' },
{ hash: '#/guru/ekstra/attendance', icon: 'ph-users-three', text: 'Presensi Peserta', group: 'Guru Ekskul: Pelaksanaan' },
{ hash: '#/guru/extracurriculars', icon: 'ph-trophy', text: 'Nilai E-Rapor Ekskul', group: 'Guru Ekskul: Evaluasi' },
{ hash: '#/guru/ekstra/talents', icon: 'ph-star', text: 'Pemetaan Siswa Berbakat', group: 'Guru Ekskul: Evaluasi' },
{ hash: '#/guru/portfolio', icon: 'ph-folder', text: 'Portofolio Pembina', group: 'Guru Ekskul: Pengembangan' },
{ hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Guru Ekskul: Pengembangan' }
],
'KOORD_UMMI': [
{ hash: '#/guru/ummi/koord/mapping', icon: 'ph-users-three', text: 'Pemetaan Rombel & Guru', group: 'Koordinator Ummi' },
{ hash: '#/guru/ummi/koord/exams', icon: 'ph-check-circle', text: 'Antrean Ujian Jilid/Munaqosyah', group: 'Koordinator Ummi' },
{ hash: '#/guru/ummi/koord/tasmi', icon: 'ph-microphone-stage', text: 'Plotting Guru Tasmi\'', group: 'Koordinator Ummi' }
],
'TIM_UMMI': [
{ hash: '#/guru/ummi/classes', icon: 'ph-chalkboard-teacher', text: 'Rombel Ummi Saya', group: 'Guru Ummi: Kelas & Capaian' },
{ hash: '#/guru/ummi/progress', icon: 'ph-book-open', text: 'Jurnal Harian Jilid', group: 'Guru Ummi: Kelas & Capaian' },
{ hash: '#/guru/ummi/tahfidz', icon: 'ph-book-bookmark', text: 'Setoran Tahfidz (Juz 30-1)', group: 'Guru Ummi: Tahfidz & Tasmi\'' },
{ hash: '#/guru/ummi/tasmi', icon: 'ph-headphones', text: 'Ujian Tasmi\' (Penguji)', group: 'Guru Ummi: Tahfidz & Tasmi\'' },
{ hash: '#/curriculum/syllabus', icon: 'ph-upload-simple', text: 'Perangkat & Modul Ummi', group: 'Guru Ummi: Administrasi' },
{ hash: '#/guru/portfolio', icon: 'ph-folder', text: 'Portofolio Guru Ummi', group: 'Guru Ummi: Administrasi' }
],
'TIM_B_INGGRIS': [
{ hash: '#/guru/english/classes', icon: 'ph-chalkboard-teacher', text: 'Rombel English Lab', group: 'English Lab' },
{ hash: '#/guru/english/progress', icon: 'ph-translate', text: 'Jurnal Progres Speaking', group: 'English Lab' }
]
});
const SCHEDULE_DAY_DEFS = Object.freeze({
gtk: Object.freeze([
{ key: 'senin', label: 'Senin', note: 'Batas Masuk 06.45 | Pulang 14.30', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '14:30', outEnd: '17:30' },
{ key: 'selasa', label: 'Selasa', note: 'Batas Masuk 06.45 | Pulang 15.15', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '15:15', outEnd: '17:30' },
{ key: 'rabu', label: 'Rabu', note: 'Batas Masuk 06.45 | Pulang 15.15', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '15:15', outEnd: '17:30' },
{ key: 'kamis', label: 'Kamis', note: 'Batas Masuk 06.45 | Pulang 14.45', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '14:45', outEnd: '17:30' },
{ key: 'jumat', label: 'Jumat', note: 'Batas Masuk 06.45 | Pulang 12.45', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '12:45', outEnd: '17:30' },
{ key: 'sabtu', label: 'Sabtu', note: 'Batas Masuk 08.00 | Opsional (Pembinaan)', status: 'optional', inStart: '07:00', inEnd: '08:00', outStart: '11:00', outEnd: '13:00' }
]),
ummi: Object.freeze([
{ key: 'senin', label: 'Senin', note: 'Batas Masuk 07.15 | Pulang 12.30', status: 'active', inStart: '06:00', inEnd: '07:15', outStart: '12:30', outEnd: '15:00' },
{ key: 'selasa', label: 'Selasa', note: 'Batas Masuk 07.15 | Pulang 12.30', status: 'active', inStart: '06:00', inEnd: '07:15', outStart: '12:30', outEnd: '15:00' },
{ key: 'rabu', label: 'Rabu', note: 'Batas Masuk 07.15 | Pulang 12.30', status: 'active', inStart: '06:00', inEnd: '07:15', outStart: '12:30', outEnd: '15:00' },
{ key: 'kamis', label: 'Kamis', note: 'Batas Masuk 07.00 | Pulang 12.00', status: 'active', inStart: '06:00', inEnd: '07:00', outStart: '12:00', outEnd: '15:00' },
{ key: 'jumat', label: 'Jumat', note: 'Libur (Tidak Ada Absen)', status: 'off', inStart: '06:00', inEnd: '07:00', outStart: '11:00', outEnd: '13:00' },
{ key: 'sabtu', label: 'Sabtu', note: 'Batas Masuk 08.00 | Opsional (Pembinaan Tanpa Terlambat)', status: 'optional', inStart: '06:00', inEnd: '08:00', outStart: '10:00', outEnd: '13:00' }
])
});
const DEFAULT_SETTINGS = Object.freeze({
currentAcademicYear: '2026/2027',
currentSemester: '1',
attendanceRules: Object.freeze({
scheduleVersion: 2,
checkInStart: '06:00',
checkInEnd: '06:45',
checkOutStart: '14:30',
checkOutEnd: '17:30',
attendanceStartDate: '',
attendanceEndDate: '',
schedules: Object.freeze({
gtk: Object.freeze({
senin: { inStart: '06:00', inEnd: '06:45', outStart: '14:30', outEnd: '17:30', isOff: false, isOptional: false },
selasa: { inStart: '06:00', inEnd: '06:45', outStart: '15:15', outEnd: '17:30', isOff: false, isOptional: false },
rabu: { inStart: '06:00', inEnd: '06:45', outStart: '15:15', outEnd: '17:30', isOff: false, isOptional: false },
kamis: { inStart: '06:00', inEnd: '06:45', outStart: '14:45', outEnd: '17:30', isOff: false, isOptional: false },
jumat: { inStart: '06:00', inEnd: '06:45', outStart: '12:45', outEnd: '17:30', isOff: false, isOptional: false },
sabtu: { inStart: '07:00', inEnd: '08:00', outStart: '11:00', outEnd: '13:00', isOff: false, isOptional: true },
minggu: { inStart: '06:00', inEnd: '07:00', outStart: '12:00', outEnd: '14:00', isOff: true, isOptional: true }
}),
ummi: Object.freeze({
senin: { inStart: '06:00', inEnd: '07:15', outStart: '12:30', outEnd: '15:00', isOff: false, isOptional: false },
selasa: { inStart: '06:00', inEnd: '07:15', outStart: '12:30', outEnd: '15:00', isOff: false, isOptional: false },
rabu: { inStart: '06:00', inEnd: '07:15', outStart: '12:30', outEnd: '15:00', isOff: false, isOptional: false },
kamis: { inStart: '06:00', inEnd: '07:00', outStart: '12:00', outEnd: '15:00', isOff: false, isOptional: false },
jumat: { inStart: '06:00', inEnd: '07:00', outStart: '11:00', outEnd: '13:00', isOff: true, isOptional: false },
sabtu: { inStart: '06:00', inEnd: '08:00', outStart: '10:00', outEnd: '13:00', isOff: false, isOptional: true, noLatePenalty: true },
minggu: { inStart: '06:00', inEnd: '07:00', outStart: '12:00', outEnd: '14:00', isOff: true, isOptional: true }
})
})
})
});
function escapeHtml(unsafe) {
if (unsafe == null) return '';
return String(unsafe)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}
function normalizeSettings(rawSettings = {}) {
const source = rawSettings || {};
const attendanceRules = source.attendanceRules || {};
const currentAcademicYear = source.currentAcademicYear || source.academicYear || DEFAULT_SETTINGS.currentAcademicYear;
const currentSemester = source.currentSemester || (source.semester === 'Genap' || source.semester === '2' ? '2' : '1');
const semesterName = currentSemester === '2' ? 'Genap' : 'Ganjil';
const hasSchedules = attendanceRules.schedules && typeof attendanceRules.schedules === 'object' && Object.keys(attendanceRules.schedules).length > 0;
const isAncientLegacy = attendanceRules.schedules?.gtk?.senin?.inStart === '06:30' && attendanceRules.schedules?.gtk?.senin?.outStart === '15:30' && (!attendanceRules.scheduleVersion || attendanceRules.scheduleVersion < 2);
let resolvedSchedules = (hasSchedules && !isAncientLegacy) ? attendanceRules.schedules : DEFAULT_SETTINGS.attendanceRules.schedules;
if (resolvedSchedules?.ummi?.senin?.outStart === '12:32') {
resolvedSchedules = JSON.parse(JSON.stringify(resolvedSchedules));
resolvedSchedules.ummi.senin.outStart = '12:30';
}
return {
...DEFAULT_SETTINGS,
...source,
academicYear: currentAcademicYear,
currentAcademicYear,
currentSemester,
semester: semesterName,
attendanceRules: {
...DEFAULT_SETTINGS.attendanceRules,
...attendanceRules,
scheduleVersion: 2,
checkInStart: attendanceRules.checkInStart || resolvedSchedules.gtk?.senin?.inStart || DEFAULT_SETTINGS.attendanceRules.checkInStart,
checkInEnd: attendanceRules.checkInEnd || resolvedSchedules.gtk?.senin?.inEnd || DEFAULT_SETTINGS.attendanceRules.checkInEnd,
checkOutStart: attendanceRules.checkOutStart || resolvedSchedules.gtk?.senin?.outStart || DEFAULT_SETTINGS.attendanceRules.checkOutStart,
checkOutEnd: attendanceRules.checkOutEnd || resolvedSchedules.gtk?.senin?.outEnd || DEFAULT_SETTINGS.attendanceRules.checkOutEnd,
schedules: resolvedSchedules
}
};
}
function toArray(value) {
if (!value) return [];
if (Array.isArray(value)) return value;
return Object.keys(value).map((key) => ({
id: key,
...value[key]
}));
}
function normalizeAssignments(assignments = []) {
if (!Array.isArray(assignments)) {
if (assignments) return [String(assignments)];
return [];
}
return [...new Set(assignments
.filter(Boolean)
.map((item) => String(item).trim())
.filter(Boolean))];
}
function getRoleLabel(role) {
return ROLE_LABELS[role] || 'Pengguna';
}
function formatUserName(user) {
if (!user) return 'Pengguna';
let name = user.name || 'Pengguna';
if (user.role === ROLES.ORTU) return name;
if (user.gender) {
if (user.gender === 'L' && !name.toLowerCase().startsWith('ustadz')) {
name = `Ustadz ${name}`;
} else if (user.gender === 'P' && !name.toLowerCase().startsWith('ustadz')) {
name = `Ustadzah ${name}`;
}
}
return name;
}
function getRoleAssignments(user = {}) {
if (!user || typeof user !== 'object') return [];
return normalizeAssignments(user.assignments || user.unitRoles || user.roles || []);
}
function hasAnyUnit(user = {}, units = []) {
const assignments = getRoleAssignments(user);
const unitList = Array.isArray(units) ? units : [units];
return unitList.some(u => assignments.includes(u));
}
function getAttendanceSchedule(rules = {}, isUmmi = false, date = new Date()) {
const r = rules || {};
const d = date instanceof Date ? date : new Date(date);
const dayNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const dayKey = dayNames[d.getDay()] || 'senin';
const groupKey = isUmmi ? 'ummi' : 'gtk';
const schedules = r.schedules || DEFAULT_SETTINGS.attendanceRules.schedules;
const groupSched = schedules[groupKey] || DEFAULT_SETTINGS.attendanceRules.schedules[groupKey] || {};
const defGroup = DEFAULT_SETTINGS.attendanceRules.schedules[groupKey] || {};
const daySched = groupSched[dayKey] || defGroup[dayKey] || {};
const isOff = daySched.isOff === true;
const isOptional = daySched.isOptional === true;
const noLatePenalty = daySched.noLatePenalty === true || (isOptional && isUmmi);
let label = '';
if (isOff) {
label = `${isUmmi ? 'Guru Ummi' : 'GTK'}: Hari Libur (Tidak Ada Presensi)`;
} else if (isOptional) {
label = isUmmi ? 'Guru Ummi: Sabtu Opsional (Pembinaan)' : 'GTK: Sabtu Opsional (Masuk 07.00-08.00 | Pulang Bebas)';
} else {
label = `${isUmmi ? 'Guru Ummi' : 'GTK'}: Masuk ${daySched.inStart}-${daySched.inEnd} | Pulang ${daySched.outStart}`;
}
return {
dayKey,
groupKey,
inStart: daySched.inStart || '06:00',
inEnd: daySched.inEnd || (groupKey === 'ummi' ? '07:15' : '06:45'),
outStart: daySched.outStart || (groupKey === 'ummi' ? '12:30' : '14:30'),
outEnd: daySched.outEnd || '17:30',
isOff,
isOptional,
noLatePenalty,
label
};
}
function isAttendanceLate(timeIn, sched) {
if (!timeIn || !sched) return false;
if (sched.isOff || sched.noLatePenalty) return false;
const limit = sched.inEnd || '06:45';
return timeIn > limit;
}
function calculateGradeSummary(chapters = [], sts1 = null, sas = null, sts2 = null, sat = null) {
const validCh = (chapters || []).filter(c => Number.isFinite(Number(c.score)) && Number(c.score) >= 75);
const phAvg = validCh.length ? Math.round(validCh.reduce((acc, c) => acc + Number(c.score), 0) / validCh.length) : null;
let bestChapter = null;
if (validCh.length) {
bestChapter = [...validCh].sort((a, b) => Number(b.score) - Number(a.score))[0];
}
const examNums = [phAvg, sts1, sas, sts2, sat].map(v => Number(v)).filter(v => Number.isFinite(v) && v >= 75);
const finalScore = examNums.length ? Math.round(examNums.reduce((a, b) => a + b, 0) / examNums.length) : null;
const defaultCp = bestChapter ? `Menunjukkan penguasaan sangat baik dalam ${bestChapter.cp || bestChapter.title || 'materi pembelajaran'}.` : '';
return {
ph: phAvg,
bestChapter,
finalScore,
defaultCp
};
}
function isAcademicTeachingAssignment(a) {
if (!a) return false;
return a.startsWith('GURU_KELAS_') || a.startsWith('GURU_MAPEL_');
}
function isTeachingAssignment(a) {
if (!a) return false;
const prefixes = ['GURU_KELAS_', 'GURU_MAPEL_', 'TIM_B_INGGRIS'];
return prefixes.some(prefix => a.startsWith(prefix));
}
function isUserUmmi(userOrRole, maybeAssignments) {
if (!userOrRole) return false;
const role = typeof userOrRole === 'object' ? userOrRole.role : userOrRole;
const assigns = typeof userOrRole === 'object' ? getRoleAssignments(userOrRole) : (maybeAssignments || []);
if (role === ROLES.GURU_UMMI) return true;
return assigns.some(a => a === 'TIM_UMMI' || a === 'KOORD_UMMI' || (typeof a === 'string' && a.startsWith('GURU_UMMI')));
}
function isUserEkstra(userOrRole, maybeAssignments) {
if (!userOrRole) return false;
const role = typeof userOrRole === 'object' ? userOrRole.role : userOrRole;
const assigns = typeof userOrRole === 'object' ? getRoleAssignments(userOrRole) : (maybeAssignments || []);
if (role === ROLES.GURU_EKSKUL) return true;
return assigns.some(a => typeof a === 'string' && a.startsWith('GURU_EKSTRA_'));
}
function isTeacher(userOrRole) {
if (!userOrRole) return false;
const role = typeof userOrRole === 'object' ? userOrRole.role : userOrRole;
if (role === ROLES.GURU || role === ROLES.GURU_UMMI || role === ROLES.GURU_EKSKUL) return true;
if (typeof userOrRole === 'object') {
return getRoleAssignments(userOrRole).some(isTeachingAssignment);
}
return false;
}
function isGTK(userOrRole) {
if (!userOrRole) return false;
const role = typeof userOrRole === 'object' ? userOrRole.role : userOrRole;
if (!role || role === ROLES.ORTU || role === ROLES.ADMIN || role === ROLES.KOMITE) return false;
return [ROLES.GURU, ROLES.GURU_UMMI, ROLES.GURU_EKSKUL, ROLES.TENDIK, ROLES.KEPSEK, ROLES.PERSONNEL, ROLES.FINANCE, ROLES.CURRICULUM, ROLES.STUDENT_AFFAIRS, ROLES.FACILITIES, ROLES.IT_ADMIN].includes(role);
}
function canAccessPersonalSalarySlip(userOrRole) {
return isGTK(userOrRole);
}
function isUserInRole(user = {}, targetRole = '') {
if (!targetRole) return true;
if (!user) return false;
if (targetRole === ROLES.GURU_UMMI) {
return isUserUmmi(user);
}
if (targetRole === ROLES.GURU_EKSKUL) {
return isUserEkstra(user);
}
if (targetRole === ROLES.GURU) {
return isTeacher(user);
}
return user.role === targetRole;
}
function isPureGuruEkstra(role, assignments = []) {
const list = Array.isArray(assignments) ? assignments : [];
const hasEkstra = isUserEkstra(role, list);
const hasAcademic = list.some(isAcademicTeachingAssignment);
return hasEkstra && !hasAcademic && role !== ROLES.TENDIK && role !== ROLES.ADMIN && role !== ROLES.KEPSEK;
}
function isPureGuruUmmi(role, assignments = []) {
const list = Array.isArray(assignments) ? assignments : [];
const hasUmmi = isUserUmmi(role, list);
const hasAcademic = list.some(isAcademicTeachingAssignment);
return hasUmmi && !hasAcademic && role !== ROLES.TENDIK && role !== ROLES.ADMIN && role !== ROLES.KEPSEK;
}
function getRoleAssignmentLabel(user = {}) {
const assignments = getRoleAssignments(user);
if (!assignments.length) return getRoleLabel(user.role);
const isPure = isPureGuruEkstra(user.role, assignments);
const isPureUmmi = isPureGuruUmmi(user.role, assignments);
const unitLabels = assignments.map((item) => {
if (UNIT_LABELS[item]) return UNIT_LABELS[item];
return item.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
}).join(', ');
let baseRole = getRoleLabel(user.role);
if (isPure) baseRole = 'Guru Ekstrakurikuler';
else if (isPureUmmi) baseRole = 'Guru UMMI';
return `${baseRole} · ${unitLabels}`;
}
function getRoleNav(role, assignments = []) {
let baseNav = [...(NAV_ITEMS[role] || [])];
const isEkstra = isUserEkstra(role, assignments);
const isPure = isPureGuruEkstra(role, assignments);
const isPureUmmi = isPureGuruUmmi(role, assignments);
const isGuru = !isPure && !isPureUmmi && (role === ROLES.GURU || assignments.some(isAcademicTeachingAssignment));
const isWaliKelas = assignments.some(a => a.startsWith('GURU_KELAS_'));
const isGuruEkstra = isEkstra;
const isTimUmmi = isUserUmmi(role, assignments);
const isTimInggris = assignments.some(a => a === 'TIM_B_INGGRIS');
if (isPureUmmi) {
baseNav = [
{ hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
{ hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' },
{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Guru Ummi: Administrasi' },
{ hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Guru Ummi: Administrasi' }
];
}
if (isGuru) {
baseNav = [...baseNav, ...(NAV_ITEMS['GURU_UMUM'] || [])];
}
if (isWaliKelas) {
baseNav = [...baseNav, ...(NAV_ITEMS['WALI_KELAS'] || [])];
}
if (isGuruEkstra) {
baseNav = [...baseNav, ...(NAV_ITEMS['GURU_EKSTRA'] || [])];
}
if (isTimUmmi) {
baseNav = [...baseNav, ...(NAV_ITEMS['TIM_UMMI'] || [])];
}
if (isTimInggris) {
baseNav = [...baseNav, ...(NAV_ITEMS['TIM_B_INGGRIS'] || [])];
}
if (role === ROLES.PERSONNEL) baseNav = [...baseNav, ...(NAV_ITEMS['WAKA_HUMAS_PERSONALIA'] || [])];
if (role === ROLES.FINANCE) baseNav = [...baseNav, ...(NAV_ITEMS['WAKA_KEUANGAN'] || [])];
if (role === ROLES.CURRICULUM) baseNav = [...baseNav, ...(NAV_ITEMS['WAKA_KURIKULUM'] || [])];
if (role === ROLES.STUDENT_AFFAIRS) baseNav = [...baseNav, ...(NAV_ITEMS['WAKA_KESISWAAN'] || [])];
if (role === ROLES.FACILITIES) baseNav = [...baseNav, ...(NAV_ITEMS['WAKA_SARPRAS'] || [])];
const unitAssignments = normalizeAssignments(assignments);
const unitNav = unitAssignments.flatMap((unit) => {
return NAV_ITEMS[unit] || [];
});
const merged = [...baseNav, ...unitNav];
const unique = merged.filter((item, index, arr) => arr.findIndex((entry) => entry.hash === item.hash) === index);
unique.push({ hash: '#/panduan', icon: 'ph-book-open', text: 'Panduan Aplikasi', group: 'Bantuan' });
return unique;
}
function getRoleBadgeClass(role) {
switch (role) {
case ROLES.ADMIN:
return 'badge-danger';
case ROLES.KEPSEK:
return 'badge-warning';
case ROLES.GURU:
return 'badge-success';
case ROLES.GURU_UMMI:
return 'badge-info';
case ROLES.GURU_EKSKUL:
return 'badge-primary';
case ROLES.TENDIK:
return 'badge-primary';
case ROLES.KOMITE:
return 'badge-info';
case ROLES.ORTU:
return 'badge-outline';
default:
return 'badge-outline';
}
}
function getAssignmentBadgeClass(assignment) {
if (!assignment) return 'badge-outline';
if (assignment.startsWith('WAKA_')) return 'badge-primary';
if (assignment.startsWith('KOORD_')) return 'badge-warning';
if (assignment.startsWith('TIM_')) return 'badge-success';
if (assignment.startsWith('STAF_')) return 'badge-outline';
if (assignment.startsWith('GURU_KELAS_')) return 'badge-outline';
if (assignment.startsWith('GURU_EKSTRA_')) return 'badge-outline';
return 'badge-outline';
}
function getStudentNis(student = {}) {
if (!student) return '';
return String(student.nis || student.noInduk || student.nomorInduk || '').trim();
}
function getStudentNisn(student = {}) {
if (!student) return '';
return String(student.nisn || '').trim();
}
function formatStudentIdentity(student = {}, format = 'inline') {
const nis = getStudentNis(student);
const nisn = getStudentNisn(student);
if (format === 'slash') {
if (nis && nisn) return `${nis} / ${nisn}`;
return nis || nisn || '-';
}
if (format === 'nis-only') {
return nis || '-';
}
if (format === 'nisn-only') {
return nisn || '-';
}
return `NIS: ${escapeHtml(nis || '-')} · NISN: ${escapeHtml(nisn || '-')}`;
}
function getClassPhase(classroom = {}, format = 'letter') {
let phase = '';
if (classroom && classroom.phase && typeof classroom.phase === 'string' && classroom.phase.trim() !== '' && classroom.phase.trim() !== '-') {
phase = classroom.phase.trim();
} else {
const raw = String((classroom && (classroom.name || classroom.id)) || '').trim();
const match = raw.match(/CLASS_(\d)_/) || raw.match(/^([1-6])\b/);
if (match) {
const grade = parseInt(match[1], 10);
if (grade === 1 || grade === 2) phase = 'A';
else if (grade === 3 || grade === 4) phase = 'B';
else if (grade === 5 || grade === 6) phase = 'C';
}
}
if (!phase || phase === '-') return '-';
if (format === 'full') {
return phase.startsWith('Fase ') ? phase : `Fase ${phase}`;
}
return phase.replace(/^Fase\s+/i, '');
}
const PAYROLL_CUTOFF_START = 29;
const PAYROLL_CUTOFF_END = 28;
function getPayrollCutoffRange(refDate) {
const d = refDate ? new Date(refDate) : new Date();
const y = d.getFullYear();
const m = d.getMonth();
const day = d.getDate();
let sD, eD;
if (day <= 28) {
sD = new Date(y, m - 1, 29);
eD = new Date(y, m, 28);
} else {
sD = new Date(y, m, 29);
eD = new Date(y, m + 1, 28);
}
const pad = (n) => String(n).padStart(2, '0');
return {
startStr: `${sD.getFullYear()}-${pad(sD.getMonth() + 1)}-${pad(sD.getDate())}`,
endStr: `${eD.getFullYear()}-${pad(eD.getMonth() + 1)}-${pad(eD.getDate())}`,
monthLabel: `${eD.toLocaleString('id-ID', { month: 'long' })} ${eD.getFullYear()}`,
cutoffLabel: `29 ${sD.toLocaleString('id-ID', { month: 'short' })} ${sD.getFullYear()} s/d 28 ${eD.toLocaleString('id-ID', { month: 'short' })} ${eD.getFullYear()}`,
sD,
eD
};
}
function resolveSalarySlipData(user, empProfile = {}, matchedSalary = null, attStats = {}, context = {}) {
const isUmmi = isUserUmmi(user);
const isEkstra = isUserEkstra(user);
const isTendik = Boolean(user && user.role === ROLES.TENDIK);
const name = (user && user.name) || empProfile.name || (user && user.displayName) || 'Pegawai';
const nbm = empProfile.nbm || empProfile.nuptk || (user && (user.nbm || user.nuptk || user.nip)) || '-';
let position = 'Guru Kelas/Mapel';
let empStatus = 'GTY';
if (isUmmi) {
position = (user && user.jabatan) || empProfile.position || 'Guru BTQ Ummi';
empStatus = empProfile.employmentStatus || (user && user.employmentStatus) || 'Guru Honorer Ummi';
} else if (isEkstra) {
position = (user && user.jabatan) || empProfile.position || 'Pembina Ekstrakurikuler';
empStatus = empProfile.employmentStatus || (user && user.employmentStatus) || 'Pembina Ekstrakurikuler';
} else if (isTendik) {
position = empProfile.position || (user && (user.position || user.jabatan)) || 'Tenaga Kependidikan';
empStatus = empProfile.employmentStatus || (user && user.employmentStatus) || 'Tenaga Kependidikan';
} else {
position = empProfile.position || (user && (user.position || user.jabatan)) || 'Guru Kelas/Mapel';
empStatus = empProfile.employmentStatus || (user && user.employmentStatus) || 'GTY';
}
const totalPresent = Number(attStats.totalPresent || 0);
const onTimeCount = Number(attStats.onTimeCount || 0);
const lateCount = Number(attStats.lateCount || 0);
const totalWorkDays = Number(attStats.totalWorkDays || 0);
if (matchedSalary) {
const basic = Number(matchedSalary.basicSalary || 0);
const func = Number(matchedSalary.functionalAllowance || 0);
const teach = Number(matchedSalary.teachingAllowance || 0);
const ded = Number(matchedSalary.deductions || 0);
const net = Number(matchedSalary.netSalary || (basic + func + teach - ded));
const statusText = matchedSalary.status || 'Disetujui Bagian Keuangan';
const badgeClass = statusText === 'Draft' ? 'badge-warning' : 'badge-success';
return {
isOfficial: true,
name,
nbm,
position,
empStatus,
statusText,
badgeClass,
totalPresent,
onTimeCount,
lateCount,
totalWorkDays,
basicSalary: basic,
basicLabel: isUmmi ? 'Honor Pokok Mengajar Ummi' : (isEkstra ? 'Honorarium Pembina Ekskul' : 'Gaji Pokok Kepegawaian'),
functionalAllowance: func,
functionalLabel: isUmmi ? 'Tunjangan Halaqah / Bimbingan Jilid' : 'Tunjangan Jabatan / Fungsional / Rombel',
teachingAllowance: teach,
teachingLabel: isUmmi ? `Tunjangan Disiplin Kehadiran Jam Ummi (${totalPresent} hari)` : `Tunjangan Jam Mengajar & Disiplin Kehadiran (${totalPresent} hari)`,
deductions: ded,
deductionLabel: 'Potongan (Infaq / Koperasi / Kasbon)',
grossSalary: basic + func + teach,
netSalary: net,
noticeText: 'Template slip gaji ini diterbitkan dan diverifikasi resmi oleh Bagian Keuangan SD Muhammadiyah 1 Sedati.'
};
}
let basic = 0, func = 0, teach = 0, ded = 0;
let basicLabel = '', funcLabel = '', teachLabel = '', deductionLabel = '';
if (isUmmi) {
const rombelCount = Math.max(1, Number(context.ummiClassesCount || 1));
basic = rombelCount * 250000;
basicLabel = `Honor Mengajar Ummi (${rombelCount} Kelompok Jilid)`;
func = 0;
funcLabel = 'Tunjangan Halaqah / Bimbingan Jilid';
teach = totalPresent * 20000;
teachLabel = `Tunjangan Disiplin Kehadiran Jam Ummi (${totalPresent} hari)`;
ded = 25000;
deductionLabel = 'Potongan Infaq / Dana Sosial';
} else if (isEkstra) {
basic = 400000;
basicLabel = 'Honorarium Pembina Ekstrakurikuler';
func = 0;
funcLabel = 'Tunjangan Pembinaan / Program';
teach = totalPresent * 25000;
teachLabel = `Tunjangan Pertemuan Ekstrakurikuler (${totalPresent} sesi)`;
ded = 25000;
deductionLabel = 'Potongan Infaq / Dana Sosial';
} else if (isTendik) {
basic = 2000000;
basicLabel = 'Gaji Pokok Tenaga Kependidikan';
func = 250000;
funcLabel = 'Tunjangan Beban Tugas Kependidikan';
teach = totalPresent * 25000;
teachLabel = `Tunjangan Disiplin Kehadiran Tendik (${totalPresent} hari)`;
ded = 50000;
deductionLabel = 'Potongan Infaq / Koperasi';
} else {
basic = 2200000;
basicLabel = 'Gaji Pokok Kepegawaian Guru';
func = 400000;
funcLabel = 'Tunjangan Jabatan / Wali Kelas / Fungsional';
teach = totalPresent * 25000;
teachLabel = `Tunjangan Jam Mengajar & Disiplin Kehadiran (${totalPresent} hari)`;
ded = 75000;
deductionLabel = 'Potongan Infaq / Koperasi';
}
const net = basic + func + teach - ded;
return {
isOfficial: false,
name,
nbm,
position,
empStatus,
statusText: 'Menunggu Penetapan Keuangan',
badgeClass: 'badge-warning',
totalPresent,
onTimeCount,
lateCount,
totalWorkDays,
basicSalary: basic,
basicLabel,
functionalAllowance: func,
functionalLabel: funcLabel,
teachingAllowance: teach,
teachingLabel: teachLabel,
deductions: ded,
deductionLabel,
grossSalary: basic + func + teach,
netSalary: net,
noticeText: 'Status Periode Ini: Belum Diterbitkan oleh Bagian Keuangan. Angka di bawah merupakan estimasi rincian berjalan berdasarkan rekap presensi dan tugas ajar. Slip gaji resmi diterbitkan setelah Bendahara Keuangan menyelesaikan rekapitulasi penggajian.'
};
}
const ATTENDANCE_MOTIVATIONS = Object.freeze([
{ text: 'Kasih sayang dan keikhlasan dalam mendidik adalah modal utama kemajuan umat.', author: 'KH. Ahmad Dahlan', category: 'Kutipan Tokoh', target: 'all' },
{ text: 'Siapa yang menempuh jalan untuk mencari ilmu, maka Allah akan mudahkan jalannya menuju surga.', author: 'HR. Muslim', category: 'Hadits Shahih', target: 'all' },
{ text: 'Allah akan meninggikan orang-orang yang beriman dan orang-orang yang diberi ilmu beberapa derajat.', author: 'QS. Al-Mujadilah: 11', category: 'Al-Qur\'an Karim', target: 'all' },
{ text: 'Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani. Jadilah teladan dan penyemangat hari ini!', author: 'Ki Hajar Dewantara', category: 'Kutipan Tokoh', target: 'all' },
{ text: 'Mendidik satu insan dengan budi pekerti mulia lebih berharga daripada dunia dan segala isinya.', author: 'Ali bin Abi Thalib r.a.', category: 'Kutipan Sahabat', target: 'all' },
{ text: 'Pendidikan adalah senjata paling ampuh yang dapat Anda gunakan untuk mengubah dunia.', author: 'Nelson Mandela', category: 'Kutipan Tokoh', target: 'all' },
{ text: 'Kecantikan sejati seorang pendidik terpancar dari ketinggian adab dan ketulusan dalam mengamalkan ilmu.', author: 'Buya Hamka', category: 'Kutipan Tokoh', target: 'all' },
{ text: 'Setiap senyuman dan ketulusan yang Anda hadirkan hari ini adalah investasi masa depan generasi bangsa.', author: 'Semangat Pagi', category: 'Energi Positif', target: 'in' },
{ text: 'Pendidikan yang hebat lahir dari sinergi guru yang tangguh dan tenaga kependidikan yang tulus berdedikasi.', author: 'Apresiasi GTK', category: 'Apresiasi GTK', target: 'all' },
{ text: 'Awali presensi dengan niat mulia, jadikan ruang kelas dan ruang kerja kita sebagai ladang ibadah yang penuh berkah.', author: 'Niat Keikhlasan', category: 'Energi Positif', target: 'in' },
{ text: 'Anda mungkin tidak melihat hasilnya hari ini, tapi jejak kebaikan Anda akan membekas selamanya di hati para murid.', author: 'Dampak Nyata', category: 'Inspirasi', target: 'all' },
{ text: 'Mendidik bukan hanya mentransfer pengetahuan, tetapi menyalakan lentera karakter dan harapan baru setiap hari.', author: 'Fokus Proses', category: 'Inspirasi', target: 'all' },
{ text: 'Dari balik meja administrasi hingga ke depan ruang kelas, setiap peran Anda adalah kunci keunggulan sekolah.', author: 'Pahlawan Sekolah', category: 'Apresiasi GTK', target: 'all' },
{ text: 'Satu kalimat penyemangat dan keteladanan dari Anda hari ini dapat menerangi masa depan seorang murid.', author: 'Inspirasi Harian', category: 'Inspirasi', target: 'all' },
{ text: 'Tetaplah menjadi cahaya yang menuntun anak-anak bangsa menggapai mimpi dan cita-cita mulia mereka.', author: 'Refleksi Diri', category: 'Inspirasi', target: 'all' },
{ text: 'Sebaik-baik kalian adalah orang yang mempelajari Al-Qur\'an dan mengajarkannya kepada sesama.', author: 'HR. Bukhari', category: 'Hadits Shahih', target: 'all' },
{ text: 'Sekiranya hati kita suci dan ikhlas, niscaya kita tidak akan pernah jenuh mendampingi lentera kebaikan dan ilmu.', author: 'Utsman bin Affan r.a.', category: 'Kutipan Sahabat', target: 'all' },
{ text: 'Alhamdulillah atas seluruh dedikasi Anda hari ini. Semoga segala amal ibadah kita hari ini senantiasa di Ridhoi Allah SWT.', author: 'Doa & Syukur', category: 'Refleksi Sore', target: 'out' },
{ text: 'Terima kasih atas ilmu, keteladanan, dan ketulusan yang Anda curahkan hari ini. Selamat beristirahat dan berkumpul kembali bersama keluarga tercinta.', author: 'Apresiasi & Refleksi', category: 'Refleksi Sore', target: 'out' },
{ text: 'Lelahmu dalam mendidik dan melayani anak bangsa insyaAllah bernilai pahala jariyah. Semoga Allah SWT memberkahi setiap langkah pulang Anda.', author: 'Doa & Harapan', category: 'Refleksi Sore', target: 'out' }
]);
function getDailyAttendanceMotivation(options) {
const opts = options || {};
const type = opts.type || 'in';
let dateObj = new Date();
if (opts.date) {
const parts = String(opts.date).split('-');
if (parts.length === 3) {
dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
} else {
dateObj = new Date(opts.date);
}
}
const dayNumber = Math.floor(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()) / 86400000);
const pool = ATTENDANCE_MOTIVATIONS.filter(item => {
if (type === 'out') return item.target === 'out';
return item.target === 'in' || item.target === 'all';
});
const safePool = pool.length ? pool : ATTENDANCE_MOTIVATIONS;
const index = Math.abs(dayNumber) % safePool.length;
return safePool[index];
}
function getRandomAttendanceMotivation(options) {
return getDailyAttendanceMotivation(options);
}
function showAttendanceSuccessModal(options) {
const opts = options || {};
const type = opts.type || 'in';
const timeStr = opts.timeStr || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const user = opts.user || null;
const quote = opts.quote || getDailyAttendanceMotivation({ type, date: opts.date || opts.dateStr });
const typeLabel = type === 'out' ? 'Presensi Pulang' : 'Presensi Datang';
const now = new Date();
const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const dateFormatted = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
const oldModal = document.getElementById('modal-attendance-success');
if (oldModal) oldModal.remove();
const modal = document.createElement('div');
modal.id = 'modal-attendance-success';
modal.className = 'modal-overlay modal-attendance-overlay active';
modal.innerHTML = `<div class="modal modal-attendance-success"><div class="attendance-success-banner"><div class="attendance-success-icon-wrap"><i class="ph-bold ph-check-circle"></i></div><h3 class="attendance-success-title">${typeLabel} Berhasil!</h3><p class="attendance-success-time"><i class="ph ph-clock"></i> ${escapeHtml(timeStr)} WIB &bull; ${escapeHtml(dateFormatted)}</p></div><div class="attendance-quote-card"><div class="attendance-quote-header"><span class="attendance-quote-badge"><i class="ph-fill ph-quotes"></i> Mutiara Hari Ini</span><span class="attendance-quote-tag">${escapeHtml(quote.category || 'Inspirasi')}</span></div><blockquote class="attendance-quote-text">“${escapeHtml(quote.text)}”</blockquote><div class="attendance-quote-author"><i class="ph ph-user-circle"></i><span class="attendance-quote-name">${escapeHtml(quote.author)}</span></div></div><div class="modal-footer attendance-success-footer"><button type="button" class="btn btn-primary btn-block" id="btn-close-attendance-modal"><i class="ph ph-arrow-right"></i> Lanjutkan Beraktivitas</button></div></div>`;
document.body.appendChild(modal);
const closeModal = () => {
modal.classList.remove('active');
setTimeout(() => {
if (modal.parentNode) modal.parentNode.removeChild(modal);
}, 200);
};
const closeBtn = modal.querySelector('#btn-close-attendance-modal');
if (closeBtn) closeBtn.onclick = closeModal;
modal.onclick = (e) => {
if (e.target === modal) closeModal();
};
const keyHandler = (e) => {
if (e.key === 'Escape') {
closeModal();
document.removeEventListener('keydown', keyHandler);
}
};
document.addEventListener('keydown', keyHandler);
return modal;
}
const SCHOOL_GEOFENCE = Object.freeze({
lat: -7.378448579234777,
lng: 112.75929775962251,
radiusMeters: 50
});
const ORIGINAL_SCHOOL_GEOFENCE = SCHOOL_GEOFENCE;
const APP_DEFAULTS = Object.freeze({
googleDriveUploadUrl: 'https://script.google.com/macros/s/AKfycbwHNSb34p_FcX_dTQuw87viaZ9joh2rT3KdtMLBVvwpocWzyF3HICPUPRfPuy63LDsNsw/exec',
attendanceWorkerUrl: 'https://musada-absensi.sisitusdotcom.workers.dev/',
attendanceGeofence: SCHOOL_GEOFENCE
});
const runtimeConfig = {
googleDriveUploadUrl: window.GOOGLE_DRIVE_UPLOAD_URL || APP_DEFAULTS.googleDriveUploadUrl,
attendanceWorkerUrl: window.CLOUDFLARE_ATTENDANCE_WORKER_URL || APP_DEFAULTS.attendanceWorkerUrl,
attendanceGeofence: SCHOOL_GEOFENCE
};
window.APP_ATTENDANCE_GEOFENCE = SCHOOL_GEOFENCE;
window.GOOGLE_DRIVE_UPLOAD_URL = runtimeConfig.googleDriveUploadUrl;
window.CLOUDFLARE_ATTENDANCE_WORKER_URL = runtimeConfig.attendanceWorkerUrl;
window.GOOGLE_DRIVE_CONFIG = Object.freeze({
uploadUrl: runtimeConfig.googleDriveUploadUrl,
attendanceWorkerUrl: runtimeConfig.attendanceWorkerUrl
});
const FINANCE_CATEGORIES = Object.freeze({
income: Object.freeze([
'SPP',
'Uang Kegiatan',
'Daftar Ulang',
'DPP',
'Buku',
'Seragam',
'Extrakurikuler',
'Catering',
'Antar Jemput',
'Lainnya'
]),
expense: Object.freeze([
'Kepala Sekolah',
'Bidang Kurikulum',
'Bidang Kesiswaan',
'Bidang Sarana Prasarana',
'Bidang Humas Personalia Perkaderan',
'Bidang Keuangan',
'Honorarium',
'Donasi'
])
});
function getFinanceCategories(type = 'income') {
const normalized = String(type || '').toLowerCase().trim();
if (normalized === 'expense' || normalized === 'pengeluaran') {
return [...FINANCE_CATEGORIES.expense];
}
return [...FINANCE_CATEGORIES.income];
}
function getAllFinanceCategories() {
return [...new Set([...FINANCE_CATEGORIES.income, ...FINANCE_CATEGORIES.expense])];
}
function resolveFinanceAccounts(entry = {}) {
const isExp = String(entry?.type || '').toLowerCase() === 'expense';
const method = String(entry?.method || 'Tunai');
let cashAcc = { code: '1-1001', name: 'Kas Tunai (Brankas)' };
if (method.includes('BOS')) cashAcc = { code: '1-1003', name: 'Bank Jatim (Kas BOS)' };
else if (method.includes('Bank') || method.includes('Transfer')) cashAcc = { code: '1-1002', name: 'Bank Jatim (Operasional)' };
let contraAcc = { code: isExp ? '5-9999' : '4-9999', name: isExp ? 'Beban Operasional Lainnya' : 'Pendapatan Lainnya' };
const cat = String(entry?.category || '').toLowerCase().trim();
if (!isExp) {
if (cat === 'spp') contraAcc = { code: '4-1010', name: 'Pendapatan SPP Siswa' };
else if (cat === 'uang kegiatan' || cat === 'kegiatan') contraAcc = { code: '4-1011', name: 'Pendapatan Uang Kegiatan' };
else if (cat === 'daftar ulang') contraAcc = { code: '4-1012', name: 'Pendapatan Daftar Ulang' };
else if (cat === 'dpp') contraAcc = { code: '4-1013', name: 'Pendapatan DPP Siswa' };
else if (cat === 'buku') contraAcc = { code: '4-1014', name: 'Pendapatan Buku Pembelajaran' };
else if (cat === 'seragam') contraAcc = { code: '4-1015', name: 'Pendapatan Seragam Sekolah' };
else if (cat === 'extrakurikuler' || cat === 'ekstrakurikuler') contraAcc = { code: '4-1016', name: 'Pendapatan Ekstrakurikuler' };
else if (cat === 'catering') contraAcc = { code: '4-1017', name: 'Pendapatan Layanan Catering' };
else if (cat === 'antar jemput') contraAcc = { code: '4-1018', name: 'Pendapatan Layanan Antar Jemput' };
else if (cat.includes('bos')) contraAcc = { code: '4-1020', name: 'Pendapatan Dana BOS' };
else if (cat.includes('donasi') || cat.includes('infaq')) contraAcc = { code: '4-1030', name: 'Pendapatan Infaq & Donasi' };
else contraAcc = { code: '4-1090', name: `Pendapatan ${entry?.category || 'Lainnya'}` };
} else {
if (cat === 'kepala sekolah') contraAcc = { code: '5-2001', name: 'Beban Program Kepala Sekolah' };
else if (cat === 'bidang kurikulum' || cat.includes('kurikulum')) contraAcc = { code: '5-2002', name: 'Beban Bidang Kurikulum' };
else if (cat === 'bidang kesiswaan' || cat.includes('kesiswaan')) contraAcc = { code: '5-2003', name: 'Beban Bidang Kesiswaan' };
else if (cat === 'bidang sarana prasarana' || cat.includes('sarpras') || cat.includes('sarana')) contraAcc = { code: '5-2004', name: 'Beban Sarana Prasarana' };
else if (cat === 'bidang humas personalia perkaderan' || cat.includes('humas') || cat.includes('personalia')) contraAcc = { code: '5-2005', name: 'Beban Humas Personalia & Perkaderan' };
else if (cat === 'bidang keuangan' || cat.includes('keuangan')) contraAcc = { code: '5-2006', name: 'Beban Operasional Bidang Keuangan' };
else if (cat === 'honorarium' || cat.includes('honor') || cat.includes('gaji')) contraAcc = { code: '5-1010', name: 'Beban Gaji & Honorarium GTK' };
else if (cat === 'donasi') contraAcc = { code: '5-3010', name: 'Beban Donasi & Sosial' };
else if (cat.includes('atk')) contraAcc = { code: '5-2010', name: 'Beban ATK & Pembelajaran' };
else if (cat.includes('listrik') || cat.includes('air') || cat.includes('internet')) contraAcc = { code: '5-2020', name: 'Beban Daya & Jasa' };
else if (cat.includes('santunan') || cat.includes('kesejahteraan')) contraAcc = { code: '5-2050', name: 'Beban Kesejahteraan GTK' };
else contraAcc = { code: '5-2090', name: `Beban ${entry?.category || 'Operasional'}` };
}
return {
debit: isExp ? contraAcc : cashAcc,
credit: isExp ? cashAcc : contraAcc
};
}
function formatRupiah(val, withPrefix = false) {
if (val === undefined || val === null || val === '') return '';
const cleanDigits = String(val).replace(/[^0-9]/g, '');
if (!cleanDigits) return '';
const num = parseInt(cleanDigits, 10);
const formatted = isNaN(num) ? '' : num.toLocaleString('id-ID');
return withPrefix ? (formatted ? `Rp ${formatted}` : '') : formatted;
}
function parseRupiah(val) {
if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
if (!val) return 0;
const cleanDigits = String(val).replace(/[^0-9]/g, '');
return cleanDigits ? parseInt(cleanDigits, 10) : 0;
}
function attachRupiahMask(input) {
if (!input || input.__rupiahMaskAttached) return;
input.__rupiahMaskAttached = true;
input.type = 'text';
input.inputMode = 'numeric';
input.autocomplete = 'off';
const formatInput = () => {
const rawVal = input.value;
const cleanDigits = rawVal.replace(/[^0-9]/g, '');
if (!cleanDigits) {
input.value = '';
return;
}
const num = parseInt(cleanDigits, 10);
const formatted = isNaN(num) ? '' : num.toLocaleString('id-ID');
const oldCursor = input.selectionStart;
const oldLen = rawVal.length;
input.value = formatted;
if (oldCursor !== null && document.activeElement === input) {
const newLen = formatted.length;
const diff = newLen - oldLen;
const newCursor = Math.max(0, oldCursor + diff);
input.setSelectionRange(newCursor, newCursor);
}
};
input.addEventListener('input', formatInput);
input.addEventListener('blur', () => {
if (input.value) formatInput();
});
if (input.value) formatInput();
}
function initRupiahInputs(container = document) {
if (!container) return;
const selector = 'input[data-type="money"], input.input-money, input.input-rupiah, input[data-currency="rupiah"]';
container.querySelectorAll(selector).forEach(attachRupiahMask);
}
window.AppConfig = Object.freeze({
formatRupiah,
parseRupiah,
attachRupiahMask,
initRupiahInputs,
FINANCE_CATEGORIES,
getFinanceCategories,
getAllFinanceCategories,
resolveFinanceAccounts,
ROLES,
PRIMARY_ROLES,
ROLE_LABELS,
UNIT_LABELS,
buildTeachingLabels,
NAV_ITEMS,
DEFAULT_SETTINGS,
SCHEDULE_DAY_DEFS,
APP_DEFAULTS,
escapeHtml,
normalizeSettings,
normalizeAssignments,
toArray,
getRoleLabel,
getRoleAssignments,
getRoleAssignmentLabel,
getRoleNav,
getRoleBadgeClass,
getAssignmentBadgeClass,
isTeachingAssignment,
isAcademicTeachingAssignment,
isUserUmmi,
isUserEkstra,
isTeacher,
isGTK,
canAccessPersonalSalarySlip,
isUserInRole,
isPureGuruEkstra,
isPureGuruUmmi,
formatUserName,
getStudentNis,
getStudentNisn,
formatStudentIdentity,
getClassPhase,
hasAnyUnit,
getAttendanceSchedule,
isAttendanceLate,
calculateGradeSummary,
PAYROLL_CUTOFF_START,
PAYROLL_CUTOFF_END,
getPayrollCutoffRange,
resolveSalarySlipData,
ATTENDANCE_MOTIVATIONS,
getDailyAttendanceMotivation,
getRandomAttendanceMotivation,
showAttendanceSuccessModal,
attendanceGeofence: SCHOOL_GEOFENCE,
SCHOOL_GEOFENCE,
ORIGINAL_SCHOOL_GEOFENCE
});
})();
