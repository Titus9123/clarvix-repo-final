/**
 * Clarvix Accessibility Widget — IS 5568 / WCAG 2.0 AA
 * Open source, zero dependencies, self-contained.
 * Auto-detects page language (he/en/es/ar).
 * Version 1.0 — 2026-04-20
 */
(function () {
  'use strict';

  // ── Language detection ─────────────────────────────────────────────────
  const lang = (document.documentElement.lang || 'he').split('-')[0].toLowerCase();
  const isRTL = (lang === 'he' || lang === 'ar');
  const statementHref = lang === 'en'
    ? '/accessibility-en.html'
    : lang === 'es'
      ? '/accessibility-es.html'
      : lang === 'ar'
        ? '/accessibility-ar.html'
        : '/accessibility.html';

  const T = {
    he: {
      btn:        'נגישות',
      title:      'הגדרות נגישות',
      textSize:   'גודל טקסט',
      decrease:   'הקטן',
      reset:      'איפוס',
      increase:   'הגדל',
      contrast:   'ניגודיות גבוהה',
      negative:   'ניגוד הפוך',
      grayscale:  'גווני אפור',
      links:      'הדגש קישורים',
      stopAnim:   'עצור אנימציות',
      bigCursor:  'סמן גדול',
      readFont:   'גופן קריא',
      resetAll:   'איפוס הכל',
      statement:  'הצהרת נגישות',
      close:      'סגור',
    },
    en: {
      btn:        'Accessibility',
      title:      'Accessibility Settings',
      textSize:   'Text Size',
      decrease:   'Decrease',
      reset:      'Normal',
      increase:   'Increase',
      contrast:   'High Contrast',
      negative:   'Negative Contrast',
      grayscale:  'Grayscale',
      links:      'Highlight Links',
      stopAnim:   'Stop Animations',
      bigCursor:  'Large Cursor',
      readFont:   'Readable Font',
      resetAll:   'Reset All',
      statement:  'Accessibility Statement',
      close:      'Close',
    },
    es: {
      btn:        'Accesibilidad',
      title:      'Ajustes de Accesibilidad',
      textSize:   'Tamaño del Texto',
      decrease:   'Reducir',
      reset:      'Normal',
      increase:   'Aumentar',
      contrast:   'Alto Contraste',
      negative:   'Contraste Negativo',
      grayscale:  'Escala de Grises',
      links:      'Resaltar Enlaces',
      stopAnim:   'Detener Animaciones',
      bigCursor:  'Cursor Grande',
      readFont:   'Fuente Legible',
      resetAll:   'Restablecer',
      statement:  'Declaración de Accesibilidad',
      close:      'Cerrar',
    },
    ar: {
      btn:        'إمكانية الوصول',
      title:      'إعدادات إمكانية الوصول',
      textSize:   'حجم النص',
      decrease:   'تصغير',
      reset:      'عادي',
      increase:   'تكبير',
      contrast:   'تباين عالي',
      negative:   'تباين معكوس',
      grayscale:  'تدرج رمادي',
      links:      'تمييز الروابط',
      stopAnim:   'إيقاف الحركة',
      bigCursor:  'مؤشر كبير',
      readFont:   'خط مقروء',
      resetAll:   'إعادة تعيين',
      statement:  'إعلان إمكانية الوصول',
      close:      'إغلاق',
    },
  };

  const t = T[lang] || T.he;

  // ── State ──────────────────────────────────────────────────────────────
  const STATE_KEY = 'clarvix_a11y';
  const defaultState = {
    fontSize:   0,   // -2 to +4 steps (each step = +2px from base)
    contrast:   false,
    negative:   false,
    grayscale:  false,
    links:      false,
    stopAnim:   false,
    bigCursor:  false,
    readFont:   false,
  };

  function loadState() {
    try {
      return Object.assign({}, defaultState, JSON.parse(localStorage.getItem(STATE_KEY) || '{}'));
    } catch { return Object.assign({}, defaultState); }
  }

  function saveState(s) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch {}
  }

  let state = loadState();

  // ── CSS injection ──────────────────────────────────────────────────────
  const css = `
/* === Clarvix Accessibility Widget === */
#clv-a11y-skip {
  position: absolute;
  top: -9999px; left: -9999px;
  background: #5B3FD4; color: #fff;
  padding: 10px 20px; font-size: 16px; font-weight: bold;
  text-decoration: none; border-radius: 4px; z-index: 99999;
}
#clv-a11y-skip:focus {
  top: 8px; left: 8px;
}

#clv-a11y-btn {
  position: fixed;
  bottom: 170px;
  ${isRTL ? 'right: 18px;' : 'left: 18px;'}
  z-index: 9998;
  background: #5B3FD4;
  color: #fff;
  border: none;
  border-radius: 28px;
  padding: 10px 16px 10px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 3px 14px rgba(91,63,212,0.55);
  transition: transform 0.2s, box-shadow 0.2s;
  line-height: 1;
}
#clv-a11y-btn:hover, #clv-a11y-btn:focus {
  transform: scale(1.07);
  box-shadow: 0 5px 20px rgba(91,63,212,0.75);
  outline: 3px solid #fff;
}
#clv-a11y-btn svg { flex-shrink: 0; }

#clv-a11y-panel {
  position: fixed;
  bottom: 220px;
  ${isRTL ? 'right: 14px;' : 'left: 14px;'}
  width: 270px;
  background: #111827;
  border: 1.5px solid #5B3FD4;
  border-radius: 14px;
  padding: 18px;
  z-index: 9997;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6);
  font-family: inherit;
  direction: ${isRTL ? 'rtl' : 'ltr'};
  display: none;
}
#clv-a11y-panel.open { display: block; }

#clv-a11y-panel h2 {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-align: ${isRTL ? 'right' : 'left'};
  border-bottom: 1px solid #2d3748;
  padding-bottom: 8px;
}

.clv-a11y-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.clv-a11y-label {
  color: #d1d5db;
  font-size: 13px;
}
.clv-a11y-row button {
  background: #1f2937;
  color: #e5e7eb;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: inherit;
}
.clv-a11y-row button:hover,
.clv-a11y-row button:focus {
  background: #374151;
  border-color: #5B3FD4;
  outline: 2px solid #5B3FD4;
}
.clv-a11y-row button.active {
  background: #5B3FD4;
  border-color: #5B3FD4;
  color: #fff;
}

.clv-a11y-size-group {
  display: flex;
  gap: 5px;
}
.clv-a11y-size-group button { flex: 1; }

.clv-a11y-divider {
  height: 1px; background: #2d3748;
  margin: 10px 0;
}

#clv-a11y-reset-all {
  width: 100%;
  background: #374151;
  color: #e5e7eb;
  border: 1px solid #4b5563;
  border-radius: 7px;
  padding: 8px;
  font-size: 13px;
  cursor: pointer;
  margin-top: 4px;
  font-family: inherit;
}
#clv-a11y-reset-all:hover, #clv-a11y-reset-all:focus {
  background: #dc2626; border-color: #dc2626; color: #fff;
  outline: 2px solid #dc2626;
}

#clv-a11y-statement-link {
  display: block;
  text-align: center;
  color: #818cf8;
  font-size: 12px;
  margin-top: 10px;
  text-decoration: underline;
}

/* ── Applied classes ── */
body.clv-high-contrast {
  filter: none !important;
  background: #000 !important;
  color: #ffff00 !important;
}
body.clv-high-contrast *:not(svg):not(path) {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
  color: #ffff00 !important;
  -webkit-text-fill-color: #ffff00 !important;
  border-color: #ffff00 !important;
  text-shadow: none !important;
  box-shadow: none !important;
}
body.clv-high-contrast a,
body.clv-high-contrast a *:not(svg):not(path),
body.clv-high-contrast button,
body.clv-high-contrast button *:not(svg):not(path),
body.clv-high-contrast #themeToggle,
body.clv-high-contrast #themeToggle *:not(svg):not(path) {
  color: #00ffff !important;
  -webkit-text-fill-color: #00ffff !important;
  border-color: #00ffff !important;
}
body.clv-high-contrast .nav-brand,
body.clv-high-contrast .nav-brand .wordmark,
body.clv-high-contrast #themeToggle,
body.clv-high-contrast #themeToggle .theme-label,
body.clv-high-contrast .grad-teal,
body.clv-high-contrast .hero-title,
body.clv-high-contrast h1,
body.clv-high-contrast h2,
body.clv-high-contrast h3,
body.clv-high-contrast p,
body.clv-high-contrast .hero-sub,
body.clv-high-contrast .safe-line,
body.clv-high-contrast .eyebrow,
body.clv-high-contrast .sev,
body.clv-high-contrast .tag {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
  color: #ffff00 !important;
  -webkit-text-fill-color: #ffff00 !important;
  border-color: #ffff00 !important;
}
body.clv-high-contrast svg,
body.clv-high-contrast svg * {
  stroke: #00ffff !important;
  fill: none !important;
}
body.clv-high-contrast img {
  filter: invert(1) brightness(1.5) !important;
}

html:has(body.clv-negative),
body.clv-negative {
  background: #050505 !important;
  background-color: #050505 !important;
}
body.clv-negative > :not(#clv-a11y-btn):not(#clv-a11y-panel):not(.wa-fab) {
  filter: invert(1) hue-rotate(180deg) !important;
}
body.clv-grayscale > :not(#clv-a11y-btn):not(#clv-a11y-panel):not(.wa-fab) {
  filter: grayscale(100%) !important;
}
body.clv-negative.clv-grayscale > :not(#clv-a11y-btn):not(#clv-a11y-panel):not(.wa-fab) {
  filter: invert(1) hue-rotate(180deg) grayscale(100%) !important;
}

body.clv-negative #clv-a11y-btn,
body.clv-negative #clv-a11y-panel,
body.clv-negative .wa-fab,
body.clv-grayscale #clv-a11y-btn,
body.clv-grayscale #clv-a11y-panel,
body.clv-grayscale .wa-fab {
  filter: none !important;
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
  background: #050505 !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  border-color: #fff !important;
}
body.clv-negative #clv-a11y-panel *,
body.clv-negative #clv-a11y-btn *,
body.clv-grayscale #clv-a11y-panel *,
body.clv-grayscale #clv-a11y-btn * {
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}

body.clv-links a {
  color: #003c8f !important;
  -webkit-text-fill-color: #003c8f !important;
  outline: 2px solid #003c8f !important;
  text-decoration: underline !important;
  text-decoration-color: #003c8f !important;
  text-decoration-thickness: 3px !important;
  text-underline-offset: 4px !important;
  background: #fff176 !important;
}
body.clv-links #clv-a11y-panel #clv-a11y-statement-link {
  color: #003c8f !important;
  -webkit-text-fill-color: #003c8f !important;
  background: #fff176 !important;
  background-color: #fff176 !important;
}

body.clv-stop-anim *, body.clv-stop-anim *::before, body.clv-stop-anim *::after {
  animation: none !important;
  transition: none !important;
}

body.clv-big-cursor, body.clv-big-cursor * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='6' cy='6' r='5' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3Cline x1='6' y1='12' x2='6' y2='28' stroke='%23000' stroke-width='3'/%3E%3Cline x1='6' y1='12' x2='20' y2='20' stroke='%23000' stroke-width='3'/%3E%3C/svg%3E") 6 6, auto !important;
}

body.clv-read-font, body.clv-read-font * {
  font-family: Arial, Helvetica, sans-serif !important;
  letter-spacing: 0.03em !important;
  word-spacing: 0.1em !important;
  line-height: 1.6 !important;
}

/* Light-theme specificity bridge: these rules intentionally match the site's
   html[data-theme="light"] selectors so accessibility states always win. */
html[data-theme="light"] body.clv-high-contrast,
html[data-theme="light"] body.clv-high-contrast *:not(svg):not(path) {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
  color: #ffff00 !important;
  -webkit-text-fill-color: #ffff00 !important;
  border-color: #ffff00 !important;
  text-shadow: none !important;
  box-shadow: none !important;
}
html[data-theme="light"] body.clv-high-contrast a,
html[data-theme="light"] body.clv-high-contrast a *:not(svg):not(path),
html[data-theme="light"] body.clv-high-contrast button,
html[data-theme="light"] body.clv-high-contrast button *:not(svg):not(path),
html[data-theme="light"] body.clv-high-contrast #themeToggle,
html[data-theme="light"] body.clv-high-contrast #themeToggle *:not(svg):not(path) {
  color: #00ffff !important;
  -webkit-text-fill-color: #00ffff !important;
  border-color: #00ffff !important;
}
html[data-theme="light"] body.clv-high-contrast .nav-brand,
html[data-theme="light"] body.clv-high-contrast .nav-brand .wordmark,
html[data-theme="light"] body.clv-high-contrast #themeToggle,
html[data-theme="light"] body.clv-high-contrast #themeToggle .theme-label,
html[data-theme="light"] body.clv-high-contrast .grad-teal,
html[data-theme="light"] body.clv-high-contrast .hero-title,
html[data-theme="light"] body.clv-high-contrast h1,
html[data-theme="light"] body.clv-high-contrast h2,
html[data-theme="light"] body.clv-high-contrast h3,
html[data-theme="light"] body.clv-high-contrast p,
html[data-theme="light"] body.clv-high-contrast .hero-sub,
html[data-theme="light"] body.clv-high-contrast .safe-line,
html[data-theme="light"] body.clv-high-contrast .eyebrow,
html[data-theme="light"] body.clv-high-contrast .sev,
html[data-theme="light"] body.clv-high-contrast .tag,
html[data-theme="light"] body.clv-high-contrast .btn,
html[data-theme="light"] body.clv-high-contrast a.btn,
html[data-theme="light"] body.clv-high-contrast .btn-ghost,
html[data-theme="light"] body.clv-high-contrast a.btn-ghost,
html[data-theme="light"] body.clv-high-contrast .hero-actions .btn-ghost,
html[data-theme="light"] body.clv-high-contrast .btn-primary {
  background: #000 !important;
  background-color: #000 !important;
  background-image: none !important;
  color: #ffff00 !important;
  -webkit-text-fill-color: #ffff00 !important;
  border-color: #ffff00 !important;
}
html[data-theme="light"] body.clv-links #clv-a11y-panel #clv-a11y-statement-link,
html[data-theme="light"] body.clv-links a:not(.btn),
html[data-theme="light"] body.clv-links a:not(.btn) *:not(svg):not(path) {
  color: #003c8f !important;
  -webkit-text-fill-color: #003c8f !important;
  background: #fff176 !important;
  background-color: #fff176 !important;
  text-decoration-color: #003c8f !important;
}
html[data-theme="light"] body.clv-links .lang a,
html[data-theme="light"] body.clv-links .lang a.active,
html[data-theme="light"] body.clv-links .mm-lang-group a,
html[data-theme="light"] body.clv-links .mm-lang-group a.active {
  color: #003c8f !important;
  -webkit-text-fill-color: #003c8f !important;
  background: #fff176 !important;
  background-color: #fff176 !important;
  border-color: #003c8f !important;
}
html[data-theme="light"] body.clv-links #themeToggle,
html[data-theme="light"] body.clv-links #themeToggle *:not(svg):not(path) {
  color: #3b2415 !important;
  -webkit-text-fill-color: #3b2415 !important;
  background: #fffdf7 !important;
  background-color: #fffdf7 !important;
}
html[data-theme="light"] body.clv-high-contrast a.btn-ghost,
html[data-theme="light"] body.clv-high-contrast .hero-actions a.btn-ghost {
  background: #000 !important;
  background-color: #000 !important;
  color: #ffff00 !important;
  -webkit-text-fill-color: #ffff00 !important;
  border-color: #ffff00 !important;
}
html[data-theme="light"] body.clv-links .btn,
html[data-theme="light"] body.clv-links .btn *:not(svg):not(path) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #4b2c17 !important;
  background-color: #4b2c17 !important;
}
`;

  const styleEl = document.createElement('style');
  styleEl.id = 'clv-a11y-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Skip to content link ───────────────────────────────────────────────
  const skipLink = document.createElement('a');
  skipLink.id = 'clv-a11y-skip';
  skipLink.href = '#main-content';
  skipLink.textContent = isRTL
    ? (lang === 'ar' ? 'انتقل إلى المحتوى الرئيسي' : 'דלג לתוכן הראשי')
    : (lang === 'es' ? 'Saltar al contenido principal' : 'Skip to main content');
  document.body.insertBefore(skipLink, document.body.firstChild);

  // If no #main-content exists, tag the first <main> or <section>
  if (!document.getElementById('main-content')) {
    const target = document.querySelector('main, [role="main"], .hero, section');
    if (target && !target.id) target.id = 'main-content';
  }

  // ── Build widget HTML ──────────────────────────────────────────────────
  // Button
  const btn = document.createElement('button');
  btn.id = 'clv-a11y-btn';
  btn.setAttribute('aria-label', t.btn);
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'clv-a11y-panel');
  btn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
      <circle cx="12" cy="4" r="2"/>
      <path d="M12 6v6l4 4M12 12l-4 4M8 8H4M20 8h-4M12 18v4"/>
    </svg>
    <span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">${t.btn}</span>`;
  document.body.appendChild(btn);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'clv-a11y-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-label', t.title);
  panel.innerHTML = `
    <h2>${t.title}</h2>

    <div class="clv-a11y-row">
      <span class="clv-a11y-label">${t.textSize}</span>
      <div class="clv-a11y-size-group">
        <button id="clv-fs-dec"  aria-label="${t.decrease}">A−</button>
        <button id="clv-fs-rst"  aria-label="${t.reset}">A</button>
        <button id="clv-fs-inc"  aria-label="${t.increase}">A+</button>
      </div>
    </div>

    <div class="clv-a11y-divider"></div>

    <div class="clv-a11y-row">
      <span class="clv-a11y-label">${t.contrast}</span>
      <button id="clv-contrast" aria-pressed="false">${t.contrast}</button>
    </div>
    <div class="clv-a11y-row">
      <span class="clv-a11y-label">${t.negative}</span>
      <button id="clv-negative" aria-pressed="false">${t.negative}</button>
    </div>
    <div class="clv-a11y-row">
      <span class="clv-a11y-label">${t.grayscale}</span>
      <button id="clv-grayscale" aria-pressed="false">${t.grayscale}</button>
    </div>

    <div class="clv-a11y-divider"></div>

    <div class="clv-a11y-row">
      <span class="clv-a11y-label">${t.links}</span>
      <button id="clv-links" aria-pressed="false">${t.links}</button>
    </div>
    <div class="clv-a11y-row">
      <span class="clv-a11y-label">${t.stopAnim}</span>
      <button id="clv-stopAnim" aria-pressed="false">${t.stopAnim}</button>
    </div>
    <div class="clv-a11y-row">
      <span class="clv-a11y-label">${t.bigCursor}</span>
      <button id="clv-bigCursor" aria-pressed="false">${t.bigCursor}</button>
    </div>
    <div class="clv-a11y-row">
      <span class="clv-a11y-label">${t.readFont}</span>
      <button id="clv-readFont" aria-pressed="false">${t.readFont}</button>
    </div>

    <div class="clv-a11y-divider"></div>

    <button id="clv-a11y-reset-all">${t.resetAll}</button>
    <a id="clv-a11y-statement-link" href="${statementHref}">${t.statement}</a>
  `;
  document.body.appendChild(panel);

  // ── Apply state to DOM ─────────────────────────────────────────────────
  function setImportant(el, prop, value) {
    if (el && el.style) el.style.setProperty(prop, value, 'important');
  }
  function clearInlineA11y() {
    document.querySelectorAll('[data-clv-inline-a11y="1"]').forEach(el => {
      ['background','background-color','background-image','color','-webkit-text-fill-color','border-color','transition'].forEach(prop => el.style.removeProperty(prop));
      el.removeAttribute('data-clv-inline-a11y');
    });
  }
  function applyInlineA11y() {
    clearInlineA11y();
    if (state.contrast) {
      document.querySelectorAll('.btn, a.btn, .btn-ghost, .btn-primary, .nav-brand, .wordmark, #themeToggle').forEach(el => {
        el.setAttribute('data-clv-inline-a11y', '1');
        setImportant(el, 'background-image', 'none');
        setImportant(el, 'background-color', '#000');
        const highContrastText = el.matches('.btn-ghost') ? '#000000' : (el.matches('a, button, #themeToggle, .btn') ? '#00ffff' : '#ffff00');
        setImportant(el, 'color', highContrastText);
        setImportant(el, '-webkit-text-fill-color', highContrastText);
        setImportant(el, 'border-color', '#ffff00');
      });
    } else if (state.links) {
      document.querySelectorAll('#themeToggle').forEach(el => {
        el.setAttribute('data-clv-inline-a11y', '1');
        setImportant(el, 'background-color', '#fffdf7');
        setImportant(el, 'color', '#3b2415');
        setImportant(el, '-webkit-text-fill-color', '#3b2415');
      });
      document.querySelectorAll('.btn, a.btn').forEach(el => {
        el.setAttribute('data-clv-inline-a11y', '1');
        setImportant(el, 'transition', 'none');
        setImportant(el, 'background-image', 'none');
        setImportant(el, 'background', '#4b2c17');
        setImportant(el, 'background-color', '#4b2c17');
        setImportant(el, 'color', '#fff');
        setImportant(el, '-webkit-text-fill-color', '#fff');
        setImportant(el, 'border-color', '#4b2c17');
      });
    }
  }

  function applyState() {
    const body = document.body;

    // Font size — set on <html> element for em-based scaling
    const basePx = 16;
    const step = 2;
    document.documentElement.style.fontSize =
      state.fontSize === 0 ? '' : (basePx + state.fontSize * step) + 'px';

    body.classList.toggle('clv-high-contrast', state.contrast);
    body.classList.toggle('clv-negative',      state.negative);
    body.classList.toggle('clv-grayscale',     state.grayscale);
    body.classList.toggle('clv-links',         state.links);
    body.classList.toggle('clv-stop-anim',     state.stopAnim);
    body.classList.toggle('clv-big-cursor',    state.bigCursor);
    body.classList.toggle('clv-read-font',     state.readFont);

    applyInlineA11y();

    // Update button active states
    ['contrast','negative','grayscale','links','stopAnim','bigCursor','readFont'].forEach(k => {
      const el = document.getElementById('clv-' + k);
      if (el) {
        el.classList.toggle('active', !!state[k]);
        el.setAttribute('aria-pressed', String(!!state[k]));
      }
    });

    // Font size buttons highlight
    const fsInc = document.getElementById('clv-fs-inc');
    const fsDec = document.getElementById('clv-fs-dec');
    const fsRst = document.getElementById('clv-fs-rst');
    if (fsInc) fsInc.classList.toggle('active', state.fontSize > 0);
    if (fsDec) fsDec.classList.toggle('active', state.fontSize < 0);
    if (fsRst) fsRst.classList.toggle('active', state.fontSize === 0);

    saveState(state);
  }

  // ── Toggle panel ───────────────────────────────────────────────────────
  function togglePanel() {
    const isOpen = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      // Focus first interactive element
      const first = panel.querySelector('button, a');
      if (first) first.focus();
    }
  }

  btn.addEventListener('click', togglePanel);

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      togglePanel();
      btn.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && !btn.contains(e.target) && panel.classList.contains('open')) {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // ── Control handlers ───────────────────────────────────────────────────
  document.getElementById('clv-fs-inc').addEventListener('click', () => {
    if (state.fontSize < 4) { state.fontSize++; applyState(); }
  });
  document.getElementById('clv-fs-dec').addEventListener('click', () => {
    if (state.fontSize > -2) { state.fontSize--; applyState(); }
  });
  document.getElementById('clv-fs-rst').addEventListener('click', () => {
    state.fontSize = 0; applyState();
  });

  ['contrast','negative','grayscale','links','stopAnim','bigCursor','readFont'].forEach(k => {
    document.getElementById('clv-' + k).addEventListener('click', () => {
      state[k] = !state[k];
      // Mutually exclusive: contrast + negative can't both be on
      if (k === 'contrast' && state.contrast) state.negative = false;
      if (k === 'negative' && state.negative) state.contrast = false;
      applyState();
    });
  });

  document.getElementById('clv-a11y-reset-all').addEventListener('click', () => {
    state = Object.assign({}, defaultState);
    applyState();
  });

  // ── Apply on load ──────────────────────────────────────────────────────
  applyState();

})();
