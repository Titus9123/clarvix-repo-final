const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

['index.html', 'es.html', 'he.html', 'ar.html'].forEach((file) => {
  const page = fs.readFileSync(path.join(root, file), 'utf8');
  assert(page.includes('id="themeToggle"'), `${file} must include the theme toggle.`);
  assert(page.includes('class="theme-icon theme-icon-sun"'), `${file} must include the sun icon.`);
  assert(page.includes('class="theme-icon theme-icon-moon"'), `${file} must include the moon icon.`);
  assert(page.includes('class="theme-label"'), `${file} must include a visible theme label for mobile clarity.`);
  assert(page.includes("localStorage.getItem('clarvix-theme')"), `${file} must initialize the persisted theme.`);
  assert(page.includes("localStorage.setItem('clarvix-theme'"), `${file} must persist the selected theme.`);
});

assert(
  html.includes('id="themeToggle"') && html.includes('aria-label="Switch to light mode"'),
  'Desktop nav must include an accessible theme toggle button.'
);
assert(
  html.includes('class="theme-icon theme-icon-sun"') && html.includes('class="theme-icon theme-icon-moon"'),
  'Theme toggle must include both sun and moon icons.'
);
assert(
  html.includes('<meta name="theme-color" content="#04081a"'),
  'Default theme-color meta should stay dark for initial load.'
);
assert(
  css.includes('html[data-theme="light"]') && css.includes('--navy-1:        #fbf5e8'),
  'CSS must define a light-mode variable palette with the approved beige background.'
);
assert(
  css.includes('--teal:          #8b5e34') && css.includes('--watermark-stroke: #9b6f45'),
  'Light mode must use wood accent and wooden watermark color.'
);
assert(
  css.includes('html[data-theme="light"] .theme-icon-sun') && css.includes('html[data-theme="light"] .theme-icon-moon'),
  'CSS must swap sun/moon icons between dark and light modes.'
);
assert(
  js.includes('initThemeToggle') && js.includes('localStorage.setItem(\'clarvix-theme\''),
  'JavaScript must initialize and persist theme selection.'
);
assert(
  js.includes("themeToggle.setAttribute('aria-label', next === 'light' ? 'Switch to dark mode' : 'Switch to light mode')"),
  'Theme toggle aria-label must describe the next action.'
);

console.log('Theme toggle contract passed.');
