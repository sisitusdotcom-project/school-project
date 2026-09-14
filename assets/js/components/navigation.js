function initNavigation() {
  var mobileToggle = document.getElementById('mobile-toggle'); var navContainer = document.getElementById('nav-container'); if (mobileToggle && navContainer) { mobileToggle.addEventListener('click', function () { navContainer.classList.toggle('active') }) }
  var dropdownParents = document.querySelectorAll('.main-nav > ul > li.has-dropdown > a'); dropdownParents.forEach(function (parent) { parent.addEventListener('click', function (e) { if (window.innerWidth <= 991) { e.preventDefault(); var liParent = this.parentElement; var isActive = liParent.classList.contains('active'); document.querySelectorAll('.main-nav > ul > li.has-dropdown').forEach(function (item) { item.classList.remove('active') }); if (!isActive) { liParent.classList.add('active') } } }) }); document.addEventListener('click', function (e) { if (window.innerWidth <= 991 && navContainer.classList.contains('active')) { if (!mobileToggle.contains(e.target) && !document.querySelector('.nav-wrapper').contains(e.target)) { navContainer.classList.remove('active'); document.querySelectorAll('.main-nav > ul > li.has-dropdown').forEach(function (item) { item.classList.remove('active') }) } } }); var currentUrl = window.location.pathname.split('/').pop(); if (currentUrl === '') currentUrl = 'index.html'; var navLinks = document.querySelectorAll('.main-nav a'); navLinks.forEach(function (link) { var linkHref = link.getAttribute('href'); if (linkHref && linkHref.includes(currentUrl) && currentUrl !== '') { link.classList.add('active'); var parentLi = link.closest('.has-dropdown'); if (parentLi) { var parentLink = parentLi.querySelector('a'); if (parentLink) parentLink.classList.add('active'); } } }); var mainHeader = document.querySelector('.main-header'); if (mainHeader) {
    var lastScrollY = window.scrollY;
    var isHeaderHidden = false;
    var isScrolled = false;
    window.addEventListener('scroll', function () {
      var currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        if (!isHeaderHidden) {
          mainHeader.classList.add('header-hidden');
          document.documentElement.style.setProperty('--sticky-top', '20px');
          isHeaderHidden = true;
        }
      } else if (currentScrollY < lastScrollY) {
        if (isHeaderHidden) {
          mainHeader.classList.remove('header-hidden');
          var headerHeight = mainHeader.offsetHeight || 110;
          document.documentElement.style.setProperty('--sticky-top', (headerHeight + 20) + 'px');
          isHeaderHidden = false;
        }
      }

      if (currentScrollY > 10) {
        if (!isScrolled) {
          mainHeader.classList.add('scrolled');
          isScrolled = true;
        }
      } else {
        if (isScrolled) {
          mainHeader.classList.remove('scrolled');
          isScrolled = false;
        }
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });
  }
}
window.initNavigation = initNavigation