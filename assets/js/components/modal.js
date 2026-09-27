function openWelcomeModal(e) { if (e) e.preventDefault(); const modal = document.getElementById('welcomeModal'); if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden' } }
function closeWelcomeModal() { const modal = document.getElementById('welcomeModal'); if (modal) { modal.classList.remove('active'); document.body.style.overflow = '' } }

function openSearchModal(e) { if (e) e.preventDefault(); const modal = document.getElementById('searchModal'); if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; setTimeout(() => { const input = modal.querySelector('input'); if (input) input.focus(); }, 100); } }
function closeSearchModal(e) { if (e) e.preventDefault(); const modal = document.getElementById('searchModal'); if (modal) { modal.classList.remove('active'); document.body.style.overflow = '' } }

document.addEventListener('click', (e) => {
  if (e.target.closest('#nav-search-btn') || e.target.closest('#mobile-search-btn')) {
    openSearchModal(e);
  }
  
  if (e.target.closest('#closeSearchModalBtn')) {
    closeSearchModal(e);
  }
  
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', (e) => { 
  if (e.key === 'Escape') { 
    const activeModals = document.querySelectorAll('.modal-overlay.active');
    activeModals.forEach(m => m.classList.remove('active'));
    if(activeModals.length > 0) document.body.style.overflow = '';
  } 
});