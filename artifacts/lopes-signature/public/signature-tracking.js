(() => {
  const pixelId = '3195858410596854';
  const active = ['https://lopessignature.com.br', 'https://www.lopessignature.com.br'].includes(location.origin);
  const attribution = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content',
    'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'];
  let lastPath;
  let ready = Promise.resolve();
  let visitorId;

  function pageContext() {
    const url = new URL(location.origin);
    url.pathname = location.pathname;
    const search = new URLSearchParams(location.search);
    for (const key of attribution) {
      const value = search.get(key);
      if (value) url.searchParams.set(key, value.slice(0, 200));
    }
    return {page_url: url.href, page_title: document.title.slice(0, 250)};
  }

  function script(src) {
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = src;
    document.head.append(tag);
    return tag;
  }

  function pageView() {
    const path = location.pathname.replace(/\/$/, '') || '/';
    if (!active || path === lastPath || !window.fbq) return;
    lastPath = path;
    if (/^\/(admin|previa)(\/|$)/.test(path)) return;
    const eventId = crypto.randomUUID();
    const context = pageContext();
    window.fbq('trackSingle', pixelId, 'PageView', {}, {eventID: eventId});
    ready.then(() => fetch('/api/page-view', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...context, event_id: eventId}),
      keepalive: true,
    })).catch(() => {});
  }

  window.SignatureTracking = {
    pageContext,
    pageView,
    lead(eventId) {
      if (active && eventId && window.fbq) {
        window.fbq('trackSingle', pixelId, 'Lead', {}, {eventID: eventId});
        window.dataLayer?.push({event: 'signature_lead_confirmed', event_id: eventId});
      }
    },
  };

  if (!active || /^\/(admin|previa)(\/|$)/.test(location.pathname)) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
  window.fbq = window.fbq || function () {
    if (window.fbq.callMethod) window.fbq.callMethod.apply(window.fbq, arguments);
    else window.fbq.queue.push(arguments);
  };
  window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = window.fbq.queue || [];
  try {
    visitorId = document.cookie.match(/(?:^|;\s*)meta_client_id=([a-f0-9]{64})(?:;|$)/)?.[1];
    if (!visitorId) {
      visitorId = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
      document.cookie = `meta_client_id=${visitorId}; Path=/; Max-Age=7776000; SameSite=Lax; Secure`;
    }
  } catch {}
  window.fbq('set', 'autoConfig', false, pixelId);
  window.fbq('init', pixelId, visitorId ? {external_id: visitorId} : {});
  ready = new Promise(resolve => {
    const pixel = script('https://connect.facebook.net/en_US/fbevents.js');
    const timer = setTimeout(resolve, 1200);
    pixel.addEventListener('load', () => {clearTimeout(timer); resolve();}, {once:true});
  });
  script('https://www.googletagmanager.com/gtm.js?id=GTM-T84Z2V4H');
  pageView();
})();
