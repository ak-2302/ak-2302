const trail = document.querySelector('.paw-trail');
const pawCount = 30;
const pageHeight = 300;
const pawImages = [];

for (let index = 0; index < pawCount; index += 1) {
  const paw = document.createElement('img');
  const progress = index / (pawCount - 1);
  const wave = Math.sin(progress * Math.PI * 4.2) * 25;
  paw.className = 'paw';
  paw.src = 'assets/paw.png';
  paw.alt = '';
  paw.style.left = `${50 + wave}%`;
  paw.style.top = `${pageHeight - 10 - progress * (pageHeight - 20)}vh`;
  paw.style.transform = `translateX(-50%) rotate(${wave * 0.28}deg)`;
  trail.appendChild(paw);
  pawImages.push(paw);
}

Promise.all(pawImages.map((paw) => paw.decode ? paw.decode().catch(() => undefined) : Promise.resolve()))
  .then(() => requestAnimationFrame(() => window.scrollTo(0, document.documentElement.scrollHeight)));
