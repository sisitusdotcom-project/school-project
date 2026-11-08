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
};