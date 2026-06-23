import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path('/root/work/clarvix-repo-final/screenshots/light-widget-a11y-live')
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://clarvix.net/?v=light-widget-a11y-20260623b'
MIN_RATIO = 4.5

JS_AUDIT = r'''
() => {
  function parse(c){ const m=(c||'').match(/rgba?\(([^)]+)\)/); if(!m)return null; const p=m[1].split(',').map(x=>parseFloat(x)); if(p.length===4&&p[3]===0)return null; return p.slice(0,3); }
  function rgba(c){ const m=(c||'').match(/rgba?\(([^)]+)\)/); if(!m)return null; const p=m[1].split(',').map(x=>parseFloat(x)); if(p.length===3)p.push(1); return p; }
  function rel(rgb){ const v=rgb.map(c=>{c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)}); return .2126*v[0]+.7152*v[1]+.0722*v[2]; }
  function contrast(a,b){ const x=rel(a),y=rel(b),hi=Math.max(x,y),lo=Math.min(x,y); return (hi+.05)/(lo+.05); }
  function blend(fg,bg){ const a=fg[3]==null?1:fg[3]; return [Math.round(fg[0]*a+bg[0]*(1-a)),Math.round(fg[1]*a+bg[1]*(1-a)),Math.round(fg[2]*a+bg[2]*(1-a))]; }
  function bgFor(el){ let bg=[251,245,232], chain=[], n=el; while(n&&n.nodeType===1){chain.push(n);n=n.parentElement;} chain.reverse().forEach(node=>{const p=rgba(getComputedStyle(node).backgroundColor); if(p&&p[3]>0) bg=blend(p,bg);}); return bg; }
  const selector=['.hero h1','.hero-sub','.eyebrow','.btn','.safe-line','.sev','.tag','.nav a','.nav button','.mobile-menu a','.footer a','.footer p','#clv-a11y-panel h2','#clv-a11y-panel span','#clv-a11y-panel button','#clv-a11y-statement-link'].join(',');
  return [...document.querySelectorAll(selector)].filter(el=>{ const r=el.getBoundingClientRect(), cs=getComputedStyle(el), txt=(el.innerText||el.textContent||'').trim(); return txt&&r.width>2&&r.height>2&&cs.display!=='none'&&cs.visibility!=='hidden'&&r.bottom>0&&r.top<innerHeight; }).map(el=>{ const cs=getComputedStyle(el); const painted=cs.webkitTextFillColor&&cs.webkitTextFillColor!=='rgba(0, 0, 0, 0)'?cs.webkitTextFillColor:cs.color; const fg=parse(painted), bg=bgFor(el); return {text:(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80), selector:el.id?'#'+el.id:(el.className?'.'+String(el.className).replace(/\s+/g,'.'):el.tagName), ratio:fg?contrast(fg,bg):99, color:painted, bg:`rgb(${bg.join(', ')})`}; }).filter(x=>x.ratio<4.5);
}
'''

async def verify_page(page):
    failures=[]
    await page.click('#clv-a11y-reset-all')
    await page.click('#clv-a11y-btn')
    bad=await page.evaluate(JS_AUDIT)
    if bad: failures.append(('base', bad[:8]))
    await page.click('#clv-a11y-btn')
    bad=await page.evaluate(JS_AUDIT)
    if bad: failures.append(('panel-open', bad[:8]))
    for name, selector in [('high-contrast','#clv-contrast'),('links','#clv-links'),('stopAnim','#clv-stopAnim'),('bigCursor','#clv-bigCursor'),('readFont','#clv-readFont')]:
        await page.click('#clv-a11y-reset-all')
        await page.click(selector)
        bad=await page.evaluate(JS_AUDIT)
        if bad: failures.append((name,bad[:8]))
    return failures

async def main():
    all_failures=[]
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True)
        for label, vp in [('mobile', {'width':590,'height':1280,'is_mobile':True,'has_touch':True}), ('desktop', {'width':1440,'height':1100,'is_mobile':False,'has_touch':False})]:
            page=await browser.new_page(viewport={'width':vp['width'],'height':vp['height']}, device_scale_factor=2, is_mobile=vp['is_mobile'], has_touch=vp['has_touch'])
            await page.add_init_script("localStorage.setItem('clarvix-theme','light'); localStorage.removeItem('clarvix_a11y');")
            await page.goto(URL, wait_until='networkidle')
            await page.screenshot(path=str(OUT / f'{label}-light-base-live.png'), full_page=False)
            await page.click('#clv-a11y-btn')
            await page.screenshot(path=str(OUT / f'{label}-panel-open-live.png'), full_page=False)
            for state, selector in [('high-contrast','#clv-contrast'),('links-highlight','#clv-links'),('negative','#clv-negative'),('grayscale','#clv-grayscale'),('stop-animations','#clv-stopAnim'),('big-cursor','#clv-bigCursor'),('readable-font','#clv-readFont')]:
                await page.click('#clv-a11y-reset-all')
                await page.click(selector)
                await page.screenshot(path=str(OUT / f'{label}-{state}-live.png'), full_page=False)
            await page.click('#clv-a11y-reset-all')
            failures=await verify_page(page)
            if failures: all_failures.append((label, failures))
            await page.close()
        await browser.close()
    if all_failures:
        print('LIVE FAILURES')
        for label, failures in all_failures:
            print(label, failures)
        raise SystemExit(1)
    print('Live light widget accessibility smoke passed')
    print(OUT)

asyncio.run(main())
