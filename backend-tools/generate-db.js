const fs = require('fs');

const siswaTsv = fs.readFileSync('./data/data-siswa.tsv', 'utf-8');
const guruTsv = fs.readFileSync('./data/data-guru.tsv', 'utf-8');

const rtdb = {
  users: {},
  classes: {},
  students: {},
  subjects: {},
  academicYears: {},
  semesters: {},
  rooms: {},
  assets: {},
  settings: {
    schoolName: "SD Muhammadiyah 1 Sedati",
    academicYear: "2026/2027",
    semester: "Ganjil"
  }
};

// 1. Process Siswa
let currentClass = "";
const linesSiswa = siswaTsv.split('\n').map(l => l.trim());
let isParsingStudents = false;

for (let i = 0; i < linesSiswa.length; i++) {
  const line = linesSiswa[i];
  if (line.startsWith('NO\tNO INDUK\tNISN') || line.startsWith('NO\tNO INDUK\tNISN')) {
    isParsingStudents = true;
    continue;
  }
  
  if (isParsingStudents && line) {
    const cols = line.split('\t');
    if (cols.length >= 4) {
      const no = cols[0];
      const noInduk = cols[1];
      const nisn = cols[2];
      const nama = cols[3];
      const kelas = cols[4] || currentClass;
      
      if (kelas) currentClass = kelas;
      
      if (!nama || nama.toLowerCase() === 'nama' || !no.match(/^\d+$/)) continue; // skip headers
      
      const cleanNisn = nisn ? nisn.replace(/\s+/g, '') : (noInduk || Date.now());
      const uid = `SISWA_${cleanNisn}`;
      
      let classId = 'CLASS_' + currentClass.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      classId = classId.replace(/_+/g, '_');

      // Save to users (Ortu account for this student)
      rtdb.users[uid] = {
        name: nama, // Temporarily using student's name as Ortu name
        role: 'ortu',
        isActive: true,
        createdAt: Date.now()
      };
      
      // Save to students collection (The actual students DB)
      rtdb.students[uid] = {
        name: nama,
        nis: noInduk || '',
        nisn: nisn || '',
        classId: classId,
        parentId: uid,
        isActive: true
      };
      
      // Save to master/classes
      if (!rtdb.classes[classId]) {
        rtdb.classes[classId] = {
          name: currentClass,
          students: {}
        };
      }
      rtdb.classes[classId].students[uid] = true;
    }
  }
}

// 2. Process Guru & Employees
const guruLines = guruTsv.split('\n').map(l => l.trim());
let currentTable = null;

