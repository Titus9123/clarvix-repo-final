# Modernize All Clarvix Landing Pages Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Bring every public Clarvix HTML page into the new Clarvix landing format while keeping the static background Clarvix icon, accessibility button, and WhatsApp button visible on every page.

**Architecture:** Create one reusable static-page shell pattern based on the renewed landing files from `/tmp/clarvix_landing_review` and apply it consistently across home, service, SEO guide, blog, and legal pages. Keep page-specific SEO metadata and body copy, but standardize global chrome: nav/header, language switcher, background watermark, footer, WhatsApp FAB, accessibility widget, and mobile hamburger behavior.

**Tech Stack:** Static HTML/CSS/JS, existing `style.css`, `blog/blog.css`, `accessibility-widget.js`, local `python3 -m http.server`, Playwright visual/interaction checks.

---

## Current Audit

Repo checked: `/root/work/clarvix-repo-final`

The repo currently has 58 HTML pages. None of the repo pages currently include all required modern markers:

- `brand-watermark`
- modern `nav-toggle` hamburger shell
- `accessibility-widget.js`
- `.wa-fab`

The renewed ZIP in `/tmp/clarvix_landing_review` already has the target pattern for:

- `index.html`
- `es.html`
- `he.html`
- `ar.html`
- `style.css`
- `accessibility-widget.js`

Important: the renewed ZIP is newer than the repo home pages. Use it as the design source, but preserve production-only metadata/scripts from repo where still needed, especially GTM, canonical/hreflang, forms, and existing contact webhook behavior.

---

## Pages Needing Modernization

### Group A — Home landing pages, highest priority

These should be replaced/merged first from the renewed ZIP:

- `index.html`
- `es.html`
- `he.html`
- `ar.html`

Acceptance criteria:

- New dark polished format is present.
- Static Clarvix background icon appears behind content via `brand-watermark`.
- Header CTA is visible on desktop and mobile.
- Mobile hamburger contains language submenu.
- Accessibility and WhatsApp FABs are visible on every language.
- Launch offer says first `10`, not `30`.

### Group B — Core service pages, root legacy files

These use older `nav-inner` / `logo-tag` patterns and need the new shell:

- `digital-presence-audit.html`
- `digital-presence-audit-es.html`
- `digital-presence-audit-he.html`
- `digital-presence-audit-ar.html`
- `ai-revenue-optimization.html`
- `ai-revenue-optimization-es.html`
- `ai-revenue-optimization-he.html`
- `ai-revenue-optimization-ar.html`
- `adtech-ai.html`
- `adtech-ai-es.html`
- `adtech-ai-he.html`
- `adtech-ai-ar.html`
- `lead-engine.html`
- `template.html`

Recommendation:

- Modernize `digital-presence-audit*`, `ai-revenue-optimization*`, and `adtech-ai*` if still public/canonical.
- Review whether `lead-engine.html` and `template.html` should remain public. If they are internal/stale, either modernize minimally or mark `noindex` and remove from public navigation.

### Group C — SEO guide/service pages in folders

These already have useful SEO structure but old chrome. Modernize with a compact service-page shell, not the full home layout.

English root folder pages:

- `revenue-leak-monitoring-israel/index.html`
- `private-clinic-lead-audit-israel/index.html`
- `lead-tracking-audit-israel/index.html`
- `whatsapp-lead-leak-audit-israel/index.html`
- `ga4-conversion-tracking-audit-israel/index.html`
- `google-ads-conversion-leak-audit-israel/index.html`
- `revenue-leak-scan-israel/index.html`
- `clinic-marketing-audit-israel/index.html`
- `ga4-gtm-audit-israel/index.html`
- `google-ads-waste-audit-israel/index.html`
- `adtech-control-tower/index.html`

Spanish folder pages:

- `es/revenue-leak-monitoring-israel/index.html`
- `es/private-clinic-lead-audit-israel/index.html`
- `es/lead-tracking-audit-israel/index.html`
- `es/whatsapp-lead-leak-audit-israel/index.html`
- `es/ga4-conversion-tracking-audit-israel/index.html`
- `es/google-ads-conversion-leak-audit-israel/index.html`

Hebrew folder pages:

- `he/revenue-leak-monitoring-israel/index.html`
- `he/private-clinic-lead-audit-israel/index.html`
- `he/lead-tracking-audit-israel/index.html`
- `he/whatsapp-lead-leak-audit-israel/index.html`
- `he/ga4-conversion-tracking-audit-israel/index.html`
- `he/google-ads-conversion-leak-audit-israel/index.html`

