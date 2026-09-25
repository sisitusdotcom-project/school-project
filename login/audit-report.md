# Audit Report — `login/` Folder

## 1. REDUNDANSI & DUPLIKASI CSS

### 1.1 `.list-row` didefinisikan dua kali
- [components.css:231-240](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L231-L240) — definisi pertama
- [components.css:326-335](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L326-L335) — definisi kedua (100% identik)
- **Fix**: Hapus definisi kedua

### 1.2 `.card` padding override tanpa media query
- [components.css:172-180](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L172-L180) — `padding: 16px`
- [components.css:1113-1114](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L1113-L1114) — overrides menjadi `padding: 14px` tanpa alasan
- **Fix**: Consolidate ke satu definisi `padding: 14px` saja

### 1.3 `.card-header` didefinisikan lalu override
- [components.css:192-197](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L192-L197) — `margin-bottom: 16px`
- [components.css:1117-1119](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L1117-L1119) — override jadi `margin-bottom: 12px`, `gap: 10px`
- **Fix**: Gabung ke definisi pertama

### 1.4 `.section-block` didefinisikan lalu override
- [components.css:182-183](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L182-L183) — `margin-top: 14px`
- [components.css:1122-1123](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L1122-L1123) — override jadi `margin-top: 12px`
- **Fix**: Gabung ke satu definisi

### 1.5 `.section-spacer` didefinisikan lalu override
- [components.css:291-293](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L291-L293) — `margin-bottom: 24px`
- [components.css:1126-1128](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L1126-L1128) — override jadi `margin-bottom: 14px`
- **Fix**: Gabung ke satu definisi

### 1.6 `.stat-card` didefinisikan lalu override
- [components.css:814-825](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L814-L825) — definisi awal
- [components.css:1135-1142](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L1135-L1142) — override tanpa media query
- **Fix**: Gabung ke satu definisi

### 1.7 `.stat-icon` didefinisikan lalu override
- [components.css:852-861](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L852-L861) — definisi awal
- [components.css:1144-1148](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L1144-L1148) — override
- **Fix**: Gabung

### 1.8 `.stat-value` dan `.stat-label` override
- Sama pattern — definisi awal lalu override di bawah. Gabung.

### 1.9 `.btn` `min-height: 40px` override
- [components.css:1109-1111](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L1109-L1111) — menambah `min-height` di luar media query setelah definisi awal
- **Fix**: Gabung ke definisi `.btn` pertama

