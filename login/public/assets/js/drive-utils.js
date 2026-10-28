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
const SmartFileCompressor = {
  async compressImage(file, onProgress) {
    if (onProgress) onProgress('Mengompresi gambar...');
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const maxDim = 1600;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => {
            if (blob && blob.size < file.size) {
              const newName = file.name.replace(/\.[^.]+$/, '.jpg');
              const compressedFile = new File([blob], newName, { type: 'image/jpeg' });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  },
  async ensurePdfJs() {
    if (window.pdfjsLib) {
      if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      return window.pdfjsLib;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js gagal dimuat'));
        }
      };
      script.onerror = () => reject(new Error('Gagal memuat pustaka PDF.js'));
      document.head.appendChild(script);
    });
  },
  async compressPdf(file, onProgress) {
    try {
      if (onProgress) onProgress('Menyiapkan peramping PDF...');
      const pdfjs = await this.ensurePdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      if (!numPages || numPages > 60) {
        return file;
      }
      const jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || null;
      if (!jsPDF) return file;
      let newPdf = null;
      for (let i = 1; i <= numPages; i++) {
        if (onProgress) onProgress(`Mengoptimalkan halaman ${i} dari ${numPages}...`);
        const page = await pdfDoc.getPage(i);
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const targetWidth = Math.min(1400, unscaledViewport.width * 1.5);
        const scale = targetWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        const imgData = canvas.toDataURL('image/jpeg', 0.75);
        const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait';
        const ptWidth = unscaledViewport.width;
        const ptHeight = unscaledViewport.height;
        if (i === 1) {
          newPdf = new jsPDF({ orientation: orientation, unit: 'pt', format: [ptWidth, ptHeight] });
          newPdf.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight);
        } else {
          newPdf.addPage([ptWidth, ptHeight], orientation);
          newPdf.addImage(imgData, 'JPEG', 0, 0, ptWidth, ptHeight);
        }
      }
      if (!newPdf) return file;
      const blob = newPdf.output('blob');
      if (blob && blob.size < file.size) {
        return new File([blob], file.name, { type: 'application/pdf' });
      }
      return file;
    } catch (e) {
      console.warn('Kompresi PDF dilewati:', e);
      return file;
    }
  },
  async processFile(file, onProgress) {
    if (!file) return file;
    const sizeMb = file.size / (1024 * 1024);
    if (file.type.startsWith('image/')) {
      if (file.size > 500 * 1024) {
        if (onProgress) onProgress(`Mengoptimalkan foto (${sizeMb.toFixed(1)} MB)...`);
        const res = await this.compressImage(file, onProgress);
        return res;
      }
      return file;
    }
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      if (file.size > 3 * 1024 * 1024) {
        if (onProgress) onProgress(`Berkas besar (${sizeMb.toFixed(1)} MB). Merampingkan dokumen...`);
        const res = await this.compressPdf(file, onProgress);
        return res;
      }
      return file;
    }
    return file;
  }
};
window.SmartFileCompressor = SmartFileCompressor;
