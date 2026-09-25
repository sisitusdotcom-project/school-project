(function () {
  const RTDB_SCHEMA = Object.freeze({
    master: {
      label: 'Master data sekolah',
      collections: {
        students: 'master/students',
        employees: 'master/employees',
        classes: 'master/classes',
        subjects: 'master/subjects',
        academicYears: 'master/academicYears',
        semesters: 'master/semesters',
        rooms: 'master/rooms',
        assets: 'master/assets'
      }
    },
    finance: {
      label: 'Keuangan',
      collections: {
        invoices: 'finance/invoices',
        payments: 'finance/payments',
        studentBills: 'finance/student_bills',
        budgets: 'finance/budgets',
        ledger: 'finance/ledger'
      }
    },
    curriculum: {
      label: 'Kurikulum',
      collections: {
        schedules: 'curriculum/schedules',
        learningPlans: 'curriculum/learningPlans',
        teachingAssignments: 'curriculum/teachingAssignments',
        reports: 'curriculum/reports'
      }
    },
    studentAffairs: {
      label: 'Kesiswaan',
      collections: {
        attendance: 'student_affairs/attendance',
        violations: 'student_affairs/violations',
        achievements: 'student_affairs/achievements',
        extracurriculars: 'student_affairs/extracurriculars',
        alumni: 'student_affairs/alumni',
        reports: 'student_affairs/reports'
      }
    },
    personnel: {
      label: 'Personalia & Humas',
      collections: {
        attendance: 'personnel/attendance',
        leaveRequests: 'personnel/leaveRequests',
        duties: 'personnel/duties',
        announcements: 'personnel/announcements',
        documents: 'personnel/documents'
      }
    },
    facilities: {
      label: 'Sarana & Prasarana',
      collections: {
        maintenance: 'facilities/maintenance',
        loans: 'facilities/loans',
        stocktakes: 'facilities/stocktakes',
        reports: 'facilities/reports'
      }
    }
  });

  window.SCHOOL_RTDB_SCHEMA = Object.freeze(RTDB_SCHEMA);
})();
