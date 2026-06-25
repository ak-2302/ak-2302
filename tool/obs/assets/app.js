const previewClock = document.querySelector("#preview-time");
const clockFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function renderPreviewClock() {
  if (!previewClock) return;
  previewClock.textContent = clockFormatter.format(new Date());
}

renderPreviewClock();
window.setInterval(renderPreviewClock, 1000);
