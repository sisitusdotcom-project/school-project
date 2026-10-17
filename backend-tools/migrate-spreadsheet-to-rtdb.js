const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./keys/musada-sd-firebase-adminsdk-fbsvc-8d4c0805ce.json');
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://musada-sd-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);

function cleanName(s) {
  return s ? s.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') : '';
}

function parseDateIndo(str) {
  if (!str) return '';
  const trimmed = str.trim();
  const datePart = trimmed.split(' ')[0];
  const parts = datePart.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

async function migrate() {
  console.log('--- MEMULAI MIGRASI PERPUSTAKAAN DENGAN DATA TERBARU (SSOT SISWA & GTK AKTIF) ---');

  const exportPath = path.join(__dirname, 'data', 'musada-sd-default-rtdb-export.json');
  let exportData = {};
  if (fs.existsSync(exportPath)) {
    exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  }

  let studentsSnap = null;
  let usersSnap = null;
  let personnelSnap = null;
  try {
    [studentsSnap, usersSnap, personnelSnap] = await Promise.all([
      db.ref('students').once('value'),
      db.ref('users').once('value'),
      db.ref('personnel').once('value')
    ]);
  } catch (e) {
    console.log('Catatan koneksi RTDB induk, menggunakan data cadangan ekspor:', e.message);
  }

  const studentsMaster = (studentsSnap && studentsSnap.val()) || exportData.students || {};
  const usersMaster = (usersSnap && usersSnap.val()) || exportData.users || {};
  const personnelMaster = (personnelSnap && personnelSnap.val()) || exportData.personnel || {};

  const nbmMap = {};
  for (const [uid, u] of Object.entries(usersMaster)) {
    const cn = cleanName(u.name);
    const nbm = (u.nbm || '').trim();
    if (cn && nbm && nbm !== '-') nbmMap[cn] = nbm;
  }
  for (const [pid, p] of Object.entries(personnelMaster)) {
    const cn = cleanName(p.name);
    const nbm = (p.nbm || '').trim();
    if (cn && nbm && nbm !== '-') nbmMap[cn] = nbm;
  }

  const dataGuruPath = path.join(__dirname, 'data', 'data-guru.tsv');
  const guruLines = fs.readFileSync(dataGuruPath, 'utf8').split('\n');
  const activeGuru = [];
  guruLines.forEach(l => {
    const trimmed = l.trim();
    if (trimmed && !trimmed.startsWith('No\t')) {
      const parts = trimmed.split('\t');
      activeGuru.push({
        no: parts[0].trim(),
        name: parts[1].trim(),
        jabatan: parts[2] ? parts[2].trim() : '',
        jk: parts[3] ? parts[3].trim() : '',
        tugas: parts[4] ? parts[4].trim() : '',
        tambahan: parts[5] ? parts[5].trim() : ''
      });
    }
  });

  console.log(`Data Master Dimuat: ${Object.keys(studentsMaster).length} Siswa Aktif, ${activeGuru.length} GTK Aktif (dari data-guru.tsv)`);

  const members = {};
  const legacyToNewCode = {};

  const studentCleanMap = {};
  for (const [sid, s] of Object.entries(studentsMaster)) {
    const nis = (s.nis || '').trim();
    if (!nis) continue;
    const rawClass = s.classId || '';
    const className = rawClass.replace('CLASS_', 'Kelas ').replace(/_/g, ' ');
    const cn = cleanName(s.name);
    studentCleanMap[cn] = { ...s, id: sid };

    members[nis] = {
      code: nis,
      nis: nis,
      name: (s.name || '').trim(),
      gender: s.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
      type: 'Siswa',
      note: className,
      printStatus: '',
      legacyCode: '',
      studentId: sid,
      updatedAt: new Date().toISOString()
    };
  }

  const gtkCleanMap = {};
  activeGuru.forEach(g => {
    const cn = cleanName(g.name);
    let nbm = nbmMap[cn] || '';
    if (!nbm) {
      for (const [pcn, pnbm] of Object.entries(nbmMap)) {
        if (cn.startsWith(pcn) || pcn.startsWith(cn) || (pcn.length > 6 && (cn.includes(pcn) || pcn.includes(cn)))) {
          nbm = pnbm;
          break;
        }
      }
    }
    const noStr = String(g.no).padStart(2, '0');
    const memberCode = nbm || `GTK-${noStr}`;
    const noteParts = [g.jabatan];
    if (g.tugas && g.tugas !== '-') noteParts.push(g.tugas);

    const gtkMember = {
      code: memberCode,
      nbm: nbm,
      name: g.name,
      gender: g.jk === 'L' ? 'Laki-Laki' : 'Perempuan',
      type: g.jabatan.toLowerCase().includes('guru') ? 'Guru' : 'Tenaga Kependidikan',
      note: noteParts.join(' - '),
      printStatus: '',
      legacyCode: '',
      updatedAt: new Date().toISOString()
    };

    members[memberCode] = gtkMember;
    gtkCleanMap[cn] = gtkMember;
  });

  const tsvPath = path.join(__dirname, '..', 'backup-perpustakaan', 'Spreadsheet.tsv');
  const tsvRaw = fs.readFileSync(tsvPath, 'utf8');

  const sections = {};
  let curSection = '';
  tsvRaw.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('SHEET = ')) {
      curSection = trimmed.replace('SHEET = ', '').trim();
      sections[curSection] = [];
    } else if (curSection) {
      sections[curSection].push(trimmed.split('\t'));
    }
  });

  const anggotaRows = sections['ANGGOTA'] || [];
  let matchedStudents = 0;
  let skippedAlumni = 0;
  let matchedGtk = 0;

  if (anggotaRows.length > 1) {
    for (let i = 1; i < anggotaRows.length; i++) {
      const row = anggotaRows[i];
      const legCode = (row[0] || '').trim();
      if (!legCode) continue;
      const legName = (row[1] || '').trim();
      const legType = (row[3] || 'Siswa').trim();
      const legPrint = (row[5] || '').trim();
      const cn = cleanName(legName);

      if (legType === 'Siswa') {
        let foundNis = null;
        if (studentCleanMap[cn]) {
          foundNis = (studentCleanMap[cn].nis || '').trim();
        } else {
          for (const [scn, st] of Object.entries(studentCleanMap)) {
            if (cn.length >= 6 && (cn.includes(scn) || scn.includes(cn))) {
              foundNis = (st.nis || '').trim();
              break;
            }
          }
        }

        if (foundNis && members[foundNis]) {
          legacyToNewCode[legCode] = foundNis;
          members[foundNis].legacyCode = legCode;
          if (legPrint) members[foundNis].printStatus = legPrint;
          matchedStudents++;
        } else {
          skippedAlumni++;
        }
      } else if (legType === 'Gukar') {
        let foundGtk = null;
        if (gtkCleanMap[cn]) {
          foundGtk = gtkCleanMap[cn];
        } else {
          for (const [gcn, g] of Object.entries(gtkCleanMap)) {
            if (cn.length >= 5 && (cn.includes(gcn) || gcn.includes(cn))) {
              foundGtk = g;
              break;
            }
          }
        }

        if (foundGtk && members[foundGtk.code]) {
          legacyToNewCode[legCode] = foundGtk.code;
          members[foundGtk.code].legacyCode = legCode;
          if (legPrint) members[foundGtk.code].printStatus = legPrint;
          matchedGtk++;
        }
      }
    }
  }

  console.log(`Integrasi Anggota Aktif Selesai:`);
  console.log(`- Total Anggota di RTDB: ${Object.keys(members).length}`);
  console.log(`- Siswa Aktif (NIS): ${Object.values(members).filter(m => m.type === 'Siswa').length}`);
  console.log(`- GTK Aktif (dari data-guru.tsv): ${Object.values(members).filter(m => m.type !== 'Siswa').length}`);
  console.log(`- Alumni/GTK Lama yang dilewati: ${skippedAlumni}`);

  const books = {};
  const bukuRows = sections['BANK BUKU'] || [];
  if (bukuRows.length > 1) {
    for (let i = 1; i < bukuRows.length; i++) {
      const row = bukuRows[i];
      const code = (row[0] || '').trim();
      if (!code) continue;
      books[code] = {
        code,
        shelfCode: (row[1] || '').trim(),
        title: (row[2] || '').trim(),
        author: (row[3] || '').trim(),
        publisher: (row[4] || '').trim(),
        year: (row[5] || '').trim(),
        stockAvailable: parseInt(row[6], 10) || 0,
        stockTotal: parseInt(row[7], 10) || 0,
        category: (row[8] || 'Umum').trim(),
        printStatus: (row[9] || '').trim(),
        isEbook: false,
        createdAt: new Date().toISOString()
      };
    }
  }

  books['EB-IS-001'] = {
    code: 'EB-IS-001',
    shelfCode: 'E-BOOK',
    title: 'Asbabun Nuzul: Sebab-Sebab Turunnya Ayat-Ayat Al-Qur\'an',
    author: 'Imam Al-Wahidi an-Nisaburi',
    publisher: 'Pustaka Islamika',
    year: '2018',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'E-Book Islami',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'buku-perpus/asbabun-nuzul-al-wahidi-an-nisaburi.pdf',
    coverUrl: 'assets/img/ebook-covers/asbabun-nuzul-al-wahidi-an-nisaburi.webp',
    description: 'Kitab rujukan klasik terlengkap yang memaparkan latar belakang historis dan sebab-sebab diturunkannya ayat-ayat suci Al-Qur\'an.',
    createdAt: new Date().toISOString()
  };
  books['EB-MH-001'] = {
    code: 'EB-MH-001',
    shelfCode: 'E-BOOK',
    title: 'Pedoman Hidup Islami Warga Muhammadiyah (PHIWM)',
    author: 'Pimpinan Pusat Muhammadiyah',
    publisher: 'Suara Muhammadiyah',
    year: '2000',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'Kemuhammadiyahan',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'buku-perpus/pedoman-hidup-islami-warga-muhammadiyah.pdf',
    coverUrl: 'assets/img/ebook-covers/pedoman-hidup-islami-warga-muhammadiyah.webp',
    description: 'Pedoman resmi nilai-nilai kepribadian, akhlak, dan perilaku islami bagi warga, kader, dan pimpinan persyarikatan Muhammadiyah.',
    createdAt: new Date().toISOString()
  };
  books['EB-MH-002'] = {
    code: 'EB-MH-002',
    shelfCode: 'E-BOOK',
    title: 'Risalah Islam Berkemajuan',
    author: 'Pimpinan Pusat Muhammadiyah',
    publisher: 'Suara Muhammadiyah',
    year: '2023',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'Kemuhammadiyahan',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'buku-perpus/risalah-islam-berkemajuan.pdf',
    coverUrl: 'assets/img/ebook-covers/risalah-islam-berkemajuan.webp',
    description: 'Dokumen ideologis resmi Muktamar Ke-48 Muhammadiyah yang meneguhkan komitmen pencerahan, moderasi, kemanusiaan, dan kemajuan peradaban.',
    createdAt: new Date().toISOString()
  };
  books['EB-CR-001'] = {
    code: 'EB-CR-001',
    shelfCode: 'E-BOOK',
    title: 'Kalah oleh Si Cerdik (Cerita Rakyat Nusantara)',
    author: 'Atisah',
    publisher: 'Badan Pengembangan & Pembinaan Bahasa Kemendikbud',
    year: '2016',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'Cerita Anak & Fiksi',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'buku-perpus/kalah-oleh-si-cerdik.pdf',
    coverUrl: 'assets/img/ebook-covers/kalah-oleh-si-cerdik.webp',
    description: 'Buku cerita rakyat nusantara mendidik untuk anak usia SD mengenai kecerdikan, budi pekerti, dan kebijaksanaan dalam menghadapi rintangan.',
    createdAt: new Date().toISOString()
  };
  books['EB-CR-002'] = {
    code: 'EB-CR-002',
    shelfCode: 'E-BOOK',
    title: 'Balas Budi Kupu-Kupu Biru',
    author: 'Sabir',
    publisher: 'Badan Pengembangan Bahasa dan Perbukuan Kemendikbud',
    year: '2019',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'Cerita Anak & Fiksi',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'buku-perpus/balas-budi-kupu-kupu-biru.pdf',
    coverUrl: 'assets/img/ebook-covers/balas-budi-kupu-kupu-biru.webp',
    description: 'Buku bacaan bergambar penuh warna untuk anak SD kelas 1-3 bertema tolong-menolong, ketulusan persahabatan, dan cinta lingkungan.',
    createdAt: new Date().toISOString()
  };
  books['EB-CR-003'] = {
    code: 'EB-CR-003',
    shelfCode: 'E-BOOK',
    title: 'Serigala Peniru dan Keluarga Kambing',
    author: 'Minjung Yoo (Ilustrator: Vinse)',
    publisher: 'Badan Pengembangan & Pembinaan Bahasa Kemendikbudristek',
    year: '2021',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'Cerita Anak & Fiksi',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'buku-perpus/serigala-peniru-dan-keluarga-kambing.pdf',
    coverUrl: 'assets/img/ebook-covers/serigala-peniru-dan-keluarga-kambing.webp',
    description: 'Fabel anak edukatif tingkat 1 yang mengajarkan kehati-hatian, kewaspadaan, dan ketaatan kepada nasihat orang tua.',
    createdAt: new Date().toISOString()
  };
  books['EB-PD-001'] = {
    code: 'EB-PD-001',
    shelfCode: 'E-BOOK',
    title: 'Menjadi Guru Inspiratif: Aplikasi Ilmu Psikologi Positif dalam Dunia Pendidikan',
    author: 'Dr. Neila Ramdhani',
    publisher: 'Titian Foundation & Yayasan Titian Masa Depan',
    year: '2016',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'Pendidikan & Guru',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'buku-perpus/menjadi-guru-inspiratif.pdf',
    coverUrl: 'assets/img/ebook-covers/menjadi-guru-inspiratif.webp',
    description: 'Panduan praktis bagi para pendidik untuk membangkitkan motivasi intrinsik, karakter positif, dan potensi terbaik peserta didik.',
    createdAt: new Date().toISOString()
  };
  books['EB-PD-002'] = {
    code: 'EB-PD-002',
    shelfCode: 'E-BOOK',
    title: 'Menjadi Guru Asyik Tapi Menantang (Dinamika Profesi Guru)',
    author: 'Ruslin, S.Pd., M.Pd., M.Sc., Ph.D',
    publisher: 'CV. Sarnu Untung',
    year: '2020',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'Pendidikan & Guru',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'buku-perpus/menjadi-guru-asyik-tapi-menantang.pdf',
    coverUrl: 'assets/img/ebook-covers/menjadi-guru-asyik-tapi-menantang.webp',
    description: 'Refleksi mendalam dan strategi pengajaran kreatif yang menyenangkan, adaptif terhadap zaman, dan memikat bagi murid generasi masa kini.',
    createdAt: new Date().toISOString()
  };

  console.log(`Bank Buku Dimuat: ${Object.keys(books).length} Buku (termasuk 8 E-Book digital aktif)`);

  const transactions = {};
  const trxRows = sections['TRANSAKSI'] || [];
  if (trxRows.length > 1) {
    for (let i = 1; i < trxRows.length; i++) {
      const row = trxRows[i];
      const trxNo = (row[0] || '').trim();
      if (!trxNo) continue;
      const legMemberCode = (row[2] || '').trim();
      const newMemberCode = legacyToNewCode[legMemberCode] || legMemberCode;

      transactions[trxNo] = {
        trxNo,
        borrowDate: parseDateIndo(row[1]),
        memberCode: newMemberCode,
        legacyMemberCode: legMemberCode,
        bookCode: (row[3] || '').trim(),
        durationDays: parseInt(row[4], 10) || 7,
        dueDate: parseDateIndo(row[5]),
        returnDate: parseDateIndo(row[6]),
        status: (row[7] || 'DIPINJAM').trim(),
        createdAt: new Date().toISOString()
      };
    }
  }

  const visits = {};
  const visitRows = sections['KUNJUNGAN'] || [];
  if (visitRows.length > 1) {
    for (let i = 1; i < visitRows.length; i++) {
      const row = visitRows[i];
      const rawDate = (row[0] || '').trim();
      const legMemberCode = (row[1] || '').trim();
      if (!rawDate || !legMemberCode) continue;

      const dateStr = parseDateIndo(rawDate);
      const newMemberCode = legacyToNewCode[legMemberCode] || legMemberCode;
      const m = members[newMemberCode] || {};
      const id = `VISIT-${String(i).padStart(4, '0')}`;

      visits[id] = {
        id,
        date: dateStr,
        time: rawDate.includes(' ') ? rawDate.split(' ')[1] : '08:30',
        memberCode: newMemberCode,
        legacyMemberCode: legMemberCode,
        memberName: m.name || legMemberCode,
        memberType: m.type || 'Siswa',
        purpose: 'Membaca / Meminjam',
        timestamp: new Date(dateStr).getTime()
      };
    }
  }

  const admins = {
    admin: {
      username: 'admin',
      passwordHash: 'TRiaT0865yiizBj0RnMVvJeqiygV4D/hJjrcLA7MYgM=',
      namaLengkap: 'Wildan Al Musthofa',
      email: 'admin@perpustakaan',
      fotoUrl: 'https://drive.google.com/uc?id=1Wlp-wk0QrKbAY08TsxZgaprA2dPnards&export=download'
    },
    'admin-dev': {
      username: 'admin-dev',
      passwordHash: 'EFPsbgfP/rGCi77kxXx1ywPJ/g2Y/iC1W2KME0mZRvc=',
      namaLengkap: 'Admin Ganteng',
      email: 'admin@ganteng',
      fotoUrl: 'https://drive.google.com/uc?id=1le1Lv7cqT3TsDV-cg2uygPEwshEWdBGe&export=download'
    }
  };

  const settings = {
    libraryName: 'MUSADA Library',
    schoolName: 'SD Muhammadiyah 1 Sedati',
    tagline: 'Pusat Literasi Digital, Jendela Ilmu & Akhlak Mulia',
    openHours: 'Senin - Kamis: 07.00 - 15.00 WIB | Jumat: 07.00 - 11.00 WIB | Sabtu: 07.30 - 12.00 WIB',
    defaultLoanDays: 7,
    maxLoanBooks: 2,
    finePerDay: 500,
    contactWa: '6285704845822',
    donationAccounts: [
      { bank: 'Bank Syariah Indonesia (BSI)', number: '7123456789', holder: 'SD Muhammadiyah 1 Sedati (Perpustakaan)' },
      { bank: 'Bank Jatim', number: '0192837465', holder: 'SD Muhammadiyah 1 Sedati' }
    ]
  };

  const donations = {
    'DON-2026-0001': {
      id: 'DON-2026-0001',
      type: 'buku',
      donorName: 'Hamba Allah (Alumni)',
      phone: '081234567890',
      bookCount: 15,
      bookTitles: 'Buku Cerita Islami, Ensiklopedia Sains Cilik',
      status: 'verified',
      date: '2026-05-02',
      createdAt: new Date().toISOString()
    }
  };

  const libraryPayload = {
    books,
    members,
    transactions,
    visits,
    admins,
    settings,
    donations,
    legacyMapping: legacyToNewCode
  };

  console.log('Mengunggah data terintegrasi murni siswa & GTK aktif ke Firebase RTDB /library...');
  await db.ref('library').set(libraryPayload);
  console.log('--- MIGRASI BERHASIL 100%! DATA TERBARU SISWA & GTK AKTIF TELAH AKTIF DI RTDB ---');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Gagal Migrasi:', err);
  process.exit(1);
});
