import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = 'file://' + str((ROOT / 'index.html').resolve())
MIN_RATIO = 4.5

JS_AUDIT = r'''
() => {
  function parse(c){
    const m = (c || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(',').map(x => parseFloat(x));
    if (parts.length === 4 && parts[3] === 0) return null;
    return parts.slice(0, 3);
  }
  function rel(rgb){
    const v = rgb.map(c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126*v[0] + 0.7152*v[1] + 0.0722*v[2];
  }
  function contrast(a,b){
    const x = rel(a), y = rel(b), hi = Math.max(x,y), lo = Math.min(x,y);
    return (hi + 0.05) / (lo + 0.05);
  }
  function blend(fg, bg){
    const a = fg[3] == null ? 1 : fg[3];
    return [Math.round(fg[0]*a + bg[0]*(1-a)), Math.round(fg[1]*a + bg[1]*(1-a)), Math.round(fg[2]*a + bg[2]*(1-a))];
  }
  function parseRgba(c){
    const m = (c || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(x => parseFloat(x));
    if (p.length === 3) p.push(1);
    return p;
  }
  function bgFor(el){
    let bg = [251,245,232];
    const chain=[]; let n=el;
    while(n && n.nodeType===1){ chain.push(n); n=n.parentElement; }
    chain.reverse().forEach(node => {
      const p = parseRgba(getComputedStyle(node).backgroundColor);
      if (p && p[3] > 0) bg = blend(p, bg);
    });
    return bg;
  }
  const selector = [
    '.hero h1', '.hero-sub', '.eyebrow', '.btn', '.safe-line', '.sev', '.tag',
    '.nav a', '.nav button', '.mobile-menu a', '.footer a', '.footer p',
    '#clv-a11y-panel h2', '#clv-a11y-panel span', '#clv-a11y-panel button', '#clv-a11y-statement-link'
  ].join(',');
  return [...document.querySelectorAll(selector)].filter(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const txt = (el.innerText || el.textContent || '').trim();
    return txt && r.width > 2 && r.height > 2 && cs.display !== 'none' && cs.visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight;
  }).map(el => {
    const cs = getComputedStyle(el);
    const painted = cs.webkitTextFillColor && cs.webkitTextFillColor !== 'rgba(0, 0, 0, 0)' ? cs.webkitTextFillColor : cs.color;
    const fg = parse(painted);
    const bg = bgFor(el);
    return { text: (el.innerText || el.textContent || '').trim().replace(/\s+/g,' ').slice(0,80), selector: el.id ? '#'+el.id : (el.className ? '.'+String(el.className).replace(/\s+/g,'.') : el.tagName), color: painted, bg: `rgb(${bg.join(', ')})`, ratio: fg ? contrast(fg, bg) : 99 };
  }).filter(x => x.ratio < 4.5);
}
'''

async def main():
    failures = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 590, 'height': 1280}, device_scale_factor=2, is_mobile=True, has_touch=True)
        await page.add_init_script("localStorage.setItem('clarvix-theme','light'); localStorage.removeItem('clarvix_a11y');")
        await page.goto(URL, wait_until='networkidle')
        states = [('base', None)]
        await page.click('#clv-a11y-btn')
        states.append(('panel-open', None))
        buttons = [
            ('contrast', '#clv-contrast'),
            ('links', '#clv-links'), ('stopAnim', '#clv-stopAnim'), ('bigCursor', '#clv-bigCursor'), ('readFont', '#clv-readFont')
        ]
        for name, btn in states:
            bad = await page.evaluate(JS_AUDIT)
            if bad:
                failures.append((name, bad[:10]))
        for name, btn in buttons:
            await page.click('#clv-a11y-reset-all')
            await page.click(btn)
            bad = await page.evaluate(JS_AUDIT)
            if bad:
                failures.append((name, bad[:10]))
        await browser.close()
    if failures:
        print('Light a11y widget contract failed:')
        for name, bad in failures:
            print('\nSTATE', name)
            for item in bad:
                print(f"  {item['ratio']:.2f} {item['selector']} {item['text']} fg={item['color']} bg={item['bg']}")
        raise SystemExit(1)
    print('Light mode widget/accessibility contract passed.')

asyncio.run(main())
