import os

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
admin_js = os.path.join(base_dir, 'login', 'public', 'assets', 'js', 'pages', 'admin', 'index.js')
guru_js = os.path.join(base_dir, 'login', 'public', 'assets', 'js', 'pages', 'guru', 'index.js')

def update_admin_attendance():
    with open(admin_js, 'r', encoding='utf-8') as f:
        c = f.read()

    start_token = "  async renderAttendance(container) {"
    start_idx = c.find(start_token)
    if start_idx == -1:
        print("start_token not found in admin index.js")
        return

    # find the end of renderAttendance method before the closing of AdminPages
    # the AdminPages ends with "};" at the end of the file
    last_brace_idx = c.rfind("};")
    if last_brace_idx == -1:
        print("last_brace_idx not found")
        return

    new_render_attendance = """  async renderAttendance(container) {
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
    const calcCutoff = (refD) => {
      const d = refD ? new Date(refD) : new Date();
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
      return {
        startStr: `${sD.getFullYear()}-${pad(sD.getMonth() + 1)}-${pad(sD.getDate())}`,
        endStr: `${eD.getFullYear()}-${pad(eD.getMonth() + 1)}-${pad(eD.getDate())}`,
        sD, eD
      };
    };
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
          lateBadge = isLate ? ' <span class="badge badge-warning">Terlambat</span>' : ' <span class="badge badge-success">Tepat Waktu</span>';
        }
        const proofBtn = att.proof_url
          ? `<button class="btn btn-outline btn-sm" data-proof-url="${att.proof_url}"><i class="ph ph-eye"></i> Lihat bukti</button>`
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
          const lines = [headers.join('\\t')];
          recapRows.forEach(r => {
            lines.push([r.idx, r.name, r.nbm, r.position, r.workDays, r.onTime, r.late, r.totalHadir, `${r.pct}%`].join('\\t'));
          });
          const blob = new Blob([lines.join('\\n')], { type: 'text/tab-separated-values;charset=utf-8;' });
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
      container.querySelectorAll('[data-proof-url]').forEach(btn => {
        btn.onclick = () => {
          const url = btn.dataset.proofUrl;
          const modal = document.createElement('div');
          modal.className = 'modal-overlay active';
          modal.innerHTML = `
            <div class="modal modal-wide">
              <div class="modal-header">
                <h3 class="modal-title">Bukti Presensi</h3>
                <button class="btn-icon" type="button" data-close-proof="1"><i class="ph ph-x"></i></button>
              </div>
              <div class="modal-body" style="text-align:center;">
                <img src="${DriveBridge.normalizeDriveImageUrl(url, 'w800', '')}" alt="Bukti presensi" style="max-width:100%; max-height:70vh; border-radius:10px; object-fit:contain; background:#f3f4f6;">
              </div>
              <div class="modal-footer">
                <a href="${DriveBridge.normalizeDriveImageUrl(url, 'w800', '')}" target="_blank" class="btn btn-primary">Buka ukuran penuh</a>
                <button type="button" class="btn btn-outline" data-close-proof="1">Tutup</button>
              </div>
            </div>
          `;
          document.body.appendChild(modal);
          modal.querySelectorAll('[data-close-proof]').forEach(el => {
            el.onclick = () => modal.remove();
          });
        };
      });
    };
    await renderContent();
  }
};
"""

    updated_c = c[:start_idx] + new_render_attendance
    lines = [l for l in updated_c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(admin_js, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("admin index.js updated successfully!")

def update_guru_salary_slip():
    with open(guru_js, 'r', encoding='utf-8') as f:
        c = f.read()

    last_brace_idx = c.rfind("};")
    if last_brace_idx == -1:
        print("last_brace_idx not found in guru index.js")
        return

    salary_slip_code = """  async renderSalarySlip(container) {
    Router.setTitle('Slip Gaji Pribadi', 'Rincian gaji dan rekap tunjangan bulanan resmi GTK.');
    const user = Auth.currentUser || {};
    const uid = user.uid;
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const calcCutoff = (refD) => {
      const d = refD ? new Date(refD) : new Date();
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
      return {
        startStr: `${sD.getFullYear()}-${pad(sD.getMonth() + 1)}-${pad(sD.getDate())}`,
        endStr: `${eD.getFullYear()}-${pad(eD.getMonth() + 1)}-${pad(eD.getDate())}`,
        monthLabel: `${eD.toLocaleString('id-ID', { month: 'long' })} ${eD.getFullYear()}`,
        cutoffLabel: `29 ${sD.toLocaleString('id-ID', { month: 'short' })} ${sD.getFullYear()} s/d 28 ${eD.toLocaleString('id-ID', { month: 'short' })} ${eD.getFullYear()}`,
        sD, eD
      };
    };
    const cutoff = calcCutoff(today);
    const [directoryData, salariesData, rangeAttData, settings] = await Promise.all([
      DB._readCollection ? DB._readCollection('personnel/directory', {}) : Promise.resolve({}),
      DB._readCollection ? DB._readCollection('finance/salaries', {}) : Promise.resolve({}),
      DB.getTeacherAttendanceRange(cutoff.startStr, cutoff.endStr),
      DB.getSettings()
    ]);
    const dirList = DB.toArray(directoryData);
    const cleanUserName = (user.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const empProfile = dirList.find(d => d.userId === uid || (d.name && d.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanUserName)) || {};
    const nbm = empProfile.nbm || empProfile.nuptk || user.nbm || user.nuptk || user.nip || '-';
    const position = empProfile.position || user.position || (AppConfig.isUserUmmi(user) ? 'Guru Ummi' : (user.role === 'tendik' ? 'Tenaga Kependidikan' : 'Guru Kelas/Mapel'));
    const empStatus = empProfile.employmentStatus || user.employmentStatus || 'GTY';
    const salaryList = DB.toArray(salariesData);
    const matchedSalary = salaryList.find(s => s.employeeId === uid || (empProfile.id && s.employeeId === empProfile.id)) || null;
    let onTimeCount = 0, lateCount = 0;
    Object.entries(rangeAttData || {}).forEach(([dk, byTeacher]) => {
      const att = byTeacher && byTeacher[uid];
      if (att && att.time_in) {
        const isUmmi = AppConfig.isUserUmmi(user);
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
    const basicSalary = matchedSalary ? Number(matchedSalary.basicSalary || 0) : 2500000;
    const functionalAllowance = matchedSalary ? Number(matchedSalary.functionalAllowance || 0) : 500000;
    const teachingAllowance = matchedSalary ? Number(matchedSalary.teachingAllowance || 0) : (totalPresent * 25000);
    const deductions = matchedSalary ? Number(matchedSalary.deductions || 0) : 100000;
    const netSalary = matchedSalary ? Number(matchedSalary.netSalary || (basicSalary + functionalAllowance + teachingAllowance - deductions)) : (basicSalary + functionalAllowance + teachingAllowance - deductions);
    const statusText = matchedSalary && matchedSalary.status ? matchedSalary.status : 'Tercatat di Bagian Keuangan';
    container.innerHTML = `
      <div class="salary-slip-actions">
        <button class="btn btn-outline" id="btn-print-slip"><i class="ph ph-printer"></i> Cetak Slip Gaji</button>
      </div>
      <div class="salary-slip-sheet">
        <div class="salary-slip-notice">
          <i class="ph ph-info"></i> <strong>Informasi Penggajian:</strong> Template slip gaji ini disinkronkan langsung dengan Bagian Keuangan SD Muhammadiyah 1 Sedati. Rincian kehadiran dihitung berdasarkan periode cut-off tanggal 29 s/d 28.
        </div>
        <div class="salary-slip-brand">
          <img src="assets/images/logo-musada.png" alt="Logo Sekolah" class="salary-slip-logo" onerror="this.style.display='none'">
          <div>
            <h2 class="salary-slip-title">SD MUHAMMADIYAH 1 SEDATI</h2>
            <p class="salary-slip-sub">Surat Bukti Rincian Honorarium & Gaji Pendidik / Tenaga Kependidikan</p>
            <p class="salary-slip-sub">Periode: <strong>${cutoff.monthLabel}</strong> (${cutoff.cutoffLabel})</p>
          </div>
        </div>
        <div class="salary-slip-info">
          <div class="salary-slip-info-row"><span class="salary-slip-label">Nama Pegawai</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(user.name || 'Pegawai')}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">NBM / NUPTK</span><span class="salary-slip-val">: ${nbm}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Jabatan / Tugas</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(position)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Status Kepegawaian</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(empStatus)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Kehadiran (Cutoff)</span><span class="salary-slip-val">: ${totalPresent} / ${totalWorkDays} Hari (${onTimeCount} Tepat, ${lateCount} Terlambat)</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Status Pencairan</span><span class="salary-slip-val">: <span class="badge badge-success">${statusText}</span></span></div>
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
              <td>Gaji Pokok Kepegawaian</td>
              <td class="text-right">Rp ${basicSalary.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>Tunjangan Jabatan / Fungsional / Rombel</td>
              <td class="text-right">Rp ${functionalAllowance.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>Tunjangan Jam Mengajar & Disiplin Kehadiran (${totalPresent} hari)</td>
              <td class="text-right">Rp ${teachingAllowance.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td><strong>Total Penghasilan Kotor</strong></td>
              <td class="text-right"><strong>Rp ${(basicSalary + functionalAllowance + teachingAllowance).toLocaleString('id-ID')}</strong></td>
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
              <td>Potongan Sosial / Infaq / Koperasi</td>
              <td class="text-right">Rp ${deductions.toLocaleString('id-ID')}</td>
            </tr>
            <tr class="salary-slip-total-row">
              <td><strong>TOTAL GAJI BERSIH (TAKE HOME PAY)</strong></td>
              <td class="text-right"><strong>Rp ${netSalary.toLocaleString('id-ID')}</strong></td>
            </tr>
          </tbody>
        </table>
        <div class="salary-slip-signatures">
          <div class="salary-slip-sig-box">
            <span>Penerima,</span>
            <div class="salary-slip-sig-space"></div>
            <strong>${AppConfig.escapeHtml(user.name || 'Pegawai')}</strong>
            <br><small class="text-muted">NBM: ${nbm}</small>
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
"""

    updated_c = c[:last_brace_idx] + ",\n" + salary_slip_code
    lines = [l for l in updated_c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(guru_js, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("guru index.js updated successfully with renderSalarySlip!")

if __name__ == '__main__':
    update_admin_attendance()
    update_guru_salary_slip()
