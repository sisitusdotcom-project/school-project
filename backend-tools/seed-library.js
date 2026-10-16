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
async function run() {
  const tsvPath = path.join(__dirname, '..', 'library', 'Spreadsheet.tsv');
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
  const members = {};
  const anggotaRows = sections['ANGGOTA'] || [];
  if (anggotaRows.length > 1) {
    for (let i = 1; i < anggotaRows.length; i++) {
      const row = anggotaRows[i];
      const code = (row[0] || '').trim();
      if (!code) continue;
      members[code] = {
        code,
        name: (row[1] || '').trim(),
        gender: (row[2] || '').trim(),
        type: (row[3] || 'Siswa').trim(),
        note: (row[4] || '').trim(),
        printStatus: (row[5] || '').trim(),
        createdAt: new Date().toISOString()
      };
    }
  }
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
  books['EB-DA-001'] = {
    code: 'EB-DA-001',
    shelfCode: 'DIGITAL',
    title: 'Kisah Sahabat Cilik Rasulullah',
    author: 'Tim Bina Literasi Islam',
    publisher: 'Pustaka Teladan',
    year: '2023',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'E-Book Islami',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'https://pdfobject.com/pdf/sample.pdf',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    description: 'Kumpulan cerita inspiratif sahabat-sahabat cilik di masa Rasulullah ﷺ yang santun, pemberani, dan cinta ilmu.',
    createdAt: new Date().toISOString()
  };
  books['EB-PL-001'] = {
    code: 'EB-PL-001',
    shelfCode: 'DIGITAL',
    title: 'Petualangan Sains: Rahasia Alam Semesta',
    author: 'Dr. Hendra Wijaya',
    publisher: 'Erlangga Edukasi',
    year: '2024',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'Sains & Teknologi',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'https://pdfobject.com/pdf/sample.pdf',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=400&q=80',
    description: 'Buku pengayaan IPA dasar tentang tata surya, energi terbarukan, dan eksperimen seru di rumah untuk siswa SD.',
    createdAt: new Date().toISOString()
  };
  books['EB-NV-001'] = {
    code: 'EB-NV-001',
    shelfCode: 'DIGITAL',
    title: 'Laskar Bintang Sedati',
    author: 'Rina Kusuma Wardhani',
    publisher: 'Muhammadiyah Press',
    year: '2023',
    stockAvailable: 99,
    stockTotal: 99,
    category: 'Cerita Fiksi',
    printStatus: '',
    isEbook: true,
    ebookUrl: 'https://pdfobject.com/pdf/sample.pdf',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    description: 'Novel edukasi persahabatan anak-anak sekolah yang berjuang meraih juara olimpiade sains dengan kejujuran dan ketekunan.',
    createdAt: new Date().toISOString()
  };
  const transactions = {};
  const trxRows = sections['TRANSAKSI'] || [];
  if (trxRows.length > 1) {
    for (let i = 1; i < trxRows.length; i++) {
      const row = trxRows[i];
      const trxNo = (row[0] || '').trim();
      if (!trxNo) continue;
      transactions[trxNo] = {
        trxNo,
        borrowDate: (row[1] || '').trim(),
        memberCode: (row[2] || '').trim(),
        bookCode: (row[3] || '').trim(),
        durationDays: parseInt(row[4], 10) || 7,
        dueDate: (row[5] || '').trim(),
        returnDate: (row[6] || '').trim(),
        status: (row[7] || 'DIPINJAM').trim()
      };
    }
  }
  const visits = {};
  const visitRows = sections['KUNJUNGAN'] || [];
  if (visitRows.length > 1) {
    for (let i = 1; i < visitRows.length; i++) {
      const row = visitRows[i];
      const date = (row[0] || '').trim();
      const memberCode = (row[1] || '').trim();
      if (!date || !memberCode) continue;
      const id = `VISIT-${String(i).padStart(4, '0')}`;
      const m = members[memberCode] || {};
      visits[id] = {
        id,
        date,
        memberCode,
        memberName: m.name || memberCode,
        memberType: m.type || 'Siswa',
        timestamp: new Date(date).getTime()
      };
    }
  }
  const admins = {};
  const adminRows = sections['ADMIN'] || [];
  if (adminRows.length > 1) {
    for (let i = 1; i < adminRows.length; i++) {
      const row = adminRows[i];
      const username = (row[0] || '').trim();
      if (!username) continue;
      admins[username] = {
        username,
        passwordHash: (row[1] || '').trim(),
        namaLengkap: (row[2] || '').trim(),
        email: (row[3] || '').trim(),
        fotoUrl: (row[4] || '').trim()
      };
    }
  }
  const settings = {
    libraryName: 'Perpustakaan Surya Pintar',
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
      donorName: 'Hamba Allah (Alumni 2024)',
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
    donations
  };
  console.log('Menyimpan data /library ke Firebase Realtime Database...');
  await db.ref('library').set(libraryPayload);
  console.log('Berhasil mengimpor data /library ke RTDB!');
  const rulesPath = path.join(__dirname, '..', 'login', 'database.rules.json');
  let rulesString = fs.readFileSync(rulesPath, 'utf8');
  if (!rulesString.includes('"library"')) {
    rulesString = rulesString.replace(
      /(\"student_promotions\"[\s\S]*?\}\s*\}\s*)(\}\s*\}\s*)$/,
      `$1,
    "library": {
      ".read": "true",
      ".write": "true",
      "books": {
        ".indexOn": ["category", "shelfCode", "title"]
      },
      "members": {
        ".indexOn": ["code", "type", "name"]
      },
      "transactions": {
        ".indexOn": ["memberCode", "bookCode", "status", "dueDate"]
      },
      "visits": {
        ".indexOn": ["date", "memberCode"]
      },
      "donations": {
        ".indexOn": ["status", "type", "createdAt"]
      }
    }
  }
}`
    );
    fs.writeFileSync(rulesPath, rulesString, 'utf8');
    console.log('Menambahkan aturan rules library ke database.rules.json...');
  }
  console.log('Menerapkan aturan keamanan ke Firebase Realtime Database...');
  await db.setRules(rulesString);
  console.log('Rules berhasil diterapkan!');
  process.exit(0);
}
run().catch(err => {
  console.error('Seed Library Error:', err);
  process.exit(1);
});
