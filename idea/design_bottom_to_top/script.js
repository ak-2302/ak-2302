const sections = [...document.querySelectorAll('.section')];
const points = [...document.querySelectorAll('.rail-points a')];
const fill = document.querySelector('.rail-fill');
sections.forEach((section, index) => {
  const paw = document.createElement('div');
  paw.className = `paw paw-${index + 1}`;
  paw.setAttribute('aria-hidden', 'true');
  paw.innerHTML = '<i></i><i></i><i></i><i></i><b></b>';
  section.appendChild(paw);
});
const updateTrail = () => {
  const current = Math.min(sections.length - 1, Math.max(0, Math.round(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * (sections.length - 1))));
  points.forEach((point, index) => point.classList.toggle('active', index === current));
  fill.style.height = `${(current / (sections.length - 1)) * 100}%`;
};
window.addEventListener('scroll', updateTrail, {passive:true});
window.addEventListener('resize', updateTrail);
updateTrail();
