const CurriculumPages = {
  async renderDashboard(container) {
    Router.setTitle('Kurikulum', 'Pusat pengelolaan struktur akademik, kalender pembelajaran, dan supervisi mutu KBM.');
    const today = new Date();
    const dateStr = AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr(today) : today.toISOString().slice(0, 10);
    const user = Auth.userData || Auth.currentUser || {};
    const uid = user.uid || Auth.currentUser?.uid;
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
            <a href="#/admin/classes" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-chalkboard"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pembagian Rombel</div>
                <div class="quick-nav-desc">Daftar kelas & penugasan wali</div>
              </div>
            </a>
            <a href="#/admin/classes?action=promo" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-arrow-fat-lines-up"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Kenaikan & Promosi Rombel</div>
                <div class="quick-nav-desc">Proses kenaikan kelas & kelulusan alumni</div>
              </div>
            </a>
            <a href="#/admin/subjects" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-book-open"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pemetaan Mapel & Guru</div>
                <div class="quick-nav-desc">Distribusi guru pengampu</div>
              </div>
            </a>
            <a href="#/curriculum/schedules" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-calendar-blank"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Jadwal Pelajaran</div>
                <div class="quick-nav-desc">Jadwal KBM & kalender akademik</div>
              </div>
            </a>
            <a href="#/curriculum/syllabus" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-upload-simple"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Perangkat & Modul Ajar</div>
                <div class="quick-nav-desc">Verifikasi Prota, Prosem & RPP</div>
              </div>
            </a>
            <a href="#/curriculum/monitoring" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-eye"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pemantauan KBM</div>
                <div class="quick-nav-desc">Kendali keterlaksanaan jam ajar</div>
              </div>
            </a>
            <a href="#/curriculum/questions" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-question"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Bank Soal Asesmen</div>
                <div class="quick-nav-desc">Kumpulan kisi-kisi & naskah STS/SAS</div>
              </div>
            </a>
            <a href="#/curriculum/journals" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-notebook"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Jurnal Pembelajaran</div>
                <div class="quick-nav-desc">Catatan harian materi kelas</div>
              </div>
            </a>
            <a href="#/curriculum/grades" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-chart-bar"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Rekapitulasi Nilai</div>
                <div class="quick-nav-desc">Rekap capaian akademik murid</div>
              </div>
            </a>
            <a href="#/curriculum/evaluations" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-sliders"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Sistem Penilaian</div>
                <div class="quick-nav-desc">Bobot formatif, sumatif & TP</div>
              </div>
            </a>
            <a href="#/curriculum/supervision" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-clipboard-text"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Supervisi Guru</div>
                <div class="quick-nav-desc">Observasi pedagogik mengajar</div>
              </div>
            </a>
          </div>
        </div>
      </section>
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