const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  const targetUrl = reqUrl.query.url;

  // Serve the search/browser interface
  if (!targetUrl) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GitHub Private Cloud Browser</title>
        <style>
          body { font-family: sans-serif; background: #121212; color: #fff; padding: 40px; text-align: center; }
          input { width: 60%; padding: 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: #fff; font-size: 16px; }
          button { padding: 12px 20px; border-radius: 6px; border: none; background: #008080; color: #fff; font-size: 16px; cursor: pointer; }
          button:hover { background: #00a0a0; }
        </style>
      </head>
      <body>
        <h1>🔒 GitHub Cloud Browser</h1>
        <p>Browsing via GitHub Cloud Servers</p>
        <br>
        <form method="GET">
          <input type="text" name="url" placeholder="https://example.com" required />
          <button type="submit">Open Site</button>
        </form>
      </body>
      </html>
    `);
    return;
  }

  // Ensure standard protocol format
  let finalTarget = targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl;

  try {
    const parsed = url.parse(finalTarget);
    const client = parsed.protocol === 'http:' ? http : https;

    const proxyReq = client.request(finalTarget, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (proxyRes) => {
      // Forward status code and strip blocking headers
      const headers = { ...proxyRes.headers };
      delete headers['x-frame-options'];
      delete headers['content-security-policy'];

      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error: ' + err.message);
    });

    proxyReq.end();
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid URL');
  }
});

server.listen(PORT, () => {
  console.log(`Cloud browser running on port ${PORT}`);
});
