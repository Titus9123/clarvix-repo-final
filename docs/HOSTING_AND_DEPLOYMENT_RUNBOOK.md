# Clarvix hosting and deployment runbook

_Last verified: 2026-05-18 21:55 UTC / 23:55 Europe/Berlin by Hermes Agent._

## Executive summary

Production `https://clarvix.net` is a static site published from the GitHub repository `Titus9123/clarvix-repo-final`, branch `main`, with custom domain `clarvix.net` and Cloudflare in front.

Evidence points to GitHub Pages/static GitHub hosting behind Cloudflare, not Netlify production:

- Local production repo: `/root/work/clarvix-repo-final`.
- Git remote: `git@github.com:Titus9123/clarvix-repo-final.git`.
- Remote HEAD branch: `main`.
- `CNAME` file contains `clarvix.net`.
- DNS nameservers are Cloudflare: `tricia.ns.cloudflare.com`, `vick.ns.cloudflare.com`.
- `clarvix.net` A records observed: `188.114.97.3`, `188.114.96.3`.
- Live response headers include `server: cloudflare`, `x-github-request-id`, `via: 1.1 varnish`, `x-served-by: cache-...`, `x-fastly-request-id`.
- The live `/netlify.toml` file is served as static content, which means Netlify config exists in the repo but is not being interpreted as the active production deploy platform.
- GitHub unauthenticated repo API confirms `Titus9123/clarvix-repo-final`, public, default branch `main`, homepage `http://clarvix.net/`.
- GitHub Pages API returned `404` unauthenticated during this check, so the exact Pages settings/source cannot be proven via API without authenticated access or repo settings UI. Headers and CNAME still strongly indicate GitHub static hosting behind Cloudflare.

## Current repository state observed

Run from `/root/work/clarvix-repo-final`:

```bash
git status --short --branch
git remote -v
git remote show origin
git branch -vv
git --no-pager log --oneline --decorate -8
```

Observed:

```text
## main...origin/main
origin git@github.com:Titus9123/clarvix-repo-final.git (fetch)
origin git@github.com:Titus9123/clarvix-repo-final.git (push)
HEAD branch: main
main ac052b6 [origin/main] Update Clarvix tier packaging for launch
origin/HEAD -> origin/main
```

Latest production-intended commit observed locally and on origin:

```text
commit=ac052b67401e24ad9ff3e04e281f74a091f7803f
short=ac052b6
subject=Update Clarvix tier packaging for launch
author=Hermes Agent <hermes@clarvix.local>
author_date=2026-05-18T21:27:20+02:00
committer_date=2026-05-18T21:27:20+02:00
```

## Build/deploy model

This is a static site. No production build step was identified.

Relevant files:

- `index.html`
- `he.html`
- `es.html`
- `ar.html`
- `style.css`
- `app.js`
- `images/`
- `videos/`
- `CNAME`
- `netlify.toml` (served as static content in current production; useful only if Netlify is later activated)

`package.json` only declares utility dependencies:

```json
{
  "dependencies": {
    "cheerio": "^1.2.0",
    "jsdom": "^28.1.0"
  }
}
```

`netlify.toml` says:

```toml
[build]
  command = "echo 'Static site - no build needed'"
  publish = "."
```

Do not rely on Netlify behavior unless DNS/headers/repo settings later prove Netlify is active. Current live headers indicate Cloudflare -> GitHub/Fastly static origin.

## Cache/CDN behavior observed

Production HTML headers observed with no-cache request headers:

```text
server: cloudflare
cache-control: max-age=600
expires: current_time + 10 minutes
cf-cache-status: DYNAMIC
x-proxy-cache: MISS
x-github-request-id: present
via: 1.1 varnish
x-served-by: cache-fra-...
x-cache: MISS
x-fastly-request-id: present
last-modified: Mon, 18 May 2026 19:29:33 GMT
```

Implications:

- HTML may lag for up to roughly 10 minutes because `cache-control: max-age=600` is served from the origin/CDN path.
- Cloudflare is in front and may add transformations. Example observed: Cloudflare email obfuscation rewrote visible `contact@clarvix.net` into `/cdn-cgi/l/email-protection` markup in live HTML, so raw SHA256 hashes of full HTML may differ from local files even when content is effectively deployed.
- Use marker checks, headers, `last-modified`, and specific content snippets rather than full-file hash equality as the primary production verification.

## Deployment authority and human approval

Safe approval rule:

- Any production deploy/push to `main` requires explicit human approval from Albert in the current session or a pre-approved runbook step.
- Hermes may inspect, test, and prepare local commits when requested.
- Hermes must not change DNS, Cloudflare settings, GitHub Pages settings, Netlify/Vercel settings, secrets, or n8n workflow activation without explicit approval.
- Never paste or request raw GitHub tokens, Cloudflare tokens, API keys, passwords, cookies, or private credentials in chat.

Approver:

- Primary approver: Albert Neumann / Clarvix operator.
- Secondary approver: not defined yet.

## Pre-deploy checks

Run these from the landing repository:

