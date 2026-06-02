(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-P4R22F19B8';
  var ASSET_PATHS = [
    '/asset-lab/',
    '/aistackcost/',
    '/budgetreset/',
    '/mealplansheet/',
    '/movebudget/',
    '/habitgrid/'
  ];
  var ALLOWED_EVENTS = {
    asset_view: true,
    calculator_start: true,
    calculator_complete: true,
    generator_start: true,
    generator_complete: true,
    download_click: true,
    print_click: true,
    result_copy: true,
    cta_click: true,
    support_page_click: true,
    buy_click: true,
    tool_add: true,
    language_change: true,
    checklist_toggle: true,
    habit_toggle: true,
    month_change: true
  };

  function isAssetPath() {
    return ASSET_PATHS.some(function (path) {
      return window.location.pathname.indexOf(path) === 0;
    });
  }

  if (!isAssetPath()) return;

  window.dataLayer = window.dataLayer || [];

  function getAssetId(payload) {
    return (payload && payload.asset_id) ||
      (document.body && document.body.getAttribute('data-asset-id')) ||
      window.location.pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '_').toLowerCase() ||
      'asset_lab_unknown';
  }

  function cleanValue(value) {
    if (value == null) return value;
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    return String(value).slice(0, 120);
  }

  function normalizeEvent(payload) {
    var eventName = payload && payload.event;
    if (!eventName || !ALLOWED_EVENTS[eventName]) return null;
    var params = {
      asset_id: getAssetId(payload),
      page_path: window.location.pathname,
      page_title: document.title
    };
    Object.keys(payload).forEach(function (key) {
      if (key === 'event') return;
      if (/email|phone|name|password|token|secret/i.test(key)) return;
      params[key] = cleanValue(payload[key]);
    });
    return { name: eventName, params: params };
  }

  function sendToGa4(payload) {
    var eventData = normalizeEvent(payload);
    if (!eventData) return;
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
    window.gtag('event', eventData.name, eventData.params);
  }

  var originalPush = window.dataLayer.push;
  if (!window.__clarvixAssetLabMeasurementInstalled) {
    window.__clarvixAssetLabMeasurementInstalled = true;
    window.dataLayer.push = function () {
      for (var i = 0; i < arguments.length; i += 1) {
        var item = arguments[i];
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          sendToGa4(item);
        }
      }
      return originalPush.apply(window.dataLayer, arguments);
    };
    window.dataLayer.forEach(function (item) {
      if (item && typeof item === 'object' && !Array.isArray(item)) sendToGa4(item);
    });
  }

  function emit(eventName, params) {
    window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
  }

  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('a,button,[role="button"],input,select,textarea') : null;
    if (!target) return;

    var assetId = getAssetId({});
    var href = target.getAttribute('href') || '';
    var id = target.id || '';
    var label = (target.getAttribute('aria-label') || target.textContent || target.value || '').trim().slice(0, 80);
    var lower = (id + ' ' + label + ' ' + href).toLowerCase();

    if (target.matches('[data-event]')) return;

    if (/copy/.test(lower)) emit('result_copy', { asset_id: assetId, element_id: id, label: label });
    else if (/download|csv|export/.test(lower)) emit('download_click', { asset_id: assetId, element_id: id, label: label, href: href });
    else if (/print|pdf/.test(lower)) emit('print_click', { asset_id: assetId, element_id: id, label: label });
    else if (/recommend|calculate|generate|plan|reset|start/.test(lower)) emit('calculator_start', { asset_id: assetId, element_id: id, label: label });
    else if (href && (/asset-lab|contact|mailto|pricing|checkout|buy|open|guide/.test(lower))) emit('cta_click', { asset_id: assetId, element_id: id, label: label, href: href });
  }, true);

  window.addEventListener('beforeprint', function () {
    emit('print_click', { asset_id: getAssetId({}), source: 'beforeprint' });
  });

  window.clarvixAssetLabTrack = emit;
}());
