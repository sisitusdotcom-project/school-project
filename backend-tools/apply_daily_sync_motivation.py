import os
import sys

def update_app_config():
    path = 'login/public/assets/js/app-config.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_func = '''function getRandomAttendanceMotivation(options) {
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
}'''

    new_func = '''function getDailyAttendanceMotivation(options) {
const opts = options || {};
const isUmmi = !!opts.isUmmi;
const type = opts.type || 'in';
let dateObj = new Date();
if (opts.date) {
const parts = String(opts.date).split('-');
if (parts.length === 3) {
dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
} else {
dateObj = new Date(opts.date);
}
}
const dayNumber = Math.floor(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()) / 86400000);
let pool = ATTENDANCE_MOTIVATIONS.filter(item => {
if (item.target === 'out' && type !== 'out') return false;
if (item.target === 'in' && type !== 'in') return false;
if (item.category === 'Guru Ummi' && !isUmmi) return false;
return true;
});
if (isUmmi) {
const ummiPool = pool.filter(item => item.category === 'Guru Ummi' || item.author.includes('Bukhari') || item.author.includes('Utsman') || item.author.includes('Dahlan') || item.author.includes('Mujadilah'));
if (ummiPool.length) {
const uIdx = Math.abs(dayNumber) % ummiPool.length;
return ummiPool[uIdx];
}
}
if (!pool.length) pool = ATTENDANCE_MOTIVATIONS;
const typeOffset = type === 'out' ? 5 : 0;
const index = Math.abs(dayNumber + typeOffset) % pool.length;
return pool[index];
}
function getRandomAttendanceMotivation(options) {
return getDailyAttendanceMotivation(options);
}'''

    if old_func not in content:
        print("old_func not found in app-config.js")
        return False

    content = content.replace(old_func, new_func)

    old_modal_quote = "const quote = opts.quote || getRandomAttendanceMotivation({ role: user?.role, isUmmi, type });"
    new_modal_quote = "const quote = opts.quote || getDailyAttendanceMotivation({ role: user?.role, isUmmi, type, date: opts.date || opts.dateStr });"
    content = content.replace(old_modal_quote, new_modal_quote)

    content = content.replace("Mutiara Motivasi", "Mutiara Hari Ini")

    old_export = "getRandomAttendanceMotivation,\nshowAttendanceSuccessModal"
    new_export = "getDailyAttendanceMotivation,\ngetRandomAttendanceMotivation,\nshowAttendanceSuccessModal"
    content = content.replace(old_export, new_export)

    clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print("app-config.js updated with getDailyAttendanceMotivation (Mutiara Harian Serentak)")
    return True

def update_guru_index():
    path = 'login/public/assets/js/pages/guru/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_call = "AppConfig.showAttendanceSuccessModal({ type, timeStr: recordedTime, user: Auth.userData || Auth.currentUser, isUmmi });"
    new_call = "AppConfig.showAttendanceSuccessModal({ type, timeStr: recordedTime, user: Auth.userData || Auth.currentUser, isUmmi, date: dateStr });"

    if old_call in content:
        content = content.replace(old_call, new_call)
        clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(clean_lines) + '\n')
        print("pages/guru/index.js updated to pass dateStr for daily synchronization")
    else:
        print("old_call not found in pages/guru/index.js (already updated or different)")

    return True

if __name__ == '__main__':
    ok1 = update_app_config()
    ok2 = update_guru_index()
    if ok1 and ok2:
        print("ALL UPDATES COMPLETED SUCCESSFULLY")
    else:
        sys.exit(1)
