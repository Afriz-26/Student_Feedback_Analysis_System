// Local dev server (no installs needed): serves /public and runs the Netlify functions at /api/*.
const http = require("http"), fs = require("fs"), path = require("path");
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".csv": "text/csv", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    const name = url.pathname.slice(5).replace(/[^a-z]/g, "");
    let fn; try { fn = require("./netlify/functions/" + name).handler; } catch { res.writeHead(404); return res.end("{}"); }
    let body = ""; req.on("data", c => body += c);
    return req.on("end", async () => { const r = await fn({ httpMethod: req.method, body }); res.writeHead(r.statusCode, r.headers); res.end(r.body); });
  }
  let f = path.join(__dirname, "public", url.pathname === "/" ? "index.html" : url.pathname);
  if (!f.startsWith(path.join(__dirname, "public")) || !fs.existsSync(f)) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "Content-Type": types[path.extname(f)] || "text/plain" }); fs.createReadStream(f).pipe(res);
}).listen(process.env.PORT || 8888, () => console.log("Running at http://localhost:" + (process.env.PORT || 8888)));
