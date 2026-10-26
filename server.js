/* server.js - A tiny web server for this store (needs Node.js, nothing else).
   Start it with start.bat, or type:  node server.js
   Then open http://localhost:8080  (Google sign-in needs this address). */
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = 8080, ROOT = __dirname;
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain" };

http.createServer((req, res) => {
  let file = decodeURIComponent(req.url.split("?")[0]);
  if (file === "/") file = "/index.html";
  const full = path.join(ROOT, path.normalize(file));
  if (!full.startsWith(ROOT) || path.basename(full) === "server.js") { res.writeHead(403); return res.end("Not allowed"); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": (TYPES[path.extname(full)] || "application/octet-stream") + "; charset=utf-8", "Cache-Control": "no-store" });
    res.end(data);
  });
}).listen(PORT, "127.0.0.1", () => console.log(`Bazaarly is running at http://localhost:${PORT}  (close this window to stop)`));
