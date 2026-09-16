import os

detail_html = r"e:\web-projects\MTSALMUHAMMADIYAH 1MLG.SCH.ID\detail-karya.html"

html_content = '''<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detail Karya Siswa | MTs Al-Muhammadiyah 1</title>
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/main.css" />
  <link rel="stylesheet" href="/assets/css/pages/karya-siswa.css" />
</head>

<body>
  <div id="app-header"></div>
  <main class="wrapper mb-3">
    <!-- Breadcrumb -->
    <div class="breadcrumb-wrapper" style="margin-top: 2rem;">
      <div class="breadcrumb">
        <a href="/index.html"><i class="ph-bold ph-house"></i> Beranda</a>
        <span>/</span>
        <a href="/karya-siswa.html">Karya Siswa</a>
        <span>/</span>
        <span class="current-page">Detail Karya</span>
      </div>
    </div>
    
    <section class="mt-4 mb-4">
      <article class="article-content" style="max-width: 1000px; margin: 0 auto; background: #fff; padding: 2rem; border-radius: var(--radius-besar); box-shadow: var(--shadow-sm); border: 1px solid #eee;">
        
        <!-- Header / Title -->
        <div class="detail-karya-header">
          <div class="detail-karya-badge-row" style="margin-bottom: 1rem;">
            <span class="karya-badge-cat">Proyek & Kreativitas</span>
            <span class="karya-badge-year">Tahun 2026</span>
          </div>
          <h1 class="detail-karya-title">Inovasi Robotik Pembersih Lingkungan Otomatis Berbasis Sensor</h1>
          
          <div class="karya-author-meta" style="margin-bottom: 0;">
            <div class="author-avatar"><i class="ph-fill ph-student"></i></div>
            <div class="author-info">
              <span class="author-name">Tim Robotika Al-Muhammadiyah 1 (Budi, Fikri, dkk)</span>
              <span class="author-class">Ekstrakurikuler Robotika / Kelas 8</span>
            </div>
          </div>
        </div>

        <!-- Media / Photo -->
        <div class="detail-karya-media">
          <img src="/assets/img/pegawai/nawawi.jpg" alt="Foto Karya Siswa">
        </div>

        <!-- Content Grid -->
        <div class="detail-karya-content-grid">
          
          <!-- Main Description -->
          <div class="detail-desc-box">
            <h3 style="margin-top: 0; color: var(--color-primary-green); margin-bottom: 1rem;">Deskripsi Karya</h3>
            <p>Robot pembersih lingkungan otomatis ini merupakan proyek inovatif yang dikembangkan oleh tim ekstrakurikuler robotika MTs Al-Muhammadiyah 1. Dilengkapi dengan sensor ultrasonik, robot ini mampu mendeteksi halangan di sekitarnya dan berbelok secara otomatis, sehingga dapat menyapu area yang luas tanpa bantuan kendali manual.</p>
            <p>Tujuan utama dari proyek ini adalah untuk menanamkan kesadaran peduli lingkungan melalui pemanfaatan teknologi yang tepat guna. Robot ini dibuat dari bahan-bahan daur ulang dan komponen elektronik dasar, menjadikannya solusi cerdas yang hemat biaya.</p>
            <p>Proyek ini telah melalui proses uji coba selama 3 bulan dan berhasil menyabet juara 1 pada ajang Lomba Inovasi Teknologi Tepat Guna tingkat Kabupaten tahun 2026.</p>
          </div>

          <!-- Sidebar Info -->
          <div class="detail-info-sidebar">
            <div class="info-sidebar-block">
              <span class="info-label">Guru Pembimbing</span>
              <span class="info-value"><i class="ph-fill ph-chalkboard-teacher" style="color: var(--color-primary-green);"></i> Bapak Ahmad Yani, S.Pd.</span>
            </div>
            
            <div class="info-sidebar-block">
              <span class="info-label">Kategori Karya</span>
              <span class="info-value"><i class="ph-fill ph-flask" style="color: var(--color-primary-green);"></i> Proyek & Sains</span>
            </div>

            <div class="info-sidebar-block">
              <span class="info-label">Tingkat Prestasi</span>
              <span class="info-value"><i class="ph-fill ph-trophy" style="color: #f59e0b;"></i> Juara 1 (Kabupaten)</span>
            </div>

            <div class="info-sidebar-block" style="background: #fffbeb; padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 2rem;">
              <span class="info-label" style="color: #b45309;"><i class="ph-fill ph-info"></i> Catatan Penting</span>
              <p style="font-size: 0.9rem; color: #92400e; margin: 0; line-height: 1.5;">Hak cipta ide dan desain prototipe ini sepenuhnya milik tim siswa dan madrasah. Dilarang menggandakan tanpa izin resmi dari pihak sekolah.</p>
            </div>
          </div>

        </div>

      </article>
    </section>

  </main>
  <div id="app-footer"></div>
  <script src="/assets/js/base/layout.js"></script>
  <script src="/assets/js/components/navigation.js"></script>
  <script src="/assets/js/main.js"></script>
</body>

</html>
'''

with open(detail_html, "w", encoding="utf8") as f:
    f.write(html_content)

print("Created detail-karya.html")
