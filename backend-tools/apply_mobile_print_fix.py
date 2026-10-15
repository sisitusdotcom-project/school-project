import os

def update_components_css():
    path = 'login/public/assets/css/components.css'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_salary_css = '''.salary-slip-sheet{background:#fff;border:1px solid var(--border,#e5e7eb);border-radius:var(--radius-md,8px);padding:24px;max-width:760px;margin:0 auto;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);}
.salary-slip-brand{display:flex;align-items:center;gap:16px;border-bottom:2px solid #1f2937;padding-bottom:16px;margin-bottom:16px;}
.salary-slip-logo{width:56px;height:56px;object-fit:contain;}
.salary-slip-title{font-size:16px;font-weight:700;margin:0;color:#111827;text-transform:uppercase;letter-spacing:0.5px;}
.salary-slip-sub{font-size:12px;color:#4b5563;margin:2px 0 0 0;}
.salary-slip-info{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:18px;font-size:12.5px;background:#f9fafb;padding:12px;border-radius:6px;border:1px solid #f3f4f6;}
.salary-slip-info-row{display:flex;gap:6px;}
.salary-slip-label{color:#6b7280;min-width:110px;}
.salary-slip-val{font-weight:600;color:#111827;}
.salary-slip-table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;}
.salary-slip-table th{background:#f3f4f6;text-align:left;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;}
.salary-slip-table td{padding:8px 12px;border-bottom:1px solid #f3f4f6;}
.salary-slip-total-row td{font-weight:700;font-size:14px;background:#f0fdf4;color:#166534;border-top:2px solid #bbf7d0;}
.salary-slip-signatures{display:flex;justify-content:space-between;margin-top:28px;padding-top:12px;font-size:12px;text-align:center;}
.salary-slip-sig-box{min-width:160px;}
.salary-slip-sig-space{height:54px;}
.salary-slip-actions{display:flex;gap:10px;justify-content:flex-end;margin-bottom:16px;flex-wrap:wrap;}
.salary-slip-notice{font-size:12px;color:#4b5563;background:#eff6ff;border-left:4px solid #2563eb;padding:10px 14px;border-radius:4px;margin-bottom:16px;line-height:1.5;}'''

    new_salary_css = '''.salary-slip-sheet{background:#fff;border:1px solid var(--border,#e5e7eb);border-radius:var(--radius-md,8px);padding:24px;max-width:760px;margin:0 auto;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);min-width:0;width:100%;box-sizing:border-box;}
.salary-slip-brand{display:flex;align-items:center;gap:16px;border-bottom:2px solid #1f2937;padding-bottom:16px;margin-bottom:16px;min-width:0;}
.salary-slip-logo{width:56px;height:56px;object-fit:contain;flex-shrink:0;}
.salary-slip-title{font-size:16px;font-weight:700;margin:0;color:#111827;text-transform:uppercase;letter-spacing:0.5px;}
.salary-slip-sub{font-size:12px;color:#4b5563;margin:2px 0 0 0;}
.salary-slip-info{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 18px;margin-bottom:18px;font-size:12.5px;background:#f9fafb;padding:12px 14px;border-radius:6px;border:1px solid #f3f4f6;}
.salary-slip-info>*{min-width:0;}
.salary-slip-info-row{display:flex;gap:4px;min-width:0;align-items:flex-start;}
.salary-slip-label{color:#6b7280;width:125px;flex-shrink:0;min-width:0;}
.salary-slip-sep{color:#6b7280;width:10px;flex-shrink:0;text-align:center;}
.salary-slip-val{font-weight:600;color:#111827;flex:1;min-width:0;word-break:break-word;overflow-wrap:anywhere;}
.salary-slip-table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;table-layout:fixed;}
.salary-slip-table th{background:#f3f4f6;text-align:left;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;}
.salary-slip-table td{padding:8px 12px;border-bottom:1px solid #f3f4f6;word-break:break-word;overflow-wrap:anywhere;}
.salary-slip-total-row td{font-weight:700;font-size:14px;background:#f0fdf4;color:#166534;border-top:2px solid #bbf7d0;}
.salary-slip-signatures{display:flex;justify-content:space-between;margin-top:28px;padding-top:12px;font-size:12px;text-align:center;gap:16px;}
.salary-slip-sig-box{min-width:140px;flex:1;}
.salary-slip-sig-space{height:54px;}
.salary-slip-actions{display:flex;gap:10px;justify-content:flex-end;margin-bottom:16px;flex-wrap:wrap;}
.salary-slip-notice{font-size:12px;color:#4b5563;background:#eff6ff;border-left:4px solid #2563eb;padding:10px 14px;border-radius:4px;margin-bottom:16px;line-height:1.5;word-break:break-word;overflow-wrap:anywhere;}
@media (max-width:768px){
.salary-slip-sheet{padding:14px;margin:0 auto;}
.salary-slip-brand{gap:12px;padding-bottom:12px;margin-bottom:12px;}
.salary-slip-logo{width:44px;height:44px;}
.salary-slip-title{font-size:14px;}
.salary-slip-sub{font-size:11px;}
.salary-slip-info{grid-template-columns:1fr;gap:8px;padding:10px;margin-bottom:14px;}
.salary-slip-label{width:115px;font-size:12px;}
.salary-slip-sep{width:8px;font-size:12px;}
.salary-slip-val{font-size:12px;}
.salary-slip-table{font-size:12px;margin-bottom:12px;}
.salary-slip-table th,.salary-slip-table td{padding:6px 8px;}
.salary-slip-total-row td{font-size:12.5px;}
.salary-slip-signatures{margin-top:18px;gap:12px;font-size:11px;}
.salary-slip-sig-space{height:44px;}
}
@media (max-width:480px){
.salary-slip-sheet{padding:10px 8px;}
.salary-slip-brand{gap:8px;}
.salary-slip-logo{width:36px;height:36px;}
.salary-slip-title{font-size:12.5px;}
.salary-slip-sub{font-size:10px;}
.salary-slip-info{padding:8px 6px;gap:6px;}
.salary-slip-info-row{font-size:11px;}
.salary-slip-label{width:95px;font-size:11px;}
.salary-slip-sep{width:6px;font-size:11px;}
.salary-slip-val{font-size:11px;}
.salary-slip-table{font-size:11px;}
.salary-slip-table th,.salary-slip-table td{padding:5px 4px;}
.salary-slip-total-row td{font-size:11.5px;}
.salary-slip-sig-box strong{font-size:11px;}
}
@media print{
@page{size:A4 portrait;margin:10mm 12mm;}
*,*:before,*:after{box-sizing:border-box !important;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}
html,body{background:#fff !important;color:#000 !important;margin:0 !important;padding:0 !important;}
#app-shell,#login-view,.app-sidebar,#app-sidebar,#sidebar,.sidebar,#top-bar,.topbar,.app-header,nav,header,footer,.feature-guide-card,.feature-guide-toggle,.salary-slip-actions,.salary-slip-notice,.modal-overlay,#app-loading{display:none !important;}
body *{visibility:hidden;}
.salary-slip-sheet,.salary-slip-sheet *{visibility:visible;}
.salary-slip-sheet{position:absolute !important;left:0 !important;top:0 !important;width:100% !important;max-width:100% !important;margin:0 !important;padding:16px 20px !important;border:1px solid #111827 !important;border-radius:4px !important;box-shadow:none !important;background:#fff !important;page-break-inside:avoid !important;}
.salary-slip-brand{display:flex !important;align-items:center !important;gap:16px !important;border-bottom:2px solid #111827 !important;padding-bottom:12px !important;margin-bottom:14px !important;}
.salary-slip-logo{width:52px !important;height:52px !important;object-fit:contain !important;}
.salary-slip-title{font-size:16px !important;font-weight:700 !important;color:#000 !important;letter-spacing:0.5px !important;margin:0 !important;}
.salary-slip-sub{font-size:11.5px !important;color:#374151 !important;margin:2px 0 0 0 !important;}
.salary-slip-info{display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:6px 16px !important;background:#f9fafb !important;border:1px solid #d1d5db !important;padding:10px 14px !important;margin-bottom:14px !important;font-size:11.5px !important;}
.salary-slip-info-row{display:flex !important;gap:4px !important;min-width:0 !important;}
.salary-slip-label{color:#4b5563 !important;width:125px !important;flex-shrink:0 !important;font-weight:500 !important;}
.salary-slip-sep{color:#4b5563 !important;width:10px !important;flex-shrink:0 !important;text-align:center !important;}
.salary-slip-val{color:#000 !important;font-weight:600 !important;flex:1 !important;}
.salary-slip-table{width:100% !important;border-collapse:collapse !important;margin-bottom:12px !important;font-size:11.5px !important;}
.salary-slip-table th{background:#f3f4f6 !important;border:1px solid #d1d5db !important;padding:6px 10px !important;color:#111827 !important;font-weight:600 !important;}
.salary-slip-table td{border:1px solid #e5e7eb !important;padding:5px 10px !important;color:#000 !important;}
.salary-slip-total-row td{background:#f0fdf4 !important;border-top:2px solid #86efac !important;border-bottom:2px solid #86efac !important;font-weight:700 !important;font-size:12.5px !important;color:#14532d !important;}
.salary-slip-signatures{display:flex !important;justify-content:space-between !important;margin-top:20px !important;padding-top:10px !important;font-size:11.5px !important;page-break-inside:avoid !important;}
.salary-slip-sig-box{min-width:160px !important;text-align:center !important;}
.salary-slip-sig-space{height:55px !important;}
}'''

    if old_salary_css in content:
        content = content.replace(old_salary_css, new_salary_css)
        clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(clean_lines) + '\n')
        print('Updated components.css successfully')
    else:
        print('old_salary_css not found in components.css')

