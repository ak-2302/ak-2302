import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { relative, resolve, sep } from "node:path";
import { globSync } from "node:fs";
import { cpSync } from "node:fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-static-assets",
      writeBundle(options) {
        cpSync(resolve("ref"), resolve(options.dir || "dist", "ref"), {
          recursive: true,
        });
        cpSync(
          resolve("tool/video_trans/index.css"),
          resolve(options.dir || "dist", "tool/video_trans/index.css"),
        );
        cpSync(
          resolve("tool/video_trans/index.js"),
          resolve(options.dir || "dist", "tool/video_trans/index.js"),
        );
        cpSync(
          resolve("tool/github_pages_commits/app.js"),
          resolve(options.dir || "dist", "tool/github_pages_commits/app.js"),
        );
        cpSync(
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
        globSync("**/index.html")
          .filter(
            (file) =>
              !file.startsWith("node_modules/") &&
              !file.startsWith("dist/") &&
              !file.includes("/node_modules/") &&
              !file.includes("/dist/") &&
              !file.startsWith("tool/image_converter/") &&
              !file.startsWith("tool/video_compressor/") &&
              !file.startsWith("tool/obs/"),
          )
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
