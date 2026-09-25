import os

BASE_DIR = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\login\public\assets\css"
components_path = os.path.join(BASE_DIR, 'components.css')

with open(components_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add scrollbar styles and mobile compact adjustments
additions = """
/* Mobile-first: enhance table scroll & compactness */
.table-wrap::-webkit-scrollbar,
.table-responsive::-webkit-scrollbar {
  height: 6px;
}
.table-wrap::-webkit-scrollbar-track,
.table-responsive::-webkit-scrollbar-track {
  background: var(--bg-body);
  border-radius: 4px;
}
.table-wrap::-webkit-scrollbar-thumb,
.table-responsive::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 4px;
}
.table-wrap::-webkit-scrollbar-thumb:hover,
.table-responsive::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

@media (max-width: 767px) {
  .table th,
  .table td {
    padding: 10px 10px;
    font-size: 13px;
  }
  .card {
    padding: 12px;
  }
  .table-wrap .table {
    min-width: 500px; /* Make it slightly more compact on mobile if possible */
  }
}
"""

if "/* Mobile-first: enhance table scroll & compactness */" not in content:
    with open(components_path, 'a', encoding='utf-8') as f:
        f.write('\n' + additions)
    print("Added responsive table scroll styles and compactness to components.css")
else:
    print("Styles already exist.")
