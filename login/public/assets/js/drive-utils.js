const DriveBridge = {
  extractFileId(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const url = rawUrl.trim();
    if (!url) return null;
    const m1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m1 && m1[1]) return m1[1];
    const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2 && m2[1]) return m2[1];
    const m3 = url.match(/drive\.usercontent\.google\.com\/[^\/]+\/([a-zA-Z0-9_-]+)/);
    if (m3 && m3[1]) return m3[1];
    const m4 = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (m4 && m4[1]) return m4[1];
    const m5 = url.match(/docs\.google\.com\/[^\/]+\/d\/([a-zA-Z0-9_-]+)/);
    if (m5 && m5[1]) return m5[1];
    return null;
  },
  getServerDisplayUrl(rawUrl) {
    const id = this.extractFileId(rawUrl);
    if (id) return `https://server.musada.sch.id/docs/${id}`;
    return rawUrl || '';
  },
  getPreviewEmbedUrl(rawUrl) {
    const id = this.extractFileId(rawUrl);
    if (id) return `https://drive.google.com/file/d/${id}/preview`;
    return rawUrl || '';
  },
  getViewerUrl(rawUrl, title = 'Dokumen') {
    if (!rawUrl || typeof rawUrl !== 'string') return '#';
    const id = this.extractFileId(rawUrl);
    const cleanTitle = encodeURIComponent(title || 'Dokumen');
    if (id) return `viewer.html?id=${encodeURIComponent(id)}&title=${cleanTitle}`;
    return `viewer.html?file=${encodeURIComponent(rawUrl.trim())}&title=${cleanTitle}`;
  },
  normalizeDriveImageUrl(rawUrl, size = 'w200', fallback = '') {
    if (!rawUrl || typeof rawUrl !== 'string') return fallback;
    const url = rawUrl.trim();
    if (!url) return fallback;
    const fileId = this.extractFileId(url);
    if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
    return url;
  },
  normalizeImageUrl(rawUrl, size = 'w200', fallback = '') {
    return this.normalizeDriveImageUrl(rawUrl, size, fallback);
  },
  ensureUploadConfig() {
    const uploadUrl = window.GOOGLE_DRIVE_UPLOAD_URL || (window.GOOGLE_DRIVE_CONFIG && window.GOOGLE_DRIVE_CONFIG.uploadUrl) || '';
    if (!uploadUrl) {
      throw new Error('Konfigurasi penyimpanan server belum lengkap. Hubungi administrator.');
    }
    return { uploadUrl };
  },
  async uploadBase64({ fileName, mimeType, base64Data, folderId = null, folderKey = null }) {
    const normalizedBase64 = typeof base64Data === 'string' && base64Data.includes('base64,')
      ? base64Data.split('base64,')[1]
      : base64Data;
    if (!fileName || !mimeType || !normalizedBase64) {
      throw new Error('File, tipe file, dan data base64 wajib diisi.');
    }
    const config = this.ensureUploadConfig();
    const payload = new URLSearchParams();
    payload.append('action', 'upload');
    payload.append('fileName', fileName);
    payload.append('mimeType', mimeType);
    payload.append('fileData', normalizedBase64);
    if (folderKey) payload.append('folderKey', folderKey);
    if (folderId) payload.append('folderId', folderId);
    const response = await fetch(config.uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: payload.toString()
    });
    let result;
    try {
      result = await response.json();
    } catch (error) {
      const text = await response.text();
      throw new Error(text || 'Upload ke server berkas gagal.');
    }
    if (!result || result.status !== 'success') {
      throw new Error(result && result.message ? result.message : 'Upload ke server berkas gagal.');
    }
    return result;
  },
  async uploadProfilePhoto(uid, base64Data, mimeType = 'image/jpeg') {
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `profile_${uid}_${Date.now()}.${ext}`;
    const upload = await this.uploadBase64({ fileName, mimeType, base64Data, folderKey: 'profile' });
    return upload.fileUrl;
  },
  async uploadAttendanceProof(dateStr, teacherId, base64Data, mimeType = 'image/jpeg') {
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `attendance_${teacherId}_${dateStr}_${Date.now()}.${ext}`;
    const upload = await this.uploadBase64({ fileName, mimeType, base64Data, folderKey: 'attendance' });
    return upload.fileUrl;
  }
};
const ServerStorage = DriveBridge;
window.DriveBridge = DriveBridge;
window.ServerStorage = ServerStorage;
