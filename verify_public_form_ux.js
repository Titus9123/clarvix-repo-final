const { JSDOM, VirtualConsole } = require('jsdom');

const pages = [
  { url: 'https://clarvix.net/', lang: 'en' },
  { url: 'https://clarvix.net/he.html', lang: 'he' },
  { url: 'https://clarvix.net/es.html', lang: 'es' },
  { url: 'https://clarvix.net/ar.html', lang: 'ar' },
];

async function verifyPage(page) {
  const html = await fetch(page.url, { headers: { 'User-Agent': 'ClarvixJsdomVerifier/1.0', 'Cache-Control': 'no-cache' } }).then(r => {
    if (!r.ok) throw new Error(`${page.url} fetch ${r.status}`);
    return r.text();
  });
  const virtualConsole = new VirtualConsole();
  const warnings = [];
  virtualConsole.on('warn', msg => warnings.push(String(msg)));
  virtualConsole.on('error', msg => warnings.push(String(msg)));

  let captured = null;
  const dom = new JSDOM(html, {
    url: page.url,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.fetch = async (url, options = {}) => {
        captured = { url: String(url), options };
        return { ok: true, status: 200, json: async () => ({ status: 'completed' }), text: async () => '{"status":"completed"}' };
      };
      window.console.warn = (...args) => warnings.push(args.join(' '));
    },
  });
  await new Promise(resolve => dom.window.document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  await new Promise(resolve => setTimeout(resolve, 250));

  const form = dom.window.document.querySelector('.clarvix-public-scan-form');
  if (!form) throw new Error(`${page.url}: form not found`);
  form.elements.name.value = `Browser UX ${page.lang}`;
  form.elements.website.value = 'https://example.com';
  form.elements.email.value = `ux-${page.lang}@example.com`;
  if (form.elements.company) form.elements.company.value = '';
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 100));
  if (!captured) throw new Error(`${page.url}: submit did not call fetch`);
  const payload = JSON.parse(captured.options.body);
  const success = dom.window.document.querySelector('.clarvix-public-scan-success');
  const result = {
    url: page.url,
    action: captured.url,
    method: captured.options.method,
    contentType: captured.options.headers['Content-Type'],
    accept: captured.options.headers.Accept,
    successVisible: success ? success.hidden === false : false,
    payload,
    hasConnectors: Object.prototype.hasOwnProperty.call(payload, 'connectors'),
    hasCredentialKeys: ['password','token','api_key','secret','credentials'].some(k => Object.prototype.hasOwnProperty.call(payload, k)),
    warnings,
  };
  console.log(JSON.stringify(result));
}

(async () => {
  for (const page of pages) await verifyPage(page);
  process.exit(0);
})().catch(err => { console.error(err.stack || err.message); process.exit(1); });
