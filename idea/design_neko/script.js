const trailItems = document.querySelectorAll('.trail_item');

trailItems.forEach((trailItem) => {
  trailItem.addEventListener('click', (event) => {
    event.preventDefault();
    trailItems.forEach((item) => item.classList.remove('is_selected'));
    trailItem.classList.add('is_selected');
    const target = document.querySelector(trailItem.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
