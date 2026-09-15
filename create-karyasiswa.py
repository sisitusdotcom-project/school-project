import os

karya_html = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\karya-siswa.html"

html_content = '''<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Karya Siswa | MTs Al-Ittihad</title>
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
    <!-- Hero Section -->
    <section class="hero-section" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: var(--radius-besar); padding: 4rem 2rem; color: #fff; text-align: center; margin-top: 2rem; margin-bottom: 3rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2); position: relative; overflow: hidden;">
      <!-- decorative background elements -->
      <div style="position: absolute; top: -50px; left: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -30px; right: 10%; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
      
      <div style="position: relative; z-index: 1;">
        <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 1rem;">Karya Siswa</h1>
        <p style="font-size: 1.2rem; max-width: 600px; margin: 0 auto; opacity: 0.9;">Ruang apresiasi untuk kreativitas, karya, dan prestasi siswa MTs Al-Ittihad.</p>
      </div>
    </section>

    <!-- Categories -->
    <div class="karya-categories-wrapper">
      <a href="#" class="karya-category-card">
        <div class="karya-cat-icon"><i class="ph-fill ph-palette"></i></div>
        <h3 class="karya-cat-title">Karya Seni</h3>
      </a>
      <a href="#" class="karya-category-card">
        <div class="karya-cat-icon"><i class="ph-fill ph-pencil-line"></i></div>
        <h3 class="karya-cat-title">Karya Tulis</h3>
      </a>
      <a href="#" class="karya-category-card">
        <div class="karya-cat-icon"><i class="ph-fill ph-flask"></i></div>
        <h3 class="karya-cat-title">Proyek & Kreativitas</h3>
      </a>
      <a href="#" class="karya-category-card">
        <div class="karya-cat-icon"><i class="ph-fill ph-medal"></i></div>
        <h3 class="karya-cat-title">Prestasi</h3>
      </a>
    </div>

    <!-- Karya Unggulan -->
    <h2 class="section-title"><strong>KARYA</strong><span>UNGGULAN</span></h2>
    <div class="section-divider"></div>
    <div class="karya-unggulan-wrapper">
      <a href="/detail-karya.html" class="unggulan-card">
        <div class="unggulan-img">
          <img src="/assets/img/pegawai/nawawi.jpg" alt="Karya Unggulan">
        </div>
        <div class="unggulan-content">
          <span class="unggulan-badge"><i class="ph-bold ph-star"></i> Pilihan Redaksi</span>
          <h3 class="unggulan-title">Inovasi Robotik Pembersih Lingkungan Otomatis Berbasis Sensor</h3>
          <div class="karya-author-meta">
            <div class="author-avatar"><i class="ph-fill ph-student"></i></div>
            <div class="author-info">
              <span class="author-name">Tim Robotika Al-Ittihad</span>
              <span class="author-class">Ekstrakurikuler Robotika</span>
            </div>
          </div>
          <p style="color: var(--color-neutral-medium); line-height: 1.6; margin: 0;">Proyek inovatif dari tim robotika yang berhasil menciptakan prototipe robot pembersih sampah otomatis menggunakan sensor ultrasonik untuk mendeteksi halangan. Proyek ini memenangkan juara 1 tingkat Kabupaten.</p>
        </div>
      </a>
    </div>

    <!-- Karya Terbaru Grid -->
    <h2 class="section-title"><strong>KARYA</strong><span>TERBARU</span></h2>
    <div class="section-divider"></div>
    <div class="karya-grid">
      
      <!-- Card 1 -->
      <a href="/detail-karya.html" class="karya-card">
        <div class="karya-card-img">
          <img src="/assets/img/pegawai/handoyo.jpg" alt="Lukisan">
          <span class="karya-card-category">Karya Seni</span>
        </div>
        <div class="karya-card-content">
          <h3 class="karya-card-title">Lukisan Lingkungan Sekolah Asri</h3>
          <div class="karya-card-footer">
            <div class="karya-card-author">
              <div class="karya-card-author-icon"><i class="ph-fill ph-user-circle"></i></div>
              <div class="karya-card-author-text">
                <span class="karya-card-author-name">Ahmad Fikri</span>
                <span class="karya-card-author-class">Kelas 5A</span>
              </div>
            </div>
            <span class="karya-card-date">24 Jul 2026</span>
          </div>
        </div>
      </a>

      <!-- Card 2 -->
      <a href="/detail-karya.html" class="karya-card">
        <div class="karya-card-img">
          <img src="/assets/img/pegawai/usman.jpg" alt="Puisi">
          <span class="karya-card-category">Karya Tulis</span>
        </div>
        <div class="karya-card-content">
          <h3 class="karya-card-title">Antologi Puisi "Gema Santri Milenial"</h3>
          <div class="karya-card-footer">
            <div class="karya-card-author">
              <div class="karya-card-author-icon"><i class="ph-fill ph-user-circle"></i></div>
              <div class="karya-card-author-text">
                <span class="karya-card-author-name">Siti Fatimah</span>
                <span class="karya-card-author-class">Kelas 8B</span>
              </div>
            </div>
            <span class="karya-card-date">12 Agu 2026</span>
          </div>
        </div>
      </a>

      <!-- Card 3 -->
      <a href="/detail-karya.html" class="karya-card">
        <div class="karya-card-img">
          <img src="/assets/img/pegawai/fatchul-munir.jpg" alt="Proyek">
          <span class="karya-card-category">Proyek</span>
        </div>
        <div class="karya-card-content">
          <h3 class="karya-card-title">Miniatur Masjid Ramah Lingkungan</h3>
          <div class="karya-card-footer">
            <div class="karya-card-author">
              <div class="karya-card-author-icon"><i class="ph-fill ph-user-circle"></i></div>
              <div class="karya-card-author-text">
                <span class="karya-card-author-name">Budi Santoso</span>
                <span class="karya-card-author-class">Kelas 7C</span>
              </div>
            </div>
            <span class="karya-card-date">02 Sep 2026</span>
          </div>
        </div>
      </a>

    </div>

    <!-- Prestasi Siswa -->
    <h2 class="section-title"><strong>PRESTASI</strong><span>SISWA</span></h2>
    <div class="section-divider"></div>
    <div class="prestasi-wrapper">
      <div class="prestasi-list">
        
        <div class="prestasi-item">
          <div class="prestasi-icon-col">
            <div class="prestasi-icon-medal"><i class="ph-fill ph-medal"></i></div>
          </div>
          <div class="prestasi-main-col">
            <h3 class="prestasi-title">Juara 1 Lomba Kaligrafi Islam</h3>
            <span class="prestasi-student">Muhammad Yusuf &bull; Kelas 9A</span>
          </div>
          <div class="prestasi-meta-col">
            <span class="prestasi-level">Tingkat Provinsi</span>
            <span class="prestasi-year">2026</span>
          </div>
        </div>

        <div class="prestasi-item">
          <div class="prestasi-icon-col">
            <div class="prestasi-icon-medal"><i class="ph-fill ph-medal"></i></div>
          </div>
          <div class="prestasi-main-col">
            <h3 class="prestasi-title">Medali Emas Olimpiade Sains Nasional (OSN) Matematika</h3>
            <span class="prestasi-student">Aisyah Putri &bull; Kelas 8C</span>
          </div>
          <div class="prestasi-meta-col">
            <span class="prestasi-level">Tingkat Nasional</span>
            <span class="prestasi-year">2025</span>
          </div>
        </div>

        <div class="prestasi-item">
          <div class="prestasi-icon-col">
            <div class="prestasi-icon-medal"><i class="ph-fill ph-medal"></i></div>
          </div>
          <div class="prestasi-main-col">
            <h3 class="prestasi-title">Juara 2 Pidato Bahasa Arab</h3>
            <span class="prestasi-student">Ibrahim Khalil &bull; Kelas 7B</span>
          </div>
          <div class="prestasi-meta-col">
            <span class="prestasi-level">Tingkat Kabupaten</span>
            <span class="prestasi-year">2025</span>
          </div>
        </div>

      </div>
    </div>

  </main>
  <div id="app-footer"></div>
  <script src="/assets/js/base/layout.js"></script>
  <script src="/assets/js/components/navigation.js"></script>
  <script src="/assets/js/main.js"></script>
</body>

</html>
'''

with open(karya_html, "w", encoding="utf8") as f:
    f.write(html_content)

print("Created karya-siswa.html")
