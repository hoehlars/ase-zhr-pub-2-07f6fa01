// Einfacher Static-Server für den Production-Build (dist/) hinter dem
// Crucible-Proxy. Der Proxy strippt den Pfad-Prefix, daher liefern wir am
// Root aus. Unbekannte Pfade ohne Datei-Endung -> index.html (SPA-Fallback).
import http from "node:http"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist")
const PORT = Number(process.env.PORT) || 5173

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
}

async function sendFile(res, filePath) {
  const data = await readFile(filePath)
  res.writeHead(200, {
    "Content-Type": TYPES[path.extname(filePath)] || "application/octet-stream",
  })
  res.end(data)
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost")
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, "")
    let target = path.join(DIST, rel)

    // Pfadausbruch verhindern
    if (!target.startsWith(DIST)) {
      res.writeHead(403)
      return res.end("forbidden")
    }

    let info = await stat(target).catch(() => null)
    if (info?.isFile()) return await sendFile(res, target)

    // SPA-Fallback
    return await sendFile(res, path.join(DIST, "index.html"))
  } catch {
    res.writeHead(500)
    res.end("server error")
  }
})

server.listen(PORT, "0.0.0.0", () =>
  console.log(`Calvin (dist) auf http://0.0.0.0:${PORT} (SPA, Root-Serving)`),
)
