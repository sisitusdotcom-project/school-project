import os

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js_dir = os.path.join(base_dir, 'login', 'public', 'assets', 'js')

def update_app_config():
    p = os.path.join(js_dir, 'app-config.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    # 1. Update isGTK to strictly exclude ADMIN and KOMITE and ORTU
    old_is_gtk = """  function isGTK(userOrRole) {
    if (!userOrRole) return false;
    const role = typeof userOrRole === 'object' ? userOrRole.role : userOrRole;
    if (!role || role === ROLES.ORTU) return false;
    return [ROLES.GURU, ROLES.GURU_UMMI, ROLES.GURU_EKSKUL, ROLES.TENDIK, ROLES.KEPSEK, ROLES.ADMIN, ROLES.PERSONNEL, ROLES.FINANCE, ROLES.CURRICULUM, ROLES.STUDENT_AFFAIRS, ROLES.FACILITIES, ROLES.IT_ADMIN, ROLES.KOMITE].includes(role);
  }"""

    new_is_gtk = """  function isGTK(userOrRole) {
    if (!userOrRole) return false;
    const role = typeof userOrRole === 'object' ? userOrRole.role : userOrRole;
    if (!role || role === ROLES.ORTU || role === ROLES.ADMIN || role === ROLES.KOMITE) return false;
    return [ROLES.GURU, ROLES.GURU_UMMI, ROLES.GURU_EKSKUL, ROLES.TENDIK, ROLES.KEPSEK, ROLES.PERSONNEL, ROLES.FINANCE, ROLES.CURRICULUM, ROLES.STUDENT_AFFAIRS, ROLES.FACILITIES, ROLES.IT_ADMIN].includes(role);
  }
  function canAccessPersonalSalarySlip(userOrRole) {
    return isGTK(userOrRole);
  }"""

    c = c.replace(old_is_gtk, new_is_gtk)

    # 2. Update NAV_ITEMS for TIM_UMMI to have official travel and salary slip
    old_tim_ummi = """    'TIM_UMMI': [
      { hash: '#/guru/ummi/classes', icon: 'ph-chalkboard-teacher', text: 'Rombel Ummi Saya', group: 'Guru Ummi: Kelas & Capaian' },
      { hash: '#/guru/ummi/progress', icon: 'ph-book-open', text: 'Jurnal Harian Jilid', group: 'Guru Ummi: Kelas & Capaian' },
      { hash: '#/guru/ummi/tahfidz', icon: 'ph-book-bookmark', text: 'Setoran Tahfidz (Juz 30-1)', group: 'Guru Ummi: Tahfidz & Tasmi\\'' },
      { hash: '#/guru/ummi/tasmi', icon: 'ph-headphones', text: 'Ujian Tasmi\\' (Penguji)', group: 'Guru Ummi: Tahfidz & Tasmi\\'' },
      { hash: '#/curriculum/syllabus', icon: 'ph-upload-simple', text: 'Perangkat & Modul Ummi', group: 'Guru Ummi: Administrasi' },
      { hash: '#/guru/portfolio', icon: 'ph-folder-star', text: 'Portofolio Guru Ummi', group: 'Guru Ummi: Administrasi' }
    ],"""

    new_tim_ummi = """    'TIM_UMMI': [
      { hash: '#/guru/ummi/classes', icon: 'ph-chalkboard-teacher', text: 'Rombel Ummi Saya', group: 'Guru Ummi: Kelas & Capaian' },
      { hash: '#/guru/ummi/progress', icon: 'ph-book-open', text: 'Jurnal Harian Jilid', group: 'Guru Ummi: Kelas & Capaian' },
      { hash: '#/guru/ummi/tahfidz', icon: 'ph-book-bookmark', text: 'Setoran Tahfidz (Juz 30-1)', group: 'Guru Ummi: Tahfidz & Tasmi\\'' },
      { hash: '#/guru/ummi/tasmi', icon: 'ph-headphones', text: 'Ujian Tasmi\\' (Penguji)', group: 'Guru Ummi: Tahfidz & Tasmi\\'' },
      { hash: '#/curriculum/syllabus', icon: 'ph-upload-simple', text: 'Perangkat & Modul Ummi', group: 'Guru Ummi: Administrasi' },
      { hash: '#/guru/portfolio', icon: 'ph-folder-star', text: 'Portofolio Guru Ummi', group: 'Guru Ummi: Administrasi' },
      { hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Guru Ummi: Administrasi' },
      { hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Guru Ummi: Administrasi' }
    ],"""

    c = c.replace(old_tim_ummi, new_tim_ummi)

    # 3. Update isPureUmmi and isPure block in getRoleNav
    old_pure_ummi = """    if (isPureUmmi) {
      baseNav = [
        { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
        { hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' }
      ];
    }"""

    new_pure_ummi = """    if (isPureUmmi) {
      baseNav = [
        { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
        { hash: '#/attendance', icon: 'ph-map-pin', text: 'Presensi Kehadiran' },
        { hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Guru Ummi: Administrasi' },
        { hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Guru Ummi: Administrasi' }
      ];
    }"""

    c = c.replace(old_pure_ummi, new_pure_ummi)

    # 4. In getRoleNav, ensure every GTK gets salary slip and travel if missing, and non-GTK never gets it
    target_end_nav = """    const combined = [...baseNav, ...unitNav];
    return combined.filter((item, index, self) => {
      return index === self.findIndex((t) => t.hash === item.hash);
    });"""

    new_end_nav = """    let combined = [...baseNav, ...unitNav];
    if (isGTK(role)) {
      if (!combined.some(n => n.hash === '#/gtk/salary-slip')) {
        combined.push({ hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Administrasi GTK' });
      }
      if (!combined.some(n => n.hash === '#/gtk/official-travel')) {
        combined.push({ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Administrasi GTK' });
      }
    } else {
      combined = combined.filter(n => n.hash !== '#/gtk/salary-slip' && n.hash !== '#/gtk/official-travel');
    }
    return combined.filter((item, index, self) => {
      return index === self.findIndex((t) => t.hash === item.hash);
    });"""

    c = c.replace(target_end_nav, new_end_nav)

    # Export canAccessPersonalSalarySlip
    c = c.replace("    isGTK,", "    isGTK,\n    canAccessPersonalSalarySlip,")

    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("app-config.js updated successfully with GTK SSOT navigation!")

def update_app():
    p = os.path.join(js_dir, 'app.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    # 1. In getDashboardRenderer: add ROLES.TENDIK -> GuruPages.renderTendikDashboard
    if "[AppConfig.ROLES.TENDIK]" not in c:
        c = c.replace(
            "[AppConfig.ROLES.GURU_UMMI]: GuruPages.renderUmmiDashboard,",
            "[AppConfig.ROLES.GURU_UMMI]: GuruPages.renderUmmiDashboard,\n      [AppConfig.ROLES.TENDIK]: GuruPages.renderTendikDashboard,"
        )

    # 2. In canAccess: ensure SSOT check for salary-slip and official-travel
    old_can_access = """    if (path.startsWith('#/guru/classes/')) path = '#/guru/classes';
    const assignments = Auth.currentAssignments || [];"""

    new_can_access = """    if (path.startsWith('#/guru/classes/')) path = '#/guru/classes';
    if (path === '#/gtk/salary-slip' || path === '#/gtk/official-travel') {
      if (role === AppConfig.ROLES.ADMIN || role === AppConfig.ROLES.KOMITE || role === AppConfig.ROLES.ORTU) {
        return false;
      }
      return AppConfig.isGTK(role);
    }
    const assignments = Auth.currentAssignments || [];"""

    c = c.replace(old_can_access, new_can_access)

    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("app.js updated successfully with Tendik dashboard and SSOT route check!")

def update_guru_pages():
    p = os.path.join(js_dir, 'pages', 'guru', 'index.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    # 1. Guru Umum dashboard: add quick nav cards for official travel & salary slip
    target_guru_nav = """            <a href="#/guru/classes" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-chalkboard-teacher"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">E-Rapor Kelas</div>
                <div class="quick-nav-desc">Pengisian lembar capaian rapor</div>
              </div>
            </a>"""

    addition_guru_nav = """            <a href="#/guru/classes" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-chalkboard-teacher"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">E-Rapor Kelas</div>
                <div class="quick-nav-desc">Pengisian lembar capaian rapor</div>
              </div>
            </a>
            <a href="#/gtk/official-travel" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-airplane-takeoff"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Perjalanan Dinas</div>
                <div class="quick-nav-desc">Pengajuan & riwayat tugas dinas guru</div>
              </div>
            </a>
            <a href="#/gtk/salary-slip" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Slip Gaji Pribadi</div>
                <div class="quick-nav-desc">Rincian honorarium & kehadiran cutoff 29-28</div>
              </div>
            </a>"""

    c = c.replace(target_guru_nav, addition_guru_nav)

    # 2. Guru Ummi dashboard: add quick nav cards for official travel & salary slip
    target_ummi_nav = """            <a href="#/guru/portfolio" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-folder"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Portofolio Guru Ummi</div>
                <div class="quick-nav-desc">Dokumentasi syahadah, sertifikat & lisensi</div>
              </div>
            </a>"""

    addition_ummi_nav = """            <a href="#/guru/portfolio" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-folder"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Portofolio Guru Ummi</div>
                <div class="quick-nav-desc">Dokumentasi syahadah, sertifikat & lisensi</div>
              </div>
            </a>
            <a href="#/gtk/official-travel" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-airplane-takeoff"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Perjalanan Dinas</div>
                <div class="quick-nav-desc">Pengajuan & riwayat tugas dinas guru ummi</div>
              </div>
            </a>
            <a href="#/gtk/salary-slip" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Slip Gaji Pribadi</div>
                <div class="quick-nav-desc">Rincian honor & tunjangan bulanan santri binaan</div>
              </div>
            </a>"""

    c = c.replace(target_ummi_nav, addition_ummi_nav)

    # 3. Guru Ekstra dashboard: add quick nav cards
    target_ekstra_nav = """            <a href="#/guru/ekstra/talents" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-star"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pemetaan Bakat Siswa</div>
                <div class="quick-nav-desc">Pencatatan potensi & prestasi khusus anak binaan</div>
              </div>
            </a>"""

    addition_ekstra_nav = """            <a href="#/guru/ekstra/talents" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-star"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Pemetaan Bakat Siswa</div>
                <div class="quick-nav-desc">Pencatatan potensi & prestasi khusus anak binaan</div>
              </div>
            </a>
            <a href="#/gtk/official-travel" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-airplane-takeoff"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Perjalanan Dinas</div>
                <div class="quick-nav-desc">Pengajuan surat tugas & pendampingan lomba</div>
              </div>
            </a>
            <a href="#/gtk/salary-slip" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Slip Gaji Pribadi</div>
                <div class="quick-nav-desc">Rincian honor pembina ekskul bulanan</div>
              </div>
            </a>"""

    c = c.replace(target_ekstra_nav, addition_ekstra_nav)

    # 4. Add renderTendikDashboard
    tendik_dashboard_code = """  async renderTendikDashboard(container) {
    Router.setTitle('Beranda Tenaga Kependidikan', 'Selamat datang di Dasbor Digital Tenaga Kependidikan SD Muhammadiyah 1 Sedati.');
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const user = Auth.currentUser || {};
    const uid = user.uid;
    const [myAtt, directoryData, perfData] = await Promise.all([
      DB.getTeacherAttendance(dateStr, uid),
      DB._readCollection ? DB._readCollection('personnel/directory', {}) : Promise.resolve({}),
      DB._readCollection ? DB._readCollection('tendik/performance', {}) : Promise.resolve({})
    ]);
    const dirList = DB.toArray(directoryData);
    const cleanUserName = (user.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const empProfile = dirList.find(d => d.userId === uid || (d.name && d.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanUserName)) || {};
    const nbm = empProfile.nbm || empProfile.nuptk || user.nbm || user.nuptk || user.nip || '-';
    const position = empProfile.position || user.position || 'Tenaga Administrasi Sekolah';
    let attStatus = 'Belum Presensi';
    let attClass = 'badge-warning';
    if (myAtt) {
      if (myAtt.time_out) {
        attStatus = 'Sudah Pulang (' + myAtt.time_out + ')';
        attClass = 'badge-success';
      } else if (myAtt.time_in) {
        attStatus = 'Sudah Datang (' + myAtt.time_in + ')';
        attClass = 'badge-success';
      }
    }
    const myPerfList = DB.toArray(perfData).filter(p => p.employeeId === uid || p.userId === uid);
    container.innerHTML = `
      <div class="card hero-panel">
        <div class="hero-panel__inner">
          <div>
            <p class="hero-panel__meta">${today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h2 class="hero-panel__time">${timeStr}</h2>
            <p class="hero-panel__meta" style="margin-top:6px;"><strong style="font-size:16px;">${AppConfig.escapeHtml(user.name || 'Pegawai Tendik')}</strong> · NBM: ${nbm} · ${AppConfig.escapeHtml(position)}</p>
          </div>
          <div class="hero-panel__status">
            <p class="hero-panel__meta">Status Kehadiran</p>
            <span class="badge ${attClass}">${attStatus}</span>
          </div>
        </div>
      </div>
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-map-pin"></i></div>
          <div><p class="stat-value">${myAtt ? (myAtt.time_in ? '✓' : '—') : '—'}</p><p class="stat-label text-muted">Presensi Datang</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-clipboard-text"></i></div>
          <div><p class="stat-value">${myPerfList.length}</p><p class="stat-label text-muted">Laporan Kinerja</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-folder-star"></i></div>
          <div><p class="stat-value">Aktif</p><p class="stat-label text-muted">Status Kepegawaian</p></div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-lightning"></i> Menu Utama Tenaga Kependidikan</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            <a href="#/attendance" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-map-pin"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Presensi Kehadiran</div>
                <div class="quick-nav-desc">Presensi GPS masuk dan pulang harian</div>
              </div>
            </a>
            <a href="#/tendik/performance" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-clipboard-text"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Laporan Kinerja Tendik</div>
                <div class="quick-nav-desc">Catatan tupoksi & capaian tugas bulanan</div>
              </div>
            </a>
            <a href="#/tendik/portfolio" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-folder"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Portofolio & Sertifikasi</div>
                <div class="quick-nav-desc">Dokumen SK, sertifikat diklat & ijazah</div>
              </div>
            </a>
            <a href="#/gtk/official-travel" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-airplane-takeoff"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Perjalanan Dinas</div>
                <div class="quick-nav-desc">Pengajuan & riwayat tugas dinas luar</div>
              </div>
            </a>
            <a href="#/gtk/salary-slip" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Slip Gaji Pribadi</div>
                <div class="quick-nav-desc">Rincian penerimaan gaji bulanan & cutoff 29-28</div>
              </div>
            </a>
          </div>
        </div>
      </section>
    `;
  },"""

    c = c.replace("  async renderUmmiDashboard(container) {", tendik_dashboard_code + "\n  async renderUmmiDashboard(container) {")

    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("pages/guru/index.js updated with quick nav cards and Tendik dashboard!")

def update_personnel_pages():
    p = os.path.join(js_dir, 'pages', 'personnel', 'index.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    old_cards = """            <a href="#/personnel/evaluations" class="quick-nav-card">
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
            </a>"""

    new_cards = """            <a href="#/personnel/evaluations" class="quick-nav-card">
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
            </a>"""

    c = c.replace(old_cards, new_cards)

    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("pages/personnel/index.js updated successfully!")

def update_finance_pages():
    p = os.path.join(js_dir, 'pages', 'finance', 'index.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    target = """      </section>
      <div class="card-grid section-spacer">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Buku Kas (10 Transaksi Terakhir)</h3>"""

    addition = """      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-lightning"></i> Menu Operasional Keuangan & Penggajian</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            <a href="#/finance/salaries" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-money"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Penghitungan Gaji GTK</div>
                <div class="quick-nav-desc">Penyusunan gaji pokok & tunjangan</div>
              </div>
            </a>
            <a href="#/admin/attendance" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-clock"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Rekap Presensi Penggajian (29-28)</div>
                <div class="quick-nav-desc">Kalkulasi disiplin bahan gaji bulanan</div>
              </div>
            </a>
            <a href="#/finance/welfare" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-heart"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Kesejahteraan Pegawai</div>
                <div class="quick-nav-desc">Santunan duka, sakit & persalinan</div>
              </div>
            </a>
            <a href="#/gtk/salary-slip" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-receipt"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Slip Gaji Pribadi</div>
                <div class="quick-nav-desc">Pratinjau & cetak slip gaji staf keuangan</div>
              </div>
            </a>
          </div>
        </div>
      </section>
      <div class="card-grid section-spacer">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Buku Kas (10 Transaksi Terakhir)</h3>"""

    if target in c:
        c = c.replace(target, addition, 1)

    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("pages/finance/index.js updated successfully!")

def update_feature_guides():
    p = os.path.join(js_dir, 'feature-guides.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    if "'#/gtk/salary-slip':" not in c:
        needle = "'#/guru/portfolio': {"
        guide_entry = """    '#/gtk/salary-slip': {
      func: 'Rincian resmi penerimaan honorarium dan gaji GTK per bulan berdasarkan kehadiran disiplin cutoff 29 s/d 28.',
      from: 'Bagian Keuangan & Sistem Presensi Sekolah',
      to: 'Seluruh Pendidik & Tenaga Kependidikan (GTK)',
      usage: 'Pilih periode penggajian untuk melihat rincian gaji pokok, tunjangan, dan potongan, lalu klik Cetak Slip Gaji untuk mencetak dokumen.'
    },
    '#/gtk/official-travel': {
      func: 'Pengajuan surat tugas dinas, detail instansi pengundang, armada, dan unggah foto kegiatan serta laporan kegiatan.',
      from: 'Pegawai GTK Mandiri',
      to: 'Waka Humas & Personalia (Penetapan Vakasi)',
      usage: 'Isi formulir perjalanan dinas lengkap dengan waktu keberangkatan/kepulangan dan unggah berkas surat tugas.'
    },
    '#/guru/portfolio': {"""
        c = c.replace(needle, guide_entry, 1)

    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("feature-guides.js updated successfully!")

if __name__ == '__main__':
    update_app_config()
    update_app()
    update_guru_pages()
    update_personnel_pages()
    update_finance_pages()
    update_feature_guides()
