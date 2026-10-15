import os
import re

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js_dir = os.path.join(base_dir, 'login', 'public', 'assets', 'js')

def update_db():
    p = os.path.join(js_dir, 'db.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()
    
    needle = "  async getTeacherAttendanceByDate(dateStr) {\n    return this._readCollection(`teacher_attendance/${dateStr}`, {});\n  },"
    addition = "\n  async getTeacherAttendanceRange(startDate, endDate) {\n    if (!isDBReady()) return {};\n    const snap = await db.ref('teacher_attendance').orderByKey().startAt(startDate).endAt(endDate).once('value');\n    return snap.val() || {};\n  },"
    
    if needle in c:
        if "getTeacherAttendanceRange" not in c:
            c = c.replace(needle, needle + addition, 1)
            with open(p, 'w', encoding='utf-8') as f:
                f.write(c)
            print("db.js updated successfully!")
        else:
            print("db.js already has getTeacherAttendanceRange.")
    else:
        print("db.js needle not found!")

def update_module_defs():
    p = os.path.join(js_dir, 'module-defs.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    old_personnel_data = """    '#/personnel/data': {
      node: 'personnel/directory', noun: 'Data Kepegawaian', writeRoles: PE, statusField: 'status', badges: { ...badges, Cuti: 'warning' },
      subtitle: 'Direktori pegawai: guru dan tenaga kependidikan.',
      summary: [
        { label: 'Total Pegawai', icon: 'ph-folder-user', tone: 'primary' },
        { label: 'Aktif', icon: 'ph-check-circle', tone: 'success', where: { status: 'Aktif' } },
        { label: 'Cuti', icon: 'ph-airplane-tilt', tone: 'warning', where: { status: 'Cuti' } }
      ],
      fields: [
        t('name', 'Nama Lengkap', { required: true }),
        t('nip', 'NIP / NUPTK'),
        t('position', 'Jabatan', { required: true }),
        sel('employmentStatus', 'Status Kepegawaian', ['PNS', 'GTY', 'GTT', 'Honorer', 'Tendik'], { required: true }),
        t('phone', 'No. HP'),
        t('education', 'Pendidikan Terakhir'),
        date('joinDate', 'Tanggal Bergabung'),
        ref('userId', 'Akun Sistem (opsional)', 'user'),
        sel('status', 'Status', ['Aktif', 'Cuti', 'Nonaktif'], { required: true, default: 'Aktif' })
      ]
    },"""

    new_personnel_data = """    '#/personnel/data': {
      node: 'personnel/directory', noun: 'Data Kepegawaian', writeRoles: PE, statusField: 'status', badges: { ...badges, Cuti: 'warning' },
      subtitle: 'Direktori resmi SDM GTK SD Muhammadiyah 1 Sedati bersumber Dapodik.',
      summary: [
        { label: 'Total Pegawai', icon: 'ph-folder-user', tone: 'primary' },
        { label: 'Aktif', icon: 'ph-check-circle', tone: 'success', where: { status: 'Aktif' } },
        { label: 'Cuti', icon: 'ph-airplane-tilt', tone: 'warning', where: { status: 'Cuti' } }
      ],
      fields: [
        t('name', 'Nama Lengkap', { required: true }),
        t('nbm', 'NBM (Nomor Baku Muhammadiyah)'),
        t('nuptk', 'NUPTK'),
        t('position', 'Jabatan / Tugas', { required: true }),
        sel('employmentStatus', 'Status Kepegawaian', ['PNS', 'GTY', 'GTT', 'Honorer', 'Tendik'], { required: true }),
        t('phone', 'No. HP / WA'),
        t('education', 'Pendidikan Terakhir'),
        date('joinDate', 'TMT Pengangkatan / Bergabung'),
        ref('userId', 'Akun Sistem (opsional)', 'user'),
        sel('status', 'Status', ['Aktif', 'Cuti', 'Nonaktif'], { required: true, default: 'Aktif' })
      ]
    },"""

    old_evaluations = """    '#/personnel/evaluations': { wakaOnly: true,
      node: 'personnel/evaluations', noun: 'Penilaian Kinerja (PKG)', writeRoles: PE, dateField: 'date', statusField: 'predicate', badges: { 'Sangat Baik': 'success', Baik: 'success', Cukup: 'warning', Kurang: 'danger' },
      subtitle: 'Evaluasi kinerja tahunan kompetensi pedagogik, kepribadian, dan profesional guru.',
      derive: (p) => {
        const ped = Number(p.pedagogicScore) || 0;
        const per = Number(p.personalityScore) || 0;
        const pro = Number(p.professionalScore) || 0;
        const avg = Math.round((ped + per + pro) / 3);
        const pred = avg >= 85 ? 'Sangat Baik' : (avg >= 70 ? 'Baik' : (avg >= 55 ? 'Cukup' : 'Kurang'));
        return { score: avg, predicate: pred };
      },
      summary: [
        { label: 'Total Penilaian', icon: 'ph-chart-line-up', tone: 'primary' },
        { label: 'Sangat Baik', icon: 'ph-star', tone: 'success', where: { predicate: 'Sangat Baik' } },
        { label: 'Perlu Pembinaan', icon: 'ph-warning', tone: 'danger', where: { predicate: ['Cukup', 'Kurang'] } }
      ],
      fields: [
        date('date', 'Tanggal Penilaian', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        t('period', 'Periode Penilaian', { required: true }),
        num('pedagogicScore', 'Kompetensi Pedagogik (0-100)', { required: true }),
        num('personalityScore', 'Kompetensi Kepribadian & Sosial (0-100)', { required: true }),
        num('professionalScore', 'Kompetensi Profesional (0-100)', { required: true }),
        num('score', 'Skor Rata-rata PKG', { readonly: true }),
        sel('predicate', 'Predikat Akhir', ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'], { readonly: true }),
        area('note', 'Catatan & Rencana Pengembangan Keprofesian')
      ]
    },"""

    new_evaluations = """    '#/personnel/evaluations': { wakaOnly: true,
      node: 'personnel/evaluations', noun: 'Penilaian Kinerja SDM', writeRoles: PE, dateField: 'date', statusField: 'statusRecommendation', badges: { 'Prioritas': 'success', 'Prospek': 'success', 'Lanjutan': 'info', 'Pemula': 'warning', 'Perlu Pembinaan': 'danger', 'Naik': 'success', 'Tetap': 'info' },
      subtitle: 'Format Penilaian Kinerja SDM Majelis Dikdasmen & PNF PCM Sedati: Loyalitas, Kapasitas, dan Kapabilitas.',
      derive: (p) => {
        const l1 = Number(p.loyaltyCountry) || 0;
        const l2 = Number(p.loyaltyMuhammadiyah) || 0;
        const l3 = Number(p.loyaltyAum) || 0;
        const l4 = Number(p.loyaltyCommitment) || 0;
        const avgLoyalty = Math.round((l1 + l2 + l3 + l4) / 4);
        const c1 = Number(p.capacityExemplary) || 0;
        const c2 = Number(p.capacityTeamwork) || 0;
        const c3 = Number(p.capacityLeadership) || 0;
        const c4 = Number(p.capacityDiscipline) || 0;
        const c5 = Number(p.capacityInnovation) || 0;
        const c6 = Number(p.capacityResponsibility) || 0;
        const c7 = Number(p.capacityIntegrity) || 0;
        const c8 = Number(p.capacitySelfDev) || 0;
        const avgCapacity = Math.round((c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8) / 8);
        const avgCapability = Number(p.capabilitySop) || 0;
        const avgTotal = Math.round((avgLoyalty + avgCapacity + avgCapability) / 3);
        const isPass = (avgLoyalty >= 75) && (avgCapacity >= 75) && (avgCapability >= 75);
        let pred = 'Pemula';
        if (!isPass) {
          pred = 'Perlu Pembinaan';
        } else if (avgTotal >= 90) {
          pred = 'Prioritas';
        } else if (avgTotal >= 85) {
          pred = 'Prospek';
        } else if (avgTotal >= 81) {
          pred = 'Lanjutan';
        }
        const recStatus = p.statusRecommendation || (isPass && avgTotal >= 85 ? 'Naik' : 'Tetap');
        return {
          avgLoyalty: avgLoyalty,
          avgCapacity: avgCapacity,
          avgCapability: avgCapability,
          score: avgTotal,
          predicate: pred,
          statusRecommendation: recStatus
        };
      },
      summary: [
        { label: 'Total Penilaian', icon: 'ph-chart-line-up', tone: 'primary' },
        { label: 'Rekomendasi Naik', icon: 'ph-arrow-up-right', tone: 'success', where: { statusRecommendation: 'Naik' } },
        { label: 'Perlu Pembinaan', icon: 'ph-warning', tone: 'danger', where: { predicate: 'Perlu Pembinaan' } }
      ],
      fields: [
        date('date', 'Tanggal Penilaian', { required: true }),
        ref('employeeId', 'Pegawai SDM', 'employee', { required: true }),
        t('period', 'Periode Penilaian (contoh: Semester Ganjil 2026/2027)', { required: true }),
        num('loyaltyCountry', '1.1 Loyalitas thd Negara (1-100, Lulus >= 75)', { required: true }),
        num('loyaltyMuhammadiyah', '1.2 Loyalitas thd Perserikatan (1-100, Lulus >= 75)', { required: true }),
        num('loyaltyAum', '1.3 Loyalitas thd AUM (1-100, Lulus >= 75)', { required: true }),
        num('loyaltyCommitment', '1.4 Kepatuhan & Komitmen (1-100, Lulus >= 75)', { required: true }),
        num('avgLoyalty', 'Rata-rata Loyalitas', { readonly: true }),
        num('capacityExemplary', '2.1 Keteladanan / Uswah Hasanah (1-100, Lulus >= 75)', { required: true }),
        num('capacityTeamwork', '2.2 Team Work / Kolektif Kolegial (1-100, Lulus >= 75)', { required: true }),
        num('capacityLeadership', '2.3 Leadership (1-100, Lulus >= 75)', { required: true }),
        num('capacityDiscipline', '2.4 Kedisiplinan (1-100, Lulus >= 75)', { required: true }),
        num('capacityInnovation', '2.5 Inovasi & Kreasi (1-100, Lulus >= 75)', { required: true }),
        num('capacityResponsibility', '2.6 Tanggung Jawab / Responsibility (1-100, Lulus >= 75)', { required: true }),
        num('capacityIntegrity', '2.7 Kejujuran (1-100, Lulus >= 75)', { required: true }),
        num('capacitySelfDev', '2.8 Pengembangan Diri (1-100, Lulus >= 75)', { required: true }),
        num('avgCapacity', 'Rata-rata Kapasitas', { readonly: true }),
        num('capabilitySop', '3.1 Pelaksanaan Jobdesk & SOP SDM (1-100, Lulus >= 75)', { required: true }),
        num('avgCapability', 'Rata-rata Kapabilitas', { readonly: true }),
        num('score', 'Rata-rata Total Nilai Kinerja', { readonly: true }),
        sel('predicate', 'Kategori Kinerja SDM', ['Prioritas', 'Prospek', 'Lanjutan', 'Pemula', 'Perlu Pembinaan'], { readonly: true }),
        sel('statusRecommendation', 'Status Rekomendasi (Naik / Tetap)', ['Naik', 'Tetap'], { required: true, default: 'Tetap' }),
        area('note', 'Catatan Pembinaan & Evaluasi SDM')
      ]
    },"""

    old_training_welfare = """    '#/personnel/training': { own: true,
      node: 'personnel/training', noun: 'Pelatihan & Kompetensi', writeRoles: [R.PERSONNEL, R.GURU, R.TENDIK], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Riwayat pelatihan, workshop, dan sertifikasi kompetensi pegawai GTK.',
      summary: [
        { label: 'Total Pelatihan', icon: 'ph-certificate', tone: 'primary' },
        { label: 'Total Jam', icon: 'ph-clock', tone: 'warning', sum: 'hours' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal', { required: true }),
        ref('employeeId', 'Pegawai', 'employee', { required: true }),
        t('title', 'Nama Pelatihan', { required: true }),
        t('organizer', 'Penyelenggara'),
        num('hours', 'Jam Pelajaran'),
        t('certificateNo', 'No. Sertifikat'),
        sel('status', 'Status', ['Direncanakan', 'Berjalan', 'Selesai'], { required: true }),
        file('certificateUrl', 'Berkas Sertifikat Pelatihan', 'personnel_certificates', { accept: '.pdf,image/*' })
      ]
    },
    '#/personnel/welfare': {
      node: 'personnel/welfare', noun: 'Kesejahteraan Staf', writeRoles: PE, dateField: 'date', statusField: 'status', badges,
      subtitle: 'Penetapan hak tunjangan sosial, apresiasi, santunan duka/sakit, dan persalinan pegawai.',
      summary: [
        { label: 'Total Catatan', icon: 'ph-heart', tone: 'primary' },
        { label: 'Total Nominal', icon: 'ph-wallet', tone: 'success', sum: 'amount', money: true },
        { label: 'Disetujui', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui Waka' } }
      ],
      fields: [
        date('date', 'Tanggal SK / Pengajuan', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        sel('type', 'Jenis Kesejahteraan', ['Santunan Sakit', 'Santunan Duka', 'Bantuan Persalinan', 'Apresiasi Prestasi', 'Tunjangan Hari Raya', 'Lainnya'], { required: true }),
        money('amount', 'Nominal Bantuan', { required: true }),
        sel('status', 'Status Persetujuan', ['Diajukan', 'Disetujui Waka', 'Dicairkan Keuangan', 'Ditolak'], { required: true }),
        file('document', 'Berkas Pendukung / Surat Dokter', 'welfare_docs'),
        area('note', 'Keterangan / Alasan')
      ],
      after: async (p, ctx, id) => {
        if (p.status === 'Dicairkan Keuangan' && p.amount > 0) {
          const empName = p.employeeIdName || p.employeeId || 'Pegawai';
          const ledgerRef = db.ref('finance/ledger').push();
          await ledgerRef.set({
            date: p.date || new Date().toISOString().slice(0, 10),
            type: 'expense',
            category: 'Honor',
            refNo: `WLF-${id ? id.slice(-6) : Date.now()}`,
            description: `Realisasi Kesejahteraan Pegawai: ${p.type || 'Tunjangan'} (${empName})`,
            amount: Number(p.amount) || 0,
            method: 'Transfer',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            sourceModule: 'personnel/welfare',
            sourceId: id
          });
        }
      }
    },"""

    new_training_welfare = """    '#/personnel/portfolio': { own: true,
      node: 'personnel/portfolio', noun: 'Portofolio & Kompetensi', writeRoles: [R.PERSONNEL, R.GURU, R.TENDIK], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Riwayat pelatihan, workshop, sertifikasi kompetensi, dan rekam jejak portofolio SDM.',
      summary: [
        { label: 'Total Portofolio', icon: 'ph-folder-star', tone: 'primary' },
        { label: 'Total Jam (JP)', icon: 'ph-clock', tone: 'warning', sum: 'hours' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal Perolehan / Kegiatan', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        sel('category', 'Kategori', ['Pelatihan & Workshop', 'Sertifikasi Profesi', 'Portofolio Prestasi', 'Karya Inovasi / Publikasi', 'Lainnya'], { required: true, default: 'Pelatihan & Workshop' }),
        t('title', 'Nama Pelatihan / Judul Portofolio', { required: true }),
        t('organizer', 'Lembaga Penyelenggara / Penerbit'),
        num('hours', 'Jumlah Jam (JP)'),
        t('certificateNo', 'Nomor Sertifikat / SK'),
        sel('status', 'Status', ['Direncanakan', 'Sedang Berjalan', 'Selesai'], { required: true, default: 'Selesai' }),
        file('document', 'Berkas Sertifikat / Portofolio', 'personnel_portfolio', { accept: '.pdf,image/*' }),
        area('description', 'Keterangan Capaian & Deskripsi')
      ]
    },
    '#/personnel/training': { own: true,
      node: 'personnel/portfolio', noun: 'Portofolio & Kompetensi', writeRoles: [R.PERSONNEL, R.GURU, R.TENDIK], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Riwayat pelatihan, workshop, sertifikasi kompetensi, dan rekam jejak portofolio SDM.',
      summary: [
        { label: 'Total Portofolio', icon: 'ph-folder-star', tone: 'primary' },
        { label: 'Total Jam (JP)', icon: 'ph-clock', tone: 'warning', sum: 'hours' },
        { label: 'Selesai', icon: 'ph-check-circle', tone: 'success', where: { status: 'Selesai' } }
      ],
      fields: [
        date('date', 'Tanggal Perolehan / Kegiatan', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        sel('category', 'Kategori', ['Pelatihan & Workshop', 'Sertifikasi Profesi', 'Portofolio Prestasi', 'Karya Inovasi / Publikasi', 'Lainnya'], { required: true, default: 'Pelatihan & Workshop' }),
        t('title', 'Nama Pelatihan / Judul Portofolio', { required: true }),
        t('organizer', 'Lembaga Penyelenggara / Penerbit'),
        num('hours', 'Jumlah Jam (JP)'),
        t('certificateNo', 'Nomor Sertifikat / SK'),
        sel('status', 'Status', ['Direncanakan', 'Sedang Berjalan', 'Selesai'], { required: true, default: 'Selesai' }),
        file('document', 'Berkas Sertifikat / Portofolio', 'personnel_portfolio', { accept: '.pdf,image/*' }),
        area('description', 'Keterangan Capaian & Deskripsi')
      ]
    },
    '#/finance/welfare': {
      node: 'finance/welfare', noun: 'Kesejahteraan Pegawai', writeRoles: [R.FINANCE, R.BENDAHARA, R.ADMIN], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Penetapan hak tunjangan sosial, apresiasi, santunan duka/sakit, dan persalinan pegawai oleh Keuangan.',
      summary: [
        { label: 'Total Catatan', icon: 'ph-heart', tone: 'primary' },
        { label: 'Total Nominal', icon: 'ph-wallet', tone: 'success', sum: 'amount', money: true },
        { label: 'Disetujui', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui Waka' } }
      ],
      fields: [
        date('date', 'Tanggal SK / Pengajuan', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        sel('type', 'Jenis Kesejahteraan', ['Santunan Sakit', 'Santunan Duka', 'Bantuan Persalinan', 'Apresiasi Prestasi', 'Tunjangan Hari Raya', 'Lainnya'], { required: true }),
        money('amount', 'Nominal Bantuan', { required: true }),
        sel('status', 'Status Persetujuan', ['Diajukan', 'Disetujui Waka', 'Dicairkan Keuangan', 'Ditolak'], { required: true }),
        file('document', 'Berkas Pendukung / Surat Dokter', 'welfare_docs'),
        area('note', 'Keterangan / Alasan')
      ],
      after: async (p, ctx, id) => {
        if (p.status === 'Dicairkan Keuangan' && p.amount > 0) {
          const empName = p.employeeIdName || p.employeeId || 'Pegawai';
          const ledgerRef = db.ref('finance/ledger').push();
          await ledgerRef.set({
            date: p.date || new Date().toISOString().slice(0, 10),
            type: 'expense',
            category: 'Honor',
            refNo: `WLF-${id ? id.slice(-6) : Date.now()}`,
            description: `Realisasi Kesejahteraan Pegawai: ${p.type || 'Tunjangan'} (${empName})`,
            amount: Number(p.amount) || 0,
            method: 'Transfer',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            sourceModule: 'finance/welfare',
            sourceId: id
          });
        }
      }
    },
    '#/personnel/welfare': {
      node: 'finance/welfare', noun: 'Kesejahteraan Pegawai', writeRoles: [R.FINANCE, R.BENDAHARA, R.ADMIN], dateField: 'date', statusField: 'status', badges,
      subtitle: 'Penetapan hak tunjangan sosial, apresiasi, santunan duka/sakit, dan persalinan pegawai oleh Keuangan.',
      summary: [
        { label: 'Total Catatan', icon: 'ph-heart', tone: 'primary' },
        { label: 'Total Nominal', icon: 'ph-wallet', tone: 'success', sum: 'amount', money: true },
        { label: 'Disetujui', icon: 'ph-check-circle', tone: 'success', where: { status: 'Disetujui Waka' } }
      ],
      fields: [
        date('date', 'Tanggal SK / Pengajuan', { required: true }),
        ref('employeeId', 'Pegawai GTK', 'employee', { required: true }),
        sel('type', 'Jenis Kesejahteraan', ['Santunan Sakit', 'Santunan Duka', 'Bantuan Persalinan', 'Apresiasi Prestasi', 'Tunjangan Hari Raya', 'Lainnya'], { required: true }),
        money('amount', 'Nominal Bantuan', { required: true }),
        sel('status', 'Status Persetujuan', ['Diajukan', 'Disetujui Waka', 'Dicairkan Keuangan', 'Ditolak'], { required: true }),
        file('document', 'Berkas Pendukung / Surat Dokter', 'welfare_docs'),
        area('note', 'Keterangan / Alasan')
      ]
    },"""

    c = c.replace(old_personnel_data, new_personnel_data)
    c = c.replace(old_evaluations, new_evaluations)
    c = c.replace(old_training_welfare, new_training_welfare)

    old_guru_port = """    '#/guru/portfolio': { own: true,
      node: 'guru/portfolio', noun: 'Portofolio Guru & Pembina', writeRoles: [R.GURU, R.GURU_EKSKUL, R.GURU_UMMI, R.TENDIK], dateField: 'date',
      subtitle: 'Dokumen pencapaian dan rekam jejak guru.',
      fields: [
        date('date', 'Tanggal', { required: true }),
        t('title', 'Judul / Kegiatan', { required: true }),
        file('document', 'Dokumen Pendukung', 'guru_portfolio', { required: true }),
        area('description', 'Keterangan Tambahan')
      ]
    },"""

    new_guru_port = """    '#/guru/portfolio': { own: true,
      node: 'guru/portfolio', noun: 'Portofolio & Rekam Jejak Guru', writeRoles: [R.GURU, R.GURU_EKSKUL, R.GURU_UMMI, R.TENDIK], dateField: 'date',
      subtitle: 'Dokumen pelatihan, sertifikasi kompetensi, workshop, dan rekam jejak guru/pembina.',
      fields: [
        date('date', 'Tanggal', { required: true }),
        sel('category', 'Kategori', ['Pelatihan & Workshop', 'Sertifikasi Profesi', 'Portofolio Prestasi', 'Karya Inovasi', 'Lainnya'], { required: true, default: 'Pelatihan & Workshop' }),
        t('title', 'Nama Pelatihan / Judul Portofolio', { required: true }),
        t('organizer', 'Lembaga Penyelenggara'),
        num('hours', 'Jumlah Jam (JP)'),
        t('certificateNo', 'Nomor Sertifikat / Dokumen'),
        file('document', 'Dokumen Pendukung', 'guru_portfolio', { required: true }),
        area('description', 'Keterangan Tambahan')
      ]
    },"""

    c = c.replace(old_guru_port, new_guru_port)

    # remove empty lines and comments
    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("module-defs.js updated successfully!")

def update_app_config():
    p = os.path.join(js_dir, 'app-config.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    # In GURU_UMUM: add salary slip
    c = c.replace(
        "{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Tugas Utama Guru' }",
        "{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Tugas Utama Guru' },\n      { hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Tugas Utama Guru' }"
    )

    # In TENDIK: add salary slip
    c = c.replace(
        "{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Tupoksi Tenaga Kependidikan' }",
        "{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Tupoksi Tenaga Kependidikan' },\n      { hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Tupoksi Tenaga Kependidikan' }"
    )

    # In GURU_UMMI: add salary slip
    c = c.replace(
        "{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Guru Ummi' }",
        "{ hash: '#/gtk/official-travel', icon: 'ph-airplane-takeoff', text: 'Perjalanan Dinas', group: 'Guru Ummi' },\n      { hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Guru Ummi' }"
    )

    # In GURU_EKSTRA: add salary slip
    c = c.replace(
        "{ hash: '#/guru/portfolio', icon: 'ph-folder', text: 'Portofolio Pembina', group: 'Guru Ekskul: Pengembangan' }",
        "{ hash: '#/guru/portfolio', icon: 'ph-folder', text: 'Portofolio Pembina', group: 'Guru Ekskul: Pengembangan' },\n      { hash: '#/gtk/salary-slip', icon: 'ph-receipt', text: 'Slip Gaji Pribadi', group: 'Guru Ekskul: Pengembangan' }"
    )

    # In WAKA_HUMAS_PERSONALIA:
    old_waka_humas = """    'WAKA_HUMAS_PERSONALIA': [
      { hash: '#/personnel', icon: 'ph-briefcase', text: 'Dashboard Humas & Personalia', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/admin/users', icon: 'ph-users', text: 'Kelola Pengguna', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/admin/assignments', icon: 'ph-clipboard-text', text: 'Distribusi Penugasan', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/personnel/data', icon: 'ph-folder-user', text: 'Data Kepegawaian', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/admin/attendance', icon: 'ph-clock', text: 'Pantau Disiplin Guru', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/evaluations', icon: 'ph-chart-line-up', text: 'Penilaian Kinerja (PKG)', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/training', icon: 'ph-certificate', text: 'Pelatihan & Kompetensi', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/welfare', icon: 'ph-heart', text: 'Kesejahteraan Staf', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/humas/official-travel', icon: 'ph-airplane-takeoff', text: 'Verifikasi Tugas Dinas', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/humas/official-travel', icon: 'ph-airplane-takeoff', text: 'Verifikasi Tugas Dinas', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },"""

    new_waka_humas = """    'WAKA_HUMAS_PERSONALIA': [
      { hash: '#/personnel', icon: 'ph-briefcase', text: 'Dashboard Humas & Personalia', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/admin/users', icon: 'ph-users', text: 'Kelola Pengguna', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/admin/assignments', icon: 'ph-clipboard-text', text: 'Distribusi Penugasan', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/personnel/data', icon: 'ph-folder-user', text: 'Data Kepegawaian', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/admin/attendance', icon: 'ph-clock', text: 'Pantau Disiplin Guru', group: 'Humas & Personalia: Kinerja & Portofolio' },
      { hash: '#/personnel/evaluations', icon: 'ph-chart-line-up', text: 'Penilaian Kinerja SDM', group: 'Humas & Personalia: Kinerja & Portofolio' },
      { hash: '#/personnel/portfolio', icon: 'ph-folder-star', text: 'Portofolio & Kompetensi', group: 'Humas & Personalia: Kinerja & Portofolio' },
      { hash: '#/humas/official-travel', icon: 'ph-airplane-takeoff', text: 'Verifikasi Tugas Dinas', group: 'Humas & Personalia: Kinerja & Portofolio' },"""

    c = c.replace(old_waka_humas, new_waka_humas)

    # In STAF_HUMAS_PERSONALIA:
    old_staf_humas = """    'STAF_HUMAS_PERSONALIA': [
      { hash: '#/personnel', icon: 'ph-briefcase', text: 'Dashboard Humas & Personalia', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/personnel/data', icon: 'ph-folder-user', text: 'Data Kepegawaian', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/personnel/training', icon: 'ph-certificate', text: 'Pelatihan & Kompetensi', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/personnel/welfare', icon: 'ph-heart', text: 'Kesejahteraan Staf', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/humas/official-travel', icon: 'ph-airplane-takeoff', text: 'Verifikasi Tugas Dinas', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },
      { hash: '#/humas/official-travel', icon: 'ph-airplane-takeoff', text: 'Verifikasi Tugas Dinas', group: 'Humas & Personalia: Kinerja & Kesejahteraan' },"""

    new_staf_humas = """    'STAF_HUMAS_PERSONALIA': [
      { hash: '#/personnel', icon: 'ph-briefcase', text: 'Dashboard Humas & Personalia', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/personnel/data', icon: 'ph-folder-user', text: 'Data Kepegawaian', group: 'Humas & Personalia: Administrasi SDM' },
      { hash: '#/personnel/portfolio', icon: 'ph-folder-star', text: 'Portofolio & Kompetensi', group: 'Humas & Personalia: Kinerja & Portofolio' },
      { hash: '#/humas/official-travel', icon: 'ph-airplane-takeoff', text: 'Verifikasi Tugas Dinas', group: 'Humas & Personalia: Kinerja & Portofolio' },"""

    c = c.replace(old_staf_humas, new_staf_humas)

    # In WAKA_KEUANGAN: add welfare & attendance payroll recap
    old_waka_keu = """    'WAKA_KEUANGAN': [
      { hash: '#/finance', icon: 'ph-wallet', text: 'Dashboard Keuangan', group: 'Keuangan: Umum' },
      { hash: '#/finance/rkas', icon: 'ph-chart-bar', text: 'Penyusunan RKAS', group: 'Keuangan: Perencanaan' },
      { hash: '#/finance/transactions', icon: 'ph-arrows-left-right', text: 'Penerimaan & Pengeluaran', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/cashbook', icon: 'ph-book-open', text: 'Buku Kas Umum (BKU)', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/bos', icon: 'ph-receipt', text: 'Laporan BOS', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/scholarships', icon: 'ph-hand-coins', text: 'Pencairan Beasiswa & SPP', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/student-bills', icon: 'ph-receipt', text: 'Tagihan & SPP Siswa', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/salaries', icon: 'ph-money', text: 'Penghitungan Gaji', group: 'Keuangan: Penggajian & Proposal' },
      { hash: '#/finance/proposals', icon: 'ph-file-text', text: 'Persetujuan Proposal', group: 'Keuangan: Penggajian & Proposal' },"""

    new_waka_keu = """    'WAKA_KEUANGAN': [
      { hash: '#/finance', icon: 'ph-wallet', text: 'Dashboard Keuangan', group: 'Keuangan: Umum' },
      { hash: '#/finance/rkas', icon: 'ph-chart-bar', text: 'Penyusunan RKAS', group: 'Keuangan: Perencanaan' },
      { hash: '#/finance/transactions', icon: 'ph-arrows-left-right', text: 'Penerimaan & Pengeluaran', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/cashbook', icon: 'ph-book-open', text: 'Buku Kas Umum (BKU)', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/bos', icon: 'ph-receipt', text: 'Laporan BOS', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/scholarships', icon: 'ph-hand-coins', text: 'Pencairan Beasiswa & SPP', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/student-bills', icon: 'ph-receipt', text: 'Tagihan & SPP Siswa', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/salaries', icon: 'ph-money', text: 'Penghitungan Gaji', group: 'Keuangan: Penggajian & Kesejahteraan' },
      { hash: '#/admin/attendance', icon: 'ph-clock', text: 'Rekap Presensi Penggajian (29-28)', group: 'Keuangan: Penggajian & Kesejahteraan' },
      { hash: '#/finance/welfare', icon: 'ph-heart', text: 'Kesejahteraan Pegawai', group: 'Keuangan: Penggajian & Kesejahteraan' },
      { hash: '#/finance/proposals', icon: 'ph-file-text', text: 'Persetujuan Proposal', group: 'Keuangan: Penggajian & Kesejahteraan' },"""

    c = c.replace(old_waka_keu, new_waka_keu)

    # In STAF_KEUANGAN: add welfare
    old_staf_keu = """    'STAF_KEUANGAN': [
      { hash: '#/finance', icon: 'ph-wallet', text: 'Dashboard Keuangan', group: 'Keuangan: Umum' },
      { hash: '#/finance/transactions', icon: 'ph-arrows-left-right', text: 'Penerimaan & Pengeluaran', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/cashbook', icon: 'ph-book-open', text: 'Buku Kas Umum (BKU)', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/bos', icon: 'ph-receipt', text: 'Laporan BOS', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/scholarships', icon: 'ph-hand-coins', text: 'Pencairan Beasiswa & SPP', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/student-bills', icon: 'ph-receipt', text: 'Tagihan & SPP Siswa', group: 'Keuangan: BOS & Beasiswa' },"""

    new_staf_keu = """    'STAF_KEUANGAN': [
      { hash: '#/finance', icon: 'ph-wallet', text: 'Dashboard Keuangan', group: 'Keuangan: Umum' },
      { hash: '#/finance/transactions', icon: 'ph-arrows-left-right', text: 'Penerimaan & Pengeluaran', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/cashbook', icon: 'ph-book-open', text: 'Buku Kas Umum (BKU)', group: 'Keuangan: Pembukuan' },
      { hash: '#/finance/bos', icon: 'ph-receipt', text: 'Laporan BOS', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/scholarships', icon: 'ph-hand-coins', text: 'Pencairan Beasiswa & SPP', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/student-bills', icon: 'ph-receipt', text: 'Tagihan & SPP Siswa', group: 'Keuangan: BOS & Beasiswa' },
      { hash: '#/finance/welfare', icon: 'ph-heart', text: 'Kesejahteraan Pegawai', group: 'Keuangan: BOS & Beasiswa' },"""

    c = c.replace(old_staf_keu, new_staf_keu)

    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("app-config.js updated successfully!")

def update_feature_guides():
    p = os.path.join(js_dir, 'feature-guides.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    c = c.replace(
        "func: 'Buku induk profil kepegawaian resmi GTK (NIP, NUPTK, status kepegawaian, riwayat pendidikan, dan nomor kontak).'",
        "func: 'Buku induk profil kepegawaian resmi GTK (NBM, NUPTK, status kepegawaian, riwayat pendidikan, dan nomor kontak).'"
    )
    c = c.replace(
        "func: 'Monitoring rekapitulasi kehadiran realtime seluruh guru dan karyawan sekolah.'",
        "func: 'Monitoring rekapitulasi kehadiran GTK realtime dan rekapitulasi presensi bahan penggajian bulanan (periode cutoff 29 s/d 28).'"
    )
    c = c.replace(
        "func: 'Penilaian Kinerja Guru (PKG) tahunan dengan rubrik 3 pilar: Pedagogik, Kepribadian, dan Profesional.'",
        "func: 'Penilaian Kinerja SDM Majelis Dikdasmen & PNF PCM Sedati dengan rubrik 3 pilar: Loyalitas (4 item), Kapasitas (8 item), dan Kapabilitas (Jobdesk/SOP).'"
    )
    c = c.replace(
        "'#/personnel/training': {",
        "'#/personnel/portfolio': {"
    )

    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("feature-guides.js updated successfully!")

def update_app():
    p = os.path.join(js_dir, 'app.js')
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    # In guruAllowed:
    if "'#/gtk/salary-slip'" not in c:
        c = c.replace(
            "'#/guru/academic',",
            "'#/guru/academic',\n        '#/gtk/salary-slip',\n        '#/gtk/official-travel',"
        )

    # In tendikAllowed:
    if "'#/gtk/salary-slip'" not in c:
        c = c.replace(
            "const tendikAllowed = ['#/attendance', '#/tendik/performance', '#/tendik/portfolio'];",
            "const tendikAllowed = ['#/attendance', '#/tendik/performance', '#/tendik/portfolio', '#/gtk/salary-slip', '#/gtk/official-travel'];"
        )

    # In renderers:
    if "'#/gtk/salary-slip':" not in c:
        c = c.replace(
            "'#/attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderTeacherAttendance : null,",
            "'#/gtk/salary-slip': typeof GuruPages !== 'undefined' ? GuruPages.renderSalarySlip : null,\n          '#/attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderTeacherAttendance : null,"
        )

    # Redirect training to portfolio
    if "if (path === '#/personnel/training')" not in c:
        c = c.replace(
            "if (path.startsWith('#/guru/classes/')) path = '#/guru/classes';",
            "if (path.startsWith('#/guru/classes/')) path = '#/guru/classes';\n    if (path === '#/personnel/training') path = '#/personnel/portfolio';\n    if (path === '#/personnel/welfare') path = '#/finance/welfare';"
        )

    lines = [l for l in c.splitlines() if l.strip()]
    cleaned = '\n'.join(lines) + '\n'
    with open(p, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print("app.js updated successfully!")

if __name__ == '__main__':
    update_db()
    update_module_defs()
    update_app_config()
    update_feature_guides()
    update_app()
