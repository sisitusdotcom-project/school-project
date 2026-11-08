document.addEventListener('DOMContentLoaded', () => {
const spmbForm = document.getElementById('spmbForm');
const penyakitSelect = document.getElementById('penyakit');
const penyakitLainnya = document.getElementById('penyakit_lainnya');
const statusCheckBtn = document.getElementById('cekStatusBtn');
const statusCheckInput = document.getElementById('statusCheckInput');
const statusCheckResult = document.getElementById('statusCheckResult');
const successContainer = document.getElementById('spmbSuccessContainer');
if (penyakitSelect && penyakitLainnya) {
penyakitSelect.addEventListener('change', () => {
if (penyakitSelect.value === 'Lainnya') {
penyakitLainnya.classList.remove('hidden');
penyakitLainnya.setAttribute('required', 'required');
} else {
penyakitLainnya.classList.add('hidden');
penyakitLainnya.removeAttribute('required');
penyakitLainnya.value = '';
}
});
}
if (spmbForm) {
spmbForm.addEventListener('submit', async (event) => {
event.preventDefault();
const nisn = spmbForm.querySelector('[name="nisn"]');
const emailOrangtua = spmbForm.querySelector('[name="email_orangtua"]');
const nik = spmbForm.querySelector('[name="nik"]');
if (nisn && emailOrangtua) {
const nisnVal = (nisn.value || '').trim();
const emailVal = (emailOrangtua.value || '').trim();
if (!nisnVal && !emailVal) {
alert('Harap isi minimal salah satu: NISN atau Email Orang Tua / Wali.');
emailOrangtua.focus();
return;
}
}
if (nik && nik.value.trim().length !== 16) {
alert('NIK harus berisi 16 digit angka.');
nik.focus();
return;
}
if (!spmbForm.reportValidity()) return;
const btnSubmit = spmbForm.querySelector('button[type="submit"]');
if (btnSubmit) {
btnSubmit.disabled = true;
btnSubmit.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Mendaftarkan & Menerbitkan Akun...';
}
try {
const apiKey = (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey) || 'AIzaSyC9csv8TECoXln6CiAhRoj2tBJ8p3-sN-0';
const defaultPwd = 'Password123!';
const tempEmail = 'spmb_temp_' + Date.now() + '@musada.sch.id';
const tempRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + apiKey, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email: tempEmail, password: defaultPwd, returnSecureToken: true })
});
const tempData = await tempRes.json();
const tempToken = tempData.idToken;
const [spmbRes, stuRes] = await Promise.all([
fetch('https://musada-sd-default-rtdb.firebaseio.com/spmb_registrations.json?auth=' + tempToken),
fetch('https://musada-sd-default-rtdb.firebaseio.com/students.json?auth=' + tempToken)
]);
const spmbVal = await spmbRes.json() || {};
const stuVal = await stuRes.json() || {};
let maxNis = 996;
Object.values(spmbVal).forEach(r => {
if (r && r.nis) {
const n = parseInt(r.nis, 10);
if (!isNaN(n) && n > maxNis) maxNis = n;
}
});
Object.values(stuVal).forEach(s => {
if (s && s.nis) {
const n = parseInt(s.nis, 10);
if (!isNaN(n) && n > maxNis) maxNis = n;
}
});
const nextNum = maxNis + 1;
const nextNisStr = String(nextNum).padStart(4, '0');
if (tempToken) {
fetch('https://identitytoolkit.googleapis.com/v1/accounts:delete?key=' + apiKey, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ idToken: tempToken })
}).catch(() => {});
}
const emailLogin = 'siswa' + nextNisStr + '@musada.sch.id';
const officialRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + apiKey, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email: emailLogin, password: defaultPwd, returnSecureToken: true })
});
const officialData = await officialRes.json();
const officialToken = officialData.idToken;
const officialUid = officialData.localId;
const formData = new FormData(spmbForm);
const payload = Object.fromEntries(formData.entries());
payload.nama_lengkap = payload.nama_siswa || '';
payload.nis = nextNisStr;
payload.status = 'Calon Siswa';
payload.isPraSd = true;
payload.parentId = officialUid;
payload.registrationTrack = payload.jalur || 'Reguler';
payload.timestamp = Date.now();
await Promise.all([
fetch('https://musada-sd-default-rtdb.firebaseio.com/spmb_registrations.json?auth=' + officialToken, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload)
}),
fetch('https://musada-sd-default-rtdb.firebaseio.com/users/' + officialUid + '.json?auth=' + officialToken, {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
name: payload.nama_siswa,
role: 'ortu',
isActive: true,
isPraSd: true,
status: 'Calon Siswa',
nis: nextNisStr,
email: emailLogin,
emailOrangtua: payload.email_orangtua || '',
phone: payload.telepon_orangtua || payload.wa_orangtua || '',
registrationTrack: payload.registrationTrack || payload.jalur || 'Reguler',
spmbData: payload,
createdAt: Date.now()
})
})
]);
if (successContainer) {
successContainer.innerHTML = '<div class="spmb-success-card"><div class="spmb-success-icon"><i class="ph ph-check-circle"></i></div><h4>Pendaftaran Berhasil! Akun Pra SD Siap Digunakan</h4><p>Data pendaftaran ananda <strong>' + payload.nama_siswa + '</strong> telah berhasil tersimpan dengan NIS unik resmi sekolah:</p><div class="spmb-cred-box"><div><strong>NIS Calon Siswa:</strong> <span class="badge badge-primary">' + nextNisStr + '</span></div><div><strong>Username Login:</strong> <code>' + nextNisStr + '</code> atau <code>' + emailLogin + '</code></div><div><strong>Password Standar:</strong> <code>Password123!</code></div></div><p class="small text-muted">Gunakan NIS dan password di atas untuk masuk langsung ke Dashboard Akun Pra SD tanpa menunggu.</p><a href="/login/#/dashboard" class="btn-view-more-inline spmb-button spmb-button--primary"><i class="ph ph-sign-in"></i> Buka Dashboard Akun Pra SD Sekarang</a></div>';
successContainer.scrollIntoView({ behavior: 'smooth' });
} else {
alert('Pendaftaran Berhasil! Nomor NIS: ' + nextNisStr + '. Password: Password123!');
}
spmbForm.reset();
if (penyakitLainnya) penyakitLainnya.classList.add('hidden');
} catch (err) {
console.error(err);
alert('Terjadi kesalahan saat memproses pendaftaran. Silakan coba sesaat lagi.');
} finally {
if (btnSubmit) {
btnSubmit.disabled = false;
btnSubmit.innerHTML = 'Kirim Pendaftaran';
}
}
});
}
if (statusCheckBtn && statusCheckInput) {
statusCheckBtn.addEventListener('click', async () => {
const val = statusCheckInput.value.trim();
if (!val) {
alert('Masukkan NIS atau Email Pendaftaran.');
statusCheckInput.focus();
return;
}
statusCheckBtn.disabled = true;
statusCheckBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Memeriksa...';
if (statusCheckResult) statusCheckResult.innerHTML = '';
try {
const cleanDigits = val.replace(/[^0-9]/g, '');
let emailToTry = val;
if (cleanDigits.length > 0 && cleanDigits.length <= 4 && !val.includes('@')) {
emailToTry = 'siswa' + cleanDigits.padStart(4, '0') + '@musada.sch.id';
}
const apiKey = (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey) || 'AIzaSyC9csv8TECoXln6CiAhRoj2tBJ8p3-sN-0';
const signInRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + apiKey, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email: emailToTry, password: 'Password123!', returnSecureToken: true })
});
const signData = await signInRes.json();
if (signData && signData.idToken && signData.localId) {
const uid = signData.localId;
const userRes = await fetch('https://musada-sd-default-rtdb.firebaseio.com/users/' + uid + '.json?auth=' + signData.idToken);
const userData = await userRes.json();
const stuName = (userData && userData.name) || 'Calon Siswa';
const stuNis = (userData && userData.nis) || (cleanDigits ? cleanDigits.padStart(4, '0') : '-');
const stuStatus = (userData && userData.status) || 'Calon Siswa';
if (statusCheckResult) {
statusCheckResult.innerHTML = '<div class="spmb-status-card"><div class="spmb-status-header"><div><h4 class="spmb-status-name">' + stuName + '</h4><div class="spmb-status-meta">NIS: <strong>' + stuNis + '</strong> · Login: <code>' + stuNis + '</code></div></div><span class="badge badge-success"><i class="ph ph-check-circle"></i> ' + stuStatus + '</span></div><p class="spmb-status-info">Pendaftaran Ananda terverifikasi resmi di database SPMB SD Muhammadiyah 1 Sedati. Anda dapat langsung memantau jadwal observasi ramah anak, kelengkapan berkas, dan administrasi sekolah.</p><a href="/login/#/dashboard" class="btn-view-more-inline spmb-button spmb-button--primary"><i class="ph ph-sign-in"></i> Buka Dashboard Akun Pra SD</a></div>';
} else {
alert('Status Ditemukan: ' + stuName + ' (NIS: ' + stuNis + ') - Status: ' + stuStatus);
}
} else if (signData && signData.error && signData.error.message === 'INVALID_PASSWORD') {
if (statusCheckResult) {
statusCheckResult.innerHTML = '<div class="spmb-status-card"><div class="spmb-status-header"><div><h4 class="spmb-status-name">Akun Terdaftar</h4><div class="spmb-status-meta">Email/NIS: <strong>' + val + '</strong></div></div><span class="badge badge-primary"><i class="ph ph-lock-key"></i> Terdaftar</span></div><p class="spmb-status-info">Akun Ananda terdaftar aktif dengan kata sandi kustom. Silakan langsung masuk ke Portal SD Musada.</p><a href="/login/#/dashboard" class="btn-view-more-inline spmb-button spmb-button--primary"><i class="ph ph-sign-in"></i> Buka Portal Login</a></div>';
}
} else {
if (statusCheckResult) {
statusCheckResult.innerHTML = '<div class="spmb-status-card spmb-status-notfound"><p class="spmb-status-info"><i class="ph ph-warning-circle"></i> Data pendaftaran tidak ditemukan untuk <strong>' + val + '</strong>. Pastikan memasukkan 4 digit NIS (contoh: 0998) atau email pendaftaran.</p></div>';
} else {
alert('Data pendaftaran tidak ditemukan untuk: ' + val);
}
}
} catch (err) {
console.error(err);
alert('Gagal memeriksa status. Silakan coba sesaat lagi.');
} finally {
statusCheckBtn.disabled = false;
statusCheckBtn.innerHTML = 'Cek Status';
}
});
}
});