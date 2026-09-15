import re

foto_html = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\galeri\foto.html"

with open(foto_html, "r", encoding="utf8") as f:
    html = f.read()

# Add gallery.css link
if "gallery.css" not in html:
    html = html.replace(
        '<link rel="stylesheet" href="/assets/css/main.css" />', 
        '<link rel="stylesheet" href="/assets/css/main.css" />\n  <link rel="stylesheet" href="/assets/css/pages/gallery.css" />'
    )

old_article_content = re.search(r'<div class="section-divider"></div>(.*?)<div id="app-sidebar"></div>', html, re.DOTALL).group(1)

new_article_content = '''
          <div class="gallery-page-grid">
            
            <!-- Album 1 -->
            <a href="/galeri/detail-foto.html" class="gallery-card">
              <div class="gallery-card-img-wrapper">
                <img src="/assets/img/pegawai/handoyo.jpg" alt="MATSAHAD">
              </div>
              <div class="gallery-card-content">
                <div class="gallery-meta">
                  <span class="gallery-badge">3 Foto</span>
                  <span class="gallery-date">Sabtu, 22 Januari 2022</span>
                </div>
                <h3 class="gallery-title">MATSAHAD</h3>
              </div>
            </a>

            <!-- Album 2 -->
            <a href="/galeri/detail-foto.html" class="gallery-card">
              <div class="gallery-card-img-wrapper">
                <img src="/assets/img/pegawai/nawawi.jpg" alt="LABKOM">
              </div>
              <div class="gallery-card-content">
                <div class="gallery-meta">
                  <span class="gallery-badge">4 Foto</span>
                  <span class="gallery-date">Jumat, 12 November 2021</span>
                </div>
                <h3 class="gallery-title">LABKOM</h3>
              </div>
            </a>

            <!-- Album 3 -->
            <a href="/galeri/detail-foto.html" class="gallery-card">
              <div class="gallery-card-img-wrapper">
                <img src="/assets/img/pegawai/usman.jpg" alt="MATSAHAD">
              </div>
              <div class="gallery-card-content">
                <div class="gallery-meta">
                  <span class="gallery-badge">12 Foto</span>
                  <span class="gallery-date">Kamis, 20 Oktober 2022</span>
                </div>
                <h3 class="gallery-title">MATSAHAD</h3>
              </div>
            </a>

            <!-- Album 4 -->
            <a href="/galeri/detail-foto.html" class="gallery-card">
              <div class="gallery-card-img-wrapper">
                <img src="/assets/img/pegawai/fatchul-munir.jpg" alt="KSM SD MI KEC PONCOKUSUMO 2020">
                <div class="album-icon-overlay" style="position: absolute; top: 10px; left: 10px; width: 32px; height: 32px; background: #fbbf24; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                  <i class="ph-bold ph-camera" style="font-size: 1.1rem; color: #000;"></i>
                </div>
              </div>
              <div class="gallery-card-content">
                <div class="gallery-meta">
                  <span class="gallery-badge">4 Foto</span>
                  <span class="gallery-date">Kamis, 20 Oktober 2022</span>
                </div>
                <h3 class="gallery-title">KSM SD MI KEC PONCOKUSUMO 2020</h3>
              </div>
            </a>

          </div>

          <div class="pagination-container">
            <a href="#" class="pagination-btn active">1</a>
          </div>
        </article>
'''

html = html.replace(old_article_content, new_article_content)

with open(foto_html, "w", encoding="utf8") as f:
    f.write(html)

print("Updated foto.html layout.")
