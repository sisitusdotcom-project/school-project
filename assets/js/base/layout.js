document.addEventListener('DOMContentLoaded', function () {
  var scripts = document.getElementsByTagName('script'); var baseUrl = ''; for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute('src'); if (src && src.includes('assets/js/base/layout.js')) {
      baseUrl = src.replace('assets/js/base/layout.js', ''); if (baseUrl.includes('?')) { baseUrl = baseUrl.split('?')[0] }
      break
    }
  }
  var loadComponent = function (id, url) { var el = document.getElementById(id); if (!el) return Promise.resolve(); return fetch(baseUrl + url).then(function (response) { if (!response.ok) throw new Error('Failed to load ' + url); return response.text() }).then(function (html) { var processedHtml = html.replace(/\{BASE_URL\}/g, baseUrl); el.outerHTML = processedHtml }).catch(function (error) { console.error('Error loading component:', error) }) }; Promise.all([loadComponent('app-header', 'components/header.html'), loadComponent('app-hero', 'components/hero.html')]).then(function () {
    if (typeof initNavigation === 'function') { initNavigation() }
    if (typeof initClock === 'function') { initClock() }
  })
})