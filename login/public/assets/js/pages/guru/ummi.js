const UMMI_LEVELS = [
  'Pra-Jilid',
  'Jilid 1',
  'Jilid 2',
  'Jilid 3',
  'Jilid 4',
  'Jilid 5',
  'Jilid 6',
  'Al-Quran',
  'Gharibul Qur\'an',
  'Tajwid Dasar',
  'Pasca'
];
const UMMI_LEVEL_DESCS = {
  'Pra-Jilid': 'Pengenalan huruf hijaiyah dasar dan persiapan masuk jilid',
  'Jilid 1': 'Pengenalan huruf hijaiyah tunggal berbaris fathah, kasrah, dhammah, dan latihan dasar',
  'Jilid 2': 'Pengenalan bacaan panjang (mad thabi\'i) dan variasinya',
  'Jilid 3': 'Pengenalan bacaan tanwin, sukun, qalqalah, dan harakat panjang lainnya',
  'Jilid 4': 'Pengenalan tasydid, nun mati/tanwin bertemu huruf hijaiyah (idgham, ikhfa, izhhar, iqlab), dan hukum tajwid dasar',
  'Jilid 5': 'Pengenalan bacaan khusus, wakaf, dan pendalaman tajwid praktis',
  'Jilid 6': 'Pelancaran bacaan Al-Qur\'an dengan tartil dan persiapan langsung membaca Al-Qur\'an mushaf standar',
  'Al-Quran': 'Pelancaran tilawah mushaf Al-Qur\'an dengan tajwid dan fashahah',
  'Gharibul Qur\'an': 'Khusus membahas bacaan khusus (isymam, imalah, tashil, saktah)',
  'Tajwid Dasar': 'Panduan teori dan hukum ilmu tajwid praktis',
  'Pasca': 'Tingkat pasca-munaqasyah bagi santri yang telah lulus seluruh tingkatan Ummi untuk muraja\'ah dan tahfidz lanjutan'
};
const UMMI_SESSIONS = Object.freeze({
  '1': { id: '1', label: 'Sesi 1 (Kelas 1 - 2)', short: 'Sesi 1', badge: 'badge-info', grades: [1, 2], phase: 'Fase A' },
  '2': { id: '2', label: 'Sesi 2 (Kelas 3 - 4)', short: 'Sesi 2', badge: 'badge-primary', grades: [3, 4], phase: 'Fase B' },
  '3': { id: '3', label: 'Sesi 3 (Kelas 5 - 6)', short: 'Sesi 3', badge: 'badge-warning', grades: [5, 6], phase: 'Fase C' }
});
function getUmmiClassSession(cls) {
  if (cls && (cls.session === '1' || cls.session === '2' || cls.session === '3' || cls.session === 1 || cls.session === 2 || cls.session === 3)) {
    return String(cls.session);
  }
  const name = ((cls && cls.name) || '').toLowerCase();
  if (name.includes('kelas 1') || name.includes('kelas 2') || name.startsWith('1 ') || name.startsWith('2 ')) return '1';
  if (name.includes('kelas 3') || name.includes('kelas 4') || name.startsWith('3 ') || name.startsWith('4 ')) return '2';
  if (name.includes('kelas 5') || name.includes('kelas 6') || name.startsWith('5 ') || name.startsWith('6 ')) return '3';
  return '1';
}
function getSessionBadge(sessId, isShort = false) {
  const s = UMMI_SESSIONS[sessId] || UMMI_SESSIONS['1'];
  return `<span class="badge ${s.badge}"><i class="ph ph-clock"></i> ${isShort ? s.short : s.label}</span>`;
}
const UMMI_GRADES = [
  { score: 100, predicate: 'A+', label: '100 = A+ (Benar semua, kualitas baca bagus sekali = Naik ke halaman berikutnya)', action: 'Naik ke halaman berikutnya' },
  { score: 95, predicate: 'A', label: '95 = A (Benar semua, kualitas baca biasa-biasa = Naik ke halaman berikutnya)', action: 'Naik ke halaman berikutnya' },
  { score: 90, predicate: 'B+', label: '90 = B+ (Salah 1 kali, bisa membetulkan sendiri = Naik ke halaman berikutnya)', action: 'Naik ke halaman berikutnya' },
  { score: 85, predicate: 'B', label: '85 = B (Salah 2 kali, bisa membetulkan sendiri = Naik ke halaman berikutnya)', action: 'Naik ke halaman berikutnya' },
  { score: 80, predicate: 'B-', label: '80 = B- (Salah 3 kali, bisa membetulkan sendiri = Naik, tapi diulangi dulu halaman tsb)', action: 'Naik, tapi diulangi dulu halaman tsb' },
  { score: 75, predicate: 'C+', label: '75 = C+ (Salah 4 kali, bisa membetulkan sendiri = Belum boleh dinaikkan/diulangi lagi)', action: 'Belum boleh dinaikkan / diulangi lagi' },
  { score: 70, predicate: 'C', label: '70 = C (Salah 5 kali, bisa membetulkan sendiri = Belum boleh dinaikkan/diulangi lagi)', action: 'Belum boleh dinaikkan / diulangi lagi' }
];
const QURAN_SURAHS = [
  { no: 1, name: "Al-Fatihah", verses: 7, juz: [1] },
  { no: 2, name: "Al-Baqarah", verses: 286, juz: [1, 2, 3] },
  { no: 3, name: "Ali 'Imran", verses: 200, juz: [3, 4] },
  { no: 4, name: "An-Nisa'", verses: 176, juz: [4, 5, 6] },
  { no: 5, name: "Al-Ma'idah", verses: 120, juz: [6, 7] },
  { no: 6, name: "Al-An'am", verses: 165, juz: [7, 8] },
  { no: 7, name: "Al-A'raf", verses: 206, juz: [8, 9] },
  { no: 8, name: "Al-Anfal", verses: 75, juz: [9, 10] },
  { no: 9, name: "At-Taubah", verses: 129, juz: [10, 11] },
  { no: 10, name: "Yunus", verses: 109, juz: [11] },
  { no: 11, name: "Hud", verses: 123, juz: [11, 12] },
  { no: 12, name: "Yusuf", verses: 111, juz: [12, 13] },
  { no: 13, name: "Ar-Ra'd", verses: 43, juz: [13] },
  { no: 14, name: "Ibrahim", verses: 52, juz: [13] },
  { no: 15, name: "Al-Hijr", verses: 99, juz: [14] },
  { no: 16, name: "An-Nahl", verses: 128, juz: [14] },
  { no: 17, name: "Al-Isra'", verses: 111, juz: [15] },
  { no: 18, name: "Al-Kahf", verses: 110, juz: [15, 16] },
  { no: 19, name: "Maryam", verses: 98, juz: [16] },
  { no: 20, name: "Taha", verses: 135, juz: [16] },
  { no: 21, name: "Al-Anbiya'", verses: 112, juz: [17] },
  { no: 22, name: "Al-Hajj", verses: 78, juz: [17] },
  { no: 23, name: "Al-Mu'minun", verses: 118, juz: [18] },
  { no: 24, name: "An-Nur", verses: 64, juz: [18] },
  { no: 25, name: "Al-Furqan", verses: 77, juz: [18, 19] },
  { no: 26, name: "Asy-Syu'ara'", verses: 227, juz: [19] },
  { no: 27, name: "An-Naml", verses: 93, juz: [19, 20] },
  { no: 28, name: "Al-Qasas", verses: 88, juz: [20] },
  { no: 29, name: "Al-'Ankabut", verses: 69, juz: [20, 21] },
  { no: 30, name: "Ar-Rum", verses: 60, juz: [21] },
  { no: 31, name: "Luqman", verses: 34, juz: [21] },
  { no: 32, name: "As-Sajdah", verses: 30, juz: [21] },
  { no: 33, name: "Al-Ahzab", verses: 73, juz: [21, 22] },
  { no: 34, name: "Saba'", verses: 54, juz: [22] },
  { no: 35, name: "Fatir", verses: 45, juz: [22] },
  { no: 36, name: "Ya-Sin", verses: 83, juz: [22, 23] },
  { no: 37, name: "As-Saffat", verses: 182, juz: [23] },
  { no: 38, name: "Sad", verses: 88, juz: [23] },
  { no: 39, name: "Az-Zumar", verses: 75, juz: [23, 24] },
  { no: 40, name: "Ghafir", verses: 85, juz: [24] },
  { no: 41, name: "Fussilat", verses: 54, juz: [24, 25] },
  { no: 42, name: "Asy-Syura", verses: 53, juz: [25] },
  { no: 43, name: "Az-Zukhruf", verses: 89, juz: [25] },
  { no: 44, name: "Ad-Dukhan", verses: 59, juz: [25] },
  { no: 45, name: "Al-Jasiyah", verses: 37, juz: [25] },
  { no: 46, name: "Al-Ahqaf", verses: 35, juz: [26] },
  { no: 47, name: "Muhammad", verses: 38, juz: [26] },
  { no: 48, name: "Al-Fath", verses: 29, juz: [26] },
  { no: 49, name: "Al-Hujurat", verses: 18, juz: [26] },
  { no: 50, name: "Qaf", verses: 45, juz: [26] },
  { no: 51, name: "Az-Zariyat", verses: 60, juz: [26, 27] },
  { no: 52, name: "At-Tur", verses: 49, juz: [27] },
  { no: 53, name: "An-Najm", verses: 62, juz: [27] },
  { no: 54, name: "Al-Qamar", verses: 55, juz: [27] },
  { no: 55, name: "Ar-Rahman", verses: 78, juz: [27] },
  { no: 56, name: "Al-Waqi'ah", verses: 96, juz: [27] },
  { no: 57, name: "Al-Hadid", verses: 29, juz: [27] },
  { no: 58, name: "Al-Mujadilah", verses: 22, juz: [28] },
  { no: 59, name: "Al-Hasyr", verses: 24, juz: [28] },
  { no: 60, name: "Al-Mumtahanah", verses: 13, juz: [28] },
  { no: 61, name: "As-Saff", verses: 14, juz: [28] },
  { no: 62, name: "Al-Jumu'ah", verses: 11, juz: [28] },
  { no: 63, name: "Al-Munafiqun", verses: 11, juz: [28] },
  { no: 64, name: "At-Taghabun", verses: 18, juz: [28] },
  { no: 65, name: "At-Talaq", verses: 12, juz: [28] },
  { no: 66, name: "At-Tahrim", verses: 12, juz: [28] },
  { no: 67, name: "Al-Mulk", verses: 30, juz: [29] },
  { no: 68, name: "Al-Qalam", verses: 52, juz: [29] },
  { no: 69, name: "Al-Haqqah", verses: 52, juz: [29] },
  { no: 70, name: "Al-Ma'arij", verses: 44, juz: [29] },
  { no: 71, name: "Nuh", verses: 28, juz: [29] },
  { no: 72, name: "Al-Jinn", verses: 28, juz: [29] },
  { no: 73, name: "Al-Muzzammil", verses: 20, juz: [29] },
  { no: 74, name: "Al-Muddassir", verses: 56, juz: [29] },
  { no: 75, name: "Al-Qiyamah", verses: 40, juz: [29] },
  { no: 76, name: "Al-Insan", verses: 31, juz: [29] },
  { no: 77, name: "Al-Mursalat", verses: 50, juz: [29] },
  { no: 78, name: "An-Naba'", verses: 40, juz: [30] },
  { no: 79, name: "An-Nazi'at", verses: 46, juz: [30] },
  { no: 80, name: "'Abasa", verses: 42, juz: [30] },
  { no: 81, name: "At-Takwir", verses: 29, juz: [30] },
  { no: 82, name: "Al-Infitar", verses: 19, juz: [30] },
  { no: 83, name: "Al-Muthaffifin", verses: 36, juz: [30] },
  { no: 84, name: "Al-Insyiqaq", verses: 25, juz: [30] },
  { no: 85, name: "Al-Buruj", verses: 22, juz: [30] },
  { no: 86, name: "At-Tariq", verses: 17, juz: [30] },
  { no: 87, name: "Al-A'la", verses: 19, juz: [30] },
  { no: 88, name: "Al-Ghasyiyah", verses: 26, juz: [30] },
  { no: 89, name: "Al-Fajr", verses: 30, juz: [30] },
  { no: 90, name: "Al-Balad", verses: 20, juz: [30] },
  { no: 91, name: "Asy-Syams", verses: 15, juz: [30] },
  { no: 92, name: "Al-Lail", verses: 21, juz: [30] },
  { no: 93, name: "Ad-Duha", verses: 11, juz: [30] },
  { no: 94, name: "Asy-Syarh", verses: 8, juz: [30] },
  { no: 95, name: "At-Tin", verses: 8, juz: [30] },
  { no: 96, name: "Al-'Alaq", verses: 19, juz: [30] },
  { no: 97, name: "Al-Qadr", verses: 5, juz: [30] },
  { no: 98, name: "Al-Bayyinah", verses: 8, juz: [30] },
  { no: 99, name: "Az-Zalzalah", verses: 8, juz: [30] },
  { no: 100, name: "Al-'Adiyat", verses: 11, juz: [30] },
  { no: 101, name: "Al-Qari'ah", verses: 11, juz: [30] },
  { no: 102, name: "At-Takasur", verses: 8, juz: [30] },
  { no: 103, name: "Al-'Asr", verses: 3, juz: [30] },
  { no: 104, name: "Al-Humazah", verses: 9, juz: [30] },
  { no: 105, name: "Al-Fil", verses: 5, juz: [30] },
  { no: 106, name: "Quraisy", verses: 4, juz: [30] },
  { no: 107, name: "Al-Ma'un", verses: 7, juz: [30] },
  { no: 108, name: "Al-Kausar", verses: 3, juz: [30] },
  { no: 109, name: "Al-Kafirun", verses: 6, juz: [30] },
  { no: 110, name: "An-Nasr", verses: 3, juz: [30] },
  { no: 111, name: "Al-Lahab", verses: 5, juz: [30] },
  { no: 112, name: "Al-Ikhlas", verses: 4, juz: [30] },
  { no: 113, name: "Al-Falaq", verses: 5, juz: [30] },
  { no: 114, name: "An-Nas", verses: 6, juz: [30] }
];
const UMMIPages = {
  async renderUmmiMapping(container) {
    Router.setTitle('Pemetaan Rombel & Guru Ummi', 'Atur pembagian rombel berbasis kemampuan santri lintas kelas dan pemetaan per sesi.');
    const [ummiClasses, users, allStudents, allClasses] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllUsers(),
      DB.getAllStudents(),
      DB.getClasses()
    ]);
    const locationRecommendations = DB.getUmmiRoomRecommendations ? DB.getUmmiRoomRecommendations(ummiClasses) : [];
    const classArr = DB.toArray(ummiClasses);
    const guruUmmi = DB.toArray(users).filter(u => AppConfig.isUserUmmi(u));
    const studentArr = DB.toArray(allStudents);
    const classArrAll = DB.toArray(allClasses);
    let totalSantriMapped = 0;
    const sessStats = { '1': { rombel: 0, santri: 0 }, '2': { rombel: 0, santri: 0 }, '3': { rombel: 0, santri: 0 } };
    classArr.forEach(c => {
      const sess = getUmmiClassSession(c);
      const cnt = Object.keys(c.students || {}).length;
      totalSantriMapped += cnt;
      if (sessStats[sess]) {
        sessStats[sess].rombel++;
        sessStats[sess].santri += cnt;
      }
    });
    let activeSession = 'all';
    let searchQuery = '';
    const renderTable = () => {
      const filtered = classArr.filter(c => {
        const sess = getUmmiClassSession(c);
        if (activeSession !== 'all' && sess !== activeSession) return false;
        if (searchQuery) {
          const teacher = guruUmmi.find(g => g.id === c.teacherId);
          const tName = teacher ? teacher.name.toLowerCase() : '';
          const cName = (c.name || '').toLowerCase();
          const rName = (c.room || '').toLowerCase();
          const lName = (c.level || '').toLowerCase();
          if (!cName.includes(searchQuery) && !tName.includes(searchQuery) && !rName.includes(searchQuery) && !lName.includes(searchQuery)) return false;
        }
        return true;
      });
      const tbody = container.querySelector('#ummi-mapping-tbody');
      if (!tbody) return;
      if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Tidak ada rombel ummi yang sesuai filter atau pencarian.</td></tr>';
        return;
      }
      tbody.innerHTML = filtered.map((c, idx) => {
        const teacher = guruUmmi.find(g => g.id === c.teacherId);
        const studentCount = Object.keys(c.students || {}).length;
        const sess = getUmmiClassSession(c);
        const lvlBadge = c.level === 'Pasca' ? '<span class="badge badge-success"><i class="ph ph-sparkle"></i> Pasca</span>' : `<span class="badge badge-primary">${AppConfig.escapeHtml(c.level || 'Jilid')}</span>`;
        return `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><strong>${AppConfig.escapeHtml(c.name)}</strong><br><small class="text-muted"><i class="ph ph-map-pin"></i> ${AppConfig.escapeHtml(c.room || 'Tempat belum diatur')}</small></td>
            <td>${getSessionBadge(sess)}</td>
            <td>${lvlBadge}</td>
            <td>${teacher ? AppConfig.escapeHtml(teacher.name) : '<span class="text-muted">Belum ditugaskan</span>'}</td>
            <td><span class="badge badge-outline">${studentCount} Santri</span></td>
            <td class="action-cell">
              <button class="btn btn-primary btn-sm" data-map-students="${c.id}" title="Petakan Santri"><i class="ph ph-users-three"></i> Petakan Santri</button>
              <button class="btn btn-outline btn-sm" data-edit-ummi="${c.id}" title="Edit Rombel"><i class="ph ph-pencil-simple"></i></button>
              <button class="btn btn-danger btn-sm" data-del-ummi="${c.id}" title="Hapus"><i class="ph ph-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');
      tbody.querySelectorAll('[data-map-students]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.mapStudents;
          const cls = classArr.find(c => c.id === id);
          if (!cls) return;
          UMMIPages._openMappingStudentsModal(cls, studentArr, classArrAll, container);
        };
      });
      tbody.querySelectorAll('[data-edit-ummi]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.editUmmi;
          const cls = classArr.find(c => c.id === id);
          if (!cls) return;
          document.getElementById('ummi-modal-title').innerText = 'Edit Rombel Ummi';
          document.getElementById('ummi-id').value = cls.id;
          document.getElementById('ummi-name').value = cls.name || '';
          document.getElementById('ummi-session').value = getUmmiClassSession(cls);
          document.getElementById('ummi-level').value = cls.level || 'Jilid 1';
          document.getElementById('ummi-teacher').value = cls.teacherId || '';
          document.getElementById('ummi-room').value = cls.room || '';
          document.getElementById('ummi-desc').value = cls.desc || '';
          App.openModal('modal-ummi');
        };
      });
      tbody.querySelectorAll('[data-del-ummi]').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.delUmmi;
          const cls = classArr.find(c => c.id === id);
          if (!confirm(`Hapus rombel Ummi "${cls ? cls.name : id}"? Data santri di rombel ini akan dibatalkan pemetaannya.`)) return;
          await DB.deleteUmmiClass(id);
          UMMIPages.renderUmmiMapping(container);
        };
      });
    };
    const guruOptions = guruUmmi.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('');
    const levelOptions = UMMI_LEVELS.map(lvl => `<option value="${lvl}">${lvl}${lvl === 'Pasca' ? ' (Tingkat Pasca Munaqosyah)' : ''}</option>`).join('');
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-books"></i></div>
          <div><p class="stat-value">${classArr.length}</p><p class="stat-label text-muted">Total Rombel (${totalSantriMapped} Santri)</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-student"></i></div>
          <div><p class="stat-value">${sessStats['1'].rombel}</p><p class="stat-label text-muted">Sesi 1 · Kls 1-2 (${sessStats['1'].santri} Santri)</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-users-three"></i></div>
          <div><p class="stat-value">${sessStats['2'].rombel}</p><p class="stat-label text-muted">Sesi 2 · Kls 3-4 (${sessStats['2'].santri} Santri)</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-graduation-cap"></i></div>
          <div><p class="stat-value">${sessStats['3'].rombel}</p><p class="stat-label text-muted">Sesi 3 · Kls 5-6 (${sessStats['3'].santri} Santri)</p></div>
        </div>
      </section>
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div>
            <h3 class="card-title">Daftar Rombel Ummi & Pemetaan Guru Pengampu</h3>
            <p class="text-muted">Rombel terbagi dalam 3 sesi jadwal (Fase A, B, C) berbasis kemampuan santri lintas kelas formal.</p>
          </div>
          <button class="btn btn-primary" id="btn-add-ummi"><i class="ph ph-plus"></i> Tambah Rombel Baru</button>
        </div>
        <div class="filter-pills" id="session-filter-pills">
          <button type="button" class="filter-pill active" data-filter-session="all"><i class="ph ph-stack"></i> Semua Sesi (${classArr.length})</button>
          <button type="button" class="filter-pill" data-filter-session="1"><i class="ph ph-sun-dim"></i> Sesi 1 (Kelas 1-2) · ${sessStats['1'].rombel}</button>
          <button type="button" class="filter-pill" data-filter-session="2"><i class="ph ph-sun"></i> Sesi 2 (Kelas 3-4) · ${sessStats['2'].rombel}</button>
          <button type="button" class="filter-pill" data-filter-session="3"><i class="ph ph-sun-horizon"></i> Sesi 3 (Kelas 5-6) · ${sessStats['3'].rombel}</button>
        </div>
        <div class="search-box tasmi-search-box">
          <i class="ph ph-magnifying-glass"></i>
          <input type="text" id="input-search-ummi" placeholder="Cari nama rombel, guru pengampu, tingkat jilid/pasca, atau ruang...">
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th class="text-center th-w45">No</th>
                <th>Nama Rombel & Tempat</th>
                <th>Sesi Pembelajaran</th>
                <th>Tingkat</th>
                <th>Guru Pengampu</th>
                <th>Jumlah Santri</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="ummi-mapping-tbody"></tbody>
          </table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-ummi">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="ummi-modal-title">Tambah Rombel Ummi</h3>
            <button class="btn-icon" data-close-modal="modal-ummi"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-ummi">
            <div class="modal-body">
              <input type="hidden" id="ummi-id">
              <div class="form-group">
                <label>Nama Rombel (Contoh: Ummi Kelas 1 - Ustadzah Aidah, Kelompok Pasca Munaqosyah)</label>
                <input type="text" id="ummi-name" required placeholder="Masukkan nama rombel...">
              </div>
              <div class="form-group">
                <label>Sesi Pembelajaran</label>
                <select id="ummi-session" required>
                  <option value="1">Sesi 1 (Kelas 1 - 2 / Fase A)</option>
                  <option value="2">Sesi 2 (Kelas 3 - 4 / Fase B)</option>
                  <option value="3">Sesi 3 (Kelas 5 - 6 / Fase C)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tingkat / Jilid Utama</label>
                <select id="ummi-level" required>
                  <option value="">— Pilih Tingkat —</option>
                  ${levelOptions}
                </select>
              </div>
              <div class="form-group">
                <label>Guru Pengampu (Ustadz / Ustadzah)</label>
                <select id="ummi-teacher" required>
                  <option value="">— Pilih Guru Ummi —</option>
                  ${guruOptions}
                </select>
              </div>
              <div class="form-group">
                <label>Tempat / Ruang Belajar (Di Lingkungan Sekolah)</label>
                <input type="text" id="ummi-room" list="rooms-list-options" placeholder="Pilih atau ketik ruang belajar...">
                <datalist id="rooms-list-options">
                  ${locationRecommendations.map(loc => `<option value="${AppConfig.escapeHtml(loc)}"></option>`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label>Keterangan / Jadwal Tambahan (Opsional)</label>
                <input type="text" id="ummi-desc" placeholder="Contoh: Setiap Senin s.d. Kamis pukul 07.15 - 08.15">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-ummi">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-ummi">Simpan Rombel</button>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-overlay" id="modal-ummi-mapping-students">
        <div class="modal modal-lg">
          <div class="modal-header">
            <div>
              <h3 class="modal-title" id="modal-map-stu-title">Pemetaan Santri Rombel</h3>
              <p class="text-muted" id="modal-map-stu-sub">Pilih santri lintas kelas formal untuk dikelompokkan ke rombel ini.</p>
            </div>
            <button class="btn-icon" data-close-modal="modal-ummi-mapping-students"><i class="ph ph-x"></i></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="modal-map-cls-id">
            <div class="ummi-map-filter-box">
              <div class="ummi-map-inputs-row">
                <select id="modal-map-class-filter" class="form-control form-control-sm">
                  <option value="">— Semua Kelas Formal —</option>
                  ${DB.toArray(allClasses).map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('')}
                </select>
                <div class="search-box ummi-map-search">
                  <i class="ph ph-magnifying-glass"></i>
                  <input type="text" id="modal-map-search" placeholder="Cari santri atau NIS...">
                </div>
              </div>
              <div class="ummi-map-actions-row">
                <div class="ummi-map-btn-group">
                  <button type="button" class="btn btn-outline btn-sm" id="btn-map-select-all"><i class="ph ph-check-square"></i> Pilih Semua</button>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-map-deselect-all"><i class="ph ph-square"></i> Batal Semua</button>
                </div>
                <span class="eks-badge-counter" id="modal-map-count">0 Terpilih</span>
              </div>
            </div>
            <div class="eks-students-list" id="modal-map-students-list"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-close-modal="modal-ummi-mapping-students">Batal</button>
            <button type="button" class="btn btn-primary" id="btn-save-map-students"><i class="ph ph-floppy-disk"></i> Simpan Pemetaan Santri</button>
          </div>
        </div>
      </div>
    `;
    container.querySelectorAll('[data-filter-session]').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('[data-filter-session]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeSession = btn.dataset.filterSession;
        renderTable();
      };
    });
    const searchInput = container.querySelector('#input-search-ummi');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTable();
      };
    }
    renderTable();
    document.getElementById('btn-add-ummi').onclick = () => {
      document.getElementById('ummi-modal-title').innerText = 'Tambah Rombel Ummi';
      document.getElementById('form-ummi').reset();
      document.getElementById('ummi-id').value = '';
      document.getElementById('ummi-room').value = '';
      document.getElementById('ummi-session').value = activeSession !== 'all' ? activeSession : '1';
      document.getElementById('ummi-level').value = 'Jilid 1';
      App.openModal('modal-ummi');
    };
    document.getElementById('form-ummi').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('ummi-id').value.trim();
      const name = document.getElementById('ummi-name').value.trim();
      const session = document.getElementById('ummi-session').value;
      const level = document.getElementById('ummi-level').value;
      const teacherId = document.getElementById('ummi-teacher').value;
      const room = document.getElementById('ummi-room').value.trim();
      const desc = document.getElementById('ummi-desc').value.trim();
      const btnSave = document.getElementById('btn-save-ummi');
      btnSave.disabled = true;
      btnSave.innerText = 'Menyimpan...';
      try {
        const data = {
          name,
          session,
          level,
          teacherId,
          room,
          desc,
          updatedAt: Date.now()
        };
        await DB.saveUmmiClass(id || null, data);
        if (typeof NotificationService !== 'undefined' && teacherId) {
          NotificationService.notifyUmmiMappingUpdated({
            className: data.name,
            room: data.room,
            teacherId: data.teacherId
          });
        }
        App.closeModal('modal-ummi');
        UMMIPages.renderUmmiMapping(container);
      } catch (err) {
        alert(err.message || 'Terjadi kesalahan saat menyimpan');
        btnSave.disabled = false;
        btnSave.innerText = 'Simpan Rombel';
      }
    };
  },
  _openMappingStudentsModal(cls, studentArr, classArr, container) {
    document.getElementById('modal-map-cls-id').value = cls.id;
    const sess = getUmmiClassSession(cls);
    const sessObj = UMMI_SESSIONS[sess] || UMMI_SESSIONS['1'];
    document.getElementById('modal-map-stu-title').innerText = `Petakan Santri: ${cls.name}`;
    document.getElementById('modal-map-stu-sub').innerText = `${sessObj.short || sessObj.label} · Tingkat ${cls.level || 'Ummi'}`;
    const selectedMap = { ...(cls.students || {}) };
    const classMap = classArr.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
    const updateCount = () => {
      const cnt = Object.keys(selectedMap).length;
      document.getElementById('modal-map-count').innerText = `${cnt} Terpilih`;
    };
    const classFilterSelect = document.getElementById('modal-map-class-filter');
    const targetGradeNums = sessObj.grades;
    const sessionMatchingClassIds = classArr.filter(c => {
      const g = Number(c.grade) || parseInt(c.name || '', 10) || 0;
      return targetGradeNums.includes(g);
    }).map(c => c.id);
    let classOptionsHtml = '<option value="">— Semua Kelas Formal (1 s/d 6) —</option>';
    classOptionsHtml += `<option value="__session__" selected>★ Sesuai ${sessObj.short || sessObj.label}</option>`;
    classArr.forEach(c => {
      classOptionsHtml += `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`;
    });
    classFilterSelect.innerHTML = classOptionsHtml;
    const renderList = () => {
      const filterClass = document.getElementById('modal-map-class-filter').value;
      const searchVal = document.getElementById('modal-map-search').value.toLowerCase().trim();
      const filtered = studentArr.filter(s => {
        if (filterClass === '__session__') {
          if (!sessionMatchingClassIds.includes(s.classId)) return false;
        } else if (filterClass && s.classId !== filterClass) {
          return false;
        }
        if (searchVal) {
          const matchName = (s.name || '').toLowerCase().includes(searchVal);
          const matchNis = (s.nis || '').includes(searchVal) || (s.nisn || '').includes(searchVal);
          if (!matchName && !matchNis) return false;
        }
        return true;
      });
      const listCont = document.getElementById('modal-map-students-list');
      if (!filtered.length) {
        listCont.innerHTML = '<p class="text-muted text-center empty-state-text">Tidak ada santri yang cocok dengan filter atau pencarian.</p>';
        return;
      }
      listCont.innerHTML = filtered.map(s => {
        const isChecked = !!selectedMap[s.id];
        const formalCls = classMap[s.classId];
        const className = formalCls ? formalCls.name : (s.classId || '-');
        const curLvl = s.ummiLevel || (cls.students && cls.students[s.id] && cls.students[s.id].level) || cls.level || 'Jilid';
        const idLabel = s.nis ? `NIS: ${s.nis}` : (s.nisn ? `NISN: ${s.nisn}` : '-');
        const lvlBadge = curLvl === 'Pasca' ? '<span class="badge badge-success badge-sm"><i class="ph ph-sparkle"></i> Pasca</span>' : `<strong class="text-primary">${AppConfig.escapeHtml(curLvl)}</strong>`;
        return `
          <label class="eks-student-item">
            <input type="checkbox" data-student-id="${s.id}" ${isChecked ? 'checked' : ''}>
            <div class="eks-student-meta">
              <span class="eks-student-name">${AppConfig.escapeHtml(s.name)}</span>
              <span class="eks-student-sub">${AppConfig.escapeHtml(className)} · ${idLabel} · ${lvlBadge}</span>
            </div>
          </label>
        `;
      }).join('');
      listCont.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.onchange = (ev) => {
          const sid = ev.target.dataset.studentId;
          const sObj = studentArr.find(x => x.id === sid);
          if (ev.target.checked) {
            selectedMap[sid] = {
              level: (sObj && sObj.ummiLevel) || cls.level || 'Jilid 1',
              enrolledAt: Date.now()
            };
          } else {
            delete selectedMap[sid];
          }
          updateCount();
        };
      });
    };
    document.getElementById('modal-map-search').value = '';
    document.getElementById('modal-map-class-filter').onchange = renderList;
    document.getElementById('modal-map-search').oninput = renderList;
    document.getElementById('btn-map-select-all').onclick = () => {
      document.querySelectorAll('#modal-map-students-list input[type="checkbox"]').forEach(chk => {
        chk.checked = true;
        const sid = chk.dataset.studentId;
        const sObj = studentArr.find(x => x.id === sid);
        selectedMap[sid] = {
          level: (sObj && sObj.ummiLevel) || cls.level || 'Jilid 1',
          enrolledAt: Date.now()
        };
      });
      updateCount();
    };
    document.getElementById('btn-map-deselect-all').onclick = () => {
      document.querySelectorAll('#modal-map-students-list input[type="checkbox"]').forEach(chk => {
        chk.checked = false;
        delete selectedMap[chk.dataset.studentId];
      });
      updateCount();
    };
    document.getElementById('btn-save-map-students').onclick = async () => {
      const btn = document.getElementById('btn-save-map-students');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      try {
        const cleanStudents = Object.keys(selectedMap).length ? selectedMap : null;
        await db.ref(`ummi_classes/${cls.id}/students`).set(cleanStudents);
        const enrolledIds = Object.keys(selectedMap);
        await Promise.all(enrolledIds.map(sid => {
          return db.ref(`students/${sid}`).update({
            ummiClassId: cls.id,
            ummiClassName: cls.name,
            ummiSession: sess
          });
        }));
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Pemetaan Santri';
        App.closeModal('modal-ummi-mapping-students');
        UMMIPages.renderUmmiMapping(container);
      } catch (err) {
        alert(err.message || 'Terjadi kesalahan saat menyimpan pemetaan santri');
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Pemetaan Santri';
      }
    };
    updateCount();
    renderList();
    App.openModal('modal-ummi-mapping-students');
  },
