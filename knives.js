document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav-links');
  document.querySelector('.menu')?.addEventListener('click', () => nav.classList.toggle('open'));
  const cards = [...document.querySelectorAll('.knife-card')];
  document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach(c => c.style.display = f === 'all' || c.dataset.category === f ? '' : 'none');
  }));
});
