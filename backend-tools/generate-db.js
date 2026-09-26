const fs = require('fs');

const siswaTsv = fs.readFileSync('./data/data-siswa.tsv', 'utf-8');
const guruTsv = fs.readFileSync('./data/data-guru.tsv', 'utf-8');

const rtdb = {
  users: {},
  master: {
    classes: {},
    subjects: {},
    academicYears: {},
    semesters: {},
    rooms: {},
    assets: {}
  },
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
      
      const cleanNisn = nisn ? nisn.replace(/\s+/g, '') : `TEMP_${noInduk || Date.now()}`;
      const uid = `SISWA_${cleanNisn}`;
      
      const classId = 'CLASS_' + currentClass.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      
      // Save to users (acting as both Auth profile and Student Master Data for SSOT)
      rtdb.users[uid] = {
        name: nama,
        role: 'ortu',
        nisn: nisn || '',
        no_induk: noInduk || '',
        classId: classId,
        isActive: true,
        createdAt: Date.now()
      };
      
      // Save to master/classes
      if (!rtdb.master.classes[classId]) {
        rtdb.master.classes[classId] = {
          name: currentClass,
          students: {}
        };
      }
      rtdb.master.classes[classId].students[uid] = true;
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
  if (cols.length === 1) {
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (!match) continue;
    const no = match[1];
    let rest = match[2];
    cols = [no, rest];
  }

  const parseEmployeeLine = (restStr) => {
    let name = "";
    let jabatan = "";
    let tugas = "";
    
    if (restStr.includes(" Guru Kelas ")) {
      const parts = restStr.split(" Guru Kelas ");
      name = parts[0];
      jabatan = "Guru Kelas";
      tugas = "Guru Kelas " + (parts[1] || "");
    } else if (restStr.includes(" Guru ")) {
      const parts = restStr.split(" Guru ");
      name = parts[0];
      jabatan = "Guru";
      tugas = parts[1] || "";
    } else if (restStr.includes(" Tenaga Kependidikan ")) {
      const parts = restStr.split(" Tenaga Kependidikan ");
      name = parts[0];
      jabatan = "Tenaga Kependidikan";
      tugas = parts[1] || "";
    } else {
      name = restStr; // Fallback
    }
    
    return { name, jabatan, tugas };
  };

  const { name, jabatan, tugas } = parseEmployeeLine(cols[1] || cols.slice(1).join(' '));
  
  if (!name || name === 'Nama Jabatan Tugas Mengajar' || name === 'Nama Jabatan Tugas Tambahan') continue;
  
  const uid = 'GURU_' + name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  
  if (!rtdb.users[uid]) {
    rtdb.users[uid] = {
      name: name,
      role: jabatan === 'Tenaga Kependidikan' ? 'personnel' : 'guru',
      jabatan: jabatan,
      assignments: [],
      isActive: true,
      createdAt: Date.now()
    };
  }
  
  const user = rtdb.users[uid];
  let assignmentCode = '';
  
  if (currentTable === 'MENGAJAR') {
    if (tugas.includes('Guru Kelas')) {
      const className = tugas.replace('Guru Kelas', '').trim();
      assignmentCode = 'GURU_KELAS_' + className.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      
      const classId = 'CLASS_' + className.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      if (!rtdb.master.classes[classId]) {
        rtdb.master.classes[classId] = { name: className, students: {} };
      }
      rtdb.master.classes[classId].teacherId = uid;
    } else if (tugas.includes('Guru PAI')) {
      assignmentCode = 'GURU_MAPEL_PAI';
    } else if (tugas.includes('Guru TIK')) {
      assignmentCode = 'GURU_MAPEL_TIK';
    } else if (tugas.includes('Bahasa Inggris')) {
      assignmentCode = 'GURU_MAPEL_B_INGGRIS';
    } else if (tugas.includes('Seni Budaya')) {
      assignmentCode = 'GURU_MAPEL_SENI';
    } else if (tugas.includes('PJOK')) {
      assignmentCode = 'GURU_MAPEL_PJOK';
    } else if (tugas.includes('Hizbul Wathan')) {
      assignmentCode = 'GURU_EKSTRA_HW';
    } else if (tugas.includes('Tapak Suci')) {
      assignmentCode = 'GURU_EKSTRA_TS';
    }
  } else if (currentTable === 'TAMBAHAN') {
    if (tugas.includes('Keuangan')) assignmentCode = 'WAKA_KEUANGAN';
    else if (tugas.includes('Kesiswaan')) assignmentCode = 'WAKA_KESISWAAN';
    else if (tugas.includes('Humas')) assignmentCode = 'WAKA_HUMAS';
    else if (tugas.includes('Sarana')) assignmentCode = 'WAKA_SARPRAS';
    else if (tugas.includes('Kurikulum')) assignmentCode = 'WAKA_KURIKULUM';
    else if (tugas.includes('IT')) assignmentCode = 'TIM_IT';
    else if (tugas.includes('UMMI')) assignmentCode = 'TIM_UMMI';
    else if (tugas.includes('Bahasa Inggris')) assignmentCode = 'TIM_B_INGGRIS';
    
    if (tugas.includes('Wakil Kepala')) {
       user.role = 'admin';
    } else if (tugas.includes('Staff Bidang Keuangan')) {
       user.role = 'finance';
    } else if (tugas.includes('Staff Bidang Kesiswaan')) {
       user.role = 'studentAffairs';
    } else if (tugas.includes('Staff Bidang Humas dan Personalia')) {
       user.role = 'personnel';
    } else if (tugas.includes('Staff Bidang Sarana Prasarana')) {
       user.role = 'facilities';
    } else if (tugas.includes('Staff Bidang Kurikulum')) {
       user.role = 'curriculum';
    }
  } else if (currentTable === 'TENDIK') {
    if (tugas.includes('Perpustakaan')) assignmentCode = 'STAFF_PERPUSTAKAAN';
    else if (tugas.includes('Kebersihan')) assignmentCode = 'STAFF_KEBERSIHAN';
    else if (tugas.includes('Pengemudi')) assignmentCode = 'STAFF_PENGEMUDI';
    else if (tugas.includes('Koperasi')) assignmentCode = 'STAFF_KOPERASI';
    else if (tugas.includes('Pertamanan')) assignmentCode = 'STAFF_PERTAMANAN';
    else if (tugas.includes('Keamanan')) assignmentCode = 'STAFF_KEAMANAN';
  } else if (currentTable === 'UMMI') {
    assignmentCode = 'GURU_UMMI';
  }
  
  if (assignmentCode && !user.assignments.includes(assignmentCode)) {
    user.assignments.push(assignmentCode);
  }
}

fs.writeFileSync('./data/musada-sd-default-rtdb-export.json', JSON.stringify(rtdb, null, 2));
console.log('Successfully generated ./data/musada-sd-default-rtdb-export.json, Teachers:', Object.values(rtdb.users).filter(u => u.role !== 'ortu').length, 'Students:', Object.values(rtdb.users).filter(u => u.role === 'ortu').length);
