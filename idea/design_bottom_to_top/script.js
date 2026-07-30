window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
});
