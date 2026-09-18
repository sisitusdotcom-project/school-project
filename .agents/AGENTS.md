# CSS and Responsive Layout Guidelines

Ini adalah panduan utama bagi semua developer dan AI agent yang berkontribusi pada repositori ini. Repositori ini memiliki struktur layout yang sensitif, terutama berkaitan dengan tampilan mobile dan fitur *sticky sidebar* di desktop. 

HARAP IKUTI ATURAN BERIKUT SECARA KETAT UNTUK MENCEGAH MASALAH "HALAMAN MELEBAR" (HORIZONTAL SCROLL) DI MOBILE:

## 1. Mencegah CSS Grid Blowout (Paling Kritis)
Secara bawaan, elemen anak dari CSS Grid (`grid-item`) memiliki `min-width: auto`. Jika di dalam grid terdapat teks panjang tanpa spasi (misalnya URL, nomor SK) atau elemen dengan padding besar (seperti `.article-card`), *grid item* tersebut tidak akan mau menyusut lebih kecil dari ukuran kontennya. Hal ini menyebabkan grid menabrak batas viewport di ponsel (Grid Blowout).
- **Aturan:** Selalu berikan `min-width: 0;` pada direct children dari grid container (terutama `.main-sidebar-grid`, `.news-grid`, dsb) agar mereka bisa di-*resize* mengikuti layar.
- **Contoh:**
  ```css
  .main-sidebar-grid > * {
    min-width: 0;
  }
  ```

## 2. Long Text & Break Word
- **Aturan:** Pastikan teks panjang tanpa spasi (URL, Nomor Surat, Nomor Induk) bisa dipotong ke baris baru. Gunakan `overflow-wrap: break-word;` atau `word-break: break-word;` secara global di `body` atau di tingkat card/artikel.

## 3. Padding Responsif
- **Aturan:** Jangan menggunakan *padding* yang terlalu besar secara statis. Jika `.article-card` memiliki `padding: 30px`, ia mengambil ruang 60px secara horizontal, yang sangat membebani layar kecil (320px). Selalu kurangi padding di mode mobile (contoh: jadi `15px` pada layar `< 768px`).



# Standar Pengkodean Umum (General Code Standards)

## 1. Dilarang Cache Busting
- **Aturan:** Jangan pernah menggunakan atau menambahkan *cache busting parameters* (seperti ?v=1.0 atau semacamnya) pada pemanggilan file CSS, JS, atau aset statis lainnya. Tidak perlu cache busting, karena itu adalah murni kesalahan agen jika berpikir untuk membuatnya. Alih-alih membuat cache busting, teliti dan koreksi diri sendiri atas kode yang dibuat.

## 2. Kebersihan Kode (No Empty Lines)
- **Aturan:** Jangan membuat baris kosong (blank lines) yang tidak diperlukan di dalam file HTML, CSS, maupun JS. Jaga struktur kode tetap padat dan rapi tanpa spasi berlebih.

## 3. Dilarang Menggunakan Komentar (No Comments)
- **Aturan:** JANGAN PERNAH menambahkan komentar (comments) apapun di dalam kode HTML, CSS, maupun JS. Biarkan kode bersih sepenuhnya dari komentar.

## 4. Dilarang Inline CSS dan JS
- **Aturan:** Dilarang keras menggunakan CSS atau JS secara *inline* (misalnya style= atau atribut event seperti onclick= langsung di dalam tag HTML). Semua styling wajib berada di file CSS terpisah, dan semua logika *script* wajib berada di file JS terpisah.

___________________________________________________________

## Strict Encoding & Scripting Rules

**CRITICAL: NEVER USE POWERSHELL FOR TEXT MANIPULATION.**
Windows PowerShell commands like `Get-Content`, `Set-Content`, `Add-Content`, and `-replace` are notorious for corrupting UTF-8 multibyte characters (like `▼`, `—`, `ﷺ`, `’`) by silently converting them to ANSI or Windows-1252.

**Rule 1: Use Python or Node.js for Scripting**
If you need to perform mass file replacements, text manipulation, or content rewriting across multiple files, you MUST use a robust scripting language like Python (or Node.js). 

**Rule 2: Always Explicitly Define UTF-8**
When reading or writing files in Python, ALWAYS specify `encoding="utf-8"`.
Example:
```python
with open('file.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ... processing ...

with open('file.html', 'w', encoding='utf-8') as f:
    f.write(content)
```

**Rule 3: Avoid `replace_file_content` if Unsure about Encoding**
If a file contains delicate Arabic symbols or complex Unicode, and you are unsure if standard IDE tools or PowerShell will corrupt it, fall back to Python scripts to ensure data integrity.

**Rule 4: Double Check Replacements**
Never run a global replace without verifying what characters it might break. Always run a dry-run or verify the `diff` immediately after.

Adhere to these rules strictly to prevent wasting time on repetitive encoding errors.
