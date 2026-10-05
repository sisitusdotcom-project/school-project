import re

with open('e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove getManagementPermissionKey and getManagementRouteConfig
content = re.sub(r'  getManagementPermissionKey.*?},\n\n  getManagementRouteConfig\(\) \{.*?\n  },\n\n' , '', content, flags=re.DOTALL)

# 2. Refactor isRouteAllowed
new_is_route_allowed = '''  isRouteAllowed(path, role = Auth.currentRole) {
    if (!role) return false;
    if (path === '#/dashboard') return !!this.getDashboardRenderer();
    
    // Some static paths that any user with the correct base module can access
    if (path.startsWith('#/admin/students/')) path = '#/admin/classes';
    if (path.startsWith('#/guru/assess/')) path = '#/guru/classes';
    if (path.startsWith('#/guru/observe/')) path = '#/guru/classes';
    if (path.startsWith('#/guru/student-attendance/')) path = '#/guru/student-attendance';
    if (path.startsWith('#/guru/classes/')) path = '#/guru/classes';
    
    const assignments = Auth.currentAssignments || [];
    const navItems = AppConfig.getRoleNav(role, assignments);
    
    return navItems.some(nav => nav.hash === path);
  },'''
content = re.sub(r'  isManagementRouteAllowed.*?\n  },\n\n  isRouteAllowed\(path, role = Auth.currentRole\) \{.*?  },\n' , new_is_route_allowed + '\n', content, flags=re.DOTALL)

# 3. Refactor Router.add part in init()
# Find the start of registerProtectedRoute
start_idx = content.find('    const registerProtectedRoute =')
# Find the end of roleRoutes loop
end_idx = content.find('    Auth.init();')

if start_idx != -1 and end_idx != -1:
    new_routing = '''    const allRoutes = new Set();
    Object.values(AppConfig.NAV_ITEMS).forEach(items => {
      items.forEach(item => {
        allRoutes.add(item.hash);
      });
    });
    
    // Add dynamic routes manually
    ['#/admin/students/:id', '#/guru/assess/:id', '#/guru/observe/:id', '#/guru/student-attendance/:id'].forEach(r => allRoutes.add(r));

    // Register all routes
    allRoutes.forEach(path => {
      Router.add(path, async (container, routeParams) => {
        const role = Auth.currentRole || AppConfig.ROLES.ADMIN;
        const hasAccess = this.isRouteAllowed(path, role);

        if (!hasAccess) {
          container.innerHTML = `
            <div class="card">
              <div class="card-body">
                <h2 class="card-title"><i class="ph ph-lock"></i> Akses Ditolak</h2>
                <p class="text-muted">Anda belum memiliki akses untuk melihat modul ini.</p>
              </div>
            </div>
          `;
          return;
        }

        if (typeof ModuleKit !== 'undefined' && ModuleKit.has(path)) {
          const config = ModuleKit.get(path);
          await ModuleKit.render(container, path, config.noun || 'Modul', config.icon || 'ph-cube');
          return;
        }

        // Custom renderers
        const renderers = {
          '#/admin/assignments': window.AdminAssignmentsModule?.render,
          '#/admin/users': typeof AdminPages !== 'undefined' ? AdminPages.renderUsers : null,
          '#/admin/classes': typeof AdminPages !== 'undefined' ? AdminPages.renderClasses : null,
          '#/admin/students/:id': typeof AdminPages !== 'undefined' ? AdminPages.renderStudents : null,
          '#/admin/subjects': typeof AdminPages !== 'undefined' ? AdminPages.renderSubjects : null,
          '#/admin/characters': typeof AdminPages !== 'undefined' ? AdminPages.renderCharacters : null,
          '#/admin/extracurriculars': typeof AdminPages !== 'undefined' ? AdminPages.renderExtracurriculars : null,
          '#/admin/attendance': typeof AdminPages !== 'undefined' ? AdminPages.renderAttendance : null,
          '#/guru/attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderTeacherAttendance : null,
          '#/guru/student-attendance': typeof GuruPages !== 'undefined' ? GuruPages.renderStudentAttendance : null,
          '#/guru/classes': typeof GuruPages !== 'undefined' ? GuruPages.renderClasses : null,
          '#/guru/academic': typeof GuruPages !== 'undefined' ? GuruPages.renderAcademicGrades : null,
          '#/guru/additional': typeof GuruPages !== 'undefined' ? GuruPages.renderAdditionalData : null,
          '#/guru/observations': typeof GuruPages !== 'undefined' ? GuruPages.renderObservationHistory : null,
          '#/guru/assess/:id': typeof GuruPages !== 'undefined' ? GuruPages.renderAssessment : null,
          '#/guru/observe/:id': typeof GuruPages !== 'undefined' ? GuruPages.renderObserveClass : null,
          '#/guru/student-attendance/:id': typeof GuruPages !== 'undefined' ? GuruPages.renderStudentAttendanceInput : null,
          '#/kepsek/reports': typeof KepsekPages !== 'undefined' ? KepsekPages.renderReports : null,
          '#/ortu/dashboard': typeof OrtuPages !== 'undefined' ? OrtuPages.renderDashboard : null,
          '#/finance': typeof FinancePages !== 'undefined' ? FinancePages.renderDashboard : null,
          '#/curriculum': typeof CurriculumPages !== 'undefined' ? CurriculumPages.renderDashboard : null,
          '#/student-affairs': typeof StudentAffairsPages !== 'undefined' ? StudentAffairsPages.renderDashboard : null,
          '#/personnel': typeof PersonnelPages !== 'undefined' ? PersonnelPages.renderDashboard : null,
          '#/facilities': typeof FacilitiesPages !== 'undefined' ? FacilitiesPages.renderDashboard : null,
          '#/it-admin/dashboard': typeof ITAdminPages !== 'undefined' ? ITAdminPages.renderDashboard : null
        };

        if (renderers[path]) {
          await renderers[path](container, routeParams);
          return;
        }

        container.innerHTML = `
          <div class="card section-block">
            <div class="card-body">
              <h3 class="card-title"><i class="ph ph-hammer"></i> Modul Tahap Pengembangan</h3>
              <p class="text-muted">Modul ini sedang disiapkan dan akan segera hadir.</p>
            </div>
          </div>
        `;
      });
    });\n\n'''
    content = content[:start_idx] + new_routing + content[end_idx:]

with open('e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/public/assets/js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
