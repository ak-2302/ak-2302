import assert from "node:assert/strict";
import {
  buildCommitsApiUrl,
  buildCommitUrls,
  parsePagesUrl,
  rewriteAssetUrl,
  rewriteSrcset,
  validateSha,
} from "./core.js";

const userSite = parsePagesUrl("https://octocat.github.io/");
assert.deepEqual(userSite, {
  owner: "octocat",
  repo: "octocat.github.io",
  pagesUrl: "https://octocat.github.io/",
});

const projectSite = parsePagesUrl("https://octocat.github.io/project/docs/?tab=1");
assert.deepEqual(projectSite, {
  owner: "octocat",
  repo: "project",
  pagesUrl: "https://octocat.github.io/project/",
});

assert.throws(() => parsePagesUrl("https://github.com/octocat"), /github\.io/);
assert.equal(validateSha("ABCDEF123"), "abcdef123");
assert.throws(() => validateSha("not-a-sha"), /16進数/);
assert.equal(
  buildCommitsApiUrl("octocat", "project"),
  "https://api.github.com/repos/octocat/project/commits?per_page=30"
);

const urls = buildCommitUrls("octocat", "project", "abcdef1");
assert.equal(
  urls.html,
  "https://raw.githubusercontent.com/octocat/project/abcdef1/index.html"
);
assert.equal(
  rewriteAssetUrl("/assets/app.js", urls.assetRoot),
  "https://cdn.jsdelivr.net/gh/octocat/project@abcdef1/assets/app.js"
);
assert.equal(
  rewriteAssetUrl("styles/main.css", urls.assetRoot),
  "https://cdn.jsdelivr.net/gh/octocat/project@abcdef1/styles/main.css"
);
assert.equal(rewriteAssetUrl("#section", urls.assetRoot), "#section");
assert.equal(
  rewriteSrcset("small.png 1x, /large.png 2x", urls.assetRoot),
  "https://cdn.jsdelivr.net/gh/octocat/project@abcdef1/small.png 1x, https://cdn.jsdelivr.net/gh/octocat/project@abcdef1/large.png 2x"
);

console.log("core tests passed");
