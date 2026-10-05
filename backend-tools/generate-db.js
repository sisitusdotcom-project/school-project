const fs = require('fs');

const siswaTsv = fs.readFileSync('./data/data-siswa.tsv', 'utf-8');
const guruTsv = fs.readFileSync('./data/data-guru.tsv', 'utf-8');

const rtdb = {
  users: {},
  classes: {},
  students: {},
  subjects: {
    'SUB_AQIDAH_AKHLAQ': {'name': 'Aqidah Akhlaq', 'order': 1, 'category': 'agama'},
    'SUB_FIQIH': {'name': 'Ibadah Syari\'ah/Fiqih', 'order': 2, 'category': 'agama'},
    'SUB_ALQURAN_HADITS': {'name': 'Al Qur\'an Hadits', 'order': 3, 'category': 'agama'},
    'SUB_TARIKH_ISLAM': {'name': 'Tarikh Islam', 'order': 4, 'category': 'agama'},
    'SUB_PKN': {'name': 'Pendidikan Kewarganegaraan', 'order': 5, 'category': 'standar'},
    'SUB_B_INDO': {'name': 'Bahasa Indonesia', 'order': 6, 'category': 'standar'},
    'SUB_MTK': {'name': 'Matematika', 'order': 7, 'category': 'standar'},
    'SUB_SAINS': {'name': 'Sains', 'order': 8, 'category': 'standar'},
    'SUB_IPS': {'name': 'Ilmu Pengetahuan Sosial', 'order': 9, 'category': 'standar'},
    'SUB_SBK': {'name': 'Seni Budaya dan Keterampilan', 'order': 10, 'category': 'standar'},
    'SUB_PJOK': {'name': 'Pendidikan Jasmani, Olahraga & Kesehatan', 'order': 11, 'category': 'standar'},
    'SUB_BTQ': {'name': 'Baca Tulis Qur\'an (BTQ)', 'order': 12, 'category': 'lokal'},
    'SUB_B_DAERAH': {'name': 'Bahasa Daerah', 'order': 13, 'category': 'lokal'},
    'SUB_B_INGGRIS': {'name': 'Bahasa Inggris', 'order': 14, 'category': 'lokal'},
    'SUB_TIK': {'name': 'TIK', 'order': 15, 'category': 'lokal'},
    'SUB_KEMUHAMMADIYAHAN': {'name': 'Kemuhammadiyahan', 'order': 16, 'category': 'kekhasan'},
    'SUB_B_ARAB': {'name': 'Bahasa Arab', 'order': 17, 'category': 'kekhasan'}
  },

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
      const gender = cols[5]?.trim() || '';
      
      if (kelas) currentClass = kelas;
      
      if (!nama || nama.toLowerCase() === 'nama' || !no.match(/^\d+$/)) continue; // skip headers
      
      const cleanNisn = nisn ? nisn.replace(/\s+/g, '') : (noInduk || (Date.now() + '_' + no));
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
        gender: gender,
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

for (let i = 0; i < guruLines.length; i++) {
  const line = guruLines[i];
  if (!line || line.startsWith('No\tNama')) continue;

  let cols = line.split('\t');
  if (cols.length < 4) continue; // skip invalid lines
  
  let name = cols[1]?.trim();
  let jabatan = cols[2]?.trim() || '';
  let gender = cols[3]?.trim() || '';
  let tugasMengajar = cols[4]?.trim() || '';
  let tugasTambahan = cols[5]?.trim() || '';
  
  if (!name || name.toLowerCase() === 'nama') continue;
  
  const baseName = name.split(',')[0].trim();
  const uid = 'GURU_' + baseName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  
  if (!rtdb.users[uid]) {
    rtdb.users[uid] = {
      name: name,
      role: jabatan === 'Tenaga Kependidikan' ? 'personnel' : (jabatan === 'Kepala Sekolah' ? 'kepsek' : 'guru'),
      jabatan: jabatan,
      gender: gender,
      assignments: [],
      isActive: true,
      createdAt: Date.now()
    };
  }
  
  const user = rtdb.users[uid];
  
  let combinedTugas = (tugasMengajar + ',' + tugasTambahan).replace(/-/g, '');
  const tugasList = combinedTugas.split(',').map(t => t.trim());
  for (const t of tugasList) {
    if (!t) continue;
    
    let assignmentCode = t;
    
    if (t.startsWith('GURU_KELAS_')) {
      const className = t.replace('GURU_KELAS_', '').replace(/_/g, ' ');
      const classId = 'CLASS_' + t.replace('GURU_KELAS_', '');
      
      if (!rtdb.classes[classId]) {
        rtdb.classes[classId] = { name: className, students: {} };
      }
      rtdb.classes[classId].teacherId = uid;
    }
    
    // Elevate Role if necessary based on code
    if (t.startsWith('WAKA_')) {
       user.role = 'admin';
    } else if (t === 'TIM_IT') {
       user.role = 'it_admin';
    }
    
    if (assignmentCode && !user.assignments.includes(assignmentCode)) {
      user.assignments.push(assignmentCode);
    }
  }
}

fs.writeFileSync('./data/musada-sd-default-rtdb-export.json', JSON.stringify(rtdb, null, 2));
console.log('Successfully generated ./data/musada-sd-default-rtdb-export.json, Teachers:', Object.values(rtdb.users).filter(u => u.role !== 'ortu').length, 'Students:', Object.values(rtdb.users).filter(u => u.role === 'ortu').length);
