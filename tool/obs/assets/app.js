const previewTime = document.querySelector("#preview-time");

function updatePreviewClock() {
  if (!previewTime) return;

  previewTime.textContent = new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

updatePreviewClock();
setInterval(updatePreviewClock, 1000);
