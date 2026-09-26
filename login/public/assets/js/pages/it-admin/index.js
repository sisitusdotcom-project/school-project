const ITAdminPages = {
  async renderDashboard(container) {
    Router.setTitle('Sinkronisasi Data (IT)', 'Ekspor data master dari database aktif ke format TSV.');
    
    container.innerHTML = `
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title"><i class="ph ph-database"></i> Panel Sinkronisasi SSOT</h3>
          <p class="text-muted">Gunakan menu ini untuk menarik (export) data Guru dan Siswa terbaru yang sudah diedit oleh Personalia/Kesiswaan, ke dalam format TSV baku. File hasil unduhan wajib Anda timpa ke dalam folder <strong>backend-tools/data/</strong> agar Terminal Node.js tetap sinkron dengan perubahan terbaru di web.</p>
          
          <div style="margin-top: 20px; display: flex; gap: 15px; flex-wrap: wrap;">
            <button id="btn-export-guru-tsv" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
              <i class="ph ph-download-simple"></i> Unduh data-guru.tsv
            </button>
            <button id="btn-export-siswa-tsv" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
              <i class="ph ph-download-simple"></i> Unduh data-siswa.tsv
            </button>
          </div>
        </div>
      </div>
      
      <div class="card section-block">
        <div class="card-body">
          <h3 class="card-title">Instruksi Tim IT</h3>
          <ul class="list-plain">
            <li><strong>Langkah 1:</strong> Unduh file TSV melalui tombol di atas.</li>
            <li><strong>Langkah 2:</strong> Pindahkan file yang diunduh ke folder <code>backend-tools/data/</code>, ganti file yang lama.</li>
            <li><strong>Langkah 3:</strong> Jika ada murid/guru baru yang mendaftar, jalankan script <code>node generate-db.js</code> dan <code>node import-auth-admin.js</code> di terminal.</li>
          </ul>
        </div>
      </div>
    `;

    document.getElementById('btn-export-guru-tsv').addEventListener('click', async () => {
      const users = await DB.getAllUsers();
      const arr = DB.toArray(users).filter(u => u.role !== 'ortu' && u.role !== 'kepsek'); // guru, admin, etc
      
      let tsvContent = "No\tNama\tJabatan\tTugas Mengajar\n";
      arr.forEach((u, i) => {
        tsvContent += `${i+1}\t${u.name || '-'}\tGuru\t${u.teachingRole || '-'}\n`;
      });
      
      tsvContent += "\n\nNo\tNama\tJabatan\tTugas Tambahan\n";
      arr.forEach((u, i) => {
        const assignments = (u.assignments || []).join(', ');
        if(assignments) {
          tsvContent += `${i+1}\t${u.name || '-'}\tGuru\t${assignments}\n`;
        }
      });
      
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "data-guru.tsv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    document.getElementById('btn-export-siswa-tsv').addEventListener('click', async () => {
      const users = await DB.getAllUsers();
      const arr = DB.toArray(users).filter(u => u.role === 'ortu');
      
      let tsvContent = "NO\tNO INDUK\tNISN\tNAMA\tKELAS/ROMBEL\n";
      arr.forEach((u, i) => {
        tsvContent += `${i+1}\t${u.nis || ''}\t${u.nisn || ''}\t${u.name || '-'}\t${u.className || '-'}\n`;
      });
      
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "data-siswa.tsv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
};
