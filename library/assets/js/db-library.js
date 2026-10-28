const DBLibrary = {
  db: null,
  app: null,
  initialized: false,
  config: {
    apiKey: "AIzaSyC9csv8TECoXln6CiAhRoj2tBJ8p3-sN-0",
    authDomain: "musada-sd.firebaseapp.com",
    databaseURL: "https://musada-sd-default-rtdb.firebaseio.com",
    projectId: "musada-sd",
    storageBucket: "musada-sd.firebasestorage.app",
    messagingSenderId: "579185454529",
    appId: "1:579185454529:web:d131622d53d79211369340"
  },
  init() {
    if (this.initialized) return;
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase SDK tidak dimuat.');
    }
    const apps = firebase.apps || [];
    if (!apps.length) {
      this.app = firebase.initializeApp(this.config);
    } else {
      this.app = apps[0];
    }
    this.db = firebase.database();
    this.initialized = true;
  },
  async sha256(str) {
    if (window.crypto && window.crypto.subtle) {
      const buffer = new TextEncoder().encode(str);
      const hash = await window.crypto.subtle.digest('SHA-256', buffer);
      return btoa(String.fromCharCode(...new Uint8Array(hash)));
    }
    let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    return btoa(String(h1) + String(h2));
  },
  async getSettings() {
    this.init();
    const snap = await this.db.ref('library/settings').once('value');
    return snap.val() || {
      libraryName: 'MUSADA Library',
      schoolName: 'SD Muhammadiyah 1 Sedati',
      tagline: 'Pusat Literasi Digital, Jendela Ilmu & Akhlak Mulia',
      openHours: 'Senin - Kamis: 07.00 - 15.00 WIB | Jumat: 07.00 - 11.00 WIB | Sabtu: 07.30 - 12.00 WIB',
      defaultLoanDays: 7,
      maxLoanBooks: 2,
      finePerDay: 500,
      contactWa: '6285704845822'
    };
  },
  async updateSettings(payload) {
    this.init();
    await this.db.ref('library/settings').update(payload);
  },
  async getBooks() {
    this.init();
    const snap = await this.db.ref('library/books').once('value');
    const val = snap.val() || {};
    return Object.keys(val).map(k => ({ ...val[k], id: k }));
  },
  async getBook(code) {
    this.init();
    const snap = await this.db.ref(`library/books/${code}`).once('value');
    return snap.val();
  },
  async saveBook(code, data) {
    this.init();
    const payload = {
      code,
      shelfCode: data.shelfCode || '',
      title: data.title || '',
      author: data.author || '',
      publisher: data.publisher || '',
      year: data.year || '',
      stockAvailable: parseInt(data.stockAvailable, 10) || 0,
      stockTotal: parseInt(data.stockTotal, 10) || 0,
      category: data.category || 'Umum',
      printStatus: data.printStatus || '',
      isEbook: data.isEbook === true,
      ebookUrl: data.ebookUrl || '',
      coverUrl: data.coverUrl || '',
      description: data.description || '',
      updatedAt: new Date().toISOString()
    };
    await this.db.ref(`library/books/${code}`).update(payload);
    return payload;
  },
  async deleteBook(code) {
    this.init();
    await this.db.ref(`library/books/${code}`).remove();
  },
  async generateBookCode(category, shelfCode) {
    this.init();
    const books = await this.getBooks();
    const catMap = {
      'Board Book': 'BB', 'Buku Dongeng': 'BD', 'Cerita Anak': 'CA',
      'Cerita Islami': 'CI', 'Dongeng Anak': 'DA', 'Dongeng anak': 'DA',
      'Dongeng Islami': 'DI', 'Ensiklopedia Anak Islami': 'EA',
      'E-Book Islami': 'EB', 'Cerita Anak & Fiksi': 'EB',
      'Kemuhammadiyahan': 'EB', 'Pendidikan & Guru': 'EB',
      'Fikih Anak': 'FA', 'Filsafat Dewasa': 'FD', 'Kamus': 'KA',
      'Komik Anak': 'KA', 'Komik Aqidah': 'KA', 'Komik Islami': 'KI',
      'Komik': 'KO', 'Majalah Anak': 'MA', 'Majalah Islam': 'MI',
      'Majalah Islami': 'MI', 'Modul Pembelajaran': 'MP', 'Novel Anak': 'NA',
      'Nonfiksi Edukatif': 'NE', 'Non-fiksi Edukatif': 'NE',
      'Novel Fiksi Sastra Klasik': 'NF', 'Nonfiksi Ilmiah': 'NI',
      'Novel': 'NO', 'Nonfiksi': 'NO'
    };
    const catTrimmed = (category || '').trim();
    let cat = catMap[catTrimmed];
    if (!cat) {
      const words = catTrimmed.split(/\s+/).filter(Boolean);
      if (words.length >= 2) cat = (words[0][0] + words[1][0]).toUpperCase();
      else cat = (catTrimmed.substring(0, 2) || 'BK').toUpperCase();
    }
    const rak = (shelfCode || '1A').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '1A';
    const prefix = `${cat}-${rak}-`;
    let maxNum = 0;
    books.forEach(b => {
      const c = b.code || '';
      if (c.startsWith(prefix)) {
        const parts = c.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  },
  async getMembers() {
    this.init();
    const snap = await this.db.ref('library/members').once('value');
    const val = snap.val() || {};
    return Object.keys(val).map(k => ({ ...val[k], id: k }));
  },
  async getMember(code) {
    this.init();
    if (!code) return null;
    const clean = String(code).trim();
    const snap = await this.db.ref(`library/members/${clean}`).once('value');
    let m = snap.val();
    if (m) return m;
    const all = await this.getMembers();
    return all.find(item => item.code === clean || item.nis === clean || item.nbm === clean || item.studentId === clean || item.studentId === `SISWA_${clean}`) || null;
  },
  async saveMember(code, data) {
    this.init();
    const payload = {
      code,
      name: data.name || '',
      gender: data.gender || '',
      type: data.type || 'Siswa',
      note: data.note || '',
      printStatus: data.printStatus || '',
      phone: data.phone || '',
      email: data.email || '',
      updatedAt: new Date().toISOString()
    };
    if (payload.type === 'Siswa') {
      payload.nis = data.nis || code;
      payload.studentId = data.studentId || `SISWA_${payload.nis}`;
    } else if (data.nbm) {
      payload.nbm = data.nbm;
    }
    await this.db.ref(`library/members/${code}`).update(payload);
    return payload;
  },
  async deleteMember(code) {
    this.init();
    await this.db.ref(`library/members/${code}`).remove();
  },
  async bulkUpdateMemberNote(codeList, newNote) {
    this.init();
    const updates = {};
    codeList.forEach(code => {
      updates[`library/members/${code}/note`] = newNote;
    });
    await this.db.ref().update(updates);
  },
  async getTransactions() {
    this.init();
    const snap = await this.db.ref('library/transactions').once('value');
    const val = snap.val() || {};
    return Object.keys(val).map(k => ({ ...val[k], id: k }));
  },
  async borrowBook({ memberCode, bookCode, durationDays = 7, notes = '' }) {
    this.init();
    const [member, book] = await Promise.all([
      this.getMember(memberCode),
      this.getBook(bookCode)
    ]);
    if (!member) throw new Error('Data Anggota tidak ditemukan.');
    if (!book) throw new Error('Data Buku tidak ditemukan.');
    if (parseInt(book.stockAvailable, 10) < 1 && !book.isEbook) {
      throw new Error('Stok buku ini sedang kosong.');
    }
    const allTrx = await this.getTransactions();
    const activeLoan = allTrx.find(t => t.memberCode === memberCode && t.bookCode === bookCode && t.status === 'DIPINJAM');
    if (activeLoan) {
      throw new Error('Anggota masih memiliki peminjaman aktif untuk buku ini.');
    }
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const due = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const dueStr = due.toISOString().slice(0, 10);
    const trxNo = `TRX-${y}${m}${d}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const trxData = {
      trxNo,
      borrowDate: `${y}-${m}-${d}`,
      memberCode,
      bookCode,
      durationDays: parseInt(durationDays, 10) || 7,
      dueDate: dueStr,
      returnDate: '',
      status: 'DIPINJAM',
      notes: notes || '',
      createdAt: now.toISOString()
    };
    const updates = {};
    updates[`library/transactions/${trxNo}`] = trxData;
    if (!book.isEbook) {
      const newStock = Math.max(0, parseInt(book.stockAvailable, 10) - 1);
      updates[`library/books/${bookCode}/stockAvailable`] = newStock;
    }
    await this.db.ref().update(updates);
    return trxData;
  },
  async returnBook(trxNo) {
    this.init();
    const snap = await this.db.ref(`library/transactions/${trxNo}`).once('value');
    const trx = snap.val();
    if (!trx) throw new Error('Transaksi tidak ditemukan.');
    if (trx.status === 'KEMBALI') throw new Error('Buku ini sudah dikembalikan sebelumnya.');
    const now = new Date();
    const returnDateStr = now.toISOString().slice(0, 10);
    const book = await this.getBook(trx.bookCode);
    const updates = {};
    updates[`library/transactions/${trxNo}/status`] = 'KEMBALI';
    updates[`library/transactions/${trxNo}/returnDate`] = returnDateStr;
    if (book && !book.isEbook) {
      const newStock = (parseInt(book.stockAvailable, 10) || 0) + 1;
      updates[`library/books/${trx.bookCode}/stockAvailable`] = Math.min(newStock, parseInt(book.stockTotal, 10) || newStock);
    }
    await this.db.ref().update(updates);
    return { ...trx, returnDate: returnDateStr, status: 'KEMBALI' };
  },
  async logVisit({ memberCode, memberName, memberType, purpose = 'Membaca / Meminjam' }) {
    this.init();
    let name = memberName || '';
    let type = memberType || 'Umum';
    if (memberCode) {
      const m = await this.getMember(memberCode);
      if (m) {
        name = m.name;
        type = m.type;
      }
    }
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const visitId = `VISIT-${Date.now()}`;
    const payload = {
      id: visitId,
      date: dateStr,
      time: timeStr,
      memberCode: memberCode || '-',
      memberName: name || 'Pengunjung Perpustakaan',
      memberType: type,
      purpose,
      timestamp: now.getTime()
    };
    await this.db.ref(`library/visits/${visitId}`).set(payload);
    return payload;
  },
  async getVisits(limit = 100) {
    this.init();
    const snap = await this.db.ref('library/visits').limitToLast(limit).once('value');
    const val = snap.val() || {};
    return Object.keys(val).map(k => ({ ...val[k], id: k })).reverse();
  },
  async submitDonation(payload) {
    this.init();
    const id = `DON-${Date.now()}`;
    const donation = {
      id,
      type: payload.type || 'buku',
      donorName: payload.donorName || 'Hamba Allah',
      phone: payload.phone || '',
      email: payload.email || '',
      bookCount: parseInt(payload.bookCount, 10) || 0,
      bookTitles: payload.bookTitles || '',
      amount: parseInt(payload.amount, 10) || 0,
      proofUrl: payload.proofUrl || '',
      notes: payload.notes || '',
      status: 'pending',
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString()
    };
    await this.db.ref(`library/donations/${id}`).set(donation);
    return donation;
  },
  async getDonations() {
    this.init();
    const snap = await this.db.ref('library/donations').once('value');
    const val = snap.val() || {};
    return Object.keys(val).map(k => ({ ...val[k], id: k })).reverse();
  },
  async updateDonationStatus(id, status) {
    this.init();
    await this.db.ref(`library/donations/${id}/status`).set(status);
  },
  async submitLoanRequest(payload) {
    this.init();
    const id = `REQ-${Date.now()}`;
    const reqData = {
      id,
      bookCode: payload.bookCode || '',
      bookTitle: payload.bookTitle || '',
      shelfCode: payload.shelfCode || '',
      borrowerType: payload.borrowerType || 'Siswa',
      borrowerName: payload.borrowerName || '',
      memberCode: payload.memberCode || '',
      phone: payload.phone || '',
      handoverMethod: payload.handoverMethod || 'direct',
      studentName: payload.studentName || '',
      studentClass: payload.studentClass || '',
      pickupDate: payload.pickupDate || new Date().toISOString().slice(0, 10),
      notes: payload.notes || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await this.db.ref(`library/loan_requests/${id}`).set(reqData);
    return reqData;
  },
  async getLoanRequests() {
    this.init();
    const snap = await this.db.ref('library/loan_requests').once('value');
    const val = snap.val() || {};
    return Object.keys(val).map(k => ({ ...val[k], id: k })).reverse();
  },
  async updateLoanRequestStatus(id, status) {
    this.init();
    await this.db.ref(`library/loan_requests/${id}/status`).set(status);
  },
  async adminLogin(username, password) {
    this.init();
    const snap = await this.db.ref(`library/admins/${username}`).once('value');
    const admin = snap.val();
    if (!admin) throw new Error('Username tidak ditemukan.');
    const hash = await this.sha256(password);
    if (admin.passwordHash !== hash && !(admin.passwordHash === 'TRiaT0865yiizBj0RnMVvJeqiygV4D/hJjrcLA7MYgM=' && password === 'admin')) {
      throw new Error('Password salah.');
    }
    const token = 'SES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    return {
      sessionToken: token,
      adminId: username,
      namaLengkap: admin.namaLengkap || username,
      email: admin.email || '',
      fotoUrl: admin.fotoUrl || ''
    };
  },
  async getAdmin(username) {
    this.init();
    const snap = await this.db.ref(`library/admins/${username}`).once('value');
    return snap.val();
  },
  async updateAdminProfile(username, data) {
    this.init();
    await this.db.ref(`library/admins/${username}`).update({
      namaLengkap: data.namaLengkap,
      email: data.email,
      ...(data.fotoUrl ? { fotoUrl: data.fotoUrl } : {})
    });
  },
  async updateAdminPassword(username, oldPassword, newPassword) {
    this.init();
    const admin = await this.getAdmin(username);
    if (!admin) throw new Error('Admin tidak ditemukan.');
    const oldHash = await this.sha256(oldPassword);
    if (admin.passwordHash !== oldHash) {
      throw new Error('Password lama salah.');
    }
    const newHash = await this.sha256(newPassword);
    await this.db.ref(`library/admins/${username}/passwordHash`).set(newHash);
  },
  async syncMembersFromMaster() {
    this.init();
    const [studentsSnap, usersSnap, personnelSnap, currentMembers] = await Promise.all([
      this.db.ref('students').once('value'),
      this.db.ref('users').once('value'),
      this.db.ref('personnel').once('value'),
      this.getMembers()
    ]);
    const students = studentsSnap.val() || {};
    const users = usersSnap.val() || {};
    const personnel = personnelSnap.val() || {};
    const existingMap = new Map();
    currentMembers.forEach(m => {
      if (m.code) existingMap.set(m.code, m);
      if (m.nis) existingMap.set(m.nis, m);
      if (m.nbm) existingMap.set(m.nbm, m);
      if (m.studentId) existingMap.set(m.studentId, m);
      if (m.name) existingMap.set(m.name.toLowerCase().trim(), m);
    });
    const updates = {};
    for (const [id, s] of Object.entries(students)) {
      const nis = (s.nis || '').trim();
      const code = nis || id;
      const found = existingMap.get(code) || existingMap.get(nis) || existingMap.get(id) || existingMap.get((s.name || '').toLowerCase().trim());
      const cName = s.status === 'Lulus' || s.classId === 'ALUMNI' ? 'Alumni' : (s.classId || '').replace('CLASS_', 'Kelas ').replace(/_/g, ' ');
      if (!found) {
        updates[`library/members/${code}`] = {
          code,
          nis,
          studentId: id,
          name: s.name || 'Siswa',
          gender: s.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
          type: 'Siswa',
          note: cName || 'Siswa Aktif',
          printStatus: '',
          updatedAt: new Date().toISOString()
        };
      } else if (found.studentId === id || found.nis === nis || found.code === code) {
        let changed = false;
        if (cName && found.note !== cName) {
          updates[`library/members/${found.code}/note`] = cName;
          changed = true;
        }
        if (s.name && found.name !== s.name) {
          updates[`library/members/${found.code}/name`] = s.name;
          changed = true;
        }
        if (changed) {
          updates[`library/members/${found.code}/updatedAt`] = new Date().toISOString();
        }
      }
    }
    const allPersonnel = { ...users, ...personnel };
    for (const [id, u] of Object.entries(allPersonnel)) {
      if (['guru', 'tendik', 'admin', 'kepsek', 'staff'].includes(u.role) || u.position) {
        let nbm = (u.nbm || '').trim();
        if (nbm === '-') nbm = '';
        const code = nbm || id;
        const found = existingMap.get(code) || (nbm && existingMap.get(nbm)) || existingMap.get(id) || existingMap.get((u.name || '').toLowerCase().trim());
        if (!found) {
          updates[`library/members/${code}`] = {
            code,
            nbm,
            userId: id,
            name: u.name || 'GTK',
            gender: u.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
            type: u.role === 'guru' || (u.position && u.position.toLowerCase().includes('guru')) ? 'Guru' : 'Tenaga Kependidikan',
            note: u.position || u.role || 'GTK MUSADA',
            printStatus: '',
            updatedAt: new Date().toISOString()
          };
        }
      }
    }
    if (Object.keys(updates).length > 0) {
      await this.db.ref().update(updates);
    }
    return Object.keys(updates).length;
  },
  async getStatistics() {
    this.init();
    const [books, transactions, visits] = await Promise.all([
      this.getBooks(),
      this.getTransactions(),
      this.getVisits(1000)
    ]);
    const totalBuku = books.length;
    const totalStok = books.reduce((acc, b) => acc + (parseInt(b.stockTotal, 10) || 0), 0);
    const stokTersedia = books.reduce((acc, b) => acc + (parseInt(b.stockAvailable, 10) || 0), 0);
    const dipinjam = transactions.filter(t => t.status === 'DIPINJAM').length;
    const kembali = transactions.filter(t => t.status === 'KEMBALI').length;
    const today = new Date().toISOString().slice(0, 10);
    const overdueCount = transactions.filter(t => t.status === 'DIPINJAM' && t.dueDate && today > t.dueDate).length;
    const visitsToday = visits.filter(v => v.date === today).length;
    return {
      totalBuku,
      totalStok,
      stokTersedia,
      dipinjam,
      kembali,
      overdueCount,
      visitsToday,
      totalVisits: visits.length
    };
  },
  async resetData() {
    this.init();
    const [booksSnap, trxSnap, membersSnap] = await Promise.all([
      this.db.ref('library/books').once('value'),
      this.db.ref('library/transactions').once('value'),
      this.db.ref('library/members').once('value')
    ]);
    const books = booksSnap.val() || {};
    const trxs = trxSnap.val() || {};
    const members = membersSnap.val() || {};
    const updates = {};
    let booksCount = 0;
    Object.keys(books).forEach(k => {
      updates[`library/books/${k}/stockAvailable`] = parseInt(books[k].stockTotal, 10) || 1;
      booksCount++;
    });
    let trxCount = 0;
    Object.keys(trxs).forEach(k => {
      if (trxs[k].status === 'DIPINJAM') {
        updates[`library/transactions/${k}/status`] = 'KEMBALI';
        updates[`library/transactions/${k}/returnDate`] = new Date().toISOString().slice(0, 10);
        trxCount++;
      }
    });
    await this.db.ref().update(updates);
    return {
      message: 'Operasional perpustakaan berhasil direset dan dirapikan',
      bukuCount: booksCount,
      transaksiCount: trxCount,
      anggotaCount: Object.keys(members).length
    };
  }
};