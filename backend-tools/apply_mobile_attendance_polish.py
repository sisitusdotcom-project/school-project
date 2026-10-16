import os
import sys

def update_guru_index():
    path = 'login/public/assets/js/pages/guru/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_block = '''<div id="attendance-late-notice-box" class="attendance-late-box" style="display:none;">
<div class="attendance-late-box-header">
<i class="ph ph-warning-circle"></i>
<span>Terdeteksi Melewati Jam Masuk Resmi (Batas: <strong id="attendance-late-limit">06:45</strong> WIB)</span>
</div>
<p class="attendance-late-box-desc">Presensi Anda tercatat melewati batas jam masuk. Anda dapat menyertakan alasan keterlambatan atau catatan permohonan banding kehadiran berikut untuk ditinjau oleh Bagian Personalia/Kepala Sekolah:</p>
<div class="form-group" style="margin-bottom:0;">
<label for="attendance-late-reason-input" class="attendance-late-label">Catatan Alasan Keterlambatan / Banding:</label>
<textarea id="attendance-late-reason-input" class="form-control attendance-late-textarea" rows="2" placeholder="Tuliskan alasan keterlambatan kehadiran (misalnya: kendala teknis perangkat, cuaca/lalu lintas, urusan mendesak, dsb)..."></textarea>
</div>
</div>
<div class="attendance-actions-row">
<button id="btn-checkin" class="btn btn-primary" disabled><i class="ph ph-sign-in"></i> Presensi Datang</button>
<button id="btn-checkout" class="btn btn-outline" disabled><i class="ph ph-sign-out"></i> Presensi Pulang</button>
</div>
<div id="proof-panel" class="attendance-proof-panel">
<div class="attendance-proof-header">
<strong>Bukti Foto Kehadiran dari Kamera</strong>
<span id="proof-status" class="text-muted">Belum ada foto</span>
</div>
<video id="attendance-camera-video" class="attendance-camera-video" autoplay playsinline muted></video>
<button id="attendance-camera-capture" type="button" class="btn btn-primary attendance-camera-capture">Ambil Foto Kamera</button>
<div id="attendance-proof-wrapper" class="attendance-proof-wrapper">
<img id="attendance-proof-preview" class="attendance-proof-preview" src="" alt="Preview bukti presensi">
</div>
</div>'''

    new_block = '''<div id="proof-panel" class="attendance-proof-panel">
<div class="attendance-proof-header">
<strong>Foto Selfie Kehadiran</strong>
<span id="proof-status" class="text-muted">Belum ada foto</span>
</div>
<video id="attendance-camera-video" class="attendance-camera-video" autoplay playsinline muted></video>
<button id="attendance-camera-capture" type="button" class="btn btn-primary attendance-camera-capture"><i class="ph ph-camera"></i> Ambil Foto Kamera</button>
<div id="attendance-proof-wrapper" class="attendance-proof-wrapper">
<img id="attendance-proof-preview" class="attendance-proof-preview" src="" alt="Preview bukti presensi">
</div>
</div>
<div id="attendance-late-notice-box" class="attendance-late-box" style="display:none;">
<div class="attendance-late-box-header">
<i class="ph-bold ph-clock-countdown"></i>
<span>Terlambat (Batas Masuk: <strong id="attendance-late-limit">06:45</strong> WIB)</span>
</div>
<p class="attendance-late-box-desc">Sertakan alasan singkat / permohonan banding kehadiran:</p>
<textarea id="attendance-late-reason-input" class="form-control attendance-late-textarea" rows="2" placeholder="Tulis alasan keterlambatan (opsional)..."></textarea>
</div>
<div class="attendance-actions-row">
<button id="btn-checkin" class="btn btn-primary" disabled><i class="ph ph-sign-in"></i> Presensi Datang</button>
<button id="btn-checkout" class="btn btn-outline" disabled><i class="ph ph-sign-out"></i> Presensi Pulang</button>
</div>'''

    if old_block in content:
        content = content.replace(old_block, new_block)
        clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(clean_lines) + '\n')
        print("pages/guru/index.js HTML flow and compact copy updated")
        return True
    else:
        print("old_block not found in pages/guru/index.js")
        return False

def update_css():
    path = 'login/public/assets/css/components.css'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_late_css = '''.attendance-camera-video{transform:scaleX(-1);}
