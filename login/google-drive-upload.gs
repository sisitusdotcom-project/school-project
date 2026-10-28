const DRIVE_FOLDERS = {
  profile: '1XNd5q7MK9a4PijpONMrGBZZM-JPy2W9l',
  attendance: '1FkdU6Rce3CTqjjcGY-qxGTzvVgk8dyqS',
  default: '12RmMsA6s4E9EdKU-ihmcXmxOEtetPxnP'
};
function normalizeParam(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.length ? String(value[0]) : '';
  return String(value);
}
function doPost(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const data = {
      action: normalizeParam(params.action),
      fileName: normalizeParam(params.fileName),
      mimeType: normalizeParam(params.mimeType),
      fileData: normalizeParam(params.fileData),
      folderKey: normalizeParam(params.folderKey),
      folderId: normalizeParam(params.folderId)
    };
    if (!data.action) {
      return jsonResponse({ status: 'error', message: 'Missing action' }, 400);
    }
    if (data.action === 'convertDocx') {
      return convertDocxResponse(data);
    }
    if (data.action === 'upload') {
      return uploadToDrive(data);
    }
    return jsonResponse({ status: 'error', message: 'Invalid action' }, 400);
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() }, 500);
  }
}
function convertDocxResponse(data) {
  const fileName = data.fileName;
  const mimeType = data.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const base64Data = (data.fileData || '').includes('base64,')
    ? data.fileData.split('base64,')[1]
    : data.fileData;
  if (!fileName || !base64Data) {
    return jsonResponse({ status: 'error', message: 'Missing file data' }, 400);
  }
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
  let tempDocId = null;
  try {
    let tempFile;
    if (typeof Drive !== 'undefined' && Drive.Files && typeof Drive.Files.create === 'function') {
      tempFile = Drive.Files.create({
        name: 'TEMP_' + fileName.replace(/\.[^/.]+$/, ''),
        mimeType: MimeType.GOOGLE_DOCS
      }, blob);
    } else if (typeof Drive !== 'undefined' && Drive.Files && typeof Drive.Files.insert === 'function') {
      tempFile = Drive.Files.insert({
        title: 'TEMP_' + fileName.replace(/\.[^/.]+$/, ''),
        mimeType: MimeType.GOOGLE_DOCS
      }, blob, { convert: true });
    } else {
      throw new Error('Layanan Drive API belum diaktifkan di Google Apps Script.');
    }
    tempDocId = tempFile.id;
    const docFile = DriveApp.getFileById(tempDocId);
    const pdfBlob = docFile.getAs('application/pdf');
    DriveApp.getFileById(tempDocId).setTrashed(true);
    const pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
    return jsonResponse({
      status: 'success',
      pdfBase64: pdfBase64,
      fileName: fileName.replace(/\.(docx|doc)$/i, '') + '.pdf'
    }, 200);
  } catch (err) {
    if (tempDocId) {
      try { DriveApp.getFileById(tempDocId).setTrashed(true); } catch (e) {}
    }
    return jsonResponse({ status: 'error', message: err.toString() }, 500);
  }
}
function uploadToDrive(data) {
  const fileName = data.fileName;
  const mimeType = data.mimeType;
  const base64Data = (data.fileData || '').includes('base64,')
    ? data.fileData.split('base64,')[1]
    : data.fileData;
  const folderKey = data.folderKey || 'default';
  const folderId = data.folderId || DRIVE_FOLDERS[folderKey] || DRIVE_FOLDERS.default;
  if (!fileName || !mimeType || !base64Data) {
    return jsonResponse({ status: 'error', message: 'Missing file data' }, 400);
  }
  if (!folderId || folderId.includes('PASTE_ID_FOLDER')) {
    return jsonResponse({ status: 'error', message: 'Folder ID Google Drive belum dikonfigurasi di Apps Script.' }, 500);
  }
  const folder = DriveApp.getFolderById(folderId);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
  let file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (error) {}
  const fileUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
  return jsonResponse({
    status: 'success',
    fileUrl: fileUrl,
    fileName: file.getName(),
    fileId: file.getId()
  }, 200);
}
function jsonResponse(body, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}