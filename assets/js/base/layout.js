document.addEventListener('DOMContentLoaded', function () {
  var baseUrl = '/'; var loadComponent = function (id, url) { var el = document.getElementById(id); if (!el) return Promise.resolve(); return fetch('/' + url + '').then(function (response) { if (!response.ok) throw new Error('Failed to load ' + url); return response.text() }).then(function (html) { var processedHtml = html.replace(/\{BASE_URL\}/g, baseUrl); el.outerHTML = processedHtml }).catch(function (error) { console.error('Error loading component:', error) }) }; Promise.all([loadComponent('app-header', 'components/header.html'), loadComponent('app-hero', 'components/hero.html'), loadComponent('app-sidebar', 'components/sidebar.html'), loadComponent('app-footer', 'components/footer.html')]).then(function () {
    if (typeof initNavigation === 'function') { initNavigation() }
    if (typeof initClock === 'function') { initClock() }
    if (typeof initHeroSlider === 'function') { initHeroSlider() }
    if (typeof initScrollAnimations === 'function') { initScrollAnimations() }
    if (typeof initNumberCounters === 'function') { initNumberCounters() }
    if (typeof initBackToTop === 'function') { initBackToTop() }
    if (typeof initDarkMode === 'function') { initDarkMode() }
    var wmScript = document.createElement('script'); wmScript.src = '/' + 'assets/js/components/wm.js'; document.body.appendChild(wmScript)
  })
})
