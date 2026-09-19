const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const BLOCKED_PATTERNS = [
  /^\./,                       // Dotfiles & dotdirs (.env, .git, .agents, etc.)
  /^server\.js$/i,             // Server source
  /^package(-lock)?\.json$/i,  // Package descriptors
  /^docker(-compose)?\.ya?ml$/i,
  /^dockerfile$/i,
  /^firebase\.json$/i,
  /^firestore\.rules$/i,
  /^capacitor\.config\.json$/i,
  /^skills-lock\.json$/i,
  /^node_modules([\\/]|$)/i,
  /^tasks([\\/]|$)/i
];

const server = http.createServer((req, res) => {
  // Allow only GET and HEAD methods
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET, HEAD' });
    return res.end('405 Method Not Allowed');
  }

  let reqUrl = req.url.split('?')[0];
  try {
    reqUrl = decodeURIComponent(reqUrl);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Bad Request');
  }

  if (reqUrl === '/') reqUrl = '/index.html';

  // Sanitize path and prevent directory traversal outside __dirname (SEC-01)
  const normalizedPath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.resolve(__dirname, '.' + path.sep + normalizedPath);

  if (!filePath.startsWith(__dirname + path.sep) && filePath !== __dirname) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access outside server root is blocked');
  }

  // Block access to sensitive system, build, config files and dotfiles (SEC-09)
  const relPath = path.relative(__dirname, filePath);
  const isBlocked = BLOCKED_PATTERNS.some(pat => pat.test(relPath) || pat.test(path.basename(relPath)));
  if (isBlocked) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access to configuration or server files is restricted');
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    if (ext === '.html' || ext === '.js' || ext === '.css' || ext === '.json' || ext === '.webmanifest') {
      headers['Cache-Control'] = 'no-cache, must-revalidate';
    }

    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      return res.end();
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server Error: ${err.code}`);
      } else {
        res.writeHead(200, headers);
        res.end(content);
      }
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Component Vault server running at http://127.0.0.1:${PORT}`);
});
