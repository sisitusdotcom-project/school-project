import os

nav_css_path = r"e:\web-projects\MTSALITTIHADMLG.SCH.ID\assets\css\components\nav.css"
with open(nav_css_path, "r", encoding="utf8") as f:
    nav_css = f.read()

# 1. Change .nav-container.active .nav-wrapper { display: block } to display: flex
nav_css = nav_css.replace(
    '''.nav-container.active .nav-wrapper {
    display: block
  }''',
    '''.nav-container.active .nav-wrapper {
    display: flex;
    flex-direction: column;
  }'''
)

# 2. Add flex styles to .main-nav and .main-nav > ul to allow margin-top: auto to work
# Search for:
#  .main-nav>ul {
#    flex-direction: column;
#    width: 100%
#  }
nav_css = nav_css.replace(
    '''.main-nav>ul {
    flex-direction: column;
    width: 100%
  }''',
    '''.main-nav {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .main-nav>ul {
    flex-direction: column;
    width: 100%;
    flex-grow: 1;
  }'''
)

# 3. Add margin-top: auto to .mobile-nav-tools
# I can just append it inside the mobile media query.
# Let's insert it before the last closing brace of the file.
mobile_nav_tools_css = '''
  .main-nav>ul>li.mobile-nav-tools {
    margin-top: auto;
    border-bottom: none;
  }
  .nav-wrapper {
    height: calc(100vh - 58px); /* adjust height to account for the header bar */
  }
}
'''
nav_css = nav_css.rsplit('}', 1)[0] + mobile_nav_tools_css

# Make sure we didn't duplicate height in .nav-wrapper.
# The previous height was 100vh, we replaced it in a previous step. Let's just fix it.
nav_css = nav_css.replace('height: 100vh;', '')

with open(nav_css_path, "w", encoding="utf8") as f:
    f.write(nav_css)

print("Updated nav.css for pushing mobile-nav-tools to bottom.")
