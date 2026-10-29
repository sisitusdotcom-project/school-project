const PersonnelPages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    const assignments = Auth.currentAssignments || [];
    Router.setTitle('Humas & Personalia', 'Pusat komando administrasi kepegawaian, disiplin kerja, dan kemitraan sekolah.');
    const isAdmin = role === AppConfig.ROLES.ADMIN;
    const isWaka = isAdmin || assignments.includes('WAKA_HUMAS_PERSONALIA');
    const todayStr = AppConfig.getLocalDateStr ? AppConfig.getLocalDateStr() : new Date().toISOString().split('T')[0];
    const [usersData, settingsData, attendanceData] = await Promise.all([
      DB.getAllUsers(),
      DB.getSettings(),
      DB.getTeacherAttendanceByDate(todayStr).catch(() => ({}))
    ]);
    const allUsers = DB.toArray(usersData);
    const gtkList = allUsers.filter((u) => AppConfig.isGTK(u));
    const guruCount = gtkList.filter((u) => AppConfig.isTeacher(u)).length;
    const tendikCount = gtkList.filter((u) => u.role === 'tendik').length;
    const totalGtk = gtkList.length;
    const attList = DB.toArray(attendanceData);
    const hadirToday = attList.filter((a) => a && (a.time_in || a.status === 'Hadir')).length;
    const settings = settingsData || {};
    const scheduleDefs = AppConfig.SCHEDULE_DAY_DEFS || {
      gtk: [
        { key: 'senin', label: 'Senin', note: 'Batas Masuk 06.45 | Pulang 14.30', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '14:30', outEnd: '17:30' },
        { key: 'selasa', label: 'Selasa', note: 'Batas Masuk 06.45 | Pulang 15.15', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '15:15', outEnd: '17:30' },
        { key: 'rabu', label: 'Rabu', note: 'Batas Masuk 06.45 | Pulang 15.15', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '15:15', outEnd: '17:30' },
        { key: 'kamis', label: 'Kamis', note: 'Batas Masuk 06.45 | Pulang 14.45', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '14:45', outEnd: '17:30' },
        { key: 'jumat', label: 'Jumat', note: 'Batas Masuk 06.45 | Pulang 12.45', status: 'active', inStart: '06:00', inEnd: '06:45', outStart: '12:45', outEnd: '17:30' },
        { key: 'sabtu', label: 'Sabtu', note: 'Batas Masuk 08.00 | Opsional (Pembinaan)', status: 'optional', inStart: '07:00', inEnd: '08:00', outStart: '11:00', outEnd: '13:00' }
      ],
      ummi: [
        { key: 'senin', label: 'Senin', note: 'Batas Masuk 07.15 | Pulang 12.30', status: 'active', inStart: '06:00', inEnd: '07:15', outStart: '12:30', outEnd: '15:00' },
        { key: 'selasa', label: 'Selasa', note: 'Batas Masuk 07.15 | Pulang 12.30', status: 'active', inStart: '06:00', inEnd: '07:15', outStart: '12:30', outEnd: '15:00' },
        { key: 'rabu', label: 'Rabu', note: 'Batas Masuk 07.15 | Pulang 12.30', status: 'active', inStart: '06:00', inEnd: '07:15', outStart: '12:30', outEnd: '15:00' },
        { key: 'kamis', label: 'Kamis', note: 'Batas Masuk 07.00 | Pulang 12.00', status: 'active', inStart: '06:00', inEnd: '07:00', outStart: '12:00', outEnd: '15:00' },
        { key: 'jumat', label: 'Jumat', note: 'Libur (Tidak Ada Absen)', status: 'off', inStart: '06:00', inEnd: '07:00', outStart: '11:00', outEnd: '13:00' },
        { key: 'sabtu', label: 'Sabtu', note: 'Batas Masuk 08.00 | Opsional (Pembinaan Tanpa Terlambat)', status: 'optional', inStart: '06:00', inEnd: '08:00', outStart: '10:00', outEnd: '13:00' }
      ]
    };
    const renderScheduleRows = (group) => {
      const defs = scheduleDefs[group] || [];
      const currentGroup = settings.attendanceRules?.schedules?.[group] || {};
      return defs.map((d) => {
        const cur = currentGroup[d.key] || {};
        let status = d.status;
        if (cur.isOff) status = 'off';
        else if (cur.isOptional) status = 'optional';
        else if (cur.inStart || cur.inEnd) status = 'active';
        const inStartVal = cur.inStart || d.inStart;
        const inEndVal = cur.inEnd || d.inEnd;
        const outStartVal = cur.outStart || d.outStart;
        const outEndVal = cur.outEnd || d.outEnd;
        let dynamicNote = d.note;
        if (status === 'off') {
          dynamicNote = 'Libur (Tidak Ada Absen)';
        } else if (status === 'optional') {
          dynamicNote = `Batas Masuk ${inEndVal} | Opsional (Pembinaan)`;
        } else if (inEndVal && outStartVal) {
          dynamicNote = `Batas Masuk ${inEndVal} | Pulang ${outStartVal}`;
        }
        return `<tr>
  <td><strong>${d.label}</strong><div class="text-muted sched-day-note">${dynamicNote}</div></td>
  <td>
    <select class="form-control sched-status-select sched-${group}-status" data-day="${d.key}">
      <option value="active" ${status === 'active' ? 'selected' : ''}>Wajib Masuk</option>
      <option value="optional" ${status === 'optional' ? 'selected' : ''}>Opsional (Pembinaan)</option>
      <option value="off" ${status === 'off' ? 'selected' : ''}>Libur</option>
    </select>
  </td>
  <td><input type="time" class="form-control sched-time-input sched-${group}-in-start" data-day="${d.key}" value="${inStartVal}"></td>
  <td><input type="time" class="form-control sched-time-input sched-${group}-in-end" data-day="${d.key}" value="${inEndVal}"></td>
  <td><input type="time" class="form-control sched-time-input sched-${group}-out-start" data-day="${d.key}" value="${outStartVal}"></td>
  <td><input type="time" class="form-control sched-time-input sched-${group}-out-end" data-day="${d.key}" value="${outEndVal}"></td>
</tr>`;
      }).join('');
    };
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
        <a href="#/admin/attendance" class="card stat-card" style="text-decoration:none; color:inherit;">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-calendar-check"></i></div>
          <div><p class="stat-value">${hadirToday} / ${totalGtk}</p><p class="stat-label text-muted">Presensi Masuk Hari Ini (Lihat Detail)</p></div>
        </a>
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
                <div class="quick-nav-title">Penilaian Kinerja SDM</div>
                <div class="quick-nav-desc">Rubrik 3 pilar Majelis Dikdasmen</div>
              </div>
            </a>
            <a href="#/personnel/portfolio" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-folder-star"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Portofolio & Kompetensi</div>
                <div class="quick-nav-desc">Rekam jejak pelatihan, diklat & sertifikasi</div>
              </div>
            </a>
            <a href="#/admin/attendance" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-clock"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pantau Disiplin GTK</div>
                <div class="quick-nav-desc">Monitoring presensi & rekap gaji cutoff 29-28</div>
              </div>
            </a>
            <a href="#/gtk/salary-slip" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Slip Gaji Pribadi</div>
                <div class="quick-nav-desc">Rincian honorarium & gaji staf personalia</div>
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
            <a href="#/komite/activities" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-users-three"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Kegiatan Paguyuban</div>
                <div class="quick-nav-desc">Agenda & kemitraan paguyuban wali murid</div>
              </div>
            </a>
            <a href="#/komite/finance-paguyuban" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-wallet"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Keuangan Paguyuban</div>
                <div class="quick-nav-desc">Transparansi kas paguyuban & komite</div>
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
        <div class="card-header mk-header">
          <h3 class="card-title"><i class="ph ph-clock"></i> Pengaturan Jam Operasional Mingguan GTK & Guru Ummi (Senin - Sabtu)</h3>
          <div class="badge-group">
            <span class="badge badge-success"><i class="ph ph-repeat"></i> Otomatis Mingguan</span>
            <span class="badge badge-primary">Jadwal Resmi</span>
          </div>
        </div>
        <div class="card-body">
          <form id="form-attendance-time-settings">
            <div class="sched-toolbar">
              <div class="sched-tab-group">
                <button type="button" class="btn btn-sm btn-primary sched-tab-btn active" id="btn-tab-gtk"><i class="ph ph-briefcase"></i> Jadwal GTK / Tendik</button>
                <button type="button" class="btn btn-sm btn-outline sched-tab-btn" id="btn-tab-ummi"><i class="ph ph-book-open"></i> Jadwal Guru Ummi</button>
              </div>
              <div class="sched-actions-row">
                <button type="button" class="btn btn-sm btn-outline sched-reset-btn" id="btn-reset-default-sched"><i class="ph ph-arrow-counter-clockwise"></i> Terapkan Jadwal Default Resmi</button>
                <label class="sched-flexible-toggle" title="Jika dicentang, guru bisa absen kapan saja tanpa dibatasi jam buka/tutup presensi.">
                  <input type="checkbox" id="set-flexible-time" ${settings.attendanceRules?.allowFlexibleTime ? 'checked' : ''}>
                  <span><strong>Mode Fleksibel:</strong> Bolehkan absensi kapan saja (jam bebas / tanpa batas jam buka)</span>
                </label>
              </div>
            </div>
            <div class="panel-callout attendance-guide-callout">
              <div><i class="ph ph-check-circle attendance-guide-callout-success"></i> <strong>Sistem Otomatis (Tidak Perlu Diatur Tiap Hari):</strong> Template jadwal Senin s/d Sabtu ini cukup disimpan <strong>sekali saja</strong> dan akan berlaku otomatis setiap minggunya. Personalia <strong>TIDAK PERLU</strong> mengatur ulang setiap hari.</div>
              <div><i class="ph ph-info"></i> <strong>Aturan Keterlambatan:</strong> Batas akhir absen = jam yang tertulis. Lewat 1 menit (misal 06.46 bagi GTK atau 07.16 bagi Ummi) otomatis terhitung terlambat. Hari Sabtu bersifat opsional (pembinaan). Guru Ummi hari Jumat libur.</div>
              <div><i class="ph ph-sliders"></i> <strong>Mode Fleksibel:</strong> Biarkan tidak dicentang untuk hari kerja normal agar jam disiplin ditegakkan. Centang hanya jika ada agenda khusus (ujian, rapat luar, dsb) di mana pengajar hadir/pulang di jam bebas.</div>
            </div>
            <div id="pane-sched-gtk">
              <h4 class="sched-pane-title">Jadwal Guru & Tenaga Kependidikan (GTK / Tendik)</h4>
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>Hari & Catatan</th><th>Status Hari</th><th>Mulai Masuk</th><th>Batas Masuk</th><th>Mulai Pulang</th><th>Batas Pulang</th></tr></thead>
                  <tbody>${renderScheduleRows('gtk')}</tbody>
                </table>
              </div>
            </div>
            <div id="pane-sched-ummi" class="hidden">
              <h4 class="sched-pane-title">Jadwal Khusus Guru Ummi / Qur'an</h4>
              <div class="table-wrap">
                <table class="table">
                  <thead><tr><th>Hari & Catatan</th><th>Status Hari</th><th>Mulai Masuk</th><th>Batas Masuk</th><th>Mulai Pulang</th><th>Batas Pulang</th></tr></thead>
                  <tbody>${renderScheduleRows('ummi')}</tbody>
                </table>
              </div>
            </div>
            <button type="submit" class="btn btn-primary sched-save-btn"><i class="ph ph-floppy-disk"></i> Simpan Seluruh Jadwal Presensi</button>
          </form>
        </div>
      </section>
      <section class="card">
        <div class="card-header mk-header">
          <h3 class="card-title"><i class="ph ph-calendar-blank"></i> Batasan Rentang Tanggal Presensi (Opsional)</h3>
          <span class="badge badge-outline">Bisa Dikosongkan (Aktif Terus)</span>
        </div>
        <div class="card-body">
          <p class="text-muted attendance-date-desc">
            <i class="ph ph-info"></i> <strong>Keterangan untuk Personalia:</strong> Bagian ini bersifat <em>opsional</em>. Biarkan kedua tanggal kosong agar presensi sekolah aktif otomatis sepanjang tahun tanpa perlu diatur ulang (sangat direkomendasikan). Anda hanya perlu mengisi tanggal jika ingin membatasi gerbang presensi hanya buka pada rentang tanggal tertentu (misalnya menjelang libur panjang sekolah).
          </p>
          <form id="form-attendance-date-settings" class="attendance-date-form">
            <div class="attendance-date-inputs">
              <div class="form-group compact-field attendance-field">
                <label>Mulai Berlaku (Opsional)</label>
                <input id="set-date-start" type="date" value="${settings.attendanceRules?.attendanceStartDate || ''}">
              </div>
              <div class="form-group compact-field attendance-field">
                <label>Sampai Tanggal (Opsional)</label>
                <input id="set-date-end" type="date" value="${settings.attendanceRules?.attendanceEndDate || ''}">
              </div>
            </div>
            <div class="attendance-date-actions">
              <button type="button" id="btn-clear-date-settings" class="btn btn-outline"><i class="ph ph-arrows-counter-clockwise"></i> Kosongkan (Aktif Terus)</button>
              <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Rentang Tanggal</button>
            </div>
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
        const isConfirmed = confirm('Anda akan memperbarui konfigurasi presensi GTK untuk seluruh sistem sekolah. Lanjutkan?');
        if (!isConfirmed) return;
        const btn = form.querySelector('button[type="submit"]') || form.querySelector('button');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
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
    const tabGtk = document.getElementById('btn-tab-gtk');
    const tabUmmi = document.getElementById('btn-tab-ummi');
    const paneGtk = document.getElementById('pane-sched-gtk');
    const paneUmmi = document.getElementById('pane-sched-ummi');
    const btnResetSched = document.getElementById('btn-reset-default-sched');
    if (btnResetSched) {
      btnResetSched.onclick = () => {
        ['gtk', 'ummi'].forEach((group) => {
          (scheduleDefs[group] || []).forEach((d) => {
            const sel = document.querySelector(`.sched-${group}-status[data-day="${d.key}"]`);
            if (sel) sel.value = d.status;
            const inS = document.querySelector(`.sched-${group}-in-start[data-day="${d.key}"]`);
            if (inS) inS.value = d.inStart;
            const inE = document.querySelector(`.sched-${group}-in-end[data-day="${d.key}"]`);
            if (inE) inE.value = d.inEnd;
            const outS = document.querySelector(`.sched-${group}-out-start[data-day="${d.key}"]`);
            if (outS) outS.value = d.outStart;
            const outE = document.querySelector(`.sched-${group}-out-end[data-day="${d.key}"]`);
            if (outE) outE.value = d.outEnd;
          });
        });
        alert('Jadwal default resmi telah dimuat ke formulir! Silakan klik "Simpan Seluruh Jadwal Presensi" di bawah.');
      };
    }
    if (tabGtk && tabUmmi && paneGtk && paneUmmi) {
      tabGtk.onclick = () => {
        tabGtk.className = 'btn btn-sm btn-primary sched-tab-btn active';
        tabUmmi.className = 'btn btn-sm btn-outline sched-tab-btn';
        paneGtk.classList.remove('hidden');
        paneUmmi.classList.add('hidden');
      };
      tabUmmi.onclick = () => {
        tabUmmi.className = 'btn btn-sm btn-primary sched-tab-btn active';
        tabGtk.className = 'btn btn-sm btn-outline sched-tab-btn';
        paneUmmi.classList.remove('hidden');
        paneGtk.classList.add('hidden');
      };
    }
    bindSettingsForm('form-attendance-time-settings', () => {
      const gtkSched = {};
      const ummiSched = {};
      (scheduleDefs.gtk || []).forEach((d) => {
        const day = d.key;
        const status = document.querySelector(`.sched-gtk-status[data-day="${day}"]`)?.value || d.status;
        const inStart = document.querySelector(`.sched-gtk-in-start[data-day="${day}"]`)?.value || d.inStart;
        const inEnd = document.querySelector(`.sched-gtk-in-end[data-day="${day}"]`)?.value || d.inEnd;
        const outStart = document.querySelector(`.sched-gtk-out-start[data-day="${day}"]`)?.value || d.outStart;
        const outEnd = document.querySelector(`.sched-gtk-out-end[data-day="${day}"]`)?.value || d.outEnd;
        gtkSched[day] = {
          inStart,
          inEnd,
          outStart,
          outEnd,
          isOff: status === 'off',
          isOptional: status === 'optional'
        };
      });
      (scheduleDefs.ummi || []).forEach((d) => {
        const day = d.key;
        const status = document.querySelector(`.sched-ummi-status[data-day="${day}"]`)?.value || d.status;
        const inStart = document.querySelector(`.sched-ummi-in-start[data-day="${day}"]`)?.value || d.inStart;
        const inEnd = document.querySelector(`.sched-ummi-in-end[data-day="${day}"]`)?.value || d.inEnd;
        const outStart = document.querySelector(`.sched-ummi-out-start[data-day="${day}"]`)?.value || d.outStart;
        const outEnd = document.querySelector(`.sched-ummi-out-end[data-day="${day}"]`)?.value || d.outEnd;
        ummiSched[day] = {
          inStart,
          inEnd,
          outStart,
          outEnd,
          isOff: status === 'off',
          isOptional: status === 'optional',
          noLatePenalty: status === 'optional'
        };
      });
      gtkSched['minggu'] = { inStart: '06:00', inEnd: '07:00', outStart: '12:00', outEnd: '14:00', isOff: true, isOptional: true };
      ummiSched['minggu'] = { inStart: '06:00', inEnd: '07:00', outStart: '12:00', outEnd: '14:00', isOff: true, isOptional: true };
      const allowFlexible = document.getElementById('set-flexible-time')?.checked || false;
      return {
        scheduleVersion: 2,
        allowFlexibleTime: allowFlexible,
        schedules: {
          gtk: gtkSched,
          ummi: ummiSched
        },
        checkInStart: gtkSched.senin?.inStart || '06:00',
        checkInEnd: gtkSched.senin?.inEnd || '06:45',
        checkOutStart: gtkSched.senin?.outStart || '14:30',
        checkOutEnd: gtkSched.senin?.outEnd || '17:30'
      };
    });
    bindSettingsForm('form-attendance-date-settings', () => ({
      attendanceStartDate: document.getElementById('set-date-start').value,
      attendanceEndDate: document.getElementById('set-date-end').value
    }));
    const btnClearDates = document.getElementById('btn-clear-date-settings');
    if (btnClearDates) {
      btnClearDates.onclick = async () => {
        const isConfirmed = confirm('Kosongkan batasan tanggal? Presensi akan aktif berkelanjutan sepanjang tahun tanpa perlu diatur ulang.');
        if (!isConfirmed) return;
        document.getElementById('set-date-start').value = '';
        document.getElementById('set-date-end').value = '';
        const current = await DB.getSettings();
        const updatedRules = {
          ...(current.attendanceRules || {}),
          attendanceStartDate: '',
          attendanceEndDate: ''
        };
        await DB.updateSettings({ attendanceRules: updatedRules });
        alert('Batasan tanggal presensi telah dikosongkan. Presensi sekarang aktif berkelanjutan sepanjang tahun.');
      };
    }
  }
};