for (let i = 0; i < guruLines.length; i++) {
  const line = guruLines[i];
  if (!line) continue;
  
  if (line.startsWith('No\tNama\tJabatan\tTugas Mengajar') || line.startsWith('No Nama Jabatan Tugas Mengajar')) {
    currentTable = 'MENGAJAR'; continue;
  } else if (line.startsWith('No\tNama\tJabatan\tTugas Tambahan') || line.startsWith('No Nama Jabatan Tugas Tambahan')) {
    currentTable = 'TAMBAHAN'; continue;
  } else if (line.startsWith('No\tNama\tJabatan\tTugas') || line.startsWith('No Nama Jabatan Tugas')) {
    currentTable = 'TENDIK'; continue;
  } else if (line.startsWith('No\tNama\tJabatan') || line.startsWith('No Nama Jabatan')) {
    currentTable = 'UMMI'; continue;
  }

  let cols = line.split('\t');
  if (cols.length < 3) continue; // skip invalid lines
  
  let name = cols[1]?.trim();
  let jabatan = cols[2]?.trim() || '';
  let tugas = cols[3]?.trim() || '';
  
  if (!name || name === 'Nama Jabatan Tugas Mengajar' || name === 'Nama Jabatan Tugas Tambahan') continue;
  
  const baseName = name.split(',')[0].trim();
  const uid = 'GURU_' + baseName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  
  if (!rtdb.users[uid]) {
    rtdb.users[uid] = {
      name: name,
      role: jabatan === 'Tenaga Kependidikan' ? 'personnel' : (jabatan === 'Kepala Sekolah' ? 'kepsek' : 'guru'),
      jabatan: jabatan,
      assignments: [],
      isActive: true,
      createdAt: Date.now()
    };
  }
  
  const user = rtdb.users[uid];
  
  const tugasList = tugas.split(',').map(t => t.trim());
  for (const t of tugasList) {
    if (!t) continue;
    
    let assignmentCode = '';
    
    if (t.includes('Guru Kelas')) {
      let className = t.replace(/Guru Kelas/g, '').trim();
      assignmentCode = 'GURU_KELAS_' + className.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      const classId = 'CLASS_' + className.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      const cleanClassId = classId.replace(/_+/g, '_');
      assignmentCode = assignmentCode.replace(/_+/g, '_');
      
      if (!rtdb.classes[cleanClassId]) {
        rtdb.classes[cleanClassId] = { name: className, students: {} };
      }
      rtdb.classes[cleanClassId].teacherId = uid;
    } else if (t.includes('Guru PAI')) {
      assignmentCode = 'GURU_MAPEL_PAI';
    } else if (t.includes('Guru TIK')) {
      assignmentCode = 'GURU_MAPEL_TIK';
    } else if (t.includes('Bahasa Inggris') && t.includes('Guru')) {
      assignmentCode = 'GURU_MAPEL_B_INGGRIS';
    } else if (t.includes('Seni Budaya')) {
      assignmentCode = 'GURU_MAPEL_SENI';
    } else if (t.includes('PJOK')) {
      assignmentCode = 'GURU_MAPEL_PJOK';
    } else if (t.includes('Hizbul Wathan')) {
      assignmentCode = 'GURU_EKSTRA_HW';
    } else if (t.includes('Tapak Suci')) {
      assignmentCode = 'GURU_EKSTRA_TS';
    } else if (t.includes('Keuangan')) {
      assignmentCode = 'WAKA_KEUANGAN';
    } else if (t.includes('Kesiswaan')) {
      assignmentCode = 'WAKA_KESISWAAN';
    } else if (t.includes('Humas')) {
      assignmentCode = 'WAKA_HUMAS';
    } else if (t.includes('Sarana')) {
      assignmentCode = 'WAKA_SARPRAS';
    } else if (t.includes('Kurikulum')) {
      assignmentCode = 'WAKA_KURIKULUM';
    } else if (t.includes('IT')) {
      assignmentCode = 'TIM_IT';
    } else if (t.includes('UMMI') && t.includes('Tim')) {
      assignmentCode = 'TIM_UMMI';
    } else if (t.includes('Bahasa Inggris') && t.includes('Tim')) {
      assignmentCode = 'TIM_B_INGGRIS';
    } else if (t.includes('UMMI') && t.includes('Guru')) {
      assignmentCode = 'GURU_UMMI';
    } else if (t.includes('Perpustakaan')) {
      assignmentCode = 'STAFF_PERPUSTAKAAN';
    } else if (t.includes('Kebersihan')) {
      assignmentCode = 'STAFF_KEBERSIHAN';
    } else if (t.includes('Pengemudi')) {
      assignmentCode = 'STAFF_PENGEMUDI';
    } else if (t.includes('Koperasi')) {
      assignmentCode = 'STAFF_KOPERASI';
    } else if (t.includes('Pertamanan')) {
      assignmentCode = 'STAFF_PERTAMANAN';
    } else if (t.includes('Keamanan')) {
      assignmentCode = 'STAFF_KEAMANAN';
    }
    
    // Elevate Role if necessary
    if (t.includes('Wakil Kepala')) {
       user.role = 'admin';
    } else if (t.includes('Staff Bidang Keuangan')) {
       user.role = 'finance';
    } else if (t.includes('Staff Bidang Kesiswaan')) {
       user.role = 'studentAffairs';
    } else if (t.includes('Staff Bidang Humas dan Personalia')) {
       user.role = 'personnel';
    } else if (t.includes('Staff Bidang Sarana Prasarana')) {
       user.role = 'facilities';
    } else if (t.includes('Staff Bidang Kurikulum')) {
       user.role = 'curriculum';
    }
    
    if (assignmentCode && !user.assignments.includes(assignmentCode)) {
      user.assignments.push(assignmentCode);
    }
  }
}

fs.writeFileSync('./data/musada-sd-default-rtdb-export.json', JSON.stringify(rtdb, null, 2));
console.log('Successfully generated ./data/musada-sd-default-rtdb-export.json, Teachers:', Object.values(rtdb.users).filter(u => u.role !== 'ortu').length, 'Students:', Object.values(rtdb.users).filter(u => u.role === 'ortu').length);
