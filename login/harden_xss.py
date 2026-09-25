import os
import re

BASE_DIR = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\login\public\assets\js\pages"

def harden_xss():
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            if not f.endswith('.js'): continue
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original = content
            
            # Variables to protect: those ending in .name, .username, .title, .detail
            # Also simple string variables like studentName, tabName if they contain user input.
            
            # Use regex to find ${...} and wrap if it matches certain patterns
            def replacer(match):
                var = match.group(1)
                # If already escaped or is a math expression, skip
                if 'escapeHtml' in var or '?' in var or '>' in var or '<' in var or '===' in var or '||' in var:
                    return match.group(0)
                
                # Protect object properties commonly holding text
                if re.search(r'\.(name|username|title|detail|desc|note)$', var.strip()):
                    return f'${{AppConfig.escapeHtml({var})}}'
                
                # Protect specific standalone variables
                if var.strip() in ['studentName', 'tabName']:
                    return f'${{AppConfig.escapeHtml({var})}}'
                
                return match.group(0)
            
            # We only replace inside template strings `...`
            def template_replacer(match):
                tmpl = match.group(0)
                return re.sub(r'\$\{([^}]+)\}', replacer, tmpl)
            
            content = re.sub(r'`[^`]+`', template_replacer, content)
            
            if content != original:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Hardened XSS in {os.path.relpath(path, BASE_DIR)}")

harden_xss()
