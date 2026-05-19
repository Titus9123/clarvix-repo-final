# Cloudflare security headers for clarvix.net

Status: pending Cloudflare API/UI application. No Cloudflare credentials are available in this runtime, so this file is the exact rule spec to apply manually or via API.

## Scope

Apply to hostnames:

- `clarvix.net`
- `www.clarvix.net`

Do not apply this landing CSP to `n8n.clarvix.net`; n8n is handled by Caddy on the VPS.

## Required response headers

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
X-Frame-Options: DENY
```

## CSP recommendation

Start with Report-Only if Cloudflare plan supports it. If no reports/errors appear, promote to enforcing CSP.

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://n8n.clarvix.net; connect-src 'self' https://n8n.clarvix.net https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; frame-src https://www.googletagmanager.com;
```

## Cloudflare dashboard path

1. Open Cloudflare dashboard.
2. Select `clarvix.net` zone.
3. Go to Rules → Transform Rules → Modify Response Header.
4. Create a rule with expression:

```text
(http.host eq "clarvix.net") or (http.host eq "www.clarvix.net")
```

5. Add/set the headers above.
6. Save and deploy.
7. Verify live:

```bash
python3 - <<'PYVERIFY'
import urllib.request
wanted=['strict-transport-security','content-security-policy','x-frame-options','x-content-type-options','referrer-policy','permissions-policy']
for url in ['https://clarvix.net/','https://clarvix.net/he.html','https://clarvix.net/es.html','https://clarvix.net/ar.html']:
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'ClarvixHeaderVerify/1.0'}), timeout=20) as r:
        hdr={k.lower():v for k,v in r.headers.items()}
        print(url, r.status)
        for k in wanted:
            print('  '+k+': '+str(hdr.get(k)))
PYVERIFY
```
