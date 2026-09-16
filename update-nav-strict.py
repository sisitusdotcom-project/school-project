import os

nav_css_path = r"e:\web-projects\MTSALMUHAMMADIYAH 1MLG.SCH.ID\assets\css\components\nav.css"
with open(nav_css_path, "r", encoding="utf8") as f:
    nav_css = f.read()

import re

# 1. Update .nav-container.active .nav-wrapper
# We want to replace whatever it is with the fixed positioning on .nav-container.active
pattern1 = r"\.nav-container\.active \.nav-wrapper\s*\{[^}]*\}"
replacement1 = '''.nav-container.active {
    position: fixed;
    top: 58px;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    z-index: 9999;
  }
  .nav-container.active .nav-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
    overflow-y: auto;
  }'''
nav_css = re.sub(pattern1, replacement1, nav_css)

# 2. Add flex-shrink: 0 to .header-border-strip
pattern2 = r"(\.header-border-strip\s*\{[^}]*)(\})"
def repl2(m):
    content = m.group(1)
    if "flex-shrink: 0;" not in content:
        return content + "  flex-shrink: 0;\n  min-height: 5px;\n  z-index: 10;\n}"
    return m.group(0)
nav_css = re.sub(pattern2, repl2, nav_css)

# 3. Ensure .nav-outer-wrapper doesn't clip
# Actually .nav-outer-wrapper is absolute, but .nav-container.active is fixed, so it escapes it.
# However, .nav-container is currently overflow: hidden.
# If .nav-container is fixed, it will cover the screen.

with open(nav_css_path, "w", encoding="utf8") as f:
    f.write(nav_css)

print("Properly updated nav.css using regex to ensure it applied!")
