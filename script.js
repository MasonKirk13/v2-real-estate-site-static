const normalizePath = p => p === '/index.html' ? '/' : (p.endsWith('/') ? p : `${p}/`);
const path = normalizePath(location.pathname);
const main = document.querySelector('#main');
main.innerHTML = pages[path] || pages['/'];
const titles = {
  '/':'Coastal & Arbor Real Estate Group',
  '/search-homes/':'Search Homes','/property-management/':'Property Management','/buy/':'Buy',
  '/sell/':'Sell','/available-rentals/':'Available Rentals','/services/':'Services','/reviews/':'Reviews',
  '/about/':'About','/contact/':'Contact','/consultation/':'Request a Consultation'
};
document.title = `${titles[path] || 'Coastal & Arbor'}${path === '/' ? '' : ' — Coastal & Arbor Real Estate Group'}`;
document.querySelectorAll('.site-header nav a').forEach(a => {
  if (normalizePath(new URL(a.href).pathname) === path) a.setAttribute('aria-current','page');
});
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
nav.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')});
document.querySelector('#year').textContent = new Date().getFullYear();
const dialog = document.querySelector('#review-dialog');
document.addEventListener('click', e => {
  const reviewLink = e.target.closest('a[href="#leave-review"]');
  if (reviewLink) { e.preventDefault(); dialog.showModal(); }
});
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
