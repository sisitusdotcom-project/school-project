const StudentAffairsPages = {
  async renderDashboard(container) {
    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    const readOnly = role !== AppConfig.ROLES.ADMIN && role !== AppConfig.ROLES.GURU;
    Router.setTitle('Kesiswaan', 'Ringkasan siswa, absensi, dan prestasi.');

    const [students, classes] = await Promise.all([
      DB.getAllStudents(),
      DB.getClasses()
    ]);

    const studentList = DB.toArray(students);
    const classList = DB.toArray(classes);
    const activeStudents = studentList.length;

    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-student"></i></div>
          <div><p class="stat-value">${activeStudents}</p><p class="stat-label text-muted">Siswa</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-school"></i></div>
          <div><p class="stat-value">${classList.length}</p><p class="stat-label text-muted">Rombel</p></div>
        </div>
        
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-bell"></i></div>
          <div><p class="stat-value">${readOnly ? 'Read' : 'Edit'}</p><p class="stat-label text-muted">Mode</p></div>
        </div>
      </section>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Ekspor Data Siswa</h3>
          <p class="text-muted">Unduh data siswa lengkap beserta kelasnya (NIS, NISN, Nama, Kelas) untuk keperluan laporan kesiswaan.</p>
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button id="btn-export-excel" class="btn btn-primary" style="display: flex; align-items: center; gap: 5px;">
              <i class="ph ph-file-xls"></i> Export Excel
            </button>
            <button id="btn-export-pdf" class="btn btn-danger" style="display: flex; align-items: center; gap: 5px; background: #e74c3c; color: white;">
              <i class="ph ph-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Tugas kesiswaan</h3>
          <ul class="list-plain">
            <li>Role aktif: <strong>${role}</strong></li>
            <li>Data siswa dan rombel hanya menjadi referensi; dashboard ini belum mengubah master data.</li>
            <li>Absensi, nilai, dan observasi dikerjakan melalui fitur guru sesuai kelas yang ditugaskan.</li>
          </ul>
        </div>
      </div>
    `;

    // Ambil data siswa yg akan diekspor dan rapikan formatnya
    const exportData = studentList.filter(s => s.role === 'ortu').map((s, index) => ({
      No: index + 1,
      NIS: s.nis || '-',
      NISN: s.nisn || '-',
      Nama: s.name || '-',
      Kelas: s.className || '-'
    }));

    // Logika Export Excel
    const btnExcel = container.querySelector('#btn-export-excel');
    if (btnExcel) {
      btnExcel.addEventListener('click', () => {
        if (!window.XLSX) return alert('Library Excel belum dimuat.');
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
        XLSX.writeFile(wb, "Laporan_Data_Siswa_Kesiswaan.xlsx");
      });
    }

    // Logika Export PDF
    const btnPdf = container.querySelector('#btn-export-pdf');
    if (btnPdf) {
      btnPdf.addEventListener('click', () => {
        if (!window.jspdf || !window.jspdf.jsPDF) return alert('Library PDF belum dimuat.');
        const doc = new window.jspdf.jsPDF();
        
        doc.setFontSize(16);
        doc.text("Laporan Data Siswa Kesiswaan", 14, 15);
        doc.setFontSize(10);
        doc.text("Aplikasi Penilaian Karakter SD Muhammadiyah", 14, 22);

        const tableColumn = ["No", "NIS", "NISN", "Nama", "Kelas"];
        const tableRows = exportData.map(d => [d.No, d.NIS, d.NISN, d.Nama, d.Kelas]);

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 30,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save("Laporan_Data_Siswa_Kesiswaan.pdf");
      });
    }
  }
};
