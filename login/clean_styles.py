import os
import re

BASE_DIR = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\login"

ortu_path = os.path.join(BASE_DIR, 'public/assets/js/pages/ortu/index.js')
with open(ortu_path, 'r', encoding='utf-8') as f:
    ortu = f.read()

ortu = ortu.replace('style="margin-top:20px;text-align:center;padding:40px 20px;"', 'class="card panel-callout ortu-empty-panel"')
ortu = ortu.replace('class="card panel-callout" class="card panel-callout ortu-empty-panel"', 'class="card panel-callout ortu-empty-panel"')
ortu = ortu.replace('style="font-size:48px;color:var(--text-muted);margin-bottom:16px"', 'class="ortu-empty-icon"')
ortu = ortu.replace('style="margin-bottom:8px"', 'class="ortu-empty-title"')
ortu = ortu.replace('style="width:100%"', '') # tables default to 100% in components.css
ortu = ortu.replace('style="width:60%"', 'class="table-col-lg"')
ortu = ortu.replace('style="width:40%"', '')
ortu = ortu.replace('style="width:80px;text-align:center"', 'class="table-col-md text-center"')
ortu = ortu.replace('style="margin-bottom:40px"', '')
ortu = ortu.replace('style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;"', 'class="card student-report-profile"')
ortu = ortu.replace('class="card" class="card student-report-profile"', 'class="card student-report-profile"')
ortu = ortu.replace('style="margin-bottom:4px"', '')
ortu = ortu.replace('style="font-size:13px"', 'class="student-report-profile__meta"')
ortu = ortu.replace('style="text-align:right"', 'class="avg-score-header"')
ortu = ortu.replace('style="font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600"', 'class="avg-score-label"')
ortu = ortu.replace('style="margin-bottom:16px; display:flex; gap:8px; border-bottom:1px solid var(--border); padding-bottom:8px; overflow-x:auto"', 'class="tabs student-report-tabs"')
ortu = ortu.replace('class="tabs" class="tabs student-report-tabs"', 'class="tabs student-report-tabs"')
ortu = ortu.replace('style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); align-items:start; gap:16px;"', 'class="card-grid ortu-grid"')
ortu = ortu.replace('class="card-grid" class="card-grid ortu-grid"', 'class="card-grid ortu-grid"')
ortu = ortu.replace('style="display:grid;gap:16px"', 'class="ortu-sub-grid"')
ortu = ortu.replace('style="padding:16px"', 'class="card ortu-inner-card"')
ortu = ortu.replace('class="card" class="card ortu-inner-card"', 'class="card ortu-inner-card"')
ortu = ortu.replace('style="margin-bottom:12px;font-size:15px"', 'class="card-title ortu-inner-title"')
ortu = ortu.replace('style="margin-bottom:16px;font-size:15px"', 'class="card-title ortu-inner-title"')
ortu = ortu.replace('class="card-title" class="card-title ortu-inner-title"', 'class="card-title ortu-inner-title"')
ortu = ortu.replace('style="background:var(--primary-light);padding:12px;border-radius:8px;font-size:14px;color:var(--text-main)"', 'class="ortu-teacher-note"')
ortu = ortu.replace('style="margin-top:16px; border-left:4px solid var(--primary)"', 'class="card parent-response-card"')
ortu = ortu.replace('class="card" class="card parent-response-card"', 'class="card parent-response-card"')
ortu = ortu.replace('style="margin-bottom:12px"', '')
ortu = ortu.replace('style="background:#fafafa"', 'class="ortu-textarea"')
ortu = ortu.replace('style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border)"', 'class="cocurr-item"')
ortu = ortu.replace('style="position:relative;width:100%"', 'class="kepsek-chart-wrap"')
ortu = ortu.replace('style="padding:8px 0"', '')
ortu = ortu.replace('style="font-size:12px"', 'class="obs-char-meta"')
ortu = ortu.replace('style="font-size:13px;color:var(--text-muted)"', 'class="text-muted cocurr-desc"')

with open(ortu_path, 'w', encoding='utf-8') as f:
    f.write(ortu)
print("Cleaned up inline styles in ortu/index.js")

kepsek_path = os.path.join(BASE_DIR, 'public/assets/js/pages/kepsek/index.js')
with open(kepsek_path, 'r', encoding='utf-8') as f:
    kepsek = f.read()

kepsek = kepsek.replace('style="color:var(--danger)"', 'class="text-danger"')
kepsek = kepsek.replace('style="position:relative;width:100%;max-width:500px;margin:0 auto"', 'class="kepsek-chart-wrap"')
kepsek = kepsek.replace('style="text-align:center"', 'class="text-center"')
kepsek = kepsek.replace('style="text-align:center;font-weight:600"', 'class="text-center" style="font-weight:600"')
kepsek = kepsek.replace('style="margin-bottom:16px"', 'class="kepsek-back-btn"')
kepsek = kepsek.replace('''onclick="window.location.hash='#/kepsek/class/${c.id}'"''', '''data-href="#/kepsek/class/${c.id}"''')

insert_idx = kepsek.find("container.innerHTML = classArr.length ? `<div class=\"card-grid\">${cards}</div>` : '<div class=\"card\"><p class=\"text-muted\">Belum ada data kelas.</p></div>';")
if insert_idx != -1:
    listener = '''
    container.querySelectorAll('.class-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.currentTarget.dataset.href) window.location.hash = e.currentTarget.dataset.href;
      });
    });
    '''
    # We want to add this *after* the innerHTML assignment
    end_of_line = kepsek.find(";", insert_idx) + 1
    kepsek = kepsek[:end_of_line] + listener + kepsek[end_of_line:]

with open(kepsek_path, 'w', encoding='utf-8') as f:
    f.write(kepsek)
print("Cleaned up inline styles in kepsek/index.js")

