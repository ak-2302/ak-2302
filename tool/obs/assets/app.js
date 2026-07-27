const previewClock = document.querySelector("#preview-time");
const widgetSearch = document.querySelector("#widget-search");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const widgetCards = [...document.querySelectorAll(".widget-card")];
const widgetCount = document.querySelector("#widget-count");
const emptyState = document.querySelector("#empty-state");
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

let activeFilter = "all";

function filterWidgets() {
  const query = widgetSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  widgetCards.forEach((card) => {
    const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesSearch = !query || card.dataset.search.toLowerCase().includes(query);
    const isVisible = matchesFilter && matchesSearch;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  widgetCount.textContent = visibleCount;
  emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    filterWidgets();
  });
});

widgetSearch.addEventListener("input", filterWidgets);
