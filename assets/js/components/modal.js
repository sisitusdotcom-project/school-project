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
function openSPMBModal() {
var modal = document.getElementById('spmbModal');
if (!modal) {
var sourceItem = document.getElementById('spmb-top-infografis') || document.querySelector('.infografis-item.mt-4');
if (!sourceItem) return;
modal = document.createElement('div');
modal.id = 'spmbModal';
modal.className = 'modal-overlay spmb-popup-overlay';
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-modal', 'true');
var dialog = document.createElement('div');
dialog.className = 'spmb-popup-dialog';
var closeBtn = document.createElement('button');
closeBtn.type = 'button';
closeBtn.className = 'spmb-popup-close';
closeBtn.setAttribute('aria-label', 'Tutup Pop-up');
closeBtn.innerHTML = '<i class="ph-bold ph-x"></i>';
var body = document.createElement('div');
body.className = 'spmb-popup-body';
var clone = sourceItem.cloneNode(true);
clone.removeAttribute('id');
var cloneSlider = clone.querySelector('.infografis-slider');
if (cloneSlider) {
delete cloneSlider.dataset.sliderInitialized;
var cloneSlides = cloneSlider.querySelectorAll('.infografis-slide');
cloneSlides.forEach(function(s, idx) {
s.classList.toggle('active', idx === 0);
});
}
body.appendChild(clone);
dialog.appendChild(closeBtn);
dialog.appendChild(body);
modal.appendChild(dialog);
document.body.appendChild(modal);
if (typeof initInfografisSliders === 'function') {
initInfografisSliders();
}
}
modal.classList.add('active');
disableScroll();
}
function closeSPMBModal() {
var modal = document.getElementById('spmbModal');
if (modal) {
modal.classList.remove('active');
enableScroll();
var video = modal.querySelector('video');
if (video) {
try { video.pause(); } catch (err) {}
}
}
}
function initSPMBAutoPopup() {
var STORAGE_KEY = 'musada_spmb_popup_last_shown';
var COOLDOWN_MS = 6 * 60 * 60 * 1000;
var lastShown = localStorage.getItem(STORAGE_KEY);
var now = Date.now();
if (lastShown && (now - Number(lastShown) < COOLDOWN_MS)) {
return;
}
setTimeout(function() {
openSPMBModal();
localStorage.setItem(STORAGE_KEY, Date.now().toString());
}, 1600);
}
document.addEventListener('click', (e) => {
if (e.target.closest('#nav-search-btn') || e.target.closest('#mobile-search-btn')) {
openSearchModal(e);
}
if (e.target.closest('#closeSearchModalBtn')) {
closeSearchModal(e);
}
if (e.target.closest('.spmb-popup-close')) {
closeSPMBModal();
}
if (e.target.classList.contains('modal-overlay')) {
if (e.target.id === 'spmbModal') {
closeSPMBModal();
} else {
e.target.classList.remove('active');
enableScroll();
}
}
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') {
closeSPMBModal();
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
initSPMBAutoPopup();