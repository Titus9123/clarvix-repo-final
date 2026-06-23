import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'screenshots' / 'light-widget-a11y-local'
OUT.mkdir(parents=True, exist_ok=True)
URL = 'file://' + str((ROOT / 'index.html').resolve())

STATES = [
    ('base', None),
    ('panel-open', None),
    ('high-contrast', '#clv-contrast'),
    ('links-highlight', '#clv-links'),
    ('negative', '#clv-negative'),
    ('grayscale', '#clv-grayscale'),
    ('stop-animations', '#clv-stopAnim'),
    ('big-cursor', '#clv-bigCursor'),
    ('readable-font', '#clv-readFont'),
]

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        for label, viewport in [
            ('mobile', {'width': 590, 'height': 1280, 'is_mobile': True, 'has_touch': True}),
            ('desktop', {'width': 1440, 'height': 1100, 'is_mobile': False, 'has_touch': False}),
        ]:
            page = await browser.new_page(viewport={'width': viewport['width'], 'height': viewport['height']}, device_scale_factor=2, is_mobile=viewport['is_mobile'], has_touch=viewport['has_touch'])
            await page.add_init_script("localStorage.setItem('clarvix-theme','light'); localStorage.removeItem('clarvix_a11y');")
            await page.goto(URL, wait_until='networkidle')
            await page.screenshot(path=str(OUT / f'{label}-light-base.png'), full_page=False)
            await page.click('#clv-a11y-btn')
            await page.screenshot(path=str(OUT / f'{label}-light-panel-open.png'), full_page=False)
            for state, selector in STATES[2:]:
                await page.click('#clv-a11y-reset-all')
                await page.click(selector)
                await page.screenshot(path=str(OUT / f'{label}-{state}.png'), full_page=False)
            await page.close()
        await browser.close()
    print(OUT)

asyncio.run(main())