def update_guru_pages_slip_html():
    path = 'login/public/assets/js/pages/guru/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_info = '''        <div class="salary-slip-info">
          <div class="salary-slip-info-row"><span class="salary-slip-label">Nama Pegawai</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(slip.name)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">NBM / NUPTK</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(slip.nbm)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Jabatan / Tugas</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(slip.position)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Status Kepegawaian</span><span class="salary-slip-val">: ${AppConfig.escapeHtml(slip.empStatus)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Kehadiran (Cutoff)</span><span class="salary-slip-val">: ${slip.totalPresent} / ${slip.totalWorkDays} Hari (${slip.onTimeCount} Tepat, ${slip.lateCount} Terlambat)</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Status Pencairan</span><span class="salary-slip-val">: <span class="badge ${slip.badgeClass}">${AppConfig.escapeHtml(slip.statusText)}</span></span></div>
        </div>'''

    new_info = '''        <div class="salary-slip-info">
          <div class="salary-slip-info-row"><span class="salary-slip-label">Nama Pegawai</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${AppConfig.escapeHtml(slip.name)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">NBM / NUPTK</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${AppConfig.escapeHtml(slip.nbm)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Jabatan / Tugas</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${AppConfig.escapeHtml(slip.position)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Status Kepegawaian</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${AppConfig.escapeHtml(slip.empStatus)}</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Kehadiran (Cutoff)</span><span class="salary-slip-sep">:</span><span class="salary-slip-val">${slip.totalPresent} / ${slip.totalWorkDays} Hari (${slip.onTimeCount} Tepat, ${slip.lateCount} Terlambat)</span></div>
          <div class="salary-slip-info-row"><span class="salary-slip-label">Status Pencairan</span><span class="salary-slip-sep">:</span><span class="salary-slip-val"><span class="badge ${slip.badgeClass}">${AppConfig.escapeHtml(slip.statusText)}</span></span></div>
        </div>'''

    if old_info in content:
        content = content.replace(old_info, new_info)
        clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(clean_lines) + '\n')
        print('Updated pages/guru/index.js info markup successfully')
    else:
        print('old_info not found in pages/guru/index.js')

if __name__ == '__main__':
    update_components_css()
    update_guru_pages_slip_html()
