const trail = document.querySelector('.paw-trail');
const pawCount = 30;
const pageHeight = 300;
const pawImages = [];

for (let index = 0; index < pawCount; index += 1) {
  const paw = document.createElement('img');
  const progress = index / (pawCount - 1);
  const wave = Math.sin(progress * Math.PI * 4.2) * 25;
  const stepSide = index % 2 === 0 ? -1 : 1;
  const stepOffset = stepSide * 4.2;
  paw.className = 'paw';
  paw.src = 'assets/paw.png';
  paw.alt = '';
  paw.style.left = `${50 + wave + stepOffset}%`;
  paw.style.top = `${pageHeight - 42 - progress * (pageHeight - 70)}vh`;
  paw.style.transform = `translateX(-50%) rotate(${stepSide * 9 + wave * 0.18}deg)`;
  trail.appendChild(paw);
  pawImages.push(paw);
}

Promise.all(pawImages.map((paw) => paw.decode ? paw.decode().catch(() => undefined) : Promise.resolve()))
  .then(() => setTimeout(() => window.scrollTo(0, document.documentElement.scrollHeight), 100));
