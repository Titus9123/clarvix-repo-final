import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path('/root/work/clarvix-repo-final')
URL = 'file://' + str((ROOT / 'index.html').resolve())
OUT = ROOT / 'screenshots' / 'a11y-probe'
OUT.mkdir(parents=True, exist_ok=True)

JS_SAMPLE = r'''
(label) => {
  function parse(c){
    if (!c || c === 'transparent') return null;
    const m=c.match(/rgba?\(([^)]+)\)/); if(!m) return null;
    const parts=m[1].split(',').map(x=>parseFloat(x));
    if(parts.length===4 && parts[3]===0) return null;
    return parts.slice(0,3);
  }
  function bgFor(el){
    let n=el;
    while(n && n.nodeType===1){
      const s=getComputedStyle(n); const bg=parse(s.backgroundColor);
      if(bg) return {rgb:bg, selector:n.id?'#'+n.id:(String(n.className||n.tagName).slice(0,60)), raw:s.backgroundColor};
      n=n.parentElement;
    }
    return {rgb:[251,245,232], selector:'body-default', raw:'default'};
  }
  function contrast(fg,bg){
    function L(rgb){let v=rgb.map(c=>{c/=255; return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)}); return .2126*v[0]+.7152*v[1]+.0722*v[2];}
    let a=L(fg), b=L(bg); let hi=Math.max(a,b), lo=Math.min(a,b); return (hi+.05)/(lo+.05);
  }
  const els=[...document.querySelectorAll('h1,h2,h3,p,a,button,span,.eyebrow,.btn,.clv-a11y-label,#clv-a11y-panel button,#clv-a11y-statement-link')]
    .filter(el=>{
      const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
      const txt=(el.innerText||el.textContent||'').trim();
      return txt && r.width>3 && r.height>3 && cs.visibility!=='hidden' && cs.display!=='none' && r.bottom>0 && r.top<window.innerHeight;
    }).slice(0,160);
  return els.map((el,i)=>{
    const cs=getComputedStyle(el); const fg=parse(cs.color); const bg=bgFor(el);
    const rect=el.getBoundingClientRect();
    return {label, i, tag:el.tagName, id:el.id, cls:String(el.className).slice(0,80), text:(el.innerText||el.textContent||'').trim().slice(0,80), color:cs.color, bg:bg.raw, bgSel:bg.selector, ratio:fg?contrast(fg,bg.rgb):null, top:Math.round(rect.top)};
  }).filter(x=>x.ratio!==null).sort((a,b)=>a.ratio-b.ratio).slice(0,30);
}
'''

async def sample(page, label):
    return await page.evaluate(JS_SAMPLE, label)

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width':590,'height':1280}, device_scale_factor=2, is_mobile=True, has_touch=True)
        await page.add_init_script("localStorage.setItem('clarvix-theme','light'); localStorage.removeItem('clarvix_a11y');")
        await page.goto(URL, wait_until='networkidle')
        await page.screenshot(path=str(OUT/'01-light-mobile.png'), full_page=False)
        print('BASE', json.dumps(await sample(page,'base'), ensure_ascii=False, indent=2))
        await page.click('#clv-a11y-btn')
        await page.screenshot(path=str(OUT/'02-panel-open.png'), full_page=False)
        print('PANEL', json.dumps(await sample(page,'panel'), ensure_ascii=False, indent=2))
        for btn,label in [('#clv-contrast','contrast'),('#clv-negative','negative'),('#clv-grayscale','grayscale'),('#clv-links','links'),('#clv-stopAnim','stopAnim'),('#clv-bigCursor','bigCursor'),('#clv-readFont','readFont')]:
            await page.click('#clv-a11y-reset-all')
            await page.click(btn)
            await page.screenshot(path=str(OUT/f'03-{label}.png'), full_page=False)
            print(label.upper(), json.dumps(await sample(page,label), ensure_ascii=False, indent=2))
        await browser.close()

asyncio.run(main())
