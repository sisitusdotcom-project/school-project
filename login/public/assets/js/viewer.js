document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const file = params.get('file');
  const type = params.get('type') || '';
  const title = params.get('title') || 'Dokumen Resmi';
  const docTitleEl = document.getElementById('viewer-doc-title');
  if (docTitleEl) docTitleEl.textContent = title;
  document.title = `${title} | Server Dokumen SD Muhammadiyah 1 Sedati`;
  const frameWrap = document.getElementById('viewer-frame-wrap');
  const frame = document.getElementById('viewer-frame');
  const guard = document.getElementById('viewer-corner-guard');
  const imgWrap = document.getElementById('viewer-img-wrap');
  const img = document.getElementById('viewer-img');
  const emptyState = document.getElementById('viewer-empty');
  const downloadBtn = document.getElementById('btn-viewer-download');
  const closeBtn = document.getElementById('btn-viewer-close');
  if (downloadBtn) {
    if (id && typeof DriveBridge !== 'undefined' && DriveBridge.getDownloadUrl) {
      downloadBtn.href = DriveBridge.getDownloadUrl(id);
      downloadBtn.classList.remove('hidden');
    } else if (file) {
      const directId = typeof DriveBridge !== 'undefined' && DriveBridge.extractFileId ? DriveBridge.extractFileId(file) : null;
      if (directId && DriveBridge.getDownloadUrl) {
        downloadBtn.href = DriveBridge.getDownloadUrl(directId);
      } else {
        downloadBtn.href = file;
      }
      downloadBtn.classList.remove('hidden');
    }
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.close();
      if (!window.closed) {
        history.back();
      }
    });
  }
  const isImg = type === 'image' || (file && /\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i.test(file)) || (file && file.startsWith('data:image/'));
  if (isImg && (file || id)) {
    if (frameWrap) frameWrap.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (imgWrap && img) {
      imgWrap.classList.remove('hidden');
      const imgSrc = id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600` : file;
      img.src = imgSrc;
      img.alt = title;
    }
  } else if (id) {
    if (imgWrap) imgWrap.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (frameWrap && frame) {
      frameWrap.classList.remove('hidden');
      frame.classList.remove('mk-preview-frame-raw');
      if (guard) guard.classList.remove('hidden');
      frame.src = `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
    }
  } else if (file) {
    const extractedId = typeof DriveBridge !== 'undefined' && DriveBridge.extractFileId ? DriveBridge.extractFileId(file) : null;
    if (extractedId) {
      if (imgWrap) imgWrap.classList.add('hidden');
      if (emptyState) emptyState.classList.add('hidden');
      if (frameWrap && frame) {
        frameWrap.classList.remove('hidden');
        frame.classList.remove('mk-preview-frame-raw');
        if (guard) guard.classList.remove('hidden');
        frame.src = `https://drive.google.com/file/d/${encodeURIComponent(extractedId)}/preview`;
      }
    } else {
      if (imgWrap) imgWrap.classList.add('hidden');
      if (emptyState) emptyState.classList.add('hidden');
      if (frameWrap && frame) {
        frameWrap.classList.remove('hidden');
        frame.classList.add('mk-preview-frame-raw');
        if (guard) guard.classList.add('hidden');
        frame.src = file;
      }
    }
  } else {
    if (frameWrap) frameWrap.classList.add('hidden');
    if (imgWrap) imgWrap.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    if (docTitleEl) docTitleEl.textContent = 'Berkas Tidak Ditemukan';
  }
});
