document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-dark');
  if(!toggleBtn) return;

  if(localStorage.getItem('modo') === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.toggle('dark');

    localStorage.setItem('modo', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
});
