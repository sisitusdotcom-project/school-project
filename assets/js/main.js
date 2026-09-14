// Semua fungsi sudah dimuat lewat urutan <script> di HTML
window.onload = function () {
  initClock();
  initScrollAnimations();
};

function initScrollAnimations() {
  var animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if (animatedElements.length === 0) return;
  
  var observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // observer.unobserve(entry.target); // Biarkan berulang jika di-scroll naik turun, atau hilangkan jika ingin sekali jalan.
        // Hapus unobserve jika ingin animasi jalan lagi pas scroll naik. Saya pilih jalan sekali saja agar tidak mengganggu:
        observer.unobserve(entry.target);

        // Hapus kelas animasi setelah selesai agar transisi bawaan (seperti efek hover) kembali normal
        // DAN Hapus kelas posisi awal (anim-*) agar layout tidak rusak/kembali ke posisi awal
        setTimeout(function() {
          entry.target.classList.remove(
            'animate-on-scroll', 'is-visible',
            'anim-fade-up', 'anim-fade-down', 'anim-fade-left', 'anim-fade-right', 'anim-zoom-in', 'anim-zoom-out',
            'delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-600', 'delay-700', 'delay-800'
          );
        }, 1500); // Waktu 1.5s mengamankan durasi animasi (1.2s) + delay
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px', // Animasi jalan sedikit sebelum elemen benar-benar masuk layar penuh
    threshold: 0.1 
  });
  
  animatedElements.forEach(function(el) {
    observer.observe(el);
  });
}

function initClock() {
  var clockEl = document.getElementById('current-datetime');
  if (!clockEl) return;
  
  var days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  var months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
  
  setInterval(function() {
    var now = new Date();
    var day = days[now.getDay()];
    var date = now.getDate();
    var month = months[now.getMonth()];
    var year = now.getFullYear();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    
    clockEl.innerText = day + ', ' + date + ' ' + month + ' ' + year + ', ' + h + ':' + m + ':' + s;
  }, 1000);
}

function initHeroSlider() {
  var slider = document.getElementById('heroSlider');
  if (!slider) return;

  var slides = slider.querySelectorAll('.hero-image');
  var prevBtn = document.getElementById('prevSlide');
  var nextBtn = document.getElementById('nextSlide');
  var currentSlide = 0;
  var slideCount = slides.length;
  var slideInterval;

  if (slideCount === 0) return;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('slide-active');
    currentSlide = (index + slideCount) % slideCount;
    slides[currentSlide].classList.add('slide-active');
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function startSlide() { slideInterval = setInterval(nextSlide, 5000); }
  function resetInterval() { clearInterval(slideInterval); startSlide(); }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () { prevSlide(); resetInterval(); });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () { nextSlide(); resetInterval(); });
  }

  var touchStartX = 0;
  var touchEndX = 0;
  slider.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  slider.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    var swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) { nextSlide(); resetInterval(); }
    if (touchEndX > touchStartX + swipeThreshold) { prevSlide(); resetInterval(); }
  }, { passive: true });

  startSlide();
}
window.initHeroSlider = initHeroSlider;
