import os
import sys

def apply_app_config():
    path = 'login/public/assets/js/app-config.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    anchor = "const APP_DEFAULTS = Object.freeze({"
    if anchor not in content:
        print("Anchor APP_DEFAULTS not found in app-config.js")
        return False

    motivation_code = '''const ATTENDANCE_MOTIVATIONS = Object.freeze([
{ text: 'Kasih sayang dan keikhlasan dalam mendidik adalah modal utama kemajuan umat.', author: 'KH. Ahmad Dahlan', category: 'Kutipan Tokoh', target: 'all' },
{ text: 'Siapa yang menempuh jalan untuk mencari ilmu, maka Allah akan mudahkan jalannya menuju surga.', author: 'HR. Muslim', category: 'Hadits Shahih', target: 'all' },
{ text: 'Allah akan meninggikan orang-orang yang beriman dan orang-orang yang diberi ilmu beberapa derajat.', author: 'QS. Al-Mujadilah: 11', category: 'Al-Qur\\'an Karim', target: 'all' },
{ text: 'Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani. Jadilah teladan dan penyemangat hari ini!', author: 'Ki Hajar Dewantara', category: 'Kutipan Tokoh', target: 'all' },
{ text: 'Mendidik satu insan dengan budi pekerti mulia lebih berharga daripada dunia dan segala isinya.', author: 'Ali bin Abi Thalib r.a.', category: 'Kutipan Sahabat', target: 'all' },
{ text: 'Pendidikan adalah senjata paling ampuh yang dapat Anda gunakan untuk mengubah dunia.', author: 'Nelson Mandela', category: 'Kutipan Tokoh', target: 'all' },
{ text: 'Kecantikan sejati seorang pendidik terpancar dari ketinggian adab dan ketulusan dalam mengamalkan ilmu.', author: 'Buya Hamka', category: 'Kutipan Tokoh', target: 'all' },
{ text: 'Setiap senyuman dan ketulusan yang Anda hadirkan hari ini adalah investasi masa depan generasi bangsa.', author: 'Semangat Pagi', category: 'Energi Positif', target: 'in' },
{ text: 'Pendidikan yang hebat lahir dari sinergi guru yang tangguh dan tenaga kependidikan yang tulus berdedikasi.', author: 'Apresiasi GTK', category: 'Apresiasi GTK', target: 'all' },
{ text: 'Awali presensi dengan niat mulia, jadikan ruang kelas dan ruang kerja kita sebagai ladang ibadah yang penuh berkah.', author: 'Niat Keikhlasan', category: 'Energi Positif', target: 'in' },
{ text: 'Anda mungkin tidak melihat hasilnya hari ini, tapi jejak kebaikan Anda akan membekas selamanya di hati para murid.', author: 'Dampak Nyata', category: 'Inspirasi', target: 'all' },
{ text: 'Mendidik bukan hanya mentransfer pengetahuan, tetapi menyalakan lentera karakter dan harapan baru setiap hari.', author: 'Fokus Proses', category: 'Inspirasi', target: 'all' },
{ text: 'Dari balik meja administrasi hingga ke depan ruang kelas, setiap peran Anda adalah kunci keunggulan sekolah.', author: 'Pahlawan Sekolah', category: 'Apresiasi GTK', target: 'all' },
{ text: 'Satu kalimat penyemangat dan keteladanan dari Anda hari ini dapat menerangi masa depan seorang murid.', author: 'Inspirasi Harian', category: 'Inspirasi', target: 'all' },
{ text: 'Tetaplah menjadi cahaya yang menuntun anak-anak bangsa menggapai mimpi dan cita-cita mulia mereka.', author: 'Refleksi Diri', category: 'Inspirasi', target: 'all' },
{ text: 'Sebaik-baik kalian adalah orang yang mempelajari Al-Qur\\'an dan mengajarkannya kepada sesama.', author: 'HR. Bukhari', category: 'Hadits Shahih', target: 'all' },
{ text: 'Setiap huruf Al-Qur\\'an yang dilantunkan para santri mengalirkan pahala jariyah tanpa henti bagi guru yang membimbingnya.', author: 'Keutamaan Mengajar Quran', category: 'Guru Ummi', target: 'all' },
{ text: 'Bimbinglah santri dengan kesabaran dan cinta, karena Anda sedang menuntun para penjaga kalam Ilahi.', author: 'Mutiara Al-Qur\\'an', category: 'Guru Ummi', target: 'all' },
{ text: 'Sekiranya hati kita suci dan ikhlas, niscaya kita tidak akan pernah jenuh mendampingi lantunan ayat suci Al-Qur\\'an.', author: 'Utsman bin Affan r.a.', category: 'Kutipan Sahabat', target: 'all' },
{ text: 'Alhamdulillah atas seluruh dedikasi Anda hari ini. Selamat beristirahat dan berkumpul kembali bersama keluarga tercinta.', author: 'Doa & Syukur', category: 'Refleksi Sore', target: 'out' }
]);
function getRandomAttendanceMotivation(options) {
const opts = options || {};
const isUmmi = !!opts.isUmmi;
const type = opts.type || 'in';
let pool = ATTENDANCE_MOTIVATIONS.filter(item => {
if (item.target === 'out' && type !== 'out') return false;
if (item.target === 'in' && type !== 'in') return false;
if (item.category === 'Guru Ummi' && !isUmmi) return false;
return true;
});
if (isUmmi && Math.random() < 0.6) {
const ummiPool = pool.filter(item => item.category === 'Guru Ummi' || item.author.includes('Bukhari') || item.author.includes('Utsman'));
if (ummiPool.length) return ummiPool[Math.floor(Math.random() * ummiPool.length)];
}
if (!pool.length) pool = ATTENDANCE_MOTIVATIONS;
return pool[Math.floor(Math.random() * pool.length)];
}
function showAttendanceSuccessModal(options) {
const opts = options || {};
const type = opts.type || 'in';
const timeStr = opts.timeStr || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const user = opts.user || null;
const isUmmi = opts.isUmmi !== undefined ? opts.isUmmi : (user ? isUserUmmi(user) : false);
const quote = opts.quote || getRandomAttendanceMotivation({ role: user?.role, isUmmi, type });
const typeLabel = type === 'out' ? 'Presensi Pulang' : 'Presensi Datang';
const now = new Date();
const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const dateFormatted = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
const oldModal = document.getElementById('modal-attendance-success');
if (oldModal) oldModal.remove();
const modal = document.createElement('div');
modal.id = 'modal-attendance-success';
modal.className = 'modal-overlay modal-attendance-overlay active';
modal.innerHTML = `<div class="modal modal-attendance-success"><div class="attendance-success-banner"><div class="attendance-success-icon-wrap"><i class="ph-bold ph-check-circle"></i></div><h3 class="attendance-success-title">${typeLabel} Berhasil!</h3><p class="attendance-success-time"><i class="ph ph-clock"></i> ${escapeHtml(timeStr)} WIB &bull; ${escapeHtml(dateFormatted)}</p></div><div class="attendance-quote-card"><div class="attendance-quote-header"><span class="attendance-quote-badge"><i class="ph-fill ph-quotes"></i> Mutiara Motivasi</span><span class="attendance-quote-tag">${escapeHtml(quote.category || 'Inspirasi')}</span></div><blockquote class="attendance-quote-text">“${escapeHtml(quote.text)}”</blockquote><div class="attendance-quote-author"><i class="ph ph-user-circle"></i><span class="attendance-quote-name">${escapeHtml(quote.author)}</span></div></div><div class="modal-footer attendance-success-footer"><button type="button" class="btn btn-primary btn-block" id="btn-close-attendance-modal"><i class="ph ph-arrow-right"></i> Lanjutkan Beraktivitas</button></div></div>`;
document.body.appendChild(modal);
const closeModal = () => {
modal.classList.remove('active');
setTimeout(() => {
if (modal.parentNode) modal.parentNode.removeChild(modal);
}, 200);
};
const closeBtn = modal.querySelector('#btn-close-attendance-modal');
if (closeBtn) closeBtn.onclick = closeModal;
modal.onclick = (e) => {
if (e.target === modal) closeModal();
};
const keyHandler = (e) => {
if (e.key === 'Escape') {
closeModal();
document.removeEventListener('keydown', keyHandler);
}
};
document.addEventListener('keydown', keyHandler);
return modal;
}
'''
    content = content.replace(anchor, motivation_code + "\n" + anchor)

    export_anchor = "resolveSalarySlipData\n});"
    new_export = "resolveSalarySlipData,\nATTENDANCE_MOTIVATIONS,\ngetRandomAttendanceMotivation,\nshowAttendanceSuccessModal\n});"
    if export_anchor not in content:
        print("Export anchor not found in app-config.js")
        return False
    content = content.replace(export_anchor, new_export)

    clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print("app-config.js successfully updated with motivations and SSOT modal helper")
    return True

