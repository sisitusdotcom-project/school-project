import os

def update_guru_pages():
    path = 'login/public/assets/js/pages/guru/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_brand = '''<div class="salary-slip-brand">
<img src="assets/images/logo-musada.png" alt="Logo Sekolah" class="salary-slip-logo" onerror="this.style.display='none'">
<div>
<h2 class="salary-slip-title">SD MUHAMMADIYAH 1 SEDATI</h2>
<p class="salary-slip-sub">Surat Bukti Rincian Honorarium & Gaji Pendidik / Tenaga Kependidikan</p>
<p class="salary-slip-sub">Periode: <strong>${cutoff.monthLabel}</strong> (${cutoff.cutoffLabel})</p>
</div>
</div>'''

    new_brand = '''<div class="salary-slip-brand">
<img src="assets/img/logo.webp" alt="Logo SD Muhammadiyah 1 Sedati" class="salary-slip-logo" onerror="this.src='../../assets/img/logo/logo.webp'">
<div class="salary-slip-brand-text">
<div class="salary-slip-org">MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL</div>
<div class="salary-slip-pcm">PIMPINAN CABANG MUHAMMADIYAH SEDATI</div>
<h2 class="salary-slip-title">SD MUHAMMADIYAH 1 SEDATI</h2>
<p class="salary-slip-meta">Jl. H. Syukur No. 65, Sedati Gede, Kec. Sedati, Sidoarjo 61253 | Telp/WA: 0859-6439-9398</p>
<p class="salary-slip-meta">Website: musada.sch.id | Email: sdmusada16@gmail.com</p>
</div>
</div>
<div class="salary-slip-doc-header">
<h3 class="salary-slip-doc-title">SURAT BUKTI RINCIAN HONORARIUM & GAJI PEGAWAI</h3>
<p class="salary-slip-doc-sub">Periode: <strong>${cutoff.monthLabel}</strong> (${cutoff.cutoffLabel})</p>
</div>'''

    if old_brand in content:
        content = content.replace(old_brand, new_brand)
        clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(clean_lines) + '\n')
        print('pages/guru/index.js updated with official letterhead and logo')
    else:
        print('old_brand not found in pages/guru/index.js')

def update_components_css():
    path = 'login/public/assets/css/components.css'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_css_part = '''.salary-slip-sheet{background:#fff;border:1px solid var(--border,#e5e7eb);border-radius:var(--radius-md,8px);padding:24px;max-width:760px;margin:0 auto;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);min-width:0;width:100%;box-sizing:border-box;}
.salary-slip-brand{display:flex;align-items:center;gap:16px;border-bottom:2px solid #1f2937;padding-bottom:16px;margin-bottom:16px;min-width:0;}
.salary-slip-logo{width:56px;height:56px;object-fit:contain;flex-shrink:0;}
.salary-slip-title{font-size:16px;font-weight:700;margin:0;color:#111827;text-transform:uppercase;letter-spacing:0.5px;}
.salary-slip-sub{font-size:12px;color:#4b5563;margin:2px 0 0 0;}'''

    new_css_part = '''.salary-slip-sheet{background:#fff;border:1px solid var(--border,#e5e7eb);border-radius:var(--radius-md,8px);padding:24px 28px;max-width:780px;margin:0 auto;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);min-width:0;width:100%;box-sizing:border-box;}
.salary-slip-brand{display:flex;align-items:center;gap:18px;border-bottom:3px double #111827;padding-bottom:12px;margin-bottom:14px;min-width:0;}
.salary-slip-logo{width:68px;height:68px;object-fit:contain;flex-shrink:0;}
.salary-slip-brand-text{flex:1;min-width:0;text-align:center;}
.salary-slip-org{font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:0.5px;line-height:1.2;margin:0 0 2px 0;}
.salary-slip-pcm{font-size:10.5px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:0.5px;line-height:1.2;margin:0 0 2px 0;}
.salary-slip-title{font-size:18px;font-weight:800;margin:0 0 2px 0;color:#111827;text-transform:uppercase;letter-spacing:0.8px;}
.salary-slip-meta{font-size:10.5px;color:#6b7280;margin:1px 0 0 0;line-height:1.3;}
.salary-slip-doc-header{text-align:center;margin-bottom:16px;}
.salary-slip-doc-title{font-size:13.5px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 2px 0;text-decoration:underline;}
.salary-slip-doc-sub{font-size:11.5px;color:#4b5563;margin:0;}
.salary-slip-sub{font-size:12px;color:#4b5563;margin:2px 0 0 0;}'''

    if old_css_part in content:
        content = content.replace(old_css_part, new_css_part)
        print('components.css brand styles updated')
    else:
        print('old_css_part not found in components.css')

    old_print_brand = '''.salary-slip-brand{display:flex !important;align-items:center !important;gap:16px !important;border-bottom:2px solid #111827 !important;padding-bottom:12px !important;margin-bottom:14px !important;}
.salary-slip-logo{width:52px !important;height:52px !important;object-fit:contain !important;}
.salary-slip-title{font-size:16px !important;font-weight:700 !important;color:#000 !important;letter-spacing:0.5px !important;margin:0 !important;}
.salary-slip-sub{font-size:11.5px !important;color:#374151 !important;margin:2px 0 0 0 !important;}'''

    new_print_brand = '''.salary-slip-brand{display:flex !important;align-items:center !important;gap:16px !important;border-bottom:3px double #000 !important;padding-bottom:10px !important;margin-bottom:12px !important;}
.salary-slip-logo{width:62px !important;height:62px !important;object-fit:contain !important;}
.salary-slip-brand-text{flex:1 !important;text-align:center !important;}
.salary-slip-org{font-size:10.5px !important;font-weight:700 !important;color:#000 !important;text-transform:uppercase !important;margin:0 0 1px 0 !important;}
.salary-slip-pcm{font-size:10px !important;font-weight:700 !important;color:#000 !important;text-transform:uppercase !important;margin:0 0 1px 0 !important;}
.salary-slip-title{font-size:17px !important;font-weight:800 !important;color:#000 !important;letter-spacing:0.8px !important;margin:0 0 2px 0 !important;}
.salary-slip-meta{font-size:9.5px !important;color:#1f2937 !important;margin:1px 0 0 0 !important;line-height:1.25 !important;}
.salary-slip-doc-header{text-align:center !important;margin-bottom:12px !important;}
.salary-slip-doc-title{font-size:13px !important;font-weight:700 !important;color:#000 !important;text-transform:uppercase !important;margin:0 0 2px 0 !important;text-decoration:underline !important;}
.salary-slip-doc-sub{font-size:11px !important;color:#000 !important;margin:0 !important;}
.salary-slip-sub{font-size:11px !important;color:#374151 !important;margin:2px 0 0 0 !important;}'''

    if old_print_brand in content:
        content = content.replace(old_print_brand, new_print_brand)
        print('components.css print brand styles updated')
    else:
        print('old_print_brand not found in components.css')

    clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print('components.css saved successfully')

if __name__ == '__main__':
    update_guru_pages()
    update_components_css()