### 1.10 `card-grid:has(.stat-card)` didefinisikan banyak kali
- [components.css:1094-1103](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L1094-L1103) — dalam media query 640px dan 1024px
- [components.css:1130-1133](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css#L1130-L1133) — override base tanpa media query (ini menimpa semua)
- **Fix**: Konsolidasi; base di atas, responsive di media query

### 1.11 `.mobile-header` duplikasi di layout.css
- [layout.css:67-82](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/layout.css#L67-L82) — definisi lengkap termasuk `display: flex`
- [layout.css:275-277](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/layout.css#L275-L277) — duplicate `display: flex` (tidak berguna)
- **Fix**: Hapus duplikasi di line 275-277

## 2. REDUNDANSI & DUPLIKASI JS

### 2.1 `can()` identik dengan `hasPermission()` di permissions.js
- [permissions.js:154-156](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/permissions.js#L154-L156) — `can()` hanya membungkus `hasPermission()` tanpa tambahan logika. Tidak pernah dipakai.
- **Fix**: Hapus `can()` (tidak digunakan di manapun)

### 2.2 `MANAGEMENT_ROUTE_MAP` di app-config.js — config duplikasi di `getRoleNav()`
- [app-config.js:309-313](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/app-config.js#L309-L313) — hardcode route config lagi di dalam fungsi padahal sudah ada `MANAGEMENT_ROUTE_MAP` dan `NAV_ITEMS`
- **Fix**: Refactor menggunakan data yang sudah ada di `NAV_ITEMS` kepsek

### 2.3 `DB.normalizeSettings` dan `DB.toArray` di db.js:642-645
- [db.js:642-645](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/db.js#L642-L645) — `Object.assign(DB, { normalizeSettings: AppConfig.normalizeSettings, toArray: AppConfig.toArray })` — alias yang tidak perlu, tapi banyak page sudah pakai `DB.toArray()`.
- **Status**: ✅ Ini proxy yang ok, biarkan untuk backward compat. Tapi `DB.normalizeSettings` **tidak pernah dipanggil** — selalu `AppConfig.normalizeSettings`.
- **Fix**: Hapus `DB.normalizeSettings` saja

### 2.4 Unused `readOnly` variable
- [finance/index.js:4](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/pages/finance/index.js#L4) — `readOnly` dideklarasikan tapi tidak pernah dipakai
- [facilities/index.js:4](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/pages/facilities/index.js#L4) — sama
- **Fix**: Hapus keduanya

### 2.5 `assignments` parameter unused di `isManagementRouteAllowed`
- [app.js:53](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/app.js#L53) — parameter `assignments` diterima tapi tidak pernah digunakan di dalam fungsi
- **Fix**: Hapus parameter

### 2.6 Unused variable `assignments` di route handler
- [app.js:112](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/app.js#L112) & [app.js:188](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/app.js#L188) — `assignments` dideklarasikan tapi tidak dipakai
- **Fix**: Hapus

### 2.7 Duplikat `activeStudents` di student-affairs
- [student-affairs/index.js:14](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/pages/student-affairs/index.js#L14) — `activeStudents` = `studentList.length`, lalu dipakai dua kali, kartu pertama dan ketiga menampilkan **data yang sama** "Siswa" dan "Data siswa aktif"
- **Fix**: Ubah stat card ke-3 menjadi sesuatu yang berguna (misalnya jumlah prestasi/pelanggaran) atau hapus duplikasi

## 3. MASALAH PRODUCTION-READY

### 3.1 Firebase SDK Version Mismatch
- [public/index.html](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/index.html#L17-L19): Firebase `10.8.0`
- [public/print.html](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/print.html#L13-L15): Firebase `10.7.1`
- **Fix**: Samakan ke `10.8.0`

### 3.2 Inline CSS & event handlers di ortu page & kepsek page (melanggar aturan AGENTS.md)
- [ortu/index.js](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/pages/ortu/index.js#L131-L133): `onclick="OrtuPages.switchTab(...)"`
- [kepsek/index.js](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/pages/kepsek/index.js#L126): inline `style=` di banyak tempat
- [ortu/index.js](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/pages/ortu/index.js): banyak `style=` inline
- **Fix**: Pindahkan ke CSS classes, ganti onclick ke event delegation

### 3.3 Komentar di source code (melanggar aturan AGENTS.md)
- [db.js](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/db.js): Banyak komentar `//`
- [kepsek/index.js](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/pages/kepsek/index.js): Komentar
- [ortu/index.js](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/pages/ortu/index.js): Komentar
- [admin/index.js](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/pages/admin/index.js): Komentar
- [print.js](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/print.js): Komentar
- [app-config.js](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/app-config.js): Komentar
- [components.css](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/css/components.css): CSS komentar
- **Fix**: Hapus semua komentar

### 3.4 `user-scalable=no` di index.html
- [public/index.html:5](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/index.html#L5) — `maximum-scale=1.0, user-scalable=no` melanggar aksesibilitas (WCAG). User harus bisa zoom.
- **Fix**: Hapus `maximum-scale` dan `user-scalable=no`

### 3.5 XSS Risk: innerHTML dengan data user tanpa sanitasi
- Banyak tempat menggunakan `${student.name}`, `${u.name}`, etc. langsung ke innerHTML. Data dari Firebase bisa mengandung `<script>`.
- **Fix**: Tambahkan fungsi `escapeHtml()` global dan pakai di semua template literal

### 3.6 `PRODUCTION_AUDIT.md` dan `ROLE_SCOPE_MATRIX.md` — file legacy
- File ini artifact dari percakapan sebelumnya, bukan bagian dari kode.
- **Status**: Biarkan, tidak mengganggu.

### 3.7 Login error — `auth.signInWithEmailAndPassword` tanpa `catch` spesifik
- [auth.js:100-105](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/auth.js#L100-L105) — error message selalu "Email atau password salah" padahal bisa juga "too-many-requests" dll.
- **Fix**: Tambah handling error code spesifik

### 3.8 `print.html` inline onclick (melanggar aturan)
- [print.js:206-207](file:///e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/print.js#L206-L207) — `onclick="window.close()"` dan `onclick="window.print()"`
- **Fix**: Ganti ke event delegation

## 4. SUMMARY AKSI

| # | Tipe | File | Aksi |
|---|------|------|------|
| 1 | CSS Dup | components.css | Hapus `.list-row` duplikat |
| 2 | CSS Dup | components.css | Konsolidasi override `.card`, `.card-header`, `.section-block`, `.section-spacer`, `.stat-card`, `.stat-icon`, `.stat-value`, `.stat-label`, `.btn` |
| 3 | CSS Dup | layout.css | Hapus `.mobile-header` duplikat |
| 4 | CSS Dup | components.css | Konsolidasi `card-grid:has(.stat-card)` |
| 5 | CSS Dup | components.css | Hapus komentar CSS |
| 6 | JS Unused | permissions.js | Hapus `can()` |
| 7 | JS Unused | db.js | Hapus `DB.normalizeSettings` alias |
| 8 | JS Unused | finance, facilities | Hapus `readOnly` unused |
| 9 | JS Unused | app.js | Hapus `assignments` unused param/var |
| 10 | JS Dup | student-affairs | Fix duplikat stat card |
| 11 | Production | print.html | Samakan Firebase SDK version |
| 12 | Production | index.html | Fix viewport meta |
| 13 | Production | auth.js | Improve error handling |
| 14 | Production | Semua JS | Hapus semua komentar |
| 15 | Security | Core | Tambah `escapeHtml()` utility |
| 16 | Production | print.js, ortu | Ganti inline onclick ke event delegation |
