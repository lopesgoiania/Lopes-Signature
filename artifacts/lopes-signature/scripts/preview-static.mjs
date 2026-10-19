// Local preview of the exported deployment: clean URLs and real HTTP 404.
// Public API reads are proxied only to the explicitly configured content source.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const origin = process.env.CONTENT_API_URL || 'https://lopessignature.vercel.app';
const types = { '.html': 'text/html; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      if (req.method !== 'GET' || !/^\/api\/(properties(?:\/[^/]+)?|taxonomies|maps-config|specialists|blog(?:\/[^/]+)?)$/.test(url.pathname)) { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ message: 'A prévia local não envia dados. Configure o backend para testar gravações em staging.' })); return; }
      const response = await fetch(new URL(url.pathname + url.search, origin), { signal: AbortSignal.timeout(15000) });
      res.writeHead(response.status, { 'Content-Type': response.headers.get('content-type') || 'application/json' }); res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    const route = decodeURIComponent(url.pathname);
    let file = path.resolve(dist, route === '/' ? 'index.html' : route === '/admin' || route.startsWith('/previa/') ? 'app.html' : route.slice(1));
    if (!file.startsWith(dist + path.sep)) { res.writeHead(400); res.end(); return; }
    let status = 200;
    try { if (!(await stat(file)).isFile()) throw new Error(); }
    catch {
      try { if (!(await stat(file + '.html')).isFile()) throw new Error(); file += '.html'; }
      catch { file = path.join(dist, '404.html'); status = 404; }
    }
    res.writeHead(status, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(503); res.end('Prévia temporariamente indisponível.'); }
});
server.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => console.log('Prévia local pronta em http://127.0.0.1:' + server.address().port));
