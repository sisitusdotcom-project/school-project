import os

nav_css_path = r"e:\web-projects\MTSALMUHAMMADIYAH 1MLG.SCH.ID\assets\css\components\nav.css"
with open(nav_css_path, "r", encoding="utf8") as f:
    nav_css = f.read()

# Fix the white-space issue in mobile media query
# Currently:
#   .main-nav ul li ul li a {
#     padding: 10px 15px 10px 25px;
#     font-size: .75rem
#   }
nav_css = nav_css.replace(
    '''.main-nav ul li ul li a {
    padding: 10px 15px 10px 25px;
    font-size: .75rem
  }''',
    '''.main-nav ul li ul li a {
    padding: 10px 15px 10px 25px;
    font-size: .75rem;
    white-space: normal;
    line-height: 1.3;
  }'''
)

# Fix the clock overflow in mobile
# Let's add a style for .mobile-clock in the media query
clock_fix = '''
  .mobile-nav-tools-container {
    padding: 10px 15px;
    gap: 10px;
  }
  .mobile-clock {
    font-size: 0.65rem;
    white-space: normal;
    line-height: 1.2;
    flex-wrap: wrap;
  }
  .main-nav>ul>li.mobile-nav-tools {
    margin-top: auto;
    border-bottom: none;
    padding-top: 1.5rem;      
    padding-bottom: 1rem;   
  }
'''

# Replace the previous .mobile-nav-tools CSS
nav_css = nav_css.replace(
    '''.main-nav>ul>li.mobile-nav-tools {
    margin-top: auto;
    border-bottom: none;
    padding-top: 3rem;      /* Guarantee space if screen is short */
    padding-bottom: 1rem;   /* Space from the bottom edge of screen */
  }''',
    clock_fix
)

with open(nav_css_path, "w", encoding="utf8") as f:
    f.write(nav_css)

print("Applied fix for wrapping and overflow in mobile.")
