import re

video_html = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\galeri\video.html"

with open(video_html, "r", encoding="utf8") as f:
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
            
            <!-- Video 1 -->
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" class="gallery-card video-card" target="_blank">
              <div class="gallery-card-img-wrapper video-card-img-wrapper">
                <img src="/assets/img/pegawai/handoyo.jpg" alt="Video">
                <div class="youtube-play-btn"></div>
              </div>
              <div class="video-card-content">
                <span class="video-date">02 September 2026</span>
                <h3 class="gallery-title">Semarak Kemerdekaan MTs Al Ittihad Poncokusumo</h3>
              </div>
            </a>

            <!-- Video 2 -->
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" class="gallery-card video-card" target="_blank">
              <div class="gallery-card-img-wrapper video-card-img-wrapper">
                <img src="/assets/img/pegawai/nawawi.jpg" alt="Video">
                <div class="youtube-play-btn"></div>
              </div>
              <div class="video-card-content">
                <span class="video-date">02 September 2026</span>
                <h3 class="gallery-title">MATAMUDA MTs Al Ittihad Poncokusumo Tahun Ajaran 2026/2027</h3>
              </div>
            </a>

            <!-- Video 3 -->
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" class="gallery-card video-card" target="_blank">
              <div class="gallery-card-img-wrapper video-card-img-wrapper">
                <img src="/assets/img/pegawai/usman.jpg" alt="Video">
                <div class="youtube-play-btn"></div>
              </div>
              <div class="video-card-content">
                <span class="video-date">02 September 2026</span>
                <h3 class="gallery-title">Pertemuan Wali Murid Kelas 9 Tahun Ajaran 2026/2027</h3>
              </div>
            </a>
            
            <!-- Video 4 -->
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" class="gallery-card video-card" target="_blank">
              <div class="gallery-card-img-wrapper video-card-img-wrapper">
                <img src="/assets/img/pegawai/fatchul-munir.jpg" alt="Video">
                <div class="youtube-play-btn"></div>
              </div>
              <div class="video-card-content">
                <span class="video-date">24 Juli 2026</span>
                <h3 class="gallery-title">Apel pembukaan KBM serentak Tahun Ajaran 2026 / 2027</h3>
              </div>
            </a>

          </div>

          <div class="pagination-container">
            <a href="#" class="pagination-btn active">1</a>
            <a href="#" class="pagination-btn">2</a>
            <a href="#" class="pagination-btn">&rsaquo;</a>
            <a href="#" class="pagination-btn">&raquo;</a>
          </div>
        </article>
'''

html = html.replace(old_article_content, new_article_content)

with open(video_html, "w", encoding="utf8") as f:
    f.write(html)

print("Updated video.html layout.")
