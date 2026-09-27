import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { relative, resolve, sep } from "node:path";
import { cpSync, existsSync, readdirSync } from "node:fs";
import { getSystemStats } from "./scripts/system-stats.mjs";

function copyIfExists(source, destination, options = {}) {
  if (existsSync(source)) cpSync(source, destination, options);
}

function findHtmlFiles(directory = ".") {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    const relativeFile = relative(".", file).replaceAll(sep, "/");
    if (entry.name === "node_modules" || entry.name === "dist" || relativeFile.startsWith("tool/image_converter/") || relativeFile.startsWith("tool/video_compressor/") || relativeFile.startsWith("tool/obs/")) continue;
    if (entry.isDirectory()) files.push(...findHtmlFiles(file));
    else if (entry.isFile() && entry.name === "index.html") files.push(relativeFile);
  }
  return files;
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "system-stats-api",
      configureServer(server) {
        server.middlewares.use("/api/system-stats", (_request, response) => {
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          response.end(JSON.stringify(getSystemStats()));
        });
      },
    },
    {
      name: "copy-static-assets",
      writeBundle(options) {
        copyIfExists(resolve("ref"), resolve(options.dir || "dist", "ref"), {
          recursive: true,
        });
        copyIfExists(
          resolve("tool/video_trans/index.css"),
          resolve(options.dir || "dist", "tool/video_trans/index.css"),
        );
        copyIfExists(
          resolve("tool/video_trans/index.js"),
          resolve(options.dir || "dist", "tool/video_trans/index.js"),
        );
        copyIfExists(
          resolve("tool/github_pages_commits/app.js"),
          resolve(options.dir || "dist", "tool/github_pages_commits/app.js"),
        );
        copyIfExists(
          resolve("tool/github_pages_commits/core.js"),
          resolve(options.dir || "dist", "tool/github_pages_commits/core.js"),
        );
      },
    },
  ],
  base: "./",
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        findHtmlFiles()
          .map((file) => [
            relative(".", file)
              .replaceAll(sep, "/")
              .replace(/\.html$/, "")
              .replaceAll("/", "_"),
            resolve(file),
          ]),
      ),
    },
  },
});
