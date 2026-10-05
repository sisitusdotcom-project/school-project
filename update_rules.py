import json
import os

path = 'e:/web-projects/MTSALITTIHADMLG.SCH.ID/login/database.rules.json'
with open(path, 'r', encoding='utf-8') as f:
    rules = json.load(f)

guru_write = "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'guru')"
general_read = "auth != null && (root.child('users').child(auth.uid).child('role').val() !== 'ortu')"

nodes_to_add_guru = [
    'ekstra', 'ummi_exams', 'ummi_tasmi_schedules', 'ummi_progress', 'ummi_tahfidz', 'ummi_tasmi_results', 'english_classes', 'english_progress'
]

for node in nodes_to_add_guru:
    rules['rules'][node] = {
        '.read': general_read,
        '.write': guru_write
    }

rules['rules']['ummi_classes']['.write'] = guru_write
rules['rules']['ummi_classes']['.read'] = general_read

it_admin_rule = "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('unitFlags').child('TIM_IT').val() === true)"

rules['rules']['it_admin'] = {
    '.read': it_admin_rule,
    '.write': it_admin_rule
}

rules['rules']['audit_logs'] = {
    '.read': it_admin_rule,
    '.write': "auth != null"
}

with open(path, 'w', encoding='utf-8') as f:
    json.dump(rules, f, indent=2)
