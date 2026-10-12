const ITAdminPages = {
  async renderDashboard(container) {
    Router.setTitle('IT & Sistem', 'Pusat telemetri infrastruktur teknologi, sinkronisasi data master, dan pemeliharaan server.');
    container.innerHTML = `
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-database"></i> Panel Ekspor & Sinkronisasi Master Data</h3>
        </div>
        <div class="card-body">
          <p class="text-muted">Tarik salinan data terbaru dari database produksi ke format berkas TSV untuk arsip luring atau sinkronisasi CLI.</p>
          <div class="button-group section-spacer">
            <button id="btn-export-guru-tsv" class="btn btn-primary">
              <i class="ph ph-download-simple"></i> Unduh data-guru.tsv
            </button>
            <button id="btn-export-siswa-tsv" class="btn btn-primary">
              <i class="ph ph-download-simple"></i> Unduh data-siswa.tsv
            </button>
          </div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Operasional IT & Infrastruktur</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            <a href="#/admin/users" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-users-three"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Kelola Pengguna</div>
                <div class="quick-nav-desc">Akun login & hak akses</div>
              </div>
            </a>
            <a href="#/it-admin/sync" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-arrows-clockwise"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Sinkronisasi Dapodik</div>
                <div class="quick-nav-desc">Integrasi Kemendikbud & EMIS</div>
              </div>
            </a>
            <a href="#/it-admin/backup" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-cloud-arrow-down"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Backup & Restore</div>
                <div class="quick-nav-desc">Snapshot basis data berkala</div>
              </div>
            </a>
            <a href="#/it-admin/logs" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-shield-check"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Log Audit Sistem</div>
                <div class="quick-nav-desc">Jejak aktivitas & forensik</div>
              </div>
            </a>
            <a href="#/it-admin/network" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-wifi-high"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Infrastruktur Jaringan</div>
                <div class="quick-nav-desc">Mikrotik, switch & AP WiFi</div>
              </div>
            </a>
            <a href="#/it-admin/integration" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-plugs-connected"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Integrasi API & CBT</div>
                <div class="quick-nav-desc">Gateway WhatsApp & webhook</div>
              </div>
            </a>
          </div>
        </div>
      </section>
    `;
    document.getElementById('btn-export-guru-tsv').addEventListener('click', async () => {
      const users = await DB.getAllUsers();
      const arr = DB.toArray(users).filter((u) => u.role !== 'ortu' && u.role !== 'kepsek');
      arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      let tsvContent = 'No\tNama\tJabatan\tJenis Kelamin\tTugas Mengajar\tTugas Tambahan\n';
      arr.forEach((u, i) => {
        const assignments = (u.assignments || []).join(', ');
        tsvContent += `${i + 1}\t${u.name || '-'}\t${u.jabatan || 'Guru'}\t${u.gender || '-'}\t${u.teachingRole || '-'}\t${assignments || '-'}\n`;
      });
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'data-guru.tsv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    document.getElementById('btn-export-siswa-tsv').addEventListener('click', async () => {
      const [studentsMap, classesMap] = await Promise.all([DB.getAllStudents(), DB.getClasses()]);
      const students = DB.toArray(studentsMap);
      students.sort((a, b) => {
        const classA = classesMap[a.classId] ? classesMap[a.classId].name : '';
        const classB = classesMap[b.classId] ? classesMap[b.classId].name : '';
        if (classA !== classB) return classA.localeCompare(classB);
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
      let tsvContent = 'NO\tNO INDUK\tNISN\tNAMA\tKELAS/ROMBEL\tJENIS KELAMIN\n';
      students.forEach((s, i) => {
        const className = classesMap[s.classId] ? classesMap[s.classId].name : '-';
        tsvContent += `${i + 1}\t${s.nis || ''}\t${s.nisn || ''}\t${s.name || '-'}\t${className}\t${s.gender || '-'}\n`;
      });
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'data-siswa.tsv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
};
