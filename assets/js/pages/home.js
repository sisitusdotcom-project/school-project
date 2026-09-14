(function initHeroSlider() {
  const slider = document.getElementById('heroSlider'); if (!slider) { setTimeout(initHeroSlider, 100); return }
  const slides = slider.querySelectorAll('.hero-image'); const prevBtn = document.getElementById('prevSlide'); const nextBtn = document.getElementById('nextSlide'); let currentSlide = 0; const slideCount = slides.length; let slideInterval; if (slideCount === 0) return; function goToSlide(index) { slides[currentSlide].classList.remove('slide-active'); currentSlide = (index + slideCount) % slideCount; slides[currentSlide].classList.add('slide-active') }
  function nextSlide() { goToSlide(currentSlide + 1) }
  function prevSlide() { goToSlide(currentSlide - 1) }
  function startSlide() { slideInterval = setInterval(nextSlide, 5000) }
  function resetInterval() { clearInterval(slideInterval); startSlide() }
  if (prevBtn) { prevBtn.addEventListener('click', function () { prevSlide(); resetInterval() }) }
  if (nextBtn) { nextBtn.addEventListener('click', function () { nextSlide(); resetInterval() }) }
  let touchStartX = 0; let touchEndX = 0; slider.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX }, { passive: !0 }); slider.addEventListener('touchend', function (e) { touchEndX = e.changedTouches[0].screenX; handleSwipe() }, { passive: !0 }); function handleSwipe() {
    const swipeThreshold = 50; if (touchEndX < touchStartX - swipeThreshold) { nextSlide(); resetInterval() }
    if (touchEndX > touchStartX + swipeThreshold) { prevSlide(); resetInterval() }
  }
  startSlide()
})()