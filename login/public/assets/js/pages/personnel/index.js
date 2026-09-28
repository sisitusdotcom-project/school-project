const PersonnelPages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    Router.setTitle('Humas & Personalia', 'Ringkasan pegawai dan struktur sekolah.');

    const isAdmin = role === AppConfig.ROLES.ADMIN;
    const [directoryData, usersData, settingsData] = await Promise.all([
      DB.getPersonnelDirectory(),
      isAdmin ? DB.getAllUsers() : Promise.resolve({}),
      DB.getSettings()
    ]);
    const personnelDirectory = DB.toArray(directoryData);
    const users = DB.toArray(usersData);
    const settings = settingsData || {};
    const guruCount = personnelDirectory.filter((employee) => employee.position?.toLowerCase().includes('guru')).length;
    const employeeCount = personnelDirectory.length;
    const kepsekCount = personnelDirectory.filter((employee) => employee.position?.toLowerCase().includes('kepala sekolah')).length;

    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-chalkboard-teacher"></i></div>
          <div><p class="stat-value">${guruCount}</p><p class="stat-label text-muted">Guru</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-briefcase"></i></div>
          <div><p class="stat-value">${employeeCount}</p><p class="stat-label text-muted">Pegawai tercatat</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-crown"></i></div>
          <div><p class="stat-value">${kepsekCount}</p><p class="stat-label text-muted">Kepsek</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-eye"></i></div>
          <div><p class="stat-value">${isAdmin ? users.length : '—'}</p><p class="stat-label text-muted">${isAdmin ? 'Akun sistem' : 'Akses akun disembunyikan'}</p></div>
        </div>
      </section>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tugas personalia</h3>
          <ul class="list-plain">
            <li>Role aktif: <strong>${role}</strong></li>
            <li>Direktori pegawai adalah sumber rekap personel; akun sistem hanya untuk autentikasi dan akses.</li>
            <li>Kepala sekolah memantau efektivitas, bukan mengubah profil pegawai dari dashboard ini.</li>
            <li>Dashboard ini belum membuka CRUD pegawai, cuti, dokumen, atau pengumuman.</li>
          </ul>
        </div>
      </div>

      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title">Pengaturan Jam Absensi Harian</h3>
        </div>
        <form id="form-attendance-time-settings" class="inline-form">
          <div class="form-group compact-field">
            <label>Masuk mulai</label>
            <input id="set-checkin-start" type="time" value="${settings.attendanceRules?.checkInStart || '07:00'}">
          </div>
          <div class="form-group compact-field">
            <label>Masuk akhir</label>
            <input id="set-checkin-end" type="time" value="${settings.attendanceRules?.checkInEnd || '09:00'}">
          </div>
          <div class="form-group compact-field">
            <label>Pulang mulai</label>
            <input id="set-checkout-start" type="time" value="${settings.attendanceRules?.checkOutStart || '15:00'}">
          </div>
          <div class="form-group compact-field">
            <label>Pulang akhir</label>
            <input id="set-checkout-end" type="time" value="${settings.attendanceRules?.checkOutEnd || '17:00'}">
          </div>
          <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Jam Absensi</button>
        </form>
      </section>

      <section class="card">
        <div class="card-header">
          <h3 class="card-title">Pengaturan Tanggal Rekap Absensi</h3>
        </div>
        <form id="form-attendance-date-settings" class="inline-form">
          <div class="form-group compact-field">
            <label>Mulai Berlaku</label>
            <input id="set-date-start" type="date" value="${settings.attendanceRules?.attendanceStartDate || ''}">
          </div>
          <div class="form-group compact-field">
            <label>Selesai</label>
            <input id="set-date-end" type="date" value="${settings.attendanceRules?.attendanceEndDate || ''}">
          </div>
          <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan Tanggal</button>
        </form>
      </section>
    `;

    const bindSettingsForm = (formId, buildPayload) => {
      const form = document.getElementById(formId);
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isConfirmed = confirm('Anda akan mengubah aturan absensi untuk seluruh sistem. Yakin ingin melanjutkan?');
        if (!isConfirmed) return;

        const btn = form.querySelector('button');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';

        try {
          const payload = buildPayload();
          const currentSettings = await DB.getSettings();
          await DB.updateSettings({
            attendanceRules: {
              ...(currentSettings.attendanceRules || {}),
              ...payload.attendanceRules
            }
          });
          btn.innerHTML = '<i class="ph ph-check"></i> Tersimpan';
        } catch (error) {
          console.error(error);
          btn.innerHTML = '<i class="ph ph-x"></i> Gagal';
        } finally {
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }, 1500);
        }
      });
    };

    bindSettingsForm('form-attendance-time-settings', () => ({
      attendanceRules: {
        checkInStart: document.getElementById('set-checkin-start').value || '07:00',
        checkInEnd: document.getElementById('set-checkin-end').value || '09:00',
        checkOutStart: document.getElementById('set-checkout-start').value || '15:00',
        checkOutEnd: document.getElementById('set-checkout-end').value || '17:00'
      }
    }));

    bindSettingsForm('form-attendance-date-settings', () => ({
      attendanceRules: {
        attendanceStartDate: document.getElementById('set-date-start').value || '',
        attendanceEndDate: document.getElementById('set-date-end').value || ''
      }
    }));
  }
};