Arabic folder pages:

- `ar/revenue-leak-monitoring-israel/index.html`
- `ar/private-clinic-lead-audit-israel/index.html`
- `ar/lead-tracking-audit-israel/index.html`
- `ar/whatsapp-lead-leak-audit-israel/index.html`
- `ar/ga4-conversion-tracking-audit-israel/index.html`
- `ar/google-ads-conversion-leak-audit-israel/index.html`

Acceptance criteria:

- Keep exact canonical/hreflang metadata.
- Keep page titles/descriptions unless intentionally edited.
- Add modern shell components.
- Keep content focused as SEO landing/guide pages.
- All CTAs route to the correct language home contact section.

### Group D — Blog pages

Blog index and articles use `blog/blog.css` and old `nav-inner` chrome:

- `blog/index.html`
- `blog/en-b2b-lead-generation.html`
- `blog/en-digital-presence-audit.html`
- `blog/es-auditoria-presencia-digital.html`
- `blog/es-generacion-leads-b2b.html`
- `blog/he-digital-audit.html`
- `blog/he-lead-generation.html`
- `blog/ar-digital-audit.html`
- `blog/ar-lead-generation.html`

Acceptance criteria:

- Keep blog card/article content.
- Keep `blog/blog.css` only where needed, but align global nav/footer/FABs/watermark with the new site.
- Add language/RTL handling per article language.
- Add accessibility widget and WhatsApp FAB to every blog page.

### Group E — Legal/accessibility pages

Current legal pages are incomplete in repo:

- `accessibility.html`
- `privacy-policy.html`

The renewed ZIP contains multilingual versions:

- `accessibility-en.html`
- `accessibility-es.html`
- `accessibility.html` / Hebrew
- `accessibility-ar.html`
- `privacy-policy.html`
- `privacy-policy-es.html`
- `privacy-policy-he.html`
- `privacy-policy-ar.html`

Acceptance criteria:

- Add the missing multilingual legal pages from the renewed ZIP.
- Use the modern shell and background watermark.
- Accessibility widget statement link must map by language:
  - EN: `/accessibility-en.html`
  - ES: `/accessibility-es.html`
  - HE: `/accessibility.html`
  - AR: `/accessibility-ar.html`

---

## Global Modern Shell Requirements

Every public HTML page must contain these elements.

### Required head items

- Correct `<html lang="..." dir="...">`
- Existing canonical and hreflang preserved.
- Existing title/description preserved unless the task explicitly changes copy.
- `style.css` loaded with consistent cache-busting version.
- `accessibility-widget.js` loaded with `defer` before `</body>`.

### Required body items

Add immediately after `<body>` / after GTM noscript if present:

```html
<a href="#main" class="skip-link">Skip to main content</a>
<div class="brand-watermark" aria-hidden="true">
  <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" fill="none"
       stroke="#19E3D6" stroke-width="24" stroke-linejoin="miter"
       stroke-miterlimit="10" stroke-linecap="square">
    <path d="M 100 5 L 195 65 L 115 125 L 195 185 L 100 245 L 5 185 L 5 65 Z"/>
  </svg>
</div>
```

Use translated skip-link text on ES/HE/AR pages.

### Required nav behavior

Use the renewed landing nav pattern:

- `.nav` / `.nav-row`
- `.nav-brand` with SVG mark + `CLARVIX`
- `.nav-links` on desktop
- `.lang` on desktop
- header CTA always visible on desktop and mobile
- `.nav-toggle` visible on mobile
- `.mobile-menu` with main links, language submenu, and CTA

### Required floating buttons

Every public page must include:

- WhatsApp FAB `.wa-fab`
- Accessibility widget `accessibility-widget.js`

The WhatsApp and accessibility buttons must:

- Stay fixed and visible.
- Align on the same side:
  - LTR pages: right side.
  - RTL pages: left side.
- Be the same visual size in mobile (`52x52`).
- Accessibility button must show only wheelchair icon visually; any label remains screen-reader-only.

---

## Implementation Tasks

### Task 1: Create a backup branch and baseline audit file

**Objective:** Preserve current production state and save a machine-readable list of pages requiring modernization.

**Files:**

- Create: `docs/audits/2026-05-23-modernization-audit.md`

**Steps:**

1. Run:

```bash
cd /root/work/clarvix-repo-final
git checkout -b chore/modernize-all-public-pages
```

