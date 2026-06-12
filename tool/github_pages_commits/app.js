import {
  buildCommitUrls,
  parsePagesUrl,
  rewriteAssetUrl,
  rewriteSrcset,
  shouldRewriteUrl,
  validateSha,
} from "./core.js";

const form = document.querySelector("#viewer-form");
const pagesUrlInput = document.querySelector("#pages-url");
const shaInput = document.querySelector("#commit-sha");
const allowScriptsInput = document.querySelector("#allow-scripts");
const submitButton = document.querySelector("#submit-button");
const fillExampleButton = document.querySelector("#fill-example");
const retryButton = document.querySelector("#retry-button");
const openSourceButton = document.querySelector("#open-source");
const emptyState = document.querySelector("#empty-state");
const loadingState = document.querySelector("#loading-state");
const loadingMessage = document.querySelector("#loading-message");
const errorState = document.querySelector("#error-state");
const errorMessage = document.querySelector("#error-message");
const previewFrame = document.querySelector("#preview-frame");
const previewMeta = document.querySelector("#preview-meta");
const addressBar = document.querySelector("#address-bar span");
const repoValue = document.querySelector("#repo-value");
const shaValue = document.querySelector("#sha-value");
const assetsValue = document.querySelector("#assets-value");
const toast = document.querySelector("#toast");

let activeRequest = null;
let currentSourceUrl = "";
let toastTimer = null;

const loadingSteps = [
  "リポジトリを解析中...",
  "index.htmlを取得中...",
  "アセットの参照先を変換中...",
  "プレビューを準備中...",
];

function setState(state, message = "") {
  emptyState.hidden = state !== "empty";
  loadingState.hidden = state !== "loading";
  errorState.hidden = state !== "error";
  previewFrame.hidden = state !== "ready";
  previewMeta.hidden = state !== "ready";

  if (state === "error") {
    errorMessage.textContent = message;
  }
}

function setLoadingStep(index) {
  loadingMessage.textContent = loadingSteps[index] || loadingSteps[0];
}

function setBusy(isBusy) {
  submitButton.disabled = isBusy;
  submitButton.querySelector("span").textContent = isBusy ? "再構成しています..." : "コミット版を表示";
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3600);
}

function markInvalid(input, isInvalid) {
  input.setAttribute("aria-invalid", String(isInvalid));
}

function rewriteStyleUrls(value, assetRoot) {
  return value.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, quote, url) => {
    if (!shouldRewriteUrl(url)) return match;
    return `url("${rewriteAssetUrl(url, assetRoot)}")`;
  });
}

function createHistoricalDocument(html, assetRoot, allowScripts) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, "text/html");
  let rewriteCount = 0;

  documentNode.querySelectorAll("base").forEach((element) => element.remove());

  const base = documentNode.createElement("base");
  base.href = assetRoot;
  documentNode.head.prepend(base);

  const csp = documentNode.createElement("meta");
  csp.httpEquiv = "Content-Security-Policy";
  csp.content = [
    "default-src https: data: blob:",
    `script-src ${allowScripts ? "https: 'unsafe-inline' 'unsafe-eval' blob:" : "'none'"}`,
    "style-src https: 'unsafe-inline'",
    "img-src https: data: blob:",
    "font-src https: data:",
    "media-src https: data: blob:",
    "connect-src https:",
    "frame-src https:",
    "object-src 'none'",
    "base-uri https:",
    "form-action 'none'",
  ].join("; ");
  documentNode.head.prepend(csp);

  const attributeRules = [
    ["link[href]", "href"],
    ["script[src]", "src"],
    ["img[src]", "src"],
    ["source[src]", "src"],
    ["video[src]", "src"],
    ["video[poster]", "poster"],
    ["audio[src]", "src"],
    ["track[src]", "src"],
    ["input[src]", "src"],
    ["object[data]", "data"],
    ["embed[src]", "src"],
  ];

  for (const [selector, attribute] of attributeRules) {
    documentNode.querySelectorAll(selector).forEach((element) => {
      const currentValue = element.getAttribute(attribute);
      if (!currentValue || !shouldRewriteUrl(currentValue)) return;
      element.setAttribute(attribute, rewriteAssetUrl(currentValue, assetRoot));
      rewriteCount += 1;
    });
  }

  documentNode.querySelectorAll("a[href]").forEach((element) => {
    const currentValue = element.getAttribute("href");
    if (!currentValue || !shouldRewriteUrl(currentValue)) return;
    element.setAttribute(
      "href",
      rewriteAssetUrl(currentValue, assetRoot, { directoryIndex: true })
    );
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noopener noreferrer");
    rewriteCount += 1;
  });

  documentNode.querySelectorAll("[srcset]").forEach((element) => {
    const currentValue = element.getAttribute("srcset");
    if (!currentValue) return;
    const rewritten = rewriteSrcset(currentValue, assetRoot);
    if (rewritten !== currentValue) {
      element.setAttribute("srcset", rewritten);
      rewriteCount += 1;
    }
  });

  documentNode.querySelectorAll("[style]").forEach((element) => {
    const currentValue = element.getAttribute("style");
    if (!currentValue) return;
    const rewritten = rewriteStyleUrls(currentValue, assetRoot);
    if (rewritten !== currentValue) {
      element.setAttribute("style", rewritten);
      rewriteCount += 1;
    }
  });

  documentNode.querySelectorAll("style").forEach((element) => {
    const rewritten = rewriteStyleUrls(element.textContent, assetRoot);
    if (rewritten !== element.textContent) {
      element.textContent = rewritten;
      rewriteCount += 1;
    }
  });

  documentNode.querySelectorAll('meta[http-equiv="refresh" i]').forEach((element) => {
    element.remove();
  });
  documentNode.querySelectorAll("form").forEach((element) => {
    element.setAttribute("action", "");
  });

  if (!allowScripts) {
    documentNode.querySelectorAll("script").forEach((element) => element.remove());
  }

  return {
    html: `<!doctype html>\n${documentNode.documentElement.outerHTML}`,
    rewriteCount,
  };
}

