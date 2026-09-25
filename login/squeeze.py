import os
import re

BASE_DIR = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\login\public"

def squeeze_blank_lines():
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            if not f.endswith(('.js', '.html', '.css')): continue
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original = content
            
            # Collapse 2 or more blank lines into a single blank line
            content = re.sub(r'\n{3,}', '\n\n', content)
            
            if content != original:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Squeezed blank lines in {os.path.relpath(path, BASE_DIR)}")

squeeze_blank_lines()