2. Generate/update audit from the page list in this plan.
3. Commit:

```bash
git add docs/audits/2026-05-23-modernization-audit.md
git commit -m "docs: audit Clarvix pages needing modernization"
```

**Verification:**

- `git status --short` only shows expected files before commit.
- Audit lists all 58 HTML pages.

### Task 2: Bring renewed home landing into repo

**Objective:** Apply the already-approved modern home pages and fixed CSS/widget from `/tmp/clarvix_landing_review` to the repo.

**Files:**

- Modify: `index.html`
- Modify: `es.html`
- Modify: `he.html`
- Modify: `ar.html`
- Modify: `style.css`
- Modify: `accessibility-widget.js`
- Add if missing: `accessibility-en.html`, `accessibility-es.html`, `accessibility-ar.html`, privacy policy language files if not present

**Steps:**

1. Compare repo vs renewed ZIP for production-only scripts/forms.
2. Merge renewed files while preserving:
   - GTM `GTM-KQ8MQBNQ` if required.
   - public scan form webhook and fallback mailto.
   - canonical/hreflang.
3. Ensure launch offer says first `10`, not `30`.
4. Commit:

```bash
git add index.html es.html he.html ar.html style.css accessibility-widget.js accessibility*.html privacy-policy*.html
git commit -m "feat: modernize multilingual Clarvix home landing"
```

**Verification:**

Run local preview and Playwright checks on `/`, `/es.html`, `/he.html`, `/ar.html`:

- status 200
- no horizontal overflow at 390px mobile
- no console errors
- header CTA visible in mobile
- hamburger opens and includes language submenu
- accessibility opens and statement link matches language
- WhatsApp and accessibility buttons align

### Task 3: Extract reusable page shell snippets

**Objective:** Avoid manually drifting each page by defining copy-paste source snippets for nav, watermark, WhatsApp, and scripts.

**Files:**

- Create: `docs/snippets/modern-shell.md`

**Steps:**

1. Document exact snippets for:
   - watermark
   - EN/ES/HE/AR nav
   - EN/ES/HE/AR mobile menu
   - WhatsApp FAB
   - script includes
2. Include path rules for nested pages:
   - root pages use `images/...` or `/images/...` consistently.
   - folder pages should use absolute `/images/...`, `/style.css`, `/accessibility-widget.js`.
   - blog pages should use `/style.css` plus `/blog/blog.css` if needed.
3. Commit:

```bash
git add docs/snippets/modern-shell.md
git commit -m "docs: add reusable modern Clarvix shell snippets"
```

**Verification:**

- Snippets include RTL variants.
- Snippets include language-specific accessibility statement URLs.

### Task 4: Modernize SEO guide/service folder pages

**Objective:** Apply modern shell to the 29 folder-based SEO/service pages without rewriting their SEO content.

**Files:**

- Modify all Group C files listed above.

**Steps:**

For each page:

1. Preserve `<title>`, `<meta name="description">`, canonical, hreflang, schema, and main body copy.
2. Replace old `<nav id="navbar"><div class="nav-inner">...` with modern nav for that language.
3. Add watermark immediately after body/GTM noscript.
4. Ensure `<main id="main">` exists or add `id="main"` to existing `<main>`.
5. Add WhatsApp FAB before closing body.
6. Add `<script src="/accessibility-widget.js" defer></script>` before closing body.
7. Commit in batches by language or page type:

```bash
git add revenue-leak-monitoring-israel/ private-clinic-lead-audit-israel/ lead-tracking-audit-israel/ whatsapp-lead-leak-audit-israel/
git commit -m "feat: modernize English SEO guide pages"
```

Repeat for ES/HE/AR.

**Verification:**

- Run marker audit: every Group C page has `brand-watermark`, `nav-toggle`, `.wa-fab`, and `accessibility-widget.js`.
- Playwright sample each language at mobile and desktop.

### Task 5: Modernize root legacy service pages

**Objective:** Convert older standalone service pages to the modern design shell or decide if they should be noindex/internal.

**Files:**

- Group B files listed above.

**Steps:**

1. For each page, decide one of:
   - Keep public and modernize.
   - Convert to redirect/canonical if duplicate.
   - Mark noindex if internal template/stale.
2. For public pages, apply the same shell rules from Task 4.
3. For duplicate service pages, prefer canonical folder pages and add clear links to current service pages.
4. Commit:

