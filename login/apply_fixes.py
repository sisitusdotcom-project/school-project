import os
import re

BASE_DIR = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\login"

def replace_in_file(rel_path, old, new):
    path = os.path.join(BASE_DIR, rel_path)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {rel_path}")
    else:
        print(f"Could not find target in {rel_path}")

# 1. layout.css
replace_in_file('public/assets/css/layout.css', 
'''.mobile-header {
  display: flex
}

@media (min-width:1024px) {''', 
'''@media (min-width:1024px) {''')

# 2. permissions.js
path = os.path.join(BASE_DIR, 'public/assets/js/permissions.js')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r'  function can\(role, permissionKey\) {\n    return hasPermission\(role, permissionKey\);\n  }\n\n', '', content)
content = content.replace('    can,\n', '')
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated permissions.js")

# 3. db.js
replace_in_file('public/assets/js/db.js',
'''Object.assign(DB, {
  normalizeSettings: AppConfig.normalizeSettings,
  toArray: AppConfig.toArray
});''',
'''Object.assign(DB, {
  toArray: AppConfig.toArray
});''')

# 4. finance/index.js
replace_in_file('public/assets/js/pages/finance/index.js',
'''    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    const readOnly = role !== AppConfig.ROLES.ADMIN;
    Router.setTitle('Keuangan', 'Ringkasan kas, tagihan, dan laporan sekolah.');''',
'''    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    Router.setTitle('Keuangan', 'Ringkasan kas, tagihan, dan laporan sekolah.');''')

# 5. facilities/index.js
replace_in_file('public/assets/js/pages/facilities/index.js',
'''    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    const readOnly = role !== AppConfig.ROLES.ADMIN && role !== AppConfig.ROLES.KEPSEK;
    Router.setTitle('Sarana & Prasarana', 'Ringkasan aset, kebutuhan, dan maintenance sekolah.');''',
'''    const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
    Router.setTitle('Sarana & Prasarana', 'Ringkasan aset, kebutuhan, dan maintenance sekolah.');''')

# 6. student-affairs/index.js
replace_in_file('public/assets/js/pages/student-affairs/index.js',
'''        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-users"></i></div>
          <div><p class="stat-value">${activeStudents}</p><p class="stat-label text-muted">Data siswa aktif</p></div>
        </div>''',
'''        <!-- removed duplicate stat card -->''')

# 7. app.js
path = os.path.join(BASE_DIR, 'public/assets/js/app.js')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('isManagementRouteAllowed(path, role = Auth.currentRole, assignments = []) {', 'isManagementRouteAllowed(path, role = Auth.currentRole) {')
content = content.replace('''        const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
        const assignments = Auth.userData?.assignments || Auth.currentAssignments || [];
        const hasAccess = this.isManagementRouteAllowed(path, role, assignments)
          && (!permissionKey || !window.PermissionManager || window.PermissionManager.hasPermission(role, permissionKey));''', 
'''        const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
        const hasAccess = this.isManagementRouteAllowed(path, role)
          && (!permissionKey || !window.PermissionManager || window.PermissionManager.hasPermission(role, permissionKey));''')
content = content.replace('''        const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
        const permission = this.getManagementPermissionKey(path, 'view');
        const assignments = Auth.userData?.assignments || Auth.currentAssignments || [];
        const hasAccess = this.isRouteAllowed(path, role)
          && (!permission || (window.PermissionManager ? window.PermissionManager.hasPermission(role, permission) : true));''',
'''        const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
        const permission = this.getManagementPermissionKey(path, 'view');
        const hasAccess = this.isRouteAllowed(path, role)
          && (!permission || (window.PermissionManager ? window.PermissionManager.hasPermission(role, permission) : true));''')
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated app.js")

# 8. print.html
replace_in_file('public/print.html',
'''    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>''',
'''    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"></script>''')

# 9. index.html
replace_in_file('public/index.html',
'''<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">''',
'''<meta name="viewport" content="width=device-width, initial-scale=1.0">''')

# 10. auth.js
replace_in_file('public/assets/js/auth.js',
'''    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      err.innerText = 'Email atau password salah.';
      err.classList.remove('hidden');
      btn.disabled = false;
      btn.querySelector('.btn-text').innerText = 'Masuk';
    }''',
'''    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        err.innerText = 'Email atau password salah.';
      } else if (error.code === 'auth/too-many-requests') {
        err.innerText = 'Terlalu banyak percobaan. Silakan coba lagi nanti.';
      } else {
        err.innerText = 'Terjadi kesalahan saat login: ' + error.message;
      }
      err.classList.remove('hidden');
      btn.disabled = false;
      btn.querySelector('.btn-text').innerText = 'Masuk';
    }''')