.attendance-late-box{margin-top:16px;padding:14px;background:#FEF2F2;border:1px solid #FCA5A5;border-radius:12px;text-align:left;}
.attendance-late-box-header{display:flex;align-items:center;gap:8px;font-weight:700;font-size:13.5px;color:#991B1B;margin-bottom:6px;}
.attendance-late-box-header i{font-size:18px;}
.attendance-late-box-desc{margin:0 0 10px 0;font-size:12.5px;color:#7F1D1D;line-height:1.45;}
.attendance-late-label{font-size:12px;font-weight:600;color:#991B1B;display:block;margin-bottom:4px;}
.attendance-late-textarea{font-size:13px;border:1px solid #F87171;border-radius:8px;background:#fff;width:100%;}
.attendance-late-history-item{margin-top:10px;padding:10px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;font-size:12.5px;}
.attendance-late-tag{font-weight:700;color:#B45309;display:flex;align-items:center;gap:5px;margin-bottom:4px;}
.attendance-late-saved-reason{color:#92400E;margin-top:4px;}
.attendance-late-reason-text{margin:2px 0 0;font-style:italic;color:#78350F;}
.attendance-appeal-hint{margin:0 0 6px;color:#92400E;font-size:12px;}'''

    new_late_css = '''.attendance-camera-video{transform:scaleX(-1);}
.attendance-late-box{margin:10px 0;padding:8px 12px;background:#FEF2F2;border:1px solid #FCA5A5;border-radius:10px;text-align:left;box-sizing:border-box;}
.attendance-late-box-header{display:flex;align-items:center;gap:6px;font-weight:700;font-size:13px;color:#991B1B;margin-bottom:3px;}
.attendance-late-box-header i{font-size:16px;}
.attendance-late-box-desc{margin:0 0 6px 0;font-size:11.5px;color:#7F1D1D;line-height:1.35;}
.attendance-late-textarea{font-size:12.5px;padding:6px 10px;height:48px;min-height:48px;border:1px solid #F87171;border-radius:7px;background:#fff;width:100%;box-sizing:border-box;resize:none;}
.attendance-late-history-item{margin-top:8px;padding:8px 10px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;font-size:12px;text-align:left;}
.attendance-late-tag{font-weight:700;color:#B45309;display:flex;align-items:center;gap:4px;margin-bottom:3px;}
.attendance-late-saved-reason{color:#92400E;margin-top:3px;}
.attendance-late-reason-text{margin:1px 0 0;font-style:italic;color:#78350F;font-size:11.5px;}
.attendance-appeal-hint{margin:0 0 4px;color:#92400E;font-size:11.5px;}
@media(max-width:768px){
.attendance-status-card{padding:14px 10px;}
.attendance-status-icon{width:46px;height:46px;margin:0 auto 8px auto;}
.attendance-status-icon i{font-size:24px;}
.attendance-status-title{font-size:15px;margin:0 0 4px 0;}
.attendance-status-text{font-size:12px;margin:0 0 10px 0;line-height:1.35;}
.attendance-proof-panel{margin-top:10px;padding:10px;border-radius:10px;}
.attendance-proof-header{margin-bottom:6px;}
.attendance-proof-header strong{font-size:12.5px;}
.attendance-proof-header span{font-size:11px;}
.attendance-camera-video{max-height:175px;border-radius:8px;}
.attendance-proof-preview{max-height:175px;border-radius:8px;}
.attendance-camera-capture{padding:8px 12px;font-size:13px;margin-top:8px;}
.attendance-proof-wrapper{margin-top:8px;}
.attendance-actions-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;}
.attendance-actions-row .btn{width:100%;padding:9px 6px;font-size:12.5px;justify-content:center;white-space:nowrap;}
.attendance-history-card{margin-top:12px;padding:12px;}
.attendance-history-title{font-size:13px;margin-bottom:8px;}
}
@media(max-width:480px){
.attendance-status-card{padding:12px 8px;}
.attendance-late-box{padding:7px 9px;margin:8px 0;}
.attendance-late-box-header{font-size:12px;}
.attendance-late-box-desc{font-size:11px;margin-bottom:4px;}
.attendance-late-textarea{font-size:11.5px;height:44px;min-height:44px;padding:5px 8px;}
.attendance-actions-row .btn{font-size:11.5px;padding:8px 4px;}
.attendance-actions-row .btn i{font-size:13px;}
}'''

    if old_late_css in content:
        content = content.replace(old_late_css, new_late_css)
        clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(clean_lines) + '\n')
        print("components.css mobile attendance responsive rules applied")
        return True
    else:
        print("old_late_css not found in components.css")
        return False

if __name__ == '__main__':
    ok1 = update_guru_index()
    ok2 = update_css()
    if ok1 and ok2:
        print("ALL MOBILE REFINEMENTS APPLIED SUCCESSFULLY")
    else:
        sys.exit(1)
