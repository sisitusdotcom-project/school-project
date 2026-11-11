const CurriculumPages = {
  async renderDashboard(container) {
    Router.setTitle('Kurikulum', 'Pusat pengelolaan struktur akademik, kalender pembelajaran, dan supervisi mutu KBM.');
    const today = new Date();
    const dateStr = AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr(today) : today.toISOString().slice(0, 10);
    const user = Auth.userData || Auth.currentUser || {};
    const uid = user.uid || Auth.currentUser?.uid;
    const assignments = typeof App !== 'undefined' && App.getAssignments ? App.getAssignments() : (Auth.currentAssignments || []);
    const canManageSettings = Auth.currentRole === AppConfig.ROLES.ADMIN ||
      assignments.includes('WAKA_KURIKULUM') ||
      assignments.includes('TIM_IT') ||
      assignments.includes('WAKA_HUMAS_PERSONALIA');
    const quickNavHtml = App.renderQuickNav([
      { href: '#/admin/classes', icon: 'ph-chalkboard', title: 'Pembagian Rombel', desc: 'Daftar kelas & penugasan wali' },
      { href: '#/admin/classes?action=promo', icon: 'ph-arrow-fat-lines-up', title: 'Kenaikan & Promosi Rombel', desc: 'Proses kenaikan kelas & kelulusan alumni' },
      { href: '#/admin/subjects', icon: 'ph-book-open', title: 'Pemetaan Mapel & Guru', desc: 'Distribusi guru pengampu' },
      { href: '#/curriculum/schedules', icon: 'ph-calendar-blank', title: 'Jadwal Pelajaran', desc: 'Jadwal KBM & kalender akademik' },
      { href: '#/curriculum/syllabus', icon: 'ph-upload-simple', title: 'Perangkat & Modul Ajar', desc: 'Verifikasi Prota, Prosem & RPP' },
      { href: '#/curriculum/monitoring', icon: 'ph-eye', title: 'Pemantauan KBM', desc: 'Kendali keterlaksanaan jam ajar' },
      { href: '#/curriculum/questions', icon: 'ph-question', title: 'Bank Soal Asesmen', desc: 'Kumpulan kisi-kisi & naskah STS/SAS' },
      { href: '#/curriculum/journals', icon: 'ph-notebook', title: 'Jurnal Pembelajaran', desc: 'Catatan harian materi kelas' },
      { href: '#/curriculum/grades', icon: 'ph-chart-bar', title: 'Rekapitulasi Nilai', desc: 'Rekap capaian akademik murid' },
      { href: '#/curriculum/evaluations', icon: 'ph-sliders', title: 'Sistem Penilaian', desc: 'Bobot formatif, sumatif & TP' },
      { href: '#/curriculum/supervision', icon: 'ph-clipboard-text', title: 'Supervisi Guru', desc: 'Observasi pedagogik mengajar' }
    ]);
    const [settings, subjects, classes, myAtt] = await Promise.all([
      DB.getSettings(),
      DB.getSubjects(),
      DB.getClasses(),
      DB.getTeacherAttendance(dateStr, uid).catch(() => null)
    ]);
    const subjectList = DB.toArray(subjects);
    const classList = DB.toArray(classes);
    const heroHtml = AppConfig.getDashboardHeroHtml({
      user,
      attendanceRecord: myAtt,
      position: 'Waka / Staf Kurikulum',
      date: today
    });
    container.innerHTML = `
      ${heroHtml}
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-books"></i></div>
          <div><p class="stat-value">${settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear}</p><p class="stat-label text-muted">Tahun Ajaran</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-calendar"></i></div>
          <div><p class="stat-value">Semester ${settings.currentSemester || AppConfig.DEFAULT_SETTINGS.currentSemester}</p><p class="stat-label text-muted">Semester Berjalan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-list-checks"></i></div>
          <div><p class="stat-value">${subjectList.length}</p><p class="stat-label text-muted">Mata Pelajaran Aktif</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-buildings"></i></div>
          <div><p class="stat-value">${classList.length}</p><p class="stat-label text-muted">Rombongan Belajar</p></div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Operasional Kurikulum</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            ${quickNavHtml}
          </div>
        </div>
      </section>
      ${canManageSettings ? `
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-gear"></i> Konfigurasi Kalender Akademik Aktif (Pusat Mandat SSOT)</h3>
        </div>
        <div class="card-body">
          <form id="form-academic-settings" class="inline-form">
            <div class="form-group compact-field">
              <label>Tahun Ajaran</label>
              <input id="set-year" value="${settings.currentAcademicYear || AppConfig.DEFAULT_SETTINGS.currentAcademicYear}" placeholder="Contoh: 2026/2027">
            </div>
            <div class="form-group compact-field">
              <label>Semester</label>
              <select id="set-sem">
                <option value="1" ${settings.currentSemester === '1' ? 'selected' : ''}>Semester 1 (Ganjil)</option>
                <option value="2" ${settings.currentSemester === '2' ? 'selected' : ''}>Semester 2 (Genap)</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Pengaturan</button>
          </form>
        </div>
      </section>
      ` : ''}
    `;
    const formAcademic = document.getElementById('form-academic-settings');
    if (formAcademic) {
      formAcademic.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isConfirmed = confirm('PERINGATAN: Mengubah Tahun Ajaran atau Semester akan berdampak ke seluruh sistem (Presensi, Nilai, dll). Yakin ingin menyimpan perubahan ini?');
        if (!isConfirmed) return;
        const btn = formAcademic.querySelector('button');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
        try {
          const yearVal = document.getElementById('set-year').value.trim();
          const semVal = document.getElementById('set-sem').value;
          await DB.updateSettings({
            academicYear: yearVal,
            currentAcademicYear: yearVal,
            semester: semVal === '2' ? 'Genap' : 'Ganjil',
            currentSemester: semVal
          });
          btn.innerHTML = '<i class="ph ph-check"></i> Berhasil Disimpan';
        } catch (error) {
          console.error('Error updating academic settings', error);
          btn.innerHTML = '<i class="ph ph-x"></i> Gagal Menyimpan';
        } finally {
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }, 2000);
        }
      });
    }
  }
};