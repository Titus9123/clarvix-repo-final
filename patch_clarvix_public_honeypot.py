from pathlib import Path

FILES = [Path('index.html'), Path('he.html'), Path('es.html'), Path('ar.html')]
HONEYPOT = '          <input type="text" name="company" value="" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;" class="clarvix-honeypot">\n'
BUTTON = '          <button type="submit" class="btn btn-primary btn-full"'
OLD = "      source_language: this.elements.source_language.value\n    };"
NEW = "      source_language: this.elements.source_language.value,\n      company: this.elements.company ? this.elements.company.value.trim() : ''\n    };"
for path in FILES:
    html = path.read_text(encoding='utf-8')
    if 'class="clarvix-honeypot"' not in html:
        html = html.replace(BUTTON, HONEYPOT + BUTTON, 1)
    html = html.replace(OLD, NEW)
    path.write_text(html, encoding='utf-8')
    print(path, 'ok')
