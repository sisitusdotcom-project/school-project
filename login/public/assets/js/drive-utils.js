const DriveBridge = {
  extractFileId(url) {
    if (!url || typeof url !== 'string') return '';
    const cleanUrl = url.trim();
    const matchDrive = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchDrive && matchDrive[1]) return matchDrive[1];
    const matchUc = cleanUrl.match(/drive\.google\.com\/uc\?(?:[^&]+&)*id=([a-zA-Z0-9_-]+)/);
    if (matchUc && matchUc[1]) return matchUc[1];
    const matchOpen = cleanUrl.match(/drive\.google\.com\/open\?(?:[^&]+&)*id=([a-zA-Z0-9_-]+)/);
    if (matchOpen && matchOpen[1]) return matchOpen[1];
    const matchThumb = cleanUrl.match(/drive\.google\.com\/thumbnail\?(?:[^&]+&)*id=([a-zA-Z0-9_-]+)/);
    if (matchThumb && matchThumb[1]) return matchThumb[1];
    const matchDocs = cleanUrl.match(/docs\.google\.com\/[a-z]+\/d\/([a-zA-Z0-9_-]+)/);
    if (matchDocs && matchDocs[1]) return matchDocs[1];
    return '';
  },
  getDownloadUrl(fileId) {
    if (!fileId) return '';
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  },
  getViewerUrl(rawUrl, title = 'Dokumen') {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const cleanUrl = rawUrl.trim();
    const fileId = this.extractFileId(cleanUrl);
    const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i.test(cleanUrl) || cleanUrl.startsWith('data:image/');
    if (isImage) {
      return this.normalizeDriveImageUrl(cleanUrl, 'w1200', cleanUrl);
    }
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    }
    return cleanUrl;
  },
  normalizeDriveImageUrl(rawUrl, size = 'w200', fallback = '') {
    if (!rawUrl) return fallback;
    const url = rawUrl.trim();
    if (!url) return fallback;
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
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
  async sendPost(action, params = {}) {
    const config = this.ensureUploadConfig();
    const payload = new URLSearchParams();
    payload.append('action', action);
    for (const [k, v] of Object.entries(params)) {
      if (v !== null && v !== undefined) payload.append(k, v);
    }
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
      throw new Error(text || 'Koneksi ke server berkas gagal.');
    }
    if (!result || result.status !== 'success') {
      throw new Error(result && result.message ? result.message : 'Operasi berkas di server gagal.');
    }
    return result;
  },
  async uploadBase64({ fileName, mimeType, base64Data, folderId = null, folderKey = null }) {
    const normalizedBase64 = typeof base64Data === 'string' && base64Data.includes('base64,')
      ? base64Data.split('base64,')[1]
      : base64Data;
    if (!fileName || !mimeType || !normalizedBase64) {
      throw new Error('File, tipe file, dan data base64 wajib diisi.');
    }
    return this.sendPost('upload', { fileName, mimeType, fileData: normalizedBase64, folderId, folderKey });
  },
  async uploadFile(file, { folderKey = 'uploads', folderId = null, onProgress = null } = {}) {
    if (!file) throw new Error('Berkas tidak ditemukan.');
    const origSize = file.size;
    let processed = file;
    if (window.SmartFileCompressor && typeof window.SmartFileCompressor.processFile === 'function') {
      processed = await window.SmartFileCompressor.processFile(file, onProgress);
    }
    const origMb = (origSize / (1024 * 1024)).toFixed(1);
    const finalMb = (processed.size / (1024 * 1024)).toFixed(1);
    if (onProgress) {
      if (processed.size < origSize) {
        onProgress(`Optimal (${origMb} MB → ${finalMb} MB). Mengunggah...`);
      } else {
        onProgress('Mengunggah berkas...');
      }
    }
    const b64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(processed);
    });
    const normalizedB64 = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
    const ext = processed.name.split('.').pop() || 'bin';
    const fileName = `${folderKey}_${Date.now()}.${ext}`;
    const up = await this.uploadBase64({
      fileName,
      mimeType: processed.type || 'application/octet-stream',
      base64Data: normalizedB64,
      folderKey,
      folderId
    });
    return {
      fileUrl: up.fileUrl,
      fileName: up.fileName || fileName,
      fileId: up.fileId,
      originalSize: origSize,
      finalSize: processed.size,
      isCompressed: processed.size < origSize
    };
  },
  async convertDocxToPdf(file, onProgress) {
    if (onProgress) onProgress('Menyiapkan dokumen...');
    const b64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    const normalizedB64 = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
    const res = await this.sendPost('convertDocx', {
      fileName: file.name,
      mimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileData: normalizedB64
    });
    if (!res.pdfBase64) throw new Error('Hasil konversi PDF kosong.');
    const binaryStr = atob(res.pdfBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const pdfName = res.fileName || file.name.replace(/\.(docx|doc)$/i, '') + '.pdf';
    return new File([bytes.buffer], pdfName, { type: 'application/pdf' });
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
  async cropAndResizeAvatar(file, maxDim = 320) {
    if (!file) throw new Error('Berkas foto tidak ditemukan.');
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const w = img.width;
          const h = img.height;
          const minSide = Math.min(w, h);
          const startX = (w - minSide) / 2;
          const startY = (h - minSide) / 2;
          const finalDim = Math.min(maxDim, minSide);
          const canvas = document.createElement('canvas');
          canvas.width = finalDim;
          canvas.height = finalDim;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, finalDim, finalDim);
          ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, finalDim, finalDim);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar foto profil'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Gagal membaca berkas gambar'));
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
  async ensureJsPdf() {
    const existing = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (existing) return existing;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        const found = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (found) resolve(found);
        else reject(new Error('jsPDF gagal dimuat'));
      };
      script.onerror = () => reject(new Error('Gagal memuat pustaka jsPDF'));
      document.head.appendChild(script);
    });
  },
  async compressPdf(file, onProgress) {
    try {
      if (onProgress) onProgress('Menyiapkan dokumen...');
      const pdfjs = await this.ensurePdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      if (!numPages || numPages > 60) {
        return file;
      }
      const jsPdfClass = await this.ensureJsPdf();
      if (!jsPdfClass) return file;
      let newPdf = null;
      for (let i = 1; i <= numPages; i++) {
        if (onProgress) onProgress(`Memproses halaman ${i} dari ${numPages}...`);
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
          newPdf = new jsPdfClass({ orientation: orientation, unit: 'pt', format: [ptWidth, ptHeight] });
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
    const isWord = /\.(docx|doc)$/i.test(file.name) || (file.type && (file.type.includes('wordprocessingml') || file.type.includes('msword')));
    if (isWord) {
      const rawPdf = await DriveBridge.convertDocxToPdf(file, onProgress);
      if (rawPdf) {
        try {
          const compPdf = await this.compressPdf(rawPdf, onProgress);
          return compPdf;
        } catch (compErr) {
          console.warn('Kompresi PDF lanjutan dilewati:', compErr);
          return rawPdf;
        }
      }
    }
    if (file.type.startsWith('image/')) {
      if (file.size > 500 * 1024) {
        if (onProgress) onProgress('Memproses foto...');
        return this.compressImage(file, onProgress);
      }
      return file;
    }
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      if (file.size > 2 * 1024 * 1024) {
        if (onProgress) onProgress('Menyiapkan dokumen...');
        return this.compressPdf(file, onProgress);
      }
      return file;
    }
    return file;
  }
};
window.SmartFileCompressor = SmartFileCompressor;