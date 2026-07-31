const trail = document.querySelector('.paw-trail');
const pawCount = 30;
const pageHeight = 300;
const pawImages = [];
const contents = [
  ['01 / profile', 'ものの見方', '観察して、ほどいて、もう一度組み立てる。'],
  ['02 / tools', '道具箱', '手を動かすための、小さな道具たち。'],
  ['03 / notes', '書き留める', '立ち止まったときに見つけたこと。'],
  ['04 / contact', '声をかけて', 'ここまで来たら、ぜひ一言。'],
];
const contentProgress = [0.5, 1.5, 2.5, 3.5].map((peak) => peak / 4.2);

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

contents.forEach(([label, title, text], index) => {
  const progress = contentProgress[index];
  const sinValue = Math.sin(progress * Math.PI * 4.2);
  const wave = sinValue * 25;
  const innerSide = wave >= 0 ? -1 : 1;
  const card = document.createElement('article');
  card.className = 'content-card';
  card.style.left = `${50 + wave + innerSide * 50}%`;
  card.style.top = `${pageHeight - 42 - progress * (pageHeight - 70) - 4}vh`;
  card.style.transform = 'translateX(-50%)';
  card.innerHTML = `<small>${label}</small><h2>${title}</h2><p>${text}</p>`;
  document.querySelector('.content-trail').appendChild(card);
});

Promise.all(pawImages.map((paw) => paw.decode ? paw.decode().catch(() => undefined) : Promise.resolve()))
  .then(() => setTimeout(() => window.scrollTo(0, document.documentElement.scrollHeight), 100));
