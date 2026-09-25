import os

BASE_DIR = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\login"
db_path = os.path.join(BASE_DIR, 'public/assets/js/db.js')

with open(db_path, 'r', encoding='utf-8') as f:
    content = f.read()

missing_methods = """
  async getStudentReferenceIndex() {
    const students = await this.getAllStudents();
    const index = {};
    for (const key in students) {
      index[key] = { name: students[key].name, nis: students[key].nis };
    }
    return index;
  },
  async getPersonnelDirectory() {
    return this._readCollection('personnel/directory', {});
  },
  async getFacilityAssets() {
    return this._readCollection('facilities/assets', {});
  },
  async getFacilityRooms() {
    return this._readCollection('facilities/rooms', {});
  },
  async getFacilityMaintenance() {
    return this._readCollection('facilities/maintenance', {});
  }
};
"""

# Replace the last `};` before `Object.assign(DB, {`
if 'async markStudentBillPaid(id) {' in content:
    # Find the closing brace of markStudentBillPaid
    # We will just replace the `};\n\nObject.assign(DB, {` block
    idx = content.rfind('};\n\nObject.assign(DB, {')
    if idx != -1:
        new_content = content[:idx] + ',\n' + missing_methods + '\nObject.assign(DB, {' + content[idx + 22:]
        with open(db_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully added missing DB methods.")
    else:
        # try another approach
        content = content.replace('};\nObject.assign(DB, {', ',\n' + missing_methods + '\nObject.assign(DB, {')
        with open(db_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully added missing DB methods (fallback).")
else:
    print("Could not find insertion point.")
