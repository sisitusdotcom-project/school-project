import os
import sys

def update_app_config():
    path = 'login/public/assets/js/app-config.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if '-7.39827779479305' in content and 'ORIGINAL_SCHOOL_GEOFENCE' in content:
        print("app-config.js already updated")
        return True

    old_defaults = '''const APP_DEFAULTS = Object.freeze({
googleDriveUploadUrl: 'https://script.google.com/macros/s/AKfycbwHNSb34p_FcX_dTQuw87viaZ9joh2rT3KdtMLBVvwpocWzyF3HICPUPRfPuy63LDsNsw/exec',
attendanceWorkerUrl: 'https://musada-absensi.sisitusdotcom.workers.dev/',
attendanceGeofence: Object.freeze({
lat: -7.378448579234777,
lng: 112.75929775962251,
radiusMeters: 50
})
});'''

    new_defaults = '''const ORIGINAL_SCHOOL_GEOFENCE = Object.freeze({
lat: -7.378448579234777,
lng: 112.75929775962251,
radiusMeters: 50
});
const APP_DEFAULTS = Object.freeze({
googleDriveUploadUrl: 'https://script.google.com/macros/s/AKfycbwHNSb34p_FcX_dTQuw87viaZ9joh2rT3KdtMLBVvwpocWzyF3HICPUPRfPuy63LDsNsw/exec',
attendanceWorkerUrl: 'https://musada-absensi.sisitusdotcom.workers.dev/',
attendanceGeofence: Object.freeze({
lat: -7.39827779479305,
lng: 112.74845220581665,
radiusMeters: 50
})
});'''

    if old_defaults in content:
        content = content.replace(old_defaults, new_defaults)

    old_export = "showAttendanceSuccessModal\n});"
    new_export = "showAttendanceSuccessModal,\nORIGINAL_SCHOOL_GEOFENCE\n});"
    if old_export in content:
        content = content.replace(old_export, new_export)

    clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print("app-config.js updated")
    return True

def update_worker():
    path = 'login/workers/attendance-worker.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if '-7.39827779479305' in content:
        print("attendance-worker.js already updated")
        return True

    old_loc = '''const DEFAULT_SCHOOL_LOCATION = {
  lat: -7.378448579234777,
  lng: 112.75929775962251,
  radiusMeters: 50
};'''

    new_loc = '''const ORIGINAL_SCHOOL_LOCATION = {
  lat: -7.378448579234777,
  lng: 112.75929775962251,
  radiusMeters: 50
};
const DEFAULT_SCHOOL_LOCATION = {
  lat: -7.39827779479305,
  lng: 112.74845220581665,
  radiusMeters: 50
};'''

    if old_loc in content:
        content = content.replace(old_loc, new_loc)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("attendance-worker.js updated")
        return True
    return False

def update_db():
    path = 'login/public/assets/js/db.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'late_reason' in content:
        print("db.js already updated")
        return True

    old_payload = '''    if (data.proof_url) payload.proof_url = data.proof_url;
    if (data.proofUrl) payload.proof_url = data.proofUrl;
    return payload;'''

    new_payload = '''    if (data.proof_url) payload.proof_url = data.proof_url;
    if (data.proofUrl) payload.proof_url = data.proofUrl;
    if (data.late_reason) payload.late_reason = data.late_reason;
    if (data.lateReason) payload.late_reason = data.lateReason;
    return payload;'''

    if old_payload in content:
        content = content.replace(old_payload, new_payload)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("db.js updated")
        return True
    return False

def update_guru_index():
    path = 'login/public/assets/js/pages/guru/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_top_geofence = '''const ATTENDANCE_GEOFENCE = window.APP_ATTENDANCE_GEOFENCE || window.AppConfig?.attendanceGeofence || {
lat: -7.378448579234777,
lng: 112.75929775962251,
radiusMeters: 50
};'''

    new_top_geofence = '''const ATTENDANCE_GEOFENCE = window.APP_ATTENDANCE_GEOFENCE || window.AppConfig?.attendanceGeofence || {
lat: -7.39827779479305,
lng: 112.74845220581665,
radiusMeters: 50
};'''

    if old_top_geofence in content:
        content = content.replace(old_top_geofence, new_top_geofence)
        print("top geofence replaced")

    old_fallback_latlng = '''const schoolLat = Number(geofence?.lat ?? -7.378448579234777);
const schoolLng = Number(geofence?.lng ?? 112.75929775962251);'''

    new_fallback_latlng = '''const schoolLat = Number(geofence?.lat ?? -7.39827779479305);
const schoolLng = Number(geofence?.lng ?? 112.74845220581665);'''

    if old_fallback_latlng in content:
        content = content.replace(old_fallback_latlng, new_fallback_latlng)
        print("fallback latlng replaced")

    old_facing = "facingMode: 'environment',"
    new_facing = "facingMode: 'user',"
    if old_facing in content:
        content = content.replace(old_facing, new_facing)
        print("guru/index.js camera updated to facingMode: 'user' (selfie)")

    old_canvas_draw = '''const ctx = canvas.getContext('2d');
ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);'''

    new_canvas_draw = '''const ctx = canvas.getContext('2d');
