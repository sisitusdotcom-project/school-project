import os

def update_app_config():
    path = 'login/public/assets/js/app-config.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    helper_code = '''  const PAYROLL_CUTOFF_START = 29;
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
      functionalLabel,
      teachingAllowance: teach,
      teachingLabel,
      deductions: ded,
      deductionLabel,
      grossSalary: basic + func + teach,
      netSalary: net,
      noticeText: 'Status Periode Ini: Belum Diterbitkan oleh Bagian Keuangan. Angka di bawah merupakan estimasi rincian berjalan berdasarkan rekap presensi dan tugas ajar. Slip gaji resmi diterbitkan setelah Bendahara Keuangan menyelesaikan rekapitulasi penggajian.'
    };
  }'''

    target = '  const APP_DEFAULTS = Object.freeze({'
    if 'resolveSalarySlipData' not in content:
        content = content.replace(target, helper_code + '\n' + target)

    export_target = '    calculateGradeSummary\n  });'
    export_replacement = '''    calculateGradeSummary,
    PAYROLL_CUTOFF_START,
    PAYROLL_CUTOFF_END,
    getPayrollCutoffRange,
    resolveSalarySlipData
  });'''
    if 'resolveSalarySlipData\n  });' not in content:
        content = content.replace(export_target, export_replacement)

    clean_lines = [l for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print('Updated app-config.js successfully')

def update_guru_pages():
    path = 'login/public/assets/js/pages/guru/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_salary_slip_start = "  async renderSalarySlip(container) {\n    Router.setTitle('Slip Gaji Pribadi', 'Rincian gaji dan rekap tunjangan bulanan resmi GTK.');"
    
    new_salary_slip = '''  async renderSalarySlip(container) {
    Router.setTitle('Slip Gaji Pribadi', 'Rincian gaji dan rekap tunjangan bulanan resmi GTK.');
    const user = Auth.userData || Auth.currentUser || {};
    const uid = (Auth.currentUser && Auth.currentUser.uid) || user.uid;
    const today = new Date();
    const cutoff = AppConfig.getPayrollCutoffRange ? AppConfig.getPayrollCutoffRange(today) : {
      startStr: '2026-09-29', endStr: '2026-10-28', monthLabel: 'Oktober 2026', cutoffLabel: '29 Sep 2026 s/d 28 Okt 2026', sD: new Date(2026, 8, 29), eD: new Date(2026, 9, 28)
    };
    const [directoryData, salariesData, rangeAttData, settings, ummiClassesData] = await Promise.all([
      DB._readCollection ? DB._readCollection('personnel/directory', {}) : Promise.resolve({}),
      DB._readCollection ? DB._readCollection('finance/salaries', {}) : Promise.resolve({}),
      DB.getTeacherAttendanceRange(cutoff.startStr, cutoff.endStr),
      DB.getSettings(),
      DB._readCollection ? DB._readCollection('ummi_classes', {}) : Promise.resolve({})
    ]);
    const dirList = DB.toArray(directoryData);
    const cleanUserName = (user.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const empProfile = dirList.find(d => d.userId === uid || (d.name && d.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanUserName)) || {};
    const salaryList = DB.toArray(salariesData);
    const matchedSalary = salaryList.find(s => (s.employeeId === uid || (empProfile.id && s.employeeId === empProfile.id)) && (!s.month || s.month === cutoff.startStr.slice(0, 7) || s.month === cutoff.endStr.slice(0, 7))) || null;
    let onTimeCount = 0, lateCount = 0;
    const isUmmi = AppConfig.isUserUmmi(user);
    Object.entries(rangeAttData || {}).forEach(([dk, byTeacher]) => {
      const att = byTeacher && byTeacher[uid];
      if (att && att.time_in) {
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
    const ummiList = DB.toArray(ummiClassesData);
    const myUmmiRombel = ummiList.filter(c => c.teacherId === uid || (c.teacherName && cleanUserName && c.teacherName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanUserName)));
    const slip = AppConfig.resolveSalarySlipData(user, empProfile, matchedSalary, {
      totalPresent, onTimeCount, lateCount, totalWorkDays
    }, {
      ummiClassesCount: myUmmiRombel.length || 3
    });
    container.innerHTML = `
      <div class="salary-slip-actions">
        <button class="btn btn-outline" id="btn-print-slip"><i class="ph ph-printer"></i> Cetak Slip Gaji</button>
      </div>
      <div class="salary-slip-sheet">
        <div class="salary-slip-notice">
          <i class="ph ph-info"></i> <strong>Informasi Penggajian:</strong> ${AppConfig.escapeHtml(slip.noticeText)}
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
          <div class="salary-slip-info-row"><span class="salary-slip-label">Nama Pegawai</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(slip.name)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">NBM / NUPTK</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(slip.nbm)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Jabatan / Tugas</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(slip.position)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Status Kepegawaian</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(slip.empStatus)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Kehadiran (Cutoff)</span><span class="salary-slip-val">: ${slip.totalPresent} / ${slip.totalWorkDays} Hari (${slip.onTimeCount} Tepat, ${slip.lateCount} Terlambat)</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Status Pencairan</span><span class="salary-slip-val">: <span class="badge ${slip.badgeClass}">${AppConfig.escapeHtml(slip.statusText)}</span></span></div>
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
              <td>${AppConfig.escapeHtml(slip.basicLabel)}</td>
              <td class="text-right">Rp ${slip.basicSalary.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>${AppConfig.escapeHtml(slip.functionalLabel)}</td>
              <td class="text-right">Rp ${slip.functionalAllowance.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>${AppConfig.escapeHtml(slip.teachingLabel)}</td>
              <td class="text-right">Rp ${slip.teachingAllowance.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td><strong>Total Penghasilan Kotor</strong></td>
              <td class="text-right"><strong>Rp ${slip.grossSalary.toLocaleString('id-ID')}</strong></td>
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
              <td>${AppConfig.escapeHtml(slip.deductionLabel)}</td>
              <td class="text-right">Rp ${slip.deductions.toLocaleString('id-ID')}</td>
            </tr>
            <tr class="salary-slip-total-row">
              <td><strong>TOTAL GAJI BERSIH (TAKE HOME PAY)</strong></td>
              <td class="text-right"><strong>Rp ${slip.netSalary.toLocaleString('id-ID')}</strong></td>
            </tr>
          </tbody>
        </table>
        <div class="salary-slip-signatures">
          <div class="salary-slip-sig-box">
            <span>Penerima,</span>
            <div class="salary-slip-sig-space"></div>
            <strong>${AppConfig.escapeHtml(slip.name)}</strong>
            <br><small class="text-muted">NBM: ${AppConfig.escapeHtml(slip.nbm)}</small>
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
  }'''

    pos = content.find(old_salary_slip_start)
    if pos != -1:
        content = content[:pos] + new_salary_slip + '\n};\n'
    
    clean_lines = [l for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print('Updated pages/guru/index.js successfully')

def update_admin_attendance():
    path = 'login/public/assets/js/pages/admin/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_calc = '''    const calcCutoff = (refD) => {
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
    let currentCutoff = calcCutoff(today);'''

    new_calc = '''    const calcCutoff = (refD) => AppConfig.getPayrollCutoffRange(refD);
    let currentCutoff = calcCutoff(today);'''

    if old_calc in content:
        content = content.replace(old_calc, new_calc)
        clean_lines = [l for l in content.splitlines() if l.strip()]
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(clean_lines) + '\n')
        print('Updated pages/admin/index.js successfully (DRY getPayrollCutoffRange)')

if __name__ == '__main__':
    update_app_config()
    update_guru_pages()
    update_admin_attendance()
