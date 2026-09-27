import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 18080);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".wasm": "application/wasm" };

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, `http://${host}:${port}`).pathname);
  const relative = normalize(pathname).replace(/^([.][.][/\\])+/, "");
  let file = join(root, relative);
  if (!existsSync(file) || !statSync(file).isFile()) file = join(root, pathname.endsWith("/") ? pathname + "index.html" : pathname + "/index.html");
  if (!existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end("Not found"); return; }
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
  createReadStream(file).pipe(res);
}).listen(port, host, () => console.log(`ak-2302 serving ${root} at http://${host}:${port}`));
