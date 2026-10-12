const StudentAffairsPages = {
  async renderDashboard(container) {
    Router.setTitle('Kesiswaan', 'Pusat pembinaan santri, pemantauan disiplin, prestasi kejuaraan, dan pendaftaran siswa baru.');
    const todayStr = new Date().toISOString().split('T')[0];
    const [students, classes, spmbData, leavesData] = await Promise.all([
      DB.getAllStudents(),
      DB.getClasses(),
      DB._readCollection('spmb_registrations', {}).catch(() => ({})),
      DB._readCollection('student_affairs/leaves', {}).catch(() => ({}))
    ]);
    const studentList = DB.toArray(students);
    const classList = DB.toArray(classes);
    const spmbList = DB.toArray(spmbData);
    const leavesList = DB.toArray(leavesData);
    const activeStudents = studentList.length;
    const leavesToday = leavesList.filter((l) => l && l.date === todayStr).length;
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-student"></i></div>
          <div><p class="stat-value">${activeStudents}</p><p class="stat-label text-muted">Santri Aktif</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-chalkboard"></i></div>
          <div><p class="stat-value">${classList.length}</p><p class="stat-label text-muted">Rombongan Belajar</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-user-plus"></i></div>
          <div><p class="stat-value">${spmbList.length}</p><p class="stat-label text-muted">Pendaftar SPMB / PPDB</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-calendar-x"></i></div>
          <div><p class="stat-value">${leavesToday}</p><p class="stat-label text-muted">Izin / Sakit Hari Ini</p></div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Operasional Kesiswaan</h3>
        </div>
        <div class="card-body">
          <div class="quick-nav-grid">
            <a href="#/student-affairs/ppdb" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-user-plus"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Penerimaan Siswa (SPMB)</div>
                <div class="quick-nav-desc">Pendaftaran & verifikasi berkas</div>
              </div>
            </a>
            <a href="#/student-affairs/mpls" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-sparkle"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Masa Pengenalan (MPLS)</div>
                <div class="quick-nav-desc">Kegiatan orientasi santri baru</div>
              </div>
            </a>
            <a href="#/admin/characters" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-star"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Indikator Karakter</div>
                <div class="quick-nav-desc">Rubrik adab & sikap santri</div>
              </div>
            </a>
            <a href="#/student-affairs/rules" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-scales"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Tata Tertib & TPPK</div>
                <div class="quick-nav-desc">Penegakan disiplin & konseling</div>
              </div>
            </a>
            <a href="#/student-affairs/leaves" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-calendar-x"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Perizinan Santri</div>
                <div class="quick-nav-desc">Validasi izin sakit & cuti</div>
              </div>
            </a>
            <a href="#/student-affairs/achievements" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-trophy"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Lomba & Prestasi</div>
                <div class="quick-nav-desc">Portofolio kejuaraan santri</div>
              </div>
            </a>
            <a href="#/student-affairs/scholarships" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-graduation-cap"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Data Beasiswa & PIP</div>
                <div class="quick-nav-desc">Seleksi santri penerima beasiswa</div>
              </div>
            </a>
            <a href="#/student-affairs/alumni" class="quick-nav-card">
              <div class="quick-nav-icon"><i class="ph ph-users"></i></div>
              <div class="quick-nav-info">
                <div class="quick-nav-title">Penelusuran Alumni</div>
                <div class="quick-nav-desc">Database lulusan madrasah</div>
              </div>
            </a>
          </div>
        </div>
      </section>
      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title"><i class="ph ph-download-simple"></i> Ekspor Master Data Siswa</h3>
        </div>
        <div class="card-body">
          <p class="text-muted">Unduh buku induk santri aktif lengkap dengan nomor induk, NISN, rombel kelas, dan jenis kelamin.</p>
          <div class="button-group section-spacer">
            <button id="btn-export-excel" class="btn btn-primary">
              <i class="ph ph-file-xls"></i> Export Excel
            </button>
            <button id="btn-export-pdf" class="btn btn-danger">
              <i class="ph ph-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>
      </section>
    `;
    const classMap = {};
    classList.forEach((c) => { classMap[c.id] = c.name; });
    const exportData = studentList.map((s, index) => ({
      No: index + 1,
      NIS: s.nis || '-',
      NISN: s.nisn || '-',
      Nama: s.name || '-',
      'L/P': s.gender || '-',
      Kelas: classMap[s.classId] || s.classId || '-'
    }));
    const exportExcelBtn = document.getElementById('btn-export-excel');
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => {
        if (!studentList.length) {
          alert('Tidak ada data siswa untuk diekspor.');
          return;
        }
        if (typeof XLSX === 'undefined') {
          alert('Modul Excel sedang dimuat, silakan coba sesaat lagi.');
          return;
        }
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
        XLSX.writeFile(wb, `Data_Siswa_Musada_${todayStr}.xlsx`);
      });
    }
    const exportPdfBtn = document.getElementById('btn-export-pdf');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => {
        if (!studentList.length) {
          alert('Tidak ada data siswa untuk diekspor.');
          return;
        }
        if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
          alert('Modul PDF sedang dimuat, silakan coba sesaat lagi.');
          return;
        }
        const { jsPDF } = window.jspdf || jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setFontSize(14);
        doc.text('DAFTAR INDUK SISWA SD MUHAMMADIYAH 1 SEDATI', 40, 40);
        doc.setFontSize(9);
        doc.text(`Tanggal Cetak: ${todayStr} | Total Santri: ${studentList.length}`, 40, 56);
        const headers = [['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P', 'Kelas']];
        const rows = exportData.map((d) => [d.No, d.NIS, d.NISN, d.Nama, d['L/P'], d.Kelas]);
        doc.autoTable({
          head: headers,
          body: rows,
          startY: 70,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [44, 62, 80] }
        });
        doc.save(`Data_Siswa_Musada_${todayStr}.pdf`);
      });
    }
  }
};