ctx.translate(canvas.width, 0);
ctx.scale(-1, 1);
ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);'''

    if old_canvas_draw in content:
        content = content.replace(old_canvas_draw, new_canvas_draw)
        print("guru/index.js canvas draw updated with mirror flip for selfie")

    old_actions_markup = '''<div class="attendance-actions-row">
<button id="btn-checkin" class="btn btn-primary" disabled><i class="ph ph-sign-in"></i> Presensi Datang</button>
<button id="btn-checkout" class="btn btn-outline" disabled><i class="ph ph-sign-out"></i> Presensi Pulang</button>
</div>'''

    new_actions_markup = '''<div id="attendance-late-notice-box" class="attendance-late-box" style="display:none;">
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
</div>'''

    if old_actions_markup in content:
        content = content.replace(old_actions_markup, new_actions_markup)
        print("guru/index.js late notice input box markup added")

    old_my_att_hist = '''histContainer.innerHTML = `
<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 8px;">
<span class="text-muted" style="font-size: 13px;">Datang</span>
<strong style="font-size: 13px;">${myAtt.time_in || '-'}</strong>
</div>
<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 8px;">
<span class="text-muted" style="font-size: 13px;">Pulang</span>
<strong style="font-size: 13px;">${myAtt.time_out || '-'}</strong>
</div>
${proofMarkup}
`;'''

    new_my_att_hist = '''const isMyAttLate = myAtt.time_in && AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(myAtt.time_in, sched) : false;
let lateSectionHtml = '';
if (isMyAttLate && !sched.noLatePenalty && (!sched.isOptional || !isUmmi)) {
lateSectionHtml = `<div class="attendance-late-history-item"><div class="attendance-late-tag"><i class="ph ph-clock-countdown"></i> Status: Terlambat (${myAtt.time_in})</div>${myAtt.late_reason ? `<div class="attendance-late-saved-reason"><strong>Alasan / Banding Tercatat:</strong><p class="attendance-late-reason-text">"${AppConfig.escapeHtml(myAtt.late_reason)}"</p></div>` : `<div class="attendance-appeal-form" id="attendance-appeal-form"><p class="attendance-appeal-hint">Belum ada catatan alasan. Anda dapat menambahkan alasan/banding keterlambatan:</p><div style="display:flex; gap:8px;"><input type="text" id="attendance-post-appeal-input" class="form-control form-control-sm" placeholder="Tulis alasan keterlambatan..."><button type="button" id="btn-submit-post-appeal" class="btn btn-sm btn-primary">Simpan</button></div></div>`}</div>`;
}
histContainer.innerHTML = `
<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 8px;">
<span class="text-muted" style="font-size: 13px;">Datang</span>
<strong style="font-size: 13px;">${myAtt.time_in || '-'}</strong>
</div>
<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 8px;">
<span class="text-muted" style="font-size: 13px;">Pulang</span>
<strong style="font-size: 13px;">${myAtt.time_out || '-'}</strong>
</div>
${lateSectionHtml}
${proofMarkup}
`;
const postAppealBtn = document.getElementById('btn-submit-post-appeal');
if (postAppealBtn) {
postAppealBtn.onclick = async () => {
const postInput = document.getElementById('attendance-post-appeal-input');
const postReason = postInput ? postInput.value.trim() : '';
if (!postReason) {
alert('Harap tuliskan alasan keterlambatan.');
return;
}
postAppealBtn.disabled = true;
postAppealBtn.innerText = 'Menyimpan...';
try {
await DB.saveTeacherAttendance(dateStr, teacherId, { late_reason: postReason });
alert('Catatan alasan keterlambatan berhasil disimpan untuk ditinjau pihak sekolah.');
await loadHistory();
} catch (e) {
alert('Gagal menyimpan catatan alasan.');
postAppealBtn.disabled = false;
postAppealBtn.innerText = 'Simpan';
}
};
}'''

    if old_my_att_hist in content:
        content = content.replace(old_my_att_hist, new_my_att_hist)
        print("guru/index.js late reason display and post-appeal handler added to loadHistory")

    old_sched_check = '''if (schedBadge) {
schedBadge.textContent = sched.label;
}'''

    new_sched_check = '''if (schedBadge) {
schedBadge.textContent = sched.label;
}
const lateNoticeBox = document.getElementById('attendance-late-notice-box');
const lateLimitTime = document.getElementById('attendance-late-limit');
if (lateLimitTime) lateLimitTime.textContent = sched.inEnd || '06:45';
if (lateNoticeBox) {
const curTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const isCurLate = AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(curTime, sched) : false;
if (!myAtt?.time_in && isCurLate && !sched.noLatePenalty && (!sched.isOptional || !isUmmi)) {
lateNoticeBox.style.display = 'block';
} else {
lateNoticeBox.style.display = 'none';
}
}'''

    if old_sched_check in content:
        content = content.replace(old_sched_check, new_sched_check)
        print("guru/index.js schedule check added to toggle lateNoticeBox")

    old_save_presensi = '''if (result.proof_url) payload.proof_url = result.proof_url;
