📖 STEP.md — Panduan Membangun Situs MTs Al-Ittihad
 
Berdasarkan rancangan: HTML murni + CSS terpisah + JavaScript ES5, tanpa alat tambahan apa pun
 
 
 
✅ LANGKAH 1 — Siapkan Semua Folder
 
Buat susunan seperti di structure.md
 
 
✅ LANGKAH 2 — Buat Berkas Utama & Halaman
 
Buat berkas kosong dengan nama persis berikut:
 
Di root/ 
 
-  index.html 
-  e-book.html 
 
Di dalam  profil/ 
 
-  matsahad.html 
-  visi-misi.html 
-  struktur-organisasi.html 
-  data-pegawai.html 
-  tugas-pokok-fungsi.html 
 
Di dalam  bidang/ 
 
-  kurikulum.html 
-  kesiswaan.html 
-  sarpras.html 
-  humas.html 
 
Di dalam  galeri/ 
 
-  foto.html 
-  video.html 
 
Di dalam  informasi/ 
 
-  layanan.html 
-  pengumuman.html 
-  agenda.html 
 
 
 
✅ LANGKAH 3 — Buat Semua Berkas CSS
 
Buat berkas kosong sesuai pembagian:
 
📂 assets/css/
 
-  main.css  ← Pusat impor semua gaya
 
📂 assets/css/base/
 
-  reset.css 
-  variables.css 
-  typography.css 
 
📂 assets/css/components/
 
-  nav.css 
-  button.css 
-  card.css 
-  footer.css 
-  banner.css 
 
📂 assets/css/pages/
 
-  home.css 
-  profil.css 
-  bidang.css 
-  galeri.css 
-  informasi.css 
-  ebook.css 
 
📂 assets/css/utilities/
 
-  helpers.css 
-  responsive.css 
 
 
 
✅ LANGKAH 4 — Buat Semua Berkas JavaScript (ES5 Murni)
 
Buat berkas kosong sesuai pembagian:
 
📂 assets/js/
 
-  main.js  ← Pengendali utama saat halaman selesai dimuat
 
📂 assets/js/base/
 
-  config.js 
-  utils.js 
 
📂 assets/js/components/
 
-  navigation.js 
-  gallery.js 
-  modal.js 
 
📂 assets/js/pages/
 
-  home.js 
-  profil.js 
-  bidang.js 
-  galeri.js 
-  informasi.js 
-  ebook.js 
 
📂 assets/js/utilities/
 
-  helpers.js 
 
 
 
✅ LANGKAH 5 — Isi Berkas Pusat CSS
 
Buka  assets/css/main.css  lalu salin:
 
css
  
/* === BASE === */
@import "base/reset.css";
@import "base/variables.css";
@import "base/typography.css";

/* === KOMPONEN === */
@import "components/nav.css";
@import "components/button.css";
@import "components/card.css";
@import "components/footer.css";
@import "components/banner.css";

/* === ALAT BANTU === */
@import "utilities/helpers.css";
@import "utilities/responsive.css";

/* === HALAMAN KHUSUS === */
@import "pages/home.css";
@import "pages/profil.css";
@import "pages/bidang.css";
@import "pages/galeri.css";
@import "pages/informasi.css";
@import "pages/ebook.css";
 
 
 
 
✅ LANGKAH 6 — Isi Berkas Pusat JavaScript (ES5)
 
Buka  assets/js/main.js  lalu salin:
 
javascript
  
// Semua fungsi sudah dimuat lewat urutan <script> di HTML
window.onload = function () {
  if (typeof initNav === "function") initNav();
  // panggil fungsi lain sesuai kebutuhan
};
 
 
 
 
✅ LANGKAH 7 — Buat Kerangka Dasar HTML
 
Buka  index.html  lalu salin kerangka dasar ini:
 
html
  
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MTs Al-Ittihad Poncokusumo</title>

  <!-- CSS UTAMA -->
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>

  <!-- TULIS NAVIGASI & ISI DI SINI -->

  <!-- === URUTAN PEMUATAN JS — PENTING! === -->
  <script src="assets/js/base/config.js"></script>
  <script src="assets/js/base/utils.js"></script>
  <script src="assets/js/utilities/helpers.js"></script>

  <script src="assets/js/components/navigation.js"></script>
  <script src="assets/js/components/gallery.js"></script>
  <script src="assets/js/components/modal.js"></script>

  <script src="assets/js/pages/home.js"></script>

  <script src="assets/js/main.js"></script>
