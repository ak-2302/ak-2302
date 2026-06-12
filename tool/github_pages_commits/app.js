import {
  buildCommitsApiUrl,
  buildCommitUrls,
  parsePagesUrl,
  rewriteAssetUrl,
  rewriteSrcset,
  shouldRewriteUrl,
  validateSha,
} from "./core.js";

const form = document.querySelector("#viewer-form");
const pagesUrlInput = document.querySelector("#pages-url");
const commitSelect = document.querySelector("#commit-select");
const commitHint = document.querySelector("#commit-hint");
const refreshCommitsButton = document.querySelector("#refresh-commits");
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
const openPreviewButton = document.querySelector("#open-preview");
const repoValue = document.querySelector("#repo-value");
const shaValue = document.querySelector("#sha-value");
const assetsValue = document.querySelector("#assets-value");
const toast = document.querySelector("#toast");

let activeRequest = null;
let commitRequest = null;
let commitLoadTimer = null;
let currentSourceUrl = "";
let currentPreviewUrl = "";
let currentPreviewObjectUrl = "";
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
  submitButton.querySelector("span").textContent = isBusy
    ? "表示を準備しています..."
    : commitSelect.value
      ? "コミット版を表示"
      : "最新ページを表示";
}

function revokePreviewObjectUrl() {
  if (currentPreviewObjectUrl) {
    URL.revokeObjectURL(currentPreviewObjectUrl);
    currentPreviewObjectUrl = "";
  }
}

function setPreviewUrl(url, isObjectUrl = false) {
  revokePreviewObjectUrl();
  currentPreviewUrl = url;
  if (isObjectUrl) {
    currentPreviewObjectUrl = url;
  }
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

function formatCommitDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function resetCommitOptions(label = "最新の公開ページ") {
  commitSelect.replaceChildren();
  const latestOption = document.createElement("option");
  latestOption.value = "";
  latestOption.textContent = label;
  commitSelect.append(latestOption);
}

async function fetchCommitHistory(repository, signal) {
  const response = await fetch(
    buildCommitsApiUrl(repository.owner, repository.repo),
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
      signal,
    }
  );

  if (response.status === 404) {
    throw new Error("対応する公開リポジトリが見つかりませんでした。");
  }
  if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
    throw new Error("GitHub APIの利用上限に達しました。しばらくしてから再取得してください。");
  }
  if (!response.ok) {
    throw new Error(`コミット履歴を取得できませんでした（HTTP ${response.status}）。`);
  }

  const commits = await response.json();
  if (!Array.isArray(commits)) {
    throw new Error("GitHubから予期しない応答を受け取りました。");
  }
  return commits;
}