# 11. Remove comments in JS files using regex.
import glob
js_files = glob.glob(os.path.join(BASE_DIR, 'public/assets/js/**/*.js'), recursive=True)
for js_file in js_files:
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(r'^\s*//.*$\n?', '', content, flags=re.MULTILINE)
    if new_content != content:
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Removed comments in {os.path.relpath(js_file, BASE_DIR)}")

# 12. Add escapeHtml to app-config.js
app_config_path = os.path.join(BASE_DIR, 'public/assets/js/app-config.js')
with open(app_config_path, 'r', encoding='utf-8') as f:
    config_content = f.read()
if 'function escapeHtml' not in config_content:
    escape_fn = '''
  function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }
'''
    config_content = config_content.replace('function normalizeSettings', escape_fn + '  function normalizeSettings')
    config_content = config_content.replace('normalizeSettings,', 'escapeHtml,\n    normalizeSettings,')
    with open(app_config_path, 'w', encoding='utf-8') as f:
        f.write(config_content)
    print("Added escapeHtml to app-config.js")

# 13. Use escapeHtml in admin/index.js
admin_idx_path = os.path.join(BASE_DIR, 'public/assets/js/pages/admin/index.js')
with open(admin_idx_path, 'r', encoding='utf-8') as f:
    admin_content = f.read()
admin_content = admin_content.replace('${u.name}', '${AppConfig.escapeHtml(u.name)}')
admin_content = admin_content.replace('${u.username}', '${AppConfig.escapeHtml(u.username)}')
with open(admin_idx_path, 'w', encoding='utf-8') as f:
    f.write(admin_content)
print("Applied escapeHtml to admin/index.js")

# 14. Fix inline onclick in print.js
print_js_path = os.path.join(BASE_DIR, 'public/assets/js/print.js')
with open(print_js_path, 'r', encoding='utf-8') as f:
    print_js = f.read()
print_js = print_js.replace('<button class="btn-action btn-close" onclick="window.close()">✖ Tutup</button>', '<button class="btn-action btn-close" id="btn-close-print">✖ Tutup</button>')
print_js = print_js.replace('<button class="btn-action" onclick="window.print()">🖨️ Cetak Rapor (F4)</button>', '<button class="btn-action" id="btn-do-print">🖨️ Cetak Rapor (F4)</button>')

insert_idx = print_js.find('} catch (err) {')
if insert_idx != -1:
    listeners = '''
      const btnClose = document.getElementById('btn-close-print');
      if (btnClose) btnClose.addEventListener('click', () => window.close());
      const btnPrint = document.getElementById('btn-do-print');
      if (btnPrint) btnPrint.addEventListener('click', () => window.print());
      
    '''
    print_js = print_js[:insert_idx] + listeners + print_js[insert_idx:]
    with open(print_js_path, 'w', encoding='utf-8') as f:
        f.write(print_js)
    print("Fixed inline onclick in print.js")

# 15. Fix inline onclick in ortu/index.js
ortu_idx_path = os.path.join(BASE_DIR, 'public/assets/js/pages/ortu/index.js')
with open(ortu_idx_path, 'r', encoding='utf-8') as f:
    ortu_js = f.read()
ortu_js = re.sub(r'onclick="OrtuPages\.switchTab\(\'\$\{student\.id\}\', \'([^\']+)\'\)"', r'data-student="${student.id}" data-tab="\1"', ortu_js)
insert_idx = ortu_js.find('container.querySelectorAll(\'.btn-save-resp\').forEach(btn => {')
if insert_idx != -1:
    tab_listener = '''
    container.querySelectorAll('.btn-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.dataset.student;
        const tabName = e.currentTarget.dataset.tab;
        if (studentId && tabName) OrtuPages.switchTab(studentId, tabName);
      });
    });
    '''
    ortu_js = ortu_js[:insert_idx] + tab_listener + ortu_js[insert_idx:]
    with open(ortu_idx_path, 'w', encoding='utf-8') as f:
        f.write(ortu_js)
    print("Fixed inline onclick in ortu/index.js")