```bash
git add digital-presence-audit*.html ai-revenue-optimization*.html adtech-ai*.html lead-engine.html template.html
git commit -m "feat: modernize legacy Clarvix service pages"
```

**Verification:**

- No public page lacks watermark/FAB/widget.
- Duplicate pages have intentional canonical/noindex decisions.

### Task 6: Modernize blog index and blog articles

**Objective:** Keep blog content but align global chrome and floating actions.

**Files:**

- Group D files listed above.
- Possibly modify: `blog/blog.css`

**Steps:**

1. Preserve article content and blog cards.
2. Replace old blog nav with modern nav.
3. Add static watermark.
4. Add WhatsApp FAB.
5. Add accessibility widget.
6. Ensure article pages have correct `lang` and `dir`:
   - EN/ES: `dir="ltr"`
   - HE/AR: `dir="rtl"`
7. Commit:

```bash
git add blog/
git commit -m "feat: modernize Clarvix blog pages"
```

**Verification:**

- Blog index and one article per language render without console errors.
- RTL article pages align correctly.

### Task 7: Modernize legal pages and complete language coverage

**Objective:** Ensure privacy/accessibility pages exist and match the modern shell across languages.

**Files:**

- `accessibility.html`
- `accessibility-en.html`
- `accessibility-es.html`
- `accessibility-ar.html`
- `privacy-policy.html`
- `privacy-policy-es.html`
- `privacy-policy-he.html`
- `privacy-policy-ar.html`

**Steps:**

1. Import missing language pages from renewed ZIP.
2. Apply modern nav/watermark/FAB/widget.
3. Ensure footer links point to correct language legal pages.
4. Commit:

```bash
git add accessibility*.html privacy-policy*.html
git commit -m "feat: modernize multilingual legal pages"
```

**Verification:**

- Accessibility widget statement link routes correctly by language.
- Legal pages themselves also include watermark, WhatsApp, and accessibility FAB.

### Task 8: Add automated static marker audit

**Objective:** Prevent future pages from shipping without required global UI.

**Files:**

- Create: `scripts/audit_modern_shell.py`

**Script behavior:**

- Walk all `*.html` except intentionally excluded files.
- Fail if a public page lacks:
  - `brand-watermark`
  - `nav-toggle`
  - `wa-fab`
  - `accessibility-widget.js`
- Warn if a page has old markers:
  - `nav-inner`
  - `logo-tag`
- Warn if launch copy includes `first 30` / `primeros 30` / Hebrew/Arabic 30 variants.

**Command:**

```bash
python3 scripts/audit_modern_shell.py
```

**Verification:**

- Expected after full modernization: zero failures.

### Task 9: Full visual QA pass

**Objective:** Verify the whole public site is visually consistent and mobile-safe.

**Steps:**

1. Start preview:

```bash
cd /root/work/clarvix-repo-final
python3 -m http.server 8765 --bind 127.0.0.1
```

2. Use Playwright to visit:
   - all home pages
   - all legal pages
   - blog index + one article per language
   - at least one SEO guide per language
   - at least one legacy root service page per language
3. Capture desktop and mobile screenshots.
4. Record:
   - HTTP status
   - console errors
   - horizontal overflow
   - header CTA visibility
   - hamburger opens
   - language submenu exists
   - WhatsApp/a11y alignment

**Verification:**

- No console errors.
- No horizontal overflow on 390px viewport.
- Required global UI present on every page.

### Task 10: Final deployment readiness check

**Objective:** Ensure the repo is ready to publish to Clarvix production.

**Steps:**

1. Run:

```bash
git status --short
python3 scripts/audit_modern_shell.py
```

2. Review diff:

```bash
git diff --stat main...HEAD
git diff --check
```

3. Optional if GitHub Pages deploys from main:

```bash
git log --oneline --max-count=10
```

**Acceptance criteria:**

- Every public page has the modern shell.
- Static Clarvix watermark is visible everywhere.
- Accessibility and WhatsApp buttons are always visible.
- Header CTA remains visible on mobile and desktop.
- All languages preserve RTL/LTR behavior.
- No stale `30 free` copy remains where the offer should say `10`.

---

## Notes / Constraints

- Do not redesign content sections unless needed for consistency. The purpose is global shell modernization, not copy rewrite.
- Do not remove SEO metadata.
- Do not break current URLs.
- Preserve Hebrew/Arabic RTL from the start.
- Keep Spanish polished but only where already present; do not invent missing translations without review.
- If a page is duplicate/stale, make an explicit canonical/noindex decision rather than silently deleting it.
