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
    KOMITE: 'komite',
    TENDIK: 'tendik'
  });
  const PRIMARY_ROLES = Object.freeze({
    [ROLES.GURU]: 'Guru / Pendidik',
    [ROLES.TENDIK]: 'Tenaga Kependidikan',
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
    'TIM_UMMI': 'Guru / Tim Ummi',
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
      { hash: '#/guru/observations', icon: 'ph-note-pencil', text: 'Riwayat Observasi', group: 'Tugas Utama Guru' }
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
      { hash: '#/facilities', icon: 'ph-building-office', text: 'Monitoring Sarpras' }
    ],
    [ROLES.TENDIK]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
      { hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' },
      { hash: '#/tendik/performance', icon: 'ph-clipboard-text', text: 'Laporan Kinerja', group: 'Tupoksi Tenaga Kependidikan' },
      { hash: '#/tendik/portfolio', icon: 'ph-folder', text: 'Portofolio', group: 'Tupoksi Tenaga Kependidikan' }
    ],
    [ROLES.GURU_EKSKUL]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' }
    ],
    [ROLES.KOMITE]: [
      { hash: '#/komite/activities', icon: 'ph-users-three', text: 'Kegiatan Paguyuban' },
      { hash: '#/komite/finance-paguyuban', icon: 'ph-wallet', text: 'Keuangan Paguyuban' },
      { hash: '#/komite/finance-komite', icon: 'ph-wallet', text: 'Keuangan Komite' }
    ],
    [ROLES.ORTU]: [
      { hash: '#/ortu/dashboard', icon: 'ph-graduation-cap', text: 'Perkembangan Anak' },
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
      { hash: '#/admin/attendance', icon: 'ph-clock', text: 'Pantau Disiplin Guru', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/evaluations', icon: 'ph-chart-line-up', text: 'Penilaian Kinerja (PKG)', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/training', icon: 'ph-certificate', text: 'Pelatihan & Kompetensi', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/welfare', icon: 'ph-heart', text: 'Kesejahteraan Staf', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/publications', icon: 'ph-megaphone', text: 'Publikasi & Informasi', group: 'Humas & Personalia: Komunikasi Publik & Aduan' },
      { hash: '#/personnel/complaints', icon: 'ph-chats', text: 'Layanan Pengaduan', group: 'Humas & Personalia: Komunikasi Publik & Aduan' },
      { hash: '#/personnel/documents', icon: 'ph-folder', text: 'Dokumen Kerja Sama', group: 'Humas & Personalia: Kemitraan & Dokumen' },
      { hash: '#/personnel/partnerships', icon: 'ph-handshake', text: 'Kemitraan & MoU', group: 'Humas & Personalia: Kemitraan & Dokumen' },
      { hash: '#/personnel/events', icon: 'ph-calendar-star', text: 'Manajemen Acara', group: 'Humas & Personalia: Kemitraan & Dokumen' }
    ],
    'STAF_HUMAS_PERSONALIA': [
      { hash: '#/personnel', icon: 'ph-briefcase', text: 'Dashboard Humas & Personalia', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/personnel/data', icon: 'ph-folder-user', text: 'Data Kepegawaian', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/personnel/training', icon: 'ph-certificate', text: 'Pelatihan & Kompetensi', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/welfare', icon: 'ph-heart', text: 'Kesejahteraan Staf', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/publications', icon: 'ph-megaphone', text: 'Publikasi & Informasi', group: 'Humas & Personalia: Komunikasi Publik & Aduan' },
      { hash: '#/personnel/complaints', icon: 'ph-chats', text: 'Layanan Pengaduan', group: 'Humas & Personalia: Komunikasi Publik & Aduan' },
      { hash: '#/personnel/documents', icon: 'ph-folder', text: 'Dokumen Kerja Sama', group: 'Humas & Personalia: Kemitraan & Dokumen' },
      { hash: '#/personnel/partnerships', icon: 'ph-handshake', text: 'Kemitraan & MoU', group: 'Humas & Personalia: Kemitraan & Dokumen' },
      { hash: '#/personnel/events', icon: 'ph-calendar-star', text: 'Manajemen Acara', group: 'Humas & Personalia: Kemitraan & Dokumen' }
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
      { hash: '#/curriculum/grades', icon: 'ph-exam', text: 'Database Nilai', group: 'Kurikulum: Supervisi & Evaluasi' },
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
      { hash: '#/curriculum/grades', icon: 'ph-exam', text: 'Database Nilai', group: 'Kurikulum: Supervisi & Evaluasi' }
    ],
    'WAKA_KEUANGAN': [
      { hash: '#/finance', icon: 'ph-wallet', text: 'Dashboard Keuangan', group: 'Keuangan: Umum' },
      { hash: '#/finance/rkas', icon: 'ph-chart-bar', text: 'Penyusunan RKAS', group: 'Keuangan: Perencanaan' },
      { hash: '#/finance/transactions', icon: 'ph-arrows-left-right', text: 'Penerimaan & Pengeluaran', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/cashbook', icon: 'ph-book-open', text: 'Buku Kas Umum (BKU)', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/bos', icon: 'ph-receipt', text: 'Laporan BOS', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/scholarships', icon: 'ph-hand-coins', text: 'Pencairan Beasiswa & SPP', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/student-bills', icon: 'ph-receipt', text: 'Tagihan & SPP Siswa', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/salaries', icon: 'ph-money', text: 'Penghitungan Gaji', group: 'Keuangan: Penggajian & Proposal' },
      { hash: '#/finance/proposals', icon: 'ph-file-text', text: 'Persetujuan Proposal', group: 'Keuangan: Penggajian & Proposal' },
      { hash: '#/finance/archives', icon: 'ph-archive-box', text: 'Arsip Bukti Transaksi', group: 'Keuangan: Dokumen & Laporan' },
      { hash: '#/finance/reports', icon: 'ph-file-text', text: 'LPJ & Sinkronisasi Kas', group: 'Keuangan: Dokumen & Laporan' },
      { hash: '#/finance/transparency', icon: 'ph-projector-screen', text: 'Publikasi Anggaran', group: 'Keuangan: Dokumen & Laporan' }
    ],
    'STAF_KEUANGAN': [
      { hash: '#/finance', icon: 'ph-wallet', text: 'Dashboard Keuangan', group: 'Keuangan: Umum' },
      { hash: '#/finance/transactions', icon: 'ph-arrows-left-right', text: 'Penerimaan & Pengeluaran', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/cashbook', icon: 'ph-book-open', text: 'Buku Kas Umum (BKU)', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/bos', icon: 'ph-receipt', text: 'Laporan BOS', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/scholarships', icon: 'ph-hand-coins', text: 'Pencairan Beasiswa & SPP', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/student-bills', icon: 'ph-receipt', text: 'Tagihan & SPP Siswa', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/archives', icon: 'ph-archive-box', text: 'Arsip Bukti Transaksi', group: 'Keuangan: Dokumen & Laporan' },
      { hash: '#/finance/reports', icon: 'ph-file-text', text: 'LPJ & Sinkronisasi Kas', group: 'Keuangan: Dokumen & Laporan' }
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
      { hash: '#/guru/portfolio', icon: 'ph-folder', text: 'Portofolio Pembina', group: 'Guru Ekskul: Pengembangan' }
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
      { hash: '#/guru/ummi/tasmi', icon: 'ph-headphones', text: 'Ujian Tasmi\' (Penguji)', group: 'Guru Ummi: Tahfidz & Tasmi\'' }
    ],
    'TIM_B_INGGRIS': [
      { hash: '#/guru/english/classes', icon: 'ph-chalkboard-teacher', text: 'Rombel English Lab', group: 'English Lab' },
      { hash: '#/guru/english/progress', icon: 'ph-translate', text: 'Jurnal Progres Speaking', group: 'English Lab' }
    ]
  });
  const DEFAULT_SETTINGS = Object.freeze({
    currentAcademicYear: '2026/2027',
    currentSemester: '1',
    attendanceRules: Object.freeze({
      checkInStart: '07:00',
      checkInEnd: '09:00',
      checkOutStart: '15:00',
      checkOutEnd: '17:00',
      attendanceStartDate: '',
      attendanceEndDate: ''
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
    return {
      ...DEFAULT_SETTINGS,
      ...source,
      attendanceRules: {
        ...DEFAULT_SETTINGS.attendanceRules,
        ...attendanceRules
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
  function isTeachingAssignment(a) {
    const prefixes = ['GURU_KELAS_', 'GURU_MAPEL_', 'TIM_UMMI', 'TIM_B_INGGRIS'];
    return prefixes.some(prefix => a.startsWith(prefix)) || a === 'GURU_UMMI' || a === 'KOORD_UMMI';
  }
  function isPureGuruEkstra(role, assignments = []) {
    const list = Array.isArray(assignments) ? assignments : [];
    const hasEkstra = list.some(a => a && a.startsWith('GURU_EKSTRA_')) || role === ROLES.GURU_EKSKUL;
    const hasAcademic = list.some(isTeachingAssignment);
    return hasEkstra && !hasAcademic && role !== ROLES.TENDIK && role !== ROLES.ADMIN && role !== ROLES.KEPSEK;
  }
  function getRoleAssignmentLabel(user = {}) {
    const assignments = getRoleAssignments(user);
    if (!assignments.length) return getRoleLabel(user.role);
    const isPure = isPureGuruEkstra(user.role, assignments);
    const unitLabels = assignments.map((item) => {
      if (UNIT_LABELS[item]) return UNIT_LABELS[item];
      return item.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    }).join(', ');
    const baseRole = isPure ? 'Guru Ekstrakurikuler' : getRoleLabel(user.role);
    return `${baseRole} · ${unitLabels}`;
  }
  function getRoleNav(role, assignments = []) {
    let baseNav = [...(NAV_ITEMS[role] || [])];
    const isEkstra = assignments.some(a => a.startsWith('GURU_EKSTRA_')) || role === ROLES.GURU_EKSKUL;
    const isPure = isPureGuruEkstra(role, assignments);
    const isGuru = !isPure && (role === ROLES.GURU || assignments.some(isTeachingAssignment));
    const isWaliKelas = assignments.some(a => a.startsWith('GURU_KELAS_'));
    const isGuruEkstra = isEkstra;
    const isTimUmmi = assignments.some(a => a === 'GURU_UMMI' || a === 'TIM_UMMI' || a === 'KOORD_UMMI');
    const isTimInggris = assignments.some(a => a === 'TIM_B_INGGRIS');
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
      case ROLES.TENDIK:
        return 'badge-primary';
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
  const APP_DEFAULTS = Object.freeze({
    googleDriveUploadUrl: 'https://script.google.com/macros/s/AKfycbwHNSb34p_FcX_dTQuw87viaZ9joh2rT3KdtMLBVvwpocWzyF3HICPUPRfPuy63LDsNsw/exec',
    attendanceWorkerUrl: 'https://musada-absensi.sisitusdotcom.workers.dev/',
    attendanceGeofence: Object.freeze({
      lat: null,
      lng: null,
      radiusMeters: null
    })
  });
  const runtimeConfig = {
    googleDriveUploadUrl: window.GOOGLE_DRIVE_UPLOAD_URL || APP_DEFAULTS.googleDriveUploadUrl,
    attendanceWorkerUrl: window.CLOUDFLARE_ATTENDANCE_WORKER_URL || APP_DEFAULTS.attendanceWorkerUrl,
    attendanceGeofence: window.APP_ATTENDANCE_GEOFENCE || APP_DEFAULTS.attendanceGeofence
  };
  window.APP_ATTENDANCE_GEOFENCE = Object.freeze(runtimeConfig.attendanceGeofence);
  window.GOOGLE_DRIVE_UPLOAD_URL = runtimeConfig.googleDriveUploadUrl;
  window.CLOUDFLARE_ATTENDANCE_WORKER_URL = runtimeConfig.attendanceWorkerUrl;
  window.GOOGLE_DRIVE_CONFIG = Object.freeze({
    uploadUrl: runtimeConfig.googleDriveUploadUrl,
    attendanceWorkerUrl: runtimeConfig.attendanceWorkerUrl
  });
  window.AppConfig = Object.freeze({
    ROLES,
    PRIMARY_ROLES,
    ROLE_LABELS,
    UNIT_LABELS,
    buildTeachingLabels,
    NAV_ITEMS,
    DEFAULT_SETTINGS,
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
    isPureGuruEkstra,
    formatUserName,
    getStudentNis,
    getStudentNisn,
    formatStudentIdentity,
    getClassPhase
  });
})();