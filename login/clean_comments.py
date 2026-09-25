import os
import re

BASE_DIR = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\login\public"

def clean_comments():
    for root, dirs, files in os.walk(BASE_DIR):
        for f in files:
            if not f.endswith(('.js', '.html', '.css')): continue
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original = content
            
            # Remove HTML comments
            if f.endswith('.html') or f.endswith('.js'):
                content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
            
            # Remove JS single line comments (basic)
            if f.endswith('.js'):
                # Avoid removing URLs in strings like http://...
                # Simple heuristic: remove lines starting with optional whitespace then //
                content = re.sub(r'^\s*//.*$\n?', '', content, flags=re.MULTILINE)
            
            if content != original:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Removed comments from {os.path.relpath(path, BASE_DIR)}")

clean_comments()
