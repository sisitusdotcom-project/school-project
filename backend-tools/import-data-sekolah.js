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
function cleanName(str) {
  return (str || '')
    .toLowerCase()
    .replace(/,\s*(s\.pd\.i|s\.pd|m\.pd|s\.e|s\.tr\.t|s\.sos|s\.ag|m\.ag|s\.si|m\.si|s\.kom|s\.sn|s\.t|s\.h\.i|s\.h|gr\.)/gi, '')
    .replace(/[^a-z0-9]/g, '');
}
function parseMoney(val) {
  if (!val) return 0;
  const num = String(val).replace(/[^0-9]/g, '');
  return parseInt(num, 10) || 0;
}
function formatDate(str) {
  if (!str) return '';
  const parts = str.trim().split('/');
  if (parts.length === 3) {
    const m = parts[0].padStart(2, '0');
    const d = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }
  return str;
}
async function run() {
  const gukarPath = path.join(__dirname, '..', 'dari-sekolah', 'data-gukar.tsv');
  const penilaianPath = path.join(__dirname, '..', 'dari-sekolah', 'penilaian.tsv');
  const [usersSnap, dirSnap] = await Promise.all([
    db.ref('users').once('value'),
    db.ref('personnel/directory').once('value')
  ]);
  const users = usersSnap.val() || {};
  const currentDir = dirSnap.val() || {};
  const userList = Object.entries(users).map(([uid, u]) => ({
    uid,
    name: u.name || u.displayName || '',
    clean: cleanName(u.name || u.displayName || ''),
    raw: u
  }));
  const dirList = Object.entries(currentDir).map(([id, d]) => ({
    id,
    name: d.name || '',
    clean: cleanName(d.name || ''),
    raw: d
  }));
  const gukarRaw = fs.readFileSync(gukarPath, 'utf8');
  const gukarLines = gukarRaw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const dirUpdates = {};
  const matchedEmpMap = {};
  for (let i = 2; i < gukarLines.length; i++) {
    const cols = gukarLines[i].split('\t');
    if (cols.length < 2 || !cols[1].trim()) continue;
    const no = (cols[0] || '').trim();
    const rawName = cols[1].trim();
    const cleanG = cleanName(rawName);
    const amanah = (cols[2] || '').trim();
    const posisi = (cols[3] || '').trim();
    const status = (cols[4] || 'GTP').trim();
    const golongan = (cols[5] || '').trim();
    const fungsionalSalary = parseMoney(cols[6]);
    const strukturalSalary = parseMoney(cols[7]);
    const kelahiran = (cols[8] || '').trim();
    const tanggalLahir = formatDate(cols[9]);
    const nik = (cols[10] || '').trim();
    const noTelp = (cols[11] || '').trim();
    const email = (cols[12] || '').trim();
    const nbm = (cols[13] || '').trim();
    const pendidikan = (cols[14] || '').trim();
    const lulus = (cols[15] || '').trim();
    const alamat = (cols[16] || '').trim();
    const matchedUser = userList.find((u) => u.clean && cleanG && (u.clean === cleanG || u.clean.includes(cleanG) || cleanG.includes(u.clean)));
    const matchedExistingDir = dirList.find((d) => d.clean && cleanG && (d.clean === cleanG || d.clean.includes(cleanG) || cleanG.includes(d.clean)));
    const empId = matchedExistingDir ? matchedExistingDir.id : `EMP_${String(no || (i - 1)).padStart(3, '0')}`;
    matchedEmpMap[cleanG] = empId;
    if (rawName.split(' ')[0]) {
      matchedEmpMap[cleanName(rawName.split(' ')[0])] = empId;
    }
    dirUpdates[`personnel/directory/${empId}`] = {
      id: empId,
      name: rawName,
      nik: nik || matchedExistingDir?.raw?.nik || '',
      nbm: nbm || matchedExistingDir?.raw?.nbm || '',
      nuptk: matchedExistingDir?.raw?.nuptk || '',
      structuralAmanah: amanah,
      position: posisi || matchedExistingDir?.raw?.position || 'Guru',
      employmentStatus: status,
      golongan: golongan,
      functionalSalary: fungsionalSalary,
      structuralSalary: strukturalSalary,
      birthPlace: kelahiran || matchedExistingDir?.raw?.birthPlace || '',
      birthDate: tanggalLahir || matchedExistingDir?.raw?.birthDate || '',
      phone: noTelp || matchedExistingDir?.raw?.phone || '',
      email: email || matchedExistingDir?.raw?.email || '',
      education: pendidikan || matchedExistingDir?.raw?.education || '',
      graduationYear: lulus,
      address: alamat || matchedExistingDir?.raw?.address || '',
      userId: matchedUser ? matchedUser.uid : (matchedExistingDir?.raw?.userId || ''),
      status: 'Aktif',
      source: 'Arsip SDM 2024-2025'
    };
  }
  const evalRaw = fs.readFileSync(penilaianPath, 'utf8');
  const evalLines = evalRaw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const evalRows = evalLines.map((l) => l.split('\t'));
  const teacherHeaders = evalRows[2].slice(2, -1);
  const evalUpdates = {};
  teacherHeaders.forEach((th, idx) => {
    const colIdx = idx + 2;
    const rawThName = (th || '').trim();
    if (!rawThName) return;
    const cleanTh = cleanName(rawThName);
    let empId = matchedEmpMap[cleanTh];
    if (!empId) {
      const found = Object.entries(matchedEmpMap).find(([k]) => k.includes(cleanTh) || cleanTh.includes(k));
      if (found) empId = found[1];
    }
    if (!empId) return;
    const l1 = Number(evalRows[4][colIdx]) || 100;
    const l2 = Number(evalRows[5][colIdx]) || 85;
    const l3 = Number(evalRows[6][colIdx]) || 95;
    const l4 = Number(evalRows[7][colIdx]) || 80;
    const avgLoyalty = Math.round((l1 + l2 + l3 + l4) / 4);
    const capScores = [];
    for (let r = 9; r <= 16; r++) {
      capScores.push(Number(evalRows[r][colIdx]) || 90);
    }
    const avgCapacity = Math.round(capScores.reduce((a, b) => a + b, 0) / capScores.length);
    const cap1 = Number(evalRows[18][colIdx]) || 90;
    const cap2 = Number(evalRows[19][colIdx]) || 90;
    const avgCapability = Math.round((cap1 + cap2) / 2);
    const avgTotal = Math.round((avgLoyalty + avgCapacity + avgCapability) / 3);
    const isPass = (avgLoyalty >= 75) && (avgCapacity >= 75) && (avgCapability >= 75);
    let pred = 'Pemula';
    if (!isPass) pred = 'Perlu Pembinaan';
    else if (avgTotal >= 90) pred = 'Prioritas';
    else if (avgTotal >= 85) pred = 'Prospek';
    else if (avgTotal >= 81) pred = 'Lanjutan';
    const recStatus = isPass && avgTotal >= 85 ? 'Naik' : 'Tetap';
    const evalId = `EVAL_2024_2025_${empId}`;
    evalUpdates[`personnel/evaluations/${evalId}`] = {
      id: evalId,
      date: '2025-05-30',
      employeeId: empId,
      period: 'Tahun Ajaran 2024/2025',
      loyaltyCountry: l1,
      loyaltyMuhammadiyah: l2,
      loyaltyAum: l3,
      loyaltyCommitment: l4,
      avgLoyalty: avgLoyalty,
      capacityExemplary: capScores[0],
      capacityTeamwork: capScores[1],
      capacityLeadership: capScores[2],
      capacityDiscipline: capScores[3],
      capacityInnovation: capScores[4],
      capacityResponsibility: capScores[5],
      capacityIntegrity: capScores[6],
      capacitySelfDev: capScores[7],
      avgCapacity: avgCapacity,
      capabilityStructural: cap1,
      capabilityMainDuty: cap2,
      avgCapability: avgCapability,
      kpiPembinaanMusada: l2,
      kpiKajianPcmPdm: l2,
      pcmCommitmentInterview: 'Memenuhi Pakta Integritas',
      score: avgTotal,
      predicate: pred,
      statusRecommendation: recStatus,
      note: 'Arsip Resmi Penilaian Kinerja SDM Majelis Dikdasmen & PNF PCM Sedati 2024/2025',
      updatedAt: new Date().toISOString()
    };
  });
  console.log(`Menyiapkan ${Object.keys(dirUpdates).length} direktori pegawai dan ${Object.keys(evalUpdates).length} evaluasi kinerja...`);
  await db.ref().update({ ...dirUpdates, ...evalUpdates });
  console.log('Sinkronisasi data sekolah berhasil!');
  process.exit(0);
}
run().catch((err) => {
  console.error('Gagal:', err);
  process.exit(1);
});