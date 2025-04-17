const cards = document.querySelectorAll('.tool-wraper');

cards.forEach(card => {
    var src = card.querySelector("iframe").src;
    if (src.endsWith("index.html")) {
        src = src.replace(/index\.html$/, '');
    }
    card.style.cursor = "pointer";
    card.addEventListener('click', () => {
        window.open(src, '_blank');
    });
});