def apply_guru_index():
    path = 'login/public/assets/js/pages/guru/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_alert = "alert('Presensi berhasil dicatat.');"
    new_modal = """const recordedTime = type === 'in' ? (payload.time_in || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })) : (payload.time_out || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
AppConfig.showAttendanceSuccessModal({ type, timeStr: recordedTime, user: Auth.userData || Auth.currentUser, isUmmi });"""

    if old_alert not in content:
        print("old_alert not found in guru/index.js")
        return False

    content = content.replace(old_alert, new_modal)
    clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print("pages/guru/index.js successfully updated to call AppConfig.showAttendanceSuccessModal")
    return True

def apply_components_css():
    path = 'login/public/assets/css/components.css'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_css = """.modal-attendance-overlay{background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:99999;}
.modal-attendance-success{max-width:480px;width:90%;border-radius:18px;background:#ffffff;box-shadow:0 20px 40px -10px rgba(0,0,0,0.22);padding:0;overflow:hidden;border:1px solid #E2E8F0;animation:modalScaleUp 0.22s cubic-bezier(0.16,1,0.3,1);}
@keyframes modalScaleUp{from{transform:scale(0.92);opacity:0;}to{transform:scale(1);opacity:1;}}
.attendance-success-banner{background:linear-gradient(135deg,#ECFDF5 0%,#F0FDF4 50%,#E0F2FE 100%);padding:24px 20px 16px;text-align:center;border-bottom:1px solid #E2E8F0;}
.attendance-success-icon-wrap{width:56px;height:56px;border-radius:50%;background:#10B981;color:#ffffff;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:32px;box-shadow:0 8px 18px -4px rgba(16,185,129,0.45);}
.attendance-success-title{font-family:'Outfit',sans-serif;font-size:20px;font-weight:700;color:#065F46;margin:0 0 4px;}
.attendance-success-time{font-size:12.5px;color:#047857;margin:0;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:500;}
.attendance-quote-card{padding:18px 20px;background:#F8FAFC;margin:16px 20px;border-radius:12px;border:1px solid #E2E8F0;border-left:4px solid #10B981;min-width:0;overflow-wrap:break-word;word-break:break-word;}
.attendance-quote-header{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;}
.attendance-quote-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;color:#059669;}
.attendance-quote-tag{display:inline-block;font-size:10.5px;padding:2px 8px;border-radius:999px;background:#E2E8F0;color:#475569;font-weight:600;}
.attendance-quote-text{margin:0 0 10px;font-size:13.5px;line-height:1.55;color:#1E293B;font-style:italic;}
.attendance-quote-author{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#065F46;}
.attendance-quote-author i{font-size:15px;color:#10B981;}
.attendance-success-footer{padding:12px 20px 20px;border-top:none;background:transparent;}
.attendance-success-footer .btn{border-radius:10px;padding:12px 18px;font-size:14px;font-weight:600;}
@media(max-width:480px){
.modal-attendance-success{width:94%;border-radius:14px;}
.attendance-success-banner{padding:18px 14px 14px;}
.attendance-success-icon-wrap{width:46px;height:46px;font-size:26px;margin-bottom:8px;}
.attendance-success-title{font-size:17px;}
.attendance-success-time{font-size:11.5px;}
.attendance-quote-card{margin:12px 14px;padding:14px;}
.attendance-quote-text{font-size:12.5px;line-height:1.45;}
.attendance-success-footer{padding:8px 14px 16px;}
}"""

    if ".modal-attendance-overlay" not in content:
        content = content + "\n" + new_css

    clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print("components.css successfully updated with attendance motivation modal styles")
    return True

if __name__ == '__main__':
    ok1 = apply_app_config()
    ok2 = apply_guru_index()
    ok3 = apply_components_css()
    if ok1 and ok2 and ok3:
        print("ALL CHANGES APPLIED SUCCESSFULLY")
    else:
        sys.exit(1)
