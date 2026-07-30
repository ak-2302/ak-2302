import { readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { glob } from "glob";
import { marked } from "marked";

const root = resolve(process.cwd());
const files = await glob("note/**/*.md", {
  cwd: root,
  ignore: ["**/node_modules/**", "**/.git/**"],
});

const notes = [];

for (const file of files.sort()) {
  const sourcePath = resolve(root, file);
  const outputPath = sourcePath.replace(/\.md$/i, ".html");
  const markdown = await readFile(sourcePath, "utf8");
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim()
    || relative(root, sourcePath).replace(/\.md$/i, "");
  const body = marked.parse(markdown);
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="./style.css">
  <title>${title}</title>
</head>
<body class="note-page">
  <main class="note-page__content">
    <a class="note-page__back" href="../">← ak-2302</a>
    <article class="note-page__article">
${body}
    </article>
  </main>
</body>
</html>
`;

  await writeFile(outputPath, html);
  notes.push({
    title,
    url: `./${file.replace(/\.md$/i, ".html")}`,
  });
  console.log(`${file} -> ${relative(root, outputPath)}`);
}

await writeFile(resolve(root, "note/index.json"), `${JSON.stringify(notes, null, 2)}\n`);
console.log(`Generated note/index.json (${notes.length} notes)`);
