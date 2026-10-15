const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

function parseTSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headerIdx = lines.findIndex(l => l.startsWith('No\tNama'));
  if (headerIdx === -1) return [];
  const headers = lines[headerIdx].split('\t');
  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const obj = {};
    headers.forEach((h, idx) => {
      const colName = (h || '').trim();
      if (colName) obj[colName] = (cols[idx] || '').trim();
    });
    if (obj['Nama']) rows.push(obj);
  }
  return rows;
}

function cleanTitle(str) {
  return (str || '')
    .toLowerCase()
    .replace(/,\s*(s\.pd\.i|s\.pd|m\.pd|s\.e|s\.tr\.t|s\.sos|s\.ag|m\.ag|s\.si|m\.si|s\.kom|s\.sn|s\.t)/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

async function run() {
  const guruPath = path.join(__dirname, '..', 'daftar-guru-SD Muhammadiyah 1 Sedati-2026-10-15 13_37_25.tsv');
  const tendikPath = path.join(__dirname, '..', 'daftar-tendik-SD Muhammadiyah 1 Sedati-2026-10-15 13_37_35.tsv');
  const gurus = parseTSV(guruPath);
  const tendiks = parseTSV(tendikPath);
  console.log(`Parsed ${gurus.length} guru and ${tendiks.length} tendik.`);

  const usersSnap = await db.ref('users').once('value');
  const users = usersSnap.val() || {};
  const userList = Object.entries(users).map(([uid, u]) => ({
    uid,
    name: u.name || '',
    clean: cleanTitle(u.name || ''),
    raw: u
  }));

  const allRecords = [
    ...gurus.map(g => ({ ...g, _type: 'Guru' })),
    ...tendiks.map(t => ({ ...t, _type: 'Tendik' }))
  ];

  const directoryUpdates = {};
  const userUpdates = {};

  allRecords.forEach((item, idx) => {
    const rawName = item['Nama'];
    const cleanItemName = cleanTitle(rawName);
    const matchedUser = userList.find(u => {
      if (!u.clean || !cleanItemName) return false;
      return u.clean === cleanItemName || u.clean.includes(cleanItemName) || cleanItemName.includes(u.clean);
    });

    const nuptk = item['NUPTK'] || '';
    const nik = item['NIK'] || '';
    const nbm = item['NIP'] || nuptk || '-';
    const position = item['Tugas Tambahan'] || item['Jenis PTK'] || (item._type === 'Guru' ? 'Guru Kelas' : 'Tenaga Administrasi');
    const empStatus = item['Status Kepegawaian'] === 'GTY/PTY' ? 'GTY' : (item['Status Kepegawaian'] || 'GTY');
    const phone = item['HP'] || item['Telepon'] || '';
    const email = item['Email'] || '';
    const gender = item['JK'] || 'L';
    const birthPlace = item['Tempat Lahir'] || '';
    const birthDate = item['Tanggal Lahir'] || '';
    const joinDate = item['TMT Pengangkatan'] || '';
    const address = [item['Alamat Jalan'], item['Desa/Kelurahan'], item['Kecamatan']].filter(Boolean).join(', ');

    const recId = matchedUser ? matchedUser.uid.replace(/^GTK_/, 'EMP_') : `EMP_${String(idx + 1).padStart(3, '0')}`;
    
    directoryUpdates[recId] = {
      id: recId,
      name: rawName,
      nbm: nbm,
      nuptk: nuptk,
      nik: nik,
      position: position,
      employmentStatus: empStatus,
      phone: phone,
      email: email,
      gender: gender,
      birthPlace: birthPlace,
      birthDate: birthDate,
      joinDate: joinDate,
      address: address,
      userId: matchedUser ? matchedUser.uid : null,
      status: 'Aktif',
      source: 'Dapodik 2026'
    };

    if (matchedUser) {
      userUpdates[`users/${matchedUser.uid}/nbm`] = nbm;
      userUpdates[`users/${matchedUser.uid}/nuptk`] = nuptk;
      userUpdates[`users/${matchedUser.uid}/nik`] = nik;
      userUpdates[`users/${matchedUser.uid}/phone`] = phone || matchedUser.raw.phone || '';
      userUpdates[`users/${matchedUser.uid}/position`] = position;
      userUpdates[`users/${matchedUser.uid}/employmentStatus`] = empStatus;
    }
  });

  console.log(`Menyimpan ${Object.keys(directoryUpdates).length} data pegawai ke personnel/directory...`);
  await db.ref('personnel/directory').set(directoryUpdates);
  if (Object.keys(userUpdates).length > 0) {
    console.log(`Mengupdate ${Object.keys(userUpdates).length} atribut NBM/NUPTK pada users...`);
    await db.ref().update(userUpdates);
  }

  const exportPath = path.join(__dirname, 'data', 'musada-sd-default-rtdb-export.json');
  if (fs.existsSync(exportPath)) {
    const rtdb = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    rtdb.personnel = rtdb.personnel || {};
    rtdb.personnel.directory = directoryUpdates;
    Object.entries(userUpdates).forEach(([k, v]) => {
      const parts = k.split('/');
      if (parts[0] === 'users' && rtdb.users[parts[1]]) {
        rtdb.users[parts[1]][parts[2]] = v;
      }
    });
    fs.writeFileSync(exportPath, JSON.stringify(rtdb, null, 2), 'utf8');
    console.log('Sinkronisasi export JSON lokal berhasil.');
  }
  console.log('Import data pegawai selesai!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