```bash
cd /root/work/clarvix-repo-final && git status --short --branch
```

Expected before a clean deploy:

```text
## main...origin/main
```

Review diff before committing/pushing:

```bash
cd /root/work/clarvix-repo-final && git --no-pager diff -- index.html he.html es.html ar.html style.css app.js scripts/ verify_public_form_ux.js netlify.toml CNAME
```

Check stale and required markers locally:

```bash
cd /root/work/clarvix-repo-final && python3 - <<'PY'
from pathlib import Path
files=['index.html','he.html','es.html','ar.html']
required=['Revenue Leak Scan','Revenue Leak Verify Lite','AdTech Control Tower','secret_ref']
forbidden=['Service 01','Lead Conversion Score','Digital Presence Audit','ביקורת נוכחות דיגיטלית']
for f in files:
    s=Path(f).read_text(errors='replace')
    print('\n',f)
    for m in required:
        print('required',m,s.count(m))
    for m in forbidden:
        print('forbidden',m,s.count(m))
    print('forms',s.lower().count('<form'))
PY
```

Verify public form JavaScript payload without sending a real lead:

```bash
cd /root/work/clarvix-repo-final && node verify_public_form_ux.js
```

If dependencies are missing:

```bash
cd /root/work/clarvix-repo-final && npm install
```

Optional static local preview:

```bash
cd /root/work/clarvix-repo-final && python3 -m http.server 8080
```

Then open/check:

```bash
curl -sS http://127.0.0.1:8080/ | grep -E 'Revenue Leak Scan|AdTech Control Tower|secret_ref' | head
```

## Commit/push/deploy steps

Only after explicit approval:

```bash
cd /root/work/clarvix-repo-final && git add index.html he.html es.html ar.html style.css app.js scripts verify_public_form_ux.js netlify.toml CNAME docs/HOSTING_AND_DEPLOYMENT_RUNBOOK.md && git commit -m "Update Clarvix landing deployment docs" && git push origin main
```

For a docs-only deployment:

```bash
cd /root/work/clarvix-repo-final && git add docs/HOSTING_AND_DEPLOYMENT_RUNBOOK.md && git commit -m "Document Clarvix hosting and deployment" && git push origin main
```

Expected deploy trigger:

- Pushing to `origin/main` updates the static production source.
- There is no identified build command for the landing; publication is expected after GitHub/static host/CDN propagation.

If GitHub auth is unavailable, do not paste tokens into chat. Use normal terminal/browser auth and then run:

```bash
cd /root/work/clarvix-repo-final && git push origin main
```

## Post-deploy production verification

Run marker checks on all live entry pages:

```bash
python3 - <<'PY'
import urllib.request, ssl
urls=['https://clarvix.net/','https://clarvix.net/he.html','https://clarvix.net/es.html','https://clarvix.net/ar.html']
markers=['Revenue Leak Scan','Revenue Leak Verify Lite','AdTech Control Tower','secret_ref','Service 01','Lead Conversion Score','Digital Presence Audit','ביקורת נוכחות דיגיטלית']
ctx=ssl.create_default_context()
for url in urls:
    req=urllib.request.Request(url,headers={'Cache-Control':'no-cache','Pragma':'no-cache','User-Agent':'ClarvixDeployVerifier/1.0'})
    with urllib.request.urlopen(req,timeout=20,context=ctx) as r:
        body=r.read().decode('utf-8','replace')
        print('\nURL',url,'status',r.status,'bytes',len(body),'last-modified',r.headers.get('Last-Modified'),'cache-control',r.headers.get('Cache-Control'))
    for m in markers:
        print(f'  {m}: {body.count(m)}')
    print('  forms:', body.lower().count('<form'))
PY
```

Current expected marker pattern from 2026-05-18 check:

- Required markers present on all four pages: `Revenue Leak Scan`, `Revenue Leak Verify Lite`, `AdTech Control Tower`, `secret_ref`.
- Forbidden stale markers absent on all four pages: `Service 01`, `Lead Conversion Score`, `Digital Presence Audit`, `ביקורת נוכחות דיגיטלית`.
- Each main language page currently has one public scan form.

Check headers/cache:

```bash
for url in https://clarvix.net/ https://clarvix.net/he.html https://clarvix.net/es.html https://clarvix.net/ar.html; do echo "--- $url"; curl -sSIL --max-time 20 -H 'Cache-Control: no-cache' "$url" | sed -n '1,80p'; done
```

Check DNS/provider indicators:

```bash
dig +short clarvix.net A
dig +short clarvix.net NS
curl -sSIL --max-time 20 https://clarvix.net/ | grep -Ei 'server:|x-github-request-id|x-fastly-request-id|x-served-by|cache-control|cf-cache-status|last-modified|via:'
```

## Public scan smoke endpoint checks

The landing posts public-only intake data to:

```text
https://n8n.clarvix.net/webhook/clarvix/public-scan-http
```

Non-destructive CORS/preflight check:

```bash
curl -sSIL --max-time 20 -X OPTIONS \
  -H 'Origin: https://clarvix.net' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type,accept' \
  https://n8n.clarvix.net/webhook/clarvix/public-scan-http
```

