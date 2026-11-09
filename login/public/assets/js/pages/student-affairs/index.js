const StudentAffairsPages = {
async renderDashboard(container) {
Router.setTitle('Dashboard Kesiswaan', 'Monitoring kesiswaan, rombel, prestasi siswa, dan SPMB.');
const user = Auth.userData || Auth.currentUser || {};
const today = new Date().toISOString().slice(0, 10);
const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const [settings, studentsData, classesData, usersData, teacherAtt, ppdbData, achieveData] = await Promise.all([
DB.getSettings().catch(() => ({})),
DB.getAllStudents().catch(() => ({})),
DB.getClasses().catch(() => ({})),
DB.getAllUsers().catch(() => ({})),
DB.getTeacherAttendance(today, user.id || user.uid).catch(() => null),
DB.getPPDBRegistrations().catch(() => ({})),
DB.getStudentAchievements().catch(() => ({}))
]);
const studentList = DB.toArray(studentsData);
const classList = DB.toArray(classesData);
const userList = DB.toArray(usersData);
const spmbList = DB.toArray(ppdbData);
const achieveList = DB.toArray(achieveData).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
const activeStudents = studentList.length;
const maleTotal = studentList.filter((s) => s.gender === 'L').length;
const femaleTotal = studentList.filter((s) => s.gender === 'P').length;
const totalRombel = classList.length;
const avgPerRombel = totalRombel > 0 ? (activeStudents / totalRombel).toFixed(1) : '0';
const rombelSummary = classList.map((cls) => {
const clsStudents = studentList.filter((s) => s.classId === cls.id);
const lCount = clsStudents.filter((s) => s.gender === 'L').length;
const pCount = clsStudents.filter((s) => s.gender === 'P').length;
const teacher = userList.find((u) => u.id === cls.teacherId || (u.assignments && u.assignments.includes(`GURU_KELAS_${cls.id.replace('CLASS_', '')}`)));
const teacherName = teacher ? teacher.name : '-';
const fase = AppConfig.getClassPhase(cls);
const total = clsStudents.length;
let capStatus = 'Ideal';
let capTone = 'success';
if (total > 30) {
capStatus = 'Over-Capacity';
capTone = 'danger';
} else if (total >= 29) {
capStatus = 'Penuh';
capTone = 'warning';
} else if (total < 20) {
capStatus = 'Tersedia';
capTone = 'info';
}
return {
id: cls.id,
name: cls.name,
level: cls.level || parseInt(cls.name, 10) || 1,
fase,
teacherName,
lCount,
pCount,
total,
capStatus,
capTone,
students: clsStudents.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
};
}).sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name));
const idealRombelCount = rombelSummary.filter((r) => r.capStatus === 'Ideal').length;
const fullRombelCount = rombelSummary.filter((r) => r.capStatus === 'Penuh').length;
const overRombelCount = rombelSummary.filter((r) => r.capStatus === 'Over-Capacity').length;
const underRombelCount = rombelSummary.filter((r) => r.capStatus === 'Tersedia').length;
const totalAchieve = achieveList.length;
const juaraList = achieveList.filter((a) => (a.participationType || 'Juara') === 'Juara' || (a.rank && !a.rank.toLowerCase().includes('partisipan') && !a.rank.toLowerCase().includes('peserta')));
const partisipanList = achieveList.filter((a) => (a.participationType || '') === 'Partisipan / Kontingen' || (a.rank && (a.rank.toLowerCase().includes('partisipan') || a.rank.toLowerCase().includes('peserta'))));
const totalJuara = juaraList.length;
const totalPartisipan = partisipanList.length || Math.max(0, totalAchieve - totalJuara);
const juaraPercent = totalAchieve > 0 ? Math.round((totalJuara / totalAchieve) * 100) : 0;
const partisipanPercent = totalAchieve > 0 ? (100 - juaraPercent) : 0;
const totalSpmb = spmbList.length;
const regulerList = spmbList.filter((r) => (r.registrationTrack || 'Reguler') === 'Reguler');
const indenList = spmbList.filter((r) => (r.registrationTrack || '') === 'Inden (T.A Depan)');
const regulerCount = regulerList.length;
const indenCount = indenList.length;
const acceptedCount = spmbList.filter((r) => r.status === 'Diterima').length;
const regulerPercent = totalSpmb > 0 ? Math.round((regulerCount / totalSpmb) * 100) : 0;
const indenPercent = totalSpmb > 0 ? (100 - regulerPercent) : 0;
const heroHtml = AppConfig.getDashboardHeroHtml({
user,
attendanceRecord: teacherAtt,
position: 'Waka / Staf Kesiswaan',
date: today
});
container.innerHTML = `
${heroHtml}
<section class="card-grid section-spacer">
<div class="card stat-card">
<div class="stat-icon stat-icon--primary"><i class="ph ph-student"></i></div>
<div><p class="stat-value">${activeStudents}</p><p class="stat-label text-muted">Murid Aktif (${maleTotal}L / ${femaleTotal}P)</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--success"><i class="ph ph-chalkboard"></i></div>
<div><p class="stat-value">${totalRombel}</p><p class="stat-label text-muted">Rombel (Rata-rata ${avgPerRombel}/kelas)</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--warning"><i class="ph ph-trophy"></i></div>
<div><p class="stat-value">${totalAchieve}</p><p class="stat-label text-muted">Prestasi &amp; Partisipan Lomba</p></div>
</div>
<div class="card stat-card">
<div class="stat-icon stat-icon--danger"><i class="ph ph-user-plus"></i></div>
<div><p class="stat-value">${totalSpmb}</p><p class="stat-label text-muted">SPMB &amp; Inden (${acceptedCount} Diterima)</p></div>
</div>
</section>
<section class="card section-spacer">
<div class="card-header flex-between">
<div>
<h3 class="card-title"><i class="ph ph-chart-pie-slice"></i> Laporan Ringkasan Siswa &amp; Analisis Kapasitas Rombel</h3>
<p class="text-muted small">Monitoring distribusi siswa, keseimbangan gender, dan kesesuaian kapasitas standar kelas (Standar Permendikbud: 28 Siswa/Rombel).</p>
</div>
<div class="button-group">
<button id="btn-filter-fase-all" class="btn btn-sm btn-outline active">Semua Fase</button>
<button id="btn-filter-fase-a" class="btn btn-sm btn-outline">Fase A (1-2)</button>
<button id="btn-filter-fase-b" class="btn btn-sm btn-outline">Fase B (3-4)</button>
<button id="btn-filter-fase-c" class="btn btn-sm btn-outline">Fase C (5-6)</button>
</div>
</div>
<div class="card-body">
<div class="capacity-kpi-grid">
<div class="card capacity-card-ideal">
<div class="text-muted small">Kapasitas Ideal (20-28 Siswa)</div>
<div class="capacity-val-ideal">${idealRombelCount} Rombel</div>
</div>
<div class="card capacity-card-full">
<div class="text-muted small">Penuh / Maksimal (29-30 Siswa)</div>
<div class="capacity-val-full">${fullRombelCount} Rombel</div>
</div>
<div class="card capacity-card-over">
<div class="text-muted small">Over-Capacity (&gt; 30 Siswa)</div>
<div class="capacity-val-over">${overRombelCount} Rombel</div>
</div>
<div class="card capacity-card-under">
<div class="text-muted small">Kuota Tersedia (&lt; 20 Siswa)</div>
<div class="capacity-val-under">${underRombelCount} Rombel</div>
</div>
</div>
<div class="table-responsive">
<table class="table" id="table-rombel-summary">
<thead>
<tr>
<th class="th-w45">No</th>
<th>Kelas / Rombel</th>
<th>Fase</th>
<th>Wali Kelas</th>
<th class="text-center th-w65">L</th>
<th class="text-center th-w65">P</th>
<th class="text-center th-w75">Total</th>
<th class="th-w160">Kapasitas (Std: 28)</th>
</tr>
</thead>
<tbody>
${rombelSummary.map((r, i) => {
const capPercent = Math.min(100, Math.round((r.total / 28) * 100));
return `
<tr data-fase="${r.fase}">
<td>${i + 1}</td>
<td><strong>${AppConfig.escapeHtml(r.name)}</strong></td>
<td><span class="badge badge-info">${AppConfig.escapeHtml(r.fase)}</span></td>
<td>${AppConfig.escapeHtml(r.teacherName)}</td>
<td class="text-center font-bold text-primary">${r.lCount}</td>
<td class="text-center font-bold text-danger">${r.pCount}</td>
<td class="text-center font-bold">${r.total}</td>
<td>
<div class="cap-header-meta">
<span class="badge badge-${r.capTone}">${r.capStatus}</span>
<span class="small font-bold">${r.total}/28</span>
</div>
<div class="progress-bar"><div class="progress-fill kpi-fill-${r.capTone}" data-progress="${capPercent}"></div></div>
</td>
</tr>
`;
}).join('')}
</tbody>
<tfoot>
<tr class="tfoot-rekap-bg">
<td colspan="4" class="text-right">TOTAL KESELURUHAN:</td>
<td class="text-center text-primary">${maleTotal}</td>
<td class="text-center text-danger">${femaleTotal}</td>
<td class="text-center">${activeStudents}</td>
<td><span class="badge badge-primary">${totalRombel} Rombel Terdata</span></td>
</tr>
</tfoot>
</table>
</div>
<div class="button-group mt-3">
<button id="btn-export-excel" class="btn btn-primary btn-sm"><i class="ph ph-file-xls"></i> Unduh Rekap + Daftar Siswa Excel</button>
<button id="btn-export-pdf" class="btn btn-danger btn-sm"><i class="ph ph-file-pdf"></i> Unduh Rekap + Daftar Siswa PDF</button>
</div>
</div>
</section>
<div class="card-grid section-spacer">
<section class="card">
<div class="card-header flex-between">
<div>
<h3 class="card-title"><i class="ph ph-trophy"></i> Prestasi Siswa &amp; Cetak Sertifikat Resmi</h3>
<p class="text-muted small">Monitoring keikutsertaan kontingen lomba (Juara vs Partisipan) dan cetak sertifikat apresiasi.</p>
</div>
<a href="#/student-affairs/achievements" class="btn btn-sm btn-outline"><i class="ph ph-arrow-up-right"></i> Kelola di Tabel</a>
</div>
<div class="card-body">
<div class="kpi-metric-item">
<div class="kpi-metric-label">
<span><strong>Perolehan Juara (1, 2, 3 &amp; Harapan)</strong>: ${totalJuara}</span>
<span>${juaraPercent}%</span>
</div>
<div class="progress-bar"><div class="progress-fill kpi-fill-success" data-progress="${juaraPercent}"></div></div>
</div>
<div class="kpi-metric-item">
<div class="kpi-metric-label">
<span><strong>Partisipan Apresiasi (Pengalaman Tanding)</strong>: ${totalPartisipan}</span>
<span>${partisipanPercent}%</span>
</div>
<div class="progress-bar"><div class="progress-fill kpi-fill-primary" data-progress="${partisipanPercent}"></div></div>
</div>
<div class="badge-group mt-3 badge-group-mb">
<span class="badge badge-success"><i class="ph ph-medal"></i> ${totalJuara} Juara</span>
<span class="badge badge-info"><i class="ph ph-hand-heart"></i> ${totalPartisipan} Partisipan</span>
<span class="badge badge-primary"><i class="ph ph-files"></i> Sertifikat Siap Cetak</span>
</div>
<h4 class="achieve-sub-title"><i class="ph ph-clock-counter-clockwise"></i> 5 Catatan Lomba Terkini (Siap Cetak Sertifikat):</h4>
<div class="table-responsive">
<table class="table achieve-table-sm">
<thead><tr><th>Tanggal</th><th>Siswa</th><th>Nama Lomba / Event</th><th>Capaian</th><th class="text-right">Aksi</th></tr></thead>
<tbody>
${achieveList.slice(0, 5).map((a) => {
const isWin = (a.participationType || 'Juara') === 'Juara' || (a.rank && !a.rank.toLowerCase().includes('partisipan') && !a.rank.toLowerCase().includes('peserta'));
const studentObj = studentList.find((s) => s.id === a.studentId) || {};
return `
<tr>
<td>${a.date || '-'}</td>
<td><strong>${AppConfig.escapeHtml(studentObj.name || a.studentName || '-')}</strong></td>
<td>${AppConfig.escapeHtml(a.title || '-')}</td>
<td><span class="badge ${isWin ? 'badge-success' : 'badge-secondary'}">${AppConfig.escapeHtml(a.rank || (isWin ? 'Juara' : 'Partisipan'))}</span></td>
<td class="text-right">
<a href="print.html?type=certificate&id=${a.id}" target="_blank" class="btn btn-sm btn-primary" title="Cetak Sertifikat Apresiasi Resmi"><i class="ph ph-printer"></i> Cetak</a>
</td>
</tr>
`;
}).join('') || '<tr><td colspan="5" class="text-muted text-center">Belum ada catatan lomba. Tambahkan di menu Prestasi.</td></tr>'}
</tbody>
</table>
</div>
</div>
</section>
<section class="card">
<div class="card-header flex-between">
<div>
<h3 class="card-title"><i class="ph ph-users-three"></i> Pendaftar SPMB &amp; Jalur Inden (Terpadu)</h3>
<p class="text-muted small">Rasio calon siswa baru jalur reguler aktif dan pemesanan kuota inden.</p>
</div>
<a href="#/student-affairs/ppdb" class="btn btn-sm btn-outline"><i class="ph ph-arrow-up-right"></i> Kelola SPMB</a>
</div>
<div class="card-body">
<div class="kpi-metric-item">
<div class="kpi-metric-label">
<span><strong>Jalur Reguler (Tahun Ajaran Berjalan)</strong>: ${regulerCount}</span>
<span>${regulerPercent}%</span>
</div>
<div class="progress-bar"><div class="progress-fill kpi-fill-primary" data-progress="${regulerPercent}"></div></div>
</div>
<div class="kpi-metric-item">
<div class="kpi-metric-label">
<span><strong>Jalur Inden (Pemesanan Kuota Depan)</strong>: ${indenCount}</span>
<span>${indenPercent}%</span>
</div>
<div class="progress-bar"><div class="progress-fill kpi-fill-warning" data-progress="${indenPercent}"></div></div>
</div>
<div class="badge-group mt-3">
<span class="badge badge-primary"><i class="ph ph-user-check"></i> ${regulerCount} Reguler</span>
<span class="badge badge-warning"><i class="ph ph-calendar-plus"></i> ${indenCount} Inden</span>
<span class="badge badge-success"><i class="ph ph-check-circle"></i> ${acceptedCount} Diterima</span>
</div>
</div>
</section>
</div>
<section class="card section-spacer">
<div class="card-header">
<h3 class="card-title"><i class="ph ph-navigation-arrow"></i> Menu Operasional Kesiswaan</h3>
</div>
<div class="card-body">
<div class="quick-nav-grid">
<a href="#/student-affairs/ppdb" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-user-plus"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Penerimaan Siswa (SPMB &amp; Inden)</div>
<div class="quick-nav-desc">Pendaftaran online, inden &amp; verifikasi berkas</div>
</div>
</a>
<a href="#/student-affairs/achievements" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-trophy"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Prestasi &amp; Partisipan Lomba</div>
<div class="quick-nav-desc">Juara, kontingen lomba &amp; cetak sertifikat sekolah</div>
</div>
</a>
<a href="#/student-affairs/alumni" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-graduation-cap"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Penelusuran Alumni (Tracer Study)</div>
<div class="quick-nav-desc">Studi lanjut: Pesantren, MTs/SMP, SMA, PT &amp; kontak</div>
</div>
</a>
<a href="#/student-affairs/mpls" class="quick-nav-card">
<div class="quick-nav-icon"><i class="ph ph-sparkle"></i></div>
<div class="quick-nav-info">
<div class="quick-nav-title">Masa Pengenalan (MPLS)</div>
<div class="quick-nav-desc">Kegiatan orientasi murid baru &amp; transisi</div>
</div>
</a>
</div>
</div>
</section>
`;
container.querySelectorAll('[data-progress]').forEach((el) => {
el.style.width = `${el.getAttribute('data-progress')}%`;
});
const setupFaseFilter = () => {
const btnAll = document.getElementById('btn-filter-fase-all');
const btnA = document.getElementById('btn-filter-fase-a');
const btnB = document.getElementById('btn-filter-fase-b');
const btnC = document.getElementById('btn-filter-fase-c');
const buttons = [btnAll, btnA, btnB, btnC];
const rows = document.querySelectorAll('#table-rombel-summary tbody tr');
const filterFase = (fase) => {
rows.forEach((r) => {
if (!fase || r.dataset.fase === fase) {
r.style.display = '';
} else {
r.style.display = 'none';
}
});
};
if (btnAll) {
btnAll.onclick = () => {
buttons.forEach((b) => b && b.classList.remove('active'));
btnAll.classList.add('active');
filterFase('');
};
}
if (btnA) {
btnA.onclick = () => {
buttons.forEach((b) => b && b.classList.remove('active'));
btnA.classList.add('active');
filterFase('Fase A');
};
}
if (btnB) {
btnB.onclick = () => {
buttons.forEach((b) => b && b.classList.remove('active'));
btnB.classList.add('active');
filterFase('Fase B');
};
}
if (btnC) {
btnC.onclick = () => {
buttons.forEach((b) => b && b.classList.remove('active'));
btnC.classList.add('active');
filterFase('Fase C');
};
}
};
setupFaseFilter();
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
const wsRombel = XLSX.utils.json_to_sheet(rombelSummary.map((r, i) => ({
No: i + 1,
Kelas: r.name,
Fase: r.fase,
'Wali Kelas': r.teacherName,
'Laki-laki': r.lCount,
Perempuan: r.pCount,
'Total Siswa': r.total,
'Standar Kapasitas': 28,
'Status Kapasitas': r.capStatus
})));
const allStudentsDetailed = [];
let counter = 1;
rombelSummary.forEach((r) => {
r.students.forEach((s) => {
allStudentsDetailed.push({
No: counter++,
Kelas: r.name,
Fase: r.fase,
'Wali Kelas': r.teacherName,
NIS: s.nis || '-',
NISN: s.nisn || '-',
'Nama Siswa': s.name,
'L/P': s.gender || '-',
Status: s.status || 'Aktif'
});
});
});
const wsData = XLSX.utils.json_to_sheet(allStudentsDetailed);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, wsRombel, 'Rekap Rombel & Kapasitas');
XLSX.utils.book_append_sheet(wb, wsData, 'Daftar Rinci Siswa (Buku Induk)');
XLSX.writeFile(wb, `Laporan_Kesiswaan_Rombel_Detail_${todayStr.replace(/\s+/g, '_')}.xlsx`);
});
}
const exportPdfBtn = document.getElementById('btn-export-pdf');
if (exportPdfBtn) {
exportPdfBtn.addEventListener('click', () => {
if (!rombelSummary.length) {
alert('Tidak ada data rombel untuk diekspor.');
return;
}
if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
alert('Modul PDF sedang dimuat, silakan coba sesaat lagi.');
return;
}
const { jsPDF } = window.jspdf || jspdf;
const doc = new jsPDF('p', 'pt', 'a4');
doc.setFontSize(13);
doc.setFont('helvetica', 'bold');
doc.text('REKAPITULASI SISWA PER ROMBEL SD MUHAMMADIYAH 1 SEDATI', 40, 38);
doc.setFontSize(8.5);
doc.setFont('helvetica', 'normal');
doc.text(`Tanggal Cetak: ${todayStr} | Total Murid: ${activeStudents} (${maleTotal} L / ${femaleTotal} P) | Total Rombel: ${totalRombel} (Standar: 28/Rombel)`, 40, 52);
const headers = [['No', 'Kelas / Rombel', 'Fase', 'Wali Kelas', 'L', 'P', 'Total', 'Kapasitas']];
const rows = rombelSummary.map((r, i) => [i + 1, r.name, r.fase, r.teacherName, r.lCount, r.pCount, r.total, `${r.total}/28 (${r.capStatus})`]);
rows.push(['', 'TOTAL KESELURUHAN', '', '', maleTotal, femaleTotal, activeStudents, `${totalRombel} Rombel`]);
doc.autoTable({
head: headers,
body: rows,
startY: 64,
theme: 'grid',
styles: { fontSize: 8 },
headStyles: { fillColor: [37, 99, 235] },
footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
});
doc.addPage();
let curY = 40;
doc.setFontSize(13);
doc.setFont('helvetica', 'bold');
doc.text('DAFTAR RINCI SISWA PER ROMBEL (BUKU INDUK KESISWAAN)', 40, curY);
curY += 14;
doc.setFontSize(8.5);
doc.setFont('helvetica', 'normal');
doc.text(`Tahun Ajaran: ${settings.currentAcademicYear || '2026/2027'} | Tanggal Cetak: ${todayStr}`, 40, curY);
curY += 16;
rombelSummary.forEach((r) => {
if (curY > 740) {
doc.addPage();
curY = 40;
}
doc.setFontSize(10);
doc.setFont('helvetica', 'bold');
doc.text(`KELAS: ${r.name} (${r.fase}) — Wali Kelas: ${r.teacherName} | Total: ${r.total} Siswa (${r.lCount} L / ${r.pCount} P)`, 40, curY);
curY += 8;
const stuHeaders = [['No', 'NIS', 'NISN', 'Nama Lengkap Murid', 'L/P', 'Status']];
const stuRows = r.students.map((s, idx) => [idx + 1, s.nis || '-', s.nisn || '-', s.name, s.gender || '-', s.status || 'Aktif']);
doc.autoTable({
head: stuHeaders,
body: stuRows,
startY: curY,
theme: 'striped',
styles: { fontSize: 7.5, cellPadding: 2.5 },
headStyles: { fillColor: [71, 85, 105] },
margin: { left: 40, right: 40 }
});
curY = doc.lastAutoTable.finalY + 18;
});
doc.save(`Laporan_Rombel_Detail_Musada_${todayStr.replace(/\s+/g, '_')}.pdf`);
});
}
}
,
  async renderAttendanceMonitoring(container) {
    Router.setTitle('Pantau Kehadiran Siswa', 'Monitoring presensi harian seluruh rombel kelas, rekapitulasi kehadiran siswa, dan status ketidakhadiran.');
    container.innerHTML = '<div class="card section-block"><div class="card-body"><div class="loading-state"><div class="loader loading-state__loader"></div><span>Memuat data kehadiran siswa...</span></div></div></div>';
    const [settings, classesData, usersData, studentsData] = await Promise.all([
      DB.getSettings().catch(() => ({})),
      DB.getClasses().catch(() => ({})),
      DB.getAllUsers().catch(() => ({})),
      DB.getAllStudents().catch(() => ({}))
    ]);
    const classList = DB.toArray(classesData);
    const userList = DB.toArray(usersData);
    const studentList = DB.toArray(studentsData);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    let selectedDate = todayStr;
    let selectedFase = '';
    let selectedStatus = '';
    let searchQuery = '';
    const dateDisplay = (dStr) => {
      if (!dStr) return '-';
      const [y, m, d] = dStr.split('-');
      const dt = new Date(Number(y), Number(m) - 1, Number(d));
      return dt.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };
    const getTeacherName = (cls) => {
      const match = userList.find((u) => u.id === cls.teacherId || (u.assignments && u.assignments.includes(`GURU_KELAS_${cls.id.replace('CLASS_', '')}`)));
      return match ? match.name : '-';
    };
    const renderView = async () => {
      const dailyAttData = await DB.getDailyStudentAttendanceByDate(selectedDate).catch(() => ({}));
      let totalSchoolHadir = 0;
      let totalSchoolSakit = 0;
      let totalSchoolIzin = 0;
      let totalSchoolAlpa = 0;
      let totalMarkedClasses = 0;
      const rombelData = classList.map((cls) => {
        const clsStudents = studentList.filter((s) => s.classId === cls.id);
        const attObj = dailyAttData[cls.id] || {};
        const isMarked = Object.keys(attObj).length > 0;
        if (isMarked) totalMarkedClasses++;
        let h = 0, s = 0, i = 0, a = 0;
        clsStudents.forEach((stu) => {
          const st = attObj[stu.id] || attObj[stu.nis] || attObj[stu.nisn];
          if (st === 'H') h++;
          else if (st === 'S') s++;
          else if (st === 'I') i++;
          else if (st === 'A') a++;
        });
        if (isMarked) {
          totalSchoolHadir += h;
          totalSchoolSakit += s;
          totalSchoolIzin += i;
          totalSchoolAlpa += a;
        }
        const total = clsStudents.length;
        const pct = isMarked && total > 0 ? Math.round((h / total) * 100) : 0;
        return {
          id: cls.id,
          name: cls.name,
          fase: cls.fase || (cls.name.startsWith('1') || cls.name.startsWith('2') ? 'Fase A' : (cls.name.startsWith('3') || cls.name.startsWith('4') ? 'Fase B' : 'Fase C')),
          teacherName: getTeacherName(cls),
          total,
          h, s, i, a,
          pct,
          isMarked,
          students: clsStudents,
          attMap: attObj
        };
      });
      const totalStudentsCount = studentList.length;
      const schoolAttendancePct = totalStudentsCount > 0 ? Math.round((totalSchoolHadir / totalStudentsCount) * 100) : 0;
      const filteredRombel = rombelData.filter((r) => {
        if (selectedFase && r.fase !== selectedFase) return false;
        if (selectedStatus === 'marked' && !r.isMarked) return false;
        if (selectedStatus === 'unmarked' && r.isMarked) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return r.name.toLowerCase().includes(q) || r.teacherName.toLowerCase().includes(q);
        }
        return true;
      });
      container.innerHTML = `
        <div class="panel-callout panel-callout--primary section-spacer">
          <div class="kpi-card-notice">
            <i class="ph ph-info font-bold"></i>
            <div>
              <h5 class="kpi-notice-title font-bold">Panduan Fitur: Pantau Kehadiran Siswa</h5>
              <p class="kpi-notice-desc">Monitoring rekapitulasi presensi harian seluruh rombel murid (Hadir, Sakit, Izin, Alpa) yang diinput oleh wali kelas. Kesiswaan dapat mengevaluasi rombel yang belum mengisi absensi, mencetak laporan rekap, serta membuka detail siswa untuk konfirmasi langsung ke nomor WhatsApp wali murid.</p>
            </div>
          </div>
        </div>
        <section class="card-grid section-spacer">
          <div class="card stat-card">
            <div class="stat-icon stat-icon--primary"><i class="ph ph-users-three"></i></div>
            <div>
              <p class="stat-value">${totalStudentsCount}</p>
              <p class="stat-label text-muted">Total Siswa Aktif</p>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon stat-icon--success"><i class="ph ph-user-check"></i></div>
            <div>
              <p class="stat-value">${totalSchoolHadir} <span class="stat-meta">(${schoolAttendancePct}%)</span></p>
              <p class="stat-label text-muted">Hadir (H)</p>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon stat-icon--warning"><i class="ph ph-first-aid"></i></div>
            <div>
              <p class="stat-value">${totalSchoolSakit + totalSchoolIzin} <span class="stat-meta">(S:${totalSchoolSakit} I:${totalSchoolIzin})</span></p>
              <p class="stat-label text-muted">Sakit &amp; Izin</p>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon stat-icon--${totalSchoolAlpa > 0 ? 'danger' : 'info'}"><i class="ph ph-${totalSchoolAlpa > 0 ? 'user-minus' : 'calendar-check'}"></i></div>
            <div>
              <p class="stat-value">${totalSchoolAlpa} <span class="stat-meta">(${totalMarkedClasses}/${classList.length} Rombel)</span></p>
              <p class="stat-label text-muted">Alpa &amp; Terabsen</p>
            </div>
          </div>
        </section>
        <section class="card section-block">
          <div class="card-header mk-header">
            <div>
              <h3 class="card-title"><i class="ph ph-calendar-check"></i> Rekapitulasi Presensi per Rombel</h3>
              <p class="text-muted small">${dateDisplay(selectedDate)}</p>
            </div>
            <div class="mk-toolbar">
              <input type="date" id="att-date-picker" class="mk-filter" value="${selectedDate}" title="Pilih Tanggal Presensi">
              <button type="button" class="btn btn-outline btn-sm" id="btn-att-today"><i class="ph ph-calendar"></i> Hari Ini</button>
              <select id="filter-att-fase" class="mk-filter">
                <option value="">Semua Fase</option>
                <option value="Fase A"${selectedFase === 'Fase A' ? ' selected' : ''}>Fase A (Kelas 1-2)</option>
                <option value="Fase B"${selectedFase === 'Fase B' ? ' selected' : ''}>Fase B (Kelas 3-4)</option>
                <option value="Fase C"${selectedFase === 'Fase C' ? ' selected' : ''}>Fase C (Kelas 5-6)</option>
              </select>
              <select id="filter-att-status" class="mk-filter">
                <option value="">Semua Status</option>
                <option value="marked"${selectedStatus === 'marked' ? ' selected' : ''}>Sudah Diabsen (${totalMarkedClasses})</option>
                <option value="unmarked"${selectedStatus === 'unmarked' ? ' selected' : ''}>Belum Diabsen (${classList.length - totalMarkedClasses})</option>
              </select>
              <input type="search" id="att-search-input" class="mk-filter mk-search-input" placeholder="Cari rombel/guru..." value="${AppConfig.escapeHtml(searchQuery)}">
              <button type="button" class="btn btn-primary btn-sm" id="btn-print-student-att"><i class="ph ph-printer"></i> Cetak PDF</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th class="text-center table-col-sm">No</th>
                  <th>Kelas / Rombel</th>
                  <th class="text-center table-col-sm">Fase</th>
                  <th>Wali Kelas</th>
                  <th class="text-center table-col-sm">Murid</th>
                  <th class="text-center table-col-sm">Hadir</th>
                  <th class="text-center table-col-sm">Sakit</th>
                  <th class="text-center table-col-sm">Izin</th>
                  <th class="text-center table-col-sm">Alpa</th>
                  <th class="text-center table-col-sm">% Hadir</th>
                  <th class="text-center table-col-md">Status Presensi</th>
                  <th class="text-right table-col-action">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRombel.length === 0 ? '<tr><td colspan="12" class="text-center text-muted">Tidak ada data rombel yang cocok dengan filter.</td></tr>' : filteredRombel.map((r, idx) => `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td class="font-bold">${AppConfig.escapeHtml(r.name)}</td>
                    <td class="text-center"><span class="badge badge-outline">${r.fase}</span></td>
                    <td>${AppConfig.escapeHtml(r.teacherName)}</td>
                    <td class="text-center font-bold">${r.total}</td>
                    <td class="text-center font-bold text-success">${r.isMarked ? r.h : '-'}</td>
                    <td class="text-center text-warning">${r.isMarked ? r.s : '-'}</td>
                    <td class="text-center text-primary">${r.isMarked ? r.i : '-'}</td>
                    <td class="text-center font-bold text-danger">${r.isMarked ? r.a : '-'}</td>
                    <td class="text-center font-bold">${r.isMarked ? `${r.pct}%` : '-'}</td>
                    <td class="text-center">${r.isMarked ? '<span class="badge badge-success"><i class="ph ph-check-circle"></i> Sudah Diabsen</span>' : '<span class="badge badge-warning"><i class="ph ph-clock"></i> Belum Diabsen</span>'}</td>
                    <td class="text-right">
                      <button type="button" class="btn btn-outline btn-sm btn-view-class-att" data-class-id="${r.id}"><i class="ph ph-list-magnifying-glass"></i> Detail Siswa</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>
        <div class="modal-overlay" id="modal-student-att-detail">
          <div class="modal modal-wide">
            <div class="modal-header">
              <div>
                <h3 class="modal-title" id="modal-att-title">Detail Presensi Kelas</h3>
                <p class="modal-subtitle text-muted" id="modal-att-subtitle">-</p>
              </div>
              <button type="button" class="btn-icon" data-close-modal="modal-student-att-detail"><i class="ph ph-x"></i></button>
            </div>
            <div class="modal-body" id="modal-att-body">
              <div class="loading-state"><div class="loader loading-state__loader"></div><span>Memuat...</span></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline btn-sm" data-close-modal="modal-student-att-detail">Tutup</button>
            </div>
          </div>
        </div>
      `;
      document.getElementById('att-date-picker').addEventListener('change', (e) => {
        selectedDate = e.target.value;
        renderView();
      });
      document.getElementById('btn-att-today').addEventListener('click', () => {
        selectedDate = todayStr;
        renderView();
      });
      document.getElementById('filter-att-fase').addEventListener('change', (e) => {
        selectedFase = e.target.value;
        renderView();
      });
      document.getElementById('filter-att-status').addEventListener('change', (e) => {
        selectedStatus = e.target.value;
        renderView();
      });
      document.getElementById('att-search-input').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderView();
      });
      container.querySelectorAll('.btn-view-class-att').forEach((btn) => {
        btn.addEventListener('click', () => {
          const clsId = btn.dataset.classId;
          const targetRombel = rombelData.find((r) => r.id === clsId);
          if (!targetRombel) return;
          document.getElementById('modal-att-title').innerText = `Detail Presensi Siswa: ${targetRombel.name}`;
          document.getElementById('modal-att-subtitle').innerText = `Tanggal: ${dateDisplay(selectedDate)} | Wali Kelas: ${targetRombel.teacherName} | Status: ${targetRombel.isMarked ? 'Sudah Diabsen' : 'Belum Diabsen'}`;
          const students = targetRombel.students.sort((a, b) => a.name.localeCompare(b.name));
          const attMap = targetRombel.attMap;
          const modalBody = document.getElementById('modal-att-body');
          modalBody.innerHTML = `
            <div class="kpi-mini-summary section-spacer">
              <span class="badge badge-outline font-bold">Total: ${targetRombel.total}</span>
              <span class="badge badge-success font-bold">Hadir: ${targetRombel.h}</span>
              <span class="badge badge-warning font-bold">Sakit: ${targetRombel.s}</span>
              <span class="badge badge-primary font-bold">Izin: ${targetRombel.i}</span>
              <span class="badge badge-danger font-bold">Alpa: ${targetRombel.a}</span>
            </div>
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th class="text-center table-col-sm">No</th>
                    <th class="table-col-sm">NIS</th>
                    <th>Nama Murid</th>
                    <th class="text-center table-col-sm">L/P</th>
                    <th class="text-center table-col-md">Status Presensi</th>
                    <th>Kontak Wali Murid</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.length === 0 ? '<tr><td colspan="6" class="text-center text-muted">Tidak ada siswa terdaftar di rombel ini.</td></tr>' : students.map((s, idx) => {
                    const st = attMap[s.id] || attMap[s.nis] || attMap[s.nisn];
                    let badgeHtml = '<span class="badge badge-outline text-muted">Belum Ditandai</span>';
                    if (st === 'H') badgeHtml = '<span class="badge badge-success"><i class="ph ph-check"></i> Hadir</span>';
                    else if (st === 'S') badgeHtml = '<span class="badge badge-warning"><i class="ph ph-first-aid"></i> Sakit</span>';
                    else if (st === 'I') badgeHtml = '<span class="badge badge-primary"><i class="ph ph-info"></i> Izin</span>';
                    else if (st === 'A') badgeHtml = '<span class="badge badge-danger font-bold"><i class="ph ph-x"></i> Alpa</span>';
                    const rawPhone = s.parentPhone || s.parent_phone || s.phone || s.telepon || '';
                    const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
                    const waNum = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
                    const contactHtml = cleanPhone.length >= 8 ? `<a href="https://wa.me/${waNum}" target="_blank" class="btn btn-outline btn-sm"><i class="ph ph-whatsapp-logo text-success"></i> ${rawPhone}</a>` : '<span class="text-muted">-</span>';
                    return `
                      <tr>
                        <td class="text-center">${idx + 1}</td>
                        <td class="font-bold">${s.nis || '-'}</td>
                        <td class="font-bold">${AppConfig.escapeHtml(s.name)}</td>
                        <td class="text-center">${s.gender || '-'}</td>
                        <td class="text-center">${badgeHtml}</td>
                        <td>${contactHtml}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
          App.openModal('modal-student-att-detail');
        });
      });
      document.getElementById('btn-print-student-att').addEventListener('click', () => {
        if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
          alert('Modul cetak PDF sedang dimuat, silakan coba sesaat lagi.');
          return;
        }
        const { jsPDF } = window.jspdf || jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('SD MUHAMMADIYAH 1 SEDATI', 40, 45);
        doc.setFontSize(11);
        doc.text('REKAPITULASI PRESENSI HARIAN SISWA SELURUH ROMBEL', 40, 62);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tanggal Presensi: ${dateDisplay(selectedDate)} | Tahun Ajaran: ${settings.currentAcademicYear || '2026/2027'}`, 40, 78);
        doc.text(`Total Siswa: ${totalStudentsCount} Murid | Hadir: ${totalSchoolHadir} (${schoolAttendancePct}%) | Sakit: ${totalSchoolSakit} | Izin: ${totalSchoolIzin} | Alpa: ${totalSchoolAlpa}`, 40, 92);
        const headers = [['No', 'Kelas / Rombel', 'Fase', 'Wali Kelas', 'Jml', 'H', 'S', 'I', 'A', '% Hadir', 'Status']];
        const rows = rombelData.map((r, idx) => [
          idx + 1,
          r.name,
          r.fase,
          r.teacherName,
          r.total,
          r.isMarked ? r.h : '-',
          r.isMarked ? r.s : '-',
          r.isMarked ? r.i : '-',
          r.isMarked ? r.a : '-',
          r.isMarked ? `${r.pct}%` : '-',
          r.isMarked ? 'Sudah Diabsen' : 'Belum Diabsen'
        ]);
        rows.push([
          '',
          'TOTAL KESELURUHAN',
          '-',
          '-',
          totalStudentsCount,
          totalSchoolHadir,
          totalSchoolSakit,
          totalSchoolIzin,
          totalSchoolAlpa,
          `${schoolAttendancePct}%`,
          `${totalMarkedClasses} / ${classList.length} Rombel`
        ]);
        doc.autoTable({
          head: headers,
          body: rows,
          startY: 105,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] }
        });
        const finalY = doc.lastAutoTable.finalY + 30;
        doc.setFontSize(9);
        doc.text('Mengetahui,', 40, finalY);
        doc.text('Kepala Sekolah', 40, finalY + 14);
        doc.text('Waka Kesiswaan', 400, finalY + 14);
        doc.setFont('helvetica', 'bold');
        doc.text(settings.headmaster || 'Dhani Harsyahyadi, S.H.I', 40, finalY + 70);
        doc.text('Ustadz Furqon, SH.', 400, finalY + 70);
        doc.save(`Rekap_Presensi_Siswa_Musada_${selectedDate}.pdf`);
      });
    };
    await renderView();
  }
};