</body>
</html>
 
 
⚠️ PENTING untuk halaman di dalam subfolder (contoh:  profil/matsahad.html ):
Ubah alamat tambah  ../  naik satu tingkat:
 
html
  
<link rel="stylesheet" href="../assets/css/main.css">
<script src="../assets/js/base/config.js"></script>
... dan seterusnya
 
 
 
 
✅ LANGKAH 8 — Masukkan Navigasi Utama
 
Salin kode menu yang sudah dibuat ke dalam bagian  <body>  setiap halaman:
 
html
  
<nav>
  <ul>
    <li><a href="index.html">Beranda</a></li>
    <li><a href="profil/matsahad.html">PROFIL</a>
      <ul>
        <li><a href="profil/matsahad.html">Matsahad</a></li>
        <li><a href="profil/visi-misi.html">Visi dan Misi</a></li>
        <li><a href="profil/struktur-organisasi.html">Struktur Organisasi</a></li>
        <li><a href="profil/data-pegawai.html">Data Pegawai</a></li>
        <li><a href="profil/tugas-pokok-fungsi.html">Tugas Pokok dan Fungsi</a></li>
      </ul>
    </li>
    <li><a href="bidang/kurikulum.html">BIDANG</a>
      <ul>
        <li><a href="bidang/kurikulum.html">Kurikulum</a></li>
        <li><a href="bidang/kesiswaan.html">Kesiswaan</a></li>
        <li><a href="bidang/sarpras.html">Sarpras</a></li>
        <li><a href="bidang/humas.html">Humas</a></li>
      </ul>
    </li>
    <li><a href="galeri/foto.html">GALERI</a>
      <ul>
        <li><a href="galeri/foto.html">Foto</a></li>
        <li><a href="galeri/video.html">Video</a></li>
      </ul>
    </li>
    <li><a href="informasi/layanan.html">INFORMASI</a>
      <ul>
        <li><a href="informasi/layanan.html">Layanan</a></li>
        <li><a href="informasi/pengumuman.html">Pengumuman</a></li>
        <li><a href="informasi/agenda.html">Agenda</a></li>
      </ul>
    </li>
    <li><a href="e-book.html">E-Book</a></li>
  </ul>
</nav>
 
 
 
 
✅ LANGKAH 9 — Isi Gaya & Fungsi
 
1. Isi  assets/css/base/variables.css  dengan palet warna yang sudah disusun sebelumnya
2. Isi  assets/css/base/typography.css  dengan pengaturan huruf
3. Isi  assets/css/components/nav.css  agar menu terlihat rapi
4. Isi  assets/js/base/config.js  dengan nama madrasah dan alamat
5. Tambahkan isi konten masing-masing halaman sesuai pada folder copy-text/






=============================================
saya ingin membuat website seperti punya mtsalittihadmlg.sch.id
1. buatkan website sementara pakai data apa adanya seperti https://mtsalittihadmlg.sch.id nanti saya ganti sendiri dengan lembaga saya.
2. jika ada file gambar atau file sejenis jangan genereate sendiri, langsung panggil gambar tersebut dari https://mtsalittihadmlg.sch.id atau kasih gambar placehoder dari https://unsplash.com HINDARI GENERATE GAMBAR MANUAL.
3. untuk panduan manual boleh anda baca design.md sebagai opsi kedua jika anda setelah melihat desain dari https://mtsalittihadmlg.sch.id lalu gagal menganalisa. tapi itu hanya opsi 2 atau rujukan cepat saja, dan saya tetap mengandalkan analisa anda dari website langsung dari https://mtsalittihadmlg.sch.id
4. boleh anda baca juga log-build.md sebaga opsi 3, file itu dari agen yang saya suruh buat website serupa, tapi mungkin dia gagal.
5. baca folder copy-text/ itu adalah teks apa adanya pada halaman publik https://mtsalittihadmlg.sch.id untuk acuan konten. untuk gambaran desain dan layout dan lainnya anda wajib melihat halaman aslinya, atau jika anda tidak mau repot saya sudah taruh screenshot halaman asli dan saya taruh pada visual/
6. baca structure.md sebagai acuan strukturnya
7. pakai html ES5, css, dan js biasa, css pakai vanilla css dan icon pakai posphor
8. jangan langsung semua, mulai dari step 1 pada panduan ini (step.md), buat implementation plan, lalu eksekusi
-penting: jika menurut anda ada ide lain sampaikan itu, dan terapkan dengan best practice pada setiap plan. 