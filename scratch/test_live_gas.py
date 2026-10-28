import urllib.request, urllib.parse, base64, zipfile, io, json

url = 'https://script.google.com/macros/s/AKfycbxk4PM_VNZt__dwfXuk5v3pI366vHDFG31HZNx2t_4jpmomd-2aUXgKkEHimB8DfJQcrg/exec'

docx_buf = io.BytesIO()
with zipfile.ZipFile(docx_buf, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
    z.writestr('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
    z.writestr('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Halo SD Muhammadiyah 1 Sedati</w:t></w:r></w:p></w:body></w:document>')

b64 = base64.b64encode(docx_buf.getvalue()).decode('utf-8')

payload = urllib.parse.urlencode({
    'action': 'convertDocx',
    'fileName': 'tes_sd_musada.docx',
    'mimeType': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'fileData': b64
}).encode('utf-8')

req = urllib.request.Request(url, data=payload)
with urllib.request.urlopen(req) as resp:
    res = resp.read().decode('utf-8')
    data = json.loads(res)
    print('Status:', data.get('status'))
    print('FileName:', data.get('fileName'))
    print('PDF Base64 Length:', len(data.get('pdfBase64', '')))
    if data.get('message'):
        print('Message:', data.get('message'))

if data.get('pdfBase64'):
    b = base64.b64decode(data['pdfBase64'])
    print('PDF Magic Bytes:', b[:4])
    print('PDF Size (bytes):', len(b))