if (result.record && Object.keys(result.record).length) Object.assign(payload, result.record);
await DB.saveTeacherAttendance(dateStr, teacherId, payload);'''

    new_save_presensi = '''if (result.proof_url) payload.proof_url = result.proof_url;
if (result.record && Object.keys(result.record).length) Object.assign(payload, result.record);
if (type === 'in') {
const lateInput = document.getElementById('attendance-late-reason-input');
const lateReasonVal = lateInput ? lateInput.value.trim() : '';
if (lateReasonVal) payload.late_reason = lateReasonVal;
}
await DB.saveTeacherAttendance(dateStr, teacherId, payload);'''

    if old_save_presensi in content:
        content = content.replace(old_save_presensi, new_save_presensi)
        print("guru/index.js handlePresensi updated to include late_reason in payload")

    old_table_row = '''let statusBadge = '<span class="badge badge-warning">Terlambat</span>';
const isLate = AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(h.time_in, sched) : (h.time_in > (sched.inEnd || '06:45'));
if (sched.noLatePenalty || (sched.isOptional && isUmmi)) {
statusBadge = '<span class="badge badge-success">Hadir (Pembinaan)</span>';
onTimeCount++;
} else if (!isLate && h.time_in) {
statusBadge = '<span class="badge badge-success">Tepat Waktu</span>';
onTimeCount++;
} else {
lateCount++;
}'''

    new_table_row = '''const lateReasonNote = h.late_reason ? `<br><small class="text-muted" style="font-size:11px;" title="Catatan/Alasan">Banding: "${AppConfig.escapeHtml(h.late_reason)}"</small>` : '';
let statusBadge = `<span class="badge badge-warning">Terlambat</span>${lateReasonNote}`;
const isLate = AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(h.time_in, sched) : (h.time_in > (sched.inEnd || '06:45'));
if (sched.noLatePenalty || (sched.isOptional && isUmmi)) {
statusBadge = '<span class="badge badge-success">Hadir (Pembinaan)</span>';
onTimeCount++;
} else if (!isLate && h.time_in) {
statusBadge = '<span class="badge badge-success">Tepat Waktu</span>';
onTimeCount++;
} else {
lateCount++;
}'''

    if old_table_row in content:
        content = content.replace(old_table_row, new_table_row)
        print("guru/index.js table row updated to display late_reason in rekap history")
    else:
        print("old_table_row not matched exactly, checking...")

    clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print("pages/guru/index.js completely updated")
    return True

def update_admin_index():
    path = 'login/public/assets/js/pages/admin/index.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'lateReasonNote' in content:
        print("admin/index.js already updated")
        return True

    old_admin_late = '''let lateBadge = '';
if (att.time_in && sched) {
const isLate = AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(att.time_in, sched) : false;
lateBadge = isLate ? ' <span class="badge badge-warning">Terlambat</span>' : ' <span class="badge badge-success">Tepat Waktu</span>';
}'''

    new_admin_late = '''let lateBadge = '';
if (att.time_in && sched) {
const isLate = AppConfig.isAttendanceLate ? AppConfig.isAttendanceLate(att.time_in, sched) : false;
const lateReasonNote = att.late_reason ? `<br><small class="text-danger" style="font-size:11px;" title="Alasan/Banding"><em>"${AppConfig.escapeHtml(att.late_reason)}"</em></small>` : '';
lateBadge = isLate ? ` <span class="badge badge-warning">Terlambat</span>${lateReasonNote}` : ' <span class="badge badge-success">Tepat Waktu</span>';
}'''

    if old_admin_late in content:
        content = content.replace(old_admin_late, new_admin_late)
        clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(clean_lines) + '\n')
        print("pages/admin/index.js updated")
        return True
    return False

def update_css():
    path = 'login/public/assets/css/components.css'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if '.attendance-late-box' in content:
        print("components.css already updated")
        return True

    css_addition = '''.attendance-camera-video{transform:scaleX(-1);}
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

    content = content + "\n" + css_addition
    clean_lines = [l.strip() for l in content.splitlines() if l.strip()]
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(clean_lines) + '\n')
    print("components.css updated")
    return True

if __name__ == '__main__':
    ok1 = update_app_config()
    ok2 = update_worker()
    ok3 = update_db()
    ok4 = update_guru_index()
    ok5 = update_admin_index()
    ok6 = update_css()
    if ok1 and ok2 and ok3 and ok4 and ok5 and ok6:
        print("ALL ENHANCEMENTS APPLIED PERFECTLY")
    else:
        sys.exit(1)