Expected observed result:

```text
HTTP/2 204
access-control-allow-origin: https://clarvix.net
access-control-allow-methods: POST, OPTIONS
access-control-allow-headers: content-type, accept
server: Caddy
server: ClarvixPublicGateway/0.1 Python/3.12.13
```

Non-destructive GET check:

```bash
curl -sSIL --max-time 20 -X GET -H 'Origin: https://clarvix.net' https://n8n.clarvix.net/webhook/clarvix/public-scan-http
```

Expected observed result:

```text
HTTP/2 404
access-control-allow-origin: https://clarvix.net
server: Caddy
server: ClarvixPublicGateway/0.1 Python/3.12.13
```

Do not run synthetic POST lead submissions in deployment diagnosis unless the operator approves creating a test lead/audit event.

## Rollback procedure

Preferred rollback is Git-based and explicit.

1. Identify the last known good commit:

```bash
cd /root/work/clarvix-repo-final && git --no-pager log --oneline --decorate -20
```

2. Create a revert commit for the bad deployment:

```bash
cd /root/work/clarvix-repo-final && git revert <bad_commit_sha>
```

3. Review the revert diff:

```bash
cd /root/work/clarvix-repo-final && git --no-pager show --stat --oneline HEAD && git --no-pager diff HEAD~1..HEAD
```

4. Push after approval:

```bash
cd /root/work/clarvix-repo-final && git push origin main
```

5. Verify live production with the post-deploy verification commands above.

Emergency rollback if multiple commits need reverting:

```bash
cd /root/work/clarvix-repo-final && git revert --no-commit <oldest_bad_commit>^..<newest_bad_commit> && git commit -m "Rollback Clarvix landing to last known good state" && git push origin main
```

Avoid `git reset --hard` + force-push on `main` unless Albert explicitly approves history rewrite and all collaborators are aware.

## Cache/CDN troubleshooting

If production does not immediately show the new content after push:

1. Confirm remote branch received the commit:

```bash
cd /root/work/clarvix-repo-final && git fetch origin main && git rev-parse HEAD && git rev-parse origin/main
```

2. Check live headers and `last-modified`:

```bash
curl -sSIL --max-time 20 -H 'Cache-Control: no-cache' https://clarvix.net/ | grep -Ei 'date:|last-modified:|cache-control:|age:|cf-cache-status:|x-cache:|x-github-request-id|x-fastly-request-id|server:'
```

3. Retry marker verification for up to 10-15 minutes because HTML currently advertises `max-age=600`.

4. Compare markers rather than full HTML hash because Cloudflare can rewrite emails to `/cdn-cgi/l/email-protection`.

5. If stale after 15 minutes:
   - Check GitHub repository Pages/settings UI for the active source branch/path.
   - Check Cloudflare caching/page rules for `clarvix.net`.
   - Purge Cloudflare cache only with explicit operator approval.
   - Do not change DNS or Pages settings without approval.

## Production verification snapshot from Phase 10

Commands executed were non-destructive: git status/log/remotes, DNS/header checks, marker checks, and OPTIONS/GET endpoint checks. No DNS/settings/deploy/push/n8n import/workflow activation was performed.

Live marker counts observed:

- `https://clarvix.net/`: `Revenue Leak Scan=11`, `Revenue Leak Verify Lite=3`, `AdTech Control Tower=6`, `secret_ref=12`, stale markers all `0`, forms `1`.
- `https://clarvix.net/he.html`: `Revenue Leak Scan=8`, `Revenue Leak Verify Lite=2`, `AdTech Control Tower=6`, `secret_ref=14`, stale markers all `0`, forms `1`.
- `https://clarvix.net/es.html`: `Revenue Leak Scan=10`, `Revenue Leak Verify Lite=2`, `AdTech Control Tower=8`, `secret_ref=15`, stale markers all `0`, forms `1`.
- `https://clarvix.net/ar.html`: `Revenue Leak Scan=10`, `Revenue Leak Verify Lite=2`, `AdTech Control Tower=6`, `secret_ref=15`, stale markers all `0`, forms `1`.

Endpoint smoke observed:

- `OPTIONS https://n8n.clarvix.net/webhook/clarvix/public-scan-http` returned `HTTP/2 204` with CORS for `https://clarvix.net`.
- `GET https://n8n.clarvix.net/webhook/clarvix/public-scan-http` returned `HTTP/2 404`, expected because the webhook is POST/OPTIONS-oriented.

## Known unknowns / pending confirmations

- Authenticated GitHub Pages settings are not yet documented. The unauthenticated Pages API returned `404`; inspect the repository settings UI or authenticated API when available.
- Cloudflare account rules/cache settings are not documented. Current headers prove Cloudflare is fronting the site, but not the exact dashboard configuration.
- Exact propagation time after a future push should be measured on the next approved deploy. Current headers imply up to about 10 minutes for HTML cache, and prior deployment was visible with `last-modified: Mon, 18 May 2026 19:29:33 GMT`.
- Secondary deploy approver is not defined.
