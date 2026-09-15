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

## 4. Animasi Horizontal
- **Aturan:** Hati-hati dengan animasi scroll berbasis geser menyamping (seperti `transform: translateX(30px)`). Elemen yang berada di pinggir kanan layar dan digeser 30px ke luar layar akan memperlebar dokumen saat dimuat di ponsel.
- **Solusi:** Matikan geseran horizontal di layar ponsel dan ubah menjadi geseran vertikal (`translateY(30px)`) melalui *media query*.
