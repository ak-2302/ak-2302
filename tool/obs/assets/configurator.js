const form = document.querySelector("#config-form");
const preview = document.querySelector("#widget-preview");
const urlOutput = document.querySelector("#url-output");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const toast = document.querySelector("#toast");
const corePath = form.dataset.core || "./core/";

let widgetUrl = "";
let toastTimer;

function buildWidgetUrl() {
  const url = new URL(corePath, window.location.href);
  const data = new FormData(form);

  for (const [key, value] of data.entries()) {
    if (String(value).trim() !== "") url.searchParams.set(key, value);
  }

  return url.href;
}

function updatePreview() {
  widgetUrl = buildWidgetUrl();
  preview.src = widgetUrl;
  urlOutput.textContent = widgetUrl;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(widgetUrl);
  } catch {
    const input = document.createElement("textarea");
    input.value = widgetUrl;
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  showToast("URLをコピーしました");
}

async function downloadWidget() {
  try {
    const coreUrl = new URL(corePath, window.location.href);
    const [html, css, script] = await Promise.all([
      fetch(coreUrl).then((response) => response.text()),
      fetch(new URL("style.css", coreUrl)).then((response) => response.text()),
      fetch(new URL("script.js", coreUrl)).then((response) => response.text()),
    ]);
    const embeddedScript = script.replace(
      "new URLSearchParams(location.search)",
      "new URLSearchParams(window.__WIDGET_QUERY__ || location.search)",
    );
    const bundled = html
      .replace(/<link rel="stylesheet" href="\.\/style\.css"\s*\/?>/, `<style>${css}</style>`)
      .replace(
        /<script src="\.\/script\.js"><\/script>/,
        `<script>window.__WIDGET_QUERY__=${JSON.stringify(new URL(widgetUrl).search)};${embeddedScript.replaceAll("</script>", "<\\/script>")}<\/script>`,
      );
    const blob = new Blob([bundled], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${form.dataset.filename || "obs-widget"}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("HTMLをダウンロードしました");
  } catch {
    showToast("ダウンロードに失敗しました");
  }
}

form.addEventListener("input", updatePreview);
form.addEventListener("change", updatePreview);
copyButton.addEventListener("click", copyUrl);
downloadButton.addEventListener("click", downloadWidget);
updatePreview();