async function loadCommitHistory({ notifyOnError = false } = {}) {
  window.clearTimeout(commitLoadTimer);
  markInvalid(pagesUrlInput, false);

  let repository;
  try {
    repository = parsePagesUrl(pagesUrlInput.value.trim());
  } catch {
    resetCommitOptions();
    commitSelect.disabled = false;
    refreshCommitsButton.disabled = true;
    commitHint.textContent = "有効なGitHub Pages URLを入力してください";
    setBusy(false);
    return;
  }

  if (commitRequest) commitRequest.abort();
  const request = new AbortController();
  commitRequest = request;

  resetCommitOptions("最新の公開ページ（コミット指定なし）");
  commitSelect.disabled = true;
  refreshCommitsButton.disabled = true;
  refreshCommitsButton.classList.add("is-loading");
  commitHint.textContent = "コミット履歴を取得中...";

  try {
    const commits = await fetchCommitHistory(repository, request.signal);

    for (const item of commits) {
      const sha = item.sha || "";
      if (!/^[0-9a-f]{40}$/i.test(sha)) continue;

      const message = (item.commit?.message || "メッセージなし")
        .split(/\r?\n/, 1)[0]
        .trim();
      const date = formatCommitDate(
        item.commit?.author?.date || item.commit?.committer?.date
      );
      const option = document.createElement("option");
      option.value = sha;
      option.textContent = `${sha.slice(0, 7)} · ${date} · ${message.slice(0, 48)}`;
      option.title = message;
      commitSelect.append(option);
    }

    commitHint.textContent = commits.length
      ? `直近${commits.length}件のコミットから選択できます`
      : "履歴がないため、最新の公開ページを表示します";
  } catch (error) {
    if (error.name === "AbortError") return;
    commitHint.textContent = `${error.message} 最新ページは表示できます`;
    if (notifyOnError) showToast(error.message);
  } finally {
    if (commitRequest === request) {
      commitSelect.disabled = false;
      refreshCommitsButton.disabled = false;
      refreshCommitsButton.classList.remove("is-loading");
      commitRequest = null;
      setBusy(false);
    }
  }
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

  let repository;

  try {
    repository = parsePagesUrl(pagesUrlInput.value.trim());
  } catch (error) {
    markInvalid(pagesUrlInput, true);
    pagesUrlInput.focus();
    showToast(error.message);
    return;
  }

  const selectedSha = commitSelect.value.trim();
  if (!selectedSha) {
    if (activeRequest) {
      activeRequest.abort();
      activeRequest = null;
    }
    const allowScripts = allowScriptsInput.checked;

    currentSourceUrl = repository.pagesUrl;
    setPreviewUrl(repository.pagesUrl);
    openSourceButton.disabled = false;
    openPreviewButton.disabled = false;
    setBusy(true);
    setState("loading");
    loadingMessage.textContent = "最新の公開ページを読み込み中...";
    addressBar.textContent = repository.pagesUrl;

    previewFrame.removeAttribute("srcdoc");
    previewFrame.setAttribute(
      "sandbox",
      allowScripts
        ? "allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
        : ""
    );
    previewFrame.src = repository.pagesUrl;

    repoValue.textContent = `${repository.owner}/${repository.repo}`;
    shaValue.textContent = "LATEST";
    assetsValue.textContent = "LIVE";
    setState("ready");
    setBusy(false);
    showToast("最新の公開ページを表示しました。");
    return;
  }

  let sha;
  try {
    sha = validateSha(selectedSha);
  } catch (error) {
    markInvalid(commitSelect, true);
    commitSelect.focus();
    showToast(error.message);
    return;
  }

  if (activeRequest) activeRequest.abort();
  const request = new AbortController();
  activeRequest = request;

  const urls = buildCommitUrls(repository.owner, repository.repo, sha);
  const allowScripts = allowScriptsInput.checked;

  currentSourceUrl = "";
  openSourceButton.disabled = true;
  openPreviewButton.disabled = true;
  setBusy(true);
  setState("loading");
  setLoadingStep(0);
  addressBar.textContent = `${repository.owner}/${repository.repo} @ ${sha.slice(0, 10)}`;

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    setLoadingStep(1);
    const html = await fetchHistoricalPage(urls.html, request.signal);

    setLoadingStep(2);
    const transformed = createHistoricalDocument(html, urls.assetRoot, allowScripts);

    setLoadingStep(3);
    previewFrame.setAttribute(
      "sandbox",
      allowScripts
        ? "allow-scripts allow-modals allow-popups"
        : ""
    );
    previewFrame.removeAttribute("src");
    previewFrame.srcdoc = transformed.html;
    setPreviewUrl(
      URL.createObjectURL(new Blob([transformed.html], { type: "text/html;charset=utf-8" })),
      true
    );

    repoValue.textContent = `${repository.owner}/${repository.repo}`;
    shaValue.textContent = sha;
    assetsValue.textContent = String(transformed.rewriteCount);
    currentSourceUrl = urls.github;
    openSourceButton.disabled = false;
    openPreviewButton.disabled = false;
    setState("ready");
    showToast("コミット時点のページを再構成しました。");
  } catch (error) {
    if (error.name === "AbortError") return;
    setState("error", error.message || "予期しないエラーが発生しました。");
    addressBar.textContent = "プレビューを読み込めませんでした";
  } finally {
    if (activeRequest === request) {
      setBusy(false);
      activeRequest = null;
    }
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadPreview();
});

fillExampleButton.addEventListener("click", () => {
  pagesUrlInput.value = "https://ak-2302.github.io/ak-2302/";
  markInvalid(pagesUrlInput, false);
  loadCommitHistory();
  pagesUrlInput.focus();
});

retryButton.addEventListener("click", loadPreview);

refreshCommitsButton.addEventListener("click", () => {
  loadCommitHistory({ notifyOnError: true });
});

openPreviewButton.addEventListener("click", () => {
  if (currentPreviewUrl) {
    window.open(currentPreviewUrl, "_blank", "noopener,noreferrer");
  }
});

openSourceButton.addEventListener("click", () => {
  if (currentSourceUrl) {
    window.open(currentSourceUrl, "_blank", "noopener,noreferrer");
  }
});

pagesUrlInput.addEventListener("input", () => {
  markInvalid(pagesUrlInput, false);
  window.clearTimeout(commitLoadTimer);
  if (commitRequest) {
    commitRequest.abort();
    commitRequest = null;
  }
  currentSourceUrl = "";
  currentPreviewUrl = "";
  revokePreviewObjectUrl();
  resetCommitOptions();
  commitSelect.disabled = false;
  refreshCommitsButton.disabled = true;
  refreshCommitsButton.classList.remove("is-loading");
  commitHint.textContent = "URLの入力完了後にコミット履歴を取得します";
  openSourceButton.disabled = true;
  openPreviewButton.disabled = true;
  setBusy(false);
  commitLoadTimer = window.setTimeout(loadCommitHistory, 700);
});

pagesUrlInput.addEventListener("blur", () => {
  if (pagesUrlInput.value.trim()) loadCommitHistory();
});

commitSelect.addEventListener("change", () => {
  markInvalid(commitSelect, false);
  currentSourceUrl = "";
  currentPreviewUrl = "";
  revokePreviewObjectUrl();
  openSourceButton.disabled = true;
  openPreviewButton.disabled = true;
  setBusy(false);
});

setState("empty");
openPreviewButton.disabled = true;
