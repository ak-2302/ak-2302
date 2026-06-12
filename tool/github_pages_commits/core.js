const GITHUB_PAGES_HOST = "github.io";
const SHA_PATTERN = /^[0-9a-f]{7,40}$/i;
const NON_NETWORK_SCHEMES = /^(?:data|blob|mailto|tel|javascript|about):/i;

export function parsePagesUrl(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error("有効なURLを入力してください。");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("http または https のURLを入力してください。");
  }

  const hostname = url.hostname.toLowerCase();
  if (!hostname.endsWith(`.${GITHUB_PAGES_HOST}`)) {
    throw new Error("github.io の公開Pages URLを入力してください。");
  }

  const owner = hostname.slice(0, -(GITHUB_PAGES_HOST.length + 1));
  if (!owner || owner.includes(".")) {
    throw new Error("GitHub Pagesのユーザー名を判別できませんでした。");
  }

  const pathParts = url.pathname.split("/").filter(Boolean);
  const repo = pathParts[0] || `${owner}.github.io`;

  return {
    owner,
    repo,
    pagesUrl: `${url.protocol}//${url.host}/${pathParts[0] ? `${repo}/` : ""}`,
  };
}

export function validateSha(value) {
  const sha = value.trim();
  if (!SHA_PATTERN.test(sha)) {
    throw new Error("Commit SHAは7〜40文字の16進数で入力してください。");
  }
  return sha.toLowerCase();
}

export function buildCommitUrls(owner, repo, sha) {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);
  const encodedSha = encodeURIComponent(sha);
  const rawRoot = `https://raw.githubusercontent.com/${encodedOwner}/${encodedRepo}/${encodedSha}/`;
  const assetRoot = `https://cdn.jsdelivr.net/gh/${encodedOwner}/${encodedRepo}@${encodedSha}/`;

  return {
    html: `${rawRoot}index.html`,
    assetRoot,
    github: `https://github.com/${encodedOwner}/${encodedRepo}/tree/${encodedSha}`,
  };
}

export function shouldRewriteUrl(value) {
  const trimmed = value.trim();
  return Boolean(
    trimmed &&
    !trimmed.startsWith("#") &&
    !trimmed.startsWith("//") &&
    !NON_NETWORK_SCHEMES.test(trimmed) &&
    !/^[a-z][a-z\d+.-]*:/i.test(trimmed)
  );
}

export function rewriteAssetUrl(value, assetRoot, options = {}) {
  if (!shouldRewriteUrl(value)) {
    return value;
  }

  const trimmed = value.trim();
  const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  let rewritten = new URL(cleanPath, assetRoot).href;

  if (options.directoryIndex && /\/(?:[?#].*)?$/.test(rewritten)) {
    const url = new URL(rewritten);
    url.pathname += "index.html";
    rewritten = url.href;
  }

  return rewritten;
}

export function rewriteSrcset(value, assetRoot) {
  return value
    .split(",")
    .map((candidate) => {
      const parts = candidate.trim().split(/\s+/);
      if (!parts[0]) return "";
      parts[0] = rewriteAssetUrl(parts[0], assetRoot);
      return parts.join(" ");
    })
    .filter(Boolean)
    .join(", ");
}
