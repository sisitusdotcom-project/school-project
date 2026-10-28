if (window.history.replaceState) { window.history.replaceState(null, '', window.location.protocol + "//" + window.location.host + window.location.pathname); }
function formatLongText(text, maxLen = 20, maxWidth = '100%') {
if (!text) return '-'; const str = String(text); if (str.length > maxLen) {
const duration = Math.max(6, str.length * 0.25); return `<div class="seamless-marquee-container" style="width: ${maxWidth};">
<div class="seamless-marquee-content" style="animation-duration: ${duration}s;">
<span>${str}</span><span>${str}</span>
</div>
</div>`}
return str
}
let currentSession = null; let currentAdminId = null; let currentMember = null; let currentBook = null; let currentTransaction = null; let allTransactions = []; let allMembers = []; let allBooks = []; let scanner = null; let scannerActive = !0; let isLoading = !1; let selectivePrintMode = null; let selectedForPrint = { members: [], books: [] }; function handleLogin(event) { event.preventDefault(); const username = document.getElementById('username').value; const password = document.getElementById('password').value; apiCall('login', { username, password }).then(data => { currentSession = data.sessionToken; currentAdminId = data.adminId; localStorage.setItem('sessionToken', data.sessionToken); localStorage.setItem('adminId', data.adminId); localStorage.setItem('adminNama', data.namaLengkap); showDashboard() }).catch(err => { document.getElementById('loginError').textContent = err; document.getElementById('loginError').style.display = 'block' }) }
function updateGreeting() {
const greetingEl = document.getElementById('dynamicGreeting'); if (!greetingEl) return; const hour = new Date().getHours(); let greeting = "Selamat malam,"; if (hour >= 4 && hour < 10) { greeting = "Selamat pagi," } else if (hour >= 10 && hour < 15) { greeting = "Selamat siang," } else if (hour >= 15 && hour < 18) { greeting = "Selamat sore," }
greetingEl.textContent = greeting
}
function startClock() {
const clockEl = document.getElementById('liveClock'); if (!clockEl) return; const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']; function tick() {
const now = new Date(); const dayName = days[now.getDay()]; const date = now.getDate().toString().padStart(2, '0'); const monthName = months[now.getMonth()]; const year = now.getFullYear(); const h = now.getHours().toString().padStart(2, '0'); const m = now.getMinutes().toString().padStart(2, '0'); const s = now.getSeconds().toString().padStart(2, '0'); const headerDateText = document.getElementById('headerDateText'); const headerDayText = document.getElementById('headerDayText'); const headerDigitalText = document.getElementById('headerDigitalText'); const headerHourHand = document.getElementById('headerHourHand'); const headerMinHand = document.getElementById('headerMinHand'); const headerSecHand = document.getElementById('headerSecHand'); if (headerDayText) { headerDayText.textContent = `${dayName},` }
if (headerDateText) { headerDateText.textContent = `${date} ${monthName} ${year}` }
if (headerDigitalText) { headerDigitalText.innerHTML = `<i class="far fa-clock"></i> ${dayName}, ${date} ${monthName} ${year} • ${h}:${m}:${s}` }
if (headerHourHand && headerMinHand && headerSecHand) { const seconds = now.getSeconds(); const secondsDegrees = ((seconds / 60) * 360); headerSecHand.style.transform = `rotate(${secondsDegrees}deg)`; const mins = now.getMinutes(); const minsDegrees = ((mins / 60) * 360) + ((seconds / 60) * 6); headerMinHand.style.transform = `rotate(${minsDegrees}deg)`; const hours = now.getHours(); const hoursDegrees = ((hours / 12) * 360) + ((mins / 60) * 30); headerHourHand.style.transform = `rotate(${hoursDegrees}deg)` }
}
setInterval(tick, 1000); tick()
}
function startLoginClock() {
const hourHand = document.getElementById('loginHourHand'); const minHand = document.getElementById('loginMinHand'); const secHand = document.getElementById('loginSecHand'); const dateText = document.getElementById('loginDateText'); if (!hourHand || !minHand || !secHand || !dateText) return; const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']; function updateClock() { const now = new Date(); const seconds = now.getSeconds(); const secondsDegrees = ((seconds / 60) * 360); secHand.style.transform = `rotate(${secondsDegrees}deg)`; const mins = now.getMinutes(); const minsDegrees = ((mins / 60) * 360) + ((seconds / 60) * 6); minHand.style.transform = `rotate(${minsDegrees}deg)`; const hours = now.getHours(); const hoursDegrees = ((hours / 12) * 360) + ((mins / 60) * 30); hourHand.style.transform = `rotate(${hoursDegrees}deg)`; const dayName = days[now.getDay()]; const date = now.getDate(); const monthName = months[now.getMonth()]; const year = now.getFullYear(); dateText.textContent = `${dayName}, ${date} ${monthName} ${year}` }
setInterval(updateClock, 1000); updateClock()
}
function togglePassword() { const passwordInput = document.getElementById('password'); const eyeIcon = document.getElementById('eyeIcon'); if (passwordInput.type === 'password') { passwordInput.type = 'text'; eyeIcon.classList.remove('fa-eye'); eyeIcon.classList.add('fa-eye-slash') } else { passwordInput.type = 'password'; eyeIcon.classList.remove('fa-eye-slash'); eyeIcon.classList.add('fa-eye') } }
function showDashboard() { document.getElementById('loginScreen').style.display = 'none'; document.getElementById('dashboardScreen').classList.remove('dashboard-hidden'); updateGreeting(); currentSession = localStorage.getItem('sessionToken'); currentAdminId = localStorage.getItem('adminId') || 'admin'; const namaLengkap = localStorage.getItem('adminNama'); document.getElementById('adminNameHeader').textContent = namaLengkap || 'Admin'; initializeScanner(); loadAllData(); loadAdminProfile() }
function handleLogout() { showConfirm('Anda yakin ingin logout?', () => { localStorage.removeItem('sessionToken'); localStorage.removeItem('adminId'); localStorage.removeItem('adminNama'); location.reload() }) }
function loadAdminProfile() {
const targetId = currentAdminId || localStorage.getItem('adminId') || 'admin';
apiCall('getAdmin', { adminId: targetId }).then(data => {
if (!data) return;
const uEl = document.getElementById('adminUsername'); if (uEl) uEl.textContent = data.username || targetId;
const nEl = document.getElementById('adminNama'); if (nEl) nEl.textContent = data.namaLengkap || 'Admin';
const eEl = document.getElementById('adminEmail'); if (eEl) eEl.textContent = data.email || '-';
const inpN = document.getElementById('updateNamaLengkap'); if (inpN) inpN.value = data.namaLengkap || '';
const inpE = document.getElementById('updateEmail'); if (inpE) inpE.value = data.email || '';
const photoPreview = document.getElementById('adminPhotoPreview');
const headerPhoto = document.getElementById('headerAdminPhoto');
const placeholder = document.getElementById('adminPhotoPlaceholder');
const fid = extractFileId(data.fotoUrl);
const urls = [data.fotoUrl, fid ? `https://drive.google.com/thumbnail?id=${fid}&sz=w200` : '', fid ? `https://drive.google.com/uc?export=view&id=${fid}` : ''].filter(url => url && url.trim() !== '');
let urlIndex = 0;
function tryLoadProfilePhoto() {
if (urlIndex >= urls.length) {
if (photoPreview) { photoPreview.src = 'assets/img/logo.webp'; photoPreview.style.display = 'block'; }
if (placeholder) placeholder.style.display = 'none';
if (headerPhoto) { headerPhoto.src = 'assets/img/logo.webp'; headerPhoto.style.display = 'block'; }
return;
}
const currentUrl = urls[urlIndex];
const img = new Image();
img.onload = function () {
if (photoPreview) { photoPreview.src = currentUrl; photoPreview.style.display = 'block'; }
if (placeholder) placeholder.style.display = 'none';
if (headerPhoto) { headerPhoto.src = currentUrl; headerPhoto.style.display = 'block'; }
};
img.onerror = function () {
urlIndex++;
tryLoadProfilePhoto();
};
img.src = currentUrl;
}
if (urls.length > 0) {
tryLoadProfilePhoto();
} else {
if (photoPreview) { photoPreview.src = 'assets/img/logo.webp'; photoPreview.style.display = 'block'; }
if (placeholder) placeholder.style.display = 'none';
if (headerPhoto) { headerPhoto.src = 'assets/img/logo.webp'; headerPhoto.style.display = 'block'; }
}
}).catch(err => console.log('Error loading admin profile:', err))
}
function extractFileId(url) {
if (!url) return ''; if (url.includes('id=')) { return url.split('id=')[1] }
if (url.includes('/d/')) { return url.split('/d/')[1].split('/')[0] }
return ''
}
function handleChangePassword(event) {
event.preventDefault(); const oldPassword = document.getElementById('oldPassword').value; const newPassword = document.getElementById('newPassword').value; const confirmPassword = document.getElementById('confirmPassword').value; if (newPassword !== confirmPassword) { showAlert('Password baru tidak cocok', 'error'); return }
if (newPassword.length < 6) { showAlert('Password minimal 6 karakter', 'warning'); return }
showLoading('Mengubah password...'); apiCall('updateAdminPassword', { adminId: currentAdminId, oldPassword, newPassword }).then(data => { hideLoading(); showAlert('Password berhasil diubah', 'success'); document.getElementById('changePasswordForm').reset() }).catch(err => { hideLoading(); showAlert(`Gagal: ${err}`, 'error') })
}
function handleUpdateProfile(event) { event.preventDefault(); const namaLengkap = document.getElementById('updateNamaLengkap').value; const email = document.getElementById('updateEmail').value; const id = currentAdminId || localStorage.getItem('adminId') || 'admin'; showLoading('Menyimpan perubahan...'); apiCall('updateAdminProfile', { adminId: id, namaLengkap, email }).then(data => { hideLoading(); showAlert('Profil berhasil diperbarui', 'success'); localStorage.setItem('adminNama', namaLengkap); const nameHeader = document.getElementById('adminNameHeader'); if (nameHeader) nameHeader.textContent = namaLengkap; const aNama = document.getElementById('adminNama'); if (aNama) aNama.textContent = namaLengkap; const aEmail = document.getElementById('adminEmail'); if (aEmail) aEmail.textContent = email }).catch(err => { hideLoading(); showAlert(`Gagal: ${err}`, 'error') }) }
function handlePhotoUpload(event) {
const file = event.target.files[0]; if (!file) return; if (!file.type.startsWith('image/')) { showAlert('File harus berupa gambar', 'error'); return }
if (file.size > 5 * 1024 * 1024) { showAlert('Ukuran file terlalu besar (max 5MB)', 'error'); return }
showLoading('Memproses foto...'); uploadAdminPhotoToRTDB(file)
}
function uploadAdminPhotoToRTDB(file) {
const reader = new FileReader(); reader.onload = function (e) {
const img = new Image(); img.onload = function () {
const canvas = document.createElement('canvas'); const maxDim = 300; let w = img.width; let h = img.height;
if (w > h) { if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim } } else { if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim } }
canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
const id = currentAdminId || localStorage.getItem('adminId') || 'admin';
apiCall('uploadAdminPhoto', { adminId: id, dataUrl: dataUrl }).then(data => {
hideLoading(); showAlert('Foto profil berhasil disimpan di RTDB', 'success');
const photoPreview = document.getElementById('adminPhotoPreview'); if (photoPreview) { photoPreview.src = dataUrl; photoPreview.style.display = 'block'; }
const placeholder = document.getElementById('adminPhotoPlaceholder'); if (placeholder) placeholder.style.display = 'none';
const headerPhoto = document.getElementById('headerAdminPhoto'); if (headerPhoto) { headerPhoto.src = dataUrl; headerPhoto.style.display = 'block'; }
document.getElementById('photoUpload').value = ''
}).catch(err => { hideLoading(); showAlert(`Gagal menyimpan foto: ${err}`, 'error') })
}; img.src = e.target.result
}; reader.readAsDataURL(file)
}
window.addEventListener('DOMContentLoaded', function () { startClock(); startLoginClock(); const session = localStorage.getItem('sessionToken'); if (session) { showDashboard() } }); function showLoading(message = 'Memproses...') { isLoading = !0; Swal.fire({ title: message, didOpen: (modal) => { Swal.showLoading() }, allowOutsideClick: !1, allowEscapeKey: !1 }) }
function hideLoading() { isLoading = !1; Swal.close() }
function showAlert(message, type = 'info', autoClose = !0, timer = 2000) {
const bgColors = { 'success': '#10B981', 'error': '#EF4444', 'warning': '#F59E0B', 'info': '#3B82F6' }; const config = { title: type === 'success' ? 'Berhasil' : type === 'error' ? 'Error' : type === 'warning' ? 'Perhatian' : 'Info', text: message, icon: type, toast: !0, position: 'top-end', showConfirmButton: !1, timerProgressBar: autoClose, background: bgColors[type] || bgColors.info, color: '#ffffff', iconColor: '#ffffff', didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer) } }; if (autoClose) { config.timer = timer } else { config.showConfirmButton = !0 }
Swal.fire(config)
}
function showConfirm(message, onConfirm, onCancel = null) { Swal.fire({ title: 'Konfirmasi', text: message, icon: 'question', showCancelButton: !0, confirmButtonText: 'Ya, Lanjutkan', cancelButtonText: 'Batal', confirmButtonColor: '#667eea', cancelButtonColor: '#6b7280' }).then((result) => { if (result.isConfirmed) { if (onConfirm) onConfirm(); } else if (result.isDismissed && onCancel) { onCancel() } }) }
function initializeScanner() { if (scanner) return; try { scanner = new Html5Qrcode("reader"); scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, qrCodeMessage => { if (scannerActive) { processQRCode(qrCodeMessage.trim()) } }, errorMessage => { }) } catch (err) { console.error("Scanner error:", err); showAlert("Gagal menginisialisasi scanner. Periksa browser compatibility.", 'error') } }
const scanSound = new Audio('assets/audio/scanner-correct.mp3'); const scanWrongSound = new Audio('assets/audio/scanner-wrong.mp3'); function bunyikanTeks(teks) {
if (!window.speechSynthesis) return; try { window.speechSynthesis.cancel() } catch (e) { }
const ucapan = new SpeechSynthesisUtterance(); ucapan.text = teks; ucapan.lang = 'id-ID'; ucapan.volume = 1; ucapan.rate = 0.95; ucapan.pitch = 1; const daftarSuara = window.speechSynthesis.getVoices(); const suaraIndo = daftarSuara.find(s => s.lang === 'id-ID'); if (suaraIndo) ucapan.voice = suaraIndo; window.speechSynthesis.speak(ucapan)
}
if (window.speechSynthesis) { window.speechSynthesis.onvoiceschanged = () => { } }
let sedangMemproses = !1; let lastScannedCode = null; let lastScanTimer = null; function processQRCode(kode) {
if (sedangMemproses) return; if (kode === lastScannedCode) return; sedangMemproses = !0; lastScannedCode = kode; if (lastScanTimer) clearTimeout(lastScanTimer); lastScanTimer = setTimeout(() => { lastScannedCode = null }, 4000); const member = allMembers.find(m => m.KODE === kode || m.NIS === kode); const book = allBooks.find(b => b['KODE BUKU'] === kode); if (member || book) { scanSound.pause(); scanSound.currentTime = 0; scanSound.volume = 0.1; scanSound.play().catch(e => console.log('Autoplay audio diblokir browser:', e)) } else { scanWrongSound.pause(); scanWrongSound.currentTime = 0; scanWrongSound.volume = 0.1; scanWrongSound.play().catch(e => console.log('Autoplay audio diblokir browser:', e)) }
if (member) { setTimeout(() => { bunyikanTeks(`Berhasil scan Data Anggota, atas nama ${member['NAMA']}`) }, 300); fetchMemberData(member.KODE); setTimeout(() => { sedangMemproses = !1 }, 800); return }
if (book) { setTimeout(() => { bunyikanTeks(`Berhasil scan Data Buku, dengan judul ${book['JUDUL BUKU']}`) }, 300); fetchBookData(kode); setTimeout(() => { sedangMemproses = !1 }, 800); return }
showAlert(`Kode tidak ditemukan: ${kode}`, 'error'); setTimeout(() => { sedangMemproses = !1 }, 800)
}
async function apiCall(action, params = {}) {
switch (action) {
case 'login': {
return await DBLibrary.adminLogin(params.username, params.password);
}
case 'getAdmin': {
let res = await DBLibrary.getAdmin(params.adminId || currentAdminId || 'admin');
if (!res && (params.adminId !== 'admin' || currentAdminId !== 'admin')) {
res = await DBLibrary.getAdmin('admin');
}
return {
username: (res && res.username) || params.adminId || 'admin',
namaLengkap: (res && res.namaLengkap) || 'Admin',
email: (res && res.email) || '',
fotoUrl: (res && res.fotoUrl) || 'assets/img/logo.webp'
};
}
case 'updateAdminProfile': {
const id = params.adminId || currentAdminId || 'admin';
await DBLibrary.updateAdminProfile(id, params);
return { message: 'Profil berhasil diperbarui' };
}
case 'updateAdminPassword': {
const id = params.adminId || currentAdminId || 'admin';
await DBLibrary.updateAdminPassword(id, params.oldPassword, params.newPassword);
return { message: 'Password berhasil diperbarui' };
}
case 'uploadAdminPhoto': {
const id = params.adminId || currentAdminId || 'admin';
await DBLibrary.updateAdminProfile(id, { fotoUrl: params.dataUrl });
return { message: 'Foto profil berhasil diperbarui', fotoUrl: params.dataUrl };
}
case 'resetData': {
return await DBLibrary.resetData();
}
case 'getStatistik': {
const s = await DBLibrary.getStatistics();
return {
totalBuku: s.totalBuku,
totalStok: s.totalStok,
bukuDipinjam: s.dipinjam,
bukuTersedia: s.stokTersedia,
bukuKembali: s.kembali,
overdueCount: s.overdueCount
};
}
case 'getAllBuku': {
const books = await DBLibrary.getBooks();
return books.map(b => ({
'KODE BUKU': b.code,
'KODE RAK': b.shelfCode || '',
'JUDUL BUKU': b.title || '',
'PENGARANG': b.author || '',
'PENERBIT': b.publisher || '',
'TAHUN': b.year || '',
'STOK TERSEDIA': b.stockAvailable,
'STOK TOTAL': b.stockTotal,
'KATEGORI': b.category || '',
'STATUS CETAK': b.printStatus || ''
}));
}
case 'getBuku': {
const b = await DBLibrary.getBook(params.kode);
if (!b) throw new Error('Buku tidak ditemukan');
return {
kode: b.code,
judul: b.title,
pengarang: b.author,
penerbit: b.publisher,
tahunTerbit: b.year,
stok: b.stockAvailable,
stokTotal: b.stockTotal,
kodeRak: b.shelfCode,
kategori: b.category
};
}
case 'getAllAnggota': {
const members = await DBLibrary.getMembers();
return members.map(m => ({
KODE: m.code,
NIS: m.nis || (m.type === 'Siswa' ? m.code : ''),
NAMA: m.name,
'JENIS KELAMIN': m.gender || '',
TIPE: m.type || 'Siswa',
KETERANGAN: m.note || '',
'STATUS CETAK': m.printStatus || ''
}));
}
case 'getAnggota': {
const m = await DBLibrary.getMember(params.kode);
if (!m) throw new Error('Anggota tidak ditemukan');
return {
kode: m.code,
nama: m.name,
jenisKelamin: m.gender,
tipe: m.type,
keterangan: m.note
};
}
case 'getTransaksi': {
const trx = await DBLibrary.getTransactions();
return trx.map(t => ({
'No Transaksi': t.trxNo,
'Tgl Pinjam': t.borrowDate,
'Kode Anggota': t.memberCode,
'Kode Buku': t.bookCode,
'Lama Pinjam': t.durationDays,
'Jatuh Tempo': t.dueDate,
'Tgl Kembali': t.returnDate || '',
Status: t.status
}));
}
case 'getOverdue': {
const trx = await DBLibrary.getTransactions();
const today = new Date().toISOString().slice(0, 10);
return trx.filter(t => t.status === 'DIPINJAM' && t.dueDate && today > t.dueDate).map(t => ({
'No Transaksi': t.trxNo,
'Tgl Pinjam': t.borrowDate,
'Kode Anggota': t.memberCode,
'Kode Buku': t.bookCode,
'Lama Pinjam': t.durationDays,
'Jatuh Tempo': t.dueDate,
Status: t.status
}));
}
case 'getLoanRequests': {
return await DBLibrary.getLoanRequests();
}
case 'approveLoanRequest': {
const snap = await DBLibrary.db.ref(`library/loan_requests/${params.id}`).once('value');
const req = snap.val();
if (!req) throw new Error('Pengajuan tidak ditemukan');
let memberCodeToUse = req.memberCode;
if (!memberCodeToUse) {
const found = allMembers.find(m => m.NAMA && m.NAMA.toLowerCase().includes((req.studentName || req.borrowerName).toLowerCase()));
memberCodeToUse = found ? found.KODE : (req.studentName || req.borrowerName);
}
const resTrx = await DBLibrary.borrowBook({
memberCode: memberCodeToUse,
bookCode: req.bookCode,
durationDays: 7
});
await DBLibrary.updateLoanRequestStatus(params.id, 'completed');
return resTrx;
}
case 'getKunjungan': {
const visits = await DBLibrary.getVisits(500);
return visits.map(v => ({
'Tgl Kunjungan': `${v.date} ${v.time || ''}`,
'Kode Anggota': v.memberCode,
'Nama': v.memberName,
'Tujuan': v.purpose
}));
}
case 'pinjamBuku': {
const res = await DBLibrary.borrowBook({
memberCode: params.kodeAnggota,
bookCode: params.kodeBuku,
durationDays: parseInt(params.lamaPinjam, 10) || 7
});
return {
message: 'Peminjaman berhasil dicatat',
noTransaksi: res.trxNo,
tanggalPinjam: res.borrowDate,
jatuhTempo: res.dueDate
};
}
case 'kembaliBuku': {
const res = await DBLibrary.returnBook(params.noTransaksi);
return {
message: 'Buku berhasil dikembalikan',
tanggalKembali: res.returnDate
};
}
case 'logKunjungan': {
const res = await DBLibrary.logVisit({ memberCode: params.kodeAnggota });
return {
message: 'Kunjungan berhasil dicatat',
waktu: `${res.date} ${res.time}`
};
}
case 'addBuku': {
let code = (params.kode || '').trim();
if (!code) {
code = await DBLibrary.generateBookCode(params.kategori, params.kodeRak);
}
await DBLibrary.saveBook(code, {
shelfCode: params.kodeRak || '',
title: params.judul || '',
author: params.pengarang || '',
publisher: params.penerbit || '',
year: params.tahunTerbit || '',
stockAvailable: parseInt(params.stok, 10) || 1,
stockTotal: parseInt(params.stok, 10) || 1,
category: params.kategori || 'Umum'
});
return { message: 'Buku berhasil ditambahkan', kode: code };
}
case 'updateBuku': {
await DBLibrary.saveBook(params.kode, {
shelfCode: params.kodeRak || '',
title: params.judul || '',
author: params.pengarang || '',
publisher: params.penerbit || '',
year: params.tahunTerbit || '',
stockAvailable: parseInt(params.stok, 10) || 1,
stockTotal: parseInt(params.stok, 10) || 1,
category: params.kategori || 'Umum'
});
return { message: 'Buku berhasil diperbarui' };
}
case 'addAnggota': {
const tipe = params.tipe || 'Siswa';
let code = (params.kode || '').trim();
if (tipe === 'Siswa') {
if (!code) {
throw new Error('Untuk tipe Siswa, Kode Anggota wajib diisi dengan NIS Siswa (SSOT).');
}
} else if (!code) {
const pfx = (tipe === 'Gukar' || tipe === 'Guru' || tipe === 'Tenaga Kependidikan') ? 'G' : 'U';
code = `${pfx}-${Date.now().toString().slice(-4)}`;
}
const existing = await DBLibrary.getMember(code);
if (existing) {
throw new Error(`Anggota dengan kode ${code} sudah terdaftar atas nama ${existing.name}.`);
}
await DBLibrary.saveMember(code, {
name: params.nama || '',
gender: params.jenisKelamin || '',
type: tipe,
note: params.keterangan || '',
nis: tipe === 'Siswa' ? code : '',
studentId: tipe === 'Siswa' ? `SISWA_${code}` : ''
});
return { message: 'Anggota berhasil ditambahkan', kode: code };
}
case 'updateAnggota': {
const tipe = params.tipe || 'Siswa';
const code = (params.kode || '').trim();
if (!code) throw new Error('Kode Anggota tidak valid.');
await DBLibrary.saveMember(code, {
name: params.nama || '',
gender: params.jenisKelamin || '',
type: tipe,
note: params.keterangan || '',
nis: tipe === 'Siswa' ? code : '',
studentId: tipe === 'Siswa' ? `SISWA_${code}` : ''
});
return { message: 'Anggota berhasil diperbarui' };
}
case 'deleteData': {
const list = JSON.parse(params.kodeList || '[]');
for (const item of list) {
if (params.type === 'anggota') await DBLibrary.deleteMember(item);
else await DBLibrary.deleteBook(item);
}
return { message: `Berhasil menghapus ${list.length} data` };
}
case 'updateStatusCetak': {
return { message: 'Status cetak diperbarui' };
}
default:
throw new Error(`Action ${action} tidak didukung`);
}
}
function fetchMemberData(kode) { apiCall('getAnggota', { kode: kode }).then(data => { currentMember = data; displayMemberInfo(data); showAlert(`Selamat datang, ${data.nama}!`, 'success'); logMemberVisit(kode) }).catch(err => { currentMember = null; displayMemberInfo(null); showAlert(`Anggota tidak ditemukan: ${err}`, 'error') }) }
function displayMemberInfo(member) {
const memberInfo = document.getElementById('memberInfo'); if (!member) {
memberInfo.innerHTML = `
<div class="detail-item">
<span class="detail-label">Status</span>
<span class="detail-value">-</span>
</div>
`; return
}
memberInfo.innerHTML = `
<div class="detail-item">
<span class="detail-label">Kode</span>
<span class="detail-value">${member.kode}</span>
</div>
<div class="detail-item">
<span class="detail-label">Nama</span>
<span class="detail-value">${member.nama}</span>
</div>
<div class="detail-item">
<span class="detail-label">Jenis Kelamin</span>
<span class="detail-value">${member.jenisKelamin || '-'}</span>
</div>
<div class="detail-item">
<span class="detail-label">Tipe</span>
<span class="detail-value">${member.tipe}</span>
</div>
<div class="detail-item">
<span class="detail-label">Keterangan</span>
<span class="detail-value">${member.keterangan || '-'}</span>
</div>
`}
function loadAllMembers() { return apiCall('getAllAnggota', {}).then(data => { allMembers = data; displayAnggotaTable(data) }).catch(err => showAlert(`Gagal load anggota: ${err}`, 'error')) }
function displayAnggotaTable(members) {
const tbody = document.getElementById('anggotaTable'); if (!members || members.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="text-center">Tidak ada data anggota</td></tr>'; return }
const total = members.length; const itemsPerPage = 15; if (typeof window.currentPageAnggota === 'undefined') window.currentPageAnggota = 1; const totalPages = Math.ceil(total / itemsPerPage); if (window.currentPageAnggota > totalPages && totalPages > 0) window.currentPageAnggota = totalPages; if (window.currentPageAnggota < 1) window.currentPageAnggota = 1; const startIndex = (window.currentPageAnggota - 1) * itemsPerPage; const endIndex = startIndex + itemsPerPage; let displayedMembers = members; if (!window.showAllAnggota && total > itemsPerPage) { displayedMembers = members.slice(startIndex, endIndex) }
tbody.innerHTML = displayedMembers.map(m => {
let statusCetak = m['STATUS CETAK'] === 'DICETAK' ? `<span class="badge badge-kembali" style="background-color:#10B981; color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem;"><i class="fas fa-check"></i> Dicetak</span>` : `<button class="btn-sm btn-secondary" data-action="markAsPrinted" data-type="anggota" data-id="${m['KODE']}"><i class="fas fa-print"></i> Tandai</button>`; return `
<tr data-action="toggleRowCheckbox" data-checkbox="member-checkbox" style="cursor: pointer;" class="clickable-row">
<td><input type="checkbox" class="member-checkbox" value="${m['KODE']}" data-action="updateMemberSelection"></td>
<td>${m['KODE'] || '-'}</td>
<td>${formatLongText(m['NAMA'], 40)}</td>
<td>${m['JENIS KELAMIN'] || '-'}</td>
<td>${m['TIPE'] || '-'}</td>
<td>${formatLongText(m['KETERANGAN'], 25)}</td>
<td>${statusCetak}</td>
<td>
<button class="btn-sm btn-secondary" data-action="editAnggota" data-id="${m['KODE']}">
<i class="fas fa-edit"></i>
</button>
</td>
</tr>
`}).join(''); if (total > itemsPerPage) {
if (!window.showAllAnggota) {
const prevDisabled = window.currentPageAnggota === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''; const nextDisabled = window.currentPageAnggota === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''; tbody.innerHTML += `
<tr>
<td colspan="8" style="padding: 12px 15px; background: #f8fafc; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;">
<div style="display: flex; align-items: center; flex-wrap: nowrap;">
<button class="btn-sm btn-secondary" data-action="prevPageAnggota" ${prevDisabled} style="margin:0;">
<i class="fas fa-chevron-left"></i> Prev
</button>
<span style="margin: 0 15px; font-weight: 500; color: #475569; font-size: 0.9rem; white-space: nowrap;">Hal ${window.currentPageAnggota} dari ${totalPages}</span>
<button class="btn-sm btn-secondary" data-action="nextPageAnggota" ${nextDisabled} style="margin:0;">
Next <i class="fas fa-chevron-right"></i>
</button>
</div>
<button class="btn-sm btn-primary" data-action="showAllAnggota" style="margin:0;">
<i class="fas fa-list"></i> Tampilkan Semua
</button>
</div>
</td>
</tr>
`} else {
tbody.innerHTML += `
<tr>
<td colspan="8" class="text-center" style="padding: 15px; background: #f8fafc;">
<span style="color: #64748b; font-size: 0.9rem; margin-right: 15px;">Menampilkan semua ${total} anggota.</span>
<button class="btn-sm btn-secondary" data-action="hideAllAnggota">
<i class="fas fa-compress-arrows-alt"></i> Tampilkan Halaman
</button>
</td>
</tr>
`}
}
}
function toggleRowCheckbox(event, rowElement, checkboxClass) {
const tagName = event.target.tagName.toLowerCase(); if (tagName === 'button' || tagName === 'input' || tagName === 'a' || event.target.closest('button')) { return }
const checkbox = rowElement.querySelector('.' + checkboxClass); if (checkbox) { checkbox.checked = !checkbox.checked; if (checkboxClass === 'member-checkbox') updateMemberSelection(); else if (checkboxClass === 'book-checkbox') updateBookSelection(); }
}
function deleteAnggota(kode) { showConfirm(`Yakin ingin menghapus anggota ${kode}? Data transaksi dan kunjungan tidak akan terhapus namun referensinya mungkin menjadi tidak valid.`, () => { apiCall('deleteData', { type: 'anggota', kodeList: JSON.stringify([kode]) }).then(res => { showAlert(res.message, 'success'); loadAllMembers() }).catch(err => showAlert(`Gagal menghapus: ${err}`, 'error')) }) }
function bulkDeleteMembers() {
const checkboxes = document.querySelectorAll('.member-checkbox:checked'); const kodeList = Array.from(checkboxes).map(cb => cb.value); if (kodeList.length === 0) { showAlert('Pilih minimal 1 anggota untuk dihapus', 'warning'); return }
showConfirm(`Yakin ingin menghapus ${kodeList.length} anggota terpilih?`, () => { apiCall('deleteData', { type: 'anggota', kodeList: JSON.stringify(kodeList) }).then(res => { showAlert(res.message, 'success'); loadAllMembers(); selectedForPrint.members = []; document.getElementById('selectAllMembers').checked = !1 }).catch(err => showAlert(`Gagal menghapus: ${err}`, 'error')) })
}
function filterAnggotaTable(resetPage = !1) { if (resetPage) window.currentPageAnggota = 1; const searchEl = document.getElementById('searchAnggotaInput'); const searchText = searchEl ? searchEl.value.toLowerCase().trim() : ''; const filtered = allMembers.filter(m => { return (m.KODE && m.KODE.toLowerCase().includes(searchText)) || (m.NIS && m.NIS.toLowerCase().includes(searchText)) || (m.NAMA && m.NAMA.toLowerCase().includes(searchText)) || (m.TIPE && m.TIPE.toLowerCase().includes(searchText)) || (m.KETERANGAN && m.KETERANGAN.toLowerCase().includes(searchText)) }); displayAnggotaTable(filtered) }
function updateFormKodeAnggotaUI() { const tipe = document.getElementById('formTipeAnggota').value; const lbl = document.getElementById('formKodeAnggotaLabel'); const inp = document.getElementById('formKodeAnggota'); if (!lbl || !inp) return; if (tipe === 'Siswa') { lbl.textContent = 'NIS Siswa (SSOT)'; inp.placeholder = 'Masukkan NIS Siswa (contoh: 0581)'; inp.required = !0 } else if (tipe === 'Gukar') { lbl.textContent = 'NBM / Kode GTK'; inp.placeholder = 'NBM GTK (atau kosongkan untuk auto-generate)'; inp.required = !1 } else { lbl.textContent = 'Kode Anggota'; inp.placeholder = 'Kode Anggota (atau kosongkan untuk auto-generate)'; inp.required = !1 } }
async function lookupStudentByNis(nis) { const clean = String(nis || '').trim(); if (!clean || clean.length < 3) return; try { let s = allMembers.find(m => m.KODE === clean || m.NIS === clean); if (!s) { const m = await DBLibrary.getMember(clean); if (m && m.type === 'Siswa') s = { name: m.name, gender: m.gender, note: m.note } } if (!s && DBLibrary.db) { try { const snap = await DBLibrary.db.ref(`students/SISWA_${clean}`).once('value'); const val = snap.val(); if (val) s = { name: val.name, gender: val.gender === 'L' ? 'Laki-Laki' : 'Perempuan', note: (val.classId || '').replace('CLASS_', 'Kelas ').replace(/_/g, ' ') } } catch (e) { } } if (s) { const nameInput = document.getElementById('formNamaAnggota'); const jkInput = document.getElementById('formJenisKelamin'); const ketInput = document.getElementById('formKeteranganAnggota'); if (nameInput) nameInput.value = s.name || s.NAMA || ''; if (jkInput) jkInput.value = s.gender || s['JENIS KELAMIN'] || ''; if (ketInput) ketInput.value = s.note || s.KETERANGAN || 'Siswa Aktif'; showAlert(`Data siswa ditemukan: ${s.name || s.NAMA}`, 'success') } } catch (e) { } }
function openAddAnggotaModal() { document.getElementById('formTipeAnggota').value = 'Siswa'; document.getElementById('formKodeAnggota').value = ''; document.getElementById('formKodeAnggota').removeAttribute('readonly'); document.getElementById('formNamaAnggota').value = ''; document.getElementById('formJenisKelamin').value = ''; document.getElementById('formKeteranganAnggota').value = ''; document.getElementById('btnHapusAnggotaModal').style.display = 'none'; updateFormKodeAnggotaUI(); openModal('anggotaModal') }
function editAnggota(kode) { const member = allMembers.find(m => m.KODE == kode); if (member) { document.getElementById('formTipeAnggota').value = member.TIPE || 'Siswa'; document.getElementById('formKodeAnggota').value = member.KODE || ''; document.getElementById('formKodeAnggota').setAttribute('readonly', 'readonly'); document.getElementById('formNamaAnggota').value = member.NAMA || ''; document.getElementById('formJenisKelamin').value = member['JENIS KELAMIN'] || ''; document.getElementById('formKeteranganAnggota').value = member.KETERANGAN || ''; updateFormKodeAnggotaUI(); const btnHapus = document.getElementById('btnHapusAnggotaModal'); btnHapus.style.display = 'inline-block'; btnHapus.onclick = function () { closeModal('anggotaModal'); deleteAnggota(kode) }; openModal('anggotaModal') } }
function saveAnggota(event) { event.preventDefault(); const tipe = document.getElementById('formTipeAnggota').value.trim(); const kode = document.getElementById('formKodeAnggota').value.trim(); if (tipe === 'Siswa' && !kode) { showAlert('Untuk tipe Siswa, Kode Anggota wajib diisi dengan NIS Siswa (SSOT).', 'warning'); return } const isNew = !allMembers.find(m => String(m.KODE || '').trim() == kode); const action = isNew ? 'addAnggota' : 'updateAnggota'; const message = isNew ? 'Menambah anggota...' : 'Mengupdate anggota...'; showLoading(message); apiCall(action, { kode: kode, nama: document.getElementById('formNamaAnggota').value.trim(), jenisKelamin: document.getElementById('formJenisKelamin').value.trim(), tipe: tipe, keterangan: document.getElementById('formKeteranganAnggota').value.trim() }).then(data => { hideLoading(); showAlert(data.message, 'success'); closeModal('anggotaModal'); loadAllMembers() }).catch(err => { hideLoading(); showAlert(`Error: ${err}`, 'error') }) }
function fetchBookData(kode) { apiCall('getBuku', { kode: kode }).then(data => { currentBook = data; displayBookInfo(data); showAlert(`${data.judul} ditemukan`, 'success') }).catch(err => { currentBook = null; displayBookInfo(null); showAlert(`Buku tidak ditemukan: ${err}`, 'error') }) }
function displayBookInfo(book) {
const bookInfo = document.getElementById('bookInfo'); if (!book) {
bookInfo.innerHTML = `
<div class="detail-item">
<span class="detail-label">Status</span>
<span class="detail-value">-</span>
</div>
`; return
}
bookInfo.innerHTML = `
<div class="detail-item">
<span class="detail-label">Kode Buku</span>
<span class="detail-value">${book.kode}</span>
</div>
<div class="detail-item">
<span class="detail-label">Judul Buku</span>
<span class="detail-value">${book.judul}</span>
</div>
<div class="detail-item">
<span class="detail-label">Pengarang</span>
<span class="detail-value">${book.pengarang || '-'}</span>
</div>
<div class="detail-item">
<span class="detail-label">Stok Tersedia</span>
<span class="detail-value ${book.stok > 0 ? 'stok-available' : 'stok-unavailable'}">${book.stok}</span>
</div>
`}
function loadAllBooks() { return apiCall('getAllBuku', {}).then(data => { allBooks = data; displayBukuTable(data) }).catch(err => showAlert(`Gagal load buku: ${err}`, 'error')) }
function displayBukuTable(books) {
const tbody = document.getElementById('bukuTable'); if (!books || books.length === 0) { tbody.innerHTML = '<tr><td colspan="9" class="text-center">Tidak ada data buku</td></tr>'; return }
const total = books.length; const itemsPerPage = 15; if (typeof window.currentPageBooks === 'undefined') window.currentPageBooks = 1; const totalPages = Math.ceil(total / itemsPerPage); if (window.currentPageBooks > totalPages && totalPages > 0) window.currentPageBooks = totalPages; if (window.currentPageBooks < 1) window.currentPageBooks = 1; const startIndex = (window.currentPageBooks - 1) * itemsPerPage; const endIndex = startIndex + itemsPerPage; let displayedBooks = books; if (!window.showAllBooks && total > itemsPerPage) { displayedBooks = books.slice(startIndex, endIndex) }
tbody.innerHTML = displayedBooks.map(b => {
let statusCetak = b['STATUS CETAK'] === 'DICETAK' ? `<span class="badge badge-kembali" style="background-color:#10B981; color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem;"><i class="fas fa-check"></i> Dicetak</span>` : `<button class="btn-sm btn-secondary" data-action="markAsPrinted" data-type="buku" data-id="${b['KODE BUKU']}"><i class="fas fa-print"></i> Tandai</button>`; return `
<tr data-action="toggleRowCheckbox" data-checkbox="book-checkbox" style="cursor: pointer;" class="clickable-row">
<td><input type="checkbox" class="book-checkbox" value="${b['KODE BUKU']}" data-action="updateBookSelection"></td>
<td>${b['KODE BUKU'] || '-'}</td>
<td>${formatLongText(b['JUDUL BUKU'], 40)}</td>
<td>${formatLongText(b['PENGARANG'], 25)}</td>
<td>${formatLongText(b['KATEGORI'], 20)}</td>
<td>
<span class="${b['STOK TERSEDIA'] > 0 ? 'stok-available' : 'stok-unavailable'}">
${b['STOK TERSEDIA'] || 0}
</span>
</td>
<td>${b['KODE RAK'] || '-'}</td>
<td>${statusCetak}</td>
<td>
<button class="btn-sm btn-secondary" data-action="editBuku" data-id="${b['KODE BUKU']}">
<i class="fas fa-edit"></i>
</button>
</td>
</tr>
`}).join(''); if (total > itemsPerPage) {
if (!window.showAllBooks) {
const prevDisabled = window.currentPageBooks === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''; const nextDisabled = window.currentPageBooks === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''; tbody.innerHTML += `
<tr>
<td colspan="9" style="padding: 12px 15px; background: #f8fafc; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;">
<div style="display: flex; align-items: center; flex-wrap: nowrap;">
<button class="btn-sm btn-secondary" data-action="prevPageBooks" ${prevDisabled} style="margin:0;">
<i class="fas fa-chevron-left"></i> Prev
</button>
<span style="margin: 0 15px; font-weight: 500; color: #475569; font-size: 0.9rem; white-space: nowrap;">Hal ${window.currentPageBooks} dari ${totalPages}</span>
<button class="btn-sm btn-secondary" data-action="nextPageBooks" ${nextDisabled} style="margin:0;">
Next <i class="fas fa-chevron-right"></i>
</button>
</div>
<button class="btn-sm btn-primary" data-action="showAllBooks" style="margin:0;">
<i class="fas fa-list"></i> Tampilkan Semua
</button>
</div>
</td>
</tr>
`} else {
tbody.innerHTML += `
<tr>
<td colspan="9" class="text-center" style="padding: 15px; background: #f8fafc;">
<span style="color: #64748b; font-size: 0.9rem; margin-right: 15px;">Menampilkan semua ${total} buku.</span>
<button class="btn-sm btn-secondary" data-action="hideAllBooks">
<i class="fas fa-compress-arrows-alt"></i> Tampilkan Halaman
</button>
</td>
</tr>
`}
}
}
function deleteBuku(kode) { showConfirm(`Yakin ingin menghapus buku ${kode}? Data transaksi tidak akan terhapus namun referensinya mungkin menjadi tidak valid.`, () => { apiCall('deleteData', { type: 'buku', kodeList: JSON.stringify([kode]) }).then(res => { showAlert(res.message, 'success'); loadAllBooks() }).catch(err => showAlert(`Gagal menghapus: ${err}`, 'error')) }) }
function bulkDeleteBooks() {
const checkboxes = document.querySelectorAll('.book-checkbox:checked'); const kodeList = Array.from(checkboxes).map(cb => cb.value); if (kodeList.length === 0) { showAlert('Pilih minimal 1 buku untuk dihapus', 'warning'); return }
showConfirm(`Yakin ingin menghapus ${kodeList.length} buku terpilih?`, () => { apiCall('deleteData', { type: 'buku', kodeList: JSON.stringify(kodeList) }).then(res => { showAlert(res.message, 'success'); loadAllBooks(); selectedForPrint.books = []; document.getElementById('selectAllBooks').checked = !1 }).catch(err => showAlert(`Gagal menghapus: ${err}`, 'error')) })
}
function filterBukuTable(resetPage = !1) { if (resetPage) window.currentPageBooks = 1; const searchEl = document.getElementById('searchBukuInput'); const searchText = searchEl ? searchEl.value.toLowerCase().trim() : ''; const filtered = allBooks.filter(b => { return (b['KODE BUKU'] && b['KODE BUKU'].toLowerCase().includes(searchText)) || (b['JUDUL BUKU'] && b['JUDUL BUKU'].toLowerCase().includes(searchText)) || (b.PENGARANG && b.PENGARANG.toLowerCase().includes(searchText)) || (b.KATEGORI && b.KATEGORI.toLowerCase().includes(searchText)) || (b['KODE RAK'] && b['KODE RAK'].toLowerCase().includes(searchText)) || (b.PENERBIT && b.PENERBIT.toLowerCase().includes(searchText)) }); displayBukuTable(filtered) }
function updateFormKodeBukuPreview() { const codeInp = document.getElementById('formKodeBuku'); if (!codeInp || codeInp.hasAttribute('readonly') || codeInp.value) return; const rak = document.getElementById('formKodeRak')?.value || ''; const kat = document.getElementById('formKategori')?.value || ''; if (rak || kat) { const catMap = { 'Board Book': 'BB', 'Buku Dongeng': 'BD', 'Cerita Anak': 'CA', 'Cerita Islami': 'CI', 'Dongeng Anak': 'DA', 'Dongeng anak': 'DA', 'Dongeng Islami': 'DI', 'Ensiklopedia Anak Islami': 'EA', 'E-Book Islami': 'EB', 'Cerita Anak & Fiksi': 'EB', 'Kemuhammadiyahan': 'EB', 'Pendidikan & Guru': 'EB', 'Fikih Anak': 'FA', 'Filsafat Dewasa': 'FD', 'Kamus': 'KA', 'Komik Anak': 'KA', 'Komik Aqidah': 'KA', 'Komik Islami': 'KI', 'Komik': 'KO', 'Majalah Anak': 'MA', 'Majalah Islam': 'MI', 'Majalah Islami': 'MI', 'Modul Pembelajaran': 'MP', 'Novel Anak': 'NA', 'Nonfiksi Edukatif': 'NE', 'Non-fiksi Edukatif': 'NE', 'Novel Fiksi Sastra Klasik': 'NF', 'Nonfiksi Ilmiah': 'NI', 'Novel': 'NO', 'Nonfiksi': 'NO' }; const catTrimmed = kat.trim(); let c = catMap[catTrimmed]; if (!c) { const words = catTrimmed.split(/\s+/).filter(Boolean); if (words.length >= 2) c = (words[0][0] + words[1][0]).toUpperCase(); else c = (catTrimmed.substring(0, 2) || 'BK').toUpperCase(); } const r = rak.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '1A'; const prefix = `${c}-${r}-`; let maxNum = 0; allBooks.forEach(b => { const bcode = b['KODE BUKU'] || ''; if (bcode.startsWith(prefix)) { const parts = bcode.split('-'); const num = parseInt(parts[parts.length - 1], 10); if (!isNaN(num) && num > maxNum) maxNum = num; } }); codeInp.placeholder = `Otomatis: ${prefix}${String(maxNum + 1).padStart(3, '0')}`; } else { codeInp.placeholder = 'Kosongkan untuk auto-generate nomor 3 digit'; } }
function openAddBukuModal() { document.getElementById('formKodeBuku').value = ''; document.getElementById('formKodeBuku').removeAttribute('readonly'); document.getElementById('formKodeRak').value = ''; document.getElementById('formJudulBuku').value = ''; document.getElementById('formPengarang').value = ''; document.getElementById('formPenerbit').value = ''; document.getElementById('formTahunTerbit').value = ''; document.getElementById('formKategori').value = ''; document.getElementById('formStok').value = '0'; document.getElementById('btnHapusBukuModal').style.display = 'none'; updateFormKodeBukuPreview(); openModal('bukuModal') }
function editBuku(kode) { const book = allBooks.find(b => b['KODE BUKU'] == kode); if (book) { document.getElementById('formKodeBuku').value = book['KODE BUKU'] || ''; document.getElementById('formKodeBuku').setAttribute('readonly', 'readonly'); document.getElementById('formKodeRak').value = book['KODE RAK'] || ''; document.getElementById('formJudulBuku').value = book['JUDUL BUKU'] || ''; document.getElementById('formPengarang').value = book.PENGARANG || ''; document.getElementById('formPenerbit').value = book.PENERBIT || ''; document.getElementById('formTahunTerbit').value = book.TAHUN || ''; document.getElementById('formKategori').value = book.KATEGORI || ''; document.getElementById('formStok').value = book['STOK TERSEDIA'] || '0'; const btnHapus = document.getElementById('btnHapusBukuModal'); btnHapus.style.display = 'inline-block'; btnHapus.onclick = function () { closeModal('bukuModal'); deleteBuku(kode) }; openModal('bukuModal') } }
function saveBuku(event) { event.preventDefault(); const kode = document.getElementById('formKodeBuku').value.trim(); const isNew = !allBooks.find(b => String(b['KODE BUKU'] || '').trim() == kode); const action = isNew ? 'addBuku' : 'updateBuku'; const message = isNew ? 'Menambah buku...' : 'Mengupdate buku...'; showLoading(message); apiCall(action, { kode: kode, kodeRak: document.getElementById('formKodeRak').value.trim(), judul: document.getElementById('formJudulBuku').value.trim(), pengarang: document.getElementById('formPengarang').value.trim(), penerbit: document.getElementById('formPenerbit').value.trim(), tahunTerbit: document.getElementById('formTahunTerbit').value.trim(), kategori: document.getElementById('formKategori').value.trim(), stok: document.getElementById('formStok').value.trim() }).then(data => { hideLoading(); showAlert(data.message, 'success'); closeModal('bukuModal'); loadAllBooks() }).catch(err => { hideLoading(); showAlert(`Error: ${err}`, 'error') }) }
function prosesPinjam() {
if (!currentMember) { showAlert('Silakan scan kode anggota terlebih dahulu', 'warning'); return }
if (!currentBook) { showAlert('Silakan scan kode buku terlebih dahulu', 'warning'); return }
if (currentBook.stok < 1) { showAlert('Stok buku tidak tersedia', 'error'); return }
const lamaPinjam = parseInt(document.getElementById('lamaPinjam').value) || 7; showLoading('Memproses peminjaman...'); apiCall('pinjamBuku', { kodeAnggota: currentMember.kode, kodeBuku: currentBook.kode, lamaPinjam: lamaPinjam }).then(data => { hideLoading(); showAlert(`${data.message}\nNo Transaksi: ${data.noTransaksi}`, 'success'); resetScanner(); return Promise.all([loadTransaksi(), loadAllBooks()]) }).then(() => refreshStatistik()).catch(err => { hideLoading(); showAlert(`Gagal: ${err}`, 'error') })
}
function prosesKembali() {
if (!currentMember) { showAlert('Silakan scan kode anggota terlebih dahulu', 'warning'); return }
const activeLoan = allTransactions.find(t => t['Kode Anggota'] == currentMember.kode && t.Status == 'DIPINJAM'); if (!activeLoan) { showAlert('Tidak ada peminjaman aktif untuk anggota ini', 'warning'); return }
const returnInfo = document.getElementById('returnInfo'); returnInfo.innerHTML = `
<strong>Konfirmasi Pengembalian Buku</strong><br>
<strong>No Transaksi:</strong> ${activeLoan['No Transaksi']}<br>
<strong>Anggota:</strong> ${currentMember.nama}<br>
<strong>Tgl Pinjam:</strong> ${activeLoan['Tgl Pinjam']}<br>
<strong>Jatuh Tempo:</strong> ${activeLoan['Jatuh Tempo']}
`; currentTransaction = activeLoan; openModal('returnModal')
}
function confirmReturn() { if (!currentTransaction) return; showLoading('Memproses pengembalian...'); apiCall('kembaliBuku', { noTransaksi: currentTransaction['No Transaksi'] }).then(data => { hideLoading(); showAlert(`${data.message}`, 'success'); closeModal('returnModal'); resetScanner(); return Promise.all([loadTransaksi(), loadAllBooks()]) }).then(() => refreshStatistik()).catch(err => { hideLoading(); showAlert(`Gagal: ${err}`, 'error') }) }
function loadTransaksi() {
loadLoanRequests();
return apiCall('getTransaksi', {}).then(data => { allTransactions = data; displayTransaksiTable(data) }).catch(err => showAlert(`Gagal load transaksi: ${err}`, 'error'))
}
async function loadLoanRequests() {
const tbody = document.getElementById('loanRequestsTable');
if (!tbody) return;
try {
const list = await DBLibrary.getLoanRequests();
if (!list || !list.length) {
tbody.innerHTML = '<tr><td colspan="7" class="text-center">Belum ada permohonan pinjam online masuk.</td></tr>';
return;
}
tbody.innerHTML = list.map(req => {
const isEntrusted = req.handoverMethod === 'entrusted';
const methodBadge = isEntrusted
? `<span class="badge-handover entrusted"><i class="fas fa-child"></i> Titip ke Ananda: ${req.studentName || '-'} (${req.studentClass || '-'})</span>`
: `<span class="badge-handover direct"><i class="fas fa-walking"></i> Datang Langsung</span>`;
const statusBadge = req.status === 'completed'
? `<span class="badge-req-status completed"><i class="fas fa-check"></i> Selesai Dipinjam</span>`
: (req.status === 'ready'
? `<span class="badge-req-status ready"><i class="fas fa-box-open"></i> Siap Diambil</span>`
: `<span class="badge-req-status pending"><i class="fas fa-clock"></i> Menunggu Persiapan</span>`);
const cleanPhone = (req.phone || '').replace(/[^0-9]/g, '');
const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
const waText = encodeURIComponent(`Halo ${req.borrowerName},\nKami dari Perpustakaan SD Muhammadiyah 1 Sedati ingin mengonfirmasi permohonan pinjam buku:\n*Buku:* ${req.bookTitle}\n*Metode:* ${isEntrusted ? 'Dititipkan ke Ananda ' + (req.studentName || '') : 'Datang Langsung'}\nBuku sudah kami siapkan. Terima kasih!`);
const btnWa = waPhone
? `<a href="https://wa.me/${waPhone}?text=${waText}" target="_blank" rel="noopener" class="btn-wa-sm"><i class="fab fa-whatsapp"></i> Hubungi</a>`
: '';
const btnAction = req.status !== 'completed'
? `<button type="button" class="btn-primary btn-xs btn-approve-loan" data-id="${req.id}"><i class="fas fa-check-circle"></i> Proses Pinjam</button>`
: `<span class="text-muted text-xs">Transaksi Selesai</span>`;
return `
<tr>
<td><strong>${req.id}</strong></td>
<td>${req.pickupDate || '-'}</td>
<td>
<strong>${req.borrowerName}</strong>
<div class="text-xs text-muted">${req.borrowerType || 'Siswa'} • ${req.phone || '-'}</div>
</td>
<td>${methodBadge}</td>
<td>
<strong>${req.bookTitle || '-'}</strong>
<div class="text-xs text-muted">Kode: ${req.bookCode} • Rak: ${req.shelfCode || '-'}</div>
</td>
<td>${statusBadge}</td>
<td>
<div class="btn-action-group">
${btnAction}
${btnWa}
</div>
</td>
</tr>
`;
}).join('');
tbody.querySelectorAll('.btn-approve-loan').forEach(btn => {
btn.addEventListener('click', async () => {
const id = btn.dataset.id;
showConfirm('Setujui permohonan dan buat transaksi peminjaman buku ini?', async () => {
showLoading('Memproses transaksi...');
try {
await apiCall('approveLoanRequest', { id });
hideLoading();
showAlert('Permohonan berhasil disetujui dan transaksi telah dibuat!', 'success');
loadLoanRequests();
loadTransaksi();
} catch (e) {
hideLoading();
showAlert(`Gagal memproses: ${e.message}`, 'error');
}
});
});
});
} catch (err) {
tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Gagal memuat: ${err.message}</td></tr>`;
}
}
function displayTransaksiTable(transactions) {
const tbody = document.getElementById('transaksiTable'); if (!transactions || transactions.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada transaksi</td></tr>'; return }
tbody.innerHTML = transactions.map(t => {
const statusBadge = t.Status === 'DIPINJAM' ? `<span class="status-badge badge-dipinjam">DIPINJAM</span>` : `<span class="status-badge badge-kembali">KEMBALI</span>`; return `
<tr>
<td>${t['No Transaksi'] || '-'}</td>
<td>${formatDate(t['Tgl Pinjam'])}</td>
<td>${t['Kode Anggota'] || '-'}</td>
<td>${t['Kode Buku'] || '-'}</td>
<td>${formatDate(t['Jatuh Tempo'])}</td>
<td>${statusBadge}</td>
<td>
<button class="btn-sm btn-secondary" data-action="viewTransaction" data-id="${t['No Transaksi']}">
<i class="fas fa-eye"></i>
</button>
</td>
</tr>
`}).join('')
}
function filterTransaksi() {
const statusEl = document.getElementById('filterStatus'); const anggotaEl = document.getElementById('filterAnggota'); const status = statusEl ? statusEl.value : ''; const q = anggotaEl ? anggotaEl.value.trim().toLowerCase() : ''; let filtered = allTransactions || []; if (status) { filtered = filtered.filter(t => (t.Status || '').toUpperCase() === status.toUpperCase()) }
if (q) { filtered = filtered.filter(t => { const kA = (t['Kode Anggota'] || '').toLowerCase(); const kB = (t['Kode Buku'] || '').toLowerCase(); const nT = (t['No Transaksi'] || '').toLowerCase(); return kA.includes(q) || kB.includes(q) || nT.includes(q) }) }
displayTransaksiTable(filtered)
}
function exportTransaksi() { const data = allTransactions; let html = '<table border="1"><tr>';['No Transaksi', 'Tgl Pinjam', 'Kode Anggota', 'Kode Buku', 'Jatuh Tempo', 'Tgl Kembali', 'Status'].forEach(h => { html += `<th>${h}</th>` }); html += '</tr>'; data.forEach(row => { html += '<tr>'; html += `<td>${row['No Transaksi']}</td>`; html += `<td>${row['Tgl Pinjam']}</td>`; html += `<td>${row['Kode Anggota']}</td>`; html += `<td>${row['Kode Buku']}</td>`; html += `<td>${row['Jatuh Tempo']}</td>`; html += `<td>${row['Tgl Kembali']}</td>`; html += `<td>${row['Status']}</td>`; html += '</tr>' }); html += '</table>'; const printWindow = window.open('', 'Print'); html += '<script>let pr=false; const doPr=()=>{if(pr)return;pr=true;setTimeout(()=>{window.print();window.close();},500);}; window.onload=doPr; setTimeout(doPr, 8000);</script>'; printWindow.document.write(html); printWindow.document.close(); printWindow.focus() }
function loadOverdue() { return apiCall('getOverdue', {}).then(data => { displayOverdueTable(data) }).catch(err => showAlert(`Gagal load overdue: ${err}`, 'error')) }
function displayOverdueTable(overdue) {
const tbody = document.getElementById('overdueTable'); if (!overdue || overdue.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada buku overdue</td></tr>'; return }
const today = new Date(); tbody.innerHTML = overdue.map(o => {
const dueDate = new Date(o['Jatuh Tempo']); const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)); return `
<tr>
<td>${o['No Transaksi']}</td>
<td>${o['Kode Anggota']}</td>
<td>${o['Kode Buku']}</td>
<td>${formatDate(o['Jatuh Tempo'])}</td>
<td><span class="status-overdue-days">${daysLate} hari</span></td>
<td>
<button class="btn-sm btn-danger" data-action="openReturnForOverdue" data-id="${o['No Transaksi']}">
<i class="fas fa-undo"></i> Kembali
</button>
</td>
</tr>
`}).join('')
}
function openReturnForOverdue(noTransaksi) {
const trx = allTransactions.find(t => t['No Transaksi'] == noTransaksi); if (trx) {
currentTransaction = trx; const returnInfo = document.getElementById('returnInfo'); returnInfo.innerHTML = `
<strong>Pengembalian Buku Overdue</strong><br>
<strong>No Transaksi:</strong> ${trx['No Transaksi']}<br>
<strong>Anggota:</strong> ${trx['Kode Anggota']}<br>
<strong>Buku:</strong> ${trx['Kode Buku']}<br>
<strong>Jatuh Tempo:</strong> ${formatDate(trx['Jatuh Tempo'])}<br>
<span class="status-overdue"><strong>Status: OVERDUE</strong></span>
`; openModal('returnModal')
}
}
function refreshStatistik() { return apiCall('getStatistik', {}).then(data => { document.getElementById('statTotalBuku').textContent = data.totalBuku; document.getElementById('statTersedia').textContent = data.bukuTersedia; document.getElementById('statDipinjam').textContent = data.bukuDipinjam; document.getElementById('statOverdue').textContent = data.overdueCount }).catch(err => showAlert(`Gagal load statistik: ${err}`, 'error')) }
function switchPrintMode(mode) { document.getElementById('member-search-mode').style.display = 'none'; document.getElementById('book-search-mode').style.display = 'none'; document.getElementById(mode + '-mode').style.display = 'block' }
function switchToSelectiveMode(type) { selectivePrintMode = type; const selectedTab = type === 'member' ? 'anggota' : 'buku'; document.querySelectorAll('.tab-content').forEach(tab => { tab.classList.remove('active') }); document.getElementById(selectedTab).classList.add('active'); document.querySelectorAll('.tab-btn').forEach(btn => { btn.classList.remove('active') }); event.target.classList.add('active'); showAlert(`Pilih ${type === 'member' ? 'anggota' : 'buku'} yang ingin dicetak dengan checkbox`, 'info') }
function toggleSelectAllMembers(checked) { const checkboxes = document.querySelectorAll('.member-checkbox'); checkboxes.forEach(cb => { cb.checked = checked }); updateMemberSelection() }
function toggleSelectAllBooks(checked) { const checkboxes = document.querySelectorAll('.book-checkbox'); checkboxes.forEach(cb => { cb.checked = checked }); updateBookSelection() }
function updateMemberSelection() { const checkboxes = document.querySelectorAll('.member-checkbox:checked'); selectedForPrint.members = Array.from(checkboxes).map(cb => cb.value); if (selectedForPrint.members.length > 0) { showAlert(`${selectedForPrint.members.length} anggota terpilih`, 'info', !0, 1500) } }
function updateBookSelection() { const checkboxes = document.querySelectorAll('.book-checkbox:checked'); selectedForPrint.books = Array.from(checkboxes).map(cb => cb.value); if (selectedForPrint.books.length > 0) { showAlert(`${selectedForPrint.books.length} buku terpilih`, 'info', !0, 1500) } }
function openBulkActions(type) {
const selectedList = type === 'anggota' ? selectedForPrint.members : selectedForPrint.books; if (selectedList.length === 0) { showAlert('Pilih minimal 1 data terlebih dahulu', 'warning'); return }
Swal.fire({
title: 'Aksi Data Terpilih', html: `
<p style="margin-bottom: 20px;">Terdapat <strong>${selectedList.length}</strong> data yang dipilih. Apa yang ingin Anda lakukan?</p>
<div style="display: flex; flex-direction: row; gap: 10px; justify-content: center;">
<button class="swal2-confirm swal2-styled" style="background-color: #F59E0B; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px 15px;" data-action="selectivePrint">
<i class="fas fa-print"></i> Cetak yang Dipilih
</button>
<button class="swal2-confirm swal2-styled" style="background-color: #EF4444; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px 15px;" data-action="bulkDelete">
<i class="fas fa-trash-alt"></i> Hapus yang Dipilih
</button>
</div>
`, showConfirmButton: !1, showCancelButton: !0, cancelButtonText: 'Tutup'
})
}
function selectivePrintMembers() {
if (selectedForPrint.members.length === 0) { showAlert('Pilih minimal 1 anggota untuk dicetak', 'warning'); return }
const selected = selectedForPrint.members.map(kode => allMembers.find(m => m.KODE === kode)).filter(m => m); const alreadyPrinted = selected.filter(m => m['STATUS CETAK'] === 'DICETAK').length; let msg = `Cetak ${selected.length} kartu anggota yang terpilih?`; if (alreadyPrinted > 0) { msg = `Dari ${selected.length} kartu, ${alreadyPrinted} di antaranya sudah pernah dicetak. Yakin ingin mencetak ulang?` }
showConfirm(msg, () => { printSelectedMembers(selected); apiCall('updateStatusCetak', { type: 'anggota', kodeList: JSON.stringify(selectedForPrint.members) }).then(() => loadAllMembers()).catch(err => console.error('Gagal update status cetak:', err)) })
}
function selectivePrintBooks() {
if (selectedForPrint.books.length === 0) { showAlert('Pilih minimal 1 buku untuk dicetak', 'warning'); return }
const selected = selectedForPrint.books.map(kode => allBooks.find(b => b['KODE BUKU'] === kode)).filter(b => b); const alreadyPrinted = selected.filter(b => b['STATUS CETAK'] === 'DICETAK').length; let msg = `Cetak ${selected.length} label buku yang terpilih?`; if (alreadyPrinted > 0) { msg = `Dari ${selected.length} label, ${alreadyPrinted} di antaranya sudah pernah dicetak. Yakin ingin mencetak ulang?` }
showConfirm(msg, () => { printSelectedBooks(selected); apiCall('updateStatusCetak', { type: 'buku', kodeList: JSON.stringify(selectedForPrint.books) }).then(() => loadAllBooks()).catch(err => console.error('Gagal update status cetak:', err)) })
}
function printSelectedMembers(members) {
if (members.length === 0) return; let html = '<html><head><meta charset="UTF-8"><style>' + '* {box-sizing: border-box; margin: 0; padding: 0;}' + '@page {size: landscape; margin: 10mm;}' + 'body {font-family: "Courier New", Courier, monospace; background: white; font-size: 12px;}' + '.wrapper-anggota {display: grid; grid-template-columns: 1fr 1fr; gap: 15px;}' + '.card-anggota {width: 100%; min-height: 95vh; border: 1px solid #333; background: white; padding: 20px; display: flex; flex-direction: column; page-break-inside: avoid;}' + '.page-break {page-break-after: always;}' + '.school-header {text-align: center; padding-bottom: 10px; border-bottom: 2px solid #333; font-weight: bold; line-height: 1.5; margin-bottom: 20px;}' + '.school-title {font-size: 16px;}' + '.school-name {font-size: 14px;}' + '.school-tag {font-size: 11px;}' + '.header-card {display: flex; margin-bottom: 20px; align-items: flex-start;}' + '.info-left {flex: 2; padding-right: 15px;}' + '.info-right {flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;}' + '.detail-table {border-collapse: collapse; font-size: 13px; margin-bottom: 10px;}' + '.detail-table td {padding: 3px 4px; vertical-align: top;}' + '.detail-table td:first-child {width: 110px; text-align: left;}' + '.detail-table td:nth-child(2) {width: 8px; text-align: center;}' + '.detail-table td:nth-child(3) {text-align: left;}' + '.table-transaksi {width: 100%; border-collapse: collapse; flex-grow: 1;}' + '.table-transaksi th, .table-transaksi td {border: 1px solid #333; padding: 6px; text-align: center; font-size: 11px;}' + '.table-transaksi td:nth-child(2) {font-size: 9px; white-space: nowrap;}' + '.table-transaksi th {background-color: #f7f7f7; font-weight: bold;}' + '.qr-code-img {width: 80px; height: 80px; border: 1px solid #333;}' + '.qr-code-text {margin-top: 5px; font-weight: bold; font-size: 10px; text-align: center;}' + '@media print {body {margin: 0; padding: 0; background: white;} @page {margin: 10mm;}}' + '</style></head><body>'; let cardsOnPage = 0; members.forEach((member, index) => {
if (cardsOnPage === 0) { html += '<div class="wrapper-anggota">' }
const memberTransactions = allTransactions.filter(t => t['Kode Anggota'] == member.KODE); const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(member['KODE'])}`; const logoUrl = new URL('assets/img/logo.webp', window.location.href).href; html += '<div class="card-anggota">' + '<div class="school-header">' + '<div style="display: flex; align-items: center; justify-content: center; gap: 15px;">' + '<img src="' + logoUrl + '" style="width: 50px; height: 50px; object-fit: contain;">' + '<div>' + '<div class="school-title">KARTU ANGGOTA PERPUSTAKAAN</div>' + '<div class="school-name">SD MUHAMMADIYAH 1 SEDATI</div>' + '<div class="school-tag">Islamic Modern School</div>' + '</div></div></div>' + '<div class="header-card">' + '<div class="info-left">' + '<table class="detail-table"><tr><td>Kode Anggota</td><td>:</td><td>' + member.KODE + '</td></tr>' + '<tr><td>Nama</td><td>:</td><td>' + member.NAMA + '</td></tr>' + '<tr><td>Tipe</td><td>:</td><td>' + member.TIPE + '</td></tr>' + '<tr><td>Keterangan</td><td>:</td><td>' + member.KETERANGAN + '</td></tr></table>' + '</div>' + '<div class="info-right">' + '<img src="' + qrUrl + '" class="qr-code-img"><div class="qr-code-text">' + member.KODE + '</div>' + '</div>' + '</div>' + '<table class="table-transaksi"><thead><tr><th style="width: 6%;">No</th><th style="width: 28%;">No Transaksi</th><th style="width: 16%;">Kode Buku</th><th style="width: 25%;">Jatuh Tempo</th><th style="width: 25%;">Tgl Kembali</th></tr></thead><tbody>'; for (let i = 0; i < 15; i++) { const trx = memberTransactions[i]; html += '<tr><td>' + (i + 1) + '</td><td>' + (trx ? trx['No Transaksi'] : '') + '</td><td>' + (trx ? trx['Kode Buku'] : '') + '</td><td>' + (trx ? formatDate(trx['Jatuh Tempo']) : '') + '</td><td>' + (trx ? formatDate(trx['Tgl Kembali']) : '') + '</td></tr>' }
html += '</tbody></table></div>'; cardsOnPage++; if (cardsOnPage === 2 || index === members.length - 1) {
html += '</div>'; if (index < members.length - 1) { html += '<div class="page-break"></div>' }
cardsOnPage = 0
}
}); html += '</body></html>'; const printWindow = window.open('', 'Print Selected Members'); html += '<script>let pr=false; const doPr=()=>{if(pr)return;pr=true;setTimeout(()=>{window.print();window.close();},500);}; window.onload=doPr; setTimeout(doPr, 8000);</script>'; printWindow.document.write(html); printWindow.document.close(); printWindow.focus(); showAlert('Data siap dicetak', 'success')
}
function printSelectedBooks(books) {
if (books.length === 0) return; let html = '<html><head><meta charset="UTF-8"><style>' + '* {box-sizing: border-box; margin: 0; padding: 0;}' + '@page {size: portrait; margin: 10mm;}' + 'body {font-family: "Courier New", Courier, monospace; background: white; font-size: 12px;}' + '.container-buku {display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;}' + '.label-buku {border: 1px solid #333; background: white; padding: 15px; display: flex; align-items: flex-start; min-height: 120px; page-break-inside: avoid;}' + '.buku-info {flex: 2; font-size: 12px;}' + '.buku-qr {flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;}' + '.detail-table {border-collapse: collapse; margin: 0; width: 100%;}' + '.detail-table td {padding: 2px 4px; font-size: 12px; vertical-align: top;}' + '.detail-table td:first-child {width: 85px; text-align: left;}' + '.detail-table td:nth-child(2) {width: 8px; text-align: center;}' + '.detail-table td:nth-child(3) {text-align: left;}' + '.kode-buku-text {margin-top: 3px; font-weight: bold; font-size: 10px; text-align: center;}' + '.page-buku {page-break-before: always;}' + '.page-buku:first-child {page-break-before: avoid;}' + '@media print {body {margin: 0; padding: 0; background: white;} @page {margin: 10mm;} .container-buku {page-break-inside: auto;}}' + '</style></head><body>'; let labelsOnPage = 0; let pageOpen = !1; books.forEach((book, index) => {
if (labelsOnPage === 0) {
if (pageOpen) { html += '</div>' }
html += '<div class="page-buku"><div class="container-buku">'; pageOpen = !0
}
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(book['KODE BUKU'])}`; html += '<div class="label-buku">' + '<div class="buku-info">' + '<table class="detail-table"><tr><td>Judul</td><td>:</td><td><strong>' + book['JUDUL BUKU'] + '</strong></td></tr>' + '<tr><td>Pengarang</td><td>:</td><td>' + book.PENGARANG + '</td></tr>' + '<tr><td>Penerbit</td><td>:</td><td>' + book.PENERBIT + ' (' + book.TAHUN + ')</td></tr>' + '<tr><td>Kategori</td><td>:</td><td>' + book.KATEGORI + '</td></tr>' + '<tr><td>Rak</td><td>:</td><td>' + book['KODE RAK'] + '</td></tr></table>' + '</div>' + '<div class="buku-qr">' + '<img src="' + qrUrl + '" class="qr-code-preview">' + '<div class="kode-buku-text">' + book['KODE BUKU'] + '</div>' + '</div>' + '</div>'; labelsOnPage++; if (labelsOnPage === 8 || index === books.length - 1) { labelsOnPage = 0 }
}); if (pageOpen) { html += '</div></div>' }
html += '</body></html>'; const printWindow = window.open('', 'Print Selected Books'); html += '<script>let pr=false; const doPr=()=>{if(pr)return;pr=true;setTimeout(()=>{window.print();window.close();},500);}; window.onload=doPr; setTimeout(doPr, 8000);</script>'; printWindow.document.write(html); printWindow.document.close(); printWindow.focus(); showAlert('Data siap dicetak', 'success')
}
function searchMember() {
const inp = document.getElementById('memberSearchInput'); const searchText = inp ? inp.value.trim().toUpperCase() : ''; const resultsDiv = document.getElementById('memberSearchResults'); if (!searchText) { resultsDiv.innerHTML = ''; return }
const results = allMembers.filter(m => (m.KODE && m.KODE.includes(searchText)) || (m.NIS && m.NIS.includes(searchText)) || (m.NAMA && m.NAMA.toUpperCase().includes(searchText))); if (results.length === 0) { resultsDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Tidak ada hasil pencarian</p></div>'; return }
let html = '<div class="filter-section print-result-section">'; results.forEach(member => {
html += `
<div class="print-result-item">
<div>
<strong>${member['KODE']}</strong> - ${member['NAMA']}
<br><small>${member['TIPE']} | ${member['KETERANGAN']}</small>
</div>
<button class="btn-success btn-sm" data-action="printMemberCard" data-id="${member['KODE']}">
<i class="fas fa-print"></i> Cetak
</button>
</div>
`}); html += '</div>'; resultsDiv.innerHTML = html
}
function printMemberCard(kodeAnggota) {
const member = allMembers.find(m => m.KODE == kodeAnggota); if (!member) { showAlert('Anggota tidak ditemukan', 'error'); return }
const doPrint = () => {
const memberTransactions = allTransactions.filter(t => t['Kode Anggota'] == kodeAnggota); const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(kodeAnggota)}`; const logoUrl = new URL('assets/img/logo.webp', window.location.href).href; let html = '<html><head><meta charset="UTF-8"><style>' + '* {box-sizing: border-box; margin: 0; padding: 0;}' + '@page {size: landscape; margin: 10mm;}' + 'body {font-family: "Courier New", Courier, monospace; background: white; font-size: 12px;}' + '.wrapper {display: grid; grid-template-columns: 1fr 1fr; gap: 15px;}' + '.card-anggota {width: 100%; min-height: 95vh; border: 1px solid #333; background: white; padding: 20px; display: flex; flex-direction: column; page-break-inside: avoid;}' + '.school-header {text-align: center; padding-bottom: 10px; border-bottom: 2px solid #333; font-weight: bold; line-height: 1.5; margin-bottom: 20px;}' + '.school-title {font-size: 16px;}' + '.school-name {font-size: 14px;}' + '.school-tag {font-size: 11px;}' + '.header-card {display: flex; margin-bottom: 20px; align-items: flex-start;}' + '.info-left {flex: 2; padding-right: 15px;}' + '.info-right {flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;}' + '.detail-table {border-collapse: collapse; font-size: 13px; margin-bottom: 10px;}' + '.detail-table td {padding: 3px 4px; vertical-align: top;}' + '.detail-table td:first-child {width: 110px; text-align: left;}' + '.detail-table td:nth-child(2) {width: 8px; text-align: center;}' + '.detail-table td:nth-child(3) {text-align: left;}' + '.table-transaksi {width: 100%; border-collapse: collapse; flex-grow: 1;}' + '.table-transaksi th, .table-transaksi td {border: 1px solid #333; padding: 6px; text-align: center; font-size: 11px;}' + '.table-transaksi td:nth-child(2) {font-size: 9px; white-space: nowrap;}' + '.table-transaksi th {background-color: #f7f7f7; font-weight: bold;}' + '.qr-code-img {width: 80px; height: 80px; border: 1px solid #333;}' + '.qr-code-text {margin-top: 5px; font-weight: bold; font-size: 10px; text-align: center;}' + '@media print {body {margin: 0; padding: 0; background: white;} @page {margin: 10mm;}}' + '</style></head><body>' + '<div class="wrapper">' + '<div class="card-anggota">' + '<div class="school-header">' + '<div style="display: flex; align-items: center; justify-content: center; gap: 15px;">' + '<img src="' + logoUrl + '" style="width: 50px; height: 50px; object-fit: contain;">' + '<div>' + '<div class="school-title">KARTU ANGGOTA PERPUSTAKAAN</div>' + '<div class="school-name">SD MUHAMMADIYAH 1 SEDATI</div>' + '<div class="school-tag">Islamic Modern School</div>' + '</div></div></div>' + '<div class="header-card">' + '<div class="info-left">' + '<table class="detail-table"><tr><td>' + (member.TIPE === 'Siswa' ? 'NIS Siswa' : 'Kode Anggota') + '</td><td>:</td><td>' + member.KODE + '</td></tr>' + '<tr><td>Nama</td><td>:</td><td>' + member.NAMA + '</td></tr>' + '<tr><td>Tipe</td><td>:</td><td>' + member.TIPE + '</td></tr>' + '<tr><td>Keterangan</td><td>:</td><td>' + member.KETERANGAN + '</td></tr></table>' + '</div>' + '<div class="info-right">' + '<img src="' + qrUrl + '" class="qr-code-img"><div class="qr-code-text">' + kodeAnggota + '</div>' + '</div>' + '</div>' + '<table class="table-transaksi"><thead><tr><th style="width: 6%;">No</th><th style="width: 28%;">No Transaksi</th><th style="width: 16%;">Kode Buku</th><th style="width: 25%;">Jatuh Tempo</th><th style="width: 25%;">Tgl Kembali</th></tr></thead><tbody>'
for (let i = 0; i < 15; i++) { const trx = memberTransactions[i]; html += '<tr><td>' + (i + 1) + '</td><td>' + (trx ? trx['No Transaksi'] : '') + '</td><td>' + (trx ? trx['Kode Buku'] : '') + '</td><td>' + (trx ? formatDate(trx['Jatuh Tempo']) : '') + '</td><td>' + (trx ? formatDate(trx['Tgl Kembali']) : '') + '</td></tr>' }
html += '</tbody></table>' + '</div>' + '</div></body></html>'; const printWindow = window.open('', 'Print Member Card'); html += '<script>let pr=false; const doPr=()=>{if(pr)return;pr=true;setTimeout(()=>{window.print();window.close();},500);}; window.onload=doPr; setTimeout(doPr, 8000);</script>'; printWindow.document.write(html); printWindow.document.close(); printWindow.focus(); setTimeout(() => { apiCall('updateStatusCetak', { type: 'anggota', kodeList: JSON.stringify([kodeAnggota]) }).then(() => loadAllMembers()).catch(err => console.error('Gagal update status cetak:', err)) }, 1000)
}
if (member['STATUS CETAK'] === 'DICETAK') { showConfirm(`Kartu anggota ${kodeAnggota} sudah pernah dicetak. Yakin ingin mencetak ulang?`, () => { doPrint() }) } else { doPrint() }
}
function confirmBulkPrintMembers() {
const alreadyPrinted = allMembers.filter(m => m['STATUS CETAK'] === 'DICETAK').length; let msg = `Yakin ingin mencetak ${allMembers.length} kartu anggota?`; if (alreadyPrinted > 0) { msg = `Dari ${allMembers.length} kartu, ${alreadyPrinted} di antaranya sudah pernah dicetak. Yakin ingin mencetak ulang semuanya?` }
showConfirm(msg, () => { bulkPrintMembers(); const kodeList = allMembers.map(m => m.KODE); apiCall('updateStatusCetak', { type: 'anggota', kodeList: JSON.stringify(kodeList) }).then(() => loadAllMembers()).catch(err => console.error('Gagal update status cetak:', err)) })
}
function confirmBulkPrintBooks() {
const alreadyPrinted = allBooks.filter(b => b['STATUS CETAK'] === 'DICETAK').length; let msg = `Yakin ingin mencetak ${allBooks.length} label buku?`; if (alreadyPrinted > 0) { msg = `Dari ${allBooks.length} label, ${alreadyPrinted} di antaranya sudah pernah dicetak. Yakin ingin mencetak ulang semuanya?` }
showConfirm(msg, () => { bulkPrintBooks(); const kodeList = allBooks.map(b => b['KODE BUKU']); apiCall('updateStatusCetak', { type: 'buku', kodeList: JSON.stringify(kodeList) }).then(() => loadAllBooks()).catch(err => console.error('Gagal update status cetak:', err)) })
}
function bulkPrintMembers() {
if (allMembers.length === 0) { showAlert('Tidak ada data anggota', 'warning'); return }
let html = '<html><head><meta charset="UTF-8"><style>' + '* {box-sizing: border-box; margin: 0; padding: 0;}' + '@page {size: landscape; margin: 10mm;}' + 'body {font-family: "Courier New", Courier, monospace; background: white; font-size: 12px;}' + '.wrapper-anggota {display: grid; grid-template-columns: 1fr 1fr; gap: 15px;}' + '.card-anggota {width: 100%; min-height: 95vh; border: 1px solid #333; background: white; padding: 20px; display: flex; flex-direction: column; page-break-inside: avoid;}' + '.page-break {page-break-after: always;}' + '.school-header {text-align: center; padding-bottom: 10px; border-bottom: 2px solid #333; font-weight: bold; line-height: 1.5; margin-bottom: 20px;}' + '.school-title {font-size: 16px;}' + '.school-name {font-size: 14px;}' + '.school-tag {font-size: 11px;}' + '.header-card {display: flex; margin-bottom: 20px; align-items: flex-start;}' + '.info-left {flex: 2; padding-right: 15px;}' + '.info-right {flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;}' + '.detail-table {border-collapse: collapse; font-size: 13px; margin-bottom: 10px;}' + '.detail-table td {padding: 3px 4px; vertical-align: top;}' + '.detail-table td:first-child {width: 110px; text-align: left;}' + '.detail-table td:nth-child(2) {width: 8px; text-align: center;}' + '.detail-table td:nth-child(3) {text-align: left;}' + '.table-transaksi {width: 100%; border-collapse: collapse; flex-grow: 1;}' + '.table-transaksi th, .table-transaksi td {border: 1px solid #333; padding: 6px; text-align: center; font-size: 11px;}' + '.table-transaksi th {background-color: #f7f7f7; font-weight: bold;}' + '.qr-code-img {width: 80px; height: 80px; border: 1px solid #333;}' + '.qr-code-text {margin-top: 5px; font-weight: bold; font-size: 10px; text-align: center;}' + '@media print {body {margin: 0; padding: 0; background: white;} @page {margin: 10mm;}}' + '</style></head><body>'; let cardsOnPage = 0; allMembers.forEach((member, index) => {
if (cardsOnPage === 0) { html += '<div class="wrapper-anggota">' }
const memberTransactions = allTransactions.filter(t => t['Kode Anggota'] == member.KODE); const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(member['KODE'])}`; html += '<div class="card-anggota">' + '<div class="school-header">' + '<div class="school-title">KARTU ANGGOTA PERPUSTAKAAN</div>' + '<div class="school-name">SD MUHAMMADIYAH 1 SEDATI</div>' + '<div class="school-tag">Islamic Modern School</div>' + '</div>' + '<div class="header-card">' + '<div class="info-left">' + '<table class="detail-table"><tr><td>' + (member.TIPE === 'Siswa' ? 'NIS Siswa' : 'Kode Anggota') + '</td><td>:</td><td>' + member.KODE + '</td></tr>' + '<tr><td>Nama</td><td>:</td><td>' + member.NAMA + '</td></tr>' + '<tr><td>Tipe</td><td>:</td><td>' + member.TIPE + '</td></tr>' + '<tr><td>Keterangan</td><td>:</td><td>' + member.KETERANGAN + '</td></tr></table>' + '</div>' + '<div class="info-right">' + '<img src="' + qrUrl + '" class="qr-code-img"><div class="qr-code-text">' + member.KODE + '</div>' + '</div>' + '</div>' + '<table class="table-transaksi"><thead><tr><th style="width: 6%;">No</th><th style="width: 18%;">No Transaksi</th><th style="width: 15%;">Kode Buku</th><th style="width: 30%;">Jatuh Tempo</th><th style="width: 31%;">Tgl Kembali</th></tr></thead><tbody>'; for (let i = 0; i < 15; i++) { const trx = memberTransactions[i]; html += '<tr><td>' + (i + 1) + '</td><td>' + (trx ? trx['No Transaksi'] : '') + '</td><td>' + (trx ? trx['Kode Buku'] : '') + '</td><td>' + (trx ? formatDate(trx['Jatuh Tempo']) : '') + '</td><td>' + (trx ? formatDate(trx['Tgl Kembali']) : '') + '</td></tr>' }
html += '</tbody></table></div>'; cardsOnPage++; if (cardsOnPage === 2 || index === allMembers.length - 1) {
html += '</div>'; if (index < allMembers.length - 1) { html += '<div class="page-break"></div>' }
cardsOnPage = 0
}
}); html += '</body></html>'; const printWindow = window.open('', 'Bulk Print Members'); html += '<script>let pr=false; const doPr=()=>{if(pr)return;pr=true;setTimeout(()=>{window.print();window.close();},1000);}; window.onload=doPr; setTimeout(doPr, 12000);</script>'; printWindow.document.write(html); printWindow.document.close(); printWindow.focus()
}
function searchBook() {
const inp = document.getElementById('bookSearchInput'); const searchText = inp ? inp.value.trim().toUpperCase() : ''; const resultsDiv = document.getElementById('bookSearchResults'); if (!searchText) { resultsDiv.innerHTML = ''; return }
const results = allBooks.filter(b => b['KODE BUKU'].includes(searchText) || b['JUDUL BUKU'].toUpperCase().includes(searchText)); if (results.length === 0) { resultsDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Tidak ada hasil pencarian</p></div>'; return }
let html = '<div class="filter-section print-result-section">'; results.forEach(book => {
html += `
<div class="print-result-item">
<div>
<strong>${book['KODE BUKU']}</strong> - ${book['JUDUL BUKU']}
<br><small>${book['PENGARANG']} | ${book['KATEGORI']} | Rak ${book['KODE RAK']}</small>
</div>
<button class="btn-success btn-sm" data-action="printBookLabel" data-id="${book['KODE BUKU']}">
<i class="fas fa-print"></i> Cetak
</button>
</div>
`}); html += '</div>'; resultsDiv.innerHTML = html
}
function printBookLabel(kodeBuku) {
const book = allBooks.find(b => b['KODE BUKU'] == kodeBuku); if (!book) { showAlert('Buku tidak ditemukan', 'error'); return }
const doPrint = () => { const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(kodeBuku)}`; let html = '<html><head><meta charset="UTF-8"><style>' + '* {box-sizing: border-box; margin: 0; padding: 0;}' + '@page {size: portrait; margin: 10mm;}' + 'body {font-family: "Courier New", Courier, monospace; background: white; font-size: 12px;}' + '.container-buku {display: grid; grid-template-columns: 1fr 1fr; gap: 12px;}' + '.label-buku {border: 1px solid #333; background: white; padding: 15px; display: flex; align-items: flex-start; min-height: 120px; page-break-inside: avoid;}' + '.buku-info {flex: 2; font-size: 12px;}' + '.buku-qr {flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;}' + '.detail-table {width: 100%; border-collapse: collapse; margin: 2px 0;}' + '.detail-table td {padding: 2px 4px; font-size: 12px; vertical-align: top;}' + '.detail-table td:first-child {width: 85px; text-align: left;}' + '.detail-table td:nth-child(2) {width: 8px; text-align: center;}' + '.detail-table td:nth-child(3) {text-align: left;}' + '.kode-buku-text {margin-top: 3px; font-weight: bold; font-size: 10px; text-align: center;}' + '@media print {body {margin: 0; padding: 0; background: white;} @page {margin: 10mm;}}' + '</style></head><body>' + '<div class="container-buku">' + '<div class="label-buku">' + '<div class="buku-info">' + '<table class="detail-table"><tr><td>Judul</td><td>:</td><td><strong>' + book['JUDUL BUKU'] + '</strong></td></tr>' + '<tr><td>Pengarang</td><td>:</td><td>' + book.PENGARANG + '</td></tr>' + '<tr><td>Penerbit</td><td>:</td><td>' + book.PENERBIT + ' (' + book.TAHUN + ')</td></tr>' + '<tr><td>Kategori</td><td>:</td><td>' + book.KATEGORI + '</td></tr>' + '<tr><td>Rak</td><td>:</td><td>' + book['KODE RAK'] + '</td></tr></table>' + '</div>' + '<div class="buku-qr">' + '<img src="' + qrUrl + '" style="width: 70px; height: 70px; border: 1px solid #333;">' + '<div class="kode-buku-text">' + kodeBuku + '</div>' + '</div>' + '</div>' + '</div></body></html>'; const printWindow = window.open('', 'Print Book Label'); html += '<script>let pr=false; const doPr=()=>{if(pr)return;pr=true;setTimeout(()=>{window.print();window.close();},500);}; window.onload=doPr; setTimeout(doPr, 8000);</script>'; printWindow.document.write(html); printWindow.document.close(); printWindow.focus(); setTimeout(() => { apiCall('updateStatusCetak', { type: 'buku', kodeList: JSON.stringify([kodeBuku]) }).then(() => loadAllBooks()).catch(err => console.error('Gagal update status cetak:', err)) }, 1000) }
if (book['STATUS CETAK'] === 'DICETAK') { showConfirm(`Label buku ${kodeBuku} sudah pernah dicetak. Yakin ingin mencetak ulang?`, () => { doPrint() }) } else { doPrint() }
}
function bulkPrintBooks() {
if (allBooks.length === 0) { showAlert('Tidak ada data buku', 'warning'); return }
let html = '<html><head><meta charset="UTF-8"><style>' + '* {box-sizing: border-box; margin: 0; padding: 0;}' + '@page {size: portrait; margin: 10mm;}' + 'body {font-family: "Courier New", Courier, monospace; background: white; font-size: 12px;}' + '.container-buku {display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;}' + '.label-buku {border: 1px solid #333; background: white; padding: 15px; display: flex; align-items: flex-start; min-height: 120px; page-break-inside: avoid;}' + '.buku-info {flex: 2; font-size: 12px;}' + '.buku-qr {flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;}' + '.detail-table {border-collapse: collapse; margin: 0; width: 100%;}' + '.detail-table td {padding: 2px 4px; font-size: 12px; vertical-align: top;}' + '.detail-table td:first-child {width: 85px; text-align: left;}' + '.detail-table td:nth-child(2) {width: 8px; text-align: center;}' + '.detail-table td:nth-child(3) {text-align: left;}' + '.kode-buku-text {margin-top: 3px; font-weight: bold; font-size: 10px; text-align: center;}' + '.page-buku {page-break-before: always;}' + '.page-buku:first-child {page-break-before: avoid;}' + '@media print {body {margin: 0; padding: 0; background: white;} @page {margin: 10mm;} .container-buku {page-break-inside: auto;}}' + '</style></head><body>'; let labelsOnPage = 0; let pageOpen = !1; allBooks.forEach((book, index) => {
if (labelsOnPage === 0) {
if (pageOpen) { html += '</div>' }
html += '<div class="page-buku"><div class="container-buku">'; pageOpen = !0
}
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(book['KODE BUKU'])}`; html += '<div class="label-buku">' + '<div class="buku-info">' + '<table class="detail-table"><tr><td>Judul</td><td>:</td><td><strong>' + book['JUDUL BUKU'] + '</strong></td></tr>' + '<tr><td>Pengarang</td><td>:</td><td>' + book.PENGARANG + '</td></tr>' + '<tr><td>Penerbit</td><td>:</td><td>' + book.PENERBIT + ' (' + book.TAHUN + ')</td></tr>' + '<tr><td>Kategori</td><td>:</td><td>' + book.KATEGORI + '</td></tr>' + '<tr><td>Rak</td><td>:</td><td>' + book['KODE RAK'] + '</td></tr></table>' + '</div>' + '<div class="buku-qr">' + '<img src="' + qrUrl + '" class="qr-code-preview">' + '<div class="kode-buku-text">' + book['KODE BUKU'] + '</div>' + '</div>' + '</div>'; labelsOnPage++; if (labelsOnPage === 8 || index === allBooks.length - 1) { labelsOnPage = 0 }
}); if (pageOpen) { html += '</div></div>' }
html += '</body></html>'; const printWindow = window.open('', 'Bulk Print Books'); html += '<script>let pr=false; const doPr=()=>{if(pr)return;pr=true;setTimeout(()=>{window.print();window.close();},1000);}; window.onload=doPr; setTimeout(doPr, 12000);</script>'; printWindow.document.write(html); printWindow.document.close(); printWindow.focus()
}
function switchTab(tabName) {
document.querySelectorAll('.tab-content').forEach(tab => { tab.classList.remove('active')
if (tabName === 'donasi') {
loadDonations();
}
}); document.querySelectorAll('.tab-btn').forEach(btn => { btn.classList.remove('active') }); document.getElementById(tabName).classList.add('active'); if (window.event && window.event.currentTarget) { window.event.currentTarget.classList.add('active') } else if (window.event && window.event.target) { window.event.target.closest('.tab-btn')?.classList.add('active') }
const titleMap = { 'scanner': 'Scanner & Transaksi', 'statistik': 'Statistik Perpustakaan', 'transaksi': 'Data Transaksi', 'overdued': 'Data Keterlambatan', 'anggota': 'Data Anggota', 'buku': 'Data Buku', 'qrgen': 'Cetak Label & Kartu', 'kunjungan': 'Data Kunjungan', 'admin': 'Pengaturan Admin' }; const subtitleEl = document.getElementById('topbarSubtitle'); if (subtitleEl) { subtitleEl.innerText = titleMap[tabName] || 'Overview' }
switch (tabName) { case 'anggota': loadAllMembers(); break; case 'buku': loadAllBooks(); break; case 'transaksi': loadTransaksi(); break; case 'overdued': loadOverdue(); break; case 'kunjungan': loadKunjungan(); break; case 'statistik': refreshStatistik(); break }
}
function openModal(modalId) { document.getElementById(modalId).classList.add('active') }
function closeModal(modalId) { document.getElementById(modalId).classList.remove('active') }
function toggleScanner() { scannerActive = !scannerActive; const btn = event.target.closest('button'); const statusBadge = document.getElementById('scannerStatus'); const statusText = document.getElementById('statusText'); const statusLight = document.getElementById('statusLight'); const readerElement = document.getElementById('reader'); if (scannerActive) { btn.classList.remove('btn-danger'); btn.classList.add('btn-success'); btn.innerHTML = '<i class="fas fa-stop-circle"></i> Hentikan Scanner'; statusBadge.classList.remove('scanner-off'); statusBadge.classList.add('scanner-on'); statusText.textContent = 'Siap Scanning'; statusLight.classList.remove('status-inactive'); readerElement.classList.remove('scanner-inactive'); readerElement.classList.add('scanner-active'); const qrCanvas = document.getElementById('qrCanvas'); if (qrCanvas) qrCanvas.style.display = 'none'; if (!scanner || !scanner.isScanning) { initializeScanner() } } else { btn.classList.remove('btn-success'); btn.classList.add('btn-danger'); btn.innerHTML = '<i class="fas fa-play-circle"></i> Mulai Scanner'; statusBadge.classList.remove('scanner-on'); statusBadge.classList.add('scanner-off'); statusText.textContent = 'Scanner OFF'; statusLight.classList.add('status-inactive'); readerElement.classList.remove('scanner-active'); readerElement.classList.add('scanner-inactive'); const qrCanvas = document.getElementById('qrCanvas'); if (qrCanvas) qrCanvas.style.display = 'block'; if (scanner) { scanner.stop().then(() => { scanner = null }).catch(err => { console.log('Scanner stop error (ignore):', err); scanner = null }) } } }
function resetScanner() {
currentMember = null; currentBook = null; document.getElementById('memberInfo').innerHTML = `
<div class="detail-item">
<span class="detail-label">Status</span>
<span class="detail-value">-</span>
</div>
`; document.getElementById('bookInfo').innerHTML = `
<div class="detail-item">
<span class="detail-label">Status</span>
<span class="detail-value">-</span>
</div>
`; document.getElementById('lamaPinjam').value = '7'; showAlert('Scanner direset', 'info')
}
function formatDate(dateStr) { if (!dateStr) return '-'; const date = new Date(dateStr); const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}` }
function formatDateTime(dateStr) { if (!dateStr) return '-'; const date = new Date(dateStr); const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`; return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${time}` }
function viewTransaction(noTransaksi) {
const trx = allTransactions.find(t => t['No Transaksi'] == noTransaksi); if (trx) {
const html = `
<div style="text-align: left;">
<p><strong>No Transaksi:</strong> ${noTransaksi}</p>
<p><strong>Status:</strong> <span style="padding: 5px 10px; border-radius: 4px; background: ${trx['Status'] === 'DIPINJAM' ? '#fef3c7' : '#d1fae5'}; color: ${trx['Status'] === 'DIPINJAM' ? '#92400e' : '#065f46'};">${trx['Status']}</span></p>
<p><strong>Tanggal Pinjam:</strong> ${formatDate(trx['Tgl Pinjam'])}</p>
<p><strong>Jatuh Tempo:</strong> ${formatDate(trx['Jatuh Tempo'])}</p>
</div>
`; Swal.fire({ title: 'Detail Transaksi', html: html, icon: 'info', confirmButtonText: 'Tutup', confirmButtonColor: '#667eea' })
}
}
function loadAllData() { showLoading('Memuat data...'); Promise.all([loadAllMembers(), loadAllBooks(), loadTransaksi(), loadKunjungan(), refreshStatistik()]).then(() => { hideLoading(); showAlert('Data berhasil dimuat', 'success') }).catch(err => { hideLoading(); showAlert(`Error loading data: ${err}`, 'error') }) }
let allKunjungan = []; function loadKunjungan() { return apiCall('getKunjungan', {}).then(data => { allKunjungan = Array.isArray(data) ? data : []; displayKunjunganTable(allKunjungan); updateKunjunganStats(allKunjungan); calculateTopKunjungan(allKunjungan) }).catch(err => showAlert(`Gagal load kunjungan: ${err}`, 'error')) }
function displayKunjunganTable(kunjungan) {
const tbody = document.getElementById('kunjunganTable'); if (!kunjungan || kunjungan.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada data kunjungan</td></tr>'; return }
const sorted = [...kunjungan].sort((a, b) => new Date(b['Tgl Kunjungan']) - new Date(a['Tgl Kunjungan'])); tbody.innerHTML = sorted.map((k, index) => {
const member = allMembers.find(m => m.KODE === k['Kode Anggota']); const nama = member ? member.NAMA : '-'; const tipe = member ? member.TIPE : '-'; const keterangan = member ? member.KETERANGAN : '-'; return `
<tr>
<td>${index + 1}</td>
<td>${formatDateTime(k['Tgl Kunjungan'])}</td>
<td><strong>${k['Kode Anggota']}</strong></td>
<td>${nama}</td>
<td>${tipe}</td>
<td>${keterangan}</td>
</tr>
`}).join('')
}
function updateKunjunganStats(kunjungan) {
if (!kunjungan || kunjungan.length === 0) { document.getElementById('statTotalKunjungan').textContent = '0'; document.getElementById('statKunjunganHariIni').textContent = '0'; document.getElementById('statAnggotaUnik').textContent = '0'; return }
document.getElementById('statTotalKunjungan').textContent = kunjungan.length; const today = new Date().toISOString().split('T')[0]; const todayVisits = kunjungan.filter(k => k['Tgl Kunjungan'].startsWith(today)).length; document.getElementById('statKunjunganHariIni').textContent = todayVisits; const uniqueMembers = new Set(kunjungan.map(k => k['Kode Anggota'])); document.getElementById('statAnggotaUnik').textContent = uniqueMembers.size
}
function filterKunjungan() {
const tglEl = document.getElementById('filterKunjunganTgl'); const tgl = tglEl ? tglEl.value : ''; const anggotaEl = document.getElementById('filterKunjunganAnggota'); const q = anggotaEl ? anggotaEl.value.trim().toLowerCase() : ''; let filtered = allKunjungan || []; if (tgl) { filtered = filtered.filter(k => (k['Tgl Kunjungan'] || '').startsWith(tgl)) }
if (q) { filtered = filtered.filter(k => { const kode = (k['Kode Anggota'] || '').toLowerCase(); const nama = (k['Nama'] || '').toLowerCase(); const ket = (k['Keterangan'] || '').toLowerCase(); const member = allMembers.find(m => (m.KODE || '').toLowerCase() === kode); const mNama = member ? (member.NAMA || '').toLowerCase() : ''; return kode.includes(q) || nama.includes(q) || ket.includes(q) || mNama.includes(q) }) }
displayKunjunganTable(filtered); updateKunjunganStats(filtered)
}
function resetKunjunganFilter() { document.getElementById('filterKunjunganTgl').value = ''; document.getElementById('filterKunjunganAnggota').value = ''; displayKunjunganTable(allKunjungan); updateKunjunganStats(allKunjungan) }
function logMemberVisit(kodeAnggota) { apiCall('logKunjungan', { kodeAnggota: kodeAnggota }).then(data => { const waktu = data?.waktu || new Date().toLocaleString(); showAlert(`Kunjungan tercatat: ${waktu}`, 'success'); loadKunjungan() }).catch(err => { console.log('Visit logging error:', err) }) }
window.addEventListener('click', function (event) { if (event.target.classList.contains('modal')) { event.target.classList.remove('active'); event.target.style.display = '' } }); function initQRAnimation() {
const canvas = document.getElementById('qrCanvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); const gridSize = 25; const cellSize = canvas.width / gridSize; let qrMatrix = []; let blackPixels = []; let revealedIndex = 0; let animState = 'forming'; function generateQRMatrix() {
qrMatrix = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0)); blackPixels = []; for (let r = 0; r < gridSize; r++) { for (let c = 0; c < gridSize; c++) { if (Math.random() > 0.5) qrMatrix[r][c] = 1 } }
const drawFinder = (startR, startC) => {
for (let r = 0; r < 7; r++) { for (let c = 0; c < 7; c++) { const isBorder = (r === 0 || r === 6 || c === 0 || c === 6); const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4); qrMatrix[startR + r][startC + c] = (isBorder || isCenter) ? 1 : 0 } }
for (let r = -1; r <= 7; r++) { for (let c = -1; c <= 7; c++) { const currR = startR + r; const currC = startC + c; if (currR >= 0 && currR < gridSize && currC >= 0 && currC < gridSize) { if (r === -1 || r === 7 || c === -1 || c === 7) { qrMatrix[currR][currC] = 0 } } } }
}; drawFinder(0, 0); drawFinder(0, gridSize - 7); drawFinder(gridSize - 7, 0); for (let r = 0; r < gridSize; r++) { for (let c = 0; c < gridSize; c++) { if (qrMatrix[r][c] === 1) { blackPixels.push({ r, c }) } } }
for (let i = blackPixels.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[blackPixels[i], blackPixels[j]] = [blackPixels[j], blackPixels[i]] }
}
function draw(count) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#000000'; for (let i = 0; i < count; i++) { const p = blackPixels[i]; ctx.fillRect(p.c * cellSize, p.r * cellSize, cellSize, cellSize) } }
function updateAnimation() {
if (animState === 'forming') { revealedIndex += 8; if (revealedIndex >= blackPixels.length) { revealedIndex = blackPixels.length; draw(revealedIndex); animState = 'hold'; setTimeout(() => { animState = 'erasing' }, 1200) } else { draw(revealedIndex) } } else if (animState === 'erasing') { revealedIndex = 0; draw(0); animState = 'waiting'; setTimeout(() => { generateQRMatrix(); animState = 'forming' }, 500) }
requestAnimationFrame(updateAnimation)
}
generateQRMatrix(); updateAnimation()
}
document.addEventListener('DOMContentLoaded', () => { initQRAnimation() }); let barcodeBuffer = ''; let barcodeTimeout = null; document.addEventListener('keydown', function (e) {
if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) { return }
if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) { barcodeBuffer += e.key; clearTimeout(barcodeTimeout); barcodeTimeout = setTimeout(() => { barcodeBuffer = '' }, 50) }
if (e.key === 'Enter' && barcodeBuffer.length > 0) {
e.preventDefault(); const scannedCode = barcodeBuffer.trim(); barcodeBuffer = ''; clearTimeout(barcodeTimeout); if (scannedCode) {
console.log('Input terdeteksi dari Hardware Scanner:', scannedCode); const scannerBtn = document.querySelector('.tab-btn[onclick="switchTab(\'scanner\')"]'); if (scannerBtn && !scannerBtn.classList.contains('active')) { scannerBtn.click() }
processQRCode(scannedCode)
}
}
}); function markAsPrinted(type, kode) { showConfirm(`Tandai ${kode} sebagai sudah dicetak?`, () => { apiCall('updateStatusCetak', { type: type, kode: kode }).then(res => { showAlert(res.message, 'success'); if (type === 'anggota') loadAllMembers(); else loadAllBooks() }).catch(err => showAlert(`Gagal mengupdate status: ${err}`, 'error')) }) }
function calculateTopKunjungan(kunjunganData) {
const counts = {}; kunjunganData.forEach(k => { const kode = k['Kode Anggota']; if (kode) counts[kode] = (counts[kode] || 0) + 1 }); const sortedKodes = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 5); const tbody = document.getElementById('topKunjunganTable'); if (sortedKodes.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada kunjungan</td></tr>'; return }
tbody.innerHTML = sortedKodes.map((kode, index) => {
const member = allMembers.find(m => m.KODE === kode) || {}; return `
<tr>
<td><span class="badge badge-kembali" style="background-color:#F59E0B; color:white; padding:4px 8px; border-radius:4px;">#${index + 1}</span></td>
<td>${kode}</td>
<td>${member['NAMA'] || '-'}</td>
<td>${member['TIPE'] || '-'}</td>
<td><strong>${counts[kode]}</strong> kali</td>
</tr>
`}).join('')
}
function handleResetData() {
Swal.fire({
title: '<i class="fas fa-sync-alt" style="color: #EF4444;"></i> Reset Operasional Sirkulasi', html: `
<div style="text-align: left; font-size: 0.92rem; line-height: 1.8; color: #475569;">
<p style="margin-bottom: 12px;">Proses tutup periode / reset operasional ini akan:</p>
<div style="background: #F8FAFC; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
<i class="fas fa-book" style="color: #10B981; width: 16px;"></i>
<span>Pulihkan stok seluruh buku ke kondisi tersedia (100%)</span>
</div>
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
<i class="fas fa-exchange-alt" style="color: #667eea; width: 16px;"></i>
<span>Selesaikan seluruh sisa peminjaman aktif yang belum kembali</span>
</div>
<div style="display: flex; align-items: center; gap: 8px;">
<i class="fas fa-shield-alt" style="color: #059669; width: 16px;"></i>
<span>Kode anggota (SSOT NIS) & kode rak buku tetap aman</span>
</div>
</div>
<p style="color: #EF4444; font-weight: 600; margin: 0;">⚠️ Tindakan ini menyetel ulang status sirkulasi buku.</p>
</div>
`, icon: 'warning', showCancelButton: !0, confirmButtonText: '<i class="fas fa-check"></i> Ya, Lanjutkan', cancelButtonText: '<i class="fas fa-times"></i> Batal', confirmButtonColor: '#EF4444', cancelButtonColor: '#6b7280', focusCancel: !0, customClass: { popup: 'swal-wide' }
}).then((result) => {
if (result.isConfirmed) {
Swal.fire({
title: 'Konfirmasi Akhir', html: `
<p style="font-size: 0.92rem; color: #64748b; margin-bottom: 15px;">
Ketik <strong style="color: #EF4444;">RESET</strong> untuk mengkonfirmasi:
</p>
<input type="text" id="resetConfirmInput" class="swal2-input" placeholder="Ketik RESET di sini" style="text-transform: uppercase; font-weight: 600; letter-spacing: 2px;">
`, icon: 'warning', showCancelButton: !0, confirmButtonText: '<i class="fas fa-sync-alt"></i> Proses Reset Sekarang', cancelButtonText: 'Batal', confirmButtonColor: '#EF4444', cancelButtonColor: '#6b7280', focusCancel: !0, preConfirm: () => {
const inputVal = document.getElementById('resetConfirmInput').value.trim().toUpperCase(); if (inputVal !== 'RESET') { Swal.showValidationMessage('Ketik RESET untuk melanjutkan'); return !1 }
return !0
}
}).then((result2) => { if (result2.isConfirmed) { executeResetData() } })
}
})
}
function executeResetData() {
showLoading('Sedang mereset operasional sirkulasi...\nMohon tunggu...'); const btnReset = document.getElementById('btnResetData'); if (btnReset) btnReset.disabled = !0; apiCall('resetData', {}).then(data => {
hideLoading(); if (btnReset) btnReset.disabled = !1; Swal.fire({
title: '<i class="fas fa-check-circle" style="color: #10B981;"></i> Reset Berhasil!', html: `
<div style="text-align: left; font-size: 0.92rem; line-height: 1.8; color: #475569;">
<div style="background: linear-gradient(135deg, #ECFDF5, #D1FAE5); padding: 16px; border-radius: 10px; margin-bottom: 12px;">
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
<i class="fas fa-book" style="color: #059669;"></i>
<strong>${data.bukuCount || 0} buku</strong> stok berhasil dipulihkan
</div>
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
<i class="fas fa-exchange-alt" style="color: #059669;"></i>
<strong>${data.transaksiCount || 0} transaksi aktif</strong> diselesaikan
</div>
<div style="display: flex; align-items: center; gap: 8px;">
<i class="fas fa-users" style="color: #059669;"></i>
<strong>${data.anggotaCount || 0} anggota</strong> kuota siap digunakan
</div>
</div>
<p style="margin: 0; color: #64748b; font-size: 0.85rem;">
<i class="fas fa-info-circle"></i>
Master data siswa (SSOT NIS) dan kode rak buku tetap terjaga utuh.
</p>
</div>
`, icon: 'success', confirmButtonText: 'Selesai', confirmButtonColor: '#667eea'
}); loadAllData()
}).catch(err => { hideLoading(); if (btnReset) btnReset.disabled = !1; Swal.fire({ title: 'Gagal Reset Data', text: err, icon: 'error', confirmButtonText: 'OK', confirmButtonColor: '#667eea' }) })
}
function initEventBindings() { const bindForm = (id, handler) => { const form = document.getElementById(id); if (form) form.addEventListener('submit', handler); }; bindForm('loginForm', handleLogin); bindForm('updateProfileForm', handleUpdateProfile); bindForm('changePasswordForm', handleChangePassword); bindForm('anggotaForm', saveAnggota); bindForm('bukuForm', saveBuku);  const bindChange = (id, handler, event = 'change') => { const el = document.getElementById(id); if (el) el.addEventListener(event, handler); }; bindChange('selectAllMembers', (e) => toggleSelectAllMembers(e.target.checked)); bindChange('selectAllBooks', (e) => toggleSelectAllBooks(e.target.checked));  bindChange('filterStatus', filterTransaksi); bindChange('filterAnggota', filterTransaksi, 'input'); bindChange('filterAnggota', filterTransaksi, 'keyup'); bindChange('photoUpload', handlePhotoUpload); bindChange('searchAnggotaInput', () => filterAnggotaTable(!0), 'input'); bindChange('searchAnggotaInput', () => filterAnggotaTable(!0), 'keyup'); bindChange('searchBukuInput', () => filterBukuTable(!0), 'input'); bindChange('searchBukuInput', () => filterBukuTable(!0), 'keyup'); bindChange('memberSearchInput', (e) => { if (e.key === 'Enter') searchMember(); }, 'keydown'); bindChange('bookSearchInput', (e) => { if (e.key === 'Enter') searchBook(); }, 'keydown'); bindChange('formKodeRak', updateFormKodeBukuPreview, 'input'); bindChange('formKategori', updateFormKodeBukuPreview, 'input'); bindChange('memberSearchInput', searchMember, 'input'); bindChange('bookSearchInput', searchBook, 'input'); bindChange('filterKunjunganTgl', filterKunjungan, 'change'); bindChange('filterKunjunganTgl', filterKunjungan, 'input'); bindChange('filterKunjunganAnggota', filterKunjungan, 'input'); bindChange('filterKunjunganAnggota', filterKunjungan, 'keyup'); bindChange('formTipeAnggota', updateFormKodeAnggotaUI); bindChange('formKodeAnggota', (e) => { if (document.getElementById('formTipeAnggota').value === 'Siswa' && !e.target.hasAttribute('readonly')) lookupStudentByNis(e.target.value); }); bindChange('formKodeAnggota', (e) => { if (document.getElementById('formTipeAnggota').value === 'Siswa' && !e.target.hasAttribute('readonly')) lookupStudentByNis(e.target.value); }, 'blur');  document.body.addEventListener('click', (e) => { const btn = e.target.closest('[data-action]'); if (!btn) return; const action = btn.getAttribute('data-action'); switch (action) { case 'togglePassword': togglePassword(); break; case 'handleLogout': handleLogout(); break; case 'toggleScanner': toggleScanner(); break; case 'prosesPinjam': prosesPinjam(); break; case 'prosesKembali': prosesKembali(); break; case 'resetScanner': resetScanner(); break; case 'refreshStatistik': refreshStatistik(); break; case 'loadTransaksi': loadTransaksi(); break; case 'loadOverdue': loadOverdue(); break; case 'loadKunjungan': loadKunjungan(); break; case 'loadDonations': loadDonations(); break; case 'exportTransaksi': exportTransaksi(); break; case 'openAddAnggotaModal': openAddAnggotaModal(); break;  case 'confirmBulkPrintMembers': confirmBulkPrintMembers(); break; case 'searchMember': searchMember(); break; case 'openAddBukuModal': openAddBukuModal(); break; case 'confirmBulkPrintBooks': confirmBulkPrintBooks(); break; case 'searchBook': searchBook(); break; case 'filterKunjungan': filterKunjungan(); break; case 'resetKunjunganFilter': resetKunjunganFilter(); break; case 'confirmReturn': confirmReturn(); break; case 'handleResetData': handleResetData(); break; case 'triggerPhotoUpload': document.getElementById('photoUpload').click(); break; case 'markAsPrinted': markAsPrinted(btn.getAttribute('data-type'), btn.getAttribute('data-id')); break; case 'toggleRowCheckbox': toggleRowCheckbox(e, btn.closest('tr'), btn.getAttribute('data-checkbox')); break; case 'updateMemberSelection': updateMemberSelection(); break; case 'updateBookSelection': updateBookSelection(); break; case 'editAnggota': editAnggota(btn.getAttribute('data-id')); break; case 'editBuku': editBuku(btn.getAttribute('data-id')); break; case 'prevPageAnggota': window.currentPageAnggota--; filterAnggotaTable(); break; case 'nextPageAnggota': window.currentPageAnggota++; filterAnggotaTable(); break; case 'showAllAnggota': window.showAllAnggota = !0; filterAnggotaTable(); break; case 'hideAllAnggota': window.showAllAnggota = !1; filterAnggotaTable(); break; case 'prevPageBooks': window.currentPageBooks--; filterBukuTable(); break; case 'nextPageBooks': window.currentPageBooks++; filterBukuTable(); break; case 'showAllBooks': window.showAllBooks = !0; filterBukuTable(); break; case 'hideAllBooks': window.showAllBooks = !1; filterBukuTable(); break; case 'viewTransaction': viewTransaction(btn.getAttribute('data-id')); break; case 'openReturnForOverdue': openReturnForOverdue(btn.getAttribute('data-id')); break; case 'printMemberCard': printMemberCard(btn.getAttribute('data-id')); break; case 'printBookLabel': printBookLabel(btn.getAttribute('data-id')); break; case 'selectivePrint': Swal.close(); const typeP = document.getElementById('bukuTable').closest('.tab-content').classList.contains('active') ? 'buku' : 'anggota'; if (typeP === 'anggota') selectivePrintMembers(); else selectivePrintBooks(); break; case 'bulkDelete': Swal.close(); const typeD = document.getElementById('bukuTable').closest('.tab-content').classList.contains('active') ? 'buku' : 'anggota'; if (typeD === 'anggota') bulkDeleteMembers(); else bulkDeleteBooks(); break;
case 'syncMasterData':
Swal.fire({
title: 'Sinkronisasi Master Data?',
text: 'Sistem akan memeriksa master data Siswa dan GTK MUSADA di RTDB, lalu menambahkan yang belum ada ke database anggota perpustakaan.',
icon: 'question',
showCancelButton: true,
confirmButtonText: 'Sinkronkan Sekarang',
cancelButtonText: 'Batal'
}).then(res => {
if (res.isConfirmed) {
Swal.showLoading();
DBLibrary.syncMembersFromMaster().then(count => {
Swal.fire('Selesai', `Berhasil menyinkronkan ${count} anggota baru dari database sekolah!`, 'success');
loadAllMembers();
}).catch(e => {
Swal.fire('Gagal', e.message, 'error');
});
}
});
break;
case 'switchTab': switchTab(btn.getAttribute('data-tab')); break; case 'closeModal': closeModal(btn.getAttribute('data-modal')); break; case 'openBulkActions': openBulkActions(btn.getAttribute('data-type')); break; case 'switchPrintMode': switchPrintMode(btn.getAttribute('data-mode')); break; case 'switchToSelectiveMode': switchToSelectiveMode(btn.getAttribute('data-type')); break } }) }
document.addEventListener('DOMContentLoaded', () => { initEventBindings() })
async function loadDonations() {
const tbody = document.getElementById('donationsTableBody');
if (!tbody) return;
try {
const donations = await DBLibrary.getDonations();
if (!donations.length) {
tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Belum ada donasi yang tercatat.</td></tr>';
return;
}
tbody.innerHTML = donations.map(d => {
const isMoney = d.type === 'dana';
const typeBadge = isMoney
? '<span style="background:#FEF3C7; color:#92400E; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">Dana / Infaq</span>'
: '<span style="background:#D1FAE5; color:#065F46; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">Buku Fisik</span>';
const detailText = isMoney ? `Rp ${(parseInt(d.amount, 10)||0).toLocaleString('id-ID')}` : `${d.bookCount || 0} Buku: ${d.bookTitles || '-'}`;
const statusBadge = d.status === 'verified'
? '<span style="color:#059669; font-weight:700;"><i class="fas fa-check-circle"></i> Terverifikasi</span>'
: '<span style="color:#D97706; font-weight:700;"><i class="fas fa-clock"></i> Menunggu</span>';
const verifyBtn = d.status !== 'verified'
? `<button type="button" class="btn-xs btn-success btn-verify-donasi" data-id="${d.id}"><i class="fas fa-check"></i> Verifikasi</button>`
: `<button type="button" class="btn-xs btn-secondary btn-unverify-donasi" data-id="${d.id}"><i class="fas fa-undo"></i> Batal</button>`;
return `
<tr>
<td>${d.date || '-'}</td>
<td>${typeBadge}</td>
<td><strong>${d.donorName}</strong></td>
<td>${d.phone || '-'}</td>
<td>${detailText}</td>
<td>${d.notes || '-'}</td>
<td>${statusBadge}</td>
<td>${verifyBtn}</td>
</tr>
`;
}).join('');
tbody.querySelectorAll('.btn-verify-donasi').forEach(b => {
b.onclick = async () => {
await DBLibrary.updateDonationStatus(b.dataset.id, 'verified');
Swal.fire('Berhasil', 'Donasi berhasil diverifikasi.', 'success');
loadDonations();
};
});
tbody.querySelectorAll('.btn-unverify-donasi').forEach(b => {
b.onclick = async () => {
await DBLibrary.updateDonationStatus(b.dataset.id, 'pending');
loadDonations();
};
});
} catch (err) {
console.error('Error load donations:', err);
}
}
