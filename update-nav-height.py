import os

nav_css_path = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\assets\css\components\nav.css"
with open(nav_css_path, "r", encoding="utf8") as f:
    nav_css = f.read()

# Make .nav-container active full height and flex
nav_css = nav_css.replace(
    '''.nav-container.active .nav-wrapper {
    display: block;
  }''',
    '''.nav-container.active {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 58px);
    height: calc(100dvh - 58px);
  }
  .nav-container.active .nav-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
    overflow-y: auto;
  }'''
)

# Put back flex on .main-nav
nav_css = nav_css.replace(
    '''.main-nav>ul {
    flex-direction: column;
    width: 100%;
  }''',
    '''.main-nav {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
  }
  .main-nav>ul {
    flex-direction: column;
    width: 100%;
    flex-grow: 1;
    padding: 0;
    margin: 0;
  }'''
)

# Put back the mobile-nav-tools alignment
nav_css = nav_css.replace(
    '''.main-nav>ul>li.mobile-nav-tools {
    border-bottom: none;
    padding: 0;
    width: 100%;
    display: block;
    background-color: transparent;
  }''',
    '''.main-nav>ul>li.mobile-nav-tools {
    margin-top: auto;
    border-bottom: none;
    padding: 0;
    width: 100%;
    display: block;
    background-color: transparent;
  }'''
)

with open(nav_css_path, "w", encoding="utf8") as f:
    f.write(nav_css)

print("Updated nav.css for full height and visible divider.")
