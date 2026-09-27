function disableScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = `${scrollbarWidth}px`;
  document.body.style.overflow = 'hidden';
}
function enableScroll() {
  document.body.style.paddingRight = '';
  document.body.style.overflow = '';
}

function openWelcomeModal(e) { if (e) e.preventDefault(); const modal = document.getElementById('welcomeModal'); if (modal) { modal.classList.add('active'); disableScroll(); } }
function closeWelcomeModal() { const modal = document.getElementById('welcomeModal'); if (modal) { modal.classList.remove('active'); enableScroll(); } }

function openSearchModal(e) { if (e) e.preventDefault(); const modal = document.getElementById('searchModal'); if (modal) { modal.classList.add('active'); disableScroll(); setTimeout(() => { const input = modal.querySelector('input'); if (input) input.focus(); }, 100); } }
function closeSearchModal(e) { if (e) e.preventDefault(); const modal = document.getElementById('searchModal'); if (modal) { modal.classList.remove('active'); enableScroll(); } }

document.addEventListener('click', (e) => {
  if (e.target.closest('#nav-search-btn') || e.target.closest('#mobile-search-btn')) {
    openSearchModal(e);
  }
  
  if (e.target.closest('#closeSearchModalBtn')) {
    closeSearchModal(e);
  }
  
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    enableScroll();
  }
});

document.addEventListener('keydown', (e) => { 
  if (e.key === 'Escape') { 
    const activeModals = document.querySelectorAll('.modal-overlay.active');
    activeModals.forEach(m => m.classList.remove('active'));
    if(activeModals.length > 0) enableScroll();
  } 
});

document.addEventListener('submit', (e) => {
  if (e.target.matches('.search-form-modal')) {
    e.preventDefault();
    const input = e.target.querySelector('input[name="q"]');
    if (input && input.value.trim() !== '') {
      const query = encodeURIComponent(input.value.trim());
      window.open(`https://www.google.com/search?q=site:musada.sch.id+${query}`, '_blank');
      
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      activeModals.forEach(m => m.classList.remove('active'));
      enableScroll();
      input.value = '';
    }
  }
});