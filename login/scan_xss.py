import os
import re

BASE_DIR = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\login\public\assets\js\pages"

def scan_xss():
    findings = []
    # Pattern to match template string blocks and find unprotected variables inside HTML tags
    # This is a heuristic: it finds `${...}` inside backticks.
    
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            if not f.endswith('.js'): continue
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Find template literals
            templates = re.findall(r'`([^`]+)`', content)
            for tmpl in templates:
                # Find all interpolated variables
                interpolated = re.findall(r'\$\{([^}]+)\}', tmpl)
                for var in interpolated:
                    # Skip if it is already wrapped in escapeHtml
                    if 'escapeHtml' in var: continue
                    # Skip simple math/logic or hardcoded strings
                    if re.match(r'^[a-zA-Z0-9_\.]+$', var.strip()):
                        findings.append((f, var.strip()))
    
    return findings

f = scan_xss()
for file, var in set(f):
    print(f"{file}: {var}")
