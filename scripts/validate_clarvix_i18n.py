#!/usr/bin/env python3
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
import re, sys, urllib.request, hashlib

ROOT = Path('/root/work/clarvix-repo-final')
PAGES = {
    'he': ROOT / 'he.html',
    'es': ROOT / 'es.html',
    'ar': ROOT / 'ar.html',
}
EXPECTED = {
    'he': {'dir': 'rtl', 'must': ['סריקת דליפות הכנסה', 'אימות דליפות הכנסה בסיסי', 'ניטור דליפות הכנסה', 'חמ״ל AdTech']},
    'es': {'dir': 'ltr', 'must': ['Escaneo público de fugas de ingresos', 'Verificación básica de fugas de ingresos', 'Monitor de fugas de ingresos', 'Torre de Control AdTech']},
    'ar': {'dir': 'rtl', 'must': ['فحص عام لتسرب الإيرادات', 'تحقق أساسي من تسرب الإيرادات', 'مراقبة تسرب الإيرادات', 'غرفة تحكم AdTech']},
}
BANNED = [
    'What we do', 'Public Scan', 'Verify Lite', 'Packages', 'Launch offer',
    ' Contact', '>Contact<', 'Services', 'SEO resources', 'Revenue leak resources',
    'Choose the level', 'No grouped shortcuts', 'Revenue Leak Scan intake received',
    'No credentials were submitted', 'Founder Pilot', 'Cohort', 'Apply',
    'Email', 'Secure onboarding', 'Launch spots', 'Credentials to start',
    'Service tiers', 'Every service', 'Revenue Leak Risk', 'Tracking leaks',
    'Lead path leaks', 'Budget leaks', 'Best first upgrade', 'How it works',
    'Start safe', 'Scan without credentials', 'Common questions',
    'Do you need access', 'Will Clarvix change', 'Is this a PPC agency',
    'Do you guarantee', 'Safe start', 'Website URL', 'No private data access',
    'Nothing changes without approval', 'Weekly executive brief', 'Monthly executive summary',
]
SECRET_PATTERNS = [
    r'(?i)access_token', r'(?i)refresh_token', r'(?i)client_secret',
    r'(?i)bearer\s+[a-z0-9._~+/=-]{12,}', r'AIza[0-9A-Za-z_-]{12,}',
    r'sk-[A-Za-z0-9_-]{12,}', r'secret_ref:'
]
ALLOWED_FIELDS = {'tier','market','languages','source','source_language','company','name','website','email'}
ENDPOINT = 'https://n8n.clarvix.net/webhook/clarvix/public-scan-http'

class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.html_attrs = {}
        self.forms = []
        self.inputs = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'html': self.html_attrs = d
        if tag == 'form': self.forms.append(d)
        if tag in {'input','select','textarea'}: self.inputs.append(d)

def visible_text(html: str) -> str:
    html = re.sub(r'<script\b.*?</script>', '', html, flags=re.S|re.I)
    html = re.sub(r'<style\b.*?</style>', '', html, flags=re.S|re.I)
    return html

def check_page(lang: str, html: str, label: str) -> bool:
    ok = True
    parser = P(); parser.feed(html)
    print(f'\n{label}')
    print('lang/dir', parser.html_attrs.get('lang'), parser.html_attrs.get('dir'))
    if parser.html_attrs.get('lang') != lang or parser.html_attrs.get('dir') != EXPECTED[lang]['dir']:
        print('FAIL lang/dir'); ok = False
    text = visible_text(html)
    banned_hits = [b for b in BANNED if b in text]
    print('banned_hits', banned_hits)
    if banned_hits: ok = False
    missing = [m for m in EXPECTED[lang]['must'] if m not in text]
    print('missing_required', missing)
    if missing: ok = False
    print('forms', len(parser.forms), [f.get('action') for f in parser.forms])
    if len(parser.forms) != 1 or parser.forms[0].get('action') != ENDPOINT:
        ok = False
    fields = {i.get('name') for i in parser.inputs if i.get('name')}
    bad_fields = sorted(fields - ALLOWED_FIELDS)
    print('fields', sorted(fields), 'bad_fields', bad_fields)
    if bad_fields: ok = False
    secret_hits=[]
    for pat in SECRET_PATTERNS:
        if re.search(pat, html): secret_hits.append(pat)
    print('secret_hits', secret_hits)
    if secret_hits: ok = False
    return ok

def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else 'local'
    ok = True
    if mode == 'local':
        for lang, path in PAGES.items():
            ok = check_page(lang, path.read_text('utf-8'), str(path)) and ok
    elif mode == 'live':
        urls = {'he':'https://clarvix.net/he.html','es':'https://clarvix.net/es.html','ar':'https://clarvix.net/ar.html'}
        for lang, url in urls.items():
            req = urllib.request.Request(url, headers={'User-Agent':'ClarvixI18nVerify/1.0','Cache-Control':'no-cache'})
            with urllib.request.urlopen(req, timeout=20) as r:
                data = r.read(); html = data.decode('utf-8','replace')
                print('status', r.status, 'sha256', hashlib.sha256(data).hexdigest())
                ok = check_page(lang, html, url) and ok
    else:
        raise SystemExit('usage: validate_clarvix_i18n.py [local|live]')
    return 0 if ok else 1
if __name__ == '__main__':
    raise SystemExit(main())
