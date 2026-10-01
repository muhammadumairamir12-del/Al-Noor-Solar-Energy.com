import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const issues = [];

function check(name, ok, detail) {
  if (!ok) issues.push({ name, detail });
  console.log(ok ? `OK  ${name}` : `FAIL ${name}: ${detail}`);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

check('index.html exists', html.length > 1000, 'too small');
check('app.js syntax', (() => { try { new Function(appJs); return true; } catch (e) { return e.message; } })() === true, 'parse error');

const pageIds = [...html.matchAll(/id="(page-[^"]+)"/g)].map(m => m[1]);
check('page-home present', pageIds.includes('page-home'), 'missing');
check('page-products present', pageIds.includes('page-products'), 'missing');

const routes = ['home', 'products', 'solar-inverters', 'solar-panels', 'about', 'cart'];
for (const r of routes) {
  check(`route renderer ${r}`, appJs.includes(`'${r}':`), 'missing in pageRenderers');
}

check('getPageElementId helper', appJs.includes('function getPageElementId'), 'missing');
check('refreshProductList', appJs.includes('function refreshProductList'), 'missing');
check('dropdown toggle guard', appJs.includes('dropdown-toggle') && appJs.includes("if (el.classList.contains('dropdown-toggle')) return"), 'missing');

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(root, p.replace(/^\//, ''));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('404');
  }
  const ext = path.extname(file);
  const ct = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': ct });
  fs.createReadStream(file).pipe(res);
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

const homeRes = await fetch(`${base}/index.html`);
check('HTTP serves index', homeRes.status === 200, String(homeRes.status));

server.close();

console.log('\n--- Summary ---');
if (issues.length === 0) {
  console.log('All static checks passed.');
  process.exit(0);
} else {
  console.log(`${issues.length} issue(s) found.`);
  process.exit(1);
}
