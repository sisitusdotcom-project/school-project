const TechSupportModule = (function () {
let activeTab = 'form';
let adminFilterStatus = 'all';
let adminFilterCat = 'all';
let adminSearchQuery = '';
let selectedScreenshotFile = null;
function formatDateTime(ts) {
if (!ts) return '-';
const d = new Date(ts);
return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function getStatusBadge(status) {
switch (status) {
case 'Selesai':
return '<span class="badge badge-success"><i class="ph ph-check-circle"></i> Selesai</span>';
case 'Diproses':
return '<span class="badge badge-warning"><i class="ph ph-hourglass-medium"></i> Diproses</span>';
default:
return '<span class="badge badge-info"><i class="ph ph-sparkle"></i> Baru</span>';
}
}
function getCategoryBadge(cat) {
switch (cat) {
case 'Kendala Teknis / Bug':
return '<span class="badge badge-danger"><i class="ph ph-bug"></i> Bug / Kendala</span>';
case 'Usulan Alur Kerja / Fitur Baru':
return '<span class="badge badge-primary"><i class="ph ph-lightbulb"></i> Usulan Fitur</span>';
case 'Masukan Tampilan / Desain UI':
return '<span class="badge badge-warning"><i class="ph ph-paint-brush"></i> Tampilan UI</span>';
default:
return '<span class="badge badge-outline"><i class="ph ph-chat-circle-text"></i> Umum</span>';
}
}
function cleanFeedbackUrl(rawUrl) {
if (!rawUrl || typeof rawUrl !== 'string') return '';
const url = rawUrl.trim();
try {
if (!/^https?:\/\//i.test(url)) return url;
const u = new URL(url);
if (u.hostname.includes('google.') && u.pathname.includes('/search')) {
const q = u.searchParams.get('q');
const cleanU = new URL(u.origin + u.pathname);
if (q) cleanU.searchParams.set('q', q);
return cleanU.toString();
}
const stripParams = ['oq', 'gs_lcrp', 'sourceid', 'ved', 'ei', 'client', 'biw', 'bih', 'dpr', 'fbclid', 'gclid'];
stripParams.forEach(p => u.searchParams.delete(p));
Array.from(u.searchParams.keys()).forEach(k => {
if (k.toLowerCase().startsWith('utm_')) u.searchParams.delete(k);
});
return u.toString();
} catch (e) {
return url;
}
}
function renderRichFeedbackText(rawText) {
if (!rawText) return '';
let text = AppConfig.escapeHtml(rawText);
text = text.replace(/\t+/g, ' ');
text = text.replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi, '<u>$1</u>');
text = text.replace(/__([^_]+)__/g, '<u>$1</u>');
text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
text = text.replace(/\[\s*([-*•]|\d+\.)\s+([^\]]+)\]\(((?:[^()\s]+|\([^()\s]*\))*)\)/g, '$1 [$2]($3)');
text = text.replace(/\[([^\]]+)\]\(((?:[^()\s]+|\([^()\s]*\))*)\)/g, (match, label, rawUrl) => {
const cleanUrl = cleanFeedbackUrl(rawUrl.trim());
const isSafe = /^https?:\/\//i.test(cleanUrl) || /^mailto:/i.test(cleanUrl) || cleanUrl.startsWith('#');
const safeUrl = isSafe ? cleanUrl : '#';
const target = cleanUrl.startsWith('#') ? '_self' : '_blank';
return `<a href="${safeUrl}" class="feedback-reply-link" target="${target}" rel="noopener noreferrer">${label} <i class="ph ph-arrow-square-out"></i></a>`;
});
text = text.replace(/(?<!href=")(?<!">)(https?:\/\/[^\s<]+)/g, (match, bareUrl) => {
const clean = cleanFeedbackUrl(bareUrl);
return `<a href="${clean}" class="feedback-reply-link" target="_blank" rel="noopener noreferrer">${clean} <i class="ph ph-arrow-square-out"></i></a>`;
});
return text;
}
function renderAdminReplyCard(item, isTable = false) {
if (!item || !item.adminNote) return '';
const timeStr = item.updatedAt ? formatDateTime(item.updatedAt) : '';
return `<div class="feedback-admin-card${isTable ? ' feedback-admin-card--table' : ''}"><div class="feedback-admin-head"><span class="feedback-admin-badge"><i class="ph ph-shield-check"></i> Tanggapan IT Support</span>${timeStr ? `<span class="feedback-admin-time"><i class="ph ph-clock"></i> ${timeStr}</span>` : ''}</div><div class="feedback-admin-content">${renderRichFeedbackText(item.adminNote)}</div></div>`;
}
function extractFileIdFromUrl(rawUrl) {
if (!rawUrl || typeof rawUrl !== 'string') return '';
const url = rawUrl.trim();
if (typeof DriveBridge !== 'undefined' && DriveBridge.extractFileId) {
const bid = DriveBridge.extractFileId(url);
if (bid) return bid;
}
const m = url.match(/[-\w]{25,}/);
return m ? m[0] : '';
}
function getSafeDriveImageUrl(rawUrl, size = 'w1600') {
if (!rawUrl) return '';
const url = String(rawUrl).trim();
if (url.startsWith('data:') || url.startsWith('blob:')) return url;
const fileId = extractFileIdFromUrl(url);
if (fileId) {
return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${size}`;
}
return url;
}
function getSafeDriveDirectUrl(rawUrl, title = 'Bukti Screenshot') {
if (!rawUrl) return '#';
const url = String(rawUrl).trim();
const fileId = extractFileIdFromUrl(url);
if (fileId) {
return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
}
if (typeof DriveBridge !== 'undefined' && DriveBridge.getViewerUrl) {
return DriveBridge.getViewerUrl(url, title);
}
return url;
}
async function fetchAllIssues() {
if (typeof db === 'undefined') return [];
try {
const snap = await db.ref('system_feedback').once('value');
const val = snap.val() || {};
return Object.entries(val).map(([id, item]) => ({ id, ...(typeof item === 'object' ? item : {}) })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
} catch (e) {
return [];
}
}
function showImageViewer(imgUrl, title = 'Bukti Screenshot') {
const old = document.getElementById('modal-img-viewer');
if (old && old.parentNode) old.parentNode.removeChild(old);
const fileId = extractFileIdFromUrl(imgUrl);
const primaryUrl = getSafeDriveImageUrl(imgUrl, 'w1600');
const fallbackUrl = fileId ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1600` : primaryUrl;
const directUrl = getSafeDriveDirectUrl(imgUrl, title);
const m = document.createElement('div');
m.id = 'modal-img-viewer';
m.className = 'modal-overlay active';
m.innerHTML = `<div class="modal img-viewer-modal"><div class="modal-header"><h3 class="modal-title"><i class="ph ph-image"></i> ${AppConfig.escapeHtml(title)}</h3><button type="button" class="modal-close" id="btn-close-viewer"><i class="ph ph-x"></i></button></div><div class="modal-body text-center img-viewer-body"><div class="img-viewer-loading" id="viewer-loader"><i class="ph ph-spinner ph-spin"></i> Memuat gambar...</div><img src="${AppConfig.escapeHtml(primaryUrl)}" alt="${AppConfig.escapeHtml(title)}" class="img-viewer-img hidden" id="viewer-img-el"><div class="img-viewer-error hidden" id="viewer-err-box"><i class="ph ph-image-broken img-viewer-error-icon"></i><p class="img-viewer-error-text">Gambar tidak dapat dipratinjau langsung di jendela ini.</p><a href="${AppConfig.escapeHtml(directUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary"><i class="ph ph-arrow-square-out"></i> Buka Gambar di Tab Baru</a></div></div><div class="modal-footer"><a href="${AppConfig.escapeHtml(directUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm"><i class="ph ph-arrow-square-out"></i> Buka Ukuran Asli</a><button type="button" class="btn btn-primary btn-sm" id="btn-ok-viewer">Tutup</button></div></div>`;
document.body.appendChild(m);
const imgEl = m.querySelector('#viewer-img-el');
const loader = m.querySelector('#viewer-loader');
const errBox = m.querySelector('#viewer-err-box');
let triedFallback = false;
imgEl.onload = () => {
if (loader) loader.classList.add('hidden');
imgEl.classList.remove('hidden');
};
imgEl.onerror = () => {
if (!triedFallback && fallbackUrl && fallbackUrl !== imgEl.src) {
triedFallback = true;
imgEl.src = fallbackUrl;
} else {
if (loader) loader.classList.add('hidden');
if (errBox) errBox.classList.remove('hidden');
}
};
const closeViewer = () => { if (m && m.parentNode) m.parentNode.removeChild(m); };
m.querySelector('#btn-close-viewer').onclick = closeViewer;
m.querySelector('#btn-ok-viewer').onclick = closeViewer;
m.onclick = (e) => { if (e.target === m) closeViewer(); };
}
function showFollowupModal(issue, onUpdated) {
const old = document.getElementById('modal-fb-followup');
if (old && old.parentNode) old.parentNode.removeChild(old);
const m = document.createElement('div');
m.id = 'modal-fb-followup';
m.className = 'modal-overlay active';
let initialNote = issue.adminNote || 'Terimakasih atas laporannya.\n\n\n\n- IT Support -';
if (issue.adminNote) {
initialNote = initialNote.replace(/\t+/g, ' ');
initialNote = initialNote.replace(/\[\s*([-*•]|\d+\.)\s+([^\]]+)\]\(((?:[^()\s]+|\([^()\s]*\))*)\)/g, '$1 [$2]($3)');
initialNote = initialNote.replace(/\[([^\]]+)\]\(((?:[^()\s]+|\([^()\s]*\))*)\)/g, (m, label, u) => `[${label}](${cleanFeedbackUrl(u)})`);
}
m.innerHTML = `<div class="modal feedback-modal"><div class="modal-header"><h3 class="modal-title"><i class="ph ph-wrench"></i> Tindak Lanjut Masukan / Kendala</h3><button type="button" class="modal-close" id="btn-close-followup"><i class="ph ph-x"></i></button></div><form id="form-fb-followup"><div class="modal-body"><div class="feedback-detail-info"><p class="feedback-detail-row"><strong>Pelapor:</strong> ${AppConfig.escapeHtml(issue.userName || '-')} (${AppConfig.escapeHtml(issue.userRole || '-')})</p><p class="feedback-detail-row"><strong>Waktu:</strong> ${formatDateTime(issue.createdAt)}</p><p class="feedback-detail-row"><strong>Kategori & Modul:</strong> ${AppConfig.escapeHtml(issue.category || '-')} &bull; ${AppConfig.escapeHtml(issue.page || '-')}</p><p class="feedback-detail-row"><strong>Judul:</strong> ${AppConfig.escapeHtml(issue.title || '-')}</p><div class="feedback-desc-box"><label>Uraian Masukan / Kendala:</label><p class="feedback-desc-text">${AppConfig.escapeHtml(issue.description || '-')}</p></div>${issue.screenshotUrl ? `<div class="feedback-screenshot-link"><button type="button" class="btn btn-sm btn-outline" id="btn-view-modal-ss"><i class="ph ph-image"></i> Lihat Screenshot Bukti</button></div>` : ''}</div><div class="form-group"><label>Status Penanganan <span class="text-danger">*</span></label><select id="followup-status" class="form-control" required><option value="Baru" ${issue.status === 'Baru' ? 'selected' : ''}>Baru (Menunggu Tindak Lanjut)</option><option value="Diproses" ${issue.status === 'Diproses' ? 'selected' : ''}>Diproses (Sedang Dikerjakan Developer)</option><option value="Selesai" ${issue.status === 'Selesai' ? 'selected' : ''}>Selesai (Sudah Diterapkan / Diperbaiki)</option></select></div><div class="form-group"><label>Catatan Pengembang / Tanggapan IT Support</label><div class="feedback-reply-toolbar"><div class="feedback-reply-btn-group"><button type="button" class="fb-fmt-btn" id="fb-fmt-bold" title="Tebal (**teks**)"><strong>B</strong></button><button type="button" class="fb-fmt-btn" id="fb-fmt-italic" title="Miring (*teks*)"><em>I</em></button><button type="button" class="fb-fmt-btn" id="fb-fmt-underline" title="Garis Bawah (<u>teks</u>)"><u>U</u></button><button type="button" class="fb-fmt-btn" id="fb-fmt-link" title="Sisipkan Link Web / Panduan"><i class="ph ph-link"></i> Link</button></div><select id="fb-quick-template" class="fb-template-select"><option value="">-- Template Balasan Cepat --</option><option value="gps">GPS / Lokasi Belum Valid</option><option value="wip">Sedang Diproses Developer</option><option value="done">Selesai / Sudah Teratasi</option><option value="info">Minta Info / Bukti Tambahan</option></select></div><textarea id="followup-note" class="form-control feedback-reply-textarea" rows="7" placeholder="Tuliskan respon atau arahan teknis...">${AppConfig.escapeHtml(initialNote)}</textarea><div class="feedback-reply-hint"><i class="ph ph-info"></i> Format: **Tebal**, *Miring*, <u>Garis Bawah</u>, [Label Link](https://...), enter untuk baris baru.</div></div></div><div class="modal-footer"><button type="button" class="btn btn-outline" id="btn-cancel-followup">Batal</button><button type="submit" class="btn btn-primary" id="btn-save-followup"><i class="ph ph-floppy-disk"></i> Simpan Tanggapan</button></div></form></div>`;
document.body.appendChild(m);
const closeM = () => { if (m && m.parentNode) m.parentNode.removeChild(m); };
m.querySelector('#btn-close-followup').onclick = closeM;
m.querySelector('#btn-cancel-followup').onclick = closeM;
m.onclick = (e) => { if (e.target === m) closeM(); };
if (issue.screenshotUrl) {
const btnSs = m.querySelector('#btn-view-modal-ss');
if (btnSs) btnSs.onclick = () => showImageViewer(issue.screenshotUrl, issue.title);
}
const noteEl = m.querySelector('#followup-note');
if (!issue.adminNote) {
noteEl.setSelectionRange(30, 30);
}
function wrapSelection(before, after, defaultText = 'teks') {
const start = noteEl.selectionStart;
const end = noteEl.selectionEnd;
const val = noteEl.value;
const selected = val.substring(start, end) || defaultText;
const replacement = before + selected + after;
noteEl.value = val.substring(0, start) + replacement + val.substring(end);
noteEl.focus();
noteEl.setSelectionRange(start + before.length, start + before.length + selected.length);
}
m.querySelector('#fb-fmt-bold').onclick = () => wrapSelection('**', '**', 'teks tebal');
m.querySelector('#fb-fmt-italic').onclick = () => wrapSelection('*', '*', 'teks miring');
m.querySelector('#fb-fmt-underline').onclick = () => wrapSelection('<u>', '</u>', 'teks bergaris bawah');
m.querySelector('#fb-fmt-link').onclick = () => {
const start = noteEl.selectionStart;
const end = noteEl.selectionEnd;
const val = noteEl.value;
const selected = val.substring(start, end);
const inputUrl = prompt('Masukkan URL / Link tujuan (contoh: https://musada.sch.id atau #/panduan):', 'https://');
if (!inputUrl) return;
const cleanUrl = cleanFeedbackUrl(inputUrl.trim());
if (!cleanUrl) return;
let targetSelected = selected;
let bulletPrefix = '';
const bMatch = targetSelected.match(/^(\s*[-*•]\s+|\s*\d+\.\s+)/);
if (bMatch) {
bulletPrefix = bMatch[0];
targetSelected = targetSelected.substring(bulletPrefix.length);
}
const inputLabel = prompt('Teks label tautan yang ditampilkan:', targetSelected || 'Buka Tautan') || cleanUrl;
const linkMd = `${bulletPrefix}[${inputLabel}](${cleanUrl})`;
noteEl.value = val.substring(0, start) + linkMd + val.substring(end);
noteEl.focus();
noteEl.setSelectionRange(start + linkMd.length, start + linkMd.length);
};
const tplSelect = m.querySelector('#fb-quick-template');
if (tplSelect) {
tplSelect.onchange = () => {
const val = tplSelect.value;
if (!val) return;
let tplText = '';
const stEl = m.querySelector('#followup-status');
if (val === 'gps') {
tplText = 'Terimakasih atas laporannya.\n\nKendala posisi belum valid umumnya terjadi saat akurasi GPS perangkat di atas batas toleransi (50 meter). Silakan coba langkah berikut:\n1. Pastikan fitur **Akurasi Lokasi Tinggi (Google Location Accuracy)** pada ponsel telah aktif.\n2. Buka aplikasi Google Maps sejenak hingga posisi biru terkunci sebelum presensi di SMS Musada.\n3. Pastikan izin lokasi browser disetel ke **Izinkan Saat Menggunakan Aplikasi**.\n4. Hindari aplikasi pihak ketiga seperti VPN atau Fake GPS.\n\nJika masih mendesak dan posisi tetap terkendala, silakan melakukan presensi manual sementara ke bagian Personalia.\n\n- IT Support -';
if (stEl) stEl.value = 'Diproses';
} else if (val === 'wip') {
tplText = 'Terimakasih atas laporannya.\n\nLaporan kendala Anda telah kami terima dan saat ini sedang dalam proses penanganan oleh tim teknis. Kami akan mengabari kembali setelah perbaikan selesai diterapkan.\n\n- IT Support -';
if (stEl) stEl.value = 'Diproses';
} else if (val === 'done') {
tplText = 'Terimakasih atas laporannya.\n\nKendala yang dilaporkan telah berhasil ditelusuri dan diselesaikan pada sistem. Silakan memuat ulang halaman (refresh) dan mencoba kembali fitur tersebut.\n\n- IT Support -';
if (stEl) stEl.value = 'Selesai';
} else if (val === 'info') {
tplText = 'Terimakasih atas laporannya.\n\nUntuk mempermudah investigasi kendala ini, mohon bantuan Anda untuk menyampaikan informasi tambahan (misal: tipe perangkat, browser yang digunakan, atau tangkapan layar pesan error).\n\n- IT Support -';
if (stEl) stEl.value = 'Diproses';
}
if (tplText) {
noteEl.value = tplText;
noteEl.focus();
}
tplSelect.value = '';
};
}
const form = m.querySelector('#form-fb-followup');
form.onsubmit = async (e) => {
e.preventDefault();
const btnSave = m.querySelector('#btn-save-followup');
btnSave.disabled = true;
btnSave.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
const newStatus = m.querySelector('#followup-status').value;
let newNote = m.querySelector('#followup-note').value.trim();
if (newNote) {
newNote = newNote.replace(/\t+/g, ' ');
newNote = newNote.replace(/\[\s*([-*•]|\d+\.)\s+([^\]]+)\]\(((?:[^()\s]+|\([^()\s]*\))*)\)/g, '$1 [$2]($3)');
newNote = newNote.replace(/\[([^\]]+)\]\(((?:[^()\s]+|\([^()\s]*\))*)\)/g, (m, label, u) => `[${label}](${cleanFeedbackUrl(u)})`);
const prefix = 'Terimakasih atas laporannya.';
if (!/^\s*terimakasih\s+atas\s+laporannya\.?/i.test(newNote)) {
newNote = prefix + '\n\n' + newNote;
}
if (!/(?:it\s*support|\-\s*it\s*support\s*\-?)\s*$/i.test(newNote)) {
newNote = newNote + '\n\n- IT Support -';
}
}
try {
await db.ref(`system_feedback/${issue.id}`).update({
status: newStatus,
adminNote: newNote,
updatedAt: Date.now()
});
closeM();
if (onUpdated) onUpdated();
} catch (err) {
btnSave.disabled = false;
btnSave.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Tanggapan';
alert('Gagal menyimpan tindak lanjut: ' + (err.message || err));
}
};
}
async function renderPage(container) {
Router.setTitle('Lapor Kendala', 'Saluran terbuka pengembang untuk masukan dan kendala teknis.');
const user = Auth.userData || Auth.currentUser || {};
const uid = user.uid || Auth.currentUser?.uid;
const role = Auth.currentRole || user.role || 'guru';
const isAdmin = role === AppConfig.ROLES.ADMIN || role === AppConfig.ROLES.IT_ADMIN;
if (isAdmin && activeTab === 'form' && !container.dataset.tabInitialized) {
activeTab = 'inbox';
}
container.dataset.tabInitialized = 'true';
const allIssues = await fetchAllIssues();
const myIssues = allIssues.filter(i => i.userId === uid);
const newCount = allIssues.filter(i => i.status === 'Baru').length;
const inProgCount = allIssues.filter(i => i.status === 'Diproses').length;
const doneCount = allIssues.filter(i => i.status === 'Selesai').length;
let filteredInbox = allIssues;
if (adminFilterStatus !== 'all') {
filteredInbox = filteredInbox.filter(i => i.status === adminFilterStatus);
}
if (adminFilterCat !== 'all') {
filteredInbox = filteredInbox.filter(i => i.category === adminFilterCat);
}
if (adminSearchQuery.trim()) {
const q = adminSearchQuery.toLowerCase().trim();
filteredInbox = filteredInbox.filter(i => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q) || (i.userName || '').toLowerCase().includes(q) || (i.page || '').toLowerCase().includes(q));
}
container.innerHTML = `
<div class="feedback-page-wrapper">
<div class="feedback-top-bar card">
<div class="feedback-title-group">
<h2 class="feedback-main-title"><i class="ph ph-lifebuoy"></i> Lapor Kendala Teknis</h2>
<p class="feedback-sub-text">Sampaikan kendala sistem atau usulan fitur untuk pengembang.</p>
</div>
<div class="feedback-tab-nav">
${isAdmin ? `<button type="button" class="btn btn-sm ${activeTab === 'inbox' ? 'btn-primary' : 'btn-outline'} btn-fb-tab" data-tab="inbox"><i class="ph ph-tray"></i> Kotak Masuk ${newCount > 0 ? `<span class="badge badge-danger">${newCount}</span>` : `<span class="badge badge-light">${allIssues.length}</span>`}</button>` : ''}
<button type="button" class="btn btn-sm ${activeTab === 'form' ? 'btn-primary' : 'btn-outline'} btn-fb-tab" data-tab="form"><i class="ph ph-plus-circle"></i> Buat Laporan</button>
<button type="button" class="btn btn-sm ${activeTab === 'my' ? 'btn-primary' : 'btn-outline'} btn-fb-tab" data-tab="my"><i class="ph ph-clock-counter-clockwise"></i> Riwayat <span class="badge badge-light">${myIssues.length}</span></button>
</div>
</div>
${activeTab === 'inbox' && isAdmin ? `
<section class="card-grid feedback-stats-grid section-spacer">
<div class="card stat-card"><div class="stat-icon stat-icon--primary"><i class="ph ph-chats-circle"></i></div><div><p class="stat-value">${allIssues.length}</p><p class="stat-label text-muted">Total Masukan</p></div></div>
<div class="card stat-card"><div class="stat-icon stat-icon--danger"><i class="ph ph-bell-ringing"></i></div><div><p class="stat-value">${newCount}</p><p class="stat-label text-muted">Laporan Baru</p></div></div>
<div class="card stat-card"><div class="stat-icon stat-icon--warning"><i class="ph ph-hourglass-high"></i></div><div><p class="stat-value">${inProgCount}</p><p class="stat-label text-muted">Sedang Diproses</p></div></div>
<div class="card stat-card"><div class="stat-icon stat-icon--success"><i class="ph ph-check-circle"></i></div><div><p class="stat-value">${doneCount}</p><p class="stat-label text-muted">Selesai Ditangani</p></div></div>
</section>
<div class="card section-block">
<div class="card-header feedback-toolbar-header">
<h3 class="card-title"><i class="ph ph-tray"></i> Masukan &amp; Kendala Pengguna (${filteredInbox.length})</h3>
<div class="feedback-filters-row">
<input type="text" id="admin-fb-search" class="form-control form-control-sm" placeholder="Cari pelapor / kendala..." value="${AppConfig.escapeHtml(adminSearchQuery)}">
<select id="admin-fb-filter-status" class="form-control form-control-sm"><option value="all" ${adminFilterStatus === 'all' ? 'selected' : ''}>Semua Status</option><option value="Baru" ${adminFilterStatus === 'Baru' ? 'selected' : ''}>Baru</option><option value="Diproses" ${adminFilterStatus === 'Diproses' ? 'selected' : ''}>Diproses</option><option value="Selesai" ${adminFilterStatus === 'Selesai' ? 'selected' : ''}>Selesai</option></select>
<select id="admin-fb-filter-cat" class="form-control form-control-sm"><option value="all" ${adminFilterCat === 'all' ? 'selected' : ''}>Semua Kategori</option><option value="Kendala Teknis / Bug" ${adminFilterCat === 'Kendala Teknis / Bug' ? 'selected' : ''}>Bug / Kendala</option><option value="Usulan Alur Kerja / Fitur Baru" ${adminFilterCat === 'Usulan Alur Kerja / Fitur Baru' ? 'selected' : ''}>Usulan Fitur</option><option value="Masukan Tampilan / Desain UI" ${adminFilterCat === 'Masukan Tampilan / Desain UI' ? 'selected' : ''}>Tampilan UI</option></select>
</div>
</div>
<div class="table-responsive feedback-table-desktop">
<table class="table feedback-table">
<thead><tr><th>Waktu</th><th>Pelapor</th><th>Kategori &amp; Modul</th><th>Uraian Masukan / Kendala</th><th>Screenshot</th><th>Status</th><th>Aksi</th></tr></thead>
<tbody>
${filteredInbox.length ? filteredInbox.map(item => `
<tr>
<td class="feedback-col-time">${formatDateTime(item.createdAt)}</td>
<td class="feedback-col-user"><strong>${AppConfig.escapeHtml(item.userName || 'Anonim')}</strong><div class="text-muted small">${AppConfig.escapeHtml(item.userRole || '-')} &bull; ${AppConfig.escapeHtml(item.userEmail || '-')}</div></td>
<td>${getCategoryBadge(item.category)}<div class="feedback-module-badge"><i class="ph ph-folder"></i> ${AppConfig.escapeHtml(item.page || '-')}</div></td>
<td><strong class="feedback-row-title">${AppConfig.escapeHtml(item.title || '-')}</strong><p class="feedback-row-desc">${AppConfig.escapeHtml(item.description || '-')}</p>${renderAdminReplyCard(item, true)}</td>
<td>${item.screenshotUrl ? `<button type="button" class="btn btn-xs btn-outline btn-fb-view-ss" data-url="${AppConfig.escapeHtml(item.screenshotUrl)}" data-title="${AppConfig.escapeHtml(item.title || '')}"><i class="ph ph-image"></i> Lihat</button>` : '<span class="text-muted small">—</span>'}</td>
<td>${getStatusBadge(item.status)}</td>
<td>
<div class="btn-group">
<button type="button" class="btn btn-xs btn-primary btn-fb-followup" data-id="${item.id}" title="Tindak Lanjut"><i class="ph ph-wrench"></i> Respon</button>
<button type="button" class="btn btn-xs btn-outline-danger btn-fb-delete" data-id="${item.id}" title="Hapus"><i class="ph ph-trash"></i></button>
</div>
</td>
</tr>
`).join('') : `<tr><td colspan="7" class="text-center text-muted py-16">Tidak ada masukan yang sesuai filter.</td></tr>`}
</tbody>
</table>
</div>
<div class="feedback-cards-mobile">
${filteredInbox.length ? filteredInbox.map(item => `
<div class="feedback-inbox-card">
<div class="feedback-inbox-card-head">
<div class="feedback-inbox-user">
<div class="feedback-inbox-avatar"><i class="ph ph-user"></i></div>
<div>
<strong class="feedback-inbox-uname">${AppConfig.escapeHtml(item.userName || 'Anonim')}</strong>
<div class="feedback-inbox-urole">${AppConfig.escapeHtml(item.userRole || '-')} &bull; ${AppConfig.escapeHtml(item.userEmail || '-')}</div>
</div>
</div>
<div>${getStatusBadge(item.status)}</div>
</div>
<div class="feedback-inbox-card-meta">
<span class="feedback-inbox-time"><i class="ph ph-calendar"></i> ${formatDateTime(item.createdAt)}</span>
${getCategoryBadge(item.category)}
<span class="badge badge-outline"><i class="ph ph-folder"></i> ${AppConfig.escapeHtml(item.page || '-')}</span>
</div>
<div class="feedback-inbox-card-body">
<h4 class="feedback-inbox-title">${AppConfig.escapeHtml(item.title || '-')}</h4>
<p class="feedback-inbox-desc">${AppConfig.escapeHtml(item.description || '-')}</p>
${item.screenshotUrl ? `
<div class="feedback-inbox-ss-row">
<button type="button" class="btn btn-xs btn-outline btn-fb-view-ss" data-url="${AppConfig.escapeHtml(item.screenshotUrl)}" data-title="${AppConfig.escapeHtml(item.title || '')}">
<i class="ph ph-image"></i> Lihat Screenshot Bukti
</button>
</div>
` : ''}
${renderAdminReplyCard(item, false)}
</div>
<div class="feedback-inbox-card-actions">
<button type="button" class="btn btn-xs btn-primary btn-fb-followup" data-id="${item.id}">
<i class="ph ph-wrench"></i> Tindak Lanjut
</button>
<button type="button" class="btn btn-xs btn-outline-danger btn-fb-delete" data-id="${item.id}" title="Hapus Laporan">
<i class="ph ph-trash"></i> Hapus
</button>
</div>
</div>
`).join('') : `<div class="bulletin-empty"><i class="ph ph-tray"></i><p class="bulletin-empty-text">Tidak ada masukan yang sesuai filter.</p></div>`}
</div>
</div>
` : ''}
${activeTab === 'form' ? `
<div class="card section-block feedback-form-card">
<div class="card-header"><h3 class="card-title"><i class="ph ph-pencil-simple-line"></i> Formulir Laporan Kendala</h3></div>
<div class="card-body">
<form id="form-submit-feedback">
<div class="form-row feedback-grid-2">
<div class="form-group"><label>Jenis Laporan <span class="text-danger">*</span></label><select id="fb-inp-category" class="form-control" required><option value="Kendala Teknis / Bug">Kendala Teknis / Bug</option><option value="Usulan Alur Kerja / Fitur Baru">Usulan Fitur Baru</option><option value="Masukan Tampilan / Desain UI">Masukan Tampilan UI</option><option value="Pertanyaan / Bantuan Teknis">Bantuan Teknis</option></select></div>
<div class="form-group"><label>Modul Terkait <span class="text-danger">*</span></label><select id="fb-inp-module" class="form-control" required><option value="Presensi &amp; Kehadiran GPS">Presensi &amp; GPS</option><option value="Dasbor Guru &amp; Jadwal Mengajar">Dasbor Guru &amp; Jadwal</option><option value="E-Rapor &amp; Penilaian Akademik">E-Rapor &amp; Nilai</option><option value="Pembelajaran Al-Quran UMMI">Pembelajaran UMMI</option><option value="Ekstrakurikuler &amp; Pembinaan">Ekstrakurikuler</option><option value="SPMB &amp; Calon Siswa Baru">SPMB &amp; Pra SD</option><option value="Slip Gaji &amp; Honorarium">Slip Gaji</option><option value="Portofolio &amp; Kinerja GTK">Portofolio GTK</option><option value="Panduan &amp; Informasi">Panduan Aplikasi</option><option value="Lainnya / Umum">Lainnya / Umum</option></select></div>
</div>
<div class="form-group"><label>Judul Kendala / Usulan <span class="text-danger">*</span></label><input type="text" id="fb-inp-title" class="form-control" required placeholder="Ringkasan kendala atau usulan"></div>
<div class="form-group"><label>Deskripsi Kendala <span class="text-danger">*</span></label><textarea id="fb-inp-desc" class="form-control" rows="3" required placeholder="Jelaskan kendala atau usulan Anda..."></textarea></div>
<div class="form-group">
<label>Bukti Screenshot (Opsional)</label>
<div class="feedback-upload-area" id="fb-drop-zone">
<i class="ph ph-cloud-arrow-up feedback-upload-icon"></i>
<p class="feedback-upload-text">Ketuk untuk unggah screenshot bukti kendala</p>
<input type="file" id="fb-inp-file" accept="image/*" class="feedback-file-input">
<div class="feedback-file-preview hidden" id="fb-preview-box">
<img src="" id="fb-preview-img" alt="Preview Screenshot" class="feedback-preview-thumb">
<div class="feedback-file-info"><strong id="fb-file-name">-</strong><span id="fb-file-size" class="text-muted small">-</span></div>
<button type="button" class="btn btn-xs btn-outline-danger" id="btn-remove-ss"><i class="ph ph-trash"></i></button>
</div>
</div>
</div>
<div class="feedback-submit-row">
<button type="submit" class="btn btn-primary btn-block-mobile" id="btn-submit-fb"><i class="ph ph-paper-plane-tilt"></i> Kirim Laporan</button>
</div>
</form>
</div>
</div>
` : ''}
${activeTab === 'my' ? `
<div class="card section-block">
<div class="card-header"><h3 class="card-title"><i class="ph ph-clock-counter-clockwise"></i> Riwayat Laporan Saya</h3></div>
<div class="card-body">
${myIssues.length ? `
<div class="feedback-card-list">
${myIssues.map(item => `
<div class="feedback-item-card">
<div class="feedback-item-head">
<div class="feedback-item-meta">
${getCategoryBadge(item.category)}
<span class="feedback-date"><i class="ph ph-calendar"></i> ${formatDateTime(item.createdAt)}</span>
<span class="badge badge-outline"><i class="ph ph-folder"></i> ${AppConfig.escapeHtml(item.page || '-')}</span>
</div>
<div>${getStatusBadge(item.status)}</div>
</div>
<h4 class="feedback-item-title">${AppConfig.escapeHtml(item.title || '-')}</h4>
<p class="feedback-item-desc">${AppConfig.escapeHtml(item.description || '-')}</p>
${item.screenshotUrl ? `<div class="feedback-item-ss"><button type="button" class="btn btn-xs btn-outline btn-fb-view-ss" data-url="${AppConfig.escapeHtml(item.screenshotUrl)}" data-title="${AppConfig.escapeHtml(item.title || '')}"><i class="ph ph-image"></i> Lihat Screenshot Bukti</button></div>` : ''}
${renderAdminReplyCard(item, false) || '<div class="feedback-admin-pending text-muted small"><i class="ph ph-hourglass-simple"></i> Menunggu tinjauan administrator.</div>'}
</div>
`).join('')}
</div>
` : `<div class="bulletin-empty"><i class="ph ph-tray"></i><p class="bulletin-empty-text">Anda belum pernah mengirimkan laporan kendala atau usulan fitur.</p></div>`}
</div>
</div>
` : ''}
</div>
`;
container.querySelectorAll('.btn-fb-tab').forEach(b => {
b.onclick = () => {
activeTab = b.dataset.tab;
renderPage(container);
};
});
if (isAdmin && activeTab === 'inbox') {
const sInp = container.querySelector('#admin-fb-search');
if (sInp) {
sInp.oninput = (e) => {
adminSearchQuery = e.target.value;
renderPage(container);
};
}
const stFilter = container.querySelector('#admin-fb-filter-status');
if (stFilter) {
stFilter.onchange = (e) => {
adminFilterStatus = e.target.value;
renderPage(container);
};
}
const catFilter = container.querySelector('#admin-fb-filter-cat');
if (catFilter) {
catFilter.onchange = (e) => {
adminFilterCat = e.target.value;
renderPage(container);
};
}
container.querySelectorAll('.btn-fb-followup').forEach(b => {
b.onclick = () => {
const id = b.dataset.id;
const item = allIssues.find(i => i.id === id);
if (item) showFollowupModal(item, () => renderPage(container));
};
});
container.querySelectorAll('.btn-fb-delete').forEach(b => {
b.onclick = async () => {
const id = b.dataset.id;
if (!id || !confirm('Hapus laporan masukan ini secara permanen?')) return;
try {
await db.ref(`system_feedback/${id}`).remove();
renderPage(container);
} catch (err) {
alert('Gagal menghapus: ' + (err.message || err));
}
};
});
}
container.querySelectorAll('.btn-fb-view-ss').forEach(b => {
b.onclick = () => {
showImageViewer(b.dataset.url, b.dataset.title);
};
});
if (activeTab === 'form') {
const fileInp = container.querySelector('#fb-inp-file');
const previewBox = container.querySelector('#fb-preview-box');
const previewImg = container.querySelector('#fb-preview-img');
const fileNameEl = container.querySelector('#fb-file-name');
const fileSizeEl = container.querySelector('#fb-file-size');
const btnRemoveSs = container.querySelector('#btn-remove-ss');
if (fileInp) {
fileInp.onchange = (e) => {
const file = e.target.files && e.target.files[0];
if (!file) return;
selectedScreenshotFile = file;
fileNameEl.textContent = file.name;
fileSizeEl.textContent = (file.size / 1024).toFixed(1) + ' KB';
const reader = new FileReader();
reader.onload = (re) => {
previewImg.src = re.target.result;
previewBox.classList.remove('hidden');
};
reader.readAsDataURL(file);
};
}
if (btnRemoveSs) {
btnRemoveSs.onclick = () => {
selectedScreenshotFile = null;
if (fileInp) fileInp.value = '';
if (previewBox) previewBox.classList.add('hidden');
};
}
const form = container.querySelector('#form-submit-feedback');
if (form) {
form.onsubmit = async (e) => {
e.preventDefault();
const submitBtn = container.querySelector('#btn-submit-fb');
submitBtn.disabled = true;
submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan laporan...';
let screenshotUrl = '';
let screenshotName = '';
if (selectedScreenshotFile) {
try {
submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Mengunggah screenshot...';
if (typeof DriveBridge !== 'undefined' && DriveBridge.uploadFile) {
const up = await DriveBridge.uploadFile(selectedScreenshotFile, { folderKey: 'tech_issues' });
screenshotUrl = up.fileUrl;
screenshotName = up.fileName;
}
} catch (uploadErr) {
}
}
const cat = container.querySelector('#fb-inp-category').value;
const mod = container.querySelector('#fb-inp-module').value;
const title = container.querySelector('#fb-inp-title').value.trim();
const desc = container.querySelector('#fb-inp-desc').value.trim();
const uName = AppConfig.formatUserName(user) || user.name || user.displayName || 'Pengguna Musada';
const uEmail = user.email || (Auth.currentUser && Auth.currentUser.email) || '-';
const payload = {
category: cat,
page: mod,
title,
description: desc,
screenshotUrl,
screenshotName,
device: navigator.userAgent || '',
screen: `${window.innerWidth}x${window.innerHeight}`,
userId: uid,
userName: uName,
userEmail: uEmail,
userRole: role,
status: 'Baru',
createdAt: Date.now()
};
try {
await db.ref('system_feedback').push(payload);
selectedScreenshotFile = null;
alert('Terima kasih! Masukan dan laporan kendala Anda berhasil dikirimkan ke administrator sistem.');
activeTab = 'my';
renderPage(container);
} catch (saveErr) {
submitBtn.disabled = false;
submitBtn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Kirim Masukan ke Administrator';
alert('Gagal mengirimkan laporan: ' + (saveErr.message || saveErr));
}
};
}
}
}
return Object.freeze({
renderPage,
fetchAllIssues
});
})();