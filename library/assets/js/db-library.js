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
  async getMembers() {
    this.init();
    const snap = await this.db.ref('library/members').once('value');
    const val = snap.val() || {};
    return Object.keys(val).map(k => ({ ...val[k], id: k }));
  },
  async getMember(code) {
    this.init();
    const snap = await this.db.ref(`library/members/${code}`).once('value');
    return snap.val();
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
    const [studentsSnap, usersSnap, currentMembers] = await Promise.all([
      this.db.ref('students').once('value'),
      this.db.ref('users').once('value'),
      this.getMembers()
    ]);
    const students = studentsSnap.val() || {};
    const users = usersSnap.val() || {};
    const existingCodes = new Set(currentMembers.map(m => m.code));
    const updates = {};
    let sIndex = 1;
    currentMembers.filter(m => m.code && m.code.startsWith('S-')).forEach(m => {
      const num = parseInt(m.code.replace('S-', ''), 10);
      if (num >= sIndex) sIndex = num + 1;
    });
    for (const [id, s] of Object.entries(students)) {
      const found = currentMembers.find(m => m.studentId === id || (m.name && m.name.toLowerCase() === (s.name || '').toLowerCase()));
      if (!found) {
        const code = `S-${String(sIndex).padStart(3, '0')}`;
        sIndex++;
        updates[`library/members/${code}`] = {
          code,
          studentId: id,
          name: s.name || 'Siswa',
          gender: s.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
          type: 'Siswa',
          note: s.classId ? `Kelas ${s.classId.toUpperCase()}` : 'Siswa Aktif',
          printStatus: '',
          createdAt: new Date().toISOString()
        };
      }
    }
    let gIndex = 1;
    currentMembers.filter(m => m.code && m.code.startsWith('G-')).forEach(m => {
      const num = parseInt(m.code.replace('G-', ''), 10);
      if (num >= gIndex) gIndex = num + 1;
    });
    for (const [id, u] of Object.entries(users)) {
      if (u.role === 'guru' || u.role === 'tendik' || u.role === 'admin') {
        const found = currentMembers.find(m => m.teacherId === id || (m.name && m.name.toLowerCase() === (u.name || '').toLowerCase()));
        if (!found) {
          const code = `G-${String(gIndex).padStart(3, '0')}`;
          gIndex++;
          updates[`library/members/${code}`] = {
            code,
            teacherId: id,
            name: u.name || 'Guru/Karyawan',
            gender: u.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
            type: 'GTK',
            note: u.position || u.role || 'GTK MUSADA',
            printStatus: '',
            createdAt: new Date().toISOString()
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
  }
};
