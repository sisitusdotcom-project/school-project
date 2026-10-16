import os

def update_guru_pages():
    path = 'login/public/assets/js/pages/guru/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_brand = '''<div class="salary-slip-brand">
<img src="assets/img/logo.webp" alt="Logo SD Muhammadiyah 1 Sedati" class="salary-slip-logo" onerror="this.src='../../assets/img/logo/logo.webp'">
<div class="salary-slip-brand-text">
<div class="salary-slip-org">MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL</div>
<div class="salary-slip-pcm">PIMPINAN CABANG MUHAMMADIYAH SEDATI</div>
<h2 class="salary-slip-title">SD MUHAMMADIYAH 1 SEDATI</h2>
<p class="salary-slip-meta">Jl. H. Syukur No. 65, Sedati Gede, Kec. Sedati, Sidoarjo 61253 | Telp/WA: 0859-6439-9398</p>
<p class="salary-slip-meta">Website: musada.sch.id | Email: sdmusada16@gmail.com</p>
</div>
</div>'''

    new_brand = '''<div class="salary-slip-brand">
<img src="assets/img/majlis-dikdaspnf.webp" alt="Logo Majelis Dikdasmen PNF" class="salary-slip-logo salary-slip-logo-dikdas" onerror="this.src='../../assets/img/link-terkait/majlis-dikdaspnf.webp'">
<div class="salary-slip-brand-text">
<div class="salary-slip-org">MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL</div>
<div class="salary-slip-pcm">PIMPINAN CABANG MUHAMMADIYAH SEDATI</div>
<h2 class="salary-slip-title">SD MUHAMMADIYAH 1 SEDATI</h2>
<p class="salary-slip-meta">Jl. H. Syukur No. 65, Sedati Gede, Kec. Sedati, Sidoarjo 61253 | Telp/WA: 0859-6439-9398</p>
<p class="salary-slip-meta">Website: musada.sch.id | Email: sdmusada16@gmail.com</p>
</div>
<img src="assets/img/logo.webp" alt="Logo SD Muhammadiyah 1 Sedati" class="salary-slip-logo salary-slip-logo-school" onerror="this.src='../../assets/img/logo/logo.webp'">
</div>'''

    if old_brand in content:
        content = content.replace(old_brand, new_brand)
        clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(clean_lines) + '\n')
        print('pages/guru/index.js updated with dual logos (Persyarikatan & SD Musada)')
    else:
        print('old_brand not found in pages/guru/index.js')

def update_components_css():
    path = 'login/public/assets/css/components.css'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_brand_css = '''.salary-slip-brand{display:flex;align-items:center;gap:18px;border-bottom:3px double #111827;padding-bottom:12px;margin-bottom:14px;min-width:0;}
.salary-slip-logo{width:68px;height:68px;object-fit:contain;flex-shrink:0;}'''

    new_brand_css = '''.salary-slip-brand{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:3px double #111827;padding-bottom:12px;margin-bottom:14px;min-width:0;}
.salary-slip-logo{width:64px;height:64px;object-fit:contain;flex-shrink:0;}'''

    if old_brand_css in content:
        content = content.replace(old_brand_css, new_brand_css)
        print('components.css desktop brand updated')
    else:
        print('old_brand_css not found in components.css')

    old_mobile_brand = '''.salary-slip-brand{gap:12px;padding-bottom:12px;margin-bottom:12px;}
.salary-slip-logo{width:44px;height:44px;}
.salary-slip-title{font-size:14px;}
.salary-slip-sub{font-size:11px;}'''

    new_mobile_brand = '''.salary-slip-brand{gap:10px;padding-bottom:10px;margin-bottom:12px;}
.salary-slip-logo{width:42px;height:42px;}
.salary-slip-org{font-size:9.5px;letter-spacing:0.3px;}
.salary-slip-pcm{font-size:9px;letter-spacing:0.3px;}
.salary-slip-title{font-size:14px;}
.salary-slip-meta{font-size:9px;}
.salary-slip-sub{font-size:11px;}'''

    if old_mobile_brand in content:
        content = content.replace(old_mobile_brand, new_mobile_brand)
        print('components.css mobile 768px brand updated')
    else:
        print('old_mobile_brand not found in components.css')

    old_small_brand = '''.salary-slip-sheet{padding:10px 8px;}
.salary-slip-brand{gap:8px;}
.salary-slip-logo{width:36px;height:36px;}
.salary-slip-title{font-size:12.5px;}
.salary-slip-sub{font-size:10px;}'''

    new_small_brand = '''.salary-slip-sheet{padding:10px 8px;}
.salary-slip-brand{gap:6px;}
.salary-slip-logo{width:32px;height:32px;}
.salary-slip-org{font-size:8px;letter-spacing:0.2px;}
.salary-slip-pcm{font-size:7.5px;letter-spacing:0.2px;}
.salary-slip-title{font-size:12px;}
.salary-slip-meta{font-size:8px;line-height:1.2;}
.salary-slip-sub{font-size:10px;}'''

    if old_small_brand in content:
        content = content.replace(old_small_brand, new_small_brand)
        print('components.css mobile 480px brand updated')
    else:
        print('old_small_brand not found in components.css')

    old_print_brand = '''.salary-slip-brand{display:flex !important;align-items:center !important;gap:16px !important;border-bottom:3px double #000 !important;padding-bottom:10px !important;margin-bottom:12px !important;}
.salary-slip-logo{width:62px !important;height:62px !important;object-fit:contain !important;}'''

    new_print_brand = '''.salary-slip-brand{display:flex !important;align-items:center !important;justify-content:space-between !important;gap:14px !important;border-bottom:3px double #000 !important;padding-bottom:10px !important;margin-bottom:12px !important;}
.salary-slip-logo{width:56px !important;height:56px !important;object-fit:contain !important;flex-shrink:0 !important;}'''

    if old_print_brand in content:
        content = content.replace(old_print_brand, new_print_brand)
        print('components.css print brand updated')
    else:
        print('old_print_brand not found in components.css')

    clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print('components.css saved successfully')

if __name__ == '__main__':
    update_guru_pages()
    update_components_css()