async renderUmmiClasses(container) {
    Router.setTitle('Rombel Ummi Saya', 'Daftar kelompok jilid dan santri binaan yang Anda ampu.');
    const uid = Auth.currentUser.uid;
    const [ummiClasses, allStudents, allClasses] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllStudents(),
      DB.getClasses()
    ]);
    const classArr = DB.toArray(ummiClasses);
    let myClasses = classArr.filter(c => c.teacherId === uid);
    if (!myClasses.length) {
      const assigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
      myClasses = classArr.filter(c => assigns.some(a => a.toLowerCase().includes(c.name.toLowerCase().replace(/[^a-z0-9]/g, ''))));
    }
    if (!myClasses.length) {
      container.innerHTML = `
        <div class="card section-block">
          <div class="card-body text-center">
            <div class="stat-icon stat-icon--warning" ><i class="ph ph-chalkboard-teacher"></i></div>
            <h3 class="card-title">Belum Ada Rombel Ditugaskan</h3>
            <p class="text-muted">Anda belum memiliki Rombel Ummi yang ditugaskan oleh Koordinator Ummi. Silakan hubungi Koordinator Ummi untuk pemetaan rombel santri.</p>
          </div>
        </div>
      `;
      return;
    }
    const studentMap = DB.toArray(allStudents).reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
    const gradeClassMap = DB.toArray(allClasses).reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
    const rombelCards = myClasses.map((cls, idx) => {
      const studentIds = Object.keys(cls.students || {});
      const studentsInRombel = studentIds.map(id => studentMap[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
      const studentRows = studentsInRombel.length ? studentsInRombel.map((s, sIdx) => {
        const cName = gradeClassMap[s.classId] || s.classId || '-';
        const stuLevel = s.ummiLevel || (cls.students[s.id] && cls.students[s.id].level) || cls.level || 'Jilid';
        return `
          <tr>
            <td class="text-center">${sIdx + 1}</td>
            <td><strong>${AppConfig.escapeHtml(s.name)}</strong></td>
            <td>${AppConfig.escapeHtml(cName)}</td>
            <td><span class="badge badge-success">${AppConfig.escapeHtml(stuLevel)}</span></td>
            <td class="action-cell">
              <a href="#/guru/ummi/progress?classId=${cls.id}&studentId=${s.id}" class="btn btn-primary btn-sm"><i class="ph ph-book-open"></i> Buka Jurnal</a>
              <button class="btn btn-outline btn-sm" data-req-exam="${s.id}" data-stu-name="${AppConfig.escapeHtml(s.name)}" data-cur-level="${AppConfig.escapeHtml(stuLevel)}" data-cls-id="${cls.id}"><i class="ph ph-arrow-circle-up"></i> Ajukan Tes</button>
            </td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="5" class="text-center text-muted">Belum ada santri terdaftar di rombel ini.</td></tr>';
      const mobileStudentCards = studentsInRombel.length ? studentsInRombel.map((s, sIdx) => {
        const cName = gradeClassMap[s.classId] || s.classId || '-';
        const stuLevel = s.ummiLevel || (cls.students[s.id] && cls.students[s.id].level) || cls.level || 'Jilid';
        return `
          <div class="ummi-student-item">
            <div class="ummi-student-item-top">
              <div class="ummi-student-item-title">
                <span class="ummi-student-num">${sIdx + 1}.</span>
                <strong>${AppConfig.escapeHtml(s.name)}</strong>
              </div>
              <span class="badge badge-success badge-sm">${AppConfig.escapeHtml(stuLevel)}</span>
            </div>
            <div class="ummi-student-item-sub">
              <span><i class="ph ph-chalkboard"></i> ${AppConfig.escapeHtml(cName)}</span>
            </div>
            <div class="ummi-student-item-actions">
              <a href="#/guru/ummi/progress?classId=${cls.id}&studentId=${s.id}" class="btn btn-primary btn-xs"><i class="ph ph-book-open"></i> Buka Jurnal</a>
              <button class="btn btn-outline btn-xs" data-req-exam="${s.id}" data-stu-name="${AppConfig.escapeHtml(s.name)}" data-cur-level="${AppConfig.escapeHtml(stuLevel)}" data-cls-id="${cls.id}"><i class="ph ph-arrow-circle-up"></i> Ajukan Tes</button>
            </div>
          </div>
        `;
      }).join('') : '<p class="text-muted text-center empty-state-text">Belum ada santri terdaftar di rombel ini.</p>';
      return `
        <div class="card section-spacer">
          <div class="card-header ummi-rombel-header">
            <div class="ummi-rombel-info">
              <div class="ummi-rombel-header-top">
                <h3 class="card-title">${idx + 1}. ${AppConfig.escapeHtml(cls.name)}</h3>
                ${getSessionBadge(getUmmiClassSession(cls))}
              </div>
              <p class="text-muted ummi-rombel-meta"><i class="ph ph-map-pin"></i> ${AppConfig.escapeHtml(cls.room || 'Tempat belum diatur')} &nbsp;·&nbsp; ${AppConfig.escapeHtml(cls.level || 'Jilid')} &nbsp;·&nbsp; ${studentsInRombel.length} Santri Binaan</p>
            </div>
            <div class="card-header-actions ummi-rombel-actions">
              <a href="#/guru/ummi/progress?classId=${cls.id}" class="btn btn-primary btn-sm"><i class="ph ph-book-open"></i> Jurnal Rombel Ini</a>
            </div>
          </div>
          <div class="ummi-students-desktop table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th class="table-col-sm text-center">No</th>
                  <th>Nama Santri</th>
                  <th>Kelas Formal</th>
                  <th>Tingkat Jilid</th>
                  <th class="table-col-action">Aksi Pembelajaran</th>
                </tr>
              </thead>
              <tbody>${studentRows}</tbody>
            </table>
          </div>
          <div class="ummi-students-mobile">
            ${mobileStudentCards}
          </div>
        </div>
      `;
    }).join('');
    container.innerHTML = `
      ${rombelCards}
      <div class="modal-overlay" id="modal-req-exam">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-req-title">Ajukan Tes Kenaikan Jilid</h3>
            <button class="btn-icon" data-close-modal="modal-req-exam"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-req-exam">
            <div class="modal-body">
              <input type="hidden" id="req-stu-id">
              <input type="hidden" id="req-cls-id">
              <div class="form-group">
                <label>Nama Santri</label>
                <input type="text" id="req-stu-name" readonly>
              </div>
              <div class="form-group">
                <label>Tingkat / Jilid Saat Ini</label>
                <input type="text" id="req-cur-level" readonly>
              </div>
              <div class="form-group">
                <label>Target Kenaikan Tingkat</label>
                <select id="req-target-level" required>
                  ${UMMI_LEVELS.map(lvl => `<option value="${lvl}">${lvl}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Catatan Kesiapan dari Guru Pengampu</label>
                <textarea id="req-notes" rows="3" required placeholder="Contoh: Sudah tuntas jilid 2 sampai halaman akhir, bacaan tartil dan makhraj mad thabi\'i konsisten lancar."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-req-exam">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-req"><i class="ph ph-paper-plane-tilt"></i> Kirim Pengajuan ke Koordinator</button>
            </div>
          </form>
        </div>
      </div>
    `;
    container.querySelectorAll('[data-req-exam]').forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.reqExam;
        const sname = btn.dataset.stuName;
        const curLvl = btn.dataset.curLevel;
        const cid = btn.dataset.clsId;
        document.getElementById('req-stu-id').value = sid;
        document.getElementById('req-cls-id').value = cid;
        document.getElementById('req-stu-name').value = sname;
        document.getElementById('req-cur-level').value = curLvl;
        const curIdx = UMMI_LEVELS.indexOf(curLvl);
        const nextLvl = (curIdx !== -1 && curIdx < UMMI_LEVELS.length - 1) ? UMMI_LEVELS[curIdx + 1] : curLvl;
        document.getElementById('req-target-level').value = nextLvl;
        document.getElementById('req-notes').value = '';
        App.openModal('modal-req-exam');
      };
    });
    document.getElementById('form-req-exam').onsubmit = async (e) => {
      e.preventDefault();
      const sid = document.getElementById('req-stu-id').value;
      const cid = document.getElementById('req-cls-id').value;
      const sname = document.getElementById('req-stu-name').value;
      const curLvl = document.getElementById('req-cur-level').value;
      const targetLvl = document.getElementById('req-target-level').value;
      const notes = document.getElementById('req-notes').value.trim();
      const btn = document.getElementById('btn-submit-req');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Mengirim...';
      try {
        await DB.saveUmmiExam(null, {
          studentId: sid,
          studentName: sname,
          ummiClassId: cid,
          currentLevel: curLvl,
          targetLevel: targetLvl,
          teacherNotes: notes,
          requestedBy: Auth.currentUser.uid,
          requestedByName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
          requestedAt: Date.now(),
          status: 'Menunggu ACC'
        });
        if (typeof NotificationService !== 'undefined') {
          NotificationService.notifyUmmiExamRequested({
            studentName: sname,
            currentLevel: curLvl,
            targetLevel: targetLvl,
            requestedByName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
            requestedBy: Auth.currentUser.uid
          });
        }
        App.closeModal('modal-req-exam');
        alert('Pengajuan ujian kenaikan jilid berhasil dikirim ke Koordinator Ummi!');
      } catch (err) {
        alert(err.message || 'Gagal mengirim pengajuan.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Kirim Pengajuan ke Koordinator';
      }
    };
  },
  async renderProgress(container) {
    Router.setTitle('Jurnal Harian Jilid', 'Pencatatan sesi pembelajaran harian dan Kartu Prestasi santri.');
    const uid = Auth.currentUser.uid;
    const [ummiClasses, allStudents, allClasses] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllStudents(),
      DB.getClasses()
    ]);
    const classArr = DB.toArray(ummiClasses);
    const userAssigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || Auth.currentUser || {});
    const isKoordOrAdmin = userAssigns.includes('KOORD_UMMI') || Auth.currentRole === 'admin' || Auth.userData?.role === 'admin';
    let myClasses = isKoordOrAdmin ? classArr : classArr.filter(c => c.teacherId === uid);
    if (!myClasses.length) {
      const assigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || {});
      myClasses = classArr.filter(c => assigns.some(a => a.toLowerCase().includes(c.name.toLowerCase().replace(/[^a-z0-9]/g, ''))));
    }
    if (!myClasses.length) {
      myClasses = classArr;
    }
    if (!myClasses.length) {
      container.innerHTML = `<div class="card"><p class="text-muted">Belum ada Rombel Ummi terdaftar di sistem. Silakan buat rombel terlebih dahulu di menu Pemetaan Rombel.</p></div>`;
      return;
    }
    const studentMap = DB.toArray(allStudents).reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
    const gradeClassMap = DB.toArray(allClasses).reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
    const hash = window.location.hash || '';
    const qs = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(qs);
    let activeClassId = params.get('classId') || myClasses[0].id;
    let activeCls = myClasses.find(c => c.id === activeClassId) || myClasses[0];
    let viewContainer = container.querySelector('#ummi-progress-view');
    if (!viewContainer) {
      const guideBanner = container.querySelector('#feature-guide-banner');
      container.innerHTML = '';
      if (guideBanner) {
        container.appendChild(guideBanner);
      }
      viewContainer = document.createElement('div');
      viewContainer.id = 'ummi-progress-view';
      container.appendChild(viewContainer);
    }
    const renderJournalView = async (selectedClassId, selectedStudentId) => {
      activeCls = myClasses.find(c => c.id === selectedClassId) || myClasses[0];
      const enrolledIds = Object.keys(activeCls.students || {});
      const enrolledStudents = enrolledIds.map(id => studentMap[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
      const clsOpts = myClasses.map(c => `<option value="${c.id}" ${c.id === activeCls.id ? 'selected' : ''}>${AppConfig.escapeHtml(c.name)} (${AppConfig.escapeHtml(c.level || 'Jilid')})</option>`).join('');
      if (!enrolledStudents.length) {
        viewContainer.innerHTML = `
          <div class="card toolbar-panel ummi-toolbar-card">
            <div class="ummi-toolbar">
              <div class="ummi-toolbar-item">
                <label class="ummi-toolbar-label">Pilih Rombel:</label>
                <select id="sel-jurnal-cls" class="ummi-toolbar-select">${clsOpts}</select>
              </div>
            </div>
          </div>
          <div class="card"><p class="text-muted">Belum ada santri di rombel ini. Koordinator dapat menambahkan santri lewat menu Pemetaan Rombel.</p></div>
        `;
        document.getElementById('sel-jurnal-cls').onchange = (e) => renderJournalView(e.target.value);
        if (typeof FeatureGuides !== 'undefined') {
          FeatureGuides.attach(container, '#/guru/ummi/progress');
        }
        return;
      }
      let activeStudent = enrolledStudents.find(s => s.id === selectedStudentId) || enrolledStudents[0];
      const studentOpts = enrolledStudents.map(s => `<option value="${s.id}" ${s.id === activeStudent.id ? 'selected' : ''}>${AppConfig.escapeHtml(s.name)} (${gradeClassMap[s.classId] || s.classId || '-'})</option>`).join('');
      const journalsObj = await DB.getUmmiJournals(activeStudent.id);
      const journalsArr = DB.toArray(journalsObj).sort((a, b) => (Number(a.meetingNo) || 0) - (Number(b.meetingNo) || 0));
      const nextMeetingNo = journalsArr.length ? (Math.max(...journalsArr.map(j => Number(j.meetingNo) || 0)) + 1) : 1;
      const todayStr = AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr() : new Date().toISOString().slice(0, 10);
      const curStudentLevel = activeStudent.ummiLevel || (activeCls.students[activeStudent.id] && activeCls.students[activeStudent.id].level) || activeCls.level || 'Jilid 1';
      const levelOpts = UMMI_LEVELS.map(lvl => `<option value="${lvl}" ${lvl === curStudentLevel ? 'selected' : ''}>${lvl} — ${UMMI_LEVEL_DESCS[lvl] || ''}</option>`).join('');
      const gradeOpts = UMMI_GRADES.map(g => `<option value="${g.score}">${g.label}</option>`).join('');
      const journalRows = journalsArr.length ? journalsArr.map(j => {
        const badgeCls = (j.score >= 90) ? 'badge-success' : ((j.score >= 80) ? 'badge-primary' : 'badge-warning');
        return `
          <tr>
            <td class="text-center"><strong>${j.meetingNo || j.meetingNumber || '-'}</strong></td>
            <td>${AppConfig.escapeHtml(j.date || '-')}</td>
            <td><span class="badge badge-primary">${AppConfig.escapeHtml(j.level || '-')}</span></td>
            <td><strong>${AppConfig.escapeHtml(j.page || j.pageOrAyat || '-')}</strong></td>
            <td>${AppConfig.escapeHtml(j.material || '-')}</td>
            <td><span class="badge ${badgeCls}">${j.score || '-'} (${j.predicate || (UMMI_GRADES.find(g => g.score === Number(j.score)) || {}).predicate || '-'})</span><br><small class="text-muted">${AppConfig.escapeHtml(j.action || (UMMI_GRADES.find(g => g.score === Number(j.score)) || {}).action || '')}</small></td>
            <td><span class="badge badge-success"><i class="ph ph-check"></i> ${AppConfig.escapeHtml(j.teacherName || 'Ustadz')}</span></td>
            <td>${j.parentVerified ? `<span class="badge badge-success"><i class="ph ph-checks"></i> Disimak (${AppConfig.escapeHtml(j.parentVerifiedBy || 'Orang Tua')})</span>` : '<span class="badge badge-warning">Belum Disimak</span>'}</td>
            <td>${AppConfig.escapeHtml(j.note || j.notes || '-')}</td>
            <td class="action-cell">
              <button class="btn btn-danger btn-sm" data-del-journal="${j.id}" title="Hapus"><i class="ph ph-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="10" class="text-center text-muted">Belum ada riwayat tatap muka. Masukkan sesi pembelajaran hari ini pada form di bawah.</td></tr>';
      viewContainer.innerHTML = `
        <div class="card toolbar-panel ummi-toolbar-card">
          <div class="ummi-toolbar">
            <div class="ummi-toolbar-group">
              <div class="ummi-toolbar-item">
                <label class="ummi-toolbar-label">Rombel Ummi:</label>
                <select id="sel-jurnal-cls" class="ummi-toolbar-select">${clsOpts}</select>
              </div>
              <div class="ummi-toolbar-item">
                <label class="ummi-toolbar-label">Pilih Santri:</label>
                <select id="sel-jurnal-stu" class="ummi-toolbar-select">${studentOpts}</select>
              </div>
            </div>
            <button class="btn btn-primary btn-sm ummi-toolbar-btn" id="btn-quick-req-exam"><i class="ph ph-arrow-circle-up"></i> Ajukan Tes Kenaikan Jilid</button>
          </div>
        </div>
        <div class="card section-spacer ummi-student-card">
          <div class="ummi-student-banner">
            <div class="ummi-student-info">
              <h3 class="ummi-student-title">${AppConfig.escapeHtml(activeStudent.name)}</h3>
              <p class="ummi-student-meta">Kelas Formal: <strong>${gradeClassMap[activeStudent.classId] || activeStudent.classId || '-'}</strong> · Rombel: <strong>${AppConfig.escapeHtml(activeCls.name)}</strong> · Tingkat Saat Ini: <span class="badge badge-primary">${AppConfig.escapeHtml(curStudentLevel)}</span></p>
            </div>
            <div class="ummi-student-badge-wrap">
              <span class="badge badge-success ummi-stat-badge"><i class="ph ph-calendar-check"></i> Total ${journalsArr.length} Tatap Muka</span>
            </div>
          </div>
        </div>
        <div class="card section-spacer">
          <div class="card-header">
            <h3 class="card-title"><i class="ph ph-plus-circle"></i> Input Sesi Pembelajaran Hari Ini</h3>
          </div>
          <form id="form-add-journal" class="ummi-journal-form">
            <div class="ummi-form-grid">
              <div class="form-group">
                <label>Tatap Muka Ke- (Otomatis Urut)</label>
                <input type="number" id="in-meeting" value="${nextMeetingNo}" required readonly class="input-readonly-bold">
              </div>
              <div class="form-group">
                <label>Tanggal Belajar</label>
                <input type="date" id="in-date" value="${todayStr}" required>
              </div>
              <div class="form-group">
                <label>Tingkat / Jilid</label>
                <select id="in-level" required>${levelOpts}</select>
              </div>
              <div class="form-group">
                <label>Halaman / Ayat</label>
                <input type="text" id="in-page" placeholder="Contoh: Hal. 15 / QS. An-Naba: 1-10" required>
              </div>
            </div>
            <div class="ummi-form-grid-wide">
              <div class="form-group">
                <label>Materi Pokok Bahasan</label>
                <input type="text" id="in-material" placeholder="Contoh: Mengenal tanda sukun dan hukum qalqalah" required>
              </div>
              <div class="form-group">
                <label>Nilai & Kualitas Baca (Standar Ummi)</label>
                <select id="in-score" required>${gradeOpts}</select>
              </div>
            </div>
            <div class="form-group ummi-form-note-group">
              <label>Catatan Kesalahan / Keterangan Belajar di Sekolah</label>
              <input type="text" id="in-note" placeholder="Contoh: Perhatikan panjang mad thabi\'i pada baris ke-3, fashahah sudah sangat baik.">
            </div>
            <button type="submit" class="btn btn-primary ummi-submit-btn" id="btn-save-journal"><i class="ph ph-floppy-disk"></i> Simpan Sesi &amp; Capaian BTQ</button>
          </form>
        </div>
        <div class="card section-spacer">
          <div class="card-header ummi-card-header">
            <div class="ummi-card-title-wrap">
              <h3 class="card-title"><i class="ph ph-table"></i> Kartu Prestasi Santri</h3>
              <span class="ummi-card-student-name">${AppConfig.escapeHtml(activeStudent.name)}</span>
            </div>
            <span class="badge badge-primary badge-sm ummi-standard-badge">9 Kolom Standar</span>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th class="table-col-sm">Tatap Muka</th>
                  <th>Tanggal</th>
                  <th>Jilid</th>
                  <th>Halaman / Ayat</th>
                  <th>Pokok Bahasan / Materi</th>
                  <th>Nilai & Keputusan</th>
                  <th>Disimak Guru</th>
                  <th>Disimak Ortu</th>
                  <th>Catatan Kesalahan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>${journalRows}</tbody>
            </table>
          </div>
        </div>
        <div class="modal-overlay" id="modal-req-exam">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">Ajukan Tes Kenaikan Jilid</h3>
              <button class="btn-icon" data-close-modal="modal-req-exam"><i class="ph ph-x"></i></button>
            </div>
            <form id="form-req-exam">
              <div class="modal-body">
                <div class="form-group">
                  <label>Nama Santri</label>
                  <input type="text" value="${AppConfig.escapeHtml(activeStudent.name)}" readonly>
                </div>
                <div class="form-group">
                  <label>Tingkat / Jilid Saat Ini</label>
                  <input type="text" value="${AppConfig.escapeHtml(curStudentLevel)}" readonly>
                </div>
                <div class="form-group">
                  <label>Target Kenaikan Tingkat</label>
                  <select id="prog-target-level" required>
                    ${UMMI_LEVELS.map(lvl => `<option value="${lvl}">${lvl}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Catatan Kesiapan Guru</label>
                  <textarea id="prog-notes" rows="3" required placeholder="Tuliskan catatan kesiapan santri untuk diuji oleh Koordinator Ummi..."></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" data-close-modal="modal-req-exam">Batal</button>
                <button type="submit" class="btn btn-primary" id="btn-prog-submit-req"><i class="ph ph-paper-plane-tilt"></i> Kirim ke Koordinator</button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.getElementById('sel-jurnal-cls').onchange = (e) => renderJournalView(e.target.value);
      document.getElementById('sel-jurnal-stu').onchange = (e) => renderJournalView(activeCls.id, e.target.value);
      document.getElementById('btn-quick-req-exam').onclick = () => {
        const curIdx = UMMI_LEVELS.indexOf(curStudentLevel);
        const nextLvl = (curIdx !== -1 && curIdx < UMMI_LEVELS.length - 1) ? UMMI_LEVELS[curIdx + 1] : curStudentLevel;
        document.getElementById('prog-target-level').value = nextLvl;
        App.openModal('modal-req-exam');
      };
      document.getElementById('form-req-exam').onsubmit = async (e) => {
        e.preventDefault();
        const targetLvl = document.getElementById('prog-target-level').value;
        const notes = document.getElementById('prog-notes').value.trim();
        const btn = document.getElementById('btn-prog-submit-req');
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Mengirim...';
        try {
          await DB.saveUmmiExam(null, {
            studentId: activeStudent.id,
            studentName: activeStudent.name,
            ummiClassId: activeCls.id,
            currentLevel: curStudentLevel,
            targetLevel: targetLvl,
            teacherNotes: notes,
            requestedBy: uid,
            requestedByName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
            requestedAt: Date.now(),
            status: 'Menunggu ACC'
          });
          if (typeof NotificationService !== 'undefined') {
            NotificationService.notifyUmmiExamRequested({
              studentName: activeStudent.name,
              currentLevel: curStudentLevel,
              targetLevel: targetLvl,
              requestedByName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
              requestedBy: uid
            });
          }
          App.closeModal('modal-req-exam');
          alert('Pengajuan ujian kenaikan jilid berhasil dikirim ke Koordinator Ummi!');
        } catch (err) {
          alert(err.message || 'Gagal mengirim pengajuan.');
        } finally {
          btn.disabled = false;
          btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Kirim ke Koordinator';
        }
      };
      viewContainer.querySelectorAll('[data-del-journal]').forEach(btn => {
        btn.onclick = async () => {
          const jid = btn.dataset.delJournal;
          if (!confirm('Yakin ingin menghapus sesi jurnal ini?')) return;
          await DB.deleteUmmiJournal(activeStudent.id, jid);
          renderJournalView(activeCls.id, activeStudent.id);
        };
      });
      document.getElementById('form-add-journal').onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-journal');
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan Sesi & Menghitung BTQ...';
        const meetingNo = Number(document.getElementById('in-meeting').value) || nextMeetingNo;
        const dateVal = document.getElementById('in-date').value;
        const lvlVal = document.getElementById('in-level').value;
        const pageVal = document.getElementById('in-page').value.trim();
        const matVal = document.getElementById('in-material').value.trim();
        const scoreVal = Number(document.getElementById('in-score').value);
        const noteVal = document.getElementById('in-note').value.trim();
        const gradeObj = UMMI_GRADES.find(g => g.score === scoreVal) || UMMI_GRADES[0];
        try {
          await DB.saveUmmiJournal(activeStudent.id, null, {
            meetingNo: meetingNo,
            date: dateVal,
            level: lvlVal,
            page: pageVal,
            material: matVal,
            score: scoreVal,
            predicate: gradeObj.predicate,
            action: gradeObj.action,
            teacherId: uid,
            teacherName: Auth.userData?.name || Auth.currentUser?.displayName || 'Guru Ummi',
            teacherVerified: true,
            teacherVerifiedAt: Date.now(),
            parentVerified: false,
            note: noteVal,
            ummiClassId: activeCls.id
          });
          renderJournalView(activeCls.id, activeStudent.id);
        } catch (err) {
          alert(err.message || 'Gagal menyimpan jurnal.');
          btn.disabled = false;
          btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Sesi & Capaian BTQ';
        }
      };
      if (typeof FeatureGuides !== 'undefined') {
        FeatureGuides.attach(container, '#/guru/ummi/progress');
      }
    };
    await renderJournalView(activeClassId, params.get('studentId'));
    if (typeof FeatureGuides !== 'undefined') {
      FeatureGuides.attach(container, '#/guru/ummi/progress');
    }
  },
  async renderExams(container) {
    Router.setTitle('Antrean Ujian Jilid & Munaqosyah', 'Monitoring dan pengujian kelayakan kenaikan jilid santri.');
    const [snapExams, users, settings, allStudents, allClasses] = await Promise.all([
      DB.getUmmiExams(),
      DB.getAllUsers(),
      DB.getSettings(),
      DB.getAllStudents(),
      DB.getClasses()
    ]);
    const studentMap = DB.toArray(allStudents).reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
    const classMap = DB.toArray(allClasses).reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
    const examArr = DB.toArray(snapExams).sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
    const guruUmmi = DB.toArray(users).filter(u => AppConfig.isUserUmmi(u));
    const isExamPending = (status) => (status === 'Menunggu ACC' || status === 'pending' || !status);
    const pendingCount = examArr.filter(e => isExamPending(e.status)).length;
    const scheduledCount = examArr.filter(e => e.status === 'Dijadwalkan').length;
    const passedCount = examArr.filter(e => e.status === 'Lolos').length;
    const rejectedCount = examArr.filter(e => e.status === 'Ditolak').length;
    let activeFilter = 'all';
    let examSearchQuery = '';
    const renderTable = (filter) => {
      if (filter !== undefined) activeFilter = filter;
      const filtered = examArr.filter(e => {
        const isPend = isExamPending(e.status);
        if (activeFilter === 'Menunggu ACC' && !isPend) return false;
        if (activeFilter !== 'all' && activeFilter !== 'Menunggu ACC' && e.status !== activeFilter) return false;
        if (examSearchQuery) {
          const sName = (e.studentName || '').toLowerCase();
          const rName = (e.requestedByName || '').toLowerCase();
          const exName = (e.examinerName || '').toLowerCase();
          const cur = (e.currentLevel || '').toLowerCase();
          const tgt = (e.targetLevel || '').toLowerCase();
          if (!sName.includes(examSearchQuery) && !rName.includes(examSearchQuery) && !exName.includes(examSearchQuery) && !cur.includes(examSearchQuery) && !tgt.includes(examSearchQuery)) {
            return false;
          }
        }
        return true;
      });
      const rows = filtered.length ? filtered.map((e, idx) => {
        const isPend = isExamPending(e.status);
        let badgeCls = 'badge-warning';
        let statusText = 'Menunggu ACC';
        if (e.status === 'Dijadwalkan') { badgeCls = 'badge-primary'; statusText = 'Dijadwalkan'; }
        else if (e.status === 'Lolos') { badgeCls = 'badge-success'; statusText = 'Lolos'; }
        else if (e.status === 'Ditolak') { badgeCls = 'badge-danger'; statusText = 'Ditolak'; }
        else if (!isPend) { statusText = e.status || 'Menunggu ACC'; }
        const sesVal = (() => { const sObj = studentMap[e.studentId]; if (sObj) { const fCls = classMap[sObj.classId]; const g = fCls ? (Number(fCls.grade) || parseInt(fCls.name || '', 10) || 0) : 0; if (g === 1 || g === 2) return '1'; if (g === 3 || g === 4) return '2'; if (g === 5 || g === 6) return '3'; } return '1'; })();
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${AppConfig.escapeHtml(e.studentName || '-')}</strong></td>
            <td>${getSessionBadge(sesVal)}</td>
            <td><span class="badge badge-outline">${AppConfig.escapeHtml(e.currentLevel || '-')}</span> <i class="ph ph-arrow-right"></i> <span class="badge badge-primary">${AppConfig.escapeHtml(e.targetLevel || '-')}</span></td>
            <td>${AppConfig.escapeHtml(e.requestedByName || '-')}<br><small class="text-muted">${AppConfig.escapeHtml(e.teacherNotes || '-')}</small></td>
            <td><span class="badge ${badgeCls}">${statusText}</span></td>
            <td>${e.scheduledDate ? `<strong>${e.scheduledDate}</strong><br><small class="text-muted">Penguji: ${AppConfig.escapeHtml(e.examinerName || '-')}</small>` : '<span class="text-muted">Belum dijadwalkan</span>'}</td>
            <td>${e.examNotes ? AppConfig.escapeHtml(e.examNotes) : (e.score ? `Nilai: ${e.score}` : '-')}</td>
            <td class="action-cell">
              ${isPend ? `
                <button class="btn btn-primary btn-sm" data-acc-exam="${e.id}"><i class="ph ph-calendar-plus"></i> ACC & Jadwal</button>
                <button class="btn btn-danger btn-sm" data-reject-exam="${e.id}"><i class="ph ph-x-circle"></i> Tolak</button>
              ` : ''}
              ${e.status === 'Dijadwalkan' ? `
                <button class="btn btn-success btn-sm" data-result-exam="${e.id}"><i class="ph ph-check-circle"></i> Input Hasil Tes</button>
              ` : ''}
              ${e.status === 'Lolos' ? `<span class="badge badge-success"><i class="ph ph-seal-check"></i> Tingkat Naik</span>` : ''}
              ${e.status === 'Ditolak' ? `<button class="btn btn-outline btn-sm" data-reopen-exam="${e.id}"><i class="ph ph-arrows-clockwise"></i> Evaluasi Ulang</button>` : ''}
            </td>
          </tr>
        `;
      }).join('') : `
        <tr>
          <td colspan="9">
            <div class="empty-state-box">
              <i class="ph ph-folder-open"></i>
              <div class="empty-state-box-title">Tidak ada antrean ujian</div>
              <div class="empty-state-box-desc">Belum ada pengajuan ujian munaqosyah atau kenaikan jilid pada filter ini.</div>
            </div>
          </td>
        </tr>
      `;
      const mobileCards = filtered.length ? filtered.map((e) => {
        const isPend = isExamPending(e.status);
        let badgeCls = 'badge-warning';
        let statusText = 'Menunggu ACC';
        if (e.status === 'Dijadwalkan') { badgeCls = 'badge-primary'; statusText = 'Dijadwalkan'; }
        else if (e.status === 'Lolos') { badgeCls = 'badge-success'; statusText = 'Lolos'; }
        else if (e.status === 'Ditolak') { badgeCls = 'badge-danger'; statusText = 'Ditolak'; }
        else if (!isPend) { statusText = e.status || 'Menunggu ACC'; }
        const sesVal = (() => { const sObj = studentMap[e.studentId]; if (sObj) { const fCls = classMap[sObj.classId]; const g = fCls ? (Number(fCls.grade) || parseInt(fCls.name || '', 10) || 0) : 0; if (g === 1 || g === 2) return '1'; if (g === 3 || g === 4) return '2'; if (g === 5 || g === 6) return '3'; } return '1'; })();
        return `
          <div class="exam-item-card">
            <div class="exam-item-top">
              <div class="exam-item-student">
                <div class="exam-item-name">${AppConfig.escapeHtml(e.studentName || '-')}</div>
                <div class="exam-item-meta"><i class="ph ph-user"></i> Pengaju: ${AppConfig.escapeHtml(e.requestedByName || '-')}</div>
              </div>
              <div class="exam-item-badges">
                ${getSessionBadge(sesVal, true)}
                <span class="badge ${badgeCls}">${statusText}</span>
              </div>
            </div>
            <div class="exam-item-body">
              <div class="exam-item-level-row">
                <span class="exam-item-level-lbl"><i class="ph ph-trend-up"></i> Kenaikan:</span>
                <div class="exam-item-level-badges">
                  <span class="badge badge-outline">${AppConfig.escapeHtml(e.currentLevel || '-')}</span>
                  <i class="ph ph-arrow-right"></i>
                  <span class="badge badge-primary">${AppConfig.escapeHtml(e.targetLevel || '-')}</span>
                </div>
              </div>
              ${e.teacherNotes ? `<div class="exam-item-notes"><strong>Catatan Guru:</strong> ${AppConfig.escapeHtml(e.teacherNotes)}</div>` : ''}
              ${e.scheduledDate ? `<div class="exam-item-notes"><strong>Jadwal:</strong> ${e.scheduledDate} (Penguji: ${AppConfig.escapeHtml(e.examinerName || '-')})</div>` : '<div class="exam-item-notes text-muted"><em>Belum dijadwalkan</em></div>'}
              ${e.examNotes ? `<div class="exam-item-notes"><strong>Catatan Ujian:</strong> ${AppConfig.escapeHtml(e.examNotes)}</div>` : (e.score ? `<div class="exam-item-notes"><strong>Nilai:</strong> ${e.score}</div>` : '')}
            </div>
            <div class="exam-item-bottom">
              <div class="exam-item-actions">
                ${isPend ? `
                  <button class="btn btn-primary btn-sm" data-acc-exam="${e.id}"><i class="ph ph-calendar-plus"></i> ACC & Jadwal</button>
                  <button class="btn btn-danger btn-sm" data-reject-exam="${e.id}"><i class="ph ph-x-circle"></i> Tolak</button>
                ` : ''}
                ${e.status === 'Dijadwalkan' ? `
                  <button class="btn btn-success btn-sm btn-block" data-result-exam="${e.id}"><i class="ph ph-check-circle"></i> Input Hasil Tes</button>
                ` : ''}
                ${e.status === 'Lolos' ? `<span class="badge badge-success"><i class="ph ph-seal-check"></i> Tingkat Naik</span>` : ''}
                ${e.status === 'Ditolak' ? `<button class="btn btn-outline btn-sm btn-block" data-reopen-exam="${e.id}"><i class="ph ph-arrows-clockwise"></i> Evaluasi Ulang</button>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('') : `
        <div class="empty-state-box">
          <i class="ph ph-folder-open"></i>
          <div class="empty-state-box-title">Tidak ada antrean ujian</div>
          <div class="empty-state-box-desc">Belum ada pengajuan ujian munaqosyah atau kenaikan jilid pada filter ini.</div>
        </div>
      `;
      const tBody = document.getElementById('exam-table-body');
      if (tBody) tBody.innerHTML = rows;
      const mCards = document.getElementById('exam-mobile-cards');
      if (mCards) mCards.innerHTML = mobileCards;
      container.querySelectorAll('[data-acc-exam]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.accExam;
          const target = examArr.find(x => x.id === id);
          if (!target) return;
          UMMIPages._openAccModal(target, guruUmmi, container);
        };
      });
      container.querySelectorAll('[data-reject-exam]').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.rejectExam;
          const note = prompt('Tuliskan alasan penolakan atau catatan pembinaan untuk santri ini:');
          if (note === null) return;
          await DB.saveUmmiExam(id, {
            status: 'Ditolak',
            examNotes: note || 'Perlu pemantapan materi oleh guru pengampu.',
            completedAt: Date.now()
          });
          UMMIPages.renderExams(container);
        };
      });
      container.querySelectorAll('[data-result-exam]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.resultExam;
          const target = examArr.find(x => x.id === id);
          if (!target) return;
          UMMIPages._openResultModal(target, container);
        };
      });
      container.querySelectorAll('[data-reopen-exam]').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.reopenExam;
          await DB.saveUmmiExam(id, { status: 'Menunggu ACC' });
          UMMIPages.renderExams(container);
        };
      });
    };
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-hourglass-high"></i></div>
          <div><p class="stat-value">${pendingCount}</p><p class="stat-label text-muted">Menunggu ACC</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-calendar"></i></div>
          <div><p class="stat-value">${scheduledCount}</p><p class="stat-label text-muted">Sudah Dijadwalkan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-check-circle"></i></div>
          <div><p class="stat-value">${passedCount}</p><p class="stat-label text-muted">Lolos Kenaikan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-x-circle"></i></div>
          <div><p class="stat-value">${rejectedCount}</p><p class="stat-label text-muted">Perlu Pembinaan</p></div>
        </div>
      </section>
      <div class="card toolbar-panel">
        <div class="filter-pills" id="exam-status-filter-pills">
          <button type="button" class="filter-pill active" data-filter="all"><i class="ph ph-stack"></i> Semua (${examArr.length})</button>
          <button type="button" class="filter-pill" data-filter="Menunggu ACC"><i class="ph ph-hourglass-high"></i> Menunggu ACC (${pendingCount})</button>
          <button type="button" class="filter-pill" data-filter="Dijadwalkan"><i class="ph ph-calendar"></i> Dijadwalkan (${scheduledCount})</button>
          <button type="button" class="filter-pill" data-filter="Lolos"><i class="ph ph-check-circle"></i> Lolos (${passedCount})</button>
          <button type="button" class="filter-pill" data-filter="Ditolak"><i class="ph ph-x-circle"></i> Ditolak (${rejectedCount})</button>
        </div>
        <div class="search-box">
          <i class="ph ph-magnifying-glass"></i>
          <input type="text" id="input-search-exam" placeholder="Cari nama santri, guru pengaju, penguji, atau tingkat...">
        </div>
      </div>
      <div class="card">
        <div class="table-responsive exam-desktop-table">
          <table class="table">
            <thead>
              <tr>
                <th class="table-col-sm">No</th>
                <th>Santri</th>
                <th>Sesi</th>
                <th>Kenaikan Jilid</th>
                <th>Pengaju & Catatan</th>
                <th>Status</th>
                <th>Jadwal & Penguji</th>
                <th>Catatan Ujian</th>
                <th class="table-col-action">Aksi Koordinator</th>
              </tr>
            </thead>
            <tbody id="exam-table-body"></tbody>
          </table>
        </div>
        <div class="exam-mobile-cards" id="exam-mobile-cards"></div>
      </div>
      <div class="modal-overlay" id="modal-acc-exam">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">ACC & Jadwalkan Ujian Kenaikan</h3>
            <button class="btn-icon" data-close-modal="modal-acc-exam"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-acc-exam">
            <div class="modal-body">
              <input type="hidden" id="acc-exam-id">
              <div class="form-group">
                <label>Santri</label>
                <input type="text" id="acc-stu-name" readonly>
              </div>
              <div class="form-group">
                <label>Target Kenaikan Jilid</label>
                <input type="text" id="acc-target-level" readonly>
              </div>
              <div class="form-group">
                <label>Tanggal Ujian Kenaikan</label>
                <input type="date" id="acc-date" required>
                <small class="text-muted text-block-hint" id="acc-quota-note">*Maksimal kuota 7 santri per hari untuk setiap penguji.</small>
              </div>
              <div class="form-group">
                <label>Koordinator / Penguji Yang Ditugaskan</label>
                <select id="acc-examiner" required>
                  ${guruUmmi.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-acc-exam">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-acc"><i class="ph ph-calendar-check"></i> Konfirmasi & Jadwalkan</button>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-overlay" id="modal-result-exam">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Input Hasil Ujian Kenaikan Jilid</h3>
            <button class="btn-icon" data-close-modal="modal-result-exam"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-result-exam">
            <div class="modal-body">
              <input type="hidden" id="res-exam-id">
              <input type="hidden" id="res-stu-id">
              <input type="hidden" id="res-cls-id">
              <input type="hidden" id="res-target-level">
              <div class="form-group">
                <label>Santri</label>
                <input type="text" id="res-stu-name" readonly>
              </div>
              <div class="form-group">
                <label>Target Kenaikan Jilid</label>
                <input type="text" id="res-display-level" readonly>
              </div>
              <div class="form-group">
                <label>Nilai Munaqosyah / Ujian (0 - 100)</label>
                <input type="number" id="res-score" min="0" max="100" required placeholder="Contoh: 90">
              </div>
              <div class="form-group">
                <label>Keputusan Ujian</label>
                <select id="res-decision" required>
                  <option value="Lolos">Lolos — Otomatis Naikkan Tingkat Jilid Santri</option>
                  <option value="Ditolak">Belum Lolos — Perlu Pemantapan & Mengulang</option>
                </select>
              </div>
              <div class="form-group">
                <label>Catatan Hasil Ujian</label>
                <textarea id="res-notes" rows="3" required placeholder="Tuliskan catatan kelulusan / evaluasi tajwid santri..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-result-exam">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-result"><i class="ph ph-floppy-disk"></i> Simpan Hasil & Perbarui Tingkat</button>
            </div>
          </form>
        </div>
      </div>
    `;
    container.querySelectorAll('#exam-status-filter-pills [data-filter]').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('#exam-status-filter-pills [data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTable(btn.dataset.filter);
      };
    });
    const searchExamInp = container.querySelector('#input-search-exam');
    if (searchExamInp) {
      searchExamInp.oninput = (e) => {
        examSearchQuery = e.target.value.toLowerCase().trim();
        renderTable();
      };
    }
    renderTable('all');
  },
  _openAccModal(target, guruUmmi, container) {
    document.getElementById('acc-exam-id').value = target.id;
    document.getElementById('acc-stu-name').value = target.studentName || '-';
    document.getElementById('acc-target-level').value = `${target.currentLevel} -> ${target.targetLevel}`;
    const today = AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr() : new Date().toISOString().slice(0, 10);
    document.getElementById('acc-date').value = today;
    document.getElementById('acc-examiner').value = Auth.currentUser.uid;
    App.openModal('modal-acc-exam');
    document.getElementById('form-acc-exam').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('acc-exam-id').value;
      const dateVal = document.getElementById('acc-date').value;
      const examinerId = document.getElementById('acc-examiner').value;
      const examinerObj = guruUmmi.find(g => g.id === examinerId);
      const examinerName = examinerObj ? examinerObj.name : 'Koordinator';
      const scheduledCount = await DB.getScheduledUmmiExamsCount(dateVal, examinerId);
      if (scheduledCount >= 7) {
        alert(`Kuota ujian pada tanggal ${dateVal} untuk ${examinerName} sudah penuh (Maksimal 7 santri per hari). Silakan pilih tanggal lain atau penguji lain.`);
        return;
      }
      const btn = document.getElementById('btn-save-acc');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menjadwalkan...';
      try {
        await DB.saveUmmiExam(id, {
          status: 'Dijadwalkan',
          scheduledDate: dateVal,
          examinerId: examinerId,
          examinerName: examinerName
        });
        if (typeof NotificationService !== 'undefined') {
          NotificationService.notifyUmmiExamScheduled({
            studentName: target.studentName,
            targetLevel: target.targetLevel,
            scheduledDate: dateVal,
            examinerName: examinerName,
            examinerId: examinerId,
            requestedBy: target.requestedBy
          });
        }
        App.closeModal('modal-acc-exam');
        UMMIPages.renderExams(container);
      } catch (err) {
        alert(err.message || 'Gagal menjadwalkan ujian.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-calendar-check"></i> Konfirmasi & Jadwalkan';
      }
    };
  },
  _openResultModal(target, container) {
    document.getElementById('res-exam-id').value = target.id;
    document.getElementById('res-stu-id').value = target.studentId;
    document.getElementById('res-cls-id').value = target.ummiClassId || '';
    document.getElementById('res-target-level').value = target.targetLevel;
    document.getElementById('res-stu-name').value = target.studentName || '-';
    document.getElementById('res-display-level').value = `${target.currentLevel} -> ${target.targetLevel}`;
    document.getElementById('res-score').value = 90;
    document.getElementById('res-decision').value = 'Lolos';
    document.getElementById('res-notes').value = 'Alhamdulillah telah lulus ujian kenaikan tingkat dengan bacaan tartil dan lancar.';
    App.openModal('modal-result-exam');
    document.getElementById('form-result-exam').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('res-exam-id').value;
      const sid = document.getElementById('res-stu-id').value;
      const cid = document.getElementById('res-cls-id').value;
      const targetLvl = document.getElementById('res-target-level').value;
      const score = Number(document.getElementById('res-score').value);
      const decision = document.getElementById('res-decision').value;
      const notes = document.getElementById('res-notes').value.trim();
      const btn = document.getElementById('btn-save-result');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      try {
        await DB.saveUmmiExam(id, {
          status: decision,
          score: score,
          examNotes: notes,
          studentId: sid,
          targetLevel: targetLvl,
          ummiClassId: cid,
          completedAt: Date.now()
        });
        if (typeof NotificationService !== 'undefined') {
          NotificationService.notifyUmmiExamResult({
            studentName: target.studentName || document.getElementById('res-stu-name').value,
            targetLevel: targetLvl,
            decision: decision,
            score: score,
            requestedBy: target.requestedBy,
            studentId: sid
          });
        }
        App.closeModal('modal-result-exam');
        if (decision === 'Lolos') {
          alert(`Selamat! Santri berhasil lulus dan tingkat jilid resmi dinaikkan ke ${targetLvl}. Nilai rapor BTQ otomatis diperbarui.`);
        } else {
          alert('Hasil ujian disimpan. Santri akan dibina kembali oleh guru pengampu.');
        }
        UMMIPages.renderExams(container);
      } catch (err) {
        alert(err.message || 'Gagal menyimpan hasil ujian.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Hasil & Perbarui Tingkat';
      }
    };
  },
  async renderTahfidz(container) {
    Router.setTitle('Setoran Tahfidz Santri', 'Buku mutabaah hafalan surat dan juz Al-Qur\'an santri.');
    const uid = Auth.currentUser.uid;
    const [ummiClasses, allStudents, allClasses, tahfidzRaw, allUsers] = await Promise.all([
      DB.getUmmiClasses(),
      DB.getAllStudents(),
      DB.getClasses(),
      DB.getUmmiTahfidz(),
      DB.getAllUsers()
    ]);
    const classArr = DB.toArray(ummiClasses);
    const userAssigns = Auth.currentAssignments || AppConfig.getRoleAssignments(Auth.userData || Auth.currentUser || {});
    const isKoordOrAdmin = userAssigns.includes('KOORD_UMMI') || Auth.currentRole === 'admin' || Auth.userData?.role === 'admin';
    let myClasses = isKoordOrAdmin ? classArr : classArr.filter(c => c.teacherId === uid);
    if (!myClasses.length) {
      myClasses = classArr.filter(c => userAssigns.some(a => a.toLowerCase().includes((c.name || '').toLowerCase().replace(/[^a-z0-9]/g, ''))));
    }
    if (!myClasses.length) {
      myClasses = classArr;
    }
    const studentMap = DB.toArray(allStudents).reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
    const gradeClassMap = DB.toArray(allClasses).reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
    const guruUmmi = DB.toArray(allUsers).filter(u => AppConfig.isUserUmmi(u));
    const teacherMap = guruUmmi.reduce((acc, u) => { acc[u.id] = u.name; return acc; }, {});
    let activeClassId = myClasses[0] ? myClasses[0].id : 'all';
    let activeStudentId = 'all';
    let activeJuz = 'all';
    let activeType = 'all';
    let searchQuery = '';
    const getFlattenedRecords = () => {
      const records = [];
      if (tahfidzRaw) {
        Object.entries(tahfidzRaw).forEach(([sId, entries]) => {
          if (entries && typeof entries === 'object') {
            Object.entries(entries).forEach(([k, rec]) => {
              if (rec && typeof rec === 'object') {
                records.push({ id: k, studentId: sId, ...rec });
              }
            });
          }
        });
      }
      return records.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));
    };
    let allRecords = getFlattenedRecords();
    const clsOptions = [
      '<option value="all">Semua Rombel Ummi</option>',
      ...myClasses.map(c => `<option value="${c.id}" ${c.id === activeClassId ? 'selected' : ''}>${AppConfig.escapeHtml(c.name)} (${AppConfig.escapeHtml(c.level || 'Jilid')})</option>`)
    ].join('');
    const juzOptions = [
      '<option value="all">Semua Juz (1 - 30)</option>',
      '<option value="30" selected>Juz 30 (Juz \'Amma)</option>',
      '<option value="29">Juz 29 (Tabarak)</option>',
      '<option value="28">Juz 28</option>',
      ...Array.from({ length: 27 }, (_, i) => `<option value="${i + 1}">Juz ${i + 1}</option>`)
    ].join('');
    container.innerHTML = `
      <div class="card toolbar-panel tahfidz-toolbar-card">
        <div class="tahfidz-toolbar">
          <div class="tahfidz-filter-group">
            <div class="tahfidz-filter-item">
              <label class="tahfidz-filter-label">Rombel</label>
              <select id="sel-tahfidz-cls" class="tahfidz-filter-select">${clsOptions}</select>
            </div>
            <div class="tahfidz-filter-item">
              <label class="tahfidz-filter-label">Santri</label>
              <select id="sel-tahfidz-student" class="tahfidz-filter-select">
                <option value="all">Semua Santri</option>
              </select>
            </div>
            <div class="tahfidz-filter-item">
              <label class="tahfidz-filter-label">Kategori</label>
              <select id="sel-tahfidz-type" class="tahfidz-filter-select">
                <option value="all">Semua Kategori</option>
                <option value="ziyadah">Ziyadah</option>
                <option value="murajaah">Muraja\'ah</option>
                <option value="persiapan_tasmi">Persiapan Tasmi\'</option>
                <option value="tasmi">Ujian Tasmi\'</option>
              </select>
            </div>
            <div class="tahfidz-filter-item">
              <label class="tahfidz-filter-label">Juz</label>
              <select id="sel-tahfidz-juz" class="tahfidz-filter-select">${juzOptions}</select>
            </div>
          </div>
          <div class="tahfidz-toolbar-actions">
            <button class="btn btn-primary" id="btn-add-tahfidz"><i class="ph ph-plus"></i> Input Setoran Baru</button>
          </div>
        </div>
      </div>
      <div class="tahfidz-stats-grid" id="tahfidz-stats-container"></div>
      <div class="card tahfidz-table-card">
        <div class="tahfidz-search-bar">
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" id="input-search-tahfidz" placeholder="Cari santri, surat, catatan, atau guru pengampu...">
          </div>
        </div>
        <div class="tahfidz-desktop-table table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Santri & Kelas</th>
                <th>Rombel Ummi</th>
                <th>Surat & Juz</th>
                <th>Ayat</th>
                <th>Predikat Kelancaran</th>
                <th>Catatan & Guru</th>
                <th class="action-cell">Aksi</th>
              </tr>
            </thead>
            <tbody id="tahfidz-table-tbody"></tbody>
          </table>
        </div>
        <div class="tahfidz-mobile-cards" id="tahfidz-cards-mobile"></div>
      </div>
      <div class="modal-overlay" id="modal-tahfidz-entry">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-tahfidz-title">Input Setoran Tahfidz Santri</h3>
            <button class="btn-icon" data-close-modal="modal-tahfidz-entry"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-tahfidz-entry">
            <div class="modal-body">
              <input type="hidden" id="tahfidz-entry-id">
              <input type="hidden" id="tahfidz-entry-orig-student">
              <div class="form-row">
                <div class="form-group form-col">
                  <label>Filter Rombel Santri</label>
                  <select id="tahfidz-entry-filter-class" class="form-input">
                    <option value="all">Semua Rombel Ummi</option>
                    ${myClasses.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)} (${AppConfig.escapeHtml(c.level || 'Jilid')})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group form-col">
                  <label>Pilih Santri *</label>
                  <select id="tahfidz-entry-student" required class="form-input"></select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group form-col">
                  <label>Kategori / Jenis Setoran *</label>
                  <select id="tahfidz-entry-type" class="form-input">
                    <option value="ziyadah" selected>Ziyadah (Setoran Hafalan Baru)</option>
                    <option value="murajaah">Muraja\'ah Rutin</option>
                    <option value="persiapan_tasmi">Persiapan Tasmi\' (Ujian Porsi Juz)</option>
                    <option value="tasmi">Ujian Tasmi\' Resmi</option>
                  </select>
                </div>
                <div class="form-group form-col">
                  <label>Tanggal Setoran *</label>
                  <input type="date" id="tahfidz-entry-date" required class="form-input">
                </div>
              </div>
              <div class="form-group" id="tahfidz-tasmi-target-row" style="display:none;">
                <label id="lbl-tahfidz-tasmi-target">Porsi / Target Tasmi\' <span class="text-danger">*</span></label>
                <select id="tahfidz-entry-tasmi-target" class="form-input">
                  <option value="1/4_juz_1">Persiapan Tasmi\' ¼ Juz ke-1</option>
                  <option value="1/4_juz_2">Persiapan Tasmi\' ¼ Juz ke-2</option>
                  <option value="1/4_juz_3">Persiapan Tasmi\' ¼ Juz ke-3</option>
                  <option value="1/4_juz_4">Persiapan Tasmi\' ¼ Juz ke-4</option>
                  <option value="1/2_juz_1">Persiapan Tasmi\' ½ Juz ke-1</option>
                  <option value="1/2_juz_2">Persiapan Tasmi\' ½ Juz ke-2</option>
                  <option value="1_juz">Persiapan Tasmi\' 1 Juz</option>
                  <option value="3_juz">Persiapan Tasmi\' 3 Juz Sekali Duduk</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group form-col">
                  <label>Juz *</label>
                  <select id="tahfidz-entry-juz" required class="form-input">
                    <option value="30">Juz 30 (Juz \'Amma)</option>
                    <option value="29">Juz 29 (Tabarak)</option>
                    <option value="28">Juz 28</option>
                    ${Array.from({ length: 27 }, (_, i) => `<option value="${i + 1}">Juz ${i + 1}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group form-col" id="tahfidz-surah-col">
                  <label id="lbl-tahfidz-surah">Surat *</label>
                  <select id="tahfidz-entry-surah" required class="form-input"></select>
                </div>
              </div>
              <div class="form-group">
                <label id="lbl-tahfidz-verse">Rentang Ayat *</label>
                <input type="text" id="tahfidz-entry-verse" required placeholder="Contoh: 1 - 20 atau 1 - 40 (Tuntas)" class="form-input">
              </div>
              <div class="form-group">
                <label>Nilai / Predikat Kelancaran *</label>
                <select id="tahfidz-entry-grade" required class="form-input">
                  <option value="A+">A+ (Mumtaz - Mutqin / Sangat Lancar Tanpa Bantuan)</option>
                  <option value="A" selected>A (Jayyid Jiddan - Lancar / Bantuan Maks 1x)</option>
                  <option value="B">B (Jayyid - Cukup Lancar / Bantuan 2-3x)</option>
                  <option value="C">C (Maqbul - Kurang Lancar / Perlu Muraja\'ah)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Catatan Makharijul Huruf & Tajwid</label>
                <textarea id="tahfidz-entry-notes" rows="2" placeholder="Catatan evaluasi tajwid, hukum mad, dengung, makhraj..." class="form-input"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-tahfidz-entry">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-tahfidz-entry"><i class="ph ph-floppy-disk"></i> Simpan Setoran Hafalan</button>
            </div>
          </form>
        </div>
      </div>`;
    const selCls = container.querySelector('#sel-tahfidz-cls');
    const selStudent = container.querySelector('#sel-tahfidz-student');
    const selJuz = container.querySelector('#sel-tahfidz-juz');
    const searchInput = container.querySelector('#input-search-tahfidz');
    const updateStudentFilterDropdown = () => {
      let enrolled = [];
      if (activeClassId !== 'all') {
        const cls = classArr.find(c => c.id === activeClassId);
        if (cls && cls.students) {
          enrolled = Object.keys(cls.students).map(id => studentMap[id]).filter(Boolean);
        }
      }
      if (!enrolled.length) {
        enrolled = DB.toArray(allStudents);
      }
      enrolled.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      if (activeClassId === 'all') {
        const byClass = {};
        enrolled.forEach(s => {
          const cName = gradeClassMap[s.classId] || 'Lainnya';
          if (!byClass[cName]) byClass[cName] = [];
          byClass[cName].push(s);
        });
        let html = '<option value="all">Semua Santri</option>';
        Object.keys(byClass).sort().forEach(cName => {
          html += `<optgroup label="Kelas ${AppConfig.escapeHtml(cName)}">`;
          html += byClass[cName].map(s => `<option value="${s.id}">${AppConfig.escapeHtml(s.name)}</option>`).join('');
          html += '</optgroup>';
        });
        selStudent.innerHTML = html;
      } else {
        selStudent.innerHTML = '<option value="all">Semua Santri</option>' + enrolled.map(s => `
          <option value="${s.id}">${AppConfig.escapeHtml(s.name)} (${gradeClassMap[s.classId] || s.classId || '-'})</option>
        `).join('');
      }
      selStudent.value = activeStudentId;
    };
    const renderTahfidzView = () => {
      const filtered = allRecords.filter(r => {
        if (activeClassId !== 'all') {
          const cls = classArr.find(c => c.id === activeClassId);
          if (cls && cls.students) {
            if (!cls.students[r.studentId]) return false;
          } else if (r.ummiClassId && r.ummiClassId !== activeClassId) {
            return false;
          }
        }
        if (activeStudentId !== 'all' && r.studentId !== activeStudentId) return false;
        if (activeJuz !== 'all' && String(r.juz || '') !== String(activeJuz)) return false;
        if (activeType !== 'all') {
          const rType = r.entryType || 'ziyadah';
          if (rType !== activeType) return false;
        }
        if (searchQuery) {
          const sObj = studentMap[r.studentId];
          const sName = (sObj?.name || r.studentName || '').toLowerCase();
          const surah = (r.surah || '').toLowerCase();
          const notes = (r.notes || '').toLowerCase();
          const targetText = (AppConfig.formatTasmiTargetLabel ? AppConfig.formatTasmiTargetLabel(r.tasmiTarget) : (r.tasmiTarget || '')).toLowerCase();
          const teacher = (teacherMap[r.teacherId] || r.teacherName || '').toLowerCase();
          if (!sName.includes(searchQuery) && !surah.includes(searchQuery) && !notes.includes(searchQuery) && !teacher.includes(searchQuery) && !targetText.includes(searchQuery)) return false;
        }
        return true;
      });
      const totalSetoran = filtered.length;
      const mutqinCount = filtered.filter(r => r.grade === 'A+' || r.grade === 'A').length;
      const uniqueStudents = new Set(filtered.map(r => r.studentId)).size;
      const statContainer = container.querySelector('#tahfidz-stats-container');
      if (statContainer) {
        statContainer.innerHTML = `
          <div class="tahfidz-stat-card primary">
            <div class="tahfidz-stat-icon"><i class="ph ph-book-open"></i></div>
            <div class="tahfidz-stat-info">
              <div class="tahfidz-stat-val">${totalSetoran}</div>
              <div class="tahfidz-stat-lbl">Total Setoran</div>
            </div>
          </div>
          <div class="tahfidz-stat-card success">
            <div class="tahfidz-stat-icon"><i class="ph ph-seal-check"></i></div>
            <div class="tahfidz-stat-info">
              <div class="tahfidz-stat-val">${mutqinCount}</div>
              <div class="tahfidz-stat-lbl">Mutqin (A+/A)</div>
            </div>
          </div>
          <div class="tahfidz-stat-card info">
            <div class="tahfidz-stat-icon"><i class="ph ph-users"></i></div>
            <div class="tahfidz-stat-info">
              <div class="tahfidz-stat-val">${uniqueStudents}</div>
              <div class="tahfidz-stat-lbl">Santri Setor</div>
            </div>
          </div>
        `;
      }
      const tbody = container.querySelector('#tahfidz-table-tbody');
      const mobileCards = container.querySelector('#tahfidz-cards-mobile');
      if (!tbody || !mobileCards) return;
      if (!filtered.length) {
        const emptyTahfidz = `
          <div class="empty-state-box">
            <i class="ph ph-book-open"></i>
            <div class="empty-state-box-title">Belum Ada Setoran Tahfidz</div>
            <div class="empty-state-box-desc">Belum ada riwayat mutabaah hafalan yang sesuai kriteria. Silakan klik tombol "Input Setoran Baru" di atas untuk menambahkan hafalan santri.</div>
          </div>
        `;
        tbody.innerHTML = `<tr><td colspan="9">${emptyTahfidz}</td></tr>`;
        mobileCards.innerHTML = emptyTahfidz;
        return;
      }
      tbody.innerHTML = filtered.map((r, idx) => {
        const sObj = studentMap[r.studentId] || {};
        const sName = sObj.name || r.studentName || 'Santri';
        const cFormal = gradeClassMap[sObj.classId] || sObj.classId || '-';
        const teacherName = teacherMap[r.teacherId] || r.teacherName || 'Guru Ummi';
        const clsObj = classArr.find(c => c.id === r.ummiClassId) || classArr.find(c => c.students && c.students[r.studentId]);
        const clsName = clsObj ? clsObj.name : '-';
        let gradeBadge = '<span class="badge badge-info">B (Jayyid)</span>';
        if (r.grade === 'A+') gradeBadge = '<span class="badge badge-success font-bold"><i class="ph ph-star"></i> A+ (Mutqin)</span>';
        else if (r.grade === 'A') gradeBadge = '<span class="badge badge-primary font-bold">A (Lancar)</span>';
        else if (r.grade === 'C') gradeBadge = '<span class="badge badge-warning">C (Muraja\'ah)</span>';
        else if (r.grade === 'D') gradeBadge = '<span class="badge badge-danger">D (Kurang)</span>';
        const isTasmi = r.entryType === 'persiapan_tasmi' || r.entryType === 'tasmi';
        const isOfficialTasmi = r.entryType === 'tasmi';
        const isMurajaah = r.entryType === 'murajaah';
        let surahColHtml = '';
        if (isTasmi) {
          const tShort = AppConfig.formatTasmiTargetShort ? AppConfig.formatTasmiTargetShort(r.tasmiTarget) : (r.tasmiTarget || 'Tasmi\'');
          surahColHtml = `
            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
              <span class="badge ${isOfficialTasmi ? 'badge-primary' : 'badge-warning'}" style="font-size:10px;"><i class="ph ph-medal"></i> ${isOfficialTasmi ? 'Ujian Tasmi\'' : 'Persiapan Tasmi\''}</span>
              <strong>${AppConfig.escapeHtml(tShort)}</strong>
              <span class="text-xs text-muted">Juz ${r.juz || 30}${r.surah ? ` · ${AppConfig.escapeHtml(r.surah)}` : ''}</span>
            </div>`;
        } else {
          surahColHtml = `
            <span class="badge badge-info">Juz ${r.juz || 30}</span>
            <strong>${AppConfig.escapeHtml(r.surah || '-')}</strong>
            ${isMurajaah ? '<span class="badge badge-outline badge-xs">Muraja\'ah</span>' : ''}`;
        }
        const verseColHtml = isTasmi ? `<span class="badge badge-outline">${AppConfig.escapeHtml(r.verse || 'Tuntas')}</span>` : `Ayat ${AppConfig.escapeHtml(r.verse || '-')}`;
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${r.date || '-'}</strong></td>
            <td>
              <div class="font-bold text-main">${AppConfig.escapeHtml(sName)}</div>
              <div class="text-xs text-muted">${AppConfig.escapeHtml(cFormal)} · ${sObj.nis || sObj.id || ''}</div>
            </td>
            <td><span class="badge badge-outline">${AppConfig.escapeHtml(clsName)}</span></td>
            <td>${surahColHtml}</td>
            <td>${verseColHtml}</td>
            <td>${gradeBadge}</td>
            <td>
              <div class="text-sm">${AppConfig.escapeHtml(r.notes || '-')}</div>
              <div class="text-xs text-muted"><i class="ph ph-chalkboard-teacher"></i> ${AppConfig.escapeHtml(teacherName)}</div>
            </td>
            <td class="action-cell">
              <button class="btn btn-outline btn-sm" data-edit-tahfidz="${r.studentId}:${r.id}" title="Edit Setoran"><i class="ph ph-pencil-simple"></i></button>
              <button class="btn btn-danger btn-sm" data-del-tahfidz="${r.studentId}:${r.id}" title="Hapus"><i class="ph ph-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');
      mobileCards.innerHTML = filtered.map((r, idx) => {
        const sObj = studentMap[r.studentId] || {};
        const sName = sObj.name || r.studentName || 'Santri';
        const cFormal = gradeClassMap[sObj.classId] || sObj.classId || '-';
        const teacherName = teacherMap[r.teacherId] || r.teacherName || 'Guru Ummi';
        const clsObj = classArr.find(c => c.id === r.ummiClassId) || classArr.find(c => c.students && c.students[r.studentId]);
        const clsName = clsObj ? clsObj.name : '-';
        let gradeBadge = '<span class="badge badge-info">B (Jayyid)</span>';
        if (r.grade === 'A+') gradeBadge = '<span class="badge badge-success font-bold"><i class="ph ph-star"></i> A+ (Mutqin)</span>';
        else if (r.grade === 'A') gradeBadge = '<span class="badge badge-primary font-bold">A (Lancar)</span>';
        else if (r.grade === 'C') gradeBadge = '<span class="badge badge-warning">C (Muraja\'ah)</span>';
        else if (r.grade === 'D') gradeBadge = '<span class="badge badge-danger">D (Kurang)</span>';
        const isMobTasmi = r.entryType === 'persiapan_tasmi' || r.entryType === 'tasmi';
        const isMobOfficial = r.entryType === 'tasmi';
        const isMobMurajaah = r.entryType === 'murajaah';
        let mobSurahHtml = '';
        if (isMobTasmi) {
          const tMobShort = AppConfig.formatTasmiTargetShort ? AppConfig.formatTasmiTargetShort(r.tasmiTarget) : (r.tasmiTarget || 'Tasmi\'');
          mobSurahHtml = `
            <div class="tahfidz-item-surah-row">
              <span>
                <span class="badge ${isMobOfficial ? 'badge-primary' : 'badge-warning'} badge-sm"><i class="ph ph-medal"></i> ${isMobOfficial ? 'Tasmi\'' : 'Persiapan Tasmi\''}</span>
                <strong>${AppConfig.escapeHtml(tMobShort)}</strong>
                <span class="text-xs text-muted">(Juz ${r.juz || 30})</span>
              </span>
              <span class="font-bold text-primary">${AppConfig.escapeHtml(r.verse || 'Tuntas')}</span>
            </div>`;
        } else {
          mobSurahHtml = `
            <div class="tahfidz-item-surah-row">
              <span>
                <span class="badge badge-info badge-sm">Juz ${r.juz || 30}</span>
                <strong>${AppConfig.escapeHtml(r.surah || '-')}</strong>
                ${isMobMurajaah ? '<span class="badge badge-outline badge-xs">Muraja\'ah</span>' : ''}
              </span>
              <span class="font-bold text-primary">Ayat ${AppConfig.escapeHtml(r.verse || '-')}</span>
            </div>`;
        }
        return `
          <div class="tahfidz-item-card">
            <div class="tahfidz-item-top">
              <div class="tahfidz-item-student">
                <div class="tahfidz-item-name">${idx + 1}. ${AppConfig.escapeHtml(sName)}</div>
                <div class="tahfidz-item-meta">${AppConfig.escapeHtml(cFormal)} · ${AppConfig.escapeHtml(clsName)}</div>
              </div>
              <div>${gradeBadge}</div>
            </div>
            <div class="tahfidz-item-body">
              ${mobSurahHtml}
              ${r.notes ? `<div class="tahfidz-item-notes"><i class="ph ph-chat-text"></i> ${AppConfig.escapeHtml(r.notes)}</div>` : ''}
            </div>
            <div class="tahfidz-item-bottom">
              <div class="tahfidz-item-teacher">
                <div><strong>${r.date || '-'}</strong> · <i class="ph ph-chalkboard-teacher"></i> ${AppConfig.escapeHtml(teacherName)}</div>
              </div>
              <div class="tahfidz-item-actions">
                <button class="btn btn-outline btn-xs" data-edit-tahfidz="${r.studentId}:${r.id}" title="Edit"><i class="ph ph-pencil-simple"></i> Edit</button>
                <button class="btn btn-danger btn-xs" data-del-tahfidz="${r.studentId}:${r.id}" title="Hapus"><i class="ph ph-trash"></i></button>
              </div>
            </div>
          </div>
        `;
      }).join('');
      container.querySelectorAll('[data-edit-tahfidz]').forEach(btn => {
        btn.onclick = () => {
          const [sId, recId] = btn.getAttribute('data-edit-tahfidz').split(':');
          const rec = allRecords.find(item => item.studentId === sId && item.id === recId);
          if (!rec) return;
          openTahfidzModal(rec);
        };
      });
      container.querySelectorAll('[data-del-tahfidz]').forEach(btn => {
        btn.onclick = async () => {
          const [sId, recId] = btn.getAttribute('data-del-tahfidz').split(':');
          if (!confirm('Hapus riwayat setoran tahfidz ini?')) return;
          try {
            await DB.deleteUmmiTahfidz(sId, recId);
            allRecords = allRecords.filter(item => !(item.studentId === sId && item.id === recId));
            renderTahfidzView();
          } catch (err) {
            alert(err.message || 'Gagal menghapus data setoran.');
          }
        };
      });
    };
    const openTahfidzModal = (editData = null) => {
      const modal = document.getElementById('modal-tahfidz-entry');
      if (!modal) return;
      const form = document.getElementById('form-tahfidz-entry');
      form.reset();
      const modalTitle = document.getElementById('modal-tahfidz-title');
      const hiddenId = document.getElementById('tahfidz-entry-id');
      const hiddenOrigStu = document.getElementById('tahfidz-entry-orig-student');
      const selStu = document.getElementById('tahfidz-entry-student');
      const selTypeInput = document.getElementById('tahfidz-entry-type');
      const inputDate = document.getElementById('tahfidz-entry-date');
      const tasmiTargetRow = document.getElementById('tahfidz-tasmi-target-row');
      const selTasmiTarget = document.getElementById('tahfidz-entry-tasmi-target');
      const lblTasmiTarget = document.getElementById('lbl-tahfidz-tasmi-target');
      const lblSurah = document.getElementById('lbl-tahfidz-surah');
      const lblVerse = document.getElementById('lbl-tahfidz-verse');
      const selJuzInput = document.getElementById('tahfidz-entry-juz');
      const selSurahInput = document.getElementById('tahfidz-entry-surah');
      const inputVerse = document.getElementById('tahfidz-entry-verse');
      const selGrade = document.getElementById('tahfidz-entry-grade');
      const inputNotes = document.getElementById('tahfidz-entry-notes');
      const updateTasmiVisibility = () => {
        const isTasmi = selTypeInput.value === 'persiapan_tasmi' || selTypeInput.value === 'tasmi';
        tasmiTargetRow.style.display = isTasmi ? 'block' : 'none';
        if (isTasmi) {
          lblTasmiTarget.innerHTML = selTypeInput.value === 'tasmi' ? 'Porsi / Target Ujian Tasmi\' <span class="text-danger">*</span>' : 'Porsi / Target Persiapan Tasmi\' <span class="text-danger">*</span>';
          lblVerse.innerHTML = 'Keterangan Cakupan / Rentang Ayat';
          if (lblSurah) lblSurah.innerHTML = 'Surat (Opsional / Awal Porsi)';
          selSurahInput.required = false;
          inputVerse.required = false;
          if (!inputVerse.value || inputVerse.value === '1 - ') {
            inputVerse.value = 'Tuntas (1 Porsi)';
          }
        } else {
          lblTasmiTarget.innerHTML = 'Porsi / Target Tasmi\'';
          lblVerse.innerHTML = 'Rentang Ayat *';
          if (lblSurah) lblSurah.innerHTML = 'Surat *';
          selSurahInput.required = true;
          inputVerse.required = true;
          if (inputVerse.value === 'Tuntas (1 Porsi)') {
            inputVerse.value = '1 - ';
          }
        }
        populateSurahs(selJuzInput.value, selSurahInput.value);
      };
      selTypeInput.onchange = updateTasmiVisibility;
      const selFilterModal = document.getElementById('tahfidz-entry-filter-class');
      const updateModalStudentOptions = (filterClassId, targetStudentId = '') => {
        let list = [];
        if (filterClassId && filterClassId !== 'all') {
          const cls = classArr.find(c => c.id === filterClassId);
          if (cls && cls.students) {
            list = Object.keys(cls.students).map(id => studentMap[id]).filter(Boolean);
          }
        }
        if (!list.length && (filterClassId === 'all' || !filterClassId)) {
          list = DB.toArray(allStudents);
        }
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        if (filterClassId === 'all') {
          const byClass = {};
          list.forEach(s => {
            const cName = gradeClassMap[s.classId] || 'Lainnya';
            if (!byClass[cName]) byClass[cName] = [];
            byClass[cName].push(s);
          });
          let html = '<option value="">— Pilih Santri —</option>';
          Object.keys(byClass).sort().forEach(cName => {
            html += `<optgroup label="Kelas ${AppConfig.escapeHtml(cName)}">`;
            html += byClass[cName].map(s => `<option value="${s.id}">${AppConfig.escapeHtml(s.name)}</option>`).join('');
            html += '</optgroup>';
          });
          selStu.innerHTML = html;
        } else {
          selStu.innerHTML = '<option value="">— Pilih Santri —</option>' + list.map(s => `
            <option value="${s.id}">${AppConfig.escapeHtml(s.name)} (${gradeClassMap[s.classId] || s.classId || '-'})</option>
          `).join('');
        }
        if (targetStudentId) {
          selStu.value = targetStudentId;
        }
      };
      if (selFilterModal) {
        selFilterModal.onchange = () => {
          updateModalStudentOptions(selFilterModal.value);
        };
      }
      const populateSurahs = (juzVal, keepSurah = null) => {
        const isTasmi = selTypeInput && (selTypeInput.value === 'persiapan_tasmi' || selTypeInput.value === 'tasmi');
        let surahList = QURAN_SURAHS;
        if (juzVal && juzVal !== 'all') {
          const jNum = Number(juzVal);
          surahList = QURAN_SURAHS.filter(s => Array.isArray(s.juz) ? s.juz.includes(jNum) : s.juz === jNum);
          if (!surahList.length) surahList = QURAN_SURAHS;
        }
        let optionsHtml = '';
        if (isTasmi) {
          optionsHtml += '<option value="">(Semua Surat Sesuai Porsi)</option>';
        }
        optionsHtml += surahList.map(s => `
          <option value="${s.name}" data-verses="${s.verses}" data-juz="${Array.isArray(s.juz) ? s.juz.join(',') : s.juz}">No. ${s.no} - ${s.name} (${s.verses} ayat)</option>
        `).join('');
        selSurahInput.innerHTML = optionsHtml;
        if (keepSurah !== null && (keepSurah === '' || surahList.some(s => s.name === keepSurah))) {
          selSurahInput.value = keepSurah;
        }
        const curOpt = selSurahInput.options[selSurahInput.selectedIndex];
        if (curOpt) {
          const vCount = curOpt.getAttribute('data-verses');
          if (vCount) inputVerse.placeholder = `Contoh: 1 - ${vCount} (Tuntas)`;
          else if (isTasmi) inputVerse.placeholder = 'Contoh: Tuntas (1 Porsi) atau 1 - 20';
        }
      };
      selJuzInput.onchange = () => {
        populateSurahs(selJuzInput.value);
      };
      selSurahInput.onchange = () => {
        const curOpt = selSurahInput.options[selSurahInput.selectedIndex];
        if (curOpt) {
          const vCount = curOpt.getAttribute('data-verses');
          if (vCount) inputVerse.placeholder = `Contoh: 1 - ${vCount} (Tuntas)`;
        }
      };
      let defaultRombelId = 'all';
      if (editData && editData.studentId) {
        const foundRombel = classArr.find(c => c.students && c.students[editData.studentId]);
        if (foundRombel) defaultRombelId = foundRombel.id;
        else if (activeClassId !== 'all') defaultRombelId = activeClassId;
      } else {
        defaultRombelId = activeClassId !== 'all' ? activeClassId : 'all';
      }
      if (selFilterModal) selFilterModal.value = defaultRombelId;
      updateModalStudentOptions(defaultRombelId, editData ? editData.studentId : (activeStudentId !== 'all' ? activeStudentId : ''));
      if (editData) {
        modalTitle.innerText = 'Edit Setoran Tahfidz Santri';
        hiddenId.value = editData.id || '';
        hiddenOrigStu.value = editData.studentId || '';
        selTypeInput.value = editData.entryType || 'ziyadah';
        selTasmiTarget.value = editData.tasmiTarget || '1/4_juz_1';
        inputDate.value = editData.date || '';
        selJuzInput.value = editData.juz || 30;
        populateSurahs(editData.juz || 30, editData.surah || '');
        inputVerse.value = editData.verse || '';
        selGrade.value = editData.grade || 'A';
        inputNotes.value = editData.notes || '';
        updateTasmiVisibility();
      } else {
        modalTitle.innerText = 'Input Setoran Baru Tahfidz';
        hiddenId.value = '';
        hiddenOrigStu.value = '';
        selTypeInput.value = 'ziyadah';
        selTasmiTarget.value = '1/4_juz_1';
        inputDate.value = AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr() : new Date().toISOString().slice(0, 10);
        selJuzInput.value = activeJuz !== 'all' ? activeJuz : '30';
        populateSurahs(selJuzInput.value);
        selGrade.value = 'A';
        inputVerse.value = '1 - ';
        updateTasmiVisibility();
      }
      App.openModal('modal-tahfidz-entry');
    };
    const selType = container.querySelector('#sel-tahfidz-type');
    if (selType) {
      selType.onchange = () => {
        activeType = selType.value;
        renderTahfidzView();
      };
    }
    selCls.onchange = () => {
      activeClassId = selCls.value;
      activeStudentId = 'all';
      updateStudentFilterDropdown();
      renderTahfidzView();
    };
    selStudent.onchange = () => {
      activeStudentId = selStudent.value;
      renderTahfidzView();
    };
    selJuz.onchange = () => {
      activeJuz = selJuz.value;
      renderTahfidzView();
    };
    searchInput.oninput = () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      renderTahfidzView();
    };
    container.querySelector('#btn-add-tahfidz').onclick = () => {
      openTahfidzModal(null);
    };
    document.getElementById('form-tahfidz-entry').onsubmit = async (e) => {
      e.preventDefault();
      const recId = document.getElementById('tahfidz-entry-id').value.trim();
      const origStu = document.getElementById('tahfidz-entry-orig-student').value.trim();
      const studentId = document.getElementById('tahfidz-entry-student').value;
      const entryType = document.getElementById('tahfidz-entry-type').value || 'ziyadah';
      const tasmiTarget = (entryType === 'persiapan_tasmi' || entryType === 'tasmi') ? document.getElementById('tahfidz-entry-tasmi-target').value : '';
      const date = document.getElementById('tahfidz-entry-date').value;
      const juz = Number(document.getElementById('tahfidz-entry-juz').value) || 30;
      const surah = document.getElementById('tahfidz-entry-surah').value;
      const verse = document.getElementById('tahfidz-entry-verse').value.trim();
      const grade = document.getElementById('tahfidz-entry-grade').value;
      const notes = document.getElementById('tahfidz-entry-notes').value.trim();
      if (!studentId) {
        alert('Harap pilih santri!');
        return;
      }
      const sObj = studentMap[studentId];
      const clsObj = classArr.find(c => c.students && c.students[studentId]) || classArr.find(c => c.id === activeClassId);
      const btn = document.getElementById('btn-save-tahfidz-entry');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      try {
        if (origStu && origStu !== studentId && recId) {
          await DB.deleteUmmiTahfidz(origStu, recId);
        }
        const savedKey = await DB.saveUmmiTahfidz(studentId, recId || null, {
          date,
          juz,
          surah,
          verse,
          grade,
          notes,
          entryType,
          tasmiTarget,
          studentName: sObj ? sObj.name : '',
          ummiClassId: clsObj ? clsObj.id : '',
          teacherId: uid,
          teacherName: Auth.userData?.name || Auth.currentUser.displayName || 'Guru Ummi'
        });
        const newRecord = {
          id: savedKey || recId || Date.now().toString(),
          studentId,
          date,
          juz,
          surah,
          verse,
          grade,
          notes,
          entryType,
          tasmiTarget,
          studentName: sObj ? sObj.name : '',
          ummiClassId: clsObj ? clsObj.id : '',
          teacherId: uid,
          teacherName: Auth.userData?.name || Auth.currentUser.displayName || 'Guru Ummi'
        };
        const existIdx = allRecords.findIndex(r => r.studentId === studentId && r.id === newRecord.id);
        if (existIdx >= 0) allRecords[existIdx] = newRecord;
        else allRecords.unshift(newRecord);
        App.closeModal('modal-tahfidz-entry');
        alert('Setoran tahfidz berhasil disimpan!');
        renderTahfidzView();
      } catch (err) {
        alert(err.message || 'Gagal menyimpan setoran tahfidz.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Setoran Hafalan';
      }
    };
    updateStudentFilterDropdown();
    renderTahfidzView();
    if (typeof FeatureGuides !== 'undefined') {
      FeatureGuides.attach(container, '#/guru/ummi/tahfidz');
    }
  },
  async renderTasmi(container) {
    Router.setTitle('Pengujian Tasmi\' Bil Ghaib', 'Pengujian hafalan Al-Qur\'an santri sekali duduk di hadapan dewan penguji.');
    const uid = Auth.currentUser.uid;
    const [snapPlotting, allStudents, users, allClasses, snapUmmiClasses] = await Promise.all([
      DB.getUmmiTasmiPlotting(),
      DB.getAllStudents(),
      DB.getAllUsers(),
      DB.getClasses(),
      DB.getUmmiClasses()
    ]);
    const locationRecommendations = DB.getUmmiRoomRecommendations ? DB.getUmmiRoomRecommendations(snapUmmiClasses) : [];
    const plottingArr = DB.toArray(snapPlotting).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));
    const studentMap = DB.toArray(allStudents).reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
    const guruUmmi = DB.toArray(users).filter(u => AppConfig.isUserUmmi(u));
    const teacherMap = guruUmmi.reduce((acc, u) => { acc[u.id] = u.name; return acc; }, {});
    const classMap = DB.toArray(allClasses).reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
    let activeTab = 'my';
    let activeSession = 'all';
    let activeStatus = 'all';
    let searchQuery = '';
    const myPlottingCount = plottingArr.filter(p => p.examinerId === uid || (p.examinerName && Auth.userData?.name && p.examinerName.toLowerCase().includes(Auth.userData.name.toLowerCase()))).length;
    if (myPlottingCount === 0 && plottingArr.length > 0) {
      activeTab = 'all';
    }
    container.innerHTML = `
      <div class="filter-pills tasmi-tabs-pill-wrap" id="tasmi-tabs-nav">
        <button class="filter-pill ${activeTab === 'my' ? 'active' : ''}" data-tasmi-tab="my">
          <i class="ph ph-user-check"></i> Tugas Menguji Saya (${myPlottingCount})
        </button>
        <button class="filter-pill ${activeTab === 'all' ? 'active' : ''}" data-tasmi-tab="all">
          <i class="ph ph-list-dashes"></i> Semua Jadwal & Rekap Ujian (${plottingArr.length})
        </button>
      </div>
      <div class="card toolbar-panel tahfidz-toolbar-card">
        <div class="tahfidz-toolbar">
          <div class="tahfidz-filter-group">
            <div class="tahfidz-filter-item">
              <label class="tahfidz-filter-label">Sesi</label>
              <select id="sel-tasmi-session" class="tahfidz-filter-select">
                <option value="all">Semua Sesi</option>
                <option value="1">Sesi 1 (Kelas 1 - 2)</option>
                <option value="2">Sesi 2 (Kelas 3 - 4)</option>
                <option value="3">Sesi 3 (Kelas 5 - 6)</option>
              </select>
            </div>
            <div class="tahfidz-filter-item">
              <label class="tahfidz-filter-label">Status</label>
              <select id="sel-tasmi-status" class="tahfidz-filter-select">
                <option value="all">Semua Status</option>
                <option value="Terjadwal">Terjadwal</option>
                <option value="Lulus">Lulus (Semua Predikat)</option>
                <option value="Mengulang">Mengulang</option>
              </select>
            </div>
          </div>
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" id="input-search-tasmi-exam" placeholder="Cari santri, penguji, kategori, atau ruang...">
          </div>
        </div>
      </div>
      <div class="card tahfidz-table-card">
        <div class="tasmi-desktop-table table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Santri & Kelas</th>
                <th>Kategori / Juz</th>
                <th>Jadwal & Waktu</th>
                <th>Ruangan</th>
                <th>Penguji</th>
                <th>Status & Skor</th>
                <th>Catatan Evaluasi</th>
                <th class="action-cell">Aksi</th>
              </tr>
            </thead>
            <tbody id="tasmi-exam-tbody"></tbody>
          </table>
        </div>
        <div class="tasmi-mobile-cards" id="tasmi-cards-mobile"></div>
      </div>
      <div class="modal-overlay" id="modal-eval-tasmi">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">Penilaian Ujian Tasmi\' Bil Ghaib</h3>
            <button class="btn-icon" data-close-modal="modal-eval-tasmi"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-eval-tasmi">
            <div class="modal-body">
              <input type="hidden" id="eval-tasmi-id">
              <input type="hidden" id="eval-tasmi-student-id">
              <div class="alert alert-info mb-3">
                <div class="font-bold text-base" id="eval-tasmi-student-name">-</div>
                <div class="text-xs text-muted" id="eval-tasmi-meta-info">-</div>
              </div>
              <div class="form-row">
                <div class="form-group form-col">
                  <label>Kelancaran Hafalan (Bobot 40%) *</label>
                  <input type="number" id="eval-tasmi-fluency" min="0" max="100" required value="95" class="form-input">
                </div>
                <div class="form-group form-col">
                  <label>Hukum Tajwid (Bobot 30%) *</label>
                  <input type="number" id="eval-tasmi-tajwid" min="0" max="100" required value="90" class="form-input">
                </div>
                <div class="form-group form-col">
                  <label>Fashahah & Makhraj (Bobot 30%) *</label>
                  <input type="number" id="eval-tasmi-fashahah" min="0" max="100" required value="90" class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group form-col">
                  <label>Skor Akhir (Otomatis)</label>
                  <input type="number" id="eval-tasmi-score" readonly required value="92" class="form-input font-bold text-primary">
                </div>
                <div class="form-group form-col">
                  <label>Keputusan Hasil Ujian *</label>
                  <select id="eval-tasmi-status" required class="form-input">
                    <option value="Lulus (Mumtaz - Istimewa)">Lulus (Mumtaz - Istimewa)</option>
                    <option value="Lulus (Jayyid Jiddan - Baik Sekali)">Lulus (Jayyid Jiddan - Baik Sekali)</option>
                    <option value="Lulus (Jayyid - Baik)">Lulus (Jayyid - Baik)</option>
                    <option value="Mengulang (Perlu Muraja\'ah)">Mengulang (Perlu Muraja\'ah)</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Catatan Dewan Penguji *</label>
                <textarea id="eval-tasmi-notes" rows="3" required placeholder="Catatan kelancaran, ayat yang perlu diperbaiki, evaluasi tajwid..." class="form-input"></textarea>
              </div>
              <div class="form-group" id="wrap-promote-pasca">
                <label class="checkbox-label">
                  <input type="checkbox" id="eval-tasmi-promote">
                  <span>Tandai Lulus Munaqosyah & Naikkan ke Tingkat Pasca</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-eval-tasmi">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-eval-tasmi"><i class="ph ph-floppy-disk"></i> Simpan Penilaian Ujian</button>
            </div>
          </form>
        </div>
      </div>`;
    const tabButtons = container.querySelectorAll('[data-tasmi-tab]');
    const selSession = container.querySelector('#sel-tasmi-session');
    const selStatus = container.querySelector('#sel-tasmi-status');
    const searchInput = container.querySelector('#input-search-tasmi-exam');
    const tbody = container.querySelector('#tasmi-exam-tbody');
    const mobileCards = container.querySelector('#tasmi-cards-mobile');
    const renderTable = () => {
      const filtered = plottingArr.filter(p => {
        if (activeTab === 'my') {
          const isMine = p.examinerId === uid || (p.examinerName && Auth.userData?.name && p.examinerName.toLowerCase().includes(Auth.userData.name.toLowerCase()));
          if (!isMine) return false;
        }
        if (activeSession !== 'all' && String(p.session || '1') !== String(activeSession)) return false;
        if (activeStatus !== 'all') {
          if (activeStatus === 'Lulus') {
            if (!(p.status || '').startsWith('Lulus')) return false;
          } else if (p.status !== activeStatus) {
            return false;
          }
        }
        if (searchQuery) {
          const sObj = studentMap[p.studentId];
          const sName = (sObj?.name || p.studentName || '').toLowerCase();
          const examiner = (teacherMap[p.examinerId] || p.examinerName || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const rm = (p.room || '').toLowerCase();
          if (!sName.includes(searchQuery) && !examiner.includes(searchQuery) && !cat.includes(searchQuery) && !rm.includes(searchQuery)) return false;
        }
        return true;
      });
      if (!tbody || !mobileCards) return;
      if (!filtered.length) {
        const emptyBox = `
          <div class="empty-state-box">
            <i class="ph ph-calendar-blank"></i>
            <div class="empty-state-box-title">${activeTab === 'my' ? 'Belum Ada Tugas Menguji' : 'Tidak Ada Jadwal Tasmi'}</div>
            <div class="empty-state-box-desc">${activeTab === 'my' ? 'Saat ini belum ada jadwal tasmi bil ghaib yang ditugaskan kepada Anda. Anda dapat melihat jadwal seluruh santri pada tab "Semua Jadwal & Rekap Ujian".' : 'Tidak ada jadwal pengujian tasmi yang sesuai dengan filter atau kata kunci pencarian.'}</div>
          </div>
        `;
        tbody.innerHTML = `<tr><td colspan="9">${emptyBox}</td></tr>`;
        mobileCards.innerHTML = emptyBox;
        return;
      }
      tbody.innerHTML = filtered.map((p, idx) => {
        const sObj = studentMap[p.studentId] || {};
        const sName = sObj.name || p.studentName || 'Santri';
        const cFormal = classMap[sObj.classId] || sObj.classId || '-';
        const examiner = teacherMap[p.examinerId] || p.examinerName || 'Dewan Penguji';
        let statusBadge = '<span class="badge badge-outline">Terjadwal</span>';
        if ((p.status || '').startsWith('Lulus')) {
          statusBadge = `<span class="badge badge-success font-bold"><i class="ph ph-check-circle"></i> ${AppConfig.escapeHtml(p.status)} (${p.score || '-'})</span>`;
        } else if ((p.status || '').startsWith('Mengulang')) {
          statusBadge = `<span class="badge badge-warning font-bold"><i class="ph ph-arrows-counter-clockwise"></i> ${AppConfig.escapeHtml(p.status)} (${p.score || '-'})</span>`;
        }
        const isMyExam = p.examinerId === uid || (p.examinerName && Auth.userData?.name && p.examinerName.toLowerCase().includes(Auth.userData.name.toLowerCase()));
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <div class="font-bold text-main">${AppConfig.escapeHtml(sName)}</div>
              <div class="text-xs text-muted">${AppConfig.escapeHtml(cFormal)} · ${sObj.nis || sObj.id || ''}</div>
            </td>
            <td>
              <span class="badge badge-primary">${AppConfig.escapeHtml(p.category || 'Tasmi\' Juz 30')}</span>
              <div class="text-xs text-muted mt-1">${getSessionBadge(p.session || '1')}</div>
            </td>
            <td>
              <div><strong>${p.date || '-'}</strong></div>
              <div class="text-xs text-muted"><i class="ph ph-clock"></i> ${AppConfig.escapeHtml(p.time || '07.30 - 08.30 WIB')}</div>
            </td>
            <td><i class="ph ph-map-pin"></i> ${AppConfig.escapeHtml(p.room || '-')}</td>
            <td>
              <strong>${AppConfig.escapeHtml(examiner)}</strong>
              ${isMyExam ? '<div class="text-xs text-primary font-bold"><i class="ph ph-user"></i> Penugasan Anda</div>' : ''}
            </td>
            <td>${statusBadge}</td>
            <td>
              <div class="text-sm">${AppConfig.escapeHtml(p.notes || p.prepNotes || '-')}</div>
            </td>
            <td class="action-cell">
              <button class="btn btn-primary btn-sm" data-eval-tasmi="${p.id}" title="Input & Nilai Ujian"><i class="ph ph-check-circle"></i> Nilai</button>
            </td>
          </tr>
        `;
      }).join('');
      mobileCards.innerHTML = filtered.map((p, idx) => {
        const sObj = studentMap[p.studentId] || {};
        const sName = sObj.name || p.studentName || 'Santri';
        const cFormal = classMap[sObj.classId] || sObj.classId || '-';
        const examiner = teacherMap[p.examinerId] || p.examinerName || 'Dewan Penguji';
        let statusBadge = '<span class="badge badge-outline badge-sm">Terjadwal</span>';
        if ((p.status || '').startsWith('Lulus')) {
          statusBadge = `<span class="badge badge-success badge-sm font-bold"><i class="ph ph-check-circle"></i> ${AppConfig.escapeHtml(p.status)} (${p.score || '-'})</span>`;
        } else if ((p.status || '').startsWith('Mengulang')) {
          statusBadge = `<span class="badge badge-warning badge-sm font-bold"><i class="ph ph-arrows-counter-clockwise"></i> ${AppConfig.escapeHtml(p.status)} (${p.score || '-'})</span>`;
        }
        const isMyExam = p.examinerId === uid || (p.examinerName && Auth.userData?.name && p.examinerName.toLowerCase().includes(Auth.userData.name.toLowerCase()));
        return `
          <div class="tasmi-item-card">
            <div class="tasmi-item-top">
              <div class="tasmi-item-student">
                <div class="tasmi-item-name">${idx + 1}. ${AppConfig.escapeHtml(sName)}</div>
                <div class="tasmi-item-meta">${AppConfig.escapeHtml(cFormal)} · ${getSessionBadge(p.session || '1')}</div>
              </div>
              <div>${statusBadge}</div>
            </div>
            <div class="tasmi-item-body">
              <div class="tasmi-item-schedule">
                <span class="badge badge-primary badge-sm">${AppConfig.escapeHtml(p.category || 'Tasmi\' Juz 30')}</span>
                <span><i class="ph ph-map-pin"></i> ${AppConfig.escapeHtml(p.room || '-')}</span>
              </div>
              <div class="text-xs text-muted">
                <i class="ph ph-calendar"></i> <strong>${p.date || '-'}</strong> (${AppConfig.escapeHtml(p.time || '07.30 - 08.30 WIB')})
              </div>
              ${(p.notes || p.prepNotes) ? `<div class="tahfidz-item-notes"><i class="ph ph-note"></i> ${AppConfig.escapeHtml(p.notes || p.prepNotes)}</div>` : ''}
            </div>
            <div class="tasmi-item-bottom">
              <div class="tasmi-item-examiner">
                <div>Penguji: <strong>${AppConfig.escapeHtml(examiner)}</strong></div>
                ${isMyExam ? '<div class="text-xs text-primary font-bold"><i class="ph ph-user"></i> Penugasan Anda</div>' : ''}
              </div>
              <button class="btn btn-primary btn-xs" data-eval-tasmi="${p.id}"><i class="ph ph-check-circle"></i> Nilai Ujian</button>
            </div>
          </div>
        `;
      }).join('');
      container.querySelectorAll('[data-eval-tasmi]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-eval-tasmi');
          const p = plottingArr.find(item => item.id === id);
          if (!p) return;
          openEvalModal(p);
        };
      });
    };
    const openEvalModal = (p) => {
      const sObj = studentMap[p.studentId] || {};
      const sName = sObj.name || p.studentName || 'Santri';
      const cFormal = classMap[sObj.classId] || sObj.classId || '-';
      const examiner = teacherMap[p.examinerId] || p.examinerName || '-';
      document.getElementById('eval-tasmi-id').value = p.id;
      document.getElementById('eval-tasmi-student-id').value = p.studentId || '';
      document.getElementById('eval-tasmi-student-name').innerText = sName;
      document.getElementById('eval-tasmi-meta-info').innerText = `${cFormal} · ${p.category || 'Tasmi\' Juz 30'} · Penguji: ${examiner}`;
      const fluInput = document.getElementById('eval-tasmi-fluency');
      const tajInput = document.getElementById('eval-tasmi-tajwid');
      const fasInput = document.getElementById('eval-tasmi-fashahah');
      const scoreInput = document.getElementById('eval-tasmi-score');
      const statusSel = document.getElementById('eval-tasmi-status');
      const notesInput = document.getElementById('eval-tasmi-notes');
      const promoCheck = document.getElementById('eval-tasmi-promote');
      fluInput.value = p.fluencyScore !== undefined ? p.fluencyScore : (p.score || 95);
      tajInput.value = p.tajwidScore !== undefined ? p.tajwidScore : (p.score || 90);
      fasInput.value = p.fashahahScore !== undefined ? p.fashahahScore : (p.score || 90);
      scoreInput.value = p.score || 92;
      statusSel.value = p.status && p.status !== 'Terjadwal' ? p.status : 'Lulus (Mumtaz - Istimewa)';
      notesInput.value = p.notes || '';
      promoCheck.checked = !!(p.category && p.category.toLowerCase().includes('munaqasyah'));
      const calcScore = () => {
        const flu = Number(fluInput.value) || 0;
        const taj = Number(tajInput.value) || 0;
        const fas = Number(fasInput.value) || 0;
        const total = Math.round((flu * 0.4) + (taj * 0.3) + (fas * 0.3));
        scoreInput.value = total;
        if (total >= 90) statusSel.value = 'Lulus (Mumtaz - Istimewa)';
        else if (total >= 80) statusSel.value = 'Lulus (Jayyid Jiddan - Baik Sekali)';
        else if (total >= 70) statusSel.value = 'Lulus (Jayyid - Baik)';
        else statusSel.value = 'Mengulang (Perlu Muraja\'ah)';
      };
      fluInput.oninput = calcScore;
      tajInput.oninput = calcScore;
      fasInput.oninput = calcScore;
      App.openModal('modal-eval-tasmi');
    };
    tabButtons.forEach(btn => {
      btn.onclick = () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.getAttribute('data-tasmi-tab');
        renderTable();
      };
    });
    selSession.onchange = () => {
      activeSession = selSession.value;
      renderTable();
    };
    selStatus.onchange = () => {
      activeStatus = selStatus.value;
      renderTable();
    };
    searchInput.oninput = () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      renderTable();
    };
    document.getElementById('form-eval-tasmi').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('eval-tasmi-id').value;
      const sId = document.getElementById('eval-tasmi-student-id').value;
      const fluencyScore = Number(document.getElementById('eval-tasmi-fluency').value) || 0;
      const tajwidScore = Number(document.getElementById('eval-tasmi-tajwid').value) || 0;
      const fashahahScore = Number(document.getElementById('eval-tasmi-fashahah').value) || 0;
      const score = Number(document.getElementById('eval-tasmi-score').value) || 0;
      const status = document.getElementById('eval-tasmi-status').value;
      const notes = document.getElementById('eval-tasmi-notes').value.trim();
      const promote = document.getElementById('eval-tasmi-promote').checked;
      const btn = document.getElementById('btn-save-eval-tasmi');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      try {
        await DB.saveUmmiTasmiPlotting(id, {
          fluencyScore,
          tajwidScore,
          fashahahScore,
          score,
          status,
          notes,
          evaluatedAt: Date.now(),
          evaluatedBy: uid,
          evaluatedByName: Auth.userData?.name || Auth.currentUser.displayName || 'Penguji Tasmi'
        });
        if (promote && sId && status.startsWith('Lulus')) {
          await DB.updateStudentUmmiLevel(sId, 'Pasca');
        }
        const pObj = plottingArr.find(item => item.id === id);
        if (pObj) {
          Object.assign(pObj, { fluencyScore, tajwidScore, fashahahScore, score, status, notes, evaluatedAt: Date.now() });
        }
        App.closeModal('modal-eval-tasmi');
        alert('Hasil ujian tasmi\' berhasil disimpan!');
        renderTable();
      } catch (err) {
        alert(err.message || 'Gagal menyimpan hasil ujian.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Penilaian Ujian';
      }
    };
    renderTable();
    if (typeof FeatureGuides !== 'undefined') {
      FeatureGuides.attach(container, '#/guru/ummi/tasmi');
    }
  },
    async renderTasmiPlotting(container) {
    Router.setTitle("Plotting Penguji Tasmi' & Munaqosyah", "Jadwal dan penugasan ustadz/ustadzah penguji tasmi' bil ghoib dan munaqasyah santri.");
    const [snapPlotting, allStudents, users, allClasses, snapUmmiClasses] = await Promise.all([
      DB.getUmmiTasmiPlotting(),
      DB.getAllStudents(),
      DB.getAllUsers(),
      DB.getClasses(),
      DB.getUmmiClasses()
    ]);
    const locationRecommendations = DB.getUmmiRoomRecommendations ? DB.getUmmiRoomRecommendations(snapUmmiClasses) : [];
    const plottingArr = DB.toArray(snapPlotting).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));
    const studentArr = DB.toArray(allStudents);
    const studentMap = studentArr.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});
    const guruUmmi = DB.toArray(users).filter(u => AppConfig.isUserUmmi(u));
    const teacherMap = guruUmmi.reduce((acc, u) => { acc[u.id] = u.name; return acc; }, {});
    const classMap = DB.toArray(allClasses).reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
    let sessStats = { '1': 0, '2': 0, '3': 0 };
    let scheduledCnt = 0;
    let passedCnt = 0;
    let repeatCnt = 0;
    plottingArr.forEach(p => {
      const s = p.session || '1';
      if (sessStats[s] !== undefined) sessStats[s]++;
      if (p.status === 'Terjadwal') scheduledCnt++;
      else if ((p.status || '').startsWith('Lulus')) passedCnt++;
      else if (p.status === 'Mengulang / Perbaikan') repeatCnt++;
    });
    let activeSession = 'all';
    let activeStatus = 'all';
    let searchQuery = '';
    const renderTable = () => {
      const filtered = plottingArr.filter(p => {
        const sess = p.session || '1';
        if (activeSession !== 'all' && sess !== activeSession) return false;
        if (activeStatus !== 'all') {
          if (activeStatus === 'Lulus' && !(p.status || '').startsWith('Lulus')) return false;
          if (activeStatus !== 'Lulus' && p.status !== activeStatus) return false;
        }
        if (searchQuery) {
          const sObj = studentMap[p.studentId];
          const sName = (sObj ? sObj.name : (p.studentName || '')).toLowerCase();
          const tName = (teacherMap[p.examinerId] || p.examinerName || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const room = (p.room || '').toLowerCase();
          if (!sName.includes(searchQuery) && !tName.includes(searchQuery) && !cat.includes(searchQuery) && !room.includes(searchQuery)) return false;
        }
        return true;
      });
      const tbody = container.querySelector('#tasmi-plotting-tbody');
      const mCards = container.querySelector('#tasmi-plotting-mobile-cards');
      if (!filtered.length) {
        const emptyHtml = `
          <div class="empty-state-box">
            <i class="ph ph-folder-open"></i>
            <div class="empty-state-box-title">Belum ada plotting jadwal</div>
            <div class="empty-state-box-desc">Tidak ada jadwal penguji tasmi atau munaqosyah yang cocok dengan kriteria filter.</div>
          </div>
        `;
        if (tbody) tbody.innerHTML = '<tr><td colspan="8">' + emptyHtml + '</td></tr>';
        if (mCards) mCards.innerHTML = emptyHtml;
        return;
      }
      tbody.innerHTML = filtered.map((p, idx) => {
        const sObj = studentMap[p.studentId] || {};
        const sName = sObj.name || p.studentName || '-';
        const fCls = classMap[sObj.classId];
        const className = fCls ? fCls.name : (sObj.classId || '-');
        const idLabel = sObj.nis ? `NIS: ${sObj.nis}` : (sObj.nisn ? `NISN: ${sObj.nisn}` : '');
        const sess = p.session || '1';
        const examiner = teacherMap[p.examinerId] || p.examinerName || '<span class="text-muted">Belum Ditentukan</span>';
        let statusBadge = '<span class="badge badge-warning">Terjadwal</span>';
        if ((p.status || '').startsWith('Lulus')) {
          statusBadge = `<span class="badge badge-success"><i class="ph ph-check"></i> ${AppConfig.escapeHtml(p.status)}${p.score ? ` (${p.score})` : ''}</span>`;
        } else if (p.status === 'Mengulang / Perbaikan') {
          statusBadge = `<span class="badge badge-danger"><i class="ph ph-arrow-counter-clockwise"></i> Mengulang${p.score ? ` (${p.score})` : ''}</span>`;
        }
        return `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><strong>${AppConfig.escapeHtml(sName)}</strong><br><small class="text-muted">${AppConfig.escapeHtml(className)}${idLabel ? ` · ${idLabel}` : ''}</small></td>
            <td>${getSessionBadge(sess)}</td>
            <td><strong class="text-primary">${AppConfig.escapeHtml(p.category || 'Tasmi')}</strong></td>
            <td>${AppConfig.escapeHtml(examiner)}</td>
            <td>${AppConfig.escapeHtml(p.date || '-')} · ${AppConfig.escapeHtml(p.time || '07.30')}<br><small class="text-muted"><i class="ph ph-map-pin"></i> ${AppConfig.escapeHtml(p.room || '-')}</small></td>
            <td>${statusBadge}</td>
            <td class="action-cell">
              <button class="btn btn-primary btn-sm" data-result-tasmi="${p.id}" title="Input Hasil Ujian"><i class="ph ph-check-circle"></i> Hasil</button>
              <button class="btn btn-outline btn-sm" data-edit-tasmi="${p.id}" title="Edit Plotting"><i class="ph ph-pencil-simple"></i></button>
              <button class="btn btn-danger btn-sm" data-del-tasmi="${p.id}" title="Hapus"><i class="ph ph-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');
      if (mCards) {
        mCards.innerHTML = filtered.map(p => {
          const sObj = studentMap[p.studentId] || {};
          const sName = sObj.name || p.studentName || '-';
          const fCls = classMap[sObj.classId];
          const className = fCls ? fCls.name : (sObj.classId || '-');
          const idLabel = sObj.nis ? `NIS: ${sObj.nis}` : (sObj.nisn ? `NISN: ${sObj.nisn}` : '');
          const sess = p.session || '1';
          const examiner = teacherMap[p.examinerId] || p.examinerName || 'Belum Ditentukan';
          let statusBadge = '<span class="badge badge-warning">Terjadwal</span>';
          if ((p.status || '').startsWith('Lulus')) {
            statusBadge = `<span class="badge badge-success"><i class="ph ph-check"></i> ${AppConfig.escapeHtml(p.status)}${p.score ? ` (${p.score})` : ''}</span>`;
          } else if (p.status === 'Mengulang / Perbaikan') {
            statusBadge = `<span class="badge badge-danger"><i class="ph ph-arrow-counter-clockwise"></i> Mengulang${p.score ? ` (${p.score})` : ''}</span>`;
          }
          return `
            <div class="tasmi-plot-card">
              <div class="tasmi-plot-card-top">
                <div class="tasmi-plot-card-student">
                  <div class="tasmi-plot-card-name">${AppConfig.escapeHtml(sName)}</div>
                  <div class="tasmi-plot-card-sub">${AppConfig.escapeHtml(className)}${idLabel ? ` · ${idLabel}` : ''}</div>
                </div>
                <div class="tasmi-plot-card-badges">
                  ${getSessionBadge(sess, true)}
                  ${statusBadge}
                </div>
              </div>
              <div class="tasmi-plot-card-body">
                <div class="tasmi-plot-card-row">
                  <span>Kategori:</span>
                  <strong class="text-primary">${AppConfig.escapeHtml(p.category || 'Tasmi')}</strong>
                </div>
                <div class="tasmi-plot-card-row">
                  <span>Penguji:</span>
                  <span>${AppConfig.escapeHtml(examiner)}</span>
                </div>
                <div class="tasmi-plot-card-row">
                  <span>Jadwal & Ruang:</span>
                  <span>${AppConfig.escapeHtml(p.date || '-')} · ${AppConfig.escapeHtml(p.time || '07.30')} (${AppConfig.escapeHtml(p.room || '-')})</span>
                </div>
                ${p.notes ? `<div class="tasmi-plot-card-notes"><strong>Catatan:</strong> ${AppConfig.escapeHtml(p.notes)}</div>` : ''}
              </div>
              <div class="tasmi-plot-card-bottom">
                <div class="tasmi-plot-card-actions">
                  <button class="btn btn-primary btn-sm" data-result-tasmi="${p.id}"><i class="ph ph-check-circle"></i> Hasil</button>
                  <button class="btn btn-outline btn-sm" data-edit-tasmi="${p.id}"><i class="ph ph-pencil-simple"></i> Edit</button>
                  <button class="btn btn-danger btn-sm" data-del-tasmi="${p.id}"><i class="ph ph-trash"></i> Hapus</button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
      container.querySelectorAll('[data-result-tasmi]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.resultTasmi;
          const p = plottingArr.find(x => x.id === id);
          if (!p) return;
          const sObj = studentMap[p.studentId] || {};
          document.getElementById('res-tasmi-id').value = p.id;
          document.getElementById('res-tasmi-stu-id').value = p.studentId || '';
          document.getElementById('res-tasmi-stu-name').innerText = sObj.name || p.studentName || '-';
          document.getElementById('res-tasmi-category').innerText = p.category || 'Tasmi';
          document.getElementById('res-tasmi-examiner').innerText = teacherMap[p.examinerId] || p.examinerName || '-';
          document.getElementById('res-tasmi-status').value = p.status || 'Lulus (Mumtaz - Istimewa)';
          document.getElementById('res-tasmi-score').value = p.score || 95;
          document.getElementById('res-tasmi-notes').value = p.notes || '';
          document.getElementById('res-tasmi-promote').checked = p.category && p.category.toLowerCase().includes('munaqasyah');
          App.openModal('modal-tasmi-result');
        };
      });
      container.querySelectorAll('[data-edit-tasmi]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.editTasmi;
          const p = plottingArr.find(x => x.id === id);
          if (!p) return;
          document.getElementById('tasmi-modal-title').innerText = "Edit Plotting Penguji Tasmi'";
          document.getElementById('tasmi-plot-id').value = p.id;
          const sObj = studentMap[p.studentId];
          const targetClassId = (sObj && sObj.classId) ? sObj.classId : 'all';
          if (document.getElementById('tasmi-filter-class')) document.getElementById('tasmi-filter-class').value = targetClassId;
          updateTasmiStudentOptions(targetClassId, p.studentId);
          document.getElementById('tasmi-plot-student').value = p.studentId || '';
          document.getElementById('tasmi-plot-session').value = p.session || '1';
          document.getElementById('tasmi-plot-category').value = p.category || 'Tasmi\' Sekali Duduk Juz 30';
          document.getElementById('tasmi-plot-examiner').value = p.examinerId || '';
          document.getElementById('tasmi-plot-date').value = p.date || '';
          document.getElementById('tasmi-plot-time').value = p.time || '07.30 - 08.30 WIB';
          document.getElementById('tasmi-plot-room').value = p.room || '';
          document.getElementById('tasmi-plot-notes').value = p.prepNotes || '';
          App.openModal('modal-tasmi-plot');
        };
      });
      container.querySelectorAll('[data-del-tasmi]').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.delTasmi;
          const p = plottingArr.find(x => x.id === id);
          const sObj = studentMap[p.studentId];
          const sName = sObj ? sObj.name : (p ? p.studentName : id);
          if (!confirm(`Hapus jadwal plotting tasmi santri "${sName}"?`)) return;
          await DB.deleteUmmiTasmiPlotting(id);
          UMMIPages.renderTasmiPlotting(container);
        };
      });
    };
    const formalClassArr = DB.toArray(allClasses).sort((a, b) => (Number(a.grade || 0) - Number(b.grade || 0)) || (a.name || '').localeCompare(b.name || ''));
    const classFilterOptions = formalClassArr.map(c => `<option value="${c.id}">${AppConfig.escapeHtml(c.name)}</option>`).join('');
    const updateTasmiStudentOptions = (filterClassId = 'all', targetStudentId = '') => {
      const selStudent = document.getElementById('tasmi-plot-student');
      if (!selStudent) return;
      let html = '<option value="">— Pilih Santri —</option>';
      if (filterClassId && filterClassId !== 'all') {
        const filtered = studentArr.filter(s => s.classId === filterClassId);
        html += filtered.map(s => {
          const idStr = s.nis ? `[NIS: ${s.nis}] ` : '';
          return `<option value="${s.id}">${AppConfig.escapeHtml(idStr + s.name)}</option>`;
        }).join('');
      } else {
        const byClass = {};
        studentArr.forEach(s => {
          const cId = s.classId || 'other';
          if (!byClass[cId]) byClass[cId] = [];
          byClass[cId].push(s);
        });
        formalClassArr.forEach(c => {
          const list = byClass[c.id];
          if (list && list.length) {
            html += `<optgroup label="Kelas ${AppConfig.escapeHtml(c.name)}">`;
            html += list.map(s => {
              const idStr = s.nis ? `[NIS: ${s.nis}] ` : '';
              return `<option value="${s.id}">${AppConfig.escapeHtml(idStr + s.name)}</option>`;
            }).join('');
            html += '</optgroup>';
          }
        });
        if (byClass['other'] && byClass['other'].length) {
          html += '<optgroup label="Tanpa Kelas / Lainnya">';
          html += byClass['other'].map(s => {
            const idStr = s.nis ? `[NIS: ${s.nis}] ` : '';
            return `<option value="${s.id}">${AppConfig.escapeHtml(idStr + s.name)}</option>`;
          }).join('');
          html += '</optgroup>';
        }
      }
      selStudent.innerHTML = html;
      if (targetStudentId) {
        selStudent.value = targetStudentId;
      }
    };
    const guruOptions = guruUmmi.map(g => `<option value="${g.id}">${AppConfig.escapeHtml(g.name)}</option>`).join('');
    const tasmiCategoryOptions = (AppConfig.TASMI_EXAM_CATEGORIES || [
      "Tasmi' Sekali Duduk Juz 30",
      "Tasmi' Sekali Duduk Juz 29",
      "Tasmi' Sekali Duduk Juz 28",
      "Tasmi' Sekali Duduk Juz 1",
      "Tasmi' Sekali Duduk Juz 2",
      "Tasmi' Sekali Duduk 1 Juz (Pilihan)",
      "Tasmi' Sekali Duduk 3 Juz",
      "Tasmi' Porsi ½ Juz (Ujian)",
      "Tasmi' Porsi ¼ Juz (Ujian)",
      "Munaqasyah Ummi Tartil (Kelulusan Jilid 1 - 6)",
      "Munaqasyah Tahfidz",
      "Ujian Pra-Munaqasyah",
      "Ujian Lanjutan Pasca Ummi"
    ]).map(c => `<option value="${AppConfig.escapeHtml(c)}">${AppConfig.escapeHtml(c)}</option>`).join('');
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-headphones"></i></div>
          <div><p class="stat-value">${plottingArr.length}</p><p class="stat-label text-muted">Total Plotting Ujian</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-student"></i></div>
          <div><p class="stat-value">${sessStats['1']}</p><p class="stat-label text-muted">Sesi 1 · Kls 1-2</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-users-three"></i></div>
          <div><p class="stat-value">${sessStats['2']}</p><p class="stat-label text-muted">Sesi 2 · Kls 3-4</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-graduation-cap"></i></div>
          <div><p class="stat-value">${sessStats['3']}</p><p class="stat-label text-muted">Sesi 3 · Kls 5-6</p></div>
        </div>
      </section>
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div>
            <h3 class="card-title">Penjadwalan & Plotting Penguji Tasmi'</h3>
            <p class="text-muted">Distribusi jadwal penguji tasmi' bil ghoib, munaqosyah kelulusan jilid, dan tingkat pasca.</p>
          </div>
          <button class="btn btn-primary" id="btn-add-tasmi-plot"><i class="ph ph-plus"></i> Buat Plotting Penguji Baru</button>
        </div>
        <div class="filter-pills" id="tasmi-session-filter-pills">
          <button type="button" class="filter-pill active" data-filter-session="all"><i class="ph ph-stack"></i> Semua Sesi (${plottingArr.length})</button>
          <button type="button" class="filter-pill" data-filter-session="1"><i class="ph ph-sun-dim"></i> Sesi 1 (Kelas 1-2) · ${sessStats['1']}</button>
          <button type="button" class="filter-pill" data-filter-session="2"><i class="ph ph-sun"></i> Sesi 2 (Kelas 3-4) · ${sessStats['2']}</button>
          <button type="button" class="filter-pill" data-filter-session="3"><i class="ph ph-sun-horizon"></i> Sesi 3 (Kelas 5-6) · ${sessStats['3']}</button>
        </div>
        <div class="search-box">
          <i class="ph ph-magnifying-glass"></i>
          <input type="text" id="input-search-tasmi" placeholder="Cari nama santri, guru penguji, kategori ujian, atau ruang...">
        </div>
      </div>
      <div class="card">
        <div class="table-responsive tasmi-plot-desktop-table">
          <table class="table">
            <thead>
              <tr>
                <th class="table-col-sm text-center">No</th>
                <th>Santri & Kelas</th>
                <th>Sesi</th>
                <th>Kategori Ujian</th>
                <th>Ustadz / Penguji</th>
                <th>Jadwal & Ruang</th>
                <th>Status & Nilai</th>
                <th class="table-col-action">Aksi</th>
              </tr>
            </thead>
            <tbody id="tasmi-plotting-tbody"></tbody>
          </table>
        </div>
        <div class="tasmi-plot-mobile-cards" id="tasmi-plotting-mobile-cards"></div>
      </div>
      <div class="modal-overlay" id="modal-tasmi-plot">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title" id="tasmi-modal-title">Buat Jadwal & Plotting Penguji Tasmi'</h3>
            <button class="btn-icon" data-close-modal="modal-tasmi-plot"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-tasmi-plot">
            <div class="modal-body">
              <input type="hidden" id="tasmi-plot-id">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Filter Kelas Santri</label>
                  <select id="tasmi-filter-class" class="form-input">
                    <option value="all">Semua Kelas</option>
                    ${classFilterOptions}
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>Sesi Jadwal Pembelajaran</label>
                  <select id="tasmi-plot-session" required class="form-input">
                    <option value="1">Sesi 1 (Kelas 1 - 2 / Fase A)</option>
                    <option value="2">Sesi 2 (Kelas 3 - 4 / Fase B)</option>
                    <option value="3">Sesi 3 (Kelas 5 - 6 / Fase C)</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Santri yang Diuji *</label>
                <select id="tasmi-plot-student" required class="form-input">
                  <option value="">— Pilih Santri —</option>
                </select>
              </div>
              <div class="form-group">
                <label>Kategori Ujian / Munaqosyah</label>
                <select id="tasmi-plot-category" required class="form-input">
                  ${tasmiCategoryOptions}
                </select>
              </div>
              <div class="form-group">
                <label>Ustadz / Ustadzah Penguji</label>
                <select id="tasmi-plot-examiner" required class="form-input">
                  <option value="">— Pilih Penguji Ummi —</option>
                  ${guruOptions}
                </select>
              </div>
              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Tanggal Ujian</label>
                  <input type="date" id="tasmi-plot-date" required class="form-input">
                </div>
                <div class="form-group flex-1">
                  <label>Waktu / Jam Ujian</label>
                  <input type="text" id="tasmi-plot-time" required value="07.30 - 08.30 WIB" class="form-input">
                </div>
              </div>
              <div class="form-group">
                <label>Ruang / Lokasi Ujian</label>
                <input type="text" id="tasmi-plot-room" list="tasmi-rooms-list" placeholder="Pilih atau ketik ruang ujian..." class="form-input">
                <datalist id="tasmi-rooms-list">
                  ${locationRecommendations.map(loc => `<option value="${AppConfig.escapeHtml(loc)}"></option>`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label>Catatan Persiapan (Opsional)</label>
                <input type="text" id="tasmi-plot-notes" placeholder="Contoh: Santri sudah hafal tuntas Juz 30 mutqin" class="form-input">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-tasmi-plot">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-tasmi-plot">Simpan Plotting Penguji</button>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-overlay" id="modal-tasmi-result">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Input Hasil Ujian Tasmi' / Munaqosyah</h3>
            <button class="btn-icon" data-close-modal="modal-tasmi-result"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-tasmi-result">
            <div class="modal-body">
              <input type="hidden" id="res-tasmi-id">
              <input type="hidden" id="res-tasmi-stu-id">
              <div class="form-group">
                <label>Nama Santri</label>
                <div id="res-tasmi-stu-name" class="font-bold text-lg text-primary"></div>
              </div>
              <div class="form-group">
                <label>Kategori Ujian & Penguji</label>
                <div class="text-sm text-muted"><span id="res-tasmi-category"></span> · Penguji: <span id="res-tasmi-examiner"></span></div>
              </div>
              <div class="form-group">
                <label>Keputusan Kelulusan</label>
                <select id="res-tasmi-status" required class="form-input">
                  <option value="Lulus (Mumtaz - Istimewa)">Lulus (Mumtaz - Istimewa)</option>
                  <option value="Lulus (Jayyid Jiddan - Sangat Baik)">Lulus (Jayyid Jiddan - Sangat Baik)</option>
                  <option value="Lulus (Jayyid - Baik)">Lulus (Jayyid - Baik)</option>
                  <option value="Mengulang / Perbaikan">Mengulang / Perbaikan</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nilai Ujian (Skala 0 - 100)</label>
                <input type="number" id="res-tasmi-score" min="0" max="100" required value="95" class="form-input">
              </div>
              <div class="form-group">
                <label>Catatan & Evaluasi Penguji (Makhraj, Tajwid, Kelancaran)</label>
                <textarea id="res-tasmi-notes" rows="3" required placeholder="Catatan evaluasi bacaan santri..." class="form-input"></textarea>
              </div>
              <div class="form-group">
                <label class="checkbox-label checkbox-label-inline">
                  <input type="checkbox" id="res-tasmi-promote">
                  <span>Naikkan tingkat santri ke <strong>Pasca Ummi</strong> (untuk lulusan Munaqosyah / tuntas seluruh jilid)</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" data-close-modal="modal-tasmi-result">Batal</button>
              <button type="submit" class="btn btn-primary" id="btn-save-tasmi-result"><i class="ph ph-floppy-disk"></i> Simpan Hasil Ujian</button>
            </div>
          </form>
        </div>
      </div>
    `;
    container.querySelectorAll('[data-filter-session]').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('[data-filter-session]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeSession = btn.dataset.filterSession;
        renderTable();
      };
    });
    const searchInput = container.querySelector('#input-search-tasmi');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTable();
      };
    }
    renderTable();
    const selFilterClass = document.getElementById('tasmi-filter-class');
    if (selFilterClass) {
      selFilterClass.onchange = () => {
        const cId = selFilterClass.value;
        updateTasmiStudentOptions(cId);
        if (cId !== 'all') {
          const cObj = classMap[cId];
          const grade = cObj ? (Number(cObj.grade) || parseInt(cObj.name || '', 10) || 0) : 0;
          if (grade === 1 || grade === 2) document.getElementById('tasmi-plot-session').value = '1';
          else if (grade === 3 || grade === 4) document.getElementById('tasmi-plot-session').value = '2';
          else if (grade === 5 || grade === 6) document.getElementById('tasmi-plot-session').value = '3';
        }
      };
    }
    const selStudent = document.getElementById('tasmi-plot-student');
    if (selStudent) {
      selStudent.onchange = () => {
        const sObj = studentMap[selStudent.value];
        if (sObj) {
          const fCls = classMap[sObj.classId];
          const grade = fCls ? (Number(fCls.grade) || parseInt(fCls.name || '', 10) || 0) : 0;
          if (grade === 1 || grade === 2) document.getElementById('tasmi-plot-session').value = '1';
          else if (grade === 3 || grade === 4) document.getElementById('tasmi-plot-session').value = '2';
          else if (grade === 5 || grade === 6) document.getElementById('tasmi-plot-session').value = '3';
        }
      };
    }
    document.getElementById('btn-add-tasmi-plot').onclick = () => {
      document.getElementById('tasmi-modal-title').innerText = "Buat Jadwal & Plotting Penguji Tasmi'";
      document.getElementById('form-tasmi-plot').reset();
      document.getElementById('tasmi-plot-id').value = '';
      document.getElementById('tasmi-plot-room').value = '';
      document.getElementById('tasmi-plot-date').value = AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr() : new Date().toISOString().split('T')[0];
      document.getElementById('tasmi-plot-time').value = '07.30 - 08.30 WIB';
      document.getElementById('tasmi-plot-session').value = activeSession !== 'all' ? activeSession : '1';
      if (document.getElementById('tasmi-filter-class')) document.getElementById('tasmi-filter-class').value = 'all';
      updateTasmiStudentOptions('all');
      App.openModal('modal-tasmi-plot');
    };
    document.getElementById('form-tasmi-plot').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('tasmi-plot-id').value.trim();
      const existItem = id ? plottingArr.find(x => x.id === id) : null;
      const studentId = document.getElementById('tasmi-plot-student').value;
      const sObj = studentMap[studentId];
      const session = document.getElementById('tasmi-plot-session').value;
      const category = document.getElementById('tasmi-plot-category').value;
      const examinerId = document.getElementById('tasmi-plot-examiner').value;
      const date = document.getElementById('tasmi-plot-date').value;
      const time = document.getElementById('tasmi-plot-time').value.trim();
      const room = document.getElementById('tasmi-plot-room').value.trim();
      const prepNotes = document.getElementById('tasmi-plot-notes').value.trim();
      const btn = document.getElementById('btn-save-tasmi-plot');
      btn.disabled = true;
      btn.innerText = 'Menyimpan...';
      try {
        const data = {
          studentId,
          studentName: sObj ? sObj.name : '',
          session,
          category,
          examinerId,
          examinerName: teacherMap[examinerId] || '',
          date,
          time,
          room,
          prepNotes,
          status: existItem ? (existItem.status || 'Terjadwal') : 'Terjadwal'
        };
        await DB.saveUmmiTasmiPlotting(id || null, data);
        App.closeModal('modal-tasmi-plot');
        UMMIPages.renderTasmiPlotting(container);
      } catch (err) {
        alert(err.message || 'Gagal menyimpan plotting penguji tasmi');
      } finally {
        btn.disabled = false;
        btn.innerText = 'Simpan Plotting Penguji';
      }
    };
    document.getElementById('form-tasmi-result').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('res-tasmi-id').value;
      const sid = document.getElementById('res-tasmi-stu-id').value;
      const status = document.getElementById('res-tasmi-status').value;
      const score = Number(document.getElementById('res-tasmi-score').value) || 0;
      const notes = document.getElementById('res-tasmi-notes').value.trim();
      const promote = document.getElementById('res-tasmi-promote').checked;
      const btn = document.getElementById('btn-save-tasmi-result');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      try {
        await DB.saveUmmiTasmiPlotting(id, {
          status,
          score,
          notes,
          evaluatedAt: Date.now()
        });
        if (promote && sid && status.startsWith('Lulus')) {
          await DB.updateStudentUmmiLevel(sid, 'Pasca');
        }
        App.closeModal('modal-tasmi-result');
        alert('Hasil ujian tasmi berhasil disimpan!');
        UMMIPages.renderTasmiPlotting(container);
      } catch (err) {
        alert(err.message || 'Gagal menyimpan hasil ujian.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Hasil Ujian';
      }
    };
  }
};