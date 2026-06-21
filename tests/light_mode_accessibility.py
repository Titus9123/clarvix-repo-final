from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

def srgb_to_linear(value):
    c = value / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(rgb):
    return 0.2126 * srgb_to_linear(rgb["r"]) + 0.7152 * srgb_to_linear(rgb["g"]) + 0.0722 * srgb_to_linear(rgb["b"])

def contrast_ratio(fg, bg):
    hi, lo = max(luminance(fg), luminance(bg)), min(luminance(fg), luminance(bg))
    return (hi + 0.05) / (lo + 0.05)

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1600})
        page.add_init_script("try { localStorage.setItem('clarvix-theme', 'light'); } catch (err) {}")
        page.goto("file://" + str((ROOT / "index.html").resolve()), wait_until="load")
        page.wait_for_function("document.documentElement.getAttribute('data-theme') === 'light'")
        audit = page.evaluate(r"""
        () => {
          function parseRgb(value) {
            const m = value && value.match(/rgba?\(([^)]+)\)/);
            if (!m) return null;
            const p = m[1].split(',').map((part) => Number.parseFloat(part.trim()));
            return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
          }
          function blend(fg, bg) {
            const a = fg.a ?? 1;
            return { r: Math.round(fg.r * a + bg.r * (1 - a)), g: Math.round(fg.g * a + bg.g * (1 - a)), b: Math.round(fg.b * a + bg.b * (1 - a)), a: 1 };
          }
          function effectiveBg(el) {
            const stack = [];
            for (let n = el; n && n.nodeType === 1; n = n.parentElement) stack.push(n);
            let bg = { r: 251, g: 245, b: 232, a: 1 };
            stack.reverse().forEach((node) => {
              const style = getComputedStyle(node);
              const image = style.backgroundImage;
              const c = parseRgb(style.backgroundColor);
              if (c && c.a > 0) bg = blend(c, bg);
              if (image && image !== 'none') {
                const colors = [...image.matchAll(/rgba?\([^)]+\)/g)].map((m) => parseRgb(m[0])).filter(Boolean);
                colors.forEach((color) => { if ((color.a ?? 1) > 0) bg = blend(color, bg); });
              }
            });
            return bg;
          }
          const selectors = [
            '.nav-brand', '.nav-links a', '.lang a', '.btn-ghost', '.btn-primary',
            '.card', '.card p', '.price-card', '.price-card p', '.eyebrow', '.tag',
            '.sev', 'footer a', '.theme-toggle', 'input', 'textarea', 'label',
          ].join(',');
          return [...document.querySelectorAll(selectors)]
            .filter((el) => {
              const s = getComputedStyle(el); const r = el.getBoundingClientRect();
              return r.width > 1 && r.height > 1 && s.display !== 'none' && s.visibility !== 'hidden';
            })
            .map((el) => {
              const s = getComputedStyle(el);
              return {
                selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.className ? `.${String(el.className).replace(/\s+/g, '.')}` : ''),
                text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
                fg: parseRgb(s.color), bg: effectiveBg(el),
                fontSize: Number.parseFloat(s.fontSize), fontWeight: s.fontWeight,
              };
            });
        }
        """)
        failures = []
        for item in audit:
            if not item["fg"]:
                continue
            ratio = contrast_ratio(item["fg"], item["bg"])
            weight = int(item["fontWeight"]) if str(item["fontWeight"]).isdigit() else 400
            minimum = 3 if item["fontSize"] >= 24 or (item["fontSize"] >= 18.66 and weight >= 700) else 4.5
            if ratio < minimum:
                item["ratio"] = ratio
                failures.append(item)
        if failures:
            details = "\n".join(f"{f['ratio']:.2f} {f['selector']} {f['text']!r} fg={f['fg']} bg={f['bg']}" for f in failures[:80])
            raise AssertionError("Light mode contrast failures:\n" + details)
        page.locator(".nav-links a").first.focus()
        focus_outline = page.locator(".nav-links a").first.evaluate("el => { const s = getComputedStyle(el); return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor }; }")
        if focus_outline["outlineStyle"] == "none" or focus_outline["outlineWidth"] == "0px":
            raise AssertionError("Light mode keyboard focus must be visibly outlined.")
        browser.close()
    print("Light mode accessibility contract passed.")

if __name__ == "__main__":
    main()