async function fetchHistoricalPage(sourceUrl, signal) {
  const response = await fetch(sourceUrl, {
    method: "GET",
    mode: "cors",
    cache: "no-store",
    signal,
  });

  if (response.status === 404) {
    throw new Error("指定したコミットに index.html が見つかりません。URLとSHAを確認してください。");
  }
  if (!response.ok) {
    throw new Error(`GitHubからファイルを取得できませんでした（HTTP ${response.status}）。`);
  }

  const html = await response.text();
  if (!/<(?:html|head|body)[\s>]/i.test(html)) {
    throw new Error("取得したファイルをHTMLとして認識できませんでした。");
  }
  return html;
}

async function loadPreview() {
  markInvalid(pagesUrlInput, false);
  markInvalid(shaInput, false);

  let repository;
  let sha;

  try {
    repository = parsePagesUrl(pagesUrlInput.value.trim());
  } catch (error) {
    markInvalid(pagesUrlInput, true);
    pagesUrlInput.focus();
    showToast(error.message);
    return;
  }

  try {
    sha = validateSha(shaInput.value);
  } catch (error) {
    markInvalid(shaInput, true);
    shaInput.focus();
    showToast(error.message);
    return;
  }

  if (activeRequest) activeRequest.abort();
  activeRequest = new AbortController();

  const urls = buildCommitUrls(repository.owner, repository.repo, sha);
  const allowScripts = allowScriptsInput.checked;

  currentSourceUrl = "";
  openSourceButton.disabled = true;
  setBusy(true);
  setState("loading");
  setLoadingStep(0);
  addressBar.textContent = `${repository.owner}/${repository.repo} @ ${sha.slice(0, 10)}`;

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    setLoadingStep(1);
    const html = await fetchHistoricalPage(urls.html, activeRequest.signal);

    setLoadingStep(2);
    const transformed = createHistoricalDocument(html, urls.assetRoot, allowScripts);

    setLoadingStep(3);
    previewFrame.setAttribute(
      "sandbox",
      allowScripts
        ? "allow-scripts allow-modals allow-popups"
        : ""
    );
    previewFrame.srcdoc = transformed.html;

    repoValue.textContent = `${repository.owner}/${repository.repo}`;
    shaValue.textContent = sha;
    assetsValue.textContent = String(transformed.rewriteCount);
    currentSourceUrl = urls.github;
    openSourceButton.disabled = false;
    setState("ready");
    showToast("コミット時点のページを再構成しました。");
  } catch (error) {
    if (error.name === "AbortError") return;
    setState("error", error.message || "予期しないエラーが発生しました。");
    addressBar.textContent = "プレビューを読み込めませんでした";
  } finally {
    setBusy(false);
    activeRequest = null;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadPreview();
});

fillExampleButton.addEventListener("click", () => {
  pagesUrlInput.value = "https://ak-2302.github.io/ak-2302/";
  shaInput.value = "de304b3";
  markInvalid(pagesUrlInput, false);
  markInvalid(shaInput, false);
  pagesUrlInput.focus();
});

retryButton.addEventListener("click", loadPreview);

openSourceButton.addEventListener("click", () => {
  if (currentSourceUrl) {
    window.open(currentSourceUrl, "_blank", "noopener,noreferrer");
  }
});

for (const input of [pagesUrlInput, shaInput]) {
  input.addEventListener("input", () => markInvalid(input, false));
}

setState("empty");
