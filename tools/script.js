const cards = document.querySelectorAll('.tool-wraper');

cards.forEach(card => {
    card.addEventListener('click', () => {
        var src = card.querySelector("iframe").src;
        window.open(src, '_blank');
    });
});