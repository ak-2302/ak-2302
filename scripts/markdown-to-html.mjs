import { readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { glob } from "glob";
import { marked } from "marked";

const root = resolve(process.cwd());
const files = await glob("note/**/*.md", {
  cwd: root,
  ignore: ["**/node_modules/**", "**/.git/**", "contact-worker/.wrangler/**"],
});

for (const file of files) {
  const sourcePath = resolve(root, file);
  const outputPath = sourcePath.replace(/\.md$/i, ".html");
  const markdown = await readFile(sourcePath, "utf8");
  const title = relative(root, sourcePath).replace(/\.md$/i, "");
  const body = marked.parse(markdown);
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { max-width: 760px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; line-height: 1.7; }
    img { max-width: 100%; }
    pre { overflow-x: auto; padding: 1rem; background: #f4f4f4; }
    code { font-family: ui-monospace, monospace; }
  </style>
</head>
<body>
${body}
</body>
</html>
`;

  await writeFile(outputPath, html);
  console.log(`${file} -> ${relative(root, outputPath)}`);
}
