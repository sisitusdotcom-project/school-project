const PersonnelPages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    const assignments = Auth.currentAssignments || [];
    Router.setTitle('Humas & Personalia', 'Pusat komando administrasi kepegawaian, disiplin kerja, dan kemitraan madrasah.');
    const isAdmin = role === AppConfig.ROLES.ADMIN;
    const isWaka = isAdmin || assignments.includes('WAKA_HUMAS_PERSONALIA');
    const todayStr = new Date().toISOString().split('T')[0];
    const [usersData, settingsData, attendanceData] = await Promise.all([
      DB.getAllUsers(),
      DB.getSettings(),
      DB.getTeacherAttendanceByDate(todayStr).catch(() => ({}))
    ]);
    const allUsers = DB.toArray(usersData);
    const gtkList = allUsers.filter((u) => u && u.role !== 'ortu');
    const guruCount = gtkList.filter((u) => u.role === 'guru').length;
    const tendikCount = gtkList.filter((u) => u.role === 'tendik').length;
    const totalGtk = gtkList.length;
    const attList = DB.toArray(attendanceData);
    const hadirToday = attList.filter((a) => a && (a.time_in || a.status === 'Hadir')).length;
    const settings = settingsData || {};
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-identification-card"></i></div>
          <div><p class="stat-value">${totalGtk}</p><p class="stat-label text-muted">Total GTK Aktif</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-chalkboard-teacher"></i></div>
          <div><p class="stat-value">${guruCount}</p><p class="stat-label text-muted">Guru / Pendidik</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-briefcase"></i></div>
          <div><p class="stat-value">${tendikCount}</p><p class="stat-label text-muted">Tenaga Kependidikan</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-calendar-check"></i></div>
          <div><p class="stat-value">${hadirToday} / ${totalGtk}</p><p class="stat-label text-muted">Presensi Masuk Hari Ini</p></div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Operasional Humas & Personalia</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            <a href="#/personnel/data" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-folder-user"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Data Kepegawaian</div>
                <div class="quick-nav-desc">Buku induk & berkas GTK</div>
              </div>
            </a>
            <a href="#/admin/assignments" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-tree-structure"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Distribusi Penugasan</div>
                <div class="quick-nav-desc">Plotting Waka, Tim & Wali Kelas</div>
              </div>
            </a>
            <a href="#/admin/attendance" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-clock-user"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pantau Disiplin GTK</div>
                <div class="quick-nav-desc">Monitoring presensi GPS realtime</div>
              </div>
            </a>
            <a href="#/personnel/evaluations" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-chart-line-up"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Penilaian Kinerja (PKG)</div>
                <div class="quick-nav-desc">Rubrik evaluasi SKP tahunan</div>
              </div>
            </a>
            <a href="#/personnel/welfare" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-hand-heart"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Kesejahteraan Staf</div>
                <div class="quick-nav-desc">Santunan sosial & apresiasi</div>
              </div>
            </a>
            <a href="#/personnel/complaints" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-chat-teardrop-dots"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Layanan Pengaduan</div>
                <div class="quick-nav-desc">Aspirasi & masukan wali murid</div>
              </div>
            </a>
            <a href="#/personnel/events" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-calendar-plus"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Manajemen Acara</div>
                <div class="quick-nav-desc">Kepanitiaan agenda besar sekolah</div>
              </div>
            </a>
            <a href="#/personnel/partnerships" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-handshake"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Kemitraan & MoU</div>
                <div class="quick-nav-desc">Kerja sama instansi eksternal</div>
              </div>
            </a>
          </div>
        </div>
      </section>
      ${isWaka ? `
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-clock"></i> Pengaturan Jam Operasional Absensi Guru & Karyawan</h3>
        </div>
        <div class="card-body">
          <form id="form-attendance-time-settings" class="inline-form">
            <div class="form-group compact-field">
              <label>Jam Masuk Mulai</label>
              <input id="set-checkin-start" type="time" value="${settings.attendanceRules?.checkInStart || '06:00'}">
            </div>
            <div class="form-group compact-field">
              <label>Batas Akhir Masuk</label>
              <input id="set-checkin-end" type="time" value="${settings.attendanceRules?.checkInEnd || '07:30'}">
            </div>
            <div class="form-group compact-field">
              <label>Jam Pulang Mulai</label>
              <input id="set-checkout-start" type="time" value="${settings.attendanceRules?.checkOutStart || '15:00'}">
            </div>
            <div class="form-group compact-field">
              <label>Batas Akhir Pulang</label>
              <input id="set-checkout-end" type="time" value="${settings.attendanceRules?.checkOutEnd || '17:00'}">
            </div>
            <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Jam Absensi</button>
          </form>
        </div>
      </section>
      <section class="card">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-calendar-blank"></i> Periode Rekapitulasi Presensi Kepegawaian</h3>
        </div>
        <div class="card-body">
          <form id="form-attendance-date-settings" class="inline-form">
            <div class="form-group compact-field">
              <label>Mulai Berlaku</label>
              <input id="set-date-start" type="date" value="${settings.attendanceRules?.attendanceStartDate || ''}">
            </div>
            <div class="form-group compact-field">
              <label>Sampai Tanggal</label>
              <input id="set-date-end" type="date" value="${settings.attendanceRules?.attendanceEndDate || ''}">
            </div>
            <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Periode</button>
          </form>
        </div>
      </section>
      ` : ''}
    `;
    if (!isWaka) return;
    const bindSettingsForm = (formId, buildPayload) => {
      const form = document.getElementById(formId);
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const isConfirmed = confirm('Anda akan memperbarui konfigurasi presensi GTK untuk seluruh sistem madrasah. Lanjutkan?');
        if (!isConfirmed) return;
        const btn = form.querySelector('button');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';
        try {
          const payload = buildPayload();
          const current = await DB.getSettings();
          const updatedRules = {
            ...(current.attendanceRules || {}),
            ...payload
          };
          await DB.updateSettings({ attendanceRules: updatedRules });
          btn.innerHTML = '<i class="ph ph-check"></i> Berhasil Disimpan';
        } catch (error) {
          console.error('Gagal memperbarui pengaturan presensi', error);
          btn.innerHTML = '<i class="ph ph-x"></i> Gagal Menyimpan';
        } finally {
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }, 2000);
        }
      });
    };
    bindSettingsForm('form-attendance-time-settings', () => ({
      checkInStart: document.getElementById('set-checkin-start').value,
      checkInEnd: document.getElementById('set-checkin-end').value,
      checkOutStart: document.getElementById('set-checkout-start').value,
      checkOutEnd: document.getElementById('set-checkout-end').value
    }));
    bindSettingsForm('form-attendance-date-settings', () => ({
      attendanceStartDate: document.getElementById('set-date-start').value,
      attendanceEndDate: document.getElementById('set-date-end').value
    }));
  }
};
